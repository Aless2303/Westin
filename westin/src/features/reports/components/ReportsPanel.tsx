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
    markAllAsRead,
  } = useReports();

  const [position, setPosition] = useState({ x: 0, y: 0 });
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

  // Calcul poziție inițială pentru a fi centrată pe ecran
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const panelWidth = panelRef.current.offsetWidth;
      const panelHeight = panelRef.current.offsetHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const initialX = Math.max(0, (windowWidth - panelWidth) / 2);
      const initialY = Math.max(0, (windowHeight - panelHeight) / 2);
      setPosition({ x: initialX, y: initialY });
    }
  }, [isOpen]);

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
  const filteredReports = reports.filter((report) =>
    report.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === panelRef.current?.querySelector('.header')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !panelRef.current) return;
    const panelWidth = panelRef.current.offsetWidth;
    const panelHeight = panelRef.current.offsetHeight;
    const maxX = window.innerWidth - panelWidth;
    const maxY = window.innerHeight - panelHeight;

    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch events pentru mobil
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.target === panelRef.current?.querySelector('.header')) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !panelRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    const panelWidth = panelRef.current.offsetWidth;
    const panelHeight = panelRef.current.offsetHeight;
    const maxX = window.innerWidth - panelWidth;
    const maxY = window.innerHeight - panelHeight;

    let newX = touch.clientX - dragStart.x;
    let newY = touch.clientY - dragStart.y;

    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    if (newSelectAll) {
      setSelectedReports(currentReports.map((report) => report.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId: string) => {
    if (selectedReports.includes(reportId)) {
      setSelectedReports(selectedReports.filter((id) => id !== reportId));
      setSelectAll(false);
    } else {
      setSelectedReports([...selectedReports, reportId]);
      if (selectedReports.length + 1 === currentReports.length) {
        setSelectAll(true);
      }
    }
  };

  const handleDeleteSelected = () => {
    deleteMultipleReports(selectedReports);
    setSelectedReports([]);
    setSelectAll(false);
  };

  const handleOpenReport = (report: Report) => {
    if (!report.read) {
      markAsRead(report.id);
    }
    setSelectedReport(report);
    setIsReportDetailOpen(true);
  };

  const handleCloseReportDetail = () => {
    setIsReportDetailOpen(false);
    setSelectedReport(null);
  };

  const formatDate = (date: Date) =>
    `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()} ${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

  const formatShortDate = (date: Date) =>
    `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear().toString().slice(2)} ${date
      .getHours()
      .toString()
      .padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

  const getReportIcon = (type: ReportType, result?: 'victory' | 'defeat') =>
    type === 'duel' ? (result === 'victory' ? '⚔️' : '💔') : result === 'victory' ? '🏆' : '❌';

  const formatCombatLogLine = (line: string, index: number) => {
    let className = '';
    if (line.includes('[CRITIC]')) className = 'text-red-400 font-bold';
    else if (line.includes('-------- Runda')) className = 'text-metin-gold border-b border-metin-gold/30 pb-1 pt-2 font-medium';
    else if (line.includes('Status la finalul rundei')) className = 'text-cyan-400 border-t border-metin-gold/10 pt-1';
    else if (line.includes('Victorie')) className = 'text-green-400 font-bold';
    else if (line.includes('Înfrângere')) className = 'text-red-400 font-bold';
    else if (line.includes('→')) className = 'text-yellow-300';
    else if (line.includes('[Duel început]') || line.includes('[Lupta începe]'))
      className = 'text-metin-gold font-medium border-b border-metin-gold/30 pb-1 mb-1';

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
      className="fixed z-50 bg-metin-dark/95 border-2 border-metin-gold/40 rounded-lg shadow-lg w-[90vw] max-w-[680px] h-[80vh] max-h-[550px] sm:w-[680px] sm:h-[550px] md:max-w-[720px]"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        cursor: isDragging ? 'grabbing' : 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div
        className="header bg-gradient-to-r from-metin-brown to-metin-dark border-b border-metin-gold/40 px-4 py-2 flex justify-between items-center cursor-grab"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <h2 className="text-metin-gold font-bold text-lg sm:text-base">
          {isReportDetailOpen ? 'Detalii Raport' : 'Rapoarte'}
        </h2>
        <div className="flex items-center">
          {isReportDetailOpen && (
            <button
              onClick={handleCloseReportDetail}
              className="mr-4 text-metin-light/70 hover:text-metin-gold text-sm sm:text-xs transition-colors flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Înapoi
            </button>
          )}
          <button
            onClick={onClose}
            className="text-metin-light/70 hover:text-metin-gold text-xl sm:text-lg transition-colors"
          >
            ×
          </button>
        </div>
      </div>

      {isReportDetailOpen && selectedReport ? (
        <div className="p-4 h-[calc(100%-44px)] flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-metin-gold/20 flex-col sm:flex-row">
            <div className="flex items-center mb-2 sm:mb-0">
              <span className="text-xl sm:text-lg mr-2">{getReportIcon(selectedReport.type, selectedReport.result)}</span>
              <h3 className="text-metin-gold font-medium text-base sm:text-lg">{selectedReport.subject}</h3>
            </div>
            <div className="text-metin-light/80 text-sm sm:text-xs">{formatDate(selectedReport.timestamp)}</div>
          </div>

          <div className="flex-grow overflow-y-auto pr-1">
            <div className="space-y-4">
              <div className="p-3 bg-black/30 rounded-lg">
                {selectedReport.content.split('\n\n')[0] && (
                  <div className="font-medium text-metin-light text-sm sm:text-base">
                    {selectedReport.content.split('\n\n')[0]}
                  </div>
                )}
                {selectedReport.content.split('\n\n')[1] && (
                  <div className="mt-2 text-metin-light/90 text-sm sm:text-base">
                    {selectedReport.content.split('\n\n')[1]}
                  </div>
                )}
              </div>

              {selectedReport.content.includes('Statistici duel:') && (
                <div className="p-3 bg-black/30 rounded-lg">
                  <h4 className="text-metin-gold font-medium mb-2 pb-1 border-b border-metin-gold/20 text-sm sm:text-base">
                    Statistici duel
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedReport.content
                      .split('Statistici duel:\n')[1]
                      .split('\n\n')[0]
                      .split('\n')
                      .map((stat, index) => (
                        <div key={index} className="p-2 bg-black/40 rounded border border-metin-gold/20 text-xs sm:text-sm">
                          {stat.replace('- ', '')}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedReport.content.includes('Desfășurarea luptei:') && (
                <div className="bg-black/30 p-3 rounded-lg">
                  <h4 className="text-metin-gold font-medium mb-2 pb-1 border-b border-metin-gold/20 text-sm sm:text-base">
                    Desfășurarea luptei
                  </h4>
                  <div className="bg-black/40 p-3 rounded border border-metin-gold/20 text-xs sm:text-sm font-mono overflow-x-auto max-h-[220px] scrollbar-thin scrollbar-thumb-metin-gold/20 scrollbar-track-black/20">
                    {selectedReport.content
                      .split('Desfășurarea luptei:\n')[1]
                      .split('\n\n')[0]
                      .split('\n')
                      .map((line, index) => formatCombatLogLine(line, index))}
                  </div>
                </div>
              )}

              {selectedReport.content.split('\n\n').length > 3 && (
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-center text-metin-light/90 italic text-sm sm:text-base">
                    {selectedReport.content.split('\n\n').slice(-1)[0]}
                  </div>
                </div>
              )}
            </div>

            {selectedReport.combatStats && (
              <div className="mt-4 p-3 bg-black/30 rounded-lg">
                <h4 className="text-metin-gold mb-2 pb-1 border-b border-metin-gold/20 text-sm sm:text-base">
                  Statistici Suplimentare
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20 text-xs sm:text-sm">
                    <div className="text-metin-gold mb-1">Experiență:</div>
                    <div className="text-metin-light/90">{selectedReport.combatStats.expGained.toLocaleString()} XP</div>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20 text-xs sm:text-sm">
                    <div className="text-metin-gold mb-1">Yang:</div>
                    <div className="text-metin-light/90">{selectedReport.combatStats.yangGained.toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20 text-xs sm:text-sm">
                    <div className="text-metin-gold mb-1">Damage dat:</div>
                    <div className="text-green-400">{selectedReport.combatStats.damageDealt.toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20 text-xs sm:text-sm">
                    <div className="text-metin-gold mb-1">HP pierdut:</div>
                    <div className="text-red-400">{selectedReport.combatStats.playerHpLost.toLocaleString()}</div>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-metin-gold/20 text-xs sm:text-sm">
                    <div className="text-metin-gold mb-1">Runde:</div>
                    <div className="text-metin-light/90">{selectedReport.combatStats.totalRounds}</div>
                  </div>
                  {selectedReport.result === 'defeat' && (
                    <div className="p-2 bg-black/40 rounded border border-metin-gold/20 text-xs sm:text-sm">
                      <div className="text-metin-gold mb-1">HP rămas inamic:</div>
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
              className="bg-metin-red/80 hover:bg-metin-red text-white px-4 py-1 rounded flex items-center text-sm sm:text-base transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Șterge raport
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 h-[calc(100%-44px)] flex flex-col">
          <div className="flex items-center border-b border-metin-gold/30 pb-2 text-metin-gold">
            <div className="w-7 flex items-center justify-center">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                className="accent-metin-gold w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="w-7/12 px-2 font-medium text-sm sm:text-base">Subiect</div>
            <div className="w-3/12 px-2 font-medium text-center text-sm sm:text-base">Trimis</div>
            <div className="w-12 flex justify-end pr-3">
              {selectedReports.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="text-metin-red hover:text-red-400 transition-colors"
                  title="Șterge rapoartele selectate"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex-grow overflow-y-auto my-2">
            {currentReports.length > 0 ? (
              currentReports.map((report) => (
                <div
                  key={report.id}
                  className={`flex items-center py-2 border-b border-metin-gold/10 hover:bg-black/30 transition-colors ${
                    !report.read ? 'font-semibold' : ''
                  } cursor-pointer`}
                  onClick={() => handleOpenReport(report)}
                >
                  <div
                    className="w-7 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
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
                    <span className={!report.read ? 'text-metin-light' : 'text-metin-light/80'}>{report.subject}</span>
                  </div>
                  <div className="w-3/12 px-2 text-xs sm:text-sm text-metin-light/70 text-center">
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-metin-light/50 text-sm sm:text-base">
                {searchTerm ? 'Niciun raport nu corespunde căutării' : 'Nu există rapoarte'}
              </div>
            )}
          </div>

          <div className="mt-auto pt-2 border-t border-metin-gold/30 flex justify-between items-center flex-col sm:flex-row gap-2">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Caută rapoarte..."
                className="w-full bg-black/40 border border-metin-gold/30 rounded px-2 py-1 text-metin-light focus:border-metin-gold focus:outline-none text-sm sm:text-base"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-metin-light/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="flex items-center space-x-2 flex-col sm:flex-row gap-2">
              <button
                onClick={markAllAsRead}
                className="px-2 py-1 text-sm sm:text-base text-metin-light hover:text-metin-gold transition-colors border border-transparent hover:border-metin-gold/20 rounded-sm flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Marchează ca citite
              </button>

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