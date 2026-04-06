import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { usePlayerStore } from '../store/usePlayerStore';

export const useHowlerPlayer = () => {
  const {
    currentTrack,
    sourceType,
    isPlaying,
    volume,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setHowlerInstance,
    playNext,
  } = usePlayerStore();

  const howlRef    = useRef(null);
  const intervalRef = useRef(null);

  // When uploaded track changes — create new Howl
  useEffect(() => {
    if (sourceType !== 'upload' || !currentTrack?.fileUrl) {
      // Stop Howler if source switched to YouTube
      if (howlRef.current) {
        howlRef.current.unload();
        howlRef.current = null;
        setHowlerInstance(null);
      }
      clearInterval(intervalRef.current);
      return;
    }

    // Destroy previous
    if (howlRef.current) howlRef.current.unload();
    clearInterval(intervalRef.current);

    const sound = new Howl({
      src     : [currentTrack.fileUrl],
      html5   : true,
      volume  : volume,
      onplay  : () => {
        setIsPlaying(true);
        setDuration(sound.duration());
        intervalRef.current = setInterval(() => {
          setCurrentTime(sound.seek() || 0);
        }, 500);
      },
      onpause : () => {
        setIsPlaying(false);
        clearInterval(intervalRef.current);
      },
      onstop  : () => {
        setIsPlaying(false);
        clearInterval(intervalRef.current);
      },
      onend   : () => {
        setIsPlaying(false);
        clearInterval(intervalRef.current);
        playNext();
      },
      onloaderror: (_, err) => {
        console.error('Howler load error:', err);
      },
    });

    howlRef.current = sound;
    setHowlerInstance(sound);
    sound.play();

    return () => {
      clearInterval(intervalRef.current);
      if (howlRef.current) howlRef.current.unload();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id, currentTrack?.fileUrl, sourceType]);

  // Sync play/pause state
  useEffect(() => {
    if (!howlRef.current || sourceType !== 'upload') return;
    if (isPlaying) howlRef.current.play();
    else           howlRef.current.pause();
  }, [isPlaying, sourceType]);

  // Sync volume
  useEffect(() => {
    if (howlRef.current) howlRef.current.volume(volume);
  }, [volume]);
};