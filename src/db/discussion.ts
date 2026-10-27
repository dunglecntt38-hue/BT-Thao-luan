import { eq } from 'drizzle-orm';
import { db } from './index.ts';
import { sessions, groups } from './schema.ts';
import { SessionData, GroupData, DEFAULT_QUESTIONS } from '../types.ts';

export async function getSessionFromDb(): Promise<SessionData | null> {
  try {
    const existingSessions = await db.select().from(sessions).limit(1);
    if (!existingSessions || existingSessions.length === 0) {
      return null;
    }

    const s = existingSessions[0];
    const groupRows = await db.select().from(groups);

    // Sort groups 1 to 12
    const sortedGroups: GroupData[] = groupRows
      .sort((a, b) => a.id - b.id)
      .map((g) => ({
        id: g.id,
        name: g.name,
        status: g.status as any,
        answers: g.answers as any,
        draftAnswers: g.draftAnswers as any,
        submittedAt: g.submittedAt ? g.submittedAt.toISOString() : null,
        updatedAt: g.updatedAt ? g.updatedAt.toISOString() : null,
        members: g.members || '',
        feedback: g.feedback as any,
      }));

    return {
      sessionId: s.sessionId,
      sessionTitle: s.sessionTitle,
      schoolName: s.schoolName,
      teacherName: s.teacherName,
      subjectName: s.subjectName,
      situationContext: s.situationContext || '',
      isOpen: s.isOpen,
      allowEditAfterSubmit: s.allowEditAfterSubmit,
      teacherPin: s.teacherPin,
      questions: s.questions as [string, string, string, string],
      groups: sortedGroups,
      updatedAt: s.updatedAt ? s.updatedAt.toISOString() : new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching session from PostgreSQL:', error);
    return null;
  }
}

export async function saveInitialSessionToDb(session: SessionData) {
  try {
    // Upsert session
    const existing = await db.select().from(sessions).where(eq(sessions.sessionId, session.sessionId)).limit(1);
    if (existing.length === 0) {
      await db.insert(sessions).values({
        sessionId: session.sessionId,
        sessionTitle: session.sessionTitle,
        schoolName: session.schoolName,
        teacherName: session.teacherName,
        subjectName: session.subjectName,
        situationContext: session.situationContext,
        isOpen: session.isOpen,
        allowEditAfterSubmit: session.allowEditAfterSubmit,
        teacherPin: session.teacherPin,
        questions: session.questions,
      });
    }

    // Upsert 12 groups
    for (const g of session.groups) {
      const existingGrp = await db.select().from(groups).where(eq(groups.id, g.id)).limit(1);
      if (existingGrp.length === 0) {
        await db.insert(groups).values({
          id: g.id,
          sessionId: session.sessionId,
          name: g.name,
          status: g.status,
          answers: g.answers,
          draftAnswers: g.draftAnswers,
          members: g.members || '',
          submittedAt: g.submittedAt ? new Date(g.submittedAt) : null,
          feedback: g.feedback,
        });
      }
    }
  } catch (error) {
    console.error('Error saving initial session to PostgreSQL:', error);
  }
}

export async function updateGroupInDb(group: GroupData) {
  try {
    await db
      .update(groups)
      .set({
        status: group.status,
        answers: group.answers,
        draftAnswers: group.draftAnswers,
        members: group.members,
        submittedAt: group.submittedAt ? new Date(group.submittedAt) : null,
        updatedAt: new Date(),
        feedback: group.feedback,
      })
      .where(eq(groups.id, group.id));
  } catch (error) {
    console.error(`Error updating group ${group.id} in PostgreSQL:`, error);
  }
}

export async function updateSessionSettingsInDb(session: SessionData) {
  try {
    await db
      .update(sessions)
      .set({
        sessionTitle: session.sessionTitle,
        situationContext: session.situationContext,
        isOpen: session.isOpen,
        allowEditAfterSubmit: session.allowEditAfterSubmit,
        teacherPin: session.teacherPin,
        updatedAt: new Date(),
      })
      .where(eq(sessions.sessionId, session.sessionId));
  } catch (error) {
    console.error('Error updating session settings in PostgreSQL:', error);
  }
}
