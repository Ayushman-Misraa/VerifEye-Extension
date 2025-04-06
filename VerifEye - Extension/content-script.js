// Content script for Web Risk Scanner
// This script extracts page content for analysis

(function() {
  // Send a quick initial message to let the background script know we're running
  chrome.runtime.sendMessage({
    action: 'contentScriptStarted'
  });

  // Function to extract essential data first (faster)
  function extractEssentialData() {
    try {
      return {
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname,
        isReady: document.readyState === 'complete'
      };
    } catch (error) {
      console.error("Error extracting essential data:", error);
      return { error: error.message };
    }
  }

  // Function to extract all page data
  function extractFullPageData() {
    try {
      // Check if this is a deep scan
      const isDeepScan = window.location.href.includes('deepScan=true');

      // Start with basic data that's unlikely to cause issues
      const pageData = {
        title: document.title,
        url: window.location.href,
        domain: window.location.hostname,
        readyState: document.readyState,
        forms: document.forms.length,
        iframes: document.querySelectorAll('iframe').length,
        deepScan: isDeepScan // Flag to indicate this is a deep scan
      };

      // Add text content (can be large) - increased limit for better accuracy
      try {
        pageData.text = document.body.innerText.substring(0, 150000); // Increased from 100000 to 150000
      } catch (e) {
        pageData.text = "Error extracting text: " + e.message;
      }

      // Add links (can be numerous) - increased limit for better accuracy
      try {
        pageData.links = Array.from(document.links)
          .slice(0, 1500) // Increased from 1000 to 1500 links
          .map(link => link.href);
      } catch (e) {
        pageData.links = [];
      }

      // Add scripts - increased limit for better accuracy
      try {
        pageData.scripts = Array.from(document.scripts)
          .slice(0, 750) // Increased from 500 to 750 scripts
          .map(script => script.src)
          .filter(src => src);
      } catch (e) {
        pageData.scripts = [];
      }

      // Add meta tags
      try {
        pageData.metaTags = Array.from(document.querySelectorAll('meta'))
          .slice(0, 100) // Limit to 100 meta tags
          .map(meta => ({
            name: meta.getAttribute('name'),
            content: meta.getAttribute('content')
          }));
      } catch (e) {
        pageData.metaTags = [];
      }

      // Add HTML (can be very large) - increased limit for better accuracy
      try {
        // Get more HTML data for better analysis
        pageData.html = document.documentElement.outerHTML.substring(0, 300000); // Increased from 200000 to 300000
      } catch (e) {
        pageData.html = "Error extracting HTML: " + e.message;
      }

      // Add additional data for enhanced scanning
      try {
        pageData.cookies = document.cookie.length;
      } catch (e) {
        pageData.cookies = 0;
      }

      // Add external resources
      try {
        const scriptSrcs = Array.from(document.querySelectorAll('script[src]'))
          .slice(0, 200)
          .map(s => s.src);

        const stylesheetHrefs = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
          .slice(0, 100)
          .map(l => l.href);

        const imgSrcs = Array.from(document.querySelectorAll('img[src]'))
          .slice(0, 300)
          .map(i => i.src);

        pageData.externalResources = [...scriptSrcs, ...stylesheetHrefs, ...imgSrcs]
          .filter(url => url && !url.startsWith('data:'));
      } catch (e) {
        pageData.externalResources = [];
      }

      // Add input fields count
      try {
        pageData.inputFields = document.querySelectorAll('input').length;
      } catch (e) {
        pageData.inputFields = 0;
      }

      // Add button text
      try {
        pageData.buttonText = Array.from(document.querySelectorAll('button'))
          .slice(0, 100) // Limit to 100 buttons
          .map(b => b.innerText);
      } catch (e) {
        pageData.buttonText = [];
      }

      // Add headers
      try {
        pageData.headers = Array.from(document.querySelectorAll('h1, h2, h3'))
          .slice(0, 100) // Limit to 100 headers
          .map(h => h.innerText);
      } catch (e) {
        pageData.headers = [];
      }

      // Add storage info
      try {
        pageData.localStorage = Object.keys(localStorage).length;
        pageData.sessionStorage = Object.keys(sessionStorage).length;
      } catch (e) {
        pageData.localStorage = 0;
        pageData.sessionStorage = 0;
      }

      return pageData;
    } catch (error) {
      console.error("Error extracting page content:", error);
      return { error: error.message };
    }
  }

  // First send essential data immediately
  chrome.runtime.sendMessage({
    action: 'contentScriptEssentialData',
    result: extractEssentialData()
  });

  // If the page is still loading, wait for it to complete
  if (document.readyState !== 'complete') {
    window.addEventListener('load', function() {
      setTimeout(function() {
        // Send the full data after a short delay to ensure page is fully loaded
        chrome.runtime.sendMessage({
          action: 'contentScriptResult',
          result: extractFullPageData()
        });
      }, 500);
    });
  } else {
    // Page is already loaded, send data after a minimal delay
    setTimeout(function() {
      chrome.runtime.sendMessage({
        action: 'contentScriptResult',
        result: extractFullPageData()
      });
    }, 100);
  }

  // Set a backup timeout to ensure we send at least some data
  // Significantly increased timeout for deep scans to allow more thorough analysis
  const backupTimeout = window.location.href.includes('deepScan=true') ? 17000 : 5000; // 17 seconds for deep scan (increased from 12), 5 seconds for regular scan

  setTimeout(function() {
    chrome.runtime.sendMessage({
      action: 'contentScriptBackup',
      result: extractEssentialData()
    });
  }, backupTimeout);
})();