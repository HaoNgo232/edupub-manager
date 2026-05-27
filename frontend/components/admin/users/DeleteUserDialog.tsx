'use client';

import React, { useState } from 'react';
import { deleteAdminUser, ApiError } from '../../../lib/api';
import { useAuth } from '../../../app/context/AuthContext';

interface DeleteUserDialogProps {
  userId: string;
  userFullName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DeleteUserDialog({ userId, userFullName, onSuccess, onCancel }: DeleteUserDialogProps) {
  const { user: currentUser } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSelf = currentUser?.id === userId;

  const handleDelete = async () => {
    if (isSelf) return;

    setDeleting(true);
    setErrorMsg(null);

    try {
      await deleteAdminUser(userId);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.errors.join(', '));
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      id="delete-user-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs"
    >
      <div className="bg-white border border-graphite-border p-8 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px] text-[#ba1a1a]">warning</span>
          </div>
          <div>
            <h3 className="font-label-md font-bold text-[#030509] mb-1 text-[18px]">Delete user?</h3>
            <p className="font-label-md text-[#76777b]">
              This action cannot be undone. The user{' '}
              <strong className="text-[#030509]">&quot;{userFullName}&quot;</strong> and all related documents will be
              permanently deleted.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 border border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a] font-label-md">{errorMsg}</div>
        )}

        {isSelf && (
          <div
            id="self-action-delete-warning"
            className="mb-4 p-3 bg-[#fff3cd] border border-[#ffe69c] text-[#664d03] font-label-md rounded"
          >
            You cannot delete your own account.
          </div>
        )}

        <div className="flex gap-3">
          <button
            id="btn-dialog-confirm-delete"
            onClick={handleDelete}
            disabled={isSelf || deleting}
            className="flex-grow flex items-center justify-center gap-2 bg-[#ba1a1a] text-white font-label-md px-5 py-2.5 hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {deleting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                Deleting...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">delete</span>
                Delete User
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-5 py-2.5 border border-graphite-border bg-white font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
