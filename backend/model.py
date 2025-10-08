from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Doctor(db.Model):
    __tablename__ = 'doctor'
    did = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    specialty = db.Column(db.String(100), nullable=False)
    qualifications = db.Column(db.String(200), nullable=False)
    rating = db.Column(db.Float)

    # Relationships
    slots = db.relationship('Slot', back_populates='doctor', cascade="all, delete-orphan")
    appointments = db.relationship('Appointment', back_populates='doctor', cascade="all, delete-orphan")
    histories = db.relationship('PatientHistory', back_populates='doctor', cascade="all, delete-orphan")


class Patient(db.Model):
    __tablename__ = 'patient'
    pid = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(100), nullable=False)

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
