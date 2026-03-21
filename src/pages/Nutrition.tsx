import { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ProgressRing } from '../components/ui/progress-ring';
import { MacroBar } from '../components/ui/macro-bar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { COMMON_FOODS, DEFAULT_NUTRITION_GOALS } from '../data/nutrition';
import type { FoodItem } from '../types';
import { Plus, X, Flame, Search, Trash2 } from 'lucide-react';

function todayLabel() {
    return new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function Nutrition() {
    const { user, nutritionLogs, addNutritionEntry, deleteNutritionEntry } = useStore();
    const goals = user?.nutrition_goals ?? DEFAULT_NUTRITION_GOALS;

    // ── State declarations (must come before useEffect that references them) ──
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [servings, setServings] = useState(1);

    // M3: today date computed inside component and refreshed at midnight
    const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
    useEffect(() => {
        const msUntilMidnight = () => {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setDate(now.getDate() + 1);
            midnight.setHours(0, 0, 0, 0);
            return midnight.getTime() - now.getTime();
        };
        const timer = setTimeout(() => {
            setToday(new Date().toISOString().slice(0, 10));
        }, msUntilMidnight());
        return () => clearTimeout(timer);
    }, [today]);

    // H4: focus trap for modal
    const modalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!showAddModal) return;
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        first.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [showAddModal]);

    const todayLog = useMemo(() =>
        nutritionLogs.find(l => l.date === today),
        [nutritionLogs, today]
    );

    const totals = useMemo(() => {
        const entries = todayLog?.entries ?? [];
        return entries.reduce(
            (acc, e) => ({
                calories: acc.calories + e.calories,
                protein_g: acc.protein_g + e.protein_g,
                carbs_g: acc.carbs_g + e.carbs_g,
                fat_g: acc.fat_g + e.fat_g,
            }),
            { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
        );
    }, [todayLog]);

    const caloriePct = goals.calories > 0 ? totals.calories / goals.calories : 0;
    const remaining = Math.max(goals.calories - totals.calories, 0);

    const filtered = COMMON_FOODS.filter(f =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        if (!selectedFood) return;
        addNutritionEntry(today, {
            food_item_id: selectedFood.id,
            food_name: selectedFood.name,
            servings,
            calories: Math.round(selectedFood.calories * servings),
            protein_g: Math.round(selectedFood.protein_g * servings * 10) / 10,
            carbs_g: Math.round(selectedFood.carbs_g * servings * 10) / 10,
            fat_g: Math.round(selectedFood.fat_g * servings * 10) / 10,
        });
        setSelectedFood(null);
        setServings(1);
        setSearchQuery('');
        setShowAddModal(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">

            {/* Header */}
            <div>
                <div className="section-label mb-1">Nutrition</div>
                <h2 className="text-2xl font-black text-white">{todayLabel()}</h2>
            </div>

            {/* Calorie Ring Hero */}
            <Card className="glass-card overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 space-y-4">
                            <div>
                                <div className="text-4xl font-black text-white">{Math.round(totals.calories)}</div>
                                <div className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">kcal eaten</div>
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Goal</span>
                                    <span className="text-white font-bold">{goals.calories} kcal</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Remaining</span>
                                    <span className={`font-bold ${remaining === 0 ? 'text-warning' : 'text-success'}`}>
                                        {remaining} kcal
                                    </span>
                                </div>
                            </div>
                        </div>
                        <ProgressRing
                            size={130}
                            strokeWidth={12}
                            progress={caloriePct}
                            color="#00D4FF"
                            label={`${Math.round(caloriePct * 100)}%`}
                            sublabel="of goal"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Macros */}
            <Card className="glass-card">
                <CardContent className="p-5 space-y-5">
                    <div className="section-label">Macros</div>
                    <MacroBar
                        label="Protein"
                        current={totals.protein_g}
                        goal={goals.protein_g}
                        color="bg-[#a78bfa]"
                    />
                    <MacroBar
                        label="Carbs"
                        current={totals.carbs_g}
                        goal={goals.carbs_g}
                        color="bg-[#60a5fa]"
                    />
                    <MacroBar
                        label="Fat"
                        current={totals.fat_g}
                        goal={goals.fat_g}
                        color="bg-[#fb923c]"
                    />
                </CardContent>
            </Card>

            {/* Macro Pill Summary */}
            <div className="flex gap-2">
                {[
                    { label: 'P', value: totals.protein_g, color: 'bg-protein/20 text-protein' },
                    { label: 'C', value: totals.carbs_g, color: 'bg-carbs/20 text-carbs' },
                    { label: 'F', value: totals.fat_g, color: 'bg-fat/20 text-fat' },
                ].map(m => (
                    <div key={m.label} className={`macro-pill flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold ${m.color}`}>
                        {m.label} <span>{Math.round(m.value)}g</span>
                    </div>
                ))}
                <div className="macro-pill flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold bg-primary/10 text-primary ml-auto">
                    <Flame size={12} /> {Math.round(totals.calories)} kcal
                </div>
            </div>

            {/* Today's Log */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <div className="section-label">Today's Log</div>
                    <Button
                        size="sm"
                        onClick={() => setShowAddModal(true)}
                        className="h-8 gap-1 text-xs font-bold bg-primary text-black hover:bg-primary/90"
                    >
                        <Plus size={14} /> Add Food
                    </Button>
                </div>

                {!todayLog || todayLog.entries.length === 0 ? (
                    <div
                        className="glass-card p-8 flex flex-col items-center justify-center gap-3 cursor-pointer"
                        onClick={() => setShowAddModal(true)}
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Plus size={24} />
                        </div>
                        <p className="text-sm text-muted-foreground">Tap to log your first meal</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {todayLog.entries.map(entry => (
                            <div
                                key={entry.id}
                                className="glass-card p-4 flex justify-between items-center"
                            >
                                <div>
                                    <div className="font-bold text-white text-sm">{entry.food_name}</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                        {entry.servings > 1 ? `${entry.servings}x · ` : ''}
                                        <span className="text-protein">P {entry.protein_g}g</span>
                                        {' · '}
                                        <span className="text-carbs">C {entry.carbs_g}g</span>
                                        {' · '}
                                        <span className="text-fat">F {entry.fat_g}g</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="text-sm font-black text-primary">{entry.calories}</div>
                                        <div className="text-[10px] text-muted-foreground">kcal</div>
                                    </div>
                                    <button
                                        onClick={() => deleteNutritionEntry(today, entry.id)}
                                        className="text-zinc-600 hover:text-destructive transition-colors p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Food Modal — H4: focus trap via modalRef */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-end bg-black/70 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
                    <div ref={modalRef} className="w-full max-w-lg mx-auto bg-zinc-900 border border-white/10 rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom duration-300 pb-10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-black text-white">Add Food</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search foods..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                                autoFocus
                            />
                        </div>

                        {/* Selected Food + Servings */}
                        {selectedFood && (
                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-white">{selectedFood.name}</div>
                                        <div className="text-xs text-muted-foreground">{selectedFood.serving_label} per serving</div>
                                    </div>
                                    <button onClick={() => setSelectedFood(null)} className="text-zinc-500">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">Servings:</span>
                                    <button
                                        onClick={() => setServings(s => Math.max(0.5, s - 0.5))}
                                        className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center"
                                    >−</button>
                                    <span className="text-lg font-black text-white w-8 text-center">{servings}</span>
                                    <button
                                        onClick={() => setServings(s => s + 0.5)}
                                        className="w-8 h-8 rounded-full bg-white/10 text-white font-bold flex items-center justify-center"
                                    >+</button>
                                    <div className="ml-auto text-right">
                                        <div className="text-primary font-black">{Math.round(selectedFood.calories * servings)} kcal</div>
                                        <div className="text-[10px] text-muted-foreground">
                                            P {Math.round(selectedFood.protein_g * servings)}g · C {Math.round(selectedFood.carbs_g * servings)}g · F {Math.round(selectedFood.fat_g * servings)}g
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleAdd} className="w-full bg-primary text-black font-black">
                                    Log Food
                                </Button>
                            </div>
                        )}

                        {/* Food List */}
                        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                            {filtered.map(food => (
                                <button
                                    key={food.id}
                                    onClick={() => { setSelectedFood(food); setServings(1); }}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                                        selectedFood?.id === food.id
                                            ? 'bg-primary/10 border-primary/30'
                                            : 'bg-white/3 border-transparent hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-sm font-bold text-white">{food.name}</div>
                                            <div className="text-xs text-muted-foreground">{food.serving_label}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black text-primary">{food.calories} kcal</div>
                                            <div className="text-[10px] text-muted-foreground">
                                                P{Math.round(food.protein_g)} C{Math.round(food.carbs_g)} F{Math.round(food.fat_g)}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
