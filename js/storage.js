/**
 * CASH-FLOW — LocalStorage Persistence Layer
 * Safely persists and restores user financial state under the key 'cashFlowData'.
 */

const STORAGE_KEY = 'cashFlowData';

/**
 * Validate raw data loaded from storage to ensure schema consistency
 * @param {any} data
 * @returns {Object|null} Validated state or null
 */
function sanitizePersistedData(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const sanitized = {
    salary: 0,
    expenses: [],
    currency: 'INR'
  };

  // Validate salary
  if (typeof data.salary === 'number' && !isNaN(data.salary) && data.salary >= 0) {
    sanitized.salary = data.salary;
  }

  // Validate expenses array
  if (Array.isArray(data.expenses)) {
    sanitized.expenses = data.expenses
      .filter(item => {
        return (
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.name === 'string' &&
          typeof item.amount === 'number' &&
          !isNaN(item.amount) &&
          item.amount > 0
        );
      })
      .map(item => ({
        id: String(item.id),
        name: String(item.name).trim(),
        amount: Number(item.amount),
        createdAt: typeof item.createdAt === 'string' ? item.createdAt : new Date().toISOString()
      }));
  }

  // Validate currency code
  const supportedCurrencies = ['INR', 'USD', 'EUR', 'GBP'];
  if (typeof data.currency === 'string' && supportedCurrencies.includes(data.currency.toUpperCase())) {
    sanitized.currency = data.currency.toUpperCase();
  }

  return sanitized;
}

/**
 * Load persisted state from browser LocalStorage
 * @returns {Object|null} Parsed state or null if empty/corrupt
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return sanitizePersistedData(parsed);
  } catch (error) {
    console.warn('[Storage] Corrupted or unreadable LocalStorage data:', error);
    return null;
  }
}

/**
 * Save current financial state to LocalStorage
 * Note: Never save DOM elements or chart instances.
 * @param {Object} state
 * @returns {boolean} Success status
 */
export function saveState(state) {
  if (!state || typeof state !== 'object') {
    return false;
  }

  try {
    const payload = {
      salary: Number(state.salary) || 0,
      expenses: Array.isArray(state.expenses) ? state.expenses : [],
      currency: state.currency || 'INR',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('[Storage] Failed to save state to LocalStorage:', error);
    return false;
  }
}

/**
 * Clear stored application state
 */
export function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('[Storage] Error clearing storage:', error);
  }
}

export default {
  loadState,
  saveState,
  clearState
};

