// Content script for job application auto-fill
class JobApplicationFiller {
  constructor() {
    this.isEnabled = true;
    this.currentField = null;
    this.suggestionPopup = null;
    this.fieldObserver = null;

    this.init();
  }

  async init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupExtension()
      );
    } else {
      this.setupExtension();
    }
  }

  async setupExtension() {
    // Get user preferences
    const response = await this.sendMessage({ action: "getUserData" });
    if (response.success && response.data.preferences) {
      this.isEnabled = response.data.preferences.autoFillEnabled;
      this.showSuggestions = response.data.preferences.showSuggestions;
      this.saveNewData = response.data.preferences.saveNewData;
    }

    if (!this.isEnabled) return;

    // Set up field monitoring
    this.setupFieldMonitoring();

    // Auto-fill known fields
    this.autoFillKnownFields();
  }

  setupFieldMonitoring() {
    // Monitor for new form fields being added dynamically
    this.fieldObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processNewElements(node);
            }
          });
        }
      });
    });

    this.fieldObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Set up event listeners for existing fields
    this.setupFieldListeners();
  }

  processNewElements(element) {
    // Process newly added form fields
    const fields = element.querySelectorAll("input, textarea, select");
    fields.forEach((field) => {
      this.setupFieldListener(field);
    });
  }

  setupFieldListeners() {
    const fields = document.querySelectorAll("input, textarea, select");
    fields.forEach((field) => {
      this.setupFieldListener(field);
    });
  }

  setupFieldListener(field) {
    // Skip if already processed
    if (field.hasAttribute("data-job-filler-processed")) return;
    field.setAttribute("data-job-filler-processed", "true");

    // Focus event - show suggestions
    field.addEventListener("focus", (e) => {
      this.currentField = e.target;
      if (this.showSuggestions) {
        this.showFieldSuggestions(e.target);
      }
    });

    // Input event - save new data if enabled
    field.addEventListener("input", (e) => {
      if (this.saveNewData && e.target.value.trim()) {
        this.debounce(() => {
          this.saveFieldValue(e.target);
        }, 1000);
      }
    });

    // Blur event - hide suggestions
    field.addEventListener("blur", (e) => {
      // Delay hiding to allow clicking on suggestions
      setTimeout(() => {
        this.hideSuggestions();
      }, 200);
    });
  }

  async autoFillKnownFields() {
    const response = await this.sendMessage({ action: "getUserData" });
    if (!response.success) return;

    const userData = response.data;
    const fields = document.querySelectorAll("input, textarea, select");

    fields.forEach((field) => {
      const fieldInfo = this.getFieldInfo(field);
      const suggestion = this.getBestSuggestion(fieldInfo, userData);

      if (suggestion && !field.value.trim()) {
        // Only auto-fill if field is empty
        this.fillField(field, suggestion.value);
      }
    });
  }

  async showFieldSuggestions(field) {
    const fieldInfo = this.getFieldInfo(field);
    const response = await this.sendMessage({
      action: "getSuggestions",
      fieldInfo,
    });

    if (response.success && response.suggestions.length > 0) {
      this.createSuggestionPopup(field, response.suggestions);
    }
  }

  getFieldInfo(field) {
    return {
      fieldName: field.name || "",
      fieldId: field.id || "",
      fieldType: field.type || "",
      placeholder: field.placeholder || "",
      label: this.getFieldLabel(field),
      value: field.value || "",
    };
  }

  getFieldLabel(field) {
    // Try to find associated label
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) return label.textContent.trim();

    // Check parent elements for label text
    let parent = field.parentElement;
    while (parent && parent !== document.body) {
      const labelElement = parent.querySelector("label");
      if (labelElement) return labelElement.textContent.trim();
      parent = parent.parentElement;
    }

    return "";
  }

  getBestSuggestion(fieldInfo, userData) {
    // Simple auto-fill logic for common fields
    const normalizedField = this.normalizeFieldName(
      fieldInfo.fieldName ||
        fieldInfo.fieldId ||
        fieldInfo.placeholder ||
        fieldInfo.label
    );

    // Personal info mapping
    if (
      normalizedField.includes("firstname") ||
      normalizedField.includes("fname")
    ) {
      return { value: userData.personalInfo?.firstName || "" };
    }
    if (
      normalizedField.includes("lastname") ||
      normalizedField.includes("lname")
    ) {
      return { value: userData.personalInfo?.lastName || "" };
    }
    if (normalizedField.includes("email")) {
      return { value: userData.personalInfo?.email || "" };
    }
    if (normalizedField.includes("phone")) {
      return { value: userData.personalInfo?.phone || "" };
    }

    return null;
  }

  createSuggestionPopup(field, suggestions) {
    // Remove existing popup
    this.hideSuggestions();

    const popup = document.createElement("div");
    popup.className = "job-filler-suggestions";
    popup.innerHTML = `
      <div class="job-filler-header">
        <span>Suggestions</span>
        <button class="job-filler-close">&times;</button>
      </div>
      <div class="job-filler-suggestions-list">
        ${suggestions
          .map(
            (suggestion, index) => `
          <div class="job-filler-suggestion-item" data-index="${index}">
            <span class="job-filler-suggestion-label">${suggestion.label}</span>
            <span class="job-filler-suggestion-value">${this.truncateText(
              suggestion.value,
              50
            )}</span>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    // Position popup near the field
    const rect = field.getBoundingClientRect();
    popup.style.position = "fixed";
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.bottom + 5}px`;
    popup.style.zIndex = "10000";

    document.body.appendChild(popup);
    this.suggestionPopup = popup;

    // Set up popup event listeners
    popup.addEventListener("click", (e) => {
      if (e.target.classList.contains("job-filler-close")) {
        this.hideSuggestions();
        return;
      }

      const suggestionItem = e.target.closest(".job-filler-suggestion-item");
      if (suggestionItem) {
        const index = parseInt(suggestionItem.dataset.index);
        const suggestion = suggestions[index];
        this.fillField(field, suggestion.value);
        this.hideSuggestions();
      }
    });
  }

  fillField(field, value) {
    // Set the value
    field.value = value;

    // Trigger events to notify the page
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));

    // For React/Vue applications
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;
    nativeInputValueSetter.call(field, value);

    field.dispatchEvent(new Event("input", { bubbles: true }));
  }

  hideSuggestions() {
    if (this.suggestionPopup) {
      this.suggestionPopup.remove();
      this.suggestionPopup = null;
    }
  }

  async saveFieldValue(field) {
    const fieldInfo = this.getFieldInfo(field);
    const fieldName =
      fieldInfo.fieldName ||
      fieldInfo.fieldId ||
      fieldInfo.placeholder ||
      fieldInfo.label;

    if (fieldName && field.value.trim()) {
      await this.sendMessage({
        action: "saveFieldData",
        fieldName,
        value: field.value.trim(),
      });
    }
  }

  normalizeFieldName(fieldName) {
    return fieldName
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "")
      .replace(/\s+/g, "");
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  debounce(func, delay) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(func, delay);
  }

  sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }

  destroy() {
    if (this.fieldObserver) {
      this.fieldObserver.disconnect();
    }
    this.hideSuggestions();
  }
}

// Initialize the content script
const jobApplicationFiller = new JobApplicationFiller();

// Clean up when page is unloaded
window.addEventListener("beforeunload", () => {
  jobApplicationFiller.destroy();
});
