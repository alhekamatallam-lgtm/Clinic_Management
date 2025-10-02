
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Role } from '../types';
import ReceptionistDashboard from '../components/dashboards/ReceptionistDashboard';
import DoctorDashboard from '../components/dashboards/DoctorDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';

const Dashboard: React.FC = () => {
  const { user } = useApp();

  const renderDashboard = () => {
    switch (user?.role) {
      case Role.Reception:
        return <ReceptionistDashboard />;
      case Role.Doctor:
        return <DoctorDashboard />;
      case Role.Manager:
        return <ManagerDashboard />;
      default:
        return <div>مرحباً بك في نظام إدارة العيادات</div>;
    }
  };

  return (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">لوحة التحكم</h1>
        {renderDashboard()}
    </div>
  );
};

export default Dashboard;
