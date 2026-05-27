'use client';

import React, { useState } from 'react';
import { Role, updateAdminUserRole, ApiError } from '../../../lib/api';
import { useAuth } from '../../../app/context/AuthContext';

interface ChangeUserRoleDialogProps {
  userId: string;
  userFullName: string;
  userEmail: string;
  currentRole: Role;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ChangeUserRoleDialog({
  userId,
  userFullName,
  userEmail,
  currentRole,
  onSuccess,
  onCancel,
}: ChangeUserRoleDialogProps) {
  const { user: currentUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isSelf = currentUser?.id === userId;
  const newRole = selectedRole ?? currentRole;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSelf) return;

    setSaving(true);
    setErrorMsg(null);

    try {
      await updateAdminUserRole(userId, { role: newRole });
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.errors.join(', '));
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="change-role-dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs"
    >
      <div className="bg-white border border-graphite-border p-8 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-headline-md text-[#030509] font-bold mb-4">Change user role</h3>

        {errorMsg && (
          <div className="mb-4 p-3 border border-[#ba1a1a] bg-[#ffdad6] text-[#ba1a1a] font-label-md">{errorMsg}</div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <span className="font-label-sm text-[#76777b] uppercase tracking-widest block mb-0.5">User</span>
            <p className="font-label-md text-[#030509] font-semibold">{userFullName}</p>
            <p className="font-label-sm text-[#76777b]">{userEmail}</p>
          </div>

          <div>
            <span className="font-label-sm text-[#76777b] uppercase tracking-widest block mb-1">Current Role</span>
            <span className="inline-block bg-[#e9e8e4] text-[#46464b] border border-graphite-border px-2.5 py-0.5 font-label-sm rounded uppercase">
              {currentRole}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="font-label-sm text-[#76777b] uppercase tracking-widest block"
                htmlFor="dialog-user-role"
              >
                New Role
              </label>
              <select
                id="dialog-user-role"
                value={newRole}
                onChange={(e) => setSelectedRole(e.target.value as Role)}
                disabled={isSelf || saving}
                className="w-full bg-white border border-graphite-border px-3 py-2 font-label-md focus:border-[#030509] outline-none"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            {isSelf ? (
              <div
                id="self-action-role-warning"
                className="p-3 bg-[#fff3cd] border border-[#ffe69c] text-[#664d03] font-label-md rounded"
              >
                You cannot change your own role.
              </div>
            ) : (
              <p className="font-label-sm text-[#76777b] italic">
                Changing a user&apos;s role will update their access permissions immediately.
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                id="btn-dialog-save-role"
                type="submit"
                disabled={isSelf || saving}
                className="flex-grow flex items-center justify-center gap-2 bg-[#030509] text-white font-label-md px-5 py-2.5 hover:opacity-90 transition-all disabled:opacity-50 active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Saving...
                  </>
                ) : (
                  'Save Role'
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={saving}
                className="px-5 py-2.5 border border-graphite-border bg-white font-label-md text-[#76777b] hover:bg-[#e9e8e4] transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
