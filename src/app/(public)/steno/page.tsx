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
} from "lucide-react";
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

function getEmbedUrl(url: string): string {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  if (url.includes("watch?v=")) {
    return (
      url.replace("watch?v=", "embed/").split("&")[0] + "?autoplay=1&rel=0"
    );
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split("?")[0];
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  }
  return url;
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
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* 1. Single Top Banner Image */}
        <div className="w-full rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 bg-slate-900">
          <img
            src="https://ngitedu.com/uploads/gallery/1787956222932-d84153c2-8f95-4d2e-8690-207c4d3b679f.jpg"
            alt="NGIT Steno Shorthand Portal"
            className="w-full h-auto object-cover rounded-[2.5rem]"
          />
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
              <div className="p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Official Steno Portal
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Steno Batches & Series Collections</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  Curated Legal, Editorial, PYQ, and Speed Building passage collections categorized for targeted speed enhancement.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="p-6 sm:p-8 pt-0">
              <Link
                href={isLoggedIn ? "/student/steno/series" : "/login?callbackUrl=/student/steno/series"}
                className="w-full inline-block"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-12 px-6 rounded-2xl shadow-md text-xs gap-2">
                  {isLoggedIn ? "Browse Steno Batches & Series" : "Login Required to Access"} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Card 2: Student Evaluation & Record Dashboard */}
          <Card className="p-0 rounded-[2.5rem] border-slate-200 bg-white shadow-md overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              {/* Image Banner Above Section */}
              <div className="w-full overflow-hidden bg-slate-900 border-b border-slate-200">
                <img
                  src="/images/steno-student-evaluation-dashboard.jpg"
                  alt="Steno Student Evaluation & Record Dashboard"
                  className="w-full h-auto object-cover"
                />
              </div>

              {/* Section Details */}
              <div className="p-6 sm:p-8 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-200 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" /> Student Analytics & Evaluation
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">Steno Evaluation & Record Dashboard</h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                  आपकी मेहनत, हमारा मूल्यांकन • Complete student record tracking with daily practice, test evaluation, progress graphs & target setting.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="p-6 sm:p-8 pt-0">
              <Link
                href={isLoggedIn ? "/student/steno/dashboard" : "/login?callbackUrl=/student/steno/dashboard"}
                className="w-full inline-block"
              >
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-12 px-6 rounded-2xl shadow-md text-xs gap-2">
                  {isLoggedIn ? "Open Student Dashboard" : "Login Required to Access"} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
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

            {/* CTA Button */}
            <div className="p-6 sm:p-8 pt-0">
              <Link
                href={isLoggedIn ? "/student/steno/series" : "/login?callbackUrl=/student/steno/series"}
                className="w-full inline-block"
              >
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold h-12 px-6 rounded-2xl shadow-md text-xs gap-2">
                  {isLoggedIn ? "Start Online Steno Practice" : "Login Required to Access"} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
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

            {/* CTA Button */}
            <div className="p-6 sm:p-8 pt-0">
              <Link
                href={isLoggedIn ? "/student/steno/dashboard" : "/login?callbackUrl=/student/steno/dashboard"}
                className="w-full inline-block"
              >
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold h-12 px-6 rounded-2xl shadow-md text-xs gap-2">
                  {isLoggedIn ? "Open Student Dashboard" : "Login Required to Access"} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
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
                      src={
                        video.thumbnailUrl ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80"
                      }
                      alt={video.title}
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
    </div>
  );
}
