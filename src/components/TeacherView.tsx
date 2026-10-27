import React, { useState, useEffect, useRef } from 'react';
import { SessionData, GroupData, STATUS_CONFIG } from '../types.ts';
import { ApiService } from '../services/api.ts';
import {
  Users,
  CheckCircle2,
  Clock,
  MessageSquare,
  Tv,
  QrCode,
  FileSpreadsheet,
  Settings,
  Printer,
  Sparkles,
  Wifi,
  WifiOff,
  Eye,
  Smartphone,
  AlertCircle,
  Filter,
  Check
} from 'lucide-react';

interface TeacherViewProps {
  session: SessionData;
  isConnected: boolean;
  onOpenGroupDetail: (group: GroupData) => void;
  onOpenPresentation: (group: GroupData) => void;
  onOpenFeedback: (group: GroupData) => void;
  onOpenQrModal: () => void;
  onOpenSettings: () => void;
  onOpenPrintReport: () => void;
  onSwitchToStudent: () => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  session,
  isConnected,
  onOpenGroupDetail,
  onOpenPresentation,
  onOpenFeedback,
  onOpenQrModal,
  onOpenSettings,
  onOpenPrintReport,
  onSwitchToStudent,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [newSubmissionsAlert, setNewSubmissionsAlert] = useState<string | null>(null);

  // Track previous submitted counts to show toast on new real-time submission
  const prevSubmittedCountRef = useRef<number | null>(null);

  useEffect(() => {
    const currentSubmitted = session.groups.filter(
      (g) => g.status === 'submitted' || g.status === 'reviewed'
    ).length;

    if (prevSubmittedCountRef.current !== null && currentSubmitted > prevSubmittedCountRef.current) {
      // Find which group submitted recently
      const recentGroup = [...session.groups]
        .filter((g) => g.submittedAt)
        .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())[0];

      if (recentGroup) {
        setNewSubmissionsAlert(`🎉 ${recentGroup.name} vừa gửi bài thảo luận thành công!`);
        setTimeout(() => setNewSubmissionsAlert(null), 5000);
      }
    }
    prevSubmittedCountRef.current = currentSubmitted;
  }, [session.groups]);

  // Metric computations
  const totalGroups = 12;
  const submittedGroups = session.groups.filter(
    (g) => g.status === 'submitted' || g.status === 'reviewed'
  ).length;
  const pendingGroups = totalGroups - submittedGroups;
  const reviewedGroups = session.groups.filter((g) => g.status === 'reviewed').length;

  const filteredGroups = session.groups.filter((g) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'submitted') return g.status === 'submitted' || g.status === 'reviewed';
    if (filterStatus === 'pending') return g.status !== 'submitted' && g.status !== 'reviewed';
    if (filterStatus === 'reviewed') return g.status === 'reviewed';
    return true;
  });

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Chưa gửi';
    const d = new Date(isoString);
    return d.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 font-sans flex flex-col">
      {/* Toast Alert for new incoming submissions */}
      {newSubmissionsAlert && (
        <div className="fixed top-5 right-5 z-50 bg-blue-700 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 border border-blue-400">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="font-bold text-sm">{newSubmissionsAlert}</span>
        </div>
      )}

      {/* Main Teacher Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left branding */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                  Màn Hình Giáo Viên
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {session.schoolName}
                </span>
                <div
                  className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isConnected ? <Wifi className="w-3 h-3 text-emerald-600" /> : <WifiOff className="w-3 h-3 text-rose-600" />}
                  <span>{isConnected ? 'Thời gian thực' : 'Mất kết nối'}</span>
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                PHÒNG THẢO LUẬN SỐ
              </h1>
              <p className="text-xs md:text-sm text-slate-600 mt-0.5">
                Giáo viên: <strong className="text-slate-900">{session.teacherName}</strong> • Môn: <strong className="text-slate-900">{session.subjectName}</strong> • Trường: <strong className="text-slate-900">{session.schoolName}</strong>
              </p>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onOpenQrModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition shadow-2xs"
                title="Chiếu mã QR cho học sinh quét bằng điện thoại"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Mã QR Cho Học Sinh</span>
              </button>

              <button
                onClick={() => onOpenPresentation(session.groups[0])}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                title="Mở chế độ trình chiếu toàn màn hình cho máy chiếu lớp học"
              >
                <Tv className="w-4 h-4" />
                <span>Trình Chiếu Máy Chiếu</span>
              </button>

              <button
                onClick={() => (window.location.href = '/api/export-csv')}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition"
                title="Xuất bảng điểm và câu trả lời ra file Excel CSV"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>

              <button
                onClick={onOpenPrintReport}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition"
                title="In báo cáo tổng kết"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span className="hidden sm:inline">In Báo Cáo</span>
              </button>

              <button
                onClick={onOpenSettings}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition"
                title="Cài đặt buổi thảo luận"
              >
                <Settings className="w-4 h-4 text-slate-600" />
                <span>Cài Đặt</span>
              </button>

              <button
                onClick={onSwitchToStudent}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                title="Xem thử giao diện điện thoại của học sinh"
              >
                <Smartphone className="w-4 h-4 text-blue-300" />
                <span className="hidden sm:inline">Giao diện HS</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 space-y-6 flex-1">
        {/* Discussion topic banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-blue-200 tracking-wider">
              Chủ đề thảo luận đang hoạt động
            </span>
            <h2 className="text-lg md:text-xl font-bold">{session.sessionTitle}</h2>
            {session.situationContext && (
              <p className="text-xs text-blue-100/90 italic line-clamp-2">
                Tình huống: {session.situationContext}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              session.isOpen ? 'bg-emerald-400 text-emerald-950' : 'bg-rose-400 text-rose-950'
            }`}>
              {session.isOpen ? 'Đang mở nhận bài' : 'Đã khóa nhận bài'}
            </span>
          </div>
        </div>

        {/* 4 STATS METRIC CARDS REQUIRED BY SECTION V */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Tổng số nhóm */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xl shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                Tổng số nhóm
              </p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">{totalGroups}</p>
            </div>
          </div>

          {/* Card 2: Số nhóm đã gửi bài */}
          <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm shadow-blue-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Đã gửi bài
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl font-black text-blue-900">{submittedGroups}</span>
                <span className="text-xs text-slate-400">/ 12 ({Math.round((submittedGroups / 12) * 100)}%)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Số nhóm chưa gửi bài */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xl shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Chưa gửi bài
              </p>
              <p className="text-2xl md:text-3xl font-black text-slate-900">{pendingGroups}</p>
            </div>
          </div>

          {/* Card 4: Số nhóm đã được nhận xét */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-sm shadow-emerald-500/20">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                Đã nhận xét
              </p>
              <p className="text-2xl md:text-3xl font-black text-emerald-900">{reviewedGroups}</p>
            </div>
          </div>
        </section>

        {/* Filter Toolbar & Legend */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase">Lọc danh sách:</span>
            <div className="flex gap-1">
              {[
                { id: 'all', label: 'Tất cả 12 nhóm' },
                { id: 'submitted', label: 'Đã gửi bài' },
                { id: 'pending', label: 'Chưa gửi' },
                { id: 'reviewed', label: 'Đã nhận xét' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterStatus(btn.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition ${
                    filterStatus === btn.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-400" /> Chưa làm
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Đang làm
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Đã gửi bài
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Đã nhận xét
            </span>
          </div>
        </section>

        {/* 12 GROUP CARDS GRID REQUIRED BY SECTION V */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredGroups.map((group) => {
            const statusCfg = STATUS_CONFIG[group.status];
            const hasAnswers = Boolean(
              group.answers.q1 || group.answers.q2 || group.answers.q3 || group.answers.q4
            );

            return (
              <div
                key={group.id}
                className={`rounded-2xl p-5 border-2 transition-all shadow-xs hover:shadow-lg flex flex-col justify-between ${statusCfg.cardClass}`}
              >
                {/* Top of Card */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                        {group.id}
                      </div>
                      <h3 className="font-extrabold text-lg text-slate-900">{group.name}</h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusCfg.badgeClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${statusCfg.dotClass}`} />
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Submission info */}
                  <div className="text-xs text-slate-600 space-y-1 mb-3 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Thời gian gửi:</span>
                      <span className="font-semibold text-slate-800">
                        {group.submittedAt ? formatTime(group.submittedAt) : 'Chưa gửi'}
                      </span>
                    </div>

                    {group.members && (
                      <div className="truncate text-slate-500 text-[11px]" title={group.members}>
                        👥 <em>{group.members}</em>
                      </div>
                    )}
                  </div>

                  {/* Progress indicator */}
                  <div className="bg-slate-200/70 rounded-full h-1.5 overflow-hidden mb-4">
                    <div
                      className={`h-full ${
                        group.status === 'reviewed'
                          ? 'bg-emerald-600 w-full'
                          : group.status === 'submitted'
                          ? 'bg-blue-600 w-full'
                          : group.status === 'in_progress'
                          ? 'bg-amber-500 w-1/2'
                          : 'w-0'
                      }`}
                    />
                  </div>
                </div>

                {/* 3 ACTION BUTTONS REQUIRED BY SECTION V: XEM BÀI, TRÌNH CHIẾU, NHẬN XÉT */}
                <div className="space-y-2 pt-2 border-t border-slate-200/80">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Button 1: XEM BÀI */}
                    <button
                      onClick={() => onOpenGroupDetail(group)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition shadow-2xs"
                      title="Xem bài làm chi tiết của nhóm"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" />
                      <span>XEM BÀI</span>
                    </button>

                    {/* Button 2: TRÌNH CHIẾU */}
                    <button
                      onClick={() => onOpenPresentation(group)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition shadow-2xs"
                      title="Trình chiếu bài của nhóm này lên máy chiếu"
                    >
                      <Tv className="w-3.5 h-3.5 text-indigo-600" />
                      <span>TRÌNH CHIẾU</span>
                    </button>
                  </div>

                  {/* Button 3: NHẬN XÉT */}
                  <button
                    onClick={() => onOpenFeedback(group)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                    title="Viết nhận xét và đánh giá cho nhóm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>NHẬN XÉT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
};
