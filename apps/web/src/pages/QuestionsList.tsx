import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const difficultyColor: Record<string, string> = {
  Easy: 'var(--success-color)',
  Medium: 'var(--warning-color)',
  Hard: 'var(--danger-color)',
};

export default function QuestionsList() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState('All');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/questions');
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = questions.filter((q) => {
    const title = q.question?.title?.toLowerCase() || '';
    const topic = q.question?.topic?.toLowerCase() || '';
    const matchSearch = title.includes(search.toLowerCase()) || topic.includes(search.toLowerCase());
    const matchDiff = diffFilter === 'All' || q.question?.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  if (loading) {
    return <div className="text-center my-8 text-secondary">Loading your questions...</div>;
  }

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1>My Questions</h1>
          <p className="text-secondary">{questions.length} problems tracked so far</p>
        </div>
        <Link to="/add" className="btn btn-primary">+ Add Manually</Link>
      </div>

      {/* Filters */}
      <div className="card mb-6" style={{ padding: '16px 20px' }}>
        <div className="flex gap-4 items-center" style={{ flexWrap: 'wrap' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: '200px', marginBottom: 0 }}
          />
          {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              className="btn"
              style={{
                backgroundColor: diffFilter === d ? 'var(--primary-color)' : 'transparent',
                color: diffFilter === d ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                padding: '6px 16px',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px' }}>
          <p className="text-secondary" style={{ fontSize: '16px' }}>
            {questions.length === 0
              ? 'No questions yet! Solve a problem on LeetCode and save it with the extension.'
              : 'No questions match your filters.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((uq, index) => (
            <div
              key={uq.id}
              className="card"
              style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', minWidth: '28px', fontWeight: 600 }}>
                  #{index + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <a
                    href={uq.question?.problemLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontWeight: 600, color: 'var(--primary-color)', textDecoration: 'none', fontSize: '15px' }}
                  >
                    {uq.question?.title}
                  </a>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {uq.question?.topic} {uq.pattern && `• ${uq.pattern}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  color: difficultyColor[uq.question?.difficulty] || 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  minWidth: '60px',
                  textAlign: 'right'
                }}>
                  {uq.question?.difficulty}
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: 'var(--bg-secondary)',
                  fontSize: '13px',
                  color: 'var(--text-secondary)'
                }}>
                  {'★'.repeat(uq.confidenceLevel || 0)}{'☆'.repeat(5 - (uq.confidenceLevel || 0))}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(uq.solvedDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
