import React from 'react';
import { Award, ChevronRight, Bookmark, Settings, Edit3, HelpCircle, BarChart3 } from 'lucide-react';
import { UserProfile, Achievement } from '../types';

interface MeProfileViewProps {
  profile: UserProfile;
  achievements: Achievement[];
  onNavigateToRecords: () => void;
  onNavigateToSettings: () => void;
}

export default function MeProfileView({
  profile,
  achievements,
  onNavigateToRecords,
  onNavigateToSettings
}: MeProfileViewProps) {
  // Generate random heatmap intensity classes for 26 columns x 7 rows = 182 cells
  const intensityClasses = [
    'bg-secondary/10',
    'bg-secondary/35',
    'bg-secondary/60',
    'bg-secondary'
  ];

  // Simulating 182 cells for the 26-week calendar heatmap
  const simulatedCells = Array.from({ length: 182 }).map((_, i) => {
    // Produce some grouping pattern to make it look realistic
    const seed = (Math.sin(i * 0.15) + Math.cos(i * 0.08) + 2) / 4; // 0.0 - 1.0
    if (seed > 0.82) return 3;
    if (seed > 0.58) return 2;
    if (seed > 0.32) return 1;
    return 0;
  });

  return (
    <div className="relative w-full h-full bg-surface text-on-surface font-body-lg flex flex-col pt-14 pb-20 overflow-y-auto no-scrollbar" id="me-profile-container">
      {/* Settings header button */}
      <div className="absolute top-14 right-4 z-10 flex gap-2">
        <button
          onClick={onNavigateToSettings}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur shadow-sm border border-outline/5 active:scale-95 transition-all text-primary"
          title="打开设置"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* PROFILE MAIN CARD */}
        <section className="bg-white p-5 rounded-2xl shadow-soft border border-outline-variant/15 relative overflow-hidden text-left">
          {/* Abstract background logo watermark */}
          <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 opacity-[0.04] text-primary rotate-12 select-none pointer-events-none">
            <span className="material-symbols-outlined text-[120px]">sports_tennis</span>
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {/* User Avatar */}
            <div className="w-16 h-16 rounded-full border-2 border-primary-container p-0.5 shrink-0 relative bg-white shadow-soft">
              <img
                className="w-full h-full object-cover rounded-full"
                src={profile.avatarUrl}
                alt={profile.username}
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div>
              <h2 className="text-headline-md font-bold text-lg text-on-surface leading-tight font-sans">
                {profile.username}
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-[9px] font-extrabold tracking-wider font-mono mt-1.5 shadow-sm border border-amber-200">
                <span className="material-symbols-outlined text-xs mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
                  workspace_premium
                </span>
                {profile.levelBadge}
              </span>
            </div>
          </div>

          {/* BENTO STATS METRICS */}
          <div className="mt-6 grid grid-cols-3 gap-2 border-t border-surface-container-high pt-5">
            <div className="text-center">
              <div className="text-stats-number font-bold text-lg md:text-xl text-primary font-sans">
                {profile.hoursPlayed}
                <span className="text-[10px] font-medium text-on-surface-variant ml-0.5 font-mono">h</span>
              </div>
              <div className="text-[9px] font-bold text-on-surface-variant/70 tracking-wider uppercase font-mono mt-0.5">
                打球总时
              </div>
            </div>

            <div className="text-center border-x border-surface-container-high">
              <div className="text-stats-number font-bold text-lg md:text-xl text-secondary font-sans">
                {profile.winRate}
                <span className="text-[10px] font-medium text-on-surface-variant ml-0.5 font-mono">%</span>
              </div>
              <div className="text-[9px] font-bold text-on-surface-variant/70 tracking-wider uppercase font-mono mt-0.5">
                胜率
              </div>
            </div>

            <div className="text-center">
              <div className="text-stats-number font-bold text-lg md:text-xl text-tertiary font-sans">
                {profile.points}
              </div>
              <div className="text-[9px] font-bold text-on-surface-variant/70 tracking-wider uppercase font-mono mt-0.5">
                积分
              </div>
            </div>
          </div>
        </section>

        {/* ACHIEVEMENTS CAROUSEL */}
        <section className="space-y-2.5 text-left">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-bold text-on-surface font-headline-md flex items-center gap-1">
              <Award className="w-4 h-4 text-primary" />
              <span>成就勋章</span>
            </h3>
            <span className="text-[10px] text-primary font-bold tracking-wider font-sans">
              查看全部
            </span>
          </div>

          <div className="flex gap-3.5 overflow-x-auto no-scrollbar py-1">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`flex-none w-20 flex flex-col items-center group transition-all duration-200 ${
                  ach.unlocked ? '' : 'opacity-40 grayscale'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-1.5 shadow-sm active:scale-95 transition-transform ${ach.color}`}>
                  <span className="material-symbols-outlined text-2xl font-bold select-none" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {ach.icon}
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-on-surface text-center truncate max-w-full font-sans">
                  {ach.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* GITHUB-STYLE 26-WEEK PLAY CALENDAR HEATMAP */}
        <section className="bg-white p-4 rounded-2xl shadow-soft border border-outline-variant/15 text-left flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 font-headline-md">
              <span className="material-symbols-outlined text-primary text-lg select-none">sports_tennis</span>
              打球历程
            </h3>
            <div className="text-[10px] text-on-surface-variant font-mono">过去26周活跃记录</div>
          </div>

          <div className="flex flex-col gap-1.5">
            {/* Heatmap Grid container */}
            <div className="grid grid-rows-7 grid-flow-col gap-[3px] overflow-x-auto no-scrollbar justify-center select-none pb-1">
              {simulatedCells.map((intensityIdx, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-[2px] hover:scale-125 transition-transform ${intensityClasses[intensityIdx]}`}
                  title={`打球历史活性: ${intensityIdx}`}
                />
              ))}
            </div>

            {/* Heatmap legend label rows */}
            <div className="flex justify-end items-center gap-1 text-[9px] text-on-surface-variant font-sans px-1">
              <span className="mr-1 opacity-70">Less</span>
              {intensityClasses.map((cl, idx) => (
                <div key={idx} className={`w-2.5 h-2.5 rounded-[1px] ${cl}`} />
              ))}
              <span className="ml-1 opacity-70">More</span>
            </div>
          </div>
        </section>

        {/* PROFILE NAVIGATION MENU OPTIONS */}
        <section className="bg-white rounded-2xl shadow-soft border border-outline-variant/15 overflow-hidden text-xs">
          <div className="divide-y divide-surface-container-high text-left">
            {/* Collect */}
            <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Bookmark className="w-4 h-4 text-primary" />
                <span className="font-bold text-on-surface font-sans">我的收藏</span>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant/40" />
            </div>

            {/* Match Records */}
            <div 
              onClick={onNavigateToRecords}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-secondary" />
                <span className="font-bold text-on-surface font-sans">我的战绩记录</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-extrabold rounded-full font-sans tracking-wide">NEW</span>
                <ChevronRight className="w-4 h-4 text-on-surface-variant/40" />
              </div>
            </div>

            {/* Corrections */}
            <div className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  edit_location_alt
                </span>
                <span className="font-bold text-on-surface font-sans">场地报错与纠错</span>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant/40" />
            </div>

            {/* Settings */}
            <div 
              onClick={onNavigateToSettings}
              className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-primary" />
                <span className="font-bold text-on-surface font-sans">系统通用设置</span>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant/40" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
