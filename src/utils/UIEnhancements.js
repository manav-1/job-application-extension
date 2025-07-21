// Notification System for AI Job Assistant
class NotificationSystem {
  constructor() {
    this.container = document.getElementById("toastContainer");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "toastContainer";
      this.container.className = "toast-container";
      document.body.appendChild(this.container);
    }
  }

  showToast(message, type = "info", duration = 4000, title = null) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };

    const toastId = Date.now() + Math.random();
    toast.dataset.toastId = toastId;

    const titleElement = title
      ? `
      <div class="toast-header">
        <span>${icons[type] || "📢"}</span>
        <span>${title}</span>
      </div>
    `
      : "";

    toast.innerHTML = `
      ${titleElement}
      <div class="toast-body">${message}</div>
      <button class="toast-close" onclick="notifications.closeToast('${toastId}')">×</button>
    `;

    this.container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add("show");
    });

    // Auto remove
    if (duration > 0) {
      setTimeout(() => {
        this.closeToast(toastId);
      }, duration);
    }

    return toastId;
  }

  closeToast(toastId) {
    const toast = document.querySelector(`[data-toast-id="${toastId}"]`);
    if (toast) {
      toast.classList.remove("show");
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }
  }

  success(message, title = "Success") {
    return this.showToast(message, "success", 4000, title);
  }

  error(message, title = "Error") {
    return this.showToast(message, "error", 6000, title);
  }

  warning(message, title = "Warning") {
    return this.showToast(message, "warning", 5000, title);
  }

  info(message, title = "Info") {
    return this.showToast(message, "info", 4000, title);
  }
}

// UI Enhancement utilities
class UIEnhancements {
  static showLoadingOverlay(element, message = "Loading...") {
    const overlay = document.createElement("div");
    overlay.className = "loading-overlay";
    overlay.innerHTML = `
      <div class="loading-spinner"></div>
      <div style="margin-top: 16px; font-size: 14px; color: var(--gray-600);">${message}</div>
    `;

    element.style.position = "relative";
    element.appendChild(overlay);

    return overlay;
  }

  static hideLoadingOverlay(element) {
    const overlay = element.querySelector(".loading-overlay");
    if (overlay) {
      overlay.remove();
    }
  }

  static createModal(title, content, actions = []) {
    const modalOverlay = document.createElement("div");
    modalOverlay.className = "modal-overlay";

    const actionsHTML = actions
      .map(
        (action) =>
          `<button class="btn ${action.class || ""}" onclick="${
            action.onclick
          }">${action.text}</button>`
      )
      .join("");

    modalOverlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">${content}</div>
        ${actionsHTML ? `<div class="action-buttons">${actionsHTML}</div>` : ""}
      </div>
    `;

    document.body.appendChild(modalOverlay);

    requestAnimationFrame(() => {
      modalOverlay.classList.add("show");
    });

    return modalOverlay;
  }

  static updateProgressBar(element, percentage) {
    const progressBar = element.querySelector(".progress-fill");
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    }
  }

  static createProgressBar(percentage = 0) {
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    progressBar.innerHTML = `<div class="progress-fill" style="width: ${percentage}%"></div>`;
    return progressBar;
  }

  static animateCounter(element, target, duration = 2000) {
    const start = parseInt(element.textContent) || 0;
    const difference = target - start;
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(
        start + difference * this.easeOutQuart(progress)
      );

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  static easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  static addRippleEffect(element) {
    element.addEventListener("click", function (e) {
      const ripple = document.createElement("span");
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s linear;
        background-color: rgba(255, 255, 255, 0.7);
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
      `;

      this.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  }

  static enableDragAndDrop(element, onDrop, allowedTypes = []) {
    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      element.classList.add("drag-over");
    });

    element.addEventListener("dragleave", (e) => {
      if (!element.contains(e.relatedTarget)) {
        element.classList.remove("drag-over");
      }
    });

    element.addEventListener("drop", (e) => {
      e.preventDefault();
      element.classList.remove("drag-over");

      const files = Array.from(e.dataTransfer.files);
      const validFiles =
        allowedTypes.length === 0
          ? files
          : files.filter((file) =>
              allowedTypes.some((type) => file.type.includes(type))
            );

      if (validFiles.length > 0) {
        onDrop(validFiles);
      }
    });
  }

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

  static throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }
}

// Add ripple effect CSS
const rippleCSS = document.createElement("style");
rippleCSS.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .btn {
    position: relative;
    overflow: hidden;
  }
`;
document.head.appendChild(rippleCSS);

// Initialize global notification system
const notifications = new NotificationSystem();

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = { NotificationSystem, UIEnhancements };
}
