import React, { useState, useEffect } from 'react';
import { Trophy, Hand, Star, Heart } from 'lucide-react';

interface FeedbackSystemProps {
  moodValue: number;
  onFeedbackComplete: () => void;
}

export const FeedbackSystem: React.FC<FeedbackSystemProps> = ({ moodValue, onFeedbackComplete }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'trophy' | 'slap' | 'heart'>('trophy');

  useEffect(() => {
    // Determine feedback type based on mood value
    if (moodValue >= 4) {
      setFeedbackType('trophy');
    } else if (moodValue >= 3) {
      setFeedbackType('heart');
    } else {
      setFeedbackType('slap');
    }

    // Show feedback animation
    setShowFeedback(true);
    
    // Auto-hide after animation
    const timer = setTimeout(() => {
      setShowFeedback(false);
      onFeedbackComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [moodValue, onFeedbackComplete]);

  const getFeedbackContent = () => {
    switch (feedbackType) {
      case 'trophy':
        return {
          icon: <Trophy className="w-12 h-12 text-yellow-500" />,
          message: "Great to hear you're doing well!",
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      case 'heart':
        return {
          icon: <Heart className="w-12 h-12 text-pink-500" />,
          message: "Thanks for sharing your feelings",
          bgColor: 'bg-pink-50',
          borderColor: 'border-pink-200'
        };
      case 'slap':
        return {
          icon: <Hand className="w-12 h-12 text-blue-500" />,
          message: "We're here to support you",
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: <Star className="w-12 h-12 text-gray-500" />,
          message: "Thank you for sharing",
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  if (!showFeedback) return null;

  const feedback = getFeedbackContent();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className={`
        ${feedback.bgColor} ${feedback.borderColor} border-2 rounded-2xl p-8 
        shadow-2xl transform transition-all duration-500 animate-bounce
      `}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-pulse">
            {feedback.icon}
          </div>
          <p className="text-lg font-medium text-gray-800 text-center">
            {feedback.message}
          </p>
        </div>
      </div>
    </div>
  );
};