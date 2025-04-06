document.addEventListener('DOMContentLoaded', function() {
  // UI Elements
  const scanButton = document.getElementById('scan-button');
  const deepScanButton = document.getElementById('deep-scan-button');
  const currentRisk = document.getElementById('current-risk');
  const riskScoreDisplay = document.getElementById('risk-score-display');
  const alertsContainer = document.getElementById('alerts');
  const pageUrl = document.getElementById('page-url');
  const scanTime = document.getElementById('scan-time');
  const scanDuration = document.getElementById('scan-duration');
  const riskLevels = document.querySelectorAll('.risk-level');
  const dashboardButton = document.getElementById('dashboard-button');
  const themeToggle = document.getElementById('theme-toggle-input');
  const exportAlertsButton = document.getElementById('export-alerts');
  const filterAlertsButton = document.getElementById('filter-alerts');
  const filterPanel = document.getElementById('filter-panel');
  const filterCheckboxes = document.querySelectorAll('.filter-checkbox');

  // Quick Action Buttons
  const blockSiteButton = document.getElementById('block-site-button');
  const reportSiteButton = document.getElementById('report-site-button');
  const shareReportButton = document.getElementById('share-report-button');

  // Settings Elements
  const settingsLink = document.getElementById('settings-link');
  const settingsPanel = document.getElementById('settings-panel');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');

  // General Settings
  const autoScanCheckbox = document.getElementById('auto-scan');
  const scanIntervalSlider = document.getElementById('scan-interval');
  const scanIntervalValue = document.getElementById('scan-interval-value');
  const cacheDurationSelect = document.getElementById('cache-duration');

  // Scan Settings
  const enableDeepScanCheckbox = document.getElementById('enable-deep-scan');
  const deepScanTimeoutSelect = document.getElementById('deep-scan-timeout');
  const scanResourcesCheckbox = document.getElementById('scan-resources');

  // Notification Settings
  const notifyHighCheckbox = document.getElementById('notify-high');
  const scanThresholdSelect = document.getElementById('scan-threshold');
  const notificationSoundCheckbox = document.getElementById('notification-sound');

  // Privacy Settings
  const anonymizeDataCheckbox = document.getElementById('anonymize-data');
  const trustedDomainsTextarea = document.getElementById('trusted-domains');
  const clearHistoryButton = document.getElementById('clear-history');

  // Accessibility Settings
  const highContrastModeCheckbox = document.getElementById('high-contrast-mode');
  const fontSizeAdjustment = document.getElementById('font-size-adjustment');
  const fontSizeValue = document.getElementById('font-size-value');
  const reduceAnimationsCheckbox = document.getElementById('reduce-animations');
  const screenReaderSupportCheckbox = document.getElementById('screen-reader-support');

  // Accessibility Controls
  const fontSizeIncreaseButton = document.getElementById('font-size-increase');
  const fontSizeDecreaseButton = document.getElementById('font-size-decrease');
  const highContrastToggleButton = document.getElementById('high-contrast-toggle');

  // Buttons
  const saveSettingsButton = document.getElementById('save-settings');
  const resetSettingsButton = document.getElementById('reset-settings');

  // Scan state
  let currentScanStartTime = null;
  let currentAlerts = [];
  let activeFilters = ['malicious', 'suspicious', 'disinformation', 'privacy'];

  // Settings state
  let settings = {
    // General settings
    autoScan: true,
    scanInterval: 5, // seconds
    cacheDuration: 30, // minutes

    // Scan settings
    enableDeepScan: true,
    deepScanTimeout: 60, // seconds
    scanResources: true,

    // Notification settings
    notifyOnHigh: true,
    scanThreshold: 'medium',
    notificationSound: false,

    // Privacy settings
    anonymizeData: true,
    darkMode: false,

    // Accessibility settings
    highContrastMode: false,
    fontSizePercentage: 100,
    reduceAnimations: false,
    screenReaderSupport: true,

    trustedDomains: [
      'instagram.com', 'www.instagram.com',
      'facebook.com', 'www.facebook.com',
      'google.com', 'www.google.com',
      'microsoft.com', 'www.microsoft.com',
      'apple.com', 'www.apple.com',
      'amazon.com', 'www.amazon.com',
      'twitter.com', 'www.twitter.com',
      'linkedin.com', 'www.linkedin.com',
      'youtube.com', 'www.youtube.com',
      'netflix.com', 'www.netflix.com',
      'github.com', 'www.github.com',
      'openai.com', 'chat.openai.com', 'www.openai.com',
      'flaticon.com', 'www.flaticon.com'
    ]
  };

  // Theme toggle functionality
  themeToggle.addEventListener('change', function() {
    toggleTheme(this.checked);
  });

  // Add event listeners for scan buttons
  scanButton.addEventListener('click', () => requestScan(false));
  deepScanButton.addEventListener('click', () => requestScan(true));

  // Add event listeners for settings tabs
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');

      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Show selected tab content, hide others
      tabContents.forEach(content => {
        content.style.display = content.id === tabId ? 'block' : 'none';
      });
    });
  });

  // Add event listeners for settings controls
  scanIntervalSlider.addEventListener('input', function() {
    scanIntervalValue.textContent = this.value;
  });

  // Add event listeners for font size adjustment
  fontSizeAdjustment.addEventListener('input', function() {
    fontSizeValue.textContent = this.value + '%';
    applyFontSizeAdjustment(this.value);
  });

  // Add event listeners for other UI elements
  settingsLink.addEventListener('click', toggleSettings);
  saveSettingsButton.addEventListener('click', saveSettings);
  resetSettingsButton.addEventListener('click', resetSettings);
  dashboardButton.addEventListener('click', openDashboard);
  clearHistoryButton.addEventListener('click', clearScanHistory);

  // Add event listeners for accessibility controls
  fontSizeIncreaseButton.addEventListener('click', increaseFontSize);
  fontSizeDecreaseButton.addEventListener('click', decreaseFontSize);
  highContrastToggleButton.addEventListener('click', toggleHighContrast);
  highContrastModeCheckbox.addEventListener('change', function() {
    applyHighContrastMode(this.checked);
  });
  reduceAnimationsCheckbox.addEventListener('change', function() {
    applyReducedAnimations(this.checked);
  });

  // Add event listeners for alert filtering and export
  exportAlertsButton.addEventListener('click', exportAlerts);
  filterAlertsButton.addEventListener('click', toggleFilterPanel);
  filterCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateAlertFilters);
  });

  // Add event listeners for quick action buttons
  blockSiteButton.addEventListener('click', blockCurrentSite);
  reportSiteButton.addEventListener('click', reportCurrentSite);
  shareReportButton.addEventListener('click', shareReport);

  // Show initial loading state
  scanButton.disabled = true;
  deepScanButton.disabled = true;
  alertsContainer.innerHTML = '<div class="progress-container"><p>Loading scan results...</p><div class="progress-bar"><div class="progress-fill" style="width: 30%"></div></div></div>';

  // Load settings and check for cached results when popup opens
  loadSettings();
  checkForCachedResults();

  // Apply saved theme
  applyTheme();

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scanComplete') {
      updateUI(message.result);
    } else if (message.action === 'scanError') {
      handleError(message.error);
    } else if (message.action === 'scanProgress') {
      updateProgress(message.status, message.message);
    }
  });

  // Function to toggle theme
  function toggleTheme(isDark) {
    settings.darkMode = isDark;
    applyTheme();
    saveSettings();
  }

  // Function to apply theme based on settings
  function applyTheme() {
    if (settings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.checked = true;
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggle.checked = false;
    }

    // Apply high contrast if enabled
    if (settings.highContrastMode) {
      document.documentElement.classList.add('high-contrast');
      highContrastModeCheckbox.checked = true;
    } else {
      document.documentElement.classList.remove('high-contrast');
      highContrastModeCheckbox.checked = false;
    }

    // Apply reduced animations if enabled
    if (settings.reduceAnimations) {
      document.documentElement.classList.add('reduced-motion');
      reduceAnimationsCheckbox.checked = true;
    } else {
      document.documentElement.classList.remove('reduced-motion');
      reduceAnimationsCheckbox.checked = false;
    }

    // Apply font size adjustment
    applyFontSizeAdjustment(settings.fontSizePercentage);
  }

  // Function to increase font size
  function increaseFontSize() {
    const currentSize = parseInt(settings.fontSizePercentage || 100);
    const newSize = Math.min(currentSize + 10, 150); // Max 150%
    settings.fontSizePercentage = newSize;
    applyFontSizeAdjustment(newSize);
    fontSizeAdjustment.value = newSize;
    fontSizeValue.textContent = newSize + '%';
    saveSettings();
  }

  // Function to decrease font size
  function decreaseFontSize() {
    const currentSize = parseInt(settings.fontSizePercentage || 100);
    const newSize = Math.max(currentSize - 10, 80); // Min 80%
    settings.fontSizePercentage = newSize;
    applyFontSizeAdjustment(newSize);
    fontSizeAdjustment.value = newSize;
    fontSizeValue.textContent = newSize + '%';
    saveSettings();
  }

  // Function to apply font size adjustment
  function applyFontSizeAdjustment(sizePercentage) {
    document.documentElement.style.setProperty('--font-size-multiplier', sizePercentage / 100);
    document.body.style.fontSize = `${sizePercentage}%`;
  }

  // Function to toggle high contrast mode
  function toggleHighContrast() {
    settings.highContrastMode = !settings.highContrastMode;
    applyHighContrastMode(settings.highContrastMode);
    saveSettings();
  }

  // Function to apply high contrast mode
  function applyHighContrastMode(enabled) {
    if (enabled) {
      document.documentElement.classList.add('high-contrast');
      highContrastModeCheckbox.checked = true;
    } else {
      document.documentElement.classList.remove('high-contrast');
      highContrastModeCheckbox.checked = false;
    }
    settings.highContrastMode = enabled;
  }

  // Function to apply reduced animations
  function applyReducedAnimations(enabled) {
    if (enabled) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    settings.reduceAnimations = enabled;
  }

  // Function to load settings from storage
  function loadSettings() {
    chrome.runtime.sendMessage({
      action: 'getSettings'
    }, response => {
      if (response && response.settings) {
        // Merge with default settings to handle new properties
        settings = {...settings, ...response.settings};
        updateSettingsUI();
      }
    });
  }

  // Function to update settings UI based on loaded settings
  function updateSettingsUI() {
    // General settings
    autoScanCheckbox.checked = settings.autoScan;
    scanIntervalSlider.value = settings.scanInterval || 5;
    scanIntervalValue.textContent = scanIntervalSlider.value;
    cacheDurationSelect.value = settings.cacheDuration || 30;

    // Scan settings
    enableDeepScanCheckbox.checked = settings.enableDeepScan !== false;
    deepScanTimeoutSelect.value = settings.deepScanTimeout || 60;
    scanResourcesCheckbox.checked = settings.scanResources !== false;

    // Notification settings
    notifyHighCheckbox.checked = settings.notifyOnHigh;
    scanThresholdSelect.value = settings.scanThreshold;
    notificationSoundCheckbox.checked = settings.notificationSound === true;

    // Privacy settings
    anonymizeDataCheckbox.checked = settings.anonymizeData !== false;

    // Update trusted domains textarea
    if (trustedDomainsTextarea && settings.trustedDomains) {
      trustedDomainsTextarea.value = settings.trustedDomains.join(', ');
    }

    // Apply theme
    applyTheme();
  }

  // Function to toggle settings panel visibility
  function toggleSettings(e) {
    e.preventDefault();
    if (settingsPanel.style.display === 'none') {
      settingsPanel.style.display = 'block';
      settingsLink.innerHTML = '<span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 3px;">close</span> Hide Settings';
    } else {
      settingsPanel.style.display = 'none';
      settingsLink.innerHTML = '<span class="material-icons" style="font-size: 16px; vertical-align: middle; margin-right: 3px;">settings</span> Settings';
    }
  }

  // Function to save settings
  function saveSettings() {
    // Parse trusted domains from textarea
    let trustedDomainsList = [];
    if (trustedDomainsTextarea && trustedDomainsTextarea.value.trim()) {
      // Split by commas, trim whitespace, and filter out empty entries
      trustedDomainsList = trustedDomainsTextarea.value
        .split(',')
        .map(domain => domain.trim().toLowerCase())
        .filter(domain => domain.length > 0);

      // Add www. variants if not present
      const domainsWithWWW = [];
      trustedDomainsList.forEach(domain => {
        if (!domain.startsWith('www.') && !trustedDomainsList.includes('www.' + domain)) {
          domainsWithWWW.push('www.' + domain);
        }
      });
      trustedDomainsList = [...trustedDomainsList, ...domainsWithWWW];
    }

    const newSettings = {
      // General settings
      autoScan: autoScanCheckbox.checked,
      scanInterval: parseInt(scanIntervalSlider.value),
      cacheDuration: parseInt(cacheDurationSelect.value),

      // Scan settings
      enableDeepScan: enableDeepScanCheckbox.checked,
      deepScanTimeout: parseInt(deepScanTimeoutSelect.value),
      scanResources: scanResourcesCheckbox.checked,

      // Notification settings
      notifyOnHigh: notifyHighCheckbox.checked,
      scanThreshold: scanThresholdSelect.value,
      notificationSound: notificationSoundCheckbox.checked,

      // Privacy settings
      anonymizeData: anonymizeDataCheckbox.checked,
      darkMode: settings.darkMode,
      trustedDomains: trustedDomainsList
    };

    chrome.runtime.sendMessage({
      action: 'updateSettings',
      settings: newSettings
    }, response => {
      if (response && response.status === 'success') {
        settings = newSettings;

        // Show success message with animation
        saveSettingsButton.innerHTML = '<span class="material-icons" style="font-size: 16px; margin-right: 5px;">check_circle</span> Saved!';
        saveSettingsButton.style.backgroundColor = 'var(--risk-low-bg)';

        setTimeout(() => {
          saveSettingsButton.textContent = 'Save Settings';
          saveSettingsButton.style.backgroundColor = '';
        }, 1500);
      }
    });
  }

  // Function to reset settings to defaults
  function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      chrome.runtime.sendMessage({
        action: 'resetSettings'
      }, response => {
        if (response && response.status === 'success') {
          // Reload settings
          loadSettings();

          // Show success message
          resetSettingsButton.textContent = 'Reset Complete';
          setTimeout(() => {
            resetSettingsButton.textContent = 'Reset to Defaults';
          }, 1500);
        }
      });
    }
  }

  // Function to clear scan history
  function clearScanHistory() {
    if (confirm('Are you sure you want to clear all scan history?')) {
      chrome.runtime.sendMessage({
        action: 'clearScanHistory'
      }, response => {
        if (response && response.status === 'success') {
          clearHistoryButton.textContent = 'History Cleared';
          setTimeout(() => {
            clearHistoryButton.textContent = 'Clear Scan History';
          }, 1500);
        }
      });
    }
  }

  // Function to check for cached scan results
  function checkForCachedResults() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) {
        // No active tab, show error
        handleError("No active tab found");
        return;
      }

      const currentTab = tabs[0];
      pageUrl.textContent = currentTab.url;

      // Request cached result from background script
      chrome.runtime.sendMessage({
        action: 'getCachedResult',
        url: currentTab.url
      }, response => {
        if (response && response.status === 'success') {
          // We have cached results
          updateUI(response.result);
          // Change button text to "Rescan" since we already have results
          scanButton.textContent = 'Rescan Page';
          deepScanButton.disabled = false;
        } else {
          // No cached results, trigger a new scan automatically
          requestScan(false);
        }
      });
    });
  }

  // Function to request a scan from the background script
  function requestScan(isDeepScan) {
    // Record scan start time
    currentScanStartTime = Date.now();

    // Update UI to show scanning is in progress
    scanButton.textContent = 'Scanning...';
    scanButton.disabled = true;
    deepScanButton.disabled = true;
    currentRisk.textContent = 'Scanning...';

    // Different message for deep scan to indicate longer processing time
    if (isDeepScan) {
      alertsContainer.innerHTML = '<div class="progress-container"><p>Initializing enhanced deep scan (may take up to 30 seconds for more accurate results)...</p><div class="progress-bar"><div class="progress-fill"></div></div></div>';
    } else {
      alertsContainer.innerHTML = '<div class="progress-container"><p>Initializing scan...</p><div class="progress-bar"><div class="progress-fill"></div></div></div>';
    }

    // Request scan from background script
    chrome.runtime.sendMessage({
      action: 'scanRequest',
      isDeepScan: isDeepScan
    }, response => {
      if (response && response.status !== 'scanning') {
        handleError(response.message || "Failed to start scan");
      }
    });
  }

  // Function to update progress UI
  function updateProgress(status, message) {
    // Update progress message
    const progressContainer = alertsContainer.querySelector('.progress-container');

    if (!progressContainer) {
      // Create progress container if it doesn't exist
      alertsContainer.innerHTML = '<div class="progress-container"><p></p><div class="progress-bar"><div class="progress-fill"></div></div></div>';
    }

    // Get progress elements
    const progressMessage = alertsContainer.querySelector('.progress-container p');
    const progressFill = alertsContainer.querySelector('.progress-fill');

    if (progressMessage) {
      progressMessage.textContent = message;
    }

    // Update progress bar based on status
    if (progressFill) {
      let fillPercent = 0;

      switch (status) {
        case 'starting':
          fillPercent = 10;
          break;
        case 'extracting':
          fillPercent = 25; // Reduced from 30 to show more gradual progress
          break;
        case 'analyzing':
          fillPercent = 50; // Reduced from 60 to show more gradual progress
          break;
        case 'deep-scanning':
          fillPercent = 65; // Reduced from 70 to show more gradual progress
          break;
        case 'resource-scanning':
          fillPercent = 75; // Reduced from 80 to show more gradual progress
          break;
        case 'finalizing':
          fillPercent = 90;
          break;
        case 'limited':
          fillPercent = 80;
          break;
        default:
          fillPercent = 40;
      }

      progressFill.style.width = fillPercent + '%';
    }
  }

  // Function to update the UI with analysis results
  function updateUI(result) {
    // Store current alerts for filtering
    currentAlerts = result.alerts || [];

    // Calculate scan duration
    let duration = 'N/A';
    if (currentScanStartTime) {
      const durationMs = Date.now() - currentScanStartTime;
      duration = (durationMs / 1000).toFixed(2) + ' seconds';
    }

    // Update risk level indicator
    riskLevels.forEach(level => {
      level.classList.remove('active');
    });

    document.getElementById(result.riskLevel).classList.add('active');
    currentRisk.textContent = result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1);
    currentRisk.className = 'current-risk';
    currentRisk.classList.add(result.riskLevel);

    // Update risk score display
    if (result.riskScore !== undefined) {
      const score = result.riskScore;
      riskScoreDisplay.innerHTML = `
        <div class="score-box" style="--score-percent: ${score}">
          <div class="score-value">${score}<span class="score-label">out of 100</span></div>
        </div>
      `;
      riskScoreDisplay.className = 'risk-score-display';
      riskScoreDisplay.classList.add(result.riskLevel);
    } else {
      riskScoreDisplay.innerHTML = '';
    }

    // Start with empty alerts container
    alertsContainer.innerHTML = '';

    // Add deep scan badge if applicable
    if (result.deepScan) {
      const deepScanBadge = document.createElement('div');
      deepScanBadge.className = 'deep-scan-badge';
      deepScanBadge.innerHTML = `
        <span class="material-icons">security</span>
        <span>Deep Scan Completed</span>
      `;
      alertsContainer.appendChild(deepScanBadge);
    }

    // Add partial scan notice if applicable
    if (result.partialScan || result.limited) {
      const partialScanNotice = document.createElement('div');
      partialScanNotice.className = 'partial-scan-notice';
      partialScanNotice.innerHTML = `
        <p><strong>Note:</strong> This is a partial scan result. Some page content could not be fully analyzed.</p>
        <p>This may happen with very large pages or when the page restricts content access.</p>
      `;
      alertsContainer.appendChild(partialScanNotice);
    }

    // Update alerts
    displayFilteredAlerts();

    // Update scan information
    pageUrl.textContent = result.url || pageUrl.textContent;
    scanTime.textContent = result.scanTime;
    scanDuration.textContent = duration;

    // Add scan again button if it was a partial scan
    if (result.partialScan || result.limited) {
      const scanAgainContainer = document.createElement('div');
      scanAgainContainer.className = 'scan-again-container';
      scanAgainContainer.innerHTML = `
        <p>For more complete results, you can try:</p>
        <ul>
          <li>Refreshing the page before scanning</li>
          <li>Waiting for the page to fully load</li>
          <li>Scanning a simpler page on the same site</li>
        </ul>
      `;
      alertsContainer.appendChild(scanAgainContainer);
    }

    // Reset scan buttons
    scanButton.textContent = 'Rescan Page';
    scanButton.disabled = false;
    deepScanButton.disabled = false;
  }

  // Function to display filtered alerts
  function displayFilteredAlerts() {
    // Filter alerts based on active filters
    const filteredAlerts = currentAlerts.filter(alert => activeFilters.includes(alert.type));

    if (!filteredAlerts || filteredAlerts.length === 0) {
      const noAlerts = document.createElement('p');
      noAlerts.className = 'no-alerts';

      if (currentAlerts.length > 0) {
        noAlerts.textContent = 'No alerts match the current filters.';
      } else {
        noAlerts.textContent = 'No alerts detected.';
      }

      alertsContainer.appendChild(noAlerts);
    } else {
      // Group alerts by type
      const alertsByType = {
        malicious: [],
        suspicious: [],
        disinformation: [],
        privacy: []
      };

      filteredAlerts.forEach(alert => {
        if (alertsByType[alert.type]) {
          alertsByType[alert.type].push(alert);
        } else {
          alertsByType.suspicious.push(alert);
        }
      });

      // Display alerts in order of severity
      const alertOrder = ['malicious', 'suspicious', 'disinformation', 'privacy'];

      alertOrder.forEach(type => {
        if (alertsByType[type] && alertsByType[type].length > 0 && activeFilters.includes(type)) {
          // Add section header
          const sectionHeader = document.createElement('h3');
          sectionHeader.className = 'alert-section-header';
          sectionHeader.textContent = type.charAt(0).toUpperCase() + type.slice(1) + ' Alerts';
          alertsContainer.appendChild(sectionHeader);

          // Add alerts
          alertsByType[type].forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert-item ${alert.type}`;
            alertElement.innerHTML = `
              <strong>${alert.message}</strong>
              <p>${alert.details}</p>
            `;
            alertsContainer.appendChild(alertElement);
          });
        }
      });

      // Add risk score information
      const scoreInfo = document.createElement('div');
      scoreInfo.className = 'risk-score-info';
      scoreInfo.innerHTML = `<p><strong>Total Alerts:</strong> ${filteredAlerts.length}</p>`;
      alertsContainer.appendChild(scoreInfo);
    }
  }

  // Function to toggle filter panel
  function toggleFilterPanel() {
    if (filterPanel.style.display === 'none') {
      filterPanel.style.display = 'block';
    } else {
      filterPanel.style.display = 'none';
    }
  }

  // Function to update alert filters
  function updateAlertFilters() {
    // Update active filters based on checkboxes
    activeFilters = [];
    filterCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        activeFilters.push(checkbox.getAttribute('data-type'));
      }
    });

    // Redisplay alerts with new filters
    displayFilteredAlerts();
  }

  // Function to export alerts to CSV
  function exportAlerts() {
    if (currentAlerts.length === 0) {
      alert('No alerts to export.');
      return;
    }

    // Create CSV content
    let csvContent = 'Type,Message,Details\n';

    // Add filtered alerts to CSV
    const filteredAlerts = currentAlerts.filter(alert => activeFilters.includes(alert.type));
    filteredAlerts.forEach(alert => {
      // Escape quotes and format for CSV
      const message = alert.message.replace(/"/g, '""');
      const details = alert.details.replace(/"/g, '""');
      csvContent += `"${alert.type}","${message}","${details}"\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Set download attributes
    const domain = pageUrl.textContent.replace(/^https?:\/\//, '').split('/')[0];
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `web-risk-scan_${domain}_${timestamp}.csv`);

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Function to handle errors
  function handleError(errorMessage) {
    // Reset UI
    scanButton.textContent = 'Scan Page';
    scanButton.disabled = false;
    deepScanButton.disabled = false;
    currentRisk.textContent = 'Error';
    currentRisk.className = 'current-risk';
    riskScoreDisplay.textContent = '';

    // Display error message with troubleshooting tips
    alertsContainer.innerHTML = `
      <div class="error-container">
        <p class="error">${errorMessage}</p>
        <div class="troubleshooting">
          <h3>Troubleshooting Tips:</h3>
          <ul>
            <li>Browser pages (like chrome://, about:, etc.) cannot be scanned</li>
            <li>Some websites restrict content scripts for security reasons</li>
            <li>Try refreshing the page before scanning</li>
            <li>Check if you have other extensions that might be interfering</li>
            <li>For secure sites (HTTPS), make sure your connection is stable</li>
          </ul>
        </div>
      </div>
    `;
  }

  // Function to open the dashboard
  function openDashboard() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard.html')
    });
  }



  // Function to block the current site
  function blockCurrentSite() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) {
        alert('No active tab found');
        return;
      }

      const currentTab = tabs[0];
      const domain = new URL(currentTab.url).hostname;

      if (confirm(`Are you sure you want to block "${domain}"?`)) {
        chrome.runtime.sendMessage({
          action: 'blockDomain',
          domain: domain
        }, response => {
          if (response && response.status === 'success') {
            alert(`Domain "${domain}" has been added to your blocklist.`);
          } else {
            alert('Failed to block domain. Please try again.');
          }
        });
      }
    });
  }

  // Function to report the current site
  function reportCurrentSite() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) {
        alert('No active tab found');
        return;
      }

      const currentTab = tabs[0];
      const reportUrl = `https://safebrowsing.google.com/safebrowsing/report_phish/?url=${encodeURIComponent(currentTab.url)}`;

      chrome.tabs.create({
        url: reportUrl
      });
    });
  }

  // Function to share the current report
  function shareReport() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs.length === 0) {
        alert('No active tab found');
        return;
      }

      const currentTab = tabs[0];
      const shareText = `I scanned ${currentTab.url} with Web Risk Scanner and found it has a ${currentRisk.textContent} risk level.`;

      // Create a temporary textarea to copy the text
      const textarea = document.createElement('textarea');
      textarea.value = shareText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      alert('Report copied to clipboard!');
    });
  }


});