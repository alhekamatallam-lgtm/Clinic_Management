
import React from 'react';
import { useApp } from '../contexts/AppContext';

const Users: React.FC = () => {
    const { users } = useApp();

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">إدارة المستخدمين</h1>
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-sm font-semibold tracking-wide">الرقم التعريفي</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">اسم المستخدم</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">الصلاحية</th>
                            <th className="p-3 text-sm font-semibold tracking-wide">العيادة المخصصة</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.user_id} className="hover:bg-gray-50">
                                <td className="p-3 text-sm text-gray-700">{user.user_id}</td>
                                <td className="p-3 text-sm text-gray-700">{user.username}</td>
                                <td className="p-3 text-sm text-gray-700">{user.role}</td>
                                <td className="p-3 text-sm text-gray-700">{user.clinic || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
