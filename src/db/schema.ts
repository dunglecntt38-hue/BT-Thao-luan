import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table (Firebase Auth linked)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Discussion Sessions table
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionId: text('session_id').notNull().unique(),
  sessionTitle: text('session_title').notNull(),
  schoolName: text('school_name').notNull(),
  teacherName: text('teacher_name').notNull(),
  subjectName: text('subject_name').notNull(),
  situationContext: text('situation_context').default(''),
  isOpen: boolean('is_open').default(true).notNull(),
  allowEditAfterSubmit: boolean('allow_edit_after_submit').default(true).notNull(),
  teacherPin: text('teacher_pin').default('1234').notNull(),
  questions: jsonb('questions').notNull(), // Exact 4 discussion questions
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 12 Discussion Groups table
export const groups = pgTable('groups', {
  id: integer('id').primaryKey(), // 1 to 12
  sessionId: text('session_id').notNull(),
  name: text('name').notNull(), // 'Nhóm 1' -> 'Nhóm 12'
  status: text('status').default('not_started').notNull(),
  answers: jsonb('answers').notNull(),
  draftAnswers: jsonb('draft_answers').notNull(),
  members: text('members').default(''),
  submittedAt: timestamp('submitted_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
  feedback: jsonb('feedback').notNull(),
});
