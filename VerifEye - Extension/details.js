// Details page JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const encodedUrl = urlParams.get('url');

  if (!encodedUrl) {
    showError("No URL specified. Please return to the dashboard and select a site.");
    return;
  }

  let url;
  try {
    url = decodeURIComponent(encodedUrl);
    console.log("Successfully decoded URL parameter:", url);
  } catch (error) {
    console.error("Error decoding URL parameter:", error);
    showError("Invalid URL format. Please return to the dashboard and try again.");
    return;
  }
  
  // Elements
  const siteUrl = document.getElementById('site-url');
  const scanTime = document.getElementById('scan-time');
  const siteDomain = document.getElementById('site-domain');
  const riskScore = document.getElementById('risk-score');
  const riskLevelIndicator = document.getElementById('risk-level-indicator');
  const riskLevelText = document.getElementById('risk-level-text');
  const riskExplanationText = document.getElementById('risk-explanation-text');
  const scoreBar = document.getElementById('score-bar');
  const alertsContainer = document.getElementById('alerts-container');
  const recommendationsContainer = document.getElementById('recommendations-container');
  const technicalDetailsContainer = document.getElementById('technical-details-container');
  const toggleTechnicalButton = document.getElementById('toggle-technical');
  const technicalDetailsBody = document.getElementById('technical-details-body');
  const backToDashboardButton = document.getElementById('back-to-dashboard');
  const themeToggle = document.getElementById('theme-toggle-input');
  
  // Load scan data
  loadScanData(url);
  
  // Event listeners
  backToDashboardButton.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
  
  toggleTechnicalButton.addEventListener('click', () => {
    const isExpanded = toggleTechnicalButton.classList.contains('expanded');
    
    if (isExpanded) {
      technicalDetailsBody.style.display = 'none';
      toggleTechnicalButton.classList.remove('expanded');
    } else {
      technicalDetailsBody.style.display = 'block';
      toggleTechnicalButton.classList.add('expanded');
    }
  });
  
  // Theme toggle
  themeToggle.addEventListener('change', function() {
    if (this.checked) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  });
  
  // Apply saved theme
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.checked = true;
  }
  
  // Functions
  async function loadScanData(url) {
    try {
      const data = await getScanData(url);
      
      if (!data) {
        showError("No scan data found for this URL. Please return to the dashboard and rescan the site.");
        return;
      }
      
      // Update UI with scan data
      updateUI(data);
    } catch (error) {
      console.error('Error loading scan data:', error);
      showError("Error loading scan data: " + error.message);
    }
  }
  
  async function getScanData(url) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('scanResults', (data) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        if (data.scanResults && data.scanResults[url]) {
          resolve(data.scanResults[url]);
        } else {
          resolve(null);
        }
      });
    });
  }
  
  function updateUI(data) {
    // Update site info
    siteUrl.textContent = data.url || 'Unknown';
    scanTime.textContent = data.scanTime || 'Unknown';
    siteDomain.textContent = extractDomain(data.url) || 'Unknown';
    riskScore.textContent = `${data.riskScore || 0}/100`;
    
    // Update risk level
    riskLevelIndicator.className = 'risk-level-large ' + data.riskLevel;
    riskLevelText.textContent = data.riskLevel.charAt(0).toUpperCase() + data.riskLevel.slice(1);
    
    // Update risk explanation
    riskExplanationText.textContent = getRiskExplanation(data.riskLevel);
    
    // Animate score bar
    setTimeout(() => {
      scoreBar.style.width = `${data.riskScore || 0}%`;
    }, 100);
    
    // Update alerts
    updateAlerts(data.alerts || []);
    
    // Update recommendations
    updateRecommendations(data);
    
    // Update technical details
    updateTechnicalDetails(data);
  }
  
  function updateAlerts(alerts) {
    if (alerts.length === 0) {
      alertsContainer.innerHTML = '<p class="no-alerts">No security alerts detected.</p>';
      return;
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
    let alertsHtml = '';
    
    alertOrder.forEach(type => {
      if (alertsByType[type] && alertsByType[type].length > 0) {
        alertsHtml += `
          <div class="alert-group">
            <h3 class="alert-group-header">${type.charAt(0).toUpperCase() + type.slice(1)} Alerts</h3>
        `;
        
        alertsByType[type].forEach(alert => {
          alertsHtml += `
            <div class="alert-item-detailed ${alert.type}">
              <div class="alert-title">${alert.message}</div>
              <div class="alert-description">${alert.details}</div>
            </div>
          `;
        });
        
        alertsHtml += '</div>';
      }
    });
    
    alertsContainer.innerHTML = alertsHtml;
  }
  
  function updateRecommendations(data) {
    // Generate recommendations based on scan results
    const recommendations = generateRecommendations(data);
    
    if (recommendations.length === 0) {
      recommendationsContainer.innerHTML = '<p>No specific recommendations available.</p>';
      return;
    }
    
    let recommendationsHtml = '';
    
    recommendations.forEach(recommendation => {
      recommendationsHtml += `
        <div class="recommendation-item">
          <div class="recommendation-title">
            <span class="material-icons">lightbulb</span>
            ${recommendation.title}
          </div>
          <div class="recommendation-description">${recommendation.details}</div>
        </div>
      `;
    });
    
    recommendationsContainer.innerHTML = recommendationsHtml;
  }
  
  function updateTechnicalDetails(data) {
    // Create a formatted JSON string of the scan data
    const technicalData = JSON.stringify(data, null, 2);
    technicalDetailsContainer.textContent = technicalData;
  }
  
  function showError(message) {
    document.querySelector('.details-content').innerHTML = `
      <div class="modern-card error-card">
        <div class="modern-card-header">
          <h2>Error</h2>
        </div>
        <div class="modern-card-body">
          <p>${message}</p>
          <button id="error-back-button" class="futuristic-button" style="margin-top: 20px;">
            Back to Dashboard
          </button>
        </div>
      </div>
    `;
    
    document.getElementById('error-back-button').addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
  
  function getRiskExplanation(riskLevel) {
    switch (riskLevel) {
      case 'low':
        return 'This site appears to be safe with minimal security concerns. You can browse with confidence.';
      case 'medium':
        return 'This site has some security concerns that should be addressed. Exercise caution when sharing sensitive information.';
      case 'high':
        return 'This site has significant security issues that pose a risk. Be very cautious and avoid sharing personal information.';
      case 'critical':
        return 'This site has critical security vulnerabilities and may be dangerous. We recommend avoiding this site entirely.';
      default:
        return 'Unable to determine the security status of this site.';
    }
  }
  
  function generateRecommendations(scanResult) {
    const recommendations = [];
    
    // Default recommendations
    recommendations.push({
      title: 'Keep your browser updated',
      details: 'Ensure your web browser is always updated to the latest version to benefit from security patches and improvements.'
    });
    
    recommendations.push({
      title: 'Use a password manager',
      details: 'Use a reputable password manager to create and store strong, unique passwords for each website you visit.'
    });
    
    // Add specific recommendations based on alerts
    if (scanResult.alerts && scanResult.alerts.length > 0) {
      const alertTypes = new Set(scanResult.alerts.map(alert => alert.type));
      
      if (alertTypes.has('malicious')) {
        recommendations.push({
          title: 'Avoid this website',
          details: 'This website contains potentially malicious content. We recommend avoiding it entirely and finding alternative services.'
        });
      }
      
      if (alertTypes.has('suspicious')) {
        recommendations.push({
          title: 'Proceed with caution',
          details: 'This website contains suspicious elements. If you must use it, avoid entering sensitive information and consider using a secure VPN.'
        });
      }
      
      if (alertTypes.has('privacy')) {
        recommendations.push({
          title: 'Review privacy settings',
          details: 'This website may collect excessive personal data. Consider using privacy-focused browser extensions and reviewing your browser\'s privacy settings.'
        });
      }
      
      // Check for specific alert patterns
      const hasInsecureConnection = scanResult.alerts.some(alert => 
        alert.message.includes('Insecure connection') || alert.details.includes('HTTPS'));
      
      if (hasInsecureConnection) {
        recommendations.push({
          title: 'Look for secure alternatives',
          details: 'This website does not use secure HTTPS connections. Look for alternative services that prioritize security with proper encryption.'
        });
      }
      
      const hasObfuscatedJS = scanResult.alerts.some(alert => 
        alert.message.includes('obfuscated JavaScript') || alert.details.includes('JavaScript'));
      
      if (hasObfuscatedJS) {
        recommendations.push({
          title: 'Use script blocking extensions',
          details: 'Consider using browser extensions that can block suspicious scripts from running automatically on websites.'
        });
      }
    }
    
    return recommendations;
  }
  
  function extractDomain(url) {
    if (!url) return '';
    
    try {
      // Remove protocol and get domain
      let domain = url.replace(/(https?:\/\/)?(www\.)?/i, '');
      
      // Remove path and query string
      domain = domain.split('/')[0];
      
      return domain;
    } catch (e) {
      console.error('Error extracting domain:', e);
      return url;
    }
  }
});