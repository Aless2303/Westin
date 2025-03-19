import { useReports as useReportsContext } from '../context/ReportsContext';

// This is a simple re-export of the context hook
// We use this pattern to be consistent with the project structure
export const useReports = useReportsContext;

export default useReports;