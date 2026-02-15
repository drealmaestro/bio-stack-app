import { useState } from "react";
import { useStore } from "../store/useStore";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { nanoid } from "nanoid";

export function WorkoutManager() {
    const { templates, addTemplate, deleteTemplate } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState("");

    const handleCreate = () => {
        if (!newTemplateName) return;
        addTemplate({
            id: nanoid(),
            name: newTemplateName,
            exercises: []
        });
        setNewTemplateName("");
        setIsCreating(false);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">My Plans</h2>
                <Button onClick={() => setIsCreating(true)} size="sm" className="gap-2">
                    <Plus size={16} /> New Routine
                </Button>
            </div>

            {isCreating && (
                <Card className="border-primary bg-secondary/50">
                    <CardContent className="pt-6 flex gap-2">
                        <Input
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                            placeholder="Routine Name (e.g. Arm Blaster)"
                            className="bg-black/50"
                        />
                        <Button onClick={handleCreate}>Save</Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-3">
                {templates.length === 0 && (
                    <div className="text-center text-muted-foreground py-10">
                        No workouts found. Create your first routine!
                    </div>
                )}

                {templates.map(template => (
                    <Card key={template.id} className="group hover:border-primary/50 transition-colors bg-secondary/30">
                        <CardContent className="p-4 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-white">{template.name}</h3>
                                <p className="text-xs text-muted-foreground">{template.exercises.length} Exercises</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => deleteTemplate(template.id)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                                <Button variant="outline" size="icon">
                                    <ChevronRight size={18} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
