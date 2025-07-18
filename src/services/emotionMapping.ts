import { moods } from '../data/moods';

export interface EmotionMapping {
  id: string;
  name: string;
  category: 'positive' | 'neutral' | 'negative' | 'concerning';
  value: number;
  keywords: string[];
  severity: number; // 1-5 scale for mental health assessment
}

export const emotionMappings: EmotionMapping[] = [
  {
    id: 'ecstatic',
    name: 'Ecstatic',
    category: 'positive',
    value: 5,
    keywords: ['extremely happy', 'overjoyed', 'euphoric', 'elated'],
    severity: 1
  },
  {
    id: 'joyful',
    name: 'Joyful',
    category: 'positive',
    value: 5,
    keywords: ['happy', 'cheerful', 'delighted', 'pleased'],
    severity: 1
  },
  {
    id: 'content',
    name: 'Content',
    category: 'positive',
    value: 4,
    keywords: ['satisfied', 'peaceful', 'fulfilled', 'serene'],
    severity: 1
  },
  {
    id: 'calm',
    name: 'Calm',
    category: 'positive',
    value: 4,
    keywords: ['relaxed', 'tranquil', 'composed', 'centered'],
    severity: 1
  },
  {
    id: 'neutral',
    name: 'Neutral',
    category: 'neutral',
    value: 3,
    keywords: ['okay', 'fine', 'average', 'indifferent'],
    severity: 2
  },
  {
    id: 'confused',
    name: 'Confused',
    category: 'negative',
    value: 2,
    keywords: ['uncertain', 'puzzled', 'bewildered', 'lost'],
    severity: 3
  },
  {
    id: 'tired',
    name: 'Tired',
    category: 'negative',
    value: 2,
    keywords: ['exhausted', 'drained', 'fatigued', 'weary'],
    severity: 3
  },
  {
    id: 'worried',
    name: 'Worried',
    category: 'negative',
    value: 2,
    keywords: ['concerned', 'troubled', 'uneasy', 'apprehensive'],
    severity: 3
  },
  {
    id: 'anxious',
    name: 'Anxious',
    category: 'concerning',
    value: 1,
    keywords: ['nervous', 'stressed', 'panicked', 'restless'],
    severity: 4
  },
  {
    id: 'sad',
    name: 'Sad',
    category: 'concerning',
    value: 1,
    keywords: ['depressed', 'melancholic', 'down', 'blue'],
    severity: 4
  },
  {
    id: 'angry',
    name: 'Angry',
    category: 'concerning',
    value: 1,
    keywords: ['furious', 'irritated', 'frustrated', 'enraged'],
    severity: 4
  },
  {
    id: 'devastated',
    name: 'Devastated',
    category: 'concerning',
    value: 1,
    keywords: ['heartbroken', 'shattered', 'crushed', 'hopeless'],
    severity: 5
  }
];

export const mapEmotionToCategory = (moodId: string): EmotionMapping | null => {
  return emotionMappings.find(mapping => mapping.id === moodId) || null;
};

export const calculateEmotionalSeverity = (moodIds: string[]): number => {
  const severities = moodIds.map(id => {
    const mapping = mapEmotionToCategory(id);
    return mapping ? mapping.severity : 3;
  });
  
  return Math.round(severities.reduce((sum, severity) => sum + severity, 0) / severities.length);
};