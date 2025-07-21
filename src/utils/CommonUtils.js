// Notification Utilities
class NotificationUtils {
  static async showNotification(title, message, type = "basic", priority = 0) {
    try {
      await chrome.notifications.create({
        type: type,
        iconUrl: "../icons/icon48.png",
        title: title,
        message: message,
        priority: priority,
      });
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }

  static async showSuccess(title, message) {
    return this.showNotification(title, message, "basic", 1);
  }

  static async showError(title, message) {
    return this.showNotification(title, message, "basic", 2);
  }

  static async showProgress(title, message, progress) {
    try {
      await chrome.notifications.create({
        type: "progress",
        iconUrl: "../icons/icon48.png",
        title: title,
        message: message,
        progress: progress,
      });
    } catch (error) {
      console.error("Failed to show progress notification:", error);
    }
  }
}

// Date/Time Utilities
class DateUtils {
  static formatDate(date, format = "YYYY-MM-DD") {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    switch (format) {
      case "YYYY-MM-DD":
        return `${year}-${month}-${day}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "YYYY-MM-DD HH:mm":
        return `${year}-${month}-${day} ${hours}:${minutes}`;
      default:
        return d.toLocaleDateString();
    }
  }

  static getRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diffMs = now - target;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return "just now";
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else {
      return this.formatDate(date);
    }
  }

  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isToday(date) {
    const today = new Date();
    const target = new Date(date);

    return (
      today.getDate() === target.getDate() &&
      today.getMonth() === target.getMonth() &&
      today.getFullYear() === target.getFullYear()
    );
  }
}

// Validation Utilities
class ValidationUtils {
  static validateEmail(email) {
    if (!email || typeof email !== "string") {
      return { valid: false, message: "Email is required" };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Invalid email format" };
    }

    return { valid: true, message: "" };
  }

  static validatePhone(phone) {
    if (!phone || typeof phone !== "string") {
      return { valid: false, message: "Phone number is required" };
    }

    const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");
    const phoneRegex = /^[\+]?[1-9][\d]{9,14}$/;

    if (!phoneRegex.test(cleaned)) {
      return { valid: false, message: "Invalid phone number format" };
    }

    return { valid: true, message: "" };
  }

  static validateRequired(value, fieldName) {
    if (!value || (typeof value === "string" && value.trim() === "")) {
      return { valid: false, message: `${fieldName} is required` };
    }
    return { valid: true, message: "" };
  }

  static validateUrl(url) {
    if (!url || typeof url !== "string") {
      return { valid: false, message: "URL is required" };
    }

    try {
      new URL(url);
      return { valid: true, message: "" };
    } catch {
      return { valid: false, message: "Invalid URL format" };
    }
  }

  static validateObject(obj, schema) {
    const errors = {};

    for (const [field, rules] of Object.entries(schema)) {
      const value = obj[field];

      if (rules.required) {
        const requiredResult = this.validateRequired(value, field);
        if (!requiredResult.valid) {
          errors[field] = requiredResult.message;
          continue;
        }
      }

      if (value && rules.type) {
        switch (rules.type) {
          case "email":
            const emailResult = this.validateEmail(value);
            if (!emailResult.valid) {
              errors[field] = emailResult.message;
            }
            break;
          case "phone":
            const phoneResult = this.validatePhone(value);
            if (!phoneResult.valid) {
              errors[field] = phoneResult.message;
            }
            break;
          case "url":
            const urlResult = this.validateUrl(value);
            if (!urlResult.valid) {
              errors[field] = urlResult.message;
            }
            break;
        }
      }

      if (value && rules.minLength && value.length < rules.minLength) {
        errors[
          field
        ] = `${field} must be at least ${rules.minLength} characters`;
      }

      if (value && rules.maxLength && value.length > rules.maxLength) {
        errors[
          field
        ] = `${field} must not exceed ${rules.maxLength} characters`;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }
}

// Storage Utilities
class StorageUtils {
  static async get(key, defaultValue = null) {
    try {
      const result = await chrome.storage.local.get([key]);
      return result[key] !== undefined ? result[key] : defaultValue;
    } catch (error) {
      console.error("Storage get error:", error);
      return defaultValue;
    }
  }

  static async set(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error("Storage set error:", error);
      return false;
    }
  }

  static async remove(key) {
    try {
      await chrome.storage.local.remove(key);
      return true;
    } catch (error) {
      console.error("Storage remove error:", error);
      return false;
    }
  }

  static async clear() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error("Storage clear error:", error);
      return false;
    }
  }

  static async getSize() {
    try {
      const items = await chrome.storage.local.get(null);
      const size = JSON.stringify(items).length;
      return {
        bytes: size,
        kb: Math.round((size / 1024) * 100) / 100,
        mb: Math.round((size / (1024 * 1024)) * 100) / 100,
      };
    } catch (error) {
      console.error("Storage size error:", error);
      return { bytes: 0, kb: 0, mb: 0 };
    }
  }
}

// URL Utilities
class UrlUtils {
  static getCurrentDomain() {
    try {
      return new URL(window.location.href).hostname;
    } catch {
      return "unknown";
    }
  }

  static isJobSite(url) {
    const jobSites = [
      "linkedin.com",
      "indeed.com",
      "glassdoor.com",
      "monster.com",
      "ziprecruiter.com",
      "careerbuilder.com",
      "dice.com",
      "stackoverflow.com",
      "github.com",
      "angel.co",
      "wellfound.com",
    ];

    try {
      const hostname = new URL(url).hostname.toLowerCase();
      return jobSites.some((site) => hostname.includes(site));
    } catch {
      return false;
    }
  }

  static extractJobInfo(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      const pathname = urlObj.pathname;
      const searchParams = urlObj.searchParams;

      const jobInfo = {
        source: hostname,
        url: url,
        title: "",
        company: "",
        location: "",
      };

      // Extract job info based on known patterns
      if (hostname.includes("linkedin.com")) {
        jobInfo.title = searchParams.get("job-title") || "";
        jobInfo.company = searchParams.get("company") || "";
      } else if (hostname.includes("indeed.com")) {
        jobInfo.title = searchParams.get("q") || "";
        jobInfo.location = searchParams.get("l") || "";
      }

      return jobInfo;
    } catch {
      return {
        source: "unknown",
        url: url,
        title: "",
        company: "",
        location: "",
      };
    }
  }
}

// Export utilities
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    NotificationUtils,
    DateUtils,
    ValidationUtils,
    StorageUtils,
    UrlUtils,
  };
} else {
  window.NotificationUtils = NotificationUtils;
  window.DateUtils = DateUtils;
  window.ValidationUtils = ValidationUtils;
  window.StorageUtils = StorageUtils;
  window.UrlUtils = UrlUtils;
}
