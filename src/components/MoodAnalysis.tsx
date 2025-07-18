import React from 'react';
import { AlertTriangle, CheckCircle, Info, Heart, Phone, ExternalLink, TrendingUp, TrendingDown, Minus, Shield } from 'lucide-react';
import { MentalHealthAssessment } from '../services/aiAssessment';

interface MoodData {
  [key: string]: string;
}

interface TextFeedbackData {
  [key: string]: string;
}

interface MoodAnalysisProps {
  moodData: MoodData;
  textFeedbackData?: TextFeedbackData;
  comprehensiveAssessment?: MentalHealthAssessment | null;
  onRestart: () => void;
}

export const MoodAnalysis: React.FC<MoodAnalysisProps> = ({ 
  moodData, 
  textFeedbackData = {}, 
  comprehensiveAssessment,
  onRestart 
}) => {
  const calculateMoodScore = (): number => {
    const moodValues: { [key: string]: number } = {
      'joyful': 5,
      'content': 4,
      'calm': 4,
      'neutral': 3,
      'tired': 2,
      'anxious': 1,
      'sad': 1,
      'angry': 1
    };

    const scores = Object.values(moodData).map(mood => moodValues[mood] || 3);
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const getMoodInsight = (score: number, assessment?: MentalHealthAssessment | null) => {
    // Use comprehensive assessment if available
    if (assessment) {
      if (assessment.riskLevel === 'high' || assessment.urgencyLevel === 'immediate') {
        return {
          level: 'concerning',
          title: 'Immediate Support Recommended',
          message: 'Your assessment indicates you may benefit from immediate professional support. Please consider reaching out to a mental health professional or crisis helpline.',
          icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
          color: 'red'
        };
      } else if (assessment.riskLevel === 'moderate') {
        return {
          level: 'moderate',
          title: 'Consider Professional Support',
          message: 'Your assessment suggests you might benefit from professional guidance to develop coping strategies and support your mental well-being.',
          icon: <Info className="w-8 h-8 text-amber-500" />,
          color: 'amber'
        };
      } else {
        return {
          level: 'positive',
          title: 'You\'re Managing Well',
          message: 'Your assessment shows positive emotional patterns. Continue your current self-care practices and stay mindful of your mental health.',
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          color: 'green'
        };
      }
    }

    // Fallback to basic scoring
    if (score >= 4) {
      return {
        level: 'positive',
        title: 'You\'re doing well!',
        message: 'Your mood analysis shows positive emotional patterns. Keep up the good self-care practices.',
        icon: <CheckCircle className="w-8 h-8 text-green-500" />,
        color: 'green'
      };
    } else if (score >= 2.5) {
      return {
        level: 'neutral',
        title: 'You\'re managing okay',
        message: 'Your mood shows some ups and downs, which is completely normal. Consider some gentle self-care activities.',
        icon: <Info className="w-8 h-8 text-blue-500" />,
        color: 'blue'
      };
    } else {
      return {
        level: 'concerning',
        title: 'Consider seeking support',
        message: 'Your mood analysis suggests you might benefit from additional support. Please consider reaching out to a mental health professional.',
        icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
        color: 'amber'
      };
    }
  };

  const moodScore = calculateMoodScore();
  const insight = getMoodInsight(moodScore, comprehensiveAssessment);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'concerning':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Analysis Results */}
      <div className="bg-white rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Mood Analysis</h2>
          <div className="flex justify-center mb-6">
            {insight.icon}
          </div>
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">{insight.title}</h3>
          <p className="text-gray-600 text-lg leading-relaxed">{insight.message}</p>
        </div>

        {/* Mood Score Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Current Mood Score</h4>
            <div className="flex items-center space-x-4">
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full bg-${insight.color}-500 transition-all duration-1000`}
                  style={{ width: `${(comprehensiveAssessment?.overallScore || moodScore) / 5 * 100}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {comprehensiveAssessment?.overallScore?.toFixed(1) || moodScore}/5
              </span>
            </div>
          </div>

          {comprehensiveAssessment && (
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Risk Assessment</h4>
              <div className="flex items-center space-x-3">
                <Shield className={`w-6 h-6 ${
                  comprehensiveAssessment.riskLevel === 'high' ? 'text-red-500' :
                  comprehensiveAssessment.riskLevel === 'moderate' ? 'text-amber-500' :
                  'text-green-500'
                }`} />
                <span className="text-lg font-medium capitalize">
                  {comprehensiveAssessment.riskLevel} Risk
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Comprehensive Assessment Results */}
        {comprehensiveAssessment && (
          <div className="space-y-6 mb-8">
            {/* Primary Concerns */}
            {comprehensiveAssessment.primaryConcerns.length > 0 && (
              <div className="bg-amber-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-amber-800 mb-3">Areas of Focus</h4>
                <ul className="space-y-2">
                  {comprehensiveAssessment.primaryConcerns.map((concern, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-amber-700">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Strengths */}
            {comprehensiveAssessment.strengths.length > 0 && (
              <div className="bg-green-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-green-800 mb-3">Your Strengths</h4>
                <ul className="space-y-2">
                  {comprehensiveAssessment.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-green-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Mood Timeline */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800">Your Mood Timeline</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(moodData).map(([period, mood]) => (
              <div key={period} className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-700 capitalize">{period}</h5>
                <p className="text-gray-600 capitalize">{mood}</p>
                {textFeedbackData[period] && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                    <p className="italic">"{textFeedbackData[period]}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Professional Help Section */}
      {(insight.level === 'concerning' || comprehensiveAssessment?.requiresProfessionalHelp) && (
        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Heart className="w-6 h-6 text-amber-600 mt-1" />
            <div>
              <h4 className="text-lg font-semibold text-amber-800 mb-2">Professional Support Resources</h4>
              <p className="text-amber-700 mb-4">
                {comprehensiveAssessment?.urgencyLevel === 'immediate' 
                  ? 'Immediate support is recommended. Please consider contacting these resources right away:'
                  : 'Remember, seeking help is a sign of strength, not weakness. Here are some resources that might help:'
                }
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {comprehensiveAssessment?.supportResources?.map((resource, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                    <h5 className="font-medium text-amber-800 mb-1">{resource.name}</h5>
                    <p className="text-sm text-amber-700 mb-2">{resource.description}</p>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-700">{resource.contact}</span>
                    </div>
                    {resource.url && (
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-amber-600 hover:text-amber-800 underline mt-1 inline-block"
                      >
                        Visit website
                      </a>
                    )}
                  </div>
                )) || (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-700">National Suicide Prevention Lifeline: 988</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="w-5 h-5 text-amber-600" />
                      <a href="https://www.psychologytoday.com/us/therapists" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-900 underline">
                        Find a therapist near you
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Self-Care Suggestions */}
      <div className="bg-blue-50 rounded-2xl p-6">
        <h4 className="text-lg font-semibold text-blue-800 mb-4">Self-Care Suggestions</h4>
        {comprehensiveAssessment?.recommendations ? (
          <div className="space-y-3">
            {comprehensiveAssessment.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-blue-700">{recommendation}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h5 className="font-medium text-blue-700">Daily Practices</h5>
              <ul className="text-blue-600 space-y-1">
                <li>• Take 5-10 minutes for mindfulness or meditation</li>
                <li>• Go for a walk in nature</li>
                <li>• Practice gratitude journaling</li>
                <li>• Maintain a regular sleep schedule</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h5 className="font-medium text-blue-700">Weekly Activities</h5>
              <ul className="text-blue-600 space-y-1">
                <li>• Connect with friends or family</li>
                <li>• Engage in a hobby you enjoy</li>
                <li>• Try gentle exercise or yoga</li>
                <li>• Limit social media consumption</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRestart}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Take Another Assessment
        </button>
        <button
          onClick={() => window.print()}
          className="px-8 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Save Results
        </button>
      </div>
    </div>
  );
};