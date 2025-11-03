// Craft and Structure Domain Prompts
// Contains all prompts for: Words in Context, Transitions, Rhetorical Synthesis, Form Structure and Sense

import { QuestionPrompt } from '../index';

export const prompts: QuestionPrompt[] = [
  // Words in Context Skill - Easy Difficulty
  {
    skill: 'Words in Context',
    domain: 'Craft and Structure',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2024-01-15',
    prompt: `Assessment: SAT Test: Reading and Writing Domain: Craft and Structure Skill: Words in Context
Prompt for an Easy Question
[CONTEXT] A student is beginning to practice vocabulary skills for the SAT and needs to learn how to use direct context clues to determine a word's meaning.
[PERSONA] You are an expert SAT content creator. Your task is to generate a straightforward "Words in Context" question where the correct answer is strongly signaled by a synonym or a definitional phrase within the text itself.
[TASK] Generate a "Vocabulary in Context" practice question of easy difficulty.
1. Passage Generation:
Create a short, single-sentence or two-sentence passage.
The sentence containing the blank must also contain a clear and direct context clue, such as a definition, a synonym, or an explicit example that points to the meaning of the missing word. For instance: "The speaker's comments were intentionally ______, designed to be vague and open to many interpretations."
2. Question Generation:
The question stem is fixed: "Which choice completes the text with the most logical and precise word or phrase?"
3. Answer Generation:
Correct Answer: A common vocabulary word whose meaning directly matches the context clue (e.g., for the example above, ambiguous).
Distractors: The distractors should have meanings that are clearly incorrect given the direct clue. One should be an antonym (e.g., direct). The other two should be unrelated in meaning (e.g., forceful, modest).
4. Rationale Generation:
Provide a rationale that quotes the specific definitional phrase from the text (e.g., "designed to be vague and open to many interpretations") and explains how it directly supports the meaning of the correct word.
5. [OUTPUT FORMAT]
Deliver only the final, clean content in the following sequence:
The full passage, including the blank.
The question stem and its four answer choices (A, B, C, D).
The correct answer and the full rationale.
Do not include the bracketed instructional headers.

Return the response in this exact JSON format:
{
  "passage": "Your generated passage here with a blank",
  "question": "Which choice completes the text with the most logical and precise word or phrase?",
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
  },
  
  // Words in Context Skill - Medium Difficulty
  {
    skill: 'Words in Context',
    domain: 'Craft and Structure',
    difficulty: 'medium',
    version: '1.0',
    lastUpdated: '2024-01-15',
    prompt: `Prompt for a Medium Question
[CONTEXT] A student needs to practice using broader contextual clues, such as the overall tone or logical flow of an argument, to determine the most fitting word.
[PERSONA] You are an expert SAT content creator skilled at crafting questions where the correct word choice depends on understanding the situation or tone described across several sentences.
[TASK] Generate a "Vocabulary in Context" practice question of medium difficulty.
1. Passage Generation:
Create a passage of 2-3 sentences. The context clues should not be a single definitional phrase but rather a description of a situation or a series of actions that imply the missing word.
The tone of the passage (positive, negative, neutral) should be a key clue. For example: "The team's manager was unimpressed. The report was riddled with errors, key data was missing, and the conclusions were unsupported. She found the work to be quite ______."
2. Question Generation:
The question stem is fixed: "Which choice completes the text with the most logical and precise word or phrase?"
3. Answer Generation:
Correct Answer: A word that logically summarizes the situation described (e.g., for the example above, shoddy).
Distractors: The distractors should be plausible but less precise. One might be thematically related but have the wrong connotation (e.g., creative, which doesn't fit the negative tone). Another could be too weak or general (e.g., imperfect). A third could be incorrect but related (e.g., complicated).
4. Rationale Generation:
Provide a rationale that explains how the series of details in the passage (errors, missing data, unsupported conclusions) and the negative tone collectively point to the correct answer. It should also explain why the other words are less precise or have the wrong connotation for this context.
5. [OUTPUT FORMAT]
Deliver only the final, clean content in the specified sequence (Passage, Question, Answers, Rationale).
Do not include the bracketed instructional headers.

Return the response in this exact JSON format:
{
  "passage": "Your generated passage here with a blank",
  "question": "Which choice completes the text with the most logical and precise word or phrase?",
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
  },
  
  // Words in Context Skill - Hard Difficulty
  {
    skill: 'Words in Context',
    domain: 'Craft and Structure',
    difficulty: 'hard',
    version: '1.0',
    lastUpdated: '2024-01-15',
    prompt: `Prompt for a Hard Question
[CONTEXT] An advanced student needs to practice differentiating between words with very similar meanings to find the most precise fit for a sophisticated academic or literary context.
[PERSONA] You are a senior SAT content developer. Your task is to design a challenging "Words in Context" question where the distractors are close synonyms of the correct answer, testing a student's appreciation for subtle shades of meaning.
[TASK] Generate a "Vocabulary in Context" practice question of hard difficulty.
1. Passage Generation:
Create a passage of 2-4 sentences with a nuanced or academic tone, discussing a complex idea from a field like philosophy, art history, or science.
The context should demand a highly specific word. For example: "The philosopher argued that while we can measure the physical properties of a color, the subjective experience of seeing red—the 'what-it's-like' quality—is a separate, non-physical property. This ______ aspect of consciousness, she claimed, cannot be fully captured by scientific instruments alone."
2. Question Generation:
The question stem is fixed: "Which choice completes the text with the most logical and precise word or phrase?"
3. Answer Generation:
Correct Answer: A sophisticated word that precisely fits the nuanced academic context (e.g., for the example above, phenomenological).
Distractors: The distractors must be very close synonyms or related concepts that are plausible but ultimately less precise. For the example: experiential (good, but less specific to the philosophical concept), subjective (true, but the passage already uses this word, and the blank calls for a more technical term for the aspect), and intrinsic (related, but doesn't capture the idea of 'what-it's-like' as well).
4. Rationale Generation:
Provide a detailed rationale that analyzes the subtle differences in connotation and specific meaning between the correct answer and the distractors. It must explain why the passage's specific academic context makes the chosen word uniquely and precisely appropriate over the other very close options.
5. [OUTPUT FORMAT]
Deliver only the final, clean content in the specified sequence (Passage, Question, Answers, Rationale).
Do not include the bracketed instructional headers.

Return the response in this exact JSON format:
{
  "passage": "Your generated passage here with a blank",
  "question": "Which choice completes the text with the most logical and precise word or phrase?",
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
  },
  
  // TODO: Add Transitions prompts (easy, medium, hard)
  // TODO: Add Rhetorical Synthesis prompts (easy, medium, hard)
  // TODO: Add Form Structure and Sense prompts (easy, medium, hard)
];
