import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Check, ExternalLink, Smartphone } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, sessionTitle }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [studentUrl, setStudentUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}?role=student`;
      setStudentUrl(url);
      QRCode.toDataURL(url, {
        width: 380,
        margin: 2,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff',
        },
      })
        .then((dataUri) => setQrDataUrl(dataUri))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(studentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-blue-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-snug">Mã QR Tham Gia Thảo Luận</h3>
              <p className="text-xs text-blue-100">Học sinh quét mã bằng điện thoại để làm bài</p>
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

        <div className="p-6 text-center space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 inline-block mx-auto shadow-inner">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="QR Code thảo luận"
                className="w-64 h-64 mx-auto rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-slate-400">
                Đang tạo mã QR...
              </div>
            )}
          </div>

          <div className="text-sm font-medium text-slate-700 bg-blue-50 py-2 px-4 rounded-lg inline-block border border-blue-100">
            {sessionTitle}
          </div>

          <p className="text-sm text-slate-600">
            Giáo viên có thể chiếu mã này lên máy chiếu để cả 12 nhóm dùng điện thoại quét và bắt đầu thảo luận ngay.
          </p>

          <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl text-xs text-slate-700 font-mono break-all border border-slate-200">
            <span className="truncate flex-1 select-all">{studentUrl}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-sans text-xs font-semibold shrink-0 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Đã chép' : 'Sao chép'}
            </button>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <a
              href={studentUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition"
            >
              <ExternalLink className="w-4 h-4" /> Mở thử giao diện học sinh
            </a>
            <button
              onClick={onClose}
              className="bg-slate-800 text-white hover:bg-slate-900 font-semibold text-sm px-5 py-2 rounded-xl transition"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
