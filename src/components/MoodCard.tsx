import React from 'react';
import { Trophy, Hand } from 'lucide-react';

interface MoodCardProps {
  mood: {
    id: string;
    name: string;
    emoji: string;
    color: string;
    description: string;
    value: number;
  };
  isSelected: boolean;
  onSelect: (moodId: string) => void;
  showFeedback?: boolean;
  feedbackType?: 'trophy' | 'slap' | null;
}

export const MoodCard: React.FC<MoodCardProps> = ({ 
  mood, 
  isSelected, 
  onSelect, 
  showFeedback = false,
  feedbackType = null 
}) => {
  const handleClick = () => {
    onSelect(mood.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative cursor-pointer p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105
        ${isSelected 
          ? `border-${mood.color} bg-${mood.color}/10 shadow-lg scale-105` 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
        }
      `}
    >
      {/* Feedback Icons */}
      {showFeedback && feedbackType && (
        <div className="absolute -top-2 -right-2 z-10">
          {feedbackType === 'trophy' && (
            <div className="bg-yellow-400 rounded-full p-2 shadow-lg animate-bounce">
              <Trophy className="w-4 h-4 text-yellow-800" />
            </div>
          )}
          {feedbackType === 'slap' && (
            <div className="bg-red-400 rounded-full p-2 shadow-lg animate-pulse">
              <Hand className="w-4 h-4 text-red-800" />
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col items-center space-y-3">
        {/* Emoji Face */}
        <div className={`
          text-4xl md:text-5xl transition-all duration-300 
          ${isSelected ? 'scale-110' : 'hover:scale-105'}
        `}>
          {mood.emoji}
        </div>
        
        {/* Mood Info */}
        <div className="text-center">
          <h3 className={`font-semibold text-sm md:text-base ${isSelected ? `text-${mood.color}` : 'text-gray-800'}`}>
            {mood.name}
          </h3>
          <p className="text-xs text-gray-600 mt-1 hidden md:block">{mood.description}</p>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className={`absolute top-2 right-2 w-3 h-3 bg-${mood.color} rounded-full animate-pulse`} />
      )}
    </div>
  );
};