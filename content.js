// Content script for job application auto-fill
class JobApplicationFiller {
  constructor() {
    this.isEnabled = true;
    this.currentField = null;
    this.suggestionPopup = null;
    this.fieldObserver = null;
    this.debounceTimer = null;

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
    try {
      // Check if chrome.runtime is available
      if (typeof chrome === "undefined" || !chrome.runtime) {
        // Still set up basic functionality without Chrome APIs
        this.injectCSS();
        this.setupFieldMonitoring();
        return;
      }

      // Inject CSS for suggestions popup
      this.injectCSS();

      // Get user preferences with defaults
      const response = await this.sendMessage({ action: "getUserData" });

      // Handle extension context invalidation
      if (response.contextInvalidated) {
        this.showGlobalContextInvalidatedMessage();
        this.isEnabled = true;
        this.showSuggestions = false; // Disable suggestions since we can't communicate with background
        this.saveNewData = false;
        this.setupFieldMonitoring();
        return;
      }

      if (response.success && response.data.preferences) {
        this.isEnabled = response.data.preferences.autoFillEnabled !== false; // Default to true
        this.showSuggestions =
          response.data.preferences.showSuggestions !== false; // Default to true
        this.saveNewData = response.data.preferences.saveNewData !== false; // Default to true
      } else {
        // Default settings if no preferences exist
        this.isEnabled = true;
        this.showSuggestions = true;
        this.saveNewData = true;
      }

      if (!this.isEnabled) {
        return;
      }

      // Set up field monitoring
      this.setupFieldMonitoring();

      // Auto-fill known fields
      this.autoFillKnownFields();
    } catch (error) {
      console.error("Error setting up extension:", error);
      // Continue with basic functionality even if setup fails
      this.isEnabled = true;
      this.showSuggestions = true;
      this.saveNewData = true;
      this.setupFieldMonitoring();
    }
  }

  injectCSS() {
    // Only inject once
    if (document.getElementById("job-filler-styles")) return;

    const style = document.createElement("style");
    style.id = "job-filler-styles";
    style.textContent = `
      .job-filler-suggestions {
        position: fixed;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-height: 300px;
        overflow-y: auto;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        min-width: 280px;
        max-width: 400px;
      }
      
      .job-filler-header {
        padding: 12px 16px;
        border-bottom: 1px solid #e2e8f0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 600;
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 7px 7px 0 0;
      }
      
      .job-filler-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      
      .job-filler-close:hover {
        opacity: 1;
      }
      
      .job-filler-suggestions-list {
        padding: 8px 0;
      }
      
      .job-filler-suggestion-item {
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f1f5f9;
        transition: background-color 0.2s;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .job-filler-suggestion-item:last-child {
        border-bottom: none;
      }
      
      .job-filler-suggestion-item:hover {
        background-color: #f8fafc;
      }
      
      .job-filler-suggestion-label {
        font-weight: 600;
        color: #334155;
        font-size: 13px;
      }
      
      .job-filler-suggestion-value {
        color: #64748b;
        font-size: 12px;
        line-height: 1.4;
        word-break: break-word;
      }
      
      /* Animation */
      .job-filler-suggestions {
        animation: slideIn 0.2s ease-out;
      }
      
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-10px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `;
    document.head.appendChild(style);
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
      try {
        this.currentField = e.target;
        if (this.showSuggestions) {
          this.showFieldSuggestions(e.target).catch((error) => {
            console.error("Error in showFieldSuggestions:", error);
          });
        }
      } catch (error) {
        console.error("Error in focus event handler:", error);
      }
    });

    // Input event - save new data if enabled
    field.addEventListener("input", (e) => {
      try {
        if (this.saveNewData && e.target.value.trim()) {
          this.debounce(() => {
            this.saveFieldValue(e.target);
          }, 1000);
        }
      } catch (error) {
        console.error("Error in input event handler:", error);
      }
    });

    // Blur event - hide suggestions
    field.addEventListener("blur", (e) => {
      try {
        // Delay hiding to allow clicking on suggestions
        setTimeout(() => {
          this.hideSuggestions();
        }, 200);
      } catch (error) {
        console.error("Error in blur event handler:", error);
      }
    });
  }

  // Show message when extension context is invalidated
  showContextInvalidatedMessage(field) {
    // Safety check for field parameter
    if (!field || typeof field !== "object") {
      this.showGlobalContextInvalidatedMessage();
      return;
    }

    // Remove existing popup
    this.hideSuggestions();

    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed !important;
      background: #fff3cd !important;
      border: 1px solid #ffeaa7 !important;
      border-radius: 8px !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25) !important;
      z-index: 2147483647 !important;
      max-height: 150px !important;
      overflow-y: auto !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      min-width: 280px !important;
      max-width: 400px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    `;

    popup.innerHTML = `
      <div style="
        padding: 12px 16px !important;
        border-bottom: 1px solid #ffeaa7 !important;
        background: #ffc107 !important;
        color: #212529 !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        border-radius: 7px 7px 0 0 !important;
      ">
        <span>⚠️ Extension Reloaded</span>
        <button class="extension-reload-close" style="
          background: none !important;
          border: none !important;
          color: #212529 !important;
          font-size: 18px !important;
          cursor: pointer !important;
          padding: 0 !important;
          width: 20px !important;
          height: 20px !important;
        ">&times;</button>
      </div>
      <div style="padding: 16px !important; color: #856404 !important; font-size: 13px !important; line-height: 1.4 !important;">
        <p style="margin: 0 0 8px 0 !important;">
          The extension was reloaded or updated. Please refresh this page to restore full functionality.
        </p>
        <button onclick="window.location.reload()" style="
          background: #ffc107 !important;
          border: none !important;
          color: #212529 !important;
          padding: 6px 12px !important;
          border-radius: 4px !important;
          font-size: 12px !important;
          cursor: pointer !important;
          font-weight: 600 !important;
        ">Refresh Page</button>
      </div>
    `;

    // Position popup near the field
    if (field && typeof field.getBoundingClientRect === "function") {
      const rect = field.getBoundingClientRect();
      const popupWidth = 300;

      if (rect.left >= popupWidth + 10) {
        popup.style.left = `${rect.left - popupWidth - 10}px`;
      } else {
        const viewportWidth = window.innerWidth;
        if (rect.right + popupWidth + 10 <= viewportWidth) {
          popup.style.left = `${rect.right + 10}px`;
        } else {
          popup.style.left = "10px";
        }
      }

      popup.style.top = `${rect.top}px`;
    } else {
      // Default positioning when field is not available
      popup.style.left = "20px";
      popup.style.top = "20px";
    }
    popup.className = "job-filler-extension-message";

    document.body.appendChild(popup);
    this.suggestionPopup = popup;

    // Add close button event listener
    const closeBtn = popup.querySelector(".extension-reload-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        popup.remove();
        this.suggestionPopup = null;
      });
    }

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (popup.parentNode) {
        popup.remove();
        if (this.suggestionPopup === popup) {
          this.suggestionPopup = null;
        }
      }
    }, 10000);
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
    try {
      // Safety check for field parameter
      if (!field || typeof field !== "object") {
        return;
      }

      const fieldInfo = this.getFieldInfo(field);
      const response = await this.sendMessage({
        action: "getSuggestions",
        fieldInfo,
      });

      // Handle extension context invalidation
      if (response.contextInvalidated) {
        this.showContextInvalidatedMessage(field);
        return;
      }

      if (
        response.success &&
        response.suggestions &&
        response.suggestions.length > 0
      ) {
        this.createSuggestionPopup(field, response.suggestions);
      }
    } catch (error) {
      console.error("Error in showFieldSuggestions:", error);
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
    // Safety check for field parameter
    if (!field || typeof field !== "object") {
      return;
    }

    // Safety check for suggestions parameter
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      return;
    }

    // Remove existing popup
    this.hideSuggestions();

    const popup = document.createElement("div");
    popup.style.cssText = `
      position: fixed !important;
      background: white !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 8px !important;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25) !important;
      z-index: 2147483647 !important;
      max-height: 300px !important;
      overflow-y: auto !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      min-width: 280px !important;
      max-width: 400px !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    `;

    try {
      popup.innerHTML = `
        <div style="
          padding: 12px 16px !important;
          border-bottom: 1px solid #e2e8f0 !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          border-radius: 7px 7px 0 0 !important;
        ">
          <span>Suggestions</span>
          <button class="suggestion-close-btn" style="
            background: none !important;
            border: none !important;
            color: white !important;
            font-size: 18px !important;
            cursor: pointer !important;
            padding: 0 !important;
            width: 20px !important;
            height: 20px !important;
          ">&times;</button>
        </div>
        <div style="padding: 8px 0 !important;">
          ${suggestions
            .map(
              (suggestion) => `
            <div class="suggestion-item" data-value="${(suggestion.value || "")
              .toString()
              .replace(/"/g, "&quot;")}" data-field="${
                field.id || field.name || "unknown"
              }" style="
              padding: 12px 16px !important;
              cursor: pointer !important;
              border-bottom: 1px solid #f1f5f9 !important;
              transition: background-color 0.2s !important;
              display: flex !important;
              flex-direction: column !important;
              gap: 4px !important;
            " onmouseover="this.style.backgroundColor='#f8fafc'" onmouseout="this.style.backgroundColor='transparent'">
              <span style="
                font-weight: 600 !important;
                color: #334155 !important;
                font-size: 13px !important;
              ">${suggestion.label || "No label"}</span>
              <span style="
                color: #64748b !important;
                font-size: 12px !important;
                line-height: 1.4 !important;
                word-break: break-word !important;
              ">${this.truncateText(suggestion.value || "", 50)}</span>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    } catch (error) {
      console.error("Error creating popup HTML:", error);
      popup.innerHTML = `
        <div style="padding: 16px; color: #dc2626; font-size: 14px;">
          Error creating suggestions popup
        </div>
      `;
    }

    // Add event listeners
    const closeBtn = popup.querySelector(".suggestion-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        popup.remove();
      });
    }

    const suggestionItems = popup.querySelectorAll(".suggestion-item");
    suggestionItems.forEach((item) => {
      item.addEventListener("click", () => {
        const value = item.dataset.value;
        const fieldId = item.dataset.field;
        this.fillFieldAndClose(fieldId, value, item);
      });
    });

    // Position popup near the field
    if (field && typeof field.getBoundingClientRect === "function") {
      const rect = field.getBoundingClientRect();
      const popupWidth = 300;

      // Position on the left side of the field
      if (rect.left >= popupWidth + 10) {
        popup.style.left = `${rect.left - popupWidth - 10}px`;
      } else {
        // Not enough space on left - position on right
        const viewportWidth = window.innerWidth;
        if (rect.right + popupWidth + 10 <= viewportWidth) {
          popup.style.left = `${rect.right + 10}px`;
        } else {
          popup.style.left = "10px";
        }
      }

      popup.style.top = `${rect.top}px`;
    } else {
      // Default positioning when field is not available
      popup.style.left = "20px";
      popup.style.top = "20px";
    }
    popup.className = "job-filler-suggestions";

    document.body.appendChild(popup);
    this.suggestionPopup = popup;

    // Force styles for better browser compatibility
    setTimeout(() => {
      popup.style.setProperty("position", "fixed", "important");
      popup.style.setProperty("z-index", "2147483647", "important");
      popup.style.setProperty("display", "block", "important");
      popup.style.setProperty("visibility", "visible", "important");
      popup.style.setProperty("opacity", "1", "important");
    }, 10);
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

  // Helper method for popup clicks
  fillFieldAndClose(fieldIdentifier, value, element) {
    const field =
      document.getElementById(fieldIdentifier) ||
      document.querySelector(`[name="${fieldIdentifier}"]`);
    if (field) {
      this.fillField(field, value);
      this.hideSuggestions();
      console.log("✅ Field filled:", fieldIdentifier, "with:", value);
    }
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
    // Handle null, undefined, or non-string values
    if (text == null) return "";
    const str = text.toString();
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + "...";
  }

  debounce(func, delay) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(func, delay);
  }

  showGlobalContextInvalidatedMessage() {
    // Prevent showing multiple messages
    if (document.getElementById("extension-context-invalidated-popup")) {
      return;
    }

    // Create a user-friendly notification popup
    const popup = document.createElement("div");
    popup.id = "extension-context-invalidated-popup";
    popup.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #fff;
        border: 2px solid #ff6b6b;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        max-width: 320px;
        color: #333;
      ">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <div style="
            width: 20px;
            height: 20px;
            background: #ff6b6b;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            margin-right: 8px;
          ">!</div>
          <strong style="color: #ff6b6b;">Extension Reloaded</strong>
        </div>
        <p style="margin: 0 0 12px 0; line-height: 1.4;">
          The Job Application Extension was reloaded. Please refresh this page to restore full functionality.
        </p>
        <div style="display: flex; gap: 8px;">
          <button onclick="window.location.reload()" style="
            background: #007cba;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
          ">Refresh Page</button>
          <button onclick="this.closest('div[id=extension-context-invalidated-popup]').remove()" style="
            background: #f0f0f0;
            color: #666;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
          ">Dismiss</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Auto-remove after 30 seconds if user doesn't interact
    setTimeout(() => {
      const existingPopup = document.getElementById(
        "extension-context-invalidated-popup"
      );
      if (existingPopup) {
        existingPopup.remove();
      }
    }, 30000);
  }

  sendMessage(message) {
    return new Promise((resolve) => {
      try {
        // Check if chrome runtime is available
        if (!chrome || !chrome.runtime) {
          this.showGlobalContextInvalidatedMessage();
          resolve({ success: false, error: "Chrome runtime not available" });
          return;
        }

        // Check if extension context is still valid
        if (!chrome.runtime.id) {
          this.showGlobalContextInvalidatedMessage();
          resolve({ success: false, error: "Extension context invalidated" });
          return;
        }

        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            const errorMessage = chrome.runtime.lastError.message;

            // Handle specific extension context errors
            if (
              errorMessage.includes("Extension context invalidated") ||
              errorMessage.includes("message port closed") ||
              errorMessage.includes("receiving end does not exist")
            ) {
              this.showGlobalContextInvalidatedMessage();
              resolve({
                success: false,
                error: "Extension reloaded - please refresh the page",
                contextInvalidated: true,
              });
            } else {
              console.error("Chrome runtime error:", errorMessage);
              resolve({
                success: false,
                error: errorMessage,
              });
            }
          } else {
            resolve(
              response || { success: false, error: "No response received" }
            );
          }
        });
      } catch (error) {
        console.error("Error sending message:", error);
        resolve({ success: false, error: error.message });
      }
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
