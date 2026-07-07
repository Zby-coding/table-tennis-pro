import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, Search, MapPin, Clock, Users, DollarSign, Plus, CheckCircle, X, Flame } from 'lucide-react';
import { MatchPost, Court } from '../types';

interface SquareViewProps {
  matchPosts: MatchPost[];
  courts: Court[];
  onJoinMatch: (postId: string) => void;
  onSelectCourtByName: (courtName: string) => void;
  onAddMatchPost: (newPost: Omit<MatchPost, 'id' | 'organizerAvatar' | 'organizerName' | 'organizerLevel' | 'joinedCount' | 'participants' | 'status'>) => void;
}

export default function SquareView({ matchPosts, courts, onJoinMatch, onSelectCourtByName, onAddMatchPost }: SquareViewProps) {
  const [activeTab, setActiveTab] = useState<'recruiting' | 'mine'>('recruiting');
  const [showPostModal, setShowAddPostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [courtName, setCourtName] = useState(courts[0]?.name || '');
  const [timeStr, setTimeStr] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [feeType, setFeeType] = useState<'AA制' | '免费' | '付费'>('AA制');
  const [feeValue, setFeeValue] = useState(15);
  const [description, setDescription] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('全部');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('全部');

  const levels = ['全部', 'L1 萌新', 'L2 进阶', 'L3 高级', 'Pro 大神'];
  const times = ['全部', '上午', '下午', '晚间'];

  const handlePostMatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddMatchPost({ title, locationName: courtName, timeStr, totalCapacity: Number(capacity), feeType, feeValue: Number(feeValue), description });
    setTitle(''); setDescription(''); setTimeStr(''); setCapacity(4); setShowAddPostModal(false);
  };

  const filteredPosts = matchPosts.filter(post => {
    if (activeTab === 'mine') return post.isJoinedByMe;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.organizerName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedLevelFilter !== '全部' && post.organizerLevel !== selectedLevelFilter) return false;
    if (selectedTimeFilter === '晚间') return post.timeStr.includes('晚') || post.timeStr.includes('18:') || post.timeStr.includes('19:') || post.timeStr.includes('20:') || post.timeStr.includes('10分钟');
    if (selectedTimeFilter === '上午') return post.timeStr.includes('早') || /0[8-9]:|1[0-1]:/.test(post.timeStr);
    if (selectedTimeFilter === '下午') return post.timeStr.includes('午') || /1[3-7]:/.test(post.timeStr);
    return true;
  });

  return (
    <div className="relative w-full h-full bg-background flex flex-col pt-0 pb-0 overflow-y-auto no-scrollbar" id="square-view-container">
      {/* ── SEARCH ── */}
      <div className="px-4 pt-3 flex gap-2">
        <div className="flex-1 bg-white rounded-2xl px-3 py-2.5 flex items-center gap-2 shadow-card border border-outline/10">
          <Search className="w-4 h-4 text-on-surface-muted" />
          <input
            type="text"
            className="bg-transparent border-none text-sm flex-1 text-on-surface focus:outline-none placeholder:text-on-surface-muted/50"
            placeholder="搜索约球标题、场地、人名"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── TAB SWITCHER ── */}
      <div className="flex border-b border-outline/30 mb-3 sticky top-0 bg-background/95 backdrop-blur z-30 px-4">
        {(['recruiting', 'mine'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative py-3 flex-1 text-center font-display text-base font-bold transition-all ${
              activeTab === tab ? 'text-primary' : 'text-on-surface-variant/60 hover:text-on-surface-variant'
            }`}
          >
            {tab === 'recruiting' ? '正在招募' : '我的约球'}
            {activeTab === tab && <motion.div layoutId="tab-indicator" className="active-tab-indicator" />}
          </button>
        ))}
      </div>

      {/* ── FILTER CHIPS ── */}
      <section className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar flex-shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10 text-[11px] font-semibold text-primary whitespace-nowrap">
          <Filter className="w-3.5 h-3.5" />
          <span>筛选</span>
        </div>
        <select value={selectedLevelFilter} onChange={(e) => setSelectedLevelFilter(e.target.value)}
          className="px-3 py-1.5 bg-white text-on-surface-variant border border-outline/20 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-primary/40">
          {levels.map(lvl => <option key={lvl} value={lvl}>{lvl === '全部' ? '水平: 全部' : lvl}</option>)}
        </select>
        <select value={selectedTimeFilter} onChange={(e) => setSelectedTimeFilter(e.target.value)}
          className="px-3 py-1.5 bg-white text-on-surface-variant border border-outline/20 rounded-xl text-[11px] font-semibold focus:outline-none focus:border-primary/40">
          {times.map(t => <option key={t} value={t}>{t === '全部' ? '时间: 全部' : `时间: ${t}`}</option>)}
        </select>
      </section>

      {/* ── POSTS LIST ── */}
      <div className="flex flex-col gap-3.5 px-4 flex-1 pb-4">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-2xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-muted/30 select-none">sports_tennis</span>
            </div>
            <p className="text-sm font-semibold text-on-surface-variant/50">
              {activeTab === 'mine' ? '您还没有发布或参加过约球哦' : '没有找到符合条件的招募信息'}
            </p>
            <p className="text-xs text-on-surface-muted/40">点击右下角"发布约球"立即发起一局！</p>
          </div>
        ) : (
          filteredPosts.map((post, idx) => {
            const isFull = post.joinedCount >= post.totalCapacity;
            const isOneLeft = post.totalCapacity - post.joinedCount === 1;
            const statusColor = isFull ? 'bg-on-surface-variant/80' : isOneLeft ? 'bg-warning' : 'bg-success';
            const statusText = isFull ? '已满员' : isOneLeft ? '最后1席' : '招募中';

            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl p-4 shadow-card border border-outline/5 relative overflow-hidden active-press"
              >
                {/* Status ribbon */}
                <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-display font-bold rounded-bl-2xl uppercase tracking-wider text-white ${statusColor}`}>
                  {statusText}
                </div>

                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/10 flex-shrink-0">
                    <img className="w-full h-full object-cover" src={post.organizerAvatar} alt={post.organizerName} referrerPolicy="no-referrer" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-on-surface text-sm">{post.organizerName}</span>
                      <span className="px-2 py-0.5 gradient-primary text-white text-[9px] rounded-lg font-display font-bold tracking-wider">
                        {post.organizerLevel}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="font-display font-bold mb-2.5 leading-snug text-[17px] text-on-surface">
                      {post.title}
                    </h2>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 mb-4">
                      <div onClick={() => onSelectCourtByName(post.locationName)}
                        className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors cursor-pointer group">
                        <MapPin className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium truncate underline decoration-dotted underline-offset-2">{post.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium">{post.timeStr}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium">缺{post.totalCapacity - post.joinedCount}人 ({post.joinedCount}/{post.totalCapacity})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-on-surface-variant">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium">{post.feeType} {post.feeValue > 0 ? `¥${post.feeValue}` : ''}</span>
                      </div>
                    </div>

                    {/* Participants + CTA */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-outline/20">
                      <div className="flex -space-x-2">
                        {post.participants.slice(0, 4).map((avatar, i) => (
                          <div key={i} className="w-8 h-8 rounded-full ring-2 ring-white bg-slate-200 overflow-hidden shadow-sm">
                            <img className="w-full h-full object-cover" src={avatar} alt="participant" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                        {post.totalCapacity - post.joinedCount > 0 && (
                          <div className="w-8 h-8 rounded-full ring-2 ring-white bg-surface-container-high flex items-center justify-center text-[10px] text-on-surface-variant font-bold">
                            +{post.totalCapacity - post.joinedCount}
                          </div>
                        )}
                      </div>

                      {isFull ? (
                        <button disabled className="bg-surface-container-high text-on-surface-muted px-5 py-2 rounded-xl font-bold text-xs cursor-not-allowed">人数已满</button>
                      ) : post.isJoinedByMe ? (
                        <button disabled className="bg-success/10 text-success px-5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-default">
                          <CheckCircle className="w-3.5 h-3.5" /> 已参加
                        </button>
                      ) : (
                        <button
                          onClick={() => onJoinMatch(post.id)}
                          className="gradient-primary text-white px-5 py-2 rounded-xl font-bold text-xs shadow-primary/20 shadow-md active-press transition-all"
                        >
                          立即加入
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })
        )}
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setShowAddPostModal(true)}
        className="fixed bottom-24 right-6 w-14 h-14 gradient-energy text-white rounded-2xl flex flex-col items-center justify-center shadow-primary/30 shadow-lg active-press transition-all z-40"
      >
        <Plus className="w-6 h-6" strokeWidth={2.5} />
        <span className="text-[9px] font-display font-bold -mt-0.5 tracking-wide">约球</span>
      </button>

      {/* ── POST MODAL ── */}
      <AnimatePresence>
        {showPostModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 30 }}
              className="bg-white rounded-2xl w-full max-w-sm max-h-[85vh] overflow-y-auto p-6 shadow-floating border border-outline/10 flex flex-col gap-4 no-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-outline/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">sports_tennis</span>
                  </div>
                  <h3 className="text-lg font-display font-bold text-on-surface">发布约球局</h3>
                </div>
                <button onClick={() => setShowAddPostModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-surface-container flex items-center justify-center transition-colors">
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <form onSubmit={handlePostMatchSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">约球口号 / 标题</label>
                  <input type="text" required maxLength={30}
                    className="w-full bg-surface-container-low rounded-xl border border-outline/20 px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="例: 有水平中等的朋友切磋一下吗？"
                    value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">选择球场</label>
                  <select value={courtName} onChange={(e) => setCourtName(e.target.value)}
                    className="w-full bg-surface-container-low rounded-xl border border-outline/20 px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    {courts.map(court => <option key={court.id} value={court.name}>{court.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">约球时间</label>
                  <input type="text" required
                    className="w-full bg-surface-container-low rounded-xl border border-outline/20 px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="例: 今天 19:00 或 本周六下午"
                    value={timeStr} onChange={(e) => setTimeStr(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1.5">最大人数</label>
                    <input type="number" required min={2} max={12}
                      className="w-full bg-surface-container-low rounded-xl border border-outline/20 px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1.5">费用机制</label>
                    <select value={feeType} onChange={(e) => setFeeType(e.target.value as any)}
                      className="w-full bg-surface-container-low rounded-xl border border-outline/20 px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="AA制">AA制</option>
                      <option value="免费">免费</option>
                      <option value="付费">定额付费</option>
                    </select>
                  </div>
                </div>
                {feeType !== '免费' && (
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1.5">人均费用 (元)</label>
                    <input type="number" min={0}
                      className="w-full bg-surface-container-low rounded-xl border border-outline/20 px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={feeValue} onChange={(e) => setFeeValue(Number(e.target.value))} />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1.5">详情补充</label>
                  <textarea
                    className="w-full bg-surface-container-low rounded-xl border border-outline/20 px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary h-20 resize-none"
                    placeholder="可以写一下个人水平、对用球的要求，或者找几个球友等..."
                    value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowAddPostModal(false)}
                    className="flex-1 py-3 bg-surface-container-low hover:bg-surface-container rounded-xl text-on-surface-variant font-semibold text-sm active-press transition-all">取消</button>
                  <button type="submit"
                    className="flex-1 py-3 gradient-primary text-white rounded-xl font-bold text-sm active-press transition-all shadow-primary/20 shadow-md">确认发布</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
