import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, MapPin, Clock, Users, DollarSign, Plus, CheckCircle, X } from 'lucide-react';
import { MatchPost, Court, LevelType } from '../types';
import { IMAGES } from '../data';

interface SquareViewProps {
  matchPosts: MatchPost[];
  courts: Court[];
  onJoinMatch: (postId: string) => void;
  onSelectCourtByName: (courtName: string) => void;
  onAddMatchPost: (newPost: Omit<MatchPost, 'id' | 'organizerAvatar' | 'organizerName' | 'organizerLevel' | 'joinedCount' | 'participants' | 'status'>) => void;
}

export default function SquareView({
  matchPosts,
  courts,
  onJoinMatch,
  onSelectCourtByName,
  onAddMatchPost
}: SquareViewProps) {
  const [activeTab, setActiveTab] = useState<'recruiting' | 'mine'>('recruiting');
  const [showPostModal, setShowAddPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Post form states
  const [title, setTitle] = useState('');
  const [courtName, setCourtName] = useState(courts[0]?.name || '');
  const [timeStr, setTimeStr] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [feeType, setFeeType] = useState<'AA制' | '免费' | '付费'>('AA制');
  const [feeValue, setFeeValue] = useState(15);
  const [description, setDescription] = useState('');

  // Quick filters
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('全部');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<string>('全部');

  const levels: string[] = ['全部', 'L1 萌新', 'L2 进阶', 'L3 高级', 'Pro 大神'];
  const times: string[] = ['全部', '上午', '下午', '晚间'];

  // Handle post match submit
  const handlePostMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddMatchPost({
      title,
      locationName: courtName,
      timeStr,
      totalCapacity: Number(capacity),
      feeType,
      feeValue: Number(feeValue),
      description
    });

    // Reset fields
    setTitle('');
    setDescription('');
    setTimeStr('');
    setCapacity(4);
    setShowAddPostModal(false);
  };

  // Filter posts
  const filteredPosts = matchPosts.filter(post => {
    // 1. Tab filter
    if (activeTab === 'mine') {
      return post.isJoinedByMe;
    }

    // 2. Search query filter
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 3. Level filter
    if (selectedLevelFilter !== '全部' && post.organizerLevel !== selectedLevelFilter) {
      return false;
    }

    // 4. Time filter
    if (selectedTimeFilter !== '全部') {
      if (selectedTimeFilter === '晚间') {
        return post.timeStr.includes('晚') || post.timeStr.includes('18:') || post.timeStr.includes('19:') || post.timeStr.includes('20:') || post.timeStr.includes('10分钟');
      }
      if (selectedTimeFilter === '上午') {
        return post.timeStr.includes('早') || post.timeStr.includes('08:') || post.timeStr.includes('09:') || post.timeStr.includes('10:') || post.timeStr.includes('11:');
      }
      if (selectedTimeFilter === '下午') {
        return post.timeStr.includes('午') || post.timeStr.includes('13:') || post.timeStr.includes('14:') || post.timeStr.includes('15:') || post.timeStr.includes('16:') || post.timeStr.includes('17:');
      }
    }

    return true;
  });

  return (
    <div className="relative w-full h-full bg-background flex flex-col pt-14 pb-20 overflow-y-auto no-scrollbar" id="square-view-container">
      {/* Search Input on header row */}
      <div className="px-4 pt-3 flex gap-2">
        <div className="flex-1 bg-surface-container rounded-xl px-3 py-2 flex items-center gap-2 border border-outline/5 shadow-soft">
          <Search className="w-4 h-4 text-on-surface-variant/70" />
          <input
            type="text"
            className="bg-transparent border-none text-xs flex-1 text-on-surface focus:outline-none placeholder:text-on-surface-variant/40"
            placeholder="搜索约球标题、场地、人名"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-surface-variant mb-4 sticky top-0 bg-background/95 backdrop-blur z-30 px-4">
        <button
          onClick={() => setActiveTab('recruiting')}
          className={`relative py-3 flex-1 text-center font-headline-md text-[15px] font-bold transition-all ${
            activeTab === 'recruiting' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          正在招募
          {activeTab === 'recruiting' && (
            <motion.div layoutId="tab-indicator" className="active-tab-indicator" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('mine')}
          className={`relative py-3 flex-1 text-center font-headline-md text-[15px] font-bold transition-all ${
            activeTab === 'mine' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          我的约球
          {activeTab === 'mine' && (
            <motion.div layoutId="tab-indicator" className="active-tab-indicator" />
          )}
        </button>
      </div>

      {/* Filter Chips Bar */}
      <section className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar flex-shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container rounded-full border border-outline/10 text-[11px] font-bold text-on-surface-variant whitespace-nowrap">
          <Filter className="w-3.5 h-3.5 text-primary" />
          <span>筛选</span>
        </div>

        {/* Level Filters Select */}
        <select
          value={selectedLevelFilter}
          onChange={(e) => setSelectedLevelFilter(e.target.value)}
          className="px-3 py-1 bg-primary-container/10 text-primary border border-primary/20 rounded-full text-[11px] font-bold focus:outline-none"
        >
          {levels.map(lvl => (
            <option key={lvl} value={lvl} className="bg-white text-on-surface">{lvl === '全部' ? '水平: 全部' : lvl}</option>
          ))}
        </select>

        {/* Time Filters Select */}
        <select
          value={selectedTimeFilter}
          onChange={(e) => setSelectedTimeFilter(e.target.value)}
          className="px-3 py-1 bg-surface-container text-on-surface-variant border border-outline/10 rounded-full text-[11px] font-bold focus:outline-none"
        >
          {times.map(t => (
            <option key={t} value={t} className="bg-white text-on-surface">{t === '全部' ? '时间: 全部' : `时间: ${t}`}</option>
          ))}
        </select>
      </section>

      {/* MATCH POSTS LIST */}
      <div className="flex flex-col gap-4 px-4 flex-1">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[64px] text-on-surface-variant/20 select-none">
              sports_tennis
            </span>
            <p className="text-sm font-bold text-on-surface-variant/60">
              {activeTab === 'mine' ? '您还没有发布或参加过约球哦' : '没有找到符合条件的招募信息'}
            </p>
            <p className="text-xs text-on-surface-variant/40">点击右下角“发布约球”立即发起一局！</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isFull = post.joinedCount >= post.totalCapacity;
            const isOneLeft = post.totalCapacity - post.joinedCount === 1;

            return (
              <article
                key={post.id}
                className="bg-surface-container-lowest rounded-2xl p-4 shadow-soft border border-outline/5 relative overflow-hidden active:scale-[0.99] transition-transform"
              >
                {/* Status Indicator Tag */}
                <div
                  className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-extrabold rounded-bl-xl uppercase tracking-wider text-white ${
                    isFull
                      ? 'bg-on-surface-variant'
                      : isOneLeft
                      ? 'bg-warning-full'
                      : 'bg-success-recruiting'
                  }`}
                >
                  {isFull ? '已满员' : isOneLeft ? '最后1席' : '招募中'}
                </div>

                <div className="flex items-start gap-3">
                  {/* Organizer Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      src={post.organizerAvatar}
                      alt={post.organizerName}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Organizer Meta */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-on-surface text-sm">{post.organizerName}</span>
                      <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[9px] rounded font-extrabold font-mono">
                        {post.organizerLevel}
                      </span>
                    </div>

                    {/* Post Title */}
                    <h2 className="text-headline-md font-bold mb-2 leading-snug text-base text-on-surface">
                      {post.title}
                    </h2>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mb-4">
                      {/* Location clickable to jump to map */}
                      <div 
                        onClick={() => onSelectCourtByName(post.locationName)}
                        className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer group"
                      >
                        <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xs truncate font-medium underline decoration-dotted">{post.locationName}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-xs truncate font-medium">{post.timeStr}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-xs truncate font-medium">
                          缺{post.totalCapacity - post.joinedCount}人 ({post.joinedCount}/{post.totalCapacity})
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-xs truncate font-medium">
                          {post.feeType} {post.feeValue > 0 ? `¥${post.feeValue}` : ''}
                        </span>
                      </div>
                    </div>

                    {/* Sub Row: Participant Avatars + Join Button */}
                    <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                      <div className="flex -space-x-2.5">
                        {post.participants.map((avatar, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm"
                          >
                            <img
                              className="w-full h-full object-cover"
                              src={avatar}
                              alt="participant"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ))}
                        {post.totalCapacity - post.joinedCount > 0 && (
                          <div className="w-8 h-8 rounded-full border-2 border-white bg-surface-container-high flex items-center justify-center text-[10px] text-on-surface-variant font-bold">
                            +{post.totalCapacity - post.joinedCount}
                          </div>
                        )}
                      </div>

                      {isFull ? (
                        <button
                          disabled
                          className="bg-surface-variant text-on-surface-variant px-5 py-1.5 rounded-xl font-bold text-xs cursor-not-allowed"
                        >
                          人数已满
                        </button>
                      ) : post.isJoinedByMe ? (
                        <button
                          disabled
                          className="bg-wechat-green/10 text-wechat-green px-5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-default"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>已参加</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onJoinMatch(post.id)}
                          className="bg-primary hover:bg-primary/95 text-white px-5 py-1.5 rounded-xl font-extrabold text-xs shadow-md shadow-primary/20 active:scale-95 transition-all cursor-pointer"
                        >
                          立即加入
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* QUICK POST BUTTON (FAB) */}
      <button
        onClick={() => setShowAddPostModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-container hover:bg-primary-container/95 text-white rounded-full flex flex-col items-center justify-center shadow-lg active:scale-90 transition-all z-40"
        title="发布约球"
      >
        <Plus className="w-7 h-7 font-bold" />
        <span className="text-[9px] font-bold -mt-1 font-sans">发布约球</span>
      </button>

      {/* RECRUITMENT POST OVERLAY MODAL */}
      <AnimatePresence>
        {showPostModal && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-y-auto p-6 shadow-2xl border border-outline/10 flex flex-col gap-4 no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-surface-container pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl font-bold select-none">
                    sports_tennis
                  </span>
                  <h3 className="text-headline-md font-bold text-on-surface text-lg">发布我的约球局</h3>
                </div>
                <button
                  onClick={() => setShowAddPostModal(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container transition-colors"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <form onSubmit={handlePostMatchSubmit} className="space-y-4 text-left">
                {/* Post Title */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 font-sans">
                    约球口号 / 标题
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={30}
                    className="w-full bg-surface-container rounded-xl border-none px-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary"
                    placeholder="例: 有水平中等的朋友切磋一下吗？"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Court Location */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 font-sans">
                    选择球场
                  </label>
                  <select
                    value={courtName}
                    onChange={(e) => setCourtName(e.target.value)}
                    className="w-full bg-surface-container rounded-xl border-none px-4 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    {courts.map(court => (
                      <option key={court.id} value={court.name}>{court.name}</option>
                    ))}
                  </select>
                </div>

                {/* Time Str */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 font-sans">
                    约球时间
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full bg-surface-container rounded-xl border-none px-4 py-2.5 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary"
                    placeholder="例: 今天 19:00 或 本周六下午"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                  />
                </div>

                {/* Capacity & Fee row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1 font-sans">
                      最大人数
                    </label>
                    <input
                      type="number"
                      required
                      min={2}
                      max={12}
                      className="w-full bg-surface-container rounded-xl border-none px-4 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary"
                      value={capacity}
                      onChange={(e) => setCapacity(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1 font-sans">
                      费用机制
                    </label>
                    <select
                      value={feeType}
                      onChange={(e) => setFeeType(e.target.value as any)}
                      className="w-full bg-surface-container rounded-xl border-none px-4 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="AA制">AA制</option>
                      <option value="免费">免费</option>
                      <option value="付费">定额付费</option>
                    </select>
                  </div>
                </div>

                {/* Fee Value if Paid/AA */}
                {feeType !== '免费' && (
                  <div>
                    <label className="block text-xs font-bold text-on-surface-variant mb-1 font-sans">
                      人均费用 (元)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className="w-full bg-surface-container rounded-xl border-none px-4 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary"
                      value={feeValue}
                      onChange={(e) => setFeeValue(Number(e.target.value))}
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1 font-sans">
                    详情补充
                  </label>
                  <textarea
                    className="w-full bg-surface-container rounded-xl border-none px-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary h-20 resize-none"
                    placeholder="可以写一下个人水平、对用球的要求，或者找几个球友等..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddPostModal(false)}
                    className="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface-variant font-bold text-xs active:scale-95 transition-all font-sans"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary hover:bg-primary/95 text-white rounded-xl font-bold text-xs active:scale-95 transition-all shadow-md shadow-primary/10 font-sans"
                  >
                    确认发布
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
