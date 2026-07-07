import React from 'react';
import { motion } from 'motion/react';
import { Award, Bookmark, Settings, BarChart3, ChevronRight, Star } from 'lucide-react';
import { UserProfile, Achievement } from '../types';

interface MeProfileViewProps {
  profile: UserProfile;
  achievements: Achievement[];
  onNavigateToRecords: () => void;
  onNavigateToSettings: () => void;
}

export default function MeProfileView({ profile, achievements, onNavigateToRecords, onNavigateToSettings }: MeProfileViewProps) {
  const intensityClasses = ['bg-secondary/10', 'bg-secondary/35', 'bg-secondary/60', 'bg-secondary'];
  const simulatedCells = Array.from({ length: 182 }).map((_, i) => {
    const seed = (Math.sin(i * 0.15) + Math.cos(i * 0.08) + 2) / 4;
    if (seed > 0.82) return 3; if (seed > 0.58) return 2; if (seed > 0.32) return 1; return 0;
  });

  const menuItems = [
    { icon: <Bookmark className="w-5 h-5 text-primary" />, label: '我的收藏', badge: null, onClick: undefined },
    { icon: <BarChart3 className="w-5 h-5 text-secondary" />, label: '我的战绩记录', badge: <span className="px-2 py-0.5 bg-error text-white text-[9px] font-display font-bold rounded-lg tracking-wider">NEW</span>, onClick: onNavigateToRecords },
    { icon: <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>edit_location_alt</span>, label: '场地报错与纠错', badge: null, onClick: undefined },
    { icon: <Settings className="w-5 h-5 text-primary" />, label: '系统通用设置', badge: null, onClick: onNavigateToSettings },
  ];

  return (
    <div className="relative w-full h-full bg-background flex flex-col overflow-y-auto no-scrollbar" id="me-profile-container">
      {/* ── SETTINGS BUTTON ── */}
      <div className="absolute top-0 right-4 z-10">
        <button onClick={onNavigateToSettings}
          className="w-10 h-10 flex items-center justify-center rounded-xl glass-surface shadow-card active-press transition-all text-on-surface">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 space-y-4">

        {/* ── PROFILE CARD ── */}
        <section className="relative rounded-2xl p-5 overflow-hidden shadow-elevated text-white"
          style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #E0552B 100%)' }}>
          {/* Decorative */}
          <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full bg-white/8" />
          <div className="absolute bottom-0 right-0 w-24 h-24 opacity-[0.06] text-white rotate-12 select-none pointer-events-none">
            <span className="material-symbols-outlined text-[100px]">sports_tennis</span>
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 rounded-full ring-[3px] ring-white/40 p-0.5 flex-shrink-0 shadow-lg"
            >
              <img className="w-full h-full object-cover rounded-full" src={profile.avatarUrl} alt={profile.username} referrerPolicy="no-referrer" />
            </motion.div>
            <div>
              <h2 className="text-xl font-display font-bold leading-tight">{profile.username}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 bg-white/15 backdrop-blur rounded-xl text-[10px] font-display font-bold tracking-wider mt-1.5">
                <span className="material-symbols-outlined text-xs mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                {profile.levelBadge}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
            {[
              { value: profile.hoursPlayed, unit: 'h', label: '打球总时' },
              { value: profile.winRate, unit: '%', label: '胜率' },
              { value: profile.points, unit: '', label: '积分' },
            ].map((s, i) => (
              <div key={i} className={`text-center ${i === 1 ? 'border-x border-white/15' : ''}`}>
                <div className="score-number text-lg font-bold">
                  {s.value}<span className="text-[11px] font-medium text-white/70 ml-0.5">{s.unit}</span>
                </div>
                <div className="text-[10px] font-semibold text-white/60 tracking-wider uppercase mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ACHIEVEMENTS ── */}
        <section>
          <div className="flex justify-between items-center px-1 mb-2.5">
            <h3 className="text-sm font-display font-bold text-on-surface flex items-center gap-1.5">
              <Award className="w-4 h-4 text-primary" />
              成就勋章
            </h3>
            <span className="text-xs text-primary font-bold">查看全部</span>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {achievements.map((ach) => (
              <motion.div
                key={ach.id}
                whileHover={{ scale: 1.05 }}
                className={`flex-none w-[72px] flex flex-col items-center group transition-all duration-200 ${
                  ach.unlocked ? '' : 'opacity-40 grayscale'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-1.5 shadow-sm ${ach.color}`}>
                  <span className="material-symbols-outlined text-2xl font-bold select-none" style={{ fontVariationSettings: "'FILL' 1" }}>{ach.icon}</span>
                </div>
                <span className="text-[9px] font-bold text-on-surface text-center leading-tight">{ach.name}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── PLAY CALENDAR HEATMAP ── */}
        <section className="bg-white p-4 rounded-2xl shadow-card border border-outline/5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-display font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-lg select-none">sports_tennis</span>
              打球历程
            </h3>
            <span className="text-[10px] text-on-surface-muted font-medium">过去26周</span>
          </div>
          <div className="flex justify-center">
            <div className="grid grid-rows-7 grid-flow-col gap-[2.5px] select-none">
              {simulatedCells.map((intensityIdx, idx) => (
                <div key={idx} className={`w-2.5 h-2.5 rounded-[2px] hover:scale-125 transition-transform ${intensityClasses[intensityIdx]}`}
                  title={`活跃历史: ${intensityIdx}`} />
              ))}
            </div>
          </div>
          <div className="flex justify-end items-center gap-1 text-[9px] text-on-surface-muted font-medium mt-3 px-1">
            <span className="mr-1 opacity-60">Less</span>
            {intensityClasses.map((cl, idx) => <div key={idx} className={`w-2.5 h-2.5 rounded-[1px] ${cl}`} />)}
            <span className="ml-1 opacity-60">More</span>
          </div>
        </section>

        {/* ── MENU ── */}
        <section className="bg-white rounded-2xl shadow-card border border-outline/5 overflow-hidden">
          {menuItems.map((item, i) => (
            <div key={i}>
              {i > 0 && <div className="h-px bg-outline/10 mx-4" />}
              <div onClick={item.onClick}
                className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors cursor-pointer active-press">
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="text-sm font-bold text-on-surface">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge}
                  <ChevronRight className="w-4 h-4 text-on-surface-muted/40" />
                </div>
              </div>
            </div>
          ))}
        </section>

      </div>
    </div>
  );
}
