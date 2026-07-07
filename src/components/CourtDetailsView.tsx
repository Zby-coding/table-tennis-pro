import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Compass, MapPin, Star, CheckCircle2 } from 'lucide-react';
import { Court } from '../types';

interface CourtDetailsViewProps {
  court: Court;
  onBack: () => void;
  onCheckIn: (courtId: string) => void;
  hasCheckedIn: boolean;
}

export default function CourtDetailsView({ court, onBack, onCheckIn, hasCheckedIn }: CourtDetailsViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleCheckInClick = () => {
    if (hasCheckedIn) return;
    setCheckingIn(true);
    setTimeout(() => {
      onCheckIn(court.id);
      setCheckingIn(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1200);
  };

  const prevImage = () => setActiveImageIndex((p) => (p - 1 + court.galleryImages.length) % court.galleryImages.length);
  const nextImage = () => setActiveImageIndex((p) => (p + 1) % court.galleryImages.length);

  // Simulated activity data
  const activityBars = [
    { label: '08:00', height: '20%' },
    { label: '11:00', height: '45%' },
    { label: '14:00', height: '70%' },
    { label: '18:00', height: '95%', isNow: true },
    { label: '20:00', height: '60%' },
    { label: '22:00', height: '30%' },
    { label: '休息', height: '10%' },
  ];

  return (
    <div className="relative w-full h-full bg-background flex flex-col overflow-y-auto no-scrollbar pb-24" id="court-details-container">

      {/* ── HERO IMAGE SLIDER ── */}
      <section className="relative w-full h-[280px] bg-slate-200 overflow-hidden flex-shrink-0">
        <img
          src={court.galleryImages[activeImageIndex]}
          className="w-full h-full object-cover transition-all duration-500"
          alt={court.name}
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

        {/* Back / Share buttons */}
        <div className="absolute top-0 left-0 right-0 z-40 px-4 py-3 flex justify-between items-center">
          <button onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl glass-surface shadow-card active-press transition-all text-on-surface">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl glass-surface shadow-card active-press transition-all text-on-surface">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Image nav arrows */}
        <button onClick={prevImage}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center active-press transition-all text-lg font-bold">‹</button>
        <button onClick={nextImage}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center active-press transition-all text-lg font-bold">›</button>

        {/* Pagination */}
        <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl text-white text-[10px] font-bold font-mono">
          {activeImageIndex + 1} / {court.galleryImages.length}
        </div>
      </section>

      {/* ── TITLE CARD ── */}
      <section className="px-4 -mt-6 relative z-10 flex-shrink-0">
        <div className="bg-white rounded-2xl p-5 shadow-elevated border border-outline/10">
          <div className="flex justify-between items-start mb-3">
            <h2 className="text-[20px] font-display font-bold text-on-surface leading-tight">{court.name}</h2>
            <span className={`font-display text-[11px] font-bold px-3 py-1 rounded-xl uppercase tracking-wider ${
              court.isFree ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}>
              {court.isFree ? '免费' : '付费'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${hasCheckedIn ? 'bg-success' : 'bg-primary'} animate-pulse`} />
            <span className="text-on-surface-variant font-medium">正在打球: <strong className="text-primary">{court.activePlayers}人</strong></span>
            <span className="mx-1.5 text-outline">|</span>
            <span className="text-secondary font-semibold">距离 {court.distanceStr}</span>
          </div>
        </div>
      </section>

      {/* ── BENTO INFO GRID ── */}
      <section className="px-4 mt-4 flex-shrink-0">
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { icon: 'sports_tennis', label: '球台', value: `${court.courtCount}张` },
            { icon: 'layers', label: '材质', value: court.material },
            { icon: 'lightbulb', label: '灯光', value: court.hasLighting ? '有' : '无' },
            { icon: 'schedule', label: '开放', value: court.openHours },
          ].map((item, i) => (
            <div key={i} className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-card border border-outline/5 active-press transition-all">
              <span className="material-symbols-outlined text-primary mb-1.5 text-xl select-none">{item.icon}</span>
              <span className="text-[9px] font-semibold text-on-surface-muted uppercase tracking-wider">{item.label}</span>
              <span className="text-xs font-bold text-on-surface mt-0.5">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOURLY ACTIVITY ── */}
      <section className="px-4 mt-4 flex-shrink-0">
        <div className="bg-white rounded-2xl p-5 shadow-card border border-outline/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-display font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-lg select-none">analytics</span>
              实时活跃
            </h3>
            <span className="text-[11px] text-on-surface-muted font-medium">入驻球友: 124人</span>
          </div>

          <div className="flex items-end justify-between h-16 gap-1.5 mb-3 px-1">
            {activityBars.map((bar, idx) => (
              <div key={idx} className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-slate-100 rounded-t-lg h-16 relative flex items-end overflow-hidden">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: bar.height }}
                    transition={{ delay: idx * 0.08, duration: 0.5 }}
                    className={`w-full rounded-t-lg ${bar.isNow ? 'bg-gradient-to-t from-primary to-primary-light' : 'bg-secondary/20'}`}
                  />
                  {bar.isNow && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-display font-extrabold text-primary tracking-widest animate-pulse">
                      NOW
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-on-surface-muted font-medium">{bar.label}</span>
              </div>
            ))}
          </div>

          {/* Online avatars */}
          <div className="flex items-center gap-3 pt-3 border-t border-outline/10">
            <div className="flex -space-x-2">
              {['https://lh3.googleusercontent.com/aida-public/AB6AXuByWeIbpvjGP1GDwIeKEVR1-LFw3jv8cvNZbrt5NGwDweG9zf5EHewDwrSXYvGY17q-lAVaJ82WlBwT_Vd-OLXT3NP8od6uJGLQgaJ9kxbY3VIN5MeBy9UFyMxDapvB4XztPmqNniEjgcmAkXW1su_J1UVd5_Daiz7R6FGP7I5NMHc_HrDwASDQkiTAXdqmT2_dNMAB375KteDfcyDURycaJK0okUPFfXs4bFkTAQXiXziaBbCrhHA5fCFjdhEgv7pcNGbttnNWxUOJ',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCqA4KXx0R9CEEXsRtYZ4M6i1phe5_3M7MAvxwHTHlnQpkAm37FXDi-tbcyAhrEHTRiPpsVlBCiN-sG0CWMIphkduwqhuH0i99QBNsiE0Hs2ZAbRQDLefUBAFc25DI4N9Z1yitQOJsPtZFy2ENDQuno9SLCtFfXUspfQUp61ztUUA80mVL8dTVfbv9HyiEiOjOL_vNMAUdN6oK21Q60xWhdQ6lLjYenbEovZDqUi_GD1G0I0Krxto2aheJYlo4zGdgY49L7EMnnHUb4',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuDsTPVP-XwL54W1l39RS-feENfDXlg0zTHY-5FtC6UdU_ItLMdt7jzLxVJb4aVWyRT0yoUjLjcW5u0EODmXguVP8xKzdWamj9RgXGI1p_vu3uhkHJ412jmgsZ60BNq_QuODZISk68rDt4DSmS1kxg0L4TazPYT-RnlNi86cU0ohZd8f3rpQoDk-48TUhdJ3R-KNau7o8PzGDAtrkypauY8IlEv9KqVlRE6JtOcHkcWcKJ7bQeNVZqgESid6QXQrXMJ2zhuoDC4rBjYJ',
              ].map((url, i) => (
                <img key={i} src={url} className="w-8 h-8 rounded-full ring-2 ring-white object-cover shadow-sm" alt="user" referrerPolicy="no-referrer" />
              ))}
              <div className="w-8 h-8 rounded-full ring-2 ring-white bg-surface-container flex items-center justify-center text-[9px] font-bold text-on-surface-variant">+4</div>
            </div>
            <p className="text-xs text-on-surface-variant">
              <span className="text-on-surface font-bold">老李、老张</span> 等人正在这里打球
            </p>
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="px-4 mt-4 mb-4 flex-1">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-display font-bold text-on-surface">场馆评价 ({court.rating})</h3>
          <span className="text-xs text-primary font-bold">查看全部</span>
        </div>
        <div className="space-y-3">
          {court.reviews.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-card border border-outline/5 text-sm text-on-surface-muted">
              暂无评价。快来签到并写下您的真实评价吧！
            </div>
          ) : (
            court.reviews.map((rev) => (
              <div key={rev.id} className="bg-white rounded-2xl p-4 shadow-card border border-outline/5">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2.5">
                    <img src={rev.reviewerAvatar} className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/10" alt={rev.reviewerName} referrerPolicy="no-referrer" />
                    <div>
                      <p className="text-xs font-bold text-on-surface">{rev.reviewerName}</p>
                      <p className="text-[10px] text-on-surface-muted">{rev.reviewerLevel} • {rev.timeStr}</p>
                    </div>
                  </div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-energy-yellow text-energy-yellow' : 'text-outline'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-3">{rev.content}</p>
                {rev.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {rev.images.map((imgUrl, i) => (
                      <div key={i} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                        <img src={imgUrl} className="w-full h-full object-cover" alt="review" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ── BOTTOM ACTION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-outline/10 z-40 flex gap-3 shadow-floating">
        <button
          onClick={() => alert(`已唤起百度/高德地图导航: \n终点: ${court.name}\n地址: ${court.address}`)}
          className="flex-1 h-12 rounded-2xl border-2 border-secondary text-secondary font-bold flex items-center justify-center gap-2 text-sm active-press transition-all hover:bg-secondary/5"
        >
          <Compass className="w-4 h-4" />
          <span>一键导航</span>
        </button>

        <button
          disabled={hasCheckedIn || checkingIn}
          onClick={handleCheckInClick}
          className={`flex-[1.4] h-12 rounded-2xl font-display font-bold flex items-center justify-center gap-2 text-sm transition-all shadow-md active-press ${
            hasCheckedIn
              ? 'bg-success text-white shadow-success/20'
              : checkingIn
              ? 'bg-primary/60 text-white'
              : 'gradient-primary text-white shadow-primary/30'
          }`}
        >
          {hasCheckedIn ? (
            <><CheckCircle2 className="w-5 h-5" /> 已签到打球中</>
          ) : checkingIn ? (
            <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> 核销定位中...</>
          ) : (
            <><span className="material-symbols-outlined text-[20px]">where_to_vote</span> 立即签到打卡</>
          )}
        </button>
      </div>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="gradient-primary text-white px-5 py-2.5 rounded-2xl shadow-floating flex items-center gap-2 font-bold text-sm"
            >
              <span>🎉 签到成功！祝您球运亨通 🏓</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
