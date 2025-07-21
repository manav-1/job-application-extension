// Gemini Provider Implementation
class GeminiProvider extends AIProvider {
  constructor(apiKey) {
    super(apiKey);
    this.baseURL = "https://generativelanguage.googleapis.com/v1beta";
    this.model = "gemini-pro";
  }

  async generateCoverLetter(jobInfo, userData) {
    const prompt = this._buildCoverLetterPrompt(jobInfo, userData);

    const response = await this._makeRequest(
      `/models/${this.model}:generateContent`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are a professional career advisor and expert cover letter writer. Generate high-quality, personalized cover letters that help candidates stand out.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
        },
      }
    );

    return (
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Error generating cover letter with AI."
    );
  }

  async generateInterviewQuestions(jobTitle, userData) {
    const prompt = this._buildInterviewQuestionsPrompt(jobTitle, userData);

    const response = await this._makeRequest(
      `/models/${this.model}:generateContent`,
      {
        contents: [
          {
            parts: [
              {
                text: `You are an expert HR professional and interviewer. Generate thoughtful, relevant interview questions that help assess candidates effectively. Always return valid JSON.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
        },
      }
    );

    const content = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("No content received from Gemini API");
    }

    try {
      // Clean up the response - sometimes Gemini adds markdown code blocks
      const cleanContent = content.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", content);
      throw new Error("Invalid JSON response from Gemini");
    }
  }

  async _makeRequest(endpoint, data) {
    const response = await fetch(
      `${this.baseURL}${endpoint}?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(
        `Gemini API error: ${response.status} - ${response.statusText}. ${errorData}`
      );
    }

    return response.json();
  }

  _buildCoverLetterPrompt(jobInfo, userData) {
    return `Generate a professional cover letter for the following job application:

Job Title: ${jobInfo.title || "N/A"}
Company: ${jobInfo.company || "N/A"}
Personal Reason for Interest: ${jobInfo.personalizedReason || "N/A"}

Applicant Information:
Name: ${userData.personalInfo?.firstName || ""} ${
      userData.personalInfo?.lastName || ""
    }
Skills: ${userData.skills?.join(", ") || "N/A"}
Most Recent Experience: ${userData.experience?.[0]?.position || "N/A"} at ${
      userData.experience?.[0]?.company || "N/A"
    }
Experience Description: ${userData.experience?.[0]?.description || "N/A"}
Education: ${userData.education?.[0]?.degree || "N/A"} from ${
      userData.education?.[0]?.institution || "N/A"
    }

Please write a compelling, professional cover letter that:
1. Is personalized to the company and role
2. Highlights relevant experience and skills
3. Shows genuine interest in the position
4. Is concise (3-4 paragraphs)
5. Uses a professional tone

Format it as a complete cover letter with proper salutation and closing.`;
  }

  _buildInterviewQuestionsPrompt(jobTitle, userData) {
    return `Generate 8-12 relevant interview questions for a ${jobTitle} position. 

Applicant Background:
- Skills: ${userData.skills?.join(", ") || "N/A"}
- Experience: ${userData.experience?.[0]?.position || "N/A"} at ${
      userData.experience?.[0]?.company || "N/A"
    }
- Education: ${userData.education?.[0]?.degree || "N/A"}

Please provide a mix of:
1. General interview questions (2-3)
2. Role-specific technical questions (3-4) 
3. Behavioral questions (2-3)
4. Company culture/motivation questions (2-3)

Format each question as a JSON object with:
- question: The interview question
- category: One of "general", "technical", "behavioral", "company"
- suggested_answer: Leave empty string

Return as a valid JSON array only, no additional text or markdown formatting.`;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = GeminiProvider;
} else {
  window.GeminiProvider = GeminiProvider;
}
