import { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const GOAL_OPTIONS = [
    "Man boobs reduction",
    "Tricep hypertrophy",
    "Bicep hypertrophy",
    "General Strength",
    "Fat Loss"
];

const EXPERIENCE_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export function Profile() {
    const { user, setUser } = useStore();
    const [formData, setFormData] = useState({
        name: "",
        birthday: "1978-07-21", // Default to user's birthday
        experience_level: "Advanced",
        goals: [] as string[]
    });

    // Helper to calculate age
    const calculateAge = (birthDate: string) => {
        if (!birthDate) return 0;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                birthday: user.birthday || "1978-07-21",
                experience_level: user.experience_level,
                goals: user.goals
            });
        }
    }, [user]);

    const toggleGoal = (goal: string) => {
        setFormData(prev => ({
            ...prev,
            goals: prev.goals.includes(goal)
                ? prev.goals.filter(g => g !== goal)
                : [...prev.goals, goal]
        }));
    };

    const handleSave = () => {
        setUser({
            ...formData,
            age: calculateAge(formData.birthday), // Keep age for backward compat types
            stats: user?.stats || { weight: [], body_fat: [] }
        });
        alert("Profile Saved!");
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Card className="border-primary/20 bg-black/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-primary">User Profile</CardTitle>
                    <CardDescription>Customize your bio stack parameters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="bg-secondary/50 border-white/10 text-white"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Birthday</label>
                            <Input
                                type="date"
                                value={formData.birthday}
                                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                                className="bg-secondary/50 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Calculated Age</label>
                            <div className="flex h-10 items-center px-3 rounded-md border border-white/10 bg-secondary/50 text-white font-mono text-lg font-bold">
                                {calculateAge(formData.birthday)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Experience Level</label>
                        <div className="flex gap-2">
                            {EXPERIENCE_OPTIONS.map(level => (
                                <Button
                                    key={level}
                                    variant={formData.experience_level === level ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setFormData({ ...formData, experience_level: level })}
                                    className="flex-1"
                                >
                                    {level}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-primary/20 bg-black/50 backdrop-blur">
                <CardHeader>
                    <CardTitle className="text-primary">Goals</CardTitle>
                    <CardDescription>Select your focus areas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-2">
                        {GOAL_OPTIONS.map(goal => (
                            <Button
                                key={goal}
                                variant={formData.goals.includes(goal) ? "default" : "outline"}
                                className={`w-full justify-start ${formData.goals.includes(goal) ? 'bg-primary text-black font-bold' : 'text-muted-foreground'}`}
                                onClick={() => toggleGoal(goal)}
                            >
                                {formData.goals.includes(goal) ? "✓ " : "+ "} {goal}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Button onClick={handleSave} className="w-full text-lg font-bold py-6 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                Save Profile
            </Button>
        </div>
    );
}
