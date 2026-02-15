import type { Exercise } from '../types';

export const INITIAL_EXERCISES: Exercise[] = [
    // Triceps
    {
        id: 'ex_skullcrusher',
        name: 'Skullcrushers',
        target_muscle: 'Triceps',
        instructions: 'Lie on bench, bar to forehead. Keep elbows tucked.',
        video_url: ''
    },
    {
        id: 'ex_pushdown',
        name: 'Cable Pushdowns',
        target_muscle: 'Triceps',
        instructions: 'Keep elbows at sides. Full extension at bottom.',
        video_url: ''
    },
    {
        id: 'ex_dips',
        name: 'Dips',
        target_muscle: 'Triceps',
        instructions: 'Upright torso for triceps. Lean forward for chest.',
        video_url: ''
    },
    // Biceps
    {
        id: 'ex_hammer',
        name: 'Hammer Curls',
        target_muscle: 'Biceps',
        instructions: 'Palms facing each other. Focus on brachialis.',
        video_url: ''
    },
    {
        id: 'ex_barbell_curl',
        name: 'Barbell Curls',
        target_muscle: 'Biceps',
        instructions: 'Strict form. No swinging.',
        video_url: ''
    },
    // Chest (Man Boobs Target)
    {
        id: 'ex_incline_press',
        name: 'Incline DB Press',
        target_muscle: 'Chest',
        instructions: 'Bench at 30-45 degrees. Focus on upper chest.',
        video_url: ''
    },
    {
        id: 'ex_cable_fly_high',
        name: 'High-to-Low Cable Fly',
        target_muscle: 'Chest',
        instructions: 'Step forward. Bring hands together at waist level.',
        video_url: ''
    },
    // Legs
    {
        id: 'ex_squat',
        name: 'Barbell Squat',
        target_muscle: 'Legs',
        instructions: 'Feet shoulder width. Break at hips. Depth below parallel.',
        video_url: ''
    },
    {
        id: 'ex_lunge',
        name: 'Walking Lunges',
        target_muscle: 'Legs',
        instructions: 'Step forward, knee to ground. Keep torso upright.',
        video_url: ''
    },
    // Back
    {
        id: 'ex_deadlift',
        name: 'Deadlift',
        target_muscle: 'Back',
        instructions: 'Hinge at hips. Keep bar close. Drive through heels.',
        video_url: ''
    },
    {
        id: 'ex_row',
        name: 'Bent Over Row',
        target_muscle: 'Back',
        instructions: 'Flat back. Pull bar to sternum.',
        video_url: ''
    },
    {
        id: 'ex_lat_pulldown',
        name: 'Lat Pulldown',
        target_muscle: 'Back',
        instructions: 'Wide grip. Pull to upper chest.',
        video_url: ''
    },
    // Chest
    {
        id: 'ex_incline_barbell_press',
        name: 'Incline Barbell Press',
        target_muscle: 'Chest',
        instructions: 'Bench at 30 degrees. Focus on upper chest.',
        video_url: ''
    },
    {
        id: 'ex_flat_db_press',
        name: 'Flat Dumbbell Press',
        target_muscle: 'Chest',
        instructions: 'Full ROM. Squeeze at top.',
        video_url: ''
    },
    {
        id: 'ex_pec_deck',
        name: 'Pec Deck Fly',
        target_muscle: 'Chest',
        instructions: 'Constant tension. Squeeze at center.',
        video_url: ''
    },
    // Triceps
    {
        id: 'ex_close_grip_bench',
        name: 'Close-Grip Bench',
        target_muscle: 'Triceps',
        instructions: 'Hands shoulder-width. Keep elbows tucked.',
        video_url: ''
    },
    {
        id: 'ex_overhead_tri_ext',
        name: 'Overhead Tricep Ext',
        target_muscle: 'Triceps',
        instructions: 'Deep stretch at bottom. Keep elbows high.',
        video_url: ''
    },
    // Back
    {
        id: 'ex_pull_up',
        name: 'Weighted Pull-Ups',
        target_muscle: 'Back',
        instructions: 'Full extension. Chin over bar.',
        video_url: ''
    },
    {
        id: 'ex_single_arm_row',
        name: 'Single-Arm DB Row',
        target_muscle: 'Back',
        instructions: 'Support on bench. Stretch lat at bottom.',
        video_url: ''
    },
    // Biceps
    {
        id: 'ex_incline_db_curl',
        name: 'Incline DB Curl',
        target_muscle: 'Biceps',
        instructions: 'Bench at 45 degrees. Arms hang behind body.',
        video_url: ''
    },
    {
        id: 'ex_spider_curl',
        name: 'Spider Curls',
        target_muscle: 'Biceps',
        instructions: 'Chest supported on incline bench. Isolate biceps.',
        video_url: ''
    },
    // Legs
    {
        id: 'ex_rdl',
        name: 'Romanian Deadlift',
        target_muscle: 'Legs',
        instructions: 'Hips back. Soft knees. Stretch hamstrings.',
        video_url: ''
    },
    {
        id: 'ex_bulgarian_split_squat',
        name: 'Bulgarian Split Squat',
        target_muscle: 'Legs',
        instructions: 'Rear foot elevated. Drop back knee deep.',
        video_url: ''
    },
    {
        id: 'ex_leg_press',
        name: 'Leg Press',
        target_muscle: 'Legs',
        instructions: 'Feet hip-width. Full range of motion.',
        video_url: ''
    },
    {
        id: 'ex_leg_curl',
        name: 'Leg Curl',
        target_muscle: 'Legs',
        instructions: 'Squeeze hamstrings at top. Control eccentric.',
        video_url: ''
    },
    {
        id: 'ex_calf_raise',
        name: 'Calf Raise',
        target_muscle: 'Legs',
        instructions: 'Pause at top and bottom.',
        video_url: ''
    },
    // Shoulders
    {
        id: 'ex_ohp',
        name: 'Overhead Press',
        target_muscle: 'Shoulders',
        instructions: 'Strict press from collarbone to lockout.',
        video_url: ''
    },
    {
        id: 'ex_lateral_raise',
        name: 'Lateral Raise',
        target_muscle: 'Shoulders',
        instructions: 'Lead with elbows. Stop at shoulder height.',
        video_url: ''
    },
    {
        id: 'ex_face_pull',
        name: 'Face Pull',
        target_muscle: 'Shoulders',
        instructions: 'Pull to forehead. External rotation at end.',
        video_url: ''
    },
    {
        id: 'ex_db_shrug',
        name: 'DB Shrugs',
        target_muscle: 'Shoulders',
        instructions: 'Squeeze traps at top. Pause.',
        video_url: ''
    },
    // Core/Misc
    {
        id: 'ex_plank',
        name: 'Plank Hold',
        target_muscle: 'Core',
        instructions: 'Brace core hard. Glutes engaged.',
        video_url: ''
    },
    {
        id: 'ex_woodchop',
        name: 'Cable Woodchop',
        target_muscle: 'Core',
        instructions: 'Rotate from torso. Explosive concentric.',
        video_url: ''
    },
    {
        id: 'ex_forearm_roller',
        name: 'Forearm Rollers',
        target_muscle: 'Forearms',
        instructions: 'Roll weight up and down under control.',
        video_url: ''
    }
];
