import { Subject, DocumentStatus } from '../api';

export const SUBJECT_ICONS: Record<Subject, string> = {
  MATH: 'calculate',
  LITERATURE: 'menu_book',
  ENGLISH: 'translate',
  PHYSICS: 'science',
  CHEMISTRY: 'biotech',
  BIOLOGY: 'eco',
  HISTORY: 'history_edu',
  GEOGRAPHY: 'public',
  OTHER: 'article',
};

export const SUBJECT_OPTIONS: ReadonlyArray<{ value: Subject; label: string; icon: string }> = [
  { value: 'MATH', label: 'Mathematics', icon: SUBJECT_ICONS.MATH },
  { value: 'LITERATURE', label: 'Literature', icon: SUBJECT_ICONS.LITERATURE },
  { value: 'ENGLISH', label: 'English', icon: SUBJECT_ICONS.ENGLISH },
  { value: 'PHYSICS', label: 'Physics', icon: SUBJECT_ICONS.PHYSICS },
  { value: 'CHEMISTRY', label: 'Chemistry', icon: SUBJECT_ICONS.CHEMISTRY },
  { value: 'BIOLOGY', label: 'Biology', icon: SUBJECT_ICONS.BIOLOGY },
  { value: 'HISTORY', label: 'History', icon: SUBJECT_ICONS.HISTORY },
  { value: 'GEOGRAPHY', label: 'Geography', icon: SUBJECT_ICONS.GEOGRAPHY },
  { value: 'OTHER', label: 'Other', icon: SUBJECT_ICONS.OTHER },
] as const;

export const STATUS_OPTIONS: ReadonlyArray<{
  value: DocumentStatus;
  label: string;
  description: string;
}> = [
  { value: 'DRAFT', label: 'Draft', description: 'Not visible to others yet' },
  { value: 'PUBLISHED', label: 'Published', description: 'Visible and accessible' },
  { value: 'ARCHIVED', label: 'Archived', description: 'Archived, read-only' },
] as const;

export const SUBJECT_FILTER_OPTIONS: ReadonlyArray<{
  value: Subject | '';
  label: string;
  icon?: string;
}> = [{ value: '', label: 'All Subjects' }, ...SUBJECT_OPTIONS] as const;

export const STATUS_FILTER_OPTIONS: ReadonlyArray<{
  value: DocumentStatus | '';
  label: string;
  description?: string;
}> = [{ value: '', label: 'All Status' }, ...STATUS_OPTIONS] as const;
