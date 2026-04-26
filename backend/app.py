from flask import render_template,redirect,flash,url_for,session,Flask
from .api import *
from flask_cors import CORS
import os
from .model import db

from celery import Celery
from celery.schedules import crontab

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from reportlab.platypus import SimpleDocTemplate, Paragraph,Spacer
from reportlab.lib.styles import getSampleStyleSheet


app = Flask(__name__,template_folder='../frontend', static_folder='../frontend')



basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database', 'hospital.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app) 
api=Api(app)
CORS(app)

beat_schedule = {
    "doctor_monthly_reports": {
        "task": "backend.app.send_monthly_doctor_reports",
        "schedule": crontab(hour=9, minute=0, day_of_month='1'),
    }
}

timezone = "Asia/Kolkata"

def make_celery(app):
    celery = Celery(
        app.import_name,
        broker='redis://localhost:6379/0',
        backend='redis://localhost:6379/0'
    )
    celery.conf.update(app.config)

    # Bind Flask context to Celery
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery(app)



@app.route('/')
def index():
    return render_template('index.html')


@app.route("/test_send_reports")
def test_send_reports():
    result = send_monthly_doctor_reports.delay()
    return jsonify({"status": "task queued", "task_id": result.id})

@app.route("/test_reminders")
def test_reminders():
    result = send_appointment_reminders.delay()
    return jsonify({"message": "reminder task queued", "task_id": result.id})




@celery.task(bind=True, name="backend.tasks.send_appointment_reminders")
def send_appointment_reminders(self):
    try:
        now = datetime.now()
        tomorrow = now.date() + timedelta(days=1)

        print(f"Checking for tomorrow's appointments. date{tomorrow}")

        # Get slots for tomorrow that are booked
        upcoming = (
            db.session.query(Appointment)
            .join(Appointment.slot)
            .join(Appointment.patient)
            .join(Appointment.doctor)
            .filter(
                Slot.date == tomorrow,
                Appointment.status == "upcoming"
            )
            
        )
        print(upcoming.statement.compile(compile_kwargs={"literal_binds": True}))

        if not upcoming:
            print("No reminders to send.")
            return

        for appt in upcoming:
            patient = appt.patient
            doctor = appt.doctor
            slot = appt.slot
            
            time_string = slot.time.strftime("%I:%M %p")

            subject = "Appointment Reminder"
            body = f"""
            <h2>Hello {patient.name},</h2>

            <p>This is a reminder for your appointment tomorrow.</p>

            <ul>
            <li><b>Doctor:</b> {doctor.name}</li>
            <li><b>Date:</b> {slot.date}</li>
            <li><b>Time:</b> {time_string}</li>
            </ul>

            <p>Please be on time.</p>
            """

            print(f"Sending reminder to patient {patient.email}")
            send_email(patient.email, subject, body)

        print("All reminders sent.")
    except Exception as e:
        print(f'Error : {e}')





@celery.task(bind=True, name="backend.app.send_monthly_doctor_reports")
def send_monthly_doctor_reports(self):
    try:
        today = datetime.now().date()
        first_day_of_this_month = today.replace(day=1)

        last_month_end = first_day_of_this_month - timedelta(days=1)
        last_month_start = last_month_end.replace(day=1)

        doctors = Doctor.query.all()
        

        for doctor in doctors:
            
            appts = (
                db.session.query(Appointment)
                .join(Appointment.slot)
                .filter(
                    Appointment.did == doctor.did,
                    Slot.date >= last_month_start,
                )
                .all()
            )
            

            if not appts:
                print("No appointments")
                continue
            
            total_appts = len(appts)
            unique_patients = len({a.pid for a in appts})

            day_counts = {}
            for a in appts:
                day_counts[a.slot.date] = day_counts.get(a.slot.date, 0) + 1

            busiest_day = max(day_counts, key=day_counts.get)

            filename = f"/tmp/doctor_report_{doctor.did}.pdf"
            
            generate_doctor_report_pdf(
                doctor=doctor,
                start_date=last_month_start,
                end_date=last_month_end,
                total_appts=total_appts,
                unique_patients=unique_patients,
                busiest_day=busiest_day,
                filename=filename,
                day_counts=day_counts
            )

            print(f"[WORKER] Sending report to {doctor.email}")
            send_email(
                doctor.email,
                f"Monthly Report - {last_month_start.strftime('%B %Y')}",
                f"Hello Dr. {doctor.name}, here is your report.",
                attachment=filename
            )
        
        print("[WORKER] All reports sent.")
        return "done"
    except Exception as e:
        print(f"Error {e}")

def generate_doctor_report_pdf(
    doctor,
    start_date,
    end_date,
    total_appts,
    unique_patients,
    busiest_day,
    filename,
    day_counts
    ):
    doc = SimpleDocTemplate(filename)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("<b>Doctor Monthly Report</b>", styles["Title"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"Doctor: Dr. {doctor.name}", styles["Heading2"]))
    story.append(Paragraph(f"Report Period: {start_date} → {end_date}", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph(f"Total Appointments: {total_appts}", styles["Normal"]))
    story.append(Paragraph(f"Unique Patients: {unique_patients}", styles["Normal"]))
    story.append(Paragraph(f"Busiest Day: {busiest_day}", styles["Normal"]))
    story.append(Spacer(1, 12))

    story.append(Paragraph("<b>Day-wise Appointments:</b>", styles["Heading3"]))
    story.append(Spacer(1, 8))

    for day, count in day_counts.items():
        story.append(Paragraph(f"{day}: {count}", styles["Normal"]))

    doc.build(story)
    print("report generated")
    return filename



def send_email(to_email, subject, body, attachment=None):
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText
    from email.mime.base import MIMEBase
    from email import encoders
    from backend.config import MAIL_SENDER, MAIL_PASSWORD, MAIL_SERVER, MAIL_PORT

    # Email container
    msg = MIMEMultipart()
    msg["From"] = MAIL_SENDER
    msg["To"] = to_email
    msg["Subject"] = subject

    # Email body
    msg.attach(MIMEText(body, "html"))

    # Attachment handling
    if attachment:
        try:
            with open(attachment, "rb") as f:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(f.read())

            encoders.encode_base64(part)
            filename = attachment.split("/")[-1]
            part.add_header("Content-Disposition", f'attachment; filename="{filename}"')
            msg.attach(part)

            print(f"[INFO] Attached file: {filename}")

        except Exception as e:
            print(f"[ERROR] Could not attach file {attachment}: {e}")

    # SMTP Send
    server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
    server.starttls()
    server.login(MAIL_SENDER, MAIL_PASSWORD)

    result = server.sendmail(MAIL_SENDER, to_email, msg.as_string())
    server.quit()

    if result == {}:
        print(f"[SUCCESS] Email sent to {to_email}")
    else:
        print(f"[FAILURE] Could not send to: {result}")




api.add_resource(doctorResource, '/api/doctors', '/api/doctors/<int:did>')
api.add_resource(patientResource, '/api/patients', '/api/patients/<int:pid>')
api.add_resource(appointmentResource, '/api/appointments' , '/api/appointments/<int:did>','/api/appointments/fetch/<int:aid>')
api.add_resource(AppointmentbyDoctorResource , '/api/appointments/doctors/<int:did>')
api.add_resource(PatientHistoryResource, '/api/patienthistory','/api/patienthistory/fetch/<int:appid>')
api.add_resource(DoctorListResource , '/api/doctorlist/<int:deptid>')



api.add_resource(PatientHistoryByPatientResource , '/api/patienthistory/<int:pid>') 

api.add_resource(patientselectResource,'/api/patientselect/<int:did>')
api.add_resource(slotResource,'/api/slots','/api/slots/<int:did>')

api.add_resource(slotconfigResource,'/api/slotconfig','/api/slotconfig/<int:did>')


api.add_resource(profileimageResource, '/api/doctors/image/<int:did>' ,'/api/doctors/image/dept/<int:deptid>')
api.add_resource(patientimageResource, '/api/patients/image/<int:pid>')
api.add_resource(departmentResource,'/api/departments','/api/departments/<int:deptid>')

api.add_resource(loginResource , '/api/login')

if __name__ == '__main__':
    app.run(debug=True)