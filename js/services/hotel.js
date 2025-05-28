// Hotel Service Management

document.addEventListener('DOMContentLoaded', async () => {
  // Load hotel data
  await loadHotelData();
  
  // Set up event listeners
  setupEventListeners();
});

// Load hotel data and update the UI
async function loadHotelData() {
  try {
    const hotels = await sheetsAPI.getRecords('hotel');
    updateHotelTable(hotels);
    updateHotelStats(hotels);
  } catch (error) {
    console.error('Error loading hotel data:', error);
  }
}

// Update the hotel table
function updateHotelTable(hotels) {
  const tableBody = document.querySelector('#hotelTable tbody');
  
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (hotels.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" class="text-center">No hotel reservations found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  hotels.forEach(hotel => {
    const profit = parseFloat(hotel.sellingPrice) - parseFloat(hotel.costPrice);
    
    const row = document.createElement('tr');
    row.dataset.id = hotel.id;
    
    row.innerHTML = `
      <td>${hotel.hotelName}</td>
      <td>${hotel.location}</td>
      <td>${formatDateRange(hotel.checkInDate, hotel.checkOutDate)}</td>
      <td>${formatCurrency(hotel.costPrice)}</td>
      <td>${formatCurrency(hotel.sellingPrice)}</td>
      <td>${formatCurrency(profit)}</td>
      <td>
        <button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Update hotel statistics
function updateHotelStats(hotels) {
  let totalCost = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  
  hotels.forEach(hotel => {
    const cost = parseFloat(hotel.costPrice) || 0;
    const revenue = parseFloat(hotel.sellingPrice) || 0;
    
    totalCost += cost;
    totalRevenue += revenue;
  });
  
  totalProfit = totalRevenue - totalCost;
  
  document.getElementById('hotelTotalCost').textContent = formatCurrency(totalCost);
  document.getElementById('hotelTotalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('hotelTotalProfit').textContent = formatCurrency(totalProfit);
  document.getElementById('hotelTotalBookings').textContent = hotels.length;
}

// Set up event listeners
function setupEventListeners() {
  // Add new hotel button
  const addBtn = document.getElementById('addHotelBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openHotelModal());
  }
  
  // Download button
  const downloadBtn = document.getElementById('downloadHotelBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      sheetsAPI.downloadCsv('hotel', 'hotel_reservations.csv');
    });
  }
  
  // Search functionality
  const searchInput = document.getElementById('searchHotel');
  if (searchInput) {
    searchInput.addEventListener('input', handleHotelSearch);
  }
  
  // Modal close buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Hotel form submission
  const hotelForm = document.getElementById('hotelForm');
  if (hotelForm) {
    hotelForm.addEventListener('submit', handleHotelFormSubmit);
  }
  
  // Edit and delete buttons (delegated event)
  const hotelTable = document.getElementById('hotelTable');
  if (hotelTable) {
    hotelTable.addEventListener('click', handleHotelTableActions);
  }
}

// Handle hotel search
function handleHotelSearch(e) {
  const searchText = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#hotelTable tbody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchText) ? '' : 'none';
  });
}

// Open hotel modal
function openHotelModal(hotel = null) {
  const modal = document.getElementById('hotelModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('hotelForm');
  
  // Reset form
  form.reset();
  
  if (hotel) {
    // Edit mode
    modalTitle.textContent = 'Edit Hotel Reservation';
    document.getElementById('hotelId').value = hotel.id;
    document.getElementById('hotelName').value = hotel.hotelName;
    document.getElementById('location').value = hotel.location;
    document.getElementById('checkInDate').value = hotel.checkInDate;
    document.getElementById('checkOutDate').value = hotel.checkOutDate;
    document.getElementById('costPrice').value = hotel.costPrice;
    document.getElementById('sellingPrice').value = hotel.sellingPrice;
    document.getElementById('notes').value = hotel.notes || '';
  } else {
    // Add mode
    modalTitle.textContent = 'Add New Hotel Reservation';
    document.getElementById('hotelId').value = '';
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

// Handle hotel form submission
async function handleHotelFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const hotelId = document.getElementById('hotelId').value;
  
  const hotelData = {
    hotelName: document.getElementById('hotelName').value,
    location: document.getElementById('location').value,
    checkInDate: document.getElementById('checkInDate').value,
    checkOutDate: document.getElementById('checkOutDate').value,
    costPrice: parseFloat(document.getElementById('costPrice').value),
    sellingPrice: parseFloat(document.getElementById('sellingPrice').value),
    notes: document.getElementById('notes').value
  };
  
  try {
    let result;
    
    if (hotelId) {
      // Update existing hotel
      hotelData.id = hotelId;
      result = await sheetsAPI.updateRecord('hotel', hotelData);
    } else {
      // Add new hotel
      result = await sheetsAPI.addRecord('hotel', hotelData);
    }
    
    if (result.success) {
      // Reload hotel data
      await loadHotelData();
      closeAllModals();
    } else {
      alert(`Error: ${result.error || 'Failed to save hotel data'}`);
    }
  } catch (error) {
    console.error('Error saving hotel data:', error);
    alert('An error occurred while saving hotel data');
  }
}

// Handle hotel table actions (edit, delete)
async function handleHotelTableActions(e) {
  const target = e.target.closest('button');
  if (!target) return;
  
  const row = target.closest('tr');
  const hotelId = row.dataset.id;
  
  if (target.classList.contains('edit')) {
    // Edit hotel
    try {
      const hotels = await sheetsAPI.getRecords('hotel');
      const hotel = hotels.find(h => h.id === hotelId);
      if (hotel) {
        openHotelModal(hotel);
      }
    } catch (error) {
      console.error('Error fetching hotel data for edit:', error);
    }
  } else if (target.classList.contains('delete')) {
    // Delete hotel - show confirmation
    const confirmModal = document.getElementById('confirmationModal');
    const confirmBtn = document.getElementById('confirmDelete');
    
    // Set up delete confirmation
    confirmBtn.onclick = async () => {
      try {
        const result = await sheetsAPI.deleteRecord('hotel', hotelId);
        if (result.success) {
          await loadHotelData();
          closeAllModals();
        } else {
          alert(`Error: ${result.error || 'Failed to delete hotel'}`);
        }
      } catch (error) {
        console.error('Error deleting hotel:', error);
        alert('An error occurred while deleting the hotel');
      }
    };
    
    // Show confirmation modal
    confirmModal.style.display = 'block';
  }
}

// Helper function to format date range
function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  
  return `${start.toLocaleDateString('en-IN', options)} to ${end.toLocaleDateString('en-IN', options)}`;
}

// Helper function to format currency
function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}