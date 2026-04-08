import { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Dumbbell, Play, Menu, X, Trash2, Salad, ScrollText, Timer, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';
import { User } from 'lucide-react';

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

    const handleReset = () => {
        resetStore();
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <div className="flex flex-col min-h-screen relative overflow-hidden">
            {/* Header */}
            <header className="glass fixed top-0 left-0 right-0 z-50 h-16 px-4 flex justify-between items-center">
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
                        >
                            <Menu size={22} />
                        </button>
                    )}
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "fixed inset-0 bg-black/95 z-60 backdrop-blur-xl transition-all duration-300 flex flex-col items-center justify-center space-y-8",
                isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <button
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white"
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
            {showResetConfirm && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
                    <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4 animate-in zoom-in-95 duration-200">
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
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 pt-20 pb-28 px-4 max-w-lg mx-auto w-full">
                <Outlet />
            </main>

            {/* Bottom Nav — swaps to Session Locked bar when workout active */}
            {isSessionLocked ? (
                <div className="glass fixed bottom-4 left-4 right-4 h-16 rounded-2xl flex items-center justify-between z-50 max-w-lg mx-auto shadow-2xl shadow-black/50 px-5 border border-primary/30 bg-primary/5">
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
                    >
                        <Timer size={14} /> Resume
                    </button>
                </div>
            ) : (
                <nav className="glass fixed bottom-4 left-4 right-4 h-16 rounded-2xl flex items-center justify-around z-50 max-w-lg mx-auto shadow-2xl shadow-black/50 px-2">
                    {/* M4: increased label from text-[9px] to text-[11px] (WCAG min) */}
                    <NavLink to="/" className={navLinkClass} end>
                        <Home size={20} />
                        <span className="text-[11px] mt-0.5 font-semibold">Home</span>
                    </NavLink>
                    <NavLink to="/workouts" className={navLinkClass}>
                        <Dumbbell size={20} />
                        <span className="text-[11px] mt-0.5 font-semibold">Train</span>
                    </NavLink>

                    {/* Center floating Play button */}
                    <div className="relative -top-6">
                        <NavLink
                            to="/active"
                            className={({ isActive }) => cn(
                                "flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-tr from-primary to-orange-400 text-black shadow-lg shadow-primary/30 transition-all active:scale-95 border-4 border-[#07080f]",
                                isActive ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-[#07080f]" : "hover:scale-105"
                            )}
                        >
                            <Play size={22} fill="currentColor" className="ml-0.5" />
                        </NavLink>
                    </div>

                    <NavLink to="/nutrition" className={navLinkClass}>
                        <Salad size={20} />
                        <span className="text-[11px] mt-0.5 font-semibold">Fuel</span>
                    </NavLink>
                    <NavLink to="/history" className={navLinkClass}>
                        <ScrollText size={20} />
                        <span className="text-[11px] mt-0.5 font-semibold">Log</span>
                    </NavLink>
                </nav>
            )}
        </div>
    );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) => cn(
    "flex flex-col items-center gap-0 p-2 rounded-xl transition-all duration-200",
    isActive ? "text-primary" : "text-zinc-500 hover:text-zinc-300"
);
