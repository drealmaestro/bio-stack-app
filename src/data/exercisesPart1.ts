import type { Exercise } from '../types';

export const EXERCISES_PART1: Exercise[] = [
    // Triceps
    {
        id: 'ex_skullcrusher',
        name: 'Skullcrushers',
        target_muscle: 'Triceps',
        instructions: 'Lie on bench, lower bar to forehead. Keep elbows tucked and stationary.',
        form_cues: ['Keep elbows pointing straight up', 'Lower bar to forehead, not behind head', 'Lock upper arms — only forearms move', 'Control the eccentric (3 sec down)'],
        common_mistakes: ['Elbows flaring out wide', 'Lowering bar behind the head', 'Using momentum on the concentric'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-0-1-0',
        coach_tips: 'Pin your elbows and avoid letting them flare. Lower the bar under strict control to your hairline.'
    },
    {
        id: 'ex_pushdown',
        name: 'Cable Pushdowns',
        target_muscle: 'Triceps',
        instructions: 'Keep elbows pinned at sides. Full extension at bottom, squeeze hard.',
        form_cues: ['Elbows stay at your sides throughout', 'Full lockout at the bottom', 'Lean slightly forward', 'Squeeze triceps at full extension'],
        common_mistakes: ['Letting elbows drift forward', 'Not reaching full extension', 'Using body momentum'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-0-1-1',
        coach_tips: 'Lean slightly forward at the hips and squeeze your triceps hard at the bottom as if trying to break the bar in half.'
    },
    {
        id: 'ex_dips',
        name: 'Dips',
        target_muscle: 'Triceps',
        instructions: 'Keep torso upright for tricep focus. Lower until elbows reach 90°.',
        form_cues: ['Stay upright — lean forward shifts to chest', 'Lower to 90° elbow angle', 'Elbows close to body', 'Full lockout at the top'],
        common_mistakes: ['Leaning too far forward', 'Not going deep enough', 'Flaring elbows out'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-1-1-0',
        coach_tips: 'Keep your torso as vertical as possible to keep tension on the triceps. If you lean forward, you transition the load to the chest.'
    },
    {
        id: 'ex_close_grip_bench',
        name: 'Close-Grip Bench',
        target_muscle: 'Triceps',
        instructions: 'Hands shoulder-width. Keep elbows tucked, full ROM.',
        form_cues: ['Hands shoulder-width apart (not too close)', 'Tuck elbows to sides at ~45°', 'Touch chest on every rep', 'Drive bar straight up'],
        common_mistakes: ['Hands too close (wrist strain)', 'Wide elbows (becomes chest exercise)', 'Partial range of motion'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-0-1-0',
        coach_tips: 'Grip should be shoulder-width. Do not place hands too close together, as this puts unnecessary strain on your wrists.'
    },
    {
        id: 'ex_overhead_tri_ext',
        name: 'Overhead Tricep Ext',
        target_muscle: 'Triceps',
        instructions: 'Get a deep stretch at bottom. Keep elbows high and tight.',
        form_cues: ['Elbows point forward, not flared', 'Lower weight behind head for deep stretch', 'Brace core, no lower back arch', 'Full extension at top'],
        common_mistakes: ['Elbows drifting wide', 'Arching lower back to compensate', 'Skipping the stretch position'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '3-0-1-1',
        coach_tips: 'Focus on getting a deep stretch at the bottom of the movement. Keep your abs tight so you don\'t arch your lower back.'
    },
    // Biceps
    {
        id: 'ex_hammer',
        name: 'Hammer Curls',
        target_muscle: 'Biceps',
        instructions: 'Palms facing each other. Targets brachialis and brachioradialis.',
        form_cues: ['Neutral grip throughout the movement', 'No swinging — pin elbows at sides', 'Full extension at bottom', 'Slow eccentric (2-3 sec)'],
        common_mistakes: ['Supinating the wrist (defeats the purpose)', 'Swinging the torso', 'Cutting the range short'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '2-0-1-1',
        coach_tips: 'Keep your palms facing each other. Squeeze at the top to build thickness in your outer biceps and forearms.'
    },
    {
        id: 'ex_barbell_curl',
        name: 'Barbell Curls',
        target_muscle: 'Biceps',
        instructions: 'Strict form. No swinging. Squeeze at peak contraction.',
        form_cues: ['Stand tall, elbows pinned to sides', 'Curl with your forearms, not shoulders', 'Squeeze hard at the top', '3-second controlled descent'],
        common_mistakes: ['Swinging hips for momentum', 'Elbows drifting forward at top', 'Dropping weight without control'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-0-1-1',
        coach_tips: 'Do not swing! Stand tall and pin your elbows to your ribcage. Control the lowering phase completely.'
    },
    {
        id: 'ex_incline_db_curl',
        name: 'Incline DB Curl',
        target_muscle: 'Biceps',
        instructions: 'Bench at 45°. Arms hang behind body for maximum stretch.',
        form_cues: ['Let arm hang straight down for full stretch', 'Curl without swinging arm forward', 'Supinate at top for peak contraction', 'Resist the weight on the way down'],
        common_mistakes: ['Bench angle too steep (reduces stretch)', 'Swinging arms forward to initiate', 'Not supinating at contraction'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-0-1-1',
        coach_tips: 'Keep your shoulders back against the bench. Let your arms hang straight down for an intense stretch at the bottom.'
    },
    {
        id: 'ex_spider_curl',
        name: 'Spider Curls',
        target_muscle: 'Biceps',
        instructions: 'Chest on incline bench. Isolates biceps fully — no body swing possible.',
        form_cues: ['Chest flat on the bench', 'Arms hang straight down', 'Curl strictly with forearms', 'Full extension between reps'],
        common_mistakes: ['Pulling elbows back (shoulder involvement)', 'Not extending fully at bottom', 'Going too heavy'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-0-1-2',
        coach_tips: 'Keep your upper arms pointing straight down. Squeeze your biceps hard at the top for 2 seconds to isolate the peak.'
    },
    // Chest
    {
        id: 'ex_incline_press',
        name: 'Incline DB Press',
        target_muscle: 'Chest',
        instructions: 'Bench at 30-45°. Focus on upper chest. Full ROM.',
        form_cues: ['Set bench to 30-45° (not higher)', 'Retract scapula before pressing', 'Lower to chest level, elbows at ~75°', 'Press in a slight arc, not straight up'],
        common_mistakes: ['Bench too steep (becomes shoulder press)', 'Bouncing off chest', 'Flaring elbows 90°'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-0-1-0',
        coach_tips: 'Keep your shoulder blades pinched together and down on the bench. Lower the weights under control to your upper chest.'
    },
    {
        id: 'ex_cable_fly_high',
        name: 'High-to-Low Cable Fly',
        target_muscle: 'Chest',
        instructions: 'High pulley. Step forward, bring hands together at waist. Targets lower chest.',
        form_cues: ['Cables set above shoulder height', 'Keep slight bend in elbows', 'Pull in a downward arc, meet at hip level', 'Squeeze chest at endpoint'],
        common_mistakes: ['Straightening arms (becomes tricep movement)', 'Pulling with hands not chest', 'Not enough forward lean'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-0-1-2',
        coach_tips: 'Imagine hugging a large tree. Focus entirely on bringing your biceps together at the bottom to maximize chest contraction.'
    },
    {
        id: 'ex_incline_barbell_press',
        name: 'Incline Barbell Press',
        target_muscle: 'Chest',
        instructions: 'Bench at 30°. Pause at chest. Drive explosively.',
        form_cues: ['Grip slightly wider than shoulder width', 'Bar touches upper chest', 'Leg drive through heels', 'Keep wrists stacked over elbows'],
        common_mistakes: ['Bar touching too low (flat chest area)', 'Losing upper back arch', 'Uneven bar path'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-1-1-0',
        coach_tips: 'Touch the bar high on your chest, near the collarbone, and press it back in a slight diagonal line over your face.'
    },
    {
        id: 'ex_flat_db_press',
        name: 'Flat Dumbbell Press',
        target_muscle: 'Chest',
        instructions: 'Full ROM. Squeeze chest at top. Control descent.',
        form_cues: ['Lie flat, feet on floor', 'Lower dumbbells to chest level', 'Press and squeeze at full extension', 'Slight inward arc on the press'],
        common_mistakes: ['Dumbbells too wide at bottom', 'No chest squeeze at top', 'Rushing the eccentric'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-0-1-0',
        coach_tips: 'Drive your feet into the floor to stabilize your body. Keep a slight arch in your lower back, but keep your glutes on the bench.'
    },
    {
        id: 'ex_pec_deck',
        name: 'Pec Deck Fly',
        target_muscle: 'Chest',
        instructions: 'Maintain constant tension. Squeeze hard when arms meet.',
        form_cues: ['Sit tall, chest up', 'Slight bend in elbows throughout', 'Feel the stretch at the open position', 'Squeeze for 1 second at close'],
        common_mistakes: ['Letting arms go too far back (shoulder risk)', 'Moving elbows instead of chest', 'No pause/squeeze at contraction'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-0-1-2',
        coach_tips: 'Sit tall and push your chest forward. Do not let your shoulders roll forward at the end of the movement.'
    }
];
