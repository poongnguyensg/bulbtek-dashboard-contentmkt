import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TeamMember, UserRole, ContentItem } from '../../types';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Mail, 
  Send, 
  Eye, 
  AlertTriangle, 
  Check, 
  Lock, 
  FileText,
  Trash2,
  Copy,
  ExternalLink,
  Share2,
  CheckCheck,
  Edit3
} from 'lucide-react';
import { checkBrandCompliance, DEFAULT_COMPLIANCE_RULES } from '../../data/complianceKeywords';
import { EditTeamMemberModal } from '../modals/EditTeamMemberModal';

interface InviteDialogData {
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  subject: string;
  body: string;
  mailtoUrl: string;
}

export const Tab5TeamApproval: React.FC = () => {
  const { 
    theme,
    users, 
    currentUser, 
    addUser, 
    updateUserRole, 
    updateTeamMember,
    contents, 
    approveContent, 
    rejectContent, 
    emailLogs, 
    sendInviteEmail,
    saveContentItem, 
    setActiveTab, 
    setBriefPrefillItem,
    settings
  } = useApp();

  const isLight = theme === 'light';

  // Modal edit team member (Admin)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Modal invite member
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<UserRole>('CREATOR');
  const [newRoleTitle, setNewRoleTitle] = useState<string>('Content Specialist');

  // Modal actions after invite / resend invite
  const [inviteResult, setInviteResult] = useState<InviteDialogData | null>(null);
  const [copiedState, setCopiedState] = useState<'none' | 'body' | 'link'>('none');

  // Quick preview post modal
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null);

  // Reject Modal
  const [rejectingItem, setRejectingItem] = useState<ContentItem | null>(null);
  const [rejectionReasons, setRejectionReasons] = useState<string[]>([]);
  const [rejectionComment, setRejectionComment] = useState<string>('');

  const REJECT_REASONS_LIST = [
    'Thông tin sản phẩm không chính xác',
    'Tone không đúng category',
    'Hashtag thiếu hoặc sai',
    'CTA không rõ ràng',
    'Không phù hợp chiến dịch hiện tại',
    'Khác'
  ];

  // Filter pending items sorted by publication date
  const pendingItems = contents
    .filter(c => c.status === 'Pending')
    .sort((a, b) => a.date.localeCompare(b.date));

  const isAdmin = currentUser.role === 'ADMIN';
  const isApproverOrAdmin = currentUser.role === 'APPROVER' || currentUser.role === 'ADMIN';

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      alert('Vui lòng điền đủ Họ tên và Email!');
      return;
    }
    const memberData = {
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      roleTitle: newRoleTitle.trim(),
      status: 'Active' as const,
      avatar: newName.trim().slice(0, 2).toUpperCase()
    };
    addUser(memberData);
    const emailData = sendInviteEmail(memberData);

    setNewName('');
    setNewEmail('');
    setShowInviteModal(false);

    // Mở hộp thoại hành động gửi thư mời
    setInviteResult({
      name: memberData.name,
      email: memberData.email,
      role: memberData.role,
      roleTitle: memberData.roleTitle,
      subject: emailData.subject,
      body: emailData.body,
      mailtoUrl: emailData.mailtoUrl
    });
  };

  const handleResendInvite = (member: TeamMember) => {
    const emailData = sendInviteEmail({
      name: member.name,
      email: member.email,
      role: member.role,
      roleTitle: member.roleTitle
    });

    setInviteResult({
      name: member.name,
      email: member.email,
      role: member.role,
      roleTitle: member.roleTitle,
      subject: emailData.subject,
      body: emailData.body,
      mailtoUrl: emailData.mailtoUrl
    });
  };

  const handleCopyBody = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState('body');
    setTimeout(() => setCopiedState('none'), 3000);
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost:5173';
    navigator.clipboard.writeText(origin);
    setCopiedState('link');
    setTimeout(() => setCopiedState('none'), 3000);
  };

  const handleOpenMailApp = (mailtoUrl: string) => {
    window.open(mailtoUrl, '_blank');
  };

  const handleConfirmReject = () => {
    if (!rejectingItem) return;
    const success = rejectContent(rejectingItem.id, rejectionReasons, rejectionComment);
    if (success) {
      setRejectingItem(null);
      setRejectionReasons([]);
      setRejectionComment('');
      alert('Đã từ chối bài viết và gửi thông báo phản hồi tới Creator.');
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Top Banner Context */}
      <div className={`border rounded-2xl p-5 shadow-lg transition-colors ${
        isLight ? 'bg-white border-slate-200' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`p-2 rounded-xl border ${
                isLight ? 'bg-red-50 text-bulbtek-red border-red-200' : 'bg-bulbtek-red/20 text-red-400 border-bulbtek-red/30'
              }`}>
                <Users className="w-5 h-5" />
              </span>
              <h1 className={`text-xl font-bold tracking-wide ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Quản Lý Nhân Sự & Quy Trình Phê Duyệt
              </h1>
            </div>
            <p className={`text-sm mt-1 max-w-3xl ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Phân cấp 3 vai trò (Admin COO, Approver Team Lead, Creator Marketing Exec). Quản lý hàng chờ phê duyệt bài đăng và theo dõi hệ thống email thông báo tự động.
            </p>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-sm font-bold shadow-glow-red transition shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Mời thành viên mới</span>
            </button>
          )}
        </div>
      </div>

      {/* PHẦN 1: DANH SÁCH THÀNH VIÊN */}
      <div className={`border rounded-2xl p-5 space-y-4 shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className="flex items-center justify-between">
          <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center space-x-2 ${
            isLight ? 'text-bulbtek-red' : 'text-red-400'
          }`}>
            <span className="w-2 h-2 rounded-full bg-bulbtek-red"></span>
            <span>1. Danh Sách Thành Viên & Phân Quyền</span>
          </h2>
          <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            Tổng: {users.length} thành viên
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
            <thead className={`uppercase tracking-wider text-[11px] border-y ${
              isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-bulbtek-dark-deep text-gray-400 border-bulbtek-dark-border'
            }`}>
              <tr>
                <th className="py-3 px-4">Tên thành viên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Vai trò hệ thống</th>
                <th className="py-3 px-4">Chức danh</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Ngày tham gia</th>
                <th className="py-3 px-4 text-center">Thư mời</th>
                {isAdmin && <th className="py-3 px-4 text-right">Chỉnh sửa & Phân quyền</th>}
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-bulbtek-dark-border/60'}`}>
              {users.map(u => {
                const isCurrent = u.id === currentUser.id;
                return (
                  <tr key={u.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-bulbtek-dark-deep/40'}`}>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                          isLight ? 'bg-red-50 text-bulbtek-red border-red-200' : 'bg-bulbtek-red/20 text-red-400 border-bulbtek-red/40'
                        }`}>
                          {u.avatar}
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className={`font-bold block ${isLight ? 'text-slate-900' : 'text-white'}`}>{u.name}</span>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMember(u);
                                  setShowEditModal(true);
                                }}
                                className="p-1 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition"
                                title="Chỉnh sửa thông tin thành viên này"
                              >
                                <Edit3 className="w-3 h-3 text-blue-500" />
                              </button>
                            )}
                          </div>
                          {isCurrent && (
                            <span className={`text-[10px] font-medium ${isLight ? 'text-bulbtek-red' : 'text-red-400'}`}>
                              (Bạn đang dùng)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className={`py-3 px-4 font-mono ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{u.email}</td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold border ${
                        u.role === 'ADMIN' 
                          ? (isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950/70 text-red-300 border-red-700') :
                        u.role === 'APPROVER' 
                          ? (isLight ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-950/70 text-amber-300 border-amber-700') :
                          (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/70 text-emerald-300 border-emerald-700')
                      }`}>
                        {u.role === 'ADMIN' ? '🔴 ADMIN (COO)' :
                         u.role === 'APPROVER' ? '🟠 APPROVER (Lead)' :
                         '🟢 CREATOR (Exec)'}
                      </span>
                    </td>

                    <td className={`py-3 px-4 ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{u.roleTitle}</td>

                    <td className="py-3 px-4">
                      <span className={`flex items-center space-x-1.5 text-xs ${isLight ? 'text-emerald-600 font-semibold' : 'text-emerald-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isLight ? 'bg-emerald-500' : 'bg-emerald-400'}`}></span>
                        <span>{u.status}</span>
                      </span>
                    </td>

                    <td className={`py-3 px-4 font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{u.addedDate}</td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleResendInvite(u)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                          isLight 
                            ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100' 
                            : 'bg-purple-950/60 text-purple-300 border-purple-800 hover:bg-purple-900/60'
                        }`}
                        title="Gửi hoặc sao chép thư mời tham gia"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Thư mời</span>
                      </button>
                    </td>

                    {isAdmin && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMember(u);
                              setShowEditModal(true);
                            }}
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                              isLight 
                                ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 shadow-xs' 
                                : 'bg-blue-950/60 hover:bg-blue-900/60 border-blue-800 text-blue-300'
                            }`}
                            title="Chỉnh sửa Email, Tên thành viên, Vai trò và Chức danh (Admin)"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                            <span>Sửa</span>
                          </button>

                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value as UserRole)}
                            className={`border rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-bulbtek-red ${
                              isLight ? 'bg-white border-slate-200 text-slate-800 shadow-xs' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border text-white'
                            }`}
                            title="Đổi nhanh vai trò"
                          >
                            <option value="ADMIN">ADMIN</option>
                            <option value="APPROVER">APPROVER</option>
                            <option value="CREATOR">CREATOR</option>
                          </select>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PHẦN 2: APPROVAL QUEUE (Hàng chờ phê duyệt) */}
      <div className={`border rounded-2xl p-5 space-y-4 shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b ${
          isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'
        }`}>
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center space-x-2 ${
              isLight ? 'text-amber-600' : 'text-amber-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>2. Hàng Chờ Phê Duyệt (Approval Queue)</span>
            </h2>
            <div className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              {isApproverOrAdmin ? (
                <span>Các bài viết đang chờ bạn duyệt ({pendingItems.length} bài). Xếp theo ngày đăng dự kiến.</span>
              ) : (
                <span className={isLight ? 'text-slate-600' : 'text-gray-500'}>
                  🔒 Chỉ người dùng có quyền <strong>APPROVER (Tuấn Anh)</strong> hoặc <strong>ADMIN (Philip)</strong> mới có thể duyệt/từ chối. Hãy dùng switcher ở góc trên để đổi vai trò thử nghiệm.
                </span>
              )}
            </div>
          </div>

          <span className={`text-xs px-2.5 py-1 rounded border font-bold ${
            isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-amber-950/60 border-amber-800 text-amber-300'
          }`}>
            {pendingItems.length} bài Pending
          </span>
        </div>

        {/* Pending Queue List */}
        {isApproverOrAdmin ? (
          <div className="space-y-3">
            {pendingItems.map(item => {
              const compResult = checkBrandCompliance(
                `${item.facebookCaption || ''} ${item.tiktokCaption || ''}`,
                settings.complianceRules || DEFAULT_COMPLIANCE_RULES
              );

              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                    compResult.isViolated
                      ? isLight
                        ? 'bg-amber-50/50 border-amber-300 hover:border-amber-400 hover:bg-amber-50 shadow-xs'
                        : 'bg-amber-950/20 border-amber-800/80 hover:border-amber-600'
                      : isLight 
                        ? 'bg-slate-50 border-slate-200 hover:border-amber-400 hover:bg-white shadow-xs' 
                        : 'bg-bulbtek-dark-deep border-bulbtek-dark-border hover:border-amber-600/50'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isLight ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-amber-950 text-amber-400 border-amber-800'
                      }`}>
                        Chờ duyệt
                      </span>
                      {compResult.isViolated && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 border border-amber-400 dark:border-amber-600 flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                          <span>⚠️ Vi phạm tuân thủ ({compResult.violations.length} lỗi)</span>
                        </span>
                      )}
                      <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>Đăng: {item.date}</span>
                      <span className={`text-xs ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>•</span>
                      <span className={`text-xs font-bold ${isLight ? 'text-bulbtek-red' : 'text-red-400'}`}>{item.channel}</span>
                    </div>

                    <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {item.title || item.productName}
                    </h3>

                    {/* Compliance Alert Box if violated */}
                    {compResult.isViolated && (
                      <div className={`p-2 rounded-lg text-xs border space-y-1 ${
                        isLight ? 'bg-amber-100/70 border-amber-300 text-amber-950' : 'bg-amber-950/60 border-amber-700/80 text-amber-200'
                      }`}>
                        <div className="flex items-center space-x-1 font-bold text-bulbtek-red">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Từ khóa nhạy cảm: {compResult.violations.map(v => `"${v.keyword}"`).join(', ')}</span>
                        </div>
                        <p className="text-[11px] opacity-90 pl-4">
                          💡 Gợi ý chuẩn: {compResult.violations[0]?.suggestion}
                        </p>
                      </div>
                    )}

                    <div className={`text-xs flex flex-wrap items-center gap-3 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      <span>Sản phẩm: <strong className={isLight ? 'text-slate-800' : 'text-gray-200'}>{item.productName}</strong></span>
                      <span>•</span>
                      <span>Tác giả: <strong className={isLight ? 'text-slate-800' : 'text-gray-200'}>{item.createdBy || item.assigneeName}</strong></span>
                      {item.aiModelUsed && (
                        <>
                          <span>•</span>
                          <span className={`font-mono text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>AI: {item.aiModelUsed}</span>
                        </>
                      )}
                    </div>
                  </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg border text-xs transition ${
                      isLight 
                        ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs' 
                        : 'bg-bulbtek-dark-surface hover:bg-gray-800 border-bulbtek-dark-border text-gray-200'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-500" />
                    <span>Xem nhanh</span>
                  </button>

                  <button
                    onClick={() => setRejectingItem(item)}
                    className={`flex items-center space-x-1 px-3.5 py-2 rounded-lg border text-xs font-bold transition ${
                      isLight 
                        ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700' 
                        : 'bg-red-950 hover:bg-red-900 border-red-700 text-red-300'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>❌ Từ chối</span>
                  </button>

                  <button
                    onClick={() => {
                      approveContent(item.id);
                      alert(`✅ Đã duyệt bài: "${item.title}". Email thông báo đã gửi tới Creator!`);
                    }}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-bold transition shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>✅ Duyệt</span>
                  </button>
                </div>
              </div>
            );
          })}

            {pendingItems.length === 0 && (
              <div className={`py-8 text-center ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-semibold">Hiện không có bài viết nào đang chờ phê duyệt.</p>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-6 rounded-xl border text-center ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border text-gray-400'
          }`}>
            <Lock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
            <p className={`text-sm font-semibold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Bạn đang đăng nhập dưới vai trò {currentUser.role} ({currentUser.name})
            </p>
            <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Chỉ Approver (Tuấn Anh) hoặc Admin (Philip) có quyền duyệt. Hãy bấm chọn nút "Tuấn Anh" hoặc "Philip" trên Header để trải nghiệm tính năng phê duyệt!
            </p>
          </div>
        )}
      </div>

      {/* PHẦN 3: EMAIL NOTIFICATION LOG */}
      <div className={`border rounded-2xl p-5 space-y-4 shadow-xl transition-colors ${
        isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-wider flex items-center space-x-2 ${
              isLight ? 'text-blue-700' : 'text-blue-400'
            }`}>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>3. Nhật Ký Thông Báo Email Tự Động (Email Notification Log)</span>
            </h2>
            <div className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              Hệ thống tự động gửi email thông báo khi Submit, Duyệt hoặc Từ chối bài viết.
            </div>
          </div>

          <span className={`text-xs font-mono ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
            {emailLogs.length} thông báo đã ghi nhận
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className={`w-full text-left text-xs ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
            <thead className={`uppercase tracking-wider text-[11px] border-y ${
              isLight ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-bulbtek-dark-deep text-gray-400 border-bulbtek-dark-border'
            }`}>
              <tr>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Loại email</th>
                <th className="py-3 px-4">Người nhận</th>
                <th className="py-3 px-4">Tiêu đề (Subject)</th>
                <th className="py-3 px-4">Nội dung tóm tắt</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-bulbtek-dark-border/60'}`}>
              {emailLogs.map(log => (
                <tr key={log.id} className={`transition ${isLight ? 'hover:bg-slate-50' : 'hover:bg-bulbtek-dark-deep/40'}`}>
                  <td className={`py-3 px-4 font-mono whitespace-nowrap ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{log.timestamp}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      log.type === 'APPROVE' 
                        ? (isLight ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950 text-emerald-300 border-emerald-800') :
                      log.type === 'REJECT' 
                        ? (isLight ? 'bg-red-50 text-red-700 border-red-200' : 'bg-red-950 text-red-300 border-red-800') :
                      log.type === 'SUBMIT' 
                        ? (isLight ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-950 text-blue-300 border-blue-800') :
                      log.type === 'INVITE'
                        ? (isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-950 text-purple-300 border-purple-800') :
                        (isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-gray-800 text-gray-300 border-gray-700')
                    }`}>
                      {log.type === 'INVITE' ? '💌 INVITE' : log.type}
                    </span>
                  </td>
                  <td className={`py-3 px-4 font-mono whitespace-nowrap ${isLight ? 'text-slate-700' : 'text-gray-200'}`}>{log.recipient}</td>
                  <td className={`py-3 px-4 font-bold max-w-xs truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>{log.subject}</td>
                  <td className={`py-3 px-4 max-w-sm truncate ${isLight ? 'text-slate-600' : 'text-gray-300'}`}>{log.body}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`font-bold flex items-center space-x-1 text-[11px] ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                      <Check className="w-3.5 h-3.5" />
                      <span>{log.status}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: MỜI THÀNH VIÊN MỚI (Admin) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleInviteSubmit} className={`border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fadeIn ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border text-white'
          }`}>
            <h3 className={`text-base font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <UserPlus className="w-5 h-5 text-bulbtek-red" />
              <span>Mời Thành Viên Mới Vào Team</span>
            </h3>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Họ và tên *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="VD: Hoàng Long"
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Email nội bộ *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="hoanglong.mkt@bulbtek.vn"
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Vai trò hệ thống</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
                }`}
              >
                <option value="CREATOR">CREATOR (Marketing Exec - Tạo content, Submit)</option>
                <option value="APPROVER">APPROVER (Team Lead - Phê duyệt, Từ chối)</option>
                <option value="ADMIN">ADMIN (COO - Toàn quyền cấu hình & Quản trị)</option>
              </select>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Chức danh hiển thị</label>
              <input
                type="text"
                value={newRoleTitle}
                onChange={(e) => setNewRoleTitle(e.target.value)}
                placeholder="VD: SEO & Content Specialist"
                className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-bulbtek-red ${
                  isLight ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white' : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
                }`}
              />
            </div>

            <div className={`flex justify-end space-x-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'}`}>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className={`px-4 py-2 rounded-xl text-xs ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-gray-400 hover:text-white'}`}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white text-xs font-bold shadow-glow-red"
              >
                Gửi lời mời
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: KẾT QUẢ GỬI THƯ MỜI & HÀNH ĐỘNG GỬI EMAIL */}
      {inviteResult && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-fadeIn ${
            isLight ? 'bg-white border-purple-200 text-slate-900' : 'bg-bulbtek-dark-surface border-purple-600/60 text-white'
          }`}>
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-xl border ${
                  isLight ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-purple-950/60 text-purple-300 border-purple-700'
                }`}>
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    <span>Thư Mời Tham Gia Dashboard</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                      Đã ghi nhận log
                    </span>
                  </h3>
                  <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Hệ thống đã lưu thông tin & ghi nhận lịch sử vào bảng "Nhật Ký Email Tự Động".
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInviteResult(null)}
                className={`p-1.5 rounded-lg ${isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-gray-400 hover:text-white hover:bg-bulbtek-dark-deep'}`}
              >
                ✕
              </button>
            </div>

            {/* Thông tin người nhận */}
            <div className={`p-3.5 rounded-xl border text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 ${
              isLight ? 'bg-purple-50/50 border-purple-100 text-slate-700' : 'bg-purple-950/20 border-purple-900/40 text-gray-300'
            }`}>
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">Thành viên:</span>
                <strong className={isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}>{inviteResult.name}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">Email:</span>
                <span className="font-mono">{inviteResult.email}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">Vai trò:</span>
                <span className="font-bold text-bulbtek-red">{inviteResult.role}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">Chức danh:</span>
                <span>{inviteResult.roleTitle || 'Thành viên'}</span>
              </div>
            </div>

            {/* Khung hành động chính */}
            <div className="space-y-2.5">
              <span className={`text-xs font-bold block ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                Phương thức gửi thư mời:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phương thức 1: Mở app Email */}
                <button
                  type="button"
                  onClick={() => handleOpenMailApp(inviteResult.mailtoUrl)}
                  className="flex flex-col items-center text-center p-3.5 rounded-xl bg-bulbtek-red hover:bg-bulbtek-red-hover text-white shadow-glow-red transition group"
                >
                  <div className="flex items-center space-x-2 font-bold text-xs">
                    <Send className="w-4 h-4" />
                    <span>Mở App Mail Gửi Ngay</span>
                    <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                  </div>
                  <span className="text-[11px] text-red-100 mt-1">
                    Gmail / Outlook tự điền Tiêu đề & Nội dung
                  </span>
                </button>

                {/* Phương thức 2: Copy thư mời gửi qua chat */}
                <button
                  type="button"
                  onClick={() => handleCopyBody(inviteResult.body)}
                  className={`flex flex-col items-center text-center p-3.5 rounded-xl border font-semibold transition ${
                    copiedState === 'body'
                      ? (isLight ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-emerald-950/70 border-emerald-500 text-emerald-300')
                      : (isLight ? 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-800' : 'bg-bulbtek-dark-deep hover:bg-bulbtek-dark-surface border-bulbtek-dark-border text-gray-200')
                  }`}
                >
                  <div className="flex items-center space-x-2 text-xs">
                    {copiedState === 'body' ? (
                      <>
                        <CheckCheck className="w-4 h-4 text-emerald-500" />
                        <span className="font-bold text-emerald-500">Đã sao chép vào Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-purple-400" />
                        <span>Sao Chép Thư Mời</span>
                      </>
                    )}
                  </div>
                  <span className={`text-[11px] mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                    Dán nhanh vào Zalo, Telegram, Skype
                  </span>
                </button>
              </div>

              {/* Nút phụ: Copy link dashboard */}
              <div className="flex items-center justify-between pt-1">
                <span className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  Hoặc sao chép riêng đường dẫn trang:
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                    copiedState === 'link'
                      ? (isLight ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-emerald-950/70 border-emerald-500 text-emerald-300')
                      : (isLight ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border hover:bg-bulbtek-dark-surface text-gray-300')
                  }`}
                >
                  {copiedState === 'link' ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedState === 'link' ? 'Đã sao chép link' : 'Sao chép link Dashboard'}</span>
                </button>
              </div>
            </div>

            {/* Xem trước nội dung thư */}
            <div className="space-y-1.5">
              <span className={`text-xs font-bold block ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                Xem trước nội dung thư mời:
              </span>
              <div className={`p-3 border rounded-xl max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border text-gray-300'
              }`}>
                <div className="font-bold pb-2 mb-2 border-b border-dashed border-gray-300 dark:border-gray-700">
                  Tiêu đề: {inviteResult.subject}
                </div>
                {inviteResult.body}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex justify-end pt-3 border-t ${isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'}`}>
              <button
                type="button"
                onClick={() => setInviteResult(null)}
                className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition"
              >
                Hoàn tất & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XEM NHANH BÀI PENDING */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl animate-fadeIn ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-bulbtek-dark-surface border-bulbtek-dark-border text-white'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b ${isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'}`}>
              <div>
                <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{previewItem.title || previewItem.productName}</h3>
                <div className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  Kênh: <strong className={isLight ? 'text-bulbtek-red' : 'text-red-400'}>{previewItem.channel}</strong> | Đăng: {previewItem.date} | Tạo bởi: {previewItem.createdBy}
                </div>
              </div>
              <button onClick={() => setPreviewItem(null)} className={`p-1 ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-gray-400 hover:text-white'}`}>✕</button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Compliance Check Alert in Preview Modal */}
              {(() => {
                const compResult = checkBrandCompliance(
                  `${previewItem.facebookCaption || ''} ${previewItem.tiktokCaption || ''}`,
                  settings.complianceRules || DEFAULT_COMPLIANCE_RULES
                );
                if (compResult.isViolated) {
                  return (
                    <div className={`p-3 rounded-xl border space-y-2 ${
                      isLight ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-amber-950/40 border-amber-800 text-amber-200'
                    }`}>
                      <div className="flex items-center space-x-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Cảnh báo tuân thủ 3 nguyên tắc thương hiệu ({compResult.violations.length} lỗi):</span>
                      </div>
                      <div className="space-y-1.5 pl-6 text-xs">
                        {compResult.violations.map((v, i) => (
                          <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1 text-[11px]">
                            <span className="font-bold text-bulbtek-red shrink-0">
                              • Từ khóa: "{v.keyword}" [{v.principle}]:
                            </span>
                            <span className="opacity-90">{v.suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div className={`p-2.5 rounded-xl border flex items-center space-x-2 text-xs ${
                    isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  }`}>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>✓ Nội dung bài viết đạt chuẩn 3 nguyên tắc thương hiệu Bulbtek.</span>
                  </div>
                );
              })()}

              <div>
                <span className={`text-xs font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>Facebook Caption:</span>
                <div className={`p-3.5 border rounded-xl text-xs whitespace-pre-wrap leading-relaxed ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border text-gray-200'
                }`}>
                  {previewItem.facebookCaption || 'Chưa có caption Facebook.'}
                </div>
              </div>

              {previewItem.tiktokCaption && (
                <div>
                  <span className={`text-xs font-bold block mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>TikTok Caption:</span>
                  <div className={`p-3.5 border rounded-xl text-xs whitespace-pre-wrap leading-relaxed ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border text-gray-200'
                  }`}>
                    {previewItem.tiktokCaption}
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-end space-x-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'}`}>
              <button
                onClick={() => setPreviewItem(null)}
                className={`px-4 py-2 rounded-xl text-xs ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-gray-400 hover:text-white'}`}
              >
                Đóng
              </button>

              <button
                onClick={() => {
                  const item = previewItem;
                  setPreviewItem(null);
                  setRejectingItem(item);
                }}
                className={`px-4 py-2 rounded-xl border text-xs font-bold ${
                  isLight ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-700' : 'bg-red-950 hover:bg-red-900 border-red-700 text-red-300'
                }`}
              >
                Từ chối
              </button>

              <button
                onClick={() => {
                  approveContent(previewItem.id);
                  setPreviewItem(null);
                  alert('✅ Đã phê duyệt bài viết!');
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-bold"
              >
                ✅ Duyệt bài ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TỪ CHỐI BÀI VIẾT */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-fadeIn ${
            isLight ? 'bg-white border-red-300 text-slate-900' : 'bg-bulbtek-dark-surface border-red-600/70 text-white'
          }`}>
            <div className={`flex items-center space-x-2 ${isLight ? 'text-bulbtek-red' : 'text-red-400'}`}>
              <XCircle className="w-5 h-5" />
              <h3 className={`text-base font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Từ Chối Duyệt: "{rejectingItem.title || rejectingItem.productName}"
              </h3>
            </div>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
              Quy tắc hệ thống: Cần chọn tối thiểu 1 lý do và nhận xét tối thiểu 20 ký tự để tác giả biết hướng sửa đổi.
            </p>

            {/* Checkbox lý do nhanh */}
            <div className="space-y-2">
              <label className={`block text-xs font-bold ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                1. Lý do từ chối nhanh (chọn ≥ 1):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {REJECT_REASONS_LIST.map(reason => {
                  const isChecked = rejectionReasons.includes(reason);
                  return (
                    <label
                      key={reason}
                      className={`p-2 rounded-lg border text-xs flex items-center space-x-2 cursor-pointer transition ${
                        isChecked 
                          ? (isLight ? 'bg-red-50 border-red-500 text-red-700 font-semibold' : 'bg-red-950/40 border-red-600 text-white')
                          : (isLight ? 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300' : 'bg-bulbtek-dark-deep border-bulbtek-dark-border text-gray-400')
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          setRejectionReasons(prev => 
                            prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
                          );
                        }}
                        className="rounded accent-red-600"
                      />
                      <span>{reason}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Mandatory Comment */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className={isLight ? 'text-slate-700' : 'text-gray-300'}>2. Nhận xét chi tiết cho tác giả *</span>
                <span className={
                  rejectionComment.trim().length >= 20 
                    ? (isLight ? 'text-emerald-600' : 'text-emerald-400')
                    : (isLight ? 'text-amber-600' : 'text-amber-400')
                }>
                  {rejectionComment.trim().length}/20 ký tự tối thiểu
                </span>
              </div>
              <textarea
                rows={4}
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                placeholder="Nhập hướng dẫn chỉnh sửa cụ thể (tối thiểu 20 ký tự)..."
                className={`w-full rounded-xl p-3 text-xs focus:outline-none focus:border-red-500 ${
                  isLight 
                    ? 'bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white' 
                    : 'bg-bulbtek-dark-deep border border-bulbtek-dark-border text-white'
                }`}
              />
            </div>

            <div className={`flex justify-end space-x-3 pt-3 border-t ${isLight ? 'border-slate-200' : 'border-bulbtek-dark-border'}`}>
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className={`px-4 py-2 rounded-xl text-xs ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-gray-400 hover:text-white'}`}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={rejectionReasons.length === 0 || rejectionComment.trim().length < 20}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg transition"
              >
                Xác nhận từ chối & Gửi thông báo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Member Modal */}
      <EditTeamMemberModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingMember(null);
        }}
        member={editingMember}
        onSave={(updated) => updateTeamMember(updated)}
        theme={theme}
      />

    </div>
  );
};

