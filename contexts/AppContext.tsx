import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Patient, Visit, Diagnosis, User, Clinic, Revenue, Role, View, VisitStatus, VisitType } from '../types';

// The API URL provided by the user.
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzsewzqt9mr-OE411emksKT8cl6px4r-BQGfzodHfPVvP8UGbCv1hLDY6HplOnb9MDA/exec"; 

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
    updateVisitStatus: (visitId: number, status: VisitStatus) => void; 
    loading: boolean;
    error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
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

    // Fetch initial data from Google Sheets API
    useEffect(() => {
        const fetchData = async () => {
            // FIX: Removed the check for a placeholder URL as the SCRIPT_URL is already provided.
            // This comparison was causing a TypeScript error because the two literal types have no overlap.
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

    // Refactored postData to handle responses and errors correctly.
    const postData = async (sheet: string, data: object) => {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sheet, data }),
        });
        
        if (!response.ok) {
            throw new Error(`API call failed: ${response.status} - ${response.statusText}`);
        }

        const result = await response.json();
        return result;
    };


    const login = (username: string, password?: string): boolean => {
        const foundUser = users.find(u => u.username === username && u.password === password);
        if (foundUser) {
            setUser(foundUser);
            setView('dashboard');
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    const setView = (view: View) => {
        setCurrentView(view);
    };

    // Refactored to update state after successful API call, not before.
    const addPatient = async (patientData: Omit<Patient, 'patient_id'>) => {
        const newPatientId = (patients.length > 0 ? Math.max(...patients.map(p => p.patient_id)) : 0) + 1;
        const newPatient: Patient = { ...patientData, patient_id: newPatientId };
        
        try {
            const result = await postData('Patients', newPatient);
            if (result.success) {
                setPatients(prev => [...prev, newPatient]);
            } else {
                throw new Error(result.message || 'API returned an error while adding patient.');
            }
        } catch (e) {
            console.error("Failed to add patient:", e);
            // Optionally: set an error state to show a message to the user.
        }
    };

    // Refactored to be sequential and more robust.
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
            const result = await postData('Visits', newVisit);
            if (result.success) {
                setVisits(prev => [...prev, newVisit]);
                // If visit is added successfully, automatically add revenue entry.
                await addRevenueForVisit(newVisit);
            } else {
                 throw new Error(result.message || 'API returned an error while adding visit.');
            }
        } catch (e) {
            console.error("Failed to add visit:", e);
        }
    };
    
    // Refactored to update state after successful API call.
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
            const result = await postData('Revenues', newRevenue);
            if (result.success) {
                setRevenues(prev => [...prev, newRevenue]);
            } else {
                throw new Error(result.message || 'API returned an error while adding revenue.');
            }
        } catch(e) {
            console.error("Failed to add revenue:", e);
        }
    };

    // Refactored to update state after successful API call.
    const addDiagnosis = async (diagnosisData: Omit<Diagnosis, 'diagnosis_id'>) => {
        const newDiagnosisId = (diagnoses.length > 0 ? Math.max(...diagnoses.map(d => d.diagnosis_id)) : 0) + 1;
        const newDiagnosis: Diagnosis = { ...diagnosisData, diagnosis_id: newDiagnosisId };

        try {
            const result = await postData('Diagnosis', newDiagnosis);
            if (result.success) {
                setDiagnoses(prev => [...prev, newDiagnosis]);
                updateVisitStatus(diagnosisData.visit_id, VisitStatus.Completed);
            } else {
                throw new Error(result.message || 'API returned an error while adding diagnosis.');
            }
        } catch (e) {
            console.error("Failed to add diagnosis:", e);
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
        addPatient, addVisit, addDiagnosis, updateVisitStatus,
        loading, error
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