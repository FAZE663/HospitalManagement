from flask_sqlalchemy import SQLAlchemy
import os
db = SQLAlchemy()



pwd=os.path.dirname(__file__)
def get_default_image():
    with open(f'{pwd}/../frontend/static/defaultimage.jpg', "rb") as f:
        return f.read()

class Doctor(db.Model):
    __tablename__ = 'doctor'
    did = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    department = db.Column(db.Integer, db.ForeignKey('departments.dept_id'),nullable=False)
    qualifications = db.Column(db.String(200), nullable=False)
    rating = db.Column(db.Float)
    email = db.Column(db.String(100), nullable=False)
    profile_note = db.Column(db.String(500))
    profile_image = db.Column(db.LargeBinary , default=get_default_image)
    image_mimetype = db.Column(db.String(50) , default='image/jpeg')
    password = db.Column(db.String(100), nullable=False , default = 'password')

    # Relationships
    slots = db.relationship('Slot', back_populates='doctor', cascade="all, delete-orphan")
    appointments = db.relationship('Appointment', back_populates='doctor', cascade="all, delete-orphan")
    histories = db.relationship('PatientHistory', back_populates='doctor', cascade="all, delete-orphan")
    slot_config = db.relationship("SlotConfig", back_populates="doctor", uselist=False)
    department_info = db.relationship("Departments", primaryjoin="Doctor.department==Departments.dept_id", viewonly=True)


class Patient(db.Model):
    __tablename__ = 'patient'
    pid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    gender = db.Column(db.String(10), nullable=False)
    profile_image = db.Column(db.LargeBinary , default=get_default_image)
    image_mimetype = db.Column(db.String(50) , default='image/jpeg')

    password = db.Column(db.String(100), nullable=False, default='password')

    # Relationships
    appointments = db.relationship('Appointment', back_populates='patient', cascade="all, delete-orphan")
    histories = db.relationship('PatientHistory', back_populates='patient', cascade="all, delete-orphan")


class Slot(db.Model):
    __tablename__ = 'slots'
    sid = db.Column(db.Integer, primary_key=True)
    did = db.Column(db.Integer, db.ForeignKey('doctor.did'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'available', 'unavailable', 'booked'

    # Relationships
    doctor = db.relationship('Doctor', back_populates='slots')
    appointments = db.relationship('Appointment', back_populates='slot', cascade="all, delete-orphan")


class Appointment(db.Model):
    __tablename__ = 'appointment'
    aid = db.Column(db.Integer, primary_key=True)
    did = db.Column(db.Integer, db.ForeignKey('doctor.did'), nullable=False)
    pid = db.Column(db.Integer, db.ForeignKey('patient.pid'), nullable=False)
    sid = db.Column(db.Integer, db.ForeignKey('slots.sid'), nullable=False)
    status = db.Column(db.String(20), nullable=False)  # 'booked', 'completed', 'cancelled'

    # Relationships
    doctor = db.relationship('Doctor', back_populates='appointments')
    patient = db.relationship('Patient', back_populates='appointments')
    slot = db.relationship('Slot', back_populates='appointments')
    history = db.relationship('PatientHistory', back_populates='appointment', uselist=False, cascade="all, delete-orphan")


class PatientHistory(db.Model):
    __tablename__ = 'patient_history'
    phid = db.Column(db.Integer, primary_key=True)
    pid = db.Column(db.Integer, db.ForeignKey('patient.pid'), nullable=False)
    did = db.Column(db.Integer, db.ForeignKey('doctor.did'), nullable=False)
    aid = db.Column(db.Integer, db.ForeignKey('appointment.aid'), nullable=False)
    diagnosis = db.Column(db.String(200), nullable=False)
    treatment = db.Column(db.String(200), nullable=False)
    notes = db.Column(db.String(500))

    # Relationships
    patient = db.relationship('Patient', back_populates='histories')
    doctor = db.relationship('Doctor', back_populates='histories')
    appointment = db.relationship('Appointment', back_populates='history')

class SlotConfig(db.Model):
    __tablename__ = "slot_config"
    id = db.Column(db.Integer, primary_key=True)
    did = db.Column(db.Integer, db.ForeignKey("doctor.did"), nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    interval_minutes = db.Column(db.Integer, default=30)

    doctor = db.relationship("Doctor", back_populates="slot_config")


class Departments(db.Model):
    __tablename__ = 'departments'
    dept_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))


    
