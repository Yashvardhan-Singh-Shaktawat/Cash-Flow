/**
 * CASH-FLOW — PDF Report Generation Module
 * Generates formatted financial reports using jsPDF CDN.
 */

import { formatCurrency, convertFromBase } from './currency.js';
import { calculateFinancials } from './dashboard.js';

/**
 * Generate and trigger download of an itemized PDF expense report
 * @param {Object} state Application state snapshot
 * @returns {boolean} Success status
 */
export function generatePdfReport(state) {
  if (!state || typeof state !== 'object') {
    throw new Error('Invalid state provided for report generation');
  }

  // Ensure jsPDF is loaded
  const { jsPDF } = window.jspdf || {};
  if (!jsPDF) {
    throw new Error('PDF generation library is still loading. Please try again in a moment.');
  }

  const { salary, expenses, currency, exchangeRates } = state;
  const financials = calculateFinancials(salary, expenses);

  const displaySalary = convertFromBase(financials.totalSalary, currency, exchangeRates);
  const displayExpenses = convertFromBase(financials.totalExpenses, currency, exchangeRates);
  const displayBalance = convertFromBase(financials.remainingBalance, currency, exchangeRates);

  // Initialize jsPDF document (Portrait, A4)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let currentY = margin;

  // Header Banner
  doc.setFillColor(40, 122, 88); // #287A58
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('CASH-FLOW', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Monthly Salary & Expense Report', margin + 46, 18);

  currentY = 40;

  // Metadata Section
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(114, 123, 119); // Muted
  doc.setFontSize(9);
  const generatedDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  doc.text(`Generated: ${generatedDate}`, margin, currentY);
  doc.text(`Reporting Currency: ${currency}`, pageWidth - margin - 45, currentY);

  currentY += 12;

  // Financial Summary Cards Box
  doc.setFillColor(246, 247, 245);
  doc.setDrawColor(231, 235, 231);
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, 'FD');

  const colWidth = contentWidth / 3;

  // Summary Col 1: Salary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(114, 123, 119);
  doc.text('TOTAL SALARY', margin + 8, currentY + 12);
  doc.setFontSize(13);
  doc.setTextColor(23, 35, 33);
  doc.text(formatCurrency(displaySalary, currency), margin + 8, currentY + 24);

  // Summary Col 2: Expenses
  doc.setFontSize(9);
  doc.setTextColor(114, 123, 119);
  doc.text('TOTAL EXPENSES', margin + colWidth + 8, currentY + 12);
  doc.setFontSize(13);
  doc.setTextColor(214, 69, 69);
  doc.text(formatCurrency(displayExpenses, currency), margin + colWidth + 8, currentY + 24);

  // Summary Col 3: Balance
  doc.setFontSize(9);
  doc.setTextColor(114, 123, 119);
  doc.text('REMAINING BALANCE', margin + colWidth * 2 + 8, currentY + 12);
  doc.setFontSize(13);
  if (financials.remainingBalance < 0) {
    doc.setTextColor(214, 69, 69);
  } else {
    doc.setTextColor(40, 122, 88);
  }
  doc.text(formatCurrency(displayBalance, currency), margin + colWidth * 2 + 8, currentY + 24);

  currentY += 46;

  // Table Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(23, 35, 33);
  doc.text('Itemized Expense Log', margin, currentY);
  currentY += 8;

  // Table Header Row
  doc.setFillColor(233, 244, 237);
  doc.rect(margin, currentY, contentWidth, 9, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(23, 77, 56);
  doc.text('#', margin + 4, currentY + 6);
  doc.text('Expense Description', margin + 16, currentY + 6);
  doc.text('Date Recorded', margin + 95, currentY + 6);
  doc.text('Amount', pageWidth - margin - 28, currentY + 6);

  currentY += 10;

  // Expense Rows
  if (!expenses || expenses.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(10);
    doc.setTextColor(114, 123, 119);
    doc.text('No expenses recorded for this billing cycle.', margin + 4, currentY + 8);
    currentY += 18;
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    expenses.forEach((item, index) => {
      // Check if page overflow requires new page
      if (currentY > pageHeight - 25) {
        doc.addPage();
        currentY = margin;

        // Repeat Header on new page
        doc.setFillColor(233, 244, 237);
        doc.rect(margin, currentY, contentWidth, 9, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(23, 77, 56);
        doc.text('#', margin + 4, currentY + 6);
        doc.text('Expense Description', margin + 16, currentY + 6);
        doc.text('Date Recorded', margin + 95, currentY + 6);
        doc.text('Amount', pageWidth - margin - 28, currentY + 6);
        currentY += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
      }

      // Alternate row backgrounds
      if (index % 2 === 0) {
        doc.setFillColor(250, 252, 250);
        doc.rect(margin, currentY - 2, contentWidth, 8, 'F');
      }

      const itemDate = new Date(item.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const itemConverted = convertFromBase(item.amount, currency, exchangeRates);

      doc.setTextColor(114, 123, 119);
      doc.text(String(index + 1), margin + 4, currentY + 4);

      doc.setTextColor(23, 35, 33);
      // Truncate long descriptions
      const nameText = item.name.length > 38 ? item.name.substring(0, 35) + '...' : item.name;
      doc.text(nameText, margin + 16, currentY + 4);

      doc.setTextColor(114, 123, 119);
      doc.text(itemDate, margin + 95, currentY + 4);

      doc.setTextColor(214, 69, 69);
      doc.text(formatCurrency(itemConverted, currency), pageWidth - margin - 28, currentY + 4);

      currentY += 8;
    });
  }

  // Footer on bottom of current page
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(140, 150, 145);
  doc.text(
    'Cash-Flow Personal Finance Tracker — Sprint 02 Deliverable — All data saved locally on your device.',
    margin,
    pageHeight - 10
  );

  // Trigger Save
  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`Cash-Flow_Report_${dateStr}.pdf`);
  return true;
}

export default {
  generatePdfReport
};

