import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  FileCheck,
  Calculator
} from 'lucide-react';
import { sound } from '../utils/audio';
import { formatSuperscript } from '../utils/scinoteHelper';
import { DecimalSliderStage } from './DecimalSliderStage';

interface PracticeProblem {
  id: number;
  originalRaw: string;
  digits: string[];
  initialDotIndex: number;
  targetDotIndex: number;
  expectedMantissa: string; // e.g. "5.4"
  expectedHops: number; // e.g. 4
  expectedSign: '+' | '-';
  expectedExponent: number; // 4
  context: string;
}

const PROBLEMS: PracticeProblem[] = [
  {
    id: 1,
    originalRaw: '54,000',
    digits: ['5', '4', '0', '0', '0'],
    initialDotIndex: 5,
    targetDotIndex: 1,
    expectedMantissa: '5.4',
    expectedHops: 4,
    expectedSign: '+',
    expectedExponent: 4,
    context: 'Concert attendance (Big Number > 1)'
  },
  {
    id: 2,
    originalRaw: '0.0032',
    digits: ['0', '0', '0', '3', '2'],
    initialDotIndex: 1,
    targetDotIndex: 4,
    expectedMantissa: '3.2',
    expectedHops: 3,
    expectedSign: '-',
    expectedExponent: -3,
    context: 'Weight of an insect wing in grams (Decimal < 1)'
  },
  {
    id: 3,
    originalRaw: '9,200,000',
    digits: ['9', '2', '0', '0', '0', '0', '0'],
    initialDotIndex: 7,
    targetDotIndex: 1,
    expectedMantissa: '9.2',
    expectedHops: 6,
    expectedSign: '+',
    expectedExponent: 6,
    context: 'City population (Big Number > 1)'
  },
  {
    id: 4,
    originalRaw: '0.000085',
    digits: ['0', '0', '0', '0', '0', '8', '5'],
    initialDotIndex: 1,
    targetDotIndex: 6,
    expectedMantissa: '8.5',
    expectedHops: 5,
    expectedSign: '-',
    expectedExponent: -5,
    context: 'Width of a plant pollen grain in meters (Decimal < 1)'
  },
  {
    id: 5,
    originalRaw: '700,000,000',
    digits: ['7', '0', '0', '0', '0', '0', '0', '0', '0'],
    initialDotIndex: 9,
    targetDotIndex: 1,
    expectedMantissa: '7',
    expectedHops: 8,
    expectedSign: '+',
    expectedExponent: 8,
    context: 'Global streaming views (Big Number > 1)'
  }
];

interface PracticeStudioProps {
  onProblemSolved: (hops: number) => void;
  onOpenExitTicket: () => void;
  problemsSolvedCount: number;
}

export const PracticeStudio: React.FC<PracticeStudioProps> = ({
  onProblemSolved,
  onOpenExitTicket,
  problemsSolvedCount
}) => {
  const [problemIndex, setProblemIndex] = useState(0);
  const currentProblem = PROBLEMS[problemIndex % PROBLEMS.length];

  // Dot position
  const [currentDotIndex, setCurrentDotIndex] = useState(currentProblem.initialDotIndex);

  // Workflow Phases:
  // 1: 'drag_bead' -> student slides/drags the decimal bead to the target
  // 2: 'type_front' -> student types the front number
  // 3: 'type_jumps' -> student types the number of jumps
  // 4: 'pick_sign' -> student chooses/types + or -
  // 5: 'solved' -> formula lights up with proof check
  const [phase, setPhase] = useState<'drag_bead' | 'type_front' | 'type_jumps' | 'pick_sign' | 'solved'>('drag_bead');

  // Student Typed Inputs
  const [frontInput, setFrontInput] = useState('');
  const [jumpsInput, setJumpsInput] = useState('');
  const [signChoice, setSignChoice] = useState<'+' | '-' | ''>('');

  // Errors
  const [frontError, setFrontError] = useState<string | null>(null);
  const [jumpsError, setJumpsError] = useState<string | null>(null);
  const [signError, setSignError] = useState<string | null>(null);

  // Reset when problem changes
  useEffect(() => {
    setCurrentDotIndex(currentProblem.initialDotIndex);
    setPhase('drag_bead');
    setFrontInput('');
    setJumpsInput('');
    setSignChoice('');
    setFrontError(null);
    setJumpsError(null);
    setSignError(null);
  }, [problemIndex, currentProblem]);

  // Handle dot position change
  const handleDotChange = (newDotIndex: number) => {
    setCurrentDotIndex(newDotIndex);

    // If dot reaches target spot
    if (newDotIndex === currentProblem.targetDotIndex) {
      sound.playCorrect();
      setTimeout(() => {
        setPhase('type_front');
      }, 350);
    }
  };

  // Step 2: Validate Typed Front Number
  const handleSubmitFront = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = frontInput.trim();
    const expected = currentProblem.expectedMantissa;
    const num = parseFloat(clean);

    if (!clean) {
      setFrontError('Please type the number you made.');
      sound.playError();
      return;
    }

    if (isNaN(num)) {
      setFrontError('Must be a valid number.');
      sound.playError();
      return;
    }

    if (num < 1 || num >= 10) {
      setFrontError(`Only 1 digit allowed before the decimal (1.0 to 9.9). You entered ${clean}.`);
      sound.playError();
      return;
    }

    if (clean === expected || num === parseFloat(expected)) {
      sound.playCorrect();
      setFrontError(null);
      setPhase('type_jumps');
    } else {
      sound.playError();
      setFrontError(`Check decimal position. Front number should be ${expected}.`);
    }
  };

  // Step 3: Validate Typed Jumps
  const handleSubmitJumps = (e: React.FormEvent) => {
    e.preventDefault();
    const hops = parseInt(jumpsInput.trim(), 10);

    if (isNaN(hops)) {
      setJumpsError('Please enter a number.');
      sound.playError();
      return;
    }

    if (hops === currentProblem.expectedHops) {
      sound.playCorrect();
      setJumpsError(null);
      setPhase('pick_sign');
    } else {
      sound.playError();
      setJumpsError(`Count the numbered arcs above. You hopped ${currentProblem.expectedHops} times.`);
    }
  };

  // Step 4: Validate Sign Choice
  const handleChooseSign = (sign: '+' | '-') => {
    setSignChoice(sign);
    if (sign === currentProblem.expectedSign) {
      sound.playFanfare();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      setSignError(null);
      setPhase('solved');
      onProblemSolved(currentProblem.expectedHops);
    } else {
      sound.playError();
      if (currentProblem.expectedSign === '+') {
        setSignError(`${currentProblem.originalRaw} is greater than 1. Large numbers always have a POSITIVE (+) exponent!`);
      } else {
        setSignError(`${currentProblem.originalRaw} is a small decimal. Decimals always have a NEGATIVE (-) exponent!`);
      }
    }
  };

  const handleNextProblem = () => {
    sound.playPop();
    setProblemIndex((prev) => prev + 1);
  };

  const handleResetCurrent = () => {
    sound.playPop();
    setCurrentDotIndex(currentProblem.initialDotIndex);
    setPhase('drag_bead');
    setFrontInput('');
    setJumpsInput('');
    setSignChoice('');
    setFrontError(null);
    setJumpsError(null);
    setSignError(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-1">
            <span>GUIDED PRACTICE LAB</span>
            <span>·</span>
            <span>PROBLEM {problemIndex + 1} OF {PROBLEMS.length}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Convert: <span className="font-mono text-amber-300">{currentProblem.originalRaw}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {currentProblem.context}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 block text-[10px] font-bold">SOLVED</span>
            <span className="font-mono font-black text-emerald-400 text-sm">
              {problemsSolvedCount} Problems
            </span>
          </div>

          <button
            onClick={() => {
              sound.playPop();
              onOpenExitTicket();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow"
          >
            <FileCheck className="w-4 h-4" />
            <span>Exit Slip</span>
          </button>
        </div>
      </div>

      {/* CORE INTERACTIVE SIMULATION STAGE */}
      <DecimalSliderStage
        originalRaw={currentProblem.originalRaw}
        digits={currentProblem.digits}
        initialDotIndex={currentProblem.initialDotIndex}
        targetDotIndex={currentProblem.targetDotIndex}
        currentDotIndex={currentDotIndex}
        onDotChange={handleDotChange}
        interactive={phase === 'drag_bead'}
      />

      {/* STEP-BY-STEP PROMPTS (NO READING WALLS - JUST TYPE & ANSWER) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
        
        {/* Step 1 Cue */}
        {phase === 'drag_bead' && (
          <div className="p-5 rounded-2xl bg-cyan-950/40 border-2 border-cyan-500/50 text-center space-y-2 animate-fadeIn">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-300 block">
              Step 1 of 4: Drag the Decimal Bead
            </span>
            <p className="text-sm sm:text-base font-bold text-white">
              Drag the blue bead to the gap marked <span className="text-amber-400">DROP</span> (right after the 1st number).
            </p>
          </div>
        )}

        {/* Step 2: Type Front Number Prompt */}
        {phase !== 'drag_bead' && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Step 2: Type the Front Number
              </span>
              {phase !== 'type_front' && (
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Locked: {frontInput}</span>
                </span>
              )}
            </div>

            {phase === 'type_front' ? (
              <form onSubmit={handleSubmitFront} className="space-y-3">
                <label className="text-sm font-semibold text-white block">
                  Look at where the dot landed. What front number did you make?
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    autoFocus
                    value={frontInput}
                    onChange={(e) => {
                      setFrontInput(e.target.value);
                      setFrontError(null);
                    }}
                    placeholder={`e.g. ${currentProblem.expectedMantissa}`}
                    className="flex-1 bg-slate-900 border-2 border-cyan-500 rounded-xl px-4 py-3 text-white font-mono text-xl font-bold focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Enter ➔
                  </button>
                </div>
                {frontError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{frontError}</span>
                  </p>
                )}
              </form>
            ) : (
              <div className="font-mono text-2xl font-black text-cyan-300">
                {frontInput}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Type Jumps Count Prompt */}
        {(phase === 'type_jumps' || phase === 'pick_sign' || phase === 'solved') && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Step 3: Count Your Jumps
              </span>
              {phase !== 'type_jumps' && (
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Locked: {jumpsInput} jumps</span>
                </span>
              )}
            </div>

            {phase === 'type_jumps' ? (
              <form onSubmit={handleSubmitJumps} className="space-y-3">
                <label className="text-sm font-semibold text-white block">
                  How many jumps did the decimal point move?
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    autoFocus
                    value={jumpsInput}
                    onChange={(e) => {
                      setJumpsInput(e.target.value);
                      setJumpsError(null);
                    }}
                    placeholder={`e.g. ${currentProblem.expectedHops}`}
                    className="flex-1 bg-slate-900 border-2 border-amber-500 rounded-xl px-4 py-3 text-white font-mono text-xl font-bold focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm transition-colors cursor-pointer"
                  >
                    Enter ➔
                  </button>
                </div>
                {jumpsError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{jumpsError}</span>
                  </p>
                )}
              </form>
            ) : (
              <div className="font-mono text-2xl font-black text-amber-300">
                {jumpsInput} jumps
              </div>
            )}
          </div>
        )}

        {/* Step 4: Pick Sign Prompt */}
        {(phase === 'pick_sign' || phase === 'solved') && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Step 4: Exponent Sign
              </span>
              {phase === 'solved' && (
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Locked: {signChoice}</span>
                </span>
              )}
            </div>

            {phase === 'pick_sign' ? (
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white block">
                  Original number is <strong>{currentProblem.originalRaw}</strong>. Is the exponent Positive (+) or Negative (-)?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChooseSign('+')}
                    className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-400 text-left transition-all cursor-pointer"
                  >
                    <span className="font-mono text-lg font-black text-amber-400 block">+ Positive</span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Because {currentProblem.originalRaw} is greater than 1 (Large Number).
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChooseSign('-')}
                    className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-cyan-400 text-left transition-all cursor-pointer"
                  >
                    <span className="font-mono text-lg font-black text-cyan-400 block">- Negative</span>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Because {currentProblem.originalRaw} is under 1 (Decimal).
                    </span>
                  </button>
                </div>

                {signError && (
                  <p className="text-xs text-rose-400 flex items-center gap-1.5 animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{signError}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="font-mono text-2xl font-black text-purple-300">
                {signChoice === '+' ? '+ Positive' : '- Negative'}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Final Result & Mathematical Proof */}
        {phase === 'solved' && (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border-2 border-emerald-400 text-center space-y-4 animate-fadeIn">
            <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Problem Verified & Solved!</span>
            </div>

            {/* Equation constructed directly by student */}
            <div className="text-3xl sm:text-5xl font-black font-mono text-white py-2">
              <span className="text-cyan-300">{frontInput}</span>
              <span className="text-slate-400"> × 10</span>
              <span className="text-amber-300">
                {formatSuperscript(currentProblem.expectedExponent)}
              </span>
            </div>

            {/* Arithmetic check */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs sm:text-sm font-mono text-slate-300 inline-block">
              <span>{frontInput} × 10{formatSuperscript(currentProblem.expectedExponent)} = </span>
              <span className="text-emerald-400 font-bold">{currentProblem.originalRaw}</span>
              <span className="text-slate-500"> (Exact Match ✓)</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleNextProblem}
                className="py-3.5 px-8 bg-white hover:bg-slate-100 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Next Problem ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* Reset problem button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleResetCurrent}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Problem</span>
          </button>
        </div>
      </div>
    </div>
  );
};
