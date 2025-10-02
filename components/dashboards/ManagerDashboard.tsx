
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import StatCard from '../ui/StatCard';
import { UserGroupIcon, CurrencyDollarIcon, BuildingOffice2Icon, CalendarDaysIcon } from '@heroicons/react/24/solid';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ManagerDashboard: React.FC = () => {
    const { patients, visits, clinics, revenues } = useApp();
    const today = new Date().toISOString().split('T')[0];

    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const dailyVisits = visits.filter(v => v.visit_date === today).length;
    
    // Data for chart: Revenue per clinic
    const revenueByClinic = clinics.map(clinic => {
        const clinicRevenue = revenues
            .filter(r => r.clinic_id === clinic.clinic_id)
            .reduce((sum, r) => sum + r.amount, 0);
        return { name: clinic.clinic_name, 'الإيرادات': clinicRevenue };
    });

    // Data for chart: Visits per day (last 7 days)
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

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="إجمالي الإيرادات" value={`${totalRevenue} ريال`} icon={CurrencyDollarIcon} color="bg-indigo-500" />
                <StatCard title="إجمالي المرضى" value={patients.length} icon={UserGroupIcon} color="bg-blue-500" />
                <StatCard title="عدد العيادات" value={clinics.length} icon={BuildingOffice2Icon} color="bg-purple-500" />
                <StatCard title="زيارات اليوم" value={dailyVisits} icon={CalendarDaysIcon} color="bg-green-500" />
            </div>

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
        </div>
    );
};

export default ManagerDashboard;
