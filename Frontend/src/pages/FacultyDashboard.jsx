import React, { useState, useEffect } from 'react';
import { 
  UserCheck, FileText, CheckCircle2, AlertCircle, Eye, Download, 
  ArrowRightLeft, Layers, Calendar, User, MessageSquare, Check, X, ShieldAlert
} from 'lucide-react';
import './FacultyDashboard.css';

const MOCK_PENDING = [
  {
    _id: 'pending-1',
    uploadedBy: { fullName: 'Pratik Kothare', email: 'student.cse23@sbjit.edu.in' },
    subjectId: { subjectCode: 'CS701', subjectName: 'Compiler Design', semester: 'Semester 7' },
    departmentId: { deptCode: 'CSE', deptName: 'Computer Science & Engineering' },
    academicYear: '2024-2025',
    paperYear: '2024',
    examType: 'ESE',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/examvault/mock.pdf',
    createdAt: new Date().toISOString()
  }
];

const MOCK_APPROVED = [
  {
    _id: 'approved-1',
    uploadedBy: { fullName: 'Jane Student', email: 'jane.student@sbjit.edu.in' },
    subjectId: { subjectCode: 'CS702', subjectName: 'Cyber Security', semester: 'Semester 7' },
    departmentId: { deptCode: 'CSE', deptName: 'Computer Science & Engineering' },
    academicYear: '2024-2025',
    paperYear: '2024',
    examType: 'CAE-I',
    fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1/examvault/mock2.pdf',
    verificationComments: 'Verified from official department copy',
    updatedAt: new Date().toISOString()
  }
];

export default function FacultyDashboard({ onSwitchToStudentPortal }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '');
  const [pendingPapers, setPendingPapers] = useState(MOCK_PENDING);
  const [approvedPapers, setApprovedPapers] = useState(MOCK_APPROVED);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [isUsingMock, setIsUsingMock] = useState(true);

  // Approval/Rejection Modal & State
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [commentText, setCommentText] = useState('Verified from official department copy');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Sync token
  useEffect(() => {
    if (authToken) {
      localStorage.setItem('token', authToken);
    }
  }, [authToken]);

  // Fetch Moderation Queue on mount
  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const headers = authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
        const [pendingRes, approvedRes] = await Promise.all([
          fetch('/api/v1/papers/faculty/pending', { headers }),
          fetch('/api/v1/papers/faculty/approved', { headers })
        ]);

        const pendingJson = await pendingRes.json();
        const approvedJson = await approvedRes.json();

        if (pendingJson.success) {
          setPendingPapers(pendingJson.data.papers);
          setIsUsingMock(false);
        }
        if (approvedJson.success) {
          setApprovedPapers(approvedJson.data.papers);
        }
      } catch (err) {
        setIsUsingMock(true);
      }
    };
    fetchQueue();
  }, [authToken]);

  // Handle Approve Action
  const handleApprove = async (paper) => {
    const note = commentText || 'Verified from official department copy';

    setPendingPapers(prev => prev.filter(p => p._id !== paper._id));
    setApprovedPapers(prev => [{ ...paper, verificationComments: note }, ...prev]);

    if (!isUsingMock && authToken) {
      try {
        await fetch(`/api/v1/papers/${paper._id}/verify`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify({
            action: 'Approved',
            comments: note
          })
        });
      } catch (e) {
        console.error('Approve dispatch error:', e);
      }
    }
  };

  // Handle Reject Action
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      alert('Please enter structured rejection feedback with at least 10 characters.');
      return;
    }

    if (selectedPaper) {
      setPendingPapers(prev => prev.filter(p => p._id !== selectedPaper._id));

      if (!isUsingMock && authToken) {
        try {
          await fetch(`/api/v1/papers/${selectedPaper._id}/verify`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              action: 'Rejected',
              rejectionReason: rejectionReason.trim()
            })
          });
        } catch (e) {
          console.error('Reject dispatch error:', e);
        }
      }
    }

    setShowRejectModal(false);
    setSelectedPaper(null);
    setRejectionReason('');
  };

  // Download Handler
  const handleDownload = (paper) => {
    const downloadUrl = `/api/v1/papers/${paper._id}/download`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="faculty-container">
      {/* Faculty Navbar */}
      <header className="faculty-navbar">
        <div className="faculty-brand">
          <UserCheck size={28} style={{ color: 'var(--faculty-blue)' }} />
          <div>
            <h1>Faculty Verification Portal</h1>
            <span className="faculty-role-tag">Subject Moderator</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={onSwitchToStudentPortal}
          className="faculty-btn faculty-btn-outline"
        >
          <ArrowRightLeft size={16} />
          Switch to Student View
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="faculty-tabs-container">
        <button 
          type="button" 
          className={`faculty-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <AlertCircle size={18} />
          Pending Verification ({pendingPapers.length})
        </button>

        <button 
          type="button" 
          className={`faculty-tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <CheckCircle2 size={18} />
          Verified Archives ({approvedPapers.length})
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="faculty-content-card">
        {activeTab === 'pending' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Subject Assigned Verification Queue</h2>
            <p style={{ color: 'var(--faculty-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Review student uploaded PDF documents for your assigned subjects before making them globally visible.
            </p>

            {pendingPapers.length > 0 ? (
              <div className="moderation-grid">
                {pendingPapers.map(paper => (
                  <div key={paper._id} className="moderation-card">
                    <div>
                      <div className="uploader-badge">
                        <User size={14} />
                        <span>Uploaded by: <strong>{paper.uploadedBy?.fullName}</strong></span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
                        {paper.subjectId?.subjectName} ({paper.subjectId?.subjectCode})
                      </h3>

                      <div style={{ fontSize: '0.85rem', color: 'var(--faculty-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Layers size={14} />
                          <span>{paper.departmentId?.deptCode} • {paper.semester}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} />
                          <span>{paper.examType} (Session {paper.academicYear})</span>
                        </div>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--faculty-muted)' }}>
                          Faculty Verification Note
                        </label>
                        <input 
                          type="text" 
                          className="comment-input"
                          defaultValue="Verified from official department copy"
                          onChange={(e) => setCommentText(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <button 
                          type="button" 
                          onClick={() => setPreviewPaper(paper)}
                          className="faculty-btn faculty-btn-outline"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          <Eye size={14} /> Preview
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDownload(paper)}
                          className="faculty-btn faculty-btn-outline"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          <Download size={14} /> Download
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        <button 
                          type="button" 
                          onClick={() => handleApprove(paper)}
                          className="faculty-btn faculty-btn-emerald"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          <Check size={16} /> Approve
                        </button>
                        <button 
                          type="button" 
                          onClick={() => {
                            setSelectedPaper(paper);
                            setShowRejectModal(true);
                          }}
                          className="faculty-btn faculty-btn-rose"
                          style={{ width: '100%', justifyContent: 'center' }}
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--faculty-muted)' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--faculty-emerald)', marginBottom: '1rem', strokeWidth: 1.5 }} />
                <h3>Moderation Queue Clear!</h3>
                <p>All pending papers for your assigned subjects have been verified.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Verified Archives</h2>
            <p style={{ color: 'var(--faculty-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Previously approved question papers currently live on the platform.
            </p>

            <div className="moderation-grid">
              {approvedPapers.map(paper => (
                <div key={paper._id} className="moderation-card">
                  <div>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
                      {paper.subjectId?.subjectName} ({paper.subjectId?.subjectCode})
                    </h3>

                    <div style={{ fontSize: '0.85rem', color: 'var(--faculty-muted)', display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Layers size={14} />
                        <span>{paper.departmentId?.deptCode} • {paper.semester}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Calendar size={14} />
                        <span>{paper.examType} (Session {paper.academicYear})</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid var(--faculty-emerald)' }}>
                      <strong>Verification Note:</strong> {paper.verificationComments || 'Verified from official department copy'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setPreviewPaper(paper)}
                      className="faculty-btn faculty-btn-outline"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Eye size={14} /> Preview
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDownload(paper)}
                      className="faculty-btn faculty-btn-blue"
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      <Download size={14} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div className="preview-modal" style={{ height: 'auto', maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={20} style={{ color: 'var(--faculty-rose)' }} />
                <span>Reject Submission</span>
              </h3>
              <button 
                type="button" 
                className="faculty-btn faculty-btn-outline" 
                style={{ padding: '0.35rem 0.65rem' }}
                onClick={() => setShowRejectModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--faculty-muted)', marginBottom: '1rem' }}>
                Provide mandatory feedback to student: <strong>{selectedPaper?.uploadedBy?.fullName}</strong> for subject <strong>{selectedPaper?.subjectId?.subjectName}</strong>.
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Mandatory Rejection Feedback (Min 10 characters)
                </label>
                <textarea 
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Unclear scan. Question 3 is cut off at the bottom margin."
                  className="comment-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowRejectModal(false)}
                  className="faculty-btn faculty-btn-outline"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="faculty-btn faculty-btn-rose"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Inline Preview Modal */}
      {previewPaper && (
        <div className="modal-backdrop" onClick={() => setPreviewPaper(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <div className="preview-header-title">
                <h3 style={{ margin: 0 }}>{previewPaper.subjectId?.subjectName} ({previewPaper.subjectId?.subjectCode})</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--faculty-muted)' }}>
                  {previewPaper.departmentId?.deptCode} • {previewPaper.semester} • {previewPaper.examType} (Session {previewPaper.academicYear})
                </span>
              </div>
              <button 
                type="button" 
                className="faculty-btn faculty-btn-outline" 
                style={{ padding: '0.35rem 0.65rem' }}
                onClick={() => setPreviewPaper(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="preview-content">
              <iframe 
                src={previewPaper.fileUrl} 
                title="Paper Preview" 
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
