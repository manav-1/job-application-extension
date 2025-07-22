# AI Job Application Filler

A Chrome extension that automatically fills job applications using AI-powered suggestions and saved data. Supports OpenAI and Google Gemini for intelligent form completion.

## Features

- **Smart Form Detection**: Automatically detects and categorizes form fields
- **AI-Powered Suggestions**: Uses OpenAI or Google Gemini to generate contextual content
- **Auto-Fill**: Instantly fills forms with saved personal information
- **Cover Letter Generation**: AI-generated personalized cover letters
- **Interview Questions**: Get relevant interview questions for job positions
- **Multi-Site Support**: Works on all job application websites
- **Privacy-Focused**: Data stored locally in your browser

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/manav-1/job-application-extension.git
   cd job-application-extension
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build and validate:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

## Configuration

1. Click the extension icon in your browser toolbar
2. Add your API key (OpenAI or Google Gemini)
3. Fill in your personal information (name, email, skills, experience, etc.)
4. Configure your preferences (auto-fill settings, AI provider)

## Usage

1. Navigate to any job application form
2. Click on form fields to see AI-powered suggestions
3. Use the popup to generate cover letters and get interview questions
4. Let the extension auto-fill your information

## Development

### Project Structure

```
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content.js            # Content script
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic
├── src/
│   ├── ai/               # AI providers and factory
│   ├── services/         # Core business logic
│   └── utils/           # Utility functions
├── styles/              # CSS modules
│   ├── base/           # Base styles and tokens
│   ├── components/     # Component styles
│   └── utilities/      # Utility classes
└── icons/              # Extension icons
```

### Available Scripts

- `npm run build` - Build and validate the extension
- `npm run validate` - Validate manifest.json
- `npm run dev` - Development mode instructions
- `npm run package` - Create distributable ZIP file
- `npm run clean` - Remove build artifacts

### Code Standards

- **ES6+ JavaScript**: Modern JavaScript features
- **Modular CSS**: SCSS-like organization with CSS modules
- **Error Handling**: Comprehensive error handling and logging
- **Performance**: Optimized for minimal memory footprint
- **Security**: CSP compliant, no eval() or inline scripts

## API Keys

### OpenAI
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Enter it in the extension settings

### Google Gemini
1. Get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Enter it in the extension settings

## Privacy

- All data is stored locally in your browser
- No data is sent to external servers except AI API calls
- API keys are stored securely using Chrome's storage API
- You can clear all data anytime from the extension settings

## Browser Compatibility

- Chrome 88+
- Chromium-based browsers (Edge, Brave, etc.)
- Manifest V3 compliant

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the code standards
4. Test thoroughly on multiple websites
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/manav-1/job-application-extension/issues) page
2. Create a new issue with detailed information
3. Include browser version, extension version, and steps to reproduce

## Changelog

### v2.0.0
- Complete rewrite for Manifest V3
- Added Google Gemini support
- Improved AI suggestions
- Enhanced error handling
- Better performance and reliability
- Production-ready code standards

### v1.0.0
- Initial release
- OpenAI integration
- Basic form filling
- Cover letter generation
