// Wajibath Service Management

document.addEventListener('DOMContentLoaded', async () => {
  // Load wajibath data
  await loadWajibathData();
  
  // Set up event listeners
  setupEventListeners();
});

// Load wajibath data and update the UI
async function loadWajibathData() {
  try {
    const wajibaths = await sheetsAPI.getRecords('wajibath');
    updateWajibathTable(wajibaths);
    updateWajibathStats(wajibaths);
  } catch (error) {
    console.error('Error loading wajibath data:', error);
  }
}

// Update the wajibath table
function updateWajibathTable(wajibaths) {
  const tableBody = document.querySelector('#wajibathTable tbody');
  
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (wajibaths.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="3" class="text-center">No wajibath payments found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  wajibaths.forEach(wajibath => {
    const row = document.createElement('tr');
    row.dataset.id = wajibath.id;
    
    row.innerHTML = `
      <td>${formatCurrency(wajibath.amountPaid)}</td>
      <td>${formatDate(wajibath.datePaid)}</td>
      <td>
        <button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Update wajibath statistics
function updateWajibathStats(wajibaths) {
  let totalAmount = 0;
  let totalPayments = wajibaths.length;
  
  wajibaths.forEach(wajibath => {
    totalAmount += parseFloat(wajibath.amountPaid) || 0;
  });
  
  document.getElementById('wajibathTotalAmount').textContent = formatCurrency(totalAmount);
  document.getElementById('wajibathTotalPayments').textContent = totalPayments;
}

// Set up event listeners
function setupEventListeners() {
  // Add new wajibath button
  const addBtn = document.getElementById('addWajibathBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openWajibathModal());
  }
  
  // Download button
  const downloadBtn = document.getElementById('downloadWajibathBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      sheetsAPI.downloadCsv('wajibath', 'wajibath_payments.csv');
    });
  }
  
  // Search functionality
  const searchInput = document.getElementById('searchWajibath');
  if (searchInput) {
    searchInput.addEventListener('input', handleWajibathSearch);
  }
  
  // Modal close buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Wajibath form submission
  const wajibathForm = document.getElementById('wajibathForm');
  if (wajibathForm) {
    wajibathForm.addEventListener('submit', handleWajibathFormSubmit);
  }
  
  // Edit and delete buttons (delegated event)
  const wajibathTable = document.getElementById('wajibathTable');
  if (wajibathTable) {
    wajibathTable.addEventListener('click', handleWajibathTableActions);
  }
}

// Handle wajibath search
function handleWajibathSearch(e) {
  const searchText = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#wajibathTable tbody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchText) ? '' : 'none';
  });
}

// Open wajibath modal
function openWajibathModal(wajibath = null) {
  const modal = document.getElementById('wajibathModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('wajibathForm');
  
  // Reset form
  form.reset();
  
  if (wajibath) {
    // Edit mode
    modalTitle.textContent = 'Edit Wajibath Payment';
    document.getElementById('wajibathId').value = wajibath.id;
    document.getElementById('amountPaid').value = wajibath.amountPaid;
    document.getElementById('datePaid').value = wajibath.datePaid;
    document.getElementById('notes').value = wajibath.notes || '';
  } else {
    // Add mode
    modalTitle.textContent = 'Add New Wajibath Payment';
    document.getElementById('wajibathId').value = '';
    
    // Set payment date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('datePaid').value = today;
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

// Handle wajibath form submission
async function handleWajibathFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const wajibathId = document.getElementById('wajibathId').value;
  
  const wajibathData = {
    amountPaid: parseFloat(document.getElementById('amountPaid').value),
    datePaid: document.getElementById('datePaid').value,
    notes: document.getElementById('notes').value
  };
  
  try {
    let result;
    
    if (wajibathId) {
      // Update existing wajibath
      wajibathData.id = wajibathId;
      result = await sheetsAPI.updateRecord('wajibath', wajibathData);
    } else {
      // Add new wajibath
      result = await sheetsAPI.addRecord('wajibath', wajibathData);
    }
    
    if (result.success) {
      // Reload wajibath data
      await loadWajibathData();
      closeAllModals();
    } else {
      alert(`Error: ${result.error || 'Failed to save wajibath data'}`);
    }
  } catch (error) {
    console.error('Error saving wajibath data:', error);
    alert('An error occurred while saving wajibath data');
  }
}

// Handle wajibath table actions (edit, delete)
async function handleWajibathTableActions(e) {
  const target = e.target.closest('button');
  if (!target) return;
  
  const row = target.closest('tr');
  const wajibathId = row.dataset.id;
  
  if (target.classList.contains('edit')) {
    // Edit wajibath
    try {
      const wajibaths = await sheetsAPI.getRecords('wajibath');
      const wajibath = wajibaths.find(w => w.id === wajibathId);
      if (wajibath) {
        openWajibathModal(wajibath);
      }
    } catch (error) {
      console.error('Error fetching wajibath data for edit:', error);
    }
  } else if (target.classList.contains('delete')) {
    // Delete wajibath - show confirmation
    const confirmModal = document.getElementById('confirmationModal');
    const confirmBtn = document.getElementById('confirmDelete');
    
    // Set up delete confirmation
    confirmBtn.onclick = async () => {
      try {
        const result = await sheetsAPI.deleteRecord('wajibath', wajibathId);
        if (result.success) {
          await loadWajibathData();
          closeAllModals();
        } else {
          alert(`Error: ${result.error || 'Failed to delete wajibath payment'}`);
        }
      } catch (error) {
        console.error('Error deleting wajibath:', error);
        alert('An error occurred while deleting the wajibath payment');
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