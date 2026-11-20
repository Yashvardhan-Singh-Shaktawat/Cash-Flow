/**
 * CASH-FLOW — Input Validation Module
 * Validates salary and expense inputs with descriptive user feedback.
 */

/**
 * Validate salary input value
 * @param {string|number} rawValue
 * @returns {{ isValid: boolean, error?: string, value?: number }}
 */
export function validateSalary(rawValue) {
  if (rawValue === undefined || rawValue === null || String(rawValue).trim() === '') {
    return {
      isValid: false,
      error: 'Please enter your monthly salary amount.'
    };
  }

  const numeric = Number(rawValue);

  if (isNaN(numeric)) {
    return {
      isValid: false,
      error: 'Salary must be a valid numeric value.'
    };
  }

  if (numeric < 0) {
    return {
      isValid: false,
      error: 'Salary cannot be a negative amount.'
    };
  }

  if (!isFinite(numeric)) {
    return {
      isValid: false,
      error: 'Salary amount exceeds allowable limits.'
    };
  }

  return {
    isValid: true,
    value: Math.round(numeric * 100) / 100 // standard 2-decimal financial rounding
  };
}

/**
 * Validate expense form inputs (name and amount)
 * @param {string} rawName
 * @param {string|number} rawAmount
 * @returns {{ isValid: boolean, errors: { name?: string, amount?: string }, data?: { name: string, amount: number } }}
 */
export function validateExpense(rawName, rawAmount) {
  const errors = {};
  const trimmedName = typeof rawName === 'string' ? rawName.trim() : '';

  // Validate expense name
  if (!trimmedName) {
    errors.name = 'Expense name is required.';
  } else if (trimmedName.length < 2) {
    errors.name = 'Expense name must be at least 2 characters.';
  } else if (trimmedName.length > 60) {
    errors.name = 'Expense name cannot exceed 60 characters.';
  }

  // Validate expense amount
  if (rawAmount === undefined || rawAmount === null || String(rawAmount).trim() === '') {
    errors.amount = 'Please enter an expense amount.';
  } else {
    const numericAmount = Number(rawAmount);

    if (isNaN(numericAmount)) {
      errors.amount = 'Amount must be a valid number.';
    } else if (numericAmount <= 0) {
      errors.amount = 'Expense amount must be greater than zero.';
    } else if (!isFinite(numericAmount)) {
      errors.amount = 'Expense amount is too large.';
    }
  }

  const isValid = Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          name: trimmedName,
          amount: Math.round(Number(rawAmount) * 100) / 100
        }
      : undefined
  };
}

export default {
  validateSalary,
  validateExpense
};

