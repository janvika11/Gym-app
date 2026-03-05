import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMember, createMember, updateMember, getPlans, getWhatsAppSubscribeLink } from '../api';
import './MemberForm.css';

export default function MemberForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [plans, setPlans] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    plan: '',
    startDate: '',
    endDate: '',
    active: true,
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sendWelcome, setSendWelcome] = useState(true);
  const [subscribeLink, setSubscribeLink] = useState(null);
  const [subscribeMessage, setSubscribeMessage] = useState(null);
  const [showSubscribeCard, setShowSubscribeCard] = useState(false);
  const [justAddedName, setJustAddedName] = useState('');
  const [welcomeSent, setWelcomeSent] = useState(false);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    getMember(id)
      .then((m) => {
        const phone = String(m.phone || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^91/, '').slice(-10);
        setForm({
          name: m.name || '',
          email: m.email || '',
          phone,
          plan: m.plan?._id || '',
          startDate: m.startDate ? m.startDate.slice(0, 10) : '',
          endDate: m.endDate ? m.endDate.slice(0, 10) : '',
          active: m.active !== false,
          notes: m.notes || '',
        });
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    if (name === 'phone' && typeof val === 'string') {
      val = val.replace(/\D/g, '').replace(/^0+/, '').replace(/^91/, '').slice(0, 10);
    }
    setForm((f) => ({ ...f, [name]: val }));
  };

  const normalizePhone = (p) => {
    const digits = String(p || '').replace(/\D/g, '').replace(/^0+/, '').replace(/^91/, '');
    return digits.slice(-10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      phone: normalizePhone(form.phone),
      plan: form.plan || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    try {
      if (isEdit) {
        await updateMember(id, payload);
        navigate('/members');
      } else {
        const payloadWithWelcome = { ...payload, sendWelcome };
        const created = await createMember(payloadWithWelcome);
        setJustAddedName(form.name);
        setWelcomeSent(!!created.welcomeSent);
        if (sendWelcome && !created.welcomeSent) {
          setError(created.welcomeError || 'Welcome message could not be sent. Share the subscribe link below so they can message first.');
          setShowSubscribeCard(true);
          const data = await getWhatsAppSubscribeLink().catch((e) => ({ link: null, message: e.message }));
          if (data.link) setSubscribeLink(data.link);
          else setSubscribeMessage(data.message || 'Configure META_WHATSAPP_PHONE_NUMBER in backend env to get the wa.me link.');
        }
        if (!sendWelcome) {
          const { link } = await getWhatsAppSubscribeLink().catch(() => ({ link: null }));
          if (link) {
            setSubscribeLink(link);
            setShowSubscribeCard(true);
          } else navigate('/members');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit member' : 'Add member'}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/members')}>
          Back
        </button>
      </div>
      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="10 digits (e.g. 9876543210)" />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Plan</label>
            <select name="plan" value={form.plan} onChange={handleChange}>
              <option value="">— Select plan —</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>{p.name} ({p.durationDays}d, ₹{p.price})</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start date</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>End date</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} />
          </div>
          <div className="form-group form-check">
            <label>
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} />
              Active
            </label>
          </div>
          {!isEdit && (
            <div className="form-group form-check">
              <label>
                <input type="checkbox" checked={sendWelcome} onChange={(e) => setSendWelcome(e.target.checked)} />
                Send welcome message via WhatsApp (member receives it automatically, no &quot;Hi&quot; needed)
              </label>
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/members')}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {welcomeSent && (
        <div className="card form-card subscribe-card">
          <h3>Welcome message sent</h3>
          <p><strong>{justAddedName}</strong> received the welcome message on WhatsApp. No need for them to message first — reminders will work automatically.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/members')}>Done</button>
        </div>
      )}
      {showSubscribeCard && (
        <div className="card form-card subscribe-card">
          <h3>Welcome could not be sent</h3>
          <p>Share this link with <strong>{justAddedName}</strong> so they can message first. After that, reminders will work.</p>
          {subscribeLink ? (
            <div className="subscribe-link-row">
              <input type="text" readOnly value={subscribeLink} className="subscribe-link-input" />
              <button type="button" className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(subscribeLink); }}>Copy</button>
            </div>
          ) : subscribeMessage && (
            <p className="form-error">{subscribeMessage}</p>
          )}
          <button type="button" className="btn btn-secondary" onClick={() => { setSubscribeLink(null); setSubscribeMessage(null); setShowSubscribeCard(false); navigate('/members'); }}>Done</button>
        </div>
      )}
    </div>
  );
}
