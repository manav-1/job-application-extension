// Application Management Service
class ApplicationService {
  constructor(dataService) {
    this.dataService = dataService;
  }

  // Generate unique application ID
  generateApplicationId() {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create new application entry
  async createApplication(jobInfo, url) {
    const application = {
      id: this.generateApplicationId(),
      title: jobInfo.title || "Unknown Position",
      company: jobInfo.company || "Unknown Company",
      url: url || (typeof window !== "undefined" ? window.location.href : ""),
      status: "draft",
      appliedDate: null,
      createdDate: new Date().toISOString(),
      personalizedReason: jobInfo.personalizedReason || "",
      coverLetter: "",
      interviewQuestions: [],
      notes: "",
      followUpDate: null,
      salary: jobInfo.salary || "",
      location: jobInfo.location || "",
      jobType: jobInfo.jobType || "",
      source: this.extractJobSource(url),
      tags: [],
    };

    await this.dataService.saveApplication(application);
    return application;
  }

  // Update existing application
  async updateApplication(applicationId, updates) {
    const applications = await this.dataService.getApplications();
    const applicationIndex = applications.findIndex(
      (app) => app.id === applicationId
    );

    if (applicationIndex === -1) {
      throw new Error("Application not found");
    }

    const updatedApplication = {
      ...applications[applicationIndex],
      ...updates,
      lastModified: new Date().toISOString(),
    };

    await this.dataService.saveApplication(updatedApplication);
    return updatedApplication;
  }

  // Mark application as applied
  async markAsApplied(applicationId) {
    return this.updateApplication(applicationId, {
      status: "applied",
      appliedDate: new Date().toISOString(),
    });
  }

  // Add cover letter to application
  async addCoverLetter(applicationId, coverLetter) {
    return this.updateApplication(applicationId, {
      coverLetter: coverLetter,
      coverLetterGenerated: new Date().toISOString(),
    });
  }

  // Add interview questions to application
  async addInterviewQuestions(applicationId, questions) {
    return this.updateApplication(applicationId, {
      interviewQuestions: questions,
      interviewQuestionsGenerated: new Date().toISOString(),
    });
  }

  // Get applications with filtering and sorting
  async getApplications(
    filters = {},
    sortBy = "createdDate",
    sortOrder = "desc"
  ) {
    const applications = await this.dataService.getApplications();

    let filteredApplications = applications;

    // Apply filters
    if (filters.status) {
      filteredApplications = filteredApplications.filter(
        (app) => app.status === filters.status
      );
    }

    if (filters.company) {
      filteredApplications = filteredApplications.filter((app) =>
        app.company.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filteredApplications = filteredApplications.filter((app) => {
        const appDate = new Date(app.createdDate);
        return appDate >= new Date(start) && appDate <= new Date(end);
      });
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredApplications = filteredApplications.filter((app) =>
        filters.tags.some((tag) => app.tags.includes(tag))
      );
    }

    // Apply sorting
    filteredApplications.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy.includes("Date") && aValue && bValue) {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
      }
      if (typeof bValue === "string") {
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;

      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filteredApplications;
  }

  // Get application by ID
  async getApplication(applicationId) {
    const applications = await this.dataService.getApplications();
    return applications.find((app) => app.id === applicationId);
  }

  // Delete application
  async deleteApplication(applicationId) {
    await this.dataService.deleteApplication(applicationId);
  }

  // Get application statistics
  async getApplicationStats() {
    const applications = await this.dataService.getApplications();

    const stats = {
      total: applications.length,
      draft: 0,
      applied: 0,
      interview: 0,
      rejected: 0,
      offer: 0,
      accepted: 0,
      thisWeek: 0,
      thisMonth: 0,
      companies: new Set(),
      avgResponseTime: 0,
    };

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    applications.forEach((app) => {
      // Count by status
      stats[app.status] = (stats[app.status] || 0) + 1;

      // Count by date
      const createdDate = new Date(app.createdDate);
      if (createdDate >= oneWeekAgo) {
        stats.thisWeek++;
      }
      if (createdDate >= oneMonthAgo) {
        stats.thisMonth++;
      }

      // Collect companies
      if (app.company) {
        stats.companies.add(app.company);
      }
    });

    stats.companies = Array.from(stats.companies);
    return stats;
  }

  // Extract job source from URL
  extractJobSource(url) {
    if (!url) return "unknown";

    const hostname = new URL(url).hostname.toLowerCase();

    const sources = {
      "linkedin.com": "LinkedIn",
      "indeed.com": "Indeed",
      "glassdoor.com": "Glassdoor",
      "monster.com": "Monster",
      "ziprecruiter.com": "ZipRecruiter",
      "careerbuilder.com": "CareerBuilder",
      "simplyhired.com": "SimplyHired",
      "dice.com": "Dice",
      "stackoverflow.com": "Stack Overflow Jobs",
      "github.com": "GitHub Jobs",
      "angel.co": "AngelList",
      "wellfound.com": "Wellfound",
    };

    for (const [domain, source] of Object.entries(sources)) {
      if (hostname.includes(domain)) {
        return source;
      }
    }

    return hostname;
  }

  // Add tags to application
  async addTags(applicationId, tags) {
    const application = await this.getApplication(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const newTags = [...new Set([...application.tags, ...tags])];
    return this.updateApplication(applicationId, { tags: newTags });
  }

  // Remove tags from application
  async removeTags(applicationId, tagsToRemove) {
    const application = await this.getApplication(applicationId);
    if (!application) {
      throw new Error("Application not found");
    }

    const filteredTags = application.tags.filter(
      (tag) => !tagsToRemove.includes(tag)
    );

    return this.updateApplication(applicationId, { tags: filteredTags });
  }

  // Export applications to JSON
  async exportApplications() {
    const applications = await this.dataService.getApplications();
    return {
      applications,
      exportDate: new Date().toISOString(),
      count: applications.length,
    };
  }

  // Import applications from JSON
  async importApplications(data) {
    if (!data.applications || !Array.isArray(data.applications)) {
      throw new Error("Invalid import data format");
    }

    const promises = data.applications.map((app) =>
      this.dataService.saveApplication(app)
    );

    await Promise.all(promises);
    return data.applications.length;
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = ApplicationService;
} else {
  // Make available in service worker context
  if (typeof module !== "undefined" && module.exports) {
    module.exports = ApplicationService;
  } else if (typeof globalThis !== "undefined") {
    globalThis.ApplicationService = ApplicationService;
  }
}
