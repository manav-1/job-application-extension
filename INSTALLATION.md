# Job Application Extension - Installation Guide

## Prerequisites

- Google Chrome or any Chromium-based browser (Chrome, Edge, Brave, etc.)
- The extension files in this directory

## Installation Steps

### Method 1: Developer Mode (Recommended for Testing)

1. **Open Chrome Extensions Page**

   - Open Google Chrome
   - Type `chrome://extensions/` in the address bar and press Enter
   - OR click the three dots menu → More tools → Extensions

2. **Enable Developer Mode**

   - Look for the "Developer mode" toggle in the top-right corner
   - Click to enable it (it should turn blue/on)

3. **Load the Extension**

   - Click the "Load unpacked" button that appears
   - Navigate to this folder: `/home/manav/projects/application-extension`
   - Select the folder and click "Open"

4. **Verify Installation**
   - The extension should appear in your extensions list
   - You should see "Job Application Auto-Filler" with a green "On" toggle
   - The extension icon should appear in your browser toolbar

### Method 2: Pack as .crx File (For Distribution)

If you want to create a packaged extension file:

1. **Pack the Extension**

   - In Chrome extensions page, click "Pack extension"
   - Select the extension root directory: `/home/manav/projects/application-extension`
   - Click "Pack Extension"
   - This creates a `.crx` file and a `.pem` key file

2. **Install the .crx File**
   - Drag and drop the `.crx` file onto the extensions page
   - Click "Add extension" in the confirmation dialog

## First-Time Setup

1. **Click the Extension Icon**

   - Find the extension icon in your browser toolbar
   - If not visible, click the puzzle piece icon and pin it

2. **Set Up Your Profile**

   - Click on the "Profile" tab
   - Fill in your personal information (name, email, phone, etc.)
   - Click "Save Profile"

3. **Add Your Experience**

   - Go to the "Experience" tab
   - Add your work history
   - Save each entry

4. **Configure Settings**
   - Check the "Settings" tab
   - Enable/disable features as needed
   - The extension is ready to use!

## Usage

1. **Visit Any Job Application Site**

   - Go to any job board or company careers page
   - Start filling out an application form

2. **Auto-Suggestions**

   - Click on any form field
   - The extension will show relevant suggestions
   - Click on a suggestion to auto-fill the field

3. **Track Applications**
   - Use the "Applications" tab to track your job applications
   - Generate cover letters in the "Tools" tab

## Troubleshooting

### Extension Not Loading

- Make sure all files are in the same directory
- Check that `manifest.json` exists in the root folder
- Refresh the extensions page and try again

### No Suggestions Appearing

- Make sure you've filled out your profile information
- Check that the extension is enabled (green toggle)
- Try refreshing the job application page

### Permission Issues

- The extension needs permission to access web pages
- Click "Allow" when prompted for permissions
- Check extensions page to ensure permissions are granted

## File Structure

```
application-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (background tasks)
├── content.js            # Injected into web pages
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── styles.css            # Styling for popup and suggestions
├── test-form.html        # Test page for development
└── INSTALLATION.md       # This guide
```

## Development Mode Benefits

- Real-time updates when you modify code
- Access to developer tools and console logs
- Easy debugging and testing

## Security Note

This extension stores all data locally in your browser. No data is sent to external servers. Your personal information stays on your device.
