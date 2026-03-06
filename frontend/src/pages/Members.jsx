import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMembers, deleteMember, sendReminder, sendMemberReminder, bulkImportMembers } from '../api';
import './Members.css';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [selected, setSelected] = useState(null);
  const [sending, setSending] = useState(false);
  const [reminding, setReminding] = useState(null);
  const [reminderMsg, setReminderMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

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

  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/\s+/g, ''));
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map((v) => v.trim());
      const row = {};
      headers.forEach((h, j) => { row[h] = vals[j] || ''; });
      rows.push(row);
    }
    return rows.map((r) => ({
      name: r.name || r.membername || '',
      phone: r.phone || r.mobile || r.contact || '',
      email: r.email || '',
      planName: r.plan || r.planname || '',
      startDate: r.startdate || r.start || '',
      endDate: r.enddate || r.end || '',
      paymentStatus: r.paymentstatus || r.status || 'paid',
      notes: r.notes || '',
    }));
  }

  const handleBulkImport = async () => {
    const rows = parseCSV(importText);
    if (rows.length === 0) {
      alert('Paste CSV with header: name, phone, email, plan, startDate, endDate');
      return;
    }
    const valid = rows.filter((r) => r.name && r.phone);
    if (valid.length === 0) {
      alert('Each row needs at least name and phone.');
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      const result = await bulkImportMembers(valid, false);
      setImportResult(result);
      load();
      if (result.created > 0) setImportText('');
    } catch (e) {
      setImportResult({ created: 0, errors: valid.length, details: [{ msg: e.message }] });
    } finally {
      setImporting(false);
    }
  };

  const closeImport = () => {
    setShowImport(false);
    setImportText('');
    setImportResult(null);
  };

  const downloadSampleCSV = () => {
    const csv = 'name,phone,email,plan,startDate,endDate\nRahul,9876543210,rahul@mail.com,Basic,2026-01-01,2026-02-01\nPriya,9123456789,priya@mail.com,Premium,2026-01-15,2026-03-15';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'members-import-sample.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSendExpiryReminder = async (m, e) => {
    e?.stopPropagation();
    if (!m?.phone) return;
    setReminding(m._id);
    try {
      await sendMemberReminder(m._id);
      alert('Reminder sent!');
      setReminding(null);
    } catch (err) {
      alert(err.message || 'Failed to send');
      setReminding(null);
    }
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowImport(true)}>
            Import CSV
          </button>
          <Link to="/members/new" className="btn btn-primary">Add member</Link>
        </div>
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
                    {m.phone && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={(e) => handleSendExpiryReminder(m, e)}
                        disabled={reminding === m._id}
                        title="Send expiry reminder via WhatsApp"
                      >
                        {reminding === m._id ? '...' : 'Remind'}
                      </button>
                    )}
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

      {showImport && (
        <div className="member-modal-backdrop" onClick={closeImport}>
          <div className="member-modal import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="member-modal-header">
              <h2>Bulk Import Members</h2>
              <button type="button" className="member-modal-close" onClick={closeImport}>✕</button>
            </div>
            <p className="import-hint">
              Paste CSV with header row. Columns: <strong>name, phone, email, plan, startDate, endDate</strong> (name and phone required).
              Plan names must match your plans (e.g. Basic, Premium). Dates: YYYY-MM-DD.
            </p>
            <div style={{ marginBottom: 8 }}>
              <button type="button" className="btn btn-sm btn-secondary" onClick={downloadSampleCSV}>
                Download sample CSV
              </button>
            </div>
            <textarea
              className="import-textarea"
              placeholder="name,phone,email,plan,startDate,endDate&#10;Rahul,9876543210,rahul@mail.com,Basic,2026-01-01,2026-02-01&#10;Priya,9123456789,priya@mail.com,Premium,2026-01-15,2026-03-15"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={8}
            />
            {importResult && (
              <div className={`import-result ${importResult.errors > 0 ? 'has-errors' : ''}`}>
                Imported: <strong>{importResult.created}</strong>
                {importResult.errors > 0 && <> • Errors: {importResult.errors}</>}
                {importResult.details?.length > 0 && (
                  <ul>{importResult.details.slice(0, 5).map((d, i) => (
                    <li key={i}>Row {d.row}: {d.msg}</li>
                  ))}</ul>
                )}
              </div>
            )}
            <div className="import-actions">
              <button type="button" className="btn btn-secondary" onClick={closeImport}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleBulkImport} disabled={importing}>
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

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
