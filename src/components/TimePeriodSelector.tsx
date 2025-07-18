import React from 'react';
import { Calendar, Clock, Sun } from 'lucide-react';

interface TimePeriod {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (periodId: string) => void;
}

const timePeriods: TimePeriod[] = [
  {
    id: 'today',
    label: 'Today',
    icon: <Sun className="w-5 h-5" />,
    description: 'How are you feeling right now?'
  },
  {
    id: 'week',
    label: 'This Week',
    icon: <Clock className="w-5 h-5" />,
    description: 'Your overall mood this week'
  },
  {
    id: 'month',
    label: 'This Month',
    icon: <Calendar className="w-5 h-5" />,
    description: 'Your general emotional state this month'
  }
];

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({ selectedPeriod, onPeriodChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 text-center">Choose Time Period</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timePeriods.map((period) => (
          <button
            key={period.id}
            onClick={() => onPeriodChange(period.id)}
            className={`
              p-4 rounded-xl border-2 transition-all duration-300 text-left
              ${selectedPeriod === period.id 
                ? 'border-blue-500 bg-blue-50 shadow-lg' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${selectedPeriod === period.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                {period.icon}
              </div>
              <div>
                <h4 className={`font-medium ${selectedPeriod === period.id ? 'text-blue-800' : 'text-gray-800'}`}>
                  {period.label}
                </h4>
                <p className="text-sm text-gray-600">{period.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};