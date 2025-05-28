// Car Rental Service Management

document.addEventListener('DOMContentLoaded', async () => {
  // Load car rental data
  await loadCarData();
  
  // Set up event listeners
  setupEventListeners();
});

// Load car rental data and update the UI
async function loadCarData() {
  try {
    const cars = await sheetsAPI.getRecords('car');
    updateCarTable(cars);
    updateCarStats(cars);
  } catch (error) {
    console.error('Error loading car rental data:', error);
  }
}

// Update the car rental table
function updateCarTable(cars) {
  const tableBody = document.querySelector('#carTable tbody');
  
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (cars.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="7" class="text-center">No car rentals found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  cars.forEach(car => {
    const profit = parseFloat(car.sellingPrice) - parseFloat(car.costPrice);
    
    const row = document.createElement('tr');
    row.dataset.id = car.id;
    
    row.innerHTML = `
      <td>${car.fromLocation}</td>
      <td>${car.toLocation}</td>
      <td>${formatDateRange(car.hireDate, car.returnDate)}</td>
      <td>${formatCurrency(car.costPrice)}</td>
      <td>${formatCurrency(car.sellingPrice)}</td>
      <td>${formatCurrency(profit)}</td>
      <td>
        <button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Update car rental statistics
function updateCarStats(cars) {
  let totalCost = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  
  cars.forEach(car => {
    const cost = parseFloat(car.costPrice) || 0;
    const revenue = parseFloat(car.sellingPrice) || 0;
    
    totalCost += cost;
    totalRevenue += revenue;
  });
  
  totalProfit = totalRevenue - totalCost;
  
  document.getElementById('carTotalCost').textContent = formatCurrency(totalCost);
  document.getElementById('carTotalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('carTotalProfit').textContent = formatCurrency(totalProfit);
  document.getElementById('carTotalRentals').textContent = cars.length;
}

// Set up event listeners
function setupEventListeners() {
  // Add new car rental button
  const addBtn = document.getElementById('addCarBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openCarModal());
  }
  
  // Download button
  const downloadBtn = document.getElementById('downloadCarBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      sheetsAPI.downloadCsv('car', 'car_rentals.csv');
    });
  }
  
  // Search functionality
  const searchInput = document.getElementById('searchCar');
  if (searchInput) {
    searchInput.addEventListener('input', handleCarSearch);
  }
  
  // Modal close buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Car rental form submission
  const carForm = document.getElementById('carForm');
  if (carForm) {
    carForm.addEventListener('submit', handleCarFormSubmit);
  }
  
  // Edit and delete buttons (delegated event)
  const carTable = document.getElementById('carTable');
  if (carTable) {
    carTable.addEventListener('click', handleCarTableActions);
  }
}

// Handle car rental search
function handleCarSearch(e) {
  const searchText = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#carTable tbody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchText) ? '' : 'none';
  });
}

// Open car rental modal
function openCarModal(car = null) {
  const modal = document.getElementById('carModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('carForm');
  
  // Reset form
  form.reset();
  
  if (car) {
    // Edit mode
    modalTitle.textContent = 'Edit Car Rental';
    document.getElementById('carId').value = car.id;
    document.getElementById('fromLocation').value = car.fromLocation;
    document.getElementById('toLocation').value = car.toLocation;
    document.getElementById('hireDate').value = car.hireDate;
    document.getElementById('returnDate').value = car.returnDate;
    document.getElementById('costPrice').value = car.costPrice;
    document.getElementById('sellingPrice').value = car.sellingPrice;
    document.getElementById('notes').value = car.notes || '';
  } else {
    // Add mode
    modalTitle.textContent = 'Add New Car Rental';
    document.getElementById('carId').value = '';
    
    // Set hire date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('hireDate').value = today;
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

// Handle car rental form submission
async function handleCarFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const carId = document.getElementById('carId').value;
  
  const carData = {
    fromLocation: document.getElementById('fromLocation').value,
    toLocation: document.getElementById('toLocation').value,
    hireDate: document.getElementById('hireDate').value,
    returnDate: document.getElementById('returnDate').value,
    costPrice: parseFloat(document.getElementById('costPrice').value),
    sellingPrice: parseFloat(document.getElementById('sellingPrice').value),
    notes: document.getElementById('notes').value
  };
  
  try {
    let result;
    
    if (carId) {
      // Update existing car rental
      carData.id = carId;
      result = await sheetsAPI.updateRecord('car', carData);
    } else {
      // Add new car rental
      result = await sheetsAPI.addRecord('car', carData);
    }
    
    if (result.success) {
      // Reload car rental data
      await loadCarData();
      closeAllModals();
    } else {
      alert(`Error: ${result.error || 'Failed to save car rental data'}`);
    }
  } catch (error) {
    console.error('Error saving car rental data:', error);
    alert('An error occurred while saving car rental data');
  }
}

// Handle car rental table actions (edit, delete)
async function handleCarTableActions(e) {
  const target = e.target.closest('button');
  if (!target) return;
  
  const row = target.closest('tr');
  const carId = row.dataset.id;
  
  if (target.classList.contains('edit')) {
    // Edit car rental
    try {
      const cars = await sheetsAPI.getRecords('car');
      const car = cars.find(c => c.id === carId);
      if (car) {
        openCarModal(car);
      }
    } catch (error) {
      console.error('Error fetching car rental data for edit:', error);
    }
  } else if (target.classList.contains('delete')) {
    // Delete car rental - show confirmation
    const confirmModal = document.getElementById('confirmationModal');
    const confirmBtn = document.getElementById('confirmDelete');
    
    // Set up delete confirmation
    confirmBtn.onclick = async () => {
      try {
        const result = await sheetsAPI.deleteRecord('car', carId);
        if (result.success) {
          await loadCarData();
          closeAllModals();
        } else {
          alert(`Error: ${result.error || 'Failed to delete car rental'}`);
        }
      } catch (error) {
        console.error('Error deleting car rental:', error);
        alert('An error occurred while deleting the car rental');
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