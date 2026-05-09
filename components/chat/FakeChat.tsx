/**
 * Fake Chat Component
 * For homepage - shows static/animated messages to create atmosphere
 * NOT interactive - just for visual effect
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface FakeMessage {
  id: number;
  user: string;
  message: string;
  avatar?: string;
}

const FAKE_MESSAGES: FakeMessage[] = [
  { id: 1, user: 'Sarah M.', message: 'Love these chairs! 😍' },
  { id: 2, user: 'David K.', message: 'How long is the sale?' },
  { id: 3, user: 'Emma R.', message: 'Just ordered 2! Amazing deal!' },
  { id: 4, user: 'Michael T.', message: 'Do you ship to Tel Aviv?' },
  { id: 5, user: 'Lisa B.', message: '🔥 This is amazing!' },
  { id: 6, user: 'Alex W.', message: 'Best prices I've seen!' },
  { id: 7, user: 'Rachel S.', message: 'Can't wait for mine to arrive!' },
  { id: 8, user: 'Tom H.', message: 'Just added to cart!' },
];

export function FakeChat() {
  const [visibleMessages, setVisibleMessages] = useState<FakeMessage[]>([]);
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Show first 3 messages immediately
    setVisibleMessages(FAKE_MESSAGES.slice(0, 3));
    setMessageIndex(3);

    // Add new message every 5 seconds
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        const next = (prev + 1) % FAKE_MESSAGES.length;
        setVisibleMessages((messages) => {
          const newMessages = [...messages, FAKE_MESSAGES[next]];
          // Keep only last 5 messages
          return newMessages.slice(-5);
        });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4 h-[400px] flex flex-col">
      {/* Header */}
      <div className="border-b border-border pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="font-semibold text-foreground">Live Chat</h3>
          <span className="text-sm text-muted-foreground ml-auto">
            {visibleMessages.length} viewers
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
        {visibleMessages.map((msg) => (
          <div
            key={`${msg.id}-${Math.random()}`}
            className="flex gap-2 animate-in slide-in-from-bottom-4 duration-300"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
              {msg.user.charAt(0)}
            </div>

            {/* Message */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-sm text-foreground">
                  {msg.user}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {msg.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer (disabled input) */}
      <div className="border-t border-border pt-3 mt-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Join the live event to chat..."
            disabled
            className="w-full px-4 py-2 pr-12 rounded-lg border border-border bg-muted text-muted-foreground cursor-not-allowed"
          />
          <button
            disabled
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-muted text-muted-foreground rounded cursor-not-allowed"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Chat available during live events
        </p>
      </div>
    </Card>
  );
}
