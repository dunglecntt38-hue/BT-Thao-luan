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
  Share2,
  RefreshCw,
  QrCode as QrIcon
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

  // Pre-configured URLs
  const devUrl = typeof window !== 'undefined' ? `${window.location.origin}?role=student` : '';
  const sharedUrl = 'https://ais-pre-vj5kk6c2gip2ty5g62wdpe-10624576112.asia-east1.run.app?role=student';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Priority: use current origin + ?role=student
      const initUrl = `${window.location.origin}?role=student`;
      setStudentUrl(initUrl);
      generateQR(initUrl);
    }
  }, [isOpen]);

  const generateQR = async (urlToEncode: string) => {
    if (!urlToEncode) return;
    try {
      // High contrast pure black on pure white with high error correction (H)
      // and margin 4 (quiet zone) for maximum camera scanning speed and reliability
      const dataUri = await QRCode.toDataURL(urlToEncode, {
        width: 450,
        margin: 4,
        errorCorrectionLevel: 'H',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrDataUrl(dataUri);
    } catch (err) {
      console.error('Failed to generate high-contrast QR code', err);
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
    setTimeout(() => setCopied(false), 2500);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full my-6 overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <QrIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Mã QR Tham Gia Thảo Luận</h3>
              <p className="text-xs text-blue-100">
                Chuẩn tương phản cao (đen/trắng) – Học sinh quét bằng Camera hoặc Zalo
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
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition ${
              activeTab === 'qr'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Mã QR & Đường Dẫn
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-700 bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-indigo-700'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Hướng Dẫn Học Sinh Quét Mã
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {activeTab === 'qr' ? (
            <>
              {/* QR Image Box */}
              <div className="text-center">
                <div className="bg-white border-2 border-slate-300 p-3 rounded-2xl inline-block shadow-md">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="Mã QR Phòng Thảo Luận"
                      className="w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-lg select-none"
                    />
                  ) : (
                    <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                      Đang tạo mã QR...
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs font-bold text-slate-700">
                  Môn Tin học 10 • THPT Đinh Tiên Hoàng
                </div>
              </div>

              {/* Action Buttons: Download & Copy */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleDownloadQr}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  title="Tải ảnh PNG mã QR về máy để chèn vào slide PowerPoint hoặc in giấy"
                >
                  <Download className="w-4 h-4 text-blue-300" />
                  <span>Tải ảnh mã QR (PNG)</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  title="Sao chép link để gửi vào nhóm Zalo lớp học"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Đã sao chép link!' : 'Sao chép link gửi Zalo lớp'}</span>
                </button>
              </div>

              {/* Editable URL Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Đường dẫn đang mã hóa trong QR:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={studentUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 text-xs p-2.5 border border-slate-300 rounded-lg font-mono bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleUrlChange(devUrl)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-semibold shrink-0"
                    title="Đặt lại đường link mặc định của web"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                  <span className="text-slate-500 self-center">Chọn nhanh:</span>
                  <button
                    onClick={() => handleUrlChange(devUrl)}
                    className="text-blue-600 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                  >
                    Link máy chủ hiện tại
                  </button>
                  <button
                    onClick={() => handleUrlChange(sharedUrl)}
                    className="text-indigo-600 hover:underline bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200"
                  >
                    Link Shared App công khai
                  </button>
                </div>
              </div>

              {/* Security / Network note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Lưu ý khi học sinh quét mã bằng điện thoại:
                </div>
                <p className="leading-relaxed">
                  • <strong>Cách quét nhanh nhất:</strong> Mở ứng dụng <strong>Zalo</strong> trên điện thoại ➔ Bấm vào biểu tượng <strong>[Quét QR]</strong> ở góc trên bên phải màn hình để quét mã này.
                </p>
                <p className="leading-relaxed">
                  • <strong>Nếu điện thoại báo lỗi kết nối hoặc yêu cầu đăng nhập Google:</strong> Cô có thể bấm nút <strong>"Sao chép link gửi Zalo lớp"</strong> ở trên và dán trực tiếp vào nhóm Zalo của lớp để các em bấm vào làm bài ngay lập tức.
                </p>
              </div>
            </>
          ) : (
            /* GUIDE TAB */
            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  3 Cách Cho Học Sinh Vào Phòng Thảo Luận:
                </h4>
                <div className="space-y-3 pt-2">
                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                    <p className="font-bold text-slate-900 text-xs mb-1">
                      Cách 1: Quét bằng ứng dụng ZALO (Khuyên dùng nhất cho học sinh Việt Nam)
                    </p>
                    <p className="text-slate-600">
                      Mở ứng dụng Zalo trên điện thoại ➔ Ở tab Tin nhắn, bấm biểu tượng <strong>Quét mã QR</strong> ở góc trên cùng bên phải màn hình ➔ Hướng camera về mã QR trên máy chiếu ➔ Bấm <strong>Mở liên kết</strong>.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                    <p className="font-bold text-slate-900 text-xs mb-1">
                      Cách 2: Quét bằng Camera mặc định của điện thoại
                    </p>
                    <p className="text-slate-600">
                      Mở ứng dụng Máy ảnh (Camera) trên iPhone hoặc điện thoại Android ➔ Hướng về mã QR ➔ Bấm vào thông báo liên kết màu vàng xuất hiện trên màn hình.
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs">
                    <p className="font-bold text-slate-900 text-xs mb-1">
                      Cách 3: Gửi trực tiếp link vào nhóm chat của lớp
                    </p>
                    <p className="text-slate-600">
                      Cô bấm nút <strong>"Sao chép link gửi Zalo lớp"</strong> ➔ Dán link vào nhóm Zalo hoặc Messenger của lớp. Học sinh chỉ cần chạm vào link là vào ngay trang thảo luận.
                    </p>
                  </div>
                </div>
              </div>

              {/* Troubleshooting */}
              <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Xử lý sự cố thường gặp:
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  <li>
                    <strong>Màn hình máy chiếu bị mờ/lóa sáng:</strong> Bấm nút <strong>"Tải ảnh mã QR (PNG)"</strong> để chèn ảnh mã QR vào slide PowerPoint phóng to toàn màn hình với độ nét tối đa.
                  </li>
                  <li>
                    <strong>Học sinh không có mạng 4G/Wifi:</strong> Mỗi nhóm chỉ cần 01 bạn đại diện có điện thoại kết nối mạng để nhập câu trả lời cho cả nhóm.
                  </li>
                  <li>
                    <strong>Điện thoại báo không mở được:</strong> Yêu cầu học sinh mở bằng trình duyệt <strong>Google Chrome</strong> hoặc <strong>Safari</strong>.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <a
            href={studentUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1"
          >
            <ExternalLink className="w-4 h-4" /> Mở thử trong tab mới
          </a>
          <button
            onClick={onClose}
            className="bg-slate-800 text-white hover:bg-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};
