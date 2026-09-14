import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { RecentStudents } from './components/RecentStudents';
import { SearchFilterPanel } from './components/SearchFilterPanel';
import { StudentTable } from './components/StudentTable';
import { StudentDetailsModal } from './components/StudentDetailsModal';
import { StudentFormModal } from './components/StudentFormModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { LogoutModal } from './components/LogoutModal';
import { ReportsView } from './components/ReportsView';
import { CoursesView } from './components/CoursesView';
import { SectionsView } from './components/SectionsView';
import { SettingsView } from './components/SettingsView';
import { ToastContainer } from './components/Toast';
import { Student, FilterState, ToastMessage, YearLevel } from './types';
import { AVAILABLE_SECTIONS, getFullName, formatSectionShort } from './data/mockStudents';
import {
  exportStudentsToCSV,
  exportStudentsToPDF,
  exportStudentsToWord
} from './utils/exportUtils';
import {
  fetchStudents,
  addStudent as addStudentService,
  updateStudent as updateStudentService,
  deleteStudent as deleteStudentService,
  deleteAllStudents as deleteAllStudentsService
} from './services/studentService';

export default function App() {
  // Navigation State: 'students' | 'dashboard' | 'reports' | 'courses' | 'sections' | 'settings'
  const [currentNav, setCurrentNav] = useState('students');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Student Records State (starts empty - 0 records, live Supabase backend)
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    course: 'All',
    year: 'All',
    section: 'All Sections',
    status: 'All',
  });

  // Modal States
  const [detailsStudent, setDetailsStudent] = useState<Student | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [formStudent, setFormStudent] = useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'pdf' | 'docx' | null>(null);

  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  // Toast Feedback State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch student records from Supabase on mount
  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchStudents();
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        setStudents(result.data);
      }
    } catch (err) {
      console.error('Failed to load students from Supabase:', err);
      showToast('Unable to connect to the database. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Filter logic: all filters work in conjunction (Section 10: AND logic)
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // 1. Search filter: student name or student ID (e.g. "Hazel" or "2024-01402")
      if (filters.search.trim() !== '') {
        const query = filters.search.toLowerCase().trim();
        const fullName = getFullName(student).toLowerCase();
        const studentId = student.studentId.toLowerCase();
        const matchesName = fullName.includes(query);
        const matchesId = studentId.includes(query);
        const matchesCourse = student.course.toLowerCase().includes(query);
        const matchesSection = student.section.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesCourse && !matchesSection) {
          return false;
        }
      }

      // 2. Degree Program Filter (BSIT or DIT)
      if (filters.course !== 'All' && student.course !== filters.course) {
        return false;
      }

      // 3. Year Level Filter (1st Year, 2nd Year, 3rd Year, 4th Year)
      if (filters.year !== 'All' && student.yearLevel !== filters.year) {
        return false;
      }

      // 4. Section Filter (e.g. BSIT 3B)
      if (filters.section !== 'All Sections' && student.section !== filters.section) {
        return false;
      }

      // 5. Status Filter (Regular, Irregular, On Leave, Graduated)
      if (filters.status !== 'All' && student.status !== filters.status) {
        return false;
      }

      return true;
    });
  }, [students, filters]);

  // Dynamic Year Level student counts for Stats Cards
  const firstYearCount = useMemo(
    () => students.filter((s) => s.yearLevel === '1st Year').length,
    [students]
  );
  const secondYearCount = useMemo(
    () => students.filter((s) => s.yearLevel === '2nd Year').length,
    [students]
  );
  const thirdYearCount = useMemo(
    () => students.filter((s) => s.yearLevel === '3rd Year').length,
    [students]
  );
  const fourthYearCount = useMemo(
    () => students.filter((s) => s.yearLevel === '4th Year').length,
    [students]
  );

  // Handler: Update partial filters
  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Handler: Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      course: 'All',
      year: 'All',
      section: 'All Sections',
      status: 'All',
    });
    showToast('Filters have been reset to default view.', 'info');
  };

  // Student CRUD: Add / Edit
  const handleOpenAddModal = () => {
    setFormStudent(null);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setFormStudent(student);
    setIsFormOpen(true);
  };

  const handleSaveStudent = async (
    studentData: Omit<Student, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      // UPDATE STUDENT (Section 6)
      const res = await updateStudentService(existingId, studentData);
      if (res.error) {
        showToast(res.error, 'error');
      } else if (res.data) {
        const updated = res.data;
        setStudents((prev) =>
          prev.map((s) => (s.id === existingId ? updated : s))
        );
        if (detailsStudent && detailsStudent.id === existingId) {
          setDetailsStudent(updated);
        }
        showToast('Student updated successfully.', 'success');
      }
    } else {
      // ADD STUDENT (Section 5)
      const res = await addStudentService(studentData);
      if (res.error) {
        showToast(res.error, 'error');
      } else if (res.data) {
        const created = res.data;
        setStudents((prev) => [created, ...prev]);
        showToast('Student added successfully.', 'success');
      }
    }
  };

  // Student CRUD: View Details (Section 8)
  const handleOpenViewDetails = (student: Student) => {
    setDetailsStudent(student);
    setIsDetailsOpen(true);
  };

  // Student CRUD: Delete (Section 7)
  const handleOpenDeleteConfirm = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    const targetId = studentToDelete.id;
    const res = await deleteStudentService(targetId);
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      setStudents((prev) => prev.filter((s) => s.id !== targetId));
      if (detailsStudent && detailsStudent.id === targetId) {
        setIsDetailsOpen(false);
        setDetailsStudent(null);
      }
      showToast('Student deleted successfully.', 'success');
    }
    setIsDeleteOpen(false);
    setStudentToDelete(null);
  };

  // Destructive Clean Reset: Delete all students from Supabase (Section 2)
  const handleDeleteAllStudents = async () => {
    const res = await deleteAllStudentsService();
    if (res.error) {
      showToast(res.error, 'error');
    } else {
      setStudents([]);
      if (detailsStudent) {
        setIsDetailsOpen(false);
        setDetailsStudent(null);
      }
      handleResetFilters();
      showToast('All student records deleted successfully.', 'success');
    }
  };

  // Reload / Sync with Supabase
  const handleReloadFromSupabase = async () => {
    await loadStudents();
    showToast('Student records synchronized from Supabase.', 'info');
  };

  // Multi-format Student Export System (CSV, PDF, Word .DOCX - Sections 11, 12, 13, 14)
  const handleExport = async (format: 'csv' | 'pdf' | 'docx') => {
    const matchingCount = filteredStudents.length;
    if (matchingCount === 0) {
      showToast('No students found to export.', 'error');
      return;
    }

    const formatLabel = format === 'docx' ? 'Word (.DOCX)' : format.toUpperCase();
    showToast(`Exporting ${matchingCount} student${matchingCount === 1 ? '' : 's'} to ${formatLabel}...`, 'info');
    setExportingFormat(format);

    try {
      await new Promise((resolve) => setTimeout(resolve, 80));

      let result;
      if (format === 'csv') {
        result = exportStudentsToCSV(filteredStudents, filters);
      } else if (format === 'pdf') {
        result = await exportStudentsToPDF(filteredStudents, filters);
      } else {
        result = await exportStudentsToWord(filteredStudents, filters);
      }

      if (result.success) {
        const descParts: string[] = [];
        if (filters.course !== 'All') descParts.push(filters.course);
        if (filters.year !== 'All') descParts.push(filters.year);
        if (filters.section !== 'All Sections' && filters.section !== 'All') {
          descParts.push(`Section ${formatSectionShort(filters.section)}`);
        }
        const descText = descParts.length > 0 ? ` ${descParts.join(' ')}` : '';

        showToast(
          `Successfully exported ${result.count}${descText} student${result.count === 1 ? '' : 's'} to ${formatLabel}.`,
          'success'
        );
      } else {
        showToast('Unable to export student records.', 'error');
      }
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Unable to export student records.', 'error');
    } finally {
      setExportingFormat(null);
    }
  };

  const handleExportCSV = () => {
    handleExport('csv');
  };

  // Scroll to records table when View All is clicked in Recent Students
  const handleViewAllStudents = () => {
    setCurrentNav('students');
    handleResetFilters();
    setTimeout(() => {
      const tableEl = document.getElementById('student-table-section');
      if (tableEl) {
        tableEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleNavigateToStudentsWithFilter = (newFilters?: Partial<FilterState>) => {
    if (newFilters) {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    }
    setCurrentNav('students');
  };

  const handleConfirmLogout = () => {
    setIsLogoutOpen(false);
    showToast('Signed out successfully. Session restarted for demonstration.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex">
      {/* Left Sidebar */}
      <Sidebar
        currentNav={currentNav}
        onNavigate={(nav) => setCurrentNav(nav)}
        onOpenAddModal={handleOpenAddModal}
        onLogoutClick={() => setIsLogoutOpen(true)}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Main Sticky Header */}
        <Header
          onOpenAddModal={handleOpenAddModal}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onOpenSettings={() => setCurrentNav('settings')}
        />

        {/* Page Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Quick Breadcrumb / Navigation switcher if not on students or dashboard */}
          {currentNav !== 'students' && currentNav !== 'dashboard' && (
            <div className="mb-6 flex items-center justify-between p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setCurrentNav('students')}
                  className="hover:text-indigo-600 cursor-pointer"
                >
                  Students
                </button>
                <span>/</span>
                <span className="text-slate-900 capitalize font-bold">{currentNav}</span>
              </div>
              <button
                onClick={() => setCurrentNav('students')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                ← Back to Students Roster
              </button>
            </div>
          )}

          {/* VIEW: REPORTS */}
          {currentNav === 'reports' && (
            <ReportsView
              students={students}
              onNavigateToStudents={(f) => handleNavigateToStudentsWithFilter(f as Partial<FilterState>)}
              onExportCSV={handleExportCSV}
              onExport={(format) => handleExport(format)}
              onShowToast={showToast}
            />
          )}

          {/* VIEW: COURSES */}
          {currentNav === 'courses' && (
            <CoursesView
              students={students}
              onFilterByCourse={(course) => handleNavigateToStudentsWithFilter({ course })}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {/* VIEW: SECTIONS */}
          {currentNav === 'sections' && (
            <SectionsView
              students={students}
              onSelectSection={(section) => handleNavigateToStudentsWithFilter({ section })}
              onOpenAddModal={handleOpenAddModal}
            />
          )}

          {/* VIEW: SETTINGS */}
          {currentNav === 'settings' && (
            <SettingsView
              students={students}
              onDeleteAllStudents={handleDeleteAllStudents}
              onReloadFromSupabase={handleReloadFromSupabase}
              onShowToast={showToast}
            />
          )}

          {/* VIEW: STUDENTS or DASHBOARD */}
          {(currentNav === 'students' || currentNav === 'dashboard') && (
            <>
              {/* 1. Statistics Cards Feature */}
              <StatsCards
                totalStudents={students.length}
                firstYearCount={firstYearCount}
                secondYearCount={secondYearCount}
                thirdYearCount={thirdYearCount}
                fourthYearCount={fourthYearCount}
                selectedYear={filters.year}
                onSelectYear={(year: YearLevel | 'All') => handleFilterChange({ year })}
              />

              {/* 2. Recent Students Feature */}
              <RecentStudents
                students={students}
                onViewStudent={handleOpenViewDetails}
                onViewAll={handleViewAllStudents}
              />

              {/* 3. Search Students & Filter Panel (Sections 9 & 10) */}
              <SearchFilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                availableSections={AVAILABLE_SECTIONS}
                totalResultsCount={filteredStudents.length}
              />

              {/* 4. Student Records Table (Sections 4, 7, 8, 11, 12, 13, 15) */}
              <div id="student-table-section">
                <StudentTable
                  students={filteredStudents}
                  totalDatabaseCount={students.length}
                  onViewStudent={handleOpenViewDetails}
                  onEditStudent={handleOpenEditModal}
                  onDeleteStudent={handleOpenDeleteConfirm}
                  onClearFilters={handleResetFilters}
                  onAddStudent={handleOpenAddModal}
                  onExport={handleExport}
                  onExportCSV={handleExportCSV}
                  isExporting={exportingFormat}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Right-Side Student Details Drawer / Panel (Section 8) */}
      <StudentDetailsModal
        student={detailsStudent}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setDetailsStudent(null);
        }}
        onEdit={(student) => {
          setIsDetailsOpen(false);
          handleOpenEditModal(student);
        }}
      />

      {/* Add / Edit Student Form Modal (Sections 5 & 6) */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setFormStudent(null);
        }}
        onSave={handleSaveStudent}
        initialData={formStudent}
      />

      {/* Delete Confirmation Modal (Section 7) */}
      <DeleteConfirmModal
        student={studentToDelete}
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setStudentToDelete(null);
        }}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />

      {/* Toast Feedback Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
