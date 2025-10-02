import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { VisitStatus, Role, Diagnosis } from '../types';
import { MagnifyingGlassIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import Modal from '../components/ui/Modal';

const Visits: React.FC = () => {
    const { user, visits, patients, clinics, diagnoses, addDiagnosis, updateVisitStatus } = useApp();
    
    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClinic, setSelectedClinic] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    
    // State for diagnosis modal
    const [isDiagnosisModalOpen, setDiagnosisModalOpen] = useState(false);
    const [newDiagnosis, setNewDiagnosis] = useState<Omit<Diagnosis, 'diagnosis_id'>>({
        visit_id: 0,
        doctor: user?.username || '',
        diagnosis: '',
        prescription: '',
        labs_needed: [],
        notes: ''
    });

    const openDiagnosisModal = (visitId: number) => {
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
    };

    const getPatientName = (id: number) => patients.find(p => p.patient_id === id)?.name || 'N/A';
    const getClinicName = (id: number) => clinics.find(c => c.clinic_id === id)?.clinic_name || 'N/A';

    const getStatusColor = (status: VisitStatus) => {
        switch (status) {
            case VisitStatus.Waiting: return 'bg-yellow-200 text-yellow-800';
            case VisitStatus.InProgress: return 'bg-blue-200 text-blue-800';
            case VisitStatus.Completed: return 'bg-green-200 text-green-800';
            case VisitStatus.Canceled: return 'bg-red-200 text-red-800';
            default: return 'bg-gray-200 text-gray-800';
        }
    }

    const filteredVisits = useMemo(() => {
        let tempVisits = visits;
        
        // Doctor's default filter
        if (user?.role === Role.Doctor && user.clinic) {
            tempVisits = tempVisits.filter(visit => visit.clinic_id === user.clinic);
        }

        // Search by patient name
        if (searchTerm) {
            const lowercasedTerm = searchTerm.toLowerCase();
            const matchingPatientIds = patients
                .filter(p => p.name.toLowerCase().includes(lowercasedTerm))
                .map(p => p.patient_id);
            tempVisits = tempVisits.filter(v => matchingPatientIds.includes(v.patient_id));
        }

        // Filter by clinic (for manager)
        if (selectedClinic && user?.role === Role.Manager) {
            tempVisits = tempVisits.filter(v => v.clinic_id === parseInt(selectedClinic, 10));
        }

        // Filter by status
        if (selectedStatus) {
            tempVisits = tempVisits.filter(v => v.status === selectedStatus);
        }
        
        // Filter by date
        if (selectedDate) {
             tempVisits = tempVisits.filter(v => v.visit_date === selectedDate);
        }

        return tempVisits.sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime() || a.visit_id - b.visit_id);
    }, [user, visits, patients, searchTerm, selectedClinic, selectedStatus, selectedDate]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">سجل الزيارات</h1>

            {/* Filter and Search Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="lg:col-span-1">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">بحث باسم المريض</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            id="search"
                            placeholder="ابحث..."
                            className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                    <input type="date" id="date-filter" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg"/>
                </div>

                <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select id="status-filter" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                        <option value="">الكل</option>
                        {Object.values(VisitStatus).map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                </div>
                
                {user?.role === Role.Manager && (
                     <div>
                        <label htmlFor="clinic-filter" className="block text-sm font-medium text-gray-700 mb-1">العيادة</label>
                        <select id="clinic-filter" value={selectedClinic} onChange={e => setSelectedClinic(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                            <option value="">الكل</option>
                            {clinics.map(c => <option key={c.clinic_id} value={c.clinic_id}>{c.clinic_name}</option>)}
                        </select>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-sm font-semibold tracking-wide">#</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">اسم المريض</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">العيادة</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">التاريخ</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">رقم الانتظار</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">الحالة</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">نوع الزيارة</th>
                             {user?.role === Role.Doctor && (
                                <th className="p-3 text-sm font-semibold tracking-wide">إجراء</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredVisits.map(visit => (
                            <tr key={visit.visit_id} className="hover:bg-gray-50">
                                <td className="p-3 text-sm text-gray-700">{visit.visit_id}</td>
                                <td className="p-3 text-sm text-gray-700 font-medium">{getPatientName(visit.patient_id)}</td>
                                <td className="p-3 text-sm text-gray-700">{getClinicName(visit.clinic_id)}</td>
                                <td className="p-3 text-sm text-gray-700">{visit.visit_date}</td>
                                <td className="p-3 text-sm text-gray-700">{visit.queue_number}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(visit.status)}`}>
                                      {visit.status}
                                  </span>
                                </td>
                                <td className="p-3 text-sm text-gray-700">{visit.visit_type}</td>
                                {user?.role === Role.Doctor && (
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
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
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

export default Visits;