export type AppointmentType = 'upcoming' | 'history';

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  location: string;
  iconName: string;
  type: AppointmentType;
}