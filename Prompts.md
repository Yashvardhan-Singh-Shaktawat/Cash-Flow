# Cash-Flow — Development Prompt Log

This document records the prompt sequence and engineering methodology utilized to design, architect, implement, test, and document the **Cash-Flow** Personal Finance Dashboard for **Sprint 02**.

---

## Prompt 1: Project Planning & System Architecture

**Prompt Objective**: Establish the architectural boundaries, folder hierarchy, and state management pattern for a framework-free vanilla JavaScript application.

```markdown
Role: Senior Frontend Engineer
Task: Plan the architecture for Cash-Flow, a modular Vanilla JavaScript personal finance application.
Constraints:
- Strictly Vanilla JavaScript (ES6+ Modules), HTML5, and CSS3.
- External libraries: Chart.js (CDN) and jsPDF (CDN).
- API: Frankfurter exchange rates API.
- Storage: Browser LocalStorage.
- No frontend frameworks, bundlers, or UI libraries (no React, Bootstrap, or Tailwind).
Deliverable:
- Establish the folder structure (index.html, css/, js/, assets/).
- Formulate the unidirectional data flow pattern (State -> LocalStorage -> DOM / Chart).
- Specify component responsibility boundaries for 8 focused JavaScript modules.
```

---

## Prompt 2: UI/UX Design System & Token Specification

**Prompt Objective**: Define the visual language, typography, color palette, and component design tokens.

```markdown
Role: Design Systems Specialist & CSS Architect
Task: Create a cohesive CSS design system for a personal finance dashboard with a calm, trustworthy aesthetic.
Requirements:
- Color Tokens:
  --color-background: #F6F7F5
  --color-surface: #FFFFFF
  --color-primary: #287A58
  --color-primary-light: #E9F4ED
  --color-primary-dark: #174D38
  --color-text: #172321
  --color-muted: #727B77
  --color-border: #E7EBE7
  --color-warning: #D58B32
  --color-danger: #D64545
  --color-muted-bg: #F0F3F0
- Typography: 'Inter' for UI body copy, 'Manrope' for headings and financial values.
- Shadows, border radii, and transition tokens.
- Separate CSS files: style.css (tokens, resets, layout), components.css (cards, buttons, forms, alerts, empty states), responsive.css (breakpoints).
```

---

## Prompt 3: Semantic HTML5 Structure & SEO Optimization

**Prompt Objective**: Draft accessible, semantic, and standards-compliant HTML5 markup.

```markdown
Role: Accessibility & HTML Specialist
Task: Write the index.html for Cash-Flow adhering to W3C standards and WCAG 2.1 AA accessibility.
Requirements:
- Landmarks: <aside> for sidebar nav, <header> for sticky controls, <main> for dashboard view, <section> for cards and tables.
- Proper input labeling with 'for' attributes, aria-describedby for dynamic validation messages, and aria-live regions for toasts and rate updates.
- Technical SEO: Title, meta description, viewport, theme-color, SVG favicon, Open Graph tags, and noindex/nofollow privacy directive.
- Preconnect tags for Google Fonts and deferred CDN scripts for Chart.js and jsPDF.
```

---

## Prompt 4: Centralized State Management (state.js)

**Prompt Objective**: Construct an isolated, predictable reactive store using the Publish/Subscribe pattern.

```markdown
Role: JavaScript Engineer
Task: Implement state.js as an ES6 class Store managing the single source of truth.
Requirements:
- State shape: { salary, expenses, currency, baseCurrency, exchangeRates, exchangeRateDate, rateStatus, rateErrorMessage }.
- Immutable getters via getState() cloning arrays and objects.
- Mutation methods: setSalary(amount), addExpense(expense), removeExpense(id), setCurrency(code), setExchangeRates(rates, date), restoreState(data).
- Subscription mechanism via subscribe(listener) returning an unsubscribe function.
- Prevent duplicate logic or competing stores.
```

---

## Prompt 5: LocalStorage Persistence & Schema Validation (storage.js)

**Prompt Objective**: Create a safe storage persistence layer with corruption safeguards.

```markdown
Role: Core Systems Engineer
Task: Implement storage.js to persist and restore application state under key 'cashFlowData'.
Requirements:
- loadState(): Safely load and validate data; reject corrupt JSON without breaking the runtime.
- sanitizePersistedData(): Enforce schema validation (non-negative numeric salary, array of valid expense objects with string IDs, numbers, and ISO dates).
- saveState(state): Write clean JSON snapshot (never persist DOM nodes or Chart instances).
- clearState(): Storage reset fallback.
```

---

## Prompt 6: Input Validation & Sanitization (validation.js)

**Prompt Objective**: Formulate comprehensive input validation rules and error feedback.

```markdown
Role: Security & UX Developer
Task: Implement validation.js for salary and expense forms.
Requirements:
- validateSalary(rawValue): Reject empty strings, NaN, negative numbers, and non-finite values. Return 2-decimal rounded numeric value.
- validateExpense(rawName, rawAmount): Name must be non-empty, 2-60 characters trimmed. Amount must be a positive finite number (> 0).
- Return structured status { isValid, errors: {}, data: {} }.
```

---

## Prompt 7: Financial Summary & Alert Logic (dashboard.js)

**Prompt Objective**: Calculate financial metrics and control low-balance threshold banners.

```markdown
Role: Financial App Developer
Task: Implement dashboard.js to calculate exact numeric figures and render metric cards.
Requirements:
- calculateFinancials(salary, expenses): Total Expenses = sum(amounts), Remaining Balance = salary - totalExpenses, Balance Percentage = (balance / salary) * 100.
- Currency display conversion using convertFromBase() and formatCurrency() with Intl.NumberFormat.
- Low Balance Warnings:
  - If expenses > salary: Show critical Overspending Alert ("Budget Exceeded").
  - If balance < 10% of salary: Show warning banner ("Critically Low Balance").
  - Balance text turns red / danger when negative or < 10%.
- Non-blocking toast notification helper.
```

---

## Prompt 8: Expense DOM Operations & Sanitization (expenses.js)

**Prompt Objective**: Render expense history using native DOM manipulation without unsafe innerHTML.

```markdown
Role: DOM Specialist
Task: Implement expenses.js to render the list of recorded transactions.
Requirements:
- Use document.createElement() and textContent for user inputs (preventing XSS).
- Render category icon, expense name, formatted localized date, converted amount, and delete button with trash SVG.
- Provide accessible aria-label attributes on delete controls.
- Handle empty state: toggle #empty-state versus #expense-list cleanly.
```

---

## Prompt 9: Spending Visualization (charts.js)

**Prompt Objective**: Integrate Chart.js doughnut chart with edge-case handling.

```markdown
Role: Data Visualization Engineer
Task: Implement charts.js to render an Income Distribution chart.
Requirements:
- Doughnut chart with slices for 'Remaining Balance' (#287A58) and 'Total Expenses' (#D64545).
- Safe non-negative handling: If expenses exceed salary, Remaining = Math.max(0, salary - expenses).
- Empty state: When both salary and expenses are 0, hide chart and display an informational guide.
- Lifecycle management: Update existing chart instance in place or cleanly destroy before recreating.
```

---

## Prompt 10: Multi-Currency Conversion (currency.js)

**Prompt Objective**: Integrate Frankfurter Exchange API with session caching and offline fallback.

```markdown
Role: API Integration Engineer
Task: Implement currency.js for multi-currency display.
Requirements:
- Endpoint: https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP.
- Support INR, USD, EUR, GBP.
- Session-level cache (ratesCache) to avoid redundant requests.
- Async/await with AbortController timeout handling.
- Graceful offline fallback reference rates if network is unavailable.
- Non-destructive display conversion (base currency INR is preserved in memory and storage).
```

---

## Prompt 11: PDF Report Export (reports.js)

**Prompt Objective**: Build client-side itemized PDF generation via jsPDF CDN.

```markdown
Role: Reporting Specialist
Task: Implement reports.js to export an itemized financial report.
Requirements:
- Use jsPDF portrait A4 layout.
- Styled header with Cash-Flow branding, generation timestamp, and reporting currency.
- Summary grid with Total Salary, Total Expenses, and Remaining Balance.
- Itemized table with #, Description, Date Recorded, and Converted Amount.
- Pagination: Detect page boundary overflow and call doc.addPage() with repeated table headers.
- Filename format: Cash-Flow_Report_YYYY-MM-DD.pdf.
```

---

## Prompt 12: Testing, Quality Assurance & Verification

**Prompt Objective**: Verify all acceptance criteria through automated and manual test scenarios.

```markdown
Role: QA Automation Engineer
Task: Execute verification tests across the complete application.
Test Checklist:
1. Salary update & persistence.
2. Adding single & multiple expenses.
3. Deleting expenses with immediate calculation updates.
4. Chart updates and negative balance protection.
5. Currency conversion across INR, USD, EUR, GBP.
6. Low balance warning trigger (<10%).
7. Overspending warning trigger (expenses > salary).
8. PDF report generation and download.
9. LocalStorage persistence across page reloads.
10. Responsive layout at 360px, 768px, and 1200px.
```
