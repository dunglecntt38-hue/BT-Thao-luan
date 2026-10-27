import React, { useState, useEffect } from 'react';
import { GroupData, GroupFeedback } from '../types.ts';
import { ApiService } from '../services/api.ts';
import { X, Save, CheckCircle2, MessageSquare, AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';

interface FeedbackModalProps {
  group: GroupData | null;
  teacherPin: string;
  onClose: () => void;
  onSuccess: (updatedGroup: GroupData) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  group,
  teacherPin,
  onClose,
  onSuccess,
}) => {
  if (!group) return null;

  const [feedback, setFeedback] = useState<GroupFeedback>({
    general: '',
    strengths: '',
    areasToImprove: '',
    nextSteps: '',
    isPublished: true,
    updatedAt: null,
  });

  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  useEffect(() => {
    if (group) {
      setFeedback({
        general: group.feedback?.general || '',
        strengths: group.feedback?.strengths || '',
        areasToImprove: group.feedback?.areasToImprove || '',
        nextSteps: group.feedback?.nextSteps || '',
        isPublished: group.feedback?.isPublished ?? true,
        updatedAt: group.feedback?.updatedAt || null,
      });
      // Pre-fill pin if teacher previously authenticated in this tab
      const savedPin = sessionStorage.getItem('teacher_auth_pin');
      if (savedPin) setPinInput(savedPin);
    }
  }, [group]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSaving(true);

    try {
      const pinToUse = pinInput.trim() || teacherPin;
      const res = await ApiService.saveFeedback(group.id, feedback, pinToUse);
      if (pinToUse) {
        sessionStorage.setItem('teacher_auth_pin', pinToUse);
      }
      setSuccessSaved(true);
      setTimeout(() => {
        onSuccess(res.data);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể lưu nhận xét');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">
                Nhận Xét Hoạt Động – {group.name}
              </h3>
              <p className="text-xs text-emerald-100">
                Đánh giá và định hướng cho học sinh theo 4 tiêu chí chuyên môn
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

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successSaved && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span className="font-semibold">Đã lưu nhận xét thành công vào cơ sở dữ liệu!</span>
            </div>
          )}

          {/* Quick summary of group submission */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">Trạng thái bài nộp: </span>
              {group.submittedAt ? (
                <span className="text-blue-600 font-medium">Đã gửi bài lúc {new Date(group.submittedAt).toLocaleTimeString('vi-VN')}</span>
              ) : (
                <span className="text-amber-600 font-medium">Chưa nộp bài chính thức (hoặc đang làm nháp)</span>
              )}
            </div>
            <div className="text-slate-500">
              {group.feedback.updatedAt ? `Đã nhận xét: ${new Date(group.feedback.updatedAt).toLocaleTimeString('vi-VN')}` : 'Chưa nhận xét'}
            </div>
          </div>

          {/* 1. Nhận xét chung */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              1. Nhận xét chung <span className="text-slate-400 font-normal">(Thái độ làm việc nhóm, mức độ hoàn thành bài)</span>
            </label>
            <textarea
              rows={3}
              value={feedback.general}
              onChange={(e) => setFeedback({ ...feedback, general: e.target.value })}
              placeholder="VD: Nhóm làm việc tích cực, có sự phối hợp đồng đều giữa các thành viên, hoàn thành cả 4 câu hỏi đúng hạn..."
              className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          {/* 2. Điểm mạnh trong phần thảo luận */}
          <div>
            <label className="block text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1.5">
              2. Điểm mạnh trong phần thảo luận
            </label>
            <textarea
              rows={3}
              value={feedback.strengths}
              onChange={(e) => setFeedback({ ...feedback, strengths: e.target.value })}
              placeholder="VD: Xác định chính xác tác giả là người trực tiếp sáng tạo; lập luận chặt chẽ về quyền nhân thân và quyền tài sản..."
              className="w-full text-sm p-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          {/* 3. Nội dung cần bổ sung */}
          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1.5">
              3. Nội dung cần bổ sung
            </label>
            <textarea
              rows={3}
              value={feedback.areasToImprove}
              onChange={(e) => setFeedback({ ...feedback, areasToImprove: e.target.value })}
              placeholder="VD: Cần làm rõ hơn hành vi xóa tên tác giả vi phạm quyền nhân thân theo luật Sở hữu trí tuệ..."
              className="w-full text-sm p-3 border border-amber-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          {/* 4. Hướng hoàn thiện */}
          <div>
            <label className="block text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1.5">
              4. Hướng hoàn thiện
            </label>
            <textarea
              rows={3}
              value={feedback.nextSteps}
              onChange={(e) => setFeedback({ ...feedback, nextSteps: e.target.value })}
              placeholder="VD: Khi cần sử dụng sản phẩm sáng tạo của người khác, phải liên hệ xin phép, ghi rõ nguồn và tên tác giả..."
              className="w-full text-sm p-3 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
            />
          </div>

          {/* Public / Private toggle & PIN security */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {feedback.isPublished ? (
                  <Eye className="w-5 h-5 text-emerald-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    Công bố nhận xét cho học sinh xem
                  </div>
                  <div className="text-xs text-slate-500">
                    {feedback.isPublished
                      ? 'Học sinh nhóm này có thể xem nhận xét của giáo viên trên điện thoại.'
                      : 'Chỉ giáo viên mới nhìn thấy nhận xét này (bản thảo lưu nội bộ).'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={feedback.isPublished}
                onChange={(e) => setFeedback({ ...feedback, isPublished: e.target.checked })}
                className="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
            </div>

            {/* PIN protection input */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                <Lock className="w-3.5 h-3.5 text-slate-400" /> Mã PIN giáo viên:
              </span>
              <input
                type="password"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Mặc định: 1234"
                className="w-36 text-xs p-1.5 border border-slate-300 rounded-lg font-mono focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white rounded-xl text-sm font-bold shadow-md transition"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Đang lưu...' : 'LƯU NHẬN XÉT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
