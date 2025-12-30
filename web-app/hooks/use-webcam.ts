import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  // Fungsi untuk mengaktifkan kamera
  const startWebcam = useCallback(async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  // Fungsi untuk menghentikan aliran kamera
  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsVideoReady(false);
    }
  }, [stream]);

  // Handler saat metadata video berhasil dimuat
  const onVideoLoaded = useCallback(() => {
    setIsVideoReady(true);
  }, []);

  // Cleanup saat komponen di-unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, [stopWebcam]);

  return { videoRef, startWebcam, stopWebcam, error, isVideoReady, onVideoLoaded };
}