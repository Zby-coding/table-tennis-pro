import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, UploadCloud, FileImage, Trash2, Bell, Shield, Info, Trash, LogOut } from 'lucide-react';
import { CustomIcon } from '../types';

interface SettingsViewProps {
  customIcons: CustomIcon[];
  onUploadIcon: (name: string, dataUrl: string, type: 'marker' | 'badge' | 'avatar', fileSize: number, fileType: string) => void;
  onDeleteIcon: (id: string) => void;
  onBack: () => void;
  onSelectAvatar: (avatarUrl: string) => void;
}

export default function SettingsView({ customIcons, onUploadIcon, onDeleteIcon, onBack, onSelectAvatar }: SettingsViewProps) {
  const [remindMatch, setRemindMatch] = useState(true);
  const [remindSignIn, setRemindSignIn] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedName] = useState('');
  const [uploadedSize, setUploadedSize] = useState(0);
  const [uploadedFileType, setUploadedFileType] = useState('');
  const [iconType, setIconType] = useState<'marker' | 'badge' | 'avatar'>('marker');
  const [iconCustomName, setIconCustomName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) { triggerToast('❌ 只支持上传图片格式文件！'); return; }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedBase64(event.target.result as string);
        setUploadedName(file.name); setUploadedSize(file.size); setUploadedFileType(file.type);
        setIconCustomName(file.name.split('.')[0] || '自定义图标');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0]); };
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) processFile(e.target.files[0]); };
  const triggerToast = (msg: string) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 2500); };

  const handleSaveIcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedBase64 || !iconCustomName.trim()) return;
    onUploadIcon(iconCustomName.trim(), uploadedBase64, iconType, uploadedSize, uploadedFileType);
    triggerToast(`🎉 成功添加自定义图标: "${iconCustomName}"`);
    setUploadedBase64(null); setUploadedName(''); setIconCustomName('');
  };

  return (
    <div className="relative w-full h-full bg-background flex flex-col overflow-y-auto no-scrollbar" id="settings-view-container">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-50 flex justify-between items-center px-4 h-14 bg-white/95 backdrop-blur-xl border-b border-outline/10">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-1.5 active-press rounded-xl hover:bg-surface-container transition-colors text-primary">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-display font-bold text-on-surface">设置</h1>
        </div>
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-5">
        {/* ── DRAG & DROP UPLOAD ── */}
        <section>
          <h2 className="text-[11px] font-bold text-on-surface-muted px-1 uppercase tracking-wider mb-2">拖拽上传自定义图标</h2>
          <div className="bg-white rounded-2xl p-5 shadow-card border border-outline/5 space-y-4">
            {!uploadedBase64 ? (
              <div
                onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                className={`relative w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center transition-all ${
                  dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-outline/30 hover:border-primary/40'
                }`}
              >
                <input type="file" id="dropzone-file-input" className="hidden" accept="image/*" onChange={handleFileInputChange} />
                <label htmlFor="dropzone-file-input" className="cursor-pointer flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <UploadCloud className={`w-7 h-7 ${dragActive ? 'text-primary' : 'text-on-surface-muted'} transition-colors`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface">将图片拖拽到此处</p>
                    <p className="text-xs text-on-surface-muted mt-1">或者 <span className="text-primary font-bold underline">点击选择文件</span></p>
                  </div>
                  <span className="text-[10px] text-on-surface-muted bg-surface-container-low px-3 py-1 rounded-lg font-medium">支持 PNG, JPG, WEBP (建议1:1)</span>
                </label>
              </div>
            ) : (
              <form onSubmit={handleSaveIcon} className="space-y-4">
                <div className="p-3 bg-surface-container-low rounded-2xl flex items-center gap-3 border border-outline/10">
                  <div className="w-14 h-14 rounded-xl overflow-hidden ring-2 ring-primary/10 bg-white flex-shrink-0">
                    <img src={uploadedBase64} className="w-full h-full object-cover" alt="preview" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{uploadedFileName}</p>
                    <p className="text-[10px] text-on-surface-muted mt-0.5 font-medium">{(uploadedSize / 1024).toFixed(1)} KB • {uploadedFileType.split('/')[1]?.toUpperCase()}</p>
                  </div>
                  <button type="button" onClick={() => setUploadedBase64(null)}
                    className="p-2 text-error bg-error/5 hover:bg-error/10 rounded-xl active-press transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1">图标命名</label>
                    <input type="text" required
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={iconCustomName} onChange={(e) => setIconCustomName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-on-surface-variant mb-1">分类用途</label>
                    <select value={iconType} onChange={(e) => setIconType(e.target.value as any)}
                      className="w-full bg-surface-container-low border border-outline/20 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="marker">📌 地图大头针</option>
                      <option value="badge">🏅 荣誉勋章</option>
                      <option value="avatar">👤 个人头像</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setUploadedBase64(null)}
                    className="flex-1 py-2.5 bg-surface-container-low hover:bg-surface-container rounded-xl text-on-surface-variant font-semibold text-sm active-press transition-all">重新上传</button>
                  <button type="submit"
                    className="flex-1 py-2.5 gradient-primary text-white rounded-xl font-bold text-sm active-press transition-all shadow-primary/20 shadow-md">确定并保存</button>
                </div>
              </form>
            )}

            {/* My icons */}
            <div className="border-t border-outline/10 pt-4">
              <h3 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-1.5">
                <FileImage className="w-4 h-4 text-primary" />
                <span>已上传的图标 ({customIcons.length})</span>
              </h3>
              {customIcons.length === 0 ? (
                <p className="text-xs text-on-surface-muted/50 italic py-2">暂无自定义图标。拖拽文件上传试试！</p>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto no-scrollbar">
                  {customIcons.map((icon) => (
                    <div key={icon.id} className="p-2.5 rounded-xl border border-outline/10 flex items-center justify-between gap-2 hover:bg-surface-container-low transition-colors">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 shadow-sm">
                          <img src={icon.dataUrl} className="w-full h-full object-cover" alt="thumb" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-on-surface truncate">{icon.name}</p>
                          <span className="text-[9px] text-on-surface-muted bg-surface-container-low px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            {icon.type === 'marker' ? '📌' : icon.type === 'badge' ? '🏅' : '👤'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {icon.type === 'avatar' && (
                          <button onClick={() => { onSelectAvatar(icon.dataUrl); triggerToast('👤 已应用为当前头像！'); }}
                            className="px-2 py-1 text-[9px] bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary/20 transition-colors">应用</button>
                        )}
                        <button onClick={() => onDeleteIcon(icon.id)}
                          className="p-1 text-on-surface-muted/40 hover:text-error active-press transition-all"><Trash className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── NOTIFICATIONS ── */}
        <section>
          <h2 className="text-[11px] font-bold text-on-surface-muted px-1 uppercase tracking-wider mb-2">通知偏好</h2>
          <div className="bg-white rounded-2xl shadow-card border border-outline/5 overflow-hidden">
            {[
              { icon: <Bell className="w-5 h-5" />, color: 'bg-primary/10 text-primary', label: '约球提醒', desc: '当附近有新的招募活动时通知我', checked: remindMatch, onChange: setRemindMatch },
              { icon: <span className="material-symbols-outlined text-[20px]">where_to_vote</span>, color: 'bg-primary/10 text-primary', label: '签到提醒', desc: '约球场次开始前15分钟通过震动提醒', checked: remindSignIn, onChange: setRemindSignIn },
            ].map((item, i) => (
              <div key={i}>
                {i > 0 && <div className="h-px bg-outline/20 mx-4" />}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>{item.icon}</div>
                    <div>
                      <span className="text-sm font-bold text-on-surface">{item.label}</span>
                      <p className="text-[11px] text-on-surface-muted mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={item.checked} onChange={(e) => item.onChange(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-outline rounded-full peer peer-checked:bg-primary peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm" />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECURITY ── */}
        <section>
          <h2 className="text-[11px] font-bold text-on-surface-muted px-1 uppercase tracking-wider mb-2">安全与系统</h2>
          <div className="bg-white rounded-2xl shadow-card border border-outline/5 overflow-hidden">
            {[
              { icon: <Shield className="w-5 h-5 text-secondary" />, label: '账号与绑定安全', right: <span className="text-[10px] text-success font-bold">已保护</span> },
              { icon: <Info className="w-5 h-5 text-on-surface-variant/60" />, label: '清除本地缓存', right: <span className="text-xs text-on-surface-muted font-medium">24.8 MB</span>, onClick: () => triggerToast('🧹 缓存已清理，释放了 24.8 MB 空间') },
            ].map((item, i) => (
              <div key={i}>
                {i > 0 && <div className="h-px bg-outline/20 mx-4" />}
                <div onClick={item.onClick} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span className="text-sm font-bold text-on-surface">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.right}
                    <span className="material-symbols-outlined text-sm text-on-surface-muted select-none">chevron_right</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── LOGOUT ── */}
        <button className="w-full py-3.5 bg-error/5 hover:bg-error/10 text-error font-bold rounded-2xl text-sm transition-colors flex items-center justify-center gap-2 active-press shadow-card border border-outline/10">
          <LogOut className="w-4 h-4" /> 退出当前账号
        </button>
        <p className="text-center text-[10px] text-on-surface-muted font-medium pt-1">Version 2.4.0 (Kinetic Smash Custom Build)</p>
      </div>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-on-surface text-white px-5 py-3 rounded-2xl shadow-floating text-sm font-bold">{toastMessage}</motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
