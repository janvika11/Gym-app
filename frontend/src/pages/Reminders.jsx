import { useState, useEffect } from 'react';
import { getMembers, sendBulkReminders, getReminderLogs, getSettings } from '../api';
import './Reminders.css';

const DEFAULT_TEMPLATES = {
  fee_reminder: {
    title: 'Fee reminder',
    body: 'Hi {name}! Your gym membership fee of ₹{fee} is due on {date}. Please make the payment to continue your fitness journey. 💪',
  },
  expired: {
    title: 'Membership expired',
    body: 'Hi {name}! Your gym membership has expired. We miss you! Renew now and get back on track. 🔥',
  },
  attendance: {
    title: 'Attendance reminder',
    body: "Hi {name}! We haven't seen you in a while. Your health is important — come visit us today! 🏋️",
  },
  custom: {
    title: 'Custom message',
    body: '',
  },
};

export default function Reminders() {
  const [members, setMembers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [overdueBody, setOverdueBody] = useState('Hi {name}! Your gym membership fee is overdue. Please clear your dues to continue enjoying our facilities. 💪');
  const [expiringBody, setExpiringBody] = useState('Hi {name}! Your membership is expiring soon. Renew now to keep your progress going. 🏋️');
  const [inactiveBody, setInactiveBody] = useState("Hi {name}! We haven't seen you in a while. Your health is important — come visit us today! 💪");
  const [templateKey, setTemplateKey] = useState('fee_reminder');
  const [title, setTitle] = useState(DEFAULT_TEMPLATES.fee_reminder.title);
  const [body, setBody] = useState(DEFAULT_TEMPLATES.fee_reminder.body);
  const [sendingGroup, setSendingGroup] = useState(null);
  const [sendingCompose, setSendingCompose] = useState(false);
  const [autoRunning, setAutoRunning] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    Promise.all([
      getMembers().then((list) => list.filter((m) => m.phone)),
      getReminderLogs(20).catch(() => []),
      getSettings().catch(() => null),
    ])
      .then(([m, l, s]) => {
        setMembers(m);
        setLogs(l);
        if (s) {
          const merged = {
            ...DEFAULT_TEMPLATES,
            fee_reminder: { title: 'Fee reminder', body: s.feeReminderMessage || DEFAULT_TEMPLATES.fee_reminder.body },
            expired: { title: 'Membership expired', body: s.overdueMessage || DEFAULT_TEMPLATES.expired.body },
            attendance: { title: 'Attendance reminder', body: s.inactiveMessage || DEFAULT_TEMPLATES.attendance.body },
          };
          setTemplates(merged);
          setOverdueBody(s.overdueMessage || DEFAULT_TEMPLATES.expired.body);
          setExpiringBody(s.expiringMessage || 'Hi {name}! Your membership is expiring soon. Renew now to keep your progress going. 🏋️');
          setInactiveBody(s.inactiveMessage || DEFAULT_TEMPLATES.attendance.body);
          setTitle(merged.fee_reminder?.title || title);
          setBody(merged.fee_reminder?.body || body);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const addDays = (d, n) => {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
  };

  const withEndDate = members.filter((m) => m.endDate);
  const overdueMembers = members.filter((m) => {
    const byStatus = m.paymentStatus === 'overdue';
    const byDate = m.endDate ? new Date(m.endDate) < now : false;
    return byStatus || byDate;
  });
  const expiringSoonMembers = withEndDate.filter((m) => {
    const end = new Date(m.endDate);
    return end >= now && end <= addDays(now, 7);
  });
  const inactiveMembers = members.filter((m) => {
    if (m.active === false) return false;
    if (!m.lastCheckInAt) return true;
    const last = new Date(m.lastCheckInAt);
    const diffMs = now - last;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 7;
  });

  const getMembershipStatus = (m) => {
    const today = new Date();

    if (m.active === false) return 'expired';

    if (m.endDate) {
      const end = new Date(m.endDate);
      if (end < today) return 'overdue';
    }

    return 'active';
  };

  const toggleComposeMember = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openCompose = () => {
    setTemplateKey('fee_reminder');
    setTitle(templates.fee_reminder?.title || DEFAULT_TEMPLATES.fee_reminder.title);
    setBody(templates.fee_reminder?.body || DEFAULT_TEMPLATES.fee_reminder.body);
    setSelectedIds([]);
    setComposeOpen(true);
  };

  const handleTemplateChange = (e) => {
    const key = e.target.value;
    setTemplateKey(key);
    const tpl = templates[key] || DEFAULT_TEMPLATES[key];
    if (!tpl || key === 'custom') return;
    setTitle(tpl.title);
    setBody(tpl.body);
  };

  const refreshLogs = async () => {
    const fresh = await getReminderLogs(20).catch(() => []);
    setLogs(fresh);
  };

  const sendBulkGroup = async (groupKey, ids, groupTitle, bodyTemplate) => {
    if (!ids.length) return;
    setError('');
    setResult(null);
    setSendingGroup(groupKey);
    try {
      await sendBulkReminders(ids, groupTitle, bodyTemplate);
      setResult({
        type: 'success',
        text: `Sent to ${ids.length} member(s).`,
      });
      await refreshLogs();
    } catch (e) {
      setResult({ type: 'error', text: e.message });
    } finally {
      setSendingGroup(null);
    }
  };

  const handleAutoReminders = async () => {
    if (
      !overdueMembers.length &&
      !expiringSoonMembers.length &&
      !inactiveMembers.length
    ) {
      setResult({
        type: 'partial',
        text: 'No members to send auto reminders to.',
      });
      return;
    }

    setError('');
    setResult(null);
    setAutoRunning(true);

    try {
      if (overdueMembers.length) {
        await sendBulkGroup(
          'fee_overdue',
          overdueMembers.map((m) => m._id),
          'Fee overdue',
          'Hi {name}! Your gym membership fee is overdue. Please clear your dues to continue enjoying our facilities. 💪'
        );
      }

      if (expiringSoonMembers.length) {
        await sendBulkGroup(
          'expiring_soon',
          expiringSoonMembers.map((m) => m._id),
          'Membership expiring soon',
          'Hi {name}! Your membership is expiring soon. Renew now to keep your progress going. 🏋️'
        );
      }

      if (inactiveMembers.length) {
        await sendBulkGroup(
          'inactive',
          inactiveMembers.map((m) => m._id),
          'We miss you at the gym',
          "Hi {name}! We haven't seen you in a while. Your health is important — come visit us today! 💪"
        );
      }

      setResult({
        type: 'success',
        text: 'Auto reminders sent to all matching members.',
      });
    } catch (e) {
      setResult({ type: 'error', text: e.message });
    } finally {
      setAutoRunning(false);
    }
  };

  const handleComposeSend = async () => {
    if (!selectedIds.length) {
      setError('Select at least one member.');
      return;
    }
    setError('');
    setResult(null);
    setSendingCompose(true);
    try {
      await sendBulkReminders(selectedIds, title.trim(), body.trim());
      setResult({
        type: 'success',
        text: `Sent to ${selectedIds.length} member(s).`,
      });
      setComposeOpen(false);
      setSelectedIds([]);
      await refreshLogs();
    } catch (e) {
      setResult({ type: 'error', text: e.message });
    } finally {
      setSendingCompose(false);
    }
  };

  if (loading) return <p className="page-message">Loading members...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>WhatsApp</h1>
      </div>

      <div className="wh-top-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={openCompose}
        >
          Compose Message
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleAutoReminders}
          disabled={autoRunning}
        >
          {autoRunning ? 'Running auto reminders...' : 'Auto Reminders'}
        </button>
      </div>

      <div className="wh-quick-grid">
        <QuickCard
          label="Fee Overdue"
          count={overdueMembers.length}
          description="Send reminders to all overdue"
          color="#FFD740"
          onSendAll={() =>
            sendBulkGroup('fee_overdue', overdueMembers.map((m) => m._id), 'Fee overdue', overdueBody)
          }
          sending={sendingGroup === 'fee_overdue'}
        />
        <QuickCard
          label="Expiring Soon"
          count={expiringSoonMembers.length}
          description="Notify about upcoming renewals"
          color="#FF8A65"
          onSendAll={() =>
            sendBulkGroup(
              'expiring_soon',
              expiringSoonMembers.map((m) => m._id),
              'Membership expiring soon',
              'Hi {name}! Your membership is expiring soon. Renew now to keep your progress going. 🏋️'
            )
          }
          sending={sendingGroup === 'expiring_soon'}
        />
        <QuickCard
          label="Inactive (7+ days)"
          count={inactiveMembers.length}
          description="Re-engagement messages"
          color="#64B5F6"
          onSendAll={() =>
            sendBulkGroup('inactive', inactiveMembers.map((m) => m._id), 'We miss you at the gym', inactiveBody)
          }
          sending={sendingGroup === 'inactive'}
        />
      </div>

      <div className="card wh-history-card">
        <h2>Message History</h2>
        {logs.length === 0 ? (
          <p className="empty-state">No reminders sent yet.</p>
        ) : (
          <div className="wh-history-list">
            {logs.map((log) => (
              <div key={log._id} className="wh-history-item">
                <div className="wh-history-header">
                  <div>
                    <span className="wh-history-name">
                      {log.memberName || 'Member'}
                    </span>
                    <span className="wh-history-phone">
                      {log.phone || ''}
                    </span>
                  </div>
                  <div className="wh-history-meta">
                    <span className="wh-history-date">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={
                        log.status === 'sent'
                          ? 'wh-history-status sent'
                          : 'wh-history-status failed'
                      }
                    >
                      {log.status === 'sent' ? '✓✓' : '✕'}
                    </span>
                  </div>
                </div>
                <div className="wh-history-body">
                  {log.body || log.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="form-error">{error}</p>}
      {result && (
        <p className={`result result-${result.type}`}>{result.text}</p>
      )}

      {composeOpen && (
        <div className="wh-modal-backdrop" onClick={() => setComposeOpen(false)}>
          <div
            className="wh-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="wh-modal-header">
              <h2>Compose WhatsApp Message</h2>
              <button
                type="button"
                className="wh-modal-close"
                onClick={() => setComposeOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="form-group">
              <label>Select recipients</label>
              <div className="member-checkboxes">
                {members.map((m) => {
                  const status = getMembershipStatus(m);
                  return (
                    <label key={m._id} className="checkbox-label">
                      <div className="checkbox-main">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(m._id)}
                          onChange={() => toggleComposeMember(m._id)}
                        />
                        <span className="checkbox-name">{m.name}</span>
                        <span className="checkbox-phone">{m.phone}</span>
                      </div>
                      <span
                        className={`checkbox-status checkbox-status-${status}`}
                      >
                        {status}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label>Message template</label>
              <select
                value={templateKey}
                onChange={handleTemplateChange}
              >
                <option value="fee_reminder">fee_reminder</option>
                <option value="expired">expired</option>
                <option value="attendance">attendance</option>
                <option value="custom">custom</option>
              </select>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Gym Reminder"
              />
            </div>
            <div className="form-group">
              <label>Message body</label>
              <textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              onClick={handleComposeSend}
              disabled={sendingCompose}
            >
              {sendingCompose
                ? 'Sending...'
                : `Send to ${selectedIds.length} member${
                    selectedIds.length !== 1 ? 's' : ''
                  }`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickCard({ label, count, description, color, onSendAll, sending }) {
  return (
    <div
      className="card wh-quick-card"
      style={{ borderColor: `${color}33` }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = `${color}66`)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = `${color}33`)
      }
    >
      <div className="wh-quick-header">
        <span className="wh-quick-label">{label}</span>
        <span className="wh-quick-count" style={{ color }}>
          {count}
        </span>
      </div>
      <p className="wh-quick-desc">{description}</p>
              <button
                type="button"
                className="btn btn-primary wh-quick-btn"
                onClick={onSendAll}
                disabled={sending || count === 0}
              >
                {sending ? 'Sending...' : 'Send All'}
              </button>
    </div>
  );
}
