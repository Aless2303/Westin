import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Report } from '../types';
import { reportService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

// Modificăm interfața pentru a accepta rapoarte cu ID-uri predefinite
interface ReportsContextType {
  reports: Report[];
  deleteReport: (id: string) => Promise<void>;
  deleteMultipleReports: (ids: string[]) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnreadCount: () => number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Create context with default values
const ReportsContext = createContext<ReportsContextType>({
  reports: [],
  deleteReport: async () => {},
  deleteMultipleReports: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  getUnreadCount: () => 0,
  isLoading: false,
  error: null,
  refetch: async () => {}
});

// Custom hook to use the reports context
export const useReports = () => useContext(ReportsContext);

interface ReportsProviderProps {
  children: ReactNode;
}

// Provider component that wraps your app and makes reports context available
export const ReportsProvider: React.FC<ReportsProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentCharacter } = useAuth();
  
  // Funcție pentru a procesa datele de la API
  const processApiReports = (apiReports: any[]): Report[] => {
    return apiReports.map(report => ({
      ...report,
      createdAt: new Date(report.createdAt),
      updatedAt: new Date(report.updatedAt)
    }));
  };
  
  // Funcție pentru a încărca rapoartele din backend
  const fetchReports = useCallback(async () => {
    if (!currentCharacter?._id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await reportService.getReports(currentCharacter._id);
      const processedReports = processApiReports(data);
      setReports(processedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Nu s-au putut încărca rapoartele. Încearcă din nou mai târziu.');
    } finally {
      setIsLoading(false);
    }
  }, [currentCharacter?._id]);
  
  // Încărcăm rapoartele când se schimbă personajul activ
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Delete a report by ID
  const deleteReport = useCallback(async (id: string) => {
    if (!currentCharacter?._id) return;
    
    try {
      await reportService.deleteReport(currentCharacter._id, id);
      setReports(prev => prev.filter(report => report._id !== id));
    } catch (err) {
      console.error('Error deleting report:', err);
      setError('Nu s-a putut șterge raportul. Încearcă din nou mai târziu.');
    }
  }, [currentCharacter?._id]);

  // Delete multiple reports by IDs
  const deleteMultipleReports = useCallback(async (ids: string[]) => {
    if (!currentCharacter?._id || ids.length === 0) return;
    
    try {
      await reportService.deleteMultipleReports(currentCharacter._id, ids);
      setReports(prev => prev.filter(report => !ids.includes(report._id)));
    } catch (err) {
      console.error('Error deleting multiple reports:', err);
      setError('Nu s-au putut șterge rapoartele. Încearcă din nou mai târziu.');
    }
  }, [currentCharacter?._id]);

  // Mark a report as read
  const markAsRead = useCallback(async (id: string) => {
    if (!currentCharacter?._id) return;
    
    try {
      await reportService.markAsRead(currentCharacter._id, id);
      setReports(prev => 
        prev.map(report => 
          report._id === id ? { ...report, read: true } : report
        )
      );
    } catch (err) {
      console.error('Error marking report as read:', err);
    }
  }, [currentCharacter?._id]);

  // Mark all reports as read
  const markAllAsRead = useCallback(async () => {
    if (!currentCharacter?._id) return;
    
    try {
      await reportService.markAllAsRead(currentCharacter._id);
      setReports(prev => 
        prev.map(report => ({ ...report, read: true }))
      );
    } catch (err) {
      console.error('Error marking all reports as read:', err);
    }
  }, [currentCharacter?._id]);

  // Get count of unread reports
  const getUnreadCount = useCallback(() => {
    return reports.filter(report => !report.read).length;
  }, [reports]);

  const value = {
    reports,
    deleteReport,
    deleteMultipleReports,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    isLoading,
    error,
    refetch: fetchReports
  };

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
};