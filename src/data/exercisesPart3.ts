import type { Exercise } from '../types';

export const EXERCISES_PART3: Exercise[] = [
    // Left-Shoulder Foundation & Rebuild
    {
        id: 'ex_shoulder_lockin_rotations',
        name: 'Left-Shoulder Lock-In (Cable/Band External Rotation + Face Pull)',
        target_muscle: 'Shoulders',
        instructions: 'Start with 15 reps LEFT-arm external rotation, then 15 Face Pulls. Wakes up left rotator cuff so your left arm does not give out halfway through pressing.',
        form_cues: ['Pin left elbow to ribs (90° bend)', 'Rotate forearm outward smoothly', 'Follow with high-pulley Face Pull to forehead', 'Hold rear-delt & cuff squeeze for 2s'],
        common_mistakes: ['Using too much weight (this is stabilizer activation)', 'Flaring elbow away from ribs', 'Shrugging traps toward ears'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-1-1-2',
        coach_tips: 'DOCTOR PROTOCOL: Your chest & triceps are strong, but your left shoulder tires mid-set. Doing these 2 sets first locks the left shoulder in its socket!'
    },
    {
        id: 'ex_single_arm_cable_lateral',
        name: 'Single-Arm Cable Lateral Raise (Left Lead)',
        target_muscle: 'Shoulders',
        instructions: 'Start with weak LEFT shoulder. Raise in scapular plane (30° forward) to shoulder height. Match reps on right. +1 extra 5-rep rest-pause set on LEFT after final set.',
        form_cues: ['Set pulley at wrist height', 'Start every set with LEFT arm', 'Raise slightly forward (30° scapular plane)', '3-second slow lowering phase'],
        common_mistakes: ['Swinging torso to move weight', 'Raising above shoulder level', 'Starting with strong right side'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-0-1-1',
        coach_tips: 'Constant cable tension builds left-shoulder endurance from the very bottom of the rep without joint grinding.'
    },
    {
        id: 'ex_single_arm_neutral_db_ohp',
        name: 'Single-Arm Neutral-Grip DB Shoulder Press (Left Lead)',
        target_muscle: 'Shoulders',
        instructions: 'Seated at 80° bench. Palm facing inward (neutral grip) to protect left shoulder joint. Left arm leads every set and sets the rep ceiling.',
        form_cues: ['Sit tall with upper back supported', 'Keep palm facing neutral (inward)', 'Left arm goes first — stop right arm at same rep', 'Rest 20s after last set for +4 extra LEFT reps'],
        common_mistakes: ['Flaring elbow 90° out to side (irritates weak shoulder)', 'Arching lower back', 'Doing more reps on right arm'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-1-1-0',
        coach_tips: 'Neutral grip opens up the shoulder joint space (subacromial space), letting you build overhead strength safely at 48+.'
    },
    // Chest & Triceps (Left-Arm Push Endurance & Hypertrophy)
    {
        id: 'ex_incline_db_left_lead',
        name: '30° Incline Dumbbell Press (Left-Arm Lead & Offset)',
        target_muscle: 'Chest',
        instructions: 'Set bench to 30° (shoulder-safe upper chest angle). Tuck elbows 45°. Focus on LEFT pec/shoulder stability. Final set: rest 20s, do 4-5 extra reps LEFT ARM ONLY.',
        form_cues: ['30° incline (1-2 notches up, not 45°)', 'Tuck elbows at 45° angle', 'Stop set the moment LEFT arm slows down', 'Final set: +4-5 rest-pause reps on LEFT arm only'],
        common_mistakes: ['Using a barbell (lets right arm take over)', 'Flaring elbows wide', 'Pushing right arm after left arm fatigues'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-1-1-0',
        coach_tips: 'WALL-BREAKER PROTOCOL: Because your left arm fades halfway through, the 20s rest-pause mini-set on the left side forces its endurance to catch up!'
    },
    {
        id: 'ex_neutral_db_chest_press',
        name: 'Neutral-Grip DB / Iso-Lateral Chest Press (Left Lead)',
        target_muscle: 'Chest',
        instructions: 'Flat or slight incline with palms angled 45°/neutral. Removes shoulder joint strain while packing mass onto chest and triceps.',
        form_cues: ['Pin left shoulder blade into bench pad', 'Palms facing 45° inward', '3-second controlled descent', 'Drive through chest & triceps without shrugging'],
        common_mistakes: ['Letting left shoulder roll forward at top', 'Bouncing dumbbells at bottom', 'Rushing the reps'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-1-1-1',
        coach_tips: 'Keep your left shoulder blade glued to the bench when pressing up—do not let the shoulder protract forward.'
    },
    {
        id: 'ex_single_arm_cable_press',
        name: 'Single-Arm Seated Cable Chest Press (Left Stamina Fix)',
        target_muscle: 'Chest',
        instructions: 'Seated or staggered stance. Press single cable handle across chest line. Start with LEFT arm. Do +1 extra rest-pause set (6 reps) on LEFT side.',
        form_cues: ['Start with weak LEFT arm', 'Keep core braced, no torso twist', 'Press slightly inward across midline', '20s rest + 6 extra reps on LEFT after Set 3'],
        common_mistakes: ['Twisting torso to push weight', 'Letting shoulder shrug up', 'Skipping the left-side extra offset reps'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '2-0-1-2',
        coach_tips: 'This directly fixes the mid-rep endurance drop-off by training your left pec, front delt, and tricep to fire together under continuous cable tension.'
    },
    {
        id: 'ex_low_to_high_cable_fly',
        name: 'Low-to-High Upper Chest Cable Fly',
        target_muscle: 'Chest',
        instructions: 'Cables at lowest setting. Scoop hands upward to collarbone level to fill out upper chest shelf without heavy shoulder joint loading.',
        form_cues: ['Step forward for light pre-stretch', 'Slight fixed bend in elbows', 'Scoop upward and inward', 'Squeeze upper chest for 2s at top'],
        common_mistakes: ['Turning it into a front delt raise', 'Bending and curling with biceps', 'Shrugging traps'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-0-1-2',
        coach_tips: 'Keep your chest high and shoulders down. Bring the inner elbows toward your midline.'
    },
    {
        id: 'ex_cross_body_tri_left_lead',
        name: 'Single-Arm Cross-Body Cable Tricep Extension (Left Lead)',
        target_muscle: 'Triceps',
        instructions: 'High cable. Pull across body at 45° angle. Start with LEFT tricep. Zero elbow tendon pain, maximum lateral & medial head lockout strength.',
        form_cues: ['Start every set with LEFT arm', 'Lock upper arm at 45° beside torso', 'Extend fully and hold lockout 1s', 'Final set: rest 20s, do +5 extra reps on LEFT'],
        common_mistakes: ['Moving shoulder during extension', 'Cutting lockout short', 'Starting with strong right arm'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-0-1-1',
        coach_tips: 'Your left tricep lockout endurance is half of why pushing feels hard mid-set. Building left-tricep stamina here carries directly over to your chest press!'
    },
    {
        id: 'ex_overhead_cable_tri_rope',
        name: 'Overhead Cable Rope Tricep Extension (Joint-Friendly)',
        target_muscle: 'Triceps',
        instructions: 'Face away from pulley. Extend overhead. Smooth cable path builds massive long-head triceps without the elbow pain of barbell skullcrushers.',
        form_cues: ['Staggered stance, abs braced', 'Elbows pointed forward at 45°', 'Deep stretch behind head', 'Full extension overhead'],
        common_mistakes: ['Arching lower back', 'Flaring elbows wide', 'Using jerky momentum'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-1-1-1',
        coach_tips: 'At 48+, cables beat free-weight skullcrushers for elbow longevity while giving 20% more stretch tension on the long head.'
    },
    // Biceps & Back Specialization
    {
        id: 'ex_bayesian_cable_curl',
        name: 'Single-Arm Bayesian Cable Curl (Left Lead)',
        target_muscle: 'Biceps',
        instructions: 'Stand facing away from low cable so arm starts slightly behind body. Extreme bicep peak & long-head stretch. Left arm leads.',
        form_cues: ['Step forward so cable pulls arm slightly back', 'Keep elbow pinned slightly behind torso', 'Curl up and supinate pinky', '3-second eccentric return'],
        common_mistakes: ['Letting elbow swing forward first', 'Using body English', 'Dropping weight fast'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-0-1-1',
        coach_tips: 'Starting with the elbow slightly behind the torso places peak tension on the bicep where it grows fastest.'
    },
    {
        id: 'ex_single_arm_preacher_curl',
        name: 'Single-Arm DB / Machine Preacher Curl (Left Lead)',
        target_muscle: 'Biceps',
        instructions: 'Arm supported on preacher pad. Isolates lower bicep and brachialis with zero shoulder strain. Left arm sets the rep count.',
        form_cues: ['Armpit snug against top of pad', 'Lower to 95% extension (keep tension)', 'Curl smoothly without lifting elbow', 'Squeeze hard at top for 1s'],
        common_mistakes: ['Dropping into hyperextension at bottom', 'Lifting shoulder to help', 'Doing extra reps on right arm'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-1-1-1',
        coach_tips: 'Never slam the bottom of a preacher curl—pause 1 second just before full lockout to protect the distal bicep tendon.'
    },
    {
        id: 'ex_underhand_lat_pulldown',
        name: 'Supinated (Underhand) Lat Pulldown (Lats + Biceps)',
        target_muscle: 'Back',
        instructions: 'Shoulder-width underhand grip. Pull bar to lower chest while driving elbows down and back. Hits lats, biceps, and scapular depressors.',
        form_cues: ['Shoulder-width palms-up grip', 'Depress left & right shoulder blades first', 'Drive elbows down to ribs', 'Control 3s stretch to top'],
        common_mistakes: ['Leaning back like a row', 'Shrugging shoulders at bottom', 'Yanking with lower back'],
        video_url: '',
        intensity_level: 'Heavy',
        tempo: '3-0-1-1',
        coach_tips: 'Double-duty movement: builds thick lower lats (which stabilize your bench press) while overloading your biceps.'
    },
    // Home Stretch-Band Arsenal
    {
        id: 'ex_band_shoulder_stabilizer',
        name: 'Stretch-Band Left-Shoulder Rotations & Pull-Aparts',
        target_muscle: 'Shoulders',
        instructions: 'Home Band Essential: 15 Left-Arm External Rotations + 15 Band Pull-Aparts at chest height. Rebuilds weak left shoulder stamina.',
        form_cues: ['Keep elbows tucked for rotations', 'Then hold band at shoulder width with straight arms', 'Pull band apart across chest by squeezing shoulder blades', 'Hold 2s on every rep'],
        common_mistakes: ['Shrugging upper traps', 'Rushing without holding peak tension', 'Bending elbows on pull-aparts'],
        video_url: '',
        intensity_level: 'Light',
        tempo: '2-0-1-2',
        coach_tips: 'You can do this at home anytime! Band resistance strengthens your left rotator cuff better than any heavy machine.'
    },
    {
        id: 'ex_band_single_arm_press',
        name: 'Stretch-Band Single-Arm Chest Press (Left Stamina Builder)',
        target_muscle: 'Chest',
        instructions: 'Anchor band behind back or door. Press forward with LEFT arm first for 15 high-endurance reps. Band tension peaks at lockout where your arm usually tires!',
        form_cues: ['Staggered stance for balance', 'Start with LEFT arm for 15 reps', 'Control the return slowly (don\'t let band snap back)', 'Do 1 extra set on LEFT side'],
        common_mistakes: ['Letting band snap arm backward', 'Rotating torso excessively', 'Stopping before full lockout'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '2-0-1-2',
        coach_tips: 'Bands get heavier the further you push—directly training your left shoulder and tricep to stop fading halfway through a rep!'
    },
    {
        id: 'ex_band_bicep_curl',
        name: 'Stretch-Band Constant-Tension Bicep Curls',
        target_muscle: 'Biceps',
        instructions: 'Stand on stretch band. Curl up and hold the top squeeze for 2 full seconds where band tension is highest.',
        form_cues: ['Stand on center of band', 'Pin elbows to sides', 'Curl to chin level and hold 2s', 'Lower over 3 seconds'],
        common_mistakes: ['Going slack at the bottom', 'Swinging back', 'Rushing the peak squeeze'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '3-0-1-2',
        coach_tips: 'Zero joint wear-and-tear, skin-splitting bicep pump.'
    },
    {
        id: 'ex_band_single_arm_tri',
        name: 'Stretch-Band Single-Arm Tricep Pushdown (Left Lead)',
        target_muscle: 'Triceps',
        instructions: 'Anchor band high (or hold over opposite shoulder). Extend LEFT arm to full lockout for 15-20 reps, then match on right.',
        form_cues: ['Start with LEFT arm', 'Pin elbow to ribcage', 'Lock out hard for 1s at bottom', 'Do +1 extra set on LEFT arm'],
        common_mistakes: ['Letting elbow drift forward', 'Half reps', 'Skipping the peak hold'],
        video_url: '',
        intensity_level: 'Moderate',
        tempo: '2-0-1-2',
        coach_tips: 'High-rep band extensions flush blood into the tricep tendons and build left-arm lockout stamina.'
    }
];
