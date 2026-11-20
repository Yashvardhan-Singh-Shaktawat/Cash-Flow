/**
 * CASH-FLOW — Chart Visualization Module
 * Integrates Chart.js for responsive spending breakdown with safe non-negative handling.
 */

let chartInstance = null;

/**
 * Initialize or update the spending distribution doughnut chart
 * @param {number} salary Monthly salary in base currency
 * @param {Array} expenses List of expenses
 * @param {string} currency Active currency code
 */
export function updateChart(salary = 0, expenses = [], currency = 'INR') {
  const canvas = document.getElementById('spending-chart');
  const emptyMsg = document.getElementById('chart-empty-message');

  if (!canvas) return;

  // Verify Chart.js library is loaded
  if (typeof window.Chart === 'undefined') {
    console.warn('[Chart] Chart.js CDN is not available yet.');
    if (emptyMsg) {
      emptyMsg.textContent = 'Chart visualization loading...';
      emptyMsg.style.display = 'block';
    }
    return;
  }

  const numSalary = Number(salary) || 0;
  const totalExpenses = (Array.isArray(expenses) ? expenses : []).reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  // If both salary and expenses are 0, show empty state message
  if (numSalary === 0 && totalExpenses === 0) {
    if (emptyMsg) {
      emptyMsg.textContent = 'Enter your monthly salary and add expenses to view income distribution.';
      emptyMsg.style.display = 'block';
    }
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    return;
  }

  if (emptyMsg) {
    emptyMsg.style.display = 'none';
  }

  // Safe non-negative chart values handling (Requirement 7.3):
  // "If total expenses exceed salary, do not pass negative remaining balance into Chart.js.
  // For visualization:
  // Remaining = Math.max(0, salary - expenses)
  // Expenses = total expenses"
  const safeRemaining = Math.max(0, numSalary - totalExpenses);
  const safeExpenses = totalExpenses;

  const chartData = [safeRemaining, safeExpenses];
  const chartLabels = ['Remaining Balance', 'Total Expenses'];
  const backgroundColors = ['#287A58', '#D64545'];
  const hoverColors = ['#174D38', '#B33434'];

  // Update existing instance if already created
  if (chartInstance) {
    chartInstance.data.datasets[0].data = chartData;
    chartInstance.update();
    return;
  }

  // Otherwise create a new Chart instance
  const ctx = canvas.getContext('2d');
  chartInstance = new window.Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: backgroundColors,
          hoverBackgroundColor: hoverColors,
          borderWidth: 2,
          borderColor: '#FFFFFF',
          hoverOffset: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: {
          display: false // Using our clean custom legend
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = context.raw || 0;
              const total = chartData.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return ` ${context.label}: ${percentage}%`;
            }
          }
        }
      },
      animation: {
        duration: 400
      }
    }
  });
}

/**
 * Destroy chart instance cleanly on teardown
 */
export function destroyChart() {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

export default {
  updateChart,
  destroyChart
};
