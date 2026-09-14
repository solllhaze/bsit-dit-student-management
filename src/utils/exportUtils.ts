import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ShadingType
} from 'docx';
import { Student, FilterState } from '../types';
import { getFullName, formatSectionShort, formatOfficialName } from '../data/mockStudents';

/**
 * Generate standardized institutional email if not provided
 */
export const getStudentEmail = (student: Student): string => {
  if (student.email && student.email.trim()) {
    return student.email.trim();
  }
  const cleanFirst = student.firstName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  const cleanLast = student.lastName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
  return `${cleanFirst}.${cleanLast}@student.college.edu`;
};

/**
 * Generate formatted contact number if not provided
 */
export const getStudentContact = (student: Student): string => {
  if (student.contactNumber && student.contactNumber.trim()) {
    return student.contactNumber.trim();
  }
  const digits = student.studentId.replace(/\D/g, '');
  const suffix = (digits.padEnd(7, '4') + '8901').slice(0, 7);
  return `0917-${suffix.slice(0, 3)}-${suffix.slice(3, 7)}`;
};

/**
 * Generate clean, meaningful filename according to active filters:
 * Examples:
 * - All_Students.csv / SITS_Student_Masterlist_All.docx / SITS_Student_Masterlist_All.pdf
 * - BSIT_3B_Students.csv / SITS_Student_Masterlist_BSIT_3B.docx / SITS_Student_Masterlist_BSIT_3B.pdf
 * - BSIT_Students.csv / SITS_Student_Masterlist_BSIT.docx / SITS_Student_Masterlist_BSIT.pdf
 * - DIT_Students.csv / SITS_Student_Masterlist_DIT.docx / SITS_Student_Masterlist_DIT.pdf
 */
export const generateExportFilename = (
  filters: FilterState,
  extension: 'csv' | 'pdf' | 'docx'
): string => {
  const isCourseFiltered = filters.course && filters.course !== 'All';
  const isYearFiltered = filters.year && filters.year !== 'All';
  const isSectionFiltered =
    filters.section &&
    filters.section !== 'All Sections' &&
    filters.section !== 'All';
  const isSearchActive = filters.search && filters.search.trim().length > 0;

  let identifier = 'All';
  if (isCourseFiltered && isSectionFiltered) {
    identifier = `${filters.course}_${formatSectionShort(filters.section)}`;
  } else if (isCourseFiltered && isYearFiltered) {
    identifier = `${filters.course}_${filters.year.replace(/\s+/g, '-')}`;
  } else if (isCourseFiltered) {
    identifier = filters.course;
  } else if (isSectionFiltered) {
    identifier = formatSectionShort(filters.section);
  } else if (isYearFiltered) {
    identifier = filters.year.replace(/\s+/g, '-');
  }

  if (isSearchActive) {
    const cleanSearch = filters.search.trim().replace(/[^a-zA-Z0-9]/g, '_').slice(0, 15);
    identifier = `${identifier}_Search_${cleanSearch}`;
  }

  if (extension === 'csv') {
    return identifier === 'All' ? 'All_Students.csv' : `${identifier}_Students.csv`;
  } else if (extension === 'pdf') {
    return `SITS_Student_Masterlist_${identifier}.pdf`;
  } else {
    return `SITS_Student_Masterlist_${identifier}.docx`;
  }
};

/**
 * Helper to trigger browser file download from Blob
 */
const triggerBlobDownload = (blob: Blob, filename: string) => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
};

/**
 * Format dynamic Program and Section headers for official masterlists:
 * If user exports:
 * Program: BSIT, Section: 3B -> "Program: BSIT", "Section: 3B"
 * If user exports:
 * Program: All, Section: All -> "Program: All Programs", "Section: All Sections"
 */
export const getMasterlistProgramSection = (
  filters: FilterState
): { program: string; section: string; year?: string; search?: string } => {
  let program = 'All Programs';
  if (filters.course && filters.course !== 'All') {
    program = filters.course;
  }

  let section = 'All Sections';
  if (filters.section && filters.section !== 'All Sections' && filters.section !== 'All') {
    section = formatSectionShort(filters.section);
  }

  let year: string | undefined;
  if (filters.year && filters.year !== 'All') {
    year = filters.year;
  }

  let search: string | undefined;
  if (filters.search && filters.search.trim()) {
    search = filters.search.trim();
  }

  return { program, section, year, search };
};

// ==========================================================
// 1. CSV EXPORT (DATA EXPORT WITH EXCEL COLUMN SEPARATION)
// ==========================================================
export const exportStudentsToCSV = (
  students: Student[],
  filters: FilterState
): { success: boolean; count: number; filename: string; error?: string } => {
  if (!students || students.length === 0) {
    return {
      success: false,
      count: 0,
      filename: '',
      error: 'No students found to export.'
    };
  }

  try {
    const filename = generateExportFilename(filters, 'csv');

    // Exactly the 8 required database fields:
    // Student ID, Full Name, Program, Year Level, Section, Email, Contact Number, Status
    const data = students.map((s) => ({
      'Student ID': s.studentId,
      'Full Name': getFullName(s),
      'Program': s.course,
      'Year Level': s.yearLevel,
      'Section': formatSectionShort(s.section),
      'Email': getStudentEmail(s),
      'Contact Number': getStudentContact(s),
      'Status': s.status
    }));

    // PapaParse handles RFC 4180 escaping and commas inside fields
    const csvBody = Papa.unparse(data, {
      quotes: false, // only quote when necessary (e.g. if field contains comma or quotes)
      quoteChar: '"',
      escapeChar: '"',
      delimiter: ',',
      header: true,
      newline: '\r\n'
    });

    // CRITICAL FOR MICROSOFT EXCEL COMPATIBILITY:
    // 1. \uFEFF (UTF-8 BOM) informs Excel that file is UTF-8 encoded.
    // 2. sep=,\r\n is the official Microsoft Excel delimiter directive.
    //    When Excel opens the file, this tells Excel to separate fields by commas into
    //    Column A (Student ID), Column B (Full Name), Column C (Program), Column D (Year Level),
    //    Column E (Section), Column F (Email), Column G (Contact Number), Column H (Status)
    //    instead of dumping the entire row into Column A.
    const csvContent = '\uFEFFsep=,\r\n' + csvBody;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    triggerBlobDownload(blob, filename);

    return { success: true, count: students.length, filename };
  } catch (err) {
    console.error('CSV Export Error:', err);
    return {
      success: false,
      count: students.length,
      filename: '',
      error: 'Unable to export student records to CSV. Please try again.'
    };
  }
};

// ==========================================================
// 2. PDF EXPORT (OFFICIAL STUDENT MASTERLIST FORMAT)
// ==========================================================
export const exportStudentsToPDF = async (
  students: Student[],
  filters: FilterState
): Promise<{ success: boolean; count: number; filename: string; error?: string }> => {
  if (!students || students.length === 0) {
    return {
      success: false,
      count: 0,
      filename: '',
      error: 'No students found to export.'
    };
  }

  try {
    const filename = generateExportFilename(filters, 'pdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 45;

    // Official Centered Heading
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text('DAVAO DEL SUR STATE COLLEGE', pageWidth / 2, 48, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text('College of Information and Digital Sciences', pageWidth / 2, 64, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Society of Information Technology Students', pageWidth / 2, 80, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('A. Y. 2026-2027', pageWidth / 2, 95, { align: 'center' });

    // Subtle divider line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(1);
    doc.line(margin, 105, pageWidth - margin, 105);

    // Dynamic Program & Section
    const { program, section, year, search } = getMasterlistProgramSection(filters);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`Program: ${program}`, margin, 124);
    doc.text(`Section: ${section}`, margin, 140);

    if (year) {
      doc.text(`Year Level: ${year}`, margin + 200, 124);
    }
    if (search) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Search: "${search}"`, margin + 200, 140);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Students: ${students.length}`, pageWidth - margin, 124, { align: 'right' });

    const formattedDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    doc.text(`Date: ${formattedDate}`, pageWidth - margin, 140, { align: 'right' });

    // Official Masterlist Table:
    // Columns: Student ID | Complete Name (Lastname, Firstname, Initial) | Year Level | Status
    const tableHeaders = [
      'Student ID',
      'Complete Name (Lastname, Firstname, Initial)',
      'Year Level',
      'Status'
    ];

    const tableRows = students.map((s) => [
      s.studentId,
      formatOfficialName(s),
      s.yearLevel,
      s.status
    ]);

    autoTable(doc, {
      startY: 154,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 5,
        textColor: [30, 41, 59],
        lineColor: [203, 213, 225], // slate-300
        lineWidth: 0.5
      },
      headStyles: {
        fillColor: [15, 23, 42], // slate-900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      columnStyles: {
        0: { cellWidth: 95, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 'auto', halign: 'left' },
        2: { cellWidth: 85, halign: 'center' },
        3: { cellWidth: 75, halign: 'center' }
      },
      margin: { left: margin, right: margin, bottom: 40 },
      showHead: 'everyPage', // Repeats table header on every page
      didDrawPage: (data) => {
        const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
        const currentPage = data.pageNumber;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(
          'Davao Del Sur State College · Society of Information Technology Students · Official Masterlist',
          margin,
          pageHeight - 20
        );
        doc.text(
          `Page ${currentPage} of ${pageCount}`,
          pageWidth - margin,
          pageHeight - 20,
          { align: 'right' }
        );
      }
    });

    if (typeof window !== 'undefined') {
      doc.save(filename);
    }
    return { success: true, count: students.length, filename };
  } catch (err) {
    console.error('PDF Export Error:', err);
    return {
      success: false,
      count: students.length,
      filename: '',
      error: 'Unable to export student records to PDF. Please try again.'
    };
  }
};

// ==========================================================
// 3. WORD EXPORT (.DOCX OFFICIAL STUDENT MASTERLIST FORMAT)
// ==========================================================
export const exportStudentsToWord = async (
  students: Student[],
  filters: FilterState
): Promise<{ success: boolean; count: number; filename: string; error?: string }> => {
  if (!students || students.length === 0) {
    return {
      success: false,
      count: 0,
      filename: '',
      error: 'No students found to export.'
    };
  }

  try {
    const filename = generateExportFilename(filters, 'docx');
    const { program, section, year, search } = getMasterlistProgramSection(filters);

    // Official Masterlist Word Table:
    // Real Microsoft Word Table with repeat-header on page continuation
    // Columns:
    // 1. Student ID (20%)
    // 2. Complete Name (Lastname, Firstname, Initial) (46%)
    // 3. Year Level (17%)
    // 4. Status (17%)
    const headerRow = new TableRow({
      tableHeader: true, // Tells MS Word to repeat the header on every subsequent page
      cantSplit: true,
      children: [
        new TableCell({
          width: { size: 20, type: WidthType.PERCENTAGE },
          shading: { fill: '0F172A', type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Student ID',
                  bold: true,
                  color: 'FFFFFF',
                  size: 19,
                  font: 'Calibri'
                })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 46, type: WidthType.PERCENTAGE },
          shading: { fill: '0F172A', type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: 'Complete Name (Lastname, Firstname, Initial)',
                  bold: true,
                  color: 'FFFFFF',
                  size: 19,
                  font: 'Calibri'
                })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 17, type: WidthType.PERCENTAGE },
          shading: { fill: '0F172A', type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Year Level',
                  bold: true,
                  color: 'FFFFFF',
                  size: 19,
                  font: 'Calibri'
                })
              ]
            })
          ]
        }),
        new TableCell({
          width: { size: 17, type: WidthType.PERCENTAGE },
          shading: { fill: '0F172A', type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 100, right: 100 },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Status',
                  bold: true,
                  color: 'FFFFFF',
                  size: 19,
                  font: 'Calibri'
                })
              ]
            })
          ]
        })
      ]
    });

    // Student Data Rows
    const dataRows = students.map((student, idx) => {
      const isEven = idx % 2 === 1;
      const cellBg = isEven ? 'F8FAFC' : 'FFFFFF';
      const officialName = formatOfficialName(student);

      return new TableRow({
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { fill: cellBg, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: student.studentId,
                    bold: true,
                    color: '1E293B',
                    size: 18,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 46, type: WidthType.PERCENTAGE },
            shading: { fill: cellBg, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: officialName,
                    color: '0F172A',
                    size: 18,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 17, type: WidthType.PERCENTAGE },
            shading: { fill: cellBg, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: student.yearLevel,
                    color: '334155',
                    size: 18,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 17, type: WidthType.PERCENTAGE },
            shading: { fill: cellBg, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: student.status,
                    color: '334155',
                    size: 18,
                    font: 'Calibri'
                  })
                ]
              })
            ]
          })
        ]
      });
    });

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1080,
                right: 1080,
                bottom: 1080,
                left: 1080
              }
            }
          },
          children: [
            // Centered Header
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'DAVAO DEL SUR STATE COLLEGE',
                  bold: true,
                  size: 26, // 13pt
                  color: '0F172A',
                  font: 'Calibri'
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'College of Information and Digital Sciences',
                  size: 22, // 11pt
                  color: '334155',
                  font: 'Calibri'
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Society of Information Technology Students',
                  bold: true,
                  size: 22, // 11pt
                  color: '0F172A',
                  font: 'Calibri'
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 240 },
              children: [
                new TextRun({
                  text: 'A. Y. 2026-2027',
                  size: 20, // 10pt
                  color: '64748B',
                  font: 'Calibri'
                })
              ]
            }),

            // Program & Section Metadata
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: 'Program: ',
                  bold: true,
                  size: 21,
                  color: '0F172A',
                  font: 'Calibri'
                }),
                new TextRun({
                  text: program,
                  size: 21,
                  color: '1E293B',
                  font: 'Calibri'
                })
              ]
            }),
            new Paragraph({
              spacing: { after: 80 },
              children: [
                new TextRun({
                  text: 'Section: ',
                  bold: true,
                  size: 21,
                  color: '0F172A',
                  font: 'Calibri'
                }),
                new TextRun({
                  text: section,
                  size: 21,
                  color: '1E293B',
                  font: 'Calibri'
                })
              ]
            }),
            ...(year
              ? [
                  new Paragraph({
                    spacing: { after: 60 },
                    children: [
                      new TextRun({
                        text: 'Year Level: ',
                        bold: true,
                        size: 20,
                        color: '0F172A',
                        font: 'Calibri'
                      }),
                      new TextRun({
                        text: year,
                        size: 20,
                        color: '334155',
                        font: 'Calibri'
                      })
                    ]
                  })
                ]
              : []),
            ...(search
              ? [
                  new Paragraph({
                    spacing: { after: 60 },
                    children: [
                      new TextRun({
                        text: 'Search Query: ',
                        bold: true,
                        size: 20,
                        color: '0F172A',
                        font: 'Calibri'
                      }),
                      new TextRun({
                        text: `"${search}"`,
                        size: 20,
                        color: '334155',
                        font: 'Calibri'
                      })
                    ]
                  })
                ]
              : []),
            new Paragraph({
              spacing: { after: 180 },
              children: [
                new TextRun({
                  text: `Total Students: ${students.length}`,
                  bold: true,
                  size: 20,
                  color: '64748B',
                  font: 'Calibri'
                })
              ]
            }),

            // Real Word Table
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE
              },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                left: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                insideVertical: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' }
              },
              rows: [headerRow, ...dataRows]
            })
          ]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    triggerBlobDownload(blob, filename);

    return { success: true, count: students.length, filename };
  } catch (err) {
    console.error('Word Export Error:', err);
    return {
      success: false,
      count: students.length,
      filename: '',
      error: 'Unable to export student records to Word (.DOCX). Please try again.'
    };
  }
};
