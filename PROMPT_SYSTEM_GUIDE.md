# SAT Question Generation Prompt System

## Overview
This document describes the comprehensive prompt management system for generating SAT Reading and Writing questions using AI. The system is designed to be scalable and efficient, allowing for easy addition of new skills and difficulty levels.

## System Architecture

### Core Components

1. **`src/data/questionPrompts.ts`** - Central prompt storage and management
2. **`src/services/openaiQuestionService.ts`** - AI question generation service
3. **`src/services/infiniteQuestionService.ts`** - Question management and database integration

### Data Structure

```typescript
interface QuestionPrompt {
  skill: string;           // e.g., "Comprehension", "Command of Evidence"
  domain: string;          // e.g., "Information and Ideas", "Craft and Structure"
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;          // The full AI prompt for question generation
}
```

## Current Prompts

### Comprehension Skill (Information and Ideas Domain)

#### Easy Difficulty
- **Passage Length**: 80-100 words
- **Context**: Natural science or social science
- **Question Type**: Direct fact identification
- **Focus**: Basic comprehension of explicitly stated details

#### Medium Difficulty
- **Passage Length**: 110-130 words
- **Context**: Literary nonfiction, historical analysis, or arts criticism
- **Question Type**: Main idea identification
- **Focus**: Central claim synthesis and analysis

#### Hard Difficulty
- **Passage Length**: 140-170 words
- **Context**: Scholarly journals, philosophical texts, legal/historical documents
- **Question Type**: Comprehensive summary
- **Focus**: Nuanced argument analysis with academic vocabulary

## Helper Functions

### Core Functions
- `getPrompt(skill, domain, difficulty)` - Retrieve specific prompt
- `hasPrompt(skill, domain, difficulty)` - Check if prompt exists
- `isAIGenerationAvailable(skill, domain, difficulty)` - Validate AI generation capability

### Utility Functions
- `getAvailableSkills()` - List all available skills
- `getAvailableDomains()` - List all available domains
- `getAvailableDifficulties(skill, domain)` - Get difficulties for specific skill/domain
- `getSkillsForDomain(domain)` - Get skills within a domain
- `getDomainsForSkill(skill)` - Get domains for a skill

## Reading and Writing Skills Structure

### Information and Ideas
- Comprehension ✅ (Easy, Medium, Hard)
- Command of Evidence (Pending)
- Central Ideas and Details (Pending)
- Words in Context (Pending)

### Craft and Structure
- Transitions (Pending)
- Rhetorical Synthesis (Pending)
- Form, Structure, and Sense (Pending)

### Expression of Ideas
- Boundaries (Pending)
- Form, Structure, and Sense (Pending)

### Standard English Conventions
- Form, Structure, and Sense (Pending)
- Boundaries (Pending)

## Adding New Prompts

### Step 1: Add to QUESTION_PROMPTS Array
```typescript
{
  skill: 'Command of Evidence',
  domain: 'Information and Ideas',
  difficulty: 'easy',
  prompt: `Your comprehensive prompt here...`
}
```

### Step 2: Follow Prompt Template Structure
1. **Role Definition**: "You are the world's best SAT tutor..."
2. **Task Specification**: Clear description of what to generate
3. **Passage Generation Guidelines**: Length, context, complexity requirements
4. **Question Generation Guidelines**: Question type and stem format
5. **Answer Generation Guidelines**: Correct answer and distractor specifications
6. **Rationale Generation Guidelines**: Detailed explanation requirements
7. **JSON Format Specification**: Exact output format

### Step 3: Test Integration
The system automatically validates new prompts through the `isAIGenerationAvailable()` function.

## AI Generation Workflow

1. **User selects skill/domain/difficulty** in the quiz interface
2. **System checks availability** using `isAIGenerationAvailable()`
3. **If available**: Generates questions using OpenAI API
4. **If not available**: Falls back to database questions
5. **Generated questions are stored** in database for future use
6. **Question counts are updated** for the specific skill/domain

## Quality Standards

### Prompt Requirements
- **Pedagogical Focus**: Every prompt emphasizes learning value
- **Clear Instructions**: Specific guidelines for passage, question, and answer generation
- **Rationale Emphasis**: Detailed explanations for all answer choices
- **JSON Format**: Consistent output structure for parsing

### Generated Question Standards
- **Passage Quality**: Appropriate length and complexity for difficulty level
- **Question Clarity**: Unambiguous stems and answer choices
- **Distractor Quality**: Plausible but clearly incorrect options
- **Rationale Depth**: Multi-step logical explanations

## Future Expansion

### Adding New Skills
1. Create prompts for all three difficulty levels
2. Add to QUESTION_PROMPTS array
3. Update READING_WRITING_SKILLS structure
4. Test with actual question generation

### Adding New Domains
1. Define domain structure
2. Create skill mappings
3. Develop domain-specific prompt templates
4. Implement domain-specific validation

## Server Status
✅ **Development server running on port 8080**
- Local: http://localhost:8080/
- Network: Available for testing

## Next Steps
1. Add prompts for remaining Reading and Writing skills
2. Implement Math section prompts
3. Add difficulty-specific validation
4. Create prompt versioning system
5. Implement prompt performance analytics
