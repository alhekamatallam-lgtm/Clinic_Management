import React, { useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { Role } from '../types';

const Diagnosis: React.FC = () => {
    const { user, diagnoses, visits, patients } = useApp();

    const getVisitInfo = (visitId: number) => {
        const visit = visits.find(v => v.visit_id === visitId);
        if (!visit) return { patientName: 'N/A', visitDate: 'N/A', visit: null };
        const patient = patients.find(p => p.patient_id === visit.patient_id);
        return {
            patientName: patient?.name || 'N/A',
            visitDate: visit.visit_date,
            visit: visit,
        };
    };

    const filteredDiagnoses = useMemo(() => {
        if (user?.role === Role.Doctor && user.clinic) {
            const doctorClinicId = user.clinic;
            return diagnoses.filter(diag => {
                const { visit } = getVisitInfo(diag.visit_id);
                return visit?.clinic_id === doctorClinicId;
            });
        }
        // This page is only accessible by Doctors via the sidebar.
        // If a Manager were to get access, this would need to change.
        return [];
    }, [user, diagnoses, visits]);

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">سجل التشخيصات</h1>
            <div className="space-y-4">
                {filteredDiagnoses.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد تشخيصات لعرضها.</p>
                ) : (
                    filteredDiagnoses.map(diag => {
                        const { patientName, visitDate } = getVisitInfo(diag.visit_id);
                        return (
                            <div key={diag.diagnosis_id} className="border p-4 rounded-lg bg-gray-50 shadow-sm">
                                <div className="flex justify-between items-center mb-3 pb-2 border-b">
                                    <h3 className="font-bold text-lg text-teal-700">{patientName}</h3>
                                    <span className="text-sm text-gray-500">{visitDate}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><span className="font-semibold text-gray-600">الطبيب:</span> {diag.doctor}</p>
                                    <p><span className="font-semibold text-gray-600">التشخيص:</span> {diag.diagnosis}</p>
                                    <p className="md:col-span-2"><span className="font-semibold text-gray-600">الوصفة:</span> {diag.prescription}</p>
                                    {diag.labs_needed && diag.labs_needed.length > 0 && diag.labs_needed[0] !== '' && (
                                        <p className="md:col-span-2"><span className="font-semibold text-gray-600">المطلوب:</span> {diag.labs_needed.join(', ')}</p>
                                    )}
                                    {diag.notes && <p className="md:col-span-2"><span className="font-semibold text-gray-600">ملاحظات:</span> {diag.notes}</p>}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Diagnosis;
