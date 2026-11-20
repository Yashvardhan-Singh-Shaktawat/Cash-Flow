/**
 * CASH-FLOW — Dashboard Module
 * Calculates financial summaries, renders metric cards, and controls balance alerts.
 */

import { formatCurrency, convertFromBase } from './currency.js';

/**
 * Perform exact numeric financial calculations
 * Never calculate financial totals using formatted currency strings!
 * @param {number} salary
 * @param {Array} expenses
 * @returns {{ totalExpenses: number, remainingBalance: number, balancePercentage: number }}
 */
export function calculateFinancials(salary, expenses = []) {
  const numSalary = Number(salary) || 0;
  const totalExpenses = (Array.isArray(expenses) ? expenses : []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0
  );
  const remainingBalance = numSalary - totalExpenses;
  const balancePercentage = numSalary > 0 ? (remainingBalance / numSalary) * 100 : 0;

  return {
    totalSalary: numSalary,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    remainingBalance: Math.round(remainingBalance * 100) / 100,
    balancePercentage: Math.round(balancePercentage * 10) / 10
  };
}

/**
 * Render summary cards and alert banners based on current state
 * @param {Object} state
 */
export function renderDashboard(state) {
  const { salary, expenses, currency, exchangeRates } = state;
  const financials = calculateFinancials(salary, expenses);

  // Convert amounts for display only
  const displaySalary = convertFromBase(financials.totalSalary, currency, exchangeRates);
  const displayExpenses = convertFromBase(financials.totalExpenses, currency, exchangeRates);
  const displayBalance = convertFromBase(financials.remainingBalance, currency, exchangeRates);

  // 1. Update Salary Metric Card
  const salaryEl = document.getElementById('display-salary');
  if (salaryEl) {
    salaryEl.textContent = formatCurrency(displaySalary, currency);
  }

  // 2. Update Expenses Metric Card
  const expensesEl = document.getElementById('display-expenses');
  const countBadgeEl = document.getElementById('expenses-count-badge');
  if (expensesEl) {
    expensesEl.textContent = formatCurrency(displayExpenses, currency);
  }
  if (countBadgeEl) {
    const count = expenses.length;
    countBadgeEl.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
  }

  // 3. Update Remaining Balance Metric Card
  const balanceEl = document.getElementById('display-balance');
  const balanceBadgeEl = document.getElementById('balance-percentage-badge');

  if (balanceEl) {
    balanceEl.textContent = formatCurrency(displayBalance, currency);
    balanceEl.classList.remove('healthy', 'warning', 'danger');

    if (financials.remainingBalance < 0) {
      balanceEl.classList.add('danger');
    } else if (financials.totalSalary > 0 && financials.balancePercentage < 10) {
      balanceEl.classList.add('danger');
    } else if (financials.totalSalary > 0 && financials.balancePercentage < 25) {
      balanceEl.classList.add('warning');
    } else {
      balanceEl.classList.add('healthy');
    }
  }

  if (balanceBadgeEl) {
    balanceBadgeEl.classList.remove('positive', 'negative', 'neutral');
    if (financials.totalSalary === 0) {
      balanceBadgeEl.textContent = '0%';
      balanceBadgeEl.classList.add('neutral');
    } else if (financials.remainingBalance < 0) {
      balanceBadgeEl.textContent = `${financials.balancePercentage}%`;
      balanceBadgeEl.classList.add('negative');
    } else {
      balanceBadgeEl.textContent = `${Math.min(100, Math.max(0, financials.balancePercentage))}%`;
      balanceBadgeEl.classList.add(financials.balancePercentage >= 25 ? 'positive' : 'negative');
    }
  }

  // 4. Update Warning Banner (Section 8.3)
  updateAlertBanner(financials, displayBalance, currency);
}

/**
 * Handle Critical Low Balance and Overspending Warnings
 * @param {Object} financials
 * @param {number} displayBalance
 * @param {string} currency
 */
function updateAlertBanner(financials, displayBalance, currency) {
  const banner = document.getElementById('balance-alert-banner');
  const titleEl = document.getElementById('alert-title');
  const messageEl = document.getElementById('alert-message');

  if (!banner || !titleEl || !messageEl) return;

  const { totalSalary, totalExpenses, remainingBalance, balancePercentage } = financials;

  // Case 1: Overspending — Expenses exceed salary
  if (totalSalary > 0 && totalExpenses > totalSalary) {
    banner.className = 'alert-banner critical visible';
    titleEl.textContent = 'Overspending Alert: Budget Exceeded';
    messageEl.textContent = `Your total expenses exceed your monthly salary by ${formatCurrency(Math.abs(displayBalance), currency)}. You are currently running a deficit.`;
  }
  // Case 2: Critically low balance — Below 10% of salary
  else if (totalSalary > 0 && balancePercentage < 10 && remainingBalance >= 0) {
    banner.className = 'alert-banner warning visible';
    titleEl.textContent = 'Critical Low Balance Warning';
    messageEl.textContent = `Your remaining balance is at ${balancePercentage}% (${formatCurrency(displayBalance, currency)}), which is critically low. Review your spending to avoid deficit.`;
  }
  // Case 3: Balanced / Healthy
  else {
    banner.className = 'alert-banner';
    banner.classList.remove('visible');
  }
}

/**
 * Display a temporary toast notification in the UI
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');

  const textNode = document.createElement('span');
  textNode.textContent = message;
  toast.appendChild(textNode);

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 3500);
}

export default {
  calculateFinancials,
  renderDashboard,
  showToast
};
