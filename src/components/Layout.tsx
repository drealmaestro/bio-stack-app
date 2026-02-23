import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Dumbbell, User, Play, Menu, X, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '../store/useStore';

export function Layout() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const { resetStore } = useStore();

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
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-orange-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <span className="font-black text-black text-lg">M</span>
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-white group-hover:text-primary transition-colors">el <span className="text-primary group-hover:text-white transition-colors">Maestro</span></h1>
                </NavLink>
                <Button size="icon" variant="ghost" className="text-white" onClick={() => setIsMenuOpen(true)}>
                    <Menu size={24} />
                </Button>
            </header>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "fixed inset-0 bg-black/95 z-60 backdrop-blur-xl transition-all duration-300 flex flex-col items-center justify-center space-y-8",
                isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}>
                <button
                    onClick={() => setIsMenuOpen(false)}
                    className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white"
                >
                    <X size={32} />
                </button>

                <nav className="flex flex-col items-center gap-6 text-2xl font-bold">
                    <NavLink to="/" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => isActive ? "text-primary" : "text-white"}>Home</NavLink>
                    <NavLink to="/workouts" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => isActive ? "text-primary" : "text-white"}>Workouts</NavLink>
                    <NavLink to="/history" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => isActive ? "text-primary" : "text-white"}>History</NavLink>
                    <NavLink to="/profile" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => isActive ? "text-primary" : "text-white"}>Profile</NavLink>
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
                        <p className="text-sm text-zinc-400">This will permanently delete all workouts, logs, and your profile. This cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="flex-1 py-2.5 rounded-xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex-1 py-2.5 rounded-xl bg-destructive text-white text-sm font-bold hover:bg-destructive/80 transition-colors"
                            >
                                Reset Everything
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 pt-20 pb-24 px-4 max-w-lg mx-auto w-full animate-in fade-in duration-500">
                <Outlet />
            </main>

            {/* Bottom Nav */}
            <nav className="glass fixed bottom-4 left-4 right-4 h-16 rounded-2xl flex items-center justify-around z-50 max-w-lg mx-auto shadow-2xl shadow-black/50">
                <NavLink to="/" className={navLinkClass}>
                    <Home size={20} />
                </NavLink>
                <NavLink to="/workouts" className={navLinkClass}>
                    <Dumbbell size={20} />
                </NavLink>
                <div className="relative -top-6">
                    <NavLink
                        to="/active"
                        className={({ isActive }) => cn(
                            "flex items-center justify-center w-14 h-14 rounded-full bg-linear-to-tr from-primary to-orange-400 text-black shadow-lg shadow-primary/20 transition-transform active:scale-95 border-4 border-black",
                            isActive ? "scale-110 shadow-primary/40 ring-2 ring-primary ring-offset-2 ring-offset-black" : ""
                        )}
                    >
                        <Play size={24} fill="currentColor" className="ml-1" />
                    </NavLink>
                </div>
                <NavLink to="/history" className={navLinkClass}>
                    <div className="flex flex-col items-center">
                        <span className="text-lg font-bold leading-none">Log</span>
                    </div>
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                    <User size={20} />
                </NavLink>
            </nav>
        </div>
    );
}

const navLinkClass = ({ isActive }: { isActive: boolean }) => cn(
    "p-3 rounded-xl transition-all duration-300",
    isActive ? "text-primary bg-white/5" : "text-zinc-500 hover:text-zinc-300"
);

// Minimal Button for Header
function Button({ className, variant, size, ...props }: any) {
    return <button className={cn("p-2 rounded-md hover:bg-white/5 transition-colors", className)} {...props} />
}
