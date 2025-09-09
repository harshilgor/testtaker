-- Create user_skill_progress table for adaptive learning
CREATE TABLE IF NOT EXISTS user_skill_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL,
    proficiency_score REAL DEFAULT 50.0 CHECK (proficiency_score >= 0 AND proficiency_score <= 100),
    mastery_level TEXT DEFAULT 'none' CHECK (mastery_level IN ('none', 'learning', 'practicing', 'mastered')),
    attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    recent_accuracy REAL DEFAULT 0.0 CHECK (recent_accuracy >= 0 AND recent_accuracy <= 1),
    unlocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, skill_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_user_id ON user_skill_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_skill_id ON user_skill_progress(skill_id);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_mastery ON user_skill_progress(mastery_level);
CREATE INDEX IF NOT EXISTS idx_user_skill_progress_unlocked ON user_skill_progress(unlocked);

-- Enable RLS
ALTER TABLE user_skill_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own skill progress" ON user_skill_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skill progress" ON user_skill_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill progress" ON user_skill_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_skill_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_skill_progress_updated_at
    BEFORE UPDATE ON user_skill_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_skill_progress_updated_at();
