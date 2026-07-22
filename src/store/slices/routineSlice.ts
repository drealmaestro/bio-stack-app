import type { StateCreator } from 'zustand';
import type { WorkoutTemplate, WorkoutLog } from '../../types';

export interface RoutineSlice {
    templates: WorkoutTemplate[];
    logs: WorkoutLog[];
    addTemplate: (template: WorkoutTemplate) => void;
    updateTemplate: (template: WorkoutTemplate) => void;
    deleteTemplate: (id: string) => void;
    addLog: (log: WorkoutLog) => void;
}

export const createRoutineSlice: StateCreator<RoutineSlice, [], [], RoutineSlice> = (set) => ({
    templates: [],
    logs: [],

    addTemplate: (template) => set((state) => ({
        templates: [...state.templates, template]
    })),

    updateTemplate: (template) => set((state) => ({
        templates: state.templates.map(t => t.id === template.id ? template : t)
    })),

    deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(t => t.id !== id)
    })),

    addLog: (log) => set((state) => ({
        logs: [...state.logs, log]
    }))
});
