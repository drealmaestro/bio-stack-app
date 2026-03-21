import type { Exercise } from '../types';

export const INITIAL_EXERCISES: Exercise[] = [
    // Triceps
    {
        id: 'ex_skullcrusher',
        name: 'Skullcrushers',
        target_muscle: 'Triceps',
        instructions: 'Lie on bench, lower bar to forehead. Keep elbows tucked and stationary.',
        form_cues: ['Keep elbows pointing straight up', 'Lower bar to forehead, not behind head', 'Lock upper arms — only forearms move', 'Control the eccentric (3 sec down)'],
        common_mistakes: ['Elbows flaring out wide', 'Lowering bar behind the head', 'Using momentum on the concentric'],
        video_url: ''
    },
    {
        id: 'ex_pushdown',
        name: 'Cable Pushdowns',
        target_muscle: 'Triceps',
        instructions: 'Keep elbows pinned at sides. Full extension at bottom, squeeze hard.',
        form_cues: ['Elbows stay at your sides throughout', 'Full lockout at the bottom', 'Lean slightly forward', 'Squeeze triceps at full extension'],
        common_mistakes: ['Letting elbows drift forward', 'Not reaching full extension', 'Using body momentum'],
        video_url: ''
    },
    {
        id: 'ex_dips',
        name: 'Dips',
        target_muscle: 'Triceps',
        instructions: 'Keep torso upright for tricep focus. Lower until elbows reach 90°.',
        form_cues: ['Stay upright — lean forward shifts to chest', 'Lower to 90° elbow angle', 'Elbows close to body', 'Full lockout at the top'],
        common_mistakes: ['Leaning too far forward', 'Not going deep enough', 'Flaring elbows out'],
        video_url: ''
    },
    {
        id: 'ex_close_grip_bench',
        name: 'Close-Grip Bench',
        target_muscle: 'Triceps',
        instructions: 'Hands shoulder-width. Keep elbows tucked, full ROM.',
        form_cues: ['Hands shoulder-width apart (not too close)', 'Tuck elbows to sides at ~45°', 'Touch chest on every rep', 'Drive bar straight up'],
        common_mistakes: ['Hands too close (wrist strain)', 'Wide elbows (becomes chest exercise)', 'Partial range of motion'],
        video_url: ''
    },
    {
        id: 'ex_overhead_tri_ext',
        name: 'Overhead Tricep Ext',
        target_muscle: 'Triceps',
        instructions: 'Get a deep stretch at bottom. Keep elbows high and tight.',
        form_cues: ['Elbows point forward, not flared', 'Lower weight behind head for deep stretch', 'Brace core, no lower back arch', 'Full extension at top'],
        common_mistakes: ['Elbows drifting wide', 'Arching lower back to compensate', 'Skipping the stretch position'],
        video_url: ''
    },
    // Biceps
    {
        id: 'ex_hammer',
        name: 'Hammer Curls',
        target_muscle: 'Biceps',
        instructions: 'Palms facing each other. Targets brachialis and brachioradialis.',
        form_cues: ['Neutral grip throughout the movement', 'No swinging — pin elbows at sides', 'Full extension at bottom', 'Slow eccentric (2-3 sec)'],
        common_mistakes: ['Supinating the wrist (defeats the purpose)', 'Swinging the torso', 'Cutting the range short'],
        video_url: ''
    },
    {
        id: 'ex_barbell_curl',
        name: 'Barbell Curls',
        target_muscle: 'Biceps',
        instructions: 'Strict form. No swinging. Squeeze at peak contraction.',
        form_cues: ['Stand tall, elbows pinned to sides', 'Curl with your forearms, not shoulders', 'Squeeze hard at the top', '3-second controlled descent'],
        common_mistakes: ['Swinging hips for momentum', 'Elbows drifting forward at top', 'Dropping weight without control'],
        video_url: ''
    },
    {
        id: 'ex_incline_db_curl',
        name: 'Incline DB Curl',
        target_muscle: 'Biceps',
        instructions: 'Bench at 45°. Arms hang behind body for maximum stretch.',
        form_cues: ['Let arm hang straight down for full stretch', 'Curl without swinging arm forward', 'Supinate at top for peak contraction', 'Resist the weight on the way down'],
        common_mistakes: ['Bench angle too steep (reduces stretch)', 'Swinging arms forward to initiate', 'Not supinating at contraction'],
        video_url: ''
    },
    {
        id: 'ex_spider_curl',
        name: 'Spider Curls',
        target_muscle: 'Biceps',
        instructions: 'Chest on incline bench. Isolates biceps fully — no body swing possible.',
        form_cues: ['Chest flat on the bench', 'Arms hang straight down', 'Curl strictly with forearms', 'Full extension between reps'],
        common_mistakes: ['Pulling elbows back (shoulder involvement)', 'Not extending fully at bottom', 'Going too heavy'],
        video_url: ''
    },
    // Chest
    {
        id: 'ex_incline_press',
        name: 'Incline DB Press',
        target_muscle: 'Chest',
        instructions: 'Bench at 30-45°. Focus on upper chest. Full ROM.',
        form_cues: ['Set bench to 30-45° (not higher)', 'Retract scapula before pressing', 'Lower to chest level, elbows at ~75°', 'Press in a slight arc, not straight up'],
        common_mistakes: ['Bench too steep (becomes shoulder press)', 'Bouncing off chest', 'Flaring elbows 90°'],
        video_url: ''
    },
    {
        id: 'ex_cable_fly_high',
        name: 'High-to-Low Cable Fly',
        target_muscle: 'Chest',
        instructions: 'High pulley. Step forward, bring hands together at waist. Targets lower chest.',
        form_cues: ['Cables set above shoulder height', 'Keep slight bend in elbows', 'Pull in a downward arc, meet at hip level', 'Squeeze chest at endpoint'],
        common_mistakes: ['Straightening arms (becomes tricep movement)', 'Pulling with hands not chest', 'Not enough forward lean'],
        video_url: ''
    },
    {
        id: 'ex_incline_barbell_press',
        name: 'Incline Barbell Press',
        target_muscle: 'Chest',
        instructions: 'Bench at 30°. Pause at chest. Drive explosively.',
        form_cues: ['Grip slightly wider than shoulder width', 'Bar touches upper chest', 'Leg drive through heels', 'Keep wrists stacked over elbows'],
        common_mistakes: ['Bar touching too low (flat chest area)', 'Losing upper back arch', 'Uneven bar path'],
        video_url: ''
    },
    {
        id: 'ex_flat_db_press',
        name: 'Flat Dumbbell Press',
        target_muscle: 'Chest',
        instructions: 'Full ROM. Squeeze chest at top. Control descent.',
        form_cues: ['Lie flat, feet on floor', 'Lower dumbbells to chest level', 'Press and squeeze at full extension', 'Slight inward arc on the press'],
        common_mistakes: ['Dumbbells too wide at bottom', 'No chest squeeze at top', 'Rushing the eccentric'],
        video_url: ''
    },
    {
        id: 'ex_pec_deck',
        name: 'Pec Deck Fly',
        target_muscle: 'Chest',
        instructions: 'Maintain constant tension. Squeeze hard when arms meet.',
        form_cues: ['Sit tall, chest up', 'Slight bend in elbows throughout', 'Feel the stretch at the open position', 'Squeeze for 1 second at close'],
        common_mistakes: ['Letting arms go too far back (shoulder risk)', 'Moving elbows instead of chest', 'No pause/squeeze at contraction'],
        video_url: ''
    },
    // Legs
    {
        id: 'ex_squat',
        name: 'Barbell Squat',
        target_muscle: 'Legs',
        instructions: 'Feet shoulder-width. Break at hips and knees simultaneously. Depth below parallel.',
        form_cues: ['Push knees out over toes', 'Chest up, core braced', 'Break parallel — hip crease below knee', 'Drive through mid foot'],
        common_mistakes: ['Knees caving inward', 'Heels rising off floor', 'Squatting too shallow'],
        video_url: ''
    },
    {
        id: 'ex_lunge',
        name: 'Walking Lunges',
        target_muscle: 'Legs',
        instructions: 'Step forward. Back knee touches ground. Keep torso upright.',
        form_cues: ['Long stride to protect front knee', 'Keep torso tall throughout', 'Front knee stays over ankle', 'Push off front heel to step through'],
        common_mistakes: ['Knee collapsing inward', 'Leaning forward', 'Too short a stride (front knee too far forward)'],
        video_url: ''
    },
    {
        id: 'ex_rdl',
        name: 'Romanian Deadlift',
        target_muscle: 'Legs',
        instructions: 'Hinge at hips, soft knees, feel hamstring stretch all the way.',
        form_cues: ['Push hips back (not bend knees)', 'Bar stays glued to legs', 'Feel the hamstring stretch before returning', 'Squeeze glutes at the top'],
        common_mistakes: ['Rounding the lower back', 'Bending knees too much (becomes squat)', 'Bar drifting away from body'],
        video_url: ''
    },
    {
        id: 'ex_bulgarian_split_squat',
        name: 'Bulgarian Split Squat',
        target_muscle: 'Legs',
        instructions: 'Rear foot elevated on bench. Drop back knee deep.',
        form_cues: ['Front foot far enough to stay over ankle', 'Stay tall — no forward lean', 'Drop straight down, not forward', 'Drive through front heel'],
        common_mistakes: ['Front foot too close (knee over toes)', 'Leaning forward excessively', 'Using rear leg to push'],
        video_url: ''
    },
    {
        id: 'ex_leg_press',
        name: 'Leg Press',
        target_muscle: 'Legs',
        instructions: 'Feet hip-width, mid-height on plate. Full ROM without letting pelvis tuck.',
        form_cues: ['Place feet hip-width, mid-platform', 'Lower until knees reach ~90°', "Don't let lower back peel off pad", 'Push through entire foot'],
        common_mistakes: ['Removing the safety stops too early', 'Pelvis tucking at bottom (butt wink)', 'Locking out knees at top'],
        video_url: ''
    },
    {
        id: 'ex_leg_curl',
        name: 'Leg Curl',
        target_muscle: 'Legs',
        instructions: 'Squeeze hamstrings at peak. Control the eccentric all the way down.',
        form_cues: ['Hips stay flat on pad', 'Curl all the way to full contraction', 'Lower slowly — 3 second eccentric', 'Toes pointed slightly for more hamstring'],
        common_mistakes: ['Hips rising off pad', 'Not reaching full contraction', 'Dropping weight without control'],
        video_url: ''
    },
    {
        id: 'ex_calf_raise',
        name: 'Calf Raise',
        target_muscle: 'Legs',
        instructions: 'Full range — pause and stretch at bottom, squeeze at top.',
        form_cues: ['Full stretch at the bottom (heel below platform)', 'Pause 1 second at peak contraction', 'Straight up — no rolling inward/outward', '3-second controlled descent'],
        common_mistakes: ['Bouncing at the bottom (no stretch)', 'Partial reps only', 'Rolling ankles outward'],
        video_url: ''
    },
    // Back
    {
        id: 'ex_deadlift',
        name: 'Deadlift',
        target_muscle: 'Back',
        instructions: 'Hinge at hips, bar close to legs, drive through heels.',
        form_cues: ['Bar over mid-foot at setup', 'Hips and shoulders rise at same rate', 'Keep bar dragging up the legs', 'Lock out glutes at the top'],
        common_mistakes: ['Bar drifting away from body', 'Rounding lower back under load', 'Jerking the bar off the floor'],
        video_url: ''
    },
    {
        id: 'ex_row',
        name: 'Bent Over Row',
        target_muscle: 'Back',
        instructions: 'Flat back, hinge at 45°. Pull bar to lower sternum. Lead with elbows.',
        form_cues: ['Torso at ~45° angle', 'Pull bar to lower chest/upper abs', 'Lead with elbows, not hands', 'Squeeze back at top'],
        common_mistakes: ['Too upright (becomes bicep exercise)', 'Jerking torso to help the lift', 'Pulling to wrong point (too high)'],
        video_url: ''
    },
    {
        id: 'ex_lat_pulldown',
        name: 'Lat Pulldown',
        target_muscle: 'Back',
        instructions: 'Wide grip. Pull bar to upper chest. Retract scapula first.',
        form_cues: ['Lean back slightly at ~80°', 'Initiate by depressing shoulder blades', 'Pull bar to upper chest', 'Control bar back up — stretch lats fully'],
        common_mistakes: ['Pulling behind the neck (neck strain)', 'Arms doing all the work (no lat engagement)', 'Not extending fully between reps'],
        video_url: ''
    },
    {
        id: 'ex_pull_up',
        name: 'Weighted Pull-Ups',
        target_muscle: 'Back',
        instructions: 'Full hang to chin over bar. No kipping.',
        form_cues: ['Dead hang at bottom (full stretch)', 'Pull elbows down and back', 'Chin clears the bar', 'Lower under full control'],
        common_mistakes: ['Kipping for momentum', 'Not reaching a full dead hang', 'Chin not clearing bar'],
        video_url: ''
    },
    {
        id: 'ex_single_arm_row',
        name: 'Single-Arm DB Row',
        target_muscle: 'Back',
        instructions: 'Brace on bench. Let dumbbell hang for full lat stretch, then row to hip.',
        form_cues: ['Let dumbbell hang straight down first', 'Pull elbow back toward hip', 'Rotate torso slightly for range', 'Pause and squeeze at top'],
        common_mistakes: ['Pulling with bicep, not back', 'Rotating too much (become twisting movement)', 'Short ROM — no stretch at bottom'],
        video_url: ''
    },
    // Shoulders
    {
        id: 'ex_ohp',
        name: 'Overhead Press',
        target_muscle: 'Shoulders',
        instructions: 'From collarbone to full lockout. Brace core, stay tight.',
        form_cues: ['Grip slightly wider than shoulders', 'Press bar in a straight vertical path', 'Move head back on the way up, forward after', 'Lock out arms fully at top'],
        common_mistakes: ['Pressing bar in front instead of slightly behind head', 'Excessive lower back arch', 'Not locking out at the top'],
        video_url: ''
    },
    {
        id: 'ex_lateral_raise',
        name: 'Lateral Raise',
        target_muscle: 'Shoulders',
        instructions: 'Lead with elbows. Stop at shoulder height. Slight forward lean.',
        form_cues: ['Tilt dumbbells so pinky is higher than thumb', 'Lead with elbows, not hands', 'Stop at shoulder level — no higher', 'Slow 3-second descent'],
        common_mistakes: ['Shrugging traps during the movement', 'Swinging dumbbells with body', 'Going above shoulder height'],
        video_url: ''
    },
    {
        id: 'ex_face_pull',
        name: 'Face Pull',
        target_muscle: 'Shoulders',
        instructions: 'High pulley. Pull to face with external rotation. Crucial for shoulder health.',
        form_cues: ['Cable at head height or above', 'Pull to face — hands beside ears', 'External rotate at end (hands back)', 'Hold 1 second at peak'],
        common_mistakes: ['Pulling to neck/chin instead of face', 'No external rotation', 'Too heavy — sacrifices form'],
        video_url: ''
    },
    {
        id: 'ex_db_shrug',
        name: 'DB Shrugs',
        target_muscle: 'Shoulders',
        instructions: 'Straight up shrug. Pause at peak. Low rotational movement.',
        form_cues: ['Shrug straight up — no rolling', 'Hold peak for 1-2 seconds', 'Keep arms straight throughout', 'Full depression between reps'],
        common_mistakes: ['Rolling shoulders (no benefit, injury risk)', 'No pause at top', 'Using momentum'],
        video_url: ''
    },
    // Core
    {
        id: 'ex_plank',
        name: 'Plank Hold',
        target_muscle: 'Core',
        instructions: 'Brace everything. Push the floor away. Breathe steadily.',
        form_cues: ['Elbows under shoulders', 'Squeeze glutes and quads', 'Brace core as if taking a punch', 'Neutral spine — no hips up or down'],
        common_mistakes: ['Hips too high (easy mode)', 'Hips sagging (lower back strain)', 'Holding breath'],
        video_url: ''
    },
    {
        id: 'ex_woodchop',
        name: 'Cable Woodchop',
        target_muscle: 'Core',
        instructions: 'Rotate from torso, not arms. Keep arms extended.',
        form_cues: ['Pivot rear foot', 'Arms stay extended throughout', 'Initiate from obliques, not arms', 'Explosive rotation, controlled return'],
        common_mistakes: ['Bending elbows (arm exercise)', 'No hip rotation — just arm swing', 'Too heavy — sacrifices rotation quality'],
        video_url: ''
    },
    {
        id: 'ex_forearm_roller',
        name: 'Forearm Rollers',
        target_muscle: 'Forearms',
        instructions: 'Roll weight up and down under control. Use both directions.',
        form_cues: ['Arms extended at shoulder height', 'Roll by wrist flexion/extension only', 'Go both up AND down for full effect', 'Slow and controlled throughout'],
        common_mistakes: ['Arms dropping down (reduces isolation)', 'Only doing one direction', 'Too much weight — breaks form'],
        video_url: ''
    }
];
