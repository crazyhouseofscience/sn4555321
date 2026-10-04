export interface ScaleItem {
  id: string;
  name: string;
  category: 'cosmic' | 'everyday' | 'microscopic' | 'quantum';
  exponent: number;
  standardFormatted: string;
  scientificNotation: string;
  mantissa: number;
  unit: string;
  description: string;
  emoji: string;
  tagline: string;
  careerContext?: string;
  imagePath?: string;
}

export interface RealWorldStory {
  id: string;
  title: string;
  category: 'astronomy' | 'virology' | 'geology' | 'neuroscience' | 'economy';
  scientificNotation: string;
  standardForm: string;
  unit: string;
  exponent: number;
  mantissa: number;
  imagePath: string;
  emoji: string;
  headline: string;
  whyScientificMatters: string;
  typoRiskDemo: string;
  funFact: string;
  spokenAudio: string;
}

export interface HopStep {
  stepIndex: number;
  fromDigitIndex: number;
  toDigitIndex: number;
  currentNumberStr: string;
  exponentCount: number;
  explanation: string;
  type?: 'shift' | 'add_zero';
}

export interface UnpackStep {
  step: number;
  description: string;
  charState: string[];
  dotPos: number;
  zerosAdded: number;
  currentValueDisplay: string;
}

export interface ChallengeItem {
  id: string;
  tier: 1 | 2 | 3 | 4;
  type: 'rule_check' | 'big_or_tiny' | 'count_hops' | 'translate';
  title: string;
  prompt: string;
  givenValue: string;
  options?: string[];
  correctAnswer: string | number | boolean;
  explanation: string;
  hints: string[];
  numberMeta?: {
    standard: string;
    scientific: string;
    mantissa: number;
    exponent: number;
  };
}

export interface QuizQuestion {
  id: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'master';
  category: 'basic_conversion' | 'direction_sign' | 'zero_filling' | 'real_world_calc';
  question: string;
  givenDisplay: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
  points: number;
  realWorldTag?: string;
}

export interface UserStats {
  score: number;
  streak: number;
  highestStreak: number;
  totalQuizzesTaken: number;
  totalCorrect: number;
  highScoreTimed: number;
  completedQuestions: string[];
  unlockedBadges: string[];
  soundEnabled: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
}
