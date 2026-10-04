import React, { useState } from 'react';
import { ArrowLeftRight, Check, Copy } from 'lucide-react';
import { sound } from '../utils/audio';
import { formatSuperscript } from '../utils/scinoteHelper';

export const ConverterStudio: React.FC = () => {
  const [mode, setMode] = useState<'to_sci' | 'to_std'>('to_sci');

  // Mode 1: Standard to Scientific
  const [stdInput, setStdInput] = useState('4,500,000');
  const [sciResult, setSciResult] = useState<{ mantissa: string; exponent: number } | null>({
    mantissa: '4.5',
    exponent: 6
  });

  // Mode 2: Scientific to Standard
  const [mantissaInput, setMantissaInput] = useState('3.2');
  const [exponentInput, setExponentInput] = useState('-4');
  const [stdResult, setStdResult] = useState('0.00032');

  const [copied, setCopied] = useState(false);

  // Convert Standard -> Scientific
  const handleConvertStd = (val: string) => {
    setStdInput(val);
    const clean = val.replace(/,/g, '').trim();
    const num = parseFloat(clean);

    if (isNaN(num) || num === 0) {
      setSciResult(null);
      return;
    }

    const exp = Math.floor(Math.log10(Math.abs(num)));
    const m = (num / Math.pow(10, exp)).toFixed(4).replace(/\.?0+$/, '');
    setSciResult({ mantissa: m, exponent: exp });
  };

  // Convert Scientific -> Standard
  const handleConvertSci = (mVal: string, expVal: string) => {
    setMantissaInput(mVal);
    setExponentInput(expVal);

    const m = parseFloat(mVal);
    const e = parseInt(expVal, 10);

    if (isNaN(m) || isNaN(e)) {
      setStdResult('Invalid Input');
      return;
    }

    if (e >= 0 && e <= 12) {
      const res = (m * Math.pow(10, e)).toLocaleString('en-US');
      setStdResult(res);
    } else if (e < 0 && e >= -10) {
      const absE = Math.abs(e);
      const str = (m / Math.pow(10, absE)).toFixed(absE + 4).replace(/0+$/, '');
      setStdResult(str);
    } else {
      setStdResult((m * Math.pow(10, e)).toString());
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    sound.playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto select-none animate-fadeIn">
      {/* Mode Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Two-Way Converter & Calculator
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Switch between packing into scientific notation and unpacking into standard form.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => {
                sound.playPop();
                setMode('to_sci');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'to_sci'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard ➔ Scientific
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setMode('to_std');
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'to_std'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Scientific ➔ Standard
            </button>
          </div>
        </div>

        {/* MODE 1: STANDARD -> SCIENTIFIC */}
        {mode === 'to_sci' && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">
                Enter Standard Number:
              </label>
              <input
                type="text"
                value={stdInput}
                onChange={(e) => handleConvertStd(e.target.value)}
                placeholder="e.g. 4500000 or 0.00032"
                className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-500 rounded-2xl px-5 py-3.5 font-mono text-xl text-white font-bold focus:outline-none"
              />
            </div>

            {/* Output Box */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Scientific Notation Result:
                </span>
                {sciResult ? (
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white">
                    <span className="text-cyan-300">{sciResult.mantissa}</span>
                    <span className="text-slate-400"> × 10</span>
                    <span className="text-amber-300">{formatSuperscript(sciResult.exponent)}</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-500 font-mono">Enter a non-zero number</span>
                )}
              </div>

              {sciResult && (
                <button
                  onClick={() => handleCopy(`${sciResult.mantissa} × 10^${sciResult.exponent}`)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Result'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: SCIENTIFIC -> STANDARD */}
        {mode === 'to_std' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  Front Number (1 ≤ a &lt; 10):
                </label>
                <input
                  type="text"
                  value={mantissaInput}
                  onChange={(e) => handleConvertSci(e.target.value, exponentInput)}
                  placeholder="e.g. 3.2"
                  className="w-full bg-slate-950 border-2 border-slate-800 focus:border-cyan-500 rounded-2xl px-5 py-3 font-mono text-xl text-white font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">
                  Exponent Power of 10:
                </label>
                <input
                  type="number"
                  value={exponentInput}
                  onChange={(e) => handleConvertSci(mantissaInput, e.target.value)}
                  placeholder="e.g. -4 or 6"
                  className="w-full bg-slate-950 border-2 border-slate-800 focus:border-amber-500 rounded-2xl px-5 py-3 font-mono text-xl text-white font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Output Box */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Standard Decimal Form:
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-amber-300">
                  {stdResult}
                </div>
              </div>

              <button
                onClick={() => handleCopy(stdResult)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy Number'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
