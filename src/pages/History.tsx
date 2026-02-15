import { useStore } from "../store/useStore";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function HistoryLog() {
    const { logs, templates } = useStore();

    const getTemplateName = (id: string) => {
        return templates.find(t => t.id === id)?.name || "Unknown Workout";
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-2xl font-bold text-white mb-4">Workout History</h2>

            {logs.length === 0 && (
                <div className="text-center text-muted-foreground py-10 border border-dashed border-white/10 rounded-lg">
                    No history yet. Go lift something!
                </div>
            )}

            <div className="space-y-4">
                {[...logs].reverse().map((log) => (
                    <Card key={log.id} className="bg-secondary/30 border-white/5">
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-base font-bold text-white">
                                    {getTemplateName(log.template_id)}
                                </CardTitle>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <div className="text-sm text-muted-foreground mb-2">
                                Duration: {Math.round(log.duration_seconds / 60)} min
                            </div>
                            <div className="space-y-1">
                                {log.completed_exercises.map((set, idx) => (
                                    <div key={idx} className="flex justify-between text-xs border-b border-white/5 py-1 last:border-0">
                                        <span>Set {set.set_number}</span>
                                        <span className="text-primary">
                                            {set.weight_kg}kg x {set.reps_completed}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
