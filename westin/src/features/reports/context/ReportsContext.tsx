import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Report, ReportType } from '../types';

// Sample initial reports data
const initialReports: Report[] = [
  {
    id: '1',
    type: 'duel',
    subject: 'Duel: KnightShadow vs Ravensword',
    timestamp: new Date(2024, 2, 15, 14, 30),
    content: 'Ai câștigat duelul împotriva jucătorului KnightShadow și ai primit 2500 yang și 800 puncte de experiență.',
    read: false,
    playerName: 'KnightShadow',
    result: 'victory'
  },
  {
    id: '2',
    type: 'attack',
    subject: 'Raport de atac: Metin de Foc',
    timestamp: new Date(2024, 2, 14, 9, 45),
    content: 'Ai învins Metinul de Foc și ai primit 5000 yang și 10000 puncte de experiență.',
    read: true,
    mobName: 'Metin de Foc',
    mobType: 'metin',
    result: 'victory'
  },
  {
    id: '3',
    type: 'attack',
    subject: 'Raport de atac: Lordul Dragon',
    timestamp: new Date(2024, 2, 12, 18, 20),
    content: 'Ai învins Lordul Dragon și ai primit iteme rare și 15000 puncte de experiență!',
    read: false,
    mobName: 'Lordul Dragon',
    mobType: 'boss',
    result: 'victory'
  },
  {
    id: '4',
    type: 'duel',
    subject: 'Duel: ShadowNinja vs Ravensword',
    timestamp: new Date(2024, 2, 10, 21, 15),
    content: 'Ai pierdut duelul împotriva jucătorului ShadowNinja. Trebuie să te antrenezi mai mult!',
    read: true,
    playerName: 'ShadowNinja',
    result: 'defeat'
  },
  {
    id: '5',
    type: 'attack',
    subject: 'Raport de atac: Metin de Gheață',
    timestamp: new Date(2024, 2, 8, 20, 0),
    content: 'Atacul tău asupra Metinului de Gheață a eșuat. Pregătește-te mai bine pentru următoarea încercare.',
    read: false,
    mobName: 'Metin de Gheață',
    mobType: 'metin',
    result: 'defeat'
  }
];

// Modificăm interfața pentru a accepta rapoarte cu ID-uri predefinite
interface ReportsContextType {
  reports: Report[];
  addReport: (report: Omit<Report, 'timestamp'>) => void; // Acceptă rapoarte cu id opțional
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
  const [reports, setReports] = useState<Report[]>(initialReports);

  // Add a new report with generated ID and timestamp
  const addReport = useCallback((reportData: Omit<Report, 'timestamp'>) => {
    const newReport: Report = {
      ...reportData,
      id: reportData.id || Date.now().toString() + "_" + Math.random().toString(36).substring(2, 7), // Generează ID unic dacă nu există
      timestamp: new Date(),
    };

    setReports(prev => [newReport, ...prev]);
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