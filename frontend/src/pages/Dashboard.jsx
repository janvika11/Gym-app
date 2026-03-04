import { useEffect, useState } from 'react';
import { getStats, getAttendanceTodayHours } from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [peak, setPeak] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setError('');
        const [statsJson, peakRes] = await Promise.all([
          getStats(),
          getAttendanceTodayHours().catch(() => ({})),
        ]);
        setData(statsJson);
        setPeak(peakRes || {});
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = data
    ? [
        {
          label: 'Active Members',
          value: data.activeMembers,
          sub: `${data.monthMembers || 0} joined this month`,
          color: '#C6F135',
        },
        {
          label: 'Revenue',
          value: `₹${data.totalRevenue?.toLocaleString?.('en-IN') || 0}`,
          sub: 'collected (paid plans)',
          color: '#00E676',
        },
        {
          label: 'Pending Dues',
          value: `₹${data.pendingDues?.toLocaleString?.('en-IN') || 0}`,
          sub: `${data.overdueCount || 0} overdue member${
            (data.overdueCount || 0) === 1 ? '' : 's'
          }`,
          color: '#FFD740',
        },
        {
          label: 'Attendance',
          value: `${data.avgAttendance ?? 0}%`,
          sub: 'avg this month',
          color: '#64B5F6',
        },
      ]
    : [];

  const activity =
    data?.recentActivity?.map((log) => ({
      text: `${log.memberName || 'Member'} – ${log.title}`,
      time: new Date(log.createdAt).toLocaleDateString(),
      dot: log.status === 'sent' ? '#22c55e' : '#f97373',
    })) || [];

  const hours = Array.from({ length: 14 }, (_, i) => i + 6);
  const peakData = hours.map((h) => (peak && peak[h] ? peak[h] : 0));
  const maxPeak = Math.max(...peakData, 1);

  return (
    <div className="dashboard-page">
      {error && <p className="page-message error">{error}</p>}
      {loading && !error && (
        <p className="page-message">Loading dashboard...</p>
      )}

      {!loading && !error && (
        <>
          <div className="dashboard-grid">
            {stats.map((s) => (
              <div key={s.label} className="dash-card">
                <div className="dash-label">{s.label}</div>
                <div className="dash-value" style={{ color: s.color }}>
                  {s.value}
                </div>
                <div className="dash-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          <div className="dash-row">
              <div className="dash-panel">
              <div className="dash-panel-title">Peak hours today</div>
              <div className="dash-peak-chart">
                {peakData.map((val, i) => {
                  const isActive = val > 0;
                  const heightPct = (val / maxPeak) * 100;
                  return (
                    <div key={hours[i]} className="dash-peak-bar-wrap">
                      <div
                        className={`dash-peak-bar ${
                          isActive ? 'dash-peak-bar-active' : 'dash-peak-bar-faint'
                        }`}
                        style={{ height: `${heightPct || 5}%` }}
                      />
                      <span className="dash-peak-hour">{hours[i]}:00</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="dash-panel">
              <div className="dash-panel-title">Recent activity</div>
              <div className="dash-activity-list">
                {activity.length === 0 ? (
                  <p className="empty-state">No activity yet.</p>
                ) : (
                  activity.map((a, idx) => (
                    <div key={idx} className="dash-activity-item">
                      <span
                        className="dash-activity-dot"
                        style={{ backgroundColor: a.dot }}
                      />
                      <div className="dash-activity-text">{a.text}</div>
                      <div className="dash-activity-time">{a.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

