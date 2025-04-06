document.addEventListener('DOMContentLoaded', function() {
  // UI Elements
  const totalScansElement = document.getElementById('total-scans');
  const highRiskSitesElement = document.getElementById('high-risk-sites');
  const avgRiskScoreElement = document.getElementById('avg-risk-score');
  const sitesTableBody = document.getElementById('sites-table-body');
  const refreshDataButton = document.getElementById('refresh-data');
  const exportDataButton = document.getElementById('export-data');
  const clearHistoryButton = document.getElementById('clear-history');
  const applyFiltersButton = document.getElementById('apply-filters');
  const riskFilterSelect = document.getElementById('risk-filter');
  const dateFilterSelect = document.getElementById('date-filter');
  const domainFilterInput = document.getElementById('domain-filter');
  const themeToggle = document.getElementById('theme-toggle-input');

  // Add event listeners
  refreshDataButton.addEventListener('click', loadDashboardData);
  exportDataButton.addEventListener('click', exportReport);
  clearHistoryButton.addEventListener('click', clearScanHistory);
  applyFiltersButton.addEventListener('click', applyFilters);
  themeToggle.addEventListener('change', function() {
    toggleTheme(this.checked);
  });

  // Load theme settings
  loadThemeSettings();

  // Load initial data
  loadDashboardData();

  // Function to load theme settings
  function loadThemeSettings() {
    chrome.storage.local.get('settings', function(data) {
      if (data.settings && data.settings.darkMode !== undefined) {
        applyTheme(data.settings.darkMode);
      }
    });
  }

  // Function to toggle theme
  function toggleTheme(isDark) {
    applyTheme(isDark);

    // Save theme preference
    chrome.storage.local.get('settings', function(data) {
      const settings = data.settings || {};
      settings.darkMode = isDark;
      chrome.storage.local.set({ settings });
    });
  }

  // Function to apply theme
  function applyTheme(isDark) {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggle.checked = true;
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      themeToggle.checked = false;
    }
  }

  // Function to load dashboard data from storage
  function loadDashboardData() {
    // Show loading state
    showLoadingState();

    // Get scan data from storage
    chrome.storage.local.get('scanResults', function(data) {
      if (data.scanResults && Object.keys(data.scanResults).length > 0) {
        // Process and display the data
        processScanData(data.scanResults);
      } else {
        // No data available
        showNoDataState();
      }
    });
  }

  // Function to show loading state
  function showLoadingState() {
    totalScansElement.textContent = '...';
    totalScansElement.classList.add('loading');
    highRiskSitesElement.textContent = '...';
    highRiskSitesElement.classList.add('loading');
    avgRiskScoreElement.textContent = '...';
    avgRiskScoreElement.classList.add('loading');

    sitesTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="loading-row">Loading scan data...</td>
      </tr>
    `;
  }

  // Function to show no data state
  function showNoDataState() {
    totalScansElement.textContent = '0';
    totalScansElement.classList.remove('loading');
    highRiskSitesElement.textContent = '0';
    highRiskSitesElement.classList.remove('loading');
    avgRiskScoreElement.textContent = '0';
    avgRiskScoreElement.classList.remove('loading');

    sitesTableBody.innerHTML = `
      <tr class="no-data-row">
        <td colspan="6">No scan data available. Start scanning websites to populate this dashboard.</td>
      </tr>
    `;
  }

  // Function to process scan data
  function processScanData(scanResults) {
    // Convert object to array for easier processing
    const resultsArray = Object.entries(scanResults).map(([url, data]) => {
      return {
        url: url,
        domain: extractDomain(url),
        ...data
      };
    });

    // Apply any active filters
    const filteredResults = filterResults(resultsArray);

    // Update summary statistics
    updateSummaryStats(filteredResults);

    // Update charts
    updateCharts(filteredResults);

    // Update sites table
    updateSitesTable(filteredResults);
  }

  // Function to extract domain from URL
  function extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  }

  // Function to filter results based on selected filters
  function filterResults(results) {
    const riskFilter = riskFilterSelect.value;
    const dateFilter = dateFilterSelect.value;
    const domainFilter = domainFilterInput.value.toLowerCase();

    return results.filter(result => {
      // Apply risk level filter
      if (riskFilter !== 'all' && result.riskLevel !== riskFilter) {
        return false;
      }

      // Apply domain filter
      if (domainFilter && !result.domain.toLowerCase().includes(domainFilter)) {
        return false;
      }

      // Apply date filter
      if (dateFilter !== 'all') {
        const scanDate = new Date(result.scanTime);
        const now = new Date();
        
        if (dateFilter === 'today') {
          // Check if scan was today
          return scanDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'week') {
          // Check if scan was within the last 7 days
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return scanDate >= weekAgo;
        } else if (dateFilter === 'month') {
          // Check if scan was within the last 30 days
          const monthAgo = new Date();
          monthAgo.setDate(now.getDate() - 30);
          return scanDate >= monthAgo;
        }
      }

      return true;
    });
  }

  // Function to apply filters
  function applyFilters() {
    loadDashboardData();
  }

  // Function to update summary statistics
  function updateSummaryStats(results) {
    // Remove loading state
    totalScansElement.classList.remove('loading');
    highRiskSitesElement.classList.remove('loading');
    avgRiskScoreElement.classList.remove('loading');

    // Update total scans
    totalScansElement.textContent = results.length;

    // Update high risk sites (high + critical)
    const highRiskCount = results.filter(result => 
      result.riskLevel === 'high' || result.riskLevel === 'critical'
    ).length;
    highRiskSitesElement.textContent = highRiskCount;

    // Update average risk score
    if (results.length > 0) {
      const totalScore = results.reduce((sum, result) => sum + (result.riskScore || 0), 0);
      const avgScore = Math.round(totalScore / results.length);
      avgRiskScoreElement.textContent = avgScore;
    } else {
      avgRiskScoreElement.textContent = '0';
    }
  }

  // Function to update charts
  function updateCharts(results) {
    // For a real implementation, you would use a charting library like Chart.js
    // This is a simplified placeholder implementation

    // Risk distribution chart
    const riskCounts = {
      low: results.filter(r => r.riskLevel === 'low').length,
      medium: results.filter(r => r.riskLevel === 'medium').length,
      high: results.filter(r => r.riskLevel === 'high').length,
      critical: results.filter(r => r.riskLevel === 'critical').length
    };

    const totalSites = results.length || 1; // Avoid division by zero

    // Update chart bars
    const riskChart = document.getElementById('risk-distribution-chart');
    riskChart.innerHTML = `
      <div class="placeholder-chart">
        <div class="chart-bar" style="height: ${(riskCounts.low / totalSites) * 100}%; background-color: var(--risk-low-bg);">
          <span class="bar-label">Low</span>
        </div>
        <div class="chart-bar" style="height: ${(riskCounts.medium / totalSites) * 100}%; background-color: var(--risk-medium-bg);">
          <span class="bar-label">Medium</span>
        </div>
        <div class="chart-bar" style="height: ${(riskCounts.high / totalSites) * 100}%; background-color: var(--risk-high-bg);">
          <span class="bar-label">High</span>
        </div>
        <div class="chart-bar" style="height: ${(riskCounts.critical / totalSites) * 100}%; background-color: var(--risk-critical-bg);">
          <span class="bar-label">Critical</span>
        </div>
      </div>
    `;

    // Common threats chart
    const alertTypes = {
      malicious: 0,
      suspicious: 0,
      disinformation: 0,
      privacy: 0
    };

    // Count alerts by type
    results.forEach(result => {
      if (result.alerts && Array.isArray(result.alerts)) {
        result.alerts.forEach(alert => {
          if (alertTypes[alert.type] !== undefined) {
            alertTypes[alert.type]++;
          }
        });
      }
    });

    // Find the maximum count for scaling
    const maxAlertCount = Math.max(...Object.values(alertTypes), 1);

    // Update chart bars
    const threatsChart = document.getElementById('common-threats-chart');
    threatsChart.innerHTML = `
      <div class="placeholder-chart horizontal">
        <div class="chart-row">
          <span class="row-label">Malicious</span>
          <div class="chart-bar-h" style="width: ${(alertTypes.malicious / maxAlertCount) * 100}%; background-color: var(--alert-malicious-border);"></div>
          <span class="row-value">${alertTypes.malicious}</span>
        </div>
        <div class="chart-row">
          <span class="row-label">Suspicious</span>
          <div class="chart-bar-h" style="width: ${(alertTypes.suspicious / maxAlertCount) * 100}%; background-color: var(--alert-suspicious-border);"></div>
          <span class="row-value">${alertTypes.suspicious}</span>
        </div>
        <div class="chart-row">
          <span class="row-label">Privacy</span>
          <div class="chart-bar-h" style="width: ${(alertTypes.privacy / maxAlertCount) * 100}%; background-color: var(--alert-privacy-border);"></div>
          <span class="row-value">${alertTypes.privacy}</span>
        </div>
        <div class="chart-row">
          <span class="row-label">Disinfo</span>
          <div class="chart-bar-h" style="width: ${(alertTypes.disinformation / maxAlertCount) * 100}%; background-color: var(--alert-disinformation-border);"></div>
          <span class="row-value">${alertTypes.disinformation}</span>
        </div>
      </div>
    `;
  }

  // Function to update sites table
  function updateSitesTable(results) {
    if (results.length === 0) {
      sitesTableBody.innerHTML = `
        <tr class="no-data-row">
          <td colspan="6">No scan data available or no results match your filters.</td>
        </tr>
      `;
      return;
    }

    // Sort results by scan time (most recent first)
    results.sort((a, b) => {
      return new Date(b.scanTime) - new Date(a.scanTime);
    });

    // Generate table rows
    let tableHtml = '';
    results.forEach(result => {
      const alertCount = result.alerts ? result.alerts.length : 0;

      // Add anonymized indicator if data is anonymized
      const anonymizedBadge = result.anonymized ?
        '<span class="privacy-tooltip" style="font-size: 14px; vertical-align: middle; margin-left: 5px; color: var(--text-muted);">*<span class="tooltip-text">This data has been anonymized for privacy.</span></span>' : '';

      tableHtml += `
        <tr>
          <td title="${result.url}">${result.domain} ${anonymizedBadge}</td>
          <td>
            <span class="risk-badge risk-${result.riskLevel}">
              ${result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)}
            </span>
          </td>
          <td>${result.riskScore || 'N/A'}</td>
          <td>${alertCount}</td>
          <td>${result.scanTime}</td>
          <td>
            <button class="table-action details-button" data-url="${result.url}">
              Details
            </button>
            <button class="table-action rescan-button" data-url="${result.url}">
              Rescan
            </button>
          </td>
        </tr>
      `;
    });

    sitesTableBody.innerHTML = tableHtml;

    // Add event listeners for the buttons
    document.querySelectorAll('.details-button').forEach(button => {
      button.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        viewDetails(url);
      });
    });

    document.querySelectorAll('.rescan-button').forEach(button => {
      button.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        rescan(url);
      });
    });
  }

  // Function to export report
  function exportReport() {
    chrome.storage.local.get('scanResults', async function(data) {
      if (!data.scanResults || Object.keys(data.scanResults).length === 0) {
        alert('No scan data available to export.');
        return;
      }

      // Show export options modal
      showExportOptionsModal(data.scanResults);
    });
  }

  // Function to show export options modal
  function showExportOptionsModal(scanResults) {
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    // Create modal content
    modalContainer.innerHTML = `
      <div class="export-modal">
        <h2>Export Security Report</h2>
        <p>Choose your export format:</p>

        <div class="export-options">
          <div class="export-option" id="export-json">
            <div class="option-icon">{ }</div>
            <div class="option-title">JSON Data</div>
            <div class="option-desc">Raw scan data in JSON format for technical analysis</div>
          </div>
          <div class="export-option" id="export-csv">
            <div class="option-icon">.csv</div>
            <div class="option-title">CSV File</div>
            <div class="option-desc">Tabular data format for spreadsheet applications</div>
          </div>
        </div>

        <div class="modal-actions">
          <button id="cancel-export" class="cancel-button">Cancel</button>
          <button id="confirm-export" class="action-button">Export</button>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.appendChild(modalContainer);

    // Add event listeners
    const exportJsonOption = document.getElementById('export-json');
    const exportCsvOption = document.getElementById('export-csv');
    const cancelButton = document.getElementById('cancel-export');
    const confirmButton = document.getElementById('confirm-export');

    let selectedFormat = 'json';

    // Set JSON as selected by default
    exportJsonOption.classList.add('selected');

    // Add click handlers for format selection
    exportJsonOption.addEventListener('click', () => {
      exportJsonOption.classList.add('selected');
      exportCsvOption.classList.remove('selected');
      selectedFormat = 'json';
    });

    exportCsvOption.addEventListener('click', () => {
      exportCsvOption.classList.add('selected');
      exportJsonOption.classList.remove('selected');
      selectedFormat = 'csv';
    });

    // Cancel button
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(modalContainer);
    });

    // Confirm button
    confirmButton.addEventListener('click', async () => {
      // Show loading state
      confirmButton.textContent = 'Generating...';
      confirmButton.disabled = true;

      try {
        // Export based on selected format
        if (selectedFormat === 'json') {
          exportAsJSON(scanResults);
        } else if (selectedFormat === 'csv') {
          exportAsCSV(scanResults);
        }

        // Close modal
        document.body.removeChild(modalContainer);
      } catch (error) {
        alert('Error generating report: ' + error.message);
        confirmButton.textContent = 'Export';
        confirmButton.disabled = false;
      }
    });
  }

  // PDF generation functions have been removed

  // Function to export as JSON (accessible within the DOMContentLoaded scope)
  window.exportAsJSON = function(scanResults) {
    // Create a JSON blob
    const jsonData = JSON.stringify(scanResults, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'web_risk_scan_report_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to export as CSV
  window.exportAsCSV = function(scanResults) {
    // Convert scan results to array format
    const resultsArray = Object.entries(scanResults).map(([url, data]) => {
      return {
        url: url,
        domain: extractDomain(url),
        ...data
      };
    });

    // Define CSV headers
    const headers = [
      'URL',
      'Domain',
      'Risk Level',
      'Risk Score',
      'Scan Time',
      'Alert Count',
      'Anonymized'
    ];

    // Create CSV content
    let csvContent = headers.join(',') + '\\n';

    // Add data rows
    resultsArray.forEach(result => {
      const alertCount = result.alerts ? result.alerts.length : 0;
      const row = [
        '"' + (result.url || '').replace(/"/g, '""') + '"',
        '"' + (result.domain || '').replace(/"/g, '""') + '"',
        '"' + (result.riskLevel || '').replace(/"/g, '""') + '"',
        result.riskScore || '0',
        '"' + (result.scanTime || '').replace(/"/g, '""') + '"',
        alertCount,
        result.anonymized ? 'Yes' : 'No'
      ];
      csvContent += row.join(',') + '\\n';
    });

    // Create a CSV blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    // Create a download link and trigger it
    const a = document.createElement('a');
    a.href = url;
    a.download = 'web_risk_scan_report_' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
});

// Helper function to extract domain from URL
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (e) {
    return url;
  }
}

// Global functions for table actions
function viewDetails(url) {
  try {
    // First decode the URL if it's already encoded (from the table)
    const decodedUrl = decodeURIComponent(url);

    // Then encode it properly for the query parameter
    const encodedUrl = encodeURIComponent(decodedUrl);

    // Use the background script to open the details page
    chrome.runtime.sendMessage({
      action: 'openDetailsPage',
      encodedUrl: encodedUrl
    }, function(response) {
      if (chrome.runtime.lastError) {
        console.error("Error sending message:", chrome.runtime.lastError);
        alert("Error opening details page: " + chrome.runtime.lastError.message);
      } else {
        console.log("Details page opened successfully:", response);
      }
    });

    // Log for debugging
    console.log("Requesting to open details page for URL:", decodedUrl);
  } catch (error) {
    console.error("Error in viewDetails function:", error);
    alert("Error opening details page: " + error.message);
  }
}

// Function to generate alerts HTML for export modal
function generateAlertsHTML(alerts) {
  if (!alerts || alerts.length === 0) {
    return '<p style="text-align: center; color: #4CAF50; padding: 20px;">No security alerts detected.</p>';
  }

  // Group alerts by type
  const alertsByType = {
    malicious: [],
    suspicious: [],
    disinformation: [],
    privacy: []
  };

  alerts.forEach(alert => {
    if (alertsByType[alert.type]) {
      alertsByType[alert.type].push(alert);
    } else {
      alertsByType.suspicious.push(alert);
    }
  });

  // Display alerts in order of severity
  const alertOrder = ['malicious', 'suspicious', 'disinformation', 'privacy'];
  let alertsHTML = '';

  alertOrder.forEach(type => {
    if (alertsByType[type] && alertsByType[type].length > 0) {
      const typeColor = getAlertTypeColor(type);

      alertsHTML += `<h4 style="margin: 15px 0 10px; color: ${typeColor};">${type.charAt(0).toUpperCase() + type.slice(1)} Alerts</h4>`;

      alertsByType[type].forEach(alert => {
        alertsHTML += `
          <div style="margin-bottom: 10px; padding: 10px; border-left: 3px solid ${typeColor}; background-color: ${typeColor}10;">
            <p style="margin: 0 0 5px; font-weight: bold;">${alert.message}</p>
            <p style="margin: 0; color: #666; font-size: 13px;">${alert.details}</p>
          </div>
        `;
      });
    }
  });

  return alertsHTML;
}



// Helper function to get color for risk level
function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case 'low':
      return '#4CAF50'; // Green
    case 'medium':
      return '#FFC107'; // Amber
    case 'high':
      return '#FF5722'; // Orange
    case 'critical':
      return '#F44336'; // Red
    default:
      return '#2196F3'; // Blue
  }
}

// Helper function to get color for alert type
function getAlertTypeColor(alertType) {
  switch (alertType) {
    case 'malicious':
      return '#F44336'; // Red
    case 'suspicious':
      return '#FF5722'; // Orange
    case 'disinformation':
      return '#9C27B0'; // Purple
    case 'privacy':
      return '#2196F3'; // Blue
    default:
      return '#607D8B'; // Blue Grey
  }
}

function rescan(url) {
  // Decode the URL to handle any encoding issues
  const decodedUrl = decodeURIComponent(url);

  // Send message to background script to rescan the URL
  chrome.runtime.sendMessage({
    action: 'rescanUrl',
    url: decodedUrl
  }, response => {
    if (response && response.status === 'success') {
      alert(`Rescan initiated for ${decodedUrl}`);
    } else {
      alert(`Failed to initiate rescan for ${decodedUrl}`);
    }
  });
}

// Function to clear scan history
function clearScanHistory() {
  // Show the confirmation modal
  const clearHistoryModal = document.getElementById('clear-history-modal');
  clearHistoryModal.style.display = 'flex';

  // Add event listeners for the modal buttons
  const cancelButton = document.getElementById('cancel-clear');
  const confirmButton = document.getElementById('confirm-clear');

  // Cancel button closes the modal
  cancelButton.addEventListener('click', function() {
    clearHistoryModal.style.display = 'none';
  });

  // Confirm button clears the history and closes the modal
  confirmButton.addEventListener('click', function() {
    // Clear scan results from storage
    chrome.storage.local.set({ scanResults: {} }, function() {
      // Close the modal
      clearHistoryModal.style.display = 'none';

      // Show a temporary success message
      showSuccessMessage("Scan history has been cleared successfully");

      // Refresh the dashboard to show empty state
      loadDashboardData();
    });
  });
}

// Function to show a temporary success message
function showSuccessMessage(message) {
  // Create a success message element
  const successMessage = document.createElement('div');
  successMessage.className = 'success-message';
  successMessage.textContent = message;

  // Add it to the page
  document.body.appendChild(successMessage);

  // Animate it in
  setTimeout(() => {
    successMessage.classList.add('show');
  }, 10);

  // Remove it after a delay
  setTimeout(() => {
    successMessage.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(successMessage);
    }, 500);
  }, 3000);
}