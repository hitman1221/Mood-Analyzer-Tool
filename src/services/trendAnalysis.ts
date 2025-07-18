import { subDays, subWeeks, subMonths, isAfter, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { emotionMappings, mapEmotionToCategory } from './emotionMapping';

export interface TrendData {
  period: string;
  averageScore: number;
  dominantEmotion: string;
  emotionCount: { [key: string]: number };
  riskFactors: string[];
}

export interface TrendAnalysis {
  shortTerm: TrendData; // Last 7 days
  mediumTerm: TrendData; // Last 30 days
  longTerm: TrendData; // Last 90 days
  overallTrend: 'improving' | 'stable' | 'declining' | 'concerning';
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
}

export class TrendAnalyzer {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async analyzeTrends(): Promise<TrendAnalysis> {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    const thirtyDaysAgo = subDays(now, 30);
    const ninetyDaysAgo = subDays(now, 90);

    // Fetch mood entries for different periods
    const { data: allEntries } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', ninetyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (!allEntries || allEntries.length === 0) {
      return this.getDefaultAnalysis();
    }

    const shortTermEntries = allEntries.filter(entry => 
      isAfter(parseISO(entry.created_at), sevenDaysAgo)
    );
    const mediumTermEntries = allEntries.filter(entry => 
      isAfter(parseISO(entry.created_at), thirtyDaysAgo)
    );
    const longTermEntries = allEntries;

    const shortTerm = this.analyzePeriod(shortTermEntries, 'Last 7 days');
    const mediumTerm = this.analyzePeriod(mediumTermEntries, 'Last 30 days');
    const longTerm = this.analyzePeriod(longTermEntries, 'Last 90 days');

    const overallTrend = this.determineOverallTrend(shortTerm, mediumTerm, longTerm);
    const riskLevel = this.assessRiskLevel(shortTerm, mediumTerm, longTerm);
    const recommendations = this.generateRecommendations(riskLevel, overallTrend, shortTerm);

    return {
      shortTerm,
      mediumTerm,
      longTerm,
      overallTrend,
      riskLevel,
      recommendations
    };
  }

  private analyzePeriod(entries: any[], periodName: string): TrendData {
    if (entries.length === 0) {
      return {
        period: periodName,
        averageScore: 3,
        dominantEmotion: 'neutral',
        emotionCount: {},
        riskFactors: []
      };
    }

    const scores = entries.map(entry => entry.mood_value);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const emotionCount: { [key: string]: number } = {};
    entries.forEach(entry => {
      emotionCount[entry.mood_name] = (emotionCount[entry.mood_name] || 0) + 1;
    });

    const dominantEmotion = Object.entries(emotionCount)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    const riskFactors = this.identifyRiskFactors(entries);

    return {
      period: periodName,
      averageScore: Math.round(averageScore * 100) / 100,
      dominantEmotion,
      emotionCount,
      riskFactors
    };
  }

  private identifyRiskFactors(entries: any[]): string[] {
    const riskFactors: string[] = [];
    
    // Check for concerning emotions
    const concerningEmotions = entries.filter(entry => 
      ['anxious', 'sad', 'angry', 'devastated'].includes(entry.mood_id)
    );
    
    if (concerningEmotions.length > entries.length * 0.5) {
      riskFactors.push('High frequency of negative emotions');
    }

    // Check for declining trend
    const recentEntries = entries.slice(0, Math.ceil(entries.length / 2));
    const olderEntries = entries.slice(Math.ceil(entries.length / 2));
    
    if (recentEntries.length > 0 && olderEntries.length > 0) {
      const recentAvg = recentEntries.reduce((sum, entry) => sum + entry.mood_value, 0) / recentEntries.length;
      const olderAvg = olderEntries.reduce((sum, entry) => sum + entry.mood_value, 0) / olderEntries.length;
      
      if (recentAvg < olderAvg - 0.5) {
        riskFactors.push('Declining mood trend');
      }
    }

    // Check for extreme emotions
    const extremeEmotions = entries.filter(entry => 
      entry.mood_value === 1 || entry.mood_id === 'devastated'
    );
    
    if (extremeEmotions.length > 0) {
      riskFactors.push('Presence of severe emotional distress');
    }

    return riskFactors;
  }

  private determineOverallTrend(
    shortTerm: TrendData, 
    mediumTerm: TrendData, 
    longTerm: TrendData
  ): 'improving' | 'stable' | 'declining' | 'concerning' {
    const shortScore = shortTerm.averageScore;
    const mediumScore = mediumTerm.averageScore;
    const longScore = longTerm.averageScore;

    // Check for concerning patterns
    if (shortScore <= 2 || shortTerm.riskFactors.length >= 2) {
      return 'concerning';
    }

    // Check for improvement
    if (shortScore > mediumScore && mediumScore >= longScore) {
      return 'improving';
    }

    // Check for decline
    if (shortScore < mediumScore && mediumScore <= longScore) {
      return 'declining';
    }

    return 'stable';
  }

  private assessRiskLevel(
    shortTerm: TrendData, 
    mediumTerm: TrendData, 
    longTerm: TrendData
  ): 'low' | 'moderate' | 'high' {
    const totalRiskFactors = shortTerm.riskFactors.length + 
                           mediumTerm.riskFactors.length + 
                           longTerm.riskFactors.length;

    if (shortTerm.averageScore <= 1.5 || totalRiskFactors >= 4) {
      return 'high';
    }

    if (shortTerm.averageScore <= 2.5 || totalRiskFactors >= 2) {
      return 'moderate';
    }

    return 'low';
  }

  private generateRecommendations(
    riskLevel: 'low' | 'moderate' | 'high',
    trend: 'improving' | 'stable' | 'declining' | 'concerning',
    shortTerm: TrendData
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'high' || trend === 'concerning') {
      recommendations.push('Consider seeking immediate professional mental health support');
      recommendations.push('Contact a crisis helpline if experiencing thoughts of self-harm');
      recommendations.push('Reach out to trusted friends or family members');
    }

    if (riskLevel === 'moderate' || trend === 'declining') {
      recommendations.push('Schedule an appointment with a mental health professional');
      recommendations.push('Practice daily mindfulness or meditation');
      recommendations.push('Maintain regular sleep and exercise routines');
    }

    if (shortTerm.dominantEmotion === 'anxious') {
      recommendations.push('Try deep breathing exercises and progressive muscle relaxation');
      recommendations.push('Limit caffeine intake and practice grounding techniques');
    }

    if (shortTerm.dominantEmotion === 'sad') {
      recommendations.push('Engage in activities that bring you joy');
      recommendations.push('Consider light therapy and maintain social connections');
    }

    if (trend === 'improving') {
      recommendations.push('Continue current positive coping strategies');
      recommendations.push('Maintain healthy lifestyle habits that support your progress');
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Continue monitoring your emotional well-being');
      recommendations.push('Practice regular self-care activities');
      recommendations.push('Maintain healthy social connections');
    }

    return recommendations;
  }

  private getDefaultAnalysis(): TrendAnalysis {
    return {
      shortTerm: {
        period: 'Last 7 days',
        averageScore: 3,
        dominantEmotion: 'neutral',
        emotionCount: {},
        riskFactors: []
      },
      mediumTerm: {
        period: 'Last 30 days',
        averageScore: 3,
        dominantEmotion: 'neutral',
        emotionCount: {},
        riskFactors: []
      },
      longTerm: {
        period: 'Last 90 days',
        averageScore: 3,
        dominantEmotion: 'neutral',
        emotionCount: {},
        riskFactors: []
      },
      overallTrend: 'stable',
      riskLevel: 'low',
      recommendations: ['Start tracking your mood regularly to build meaningful insights']
    };
  }
}