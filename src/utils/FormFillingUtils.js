// Form Filling Utilities
class FormFillingUtils {
  // Fill input field with value
  static fillField(element, value) {
    if (!element || value === undefined || value === null) {
      return false;
    }

    // Handle different input types
    switch (element.type) {
      case "checkbox":
        element.checked = Boolean(value);
        break;
      case "radio":
        if (element.value === String(value)) {
          element.checked = true;
        }
        break;
      case "select-one":
      case "select-multiple":
        this._selectOption(element, value);
        break;
      default:
        element.value = String(value);
        break;
    }

    // Trigger events to notify the page
    this._triggerEvents(element);
    return true;
  }

  // Select option in dropdown
  static _selectOption(selectElement, value) {
    const options = Array.from(selectElement.options);
    const matchingOption = options.find(
      (option) =>
        option.value === String(value) ||
        option.textContent.toLowerCase().includes(String(value).toLowerCase())
    );

    if (matchingOption) {
      matchingOption.selected = true;
    }
  }

  // Trigger necessary events for form validation
  static _triggerEvents(element) {
    const events = ["input", "change", "blur", "keyup"];

    events.forEach((eventType) => {
      const event = new Event(eventType, {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
    });
  }

  // Create visual feedback for filled fields
  static addVisualFeedback(element, success = true) {
    if (!element) return;

    element.classList.remove("extension-filled", "extension-error");
    element.classList.add(success ? "extension-filled" : "extension-error");

    // Remove class after animation
    setTimeout(() => {
      element.classList.remove("extension-filled", "extension-error");
    }, 2000);
  }

  // Scroll element into view smoothly
  static scrollToElement(element) {
    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }

  // Check if element is in viewport
  static isElementInViewport(element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // Wait for element to be available
  static waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  // Create and show notification
  static showNotification(message, type = "info", duration = 3000) {
    const notification = document.createElement("div");
    notification.className = `extension-notification extension-notification-${type}`;
    notification.textContent = message;

    // Style the notification
    Object.assign(notification.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      backgroundColor: type === "error" ? "#dc3545" : "#28a745",
      color: "white",
      padding: "12px 20px",
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      zIndex: "10000",
      fontSize: "14px",
      fontFamily: "system-ui, sans-serif",
      maxWidth: "300px",
      wordWrap: "break-word",
    });

    document.body.appendChild(notification);

    // Remove notification after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, duration);

    return notification;
  }

  // Highlight element temporarily
  static highlightElement(element, duration = 2000) {
    if (!element) return;

    const originalStyle = {
      outline: element.style.outline,
      outlineOffset: element.style.outlineOffset,
    };

    element.style.outline = "2px solid #007bff";
    element.style.outlineOffset = "2px";

    setTimeout(() => {
      element.style.outline = originalStyle.outline;
      element.style.outlineOffset = originalStyle.outlineOffset;
    }, duration);
  }

  // Get form data as object
  static getFormData(form) {
    const formData = {};
    const elements = form.querySelectorAll("input, textarea, select");

    elements.forEach((element) => {
      if (element.name) {
        if (element.type === "checkbox") {
          formData[element.name] = element.checked;
        } else if (element.type === "radio") {
          if (element.checked) {
            formData[element.name] = element.value;
          }
        } else {
          formData[element.name] = element.value;
        }
      }
    });

    return formData;
  }

  // Validate email format
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone format
  static isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)\.]/g, ""));
  }

  // Format phone number
  static formatPhoneNumber(phone, format = "US") {
    const cleaned = phone.replace(/\D/g, "");

    if (format === "US" && cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6
      )}`;
    }

    return phone;
  }

  // Create loading spinner
  static createLoadingSpinner() {
    const spinner = document.createElement("div");
    spinner.className = "extension-loading-spinner";

    Object.assign(spinner.style, {
      width: "20px",
      height: "20px",
      border: "2px solid #f3f3f3",
      borderTop: "2px solid #007bff",
      borderRadius: "50%",
      animation: "extension-spin 1s linear infinite",
      display: "inline-block",
    });

    // Add CSS animation if not already added
    if (!document.getElementById("extension-spinner-styles")) {
      const style = document.createElement("style");
      style.id = "extension-spinner-styles";
      style.textContent = `
        @keyframes extension-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .extension-filled {
          border: 2px solid #28a745 !important;
          background-color: #f8fff8 !important;
        }
        .extension-error {
          border: 2px solid #dc3545 !important;
          background-color: #fff8f8 !important;
        }
      `;
      document.head.appendChild(style);
    }

    return spinner;
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function
  static throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Deep clone object
  static deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof Array) {
      return obj.map((item) => this.deepClone(item));
    }

    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key]);
      }
    }

    return cloned;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = FormFillingUtils;
} else {
  window.FormFillingUtils = FormFillingUtils;
}
