import { useStore } from "../store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { Play, TrendingUp, Trophy, Calendar, Coffee, Dumbbell, Quote } from "lucide-react";

import { calculateAge, getDailyQuote } from "../lib/utils";

export function Home() {
    const { user, templates, logs } = useStore();

    // Calculate dynamic age
    const age = user?.birthday ? calculateAge(user.birthday) : (user?.age || 47);
    const dailyQuote = getDailyQuote();

    // ... (rest of the file)


    // 1. Calculate workouts this week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = logs.filter(log => new Date(log.timestamp) >= startOfWeek).length;

    // 2. Get last workout name
    const lastLog = logs[logs.length - 1]; // logs are appended, so last is latest
    const lastTemplateName = lastLog
        ? templates.find(t => t.id === lastLog.template_id)?.name
        : null;

    // 3. Schedule Logic
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[now.getDay()];

    // Map Days to Template IDs
    const schedule: Record<string, string | 'REST'> = {
        'Monday': 'tmpl_chest_tri_power',    // Chest & Tri Power
        'Tuesday': 'tmpl_back_bi_builder',   // Back & Bi Builder
        'Wednesday': 'REST',                 // Active Recovery
        'Thursday': 'tmpl_lower_foundation', // Lower Body
        'Friday': 'tmpl_shoulder_core',      // Shoulder & Core
        'Saturday': 'tmpl_chest_arms_vol',   // Chest & Arms Volume
        'Sunday': 'REST'                     // Rest
    };

    const targetId = schedule[currentDayName];
    const todayTemplate = targetId !== 'REST' ? templates.find(t => t.id === targetId) : null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                        Hello, <span className="text-primary">{user?.name?.split(' ')[0] || 'Maestro'}</span>
                    </h2>
                    <div className="text-xs font-bold text-primary/80 uppercase tracking-widest mt-1 mb-1">
                        Age {age} Hypertrophy Protocol
                    </div>
                    <p className="text-zinc-400 text-sm font-medium">
                        It's {currentDayName}. {targetId === 'REST' ? 'Time to recover.' : 'Time to crush it.'}
                    </p>
                </div>
                <Link to="/active">
                    <Button size="icon" className="rounded-2xl h-14 w-14 bg-primary text-black shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                        <Play fill="currentColor" size={24} />
                    </Button>
                </Link>
            </div>

            {/* Today's Target Card */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Calendar size={18} className="text-primary" />
                    <h3 className="text-lg font-bold text-white">Today's Protocol</h3>
                </div>

                {targetId === 'REST' ? (
                    <Card className="glass-card border-l-4 border-l-green-500 bg-green-500/5">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                <Coffee size={24} />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">Active Recovery</h4>
                                <p className="text-sm text-zinc-400">Total rest today. Light walk or stretch only.</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : todayTemplate ? (
                    <Link to="/active" onClick={() => {/* Set active template if needed via store, or let user pick on next screen (keeping valid "Quick Start" flow) */ }}>
                        {/* 
                            NOTE: In a real app we might auto-select this template in the store. 
                            For now, clicking this just goes to Active page which prompts selection.
                            Ideally, we'd pass state or use a store action to `setActiveTemplateId(todayTemplate.id)`.
                            However, the ActiveWorkout page currently handles selection. 
                            To make this seamless, we rely on the user picking it from the list or we'd refactor ActiveWorkout.
                            For now, let's keep it simple: visual guidance. 
                        */}
                        <Card className="glass-card border-l-4 border-l-primary group cursor-pointer hover:bg-white/5 transition-colors">
                            <CardContent className="p-6 flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Recommended</div>
                                    <h4 className="text-2xl font-black text-white group-hover:text-primary transition-colors">{todayTemplate.name}</h4>
                                    <div className="flex gap-4 mt-2 text-sm text-zinc-400">
                                        <span className="flex items-center gap-1"><Dumbbell size={14} /> {todayTemplate.exercises.length} Exercises</span>
                                        <span className="flex items-center gap-1"><TrendingUp size={14} /> {todayTemplate.exercises.length * 5} min</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                    <Play fill="currentColor" size={20} />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ) : (
                    <div className="p-4 border border-dashed border-zinc-800 rounded-lg text-zinc-500 text-center">
                        Schedule setup incomplete.
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Link to="/history">
                    <Card className="glass-card h-full group hover:bg-white/5 transition-colors">
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2 group-hover:text-primary transition-colors">
                                <TrendingUp size={14} /> Weekly Vol
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                            <div className="text-3xl font-black text-white">{workoutsThisWeek}</div>
                            <p className="text-[10px] text-zinc-400">Workouts completed</p>
                        </CardContent>
                    </Card>
                </Link>
                <Card className="glass-card">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Trophy size={14} /> Last Session
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-1">
                        <div className="text-lg font-bold text-white truncate leading-tight">
                            {lastTemplateName || "No Data"}
                        </div>
                        <p className="text-[10px] text-zinc-400">
                            {lastLog ? new Date(lastLog.timestamp).toLocaleDateString() : "Let's go!"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Daily Wisdom */}
            <Card className="glass-card bg-primary/5 border-primary/20">
                <CardContent className="p-6 relative overflow-hidden">
                    <Quote className="absolute top-2 right-4 text-primary/10 rotate-180" size={64} />
                    <p className="text-sm font-medium text-zinc-300 italic relative z-10">
                        "{dailyQuote}"
                    </p>
                </CardContent>
            </Card>

            {/* All Routines (Collapsed/Secondary) */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">All Templates</h3>
                    <Link to="/workouts" className="text-xs text-primary hover:underline">Manage</Link>
                </div>

                <div className="grid gap-3">
                    {templates.map((template) => (
                        <Link key={template.id} to="/active" className="block group">
                            <div className="glass-card p-3 rounded-xl flex justify-between items-center hover:bg-white/5 transition-colors">
                                <div className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">
                                    {template.name}
                                </div>
                                <div className="text-xs text-zinc-600">
                                    {template.exercises.length} Ex
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
