import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Download,
  AlertTriangle,
  HelpCircle,
  Maximize2,
  Minimize2,
  RefreshCw,
  QrCode as QrIcon,
  ShieldAlert,
  Share2
} from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, sessionTitle }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [studentUrl, setStudentUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'qr' | 'guide'>('qr');
  const [isBigQr, setIsBigQr] = useState(false);

  // Default target URL
  const defaultUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?role=student`
    : 'https://ais-dev-vj5kk6c2gip2ty5g62wdpe-10624576112.asia-east1.run.app?role=student';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}?role=student`;
      setStudentUrl(url);
      generateQR(url);
    }
  }, [isOpen]);

  const generateQR = async (urlToEncode: string) => {
    if (!urlToEncode) return;
    try {
      // Use errorCorrectionLevel 'M' (Medium - 15%) which generates MUCH LARGER DOTS
      // and a cleaner 33x33 matrix that smartphone cameras can read in 0.1s off computer screens!
      const dataUri = await QRCode.toDataURL(urlToEncode, {
        width: 600,
        margin: 3,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUri);
    } catch (err) {
      console.error('Failed to generate QR code', err);
    }
  };

  if (!isOpen) return null;

  const handleUrlChange = (newUrl: string) => {
    setStudentUrl(newUrl);
    generateQR(newUrl);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(studentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `Ma_QR_Phong_Thao_Luan_Tin_Hoc_10_${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Fullscreen big QR mode
  if (isBigQr) {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 select-none animate-in fade-in">
        <button
          onClick={() => setIsBigQr(false)}
          className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition flex items-center gap-2 font-bold text-sm"
        >
          <Minimize2 className="w-5 h-5" /> Thu nhỏ
        </button>

        <div className="bg-white p-6 rounded-3xl shadow-2xl text-center max-w-lg w-full">
          <h2 className="text-xl font-black text-slate-900 mb-2">
            QUÉT MÃ THAM GIA THẢO LUẬN
          </h2>
          <p className="text-xs text-slate-500 mb-4 font-semibold">
            Dùng Camera điện thoại hoặc Zalo để quét
          </p>

          <img
            src={qrDataUrl}
            alt="Mã QR"
            className="w-full max-w-[380px] h-auto mx-auto border-4 border-slate-900 rounded-2xl"
          />

          <div className="mt-4 p-3 bg-slate-100 rounded-xl text-xs font-mono text-slate-700 break-all select-all">
            {studentUrl}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <QrIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-snug">
                Mã QR Tham Gia Thảo Luận Cho Học Sinh
              </h3>
              <p className="text-xs text-blue-100">
                THPT Đinh Tiên Hoàng • Môn Tin học 10 • GV: Lê Thị Dung
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

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0">
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-5 text-xs font-extrabold border-b-2 transition ${
              activeTab === 'qr'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Mã QR & Liên Kết
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-5 text-xs font-extrabold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-xl shadow-xs'
                : 'border-transparent text-slate-600 hover:text-indigo-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            2. Xử Lý Khi Điện Thoại Không Quét Được
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/60">
          {activeTab === 'qr' ? (
            <>
              {/* QR Code Presentation Box */}
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="shrink-0 text-center">
                  <div className="bg-white border-4 border-slate-900 p-2 rounded-2xl inline-block shadow-md">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code"
                        className="w-56 h-56 sm:w-64 sm:h-64 object-contain select-none"
                      />
                    ) : (
                      <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                        Đang tạo mã QR...
                      </div>
                    )}
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setIsBigQr(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                    >
                      <Maximize2 className="w-3.5 h-3.5" /> Phóng to toàn màn hình
                    </button>
                  </div>
                </div>

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                      Hướng dẫn quét cho học sinh:
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">
                      Cách 1: Mở Zalo ➔ Bấm nút Quét QR góc trên
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Zalo quét mã QR trên màn hình máy tính/máy chiếu rất nhạy và mở link ngay lập tức.
                    </p>
                  </div>

                  <div className="space-y-1 pt-1">
                    <h4 className="text-base font-extrabold text-slate-900">
                      Cách 2: Gửi link vào Zalo nhóm lớp
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Cô bấm nút màu xanh bên dưới để sao chép link và dán vào nhóm Zalo lớp để các bạn chỉ cần bấm vào là làm bài ngay.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? 'ĐÃ SAO CHÉP LINK!' : 'SAO CHÉP LINK GỬI ZALO LỚP'}</span>
                    </button>

                    <button
                      onClick={handleDownloadQr}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
                      title="Tải ảnh PNG mã QR về máy"
                    >
                      <Download className="w-4 h-4 text-blue-300" />
                      <span>Tải ảnh PNG</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Link Box */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase">
                  <span>Đường dẫn truy cập cho học sinh:</span>
                  <span className="text-slate-400 font-normal">Cô có thể chỉnh sửa link nếu cần</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={studentUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="flex-1 text-xs p-3 border border-slate-300 rounded-xl font-mono bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 select-all"
                  />
                  <button
                    onClick={() => handleUrlChange(defaultUrl)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                    title="Đặt lại link mặc định"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Notice why phone camera might say access denied */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-2 text-amber-950 text-sm">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                  Nếu điện thoại của cô/học sinh báo "Lỗi truy cập" hoặc "Trang trắng"?
                </div>
                <p className="leading-relaxed">
                  Vì ứng dụng đang chạy trong môi trường phát triển của Google AI Studio (được bảo mật riêng cho tài khoản Google của cô: <strong>{sessionTitle}</strong>).
                </p>
                <p className="font-semibold text-amber-950">
                  👉 Vui lòng bấm sang tab <strong>"2. Xử Lý Khi Điện Thoại Không Quét Được"</strong> ở trên để xem 3 cách mở nhanh chỉ mất 30 giây!
                </p>
              </div>
            </>
          ) : (
            /* TROUBLESHOOTING / GUIDE TAB */
            <div className="space-y-4 text-xs">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-600" />
                  Tại sao điện thoại không vào được và cách xử lý:
                </h4>

                {/* Solution 1 */}
                <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 space-y-1.5">
                  <div className="font-bold text-blue-900 text-sm">
                    Cách 1: Mở khóa quyền công khai (Share App) trên Google AI Studio
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    1. Ở góc trên bên phải màn hình làm việc của Google AI Studio (trên thanh menu trên cùng), cô sẽ thấy nút <strong>"Share" (Chia sẻ)</strong> hoặc nút <strong>"Deploy"</strong>.
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    2. Bấm vào nút <strong>"Share"</strong> và bật chế độ chia sẻ công khai. Khi đó, bất kỳ điện thoại nào quét mã QR đều vào được mà không bị Google chặn cookie.
                  </p>
                </div>

                {/* Solution 2 */}
                <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1.5">
                  <div className="font-bold text-emerald-900 text-sm">
                    Cách 2: Quét bằng điện thoại có đăng nhập tài khoản Google của cô
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Nếu cô đang tự dùng điện thoại của mình để thử nghiệm:
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    • Mở trình duyệt <strong>Chrome</strong> trên điện thoại ➔ Đảm bảo đã đăng nhập cùng tài khoản Gmail của cô.
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    • Quét lại mã QR hoặc dán link vào Chrome trên điện thoại để mở thẳng trang làm bài.
                  </p>
                </div>

                {/* Solution 3 */}
                <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 space-y-1.5">
                  <div className="font-bold text-indigo-900 text-sm">
                    Cách 3: Thử nghiệm ngay trên máy tính của cô (2 màn hình song song)
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Để cô kiểm tra hoạt động nộp bài và đồng bộ thời gian thực ngay lúc này:
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    • Bấm vào nút <strong>"Mở giao diện học sinh trong tab mới"</strong> bên dưới.
                  </p>
                  <p className="text-slate-700 leading-relaxed">
                    • Màn hình học sinh sẽ mở ra ở tab mới, cô chọn <strong>Nhóm 1</strong>, nhập bài làm và bấm <strong>GỬI BÀI</strong>. Tab giáo viên sẽ lập tức nhảy số và đổi màu xanh ngay trước mắt cô!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <a
            href={studentUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-bold bg-blue-100/70 hover:bg-blue-200 px-3.5 py-2 rounded-xl transition"
          >
            <ExternalLink className="w-4 h-4" /> Mở giao diện học sinh trong tab mới (Để cô thử nghiệm)
          </a>

          <button
            onClick={onClose}
            className="bg-slate-900 text-white hover:bg-black font-bold text-xs px-6 py-2.5 rounded-xl transition"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
