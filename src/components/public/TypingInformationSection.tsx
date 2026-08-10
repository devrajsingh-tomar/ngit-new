import { Keyboard, Award, CheckCircle2, ShieldAlert, Cpu, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

export default function TypingInformationSection() {
  const features = [
    {
      icon: <Award className="w-8 h-8 text-amber-500" />,
      title: "Best for Government Typing Exam Preparation",
      description: "Practice with tailored rule configurations and calculations to optimize your speed and accuracy."
    },
    {
      icon: <Keyboard className="w-8 h-8 text-indigo-500" />,
      title: "Multi-Layout Hindi Support",
      description: "Support for Mangal Unicode (Inscript) and Krutidev keyboard mapping. Train directly on the layouts preferred in government shorthand and typing boards."
    },
    {
      icon: <Cpu className="w-8 h-8 text-emerald-500" />,
      title: "Intelligent Backspace Lock",
      description: "Simulates official examination restrictions (like the UPSSSC candidate lock where you can only edit the current and previous word) with custom preset configurations."
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-500" />,
      title: "Real-time Speedometer & Analytics",
      description: "Track your live Words-Per-Minute (WPM), raw keystrokes, accuracy percentage, and backspace counts instantly as you type."
    },
    {
      icon: <BookOpen className="w-8 h-8 text-sky-500" />,
      title: "Massive Passage Library",
      description: "Access hundreds of curated government exam typing passages, book exercises, steno materials, and practice topics organized by difficulty."
    },
    {
      icon: <ShieldAlert className="w-8 h-8 text-rose-500" />,
      title: "Strict Exam Protocol",
      description: "Configurable full-screen lock, copy-paste disabling, right-click blocking, and automated submission protocols that match the absolute real-world exam environment."
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-amber-50/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5" /> Assessment Suite
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-none">
            Our Advanced <span className="text-gradient">Typing Software</span>
          </h2>
          <p className="text-slate-500 font-bold text-lg leading-relaxed">
            NGIT provides the most accurate and strict examination typing engine, fine-tuned to help students clear state-level government typing boards.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-50/50 hover:bg-white rounded-3xl p-8 border border-slate-100/80 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300 group flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Banner */}
        <div className="mt-16 bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none hidden md:block" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.25em]">Ready to Practice?</span>
            <h3 className="text-3xl md:text-4xl font-black leading-tight italic">
              Boost your typing speed and clear your upcoming typing test!
            </h3>
            <p className="text-slate-300 font-bold text-sm leading-relaxed max-w-xl">
              Start practice exercises, look up your attempt history, or jump directly into the full mock-test simulator with official evaluation patterns.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link href="/typing">
                <button className="h-12 px-8 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all shadow-md active:scale-95">
                  Launch Practice Software
                </button>
              </Link>
              <Link href="/student/login">
                <button className="h-12 px-8 rounded-2xl bg-slate-800 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700/80 active:scale-95">
                  Student Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
