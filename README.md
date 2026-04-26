# Medical Clinic Management System

## Project Overview
This is the **backend repository** for a comprehensive Medical Clinic Management System built with **Python Flask**.  
It provides a robust set of RESTful APIs to manage clinic operations, including doctor and patient records, appointment scheduling, medical history, and asynchronous reporting/reminders.

The system is designed to be highly **scalable** and leverages **asynchronous task processing** for critical background jobs like report generation and email notifications.

---

## Technology Stack

| Category            | Technology                     | Purpose                                                                 |
|--------------------|--------------------------------|-------------------------------------------------------------------------|
| Backend Framework   | Flask (Python)                 | Core web framework for building APIs and handling business logic       |
| API Abstraction     | Flask-RESTful                  | Simplifies creation and management of RESTful API endpoints             |
| Database            | Flask-SQLAlchemy, SQLite       | ORM for managing models and queries using a lightweight SQLite DB       |
| Frontend            | Vue.js, Bootstrap              | Reactive UI, dynamic content rendering, and responsive styling          |
| Asynchronous Tasks  | Celery, Redis                  | Task queue and message broker for background and scheduled jobs         |
| Reporting           | ReportLab                      | Generating professional PDF reports (e.g., doctors' performance)       |
| Networking          | Flask-CORS                     | Handles Cross-Origin Resource Sharing between frontend and backend      |
| Communication       | Python's smtplib               | Sending emails including appointment reminders and reports             |

---

## Core Features (API Endpoints)

The API supports the following major features:

- **User Authentication**: Secure login for Patients, Doctors, and Admin roles  
- **Doctor Management**: CRUD operations for doctor profiles including specialization, qualifications, and profile notes  
- **Patient Management**: CRUD operations for patient records and retrieval of linked history/appointments  
- **Appointment Scheduling**: Booking, viewing, updating, and deleting patient appointments  
- **Slot Management**: Configuration and availability check for doctors' consultation slots  
- **Medical History**: Recording and retrieving patient diagnosis and treatment history  
- **Profile Images**: Upload and retrieval of profile images for doctors and patients  
- **Asynchronous Reporting**: Generate PDF reports (e.g., performance reports) via Celery and send them via email  

---

## Local Setup and Installation

### 1. Prerequisites
- **Python 3.8+**
- **Redis server** running locally (required for Celery)

---
# Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Ensure Redis is running locally (required for Celery)
redis-server

# Run the seed script to create and populate the database
python3 -m backend.seed

# Start the Flask application
python3 -m backend.app

celery -A backend.app.celery worker -l info


now the app is ready for use!!


