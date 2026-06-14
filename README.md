# CivicAccess: Intelligent Infrastructure Accessibility Portal

CivicAccess is a decentralized, crowdsourced civic technology application engineered to bridge the gap between citizens and municipal authorities. The platform empowers users to report physical infrastructure accessibility barriers—such as broken wheelchair ramps, missing tactile paving, or malfunctioning elevators—and tracks their resolution through an untamperable, multi-tiered verification pipeline.

By combining AI-driven automated screening, hardware-level telemetry validation, and cryptographic session-state voting blocks, CivicAccess eliminates fraudulent ticket closures, ensures data transparency, and guarantees true accountability in public works management.

---

## 🚀 Core Features

### 1. Automated Severity & Categorization Ingestion
* Leverages the multi-modal Google Gemini 2.5 Flash API directly within the report ingestion stream.
* Automatically evaluates user text descriptions alongside initial proof photographs upon submission.
* Dynamically calculates an objective severity score scaled from 1 to 5 and assigns precise categorical tags to streamline administrative sorting logic.

### 2. Telemetry-Based Proximity Verification (Anti-Fraud Engine)
* Extracts embedded binary EXIF metadata directly from image asset uploads during resolution attempts.
* Parses rational coordinate tuples into high-precision decimal degrees to identify the exact hardware capture point.
* Cross-verifies field contractor evidence against the original barrier geolocation logs using a strict 500-meter mathematical variance delta radius, automatically refusing files lacking authentic geotags.

### 3. Distributed Community Governance Loop
* Prevents immediate structural closure by automatically routing passed submissions into a provisional audit holding state.
* Subjects administrative claims to public vetting where local stakeholders vote on the status of remediation attempts.
* Mandates a minimum milestone threshold of three unique confirmation agreements to permanently resolve tickets, while a single verified dispute immediately reverts the log back into the active pending pool.

### 4. Sybil-Resistant Voting Protection
* Secures the public democratic voting matrix without introducing heavy authentication user-registration overheads.
* Deploys browser-level storage fingerprint tokens to track ballot signatures locally per structural asset entity.
* Enforces a hard constraint boundary of one tracking vote action per issue identifier, eliminating automated script loop exploits and ballot-box stuffing.

### 5. Interactive Visual Audit Canvas
* Enhances tracking accountability by providing citizens with side-by-side split layout comparison matrices containing historical before vs updated fix images.
* Built utilizing a zero-dependency native canvas transform matrix directly inside the side drawer application views.
* Supports active custom magnification scales from 1x up to 4x boundaries, enabling microscopic verification of physical repair qualities.

---

## 🛠️ Technology Stack

* **Backend Framework:** Python, Django, Django REST Framework (DRF)
* **Frontend Library:** React.js (Vite environment deployment architectures)
* **Styling Engine:** Tailwind CSS 
* **Database Management:** SQLite / PostgreSQL
* **Hardware & Vision AI Core:** Google Generative AI (Gemini SDK), Pillow (PIL EXIF Tag Parsers)

---

## 📦 Installation & System Setup

### Prerequisites
* Python 3.10 or higher installed
* Node.js v18 or higher installed
* Valid Google Gemini API Key

### 1. Backend Server Configuration
```bash
# Clone the repository structure
git clone [https://github.com/sakshisingh792/CivicAccess.git](https://github.com/sakshisingh792/CivicAccess.git)
cd civicaccess-workspace

# Establish and activate virtual isolation environment
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate

# Install core framework distribution files
pip install -r requirements.txt

# Setup local application environmental parameters
# Create a .env file inside the root directory and append:
# GEMINI_API_KEY=your_actual_private_api_key_string

# Run database synchronization routines
python manage.py makemigrations
python manage.py migrate

# Initiate local development port engine
python manage.py runserver
