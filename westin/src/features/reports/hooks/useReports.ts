import { useReports as useReportsContext } from '../context/ReportsContext';

// Acest hook asigură că folosim același context peste tot în aplicație
export const useReports = useReportsContext;

export default useReports;