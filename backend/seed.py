from backend import create_app
from backend.model import db, Doctor, Patient, Slot, Appointment, PatientHistory, SlotConfig, Departments
from datetime import date, time, datetime, timedelta
import random
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():

    print("\nDropping & recreating tables...")
    db.drop_all()
    db.create_all()
    print("✓ Tables ready")

    # -------------------------------------------------
    # 1) DEPARTMENTS
    # -------------------------------------------------
    dept_names = [
        ("Cardiology", "Heart and cardiovascular treatments"),
        ("Dermatology", "Skin, hair, and nails"),
        ("Neurology", "Brain and nervous system"),
        ("Orthopedics", "Bones and joints"),
        ("Pediatrics", "Child care"),
        ("General Physician", "General medical care"),
    ]

    departments = []
    for name, desc in dept_names:
        d = Departments(name=name, description=desc)
        db.session.add(d)
        departments.append(d)

    db.session.commit()
    print(f"✓ Inserted {len(departments)} departments")

    dept_map = {d.name: d.dept_id for d in departments}

    # -------------------------------------------------
    # 2) DOCTORS
    # -------------------------------------------------
    doctor_data = [
        ("Dr. John Doe", "Cardiology", "MBBS, MD Cardiology", 4.7, "fasaliqbal663@gmail.com"),
        ("Dr. Sarah Lee", "Dermatology", "MBBS, MD Dermatology", 4.5, "sarah@hospital.com"),
        ("Dr. Mark Brown", "General Physician", "MBBS", 4.8, "mark@hospital.com"),
        ("Dr. Priya Sharma", "Pediatrics", "MBBS, MD Pediatrics", 4.6, "priya@hospital.com"),
        ("Dr. Arjun Verma", "Neurology", "MBBS, DM Neurology", 4.9, "arjun@hospital.com"),
        ("Dr. Sneha Reddy", "Orthopedics", "MBBS, MS Ortho", 4.4, "sneha@hospital.com"),
    ]

    doctors = []
    for name, dept, qual, rating, email in doctor_data:
        d = Doctor(
            name=name,
            department=dept_map[dept],
            qualifications=qual,
            rating=rating,
            email=email,
            password=generate_password_hash("doctor123")
        )
        db.session.add(d)
        doctors.append(d)

    db.session.commit()
    print(f"✓ Inserted {len(doctors)} doctors")

    # -------------------------------------------------
    # 3) PATIENTS
    # -------------------------------------------------
    patient_data = [
        ("Alice Johnson", "1995-06-15", "9998887777", "Female", "alice@example.com"),
        ("Bob Smith", "1990-02-10", "8887776666", "Male", "bob@example.com"),
        ("Charlie Thomas", "1988-03-22", "7776665555", "Male", "charlie@example.com"),
        ("Disha Patel", "2000-11-20", "9997776665", "Female", "disha@example.com"),
        ("Rohit Mehra", "1993-09-05", "8855224411", "Male", "rohit@example.com"),
        ("Meera Iyer", "1985-03-12", "9922334411", "Female", "meera@example.com"),
    ]

    patients = []
    for name, dob, phone, gender, email in patient_data:
        p = Patient(
            name=name,
            dob=datetime.strptime(dob, "%Y-%m-%d"),
            phone_number=phone,
            email=email,
            gender=gender,
            password=generate_password_hash("patient123")
        )
        db.session.add(p)
        patients.append(p)

    db.session.commit()
    print(f"✓ Inserted {len(patients)} patients")

    # -------------------------------------------------
    # 4) SLOT CONFIG FOR EACH DOCTOR
    # -------------------------------------------------
    configs = []
    for d in doctors:
        cfg = SlotConfig(
            did=d.did,
            start_time=time(9, 0),
            end_time=time(17, 0),
            interval_minutes=30
        )
        db.session.add(cfg)
        configs.append(cfg)

    db.session.commit()
    print(f"✓ Added {len(configs)} slot configs")

    # -------------------------------------------------
    # 5) CREATE SLOTS (available + unavailable + booked)
    # -------------------------------------------------
    today = date.today()
    days = [today + timedelta(days=i) for i in range(3)]

    all_slots = []
    booked_slots = []

    for cfg in configs:
        for day in days:
            t = datetime.combine(day, cfg.start_time)
            end = datetime.combine(day, cfg.end_time)

            while t < end:
                slot_time = t.time()

                # 80% slots available, 20% unavailable
                status = random.choices(
                    ["Available", "Unavailable"],
                    weights=[0.8, 0.2],
                    k=1
                )[0]

                slot = Slot(
                    did=cfg.did,
                    date=day,
                    time=slot_time,
                    status=status
                )
                db.session.add(slot)
                all_slots.append(slot)

                t += timedelta(minutes=cfg.interval_minutes)

    db.session.commit()
    print(f"✓ Created {len(all_slots)} slots")

    # -------------------------------------------------
    # 6) RANDOMLY BOOK SOME OF THE AVAILABLE SLOTS
    # -------------------------------------------------
    available_slots = [s for s in all_slots if s.status == "Available"]
    selected_for_booking = random.sample(available_slots, k=len(doctors) * 5)

    appointments = []

    for slot in selected_for_booking:
        slot.status = "Booked"
        patient = random.choice(patients)

        a = Appointment(
            did=slot.did,
            pid=patient.pid,
            sid=slot.sid,
            status="completed"
        )
        db.session.add(a)
        db.session.flush()

        h = PatientHistory(
            pid=patient.pid,
            did=slot.did,
            aid=a.aid,
            diagnosis=random.choice(["Cold", "Fever", "Back Pain", "Infection"]),
            treatment=random.choice(["Medication", "Rest", "Therapy"]),
            notes="Follow-up advised."
        )
        db.session.add(h)
        appointments.append(a)

    db.session.commit()
    print(f"✓ Created {len(appointments)} appointments & histories")

    print("\n🎉 Database successfully seeded with FULL DATA!")
