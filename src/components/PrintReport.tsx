import React from 'react';
import { SessionData, STATUS_CONFIG } from '../types.ts';
import { Printer, Download, X, ArrowLeft } from 'lucide-react';

interface PrintReportProps {
  session: SessionData;
  onBack: () => void;
}

export const PrintReport: React.FC<PrintReportProps> = ({ session, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    window.location.href = '/api/export-csv';
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Control bar (hidden during print) */}
      <div className="max-w-6xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại màn hình giáo viên
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <Download className="w-4 h-4" /> Xuất file Excel (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
          >
            <Printer className="w-4 h-4" /> In Báo Cáo / Lưu PDF
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-6xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
        {/* Official Header */}
        <div className="border-b-2 border-slate-800 pb-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                {session.schoolName} – Môn {session.subjectName}
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
                BẢNG TỔNG HỢP HOẠT ĐỘNG THẢO LUẬN NHÓM
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                <strong>Chủ đề:</strong> {session.sessionTitle}
              </p>
            </div>
            <div className="text-right text-xs text-slate-500 shrink-0">
              <p>
                <strong>Giáo viên hướng dẫn:</strong> {session.teacherName}
              </p>
              <p>
                <strong>Ngày xuất báo cáo:</strong> {new Date().toLocaleDateString('vi-VN')}
              </p>
              <p>
                <strong>Thời gian:</strong> {new Date().toLocaleTimeString('vi-VN')}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Official Questions List */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs text-slate-700 space-y-1">
          <h2 className="font-bold text-slate-900 uppercase text-xs mb-2">Bộ 4 câu hỏi thảo luận:</h2>
          <p>
            <strong>Câu 1:</strong> {session.questions[0]}
          </p>
          <p>
            <strong>Câu 2:</strong> {session.questions[1]}
          </p>
          <p>
            <strong>Câu 3:</strong> {session.questions[2]}
          </p>
          <p>
            <strong>Câu 4:</strong> {session.questions[3]}
          </p>
        </div>

        {/* Summary Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                <th className="py-2.5 px-3 font-bold border border-slate-300 w-16 text-center">STT</th>
                <th className="py-2.5 px-3 font-bold border border-slate-300 w-28">Nhóm</th>
                <th className="py-2.5 px-3 font-bold border border-slate-300 w-28">Trạng thái</th>
                <th className="py-2.5 px-3 font-bold border border-slate-300 w-32">Thời gian nộp</th>
                <th className="py-2.5 px-3 font-bold border border-slate-300">Thành viên</th>
                <th className="py-2.5 px-3 font-bold border border-slate-300">Nhận xét tóm tắt</th>
              </tr>
            </thead>
            <tbody>
              {session.groups.map((grp) => {
                const conf = STATUS_CONFIG[grp.status];
                return (
                  <tr key={grp.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center border border-slate-200 font-bold">{grp.id}</td>
                    <td className="py-2.5 px-3 border border-slate-200 font-bold text-slate-900">{grp.name}</td>
                    <td className="py-2.5 px-3 border border-slate-200">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${conf.badgeClass}`}>
                        {conf.label}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 border border-slate-200 text-slate-600">
                      {grp.submittedAt ? new Date(grp.submittedAt).toLocaleTimeString('vi-VN') : '—'}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-200 text-slate-700">
                      {grp.members || '—'}
                    </td>
                    <td className="py-2.5 px-3 border border-slate-200 text-slate-700">
                      {grp.feedback.general || grp.feedback.strengths ? (
                        <span>{grp.feedback.general || grp.feedback.strengths}</span>
                      ) : (
                        <span className="text-slate-400 italic">Chưa nhận xét</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Detailed Answers Section for All 12 Groups */}
        <div className="space-y-6 pt-4 border-t-2 border-slate-300">
          <h2 className="text-lg font-bold text-slate-900 uppercase">
            CHI TIẾT BÀI LÀM VÀ NHẬN XÉT CỦA 12 NHÓM
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {session.groups.map((grp) => {
              const hasAnswers = grp.answers.q1 || grp.answers.q2 || grp.answers.q3 || grp.answers.q4;
              return (
                <div
                  key={grp.id}
                  className="bg-slate-50/70 p-4 rounded-xl border border-slate-300 space-y-3 break-inside-avoid"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="font-bold text-base text-slate-900">{grp.name}</h3>
                    <span className="text-xs text-slate-500">
                      {grp.submittedAt ? `Nộp: ${new Date(grp.submittedAt).toLocaleTimeString('vi-VN')}` : 'Chưa nộp'}
                    </span>
                  </div>

                  {hasAnswers ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-blue-900">Câu 1:</strong>
                        <p className="text-slate-800 whitespace-pre-wrap pl-2 border-l-2 border-blue-400 mt-0.5">
                          {grp.answers.q1 || '(Chưa trả lời)'}
                        </p>
                      </div>
                      <div>
                        <strong className="text-blue-900">Câu 2:</strong>
                        <p className="text-slate-800 whitespace-pre-wrap pl-2 border-l-2 border-blue-400 mt-0.5">
                          {grp.answers.q2 || '(Chưa trả lời)'}
                        </p>
                      </div>
                      <div>
                        <strong className="text-blue-900">Câu 3:</strong>
                        <p className="text-slate-800 whitespace-pre-wrap pl-2 border-l-2 border-blue-400 mt-0.5">
                          {grp.answers.q3 || '(Chưa trả lời)'}
                        </p>
                      </div>
                      <div>
                        <strong className="text-blue-900">Câu 4:</strong>
                        <p className="text-slate-800 whitespace-pre-wrap pl-2 border-l-2 border-blue-400 mt-0.5">
                          {grp.answers.q4 || '(Chưa trả lời)'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Nhóm chưa nhập bài làm.</p>
                  )}

                  {/* Teacher note if any */}
                  {(grp.feedback.general || grp.feedback.strengths) && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-xs bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-100">
                      <strong className="text-emerald-900 block mb-0.5">Nhận xét của GV:</strong>
                      {grp.feedback.general && <p className="text-slate-800">• {grp.feedback.general}</p>}
                      {grp.feedback.strengths && <p className="text-emerald-800">• Điểm mạnh: {grp.feedback.strengths}</p>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Signature Box for School Archive */}
        <div className="mt-12 pt-8 border-t border-slate-300 flex justify-between text-xs text-slate-600 print:mt-16">
          <div className="text-center w-48">
            <p className="font-semibold text-slate-700">TỔ TRƯỞNG CHUYÊN MÔN</p>
            <p className="italic text-[11px] text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
          </div>
          <div className="text-center w-48">
            <p className="italic text-[11px] text-slate-400">Ngày ..... tháng ..... năm 2026</p>
            <p className="font-semibold text-slate-700 mt-0.5">GIÁO VIÊN BỘ MÔN</p>
            <p className="italic text-[11px] text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
            <p className="font-bold text-slate-900 mt-12">{session.teacherName}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
