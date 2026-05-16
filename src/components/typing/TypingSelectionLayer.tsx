"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Keyboard, 
  BookOpen, 
  Newspaper, 
  ChevronRight, 
  ArrowLeft,
  Search,
  Timer,
  Award,
  Zap,
  Target,
  Flame
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
export default function TypingSelectionLayer() {
  type Module = 'WORD' | 'SPECIAL' | 'OFFICIAL' | 'BOOK';
  const [step, setStep] = useState(1);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'Hindi'>('English');
  const [selectedLayout, setSelectedLayout] = useState<'English' | 'Inscript'>('English');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
  const [taxonomy, setTaxonomy] = useState<{words: any[], essays: any[], current: any[], books: any[]}>({ words: [], essays: [], current: [], books: [] });
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(true);
  const [specialExams, setSpecialExams] = useState<any[]>([]);
  const [bookChapters, setBookChapters] = useState<any[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (selectedModule === 'SPECIAL') {
        setLoadingContent(true);
        const diffParam = selectedDifficulty ? `&difficulty=${selectedDifficulty}` : '';
        fetch(`/api/typing/exams?category=SPECIAL&lang=${selectedLanguage}${diffParam}`)
          .then(res => res.json())
          .then(data => {
              if (Array.isArray(data)) setSpecialExams(data);
              setLoadingContent(false);
          })
          .catch(() => setLoadingContent(false));
    }
  }, [selectedModule, selectedLanguage, selectedDifficulty]);

  useEffect(() => {
    if (selectedModule === 'BOOK' && selectedCategory) {
        setLoadingContent(true);
        fetch(`/api/typing/practice?type=BOOK&bookId=${selectedCategory}&lang=${selectedLanguage}`)
          .then(res => res.json())
          .then(data => {
              if (Array.isArray(data)) setBookChapters(data);
              setLoadingContent(false);
          })
          .catch(() => setLoadingContent(false));
    }
  }, [selectedModule, selectedCategory, selectedLanguage]);

  useEffect(() => {
    fetch('/api/typing/practice?type=TAXONOMY')
      .then(res => res.json())
      .then(data => {
         setTaxonomy({ 
             words: data.words || [], 
             essays: data.essays || [], 
             current: data.current || [],
             books: data.books || []
         });
         setLoadingTaxonomy(false);
      })
      .catch(err => {
         console.error(err);
         setLoadingTaxonomy(false);
      });
  }, []);

  const modules = [
    {
      id: 'WORD' as Module,
      title: 'Word Practice',
      description: 'Build muscle memory with A-Z and length-based drills.',
      icon: Keyboard,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50'
    },
    {
      id: 'SPECIAL' as Module,
      title: 'Special Topic / Current Affairs',
      description: 'Practice with specialized essays and stay updated with daily news passages.',
      icon: Newspaper,
      color: 'bg-emerald-500',
      lightColor: 'bg-emerald-50'
    },
    {
      id: 'BOOK' as any,
      title: 'Book Practice',
      description: 'Master specialized typing books chapter by chapter.',
      icon: BookOpen,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-50'
    },
    {
        id: 'OFFICIAL' as Module,
        title: 'Government Exams',
        description: 'Take standard SSC, Railway, UPSSSC, and State Police exams.',
        icon: Award,
        color: 'bg-slate-900',
        lightColor: 'bg-slate-100'
      }
  ];

  // Compute dynamic categories
  const dynamicBookCategories = taxonomy.books
    .filter(b => {
      if (!b.languages || b.languages.length === 0) return true;
      const searchLang = selectedLanguage.toLowerCase();
      return b.languages.some((l: any) => String(l).toLowerCase().includes(searchLang));
    })
    .map(b => ({
      id: b._id,
      title: b.name,
      description: `Practice chapters from ${b.name}.`
    }));
  const dynamicWordCategories = Array.from(new Set(taxonomy.words.filter(w => w.language === selectedLanguage).map(w => w.category))).map(cat => ({
    id: cat,
    title: cat === 'A-Z' ? 'A to Z Words' : cat === 'Length' ? 'Word Length' : String(cat),
    description: `Practice ${cat} word sets in ${selectedLanguage}.`
  }));

  const dynamicSpecialCategories = [
    { id: 'CURRENT', title: 'Current Affairs', topic: 'Current Affairs', description: `Stay updated with daily ${selectedLanguage} news passages.` },
    ...Array.from(new Set(taxonomy.essays.filter(e => e.language === selectedLanguage).map(e => e.topic))).map(topic => ({
      id: topic as string,
      title: topic as string,
      topic: topic as string,
      description: `Practice ${selectedLanguage} essays on ${topic}.`
    }))
  ];

  const { data: session } = useSession();

  const handleModuleSelect = (moduleId: Module) => {
    if (moduleId === 'OFFICIAL') {
        if (!session) {
            router.push(`/api/auth/signin?callbackUrl=/typing/official?lang=${selectedLanguage}`);
            return;
        }
        router.push(`/typing/official?lang=${selectedLanguage}`); 
        return;
    }
    if (moduleId === 'SPECIAL') {
        setSelectedModule(moduleId);
        setSelectedCategory('SPECIAL'); 
        setSelectedDifficulty(null); // Reset difficulty
        setStep(2); // Go to difficulty selection first
        return;
    }
    if (moduleId === 'BOOK') {
        setSelectedModule(moduleId);
        setStep(0); 
        return;
    }
    setSelectedModule(moduleId);
    setStep(2);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setStep(3);
  };

  const renderStep0 = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <Card 
        onClick={() => {
            setSelectedLanguage('English');
            setSelectedLayout('English');
            setStep(selectedModule ? 2 : 1);
        }}
        className="p-10 rounded-[2.5rem] cursor-pointer hover:shadow-2xl transition-all text-center border-slate-100 group"
      >
        <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
           <span className="text-3xl font-black">EN</span>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">English</h3>
        <p className="text-slate-400 font-bold">Standard English Typing</p>
      </Card>
      <Card 
        onClick={() => {
            setSelectedLanguage('Hindi');
            setSelectedLayout('Inscript');
            setStep(selectedModule ? 2 : 1);
        }}
        className="p-10 rounded-[2.5rem] cursor-pointer hover:shadow-2xl transition-all text-center border-slate-100 group"
      >
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
           <span className="text-3xl font-black">HI</span>
        </div>
        <h3 className="text-3xl font-black text-slate-900 mb-2">Hindi</h3>
        <p className="text-slate-400 font-bold">Mangal Inscript Support</p>
      </Card>
    </div>
  );

  const renderStep05 = () => (
    <div className="space-y-8">
        <button 
          onClick={() => setStep(0)}
          className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Language
        </button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'Inscript', name: 'Mangal Inscript', sub: 'Official Government Standard' }
          ].map((layout) => (
            <Card 
              key={layout.id}
              onClick={() => {
                  setSelectedLayout(layout.id as any);
                  setStep(selectedModule ? 2 : 1);
              }}
              className="p-8 rounded-[2rem] cursor-pointer hover:shadow-xl transition-all text-center border-slate-100 group hover:border-primary/50"
            >
              <h4 className="text-xl font-black text-slate-900 mb-2">{layout.name}</h4>
              <p className="text-xs font-bold text-slate-400">
                {layout.sub}
              </p>
            </Card>
          ))}
        </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-8">
      <button 
          onClick={() => setStep(0)}
          className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Change Language Selection
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((m) => (
          <Card 
            key={m.id}
            onClick={() => handleModuleSelect(m.id)}
            className="group cursor-pointer p-6 rounded-[2rem] border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 flex flex-col relative overflow-hidden"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg", m.color)}>
              <m.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors">{m.title}</h3>
            <p className="text-[11px] font-bold text-slate-400 leading-relaxed mb-6 line-clamp-2">{m.description}</p>
            <div className="mt-auto flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
              Get Started <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => {
    if (selectedModule === 'SPECIAL') {
        const diffOptions = [
            { id: 'Easy', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'hover:border-emerald-500' },
            { id: 'Medium', icon: Target, color: 'text-amber-500', bg: 'bg-amber-50', border: 'hover:border-amber-500' },
            { id: 'Hard', icon: Flame, color: 'text-rose-500', bg: 'bg-rose-50', border: 'hover:border-rose-500' }
        ];

        return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button 
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Modules
                </button>

                <div className="text-center space-y-4">
                    <h3 className="text-3xl font-black text-slate-900">Select Difficulty Level</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Choose the challenge that fits your skill</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {diffOptions.map((diff) => (
                        <Card 
                            key={diff.id}
                            onClick={() => {
                                setSelectedDifficulty(diff.id as any);
                                setStep(3);
                            }}
                            className={cn(
                                "p-8 rounded-[2.5rem] cursor-pointer shadow-sm transition-all duration-300 text-center border-2 border-slate-100 group flex flex-col items-center",
                                diff.border,
                                "hover:shadow-xl hover:-translate-y-2"
                            )}
                        >
                            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110", diff.bg)}>
                                <diff.icon className={cn("w-10 h-10", diff.color)} />
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 mb-2">{diff.id}</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {diff.id === 'Easy' ? '25-35 WPM' : diff.id === 'Medium' ? '35-45 WPM' : '45+ WPM'}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (loadingTaxonomy) {
      return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Loading Library...</div>;
    }

    const categories = selectedModule === 'WORD' ? dynamicWordCategories : 
                       selectedModule === 'BOOK' ? dynamicBookCategories :
                       dynamicSpecialCategories;
    
    return (
      <div className="space-y-8">
        <button 
          onClick={() => setStep(1)}
          className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Modules
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c: any) => (
            <Card 
              key={c.id}
              onClick={() => handleCategorySelect(c.id)}
              className="p-6 rounded-3xl border-slate-100 shadow-sm hover:shadow-xl cursor-pointer hover:border-primary/20 transition-all flex items-center justify-between group"
            >
              <div>
                <h4 className="font-black text-slate-900 text-lg">{c.title}</h4>
                {c.description && <p className="text-xs font-bold text-slate-400 mt-1">{c.description}</p>}
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Card>
          ))}
          {categories.length === 0 && (
            <div className="col-span-full py-16 text-center space-y-6 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <div className="space-y-2">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                  {selectedLanguage} {selectedModule?.toLowerCase()} content Not available, come back after latter.
                </p>
                <p className="text-slate-500 text-sm font-medium">The content you are looking for might be added soon.</p>
              </div>
              <Button 
                onClick={() => setStep(0)} 
                variant="outline"
                className="rounded-xl border-2 border-slate-100 hover:border-primary hover:text-primary font-bold"
              >
                Change Language Selection
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderStep3 = () => {
      if (loadingContent) {
          return <div className="text-center py-20 text-slate-400 font-bold animate-pulse">Loading Content...</div>;
      }

      let options: { id: string, title: string, subtitle?: string, isLong?: boolean }[] = [];
      
      if (selectedModule === 'WORD') {
          options = taxonomy.words
            .filter(w => w.category === selectedCategory && w.language === selectedLanguage)
            .map(w => ({ id: w._id, title: w.name || w.value, isLong: false }));
      } else if (selectedModule === 'SPECIAL') {
          options = specialExams.map(e => ({
              id: e._id,
              title: e.title,
              subtitle: 'Special Topic',
              isLong: true
          }));
      } else if (selectedModule === 'BOOK') {
          options = bookChapters.map(c => ({
              id: c._id,
              title: c.title,
              subtitle: 'Chapter Practice',
              isLong: true
          }));
      }

      const isLongLayout = options[0]?.isLong;

      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <button 
                onClick={() => {
                    if (selectedModule === 'SPECIAL') setStep(1);
                    else setStep(2);
                }}
                className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
            >
                <ArrowLeft className="w-4 h-4" /> Back to {selectedModule === 'SPECIAL' ? 'Modules' : 'Categories'}
            </button>

            {selectedModule === 'SPECIAL' && (
                <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <div className="flex rounded-xl overflow-hidden border border-slate-200">
                        <button 
                            onClick={() => setSelectedLanguage('English')}
                            className={cn(
                                "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedLanguage === 'English' ? "bg-slate-900 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => {
                                setSelectedLanguage('Hindi');
                                setSelectedLayout('Inscript');
                            }}
                            className={cn(
                                "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedLanguage === 'Hindi' ? "bg-slate-900 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            Hindi
                        </button>
                    </div>

                    <div className="flex rounded-xl overflow-hidden border border-slate-200">
                        {['Easy', 'Medium', 'Hard'].map((diff) => (
                            <button 
                                key={diff}
                                onClick={() => setSelectedDifficulty(diff as any)}
                                className={cn(
                                    "px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all",
                                    selectedDifficulty === diff ? "bg-primary text-white" : "bg-white text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                {diff}
                            </button>
                        ))}
                    </div>
                </div>
            )}
          </div>
          
          <div className={cn("grid gap-4", isLongLayout ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-4 lg:grid-cols-6")}>
             {options.map((opt) => (
                 <button
                    key={opt.id}
                    onClick={() => {
                        if (selectedModule === 'SPECIAL') {
                            router.push(`/typing/exam/${opt.id}?lang=${selectedLanguage}&layout=${selectedLayout}`);
                            return;
                        }
                        const modulePath = selectedModule?.toLowerCase();
                        router.push(`/typing/exam?type=${modulePath}&val=${opt.id}&lang=${selectedLanguage}&layout=${selectedLayout}`);
                    }}
                    className={cn(
                        "rounded-[2rem] bg-white border border-slate-100 shadow-sm flex items-center justify-center font-black text-sm transition-all group active:scale-95",
                        isLongLayout 
                            ? "p-6 flex-col items-start text-left h-auto hover:border-primary hover:shadow-xl group-hover:bg-slate-50" 
                            : "h-20 px-4 hover:bg-primary hover:text-white hover:shadow-xl text-center"
                    )}
                 >
                    {isLongLayout ? (
                        <div className="flex flex-col items-start w-full">
                            <span className="text-lg font-bold text-slate-900 group-hover:text-primary leading-tight mb-3 line-clamp-2">{opt.title}</span>
                            <div className="mt-auto flex items-center justify-between w-full">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{opt.subtitle}</span>
                                <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                   <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ) : (
                        opt.title
                    )}
                 </button>
             ))}
             {options.length === 0 && (
                 <div className="col-span-full py-20 text-center space-y-6 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                     <div className="space-y-2">
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                             {loadingContent ? 'Fetching relevant content...' : `${selectedLanguage} content Not available, come back after latter.`}
                         </p>
                         {!loadingContent && <p className="text-slate-500 text-sm font-medium">This book or category might be added soon.</p>}
                     </div>
                     {!loadingContent && (
                        <Button 
                            onClick={() => setStep(0)} 
                            variant="outline"
                            className="rounded-xl border-2 border-slate-100 hover:border-primary hover:text-primary font-bold"
                        >
                            Change Language Selection
                        </Button>
                     )}
                 </div>
             )}
          </div>
        </div>
      )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-16">
        <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
            Selection <span className="text-primary">Center</span>
        </h2>
        <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">
            {step < 1 ? 'Choose Language & Layout' : 'Choose your practice module to begin training'}
        </p>
      </div>

      {step === 0 && renderStep0()}
      {step === 0.5 && renderStep05()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </div>
  );
}
