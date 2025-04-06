# VerifEye Extension

A browser extension that automatically scans webpages for security risks and displays a risk level indicator with four levels: Low, Medium, High, and Critical. The extension shows detailed alerts if any malicious patterns, phishing attempts, or disinformation keywords are detected.
 
Guide Link :-https://drive.google.com/drive/folders/1tfKFy8Yl4gLdjtd_ITrYP-B_gJlcy-Dn?usp=sharing

## Features

### Core Functionality
- Automatic scanning of webpages as you browse
- Risk level indicator (Low, Medium, High, Critical)
- Detailed alerts grouped by severity
- Browser notifications for high-risk pages
- Customizable settings
- Dark/Light mode toggle

### New Features
- **Deep Scanning Mode**: Perform more thorough analysis for higher accuracy
- **Alert Filtering**: Filter alerts by type (malicious, suspicious, disinformation, privacy)
- **Export Functionality**: Export scan results to CSV format
- **Quick Actions Panel**: Block sites, report issues, and share reports with a single click
- **Vulnerability Guide**: Comprehensive information about web security vulnerabilities
- **Debug Panel**: Advanced tools for testing and troubleshooting
- **Enhanced Settings**: Tabbed interface with more customization options
- **Risk Score Display**: Numerical score showing the exact risk level (0-100)
- **Scan Duration Tracking**: See how long each scan takes to complete
- **External Resource Scanning**: Analyze resources loaded from external domains

### Advanced Scanning Capabilities
- **Malicious Code Detection**
  - Obfuscated JavaScript identification
  - Hidden iframe detection
  - Suspicious event handler analysis
  - Malicious redirect detection
  - Encoded eval() detection

- **Phishing & Social Engineering Detection**
  - Login form analysis
  - Brand impersonation detection
  - Typosquatting domain detection
  - Sensitive data collection identification
  - Fake security indicators detection
  - Urgency and fear tactics recognition

- **Content Analysis**
  - Disinformation keyword detection
  - Clickbait title analysis
  - Social engineering pattern recognition
  - Excessive advertisement detection

- **Privacy Analysis**
  - Tracking script detection
  - Browser fingerprinting identification
  - Excessive cookie usage detection

- **Network Security Analysis**
  - Mixed content detection
  - Insecure form submission identification
  - Suspicious external resource analysis
  - HTTP vs HTTPS verification

## Installation

### Chrome/Edge/Brave

1. Download or clone this repository
2. Open your browser and navigate to the extensions page:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension should now be installed and visible in your browser toolbar

### Firefox

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click "Load Temporary Add-on..."
4. Select any file in the extension folder (e.g., manifest.json)
5. The extension should now be installed and visible in your browser toolbar

## Usage

### Automatic Scanning
- The extension automatically scans each webpage you visit
- You'll receive a notification if a high-risk page is detected (customizable in settings)
- Click the extension icon to see detailed results

### Manual Scanning
1. Navigate to any webpage you want to scan
2. Click on the extension icon in your browser toolbar to open the popup
3. Click the "Scan Page" button to analyze the current webpage
4. View the risk level indicator and any alerts that appear
5. Check the detailed information about potential security issues

### Customizing Settings
1. Click on the extension icon to open the popup
2. Click "Settings" at the bottom of the popup
3. Adjust your preferences:
   - Enable/disable automatic scanning
   - Configure notification preferences
   - Set risk level threshold for notifications
4. Click "Save Settings" to apply your changes

## How It Works

The extension uses a multi-layered approach to analyze webpages:

1. **Domain Analysis**
   - Checks for typosquatting (similarity to popular domains)
   - Analyzes TLD reputation
   - Verifies HTTPS implementation

2. **Code Analysis**
   - Scans for obfuscated and potentially malicious JavaScript
   - Detects hidden elements that may contain malware
   - Identifies suspicious event handlers and redirects

3. **Content Analysis**
   - Identifies disinformation keywords and patterns
   - Detects clickbait and social engineering tactics
   - Analyzes text for urgency, fear, and reward language

4. **Phishing Detection**
   - Identifies login forms and credential collection
   - Detects brand impersonation attempts
   - Analyzes forms for sensitive data collection

5. **Privacy Analysis**
   - Identifies tracking scripts and fingerprinting techniques
   - Analyzes cookie usage and local storage
   - Detects excessive data collection

6. **Network Analysis**
   - Checks for mixed content (HTTP resources on HTTPS pages)
   - Analyzes external resource domains
   - Identifies suspicious network patterns

The extension calculates a comprehensive risk score based on these analyses and determines the overall risk level of the webpage.

## Technical Details

- Built with vanilla JavaScript for maximum performance
- Uses advanced pattern matching and heuristic algorithms
- Implements caching to avoid rescanning recently visited pages
- All analysis happens locally in your browser for privacy
- Uses browser notifications API for alerting
- Stores settings using the browser's storage API

## Privacy

This extension:
- Does not collect any personal data
- Does not send any browsing data to external servers
- Performs all analysis locally in your browser
- Does not require any login or account creation
- Does not track your browsing history


