import { useState, useEffect } from 'react';
import { SessionData, GroupData, DEFAULT_QUESTIONS } from './types.ts';
import { ApiService } from './services/api.ts';
import { TeacherView } from './components/TeacherView.tsx';
import { StudentView } from './components/StudentView.tsx';
import { GroupDetailModal } from './components/GroupDetailModal.tsx';
import { PresentationMode } from './components/PresentationMode.tsx';
import { FeedbackModal } from './components/FeedbackModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { PrintReport } from './components/PrintReport.tsx';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<'teacher' | 'student'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('role') === 'student') return 'student';
      if (params.get('role') === 'teacher') return 'teacher';
      // If mobile width, default to student; if desktop/laptop, default to teacher
      return window.innerWidth < 768 ? 'student' : 'teacher';
    }
    return 'teacher';
  });

  const [session, setSession] = useState<SessionData | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [detailGroup, setDetailGroup] = useState<GroupData | null>(null);
  const [presentationGroup, setPresentationGroup] = useState<GroupData | null>(null);
  const [feedbackGroup, setFeedbackGroup] = useState<GroupData | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);

  // Fetch initial session and establish real-time SSE stream
  useEffect(() => {
    let isMounted = true;

    // Fetch initial
    ApiService.getSession()
      .then((data) => {
        if (isMounted) {
          setSession(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load session:', err);
        if (isMounted) setIsLoading(false);
      });

    // Real-time SSE subscription
    const unsubscribe = ApiService.subscribeToStream(
      (newSession) => {
        if (isMounted) {
          setSession(newSession);
          setIsConnected(true);

          // If detail modal or feedback modal is currently viewing a group, update its reference
          setDetailGroup((prev) => (prev ? newSession.groups.find((g) => g.id === prev.id) || null : null));
          setFeedbackGroup((prev) => (prev ? newSession.groups.find((g) => g.id === prev.id) || null : null));
          setPresentationGroup((prev) => (prev ? newSession.groups.find((g) => g.id === prev.id) || null : null));
        }
      },
      (connected) => {
        if (isMounted) setIsConnected(connected);
      }
    );

    // Safety fallback polling every 5s
    const pollInterval = setInterval(() => {
      ApiService.getSession()
        .then((data) => {
          if (isMounted) {
            setSession(data);
            setIsConnected(true);
          }
        })
        .catch(() => {
          if (isMounted) setIsConnected(false);
        });
    }, 5000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <h2 className="text-xl font-bold">Đang kết nối Phòng Thảo Luận Số...</h2>
        <p className="text-sm text-slate-400 mt-2">Môn Tin học 10 – THPT Đinh Tiên Hoàng</p>
      </div>
    );
  }

  // If in Print Report Mode
  if (isPrintReportOpen) {
    return (
      <PrintReport
        session={session}
        onBack={() => setIsPrintReportOpen(false)}
      />
    );
  }

  // If in Presentation Mode
  if (presentationGroup) {
    return (
      <PresentationMode
        groups={session.groups}
        initialGroupId={presentationGroup.id}
        questions={session.questions || DEFAULT_QUESTIONS}
        sessionTitle={session.sessionTitle}
        schoolName={session.schoolName}
        teacherName={session.teacherName}
        onClose={() => setPresentationGroup(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {role === 'teacher' ? (
        <TeacherView
          session={session}
          isConnected={isConnected}
          onOpenGroupDetail={(grp) => setDetailGroup(grp)}
          onOpenPresentation={(grp) => setPresentationGroup(grp)}
          onOpenFeedback={(grp) => setFeedbackGroup(grp)}
          onOpenQrModal={() => setIsQrModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenPrintReport={() => setIsPrintReportOpen(true)}
          onSwitchToStudent={() => setRole('student')}
        />
      ) : (
        <StudentView
          session={session}
          isConnected={isConnected}
          onSwitchToTeacher={() => setRole('teacher')}
        />
      )}

      {/* Group Detail Modal ("XEM BÀI") */}
      <GroupDetailModal
        group={detailGroup}
        questions={session.questions || DEFAULT_QUESTIONS}
        onClose={() => setDetailGroup(null)}
        onOpenPresentation={(grp) => {
          setDetailGroup(null);
          setPresentationGroup(grp);
        }}
        onOpenFeedback={(grp) => {
          setDetailGroup(null);
          setFeedbackGroup(grp);
        }}
      />

      {/* Teacher Feedback Modal ("NHẬN XÉT") */}
      <FeedbackModal
        group={feedbackGroup}
        teacherPin={session.teacherPin}
        onClose={() => setFeedbackGroup(null)}
        onSuccess={(updatedGroup) => {
          setSession((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              groups: prev.groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
            };
          });
        }}
      />

      {/* QR Code Modal for student access */}
      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        sessionTitle={session.sessionTitle}
      />

      {/* Session Management Settings Modal */}
      {isSettingsModalOpen && (
        <SettingsModal
          session={session}
          onClose={() => setIsSettingsModalOpen(false)}
          onUpdate={(newSession) => setSession(newSession)}
        />
      )}
    </div>
  );
}
