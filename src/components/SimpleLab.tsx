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
  Check
} from 'lucide-react';
import { sound } from '../utils/audio';

interface Problem {
  id: number;
  original: string;
  digits: string[];
  startDot: number; // gap index (0 = before 1st digit, 1 = after 1st digit, etc.)
  targetDot: number; // target gap index
  expectedA: string;
  expectedExp: number;
  isBig: boolean;
  tutorialHint?: string;
}

// 10 Hand-crafted starter problems with varied scales
const STARTER_PROBLEMS: Problem[] = [
  {
    id: 1,
    original: '52,000',
    digits: ['5', '2', '0', '0', '0'],
    startDot: 5,
    targetDot: 1,
    expectedA: '5.2',
    expectedExp: 4,
    isBig: true,
    tutorialHint: 'Intro Problem: Move the dot so only 5 is in front, then count 4 jumps!',
  },
  {
    id: 2,
    original: '0.00074',
    digits: ['0', '0', '0', '0', '7', '4'],
    startDot: 1,
    targetDot: 5,
    expectedA: '7.4',
    expectedExp: -4,
    isBig: false,
    tutorialHint: 'Decimal Problem: Move dot after 7. Decimals get a NEGATIVE (-) exponent!',
  },
  {
    id: 3,
    original: '4,800,000',
    digits: ['4', '8', '0', '0', '0', '0', '0'],
    startDot: 7,
    targetDot: 1,
    expectedA: '4.8',
    expectedExp: 6,
    isBig: true,
  },
  {
    id: 4,
    original: '0.0032',
    digits: ['0', '0', '0', '3', '2'],
    startDot: 1,
    targetDot: 4,
    expectedA: '3.2',
    expectedExp: -3,
    isBig: false,
  },
  {
    id: 5,
    original: '900,000,000',
    digits: ['9', '0', '0', '0', '0', '0', '0', '0', '0'],
    startDot: 9,
    targetDot: 1,
    expectedA: '9',
    expectedExp: 8,
    isBig: true,
  },
  {
    id: 6,
    original: '0.00000025',
    digits: ['0', '0', '0', '0', '0', '0', '0', '2', '5'],
    startDot: 1,
    targetDot: 8,
    expectedA: '2.5',
    expectedExp: -7,
    isBig: false,
  },
  {
    id: 7,
    original: '38,500',
    digits: ['3', '8', '5', '0', '0'],
    startDot: 5,
    targetDot: 1,
    expectedA: '3.85',
    expectedExp: 4,
    isBig: true,
  },
  {
    id: 8,
    original: '0.000062',
    digits: ['0', '0', '0', '0', '0', '6', '2'],
    startDot: 1,
    targetDot: 6,
    expectedA: '6.2',
    expectedExp: -5,
    isBig: false,
  },
  {
    id: 9,
    original: '7,100,000,000',
    digits: ['7', '1', '0', '0', '0', '0', '0', '0', '0', '0'],
    startDot: 10,
    targetDot: 1,
    expectedA: '7.1',
    expectedExp: 9,
    isBig: true,
  },
  {
    id: 10,
    original: '0.000004',
    digits: ['0', '0', '0', '0', '0', '0', '4'],
    startDot: 1,
    targetDot: 6,
    expectedA: '4',
    expectedExp: -6,
    isBig: false,
  }
];

// Procedural Generator for endless 42-minute class practice
function generateProceduralProblem(id: number): Problem {
  const isBig = id % 2 === 1;

  if (isBig) {
    const d1 = Math.floor(Math.random() * 9) + 1;
    const d2 = Math.floor(Math.random() * 9) + 1;
    const hasThird = Math.random() > 0.5;
    const d3 = hasThird ? Math.floor(Math.random() * 9) + 1 : null;
    const sigDigits = d3 !== null ? [d1, d2, d3] : [d1, d2];

    const hops = Math.floor(Math.random() * 5) + 3; // 3 to 7 hops
    const zerosCount = hops - (sigDigits.length - 1);
    const allDigits = [...sigDigits.map(String), ...Array(Math.max(1, zerosCount)).fill('0')];

    const numStr = allDigits.join('');
    const formatted = BigInt(numStr).toLocaleString('en-US');
    const expectedA = d3 !== null ? `${d1}.${d2}${d3}` : `${d1}.${d2}`;

    return {
      id,
      original: formatted,
      digits: allDigits,
      startDot: allDigits.length,
      targetDot: 1,
      expectedA,
      expectedExp: hops,
      isBig: true,
    };
  } else {
    const d1 = Math.floor(Math.random() * 9) + 1;
    const d2 = Math.floor(Math.random() * 9) + 1;
    const leadingZeros = Math.floor(Math.random() * 4) + 2;
    const allDigits = ['0', ...Array(leadingZeros).fill('0'), String(d1), String(d2)];
    const targetDot = 1 + leadingZeros;
    const hops = leadingZeros + 1;
    const rawDecimalStr = `0.${Array(leadingZeros).fill('0').join('')}${d1}${d2}`;

    return {
      id,
      original: rawDecimalStr,
      digits: allDigits,
      startDot: 1,
      targetDot,
      expectedA: `${d1}.${d2}`,
      expectedExp: -hops,
      isBig: false,
    };
  }
}

function getProblem(index: number): Problem {
  if (index < STARTER_PROBLEMS.length) {
    return STARTER_PROBLEMS[index];
  }
  return generateProceduralProblem(index + 1);
}

export const SimpleLab: React.FC = () => {
  const [probIdx, setProbIdx] = useState(0);
  const prob = getProblem(probIdx);

  // Active decimal dot position
  const [currentDot, setCurrentDot] = useState(prob.startDot);

  // Student inputs
  const [inputA, setInputA] = useState('');
  const [selectedSign, setSelectedSign] = useState<'+' | '-' | null>(null);
  const [inputExpMagnitude, setInputExpMagnitude] = useState('');

  // Status & Scores
  const [status, setStatus] = useState<'idle' | 'correct' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [solvedCount, setSolvedCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Animated Curved Hops State
  const [isAnimatingHint, setIsAnimatingHint] = useState(false);
  const [hintHopCount, setHintHopCount] = useState(0);
  const hintTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Basic Instructions Window (Opens automatically on first visit)
  const [showInstructionsModal, setShowInstructionsModal] = useState(true);
  const [showExitTicket, setShowExitTicket] = useState(false);
  const [showSignPopup, setShowSignPopup] = useState(false);

  // Student Info for Exit Ticket
  const [studentName, setStudentName] = useState('');
  const [classPeriod, setClassPeriod] = useState('Period 1');
  const [copiedExit, setCopiedExit] = useState(false);

  // Sound
  const [soundOn, setSoundOn] = useState(true);

  // Reset when problem changes
  useEffect(() => {
    if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    setCurrentDot(prob.startDot);
    setInputA('');
    setSelectedSign(null);
    setInputExpMagnitude('');
    setStatus('idle');
    setMessage('');
    setShowSignPopup(false);
    setIsAnimatingHint(false);
    setHintHopCount(0);
  }, [probIdx, prob]);

  // Jumps made
  const jumpsMade = Math.abs(currentDot - prob.startDot);
  const totalExpectedHops = Math.abs(prob.expectedExp);
  const isIntroProblem = probIdx === 0;

  // Trigger Animated Curved Hops Demo
  const triggerAnimatedHint = () => {
    if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    setIsAnimatingHint(true);
    setHintHopCount(0);
    setStatus('idle');
    setMessage(`Watch the hops! Starting from the decimal, jumping one digit at a time...`);

    let current = 0;
    hintTimerRef.current = setInterval(() => {
      current++;
      setHintHopCount(current);
      if (soundOn) sound.playHop(current);

      if (current >= totalExpectedHops) {
        if (hintTimerRef.current) clearInterval(hintTimerRef.current);
        if (soundOn) sound.playPop();
        setMessage(`✨ Done! ${totalExpectedHops} jumps counted. Now click the TARGET circle to place the dot!`);
      }
    }, 500);
  };

  // Move dot
  const handleDotClick = (gapIdx: number) => {
    if (soundOn) sound.playHop(Math.abs(gapIdx - prob.startDot) + 1);
    setCurrentDot(gapIdx);
    setStatus('idle');
    setMessage('');

    if (gapIdx === prob.targetDot) {
      if (soundOn) sound.playPop();
    }
  };

  const handleExpMagnitudeChange = (val: string) => {
    setStatus('idle');
    if (val.startsWith('-')) {
      setSelectedSign('-');
      setInputExpMagnitude(val.slice(1).replace(/[^0-9]/g, ''));
    } else if (val.startsWith('+')) {
      setSelectedSign('+');
      setInputExpMagnitude(val.slice(1).replace(/[^0-9]/g, ''));
    } else {
      setInputExpMagnitude(val.replace(/[^0-9]/g, ''));
    }
  };

  // Check student answer
  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAttempts((prev) => prev + 1);

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

    // 1. Check Front Number
    if (isNaN(numA) || Math.abs(numA - expectedNumA) > 0.001) {
      setStatus('error');
      setStreak(0);
      if (numA < 1 || numA >= 10) {
        setMessage(`The front number must have only 1 digit before the dot (between 1 and 9.9). Put the dot after the first digit (${prob.expectedA}).`);
      } else {
        setMessage(`Check your front number. Look where the dot landed: it should be ${prob.expectedA}.`);
      }
      if (soundOn) sound.playError();
      return;
    }

    // 2. Check Sign -> trigger popup if wrong
    const expectedSign = prob.expectedExp < 0 ? '-' : '+';
    if (selectedSign !== expectedSign) {
      setStatus('error');
      setStreak(0);
      setMessage(
        prob.isBig
          ? `${prob.original} is BIGGER than 1. Big numbers get a POSITIVE (+) exponent!`
          : `${prob.original} is a DECIMAL under 1. Decimals get a NEGATIVE (-) exponent!`
      );
      if (soundOn) sound.playError();
      setShowSignPopup(true);
      return;
    }

    // 3. Check Jumps Magnitude
    if (mag !== totalExpectedHops) {
      setStatus('error');
      setStreak(0);
      setMessage(`Check your jumps. You hopped ${totalExpectedHops} times.`);
      if (soundOn) sound.playError();
      return;
    }

    // Correct!
    setStatus('correct');
    setMessage(`Correct! ${prob.original} = ${prob.expectedA} × 10^${prob.expectedExp}`);
    setSolvedCount((c) => c + 1);
    setStreak((s) => s + 1);
    if (soundOn) sound.playFanfare();
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
  };

  const handleApplyCorrectSignFromPopup = () => {
    const correctSign = prob.expectedExp < 0 ? '-' : '+';
    setSelectedSign(correctSign);
    setInputExpMagnitude(totalExpectedHops.toString());
    setShowSignPopup(false);
    setStatus('idle');
    setMessage('');
    if (soundOn) sound.playPop();
  };

  const handleNext = () => {
    if (soundOn) sound.playPop();
    setProbIdx((i) => i + 1);
  };

  const handleReset = () => {
    if (soundOn) sound.playPop();
    if (hintTimerRef.current) clearInterval(hintTimerRef.current);
    setCurrentDot(prob.startDot);
    setInputA('');
    setSelectedSign(null);
    setInputExpMagnitude('');
    setStatus('idle');
    setMessage('');
    setShowSignPopup(false);
    setIsAnimatingHint(false);
    setHintHopCount(0);
  };

  const handleCopyExitTicket = () => {
    const text = `--- SCIENTIFIC NOTATION EXIT TICKET ---
Student: ${studentName || 'Anonymous Student'} | ${classPeriod}
Problems Solved: ${solvedCount}
Streak: ${streak}
Accuracy: ${attempts > 0 ? Math.round((solvedCount / attempts) * 100) : 100}%
Verification Hash: #SCI-${Math.abs(solvedCount * 19 + streak * 31).toString(16).toUpperCase()}`;

    navigator.clipboard.writeText(text);
    setCopiedExit(true);
    if (soundOn) sound.playPop();
    setTimeout(() => setCopiedExit(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-3 sm:p-6 font-sans">
      {/* Top Header */}
      <header className="w-full max-w-4xl flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Scientific Notation Lab</span>
            {streak >= 3 && (
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{streak} Streak!</span>
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Clear, step-by-step practice.
          </p>
        </div>

        {/* Action Buttons: Instructions, Exit Slip, Sound */}
        <div className="flex items-center gap-2">
          {/* Instructions Button */}
          <button
            onClick={() => {
              if (soundOn) sound.playPop();
              setShowInstructionsModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs sm:text-sm font-black transition-colors cursor-pointer shadow"
            title="Read instructions"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Instructions</span>
          </button>

          {/* Exit Slip Button */}
          <button
            onClick={() => {
              if (soundOn) sound.playPop();
              setShowExitTicket(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black transition-colors cursor-pointer shadow"
            title="Class Exit Ticket"
          >
            <FileCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Exit Slip</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              setSoundOn(!soundOn);
              sound.enabled = !soundOn;
            }}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title={soundOn ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex-1 flex flex-col justify-center py-4 sm:py-6 space-y-5">
        
        {/* Card 1: Problem & Manipulative */}
        <div className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
          {/* Problem Banner & Hint Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider">
                Problem #{probIdx + 1}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                &middot; Solved: <strong className="text-emerald-400 text-sm">{solvedCount}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* ANIMATED HINT BUTTON */}
              <button
                type="button"
                onClick={triggerAnimatedHint}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer shadow ${
                  isAnimatingHint
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
                }`}
                title="Watch the hops animate from decimal to decimal"
              >
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>{isAnimatingHint ? 'Replay Hops ↺' : 'Show Hop Arrows 💡'}</span>
              </button>
            </div>
          </div>

          {/* INTRODUCTORY / TUTORIAL GUIDE BANNER FOR PROBLEM 1 */}
          {isIntroProblem && (
            <div className="p-4 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 text-cyan-100 flex items-start gap-3 shadow-lg">
              <span className="text-2xl">👉</span>
              <div className="text-xs sm:text-sm leading-relaxed">
                <strong className="text-cyan-300 uppercase tracking-wide block mb-0.5">
                  Tutorial Step 1:
                </strong>
                Click the glowing <strong>TARGET</strong> circle right after the <strong>5</strong>. That moves the decimal point so only 1 digit is in front!
              </div>
            </div>
          )}

          {/* GIANT HIGH-CONTRAST ORIGINAL NUMBER */}
          <div className="text-center space-y-1 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <span className="text-xs sm:text-sm text-slate-400 font-bold uppercase tracking-wider">
              Original Number:
            </span>
            <div className="text-4xl sm:text-6xl font-black font-mono text-amber-300 tracking-wider">
              {prob.original}
            </div>
          </div>

          {/* THE MANIPULATIVE: GIANT DIGITS + CLICKABLE DECIMAL CIRCLES + DIRECT ARROW HOPS */}
          <div className="bg-slate-950 p-4 sm:p-7 rounded-2xl border-2 border-slate-800 space-y-3">
            <div className="text-xs sm:text-sm font-bold text-slate-300 text-center uppercase tracking-wider flex items-center justify-center gap-2">
              <span>Click a circle to move the decimal dot:</span>
              {isAnimatingHint && (
                <span className="text-amber-300 font-mono text-xs bg-amber-950 px-2.5 py-0.5 rounded-full border border-amber-500">
                  Hop {hintHopCount} of {totalExpectedHops}
                </span>
              )}
            </div>

            {/* Giant Digits and Gap Alignment Row */}
            <div className="overflow-x-auto py-2">
              <div className="min-w-fit flex items-end justify-center gap-1 sm:gap-2 mx-auto select-none pt-12">
                {/* Gap 0 (Before first digit) */}
                <div className="flex flex-col items-center">
                  <div className="h-12 sm:h-14" />
                  <button
                    type="button"
                    onClick={() => handleDotClick(0)}
                    className={`w-9 sm:w-11 h-20 sm:h-28 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                      currentDot === 0
                        ? 'bg-cyan-950 border-2 border-cyan-400 shadow-xl ring-4 ring-cyan-500/30'
                        : 'hover:bg-slate-800/80 border border-transparent'
                    }`}
                  >
                    {currentDot === 0 && (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cyan-400 shadow-xl ring-4 ring-cyan-200 animate-pulse" />
                    )}
                  </button>
                </div>

                {prob.digits.map((digit, idx) => {
                  const gapIdx = idx + 1;
                  const isDot = currentDot === gapIdx;
                  const isTarget = prob.targetDot === gapIdx;

                  // Hop calculation for arrow:
                  // For big numbers: hops go right to left over digits between targetDot and startDot
                  // For decimals: hops go left to right over digits between startDot and targetDot
                  let isHopDigit = false;
                  let hopNumber = 0;
                  if (prob.isBig) {
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
                      {/* Digit Column with Direct Gap-to-Gap Arc Header */}
                      <div className="flex flex-col items-center relative">
                        {/* CURVED ARROW EXTENDING DIRECTLY FROM ONE DECIMAL TO THE NEXT */}
                        <div className="h-12 sm:h-14 w-[calc(100%+2.25rem)] sm:w-[calc(100%+2.75rem)] -mx-4.5 sm:-mx-5.5 flex flex-col items-center justify-end pb-0.5 pointer-events-none z-10">
                          {isHopVisible ? (
                            <div className="w-full flex flex-col items-center animate-bounce">
                              <span className="text-[11px] font-mono font-black text-amber-300 bg-amber-950 border border-amber-500 px-2 py-0.5 rounded-full shadow-lg">
                                Hop #{hopNumber}
                              </span>

                              {/* SVG Curved Arc: Starts at center of one gap and ends at center of the other gap */}
                              <svg
                                className="w-full h-8 sm:h-9 text-amber-400 drop-shadow-md"
                                viewBox="0 0 100 36"
                                fill="none"
                                preserveAspectRatio="none"
                              >
                                {prob.isBig ? (
                                  <>
                                    {/* Jumps from right decimal (95) to left decimal (5) */}
                                    <path
                                      d="M 95 34 Q 50 2 6 34"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                    />
                                    {/* Arrow pointing into the left decimal */}
                                    <polygon points="5,34 16,24 13,35" fill="currentColor" />
                                  </>
                                ) : (
                                  <>
                                    {/* Jumps from left decimal (5) to right decimal (95) */}
                                    <path
                                      d="M 5 34 Q 50 2 94 34"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                    />
                                    {/* Arrow pointing into the right decimal */}
                                    <polygon points="95,34 87,35 84,24" fill="currentColor" />
                                  </>
                                )}
                              </svg>
                            </div>
                          ) : (
                            <div className="h-6" />
                          )}
                        </div>

                        {/* GIANT DIGIT BLOCK (HIGH VISIBILITY) */}
                        <div className="w-16 h-20 sm:w-22 sm:h-28 rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-5xl sm:text-7xl font-mono font-black text-white shadow-xl">
                          {digit}
                        </div>
                      </div>

                      {/* Dot Gap Button */}
                      <div className="flex flex-col items-center">
                        <div className="h-12 sm:h-14 flex items-end pb-1">
                          {isTarget && isAnimatingHint && hintHopCount >= totalExpectedHops && (
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-950 border border-emerald-500 px-1.5 py-0.5 rounded animate-pulse">
                              LAND!
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDotClick(gapIdx)}
                          className={`w-9 sm:w-11 h-20 sm:h-28 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group ${
                            isDot
                              ? 'bg-cyan-950 border-3 border-cyan-400 shadow-2xl ring-4 ring-cyan-500/30'
                              : isTarget
                              ? 'border-3 border-dashed border-amber-400 bg-amber-950/40 hover:bg-amber-900/50 ring-4 ring-amber-400/30'
                              : 'hover:bg-slate-800/80 border border-transparent'
                          }`}
                          title="Click to place dot here"
                        >
                          {isDot ? (
                            <div className="flex flex-col items-center">
                              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cyan-400 shadow-xl ring-4 ring-cyan-200 animate-pulse" />
                              <span className="text-[10px] sm:text-xs font-mono text-cyan-300 font-bold mt-1.5">
                                DOT
                              </span>
                            </div>
                          ) : isTarget ? (
                            <div className="flex flex-col items-center">
                              <span className="text-[9px] sm:text-[11px] font-black text-amber-400 animate-bounce">
                                TARGET
                              </span>
                              <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-400 mt-1 shadow" />
                            </div>
                          ) : (
                            <span className="w-3 h-3 rounded-full bg-slate-700 group-hover:bg-slate-400" />
                          )}
                        </button>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Live Jump Counter & HIGH-CONTRAST SIGN HELPER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-sm font-mono border-t border-slate-900">
              <div className="text-slate-300 flex items-center gap-2">
                <span>Jumps Counted:</span>
                <strong className="text-amber-300 text-lg bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                  {jumpsMade}
                </strong>
                {currentDot === prob.targetDot && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>Target Reached!</span>
                  </span>
                )}
              </div>

              {/* Instant High-Contrast Sign Indicator */}
              <div className="flex items-center gap-2">
                {prob.isBig ? (
                  <div className="bg-amber-950 text-amber-300 border-2 border-amber-500 px-4 py-1.5 rounded-xl font-bold flex items-center gap-2 shadow text-xs sm:text-sm">
                    <span className="text-base font-black text-amber-400">+</span>
                    <span>BIG NUMBER (&gt; 1) ➔ POSITIVE (+) POWER</span>
                  </div>
                ) : (
                  <div className="bg-cyan-950 text-cyan-300 border-2 border-cyan-400 px-4 py-1.5 rounded-xl font-bold flex items-center gap-2 shadow text-xs sm:text-sm">
                    <span className="text-base font-black text-cyan-400">-</span>
                    <span>DECIMAL (&lt; 1) ➔ NEGATIVE (-) POWER</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Fill in the Equation (HUGE FONT & EASY TOUCH TARGETS) */}
          <form onSubmit={handleCheck} className="space-y-5 pt-2">
            <label className="text-base sm:text-lg font-bold text-white block text-center">
              Type your Scientific Notation answer:
            </label>

            {/* Giant Equation Input Template */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-3xl sm:text-5xl font-mono font-black text-white">
              {/* Front number input */}
              <div className="flex flex-col items-center">
                <input
                  type="text"
                  value={inputA}
                  onChange={(e) => {
                    setInputA(e.target.value);
                    setStatus('idle');
                  }}
                  placeholder=""
                  className="w-36 sm:w-44 text-center bg-slate-950 border-3 border-cyan-500 focus:border-cyan-400 rounded-2xl py-3 px-2 font-mono text-3xl sm:text-4xl text-cyan-300 font-black focus:outline-none shadow-inner"
                />
                <span className="text-xs font-sans font-bold text-slate-400 mt-1.5">
                  1. Front Number
                </span>
              </div>

              <span className="text-slate-400 -mt-6">× 10</span>

              {/* Exponent Section with Giant Sign Buttons */}
              <div className="flex flex-col items-center -mt-7">
                <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border-3 border-amber-500">
                  {/* Plus Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSign('+');
                      setStatus('idle');
                      if (soundOn) sound.playPop();
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-2xl sm:text-3xl font-black transition-all cursor-pointer flex items-center justify-center ${
                      selectedSign === '+'
                        ? 'bg-amber-400 text-slate-950 shadow-lg scale-105'
                        : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                    }`}
                    title="Positive Exponent"
                  >
                    +
                  </button>

                  {/* Minus Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSign('-');
                      setStatus('idle');
                      if (soundOn) sound.playPop();
                    }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-2xl sm:text-3xl font-black transition-all cursor-pointer flex items-center justify-center ${
                      selectedSign === '-'
                        ? 'bg-cyan-400 text-slate-950 shadow-lg scale-105'
                        : 'bg-slate-900 text-cyan-400 hover:bg-slate-800'
                    }`}
                    title="Negative Exponent"
                  >
                    -
                  </button>

                  {/* Exponent Magnitude Input */}
                  <input
                    type="text"
                    value={inputExpMagnitude}
                    onChange={(e) => handleExpMagnitudeChange(e.target.value)}
                    placeholder=""
                    className="w-16 sm:w-22 text-center bg-transparent py-1 px-1 font-mono text-3xl sm:text-4xl text-white font-black focus:outline-none"
                  />
                </div>

                <span className="text-xs font-sans font-bold text-slate-400 mt-1.5">
                  2. Sign &amp; Jumps
                </span>
              </div>
            </div>

            {/* Feedback Message */}
            {message && (
              <div
                className={`p-4 rounded-2xl text-center text-sm sm:text-base font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-3 ${
                  status === 'correct'
                    ? 'bg-emerald-950/80 text-emerald-300 border-2 border-emerald-500'
                    : 'bg-rose-950/80 text-rose-300 border-2 border-rose-500 animate-shake'
                }`}
              >
                <span>{message}</span>

                {status === 'error' && !isAnimatingHint && (
                  <button
                    type="button"
                    onClick={triggerAnimatedHint}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>Watch Hop Arrows</span>
                  </button>
                )}
              </div>
            )}

            {/* Giant Action Buttons */}
            <div className="flex items-center justify-center gap-3 pt-2">
              {status !== 'correct' ? (
                <button
                  type="submit"
                  className="w-full sm:w-auto px-10 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider rounded-2xl transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>Check Answer</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto px-10 py-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-base sm:text-lg uppercase tracking-wider rounded-2xl transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2 animate-bounce"
                >
                  <span>Next Problem</span>
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              <button
                type="button"
                onClick={handleReset}
                className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                title="Reset dot position"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* POPUP MODAL: VERY BASIC INSTRUCTIONS (OPENS ON LOAD & ACCESSIBLE BY BUTTON) */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-cyan-400 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowInstructionsModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  How It Works
                </h2>
                <p className="text-xs text-slate-400">Scientific Notation in 3 easy steps</p>
              </div>
            </div>

            {/* 3 Ultra-Basic Steps */}
            <div className="space-y-3.5 text-slate-200">
              {/* Step 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-cyan-300 text-sm block">Move the Dot:</strong>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Click the circle so <strong>only ONE digit</strong> (1 to 9) is in front of the dot.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-amber-300 text-sm block">Count the Jumps:</strong>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Count how many digits the dot hopped over.
                  </p>
                  <div className="mt-1 text-[11px] font-bold space-y-0.5">
                    <div className="text-amber-400">• Big Number (like 52,000) ➔ POSITIVE (+)</div>
                    <div className="text-cyan-400">• Decimal (like 0.007) ➔ NEGATIVE (-)</div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-emerald-300 text-sm block">Type Your Answer:</strong>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Type your front number and power into the boxes, then click <strong>Check Answer</strong>!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowInstructionsModal(false)}
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base rounded-2xl transition-all shadow-lg cursor-pointer"
            >
              Start Practicing ➔
            </button>
          </div>
        </div>
      )}

      {/* POPUP MODAL: CLASSROOM EXIT TICKET */}
      {showExitTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-emerald-500/80 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowExitTicket(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Class Period Exit Slip
                </h2>
                <p className="text-xs text-slate-400">Proof of work for your teacher</p>
              </div>
            </div>

            {/* Student Name & Period Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">
                  Your Full Name:
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">
                  Class Period:
                </label>
                <select
                  value={classPeriod}
                  onChange={(e) => setClassPeriod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-emerald-400"
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

            {/* Scorecard */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Solved</span>
                  <span className="text-xl font-black font-mono text-emerald-400">{solvedCount}</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Streak</span>
                  <span className="text-xl font-black font-mono text-amber-400">{streak} 🔥</span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Accuracy</span>
                  <span className="text-xl font-black font-mono text-cyan-400">
                    {attempts > 0 ? Math.round((solvedCount / attempts) * 100) : 100}%
                  </span>
                </div>
              </div>

              <div className="text-center pt-1 text-[11px] font-mono text-slate-500">
                Verification Hash: #SCI-{Math.abs(solvedCount * 19 + streak * 31).toString(16).toUpperCase()}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyExitTicket}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-2"
              >
                {copiedExit ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedExit ? 'Copied to Clipboard!' : 'Copy Summary for Teacher'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR SIGN MISTAKES */}
      {showSignPopup && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowSignPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Check Your Exponent Sign</h3>
                <span className="text-xs text-amber-300 font-semibold">Positive (+) vs. Negative (-) Rule</span>
              </div>
            </div>

            {/* Visual Comparison */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="text-center">
                <span className="text-xs text-slate-400 block font-semibold">Original Number:</span>
                <span className="text-2xl font-black font-mono text-white">{prob.original}</span>
              </div>

              {prob.isBig ? (
                <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/50 text-xs sm:text-sm text-amber-200 leading-relaxed font-semibold">
                  📌 <strong>{prob.original} is BIGGER than 1</strong>.
                  <br />
                  Large numbers ALWAYS have a <strong>POSITIVE (+)</strong> power of 10!
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-xs sm:text-sm text-cyan-200 leading-relaxed font-semibold">
                  📌 <strong>{prob.original} is a DECIMAL under 1</strong>.
                  <br />
                  Decimals ALWAYS have a <strong>NEGATIVE (-)</strong> power of 10!
                </div>
              )}
            </div>

            {/* Quick Fix Button */}
            <div className="pt-1 flex gap-3">
              <button
                type="button"
                onClick={handleApplyCorrectSignFromPopup}
                className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl transition-all shadow cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Change Sign to {prob.expectedExp < 0 ? 'NEGATIVE (-)' : 'POSITIVE (+)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
