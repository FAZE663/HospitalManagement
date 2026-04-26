from flask import Flask,request,jsonify
from .model import *
from flask_restful import Api, Resource
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import joinedload
from datetime import datetime, date,time,timedelta
from redis import Redis
import io
from flask import send_file

redisclient = Redis(host='localhost', port=6379)




class doctorResource(Resource):
    def get(self, did=None):
        try:
            if did is None:
                # Return all doctors
                doctors = Doctor.query.all()
                output = []
                for doctor in doctors:
                    output.append({
                        'id': doctor.did,
                        'name': doctor.name,
                        'specialization': doctor.department_info.name,
                        'qualification': doctor.qualifications,
                        'rating': doctor.rating,
                        'email': doctor.email
                    })
                return jsonify(output)

            # Return single doctor
            doctor = Doctor.query.get(did)
            if not doctor:
                return {'message': 'Doctor not found'}, 404

            return {
                'id': doctor.did,
                'name': doctor.name,
                'specialization': doctor.department_info.name,
                'qualification': doctor.qualifications,
                'rating': doctor.rating,
                'email': doctor.email,
                'profile_image': doctor.profile_image.decode('latin1') if doctor.profile_image else None,
                'image_mimetype': doctor.image_mimetype,
                'profile_note': doctor.profile_note
            }

        except Exception as e:
            print("Error fetching doctor(s):", e)
            return {'message': 'Error fetching doctor'}, 500

    def post(self):
        try:

            department = Departments.query.filter_by(name=request.json['specialization']).first()
            data = request.get_json()
            new_doctor = Doctor(
                name=data['name'],
                department=department.dept_id,
                qualifications=data['qualification'],
                email=data['email'],
                rating=data.get('rating', None)
            )
            db.session.add(new_doctor)
            db.session.commit()
            return {'message': 'Doctor added successfully', 'did': new_doctor.did}
        except Exception as e:
            db.session.rollback()
            print("Error adding doctor:", e)
            return {'message': 'Error adding doctor'}, 500
    def delete(self, did):
        try:
            doctor = Doctor.query.get(did)
            if not doctor:
                return {'message': 'Doctor not found'}, 404
            db.session.delete(doctor)
            db.session.commit()
            return {'message': 'Doctor deleted successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error deleting doctor:", e)
            return {'message': 'Error deleting doctor'}, 500   
    def put(self, did):
        try:
            doctor = Doctor.query.get(did)
            if not doctor:
                return {'message': 'Doctor not found'}, 404

            dept = Departments.query.filter_by(name=request.json['specialization']).first()
            if not dept:
                return {'message': 'Department not found'}, 404 
            data = request.get_json()
            print("Update data received:", data)
            doctor.name = data.get('name', doctor.name)
            doctor.department = dept.dept_id
            doctor.qualifications = data.get('qualifications', doctor.qualifications)
            doctor.rating = data.get('rating', doctor.rating)
            doctor.email = data.get('email', doctor.email)
            doctor.profile_note = data.get('profile_note', doctor.profile_note)

            db.session.commit()
            return {'message': 'Doctor updated successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error updating doctor:", e)
            return {'message': 'Error updating doctor'}, 500

class DoctorListResource(Resource):
    def get(self,deptid):
        try:
            doctors = Doctor.query.filter_by(department=deptid).all()
            output = []
            for doctor in doctors:
                output.append({
                    'id': doctor.did,
                    'name': doctor.name,
                    'specialization': doctor.department_info.name,
                    'qualification': doctor.qualifications,
                    'rating': doctor.rating,
                    'profile_note': doctor.profile_note,
                 
                })
            return jsonify(output)
        except Exception as e:
            print("Error fetching doctors by department:", e)
            return {'message': 'Error fetching doctors by department'}, 500

class patientResource(Resource):
    def get(self , pid=None):
        if pid is None:
            try:
                patients = Patient.query.all()
                output = []
                for patient in patients:
                    pat_data = {
                        'id': patient.pid,
                        'name': patient.name,
                        'age': patient.dob.strftime('%Y-%m-%d'),
                        'phone': patient.phone_number,
                        'email': patient.email,
                        'gender':patient.gender
                    }
                    output.append(pat_data)
                return output
            except Exception as e:
                print("Error fetching patients:", e)
                return {'message': 'Error fetching patients'}, 500
        else:
            try: 
                patient = (
                            Patient.query
                            .options(
                                joinedload(Patient.appointments),
                                joinedload(Patient.histories)
                            )
                            .filter_by(pid=pid)
                            .first()
                        )
                if not patient:
                    return {'message': 'Patient not found'}, 404

                pat_data = {
                    'id': patient.pid,
                    'name': patient.name,
                    'age': patient.dob.strftime('%Y-%m-%d'),
                    'phone': patient.phone_number,
                    'email': patient.email,
                    'gender':patient.gender,
                    'profile_image': patient.profile_image.decode('latin1') if patient.profile_image else None,
                    'image_mimetype': patient.image_mimetype,
                    'appointments': [{
                        'id': app.aid,
                        'doctor': app.doctor.name,
                        'date': app.slot.date.strftime('%Y-%m-%d'),
                        'time': app.slot.time.strftime('%H:%M'),
                        'status': app.status,
                    } for app in patient.appointments],
                    'histories': [{
                        'history_id': hist.phid,
                        'appointment_id': hist.aid,
                        'doctor_id': hist.did,
                        'doctor_name': hist.doctor.name,
                        'diagnosis': hist.diagnosis,
                        'treatment': hist.treatment,
                        'notes': hist.notes,
                        'date': hist.appointment.slot.date.strftime('%Y-%m-%d'),
                    } for hist in patient.histories]
                }
                return pat_data    
            except Exception as e:
                print("Error fetching patient:", e)
                return {'message': 'Error fetching patient'}, 500         
    
    def put(self, pid):
        try:
            patient = Patient.query.get(pid)
            if not patient:
                return {'message': 'Patient not found'}, 404

            data = request.get_json()
            print("Update data received:", data)
            patient.name = data.get('name', patient.name)
            patient.gender = data.get('gender', patient.gender)
            patient.phone_number = data.get('phone_number', patient.phone_number)
            patient.email = data.get('email', patient.email)

            db.session.commit()
            return {'message': 'Patient updated successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error updating patient:", e)
            return {'message': 'Error updating patient'}, 500
    def post(self):
        try:
            data = request.get_json()
            new_patient = Patient(
                name=data['name'],
                dob=date.fromisoformat(data['age']),
                gender=data['gender'],
                phone_number=data['phone'],
                email=data['email'],
                password=data['password'],
            )
            db.session.add(new_patient)
            db.session.commit()
            return {'message': 'Patient added successfully', 'pid': new_patient.pid}          
        except Exception as e:
            db.session.rollback()
            print("Error adding patient:", e)
            return {'message': 'Error adding patient'}, 500
    def delete(self, pid):
        try:
            patient = Patient.query.get(pid)
            if not patient:
                return {'message': 'Patient not found'}, 404
            db.session.delete(patient)
            db.session.commit()
            return {'message': 'Patient deleted successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error deleting patient:", e)
            return {'message': 'Error deleting patient'}, 500
class appointmentResource(Resource):
    def get(self , aid=None):
        if aid==None:
            try:
                appointments = Appointment.query.options(
                joinedload(Appointment.doctor),
                joinedload(Appointment.patient),
                joinedload(Appointment.slot)
                ).all()

                output = []
                for appointment in appointments:
                    app_data = {
                        'id': appointment.aid,
                        'doctor': appointment.doctor.name,
                        'patient': appointment.patient.name,
                        'pid': appointment.pid,
                        'dept': appointment.doctor.department_info.name,
                        'date': appointment.slot.date.strftime('%Y-%m-%d'),
                        'time': appointment.slot.time.strftime('%H:%M'),
                        'status': appointment.status
                    }
                    output.append(app_data)
                return output
            except Exception as e:  
                print("Error fetching appointments:", e)
                return {'message': 'Error fetching appointments'}, 500
        else:
            try:
                appointment = Appointment.query.options(
                    joinedload(Appointment.doctor),
                    joinedload(Appointment.patient),
                    joinedload(Appointment.slot)
                ).filter_by(aid=aid).first()

                if not appointment:
                    return {'message': 'Appointment not found'}, 404

                app_data = {
                    'id': appointment.aid,
                    'doctor': appointment.doctor.name,
                    'did': appointment.did,
                    'patient': appointment.patient.name,
                    'pid': appointment.pid,
                    'dept': appointment.doctor.department_info.name,
                    'date': appointment.slot.date.strftime('%Y-%m-%d'),
                    'time': appointment.slot.time.strftime('%H:%M'),
                    'status': appointment.status
                }
                return app_data
            except Exception as e:  
                print("Error fetching appointment:", e)
                return {'message': 'Error fetching appointment'}, 500
    def post(self,did):
        try:
            data=request.get_json()
            print("Appointment data received:", data)

            slot = Slot.query.filter_by(did=did, date=date.fromisoformat(data['date']), time=data['time']).first()
            if not slot or slot.status == 'Available':
                new_slot = Slot(
                    did=data['did'],
                    date=date.fromisoformat(data['date']),
                    time=time.fromisoformat(data['time']),
                    status='Booked'
                )
                db.session.add(new_slot)    
                db.session.flush()  # To get the sid of the new slot
                slot_id = new_slot.sid

                new_appointment = Appointment(
                    did=data['did'],
                    pid=did,
                    sid=slot_id,
                    status='upcoming',
                )
                db.session.add(new_appointment)
                db.session.commit()
                redisclient.delete(f"patient_{did}")
                redisclient.delete(f'appointments_doctor_{data['did']}') 
                return {'message': 'Appointment booked successfully', 'aid': new_appointment.aid}
            
            
            else:
                return {'message': 'Slot is not available'}, 400

        except Exception as e:
            print("Error parsing appointment data:", e)
            return {'message': 'Error parsing appointment data'}, 400
        
    def put(self, did):
        try:
            appointment = Appointment.query.get(did)
            if not appointment:
                return {'message': 'Appointment not found'}, 404

            data = request.get_json()
            print("Update data received:", data)
            appointment.status = data.get('status', appointment.status)

            db.session.commit()
            redisclient.delete(f"patient_{appointment.pid}")
            redisclient.delete(f'appointments_doctor_{appointment.did}') 
            return {'message': 'Appointment updated successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error updating appointment:", e)
            return {'message': 'Error updating appointment'}, 500   

        
    def delete(self, did):
        try:
            appointment = Appointment.query.get(did)
            if not appointment:
                return {'message': 'Appointment not found'}, 404
            slot = Slot.query.get(appointment.sid)
            if slot:
                db.session.delete(slot)
            db.session.delete(appointment)
            db.session.commit()
            redisclient.delete(f"patient_{appointment.pid}")
            redisclient.delete(f'appointments_doctor_{appointment.did}') 
            return {'message': 'Appointment deleted successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error deleting appointment:", e)
            return {'message': 'Error deleting appointment'}, 500
class AppointmentbyDoctorResource(Resource):
    def get(self,did):
        try: 


            cache_key = f"appointments_doctor_{did}"
            cached_data = redisclient.get(cache_key)
            if cached_data:     
                print("Returning cached data for doctor appointments")
                print(eval(cached_data))
                return jsonify(eval(cached_data))
            else:         
                appointments = Appointment.query.filter_by(did=did).all()
                output = []
                for appointment in appointments:
                    app_data = {
                        'id': appointment.aid,
                        'pid': appointment.pid,
                        'patient': appointment.patient.name,
                        'date': appointment.slot.date.strftime('%Y-%m-%d'),
                        'time': appointment.slot.time.strftime('%H:%M'),
                        'status': appointment.status
                    }
                    
                    output.append(app_data)
                redisclient.set(cache_key, str(output), ex=300)
                return output
        except Exception as e:  
            print("Error fetching appointments for doctor:", e)
            return {'message': 'Error fetching appointments for doctor'}, 500


class PatientHistoryResource(Resource):
    def get(self,appid):
        try:
            history = PatientHistory.query.filter_by(aid=appid).first()
            if not history:
                return {'message': 'Patient history not found'}, 404
            hist_data = {
                'history_id': history.phid,
                'appointment_id': history.aid,
                'doctor_id': history.did,
                'doctor_name': history.doctor.name,
                'patient_name': history.patient.name,
                'patient_id': history.pid,
                'diagnosis': history.diagnosis,
                'treatment': history.treatment,
                'notes': history.notes,
                'date': history.appointment.slot.date.strftime('%Y-%m-%d'),
            }
            return hist_data
        except Exception as e:
            print("Error fetching patient history by appointment:", e)
            return {'message': 'Error fetching patient history by appointment'}, 500
    def post(self):
        try:
            data = request.get_json()
            new_history = PatientHistory(
                pid=data['pid'],
                did=data['did'],
                aid=data['aid'],
                diagnosis=data['diagnosis'],
                treatment=data['treatment'],
                notes=data.get('notes', '')
            )
            db.session.add(new_history)
            db.session.commit()
            return {'message': 'Patient history added successfully', 'phid': new_history.phid}
        except Exception as e:
            db.session.rollback()
            print("Error adding patient history:", e)
            return {'message': 'Error adding patient history'}, 500
        
class PatientHistoryByPatientResource(Resource):
    def get(self, pid):
        try:
            histories = PatientHistory.query.filter_by(pid=pid).all()
            output = []
            for history in histories:
                hist_data = {
                    'history_id': history.phid,
                    'appointment_id': history.aid,
                    'doctor_id': history.did,
                    'doctor_name': history.doctor.name,
                    'patient_name': history.patient.name,
                    'patient_id': history.pid,
                    'diagnosis': history.diagnosis,
                    'treatment': history.treatment,
                    'notes': history.notes,
                    'date': history.appointment.slot.date.strftime('%Y-%m-%d'),
                }
                output.append(hist_data)
            return output
        except Exception as e:
            print("Error fetching patient history:", e)
            return {'message': 'Error fetching patient history'}, 500
            
class patientselectResource(Resource):
    def get(self, did):
        try:
            patient = patient = db.session.query(Patient).join(Appointment).filter(
                Appointment.pid == Patient.pid,
                Appointment.did == did
            ).distinct().all()
            output = []
            for patient in patient:
                output.append({
                'id': patient.pid,
                'name': patient.name,
                'age': patient.dob.strftime('%Y-%m-%d'),
                'phone': patient.phone_number,
                'email': patient.email
                })
            return output
        except Exception as e:
            print("Error fetching patients for doctor:", e)
            return {'message': 'Error fetching patients for doctor'}, 500
        

class slotResource(Resource):
    def get(self,did):
        try:
            today = date.today()
            end_date = today + timedelta(days=2)

            slots = Slot.query.filter(
                Slot.did == did,
                Slot.date.between(today, end_date)
            ).all()
            output = []
            for slot in slots:
                slot_data = {
                    'id': slot.sid,
                    'date': slot.date.strftime('%Y-%m-%d'),
                    'time': slot.time.strftime('%H:%M'),
                    'status': slot.status
                }
                output.append(slot_data)
            return output
        except Exception as e:
            print("Error fetching slots for doctor:", e)
            return {'message': 'Error fetching slots for doctor'}, 500
    
    def put(self, did):
        try:
            data = request.get_json()
            slot = Slot.query.filter_by(did=did, date=date.fromisoformat(data['date']), time=data['time']).first()
            if not slot:
                return {'message': 'Slot not found'}, 404
            slot.status = data.get('status', slot.status)
            db.session.commit()
            return {'message': 'Slot updated successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error updating slot:", e)
            return {'message': 'Error updating slot'}, 500
    def post(self, did):
        try:
            data = request.get_json()

            for entry in data:
                slot_date = date.fromisoformat(entry['date'])
                slot_time = time.fromisoformat(entry['time'])
                new_status = entry.get('status', 'available')

                # Check if slot already exists
                existing_slot = Slot.query.filter_by(
                    did=did,
                    date=slot_date,
                    time=slot_time
                ).first()

                if existing_slot:
                    if new_status =="Available":
                        db.session.delete(existing_slot)
                    else:
                        existing_slot.status = new_status
                else:
                   
                    new_slot = Slot(
                        did=did,
                        date=slot_date,
                        time=slot_time,
                        status=new_status
                    )
                    db.session.add(new_slot)
            print("slots added/updated successfully")
            db.session.commit()

            return {'message': 'Slots processed successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error adding slot:", e)
            return {'message': 'Error adding slot'}, 500




class slotconfigResource(Resource):
    def get(self,did):
        try:
            config = SlotConfig.query.filter_by(did=did).first()
            if not config:
            
                config = SlotConfig(
                    did=did,
                    start_time=datetime.time(9, 0),
                    end_time=datetime.time(17, 0),
                    interval_minutes=60

                )
                db.session.add(config)
                db.session.commit()

            config_data = {
                'id': config.id,
                'start_time': config.start_time.strftime('%H:%M'),
                'end_time': config.end_time.strftime('%H:%M'),
                'interval_minutes': config.interval_minutes
            }
            return config_data
        except Exception as e:
            print("Error fetching slot configuration for doctor:", e)
            return {'message': 'Error fetching slot configuration for doctor'}, 500
        


class profileimageResource(Resource):
    def get(self, did=None , deptid =None):
        if (did):
            try:
                doctor = Doctor.query.get(did)
                if not doctor or not doctor.profile_image:
                    return {'message': 'Profile image not found'}, 404

                return send_file(
                    io.BytesIO(doctor.profile_image),
                    mimetype=doctor.image_mimetype,
                    as_attachment=False,
                    download_name=f'doctor_{did}_profile_image'
                )
            except Exception as e:
                print("Error fetching profile image:", e)
                return {'message': 'Error fetching profile image'}, 500
        elif(deptid):
            try:
                doctors = Doctor.query.filter_by(department=deptid).all()
                output = []
                for doctor in doctors:
                    if doctor.profile_image:
                        image_data = {
                            'id': doctor.did,
                            'name': doctor.name,
                            'profile_image': doctor.profile_image.decode('latin1'),
                            'image_mimetype': doctor.image_mimetype
                        }
                        output.append(image_data)
                return jsonify(output)
            except Exception as e:
                print("Error fetching profile images by department:", e)
                return {'message': 'Error fetching profile images by department'}, 500
        else:
            try:
                doctors= Doctor.query.all()
                output = []
                for doctor in doctors:
                    if doctor.profile_image:
                        image_data = {
                            'id': doctor.did,
                            'name': doctor.name,
                            'profile_image': doctor.profile_image.decode('latin1'),
                            'image_mimetype': doctor.image_mimetype
                        }
                        output.append(image_data)
                return jsonify(output)
            except Exception as e:
                print("Error fetching profile images:", e)
                return {'message': 'Error fetching profile images'}, 500
    def put(self, did):
        try:
            doctor = Doctor.query.get(did)
            if not doctor:
                return {'message': 'Doctor not found'}, 404

            if 'image' not in request.files:
                return {'message': 'No image file provided'}, 400

            image_file = request.files['image']
            doctor.profile_image = image_file.read()
            doctor.image_mimetype = image_file.mimetype

            db.session.commit()
            return {'message': 'Profile image updated successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error updating profile image:", e)
            return {'message': 'Error updating profile image'}, 500

class patientimageResource(Resource):
    def get(self, pid):
        try:
            patient = Patient.query.get(pid)
            if not patient or not patient.profile_image:
                return {'message': 'Profile image not found'}, 404

            return send_file(
                io.BytesIO(patient.profile_image),
                mimetype=patient.image_mimetype,
                as_attachment=False,
                download_name=f'patient_{pid}_profile_image'
            )
        except Exception as e:
            print("Error fetching profile image:", e)
            return {'message': 'Error fetching profile image'}, 500
    def put(self, pid):
        try:
            patient = Patient.query.get(pid)
            if not patient:
                return {'message': 'Patient not found'}, 404

            if 'image' not in request.files:
                return {'message': 'No image file provided'}, 400

            image_file = request.files['image']
            patient.profile_image = image_file.read()
            patient.image_mimetype = image_file.mimetype

            db.session.commit()
            return {'message': 'Profile image updated successfully'}
        except Exception as e:
            db.session.rollback()
            print("Error updating profile image:", e)
            return {'message': 'Error updating profile image'}, 500
    
class departmentResource(Resource):
    def get(self):
        try:
            departments = Departments.query.all()
            output = []
            for dept in departments:
                dept_data = {
                    'id': dept.dept_id,
                    'name': dept.name
                }
                output.append(dept_data)
            return jsonify(output)
        except Exception as e:
            print("Error fetching departments:", e)
            return {'message': 'Error fetching departments'}, 500

class loginResource(Resource):
    def post(self):
        try:
            print(request.get_json())
            data = request.get_json()

            

            if data['role'] == "patient":
                user = Patient.query.filter_by(email = data['email']).first()

                if user :
                    if user.password == data['password']:
                        return {"success": True,'message':"success" ,'userid':user.pid},200
                    return {'message':'wrong password'},500
                return {'message':'user not registered'},500
        

            elif data['role'] == "doctor":
                user = Doctor.query.filter_by(email = data['email']).first()

                if user :
                    if user.password == data['password']:
                        return {"success": True,'message':"success" , 'userid':user.did , 'username':user.name},200
                    return {'message':'wrong password'},500
                return {'message':'user not registered'},500
            elif data['role']=='admin':
                if data['password']=="password":
                    return {"success": True,'message':"success"},200
                return {'message':'wrong password'},500
            else:
                return {'message':'Wrong usertype'},500
        except Exception as e:
            return {'message':f'error: {e}'},500

        