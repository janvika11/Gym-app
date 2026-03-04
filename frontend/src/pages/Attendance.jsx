import { useEffect, useState } from 'react';
import {
  getMembers,
  updateMember,
  checkInMember,
  uncheckMember,
  getAttendanceMonth,
  getAttendanceToday,
} from '../api';

export default function Attendance() {
  const [members, setMembers] = useState([]);
  const [checkedIn, setCheckedIn] = useState([]);
  const [dailyCounts, setDailyCounts] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [list, todayChecked, counts] = await Promise.all([
          getMembers(),
          getAttendanceToday().catch(() => []),
          (async () => {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            return getAttendanceMonth(year, month).catch(() => ({}));
          })(),
        ]);

        setMembers(list);
        setCheckedIn(todayChecked || []);
        setDailyCounts(counts || {});
      } catch {
        setMembers([]);
      }
    };
    load();
  }, []);

  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const currentDay = today.getDate();

  const toggleCheckIn = async (member) => {
    const id = member._id;
    const wasIn = checkedIn.includes(id);
    const now = new Date();

    setCheckedIn((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

    try {
      if (!wasIn) {
        await updateMember(id, { lastCheckInAt: now.toISOString() });
        await checkInMember(id, now.toISOString());

        const day = now.getDate();
        setDailyCounts((prev) => ({
          ...prev,
          [day]: (prev[day] || 0) + 1,
        }));
      } else {
        await uncheckMember(id, now.toISOString());
        const day = now.getDate();
        setDailyCounts((prev) => {
          const current = prev[day] || 0;
          return {
            ...prev,
            [day]: current > 0 ? current - 1 : 0,
          };
        });
      }
    } catch {
      // ignore persistence errors for now
    }
  };

  const activeMembers = members.filter((m) => m.active !== false);

  return (
    <div>
      <div
        style={{
          background: 'rgba(24,24,27,1)',
          borderRadius: 16,
          border: '1px solid rgba(39,39,42,1)',
          padding: 24,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: '#fff',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              Today&apos;s check‑ins
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(161,161,170,0.9)',
                marginTop: 4,
              }}
            >
              {today.toLocaleDateString()} · {checkedIn.length} members
              present
            </div>
          </div>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              background: 'rgba(198,241,53,0.2)',
              fontSize: 20,
              fontWeight: 800,
              color: '#C6F135',
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {checkedIn.length}/{activeMembers.length || 0}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 10,
          }}
        >
          {activeMembers.map((m) => {
            const isIn = checkedIn.includes(m._id);
            return (
              <div
                key={m._id}
                onClick={() => toggleCheckIn(m)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isIn
                    ? 'rgba(0,230,118,0.1)'
                    : 'rgba(24,24,27,1)',
                  border: `1px solid ${
                    isIn
                      ? 'rgba(0,230,118,0.4)'
                      : 'rgba(39,39,42,1)'
                  }`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: isIn
                      ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                      : 'rgba(39,39,42,1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {isIn ? (
                    <span style={{ color: '#fff', fontSize: 14 }}>✓</span>
                  ) : (
                    <span
                      style={{
                        color: 'rgba(148,163,184,1)',
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {m.name?.[0] || 'M'}
                    </span>
                  )}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: isIn ? '#fff' : 'rgba(226,232,240,0.9)',
                    }}
                  >
                    {m.name}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: 'rgba(148,163,184,0.9)',
                      marginTop: 2,
                    }}
                  >
                    {m.plan?.name || 'No plan'}
                  </div>
                </div>
                <div
                  style={{
                    marginLeft: 'auto',
                    fontSize: 11,
                    color: isIn ? '#4ade80' : 'rgba(148,163,184,0.9)',
                    fontWeight: 600,
                  }}
                >
                  {isIn ? 'Present' : 'Absent'}
                </div>
              </div>
            );
          })}
          {activeMembers.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                color: 'rgba(148,163,184,0.9)',
                fontSize: 13,
              }}
            >
              No active members yet.
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          background: 'rgba(24,24,27,1)',
          borderRadius: 16,
          border: '1px solid rgba(39,39,42,1)',
          padding: 24,
        }}
      >
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 16,
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          {today.toLocaleString('default', { month: 'long' })}{' '}
          {today.getFullYear()} · Attendance overview
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
          }}
        >
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div
              key={d}
              style={{
                textAlign: 'center',
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(148,163,184,0.9)',
                padding: 4,
                textTransform: 'uppercase',
              }}
            >
              {d}
            </div>
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const isToday = day === currentDay;
            const hasPast = day <= currentDay;
            const attendance = hasPast ? dailyCounts[day] || 0 : 0;
            const intensity = hasPast && attendance > 0
              ? Math.min(attendance / 8, 1)
              : 0;
            return (
              <div
                key={day}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isToday
                    ? 'rgba(198,241,53,0.2)'
                    : hasPast
                    ? `rgba(34,197,94,${intensity * 0.25})`
                    : 'rgba(24,24,27,1)',
                  border: isToday
                    ? '1px solid #C6F135'
                    : '1px solid rgba(39,39,42,1)',
                  fontSize: 12,
                  fontWeight: isToday ? 700 : 500,
                  color: isToday
                    ? '#C6F135'
                    : hasPast
                    ? 'rgba(226,232,240,0.9)'
                    : 'rgba(148,163,184,0.9)',
                }}
              >
                {day}
                {hasPast && (
                  <span
                    style={{
                      fontSize: 8,
                      color: 'rgba(148,163,184,0.9)',
                      marginTop: 2,
                    }}
                  >
                    {attendance}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

