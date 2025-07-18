import { TrendAnalysis } from './trendAnalysis';
import { emotionMappings, mapEmotionToCategory } from './emotionMapping';

export interface MentalHealthAssessment {
  overallScore: number;
  riskLevel: 'low' | 'moderate' | 'high';
  primaryConcerns: string[];
  strengths: string[];
  recommendations: string[];
  requiresProfessionalHelp: boolean;
  urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'immediate';
  supportResources: SupportResource[];
}

export interface SupportResource {
  type: 'crisis' | 'therapy' | 'support_group' | 'self_help';
  name: string;
  description: string;
  contact: string;
  url?: string;
}

export class AIAssessmentEngine {
  private static readonly CRISIS_KEYWORDS = [
    'hopeless', 'worthless', 'suicide', 'self-harm', 'end it all', 
    'no point', 'better off dead', 'can\'t go on'
  ];

  private static readonly SUPPORT_RESOURCES: SupportResource[] = [
    {
      type: 'crisis',
      name: 'National Suicide Prevention Lifeline',
      description: '24/7 crisis support and suicide prevention',
      contact: '988',
      url: 'https://suicidepreventionlifeline.org'
    },
    {
      type: 'crisis',
      name: 'Crisis Text Line',
      description: 'Text-based crisis support',
      contact: 'Text HOME to 741741'
    },
    {
      type: 'therapy',
      name: 'Psychology Today',
      description: 'Find licensed therapists in your area',
      contact: 'Online directory',
      url: 'https://www.psychologytoday.com'
    },
    {
      type: 'therapy',
      name: 'SAMHSA National Helpline',
      description: 'Treatment referral and information service',
      contact: '1-800-662-4357',
      url: 'https://www.samhsa.gov/find-help/national-helpline'
    },
    {
      type: 'support_group',
      name: 'NAMI Support Groups',
      description: 'Peer support groups for mental health',
      contact: 'Local chapters available',
      url: 'https://www.nami.org/Support-Education/Support-Groups'
    },
    {
      type: 'self_help',
      name: 'MindTools Stress Management',
      description: 'Self-help resources for stress and anxiety',
      contact: 'Online resources',
      url: 'https://www.mindtools.com/stress-management'
    }
  ];

  static assessMentalHealth(
    currentMoods: { [key: string]: string },
    textFeedback: { [key: string]: string },
    trendAnalysis?: TrendAnalysis
  ): MentalHealthAssessment {
    const moodValues = Object.values(currentMoods).map(moodId => {
      const mood = mapEmotionToCategory(moodId);
      return mood ? mood.value : 3;
    });

    const overallScore = moodValues.reduce((sum, value) => sum + value, 0) / moodValues.length;
    
    // Analyze text feedback for crisis indicators
    const allTextFeedback = Object.values(textFeedback).join(' ').toLowerCase();
    const hasCrisisIndicators = this.CRISIS_KEYWORDS.some(keyword => 
      allTextFeedback.includes(keyword)
    );

    // Determine risk level
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    let urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'immediate' = 'none';

    if (hasCrisisIndicators || overallScore <= 1.5) {
      riskLevel = 'high';
      urgencyLevel = 'immediate';
    } else if (overallScore <= 2.5 || (trendAnalysis && trendAnalysis.riskLevel === 'high')) {
      riskLevel = 'moderate';
      urgencyLevel = 'medium';
    } else if (overallScore <= 3.5 || (trendAnalysis && trendAnalysis.riskLevel === 'moderate')) {
      riskLevel = 'moderate';
      urgencyLevel = 'low';
    }

    // Identify primary concerns
    const primaryConcerns = this.identifyPrimaryConcerns(currentMoods, textFeedback, trendAnalysis);
    
    // Identify strengths
    const strengths = this.identifyStrengths(currentMoods, textFeedback, trendAnalysis);

    // Generate recommendations
    const recommendations = this.generateRecommendations(riskLevel, primaryConcerns, trendAnalysis);

    // Determine if professional help is required
    const requiresProfessionalHelp = riskLevel === 'high' || 
      urgencyLevel === 'immediate' || 
      urgencyLevel === 'high' ||
      (trendAnalysis && trendAnalysis.overallTrend === 'concerning');

    // Select appropriate support resources
    const supportResources = this.selectSupportResources(riskLevel, urgencyLevel, primaryConcerns);

    return {
      overallScore: Math.round(overallScore * 100) / 100,
      riskLevel,
      primaryConcerns,
      strengths,
      recommendations,
      requiresProfessionalHelp,
      urgencyLevel,
      supportResources
    };
  }

  private static identifyPrimaryConcerns(
    currentMoods: { [key: string]: string },
    textFeedback: { [key: string]: string },
    trendAnalysis?: TrendAnalysis
  ): string[] {
    const concerns: string[] = [];
    const moodIds = Object.values(currentMoods);

    // Check for specific emotional patterns
    if (moodIds.includes('anxious')) {
      concerns.push('Anxiety and worry patterns');
    }
    if (moodIds.includes('sad') || moodIds.includes('devastated')) {
      concerns.push('Depressive symptoms');
    }
    if (moodIds.includes('angry')) {
      concerns.push('Anger management challenges');
    }
    if (moodIds.includes('tired')) {
      concerns.push('Fatigue and low energy');
    }

    // Analyze text feedback for additional concerns
    const allText = Object.values(textFeedback).join(' ').toLowerCase();
    if (allText.includes('sleep') || allText.includes('insomnia')) {
      concerns.push('Sleep disturbances');
    }
    if (allText.includes('work') || allText.includes('job') || allText.includes('stress')) {
      concerns.push('Work-related stress');
    }
    if (allText.includes('relationship') || allText.includes('family')) {
      concerns.push('Relationship difficulties');
    }

    // Add trend-based concerns
    if (trendAnalysis) {
      if (trendAnalysis.overallTrend === 'declining') {
        concerns.push('Declining emotional well-being trend');
      }
      if (trendAnalysis.shortTerm.riskFactors.length > 0) {
        concerns.push('Recent emotional instability');
      }
    }

    return concerns.length > 0 ? concerns : ['General emotional wellness monitoring'];
  }

  private static identifyStrengths(
    currentMoods: { [key: string]: string },
    textFeedback: { [key: string]: string },
    trendAnalysis?: TrendAnalysis
  ): string[] {
    const strengths: string[] = [];
    const moodIds = Object.values(currentMoods);

    // Check for positive emotions
    if (moodIds.includes('joyful') || moodIds.includes('ecstatic')) {
      strengths.push('Capacity for joy and happiness');
    }
    if (moodIds.includes('content') || moodIds.includes('calm')) {
      strengths.push('Ability to find peace and contentment');
    }

    // Analyze text feedback for strengths
    const allText = Object.values(textFeedback).join(' ').toLowerCase();
    if (allText.includes('grateful') || allText.includes('thankful')) {
      strengths.push('Gratitude and appreciation');
    }
    if (allText.includes('support') || allText.includes('friend') || allText.includes('family')) {
      strengths.push('Strong support network');
    }
    if (allText.includes('exercise') || allText.includes('meditation') || allText.includes('hobby')) {
      strengths.push('Healthy coping strategies');
    }

    // Add trend-based strengths
    if (trendAnalysis) {
      if (trendAnalysis.overallTrend === 'improving') {
        strengths.push('Positive emotional growth trajectory');
      }
      if (trendAnalysis.riskLevel === 'low') {
        strengths.push('Stable emotional regulation');
      }
    }

    // Default strength
    if (strengths.length === 0) {
      strengths.push('Willingness to self-reflect and seek understanding');
    }

    return strengths;
  }

  private static generateRecommendations(
    riskLevel: 'low' | 'moderate' | 'high',
    primaryConcerns: string[],
    trendAnalysis?: TrendAnalysis
  ): string[] {
    const recommendations: string[] = [];

    // Risk-based recommendations
    if (riskLevel === 'high') {
      recommendations.push('Seek immediate professional mental health support');
      recommendations.push('Consider contacting a crisis helpline for immediate assistance');
      recommendations.push('Reach out to trusted friends, family, or support network');
      recommendations.push('Avoid making major life decisions while in distress');
    } else if (riskLevel === 'moderate') {
      recommendations.push('Schedule an appointment with a mental health professional');
      recommendations.push('Consider therapy or counseling to develop coping strategies');
      recommendations.push('Practice daily stress management techniques');
    }

    // Concern-specific recommendations
    if (primaryConcerns.includes('Anxiety and worry patterns')) {
      recommendations.push('Practice deep breathing exercises and mindfulness meditation');
      recommendations.push('Limit caffeine intake and try progressive muscle relaxation');
    }
    if (primaryConcerns.includes('Depressive symptoms')) {
      recommendations.push('Maintain regular sleep schedule and engage in physical activity');
      recommendations.push('Connect with supportive friends and family members');
    }
    if (primaryConcerns.includes('Sleep disturbances')) {
      recommendations.push('Establish a consistent bedtime routine and sleep hygiene');
      recommendations.push('Limit screen time before bed and create a calm sleep environment');
    }

    // General wellness recommendations
    if (riskLevel === 'low') {
      recommendations.push('Continue current positive mental health practices');
      recommendations.push('Maintain regular self-care routines and social connections');
      recommendations.push('Consider keeping a mood journal for ongoing self-awareness');
    }

    return recommendations;
  }

  private static selectSupportResources(
    riskLevel: 'low' | 'moderate' | 'high',
    urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'immediate',
    primaryConcerns: string[]
  ): SupportResource[] {
    const resources: SupportResource[] = [];

    // Crisis resources for high risk
    if (riskLevel === 'high' || urgencyLevel === 'immediate') {
      resources.push(
        ...this.SUPPORT_RESOURCES.filter(r => r.type === 'crisis')
      );
    }

    // Therapy resources for moderate to high risk
    if (riskLevel === 'moderate' || riskLevel === 'high') {
      resources.push(
        ...this.SUPPORT_RESOURCES.filter(r => r.type === 'therapy')
      );
    }

    // Support groups for ongoing support
    if (primaryConcerns.some(c => c.includes('relationship') || c.includes('support'))) {
      resources.push(
        ...this.SUPPORT_RESOURCES.filter(r => r.type === 'support_group')
      );
    }

    // Self-help resources for all levels
    resources.push(
      ...this.SUPPORT_RESOURCES.filter(r => r.type === 'self_help')
    );

    return resources;
  }
}