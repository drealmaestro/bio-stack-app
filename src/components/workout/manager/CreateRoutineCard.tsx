import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

interface CreateRoutineCardProps {
    newTemplateName: string;
    onNameChange: (val: string) => void;
    onCreate: () => void;
    onCancel: () => void;
}

export function CreateRoutineCard({
    newTemplateName,
    onNameChange,
    onCreate,
    onCancel
}: CreateRoutineCardProps) {
    return (
        <Card className="border-primary/40 bg-primary/5 animate-in zoom-in-95 duration-200">
            <CardContent className="p-4 space-y-3">
                <p className="text-xs font-bold text-primary uppercase tracking-widest">New Routine</p>
                <Input
                    autoFocus
                    value={newTemplateName}
                    onChange={(e) => onNameChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onCreate()}
                    placeholder="e.g. Arm Blaster, Leg Day Destroyer..."
                    className="bg-black/50"
                />
                <div className="flex gap-2">
                    <Button onClick={onCreate} className="flex-1">Create & Edit</Button>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
