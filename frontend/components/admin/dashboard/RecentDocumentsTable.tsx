import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { RecentDocumentItem } from '../../../lib/types/admin-stats.types';
import StatusBadge from '../../StatusBadge';
import DashboardEmptyState from './DashboardEmptyState';

interface RecentDocumentsTableProps {
  documents: RecentDocumentItem[];
}

export default function RecentDocumentsTable({ documents }: RecentDocumentsTableProps) {
  if (documents.length === 0) {
    return (
      <div className="bg-paper-cream border border-graphite-border rounded-lg overflow-hidden flex flex-col h-full">
        <div className="p-6 border-b border-graphite-border bg-[#f4f4f0] flex justify-between items-center">
          <h3 className="text-headline-md text-ink-black">Recent Documents</h3>
          <Link
            href="/admin/documents"
            className="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-widest hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="flex-grow flex items-center justify-center p-6 bg-white">
          <DashboardEmptyState
            title="No recent documents"
            description="Documents created in the system will appear here."
            icon="description"
          />
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getSubjectLabel = (subject: string) => {
    const SUBJECT_LABEL_MAP: Record<string, string> = {
      MATH: 'Math',
      LITERATURE: 'Literature',
      ENGLISH: 'English',
      PHYSICS: 'Physics',
      CHEMISTRY: 'Chemistry',
      BIOLOGY: 'Biology',
      HISTORY: 'History',
      GEOGRAPHY: 'Geography',
      OTHER: 'Other',
    };
    return SUBJECT_LABEL_MAP[subject] || subject;
  };

  return (
    <div className="bg-paper-cream border border-graphite-border rounded-lg overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-graphite-border bg-[#f4f4f0] flex justify-between items-center">
        <h3 className="text-headline-md text-ink-black">Recent Documents</h3>
        <Link
          href="/admin/documents"
          className="font-label-sm text-label-sm text-on-tertiary-container uppercase tracking-widest hover:underline"
        >
          View All
        </Link>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-white flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-graphite-border bg-surface-bright">
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium">Title</th>
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium">Owner</th>
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium">Subject</th>
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium">Grade</th>
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium">Updated At</th>
              <th className="py-3 px-6 font-label-md text-label-md text-[#76777b] font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-graphite-border">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-surface-bright transition-colors">
                <td className="py-4 px-6 font-medium">
                  <Link href={`/documents/${doc.id}`} className="hover:text-on-tertiary-container transition-colors line-clamp-1">
                    {doc.title}
                  </Link>
                </td>
                <td className="py-4 px-6 text-secondary">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#e9e8e4] border border-graphite-border flex items-center justify-center overflow-hidden shrink-0">
                      {doc.owner.avatarUrl ? (
                        <Image
                          src={doc.owner.avatarUrl}
                          alt=""
                          width={24}
                          height={24}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="material-symbols-outlined text-[12px] text-[#76777b]">person</span>
                      )}
                    </div>
                    <span className="truncate max-w-[120px]">{doc.owner.fullName}</span>
                  </div>
                </td>
                <td className="py-4 px-6">{getSubjectLabel(doc.subject)}</td>
                <td className="py-4 px-6">Grade {doc.gradeLevel}</td>
                <td className="py-4 px-6 text-[#76777b]">{formatDate(doc.updatedAt)}</td>
                <td className="py-4 px-6 text-right">
                  <StatusBadge status={doc.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-graphite-border bg-white flex-grow">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <Link href={`/documents/${doc.id}`} className="font-semibold text-ink-black hover:text-on-tertiary-container transition-colors line-clamp-2">
                {doc.title}
              </Link>
              <StatusBadge status={doc.status} />
            </div>
            <div className="flex items-center justify-between text-xs text-[#76777b]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">person</span>
                <span>{doc.owner.fullName}</span>
              </div>
              <div>{getSubjectLabel(doc.subject)} • Grade {doc.gradeLevel}</div>
            </div>
            <div className="text-[11px] text-[#76777b] text-right">
              Updated {formatDate(doc.updatedAt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
