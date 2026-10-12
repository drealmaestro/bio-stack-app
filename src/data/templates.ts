import type { WorkoutTemplate } from '../types';

export const INITIAL_TEMPLATES: WorkoutTemplate[] = [
    // MONDAY (DAY 1): Chest & Triceps Dominance + Left-Shoulder Lock-In
    {
        id: 'tmpl_chest_tri_power',
        name: 'Day 1: Chest & Triceps + Left-Shoulder Lock-In',
        scheduled_days: [1],
        description: 'Engineered for 48+ hypertrophy: Starts with a 2-minute Left-Shoulder Rotator Cuff Lock-In so your left shoulder stays stable mid-set, followed by unilateral dumbbell & cable chest/tricep builders.',
        coach_notes: 'DOCTOR PROTOCOL: Do NOT skip Exercise 1 (Left-Shoulder Lock-In)—it wakes up your left rotator cuff so your left arm does not fade halfway through pressing. On all unilateral exercises, start with your LEFT arm, match reps on the right, and do 1 extra 20-second rest-pause set (4-5 reps) on the LEFT arm after your final set.',
        difficulty: 'Advanced',
        target_duration: 60,
        focus_goal: 'Chest/Triceps & Left-Arm Stamina',
        exercises: [
            { exercise_id: 'ex_shoulder_lockin_rotations', target_sets: 2, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_incline_db_left_lead', target_sets: 4, target_reps: 10, rest_seconds: 120 },
            { exercise_id: 'ex_neutral_db_chest_press', target_sets: 4, target_reps: 10, rest_seconds: 120 },
            { exercise_id: 'ex_single_arm_cable_press', target_sets: 3, target_reps: 12, rest_seconds: 90 },
            { exercise_id: 'ex_cable_fly_high', target_sets: 3, target_reps: 15, rest_seconds: 75 },
            { exercise_id: 'ex_cross_body_tri_left_lead', target_sets: 4, target_reps: 12, rest_seconds: 75 },
            { exercise_id: 'ex_overhead_cable_tri_rope', target_sets: 3, target_reps: 12, rest_seconds: 75 },
            { exercise_id: 'ex_pushdown', target_sets: 3, target_reps: 15, rest_seconds: 60 }
        ]
    },
    // TUESDAY (DAY 2): Back Width, Rear Delts & Bicep Peak
    {
        id: 'tmpl_back_bi_builder',
        name: 'Day 2: Back Width, Rear Delts & Bicep Peak',
        scheduled_days: [2],
        description: 'Builds thick lats and rear-delt stability to support your left shoulder socket from behind, finished with unilateral long-head and peak bicep specialization.',
        coach_notes: 'Strong rear delts and lower lats hold your left shoulder back in the socket during benching. Lead with your LEFT arm on Single-Arm DB Rows and Bayesian Cable Curls.',
        difficulty: 'Advanced',
        target_duration: 60,
        focus_goal: 'Back Stability & Bicep Mass',
        exercises: [
            { exercise_id: 'ex_face_pull', target_sets: 3, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_lat_pulldown', target_sets: 4, target_reps: 10, rest_seconds: 120 },
            { exercise_id: 'ex_single_arm_row', target_sets: 4, target_reps: 12, rest_seconds: 90 },
            { exercise_id: 'ex_underhand_lat_pulldown', target_sets: 3, target_reps: 12, rest_seconds: 90 },
            { exercise_id: 'ex_incline_db_curl', target_sets: 4, target_reps: 12, rest_seconds: 75 },
            { exercise_id: 'ex_bayesian_cable_curl', target_sets: 3, target_reps: 12, rest_seconds: 75 },
            { exercise_id: 'ex_hammer', target_sets: 3, target_reps: 15, rest_seconds: 60 }
        ]
    },
    // WEDNESDAY (DAY 3): Full Legs, Left-Shoulder Rebuild & Core
    {
        id: 'tmpl_lower_foundation',
        name: 'Day 3: Full Legs, Left-Shoulder Rebuild & Core',
        scheduled_days: [3],
        description: 'High-stimulus lower body hypertrophy using spine-friendly angles for 48+ recovery, paired with direct unilateral left-shoulder strength & stamina rebuilding before Thursday Rest.',
        coach_notes: 'We use Leg Press, Split Squats, and controlled RDLs to build strong legs without crushing your lower back. Finish strong with Single-Arm Neutral DB Shoulder Press and Cable Laterals (Left Arm Lead) to directly fix your weak left shoulder.',
        difficulty: 'Advanced',
        target_duration: 65,
        focus_goal: 'Legs & Left-Shoulder Rebuild',
        exercises: [
            { exercise_id: 'ex_leg_press', target_sets: 4, target_reps: 12, rest_seconds: 120 },
            { exercise_id: 'ex_rdl', target_sets: 4, target_reps: 10, rest_seconds: 120 },
            { exercise_id: 'ex_bulgarian_split_squat', target_sets: 3, target_reps: 10, rest_seconds: 90 },
            { exercise_id: 'ex_leg_curl', target_sets: 3, target_reps: 15, rest_seconds: 75 },
            { exercise_id: 'ex_single_arm_neutral_db_ohp', target_sets: 4, target_reps: 10, rest_seconds: 90 },
            { exercise_id: 'ex_single_arm_cable_lateral', target_sets: 4, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_calf_raise', target_sets: 4, target_reps: 20, rest_seconds: 60 },
            { exercise_id: 'ex_woodchop', target_sets: 3, target_reps: 15, rest_seconds: 60 }
        ]
    },
    // FRIDAY (DAY 4 - AFTER THURSDAY REST): Upper Chest & Arm Specialization
    {
        id: 'tmpl_shoulder_core',
        name: 'Day 4: Upper Chest, Biceps & Triceps Surge',
        scheduled_days: [5],
        description: 'Fresh off Thursday Rest Day: High-tension upper chest and arm hypertrophy session with unilateral left-arm endurance offsets and elbow-friendly cable/preacher angles.',
        coach_notes: 'After 48 hours of recovery from Monday, your chest and arms are primed to grow. Start with the Left-Shoulder Lock-In, pre-exhaust the upper chest with cables, then attack Incline DB Press and supersets for Biceps & Triceps.',
        difficulty: 'Advanced',
        target_duration: 60,
        focus_goal: 'Upper Chest & Arm Size',
        exercises: [
            { exercise_id: 'ex_shoulder_lockin_rotations', target_sets: 2, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_low_to_high_cable_fly', target_sets: 3, target_reps: 15, rest_seconds: 75 },
            { exercise_id: 'ex_incline_db_left_lead', target_sets: 4, target_reps: 10, rest_seconds: 120 },
            { exercise_id: 'ex_single_arm_preacher_curl', target_sets: 4, target_reps: 12, rest_seconds: 75 },
            { exercise_id: 'ex_cross_body_tri_left_lead', target_sets: 4, target_reps: 12, rest_seconds: 75 },
            { exercise_id: 'ex_spider_curl', target_sets: 3, target_reps: 12, rest_seconds: 60 },
            { exercise_id: 'ex_overhead_cable_tri_rope', target_sets: 3, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_hammer', target_sets: 3, target_reps: 15, rest_seconds: 60 }
        ]
    },
    // SATURDAY (DAY 5): Full-Body Power, Shoulder Stamina & Arm Finisher
    {
        id: 'tmpl_chest_arms_vol',
        name: 'Day 5: Full-Body Power & Left-Arm Finisher',
        scheduled_days: [6],
        description: 'Total-body athletic hypertrophy covering Legs, Back, Chest, Left-Shoulder endurance, and a high-pump Bicep/Tricep finisher before Sunday Rest.',
        coach_notes: 'Keep rest intervals between 60-90s. Every major muscle group gets stimulated today, with extra focus on left-shoulder cable lateral stamina and single-arm cable pressing.',
        difficulty: 'Advanced',
        target_duration: 55,
        focus_goal: 'Full Body & Arm Endurance',
        exercises: [
            { exercise_id: 'ex_leg_press', target_sets: 3, target_reps: 15, rest_seconds: 90 },
            { exercise_id: 'ex_underhand_lat_pulldown', target_sets: 3, target_reps: 12, rest_seconds: 90 },
            { exercise_id: 'ex_single_arm_cable_press', target_sets: 3, target_reps: 12, rest_seconds: 90 },
            { exercise_id: 'ex_single_arm_cable_lateral', target_sets: 3, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_face_pull', target_sets: 3, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_bayesian_cable_curl', target_sets: 3, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_pushdown', target_sets: 3, target_reps: 15, rest_seconds: 60 }
        ]
    },
    // BONUS AT-HOME ROUTINE: Stretch-Band Hypertrophy & Left-Shoulder Fix
    {
        id: 'tmpl_home_band_protocol',
        name: 'Bonus: At-Home Stretch-Band Pump & Shoulder Fix',
        scheduled_days: [0, 4],
        description: 'For days you skip the gym and train at home with your Stretch Bands! Rebuilds left-shoulder rotator cuff stamina while pumping your Chest, Biceps, and Triceps with zero joint stress.',
        coach_notes: 'Stretch bands provide accommodating resistance—getting heavier near lockout right where your left arm usually tires out. Hold every peak contraction for 2 full seconds!',
        difficulty: 'Intermediate',
        target_duration: 35,
        focus_goal: 'Home Band Pump & Left Shoulder',
        exercises: [
            { exercise_id: 'ex_band_shoulder_stabilizer', target_sets: 3, target_reps: 15, rest_seconds: 45 },
            { exercise_id: 'ex_band_single_arm_press', target_sets: 4, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_band_bicep_curl', target_sets: 4, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_band_single_arm_tri', target_sets: 4, target_reps: 15, rest_seconds: 60 },
            { exercise_id: 'ex_plank', target_sets: 3, target_reps: 1, rest_seconds: 45 }
        ]
    }
];
