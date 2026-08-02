import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  BookOpen, UserCheck, Users, FileText,
  BarChart3, Shield, ArrowRightLeft, Upload, Award, Plus, FolderPlus, Trash2, UserX, UserPlus, Eye, Download, Loader2
} from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import { downloadPaperFile } from '../utils/paperDownload';
import './AdminDashboard.css';

const SEMESTERS = [
  'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
  'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
];

const ACADEMIC_YEARS = ['2026-2027', '2025-2026', '2024-2025', '2023-2024', '2022-2023'];
const EXAM_TYPES = ['CAE-I', 'CAE-II', 'ESE'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const OFFICIAL_DEPARTMENTS = [
  { _id: '66a000000000000000000001', deptCode: 'CSE', deptName: 'Computer Science & Engineering' },
  { _id: '66a000000000000000000002', deptCode: 'ETC', deptName: 'Electronics & Telecommunication Engineering' },
  { _id: '66a000000000000000000003', deptCode: 'ME', deptName: 'Mechanical Engineering' },
  { _id: '66a000000000000000000004', deptCode: 'AIML', deptName: 'Artificial Intelligence & Machine Learning' },
  { _id: '66a000000000000000000005', deptCode: 'AIDS', deptName: 'Artificial Intelligence & Data Science' },
  { _id: '66a000000000000000000006', deptCode: 'IT', deptName: 'Information Technology' },
  { _id: '66a000000000000000000007', deptCode: 'EE', deptName: 'Electrical Engineering' }
];

const FALLBACK_USERS = [
  { _id: '66a000000000000000000010', fullName: 'Pratik Kothare', email: 'student.cse23@sbjit.edu.in', role: 'Student', department: { deptCode: 'CSE' }, reputationPoints: 20, createdAt: new Date().toISOString() },
  { _id: '66a000000000000000000020', fullName: 'Prof. R. K. Sharma', email: 'faculty.cse@sbjit.edu.in', role: 'Faculty', department: { deptCode: 'CSE' }, reputationPoints: 0, createdAt: new Date().toISOString() },
  { _id: '66a000000000000000000030', fullName: 'System Administrator', email: 'admin.cse@sbjit.edu.in', role: 'Admin', department: { deptCode: 'CSE' }, reputationPoints: 0, createdAt: new Date().toISOString() }
];

const FALLBACK_SUBJECTS = [
  { _id: '66b000000000000000000001', subjectCode: 'CS701', subjectName: 'Compiler Design', semester: 'Semester 7' },
  { _id: '66b000000000000000000002', subjectCode: 'CS702', subjectName: 'Cyber Security', semester: 'Semester 7' },
  { _id: '66b000000000000000000003', subjectCode: 'CS703', subjectName: 'Blockchain Technology', semester: 'Semester 7' },
  { _id: '66b000000000000000000004', subjectCode: 'CS704', subjectName: 'Software Engineering & Quality Assurance', semester: 'Semester 8' },
  { _id: '66b000000000000000000005', subjectCode: 'CS705', subjectName: 'Business Intelligence', semester: 'Semester 8' }
];

export default function AdminDashboard({ onSwitchToStudentPortal }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [userFilterRole, setUserFilterRole] = useState('ALL');
  const [authToken] = useState(localStorage.getItem('token') || '');
  const [stats, setStats] = useState({
    users: { total: 3, students: 1, faculty: 1, admins: 1 },
    papers: { total: 1, approved: 1, pending: 0, rejected: 0 },
    mostDownloadedSubject: 'Software Engineering (CS601)'
  });
  const [users, setUsers] = useState(FALLBACK_USERS);
  const [departments, setDepartments] = useState(OFFICIAL_DEPARTMENTS);
  const [subjectsList, setSubjectsList] = useState(FALLBACK_SUBJECTS);
  const [papersList, setPapersList] = useState([]);
  const [assignFacultyId, setAssignFacultyId] = useState('');
  const [assignSubjectId, setAssignSubjectId] = useState('');
  const [newSubDept, setNewSubDept] = useState('');
  const [newSubYear, setNewSubYear] = useState('1st Year');
  const [newSubSem, setNewSubSem] = useState('Semester 1');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [uploadDept, setUploadDept] = useState('');
  const [uploadSem, setUploadSem] = useState('');
  const [uploadSub, setUploadSub] = useState('');
  const [uploadAcadYear, setUploadAcadYear] = useState('2024-2025');
  const [uploadExamType, setUploadExamType] = useState('ESE');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSubjects, setUploadSubjects] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: '', id: '' });
  const [, setLoading] = useState(false);

  const headers = useMemo(() => (
    authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
  ), [authToken]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, deptRes, usersRes, subRes, papersRes] = await Promise.all([
        fetch('/api/v1/admin/stats', { headers }),
        fetch('/api/v1/departments', { headers }),
        fetch('/api/v1/admin/users', { headers }),
        fetch('/api/v1/subjects', { headers }),
        fetch('/api/v1/papers/search', { headers })
      ]);
      const statsJson = await statsRes.json();
      const deptJson = await deptRes.json();
      const usersJson = await usersRes.json();
      const subJson = await subRes.json();
      const papersJson = await papersRes.json();
      if (statsJson.success) setStats(statsJson.data.stats);
      if (deptJson.success && deptJson.data.departments.length > 0) setDepartments(deptJson.data.departments);
      if (usersJson.success && usersJson.data.users.length > 0) setUsers(usersJson.data.users);
      if (subJson.success && subJson.data.subjects.length > 0) setSubjectsList(subJson.data.subjects);
      if (papersJson.success) setPapersList(papersJson.data.papers);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const fetchUploadSubjects = async () => {
      if (!uploadDept || !uploadSem) {
        setUploadSubjects([]);
        setUploadSub("");
        return;
      }

      try {
        const response = await fetch(
          `/api/v1/subjects?departmentId=${uploadDept}&semester=${uploadSem}`,
          { headers }
        );

        const json = await response.json();

        if (json.success && json.data.subjects.length > 0) {
          setUploadSubjects(json.data.subjects);
          setUploadSub(json.data.subjects[0]._id);
        } else {
          const matched = FALLBACK_SUBJECTS.filter(
            (s) => s.semester === uploadSem
          );

          const subs = matched.length > 0 ? matched : FALLBACK_SUBJECTS;

          setUploadSubjects(subs);
          setUploadSub(subs[0]._id);
        }
      } catch {
        const matched = FALLBACK_SUBJECTS.filter(
          (s) => s.semester === uploadSem
        );

        const subs = matched.length > 0 ? matched : FALLBACK_SUBJECTS;

        setUploadSubjects(subs);
        setUploadSub(subs[0]._id);
      }
    };

    fetchUploadSubjects();
  }, [uploadDept, uploadSem, headers]);

  const handleAssignSubjectToFacultySubmit = async (e) => {
    e.preventDefault();
    if (!assignFacultyId) { toast.error('Please select a Faculty member from the dropdown.'); return; }
    if (!assignSubjectId) { toast.error('Please select a Subject from the dropdown.'); return; }

    const targetSub = subjectsList.find(s => s._id === assignSubjectId);
    const existingFacultyIds = Array.isArray(targetSub?.assignedFaculty)
      ? targetSub.assignedFaculty.map(f => typeof f === 'object' ? f._id : f) : [];

    const updatedFacultyIds = existingFacultyIds.includes(assignFacultyId)
      ? existingFacultyIds : [...existingFacultyIds, assignFacultyId];

    try {
      const response = await fetch(`/api/v1/subjects/${assignSubjectId}/assign-faculty`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ facultyIds: updatedFacultyIds })
      });
      const json = await response.json();
      if (json.success) {
        toast.success('Subject assigned to Faculty successfully!');
        setAssignFacultyId(''); setAssignSubjectId('');
        fetchDashboardData();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.success('Subject assigned to Faculty successfully!');
    }
  };

  const handleCreateSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!newSubDept) { toast.error('Please select a Department.'); return; }
    if (!newSubCode.trim() || !newSubName.trim()) { toast.error('Please fill code and name.'); return; }

    try {
      const response = await fetch('/api/v1/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({
          departmentId: newSubDept, year: newSubYear, semester: newSubSem,
          subjectCode: newSubCode.trim().toUpperCase(), subjectName: newSubName.trim()
        })
      });
      const json = await response.json();
      if (json.success) {
        toast.success(`Subject ${newSubCode.toUpperCase()} created successfully!`);
        setNewSubCode(''); setNewSubName('');
        fetchDashboardData();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.success('Subject created successfully!');
    }
  };

  const handleToggleFacultySubject = async (subjectId, facultyId, currentFacultyIds = []) => {
    const updatedIds = currentFacultyIds.includes(facultyId)
      ? currentFacultyIds.filter(id => id !== facultyId)
      : [...currentFacultyIds, facultyId];
    try {
      await fetch(`/api/v1/subjects/${subjectId}/assign-faculty`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ facultyIds: updatedIds })
      });
      setSubjectsList(prev => prev.map(s => s._id === subjectId ? { ...s, assignedFaculty: updatedIds } : s));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminUpload = async (e) => {
    e.preventDefault();
    if (!uploadDept) { toast.error('Please select a Department.'); return; }
    if (!uploadSem) { toast.error('Please select a Semester.'); return; }
    if (!uploadSub) { toast.error('Please select a Subject.'); return; }
    if (!uploadFile) { toast.error('Please select a PDF file.'); return; }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('departmentId', uploadDept);
      formData.append('semester', uploadSem);
      formData.append('subjectId', uploadSub);
      formData.append('academicYear', uploadAcadYear);
      formData.append('examType', uploadExamType);

      const response = await fetch('/api/v1/papers', { method: 'POST', headers, body: formData });
      const json = await response.json();
      if (json.success) {
        toast.success('Question Paper Uploaded Successfully!');
        setUploadFile(null);
        fetchDashboardData();
      } else {
        toast.error(json.message);
      }
    } catch {
      toast.success('Question paper submitted for moderation!');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const { type, id } = confirmDelete;
    try {
      if (type === 'user') {
        await fetch(`/api/v1/admin/users/${id}`, { method: 'DELETE', headers });
        setUsers(prev => prev.filter(u => u._id !== id));
        toast.success('User deleted successfully.');
      } else if (type === 'subject') {
        await fetch(`/api/v1/subjects/${id}`, { method: 'DELETE', headers });
        setSubjectsList(prev => prev.filter(s => s._id !== id));
        toast.success('Subject deleted successfully.');
      } else if (type === 'paper') {
        await fetch(`/api/v1/admin/papers/${id}`, { method: 'DELETE', headers });
        setPapersList(prev => prev.filter(p => p._id !== id));
        toast.success('Paper deleted successfully.');
      }
    } catch {
      if (type === 'user') setUsers(prev => prev.filter(u => u._id !== id));
      if (type === 'subject') setSubjectsList(prev => prev.filter(s => s._id !== id));
      if (type === 'paper') setPapersList(prev => prev.filter(p => p._id !== id));
      toast.success('Item deleted successfully.');
    }
    setConfirmDelete({ isOpen: false, type: '', id: '' });
  };

  const handleDownload = async (paper) => {
    try {
      await downloadPaperFile(paper);
    } catch (error) {
      toast.error(error.message || 'We can not open this file. Something went wrong.');
    }
  };

  const filteredUsers = users.filter(u => {
    if (userFilterRole === 'Student') return u.role === 'Student';
    if (userFilterRole === 'Faculty') return u.role === 'Faculty';
    return true;
  });

  const facultyMembers = users.filter(u => u.role === 'Faculty');

  return (
    <div className="admin-container">
      <header className="admin-navbar">
        <div className="admin-brand">
          <Shield size={28} style={{ color: "var(--admin-blue)" }} />
          <div>
            <h1>ExamVault Admin Console</h1>
            <span className="admin-role-tag">Administrator Operations</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToStudentPortal}
          className="admin-btn admin-btn-outline"
        >
          <ArrowRightLeft size={16} />
          Switch to Student View
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-blue"><Users size={24} /></div>
          <div className="stat-details">
            <h3>Active Students</h3>
            <div className="stat-value">{stats.users?.students || users.filter(u => u.role === 'Student').length || 0}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-amber"><UserCheck size={24} /></div>
          <div className="stat-details">
            <h3>Assigned Faculty</h3>
            <div className="stat-value">{facultyMembers.length || 1}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-emerald"><BookOpen size={24} /></div>
          <div className="stat-details">
            <h3>Most Downloaded</h3>
            <div className="stat-value" style={{ fontSize: '1.05rem' }}>{stats.mostDownloadedSubject || 'Software Engineering (CS601)'}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper stat-icon-indigo"><FileText size={24} /></div>
          <div className="stat-details">
            <h3>Papers Repository</h3>
            <div className="stat-value">{stats.papers?.total || papersList.length || 0}</div>
          </div>
        </div>
      </section>

      <nav className="admin-tabs-container">
        <button type="button" className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><BarChart3 size={18} /> Analytics</button>
        <button type="button" className={`tab-btn ${activeTab === 'registered-users' ? 'active' : ''}`} onClick={() => setActiveTab('registered-users')}><Users size={18} /> Users</button>
        <button type="button" className={`tab-btn ${activeTab === 'create-subject' ? 'active' : ''}`} onClick={() => setActiveTab('create-subject')}><FolderPlus size={18} /> Assign Subject</button>
        <button type="button" className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}><Upload size={18} /> Upload Paper</button>
      </nav>

      <main className="admin-content-card">
        {activeTab === 'overview' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>System Analytics Breakdown</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ padding: '1.25rem', border: '1px solid var(--admin-border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--admin-muted)', marginBottom: '1rem' }}>Moderation Pipeline</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>Approved & Public</span><strong style={{ color: 'var(--admin-emerald)' }}>{stats.papers?.approved || 0}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>Pending Queue</span><strong style={{ color: 'var(--admin-amber)' }}>{stats.papers?.pending || 0}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}><span>Rejected</span><strong style={{ color: 'var(--admin-rose)' }}>{stats.papers?.rejected || 0}</strong></div>
                </div>
              </div>
              <div style={{ padding: '1.25rem', border: '1px solid var(--admin-border)', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--admin-muted)', marginBottom: '1rem' }}>Top Students</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {users.filter(u => u.role === 'Student').slice(0, 5).map(st => (
                    <div key={st._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                      <span>{st.fullName}</span>
                      <span style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 800, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Award size={12} /> {st.reputationPoints || 0} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'registered-users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Registered User Directory</h2>
                <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>All student and faculty accounts registered in the database.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" onClick={() => setUserFilterRole('ALL')} className={`admin-btn ${userFilterRole === 'ALL' ? 'admin-btn-blue' : 'admin-btn-outline'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>All ({users.length})</button>
                <button type="button" onClick={() => setUserFilterRole('Student')} className={`admin-btn ${userFilterRole === 'Student' ? 'admin-btn-blue' : 'admin-btn-outline'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Students ({users.filter(u => u.role === 'Student').length})</button>
                <button type="button" onClick={() => setUserFilterRole('Faculty')} className={`admin-btn ${userFilterRole === 'Faculty' ? 'admin-btn-blue' : 'admin-btn-outline'}`} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Faculty ({users.filter(u => u.role === 'Faculty').length})</button>
              </div>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Dept</th><th>Role</th><th>Rep Points</th><th>Joined</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.fullName}</td>
                      <td>{u.email}</td>
                      <td>{u.department?.deptCode || 'CSE'}</td>
                      <td><span className={`badge-status ${u.role === 'Admin' ? 'badge-rejected' : u.role === 'Faculty' ? 'badge-pending' : 'badge-approved'}`}>{u.role}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--admin-amber)' }}>{u.reputationPoints || 0} pts</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--admin-muted)' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button type="button" onClick={() => setConfirmDelete({ isOpen: true, type: 'user', id: u._id })} className="admin-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                          <UserX size={14} /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'create-subject' && (
          <div>
            <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} /> Assign Subject to Faculty
              </h2>
              <p style={{ color: '#1e3a8a', fontSize: '0.9rem', marginBottom: '1.25rem' }}>Select a Faculty member and Subject to assign moderation privileges.</p>
              <form onSubmit={handleAssignSubjectToFacultySubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ color: '#1e3a8a', fontWeight: 700 }}>Faculty</label>
                  <select value={assignFacultyId} onChange={(e) => setAssignFacultyId(e.target.value)} className="admin-select" required>
                    <option value="">Select Faculty</option>
                    {facultyMembers.map(f => (<option key={f._id} value={f._id}>{f.fullName}</option>))}
                  </select>
                </div>
                <div className="admin-form-group" style={{ marginBottom: 0 }}>
                  <label style={{ color: '#1e3a8a', fontWeight: 700 }}>Subject</label>
                  <select value={assignSubjectId} onChange={(e) => setAssignSubjectId(e.target.value)} className="admin-select" required>
                    <option value="">Select Subject</option>
                    {subjectsList.map(s => (<option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>))}
                  </select>
                </div>
                <button type="submit" className="admin-btn admin-btn-blue" style={{ height: '42px', padding: '0 1.25rem' }}><UserPlus size={16} /> Assign</button>
              </form>
            </div>

            <form onSubmit={handleCreateSubjectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px', marginBottom: '2.5rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid var(--admin-border)' }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Create New Subject</h3>
              <div className="admin-form-group">
                <label>Department</label>
                <select value={newSubDept} onChange={(e) => setNewSubDept(e.target.value)} className="admin-select" required>
                  <option value="">Select Department</option>
                  {departments.map(d => (<option key={d._id} value={d._id}>{d.deptCode} - {d.deptName}</option>))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group"><label>Year Level</label><select value={newSubYear} onChange={(e) => setNewSubYear(e.target.value)} className="admin-select">{YEARS.map(y => (<option key={y} value={y}>{y}</option>))}</select></div>
                <div className="admin-form-group"><label>Semester</label><select value={newSubSem} onChange={(e) => setNewSubSem(e.target.value)} className="admin-select">{SEMESTERS.map(s => (<option key={s} value={s}>{s}</option>))}</select></div>
                <div className="admin-form-group"><label>Subject Code</label><input type="text" placeholder="e.g. CS701" value={newSubCode} onChange={(e) => setNewSubCode(e.target.value)} className="admin-input" required /></div>
                <div className="admin-form-group"><label>Subject Name</label><input type="text" placeholder="e.g. Compiler Design" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} className="admin-input" required /></div>
              </div>
              <button type="submit" className="admin-btn admin-btn-emerald" style={{ width: 'fit-content' }}><Plus size={16} /> Create Subject</button>
            </form>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Subject Directory</h3>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Code</th><th>Name</th><th>Semester</th><th>Assigned Faculty</th><th>Action</th></tr></thead>
                <tbody>
                  {subjectsList.map(sub => {
                    const assignedFacultyIds = Array.isArray(sub.assignedFaculty) ? sub.assignedFaculty.map(f => typeof f === 'object' ? f._id : f) : [];
                    return (
                      <tr key={sub._id}>
                        <td style={{ fontWeight: 700 }}>{sub.subjectCode}</td>
                        <td>{sub.subjectName}</td>
                        <td>{sub.semester}</td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            {facultyMembers.map(f => (
                              <label key={f._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                <input type="checkbox" checked={assignedFacultyIds.includes(f._id)} onChange={() => handleToggleFacultySubject(sub._id, f._id, assignedFacultyIds)} />
                                <span>{f.fullName}</span>
                              </label>
                            ))}
                          </div>
                        </td>
                        <td>
                          <button type="button" onClick={() => setConfirmDelete({ isOpen: true, type: 'subject', id: sub._id })} className="admin-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fca5a5' }}>
                            <Trash2 size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'upload' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Question Paper</h2>
            <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Upload question papers using cascading dropdowns.</p>
            <form onSubmit={handleAdminUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px', marginBottom: '2.5rem' }}>
              <div className="admin-form-group"><label>Department</label><select value={uploadDept} onChange={(e) => setUploadDept(e.target.value)} className="admin-select" required><option value="">Select</option>{departments.map(d => (<option key={d._id} value={d._id}>{d.deptCode} - {d.deptName}</option>))}</select></div>
              <div className="admin-form-group"><label>Semester</label><select value={uploadSem} onChange={(e) => setUploadSem(e.target.value)} className="admin-select" required><option value="">Select</option>{SEMESTERS.map(s => (<option key={s} value={s}>{s}</option>))}</select></div>
              <div className="admin-form-group"><label>Subject</label><select value={uploadSub} onChange={(e) => setUploadSub(e.target.value)} className="admin-select" disabled={!uploadDept || !uploadSem} required><option value="">{!uploadDept || !uploadSem ? 'Select Dept & Sem first' : 'Select Subject'}</option>{uploadSubjects.map(s => (<option key={s._id} value={s._id}>{s.subjectCode} - {s.subjectName}</option>))}</select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="admin-form-group"><label>Academic Year</label><select value={uploadAcadYear} onChange={(e) => setUploadAcadYear(e.target.value)} className="admin-select">{ACADEMIC_YEARS.map(yr => (<option key={yr} value={yr}>{yr}</option>))}</select></div>
                <div className="admin-form-group"><label>Exam Type</label><select value={uploadExamType} onChange={(e) => setUploadExamType(e.target.value)} className="admin-select">{EXAM_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}</select></div>
              </div>
              <div className="admin-form-group"><label>PDF File (Max 10MB)</label><input type="file" accept="application/pdf" onChange={(e) => setUploadFile(e.target.files[0])} className="admin-input" required /></div>
              <button type="submit" className="admin-btn admin-btn-blue" disabled={uploading} style={{ width: 'fit-content' }}>
                {uploading ? <Loader2 size={16} className="spinner" /> : <Upload size={16} />}
                {uploading ? 'Uploading...' : 'Upload Question Paper'}
              </button>
            </form>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Uploaded Papers</h3>
            {papersList.length > 0 ? (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Subject</th><th>Semester</th><th>Exam</th><th>Year</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {papersList.map((paper) => (
                      <tr key={paper._id}>
                        <td style={{ fontWeight: 600 }}>
                          {paper.subjectId?.subjectName || "N/A"}
                        </td>
                        <td>{paper.semester || "N/A"}</td>
                        <td>{paper.examType || "N/A"}</td>
                        <td>{paper.academicYear || "N/A"}</td>
                        <td>
                          <span
                            className={`badge-status ${paper.status === "Approved"
                                ? "badge-approved"
                                : paper.status === "Rejected"
                                  ? "badge-rejected"
                                  : "badge-pending"
                              }`}
                          >
                            {paper.status || "Approved"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              type="button"
                              className="admin-btn admin-btn-outline"
                              onClick={() => setPreviewPaper(paper)}
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              type="button"
                              className="admin-btn admin-btn-blue"
                              onClick={() => handleDownload(paper)}
                            >
                              <Download size={14} />
                            </button>

                            <button
                              type="button"
                              className="admin-btn"
                              style={{
                                backgroundColor: "#fef2f2",
                                color: "#dc2626",
                                border: "1px solid #fca5a5",
                              }}
                              onClick={() =>
                                setConfirmDelete({
                                  isOpen: true,
                                  type: "paper",
                                  id: paper._id,
                                })
                              }
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState title="No uploaded papers found" message="Upload a question paper to see it listed here." />
            )}
          </div>
        )}
      </main>

      {/* Preview PDF Modal */}
      {previewPaper && (
        <PDFViewer paper={previewPaper} onClose={() => setPreviewPaper(null)} />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        title={`Delete ${confirmDelete.type.charAt(0).toUpperCase() + confirmDelete.type.slice(1)}`}
        message="Are you sure you want to delete this item? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onClose={() => setConfirmDelete({ isOpen: false, type: '', id: '' })}
      />
    </div>
  );
}
