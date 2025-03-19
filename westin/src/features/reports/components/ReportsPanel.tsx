import React, { useState, useRef, useEffect } from 'react';
import { useReports } from '../context/ReportsContext';
import { Report, ReportType } from '../types';

interface ReportsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ReportsPanel: React.FC<ReportsPanelProps> = ({ isOpen, onClose }) => {
  const { 
    reports, 
    deleteReport, 
    deleteMultipleReports, 
    markAsRead, 
    markAllAsRead 
  } = useReports();
  
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectAll, setSelectAll] = useState(false);
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const reportsPerPage = 5;

  // Reset selected reports when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedReports([]);
      setSelectAll(false);
      setSearchTerm('');
      setCurrentPage(1);
      setSelectedReport(null);
      setIsReportDetailOpen(false);
    }
  }, [isOpen]);

  // Reset selectAll when filtered reports change
  useEffect(() => {
    setSelectAll(false);
    setSelectedReports([]);
  }, [searchTerm]);

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Handler for starting the drag
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === panelRef.current?.querySelector('.header')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  // Handler for dragging
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
  };

  // Handler for ending the drag
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Set up event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Handle select all checkbox
  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    
    if (newSelectAll) {
      setSelectedReports(currentReports.map(report => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  // Handle individual report selection
  const handleSelectReport = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter(id => id !== reportId));
      setSelectAll(false);
    } else {
      setSelectedReports([...selectedReports, reportId]);
      
      // Check if all are now selected
      if (selectedReports.length + 1 === currentReports.length) {
        setSelectAll(true);
      }
    }
  };

  // Handle delete multiple reports
  const handleDeleteSelected = () => {
    deleteMultipleReports(selectedReports);
    setSelectedReports([]);
    setSelectAll(false);
  };

  // Handle opening a report
  const handleOpenReport = (report: Report) => {
    if (!report.read) {
      markAsRead(report.id);
    }
    setSelectedReport(report);
    setIsReportDetailOpen(true);
  };

  // Close report detail view
  const handleCloseReportDetail = () => {
    setIsReportDetailOpen(false);
    setSelectedReport(null);
  };

  // Format date helper
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };
  
  // Format date for the reports list - shorter format
  const formatShortDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear().toString().slice(2)} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Get icon for report type
  const getReportIcon = (type: ReportType, result?: 'victory' | 'defeat') => {
    if (type === 'duel') {
      return result === 'victory' ? '⚔️' : '💔';
    } else {
      return result === 'victory' ? '🏆' : '❌';
    }
  };

  // Format each line of the combat log with appropriate styling
  const formatCombatLogLine = (line: string, index: number) => {
    let className = '';
    
    if (line.includes('[CRITIC]')) {
      className = 'text-red-400 font-bold';
    } else if (line.includes('-------- Runda')) {
      className = 'text-metin-gold border-b border-metin-gold/30 pb-1 pt-2 font-medium';
    } else if (line.includes('Status la finalul rundei')) {
      className = 'text-cyan-400 border-t border-metin-gold/10 pt-1';
    } else if (line.includes('Victorie')) {
      className = 'text-green-400 font-bold';
    } else if (line.includes('Înfrângere')) {
      className = 'text-red-400 font-bold';
    } else if (line.includes('→')) {
      className = 'text-yellow-300';
    } else if (line.includes('[Duel început]') || line.includes('[Lupta începe]')) {
      className = 'text-metin-gold font-medium border-b border-metin-gold/30 pb-1 mb-1';
    }
    
    return (
      <div key={index} className={`py-0.5 ${className}`}>
        {line}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-metin-dark/95 border-2 border-metin-gold/40 rounded-lg shadow-lg"
      style={{
        width: isReportDetailOpen ? '720px' : '680px', // Increased width for better readability
        height: '550px', // Increased height to fit more content
        top: `${position.y}px`,
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="header bg-gradient-to-r from-metin-brown to-metin-dark border-b border-metin-gold/40 px-4 py-2 flex justify-between items-center cursor-grab">
        <h2 className="text-metin-gold font-bold text-lg">
          {isReportDetailOpen ? 'Detalii Raport' : 'Rapoarte'}
        </h2>
        <div className="flex items-center">
          {isReportDetailOpen && (
            <button
              onClick={handleCloseReportDetail}
              className="mr-4 text-metin-light/70 hover:text-metin-gold text-sm transition-colors flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Înapoi
            </button>
          )}
          <button
            onClick={onClose}
            className="text-metin-light/70 hover:text-metin-gold text-xl transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {/* Report Details View */}
      {isReportDetailOpen && selectedReport ? (
        <div className="p-4 h-[calc(100%-44px)] flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-metin-gold/20">
            <div className="flex items-center">
              <span className="text-xl mr-2">
                {getReportIcon(selectedReport.type, selectedReport.result)}
              </span>
              <h3 className="text-metin-gold font-medium">{selectedReport.subject}</h3>
            </div>
            <div className="text-metin-light/80 text-sm">
              {formatDate(selectedReport.timestamp)}
            </div>
          </div>
          
          <div className="flex-grow overflow-y-auto pr-1">
            {/* Folosim o abordare structurată pentru afișarea raportului */}
            <div className="space-y-4">
              {/* Prima secțiune: Rezultatul și recompensele */}
              <div className="p-3 bg-black/30 rounded-lg">
                {selectedReport.content.split('\n\n')[0] && (
                  <div className="font-medium text-metin-light">
                    {selectedReport.content.split('\n\n')[0]}
                  </div>
                )}
                
                {selectedReport.content.split('\n\n')[1] && (
                  <div className="mt-2 text-metin-light/90">
                    {selectedReport.content.split('\n\n')[1]}
                  </div>
                )}
              </div>
              
              {/* A doua secțiune: Statistici */}
              {selectedReport.content.includes('Statistici duel:') && (
                <div className="p-3 bg-black/30 rounded-lg">
                  <h4 className="text-metin-gold font-medium mb-2 pb-1 border-b border-metin-gold/20">Statistici duel</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedReport.content
                      .split('Statistici duel:\n')[1]
                      .split('\n\n')[0]
                      .split('\n')
                      .map((stat, index) => (
                        <div key={index} className="p-2 bg-black/40 rounded border border-metin-gold/20">
                          {stat.replace('- ', '')}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              
              {/* A treia secțiune: Desfășurarea luptei */}
              {selectedReport.content.includes('Desfășurarea luptei:') && (
                <div className="bg-black/30 p-3 rounded-lg">
                  <h4 className="text-metin-gold font-medium mb-2 pb-1 border-b border-metin-gold/20">Desfășurarea luptei</h4>
                  
                  <div className="bg-black/40 p-3 rounded border border-metin-gold/20 text-sm font-mono overflow-x-auto max-h-[220px] scrollbar-thin scrollbar-thumb-metin-gold/20 scrollbar-track-black/20">
                    {selectedReport.content
                      .split('Desfășurarea luptei:\n')[1]
                      .split('\n\n')[0]
                      .split('\n')
                      .map((line, index) => formatCombatLogLine(line, index))}
                  </div>
                </div>
              )}
              
              {/* A patra secțiune: Mesaj final */}
              {selectedReport.content.split('\n\n').length > 3 && (
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-center text-metin-light/90 italic">
                    {selectedReport.content.split('\n\n').slice(-1)[0]}
                  </div>
                </div>
              )}
            </div>
            
            {/* Statistici de luptă suplimentare - doar pentru rapoartele cu combatStats */}
            {selectedReport.combatStats && (
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <h4 className="text-metin-gold mb-2 pb-1 border-b border-metin-gold/20">Statistici Suplimentare</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20">
                    <div className="text-metin-gold text-sm mb-1">Experiență:</div>
                    <div className="text-metin-light/90">
                      {selectedReport.combatStats.expGained.toLocaleString()} XP
                    </div>
                  </div>
                  
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20">
                    <div className="text-metin-gold text-sm mb-1">Yang:</div>
                    <div className="text-metin-light/90">
                      {selectedReport.combatStats.yangGained.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20">
                    <div className="text-metin-gold text-sm mb-1">Damage dat:</div>
                    <div className="text-green-400">
                      {selectedReport.combatStats.damageDealt.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20">
                    <div className="text-metin-gold text-sm mb-1">HP pierdut:</div>
                    <div className="text-red-400">
                      {selectedReport.combatStats.playerHpLost.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20">
                    <div className="text-metin-gold text-sm mb-1">Runde:</div>
                    <div className="text-metin-light/90">
                      {selectedReport.combatStats.totalRounds}
                    </div>
                  </div>
                  
                  {selectedReport.result === 'defeat' && (
                    <div className="p-2 bg-black/40 rounded border border-metin-gold/20">
                      <div className="text-metin-gold text-sm mb-1">HP rămas inamic:</div>
                      <div className="text-metin-light/90">
                        {selectedReport.combatStats.remainingMobHp.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => {
                deleteReport(selectedReport.id);
                handleCloseReportDetail();
              }}
              className="bg-metin-red/80 hover:bg-metin-red text-white px-4 py-1 rounded flex items-center text-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Șterge raport
            </button>
          </div>
        </div>
      ) : (
        /* Reports List View */
        <div className="p-4 h-[calc(100%-44px)] flex flex-col">
          {/* Table Header */}
          <div className="flex items-center border-b border-metin-gold/30 pb-2 text-metin-gold">
            <div className="w-7 flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={selectAll}
                onChange={handleSelectAll}
                className="accent-metin-gold w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="w-7/12 px-2 font-medium">Subiect</div>
            <div className="w-3/12 px-2 font-medium text-center">Trimis</div>
            <div className="w-12 flex justify-end pr-3">
              {selectedReports.length > 0 && (
                <button 
                  onClick={handleDeleteSelected}
                  className="text-metin-red hover:text-red-400 transition-colors"
                  title="Șterge rapoartele selectate"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Reports List */}
          <div className="flex-grow overflow-y-auto my-2">
            {currentReports.length > 0 ? (
              currentReports.map(report => (
                <div 
                  key={report.id} 
                  className={`flex items-center py-2 border-b border-metin-gold/10 hover:bg-black/30 transition-colors ${!report.read ? 'font-semibold' : ''} cursor-pointer`}
                  onClick={() => handleOpenReport(report)}
                >
                  <div className="w-7 flex items-center justify-center" onClick={(e) => {
                    e.stopPropagation();
                  }}>
                    <input 
                      type="checkbox" 
                      checked={selectedReports.includes(report.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectReport(report.id);
                      }}
                      className="accent-metin-gold w-4 h-4 cursor-pointer"
                    />
                  </div>
                  <div className="w-7/12 px-2 truncate flex items-center" title={report.subject}>
                    {!report.read && <span className="text-metin-red mr-1 text-lg">•</span>}
                    <span className="mr-2">{getReportIcon(report.type, report.result)}</span>
                    <span className={!report.read ? 'text-metin-light' : 'text-metin-light/80'}>
                      {report.subject}
                    </span>
                  </div>
                  <div className="w-3/12 px-2 text-sm text-metin-light/70 text-center">
                    {formatShortDate(report.timestamp)}
                  </div>
                  <div className="w-12 flex justify-end pr-3" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteReport(report.id);
                      }}
                      className="text-metin-red/70 hover:text-metin-red transition-colors"
                      title="Șterge raport"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-metin-light/50">
                {searchTerm ? 'Niciun raport nu corespunde căutării' : 'Nu există rapoarte'}
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="mt-auto pt-2 border-t border-metin-gold/30 flex justify-between items-center">
            {/* Search Bar */}
            <div className="relative w-60">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Caută rapoarte..."
                className="w-full bg-black/40 border border-metin-gold/30 rounded px-2 py-1 text-metin-light focus:border-metin-gold focus:outline-none text-sm"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-metin-light/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Mark all as read button */}
              <button
                onClick={markAllAsRead}
                className="px-2 py-1 text-sm text-metin-light hover:text-metin-gold transition-colors border border-transparent hover:border-metin-gold/20 rounded-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Marchează ca citite
              </button>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center gap-1 bg-black/20 border border-metin-gold/20 rounded px-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={`w-6 h-6 flex items-center justify-center rounded ${
                      currentPage === 1
                        ? 'text-metin-light/30 cursor-not-allowed'
                        : 'text-metin-light hover:bg-metin-gold/20 hover:text-metin-gold'
                    }`}
                  >
                    &lt;
                  </button>
                  
                  <span className="text-metin-light text-sm mx-1">
                    {currentPage}/{totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={`w-6 h-6 flex items-center justify-center rounded ${
                      currentPage === totalPages
                        ? 'text-metin-light/30 cursor-not-allowed'
                        : 'text-metin-light hover:bg-metin-gold/20 hover:text-metin-gold'
                    }`}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPanel;