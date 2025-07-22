// AI Provider Factory
class AIProviderFactory {
  static create(provider, apiKey) {
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
      throw new Error("API key is required and must be a non-empty string");
    }

    switch (provider.toLowerCase()) {
      case "openai":
        return new OpenAIProvider(apiKey);
      case "gemini":
        return new GeminiProvider(apiKey);
      default:
        throw new Error(
          `Unsupported AI provider: ${provider}. Supported providers: 'openai', 'gemini'`
        );
    }
  }

  static getSupportedProviders() {
    return ["openai", "gemini"];
  }

  static isProviderSupported(provider) {
    return this.getSupportedProviders().includes(provider.toLowerCase());
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = AIProviderFactory;
} else if (typeof window !== "undefined") {
  window.AIProviderFactory = AIProviderFactory;
} else if (typeof globalThis !== "undefined") {
  globalThis.AIProviderFactory = AIProviderFactory;
}
