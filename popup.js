// Production-grade Popup Manager with modular architecture
class PopupManager {
  constructor() {
    this.userData = {};
    this.currentTab = "profile";
    this.isCompactMode = false;
    this.preferences = { compactMode: false };
    this.init();
  }

  async init() {
    try {
      console.log("🚀 Initializing AI Job Assistant...");

      await this.loadUserData();
      this.setupEventListeners();
      this.setupTabNavigation();
      this.populateFields();
      this.updateUI();

      console.log("✅ Initialization complete");
    } catch (error) {
      console.error("❌ Initialization failed:", error);
      this.showNotification("Failed to initialize application", "error");
    }
  }

  // ==========================================
  // Data Management
  // ==========================================

  async loadUserData() {
    try {
      const result = await chrome.storage.local.get([
        "userData",
        "aiConfig",
        "applications",
        "preferences",
      ]);

      this.userData = result.userData || {};
      this.aiConfig = result.aiConfig || {};
      this.applications = result.applications || [];
      this.preferences = result.preferences || {
        compactMode: false,
        autoFillEnabled: true,
        showSuggestions: true,
        saveNewData: true,
      };

      // Sync the compact mode state
      this.isCompactMode = this.preferences.compactMode;

      console.log("📊 Data loaded:", {
        userData: Object.keys(this.userData).length,
        applications: this.applications.length,
        compactMode: this.preferences.compactMode,
      });
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  }

  async saveUserData() {
    try {
      await chrome.storage.local.set({
        userData: this.userData,
        aiConfig: this.aiConfig,
        applications: this.applications,
        preferences: this.preferences,
      });

      console.log("💾 Data saved:", {
        compactMode: this.preferences.compactMode,
        preferencesCount: Object.keys(this.preferences).length,
      });
      this.showNotification("Data saved successfully", "success");
    } catch (error) {
      console.error("Failed to save data:", error);
      this.showNotification("Failed to save data", "error");
    }
  }

  // ==========================================
  // Event Listeners
  // ==========================================

  setupEventListeners() {
    // Form inputs with auto-save
    const inputs = document.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.addEventListener("input", (e) => this.handleInputChange(e));
      input.addEventListener("blur", (e) => this.handleInputChange(e));
    });

    // Action buttons
    this.bindButton("fillFormsBtn", () => this.fillCurrentPageForm());
    this.bindButton("saveDataBtn", () => this.saveUserData());

    // Settings
    this.bindCheckbox("compactMode", (checked) =>
      this.toggleCompactMode(checked)
    );
    this.bindCheckbox("autoFill", (checked) => this.toggleAutoFill(checked));
    this.bindCheckbox("showSuggestions", (checked) =>
      this.toggleShowSuggestions(checked)
    );
    this.bindCheckbox("saveNewData", (checked) =>
      this.toggleSaveNewData(checked)
    );
    this.bindCheckbox("saveLocally", (checked) =>
      this.toggleLocalSave(checked)
    );

    // AI Configuration
    this.bindSelect("aiProvider", (value) =>
      this.handleAIProviderChange(value)
    );
    this.bindInput("apiKey", (value) => this.handleAPIKeyChange(value));

    // AI Tools
    this.bindButton("generateCoverLetterBtn", () => this.generateCoverLetter());
    this.bindButton("copyCoverLetterBtn", () => this.copyCoverLetter());
    this.bindButton("generateQuestionsBtn", () =>
      this.generateInterviewQuestions()
    );
    this.bindButton("exportQuestionsBtn", () => this.exportQuestions());

    // Experience Management
    this.bindButton("addExperienceBtn", () => this.addExperienceEntry());

    // Education Management
    this.bindButton("addEducationBtn", () => this.addEducationEntry());

    // Data Management
    this.bindButton("exportDataBtn", () => this.exportData());
    this.bindButton("importDataBtn", () => this.importData());
    this.bindButton("clearDataBtn", () => this.clearAllData());

    console.log("🎯 Event listeners initialized");
  }
  // ==========================================

  loadExperienceHistory() {
    const experienceList = document.getElementById("experienceList");

    if (
      this.userData.experienceHistory &&
      this.userData.experienceHistory.length > 0
    ) {
      // Remove the info alert
      const alertInfo = experienceList.querySelector(".alert-info");
      if (alertInfo) {
        alertInfo.remove();
      }

      // Load existing experience entries
      this.userData.experienceHistory.forEach((experience) => {
        this.createExperienceCard(experience, experienceList);
      });
    }
  }

  createExperienceCard(experience, container) {
    const experienceCard = document.createElement("div");
    experienceCard.className = "card";
    experienceCard.id = experience.id;
    experienceCard.innerHTML = `
      <div class="card-content">
        <div class="flex justify-between items-start mb-4">
          <h4 class="text-md font-semibold text-primary">Previous Position</h4>
          <button class="btn btn-ghost btn-sm text-red-600" onclick="window.popupManager.removeExperienceEntry('${
            experience.id
          }')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
            </svg>
            Remove
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Position Title</label>
            <input class="form-input" type="text" placeholder="Software Engineer" data-field="title" value="${
              experience.title || ""
            }"/>
          </div>
          <div class="form-group">
            <label class="form-label">Company Name</label>
            <input class="form-input" type="text" placeholder="Tech Company" data-field="company" value="${
              experience.company || ""
            }"/>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input class="form-input" type="month" data-field="startDate" value="${
              experience.startDate || ""
            }"/>
          </div>
          <div class="form-group">
            <label class="form-label">End Date</label>
            <input class="form-input" type="month" data-field="endDate" value="${
              experience.endDate || ""
            }"/>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Key Responsibilities & Achievements</label>
          <textarea class="form-input form-textarea" placeholder="• Developed and maintained web applications&#10;• Collaborated with cross-functional teams&#10;• Improved system performance by 25%" data-field="description" style="min-height: 80px;">${
            experience.description || ""
          }</textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Technologies Used</label>
          <input class="form-input" type="text" placeholder="React, Node.js, MongoDB, AWS" data-field="technologies" value="${
            experience.technologies || ""
          }"/>
        </div>
      </div>
    `;

    container.appendChild(experienceCard);

    // Add event listeners for the form elements
    const inputs = experienceCard.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("input", (e) =>
        this.handleExperienceChange(experience.id, e)
      );
      input.addEventListener("blur", (e) =>
        this.handleExperienceChange(experience.id, e)
      );
    });
  }

  loadEducationHistory() {
    const educationList = document.getElementById("educationList");

    if (
      this.userData.educationHistory &&
      this.userData.educationHistory.length > 0
    ) {
      // Remove the info alert
      const alertInfo = educationList.querySelector(".alert-info");
      if (alertInfo) {
        alertInfo.remove();
      }

      // Load existing education entries
      this.userData.educationHistory.forEach((education) => {
        this.createEducationCard(education, educationList);
      });
    }
  }

  createEducationCard(education, container) {
    const educationCard = document.createElement("div");
    educationCard.className = "card";
    educationCard.id = education.id;
    educationCard.innerHTML = `
      <div class="card-content">
        <div class="flex justify-between items-start mb-4">
          <h4 class="text-md font-semibold text-primary">Education Entry</h4>
          <button class="btn btn-ghost btn-sm text-red-600" onclick="window.popupManager.removeEducationEntry('${
            education.id
          }')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
            </svg>
            Remove
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Degree/Qualification</label>
            <input class="form-input" type="text" placeholder="Bachelor of Science in Computer Science" data-field="degree" value="${
              education.degree || ""
            }"/>
          </div>
          <div class="form-group">
            <label class="form-label">Institution</label>
            <input class="form-input" type="text" placeholder="University of California" data-field="institution" value="${
              education.institution || ""
            }"/>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="form-group">
            <label class="form-label">Start Year</label>
            <input class="form-input" type="number" placeholder="2016" min="1950" max="2030" data-field="startYear" value="${
              education.startYear || ""
            }"/>
          </div>
          <div class="form-group">
            <label class="form-label">End Year</label>
            <input class="form-input" type="number" placeholder="2020" min="1950" max="2030" data-field="endYear" value="${
              education.endYear || ""
            }"/>
          </div>
          <div class="form-group">
            <label class="form-label">GPA (Optional)</label>
            <input class="form-input" type="text" placeholder="3.8/4.0" data-field="gpa" value="${
              education.gpa || ""
            }"/>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Field of Study</label>
          <input class="form-input" type="text" placeholder="Computer Science" data-field="field" value="${
            education.field || ""
          }"/>
        </div>
        
        <div class="form-group">
          <label class="form-label">Relevant Coursework & Achievements</label>
          <textarea class="form-input form-textarea" placeholder="Data Structures, Algorithms, Machine Learning&#10;Dean's List (2019-2020)&#10;Computer Science Award" data-field="coursework" style="min-height: 80px;">${
            education.coursework || ""
          }</textarea>
        </div>
      </div>
    `;

    container.appendChild(educationCard);

    // Add event listeners for the form elements
    const inputs = educationCard.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("input", (e) =>
        this.handleEducationChange(education.id, e)
      );
      input.addEventListener("blur", (e) =>
        this.handleEducationChange(education.id, e)
      );
    });
  }

  addExperienceEntry() {
    const experienceList = document.getElementById("experienceList");
    const alertInfo = experienceList.querySelector(".alert-info");

    // Remove the info alert if it exists
    if (alertInfo) {
      alertInfo.remove();
    }

    const experienceId = `experience_${Date.now()}`;
    const experienceCard = document.createElement("div");
    experienceCard.className = "card";
    experienceCard.innerHTML = `
      <div class="card-content">
        <div class="flex justify-between items-start mb-4">
          <h4 class="text-md font-semibold text-primary">Previous Position</h4>
          <button class="btn btn-ghost btn-sm text-red-600" onclick="window.popupManager.removeExperienceEntry('${experienceId}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
            </svg>
            Remove
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Position Title</label>
            <input class="form-input" type="text" placeholder="Software Engineer" data-field="title"/>
          </div>
          <div class="form-group">
            <label class="form-label">Company Name</label>
            <input class="form-input" type="text" placeholder="Tech Company" data-field="company"/>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Start Date</label>
            <input class="form-input" type="month" data-field="startDate"/>
          </div>
          <div class="form-group">
            <label class="form-label">End Date</label>
            <input class="form-input" type="month" data-field="endDate"/>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Key Responsibilities & Achievements</label>
          <textarea class="form-input form-textarea" placeholder="• Developed and maintained web applications&#10;• Collaborated with cross-functional teams&#10;• Improved system performance by 25%" data-field="description" style="min-height: 80px;"></textarea>
        </div>
        
        <div class="form-group">
          <label class="form-label">Technologies Used</label>
          <input class="form-input" type="text" placeholder="React, Node.js, MongoDB, AWS" data-field="technologies"/>
        </div>
      </div>
    `;

    experienceCard.id = experienceId;
    experienceList.appendChild(experienceCard);

    // Add event listeners for the new form elements
    const inputs = experienceCard.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("input", (e) =>
        this.handleExperienceChange(experienceId, e)
      );
      input.addEventListener("blur", (e) =>
        this.handleExperienceChange(experienceId, e)
      );
    });

    // Initialize experience data structure
    if (!this.userData.experienceHistory) {
      this.userData.experienceHistory = [];
    }

    this.userData.experienceHistory.push({
      id: experienceId,
      title: "",
      company: "",
      startDate: "",
      endDate: "",
      description: "",
      technologies: "",
    });

    this.showNotification("Experience entry added", "success");
  }

  removeExperienceEntry(experienceId) {
    const experienceCard = document.getElementById(experienceId);
    if (experienceCard) {
      experienceCard.remove();

      // Remove from userData
      if (this.userData.experienceHistory) {
        this.userData.experienceHistory =
          this.userData.experienceHistory.filter(
            (exp) => exp.id !== experienceId
          );
      }

      // If no more experiences, show the info alert
      const experienceList = document.getElementById("experienceList");
      if (experienceList.children.length === 0) {
        experienceList.innerHTML = `
          <div class="alert alert-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
            <div>
              No previous experience added yet. Click "Add Experience" to build your work history.
            </div>
          </div>
        `;
      }

      this.saveUserData();
      this.showNotification("Experience entry removed", "success");
    }
  }

  handleExperienceChange(experienceId, event) {
    const { value } = event.target;
    const field = event.target.dataset.field;

    if (!this.userData.experienceHistory) {
      this.userData.experienceHistory = [];
    }

    // Find the experience entry
    let experienceEntry = this.userData.experienceHistory.find(
      (exp) => exp.id === experienceId
    );
    if (!experienceEntry) {
      experienceEntry = { id: experienceId };
      this.userData.experienceHistory.push(experienceEntry);
    }

    experienceEntry[field] = value;

    // Auto-save after a short delay
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveUserData();
    }, 1000);
  }

  // ==========================================
  // Education Management
  // ==========================================

  addEducationEntry() {
    const educationList = document.getElementById("educationList");
    const alertInfo = educationList.querySelector(".alert-info");

    // Remove the info alert if it exists
    if (alertInfo) {
      alertInfo.remove();
    }

    const educationId = `education_${Date.now()}`;
    const educationCard = document.createElement("div");
    educationCard.className = "card";
    educationCard.innerHTML = `
      <div class="card-content">
        <div class="flex justify-between items-start mb-4">
          <h4 class="text-md font-semibold text-primary">Education Entry</h4>
          <button class="btn btn-ghost btn-sm text-red-600" onclick="window.popupManager.removeEducationEntry('${educationId}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
            </svg>
            Remove
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label class="form-label">Degree/Qualification</label>
            <input class="form-input" type="text" placeholder="Bachelor of Science in Computer Science" data-field="degree"/>
          </div>
          <div class="form-group">
            <label class="form-label">Institution</label>
            <input class="form-input" type="text" placeholder="University of California" data-field="institution"/>
          </div>
        </div>
        
        <div class="grid grid-cols-3 gap-4">
          <div class="form-group">
            <label class="form-label">Start Year</label>
            <input class="form-input" type="number" placeholder="2016" min="1950" max="2030" data-field="startYear"/>
          </div>
          <div class="form-group">
            <label class="form-label">End Year</label>
            <input class="form-input" type="number" placeholder="2020" min="1950" max="2030" data-field="endYear"/>
          </div>
          <div class="form-group">
            <label class="form-label">GPA (Optional)</label>
            <input class="form-input" type="text" placeholder="3.8/4.0" data-field="gpa"/>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Field of Study</label>
          <input class="form-input" type="text" placeholder="Computer Science" data-field="field"/>
        </div>
        
        <div class="form-group">
          <label class="form-label">Relevant Coursework & Achievements</label>
          <textarea class="form-input form-textarea" placeholder="Data Structures, Algorithms, Machine Learning&#10;Dean's List (2019-2020)&#10;Computer Science Award" data-field="coursework" style="min-height: 80px;"></textarea>
        </div>
      </div>
    `;

    educationCard.id = educationId;
    educationList.appendChild(educationCard);

    // Add event listeners for the new form elements
    const inputs = educationCard.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("input", (e) =>
        this.handleEducationChange(educationId, e)
      );
      input.addEventListener("blur", (e) =>
        this.handleEducationChange(educationId, e)
      );
    });

    // Initialize education data structure
    if (!this.userData.educationHistory) {
      this.userData.educationHistory = [];
    }

    this.userData.educationHistory.push({
      id: educationId,
      degree: "",
      institution: "",
      startYear: "",
      endYear: "",
      gpa: "",
      field: "",
      coursework: "",
    });

    this.showNotification("Education entry added", "success");
  }

  removeEducationEntry(educationId) {
    const educationCard = document.getElementById(educationId);
    if (educationCard) {
      educationCard.remove();

      // Remove from userData
      if (this.userData.educationHistory) {
        this.userData.educationHistory = this.userData.educationHistory.filter(
          (edu) => edu.id !== educationId
        );
      }

      // If no more education entries, show the info alert
      const educationList = document.getElementById("educationList");
      if (educationList.children.length === 0) {
        educationList.innerHTML = `
          <div class="alert alert-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
            </svg>
            <div>
              No additional education or certifications added yet. Click "Add Education" to include more qualifications.
            </div>
          </div>
        `;
      }

      this.saveUserData();
      this.showNotification("Education entry removed", "success");
    }
  }

  handleEducationChange(educationId, event) {
    const { value } = event.target;
    const field = event.target.dataset.field;

    if (!this.userData.educationHistory) {
      this.userData.educationHistory = [];
    }

    // Find the education entry
    let educationEntry = this.userData.educationHistory.find(
      (edu) => edu.id === educationId
    );
    if (!educationEntry) {
      educationEntry = { id: educationId };
      this.userData.educationHistory.push(educationEntry);
    }

    educationEntry[field] = value;

    // Auto-save after a short delay
    clearTimeout(this.autoSaveTimeout);
    this.autoSaveTimeout = setTimeout(() => {
      this.saveUserData();
    }, 1000);
  }

  // ==========================================
  // Experience Management
  // ==========================================

  setupTabNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const tabContents = document.querySelectorAll(".tab-content");

    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const tabId = item.dataset.tab;
        if (tabId) {
          this.switchTab(tabId);
        }
      });
    });

    // Sidebar hover effects for tooltips
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      this.setupSidebarInteractions(sidebar);
    }
  }

  setupSidebarInteractions(sidebar) {
    let hoverTimeout;

    sidebar.addEventListener("mouseenter", () => {
      clearTimeout(hoverTimeout);
      sidebar.classList.remove("collapsed");
    });

    sidebar.addEventListener("mouseleave", () => {
      hoverTimeout = setTimeout(() => {
        if (!this.isCompactMode) {
          sidebar.classList.add("collapsed");
        }
      }, 300);
    });
  }

  // ==========================================
  // Tab Management
  // ==========================================

  switchTab(tabId) {
    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabId}"]`)?.classList.add("active");

    // Update active tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.add("hidden");
      content.classList.remove("active");
    });

    const targetTab = document.getElementById(tabId);
    if (targetTab) {
      targetTab.classList.remove("hidden");
      targetTab.classList.add("active");
    }

    this.currentTab = tabId;
    console.log(`📋 Switched to ${tabId} tab`);

    // Load tab-specific data
    this.loadTabData(tabId);
  }

  async loadTabData(tabId) {
    switch (tabId) {
      case "applications":
        await this.loadApplicationStats();
        break;
      case "settings":
        this.updateAIStatus();
        break;
      case "ai-tools":
        this.updateAIStatus();
        break;
      case "experience":
        this.loadExperienceHistory();
        this.loadEducationHistory();
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

    if (type === "checkbox") {
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
        if (element.type === "checkbox") {
          element.checked = value;
        } else {
          element.value = value;
        }
      }
    });

    // Populate preferences
    if (this.preferences) {
      Object.entries(this.preferences).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element && element.type === "checkbox") {
          element.checked = value;
        }
      });
    }

    // Populate AI config
    if (this.aiConfig) {
      Object.entries(this.aiConfig).forEach(([key, value]) => {
        const element = document.getElementById(key);
        if (element) {
          if (element.type === "checkbox") {
            element.checked = value;
          } else {
            element.value = value;
          }
        }
      });
    }

    console.log("📝 Form fields populated");
  }

  // ==========================================
  // AI Integration
  // ==========================================

  handleAIProviderChange(provider) {
    this.aiConfig.provider = provider;
    this.updateAIStatus();

    // Show relevant help text
    const helps = document.querySelectorAll('[id$="Help"]');
    helps.forEach((help) => (help.style.display = "none"));

    if (provider) {
      const helpElement = document.getElementById(`${provider}Help`);
      if (helpElement) {
        helpElement.style.display = "block";
      }
    }
  }

  handleAPIKeyChange(apiKey) {
    this.aiConfig.apiKey = apiKey;
    this.updateAIStatus();
  }

  updateAIStatus() {
    const statusElements = document.querySelectorAll(".ai-status");
    const hasProvider = this.aiConfig.provider;
    const hasApiKey = this.aiConfig.apiKey && this.aiConfig.apiKey.length > 10;

    statusElements.forEach((element) => {
      if (hasProvider && hasApiKey) {
        element.classList.remove("disconnected");
        element.classList.add("connected");
        element.textContent = `AI Provider: ${this.aiConfig.provider.toUpperCase()} Connected`;
      } else {
        element.classList.remove("connected");
        element.classList.add("disconnected");
        element.textContent = "AI Provider: Not Connected";
      }
    });
  }

  // ==========================================
  // Form Filling
  // ==========================================

  async fillCurrentPageForm() {
    try {
      console.log("🎯 Starting form fill...");

      const [activeTab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!activeTab) {
        throw new Error("No active tab found");
      }

      // Inject content script and fill forms
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: function (userData) {
          // This function runs in the page context
          const fieldsMap = {
            // Name fields
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            fullName: `${userData.firstName || ""} ${
              userData.lastName || ""
            }`.trim(),

            // Contact fields
            email: userData.email || "",
            phone: userData.phone || "",
            location: userData.location || "",

            // URLs
            linkedin: userData.linkedin || "",
            github: userData.github || "",
            portfolio: userData.website || "",

            // Experience
            currentRole: userData.currentRole || "",
            currentCompany: userData.currentCompany || "",
            experience: userData.experience || "",
            salary: userData.currentSalary || "",
            skills: userData.skills || "",
            summary: userData.summary || "",
          };

          let filledCount = 0;

          // Find and fill form fields
          Object.entries(fieldsMap).forEach(([fieldType, value]) => {
            if (!value || value.trim() === "") return;

            const selectors = [
              `[name*="${fieldType}"]`,
              `[id*="${fieldType}"]`,
              `[placeholder*="${fieldType}"]`,
              `[aria-label*="${fieldType}"]`,
            ];

            selectors.forEach((selector) => {
              try {
                const elements = document.querySelectorAll(selector);
                elements.forEach((element) => {
                  if (element.type !== "hidden" && !element.value) {
                    element.value = value;
                    element.dispatchEvent(
                      new Event("input", { bubbles: true })
                    );
                    element.dispatchEvent(
                      new Event("change", { bubbles: true })
                    );
                    filledCount++;
                  }
                });
              } catch (error) {
                console.error("Error filling field:", fieldType, error);
              }
            });
          });

          console.log(`Filled ${filledCount} form fields`);
          return filledCount;
        },
        args: [this.userData],
      });

      this.showNotification("Forms filled successfully!", "success");

      // Track application if on a job site
      this.trackApplicationIfJobSite(activeTab.url);
    } catch (error) {
      console.error("Form filling failed:", error);
      this.showNotification("Failed to fill forms", "error");
    }
  }

  // ==========================================
  // AI Tools
  // ==========================================

  async generateCoverLetter() {
    try {
      const generateBtn = document.getElementById("generateCoverLetterBtn");
      const copyBtn = document.getElementById("copyCoverLetterBtn");
      const resultDiv = document.getElementById("coverLetterResult");
      const outputTextarea = document.getElementById("coverLetterOutput");

      // Check AI configuration
      if (!this.isAIConfigured()) {
        this.showNotification("Please configure AI provider first", "warning");
        this.switchTab("settings");
        return;
      }

      // Get input values
      const jobInfo = {
        title: document.getElementById("jobTitle").value,
        company: document.getElementById("companyName").value,
        description: document.getElementById("jobDescription").value,
        personalizedReason: document.getElementById("personalReason").value,
      };

      if (!jobInfo.title || !jobInfo.company) {
        this.showNotification(
          "Please fill in job title and company name",
          "warning"
        );
        return;
      }

      // Show loading state
      generateBtn.disabled = true;
      generateBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
        </svg>
        Generating...
      `;

      // Generate cover letter using AI
      const aiProvider = await this.getAIProvider();
      const coverLetter = await aiProvider.generateCoverLetter(
        jobInfo,
        this.userData
      );

      // Display result
      outputTextarea.value = coverLetter;
      resultDiv.style.display = "block";
      copyBtn.style.display = "inline-flex";

      this.showNotification("Cover letter generated successfully!", "success");
    } catch (error) {
      console.error("Cover letter generation failed:", error);
      this.showNotification(
        `Failed to generate cover letter: ${error.message}`,
        "error"
      );
    } finally {
      // Reset button
      const generateBtn = document.getElementById("generateCoverLetterBtn");
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
        </svg>
        Generate Cover Letter
      `;
    }
  }

  async copyCoverLetter() {
    try {
      const outputTextarea = document.getElementById("coverLetterOutput");
      await navigator.clipboard.writeText(outputTextarea.value);
      this.showNotification("Cover letter copied to clipboard!", "success");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      this.showNotification("Failed to copy to clipboard", "error");
    }
  }

  async generateInterviewQuestions() {
    try {
      const generateBtn = document.getElementById("generateQuestionsBtn");
      const exportBtn = document.getElementById("exportQuestionsBtn");
      const resultDiv = document.getElementById("questionsResult");
      const outputDiv = document.getElementById("questionsOutput");

      // Check AI configuration
      if (!this.isAIConfigured()) {
        this.showNotification("Please configure AI provider first", "warning");
        this.switchTab("settings");
        return;
      }

      // Get input values
      const jobTitle = document.getElementById("interviewJobTitle").value;
      const experienceLevel = document.getElementById("experienceLevel").value;
      const skills = document.getElementById("technicalSkills").value;

      if (!jobTitle) {
        this.showNotification("Please enter a job title", "warning");
        return;
      }

      // Show loading state
      generateBtn.disabled = true;
      generateBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="animate-spin">
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
        </svg>
        Generating...
      `;

      // Prepare user data for questions
      const questionData = {
        jobTitle,
        experienceLevel,
        skills: skills || this.userData.skills,
        ...this.userData,
      };

      // Generate questions using AI
      const aiProvider = await this.getAIProvider();
      const questions = await aiProvider.generateInterviewQuestions(
        jobTitle,
        questionData
      );

      // Display questions
      this.displayInterviewQuestions(questions);
      resultDiv.style.display = "block";
      exportBtn.style.display = "inline-flex";

      // Store generated questions for export
      this.lastGeneratedQuestions = questions;

      this.showNotification(
        "Interview questions generated successfully!",
        "success"
      );
    } catch (error) {
      console.error("Questions generation failed:", error);
      this.showNotification(
        `Failed to generate questions: ${error.message}`,
        "error"
      );
    } finally {
      // Reset button
      const generateBtn = document.getElementById("generateQuestionsBtn");
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
        </svg>
        Generate Questions
      `;
    }
  }

  displayInterviewQuestions(questions) {
    const outputDiv = document.getElementById("questionsOutput");

    if (!questions || !Array.isArray(questions.questions)) {
      outputDiv.innerHTML =
        '<p class="text-red-600">Invalid questions format received from AI</p>';
      return;
    }

    let html = "";
    const categories = ["behavioral", "technical", "situational"];

    categories.forEach((category) => {
      const categoryQuestions = questions.questions.filter(
        (q) => q.category === category
      );
      if (categoryQuestions.length > 0) {
        html += `
          <div class="mb-6">
            <h4 class="text-md font-semibold text-primary mb-3 capitalize">${category} Questions</h4>
            <div class="space-y-3">
        `;

        categoryQuestions.forEach((question, index) => {
          html += `
            <div class="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <p class="font-medium text-gray-900">${index + 1}. ${
            question.question
          }</p>
              ${
                question.hint
                  ? `<p class="text-sm text-gray-600 mt-2"><strong>Hint:</strong> ${question.hint}</p>`
                  : ""
              }
            </div>
          `;
        });

        html += `
            </div>
          </div>
        `;
      }
    });

    outputDiv.innerHTML = html;
  }

  async exportQuestions() {
    if (!this.lastGeneratedQuestions) {
      this.showNotification("No questions to export", "warning");
      return;
    }

    try {
      const jobTitle = document.getElementById("interviewJobTitle").value;
      const date = new Date().toLocaleDateString();

      let exportText = `Interview Questions for ${jobTitle}\nGenerated on: ${date}\n\n`;

      const categories = ["behavioral", "technical", "situational"];
      categories.forEach((category) => {
        const categoryQuestions = this.lastGeneratedQuestions.questions.filter(
          (q) => q.category === category
        );
        if (categoryQuestions.length > 0) {
          exportText += `${category.toUpperCase()} QUESTIONS:\n`;
          exportText += "=".repeat(category.length + 12) + "\n\n";

          categoryQuestions.forEach((question, index) => {
            exportText += `${index + 1}. ${question.question}\n`;
            if (question.hint) {
              exportText += `   Hint: ${question.hint}\n`;
            }
            exportText += "\n";
          });
          exportText += "\n";
        }
      });

      // Create and download file
      const blob = new Blob([exportText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `interview-questions-${jobTitle
        .replace(/\s+/g, "-")
        .toLowerCase()}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification("Questions exported successfully!", "success");
    } catch (error) {
      console.error("Export failed:", error);
      this.showNotification("Failed to export questions", "error");
    }
  }

  async getAIProvider() {
    // Use the global AIProviderFactory that should be loaded from the HTML
    if (typeof AIProviderFactory === "undefined") {
      throw new Error(
        "AIProviderFactory not available. Please ensure AI provider scripts are loaded."
      );
    }
    return AIProviderFactory.create(
      this.aiConfig.provider,
      this.aiConfig.apiKey
    );
  }

  isAIConfigured() {
    return this.aiConfig && this.aiConfig.provider && this.aiConfig.apiKey;
  }

  // ==========================================
  // Application Tracking
  // ==========================================

  trackApplicationIfJobSite(url) {
    const jobSites = [
      "linkedin.com",
      "indeed.com",
      "glassdoor.com",
      "monster.com",
      "ziprecruiter.com",
      "dice.com",
      "stackoverflow.com/jobs",
    ];

    const isJobSite = jobSites.some((site) => url.includes(site));

    if (isJobSite) {
      this.addApplication({
        url,
        company: "Unknown",
        position: "Unknown",
        date: new Date().toISOString(),
        status: "applied",
      });
    }
  }

  addApplication(application) {
    this.applications.push({
      id: Date.now(),
      ...application,
    });

    this.saveUserData();
    this.updateApplicationStats();
  }

  async loadApplicationStats() {
    const stats = {
      total: this.applications.length,
      pending: this.applications.filter((app) => app.status === "applied")
        .length,
      interviews: this.applications.filter((app) => app.status === "interview")
        .length,
      rejected: this.applications.filter((app) => app.status === "rejected")
        .length,
    };

    // Update stat displays
    this.updateElement("totalApplications", stats.total);
    this.updateElement("pendingApplications", stats.pending);
    this.updateElement("interviewApplications", stats.interviews);
    this.updateElement("rejectedApplications", stats.rejected);
  }

  updateApplicationStats() {
    if (this.currentTab === "applications") {
      this.loadApplicationStats();
    }
  }

  // ==========================================
  // Data Management
  // ==========================================

  async exportData() {
    try {
      console.log("📤 Exporting all data...");

      const allData = {
        userData: this.userData,
        aiConfig: this.aiConfig,
        applications: this.applications,
        preferences: this.preferences,
        exportDate: new Date().toISOString(),
        version: "2.0.0",
      };

      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `job-application-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification("Data exported successfully!", "success");
      console.log("✅ Data export complete");
    } catch (error) {
      console.error("❌ Export failed:", error);
      this.showNotification("Failed to export data", "error");
    }
  }

  async importData() {
    try {
      console.log("📥 Starting data import...");

      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";

      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
          const text = await file.text();
          const importedData = JSON.parse(text);

          // Validate imported data structure
          if (
            !importedData.userData &&
            !importedData.applications &&
            !importedData.preferences
          ) {
            throw new Error("Invalid data format");
          }

          // Show confirmation dialog
          const confirmImport = confirm(
            "This will replace all your current data. Are you sure you want to continue?\n\n" +
              "Current data will be lost permanently!"
          );

          if (!confirmImport) {
            this.showNotification("Import cancelled", "info");
            return;
          }

          // Update data
          this.userData = importedData.userData || {};
          this.aiConfig = importedData.aiConfig || {};
          this.applications = importedData.applications || [];
          this.preferences = importedData.preferences || {
            compactMode: false,
            autoFillEnabled: true,
            showSuggestions: true,
            saveNewData: true,
          };

          // Save to storage
          await this.saveUserData();

          // Refresh UI
          this.populateFields();
          this.updateUI();

          this.showNotification("Data imported successfully!", "success");
          console.log("✅ Data import complete");
        } catch (error) {
          console.error("❌ Import failed:", error);
          this.showNotification(
            "Failed to import data. Please check the file format.",
            "error"
          );
        }
      };

      input.click();
    } catch (error) {
      console.error("❌ Import setup failed:", error);
      this.showNotification("Failed to set up import", "error");
    }
  }

  async clearAllData() {
    try {
      console.log("🗑️ Starting data clear...");

      // Show confirmation dialog
      const confirmClear = confirm(
        "This will permanently delete ALL your data including:\n\n" +
          "• Personal information\n" +
          "• Work experience\n" +
          "• Education history\n" +
          "• Applications tracking\n" +
          "• AI configuration\n" +
          "• Preferences\n\n" +
          "This action cannot be undone. Are you sure?"
      );

      if (!confirmClear) {
        this.showNotification("Clear cancelled", "info");
        return;
      }

      // Double confirmation for safety
      const doubleConfirm = confirm(
        "FINAL WARNING: This will delete everything!\n\n" +
          "Type 'DELETE' in the next prompt if you're absolutely sure."
      );

      if (!doubleConfirm) {
        this.showNotification("Clear cancelled", "info");
        return;
      }

      const userInput = prompt("Type 'DELETE' to confirm (case sensitive):");
      if (userInput !== "DELETE") {
        this.showNotification(
          "Clear cancelled - incorrect confirmation",
          "info"
        );
        return;
      }

      // Clear all data
      this.userData = {};
      this.aiConfig = {};
      this.applications = [];
      this.preferences = {
        compactMode: false,
        autoFillEnabled: true,
        showSuggestions: true,
        saveNewData: true,
      };

      // Clear storage
      await chrome.storage.local.clear();

      // Save empty data structure
      await this.saveUserData();

      // Refresh UI
      this.populateFields();
      this.updateUI();

      this.showNotification("All data cleared successfully", "success");
      console.log("✅ All data cleared");
    } catch (error) {
      console.error("❌ Clear failed:", error);
      this.showNotification("Failed to clear data", "error");
    }
  }

  // ==========================================
  // UI Helpers
  // ==========================================

  toggleCompactMode(enabled) {
    this.isCompactMode = enabled;
    this.preferences.compactMode = enabled;

    document.body.classList.toggle("compact-mode", enabled);

    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      if (enabled) {
        sidebar.classList.add("collapsed");
      } else {
        sidebar.classList.remove("collapsed");
      }
    }

    // Save the preference immediately
    this.saveUserData();

    // Show feedback to user
    this.showNotification(
      `Compact mode ${
        enabled ? "enabled" : "disabled"
      }. Interface spacing reduced.`,
      "success"
    );

    console.log(
      `🔄 Compact mode ${enabled ? "enabled" : "disabled"} - UI updated`
    );
  }

  toggleAutoFill(enabled) {
    this.preferences.autoFillEnabled = enabled;
    this.saveUserData();
    console.log(`🔄 Auto-fill ${enabled ? "enabled" : "disabled"}`);
  }

  toggleShowSuggestions(enabled) {
    this.preferences.showSuggestions = enabled;
    this.saveUserData();
    console.log(`🔄 Field suggestions ${enabled ? "enabled" : "disabled"}`);
  }

  toggleSaveNewData(enabled) {
    this.preferences.saveNewData = enabled;
    this.saveUserData();
    console.log(`🔄 Save new data ${enabled ? "enabled" : "disabled"}`);
  }

  toggleLocalSave(enabled) {
    this.preferences.saveLocally = enabled;
    this.saveUserData();
  }

  updateUI() {
    // Apply compact mode immediately if enabled (without double-saving)
    if (this.preferences.compactMode) {
      this.isCompactMode = true;
      document.body.classList.add("compact-mode");

      const sidebar = document.getElementById("sidebar");
      if (sidebar) {
        sidebar.classList.add("collapsed");
      }

      console.log("🔄 Compact mode applied from saved preferences");
    }

    // Update application stats
    this.updateApplicationStats();
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
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
      element.addEventListener("click", handler);
    }
  }

  bindInput(id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("input", (e) => handler(e.target.value));
    }
  }

  bindSelect(id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", (e) => handler(e.target.value));
    }
  }

  bindCheckbox(id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("change", (e) => handler(e.target.checked));
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
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.popupManager = new PopupManager();
  });
} else {
  window.popupManager = new PopupManager();
}

// Export for testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = PopupManager;
}
