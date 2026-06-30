import { getDynamicPageData } from "@/app/actions/cms";
import DynamicRenderer from "@/components/public/DynamicRenderer";
import { Camera, ImageIcon } from "lucide-react";
import Image from "next/image";
import { getGalleryImages } from "@/app/actions/upload";

const staticFallbackContent = (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
        <div className="container mx-auto px-4 lg:px-10">
            <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold uppercase tracking-widest text-sm">
                    <Camera className="w-5 h-5" /> NGIT Life
                </div>
                
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-tight">
                    Our Gallery
                </h1>

                <p className="text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                    Take a visual tour of our vibrant campus life, modern infrastructure, dynamic events, and the remarkable achievements of our students.
                </p>
            </div>
        </div>
    </div>
);

export default async function PublicGalleryPage() {
    const [dynamicData, galleryRes] = await Promise.all([
        getDynamicPageData("gallery"),
        getGalleryImages()
    ]);
    
    const cmsSections = dynamicData.success && dynamicData.sections ? dynamicData.sections : [];
    const ALLOWED_GALLERY_CATEGORIES = ["Campus", "Events", "Students", "Faculty"];
    const galleryImages = (galleryRes.success ? galleryRes.images : [])
        .filter((img: any) => 
            img.category && ALLOWED_GALLERY_CATEGORIES.some(cat => cat.toLowerCase() === img.category.toLowerCase())
        );

    return (
        <div className="min-h-screen">
            <DynamicRenderer 
                sections={cmsSections} 
                staticFallback={staticFallbackContent} 
                extraData={{ gallery: galleryImages }}
            />
        </div>
    );
}
