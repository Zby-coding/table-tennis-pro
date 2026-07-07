import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, ShieldAlert, Sparkles, HelpCircle, Upload, Flame, Heart } from 'lucide-react';
import { Court, MatchPost, UserProfile, GameRecord, CustomIcon, LevelType, Achievement } from '../types';
import { IMAGES, INITIAL_COURTS, INITIAL_MATCH_POSTS, INITIAL_USER_PROFILE, INITIAL_GAME_RECORDS, INITIAL_CUSTOM_ICONS } from '../data';

// Sub Views
import HomeMapView from './HomeMapView';
import SquareView from './SquareView';
import CourtDetailsView from './CourtDetailsView';
import MatchRecordsView from './MatchRecordsView';
import SettingsView from './SettingsView';
import MeProfileView from './MeProfileView';

export default function WechatContainer() {
  // App Global State (re-renders reactive components)
  const [courts, setCourts] = useState<Court[]>(INITIAL_COURTS);
  const [matchPosts, setMatchPosts] = useState<MatchPost[]>(INITIAL_MATCH_POSTS);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [records, setRecords] = useState<GameRecord[]>(INITIAL_GAME_RECORDS);
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>(INITIAL_CUSTOM_ICONS);
  const [checkedInCourts, setCheckedInCourts] = useState<string[]>([]); // list of court IDs checked into

  // Navigation state (WeChat Simulator routing)
  const [activeTab, setActiveTab] = useState<'home' | 'square' | 'social' | 'me'>('home');
  const [viewHistory, setViewHistory] = useState<string[]>([]);
  const [currentNestedView, setCurrentNestedView] = useState<'court_details' | 'records' | 'settings' | null>(null);
  const [activeCourtId, setActiveCourtId] = useState<string | null>(null);

  // Global Drag and Drop state
  const [globalDragActive, setGlobalDragActive] = useState(false);
  const [currentLocalTime, setCurrentLocalTime] = useState('20:12');

  // File states pushed from global drag drop to settings
  const [pendingDroppedFile, setPendingDroppedFile] = useState<{
    base64: string;
    name: string;
    size: number;
    type: string;
  } | null>(null);

  // Update mock time every minute
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

  // Global Drag and Drop handlers
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
            // Auto navigate to settings view where custom file form is handled
            setCurrentNestedView('settings');
            setActiveTab('me');
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Actions
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
    // Increment active players on that court
    setCourts(prevCourts => prevCourts.map(c => {
      if (c.id === courtId) {
        return { ...c, activePlayers: c.activePlayers + 1 };
      }
      return c;
    }));
    // Award achievement points
    setProfile(p => ({
      ...p,
      hoursPlayed: p.hoursPlayed + 2,
      points: p.points + 25
    }));
  };

  const handleAddCustomCourt = (name: string, lat: number, lng: number, customIconId?: string) => {
    const iconObj = customIcons.find(icon => icon.id === customIconId);
    const newCourt: Court = {
      id: `custom_court_${Date.now()}`,
      name,
      isFree: true,
      activePlayers: 1,
      distanceStr: '1.5km',
      courtCount: 2,
      material: '户外硅PU',
      hasLighting: false,
      openHours: '08:00-21:00',
      image: iconObj ? iconObj.dataUrl : IMAGES.chaoyangPreview,
      galleryImages: [iconObj ? iconObj.dataUrl : IMAGES.chaoyangPreview, IMAGES.courtCloseup],
      lat,
      lng,
      rating: 5.0,
      address: '自定义创建地图场地',
      features: ['我自定义创建', '使用自定义地图标记'],
      reviews: []
    };
    setCourts([...courts, newCourt]);
  };

  const handleUploadIcon = (name: string, dataUrl: string, type: 'marker' | 'badge' | 'avatar', fileSize: number, fileType: string) => {
    const newIcon: CustomIcon = {
      id: `custom_icon_${Date.now()}`,
      name,
      dataUrl,
      type,
      fileSize,
      fileType,
      createdAt: new Date().toISOString()
    };
    setCustomIcons([newIcon, ...customIcons]);

    // If type is badge, unlock achievement
    if (type === 'badge') {
      const newAchievement: Achievement = {
        id: `custom_ach_${Date.now()}`,
        name,
        desc: '自定义拖拽图片生成获得的荣誉勋章！',
        icon: 'verified',
        color: 'bg-primary-container text-white',
        unlocked: true
      };
      setProfile(p => ({
        ...p,
        achievements: [newAchievement, ...p.achievements]
      }));
    }
  };

  const handleDeleteIcon = (id: string) => {
    setCustomIcons(customIcons.filter(icon => icon.id !== id));
  };

  const handleSelectAvatar = (avatarUrl: string) => {
    setProfile(p => ({ ...p, avatarUrl }));
  };

  const selectedCourtObj = courts.find(c => c.id === activeCourtId) || courts[0];

  return (
    <div className="w-full min-h-screen bg-slate-50 flex items-center justify-center p-4 py-8 font-sans antialiased text-on-surface select-none">
      
      {/* SIMULATOR TWO-COLUMN DESKTOP SCREEN LAYOUT */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN: WECHAT SIMULATOR CONTAINER FRAME */}
        <div 
          className="lg:col-span-7 flex justify-center"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Mock Physical Smartphone Frame */}
          <div className="relative w-[375px] h-[812px] bg-background rounded-[40px] shadow-[0_24px_50px_rgba(0,0,0,0.15)] border-[8px] border-on-background overflow-hidden flex flex-col transition-all duration-300">
            
            {/* SMARTPHONE SENSORS NOTCH */}
            <div className="absolute top-0 inset-x-0 h-6 bg-black z-[100] flex justify-center items-center rounded-b-2xl">
              <div className="w-32 h-3.5 bg-black rounded-b-xl flex justify-center gap-1.5 items-center">
                {/* Speaker */}
                <div className="w-12 h-1 bg-zinc-800 rounded-full" />
                {/* Camera lens */}
                <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full border border-zinc-800" />
              </div>
            </div>

            {/* STATUS BAR */}
            <div className="absolute top-0 inset-x-0 h-10 px-6 flex justify-between items-center z-50 text-[10px] font-bold font-sans text-on-surface-variant select-none pointer-events-none bg-surface/10 backdrop-blur-[1px]">
              {/* Local Clock */}
              <span>{currentLocalTime}</span>
              {/* Phone hardware stats */}
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[12px] font-bold">signal_cellular_4_bar</span>
                <span className="material-symbols-outlined text-[12px] font-bold">wifi</span>
                <span className="material-symbols-outlined text-[12px] font-bold">battery_full_alt</span>
              </div>
            </div>

            {/* GLOBAL DND OVERLAY HUD */}
            <AnimatePresence>
              {globalDragActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-primary/90 backdrop-blur-sm z-[200] flex flex-col items-center justify-center text-center p-8 text-white gap-4 pointer-events-none"
                >
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border-2 border-dashed border-white"
                  >
                    <Upload className="w-10 h-10 text-white" />
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-bold">释放鼠标即可上传！</h2>
                    <p className="text-xs opacity-80 mt-1">
                      上传的图片将被立即导入到您的自定义图标/头像存储中
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* WECHAT MINI-PROGRAM TOP HEADER BAR */}
            <div className="absolute top-6 inset-x-0 h-12 bg-white/95 backdrop-blur shadow-sm border-b border-surface-container flex justify-between items-center px-4 z-40">
              {/* Back Button for nested views */}
              <div className="flex items-center gap-2">
                {currentNestedView && (
                  <button 
                    onClick={() => {
                      setCurrentNestedView(null);
                    }}
                    className="p-1 active:scale-90 transition-transform rounded-full hover:bg-surface-container text-on-surface"
                  >
                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                  </button>
                )}
                <span className="text-xs font-extrabold text-on-surface tracking-wide truncate max-w-[140px] font-sans">
                  {currentNestedView === 'court_details' 
                    ? selectedCourtObj.name 
                    : currentNestedView === 'records'
                    ? '战绩排行统计'
                    : currentNestedView === 'settings'
                    ? '系统设置'
                    : activeTab === 'home'
                    ? '球馆地图探索'
                    : activeTab === 'square'
                    ? '约球广场'
                    : activeTab === 'social'
                    ? '打球社交圈'
                    : '我的乒协名片'
                  }
                </span>
              </div>

              {/* WeChat mini-program right pill actions (three dots & close circle) */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1 px-2.5 shadow-sm text-on-surface-variant flex-shrink-0">
                {/* Three dots menu */}
                <button className="hover:opacity-80 active:scale-95 transition-transform" title="分享或反馈">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-1 bg-current rounded-full" />
                    <div className="w-1.5 h-1.5 bg-current rounded-full" />
                    <div className="w-1 h-1 bg-current rounded-full" />
                  </div>
                </button>
                <div className="w-[1px] h-3 bg-slate-200" />
                {/* Close circle */}
                <button 
                  onClick={() => {
                    setCurrentNestedView(null);
                    setActiveTab('home');
                  }}
                  className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center p-0.5 text-[8px] font-bold font-sans hover:opacity-80 active:scale-95 transition-transform" 
                  title="返回首页"
                >
                  ✖
                </button>
              </div>
            </div>

            {/* MAIN ROUTED VIEWS VIEWPORT CONTAINER */}
            <div className="flex-1 w-full relative">
              
              {/* NESTED VIEW: COURT DETAILS (if active) */}
              {currentNestedView === 'court_details' && (
                <CourtDetailsView
                  court={selectedCourtObj}
                  onBack={() => setCurrentNestedView(null)}
                  onCheckIn={handleCheckIn}
                  hasCheckedIn={checkedInCourts.includes(selectedCourtObj.id)}
                />
              )}

              {/* NESTED VIEW: GAME RECORDS */}
              {currentNestedView === 'records' && (
                <MatchRecordsView
                  records={records}
                  onBack={() => setCurrentNestedView(null)}
                />
              )}

              {/* NESTED VIEW: SETTINGS */}
              {currentNestedView === 'settings' && (
                <SettingsView
                  customIcons={customIcons}
                  onUploadIcon={handleUploadIcon}
                  onDeleteIcon={handleDeleteIcon}
                  onBack={() => setCurrentNestedView(null)}
                  onSelectAvatar={handleSelectAvatar}
                />
              )}

              {/* BASE TAB CHANNELS */}
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
                <div className="absolute inset-0 bg-background flex flex-col items-center justify-center p-8 text-center pt-16">
                  <Flame className="w-12 h-12 text-primary animate-pulse" />
                  <h3 className="font-bold text-on-surface mt-3 text-base">社区社交圈建设中</h3>
                  <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                    支持在场地签到打完卡之后，和现场的球友自动匹配组建临时群聊，发表即时训练动态和精彩扣杀视频！
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

            {/* BOTTOM NAV BAR */}
            <nav className="h-16 border-t border-surface-container bg-white flex justify-around items-center px-2 pb-safe-bottom z-40">
              
              {/* Home */}
              <button
                onClick={() => {
                  setCurrentNestedView(null);
                  setActiveTab('home');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  activeTab === 'home' && !currentNestedView
                    ? 'text-primary scale-105 font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'home' && !currentNestedView ? "'FILL' 1" : "'FILL' 0" }}>
                  map
                </span>
                <span className="text-[9px] font-label-caps tracking-wide mt-0.5">首页</span>
              </button>

              {/* Square */}
              <button
                onClick={() => {
                  setCurrentNestedView(null);
                  setActiveTab('square');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  activeTab === 'square' && !currentNestedView
                    ? 'text-primary scale-105 font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'square' && !currentNestedView ? "'FILL' 1" : "'FILL' 0" }}>
                  sports_tennis
                </span>
                <span className="text-[9px] font-label-caps tracking-wide mt-0.5">广场</span>
              </button>

              {/* Social */}
              <button
                onClick={() => {
                  setCurrentNestedView(null);
                  setActiveTab('social');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  activeTab === 'social' && !currentNestedView
                    ? 'text-primary scale-105 font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'social' && !currentNestedView ? "'FILL' 1" : "'FILL' 0" }}>
                  emoji_events
                </span>
                <span className="text-[9px] font-label-caps tracking-wide mt-0.5">社交</span>
              </button>

              {/* Me */}
              <button
                onClick={() => {
                  setCurrentNestedView(null);
                  setActiveTab('me');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-full transition-all ${
                  activeTab === 'me' && !currentNestedView
                    ? 'text-primary scale-105 font-bold'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: activeTab === 'me' && !currentNestedView ? "'FILL' 1" : "'FILL' 0" }}>
                  person
                </span>
                <span className="text-[9px] font-label-caps tracking-wide mt-0.5">我的</span>
              </button>
            </nav>

          </div>
        </div>

      </div>

    </div>
  );
}
