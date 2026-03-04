import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api';
import './Settings.css';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    welcomeMessage: '',
    feeReminderMessage: '',
    overdueMessage: '',
    expiringMessage: '',
    inactiveMessage: '',
  });

  useEffect(() => {
    getSettings()
      .then((s) =>
        setForm({
          welcomeMessage: s.welcomeMessage || '',
          feeReminderMessage: s.feeReminderMessage || '',
          overdueMessage: s.overdueMessage || '',
          expiringMessage: s.expiringMessage || '',
          inactiveMessage: s.inactiveMessage || '',
        })
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateSettings(form);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="page-message">Loading settings...</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>
      <div className="card form-card settings-card">
        <h2>WhatsApp message templates</h2>
        <p className="settings-hint">
          Customise the default messages. Use {'{name}'}, {'{fee}'}, {'{date}'} as placeholders.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Welcome (new member)</label>
            <textarea
              name="welcomeMessage"
              value={form.welcomeMessage}
              onChange={handleChange}
              rows={2}
              placeholder="Hi {name}, welcome to our gym! 💪"
            />
          </div>
          <div className="form-group">
            <label>Fee reminder</label>
            <textarea
              name="feeReminderMessage"
              value={form.feeReminderMessage}
              onChange={handleChange}
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>Overdue</label>
            <textarea
              name="overdueMessage"
              value={form.overdueMessage}
              onChange={handleChange}
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>Expiring soon</label>
            <textarea
              name="expiringMessage"
              value={form.expiringMessage}
              onChange={handleChange}
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>Inactive (7+ days)</label>
            <textarea
              name="inactiveMessage"
              value={form.inactiveMessage}
              onChange={handleChange}
              rows={2}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
