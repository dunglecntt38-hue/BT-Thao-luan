import { useState, useEffect } from 'react';
import { SessionData, GroupData, DEFAULT_QUESTIONS, createDefaultSession } from './types.ts';
import { ApiService } from './services/api.ts';
import { TeacherView } from './components/TeacherView.tsx';
import { StudentView } from './components/StudentView.tsx';
import { GroupDetailModal } from './components/GroupDetailModal.tsx';
import { PresentationMode } from './components/PresentationMode.tsx';
import { FeedbackModal } from './components/FeedbackModal.tsx';
import { QRCodeModal } from './components/QRCodeModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { PrintReport } from './components/PrintReport.tsx';

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

  // Always initialize with default or cached session so the UI renders IMMEDIATELY
  // and NEVER gets stuck on a dark loading screen.
  const [session, setSession] = useState<SessionData>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('thpt_cached_session_data');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && Array.isArray(parsed.groups) && parsed.groups.length === 12) {
            return parsed;
          }
        } catch {}
      }
    }
    return createDefaultSession();
  });

  const [isConnected, setIsConnected] = useState(true);

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

    // Fetch latest session from server
    const fetchLatest = () => {
      ApiService.getSession()
        .then((data) => {
          if (isMounted && data && Array.isArray(data.groups) && data.groups.length === 12) {
            setSession(data);
            setIsConnected(true);
            try {
              localStorage.setItem('thpt_cached_session_data', JSON.stringify(data));
            } catch {}
          }
        })
        .catch((err) => {
          console.warn('Initial session fetch warning:', err);
          if (isMounted) setIsConnected(false);
        });
    };

    fetchLatest();

    // Real-time SSE subscription
    let unsubscribe = () => {};
    try {
      unsubscribe = ApiService.subscribeToStream(
        (newSession) => {
          if (isMounted && newSession && Array.isArray(newSession.groups) && newSession.groups.length === 12) {
            setSession(newSession);
            setIsConnected(true);
            try {
              localStorage.setItem('thpt_cached_session_data', JSON.stringify(newSession));
            } catch {}

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
    } catch (e) {
      console.warn('SSE subscription error:', e);
    }

    // Safety fallback polling every 4s
    const pollInterval = setInterval(() => {
      ApiService.getSession()
        .then((data) => {
          if (isMounted && data && Array.isArray(data.groups) && data.groups.length === 12) {
            setSession(data);
            setIsConnected(true);
            try {
              localStorage.setItem('thpt_cached_session_data', JSON.stringify(data));
            } catch {}
          }
        })
        .catch(() => {
          if (isMounted) setIsConnected(false);
        });
    }, 4000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(pollInterval);
    };
  }, []);

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
          setSession((prev) => ({
            ...prev,
            groups: prev.groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
          }));
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
