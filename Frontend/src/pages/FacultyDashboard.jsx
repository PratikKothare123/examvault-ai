import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowRightLeft,
  Bell,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  Download,
  Eye,
  Layers,
  Loader2,
  ShieldAlert,
  Trash2,
  User,
  UserCheck,
  X
} from 'lucide-react';
import PDFViewer from '../components/PDFViewer';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { downloadPaperFile, getPaperFileName } from '../utils/paperDownload';
import './FacultyDashboard.css';

export default function FacultyDashboard({ onSwitchToStudentPortal }) {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingPapers, setPendingPapers] = useState([]);
  const [approvedPapers, setApprovedPapers] = useState([]);
  const [previewPaper, setPreviewPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [commentByPaperId, setCommentByPaperId] = useState({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [clearAllLoading, setClearAllLoading] = useState(false);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || '';
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const jsonHeaders = useMemo(() => ({
    'Content-Type': 'application/json',
    ...getHeaders()
  }), [getHeaders]);

  const fetchNotifications = useCallback(async (signal) => {
    setNotifLoading(true);
    try {
      const response = await fetch('/api/v1/notifications', { headers: getHeaders(), signal });
      const json = await response.json();
      if (json.success) {
        const allNotifs = json.data.notifications || [];
        setNotifications(allNotifs);
        setUnreadCount(Number.isInteger(json.data.unreadCount)
          ? json.data.unreadCount
          : allNotifs.filter(n => !n.isRead).length);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Unable to load notifications.');
      }
    } finally {
      if (!signal?.aborted) setNotifLoading(false);
    }
  }, [getHeaders]);

  const fetchQueue = useCallback(async (signal) => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch('/api/v1/papers/faculty/pending', { headers: getHeaders(), signal }),
        fetch('/api/v1/papers/faculty/approved', { headers: getHeaders(), signal })
      ]);
      const pendingJson = await pendingRes.json();
      const approvedJson = await approvedRes.json();

      if (!pendingJson.success) throw new Error(pendingJson.message || 'Pending queue failed.');
      if (!approvedJson.success) throw new Error(approvedJson.message || 'Approved queue failed.');

      setPendingPapers(pendingJson.data.papers || []);
      setApprovedPapers(approvedJson.data.papers || []);
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error(error.message || 'Unable to load moderation queue.');
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [getHeaders]);

  useEffect(() => {
    const controller = new AbortController();
    fetchNotifications(controller.signal);
    fetchQueue(controller.signal);
    return () => controller.abort();
  }, [fetchNotifications, fetchQueue]);

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch('/api/v1/notifications/read-all', {
        method: 'PATCH',
        headers: getHeaders()
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.message);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      toast.error(error.message || 'Unable to mark notifications as read.');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      const response = await fetch(`/api/v1/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.message);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error(error.message || 'Unable to update notification.');
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const response = await fetch(`/api/v1/notifications/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.message);

      setNotifications(prev => {
        const target = prev.find(n => n._id === id);
        if (target && !target.isRead) setUnreadCount(count => Math.max(0, count - 1));
        return prev.filter(n => n._id !== id);
      });
      toast.success('Notification deleted');
    } catch (error) {
      toast.error(error.message || 'Unable to delete notification.');
    }
  };

  const handleClearAllNotifications = async () => {
    setClearAllLoading(true);
    try {
      const responses = await Promise.all(
        notifications.map(n =>
          fetch(`/api/v1/notifications/${n._id}`, { method: 'DELETE', headers: getHeaders() })
        )
      );
      if (responses.some(response => !response.ok)) {
        throw new Error('Some notifications could not be deleted.');
      }
      setNotifications([]);
      setUnreadCount(0);
      setClearAllConfirm(false);
      toast.success('All notifications cleared');
    } catch (error) {
      toast.error(error.message || 'Unable to clear notifications.');
    } finally {
      setClearAllLoading(false);
    }
  };

  const handleApprove = async (paper) => {
    const note = commentByPaperId[paper._id]?.trim() || 'Verified from official department copy';
    setProcessingId(paper._id);
    try {
      const response = await fetch(`/api/v1/papers/${paper._id}/verify`, {
        method: 'PATCH',
        headers: jsonHeaders,
        body: JSON.stringify({ action: 'Approved', comments: note })
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.message);

      const approvedPaper = json.data.paper || { ...paper, verificationComments: note, status: 'Approved' };
      setPendingPapers(prev => prev.filter(item => item._id !== paper._id));
      setApprovedPapers(prev => [approvedPaper, ...prev]);
      toast.success('Paper approved successfully.');
    } catch (error) {
      toast.error(error.message || 'Unable to approve paper.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (event) => {
    event.preventDefault();
    if (!selectedPaper) return;
    if (rejectionReason.trim().length < 10) {
      toast.error('Please enter feedback with at least 10 characters.');
      return;
    }

    setProcessingId(selectedPaper._id);
    try {
      const response = await fetch(`/api/v1/papers/${selectedPaper._id}/verify`, {
        method: 'PATCH',
        headers: jsonHeaders,
        body: JSON.stringify({ action: 'Rejected', rejectionReason: rejectionReason.trim() })
      });
      const json = await response.json();
      if (!json.success) throw new Error(json.message);

      setPendingPapers(prev => prev.filter(item => item._id !== selectedPaper._id));
      setShowRejectModal(false);
      setSelectedPaper(null);
      setRejectionReason('');
      toast.success('Paper rejected.');
    } catch (error) {
      toast.error(error.message || 'Unable to reject paper.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownload = async (paper, customFilename) => {
    try {
      await downloadPaperFile(paper, customFilename || getPaperFileName(paper));
    } catch (error) {
      toast.error(error.message || 'We can not open this file. Something went wrong.');
    }
  };

  const renderSkeletons = () => (
    <div className="skeleton-grid">
      {[1, 2, 3].map(item => (
        <div key={item} className="moderation-card skeleton-card">
          <div className="skeleton-line" style={{ width: '40%', height: '18px' }} />
          <div className="skeleton-line" style={{ width: '80%', height: '20px', marginTop: '10px' }} />
          <div className="skeleton-line" style={{ width: '60%', height: '14px', marginTop: '10px' }} />
          <div className="skeleton-line" style={{ width: '50%', height: '14px', marginTop: '10px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '38px', marginTop: '20px' }} />
          <div className="skeleton-line" style={{ width: '100%', height: '38px', marginTop: '10px' }} />
        </div>
      ))}
    </div>
  );

  const renderPaperMeta = (paper) => (
    <div className="paper-meta">
      <div>
        <Layers size={14} /> {paper.departmentId?.deptCode || 'Dept'} &bull; {paper.semester}
      </div>
      <div>
        <Calendar size={14} /> {paper.examType} (Session {paper.academicYear})
      </div>
    </div>
  );

  return (
    <div className="faculty-container">
      <header className="faculty-navbar">
        <div className="faculty-brand">
          <UserCheck size={28} style={{ color: 'var(--faculty-blue)' }} />
          <div>
            <h1>Faculty Verification Portal</h1>
            <span className="faculty-role-tag">Subject Moderator</span>
          </div>
        </div>
        <div className="faculty-navbar-actions">
          <button
            type="button"
            className="bell-button"
            onClick={() => setShowNotifDrawer(true)}
            title="Notifications"
            aria-label={`${unreadCount} unread notifications`}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </button>
          <button
            type="button"
            onClick={onSwitchToStudentPortal}
            className="faculty-btn faculty-btn-outline"
          >
            <ArrowRightLeft size={16} /> Student View
          </button>
        </div>
      </header>

      <nav className="faculty-tabs-container">
        <button
          type="button"
          className={`faculty-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <AlertCircle size={18} /> Pending ({pendingPapers.length})
        </button>
        <button
          type="button"
          className={`faculty-tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          <CheckCircle2 size={18} /> Verified ({approvedPapers.length})
        </button>
      </nav>

      <main className="faculty-content-card">
        {loading ? (
          renderSkeletons()
        ) : activeTab === 'pending' ? (
          <div>
            <h2 className="section-title">Pending Verification Queue</h2>
            <p className="section-desc">Review student uploaded PDF documents for your assigned subjects.</p>
            {pendingPapers.length > 0 ? (
              <div className="moderation-grid">
                {pendingPapers.map(paper => (
                  <div key={paper._id} className="moderation-card">
                    <div className="moderation-card-top">
                      <div className="uploader-badge">
                        <User size={14} /> Uploaded by: <strong>{paper.uploadedBy?.fullName || 'Unknown'}</strong>
                      </div>
                      <h3>{paper.subjectId?.subjectName} ({paper.subjectId?.subjectCode})</h3>
                      {renderPaperMeta(paper)}
                      <div className="comment-section">
                        <label htmlFor={`comment-${paper._id}`}>Verification Note</label>
                        <input
                          id={`comment-${paper._id}`}
                          type="text"
                          className="comment-input"
                          placeholder="Verified from official department copy"
                          value={commentByPaperId[paper._id] || ''}
                          onChange={event => setCommentByPaperId(prev => ({
                            ...prev,
                            [paper._id]: event.target.value
                          }))}
                        />
                      </div>
                    </div>
                    <div className="moderation-card-bottom">
                      <div className="moderation-actions two-col">
                        <button
                          type="button"
                          onClick={() => setPreviewPaper(paper)}
                          className="faculty-btn faculty-btn-outline"
                          disabled={processingId === paper._id}
                        >
                          <Eye size={14} /> Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(paper)}
                          className="faculty-btn faculty-btn-outline"
                          disabled
                          title="Only approved papers can be downloaded"
                        >
                          <Download size={14} /> Download
                        </button>
                      </div>
                      <div className="moderation-actions two-col">
                        <button
                          type="button"
                          onClick={() => handleApprove(paper)}
                          className="faculty-btn faculty-btn-emerald"
                          disabled={processingId === paper._id}
                        >
                          {processingId === paper._id ? <Loader2 size={16} className="spinner" /> : <Check size={16} />}
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPaper(paper);
                            setShowRejectModal(true);
                            setRejectionReason('');
                          }}
                          className="faculty-btn faculty-btn-rose"
                          disabled={processingId === paper._id}
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="pending"
                title="All caught up!"
                message="All caught up! No pending paper review requests at this time."
              />
            )}
          </div>
        ) : (
          <div>
            <h2 className="section-title">Verified Archives</h2>
            <p className="section-desc">Previously approved question papers currently live on the platform.</p>
            {approvedPapers.length > 0 ? (
              <div className="moderation-grid">
                {approvedPapers.map(paper => (
                  <div key={paper._id} className="moderation-card">
                    <div className="moderation-card-top">
                      <h3>{paper.subjectId?.subjectName} ({paper.subjectId?.subjectCode})</h3>
                      {renderPaperMeta(paper)}
                      <div className="verification-note">
                        <strong>Note:</strong> {paper.verificationComments || 'Verified from official department copy'}
                      </div>
                    </div>
                    <div className="moderation-card-bottom">
                      <div className="moderation-actions two-col">
                        <button
                          type="button"
                          onClick={() => setPreviewPaper(paper)}
                          className="faculty-btn faculty-btn-outline"
                        >
                          <Eye size={14} /> Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(paper)}
                          className="faculty-btn faculty-btn-blue"
                        >
                          <Download size={14} /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon="papers"
                title="No Approved Papers"
                message="Papers you approve will appear here in the verified archives."
              />
            )}
          </div>
        )}
      </main>

      {showRejectModal && (
        <div className="modal-backdrop" onClick={() => setShowRejectModal(false)}>
          <div className="preview-modal reject-modal" onClick={event => event.stopPropagation()}>
            <div className="preview-header">
              <h3><ShieldAlert size={20} style={{ color: 'var(--faculty-rose)' }} /> Reject Submission</h3>
              <button type="button" className="faculty-btn faculty-btn-outline" onClick={() => setShowRejectModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleRejectSubmit} style={{ padding: '1.5rem' }}>
              <p>
                Provide feedback to <strong>{selectedPaper?.uploadedBy?.fullName}</strong> regarding{' '}
                <strong>{selectedPaper?.subjectId?.subjectName}</strong>.
              </p>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="reject-feedback">Feedback (Min 10 chars)</label>
                <textarea
                  id="reject-feedback"
                  rows={4}
                  value={rejectionReason}
                  onChange={event => setRejectionReason(event.target.value)}
                  placeholder="e.g. Unclear scan. Question 3 is cut off."
                  className="comment-input"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                  required
                />
              </div>
              <div className="modal-actions" style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRejectModal(false)} className="faculty-btn faculty-btn-outline">
                  Cancel
                </button>
                <button type="submit" className="faculty-btn faculty-btn-rose" disabled={processingId === selectedPaper?._id}>
                  {processingId === selectedPaper?._id ? <Loader2 size={16} className="spinner" /> : null}
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {previewPaper && (
        <PDFViewer
          paper={previewPaper}
          onClose={() => setPreviewPaper(null)}
          onDownload={handleDownload}
        />
      )}

      {showNotifDrawer && (
        <div className="notif-drawer-backdrop" onClick={() => setShowNotifDrawer(false)}>
          <div className="notif-drawer" onClick={event => event.stopPropagation()} role="dialog" aria-label="Notifications">
            <div className="notif-drawer-header">
              <h3>
                <Bell size={18} style={{ color: 'var(--faculty-blue)' }} /> Notifications
                {unreadCount > 0 && <span className="unread-count-label">{unreadCount} new</span>}
              </h3>
              <div className="notif-drawer-actions">
                {notifications.length > 0 && (
                  <>
                    <button type="button" className="notif-action-btn" onClick={handleMarkAllRead} title="Mark all read">
                      <CheckCheck size={16} />
                    </button>
                    <button type="button" className="notif-action-btn notif-action-danger" onClick={() => setClearAllConfirm(true)} title="Clear all">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <button type="button" className="faculty-btn faculty-btn-outline" onClick={() => setShowNotifDrawer(false)}>
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="notif-drawer-content">
              {notifLoading ? (
                <div className="notif-loading">
                  <Loader2 size={24} className="spinner" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map(notif => {
                  const isPendingType = notif.type === 'NEW_PENDING_PAPER' || notif.type === 'NO_FACULTY_ASSIGNED';
                  const isRejectedType = notif.type === 'PAPER_REJECTED';
                  const borderColor = isPendingType ? '#d97706' : isRejectedType ? 'var(--faculty-rose)' : 'var(--faculty-emerald)';
                  const label = isPendingType ? 'Pending Review' : isRejectedType ? 'Rejected' : 'Approved';

                  return (
                    <div
                      key={notif._id}
                      className={`notif-card ${!notif.isRead ? 'notif-unread' : ''}`}
                      style={{ borderLeftColor: borderColor }}
                      onClick={() => {
                        if (!notif.isRead) handleMarkRead(notif._id);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="notif-card-top">
                        <span className="notif-type-label" style={{ color: borderColor }}>
                          {isRejectedType ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                          {label}
                        </span>
                        <div className="notif-actions">
                          {!notif.isRead && (
                            <button
                              type="button"
                              className="notif-inline-btn"
                              onClick={event => {
                                event.stopPropagation();
                                handleMarkRead(notif._id);
                              }}
                              aria-label="Mark as read"
                            >
                              <CheckCheck size={14} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="notif-inline-btn notif-inline-danger"
                            onClick={event => {
                              event.stopPropagation();
                              handleDeleteNotification(notif._id);
                            }}
                            aria-label="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="notif-card-time">{new Date(notif.createdAt).toLocaleString()}</div>
                      <div className="notif-card-message">{notif.message}</div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon="notifications"
                  title="No Notifications"
                  message="You are all caught up!"
                />
              )}
            </div>
          </div>
        </div>
      )}

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
