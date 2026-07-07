import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Calendar, Star, History } from 'lucide-react';
import { GameRecord } from '../types';

interface MatchRecordsViewProps {
  records: GameRecord[];
  onBack: () => void;
}

export default function MatchRecordsView({ records, onBack }: MatchRecordsViewProps) {
  const heatmapData = Array.from({ length: 84 }).map(() => {
    const rand = Math.random();
    if (rand > 0.85) return 4; if (rand > 0.65) return 3;
    if (rand > 0.4) return 2; if (rand > 0.15) return 1; return 0;
  });

  const levelColors = [
    'bg-surface-container-highest',
    'bg-primary/20',
    'bg-primary/40',
    'bg-primary/70',
    'bg-primary',
  ];

  return (
    <div className="relative w-full h-full bg-background flex flex-col overflow-y-auto no-scrollbar" id="records-view-container">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 h-14 bg-white/95 backdrop-blur-xl border-b border-outline/10">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1.5 active-press rounded-xl hover:bg-surface-container transition-colors text-primary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-display font-bold text-on-surface">战绩记录</h1>
        </div>
        <button className="p-2 rounded-xl hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant text-xl">share</span>
        </button>
      </header>

      <main className="p-4 space-y-4">
        {/* ── RANK CARD ── */}
        <section className="relative rounded-2xl p-5 overflow-hidden shadow-elevated text-white"
          style={{ background: 'linear-gradient(135deg, #1A73E8 0%, #0D3B78 100%)' }}>
          {/* Decorative elements */}
          <div className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-8 bottom-4 w-20 h-20 rounded-full bg-white/5" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.15em] mb-1">Current Rank</p>
              <h2 className="text-2xl score-number">大师级 L3</h2>
              <p className="text-xs text-white/70 mt-1.5 font-medium">胜点: 2,450 / 全市排名: #128</p>
            </div>
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="z-10 bg-white/15 backdrop-blur p-3 rounded-2xl text-white"
            >
              <Trophy className="w-10 h-10" />
            </motion.div>
          </div>
        </section>

        {/* ── METRICS ── */}
        <section className="grid grid-cols-2 gap-3">
          {[
            { label: '总场次', value: '156', unit: '场', color: 'text-primary' },
            { label: '胜率', value: '68.5', unit: '%', color: 'text-success' },
          ].map((m, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-card border border-outline/5">
              <p className="text-[11px] font-semibold text-on-surface-muted">{m.label}</p>
              <div className="mt-2 flex items-baseline">
                <span className={`text-2xl score-number font-bold ${m.color}`}>{m.value}</span>
                <span className={`text-xs font-semibold ml-1 ${m.color}`}>{m.unit}</span>
              </div>
            </div>
          ))}
        </section>

        {/* ── HEATMAP ── */}
        <section className="bg-white rounded-2xl p-4 shadow-card border border-outline/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-display font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-lg select-none">calendar_month</span>
              训练热力图
            </h3>
            <span className="text-[10px] text-on-surface-muted font-medium">过去12周活跃度</span>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-rows-7 grid-flow-col gap-1 select-none">
              {heatmapData.map((levelVal, idx) => (
                <div key={idx}
                  className={`w-3 h-3 rounded-[2px] transition-colors duration-300 hover:scale-125 ${levelColors[levelVal]}`}
                  title={`活跃度: 级别 ${levelVal}`} />
              ))}
            </div>
          </div>
          <div className="flex justify-end items-center gap-1 text-[9px] text-on-surface-muted mt-3">
            <span>Less</span>
            {levelColors.map((color, i) => <div key={i} className={`w-2.5 h-2.5 rounded-[1px] ${color}`} />)}
            <span>More</span>
          </div>
        </section>

        {/* ── MATCH HISTORY ── */}
        <section className="space-y-3">
          <h3 className="text-sm font-display font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-primary text-lg select-none">history</span>
            历史对局
          </h3>
          <div className="flex flex-col gap-3">
            {records.map((rec) => (
              <div key={rec.id}
                className="bg-white rounded-2xl overflow-hidden shadow-card border border-outline/5 flex active-press transition-all">
                <div className={`w-1 flex-shrink-0 ${rec.isWin ? 'bg-success' : 'bg-error'}`} />
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-surface-container shadow-sm flex-shrink-0">
                        <img className="w-full h-full object-cover" src={rec.opponentAvatar} alt={rec.opponentName} referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">
                          {rec.opponentName} <span className="text-[11px] text-on-surface-variant font-medium">({rec.opponentLevel})</span>
                        </p>
                        <p className="text-[10px] text-on-surface-muted mt-0.5">{rec.matchTime}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="score-number text-xl font-bold leading-none">
                        <span className={rec.isWin ? 'text-success' : 'text-error'}>{rec.myScore}</span>
                        <span className="text-on-surface-variant mx-1">:</span>
                        <span className="text-on-surface-variant">{rec.opponentScore}</span>
                      </div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-lg text-[9px] font-display font-bold tracking-wider ${
                        rec.isWin ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}>
                        {rec.isWin ? 'VICTORY' : 'DEFEAT'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center pt-2.5 border-t border-outline/10 text-on-surface-muted">
                    <span className="material-symbols-outlined text-[14px] mr-1">location_on</span>
                    <span className="text-[11px] font-medium">{rec.locationName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
