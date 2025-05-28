// Flight Service Management

document.addEventListener('DOMContentLoaded', async () => {
  // Load flight data
  await loadFlightData();
  
  // Set up event listeners
  setupEventListeners();
});

// Load flight data and update the UI
async function loadFlightData() {
  try {
    const flights = await sheetsAPI.getRecords('flight');
    updateFlightTable(flights);
    updateFlightStats(flights);
  } catch (error) {
    console.error('Error loading flight data:', error);
  }
}

// Update the flight table
function updateFlightTable(flights) {
  const tableBody = document.querySelector('#flightTable tbody');
  
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (flights.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" class="text-center">No flight bookings found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  flights.forEach(flight => {
    const profit = parseFloat(flight.sellingPrice) - parseFloat(flight.costPrice);
    
    const row = document.createElement('tr');
    row.dataset.id = flight.id;
    
    row.innerHTML = `
      <td>${flight.fromCity}</td>
      <td>${flight.toCity}</td>
      <td>${formatDate(flight.bookingDate)}</td>
      <td>${formatCurrency(flight.costPrice)}</td>
      <td>${formatCurrency(flight.sellingPrice)}</td>
      <td>${formatCurrency(profit)}</td>
      <td>
        <button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Update flight statistics
function updateFlightStats(flights) {
  let totalCost = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  
  flights.forEach(flight => {
    const cost = parseFloat(flight.costPrice) || 0;
    const revenue = parseFloat(flight.sellingPrice) || 0;
    
    totalCost += cost;
    totalRevenue += revenue;
  });
  
  totalProfit = totalRevenue - totalCost;
  
  document.getElementById('flightTotalCost').textContent = formatCurrency(totalCost);
  document.getElementById('flightTotalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('flightTotalProfit').textContent = formatCurrency(totalProfit);
  document.getElementById('flightTotalBookings').textContent = flights.length;
}

// Set up event listeners
function setupEventListeners() {
  // Add new flight button
  const addBtn = document.getElementById('addFlightBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openFlightModal());
  }
  
  // Download button
  const downloadBtn = document.getElementById('downloadFlightBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      sheetsAPI.downloadCsv('flight', 'flight_bookings.csv');
    });
  }
  
  // Search functionality
  const searchInput = document.getElementById('searchFlight');
  if (searchInput) {
    searchInput.addEventListener('input', handleFlightSearch);
  }
  
  // Modal close buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Flight form submission
  const flightForm = document.getElementById('flightForm');
  if (flightForm) {
    flightForm.addEventListener('submit', handleFlightFormSubmit);
  }
  
  // Edit and delete buttons (delegated event)
  const flightTable = document.getElementById('flightTable');
  if (flightTable) {
    flightTable.addEventListener('click', handleFlightTableActions);
  }
}

// Handle flight search
function handleFlightSearch(e) {
  const searchText = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#flightTable tbody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchText) ? '' : 'none';
  });
}

// Open flight modal
function openFlightModal(flight = null) {
  const modal = document.getElementById('flightModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('flightForm');
  
  // Reset form
  form.reset();
  
  if (flight) {
    // Edit mode
    modalTitle.textContent = 'Edit Flight Booking';
    document.getElementById('flightId').value = flight.id;
    document.getElementById('fromCity').value = flight.fromCity;
    document.getElementById('toCity').value = flight.toCity;
    document.getElementById('bookingDate').value = flight.bookingDate;
    document.getElementById('travelDate').value = flight.travelDate;
    document.getElementById('costPrice').value = flight.costPrice;
    document.getElementById('sellingPrice').value = flight.sellingPrice;
    document.getElementById('notes').value = flight.notes || '';
  } else {
    // Add mode
    modalTitle.textContent = 'Add New Flight Booking';
    document.getElementById('flightId').value = '';
    
    // Set booking date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').value = today;
  }
  
  // Show modal
  modal.style.display = 'block';
}

// Close all modals
function closeAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

// Handle flight form submission
async function handleFlightFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const flightId = document.getElementById('flightId').value;
  
  const flightData = {
    fromCity: document.getElementById('fromCity').value,
    toCity: document.getElementById('toCity').value,
    bookingDate: document.getElementById('bookingDate').value,
    travelDate: document.getElementById('travelDate').value,
    costPrice: parseFloat(document.getElementById('costPrice').value),
    sellingPrice: parseFloat(document.getElementById('sellingPrice').value),
    notes: document.getElementById('notes').value
  };
  
  try {
    let result;
    
    if (flightId) {
      // Update existing flight
      flightData.id = flightId;
      result = await sheetsAPI.updateRecord('flight', flightData);
    } else {
      // Add new flight
      result = await sheetsAPI.addRecord('flight', flightData);
    }
    
    if (result.success) {
      // Reload flight data
      await loadFlightData();
      closeAllModals();
    } else {
      alert(`Error: ${result.error || 'Failed to save flight data'}`);
    }
  } catch (error) {
    console.error('Error saving flight data:', error);
    alert('An error occurred while saving flight data');
  }
}

// Handle flight table actions (edit, delete)
async function handleFlightTableActions(e) {
  const target = e.target.closest('button');
  if (!target) return;
  
  const row = target.closest('tr');
  const flightId = row.dataset.id;
  
  if (target.classList.contains('edit')) {
    // Edit flight
    try {
      const flights = await sheetsAPI.getRecords('flight');
      const flight = flights.find(f => f.id === flightId);
      if (flight) {
        openFlightModal(flight);
      }
    } catch (error) {
      console.error('Error fetching flight data for edit:', error);
    }
  } else if (target.classList.contains('delete')) {
    // Delete flight - show confirmation
    const confirmModal = document.getElementById('confirmationModal');
    const confirmBtn = document.getElementById('confirmDelete');
    
    // Set up delete confirmation
    confirmBtn.onclick = async () => {
      try {
        const result = await sheetsAPI.deleteRecord('flight', flightId);
        if (result.success) {
          await loadFlightData();
          closeAllModals();
        } else {
          alert(`Error: ${result.error || 'Failed to delete flight'}`);
        }
      } catch (error) {
        console.error('Error deleting flight:', error);
        alert('An error occurred while deleting the flight');
      }
    };
    
    // Show confirmation modal
    confirmModal.style.display = 'block';
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