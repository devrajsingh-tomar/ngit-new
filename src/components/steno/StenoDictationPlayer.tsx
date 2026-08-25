"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, Keyboard, Info, Volume2, RotateCcw } from "lucide-react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return match[2];
  }
  return null;
}

export function getGoogleDriveStreamUrl(url?: string): string | null {
  if (!url) return null;
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    const match = url.match(/(?:file\/d\/|id=)([\w-]+)/);
    if (match && match[1]) {
      return `https://docs.google.com/uc?export=open&id=${match[1]}`;
    }
  }
  return null;
}

interface StenoDictationPlayerProps {
  passage: any;
  onStartTranscription: () => void;
}

export default function StenoDictationPlayer({ passage, onStartTranscription }: StenoDictationPlayerProps) {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const containerIdRef = useRef<string>(`yt-player-${Math.random().toString(36).substr(2, 9)}`);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [targetWpm, setTargetWpm] = useState("Original");
  const [fluctuationLevel, setFluctuationLevel] = useState("Off");

  // Determine media URLs (Priority #1: YouTube Video)
  const youtubeVideoId = getYouTubeVideoId(passage?.videoUrl) || getYouTubeVideoId(passage?.audioUrl);
  const googleDriveAudioUrl = getGoogleDriveStreamUrl(passage?.audioUrl) || getGoogleDriveStreamUrl(passage?.videoUrl);
  const videoUrlCandidate = passage?.videoUrl || passage?.audioUrl || "";
  const isDirectVideo = !youtubeVideoId && (videoUrlCandidate.endsWith(".mp4") || videoUrlCandidate.endsWith(".webm"));

  const finalAudioSource = googleDriveAudioUrl || passage?.audioUrl || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  // Load YouTube IFrame API and Initialize Player
  useEffect(() => {
    if (!youtubeVideoId) return;

    const initPlayer = () => {
      if (window.YT && window.YT.Player) {
        if (ytPlayerRef.current) {
          try { ytPlayerRef.current.destroy(); } catch (e) {}
        }
        ytPlayerRef.current = new window.YT.Player(containerIdRef.current, {
          height: "100%",
          width: "100%",
          videoId: youtubeVideoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
          },
          events: {
            onReady: (event: any) => {
              setDuration(event.target.getDuration() || passage?.duration || 300);
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (
                event.data === window.YT.PlayerState.PAUSED ||
                event.data === window.YT.PlayerState.ENDED
              ) {
                setIsPlaying(false);
              }
            },
          },
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const existingScript = document.getElementById("youtube-iframe-api-script");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (ytPlayerRef.current) {
        try { ytPlayerRef.current.destroy(); } catch (e) {}
      }
    };
  }, [youtubeVideoId]);

  // Sync Progress Bar and Timer for YouTube Player
  useEffect(() => {
    if (youtubeVideoId) {
      timerRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
          const curr = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || passage?.duration || 300;
          setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
        }
      }, 500);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [youtubeVideoId]);

  // Handle Play/Pause Toggle
  const togglePlay = () => {
    if (youtubeVideoId && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }

    if (!mediaRef.current) return;
    if (isPlaying) {
      mediaRef.current.pause();
      setIsPlaying(false);
    } else {
      mediaRef.current.play();
      setIsPlaying(true);
    }
  };

  // Handle Time Update for HTML5 Audio/Video
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      setDuration(mediaRef.current.duration || passage?.duration || 300);
    }
  };

  // Handle Seek Slider Change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);

    if (youtubeVideoId && ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
      ytPlayerRef.current.seekTo(time, true);
      return;
    }

    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  };

  // Handle Playback Rate (Target WPM)
  const handleTargetWpmChange = (wpmValue: string) => {
    setTargetWpm(wpmValue);
    let speed = 1.0;
    if (wpmValue === "60 WPM") speed = 0.75;
    else if (wpmValue === "80 WPM") speed = 1.0;
    else if (wpmValue === "100 WPM") speed = 1.25;
    else if (wpmValue === "120 WPM") speed = 1.5;

    if (youtubeVideoId && ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === "function") {
      ytPlayerRef.current.setPlaybackRate(speed);
    } else if (mediaRef.current) {
      mediaRef.current.playbackRate = speed;
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Card className="p-6 sm:p-8 rounded-3xl border-slate-200 bg-white shadow-md space-y-6">
      {/* HTML5 Audio element for non-youtube media */}
      {!youtubeVideoId && !isDirectVideo && (
        <audio
          ref={mediaRef as any}
          src={finalAudioSource}
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* 1. MEDIA DISPLAY PLAYER BOX (Priority #1: YouTube Video) */}
      {youtubeVideoId ? (
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black relative">
          <iframe
            id={containerIdRef.current}
            src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&autoplay=0&rel=0&modestbranding=1`}
            title={passage?.title || "Steno Dictation YouTube Video"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : isDirectVideo ? (
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black relative">
          <video
            ref={mediaRef as any}
            src={videoUrlCandidate}
            controls
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        <div className="w-full h-56 sm:h-72 rounded-2xl bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#0b132b] text-white flex flex-col items-center justify-center relative overflow-hidden shadow-lg p-6">
          <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center shadow-xl animate-pulse">
            <Volume2 className="w-10 h-10 text-amber-400" />
          </div>
          <p className="text-sm font-black mt-3 tracking-wider text-amber-300 uppercase">
            STENO DICTATION AUDIO PLAYER
          </p>
          <p className="text-xs text-slate-300 mt-1">NGIT Official Dictation • {passage?.wordCount || 400} Words</p>
        </div>
      )}

      {/* 2. PLAYER PROGRESS BAR & REAL-TIME TIMER (Synced with YouTube & Media) */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <input
          type="range"
          min="0"
          max={duration || passage?.durationSeconds || 300}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-xs font-mono font-extrabold text-indigo-600">
          <span className="flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> {formatSeconds(currentTime)}
          </span>
          <span className="flex items-center gap-1">
            {formatSeconds(duration || passage?.durationSeconds || 300)} <RotateCcw className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* 3. CONTROLS ROW */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button
          onClick={togglePlay}
          className="bg-[#1e293b] hover:bg-[#0f172a] text-white font-black h-11 px-6 rounded-xl shadow-md gap-2 shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
          {isPlaying ? "Pause Dictation" : "Play Dictation"}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400">TARGET WPM:</span>
          <select
            value={targetWpm}
            onChange={(e) => handleTargetWpmChange(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            <option value="Original">Original</option>
            <option value="60 WPM">60 WPM</option>
            <option value="80 WPM">80 WPM</option>
            <option value="100 WPM">100 WPM</option>
            <option value="120 WPM">120 WPM</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
            FLUCTUATION LEVEL <Info className="w-3 h-3 text-slate-400" />:
          </span>
          <select
            value={fluctuationLevel}
            onChange={(e) => setFluctuationLevel(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            <option value="Off">Off</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>

      {/* 4. MAIN ACTION BUTTON */}
      <Button
        onClick={onStartTranscription}
        className="w-full bg-[#1e293b] hover:bg-[#0f172a] text-white font-black h-14 text-base rounded-2xl shadow-lg tracking-wider gap-2"
      >
        <Keyboard className="w-5 h-5" /> START TRANSCRIPTION
      </Button>
    </Card>
  );
}
