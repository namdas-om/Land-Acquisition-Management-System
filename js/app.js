window.App = {
  currentModule: 'dashboard',
  modules: ['dashboard', 'parcels', 'workflow', 'stakeholders', 'documents', 'finance', 'notifications', 'map', 'reports', 'auth'],
  
  // Initialize app
  init() {
    this.setupTheme();
    this.setupSidebar();
    this.setupNotificationBell();
    this.setupSearch();
    this.setupKineticPhysics();
    
    if (window.Auth) {
      Auth.init();
    }
    
    // Check URL hash for direct routing (default to 'auth' login page)
    const hash = window.location.hash.replace('#', '');
    if (hash && this.modules.includes(hash)) {
      this.navigateTo(hash);
    } else {
      this.navigateTo('auth');
    }

    // Handle back/forward navigation
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.replace('#', '');
      if (newHash && newHash !== this.currentModule && this.modules.includes(newHash)) {
        this.navigateTo(newHash, false);
      }
    });
  },

  // Setup Theme Switcher (OLED Dark Mode default)
  setupTheme() {
    const themeBtn = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('nlams_theme') || 'dark';
    
    this.setTheme(savedTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
      });
    }
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nlams_theme', theme);

    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.innerHTML = theme === 'dark' ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
      themeBtn.title = `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`;
      if (window.lucide) lucide.createIcons();
    }

    if (window.ChartUtils) {
      ChartUtils.applyDefaults();
    }
  },

  // Setup 3D Kinetic Micro-Interactions & Cursor Physics
  setupKineticPhysics() {
    let ticking = false;
    document.addEventListener('mousemove', (e) => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const cards = document.querySelectorAll('.kpi-card, .kinetic-card, .glass-panel, .card');
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        const windowH = window.innerHeight;

        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          if (rect.top > windowH || rect.bottom < 0) return;
          const cardCenterX = rect.left + rect.width / 2;
          const cardCenterY = rect.top + rect.height / 2;
          const deltaX = mouseX - cardCenterX;
          const deltaY = mouseY - cardCenterY;
          const dist = Math.hypot(deltaX, deltaY);

          if (dist < 350) {
            const tiltX = (deltaY / (rect.height / 2)) * -5;
            const tiltY = (deltaX / (rect.width / 2)) * 5;
            const specularX = Math.round(50 + (deltaX / rect.width) * 35);
            const specularY = Math.round(50 + (deltaY / rect.height) * 35);

            card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg) translateY(-2px)`;
            card.style.backgroundImage = `radial-gradient(circle at ${specularX}% ${specularY}%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 75%)`;
          } else if (card.style.transform !== '') {
            card.style.transform = '';
            card.style.backgroundImage = '';
          }
        });
        ticking = false;
      });
    });
  },
  
  // Setup sidebar navigation
  setupSidebar() {
    const navItems = document.querySelectorAll('.sidebar-nav a[data-module]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const moduleName = item.getAttribute('data-module');
        this.navigateTo(moduleName);
      });
    });

    // Mobile menu toggle
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
      });
    }
  },
  
  // Navigate to a module
  navigateTo(moduleName, updateHash = true) {
    if (!this.modules.includes(moduleName)) return;
    
    this.currentModule = moduleName;
    
    // Update active sidebar item
    document.querySelectorAll('.sidebar-nav a[data-module]').forEach(item => {
      if (item.getAttribute('data-module') === moduleName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Clear #module-content
    const container = document.getElementById('module-content');
    if (!container) return;
    
    container.innerHTML = '<div class="loading-spinner"></div>';
    
    // Update URL hash
    if (updateHash) {
      window.history.pushState(null, null, `#${moduleName}`);
    }
    
    // Update page title
    const headerTitle = document.getElementById('header-title');
    if (headerTitle) {
      headerTitle.textContent = moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace('-', ' ');
    }
    
    // Close mobile sidebar if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('active');
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Call the module's render function (with a small timeout to allow UI update/spinner to show)
    setTimeout(() => {
      container.innerHTML = ''; // clear spinner
      
      try {
        switch(moduleName) {
          case 'dashboard': if (window.Dashboard) Dashboard.render(container); break;
          case 'parcels': if (window.Parcels) Parcels.render(container); break;
          case 'workflow': if (window.Workflow) Workflow.render(container); break;
          case 'stakeholders': if (window.Stakeholders) Stakeholders.render(container); break;
          case 'documents': if (window.Documents) Documents.render(container); break;
          case 'finance': if (window.Finance) Finance.render(container); break;
          case 'notifications': if (window.Notifications) Notifications.render(container); break;
          case 'map': if (window.MapView) MapView.render(container); break;
          case 'reports': if (window.Reports) Reports.render(container); break;
          case 'auth': if (window.Auth && typeof Auth.renderPage === 'function') Auth.renderPage(container); break;
          default: container.innerHTML = '<h2>Module Under Construction</h2>';
        }
      } catch (err) {
        console.error(`Error rendering module ${moduleName}:`, err);
        container.innerHTML = `<div class="error-state">Failed to load ${moduleName}</div>`;
      }
    }, 50);
  },
  
  // Setup notification bell
  setupNotificationBell() {
    const bellBtn = document.getElementById('notification-bell');
    const badge = document.getElementById('notification-badge');
    const panel = document.getElementById('notification-panel');
    
    if (!bellBtn || !window.AppData) return;
    
    // Update badge count
    const unreadCount = window.AppData.notifications.filter(n => !n.isRead).length;
    if (badge) {
      badge.textContent = unreadCount;
      badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (panel) {
        panel.classList.toggle('active');
      } else {
        // Navigate to notifications page if no panel exists
        this.navigateTo('notifications');
      }
    });

    // Close panel on outside click
    document.addEventListener('click', (e) => {
      if (panel && panel.classList.contains('active') && !bellBtn.contains(e.target) && !panel.contains(e.target)) {
        panel.classList.remove('active');
      }
    });
  },
  
  // Setup global search
  setupSearch() {
    const searchInput = document.getElementById('global-search');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults || !window.AppData) return;
    
    const performSearch = this.debounce((query) => {
      query = query.toLowerCase().trim();
      searchResults.innerHTML = '';
      
      if (query.length < 2) {
        searchResults.classList.remove('active');
        return;
      }
      
      // Search Parcels
      const pResults = window.AppData.parcels.filter(p => 
        p.id.toLowerCase().includes(query) || 
        p.village.toLowerCase().includes(query) || 
        p.district.toLowerCase().includes(query)
      ).slice(0, 3);
      
      // Search Owners
      const oResults = window.AppData.owners.filter(o => 
        o.name.toLowerCase().includes(query) || 
        o.id.toLowerCase().includes(query)
      ).slice(0, 3);
      
      let html = '';
      
      if (pResults.length > 0) {
        html += `<div class="search-section"><h4>Parcels</h4>`;
        pResults.forEach(p => {
          html += `<div class="search-item" onclick="App.navigateTo('parcels')">
            <span class="search-id">${p.id}</span> - ${p.village}, ${p.district}
          </div>`;
        });
        html += `</div>`;
      }
      
      if (oResults.length > 0) {
        html += `<div class="search-section"><h4>Stakeholders</h4>`;
        oResults.forEach(o => {
          html += `<div class="search-item" onclick="App.navigateTo('stakeholders')">
            <span class="search-id">${o.id}</span> - ${o.name}
          </div>`;
        });
        html += `</div>`;
      }
      
      if (html === '') {
        html = '<div class="search-empty">No results found</div>';
      }
      
      searchResults.innerHTML = html;
      searchResults.classList.add('active');
    }, 300);
    
    searchInput.addEventListener('input', (e) => performSearch(e.target.value));
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
      }
    });
  },
  
  // Utility: show a toast notification
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';
    
    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">${message}</div>
      <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    });
    
    // Auto dismiss
    setTimeout(() => {
      if (toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
      }
    }, 3000);
  },
  
  // Utility: format date (DD/MM/YYYY)
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  },
  
  // Utility: format relative time
  timeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) {
      if (Math.floor(interval) === 1) return "yesterday";
      return Math.floor(interval) + " days ago";
    }
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  },
  
  // Utility: generate unique ID
  generateId(prefix = 'ID') {
    return `${prefix}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
  },
  
  // Utility: debounce function
  debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  },
  
  // Show confirmation dialog
  showConfirm(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay active';
    
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary cancel-btn">Cancel</button>
        <button class="btn btn-primary confirm-btn">Confirm</button>
      </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    const cleanup = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    };
    
    dialog.querySelector('.cancel-btn').addEventListener('click', cleanup);
    dialog.querySelector('.confirm-btn').addEventListener('click', () => {
      cleanup();
      if (typeof onConfirm === 'function') onConfirm();
    });
  },
  
  // Animate counter with smooth cubic easing
  animateCounter(element, target, isCurr = false, isPct = false) {
    if (!element || isNaN(target)) return;
    const duration = 800;
    const startTime = performance.now();
    const startVal = 0;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = startVal + (target - startVal) * easeProgress;

      let displayStr = Math.floor(currentVal).toLocaleString('en-IN');
      if (isCurr) {
        displayStr = `₹${(currentVal / 10000000).toFixed(1)} Cr`;
      } else if (isPct) {
        displayStr = `${Math.floor(currentVal)}%`;
      }

      element.textContent = displayStr;
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.App.init();
});
