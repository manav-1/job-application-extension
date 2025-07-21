// AI Provider Interface
class AIProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generateCoverLetter(jobInfo, userData) {
    throw new Error("generateCoverLetter method must be implemented");
  }

  async generateInterviewQuestions(jobTitle, userData) {
    throw new Error("generateInterviewQuestions method must be implemented");
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AIProvider;
} else {
  window.AIProvider = AIProvider;
}
