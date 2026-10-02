"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Keyboard,
  Info,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Sparkles,
  Clock,
  Mic,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Flame,
  Radio,
} from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export function getYouTubeVideoId(url?: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed === "#" || trimmed === "" || trimmed === "none") return null;

  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

export function getGoogleDriveId(url?: string): string | null {
  if (!url || typeof url !== "string") return null;
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) {
    const match = url.match(/(?:file\/d\/|id=|open\?id=)([\w-]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export function getGoogleDriveStreamUrl(url?: string): string | null {
  const id = getGoogleDriveId(url);
  if (id) {
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  return null;
}

interface StenoDictationPlayerProps {
  passage: any;
  onStartTranscription: () => void;
}

export default function StenoDictationPlayer({
  passage,
  onStartTranscription,
}: StenoDictationPlayerProps) {
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const fluctuationIntervalRef = useRef<any>(null);
  const containerIdRef = useRef<string>(`yt-player-${Math.random().toString(36).substring(2, 9)}`);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(passage?.durationSeconds || 300);
  const [targetWpm, setTargetWpm] = useState("Original");
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [fluctuationLevel, setFluctuationLevel] = useState("Off");

  // 3-Second Countdown / Preparation State
  const [countdown, setCountdown] = useState<number | null>(null);

  // Fallback TTS (SpeechSynthesis) State
  const [isUsingTTS, setIsUsingTTS] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Media source resolution
  const youtubeVideoId =
    getYouTubeVideoId(passage?.videoUrl) || getYouTubeVideoId(passage?.audioUrl);
  const googleDrivePreviewUrl =
    getGoogleDriveStreamUrl(passage?.videoUrl) || getGoogleDriveStreamUrl(passage?.audioUrl);

  const rawAudioUrl = (passage?.audioUrl || "").trim();
  const rawVideoUrl = (passage?.videoUrl || "").trim();

  const isAudioUrlValid =
    rawAudioUrl &&
    rawAudioUrl !== "#" &&
    rawAudioUrl !== "none" &&
    !getYouTubeVideoId(rawAudioUrl) &&
    !getGoogleDriveId(rawAudioUrl);

  const isVideoUrlValid =
    rawVideoUrl &&
    rawVideoUrl !== "#" &&
    rawVideoUrl !== "none" &&
    !getYouTubeVideoId(rawVideoUrl) &&
    !getGoogleDriveId(rawVideoUrl) &&
    (rawVideoUrl.endsWith(".mp4") || rawVideoUrl.endsWith(".webm") || rawVideoUrl.includes("/video/"));

  // Check if we should automatically enable TTS if no valid audio or video is found
  useEffect(() => {
    if (!youtubeVideoId && !googleDrivePreviewUrl && !isAudioUrlValid && !isVideoUrlValid) {
      if (passage?.transcriptText) {
        setIsUsingTTS(true);
      }
    }
  }, [youtubeVideoId, googleDrivePreviewUrl, isAudioUrlValid, isVideoUrlValid, passage]);

  // Load available speech synthesis voices for Hindi/English
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const updateVoices = () => {
        setTtsVoices(window.speechSynthesis.getVoices());
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // PostMessage helper to send direct commands to YouTube iframe
  const sendYouTubeCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: func,
            args: args,
          }),
          "*"
        );
      } catch (e) {
        console.warn("YouTube postMessage error:", e);
      }
    }
  }, []);

  // YouTube IFrame API Initialization
  useEffect(() => {
    if (!youtubeVideoId) return;

    let isSubscribed = true;

    const attachYtPlayer = () => {
      if (!isSubscribed) return;
      if (window.YT && window.YT.Player && iframeRef.current) {
        try {
          if (ytPlayerRef.current) {
            try {
              ytPlayerRef.current.destroy();
            } catch (e) {}
          }

          // Attach to existing iframe without passing videoId/width/height (API standard)
          ytPlayerRef.current = new window.YT.Player(iframeRef.current, {
            events: {
              onReady: (event: any) => {
                if (!isSubscribed) return;
                const dur = event.target.getDuration();
                if (dur && dur > 0) setDuration(dur);
              },
              onStateChange: (event: any) => {
                if (!isSubscribed) return;
                if (event.data === 1) {
                  // Playing
                  setIsPlaying(true);
                } else if (event.data === 2 || event.data === 0) {
                  // Paused or Ended
                  setIsPlaying(false);
                }
              },
            },
          });
        } catch (e) {
          console.warn("YT.Player binding error:", e);
        }
      }
    };

    if (window.YT && window.YT.Player) {
      attachYtPlayer();
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
        attachYtPlayer();
      };
    }

    // Sync YouTube Progress Bar and Current Time via Polling & postMessage
    timerRef.current = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === "function") {
        try {
          const curr = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || passage?.durationSeconds || 300;
          setCurrentTime(curr);
          if (dur > 0) setDuration(dur);
        } catch (e) {}
      }
    }, 500);

    return () => {
      isSubscribed = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }
    };
  }, [youtubeVideoId, passage]);

  // Fluctuation Simulator Effect
  useEffect(() => {
    if (fluctuationLevel === "Off" || !isPlaying) {
      if (fluctuationIntervalRef.current) clearInterval(fluctuationIntervalRef.current);
      return;
    }

    const variance =
      fluctuationLevel === "Low" ? 0.05 : fluctuationLevel === "Medium" ? 0.1 : 0.18;

    fluctuationIntervalRef.current = setInterval(() => {
      // Random delta between -variance and +variance
      const delta = (Math.random() * 2 - 1) * variance;
      const newSpeed = Math.max(0.6, Math.min(1.6, playbackSpeed + delta));

      if (youtubeVideoId) {
        if (ytPlayerRef.current?.setPlaybackRate) {
          ytPlayerRef.current.setPlaybackRate(newSpeed);
        }
        sendYouTubeCommand("setPlaybackRate", [newSpeed]);
      } else if (mediaRef.current) {
        mediaRef.current.playbackRate = newSpeed;
      }
    }, 12000);

    return () => {
      if (fluctuationIntervalRef.current) clearInterval(fluctuationIntervalRef.current);
    };
  }, [fluctuationLevel, isPlaying, playbackSpeed, youtubeVideoId, sendYouTubeCommand]);

  // Actual Play Execution (called after 3-second countdown or directly)
  const executePlay = () => {
    setCountdown(null);

    // 1. YouTube Playback
    if (youtubeVideoId) {
      setIsPlaying(true);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        try {
          ytPlayerRef.current.playVideo();
        } catch (e) {
          sendYouTubeCommand("playVideo");
        }
      } else {
        sendYouTubeCommand("playVideo");
      }
      return;
    }

    // 2. Speech Synthesis (TTS) Fallback
    if (isUsingTTS && passage?.transcriptText) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const textToRead = passage.transcriptText;
        const utterance = new SpeechSynthesisUtterance(textToRead);

        const isHindi =
          passage?.language === "Hindi" || /[\u0900-\u097F]/.test(textToRead);

        if (isHindi) {
          utterance.lang = "hi-IN";
          const hiVoice = ttsVoices.find(
            (v) => v.lang.includes("hi") || v.lang.includes("HI")
          );
          if (hiVoice) utterance.voice = hiVoice;
        } else {
          utterance.lang = "en-IN";
          const enVoice = ttsVoices.find(
            (v) => v.lang.includes("en-IN") || v.lang.includes("en-US")
          );
          if (enVoice) utterance.voice = enVoice;
        }

        utterance.rate = playbackSpeed;
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (e) => {
          console.error("TTS Error:", e);
          setIsPlaying(false);
          toast.error("Text-to-Speech Error. Please check speaker/audio settings.");
        };

        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
        toast.success("आवाज़ डिक्टेशन शुरू हो गया (TTS Dictation Playing)");
        return;
      }
    }

    // 3. HTML5 Audio / Video Playback
    if (mediaRef.current) {
      mediaRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setMediaError(null);
        })
        .catch((err) => {
          console.warn("HTML5 Media Play Error:", err);
          setIsPlaying(false);
          setMediaError("ऑडियो लोड नहीं हुआ। सिस्टम वॉइस डिक्टेशन सक्रिय कर रहा है...");
          // Fallback to TTS automatically if transcriptText exists
          if (passage?.transcriptText) {
            setIsUsingTTS(true);
            toast.info("ऑडियो स्रोत अनुपलब्ध होने पर AI वॉइस डिक्टेशन सक्रिय कर दिया गया है।");
            setTimeout(() => {
              executePlay();
            }, 300);
          } else {
            toast.error("डिक्टेशन प्ले नहीं हो सका। कृपया इंटरनेट जांचें।");
          }
        });
    }
  };

  // Pause Execution
  const executePause = () => {
    setCountdown(null);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    if (youtubeVideoId) {
      setIsPlaying(false);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === "function") {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {
          sendYouTubeCommand("pauseVideo");
        }
      } else {
        sendYouTubeCommand("pauseVideo");
      }
      return;
    }

    if (isUsingTTS && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    if (mediaRef.current) {
      mediaRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Start 3-Second Countdown or Pause
  const handlePlayToggle = () => {
    if (isPlaying) {
      executePause();
      return;
    }

    // If countdown is already running, cancel it
    if (countdown !== null) {
      executePause();
      return;
    }

    // Start 3-second countdown (as documented in instruction #1)
    let secondsLeft = 3;
    setCountdown(secondsLeft);

    // Audio cue beep for countdown using AudioContext
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 600;
        gain.gain.value = 0.05;
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {}

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        executePlay();
      } else {
        setCountdown(secondsLeft);
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 600 + (3 - secondsLeft) * 100;
            gain.gain.value = 0.05;
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          }
        } catch (e) {}
      }
    }, 1000);
  };

  // Handle Time Update for HTML5 Audio/Video
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
      if (mediaRef.current.duration) {
        setDuration(mediaRef.current.duration);
      }
    }
  };

  // Handle Seek Slider Change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);

    if (youtubeVideoId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
        ytPlayerRef.current.seekTo(time, true);
      }
      sendYouTubeCommand("seekTo", [time, true]);
      return;
    }

    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
  };

  // Handle Quick Forward / Rewind 5 seconds
  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);

    if (youtubeVideoId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === "function") {
        ytPlayerRef.current.seekTo(newTime, true);
      }
      sendYouTubeCommand("seekTo", [newTime, true]);
    } else if (mediaRef.current) {
      mediaRef.current.currentTime = newTime;
    }
  };

  // Handle Target WPM / Playback Speed Change
  const handleTargetWpmChange = (wpmValue: string) => {
    setTargetWpm(wpmValue);
    let speed = 1.0;
    if (wpmValue === "60 WPM") speed = 0.75;
    else if (wpmValue === "80 WPM") speed = 1.0;
    else if (wpmValue === "100 WPM") speed = 1.25;
    else if (wpmValue === "120 WPM") speed = 1.5;

    setPlaybackSpeed(speed);

    if (youtubeVideoId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === "function") {
        ytPlayerRef.current.setPlaybackRate(speed);
      }
      sendYouTubeCommand("setPlaybackRate", [speed]);
    } else if (mediaRef.current) {
      mediaRef.current.playbackRate = speed;
    }
  };

  const formatSeconds = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Card className="p-4 sm:p-7 rounded-3xl border-slate-200 bg-white shadow-xl space-y-6 overflow-hidden relative">
      {/* 3-Second Preparation Countdown Modal Overlay */}
      {countdown !== null && (
        <div className="absolute inset-0 z-30 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center animate-in fade-in duration-200">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-2xl shadow-indigo-500/50 mb-4 animate-bounce">
            <span className="text-5xl font-black text-white">{countdown}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            डिक्टेशन शुरू हो रहा है...
          </h3>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-sm font-medium mt-1">
            कृपया अपनी शॉर्टहैंड नोटबुक और पेंसिल तैयार रखें।
          </p>
          <Button
            onClick={executePause}
            variant="outline"
            className="mt-6 rounded-xl border-white/20 text-white hover:bg-white/10 text-xs font-bold"
          >
            रद्द करें (Cancel)
          </Button>
        </div>
      )}

      {/* HTML5 Audio element for direct audio URLs */}
      {!youtubeVideoId && !isVideoUrlValid && isAudioUrlValid && !isUsingTTS && (
        <audio
          ref={mediaRef as any}
          src={rawAudioUrl}
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onEnded={() => setIsPlaying(false)}
          onError={() => {
            setMediaError("ऑडियो लोड नहीं हुआ। सिस्टम वॉइस डिक्टेशन सक्रिय कर रहा है...");
            if (passage?.transcriptText) {
              setIsUsingTTS(true);
            }
          }}
        />
      )}

      {/* 1. MEDIA DISPLAY PLAYER BOX */}
      {youtubeVideoId ? (
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black relative group">
          <iframe
            ref={iframeRef}
            id={containerIdRef.current}
            src={`https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&autoplay=0&rel=0&modestbranding=1&origin=${
              typeof window !== "undefined" ? window.location.origin : ""
            }`}
            title={passage?.title || "Steno Dictation YouTube Video"}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : googleDrivePreviewUrl ? (
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black relative">
          <iframe
            src={googleDrivePreviewUrl}
            title={passage?.title || "Google Drive Dictation Audio"}
            className="w-full h-full border-0"
            allow="autoplay"
          />
        </div>
      ) : isVideoUrlValid ? (
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black relative">
          <video
            ref={mediaRef as any}
            src={rawVideoUrl}
            controls
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
          />
        </div>
      ) : (
        /* Audio Waveform / TTS Player Box */
        <div className="w-full h-48 sm:h-64 rounded-2xl bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#0b132b] text-white flex flex-col items-center justify-center relative overflow-hidden shadow-lg p-6">
          <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

          {/* Animated audio wave bars */}
          <div className="flex items-center gap-1.5 h-14 mb-3">
            {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50].map((h, i) => (
              <span
                key={i}
                style={{
                  height: isPlaying ? `${Math.max(15, (h * (i % 2 === 0 ? 1 : 0.8)))}%` : "20%",
                  transition: "height 0.3s ease",
                }}
                className={`w-1.5 sm:w-2 rounded-full ${
                  isPlaying ? "bg-amber-400 animate-pulse" : "bg-slate-600"
                }`}
              />
            ))}
          </div>

          <p className="text-sm font-black tracking-wider text-amber-300 uppercase flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400" />
            {isUsingTTS ? "AI VOICE STENO DICTATION" : "OFFICIAL AUDIO PLAYER"}
          </p>
          <p className="text-xs text-slate-300 mt-1 font-medium">
            {passage?.wordCount || 400} Words • Target: {passage?.targetWpm || 80} WPM •{" "}
            {passage?.language || "Hindi"}
          </p>

          {isUsingTTS && (
            <Badge className="mt-2 bg-indigo-500/20 text-indigo-300 border-indigo-400/40 text-[10px] font-bold">
              Speech Synthesis Active
            </Badge>
          )}
        </div>
      )}

      {/* Media Error Notice */}
      {mediaError && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            {mediaError}
          </span>
          {passage?.transcriptText && !isUsingTTS && (
            <Button
              size="sm"
              onClick={() => setIsUsingTTS(true)}
              className="h-7 text-[10px] bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shrink-0"
            >
              वॉइस मोड चालू करें (Use TTS)
            </Button>
          )}
        </div>
      )}

      {/* 2. PLAYER PROGRESS BAR & REAL-TIME TIMER */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <input
          type="range"
          min="0"
          max={duration || passage?.durationSeconds || 300}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
        />
        <div className="flex justify-between text-xs font-mono font-extrabold text-indigo-700">
          <span className="flex items-center gap-1">
            <RotateCcw className="w-3 h-3 text-slate-400" /> {formatSeconds(currentTime)}
          </span>
          <span className="flex items-center gap-1">
            {formatSeconds(duration || passage?.durationSeconds || 300)}{" "}
            <RotateCw className="w-3 h-3 text-slate-400" />
          </span>
        </div>
      </div>

      {/* 3. MAIN CONTROLS ROW */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Main Play/Pause Button */}
          <Button
            onClick={handlePlayToggle}
            className={`w-full sm:w-auto font-black h-12 px-6 rounded-xl shadow-md gap-2.5 shrink-0 transition-transform active:scale-95 ${
              isPlaying
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            {countdown !== null
              ? `Starting in ${countdown}s...`
              : isPlaying
              ? "Pause Dictation"
              : "Play Dictation (3s Countdown)"}
          </Button>

          {/* Quick Skip Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSkip(-5)}
            title="Rewind 5 seconds"
            className="h-12 px-3 rounded-xl border-slate-200 text-slate-700 bg-white"
          >
            -5s
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSkip(5)}
            title="Forward 5 seconds"
            className="h-12 px-3 rounded-xl border-slate-200 text-slate-700 bg-white"
          >
            +5s
          </Button>
        </div>

        {/* Speed & Fluctuation Pickers */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-500">SPEED:</span>
            <select
              value={targetWpm}
              onChange={(e) => handleTargetWpmChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 shadow-2xs"
            >
              <option value="Original">Normal (1.0x)</option>
              <option value="60 WPM">60 WPM (0.75x)</option>
              <option value="80 WPM">80 WPM (1.0x)</option>
              <option value="100 WPM">100 WPM (1.25x)</option>
              <option value="120 WPM">120 WPM (1.5x)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-500 flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-amber-500" /> FLUCTUATION:
            </span>
            <select
              value={fluctuationLevel}
              onChange={(e) => setFluctuationLevel(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-800 shadow-2xs"
            >
              <option value="Off">Off</option>
              <option value="Low">Low (±5 WPM)</option>
              <option value="Medium">Medium (±10 WPM)</option>
              <option value="High">High (±15 WPM)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. MAIN ACTION BUTTON: START TRANSCRIPTION */}
      <Button
        onClick={onStartTranscription}
        className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-black h-14 sm:h-16 text-sm sm:text-base rounded-2xl shadow-xl tracking-wider gap-3 transition-transform hover:scale-[1.01]"
      >
        <Keyboard className="w-5 h-5 text-indigo-400" />
        START TRANSCRIPTION (टाइपिंग टेस्ट शुरू करें)
      </Button>
    </Card>
  );
}
