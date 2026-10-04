import { ScaleItem, ChallengeItem, Badge, RealWorldStory, QuizQuestion } from '../types/scinote';

export const PROXIMA_IMAGE_PATH = '/src/assets/images/visual_proxima_star_1791079238721.jpg';
export const VIRUS_IMAGE_PATH = '/src/assets/images/visual_virus_microscope_1791079248660.jpg';
export const HERO_SCALE_PATH = '/src/assets/images/hero_space_atom_scale_1791079025867.jpg';

export const PRESET_NUMBERS = [
  {
    id: 'light_speed',
    name: 'Speed of Light (m/s)',
    standard: '300000000',
    displayStandard: '300,000,000',
    type: 'huge',
    emoji: '⚡',
    fact: 'Fastest speed possible in our universe!'
  },
  {
    id: 'world_pop',
    name: 'Earth Population',
    standard: '8000000000',
    displayStandard: '8,000,000,000',
    type: 'huge',
    emoji: '👥',
    fact: 'Number of living humans sharing planet Earth.'
  },
  {
    id: 'star_count',
    name: 'Stars in Observable Universe',
    standard: '200000000000000000000000',
    displayStandard: '200,000,000,000,000,000,000,000',
    type: 'huge',
    emoji: '✨',
    fact: 'More stars than grains of sand on all beaches on Earth!'
  },
  {
    id: 'hair_width',
    name: 'Width of Human Hair (m)',
    standard: '0.00007',
    displayStandard: '0.00007',
    type: 'tiny',
    emoji: '💇',
    fact: 'Just seventy millionths of a meter thick.'
  },
  {
    id: 'dust_mite',
    name: 'Mass of Dust Particle (kg)',
    standard: '0.00000000075',
    displayStandard: '0.00000000075',
    type: 'tiny',
    emoji: '🪶',
    fact: 'Floats silently in the sunbeam in your room.'
  },
  {
    id: 'chip_transistor',
    name: 'Microchip Transistor Gate (m)',
    standard: '0.000000003',
    displayStandard: '0.000000003',
    type: 'tiny',
    emoji: '💻',
    fact: 'Billions of these power your phone and computer.'
  }
];

export const REAL_WORLD_STORIES: RealWorldStory[] = [
  {
    id: 'proxima_star',
    title: 'Interstellar Distance: Proxima Centauri',
    category: 'astronomy',
    scientificNotation: '4.0 × 10¹⁶ meters',
    standardForm: '40,000,000,000,000,000 meters',
    unit: 'meters (4.24 light-years)',
    exponent: 16,
    mantissa: 4.0,
    imagePath: PROXIMA_IMAGE_PATH,
    emoji: '⭐',
    headline: 'Our Closest Neighboring Star System',
    whyScientificMatters: 'If rocket telemetry engineers had to type 15 zeros every time they entered orbital coordinates, a single missed keypress would crash the spacecraft millions of miles off course!',
    typoRiskDemo: 'Writing 40,000,000,000,000 vs 400,000,000,000,000 is an error of 360 TRILLION meters. Scientific notation 4.0 × 10¹⁶ prevents counting zeros entirely.',
    funFact: 'Even flying at the speed of the fastest rocket ever built (364,000 km/h), it would take over 12,000 years to get there.',
    spokenAudio: 'The distance to Proxima Centauri is four point zero times ten to the sixteenth meters. That is forty quadrillion meters. Scientific notation keeps astronomical data safe and readable.'
  },
  {
    id: 'virus_scale',
    title: 'Medical Virology: Coronavirus & Flu Capsid',
    category: 'virology',
    scientificNotation: '1.2 × 10⁻⁷ meters',
    standardForm: '0.00000012 meters',
    unit: 'meters (120 nanometers)',
    exponent: -7,
    mantissa: 1.2,
    imagePath: VIRUS_IMAGE_PATH,
    emoji: '🦠',
    headline: 'Designing Vaccine Nanoparticles & N95 Filters',
    whyScientificMatters: 'Biomedical researchers compare viral particle diameters to filter pore sizes. Using negative exponents lets doctors immediately know that 1.2 × 10⁻⁷ m easily slips through ordinary cloth (10⁻⁴ m) but gets trapped by N95 fibers (10⁻⁷ m).',
    typoRiskDemo: 'Mistaking 0.00000012 m for 0.0000012 m makes your filter pore design 10x too large, letting billions of viral particles pass right through!',
    funFact: 'About 500 million virus particles could comfortably sit on the head of a single pin.',
    spokenAudio: 'A coronavirus particle measures one point two times ten to the negative seventh meters. That is one hundred and twenty nanometers. Using negative exponents prevents fatal medical lab errors.'
  },
  {
    id: 'earth_mass',
    title: 'Geophysics: Mass of Planet Earth',
    category: 'geology',
    scientificNotation: '5.97 × 10²⁴ kilograms',
    standardForm: '5,972,000,000,000,000,000,000,000 kg',
    unit: 'kilograms (6 Sextillion metric tons)',
    exponent: 24,
    mantissa: 5.97,
    imagePath: HERO_SCALE_PATH,
    emoji: '🌍',
    headline: 'Calculating Gravitational Orbit for Satellites',
    whyScientificMatters: 'GPS navigation satellites rely on Einstein’s orbital equations containing Earth’s mass. Having to write 24 zeros would freeze standard calculator displays with overflow errors.',
    typoRiskDemo: 'Calculators literally cannot fit 25 digits on a normal LCD screen without converting to 5.97E24 automatically!',
    funFact: 'Every single year, Earth collects about 40,000 metric tons of cosmic space dust, adding to this giant mass.',
    spokenAudio: 'The mass of planet Earth is five point nine seven times ten to the twenty fourth kilograms. Scientific notation is the only format calculators can use to compute satellite orbits.'
  },
  {
    id: 'brain_synapses',
    title: 'Neuroscience: Human Brain Synaptic Network',
    category: 'neuroscience',
    scientificNotation: '1.0 × 10¹⁴ connections',
    standardForm: '100,000,000,000,000 connections',
    unit: 'synaptic connections',
    exponent: 14,
    mantissa: 1.0,
    imagePath: HERO_SCALE_PATH,
    emoji: '🧠',
    headline: 'The Most Complex Biological Supercomputer',
    whyScientificMatters: 'Neuroscientists modeling memory storage use scientific notation to estimate human storage capacity (roughly 2.5 × 10¹⁵ bytes = 2.5 Petabytes).',
    typoRiskDemo: 'Comparing 100 trillion synapses to 86 billion neurons (8.6 × 10¹⁰) is instantly clear by looking at the exponents: 14 vs 10 = 10,000x more connections than cells!',
    funFact: 'There are more synaptic connections in one human brain than stars in our entire Milky Way galaxy!',
    spokenAudio: 'The human brain contains one point zero times ten to the fourteenth synaptic connections. That is one hundred trillion electrical junctions.'
  },
  {
    id: 'dust_mass',
    title: 'Atmospheric Physics: Single Dust Particle',
    category: 'geology',
    scientificNotation: '7.5 × 10⁻¹⁰ kilograms',
    standardForm: '0.00000000075 kg',
    unit: 'kilograms (0.75 micrograms)',
    exponent: -10,
    mantissa: 7.5,
    imagePath: HERO_SCALE_PATH,
    emoji: '🪶',
    headline: 'Air Quality Sensors & Cleanroom Engineering',
    whyScientificMatters: 'Semiconductor cleanrooms that manufacture microprocessors must detect particles weighing less than 10⁻⁹ kg to prevent microchips from short-circuiting.',
    typoRiskDemo: 'A single microscopic dust grain settling on a 3-nanometer transistor will ruin a thousand-dollar computer processor wafer.',
    funFact: 'Over 80% of household dust consists of shed dead skin flakes floating on thermal currents.',
    spokenAudio: 'A single dust particle weighs seven point five times ten to the negative tenth kilograms. Cleanroom monitors track these tiny micro weights.'
  },
  {
    id: 'national_wealth',
    title: 'Macroeconomics: US National Debt & Global Wealth',
    category: 'economy',
    scientificNotation: '3.5 × 10¹³ US Dollars',
    standardForm: '$35,000,000,000,000',
    unit: 'dollars ($35 Trillion)',
    exponent: 13,
    mantissa: 3.5,
    imagePath: HERO_SCALE_PATH,
    emoji: '💵',
    headline: 'Tracking Global Financial Markets',
    whyScientificMatters: 'Central banks, stock exchanges, and sovereign wealth funds process trillions of transactions. Scientific notation eliminates confusion between billion (10⁹) and trillion (10¹²).',
    typoRiskDemo: 'In British vs American historical English, "billion" meant different things (10¹² vs 10⁹). Scientific notation 10¹² is globally unambiguous.',
    funFact: 'If you spent $1 per second non-stop, it would take you over 1.1 million years to spend 35 trillion dollars!',
    spokenAudio: 'Thirty five trillion dollars is written as three point five times ten to the thirteenth dollars in scientific notation.'
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // STAGE 1: BEGINNER (Basic Conversions)
  {
    id: 'q_b1',
    difficulty: 'beginner',
    category: 'basic_conversion',
    question: 'What is 5,400 written in standard scientific notation?',
    givenDisplay: '5,400',
    options: ['5.4 × 10³', '54 × 10²', '5.4 × 10²', '0.54 × 10⁴'],
    correctAnswer: '5.4 × 10³',
    explanation: 'Start at the end of 5,400. Hop the decimal 3 places LEFT to land after the 5: 5.4 × 10³.',
    hints: [
      'The front number (boss number) must be 5.4.',
      'Count how many hops from 5,400 to 5.4: 1, 2, 3 hops left.',
      '3 hops left means a positive exponent of +3: 5.4 × 10³.'
    ],
    points: 100,
    realWorldTag: 'Basic Conversion'
  },
  {
    id: 'q_b2',
    difficulty: 'beginner',
    category: 'basic_conversion',
    question: 'What is 3.2 × 10⁴ in standard number form?',
    givenDisplay: '3.2 × 10⁴',
    options: ['32,000', '3,200', '320,000', '0.00032'],
    correctAnswer: '32,000',
    explanation: 'The exponent is +4. Hop the decimal 4 places to the RIGHT: 3.2 → 32 → 320 → 3,200 → 32,000 (add three zeros).',
    hints: [
      'Positive exponent (+4) means the number gets BIGGER (hop right).',
      'First hop past 2 gives 32.',
      'Remaining 3 hops add three zeros: 32,000.'
    ],
    points: 100,
    realWorldTag: 'Basic Unpacking'
  },
  {
    id: 'q_b3',
    difficulty: 'beginner',
    category: 'direction_sign',
    question: 'Which of the following is VALID scientific notation?',
    givenDisplay: 'Identify the Valid Format:',
    options: ['8.9 × 10⁵', '89 × 10⁴', '0.89 × 10⁶', '8.9 × 5¹⁰'],
    correctAnswer: '8.9 × 10⁵',
    explanation: '8.9 is between 1.0 and 10.0 (exactly 1 non-zero digit before the dot), and uses base 10!',
    hints: [
      'The Boss Number rule: Must have only 1 digit before the dot.',
      '89 is too big (2 digits). 0.89 is too small (0 before dot).',
      '8.9 × 10⁵ is the only valid expression.'
    ],
    points: 100,
    realWorldTag: 'Boss Number Rule'
  },

  // STAGE 2: INTERMEDIATE (Negative Exponents & Direction Intuition)
  {
    id: 'q_i1',
    difficulty: 'intermediate',
    category: 'direction_sign',
    question: 'What is 0.00047 written in scientific notation?',
    givenDisplay: '0.00047',
    options: ['4.7 × 10⁻⁴', '4.7 × 10⁴', '47 × 10⁻⁵', '0.47 × 10⁻³'],
    correctAnswer: '4.7 × 10⁻⁴',
    explanation: 'Hop the decimal RIGHT past the zeros to land after the 4 (4 hops right). Right hops on small numbers = negative exponent (-4): 4.7 × 10⁻⁴.',
    hints: [
      'This is a tiny decimal under 1, so exponent must be NEGATIVE (-).',
      'Hop right: past 0 (1), past 0 (2), past 0 (3), past 4 (4).',
      '4 hops right = 4.7 × 10⁻⁴.'
    ],
    points: 150,
    realWorldTag: 'Micro Decimals'
  },
  {
    id: 'q_i2',
    difficulty: 'intermediate',
    category: 'basic_conversion',
    question: 'Convert 6.8 × 10⁻³ into standard decimal form:',
    givenDisplay: '6.8 × 10⁻³',
    options: ['0.0068', '0.068', '0.00068', '6,800'],
    correctAnswer: '0.0068',
    explanation: 'Exponent is -3 (hop LEFT 3 places). 6.8 → .68 (1) → .068 (2) → 0.0068 (3).',
    hints: [
      'Negative exponent (-3) means hop LEFT (making it small).',
      '1 hop gets to front of 6 (.68).',
      '2 more hops add two zeros in front: 0.0068.'
    ],
    points: 150,
    realWorldTag: 'Micro Unpacking'
  },
  {
    id: 'q_i3',
    difficulty: 'intermediate',
    category: 'direction_sign',
    question: 'Which number is SMALLER: 9.9 × 10⁻⁶ or 1.1 × 10⁻⁴?',
    givenDisplay: '9.9 × 10⁻⁶  vs  1.1 × 10⁻⁴',
    options: ['9.9 × 10⁻⁶ is smaller', '1.1 × 10⁻⁴ is smaller', 'They are equal', 'Cannot be determined'],
    correctAnswer: '9.9 × 10⁻⁶ is smaller',
    explanation: 'Always check the exponent first! 10⁻⁶ is one-millionth (0.0000099), while 10⁻⁴ is one ten-thousandth (0.00011). -6 is more negative, so 9.9 × 10⁻⁶ is much smaller!',
    hints: [
      'Compare exponents: -6 vs -4.',
      '-6 means 5 zeros after decimal point (0.0000099).',
      '-4 means 3 zeros after decimal point (0.00011).',
      '9.9 × 10⁻⁶ is over 10 times smaller!'
    ],
    points: 150,
    realWorldTag: 'Scale Comparison'
  },

  // STAGE 3: ADVANCED (Zero-Filling & Big Cosmic Scales)
  {
    id: 'q_a1',
    difficulty: 'advanced',
    category: 'zero_filling',
    question: 'When converting 7.35 × 10⁷ to standard form, how many ZEROS are added after the 5?',
    givenDisplay: '7.35 × 10⁷',
    options: ['5 zeros', '7 zeros', '6 zeros', '4 zeros'],
    correctAnswer: '5 zeros',
    explanation: 'Total hops is 7. First 2 hops move past the digits "3" and "5" (735.). The remaining (7 - 2 = 5) hops become added zeros: 73,500,000 (5 zeros)!',
    hints: [
      'Total exponent hops = 7.',
      'The decimal already needs 2 hops just to pass "35".',
      '7 total hops minus 2 decimal places = 5 added zeros.'
    ],
    points: 200,
    realWorldTag: 'Zero-Nest Counting'
  },
  {
    id: 'q_a2',
    difficulty: 'advanced',
    category: 'basic_conversion',
    question: 'What is 850,000,000,000 (850 Billion) written in scientific notation?',
    givenDisplay: '850,000,000,000',
    options: ['8.5 × 10¹¹', '8.5 × 10¹²', '85 × 10¹⁰', '8.5 × 10¹⁰'],
    correctAnswer: '8.5 × 10¹¹',
    explanation: 'Place dot after the 8 (8.5). Count all 11 digits behind the 8: 11 hops left → 8.5 × 10¹¹.',
    hints: [
      'Boss number must be 8.5.',
      'Count all digits after the 8: 5 followed by 10 zeros = 11 digits total.',
      'So exponent is +11: 8.5 × 10¹¹.'
    ],
    points: 200,
    realWorldTag: 'Billion Scale'
  },

  // STAGE 4: MASTER (Real-World Applied Problem Solving)
  {
    id: 'q_m1',
    difficulty: 'master',
    category: 'real_world_calc',
    question: 'Light travels at 3.0 × 10⁸ m/s. How far does light travel in 100 seconds (10² seconds)?',
    givenDisplay: '(3.0 × 10⁸ m/s) × (10² s)',
    options: ['3.0 × 10¹⁰ meters', '3.0 × 10¹⁶ meters', '3.0 × 10⁶ meters', '300 × 10⁸ meters'],
    correctAnswer: '3.0 × 10¹⁰ meters',
    explanation: 'When multiplying powers of 10 with the same base, add their exponents: 10⁸ × 10² = 10^(8 + 2) = 10¹⁰! So distance = 3.0 × 10¹⁰ meters (30 billion meters).',
    hints: [
      'Formula: Distance = Speed × Time.',
      'Multiply: (3.0 × 10⁸) × (1.0 × 10²).',
      'Rule of exponents: Add powers (8 + 2 = 10).',
      'Result: 3.0 × 10¹⁰ meters.'
    ],
    points: 300,
    realWorldTag: 'Astrophysics Calculation'
  },
  {
    id: 'q_m2',
    difficulty: 'master',
    category: 'real_world_calc',
    question: 'A petri dish has 2.0 × 10⁴ bacteria. The colony multiplies by 4 (4 × 10⁰). How many bacteria are there now?',
    givenDisplay: '2.0 × 10⁴ × 4',
    options: ['8.0 × 10⁴', '8.0 × 10⁵', '6.0 × 10⁴', '2.0 × 10⁸'],
    correctAnswer: '8.0 × 10⁴',
    explanation: 'Multiply the boss numbers: 2.0 × 4 = 8.0. Keep the power of 10: 8.0 × 10⁴ (80,000 bacteria). 8.0 is between 1 and 10, so it is in perfect scientific notation!',
    hints: [
      'Multiply the front numbers: 2.0 × 4 = 8.0.',
      'The exponent stays 10⁴.',
      'Final answer: 8.0 × 10⁴ (80,000).'
    ],
    points: 300,
    realWorldTag: 'Cell Biology'
  }
];

export const SCALE_ITEMS: ScaleItem[] = [
  {
    id: 'universe',
    name: 'Observable Universe',
    category: 'cosmic',
    exponent: 26,
    mantissa: 9.46,
    standardFormatted: '946,000,000,000,000,000,000,000,000 m',
    scientificNotation: '9.46 × 10²⁶ m',
    unit: 'meters',
    emoji: '🌌',
    description: 'The edge of everything we can ever observe. Imagine writing 26 zeros!',
    tagline: 'Mega Cosmic Scale',
    careerContext: 'Used by Cosmologists & Theoretical Physicists'
  },
  {
    id: 'proxima',
    name: 'Distance to Nearest Star (Proxima)',
    category: 'cosmic',
    exponent: 16,
    mantissa: 4.0,
    standardFormatted: '40,000,000,000,000,000 m',
    scientificNotation: '4.0 × 10¹⁶ m',
    unit: 'meters (4.24 ly)',
    emoji: '⭐',
    description: 'Closest neighboring stellar system outside our solar system.',
    tagline: 'Interstellar Scale',
    careerContext: 'Used by NASA Deep Space Navigation Engineers'
  },
  {
    id: 'sun_distance',
    name: 'Distance to the Sun',
    category: 'cosmic',
    exponent: 11,
    mantissa: 1.5,
    standardFormatted: '150,000,000,000 m',
    scientificNotation: '1.5 × 10¹¹ m',
    unit: 'meters (150M km)',
    emoji: '☀️',
    description: 'Light takes 8.3 minutes to travel this colossal distance.',
    tagline: 'Solar System Scale',
    careerContext: 'Used by Solar Astrophysicists'
  },
  {
    id: 'earth_diameter',
    name: 'Earth Diameter',
    category: 'cosmic',
    exponent: 7,
    mantissa: 1.27,
    standardFormatted: '12,742,000 m',
    scientificNotation: '1.27 × 10⁷ m',
    unit: 'meters',
    emoji: '🌍',
    description: 'Our blue marble planet from pole to pole.',
    tagline: 'Planetary Scale',
    careerContext: 'Used by Geoscientists & Meteorologists'
  },
  {
    id: 'human',
    name: 'Average Adult Height',
    category: 'everyday',
    exponent: 0,
    mantissa: 1.7,
    standardFormatted: '1.7 m',
    scientificNotation: '1.7 × 10⁰ m',
    unit: 'meters',
    emoji: '🧍',
    description: 'Our human vantage point in the middle of all scales.',
    tagline: 'Human Scale (10⁰ = 1)',
    careerContext: 'Standard everyday units'
  },
  {
    id: 'ant',
    name: 'Worker Ant',
    category: 'everyday',
    exponent: -3,
    mantissa: 5.0,
    standardFormatted: '0.005 m',
    scientificNotation: '5.0 × 10⁻³ m',
    unit: 'meters (5 mm)',
    emoji: '🐜',
    description: 'A tiny insect carrying 50x its own body weight.',
    tagline: 'Millimeter Scale',
    careerContext: 'Used by Entomologists & Biologists'
  },
  {
    id: 'blood_cell',
    name: 'Red Blood Cell',
    category: 'microscopic',
    exponent: -6,
    mantissa: 7.5,
    standardFormatted: '0.0000075 m',
    scientificNotation: '7.5 × 10⁻⁶ m',
    unit: 'meters (7.5 µm)',
    emoji: '🩸',
    description: 'Millions of these discs rush through your veins carrying oxygen right now!',
    tagline: 'Microscopic Scale',
    careerContext: 'Used by Hematologists & Medical Lab Techs'
  },
  {
    id: 'virus',
    name: 'Coronavirus Particle',
    category: 'microscopic',
    exponent: -7,
    mantissa: 1.2,
    standardFormatted: '0.00000012 m',
    scientificNotation: '1.2 × 10⁻⁷ m',
    unit: 'meters (120 nm)',
    emoji: '🦠',
    description: 'Thousands of times smaller than a single strand of hair.',
    tagline: 'Viral Scale',
    careerContext: 'Used by Immunologists & Vaccine Developers'
  },
  {
    id: 'dna',
    name: 'DNA Strand Width',
    category: 'microscopic',
    exponent: -9,
    mantissa: 2.0,
    standardFormatted: '0.000000002 m',
    scientificNotation: '2.0 × 10⁻⁹ m',
    unit: 'meters (2 nm)',
    emoji: '🧬',
    description: 'The double helix recipe for all known life.',
    tagline: 'Nanoscale',
    careerContext: 'Used by Geneticists & Nanotechnologists'
  },
  {
    id: 'atom',
    name: 'Hydrogen Atom',
    category: 'quantum',
    exponent: -10,
    mantissa: 1.0,
    standardFormatted: '0.0000000001 m',
    scientificNotation: '1.0 × 10⁻¹⁰ m',
    unit: 'meters (0.1 nm)',
    emoji: '⚛️',
    description: 'The simplest and most abundant building block in the universe.',
    tagline: 'Atomic Scale',
    careerContext: 'Used by Quantum Physicists & Chemists'
  }
];

export const CHALLENGES: ChallengeItem[] = [
  {
    id: 't1_1',
    tier: 1,
    type: 'rule_check',
    title: 'The Boss Number Check',
    prompt: 'Is this written in VALID scientific notation?',
    givenValue: '4.5 × 10⁶',
    options: ['YES! Valid', 'NO! Invalid'],
    correctAnswer: 'YES! Valid',
    explanation: '4.5 is between 1 and 10, so it is 100% valid!',
    hints: ['Look at the front number (4.5).', 'Is 4.5 between 1 and 10? Yes!']
  }
];

export const BADGES: Badge[] = [
  {
    id: 'first_hop',
    title: 'First Leap',
    description: 'Watched your first animated decimal hop.',
    icon: '🦘',
    requirement: 'Play 1 hop animation'
  },
  {
    id: 'quiz_rookie',
    title: 'Quiz Novice',
    description: 'Answered your first quiz question correctly.',
    icon: '🎯',
    requirement: 'Score 1 correct quiz question'
  },
  {
    id: 'speed_demon',
    title: 'Speed Blitz Champion',
    description: 'Answered 3 timed questions before the clock expired.',
    icon: '⚡',
    requirement: 'Win 3 timed quiz challenges'
  },
  {
    id: 'real_world_explorer',
    title: 'Science Detective',
    description: 'Explored real-world space and medical virus applications.',
    icon: '🔬',
    requirement: 'Inspect all 6 real-world stories'
  },
  {
    id: 'two_way_master',
    title: 'Bi-Directional Hero',
    description: 'Converted both Standard → Sci and Sci → Standard with zero-filling.',
    icon: '🔄',
    requirement: 'Try both modes in the Interactive Tool'
  },
  {
    id: 'streak_fire',
    title: 'Decimal Master',
    description: 'Achieved a 5-challenge winning streak.',
    icon: '🔥',
    requirement: 'Get a 5-streak in Practice & Quizzes'
  }
];
