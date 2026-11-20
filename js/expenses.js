/**
 * CASH-FLOW — Expenses Module
 * Handles expense list rendering using safe DOM APIs, deletion actions, and empty states.
 */

import { formatCurrency, convertFromBase } from './currency.js';

/**
 * Format ISO date string into readable human format
 * @param {string} isoString
 * @returns {string}
 */
function formatExpenseDate(isoString) {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Recently';

    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  } catch (e) {
    return 'Recently';
  }
}

/**
 * Render expense items list into DOM
 * Uses native document.createElement to ensure safe rendering (no unsafe innerHTML)
 * @param {Array} expenses
 * @param {string} currency
 * @param {Object} exchangeRates
 * @param {Function} onDelete Callback receiving expense ID
 */
export function renderExpenseList(expenses = [], currency = 'INR', exchangeRates = {}, onDelete) {
  const container = document.getElementById('expense-list');
  const emptyState = document.getElementById('empty-state');

  if (!container || !emptyState) return;

  // Toggle empty state vs list
  if (!expenses || expenses.length === 0) {
    emptyState.style.display = 'flex';
    container.innerHTML = '';
    return;
  }

  emptyState.style.display = 'none';
  container.innerHTML = '';

  expenses.forEach(item => {
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.setAttribute('data-id', item.id);

    // Left block: Icon & details
    const mainWrap = document.createElement('div');
    mainWrap.className = 'expense-item-main';

    const iconDiv = document.createElement('div');
    iconDiv.className = 'expense-item-icon';
    iconDiv.setAttribute('aria-hidden', 'true');
    // SVG Receipt Icon
    iconDiv.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
        <line x1="8" y1="9" x2="16" y2="9"/>
        <line x1="8" y1="13" x2="14" y2="13"/>
      </svg>
    `;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'expense-item-details';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'expense-name';
    nameSpan.textContent = item.name; // Safe native text assignment

    const dateSpan = document.createElement('span');
    dateSpan.className = 'expense-date';
    dateSpan.textContent = formatExpenseDate(item.createdAt);

    detailsDiv.appendChild(nameSpan);
    detailsDiv.appendChild(dateSpan);

    mainWrap.appendChild(iconDiv);
    mainWrap.appendChild(detailsDiv);

    // Right block: Converted amount & delete button
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'expense-item-actions';

    const convertedAmount = convertFromBase(item.amount, currency, exchangeRates);
    const amountSpan = document.createElement('span');
    amountSpan.className = 'expense-amount';
    amountSpan.textContent = `- ${formatCurrency(convertedAmount, currency)}`;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-danger-ghost';
    deleteBtn.setAttribute('title', `Delete ${item.name}`);
    deleteBtn.setAttribute('aria-label', `Delete ${item.name} expense`);

    // SVG Trash icon
    deleteBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        <line x1="10" y1="11" x2="10" y2="17"/>
        <line x1="14" y1="11" x2="14" y2="17"/>
      </svg>
    `;

    deleteBtn.addEventListener('click', () => {
      if (typeof onDelete === 'function') {
        onDelete(item.id, item.name);
      }
    });

    actionsDiv.appendChild(amountSpan);
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(mainWrap);
    li.appendChild(actionsDiv);

    container.appendChild(li);
  });
}

export default {
  renderExpenseList
};
