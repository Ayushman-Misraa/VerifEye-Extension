# 🔐 VerifEye – Browser Security Extension

**VerifEye** is a privacy-first browser extension that scans web pages in real time to detect phishing attacks, malicious scripts, disinformation, and other online threats. Built entirely with **vanilla JavaScript**, VerifEye is lightweight, offline, and completely transparent — giving users full control over their browsing safety without relying on third-party services.

🔗 **GitHub Repo:**  
https://github.com/Ayushman-Misraa/VerifEye-Extension

---

## 🌐 Demo Webpage

👉 **Live Demo Webpage:**  
[https://verifeye-demo.vercel.app](https://verifeye-demo.vercel.app) *(Replace with your actual link)*

📌 **Note:** This is a **visual demo page** for showcasing VerifEye’s behavior on different types of websites.  
It is **not linked** to the actual extension — all real security scanning happens only inside the browser extension.

---

## 🧠 Key Features

- 🧩 **7-Layer Modular Threat Detection**
  - Domain Analysis
  - Malicious JavaScript Detection
  - Content & Disinformation Detection
  - Phishing & Login Form Detection
  - Privacy Tracking Scripts
  - Network Issues (Mixed Content, Insecure Forms)
  - Social Engineering Pattern Analysis

- ⚠️ **Real-time Risk Scoring System (0–100)**
- 🎛️ Auto & Manual Scan Modes
- 🧠 Intelligent False Positive Reduction
- 🌗 Light/Dark Theme Support
- 📤 Export Alerts to CSV
- ⏱️ Scan Duration Tracking
- 💾 Caching with `chrome.storage.local`
- 🛡️ No third-party APIs, libraries, or data tracking

---

## 🛠️ Tech Stack

- **JavaScript (Vanilla)**
- **HTML5 + CSS3**
- **Chrome Extension APIs** (`chrome.runtime`, `chrome.tabs`, `chrome.storage`, etc.)
- No frameworks (React, Vue, etc.)
- No build tools (Webpack, Parcel, etc.)
- No third-party libraries (fully custom logic)

---

## 🧪 How It Works (in 4 steps)

1. 🔎 **Page Load:** Content script extracts basic data like URL, title, and HTML.
2. 🧠 **Deep Scan:** Multiple custom modules analyze the content, scripts, and structure.
3. 🧾 **Score & Alert:** Risk score is calculated and alerts are shown to the user.
4. ⚡ **Quick Actions:** Users can block domains, trust pages, or export results.

---

## 🎥 Demo Video & Screenshots

📽️ **Demo Video:**  
[Watch how VerifEye works](https://example.com/demo-video) *(Replace with your actual video link)*

🖼️ **Comparison Screenshots:**  
Located in the `screenshots/` folder or visible on the demo site — these show side-by-side results for safe vs. malicious websites.

---

## 🧭 Future Roadmap

- ☁️ Cloud Sync for Settings
- 🧠 AI-Based Risk Detection
- 🌍 Multi-language UI
- 📱 Support for Mobile Browsers
- 📊 Threat Analytics Dashboard

---

## 👥 Team

A focused and collaborative team working together to build a browser-first cybersecurity tool. Every member contributes across design, development, research, and user experience — aiming to create a safer web for everyone.

---

## 📝 License

MIT License – Free to use for educational, personal, or research purposes.

---

