import type { WorkoutTemplate } from '../types';

export const INITIAL_TEMPLATES: WorkoutTemplate[] = [
    // MONDAY: Chest & Triceps Power
    {
        id: 'tmpl_chest_tri_power',
        name: 'Chest & Triceps Power',
        scheduled_days: [1],
        description: 'A heavy pushing routine designed to build maximum strength and thickness in the chest and triceps, prioritizing compound bar press variations followed by high-tension accessories.',
        coach_notes: 'Warm up thoroughly before your barbell press. Your first two pressing exercises are heavy compound movements—rest 2 to 3 minutes between sets. Push close to failure on the tricep pushdowns at the end.',
        difficulty: 'Intermediate',
        target_duration: 75,
        focus_goal: 'Strength & Power',
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
        description: 'A pull-day protocol engineered to develop width and thickness across the upper and lower latissimus dorsi, rounded off with strict bicep isolation curls.',
        coach_notes: 'Lead with your elbows on all pull movements to maximize back engagement rather than biceps. Keep your shoulder blades packed. Rest 90-120 seconds between sets to maintain high density.',
        difficulty: 'Intermediate',
        target_duration: 70,
        focus_goal: 'Muscle Hypertrophy',
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
        description: 'A high-demand leg session targeting the quads, glutes, and hamstrings. Features heavy back squats to stimulate system-wide anabolic adaptation.',
        coach_notes: 'Focus on full range of motion. Keep your core braced on squats and Romanian deadlifts. Rest fully between heavy squats. Control the negative on Bulgarian split squats.',
        difficulty: 'Advanced',
        target_duration: 80,
        focus_goal: 'Strength & Hypertrophy',
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
        description: 'Sculpt 3D shoulder width while training rotational power and core stability. Combines heavy overhead barbell work with high-volume isolation.',
        coach_notes: 'Avoid over-arching the lower back during the overhead press—squeeze your glutes. For lateral raises and face pulls, prioritize tempo and squeeze over heavy weights.',
        difficulty: 'Intermediate',
        target_duration: 60,
        focus_goal: 'Detail & Stability',
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
        description: 'A high-volume hypertrophy routine focused on chasing the ultimate pump in the chest, biceps, and triceps. Great for weekends or arm-specialization phases.',
        coach_notes: 'Keep rest times shorter (60-90s) to keep blood flow in the target muscles. Focus on the peak contraction (squeeze) and slow eccentric phases (descent) on every single rep.',
        difficulty: 'Beginner',
        target_duration: 60,
        focus_goal: 'Hypertrophy & Pump',
        exercises: [
            { exercise_id: 'ex_incline_press', target_sets: 3, target_reps: 12, rest_seconds: 90 }, // Incline DB Press (swapped from barbell)
            { exercise_id: 'ex_pec_deck', target_sets: 3, target_reps: 15, rest_seconds: 60 }, // 60s
            { exercise_id: 'ex_spider_curl', target_sets: 3, target_reps: 12, rest_seconds: 60 }, // 60s
            { exercise_id: 'ex_skullcrusher', target_sets: 3, target_reps: 12, rest_seconds: 90 }, // 90s
            { exercise_id: 'ex_forearm_roller', target_sets: 3, target_reps: 1, rest_seconds: 60 } // 60s
        ]
    }
];
