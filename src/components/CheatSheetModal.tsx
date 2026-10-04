import React from 'react';
import { X, Printer, Sparkles, BookOpen, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface CheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatSheetModal: React.FC<CheatSheetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    sound.playPop();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Scientific Notation Cheat Sheet</h2>
              <span className="text-xs text-slate-400">Your quick classroom reference guide</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Guide</span>
            </button>
            <button
              onClick={() => {
                sound.playPop();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section 1: The Blueprint Formula */}
        <div className="bg-slate-950 p-5 rounded-xl border border-cyan-900/40 text-center space-y-2">
          <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold block">
            The Golden Formula
          </span>
          <div className="text-3xl font-black font-mono text-white">
            <span className="text-cyan-300">C</span>
            <span className="text-amber-300"> × 10</span>
            <span className="text-purple-300">ᴱ</span>
          </div>
          <p className="text-xs text-slate-400">
            <strong>C</strong> is the Boss Number (must be between 1.0 and 9.999). <strong>E</strong> is the count of decimal hops!
          </p>
        </div>

        {/* Section 2: The Two Golden Direction Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <span>🐘 HUGE Numbers (&gt; 10)</span>
            </div>
            <p className="text-xs text-slate-300">
              • Decimal hops <strong>LEFT</strong> towards the first digit.<br />
              • Exponent is <strong>POSITIVE (+)</strong>.<br />
              • Example: 45,000,000 → <strong>4.5 × 10⁷</strong>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <span>🔬 TINY Decimals (&lt; 1)</span>
            </div>
            <p className="text-xs text-slate-300">
              • Decimal hops <strong>RIGHT</strong> past the zeros.<br />
              • Exponent is <strong>NEGATIVE (-)</strong>.<br />
              • Example: 0.000078 → <strong>7.8 × 10⁻⁵</strong>
            </p>
          </div>
        </div>

        {/* Section 3: Memory Trick */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Easy Memory Trick: L.A.R.S.
            </span>
            <p className="text-xs text-slate-300">
              <strong className="text-amber-300">L</strong>eft = <strong className="text-amber-300">A</strong>dd to exponent (positive hops) &nbsp;|&nbsp; <strong className="text-cyan-300">R</strong>ight = <strong className="text-cyan-300">S</strong>ubtract from exponent (negative hops).
            </p>
          </div>
        </div>

        {/* Section 4: Powers of 10 Quick Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Common Powers of 10 Reference
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-purple-300 font-bold block">10⁹</span>
              <span className="text-slate-400">1 Billion (Giga)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-purple-300 font-bold block">10⁶</span>
              <span className="text-slate-400">1 Million (Mega)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-purple-300 font-bold block">10³</span>
              <span className="text-slate-400">1 Thousand (Kilo)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-purple-300 font-bold block">10⁰</span>
              <span className="text-slate-400">1 (Standard unit)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-300 font-bold block">10⁻²</span>
              <span className="text-slate-400">0.01 (Centi)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-300 font-bold block">10⁻³</span>
              <span className="text-slate-400">0.001 (Milli)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-300 font-bold block">10⁻⁶</span>
              <span className="text-slate-400">0.000001 (Micro)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-cyan-300 font-bold block">10⁻⁹</span>
              <span className="text-slate-400">0.000000001 (Nano)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Got it, back to the app!
          </button>
        </div>
      </div>
    </div>
  );
};
