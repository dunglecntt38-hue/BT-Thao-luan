import React, { useState } from 'react';
import { SessionData } from '../types.ts';
import { ApiService } from '../services/api.ts';
import {
  X,
  Settings,
  Lock,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  BookOpen
} from 'lucide-react';

interface SettingsModalProps {
  session: SessionData;
  onClose: () => void;
  onUpdate: (updatedSession: SessionData) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  session,
  onClose,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'reset'>('general');
  const [sessionTitle, setSessionTitle] = useState(session.sessionTitle);
  const [isOpen, setIsOpen] = useState(session.isOpen);
  const [allowEditAfterSubmit, setAllowEditAfterSubmit] = useState(session.allowEditAfterSubmit);
  const [situationContext, setSituationContext] = useState(session.situationContext || '');
  const [teacherPin, setTeacherPin] = useState(session.teacherPin || '1234');
  const [pinVerification, setPinVerification] = useState(sessionStorage.getItem('teacher_auth_pin') || '');

  // Reset session form
  const [newSessionTitle, setNewSessionTitle] = useState('Thảo luận bài mới: Quyền tác giả và bảo hộ tài sản trí tuệ');
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);
    setIsSaving(true);

    try {
      const pinToUse = pinVerification.trim() || session.teacherPin;
      const res = await ApiService.updateSettings({
        sessionTitle,
        isOpen,
        allowEditAfterSubmit,
        situationContext,
        teacherPin,
        pin: pinToUse,
      });

      if (pinToUse) {
        sessionStorage.setItem('teacher_auth_pin', pinToUse);
      }
      setFeedbackMsg({ type: 'success', text: 'Đã lưu thay đổi cài đặt thành công!' });
      setTimeout(() => {
        onUpdate(res.data);
      }, 500);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Lỗi khi cập nhật cài đặt' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSession = async () => {
    if (resetConfirmText.trim().toUpperCase() !== 'XAC NHAN') {
      setFeedbackMsg({ type: 'error', text: 'Vui lòng nhập chính xác chữ "XAC NHAN" để đảm bảo an toàn dữ liệu.' });
      return;
    }

    setFeedbackMsg(null);
    setIsResetting(true);

    try {
      const pinToUse = pinVerification.trim() || session.teacherPin;
      const res = await ApiService.resetSession(pinToUse, newSessionTitle, situationContext);
      setFeedbackMsg({
        type: 'success',
        text: 'Đã lưu trữ dữ liệu cũ vào lịch sử và bắt đầu buổi học mới thành công!',
      });
      setTimeout(() => {
        onUpdate(res.data);
        onClose();
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Lỗi khi khởi tạo buổi học mới' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-indigo-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Quản Lý Buổi Thảo Luận</h3>
              <p className="text-xs text-slate-300">
                Điều khiển trạng thái nhận bài, bảo mật và tổ chức buổi học
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Cài Đặt Hiện Tại
          </button>
          <button
            onClick={() => setActiveTab('reset')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'reset'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-rose-600'
            }`}
          >
            Tạo Buổi Thảo Luận Mới (Lưu lịch sử)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {feedbackMsg && (
            <div
              className={`p-3.5 rounded-xl text-sm flex items-center gap-2.5 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-700'
              }`}
            >
              {feedbackMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMsg.text}</span>
            </div>
          )}

          {activeTab === 'general' ? (
            <form onSubmit={handleSaveSettings} className="space-y-4">
              {/* Session Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên buổi thảo luận / Chủ đề bài học
                </label>
                <input
                  type="text"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                  required
                />
              </div>

              {/* Tình huống thảo luận mở rộng (giáo viên có thể nhập nếu muốn) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Tình huống thảo luận (Không bắt buộc)
                </label>
                <textarea
                  rows={3}
                  value={situationContext}
                  onChange={(e) => setSituationContext(e.target.value)}
                  placeholder="Giáo viên có thể nhập nội dung tình huống hoặc bối cảnh áp phích của An ở đây để hiển thị thêm cho học sinh đọc tham khảo..."
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  * Ghi chú: 4 câu hỏi chính được giữ nguyên vẹn đúng quy định chuyên môn.
                </p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Is Open toggle */}
                <div
                  onClick={() => setIsOpen(!isOpen)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isOpen
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Trạng thái nhận bài</div>
                    <div className="text-[11px] text-slate-500">
                      {isOpen ? 'Đang mở (Học sinh có thể nộp bài)' : 'Đã đóng (Khóa nộp bài)'}
                    </div>
                  </div>
                  {isOpen ? (
                    <ToggleRight className="w-7 h-7 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </div>

                {/* Allow Edit After Submit */}
                <div
                  onClick={() => setAllowEditAfterSubmit(!allowEditAfterSubmit)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    allowEditAfterSubmit
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">Cho phép sửa sau khi gửi</div>
                    <div className="text-[11px] text-slate-500">
                      {allowEditAfterSubmit ? 'Học sinh có thể cập nhật lại bài' : 'Khóa chỉnh sửa sau khi gửi'}
                    </div>
                  </div>
                  {allowEditAfterSubmit ? (
                    <ToggleRight className="w-7 h-7 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Teacher PIN */}
              <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase">
                  <Lock className="w-4 h-4 text-slate-500" />
                  Mã PIN bảo vệ quyền giáo viên
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Mã PIN xác nhận hiện tại:
                    </label>
                    <input
                      type="password"
                      value={pinVerification}
                      onChange={(e) => setPinVerification(e.target.value)}
                      placeholder="Mặc định: 1234"
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Đổi sang mã PIN mới:
                    </label>
                    <input
                      type="text"
                      value={teacherPin}
                      onChange={(e) => setTeacherPin(e.target.value)}
                      placeholder="Nhập mã PIN mới nếu muốn đổi"
                      className="w-full text-xs p-2 border border-slate-300 rounded-lg font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl text-sm font-bold shadow-md transition"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          ) : (
            /* RESET / NEW SESSION TAB */
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-2 text-sm text-amber-950">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  Khởi tạo buổi thảo luận mới cho lớp tiếp theo
                </div>
                <p>
                  Hệ thống sẽ <strong>tự động lưu trữ toàn bộ dữ liệu 12 nhóm hiện tại vào thư mục lịch sử</strong> trước khi làm mới, không làm mất bài cũ của học sinh.
                </p>
                <p>
                  12 nhóm học sinh mới sẽ bắt đầu với các ô trả lời sạch sẽ, sẵn sàng thảo luận.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tên buổi thảo luận mới
                </label>
                <input
                  type="text"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mã PIN giáo viên xác nhận
                </label>
                <input
                  type="password"
                  value={pinVerification}
                  onChange={(e) => setPinVerification(e.target.value)}
                  placeholder="Mặc định: 1234"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-xl font-mono bg-white"
                />
              </div>

              <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-2">
                <label className="block text-xs font-bold text-rose-900 uppercase">
                  Xác nhận an toàn: Nhập chữ "XAC NHAN" để khởi tạo
                </label>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  placeholder="Nhập: XAC NHAN"
                  className="w-full text-sm p-2.5 border border-rose-300 rounded-xl font-mono bg-white text-rose-800 font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleResetSession}
                  disabled={isResetting || resetConfirmText.trim().toUpperCase() !== 'XAC NHAN'}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl text-sm font-bold shadow-md transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isResetting ? 'Đang lưu trữ & tạo mới...' : 'Xác Nhận Tạo Buổi Mới'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
