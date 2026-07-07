import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, UploadCloud, FileImage, Trash2, CheckCircle, Bell, Shield, Info, Trash, LogOut } from 'lucide-react';
import { CustomIcon } from '../types';

interface SettingsViewProps {
  customIcons: CustomIcon[];
  onUploadIcon: (name: string, dataUrl: string, type: 'marker' | 'badge' | 'avatar', fileSize: number, fileType: string) => void;
  onDeleteIcon: (id: string) => void;
  onBack: () => void;
  onSelectAvatar: (avatarUrl: string) => void;
}

export default function SettingsView({
  customIcons,
  onUploadIcon,
  onDeleteIcon,
  onBack,
  onSelectAvatar
}: SettingsViewProps) {
  // Notification states
  const [remindMatch, setRemindMatch] = useState(true);
  const [remindSignIn, setRemindSignIn] = useState(true);

  // File upload state variables
  const [dragActive, setDragActive] = useState(false);
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedName] = useState('');
  const [uploadedSize, setUploadedSize] = useState(0);
  const [uploadedFileType, setUploadedFileType] = useState('');
  const [iconType, setIconType] = useState<'marker' | 'badge' | 'avatar'>('marker');
  const [iconCustomName, setIconCustomName] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle Drag Over
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle file reading
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      triggerToast('❌ 只支持上传图片格式文件！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedBase64(event.target.result as string);
        setUploadedName(file.name);
        setUploadedSize(file.size);
        setUploadedFileType(file.type);
        // Default clean custom name
        setIconCustomName(file.name.split('.')[0] || '自定义图标');
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Handle File Input Select
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Trigger Local Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Submit Uploaded Icon to Global state
  const handleSaveIcon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedBase64 || !iconCustomName.trim()) return;

    onUploadIcon(
      iconCustomName.trim(),
      uploadedBase64,
      iconType,
      uploadedSize,
      uploadedFileType
    );

    triggerToast(`🎉 成功添加自定义图标: "${iconCustomName}"`);
    
    // Clear local upload state
    setUploadedBase64(null);
    setUploadedName('');
    setIconCustomName('');
  };

  return (
    <div className="relative w-full h-full bg-surface text-on-surface font-body-lg flex flex-col pt-14 pb-20 overflow-y-auto no-scrollbar" id="settings-view-container">
      {/* Top Navigation Header */}
      <header className="fixed top-0 inset-x-0 w-full z-50 flex justify-between items-center px-4 h-14 bg-white/95 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2">
          <button 
            onClick={onBack}
            className="p-1 active:scale-95 transition-transform text-primary rounded-full hover:bg-surface-container"
          >
            <ArrowLeft className="w-5 h-5 font-bold" />
          </button>
          <h1 className="text-headline-md font-extrabold text-primary text-base">设置</h1>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Settings Options Main */}
      <div className="p-4 space-y-5">
        
        {/* DRAG AND DROP CUSTOM ICON WORKSPACE */}
        <section className="flex flex-col gap-2">
          <h2 className="text-label-caps font-bold text-on-surface-variant px-1 font-mono uppercase tracking-wider text-xs">
            拖拽上传自定义图标 (Drag & Drop Workspace)
          </h2>
          
          <div className="bg-white rounded-2xl p-5 shadow-soft border border-outline-variant/20 flex flex-col gap-4">
            
            {/* FILE DROPZONE BOX */}
            {!uploadedBase64 ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-all ${
                  dragActive
                    ? 'border-primary bg-primary-container/10 scale-102'
                    : 'border-outline-variant hover:border-primary/50'
                }`}
              >
                <input
                  type="file"
                  id="dropzone-file-input"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileInputChange}
                />
                
                <label 
                  htmlFor="dropzone-file-input" 
                  className="cursor-pointer flex flex-col items-center justify-center w-full h-full gap-2"
                >
                  <UploadCloud className={`w-10 h-10 ${dragActive ? 'text-primary' : 'text-on-surface-variant/40'} animate-pulse`} />
                  <p className="text-xs font-bold text-on-surface font-sans">
                    将自定义图标/头像图片拖拽到此处
                  </p>
                  <p className="text-[10px] text-on-surface-variant/60 font-sans">
                    或者 <span className="text-primary underline font-bold">点击选择电脑文件</span>
                  </p>
                  <span className="text-[9px] text-on-surface-variant/40 bg-surface px-2 py-1 rounded mt-1 font-mono">
                    支持 PNG, JPG, WEBP (建议1:1比例)
                  </span>
                </label>
              </div>
            ) : (
              // FILE PREVIEW & INFO METRICS
              <form onSubmit={handleSaveIcon} className="space-y-4">
                <div className="p-3 bg-surface-container rounded-2xl flex items-center gap-3 border border-outline/5">
                  <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-primary-container bg-white flex-shrink-0">
                    <img src={uploadedBase64} className="w-full h-full object-cover" alt="preview upload" referrerPolicy="no-referrer" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-on-surface truncate font-sans">{uploadedFileName}</p>
                    <p className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">
                      {(uploadedSize / 1024).toFixed(1)} KB • {uploadedFileType.split('/')[1]?.toUpperCase()}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setUploadedBase64(null)}
                    className="p-2 text-danger-cancelled bg-red-50 hover:bg-red-100 rounded-full active:scale-95 transition-transform"
                    title="清空重新上传"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Custom Label and Categorization Usage */}
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant mb-1 font-sans">
                      图标自定义命名
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full bg-surface-container border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                      value={iconCustomName}
                      onChange={(e) => setIconCustomName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant mb-1 font-sans">
                      应用分类用途
                    </label>
                    <select
                      value={iconType}
                      onChange={(e) => setIconType(e.target.value as any)}
                      className="w-full bg-surface-container border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="marker">📌 地图球场大头针</option>
                      <option value="badge">🏅 个人勋章/荣誉奖牌</option>
                      <option value="avatar">👤 个人自定义头像</option>
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadedBase64(null)}
                    className="flex-1 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-on-surface-variant text-xs font-bold"
                  >
                    重新上传
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10"
                  >
                    确定并保存
                  </button>
                </div>
              </form>
            )}

            {/* MY CUSTOM ICON GALLERY LIST */}
            <div className="border-t border-surface-container-high pt-4">
              <h3 className="text-xs font-bold text-on-surface mb-3 flex items-center gap-1 font-sans">
                <FileImage className="w-4 h-4 text-primary" />
                <span>我已上传的自定义图标 ({customIcons.length})</span>
              </h3>

              {customIcons.length === 0 ? (
                <p className="text-[10px] text-on-surface-variant/40 py-2 font-sans italic">
                  暂无自定义图标。现在就拖拽一个文件上传试试吧！
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto no-scrollbar">
                  {customIcons.map((icon) => (
                    <div
                      key={icon.id}
                      className="p-2.5 rounded-xl border border-outline-variant/15 flex items-center justify-between gap-2 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-surface bg-slate-100 flex-shrink-0">
                          <img src={icon.dataUrl} className="w-full h-full object-cover" alt="thumb" referrerPolicy="no-referrer" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-on-surface truncate leading-tight font-sans">
                            {icon.name}
                          </p>
                          <span className="text-[8px] text-on-surface-variant/60 font-mono tracking-tight bg-slate-100 px-1 rounded block mt-0.5 w-max">
                            {icon.type === 'marker' ? '📌 地图' : icon.type === 'badge' ? '🏅 勋章' : '👤 头像'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* If avatar usage, quick apply */}
                        {icon.type === 'avatar' && (
                          <button
                            onClick={() => {
                              onSelectAvatar(icon.dataUrl);
                              triggerToast('👤 已成功应用此自定义图片为当前头像！');
                            }}
                            className="p-1 text-[8px] bg-primary/10 text-primary font-bold rounded hover:bg-primary/20"
                            title="立即设为我的头像"
                          >
                            应用
                          </button>
                        )}
                        
                        <button
                          onClick={() => onDeleteIcon(icon.id)}
                          className="p-1 text-on-surface-variant/40 hover:text-danger-cancelled active:scale-90 transition-transform"
                          title="删除此图标"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </section>

        {/* NOTIFICATIONS SECTION */}
        <section className="flex flex-col gap-2">
          <h2 className="text-label-caps font-bold text-on-surface-variant px-1 font-mono uppercase tracking-wider text-xs">
            通知偏好
          </h2>
          <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/20 overflow-hidden">
            {/* Option 1 */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-ball-orange">
                  <Bell className="w-4 h-4 fill-current" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-on-surface font-sans">约球提醒</span>
                  <span className="text-[10px] text-on-surface-variant font-sans mt-0.5">当附近有新的招募活动时通知我</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={remindMatch} 
                  onChange={(e) => setRemindMatch(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container" />
              </label>
            </div>

            <div className="h-[1px] bg-slate-100 mx-4" />

            {/* Option 2 */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center text-ball-orange">
                  <span className="material-symbols-outlined text-[20px] font-bold select-none">where_to_vote</span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-on-surface font-sans">签到提醒</span>
                  <span className="text-[10px] text-on-surface-variant font-sans mt-0.5">约球场次开始前15分钟通过震动提醒</span>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={remindSignIn} 
                  onChange={(e) => setRemindSignIn(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container" />
              </label>
            </div>
          </div>
        </section>

        {/* SECURITY & PRIVACY */}
        <section className="flex flex-col gap-2">
          <h2 className="text-label-caps font-bold text-on-surface-variant px-1 font-mono uppercase tracking-wider text-xs">
            安全与系统
          </h2>
          <div className="bg-white rounded-2xl shadow-soft border border-outline-variant/20 overflow-hidden text-xs">
            <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-secondary" />
                <span className="font-bold text-on-surface font-sans">账号与绑定安全</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-success-recruiting font-extrabold font-sans">已保护</span>
                <span className="material-symbols-outlined text-sm text-outline select-none">chevron_right</span>
              </div>
            </div>

            <div className="h-[1px] bg-slate-100 mx-4" />

            <div 
              onClick={() => {
                triggerToast('🧹 缓存已清理，释放了 24.8 MB 空间');
              }}
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Info className="w-4 h-4 text-on-surface-variant/60" />
                <span className="font-bold text-on-surface font-sans">清除本地缓存</span>
              </div>
              <span className="font-mono text-on-surface-variant/70">24.8 MB</span>
            </div>
          </div>
        </section>

        {/* LOGOUT BUTTON */}
        <button className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-danger-cancelled font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 active:scale-98 shadow-soft border border-outline/5 font-sans">
          <LogOut className="w-4 h-4" />
          <span>退出当前账号</span>
        </button>

        <p className="text-center text-[10px] text-outline/60 font-mono pt-2">
          Version 2.4.0 (Kinetic Smash Custom Build)
        </p>
      </div>

      {/* FLOAT TOAST */}
      <AnimatePresence>
        {toastMessage && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-on-background text-surface px-5 py-2.5 rounded-full shadow-2xl text-xs font-bold"
            >
              {toastMessage}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
