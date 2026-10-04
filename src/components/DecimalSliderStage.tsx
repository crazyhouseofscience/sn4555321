import React, { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { sound } from '../utils/audio';
import { formatSuperscript } from '../utils/scinoteHelper';

export interface DecimalSliderStageProps {
  originalRaw: string;
  digits: string[];
  initialDotIndex: number; // 0..digits.length
  targetDotIndex?: number;
  currentDotIndex: number;
  onDotChange: (newDotIndex: number) => void;
  interactive?: boolean;
}

export const DecimalSliderStage: React.FC<DecimalSliderStageProps> = ({
  originalRaw,
  digits,
  initialDotIndex,
  targetDotIndex,
  currentDotIndex,
  onDotChange,
  interactive = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);

  // Calculate hops count and direction
  const hops = Math.abs(currentDotIndex - initialDotIndex);
  const direction: 'left' | 'right' | 'none' =
    currentDotIndex < initialDotIndex
      ? 'left'
      : currentDotIndex > initialDotIndex
      ? 'right'
      : 'none';

  // Derived front number (mantissa) at current dot position
  const getMantissaAtCurrent = (): { mantissa: string; isValid: boolean } => {
    const dCopy = [...digits];
    dCopy.splice(currentDotIndex, 0, '.');
    let str = dCopy.join('').replace(/^0+(?!\.|$)/, '');
    if (str.startsWith('.')) str = '0' + str;
    if (str.endsWith('.')) str = str.slice(0, -1);
    const num = parseFloat(str);
    const isValid = !isNaN(num) && num >= 1 && num < 10;
    return { mantissa: str || '0', isValid };
  };

  const { mantissa, isValid } = getMantissaAtCurrent();

  // Exponent calculation based on direction
  const exponent = direction === 'left' ? hops : direction === 'right' ? -hops : 0;

  // Pointer drag handling across gaps
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    setIsPointerDown(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown || !containerRef.current || !interactive) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const gapCount = digits.length;
    const relativeX = Math.max(0, Math.min(width, x));
    const closestGap = Math.round((relativeX / width) * gapCount);
    if (closestGap !== currentDotIndex) {
      sound.playHop(Math.abs(closestGap - initialDotIndex) + 1);
      onDotChange(closestGap);
    }
  };

  const handlePointerUp = () => {
    setIsPointerDown(false);
  };

  // Jump arcs calculation for SVG
  // Each gap has an approximate X coordinate in percentage
  const gapCount = digits.length;
  const getGapPercent = (gapIdx: number) => {
    // 0 is before 1st digit, gapCount is after last digit
    return (gapIdx / gapCount) * 100;
  };

  // Build list of hop intervals between initialDotIndex and currentDotIndex
  const hopIntervals: Array<{ from: number; to: number; stepNum: number }> = [];
  if (currentDotIndex < initialDotIndex) {
    let step = 1;
    for (let i = initialDotIndex; i > currentDotIndex; i--) {
      hopIntervals.push({ from: i, to: i - 1, stepNum: step++ });
    }
  } else if (currentDotIndex > initialDotIndex) {
    let step = 1;
    for (let i = initialDotIndex; i < currentDotIndex; i++) {
      hopIntervals.push({ from: i, to: i + 1, stepNum: step++ });
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 select-none shadow-xl">
      {/* Top Direction Indicator & Rule Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Original Standard Number
          </span>
          <span className="text-2xl sm:text-3xl font-black font-mono text-white">
            {originalRaw}
          </span>
        </div>

        {/* Live Vector Indicator */}
        <div className="flex items-center gap-3">
          {direction === 'left' && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs sm:text-sm font-bold animate-fadeIn">
              <ArrowLeft className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Moved LEFT ({hops} jumps) ➔ POSITIVE (+{hops})</span>
            </div>
          )}

          {direction === 'right' && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-mono text-xs sm:text-sm font-bold animate-fadeIn">
              <ArrowRight className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Moved RIGHT ({hops} jumps) ➔ NEGATIVE (-{hops})</span>
            </div>
          )}

          {direction === 'none' && (
            <div className="text-xs font-mono text-slate-400 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
              Drag the blue bead to move the decimal
            </div>
          )}
        </div>
      </div>

      {/* INTERACTIVE DIGIT STAGE WITH SVG HOP ARCS */}
      <div className="bg-slate-950 p-6 sm:p-10 rounded-2xl border border-slate-800/80 relative overflow-x-auto">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="min-w-fit mx-auto relative py-6"
        >
          {/* SVG Hop Arcs Overlay */}
          {hopIntervals.length > 0 && (
            <div className="absolute inset-x-0 -top-2 h-14 pointer-events-none flex items-center justify-center">
              <div className="w-full flex justify-between px-6 relative">
                {hopIntervals.map((hop, idx) => (
                  <div
                    key={idx}
                    className="absolute -top-3 text-[10px] font-mono font-black text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded-full border border-amber-500/50 shadow-sm"
                    style={{
                      left: `${(getGapPercent(Math.min(hop.from, hop.to)) + getGapPercent(Math.max(hop.from, hop.to))) / 2}%`,
                      transform: 'translateX(-50%)',
                    }}
                  >
                    #{hop.stepNum}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Digits & Tappable Gaps Row */}
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {/* Gap 0 (Before first digit) */}
            <button
              type="button"
              onClick={() => {
                if (interactive) {
                  sound.playHop(Math.abs(0 - initialDotIndex) + 1);
                  onDotChange(0);
                }
              }}
              className={`w-5 sm:w-7 h-20 sm:h-24 rounded-lg flex items-center justify-center relative transition-all ${
                currentDotIndex === 0
                  ? 'bg-cyan-500/20 ring-2 ring-cyan-400'
                  : 'hover:bg-slate-800/50'
              }`}
            >
              {currentDotIndex === 0 && (
                <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-xl ring-4 ring-cyan-400/30 animate-bounce" />
              )}
            </button>

            {digits.map((digit, dIdx) => {
              const gapIdx = dIdx + 1;
              const isCurrentDot = currentDotIndex === gapIdx;
              const isTarget = targetDotIndex === gapIdx;

              return (
                <React.Fragment key={dIdx}>
                  {/* Digit Box */}
                  <div
                    className={`w-12 h-18 sm:w-16 sm:h-24 rounded-2xl flex items-center justify-center font-mono text-2xl sm:text-4xl font-black border transition-all ${
                      isValid && isCurrentDot
                        ? 'bg-slate-900 text-white border-slate-700'
                        : 'bg-slate-900 text-white border-slate-800'
                    }`}
                  >
                    {digit}
                  </div>

                  {/* Gap after this digit */}
                  <button
                    type="button"
                    onClick={() => {
                      if (interactive) {
                        sound.playHop(Math.abs(gapIdx - initialDotIndex) + 1);
                        onDotChange(gapIdx);
                      }
                    }}
                    className={`w-6 sm:w-8 h-20 sm:h-24 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${
                      isCurrentDot
                        ? 'bg-cyan-950/80 border-2 border-cyan-400 shadow-lg glow-cyan'
                        : isTarget
                        ? 'border-2 border-dashed border-amber-500/70 bg-amber-950/30 hover:bg-amber-900/40'
                        : 'hover:bg-slate-800/80'
                    }`}
                  >
                    {isCurrentDot ? (
                      <div className="flex flex-col items-center">
                        <div className="w-5 h-5 rounded-full bg-cyan-400 shadow-xl ring-4 ring-cyan-300 animate-bounce" />
                        <span className="text-[9px] font-mono text-cyan-300 font-black mt-1">
                          DOT
                        </span>
                      </div>
                    ) : isTarget ? (
                      <span className="text-[10px] font-mono font-bold text-amber-400 animate-pulse">
                        DROP
                      </span>
                    ) : (
                      <span className="text-slate-700 text-sm font-mono">·</span>
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          <div className="text-center text-xs text-slate-500 mt-4">
            👆 Drag the glowing blue bead or tap any gap to jump the decimal.
          </div>
        </div>
      </div>

      {/* LIVE EQUATION & NUMBER LINE COUPLING */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Live Equation Assembly Card */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-400 uppercase">Live Scientific Notation:</span>
            <span
              className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                isValid
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-950 text-rose-300 border border-rose-500/40'
              }`}
            >
              {isValid ? '✓ Valid (1 ≤ a < 10)' : '⚠️ Front number must be 1 to 9.9'}
            </span>
          </div>

          <div className="text-2xl sm:text-3xl font-black font-mono text-white py-1">
            <span className={isValid ? 'text-cyan-300' : 'text-slate-400'}>
              {mantissa}
            </span>
            <span className="text-slate-500"> × 10</span>
            <span
              className={
                exponent > 0
                  ? 'text-amber-300'
                  : exponent < 0
                  ? 'text-cyan-300'
                  : 'text-slate-400'
              }
            >
              {formatSuperscript(exponent)}
            </span>
          </div>
        </div>

        {/* Live Power of 10 Scale Position */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase block">
            Power of Ten Scale:
          </span>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
            <span className="text-cyan-400 font-bold">10⁻⁶ (Decimals)</span>
            <span className="text-slate-500">10⁰ = 1.0</span>
            <span className="text-amber-400 font-bold">10⁺⁶ (Large)</span>
          </div>

          {/* Simple Clean Gauge */}
          <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className={`absolute top-0 bottom-0 transition-all duration-300 rounded-full ${
                exponent > 0
                  ? 'bg-amber-400 right-1/2 left-auto'
                  : exponent < 0
                  ? 'bg-cyan-400 left-1/2 right-auto'
                  : 'bg-white'
              }`}
              style={{
                width: `${Math.min(50, (Math.abs(exponent) / 6) * 50)}%`,
                transform: exponent < 0 ? 'translateX(0)' : 'translateX(0)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
