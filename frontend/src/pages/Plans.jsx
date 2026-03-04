import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlans, deletePlan } from '../api';
import './Plans.css';

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

  if (loading) return <p className="page-message">Loading plans...</p>;
  if (error) return <p className="page-message error">{error}</p>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Plans</h1>
        <Link to="/plans/new" className="btn btn-primary">Add plan</Link>
      </div>
      <div className="plans-grid">
        {plans.length === 0 ? (
          <p className="empty-state">No plans yet. Add a plan to assign to members.</p>
        ) : (
          plans.map((p) => (
            <div key={p._id} className="plan-card card">
              <h3>{p.name}</h3>
              <p className="plan-meta">{p.durationDays} days · ₹{p.price}</p>
              {p.description && <p className="plan-desc">{p.description}</p>}
              <span className={`badge ${p.active ? 'badge-success' : 'badge-muted'}`}>
                {p.active ? 'Active' : 'Inactive'}
              </span>
              <div className="plan-actions">
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
          ))
        )}
      </div>
    </div>
  );
}
