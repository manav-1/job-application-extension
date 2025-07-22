// Data Management Service
class DataService {
  constructor() {
    this.storageKeys = {
      USER_DATA: "jobApplicationData",
      FIELD_MAPPINGS: "fieldMappings",
      AI_CONFIG: "aiConfiguration",
      APPLICATIONS: "savedApplications",
      SETTINGS: "extensionSettings",
    };
  }

  // User Data Management
  async getUserData() {
    const result = await chrome.storage.local.get([this.storageKeys.USER_DATA]);
    return result[this.storageKeys.USER_DATA] || this._getDefaultUserData();
  }

  async saveUserData(userData) {
    await chrome.storage.local.set({
      [this.storageKeys.USER_DATA]: userData,
    });
  }

  _getDefaultUserData() {
    return {
      personalInfo: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      experience: [],
      education: [],
      skills: [],
      preferences: {
        autoFill: true,
        saveApplications: true,
        showNotifications: true,
      },
    };
  }

  // Field Mappings Management
  async getFieldMappings() {
    const result = await chrome.storage.local.get([
      this.storageKeys.FIELD_MAPPINGS,
    ]);
    return (
      result[this.storageKeys.FIELD_MAPPINGS] || this._getDefaultFieldMappings()
    );
  }

  async saveFieldMappings(mappings) {
    await chrome.storage.local.set({
      [this.storageKeys.FIELD_MAPPINGS]: mappings,
    });
  }

  _getDefaultFieldMappings() {
    return {
      name: ["name", "full_name", "fullname", "applicant_name"],
      firstName: ["first_name", "firstname", "fname", "given_name"],
      lastName: ["last_name", "lastname", "lname", "family_name", "surname"],
      email: ["email", "email_address", "e_mail", "contact_email"],
      phone: ["phone", "telephone", "mobile", "cell", "phone_number"],
      address: ["address", "street_address", "address_line_1", "addr1"],
      city: ["city", "town", "locality"],
      state: ["state", "province", "region"],
      zipCode: ["zip", "postal_code", "postcode", "zip_code"],
      country: ["country", "nation"],
      position: ["position", "job_title", "title", "role"],
      company: ["company", "employer", "organization", "workplace"],
      coverLetter: ["cover_letter", "coverletter", "letter", "motivation"],
      resume: ["resume", "cv", "curriculum_vitae", "attachment"],
    };
  }

  // AI Configuration Management
  async getAIConfig() {
    const result = await chrome.storage.local.get([this.storageKeys.AI_CONFIG]);
    return result[this.storageKeys.AI_CONFIG] || this._getDefaultAIConfig();
  }

  async saveAIConfig(config) {
    await chrome.storage.local.set({
      [this.storageKeys.AI_CONFIG]: config,
    });
  }

  _getDefaultAIConfig() {
    return {
      provider: "openai",
      apiKey: "",
      enableCoverLetterGeneration: false,
      enableInterviewPrep: false,
      autoGenerateCoverLetters: false,
    };
  }

  // Applications Management
  async getApplications() {
    const result = await chrome.storage.local.get([
      this.storageKeys.APPLICATIONS,
    ]);
    return result[this.storageKeys.APPLICATIONS] || [];
  }

  async saveApplication(application) {
    const applications = await this.getApplications();
    const existingIndex = applications.findIndex(
      (app) => app.id === application.id
    );

    if (existingIndex !== -1) {
      applications[existingIndex] = application;
    } else {
      applications.push(application);
    }

    await chrome.storage.local.set({
      [this.storageKeys.APPLICATIONS]: applications,
    });
  }

  async deleteApplication(applicationId) {
    const applications = await this.getApplications();
    const filteredApplications = applications.filter(
      (app) => app.id !== applicationId
    );

    await chrome.storage.local.set({
      [this.storageKeys.APPLICATIONS]: filteredApplications,
    });
  }

  // Settings Management
  async getSettings() {
    const result = await chrome.storage.local.get([this.storageKeys.SETTINGS]);
    return result[this.storageKeys.SETTINGS] || this._getDefaultSettings();
  }

  async saveSettings(settings) {
    await chrome.storage.local.set({
      [this.storageKeys.SETTINGS]: settings,
    });
  }

  _getDefaultSettings() {
    return {
      theme: "light",
      autoSave: true,
      notifications: true,
      debugMode: false,
      compactMode: false,
    };
  }

  // Utility Methods
  async clearAllData() {
    await chrome.storage.local.clear();
  }

  async exportData() {
    const userData = await this.getUserData();
    const fieldMappings = await this.getFieldMappings();
    const applications = await this.getApplications();
    const settings = await this.getSettings();

    return {
      userData,
      fieldMappings,
      applications,
      settings,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };
  }

  async importData(data) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid import data format");
    }

    const promises = [];

    if (data.userData) {
      promises.push(this.saveUserData(data.userData));
    }

    if (data.fieldMappings) {
      promises.push(this.saveFieldMappings(data.fieldMappings));
    }

    if (data.applications) {
      promises.push(
        chrome.storage.local.set({
          [this.storageKeys.APPLICATIONS]: data.applications,
        })
      );
    }

    if (data.settings) {
      promises.push(this.saveSettings(data.settings));
    }

    await Promise.all(promises);
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = DataService;
} else {
  // Make available in service worker context
  if (typeof module !== "undefined" && module.exports) {
    module.exports = DataService;
  } else if (typeof globalThis !== "undefined") {
    globalThis.DataService = DataService;
  }
}
