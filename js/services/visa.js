// Visa Service Management

document.addEventListener('DOMContentLoaded', async () => {
  // Load visa data
  await loadVisaData();
  
  // Set up event listeners
  setupEventListeners();
});

// Load visa data and update the UI
async function loadVisaData() {
  try {
    const visas = await sheetsAPI.getRecords('visa');
    updateVisaTable(visas);
    updateVisaStats(visas);
  } catch (error) {
    console.error('Error loading visa data:', error);
  }
}

// Update the visa table
function updateVisaTable(visas) {
  const tableBody = document.querySelector('#visaTable tbody');
  
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (visas.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="5" class="text-center">No visa applications found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  visas.forEach(visa => {
    const profit = parseFloat(visa.sellingPrice) - parseFloat(visa.costPrice);
    
    const row = document.createElement('tr');
    row.dataset.id = visa.id;
    
    row.innerHTML = `
      <td>${visa.country}</td>
      <td>${formatDate(visa.applicationDate)}</td>
      <td>${formatCurrency(visa.costPrice)}</td>
      <td>${formatCurrency(visa.sellingPrice)}</td>
      <td>${formatCurrency(profit)}</td>
      <td>
        <button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Update visa statistics
function updateVisaStats(visas) {
  let totalCost = 0;
  let totalRevenue = 0;
  let totalProfit = 0;
  
  visas.forEach(visa => {
    const cost = parseFloat(visa.costPrice) || 0;
    const revenue = parseFloat(visa.sellingPrice) || 0;
    
    totalCost += cost;
    totalRevenue += revenue;
  });
  
  totalProfit = totalRevenue - totalCost;
  
  document.getElementById('visaTotalCost').textContent = formatCurrency(totalCost);
  document.getElementById('visaTotalRevenue').textContent = formatCurrency(totalRevenue);
  document.getElementById('visaTotalProfit').textContent = formatCurrency(totalProfit);
  document.getElementById('visaTotalApplications').textContent = visas.length;
}

// Set up event listeners
function setupEventListeners() {
  // Add new visa button
  const addBtn = document.getElementById('addVisaBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openVisaModal());
  }
  
  // Download button
  const downloadBtn = document.getElementById('downloadVisaBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      sheetsAPI.downloadCsv('visa', 'visa_applications.csv');
    });
  }
  
  // Search functionality
  const searchInput = document.getElementById('searchVisa');
  if (searchInput) {
    searchInput.addEventListener('input', handleVisaSearch);
  }
  
  // Modal close buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Visa form submission
  const visaForm = document.getElementById('visaForm');
  if (visaForm) {
    visaForm.addEventListener('submit', handleVisaFormSubmit);
  }
  
  // Edit and delete buttons (delegated event)
  const visaTable = document.getElementById('visaTable');
  if (visaTable) {
    visaTable.addEventListener('click', handleVisaTableActions);
  }
}

// Handle visa search
function handleVisaSearch(e) {
  const searchText = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#visaTable tbody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchText) ? '' : 'none';
  });
}

// Open visa modal
function openVisaModal(visa = null) {
  const modal = document.getElementById('visaModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('visaForm');
  
  // Reset form
  form.reset();
  
  if (visa) {
    // Edit mode
    modalTitle.textContent = 'Edit Visa Application';
    document.getElementById('visaId').value = visa.id;
    document.getElementById('country').value = visa.country;
    document.getElementById('applicationDate').value = visa.applicationDate;
    document.getElementById('costPrice').value = visa.costPrice;
    document.getElementById('sellingPrice').value = visa.sellingPrice;
    document.getElementById('notes').value = visa.notes || '';
  } else {
    // Add mode
    modalTitle.textContent = 'Add New Visa Application';
    document.getElementById('visaId').value = '';
    
    // Set application date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('applicationDate').value = today;
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

// Handle visa form submission
async function handleVisaFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const visaId = document.getElementById('visaId').value;
  
  const visaData = {
    country: document.getElementById('country').value,
    applicationDate: document.getElementById('applicationDate').value,
    costPrice: parseFloat(document.getElementById('costPrice').value),
    sellingPrice: parseFloat(document.getElementById('sellingPrice').value),
    notes: document.getElementById('notes').value
  };
  
  try {
    let result;
    
    if (visaId) {
      // Update existing visa
      visaData.id = visaId;
      result = await sheetsAPI.updateRecord('visa', visaData);
    } else {
      // Add new visa
      result = await sheetsAPI.addRecord('visa', visaData);
    }
    
    if (result.success) {
      // Reload visa data
      await loadVisaData();
      closeAllModals();
    } else {
      alert(`Error: ${result.error || 'Failed to save visa data'}`);
    }
  } catch (error) {
    console.error('Error saving visa data:', error);
    alert('An error occurred while saving visa data');
  }
}

// Handle visa table actions (edit, delete)
async function handleVisaTableActions(e) {
  const target = e.target.closest('button');
  if (!target) return;
  
  const row = target.closest('tr');
  const visaId = row.dataset.id;
  
  if (target.classList.contains('edit')) {
    // Edit visa
    try {
      const visas = await sheetsAPI.getRecords('visa');
      const visa = visas.find(v => v.id === visaId);
      if (visa) {
        openVisaModal(visa);
      }
    } catch (error) {
      console.error('Error fetching visa data for edit:', error);
    }
  } else if (target.classList.contains('delete')) {
    // Delete visa - show confirmation
    const confirmModal = document.getElementById('confirmationModal');
    const confirmBtn = document.getElementById('confirmDelete');
    
    // Set up delete confirmation
    confirmBtn.onclick = async () => {
      try {
        const result = await sheetsAPI.deleteRecord('visa', visaId);
        if (result.success) {
          await loadVisaData();
          closeAllModals();
        } else {
          alert(`Error: ${result.error || 'Failed to delete visa application'}`);
        }
      } catch (error) {
        console.error('Error deleting visa:', error);
        alert('An error occurred while deleting the visa application');
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