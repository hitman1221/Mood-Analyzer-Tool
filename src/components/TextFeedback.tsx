import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

interface TextFeedbackProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
  currentPeriod: string;
}

export const TextFeedback: React.FC<TextFeedbackProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  currentPeriod 
}) => {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmit(feedback.trim());
      setFeedback('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Additional Thoughts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Would you like to share more about how you've been feeling {currentPeriod.toLowerCase()}?
        </p>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your thoughts, experiences, or anything else you'd like to add..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            maxLength={500}
          />
          
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              {feedback.length}/500 characters
            </span>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={!feedback.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                <span>Submit</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};