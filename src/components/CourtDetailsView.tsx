import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Compass, MapPin, Sparkles, Star, Calendar, Check, CheckCircle2 } from 'lucide-react';
import { Court } from '../types';

interface CourtDetailsViewProps {
  court: Court;
  onBack: () => void;
  onCheckIn: (courtId: string) => void;
  hasCheckedIn: boolean;
}

export default function CourtDetailsView({
  court,
  onBack,
  onCheckIn,
  hasCheckedIn
}: CourtDetailsViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [checkingIn, setCheckingIn] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Micro-interaction for check-in
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

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % court.galleryImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + court.galleryImages.length) % court.galleryImages.length);
  };

  return (
    <div className="relative w-full h-full bg-surface text-on-surface font-body-lg flex flex-col pt-14 pb-24 overflow-y-auto no-scrollbar" id="court-details-container">
      {/* HEADER CONTROLS (Back / Share) */}
      <div className="absolute top-14 left-0 right-0 z-40 px-4 py-3 flex justify-between items-center pointer-events-none">
        <button
          onClick={onBack}
          className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm border border-outline/5 transition-transform active:scale-95 text-primary"
        >
          <ArrowLeft className="w-5 h-5 font-bold" />
        </button>
        <button
          className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow-sm border border-outline/5 transition-transform active:scale-95 text-primary"
        >
          <Share2 className="w-5 h-5 font-bold" />
        </button>
      </div>

      {/* HERO IMAGE SLIDER */}
      <section className="relative w-full h-[260px] bg-slate-200 overflow-hidden flex-shrink-0">
        <div className="w-full h-full relative">
          <img
            src={court.galleryImages[activeImageIndex]}
            className="w-full h-full object-cover transition-all duration-500"
            alt={court.name}
            referrerPolicy="no-referrer"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
        </div>

        {/* Gallery Slider Left/Right Buttons */}
        <button 
          onClick={prevImage}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 backdrop-blur text-white flex items-center justify-center text-xs select-none active:scale-90"
        >
          ‹
        </button>
        <button 
          onClick={nextImage}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 backdrop-blur text-white flex items-center justify-center text-xs select-none active:scale-90"
        >
          ›
        </button>

        {/* Pagination Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/45 backdrop-blur-sm px-3 py-1 rounded-full text-white font-label-caps text-[10px] font-bold">
          {activeImageIndex + 1} / {court.galleryImages.length}
        </div>
      </section>

      {/* CORE TITLE CARD */}
      <section className="px-4 -mt-6 relative z-10 flex-shrink-0">
        <div className="bg-white rounded-2xl p-5 shadow-lg border border-outline/10">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-headline-lg-mobile font-bold text-on-surface text-lg md:text-xl">
              {court.name}
            </h2>
            <span className="bg-wechat-green/10 text-wechat-green font-label-caps text-[10px] font-extrabold px-2.5 py-1 rounded uppercase tracking-wider">
              {court.isFree ? '免费' : '付费'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${hasCheckedIn ? 'bg-wechat-green' : 'bg-primary'} animate-pulse`} />
            <span className="text-on-surface-variant font-medium">正在打球: {court.activePlayers}人</span>
            <span className="mx-2 text-outline-variant">|</span>
            <span className="text-secondary font-semibold">距离 {court.distanceStr}</span>
          </div>
        </div>
      </section>

      {/* BENTO INFO GRID */}
      <section className="px-4 mt-4 flex-shrink-0">
        <div className="grid grid-cols-4 gap-2.5">
          <div className="bg-surface-container-high p-3 rounded-2xl flex flex-col items-center justify-center text-center bento-inner-shadow border border-outline/5">
            <span className="material-symbols-outlined text-primary mb-1 text-xl select-none">sports_tennis</span>
            <span className="text-[9px] font-label-caps text-on-surface-variant uppercase tracking-wider">球台</span>
            <span className="text-xs font-extrabold text-on-surface mt-0.5">{court.courtCount}张</span>
          </div>

          <div className="bg-surface-container-high p-3 rounded-2xl flex flex-col items-center justify-center text-center bento-inner-shadow border border-outline/5">
            <span className="material-symbols-outlined text-primary mb-1 text-xl select-none">layers</span>
            <span className="text-[9px] font-label-caps text-on-surface-variant uppercase tracking-wider">材质</span>
            <span className="text-xs font-extrabold text-on-surface mt-0.5">{court.material}</span>
          </div>

          <div className="bg-surface-container-high p-3 rounded-2xl flex flex-col items-center justify-center text-center bento-inner-shadow border border-outline/5">
            <span className="material-symbols-outlined text-primary mb-1 text-xl select-none">lightbulb</span>
            <span className="text-[9px] font-label-caps text-on-surface-variant uppercase tracking-wider">灯光</span>
            <span className="text-xs font-extrabold text-on-surface mt-0.5">{court.hasLighting ? '有' : '无'}</span>
          </div>

          <div className="bg-surface-container-high p-3 rounded-2xl flex flex-col items-center justify-center text-center bento-inner-shadow border border-outline/5">
            <span className="material-symbols-outlined text-primary mb-1 text-xl select-none">schedule</span>
            <span className="text-[9px] font-label-caps text-on-surface-variant uppercase tracking-wider">开放</span>
            <span className="text-[9px] font-extrabold text-on-surface mt-0.5 leading-none text-center">
              {court.openHours.split('-').join('-\n')}
            </span>
          </div>
        </div>
      </section>

      {/* REAL-TIME TRAFFIC / HOURLY ACTIVITY CHART */}
      <section className="px-4 mt-4 flex-shrink-0">
        <div className="bg-white rounded-2xl p-5 border border-outline/5 shadow-soft">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-on-surface flex items-center gap-1.5 font-headline-md">
              <span className="material-symbols-outlined text-ball-orange text-lg select-none">analytics</span>
              实时活跃
            </h3>
            <span className="text-[11px] text-on-surface-variant font-mono">入驻球友: 124人</span>
          </div>

          {/* Activity Bar Chart (Simulated Hours) */}
          <div className="flex items-end justify-between h-16 gap-2 mb-4 px-2">
            {[
              { label: '08:00', height: '20%' },
              { label: '11:00', height: '45%' },
              { label: '14:00', height: '70%' },
              { label: '18:00', height: '95%', isNow: true },
              { label: '20:00', height: '60%' },
              { label: '22:00', height: '30%' },
              { label: '休息', height: '10%' }
            ].map((bar, idx) => (
              <div key={idx} className="w-full flex flex-col items-center gap-1">
                <div className="w-full bg-slate-100 rounded-t-md h-16 relative flex items-end">
                  <div
                    className={`w-full rounded-t-sm transition-all duration-500 ${
                      bar.isNow ? 'bg-primary-container' : 'bg-secondary-container/40'
                    }`}
                    style={{ height: bar.height }}
                  />
                  {bar.isNow && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-primary tracking-wider animate-pulse">
                      NOW
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-on-surface-variant font-mono scale-90">{bar.label}</span>
              </div>
            ))}
          </div>

          {/* Check-in Group Avatars */}
          <div className="flex items-center gap-3 pt-3 border-t border-surface-container/60">
            <div className="flex -space-x-2.5 overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuByWeIbpvjGP1GDwIeKEVR1-LFw3jv8cvNZbrt5NGwDweG9zf5EHewDwrSXYvGY17q-lAVaJ82WlBwT_Vd-OLXT3NP8od6uJGLQgaJ9kxbY3VIN5MeBy9UFyMxDapvB4XztPmqNniEjgcmAkXW1su_J1UVd5_Daiz7R6FGP7I5NMHc_HrDwASDQkiTAXdqmT2_dNMAB375KteDfcyDURycaJK0okUPFfXs4bFkTAQXiXziaBbCrhHA5fCFjdhEgv7pcNGbttnNWxUOJ" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="user" referrerPolicy="no-referrer" />
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqA4KXx0R9CEEXsRtYZ4M6i1phe5_3M7MAvxwHTHlnQpkAm37FXDi-tbcyAhrEHTRiPpsVlBCiN-sG0CWMIphkduwqhuH0i99QBNsiE0Hs2ZAbRQDLefUBAFc25DI4N9Z1yitQOJsPtZFy2ENDQuno9SLCtFfXUspfQUp61ztUUA80mVL8dTVfbv9HyiEiOjOL_vNMAUdN6oK21Q60xWhdQ6lLjYenbEovZDqUi_GD1G0I0Krxto2aheJYlo4zGdgY49L7EMnnHUb4" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="user" referrerPolicy="no-referrer" />
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDsTPVP-XwL54W1l39RS-feENfDXlg0zTHY-5FtC6UdU_ItLMdt7jzLxVJb4aVWyRT0yoUjLjcW5u0EODmXguVP8xKzdWamj9RgXGI1p_vu3uhkHJ412jmgsZ60BNq_QuODZISk68rDt4DSmS1kxg0L4TazPYT-RnlNi86cU0ohZd8f3rpQoDk-48TUhdJ3R-KNau7o8PzGDAtrkypauY8IlEv9KqVlRE6JtOcHkcWcKJ7bQeNVZqgESid6QXQrXMJ2zhuoDC4rBjYJ" className="w-8 h-8 rounded-full border-2 border-white object-cover" alt="user" referrerPolicy="no-referrer" />
              <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[9px] font-bold text-on-surface-variant">+4</div>
            </div>
            <p className="text-xs text-on-surface-variant">
              <span className="text-on-surface font-bold">老李、老张</span> 等人正在这里打球
            </p>
          </div>
        </div>
      </section>

      {/* COURT REVIEWS */}
      <section className="px-4 mt-4 mb-4 flex-1">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-on-surface font-headline-md">场馆评价 ({court.rating})</h3>
          <span className="text-xs text-primary font-bold">查看全部</span>
        </div>

        <div className="space-y-3">
          {court.reviews.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-outline-variant/30 text-xs text-on-surface-variant/50">
              暂无评价。快来进行首发签到并写下您的真实评价吧！
            </div>
          ) : (
            court.reviews.map((rev) => (
              <div key={rev.id} className="bg-surface-container-low p-4 rounded-2xl border border-outline/5">
                <div className="flex justify-between items-center mb-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={rev.reviewerAvatar}
                      className="h-8 w-8 rounded-full object-cover border border-white"
                      alt={rev.reviewerName}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-xs font-bold text-on-surface">{rev.reviewerName}</p>
                      <p className="text-[9px] text-on-surface-variant/60 font-mono">
                        {rev.reviewerLevel} • {rev.timeStr}
                      </p>
                    </div>
                  </div>
                  <div className="flex text-ball-orange">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-current text-ball-orange' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed mb-3">
                  {rev.content}
                </p>

                {rev.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {rev.images.map((imgUrl, i) => (
                      <div key={i} className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-outline/10 shadow-soft">
                        <img src={imgUrl} className="w-full h-full object-cover" alt="review upload" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* STICKY BOTTOM ACTIONS BAR */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-outline/10 z-40 flex gap-3 shadow-lg">
        <button
          onClick={() => {
            // Simulate direct maps opening alert
            alert(`已唤起百度/高德地图导航: \n终点: ${court.name}\n地址: ${court.address}`);
          }}
          className="flex-1 h-12 rounded-xl border-2 border-secondary text-secondary font-bold flex items-center justify-center gap-2 text-xs active:scale-95 transition-transform"
        >
          <Compass className="w-4 h-4" />
          <span>一键导航</span>
        </button>

        <button
          disabled={hasCheckedIn || checkingIn}
          onClick={handleCheckInClick}
          className={`flex-[1.4] h-12 rounded-xl font-bold flex items-center justify-center gap-2 text-xs transition-all duration-300 shadow-md ${
            hasCheckedIn
              ? 'bg-wechat-green text-white cursor-default shadow-wechat-green/20'
              : checkingIn
              ? 'bg-primary/50 text-white cursor-wait'
              : 'bg-ball-orange hover:bg-ball-orange/95 text-white active:scale-95 shadow-orange-500/20'
          }`}
        >
          {hasCheckedIn ? (
            <>
              <CheckCircle2 className="w-4 h-4 animate-bounce" />
              <span>已签到打球中</span>
            </>
          ) : checkingIn ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>正在核销位置...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]">where_to_vote</span>
              <span>立即签到打卡</span>
            </>
          )}
        </button>
      </div>

      {/* FLOATING MICRO-INTERACTION TOAST */}
      <AnimatePresence>
        {showToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="bg-on-surface text-surface px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 font-bold text-xs"
            >
              <span>🎉 签到成功！祝您球运亨通 🏓</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
