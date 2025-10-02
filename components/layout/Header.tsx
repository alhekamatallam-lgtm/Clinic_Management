
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Role } from '../../types';

const Header: React.FC = () => {
  const { user, logout } = useApp();
  
  const getRoleName = (role: Role) => {
    switch(role) {
        case Role.Manager: return 'مدير';
        case Role.Doctor: return 'طبيب';
        case Role.Reception: return 'موظف استقبال';
        default: return 'مستخدم';
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-gray-200 shadow-sm">
        <div>
            {/* Can add breadcrumbs or page title here */}
            <h1 className="text-xl font-semibold text-gray-700">مرحباً, {user?.username}</h1>
        </div>
      <div className="flex items-center">
        <div className="text-right ml-4">
          <p className="text-sm font-medium text-gray-800">{user?.username}</p>
          <p className="text-xs text-gray-500">{getRoleName(user!.role)}</p>
        </div>
        <UserCircleIcon className="h-10 w-10 text-gray-500" />
        <button
          onClick={logout}
          className="mr-6 flex items-center text-gray-500 hover:text-red-600 focus:outline-none transition-colors"
          title="تسجيل الخروج"
        >
          <ArrowRightOnRectangleIcon className="h-6 w-6" />
          <span className="mr-2 hidden md:block">خروج</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
