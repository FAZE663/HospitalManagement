Medical Clinic Management System
Project Overview
This is the backend repository for a comprehensive Medical Clinic Management System, built using Python's Flask framework. It provides a robust set of RESTful APIs to manage clinic operations, including doctor and patient records, appointment scheduling, medical history, and asynchronous reporting/reminders.
The system is designed to be highly scalable and leverages asynchronous task processing for critical background jobs like report generation and email communication.
 Technology Stack
Category
Technology
Purpose
Backend Framework
Flask (Python)
Core web framework for building APIs and handling business logic.
API Abstraction
Flask-RESTful
Simplifies the creation and management of RESTful API endpoints.
Database
Flask-SQLAlchemy, SQLite
ORM for managing models and queries, using a lightweight SQLite database.
Frontend
Vue.js, Bootstrap
Frontend framework for reactive UI, dynamic content rendering, and responsive styling.
Asynchronous Tasks
Celery, Redis
Celery serves as the task queue for handling background, scheduled, and resource-intensive jobs. Redis acts as the message broker.
Reporting
ReportLab
Used for generating professional PDF reports, such as doctors' monthly performance summaries.
Networking
Flask-CORS
Handles Cross-Origin Resource Sharing to allow the Vue.js frontend to securely communicate with the Flask backend.
Communication
Python's smtplib
Utilized for sending emails, including appointment reminders and reports.

Core Features (API Endpoints)
The API supports the following major features:
User Authentication: Secure login for Patients, Doctors, and Admin roles.
Doctor Management: CRUD operations for doctor profiles, including specialization, qualifications, and profile notes.
Patient Management: CRUD operations for patient records and retrieval of linked history/appointments.
Appointment Scheduling: Booking, viewing, updating, and deleting patient appointments.
Slot Management: Configuration and availability check for doctors' consultation slots.
Medical History: Recording and retrieving patient diagnosis and treatment history.
Profile Images: Upload and retrieval of profile images for doctors and patients.
Asynchronous Reporting: Generating PDF reports (e.g., performance reports) via Celery and sending them via email.
🛠️ Local Setup and Installation
Follow these steps to get the project running locally.
1. Prerequisites
Python 3.8+
Redis server running locally (required for Celery)
2. Backend Setup
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate # On Windows, use: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Ensure Redis is running locally (required for Celery and caching)
redis-server


3. Running the Backend
Run the Flask application in the main folder:
# Run the seed.py to create and populate the db with some random data
python3 -m backend.seed
python3 -m backend.app
# The API server will be available at [http://127.0.0.1:5000](http://127.0.0.1:5000)


4. Running the Celery Worker
Open a new terminal session (and activate the virtual environment) to run the Celery worker for processing background tasks:
celery -A backend.app.celery worker -l info
