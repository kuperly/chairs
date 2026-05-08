'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ViewerVideoProps {
  channelName: string;
  viewerCount?: number;
}

export function ViewerVideo({ channelName, viewerCount = 0 }: ViewerVideoProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  const videoContainerRef = useRef<HTMLDivElement>(null);

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

      // Join channel
      await agoraClient.join(appId, channelName, token, uid);
      setIsJoined(true);
      console.log('Successfully joined channel as viewer:', channelName);
    } catch (err) {
      console.error('Error joining channel:', err);
      setError(err instanceof Error ? err.message : 'Failed to join stream');
    } finally {
      setIsLoading(false);
    }
  };

  const leaveChannel = async (agoraClient: IAgoraRTCClient) => {
    await agoraClient.leave();
    setIsJoined(false);
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
            <p className="text-white text-xl font-bold">Waiting for broadcast to start...</p>
            <Badge className="bg-yellow-600 text-white text-lg px-6 py-2">
              Standby
            </Badge>
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
