import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Search, Mic, Navigation, Users, AlertCircle, Plus, X } from 'lucide-react';
import { Court, CustomIcon } from '../types';
import { IMAGES } from '../data';

interface HomeMapViewProps {
  courts: Court[];
  selectedCourt: Court | null;
  onSelectCourt: (court: Court) => void;
  onNavigateToCourt: (court: Court) => void;
  customIcons: CustomIcon[];
  onAddCustomCourt: (name: string, lat: number, lng: number, customIconId?: string) => void;
}

const FILTERS = ['全部', '免费', '室内', '有灯光'] as const;

export default function HomeMapView({
  courts, selectedCourt, onSelectCourt, onNavigateToCourt, customIcons, onAddCustomCourt
}: HomeMapViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourtName, setNewCourtName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState<string>('default');
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null);

  const filteredCourts = courts.filter(court => {
    const matchesSearch = court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      court.address.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedFilter === '免费') return court.isFree;
    if (selectedFilter === '室内') return court.features.some(f => f.includes('室内') || court.material.includes('专业'));
    if (selectedFilter === '有灯光') return court.hasLighting;
    return true;
  });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setClickCoords({ lat: y, lng: x });
    setShowAddModal(true);
  };

  const handleCreateCourtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourtName.trim() || !clickCoords) return;
    onAddCustomCourt(newCourtName, clickCoords.lat, clickCoords.lng, selectedIconId === 'default' ? undefined : selectedIconId);
    setNewCourtName(''); setShowAddModal(false); setClickCoords(null);
  };

  return (
    <div className="relative w-full h-full bg-background overflow-y-auto no-scrollbar flex flex-col" id="home-map-container">

      {/* ── MAP BACKGROUND ── */}
      <div
        className="absolute inset-0 w-full bg-cover bg-center cursor-crosshair"
        style={{ backgroundImage: `url(${IMAGES.beijingMap})` }}
        onClick={handleMapClick}
        title="点击地图任意位置可快捷创建自定义乒乓球场"
      >
        {/* Gradient overlay for better UI readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10 pointer-events-none" />

        {/* City label */}
        <div className="absolute top-[16%] left-[55%] pointer-events-none select-none text-center">
          <p className="text-[13px] font-display font-bold text-white/35 tracking-[0.3em] uppercase">Beijing 北京</p>
        </div>

        {/* ── MAP MARKERS ── */}
        {filteredCourts.map((court) => {
          const isSelected = selectedCourt?.id === court.id;
          const hasCustomIcon = customIcons.find(icon => court.id.includes(icon.id) || court.image === icon.dataUrl);

          return (
            <div
              key={court.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              style={{ top: `${court.lat}%`, left: `${court.lng}%` }}
              onClick={(e) => { e.stopPropagation(); onSelectCourt(court); }}
            >
              <div className="relative flex flex-col items-center">
                {/* Floating tooltip */}
                <div className="absolute bottom-[42px] bg-on-surface/90 backdrop-blur text-white text-[11px] font-semibold py-1 px-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none shadow-lg">
                  {court.name}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-on-surface/90 rotate-45" />
                </div>

                {/* Marker pin */}
                {hasCustomIcon ? (
                  <div className={`w-10 h-10 rounded-full overflow-hidden shadow-lg transition-all duration-200 ${
                    isSelected ? 'scale-125 ring-[3px] ring-primary ring-offset-2' : 'ring-2 ring-white hover:scale-110'
                  }`}>
                    <img src={hasCustomIcon.dataUrl} className="w-full h-full object-cover" alt={court.name} referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  <div className={`relative w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                    isSelected
                      ? 'scale-125 bg-primary shadow-primary/50'
                      : 'bg-gradient-to-br from-primary to-primary-light hover:scale-110 ring-2 ring-white'
                  }`}>
                    <span className="material-symbols-outlined text-white text-[18px] font-bold select-none">sports_tennis</span>
                    {isSelected && (
                      <motion.span
                        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 rounded-full bg-primary"
                      />
                    )}
                  </div>
                )}

                {/* Pin shadow */}
                <div className={`w-2 h-1.5 bg-black/20 rounded-full blur-[1px] mt-0.5 transition-all ${isSelected ? 'scale-150' : 'group-hover:scale-125'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="absolute inset-x-0 top-0 p-4 z-30 flex flex-col gap-2.5">
        <div className="w-full bg-white/90 backdrop-blur-xl shadow-elevated border border-white/60 h-12 px-4 rounded-2xl flex items-center gap-3">
          <Search className="w-[18px] h-[18px] text-on-surface-muted flex-shrink-0" />
          <input
            type="text"
            className="bg-transparent border-none flex-1 text-sm text-on-surface placeholder:text-on-surface-muted/60 focus:outline-none"
            placeholder="搜索场地 (例: 朝阳公园 / 奥森)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="w-px h-5 bg-outline" />
          <Mic className="w-[18px] h-[18px] text-primary cursor-pointer hover:scale-110 transition-transform flex-shrink-0" />
        </div>

        {/* ── FILTER CHIPS ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
          {FILTERS.map((chip) => {
            const isAll = chip === '全部';
            const isActive = isAll ? selectedFilter === null : selectedFilter === chip;
            return (
              <button
                key={chip}
                onClick={() => isAll ? setSelectedFilter(null) : setSelectedFilter(chip)}
                className={`flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-primary/20 shadow-md scale-95'
                    : 'bg-white/85 backdrop-blur text-on-surface-variant border-white/40 hover:border-primary/30 hover:text-primary'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAP TIP BADGE ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-[154px] right-4 bg-white/85 backdrop-blur shadow-card border border-outline/20 text-[11px] text-on-surface-variant px-3 py-1.5 rounded-xl flex items-center gap-1.5 z-10"
      >
        <AlertCircle className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium">点击地图创建新球场</span>
      </motion.div>

      {/* ── FLOATING ACTION BUTTONS ── */}
      <div className="absolute right-4 bottom-8 flex flex-col gap-3 z-30">
        <button
          onClick={() => { if (courts.length > 0) onSelectCourt(courts[0]); }}
          className="w-11 h-11 bg-white hover:bg-surface-container-low rounded-2xl shadow-elevated border border-outline/20 flex items-center justify-center text-primary active-press transition-all"
          title="重新定位到主要球场"
        >
          <Navigation className="w-5 h-5" />
        </button>
        <button
          onClick={() => { setClickCoords({ lat: 45 + Math.random() * 10, lng: 45 + Math.random() * 10 }); setShowAddModal(true); }}
          className="w-12 h-12 gradient-primary text-white rounded-2xl shadow-primary flex items-center justify-center active-press transition-all"
          title="新增自定义球场"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      </div>

      {/* ── COURT PREVIEW CARD ── */}
      <div className="absolute inset-x-0 bottom-[90px] p-4 pointer-events-none z-30">
        <AnimatePresence>
          {selectedCourt && (
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: 'spring', damping: 22, stiffness: 150 }}
              className="pointer-events-auto w-full bg-white rounded-2xl shadow-floating border border-outline/10 overflow-hidden"
            >
              <div className="flex">
                {/* Image */}
                <div className="w-28 h-28 flex-none relative overflow-hidden">
                  <img src={selectedCourt.image} className="w-full h-full object-cover" alt={selectedCourt.name} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                  {selectedCourt.isFree && (
                    <span className="absolute top-2 left-2 bg-success text-white font-display text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">免费</span>
                  )}
                  {/* Rating badge */}
                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <span className="material-symbols-outlined text-[11px] text-energy-yellow">star</span>
                    {selectedCourt.rating}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 p-3 flex flex-col justify-between">
                  <div>
                    <h3 className="text-[15px] font-display font-bold text-on-surface truncate leading-tight">{selectedCourt.name}</h3>
                    <p className="text-[11px] text-on-surface-variant truncate mt-0.5">{selectedCourt.address}</p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-on-surface-variant font-medium">
                      <span className="flex items-center gap-1"><Navigation className="w-3 h-3 text-primary" /> {selectedCourt.distanceStr}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-primary">sports_tennis</span> {selectedCourt.courtCount}台</span>
                      <span className="flex items-center gap-1 font-semibold text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />{selectedCourt.activePlayers}人
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigateToCourt(selectedCourt)}
                    className="mt-2 w-full py-2 gradient-primary text-white rounded-xl text-xs font-bold shadow-primary/20 shadow-md active-press transition-all tracking-wide"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── ADD COURT MODAL ── */}
      <AnimatePresence>
        {showAddModal && clickCoords && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-[320px] p-6 shadow-floating border border-outline/10 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-display font-bold text-on-surface">新建球场</h3>
                </div>
                <button onClick={() => { setShowAddModal(false); setClickCoords(null); }} className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-on-surface-variant" />
                </button>
              </div>

              <form onSubmit={handleCreateCourtSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">球场名称</label>
                  <input
                    type="text" required
                    className="w-full bg-surface-container-low rounded-xl border border-outline/30 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-on-surface placeholder:text-on-surface-muted"
                    placeholder="例如: 我家后院、社区活动室..."
                    value={newCourtName}
                    onChange={(e) => setNewCourtName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-2">选择图标</label>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedIconId('default')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        selectedIconId === 'default' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-outline/20 hover:border-primary/30'
                      }`}
                    >
                      <div className="w-7 h-7 gradient-primary rounded-full flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[15px]">sports_tennis</span>
                      </div>
                      <span className="text-[10px] font-semibold text-on-surface-variant">默认</span>
                    </button>
                    {customIcons.filter(icon => icon.type === 'marker').map(icon => (
                      <button
                        key={icon.id} type="button"
                        onClick={() => setSelectedIconId(icon.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          selectedIconId === icon.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-outline/20 hover:border-primary/30'
                        }`}
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden shadow-sm">
                          <img src={icon.dataUrl} className="w-full h-full object-cover" alt={icon.name} referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[10px] font-semibold text-on-surface-variant truncate max-w-[56px]">{icon.name}</span>
                      </button>
                    ))}
                    {customIcons.filter(icon => icon.type === 'marker').length === 0 && (
                      <div className="col-span-3 border border-dashed border-outline/30 rounded-xl p-2 flex items-center justify-center bg-surface-container-lowest">
                        <p className="text-[9px] text-on-surface-muted text-center">在 <span className="text-primary font-semibold">设置</span> 页上传自定义图标</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => { setShowAddModal(false); setClickCoords(null); }} className="flex-1 py-2.5 bg-surface-container-low hover:bg-surface-container rounded-xl text-on-surface-variant font-semibold text-sm active-press transition-all">取消</button>
                  <button type="submit" className="flex-1 py-2.5 gradient-primary text-white rounded-xl font-bold text-sm active-press transition-all shadow-primary/20 shadow-md">生成球场</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
