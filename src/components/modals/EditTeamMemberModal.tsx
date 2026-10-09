import React, { useState, useEffect } from 'react';
import { TeamMember, UserRole } from '../../types';
import { X, UserCheck, Shield, Mail, Briefcase, User, CheckCircle2 } from 'lucide-react';

interface EditTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onSave: (updatedMember: TeamMember) => void;
  theme: 'light' | 'dark';
}

export const EditTeamMemberModal: React.FC<EditTeamMemberModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  theme
}) => {
  if (!isOpen || !member) return null;
  const isLight = theme === 'light';

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<UserRole>('CREATOR');
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (member) {
      setName(member.name || '');
      setEmail(member.email || '');
      setRole(member.role || 'CREATOR');
      setRoleTitle(member.roleTitle || '');
      setStatus(member.status || 'Active');
      setErrorMsg(null);
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Vui lòng nhập tên thành viên!');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ!');
      return;
    }
    if (!roleTitle.trim()) {
      setErrorMsg('Vui lòng nhập chức danh chuyên môn!');
      return;
    }

    const updated: TeamMember = {
      ...member,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      roleTitle: roleTitle.trim(),
      status,
      avatar: name.trim().slice(0, 2).toUpperCase()
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
        isLight ? 'bg-white border-slate-200' : 'bg-[#18181D] border-[#2A2A32]'
      }`}>
        
        {/* MODAL HEADER */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#121215] border-[#2A2A32]'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base font-bold flex items-center space-x-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <span>Chỉnh Sửa Thông Tin Thành Viên</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/30">
                  Admin Only
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                Cập nhật Họ tên, Email, Vai trò hệ thống và Chức danh chuyên môn của thành viên.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              isLight ? 'hover:bg-slate-200 text-slate-500' : 'hover:bg-[#202026] text-gray-400'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Tên thành viên */}
          <div className="space-y-1.5">
            <label className={`block font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span>Họ và Tên Thành Viên (*):</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-blue-500 transition ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
              }`}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className={`block font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              <Mail className="w-3.5 h-3.5 text-purple-500" />
              <span>Địa Chỉ Email Công Việc (*):</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ví dụ: nguyen.a@bulbtek.vn"
              className={`w-full p-2.5 rounded-xl border text-xs font-mono focus:outline-none focus:border-blue-500 transition ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vai trò hệ thống */}
            <div className="space-y-1.5">
              <label className={`block font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                <span>Vai Trò Hệ Thống (*):</span>
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={`w-full p-2.5 rounded-xl border text-xs font-bold focus:outline-none focus:border-blue-500 transition ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                }`}
              >
                <option value="CREATOR">🟢 CREATOR (Người sáng tạo nội dung)</option>
                <option value="APPROVER">🟠 APPROVER (Trưởng nhóm duyệt bài)</option>
                <option value="ADMIN">🔴 ADMIN (Quản trị viên cấp cao)</option>
              </select>
            </div>

            {/* Trạng thái hoạt động */}
            <div className="space-y-1.5">
              <label className={`block font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Trạng Thái Hoạt Động:</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={`w-full p-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:border-blue-500 transition ${
                  isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
                }`}
              >
                <option value="Active">Đang hoạt động (Active)</option>
                <option value="Inactive">Tạm ngưng (Inactive)</option>
              </select>
            </div>
          </div>

          {/* Chức danh chuyên môn */}
          <div className="space-y-1.5">
            <label className={`block font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
              <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
              <span>Chức Danh Chuyên Môn (*):</span>
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="Ví dụ: Content Lead, Video Creator, Digital Marketing, Marketing Lead..."
              className={`w-full p-2.5 rounded-xl border text-xs focus:outline-none focus:border-blue-500 transition ${
                isLight ? 'bg-white border-slate-300 text-slate-900' : 'bg-[#121215] border-[#2F2F37] text-white'
              }`}
            />
          </div>

          {/* Quick Info Box */}
          <div className={`p-3 rounded-xl border text-[11px] leading-relaxed ${
            isLight ? 'bg-blue-50/70 border-blue-200 text-blue-900' : 'bg-blue-950/20 border-blue-900/40 text-blue-300'
          }`}>
            <span className="font-bold">Ghi chú phân quyền:</span> Thay đổi sẽ có hiệu lực tức thì và đồng bộ trực tiếp vào cơ sở dữ liệu PostgreSQL cho toàn bộ hệ thống.
          </div>

          {/* MODAL FOOTER */}
          <div className="pt-3 border-t border-inherit flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition ${
                isLight ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#18181D] hover:bg-[#202026] border-[#2F2F37] text-gray-300'
              }`}
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
