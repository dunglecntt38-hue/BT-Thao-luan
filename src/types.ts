export type GroupStatus = 'not_started' | 'in_progress' | 'submitted' | 'reviewed' | 'needs_check';

export interface GroupAnswers {
  q1: string;
  q2: string;
  q3: string;
  q4: string;
}

export interface GroupFeedback {
  general: string;         // Nhận xét chung
  strengths: string;       // Điểm mạnh trong phần thảo luận
  areasToImprove: string;  // Nội dung cần bổ sung
  nextSteps: string;       // Hướng hoàn thiện
  isPublished: boolean;    // Đã công bố cho học sinh xem hay chưa
  updatedAt: string | null;
}

export interface GroupData {
  id: number;              // 1 to 12
  name: string;            // 'Nhóm 1' -> 'Nhóm 12'
  status: GroupStatus;
  answers: GroupAnswers;
  draftAnswers: GroupAnswers;
  submittedAt: string | null;
  updatedAt: string | null;
  members: string;         // Danh sách thành viên trong nhóm
  feedback: GroupFeedback;
}

export interface SessionData {
  sessionId: string;
  sessionTitle: string;
  schoolName: string;
  teacherName: string;
  subjectName: string;
  situationContext: string; // Tình huống mở rộng giáo viên có thể nhập thêm
  isOpen: boolean;          // Cho phép gửi bài hay khóa
  allowEditAfterSubmit: boolean; // Cho phép sửa bài đã gửi
  teacherPin: string;       // Mã PIN quản trị viên
  questions: [string, string, string, string];
  groups: GroupData[];
  updatedAt: string;
}

export const DEFAULT_QUESTIONS: [string, string, string, string] = [
  "Ai là người trực tiếp sáng tạo ra sản phẩm?",
  "Việc xóa tên tác giả và đăng lại sản phẩm có phù hợp không? Vì sao?",
  "Quyền tác giả trong tình huống này liên quan đến những quyền nào?",
  "Nếu muốn sử dụng áp phích của An, em nên làm gì?"
];

export const STATUS_CONFIG: Record<GroupStatus, { label: string; badgeClass: string; cardClass: string; dotClass: string }> = {
  not_started: {
    label: "Chưa làm",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-300",
    cardClass: "border-gray-200 bg-white hover:border-gray-300",
    dotClass: "bg-gray-400"
  },
  in_progress: {
    label: "Đang làm",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
    cardClass: "border-amber-300 bg-amber-50/40 hover:border-amber-400",
    dotClass: "bg-amber-500 animate-pulse"
  },
  submitted: {
    label: "Đã gửi bài",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
    cardClass: "border-blue-400 bg-blue-50/40 hover:border-blue-500 shadow-sm",
    dotClass: "bg-blue-600"
  },
  reviewed: {
    label: "Đã nhận xét",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    cardClass: "border-emerald-400 bg-emerald-50/40 hover:border-emerald-500 shadow-sm",
    dotClass: "bg-emerald-600"
  },
  needs_check: {
    label: "Cần kiểm tra",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-300",
    cardClass: "border-rose-300 bg-rose-50/40 hover:border-rose-400",
    dotClass: "bg-rose-500"
  }
};
