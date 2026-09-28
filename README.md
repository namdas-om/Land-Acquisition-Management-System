# National Land Acquisition & Management System (NLAMS)

🏛️ **NLAMS** is a Web-based National Land Acquisition & Management Platform designed to digitize and automate the complete land acquisition lifecycle under India's **LARR Act 2013** (Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act).

---

## 🌟 Key Features

- 🗺️ **GIS Spatial Engine**: Interactive Leaflet maps with **Google Satellite Hybrid**, **ISRO Bhuvan**, **MapmyIndia Mappls**, and **OpenStreetMap India** layers.
- 📋 **Statutory Milestone Stepper**: Real-time progress tracking across Section 11 Preliminary Notification, Section 19 Declaration, Section 21 Notice, R&R Award, and Possession Handover.
- 💰 **LARR 2013 Compensation Calculator**: Calculates land market value, 100% solatium, rural multipliers, R&R packages, and administrative costs.
- 📊 **Executive Dashboard**: KPI summary cards, stage distribution, state breakdown, and budget utilization charts powered by Chart.js.
- ⚖️ **Grievance & Legal Portal**: Landowner hearings, legal team case assignments, and court reference tracking.
- 🔐 **Dual Portal Authentication**: Official SSO (NIC Parichay / Employee ID) and Citizen Portal (Aadhaar / Mobile OTP) with guest mode support.
- 📁 **Document Vault**: Upload and store SIA reports, title deeds, and compliance certificates.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Glassmorphism Design System), JavaScript (ES6+), Leaflet.js, Chart.js, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: SQLite (`sql.js` pure JS with file persistence).
- **Authentication**: Session-based auth (`express-session` + `bcryptjs`).
- **File Uploads**: `multer`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm installed.

### Installation & Run

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Land-Acquisition-Management-System.git
   cd Land-Acquisition-Management-System
   ```

2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📄 License

This project is licensed under the MIT License.
