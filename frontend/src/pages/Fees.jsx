import { useEffect, useState } from 'react';
import { getPlans } from '../api';

const PAYMENTS = [
  { id: 1, member: 'Rahul Sharma', amount: 2500, date: '2026-02-15', method: 'UPI', status: 'paid' },
  { id: 2, member: 'Priya Patel', amount: 1500, date: '2026-02-28', method: 'Cash', status: 'paid' },
  { id: 3, member: 'Sneha Reddy', amount: 3500, date: '2026-02-20', method: 'Card', status: 'paid' },
  { id: 4, member: 'Amit Kumar', amount: 2500, date: '2026-01-10', method: 'UPI', status: 'pending' },
  { id: 5, member: 'Neha Gupta', amount: 3500, date: '2026-02-12', method: 'UPI', status: 'paid' },
  { id: 6, member: 'Arjun Mehta', amount: 2500, date: '2026-01-28', method: 'Cash', status: 'pending' },
  { id: 7, member: 'Kavita Nair', amount: 1500, date: '2026-02-01', method: 'Card', status: 'paid' },
];

export default function Fees() {
  const [tab, setTab] = useState('all');
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    getPlans()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  const colors = ['#64B5F6', '#C6F135', '#FFD740', '#A855F7'];
  const featureMap = {
    Basic: [
      'Gym floor access',
      'Locker room',
      'Water cooler',
    ],
    Premium: [
      'Everything in Basic',
      'Group classes',
      'Diet plan',
      'Personal locker',
    ],
    Gold: [
      'Everything in Premium',
      'Personal trainer',
      'Sauna & steam',
      'Supplement discount',
    ],
  };

  const filteredPayments = tab === 'all' ? PAYMENTS : PAYMENTS.filter((p) => p.status === tab);
  const totalPaid = PAYMENTS.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = PAYMENTS.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
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
          const uiFeatures =
            featureMap[p.name] ||
            [
              `${p.durationDays || 0} days access`,
              `₹${p.price?.toLocaleString?.() ?? p.price}`,
              p.description || 'Custom gym plan',
            ];
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

        {filteredPayments.map((p) => (
          <div
            key={p.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
              alignItems: 'center',
              gap: 12,
              padding: '14px 20px',
              borderBottom: '1px solid rgba(39,39,42,0.7)',
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: '#fff',
              }}
            >
              {p.member}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
              }}
            >
              ₹{p.amount.toLocaleString()}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              {p.date} · {p.method}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background:
                    p.status === 'paid'
                      ? 'rgba(0,230,118,0.1)'
                      : 'rgba(255,215,64,0.1)',
                  color:
                    p.status === 'paid' ? '#00E676' : '#FFD740',
                }}
              >
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

