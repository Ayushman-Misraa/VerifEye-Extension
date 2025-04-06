// PDF Report Generator for Web Risk Scanner
// Uses jsPDF library to generate detailed security reports

class SecurityReportGenerator {
  constructor() {
    this.jsPDF = null;
    this.loadJsPDF();
  }

  // Load jsPDF library dynamically
  async loadJsPDF() {
    if (typeof jspdf !== 'undefined') {
      this.jsPDF = jspdf.jsPDF;
      return;
    }

    return new Promise((resolve, reject) => {
      // Create script element to load jsPDF
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => {
        this.jsPDF = jspdf.jsPDF;
        resolve();
      };
      script.onerror = (error) => {
        console.error('Failed to load jsPDF library:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  // Generate a PDF report for a single website scan
  async generateSingleReport(scanResult) {
    await this.ensureJsPDFLoaded();
    
    // Create new PDF document
    const doc = new this.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add report header
    this.addReportHeader(doc, scanResult);
    
    // Add summary section
    this.addSummarySection(doc, scanResult);
    
    // Add detailed alerts section
    this.addAlertsSection(doc, scanResult);
    
    // Add recommendations section
    this.addRecommendationsSection(doc, scanResult);
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount} | Web Risk Scanner Report | Generated: ${new Date().toLocaleString()}`, 
        doc.internal.pageSize.getWidth() / 2, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: 'center' });
    }
    
    // Return the PDF document
    return doc;
  }
  
  // Generate a comprehensive report for multiple website scans
  async generateComprehensiveReport(scanResults) {
    await this.ensureJsPDFLoaded();
    
    // Create new PDF document
    const doc = new this.jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Add report cover page
    this.addCoverPage(doc, scanResults);
    
    // Add table of contents
    this.addTableOfContents(doc, scanResults);
    
    // Add overview section with statistics
    this.addOverviewSection(doc, scanResults);
    
    // Add individual site reports
    let siteIndex = 1;
    for (const [url, result] of Object.entries(scanResults)) {
      // Add page break before each site (except the first one)
      if (siteIndex > 1) {
        doc.addPage();
      }
      
      // Add site header
      doc.setFontSize(16);
      doc.setTextColor(0, 51, 102);
      doc.text(`${siteIndex}. ${this.extractDomain(url)}`, 20, 20);
      
      // Add site details in a condensed format
      this.addSiteSummary(doc, result, 25);
      
      siteIndex++;
    }
    
    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Page ${i} of ${pageCount} | Web Risk Scanner Report | Generated: ${new Date().toLocaleString()}`, 
        doc.internal.pageSize.getWidth() / 2, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: 'center' });
    }
    
    // Return the PDF document
    return doc;
  }
  
  // Ensure jsPDF is loaded before generating reports
  async ensureJsPDFLoaded() {
    if (!this.jsPDF) {
      await this.loadJsPDF();
    }
    
    if (!this.jsPDF) {
      throw new Error('Failed to load jsPDF library. Please check your internet connection and try again.');
    }
  }
  
  // Add report header with logo and title
  addReportHeader(doc, scanResult) {
    // Add logo (placeholder - would need to convert icon to base64)
    // doc.addImage(logoBase64, 'PNG', 20, 10, 30, 30);
    
    // Add title
    doc.setFontSize(24);
    doc.setTextColor(0, 51, 102);
    doc.text('Web Security Scan Report', 20, 20);
    
    // Add site information
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(`Site: ${this.extractDomain(scanResult.url)}`, 20, 30);
    
    // Add scan time
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Scan performed: ${scanResult.scanTime}`, 20, 40);
    
    // Add horizontal line
    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);
  }
  
  // Add summary section with risk level and score
  addSummarySection(doc, scanResult) {
    // Section title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Security Summary', 20, 55);
    
    // Risk level indicator
    doc.setFontSize(14);
    doc.setTextColor(this.getRiskColor(scanResult.riskLevel));
    doc.text(`Risk Level: ${scanResult.riskLevel.toUpperCase()}`, 20, 65);
    
    // Risk score
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Risk Score: ${scanResult.riskScore}/100`, 20, 75);
    
    // Alert count
    const alertCount = scanResult.alerts ? scanResult.alerts.length : 0;
    doc.text(`Alerts Detected: ${alertCount}`, 20, 85);
    
    // Add risk level visualization
    this.addRiskVisualization(doc, scanResult, 95);
  }
  
  // Add risk visualization (gauge or bar)
  addRiskVisualization(doc, scanResult, yPosition) {
    const score = scanResult.riskScore || 0;
    const width = 150;
    const height = 15;
    const x = 20;
    const y = yPosition;
    
    // Draw background bar
    doc.setFillColor(240);
    doc.rect(x, y, width, height, 'F');
    
    // Draw score bar
    const scoreWidth = (score / 100) * width;
    doc.setFillColor(this.getRiskColor(scanResult.riskLevel));
    doc.rect(x, y, scoreWidth, height, 'F');
    
    // Draw border
    doc.setDrawColor(200);
    doc.rect(x, y, width, height, 'S');
    
    // Add labels
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('0', x, y + height + 5);
    doc.text('100', x + width, y + height + 5);
    doc.text(`${score}`, x + scoreWidth, y + height + 5, { align: 'center' });
  }
  
  // Add detailed alerts section
  addAlertsSection(doc, scanResult, startY = 120) {
    let yPosition = startY;
    
    // Section title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Security Alerts', 20, yPosition);
    yPosition += 10;
    
    // If no alerts, show message
    if (!scanResult.alerts || scanResult.alerts.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 150, 0);
      doc.text('No security alerts detected.', 20, yPosition);
      return yPosition + 10;
    }
    
    // Group alerts by type
    const alertsByType = {
      malicious: [],
      suspicious: [],
      disinformation: [],
      privacy: []
    };
    
    scanResult.alerts.forEach(alert => {
      if (alertsByType[alert.type]) {
        alertsByType[alert.type].push(alert);
      } else {
        alertsByType.suspicious.push(alert);
      }
    });
    
    // Display alerts in order of severity
    const alertOrder = ['malicious', 'suspicious', 'disinformation', 'privacy'];
    
    alertOrder.forEach(type => {
      if (alertsByType[type] && alertsByType[type].length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Add type header
        doc.setFontSize(14);
        doc.setTextColor(this.getAlertTypeColor(type));
        doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Alerts (${alertsByType[type].length})`, 20, yPosition);
        yPosition += 8;
        
        // Add each alert
        alertsByType[type].forEach(alert => {
          // Check if we need a new page
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Alert title
          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.text(alert.message, 25, yPosition);
          yPosition += 6;
          
          // Alert details (with text wrapping)
          doc.setFontSize(10);
          doc.setTextColor(80);
          
          const splitDetails = doc.splitTextToSize(alert.details, 160);
          doc.text(splitDetails, 30, yPosition);
          yPosition += (splitDetails.length * 5) + 5;
        });
      }
    });
    
    return yPosition;
  }
  
  // Add recommendations section
  addRecommendationsSection(doc, scanResult, startY = null) {
    // If startY is not provided, add a new page
    if (startY === null) {
      doc.addPage();
      startY = 20;
    } else if (startY > 240) {
      doc.addPage();
      startY = 20;
    }
    
    let yPosition = startY;
    
    // Section title
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('Security Recommendations', 20, yPosition);
    yPosition += 10;
    
    // Generate recommendations based on alerts
    const recommendations = this.generateRecommendations(scanResult);
    
    // Add each recommendation
    recommendations.forEach((recommendation, index) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Recommendation number and title
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`${index + 1}. ${recommendation.title}`, 20, yPosition);
      yPosition += 6;
      
      // Recommendation details (with text wrapping)
      doc.setFontSize(10);
      doc.setTextColor(80);
      
      const splitDetails = doc.splitTextToSize(recommendation.details, 170);
      doc.text(splitDetails, 25, yPosition);
      yPosition += (splitDetails.length * 5) + 8;
    });
    
    return yPosition;
  }
  
  // Generate recommendations based on scan results
  generateRecommendations(scanResult) {
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
  
  // Add cover page for comprehensive report
  addCoverPage(doc, scanResults) {
    // Title
    doc.setFontSize(28);
    doc.setTextColor(0, 51, 102);
    doc.text('Web Security Scan', 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() / 3, 
      { align: 'center' });
    
    doc.setFontSize(24);
    doc.text('Comprehensive Report', 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() / 3 + 12, 
      { align: 'center' });
    
    // Count sites and calculate statistics
    const siteCount = Object.keys(scanResults).length;
    let highRiskCount = 0;
    let totalScore = 0;
    
    for (const result of Object.values(scanResults)) {
      if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
        highRiskCount++;
      }
      totalScore += result.riskScore || 0;
    }
    
    const avgScore = siteCount > 0 ? Math.round(totalScore / siteCount) : 0;
    
    // Add statistics
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`Sites Scanned: ${siteCount}`, 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() / 2, 
      { align: 'center' });
    
    doc.text(`High Risk Sites: ${highRiskCount}`, 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() / 2 + 10, 
      { align: 'center' });
    
    doc.text(`Average Risk Score: ${avgScore}/100`, 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() / 2 + 20, 
      { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() / 2 + 40, 
      { align: 'center' });
  }
  
  // Add table of contents
  addTableOfContents(doc, scanResults) {
    doc.addPage();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0);
    doc.text('Table of Contents', 20, 20);
    
    // Add sections
    let yPosition = 40;
    
    doc.setFontSize(12);
    doc.text('1. Overview', 20, yPosition);
    yPosition += 10;
    
    // Add site entries
    let siteIndex = 2;
    for (const url of Object.keys(scanResults)) {
      doc.text(`${siteIndex}. ${this.extractDomain(url)}`, 20, yPosition);
      yPosition += 10;
      siteIndex++;
      
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
    }
  }
  
  // Add overview section with statistics
  addOverviewSection(doc, scanResults) {
    doc.addPage();
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0);
    doc.text('1. Overview', 20, 20);
    
    // Count sites by risk level
    const riskLevelCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    let totalAlerts = 0;
    
    for (const result of Object.values(scanResults)) {
      if (riskLevelCounts[result.riskLevel] !== undefined) {
        riskLevelCounts[result.riskLevel]++;
      }
      
      if (result.alerts) {
        totalAlerts += result.alerts.length;
      }
    }
    
    // Add statistics
    doc.setFontSize(14);
    doc.text('Risk Level Distribution', 20, 40);
    
    // Add risk level bars
    let yPosition = 50;
    const barWidth = 150;
    const barHeight = 15;
    const siteCount = Object.keys(scanResults).length || 1; // Avoid division by zero
    
    // Low risk
    doc.setFontSize(12);
    doc.text('Low Risk:', 20, yPosition);
    doc.setFillColor(0, 150, 0);
    doc.rect(80, yPosition - 10, (riskLevelCounts.low / siteCount) * barWidth, barHeight, 'F');
    doc.text(`${riskLevelCounts.low} sites`, 80 + (riskLevelCounts.low / siteCount) * barWidth + 5, yPosition);
    yPosition += 20;
    
    // Medium risk
    doc.text('Medium Risk:', 20, yPosition);
    doc.setFillColor(255, 193, 7);
    doc.rect(80, yPosition - 10, (riskLevelCounts.medium / siteCount) * barWidth, barHeight, 'F');
    doc.text(`${riskLevelCounts.medium} sites`, 80 + (riskLevelCounts.medium / siteCount) * barWidth + 5, yPosition);
    yPosition += 20;
    
    // High risk
    doc.text('High Risk:', 20, yPosition);
    doc.setFillColor(255, 87, 34);
    doc.rect(80, yPosition - 10, (riskLevelCounts.high / siteCount) * barWidth, barHeight, 'F');
    doc.text(`${riskLevelCounts.high} sites`, 80 + (riskLevelCounts.high / siteCount) * barWidth + 5, yPosition);
    yPosition += 20;
    
    // Critical risk
    doc.text('Critical Risk:', 20, yPosition);
    doc.setFillColor(244, 67, 54);
    doc.rect(80, yPosition - 10, (riskLevelCounts.critical / siteCount) * barWidth, barHeight, 'F');
    doc.text(`${riskLevelCounts.critical} sites`, 80 + (riskLevelCounts.critical / siteCount) * barWidth + 5, yPosition);
    yPosition += 30;
    
    // Add alert summary
    doc.setFontSize(14);
    doc.text('Alert Summary', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Total Alerts Detected: ${totalAlerts}`, 20, yPosition);
    yPosition += 10;
    
    // Count alerts by type
    const alertTypeCounts = {
      malicious: 0,
      suspicious: 0,
      disinformation: 0,
      privacy: 0
    };
    
    for (const result of Object.values(scanResults)) {
      if (result.alerts) {
        result.alerts.forEach(alert => {
          if (alertTypeCounts[alert.type] !== undefined) {
            alertTypeCounts[alert.type]++;
          }
        });
      }
    }
    
    // Add alert type counts
    Object.entries(alertTypeCounts).forEach(([type, count]) => {
      if (count > 0) {
        doc.text(`${type.charAt(0).toUpperCase() + type.slice(1)} Alerts: ${count}`, 30, yPosition);
        yPosition += 8;
      }
    });
  }
  
  // Add site summary for comprehensive report
  addSiteSummary(doc, result, startY) {
    let yPosition = startY;
    
    // URL and scan time
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`URL: ${result.url}`, 20, yPosition);
    yPosition += 6;
    doc.text(`Scanned: ${result.scanTime}`, 20, yPosition);
    yPosition += 10;
    
    // Risk level and score
    doc.setFontSize(12);
    doc.setTextColor(this.getRiskColor(result.riskLevel));
    doc.text(`Risk Level: ${result.riskLevel.toUpperCase()}`, 20, yPosition);
    yPosition += 6;
    
    doc.setTextColor(0);
    doc.text(`Risk Score: ${result.riskScore}/100`, 20, yPosition);
    yPosition += 6;
    
    const alertCount = result.alerts ? result.alerts.length : 0;
    doc.text(`Alerts: ${alertCount}`, 20, yPosition);
    yPosition += 10;
    
    // Add mini risk visualization
    this.addRiskVisualization(doc, result, yPosition);
    yPosition += 20;
    
    // Add top alerts (max 3)
    if (result.alerts && result.alerts.length > 0) {
      doc.setFontSize(12);
      doc.text('Top Alerts:', 20, yPosition);
      yPosition += 6;
      
      const topAlerts = result.alerts.slice(0, 3);
      
      topAlerts.forEach(alert => {
        doc.setFontSize(10);
        doc.setTextColor(this.getAlertTypeColor(alert.type));
        doc.text(`• ${alert.message}`, 25, yPosition);
        yPosition += 5;
      });
      
      if (result.alerts.length > 3) {
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`... and ${result.alerts.length - 3} more alerts`, 25, yPosition);
        yPosition += 5;
      }
    }
    
    return yPosition;
  }
  
  // Helper function to extract domain from URL
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return url;
    }
  }
  
  // Helper function to get color for risk level
  getRiskColor(riskLevel) {
    switch (riskLevel) {
      case 'low':
        return [0, 150, 0]; // Green
      case 'medium':
        return [255, 193, 7]; // Amber
      case 'high':
        return [255, 87, 34]; // Orange
      case 'critical':
        return [244, 67, 54]; // Red
      default:
        return [0, 0, 0]; // Black
    }
  }
  
  // Helper function to get color for alert type
  getAlertTypeColor(alertType) {
    switch (alertType) {
      case 'malicious':
        return [244, 67, 54]; // Red
      case 'suspicious':
        return [255, 87, 34]; // Orange
      case 'disinformation':
        return [156, 39, 176]; // Purple
      case 'privacy':
        return [33, 150, 243]; // Blue
      default:
        return [0, 0, 0]; // Black
    }
  }
}

// Export the report generator
window.SecurityReportGenerator = SecurityReportGenerator;