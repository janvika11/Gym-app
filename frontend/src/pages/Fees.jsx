import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPlans, getStats, getMembers } from '../api';

export default function Fees() {
  const [tab, setTab] = useState('all');
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingDues: 0 });
  const [members, setMembers] = useState([]);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
    getStats()
      .then((s) => setStats({ totalRevenue: s.totalRevenue || 0, pendingDues: s.pendingDues || 0 }))
      .catch(() => {});
    getMembers()
      .then(setMembers)
      .catch(() => setMembers([]));
  }, []);

  const colors = ['#64B5F6', '#C6F135', '#FFD740', '#A855F7'];
  const getFeatures = (p) => {
    if (p.description) {
      return p.description.split(/[,;]|\n/).map((s) => s.trim()).filter(Boolean);
    }
    return [
      `${p.durationDays || 0} days access`,
      `₹${(p.price ?? 0).toLocaleString('en-IN')}`,
    ];
  };

  const getMemberStatus = (m) => {
    if (!m.plan) return null;
    if (m.paymentStatus === 'paid') return 'paid';
    if (m.paymentStatus === 'overdue' || (m.endDate && new Date(m.endDate) < new Date())) return 'pending';
    return m.paymentStatus === 'pending' ? 'pending' : 'paid';
  };

  const membersWithPlans = members.filter((m) => m.plan);
  const payments = membersWithPlans.map((m) => ({
    id: m._id,
    member: m.name,
    amount: m.plan?.price || 0,
    status: getMemberStatus(m),
  })).filter((p) => p.status);

  const filteredPayments = tab === 'all' ? payments : payments.filter((p) => p.status === tab);
  const totalPaid = stats.totalRevenue;
  const totalPending = stats.pendingDues;

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 12,
          marginBottom: 24,
        }}
      >
        <Link
          to="/plans"
          className="btn btn-primary"
          style={{
            flexShrink: 0,
            textDecoration: 'none',
            display: 'inline-block',
          }}
        >
          Manage plans (Add / Edit)
        </Link>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {plans.map((p, idx) => {
          const color = colors[idx % colors.length];
          const uiFeatures = getFeatures(p);
          return (
          <div
            key={p._id}
            style={{
              background: 'rgba(24,24,27,1)',
              border: `1px solid ${color}33`,
              borderRadius: 16,
              padding: 24,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: `${color}11`,
              }}
            />
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#C6F135',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8,
              }}
            >
              {p.name}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: '#fff',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              ₹{p.price}
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                /mo
              </span>
            </div>
            <div style={{ marginTop: 16 }}>
              {uiFeatures.map((f) => (
                <div
                  key={f}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '4px 0',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.6)',
                  }}
                >
                  <span style={{ color }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        )})}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: 'rgba(0,230,118,0.06)',
            borderRadius: 14,
            padding: '18px 20px',
            border: '1px solid rgba(0,230,118,0.2)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#00E676',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Collected
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#fff',
              fontFamily: "'Outfit', sans-serif",
              marginTop: 4,
            }}
          >
            ₹{totalPaid.toLocaleString()}
          </div>
        </div>

        <div
          style={{
            background: 'rgba(255,215,64,0.06)',
            borderRadius: 14,
            padding: '18px 20px',
            border: '1px solid rgba(255,215,64,0.2)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#FFD740',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            Pending
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#fff',
              fontFamily: "'Outfit', sans-serif",
              marginTop: 4,
            }}
          >
            ₹{totalPending.toLocaleString()}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'rgba(24,24,27,1)',
          borderRadius: 16,
          border: '1px solid rgba(39,39,42,1)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(39,39,42,1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            Payment history
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['all', 'paid', 'pending'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                style={{
                  border: 'none',
                  borderRadius: 8,
                  padding: '6px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background:
                    tab === t ? 'rgba(198,241,53,0.15)' : 'transparent',
                  color:
                    tab === t
                      ? '#C6F135'
                      : 'rgba(255,255,255,0.45)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
            No payment records yet. Add members with plans to see fee status here.
          </div>
        ) : (
          filteredPayments.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                borderBottom: '1px solid rgba(39,39,42,0.7)',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>
                {p.member}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                ₹{(p.amount || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: p.status === 'paid' ? 'rgba(0,230,118,0.1)' : 'rgba(255,215,64,0.1)',
                    color: p.status === 'paid' ? '#00E676' : '#FFD740',
                  }}
                >
                  {p.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

