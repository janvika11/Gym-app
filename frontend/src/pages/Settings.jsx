import { useState, useEffect } from 'react';
import { getSettings, updateSettings, getGymWhatsAppStatus, connectGymWhatsApp } from '../api';
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
  openingTime: '06:00',
  closingTime: '21:00',
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
    openingTime: s.openingTime ?? '06:00',
    closingTime: s.closingTime ?? '21:00',
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
  const [whatsapp, setWhatsapp] = useState({
    connected: false,
    phoneNumberId: '',
    businessAccountId: '',
    phoneNumber: '',
    verified: false,
  });
  const [whatsappForm, setWhatsappForm] = useState({
    phoneNumberId: '',
    accessToken: '',
    businessAccountId: '',
    phoneNumber: '',
  });
  const [whatsappSaving, setWhatsappSaving] = useState(false);
  const [gymHoursSaving, setGymHoursSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [s, wa] = await Promise.all([getSettings(), getGymWhatsAppStatus().catch(() => null)]);
        if (!mounted) return;
        setForm(parseResponse(s));
        if (wa) {
          setWhatsapp(wa);
          setWhatsappForm((prev) => ({
            ...prev,
            phoneNumberId: wa.phoneNumberId || '',
            businessAccountId: wa.businessAccountId || '',
            phoneNumber: wa.phoneNumber || '',
          }));
        }
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

  const handleWhatsappConnect = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setWhatsappSaving(true);
    try {
      await connectGymWhatsApp({
        phoneNumberId: whatsappForm.phoneNumberId.trim(),
        accessToken: whatsappForm.accessToken.trim(),
        businessAccountId: whatsappForm.businessAccountId.trim() || undefined,
        phoneNumber: whatsappForm.phoneNumber.trim() || undefined,
        verified: whatsappForm.verified,
      });
      const wa = await getGymWhatsAppStatus();
      setWhatsapp(wa);
      setSuccess('WhatsApp credentials saved. Set verified in Meta once your number is approved.');
    } catch (err) {
      setError(err?.message || 'Failed to save WhatsApp credentials');
    } finally {
      setWhatsappSaving(false);
    }
  };

  const handleSaveGymHours = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setGymHoursSaving(true);
    try {
      await updateSettings({
        openingTime: form.openingTime || '06:00',
        closingTime: form.closingTime || '21:00',
      });
      const fresh = await getSettings();
      setForm((prev) => ({ ...prev, openingTime: fresh.openingTime ?? '06:00', closingTime: fresh.closingTime ?? '21:00' }));
      setSuccess('Gym hours saved.');
    } catch (err) {
      setError(err?.message || 'Failed to save gym hours');
    } finally {
      setGymHoursSaving(false);
    }
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
      setSuccess(count > 0 ? `Saved! ${count} custom template(s).` : 'Templates saved.');
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
      <div className="card form-card settings-card" style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 12px 0' }}>Connect WhatsApp Business</h2>
        <p className="settings-hint" style={{ marginBottom: 16 }}>
          Each gym can connect its own WhatsApp Business number. Get these from Meta Business Suite → WhatsApp → API Setup.
        </p>
        <form onSubmit={handleWhatsappConnect}>
          <div className="form-group">
            <label htmlFor="wa-phone-id">Phone Number ID</label>
            <input
              id="wa-phone-id"
              type="text"
              value={whatsappForm.phoneNumberId}
              onChange={(e) => setWhatsappForm((p) => ({ ...p, phoneNumberId: e.target.value }))}
              placeholder="e.g. 123456789012345"
            />
          </div>
          <div className="form-group">
            <label htmlFor="wa-token">Access Token</label>
            <input
              id="wa-token"
              type="password"
              value={whatsappForm.accessToken}
              onChange={(e) => setWhatsappForm((p) => ({ ...p, accessToken: e.target.value }))}
              placeholder="Paste your permanent access token"
            />
          </div>
          <div className="form-group">
            <label htmlFor="wa-waba">Business Account ID (optional)</label>
            <input
              id="wa-waba"
              type="text"
              value={whatsappForm.businessAccountId}
              onChange={(e) => setWhatsappForm((p) => ({ ...p, businessAccountId: e.target.value }))}
              placeholder="WABA ID"
            />
          </div>
          <div className="form-group">
            <label htmlFor="wa-phone">Phone Number (optional)</label>
            <input
              id="wa-phone"
              type="text"
              value={whatsappForm.phoneNumber}
              onChange={(e) => setWhatsappForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              placeholder="e.g. +91 9876543210"
            />
          </div>
          {whatsapp.connected && (
            <>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  id="wa-verified"
                  type="checkbox"
                  checked={whatsappForm.verified}
                  onChange={(e) => setWhatsappForm((p) => ({ ...p, verified: e.target.checked }))}
                />
                <label htmlFor="wa-verified" style={{ marginBottom: 0 }}>Mark as verified (Meta approved)</label>
              </div>
              <p className="settings-success" style={{ marginBottom: 12 }}>
                Connected {whatsapp.verified ? '✓ Verified' : '(Pending verification in Meta)'}
              </p>
            </>
          )}
          <button type="submit" className="btn btn-primary" disabled={whatsappSaving}>
            {whatsappSaving ? 'Saving...' : 'Save WhatsApp credentials'}
          </button>
        </form>
      </div>

      <div className="card form-card settings-card" style={{ marginBottom: 24 }}>
        <h2 style={{ margin: '0 0 12px 0' }}>Gym hours</h2>
        <p className="settings-hint" style={{ marginBottom: 16 }}>
          Set your gym's opening and closing times (e.g. 6 AM – 9 PM).
        </p>
        <form onSubmit={handleSaveGymHours}>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ minWidth: 140 }}>
              <label htmlFor="openingTime">Opening time</label>
              <input
                id="openingTime"
                type="time"
                value={form.openingTime || '06:00'}
                onChange={(e) => updateField('openingTime', e.target.value)}
              />
            </div>
            <div className="form-group" style={{ minWidth: 140 }}>
              <label htmlFor="closingTime">Closing time</label>
              <input
                id="closingTime"
                type="time"
                value={form.closingTime || '21:00'}
                onChange={(e) => updateField('closingTime', e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={gymHoursSaving}>
              {gymHoursSaving ? 'Saving...' : 'Save gym hours'}
            </button>
          </div>
        </form>
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
            {saving ? 'Saving...' : 'Save templates'}
          </button>
        </form>
      </div>
    </div>
  );
}
