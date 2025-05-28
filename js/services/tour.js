// Tour Package Management

document.addEventListener('DOMContentLoaded', async () => {
  await loadTourData();
  setupEventListeners();
});

// Load tour data and update UI
async function loadTourData() {
  try {
    const tours = await sheetsAPI.getRecords('tour');
    updateTourTable(tours);
    updateTourStats(tours);
  } catch (error) {
    console.error('Error loading tour data:', error);
  }
}

// Update the tour table
function updateTourTable(tours) {
  const tableBody = document.querySelector('#tourTable tbody');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (tours.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="6" class="text-center">No tour packages found</td>`;
    tableBody.appendChild(row);
    return;
  }

  tours.forEach(tour => {
    const profit = parseFloat(tour.sellingPrice) - parseFloat(tour.costPrice);
    const row = document.createElement('tr');
    row.dataset.id = tour.id;

    row.innerHTML = `
      <td>${tour.destination}</td>
      <td>${formatDateRange(tour.travelDate, tour.returnDate)}</td>
      <td>${formatCurrency(tour.costPrice)}</td>
      <td>${formatCurrency(tour.sellingPrice)}</td>
      <td>${formatCurrency(profit)}</td>
      <td>
        <button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Update tour statistics
function updateTourStats(tours) {
  let totalCost = 0;
  let totalRevenue = 0;

  tours.forEach(tour => {
    totalCost += parseFloat(tour.costPrice) || 0;
    totalRevenue += parseFloat(tour.sellingPrice) || 0;
  });

  const totalProfit = totalRevenue - totalCost;

  document.getElementById('tourTotalCost').textContent = formatCurrency(totalCost);
  document.getElementById('tourTotalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('tourTotalProfit').textContent = formatCurrency(totalProfit);
  document.getElementById('tourTotalBookings').textContent = tours.length;
}

// Set up event listeners
function setupEventListeners() {
  const addBtn = document.getElementById('addTourBtn');
  if (addBtn) addBtn.addEventListener('click', () => openTourModal());

  const downloadBtn = document.getElementById('downloadTourBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      sheetsAPI.downloadCsv('tour', 'tour_packages.csv');
    });
  }

  const searchInput = document.getElementById('searchTour');
  if (searchInput) {
    searchInput.addEventListener('input', handleTourSearch);
  }

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  const tourForm = document.getElementById('tourForm');
  if (tourForm) {
    tourForm.addEventListener('submit', handleTourFormSubmit);
  }

  const tourTable = document.getElementById('tourTable');
  if (tourTable) {
    tourTable.addEventListener('click', handleTourTableActions);
  }
}

// Handle search
function handleTourSearch(e) {
  const searchText = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#tourTable tbody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchText) ? '' : 'none';
  });
}

// Open modal
function openTourModal(tour = null) {
  const modal = document.getElementById('tourModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('tourForm');

  form.reset();

  if (tour) {
    modalTitle.textContent = 'Edit Tour Package';
    document.getElementById('tourId').value = tour.id;
    document.getElementById('destination').value = tour.destination;
    document.getElementById('travelDate').value = tour.travelDate;
    document.getElementById('returnDate').value = tour.returnDate;
    document.getElementById('costPrice').value = tour.costPrice;
    document.getElementById('sellingPrice').value = tour.sellingPrice;
    document.getElementById('details').value = tour.details || '';
    document.getElementById('notes').value = tour.notes || '';
  } else {
    modalTitle.textContent = 'Add New Tour Package';
    document.getElementById('tourId').value = '';
  }

  modal.style.display = 'block';
}

// Close all modals
function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.style.display = 'none';
  });
}

// Handle form submit
async function handleTourFormSubmit(e) {
  e.preventDefault();

  const tourId = document.getElementById('tourId').value;

  const tourData = {
    destination: document.getElementById('destination').value,
    travelDate: document.getElementById('travelDate').value,
    returnDate: document.getElementById('returnDate').value,
    costPrice: parseFloat(document.getElementById('costPrice').value),
    sellingPrice: parseFloat(document.getElementById('sellingPrice').value),
    details: document.getElementById('details').value,
    notes: document.getElementById('notes').value
  };

  try {
    let result;
    if (tourId) {
      tourData.id = tourId;
      result = await sheetsAPI.updateRecord('tour', tourData);
    } else {
      result = await sheetsAPI.addRecord('tour', tourData);
    }

    if (result.success) {
      await loadTourData();
      closeAllModals();
    } else {
      alert(`Error: ${result.error || 'Failed to save tour data'}`);
    }
  } catch (error) {
    console.error('Error saving tour data:', error);
    alert('An error occurred while saving tour data');
  }
}

// Handle table actions (edit/delete)
async function handleTourTableActions(e) {
  const target = e.target.closest('button');
  if (!target) return;

  const row = target.closest('tr');
  const tourId = row.dataset.id;

  if (target.classList.contains('edit')) {
    try {
      const tours = await sheetsAPI.getRecords('tour');
      const tour = tours.find(t => t.id === tourId);
      if (tour) openTourModal(tour);
    } catch (error) {
      console.error('Error fetching tour data for edit:', error);
    }
  } else if (target.classList.contains('delete')) {
    const confirmModal = document.getElementById('confirmationModal');
    const confirmBtn = document.getElementById('confirmDelete');

    confirmBtn.onclick = async () => {
      try {
        const result = await sheetsAPI.deleteRecord('tour', tourId);
        if (result.success) {
          await loadTourData();
          closeAllModals();
        } else {
          alert(`Error: ${result.error || 'Failed to delete tour'}`);
        }
      } catch (error) {
        console.error('Error deleting tour:', error);
        alert('An error occurred while deleting the tour');
      }
    };

    confirmModal.style.display = 'block';
  }
}

// Helper functions
function formatCurrency(amount) {
  return '₹' + parseFloat(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-IN', options)} to ${end.toLocaleDateString('en-IN', options)}`;
}
