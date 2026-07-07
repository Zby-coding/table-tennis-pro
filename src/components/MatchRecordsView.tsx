import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trophy, Calendar, Award, Star, History, CircleAlert } from 'lucide-react';
import { GameRecord } from '../types';

interface MatchRecordsViewProps {
  records: GameRecord[];
  onBack: () => void;
}

export default function MatchRecordsView({ records, onBack }: MatchRecordsViewProps) {
  // Heatmap generation: 12 weeks * 7 days = 84 cells
  const heatmapData = Array.from({ length: 84 }).map(() => {
    const rand = Math.random();
    // Weighted distribution for activity intensity level (0 to 4)
    if (rand > 0.85) return 4;
    if (rand > 0.65) return 3;
    if (rand > 0.4) return 2;
    if (rand > 0.15) return 1;
    return 0;
  });

  const levelColors = [
    'bg-surface-container-highest', // 0: No activity
    'bg-secondary-fixed/40',         // 1: Low activity
    'bg-secondary-fixed-dim/75',    // 2: Medium activity
    'bg-secondary/70',              // 3: High activity
    'bg-on-secondary-fixed-variant' // 4: Ultra activity
  ];

  return (
    <div className="relative w-full h-full bg-surface text-on-surface font-body-lg flex flex-col pt-14 pb-20 overflow-y-auto no-scrollbar" id="records-view-container">
      {/* Top App Bar */}
      <header className="fixed top-0 inset-x-0 w-full z-50 flex justify-between items-center px-4 h-14 bg-white/95 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 active:scale-95 transition-transform text-primary rounded-full hover:bg-surface-container"
          >
            <ArrowLeft className="w-5 h-5 font-bold" />
          </button>
          <h1 className="text-headline-md font-extrabold text-primary text-base">战绩记录</h1>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:opacity-80">share</span>
      </header>

      {/* Main Content Area */}
      <main className="p-4 space-y-4">
        {/* SUMMARY RANK CARD BENTO */}
        <section className="bg-court-surface rounded-2xl p-5 relative overflow-hidden flex items-center justify-between shadow-lg text-white">
          <div className="z-10">
            <p className="text-[10px] font-label-caps text-secondary-fixed opacity-80 mb-1 tracking-wider font-mono">
              CURRENT RANK
            </p>
            <h2 className="text-headline-lg-mobile font-extrabold text-xl md:text-2xl">
              大师级 L3
            </h2>
            <p className="text-xs text-secondary-fixed opacity-90 mt-1 font-mono">
              胜点: 2,450 / 全市排名: #128
            </p>
          </div>
          
          <div className="z-10 bg-ball-orange p-3 rounded-full shadow-lg -rotate-12 animate-pulse text-white">
            <Trophy className="w-9 h-9" />
          </div>
          
          {/* Decorative circular racket background accent */}
          <div className="absolute -right-6 -bottom-6 w-36 h-32 bg-primary-container opacity-25 rounded-full blur-xl" />
        </section>

        {/* METRICS ROW BENTO */}
        <section className="grid grid-cols-2 gap-3">
          {/* Total Matches */}
          <div className="bg-surface-container-high rounded-2xl p-4 flex flex-col justify-between border border-outline-variant/30 shadow-soft">
            <p className="text-label-caps text-[11px] font-bold text-on-surface-variant">总场次</p>
            <div className="mt-2 flex items-baseline">
              <span className="text-stats-number font-stats-number text-primary text-2xl font-extrabold">156</span>
              <span className="text-xs text-on-surface-variant ml-1 font-semibold">场</span>
            </div>
          </div>

          {/* Win Rate */}
          <div className="bg-surface-container-high rounded-xl p-4 flex flex-col justify-between border border-outline-variant/30 shadow-soft">
            <p className="text-label-caps text-[11px] font-bold text-on-surface-variant">胜率</p>
            <div className="mt-2 flex items-baseline">
              <span className="text-stats-number font-stats-number text-success-recruiting text-2xl font-extrabold">68.5</span>
              <span className="text-xs text-success-recruiting ml-1 font-semibold">%</span>
            </div>
          </div>
        </section>

        {/* GITHUB HEATMAP SECTION */}
        <section className="bg-white rounded-2xl p-4 border border-outline-variant/20 shadow-soft overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 font-headline-md">
              <span className="material-symbols-outlined text-primary text-lg select-none">calendar_month</span>
              训练热力图
            </h3>
            <span className="text-[10px] text-on-surface-variant/70 font-mono">过去12周活跃度</span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-1 overflow-x-auto pb-2 justify-center no-scrollbar">
              {/* Heatmap Grid Simulation (7 rows, 12 columns) */}
              <div className="grid grid-rows-7 grid-flow-col gap-1 select-none">
                {heatmapData.map((levelVal, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-sm transition-colors duration-500 hover:scale-125 ${levelColors[levelVal]}`}
                    title={`打球活跃度: 级别 ${levelVal}`}
                  />
                ))}
              </div>
            </div>

            {/* Heatmap Legend */}
            <div className="flex justify-end items-center gap-1 text-[9px] text-on-surface-variant/80 px-2 mt-1">
              <span>Less</span>
              {levelColors.map((color, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-sm ${color}`} />
              ))}
              <span>More</span>
            </div>
          </div>
        </section>

        {/* MATCH HISTORY LIST */}
        <section className="space-y-3">
          <h3 className="text-sm font-bold px-1 flex items-center gap-1.5 text-on-surface font-headline-md">
            <span className="material-symbols-outlined text-primary text-lg select-none">history</span>
            历史对局
          </h3>

          <div className="flex flex-col gap-3">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl overflow-hidden border border-outline-variant/20 shadow-soft flex active:scale-[0.99] transition-transform"
              >
                {/* Win / Loss color stripe */}
                <div className={`w-2 flex-shrink-0 ${rec.isWin ? 'bg-success-recruiting' : 'bg-danger-cancelled'}`} />

                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-2">
                      {/* Opponent Avatar */}
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-surface-container-highest shadow-sm flex-shrink-0">
                        <img
                          className="w-full h-full object-cover"
                          src={rec.opponentAvatar}
                          alt={rec.opponentName}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold text-on-surface leading-tight font-sans">
                          {rec.opponentName} <span className="text-[10px] text-on-surface-variant font-mono">({rec.opponentLevel})</span>
                        </p>
                        <p className="text-[9px] font-mono text-on-surface-variant/60 mt-0.5">
                          {rec.matchTime}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-stats-number font-stats-number text-xl font-bold leading-none ${rec.isWin ? 'text-success-recruiting' : 'text-danger-cancelled'}`}>
                        {rec.isWin ? `${rec.myScore} : ${rec.opponentScore}` : `${rec.myScore} : ${rec.opponentScore}`}
                      </div>
                      <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-extrabold font-mono tracking-wider ${
                        rec.isWin 
                          ? 'bg-success-recruiting/10 text-success-recruiting' 
                          : 'bg-danger-cancelled/10 text-danger-cancelled'
                      }`}>
                        {rec.isWin ? 'VICTORY' : 'DEFEAT'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-surface-container-high text-on-surface-variant">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      <span className="text-[10px] font-medium">{rec.locationName}</span>
                    </div>
                    <span className="material-symbols-outlined text-sm opacity-40 select-none">chevron_right</span>
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
