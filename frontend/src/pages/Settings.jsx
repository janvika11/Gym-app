import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api';
import './Settings.css';

const BUILTINS = [
  { id: 'welcome', titleKey: 'welcomeTitle', msgKey: 'welcomeMessage', defaultTitle: 'Welcome (new member)' },
  { id: 'feeReminder', titleKey: 'feeReminderTitle', msgKey: 'feeReminderMessage', defaultTitle: 'Fee reminder' },
  { id: 'overdue', titleKey: 'overdueTitle', msgKey: 'overdueMessage', defaultTitle: 'Overdue' },
  { id: 'expiring', titleKey: 'expiringTitle', msgKey: 'expiringMessage', defaultTitle: 'Expiring soon' },
  { id: 'inactive', titleKey: 'inactiveTitle', msgKey: 'inactiveMessage', defaultTitle: 'Inactive (7+ days)' },
];

const emptyForm = () => ({
  welcomeTitle: '',
  welcomeMessage: '',
  feeReminderTitle: '',
  feeReminderMessage: '',
  overdueTitle: '',
  overdueMessage: '',
  expiringTitle: '',
  expiringMessage: '',
  inactiveTitle: '',
  inactiveMessage: '',
  customTemplates: [],
});

function parseResponse(s) {
  if (!s) return emptyForm();
  const customTemplates = Array.isArray(s.customTemplates) ? s.customTemplates : [];
  return {
    welcomeTitle: s.welcomeTitle ?? '',
    welcomeMessage: s.welcomeMessage ?? '',
    feeReminderTitle: s.feeReminderTitle ?? '',
    feeReminderMessage: s.feeReminderMessage ?? '',
    overdueTitle: s.overdueTitle ?? '',
    overdueMessage: s.overdueMessage ?? '',
    expiringTitle: s.expiringTitle ?? '',
    expiringMessage: s.expiringMessage ?? '',
    inactiveTitle: s.inactiveTitle ?? '',
    inactiveMessage: s.inactiveMessage ?? '',
    customTemplates: customTemplates.map((t) => ({
      key: t.key || `custom_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      title: t.title ?? '',
      message: t.message ?? '',
    })),
  };
}

export default function Settings() {
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const s = await getSettings();
        if (!mounted) return;
        setForm(parseResponse(s));
        setError('');
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load settings');
        setForm(emptyForm());
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addCustomTemplate = () => {
    setForm((prev) => ({
      ...prev,
      customTemplates: [
        ...prev.customTemplates,
        { key: `custom_${Date.now()}`, title: 'New template', message: '' },
      ],
    }));
  };

  const updateCustomTemplate = (index, field, value) => {
    setForm((prev) => {
      const next = [...prev.customTemplates];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, customTemplates: next };
    });
  };

  const removeCustomTemplate = (index) => {
    setForm((prev) => ({
      ...prev,
      customTemplates: prev.customTemplates.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const customTemplates = (form.customTemplates || []).map((t, i) => ({
        key: t.key || `custom_${Date.now()}_${i}`,
        title: String(t.title ?? ''),
        message: String(t.message ?? ''),
      }));
      const payload = {
        welcomeTitle: form.welcomeTitle,
        welcomeMessage: form.welcomeMessage,
        feeReminderTitle: form.feeReminderTitle,
        feeReminderMessage: form.feeReminderMessage,
        overdueTitle: form.overdueTitle,
        overdueMessage: form.overdueMessage,
        expiringTitle: form.expiringTitle,
        expiringMessage: form.expiringMessage,
        inactiveTitle: form.inactiveTitle,
        inactiveMessage: form.inactiveMessage,
        customTemplates,
      };
      const saved = await updateSettings(payload);
      const fresh = saved || await getSettings();
      setForm(parseResponse(fresh));
      const count = (fresh.customTemplates || []).length;
      setSuccess(count > 0 ? `Saved! ${count} custom template(s).` : 'Settings saved.');
    } catch (err) {
      setError(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="page-message">Loading settings...</p>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>
      <div className="card form-card settings-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>WhatsApp message templates</h2>
          <button type="button" className="btn btn-secondary" onClick={addCustomTemplate}>
            + Add new template
          </button>
        </div>
        <p className="settings-hint">
          Placeholders: {'{name}'}, {'{gym}'}, {'{fee}'}, {'{date}'}, {'{expiry}'}, {'{plan}'}
        </p>
        <form onSubmit={handleSubmit}>
          {BUILTINS.map(({ id, titleKey, msgKey, defaultTitle }) => (
            <div key={id} className="settings-template-row">
              <div className="form-group">
                <label htmlFor={`${titleKey}`}>Title</label>
                <input
                  id={titleKey}
                  type="text"
                  value={form[titleKey]}
                  onChange={(e) => updateField(titleKey, e.target.value)}
                  placeholder={defaultTitle}
                />
              </div>
              <div className="form-group">
                <label htmlFor={msgKey}>Message</label>
                <textarea
                  id={msgKey}
                  value={form[msgKey]}
                  onChange={(e) => updateField(msgKey, e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          ))}

          {form.customTemplates.map((t, idx) => (
            <div key={t.key || idx} className="settings-template-row settings-custom-row">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={t.title}
                  onChange={(e) => updateCustomTemplate(idx, 'title', e.target.value)}
                  placeholder="Template title"
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={t.message}
                  onChange={(e) => updateCustomTemplate(idx, 'message', e.target.value)}
                  rows={2}
                  placeholder="Hi {name}, ..."
                />
              </div>
              <button
                type="button"
                className="btn btn-secondary settings-remove-btn"
                onClick={() => removeCustomTemplate(idx)}
              >
                Remove
              </button>
            </div>
          ))}
          

          {success && <p className="settings-success">{success}</p>}
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </form>
      </div>
    </div>
  );
}
