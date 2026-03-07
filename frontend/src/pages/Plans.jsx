import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlans, deletePlan } from '../api';
import './Plans.css';

const COLORS = ['#64B5F6', '#C6F135', '#FFD740', '#A855F7'];

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    getPlans()
      .then(setPlans)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete plan "${name}"?`)) return;
    setDeleting(id);
    deletePlan(id)
      .then(load)
      .catch((e) => setError(e.message))
      .finally(() => setDeleting(null));
  };

  const getFeatures = (p) => {
    if (p.description) {
      return p.description.split(/[,;]|\n/).map((s) => s.trim()).filter(Boolean);
    }
    return [
      `${p.durationDays || 0} days access`,
      `₹${(p.price ?? 0).toLocaleString('en-IN')}`,
    ];
  };

  if (loading) return <p className="page-message">Loading plans...</p>;
  if (error) return <p className="page-message error">{error}</p>;

  return (
    <div className="page">
      <div className="page-header" style={{ justifyContent: 'flex-end' }}>
        <Link to="/plans/new" className="btn btn-primary">Add plan</Link>
      </div>
      <div className="plans-grid plans-grid-fees-style">
        {plans.length === 0 ? (
          <p className="empty-state">No plans yet. Add a plan to assign to members.</p>
        ) : (
          plans.map((p, idx) => {
            const color = COLORS[idx % COLORS.length];
            const features = getFeatures(p);
            return (
              <div
                key={p._id}
                className="plan-card-fees"
                style={{
                  border: `1px solid ${color}33`,
                  background: 'rgba(24,24,27,1)',
                }}
              >
                <div
                  className="plan-card-fees-circle"
                  style={{ background: `${color}11` }}
                />
                <div className="plan-card-fees-name" style={{ color: '#C6F135' }}>
                  {p.name}
                </div>
                <div className="plan-card-fees-price">
                  ₹{(p.price ?? 0).toLocaleString('en-IN')}
                  <span className="plan-card-fees-period">/ {p.durationDays}d</span>
                </div>
                <div className="plan-card-fees-features">
                  {features.map((f) => (
                    <div key={f} className="plan-card-fees-feature">
                      <span style={{ color }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <div className="plan-card-fees-actions">
                  <Link to={`/plans/${p._id}/edit`} className="btn btn-sm btn-secondary">Edit</Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(p._id, p.name)}
                    disabled={deleting === p._id}
                  >
                    {deleting === p._id ? '...' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
