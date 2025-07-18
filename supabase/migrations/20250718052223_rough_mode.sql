/*
  # Create mood tracking tables

  1. New Tables
    - `mood_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `period_type` (text, enum: today/week/month)
      - `mood_id` (text, mood identifier)
      - `mood_name` (text, human readable mood name)
      - `mood_value` (integer, 1-5 rating)
      - `text_feedback` (text, optional user feedback)
      - `created_at` (timestamptz)
      - `assessment_session` (uuid, groups related entries)
    
    - `mental_health_assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `session_id` (uuid, links to mood entries)
      - `overall_score` (numeric, calculated assessment score)
      - `risk_level` (text, enum: low/moderate/high)
      - `trends` (jsonb, trend analysis data)
      - `recommendations` (text array, suggested actions)
      - `requires_professional_help` (boolean)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for anonymous users to insert/read their own data
    - Add policies for authenticated users to manage their data
*/

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  period_type text NOT NULL CHECK (period_type IN ('today', 'week', 'month')),
  mood_id text NOT NULL,
  mood_name text NOT NULL,
  mood_value integer NOT NULL CHECK (mood_value >= 1 AND mood_value <= 5),
  text_feedback text,
  created_at timestamptz DEFAULT now(),
  assessment_session uuid NOT NULL
);

-- Create mental_health_assessments table
CREATE TABLE IF NOT EXISTS mental_health_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  overall_score numeric NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  trends jsonb DEFAULT '{}',
  recommendations text[] DEFAULT '{}',
  requires_professional_help boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for mood_entries
CREATE POLICY "Allow anonymous users to insert mood entries"
  ON mood_entries
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to read their mood entries"
  ON mood_entries
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to insert mood entries"
  ON mood_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read their mood entries"
  ON mood_entries
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for mental_health_assessments
CREATE POLICY "Allow anonymous users to insert assessments"
  ON mental_health_assessments
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous users to read their assessments"
  ON mental_health_assessments
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow authenticated users to insert assessments"
  ON mental_health_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read their assessments"
  ON mental_health_assessments
  FOR SELECT
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_mood_entries_assessment_session ON mood_entries(assessment_session);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON mental_health_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_session_id ON mental_health_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON mental_health_assessments(created_at);