import React, { useState, useEffect } from 'react';
import { GroupData, STATUS_CONFIG } from '../types.ts';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
  LayoutGrid,
  Tv,
  Users,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface PresentationModeProps {
  groups: GroupData[];
  initialGroupId: number;
  questions: [string, string, string, string];
  sessionTitle: string;
  schoolName: string;
  teacherName: string;
  onClose: () => void;
}

export const PresentationMode: React.FC<PresentationModeProps> = ({
  groups,
  initialGroupId,
  questions,
  sessionTitle,
  schoolName,
  teacherName,
  onClose,
}) => {
  const [currentGroupId, setCurrentGroupId] = useState(initialGroupId);
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard navigation: ArrowLeft, ArrowRight, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'grid') {
          onClose();
        } else {
          setViewMode('grid');
        }
      } else if (e.key === 'ArrowLeft') {
        handlePrevGroup();
      } else if (e.key === 'ArrowRight') {
        handleNextGroup();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGroupId, viewMode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handlePrevGroup = () => {
    setCurrentGroupId((prev) => (prev > 1 ? prev - 1 : 12));
    setViewMode('single');
  };

  const handleNextGroup = () => {
    setCurrentGroupId((prev) => (prev < 12 ? prev + 1 : 1));
    setViewMode('single');
  };

  const activeGroup = groups.find((g) => g.id === currentGroupId) || groups[0];
  const activeStatus = STATUS_CONFIG[activeGroup.status];

  const formatTime = (iso: string | null) => {
    if (!iso) return 'Chưa nộp';
    return new Date(iso).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getAnswer = (qKey: 'q1' | 'q2' | 'q3' | 'q4') => {
    const ans = (activeGroup.answers[qKey] || activeGroup.draftAnswers?.[qKey] || '').trim();
    return ans || null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Top Bar / Presentation Controller */}
      <header className="h-16 px-6 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-600/30 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider">
            <Tv className="w-4 h-4 text-blue-400" />
            Máy Chiếu Lớp Học
          </div>
          <div className="hidden md:block">
            <h1 className="text-sm font-bold text-white truncate max-w-md">{sessionTitle}</h1>
            <p className="text-[11px] text-slate-400">
              {schoolName} • GV: {teacherName}
            </p>
          </div>
        </div>

        {/* Center navigation controls */}
        <div className="flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-lg">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'single' : 'grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:bg-slate-700/60'
            }`}
            title="Xem danh sách 12 nhóm"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tổng Hợp 12 Nhóm</span>
          </button>

          {viewMode === 'single' && (
            <>
              <div className="h-4 w-[1px] bg-slate-700 mx-1" />
              <button
                onClick={handlePrevGroup}
                className="p-1.5 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                title="Nhóm trước (Phím mũi tên trái)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 py-1 text-xs font-bold text-blue-300 bg-slate-900 rounded-md border border-slate-700 min-w-20 text-center">
                {activeGroup.name} / 12
              </div>
              <button
                onClick={handleNextGroup}
                className="p-1.5 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                title="Nhóm sau (Phím mũi tên phải)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition"
            title="Bật/Tắt Toàn Màn Hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition"
            title="Thoát trình chiếu"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Thoát</span>
          </button>
        </div>
      </header>

      {/* Main presentation content area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center bg-radial from-slate-900 via-slate-950 to-black">
        {viewMode === 'grid' ? (
          /* TỔNG HỢP 12 NHÓM GRID */
          <div className="w-full max-w-7xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                TỔNG HỢP KẾT QUẢ THẢO LUẬN 12 NHÓM
              </h2>
              <p className="text-slate-400 text-sm">
                Chọn một nhóm bất kỳ để trình chiếu toàn màn hình bài làm của nhóm đó
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {groups.map((grp) => {
                const conf = STATUS_CONFIG[grp.status];
                const hasAnswers = Boolean(grp.answers.q1 || grp.answers.q2 || grp.answers.q3 || grp.answers.q4);
                return (
                  <div
                    key={grp.id}
                    onClick={() => {
                      setCurrentGroupId(grp.id);
                      setViewMode('single');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer transform hover:-translate-y-1 hover:shadow-2xl relative group ${
                      grp.status === 'submitted'
                        ? 'bg-blue-950/40 border-blue-500 shadow-blue-500/20 shadow-lg'
                        : grp.status === 'reviewed'
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-emerald-500/20 shadow-lg'
                        : grp.status === 'in_progress'
                        ? 'bg-amber-950/30 border-amber-500/60'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                        {grp.name}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${conf.dotClass}`} />
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-300">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Trạng thái:</span>
                        <span className="font-semibold text-slate-200">{conf.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Giờ nộp:</span>
                        <span className="font-mono text-slate-300">{formatTime(grp.submittedAt)}</span>
                      </div>
                      {grp.members && (
                        <div className="truncate text-[11px] text-slate-400 mt-1">
                          👥 {grp.members}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        {hasAnswers ? 'Đã có bài' : 'Chưa nhập'}
                      </span>
                      <span className="text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform">
                        Chiếu ngay →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* SINGLE GROUP PRESENTATION (16:9 widescreen layout) */
          <div className="w-full max-w-7xl mx-auto flex flex-col h-full justify-between space-y-6">
            {/* Slide Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-3xl md:text-4xl text-white shadow-xl shadow-blue-600/30 ring-4 ring-blue-500/30">
                  {activeGroup.id}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                      {activeGroup.name}
                    </h2>
                    <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs md:text-sm font-bold border ${activeStatus.badgeClass}`}>
                      {activeStatus.label}
                    </span>
                  </div>
                  {activeGroup.members && (
                    <p className="text-sm md:text-base text-blue-200/90 flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span>Thành viên: <strong className="text-white">{activeGroup.members}</strong></span>
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs md:text-sm text-slate-400">
                <div className="flex items-center gap-1.5 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span>Thời gian gửi bài: <strong className="text-slate-200">{formatTime(activeGroup.submittedAt)}</strong></span>
                </div>
              </div>
            </div>

            {/* 4 Questions & Answers - 2x2 Grid or Staggered 4-card layout for maximum projector readability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 flex-1 overflow-y-auto pr-1">
              {/* Question 1 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="bg-blue-600 text-white font-extrabold text-sm md:text-base px-3 py-1 rounded-lg shrink-0 shadow">
                      CÂU 1
                    </span>
                    <h3 className="font-bold text-slate-200 text-base md:text-lg leading-snug">
                      {questions[0]}
                    </h3>
                  </div>

                  <div className="bg-slate-950/80 p-4 md:p-5 rounded-xl border border-slate-800/80 text-white min-h-[110px]">
                    {getAnswer('q1') ? (
                      <p className="text-base md:text-lg text-emerald-200/90 leading-relaxed font-medium whitespace-pre-wrap">
                        {getAnswer('q1')}
                      </p>
                    ) : (
                      <p className="text-amber-400/80 italic text-sm md:text-base flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        Nhóm chưa nhập câu trả lời cho câu hỏi này.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Question 2 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="bg-blue-600 text-white font-extrabold text-sm md:text-base px-3 py-1 rounded-lg shrink-0 shadow">
                      CÂU 2
                    </span>
                    <h3 className="font-bold text-slate-200 text-base md:text-lg leading-snug">
                      {questions[1]}
                    </h3>
                  </div>

                  <div className="bg-slate-950/80 p-4 md:p-5 rounded-xl border border-slate-800/80 text-white min-h-[110px]">
                    {getAnswer('q2') ? (
                      <p className="text-base md:text-lg text-emerald-200/90 leading-relaxed font-medium whitespace-pre-wrap">
                        {getAnswer('q2')}
                      </p>
                    ) : (
                      <p className="text-amber-400/80 italic text-sm md:text-base flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        Nhóm chưa nhập câu trả lời cho câu hỏi này.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Question 3 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="bg-blue-600 text-white font-extrabold text-sm md:text-base px-3 py-1 rounded-lg shrink-0 shadow">
                      CÂU 3
                    </span>
                    <h3 className="font-bold text-slate-200 text-base md:text-lg leading-snug">
                      {questions[2]}
                    </h3>
                  </div>

                  <div className="bg-slate-950/80 p-4 md:p-5 rounded-xl border border-slate-800/80 text-white min-h-[110px]">
                    {getAnswer('q3') ? (
                      <p className="text-base md:text-lg text-emerald-200/90 leading-relaxed font-medium whitespace-pre-wrap">
                        {getAnswer('q3')}
                      </p>
                    ) : (
                      <p className="text-amber-400/80 italic text-sm md:text-base flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        Nhóm chưa nhập câu trả lời cho câu hỏi này.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Question 4 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div className="space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="bg-blue-600 text-white font-extrabold text-sm md:text-base px-3 py-1 rounded-lg shrink-0 shadow">
                      CÂU 4
                    </span>
                    <h3 className="font-bold text-slate-200 text-base md:text-lg leading-snug">
                      {questions[3]}
                    </h3>
                  </div>

                  <div className="bg-slate-950/80 p-4 md:p-5 rounded-xl border border-slate-800/80 text-white min-h-[110px]">
                    {getAnswer('q4') ? (
                      <p className="text-base md:text-lg text-emerald-200/90 leading-relaxed font-medium whitespace-pre-wrap">
                        {getAnswer('q4')}
                      </p>
                    ) : (
                      <p className="text-amber-400/80 italic text-sm md:text-base flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        Nhóm chưa nhập câu trả lời cho câu hỏi này.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Footer / Quick Navigation bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>Dùng phím mũi tên [←] và [→] để chuyển nhanh giữa các nhóm</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevGroup}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold flex items-center gap-1 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Nhóm trước
                </button>
                <button
                  onClick={handleNextGroup}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-1 transition shadow-lg shadow-blue-600/30"
                >
                  Nhóm tiếp theo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
