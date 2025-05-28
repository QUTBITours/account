// Dashboard functionality

document.addEventListener('DOMContentLoaded', async () => {
  // Load summary statistics
  await loadSummaryStats();
  
  // Load recent bookings
  await loadRecentBookings();
  
  // Initialize charts
  initializeCharts();
});

// Load summary statistics
async function loadSummaryStats() {
  try {
    const stats = await sheetsAPI.getSummaryStats();
    
    // Update stats cards
    document.getElementById('totalRevenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('totalCost').textContent = formatCurrency(stats.totalCost);
    document.getElementById('totalProfit').textContent = formatCurrency(stats.totalProfit);
    document.getElementById('totalBookings').textContent = stats.totalBookings;
    
    return stats;
  } catch (error) {
    console.error('Error loading summary stats:', error);
    return null;
  }
}

// Load recent bookings
async function loadRecentBookings() {
  try {
    const bookings = await sheetsAPI.getRecentBookings(5);
    const tableBody = document.querySelector('#recentBookingsTable tbody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    if (bookings.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `<td colspan="5" class="text-center">No bookings found</td>`;
      tableBody.appendChild(row);
      return;
    }
    
    bookings.forEach(booking => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${booking.serviceType}</td>
        <td>${formatDate(booking.date)}</td>
        <td>${formatCurrency(booking.cost)}</td>
        <td>${formatCurrency(booking.revenue)}</td>
        <td>${formatCurrency(booking.profit)}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading recent bookings:', error);
  }
}

// Initialize charts
async function initializeCharts() {
  try {
    const stats = await sheetsAPI.getSummaryStats();
    
    if (!stats) return;
    
    // Define service display names and colors
    const services = {
      flight: { name: 'Flight', color: '#3B82F6' },
      hotel: { name: 'Hotel', color: '#10B981' },
      tour: { name: 'Tour', color: '#F59E0B' },
      forex: { name: 'Forex', color: '#6366F1' },
      wajibath: { name: 'Wajibath', color: '#EC4899' },
      car: { name: 'Car', color: '#F97316' },
      visa: { name: 'Visa', color: '#8B5CF6' },
      train: { name: 'Train', color: '#14B8A6' }
    };
    
    // Prepare data for charts
    const serviceStats = stats.serviceStats;
    const labels = [];
    const revenueData = [];
    const profitData = [];
    const colors = [];
    
    Object.keys(serviceStats).forEach(service => {
      if (services[service]) {
        labels.push(services[service].name);
        revenueData.push(serviceStats[service].totalRevenue);
        profitData.push(serviceStats[service].totalProfit);
        colors.push(services[service].color);
      }
    });
    
    // Create revenue chart
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
      new Chart(revenueCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Revenue',
            data: revenueData,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => '₹' + value.toLocaleString('en-IN')
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => '₹' + context.raw.toLocaleString('en-IN')
              }
            }
          }
        }
      });
    }
    
    // Create profit chart
    const profitCtx = document.getElementById('profitChart')?.getContext('2d');
    if (profitCtx) {
      new Chart(profitCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Profit',
            data: profitData,
            backgroundColor: colors,
            borderColor: colors,
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => '₹' + value.toLocaleString('en-IN')
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => '₹' + context.raw.toLocaleString('en-IN')
              }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error initializing charts:', error);
  }
}

// Helper function to format currency
function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}