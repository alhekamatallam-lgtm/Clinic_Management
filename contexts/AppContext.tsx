import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Patient, Visit, Diagnosis, User, Clinic, Revenue, Role, View, VisitStatus, VisitType } from '../types';

// The API URL provided by the user.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsewzqt9mr-OE411emksKT8cl6px4r-BQGfzodHfPVvP8UGbCv1hLDY6HplOnb9MDA/exec"; 

interface ToastState {
    message: string;
    type: 'success' | 'error';
}
interface AppContextType {
    user: User | null;
    login: (username: string, password?: string) => boolean;
    logout: () => void;
    currentView: View;
    setView: (view: View) => void;
    patients: Patient[];
    visits: Visit[];
    diagnoses: Diagnosis[];
    users: User[];
    clinics: Clinic[];
    revenues: Revenue[];
    addPatient: (patient: Omit<Patient, 'patient_id'>) => Promise<void>;
    addVisit: (visit: Omit<Visit, 'visit_id' | 'visit_date' | 'queue_number' | 'status'>) => Promise<void>;
    addDiagnosis: (diagnosis: Omit<Diagnosis, 'diagnosis_id'>) => Promise<void>;
    addUser: (user: Omit<User, 'user_id'>) => Promise<void>;
    updateUserPassword: (userId: number, password: string) => Promise<void>;
    updateVisitStatus: (visitId: number, status: VisitStatus) => void; 
    loading: boolean;
    error: string | null;
    toast: ToastState | null;
    showToast: (message: string, type?: 'success' | 'error') => void;
    hideToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize user state from localStorage to persist session
    const [user, setUser] = useState<User | null>(() => {
        try {
            const storedUser = localStorage.getItem('clinicUser');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error('Failed to parse user from localStorage', error);
            return null;
        }
    });

    const [currentView, setCurrentView] = useState<View>('dashboard');
    
    // Data states
    const [patients, setPatients] = useState<Patient[]>([]);
    const [visits, setVisits] = useState<Visit[]>([]);
    const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [revenues, setRevenues] = useState<Revenue[]>([]);

    // API states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<ToastState | null>(null);

    // Toast notification functions
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };


    // Fetch initial data from Google Sheets API
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(SCRIPT_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result.success) {
                    setPatients(result.data.Patients || []);
                    setVisits(result.data.Visits || []);
                    setDiagnoses(result.data.Diagnosis || []);
                    setUsers(result.data.Users || []);
                    setClinics(result.data.Clinics || []);
                    setRevenues(result.data.Revenues || []);
                } else {
                    throw new Error(result.message || "Failed to fetch data.");
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Refactored postData to handle a generic payload object.
    const postData = async (payload: object) => {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload),
            });
            
            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Could not read error text from response.');
                throw new Error(`API call failed: ${response.status} - ${response.statusText}. Details: ${errorText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error posting data:", error);
            throw error; // Re-throw to be handled by the caller
        }
    };


    const login = (username: string, password?: string): boolean => {
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
            const { password, ...userToStore } = foundUser; // Exclude password from stored object
            setUser(userToStore);
            localStorage.setItem('clinicUser', JSON.stringify(userToStore));
            setView('dashboard');
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('clinicUser');
    };

    const setView = (view: View) => {
        setCurrentView(view);
    };

    const addPatient = async (patientData: Omit<Patient, 'patient_id'>) => {
        const newPatientId = (patients.length > 0 ? Math.max(...patients.map(p => p.patient_id)) : 0) + 1;
        const newPatient: Patient = { ...patientData, patient_id: newPatientId };
        
        try {
            const result = await postData({ sheet: 'Patients', ...newPatient });
            if (result.success) {
                setPatients(prev => [...prev, newPatient]);
                showToast('تمت إضافة المريض بنجاح.', 'success');
            } else {
                throw new Error(result.message || 'API returned an error while adding patient.');
            }
        } catch (e: any) {
            console.error("Failed to add patient:", e);
            showToast(`فشل في إضافة المريض: ${e.message}`, 'error');
        }
    };

    const addVisit = async (visitData: Omit<Visit, 'visit_id' | 'visit_date' | 'queue_number' | 'status'>) => {
        const today = new Date().toISOString().split('T')[0];
        const clinicVisitsToday = visits.filter(v => v.clinic_id === visitData.clinic_id && v.visit_date === today).length;

        const newVisitId = (visits.length > 0 ? Math.max(...visits.map(v => v.visit_id)) : 0) + 1;
        const newVisit: Visit = {
            ...visitData,
            visit_id: newVisitId,
            visit_date: today,
            queue_number: clinicVisitsToday + 1,
            status: VisitStatus.Waiting,
        };
        
        try {
            const result = await postData({ sheet: 'Visits', ...newVisit });
            if (result.success) {
                setVisits(prev => [...prev, newVisit]);
                await addRevenueForVisit(newVisit);
                showToast('تمت إضافة الزيارة بنجاح.', 'success');
            } else {
                 throw new Error(result.message || 'API returned an error while adding visit.');
            }
        } catch (e: any) {
            console.error("Failed to add visit:", e);
            showToast(`فشل في إضافة الزيارة: ${e.message}`, 'error');
        }
    };
    
    const addRevenueForVisit = async (visit: Visit) => {
        const patient = patients.find(p => p.patient_id === visit.patient_id);
        const clinic = clinics.find(c => c.clinic_id === visit.clinic_id);

        if (!patient || !clinic) return;

        const amount = visit.visit_type === VisitType.FirstVisit ? clinic.price_first_visit : clinic.price_followup;
        const newRevenueId = (revenues.length > 0 ? Math.max(...revenues.map(r => r.revenue_id)) : 0) + 1;

        const newRevenue: Revenue = {
            revenue_id: newRevenueId,
            visit_id: visit.visit_id,
            patient_id: patient.patient_id,
            patient_name: patient.name,
            clinic_id: clinic.clinic_id,
            amount: amount,
            date: visit.visit_date,
            type: visit.visit_type,
            notes: `Revenue for visit #${visit.visit_id}`,
        };
        
        try {
            const result = await postData({ sheet: 'Revenues', ...newRevenue });
            if (!result.success) {
                throw new Error(result.message || 'API returned an error while adding revenue.');
            }
        } catch(e: any) {
            console.error("Failed to add revenue:", e);
            showToast(`فشل في إضافة الإيراد: ${e.message}`, 'error');
        }
    };

    const addDiagnosis = async (diagnosisData: Omit<Diagnosis, 'diagnosis_id'>) => {
        const newDiagnosisId = (diagnoses.length > 0 ? Math.max(...diagnoses.map(d => d.diagnosis_id)) : 0) + 1;
        const newDiagnosis: Diagnosis = { ...diagnosisData, diagnosis_id: newDiagnosisId };

        try {
            const result = await postData({ sheet: 'Diagnosis', ...newDiagnosis });
            if (result.success) {
                setDiagnoses(prev => [...prev, newDiagnosis]);
                updateVisitStatus(diagnosisData.visit_id, VisitStatus.Completed);
                showToast('تم حفظ التشخيص بنجاح.', 'success');
            } else {
                throw new Error(result.message || 'API returned an error while adding diagnosis.');
            }
        } catch (e: any) {
            console.error("Failed to add diagnosis:", e);
            showToast(`فشل في حفظ التشخيص: ${e.message}`, 'error');
        }
    };

    const addUser = async (userData: Omit<User, 'user_id'>) => {
        // Validation check for duplicate username (case-insensitive)
        if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
            showToast('اسم المستخدم موجود بالفعل. يرجى اختيار اسم آخر.', 'error');
            return;
        }

        const newUserId = (users.length > 0 ? Math.max(...users.map(u => u.user_id)) : 0) + 1;
        const newUser: User = { ...userData, user_id: newUserId };

        try {
            const result = await postData({ sheet: 'Users', ...newUser });
            if (result.success) {
                setUsers(prev => [...prev, newUser]);
                showToast('تم إضافة المستخدم بنجاح.', 'success');
            } else {
                throw new Error(result.message || 'API returned an error while adding user.');
            }
        } catch (e: any) {
            console.error("Failed to add user:", e);
            showToast(`فشل في إضافة المستخدم: ${e.message}`, 'error');
        }
    };
    
    const updateUserPassword = async (userId: number, password: string) => {
        try {
            const result = await postData({
                sheet: 'Users',
                action: 'updatePassword',
                user_id: userId,
                password: password,
            });
            if (result.success) {
                showToast('تم تغيير كلمة المرور بنجاح.', 'success');
            } else {
                throw new Error(result.message || 'API returned an error while updating password.');
            }
        } catch (e: any) {
            console.error("Failed to update password:", e);
            showToast(`فشل في تحديث كلمة المرور: ${e.message}`, 'error');
        }
    };


    const updateVisitStatus = (visitId: number, status: VisitStatus) => {
        setVisits(prevVisits =>
            prevVisits.map(v => v.visit_id === visitId ? { ...v, status } : v)
        );
        // Note: This operation is local for now. To persist it, a POST/UPDATE API endpoint would be needed.
    };
    
    const value = {
        user, login, logout, currentView, setView,
        patients, visits, diagnoses, users, clinics, revenues,
        addPatient, addVisit, addDiagnosis, addUser, updateUserPassword, updateVisitStatus,
        loading, error,
        toast, showToast, hideToast
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};