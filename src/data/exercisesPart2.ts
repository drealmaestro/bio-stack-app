import type { Exercise } from '../types';

export const EXERCISES_PART2: Exercise[] = [
    // Legs
    {
        id: 'ex_squat',
        name: 'Barbell Squat',
        target_muscle: 'Legs',
        instructions: 'Feet shoulder-width. Break at hips and knees simultaneously. Depth below parallel.',
        form_cues: ['Push knees out over toes', 'Chest up, core braced', 'Break parallel — hip crease below knee', 'Drive through mid foot'],
        common_mistakes: ['Knees caving inward', 'Heels rising off floor', 'Squatting too shallow'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-1-1-0',
        coach_tips: 'Brace your core as if taking a punch before descending. Pull the bar down into your traps to engage your upper back.'
    },
    {
        id: 'ex_lunge',
        name: 'Walking Lunges',
        target_muscle: 'Legs',
        instructions: 'Step forward. Back knee touches ground. Keep torso upright.',
        form_cues: ['Long stride to protect front knee', 'Keep torso tall throughout', 'Front knee stays over ankle', 'Push off front heel to step through'],
        common_mistakes: ['Knee collapsing inward', 'Leaning forward', 'Too short a stride (front knee too far forward)'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '2-1-1-0',
        coach_tips: 'Take a long enough step so your front knee doesn\'t pass your toes. Push through your front heel to stand up.'
    },
    {
        id: 'ex_rdl',
        name: 'Romanian Deadlift',
        target_muscle: 'Legs',
        instructions: 'Hinge at hips, soft knees, feel hamstring stretch all the way.',
        form_cues: ['Push hips back (not bend knees)', 'Bar stays glued to legs', 'Feel the hamstring stretch before returning', 'Squeeze glutes at the top'],
        common_mistakes: ['Rounding the lower back', 'Bending knees too much (becomes squat)', 'Bar drifting away from body'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-1-1-0',
        coach_tips: 'Imagine trying to push a door shut with your hips. Keep the dumbbells or barbell dragging along your thighs throughout.'
    },
    {
        id: 'ex_bulgarian_split_squat',
        name: 'Bulgarian Split Squat',
        target_muscle: 'Legs',
        instructions: 'Rear foot elevated on bench. Drop back knee deep.',
        form_cues: ['Front foot far enough to stay over ankle', 'Stay tall — no forward lean', 'Drop straight down, not forward', 'Drive through front heel'],
        common_mistakes: ['Front foot too close (knee over toes)', 'Leaning forward excessively', 'Using rear leg to push'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-1-1-0',
        coach_tips: 'Keep your weight balanced on your front heel. Think about dropping your back knee straight down toward the floor.'
    },
    {
        id: 'ex_leg_press',
        name: 'Leg Press',
        target_muscle: 'Legs',
        instructions: 'Feet hip-width, mid-height on plate. Full ROM without letting pelvis tuck.',
        form_cues: ['Place feet hip-width, mid-platform', 'Lower until knees reach ~90°', "Don't let lower back peel off pad", 'Push through entire foot'],
        common_mistakes: ['Removing the safety stops too early', 'Pelvis tucking at bottom (butt wink)', 'Locking out knees at top'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-0-1-0',
        coach_tips: 'Do not lock your knees out fully at the top. Keep your hips pinned firmly against the seat pad throughout.'
    },
    {
        id: 'ex_leg_curl',
        name: 'Leg Curl',
        target_muscle: 'Legs',
        instructions: 'Squeeze hamstrings at peak. Control the eccentric all the way down.',
        form_cues: ['Hips stay flat on pad', 'Curl all the way to full contraction', 'Lower slowly — 3 second eccentric', 'Toes pointed slightly for more hamstring'],
        common_mistakes: ['Hips rising off pad', 'Not reaching full contraction', 'Dropping weight without control'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '3-0-1-1',
        coach_tips: 'Keep your hips pressed firmly into the bench pad to prevent your lower back from taking over the lift.'
    },
    {
        id: 'ex_calf_raise',
        name: 'Calf Raise',
        target_muscle: 'Legs',
        instructions: 'Full range — pause and stretch at bottom, squeeze at top.',
        form_cues: ['Full stretch at the bottom (heel below platform)', 'Pause 1 second at peak contraction', 'Straight up — no rolling inward/outward', '3-second controlled descent'],
        common_mistakes: ['Bouncing at the bottom (no stretch)', 'Partial reps only', 'Rolling ankles outward'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '3-1-1-2',
        coach_tips: 'Hold the stretch at the bottom for a full second to remove the Achilles tendon bounce. Explode up onto your big toes.'
    },
    // Back
    {
        id: 'ex_deadlift',
        name: 'Deadlift',
        target_muscle: 'Back',
        instructions: 'Hinge at hips, bar close to legs, drive through heels.',
        form_cues: ['Bar over mid-foot at setup', 'Hips and shoulders rise at same rate', 'Keep bar dragging up the legs', 'Lock out glutes at the top'],
        common_mistakes: ['Bar drifting away from body', 'Rounding lower back under load', 'Jerking the bar off the floor'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '2-1-1-0',
        coach_tips: 'Pull the slack out of the barbell and wedge your hips down before starting the pull. Push the floor away with your feet.'
    },
    {
        id: 'ex_row',
        name: 'Bent Over Row',
        target_muscle: 'Back',
        instructions: 'Flat back, hinge at 45°. Pull bar to lower sternum. Lead with elbows.',
        form_cues: ['Torso at ~45° angle', 'Pull bar to lower chest/upper abs', 'Lead with elbows, not hands', 'Squeeze back at top'],
        common_mistakes: ['Too upright (becomes bicep exercise)', 'Jerking torso to help the lift', 'Pulling to wrong point (too high)'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '2-0-1-1',
        coach_tips: 'Pull the bar toward your belly button, not your chest. Keep your shoulder blades squeezed tightly at the peak.'
    },
    {
        id: 'ex_lat_pulldown',
        name: 'Lat Pulldown',
        target_muscle: 'Back',
        instructions: 'Wide grip. Pull bar to upper chest. Retract scapula first.',
        form_cues: ['Lean back slightly at ~80°', 'Initiate by depressing shoulder blades', 'Pull bar to upper chest', 'Control bar back up — stretch lats fully'],
        common_mistakes: ['Pulling behind the neck (neck strain)', 'Arms doing all the work (no lat engagement)', 'Not extending fully between reps'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-0-1-1',
        coach_tips: 'Pull with your elbows, not your hands. Think about pulling your elbows down into your back pockets.'
    },
    {
        id: 'ex_pull_up',
        name: 'Weighted Pull-Ups',
        target_muscle: 'Back',
        instructions: 'Full hang to chin over bar. No kipping.',
        form_cues: ['Dead hang at bottom (full stretch)', 'Pull elbows down and back', 'Chin clears the bar', 'Lower under full control'],
        common_mistakes: ['Kipping for momentum', 'Not reaching a full dead hang', 'Chin not clearing bar'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-0-1-0',
        coach_tips: 'Initiate the movement by packing your shoulders down (active hang) before bending your arms. Control the descent.'
    },
    {
        id: 'ex_single_arm_row',
        name: 'Single-Arm DB Row',
        target_muscle: 'Back',
        instructions: 'Brace on bench. Let dumbbell hang for full lat stretch, then row to hip.',
        form_cues: ['Let dumbbell hang straight down first', 'Pull elbow back toward hip', 'Rotate torso slightly for range', 'Pause and squeeze at top'],
        common_mistakes: ['Pulling with bicep, not back', 'Rotating too much (become twisting movement)', 'Short ROM — no stretch at bottom'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '2-0-1-1',
        coach_tips: 'Pull the dumbbell in an arc toward your hip rather than straight up. This isolates the lower lat much better.'
    },
    // Shoulders
    {
        id: 'ex_ohp',
        name: 'Overhead Press',
        target_muscle: 'Shoulders',
        instructions: 'From collarbone to full lockout. Brace core, stay tight.',
        form_cues: ['Grip slightly wider than shoulders', 'Press bar in a straight vertical path', 'Move head back on the way up, forward after', 'Lock out arms fully at top'],
        common_mistakes: ['Pressing bar in front instead of slightly behind head', 'Excessive lower back arch', 'Not locking out at the top'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-0-1-0',
        coach_tips: 'Squeeze your glutes and brace your abs as hard as possible to create a bulletproof base and protect your lower back.'
    },
    {
        id: 'ex_lateral_raise',
        name: 'Lateral Raise',
        target_muscle: 'Shoulders',
        instructions: 'Lead with elbows. Stop at shoulder height. Slight forward lean.',
        form_cues: ['Tilt dumbbells so pinky is higher than thumb', 'Lead with elbows, not hands', 'Stop at shoulder level — no higher', 'Slow 3-second descent'],
        common_mistakes: ['Shrugging traps during the movement', 'Swinging dumbbells with body', 'Going above shoulder height'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-0-1-2',
        coach_tips: 'Think about pushing the dumbbells OUT to the walls, rather than pulling them up. Keep your shoulders down (don\'t shrug).'
    },
    {
        id: 'ex_face_pull',
        name: 'Face Pull',
        target_muscle: 'Shoulders',
        instructions: 'High pulley. Pull to face with external rotation. Crucial for shoulder health.',
        form_cues: ['Cable at head height or above', 'Pull to face — hands beside ears', 'External rotate at end (hands back)', 'Hold 1 second at peak'],
        common_mistakes: ['Pulling to neck/chin instead of face', 'No external rotation', 'Too heavy — sacrifices form'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-0-1-2',
        coach_tips: 'Pull the middle of the rope toward your nose while pulling the ends apart. Show off your biceps at the peak of the movement.'
    },
    {
        id: 'ex_db_shrug',
        name: 'DB Shrugs',
        target_muscle: 'Shoulders',
        instructions: 'Straight up shrug. Pause at peak. Low rotational movement.',
        form_cues: ['Shrug straight up — no rolling', 'Hold peak for 1-2 seconds', 'Keep arms straight throughout', 'Full depression between reps'],
        common_mistakes: ['Rolling shoulders (no benefit, injury risk)', 'No pause at top', 'Using momentum'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '2-1-1-2',
        coach_tips: 'Hold the contraction at the top for 2 seconds. Never roll your shoulders; it does nothing for traps and risks rotator cuff injury.'
    },
    // Core
    {
        id: 'ex_plank',
        name: 'Plank Hold',
        target_muscle: 'Core',
        instructions: 'Brace everything. Push the floor away. Breathe steadily.',
        form_cues: ['Elbows under shoulders', 'Squeeze glutes and quads', 'Brace core as if taking a punch', 'Neutral spine — no hips up or down'],
        common_mistakes: ['Hips too high (easy mode)', 'Hips sagging (lower back strain)', 'Holding breath'],
        video_url: '',
        intensity_level: 'Light',
        tempo: 'Static',
        coach_tips: 'Keep your body in a perfectly straight line. Active recovery: pull your elbows and toes toward each other to maximize tension.'
    },
    {
        id: 'ex_woodchop',
        name: 'Cable Woodchop',
        target_muscle: 'Core',
        instructions: 'Rotate from torso, not arms. Keep arms extended.',
        form_cues: ['Pivot rear foot', 'Arms stay extended throughout', 'Initiate from obliques, not arms', 'Explosive rotation, controlled return'],
        common_mistakes: ['Bending elbows (arm exercise)', 'No hip rotation — just arm swing', 'Too heavy — sacrifices rotation quality'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-0-1-1',
        coach_tips: 'Keep your arms straight and rotate entirely through your torso. Pivot your back foot as you twist.'
    },
    {
        id: 'ex_forearm_roller',
        name: 'Forearm Rollers',
        target_muscle: 'Forearms',
        instructions: 'Roll weight up and down under control. Use both directions.',
        form_cues: ['Arms extended at shoulder height', 'Roll by wrist flexion/extension only', 'Go both up AND down for full effect', 'Slow and controlled throughout'],
        common_mistakes: ['Arms dropping down (reduces isolation)', 'Only doing one direction', 'Too much weight — breaks form'],
        video_url: '',
        intensity_level: 'Light',
        tempo: 'Controlled',
        coach_tips: 'Keep your arms fully locked out straight in front of you. Roll the weight up slowly, then resist it as you unroll it.'
    }
];
