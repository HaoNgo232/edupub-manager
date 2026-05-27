import type { Role } from './auth.types';
import type { DocumentStatus, Subject } from './document.types';

export interface AdminStatsSummary {
  totalUsers: number;
  totalAdmins: number;
  totalRegularUsers: number;
  totalDocuments: number;
  totalDraftDocuments: number;
  totalPublishedDocuments: number;
  totalArchivedDocuments: number;
}

export interface UsersByRoleItem {
  role: Role;
  count: number;
}

export interface DocumentsByStatusItem {
  status: DocumentStatus;
  count: number;
}

export interface DocumentsBySubjectItem {
  subject: Subject | string;
  count: number;
}

export interface DocumentsByGradeLevelItem {
  gradeLevel: number;
  count: number;
}

export interface RecentDocumentItem {
  id: string;
  title: string;
  subject: Subject;
  gradeLevel: number;
  status: DocumentStatus;
  owner: {
    id: string;
    email: string;
    fullName: string;
    role: Role;
    avatarUrl?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RecentUserItem {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string | null;
  documentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStatsResponse {
  summary: AdminStatsSummary;
  usersByRole: UsersByRoleItem[];
  documentsByStatus: DocumentsByStatusItem[];
  documentsBySubject: DocumentsBySubjectItem[];
  documentsByGradeLevel: DocumentsByGradeLevelItem[];
  recentDocuments: RecentDocumentItem[];
  recentUsers: RecentUserItem[];
}
