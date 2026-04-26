# Medical Clinic Management System

A scalable backend system for managing clinic operations, built using Flask and designed with asynchronous processing and modular architecture.

The system supports end-to-end clinic workflows including patient management, appointment scheduling, medical records, and automated reporting.

---

## Key Highlights

* RESTful API design with role-based access (Admin, Doctor, Patient)
* Asynchronous task processing using Celery and Redis
* PDF report generation and automated email delivery
* Modular and scalable backend architecture
* Integrated frontend support using Vue.js

---

## Technology Stack

| Category      | Technology           |
| ------------- | -------------------- |
| Backend       | Flask, Flask-RESTful |
| Database      | SQLAlchemy, SQLite   |
| Frontend      | Vue.js, Bootstrap    |
| Async Tasks   | Celery, Redis        |
| Reporting     | ReportLab            |
| Networking    | Flask-CORS           |
| Communication | smtplib              |

---

## System Architecture

```text
Client (Vue.js)
      ↓
Flask REST API
      ↓
Business Logic Layer
      ↓
Database (SQLite via SQLAlchemy)
      ↓
Celery Workers (Async Tasks)
      ↓
Redis (Message Broker)
```

---

## Features

### Authentication

* Secure login for Admin, Doctors, and Patients

### Doctor Management

* Create, update, and manage doctor profiles
* Store specialization, qualifications, and notes

### Patient Management

* CRUD operations for patient records
* Retrieval of linked appointments and medical history

### Appointment Scheduling

* Book, update, and cancel appointments
* Manage doctor availability and consultation slots

### Medical History

* Store and retrieve diagnosis and treatment data

### Profile Management

* Upload and retrieve profile images

### Asynchronous Reporting

* Generate PDF reports using ReportLab
* Send reports via email using Celery

---

## Setup and Installation

### Prerequisites

* Python 3.8 or higher
* Redis server

---

### Backend Setup

```bash
# Clone the repository
git clone <repository-url>
cd <project-directory>

# Create virtual environment
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Redis server
redis-server
```

---

### Running the Application

```bash
# Seed database with sample data
python3 -m backend.seed

# Start Flask server
python3 -m backend.app
```

API will be available at:
http://127.0.0.1:5000

---

## Future Improvements

* Migration to PostgreSQL for production scalability
* JWT-based authentication
* Containerization using Docker
* Rate limiting and monitoring

---

## Author

Fazal Iqbal V V
https://linkedin.com/in/fazal-iqbal
https://github.com/FAZE663


4. Running the Celery Worker
Open a new terminal session (and activate the virtual environment) to run the Celery worker for processing background tasks:
celery -A backend.app.celery worker -l info
