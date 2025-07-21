// Field Detection Service
class FieldDetectionService {
  constructor() {
    this.commonSelectors = {
      input: "input",
      textarea: "textarea",
      select: "select",
      form: "form",
    };
  }

  // Main field detection method
  detectFields(fieldMappings) {
    const fields = {};
    const allInputs = this._getAllFormInputs();

    for (const [fieldType, keywords] of Object.entries(fieldMappings)) {
      const detectedField = this._findFieldByKeywords(allInputs, keywords);
      if (detectedField) {
        fields[fieldType] = detectedField;
      }
    }

    return fields;
  }

  // Get all form inputs on the page
  _getAllFormInputs() {
    const inputs = [];

    // Get all input elements
    const inputElements = document.querySelectorAll(this.commonSelectors.input);
    const textareaElements = document.querySelectorAll(
      this.commonSelectors.textarea
    );
    const selectElements = document.querySelectorAll(
      this.commonSelectors.select
    );

    inputs.push(...Array.from(inputElements));
    inputs.push(...Array.from(textareaElements));
    inputs.push(...Array.from(selectElements));

    return inputs;
  }

  // Find field by matching keywords
  _findFieldByKeywords(inputs, keywords) {
    for (const input of inputs) {
      if (this._isFieldMatch(input, keywords)) {
        return input;
      }
    }
    return null;
  }

  // Check if a field matches any of the keywords
  _isFieldMatch(element, keywords) {
    const searchText = this._getElementSearchText(element).toLowerCase();

    return keywords.some((keyword) =>
      searchText.includes(keyword.toLowerCase())
    );
  }

  // Extract searchable text from an element
  _getElementSearchText(element) {
    const searchTexts = [
      element.name || "",
      element.id || "",
      element.className || "",
      element.placeholder || "",
      element.getAttribute("data-testid") || "",
      element.getAttribute("aria-label") || "",
      element.getAttribute("aria-labelledby") || "",
    ];

    // Add label text if associated
    const labelText = this._getLabelText(element);
    if (labelText) {
      searchTexts.push(labelText);
    }

    return searchTexts.join(" ");
  }

  // Get associated label text
  _getLabelText(element) {
    // Try to find label by 'for' attribute
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) {
        return label.textContent || "";
      }
    }

    // Try to find parent label
    const parentLabel = element.closest("label");
    if (parentLabel) {
      return parentLabel.textContent || "";
    }

    // Try to find aria-labelledby
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) {
        return labelElement.textContent || "";
      }
    }

    return "";
  }

  // Advanced field detection with ML-like scoring
  detectFieldsWithScoring(fieldMappings, threshold = 0.6) {
    const fields = {};
    const allInputs = this._getAllFormInputs();

    for (const [fieldType, keywords] of Object.entries(fieldMappings)) {
      const scoredFields = allInputs
        .map((input) => ({
          element: input,
          score: this._calculateFieldScore(input, keywords),
        }))
        .filter((item) => item.score >= threshold)
        .sort((a, b) => b.score - a.score);

      if (scoredFields.length > 0) {
        fields[fieldType] = scoredFields[0].element;
      }
    }

    return fields;
  }

  // Calculate matching score for a field
  _calculateFieldScore(element, keywords) {
    const searchText = this._getElementSearchText(element).toLowerCase();
    const words = searchText.split(/\s+/);

    let score = 0;
    let totalKeywords = keywords.length;

    for (const keyword of keywords) {
      const keywordLower = keyword.toLowerCase();

      // Exact match in any attribute gets highest score
      if (searchText.includes(keywordLower)) {
        // Full keyword match
        if (words.includes(keywordLower)) {
          score += 1.0;
        } else {
          // Partial match
          score += 0.7;
        }
      }

      // Check for partial matches
      const partialMatches = words.filter(
        (word) => word.includes(keywordLower) || keywordLower.includes(word)
      );

      if (partialMatches.length > 0) {
        score += 0.5;
      }
    }

    return totalKeywords > 0 ? score / totalKeywords : 0;
  }

  // Detect file upload fields
  detectFileUploadFields() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const fields = {};

    for (const input of fileInputs) {
      const searchText = this._getElementSearchText(input).toLowerCase();

      if (this._isResumeField(searchText)) {
        fields.resume = input;
      } else if (this._isCoverLetterField(searchText)) {
        fields.coverLetter = input;
      }
    }

    return fields;
  }

  // Check if field is for resume upload
  _isResumeField(searchText) {
    const resumeKeywords = ["resume", "cv", "curriculum", "vitae"];
    return resumeKeywords.some((keyword) => searchText.includes(keyword));
  }

  // Check if field is for cover letter upload
  _isCoverLetterField(searchText) {
    const coverLetterKeywords = ["cover", "letter", "motivation", "statement"];
    return coverLetterKeywords.some((keyword) => searchText.includes(keyword));
  }

  // Get all forms on the page
  getAllForms() {
    return Array.from(document.querySelectorAll(this.commonSelectors.form));
  }

  // Check if element is visible and interactable
  isElementInteractable(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();

    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.opacity !== "0" &&
      rect.width > 0 &&
      rect.height > 0 &&
      !element.disabled &&
      !element.readOnly
    );
  }

  // Get form context information
  getFormContext(element) {
    const form = element.closest("form");
    if (!form) return null;

    return {
      action: form.action || "",
      method: form.method || "get",
      name: form.name || "",
      id: form.id || "",
      fieldCount: form.querySelectorAll("input, textarea, select").length,
    };
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = FieldDetectionService;
} else {
  window.FieldDetectionService = FieldDetectionService;
}
