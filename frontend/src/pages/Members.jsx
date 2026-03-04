import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMembers, deleteMember, sendReminder } from '../api';
import './Members.css';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);
  const [reminderMsg, setReminderMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = () => {
    setLoading(true);
    getMembers()
      .then(setMembers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleDelete = (id, name, e) => {
    e?.stopPropagation();
    if (!window.confirm(`Delete member "${name}"?`)) return;
    setDeleting(id);
    deleteMember(id)
      .then(load)
      .catch((e2) => setError(e2.message))
      .finally(() => setDeleting(null));
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  const getMembershipStatus = (m) => {
    const today = new Date();
    // If member is marked inactive, treat as expired regardless of dates
    if (m.active === false) return 'expired';

    // If we have an end date, compare with today
    if (m.endDate) {
      const end = new Date(m.endDate);
      if (end < today) return 'overdue';
    }

    // Otherwise consider active
    return 'active';
  };

  const openDetails = (m) => {
    const baseMessage = `Hi ${m.name}! Your ${m.plan?.name ?? 'gym'} membership is active. See you at the gym! 💪`;
    setReminderMsg(baseMessage);
    setSelected(m);
  };

  const closeDetails = () => {
    setSelected(null);
    setSending(false);
  };

  const handleSendReminder = async () => {
    if (!selected || !reminderMsg.trim()) return;
    setSending(true);
    try {
      await sendReminder(selected._id, 'Gym Reminder', reminderMsg.trim());
      alert('WhatsApp reminder triggered for this member (check Meta sandbox).');
    } catch (e) {
      alert(e.message || 'Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p className="page-message">Loading members...</p>;
  if (error) return <p className="page-message error">{error}</p>;

  const filteredMembers = members.filter((m) => {
    const status = getMembershipStatus(m);
    if (statusFilter !== 'all' && status !== statusFilter) return false;
    return true;
  });

  const statusCounts = {
    active: members.filter((m) => getMembershipStatus(m) === 'active').length,
    overdue: members.filter((m) => getMembershipStatus(m) === 'overdue').length,
    expired: members.filter((m) => getMembershipStatus(m) === 'expired').length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Members</h1>
        <Link to="/members/new" className="btn btn-primary">Add member</Link>
      </div>

      <div className="members-filters">
        <div className="filter-group">
          {['all', 'active', 'overdue', 'expired'].map((key) => (
            <button
              key={key}
              type="button"
              className={`filter-pill ${statusFilter === key ? 'active' : ''}`}
              onClick={() => setStatusFilter(key)}
            >
              {key === 'all' ? 'All status' : key.charAt(0).toUpperCase() + key.slice(1)}
              {key !== 'all' && (
                <span className="filter-count">
                  {statusCounts[key] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="card table-card">
        {members.length === 0 ? (
          <p className="empty-state">No members yet. Add your first member.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Plan</th>
                <th>Start</th>
                <th>End</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => {
                const status = getMembershipStatus(m);
                const pay = m.paymentStatus || 'paid';
                return (
                <tr key={m._id} onClick={() => openDetails(m)} className="member-row-click">
                  <td>{m.name}</td>
                  <td>{m.phone || '—'}</td>
                  <td>{m.email || '—'}</td>
                  <td>{m.plan?.name ?? '—'}</td>
                  <td>{formatDate(m.startDate)}</td>
                  <td>{formatDate(m.endDate)}</td>
                  <td>
                    <span
                      className={`badge ${
                        status === 'active'
                          ? 'badge-success'
                          : status === 'overdue'
                          ? 'badge-danger'
                          : 'badge-muted'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </td>
                  <td className="actions" onClick={(e) => e.stopPropagation()}>
                    <Link to={`/members/${m._id}/edit`} className="btn btn-sm btn-secondary">Edit</Link>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={(e) => handleDelete(m._id, m.name, e)}
                      disabled={deleting === m._id}
                    >
                      {deleting === m._id ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div className="member-modal-backdrop" onClick={closeDetails}>
          <div className="member-modal" onClick={(e) => e.stopPropagation()}>
            <div className="member-modal-header">
              <h2>Member Details</h2>
              <button type="button" className="member-modal-close" onClick={closeDetails}>
                ✕
              </button>
            </div>
            <div className="member-modal-main">
              <div className="member-avatar">
                {selected.name?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="member-name">{selected.name}</div>
                <div className="member-phone">{selected.phone}</div>
              </div>
            </div>
            <div className="member-modal-grid">
              <DetailCard label="Plan" value={selected.plan?.name || '—'} />
              <DetailCard
                label="Monthly fee"
                value={selected.plan ? `₹${selected.plan.price}` : '—'}
              />
              <DetailCard
                label="Join date"
                value={formatDate(selected.startDate)}
              />
              <DetailCard
                label="Due date"
                value={formatDate(selected.endDate)}
              />
            </div>
            <div className="member-modal-actions">
              <button
                type="button"
                className="btn btn-primary member-whatsapp-btn"
                onClick={handleSendReminder}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Reminder on WhatsApp'}
              </button>
              <Link
                to={`/members/${selected._id}/edit`}
                className="btn btn-secondary member-edit-btn"
                onClick={closeDetails}
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailCard({ label, value }) {
  return (
    <div className="member-detail-card">
      <div className="member-detail-label">{label}</div>
      <div className="member-detail-value">{value}</div>
    </div>
  );
}
