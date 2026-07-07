import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Search, Mic, SlidersHorizontal, Navigation, Users, HelpCircle, AlertCircle, Plus } from 'lucide-react';
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

export default function HomeMapView({
  courts,
  selectedCourt,
  onSelectCourt,
  onNavigateToCourt,
  customIcons,
  onAddCustomCourt
}: HomeMapViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCourtName, setNewCourtName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState<string>('default');
  
  // Local coordinates to place on map for click placement
  const [clickCoords, setClickCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Filter courts based on query and chips
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
    // Determine click percentages relative to the map container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Set coordinates and show add modal
    setClickCoords({ lat: y, lng: x });
    setShowAddModal(true);
  };

  const handleCreateCourtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourtName.trim() || !clickCoords) return;
    onAddCustomCourt(
      newCourtName, 
      clickCoords.lat, 
      clickCoords.lng, 
      selectedIconId === 'default' ? undefined : selectedIconId
    );
    setNewCourtName('');
    setShowAddModal(false);
    setClickCoords(null);
  };

  return (
    <div className="relative w-full h-full bg-[#E5E9EC] overflow-hidden flex flex-col" id="home-map-container">
      {/* Mock Map Background Canvas */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center cursor-crosshair transition-all duration-300"
        style={{ backgroundImage: `url(${IMAGES.beijingMap})` }}
        onClick={handleMapClick}
        title="点击地图任意位置可快捷创建自定义乒乓球场！"
      >
        {/* Beijing central coordinate label helper */}
        <div className="absolute top-[18%] left-[55%] pointer-events-none select-none text-center">
          <p className="text-[12px] font-bold text-on-surface/30 tracking-widest font-sans uppercase">Beijing 北京市</p>
        </div>

        {/* Render simulated Map Pins/Markers */}
        {filteredCourts.map((court) => {
          const isSelected = selectedCourt?.id === court.id;
          
          // Check if this court uses a custom-uploaded icon
          // Custom icon IDs are formatted as custom_icon_{id} or we can store matching reference
          const hasCustomIcon = customIcons.find(icon => court.id.includes(icon.id) || court.image === icon.dataUrl);

          return (
            <div
              key={court.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
              style={{ top: `${court.lat}%`, left: `${court.lng}%` }}
              onClick={(e) => {
                e.stopPropagation(); // Prevent trigger map click
                onSelectCourt(court);
              }}
            >
              <div className="relative flex flex-col items-center">
                {/* Visual tooltip */}
                <div className="absolute bottom-9 bg-on-surface text-surface text-[10px] py-0.5 px-2 rounded shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold">
                  {court.name}
                </div>

                {hasCustomIcon ? (
                  // Custom Dragged-and-dropped Icon Pin
                  <div className={`w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-lg transition-transform duration-200 ${isSelected ? 'scale-125 ring-2 ring-primary ring-offset-1' : 'hover:scale-110'}`}>
                    <img src={hasCustomIcon.dataUrl} className="w-full h-full object-cover" alt={court.name} referrerPolicy="no-referrer" />
                  </div>
                ) : (
                  // Default High-Contrast Ping Pong Pin
                  <div className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg transition-all duration-200 ${
                    isSelected 
                      ? 'bg-primary scale-125 shadow-primary/40' 
                      : 'bg-ball-orange hover:scale-110 hover:shadow-orange-400/30'
                  }`}>
                    <span className="material-symbols-outlined text-white text-[18px] font-bold select-none">
                      sports_tennis
                    </span>
                    {/* Pulsing indicator for selected pins */}
                    {isSelected && (
                      <span className="absolute -inset-1 rounded-full border border-primary animate-ping opacity-75" />
                    )}
                  </div>
                )}
                
                {/* Pin Shadow Slant */}
                <div className="w-2 h-1 bg-black/25 rounded-full blur-[1px] mt-1 group-hover:scale-150 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* FLOATING UI OVERLAYS */}
      <div className="absolute inset-x-0 top-0 p-4 pointer-events-none flex flex-col gap-3 z-30 mt-14">
        {/* Search Bar */}
        <div className="pointer-events-auto w-full bg-white/95 backdrop-blur shadow-soft border border-outline/10 h-12 px-4 rounded-xl flex items-center gap-3">
          <Search className="w-5 h-5 text-on-surface-variant flex-shrink-0" />
          <input
            type="text"
            className="bg-transparent border-none flex-1 text-on-surface text-body-lg focus:outline-none placeholder:text-on-surface-variant/70 text-sm"
            placeholder="搜索场地 (例: 朝阳公园/奥森)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Mic className="w-4 h-4 text-on-surface-variant cursor-pointer hover:text-primary transition-colors flex-shrink-0" />
        </div>

        {/* Filter Chips row */}
        <div className="pointer-events-auto flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['全部', '免费', '室内', '有灯光'].map((chip) => {
            const isAll = chip === '全部';
            const isActive = isAll ? selectedFilter === null : selectedFilter === chip;
            return (
              <button
                key={chip}
                onClick={() => isAll ? setSelectedFilter(null) : setSelectedFilter(chip)}
                className={`flex-none px-4 py-1.5 rounded-full text-label-caps font-label-caps transition-all duration-200 border text-[11px] ${
                  isActive
                    ? 'bg-primary text-white border-primary shadow-sm shadow-primary/20 scale-95'
                    : 'bg-white/90 backdrop-blur text-on-surface-variant border-outline/10 hover:bg-white'
                }`}
              >
                {chip}
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Interactive Tip Box */}
      <div className="absolute top-[136px] right-4 bg-white/80 backdrop-blur shadow-sm border border-outline/10 text-[10px] text-on-surface-variant px-3 py-1.5 rounded-lg flex items-center gap-1.5 pointer-events-none z-10 animate-pulse">
        <AlertCircle className="w-3.5 h-3.5 text-primary" />
        <span>点击地图可自定义创建新球场</span>
      </div>

      {/* Floating Action Button for Location or Direct Add */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-3 z-30">
        <button 
          onClick={() => {
            // Find default court 1 or first court to focus
            if (courts.length > 0) {
              onSelectCourt(courts[0]);
            }
          }}
          className="w-11 h-11 bg-white hover:bg-surface-container rounded-full shadow-lg border border-outline/10 flex items-center justify-center text-primary active:scale-95 transition-all"
          title="重新定位到主要球场"
        >
          <Navigation className="w-5 h-5 fill-current" />
        </button>

        <button 
          onClick={() => {
            // Default random coordinates near center
            setClickCoords({ lat: 45 + Math.random() * 10, lng: 45 + Math.random() * 10 });
            setShowAddModal(true);
          }}
          className="w-11 h-11 bg-primary hover:bg-primary/95 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-all"
          title="新增自定义球场"
        >
          <Plus className="w-6 h-6 font-bold" />
        </button>
      </div>

      {/* SLIDE-UP COURT DETAIL PREVIEW CARD */}
      <div className="absolute inset-x-0 bottom-16 p-4 pointer-events-none z-30">
        <AnimatePresence>
          {selectedCourt && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 20, stiffness: 120 }}
              className="pointer-events-auto w-full bg-white rounded-xl shadow-lg border border-outline/10 p-4 flex gap-4"
            >
              <div className="w-24 h-24 rounded-lg bg-surface-container-high flex-none overflow-hidden relative">
                <img
                  src={selectedCourt.image}
                  className="w-full h-full object-cover"
                  alt={selectedCourt.name}
                  referrerPolicy="no-referrer"
                />
                {selectedCourt.isFree && (
                  <span className="absolute top-1 left-1 bg-success-recruiting text-white font-label-caps text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                    免费
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-0.5">
                    <h3 className="text-headline-md font-bold text-on-surface truncate text-base">
                      {selectedCourt.name}
                    </h3>
                  </div>
                  <p className="text-body-sm text-on-surface-variant truncate text-xs mb-1.5">
                    {selectedCourt.address}
                  </p>
                  
                  <div className="flex items-center gap-3 text-on-surface-variant text-[11px] mb-2 font-mono">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-primary transform rotate-45" />
                      {selectedCourt.distanceStr}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-primary">sports_tennis</span>
                      {selectedCourt.courtCount}张球台
                    </span>
                    <span className="flex items-center gap-1 font-sans">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-wechat-green mr-0.5 animate-pulse" />
                      在打 {selectedCourt.activePlayers}人
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-surface-container">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-500">
                      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    </div>
                    <span className="text-[11px] font-bold text-on-surface">{selectedCourt.rating}</span>
                    <span className="text-[10px] text-on-surface-variant">({selectedCourt.reviews.length}评价)</span>
                  </div>

                  <button
                    onClick={() => onNavigateToCourt(selectedCourt)}
                    className="bg-primary hover:bg-primary/95 text-white px-4 py-1.5 rounded-lg text-label-caps font-bold text-xs shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer"
                  >
                    查看详情
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QUICK ADD CUSTOM COURT MODAL */}
      <AnimatePresence>
        {showAddModal && clickCoords && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-outline/10 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 border-b border-surface-container pb-3">
                <MapPin className="text-primary w-6 h-6" />
                <h3 className="text-headline-md font-bold text-on-surface text-lg">新建自定义乒乓球场</h3>
              </div>

              <form onSubmit={handleCreateCourtSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 font-sans">
                    球场名称
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container rounded-xl border-none px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary text-on-surface placeholder:text-on-surface-variant/40"
                    placeholder="例如: 我家后院、社区活动室..."
                    value={newCourtName}
                    onChange={(e) => setNewCourtName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2 font-sans">
                    选择地图大头针图标
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {/* Default pin icon */}
                    <button
                      type="button"
                      onClick={() => setSelectedIconId('default')}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 justify-center transition-all ${
                        selectedIconId === 'default'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline/15 text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <div className="w-6 h-6 bg-ball-orange rounded-full flex items-center justify-center text-white">
                        <span className="material-symbols-outlined text-[14px]">sports_tennis</span>
                      </div>
                      <span className="text-[9px] font-sans font-bold">默认</span>
                    </button>

                    {/* Custom Uploaded Pin Icons */}
                    {customIcons.filter(icon => icon.type === 'marker').map(icon => (
                      <button
                        key={icon.id}
                        type="button"
                        onClick={() => setSelectedIconId(icon.id)}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1 justify-center transition-all ${
                          selectedIconId === icon.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-outline/15 text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-sm">
                          <img src={icon.dataUrl} className="w-full h-full object-cover" alt={icon.name} referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-[9px] font-sans font-bold truncate max-w-full px-0.5">{icon.name}</span>
                      </button>
                    ))}

                    {/* Placeholder helper if no custom marker icons are uploaded */}
                    {customIcons.filter(icon => icon.type === 'marker').length === 0 && (
                      <div className="col-span-3 border border-dashed border-outline/20 rounded-xl p-2 flex items-center justify-center text-center bg-surface-container-lowest">
                        <p className="text-[8px] text-on-surface-variant leading-tight">
                          您可以在 <span className="font-bold text-primary">设置</span> 页面拖拽上传您自己的自定义图标图片！
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setClickCoords(null);
                    }}
                    className="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface-variant font-bold text-xs active:scale-95 transition-all font-sans"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-xs active:scale-95 transition-all shadow-md shadow-primary/10 font-sans"
                  >
                    生成球场
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
