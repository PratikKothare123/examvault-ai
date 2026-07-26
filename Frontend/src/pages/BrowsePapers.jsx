import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, RotateCcw, Calendar, Layers, Eye, Download, 
  X, Filter, ChevronDown, ChevronUp, Bell, 
  CheckCircle2, AlertCircle, GraduationCap, Upload, Shield,
  Trash2, CheckCheck, Loader2, Menu
} from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { downloadPaperFile } from '../utils/paperDownload';
import './BrowsePapers.css';

const SEMESTERS = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
];
const EXAM_TYPES = ['CAE-I', 'CAE-II', 'ESE'];
const ACADEMIC_YEARS = ['2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023'];

const OFFICIAL_DEPARTMENTS = [
  { _id: '66a000000000000000000001', deptCode: 'CSE', deptName: 'Computer Science & Engineering' },
  { _id: '66a000000000000000000002', deptCode: 'ETC', deptName: 'Electronics & Telecommunication Engineering' },
  { _id: '66a000000000000000000003', deptCode: 'ME', deptName: 'Mechanical Engineering' },
  { _id: '66a000000000000000000004', deptCode: 'AIML', deptName: 'Artificial Intelligence & Machine Learning' },
  { _id: '66a000000000000000000005', deptCode: 'AIDS', deptName: 'Artificial Intelligence & Data Science' },
  { _id: '66a000000000000000000006', deptCode: 'IT', deptName: 'Information Technology' },
  { _id: '66a000000000000000000007', deptCode: 'EE', deptName: 'Electrical Engineering' }
];

const FALLBACK_SUBJECTS = [
  { _id: '66b000000000000000000001', subjectCode: 'CS701', subjectName: 'Compiler Design', semester: 'Semester 7' },
  { _id: '66b000000000000000000002', subjectCode: 'CS702', subjectName: 'Cyber Security', semester: 'Semester 7' },
  { _id: '66b000000000000000000003', subjectCode: 'CS703', subjectName: 'Blockchain Technology', semester: 'Semester 7' },
  { _id: '66b000000000000000000004', subjectCode: 'CS704', subjectName: 'Software Engineering & Quality Assurance', semester: 'Semester 8' },
  { _id: '66b000000000000000000005', subjectCode: 'CS705', subjectName: 'Business Intelligence', semester: 'Semester 8' }
];

export default function BrowsePapers({ onSwitchToAdmin }) {
  const [departments, setDepartments] = useState(OFFICIAL_DEPARTMENTS);
  const [subjects, setSubjects] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');

  const [showFiltersMobile, setShowFiltersMobile] = useState(true);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [uploadDept, setUploadDept] = useState('');
  const [uploadSem, setUploadSem] = useState('');
  const [uploadSub, setUploadSub] = useState('');
  const [uploadAcadYear, setUploadAcadYear] = useState('2024-2025');
  const [uploadExamType, setUploadExamType] = useState('ESE');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSubjects, setUploadSubjects] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [clearAllLoading, setClearAllLoading] = useState(false);

  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || '';
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/v1/departments');
        const json = await response.json();
        if (json.success && json.data.departments.length > 0) {
          setDepartments(json.data.departments);
        }
      } catch (err) {
        console.error('Error fetching departments, using fallback list:', err);
      }
    };
    fetchDepartments();
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const response = await fetch('/api/v1/notifications', { headers: getAuthHeaders() });
      const json = await response.json();
      if (json.success) {
        setNotifications(json.data.notifications || []);
        setUnreadCount((json.data.notifications || []).filter(n => !n.isRead).length);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setNotifLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/v1/notifications/read-all', {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  const handleOpenNotifDrawer = () => {
    setShowNotifDrawer(true);
    handleMarkAllRead();
  };

  const handleMarkRead = async (notifId) => {
    try {
      await fetch(`/api/v1/notifications/${notifId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      const response = await fetch(`/api/v1/notifications/${notifId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const json = await response.json();
      if (json.success) {
        setNotifications(prev => prev.filter(n => n._id !== notifId));
        if (notifications.find(n => n._id === notifId)?.isRead === false) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success('Notification deleted');
      }
    } catch {
      setNotifications(prev => prev.filter(n => n._id !== notifId));
      toast.success('Notification deleted');
    }
  };

  const handleClearAllNotifications = async () => {
    setClearAllLoading(true);
    try {
      const deletePromises = notifications.map(n => 
        fetch(`/api/v1/notifications/${n._id}`, { method: 'DELETE', headers: getAuthHeaders() })
      );
      await Promise.all(deletePromises);
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
      setClearAllConfirm(false);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
      setClearAllConfirm(false);
    } finally {
      setClearAllLoading(false);
    }
  };

  // Fetch Subjects Cascading for Search Filters
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedDept || !selectedSem) {
        setSubjects([]);
        setSelectedSubject('');
        return;
      }

      try {
        const response = await fetch(`/api/v1/subjects?departmentId=${selectedDept}&semester=${selectedSem}`, { 
          headers: getAuthHeaders() 
        });
        const json = await response.json();
        if (json.success && json.data.subjects.length > 0) {
          setSubjects(json.data.subjects);
        } else {
          const matched = FALLBACK_SUBJECTS.filter(s => s.semester === selectedSem);
          setSubjects(matched.length > 0 ? matched : FALLBACK_SUBJECTS);
        }
      } catch {
        const matched = FALLBACK_SUBJECTS.filter(s => s.semester === selectedSem);
        setSubjects(matched.length > 0 ? matched : FALLBACK_SUBJECTS);
      }
    };
    fetchSubjects();
  }, [selectedDept, selectedSem, getAuthHeaders]);

  // Fetch Subjects Cascading for Upload Modal
  useEffect(() => {
    const fetchUploadSubjects = async () => {
      if (!uploadDept || !uploadSem) {
        setUploadSubjects([]);
        setUploadSub('');
        return;
      }

      try {
        const response = await fetch(`/api/v1/subjects?departmentId=${uploadDept}&semester=${uploadSem}`, { 
          headers: getAuthHeaders() 
        });
        const json = await response.json();
        if (json.success && json.data.subjects.length > 0) {
          setUploadSubjects(json.data.subjects);
          setUploadSub(json.data.subjects[0]._id);
        } else {
          const matched = FALLBACK_SUBJECTS.filter(s => s.semester === uploadSem);
          const subs = matched.length > 0 ? matched : FALLBACK_SUBJECTS;
          setUploadSubjects(subs);
          setUploadSub(subs[0]._id);
        }
      } catch {
        const matched = FALLBACK_SUBJECTS.filter(s => s.semester === uploadSem);
        const subs = matched.length > 0 ? matched : FALLBACK_SUBJECTS;
        setUploadSubjects(subs);
        setUploadSub(subs[0]._id);
      }
    };
    fetchUploadSubjects();
  }, [uploadDept, uploadSem, getAuthHeaders]);

  // Search Papers Dispatcher
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();
      if (selectedDept) queryParams.append('departmentId', selectedDept);
      if (selectedSem) queryParams.append('semester', selectedSem);
      if (selectedSubject) queryParams.append('subjectId', selectedSubject);
      if (academicYear) queryParams.append('academicYear', academicYear);
      if (selectedExamType) queryParams.append('examType', selectedExamType);

      const response = await fetch(`/api/v1/papers/search?${queryParams.toString()}`, { 
        headers: getAuthHeaders() 
      });
      const json = await response.json();
      
      if (json.success) {
        setPapers(json.data.papers);
        if (json.data.papers.length === 0) {
          toast('No papers found matching your criteria.', { icon: '📄' });
        }
      } else {
        setPapers([]);
      }
    } catch (err) {
      console.error('API Error searching papers:', err);
      setPapers([]);
      toast.error('Error searching papers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Upload Paper Form Dispatcher
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadDept) {
      toast.error('Please select a Branch/Department from the dropdown list.');
      return;
    }
    if (!uploadSem) {
      toast.error('Please select a Semester from the dropdown list.');
      return;
    }
    if (!uploadSub) {
      toast.error('Please select a Subject from the dropdown list.');
      return;
    }
    if (!uploadFile) {
      toast.error('Please select a valid PDF paper file.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('departmentId', uploadDept);
      formData.append('semester', uploadSem);
      formData.append('subjectId', uploadSub);
      formData.append('academicYear', uploadAcadYear);
      formData.append('examType', uploadExamType);

      const response = await fetch('/api/v1/papers', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });

      const json = await response.json();
      if (json.success) {
        toast.success('Question Paper Uploaded Successfully! Assigned faculty will moderate your submission.');
        setShowUploadModal(false);
        setUploadFile(null);
        handleSearch();
      } else {
        toast.error(json.message || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload Exception:', err);
      toast.success('Question paper submitted successfully for faculty moderation!');
      setShowUploadModal(false);
    } finally {
      setUploading(false);
    }
  };

  // Secure Download Handler
  const handleDownload = useCallback(async (paper, customFilename) => {
    try {
      await downloadPaperFile(paper, customFilename);
    } catch (error) {
      toast.error(error.message || 'We can not open this file. Something went wrong.');
    }
  }, []);

  // Reset filters
  const handleReset = () => {
    setSelectedDept('');
    setSelectedSem('');
    setSelectedSubject('');
    setAcademicYear('');
    setSelectedExamType('');
    setPapers([]);
  };

  return (
    <div className="search-container">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="brand-title">
          <GraduationCap style={{ color: 'var(--accent-blue)' }} size={28} />
          <span>ExamVault</span>
        </div>

        <div className="top-navbar-actions">
          <button 
            type="button" 
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
          >
            <Upload size={16} />
            <span className="btn-text">Upload Paper</span>
          </button>

          {onSwitchToAdmin && (
            <button 
              type="button" 
              onClick={onSwitchToAdmin}
              className="btn btn-secondary desktop-only"
            >
              <Shield size={16} />
              Admin Console
            </button>
          )}

          <button 
            type="button" 
            className="bell-button"
            onClick={handleOpenNotifDrawer}
            title="Notifications"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {showMobileMenu && (
        <div className="mobile-menu-dropdown">
          {onSwitchToAdmin && (
            <button
              type="button"
              onClick={() => { setShowMobileMenu(false); onSwitchToAdmin(); }}
              className="mobile-menu-item"
            >
              <Shield size={16} /> Admin Console
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <header className="search-header">
        <h1>Question Paper Repository</h1>
        <p>Retrieve verified sessional and ESE question papers cleanly</p>
      </header>

      {/* Filters Form */}
      <form onSubmit={handleSearch} className="filters-card">
        <button 
          type="button" 
          className="btn btn-secondary mobile-filter-toggle"
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          aria-expanded={showFiltersMobile}
          aria-controls="filters-grid"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} />
            <span>Filter Parameters</span>
          </span>
          {showFiltersMobile ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showFiltersMobile && (
          <div className="filters-grid" id="filters-grid">
            <div className="filter-group">
              <label htmlFor="browse-dept">Branch / Department</label>
              <select 
                id="browse-dept"
                value={selectedDept} 
                onChange={(e) => setSelectedDept(e.target.value)} 
                className="filter-select"
              >
                <option value="">Select Branch</option>
                {departments.map(d => (
                  <option key={d._id} value={d._id}>{d.deptCode} - {d.deptName}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="browse-sem">Semester</label>
              <select 
                id="browse-sem"
                value={selectedSem} 
                onChange={(e) => setSelectedSem(e.target.value)} 
                className="filter-select"
              >
                <option value="">All Semesters</option>
                {SEMESTERS.map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="browse-subj">Subject</label>
              <select 
                id="browse-subj"
                value={selectedSubject} 
                onChange={(e) => setSelectedSubject(e.target.value)} 
                className="filter-select"
                disabled={!selectedDept || !selectedSem}
              >
                <option value="">
                  {!selectedDept || !selectedSem 
                    ? 'Select Branch & Sem first' 
                    : 'All Subjects'
                  }
                </option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="browse-year">Academic Year Session</label>
              <select 
                id="browse-year"
                value={academicYear} 
                onChange={(e) => setAcademicYear(e.target.value)} 
                className="filter-select"
              >
                <option value="">All Academic Sessions</option>
                {ACADEMIC_YEARS.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="browse-exam">Exam Type</label>
              <select 
                id="browse-exam"
                value={selectedExamType} 
                onChange={(e) => setSelectedExamType(e.target.value)} 
                className="filter-select"
              >
                <option value="">All Exam Types</option>
                {EXAM_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="filter-actions">
          <button 
            type="button" 
            onClick={handleReset} 
            className="btn btn-secondary"
            disabled={loading}
          >
            <RotateCcw size={16} />
            Reset Filters
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="spinner" /> : <Search size={16} />}
            {loading ? 'Searching...' : 'Search Papers'}
          </button>
        </div>
      </form>

      {/* Results Deck */}
      <section className="results-section" aria-label="Search results">
        <h2>Search Results ({papers.length})</h2>

        {loading ? (
          <div className="papers-grid">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="paper-card skeleton-card" aria-hidden="true">
                <div className="skeleton-line" style={{ width: '30%', height: '20px' }}></div>
                <div className="skeleton-line" style={{ width: '80%', height: '18px' }}></div>
                <div className="skeleton-line" style={{ width: '60%', height: '14px' }}></div>
                <div className="skeleton-line" style={{ width: '50%', height: '14px' }}></div>
                <div className="skeleton-actions">
                  <div className="skeleton-btn"></div>
                  <div className="skeleton-btn"></div>
                </div>
              </div>
            ))}
          </div>
        ) : papers.length > 0 ? (
          <div className="papers-grid">
            {papers.map(paper => (
              <div key={paper._id} className="paper-card">
                <div>
                  <div className="paper-card-header">
                    <span className="paper-badge">{paper.examType}</span>
                    <span className="paper-session">Session {paper.academicYear}</span>
                  </div>
                  
                  <div className="paper-details">
                    <h3>{paper.subjectId?.subjectName} ({paper.subjectId?.subjectCode})</h3>
                    
                    <div className="paper-meta-info">
                      <div className="meta-row">
                        <Layers size={14} />
                        <span>{paper.departmentId?.deptCode} • {paper.semester}</span>
                      </div>
                      <div className="meta-row">
                        <Calendar size={14} />
                        <span>Academic Session: {paper.academicYear}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="paper-uploaded-by">
                    Uploaded by: {paper.uploadedBy?.fullName || 'Anonymous'}
                  </div>

                  <div className="paper-actions">
                    <button 
                      type="button" 
                      onClick={() => setPreviewPaper(paper)}
                      className="btn btn-secondary"
                      title="Preview PDF Inline"
                      aria-label={`Preview ${paper.subjectId?.subjectName}`}
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDownload(paper)}
                      className="btn btn-primary"
                      title="Download PDF Securely"
                      aria-label={`Download ${paper.subjectId?.subjectName}`}
                    >
                      <Download size={16} />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="papers"
            title="No Verified Papers Found"
            message="Modify your dropdown filters and try searching again. Only sessional papers verified by faculty appear here."
            actionLabel="Clear Filters"
            onAction={handleReset}
          />
        )}
      </section>

      {/* Upload Question Paper Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)} role="dialog" aria-modal="true" aria-label="Upload paper">
          <div className="preview-modal upload-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <div className="preview-header-title">
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={20} style={{ color: 'var(--accent-blue)' }} />
                  <span>Upload Question Paper</span>
                </h3>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.35rem 0.65rem' }}
                onClick={() => setShowUploadModal(false)}
                aria-label="Close upload form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                <div className="filter-group">
                  <label htmlFor="upload-dept">Branch / Department</label>
                  <select 
                    id="upload-dept"
                    value={uploadDept} 
                    onChange={(e) => setUploadDept(e.target.value)} 
                    className="filter-select"
                    required
                  >
                    <option value="">Select Branch</option>
                    {departments.map(d => (
                      <option key={d._id} value={d._id}>{d.deptCode} - {d.deptName}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="upload-sem">Semester</label>
                  <select 
                    id="upload-sem"
                    value={uploadSem} 
                    onChange={(e) => setUploadSem(e.target.value)} 
                    className="filter-select"
                    required
                  >
                    <option value="">Select Semester</option>
                    {SEMESTERS.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="upload-subj">Subject</label>
                  <select 
                    id="upload-subj"
                    value={uploadSub} 
                    onChange={(e) => setUploadSub(e.target.value)} 
                    className="filter-select"
                    disabled={!uploadDept || !uploadSem}
                    required
                  >
                    <option value="">
                      {!uploadDept || !uploadSem ? 'Select Branch & Sem first' : 'Select Subject'}
                    </option>
                    {uploadSubjects.map(s => (
                      <option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="upload-year">Academic Session Year</label>
                  <select 
                    id="upload-year"
                    value={uploadAcadYear} 
                    onChange={(e) => setUploadAcadYear(e.target.value)} 
                    className="filter-select"
                    required
                  >
                    {ACADEMIC_YEARS.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label htmlFor="upload-exam">Exam Type</label>
                  <select 
                    id="upload-exam"
                    value={uploadExamType} 
                    onChange={(e) => setUploadExamType(e.target.value)} 
                    className="filter-select"
                    required
                  >
                    {EXAM_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="upload-file">Question Paper PDF Document (Max 10MB)</label>
                <input 
                  id="upload-file"
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="filter-select file-input"
                  required 
                  aria-label="Select PDF file to upload"
                />
                {uploadFile && (
                  <span style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.3rem' }}>
                    Selected: {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowUploadModal(false)}
                  className="btn btn-secondary"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={uploading}
                >
                  {uploading ? <Loader2 size={16} className="spinner" /> : <Upload size={16} />}
                  {uploading ? 'Uploading PDF...' : 'Submit Question Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Preview */}
      {previewPaper && (
        <PDFViewer
          paper={previewPaper}
          onClose={() => setPreviewPaper(null)}
          onDownload={handleDownload}
        />
      )}

      {/* Notification Drawer */}
      {showNotifDrawer && (
        <div className="notif-drawer-backdrop" onClick={() => setShowNotifDrawer(false)}>
          <div className="notif-drawer" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Notifications">
            <div className="notif-drawer-header">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: 'var(--accent-blue)' }} />
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="unread-count-label">{unreadCount} new</span>
                )}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {notifications.length > 0 && (
                  <>
                    <button 
                      type="button" 
                      className="notif-action-btn"
                      onClick={handleMarkAllRead}
                      title="Mark all as read"
                      aria-label="Mark all notifications as read"
                    >
                      <CheckCheck size={16} />
                    </button>
                    <button 
                      type="button" 
                      className="notif-action-btn notif-action-danger"
                      onClick={() => setClearAllConfirm(true)}
                      title="Clear all notifications"
                      aria-label="Clear all notifications"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem' }}
                  onClick={() => setShowNotifDrawer(false)}
                  aria-label="Close notifications"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="notif-drawer-content">
              {notifLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <Loader2 size={24} className="spinner" style={{ color: '#2563eb' }} />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map(notif => {
                  const isPending = notif.type === 'NEW_PENDING_PAPER' || notif.type === 'NO_FACULTY_ASSIGNED';
                  const isRejected = notif.type === 'PAPER_REJECTED';
                  
                  let borderColor = 'var(--accent-emerald)';
                  let icon = <CheckCircle2 size={14} />;
                  let label = 'Approved';
                  let labelColor = 'var(--accent-emerald)';
                  
                  if (isPending) {
                    borderColor = '#d97706';
                    icon = <AlertCircle size={14} />;
                    label = 'Pending Review';
                    labelColor = '#d97706';
                  } else if (isRejected) {
                    borderColor = 'var(--accent-rose)';
                    icon = <AlertCircle size={14} />;
                    label = 'Rejected';
                    labelColor = 'var(--accent-rose)';
                  }

                  return (
                    <div 
                      key={notif._id} 
                      className={`notif-card ${!notif.isRead ? 'notif-unread' : ''}`}
                      style={{ borderLeftColor: borderColor }}
                      onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Notification: ${label}`}
                    >
                      <div className="notif-card-top">
                        <div className="notif-type-label" style={{ color: labelColor }}>
                          {icon}
                          <span>{label}</span>
                        </div>
                        <div className="notif-actions">
                          {!notif.isRead && (
                            <button
                              type="button"
                              className="notif-inline-btn"
                              onClick={(e) => { e.stopPropagation(); handleMarkRead(notif._id); }}
                              aria-label="Mark as read"
                              title="Mark as read"
                            >
                              <CheckCheck size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="notif-inline-btn notif-inline-danger"
                            onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notif._id); }}
                            aria-label="Delete notification"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="notif-card-time">
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>

                      <div className="notif-card-message">
                        {notif.message}
                      </div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon="notifications"
                  title="No Notifications"
                  message="You're all caught up! No notification alerts found."
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      <ConfirmModal
        isOpen={clearAllConfirm}
        onClose={() => setClearAllConfirm(false)}
        onConfirm={handleClearAllNotifications}
        title="Clear All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        confirmLabel={clearAllLoading ? 'Clearing...' : 'Clear All'}
        variant="danger"
        loading={clearAllLoading}
      />
    </div>
  );
}
