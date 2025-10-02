import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { PlusIcon, KeyIcon } from '@heroicons/react/24/solid';
import Modal from '../components/ui/Modal';
import { Role, User } from '../types';

const Users: React.FC = () => {
    const { users, clinics, addUser, updateUserPassword } = useApp();
    
    // State for adding a new user
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newUser, setNewUser] = useState<Omit<User, 'user_id' | 'password'> & { password?: string }>({
        username: '',
        password: '',
        role: Role.Reception,
        clinic: undefined,
    });

    // State for changing password
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewUser(prev => {
            const updatedUser = { ...prev, [name]: value };
            if (name === 'role' && value !== Role.Doctor) {
                updatedUser.clinic = undefined;
            }
            if (name === 'clinic') {
                 updatedUser.clinic = Number(value);
            }
            return updatedUser;
        });
    };

    const handleAddUserSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUser.username || !newUser.password) {
            alert("Please fill in all required fields.");
            return;
        }
        addUser(newUser as Omit<User, 'user_id'>);
        setIsAddModalOpen(false);
        setNewUser({ username: '', password: '', role: Role.Reception, clinic: undefined });
    };

    const openPasswordModal = (user: User) => {
        setSelectedUser(user);
        setNewPassword('');
        setIsPasswordModalOpen(true);
    };

    const handlePasswordChangeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUser && newPassword) {
            updateUserPassword(selectedUser.user_id, newPassword);
            setIsPasswordModalOpen(false);
            setSelectedUser(null);
        } else {
            alert("يرجى إدخال كلمة مرور جديدة.");
        }
    };


    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">إدارة المستخدمين</h1>
                <button
                    onClick={() => setIsAddModalOpen(true)}
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
                            <th className="p-3 text-sm font-semibold tracking-wide">إجراء</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.user_id} className="hover:bg-gray-50">
                                <td className="p-3 text-sm text-gray-700">{user.user_id}</td>
                                <td className="p-3 text-sm text-gray-700">{user.username}</td>
                                <td className="p-3 text-sm text-gray-700">{user.role}</td>
                                <td className="p-3 text-sm text-gray-700">{user.clinic ? (clinics.find(c => c.clinic_id === user.clinic)?.clinic_name || user.clinic) : 'N/A'}</td>
                                <td className="p-3 text-sm">
                                    <button 
                                        onClick={() => openPasswordModal(user)}
                                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <KeyIcon className="h-4 w-4 ml-1" />
                                        تغيير كلمة المرور
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add User Modal */}
            <Modal title="إضافة مستخدم جديد" isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                <form onSubmit={handleAddUserSubmit} className="space-y-4">
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

            {/* Change Password Modal */}
            <Modal title={`تغيير كلمة مرور: ${selectedUser?.username}`} isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)}>
                <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="new-password">كلمة المرور الجديدة</label>
                        <input 
                            type="password" 
                            id="new-password"
                            name="newPassword" 
                            placeholder="********" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            className="w-full p-2 border rounded mt-1" 
                            required 
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                        حفظ كلمة المرور
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default Users;