
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { VisitStatus } from '../types';

const Visits: React.FC = () => {
    const { visits, patients, clinics } = useApp();

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

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">سجل الزيارات</h1>
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
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {visits.map(visit => (
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Visits;
