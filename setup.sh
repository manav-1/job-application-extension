#!/bin/bash

# Job Application Extension Setup Script
echo "🚀 Setting up Job Application Extension..."

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found. Make sure you're in the extension directory."
    exit 1
fi

# Verify all required files exist
required_files=("manifest.json" "background.js" "content.js" "popup.html" "popup.js" "styles.css")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files:"
    for file in "${missing_files[@]}"; do
        echo "   - $file"
    done
    exit 1
fi

echo "✅ All required files found!"
echo ""
echo "📋 Installation Instructions:"
echo "1. Open Chrome and go to: chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top-right)"
echo "3. Click 'Load unpacked' button"
echo "4. Select this directory: $(pwd)"
echo "5. The extension will be installed and ready to use!"
echo ""
echo "📂 Extension directory: $(pwd)"
echo "🔧 Files ready for installation:"
for file in "${required_files[@]}"; do
    echo "   ✓ $file"
done
echo ""
echo "🎉 Ready to install! Follow the steps above to load the extension in Chrome."

# Optional: Open Chrome extensions page (if running on a desktop environment)
if command -v google-chrome &> /dev/null; then
    read -p "Would you like to open Chrome extensions page now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        google-chrome chrome://extensions/ &
        echo "🌐 Opening Chrome extensions page..."
    fi
elif command -v chromium-browser &> /dev/null; then
    read -p "Would you like to open Chromium extensions page now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        chromium-browser chrome://extensions/ &
        echo "🌐 Opening Chromium extensions page..."
    fi
fi
echo "5. The extension will appear in your browser toolbar"
echo ""
echo "🔧 Development commands:"
echo "  npm run validate  - Validate the manifest file"
echo "  npm run zip      - Create a ZIP file for distribution"
echo ""
echo "Happy coding! 🎉"
