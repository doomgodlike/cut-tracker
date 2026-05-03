/*
  VARUN'S PERSONALIZED 4-DAY UPPER/LOWER SPLIT
  
  Mon: Upper A (Push) — chest, shoulders, triceps
  Tue: Lower A (Quad) — quads, abs, obliques
  Thu: Upper B (Pull) — back, traps, rear delts, biceps
  Fri: Lower B (Hinge) — hamstrings, glutes, calves, obliques
  Flex: Standalone cardio OR weak point work
  
  Priority muscles: traps, side/rear delts, upper chest, all legs, obliques
  Limitations: shoulder mobility (no barbell back squat, no behind-neck press)
  Goals: muscle-up (from 5 pull-ups), 2km run, 12-15% BF
*/

export const SPLIT = {
  title: "Varun's Cut Protocol",
  days: [
    {
      id: 'upper_a',
      nm: 'Upper A — Push',
      day: 'Monday',
      focus: 'Chest, shoulders, triceps',
      priority: ['Upper chest', 'Side delts'],
      ex: [
        {
          slot: 'Compound press',
          purpose: 'Upper chest builder',
          repRange: '8-12',
          isLower: false,
          options: [
            { id: 'smith_incline', nm: 'Smith incline press', selected: true },
            { id: 'db_incline', nm: 'Incline DB press' },
            { id: 'machine_incline', nm: 'Machine chest press (incline)' },
          ],
        },
        {
          slot: 'Shoulder press',
          purpose: 'Side delt emphasis',
          repRange: '8-12',
          isLower: false,
          options: [
            { id: 'machine_ohp', nm: 'Seated machine OHP', selected: true },
            { id: 'smith_ohp', nm: 'Smith machine OHP' },
            { id: 'db_ohp', nm: 'DB seated press' },
          ],
        },
        {
          slot: 'Lateral raise',
          purpose: 'Side delt isolation',
          repRange: '12-15',
          isLower: false,
          options: [
            { id: 'cable_lateral', nm: 'Cable lateral raise', selected: true },
            { id: 'db_lateral', nm: 'DB lateral raise' },
            { id: 'machine_lateral', nm: 'Lateral raise machine' },
          ],
        },
        {
          slot: 'Tricep isolation',
          purpose: 'Arm size',
          repRange: '10-15',
          isLower: false,
          options: [
            { id: 'cable_pushdown', nm: 'Cable rope pushdown', selected: true },
            { id: 'overhead_ext', nm: 'Overhead cable extension' },
            { id: 'machine_dip', nm: 'Machine dip' },
          ],
        },
      ],
    },
    {
      id: 'lower_a',
      nm: 'Lower A — Quad',
      day: 'Tuesday',
      focus: 'Quads, abs, obliques',
      priority: ['All legs', 'Abs', 'Obliques'],
      ex: [
        {
          slot: 'Compound squat',
          purpose: 'Primary quad builder',
          repRange: '8-12',
          isLower: true,
          options: [
            { id: 'hack_squat', nm: 'Hack squat', selected: true },
            { id: 'leg_press_squat', nm: 'Leg press (narrow high)' },
            { id: 'smith_squat', nm: 'Smith machine squat' },
          ],
        },
        {
          slot: 'Leg press',
          purpose: 'Quad volume',
          repRange: '10-15',
          isLower: true,
          options: [
            { id: 'leg_press', nm: 'Leg press', selected: true },
          ],
        },
        {
          slot: 'Quad isolation',
          purpose: 'Direct quad work',
          repRange: '12-15',
          isLower: true,
          options: [
            { id: 'leg_ext', nm: 'Leg extension', selected: true },
            { id: 'bulgarian', nm: 'Bulgarian split squat (DB)' },
            { id: 'pendulum', nm: 'Pendulum squat' },
          ],
        },
        {
          slot: 'Single leg (optional)',
          purpose: 'Balance + stability — skip on low energy',
          repRange: '10-12',
          isLower: true,
          optional: true,
          options: [
            { id: 'bulgarian_opt', nm: 'Bulgarian split squat (DB)', selected: true },
          ],
        },
        {
          slot: 'Abs',
          purpose: 'Weighted core — abs are there, hidden under fat',
          repRange: '12-15',
          isLower: false,
          options: [
            { id: 'cable_crunch', nm: 'Cable crunch', selected: true },
            { id: 'ab_machine', nm: 'Seated ab crunch machine' },
            { id: 'hanging_leg', nm: 'Hanging leg raise' },
          ],
        },
        {
          slot: 'Obliques',
          purpose: 'Frames the abs',
          repRange: '12-15',
          isLower: false,
          options: [
            { id: 'cable_woodchop', nm: 'Cable woodchop', selected: true },
            { id: 'cable_sidebend', nm: 'Cable side bend' },
            { id: 'pallof', nm: 'Pallof press' },
          ],
        },
      ],
    },
    {
      id: 'upper_b',
      nm: 'Upper B — Pull',
      day: 'Thursday',
      focus: 'Back, traps, rear delts, biceps',
      priority: ['Traps', 'Rear delts'],
      ex: [
        {
          slot: 'Compound row',
          purpose: 'Back thickness',
          repRange: '8-12',
          isLower: false,
          options: [
            { id: 'smith_row', nm: 'Smith machine row', selected: true },
            { id: 'tbar_row', nm: 'Chest-supported T-bar row' },
            { id: 'cable_row', nm: 'Seated cable row' },
          ],
        },
        {
          slot: 'Vertical pull',
          purpose: 'Lat width + muscle-up progression',
          repRange: '8-12',
          isLower: false,
          options: [
            { id: 'lat_pulldown', nm: 'Lat pulldown (wide)', selected: true },
            { id: 'pullups', nm: 'Pull-ups (muscle-up track)' },
            { id: 'neutral_pulldown', nm: 'Neutral grip pulldown' },
          ],
        },
        {
          slot: 'Trap work',
          purpose: 'Priority — bigger traps',
          repRange: '10-15',
          isLower: false,
          options: [
            { id: 'smith_shrug', nm: 'Smith machine shrug', selected: true },
            { id: 'db_shrug', nm: 'Dumbbell shrug' },
            { id: 'trap_bar_shrug', nm: 'Trap bar shrug' },
          ],
        },
        {
          slot: 'Rear delt',
          purpose: 'Round shoulder look + posture fix',
          repRange: '12-15',
          isLower: false,
          options: [
            { id: 'face_pull', nm: 'Cable face pull', selected: true },
            { id: 'reverse_pec', nm: 'Reverse pec deck' },
            { id: 'bent_fly', nm: 'Bent-over DB reverse fly' },
          ],
        },
        {
          slot: 'Bicep 1',
          purpose: 'Arm size — long head',
          repRange: '10-12',
          isLower: false,
          options: [
            { id: 'face_away_curl', nm: 'Face-away cable curl', selected: true },
            { id: 'incline_curl', nm: 'Incline DB curl' },
          ],
        },
        {
          slot: 'Bicep 2',
          purpose: 'Arm size — short head / peak',
          repRange: '10-12',
          isLower: false,
          options: [
            { id: 'preacher', nm: 'Preacher curl machine', selected: true },
            { id: 'cable_curl', nm: 'Cable curl (EZ bar)' },
          ],
        },
      ],
    },
    {
      id: 'lower_b',
      nm: 'Lower B — Hinge',
      day: 'Friday',
      focus: 'Hamstrings, glutes, calves, obliques',
      priority: ['Hamstrings', 'Glutes'],
      ex: [
        {
          slot: 'Hip hinge',
          purpose: 'Posterior chain builder',
          repRange: '8-12',
          isLower: true,
          options: [
            { id: 'barbell_rdl', nm: 'Barbell Romanian deadlift', selected: true },
            { id: 'db_rdl', nm: 'Dumbbell RDL' },
            { id: 'back_ext', nm: '45° back extension (weighted)' },
          ],
        },
        {
          slot: 'Leg curl',
          purpose: 'Hamstring isolation',
          repRange: '10-15',
          isLower: true,
          options: [
            { id: 'seated_curl', nm: 'Seated leg curl', selected: true },
            { id: 'lying_curl', nm: 'Lying leg curl' },
          ],
        },
        {
          slot: 'Glute work',
          purpose: 'Glute isolation',
          repRange: '10-12',
          isLower: true,
          options: [
            { id: 'hip_thrust_m', nm: 'Hip thrust machine', selected: true },
            { id: 'bb_hip_thrust', nm: 'Barbell hip thrust' },
            { id: 'cable_pull_thru', nm: 'Cable pull-through' },
          ],
        },
        {
          slot: 'Calf work',
          purpose: 'Go light — build slowly due to calf pain history',
          repRange: '15-20',
          isLower: true,
          options: [
            { id: 'seated_calf', nm: 'Seated calf raise', selected: true },
            { id: 'standing_calf', nm: 'Standing calf raise' },
            { id: 'lp_calf', nm: 'Leg press calf raise' },
          ],
        },
        {
          slot: 'Obliques',
          purpose: 'Second hit this week — different from Tuesday',
          repRange: '12-15',
          isLower: false,
          options: [
            { id: 'cable_sidebend_b', nm: 'Cable side bend', selected: true },
            { id: 'pallof_b', nm: 'Pallof press' },
            { id: 'hanging_oblique', nm: 'Hanging oblique raise' },
          ],
        },
      ],
    },
  ],
};

// ── Get selected exercise for a slot ──
export function getSelectedExercise(exSlot, savedSelections) {
  if (savedSelections?.[exSlot.slot]) {
    const found = exSlot.options.find(o => o.id === savedSelections[exSlot.slot]);
    if (found) return found;
  }
  return exSlot.options.find(o => o.selected) || exSlot.options[0];
}

// ── MEASUREMENT GUIDE ──
export const MEASUREMENTS = [
  { id: 'weight', nm: 'Weight', unit: 'kg', how: 'Morning, after bathroom, before food/water. Same scale every time.' },
  { id: 'waist', nm: 'Waist', unit: 'cm', how: 'At navel level, relaxed (don\'t suck in). Tape flat against skin. Exhale normally, then measure.' },
  { id: 'chest', nm: 'Chest', unit: 'cm', how: 'Tape around widest part of chest (nipple line). Arms relaxed at sides. Exhale normally.' },
  { id: 'arm_l', nm: 'Left arm', unit: 'cm', how: 'Flexed, at the peak of bicep. Tape around the thickest point.' },
  { id: 'arm_r', nm: 'Right arm', unit: 'cm', how: 'Same as left. Track both — imbalances are common.' },
  { id: 'thigh_l', nm: 'Left thigh', unit: 'cm', how: 'Standing, relaxed. Tape at widest point, usually ~5 cm below crotch.' },
  { id: 'thigh_r', nm: 'Right thigh', unit: 'cm', how: 'Same as left.' },
  { id: 'neck', nm: 'Neck', unit: 'cm', how: 'Below Adam\'s apple, tape level. Used in BF% estimation formulas.' },
];

// ── EXERCISE GUIDE (form tips + YouTube links) ──
export const GUIDE = [
  {
    cat: 'Upper A — Push',
    exs: [
      { nm: 'Smith incline press', hw: 'Set bench to 30°. Unrack, lower to upper chest, press up. Elbows at 45° — not flared. Control the negative.', vid: 'https://youtube.com/results?search_query=smith+machine+incline+press+form' },
      { nm: 'Seated machine OHP', hw: 'Adjust seat so handles are at ear level. Press up without locking elbows. Controlled negative.', vid: 'https://youtube.com/results?search_query=seated+machine+overhead+press+form' },
      { nm: 'Cable lateral raise', hw: 'Stand sideways to cable. Handle in far hand. Raise to shoulder height, slight forward lean. Slow eccentric.', vid: 'https://youtube.com/results?search_query=cable+lateral+raise+form' },
      { nm: 'Cable rope pushdown', hw: 'Elbows pinned to sides. Push down, spread rope at bottom. Squeeze triceps. Don\'t lean forward.', vid: 'https://youtube.com/results?search_query=cable+rope+tricep+pushdown+form' },
    ],
  },
  {
    cat: 'Lower A — Quad',
    exs: [
      { nm: 'Hack squat', hw: 'Feet shoulder width, mid-platform. Go deep — at least parallel. Push through heels. Back flat against pad.', vid: 'https://youtube.com/results?search_query=hack+squat+machine+form' },
      { nm: 'Leg press', hw: 'Feet high and narrow for quad focus. Full range — knees to 90°. Don\'t lock knees at top.', vid: 'https://youtube.com/results?search_query=leg+press+quad+focus+form' },
      { nm: 'Leg extension', hw: 'Adjust pad to sit above ankle. Extend fully, squeeze quad at top for 1 second. Slow negative.', vid: 'https://youtube.com/results?search_query=leg+extension+form' },
      { nm: 'Cable crunch', hw: 'Kneel facing away from cable. Hold rope behind head. Crunch DOWN (curl spine), not forward. Think ribs to hips.', vid: 'https://youtube.com/results?search_query=kneeling+cable+crunch+form' },
      { nm: 'Cable woodchop', hw: 'High pulley, step away. Rotate from hips, not arms. Pull diagonally across body. Control the return.', vid: 'https://youtube.com/results?search_query=cable+woodchop+form' },
    ],
  },
  {
    cat: 'Upper B — Pull',
    exs: [
      { nm: 'Smith machine row', hw: 'Bend to 45°, overhand grip. Pull bar to lower chest. Squeeze shoulder blades together. Lower slowly.', vid: 'https://youtube.com/results?search_query=smith+machine+bent+over+row+form' },
      { nm: 'Lat pulldown', hw: 'Wide grip, lean back 15°. Pull to upper chest. Elbows drive down and back. Slow eccentric stretch.', vid: 'https://youtube.com/results?search_query=wide+grip+lat+pulldown+form' },
      { nm: 'Smith machine shrug', hw: 'Overhand grip, stand straight. Shrug UP (not forward/back). Hold at top 2 seconds. Heavy weight, moderate reps.', vid: 'https://youtube.com/results?search_query=smith+machine+shrug+form' },
      { nm: 'Cable face pull', hw: 'Rope at face height. Pull to forehead, spread rope at peak. External rotate at top. Squeeze rear delts.', vid: 'https://youtube.com/results?search_query=cable+face+pull+form' },
      { nm: 'Face-away cable curl', hw: 'Face away from low cable. Step forward for tension. Curl with elbows fixed. Great long head stretch.', vid: 'https://youtube.com/results?search_query=face+away+cable+curl+form' },
      { nm: 'Preacher curl machine', hw: 'Arm pad supports upper arm. Curl up, squeeze at top. Slow negative — this is where the growth happens.', vid: 'https://youtube.com/results?search_query=preacher+curl+machine+form' },
    ],
  },
  {
    cat: 'Lower B — Hinge',
    exs: [
      { nm: 'Barbell Romanian deadlift', hw: 'Slight knee bend, push hips BACK. Bar stays close to legs. Feel hamstring stretch. Stop when you feel max stretch, drive hips forward.', vid: 'https://youtube.com/results?search_query=barbell+romanian+deadlift+form' },
      { nm: 'Seated/Lying leg curl', hw: 'Adjust pad position. Curl heels toward glutes. Squeeze at peak. Slow eccentric — 3 second negative.', vid: 'https://youtube.com/results?search_query=seated+leg+curl+form' },
      { nm: 'Hip thrust machine', hw: 'Upper back on pad, feet flat. Drive hips up, squeeze glutes at top. Don\'t hyperextend lower back.', vid: 'https://youtube.com/results?search_query=hip+thrust+machine+form' },
      { nm: 'Seated calf raise', hw: 'Full range of motion. Stretch at bottom (2 sec), squeeze at top (2 sec). Light weight, high reps. Stop if calf pain.', vid: 'https://youtube.com/results?search_query=seated+calf+raise+form' },
      { nm: 'Cable side bend', hw: 'Stand sideways to cable. Far hand behind head. Lean away from cable, return to start. Control throughout.', vid: 'https://youtube.com/results?search_query=cable+side+bend+form' },
    ],
  },
];
