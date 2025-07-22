console.log("🔧 Debug script running");

// Function to test extension manually
window.debugExtension = function () {
  console.log("🧪 Running extension debug test...");

  // Check if content script is loaded
  if (typeof jobApplicationFiller !== "undefined") {
    console.log("✅ Content script loaded");
    console.log("📊 Current state:", {
      isEnabled: jobApplicationFiller.isEnabled,
      showSuggestions: jobApplicationFiller.showSuggestions,
      currentField: jobApplicationFiller.currentField,
    });
  } else {
    console.log("❌ Content script not found");
  }

  // Test message to background
  chrome.runtime.sendMessage({ action: "getUserData" }, (response) => {
    console.log("📨 getUserData response:", response);
  });

  // Test field focus
  const firstNameField = document.getElementById("firstName");
  if (firstNameField) {
    console.log("🎯 Testing field focus on firstName...");
    firstNameField.focus();

    // Manually trigger showFieldSuggestions if available
    if (
      typeof jobApplicationFiller !== "undefined" &&
      jobApplicationFiller.showFieldSuggestions
    ) {
      jobApplicationFiller.showFieldSuggestions(firstNameField);
    }

    // Test direct popup creation
    if (
      typeof jobApplicationFiller !== "undefined" &&
      jobApplicationFiller.testSuggestionPopup
    ) {
      console.log("🧪 Testing direct popup creation...");
      jobApplicationFiller.testSuggestionPopup(firstNameField);
    }

    // Test Brave-specific popup
    if (
      typeof jobApplicationFiller !== "undefined" &&
      jobApplicationFiller.testBravePopup
    ) {
      console.log("🦁 Testing Brave-specific popup...");
      jobApplicationFiller.testBravePopup(firstNameField);
    }
  }
};

// Add Brave test function
window.testBrave = function () {
  console.log("🦁 Running Brave browser test...");

  const field = document.getElementById("firstName");
  if (field && typeof jobApplicationFiller !== "undefined") {
    jobApplicationFiller.testBravePopup(field);
  } else {
    console.log("❌ Field or content script not found");
  }
};

// Add a simple test button
window.addEventListener("DOMContentLoaded", () => {
  const button = document.createElement("button");
  button.textContent = "Debug Extension";
  button.style.position = "fixed";
  button.style.top = "10px";
  button.style.right = "10px";
  button.style.zIndex = "999999";
  button.style.background = "#007bff";
  button.style.color = "white";
  button.style.border = "none";
  button.style.padding = "10px";
  button.style.borderRadius = "4px";
  button.onclick = debugExtension;
  document.body.appendChild(button);
});

console.log("✅ Debug script ready - type debugExtension() to test");
