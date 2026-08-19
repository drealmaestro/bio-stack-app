import type { MealPreset } from '../../data/nutrition';

export interface MealPresetCardProps {
    preset: MealPreset;
    onSelect: (preset: MealPreset) => void;
}

export function MealPresetCard({ preset, onSelect }: MealPresetCardProps) {
    return (
        <button
            type="button"
            onClick={() => onSelect(preset)}
            className="shrink-0 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/20 rounded-xl p-2.5 text-left transition-all tap-active max-w-[150px] cursor-pointer"
        >
            <div className="text-xs font-black text-amber-300 truncate">{preset.name}</div>
            <div className="text-[10px] text-zinc-300 font-bold mt-0.5">{preset.calories} kcal</div>
            <div className="text-[9px] text-zinc-400 font-semibold truncate">
                P{preset.protein_g}g C{preset.carbs_g}g F{preset.fat_g}g
            </div>
        </button>
    );
}
