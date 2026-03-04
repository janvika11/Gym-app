import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMember, createMember, updateMember, getPlans } from '../api';
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

  useEffect(() => {
    getPlans()
      .then((list) => {
        // Hide any old generic "Monthly" seed plans
        setPlans(list.filter((p) => !/monthly/i.test(p.name)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    getMember(id)
      .then((m) => {
        setForm({
          name: m.name || '',
          email: m.email || '',
          phone: m.phone || '',
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
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const payload = {
      ...form,
      plan: form.plan || undefined,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };
    try {
      if (isEdit) {
        await updateMember(id, payload);
      } else {
        await createMember(payload);
      }
      navigate('/members');
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
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="10 digits" />
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
    </div>
  );
}
