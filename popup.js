// Production-grade Popup Manager with modular architecture
class PopupManager {
  constructor() {
    this.userData = {};
    this.currentTab = 'profile';
    this.isCompactMode = false;
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing AI Job Assistant...');
      
      await this.loadUserData();
      this.setupEventListeners();
      this.setupTabNavigation();
      this.populateFields();
      this.updateUI();
      
      console.log('✅ Initialization complete');
    } catch (error) {
      console.error('❌ Initialization failed:', error);
      this.showNotification('Failed to initialize application', 'error');
    }
  }

  // ==========================================
  // Data Management
  // ==========================================
  
  async loadUserData() {
    try {
      const result = await chrome.storage.local.get([
        'userData',
        'aiConfig', 
        'applications',
        'preferences'
      ]);
      
      this.userData = result.userData || {};
      this.aiConfig = result.aiConfig || {};
      this.applications = result.applications || [];
      this.preferences = result.preferences || { compactMode: false };
      
      console.log('📊 Data loaded:', {
        userData: Object.keys(this.userData).length,
        applications: this.applications.length
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async saveUserData() {
    try {
      await chrome.storage.local.set({
        userData: this.userData,
        aiConfig: this.aiConfig,
        applications: this.applications,
        preferences: this.preferences
      });
      
      this.showNotification('Data saved successfully', 'success');
      console.log('💾 Data saved');
    } catch (error) {
      console.error('Failed to save data:', error);
      this.showNotification('Failed to save data', 'error');
    }
  }

  // ==========================================
  // Event Listeners
  // ==========================================
  
  setupEventListeners() {
    // Form inputs with auto-save
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => this.handleInputChange(e));
      input.addEventListener('blur', (e) => this.handleInputChange(e));
    });

    // Action buttons
    this.bindButton('fillFormsBtn', () => this.fillCurrentPageForm());
    this.bindButton('saveDataBtn', () => this.saveUserData());

    // Settings
    this.bindCheckbox('compactMode', (checked) => this.toggleCompactMode(checked));
    this.bindCheckbox('autoFill', (checked) => this.toggleAutoFill(checked));
    this.bindCheckbox('saveLocally', (checked) => this.toggleLocalSave(checked));

    // AI Configuration
    this.bindSelect('aiProvider', (value) => this.handleAIProviderChange(value));
    this.bindInput('apiKey', (value) => this.handleAPIKeyChange(value));

    console.log('🎯 Event listeners initialized');
  }

  setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tabId = item.dataset.tab;
        if (tabId) {
          this.switchTab(tabId);
        }
      });
    });

    // Sidebar hover effects for tooltips
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      this.setupSidebarInteractions(sidebar);
    }
  }

  setupSidebarInteractions(sidebar) {
    let hoverTimeout;
    
    sidebar.addEventListener('mouseenter', () => {
      clearTimeout(hoverTimeout);
      sidebar.classList.remove('collapsed');
    });
    
    sidebar.addEventListener('mouseleave', () => {
      hoverTimeout = setTimeout(() => {
        if (!this.isCompactMode) {
          sidebar.classList.add('collapsed');
        }
      }, 300);
    });
  }

  // ==========================================
  // Tab Management
  // ==========================================
  
  switchTab(tabId) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
      content.classList.remove('active');
    });
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
      targetTab.classList.remove('hidden');
      targetTab.classList.add('active');
    }

    this.currentTab = tabId;
    console.log(`📋 Switched to ${tabId} tab`);

    // Load tab-specific data
    this.loadTabData(tabId);
  }

  async loadTabData(tabId) {
    switch (tabId) {
      case 'applications':
        await this.loadApplicationStats();
        break;
      case 'settings':
        this.updateAIStatus();
        break;
      default:
        break;
    }
  }

  // ==========================================
  // Form Handling
  // ==========================================
  
  handleInputChange(event) {
    const { id, value, type, checked } = event.target;
    
    if (type === 'checkbox') {
      this.userData[id] = checked;
    } else {
      this.userData[id] = value;
    }

    // Auto-save after a short delay
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveUserData();
    }, 1000);
  }

  populateFields() {
    Object.entries(this.userData).forEach(([key, value]) => {
      const element = document.getElementById(key);
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    });

    console.log('📝 Form fields populated');
  }

  // ==========================================
  // AI Integration
  // ==========================================
  
  handleAIProviderChange(provider) {
    this.aiConfig.provider = provider;
    this.updateAIStatus();
    
    // Show relevant help text
    const helps = document.querySelectorAll('[id$="Help"]');
    helps.forEach(help => help.style.display = 'none');
    
    if (provider) {
      const helpElement = document.getElementById(`${provider}Help`);
      if (helpElement) {
        helpElement.style.display = 'block';
      }
    }
  }

  handleAPIKeyChange(apiKey) {
    this.aiConfig.apiKey = apiKey;
    this.updateAIStatus();
  }

  updateAIStatus() {
    const statusElements = document.querySelectorAll('.ai-status');
    const hasProvider = this.aiConfig.provider;
    const hasApiKey = this.aiConfig.apiKey && this.aiConfig.apiKey.length > 10;
    
    statusElements.forEach(element => {
      if (hasProvider && hasApiKey) {
        element.classList.remove('disconnected');
        element.classList.add('connected');
        element.textContent = `AI Provider: ${this.aiConfig.provider.toUpperCase()} Connected`;
      } else {
        element.classList.remove('connected');
        element.classList.add('disconnected');
        element.textContent = 'AI Provider: Not Connected';
      }
    });
  }

  // ==========================================
  // Form Filling
  // ==========================================
  
  async fillCurrentPageForm() {
    try {
      console.log('🎯 Starting form fill...');
      
      const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!activeTab) {
        throw new Error('No active tab found');
      }

      // Inject content script and fill forms
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: this.injectFormFiller,
        args: [this.userData]
      });

      this.showNotification('Forms filled successfully!', 'success');
      
      // Track application if on a job site
      this.trackApplicationIfJobSite(activeTab.url);
      
    } catch (error) {
      console.error('Form filling failed:', error);
      this.showNotification('Failed to fill forms', 'error');
    }
  }

  injectFormFiller(userData) {
    // This function runs in the page context
    const fieldsMap = {
      // Name fields
      'first-name': userData.firstName,
      'last-name': userData.lastName,
      'full-name': `${userData.firstName} ${userData.lastName}`,
      
      // Contact fields
      'email': userData.email,
      'phone': userData.phone,
      'location': userData.location,
      
      // URLs
      'linkedin': userData.linkedin,
      'github': userData.github,
      'portfolio': userData.website,
      
      // Experience
      'current-role': userData.currentRole,
      'current-company': userData.currentCompany,
      'experience': userData.experience,
      'salary': userData.currentSalary,
      'skills': userData.skills,
      'summary': userData.summary
    };

    let filledCount = 0;

    // Find and fill form fields
    Object.entries(fieldsMap).forEach(([fieldType, value]) => {
      if (!value) return;

      const selectors = [
        `[name*="${fieldType}"]`,
        `[id*="${fieldType}"]`,
        `[placeholder*="${fieldType}"]`,
        `[aria-label*="${fieldType}"]`
      ];

      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (element.type !== 'hidden' && !element.value) {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
          }
        });
      });
    });

    console.log(`Filled ${filledCount} form fields`);
    return filledCount;
  }

  // ==========================================
  // Application Tracking
  // ==========================================
  
  trackApplicationIfJobSite(url) {
    const jobSites = [
      'linkedin.com',
      'indeed.com',
      'glassdoor.com',
      'monster.com',
      'ziprecruiter.com',
      'dice.com',
      'stackoverflow.com/jobs'
    ];

    const isJobSite = jobSites.some(site => url.includes(site));
    
    if (isJobSite) {
      this.addApplication({
        url,
        company: 'Unknown',
        position: 'Unknown',
        date: new Date().toISOString(),
        status: 'applied'
      });
    }
  }

  addApplication(application) {
    this.applications.push({
      id: Date.now(),
      ...application
    });
    
    this.saveUserData();
    this.updateApplicationStats();
  }

  async loadApplicationStats() {
    const stats = {
      total: this.applications.length,
      pending: this.applications.filter(app => app.status === 'applied').length,
      interviews: this.applications.filter(app => app.status === 'interview').length,
      rejected: this.applications.filter(app => app.status === 'rejected').length
    };

    // Update stat displays
    this.updateElement('totalApplications', stats.total);
    this.updateElement('pendingApplications', stats.pending);
    this.updateElement('interviewApplications', stats.interviews);
    this.updateElement('rejectedApplications', stats.rejected);
  }

  updateApplicationStats() {
    if (this.currentTab === 'applications') {
      this.loadApplicationStats();
    }
  }

  // ==========================================
  // UI Helpers
  // ==========================================
  
  toggleCompactMode(enabled) {
    this.isCompactMode = enabled;
    this.preferences.compactMode = enabled;
    
    document.body.classList.toggle('compact-mode', enabled);
    
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed', !enabled);
    }
    
    this.saveUserData();
  }

  toggleAutoFill(enabled) {
    this.preferences.autoFill = enabled;
    this.saveUserData();
  }

  toggleLocalSave(enabled) {
    this.preferences.saveLocally = enabled;
    this.saveUserData();
  }

  updateUI() {
    // Apply compact mode if enabled
    if (this.preferences.compactMode) {
      this.toggleCompactMode(true);
    }
    
    // Update application stats
    this.updateApplicationStats();
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} fixed top-4 right-4 z-toast min-w-64`;
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
        </svg>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // ==========================================
  // Utility Methods
  // ==========================================
  
  bindButton(id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', handler);
    }
  }

  bindInput(id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', (e) => handler(e.target.value));
    }
  }

  bindSelect(id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', (e) => handler(e.target.value));
    }
  }

  bindCheckbox(id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', (e) => handler(e.target.checked));
    }
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }
}

// Initialize the popup manager when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.popupManager = new PopupManager();
  });
} else {
  window.popupManager = new PopupManager();
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PopupManager;
}
