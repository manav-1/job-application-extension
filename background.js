// Import all required modules
importScripts(
  "src/ai/AIProvider.js",
  "src/ai/OpenAIProvider.js",
  "src/ai/GeminiProvider.js",
  "src/ai/AIProviderFactory.js",
  "src/services/DataService.js",
  "src/services/FieldDetectionService.js",
  "src/services/ApplicationService.js",
  "src/utils/FormFillingUtils.js",
  "src/utils/CommonUtils.js"
);

// Main Extension Manager Class
class JobApplicationExtensionManager {
  constructor() {
    this.dataService = new DataService();
    this.applicationService = new ApplicationService(this.dataService);
    this.aiProvider = null;

    this.initializeExtension();
  }

  async initializeExtension() {
    console.log("Job Application Extension initialized");

    // Set up message listeners
    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));

    // Set up context menu
    this.createContextMenu();

    // Initialize AI provider if configured
    await this.initializeAIProvider();
  }

  async initializeAIProvider() {
    try {
      const aiConfig = await this.dataService.getAIConfig();

      if (aiConfig.apiKey && aiConfig.provider) {
        this.aiProvider = AIProviderFactory.create(
          aiConfig.provider,
          aiConfig.apiKey
        );
        console.log(`Initialized ${aiConfig.provider} AI provider`);
      }
    } catch (error) {
      console.error("Failed to initialize AI provider:", error);
    }
  }

  createContextMenu() {
    chrome.contextMenus.create({
      id: "fill-application",
      title: "Fill Job Application",
      contexts: ["page"],
    });

    chrome.contextMenus.create({
      id: "generate-cover-letter",
      title: "Generate AI Cover Letter",
      contexts: ["page"],
    });

    chrome.contextMenus.onClicked.addListener(
      this.handleContextMenuClick.bind(this)
    );
  }

  async handleContextMenuClick(info, tab) {
    switch (info.menuItemId) {
      case "fill-application":
        await this.fillApplicationForm(tab.id);
        break;
      case "generate-cover-letter":
        await this.generateCoverLetter(tab.id);
        break;
    }
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case "fillForm":
          await this.fillApplicationForm(sender.tab.id);
          sendResponse({ success: true });
          break;

        case "saveUserData":
          await this.dataService.saveUserData(request.data);
          sendResponse({ success: true });
          break;

        case "getUserData":
          const userData = await this.dataService.getUserData();
          sendResponse({ success: true, data: userData });
          break;

        case "saveFieldMappings":
          await this.dataService.saveFieldMappings(request.mappings);
          sendResponse({ success: true });
          break;

        case "getFieldMappings":
          const mappings = await this.dataService.getFieldMappings();
          sendResponse({ success: true, data: mappings });
          break;

        case "saveAIConfig":
          await this.dataService.saveAIConfig(request.config);
          await this.initializeAIProvider(); // Reinitialize with new config
          sendResponse({ success: true });
          break;

        case "getAIConfig":
          const aiConfig = await this.dataService.getAIConfig();
          sendResponse({ success: true, data: aiConfig });
          break;

        case "generateCoverLetter":
          const coverLetter = await this.generateCoverLetterForJob(
            request.jobInfo
          );
          sendResponse({ success: true, data: coverLetter });
          break;

        case "generateInterviewQuestions":
          const questions = await this.generateInterviewQuestions(
            request.jobTitle
          );
          sendResponse({ success: true, data: questions });
          break;

        case "saveApplication":
          const application = await this.applicationService.createApplication(
            request.jobInfo,
            request.url
          );
          sendResponse({ success: true, data: application });
          break;

        case "getApplications":
          const applications = await this.applicationService.getApplications(
            request.filters,
            request.sortBy,
            request.sortOrder
          );
          sendResponse({ success: true, data: applications });
          break;

        case "updateApplication":
          const updatedApp = await this.applicationService.updateApplication(
            request.id,
            request.updates
          );
          sendResponse({ success: true, data: updatedApp });
          break;

        case "deleteApplication":
          await this.applicationService.deleteApplication(request.id);
          sendResponse({ success: true });
          break;

        case "getApplicationStats":
          const stats = await this.applicationService.getApplicationStats();
          sendResponse({ success: true, data: stats });
          break;

        case "exportData":
          const exportData = await this.dataService.exportData();
          sendResponse({ success: true, data: exportData });
          break;

        case "importData":
          await this.dataService.importData(request.data);
          sendResponse({ success: true });
          break;

        case "saveSettings":
          await this.dataService.saveSettings(request.settings);
          sendResponse({ success: true });
          break;

        case "getSettings":
          const settings = await this.dataService.getSettings();
          sendResponse({ success: true, data: settings });
          break;

        default:
          sendResponse({ success: false, error: "Unknown action" });
      }
    } catch (error) {
      console.error("Message handling error:", error);
      sendResponse({ success: false, error: error.message });
    }

    // Return true to indicate async response
    return true;
  }

  async fillApplicationForm(tabId) {
    try {
      const userData = await this.dataService.getUserData();
      const fieldMappings = await this.dataService.getFieldMappings();

      // Inject content script and fill form
      await chrome.scripting.executeScript({
        target: { tabId },
        files: [
          "src/services/FieldDetectionService.js",
          "src/utils/FormFillingUtils.js",
        ],
      });

      const [result] = await chrome.scripting.executeScript({
        target: { tabId },
        func: this.fillFormOnPage,
        args: [userData, fieldMappings],
      });

      if (result.result.success) {
        await NotificationUtils.showSuccess(
          "Form Filled",
          `Successfully filled ${result.result.fieldsCount} fields`
        );
      } else {
        throw new Error(result.result.error);
      }
    } catch (error) {
      console.error("Form filling error:", error);
      await NotificationUtils.showError("Form Fill Error", error.message);
    }
  }

  // This function runs in the content script context
  fillFormOnPage(userData, fieldMappings) {
    try {
      const fieldDetection = new FieldDetectionService();
      const detectedFields =
        fieldDetection.detectFieldsWithScoring(fieldMappings);

      let filledCount = 0;

      // Fill personal information
      if (detectedFields.firstName && userData.personalInfo.firstName) {
        FormFillingUtils.fillField(
          detectedFields.firstName,
          userData.personalInfo.firstName
        );
        FormFillingUtils.addVisualFeedback(detectedFields.firstName, true);
        filledCount++;
      }

      if (detectedFields.lastName && userData.personalInfo.lastName) {
        FormFillingUtils.fillField(
          detectedFields.lastName,
          userData.personalInfo.lastName
        );
        FormFillingUtils.addVisualFeedback(detectedFields.lastName, true);
        filledCount++;
      }

      if (detectedFields.email && userData.personalInfo.email) {
        FormFillingUtils.fillField(
          detectedFields.email,
          userData.personalInfo.email
        );
        FormFillingUtils.addVisualFeedback(detectedFields.email, true);
        filledCount++;
      }

      if (detectedFields.phone && userData.personalInfo.phone) {
        FormFillingUtils.fillField(
          detectedFields.phone,
          userData.personalInfo.phone
        );
        FormFillingUtils.addVisualFeedback(detectedFields.phone, true);
        filledCount++;
      }

      if (detectedFields.address && userData.personalInfo.address) {
        FormFillingUtils.fillField(
          detectedFields.address,
          userData.personalInfo.address
        );
        FormFillingUtils.addVisualFeedback(detectedFields.address, true);
        filledCount++;
      }

      if (detectedFields.city && userData.personalInfo.city) {
        FormFillingUtils.fillField(
          detectedFields.city,
          userData.personalInfo.city
        );
        FormFillingUtils.addVisualFeedback(detectedFields.city, true);
        filledCount++;
      }

      if (detectedFields.state && userData.personalInfo.state) {
        FormFillingUtils.fillField(
          detectedFields.state,
          userData.personalInfo.state
        );
        FormFillingUtils.addVisualFeedback(detectedFields.state, true);
        filledCount++;
      }

      if (detectedFields.zipCode && userData.personalInfo.zipCode) {
        FormFillingUtils.fillField(
          detectedFields.zipCode,
          userData.personalInfo.zipCode
        );
        FormFillingUtils.addVisualFeedback(detectedFields.zipCode, true);
        filledCount++;
      }

      return { success: true, fieldsCount: filledCount };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateCoverLetterForJob(jobInfo) {
    if (!this.aiProvider) {
      throw new Error(
        "AI provider not configured. Please set up your API key first."
      );
    }

    try {
      const userData = await this.dataService.getUserData();
      const coverLetter = await this.aiProvider.generateCoverLetter(
        jobInfo,
        userData
      );

      // Save to application if exists
      if (jobInfo.applicationId) {
        await this.applicationService.addCoverLetter(
          jobInfo.applicationId,
          coverLetter
        );
      }

      return coverLetter;
    } catch (error) {
      console.error("Cover letter generation error:", error);
      throw new Error(`Failed to generate cover letter: ${error.message}`);
    }
  }

  async generateInterviewQuestions(jobTitle) {
    if (!this.aiProvider) {
      throw new Error(
        "AI provider not configured. Please set up your API key first."
      );
    }

    try {
      const userData = await this.dataService.getUserData();
      const questions = await this.aiProvider.generateInterviewQuestions(
        jobTitle,
        userData
      );

      return questions;
    } catch (error) {
      console.error("Interview questions generation error:", error);
      throw new Error(
        `Failed to generate interview questions: ${error.message}`
      );
    }
  }

  async generateCoverLetter(tabId) {
    try {
      // Get current tab URL to extract job info
      const tab = await chrome.tabs.get(tabId);
      const jobInfo = UrlUtils.extractJobInfo(tab.url);

      if (!jobInfo.title && !jobInfo.company) {
        throw new Error("Unable to detect job information on this page");
      }

      const coverLetter = await this.generateCoverLetterForJob(jobInfo);

      // Show result in notification
      await NotificationUtils.showSuccess(
        "Cover Letter Generated",
        "AI-powered cover letter has been created"
      );

      return coverLetter;
    } catch (error) {
      console.error("Cover letter generation error:", error);
      await NotificationUtils.showError("Cover Letter Error", error.message);
      throw error;
    }
  }
}

// Initialize the extension manager
const extensionManager = new JobApplicationExtensionManager();
