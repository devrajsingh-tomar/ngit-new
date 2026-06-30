import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CTASection({ data, blocks }: { data: any, blocks: any[] }) {
    if (!blocks || blocks.length === 0) return null;

    // Use the first block as CTA content
    const cta = blocks[0];
    const extra = typeof cta.extra_data === 'string' ? JSON.parse(cta.extra_data || "{}") : (cta.extra_data || {});

    return (
        <div className={`container mx-auto px-4 lg:px-10 py-16 text-center ${extra.color || ""}`}>
            <div className={`rounded-[3rem] p-12 lg:p-16 relative overflow-hidden shadow-2xl ${cta.image ? "bg-slate-900" : "bg-primary"} text-white`}>
                {cta.image && (
                    <Image src={cta.image} alt="Background" fill className="opacity-20 object-cover mix-blend-overlay" />
                )}
                
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
                
                <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                    {cta.subtitle && (
                        <span className="bg-white/20 text-white font-bold uppercase tracking-wider text-xs px-4 py-2 rounded-full mb-4 inline-block backdrop-blur-sm shadow-sm">{cta.subtitle}</span>
                    )}
                    <h2 className="text-4xl md:text-5xl font-extrabold">{cta.title || "Ready to start?"}</h2>
                    <p className="text-xl text-white/90 font-medium">
                        {cta.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        {(cta.button_text || cta.button_link) && (
                            <Link href={cta.button_link || "#"}>
                                <Button size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold bg-white text-primary hover:bg-slate-100 rounded-full shadow-lg hover:scale-105 transition-transform">
                                    {cta.button_text || "Get Started"}
                                </Button>
                            </Link>
                        )}
                        {extra.secondary_button_text && (
                            <Link href={extra.secondary_button_link || "#"}>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold border-white/30 text-white hover:bg-white/10 rounded-full hover:scale-105 transition-transform">
                                    {extra.secondary_button_text} <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
