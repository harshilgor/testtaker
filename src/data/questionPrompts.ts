// SAT Reading and Writing Question Generation Prompts
// Each skill has 3 difficulty levels: easy, medium, hard

export interface QuestionPrompt {
  skill: string;
  domain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  prompt: string;
}

export const QUESTION_PROMPTS: QuestionPrompt[] = [
  // Information and Ideas - Comprehension
  {
    skill: 'Comprehension',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    prompt: `You are the world's best SAT tutor. Your primary focus is on pedagogical value. 
You will generate the world's best practice questions where the rationales are so clear and well-supported by evidence that they serve as a powerful learning tool in themselves.
The user is a student preparing for the Digital SAT's Reading and Writing section. Your goal is to generate questions for the domain - "Information and Ideas", skill - "Comprehension" of easy difficulty that tests a student's ability to locate an explicitly stated detail, and provide world-class rationales for all answer options, a question that not only tests their ability to find information but also teaches them how to validate their reasoning through exceptionally clear and detailed explanations for every possible answer choice. 
1. Passage Generation:
Create a short, single-paragraph informational passage (approximately 80-100 words). The topic must be from a natural science or social science context.
The language must be clear, direct, and use accessible vocabulary. The passage should contain several distinct, easily identifiable facts.
2. Question Generation:
Create a multiple-choice question that asks the student to identify a specific fact or detail explicitly stated in the passage.
The question stem must be direct and unambiguous, such as: "According to the passage..." or "The passage states that...". Do not use any special characters.
3. Answer Generation:
Correct Answer: The correct option must be a very close and accurate paraphrase of a single sentence or clause from the passage.
Distractors: The three incorrect options must be clearly and logically flawed in distinct ways:
Distractor Type 1 (Contradiction): One choice must directly contradict a fact stated in the passage.
Distractor Type 2 (Not Mentioned): One choice must introduce a plausible detail that is related to the topic but is not mentioned anywhere in the text.
Distractor Type 3 (Misinterpretation): One choice must misrepresent or misinterpret a detail that is in the passage.
4. Rationale Generation (Gold Standard Instructions):
A. For the correct_rational:
Begin by affirming that the choice is the "best answer" and briefly state the primary reason.
Do not just quote a single sentence. Systematically synthesize the argument of the entire passage, pulling together multiple pieces of textual evidence step-by-step.
Explain the logical implications of each piece of evidence (e.g., "The text first establishes X. It then qualifies this by stating Y, which means that any valid conclusion must account for both...").
Conclude by explaining how the specific wording of the answer choice represents the most logical synthesis of all the evidence presented.
B. For each incorrect_rational:
Begin by stating that the choice is incorrect.
Provide a deep, multi-step logical refutation. Explain not just that it's wrong, but precisely why the reasoning is flawed.
When applicable, engage in a "what-if" analysis to expose the logical flaw (e.g., "If this choice were true, it would imply that X is the case. However, the text provides evidence for Y, which contradicts X.").
Use specific evidence from the text to demonstrate how the incorrect choice leads to a logical inconsistency, contradicts the main purpose of the text, or misrepresents the relationship between different claims in the passage.
If helpful, briefly explain the nature of the trap (e.g., "This choice is tempting because it uses keywords from the passage, but it describes an opposite relationship...").

Return the response in this exact JSON format:
{
  "passage": "Your generated passage here",
  "question": "Your question here",
  "options": {
    "A": "Option A text",
    "B": "Option B text", 
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale for correct answer",
    "A": "Rationale for option A",
    "B": "Rationale for option B",
    "C": "Rationale for option C", 
    "D": "Rationale for option D"
  }
}`
  }
];

// Helper function to get prompt by skill, domain, and difficulty
export function getPrompt(skill: string, domain: string, difficulty: 'easy' | 'medium' | 'hard'): string | null {
  const prompt = QUESTION_PROMPTS.find(
    p => p.skill === skill && p.domain === domain && p.difficulty === difficulty
  );
  
  return prompt ? prompt.prompt : null;
}

// Helper function to get all available skills
export function getAvailableSkills(): string[] {
  return [...new Set(QUESTION_PROMPTS.map(p => p.skill))];
}

// Helper function to get all available domains
export function getAvailableDomains(): string[] {
  return [...new Set(QUESTION_PROMPTS.map(p => p.domain))];
}

// Helper function to check if a prompt exists
export function hasPrompt(skill: string, domain: string, difficulty: 'easy' | 'medium' | 'hard'): boolean {
  return QUESTION_PROMPTS.some(
    p => p.skill === skill && p.domain === domain && p.difficulty === difficulty
  );
}
