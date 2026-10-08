import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AIModelConfig, TokenBudget, SmtpConfig, BrandGuideline } from '../../types';
import { INITIAL_SETTINGS } from '../../data/initialData';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Mail, 
  History, 
  Palette, 
  Lock, 
  Check, 
  AlertCircle, 
  Save, 
  Download, 
  Trash2, 
  Send,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { ComplianceRule, BrandPrinciple, DEFAULT_COMPLIANCE_RULES } from '../../data/complianceKeywords';
import { isModelDeprecated } from '../../services/aiGenerator';

export const SettingsTab: React.FC = () => {
  const { theme, settings, updateSettings, currentUser, contents, sendTestEmail, setCurrentUser, users } = useApp();

  const isLight = theme === 'light';
  const isAdmin = currentUser.role === 'ADMIN';

  // State
  const [activeModel, setActiveModel] = useState<'CLAUDE' | 'GEMINI' | 'GPT4'>(settings.activeModel);
  const [models, setModels] = useState<AIModelConfig[]>(settings.models);
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({});
  
  // Token budget
  const [tokens, setTokens] = useState<TokenBudget>(settings.tokenBudget);

  // SMTP
  const [smtp, setSmtp] = useState<SmtpConfig>(settings.smtp);
  const [testEmailAddress, setTestEmailAddress] = useState<string>(currentUser.email);

  // History settings
  const [repeatThreshold, setRepeatThreshold] = useState<number>(settings.repeatWarningThreshold);
  const [retentionMonths, setRetentionMonths] = useState<number>(settings.historyRetentionMonths);

  // Brand guideline
  const [guideline, setGuideline] = useState<BrandGuideline>(settings.brandGuideline);
  const [isEditingGuideline, setIsEditingGuideline] = useState<boolean>(false);

  // Compliance rules
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>(
    settings.complianceRules && settings.complianceRules.length > 0
      ? settings.complianceRules
      : DEFAULT_COMPLIANCE_RULES
  );
  const [newKeyword, setNewKeyword] = useState<string>('');
  const [newPrinciple, setNewPrinciple] = useState<BrandPrinciple>('KHÔNG Chém Gió Ảo');
  const [newSeverity, setNewSeverity] = useState<'warning' | 'danger'>('warning');
  const [newSuggestion, setNewSuggestion] = useState<string>('');

  // Toast / notification
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Toggle show key
  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Reset models to latest definitions
  const handleResetToLatestModels = () => {
    if (!isAdmin) return;
    setModels(prev => INITIAL_SETTINGS.models.map(def => {
      const current = prev.find(p => p.id === def.id);
      return {
        ...def,
        apiKey: current?.apiKey || def.apiKey,
        isActive: current ? (current.id === activeModel) : def.isActive
      };
    }));
    showToast('✨ Đã đặt lại cấu hình 3 Model LLM sang phiên bản mới nhất (Claude 3.7 / Gemini 2.5 / GPT-4.5)!');
  };

  // Save AI Config
  const handleSaveAiConfig = () => {
    if (!isAdmin) return;
    updateSettings({
      activeModel,
      models: models.map(m => ({ ...m, isActive: m.id === activeModel })),
      tokenBudget: tokens
    });
    showToast('✅ Đã lưu cấu hình AI Model & Token Budget thành công!');
  };

  // Save SMTP
  const handleSaveSmtp = () => {
    if (!isAdmin) return;
    updateSettings({ smtp });
    showToast('✅ Đã lưu cài đặt máy chủ Email SMTP thành công!');
  };

  // Test Email
  const handleTestEmail = () => {
    sendTestEmail(testEmailAddress);
    showToast(`📩 Đã kích hoạt lệnh gửi email test tới: ${testEmailAddress}`);
  };

  // Save History settings
  const handleSaveHistorySettings = () => {
    if (!isAdmin) return;
    updateSettings({
      repeatWarningThreshold: repeatThreshold,
      historyRetentionMonths: retentionMonths
    });
    showToast('✅ Đã lưu cấu hình Content History!');
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'Ngày', 'Kênh', 'Sản phẩm', 'Category', 'Trạng thái', 'Người tạo', 'Người duyệt'];
    const rows = contents.map(c => [
      c.id,
      c.date,
      c.channel,
      `"${c.productName}"`,
      c.categoryId,
      c.status,
      c.createdBy || '',
      c.approvedBy || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bulbtek_Content_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Guideline
  const handleSaveGuideline = () => {
    if (!isAdmin) return;
    updateSettings({ brandGuideline: guideline });
    setIsEditingGuideline(false);
    showToast('✅ Đã lưu cập nhật Brand Guideline Bulbtek!');
  };

  // Compliance handlers
  const handleAddComplianceRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newKeyword.trim() || !newSuggestion.trim()) {
      alert('Vui lòng nhập từ khóa và gợi ý sửa đổi!');
      return;
    }
    const rule: ComplianceRule = {
      id: `rule-${Date.now()}`,
      keyword: newKeyword.trim(),
      principle: newPrinciple,
      severity: newSeverity,
      suggestion: newSuggestion.trim()
    };
    const updated = [rule, ...complianceRules];
    setComplianceRules(updated);
    updateSettings({ complianceRules: updated });
    setNewKeyword('');
    setNewSuggestion('');
    showToast(`✅ Đã thêm từ khóa cấm/nhạy cảm: "${rule.keyword}"`);
  };

  const handleDeleteComplianceRule = (id: string) => {
    if (!isAdmin) return;
    const updated = complianceRules.filter(r => r.id !== id);
    setComplianceRules(updated);
    updateSettings({ complianceRules: updated });
    showToast('🗑️ Đã xóa quy tắc tuân thủ.');
  };

  const handleResetComplianceRules = () => {
    if (!isAdmin) return;
    setComplianceRules(DEFAULT_COMPLIANCE_RULES);
    updateSettings({ complianceRules: DEFAULT_COMPLIANCE_RULES });
    showToast('✨ Đã khôi phục 10 quy tắc tuân thủ thương hiệu Bulbtek chuẩn mặc định!');
  };

  const handleSaveComplianceRules = () => {
    if (!isAdmin) return;
    updateSettings({ complianceRules });
    showToast('✅ Đã lưu danh sách quy tắc tuân thủ thương hiệu!');
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className={`border rounded-2xl p-5 shadow-lg transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`p-2 rounded-xl border ${
                isLight ? 'bg-red-50 text-bulbtek-red border-red-200' : 'bg-bulbtek-red/20 text-red-400 border-bulbtek-red/30'
              }`}>
                <SettingsIcon className="w-5 h-5" />
              </span>
              <h1 className={`text-xl font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Cài Đặt Hệ Thống (System Settings)
              </h1>
            </div>
            <p className={`text-sm mt-1 max-w-3xl ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Trung tâm cấu hình AI Model thế hệ mới nhất (Claude 3.7 Sonnet / Gemini 2.5 Pro / GPT-4.5 Orion), máy chủ Email SMTP, kiểm soát Content History và Brand Guideline dành riêng cho Quản trị viên (Admin).
            </p>
          </div>

          {!isAdmin && (
            <div className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-semibold shrink-0 ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/40 border-amber-600/50 text-amber-300'
            }`}>
              <Lock className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Chỉ Admin (Philip) có quyền sửa</span>
              <button
                onClick={() => {
                  const adminUser = users.find(u => u.role === 'ADMIN');
                  if (adminUser) setCurrentUser(adminUser);
                }}
                className="ml-2 text-white bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded text-[11px] transition shadow-xs"
              >
                Đổi sang Admin
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast feedback */}
      {saveSuccessMsg && (
        <div className={`p-4 rounded-xl border text-xs font-bold flex items-center space-x-2 animate-fadeIn ${
          isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
        }`}>
          <Check className="w-4 h-4 text-emerald-500" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* MỤC 1: AI MODEL CONFIGURATION */}
      <div className={`border rounded-2xl p-6 space-y-6 shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b gap-3 ${
          isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'
        }`}>
          <div className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider ${
            isLight ? 'text-bulbtek-red' : 'text-red-400'
          }`}>
            <Cpu className="w-5 h-5" />
            <span>Mục 1: AI Model Configuration</span>
          </div>

          <div className="flex items-center space-x-3">
            {isAdmin && (
              <button
                type="button"
                onClick={handleResetToLatestModels}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs'
                    : 'bg-[#121215] hover:bg-[#202026] border-[#2A2A32] text-gray-300'
                }`}
                title="Khôi phục mã model và thông số 3 model LLM mới nhất chuẩn hệ thống"
              >
                <RefreshCw className="w-3.5 h-3.5 text-bulbtek-red" />
                <span>Đặt lại 3 Model mới nhất</span>
              </button>
            )}

            <span className={`text-xs font-mono font-bold ${
              isLight ? 'text-emerald-600' : 'text-emerald-400'
            }`}>
              Active: {models.find(m => m.id === activeModel)?.name}
            </span>
          </div>
        </div>

        {/* Warning Note */}
        <div className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border text-gray-300'
        }`}>
          <span className="text-bulbtek-red font-bold">⚡ Lưu ý hệ thống:</span>
          <span>Chỉ 1 model active tại một thời điểm. Thay đổi áp dụng ngay cho các lần generate tiếp theo. Content cũ không bị ảnh hưởng.</span>
        </div>

        {/* Models list */}
        <div className="space-y-4">
          {models.map((model) => {
            const isSelected = activeModel === model.id;
            const isKeyVisible = showKeys[model.id] || false;

            return (
              <div
                key={model.id}
                onClick={() => isAdmin && setActiveModel(model.id)}
                className={`p-5 rounded-xl border transition cursor-pointer space-y-3 ${
                  isSelected
                    ? (isLight ? 'bg-red-50/70 border-red-300 shadow-xs' : 'bg-bulbtek-red/10 border-bulbtek-red shadow-glow-red')
                    : (isLight ? 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border hover:border-gray-600')
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="activeModel"
                      checked={isSelected}
                      disabled={!isAdmin}
                      onChange={() => setActiveModel(model.id)}
                      className="accent-bulbtek-red w-4 h-4 cursor-pointer"
                    />
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-white'}`}>{model.name}</span>
                        <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                          isLight ? 'bg-white text-slate-700 border-slate-200 shadow-2xs' : 'bg-black/40 text-gray-400 border-gray-700'
                        }`}>
                          {model.modelCode}
                        </span>

                        {model.id === 'CLAUDE' && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                            Hybrid Reasoning 2025/2026
                          </span>
                        )}
                        {model.id === 'GEMINI' && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/15 text-blue-500 border border-blue-500/30">
                            Multimodal 2.5 Pro DeepMind
                          </span>
                        )}
                        {model.id === 'GPT4' && (
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                            Flagship GPT-4.5 Orion
                          </span>
                        )}

                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-bulbtek-red text-white font-bold">
                            ĐANG SỬ DỤNG
                          </span>
                        )}

                        {isModelDeprecated(model.modelCode) && (
                          <span 
                            className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 inline-flex items-center space-x-1"
                            title="Model ID này đã cũ hoặc bị nhà cung cấp thay thế. Khuyến nghị bấm 'Đặt lại 3 Model mới nhất'."
                          >
                            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400 inline mr-0.5" />
                            <span>Model ID cũ / Deprecated</span>
                          </span>
                        )}
                      </div>
                      <p className={`text-xs mt-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{model.description}</p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono hidden sm:inline ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                    {model.endpoint}
                  </span>
                </div>

                {/* API Key input */}
                <div className="pt-2 flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                  <label className={`text-xs font-semibold w-16 shrink-0 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>API Key:</label>
                  <div className="relative flex-1">
                    <input
                      type={isKeyVisible ? 'text' : 'password'}
                      disabled={!isAdmin}
                      value={model.apiKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setModels(prev => prev.map(m => m.id === model.id ? { ...m, apiKey: val } : m));
                      }}
                      className={`w-full rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-bulbtek-red disabled:opacity-60 ${
                        isLight 
                          ? 'bg-white border border-slate-200 text-slate-900 shadow-xs' 
                          : 'bg-bulbtek-dark-surface border border-bulbtek-dark-border text-white'
                      }`}
                    />
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => toggleShowKey(model.id)}
                      className={`p-1.5 rounded transition ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-gray-400 hover:text-white'}`}
                      title={isKeyVisible ? 'Ẩn key' : 'Hiện key'}
                    >
                      {isKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Token Budget */}
        <div className={`pt-4 border-t space-y-3 ${isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'}`}>
          <div className={`font-bold text-xs uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
            Token Budget (Kiểm Soát Chi Phí API Từng Bài):
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className={`block text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Facebook Caption (Tokens)</label>
              <input
                type="number"
                disabled={!isAdmin}
                value={tokens.facebookCaption}
                onChange={(e) => setTokens(t => ({ ...t, facebookCaption: Number(e.target.value) }))}
                className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>TikTok Caption (Tokens)</label>
              <input
                type="number"
                disabled={!isAdmin}
                value={tokens.tiktokCaption}
                onChange={(e) => setTokens(t => ({ ...t, tiktokCaption: Number(e.target.value) }))}
                className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Design Brief Text (Tokens)</label>
              <input
                type="number"
                disabled={!isAdmin}
                value={tokens.designBriefText}
                onChange={(e) => setTokens(t => ({ ...t, designBriefText: Number(e.target.value) }))}
                className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] mb-1 ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>Image Prompt (Tokens)</label>
              <input
                type="number"
                disabled={!isAdmin}
                value={tokens.imagePrompt}
                onChange={(e) => setTokens(t => ({ ...t, imagePrompt: Number(e.target.value) }))}
                className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
                }`}
              />
            </div>
          </div>

          {isAdmin && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAiConfig}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu Token & AI Settings</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MỤC 2: EMAIL CONFIGURATION (SMTP) */}
      <div className={`border rounded-2xl p-6 space-y-5 shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider pb-3 border-b ${
          isLight ? 'text-blue-700 border-slate-200' : 'text-blue-400 border-bulbtek-dark-border'
        }`}>
          <Mail className="w-5 h-5" />
          <span>Mục 2: Email Configuration (SMTP & Notifications)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>SMTP Server</label>
            <input
              type="text"
              disabled={!isAdmin}
              value={smtp.server}
              onChange={(e) => setSmtp(s => ({ ...s, server: e.target.value }))}
              className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Port</label>
            <input
              type="number"
              disabled={!isAdmin}
              value={smtp.port}
              onChange={(e) => setSmtp(s => ({ ...s, port: Number(e.target.value) }))}
              className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Email gửi thông báo</label>
            <input
              type="email"
              disabled={!isAdmin}
              value={smtp.senderEmail}
              onChange={(e) => setSmtp(s => ({ ...s, senderEmail: e.target.value }))}
              className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Mật khẩu ứng dụng (App Pass)</label>
            <input
              type="password"
              disabled={!isAdmin}
              value={smtp.appPassword}
              onChange={(e) => setSmtp(s => ({ ...s, appPassword: e.target.value }))}
              className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Email Approver mặc định</label>
            <input
              type="email"
              disabled={!isAdmin}
              value={smtp.defaultApproverEmail}
              onChange={(e) => setSmtp(s => ({ ...s, defaultApproverEmail: e.target.value }))}
              className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Email nhận báo cáo tháng</label>
            <input
              type="email"
              disabled={!isAdmin}
              value={smtp.monthlyReportEmail}
              onChange={(e) => setSmtp(s => ({ ...s, monthlyReportEmail: e.target.value }))}
              className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>
        </div>

        <div className={`pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t ${
          isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'
        }`}>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Email nhận test..."
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              className={`rounded-lg px-3 py-1.5 text-xs w-60 focus:outline-none focus:border-blue-600 ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
            <button
              type="button"
              onClick={handleTestEmail}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                isLight ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700' : 'bg-blue-950 hover:bg-blue-900 border-blue-700 text-blue-300'
              }`}
            >
              <Send className="w-3 h-3" />
              <span>Test gửi email</span>
            </button>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleSaveSmtp}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu cài đặt email</span>
            </button>
          )}
        </div>
      </div>

      {/* MỤC 3: CONTENT HISTORY SETTINGS */}
      <div className={`border rounded-2xl p-6 space-y-5 shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider pb-3 border-b ${
          isLight ? 'text-amber-600 border-slate-200' : 'text-amber-400 border-bulbtek-dark-border'
        }`}>
          <History className="w-5 h-5" />
          <span>Mục 3: Content History Settings</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              Ngưỡng cảnh báo lặp sản phẩm trong tháng (bài):
            </label>
            <input
              type="number"
              min={1}
              max={10}
              disabled={!isAdmin}
              value={repeatThreshold}
              onChange={(e) => setRepeatThreshold(Number(e.target.value))}
              className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
            <span className={`text-[11px] mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
              Mặc định: 3 bài. Nếu sản phẩm đạt số bài này, AI sẽ hiện cảnh báo vàng kèm gợi ý angle mới.
            </span>
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              Số tháng lưu giữ history:
            </label>
            <input
              type="number"
              min={1}
              max={24}
              disabled={!isAdmin}
              value={retentionMonths}
              onChange={(e) => setRetentionMonths(Number(e.target.value))}
              className={`w-full rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
            <span className={`text-[11px] mt-1 block ${isLight ? 'text-slate-500' : 'text-gray-500'}`}>
              Mặc định: 6 tháng. Tự động bảo lưu lịch sử bài đăng và góc khai thác angle.
            </span>
          </div>
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-3 pt-3 border-t ${
          isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'
        }`}>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleExportCsv}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs transition border ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                  : 'bg-bulbtek-dark-deep hover:bg-gray-800 border-bulbtek-dark-border text-gray-200'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-emerald-500" />
              <span>Xuất file CSV ({contents.length} bài)</span>
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Bạn có chắc muốn xóa lịch sử các bài cũ hơn ${retentionMonths} tháng?`)) {
                    showToast('Đã dọn dẹp các bản ghi cũ theo cấu hình!');
                  }
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs transition border ${
                  isLight 
                    ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700' 
                    : 'bg-red-950/40 hover:bg-red-900/60 border-red-800/60 text-red-300'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa history cũ hơn {retentionMonths} tháng</span>
              </button>
            )}
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={handleSaveHistorySettings}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu cấu hình History</span>
            </button>
          )}
        </div>
      </div>

      {/* MỤC 4: BRAND GUIDELINE (Readonly, chỉ Admin sửa) */}
      <div className={`border rounded-2xl p-6 space-y-5 shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'
        }`}>
          <div className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider ${
            isLight ? 'text-emerald-700' : 'text-emerald-400'
          }`}>
            <Palette className="w-5 h-5" />
            <span>Mục 4: Brand Guideline & Nhận Diện Cốt Lõi</span>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => {
                if (isEditingGuideline) {
                  handleSaveGuideline();
                } else {
                  setIsEditingGuideline(true);
                }
              }}
              className="px-3 py-1 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold transition shadow-glow-red"
            >
              {isEditingGuideline ? 'Lưu thay đổi' : 'Chỉnh sửa Brand Guideline (Admin)'}
            </button>
          )}
        </div>

        {/* Color Palette preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(guideline.colorPalette && guideline.colorPalette.length > 0 ? guideline.colorPalette : [
            { id: 'c-primary', name: 'Primary Color (Đỏ)', hex: guideline.primaryColor, role: 'Primary' },
            { id: 'c-dark', name: 'Dark Background (Đen)', hex: guideline.darkColor, role: 'Dark' },
            { id: 'c-white', name: 'White Contrast (Trắng)', hex: guideline.whiteColor, role: 'White' },
          ]).map((c) => (
            <div key={c.id} className={`p-3.5 rounded-xl border flex items-center space-x-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border'
            }`}>
              <div 
                className="w-10 h-10 rounded-lg shadow-sm border shrink-0" 
                style={{ 
                  backgroundColor: c.hex,
                  borderColor: c.hex.toLowerCase() === '#ffffff' ? '#cbd5e1' : 'rgba(255,255,255,0.15)'
                }} 
              />
              <div className="min-w-0 flex-1">
                <span className={`text-xs font-semibold block truncate ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  {c.name}
                </span>
                <strong className={`text-xs font-mono ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  {c.hex}
                </strong>
              </div>
            </div>
          ))}
        </div>

        {/* Guideline details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>Slogan Thương Hiệu:</label>
            <input
              type="text"
              disabled={!isEditingGuideline}
              value={guideline.slogan}
              onChange={(e) => setGuideline(g => ({ ...g, slogan: e.target.value }))}
              className={`w-full rounded-lg p-2 font-bold disabled:opacity-75 focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>Thông Điệp Truyền Thông:</label>
            <input
              type="text"
              disabled={!isEditingGuideline}
              value={guideline.message}
              onChange={(e) => setGuideline(g => ({ ...g, message: e.target.value }))}
              className={`w-full rounded-lg p-2 font-bold disabled:opacity-75 focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>3 Giá Trị Cốt Lõi:</label>
            <input
              type="text"
              disabled={!isEditingGuideline}
              value={guideline.coreValues}
              onChange={(e) => setGuideline(g => ({ ...g, coreValues: e.target.value }))}
              className={`w-full rounded-lg p-2 font-bold disabled:opacity-75 focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>Mascot & Tỉ Lệ Visual:</label>
            <input
              type="text"
              disabled={!isEditingGuideline}
              value={`${guideline.mascot} | ${guideline.visualRatio}`}
              onChange={(e) => {}}
              className={`w-full rounded-lg p-2 font-bold disabled:opacity-75 focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>Hashtag Cố Định Facebook:</label>
            <input
              type="text"
              disabled={!isEditingGuideline}
              value={guideline.fbHashtags}
              onChange={(e) => setGuideline(g => ({ ...g, fbHashtags: e.target.value }))}
              className={`w-full rounded-lg p-2 font-mono font-semibold disabled:opacity-75 focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-bulbtek-red' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-red-400'
              }`}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>Hashtag Cố Định TikTok:</label>
            <input
              type="text"
              disabled={!isEditingGuideline}
              value={guideline.tiktokHashtags}
              onChange={(e) => setGuideline(g => ({ ...g, tiktokHashtags: e.target.value }))}
              className={`w-full rounded-lg p-2 font-mono font-semibold disabled:opacity-75 focus:outline-none focus:border-bulbtek-red ${
                isLight ? 'bg-slate-50 border border-slate-200 text-slate-800' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-gray-200'
              }`}
            />
          </div>
        </div>

      </div>

      {/* MỤC 5: QUẢN LÝ QUY TẮC & TỪ KHÓA TUÂN THỦ THƯƠNG HIỆU (COMPLIANCE CHECK) */}
      <div className={`border rounded-2xl p-6 space-y-5 shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'
        }`}>
          <div>
            <div className={`flex items-center space-x-2 text-sm font-bold uppercase tracking-wider ${
              isLight ? 'text-amber-700' : 'text-amber-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
              <span>Mục 5: Quản Lý Quy Tắc & Từ Khóa Tuân Thủ Thương Hiệu (Compliance Rules)</span>
            </div>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Hệ thống tự động quét caption để cảnh báo vi phạm 3 nguyên tắc bắt buộc: KHÔNG Chém Gió Ảo, KHÔNG Cắt Dây Điện, KHÔNG Gây Chói Lóa.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleResetComplianceRules}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                  isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border hover:bg-gray-800 text-gray-300'
                }`}
                title="Khôi phục danh sách 10 quy tắc chuẩn ban đầu của Bulbtek"
              >
                <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                Khôi phục chuẩn
              </button>

              <button
                type="button"
                onClick={handleSaveComplianceRules}
                className="px-4 py-1.5 rounded-lg bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold transition shadow-glow-red flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu quy tắc</span>
              </button>
            </div>
          )}
        </div>

        {/* Danh sách quy tắc hiện tại */}
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
            <thead className={`uppercase tracking-wider text-[11px] border-y ${
              isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-bulbtek-dark-deep text-gray-400 border-bulbtek-dark-border'
            }`}>
              <tr>
                <th className="py-2.5 px-3">Từ khóa cấm/nhạy cảm</th>
                <th className="py-2.5 px-3">Nguyên tắc thương hiệu</th>
                <th className="py-2.5 px-3">Mức độ</th>
                <th className="py-2.5 px-3">Gợi ý chỉnh sửa chuẩn Bulbtek</th>
                {isAdmin && <th className="py-2.5 px-3 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-bulbtek-dark-border/60'}`}>
              {complianceRules.map((rule) => (
                <tr key={rule.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-bulbtek-dark-deep/40'}`}>
                  <td className="py-2.5 px-3 font-bold text-bulbtek-red whitespace-nowrap">
                    "{rule.keyword}"
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.principle === 'KHÔNG Chém Gió Ảo'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : rule.principle === 'KHÔNG Cắt Dây Điện'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {rule.principle}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      rule.severity === 'danger'
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                    }`}>
                      {rule.severity === 'danger' ? '⛔ Nghiêm trọng' : '⚠️ Cảnh báo'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="opacity-90">{rule.suggestion}</span>
                  </td>
                  {isAdmin && (
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteComplianceRule(rule.id)}
                        className={`p-1.5 rounded-lg transition ${
                          isLight ? 'text-slate-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-500 hover:text-red-400 hover:bg-red-950/30'
                        }`}
                        title="Xóa từ khóa này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form thêm từ khóa mới (Admin) */}
        {isAdmin && (
          <form onSubmit={handleAddComplianceRule} className={`p-4 rounded-xl border space-y-3 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border'
          }`}>
            <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
              isLight ? 'text-slate-800' : 'text-gray-200'
            }`}>
              <Plus className="w-4 h-4 text-bulbtek-red" />
              <span>Thêm từ khóa cấm/nhạy cảm mới:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                  Từ khóa cấm / nhạy cảm *
                </label>
                <input
                  type="text"
                  required
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="VD: sáng nhất, cắt dây..."
                  className={`w-full rounded-lg p-2 font-semibold focus:outline-none focus:border-bulbtek-red ${
                    isLight ? 'bg-white border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-surface border border-bulbtek-dark-border text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                  Nguyên tắc vi phạm *
                </label>
                <select
                  value={newPrinciple}
                  onChange={(e) => setNewPrinciple(e.target.value as BrandPrinciple)}
                  className={`w-full rounded-lg p-2 font-semibold focus:outline-none focus:border-bulbtek-red ${
                    isLight ? 'bg-white border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-surface border border-bulbtek-dark-border text-white'
                  }`}
                >
                  <option value="KHÔNG Chém Gió Ảo">KHÔNG Chém Gió Ảo</option>
                  <option value="KHÔNG Cắt Dây Điện">KHÔNG Cắt Dây Điện</option>
                  <option value="KHÔNG Gây Chói Lóa">KHÔNG Gây Chói Lóa</option>
                </select>
              </div>

              <div>
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                  Mức độ nghiêm trọng
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as 'warning' | 'danger')}
                  className={`w-full rounded-lg p-2 font-semibold focus:outline-none focus:border-bulbtek-red ${
                    isLight ? 'bg-white border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-surface border border-bulbtek-dark-border text-white'
                  }`}
                >
                  <option value="warning">⚠️ Cảnh báo (Khuyến nghị sửa)</option>
                  <option value="danger">⛔ Nghiêm trọng (Rủi ro thương hiệu cao)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className={`block font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-400'}`}>
                  Gợi ý điều chỉnh chuẩn Bulbtek *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newSuggestion}
                    onChange={(e) => setNewSuggestion(e.target.value)}
                    placeholder="VD: Thay bằng số đo Lux/Lumen kiểm định hoặc nhấn mạnh giải pháp cắm giắc zin 100%..."
                    className={`flex-1 rounded-lg p-2 text-xs focus:outline-none focus:border-bulbtek-red ${
                      isLight ? 'bg-white border border-slate-200 text-slate-900' : 'bg-bulbtek-dark-surface border border-bulbtek-dark-border text-white'
                    }`}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shrink-0 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm từ khóa</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

    </div>
  );
};
