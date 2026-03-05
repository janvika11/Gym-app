import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPlan, createPlan, updatePlan } from '../api';
import './PlanForm.css';

export default function PlanForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({
    name: '',
    durationDays: 30,
    price: 0,
    description: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getPlan(id)
      .then((p) => setForm({
        name: p.name || '',
        durationDays: p.durationDays ?? 30,
        price: p.price != null ? String(p.price) : '',
        description: p.description || '',
        active: p.active !== false,
      }))
      .catch((e) => setError(e.message));
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm((f) => ({ ...f, [name]: checked }));
      return;
    }
    if (name === 'price') {
      // Keep as string while typing; strip leading zeros to avoid "04000"
      let cleaned = value.replace(/[^\d.]/g, '');
      cleaned = cleaned.replace(/^0+(?=\d)/, '').replace(/^0+\./, '0.'); // 04000->4000, 00.5->0.5
      const parts = cleaned.split('.');
      const normalized = parts.length > 1
        ? (parts[0] || '0') + '.' + parts.slice(1).join('').slice(0, 2)
        : (cleaned || '');
      setForm((f) => ({ ...f, [name]: normalized }));
      return;
    }
    if (name === 'durationDays') {
      setForm((f) => ({ ...f, [name]: value === '' ? '' : Math.max(0, parseInt(value, 10) || 0) }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) {
        await updatePlan(id, form);
      } else {
        await createPlan(form);
      }
      navigate('/plans');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isEdit ? 'Edit plan' : 'Add plan'}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/plans')}>Back</button>
      </div>
      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Plan name *</label>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Monthly" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Duration (days) *</label>
              <input type="number" name="durationDays" min={1} value={form.durationDays} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Price (₹) *</label>
              <input type="text" inputMode="decimal" name="price" value={form.price} onChange={handleChange} placeholder="0" required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2} />
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
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/plans')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
