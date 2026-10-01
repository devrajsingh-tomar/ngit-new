"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Headphones,
  BarChart3,
  ArrowRight,
  Layers,
  Lock,
  PlayCircle,
  Video,
  HelpCircle,
  X,
  Play,
  Trophy,
  LogIn,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DoubtVideo {
  _id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  order: number;
  isActive: boolean;
}

function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/embed/")) {
    return url.split("youtube.com/embed/")[1]?.split("?")[0] || null;
  }
  if (url.includes("watch?v=")) {
    return url.split("watch?v=")[1]?.split("&")[0] || null;
  }
  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1]?.split("?")[0] || null;
  }
  return null;
}

function getThumbnailUrl(video: { thumbnailUrl?: string; videoUrl: string }): string {
  if (video.thumbnailUrl && video.thumbnailUrl.trim() !== "") {
    return video.thumbnailUrl.trim();
  }
  const videoId = getYouTubeVideoId(video.videoUrl);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80";
}

function getEmbedUrl(url: string): string {
  if (!url) return "";
  const videoId = getYouTubeVideoId(url);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  if (url.includes("youtube.com/embed/")) {
    return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
  }
  if (url.includes("watch?v=")) {
    return url.replace("watch?v=", "embed/").split("&")[0] + "?autoplay=1&rel=0";
  }
  return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
}

export default function StenoMainLandingPage() {
  const { status } = useSession();
  const isLoggedIn = status === "authenticated";

  const [doubtVideos, setDoubtVideos] = useState<DoubtVideo[]>([]);
  const [activeVideo, setActiveVideo] = useState<DoubtVideo | null>(null);

  useEffect(() => {
    fetch("/api/steno/doubt-videos")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDoubtVideos(data);
        }
      })
      .catch((err) => console.error("Error loading doubt videos:", err));
  }, []);

  return (
    <div className={cn("bg-slate-50 min-h-screen py-8 px-4 sm:px-6 transition-all", !isLoggedIn && "pb-24 sm:pb-32")}>
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        {/* Top Notice for visiting students */}
        {!isLoggedIn && (
          <div className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-400/40">
            <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-center sm:text-left">
              <span className="flex h-3 w-3 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span>
                🎁 <strong className="font-black">7-Day Free Trial:</strong> नए छात्रों के लिए 7 दिन का निःशुल्क स्टेनो ट्रायल! लॉगिन करें और तुरंत सभी बैच व डिक्टेशन टेस्ट दें।
              </span>
            </div>
            <Link
              href="/student/login?callbackUrl=/student/steno/series"
              className="shrink-0 w-full sm:w-auto"
            >
              <Button size="sm" className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-900 font-black px-5 py-2 rounded-xl shadow gap-2 text-xs sm:text-sm">
                <LogIn className="w-4 h-4" /> छात्र लॉगिन करें (Student Login)
              </Button>
            </Link>
          </div>
        )}

        {/* 1. Single Top Banner Image */}
        <div className="w-full rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
          <img
            src="/images/steno-hero-banner.jpg"
            alt="NGIT Steno Shorthand Portal"
            className="w-full h-auto object-cover rounded-[2.5rem]"
          />
        </div>

        {/* Full-width High-Visibility Main Login Button on ALL devices */}
        <div className="w-full">
          <Link
            href={isLoggedIn ? "/student/steno/series" : "/student/login?callbackUrl=/student/steno/series"}
            className="w-full block group"
          >
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black h-16 sm:h-20 px-5 sm:px-10 rounded-2xl sm:rounded-3xl shadow-xl hover:shadow-2xl text-base sm:text-2xl gap-3 sm:gap-4 transition-all duration-300 border-2 border-emerald-400/40 relative overflow-hidden flex items-center justify-between">
              <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  {isLoggedIn ? (
                    <Layers className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  ) : (
                    <LogIn className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                  )}
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[11px] sm:text-xs font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
                    {isLoggedIn ? "Access Granted" : "🔑 Online Shorthand Portal"}
                  </div>
                  <div className="text-sm sm:text-xl md:text-2xl font-black text-white truncate">
                    {isLoggedIn
                      ? "Browse Steno Batches & Series • अपनी प्रैक्टिस शुरू करें"
                      : "स्टेनो टेस्ट एवं बैच शुरू करने के लिए यहाँ लॉगिन करें (Student Login)"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 bg-white text-emerald-800 font-extrabold px-3.5 sm:px-6 py-2 sm:py-3.5 rounded-xl sm:rounded-2xl text-xs sm:text-base shadow-md group-hover:bg-emerald-50 group-hover:translate-x-1 transition-all">
                <span>{isLoggedIn ? "Open Portal" : "Login Now"}</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </Button>
          </Link>
        </div>

        {/* 2. Steno Main Cards Grid (Side-by-side in laptop view) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: Steno Batches & Series Collections */}
          <Card className="p-0 rounded-[2.5rem] border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              {/* Image Banner Above Section */}
              <div className="w-full overflow-hidden bg-slate-900 border-b border-slate-200">
                <img
                  src="https://ngitedu.com/uploads/gallery/1787956467734-3fe88938-2d9d-4471-9a0d-e24dac83cdf4.jpg"
                  alt="Steno Batches & Series Collections"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Section Details */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Official Steno Portal
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Steno Batches & Series Collections</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                  <span className="text-slate-900 font-extrabold">एक कदम सफलता की ओर</span> • Curated Legal, Editorial, PYQ, and Speed Building passage collections categorized for targeted speed enhancement.
                </p>
                <div className="pt-2">
                  <Link
                    href={isLoggedIn ? "/student/steno/series" : "/student/login?callbackUrl=/student/steno/series"}
                    className="w-full block"
                  >
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 sm:h-14 rounded-2xl shadow-md gap-2.5 text-sm sm:text-base transition-all">
                      {isLoggedIn ? (
                        <>Open Steno Batches & Series <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <><LogIn className="w-4 h-4" /> लॉगिन करें और बैच देखें (Login to View Batches) <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          {/* Card 2: Steno Free Weekly Test */}
          <Card className="p-0 rounded-[2.5rem] border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              {/* Image Banner Above Section */}
              <div className="w-full overflow-hidden bg-slate-900 border-b border-slate-200">
                <img
                  src="/images/steno-weekly-test-banner.jpg"
                  alt="NGIT Steno Free Weekly Test"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Section Details */}
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5" /> Steno Free Weekly Test
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Steno Free Weekly Test • फ्री साप्ताहिक टेस्ट</h3>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed">
                  <span className="text-slate-900 font-extrabold">अपनी स्पीड और एक्यूरेसी को करें हर हफ्ते मजबूत</span> • Real Exam Pattern, Time Based Tests for UPSSSC, High Court, UP SI & Government Steno Exams.
                </p>
                <div className="pt-2">
                  <Link
                    href={isLoggedIn ? "/student/steno/series" : "/student/login?callbackUrl=/student/steno/series"}
                    className="w-full block"
                  >
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 sm:h-14 rounded-2xl shadow-md gap-2.5 text-sm sm:text-base transition-all">
                      {isLoggedIn ? (
                        <>Start Free Weekly Test <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <><Trophy className="w-4 h-4" /> फ्री टेस्ट देने के लिए लॉगिन करें (Login for Free Test) <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 3. Steno Visual Banners & Guides Grid (Side-by-side in laptop view) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 3: ऑनलाइन स्टेनो टेस्ट कैसे दें */}
          <Card className="p-0 rounded-[2.5rem] border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              {/* Image Banner Above Section */}
              <div className="w-full overflow-hidden bg-slate-900 border-b border-slate-200">
                <img
                  src="/images/steno-test-guide-banner.jpg"
                  alt="ऑनलाइन स्टेनो टेस्ट कैसे दें"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Section Details */}
              <div className="p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> Steno Test Guide
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">ऑनलाइन स्टेनो टेस्ट कैसे दें</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  5 सरल चरणों में ऑनलाइन स्टेनो टेस्ट देना सीखें • Register, Login, Select Batch, Pick Test, and Start Practice.
                </p>
              </div>
            </div>
          </Card>

          {/* Card 4: मूल्यांकन करके पूरा लेखा जोखा */}
          <Card className="p-0 rounded-[2.5rem] border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              {/* Image Banner Above Section */}
              <div className="w-full overflow-hidden bg-slate-900 border-b border-slate-200">
                <img
                  src="/images/steno-analytics-banner.jpg"
                  alt="आपकी मेहनत, हमारा मूल्यांकन • पूरा लेखा जोखा"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Section Details */}
              <div className="p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Student Analytics & Record
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">मूल्यांकन करके पूरा लेखा जोखा</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  आपकी मेहनत, हमारा मूल्यांकन • Complete student record tracking with daily practice, test evaluation, progress graphs & target setting.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* 4. Your Doubt Solution Section */}
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 shadow-md space-y-8">
          {/* Section Title Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-200 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" /> Video Help & Doubt Clearance
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Your Doubt Solution • शंका समाधान
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-3xl">
                Watch expert shorthand speed building techniques, legal passage outlines, dictation tips, and exam rule doubt clearance videos.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
              <Video className="w-4 h-4 text-indigo-600" /> 3 Videos Per Row Format
            </div>
          </div>

          {/* 3 Videos Per Row Grid (6 total: Row 1 = 3 videos, Row 2 = 3 videos) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {doubtVideos.map((video, idx) => (
              <Card
                key={video._id || idx}
                onClick={() => setActiveVideo(video)}
                className="p-0 rounded-3xl border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all cursor-pointer group overflow-hidden flex flex-col justify-between border hover:border-indigo-200"
              >
                <div>
                  {/* Video Thumbnail Box */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={getThumbnailUrl(video)}
                      alt={video.title}
                      onError={(e) => {
                        const target = e.currentTarget;
                        const videoId = getYouTubeVideoId(video.videoUrl);
                        const fallbackSrc = videoId
                          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                          : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80";
                        if (target.src !== fallbackSrc) {
                          target.src = fallbackSrc;
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent group-hover:opacity-90 transition-opacity" />

                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-indigo-500 transition-all">
                        <Play className="w-6 h-6 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-full border border-white/10">
                      Solution #{idx + 1}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action */}
                <div className="p-5 pt-0">
                  <div className="w-full flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                    <span className="flex items-center gap-1.5">
                      <PlayCircle className="w-4 h-4" /> Watch Solution Video
                    </span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Video Player Popup Dialog */}
      <Dialog
        open={!!activeVideo}
        onOpenChange={(open) => {
          if (!open) setActiveVideo(null);
        }}
      >
        <DialogContent className="max-w-4xl p-0 rounded-3xl overflow-hidden bg-black border-slate-800 shadow-2xl">
          <DialogHeader className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex flex-row items-center justify-between">
            <DialogTitle className="text-white text-sm sm:text-base font-black line-clamp-1 pr-6 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-indigo-400 shrink-0" />
              {activeVideo?.title}
            </DialogTitle>
          </DialogHeader>

          <div className="w-full aspect-video bg-black relative">
            {activeVideo && (
              <iframe
                title={activeVideo.title}
                src={getEmbedUrl(activeVideo.videoUrl)}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Sticky Floating Login Bar for Students on all devices */}
      {!isLoggedIn && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-emerald-500/40 px-4 py-3 sm:py-3.5 shadow-[0_-8px_25px_rgba(0,0,0,0.4)]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
            <div className="hidden sm:flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <KeyRound className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black text-white truncate">NGIT Steno Shorthand Portal</div>
                <div className="text-xs text-slate-400 font-medium truncate">ऑनलाइन स्टेनो टेस्ट और डिक्टेशन के लिए लॉगिन आवश्यक है</div>
              </div>
            </div>
            <Link
              href="/student/login?callbackUrl=/student/steno/series"
              className="w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black h-12 px-6 sm:px-8 rounded-xl shadow-lg gap-2 text-sm sm:text-base transition-all">
                <LogIn className="w-4 h-4" /> छात्र लॉगिन करें (Student Login) <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
