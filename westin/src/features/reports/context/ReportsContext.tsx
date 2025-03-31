import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Report } from '../types';
import mockData from '../../../data/mock';

// Sample initial reports data - acum folosim datele mock
const initialReports: Report[] = mockData.reports;

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