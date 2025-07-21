// OpenAI Provider Implementation
class OpenAIProvider extends AIProvider {
  constructor(apiKey) {
    super(apiKey);
    this.baseURL = "https://api.openai.com/v1";
    this.model = "gpt-3.5-turbo";
  }

  async generateCoverLetter(jobInfo, userData) {
    const prompt = this._buildCoverLetterPrompt(jobInfo, userData);

    const response = await this._makeRequest("/chat/completions", {
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are a professional career advisor and expert cover letter writer. Generate high-quality, personalized cover letters that help candidates stand out.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    return (
      response.choices[0]?.message?.content ||
      "Error generating cover letter with AI."
    );
  }

  async generateInterviewQuestions(jobTitle, userData) {
    const prompt = this._buildInterviewQuestionsPrompt(jobTitle, userData);

    const response = await this._makeRequest("/chat/completions", {
      model: this.model,
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR professional and interviewer. Generate thoughtful, relevant interview questions that help assess candidates effectively. Always return valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response as JSON:", content);
      throw new Error("Invalid JSON response from OpenAI");
    }
  }

  async _makeRequest(endpoint, data) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error: ${response.status} - ${response.statusText}`
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

Return as a valid JSON array.`;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = OpenAIProvider;
} else {
  window.OpenAIProvider = OpenAIProvider;
}
