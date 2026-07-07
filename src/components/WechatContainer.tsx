import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Upload, Flame } from 'lucide-react';
import { Court, MatchPost, UserProfile, GameRecord, CustomIcon, LevelType, Achievement } from '../types';
import { IMAGES, INITIAL_COURTS, INITIAL_MATCH_POSTS, INITIAL_USER_PROFILE, INITIAL_GAME_RECORDS, INITIAL_CUSTOM_ICONS } from '../data';

import HomeMapView from './HomeMapView';
import SquareView from './SquareView';
import CourtDetailsView from './CourtDetailsView';
import MatchRecordsView from './MatchRecordsView';
import SettingsView from './SettingsView';
import MeProfileView from './MeProfileView';

export default function WechatContainer() {
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [matchPosts, setMatchPosts] = useState<MatchPost[]>(INITIAL_MATCH_POSTS);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [records, setRecords] = useState<GameRecord[]>(INITIAL_GAME_RECORDS);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>(INITIAL_CUSTOM_ICONS);
  const [checkedInCourts, setCheckedInCourts] = useState<string[]>([]);

  const [activeTab, setActiveTab] = useState<'home' | 'square' | 'social' | 'me'>('home');
  const [currentNestedView, setCurrentNestedView] = useState<'court_details' | 'records' | 'settings' | null>(null);
  const [activeCourtId, setActiveCourtId] = useState<string | null>(null);

  const [globalDragActive, setGlobalDragActive] = useState(false);
  const [currentLocalTime, setCurrentLocalTime] = useState('20:12');

  const [pendingDroppedFile, setPendingDroppedFile] = useState<{
    base64: string;
    name: string;
    size: number;
    type: string;
  } | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentLocalTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGlobalDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGlobalDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGlobalDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPendingDroppedFile({
              base64: event.target.result as string,
              name: file.name,
              size: file.size,
              type: file.type
            });
            setCurrentNestedView('settings');
            setActiveTab('me');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleJoinMatch = (postId: string) => {
    setMatchPosts(posts => posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          joinedCount: p.joinedCount + 1,
          isJoinedByMe: true,
          participants: [...p.participants, profile.avatarUrl],
          status: p.joinedCount + 1 >= p.totalCapacity ? '已满员' : p.status
        };
      }
      return p;
    }));
  };

  const handleAddMatchPost = (newPost: Omit<MatchPost, 'id' | 'organizerAvatar' | 'organizerName' | 'organizerLevel' | 'joinedCount' | 'participants' | 'status'>) => {
    const post: MatchPost = {
      ...newPost,
      id: `post_${Date.now()}`,
      organizerName: profile.username,
      organizerAvatar: profile.avatarUrl,
      organizerLevel: profile.level,
      joinedCount: 1,
      participants: [profile.avatarUrl],
      status: '招募中',
      isJoinedByMe: true
    };
    setMatchPosts([post, ...matchPosts]);
  };

  const handleSelectCourtByName = (courtName: string) => {
    const court = courts.find(c => c.name === courtName);
    if (court) {
      setActiveCourtId(court.id);
      setCurrentNestedView('court_details');
    }
  };

  const handleNavigateToCourtFromMap = (court: Court) => {
    setActiveCourtId(court.id);
    setCurrentNestedView('court_details');
  };

  const handleCheckIn = (courtId: string) => {
    setCheckedInCourts([...checkedInCourts, courtId]);
    setCourts(prevCourts => prevCourts.map(c => {
      if (c.id === courtId) return { ...c, activePlayers: c.activePlayers + 1 };
      return c;
    }));
    setProfile(p => ({ ...p, hoursPlayed: p.hoursPlayed + 2, points: p.points + 25 }));
  };

  const handleAddCustomCourt = (name: string, lat: number, lng: number, customIconId?: string) => {
    const iconObj = customIcons.find(icon => icon.id === customIconId);
    const newCourt: Court = {
      id: `custom_court_${Date.now()}`,
      name, isFree: true, activePlayers: 1, distanceStr: '1.5km',
      courtCount: 2, material: '户外硅PU', hasLighting: false,
      openHours: '08:00-21:00',
      image: iconObj ? iconObj.dataUrl : IMAGES.chaoyangPreview,
      galleryImages: [iconObj ? iconObj.dataUrl : IMAGES.chaoyangPreview, IMAGES.courtCloseup],
      lat, lng, rating: 5.0,
      address: '自定义创建地图场地',
      features: ['我自定义创建', '使用自定义地图标记'],
      reviews: []
    };
    setCourts([...courts, newCourt]);
  };

  const handleUploadIcon = (name: string, dataUrl: string, type: 'marker' | 'badge' | 'avatar', fileSize: number, fileType: string) => {
    const newIcon: CustomIcon = {
      id: `custom_icon_${Date.now()}`,
      name, dataUrl, type, fileSize, fileType,
      createdAt: new Date().toISOString()
    };
    setCustomIcons([newIcon, ...customIcons]);
    if (type === 'badge') {
      const newAchievement: Achievement = {
        id: `custom_ach_${Date.now()}`,
        name, desc: '自定义拖拽图片生成获得的荣誉勋章！',
        icon: 'verified',
        color: 'bg-gradient-to-br from-primary to-primary-light text-white',
        unlocked: true
      };
      setProfile(p => ({ ...p, achievements: [newAchievement, ...p.achievements] }));
    }
  };

  const handleDeleteIcon = (id: string) => {
    setCustomIcons(customIcons.filter(icon => icon.id !== id));
  };

  const handleSelectAvatar = (avatarUrl: string) => {
    setProfile(p => ({ ...p, avatarUrl }));
  };

  const selectedCourtObj = courts.find(c => c.id === activeCourtId) || courts[0];

  // ── Tab config ──
  const tabs = [
    { key: 'home', icon: 'map', label: '首页' },
    { key: 'square', icon: 'sports_tennis', label: '广场' },
    { key: 'social', icon: 'emoji_events', label: '社交' },
    { key: 'me', icon: 'person', label: '我的' }
  ];

  const getTitle = () => {
    if (currentNestedView === 'court_details') return selectedCourtObj.name;
    if (currentNestedView === 'records') return '战绩排行';
    if (currentNestedView === 'settings') return '系统设置';
    if (activeTab === 'home') return '球馆地图探索';
    if (activeTab === 'square') return '约球广场';
    if (activeTab === 'social') return '打球社交圈';
    return '我的乒协名片';
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 flex items-center justify-center p-4 py-8 font-sans antialiased select-none">

      {/* ── PHONE FRAME ── */}
      <div
        className="relative w-[375px] h-[812px] rounded-[44px] shadow-floating overflow-hidden flex flex-col transition-all duration-300"
        style={{ background: 'linear-gradient(145deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Inner screen border gradient */}
        <div className="absolute inset-[6px] rounded-[38px] overflow-hidden flex flex-col bg-background z-0">
          {/* ── NOTCH ── */}
          <div className="absolute top-0 inset-x-0 h-7 bg-black z-[100] flex justify-center items-end pb-1 rounded-b-2xl">
            <div className="w-36 h-4 bg-black rounded-b-2xl flex justify-center items-center gap-1.5">
              <div className="w-14 h-1 bg-zinc-700 rounded-full" />
              <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full border border-zinc-700" />
            </div>
          </div>

          {/* ── STATUS BAR ── */}
          <div className="absolute top-0 inset-x-0 h-10 px-7 flex justify-between items-center z-50 text-[11px] font-semibold text-white/90 select-none pointer-events-none">
            <span>{currentLocalTime}</span>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[13px]">signal_cellular_4_bar</span>
              <span className="material-symbols-outlined text-[13px]">wifi</span>
              <span className="material-symbols-outlined text-[13px]">battery_full_alt</span>
            </div>
          </div>

          {/* ── GLOBAL DnD OVERLAY ── */}
          <AnimatePresence>
            {globalDragActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-primary/95 to-primary-dark/95 backdrop-blur-md z-[200] flex flex-col items-center justify-center text-center p-8 text-white gap-5 pointer-events-none"
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center border-2 border-dashed border-white/50"
                >
                  <Upload className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl font-display font-bold tracking-wide">释放鼠标即可上传</h2>
                  <p className="text-sm opacity-80 mt-1.5">图片将保存到自定义图标库</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── TOP APP BAR ── */}
          <div className="absolute top-7 inset-x-0 h-12 z-40 flex justify-between items-center px-4 bg-white/90 backdrop-blur-xl border-b border-outline/30">
            {/* Left: Back or Title */}
            <div className="flex items-center gap-2 min-w-0">
              {currentNestedView && (
                <button
                  onClick={() => setCurrentNestedView(null)}
                  className="p-1.5 -ml-1 active-press rounded-lg hover:bg-surface-container transition-colors text-on-surface"
                >
                  <span className="material-symbols-outlined text-xl">arrow_back_ios</span>
                </button>
              )}
              <span className="text-[13px] font-semibold text-on-surface truncate max-w-[160px]">
                {getTitle()}
              </span>
            </div>

            {/* Right: WeChat pills */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-container-low hover:bg-surface-container transition-colors active-press" title="更多">
                <div className="flex gap-[2px]">
                  <div className="w-1 h-1 bg-on-surface-variant rounded-full" />
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full" />
                  <div className="w-1 h-1 bg-on-surface-variant rounded-full" />
                </div>
              </button>
              <button
                onClick={() => { setCurrentNestedView(null); setActiveTab('home'); }}
                className="w-7 h-7 rounded-full border-2 border-on-surface-variant/30 flex items-center justify-center hover:bg-surface-container transition-colors active-press"
                title="返回首页"
              >
                <span className="text-[9px] font-bold text-on-surface-variant">✕</span>
              </button>
            </div>
          </div>

          {/* ── MAIN VIEWPORT ── */}
          <div className="flex-1 w-full relative mt-[72px] overflow-hidden">
            {currentNestedView === 'court_details' && (
              <CourtDetailsView
                court={selectedCourtObj}
                onBack={() => setCurrentNestedView(null)}
                onCheckIn={handleCheckIn}
                hasCheckedIn={checkedInCourts.includes(selectedCourtObj.id)}
              />
            )}
            {currentNestedView === 'records' && (
              <MatchRecordsView records={records} onBack={() => setCurrentNestedView(null)} />
            )}
            {currentNestedView === 'settings' && (
              <SettingsView
                customIcons={customIcons}
                onUploadIcon={handleUploadIcon}
                onDeleteIcon={handleDeleteIcon}
                onBack={() => setCurrentNestedView(null)}
                onSelectAvatar={handleSelectAvatar}
              />
            )}
            {!currentNestedView && activeTab === 'home' && (
              <HomeMapView
                courts={courts}
                selectedCourt={selectedCourtObj}
                onSelectCourt={(c) => setActiveCourtId(c.id)}
                onNavigateToCourt={handleNavigateToCourtFromMap}
                customIcons={customIcons}
                onAddCustomCourt={handleAddCustomCourt}
              />
            )}
            {!currentNestedView && activeTab === 'square' && (
              <SquareView
                matchPosts={matchPosts}
                courts={courts}
                onJoinMatch={handleJoinMatch}
                onSelectCourtByName={handleSelectCourtByName}
                onAddMatchPost={handleAddMatchPost}
              />
            )}
            {!currentNestedView && activeTab === 'social' && (
              <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-8 text-center overflow-y-auto no-scrollbar">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-light/10 flex items-center justify-center mb-5">
                  <Flame className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-display font-bold text-on-surface mb-2">社区社交圈建设中</h3>
                <p className="text-sm text-on-surface-variant leading-relaxed max-w-[260px]">
                  支持在场地签到后和球友自动建群，发表训练动态和精彩视频！
                </p>
              </div>
            )}
            {!currentNestedView && activeTab === 'me' && (
              <MeProfileView
                profile={profile}
                achievements={profile.achievements}
                onNavigateToRecords={() => setCurrentNestedView('records')}
                onNavigateToSettings={() => setCurrentNestedView('settings')}
              />
            )}
          </div>

          {/* ── BOTTOM NAV ── */}
          <nav className="h-[72px] border-t border-outline/40 bg-white/95 backdrop-blur-xl flex items-start pt-2 justify-around px-2 z-40 pb-safe">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key && !currentNestedView;
              return (
                <button
                  key={tab.key}
                  onClick={() => { setCurrentNestedView(null); setActiveTab(tab.key as any); }}
                  className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-xl active-press transition-all relative"
                >
                  <span
                    className="material-symbols-outlined text-[22px] transition-all duration-200"
                    style={{
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {tab.icon}
                  </span>
                  {isActive && (
                    <motion.div layoutId="nav-dot" className="w-1 h-1 rounded-full bg-primary" />
                  )}
                  <span className={`text-[10px] font-semibold transition-colors duration-200 ${isActive ? 'text-primary' : 'text-on-surface-muted'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-highlight"
                      className="absolute inset-0 bg-primary/[0.06] rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
