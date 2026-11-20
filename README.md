# Cash-Flow — Personal Salary & Expense Tracker

Cash-Flow is a clean, responsive, and professional personal finance web application built as part of **Sprint 02**. It enables users to set their monthly salary, record daily expenses, track their remaining balance automatically, visualize spending habits via an interactive chart, convert currencies using live reference exchange rates, and export itemized financial reports in PDF format.

Built strictly with **Vanilla JavaScript (ES6+ Modules)**, **Semantic HTML5**, and **Modern CSS3**, Cash-Flow demonstrates strong engineering fundamentals: state-driven rendering, predictable unidirectional data flow, robust input validation, resilient offline fallbacks, and zero reliance on heavy frontend frameworks.

---

## Key Features

- **Monthly Salary Management**: Set, update, and persist your base income with strict numeric validation (rejecting negative, empty, or invalid values).
- **Expense Tracking & Deletion**: Add itemized expenses with title and amount; remove individual expenses on demand with instant recalculation.
- **Automated Financial Calculations**: Real-time calculation of Total Salary, Total Expenses, Remaining Balance, and budget health percentages using high-precision numeric math (`Intl.NumberFormat`).
- **Data Persistence (LocalStorage)**: Complete client-side persistence under `cashFlowData`. Reloading or closing the browser preserves financial records without data loss.
- **Interactive Spending Visualization**: Powered by Chart.js (Doughnut chart) illustrating income distribution (Remaining Balance vs. Total Expenses) with safe non-negative handling.
- **Multi-Currency Conversion**: Integrated with the free [Frankfurter Exchange API](https://api.frankfurter.app) to convert displayed figures into **INR (₹)**, **USD ($)**, **EUR (€)**, and **GBP (£)**. Original base values remain preserved in base currency.
- **Proactive Balance Warnings**:
  - **Overspending Alert**: Flags budget deficit when expenses exceed monthly income.
  - **Low Balance Warning**: Alerts users when remaining balance drops below **10%** of monthly salary.
- **PDF Report Generation**: Instant itemized PDF export powered by `jsPDF`, including generation timestamps, summary statistics, and multi-page itemized expense tables.
- **Mobile-First Responsive Design**: Fluid layout tested across mobile (360px, 390px), tablet (768px), laptop (1024px), and desktop (1366px+).
- **Accessible & SEO-Optimized**: High contrast tokens, ARIA labels, semantic landmark elements, keyboard navigation, and `noindex` privacy directives.

---

## Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Markup** | HTML5 Semantic Elements (`<header>`, `<aside>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<form>`) |
| **Styles** | Vanilla CSS3 (Custom Properties / Design Tokens, Flexbox, Grid, CSS transitions, Media Queries) |
| **Scripting** | Vanilla JavaScript (ES6+ Modules with `type="module"`, zero frontend frameworks) |
| **Persistence** | Browser `localStorage`, `JSON.stringify()`, `JSON.parse()` with validation & sanitization |
| **Visualization** | [Chart.js](https://www.chartjs.org/) (v4.4.1 via jsDelivr CDN) |
| **PDF Generation**| [jsPDF](https://github.com/parallax/jsPDF) (v2.5.1 via Cloudflare CDN) |
| **Currency API** | [Frankfurter API](https://api.frankfurter.app) (Free reference currency rates) |
| **Typography** | Google Fonts: **Inter** (Interface body) & **Manrope** (Headings and metrics) |

---

## Project Structure

```text
cash-flow/
├── index.html              # Main semantic HTML5 markup
├── css/
│   ├── style.css           # Design tokens, resets, base layout & sidebar
│   ├── components.css      # Cards, forms, buttons, alerts, tables, empty states
│   └── responsive.css      # Breakpoints for mobile, tablet, and desktop
├── js/
│   ├── app.js              # Main entry point & event orchestrator
│   ├── state.js            # Central reactive store (Pub/Sub pattern)
│   ├── storage.js          # LocalStorage serialization & schema validator
│   ├── validation.js       # Input validation for salary & expenses
│   ├── dashboard.js        # Summary cards, balance threshold alerts & toasts
│   ├── expenses.js         # Expense item rendering & safe DOM manipulation
│   ├── charts.js           # Chart.js lifecycle, doughnut chart & safe limits
│   ├── currency.js         # Frankfurter API client, caching & conversion
│   └── reports.js          # jsPDF expense report generator
├── assets/
│   ├── icons/              # Scalable Vector Graphics (SVG icons & favicon)
│   └── images/             # Application screenshots & assets
├── Prompts.md              # Reconstructed development prompt log
├── README.md               # Complete project documentation
└── .gitignore              # Ignored files and artifacts
```

---

## Getting Started

### Prerequisites

All you need is a modern web browser (Chrome, Edge, Firefox, or Safari). Because the application uses native ES Modules (`type="module"`), it should be served over HTTP/HTTPS rather than opened directly as a `file://` URL (which modern browsers block for CORS security).

### Running Locally

#### Option 1: Python Built-in Server (Recommended)
```bash
# From the project root (d:\Cash-Flow):
python -m http.server 8080
```
Then visit `http://localhost:8080` in your web browser.

#### Option 2: VS Code Live Server
1. Open the `Cash-Flow` folder in VS Code.
2. Right click `index.html` and select **"Open with Live Server"**.

#### Option 3: Node.js (npx serve)
```bash
npx serve .
```

---

## State & LocalStorage Architecture

Cash-Flow adheres to a unidirectional data flow:

```text
User Action (Click / Form Submit)
       ↓
Input Validation (validation.js)
       ↓
Store Mutation (state.js)
       ↓
Local Storage Sync (storage.js)
       ↓
Reactive Listeners Triggered
 ┌─────┴───────────────────────┬──────────────────────┐
 ▼                             ▼                      ▼
Dashboard Cards & Alerts    Expense DOM List    Chart.js Update
(dashboard.js)              (expenses.js)       (charts.js)
```

### Data Schema (`cashFlowData`)

```json
{
  "salary": 50000,
  "expenses": [
    {
      "id": "exp-1732104523000-a8x1",
      "name": "Groceries & Vegetables",
      "amount": 2500,
      "createdAt": "2026-11-20T11:15:23.000Z"
    }
  ],
  "currency": "INR",
  "updatedAt": "2026-11-20T11:15:23.100Z"
}
```

- **Resilience**: Any corrupt or malformed JSON in `localStorage` is intercepted gracefully by `storage.js` without throwing unhandled exceptions.
- **Base Currency Integrity**: All stored amounts remain strictly in their base currency (`INR`). Currency conversion is computed strictly at render-time for display, preventing cumulative conversion rounding errors.

---

## External API Integration

- **Frankfurter API**: `https://api.frankfurter.app/latest?from=INR&to=USD,EUR,GBP`
- **Caching Mechanism**: Exchange rates are cached during the session to avoid duplicate network roundtrips.
- **Offline / Failure Resilience**: If the API call fails (network timeout or offline status), the application gracefully falls back to predefined reference rates (`1 INR = 0.012 USD, 0.011 EUR, 0.0095 GBP`) and flags the reference rate status in the header.

---

## Design System & Color Tokens

```css
:root {
  --color-background: #F6F7F5;
  --color-surface:    #FFFFFF;
  --color-primary:    #287A58; /* Forest Green */
  --color-primary-light: #E9F4ED;
  --color-primary-dark:  #174D38;
  --color-text:       #172321;
  --color-muted:      #727B77;
  --color-border:     #E7EBE7;
  --color-warning:    #D58B32; /* Amber */
  --color-danger:     #D64545; /* Crimson */
  --color-muted-bg:   #F0F3F0;
}
```

---

## Quality Assurance & Verification Matrix

| Test Scenario | Input / Action | Expected Result | Status |
| :--- | :--- | :--- | :---: |
| **Salary Validation** | Empty / Negative / Strings | Error banner, input highlighted red, state rejected | Passed |
| **Valid Salary** | `₹50,000` | Summary updates, badge shows positive percentage | Passed |
| **Expense Validation** | Empty Name / Negative Amount | Field-specific error feedback, no submission | Passed |
| **Add Expense** | "Groceries" for `₹2,500` | Expense added to top of list, balance reduced | Passed |
| **Delete Expense** | Click trash icon on expense item | Removed from state, DOM updated, totals recalculated | Passed |
| **Persistence** | Refresh browser (`F5`) | All salary, expense, and currency selections remain | Passed |
| **Overspending Alert** | Expenses > Salary | Critical red alert banner displayed, balance in red | Passed |
| **Low Balance Alert** | Balance < 10% of Salary | Warning banner displayed advising review of spend | Passed |
| **Currency Switch** | Select USD ($) | Figures convert dynamically, base state preserved | Passed |
| **PDF Export** | Click "Export PDF" | Formatted `.pdf` report downloaded with user data | Passed |
| **Empty State** | Clear all expenses | Friendly empty placeholder shown, chart shows prompt | Passed |

---

## Future Improvements

1. **Expense Categorization**: Add category tagging (Food, Utilities, Travel, Entertainment) with category breakdown charts.
2. **Monthly Historical Archives**: Ability to close a monthly budget cycle and view past months.
3. **Budget Goal Limits**: Custom threshold limits for particular expense categories.
4. **Dark Mode Toggle**: Native CSS theme switching using `data-theme="dark"`.

---

## License

Developed under the educational curriculum for **Sprint 02**. MIT License.
