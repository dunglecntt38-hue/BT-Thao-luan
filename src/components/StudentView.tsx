import React, { useState, useEffect, useRef } from 'react';
import { SessionData, GroupData, GroupAnswers, STATUS_CONFIG } from '../types.ts';
import { ApiService } from '../services/api.ts';
import confetti from 'canvas-confetti';
import {
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Send,
  Edit3,
  HelpCircle,
  Wifi,
  WifiOff,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileCheck2,
  MessageSquareQuote
} from 'lucide-react';

interface StudentViewProps {
  session: SessionData;
  isConnected: boolean;
  onSwitchToTeacher: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  session,
  isConnected,
  onSwitchToTeacher,
}) => {
  // Step 1: Welcome screen
  // Step 2: Choose group
  // Step 3: Discussion workspace
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(() => {
    const saved = localStorage.getItem('thpt_student_group_id');
    return saved ? parseInt(saved, 10) : null;
  });

  const [membersInput, setMembersInput] = useState('');
  const [answers, setAnswers] = useState<GroupAnswers>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });

  // State flags
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Retrieve current group
  const currentGroup = session.groups.find((g) => g.id === selectedGroupId) || null;

  // Auto load answers from group on mount or when group changes
  useEffect(() => {
    if (currentGroup) {
      // Priority: saved local draft or server group draft or answers
      const localKey = `thpt_draft_g${currentGroup.id}_answers`;
      const savedLocal = localStorage.getItem(localKey);
      let initAnswers = { ...currentGroup.draftAnswers };

      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          // If local has more recent length, use it
          if (parsed && (parsed.q1 || parsed.q2 || parsed.q3 || parsed.q4)) {
            initAnswers = parsed;
          }
        } catch {
          // fallback
        }
      } else if (currentGroup.answers.q1 || currentGroup.answers.q2 || currentGroup.answers.q3 || currentGroup.answers.q4) {
        initAnswers = { ...currentGroup.answers };
      }

      setAnswers(initAnswers);
      setMembersInput(currentGroup.members || '');

      if (currentGroup.status === 'submitted' || currentGroup.status === 'reviewed') {
        setIsEditingMode(false);
      } else {
        setIsEditingMode(true);
      }
    }
  }, [selectedGroupId, currentGroup?.submittedAt]);

  // Sync to local storage on any change to prevent any data loss
  useEffect(() => {
    if (selectedGroupId) {
      localStorage.setItem(`thpt_draft_g${selectedGroupId}_answers`, JSON.stringify(answers));
    }
  }, [answers, selectedGroupId]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleSelectGroup = (groupId: number) => {
    setSelectedGroupId(groupId);
    localStorage.setItem('thpt_student_group_id', groupId.toString());
  };

  const handleDraftSave = async (silent = false) => {
    if (!selectedGroupId) return;
    if (!silent) setIsSavingDraft(true);

    try {
      await ApiService.saveDraft(selectedGroupId, answers, membersInput.trim());
      if (!silent) {
        showToast('success', 'Đã lưu bản nháp thành công! Bạn có thể tiếp tục chỉnh sửa bất kỳ lúc nào.');
      }
    } catch (err: any) {
      if (!silent) {
        showToast('error', err.message || 'Lỗi khi lưu bản nháp lên máy chủ. Đã lưu an toàn trên máy của bạn.');
      }
    } finally {
      if (!silent) setIsSavingDraft(false);
    }
  };

  const handleCheckAnswers = () => {
    const missing: string[] = [];
    if (!answers.q1.trim()) missing.push('Câu 1: Ai là người trực tiếp sáng tạo ra sản phẩm?');
    if (!answers.q2.trim()) missing.push('Câu 2: Việc xóa tên tác giả và đăng lại sản phẩm có phù hợp không? Vì sao?');
    if (!answers.q3.trim()) missing.push('Câu 3: Quyền tác giả trong tình huống này liên quan đến những quyền nào?');
    if (!answers.q4.trim()) missing.push('Câu 4: Nếu muốn sử dụng áp phích của An, em nên làm gì?');

    setValidationErrors(missing);
    if (missing.length === 0) {
      showToast('success', 'Xuất sắc! Nhóm đã trả lời đầy đủ cả 4 câu hỏi. Bạn có thể bấm "GỬI BÀI" ngay.');
    } else {
      showToast('info', `Còn thiếu ${missing.length} câu hỏi chưa nhập câu trả lời.`);
    }
  };

  const handleOpenSubmitModal = () => {
    // Check missing
    const missing: string[] = [];
    if (!answers.q1.trim()) missing.push('Câu 1: Ai là người trực tiếp sáng tạo ra sản phẩm?');
    if (!answers.q2.trim()) missing.push('Câu 2: Việc xóa tên tác giả và đăng lại sản phẩm có phù hợp không? Vì sao?');
    if (!answers.q3.trim()) missing.push('Câu 3: Quyền tác giả trong tình huống này liên quan đến những quyền nào?');
    if (!answers.q4.trim()) missing.push('Câu 4: Nếu muốn sử dụng áp phích của An, em nên làm gì?');

    setValidationErrors(missing);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!selectedGroupId) return;
    setIsSubmitting(true);

    try {
      const res = await ApiService.submitAnswers(selectedGroupId, answers, membersInput.trim());
      setShowConfirmModal(false);
      setIsEditingMode(false);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      showToast('success', res.message || 'Gửi bài thành công! Bài làm của nhóm đã hiển thị trên màn hình giáo viên.');
    } catch (err: any) {
      showToast('error', err.message || 'Lỗi khi gửi bài');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SCREEN 1: Welcome Landing Screen
  if (!hasStarted && !selectedGroupId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-950 text-white flex flex-col justify-between p-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center border border-blue-400/40">
              <BookOpen className="w-4 h-4 text-blue-200" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-blue-200 uppercase">
              {session.schoolName}
            </span>
          </div>
          <button
            onClick={onSwitchToTeacher}
            className="text-xs text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition border border-white/10"
          >
            Màn hình Giáo viên
          </button>
        </header>

        <main className="my-auto py-12 max-w-lg mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-1.5 rounded-full text-xs font-bold text-blue-200">
            <Sparkles className="w-4 h-4 text-blue-300" />
            Hệ Thống Thảo Luận Nhóm Thời Gian Thực
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-100 via-white to-purple-200">
            PHÒNG THẢO LUẬN SỐ
          </h1>

          <div className="space-y-2 text-base md:text-lg text-blue-100">
            <p className="font-semibold text-white">Môn Tin học 10</p>
            <p className="text-sm text-blue-200">Trường: {session.schoolName}</p>
            <p className="text-sm text-blue-200">
              Giáo viên bộ môn: <span className="font-bold text-white">{session.teacherName}</span>
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-left text-xs text-blue-100 space-y-1.5">
            <p className="font-bold text-white text-sm mb-1">Quy định làm bài:</p>
            <p>• Sử dụng điện thoại di động của nhóm để thảo luận và nhập câu trả lời.</p>
            <p>• Trả lời đủ cả 4 câu hỏi về quyền tác giả.</p>
            <p>• Bài làm sẽ được đồng bộ trực tiếp lên màn hình máy chiếu của cô giáo.</p>
          </div>

          <button
            onClick={() => setHasStarted(true)}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-lg rounded-2xl shadow-xl shadow-blue-500/30 transition flex items-center justify-center gap-2"
          >
            <span>THAM GIA THẢO LUẬN</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </main>

        <footer className="text-center text-xs text-blue-300/80 pb-2">
          Học sinh lớp 10 • THPT Đinh Tiên Hoàng
        </footer>
      </div>
    );
  }

  // SCREEN 2: Choose Group Screen
  if (!selectedGroupId) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col p-4 md:p-6">
        <header className="max-w-2xl mx-auto w-full mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-blue-900">CHỌN NHÓM CỦA EM</h1>
            <p className="text-xs text-slate-500">
              {session.schoolName} – GV: {session.teacherName}
            </p>
          </div>
          <button
            onClick={() => setHasStarted(false)}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Quay lại
          </button>
        </header>

        <main className="max-w-2xl mx-auto w-full space-y-5 flex-1">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600 shrink-0" />
            <span>
              Lớp gồm <strong>đúng 12 nhóm</strong>. Hãy bấm vào nhóm của em để vào không gian làm bài riêng. Dữ liệu các nhóm được lưu độc lập, không bị ghi đè.
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {session.groups.map((grp) => {
              const statusCfg = STATUS_CONFIG[grp.status];
              return (
                <button
                  key={grp.id}
                  onClick={() => handleSelectGroup(grp.id)}
                  className={`p-4 rounded-2xl border text-left transition-all active:scale-95 shadow-sm hover:shadow-md flex flex-col justify-between h-28 ${
                    grp.status === 'submitted'
                      ? 'bg-blue-50/70 border-blue-300'
                      : grp.status === 'reviewed'
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : grp.status === 'in_progress'
                      ? 'bg-amber-50/70 border-amber-300'
                      : 'bg-white border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-base text-slate-900">{grp.name}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dotClass}`} />
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between mt-auto">
                    <span>{statusCfg.label}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // SCREEN 3: Group Discussion Workspace
  const groupStatus = STATUS_CONFIG[currentGroup?.status || 'not_started'];
  const isSubmitted = currentGroup?.status === 'submitted' || currentGroup?.status === 'reviewed';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-11/12 p-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs md:text-sm font-semibold transition animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-700 text-white'
              : toastMessage.type === 'error'
              ? 'bg-rose-700 text-white'
              : 'bg-blue-700 text-white'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="flex-1">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            {selectedGroupId}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-slate-900 leading-tight">
                {currentGroup?.name}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${groupStatus.badgeClass}`}>
                {groupStatus.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {session.subjectName} – {session.teacherName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection badge */}
          <div
            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg border font-medium ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={isConnected ? 'Kết nối thời gian thực ổn định' : 'Mất kết nối máy chủ - Đang lưu bản nháp trên máy'}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isConnected ? 'Trực tuyến' : 'Ngoại tuyến'}</span>
          </div>

          {/* Switch group button */}
          <button
            onClick={() => setSelectedGroupId(null)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-medium transition"
          >
            Đổi nhóm
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="max-w-3xl w-full mx-auto p-4 md:p-6 space-y-6 flex-1 pb-32">
        {/* Discussion Topic & Optional Scenario Banner */}
        <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wide">
            <BookOpen className="w-4 h-4" />
            Chủ đề thảo luận
          </div>
          <h1 className="text-base md:text-lg font-extrabold text-slate-900 leading-snug">
            {session.sessionTitle}
          </h1>

          {session.situationContext && (
            <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-100 text-xs text-blue-950 space-y-1">
              <strong className="block text-blue-900 font-bold">Tình huống thảo luận:</strong>
              <p className="whitespace-pre-wrap leading-relaxed">{session.situationContext}</p>
            </div>
          )}
        </div>

        {/* Member list input */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" />
            Thành viên nhóm đang tham gia thảo luận:
          </label>
          <input
            type="text"
            value={membersInput}
            disabled={!isEditingMode}
            onChange={(e) => setMembersInput(e.target.value)}
            onBlur={() => handleDraftSave(true)}
            placeholder="Ví dụ: An, Bình, Mai, Tuấn (Nhập tên các bạn trong nhóm)"
            className="w-full text-sm p-3 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition disabled:opacity-75 disabled:bg-slate-100"
          />
        </div>

        {/* Submission Banner if Already Submitted */}
        {isSubmitted && !isEditingMode && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 md:p-5 text-emerald-950 space-y-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm md:text-base text-emerald-900">
                  NHÓM ĐÃ GỬI BÀI THẢO LUẬN THÀNH CÔNG!
                </h3>
                <p className="text-xs text-emerald-800">
                  Thời gian gửi:{' '}
                  {currentGroup?.submittedAt
                    ? new Date(currentGroup.submittedAt).toLocaleString('vi-VN')
                    : 'Gần đây'}
                </p>
              </div>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Bài làm của nhóm đã được lưu vào hệ thống và đang hiển thị trên máy chiếu của cô giáo. Các em có thể xem lại toàn bộ câu trả lời bên dưới.
            </p>
            {session.allowEditAfterSubmit && (
              <button
                onClick={() => setIsEditingMode(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Edit3 className="w-4 h-4" /> Bấm vào đây để CHỈNH SỬA BÀI
              </button>
            )}
          </div>
        )}

        {/* Teacher Feedback Banner if Published */}
        {currentGroup?.feedback && currentGroup.feedback.isPublished && (
          currentGroup.feedback.general || currentGroup.feedback.strengths || currentGroup.feedback.areasToImprove || currentGroup.feedback.nextSteps
        ) && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-sm">
              <MessageSquareQuote className="w-5 h-5 text-indigo-600" />
              NHẬN XÉT CỦA CÔ GIÁO LÊ THỊ DUNG:
            </div>
            <div className="space-y-2 text-xs text-slate-800">
              {currentGroup.feedback.general && (
                <div className="bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                  <strong className="text-indigo-900 block mb-0.5">Nhận xét chung:</strong>
                  <p>{currentGroup.feedback.general}</p>
                </div>
              )}
              {currentGroup.feedback.strengths && (
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <strong className="text-emerald-900 block mb-0.5">Điểm mạnh trong thảo luận:</strong>
                  <p>{currentGroup.feedback.strengths}</p>
                </div>
              )}
              {currentGroup.feedback.areasToImprove && (
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                  <strong className="text-amber-900 block mb-0.5">Nội dung cần bổ sung:</strong>
                  <p>{currentGroup.feedback.areasToImprove}</p>
                </div>
              )}
              {currentGroup.feedback.nextSteps && (
                <div className="bg-white/80 p-2.5 rounded-xl border border-blue-100">
                  <strong className="text-blue-900 block mb-0.5">Hướng hoàn thiện:</strong>
                  <p>{currentGroup.feedback.nextSteps}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Validation Errors banner */}
        {validationErrors.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs text-rose-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-rose-950">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Các câu hỏi chưa hoàn thành:
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 4 DISCUSSION QUESTIONS WORKSPACES */}
        {/* KHU VỰC 1 */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shrink-0">
              KHU VỰC 1
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                Câu 1: {session.questions[0]}
              </h3>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Ô nhập câu trả lời của nhóm:
            </label>
            <textarea
              rows={4}
              disabled={!isEditingMode}
              value={answers.q1}
              onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
              onBlur={() => handleDraftSave(true)}
              placeholder="Nhập câu trả lời chi tiết của nhóm em tại đây..."
              className="w-full text-sm md:text-base p-3.5 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition leading-relaxed disabled:opacity-85 disabled:bg-slate-100"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Tự động lưu bản nháp</span>
              <span>{answers.q1.length} ký tự</span>
            </div>
          </div>
        </section>

        {/* KHU VỰC 2 */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shrink-0">
              KHU VỰC 2
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                Câu 2: {session.questions[1]}
              </h3>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Ô nhập câu trả lời của nhóm:
            </label>
            <textarea
              rows={4}
              disabled={!isEditingMode}
              value={answers.q2}
              onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
              onBlur={() => handleDraftSave(true)}
              placeholder="Nhập câu trả lời chi tiết của nhóm em tại đây..."
              className="w-full text-sm md:text-base p-3.5 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition leading-relaxed disabled:opacity-85 disabled:bg-slate-100"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Tự động lưu bản nháp</span>
              <span>{answers.q2.length} ký tự</span>
            </div>
          </div>
        </section>

        {/* KHU VỰC 3 */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shrink-0">
              KHU VỰC 3
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                Câu 3: {session.questions[2]}
              </h3>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Ô nhập câu trả lời của nhóm:
            </label>
            <textarea
              rows={4}
              disabled={!isEditingMode}
              value={answers.q3}
              onChange={(e) => setAnswers({ ...answers, q3: e.target.value })}
              onBlur={() => handleDraftSave(true)}
              placeholder="Nhập câu trả lời chi tiết của nhóm em tại đây..."
              className="w-full text-sm md:text-base p-3.5 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition leading-relaxed disabled:opacity-85 disabled:bg-slate-100"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Tự động lưu bản nháp</span>
              <span>{answers.q3.length} ký tự</span>
            </div>
          </div>
        </section>

        {/* KHU VỰC 4 */}
        <section className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-start gap-2.5">
            <span className="bg-blue-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shrink-0">
              KHU VỰC 4
            </span>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm md:text-base leading-snug">
                Câu 4: {session.questions[3]}
              </h3>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              Ô nhập câu trả lời của nhóm:
            </label>
            <textarea
              rows={4}
              disabled={!isEditingMode}
              value={answers.q4}
              onChange={(e) => setAnswers({ ...answers, q4: e.target.value })}
              onBlur={() => handleDraftSave(true)}
              placeholder="Nhập câu trả lời chi tiết của nhóm em tại đây..."
              className="w-full text-sm md:text-base p-3.5 border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition leading-relaxed disabled:opacity-85 disabled:bg-slate-100"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Tự động lưu bản nháp</span>
              <span>{answers.q4.length} ký tự</span>
            </div>
          </div>
        </section>
      </main>

      {/* BOTTOM FIXED ACTION TOOLBAR FOR MOBILE */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-3 shadow-2xl">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          {isEditingMode ? (
            <>
              {/* LƯU BẢN NHÁP */}
              <button
                type="button"
                onClick={() => handleDraftSave(false)}
                disabled={isSavingDraft}
                className="flex-1 py-3 px-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition border border-slate-300"
              >
                <Save className="w-4 h-4 text-slate-600" />
                <span className="truncate">{isSavingDraft ? 'Đang lưu...' : 'LƯU BẢN NHÁP'}</span>
              </button>

              {/* KIỂM TRA BÀI */}
              <button
                type="button"
                onClick={handleCheckAnswers}
                className="flex-1 py-3 px-2 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-800 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 transition border border-indigo-200"
              >
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span className="truncate">KIỂM TRA BÀI</span>
              </button>

              {/* GỬI BÀI */}
              <button
                type="button"
                onClick={handleOpenSubmitModal}
                disabled={!session.isOpen}
                className="flex-1 py-3 px-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 active:scale-95 text-white rounded-xl text-xs md:text-sm font-black flex items-center justify-center gap-1.5 transition shadow-lg shadow-blue-500/20"
              >
                <Send className="w-4 h-4" />
                <span className="truncate">GỬI BÀI</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between gap-3">
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Đã nộp bài cho giáo viên</span>
              </div>
              {session.allowEditAfterSubmit && (
                <button
                  type="button"
                  onClick={() => setIsEditingMode(true)}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-bold flex items-center gap-1.5 transition shadow-md"
                >
                  <Edit3 className="w-4 h-4" /> CHỈNH SỬA BÀI
                </button>
              )}
            </div>
          )}
        </div>
      </footer>

      {/* CONFIRMATION MODAL ON SUBMIT */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-700">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Xác Nhận Gửi Bài</h3>
                <p className="text-xs text-slate-500">{currentGroup?.name} – Tin học 10</p>
              </div>
            </div>

            {validationErrors.length > 0 ? (
              <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl text-xs text-rose-800 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  Chú ý: Nhóm vẫn còn câu hỏi chưa trả lời:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
                <p className="font-semibold text-rose-900 pt-1">
                  Yêu cầu bắt buộc trả lời đủ cả 4 câu hỏi trước khi gửi bài cho cô giáo!
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-600 leading-relaxed">
                Nhóm em đã điền đầy đủ cả 4 câu hỏi. Sau khi gửi, bài làm sẽ tự động hiển thị ngay trên màn hình máy chiếu của cô giáo.
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs md:text-sm font-semibold transition"
              >
                Kiểm tra lại
              </button>
              <button
                type="button"
                disabled={isSubmitting || validationErrors.length > 0}
                onClick={handleConfirmSubmit}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs md:text-sm font-bold shadow-md transition flex items-center gap-2"
              >
                {isSubmitting ? 'Đang gửi...' : 'ĐỒNG Ý GỬI BÀI'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
