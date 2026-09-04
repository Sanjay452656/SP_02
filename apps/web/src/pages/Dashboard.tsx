import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import {
  BrainCircuit, Target, Flame, TrendingUp, BookOpen,
  CheckCircle2, AlertCircle, ArrowRight, ExternalLink, BarChart3
} from 'lucide-react';

const diffColor: Record<string, string> = {
  Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444'
};

const TOPIC_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'
];

function HeatmapCell({ count }: { count: number }) {
  const opacity = count === 0 ? 0.06 : count === 1 ? 0.3 : count === 2 ? 0.55 : count >= 3 ? 0.85 : 0.06;
  return (
    <div
      title={`${count} solve${count !== 1 ? 's' : ''}`}
      style={{
        width: 13,
        height: 13,
        borderRadius: 3,
        backgroundColor: `rgba(79, 70, 229, ${opacity})`,
        border: count > 0 ? '1px solid rgba(79,70,229,0.2)' : '1px solid rgba(0,0,0,0.06)',
        transition: 'transform 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.4)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    />
  );
}

function StatCard({ label, value, sub, color, icon }: { label: string; value: any; sub?: string; color?: string; icon: React.ReactNode }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8, position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.03em', textTransform: 'uppercase' }}>{label}</span>
        <div style={{ opacity: 0.15, color: color || 'var(--primary-color)' }}>{icon}</div>
      </div>
      <div style={{ fontSize: 40, fontWeight: 800, color: color || 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/stats/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 16 }}>
        <BrainCircuit size={48} color="var(--primary-color)" style={{ opacity: 0.4 }} />
        <span style={{ color: 'var(--text-secondary)' }}>Loading your dashboard...</span>
      </div>
    );
  }

  const s = stats || {};
  const heatmap: { date: string; count: number }[] = s.heatmap || [];
  const topics: { topic: string; count: number }[] = s.topicBreakdown || [];
  const maxTopic = topics[0]?.count || 1;
  const diff = s.difficultyBreakdown || { Easy: 0, Medium: 0, Hard: 0 };
  const totalDiff = (diff.Easy + diff.Medium + diff.Hard) || 1;
  const upcoming: any[] = s.upcoming || [];
  const recent: any[] = s.recentActivity || [];

  // Group heatmap into weeks
  const weeks: { date: string; count: number }[][] = [];
  let week: { date: string; count: number }[] = [];
  for (const cell of heatmap) {
    week.push(cell);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length > 0) weeks.push(week);

  return (
    <div className="animate-fade-in" style={{ maxWidth: 1200, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>Your Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {s.needRevisionToday > 0 && (
            <Link to="/revise" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} /> Start Revision ({s.needRevisionToday})
            </Link>
          )}
          <Link to="/add" className="btn" style={{ border: '1px solid var(--border-color)', background: 'white' }}>+ Add Question</Link>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Solved" value={s.totalSolved || 0} sub="Problems logged" color="var(--primary-color)" icon={<BarChart3 size={48} />} />
        <StatCard label="Day Streak" value={`${s.streak || 0}🔥`} sub="Consecutive solve days" color="#f59e0b" icon={<Flame size={48} />} />
        <StatCard label="Due Today" value={s.needRevisionToday || 0} sub="Revisions pending" color={s.needRevisionToday > 0 ? '#ef4444' : '#22c55e'} icon={<AlertCircle size={48} />} />
        <StatCard label="Retention" value={`${s.retentionRate || 0}%`} sub="Revisions completed" color="#10b981" icon={<TrendingUp size={48} />} />
        <StatCard label="Strong" value={s.strongQuestions || 0} sub="Confidence ≥ 4★" color="#22c55e" icon={<CheckCircle2 size={48} />} />
        <StatCard label="Weak" value={s.weakQuestions || 0} sub="Confidence < 4★ – review these" color="#ef4444" icon={<Target size={48} />} />
      </div>

      {/* Row 2: Heatmap + Difficulty */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, marginBottom: 24 }}>

        {/* Activity Heatmap */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--text-primary)' }}>Activity Heatmap — Last 12 Weeks</div>
          <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 4 }}>
            {weeks.map((wk, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {wk.map((cell, ci) => <HeatmapCell key={ci} count={cell.count} />)}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>Less</span>
            {[0.06, 0.3, 0.55, 0.85].map((op, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: `rgba(79,70,229,${op})` }} />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Difficulty Split</div>
          {['Easy', 'Medium', 'Hard'].map((d) => (
            <div key={d} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ fontWeight: 600, color: diffColor[d] }}>{d}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{diff[d]} problems</span>
              </div>
              <div style={{ height: 8, borderRadius: 8, backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(diff[d] / totalDiff) * 100}%`,
                  backgroundColor: diffColor[d],
                  borderRadius: 8,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--bg-secondary)', fontSize: 13, textAlign: 'center', color: 'var(--text-secondary)' }}>
            {totalDiff} problems total
          </div>
        </div>
      </div>

      {/* Row 3: Topics + Upcoming + Recent */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

        {/* Topic Breakdown */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Topic Mastery</div>
          {topics.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No data yet. Start solving!</p>
          ) : (
            topics.map((t, i) => (
              <div key={t.topic} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.topic}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{t.count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 6, backgroundColor: 'var(--bg-secondary)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(t.count / maxTopic) * 100}%`,
                    backgroundColor: TOPIC_COLORS[i % TOPIC_COLORS.length],
                    borderRadius: 6,
                    transition: 'width 0.8s ease',
                  }} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Upcoming Revisions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Upcoming Revisions</div>
            {upcoming.length > 0 && (
              <Link to="/revise" style={{ fontSize: 12, color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                Start <ArrowRight size={12} />
              </Link>
            )}
          </div>
          {upcoming.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <CheckCircle2 size={36} color="#22c55e" style={{ opacity: 0.5, marginBottom: 8 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>All caught up! No revisions this week.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {upcoming.map((rev) => {
                const d = new Date(rev.scheduledDate);
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div key={rev.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: 8,
                    backgroundColor: isToday ? 'rgba(239,68,68,0.06)' : 'var(--bg-secondary)',
                    border: isToday ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
                  }}>
                    <div>
                      <a href={rev.problemLink} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
                        {rev.title}
                      </a>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Rev #{rev.revisionNumber} · {isToday ? 'Today' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: diffColor[rev.difficulty] }}>{rev.difficulty}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Recently Solved</div>
            <Link to="/questions" style={{ fontSize: 12, color: 'var(--primary-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No questions solved yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {recent.map((uq) => (
                <div key={uq.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: 8, backgroundColor: 'var(--bg-secondary)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <a href={uq.problemLink} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uq.title}</span>
                      <ExternalLink size={10} style={{ flexShrink: 0 }} />
                    </a>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {uq.topic} · {'★'.repeat(uq.confidenceLevel || 0)}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: diffColor[uq.difficulty], marginLeft: 8, flexShrink: 0 }}>{uq.difficulty}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
