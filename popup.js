// Enhanced Popup Manager with Better UI and Proper Tab Handling
class PopupManager {
  constructor() {
    this.userData = null;
    this.aiConfig = null;
    this.applications = [];
    this.currentTab = 'profile';
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    try {
      console.log('Initializing popup...');
      
      // Load data first
      await this.loadAllData();
      
      // Setup UI
      this.setupEventListeners();
      this.setupTabs();
      
      // Populate forms with loaded data
      this.populateAllForms();
      
      // Update AI status
      this.updateAIStatus();
      
      console.log('Popup initialized successfully');
    } catch (error) {
      console.error('Initialization error:', error);
      this.showMessage('Failed to initialize popup', 'error');
    }
  }

  async loadAllData() {
    try {
      console.log('Loading data...');
      
      // Load all data in parallel
      const [userDataResponse, aiConfigResponse, applicationsResponse] = await Promise.all([
        this.sendMessage({ action: 'getUserData' }),
        this.sendMessage({ action: 'getAIConfig' }),
        this.sendMessage({ action: 'getApplications' })
      ]);

      // Set data with defaults if loading fails
      this.userData = userDataResponse?.success ? userDataResponse.data : this.getDefaultUserData();
      this.aiConfig = aiConfigResponse?.success ? aiConfigResponse.data : this.getDefaultAIConfig();
      this.applications = applicationsResponse?.success ? applicationsResponse.data : [];
      
      console.log('Data loaded:', { 
        userData: !!this.userData, 
        aiConfig: !!this.aiConfig, 
        appsCount: this.applications.length 
      });
    } catch (error) {
      console.error('Data loading error:', error);
      // Set defaults on error
      this.userData = this.getDefaultUserData();
      this.aiConfig = this.getDefaultAIConfig();
      this.applications = [];
    }
  }

  getDefaultUserData() {
    return {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      experience: [],
      education: [],
      skills: [],
      preferences: {
        autoFill: true,
        saveApplications: true,
        showNotifications: true
      }
    };
  }

  getDefaultAIConfig() {
    return {
      provider: 'openai',
      apiKey: '',
      enableCoverLetterGeneration: false,
      enableInterviewPrep: false,
      autoGenerateCoverLetters: false
    };
  }

  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Add ripple effects to all buttons
    if (typeof UIEnhancements !== 'undefined') {
      document.querySelectorAll('.btn').forEach(button => {
        UIEnhancements.addRippleEffect(button);
      });
    }

    // Profile form
    const saveProfileBtn = document.getElementById('saveProfile');
    if (saveProfileBtn) {
      saveProfileBtn.addEventListener('click', () => this.saveProfile());
    }

    const fillFormBtn = document.getElementById('fillForm');
    if (fillFormBtn) {
      fillFormBtn.addEventListener('click', () => this.fillForm());
    }

    // Skills management
    const addSkillBtn = document.getElementById('addSkill');
    if (addSkillBtn) {
      addSkillBtn.addEventListener('click', () => this.addSkill());
    }

    const skillInput = document.getElementById('skillInput');
    if (skillInput) {
      skillInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addSkill();
        }
      });
    }

    // Experience and Education
    const addExperienceBtn = document.getElementById('addExperience');
    if (addExperienceBtn) {
      addExperienceBtn.addEventListener('click', () => this.addExperience());
    }

    const addEducationBtn = document.getElementById('addEducation');
    if (addEducationBtn) {
      addEducationBtn.addEventListener('click', () => this.addEducation());
    }

    // AI Configuration
    const aiProviderSelect = document.getElementById('aiProvider');
    if (aiProviderSelect) {
      aiProviderSelect.addEventListener('change', () => this.updateAIProviderHelp());
    }

    const enableAICheckbox = document.getElementById('enableAI');
    if (enableAICheckbox) {
      enableAICheckbox.addEventListener('change', (e) => {
        this.toggleAIFeatures(e.target.checked);
        if (e.target.checked) {
          this.saveAIConfig();
        }
      });
    }

    const apiKeyInput = document.getElementById('apiKey');
    if (apiKeyInput) {
      apiKeyInput.addEventListener('input', () => {
        this.updateAIStatus();
      });
    }

    // AI Actions
    const generateCoverLetterBtn = document.getElementById('generateCoverLetter');
    if (generateCoverLetterBtn) {
      generateCoverLetterBtn.addEventListener('click', () => this.generateCoverLetter());
    }

    const generateInterviewBtn = document.getElementById('generateInterviewQuestions');
    if (generateInterviewBtn) {
      generateInterviewBtn.addEventListener('click', () => this.generateInterviewQuestions());
    }

    // Settings
    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportData());
    }

    const importDataBtn = document.getElementById('importData');
    if (importDataBtn) {
      importDataBtn.addEventListener('click', () => this.importData());
    }

    const clearDataBtn = document.getElementById('clearData');
    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => this.clearData());
    }
  }

  setupTabs() {
    // Ensure the active tab is displayed correctly
    this.switchTab(this.currentTab);
  }

  populateAllForms() {
    console.log('Populating forms...');
    
    // Populate personal information
    if (this.userData?.personalInfo) {
      Object.entries(this.userData.personalInfo).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element && value) {
          element.value = value;
        }
      });
    }

    // Populate skills
    this.displaySkills();

    // Populate experience
    this.displayExperience();

    // Populate education
    this.displayEducation();

    // Populate AI configuration
    this.populateAIConfig();

    // Populate applications
    this.displayApplications();
  }

  populateAIConfig() {
    if (!this.aiConfig) return;

    const providerSelect = document.getElementById('aiProvider');
    const apiKeyInput = document.getElementById('apiKey');
    const enableAICheckbox = document.getElementById('enableAI');
    const enableCoverLettersCheckbox = document.getElementById('enableCoverLetters');
    const enableInterviewPrepCheckbox = document.getElementById('enableInterviewPrep');

    if (providerSelect) {
      providerSelect.value = this.aiConfig.provider || 'openai';
    }
    
    if (apiKeyInput) {
      apiKeyInput.value = this.aiConfig.apiKey || '';
    }
    
    const hasApiKey = this.aiConfig.apiKey && this.aiConfig.apiKey.length > 0;
    
    if (enableAICheckbox) {
      enableAICheckbox.checked = hasApiKey;
    }
    
    if (enableCoverLettersCheckbox) {
      enableCoverLettersCheckbox.checked = this.aiConfig.enableCoverLetterGeneration || false;
    }
    
    if (enableInterviewPrepCheckbox) {
      enableInterviewPrepCheckbox.checked = this.aiConfig.enableInterviewPrep || false;
    }

    this.toggleAIFeatures(hasApiKey);
    this.updateAIProviderHelp();
    this.updateAIStatus();
  }

  updateAIProviderHelp() {
    const provider = document.getElementById('aiProvider')?.value;
    const openaiHelp = document.getElementById('openaiHelp');
    const geminiHelp = document.getElementById('geminiHelp');

    if (provider === 'gemini') {
      if (openaiHelp) openaiHelp.style.display = 'none';
      if (geminiHelp) geminiHelp.style.display = 'inline';
    } else {
      if (openaiHelp) openaiHelp.style.display = 'inline';
      if (geminiHelp) geminiHelp.style.display = 'none';
    }
  }

  toggleAIFeatures(enabled) {
    const aiFeatures = document.getElementById('aiFeatures');
    if (aiFeatures) {
      aiFeatures.style.display = enabled ? 'block' : 'none';
    }
  }

  updateAIStatus() {
    const apiKey = document.getElementById('apiKey')?.value;
    const provider = document.getElementById('aiProvider')?.value || 'openai';
    const statusElement = document.getElementById('aiStatus');

    if (!statusElement) return;

    const hasApiKey = apiKey && apiKey.length > 0;
    const statusText = hasApiKey ? 
      `AI Provider: ${provider.toUpperCase()} Connected` : 
      'AI Provider: Not Connected';

    statusElement.className = `ai-status ${hasApiKey ? 'connected' : 'disconnected'}`;
    statusElement.innerHTML = `
      <div class="ai-status-icon"></div>
      <span>${statusText}</span>
    `;
  }

  displaySkills() {
    const skillsContainer = document.getElementById('skillsContainer');
    if (!skillsContainer) return;

    skillsContainer.innerHTML = '';

    if (this.userData?.skills && this.userData.skills.length > 0) {
      this.userData.skills.forEach((skill, index) => {
        const skillTag = document.createElement('div');
        skillTag.className = 'skill-tag';
        skillTag.innerHTML = `
          ${skill}
          <button class="remove-btn" onclick="popupManager.removeSkill(${index})">×</button>
        `;
        skillsContainer.appendChild(skillTag);
      });
    }
  }

  displayExperience() {
    const experienceList = document.getElementById('experienceList');
    if (!experienceList) return;

    experienceList.innerHTML = '';

    if (this.userData?.experience && this.userData.experience.length > 0) {
      this.userData.experience.forEach((exp, index) => {
        const expElement = document.createElement('div');
        expElement.className = 'experience-item';
        expElement.innerHTML = `
          <div class="experience-header">
            <div>
              <div class="experience-title">${exp.position || 'Position'}</div>
              <div class="experience-company">${exp.company || 'Company'}</div>
              <div class="experience-date">${exp.startDate || ''} - ${exp.endDate || 'Present'}</div>
            </div>
          </div>
          <div style="margin-top: 8px; color: #6b7280; font-size: 13px;">
            ${exp.description || 'No description'}
          </div>
          <button class="remove-item-btn" onclick="popupManager.removeExperience(${index})">×</button>
        `;
        experienceList.appendChild(expElement);
      });
    }
  }

  displayEducation() {
    const educationList = document.getElementById('educationList');
    if (!educationList) return;

    educationList.innerHTML = '';

    if (this.userData?.education && this.userData.education.length > 0) {
      this.userData.education.forEach((edu, index) => {
        const eduElement = document.createElement('div');
        eduElement.className = 'education-item';
        eduElement.innerHTML = `
          <div class="education-header">
            <div>
              <div class="experience-title">${edu.degree || 'Degree'}</div>
              <div class="experience-company">${edu.institution || 'Institution'}</div>
              <div class="experience-date">${edu.graduationDate || ''}</div>
            </div>
          </div>
          <div style="margin-top: 8px; color: #6b7280; font-size: 13px;">
            GPA: ${edu.gpa || 'N/A'}
          </div>
          <button class="remove-item-btn" onclick="popupManager.removeEducation(${index})">×</button>
        `;
        educationList.appendChild(eduElement);
      });
    }
  }

  displayApplications() {
    const applicationsList = document.getElementById('applicationsList');
    const totalAppsElement = document.getElementById('totalApps');
    const thisWeekElement = document.getElementById('thisWeek');

    if (!applicationsList) return;

    // Update stats
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekCount = this.applications.filter(app => 
      new Date(app.createdDate || app.appliedDate) >= oneWeekAgo
    ).length;

    if (totalAppsElement) totalAppsElement.textContent = this.applications.length;
    if (thisWeekElement) thisWeekElement.textContent = thisWeekCount;

    if (this.applications && this.applications.length > 0) {
      applicationsList.innerHTML = '';
      
      this.applications.slice(0, 10).forEach((app) => {
        const appElement = document.createElement('div');
        appElement.className = 'application-item';
        appElement.innerHTML = `
          <div class="application-header">
            <div>
              <div class="application-title">${app.title || 'Unknown Position'}</div>
              <div class="application-company">${app.company || 'Unknown Company'}</div>
            </div>
            <span class="status-badge status-${app.status || 'draft'}">${app.status || 'draft'}</span>
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">
            Applied: ${app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : 'Not yet'}
          </div>
        `;
        applicationsList.appendChild(appElement);
      });
    } else {
      applicationsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📄</div>
          <div>No applications yet</div>
          <div style="font-size: 12px; margin-top: 8px;">Fill your first job application to get started</div>
        </div>
      `;
    }
  }

  switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    this.currentTab = tabName;
    
    // Update button states
    document.querySelectorAll('.tab-button').forEach(button => {
      button.classList.toggle('active', button.dataset.tab === tabName);
    });
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === tabName);
    });
  }

  async saveProfile() {
    const saveBtn = document.getElementById('saveProfile');
    let loadingOverlay = null;
    
    try {
      // Show loading state
      if (saveBtn && typeof UIEnhancements !== 'undefined') {
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
        loadingOverlay = UIEnhancements.showLoadingOverlay(
          saveBtn.closest('.action-buttons'), 
          'Saving profile...'
        );
      }

      // Collect form data
      const personalInfo = {};
      const fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'linkedinUrl', 'portfolioUrl'];
      
      fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
          personalInfo[field] = element.value.trim();
        }
      });

      // Update userData
      this.userData.personalInfo = personalInfo;
      
      const response = await this.sendMessage({
        action: 'saveUserData',
        data: this.userData
      });

      if (response?.success) {
        this.showMessage('Profile saved successfully!', 'success');
      } else {
        throw new Error(response?.error || 'Failed to save profile');
      }
    } catch (error) {
      console.error('Save profile error:', error);
      this.showMessage('Failed to save profile: ' + error.message, 'error');
    } finally {
      // Hide loading state
      if (saveBtn) {
        saveBtn.classList.remove('loading');
        saveBtn.disabled = false;
      }
      if (loadingOverlay && typeof UIEnhancements !== 'undefined') {
        UIEnhancements.hideLoadingOverlay(loadingOverlay.parentElement);
      }
    }
  }

  async saveAIConfig() {
    try {
      const apiKey = document.getElementById('apiKey')?.value?.trim() || '';
      const provider = document.getElementById('aiProvider')?.value || 'openai';
      const enableCoverLetters = document.getElementById('enableCoverLetters')?.checked || false;
      const enableInterviewPrep = document.getElementById('enableInterviewPrep')?.checked || false;

      const aiConfig = {
        provider,
        apiKey,
        enableCoverLetterGeneration: enableCoverLetters,
        enableInterviewPrep: enableInterviewPrep,
        autoGenerateCoverLetters: false
      };

      const response = await this.sendMessage({
        action: 'saveAIConfig',
        config: aiConfig
      });

      if (response?.success) {
        this.aiConfig = aiConfig;
        this.updateAIStatus();
        this.showMessage('AI configuration saved!', 'success');
      } else {
        throw new Error(response?.error || 'Failed to save AI config');
      }
    } catch (error) {
      console.error('Save AI config error:', error);
      this.showMessage('Failed to save AI configuration: ' + error.message, 'error');
    }
  }

  async fillForm() {
    try {
      const response = await this.sendMessage({ action: 'fillForm' });
      if (response?.success) {
        this.showMessage('Form filled successfully!', 'success');
      } else {
        throw new Error(response?.error || 'Failed to fill form');
      }
    } catch (error) {
      console.error('Fill form error:', error);
      this.showMessage('Failed to fill form: ' + error.message, 'error');
    }
  }

  addSkill() {
    const skillInput = document.getElementById('skillInput');
    if (!skillInput) return;

    const skill = skillInput.value.trim();
    if (skill && skill.length > 0) {
      if (!this.userData.skills) {
        this.userData.skills = [];
      }
      
      // Check if skill already exists
      if (!this.userData.skills.includes(skill)) {
        this.userData.skills.push(skill);
        skillInput.value = '';
        this.displaySkills();
        this.saveProfile(); // Auto-save
      } else {
        this.showMessage('Skill already added', 'error');
      }
    }
  }

  removeSkill(index) {
    if (this.userData.skills && index >= 0 && index < this.userData.skills.length) {
      this.userData.skills.splice(index, 1);
      this.displaySkills();
      this.saveProfile(); // Auto-save
    }
  }

  addExperience() {
    // Simple prompt-based addition (could be enhanced with a modal)
    const position = prompt('Position:');
    const company = prompt('Company:');
    const startDate = prompt('Start Date (YYYY-MM):');
    const endDate = prompt('End Date (YYYY-MM or "Present"):');
    const description = prompt('Brief Description:');

    if (position && company) {
      const experience = { position, company, startDate, endDate, description };
      
      if (!this.userData.experience) {
        this.userData.experience = [];
      }
      
      this.userData.experience.unshift(experience);
      this.displayExperience();
      this.saveProfile(); // Auto-save
    }
  }

  removeExperience(index) {
    if (this.userData.experience && index >= 0 && index < this.userData.experience.length) {
      this.userData.experience.splice(index, 1);
      this.displayExperience();
      this.saveProfile(); // Auto-save
    }
  }

  addEducation() {
    const degree = prompt('Degree:');
    const institution = prompt('Institution:');
    const graduationDate = prompt('Graduation Date (YYYY):');
    const gpa = prompt('GPA (optional):');

    if (degree && institution) {
      const education = { degree, institution, graduationDate, gpa };
      
      if (!this.userData.education) {
        this.userData.education = [];
      }
      
      this.userData.education.unshift(education);
      this.displayEducation();
      this.saveProfile(); // Auto-save
    }
  }

  removeEducation(index) {
    if (this.userData.education && index >= 0 && index < this.userData.education.length) {
      this.userData.education.splice(index, 1);
      this.displayEducation();
      this.saveProfile(); // Auto-save
    }
  }

  async generateCoverLetter() {
    try {
      await this.saveAIConfig(); // Ensure config is saved
      
      if (!this.aiConfig.apiKey) {
        this.showMessage('Please enter your API key first', 'error');
        this.switchTab('ai');
        return;
      }

      this.showMessage('Generating cover letter...', 'info');

      // Get current tab info for job context
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const jobInfo = {
        title: 'Software Developer', // This would be extracted from the page
        company: 'Tech Company',
        url: tab.url,
        personalizedReason: 'I am excited about this opportunity'
      };

      const response = await this.sendMessage({
        action: 'generateCoverLetter',
        jobInfo: jobInfo
      });

      if (response?.success) {
        this.showCoverLetterModal(response.data);
      } else {
        throw new Error(response?.error || 'Failed to generate cover letter');
      }
    } catch (error) {
      console.error('Generate cover letter error:', error);
      this.showMessage('Failed to generate cover letter: ' + error.message, 'error');
    }
  }

  async generateInterviewQuestions() {
    try {
      await this.saveAIConfig(); // Ensure config is saved
      
      if (!this.aiConfig.apiKey) {
        this.showMessage('Please enter your API key first', 'error');
        this.switchTab('ai');
        return;
      }

      this.showMessage('Generating interview questions...', 'info');

      const response = await this.sendMessage({
        action: 'generateInterviewQuestions',
        jobTitle: 'Software Developer' // This would be extracted from the page
      });

      if (response?.success) {
        this.showInterviewQuestionsModal(response.data);
      } else {
        throw new Error(response?.error || 'Failed to generate interview questions');
      }
    } catch (error) {
      console.error('Generate interview questions error:', error);
      this.showMessage('Failed to generate interview questions: ' + error.message, 'error');
    }
  }

  showCoverLetterModal(coverLetter) {
    this.createModal('Generated Cover Letter', `
      <div style="max-height: 400px; overflow-y: auto; white-space: pre-wrap; line-height: 1.6; font-size: 14px;">
        ${coverLetter}
      </div>
    `);
  }

  showInterviewQuestionsModal(questions) {
    const questionsHtml = questions.map((q, index) => `
      <div style="margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #4f46e5;">
        <strong>Q${index + 1}:</strong> ${q.question}
        <br><small style="color: #6b7280; margin-top: 4px;">Category: ${q.category}</small>
      </div>
    `).join('');

    this.createModal('Interview Questions', `
      <div style="max-height: 400px; overflow-y: auto;">
        ${questionsHtml}
      </div>
    `);
  }

  createModal(title, content) {
    // Remove existing modal
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
      existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.7); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(4px);
    `;

    modal.innerHTML = `
      <div style="
        background: white; border-radius: 12px; padding: 24px;
        max-width: 600px; width: 90%; max-height: 80vh; overflow: hidden;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #f3f4f6;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f2937;">${title}</h3>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  style="background: #f3f4f6; border: none; border-radius: 6px; width: 32px; height: 32px; cursor: pointer; font-size: 18px; color: #6b7280; display: flex; align-items: center; justify-content: center;">×</button>
        </div>
        ${content}
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    document.body.appendChild(modal);
  }

  async exportData() {
    try {
      const response = await this.sendMessage({ action: 'exportData' });
      if (response?.success) {
        const dataStr = JSON.stringify(response.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `job-extension-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showMessage('Data exported successfully!', 'success');
      } else {
        throw new Error(response?.error || 'Failed to export data');
      }
    } catch (error) {
      console.error('Export data error:', error);
      this.showMessage('Failed to export data: ' + error.message, 'error');
    }
  }

  importData() {
    const input = document.getElementById('importFile');
    if (!input) return;

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          const response = await this.sendMessage({
            action: 'importData',
            data: data
          });

          if (response?.success) {
            await this.loadAllData();
            this.populateAllForms();
            this.showMessage('Data imported successfully!', 'success');
          } else {
            throw new Error(response?.error || 'Failed to import data');
          }
        } catch (error) {
          console.error('Import data error:', error);
          this.showMessage('Invalid file format or import failed', 'error');
        }
      }
    };
    
    input.click();
  }

  async clearData() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        await chrome.storage.local.clear();
        this.userData = this.getDefaultUserData();
        this.aiConfig = this.getDefaultAIConfig();
        this.applications = [];
        this.populateAllForms();
        this.showMessage('All data cleared successfully!', 'success');
      } catch (error) {
        console.error('Clear data error:', error);
        this.showMessage('Failed to clear data: ' + error.message, 'error');
      }
    }
  }

  showMessage(message, type = 'info') {
    // Use the new notification system
    if (typeof notifications !== 'undefined') {
      switch (type) {
        case 'success':
          notifications.success(message);
          break;
        case 'error':
          notifications.error(message);
          break;
        case 'warning':
          notifications.warning(message);
          break;
        default:
          notifications.info(message);
          break;
      }
    } else {
      // Fallback to console if notifications not available
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }

  async sendMessage(message) {
    try {
      return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Runtime error:', chrome.runtime.lastError);
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(response);
          }
        });
      });
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Initialize the popup manager when script loads
const popupManager = new PopupManager();
