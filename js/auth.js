// Authentication Module

// Check if user is logged in
function checkAuth() {
  // Skip auth check on login page
  if (window.location.pathname.includes('index.html')) return;
  
  const isLoggedIn = sessionStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = window.location.pathname.includes('/services/') ? '../index.html' : 'index.html';
  }
}

// Handle login form submission
function setupLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('loginError');
    
    // Hardcoded credentials
    if (email === 'qtholidays@gmail.com' && password === 'fatema1422') {
      sessionStorage.setItem('isLoggedIn', 'true');
      window.location.href = 'dashboard.html';
    } else {
      errorMsg.textContent = 'Invalid Email or Password.';
      
      // Add animation
      errorMsg.style.animation = 'none';
      setTimeout(() => {
        errorMsg.style.animation = 'shake 0.5s';
      }, 10);
    }
  });
}

// Setup logout functionality
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;
  
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('isLoggedIn');
    const baseUrl = window.location.pathname.includes('/services/') ? '../' : '';
    window.location.href = `${baseUrl}index.html`;
  });
}

// Setup mobile sidebar toggle
function setupSidebar() {
  const toggleBtn = document.querySelector('.toggle-sidebar');
  const sidebar = document.querySelector('.sidebar');
  
  if (!toggleBtn || !sidebar) return;
  
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        e.target !== toggleBtn) {
      sidebar.classList.remove('active');
    }
  });
}

// Add shake animation to CSS
function addShakeAnimation() {
  if (!document.querySelector('#shakeAnimation')) {
    const style = document.createElement('style');
    style.id = 'shakeAnimation';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize authentication
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupLoginForm();
  setupLogout();
  setupSidebar();
  addShakeAnimation();
});