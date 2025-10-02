
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { PlusIcon } from '@heroicons/react/24/solid';
import Modal from '../components/ui/Modal';
import { Role, User } from '../types';

const Users: React.FC = () => {
    const { users, clinics, addUser } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUser, setNewUser] = useState<Omit<User, 'user_id' | 'password'> & { password?: string }>({
        username: '',
        password: '',
        role: Role.Reception,
        clinic: undefined,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewUser(prev => {
            const updatedUser = { ...prev, [name]: value };
            // If role is not doctor, clear clinic selection
            if (name === 'role' && value !== Role.Doctor) {
                updatedUser.clinic = undefined;
            }
            if (name === 'clinic') {
                 updatedUser.clinic = Number(value);
            }
            return updatedUser;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            alert("Please fill in all required fields.");
            return;
        }
        addUser(newUser as Omit<User, 'user_id'>);
        setIsModalOpen(false);
        setNewUser({ username: '', password: '', role: Role.Reception, clinic: undefined });
    };


    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                >
                    <PlusIcon className="h-5 w-5 ml-2" />
                    إضافة مستخدم جديد
                </button>
            </div>
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
            <Modal title="إضافة مستخدم جديد" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="username" placeholder="اسم المستخدم" value={newUser.username} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                    <input type="password" name="password" placeholder="كلمة المرور" value={newUser.password} onChange={handleInputChange} className="w-full p-2 border rounded" required />
                    <select name="role" value={newUser.role} onChange={handleInputChange} className="w-full p-2 border rounded">
                        <option value={Role.Reception}>موظف استقبال</option>
                        <option value={Role.Doctor}>طبيب</option>
                        <option value={Role.Manager}>مدير</option>
                    </select>
                    {newUser.role === Role.Doctor && (
                        <select name="clinic" value={newUser.clinic || ''} onChange={handleInputChange} className="w-full p-2 border rounded" required>
                            <option value="" disabled>اختر عيادة</option>
                            {clinics.map(c => <option key={c.clinic_id} value={c.clinic_id}>{c.clinic_name}</option>)}
                        </select>
                    )}
                    <button type="submit" className="w-full bg-teal-500 text-white p-2 rounded hover:bg-teal-600">حفظ المستخدم</button>
                </form>
            </Modal>
        </div>
    );
};

export default Users;