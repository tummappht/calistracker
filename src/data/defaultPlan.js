export const DEFAULT_PLAN = {
  plan_id: "calisthenics-ppl-v1",
  title: "Calisthenics PPL + Core",
  timezone: "Asia/Bangkok",
  created_at: "2025-01-01",
  split: {
    type: "weekly_cycle",
    order: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    weekly_pattern: ["push", "pull", "legs", "push", "pull", "core", "core"]
  },
  days: [
    {
      day: "Day 1",
      title: "Push A – Fundamentals",
      duration: "45–55 min",
      focus: ["push"],
      warmup: { text: "Band pull-aparts 2×15, Wrist circles, Scapular push-ups 2×10", image: "" },
      workout: [
        { name: "Pseudo Planche Push-up", sets: "4", reps: "6–10", restSet: "90s", restNext: "90s", unit: "reps", useTimer: false, notes: "Lean forward, protract at top" },
        { name: "Pike Push-up (elevated)", sets: "3", reps: "8–10", restSet: "60–90s", restNext: "60s", unit: "reps", useTimer: false, notes: "Feet on box" },
        { name: "Diamond Push-up", sets: "3", reps: "10–15", restSet: "60s", restNext: "60s", unit: "reps", useTimer: false },
        { name: "Dip (parallel bars)", sets: "3", reps: "8–12", restSet: "90s", restNext: "60s", unit: "reps", useTimer: false }
      ],
      cooldown: { text: "Chest doorway stretch 30s each side, Shoulder cross-body stretch 30s each", image: "" }
    },
    {
      day: "Day 2",
      title: "Pull A – Vertical & Horizontal",
      duration: "50–60 min",
      focus: ["pull"],
      warmup: { text: "Dead hangs 2×20s, Band pull-aparts 2×15, Cat-cow 10 reps", image: "" },
      workout: [
        { name: "Australian Pull-up", sets: "4", reps: "8–12", restSet: "60–90s", restNext: "90s", unit: "reps", useTimer: false, notes: "Rows, squeeze scapulae" },
        { name: "Negative Pull-up (3s)", sets: "3", reps: "5–8", restSet: "90–120s", restNext: "90s", unit: "sec", useTimer: true, notes: "3s eccentric per rep" },
        { name: "Scapular Pull-up", sets: "3", reps: "10–12", restSet: "60s", restNext: "60s", unit: "reps", useTimer: false },
        { name: "Hang L-sit", sets: "3", reps: "5", restSet: "60s", restNext: "—", unit: "sec", useTimer: true, notes: "Hold 5s each rep" }
      ],
      cooldown: { text: "Lat stretch 30s each side, Bicep wall stretch 30s each", image: "" }
    },
    {
      day: "Day 3",
      title: "Legs – Squat & Calf",
      duration: "45–55 min",
      focus: ["legs"],
      warmup: { text: "Bodyweight squats 2×10, Leg swings 10 each, Ankle circles", image: "" },
      workout: [
        { name: "Pistol Squat Progression", sets: "3", reps: "5/side", restSet: "90s", restNext: "60s", unit: "reps", useTimer: false, notes: "Use assist if needed" },
        { name: "Bulgarian Split Squat", sets: "3", reps: "10/side", restSet: "60–90s", restNext: "60s", unit: "reps", useTimer: false },
        { name: "Nordic Curl Negative", sets: "3", reps: "5", restSet: "90s", restNext: "60s", unit: "reps", useTimer: false, notes: "Slow eccentric" },
        { name: "Calf Raise (single leg)", sets: "4", reps: "15–20", restSet: "45s", restNext: "45s", unit: "reps", useTimer: false },
        { name: "Glute Bridge", sets: "3", reps: "15", restSet: "60s", restNext: "—", unit: "reps", useTimer: false }
      ],
      cooldown: { text: "Quad stretch 30s each, Hamstring stretch 30s each, Pigeon pose 30s each", image: "" }
    },
    {
      day: "Day 4",
      title: "Push B – Volume",
      duration: "45–55 min",
      focus: ["push"],
      warmup: { text: "Arm circles, Wrist prep, Scapular push-ups 2×10", image: "" },
      workout: [
        { name: "Archer Push-up", sets: "3", reps: "5/side", restSet: "90s", restNext: "90s", unit: "reps", useTimer: false, notes: "Wide base" },
        { name: "Decline Push-up", sets: "3", reps: "12–15", restSet: "60s", restNext: "60s", unit: "reps", useTimer: false },
        { name: "Tricep Extension (bodyweight)", sets: "3", reps: "8–12", restSet: "60s", restNext: "60s", unit: "reps", useTimer: false },
        { name: "Planche Lean Hold", sets: "3", reps: "15–20", restSet: "60s", restNext: "—", unit: "sec", useTimer: true, notes: "Protract, lean forward" }
      ],
      cooldown: { text: "Chest stretch 30s, Tricep overhead stretch 30s each", image: "" }
    },
    {
      day: "Day 5",
      title: "Pull B – Strength",
      duration: "50–60 min",
      focus: ["pull"],
      warmup: { text: "Dead hangs 2×20s, Shoulder dislocates 10, Cat-cow 10", image: "" },
      workout: [
        { name: "Pull-up (or band-assisted)", sets: "4", reps: "3–6", restSet: "120s", restNext: "90s", unit: "reps", useTimer: false },
        { name: "Chin-up Negative (5s)", sets: "3", reps: "4–6", restSet: "90–120s", restNext: "90s", unit: "sec", useTimer: true, notes: "5s eccentric" },
        { name: "Face Pull (band)", sets: "3", reps: "15", restSet: "45s", restNext: "60s", unit: "reps", useTimer: false },
        { name: "Ring Row", sets: "3", reps: "10–12", restSet: "60s", restNext: "—", unit: "reps", useTimer: false }
      ],
      cooldown: { text: "Lat stretch 30s each, Dead hang 30s, Child's pose 30s", image: "" }
    },
    {
      day: "Day 6",
      title: "Core & Handstand Prep",
      duration: "40–50 min",
      focus: ["core", "handstand"],
      warmup: { text: "Cat-cow 10, Wrist prep, Shoulder warm-up circles", image: "" },
      workout: [
        { name: "Wall Handstand Hold", sets: "4", reps: "20–30", restSet: "90s", restNext: "60s", unit: "sec", useTimer: true, notes: "Chest to wall" },
        { name: "Hollow Body Hold", sets: "3", reps: "20–30", restSet: "60s", restNext: "60s", unit: "sec", useTimer: true },
        { name: "L-sit (floor)", sets: "3", reps: "10–15", restSet: "60s", restNext: "60s", unit: "sec", useTimer: true },
        { name: "Dragon Flag Negative", sets: "3", reps: "5", restSet: "90s", restNext: "—", unit: "reps", useTimer: false, notes: "Slow eccentric" }
      ],
      cooldown: { text: "Wrist stretches 30s each direction, Shoulder stretch 30s each", image: "" }
    },
    {
      day: "Day 7",
      title: "Recovery & Mobility",
      duration: "30–40 min",
      focus: ["core"],
      warmup: { text: "Light walking 3 min, Joint circles head to toe", image: "" },
      workout: [
        { name: "Recovery Mobility Flow", sets: "1", reps: "600–900", restSet: "—", restNext: "—", unit: "sec", useTimer: true, notes: "10–15 min continuous flow: cat-cow, world's greatest stretch, deep squat hold, thoracic rotations" },
        { name: "Foam Roll Full Body", sets: "1", reps: "300–600", restSet: "—", restNext: "—", unit: "sec", useTimer: true, notes: "5–10 min: quads, hamstrings, lats, thoracic" },
        { name: "Dead Hang (relaxed)", sets: "3", reps: "30", restSet: "30s", restNext: "30s", unit: "sec", useTimer: true, notes: "Decompress spine" },
        { name: "Diaphragmatic Breathing", sets: "1", reps: "300", restSet: "—", restNext: "—", unit: "sec", useTimer: true, notes: "5 min box breathing: 4s in, 4s hold, 4s out, 4s hold" }
      ],
      cooldown: { text: "Gentle full-body stretch sequence, savasana 2 min", image: "" }
    }
  ]
};

export function getSeedLogs(planVersion) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const fmtDate = (d) => d.toISOString().split('T')[0];

  const day2Data = planVersion.days.find(d => d.day === 'Day 2');

  return [
    {
      log_id: 'seed-log-day2-pull',
      date: fmtDate(yesterday),
      plan_id: planVersion.plan_id,
      plan_version: planVersion.version,
      plan_day: 'Day 2',
      focus: ['pull'],
      completed: true,
      exercises: [
        {
          name: 'Australian Pull-up',
          unit: 'reps',
          planned_sets: '4',
          planned_reps: '8–12',
          planned_restSet: '60–90s',
          planned_restNext: '90s',
          planned_useTimer: false,
          planned_notes: 'Rows, squeeze scapulae',
          actual_sets: [7, 8, 8, 8, 7],
          actual_unit: 'reps',
          completed: true,
          notes: 'Rest 9 min between set 3 and 4 (phone call). Still hit reps.'
        },
        {
          name: 'Negative Pull-up (3s)',
          unit: 'sec',
          planned_sets: '3',
          planned_reps: '5–8',
          planned_restSet: '90–120s',
          planned_restNext: '90s',
          planned_useTimer: true,
          planned_notes: '3s eccentric per rep',
          actual_sets: [5, 5, 5],
          actual_unit: 'sec',
          completed: true,
          notes: '3s per rep, total time logged per set'
        },
        {
          name: 'Scapular Pull-up',
          unit: 'reps',
          planned_sets: '3',
          planned_reps: '10–12',
          planned_restSet: '60s',
          planned_restNext: '60s',
          planned_useTimer: false,
          planned_notes: '',
          actual_sets: [10, 10],
          actual_unit: 'reps',
          completed: true,
          notes: 'Only 2 sets, grip was fried'
        },
        {
          name: 'Hang L-sit',
          unit: 'sec',
          planned_sets: '3',
          planned_reps: '5',
          planned_restSet: '60s',
          planned_restNext: '—',
          planned_useTimer: true,
          planned_notes: 'Hold 5s each rep',
          actual_sets: [5],
          actual_unit: 'sec',
          completed: false,
          notes: 'Only managed 1 hold'
        }
      ],
      notes: 'Good pull session despite interruption. Grip endurance is the limiter.',
      meta: {
        bodyweight_kg: 72.5,
        sleep_hours: 7,
        pain: { wrist: 1, elbow: 0, shoulder: 2, lower_back: 0 }
      },
      created_at: yesterday.toISOString(),
      updated_at: yesterday.toISOString()
    }
  ];
}
