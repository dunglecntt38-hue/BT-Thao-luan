import { SessionData, GroupAnswers, GroupFeedback, GroupStatus } from '../types.ts';

export class ApiService {
  private static eventSource: EventSource | null = null;

  static async getSession(): Promise<SessionData> {
    const res = await fetch('/api/session');
    if (!res.ok) throw new Error('Không thể tải dữ liệu buổi học');
    const json = await res.json();
    return json.data;
  }

  static async saveDraft(groupId: number, answers: GroupAnswers, members?: string): Promise<any> {
    const res = await fetch(`/api/group/${groupId}/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, members }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Lỗi lưu bản nháp' }));
      throw new Error(err.error || 'Lỗi lưu bản nháp');
    }
    return res.json();
  }

  static async submitAnswers(groupId: number, answers: GroupAnswers, members?: string): Promise<any> {
    const res = await fetch(`/api/group/${groupId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers, members }),
    });
    const json = await res.json().catch(() => ({ error: 'Lỗi máy chủ' }));
    if (!res.ok) {
      throw new Error(json.error || 'Lỗi khi gửi bài');
    }
    return json;
  }

  static async saveFeedback(groupId: number, feedback: GroupFeedback, pin: string): Promise<any> {
    const res = await fetch(`/api/group/${groupId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, pin }),
    });
    const json = await res.json().catch(() => ({ error: 'Lỗi lưu nhận xét' }));
    if (!res.ok) {
      throw new Error(json.error || 'Lỗi khi lưu nhận xét');
    }
    return json;
  }

  static async updateStatus(groupId: number, status: GroupStatus, pin: string): Promise<any> {
    const res = await fetch(`/api/group/${groupId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, pin }),
    });
    const json = await res.json().catch(() => ({ error: 'Lỗi cập nhật trạng thái' }));
    if (!res.ok) {
      throw new Error(json.error || 'Lỗi khi cập nhật trạng thái');
    }
    return json;
  }

  static async updateSettings(settings: {
    sessionTitle?: string;
    isOpen?: boolean;
    allowEditAfterSubmit?: boolean;
    situationContext?: string;
    teacherPin?: string;
    pin: string;
  }): Promise<any> {
    const res = await fetch('/api/session/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const json = await res.json().catch(() => ({ error: 'Lỗi cập nhật cài đặt' }));
    if (!res.ok) {
      throw new Error(json.error || 'Lỗi cập nhật cài đặt');
    }
    return json;
  }

  static async resetSession(pin: string, newTitle?: string, situationContext?: string): Promise<any> {
    const res = await fetch('/api/session/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin, newTitle, situationContext }),
    });
    const json = await res.json().catch(() => ({ error: 'Lỗi đặt lại buổi thảo luận' }));
    if (!res.ok) {
      throw new Error(json.error || 'Lỗi đặt lại buổi thảo luận');
    }
    return json;
  }

  static subscribeToStream(
    onUpdate: (session: SessionData) => void,
    onStatusChange?: (connected: boolean) => void
  ): () => void {
    let reconnectTimeout: any = null;

    const connect = () => {
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource('/api/stream');

      this.eventSource.onopen = () => {
        onStatusChange?.(true);
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'init' || payload.type === 'session_update') {
            onUpdate(payload.data);
          }
        } catch (e) {
          console.error('SSE JSON error', e);
        }
      };

      this.eventSource.onerror = () => {
        onStatusChange?.(false);
        this.eventSource?.close();
        this.eventSource = null;
        // Reconnect after 3 seconds
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }
}
