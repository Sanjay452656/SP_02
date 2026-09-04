import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Eye, CheckCircle2 } from 'lucide-react';

export default function RevisionSession() {
  const [revisions, setRevisions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        const res = await api.get('/revisions/today');
        setRevisions(res.data);
      } catch (err) {
        console.error('Failed to load revisions', err);
      }
    };
    fetchRevisions();
  }, []);

  if (revisions.length === 0) {
    return (
      <div className="container text-center mt-20 animate-fade-in">
        <CheckCircle2 size={64} className="mx-auto mb-4" color="var(--success-color)" />
        <h2>All Caught Up!</h2>
        <p className="text-secondary mt-2">You have completed all revisions for today.</p>
        <button className="btn btn-primary mt-6" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>
    );
  }

  const currentRevision = revisions[currentIndex];
  const q = currentRevision.userQuestion.question;
  const uq = currentRevision.userQuestion;

  const handleFeedback = async (feedback: string) => {
    try {
      await api.post(`/revisions/${currentRevision.id}/complete`, { feedback });
      
      if (currentIndex + 1 < revisions.length) {
        setCurrentIndex(currentIndex + 1);
        setShowNotes(false);
      } else {
        // Session complete
        setRevisions([]);
      }
    } catch (err) {
      alert('Error saving revision');
    }
  };

  return (
    <div className="container max-w-[800px] mx-auto animate-fade-in py-12">
      <div className="text-center mb-8">
        <div className="text-sm font-semibold text-secondary mb-2">
          Question {currentIndex + 1} of {revisions.length}
        </div>
        <h1>{q.title}</h1>
        <div className="flex justify-center gap-2 mt-4">
          <span className="tag">{q.difficulty}</span>
          <span className="tag">{q.topic}</span>
          {uq.pattern && <span className="tag">{uq.pattern}</span>}
        </div>
      </div>

      <div className="card text-center min-h-[300px] flex flex-col justify-center items-center">
        {!showNotes ? (
          <div>
            <p className="text-lg text-secondary mb-8 max-w-md mx-auto">
              Think about the approach and the key insights required to solve this problem.
            </p>
            <button className="btn btn-outline" onClick={() => setShowNotes(true)}>
              <Eye size={18} className="mr-2" /> Show Notes & Pattern
            </button>
          </div>
        ) : (
          <div className="w-full text-left animate-fade-in">
            <h3 className="mb-4 text-primary border-b pb-2">Your Notes</h3>
            <div className="bg-gray-50 p-4 rounded-md border text-secondary mb-6 whitespace-pre-wrap">
              {uq.notes || "No notes saved for this question."}
            </div>
            
            {uq.mistakes && (
              <div className="mb-6">
                <h4 className="text-danger-color font-semibold mb-2">Past Mistakes</h4>
                <p>{uq.mistakes}</p>
              </div>
            )}

            <div className="mt-8 border-t pt-6 text-center">
              <h3 className="mb-6">Did you remember the approach?</h3>
              <div className="flex gap-4 justify-center">
                <button 
                  className="btn btn-outline hover:bg-green-50 hover:text-green-700 hover:border-green-500"
                  onClick={() => handleFeedback('Easily')}
                >
                  Easily
                </button>
                <button 
                  className="btn btn-outline hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-500"
                  onClick={() => handleFeedback('With Hint')}
                >
                  With Hint
                </button>
                <button 
                  className="btn btn-outline hover:bg-red-50 hover:text-red-700 hover:border-red-500"
                  onClick={() => handleFeedback('Completely Forgot')}
                >
                  Completely Forgot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
