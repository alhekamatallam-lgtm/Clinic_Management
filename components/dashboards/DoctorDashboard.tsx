import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { VisitStatus, Diagnosis } from '../../types';
import Modal from '../ui/Modal';
import StatCard from '../ui/StatCard';
import { UserGroupIcon, CheckCircleIcon, CurrencyDollarIcon, PencilSquareIcon } from '@heroicons/react/24/solid';

const DoctorDashboard: React.FC = () => {
    const { user, visits, patients, diagnoses, addDiagnosis, updateVisitStatus, revenues } = useApp();
    const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
    const [isDiagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
    const [newDiagnosis, setNewDiagnosis] = useState<Omit<Diagnosis, 'diagnosis_id'>>({
        visit_id: 0,
        doctor: user?.username || '',
        diagnosis: '',
        prescription: '',
        labs_needed: [],
        notes: ''
    });

    if (!user || user.role !== 'doctor' || !user.clinic) {
        return <div> وصول غير مصرح به </div>;
    }

    const today = new Date().toISOString().split('T')[0];
    const doctorClinicId = user.clinic;

    const myVisitsToday = visits.filter(v => Number(v.clinic_id) === doctorClinicId && v.visit_date === today)
        .sort((a,b) => a.queue_number - b.queue_number);

    const completedVisitsCount = myVisitsToday.filter(v => v.status === VisitStatus.Completed).length;
    
    const todaysRevenue = revenues
        .filter(r => Number(r.clinic_id) === doctorClinicId && r.date === today)
        .reduce((sum, r) => sum + r.amount, 0);

    const openDiagnosisModal = (visitId: number) => {
        setSelectedVisitId(visitId);
        setNewDiagnosis({
            visit_id: visitId,
            doctor: user?.username || '',
            diagnosis: '',
            prescription: '',
            labs_needed: [],
            notes: ''
        });
        updateVisitStatus(visitId, VisitStatus.InProgress);
        setDiagnosisModalOpen(true);
    };

    const handleAddDiagnosis = (e: React.FormEvent) => {
        e.preventDefault();
        addDiagnosis(newDiagnosis);
        setDiagnosisModalOpen(false);
        setSelectedVisitId(null);
    };

    const getPatientName = (patientId: number) => {
        return patients.find(p => p.patient_id === patientId)?.name || 'غير معروف';
    };
    
    const getStatusColor = (status: VisitStatus) => {
        switch (status) {
            case VisitStatus.Waiting: return 'bg-yellow-200 text-yellow-800';
            case VisitStatus.InProgress: return 'bg-blue-200 text-blue-800';
            case VisitStatus.Completed: return 'bg-green-200 text-green-800';
            case VisitStatus.Canceled: return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="مرضى اليوم" value={myVisitsToday.length} icon={UserGroupIcon} color="bg-blue-500" />
                <StatCard title="حالات مكتملة" value={completedVisitsCount} icon={CheckCircleIcon} color="bg-green-500" />
                <StatCard title="إيرادات اليوم" value={`${todaysRevenue} ريال`} icon={CurrencyDollarIcon} color="bg-indigo-500" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold text-gray-700 mb-4">قائمة مرضى اليوم</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 text-sm font-semibold tracking-wide">#</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">اسم المريض</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">الحالة</th>
                                <th className="p-3 text-sm font-semibold tracking-wide">إجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myVisitsToday.map(visit => (
                                <tr key={visit.visit_id} className="border-b">
                                    <td className="p-3">{visit.queue_number}</td>
                                    <td className="p-3 font-medium">{getPatientName(visit.patient_id)}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(visit.status)}`}>
                                            {visit.status}
                                        </span>
                                    </td>
                                    <td className="p-3">
                                        <button 
                                            onClick={() => openDiagnosisModal(visit.visit_id)} 
                                            className="bg-teal-500 text-white px-3 py-1 rounded-md text-sm hover:bg-teal-600 disabled:bg-gray-400 flex items-center"
                                            disabled={visit.status === VisitStatus.Completed}
                                        >
                                          <PencilSquareIcon className="h-4 w-4 ml-1" />
                                          {diagnoses.find(d => d.visit_id === visit.visit_id) ? 'عرض التشخيص' : 'تسجيل التشخيص'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal title="تسجيل التشخيص" isOpen={isDiagnosisModalOpen} onClose={() => setDiagnosisModalOpen(false)}>
                 <form onSubmit={handleAddDiagnosis} className="space-y-4">
                    <textarea placeholder="التشخيص" value={newDiagnosis.diagnosis} onChange={e => setNewDiagnosis({...newDiagnosis, diagnosis: e.target.value})} className="w-full p-2 border rounded" rows={3} required />
                    <textarea placeholder="الوصفة الطبية" value={newDiagnosis.prescription} onChange={e => setNewDiagnosis({...newDiagnosis, prescription: e.target.value})} className="w-full p-2 border rounded" rows={3} required />
                    <input type="text" placeholder="التحاليل والأشعة المطلوبة (افصل بينها بفاصلة)" onChange={e => setNewDiagnosis({...newDiagnosis, labs_needed: e.target.value.split(',')})} className="w-full p-2 border rounded" />
                    <textarea placeholder="ملاحظات إضافية" value={newDiagnosis.notes} onChange={e => setNewDiagnosis({...newDiagnosis, notes: e.target.value})} className="w-full p-2 border rounded" rows={2} />
                    <button type="submit" className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600">حفظ التشخيص</button>
                </form>
            </Modal>
        </div>
    );
};

export default DoctorDashboard;