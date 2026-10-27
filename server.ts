import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { DEFAULT_QUESTIONS, SessionData, GroupData } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'session_data.json');
const HISTORY_DIR = path.join(DATA_DIR, 'history');

// Initial 12 groups generator
function generateInitialGroups(): GroupData[] {
  const groups: GroupData[] = [];
  for (let i = 1; i <= 12; i++) {
    groups.push({
      id: i,
      name: `Nhóm ${i}`,
      status: 'not_started',
      answers: {
        q1: '',
        q2: '',
        q3: '',
        q4: '',
      },
      draftAnswers: {
        q1: '',
        q2: '',
        q3: '',
        q4: '',
      },
      submittedAt: null,
      updatedAt: null,
      members: '',
      feedback: {
        general: '',
        strengths: '',
        areasToImprove: '',
        nextSteps: '',
        isPublished: true, // Mặc định cho phép học sinh xem khi giáo viên lưu nhận xét
        updatedAt: null,
      },
    });
  }
  return groups;
}

function getDefaultSession(): SessionData {
  return {
    sessionId: `session_${Date.now()}`,
    sessionTitle: 'Thảo luận: Đạo đức, pháp luật và văn hóa trong môi trường số – Quyền tác giả',
    schoolName: 'THPT Đinh Tiên Hoàng',
    teacherName: 'Lê Thị Dung',
    subjectName: 'Tin học 10',
    situationContext: '',
    isOpen: true,
    allowEditAfterSubmit: true,
    teacherPin: '1234', // Mã PIN quản trị mặc định cho giáo viên
    questions: [...DEFAULT_QUESTIONS],
    groups: generateInitialGroups(),
    updatedAt: new Date().toISOString(),
  };
}

// In-memory session state
let sessionState: SessionData = getDefaultSession();

// Ensure data folder and file
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR, { recursive: true });
}

if (fs.existsSync(DATA_FILE)) {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.groups) && parsed.groups.length === 12) {
      sessionState = parsed;
      // Ensure questions match exact 4 questions if empty
      if (!sessionState.questions || sessionState.questions.length !== 4) {
        sessionState.questions = [...DEFAULT_QUESTIONS];
      }
    }
  } catch (err) {
    console.error('Error loading existing session data, initializing default:', err);
  }
} else {
  fs.writeFileSync(DATA_FILE, JSON.stringify(sessionState, null, 2), 'utf-8');
}

function persistSession() {
  sessionState.updatedAt = new Date().toISOString();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(sessionState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist session to disk:', err);
  }
  broadcastSession();
}

// Connected SSE clients
const sseClients = new Set<Response>();

function broadcastSession() {
  const payload = `data: ${JSON.stringify({ type: 'session_update', data: sessionState })}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/session', (_req: Request, res: Response) => {
    res.json({ success: true, data: sessionState });
  });

  // Server-Sent Events stream for instant real-time synchronization
  app.get('/api/stream', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send initial current state
    res.write(`data: ${JSON.stringify({ type: 'init', data: sessionState })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
  });

  // Keep-alive heartbeat every 15s to keep connections healthy through reverse proxies
  setInterval(() => {
    for (const client of sseClients) {
      try {
        client.write(': heartbeat\n\n');
      } catch {
        sseClients.delete(client);
      }
    }
  }, 15000);

  // Student save draft
  app.post('/api/group/:groupId/draft', (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId, 10);
    const group = sessionState.groups.find(g => g.id === groupId);
    if (!group) {
      res.status(404).json({ success: false, error: 'Không tìm thấy nhóm' });
      return;
    }

    const { answers, members } = req.body;
    if (answers) {
      group.draftAnswers = {
        q1: answers.q1 || '',
        q2: answers.q2 || '',
        q3: answers.q3 || '',
        q4: answers.q4 || '',
      };
    }
    if (members !== undefined) {
      group.members = members;
    }

    // Update status to in_progress if not yet submitted
    if (group.status === 'not_started') {
      const hasAnyInput = Object.values(group.draftAnswers).some(val => val.trim().length > 0);
      if (hasAnyInput) {
        group.status = 'in_progress';
      }
    }
    group.updatedAt = new Date().toISOString();

    persistSession();
    res.json({ success: true, message: 'Đã lưu bản nháp thành công', data: group });
  });

  // Student submit final answers
  app.post('/api/group/:groupId/submit', (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId, 10);
    const group = sessionState.groups.find(g => g.id === groupId);
    if (!group) {
      res.status(404).json({ success: false, error: 'Không tìm thấy nhóm' });
      return;
    }

    if (!sessionState.isOpen) {
      res.status(403).json({ success: false, error: 'Buổi thảo luận hiện đang đóng. Không thể gửi bài lúc này.' });
      return;
    }

    if (group.status === 'submitted' || group.status === 'reviewed') {
      if (!sessionState.allowEditAfterSubmit) {
        res.status(403).json({ success: false, error: 'Giáo viên không cho phép chỉnh sửa bài sau khi đã gửi.' });
        return;
      }
    }

    const { answers, members } = req.body;
    const finalAnswers = {
      q1: (answers?.q1 || '').trim(),
      q2: (answers?.q2 || '').trim(),
      q3: (answers?.q3 || '').trim(),
      q4: (answers?.q4 || '').trim(),
    };

    // Check missing questions
    const missing: number[] = [];
    if (!finalAnswers.q1) missing.push(1);
    if (!finalAnswers.q2) missing.push(2);
    if (!finalAnswers.q3) missing.push(3);
    if (!finalAnswers.q4) missing.push(4);

    if (missing.length > 0) {
      res.status(400).json({
        success: false,
        error: `Nhóm chưa hoàn thành các câu hỏi: ${missing.map(m => `Câu ${m}`).join(', ')}. Vui lòng trả lời đầy đủ trước khi gửi.`,
        missingQuestions: missing,
      });
      return;
    }

    group.answers = finalAnswers;
    group.draftAnswers = { ...finalAnswers };
    if (members !== undefined) {
      group.members = members;
    }
    // Set status to submitted (or keep reviewed if teacher already commented)
    if (group.status !== 'reviewed') {
      group.status = 'submitted';
    }
    const now = new Date().toISOString();
    group.submittedAt = now;
    group.updatedAt = now;

    persistSession();
    res.json({
      success: true,
      message: 'Gửi bài thảo luận thành công! Bài làm đã được cập nhật đến máy chiếu giáo viên.',
      data: group,
    });
  });

  // Teacher feedback save
  app.post('/api/group/:groupId/feedback', (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId, 10);
    const group = sessionState.groups.find(g => g.id === groupId);
    if (!group) {
      res.status(404).json({ success: false, error: 'Không tìm thấy nhóm' });
      return;
    }

    const { feedback, pin } = req.body;
    if (sessionState.teacherPin && pin !== sessionState.teacherPin) {
      res.status(401).json({ success: false, error: 'Mã PIN giáo viên không chính xác' });
      return;
    }

    group.feedback = {
      general: (feedback?.general || '').trim(),
      strengths: (feedback?.strengths || '').trim(),
      areasToImprove: (feedback?.areasToImprove || '').trim(),
      nextSteps: (feedback?.nextSteps || '').trim(),
      isPublished: feedback?.isPublished ?? true,
      updatedAt: new Date().toISOString(),
    };

    const hasFeedback = group.feedback.general || group.feedback.strengths || group.feedback.areasToImprove || group.feedback.nextSteps;
    if (hasFeedback) {
      group.status = 'reviewed';
    } else if (group.answers.q1 || group.answers.q2 || group.answers.q3 || group.answers.q4) {
      group.status = 'submitted';
    } else {
      group.status = 'not_started';
    }

    persistSession();
    res.json({ success: true, message: 'Đã lưu nhận xét thành công', data: group });
  });

  // Teacher manually change status
  app.post('/api/group/:groupId/status', (req: Request, res: Response) => {
    const groupId = parseInt(req.params.groupId, 10);
    const group = sessionState.groups.find(g => g.id === groupId);
    if (!group) {
      res.status(404).json({ success: false, error: 'Không tìm thấy nhóm' });
      return;
    }

    const { status, pin } = req.body;
    if (sessionState.teacherPin && pin !== sessionState.teacherPin) {
      res.status(401).json({ success: false, error: 'Mã PIN giáo viên không chính xác' });
      return;
    }

    group.status = status;
    group.updatedAt = new Date().toISOString();
    persistSession();
    res.json({ success: true, data: group });
  });

  // Teacher update session settings
  app.post('/api/session/settings', (req: Request, res: Response) => {
    const { sessionTitle, isOpen, allowEditAfterSubmit, situationContext, teacherPin, pin } = req.body;

    if (sessionState.teacherPin && pin !== sessionState.teacherPin) {
      res.status(401).json({ success: false, error: 'Mã PIN giáo viên không chính xác' });
      return;
    }

    if (sessionTitle !== undefined) sessionState.sessionTitle = sessionTitle.trim();
    if (isOpen !== undefined) sessionState.isOpen = Boolean(isOpen);
    if (allowEditAfterSubmit !== undefined) sessionState.allowEditAfterSubmit = Boolean(allowEditAfterSubmit);
    if (situationContext !== undefined) sessionState.situationContext = situationContext.trim();
    if (teacherPin !== undefined && teacherPin.trim()) sessionState.teacherPin = teacherPin.trim();

    persistSession();
    res.json({ success: true, message: 'Đã cập nhật cài đặt buổi thảo luận', data: sessionState });
  });

  // Reset or create new session (archives old data)
  app.post('/api/session/reset', (req: Request, res: Response) => {
    const { pin, newTitle, situationContext } = req.body;
    if (sessionState.teacherPin && pin !== sessionState.teacherPin) {
      res.status(401).json({ success: false, error: 'Mã PIN giáo viên không chính xác' });
      return;
    }

    // Archive current session
    try {
      const historyFile = path.join(HISTORY_DIR, `${sessionState.sessionId}_${Date.now()}.json`);
      fs.writeFileSync(historyFile, JSON.stringify(sessionState, null, 2), 'utf-8');
    } catch (archiveErr) {
      console.warn('Could not archive old session:', archiveErr);
    }

    sessionState = {
      ...getDefaultSession(),
      sessionId: `session_${Date.now()}`,
      sessionTitle: newTitle || sessionState.sessionTitle,
      situationContext: situationContext !== undefined ? situationContext : sessionState.situationContext,
      teacherPin: sessionState.teacherPin,
    };

    persistSession();
    res.json({ success: true, message: 'Đã khởi tạo buổi thảo luận mới thành công!', data: sessionState });
  });

  // Export to CSV with UTF-8 BOM for Excel compatibility
  app.get('/api/export-csv', (_req: Request, res: Response) => {
    try {
      const headers = [
        'Tên buổi học',
        'Tên nhóm',
        'Trạng thái',
        'Thời gian gửi',
        'Thành viên',
        `Câu 1: ${sessionState.questions[0].replace(/"/g, '""')}`,
        `Câu 2: ${sessionState.questions[1].replace(/"/g, '""')}`,
        `Câu 3: ${sessionState.questions[2].replace(/"/g, '""')}`,
        `Câu 4: ${sessionState.questions[3].replace(/"/g, '""')}`,
        'Trạng thái nhận xét',
        'Nhận xét chung',
        'Điểm mạnh',
        'Nội dung cần bổ sung',
        'Hướng hoàn thiện'
      ];

      const escapeCSV = (val: string | null | undefined) => {
        if (!val) return '""';
        return `"${val.replace(/"/g, '""').replace(/\n/g, ' ')}"`;
      };

      const rows: string[] = [];
      rows.push(headers.map(h => `"${h}"`).join(','));

      for (const g of sessionState.groups) {
        const row = [
          escapeCSV(sessionState.sessionTitle),
          escapeCSV(g.name),
          escapeCSV(
            g.status === 'submitted' ? 'Đã gửi bài' :
            g.status === 'reviewed' ? 'Đã nhận xét' :
            g.status === 'in_progress' ? 'Đang làm' : 'Chưa làm'
          ),
          escapeCSV(g.submittedAt ? new Date(g.submittedAt).toLocaleString('vi-VN') : 'Chưa gửi'),
          escapeCSV(g.members),
          escapeCSV(g.answers.q1 || '(Chưa trả lời)'),
          escapeCSV(g.answers.q2 || '(Chưa trả lời)'),
          escapeCSV(g.answers.q3 || '(Chưa trả lời)'),
          escapeCSV(g.answers.q4 || '(Chưa trả lời)'),
          escapeCSV(g.feedback.general || g.feedback.strengths ? 'Đã nhận xét' : 'Chưa nhận xét'),
          escapeCSV(g.feedback.general),
          escapeCSV(g.feedback.strengths),
          escapeCSV(g.feedback.areasToImprove),
          escapeCSV(g.feedback.nextSteps),
        ];
        rows.push(row.join(','));
      }

      // Add UTF-8 BOM so Microsoft Excel renders Vietnamese characters correctly
      const csvContent = '\uFEFF' + rows.join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="Ket_qua_thao_luan_Tin_hoc_10_${Date.now()}.csv"`);
      res.send(csvContent);
    } catch (err) {
      console.error('Export CSV error:', err);
      res.status(500).send('Lỗi khi xuất file CSV');
    }
  });

  // Serve Vite app in dev mode or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Phòng Thảo Luận Số server is listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
