/**
 * CASH-FLOW — Main Application Orchestrator
 * Bootstraps the application, connects modules, registers event listeners,
 * and maintains reactive UI synchronization.
 */

import { store } from './state.js';
import { loadState, saveState } from './storage.js';
import { validateSalary, validateExpense } from './validation.js';
import { renderDashboard, showToast } from './dashboard.js';
import { renderExpenseList } from './expenses.js';
import { updateChart } from './charts.js';
import { fetchExchangeRates, getCurrencySymbol } from './currency.js';
import { generatePdfReport } from './reports.js';

// DOM Element References
const elements = {
  // Navigation & Drawer
  sidebar: document.getElementById('app-sidebar'),
  sidebarBackdrop: document.getElementById('sidebar-backdrop'),
  mobileNavToggle: document.getElementById('mobile-nav-toggle'),

  // Forms
  salaryForm: document.getElementById('salary-form'),
  salaryInput: document.getElementById('salary-input'),
  salaryFeedback: document.getElementById('salary-feedback'),
  salarySubmitBtn: document.getElementById('salary-submit-btn'),
  salaryPrefix: document.getElementById('salary-input-prefix'),

  expenseForm: document.getElementById('expense-form'),
  expenseNameInput: document.getElementById('expense-name'),
  expenseNameFeedback: document.getElementById('expense-name-feedback'),
  expenseAmountInput: document.getElementById('expense-amount'),
  expenseAmountFeedback: document.getElementById('expense-amount-feedback'),
  expensePrefix: document.getElementById('expense-input-prefix'),
  addExpenseBtn: document.getElementById('add-expense-btn'),

  // Header controls
  currencySelect: document.getElementById('currency-select'),
  rateStatus: document.getElementById('rate-status'),
  downloadReportBtn: document.getElementById('download-report-btn'),

  // Base currency indicator labels
  baseCurrencyLabels: document.querySelectorAll('.base-currency-label')
};

/**
 * Update form input currency symbols
 * Note: Base input values are always kept in base currency (INR),
 * but helper labels show base currency clearly.
 */
function updateInputPrefixes() {
  const baseSymbol = getCurrencySymbol('INR');
  if (elements.salaryPrefix) elements.salaryPrefix.textContent = baseSymbol;
  if (elements.expensePrefix) elements.expensePrefix.textContent = baseSymbol;
}

/**
 * Handle Salary Form Submission
 */
function handleSalarySubmit(e) {
  e.preventDefault();

  const rawValue = elements.salaryInput.value;
  const validation = validateSalary(rawValue);

  if (!validation.isValid) {
    elements.salaryInput.classList.add('is-invalid');
    elements.salaryFeedback.textContent = validation.error;
    elements.salaryFeedback.className = 'form-feedback error';
    elements.salaryInput.focus();
    return;
  }

  // Clear validation errors
  elements.salaryInput.classList.remove('is-invalid');
  elements.salaryFeedback.textContent = 'Salary updated successfully!';
  elements.salaryFeedback.className = 'form-feedback success';

  // Update state
  store.setSalary(validation.value);

  showToast(`Monthly salary updated to ${getCurrencySymbol('INR')}${validation.value.toLocaleString()}`, 'success');

  // Fade out success message after 3 seconds
  setTimeout(() => {
    if (elements.salaryFeedback) {
      elements.salaryFeedback.className = 'form-feedback';
      elements.salaryFeedback.textContent = '';
    }
  }, 3000);
}

/**
 * Handle Expense Form Submission
 */
function handleExpenseSubmit(e) {
  e.preventDefault();

  const nameVal = elements.expenseNameInput.value;
  const amountVal = elements.expenseAmountInput.value;

  const validation = validateExpense(nameVal, amountVal);

  // Reset validation feedback
  elements.expenseNameInput.classList.remove('is-invalid');
  elements.expenseNameFeedback.textContent = '';
  elements.expenseNameFeedback.className = 'form-feedback';

  elements.expenseAmountInput.classList.remove('is-invalid');
  elements.expenseAmountFeedback.textContent = '';
  elements.expenseAmountFeedback.className = 'form-feedback';

  if (!validation.isValid) {
    if (validation.errors.name) {
      elements.expenseNameInput.classList.add('is-invalid');
      elements.expenseNameFeedback.textContent = validation.errors.name;
      elements.expenseNameFeedback.className = 'form-feedback error';
    }
    if (validation.errors.amount) {
      elements.expenseAmountInput.classList.add('is-invalid');
      elements.expenseAmountFeedback.textContent = validation.errors.amount;
      elements.expenseAmountFeedback.className = 'form-feedback error';
    }
    return;
  }

  // Add to state
  store.addExpense({
    name: validation.data.name,
    amount: validation.data.amount
  });

  showToast(`Added "${validation.data.name}" (${getCurrencySymbol('INR')}${validation.data.amount.toLocaleString()})`, 'success');

  // Reset form fields
  elements.expenseForm.reset();
  elements.expenseNameInput.focus();
}

/**
 * Handle Expense Deletion
 */
function handleDeleteExpense(id, name) {
  store.removeExpense(id);
  showToast(`Deleted expense "${name}"`, 'info');
}

/**
 * Handle Currency Change
 */
async function handleCurrencyChange(e) {
  const newCurrency = e.target.value;
  store.setCurrency(newCurrency);
}

/**
 * Handle PDF Report Generation
 */
function handleDownloadReport() {
  try {
    const currentState = store.getState();
    generatePdfReport(currentState);
    showToast('Expense report generated and downloaded.', 'success');
  } catch (error) {
    console.error('[Reports] Error generating report:', error);
    showToast(error.message || 'Failed to generate PDF report.', 'error');
  }
}

/**
 * Mobile Navigation Drawer Handlers
 */
function toggleMobileMenu() {
  const isOpen = elements.sidebar.classList.toggle('open');
  elements.sidebarBackdrop.classList.toggle('active', isOpen);
  elements.mobileNavToggle.setAttribute('aria-expanded', String(isOpen));
}

function closeMobileMenu() {
  elements.sidebar.classList.remove('open');
  elements.sidebarBackdrop.classList.remove('active');
  elements.mobileNavToggle.setAttribute('aria-expanded', 'false');
}

/**
 * Synchronize UI and persistent storage whenever state changes
 */
function handleStateChange(state, actionType) {
  // 1. Render Dashboard cards and alerts
  renderDashboard(state);

  // 2. Render Expense History list
  renderExpenseList(state.expenses, state.currency, state.exchangeRates, handleDeleteExpense);

  // 3. Update Chart.js visualization
  updateChart(state.salary, state.expenses, state.currency);

  // 4. Update rate status indicator
  if (elements.rateStatus) {
    if (state.currency === 'INR') {
      elements.rateStatus.textContent = '';
      elements.rateStatus.className = 'currency-rate-status';
    } else if (state.rateStatus === 'loading') {
      elements.rateStatus.textContent = 'Updating rates...';
      elements.rateStatus.className = 'currency-rate-status loading';
    } else if (state.rateStatus === 'fallback') {
      elements.rateStatus.textContent = 'Ref. rate';
      elements.rateStatus.className = 'currency-rate-status';
      elements.rateStatus.title = 'Offline reference rate active';
    } else if (state.exchangeRateDate) {
      elements.rateStatus.textContent = `Ref: ${state.exchangeRateDate}`;
      elements.rateStatus.className = 'currency-rate-status';
    }
  }

  // 5. Persist relevant data to LocalStorage (avoiding circular or DOM references)
  if (['SET_SALARY', 'ADD_EXPENSE', 'REMOVE_EXPENSE', 'SET_CURRENCY'].includes(actionType)) {
    saveState({
      salary: state.salary,
      expenses: state.expenses,
      currency: state.currency
    });
  }
}

/**
 * Bootstrap Application
 */
async function initApp() {
  // Update currency labels
  updateInputPrefixes();

  // 1. Load persisted state from LocalStorage
  const savedData = loadState();
  if (savedData) {
    store.restoreState(savedData);

    // Pre-populate salary input if present
    if (savedData.salary > 0 && elements.salaryInput) {
      elements.salaryInput.value = savedData.salary;
    }

    // Set currency dropdown if saved
    if (savedData.currency && elements.currencySelect) {
      elements.currencySelect.value = savedData.currency;
    }
  }

  // 2. Subscribe renderers to store
  store.subscribe(handleStateChange);

  // 3. Register DOM Event Listeners
  if (elements.salaryForm) {
    elements.salaryForm.addEventListener('submit', handleSalarySubmit);
  }

  if (elements.expenseForm) {
    elements.expenseForm.addEventListener('submit', handleExpenseSubmit);
  }

  if (elements.currencySelect) {
    elements.currencySelect.addEventListener('change', handleCurrencyChange);
  }

  if (elements.downloadReportBtn) {
    elements.downloadReportBtn.addEventListener('click', handleDownloadReport);
  }

  if (elements.mobileNavToggle) {
    elements.mobileNavToggle.addEventListener('click', toggleMobileMenu);
  }

  if (elements.sidebarBackdrop) {
    elements.sidebarBackdrop.addEventListener('click', closeMobileMenu);
  }

  // Close mobile drawer when clicking nav links
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    });
  });

  // 4. Initial render with loaded or default state
  handleStateChange(store.getState(), 'INITIAL_RENDER');

  // 5. Asynchronously fetch exchange rates
  store.setRateLoading(true);
  try {
    const rateData = await fetchExchangeRates();
    store.setExchangeRates(
      rateData.rates,
      rateData.date,
      rateData.isFallback ? 'fallback' : 'success',
      rateData.error
    );
  } catch (err) {
    console.warn('[App] Failed to load exchange rates:', err);
    store.setExchangeRates({}, null, 'fallback', err.message);
  }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

