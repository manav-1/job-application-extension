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

  // Get suggestions for a specific field based on field info and user data
  getSuggestionsForField(fieldInfo, userData) {
    const suggestions = [];

    // Detect field type based on field info
    const fieldType = this.detectFieldType(fieldInfo);

    if (!fieldType || !userData) {
      return suggestions;
    }

    // Get relevant data from userData based on field type
    switch (fieldType) {
      case "firstName":
        if (userData.firstName)
          suggestions.push({ label: "First Name", value: userData.firstName });
        break;
      case "lastName":
        if (userData.lastName)
          suggestions.push({ label: "Last Name", value: userData.lastName });
        break;
      case "fullName":
        if (userData.firstName && userData.lastName) {
          suggestions.push({
            label: "Full Name",
            value: `${userData.firstName} ${userData.lastName}`,
          });
        }
        break;
      case "email":
        if (userData.email)
          suggestions.push({ label: "Email", value: userData.email });
        break;
      case "phone":
        if (userData.phone)
          suggestions.push({ label: "Phone", value: userData.phone });
        break;
      case "address":
        if (userData.address)
          suggestions.push({ label: "Address", value: userData.address });
        break;
      case "city":
        if (userData.city)
          suggestions.push({ label: "City", value: userData.city });
        break;
      case "state":
        if (userData.state)
          suggestions.push({ label: "State", value: userData.state });
        break;
      case "zipCode":
        if (userData.zipCode)
          suggestions.push({ label: "Zip Code", value: userData.zipCode });
        break;
      case "country":
        if (userData.country)
          suggestions.push({ label: "Country", value: userData.country });
        break;
      case "linkedin":
        if (userData.linkedin)
          suggestions.push({ label: "LinkedIn", value: userData.linkedin });
        break;
      case "github":
        if (userData.github)
          suggestions.push({ label: "GitHub", value: userData.github });
        break;
      case "website":
        if (userData.website)
          suggestions.push({ label: "Website", value: userData.website });
        break;
      case "coverLetter":
        if (userData.coverLetter)
          suggestions.push({
            label: "Cover Letter",
            value: userData.coverLetter,
          });
        break;
      case "summary":
        if (userData.summary)
          suggestions.push({
            label: "Professional Summary",
            value: userData.summary,
          });
        break;
      case "experience":
        if (
          userData.experienceHistory &&
          userData.experienceHistory.length > 0
        ) {
          userData.experienceHistory.forEach((exp, index) => {
            if (exp.description) {
              suggestions.push({
                label: `Experience ${index + 1} - ${exp.title || "Position"}`,
                value: exp.description,
              });
            }
          });
        }
        break;
      case "skills":
        if (userData.skills)
          suggestions.push({ label: "Skills", value: userData.skills });
        break;
      case "education":
        if (userData.educationHistory && userData.educationHistory.length > 0) {
          userData.educationHistory.forEach((edu, index) => {
            if (edu.degree && edu.institution) {
              suggestions.push({
                label: `Education ${index + 1}`,
                value: `${edu.degree} - ${edu.institution}`,
              });
            }
          });
        }
        if (userData.highestDegree)
          suggestions.push({ label: "Degree", value: userData.highestDegree });
        if (userData.institution)
          suggestions.push({
            label: "Institution",
            value: userData.institution,
          });
        break;
      default:
        // For unrecognized fields, try to suggest based on similar field names
        this.addGenericSuggestions(fieldInfo, userData, suggestions);
    }

    return suggestions;
  }

  // Detect field type based on field information
  detectFieldType(fieldInfo) {
    const text = (
      fieldInfo.fieldName +
      " " +
      fieldInfo.fieldId +
      " " +
      fieldInfo.placeholder +
      " " +
      fieldInfo.label
    ).toLowerCase();

    // Name fields
    if (text.includes("first") && text.includes("name")) return "firstName";
    if (text.includes("last") && text.includes("name")) return "lastName";
    if (text.includes("full") && text.includes("name")) return "fullName";
    if (
      text.includes("name") &&
      !text.includes("company") &&
      !text.includes("file")
    )
      return "fullName";

    // Contact fields
    if (text.includes("email")) return "email";
    if (text.includes("phone") || text.includes("tel")) return "phone";

    // Address fields
    if (text.includes("address") && !text.includes("email")) return "address";
    if (text.includes("city")) return "city";
    if (text.includes("state") || text.includes("province")) return "state";
    if (text.includes("zip") || text.includes("postal")) return "zipCode";
    if (text.includes("country")) return "country";

    // Social/Web fields
    if (text.includes("linkedin")) return "linkedin";
    if (text.includes("github")) return "github";
    if (text.includes("website") || text.includes("portfolio"))
      return "website";

    // Professional fields
    if (text.includes("cover") && text.includes("letter")) return "coverLetter";
    if (text.includes("summary") || text.includes("about")) return "summary";
    if (
      text.includes("experience") ||
      text.includes("work") ||
      text.includes("job")
    )
      return "experience";
    if (text.includes("skill")) return "skills";
    if (
      text.includes("education") ||
      text.includes("degree") ||
      text.includes("university") ||
      text.includes("college")
    )
      return "education";

    return null;
  }

  // Add generic suggestions for unrecognized fields
  addGenericSuggestions(fieldInfo, userData, suggestions) {
    const text = (
      fieldInfo.fieldName +
      " " +
      fieldInfo.fieldId +
      " " +
      fieldInfo.placeholder +
      " " +
      fieldInfo.label
    ).toLowerCase();

    // Try to match any user data that might be relevant
    Object.keys(userData).forEach((key) => {
      if (
        userData[key] &&
        typeof userData[key] === "string" &&
        userData[key].trim()
      ) {
        if (text.includes(key.toLowerCase())) {
          suggestions.push({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: userData[key],
          });
        }
      }
    });
  }
}

// Make available in content script context
if (typeof module !== "undefined" && module.exports) {
  module.exports = FieldDetectionService;
} else if (typeof globalThis !== "undefined") {
  globalThis.FieldDetectionService = FieldDetectionService;
}
