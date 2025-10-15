// ElevenLabsAudioNative.tsx
'use client';
import { useEffect } from 'react';

export type ElevenLabsProps = {
  publicUserId: string;
  projectId?: string;
};

export const ElevenLabsAudioNative = ({
  publicUserId,
  projectId,
}: ElevenLabsProps) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/player/audioNativeHelper.js';
    script.async = true;
    script.type = 'text/javascript';
    document.body.appendChild(script);

    return () => {
      // Clean up script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      id="elevenlabs-audionative-widget"
      data-height="90"
      data-width="100%"
      data-frameborder="no"
      data-scrolling="no"
      data-publicuserid={publicUserId}
      data-playerurl="https://elevenlabs.io/player/index.html"
      {...(projectId ? { 'data-projectid': projectId } : {})}
    >
      Loading the{' '}
      <a
        href="https://elevenlabs.io/text-to-speech"
        target="_blank"
        rel="noopener"
      >
        Elevenlabs Text to Speech
      </a>{' '}
      AudioNative Player...
    </div>
  );
};

export default ElevenLabsAudioNative;
