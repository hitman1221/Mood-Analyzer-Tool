import React, { useState } from 'react';
import { Heart, Brain, BarChart3, ArrowRight, MessageSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { MoodCard } from './components/MoodCard';
import { TimePeriodSelector } from './components/TimePeriodSelector';
import { MoodAnalysis } from './components/MoodAnalysis';
import { TextFeedback } from './components/TextFeedback';
import { FeedbackSystem } from './components/FeedbackSystem';
import { MoodService } from './services/moodService';
import { moods } from './data/moods';

type Screen = 'welcome' | 'assessment' | 'analysis';

interface MoodData {
  [key: string]: string;
}

interface TextFeedbackData {
  [key: string]: string;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('today');
  const [moodData, setMoodData] = useState<MoodData>({});
  const [textFeedbackData, setTextFeedbackData] = useState<TextFeedbackData>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showTextFeedback, setShowTextFeedback] = useState<boolean>(false);
  const [showFeedbackSystem, setShowFeedbackSystem] = useState<boolean>(false);
  const [assessmentSession] = useState<string>(uuidv4());
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [comprehensiveAssessment, setComprehensiveAssessment] = useState<any>(null);

  const timePeriods = [
    { id: 'today', label: 'Today', question: 'How are you feeling right now?' },
    { id: 'week', label: 'This Week', question: 'How has your overall mood been this week?' },
    { id: 'month', label: 'This Month', question: 'How would you describe your general emotional state this month?' }
  ];

  const handleMoodSelect = (moodId: string) => {
    const currentPeriod = timePeriods[currentStep];
    const newMoodData = { ...moodData, [currentPeriod.id]: moodId };
    setMoodData(newMoodData);

    // Get mood value for feedback
    const selectedMood = moods.find(mood => mood.id === moodId);
    if (selectedMood) {
      setShowFeedbackSystem(true);
    }
  };

  const handleFeedbackComplete = () => {
    setShowFeedbackSystem(false);
    
    // Auto-advance to next step after feedback
    setTimeout(() => {
      if (currentStep < timePeriods.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        performComprehensiveAnalysis();
      }
    }, 500);
  };

  const handleTextFeedbackSubmit = (feedback: string) => {
    const currentPeriod = timePeriods[currentStep];
    setTextFeedbackData(prev => ({
      ...prev,
      [currentPeriod.id]: feedback
    }));
  };

  const performComprehensiveAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const moodService = MoodService.getInstance();
      const assessment = await moodService.performComprehensiveAssessment(
        moodData,
        textFeedbackData,
        assessmentSession
      );
      setComprehensiveAssessment(assessment);
      setCurrentScreen('analysis');
    } catch (error) {
      console.error('Error performing analysis:', error);
      // Fallback to basic analysis
      setCurrentScreen('analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAssessment = () => {
    setCurrentScreen('welcome');
    setMoodData({});
    setTextFeedbackData({});
    setCurrentStep(0);
    setSelectedPeriod('today');
    setShowTextFeedback(false);
    setShowFeedbackSystem(false);
    setComprehensiveAssessment(null);
  };

  const startAssessment = () => {
    setCurrentScreen('assessment');
    setCurrentStep(0);
  };

  if (currentScreen === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            {/* Header */}
            <div className="mb-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Brain className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
                Mood Analyzer Tool
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Express your emotions through visual face selection and receive personalized insights 
                about your mental well-being with supportive feedback and professional guidance.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <Heart className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Visual Expression</h3>
                <p className="text-gray-600">
                  Select from expressive face emojis that best represent your emotions across different time periods.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Smart Feedback</h3>
                <p className="text-gray-600">
                  Receive immediate supportive feedback with trophy rewards and gentle encouragement based on your selections.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-full">
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Insights</h3>
                <p className="text-gray-600">
                  Add optional text feedback and receive comprehensive analysis with professional support resources.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start Your Emotional Journey?</h2>
              <p className="text-gray-600 mb-6">
                This interactive assessment takes about 3-5 minutes and provides valuable insights into your emotional patterns.
              </p>
              <button
                onClick={startAssessment}
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Begin Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>

            {/* Disclaimer */}
            <div className="mt-8 text-sm text-gray-500">
              <p>
                This tool is for self-reflection purposes only and does not replace professional mental health care.
                If you're experiencing thoughts of self-harm, please contact emergency services or a mental health professional immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'assessment') {
    const currentPeriod = timePeriods[currentStep];
    const selectedMood = moodData[currentPeriod.id];
    const selectedMoodData = moods.find(mood => mood.id === selectedMood);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <div className="flex space-x-2">
                  {timePeriods.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="text-center text-sm text-gray-600">
                Step {currentStep + 1} of {timePeriods.length}
              </div>
            </div>

            {/* Question */}
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">{currentPeriod.question}</h2>
              <p className="text-xl text-gray-600">Select the face that best describes your feelings</p>
            </div>

            {/* Mood Grid */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {moods.map((mood) => (
                <MoodCard
                  key={mood.id}
                  mood={mood}
                  isSelected={selectedMood === mood.id}
                  onSelect={handleMoodSelect}
                />
              ))}
            </div>

            {/* Text Feedback Button */}
            {selectedMood && (
              <div className="text-center mb-8">
                <button
                  onClick={() => setShowTextFeedback(true)}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Add Your Thoughts (Optional)
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : resetAssessment()}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← {currentStep > 0 ? 'Previous' : 'Back to Home'}
              </button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  {isAnalyzing ? 'Analyzing your responses...' : 
                   currentStep === timePeriods.length - 1 ? 'Last question' : 
                   `${timePeriods.length - currentStep - 1} more questions`}
                </p>
              </div>

              <div className="w-20" />
            </div>
          </div>
        </div>

        {/* Text Feedback Modal */}
        <TextFeedback
          isOpen={showTextFeedback}
          onClose={() => setShowTextFeedback(false)}
          onSubmit={handleTextFeedbackSubmit}
          currentPeriod={currentPeriod.label}
        />

        {/* Feedback System */}
        {showFeedbackSystem && selectedMoodData && (
          <FeedbackSystem
            moodValue={selectedMoodData.value}
            onFeedbackComplete={handleFeedbackComplete}
          />
        )}
      </div>
    );
  }

  if (currentScreen === 'analysis') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 py-12">
          <MoodAnalysis 
            moodData={moodData} 
            textFeedbackData={textFeedbackData}
            comprehensiveAssessment={comprehensiveAssessment}
            onRestart={resetAssessment} 
          />
        </div>
      </div>
    );
  }

  return null;
}

export default App;