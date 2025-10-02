
import React from 'react';
import { useApp } from '../contexts/AppContext';

const Reports: React.FC = () => {
    const { revenues, clinics } = useApp();
    
    const getClinicName = (id: number) => clinics.find(c => c.clinic_id === id)?.clinic_name || 'N/A';

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">تقارير الإيرادات</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-sm font-semibold tracking-wide">#</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">اسم المريض</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">العيادة</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">المبلغ</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">التاريخ</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">نوع الزيارة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {revenues.map(revenue => (
                            <tr key={revenue.revenue_id} className="hover:bg-gray-50">
                                <td className="p-3 text-sm text-gray-700">{revenue.revenue_id}</td>
                                <td className="p-3 text-sm text-gray-700">{revenue.patient_name}</td>
                                <td className="p-3 text-sm text-gray-700">{getClinicName(revenue.clinic_id)}</td>
                                <td className="p-3 text-sm text-gray-700 font-bold">{revenue.amount} ريال</td>
                                <td className="p-3 text-sm text-gray-700">{revenue.date}</td>
                                <td className="p-3 text-sm text-gray-700">{revenue.type}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reports;
