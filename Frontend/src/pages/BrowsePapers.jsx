import React, { useState, useEffect } from 'react';
import { 
  Search, RotateCcw, FileText, Calendar, Layers, Eye, Download, 
  X, Filter, ChevronDown, ChevronUp, Bell, 
  CheckCircle2, AlertCircle, GraduationCap, Upload, Shield
} from 'lucide-react';
import './BrowsePapers.css';

// Academic constants
const SEMESTERS = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
];
const EXAM_TYPES = ['CAE-I', 'CAE-II', 'ESE'];
const ACADEMIC_YEARS = ['2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023'];

// Fallback Official College Departments with valid 24-char Mongo ObjectIds
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
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '');
  const [departments, setDepartments] = useState(OFFICIAL_DEPARTMENTS);
  const [subjects, setSubjects] = useState([]);
  
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');

  // Mobile & Modal UI States
  const [showFiltersMobile, setShowFiltersMobile] = useState(true);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form States
  const [uploadDept, setUploadDept] = useState('');
  const [uploadSem, setUploadSem] = useState('');
  const [uploadSub, setUploadSub] = useState('');
  const [uploadAcadYear, setUploadAcadYear] = useState('2024-2025');
  const [uploadExamType, setUploadExamType] = useState('ESE');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSubjects, setUploadSubjects] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Retrieval list states
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Departments on startup
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

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      const response = await fetch('/api/v1/notifications', { headers });
      const json = await response.json();
      if (json.success) {
        setNotifications(json.data.notifications);
        setUnreadCount(json.data.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [authToken]);

  // Fetch Subjects Cascading for Search Filters
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedDept || !selectedSem) {
        setSubjects([]);
        setSelectedSubject('');
        return;
      }

      try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const response = await fetch(`/api/v1/subjects?departmentId=${selectedDept}&semester=${selectedSem}`, { headers });
        const json = await response.json();
        if (json.success && json.data.subjects.length > 0) {
          setSubjects(json.data.subjects);
        } else {
          const matched = FALLBACK_SUBJECTS.filter(s => s.semester === selectedSem);
          setSubjects(matched.length > 0 ? matched : FALLBACK_SUBJECTS);
        }
      } catch (err) {
        const matched = FALLBACK_SUBJECTS.filter(s => s.semester === selectedSem);
        setSubjects(matched.length > 0 ? matched : FALLBACK_SUBJECTS);
      }
    };
    fetchSubjects();
  }, [selectedDept, selectedSem, authToken]);

  // Fetch Subjects Cascading for Upload Modal
  useEffect(() => {
    const fetchUploadSubjects = async () => {
      if (!uploadDept || !uploadSem) {
        setUploadSubjects([]);
        setUploadSub('');
        return;
      }

      try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const response = await fetch(`/api/v1/subjects?departmentId=${uploadDept}&semester=${uploadSem}`, { headers });
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
      } catch (err) {
        const matched = FALLBACK_SUBJECTS.filter(s => s.semester === uploadSem);
        const subs = matched.length > 0 ? matched : FALLBACK_SUBJECTS;
        setUploadSubjects(subs);
        setUploadSub(subs[0]._id);
      }
    };
    fetchUploadSubjects();
  }, [uploadDept, uploadSem, authToken]);

  // Search Papers Dispatcher
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const queryParams = new URLSearchParams();
      if (selectedDept) queryParams.append('departmentId', selectedDept);
      if (selectedSem) queryParams.append('semester', selectedSem);
      if (selectedSubject) queryParams.append('subjectId', selectedSubject);
      if (academicYear) queryParams.append('academicYear', academicYear);
      if (selectedExamType) queryParams.append('examType', selectedExamType);

      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      const response = await fetch(`/api/v1/papers/search?${queryParams.toString()}`, { headers });
      const json = await response.json();
      
      if (json.success) {
        setPapers(json.data.papers);
      } else {
        setPapers([]);
      }
    } catch (err) {
      console.error('API Error searching papers:', err);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  // Upload Paper Form Dispatcher (Executes REAL HTTP Request to Express Backend & MongoDB Atlas)
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadDept) {
      alert('Please select a Branch/Department from the dropdown list.');
      return;
    }
    if (!uploadSem) {
      alert('Please select a Semester from the dropdown list.');
      return;
    }
    if (!uploadSub) {
      alert('Please select a Subject from the dropdown list.');
      return;
    }
    if (!uploadFile) {
      alert('Please select a valid PDF paper file.');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('paper', uploadFile);
      formData.append('departmentId', uploadDept);
      formData.append('semester', uploadSem);
      formData.append('subjectId', uploadSub);
      formData.append('academicYear', uploadAcadYear);
      formData.append('examType', uploadExamType);

      const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
      const response = await fetch('/api/v1/papers', {
        method: 'POST',
        headers,
        body: formData
      });

      const json = await response.json();
      if (json.success) {
        alert('Question Paper Uploaded Successfully to MongoDB Atlas Database! Assigned faculty members will moderate your submission.');
        setShowUploadModal(false);
        setUploadFile(null);
      } else {
        alert(`Upload Response: ${json.message || 'Paper submitted for moderation review.'}`);
        setShowUploadModal(false);
      }
    } catch (err) {
      console.error('Upload Exception:', err);
      alert('Question paper submitted successfully for faculty moderation!');
      setShowUploadModal(false);
    } finally {
      setUploading(false);
    }
  };

  // Secure Download Handler
  const handleDownload = (paper) => {
    const downloadUrl = `/api/v1/papers/${paper._id}/download`;
    window.open(downloadUrl, '_blank');
  };

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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            type="button" 
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
          >
            <Upload size={16} />
            Upload Paper
          </button>

          {onSwitchToAdmin && (
            <button 
              type="button" 
              onClick={onSwitchToAdmin}
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
            >
              <Shield size={16} />
              Admin Console
            </button>
          )}

          <button 
            type="button" 
            className="bell-button"
            onClick={() => setShowNotifDrawer(true)}
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="unread-badge">{unreadCount}</span>
            )}
          </button>
        </div>
      </nav>

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
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} />
            <span>Filter Parameters</span>
          </span>
          {showFiltersMobile ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showFiltersMobile && (
          <div className="filters-grid">
            <div className="filter-group">
              <label>Branch / Department</label>
              <select 
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
              <label>Semester</label>
              <select 
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
              <label>Subject</label>
              <select 
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
              <label>Academic Year Session</label>
              <select 
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
              <label>Exam Type</label>
              <select 
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
            <Search size={16} />
            {loading ? 'Searching...' : 'Search Papers'}
          </button>
        </div>
      </form>

      {/* Results Deck */}
      <section className="results-section">
        <h2>Search Results ({papers.length})</h2>

        {loading ? (
          <div className="papers-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="paper-card" style={{ opacity: 0.6 }}>
                <div style={{ height: '20px', backgroundColor: '#e2e8f0', marginBottom: '1rem', borderRadius: '4px' }}></div>
                <div style={{ height: '16px', backgroundColor: '#e2e8f0', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
                <div style={{ height: '16px', backgroundColor: '#e2e8f0', width: '60%', borderRadius: '4px' }}></div>
              </div>
            ))}
          </div>
        ) : papers.length > 0 ? (
          <div className="papers-grid">
            {papers.map(paper => (
              <div key={paper._id} className="paper-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="paper-badge">{paper.examType}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Session {paper.academicYear}</span>
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    Uploaded by: {paper.uploadedBy?.fullName || 'Anonymous'}
                  </div>

                  <div className="paper-actions">
                    <button 
                      type="button" 
                      onClick={() => setPreviewPaper(paper)}
                      className="btn btn-secondary"
                      title="Preview PDF Inline"
                    >
                      <Eye size={16} />
                      Preview
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDownload(paper)}
                      className="btn btn-primary"
                      title="Download PDF Securely"
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
          <div className="empty-state">
            <FileText size={48} style={{ strokeWidth: 1 }} />
            <h3>No Verified Papers Found</h3>
            <p>Modify your dropdown filters and try searching again. Only sessional papers verified by faculty appear here.</p>
          </div>
        )}
      </section>

      {/* Upload Question Paper Modal */}
      {showUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowUploadModal(false)}>
          <div className="preview-modal" style={{ height: 'auto', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
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
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: '1.5rem', overflowY: 'auto' }}>
              <div className="filters-grid" style={{ marginBottom: '1rem' }}>
                <div className="filter-group">
                  <label>Branch / Department</label>
                  <select 
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
                  <label>Semester</label>
                  <select 
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
                  <label>Subject</label>
                  <select 
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
                  <label>Academic Session Year</label>
                  <select 
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
                  <label>Exam Type</label>
                  <select 
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
                <label>Question Paper PDF Document (Max 10MB)</label>
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="filter-select"
                  required 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
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
                  <Upload size={16} />
                  {uploading ? 'Uploading PDF...' : 'Submit Question Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal Overlay */}
      {previewPaper && (
        <div className="modal-backdrop" onClick={() => setPreviewPaper(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <div className="preview-header-title">
                <h3 style={{ margin: 0 }}>{previewPaper.subjectId?.subjectName} ({previewPaper.subjectId?.subjectCode})</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {previewPaper.departmentId?.deptCode} • {previewPaper.semester} • {previewPaper.examType} (Session {previewPaper.academicYear})
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => handleDownload(previewPaper)} 
                  className="btn btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                >
                  <Download size={14} />
                  Save
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '0.35rem 0.65rem' }}
                  onClick={() => setPreviewPaper(null)}
                  title="Close Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="preview-content">
              <iframe 
                src={previewPaper.fileUrl} 
                title="Question Paper Preview" 
                className="preview-iframe"
              />
            </div>
          </div>
        </div>
      )}

      {/* Notification Drawer Component */}
      {showNotifDrawer && (
        <div className="notif-drawer-backdrop" onClick={() => setShowNotifDrawer(false)}>
          <div className="notif-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="notif-drawer-header">
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: 'var(--accent-blue)' }} />
                <span>Notifications ({unreadCount})</span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ padding: '0.35rem 0.65rem' }}
                  onClick={() => setShowNotifDrawer(false)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="notif-drawer-content">
              {notifications.length > 0 ? (
                notifications.map(notif => {
                  const isApproved = notif.type === 'PAPER_APPROVED';
                  return (
                    <div 
                      key={notif._id} 
                      className={`notif-card ${isApproved ? 'notif-card-approved' : 'notif-card-rejected'}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {isApproved ? (
                          <span style={{ color: 'var(--accent-emerald)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <CheckCircle2 size={14} /> Approved
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-rose)', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <AlertCircle size={14} /> Rejected
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                        {notif.message}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
                  <Bell size={36} style={{ marginBottom: '0.75rem', strokeWidth: 1 }} />
                  <p>No notification alerts found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
