// Every visible string lives here. Facts come from docs/PROFILE.md only.
// Assumptions to confirm with Ashish:
//   - hero line "I teach and make machines." (his own wording, 2026-10-24)
//   - JeevI reward curves: only the converged values are real; the curve shapes are drawn as a
//     generic learning curve until real training logs exist (DESIGN.md §7, question 4)
//   - production URL https://haitomns.dev (the current domain)

export const site = {
  name: 'Ashish Gupta',
  role: 'AI & Robotics Engineer',
  url: 'https://haitomns.dev',
  description:
    'Ashish Gupta builds robots that see and software people use: TomatoBot, the JeevI quadruped, DocLipi, RedSoil. B.Tech AI at Kathmandu University, Nepal.',
  email: 'haitomns@gmail.com',
  place: 'Kathmandu University, Nepal',
  lede: 'I teach and make machines.',
  socials: [
    { label: 'GitHub', href: 'https://github.com/haitomnsg' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/haitomnsg' },
    { label: 'Instagram', href: 'https://www.instagram.com/haitomnsg' },
  ],
};

/** The hero's two instruments. */
export const readings = {
  jeevi: {
    label: 'JeevI, locomotion',
    status: 'Converged',
    value: 256.27,
    unit: 'reward',
    note: 'PPO in Isaac Lab, flat terrain',
    // converged reward per terrain (PROFILE §3); the curve shapes are illustrative
    curves: [
      { key: 'flat', label: 'Flat terrain', final: 256.27, rate: 5.2 },
      { key: 'rough', label: 'Rough terrain', final: 191.83, rate: 3.9 },
      { key: 'obstacles', label: 'Obstacles', final: 184.05, rate: 3.2 },
    ],
    axis: [300, 200, 100],
  },
  tomatobot: {
    label: 'TomatoBot v2',
    value: 88,
    unit: '%',
    caption: 'ripeness detection in the field',
    tag: 'Published in IJICTDC, 2026',
  },
};

export type Chapter = {
  id: string;
  n: number;
  title: string;
  line: string;
  image: string;
  imageAlt: string;
  items: { name: string; text: string }[];
};

export const chapters: Chapter[] = [
  {
    id: 'robotics',
    n: 1,
    title: 'Robotics',
    line: 'Machines that move on their own.',
    image: '/chapters/robotics.webp',
    imageAlt: 'TomatoBot v2 on grass: a black wheeled base carrying a robotic arm and a tomato cup.',
    items: [
      { name: 'TomatoBot v2', text: 'Finds ripe tomatoes with YOLOv11, 88% in the field, and picks them with a 6-DOF arm. Published in IJICTDC, 2026.' },
      { name: 'JeevI', text: 'A 12-joint quadruped that learned to walk with PPO in NVIDIA Isaac Lab, on flat, rough and obstacle terrain.' },
      { name: 'Face tracking robot', text: 'Follows a person, or traffic signs, with an MU vision sensor on an Arduino.' },
      { name: 'Rescue vehicle', text: 'An Arduino rover with an arm, a drone, fire suppression and a camera.' },
    ],
  },
  {
    id: 'ai',
    n: 2,
    title: 'AI',
    line: 'Models that read, sort and recognise.',
    image: '/chapters/ai.webp',
    imageAlt: 'Phulbari app screens showing a red rose identified by the flower classifier.',
    items: [
      { name: 'DocLipi', text: 'Sorts bank documents, reads Nepali and English, and answers questions about them in plain language.' },
      { name: 'Phulbari', text: 'Recognises 100 flower species and waters the plant when the soil runs dry. ICT Award 2025 semi-finalist.' },
      { name: 'Recyclo', text: 'Tells you what kind of waste you are holding and what you could make of it.' },
      { name: 'DementiaBot', text: 'Built with team DizzyBits for the Harvard Health Hackathon. Top 20.' },
    ],
  },
  {
    id: 'software',
    n: 3,
    title: 'Software',
    line: 'Systems people use every working day.',
    image: '/chapters/software.webp',
    imageAlt: 'ArthaVidhi dashboard screens: invoices, inventory and reports in orange and white.',
    items: [
      { name: 'RedSoil', text: 'Blood-bank inventory, in real use. Expiry alerts cut wastage by 30%.' },
      { name: 'RestHat', text: 'Restaurant management with IRD-certified billing, deployed to multiple clients.' },
      { name: 'ArthaVidhi', text: 'Billing and business management for small businesses, with VAT-compliant invoices.' },
      { name: 'WadaConnect', text: 'Registration and document requests for ward offices.' },
    ],
  },
];

/** Chapter 01, the focus ring: every robot, in the order the ring shows them (docs/PROFILE.md §3, §9). */
export type Robot = {
  id: string;
  name: string;
  line: string;
  stat?: { value: string; label: string };
  chip?: string;
  image: string;
  imageAlt: string;
  /** the live Anatomy figure the open view runs */
  figure: 'tomatobot' | 'jeevi' | 'face-tracker' | 'obstacle-car' | 'rescue';
};

export const robotics = {
  title: 'Robotics',
  line: ['Machines that move', 'on their own.'] as const,
};

export const robots: Robot[] = [
  {
    id: 'jeevi',
    name: 'JeevI',
    line: 'A 3D-printable quadruped with 12 joints. Its gait was trained with PPO in NVIDIA Isaac Lab and converged on three terrains.',
    stat: { value: '256.27', label: 'reward on flat terrain' },
    image: '/robots/jeevi.webp',
    imageAlt: 'Drawing of JeevI, a four-legged printed robot, trotting on a treadmill over rough terrain.',
    figure: 'jeevi',
  },
  {
    id: 'tomatobot',
    name: 'TomatoBot v2',
    line: 'Finds the ripe tomatoes with YOLOv11 and picks them with a 6-DOF arm.',
    stat: { value: '88%', label: 'ripeness detection, in the field' },
    chip: 'Published · IJICTDC 2026',
    image: '/robots/tomatobot.webp',
    imageAlt: 'Drawing of TomatoBot v2 beside a row of staked tomato plants, its arm reaching for a ripe tomato.',
    figure: 'tomatobot',
  },
  {
    id: 'rescue-vehicle',
    name: 'Rescue vehicle',
    line: 'An Arduino rover with an arm, a drone, fire suppression and a camera.',
    image: '/robots/rescue-vehicle.webp',
    imageAlt: 'Drawing of the rescue vehicle: a cabin on eight small wheels, a drone lifting off its roof and a robotic arm unfolded behind.',
    figure: 'rescue',
  },
  {
    id: 'face-tracker',
    name: 'Face tracker',
    line: 'Follows a person, or traffic signs, with an MU vision sensor on an Arduino.',
    image: '/robots/face-tracker.webp',
    imageAlt: 'Drawing of the face tracker on a bench: a rover on four mecanum wheels keeping a traffic sign centred in front of its vision sensor.',
    figure: 'face-tracker',
  },
  {
    id: 'obstacle-car',
    name: 'Obstacle car',
    line: 'Looks left and right with an ultrasonic sensor, then takes the clearer side. Early work.',
    image: '/robots/obstacle-car.webp',
    imageAlt: 'Drawing of the obstacle car on a stand, its ultrasonic sensor on a small servo sounding a wall in front of it.',
    figure: 'obstacle-car',
  },
];

/** The record left the chapter tabs for Design; it comes back as its own section (DESIGN.md §5, 05). */
export const record = {
  line: 'Since 2021: one paper, seven placements, 2,516 contributions last year.',
  image: '/chapters/record.webp',
  imageAlt: 'An early robot: an Arduino board on a chassis with yellow mecanum wheels.',
  items: [
    { name: '2022', text: 'Head of Development at Haitomns Groups.' },
    { name: '2023', text: 'Starts a B.Tech in Artificial Intelligence at Kathmandu University.' },
    { name: '2024', text: 'Second place at CodeFest and at the JIFFY Hackathon.' },
    { name: '2025', text: 'Best Presentation, Global IME AI/ML Hackathon. ICT Award semi-finalist.' },
    { name: '2026', text: 'TomatoBot paper published. Intern at EncodeX. Harvard Health Hackathon top 20.' },
  ],
};

/** Chapter 02, the contact sheet: every AI frame on one roll of film, in time order (docs/PROFILE.md §2, §3). */
export type Frame = {
  id: string;
  name: string;
  /** when it was built, YYYY-MM */
  date: string;
  line: string;
  /** the mono readouts under the loupe and in the print; facts only. The chip is the award or the paper */
  readouts: string[];
  stat?: { value: string; label: string };
  chip?: string;
  /** circled in grease pencil: a keeper */
  keeper?: boolean;
  /** the drawn output the frame shows when there is no real screen */
  visual: 'bench' | 'phulbari' | 'tomato-vision' | 'doclipi' | 'recyclo' | 'dementiabot' | 'risk';
  /** a real screen for the frame, and the larger one the print shows */
  image?: string;
  imageAlt?: string;
  print?: string;
};

export const ai = {
  title: 'AI',
  line: ['Models that read,', 'sort and recognise.'] as const,
};

export const frames: Frame[] = [
  {
    id: 'bench',
    name: 'The bench',
    date: '2023-11',
    line: 'Coursework and experiments since the first semester at Kathmandu University.',
    readouts: ['brain-tumour area', 'fire & smoke detection', 'autoencoders', 'DQN', 'Nepali NLP', 'optical flow'],
    visual: 'bench',
  },
  {
    id: 'phulbari',
    name: 'Phulbari',
    date: '2024-05',
    line: 'Names the flower in front of the lens, one of 100 species, and waters the plant when the soil runs dry.',
    readouts: ['ResNet-50 / VGG-16', '100 species', 'ESP32 irrigation', 'Firebase'],
    stat: { value: '100', label: 'flower species it can name' },
    chip: 'ICT Award 2025 · Rising Star semi-finalist',
    keeper: true,
    visual: 'phulbari',
    image: '/ai/phulbari-frame.webp',
    imageAlt: 'A red rose with rain on it, photographed through the Phulbari app.',
    print: '/ai/phulbari-print.webp',
  },
  {
    id: 'tomato-vision',
    name: 'TomatoBot, the eyes',
    date: '2024-12',
    line: 'The vision half of TomatoBot: YOLOv11 tells ripe from unripe, 88% of the time in the field.',
    readouts: ['YOLOv11', '6 classes', '88% in the field', 'Raspberry Pi'],
    stat: { value: '88%', label: 'ripeness detection, in the field' },
    chip: 'Published · IJICTDC 2026',
    keeper: true,
    visual: 'tomato-vision',
  },
  {
    id: 'doclipi',
    name: 'DocLipi',
    date: '2025-05',
    line: 'Sorts bank documents, reads Nepali and English, and answers questions about them in plain language.',
    readouts: ['DenseNet121', 'Gemma 3 Vision', 'Nepali + English OCR', 'questions in plain language'],
    chip: 'JavaFX desktop · FastAPI',
    keeper: true,
    visual: 'doclipi',
    image: '/ai/doclipi-frame.webp',
    imageAlt: 'The DocLipi document classifier screen: an upload panel and the categories it sorts into.',
    print: '/ai/doclipi-print.webp',
  },
  {
    id: 'recyclo',
    name: 'Recyclo',
    date: '2025-06',
    line: 'Tells you what kind of waste you are holding and what you could make of it.',
    readouts: ['Gemini', 'Next.js', 'thrift exchange', 'cleanup events'],
    visual: 'recyclo',
  },
  {
    id: 'dementiabot',
    name: 'DementiaBot',
    date: '2026-04',
    line: 'Built with team DizzyBits for the Harvard Health Hackathon. Top 20.',
    readouts: ['team DizzyBits', '2nd in the regional round'],
    chip: 'Harvard Health Hackathon · Top 20',
    visual: 'dementiabot',
  },
  {
    id: 'risk',
    name: 'Risk scoring',
    date: '2026-07',
    line: 'Scores accounts for risk from their transactions, and says why, in a ranked review queue.',
    readouts: ['XGBoost', 'explainable scores', 'ranked review queue'],
    chip: '2nd place · AI/ML Intelligence Hackathon 2026',
    visual: 'risk',
  },
];
