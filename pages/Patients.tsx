import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';

const Patients: React.FC = () => {
    const { patients } = useApp();
    const [searchTerm, setSearchTerm] = useState('');

    const calculateAge = (dob: string): number => {
        if (!dob) return 0;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const filteredPatients = useMemo(() => {
        if (!searchTerm) return patients;
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.phone.includes(searchTerm) ||
            p.patient_id.toString().includes(searchTerm)
        );
    }, [patients, searchTerm]);


    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">قائمة المرضى</h1>

            <div className="relative mb-6">
                 <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    type="text"
                    placeholder="ابحث بالاسم, رقم الهاتف, أو الرقم التعريفي..."
                    className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-sm font-semibold tracking-wide">الرقم التعريفي</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">الاسم</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">العمر</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">الجنس</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">الهاتف</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">العنوان</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredPatients.map(patient => (
                            <tr key={patient.patient_id} className="hover:bg-gray-50">
                                <td className="p-3 text-sm text-gray-700">{patient.patient_id}</td>
                                <td className="p-3 text-sm text-gray-700 font-medium">{patient.name}</td>
                                <td className="p-3 text-sm text-gray-700">{calculateAge(patient.dob)} سنة</td>
                                <td className="p-3 text-sm text-gray-700">{patient.gender}</td>
                                <td className="p-3 text-sm text-gray-700">{patient.phone}</td>
                                <td className="p-3 text-sm text-gray-700">{patient.address}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Patients;