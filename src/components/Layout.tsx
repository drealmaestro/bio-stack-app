import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Dumbbell, Play, Trash2, Calendar, BarChart3, Timer, User, Menu, X } from 'lucide-react';
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

    useEffect(() => {
        const resetScroll = () => {
            if (mainRef.current) mainRef.current.scrollTop = 0;
        };
        resetScroll();
        const rAF = requestAnimationFrame(resetScroll);
        return () => cancelAnimationFrame(rAF);
    }, [location.pathname]);

    const handleReset = () => {
        resetStore();
        localStorage.removeItem('bio-stack-storage');
        window.location.href = "/";
    };

    return (
        <div className="h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#0d0f12] flex items-center justify-center w-full">
            <div className="w-full max-w-[420px] bg-[#0d0f12] flex flex-col h-[100dvh] max-h-[100dvh] relative overflow-hidden mx-auto border-x border-[#1a1e26]/50">
                {/* Stitch Kinetic Header */}
                <header className="absolute top-0 left-0 right-0 z-40 h-14 px-4 flex justify-between items-center bg-[#0d0f12]/95 backdrop-blur-md border-b border-[#1a1e26]">
                    <NavLink to="/" className="flex items-center gap-2 group cursor-pointer select-none">
                        <div className="w-6 h-6 rounded bg-[#ccff00] flex items-center justify-center">
                            <span className="font-display font-black text-[#0d0f12] text-xs">HT</span>
                        </div>
                        <h1 className="text-sm font-black tracking-wider text-[#e2e5eb] font-display uppercase">
                            HYPERTROPHY <span className="text-[#ccff00]">TRACKER</span>
                        </h1>
                    </NavLink>
                    
                    <div className="flex items-center gap-2">
                        {/* Offline-Sync Telemetry Badge */}
                        <div className="hidden xs:flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#14171d] border border-[#262b36]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse" />
                            <span className="text-[9px] font-bold text-[#8e95a5] uppercase tracking-wider font-mono">LOCAL CACHE</span>
                        </div>
                        <NavLink
                            to="/profile"
                            className={({ isActive }) => cn(
                                "w-7 h-7 rounded flex items-center justify-center text-xs font-bold transition-all border",
                                isActive ? "bg-[#ccff00] text-[#0d0f12] border-[#ccff00]" : "bg-[#14171d] text-[#8e95a5] border-[#262b36] hover:text-[#e2e5eb]"
                            )}
                            title="Profile"
                        >
                            {user?.name ? user.name[0].toUpperCase() : <User size={13} />}
                        </NavLink>
                        <button
                            className="p-1.5 rounded hover:bg-[#1a1e26] transition-colors text-[#8e95a5] hover:text-white"
                            onClick={() => setIsMenuOpen(true)}
                            aria-label="Menu"
                        >
                            <Menu size={18} />
                        </button>
                    </div>
                </header>

                {/* Mobile Drawer Menu */}
                <div className={cn(
                    "absolute inset-0 bg-[#0d0f12]/95 z-50 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between p-6",
                    isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}>
                    <div className="flex justify-between items-center border-b border-[#262b36] pb-4">
                        <span className="font-display font-black text-[#ccff00] tracking-wider uppercase">Menu</span>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-[#8e95a5] hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="space-y-4 my-auto">
                        <NavLink to="/" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 rounded bg-[#14171d] border border-[#262b36] text-lg font-display font-bold text-[#e2e5eb] hover:border-[#ccff00]">
                            01. SCHEDULE & SPLIT OVERVIEW
                        </NavLink>
                        <NavLink to="/workouts" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 rounded bg-[#14171d] border border-[#262b36] text-lg font-display font-bold text-[#e2e5eb] hover:border-[#ccff00]">
                            02. ROUTINE LIBRARY & MESOCYCLES
                        </NavLink>
                        <NavLink to="/active" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 rounded bg-[#14171d] border border-[#262b36] text-lg font-display font-bold text-[#e2e5eb] hover:border-[#ccff00]">
                            03. ACTIVE WORKOUT PLAYER
                        </NavLink>
                        <NavLink to="/history" onClick={() => setIsMenuOpen(false)} className="block py-3 px-4 rounded bg-[#14171d] border border-[#262b36] text-lg font-display font-bold text-[#e2e5eb] hover:border-[#ccff00]">
                            04. VOLUME & PR ANALYTICS
                        </NavLink>
                    </div>
                    <button
                        onClick={() => { setIsMenuOpen(false); setShowResetConfirm(true); }}
                        className="w-full py-3 rounded border border-[#ff3b30]/30 text-[#ff3b30] flex items-center justify-center gap-2 font-display font-bold text-sm"
                    >
                        <Trash2 size={16} /> RESET LOCAL DATA
                    </button>
                </div>

                {/* Reset Confirmation Dialog */}
                <Dialog open={showResetConfirm} onClose={() => setShowResetConfirm(false)} title="Reset App Data">
                    <p className="text-xs text-[#8e95a5] mb-4">Reset all local training history and mesocycle state? This cannot be undone.</p>
                    <div className="flex gap-2">
                        <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-2 rounded stitch-btn-ghost text-xs">CANCEL</button>
                        <button onClick={handleReset} className="flex-1 py-2 rounded bg-[#ff3b30] text-white font-display font-black text-xs">CONFIRM RESET</button>
                    </div>
                </Dialog>

                {/* Main Content Area */}
                <main ref={mainRef} className="flex-1 pt-16 pb-20 px-3 w-full overflow-y-auto scroll-smooth">
                    <Outlet />
                </main>

                {/* Floating Rest Timer Widget */}
                {location.pathname !== '/active' && <RestTimerWidget className="bottom-20" />}

                {/* Stitch Grounded Bottom Navigation Bar */}
                {location.pathname !== '/active' && (
                    <nav className="bg-[#0d0f12] absolute bottom-0 left-0 right-0 h-16 border-t border-[#1a1e26] flex items-center justify-around z-40 px-1">
                        <NavLink to="/" className={navItemClass} end>
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute top-0 left-2 right-2 h-[2px] bg-[#ccff00]" />}
                                    <Calendar size={18} className={cn("transition-colors", isActive ? "text-[#ccff00]" : "text-[#8e95a5]")} />
                                    <span className={cn("text-[10px] tracking-wider uppercase font-body mt-0.5", isActive ? "font-bold text-[#ccff00]" : "text-[#8e95a5]")}>SCHEDULE</span>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/workouts" className={navItemClass}>
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute top-0 left-2 right-2 h-[2px] bg-[#ccff00]" />}
                                    <Dumbbell size={18} className={cn("transition-colors", isActive ? "text-[#ccff00]" : "text-[#8e95a5]")} />
                                    <span className={cn("text-[10px] tracking-wider uppercase font-body mt-0.5", isActive ? "font-bold text-[#ccff00]" : "text-[#8e95a5]")}>ROUTINES</span>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/active" className={cn(navItemClass, "relative")}>
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute top-0 left-2 right-2 h-[2px] bg-[#ccff00]" />}
                                    <div className={cn("p-1.5 rounded transition-all", isSessionLocked ? "bg-[#ccff00] text-[#0d0f12] animate-pulse" : isActive ? "text-[#ccff00]" : "text-[#8e95a5]")}>
                                        {isSessionLocked ? <Timer size={18} /> : <Play size={18} fill={isActive ? "#ccff00" : "none"} />}
                                    </div>
                                    <span className={cn("text-[10px] tracking-wider uppercase font-body mt-0.5", isActive || isSessionLocked ? "font-bold text-[#ccff00]" : "text-[#8e95a5]")}>
                                        {isSessionLocked ? "SESSION" : "ACTIVE"}
                                    </span>
                                </>
                            )}
                        </NavLink>

                        <NavLink to="/history" className={navItemClass}>
                            {({ isActive }) => (
                                <>
                                    {isActive && <div className="absolute top-0 left-2 right-2 h-[2px] bg-[#ccff00]" />}
                                    <BarChart3 size={18} className={cn("transition-colors", isActive ? "text-[#ccff00]" : "text-[#8e95a5]")} />
                                    <span className={cn("text-[10px] tracking-wider uppercase font-body mt-0.5", isActive ? "font-bold text-[#ccff00]" : "text-[#8e95a5]")}>ANALYTICS</span>
                                </>
                            )}
                        </NavLink>
                    </nav>
                )}
            </div>
        </div>
    );
}

const navItemClass = ({ isActive }: { isActive: boolean }) => cn(
    "flex flex-col items-center justify-center flex-1 h-full relative transition-all duration-200 select-none",
    isActive ? "text-[#ccff00]" : "text-[#8e95a5] hover:text-[#e2e5eb]"
);
