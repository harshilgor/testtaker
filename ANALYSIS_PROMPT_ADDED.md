# ✅ Analysis Skill Prompt Added Successfully!

## 📝 **New Prompt Added:**

### **Skill**: Analysis
### **Domain**: Information and Ideas  
### **Difficulty**: Easy

## 🎯 **Prompt Details:**

The prompt focuses on testing a student's ability to identify simple, localized relationships within a text, such as:
- **Cause-and-effect relationships**
- **Claim and supporting example relationships**
- **Function of specific details in context**

## 📊 **Prompt Structure:**

### **Passage Generation:**
- Short, single-paragraph informational passage (80-100 words)
- Natural science or social science topic
- Clear claim followed by supporting example or cause-and-effect relationship
- Transition words clearly signaled (e.g., 'for example,' 'as a result,' 'because')

### **Question Generation:**
- Questions about function of specific examples
- Questions about reasons for stated effects
- Question stems: "The author mentions [detail] most likely in order to..." or "According to the passage, what is the reason that [effect] occurs?"

### **Answer Generation:**
- **Correct Answer**: Accurately states function of detail or cause of effect
- **Distractors**: 
  - One restates detail without explaining purpose
  - One describes incorrect relationship (confusing cause and effect)
  - One states irrelevant purpose

### **Rationale Generation:**
- Explains logical link between claim and evidence
- Explains specific logical errors for each distractor

## 🔧 **Technical Implementation:**

### **File Updated**: `src/data/questionPrompts.ts`
- ✅ **Added new prompt object** with skill: 'Analysis', domain: 'Information and Ideas', difficulty: 'easy'
- ✅ **Maintained consistent format** with existing prompts
- ✅ **Included complete JSON response format** for AI generation
- ✅ **No linting errors** introduced

## 🚀 **Ready for Use:**

The Analysis skill prompt is now available for AI question generation. When a user selects:
- **Skill**: Analysis
- **Domain**: Information and Ideas
- **Difficulty**: Easy

The system will use this prompt to generate questions that test students' ability to analyze relationships within texts.

## 📈 **Current Available Prompts:**

1. **Comprehension** (Easy, Medium, Hard) - Information and Ideas
2. **Analysis** (Easy) - Information and Ideas

The system now supports question generation for both Comprehension and Analysis skills! 🎉
