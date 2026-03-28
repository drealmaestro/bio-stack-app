import type { WorkoutTemplate } from '../types';

export const INITIAL_TEMPLATES: WorkoutTemplate[] = [
    // MONDAY: Chest & Triceps Power
    {
        id: 'tmpl_chest_tri_power',
        name: 'Chest & Triceps Power',
        scheduled_days: [1],
        exercises: [
            { exercise_id: 'ex_incline_barbell_press', target_sets: 4, target_reps: 8, rest_seconds: 180 }, // 3 min
            { exercise_id: 'ex_flat_db_press', target_sets: 4, target_reps: 10, rest_seconds: 150 }, // 2.5 min
            { exercise_id: 'ex_cable_fly_high', target_sets: 3, target_reps: 15, rest_seconds: 90 }, // 90s
            { exercise_id: 'ex_dips', target_sets: 3, target_reps: 10, rest_seconds: 150 }, // 2.5 min
            { exercise_id: 'ex_close_grip_bench', target_sets: 4, target_reps: 10, rest_seconds: 120 }, // 2 min
            { exercise_id: 'ex_overhead_tri_ext', target_sets: 3, target_reps: 12, rest_seconds: 90 }, // 90s
            { exercise_id: 'ex_pushdown', target_sets: 3, target_reps: 15, rest_seconds: 60 } // 60s
        ]
    },
    // TUESDAY: Back & Biceps Builder
    {
        id: 'tmpl_back_bi_builder',
        name: 'Back & Biceps Builder',
        scheduled_days: [2],
        exercises: [
            { exercise_id: 'ex_pull_up', target_sets: 4, target_reps: 8, rest_seconds: 180 }, // 3 min
            { exercise_id: 'ex_row', target_sets: 4, target_reps: 10, rest_seconds: 150 }, // 2.5 min
            { exercise_id: 'ex_lat_pulldown', target_sets: 3, target_reps: 12, rest_seconds: 120 }, // 2 min
            { exercise_id: 'ex_single_arm_row', target_sets: 3, target_reps: 12, rest_seconds: 90 }, // 90s
            { exercise_id: 'ex_barbell_curl', target_sets: 4, target_reps: 10, rest_seconds: 120 }, // 2 min
            { exercise_id: 'ex_incline_db_curl', target_sets: 3, target_reps: 12, rest_seconds: 90 }, // 90s
            { exercise_id: 'ex_hammer', target_sets: 3, target_reps: 15, rest_seconds: 60 } // 60s
        ]
    },
    // THURSDAY: Lower Body Foundation
    {
        id: 'tmpl_lower_foundation',
        name: 'Lower Body Foundation',
        scheduled_days: [4],
        exercises: [
            { exercise_id: 'ex_squat', target_sets: 4, target_reps: 8, rest_seconds: 180 }, // 3 min
            { exercise_id: 'ex_rdl', target_sets: 4, target_reps: 10, rest_seconds: 150 }, // 2.5 min
            { exercise_id: 'ex_bulgarian_split_squat', target_sets: 3, target_reps: 10, rest_seconds: 120 }, // 2 min
            { exercise_id: 'ex_leg_press', target_sets: 3, target_reps: 15, rest_seconds: 120 }, // 2 min
            { exercise_id: 'ex_leg_curl', target_sets: 3, target_reps: 15, rest_seconds: 90 }, // 90s
            { exercise_id: 'ex_calf_raise', target_sets: 4, target_reps: 20, rest_seconds: 60 } // 60s
        ]
    },
    // FRIDAY: Shoulder & Core
    {
        id: 'tmpl_shoulder_core',
        name: 'Shoulder & Core',
        scheduled_days: [5],
        exercises: [
            { exercise_id: 'ex_ohp', target_sets: 4, target_reps: 8, rest_seconds: 180 }, // 3 min
            { exercise_id: 'ex_lateral_raise', target_sets: 4, target_reps: 15, rest_seconds: 90 }, // 90s
            { exercise_id: 'ex_face_pull', target_sets: 3, target_reps: 20, rest_seconds: 60 }, // 60s
            { exercise_id: 'ex_db_shrug', target_sets: 3, target_reps: 15, rest_seconds: 90 }, // 90s
            { exercise_id: 'ex_plank', target_sets: 3, target_reps: 1, rest_seconds: 60 }, // Rest 60s
            { exercise_id: 'ex_woodchop', target_sets: 3, target_reps: 15, rest_seconds: 60 } // 60s
        ]
    },
    // SATURDAY: Chest & Arms Volume
    {
        id: 'tmpl_chest_arms_vol',
        name: 'Chest & Arms Volume',
        scheduled_days: [6],
        exercises: [
            { exercise_id: 'ex_incline_press', target_sets: 3, target_reps: 12, rest_seconds: 90 }, // Incline DB Press (swapped from barbell)
            { exercise_id: 'ex_pec_deck', target_sets: 3, target_reps: 15, rest_seconds: 60 }, // 60s
            { exercise_id: 'ex_spider_curl', target_sets: 3, target_reps: 12, rest_seconds: 60 }, // 60s
            { exercise_id: 'ex_skullcrusher', target_sets: 3, target_reps: 12, rest_seconds: 90 }, // 90s
            { exercise_id: 'ex_forearm_roller', target_sets: 3, target_reps: 1, rest_seconds: 60 } // 60s
        ]
    }
];
