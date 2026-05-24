import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Play, Menu, X, Trash2, Salad, ScrollText, Timer, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { User } from 'lucide-react';
import { Dialog } from './ui/dialog';

export function Layout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const { resetStore, user, activeWorkout, templates } = useStore();
    const location = useLocation();
    const navigate = useNavigate();

    const isSessionLocked = !!activeWorkout;
    const activeTemplateName = isSessionLocked
        ? templates.find(t => t.id === activeWorkout.templateId)?.name ?? 'Workout'
        : '';

    // SESSION LOCK: redirect to /active whenever a workout is in progress
    useEffect(() => {
        if (isSessionLocked && location.pathname !== '/active') {
            navigate('/active', { replace: true });
        }
    }, [isSessionLocked, location.pathname, navigate]);

    const [scrolled, setScrolled] = useState(false);

    const handleReset = () => {
        resetStore();
        localStorage.removeItem('bio-stack-storage');
        window.location.href = "/";
    };

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        setScrolled(e.currentTarget.scrollTop > 20);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex md:items-center justify-center md:p-6 lg:p-12">
            <div className="w-full max-w-[400px] bg-background flex flex-col min-h-screen md:min-h-[850px] md:max-h-[90vh] relative overflow-hidden md:rounded-[3rem] md:border-[12px] border-zinc-900 md:shadow-[0_0_80px_-20px_rgba(0,212,255,0.15)] md:ring-1 ring-white/10 mx-auto md:[transform:translate3d(0,0,0)]">
            {/* Header */}
            <header className={cn(
                "absolute top-0 left-0 right-0 z-50 h-16 px-4 flex justify-between items-center transition-all duration-300",
                scrolled ? "bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/20" : "bg-transparent"
            )}>
                <NavLink to="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-8 h-8 rounded-xl bg-linear-to-br from-primary to-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-primary/20">
                        <span className="font-black text-black text-base">M</span>
                    </div>
                    <h1 className="text-lg font-black tracking-tight text-white group-hover:text-primary transition-colors">
                        el <span className="text-primary group-hover:text-white transition-colors">Maestro</span>
                    </h1>
                </NavLink>
                <div className="flex items-center gap-2">
                    {/* C1: Profile avatar → direct navigation to profile */}
                    <NavLink
                        to="/profile"
                        className={({ isActive }) => cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-all",
                            isActive
                                ? "bg-primary text-black"
                                : "bg-primary/20 text-primary hover:bg-primary/30"
                        )}
                        title="Profile"
                        aria-label="Open profile"
                    >
                        {({ isActive: _ia }) => (
                            user?.name ? (
                                <span>{user.name[0].toUpperCase()}</span>
                            ) : (
                                <User size={14} />
                            )
                        )}
                    </NavLink>
                    {!isSessionLocked && (
                        <button
                            className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>
                    )}
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "absolute inset-0 bg-black/95 z-60 backdrop-blur-xl transition-all duration-300 flex flex-col items-center justify-center space-y-8",
                isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <button
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white"
                    aria-label="Close menu"
                >
                    <X size={28} />
                </button>

                <nav className="flex flex-col items-center gap-6 text-2xl font-black">
                    {[
                        { to: '/', label: 'Home' },
                        { to: '/workouts', label: 'Workouts' },
                        { to: '/nutrition', label: 'Nutrition' },
                        { to: '/history', label: 'History' },
                        { to: '/profile', label: 'Profile' },
                    ].map(({ to, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) => isActive ? 'text-primary' : 'text-white hover:text-primary/80 transition-colors'}
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-10 flex flex-col items-center gap-4">
                    <button
                        onClick={() => setShowResetConfirm(true)}
                        className="flex items-center gap-2 text-destructive font-medium text-sm border border-destructive/20 px-4 py-2 rounded-full hover:bg-destructive/10"
                    >
                        <Trash2 size={16} /> Reset All Data
                    </button>
                </div>
            </div>

            {/* Reset Confirmation Dialog */}
            <Dialog
                open={showResetConfirm}
                title="Reset all data"
                onClose={() => setShowResetConfirm(false)}
            >
                        <h3 className="text-lg font-black text-white">Reset All Data?</h3>
                        <p className="text-sm text-zinc-400">This will permanently delete all workouts, logs, nutrition and your profile. Cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-bold hover:bg-red-700 transition-colors"
                            >
                                Reset Everything
                            </button>
                        </div>
            </Dialog>

            {/* Main Content */}
            <main key={location.pathname} onScroll={handleScroll} className="flex-1 pt-20 pb-28 px-4 w-full overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300 scroll-smooth">
                <Outlet />
            </main>

            {/* Bottom Nav — swaps to Session Locked bar when workout active */}
            {location.pathname !== '/active' && (
                isSessionLocked ? (
                    <div className="glass absolute bottom-4 left-4 right-4 h-16 rounded-2xl flex items-center justify-between z-50 shadow-2xl shadow-black/50 px-5 border border-primary/30 bg-primary/5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                                <Lock size={16} className="text-primary" />
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-primary">Session Active</div>
                                <div className="text-sm font-black text-white leading-tight">{activeTemplateName}</div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/active')}
                            className="flex items-center gap-2 bg-primary text-black font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition-transform active:scale-95"
                            aria-label="Resume active workout"
                        >
                            <Timer size={14} /> Resume
                        </button>
                    </div>
                ) : (
                    <nav className="glass absolute bottom-4 left-4 right-4 h-16 rounded-2xl flex items-center justify-around z-50 shadow-2xl shadow-black/50 px-2">
                        {/* M4: increased label from text-[9px] to text-[11px] (WCAG min) */}
                        <NavLink to="/" className={navLinkClass} end>
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex flex-col items-center">
                                        <Home size={20} className={cn("transition-transform duration-300", isActive ? "-translate-y-1 text-primary" : "")} />
                                        <div className={cn("absolute -bottom-2 w-1 h-1 rounded-full bg-primary transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                                    </div>
                                    <span className="text-[11px] mt-1 font-semibold">Home</span>
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/workouts" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex flex-col items-center">
                                        <Dumbbell size={20} className={cn("transition-transform duration-300", isActive ? "-translate-y-1 text-primary" : "")} />
                                        <div className={cn("absolute -bottom-2 w-1 h-1 rounded-full bg-primary transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                                    </div>
                                    <span className="text-[11px] mt-1 font-semibold">Train</span>
                                </>
                            )}
                        </NavLink>
    
                        {/* Center floating Play button */}
                        <div className="relative -top-6">
                            <NavLink
                                to="/active"
                                aria-label="Start workout"
                                className={({ isActive }) => cn(
                                    "flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-tr from-primary to-orange-400 text-black shadow-lg shadow-primary/30 transition-all active:scale-95 border-4 border-[#07080f]",
                                    isActive ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-[#07080f]" : "hover:scale-105"
                                )}
                            >
                                <Play size={22} fill="currentColor" className="ml-0.5" />
                            </NavLink>
                        </div>
    
                        <NavLink to="/nutrition" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex flex-col items-center">
                                        <Salad size={20} className={cn("transition-transform duration-300", isActive ? "-translate-y-1 text-primary" : "")} />
                                        <div className={cn("absolute -bottom-2 w-1 h-1 rounded-full bg-primary transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                                    </div>
                                    <span className="text-[11px] mt-1 font-semibold">Fuel</span>
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/history" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex flex-col items-center">
                                        <ScrollText size={20} className={cn("transition-transform duration-300", isActive ? "-translate-y-1 text-primary" : "")} />
                                        <div className={cn("absolute -bottom-2 w-1 h-1 rounded-full bg-primary transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                                    </div>
                                    <span className="text-[11px] mt-1 font-semibold">Log</span>
                                </>
                            )}
                        </NavLink>
                    </nav>
                )
            )}
            </div>
        </div>
    );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) => cn(
    "flex flex-col items-center gap-0 p-2 rounded-xl transition-all duration-300 tap-active relative group",
    isActive ? "text-primary scale-105" : "text-zinc-500 hover:text-zinc-300"
);
