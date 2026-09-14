import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Student } from '../types';
import { getFullName, formatSectionShort } from '../data/mockStudents';

interface DeleteConfirmModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (student: Student) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  student,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !student) return null;

  const fullName = getFullName(student);

  return (
    <div
      id="delete-student-modal-overlay"
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-student-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div
        id="delete-student-dialog"
        className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <h2
                id="delete-student-title"
                className="text-lg font-bold text-slate-900 tracking-tight"
              >
                Delete Student?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete this student record? This action cannot be undone.
              </p>

              {/* Target Student Preview */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <p className="font-bold text-slate-900 text-sm">{fullName}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600 font-mono">
                  <span>ID: {student.studentId}</span>
                  <span>·</span>
                  <span>{student.course}</span>
                  <span>·</span>
                  <span>Section {formatSectionShort(student.section)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Buttons (Section 21: Cancel & Delete Student) */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
          <button
            type="button"
            id="cancel-delete-student-btn"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-student-btn"
            onClick={() => {
              onConfirmDelete(student);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-sm shadow-rose-600/20 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Student</span>
          </button>
        </div>
      </div>
    </div>
  );
};
