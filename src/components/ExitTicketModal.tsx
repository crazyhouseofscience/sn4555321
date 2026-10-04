import React, { useState } from 'react';
import {
  FileCheck,
  Copy,
  Check,
  Printer,
  X,
  Award,
  ShieldCheck,
  Sparkles,
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ExitTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  setStudentName: (name: string) => void;
  score: number;
  streak: number;
  hopsCountTotal: number;
  mistakesFixedTotal: number;
  quizzesCompletedTotal: number;
}

export const ExitTicketModal: React.FC<ExitTicketModalProps> = ({
  isOpen,
  onClose,
  studentName,
  setStudentName,
  score,
  streak,
  hopsCountTotal,
  mistakesFixedTotal,
  quizzesCompletedTotal
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [period, setPeriod] = useState<string>('Period 1');

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const verificationCode = `SCI-${Math.abs(score * 17 + hopsCountTotal * 31).toString(16).toUpperCase().padStart(6, '0')}`;

  const reportText = `--- SCIENTIFIC NOTATION MASTERY EXIT TICKET ---
Student: ${studentName || 'Anonymous Student'} | ${period}
Date: ${todayStr}
Verification Code: #${verificationCode}

[ACTIVE WORK & REASONING SUMMARY]
• Total XP Score: ${score} XP
• Highest Streak: ${streak}
• Physical Decimal Hops Completed: ${hopsCountTotal} hops
• Flawed Student Errors Diagnosed & Fixed: ${mistakesFixedTotal} cases
• Quizzes Completed: ${quizzesCompletedTotal}

[STUDENT ATTESTATION]
I have physically practiced decimal shifting, boss number rules (1 <= C < 10), and verified positive/negative exponents.
------------------------------------------------`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    sound.playPop();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    sound.playPop();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Student Exit Ticket & Proof of Work</h2>
              <span className="text-xs text-slate-400">Official submission record for Google Classroom / Canvas</span>
            </div>
          </div>

          <button
            onClick={() => { sound.playPop(); onClose(); }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Student Name & Period Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Your Full Name:
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Class Period / Subject:
            </label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. Period 3 Science"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
        </div>

        {/* Verified Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Hops</span>
            <span className="text-xl font-black font-mono text-cyan-300">{hopsCountTotal}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Errors Fixed</span>
            <span className="text-xl font-black font-mono text-amber-300">{mistakesFixedTotal}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">XP Score</span>
            <span className="text-xl font-black font-mono text-emerald-300">{score}</span>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Teacher Hash</span>
            <span className="text-xs font-mono font-bold text-purple-300 truncate block mt-1">#{verificationCode}</span>
          </div>
        </div>

        {/* Formatted Copyable Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300">Formatted Text for Submission:</span>
            <span className="text-slate-500 font-mono">{todayStr}</span>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {reportText}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary for Teacher'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print Exit Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
