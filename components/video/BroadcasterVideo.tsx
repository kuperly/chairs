'use client';

import { useEffect, useRef, useState } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Loader2 } from 'lucide-react';

interface BroadcasterVideoProps {
  channelName: string;
  eventId: string;
}

export function BroadcasterVideo({ channelName, eventId }: BroadcasterVideoProps) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Agora client
    const agoraClient = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
    agoraClient.setClientRole('host');
    setClient(agoraClient);

    let audioTrack: IMicrophoneAudioTrack | null = null;
    let videoTrack: ICameraVideoTrack | null = null;

    // Auto-start broadcasting when component mounts
    // This ensures broadcast continues after page reload
    const initBroadcast = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get token from API
        const response = await fetch('/api/agora/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelName,
            role: 'publisher',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get Agora token');
        }

        const { token, uid, appId } = await response.json();

        // Join channel
        await agoraClient.join(appId, channelName, token, uid);

        // Create local tracks
        [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);

        // Play local video
        if (videoContainerRef.current) {
          videoTrack.play(videoContainerRef.current);
        }

        // Publish tracks
        await agoraClient.publish([audioTrack, videoTrack]);

        setIsJoined(true);
        console.log('Auto-started broadcast on channel:', channelName);
      } catch (err) {
        console.error('Error auto-starting broadcast:', err);
        setError(err instanceof Error ? err.message : 'Failed to start broadcast');
      } finally {
        setIsLoading(false);
      }
    };

    initBroadcast();

    return () => {
      const cleanup = async () => {
        if (audioTrack) {
          audioTrack.stop();
          audioTrack.close();
        }
        if (videoTrack) {
          videoTrack.stop();
          videoTrack.close();
        }
        if (agoraClient) {
          await agoraClient.leave();
        }
      };
      cleanup();
    };
  }, [channelName]);

  const retryBroadcast = async () => {
    if (!client) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get token from API
      const response = await fetch('/api/agora/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelName,
          role: 'publisher',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get Agora token');
      }

      const { token, uid, appId } = await response.json();

      // Join channel
      await client.join(appId, channelName, token, uid);

      // Create local tracks
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

      setLocalAudioTrack(audioTrack);
      setLocalVideoTrack(videoTrack);

      // Play local video
      if (videoContainerRef.current) {
        videoTrack.play(videoContainerRef.current);
      }

      // Publish tracks
      await client.publish([audioTrack, videoTrack]);

      setIsJoined(true);
      console.log('Successfully retried broadcast on channel:', channelName);
    } catch (err) {
      console.error('Error retrying broadcast:', err);
      setError(err instanceof Error ? err.message : 'Failed to start broadcast');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMute = () => {
    if (localAudioTrack) {
      localAudioTrack.setEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localVideoTrack) {
      localVideoTrack.setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="space-y-4">
      {/* Video Container */}
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <div ref={videoContainerRef} className="w-full h-full" />

        {!isJoined && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-black">
            <div className="text-center space-y-4">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <p className="text-white text-xl font-bold">Starting Broadcast...</p>
            </div>
          </div>
        )}

        {!isJoined && !isLoading && error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/20 to-black">
            <div className="text-center space-y-4 px-4">
              <div className="text-6xl">⚠️</div>
              <p className="text-white text-xl font-bold">Broadcast Error</p>
              <p className="text-red-400 text-sm">{error}</p>
              <Button
                onClick={retryBroadcast}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                🔴 Retry Broadcast
              </Button>
            </div>
          </div>
        )}

        {isJoined && (
          <div className="absolute top-4 right-4">
            <div className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full animate-ping" />
              <span className="font-bold">LIVE</span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      {isJoined && (
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleMute}
            variant={isMuted ? 'destructive' : 'outline'}
            size="lg"
            className="font-bold"
          >
            {isMuted ? <MicOff className="mr-2 h-5 w-5" /> : <Mic className="mr-2 h-5 w-5" />}
            {isMuted ? 'Unmute' : 'Mute'}
          </Button>

          <Button
            onClick={toggleVideo}
            variant={isVideoOff ? 'destructive' : 'outline'}
            size="lg"
            className="font-bold"
          >
            {isVideoOff ? <VideoOff className="mr-2 h-5 w-5" /> : <Video className="mr-2 h-5 w-5" />}
            {isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
          </Button>
        </div>
      )}
    </div>
  );
}
