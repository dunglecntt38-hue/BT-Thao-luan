import React from 'react';
import { GroupData, STATUS_CONFIG } from '../types.ts';
import { X, Tv, MessageSquareQuote, Clock, Users, Calendar, AlertCircle } from 'lucide-react';

interface GroupDetailModalProps {
  group: GroupData | null;
  questions: [string, string, string, string];
  onClose: () => void;
  onOpenPresentation: (group: GroupData) => void;
  onOpenFeedback: (group: GroupData) => void;
}

export const GroupDetailModal: React.FC<GroupDetailModalProps> = ({
  group,
  questions,
  onClose,
  onOpenPresentation,
  onOpenFeedback,
}) => {
  if (!group) return null;

  const statusInfo = STATUS_CONFIG[group.status] || STATUS_CONFIG.not_started;
  const EMPTY_NOTICE = 'Nhóm chưa nhập câu trả lời cho câu hỏi này.';

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'Chưa có thông tin thời gian';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getAnswer = (qKey: 'q1' | 'q2' | 'q3' | 'q4') => {
    // If submitted answer exists, show it; else show draft if available
    const ans = (group.answers[qKey] || group.draftAnswers?.[qKey] || '').trim();
    return ans || null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xl shadow-inner">
              {group.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xl">{group.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.badgeClass}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5" />
                Thời gian gửi bài: {formatDateTime(group.submittedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Member names if available */}
        {group.members && (
          <div className="bg-blue-50/70 border-b border-blue-100 px-6 py-2.5 text-xs text-slate-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-slate-900">Thành viên:</span>
            <span>{group.members}</span>
          </div>
        )}

        {/* Question & Student Answers List */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Question 1 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-md text-sm shrink-0">
                Câu 1
              </span>
              <h4 className="font-semibold text-slate-800 text-base leading-snug">
                {questions[0]}
              </h4>
            </div>
            <div className="pl-3 border-l-3 border-blue-500 bg-slate-50 p-3.5 rounded-r-lg">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Câu trả lời của học sinh:
              </span>
              {getAnswer('q1') ? (
                <p className="text-slate-900 text-sm whitespace-pre-wrap leading-relaxed">
                  {getAnswer('q1')}
                </p>
              ) : (
                <p className="text-amber-700 italic text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {EMPTY_NOTICE}
                </p>
              )}
            </div>
          </div>

          {/* Question 2 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-md text-sm shrink-0">
                Câu 2
              </span>
              <h4 className="font-semibold text-slate-800 text-base leading-snug">
                {questions[1]}
              </h4>
            </div>
            <div className="pl-3 border-l-3 border-blue-500 bg-slate-50 p-3.5 rounded-r-lg">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Câu trả lời của học sinh:
              </span>
              {getAnswer('q2') ? (
                <p className="text-slate-900 text-sm whitespace-pre-wrap leading-relaxed">
                  {getAnswer('q2')}
                </p>
              ) : (
                <p className="text-amber-700 italic text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {EMPTY_NOTICE}
                </p>
              )}
            </div>
          </div>

          {/* Question 3 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-md text-sm shrink-0">
                Câu 3
              </span>
              <h4 className="font-semibold text-slate-800 text-base leading-snug">
                {questions[2]}
              </h4>
            </div>
            <div className="pl-3 border-l-3 border-blue-500 bg-slate-50 p-3.5 rounded-r-lg">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Câu trả lời của học sinh:
              </span>
              {getAnswer('q3') ? (
                <p className="text-slate-900 text-sm whitespace-pre-wrap leading-relaxed">
                  {getAnswer('q3')}
                </p>
              ) : (
                <p className="text-amber-700 italic text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {EMPTY_NOTICE}
                </p>
              )}
            </div>
          </div>

          {/* Question 4 */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-start gap-2">
              <span className="bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-md text-sm shrink-0">
                Câu 4
              </span>
              <h4 className="font-semibold text-slate-800 text-base leading-snug">
                {questions[3]}
              </h4>
            </div>
            <div className="pl-3 border-l-3 border-blue-500 bg-slate-50 p-3.5 rounded-r-lg">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Câu trả lời của học sinh:
              </span>
              {getAnswer('q4') ? (
                <p className="text-slate-900 text-sm whitespace-pre-wrap leading-relaxed">
                  {getAnswer('q4')}
                </p>
              ) : (
                <p className="text-amber-700 italic text-sm flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {EMPTY_NOTICE}
                </p>
              )}
            </div>
          </div>

          {/* Teacher Review Box (if any) */}
          {(group.feedback.general || group.feedback.strengths || group.feedback.areasToImprove || group.feedback.nextSteps) && (
            <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-sm">
                  <MessageSquareQuote className="w-4 h-4 text-emerald-600" />
                  Nhận xét hiện tại của giáo viên:
                </h4>
                <span className="text-xs text-emerald-700 font-medium">
                  {group.feedback.isPublished ? 'Đã công bố cho học sinh' : 'Chưa công bố (chỉ giáo viên thấy)'}
                </span>
              </div>
              {group.feedback.general && (
                <p className="text-xs text-slate-800">
                  <strong className="text-slate-900">Chung:</strong> {group.feedback.general}
                </p>
              )}
              {group.feedback.strengths && (
                <p className="text-xs text-slate-800">
                  <strong className="text-slate-900">Điểm mạnh:</strong> {group.feedback.strengths}
                </p>
              )}
              {group.feedback.areasToImprove && (
                <p className="text-xs text-slate-800">
                  <strong className="text-slate-900">Cần bổ sung:</strong> {group.feedback.areasToImprove}
                </p>
              )}
              {group.feedback.nextSteps && (
                <p className="text-xs text-slate-800">
                  <strong className="text-slate-900">Hướng hoàn thiện:</strong> {group.feedback.nextSteps}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Cập nhật lần cuối: {group.updatedAt ? formatDateTime(group.updatedAt) : 'Chưa có'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenPresentation(group);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <Tv className="w-4 h-4" /> Trình chiếu nhóm này
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenFeedback(group);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
            >
              <MessageSquareQuote className="w-4 h-4" /> Nhận xét bài làm
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-sm font-medium transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
