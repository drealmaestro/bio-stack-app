import { User2 } from "lucide-react";
import { Input } from "../ui/input";
import { calculateAge, cn } from "../../lib/utils";

interface PersonalInfoCardProps {
    formData: {
        name: string;
        birthday: string;
        experience_level: string;
        goals: string[];
    };
    experienceOptions: string[];
    onUpdateForm: (updates: Partial<{ name: string; birthday: string; experience_level: string; goals: string[] }>) => void;
}

export function PersonalInfoCard({ formData, experienceOptions, onUpdateForm }: PersonalInfoCardProps) {
    return (
        <div className="glass-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <User2 size={16} className="text-primary" />
                <h3 className="text-base font-bold text-white">Personal Info</h3>
            </div>

            <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Name</label>
                <Input
                    value={formData.name}
                    onChange={e => onUpdateForm({ name: e.target.value })}
                    placeholder="Your name"
                    className="bg-white/5 border-white/10 text-white"
                />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Birthday</label>
                    <Input
                        type="date"
                        value={formData.birthday}
                        onChange={e => onUpdateForm({ birthday: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Age</label>
                    <div className="flex h-10 items-center px-3 rounded-md border border-white/10 bg-white/5 text-primary font-black text-xl">
                        {calculateAge(formData.birthday)}
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Experience Level</label>
                <div className="flex gap-2">
                    {experienceOptions.map(level => (
                        <button
                            key={level}
                            onClick={() => onUpdateForm({ experience_level: level })}
                            className={cn(
                                "min-h-[44px] flex-1 py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center cursor-pointer",
                                formData.experience_level === level
                                    ? "bg-primary text-black border-primary"
                                    : "border-white/10 text-zinc-400 hover:border-white/20"
                            )}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
