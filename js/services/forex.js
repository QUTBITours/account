// Foreign Exchange Service Management

document.addEventListener('DOMContentLoaded', async () => {
  // Load forex data
  await loadForexData();
  
  // Set up event listeners
  setupEventListeners();
});

// Load forex data and update the UI
async function loadForexData() {
  try {
    const forexes = await sheetsAPI.getRecords('forex');
    updateForexTable(forexes);
    updateForexStats(forexes);
  } catch (error) {
    console.error('Error loading forex data:', error);
  }
}

// Update the forex table
function updateForexTable(forexes) {
  const tableBody = document.querySelector('#forexTable tbody');
  
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  if (forexes.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="6" class="text-center">No forex transactions found</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  forexes.forEach(forex => {
    const row = document.createElement('tr');
    row.dataset.id = forex.id;
    
    row.innerHTML = `
      <td>${forex.currency}</td>
      <td>${forex.amount}</td>
      <td>${forex.exchangeRate}</td>
      <td>${formatCurrency(forex.totalAmount)}</td>
      <td>${formatDate(forex.transactionDate)}</td>
      <td>
        <button class="action-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
        <button class="action-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

// Update forex statistics
function updateForexStats(forexes) {
  let totalAmount = 0;
  let totalTransactions = forexes.length;
  
  forexes.forEach(forex => {
    totalAmount += parseFloat(forex.totalAmount) || 0;
  });
  
  document.getElementById('forexTotalAmount').textContent = formatCurrency(totalAmount);
  document.getElementById('forexTotalTransactions').textContent = totalTransactions;
}

// Set up event listeners
function setupEventListeners() {
  // Add new forex button
  const addBtn = document.getElementById('addForexBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => openForexModal());
  }
  
  // Download button
  const downloadBtn = document.getElementById('downloadForexBtn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      sheetsAPI.downloadCsv('forex', 'forex_transactions.csv');
    });
  }
  
  // Search functionality
  const searchInput = document.getElementById('searchForex');
  if (searchInput) {
    searchInput.addEventListener('input', handleForexSearch);
  }
  
  // Modal close buttons
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Forex form submission
  const forexForm = document.getElementById('forexForm');
  if (forexForm) {
    forexForm.addEventListener('submit', handleForexFormSubmit);
  }
  
  // Edit and delete buttons (delegated event)
  const forexTable = document.getElementById('forexTable');
  if (forexTable) {
    forexTable.addEventListener('click', handleForexTableActions);
  }
}

// Handle forex search
function handleForexSearch(e) {
  const searchText = e.target.value.toLowerCase();
  const rows = document.querySelectorAll('#forexTable tbody tr');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchText) ? '' : 'none';
  });
}

// Open forex modal
function openForexModal(forex = null) {
  const modal = document.getElementById('forexModal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('forexForm');
  
  // Reset form
  form.reset();
  
  if (forex) {
    // Edit mode
    modalTitle.textContent = 'Edit Forex Transaction';
    document.getElementById('forexId').value = forex.id;
    document.getElementById('currency').value = forex.currency;
    document.getElementById('amount').value = forex.amount;
    document.getElementById('exchangeRate').value = forex.exchangeRate;
    document.getElementById('transactionDate').value = forex.transactionDate;
    document.getElementById('notes').value = forex.notes || '';
    
    // Calculate and set total amount
    const total = parseFloat(forex.amount) * parseFloat(forex.exchangeRate);
    document.getElementById('totalAmount').value = total.toFixed(2);
  } else {
    // Add mode
    modalTitle.textContent = 'Add New Forex Transaction';
    document.getElementById('forexId').value = '';
    
    // Set transaction date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;
  }
  
  // Show modal
  modal.style.display = 'block';
}

// Calculate total amount when amount or exchange rate changes
function calculateTotalAmount() {
  const amount = parseFloat(document.getElementById('amount').value) || 0;
  const rate = parseFloat(document.getElementById('exchangeRate').value) || 0;
  const totalAmount = document.getElementById('totalAmount');
  
  totalAmount.value = (amount * rate).toFixed(2);
}

// Close all modals
function closeAllModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

// Handle forex form submission
async function handleForexFormSubmit(e) {
  e.preventDefault();
  
  // Get form data
  const forexId = document.getElementById('forexId').value;
  
  const forexData = {
    currency: document.getElementById('currency').value,
    amount: parseFloat(document.getElementById('amount').value),
    exchangeRate: parseFloat(document.getElementById('exchangeRate').value),
    totalAmount: parseFloat(document.getElementById('totalAmount').value),
    transactionDate: document.getElementById('transactionDate').value,
    notes: document.getElementById('notes').value
  };
  
  try {
    let result;
    
    if (forexId) {
      // Update existing forex
      forexData.id = forexId;
      result = await sheetsAPI.updateRecord('forex', forexData);
    } else {
      // Add new forex
      result = await sheetsAPI.addRecord('forex', forexData);
    }
    
    if (result.success) {
      // Reload forex data
      await loadForexData();
      closeAllModals();
    } else {
      alert(`Error: ${result.error || 'Failed to save forex data'}`);
    }
  } catch (error) {
    console.error('Error saving forex data:', error);
    alert('An error occurred while saving forex data');
  }
}

// Handle forex table actions (edit, delete)
async function handleForexTableActions(e) {
  const target = e.target.closest('button');
  if (!target) return;
  
  const row = target.closest('tr');
  const forexId = row.dataset.id;
  
  if (target.classList.contains('edit')) {
    // Edit forex
    try {
      const forexes = await sheetsAPI.getRecords('forex');
      const forex = forexes.find(f => f.id === forexId);
      if (forex) {
        openForexModal(forex);
      }
    } catch (error) {
      console.error('Error fetching forex data for edit:', error);
    }
  } else if (target.classList.contains('delete')) {
    // Delete forex - show confirmation
    const confirmModal = document.getElementById('confirmationModal');
    const confirmBtn = document.getElementById('confirmDelete');
    
    // Set up delete confirmation
    confirmBtn.onclick = async () => {
      try {
        const result = await sheetsAPI.deleteRecord('forex', forexId);
        if (result.success) {
          await loadForexData();
          closeAllModals();
        } else {
          alert(`Error: ${result.error || 'Failed to delete forex transaction'}`);
        }
      } catch (error) {
        console.error('Error deleting forex:', error);
        alert('An error occurred while deleting the forex transaction');
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