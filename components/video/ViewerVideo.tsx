'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useViewerCount } from '@/hooks/useViewerTracking';
import { createClient } from '@/utils/supabase/client';

interface ViewerVideoProps {
  channelName: string;
  eventId: string;
}

export function ViewerVideo({ channelName, eventId }: ViewerVideoProps) {
  const viewerCount = useViewerCount(eventId);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);
  const [hasJoinedAgora, setHasJoinedAgora] = useState(false);

  const videoContainerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Initialize Agora client
    const agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    agoraClient.setClientRole('audience');
    setClient(agoraClient);

    joinChannel(agoraClient);

    return () => {
      leaveChannel(agoraClient);
    };
  }, [channelName]);

  const joinChannel = async (agoraClient: IAgoraRTCClient) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get token from API
      const response = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          role: 'subscriber',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Agora token');
      }

      const { token, uid, appId } = await response.json();

      // Listen for remote users
      agoraClient.on('user-published', async (user, mediaType) => {
        await agoraClient.subscribe(user, mediaType);

        if (mediaType === 'video') {
          setRemoteUsers((prev) => {
            const exists = prev.find((u) => u.uid === user.uid);
            if (exists) return prev;
            return [...prev, user];
          });

          // Play remote video
          if (videoContainerRef.current) {
            user.videoTrack?.play(videoContainerRef.current);
          }
        }

        if (mediaType === 'audio') {
          user.audioTrack?.play();
        }
      });

      agoraClient.on('user-unpublished', (user) => {
        setRemoteUsers((prev) => prev.filter((u) => u.uid !== user.uid));
      });

      // Handle connection state changes (e.g., disconnections)
      agoraClient.on('connection-state-change', async (curState, prevState, reason) => {
        console.log('Agora connection state changed:', { curState, prevState, reason });

        // If we disconnect and previously joined, decrement count
        if (curState === 'DISCONNECTED' && hasJoinedAgora) {
          try {
            await supabase.rpc('decrement_viewer_count', {
              event_id: eventId,
            });
            setHasJoinedAgora(false);
            console.log('Decremented viewer count due to disconnection');
          } catch (err) {
            console.error('Error decrementing viewer count on disconnect:', err);
          }
        }
      });

      // Join channel
      await agoraClient.join(appId, channelName, token, uid);
      setIsJoined(true);
      console.log('Successfully joined channel as viewer:', channelName);

      // Increment viewer count after successfully joining Agora
      try {
        const { data, error } = await supabase.rpc('increment_viewer_count', {
          event_id: eventId,
        });

        if (error) {
          console.error('Failed to increment viewer count:', error);
        } else {
          setHasJoinedAgora(true);
          console.log('Incremented viewer count to:', data);
        }
      } catch (err) {
        console.error('Error incrementing viewer count:', err);
      }
    } catch (err) {
      console.error('Error joining channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to join stream');
    } finally {
      setIsLoading(false);
    }
  };

  const leaveChannel = async (agoraClient: IAgoraRTCClient) => {
    // Decrement viewer count if we successfully joined Agora before
    if (hasJoinedAgora) {
      try {
        const { data, error } = await supabase.rpc('decrement_viewer_count', {
          event_id: eventId,
        });

        if (error) {
          console.error('Failed to decrement viewer count:', error);
        } else {
          console.log('Decremented viewer count to:', data);
        }
      } catch (err) {
        console.error('Error decrementing viewer count:', err);
      }
    }

    await agoraClient.leave();
    setIsJoined(false);
    setHasJoinedAgora(false);
  };

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden border-2 border-primary/30">
      {/* Video Container */}
      <div ref={videoContainerRef} className="w-full h-full" />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
            <p className="text-white text-lg">Connecting to live stream...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/20 to-black">
          <div className="text-center space-y-4 px-4">
            <div className="text-6xl">⚠️</div>
            <p className="text-white text-xl font-bold">Connection Error</p>
            <p className="text-white/70">{error}</p>
          </div>
        </div>
      )}

      {/* No Stream State */}
      {!isLoading && !error && remoteUsers.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-black">
          <div className="text-center space-y-4">
            <div className="text-6xl">📹</div>
            <p className="text-white text-xl font-bold">
              {isJoined ? 'Waiting for broadcast to start...' : 'Connecting to stream...'}
            </p>
            <Badge className="bg-yellow-600 text-white text-lg px-6 py-2">
              {isJoined ? 'Standby' : 'Connecting'}
            </Badge>
            {isJoined && (
              <p className="text-white/70 text-sm max-w-md">
                The broadcaster hasn't started streaming yet. Please wait or check back in a moment.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Viewer Count Overlay */}
      <div className="absolute top-4 left-4">
        <Badge className="bg-black/80 text-white backdrop-blur-sm px-3 py-1.5">
          👥 {viewerCount.toLocaleString()} watching
        </Badge>
      </div>

      {/* Live Indicator */}
      {remoteUsers.length > 0 && (
        <div className="absolute top-4 right-4">
          <Badge className="bg-red-600 text-white animate-pulse px-3 py-1.5">
            🔴 LIVE
          </Badge>
        </div>
      )}
    </div>
  );
}
