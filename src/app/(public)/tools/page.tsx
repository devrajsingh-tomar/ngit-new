"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Code2,
    Terminal,
    Cpu,
    ExternalLink,
    Sparkles,
    Play,
    Zap,
    Laptop,
    Globe,
    FileCode,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolItem {
    id: string;
    title: string;
    description: string;
    buttonText: string;
    url: string;
    icon: any;
    category: string;
    color: string;
    bg: string;
    badge: string;
    features: string[];
}

const toolsList: ToolItem[] = [
    {
        id: "html-editor",
        title: "HTML Editor",
        description: "Write, preview, and test HTML, CSS, and JavaScript web pages directly in your browser with real-time output rendering.",
        buttonText: "Open HTML Editor",
        url: "https://onecompiler.com/html",
        icon: Globe,
        category: "Web Development",
        color: "text-orange-600",
        bg: "bg-orange-50 border-orange-100",
        badge: "Web / Front-End",
        features: ["Live Preview", "HTML5 & CSS3 Support", "JavaScript Console", "Instant Save & Share"]
    },
    {
        id: "python-compiler",
        title: "Python Compiler",
        description: "Write and run Python 3 practical programs online with standard input/output support and instant execution feedback.",
        buttonText: "Open Python Compiler",
        url: "https://onecompiler.com/python",
        icon: Terminal,
        category: "Programming Language",
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-100",
        badge: "Python 3.x",
        features: ["Python 3 Runtime", "STDIN Input Support", "Fast Execution", "Clean Output Display"]
    },
    {
        id: "c-compiler",
        title: "C Compiler",
        description: "Compile and execute C programming language practical codes online without installing GCC compilers locally.",
        buttonText: "Open C Compiler",
        url: "https://onecompiler.com/c",
        icon: FileCode,
        category: "System Programming",
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-100",
        badge: "C / GCC",
        features: ["GCC Compiler", "Pointers & Data Structures", "Custom Test Inputs", "Syntax Highlighting"]
    },
    {
        id: "arduino-simulator",
        title: "Arduino Simulator",
        description: "Interactive online simulator to design circuit schematics, write Arduino C++ code, and simulate microcontrollers virtually.",
        buttonText: "Open Arduino Simulator",
        url: "https://wokwi.com/projects/new/arduino-uno",
        icon: Cpu,
        category: "Hardware & IoT",
        color: "text-purple-600",
        bg: "bg-purple-50 border-purple-100",
        badge: "Wokwi / Arduino Uno",
        features: ["Arduino Uno Board", "Sensors & LEDs Virtualization", "Real-Time Serial Monitor", "No Hardware Required"]
    }
];

export default function PublicToolsPage() {
    const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);

    const handleOpenUrl = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
    };

    return (
        <div className="py-12 bg-slate-50 min-h-screen">
            <div className="container-custom space-y-12 max-w-7xl mx-auto">
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-[3rem] p-8 md:p-14 relative overflow-hidden shadow-2xl border border-white/10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 max-w-3xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-primary-light text-xs font-black uppercase tracking-widest backdrop-blur-md">
                            <Sparkles className="w-4 h-4 text-amber-400" /> Virtual Labs & Online Compilers
                        </div>
                        
                        <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight italic">
                            Practical Online Tools
                        </h1>
                        
                        <p className="text-slate-300 text-base md:text-lg font-medium leading-relaxed">
                            Students can use the following online editors and simulators to write, run, and test their practical programs directly in the browser.
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-2">
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs font-bold text-slate-300">
                                <Laptop className="w-4 h-4 text-primary" /> Browser-Based
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs font-bold text-slate-300">
                                <Zap className="w-4 h-4 text-amber-400" /> Zero Setup Required
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl text-xs font-bold text-slate-300">
                                <ExternalLink className="w-4 h-4 text-emerald-400" /> Opens in New Tab
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {toolsList.map((tool) => {
                        const IconComponent = tool.icon;
                        return (
                            <div
                                key={tool.id}
                                className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                            >
                                <div className="space-y-6">
                                    {/* Top Badge & Icon */}
                                    <div className="flex items-center justify-between">
                                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-110 shadow-sm", tool.bg, tool.color)}>
                                            <IconComponent className="w-8 h-8" />
                                        </div>
                                        <Badge className="bg-slate-100 text-slate-700 border-none font-black text-xs px-3 py-1 uppercase tracking-wider rounded-xl">
                                            {tool.badge}
                                        </Badge>
                                    </div>

                                    {/* Title & Description */}
                                    <div>
                                        <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{tool.category}</div>
                                        <h2 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">
                                            {tool.title}
                                        </h2>
                                        <p className="text-slate-500 font-medium text-sm mt-3 leading-relaxed">
                                            {tool.description}
                                        </p>
                                    </div>

                                    {/* Feature Pills */}
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        {tool.features.map((feat, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <span className="truncate">{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="pt-8 mt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                                    <a
                                        href={tool.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1"
                                    >
                                        <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-primary text-white font-black text-xs uppercase tracking-widest gap-2 shadow-lg hover:shadow-primary/20 transition-all duration-300">
                                            <Play className="w-4 h-4 fill-white" />
                                            {tool.buttonText}
                                            <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
                                        </Button>
                                    </a>
                                    <Button
                                        variant="outline"
                                        onClick={() => setSelectedTool(selectedTool?.id === tool.id ? null : tool)}
                                        className="h-14 rounded-2xl border-2 border-slate-100 hover:border-slate-300 font-extrabold text-xs px-5 text-slate-700"
                                    >
                                        {selectedTool?.id === tool.id ? "Hide Frame" : "Quick View"}
                                    </Button>
                                </div>

                                {/* Embedded Preview Frame (Optional toggle) */}
                                {selectedTool?.id === tool.id && (
                                    <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl">
                                            <span className="text-xs font-bold text-slate-600 truncate">{tool.url}</span>
                                            <Button
                                                size="sm"
                                                onClick={() => handleOpenUrl(tool.url)}
                                                className="h-8 text-[10px] font-black uppercase rounded-lg gap-1.5"
                                            >
                                                Open Fullscreen <ExternalLink className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        <div className="w-full h-96 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-950 shadow-inner relative">
                                            <iframe
                                                src={tool.url}
                                                className="w-full h-full border-0"
                                                title={tool.title}
                                                allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
                                                sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
