/**
 * Live Chat Component
 * For live event pages - REAL interactive chat using Supabase Realtime
 * Users can send and receive messages in real-time
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  event_id: string;
  user_id: string;
  user_name: string;
  message: string;
  created_at: string;
}

interface LiveChatProps {
  eventId: string;
  className?: string;
}

export function LiveChat({ eventId, className = '' }: LiveChatProps) {
  const { isAuthenticated } = useAuth();
  const { user } = useCurrentUser();
  const supabase = createClient();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [eventId]);

  // Subscribe to new messages
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })
        .limit(100); // Last 100 messages

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !isAuthenticated || !user) {
      return;
    }

    setIsSending(true);

    try {
      const { error } = await supabase.from('chat_messages').insert({
        event_id: eventId,
        user_id: user.id,
        user_name: user.fullName || user.email?.split('@')[0] || 'Anonymous',
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className={`flex flex-col ${className}`}>
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-foreground">Live Chat</h3>
          <span className="text-sm text-muted-foreground ml-auto">
            {messages.length} messages
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Be the first to say something!
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwnMessage = user?.id === msg.user_id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${
                    isOwnMessage ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
                      {msg.user_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] ${
                      isOwnMessage ? 'order-first' : ''
                    }`}
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span
                        className={`font-medium text-sm ${
                          isOwnMessage ? 'text-primary' : 'text-foreground'
                        }`}
                      >
                        {isOwnMessage ? 'You' : msg.user_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                  </div>

                  {isOwnMessage && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                      {msg.user_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        {isAuthenticated ? (
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSending}
              maxLength={500}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={isSending || !newMessage.trim()}
              size="icon"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Please login to chat
            </p>
            <Button variant="outline" size="sm" onClick={() => (window.location.href = '/login')}>
              Login
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
