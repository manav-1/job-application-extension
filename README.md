# AI Job Application Filler Chrome Extension v2.0

A powerful Chrome extension that automatically fills job application forms using saved user data and AI-powered features. Now supports both OpenAI GPT and Google Gemini for enhanced AI capabilities.

## 🚀 Features

### Core Features
- **Auto-fill job applications** with saved personal information
- **Smart field detection** using advanced algorithms
- **Customizable field mappings** for different job sites
- **Application tracking** with status management
- **Data export/import** functionality

### AI-Powered Features (New!)
- **Dual AI Provider Support**: Choose between OpenAI GPT-3.5 or Google Gemini Pro
- **AI Cover Letter Generation**: Create personalized cover letters for each application
- **Interview Question Generation**: Get relevant interview questions based on job requirements
- **Smart Suggestions**: AI-powered recommendations for form completion

### Advanced Features
- **Modern UI** with tabbed interface
- **Real-time validation** and error handling
- **Contextual notifications** and feedback
- **Secure data storage** using Chrome's local storage
- **Cross-platform compatibility** (Chrome/Chromium based browsers)

## 🏗️ Architecture

The extension has been completely refactored with a modular architecture for better maintainability and extensibility:

### Directory Structure
```
src/
├── ai/                     # AI Provider implementations
│   ├── AIProvider.js       # Base AI provider interface
│   ├── OpenAIProvider.js   # OpenAI GPT-3.5 implementation
│   ├── GeminiProvider.js   # Google Gemini Pro implementation
│   └── AIProviderFactory.js # Factory pattern for AI providers
├── services/               # Business logic services
│   ├── DataService.js      # Data management and storage
│   ├── FieldDetectionService.js # Form field detection
│   └── ApplicationService.js # Application tracking
├── utils/                  # Utility functions
│   ├── FormFillingUtils.js # Form interaction utilities
│   └── CommonUtils.js      # Common helper functions
├── background-new.js       # Main service worker (refactored)
└── popup-new.js           # Popup interface (refactored)
```

### Design Patterns Used
- **Factory Pattern**: For AI provider instantiation
- **Service Layer Pattern**: For business logic separation
- **Observer Pattern**: For event handling
- **Module Pattern**: For code organization

## 📦 Installation

### From Source
1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd application-extension
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" (toggle in top right)

4. Click "Load unpacked" and select the extension directory

5. The extension will appear in your browser toolbar

### Production Release
- Extension will be available on Chrome Web Store (coming soon)

## 🔧 Configuration

### AI Provider Setup

#### Option 1: OpenAI (GPT-3.5)
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key and paste it in the extension's AI Configuration section
4. Select "OpenAI (GPT-3.5)" as your provider

#### Option 2: Google Gemini Pro
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and paste it in the extension's AI Configuration section
4. Select "Google Gemini Pro" as your provider

### Personal Information
1. Click the extension icon
2. Navigate to the "Profile" tab
3. Fill in your personal information, experience, education, and skills
4. Click "Save Profile"

### Field Mappings (Advanced)
- The extension comes with pre-configured field mappings for popular job sites
- Customize mappings in the Settings tab if needed
- Export/import mappings for backup or sharing

## 🎯 Usage

### Basic Usage
1. Navigate to any job application page
2. Click the extension icon
3. Click "Fill Form" or use the context menu
4. The extension will automatically detect and fill available fields

### AI Features
1. **Generate Cover Letter**:
   - Navigate to a job posting page
   - Click "Generate AI Cover Letter" in the extension popup
   - AI will create a personalized cover letter based on the job and your profile

2. **Interview Preparation**:
   - Click "Generate Interview Questions" in the extension popup
   - AI will create relevant interview questions for the position

### Application Tracking
- Applications are automatically saved when you fill forms
- Track application status and dates in the "Applications" tab
- Export application data for external tracking

## 🔒 Privacy & Security

- **Local Storage**: All data is stored locally in your browser
- **No Data Collection**: The extension doesn't collect or transmit personal data
- **API Security**: AI API keys are stored locally and only used for AI features
- **Secure Communication**: All API calls use HTTPS encryption

## 🛠️ Development

### Prerequisites
- Node.js (for development tools, optional)
- Chrome/Chromium browser
- Text editor or IDE

### Code Structure
The extension follows modern JavaScript patterns:
- ES6+ features (classes, async/await, destructuring)
- Modular architecture with clear separation of concerns
- Factory pattern for AI provider abstraction
- Service layer for business logic

### Adding New AI Providers
1. Extend the `AIProvider` base class
2. Implement required methods (`generateCoverLetter`, `generateInterviewQuestions`)
3. Add the provider to `AIProviderFactory`
4. Update the UI dropdown in `popup.html`

Example:
```javascript
class NewAIProvider extends AIProvider {
  async generateCoverLetter(jobInfo, userData) {
    // Implementation
  }

  async generateInterviewQuestions(jobTitle, userData) {
    // Implementation
  }
}
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes following the existing architecture
4. Test thoroughly
5. Submit a pull request

## 📊 Supported Websites

The extension works on most job application sites, including:
- LinkedIn Jobs
- Indeed
- Glassdoor
- Monster
- ZipRecruiter
- CareerBuilder
- Dice
- Stack Overflow Jobs
- GitHub Jobs
- AngelList/Wellfound
- Company career pages

## 🐛 Troubleshooting

### Common Issues
1. **Form not filling**: Check if field mappings are correct
2. **AI features not working**: Verify API key is entered correctly
3. **Extension not loading**: Try reloading the extension in chrome://extensions/
4. **Data not saving**: Check Chrome storage permissions

### Debug Mode
Enable debug mode in Settings to see detailed logs in the browser console.

### Reset Options
- **Reset Field Mappings**: Restore default field detection rules
- **Clear All Data**: Remove all stored data (use with caution)
- **Export Data**: Backup your data before making changes

## 📈 Performance

- **Lightweight**: Minimal impact on browser performance
- **Efficient**: Smart caching and lazy loading
- **Fast**: Optimized field detection algorithms
- **Scalable**: Modular architecture supports easy feature additions

## 🔮 Roadmap

### v2.1 (Coming Soon)
- [ ] Additional AI providers (Claude, Llama)
- [ ] Custom prompt templates
- [ ] Batch application processing
- [ ] Analytics dashboard

### v2.2 (Future)
- [ ] Cloud sync for data
- [ ] Team collaboration features
- [ ] Advanced field mapping UI
- [ ] Mobile browser support

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

- **Issues**: Report bugs or request features via GitHub Issues
- **Documentation**: Check the wiki for detailed guides
- **Community**: Join discussions in GitHub Discussions

## 🙏 Acknowledgments

- OpenAI for GPT API access
- Google for Gemini Pro API access
- Chrome Extensions team for the platform
- Open source community for inspiration and tools

---

**Made with ❤️ for job seekers everywhere**
