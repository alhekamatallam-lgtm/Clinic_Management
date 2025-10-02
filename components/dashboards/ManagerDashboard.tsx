import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import StatCard from '../ui/StatCard';
import { UserGroupIcon, CurrencyDollarIcon, BuildingOffice2Icon, CalendarDaysIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { VisitType, Patient } from '../../types';
import Modal from '../ui/Modal';

const ManagerDashboard: React.FC = () => {
    const { patients, visits, clinics, revenues, addPatient, addVisit } = useApp();
    const today = new Date().toISOString().split('T')[0];

    // Stats
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const dailyVisits = visits.filter(v => v.visit_date === today).length;
    
    // Chart Data
    const revenueByClinic = clinics.map(clinic => {
        const clinicRevenue = revenues
            .filter(r => r.clinic_id === clinic.clinic_id)
            .reduce((sum, r) => sum + r.amount, 0);
        return { name: clinic.clinic_name, 'الإيرادات': clinicRevenue };
    });

    const visitsByDay: {[key: string]: number} = {};
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        visitsByDay[dateString] = 0;
    }
    visits.forEach(visit => {
        if (visitsByDay[visit.visit_date] !== undefined) {
            visitsByDay[visit.visit_date]++;
        }
    });

    const dailyVisitData = Object.keys(visitsByDay).map(date => ({
        name: new Date(date).toLocaleDateString('ar-EG', { weekday: 'short' }),
        'الزيارات': visitsByDay[date],
    }));

    // --- Patient & Visit Management Logic (from Receptionist) ---
    const [isAddPatientModalOpen, setAddPatientModalOpen] = useState(false);
    const [isAddVisitModalOpen, setAddVisitModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [newPatient, setNewPatient] = useState<Omit<Patient, 'patient_id'>>({ name: '', dob: '', gender: 'ذكر', phone: '', address: '' });
    const [newVisit, setNewVisit] = useState({ patient_id: 0, clinic_id: clinics[0]?.clinic_id || 0, visit_type: VisitType.FirstVisit });

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm)
    );

    const handleAddPatient = (e: React.FormEvent) => {
        e.preventDefault();
        addPatient(newPatient);
        setNewPatient({ name: '', dob: '', gender: 'ذكر', phone: '', address: '' });
        setAddPatientModalOpen(false);
    };

    const handleAddVisit = (e: React.FormEvent) => {
        e.preventDefault();
        addVisit(newVisit);
        setAddVisitModalOpen(false);
        setSelectedPatient(null);
    }
    
    const openAddVisitModal = (patient: Patient) => {
        setSelectedPatient(patient);
        setNewVisit({ ...newVisit, patient_id: patient.patient_id });
        setAddVisitModalOpen(true);
    };

    return (
        <div className="space-y-8">
            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="إجمالي الإيرادات" value={`${totalRevenue} ريال`} icon={CurrencyDollarIcon} color="bg-indigo-500" />
                <StatCard title="إجمالي المرضى" value={patients.length} icon={UserGroupIcon} color="bg-blue-500" />
                <StatCard title="عدد العيادات" value={clinics.length} icon={BuildingOffice2Icon} color="bg-purple-500" />
                <StatCard title="زيارات اليوم" value={dailyVisits} icon={CalendarDaysIcon} color="bg-green-500" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-gray-700 mb-4">الإيرادات حسب العيادة</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueByClinic}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `${value} ريال`} />
                            <Legend />
                            <Bar dataKey="الإيرادات" fill="#14b8a6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-gray-700 mb-4">عدد الزيارات (آخر 7 أيام)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyVisitData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="الزيارات" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Patient & Visit Management Section */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700">إدارة المرضى والزيارات</h2>
                    <button onClick={() => setAddPatientModalOpen(true)} className="flex items-center bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors">
                        <PlusIcon className="h-5 w-5 ml-2"/>
                        إضافة مريض جديد
                    </button>
                </div>
                <div className="relative mb-4">
                     <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </span>
                    <input
                        type="text"
                        placeholder="ابحث بالاسم أو رقم الهاتف..."
                        className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-sm font-semibold tracking-wide">الاسم</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">رقم الهاتف</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPatients.map(patient => (
                                <tr key={patient.patient_id} className="border-b">
                                    <td className="p-3">{patient.name}</td>
                                    <td className="p-3">{patient.phone}</td>
                                    <td className="p-3">
                                        <button onClick={() => openAddVisitModal(patient)} className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">
                                            إضافة للزيارات
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <Modal title="إضافة مريض جديد" isOpen={isAddPatientModalOpen} onClose={() => setAddPatientModalOpen(false)}>
                <form onSubmit={handleAddPatient} className="space-y-4">
                    <input type="text" placeholder="الاسم الكامل" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="w-full p-2 border rounded" required />
                    <input type="date" placeholder="تاريخ الميلاد" value={newPatient.dob} onChange={e => setNewPatient({...newPatient, dob: e.target.value})} className="w-full p-2 border rounded" required />
                    <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value as 'ذكر' | 'أنثى'})} className="w-full p-2 border rounded">
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                    </select>
                    <input type="tel" placeholder="رقم الهاتف" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} className="w-full p-2 border rounded" required />
                    <input type="text" placeholder="العنوان" value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} className="w-full p-2 border rounded" />
                    <button type="submit" className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600">إضافة</button>
                </form>
            </Modal>
            
            <Modal title={`إضافة زيارة للمريض: ${selectedPatient?.name}`} isOpen={isAddVisitModalOpen} onClose={() => setAddVisitModalOpen(false)}>
                <form onSubmit={handleAddVisit} className="space-y-4">
                    <div>
                        <label className="block mb-1">العيادة</label>
                        <select value={newVisit.clinic_id} onChange={e => setNewVisit({...newVisit, clinic_id: Number(e.target.value)})} className="w-full p-2 border rounded">
                           {clinics.map(c => <option key={c.clinic_id} value={c.clinic_id}>{c.clinic_name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block mb-1">نوع الزيارة</label>
                        <select value={newVisit.visit_type} onChange={e => setNewVisit({...newVisit, visit_type: e.target.value as VisitType})} className="w-full p-2 border rounded">
                           <option value={VisitType.FirstVisit}>كشف جديد</option>
                           <option value={VisitType.FollowUp}>متابعة</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600">تأكيد الإضافة</button>
                </form>
            </Modal>
        </div>
    );
};

export default ManagerDashboard;