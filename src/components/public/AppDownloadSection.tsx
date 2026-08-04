import { Smartphone, BookOpen, GraduationCap, Trophy, Play } from "lucide-react";
import Image from "next/image";

export default function AppDownloadSection() {
  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & Badges */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 text-emerald-400 text-xs font-black uppercase tracking-[0.2em] border border-slate-700/50">
                <Smartphone className="w-3.5 h-3.5" /> Mobile Experience
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">
                Download Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Official Mobile App</span>
              </h2>
              <p className="text-slate-400 font-bold text-lg leading-relaxed max-w-2xl">
                Take your education everywhere. Access all our premium lectures, practice shorthand scripts, and take mock examinations directly on your Android device.
              </p>
            </div>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100 text-base">Video Courses</h4>
                  <p className="text-slate-400 text-sm font-medium">Stream and learn from typing and shorthand video tutorials anywhere.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100 text-base">Practice Mock Tests</h4>
                  <p className="text-slate-400 text-sm font-medium">Attempt full-length examinations and mock papers on the go.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100 text-base">Study Material</h4>
                  <p className="text-slate-400 text-sm font-medium">Download PDFs, steno outlines, and exercise guides directly.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-100 text-base">Offline Syncing</h4>
                  <p className="text-slate-400 text-sm font-medium">Access your enrolled courses and resources offline seamlessly.</p>
                </div>
              </div>
            </div>

            {/* Playstore Button */}
            <div className="pt-4">
              <a 
                href="https://play.google.com/store/apps/details?id=com.ngit.institute" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-2xl px-6 py-3.5 hover:bg-slate-900 transition-all group duration-300 shadow-xl"
              >
                {/* SVG Play Store Logo */}
                <svg className="w-8 h-8 group-hover:scale-105 transition-transform" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M49.6 15.6C44.7 20.5 42 28.2 42 38.6V473.4C42 483.8 44.7 491.5 49.6 496.4L52.8 499.6L272.7 279.7V232.3L52.8 12.4L49.6 15.6Z" fill="#00A1F1"/>
                  <path d="M346.5 353.5L272.7 279.7V232.3L346.6 158.5L349.9 160.4L438.4 210.8C463.7 225.2 463.7 248.8 438.4 263.2L349.9 351.6L346.5 353.5Z" fill="#FFB900"/>
                  <path d="M349.9 351.6L272.7 279.7L52.8 499.6C61 507.8 74.4 508.8 89.6 500.1L349.9 351.6Z" fill="#F25022"/>
                  <path d="M349.9 160.4L89.6 11.9C74.4 3.2 61 4.2 52.8 12.4L272.7 232.3L349.9 160.4Z" fill="#7FBA00"/>
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Get it on</p>
                  <p className="text-base font-black text-white leading-tight">Google Play Store</p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Visual Mockup Showcase */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
            {/* Ambient behind mockup */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px]" />
            
            <div className="bg-slate-950/80 backdrop-blur-md rounded-[3rem] p-6 border border-slate-800 shadow-2xl relative w-72 md:w-80">
              <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden aspect-[9/18] relative border border-slate-800">
                {/* Simulated Notch */}
                <div className="w-32 h-4 bg-slate-950 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20" />

                {/* Actual App Screenshot */}
                <Image
                  src="/images/app-home-screenshot.jpg"
                  alt="NGIT Mobile App Home Screen"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 300px"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
