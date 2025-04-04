import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Report } from '../types';
import mockData from '../../../data/mock';

// Sample initial reports data - acum folosim datele mock
const initialReports: Report[] = mockData.reports;

// Modificăm interfața pentru a accepta rapoarte cu ID-uri predefinite
interface ReportsContextType {
  reports: Report[];
  addReport: (report: Omit<Report, 'timestamp'>) => void;
  deleteReport: (id: string) => void;
  deleteMultipleReports: (ids: string[]) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getUnreadCount: () => number;
}

// Create context with default values
const ReportsContext = createContext<ReportsContextType>({
  reports: [],
  addReport: () => {},
  deleteReport: () => {},
  deleteMultipleReports: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  getUnreadCount: () => 0
});

// Custom hook to use the reports context
export const useReports = () => useContext(ReportsContext);

interface ReportsProviderProps {
  children: ReactNode;
}

// Provider component that wraps your app and makes reports context available
export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children }) => {
  // Inițializăm cu datele mock pentru a evita erori de hidratare
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [isInitialized, setIsInitialized] = useState(false);

  // Încărcăm datele din localStorage doar după ce componenta s-a montat pe client
  useEffect(() => {
    // Acest cod rulează doar pe client după ce componenta a fost montată
    try {
      const savedReports = localStorage.getItem('westin_reports');
      if (savedReports) {
        const parsed = JSON.parse(savedReports);
        // Convertim string-urile de date înapoi în obiecte Date
        const processed = parsed.map((report: any) => ({
          ...report,
          timestamp: new Date(report.timestamp)
        }));
        setReports(processed);
      }
      setIsInitialized(true);
    } catch (e) {
      console.error('Eroare la încărcarea rapoartelor din localStorage:', e);
      setIsInitialized(true);
    }
  }, []);

  // Salvăm rapoartele în localStorage doar după inițializare și când se schimbă
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('westin_reports', JSON.stringify(reports));
      } catch (e) {
        console.error('Eroare la salvarea rapoartelor în localStorage:', e);
      }
    }
  }, [reports, isInitialized]);

  // Add a new report with generated ID and timestamp
  const addReport = useCallback((reportData: Omit<Report, 'timestamp'>) => {
    console.log('Adaug raport nou:', reportData);
    
    const newReport: Report = {
      ...reportData,
      id: reportData.id || Date.now().toString() + "_" + Math.random().toString(36).substring(2, 7),
      timestamp: new Date(),
    };

    setReports(prev => {
      const newReports = [newReport, ...prev];
      console.log('Rapoarte actualizate:', newReports.length);
      return newReports;
    });
  }, []);

  // Delete a report by ID
  const deleteReport = useCallback((id: string) => {
    setReports(prev => prev.filter(report => report.id !== id));
  }, []);

  // Delete multiple reports by IDs
  const deleteMultipleReports = useCallback((ids: string[]) => {
    setReports(prev => prev.filter(report => !ids.includes(report.id)));
  }, []);

  // Mark a report as read
  const markAsRead = useCallback((id: string) => {
    setReports(prev => 
      prev.map(report => 
        report.id === id ? { ...report, read: true } : report
      )
    );
  }, []);

  // Mark all reports as read
  const markAllAsRead = useCallback(() => {
    setReports(prev => 
      prev.map(report => ({ ...report, read: true }))
    );
  }, []);

  // Get count of unread reports
  const getUnreadCount = useCallback(() => {
    return reports.filter(report => !report.read).length;
  }, [reports]);

  const value = {
    reports,
    addReport,
    deleteReport,
    deleteMultipleReports,
    markAsRead,
    markAllAsRead,
    getUnreadCount
  };

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
};