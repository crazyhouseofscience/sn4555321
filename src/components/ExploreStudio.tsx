import React, { useState } from 'react';
import { Sparkles, RotateCcw } from 'lucide-react';
import { sound } from '../utils/audio';
import { DecimalSliderStage } from './DecimalSliderStage';

const PRESETS = [
  { label: '3,000,000 (Speed of Sound in Solids)', raw: '3000000', digits: ['3', '0', '0', '0', '0', '0', '0'], initDot: 7 },
  { label: '0.00045 (Amoeba Size in Meters)', raw: '0.00045', digits: ['0', '0', '0', '0', '4', '5'], initDot: 1 },
  { label: '150,000,000 (Earth to Sun Distance in km)', raw: '150000000', digits: ['1', '5', '0', '0', '0', '0', '0', '0', '0'], initDot: 9 },
  { label: '0.00000012 (HIV Virus Width in Meters)', raw: '0.00000012', digits: ['0', '0', '0', '0', '0', '0', '0', '1', '2'], initDot: 1 },
];

export const ExploreStudio: React.FC = () => {
  const [customInput, setCustomInput] = useState('450,000');
  const [digits, setDigits] = useState<string[]>(['4', '5', '0', '0', '0', '0']);
  const [initialDotIndex, setInitialDotIndex] = useState(6);
  const [currentDotIndex, setCurrentDotIndex] = useState(6);

  const applyCustomNumber = (rawStr: string) => {
    const clean = rawStr.replace(/,/g, '').trim();
    if (!clean) return;

    if (clean.includes('.')) {
      const parts = clean.split('.');
      const whole = parts[0] || '0';
      const dec = parts[1] || '0';
      const allDigits = (whole + dec).split('');
      const dotPos = whole.length;
      setDigits(allDigits);
      setInitialDotIndex(dotPos);
      setCurrentDotIndex(dotPos);
    } else {
      const allDigits = clean.split('');
      setDigits(allDigits);
      setInitialDotIndex(allDigits.length);
      setCurrentDotIndex(allDigits.length);
    }
  };

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    sound.playPop();
    setCustomInput(preset.raw);
    setDigits(preset.digits);
    setInitialDotIndex(preset.initDot);
    setCurrentDotIndex(preset.initDot);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    applyCustomNumber(val);
  };

  const handleReset = () => {
    sound.playPop();
    setCurrentDotIndex(initialDotIndex);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none animate-fadeIn">
      {/* Top Controller Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Interactive Decimal Sandbox
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Type any number or pick a real-world scale preset, then drag the bead to see the notation update live.
            </p>
          </div>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors self-start sm:self-auto"
            title="Reset to original dot"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Input Box & Presets */}
        <div className="space-y-2 pt-1">
          <input
            type="text"
            value={customInput}
            onChange={handleInputChange}
            placeholder="Type any number (e.g. 520000 or 0.00045)"
            className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-500 rounded-2xl px-5 py-3 font-mono text-xl sm:text-2xl text-white font-bold focus:outline-none transition-colors"
          />

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase">Presets:</span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => handleSelectPreset(p)}
                className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 hover:border-slate-700 transition-colors"
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CORE SIMULATION STAGE */}
      <DecimalSliderStage
        originalRaw={customInput}
        digits={digits}
        initialDotIndex={initialDotIndex}
        currentDotIndex={currentDotIndex}
        onDotChange={(newIdx) => setCurrentDotIndex(newIdx)}
        interactive={true}
      />
    </div>
  );
};
