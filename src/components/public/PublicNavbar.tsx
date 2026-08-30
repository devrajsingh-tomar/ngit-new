"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, LogIn, User, LayoutDashboard, LogOut, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getHeaderFooterData } from "@/app/actions/layoutContent";
import { signOut } from "next-auth/react";
import { useSafeSession } from "@/lib/useSafeSession";
import { usePathname } from "next/navigation";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getDashboardRoute } from "@/lib/role-routing";

type NavLink = {
    label: string;
    href: string;
};

interface HeaderData {
    navigation?: NavLink[];
    logoImage?: string;
    logoText?: string;
    ctaButton?: NavLink;
}

interface PublicNavbarProps {
    initialData?: HeaderData | null;
}

export default function PublicNavbar({ initialData }: PublicNavbarProps) {
    const { data: session } = useSafeSession();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [headerData, setHeaderData] = useState<HeaderData | null>(initialData || null);

    useEffect(() => {
        let isMounted = true;
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        if (!initialData) {
            getHeaderFooterData().then(res => {
                if (isMounted && res.success) setHeaderData(res.header);
            });
        }

        return () => {
            isMounted = false;
            window.removeEventListener("scroll", handleScroll);
        };
    }, [initialData]);

    const navLinks: NavLink[] = [
        { label: "Home", href: "/" },
        { label: "Courses", href: "https://student.ngitedu.com/" },
        { label: "Typing Tests", href: "/typing" },
        { label: "ShortHand", href: "/steno" },
        { label: "Practical Tools", href: "/tools" },
        { label: "Online Admission", href: "/enroll" },
        { label: "Contact", href: "/contact" },
    ];

    return (
        <nav className={cn(
            "sticky top-0 z-50 w-full transition-all duration-300",
            isScrolled
                ? "bg-white/95 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-slate-100 py-2.5"
                : "bg-white py-4 border-b border-transparent"
        )}>
            <div className="container-custom">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        {headerData?.logoImage ? (
                            <img src={headerData.logoImage} alt="Logo" className="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]" />
                        ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-md group-hover:scale-105 transition-transform duration-300">
                                N
                            </div>
                        )}
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-1">
                        <div className="flex items-center gap-0.5">
                            {navLinks.map((link, idx) => {
                                const isExternal = link.href.startsWith("http");
                                const isActive = !isExternal && (pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href)));
                                const linkClass = cn(
                                    "px-2.5 xl:px-3.5 py-2 text-[13px] xl:text-[14px] whitespace-nowrap font-bold rounded-lg transition-all relative group",
                                    isActive 
                                        ? "text-primary bg-primary/5" 
                                        : "text-slate-600 hover:text-primary hover:bg-primary/5"
                                );

                                if (isExternal) {
                                    return (
                                        <a
                                            key={idx}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={linkClass}
                                        >
                                            {link.label}
                                            <span className="absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-primary transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100"></span>
                                        </a>
                                    );
                                }

                                return (
                                    <Link
                                        key={idx}
                                        href={link.href}
                                        className={linkClass}
                                    >
                                        {link.label}
                                        <span className={cn(
                                            "absolute bottom-1 left-3.5 right-3.5 h-[2px] bg-primary transition-transform duration-300 origin-left",
                                            isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                                        )}></span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200">
                            <Link href="/notices">
                                <Button variant="ghost" size="icon" className="relative w-10 h-10 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all" title="Official Notices">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full" />
                                </Button>
                            </Link>
                            
                            {session ? (
                                <div className="flex items-center gap-3">
                                    {session.user.role === "STUDENT" ? (
                                        <Link href="/student">
                                            <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-4 py-2 rounded-xl transition-all duration-300 shadow-sm shadow-primary/5">
                                                <LayoutDashboard className="w-4 h-4" />
                                                My Dashboard
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link href={getDashboardRoute(session.user.role)}>
                                            <Button 
                                                onClick={() => {
                                                    window.location.href = getDashboardRoute(session.user.role);
                                                }}
                                                variant="outline" 
                                                className="gap-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-4 py-2 rounded-xl transition-all duration-300 shadow-sm shadow-primary/5 cursor-pointer"
                                            >
                                                <LayoutDashboard className="w-4 h-4" />
                                                Admin Panel
                                            </Button>
                                        </Link>
                                    )}

                                <div className="relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button type="button" className="flex items-center gap-3 hover:bg-slate-50 p-1 rounded-xl transition-all group border border-transparent hover:border-slate-100 outline-none">
                                                <div className="text-right hidden xl:block">
                                                    <p className="text-xs font-black text-slate-800 leading-none group-hover:text-primary transition-colors">
                                                        {session.user.name}
                                                    </p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                                        {session.user.role}
                                                    </p>
                                                </div>
                                                {session.user.image ? (
                                                     <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-slate-200 shadow-sm flex items-center justify-center">
                                                         <img 
                                                             src={session.user.image} 
                                                             alt={session.user.name || "Profile"} 
                                                             className="h-full w-full object-cover"
                                                         />
                                                     </div>
                                                 ) : (
                                                     <div className="relative h-9 w-9 rounded-lg p-0 flex items-center justify-center bg-slate-900 text-white font-bold group-hover:bg-primary transition-colors shadow-sm text-sm">
                                                         {session.user.name?.[0]}
                                                     </div>
                                                 )}
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-64 rounded-2xl p-2" align="end" sideOffset={8}>
                                            <DropdownMenuLabel className="font-normal p-4">
                                                <div className="flex flex-col space-y-1">
                                                    <p className="text-sm font-black leading-none text-slate-900">{session.user.name}</p>
                                                    <p className="text-xs font-medium leading-none text-slate-500 mt-1">{session.user.email}</p>
                                                    <Badge className="w-fit mt-2 bg-emerald-50 text-emerald-600 border-none shadow-none text-[10px] font-black">{session.user.role}</Badge>
                                                </div>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="rounded-xl p-3 font-bold text-slate-600 focus:text-primary focus:bg-primary/5 cursor-pointer" asChild>
                                                <Link href={session.user.role === 'STUDENT' ? '/student/settings' : '/admin/settings'}>
                                                    <User className="mr-3 h-4 w-4" /> Profile Details
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl p-3 font-bold text-rose-600 focus:text-rose-700 focus:bg-rose-50 cursor-pointer" onClick={() => signOut()}>
                                                <LogOut className="mr-3 h-4 w-4" /> Sign out
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                </div>
                             ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/enroll">
                                        <Button className="gap-2 bg-primary hover:bg-primary-dark text-white font-black px-4 py-2 transition-all duration-300 rounded-xl shadow-md shadow-primary/20 text-xs uppercase tracking-wider">
                                            Online Admission
                                        </Button>
                                    </Link>
                                    <Link href="/student/login">
                                        <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary hover:text-white font-bold px-4 py-2 transition-all duration-300 rounded-xl text-xs">
                                            <LogIn className="w-4 h-4" />
                                            Login
                                        </Button>
                                    </Link>
                                </div>
                             )}
                        </div>
                    </div>

                    {/* Mobile Menu Controls */}
                    <div className="flex lg:hidden items-center gap-1">
                        <Link href="/notices">
                            <Button variant="ghost" size="icon" className="relative w-10 h-10 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-full transition-all" title="Official Notices">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full" />
                            </Button>
                        </Link>
                        <button
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden mt-4 pb-4 border-t pt-4 animate-slide-up">
                        <div className="flex flex-col space-y-1">
                            {navLinks.map((link, idx) => {
                                const isExternal = link.href.startsWith("http");
                                const isActive = !isExternal && (pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href)));
                                const linkClass = cn(
                                    "text-base font-bold py-2.5 px-4 rounded-xl transition-colors",
                                    isActive 
                                        ? "text-primary bg-primary/5" 
                                        : "text-slate-600 hover:bg-slate-50"
                                );

                                if (isExternal) {
                                    return (
                                        <a
                                            key={idx}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={linkClass}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.label}
                                        </a>
                                    );
                                }

                                return (
                                    <Link
                                        key={idx}
                                        href={link.href}
                                        className={linkClass}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                );
                            })}
                            <div className="flex flex-col gap-3 pt-4 border-t">
                                {session ? (
                                    <>
                                        <div className="px-4 py-2 border rounded-2xl bg-slate-50 flex items-center gap-3">
                                             {session.user.image ? (
                                                 <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200">
                                                     <img 
                                                         src={session.user.image} 
                                                         alt={session.user.name || "Profile"} 
                                                         className="h-full w-full object-cover"
                                                     />
                                                 </div>
                                             ) : (
                                                 <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold">
                                                     {session.user.name?.[0]}
                                                 </div>
                                             )}
                                            <div>
                                                <p className="text-sm font-bold">{session.user.name}</p>
                                                <p className="text-xs text-slate-500">{session.user.role}</p>
                                            </div>
                                        </div>
                                        <Link href={getDashboardRoute(session.user.role)} onClick={() => setIsOpen(false)}>
                                            <Button 
                                                onClick={() => {
                                                    window.location.href = getDashboardRoute(session.user.role);
                                                }}
                                                className="w-full gap-2 rounded-xl h-12 font-bold"
                                            >
                                                Go to Dashboard
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" className="w-full text-rose-600 font-bold" onClick={() => signOut()}>
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <Link href="/student/login" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full gap-2 justify-center border-primary text-primary hover:bg-primary hover:text-white font-bold h-12 rounded-xl transition-all duration-300" variant="outline">
                                            <LogIn className="w-4 h-4" />
                                            Student Portal Login
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
