import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  Volume2,
  VolumeX,
  AlertTriangle,
  X,
  ArrowRight,
  BookOpen,
  FileCheck,
  Flame,
  Lightbulb,
  HelpCircle,
  Copy,
  Check,
  Info,
  Lock,
  Unlock,
  Volume1,
  Camera,
  RefreshCw,
  Award,
  Sparkles,
  Compass,
  Globe,
  Microscope,
  Rocket
} from 'lucide-react';
import { sound } from '../utils/audio';

type LabModule = 'to_sci' | 'to_std' | 'mixed' | 'scale_objects';

interface Problem {
  id: number;
  direction: 'to_sci' | 'to_std';
  original: string;
  digits: string[];
  startDot: number; // gap index
  targetDot: number; // target gap index
  expectedA: string;
  expectedExp: number;
  isBig: boolean;
  level: number;
  tutorialHint?: string;
}

interface ScaleObject {
  id: number;
  name: string;
  category: 'Subatomic' | 'Microscopic' | 'Human & Game Scale' | 'Earth & Space' | 'Cosmic';
  description: string;
  typeBadge: string;
  visualType: 'minecraft' | 'amongus' | 'atom' | 'dna' | 'blood' | 'hair' | 'ant' | 'human' | 'whale' | 'everest' | 'earth' | 'moon' | 'sun' | 'galaxy' | 'diamond';
  correctSci: string;
  power: number; // power of 10
  options: string[]; // will be shuffled on load
  sizeComparison: string;
  fact: string;
}

interface ExitQuestion {
  id: number;
  type: 'to_sci' | 'to_std' | 'scale';
  prompt: string;
  expectedA?: string;
  expectedExp?: number;
  expectedStd?: string;
  expectedChoice?: string;
  options?: string[];
  difficulty: string;
}

// Utility to shuffle an array so correct answers are in random grid locations
function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// 26 Comprehensive Real-World & Gaming Scale Objects spanning the Powers of Ten
const SCALE_OBJECTS: ScaleObject[] = [
  {
    id: 1,
    name: 'Standard Minecraft Dirt Block',
    category: 'Human & Game Scale',
    description: 'In Minecraft, exactly 1 block equals 1 cubic meter in real-world physics!',
    typeBadge: '🎮 Minecraft (1 m)',
    visualType: 'minecraft',
    correctSci: '1.0 × 10⁰ m',
    power: 0,
    options: ['1.0 × 10⁰ m', '1.0 × 10⁻⁴ m', '1.0 × 10³ m', '1.0 × 10⁶ m'],
    sizeComparison: 'Exact Match: 1.0 meter = 10⁰ m. Steve is 1.8 blocks (1.8 × 10⁰ m) tall!',
    fact: 'Minecraft blocks were designed by Notch to be exactly 1 meter on each side to make physics calculations realistic.'
  },
  {
    id: 2,
    name: 'Among Us Crewmate Height',
    category: 'Human & Game Scale',
    description: 'Official Innersloth canon states crewmates stand about 3 feet 6 inches tall.',
    typeBadge: 'ඞ Among Us (1.07 m)',
    visualType: 'amongus',
    correctSci: '1.07 × 10⁰ m',
    power: 0,
    options: ['1.07 × 10⁰ m', '1.07 × 10⁻⁵ m', '1.07 × 10² m', '1.07 × 10⁸ m'],
    sizeComparison: 'About waist-height to an adult human (1.07 meters = 1.07 × 10⁰ m).',
    fact: 'According to the official lore in The Skeld, crewmates weigh about 92 pounds inside their hazmat suits.'
  },
  {
    id: 3,
    name: 'Hydrogen Atom Diameter',
    category: 'Subatomic',
    description: 'The simplest atom in the universe with 1 proton and 1 electron.',
    typeBadge: '⚛️ Subatomic',
    visualType: 'atom',
    correctSci: '1.0 × 10⁻¹⁰ m',
    power: -10,
    options: ['1.0 × 10⁻¹⁰ m', '1.0 × 10⁻³ m', '1.0 × 10¹ m', '1.0 × 10⁵ m'],
    sizeComparison: '10 billion atoms lined up would span just 1 single meter!',
    fact: 'If an atom were the size of a football stadium, the nucleus would be a single marble at the center!'
  },
  {
    id: 4,
    name: 'Minecraft Diamond Gem',
    category: 'Human & Game Scale',
    description: 'A precious gemstone mined deep underground around level Y: -58.',
    typeBadge: '💎 Minecraft Gem',
    visualType: 'diamond',
    correctSci: '2.5 × 10⁻² m',
    power: -2,
    options: ['2.5 × 10⁻² m', '2.5 × 10⁻⁸ m', '2.5 × 10² m', '2.5 × 10⁵ m'],
    sizeComparison: 'Roughly 2.5 centimeters (0.025 m), easily fitting in the palm of your hand.',
    fact: 'Real diamonds on Earth formed over 1 billion years ago under immense pressure 150 km below the mantle.'
  },
  {
    id: 5,
    name: 'DNA Strand Double Helix Width',
    category: 'Microscopic',
    description: 'The genetic blueprint spiral inside the nucleus of every living cell.',
    typeBadge: '🧬 Molecular',
    visualType: 'dna',
    correctSci: '2.5 × 10⁻⁹ m',
    power: -9,
    options: ['2.5 × 10⁻⁹ m', '2.5 × 10⁻² m', '2.5 × 10³ m', '2.5 × 10⁷ m'],
    sizeComparison: 'About 40,000 times thinner than a single strand of human hair!',
    fact: 'If you unraveled all the DNA molecules in your body, they would stretch across the solar system.'
  },
  {
    id: 6,
    name: 'Human Red Blood Cell',
    category: 'Microscopic',
    description: 'The biconcave microscopic discs delivering oxygen to your muscles.',
    typeBadge: '🩸 Microscopic',
    visualType: 'blood',
    correctSci: '7.0 × 10⁻⁶ m',
    power: -6,
    options: ['7.0 × 10⁻⁶ m', '7.0 × 10⁻¹ m', '7.0 × 10² m', '7.0 × 10⁶ m'],
    sizeComparison: '7 micrometers (0.000007 m). You can fit over 100 on the period at the end of a sentence!',
    fact: 'Your bone marrow creates approximately 2.4 million new red blood cells every single second.'
  },
  {
    id: 7,
    name: 'Thickness of a Human Hair',
    category: 'Microscopic',
    description: 'The width of a single strand of hair from your scalp.',
    typeBadge: '💇 Fine Detail',
    visualType: 'hair',
    correctSci: '1.0 × 10⁻⁴ m',
    power: -4,
    options: ['1.0 × 10⁻⁴ m', '1.0 × 10⁻¹⁰ m', '1.0 × 10² m', '1.0 × 10⁵ m'],
    sizeComparison: '0.1 millimeters (0.0001 m)—the narrowest threshold visible to the naked eye.',
    fact: 'Human hair is surprisingly strong; a full head of hair could support the weight of two elephants!'
  },
  {
    id: 8,
    name: 'Worker Ant Body Length',
    category: 'Human & Game Scale',
    description: 'A typical garden worker ant marching in a colony line.',
    typeBadge: '🐜 Insect',
    visualType: 'ant',
    correctSci: '4.0 × 10⁻³ m',
    power: -3,
    options: ['4.0 × 10⁻³ m', '4.0 × 10⁻⁸ m', '4.0 × 10¹ m', '4.0 × 10⁴ m'],
    sizeComparison: '4 millimeters (0.004 m). It can lift objects 50 times heavier than its own body!',
    fact: 'The total weight of all ants on Earth is roughly equal to the total weight of all humans combined.'
  },
  {
    id: 9,
    name: 'Adult Human Height',
    category: 'Human & Game Scale',
    description: 'The average height of a high school student or adult teacher.',
    typeBadge: '🧍 Human',
    visualType: 'human',
    correctSci: '1.7 × 10⁰ m',
    power: 0,
    options: ['1.7 × 10⁰ m', '1.7 × 10⁻⁵ m', '1.7 × 10³ m', '1.7 × 10⁷ m'],
    sizeComparison: 'About 1.7 meters (5 feet 7 inches). Exactly 1.7 × 10⁰ meters.',
    fact: 'You are approximately 1 cm taller in the morning because cartilage in your spine decompresses during sleep!'
  },
  {
    id: 10,
    name: 'Blue Whale Length',
    category: 'Human & Game Scale',
    description: 'The largest marine mammal to ever exist on Earth, larger than any dinosaur.',
    typeBadge: '🐋 Giant Animal',
    visualType: 'whale',
    correctSci: '3.0 × 10¹ m',
    power: 1,
    options: ['3.0 × 10¹ m', '3.0 × 10⁻⁴ m', '3.0 × 10⁶ m', '3.0 × 10⁹ m'],
    sizeComparison: '30 meters (about 100 feet). Equal to 30 Minecraft blocks laid in a line!',
    fact: 'A blue whale’s tongue weighs as much as an entire adult elephant.'
  },
  {
    id: 11,
    name: 'Mount Everest Elevation',
    category: 'Earth & Space',
    description: 'The highest mountain peak above sea level on Earth, in the Himalayas.',
    typeBadge: '🏔️ Mountain',
    visualType: 'everest',
    correctSci: '8.85 × 10³ m',
    power: 3,
    options: ['8.85 × 10³ m', '8.85 × 10⁻³ m', '8.85 × 10⁶ m', '8.85 × 10¹⁰ m'],
    sizeComparison: '8,850 meters (29,032 feet). Commercial airliners cruise at this height!',
    fact: 'Tectonic plate collisions continue to push Mount Everest upwards by about 4 millimeters every year.'
  },
  {
    id: 12,
    name: 'Radius of Planet Earth',
    category: 'Earth & Space',
    description: 'The distance from Earth’s core out to the surface ocean crust.',
    typeBadge: '🌍 Planet Earth',
    visualType: 'earth',
    correctSci: '6.37 × 10⁶ m',
    power: 6,
    options: ['6.37 × 10⁶ m', '6.37 × 10² m', '6.37 × 10⁻⁶ m', '6.37 × 10¹² m'],
    sizeComparison: '6,370,000 meters (6,370 km). Driving a car non-stop at 60 mph would take 66 hours!',
    fact: 'Earth is not a perfect sphere; centrifugal rotation causes an equatorial bulge of about 43 kilometers.'
  },
  {
    id: 13,
    name: 'Distance from Earth to the Moon',
    category: 'Earth & Space',
    description: 'The orbit distance separating Earth and our celestial satellite.',
    typeBadge: '🌕 Lunar Orbit',
    visualType: 'moon',
    correctSci: '3.84 × 10⁸ m',
    power: 8,
    options: ['3.84 × 10⁸ m', '3.84 × 10³ m', '3.84 × 10⁻⁴ m', '3.84 × 10¹⁴ m'],
    sizeComparison: '384,000,000 meters. Every other planet in our solar system could fit side-by-side inside this gap!',
    fact: 'Apollo 11 astronauts took approximately 3 days traveling at high speed to traverse this span in 1969.'
  },
  {
    id: 14,
    name: 'Distance from Earth to the Sun',
    category: 'Cosmic',
    description: '1 Astronomical Unit (1 AU)—the distance light travels in 8 minutes 20 seconds.',
    typeBadge: '☀️ Solar System',
    visualType: 'sun',
    correctSci: '1.5 × 10¹¹ m',
    power: 11,
    options: ['1.5 × 10¹¹ m', '1.5 × 10⁵ m', '1.5 × 10⁻¹¹ m', '1.5 × 10¹⁸ m'],
    sizeComparison: '150 billion meters (93 million miles). A jetliner flying 500 mph would take 21 years non-stop!',
    fact: 'The photons warming your face right now took 100,000 years to reach the Sun’s surface, then just 500 seconds to reach you.'
  },
  {
    id: 15,
    name: 'Milky Way Galaxy Diameter',
    category: 'Cosmic',
    description: 'The diameter of our barred spiral galaxy holding over 100 billion star systems.',
    typeBadge: '🌌 Galaxy',
    visualType: 'galaxy',
    correctSci: '1.0 × 10²¹ m',
    power: 21,
    options: ['1.0 × 10²¹ m', '1.0 × 10¹¹ m', '1.0 × 10⁻⁵ m', '1.0 × 10⁷ m'],
    sizeComparison: '1,000,000,000,000,000,000,000 meters! Light takes 100,000 full years to cross from one edge to the other.',
    fact: 'Our solar system orbits the galactic center at 514,000 mph, taking 230 million years to complete one orbit.'
  }
];

// 10-Question Exit Ticket with randomized options
function generate10QuestionExitTicket(): ExitQuestion[] {
  const q9Options = shuffleArray(['7.0 × 10⁻⁶ m', '7.0 × 10⁻¹ m', '7.0 × 10² m', '7.0 × 10⁵ m']);
  const q10Options = shuffleArray(['3.84 × 10⁸ m', '3.84 × 10³ m', '3.84 × 10⁻⁴ m', '3.84 × 10¹⁴ m']);

  return [
    {
      id: 1,
      type: 'to_sci',
      prompt: '1. Convert 850 into scientific notation:',
      expectedA: '8.5',
      expectedExp: 2,
      difficulty: 'Level 1: Small Integer'
    },
    {
      id: 2,
      type: 'to_sci',
      prompt: '2. Convert 0.046 into scientific notation:',
      expectedA: '4.6',
      expectedExp: -2,
      difficulty: 'Level 1: Small Decimal'
    },
    {
      id: 3,
      type: 'to_sci',
      prompt: '3. Convert 62,000 into scientific notation:',
      expectedA: '6.2',
      expectedExp: 4,
      difficulty: 'Level 2: Medium Integer'
    },
    {
      id: 4,
      type: 'to_sci',
      prompt: '4. Convert 0.00083 into scientific notation:',
      expectedA: '8.3',
      expectedExp: -4,
      difficulty: 'Level 2: Medium Decimal'
    },
    {
      id: 5,
      type: 'to_sci',
      prompt: '5. Convert 5,900,000 into scientific notation:',
      expectedA: '5.9',
      expectedExp: 6,
      difficulty: 'Level 3: Large Number'
    },
    {
      id: 6,
      type: 'to_sci',
      prompt: '6. Convert 0.0000072 into scientific notation:',
      expectedA: '7.2',
      expectedExp: -6,
      difficulty: 'Level 3: Micro Decimal'
    },
    {
      id: 7,
      type: 'to_std',
      prompt: '7. Convert 3.5 × 10³ into a standard number:',
      expectedStd: '3500',
      difficulty: 'Reverse: Sci ➔ Number'
    },
    {
      id: 8,
      type: 'to_std',
      prompt: '8. Convert 4.1 × 10⁻³ into a standard decimal:',
      expectedStd: '0.0041',
      difficulty: 'Reverse: Sci ➔ Decimal'
    },
    {
      id: 9,
      type: 'scale',
      prompt: '9. Which scientific notation best estimates the diameter of a Red Blood Cell?',
      expectedChoice: '7.0 × 10⁻⁶ m',
      options: q9Options,
      difficulty: 'Scale: Microscopic'
    },
    {
      id: 10,
      type: 'scale',
      prompt: '10. Which scientific notation best estimates the distance from Earth to the Moon?',
      expectedChoice: '3.84 × 10⁸ m',
      options: q10Options,
      difficulty: 'Scale: Cosmic'
    }
  ];
}

// Problem pools for modules 1-3
const LEVEL_1_DATA = [
  { std: '450', digits: ['4', '5', '0'], a: '4.5', exp: 2, isBig: true },
  { std: '0.035', digits: ['0', '0', '3', '5'], a: '3.5', exp: -2, isBig: false },
  { std: '6,200', digits: ['6', '2', '0', '0'], a: '6.2', exp: 3, isBig: true },
  { std: '0.008', digits: ['0', '0', '0', '8'], a: '8', exp: -3, isBig: false },
  { std: '8,900', digits: ['8', '9', '0', '0'], a: '8.9', exp: 3, isBig: true },
  { std: '0.091', digits: ['0', '0', '9', '1'], a: '9.1', exp: -2, isBig: false }
];

const LEVEL_2_DATA = [
  { std: '52,000', digits: ['5', '2', '0', '0', '0'], a: '5.2', exp: 4, isBig: true },
  { std: '0.00074', digits: ['0', '0', '0', '0', '7', '4'], a: '7.4', exp: -4, isBig: false },
  { std: '38,500', digits: ['3', '8', '5', '0', '0'], a: '3.85', exp: 4, isBig: true },
  { std: '0.0032', digits: ['0', '0', '0', '3', '2'], a: '3.2', exp: -3, isBig: false },
  { std: '740,000', digits: ['7', '4', '0', '0', '0', '0'], a: '7.4', exp: 5, isBig: true }
];

const LEVEL_3_DATA = [
  { std: '4,800,000', digits: ['4', '8', '0', '0', '0', '0', '0'], a: '4.8', exp: 6, isBig: true },
  { std: '0.000062', digits: ['0', '0', '0', '0', '0', '6', '2'], a: '6.2', exp: -5, isBig: false },
  { std: '75,000,000', digits: ['7', '5', '0', '0', '0', '0', '0', '0'], a: '7.5', exp: 7, isBig: true },
  { std: '0.000004', digits: ['0', '0', '0', '0', '0', '0', '4'], a: '4', exp: -6, isBig: false }
];

function buildProblem(data: typeof LEVEL_1_DATA[0], direction: 'to_sci' | 'to_std', level: number, id: number): Problem {
  // Find the index of the first non-zero digit (1 through 9)
  const firstNonZeroIdx = data.digits.findIndex((d) => d !== '0');
  // In standard scientific notation, the decimal point MUST land AFTER the first non-zero digit (gap = index + 1)
  const sciDotPos = data.isBig ? 1 : firstNonZeroIdx + 1;

  if (direction === 'to_sci') {
    // For standard integers, dot starts at the very end and hops to gap 1 (after first digit)
    // For standard decimals, dot starts at gap 1 ('0.xxxx') and hops to sciDotPos (after first non-zero digit 1-9)
    const startDot = data.isBig ? data.digits.length : 1;
    const targetDot = sciDotPos;
    return {
      id,
      direction: 'to_sci',
      original: data.std,
      digits: data.digits,
      startDot,
      targetDot,
      expectedA: data.a,
      expectedExp: data.exp,
      isBig: data.isBig,
      level
    };
  } else {
    // Direction: to_std (Scientific -> Standard)
    // Starts after the first non-zero digit (sciDotPos)
    // Hops to target: end of integer, or gap 1 for decimals under 1
    const startDot = sciDotPos;
    const targetDot = data.isBig ? data.digits.length : 1;
    return {
      id,
      direction: 'to_std',
      original: `${data.a} × 10^${data.exp}`,
      digits: data.digits,
      startDot,
      targetDot,
      expectedA: data.a,
      expectedExp: data.exp,
      isBig: data.isBig,
      level
    };
  }
}

function pickProblemForModule(moduleType: LabModule, solvedCount: number, problemNum: number): Problem {
  let pool = LEVEL_1_DATA;
  let level = 1;

  if (solvedCount < 4) {
    pool = LEVEL_1_DATA;
    level = 1;
  } else if (solvedCount < 9) {
    pool = LEVEL_2_DATA;
    level = 2;
  } else {
    pool = LEVEL_3_DATA;
    level = 3;
  }

  const rawItem = pool[Math.floor(Math.random() * pool.length)];
  let dir: 'to_sci' | 'to_std' = 'to_sci';

  if (moduleType === 'to_sci') {
    dir = 'to_sci';
  } else if (moduleType === 'to_std') {
    dir = 'to_std';
  } else {
    dir = Math.random() > 0.5 ? 'to_sci' : 'to_std';
  }

  return buildProblem(rawItem, dir, level, problemNum + 100);
}

function getChromebookResponsiveStyles(count: number) {
  if (count <= 5) {
    return {
      digitBox: 'w-11 h-15 sm:w-14 sm:h-18 text-2xl sm:text-4xl',
      gapBtn: 'w-6 sm:w-7.5 h-15 sm:h-18',
      arcHeight: 'h-8 sm:h-10',
      arcMargin: '-mx-3 sm:-mx-3.75',
      arcWidth: 'w-[calc(100%+1.5rem)] sm:w-[calc(100%+1.875rem)]',
      dotSize: 'w-4.5 h-4.5 sm:w-5.5 sm:h-5.5',
      targetText: 'text-[8px] sm:text-[9px]'
    };
  } else if (count <= 7) {
    return {
      digitBox: 'w-9 h-13 sm:w-11 sm:h-16 text-xl sm:text-3xl',
      gapBtn: 'w-5 sm:w-6.5 h-13 sm:h-16',
      arcHeight: 'h-7 sm:h-9',
      arcMargin: '-mx-2.5 sm:-mx-3.25',
      arcWidth: 'w-[calc(100%+1.25rem)] sm:w-[calc(100%+1.625rem)]',
      dotSize: 'w-4 h-4 sm:w-5 sm:h-5',
      targetText: 'text-[7px] sm:text-[8px]'
    };
  } else {
    return {
      digitBox: 'w-7.5 h-12 sm:w-9.5 sm:h-15 text-lg sm:text-2xl',
      gapBtn: 'w-4 sm:w-5.5 h-12 sm:h-15',
      arcHeight: 'h-6 sm:h-8',
      arcMargin: '-mx-2 sm:-mx-2.75',
      arcWidth: 'w-[calc(100%+1rem)] sm:w-[calc(100%+1.375rem)]',
      dotSize: 'w-3.5 h-3.5 sm:w-4.5 sm:h-4.5',
      targetText: 'text-[6px] sm:text-[7px]'
    };
  }
}

// Render dynamic visual badges (Minecraft dirt/diamond, Among Us, Atoms, etc.)
const renderObjectVisual = (type: ScaleObject['visualType']) => {
  switch (type) {
    case 'minecraft':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <rect x="6" y="6" width="52" height="52" rx="4" fill="#8B5A2B" stroke="#5C3A1E" strokeWidth="2" />
          <rect x="12" y="24" width="8" height="8" fill="#5C3A1E" />
          <rect x="36" y="32" width="10" height="8" fill="#5C3A1E" />
          <rect x="20" y="44" width="8" height="8" fill="#5C3A1E" />
          <rect x="6" y="6" width="52" height="15" rx="3" fill="#4CAF50" />
          <rect x="14" y="21" width="7" height="6" fill="#388E3C" />
          <rect x="32" y="21" width="8" height="7" fill="#388E3C" />
          <rect x="46" y="19" width="6" height="6" fill="#388E3C" />
        </svg>
      );
    case 'amongus':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="20" width="10" height="26" rx="4" fill="#991B1B" />
          <rect x="16" y="10" width="34" height="42" rx="16" fill="#EF4444" stroke="#991B1B" strokeWidth="2" />
          <rect x="18" y="46" width="12" height="14" rx="4" fill="#DC2626" />
          <rect x="36" y="46" width="12" height="14" rx="4" fill="#DC2626" />
          <rect x="28" y="18" width="24" height="14" rx="7" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
          <ellipse cx="38" cy="22" rx="6" ry="2.5" fill="white" opacity="0.8" />
        </svg>
      );
    case 'diamond':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <polygon points="32,8 54,24 32,56 10,24" fill="#00E5FF" stroke="#00B0FF" strokeWidth="2" />
          <polygon points="32,8 44,24 32,56 20,24" fill="#80D8FF" />
          <line x1="32" y1="8" x2="32" y2="56" stroke="white" strokeWidth="1.5" />
          <line x1="10" y1="24" x2="54" y2="24" stroke="white" strokeWidth="1.5" />
        </svg>
      );
    case 'atom':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="7" fill="#F59E0B" />
          <ellipse cx="32" cy="32" rx="24" ry="9" stroke="#06B6D4" strokeWidth="2.5" transform="rotate(30 32 32)" />
          <ellipse cx="32" cy="32" rx="24" ry="9" stroke="#3B82F6" strokeWidth="2.5" transform="rotate(-30 32 32)" />
          <ellipse cx="32" cy="32" rx="24" ry="9" stroke="#EC4899" strokeWidth="2.5" transform="rotate(90 32 32)" />
        </svg>
      );
    case 'dna':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <path d="M16 12 Q32 24 48 12 M16 28 Q32 40 48 28 M16 44 Q32 56 48 44" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
          <path d="M48 12 Q32 24 16 12 M48 28 Q32 40 16 28 M48 44 Q32 56 16 44" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'blood':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <ellipse cx="32" cy="32" rx="24" ry="18" fill="#DC2626" />
          <ellipse cx="32" cy="32" rx="14" ry="9" fill="#991B1B" />
        </svg>
      );
    case 'earth':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="24" fill="#2563EB" stroke="#1D4ED8" strokeWidth="2" />
          <path d="M22 18 Q28 14 36 20 T46 28 T36 44 T24 42 Z" fill="#10B981" />
          <path d="M14 34 Q20 30 24 38 Z" fill="#10B981" />
        </svg>
      );
    case 'moon':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="24" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2" />
          <circle cx="24" cy="24" r="5" fill="#94A3B8" />
          <circle cx="38" cy="36" r="7" fill="#94A3B8" />
          <circle cx="26" cy="42" r="4" fill="#94A3B8" />
        </svg>
      );
    case 'sun':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="18" fill="#FBBF24" />
          <path d="M32 4 L32 10 M32 54 L32 60 M4 32 L10 32 M54 32 L60 32 M12 12 L16 16 M48 48 L52 52 M12 52 L16 48 M48 16 L52 12" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'galaxy':
      return (
        <svg className="w-14 h-14 sm:w-16 sm:h-16 drop-shadow-md" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="26" fill="#1E1B4B" stroke="#4338CA" strokeWidth="2" />
          <path d="M12 32 C12 20 44 14 44 26 C44 38 20 44 20 32" stroke="#818CF8" strokeWidth="3" strokeLinecap="round" />
          <circle cx="32" cy="32" r="5" fill="#FDE047" />
        </svg>
      );
    default:
      return (
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl sm:text-4xl shadow">
          🔬
        </div>
      );
  }
};

export const SimpleLab: React.FC = () => {
  // Password Lock (Passcode: PAHS2026)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pahs_lab_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Active Module State (4 Modules)
  const [currentModule, setCurrentModule] = useState<LabModule>('to_sci');

  // Gated Progression: Must solve 15 problems in each module before unlocking the next
  const REQUIRED_PER_MODULE = 15;
  const [mod1Solved, setMod1Solved] = useState(0);
  const [mod2Solved, setMod2Solved] = useState(0);
  const [mod3Solved, setMod3Solved] = useState(0);
  const [mod4Solved, setMod4Solved] = useState(0);
  const [teacherBypassAll, setTeacherBypassAll] = useState(false);

  const isMod2Unlocked = teacherBypassAll || mod1Solved >= REQUIRED_PER_MODULE;
  const isMod3Unlocked = teacherBypassAll || mod2Solved >= REQUIRED_PER_MODULE;
  const isMod4Unlocked = teacherBypassAll || mod3Solved >= REQUIRED_PER_MODULE;

  // Practice State (Modules 1 - 3)
  const [probIdx, setProbIdx] = useState(1);
  const [prob, setProb] = useState<Problem>(() => pickProblemForModule('to_sci', 0, 1));
  const [currentDot, setCurrentDot] = useState(prob.startDot);

  // Student Inputs: Mode 1 (to_sci)
  const [inputA, setInputA] = useState('');
  const [selectedSign, setSelectedSign] = useState<'+' | '-' | null>(null);
  const [inputExpMagnitude, setInputExpMagnitude] = useState('');

  // Student Inputs: Mode 2 (to_std)
  const [inputStdNumber, setInputStdNumber] = useState('');

  // Module 4: Real-World Scale Objects State
  const [scaleObjIdx, setScaleObjIdx] = useState(0);
  const [shuffledScaleOptions, setShuffledScaleOptions] = useState<string[]>([]);
  const [selectedScaleOption, setSelectedScaleOption] = useState<string | null>(null);
  const [scaleAnswerStatus, setScaleAnswerStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Total Solved Count across all modules
  const totalSolvedCount = mod1Solved + mod2Solved + mod3Solved + mod4Solved;

  // Feedback & Scoring
  const [status, setStatus] = useState<'idle' | 'correct' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [streak, setStreak] = useState(0);

  // v3.0 Gamification & Live Score Tracking
  const [xpPoints, setXpPoints] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [floatingXp, setFloatingXp] = useState<{ text: string; id: number } | null>(null);

  // Animated Curved Hops State
  const [isAnimatingHint, setIsAnimatingHint] = useState(false);
  const [hintHopCount, setHintHopCount] = useState(0);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 10-Question Exit Ticket State
  const [showExitTicketModal, setShowExitTicketModal] = useState(false);
  const [exitStudentName, setExitStudentName] = useState('');
  const [exitClassPeriod, setExitClassPeriod] = useState('Period 1');
  const [exitStage, setExitStage] = useState<'intro' | 'testing' | 'results'>('intro');
  const [exitQuestions, setExitQuestions] = useState<ExitQuestion[]>([]);
  const [exitCurrentQIdx, setExitCurrentQIdx] = useState(0);
  const [exitAnswers, setExitAnswers] = useState<Array<{ a?: string; sign?: '+' | '-'; exp?: string; std?: string; choice?: string }>>([]);
  const [exitScore, setExitScore] = useState<{ correct: number; total: number; details: boolean[] }>({ correct: 0, total: 10, details: [] });
  const [copiedExit, setCopiedExit] = useState(false);
  const [teacherUnlockClicks, setTeacherUnlockClicks] = useState(0);

  // Instructions Modal
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  // Current object in Module 4
  const currentScaleObject = SCALE_OBJECTS[scaleObjIdx % SCALE_OBJECTS.length];

  // Whenever scaleObjIdx changes, shuffle the 4 choices so they are NEVER always in the top-left!
  useEffect(() => {
    if (currentScaleObject) {
      setShuffledScaleOptions(shuffleArray(currentScaleObject.options));
    }
  }, [scaleObjIdx, currentScaleObject]);

  // When problem changes, reset practice state
  useEffect(() => {
    if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    setCurrentDot(prob.startDot);
    setInputA('');
    setSelectedSign(null);
    setInputExpMagnitude('');
    setInputStdNumber('');
    setStatus('idle');
    setMessage('');
    setIsAnimatingHint(false);
    setHintHopCount(0);
  }, [prob]);

  // Jumps calculation & validation
  const jumpsMade = Math.abs(currentDot - prob.startDot);
  const hasMovedDot = currentDot !== prob.startDot;
  const isTargetReached = currentDot === prob.targetDot;
  const totalExpectedHops = Math.abs(prob.expectedExp);

  // Direction: -1 if moving left, +1 if moving right
  const stepDirection = prob.startDot > prob.targetDot ? -1 : 1;
  const nextAllowedGap = isTargetReached ? null : currentDot + stepDirection;
  const prevAllowedGap = currentDot !== prob.startDot ? currentDot - stepDirection : null;

  // Unlocking condition: Requires 8 solved practice problems to unlock Exit Ticket
  const REQUIRED_EXIT_TICKET_COUNT = 8;
  const isExitTicketUnlocked = totalSolvedCount >= REQUIRED_EXIT_TICKET_COUNT || teacherUnlockClicks >= 3;

  const responsiveStyles = getChromebookResponsiveStyles(prob.digits.length);

  // Rank helper based on XP points
  const getRankBadge = (xp: number) => {
    if (xp >= 1500) return { label: '👑 Sci-Hero', color: 'bg-purple-950/80 border-purple-500 text-purple-300' };
    if (xp >= 900) return { label: '🔥 Master', color: 'bg-rose-950/80 border-rose-500 text-rose-300' };
    if (xp >= 500) return { label: '⚡ Expert', color: 'bg-amber-950/80 border-amber-500 text-amber-300' };
    if (xp >= 200) return { label: '🧭 Explorer', color: 'bg-cyan-950/80 border-cyan-500 text-cyan-300' };
    return { label: '🌱 Apprentice', color: 'bg-emerald-950/80 border-emerald-500 text-emerald-300' };
  };

  // Switch Module handler with strict 15-question gatekeeping
  const handleSwitchModule = (mod: LabModule) => {
    if (mod === 'to_std' && !isMod2Unlocked) {
      if (soundOn) sound.playError();
      alert(`🔒 Module 2 is locked! You must solve 15 problems in Module 1 first. (Current: ${mod1Solved}/15)`);
      return;
    }
    if (mod === 'mixed' && !isMod3Unlocked) {
      if (soundOn) sound.playError();
      alert(`🔒 Module 3 is locked! You must solve 15 problems in Module 2 first. (Current: ${mod2Solved}/15)`);
      return;
    }
    if (mod === 'scale_objects' && !isMod4Unlocked) {
      if (soundOn) sound.playError();
      alert(`🔒 Module 4 is locked! You must solve 15 problems in Module 3 first. (Current: ${mod3Solved}/15)`);
      return;
    }

    if (soundOn) sound.playPop();
    setCurrentModule(mod);
    if (mod !== 'scale_objects') {
      const nextP = pickProblemForModule(mod, totalSolvedCount, probIdx);
      setProb(nextP);
    } else {
      setSelectedScaleOption(null);
      setScaleAnswerStatus('idle');
    }
  };

  // Password Unlock Check
  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim().toUpperCase() === 'PAHS2026') {
      setIsUnlocked(true);
      setPasswordError('');
      try {
        localStorage.setItem('pahs_lab_unlocked', 'true');
      } catch {
        // ignore
      }
      if (soundOn) sound.playFanfare();
    } else {
      setPasswordError('Incorrect passcode. Please ask your teacher.');
      if (soundOn) sound.playError();
    }
  };

  const handleRelock = () => {
    setIsUnlocked(false);
    try {
      localStorage.removeItem('pahs_lab_unlocked');
    } catch {
      // ignore
    }
    if (soundOn) sound.playPop();
  };

  // Text-to-speech
  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Animated Curved Hops Demo
  const triggerAnimatedHint = () => {
    if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    setIsAnimatingHint(true);
    setHintHopCount(0);
    setStatus('idle');
    setMessage(`Watch the hops! Jumping one space at a time...`);

    let current = 0;
    hintTimerRef.current = setInterval(() => {
      current++;
      setHintHopCount(current);
      if (soundOn) sound.playHop(current);

      if (current >= totalExpectedHops) {
        if (hintTimerRef.current) clearInterval(hintTimerRef.current);
        if (soundOn) sound.playPop();
        setMessage(`✨ Done! ${totalExpectedHops} jumps counted. Now click circle by circle to hop there!`);
      }
    }, 450);
  };

  // Strict step-by-step jump enforcement
  const handleDotClick = (gapIdx: number) => {
    if (gapIdx === currentDot) return;

    if (gapIdx !== nextAllowedGap && gapIdx !== prevAllowedGap) {
      setStatus('error');
      if (isTargetReached) {
        setMessage('🎯 You reached the target! Now type your answer below.');
      } else {
        setMessage('⚠️ No skipping jumps! Hop one digit space at a time so you can count each jump.');
      }
      if (soundOn) sound.playError();
      return;
    }

    const newHops = Math.abs(gapIdx - prob.startDot);
    if (soundOn) sound.playHop(newHops);

    setCurrentDot(gapIdx);
    setStatus('idle');

    if (gapIdx === prob.targetDot) {
      setMessage(`🎯 Target reached! Counted ${newHops} jumps. Now type your answer below!`);
      if (soundOn) sound.playPop();
    } else {
      setMessage(`Jump ${newHops} of ${totalExpectedHops} completed. Keep hopping!`);
    }
  };

  // Check Practice Answer (Modules 1 - 3)
  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!hasMovedDot) {
      setStatus('error');
      setMessage('⚠️ Please move the decimal dot above first! Hop circle-by-circle.');
      if (soundOn) sound.playError();
      return;
    }

    if (!isTargetReached) {
      setStatus('error');
      setMessage(`⚠️ Keep hopping until you reach the TARGET circle!`);
      if (soundOn) sound.playError();
      return;
    }

    setTotalAttempts((a) => a + 1);

    if (prob.direction === 'to_sci') {
      const cleanA = inputA.trim();
      const cleanMag = inputExpMagnitude.trim();

      if (!cleanA) {
        setStatus('error');
        setMessage('Type the front number into box 1.');
        if (soundOn) sound.playError();
        return;
      }
      if (!selectedSign) {
        setStatus('error');
        setMessage('Choose either + or - for the power.');
        if (soundOn) sound.playError();
        return;
      }
      if (!cleanMag) {
        setStatus('error');
        setMessage('Type the number of jumps into box 2.');
        if (soundOn) sound.playError();
        return;
      }

      const numA = parseFloat(cleanA);
      const expectedNumA = parseFloat(prob.expectedA);
      const mag = parseInt(cleanMag, 10);

      if (isNaN(numA) || Math.abs(numA - expectedNumA) > 0.001) {
        setStatus('error');
        setStreak(0);
        if (numA < 1 || numA >= 10) {
          setMessage(`Scientific notation rule: Front number MUST have exactly 1 whole number digit (1 to 9) in front of the decimal. It should be ${prob.expectedA}.`);
        } else {
          setMessage(`Check front number: it should be ${prob.expectedA}.`);
        }
        if (soundOn) sound.playError();
        return;
      }

      const expectedSign = prob.expectedExp < 0 ? '-' : '+';
      if (selectedSign !== expectedSign) {
        setStatus('error');
        setStreak(0);
        setMessage(
          prob.isBig
            ? `Big numbers (> 1) have a POSITIVE (+) exponent!`
            : `Decimals (< 1) have a NEGATIVE (-) exponent!`
        );
        if (soundOn) sound.playError();
        return;
      }

      if (mag !== totalExpectedHops) {
        setStatus('error');
        setStreak(0);
        setMessage(`Check jumps count: you hopped ${totalExpectedHops} times.`);
        if (soundOn) sound.playError();
        return;
      }
    } else {
      // to_std
      const cleanStd = inputStdNumber.replace(/,/g, '').trim();
      const expectedClean = prob.digits.join('').replace(/^0+(?=\d)/, '');

      const studentVal = parseFloat(cleanStd);
      let expectedVal = parseFloat(expectedClean);
      if (!prob.isBig) {
        const zeros = Math.abs(prob.expectedExp) - 1;
        const decStr = '0.' + '0'.repeat(zeros) + prob.expectedA.replace('.', '');
        expectedVal = parseFloat(decStr);
      }

      if (isNaN(studentVal) || Math.abs(studentVal - expectedVal) > 0.0000000001) {
        setStatus('error');
        setStreak(0);
        setMessage(`Check your standard number. Look at where the dot landed!`);
        if (soundOn) sound.playError();
        return;
      }
    }

    // Success! Update module counts
    if (currentModule === 'to_sci') setMod1Solved((c) => c + 1);
    else if (currentModule === 'to_std') setMod2Solved((c) => c + 1);
    else if (currentModule === 'mixed') setMod3Solved((c) => c + 1);

    setStatus('correct');
    const isStreakBonus = streak >= 2;
    const gainedXp = isStreakBonus ? 150 : 100;
    setXpPoints((x) => x + gainedXp);

    const funMessage = isStreakBonus ? `+${gainedXp} XP! 🔥 STREAK` : `+${gainedXp} XP! ⭐`;
    setFloatingXp({ text: funMessage, id: Date.now() });
    setTimeout(() => setFloatingXp(null), 1800);

    setMessage(`🎉 Correct! +${gainedXp} XP earned.`);
    const nextStreak = streak + 1;
    setStreak(nextStreak);

    // Alternating sounds (Minecraft level-up, Among Us chime, etc.)
    sound.playReward();
    if (nextStreak >= 3 && nextStreak % 3 === 0) {
      sound.playFanfare();
    }
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
  };

  const handleNext = () => {
    if (soundOn) sound.playPop();
    const nextIdx = probIdx + 1;
    setProbIdx(nextIdx);
    const nextP = pickProblemForModule(currentModule, totalSolvedCount, nextIdx);
    setProb(nextP);
  };

  const handleReset = () => {
    if (soundOn) sound.playPop();
    if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    setCurrentDot(prob.startDot);
    setInputA('');
    setSelectedSign(null);
    setInputExpMagnitude('');
    setInputStdNumber('');
    setStatus('idle');
    setMessage('');
    setIsAnimatingHint(false);
    setHintHopCount(0);
  };

  // Module 4: Scale Object Selection Handler (Choices are randomized on every question)
  const handleSelectScaleOption = (opt: string) => {
    if (scaleAnswerStatus === 'correct') return;
    setSelectedScaleOption(opt);
    setTotalAttempts((a) => a + 1);

    if (opt === currentScaleObject.correctSci) {
      setScaleAnswerStatus('correct');
      setMod4Solved((c) => c + 1);

      const isStreakBonus = streak >= 2;
      const gainedXp = isStreakBonus ? 150 : 100;
      setXpPoints((x) => x + gainedXp);

      const funMessage = currentScaleObject.visualType === 'amongus'
        ? `ඞ NOT AN IMPOSTOR! +${gainedXp} XP`
        : currentScaleObject.visualType === 'minecraft'
        ? `⛏️ MINECRAFT ACCURACY! +${gainedXp} XP`
        : `+${gainedXp} XP! ⭐`;

      setFloatingXp({ text: funMessage, id: Date.now() });
      setTimeout(() => setFloatingXp(null), 1800);

      const nextStreak = streak + 1;
      setStreak(nextStreak);

      sound.playReward();
      if (nextStreak >= 3 && nextStreak % 3 === 0) {
        sound.playFanfare();
      }
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } else {
      setScaleAnswerStatus('wrong');
      setStreak(0);
      if (soundOn) sound.playError();
    }
  };

  const handleNextScaleObject = () => {
    if (soundOn) sound.playPop();
    setScaleObjIdx((i) => i + 1);
    setSelectedScaleOption(null);
    setScaleAnswerStatus('idle');
  };

  // Exit Ticket Handlers (10 Questions)
  const startExitTicket = () => {
    if (!exitStudentName.trim()) {
      alert('Please enter your full name before starting the Exit Ticket.');
      return;
    }
    const questions = generate10QuestionExitTicket();
    setExitQuestions(questions);
    setExitCurrentQIdx(0);
    setExitAnswers(questions.map(() => ({ a: '', sign: '+', exp: '', std: '', choice: '' })));
    setExitStage('testing');
    if (soundOn) sound.playPop();
  };

  const handleExitAnswerChange = (field: 'a' | 'sign' | 'exp' | 'std' | 'choice', val: string) => {
    setExitAnswers((prev) => {
      const copy = [...prev];
      copy[exitCurrentQIdx] = {
        ...copy[exitCurrentQIdx],
        [field]: val,
      };
      return copy;
    });
  };

  const handleExitNextOrSubmit = () => {
    const q = exitQuestions[exitCurrentQIdx];
    const curr = exitAnswers[exitCurrentQIdx];

    if (q.type === 'to_sci') {
      if (!curr.a?.trim() || !curr.exp?.trim()) {
        alert('Please fill in both the front number and exponent.');
        return;
      }
    } else if (q.type === 'to_std') {
      if (!curr.std?.trim()) {
        alert('Please type the standard number.');
        return;
      }
    } else {
      if (!curr.choice) {
        alert('Please select an answer choice.');
        return;
      }
    }

    if (exitCurrentQIdx < exitQuestions.length - 1) {
      setExitCurrentQIdx((i) => i + 1);
      if (soundOn) sound.playPop();
    } else {
      let correct = 0;
      const details = exitQuestions.map((qItem, idx) => {
        const ans = exitAnswers[idx];
        if (qItem.type === 'to_sci') {
          const sA = parseFloat(ans.a || '');
          const sExp = (ans.sign === '-' ? -1 : 1) * parseInt(ans.exp || '0', 10);
          const expA = parseFloat(qItem.expectedA || '0');
          if (!isNaN(sA) && Math.abs(sA - expA) < 0.001 && sExp === qItem.expectedExp) {
            correct++;
            return true;
          }
          return false;
        } else if (qItem.type === 'to_std') {
          const sVal = parseFloat((ans.std || '').replace(/,/g, ''));
          const expVal = parseFloat((qItem.expectedStd || '').replace(/,/g, ''));
          if (!isNaN(sVal) && Math.abs(sVal - expVal) < 0.00000001) {
            correct++;
            return true;
          }
          return false;
        } else {
          if (ans.choice === qItem.expectedChoice) {
            correct++;
            return true;
          }
          return false;
        }
      });

      setExitScore({ correct, total: exitQuestions.length, details });
      setExitStage('results');
      if (soundOn) {
        if (correct >= 8) sound.playFanfare();
        else sound.playPop();
      }
      if (correct >= 8) {
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
      }
    }
  };

  const handleRetakeExitTicket = () => {
    const questions = generate10QuestionExitTicket();
    setExitQuestions(questions);
    setExitCurrentQIdx(0);
    setExitAnswers(questions.map(() => ({ a: '', sign: '+', exp: '', std: '', choice: '' })));
    setExitStage('testing');
    if (soundOn) sound.playPop();
  };

  const handleCopyExitTicketText = () => {
    const text = `--- PAHS SCIENTIFIC NOTATION 10-QUESTION EXIT TICKET ---
Student: ${exitStudentName} | ${exitClassPeriod}
Score: ${exitScore.correct} / ${exitScore.total} (${exitScore.correct * 10}%)
Verification Hash: #PAHS-EXIT-${Math.abs(exitScore.correct * 97 + exitScore.total * 31).toString(16).toUpperCase()}`;

    navigator.clipboard.writeText(text);
    setCopiedExit(true);
    if (soundOn) sound.playPop();
    setTimeout(() => setCopiedExit(false), 2500);
  };

  // PASSWORD LOCK SCREEN
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest block">
              Perth Amboy High School
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Scientific Notation Lab <span className="text-cyan-400">v3.0</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Please enter your classroom passcode to begin.
            </p>
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError('');
                }}
                placeholder="Enter Class Passcode"
                className="w-full text-center bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-2xl py-3 px-4 font-mono text-lg font-bold text-white uppercase tracking-wider focus:outline-none shadow-inner"
                autoFocus
              />
              {passwordError && (
                <p className="text-xs text-rose-400 font-semibold mt-2 animate-shake">
                  {passwordError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Unlock Lab ➔</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-sans">
            Designed by K. Chapman 2026 using Google AI Studio • v3.0
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-2 font-sans justify-between relative">
      {/* Floating XP Animation Banner */}
      {floatingXp && (
        <div key={floatingXp.id} className="fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-floatUp text-xs sm:text-sm font-black font-mono text-amber-300 bg-amber-950/95 border-2 border-amber-400 px-4 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{floatingXp.text}</span>
        </div>
      )}

      {/* Top Header - Ultra-compact with ENLARGED font scores for Chromebooks */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-1.5 border-b border-slate-800 shrink-0">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
            <span>PAHS Sci-Notation Lab</span>
            <span className="text-cyan-400 font-mono text-xs font-black px-1.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/50">v3.0</span>
            {streak >= 3 && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{streak} Streak!</span>
              </span>
            )}
          </h1>
          {/* ENLARGED Live Score & XP Gamification Row */}
          <div className="flex items-center gap-2.5 mt-1 text-xs sm:text-sm font-mono font-bold">
            <span className="flex items-center gap-1.5 font-black text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-xl border border-amber-500/60 shadow-inner">
              <span className="text-base">⭐</span>
              <span className="text-sm sm:text-base font-black">{xpPoints} XP</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">
              Score: <strong className="text-emerald-400 text-sm sm:text-base">{totalSolvedCount}</strong> / {totalAttempts} ({totalAttempts > 0 ? Math.round((totalSolvedCount / totalAttempts) * 100) : 100}%)
            </span>
            <span className={`text-xs font-sans font-black px-2.5 py-0.5 rounded-full border ${getRankBadge(xpPoints).color}`}>
              {getRankBadge(xpPoints).label}
            </span>
          </div>
        </div>

        {/* Action Buttons: Instructions, Exit Ticket, Sound, Lock */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (soundOn) sound.playPop();
              setShowInstructionsModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black transition-colors cursor-pointer shadow"
            title="Read instructions"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Instructions</span>
          </button>

          {/* EXIT TICKET BUTTON (GRAYED OUT UNTIL 8 PRACTICE SOLVED) */}
          <button
            onClick={() => {
              if (isExitTicketUnlocked) {
                if (soundOn) sound.playPop();
                setShowExitTicketModal(true);
                setExitStage('intro');
              } else {
                setTeacherUnlockClicks((c) => c + 1);
                if (soundOn) sound.playError();
                alert(`Exit Ticket is locked until you complete at least ${REQUIRED_EXIT_TICKET_COUNT} practice problems! (Current: ${totalSolvedCount}/${REQUIRED_EXIT_TICKET_COUNT})`);
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow ${
              isExitTicketUnlocked
                ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 animate-pulse cursor-pointer ring-2 ring-emerald-300'
                : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
            }`}
            title={isExitTicketUnlocked ? 'Take Exit Ticket' : `Complete ${REQUIRED_EXIT_TICKET_COUNT} practice problems to unlock Exit Ticket`}
          >
            {isExitTicketUnlocked ? <FileCheck className="w-4 h-4 text-slate-950" /> : <Lock className="w-3.5 h-3.5" />}
            <span>
              {isExitTicketUnlocked
                ? 'Exit Ticket ⭐'
                : `Exit Ticket (${totalSolvedCount}/${REQUIRED_EXIT_TICKET_COUNT})`}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundOn(!soundOn);
              sound.enabled = !soundOn;
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            title={soundOn ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Lock Button (Double Click toggles teacher unlock all) */}
          <button
            onClick={handleRelock}
            onDoubleClick={() => {
              setTeacherBypassAll((prev) => !prev);
              alert('Teacher override: All modules unlocked for review!');
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-800"
            title="Lock app (Teacher: double click to bypass module locks)"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 4-MODULE SELECTOR TABS WITH 15-QUESTION GATEKEEPING */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-center gap-1.5 py-1 shrink-0">
        {/* Module 1 */}
        <button
          type="button"
          onClick={() => handleSwitchModule('to_sci')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentModule === 'to_sci'
              ? 'bg-cyan-500 text-slate-950 font-black shadow-md ring-2 ring-cyan-300'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <span>📌 Mod 1: Num ➔ Sci ({mod1Solved}/15)</span>
        </button>

        {/* Module 2 (Requires 15 in Mod 1) */}
        <button
          type="button"
          onClick={() => handleSwitchModule('to_std')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentModule === 'to_std'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md ring-2 ring-amber-300'
              : isMod2Unlocked
              ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800/80'
          }`}
          title={isMod2Unlocked ? 'Module 2: Scientific to Number' : `Locked! Solve 15 in Mod 1 (Current: ${mod1Solved}/15)`}
        >
          {!isMod2Unlocked ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : <span>🔄</span>}
          <span>Mod 2: Sci ➔ Num {isMod2Unlocked ? `(${mod2Solved}/15)` : `(${mod1Solved}/15)`}</span>
        </button>

        {/* Module 3 (Requires 15 in Mod 2) */}
        <button
          type="button"
          onClick={() => handleSwitchModule('mixed')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentModule === 'mixed'
              ? 'bg-purple-500 text-white font-black shadow-md ring-2 ring-purple-300'
              : isMod3Unlocked
              ? 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800/80'
          }`}
          title={isMod3Unlocked ? 'Module 3: Mixed Challenge' : `Locked! Solve 15 in Mod 2 (Current: ${mod2Solved}/15)`}
        >
          {!isMod3Unlocked ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : <span>⚡</span>}
          <span>Mod 3: Mixed {isMod3Unlocked ? `(${mod3Solved}/15)` : `(${mod2Solved}/15)`}</span>
        </button>

        {/* Module 4 (Requires 15 in Mod 3) */}
        <button
          type="button"
          onClick={() => handleSwitchModule('scale_objects')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentModule === 'scale_objects'
              ? 'bg-emerald-400 text-slate-950 font-black shadow-md ring-2 ring-emerald-300'
              : isMod4Unlocked
              ? 'bg-slate-900 text-emerald-400 hover:bg-slate-800 border border-emerald-500/40'
              : 'bg-slate-900/60 text-slate-500 border border-slate-800/80'
          }`}
          title={isMod4Unlocked ? 'Module 4: Real-World Scale' : `Locked! Solve 15 in Mod 3 (Current: ${mod3Solved}/15)`}
        >
          {!isMod4Unlocked ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : <Compass className="w-3.5 h-3.5" />}
          <span>Mod 4: Real Scale {isMod4Unlocked ? `(${mod4Solved})` : `(${mod3Solved}/15)`}</span>
        </button>
      </div>

      {/* Main Container - Strict Single-Screen Viewport for Chromebook */}
      <main className="w-full max-w-4xl flex-1 flex flex-col justify-center py-0.5 space-y-2">
        
        {/* MODULE 4: REAL-WORLD SCALE & OBJECT MEASUREMENT MATCHING */}
        {currentModule === 'scale_objects' ? (
          <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-3.5 space-y-2.5 shadow-2xl">
            {/* Header & Scale Range Indicator */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                  Object #{scaleObjIdx + 1} of {SCALE_OBJECTS.length}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-950 text-emerald-300 border border-emerald-500/40">
                  {currentScaleObject.typeBadge}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSpeak(`${currentScaleObject.name}: ${currentScaleObject.description}`)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                  title="Read Aloud"
                >
                  <Volume1 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* ENLARGED Object Card with High-Contrast Visual Diagram */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center gap-4">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-inner shrink-0 p-1">
                {renderObjectVisual(currentScaleObject.visualType)}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
                  <span>{currentScaleObject.name}</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {currentScaleObject.description}
                </p>
                {/* Size Comparison Badge */}
                <div className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-md inline-block">
                  📏 Comparison: {currentScaleObject.sizeComparison}
                </div>
              </div>
            </div>

            {/* Question Prompt */}
            <div className="text-center text-xs sm:text-sm font-bold text-amber-300">
              Which scientific notation best estimates this size?
            </div>

            {/* 4 Interactive Choices - SHUFFLED DYNAMICALLY (NOT stuck in top-left!) */}
            <div className="grid grid-cols-2 gap-2.5">
              {shuffledScaleOptions.map((opt, i) => {
                const isSelected = selectedScaleOption === opt;
                const isCorrect = opt === currentScaleObject.correctSci;

                let btnStyle = 'bg-slate-950 hover:bg-slate-800/80 border-slate-800 text-white';
                if (scaleAnswerStatus !== 'idle') {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-400';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                  } else {
                    btnStyle = 'opacity-40 bg-slate-950 border-slate-800 text-slate-400';
                  }
                }

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectScaleOption(opt)}
                    className={`py-3.5 px-3 rounded-xl border-2 font-mono font-black text-base sm:text-xl transition-all cursor-pointer shadow flex items-center justify-center gap-2 ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {scaleAnswerStatus === 'correct' && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>

            {/* Scientific Explanation & Fun Fact Banner */}
            {scaleAnswerStatus !== 'idle' && (
              <div
                className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed border ${
                  scaleAnswerStatus === 'correct'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}
              >
                {scaleAnswerStatus === 'correct' ? (
                  <div>
                    <strong>✓ Brilliant!</strong> {currentScaleObject.fact}
                  </div>
                ) : (
                  <div>
                    <strong>✗ Not quite!</strong> Check the order of magnitude. Microscopic objects have negative powers (10⁻³ to 10⁻¹⁰), while buildings and cosmic bodies have positive powers (10² to 10²¹). Try again!
                  </div>
                )}
              </div>
            )}

            {/* Next Object Button */}
            {scaleAnswerStatus === 'correct' && (
              <button
                type="button"
                onClick={handleNextScaleObject}
                className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-2 animate-bounce"
              >
                <span>Next Real-World Object ➔</span>
              </button>
            )}
          </div>
        ) : (
          /* MODULES 1 - 3: TACTILE DECIMAL JUMP WORKSPACE */
          <div className="bg-slate-900 border-2 border-slate-800 rounded-2xl p-3 space-y-2 shadow-2xl">
            {/* Banner: Question Direction & Problem Counter */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 pb-1 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
                  Practice #{probIdx}
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  &middot; Solved: <strong className="text-emerald-400">{currentModule === 'to_sci' ? mod1Solved : currentModule === 'to_std' ? mod2Solved : mod3Solved}</strong>/15
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${prob.direction === 'to_sci' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-amber-950 border-amber-500 text-amber-300'}`}>
                  {prob.direction === 'to_sci' ? 'Standard ➔ Scientific' : 'Scientific ➔ Standard'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSpeak(`Convert ${prob.original}`)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                  title="Read Problem Aloud"
                >
                  <Volume1 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={triggerAnimatedHint}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-xl text-[11px] font-black transition-all cursor-pointer shadow ${
                    isAnimatingHint
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                      : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  }`}
                  title="Watch animated hop arrows"
                >
                  <Lightbulb className="w-3 h-3 text-amber-400" />
                  <span>{isAnimatingHint ? 'Replay Hops ↺' : 'Hop Arrows 💡'}</span>
                </button>
              </div>
            </div>

            {/* HIGH-CONTRAST PROBLEM DISPLAY */}
            <div className="text-center py-1.5 px-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-xs sm:text-sm text-slate-300 font-bold uppercase tracking-wider">
                {prob.direction === 'to_sci' ? 'Convert to Scientific Notation:' : 'Convert to Standard Number:'}
              </span>
              <div className="text-2xl sm:text-4xl font-black font-mono text-amber-300 tracking-wider">
                {prob.original}
              </div>
              <div className="text-xs text-slate-400 font-semibold hidden sm:block">
                {prob.direction === 'to_sci'
                  ? prob.isBig ? 'Big Number (> 1)' : 'Decimal (< 1)'
                  : prob.isBig ? 'Hop RIGHT (Big Number)' : 'Hop LEFT (Decimal)'}
              </div>
            </div>

            {/* THE MANIPULATIVE: STRICT ONE-BY-ONE JUMPING */}
            <div className="bg-slate-950 p-2 rounded-xl border-2 border-slate-800 space-y-1">
              <div className="text-[10px] sm:text-xs font-bold text-slate-300 text-center uppercase tracking-wider flex items-center justify-center gap-2">
                <span>
                  {prob.direction === 'to_sci'
                    ? 'Step 1: Hop to TARGET (leave 1 digit in front):'
                    : prob.isBig
                    ? `Step 1: Hop ${prob.expectedExp} spaces RIGHT to expand:`
                    : `Step 1: Hop ${Math.abs(prob.expectedExp)} spaces LEFT for decimal:`}
                </span>
                {isAnimatingHint && (
                  <span className="text-amber-300 font-mono text-[10px] bg-amber-950 px-2 py-0.2 rounded-full border border-amber-500">
                    Hop {hintHopCount} of {totalExpectedHops}
                  </span>
                )}
              </div>

              {/* Digits & Gaps Row */}
              <div className="w-full flex items-end justify-center select-none pt-6 sm:pt-7 overflow-hidden">
                <div className="flex items-end justify-center gap-0.5 sm:gap-1 max-w-full">
                  {/* Gap 0 */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={responsiveStyles.arcHeight} />
                    <button
                      type="button"
                      onClick={() => handleDotClick(0)}
                      className={`${responsiveStyles.gapBtn} rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        currentDot === 0
                          ? 'bg-cyan-950 border-2 border-cyan-400 shadow-xl ring-2 ring-cyan-500/30'
                          : 0 === nextAllowedGap
                          ? 'border-2 border-cyan-400 bg-cyan-950/40 animate-pulse ring-2 ring-cyan-400/40'
                          : 'hover:bg-slate-800/80 border border-transparent opacity-60'
                      }`}
                    >
                      {currentDot === 0 && (
                        <div className={`${responsiveStyles.dotSize} rounded-full bg-cyan-400 shadow-xl ring-2 sm:ring-4 ring-cyan-200 animate-pulse`} />
                      )}
                    </button>
                  </div>

                  {prob.digits.map((digit, idx) => {
                    const gapIdx = idx + 1;
                    const isDot = currentDot === gapIdx;
                    const isTarget = prob.targetDot === gapIdx;
                    const isNextStep = gapIdx === nextAllowedGap;

                    let isHopDigit = false;
                    let hopNumber = 0;
                    const stepDir = prob.startDot > prob.targetDot ? -1 : 1;

                    if (stepDir === -1) {
                      if (idx >= prob.targetDot && idx < prob.startDot) {
                        isHopDigit = true;
                        hopNumber = prob.startDot - idx;
                      }
                    } else {
                      if (idx >= prob.startDot && idx < prob.targetDot) {
                        isHopDigit = true;
                        hopNumber = idx - prob.startDot + 1;
                      }
                    }

                    const isHopVisible = isAnimatingHint && isHopDigit && hopNumber <= hintHopCount;

                    return (
                      <React.Fragment key={idx}>
                        <div className="flex flex-col items-center relative shrink-0">
                          {/* Curved Arrow Arc */}
                          <div className={`${responsiveStyles.arcHeight} ${responsiveStyles.arcWidth} ${responsiveStyles.arcMargin} flex flex-col items-center justify-end pb-0.5 pointer-events-none z-10`}>
                            {isHopVisible ? (
                              <div className="w-full flex flex-col items-center animate-bounce">
                                <span className="text-[8px] sm:text-[9px] font-mono font-black text-amber-300 bg-amber-950 border border-amber-500 px-1 py-0.2 rounded-full shadow-lg">
                                  #{hopNumber}
                                </span>

                                <svg
                                  className="w-full h-5 sm:h-6 text-amber-400 drop-shadow-md"
                                  viewBox="0 0 100 36"
                                  fill="none"
                                  preserveAspectRatio="none"
                                >
                                  {stepDir === -1 ? (
                                    <>
                                      <path d="M 95 34 Q 50 2 6 34" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                      <polygon points="5,34 16,24 13,35" fill="currentColor" />
                                    </>
                                  ) : (
                                    <>
                                      <path d="M 5 34 Q 50 2 94 34" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                      <polygon points="95,34 87,35 84,24" fill="currentColor" />
                                    </>
                                  )}
                                </svg>
                              </div>
                            ) : (
                              <div className="h-4" />
                            )}
                          </div>

                          {/* Digit Block */}
                          <div className={`${responsiveStyles.digitBox} rounded-xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center font-mono font-black text-white shadow-xl`}>
                            {digit}
                          </div>
                        </div>

                        {/* Dot Gap Button */}
                        <div className="flex flex-col items-center shrink-0">
                          <div className={`${responsiveStyles.arcHeight} flex items-end pb-0.5`}>
                            {isTarget && (
                              <span className="text-[8px] font-black text-amber-400 bg-amber-950 border border-amber-500 px-1 rounded">
                                TARGET
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDotClick(gapIdx)}
                            className={`${responsiveStyles.gapBtn} rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
                              isDot
                                ? 'bg-cyan-950 border-2 border-cyan-400 shadow-xl ring-2 sm:ring-4 ring-cyan-500/30'
                                : isNextStep
                                ? 'border-2 border-cyan-400 bg-cyan-950/40 ring-2 ring-cyan-400/50 animate-pulse'
                                : isTarget
                                ? 'border-2 border-dashed border-amber-400/60 bg-amber-950/20'
                                : 'hover:bg-slate-800/80 border border-transparent opacity-60'
                            }`}
                            title={isNextStep ? 'Click to make next hop!' : 'Move dot here'}
                          >
                            {isDot ? (
                              <div className="flex flex-col items-center">
                                <div className={`${responsiveStyles.dotSize} rounded-full bg-cyan-400 shadow-xl ring-2 ring-cyan-200 animate-pulse`} />
                                <span className="text-[8px] font-mono text-cyan-300 font-bold mt-0.5">
                                  DOT
                                </span>
                              </div>
                            ) : isNextStep ? (
                              <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-cyan-300 animate-bounce">
                                  HOP!
                                </span>
                                <span className="w-2 h-2 rounded-full bg-cyan-400 mt-0.5 shadow" />
                              </div>
                            ) : isTarget ? (
                              <span className="w-2 h-2 rounded-full bg-amber-400/60" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-700 group-hover:bg-slate-400" />
                            )}
                          </button>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Counter Bar */}
              <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-xs font-mono border-t border-slate-900">
                <div className="text-slate-300 flex items-center gap-1.5">
                  <span>Jumps Counted:</span>
                  <strong className="text-amber-300 text-sm bg-slate-900 px-2 py-0.2 rounded-lg border border-slate-800">
                    {jumpsMade}
                  </strong>
                  {isTargetReached && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                      <Check className="w-3 h-3" />
                      <span>Target Reached!</span>
                    </span>
                  )}
                </div>

                <div className="text-[10px] text-slate-400">
                  {prob.direction === 'to_sci' ? (
                    <span>Big number = Positive (+) &middot; Decimal = Negative (-)</span>
                  ) : (
                    <span>Positive = Hop Right ➔ &middot; Negative = Hop Left ⬅</span>
                  )}
                </div>
              </div>
            </div>

            {/* Card 2: Fill in the Answer */}
            <form onSubmit={handleCheck} className="space-y-1.5 pt-0.5">
              {!hasMovedDot ? (
                <div className="p-1.5 rounded-xl bg-amber-950/70 border border-amber-500/80 text-amber-200 flex items-center justify-center gap-2 shadow text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Step 1: Move the decimal dot above first! Click the flashing circle to start.</span>
                </div>
              ) : !isTargetReached ? (
                <div className="p-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/80 text-cyan-200 flex items-center justify-center gap-2 shadow text-xs font-bold">
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Keep hopping! Follow the flashing circle until you reach the TARGET.</span>
                </div>
              ) : (
                <div className="bg-slate-950 p-1.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Step 2: Dot moved! Now type your answer:</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {prob.direction === 'to_sci' ? '[Front Number] × 10^[Power]' : 'Standard Form (e.g. 52000)'}
                  </span>
                </div>
              )}

              {/* Dynamic Input depending on Direction */}
              {prob.direction === 'to_sci' ? (
                <div className={`flex flex-wrap items-center justify-center gap-2 text-2xl font-mono font-black text-white transition-opacity ${!isTargetReached ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      value={inputA}
                      onChange={(e) => {
                        setInputA(e.target.value);
                        setStatus('idle');
                      }}
                      disabled={!isTargetReached}
                      placeholder=""
                      className="w-24 sm:w-28 text-center bg-slate-950 border-2 border-cyan-500 focus:border-cyan-400 rounded-xl py-1 px-2 font-mono text-xl sm:text-2xl text-cyan-300 font-black focus:outline-none shadow-inner disabled:cursor-not-allowed"
                    />
                    <span className="text-[10px] font-sans font-bold text-slate-400">1. Front Number</span>
                  </div>

                  <span className="text-slate-400 -mt-3 text-lg">× 10</span>

                  <div className="flex flex-col items-center -mt-3">
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border-2 border-amber-500">
                      <button
                        type="button"
                        disabled={!isTargetReached}
                        onClick={() => {
                          setSelectedSign('+');
                          setStatus('idle');
                          if (soundOn) sound.playPop();
                        }}
                        className={`w-7 h-7 rounded-lg text-base font-black transition-all cursor-pointer flex items-center justify-center ${
                          selectedSign === '+' ? 'bg-amber-400 text-slate-950 shadow scale-105' : 'bg-slate-900 text-amber-400'
                        }`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        disabled={!isTargetReached}
                        onClick={() => {
                          setSelectedSign('-');
                          setStatus('idle');
                          if (soundOn) sound.playPop();
                        }}
                        className={`w-7 h-7 rounded-lg text-base font-black transition-all cursor-pointer flex items-center justify-center ${
                          selectedSign === '-' ? 'bg-cyan-400 text-slate-950 shadow scale-105' : 'bg-slate-900 text-cyan-400'
                        }`}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={inputExpMagnitude}
                        onChange={(e) => {
                          setInputExpMagnitude(e.target.value.replace(/[^0-9]/g, ''));
                          setStatus('idle');
                        }}
                        disabled={!isTargetReached}
                        placeholder=""
                        className="w-12 text-center bg-transparent py-0.5 px-1 font-mono text-xl text-white font-black focus:outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                    <span className="text-[10px] font-sans font-bold text-slate-400">2. Sign &amp; Jumps</span>
                  </div>
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center gap-1 text-white transition-opacity ${!isTargetReached ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputStdNumber}
                      onChange={(e) => {
                        setInputStdNumber(e.target.value);
                        setStatus('idle');
                      }}
                      disabled={!isTargetReached}
                      placeholder="e.g. 52000 or 0.00074"
                      className="w-48 sm:w-64 text-center bg-slate-950 border-2 border-amber-400 focus:border-amber-300 rounded-xl py-1.5 px-3 font-mono text-xl sm:text-2xl text-amber-300 font-black focus:outline-none shadow-inner disabled:cursor-not-allowed"
                      autoFocus={isTargetReached}
                    />
                  </div>
                  <span className="text-[10px] font-sans font-bold text-slate-400">
                    Type standard number (with or without commas)
                  </span>
                </div>
              )}

              {/* Feedback Message */}
              {message && (
                <div
                  className={`p-1.5 rounded-xl text-center text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                    status === 'correct'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500'
                      : 'bg-rose-950/80 text-rose-300 border border-rose-500 animate-shake'
                  }`}
                >
                  <span>{message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2 pt-0.5">
                {status !== 'correct' ? (
                  <button
                    type="submit"
                    disabled={!isTargetReached}
                    className={`w-full sm:w-auto px-7 py-2 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow flex items-center justify-center gap-1.5 ${
                      isTargetReached
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Check Answer</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full sm:w-auto px-7 py-2 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-1.5 animate-bounce"
                  >
                    <span>Next Practice</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700"
                  title="Reset dot position"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* FORMAL 10-QUESTION EXIT TICKET MODAL */}
      {showExitTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl max-w-xl w-full p-5 space-y-3.5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowExitTicketModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* STAGE 1: INTRO */}
            {exitStage === 'intro' && (
              <div className="space-y-3.5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto">
                  <FileCheck className="w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-xl font-black text-white">Class Period Exit Ticket</h2>
                  <p className="text-xs text-slate-400">
                    10-Question Comprehensive Assessment (10 pts each = 100% total)
                  </p>
                </div>

                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left space-y-2.5">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                      Student Full Name:
                    </label>
                    <input
                      type="text"
                      value={exitStudentName}
                      onChange={(e) => setExitStudentName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-emerald-400"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 uppercase">
                      Class Period:
                    </label>
                    <select
                      value={exitClassPeriod}
                      onChange={(e) => setExitClassPeriod(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-sm text-white font-bold focus:outline-none focus:border-emerald-400"
                    >
                      <option>Period 1</option>
                      <option>Period 2</option>
                      <option>Period 3</option>
                      <option>Period 4</option>
                      <option>Period 5</option>
                      <option>Period 6</option>
                      <option>Period 7</option>
                      <option>Period 8</option>
                    </select>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left leading-relaxed">
                  📌 <strong>Assessment Overview:</strong> 10 questions covering standard numbers, small decimals, reverse conversions, and real-world scale orders of magnitude. Complete manually without animations.
                </div>

                <button
                  type="button"
                  onClick={startExitTicket}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Start 10-Question Exit Ticket ➔</span>
                </button>
              </div>
            )}

            {/* STAGE 2: 10-QUESTION TESTING */}
            {exitStage === 'testing' && exitQuestions[exitCurrentQIdx] && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider">
                    Question {exitCurrentQIdx + 1} of {exitQuestions.length}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                    {exitQuestions[exitCurrentQIdx].difficulty}
                  </span>
                </div>

                <div className="text-center py-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    {exitQuestions[exitCurrentQIdx].prompt}
                  </span>
                </div>

                {/* Question Input Form according to Type */}
                {exitQuestions[exitCurrentQIdx].type === 'to_sci' ? (
                  <div className="flex flex-wrap items-center justify-center gap-2 text-2xl font-mono font-black text-white py-2">
                    <input
                      type="text"
                      value={exitAnswers[exitCurrentQIdx]?.a || ''}
                      onChange={(e) => handleExitAnswerChange('a', e.target.value)}
                      placeholder="a"
                      className="w-24 text-center bg-slate-950 border-2 border-cyan-500 rounded-xl py-1 text-xl text-cyan-300 font-black focus:outline-none"
                      autoFocus
                    />
                    <span className="text-slate-400 -mt-2">× 10</span>
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border-2 border-amber-500 -mt-2">
                      <button
                        type="button"
                        onClick={() => handleExitAnswerChange('sign', '+')}
                        className={`w-7 h-7 rounded-lg text-base font-black ${
                          exitAnswers[exitCurrentQIdx]?.sign === '+' ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-amber-400'
                        }`}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExitAnswerChange('sign', '-')}
                        className={`w-7 h-7 rounded-lg text-base font-black ${
                          exitAnswers[exitCurrentQIdx]?.sign === '-' ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 text-cyan-400'
                        }`}
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={exitAnswers[exitCurrentQIdx]?.exp || ''}
                        onChange={(e) => handleExitAnswerChange('exp', e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="n"
                        className="w-10 text-center bg-transparent py-0.5 font-mono text-xl text-white font-black focus:outline-none"
                      />
                    </div>
                  </div>
                ) : exitQuestions[exitCurrentQIdx].type === 'to_std' ? (
                  <div className="flex flex-col items-center justify-center gap-1 py-2">
                    <input
                      type="text"
                      value={exitAnswers[exitCurrentQIdx]?.std || ''}
                      onChange={(e) => handleExitAnswerChange('std', e.target.value)}
                      placeholder="e.g. 3500 or 0.0041"
                      className="w-60 text-center bg-slate-950 border-2 border-amber-400 rounded-xl py-1.5 px-3 font-mono text-xl text-amber-300 font-black focus:outline-none"
                      autoFocus
                    />
                    <span className="text-[10px] text-slate-400">Type standard number or decimal</span>
                  </div>
                ) : (
                  /* Scale Matching Choice in Exit Ticket (Shuffled options) */
                  <div className="grid grid-cols-2 gap-2.5 py-2">
                    {exitQuestions[exitCurrentQIdx].options?.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleExitAnswerChange('choice', opt)}
                        className={`py-3 px-2 rounded-xl border-2 font-mono font-bold text-sm transition-all cursor-pointer ${
                          exitAnswers[exitCurrentQIdx]?.choice === opt
                            ? 'bg-emerald-950 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400'
                            : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-white'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex justify-between gap-3">
                  {exitCurrentQIdx > 0 && (
                    <button
                      type="button"
                      onClick={() => setExitCurrentQIdx((i) => i - 1)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                    >
                      ← Previous
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleExitNextOrSubmit}
                    className="flex-1 py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer ml-auto"
                  >
                    {exitCurrentQIdx === exitQuestions.length - 1 ? 'Submit 10-Question Exit Ticket ➔' : 'Next Question ➔'}
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3: RESULTS (SCORE / 10 & 100%) */}
            {exitStage === 'results' && (
              <div className="space-y-3">
                <div className="text-center p-3.5 bg-slate-950 rounded-2xl border-2 border-emerald-500 space-y-1.5">
                  <div className="flex items-center justify-center gap-1 text-xs font-mono text-emerald-400 uppercase tracking-widest">
                    <Award className="w-4 h-4" />
                    <span>Official Exit Ticket Grade</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-white">
                    {exitStudentName} &middot; {exitClassPeriod}
                  </h3>

                  <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                    {exitScore.correct} / 10
                    <span className="text-lg text-slate-300 ml-2">
                      ({exitScore.correct * 10}%)
                    </span>
                  </div>

                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-slate-900 border border-slate-700 text-amber-300">
                    {exitScore.correct >= 9 ? '🏆 Mastery (A+)' : exitScore.correct >= 7 ? '⭐ Proficient (Passing)' : '✏️ Retake Available'}
                  </span>
                </div>

                {/* Chromebook Snapshot Instructions Banner */}
                <div className="p-3 rounded-xl bg-amber-950/80 border-2 border-amber-400 text-amber-100 space-y-1 shadow">
                  <div className="flex items-center gap-1.5 font-black text-amber-300 text-xs uppercase">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>📸 Snapshot Instructions for Chromebook:</span>
                  </div>
                  <p className="text-[11px] text-amber-200 leading-relaxed">
                    Press <strong>Ctrl</strong> + <strong>Show Windows key 🔲</strong> (above key 6) to take a screenshot and turn it into Google Classroom!
                  </p>
                  <div className="pt-0.5 text-[9px] font-mono text-amber-400 text-center border-t border-amber-500/40">
                    Verification Code: #PAHS-EXIT-{Math.abs(exitScore.correct * 97 + exitScore.total * 31).toString(16).toUpperCase()}
                  </div>
                </div>

                {/* 10-Question Detailed Breakdown */}
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {exitQuestions.map((q, idx) => {
                    const isCorrect = exitScore.details[idx];
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${
                          isCorrect ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                        }`}
                      >
                        <div>
                          <strong className="text-white block">{q.prompt}</strong>
                        </div>
                        <span className="font-black text-sm">{isCorrect ? '✓' : '✗'}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopyExitTicketText}
                    className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
                  >
                    {copiedExit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedExit ? 'Copied!' : 'Copy Summary'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRetakeExitTicket}
                    className="flex-1 py-2.5 px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retake for Better Score ↺</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP MODAL: INSTRUCTIONS */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-cyan-400 rounded-3xl max-w-lg w-full p-5 space-y-3.5 shadow-2xl relative">
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">4 Lab Modules Guide</h2>
                <p className="text-[11px] text-slate-400">Scientific Notation Practice Guide</p>
              </div>
            </div>

            <div className="space-y-2 text-slate-200 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-400 text-amber-200">
                <strong className="text-amber-300 block text-xs uppercase tracking-wide">⭐ The Golden Rule of Scientific Notation:</strong>
                <p className="text-[11px] leading-relaxed mt-0.5">
                  The front number MUST always have <strong>exactly ONE non-zero whole number digit (1 to 9)</strong> in front of the decimal point! (Example: <strong>3.5 × 10⁻²</strong>, NEVER 0.35 or 35).
                </p>
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <strong className="text-cyan-300 block">Mod 1: Number ➔ Scientific Notation</strong>
                <p className="text-slate-300 text-[11px]">
                  Hop the decimal until exactly 1 whole number (1-9) is in front. Solve 15 problems to unlock Module 2!
                </p>
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <strong className="text-amber-300 block">Mod 2: Scientific Notation ➔ Number</strong>
                <p className="text-slate-300 text-[11px]">
                  Positive (+) = hop RIGHT ➔ to expand. Negative (-) = hop LEFT ⬅ for decimal. Solve 15 to unlock Module 3!
                </p>
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <strong className="text-purple-300 block">Mod 3: Mixed Challenge</strong>
                <p className="text-slate-300 text-[11px]">
                  Alternates randomly between both directions to build two-way fluency! Solve 15 to unlock Module 4!
                </p>
              </div>

              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                <strong className="text-emerald-300 block">Mod 4: Real-World &amp; Game Scale</strong>
                <p className="text-slate-300 text-[11px]">
                  Match objects like Minecraft Blocks (1.0 × 10⁰ m), Among Us Crewmates, Atoms (10⁻¹⁰ m), and Galaxies (10²¹ m)!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowInstructionsModal(false)}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
            >
              Start Practicing ➔
            </button>
          </div>
        </div>
      )}

      {/* Footer Attribution */}
      <footer className="w-full max-w-4xl py-0.5 text-center text-[10px] text-slate-500 font-sans border-t border-slate-900 shrink-0">
        Designed by K. Chapman 2026 using Google AI Studio • v3.0
      </footer>
    </div>
  );
};
