import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function AddQuestion() {
  const [formData, setFormData] = useState({
    title: '',
    problemLink: '',
    difficulty: 'Easy',
    topic: '',
    pattern: '',
    notes: '',
    confidenceLevel: 3,
  });
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/questions', formData);
      navigate('/');
    } catch (err) {
      alert('Failed to add question');
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="container max-w-[800px] mx-auto animate-fade-in">
      <h1 className="mb-8">Add New Question</h1>
      <div className="card">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input name="title" className="input" onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Problem Link</label>
              <input name="problemLink" className="input" onChange={handleChange} required />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Difficulty</label>
              <select name="difficulty" className="input" onChange={handleChange}>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
            <div>
              <label className="label">Topic</label>
              <input name="topic" placeholder="e.g., Arrays" className="input" onChange={handleChange} />
            </div>
            <div>
              <label className="label">Pattern</label>
              <input name="pattern" placeholder="e.g., Sliding Window" className="input" onChange={handleChange} />
            </div>
          </div>

          <div>
            <label className="label">Notes / Key Insight</label>
            <textarea 
              name="notes" 
              className="input min-h-[120px]" 
              onChange={handleChange}
              placeholder="What was the trick to solving this?"
            />
          </div>

          <div>
            <label className="label">Initial Confidence Level (1-5)</label>
            <input 
              type="number" 
              name="confidenceLevel" 
              className="input" 
              min="1" max="5" 
              value={formData.confidenceLevel}
              onChange={handleChange}
            />
            <p className="text-sm text-secondary mt-1">1 = Completely Forgot, 5 = Can solve instantly</p>
          </div>

          <div className="flex gap-4 mt-4">
            <button type="submit" className="btn btn-primary">Save Question</button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
