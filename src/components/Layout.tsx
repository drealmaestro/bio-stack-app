import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Play, Menu, X, Trash2, Salad, ScrollText, Timer, User } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { useActiveWorkoutStore } from '../store/useActiveWorkoutStore';
import { Dialog } from './ui/dialog';
import { RestTimerWidget } from './workout/RestTimerWidget';

export function Layout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const { resetStore, user } = useStore();
    const activeWorkout = useActiveWorkoutStore((state) => state.activeWorkout);
    const location = useLocation();
    const mainRef = useRef<HTMLElement>(null);

    const isSessionLocked = !!activeWorkout;

    // Scroll to top on route change to defeat browser scroll-restoration races
    useEffect(() => {
        const resetScroll = () => {
            if (mainRef.current) {
                mainRef.current.scrollTop = 0;
            }
        };
        resetScroll();
        const rAF = requestAnimationFrame(resetScroll);
        return () => cancelAnimationFrame(rAF);
    }, [location.pathname]);

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
        <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-zinc-950 flex md:items-center justify-center md:p-6 lg:p-12 w-full">
            <div className="w-full max-w-[400px] bg-background flex flex-col h-[100dvh] max-h-[100dvh] md:h-auto md:min-h-[850px] md:max-h-[90vh] relative overflow-hidden md:rounded-[3rem] md:border-[12px] border-zinc-900 md:shadow-[0_0_80px_-10px_rgba(60,207,148,0.15),0_0_0_1px_rgba(255,255,255,0.05)] md:ring-1 ring-white/10 mx-auto md:[transform:translate3d(0,0,0)]">
                {/* Header */}
                <header className={cn(
                    "absolute top-0 left-0 right-0 z-50 h-16 px-5 flex justify-between items-center transition-all duration-300",
                    scrolled ? "bg-slate-900/85 backdrop-blur-xl border-b border-slate-800/80 shadow-lg shadow-black/40" : "bg-transparent"
                )}>
                    <NavLink to="/" className="flex items-center gap-2 group cursor-pointer select-none">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-md shadow-primary/25">
                            <span className="font-black text-black text-xs tracking-tight">M</span>
                        </div>
                        <h1 className="text-sm font-black tracking-tight text-white group-hover:text-primary transition-colors">
                            el <span className="text-primary font-black group-hover:text-white transition-colors">Maestro</span>
                        </h1>
                    </NavLink>
                    <div className="flex items-center gap-2">
                        {/* Profile avatar → direct navigation to profile */}
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => cn(
                                "w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center font-black text-sm transition-all",
                                isActive
                                    ? "bg-primary text-black"
                                    : "bg-primary/20 text-primary hover:bg-primary/30"
                            )}
                            title="Profile"
                            aria-label="Open profile"
                        >
                            {() => (
                                user?.name ? (
                                    <span>{user.name[0].toUpperCase()}</span>
                                ) : (
                                    <User size={14} />
                                )
                            )}
                        </NavLink>
                        <button
                            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center hover:bg-white/5 transition-colors text-white cursor-pointer"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </header>

                {/* Mobile Menu Overlay */}
                <div className={cn(
                    "absolute inset-0 bg-black/95 z-60 backdrop-blur-xl transition-all duration-300 flex flex-col items-center justify-center space-y-8",
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-6 right-6 w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
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

                    <div className="absolute bottom-10 flex flex-col items-center gap-3">
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="flex items-center gap-2 text-destructive font-medium text-sm border border-destructive/20 px-4 py-2 rounded-full hover:bg-destructive/10"
                        >
                            <Trash2 size={16} /> Reset All Data
                        </button>
                        <div className="text-[10px] font-extrabold text-zinc-600 uppercase tracking-widest mt-1">
                            v1.4.0 (Action & UI/UX Engine)
                        </div>
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
                <main ref={mainRef} key={location.pathname} onScroll={handleScroll} className="flex-1 pt-20 pb-32 px-4 w-full overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-300 scroll-smooth">
                    <Outlet />
                </main>

                {/* Floating Persistent Rest Timer Widget */}
                <RestTimerWidget className={location.pathname === '/active' ? 'bottom-6' : 'bottom-24'} />

                {/* Bottom Navigation Bar */}
                {location.pathname !== '/active' && (
                    <nav className="bg-slate-900/85 backdrop-blur-2xl absolute bottom-6 left-5 right-5 h-16 rounded-2xl flex items-center justify-around z-50 shadow-[0_12px_40px_rgba(0,0,0,0.8)] px-2 border border-slate-800/80">
                        <NavLink to="/" className={navLinkClass} end>
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex flex-col items-center">
                                        <Home size={18} className={cn("transition-transform duration-300", isActive ? "-translate-y-1 text-primary" : "")} />
                                        <div className={cn("absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                                    </div>
                                    <span className="text-[10px] mt-0.5 font-bold tracking-tight">Home</span>
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/workouts" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex flex-col items-center">
                                        <Dumbbell size={18} className={cn("transition-transform duration-300", isActive ? "-translate-y-1 text-primary" : "")} />
                                        <div className={cn("absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                                    </div>
                                    <span className="text-[10px] mt-0.5 font-bold tracking-tight">Train</span>
                                </>
                            )}
                        </NavLink>

                        {/* Center floating Play / Active Session button */}
                        <div className="relative -top-5">
                            <NavLink
                                to="/active"
                                aria-label={isSessionLocked ? "Active workout session" : "Start workout"}
                                className={({ isActive }) => cn(
                                    "flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-sky-400 text-black shadow-lg shadow-primary/25 transition-all active:scale-90 border-4 border-slate-900",
                                    isActive ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-slate-950" : "hover:scale-105",
                                    isSessionLocked && !isActive ? "animate-pulse ring-2 ring-primary ring-offset-2 ring-offset-slate-950" : ""
                                )}
                            >
                                {isSessionLocked ? (
                                    <Timer size={18} className="text-black font-extrabold" />
                                ) : (
                                    <Play size={18} fill="currentColor" className="ml-0.5" />
                                )}
                            </NavLink>
                        </div>

                        <NavLink to="/nutrition" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex flex-col items-center">
                                        <Salad size={18} className={cn("transition-transform duration-300", isActive ? "-translate-y-1 text-primary" : "")} />
                                        <div className={cn("absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                                    </div>
                                    <span className="text-[10px] mt-0.5 font-bold tracking-tight">Fuel</span>
                                </>
                            )}
                        </NavLink>
                        <NavLink to="/history" className={navLinkClass}>
                            {({ isActive }) => (
                                <>
                                    <div className="relative flex flex-col items-center">
                                        <ScrollText size={18} className={cn("transition-transform duration-300", isActive ? "-translate-y-1 text-primary" : "")} />
                                        <div className={cn("absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary transition-all duration-300", isActive ? "opacity-100 scale-100" : "opacity-0 scale-0")} />
                                    </div>
                                    <span className="text-[10px] mt-0.5 font-bold tracking-tight">Log</span>
                                </>
                            )}
                        </NavLink>
                    </nav>
                )}
            </div>
        </div>
    );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) => cn(
    "flex flex-col items-center justify-center gap-0 min-w-[44px] min-h-[44px] p-1 rounded-xl transition-all duration-300 tap-active relative group",
    isActive ? "text-primary scale-105" : "text-zinc-500 hover:text-zinc-300"
);
