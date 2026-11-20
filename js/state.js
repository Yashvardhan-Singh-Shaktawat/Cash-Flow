/**
 * CASH-FLOW — State Management
 * Single source of truth for application state with a publish-subscribe pattern.
 */

const BASE_CURRENCY = 'INR';

const initialState = {
  salary: 0,
  expenses: [],
  currency: BASE_CURRENCY,
  baseCurrency: BASE_CURRENCY,
  exchangeRates: { [BASE_CURRENCY]: 1 },
  exchangeRateDate: null,
  rateStatus: 'idle', // 'idle' | 'loading' | 'success' | 'error' | 'fallback'
  rateErrorMessage: null
};

class Store {
  constructor(initialData = {}) {
    this._state = {
      ...initialState,
      ...initialData,
      baseCurrency: BASE_CURRENCY,
      exchangeRates: { [BASE_CURRENCY]: 1, ...(initialData.exchangeRates || {}) }
    };
    this._listeners = new Set();
  }

  /**
   * Get an immutable snapshot of current state
   */
  getState() {
    return {
      ...this._state,
      expenses: [...this._state.expenses],
      exchangeRates: { ...this._state.exchangeRates }
    };
  }

  /**
   * Subscribe to state change notifications
   * @param {Function} listener Function receiving (state, actionType)
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * Internal notify helper
   */
  _notify(actionType) {
    const snapshot = this.getState();
    this._listeners.forEach(listener => {
      try {
        listener(snapshot, actionType);
      } catch (err) {
        console.error(`Error in state listener for ${actionType}:`, err);
      }
    });
  }

  /**
   * Update monthly salary
   * @param {number} amount Positive number
   */
  setSalary(amount) {
    const numeric = Number(amount);
    if (isNaN(numeric) || numeric < 0) {
      throw new Error('Salary must be a non-negative number');
    }
    this._state.salary = numeric;
    this._notify('SET_SALARY');
  }

  /**
   * Add a new expense item
   * @param {Object} expense { id, name, amount, createdAt }
   */
  addExpense(expense) {
    if (!expense || typeof expense !== 'object') {
      throw new Error('Invalid expense object');
    }
    const item = {
      id: expense.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'exp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6)),
      name: String(expense.name).trim(),
      amount: Number(expense.amount),
      createdAt: expense.createdAt || new Date().toISOString()
    };
    this._state.expenses = [item, ...this._state.expenses];
    this._notify('ADD_EXPENSE');
  }

  /**
   * Remove an expense by its unique identifier
   * @param {string} id
   */
  removeExpense(id) {
    const initialCount = this._state.expenses.length;
    this._state.expenses = this._state.expenses.filter(item => item.id !== id);
    if (this._state.expenses.length !== initialCount) {
      this._notify('REMOVE_EXPENSE');
    }
  }

  /**
   * Set display currency
   * @param {string} currencyCode (e.g. 'INR', 'USD', 'EUR', 'GBP')
   */
  setCurrency(currencyCode) {
    if (!currencyCode || typeof currencyCode !== 'string') return;
    const upper = currencyCode.toUpperCase();
    if (this._state.currency !== upper) {
      this._state.currency = upper;
      this._notify('SET_CURRENCY');
    }
  }

  /**
   * Update exchange rates and reference date
   * @param {Object} rates Dictionary of rates relative to base INR
   * @param {string|null} date Reference date string
   * @param {string} status 'success' | 'fallback' | 'error'
   * @param {string|null} errorMessage
   */
  setExchangeRates(rates, date, status = 'success', errorMessage = null) {
    this._state.exchangeRates = {
      [BASE_CURRENCY]: 1,
      ...this._state.exchangeRates,
      ...rates
    };
    this._state.exchangeRateDate = date;
    this._state.rateStatus = status;
    this._state.rateErrorMessage = errorMessage;
    this._notify('UPDATE_RATES');
  }

  /**
   * Set loading status for currency fetching
   * @param {boolean} isLoading
   */
  setRateLoading(isLoading) {
    this._state.rateStatus = isLoading ? 'loading' : this._state.rateStatus;
    this._notify('RATE_LOADING');
  }

  /**
   * Bulk reset or restore state from storage
   * @param {Object} data Persisted state slice
   */
  restoreState(data) {
    if (!data || typeof data !== 'object') return;
    if (typeof data.salary === 'number' && data.salary >= 0) {
      this._state.salary = data.salary;
    }
    if (Array.isArray(data.expenses)) {
      this._state.expenses = data.expenses.filter(
        item => item && item.id && item.name && typeof item.amount === 'number'
      );
    }
    if (typeof data.currency === 'string') {
      this._state.currency = data.currency;
    }
    this._notify('RESTORE_STATE');
  }
}

// Single singleton instance for the application
export const store = new Store();
export default store;

