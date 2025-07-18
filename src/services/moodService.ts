import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';
import { TrendAnalyzer } from './trendAnalysis';
import { AIAssessmentEngine, MentalHealthAssessment } from './aiAssessment';
import { mapEmotionToCategory } from './emotionMapping';

export interface MoodEntry {
  id: string;
  userId: string;
  sessionId: string;
  periodType: 'today' | 'week' | 'month';
  moodId: string;
  moodName: string;
  moodEmoji: string;
  moodValue: number;
  moodCategory: 'positive' | 'neutral' | 'negative' | 'concerning';
  severityScore: number;
  emotionalLabels: string[];
  contextTags: string[];
  createdAt: string;
  updatedAt: string;
}

export class MoodService {
  private static instance: MoodService;
  private userId: string;

  private constructor() {
    // Generate a unique user ID for this session (in production, use actual auth)
    this.userId = localStorage.getItem('mood_user_id') || uuidv4();
    localStorage.setItem('mood_user_id', this.userId);
  }

  static getInstance(): MoodService {
    if (!MoodService.instance) {
      MoodService.instance = new MoodService();
    }
    return MoodService.instance;
  }

  async saveMoodEntry(
    periodType: 'today' | 'week' | 'month',
    moodId: string,
    moodName: string,
    sessionId: string,
    moodEmoji?: string,
    contextTags?: string[]
  ): Promise<MoodEntry> {
    const emotionMapping = mapEmotionToCategory(moodId);
    const moodValue = emotionMapping ? emotionMapping.value : 3;
    const severityScore = emotionMapping ? emotionMapping.severity : 3;
    const moodCategory = emotionMapping ? emotionMapping.category : 'neutral';
    const emotionalLabels = emotionMapping ? emotionMapping.keywords : [];

    const entry: MoodEntry = {
      id: uuidv4(),
      userId: this.userId,
      sessionId,
      periodType,
      moodId,
      moodName,
      moodEmoji: moodEmoji || '😐',
      moodValue,
      moodCategory,
      severityScore,
      emotionalLabels,
      contextTags: contextTags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('mood_entries')
      .insert({
        id: entry.id,
        user_id: entry.userId,
        session_id: entry.sessionId,
        period_type: entry.periodType,
        mood_id: entry.moodId,
        mood_name: entry.moodName,
        mood_emoji: entry.moodEmoji,
        mood_value: entry.moodValue,
        mood_category: entry.moodCategory,
        severity_score: entry.severityScore,
        emotional_labels: entry.emotionalLabels,
        context_tags: entry.contextTags,
        created_at: entry.createdAt,
        updated_at: entry.updatedAt
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving mood entry:', error);
      throw new Error('Failed to save mood entry');
    }

    return entry;
  }

  async getMoodHistory(days: number = 30): Promise<MoodEntry[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', this.userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching mood history:', error);
      return [];
    }

    return data.map(entry => ({
      id: entry.id,
      userId: entry.user_id,
      sessionId: entry.session_id,
      periodType: entry.period_type as 'today' | 'week' | 'month',
      moodId: entry.mood_id,
      moodName: entry.mood_name,
      moodEmoji: entry.mood_emoji,
      moodValue: entry.mood_value,
      moodCategory: entry.mood_category as 'positive' | 'neutral' | 'negative' | 'concerning',
      severityScore: entry.severity_score,
      emotionalLabels: entry.emotional_labels || [],
      contextTags: entry.context_tags || [],
      createdAt: entry.created_at,
      updatedAt: entry.updated_at
    }));
  }

  async performComprehensiveAssessment(
    currentMoods: { [key: string]: string },
    textFeedback: { [key: string]: string },
    assessmentSession: string
  ): Promise<MentalHealthAssessment> {
    try {
      // Save current mood entries
      for (const [period, moodId] of Object.entries(currentMoods)) {
        const emotionMapping = mapEmotionToCategory(moodId);
        const moodName = emotionMapping ? emotionMapping.name : 'Unknown';
        const moodEmoji = emotionMapping ? emotionMapping.name : '😐';
        
        await this.saveMoodEntry(
          period as 'today' | 'week' | 'month',
          moodId,
          moodName,
          assessmentSession,
          moodEmoji
        );
      }

      // Save text feedback separately
      for (const [period, feedback] of Object.entries(textFeedback)) {
        if (feedback.trim()) {
          await this.saveFeedbackEntry(assessmentSession, feedback, period);
        }
      }

      // Analyze trends
      const trendAnalyzer = new TrendAnalyzer(this.userId);
      const trendAnalysis = await trendAnalyzer.analyzeTrends();

      // Perform AI assessment
      const assessment = AIAssessmentEngine.assessMentalHealth(
        currentMoods,
        textFeedback,
        trendAnalysis
      );

      // Save assessment results
      await this.saveAssessmentResults(assessmentSession, assessment, trendAnalysis);

      return assessment;
    } catch (error) {
      console.error('Error performing comprehensive assessment:', error);
      
      // Fallback to basic assessment without trend analysis
      return AIAssessmentEngine.assessMentalHealth(currentMoods, textFeedback);
    }
  }

  async saveFeedbackEntry(
    sessionId: string,
    feedbackContent: string,
    period?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('feedback_history')
        .insert({
          id: uuidv4(),
          user_id: this.userId,
          session_id: sessionId,
          feedback_type: 'text',
          feedback_content: feedbackContent,
          keywords: this.extractKeywords(feedbackContent),
          crisis_indicators: this.detectCrisisIndicators(feedbackContent),
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving feedback entry:', error);
      }
    } catch (error) {
      console.error('Error saving feedback entry:', error);
    }
  }

  private extractKeywords(text: string): string[] {
    const keywords = text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 3)
      .slice(0, 10);
    return keywords;
  }

  private detectCrisisIndicators(text: string): string[] {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'hopeless', 'worthless',
      'self-harm', 'hurt myself', 'no point', 'better off dead'
    ];
    
    const indicators = crisisKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );
    
    return indicators;
  }

  private async saveAssessmentResults(
    sessionId: string,
    assessment: MentalHealthAssessment,
    trendAnalysis: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('assessment_sessions')
        .insert({
          id: uuidv4(),
          user_id: this.userId,
          session_type: 'comprehensive',
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          overall_score: assessment.overallScore,
          risk_assessment: assessment.riskLevel,
          recommendations: assessment.recommendations,
          follow_up_required: assessment.requiresProfessionalHelp,
          metadata: { trends: trendAnalysis, assessment }
        });

      if (error) {
        console.error('Error saving assessment results:', error);
      }
    } catch (error) {
      console.error('Error saving assessment results:', error);
    }
  }

  async getAssessmentHistory(): Promise<any[]> {
    const { data, error } = await supabase
      .from('assessment_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('started_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching assessment history:', error);
      return [];
    }

    return data || [];
  }

  async createMentalHealthAlert(
    alertType: 'crisis' | 'declining_trend' | 'risk_pattern' | 'improvement' | 'milestone',
    severityLevel: 'low' | 'moderate' | 'high' | 'critical',
    title: string,
    description: string,
    triggerData: any = {}
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('mental_health_alerts')
        .insert({
          id: uuidv4(),
          user_id: this.userId,
          alert_type: alertType,
          severity_level: severityLevel,
          alert_title: title,
          alert_description: description,
          trigger_data: triggerData,
          professional_referral_needed: severityLevel === 'high' || severityLevel === 'critical',
          crisis_intervention_required: alertType === 'crisis',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error creating mental health alert:', error);
      }
    } catch (error) {
      console.error('Error creating mental health alert:', error);
    }
  }

  async getActiveAlerts(): Promise<any[]> {
    const { data, error } = await supabase
      .from('mental_health_alerts')
      .select('*')
      .eq('user_id', this.userId)
      .eq('resolved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active alerts:', error);
      return [];
    }

    return data || [];
  }
}