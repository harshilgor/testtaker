// Central Ideas and Details Skill Prompts
// Domain: Information and Ideas
// Skill: Central Ideas and Details

import { QuestionPrompt } from '../../index';

export const prompts: QuestionPrompt[] = [
  // Easy Difficulty
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a specific supporting detail that directly supports a clearly stated main idea in an informational passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like technology, history, art, medicine, etc.)
- DO NOT use the same question stem format as other questions (vary between "According to the passage...", "The passage states...", "Based on the passage...", etc.)
- DO NOT ask about the same type of detail (if another question asks about "features," ask about "characteristics," "methods," "reasons," etc.)
- Vary topics across different domains: if one question is about animals/nature, make this about technology, history, social science, arts, medicine, business, etc.
- Ensure the passage topic is completely different (different subject, different context, different field of study)

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify an explicit supporting detail
- The passage must have a clearly stated central idea (typically in the first sentence)
- The correct answer must be a close paraphrase of a specific detail from the passage
- Distractors must represent common errors: unstated details, contradictions, or overly general statements

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: technology, history, arts, medicine, business, social science, natural science, humanities, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "renewable energy innovations" not just "energy")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Technology: smartphone design, social media platforms, coding languages, AI applications, digital privacy
- History: Renaissance art movements, ancient trade routes, historical inventions, cultural exchanges
- Arts: modern dance techniques, film editing, architectural styles, music composition
- Medicine: vaccine development, medical imaging, public health initiatives, telemedicine
- Business: e-commerce trends, sustainable business practices, market research, entrepreneurship
- Social Science: urban planning, educational methods, cultural preservation, social movements
- Natural Science: climate research, space exploration, renewable energy, oceanography (NOT animal adaptations)

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from natural science, social science, or humanities context
   - The first sentence must clearly state the central idea/main point
   - The remaining sentences must provide 3-5 distinct, specific supporting details
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure each supporting detail is explicitly stated (not implied)

2. Question Generation:
   - Question stem must be direct and unambiguous
   - Use one of these stem formats:
     * "According to the passage, [subject]..."
     * "The passage states that [subject]..."
     * "Based on the passage, one characteristic of [subject] is that it..."
   - The question must ask for a specific supporting detail (not the main idea itself)

3. Answer Choice Generation:
   - Correct Answer: Must be a close, accurate paraphrase of one specific supporting detail from the passage. It should maintain the meaning while using different wording.
   
   - Distractor 1 (Unstated Detail): A plausible statement related to the topic that is NOT mentioned in the passage. It should sound reasonable but cannot be found in the text.
   
   - Distractor 2 (Contradiction): A statement that directly contradicts a detail stated in the passage. It should use similar language or concepts to create a tempting trap.
   
   - Distractor 3 (Too General): A statement that is related to the topic but is too broad or general to be the specific detail asked for. It may be true but doesn't match the precision required.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the passage's central idea
     * Quote or paraphrase the specific sentence(s) from the passage that contain the supporting detail
     * Explain how the correct answer choice accurately paraphrases this detail
     * Show the direct connection between the passage text and the answer choice
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (unstated, contradiction, too general)
     * Explain why a student might be tempted by this choice
     * Reference the passage to show why this choice cannot be correct

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Your question stem here",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including passage reference",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong",
    "C": "Rationale for option C explaining why it's wrong",
    "D": "Rationale for option D explaining why it's wrong"
  }
}

QUALITY CHECKLIST:
- Passage has clear central idea in first sentence
- Passage contains explicit supporting details
- Question asks for a specific detail (not main idea)
- Correct answer is accurate paraphrase of passage detail
- All distractors represent distinct error types
- Rationales are comprehensive and reference specific passage text
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 2: Hypothetical Consequence Questions
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a key detail in the passage and understand its logical consequence or significance.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like business, technology, history, social movements, etc.)
- DO NOT use the same question stem format as other questions (vary the phrasing of hypothetical questions)
- DO NOT use the same type of problem/solution scenario (vary between efficiency, accessibility, quality, safety, etc.)
- Vary topics across different domains: if one question is about nature/animals, make this about business, technology, education, health, etc.
- Ensure the passage topic is completely different (different subject, different context, different field)

ASSESSMENT CRITERIA:
- The question must assess the student's ability to identify a specific detail and understand its logical implications
- The passage must present a clear sequence of events, actions, or cause-and-effect relationships
- The correct answer must be the most logical consequence based on a key detail explicitly stated in the passage
- Distractors must represent common errors: misinterpreting the sequence of events, confusing cause and effect, or misunderstanding what the text actually states

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: technology, history, arts, medicine, business, social science, natural science, humanities, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "renewable energy innovations" not just "energy")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Technology: smartphone design, social media platforms, coding languages, AI applications, digital privacy
- History: Renaissance art movements, ancient trade routes, historical inventions, cultural exchanges
- Arts: modern dance techniques, film editing, architectural styles, music composition
- Medicine: vaccine development, medical imaging, public health initiatives, telemedicine
- Business: e-commerce trends, sustainable business practices, market research, entrepreneurship
- Social Science: urban planning, educational methods, cultural preservation, social movements
- Natural Science: climate research, space exploration, renewable energy, oceanography (NOT animal adaptations)

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from natural science, social science, humanities, or historical context
   - The passage should describe a person, process, or situation that undergoes a change or development
   - Include a clear sequence: initial state → action/change → result/outcome
   - The passage must explicitly state:
     * A problem, challenge, or situation that existed
     * A specific action, method, or change that was implemented
     * The positive outcome or benefit that resulted from that action
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the cause-and-effect relationship is explicitly stated (not just implied)

2. Question Generation:
   - Question stem must ask about a hypothetical consequence
   - Use this exact stem format:
     * "Based on the text, what would have been the most likely consequence if [subject] had not [key action from passage]?"
   - The question must reference a specific action, method, or change mentioned in the passage
   - The question tests understanding of the logical relationship between the action and its outcome

3. Answer Choice Generation:
   - Correct Answer: Must be the most logical consequence that would have occurred if the key action had NOT happened. It should directly relate to the problem or challenge that the action solved, as stated in the passage.
   
   - Distractor 1 (Misinterpreting Sequence): A statement that confuses what happened before vs. after the key action, or misinterprets the timeline of events in the passage.
   
   - Distractor 2 (Confusing Cause and Effect): A statement that presents an effect that actually occurred as a consequence, when in fact it was already happening or was the reason FOR the action (reverses the cause-effect relationship).
   
   - Distractor 3 (Unsupported Inference): A plausible-sounding statement that is not supported by the passage text, or that goes beyond what can be reasonably inferred from the information provided.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the key action or change mentioned in the passage
     * Quote or paraphrase the specific sentence(s) that describe the problem/challenge that existed
     * Quote or paraphrase the sentence(s) that describe the action taken and its result
     * Explain the logical relationship: "The text states that [action] allowed [subject] to [outcome]. Therefore, if [subject] had not [action], it is reasonable to conclude that [consequence]."
     * Show how the correct answer presents the most logical consequence
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (misinterpreting sequence, confusing cause/effect, unsupported inference)
     * Quote or reference the passage to show what the text actually states
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because it uses keywords from the passage, but it misinterprets the sequence of events...")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Based on the text, what would have been the most likely consequence if [subject] had not [key action]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including passage references and logical reasoning",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage clearly presents a problem/challenge → action → outcome sequence
- Question asks about the logical consequence if the key action had not occurred
- Correct answer is the most reasonable inference based on the passage's explicit information
- All distractors represent distinct error types (sequence confusion, cause/effect reversal, unsupported inference)
- Rationales are comprehensive, quote the passage, and explain the logical reasoning
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 3: Main Idea/Central Idea Questions
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify the main idea or central point of a passage by synthesizing multiple details and understanding the overall message or significance.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like literature, history, personal experiences, nature scenes, etc.)
- DO NOT use the same narrative context as other questions (vary between literary excerpts, personal narratives, historical scenes, nature descriptions, etc.)
- DO NOT use the same type of experience or reaction (vary between discovery, realization, observation, emotional reaction, etc.)
- Vary topics widely: if one question is about animals/nature, make this about human experiences, literature, history, arts, etc.
- Ensure the passage topic and context are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to synthesize information from multiple parts of the passage to identify the main idea
- The passage should present a narrative, descriptive, or informational scenario where the main idea is implied through details rather than explicitly stated in a single sentence
- The correct answer must accurately capture the central message, theme, or overall significance of the passage
- Distractors must represent common errors: misinterpreting emotional cues, focusing on tangential details, or confusing the sequence of events

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: literature, history, arts, personal experiences, cultural contexts, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a musician's first performance" not just "music")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Literature: character moments, literary scenes, author experiences, writing processes
- History: historical moments, cultural events, personal accounts from history
- Arts: artist experiences, creative processes, artistic movements, gallery visits
- Personal: first experiences, discoveries, realizations, observations
- Cultural: festivals, traditions, community events, cultural practices

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or unique perspectives
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from literature, narrative nonfiction, or descriptive text context
   - The passage should describe a character's experience, reaction, or a specific scene
   - Include multiple descriptive details that collectively convey the main idea:
     * Sensory details (what the character sees, hears, feels)
     * Emotional reactions or responses
     * Actions or behaviors that reveal the character's state of mind
   - The main idea should be implied through these details rather than stated directly
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the details work together to create a coherent central message

2. Question Generation:
   - Question stem must ask for the main idea or central point
   - Use this exact stem format:
     * "Which choice best states the main idea of the text?"
   - The question tests the ability to synthesize multiple details to understand the overall message

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize the key details from the passage to state the main idea. It should capture the overall significance, emotional state, or central message that emerges from combining the various details.
   
   - Distractor 1 (Misinterpreting Emotional Cues): A statement that misinterprets a strong emotional reaction or detail. For example, if the passage shows delight through a "scream" or "exclamation," this distractor might interpret it as fear or upset.
   
   - Distractor 2 (Focusing on Tangential Detail): A statement that focuses on a specific, less central detail from the passage rather than the overall main idea. It may be factually accurate but misses the bigger picture.
   
   - Distractor 3 (Confusing Sequence or Context): A statement that misinterprets the sequence of events, the context, or attributes a detail to the wrong part of the passage. It may combine accurate details but in an incorrect way.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the main idea that emerges from the passage
     * Quote or reference multiple specific details from the passage that support this main idea
     * Explain how these details work together to create the central message
     * Show how the correct answer accurately synthesizes these details into a coherent main idea
     * Address any potential misinterpretations (e.g., "While the passage mentions [detail that might be confusing], the context and other details show that [correct interpretation]")
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (misinterpreting emotional cues, focusing on tangential detail, confusing sequence/context)
     * Quote or reference the passage to show what the text actually states
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because [detail] might suggest [misinterpretation], but the passage indicates [correct interpretation] through [other details]")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Which choice best states the main idea of the text?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of multiple passage details",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage contains multiple details that collectively convey the main idea
- Main idea is implied rather than explicitly stated in a single sentence
- Question asks for the main idea/central point
- Correct answer accurately synthesizes multiple details to state the main idea
- All distractors represent distinct error types (emotional misinterpretation, tangential detail, sequence confusion)
- Rationales are comprehensive, reference multiple passage details, and explain the synthesis
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 4: Identifying Explicit Reasons/Purposes
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a specific reason, purpose, or motivation that is explicitly stated in an informational passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like research, business, technology, education, medicine, etc.)
- DO NOT use the same question stem format as other questions (vary between "what is one reason...", "why are...", "in order to...", etc.)
- DO NOT use the same type of reason/purpose (vary between research interests, practical purposes, goals, motivations, etc.)
- Vary topics across different domains: if one question is about nature/animals, make this about science, business, technology, social issues, etc.
- Ensure the passage topic is completely different (different subject, different context, different field)

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify an explicit reason, purpose, or motivation stated in the passage
- The passage must explain why someone is interested in something, why something is done, or what purpose something serves
- The correct answer must be a direct paraphrase of the stated reason or purpose
- Distractors must represent common errors: introducing ideas not mentioned, misinterpreting details, or confusing related but distinct concepts

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: technology, history, arts, medicine, business, social science, natural science, humanities, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "renewable energy innovations" not just "energy")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Technology: smartphone design, social media platforms, coding languages, AI applications, digital privacy
- History: Renaissance art movements, ancient trade routes, historical inventions, cultural exchanges
- Arts: modern dance techniques, film editing, architectural styles, music composition
- Medicine: vaccine development, medical imaging, public health initiatives, telemedicine
- Business: e-commerce trends, sustainable business practices, market research, entrepreneurship
- Social Science: urban planning, educational methods, cultural preservation, social movements
- Natural Science: climate research, space exploration, renewable energy, oceanography (NOT animal adaptations)

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from natural science, social science, or humanities context
   - The passage should explain a research interest, purpose, motivation, or reason for doing something
   - The passage must explicitly state one or more reasons/purposes, such as:
     * Why researchers are interested in a topic
     * What purpose a method or approach serves
     * Why something is important or valuable
     * What goal or objective is being pursued
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the reason/purpose is explicitly stated (not just implied)

2. Question Generation:
   - Question stem must ask for a specific reason or purpose
   - Use one of these stem formats:
     * "According to the text, what is one reason [subject] [action/interest]?"
     * "Based on the passage, why are [researchers/people] interested in [topic]?"
     * "The text indicates that [subject] [action] in order to..."
   - The question must reference a specific reason or purpose that is directly stated in the passage

3. Answer Choice Generation:
   - Correct Answer: Must be a close, accurate paraphrase of the explicitly stated reason or purpose from the passage. It should maintain the meaning while using different wording.
   
   - Distractor 1 (Not Mentioned): A plausible statement related to the topic that is NOT mentioned anywhere in the passage. It should sound reasonable but cannot be found in the text.
   
   - Distractor 2 (Misinterpreting Detail): A statement that misinterprets or misrepresents a detail from the passage. It may use similar language but changes the meaning or confuses related concepts.
   
   - Distractor 3 (Unrelated Purpose): A statement that introduces a different purpose or reason that is not stated in the passage, even though it might seem related to the topic.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific reason or purpose asked about in the question
     * Quote or paraphrase the exact sentence(s) from the passage that state this reason or purpose
     * Explain how the correct answer choice accurately paraphrases this stated reason
     * Show the direct connection between the passage text and the answer choice
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (not mentioned, misinterpreting detail, unrelated purpose)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because it uses keywords from the passage, but it misinterprets [detail]...")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what is one reason [subject] [action/interest]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to the stated reason",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explicitly states a reason, purpose, or motivation
- Question asks for a specific reason or purpose
- Correct answer is accurate paraphrase of the stated reason
- All distractors represent distinct error types (not mentioned, misinterpretation, unrelated purpose)
- Rationales are comprehensive and reference specific passage text
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 5: Character Analysis Questions
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify explicit details about a character's actions, preferences, or characteristics as stated in a narrative passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like historical figures, literary characters, artists, scientists, etc.)
- DO NOT use the same character type or context as other questions (vary between different time periods, different settings, different character types)
- DO NOT use the same type of character trait (vary between actions, preferences, behaviors, skills, etc.)
- Vary topics widely: if one question is about animals/nature, make this about people, literature, history, arts, etc.
- Ensure the passage topic and character are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify explicit details about a character
- The passage should describe a character's actions, preferences, behaviors, or characteristics
- The correct answer must be directly supported by explicit details stated in the passage
- Distractors must represent common errors: contradicting the passage, overstating details, or misinterpreting character traits

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: literature, history, arts, personal experiences, cultural contexts, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a musician's first performance" not just "music")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Literature: character moments, literary scenes, author experiences, writing processes
- History: historical figures, cultural events, personal accounts from history
- Arts: artist experiences, creative processes, artistic movements, gallery visits
- Personal: first experiences, discoveries, realizations, observations
- Cultural: festivals, traditions, community events, cultural practices

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or unique perspectives
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph narrative passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from literature or narrative context
   - The passage should describe a character and their actions, preferences, or behaviors
   - Include multiple explicit details about the character, such as:
     * What activities the character engages in
     * What the character prefers or avoids
     * How the character interacts with others
     * What the character creates or produces
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure character details are explicitly stated (not just implied)
   - The passage may contrast what the character does with what they avoid or prefer not to do

2. Question Generation:
   - Question stem must ask what is true about the character
   - Use this exact stem format:
     * "According to the text, what is true about [character name]?"
   - The question must reference a character mentioned in the passage
   - The question tests the ability to identify explicit character details

3. Answer Choice Generation:
   - Correct Answer: Must be directly supported by explicit details stated in the passage. It should accurately describe an action, preference, or characteristic of the character as presented in the text.
   
   - Distractor 1 (Contradicts Passage): A statement that contradicts what the passage says about the character. It may use similar language but presents the opposite of what is stated.
   
   - Distractor 2 (Overstates Detail): A statement that takes a detail from the passage and overstates it (e.g., adding "favorite" or "most" when the passage doesn't indicate preference or ranking). It may be partially true but goes beyond what the text states.
   
   - Distractor 3 (Misinterprets Character): A statement that misinterprets or misrepresents the character's actions or preferences. It may combine accurate details but in an incorrect way, or attribute something to the character that isn't supported by the passage.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the character detail asked about in the question
     * Quote or paraphrase the exact sentence(s) from the passage that describe this detail
     * Explain how the correct answer choice accurately reflects what the passage states about the character
     * Show the direct connection between the passage text and the answer choice
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (contradicts passage, overstates detail, misinterprets character)
     * Quote or reference the passage to show what the text actually states about the character
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [detail], but it doesn't state that [overstatement]...")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what is true about [character name]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to character details",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explicitly describes character actions, preferences, or characteristics
- Question asks what is true about the character
- Correct answer is directly supported by explicit passage details
- All distractors represent distinct error types (contradiction, overstatement, misinterpretation)
- Rationales are comprehensive and reference specific passage text about the character
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 6: Identifying Specific Actions/Behaviors
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a specific action, thought, or behavior that a character performs at a particular moment, as explicitly stated or clearly inferable from a narrative passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like performances, journeys, decisions, observations, etc.)
- DO NOT use the same moment/context type as other questions (vary between performances, journeys, waiting, decisions, observations, etc.)
- DO NOT use the same question stem format as other questions (vary between "as [she/he]...", "while...", "when...", etc.)
- Vary topics widely: if one question is about animals/nature, make this about human experiences, literature, history, etc.
- Ensure the passage topic and moment are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify a specific action or behavior at a specific moment
- The passage should describe a character performing actions or having thoughts at a particular time or during a particular activity
- The correct answer must be directly supported by explicit details stated in the passage
- Distractors must represent common errors: actions not mentioned, contradicting the text, or focusing on the wrong moment

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: literature, history, arts, personal experiences, cultural contexts, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a musician's first performance" not just "music")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Literature: character moments, literary scenes, author experiences, writing processes
- History: historical moments, cultural events, personal accounts from history
- Arts: artist experiences, creative processes, artistic movements, gallery visits
- Personal: first experiences, discoveries, realizations, observations
- Cultural: festivals, traditions, community events, cultural practices

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or unique perspectives
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph narrative passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from literature or narrative context
   - The passage should describe a character at a specific moment or during a specific activity
   - Include explicit details about what the character does, thinks, or feels at that moment, such as:
     * Following advice or instructions
     * Performing a specific action
     * Having a particular thought or memory
     * Making a specific decision or choice
   - Use first-person or third-person narrative perspective
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the action/behavior is explicitly stated or clearly inferable from the text

2. Question Generation:
   - Question stem must ask what the character does at a specific moment
   - Use one of these stem formats:
     * "According to the text, what does [character] do as [she/he] [specific action/context]?"
     * "According to the text, what does [character] do while [specific context]?"
     * "Based on the passage, what does [character] do when [specific situation]?"
   - The question must reference a specific moment, action, or context mentioned in the passage
   - The question tests the ability to identify explicit actions or behaviors

3. Answer Choice Generation:
   - Correct Answer: Must be directly supported by explicit details stated in the passage. It should accurately describe what the character does, thinks, or remembers at the specific moment referenced in the question.
   
   - Distractor 1 (Not Mentioned): A statement that describes an action or thought that is not mentioned in the passage. It may be plausible but cannot be found in the text.
   
   - Distractor 2 (Contradicts Text): A statement that contradicts what the passage says about the character's actions or thoughts. It may use similar language but presents information that conflicts with the text.
   
   - Distractor 3 (Wrong Moment/Context): A statement that describes something the character does, but at a different time or in a different context than what the question asks about. It may be accurate but doesn't answer the specific question asked.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific moment or context referenced in the question
     * Quote or paraphrase the exact sentence(s) from the passage that describe what the character does at that moment
     * Explain how the correct answer choice accurately reflects what the passage states
     * Show the direct connection between the passage text and the answer choice
     * If the answer involves following advice or remembering something, explain how the text supports this
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (not mentioned, contradicts text, wrong moment/context)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because [reason], but the text [doesn't mention/contradicts this]...")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what does [character] do as [she/he] [specific action/context]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to the specific action",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explicitly describes character actions/thoughts at a specific moment
- Question asks what the character does at a specific moment or during a specific activity
- Correct answer is directly supported by explicit passage details
- All distractors represent distinct error types (not mentioned, contradiction, wrong moment)
- Rationales are comprehensive and reference specific passage text
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 7: Identifying Emotional Reactions/Responses
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a character's emotional reaction or response to a specific stimulus by synthesizing multiple emotional cues explicitly stated in a narrative passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like artwork, music, discoveries, nature scenes, etc.)
- DO NOT use the same type of stimulus as other questions (vary between seeing artwork, hearing music, experiencing nature, making discoveries, etc.)
- DO NOT use the same emotional reaction type as other questions (vary between positive, negative, mixed emotions, different specific emotions)
- Vary topics widely: if one question is about animals/nature, make this about human reactions, art, music, literature, etc.
- Ensure the passage topic, stimulus, and emotional reaction are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to synthesize multiple emotional details to identify the character's overall emotional state or reaction
- The passage should describe a character's emotional response to seeing, experiencing, or encountering something specific
- The correct answer must accurately capture the character's emotional reaction by combining multiple emotional cues from the passage
- Distractors must represent common errors: focusing on unrelated details, misinterpreting emotional cues, or introducing emotions not mentioned

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: literature, history, arts, personal experiences, cultural contexts, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a musician's first performance" not just "music")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Literature: character moments, literary scenes, author experiences, writing processes
- History: historical moments, cultural events, personal accounts from history
- Arts: artist experiences, creative processes, artistic movements, gallery visits, museum experiences
- Personal: first experiences, discoveries, realizations, observations
- Cultural: festivals, traditions, community events, cultural practices

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or unique perspectives
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph narrative passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from literature or narrative context
   - The passage should describe a character's reaction to a specific stimulus (e.g., seeing something, hearing something, experiencing something)
   - Include multiple explicit emotional cues that collectively convey the character's emotional state, such as:
     * Physical reactions (flushed cheeks, widened eyes, smile, etc.)
     * Emotional descriptors (pleasure, joy, wonder, delight, etc.)
     * Behavioral responses (standing motionless, drawing back, etc.)
     * Internal thoughts or realizations
   - The emotional reaction should be conveyed through multiple details working together, not just a single word
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure emotional cues are explicitly stated (not just implied)

2. Question Generation:
   - Question stem must ask what is true about the character's reaction or emotional state
   - Use this exact stem format:
     * "According to the text, what is true about [character name]?"
   - The question must reference a character mentioned in the passage
   - The question tests the ability to synthesize multiple emotional cues to identify the overall reaction

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize multiple emotional cues from the passage to describe the character's overall emotional reaction. It should capture the combined effect of the various emotional details (e.g., "delighted," "pleased," "amazed").
   
   - Distractor 1 (Focuses on Unrelated Detail): A statement that focuses on a detail from the passage that is not related to the character's emotional reaction (e.g., what the character wants to know, what the character prefers, etc.). It may be factually accurate but doesn't address the emotional response.
   
   - Distractor 2 (Overstates or Misinterprets): A statement that overstates a detail or misinterprets the emotional cues. It may take one emotional detail and make it seem more significant than it is, or misinterpret the overall emotional state.
   
   - Distractor 3 (Not Mentioned): A statement that introduces an emotion, preference, or concern that is not mentioned in the passage. It may be plausible but cannot be found in the text.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific stimulus or situation that triggers the character's reaction
     * Quote or paraphrase multiple specific emotional cues from the passage (physical reactions, emotional descriptors, behavioral responses)
     * Explain how these cues work together to convey the overall emotional reaction
     * Show how the correct answer choice accurately synthesizes these multiple cues into a coherent description of the character's emotional state
     * Address how the character's reaction is so strong or focused that it affects their awareness of other things (if applicable)
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (focuses on unrelated detail, overstates/misinterprets, not mentioned)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [detail], but this detail is not about the character's emotional reaction...")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what is true about [character name]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of multiple emotional cues from the passage",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage describes character's emotional reaction to a specific stimulus
- Passage includes multiple explicit emotional cues (physical, behavioral, descriptive)
- Question asks what is true about the character
- Correct answer synthesizes multiple emotional cues to describe the overall reaction
- All distractors represent distinct error types (unrelated detail, overstatement/misinterpretation, not mentioned)
- Rationales are comprehensive and reference multiple emotional cues from the passage
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 8: Understanding Why Something Wouldn't Work
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify an explicit reason or cause-and-effect relationship explaining why something would be unable to function or work in a specific context, as stated in an informational passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like space exploration, engineering, biology, technology, environmental science, etc.)
- DO NOT use the same type of incompatibility as other questions (vary between atmospheric, gravitational, temperature, size, material properties, etc.)
- DO NOT use the same question stem format as other questions (vary the phrasing)
- Vary topics widely: if one question is about animals/nature, make this about space, technology, engineering, etc.
- Ensure the passage topic and technical challenge are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to identify a direct cause-and-effect relationship or explicit reason
- The passage should explain why something designed for one context wouldn't work in another context
- The correct answer must be directly supported by explicit details stated in the passage
- Distractors must represent common errors: misinterpreting details, introducing factors not mentioned, or confusing related concepts

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: technology, engineering, space science, environmental science, materials science, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "Mars rover design challenges" not just "space")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Space Science: Mars exploration, satellite technology, space station design, lunar missions
- Engineering: bridge design, building materials, transportation systems, infrastructure
- Technology: software compatibility, hardware design, network systems, digital platforms
- Environmental: climate adaptation, renewable energy systems, water management
- Materials: composite materials, smart materials, sustainable materials

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from natural science, technology, or technical context
   - The passage should explain:
     * A specific condition or characteristic of one environment (e.g., Earth, one type of system)
     * A different condition or characteristic of another environment (e.g., Mars, another type of system)
     * Why something designed for the first environment wouldn't work in the second environment
     * How the problem is solved or addressed for the second environment
   - Include explicit details about the key difference that causes the problem
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the cause-and-effect relationship is explicitly stated

2. Question Generation:
   - Question stem must ask why something wouldn't work
   - Use this exact stem format:
     * "According to the text, why would [something designed for context A] be unable to [function] in [context B]?"
   - The question must reference the specific problem or limitation mentioned in the passage
   - The question tests the ability to identify the explicit reason for the limitation

3. Answer Choice Generation:
   - Correct Answer: Must directly state the explicit reason given in the passage for why something wouldn't work. It should accurately describe the key difference or condition that causes the problem (e.g., "Because [context A] and [context B] have different [specific condition]").
   
   - Distractor 1 (Misinterprets Detail): A statement that misinterprets a detail from the passage. For example, if the passage mentions that a solution has longer blades, this distractor might incorrectly state that Earth designs have blades that are too large.
   
   - Distractor 2 (Not Mentioned): A statement that introduces a factor or concept that is not mentioned in the passage (e.g., gravity, temperature, size) when the passage focuses on a different factor.
   
   - Distractor 3 (Confuses Related Concepts): A statement that confuses related but distinct concepts mentioned in the passage. It may combine accurate details but in an incorrect way.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific problem or limitation asked about in the question
     * Quote or paraphrase the exact sentence(s) from the passage that explain the key difference or condition
     * Explain how this difference causes the problem (the cause-and-effect relationship)
     * Show how the correct answer choice accurately states this explicit reason
     * Connect the reason to the inability to function
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (misinterprets detail, not mentioned, confuses concepts)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [detail], but it actually states [correct interpretation]...")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, why would [something designed for context A] be unable to [function] in [context B]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to the cause-and-effect relationship",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explains why something designed for one context wouldn't work in another
- Passage explicitly states the key difference or condition causing the problem
- Question asks why something would be unable to function
- Correct answer directly states the explicit reason from the passage
- All distractors represent distinct error types (misinterpretation, not mentioned, confused concepts)
- Rationales are comprehensive and reference specific passage text explaining the cause-and-effect
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 9: Identifying Explicitly Stated Activities
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify an explicitly stated activity or action that characters engage in during a specific context or situation, as directly stated in a narrative passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like traveling, waiting, working, playing, studying, etc.)
- DO NOT use the same context/situation as other questions (vary between traveling, waiting, working, playing, studying, etc.)
- DO NOT use the same type of activity as other questions (vary between games, observations, interactions, tasks, conversations, etc.)
- DO NOT use the same question stem format as other questions (vary the phrasing)
- Vary topics widely: if one question is about animals/nature, make this about human activities, social situations, etc.
- Ensure the passage topic, context, and activity are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify an explicitly stated activity or action
- The passage should describe what characters do during a specific activity, journey, or situation
- The correct answer must be directly stated in the passage (not inferred)
- Distractors must represent common activities that are plausible but not mentioned in the text

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: literature, history, arts, personal experiences, cultural contexts, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a musician's first performance" not just "music")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Literature: character moments, literary scenes, author experiences, writing processes
- History: historical moments, cultural events, personal accounts from history
- Arts: artist experiences, creative processes, artistic movements, gallery visits
- Personal: first experiences, discoveries, realizations, observations
- Cultural: festivals, traditions, community events, cultural practices

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or unique perspectives
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph narrative passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from literature, memoir, or narrative context
   - The passage should describe characters during a specific activity, journey, or situation (e.g., traveling, waiting, working together)
   - Include explicit statements about what the characters do during this context, such as:
     * Playing games or engaging in activities
     * Observing or looking for specific things
     * Interacting with each other or their environment
   - The activity should be clearly and directly stated (e.g., "Mario and I played games...")
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the activity is explicitly stated, not just implied

2. Question Generation:
   - Question stem must ask what characters did during a specific context
   - Use one of these stem formats:
     * "According to the text, what did [characters] do while [specific context]?"
     * "Based on the passage, what did [characters] do during [specific activity]?"
     * "The text indicates that [characters] [action] while [context]."
   - The question must reference a specific context, activity, or situation mentioned in the passage
   - The question tests the ability to identify explicitly stated activities

3. Answer Choice Generation:
   - Correct Answer: Must be the exact activity or action explicitly stated in the passage. It should be a direct match or close paraphrase of what the text says the characters did.
   
   - Distractor 1 (Common Activity Not Mentioned): A statement that describes a common, plausible activity that people might do in that context, but that is not mentioned in the passage (e.g., reading, singing, sleeping).
   
   - Distractor 2 (Different Common Activity Not Mentioned): Another common, plausible activity for that context that is not mentioned in the passage.
   
   - Distractor 3 (Another Common Activity Not Mentioned): A third common, plausible activity for that context that is not mentioned in the passage.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific context or situation referenced in the question
     * Quote the exact sentence(s) from the passage that state what the characters did
     * Explain how the correct answer choice directly matches what the passage states
     * Show the direct connection between the passage text and the answer choice
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify that the activity is not mentioned in the passage
     * Quote or reference the passage to show what the text actually states
     * Explain that while this activity might be plausible for the context, it is not what the passage describes

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what did [characters] do while [specific context]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct quote from the passage",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong (not mentioned in passage)",
    "C": "Rationale for option C explaining why it's wrong (not mentioned in passage)",
    "D": "Rationale for option D explaining why it's wrong (not mentioned in passage)"
  }
}

QUALITY CHECKLIST:
- Passage explicitly states what characters do during a specific context
- Question asks what characters did during a specific context or activity
- Correct answer is the exact activity explicitly stated in the passage
- All distractors are common, plausible activities not mentioned in the passage
- Rationales are comprehensive and quote the exact passage text
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 10: Main Idea in Informational Passages
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify the main idea of an informational passage by synthesizing multiple explicit points about benefits, opportunities, changes, or impacts.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like technology, social movements, historical developments, innovations, etc.)
- DO NOT use the same type of thing being described as other questions (vary between technologies, movements, developments, innovations, etc.)
- DO NOT use the same type of benefits/impacts as other questions (vary between economic, social, cultural, technological, etc.)
- Vary topics widely: if one question is about animals/nature, make this about technology, history, social issues, etc.
- Ensure the passage topic and subject matter are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to synthesize multiple explicit points to identify the main idea
- The passage should be informational/expository, describing benefits, opportunities, changes, or impacts
- The correct answer must accurately synthesize all the key points into a coherent main idea
- Distractors must represent common errors: focusing on one narrow detail, making unsupported claims, or exaggerating what the text states

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: technology, history, arts, medicine, business, social science, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "renewable energy innovations" not just "energy")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Technology: smartphone design, social media platforms, coding languages, AI applications, digital privacy
- History: Renaissance art movements, ancient trade routes, historical inventions, cultural exchanges
- Arts: modern dance techniques, film editing, architectural styles, music composition
- Medicine: vaccine development, medical imaging, public health initiatives, telemedicine
- Business: e-commerce trends, sustainable business practices, market research, entrepreneurship
- Social Science: urban planning, educational methods, cultural preservation, social movements

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from social science, history, technology, or informational context
   - The passage should describe multiple related benefits, opportunities, changes, or impacts of something (e.g., a technology, social movement, historical development)
   - Include multiple explicit points that collectively support the main idea, such as:
     * Different types of benefits or opportunities provided
     * Various ways something changed people's lives or behaviors
     * Multiple impacts or consequences
   - The main idea should emerge from synthesizing these multiple points
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the points work together to create a coherent central theme

2. Question Generation:
   - Question stem must ask for the main idea
   - Use this exact stem format:
     * "Which choice best states the main idea of the text?"
   - The question tests the ability to synthesize multiple explicit points to identify the overall main idea

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize all the key points from the passage to state the main idea. It should encompass the central theme that connects all the benefits, opportunities, or changes mentioned (e.g., "The widespread adoption of X provided new opportunities for people").
   
   - Distractor 1 (Too Narrow - Focuses on One Detail): A statement that focuses on only one specific detail or benefit mentioned in the passage, rather than the overall main idea. It may be factually accurate but misses the bigger picture.
   
   - Distractor 2 (Unsupported Claim or Exaggeration): A statement that makes a claim not supported by the passage or exaggerates what the text states (e.g., adding "the preferred" or "the first" when the passage doesn't make such claims, or claiming something is "the best" when the passage doesn't compare).
   
   - Distractor 3 (Not Mentioned): A statement that introduces a concept, detail, or claim that is not mentioned anywhere in the passage (e.g., mentioning safety when the passage doesn't discuss it).

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the main idea that synthesizes all the key points
     * List the multiple points from the passage that support this main idea (e.g., "The text mentions X, Y, and Z opportunities")
     * Explain how these points work together to create the central theme
     * Show how the correct answer choice accurately encompasses all these points into a coherent main idea
     * Explain why this answer is more comprehensive than the distractors
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (too narrow, unsupported claim/exaggeration, not mentioned)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [detail], but this is only one of the opportunities mentioned, not the main idea...")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Which choice best states the main idea of the text?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of all key points from the passage",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage is informational/expository describing multiple benefits, opportunities, or changes
- Passage includes multiple explicit points that support the main idea
- Question asks for the main idea
- Correct answer synthesizes all key points into a coherent main idea
- All distractors represent distinct error types (too narrow, unsupported/exaggerated, not mentioned)
- Rationales are comprehensive and reference multiple points from the passage
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 11: Identifying Specific Items/Creations with Attributes
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a specific item, creation, or work with specific attributes (location, time, subject, type) as explicitly stated in an informational passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like artworks, buildings, inventions, performances, discoveries, etc.)
- DO NOT use the same type of item as other questions (vary between paintings, sculptures, buildings, plays, books, inventions, etc.)
- DO NOT use the same combination of attributes as other questions (vary which attributes are emphasized)
- DO NOT use the same question stem format as other questions (vary the phrasing)
- Vary topics widely: if one question is about animals/nature, make this about arts, culture, history, etc.
- Ensure the passage topic and item type are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify a specific item/creation with multiple matching attributes
- The passage should describe a specific work, creation, or item with explicit details about its attributes
- The correct answer must match all the specified attributes mentioned in the passage
- Distractors must represent common errors: wrong type/category, wrong subject, wrong location/time, or misrepresenting relationships

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: arts, culture, history, technology, architecture, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a specific architectural landmark" not just "architecture")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Arts: specific artworks, sculptures, paintings, installations, performances
- Architecture: buildings, structures, monuments, bridges, landmarks
- History: historical artifacts, documents, inventions, discoveries
- Technology: specific inventions, devices, innovations, platforms
- Culture: cultural artifacts, traditions, festivals, practices

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from arts, culture, history, or informational context
   - The passage should describe a specific work, creation, or item (e.g., artwork, building, invention, performance)
   - Include explicit details about the item's attributes, such as:
     * Type or category (e.g., sculpture, painting, building, car)
     * Subject or what it depicts/represents
     * Location where it was displayed, created, or located
     * Time period, year, or date
     * Creator or associated person
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure all attributes are explicitly stated

2. Question Generation:
   - Question stem must ask for a specific item/creation with specific attributes
   - Use one of these stem formats:
     * "According to the text, which [type of item] was [location/action] in [location] in [time]?"
     * "Based on the passage, which piece of [creator's] [category] was [action] at [location] in [time]?"
     * "The text indicates that [creator] created a [type] of [subject] that was [action] at [location] in [time]."
   - The question must reference multiple attributes (e.g., location AND time, or type AND subject)
   - The question tests the ability to match all specified attributes

3. Answer Choice Generation:
   - Correct Answer: Must accurately describe the specific item/creation with all the correct attributes (type, subject, location, time) as stated in the passage.
   
   - Distractor 1 (Wrong Type/Category): A statement that uses keywords from the passage but describes the wrong type or category (e.g., "painting" when the passage says "sculpture," or "building" when the passage says "monument").
   
   - Distractor 2 (Wrong Subject): A statement that uses the correct type/category but describes the wrong subject (e.g., "sculpture of [person]" when the passage says "sculpture of [object]").
   
   - Distractor 3 (Misrepresents Relationship): A statement that uses keywords from the passage but misrepresents the relationship (e.g., "sculpture of [person]" when the person is associated with the subject but not the subject itself, or mentions a location that's related but not where the item was displayed).

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific attributes asked about in the question (type, subject, location, time)
     * Quote the exact sentence(s) from the passage that describe the item with these attributes
     * Explain how the correct answer choice accurately matches all the specified attributes
     * Show the direct connection between the passage text and the answer choice
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (wrong type/category, wrong subject, misrepresents relationship)
     * Quote or reference the passage to show what the text actually states
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [keyword], but it actually states [correct information]...")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, which [type of item] was [location/action] in [location] in [time]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to all matching attributes",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explicitly describes a specific item/creation with multiple attributes (type, subject, location, time)
- Question asks for a specific item with specific attributes
- Correct answer matches all specified attributes from the passage
- All distractors represent distinct error types (wrong type, wrong subject, misrepresents relationship)
- Rationales are comprehensive and reference specific passage text with all attributes
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 12: Main Idea About Person's Achievements/Accomplishments
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify the main idea of an informational passage about a person's achievements or accomplishments in a role or position, where the main idea synthesizes multiple accomplishments.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like historical figures, scientists, artists, educators, business leaders, etc.)
- DO NOT use the same type of person or role as other questions (vary between leaders, scientists, artists, educators, activists, etc.)
- DO NOT use the same type of accomplishments as other questions (vary between creating jobs, introducing programs, making things accessible, etc.)
- Vary topics widely: if one question is about animals/nature, make this about people, history, science, arts, etc.
- Ensure the passage topic, person, and accomplishments are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to synthesize multiple accomplishments to identify the main idea
- The passage should describe a person's role and their multiple achievements or accomplishments
- The correct answer must accurately synthesize all the key accomplishments into a coherent main idea
- Distractors must be factually true statements from the passage, but they represent supporting details or background information, not the main idea

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: history, science, arts, business, education, social movements, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a specific innovator's contributions" not just "an innovator")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- History: specific historical figures, reformers, leaders, innovators
- Science: researchers, scientists, inventors, medical professionals
- Arts: artists, creators, performers, designers
- Business: entrepreneurs, business leaders, innovators
- Education: educators, reformers, educational innovators
- Social: activists, community leaders, social reformers

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from history, biography, social science, or informational context
   - The passage should describe a person who held a role or position and their multiple achievements or accomplishments
   - Include explicit details about:
     * The person's role, position, or appointment
     * Multiple accomplishments or achievements (e.g., created jobs, introduced new programs, made something accessible)
     * Background context (e.g., historical period, program they were part of, who appointed them)
     * Specific details about their work (e.g., numbers, types of people affected)
   - The main idea should synthesize the person's overall achievements/accomplishments
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure accomplishments are explicitly stated

2. Question Generation:
   - Question stem must ask for the main idea
   - Use this exact stem format:
     * "Which choice best states the main idea of the text?"
   - The question tests the ability to distinguish the main idea (synthesizing accomplishments) from supporting details or background information

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize all the key accomplishments from the passage to state the main idea. It should encompass the person's overall achievements/accomplishments in their role (e.g., "As [role], [person] succeeded in [accomplishment 1] and [accomplishment 2]").
   
   - Distractor 1 (True Supporting Detail): A statement that is factually accurate and mentioned in the passage, but focuses on only one specific detail or aspect of the person's work, rather than the overall main idea. It may describe what the person did but misses the bigger picture of their accomplishments.
   
   - Distractor 2 (True Background Information): A statement that is factually accurate and mentioned in the passage, but describes background information, context, or the situation that existed before or around the person's work, rather than the person's achievements themselves.
   
   - Distractor 3 (True Contextual Fact): A statement that is factually accurate and mentioned in the passage, but describes a general fact or context about the time period, program, or situation, rather than the person's specific accomplishments.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the person and their role
     * List the multiple accomplishments from the passage that support this main idea
     * Explain how these accomplishments work together to create the central theme
     * Show how the correct answer choice accurately synthesizes all these accomplishments into a coherent main idea
     * Explain why this answer is more comprehensive than the distractors
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Acknowledge that the statement is factually true and mentioned in the passage
     * Identify that it is supporting detail, background information, or contextual fact, not the main idea
     * Quote or reference the passage to show what the text states
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage does state [fact], but this is supporting information/background context, not the text's main idea. The focus of the text is [person's] accomplishments...")

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Which choice best states the main idea of the text?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of all accomplishments from the passage",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong (true but supporting detail/background info, not main idea)",
    "C": "Rationale for option C explaining why it's wrong (true but supporting detail/background info, not main idea)",
    "D": "Rationale for option D explaining why it's wrong (true but supporting detail/background info, not main idea)"
  }
}

QUALITY CHECKLIST:
- Passage describes a person's role and multiple accomplishments/achievements
- Passage includes background context and supporting details
- Question asks for the main idea
- Correct answer synthesizes all accomplishments into a coherent main idea
- All distractors are factually true but represent supporting details, background info, or contextual facts
- Rationales acknowledge that distractors are true but explain why they're not the main idea
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // ============================================
  // EXPANDED PROMPTS (Version 2.0) - More Flexible and Varied
  // ============================================
  
  // Easy Difficulty - Variant 1 (Expanded): Identifying Specific Supporting Details
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a specific supporting detail that directly supports a clearly stated main idea in an informational passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like technology, history, art, medicine, etc.)
- DO NOT use the same question stem format as other questions (vary between "According to the passage...", "The passage states...", "Based on the passage...", "The text indicates...", etc.)
- DO NOT ask about the same type of detail (if another question asks about "features," ask about "characteristics," "methods," "reasons," etc.)
- Vary topics across different domains: if one question is about animals/nature, make this about technology, history, social science, arts, medicine, business, etc.
- Ensure the passage topic is completely different (different subject, different context, different field of study)

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify an explicit supporting detail
- The passage must have a clearly stated central idea (typically in the first sentence, but can be anywhere)
- The correct answer must be a close paraphrase of a specific detail from the passage
- Distractors must represent common errors: unstated details, contradictions, or overly general statements

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: technology, history, arts, medicine, business, social science, natural science, humanities, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "renewable energy innovations" not just "energy")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Technology: smartphone design, social media platforms, coding languages, AI applications, digital privacy
- History: Renaissance art movements, ancient trade routes, historical inventions, cultural exchanges
- Arts: modern dance techniques, film editing, architectural styles, music composition
- Medicine: vaccine development, medical imaging, public health initiatives, telemedicine
- Business: e-commerce trends, sustainable business practices, market research, entrepreneurship
- Social Science: urban planning, educational methods, cultural preservation, social movements
- Natural Science: climate research, space exploration, renewable energy, oceanography (NOT animal adaptations)

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from ANY of these contexts (vary widely):
     * Natural science (biology, chemistry, physics, astronomy, geology, ecology, etc.)
     * Social science (psychology, sociology, economics, political science, anthropology, etc.)
     * Humanities (history, philosophy, literature, art history, cultural studies, etc.)
     * Technology (computers, engineering, innovations, etc.)
     * Current events or contemporary issues
     * Nature and environment
     * Health and medicine
   - The central idea/main point should be clearly stated (typically in the first sentence, but can be in the middle or end)
   - The remaining sentences must provide 3-5 distinct, specific supporting details
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure each supporting detail is explicitly stated (not implied)
   - Vary the passage structure: sometimes central idea first, sometimes details build to it

2. Question Generation:
   - Question stem must be direct and unambiguous
   - Use one of these stem formats (vary the phrasing):
     * "According to the passage, [subject]..."
     * "The passage states that [subject]..."
     * "Based on the passage, one characteristic of [subject] is that it..."
     * "The text indicates that [subject]..."
     * "According to the text, [subject]..."
     * "The passage mentions that [subject]..."
     * "Based on the text, [subject]..."
   - The question must ask for a specific supporting detail (not the main idea itself)
   - Vary what type of detail is asked about (characteristics, features, facts, methods, results, etc.)

3. Answer Choice Generation:
   - Correct Answer: Must be a close, accurate paraphrase of one specific supporting detail from the passage. It should maintain the meaning while using different wording.
   
   - Distractor 1 (Unstated Detail): A plausible statement related to the topic that is NOT mentioned in the passage. It should sound reasonable but cannot be found in the text. Make it contextually appropriate but clearly absent.
   
   - Distractor 2 (Contradiction): A statement that directly contradicts a detail stated in the passage. It should use similar language or concepts to create a tempting trap. The contradiction should be clear but subtle.
   
   - Distractor 3 (Too General): A statement that is related to the topic but is too broad or general to be the specific detail asked for. It may be true but doesn't match the precision required. It should be related but not specific enough.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the passage's central idea
     * Quote or paraphrase the specific sentence(s) from the passage that contain the supporting detail
     * Explain how the correct answer choice accurately paraphrases this detail
     * Show the direct connection between the passage text and the answer choice
     * Explain how this detail supports the central idea
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (unstated, contradiction, too general)
     * Explain why a student might be tempted by this choice
     * Reference the passage to show why this choice cannot be correct
     * For unstated: Show that this detail is not mentioned anywhere
     * For contradiction: Quote the passage to show the opposite
     * For too general: Explain why it's not specific enough

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Your question stem here",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including passage reference",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong",
    "C": "Rationale for option C explaining why it's wrong",
    "D": "Rationale for option D explaining why it's wrong"
  }
}

QUALITY CHECKLIST:
- Passage has clear central idea (can be anywhere, not just first sentence)
- Passage contains explicit supporting details
- Question asks for a specific detail (not main idea)
- Correct answer is accurate paraphrase of passage detail
- All distractors represent distinct error types
- Rationales are comprehensive and reference specific passage text
- Language matches official SAT tone and style
- Topic is varied and different from typical examples
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 2 (Expanded): Hypothetical Consequence Questions
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a key detail in the passage and understand its logical consequence or significance through a hypothetical scenario.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like business, technology, history, social movements, etc.)
- DO NOT use the same question stem format as other questions (vary the phrasing of hypothetical questions)
- DO NOT use the same type of problem/solution scenario (vary between efficiency, accessibility, quality, safety, effectiveness, etc.)
- Vary topics across different domains: if one question is about nature/animals, make this about business, technology, education, health, etc.
- Ensure the passage topic is completely different (different subject, different context, different field)

ASSESSMENT CRITERIA:
- The question must assess the student's ability to identify a specific detail and understand its logical implications
- The passage must present a clear sequence of events, actions, or cause-and-effect relationships
- The correct answer must be the most logical consequence based on a key detail explicitly stated in the passage
- Distractors must represent common errors: misinterpreting the sequence of events, confusing cause and effect, or misunderstanding what the text actually states

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Topic must be from ANY of these contexts (vary widely):
     * Natural science (processes, experiments, discoveries, adaptations, etc.)
     * Social science (behaviors, studies, social changes, etc.)
     * Humanities (historical events, cultural practices, artistic movements, etc.)
     * Technology (innovations, developments, solutions, etc.)
     * Business (strategies, practices, market changes, etc.)
     * Education (methods, programs, approaches, etc.)
     * Health and medicine (treatments, research, practices, etc.)
   - The passage should describe a person, process, organization, or situation that undergoes a change or development
   - Include a clear sequence: initial state → action/change → result/outcome
   - The passage must explicitly state:
     * A problem, challenge, or situation that existed
     * A specific action, method, change, or decision that was implemented
     * The positive outcome or benefit that resulted from that action
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the cause-and-effect relationship is explicitly stated (not just implied)
   - Vary the types of problems and solutions (e.g., efficiency, accessibility, quality, safety, effectiveness, etc.)

2. Question Generation:
   - Question stem must ask about a hypothetical consequence
   - Use one of these stem formats (vary the phrasing):
     * "Based on the text, what would have been the most likely consequence if [subject] had not [key action from passage]?"
     * "According to the passage, what would most likely have happened if [subject] had not [key action]?"
     * "The text suggests that if [subject] had not [key action], what would have been the result?"
     * "Based on the passage, what would have occurred if [subject] had not [key action]?"
   - The question must reference a specific action, method, change, or decision mentioned in the passage
   - The question tests understanding of the logical relationship between the action and its outcome
   - Vary the phrasing to avoid repetition

3. Answer Choice Generation:
   - Correct Answer: Must be the most logical consequence that would have occurred if the key action had NOT happened. It should directly relate to the problem or challenge that the action solved, as stated in the passage. The consequence should be clearly inferable from the passage's explicit information.
   
   - Distractor 1 (Misinterpreting Sequence): A statement that confuses what happened before vs. after the key action, or misinterprets the timeline of events in the passage. It may describe something that actually happened but attributes it to the wrong time period.
   
   - Distractor 2 (Confusing Cause and Effect): A statement that presents an effect that actually occurred as a consequence, when in fact it was already happening or was the reason FOR the action (reverses the cause-effect relationship). It may describe a real outcome but misunderstands the causal chain.
   
   - Distractor 3 (Unsupported Inference): A plausible-sounding statement that is not supported by the passage text, or that goes beyond what can be reasonably inferred from the information provided. It may seem logical but lacks textual support.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the key action or change mentioned in the passage
     * Quote or paraphrase the specific sentence(s) that describe the problem/challenge that existed
     * Quote or paraphrase the sentence(s) that describe the action taken and its result
     * Explain the logical relationship: "The text states that [action] allowed [subject] to [outcome]. Therefore, if [subject] had not [action], it is reasonable to conclude that [consequence]."
     * Show how the correct answer presents the most logical consequence
     * Explain why this consequence is the most direct and reasonable inference
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (misinterpreting sequence, confusing cause/effect, unsupported inference)
     * Quote or reference the passage to show what the text actually states
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because it uses keywords from the passage, but it misinterprets the sequence of events...")
     * Show how the distractor misreads the passage's logic

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Based on the text, what would have been the most likely consequence if [subject] had not [key action]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including passage references and logical reasoning",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage clearly presents a problem/challenge → action → outcome sequence
- Question asks about the logical consequence if the key action had not occurred
- Correct answer is the most reasonable inference based on the passage's explicit information
- All distractors represent distinct error types (sequence confusion, cause/effect reversal, unsupported inference)
- Rationales are comprehensive, quote the passage, and explain the logical reasoning
- Topic is varied and different from typical examples
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 3 (Expanded): Main Idea in Narrative/Descriptive Passages
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify the main idea or central point of a NARRATIVE or DESCRIPTIVE passage by synthesizing multiple details and understanding the overall message or significance.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like literature, history, personal experiences, nature scenes, etc.)
- DO NOT use the same narrative context as other questions (vary between literary excerpts, personal narratives, historical scenes, nature descriptions, etc.)
- DO NOT use the same type of experience or reaction (vary between discovery, realization, observation, emotional reaction, etc.)
- Vary topics widely: if one question is about animals/nature, make this about human experiences, literature, history, arts, etc.
- Ensure the passage topic and context are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to synthesize information from multiple parts of the passage to identify the main idea
- The passage should present a narrative, descriptive, or literary scenario where the main idea is IMPLIED through details rather than explicitly stated in a single sentence
- The correct answer must accurately capture the central message, theme, or overall significance of the passage
- Distractors must represent common errors: misinterpreting emotional cues, focusing on tangential details, or confusing the sequence of events

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph passage (80-100 words)
   - Topic must be from NARRATIVE or DESCRIPTIVE contexts (NOT informational):
     * Literature (excerpts from novels, short stories, character descriptions, scenes)
     * Narrative nonfiction (memoirs, personal accounts, historical narratives)
     * Descriptive text (nature scenes, settings, observations, experiences)
     * Literary descriptions (character moments, emotional scenes, sensory experiences)
   - The passage should describe a character's experience, reaction, observation, or a specific scene
   - Include multiple descriptive details that collectively convey the main idea:
     * Sensory details (what the character sees, hears, feels, smells, tastes)
     * Emotional reactions or responses
     * Actions or behaviors that reveal the character's state of mind
     * Observations or realizations
   - The main idea should be IMPLIED through these details rather than stated directly
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the details work together to create a coherent central message
   - Vary the types of experiences (discovery, realization, observation, reaction, etc.)

2. Question Generation:
   - Question stem must ask for the main idea or central point
   - Use one of these stem formats:
     * "Which choice best states the main idea of the text?"
     * "Which choice best expresses the central idea of the text?"
     * "Which choice best states the main point of the text?"
   - The question tests the ability to synthesize multiple details to understand the overall message

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize the key details from the passage to state the main idea. It should capture the overall significance, emotional state, or central message that emerges from combining the various details. It should be the "umbrella" idea that encompasses all the details.
   
   - Distractor 1 (Misinterpreting Emotional Cues): A statement that misinterprets a strong emotional reaction or detail. For example, if the passage shows delight through a "scream" or "exclamation," this distractor might interpret it as fear or upset. It may take one detail out of context.
   
   - Distractor 2 (Focusing on Tangential Detail): A statement that focuses on a specific, less central detail from the passage rather than the overall main idea. It may be factually accurate but misses the bigger picture. It picks one detail rather than synthesizing all details.
   
   - Distractor 3 (Confusing Sequence or Context): A statement that misinterprets the sequence of events, the context, or attributes a detail to the wrong part of the passage. It may combine accurate details but in an incorrect way, or misunderstand the relationship between details.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the main idea that emerges from the passage
     * Quote or reference multiple specific details from the passage that support this main idea
     * Explain how these details work together to create the central message
     * Show how the correct answer accurately synthesizes these details into a coherent main idea
     * Address any potential misinterpretations (e.g., "While the passage mentions [detail that might be confusing], the context and other details show that [correct interpretation]")
     * Explain why this is the "umbrella" idea that encompasses all details
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (misinterpreting emotional cues, focusing on tangential detail, confusing sequence/context)
     * Quote or reference the passage to show what the text actually states
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because [detail] might suggest [misinterpretation], but the passage indicates [correct interpretation] through [other details]")
     * Show how the distractor fails to synthesize all the details

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Which choice best states the main idea of the text?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of multiple passage details",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage is NARRATIVE or DESCRIPTIVE (NOT informational/expository)
- Passage contains multiple details that collectively convey the main idea
- Main idea is IMPLIED rather than explicitly stated in a single sentence
- Question asks for the main idea/central point
- Correct answer accurately synthesizes multiple details to state the main idea
- All distractors represent distinct error types (emotional misinterpretation, tangential detail, sequence confusion)
- Rationales are comprehensive, reference multiple passage details, and explain the synthesis
- Topic is varied (different literary/narrative contexts)
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 4 (Expanded): Identifying Explicit Reasons/Purposes
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a specific reason, purpose, or motivation that is explicitly stated in an informational passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like research, business, technology, education, medicine, etc.)
- DO NOT use the same question stem format as other questions (vary between "what is one reason...", "why are...", "in order to...", etc.)
- DO NOT use the same type of reason/purpose (vary between research interests, practical purposes, goals, motivations, etc.)
- Vary topics across different domains: if one question is about nature/animals, make this about science, business, technology, social issues, etc.
- Ensure the passage topic is completely different (different subject, different context, different field)

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify an explicit reason, purpose, or motivation stated in the passage
- The passage must explain why someone is interested in something, why something is done, or what purpose something serves
- The correct answer must be a direct paraphrase of the stated reason or purpose
- Distractors must represent common errors: introducing ideas not mentioned, misinterpreting details, or confusing related but distinct concepts

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Topic must be from ANY of these contexts (vary widely):
     * Natural science (research interests, study purposes, investigation goals, etc.)
     * Social science (research motivations, study objectives, analysis purposes, etc.)
     * Humanities (historical research, cultural studies, artistic purposes, etc.)
     * Technology (development goals, innovation purposes, design objectives, etc.)
     * Business (strategic purposes, market motivations, operational reasons, etc.)
     * Education (pedagogical purposes, learning objectives, teaching motivations, etc.)
     * Health and medicine (treatment purposes, research goals, clinical reasons, etc.)
   - The passage should explain a research interest, purpose, motivation, or reason for doing something
   - The passage must explicitly state one or more reasons/purposes, such as:
     * Why researchers are interested in a topic
     * What purpose a method or approach serves
     * Why something is important or valuable
     * What goal or objective is being pursued
     * Why a decision was made
     * What benefit is sought
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the reason/purpose is explicitly stated (not just implied)
   - Vary the types of reasons (academic, practical, social, economic, scientific, etc.)

2. Question Generation:
   - Question stem must ask for a specific reason or purpose
   - Use one of these stem formats (vary the phrasing):
     * "According to the text, what is one reason [subject] [action/interest]?"
     * "Based on the passage, why are [researchers/people] interested in [topic]?"
     * "The text indicates that [subject] [action] in order to..."
     * "According to the passage, what is the purpose of [action/method]?"
     * "Based on the text, why does [subject] [action]?"
     * "The passage states that [subject] [action] because..."
   - The question must reference a specific reason or purpose that is directly stated in the passage
   - Vary what type of reason is asked about (research interest, practical purpose, goal, motivation, etc.)

3. Answer Choice Generation:
   - Correct Answer: Must be a close, accurate paraphrase of the explicitly stated reason or purpose from the passage. It should maintain the meaning while using different wording. It should directly answer "why" or "what purpose."
   
   - Distractor 1 (Not Mentioned): A plausible statement related to the topic that is NOT mentioned anywhere in the passage. It should sound reasonable but cannot be found in the text. It may be a common reason for similar topics but isn't stated here.
   
   - Distractor 2 (Misinterpreting Detail): A statement that misinterprets or misrepresents a detail from the passage. It may use similar language but changes the meaning or confuses related concepts. It may take a detail and twist it into a different purpose.
   
   - Distractor 3 (Unrelated Purpose): A statement that introduces a different purpose or reason that is not stated in the passage, even though it might seem related to the topic. It may be a plausible purpose but isn't what the passage describes.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific reason or purpose asked about in the question
     * Quote or paraphrase the exact sentence(s) from the passage that state this reason or purpose
     * Explain how the correct answer choice accurately paraphrases this stated reason
     * Show the direct connection between the passage text and the answer choice
     * Explain how this reason/purpose relates to the overall topic
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (not mentioned, misinterpreting detail, unrelated purpose)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because it uses keywords from the passage, but it misinterprets [detail]...")
     * Show how the distractor fails to match the passage's explicit statement

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what is one reason [subject] [action/interest]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to the stated reason",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explicitly states a reason, purpose, or motivation
- Question asks for a specific reason or purpose
- Correct answer is accurate paraphrase of the stated reason
- All distractors represent distinct error types (not mentioned, misinterpretation, unrelated purpose)
- Rationales are comprehensive and reference specific passage text
- Topic is varied and explores different types of reasons/purposes
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 5 (Expanded): Character Analysis Questions (General Traits)
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify explicit details about a character's GENERAL actions, preferences, behaviors, or characteristics as stated in a narrative passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like historical figures, literary characters, artists, scientists, etc.)
- DO NOT use the same character type or context as other questions (vary between different time periods, different settings, different character types)
- DO NOT use the same type of character trait (vary between actions, preferences, behaviors, skills, etc.)
- Vary topics widely: if one question is about animals/nature, make this about people, literature, history, arts, etc.
- Ensure the passage topic and character are completely different

CRITICAL DISTINCTION: This variant focuses on GENERAL character traits, actions, and preferences (NOT emotional reactions - that's Variant 7).

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify explicit details about a character's general traits, actions, or preferences
- The passage should describe a character's actions, preferences, behaviors, or characteristics (NOT emotional reactions)
- The correct answer must be directly supported by explicit details stated in the passage
- Distractors must represent common errors: contradicting the passage, overstating details, or misinterpreting character traits

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: literature, history, arts, personal experiences, cultural contexts, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a musician's first performance" not just "music")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Literature: character moments, literary scenes, author experiences, writing processes
- History: historical figures, cultural events, personal accounts from history
- Arts: artist experiences, creative processes, artistic movements, gallery visits
- Personal: first experiences, discoveries, realizations, observations
- Cultural: festivals, traditions, community events, cultural practices

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or unique perspectives
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph narrative passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from literature or narrative context (vary widely):
     * Literary excerpts (novels, short stories, character descriptions)
     * Historical narratives (biographical accounts, historical figures)
     * Personal narratives (memoirs, experiences, observations)
     * Descriptive character sketches
   - The passage should describe a character and their actions, preferences, or behaviors
   - Include multiple explicit details about the character, such as:
     * What activities the character engages in
     * What the character prefers or avoids
     * How the character interacts with others
     * What the character creates or produces
     * The character's habits or routines
     * The character's skills or abilities
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure character details are explicitly stated (not just implied)
   - The passage may contrast what the character does with what they avoid or prefer not to do
   - Focus on GENERAL traits and behaviors, NOT emotional reactions to specific stimuli

2. Question Generation:
   - Question stem must ask what is true about the character
   - Use one of these stem formats:
     * "According to the text, what is true about [character name]?"
     * "Based on the passage, what is true about [character name]?"
     * "The text indicates that [character name]..."
   - The question must reference a character mentioned in the passage
   - The question tests the ability to identify explicit character details about general traits/behaviors

3. Answer Choice Generation:
   - Correct Answer: Must be directly supported by explicit details stated in the passage. It should accurately describe an action, preference, behavior, or characteristic of the character as presented in the text. It should focus on what the character DOES or IS, not emotional reactions.
   
   - Distractor 1 (Contradicts Passage): A statement that contradicts what the passage says about the character. It may use similar language but presents the opposite of what is stated. It may reverse a preference or action.
   
   - Distractor 2 (Overstates Detail): A statement that takes a detail from the passage and overstates it (e.g., adding "favorite" or "most" when the passage doesn't indicate preference or ranking, or adding "always" when the passage doesn't suggest frequency). It may be partially true but goes beyond what the text states.
   
   - Distractor 3 (Misinterprets Character): A statement that misinterprets or misrepresents the character's actions or preferences. It may combine accurate details but in an incorrect way, or attribute something to the character that isn't supported by the passage. It may confuse what the character does with what others do.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the character detail asked about in the question
     * Quote or paraphrase the exact sentence(s) from the passage that describe this detail
     * Explain how the correct answer choice accurately reflects what the passage states about the character
     * Show the direct connection between the passage text and the answer choice
     * Explain how this detail fits into the character's overall portrayal
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (contradicts passage, overstates detail, misinterprets character)
     * Quote or reference the passage to show what the text actually states about the character
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [detail], but it doesn't state that [overstatement]...")
     * Show how the distractor misreads the character

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what is true about [character name]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to character details",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explicitly describes character actions, preferences, or characteristics (NOT emotional reactions)
- Question asks what is true about the character
- Correct answer is directly supported by explicit passage details about general traits/behaviors
- All distractors represent distinct error types (contradiction, overstatement, misinterpretation)
- Rationales are comprehensive and reference specific passage text about the character
- Topic is varied (different narrative contexts and character types)
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 6 (Expanded): Identifying Specific Actions/Behaviors at Moments
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a specific action, thought, or behavior that a character performs at a PARTICULAR MOMENT or during a SPECIFIC ACTIVITY, as explicitly stated or clearly inferable from a narrative passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like performances, journeys, decisions, observations, etc.)
- DO NOT use the same moment/context type as other questions (vary between performances, journeys, waiting, decisions, observations, etc.)
- DO NOT use the same question stem format as other questions (vary between "as [she/he]...", "while...", "when...", etc.)
- Vary topics widely: if one question is about animals/nature, make this about human experiences, literature, history, etc.
- Ensure the passage topic and moment are completely different

CRITICAL DISTINCTION: This variant asks "what does [character] do AS/WHILE/WHEN [specific context]?" - focusing on actions at SPECIFIC MOMENTS, not general character traits.

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify a specific action or behavior at a specific moment
- The passage should describe a character performing actions or having thoughts at a particular time or during a particular activity
- The correct answer must be directly supported by explicit details stated in the passage
- Distractors must represent common errors: actions not mentioned, contradicting the text, or focusing on the wrong moment

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph narrative passage (80-100 words)
   - Topic must be from literature or narrative context (vary widely):
     * Literary excerpts (scenes, moments, specific situations)
     * Personal narratives (specific experiences, moments in time)
     * Historical narratives (specific events, moments)
     * Descriptive scenes (specific situations, activities)
   - The passage should describe a character at a SPECIFIC MOMENT or during a SPECIFIC ACTIVITY (e.g., walking on stage, during a journey, while waiting, during a performance, etc.)
   - Include explicit details about what the character does, thinks, or feels at that moment, such as:
     * Following advice or instructions
     * Performing a specific action
     * Having a particular thought or memory
     * Making a specific decision or choice
     * Reacting in a specific way
   - Use first-person or third-person narrative perspective
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the action/behavior is explicitly stated or clearly inferable from the text
   - Vary the types of moments (performances, journeys, decisions, observations, etc.)

2. Question Generation:
   - Question stem must ask what the character does at a SPECIFIC MOMENT
   - Use one of these stem formats (vary the phrasing):
     * "According to the text, what does [character] do as [she/he] [specific action/context]?"
     * "According to the text, what does [character] do while [specific context]?"
     * "Based on the passage, what does [character] do when [specific situation]?"
     * "The text indicates that as [character] [action], [she/he]..."
   - The question must reference a specific moment, action, or context mentioned in the passage
   - The question tests the ability to identify explicit actions or behaviors at that specific moment
   - Vary the question phrasing

3. Answer Choice Generation:
   - Correct Answer: Must be directly supported by explicit details stated in the passage. It should accurately describe what the character does, thinks, or remembers at the specific moment referenced in the question. It should be specific to that moment.
   
   - Distractor 1 (Not Mentioned): A statement that describes an action or thought that is not mentioned in the passage. It may be plausible but cannot be found in the text. It may be something a character might do but isn't stated.
   
   - Distractor 2 (Contradicts Text): A statement that contradicts what the passage says about the character's actions or thoughts. It may use similar language but presents information that conflicts with the text. It may describe the opposite of what happens.
   
   - Distractor 3 (Wrong Moment/Context): A statement that describes something the character does, but at a different time or in a different context than what the question asks about. It may be accurate but doesn't answer the specific question asked. It may describe a general behavior rather than the specific moment.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific moment or context referenced in the question
     * Quote or paraphrase the exact sentence(s) from the passage that describe what the character does at that moment
     * Explain how the correct answer choice accurately reflects what the passage states
     * Show the direct connection between the passage text and the answer choice
     * If the answer involves following advice or remembering something, explain how the text supports this
     * Explain why this action is specific to that moment
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (not mentioned, contradicts text, wrong moment/context)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because [reason], but the text [doesn't mention/contradicts this]...")
     * For wrong moment: Explain that this describes a different time or context

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what does [character] do as [she/he] [specific action/context]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to the specific action",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explicitly describes character actions/thoughts at a SPECIFIC MOMENT
- Question asks what the character does at a specific moment or during a specific activity
- Correct answer is directly supported by explicit passage details about that specific moment
- All distractors represent distinct error types (not mentioned, contradiction, wrong moment)
- Rationales are comprehensive and reference specific passage text
- Topic is varied (different moments and contexts)
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 7 (Expanded): Identifying Emotional Reactions/Responses
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a character's EMOTIONAL REACTION or RESPONSE to a specific stimulus by synthesizing multiple emotional cues explicitly stated in a narrative passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like artwork, music, discoveries, nature scenes, etc.)
- DO NOT use the same type of stimulus as other questions (vary between seeing artwork, hearing music, experiencing nature, making discoveries, etc.)
- DO NOT use the same emotional reaction type as other questions (vary between positive, negative, mixed emotions, different specific emotions)
- Vary topics widely: if one question is about animals/nature, make this about human reactions, art, music, literature, etc.
- Ensure the passage topic, stimulus, and emotional reaction are completely different

CRITICAL DISTINCTION: This variant focuses specifically on EMOTIONAL REACTIONS (delight, fear, wonder, etc.) - NOT general character traits (that's Variant 5).

ASSESSMENT CRITERIA:
- The question must assess the student's ability to synthesize multiple emotional details to identify the character's overall emotional state or reaction
- The passage should describe a character's emotional response to seeing, experiencing, or encountering something specific
- The correct answer must accurately capture the character's emotional reaction by combining multiple emotional cues from the passage
- Distractors must represent common errors: focusing on unrelated details, misinterpreting emotional cues, or introducing emotions not mentioned

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph narrative passage (80-100 words)
   - Topic must be from literature or narrative context (vary widely):
     * Literary excerpts (character reactions, emotional moments, discoveries)
     * Personal narratives (emotional experiences, reactions to events)
     * Descriptive emotional scenes (responses to stimuli, realizations)
   - The passage should describe a character's reaction to a SPECIFIC STIMULUS (e.g., seeing something, hearing something, experiencing something, encountering something)
   - Include multiple explicit emotional cues that collectively convey the character's emotional state, such as:
     * Physical reactions (flushed cheeks, widened eyes, smile, trembling, etc.)
     * Emotional descriptors (pleasure, joy, wonder, delight, amazement, etc.)
     * Behavioral responses (standing motionless, drawing back, leaning forward, etc.)
     * Internal thoughts or realizations about the emotional state
   - The emotional reaction should be conveyed through multiple details working together, not just a single word
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure emotional cues are explicitly stated (not just implied)
   - Vary the types of stimuli (artwork, nature, music, discoveries, etc.) and emotional reactions (positive, negative, mixed, etc.)

2. Question Generation:
   - Question stem must ask what is true about the character's reaction or emotional state
   - Use one of these stem formats:
     * "According to the text, what is true about [character name]?"
     * "Based on the passage, what is true about [character name]?"
   - The question must reference a character mentioned in the passage
   - The question tests the ability to synthesize multiple emotional cues to identify the overall reaction
   - The focus is on the EMOTIONAL response, not general character traits

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize multiple emotional cues from the passage to describe the character's overall emotional reaction. It should capture the combined effect of the various emotional details (e.g., "delighted," "pleased," "amazed," "fascinated"). It should describe the EMOTIONAL STATE, not just actions.
   
   - Distractor 1 (Focuses on Unrelated Detail): A statement that focuses on a detail from the passage that is not related to the character's emotional reaction (e.g., what the character wants to know, what the character prefers, what the character does next, etc.). It may be factually accurate but doesn't address the emotional response.
   
   - Distractor 2 (Overstates or Misinterprets): A statement that overstates a detail or misinterprets the emotional cues. It may take one emotional detail and make it seem more significant than it is, or misinterpret the overall emotional state (e.g., interpreting a positive reaction as negative, or vice versa).
   
   - Distractor 3 (Not Mentioned): A statement that introduces an emotion, preference, or concern that is not mentioned in the passage. It may be plausible but cannot be found in the text. It may describe a different emotional state.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific stimulus or situation that triggers the character's reaction
     * Quote or paraphrase multiple specific emotional cues from the passage (physical reactions, emotional descriptors, behavioral responses)
     * Explain how these cues work together to convey the overall emotional reaction
     * Show how the correct answer choice accurately synthesizes these multiple cues into a coherent description of the character's emotional state
     * Address how the character's reaction is so strong or focused that it affects their awareness of other things (if applicable)
     * Explain why this is the emotional reaction, not just an action
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (focuses on unrelated detail, overstates/misinterprets, not mentioned)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [detail], but this detail is not about the character's emotional reaction...")
     * Show how the distractor fails to capture the emotional state

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what is true about [character name]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of multiple emotional cues from the passage",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage describes character's EMOTIONAL REACTION to a specific stimulus
- Passage includes multiple explicit emotional cues (physical, behavioral, descriptive)
- Question asks what is true about the character (focusing on emotional reaction)
- Correct answer synthesizes multiple emotional cues to describe the overall reaction
- All distractors represent distinct error types (unrelated detail, overstatement/misinterpretation, not mentioned)
- Rationales are comprehensive and reference multiple emotional cues from the passage
- Topic is varied (different stimuli and emotional reactions)
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 8 (Expanded): Understanding Why Something Wouldn't Work
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify an explicit reason or cause-and-effect relationship explaining why something would be unable to function or work in a specific context, as stated in an informational passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like space exploration, engineering, biology, technology, environmental science, etc.)
- DO NOT use the same type of incompatibility as other questions (vary between atmospheric, gravitational, temperature, size, material properties, etc.)
- DO NOT use the same question stem format as other questions (vary the phrasing)
- Vary topics widely: if one question is about animals/nature, make this about space, technology, engineering, etc.
- Ensure the passage topic and technical challenge are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to identify a direct cause-and-effect relationship or explicit reason
- The passage should explain why something designed for one context wouldn't work in another context
- The correct answer must be directly supported by explicit details stated in the passage
- Distractors must represent common errors: misinterpreting details, introducing factors not mentioned, or confusing related concepts

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Topic must be from technical or scientific contexts (vary widely):
     * Space science (Mars, Moon, other planets, space conditions)
     * Engineering (different environments, conditions, applications)
     * Biology (different habitats, conditions, ecosystems)
     * Technology (different systems, platforms, environments)
     * Environmental science (different climates, conditions, locations)
     * Materials science (different properties, conditions, uses)
     * Physics (different forces, conditions, environments)
   - The passage should explain:
     * A specific condition or characteristic of one environment (e.g., Earth, one type of system, one condition)
     * A different condition or characteristic of another environment (e.g., Mars, another type of system, another condition)
     * Why something designed for the first environment wouldn't work in the second environment
     * How the problem is solved or addressed for the second environment
   - Include explicit details about the key difference that causes the problem
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the cause-and-effect relationship is explicitly stated
   - Vary the types of incompatibilities (density, pressure, temperature, gravity, size, material, etc.)

2. Question Generation:
   - Question stem must ask why something wouldn't work
   - Use one of these stem formats (vary the phrasing):
     * "According to the text, why would [something designed for context A] be unable to [function] in [context B]?"
     * "Based on the passage, why would [something] not work in [context]?"
     * "The text indicates that [something] would be unable to [function] in [context] because..."
   - The question must reference the specific problem or limitation mentioned in the passage
   - The question tests the ability to identify the explicit reason for the limitation
   - Vary the question phrasing

3. Answer Choice Generation:
   - Correct Answer: Must directly state the explicit reason given in the passage for why something wouldn't work. It should accurately describe the key difference or condition that causes the problem (e.g., "Because [context A] and [context B] have different [specific condition]"). It should match the passage's explicit explanation.
   
   - Distractor 1 (Misinterprets Detail): A statement that misinterprets a detail from the passage. For example, if the passage mentions that a solution has longer blades, this distractor might incorrectly state that Earth designs have blades that are too large. It may reverse or confuse the details.
   
   - Distractor 2 (Not Mentioned): A statement that introduces a factor or concept that is not mentioned in the passage (e.g., gravity, temperature, size, material) when the passage focuses on a different factor. It may be a plausible reason but isn't what the passage discusses.
   
   - Distractor 3 (Confuses Related Concepts): A statement that confuses related but distinct concepts mentioned in the passage. It may combine accurate details but in an incorrect way, or mix up cause and effect.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific problem or limitation asked about in the question
     * Quote or paraphrase the exact sentence(s) from the passage that explain the key difference or condition
     * Explain how this difference causes the problem (the cause-and-effect relationship)
     * Show how the correct answer choice accurately states this explicit reason
     * Connect the reason to the inability to function
     * Explain the technical relationship clearly
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (misinterprets detail, not mentioned, confuses concepts)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [detail], but it actually states [correct interpretation]...")
     * Show how the distractor misreads the technical explanation

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, why would [something designed for context A] be unable to [function] in [context B]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to the cause-and-effect relationship",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explains why something designed for one context wouldn't work in another
- Passage explicitly states the key difference or condition causing the problem
- Question asks why something would be unable to function
- Correct answer directly states the explicit reason from the passage
- All distractors represent distinct error types (misinterpretation, not mentioned, confused concepts)
- Rationales are comprehensive and reference specific passage text explaining the cause-and-effect
- Topic is varied (different technical contexts and incompatibilities)
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 9 (Expanded): Identifying Explicitly Stated Activities
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify an explicitly stated activity or action that characters engage in during a specific context or situation, as directly stated in a narrative passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like traveling, waiting, working, playing, studying, etc.)
- DO NOT use the same context/situation as other questions (vary between traveling, waiting, working, playing, studying, etc.)
- DO NOT use the same type of activity as other questions (vary between games, observations, interactions, tasks, conversations, etc.)
- DO NOT use the same question stem format as other questions (vary the phrasing)
- Vary topics widely: if one question is about animals/nature, make this about human activities, social situations, etc.
- Ensure the passage topic, context, and activity are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify an explicitly stated activity or action
- The passage should describe what characters do during a specific activity, journey, or situation
- The correct answer must be directly stated in the passage (not inferred)
- Distractors must represent common activities that are plausible but not mentioned in the text

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: literature, history, arts, personal experiences, cultural contexts, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a musician's first performance" not just "music")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Literature: character moments, literary scenes, author experiences, writing processes
- History: historical moments, cultural events, personal accounts from history
- Arts: artist experiences, creative processes, artistic movements, gallery visits
- Personal: first experiences, discoveries, realizations, observations
- Cultural: festivals, traditions, community events, cultural practices

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or unique perspectives
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph narrative passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from literature, memoir, or narrative context (vary widely):
     * Travel narratives (car trips, train journeys, walks, etc.)
     * Waiting scenarios (waiting rooms, lines, anticipation, etc.)
     * Work or study situations (classrooms, offices, workshops, etc.)
     * Social situations (gatherings, events, meetings, etc.)
     * Daily activities (meals, routines, chores, etc.)
     * Recreational activities (games, sports, hobbies, etc.)
   - The passage should describe characters during a specific activity, journey, or situation
   - Include explicit statements about what the characters do during this context, such as:
     * Playing games or engaging in activities
     * Observing or looking for specific things
     * Interacting with each other or their environment
     * Performing specific tasks
     * Engaging in conversations or discussions
   - The activity should be clearly and directly stated (e.g., "Mario and I played games...", "We looked for...", "They discussed...")
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the activity is explicitly stated, not just implied
   - Vary the types of activities and contexts

2. Question Generation:
   - Question stem must ask what characters did during a specific context
   - Use one of these stem formats (vary the phrasing):
     * "According to the text, what did [characters] do while [specific context]?"
     * "Based on the passage, what did [characters] do during [specific activity]?"
     * "The text indicates that [characters] [action] while [context]."
     * "According to the passage, what activity did [characters] engage in while [context]?"
   - The question must reference a specific context, activity, or situation mentioned in the passage
   - The question tests the ability to identify explicitly stated activities
   - Vary the question phrasing

3. Answer Choice Generation:
   - Correct Answer: Must be the exact activity or action explicitly stated in the passage. It should be a direct match or close paraphrase of what the text says the characters did. It should be the specific activity mentioned.
   
   - Distractor 1 (Common Activity Not Mentioned): A statement that describes a common, plausible activity that people might do in that context, but that is not mentioned in the passage (e.g., reading, singing, sleeping, talking, eating). It should be contextually appropriate but clearly absent.
   
   - Distractor 2 (Different Common Activity Not Mentioned): Another common, plausible activity for that context that is not mentioned in the passage. It should be different from Distractor 1.
   
   - Distractor 3 (Another Common Activity Not Mentioned): A third common, plausible activity for that context that is not mentioned in the passage. It should be different from Distractors 1 and 2.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific context or situation referenced in the question
     * Quote the exact sentence(s) from the passage that state what the characters did
     * Explain how the correct answer choice directly matches what the passage states
     * Show the direct connection between the passage text and the answer choice
     * Emphasize that this is explicitly stated, not inferred
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify that the activity is not mentioned in the passage
     * Quote or reference the passage to show what the text actually states
     * Explain that while this activity might be plausible for the context, it is not what the passage describes
     * Show that the passage does not mention this activity

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, what did [characters] do while [specific context]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct quote from the passage",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong (not mentioned in passage)",
    "C": "Rationale for option C explaining why it's wrong (not mentioned in passage)",
    "D": "Rationale for option D explaining why it's wrong (not mentioned in passage)"
  }
}

QUALITY CHECKLIST:
- Passage explicitly states what characters do during a specific context
- Question asks what characters did during a specific context or activity
- Correct answer is the exact activity explicitly stated in the passage
- All distractors are common, plausible activities not mentioned in the passage
- Rationales are comprehensive and quote the exact passage text
- Topic is varied (different contexts and activities)
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 10 (Expanded): Main Idea in Informational Passages (Benefits/Impacts)
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify the main idea of an INFORMATIONAL/EXPOSITORY passage by synthesizing multiple explicit points about benefits, opportunities, changes, or impacts of SOMETHING (technology, movement, development, etc.) - NOT about a person's achievements.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like technology, social movements, historical developments, innovations, etc.)
- DO NOT use the same type of thing being described as other questions (vary between technologies, movements, developments, innovations, etc.)
- DO NOT use the same type of benefits/impacts as other questions (vary between economic, social, cultural, technological, etc.)
- Vary topics widely: if one question is about animals/nature, make this about technology, history, social issues, etc.
- Ensure the passage topic and subject matter are completely different

CRITICAL DISTINCTION: This variant is for INFORMATIONAL passages about BENEFITS/OPPORTUNITIES/IMPACTS of THINGS (NOT a person's achievements - that's Variant 12).

ASSESSMENT CRITERIA:
- The question must assess the student's ability to synthesize multiple explicit points to identify the main idea
- The passage should be informational/expository, describing benefits, opportunities, changes, or impacts of SOMETHING (not a person)
- The correct answer must accurately synthesize all the key points into a coherent main idea
- Distractors must represent common errors: focusing on one narrow detail, making unsupported claims, or exaggerating what the text states

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Topic must be from informational/expository contexts (vary widely):
     * Technology (innovations, developments, tools, platforms, etc.)
     * Social movements (reforms, changes, movements, etc.)
     * Historical developments (changes, shifts, evolutions, etc.)
     * Scientific discoveries (applications, impacts, benefits, etc.)
     * Economic changes (market shifts, new systems, etc.)
     * Cultural developments (trends, changes, influences, etc.)
   - The passage should describe multiple related benefits, opportunities, changes, or impacts of SOMETHING (e.g., a technology, social movement, historical development, innovation, etc.)
   - Include multiple explicit points that collectively support the main idea, such as:
     * Different types of benefits or opportunities provided
     * Various ways something changed people's lives or behaviors
     * Multiple impacts or consequences
     * Different aspects of improvement or change
   - The main idea should emerge from synthesizing these multiple points
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure the points work together to create a coherent central theme
   - Focus on WHAT something provided/changed, NOT who achieved it

2. Question Generation:
   - Question stem must ask for the main idea
   - Use one of these stem formats:
     * "Which choice best states the main idea of the text?"
     * "Which choice best expresses the main idea of the text?"
   - The question tests the ability to synthesize multiple explicit points to identify the overall main idea

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize all the key points from the passage to state the main idea. It should encompass the central theme that connects all the benefits, opportunities, or changes mentioned (e.g., "The widespread adoption of X provided new opportunities for people"). It should focus on what the thing DID, not who did it.
   
   - Distractor 1 (Too Narrow - Focuses on One Detail): A statement that focuses on only one specific detail or benefit mentioned in the passage, rather than the overall main idea. It may be factually accurate but misses the bigger picture. It picks one benefit rather than synthesizing all.
   
   - Distractor 2 (Unsupported Claim or Exaggeration): A statement that makes a claim not supported by the passage or exaggerates what the text states (e.g., adding "the preferred" or "the first" when the passage doesn't make such claims, or claiming something is "the best" when the passage doesn't compare). It goes beyond what the passage states.
   
   - Distractor 3 (Not Mentioned): A statement that introduces a concept, detail, or claim that is not mentioned anywhere in the passage (e.g., mentioning safety when the passage doesn't discuss it, or mentioning a benefit that isn't stated). It cannot be found in the text.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the main idea that synthesizes all the key points
     * List the multiple points from the passage that support this main idea (e.g., "The text mentions X, Y, and Z opportunities")
     * Explain how these points work together to create the central theme
     * Show how the correct answer choice accurately encompasses all these points into a coherent main idea
     * Explain why this answer is more comprehensive than the distractors
     * Emphasize that this is about what the thing provided/changed, not about a person
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (too narrow, unsupported claim/exaggeration, not mentioned)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [detail], but this is only one of the opportunities mentioned, not the main idea...")
     * Show how the distractor fails to synthesize all points

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Which choice best states the main idea of the text?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of all key points from the passage",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage is INFORMATIONAL/EXPOSITORY describing multiple benefits, opportunities, or changes of SOMETHING (NOT a person)
- Passage includes multiple explicit points that support the main idea
- Question asks for the main idea
- Correct answer synthesizes all key points into a coherent main idea about what something provided/changed
- All distractors represent distinct error types (too narrow, unsupported/exaggerated, not mentioned)
- Rationales are comprehensive and reference multiple points from the passage
- Topic is varied (different technologies, movements, developments, etc.)
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 11 (Expanded): Identifying Specific Items/Creations with Attributes
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify a specific item, creation, or work with specific attributes (location, time, subject, type) as explicitly stated in an informational passage.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like artworks, buildings, inventions, performances, discoveries, etc.)
- DO NOT use the same type of item as other questions (vary between paintings, sculptures, buildings, plays, books, inventions, etc.)
- DO NOT use the same combination of attributes as other questions (vary which attributes are emphasized)
- DO NOT use the same question stem format as other questions (vary the phrasing)
- Vary topics widely: if one question is about animals/nature, make this about arts, culture, history, etc.
- Ensure the passage topic and item type are completely different

ASSESSMENT CRITERIA:
- The question must assess the student's ability to locate and identify a specific item/creation with multiple matching attributes
- The passage should describe a specific work, creation, or item with explicit details about its attributes
- The correct answer must match all the specified attributes mentioned in the passage
- Distractors must represent common errors: wrong type/category, wrong subject, wrong location/time, or misrepresenting relationships

TOPIC SELECTION (CRITICAL - Do this FIRST):
Before writing the passage, you MUST explicitly select a topic that is:
- From a diverse domain (rotate between: arts, culture, history, technology, architecture, etc.)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "a specific architectural landmark" not just "architecture")
- Appropriate for easy difficulty (accessible vocabulary, clear concepts)

Examples of GOOD topic choices:
- Arts: specific artworks, sculptures, paintings, installations, performances
- Architecture: buildings, structures, monuments, bridges, landmarks
- History: historical artifacts, documents, inventions, discoveries
- Technology: specific inventions, devices, innovations, platforms
- Culture: cultural artifacts, traditions, festivals, practices

Examples of TOPICS TO AVOID (too common/overused):
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Topic must be from arts, culture, history, or informational context (vary widely):
     * Visual arts (paintings, sculptures, installations, etc.)
     * Architecture (buildings, structures, monuments, etc.)
     * Performing arts (plays, concerts, performances, etc.)
     * Literature (books, poems, publications, etc.)
     * Inventions (devices, tools, technologies, etc.)
     * Historical artifacts (objects, documents, etc.)
     * Scientific works (experiments, studies, discoveries, etc.)
   - The passage should describe a specific work, creation, or item (e.g., artwork, building, invention, performance, publication)
   - Include explicit details about the item's attributes, such as:
     * Type or category (e.g., sculpture, painting, building, car, play, book, etc.)
     * Subject or what it depicts/represents
     * Location where it was displayed, created, or located
     * Time period, year, or date
     * Creator or associated person
     * Size, dimensions, or scale
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure all attributes are explicitly stated
   - Vary which attributes are emphasized (sometimes location+time, sometimes type+subject, etc.)

2. Question Generation:
   - Question stem must ask for a specific item/creation with specific attributes
   - Use one of these stem formats (vary the phrasing):
     * "According to the text, which [type of item] was [location/action] in [location] in [time]?"
     * "Based on the passage, which piece of [creator's] [category] was [action] at [location] in [time]?"
     * "The text indicates that [creator] created a [type] of [subject] that was [action] at [location] in [time]."
     * "According to the passage, which [type] was displayed at [location] in [time]?"
   - The question must reference multiple attributes (e.g., location AND time, or type AND subject)
   - The question tests the ability to match all specified attributes
   - Vary which attributes are asked about

3. Answer Choice Generation:
   - Correct Answer: Must accurately describe the specific item/creation with all the correct attributes (type, subject, location, time) as stated in the passage. All attributes must match.
   
   - Distractor 1 (Wrong Type/Category): A statement that uses keywords from the passage but describes the wrong type or category (e.g., "painting" when the passage says "sculpture," or "building" when the passage says "monument," or "play" when the passage says "novel"). It may have correct other attributes but wrong type.
   
   - Distractor 2 (Wrong Subject): A statement that uses the correct type/category but describes the wrong subject (e.g., "sculpture of [person]" when the passage says "sculpture of [object]," or "painting of [scene]" when the passage says "painting of [different scene]"). It may have correct type but wrong subject.
   
   - Distractor 3 (Misrepresents Relationship): A statement that uses keywords from the passage but misrepresents the relationship (e.g., "sculpture of [person]" when the person is associated with the subject but not the subject itself, or mentions a location that's related but not where the item was displayed, or confuses the time period). It may mix attributes incorrectly.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the specific attributes asked about in the question (type, subject, location, time)
     * Quote the exact sentence(s) from the passage that describe the item with these attributes
     * Explain how the correct answer choice accurately matches all the specified attributes
     * Show the direct connection between the passage text and the answer choice
     * Verify each attribute matches
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (wrong type/category, wrong subject, misrepresents relationship)
     * Quote or reference the passage to show what the text actually states
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage mentions [keyword], but it actually states [correct information]...")
     * Show which attribute(s) don't match

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "According to the text, which [type of item] was [location/action] in [location] in [time]?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including direct passage reference to all matching attributes",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong and what error it represents",
    "C": "Rationale for option C explaining why it's wrong and what error it represents",
    "D": "Rationale for option D explaining why it's wrong and what error it represents"
  }
}

QUALITY CHECKLIST:
- Passage explicitly describes a specific item/creation with multiple attributes (type, subject, location, time)
- Question asks for a specific item with specific attributes
- Correct answer matches all specified attributes from the passage
- All distractors represent distinct error types (wrong type, wrong subject, misrepresents relationship)
- Rationales are comprehensive and reference specific passage text with all attributes
- Topic is varied (different types of items and attribute combinations)
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Easy Difficulty - Variant 12 (Expanded): Main Idea About Person's Achievements/Accomplishments
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'easy',
    version: '2.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at an easy difficulty level. The question must test a student's ability to identify the main idea of an informational passage about a PERSON'S achievements or accomplishments in a role or position, where the main idea synthesizes multiple accomplishments.

CRITICAL ANTI-REPETITION REQUIREMENT: 
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about Arctic foxes, use a completely different topic like historical figures, scientists, artists, educators, business leaders, etc.)
- DO NOT use the same type of person or role as other questions (vary between leaders, scientists, artists, educators, activists, etc.)
- DO NOT use the same type of accomplishments as other questions (vary between creating jobs, introducing programs, making things accessible, etc.)
- Vary topics widely: if one question is about animals/nature, make this about people, history, science, arts, etc.
- Ensure the passage topic, person, and accomplishments are completely different

CRITICAL DISTINCTION: This variant is specifically about a PERSON'S achievements/accomplishments (NOT about benefits of things - that's Variant 10). All distractors are FACTUALLY TRUE but are supporting details/background info, not the main idea.

ASSESSMENT CRITERIA:
- The question must assess the student's ability to synthesize multiple accomplishments to identify the main idea
- The passage should describe a person's role and their multiple achievements or accomplishments
- The correct answer must accurately synthesize all the key accomplishments into a coherent main idea
- Distractors must be factually true statements from the passage, but they represent supporting details or background information, not the main idea

CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Topic must be from history, biography, social science, or informational context (vary widely):
     * Historical figures (leaders, reformers, innovators, etc.)
     * Scientists and researchers (discoveries, contributions, etc.)
     * Artists and creators (works, innovations, contributions, etc.)
     * Educators and reformers (programs, changes, impacts, etc.)
     * Business leaders (innovations, changes, impacts, etc.)
     * Social activists (reforms, changes, impacts, etc.)
     * Government officials (programs, policies, changes, etc.)
   - The passage should describe a person who held a role or position and their multiple achievements or accomplishments
   - Include explicit details about:
     * The person's role, position, or appointment
     * Multiple accomplishments or achievements (e.g., created jobs, introduced new programs, made something accessible, improved conditions, etc.)
     * Background context (e.g., historical period, program they were part of, who appointed them, the situation they faced)
     * Specific details about their work (e.g., numbers, types of people affected, scope of impact)
   - The main idea should synthesize the person's overall achievements/accomplishments
   - Use clear, accessible vocabulary appropriate for easy difficulty
   - Ensure accomplishments are explicitly stated
   - Vary the types of roles and accomplishments

2. Question Generation:
   - Question stem must ask for the main idea
   - Use one of these stem formats:
     * "Which choice best states the main idea of the text?"
     * "Which choice best expresses the main idea of the text?"
   - The question tests the ability to distinguish the main idea (synthesizing accomplishments) from supporting details or background information

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize all the key accomplishments from the passage to state the main idea. It should encompass the person's overall achievements/accomplishments in their role (e.g., "As [role], [person] succeeded in [accomplishment 1] and [accomplishment 2]"). It should be about what the PERSON achieved, not just background info.
   
   - Distractor 1 (True Supporting Detail): A statement that is factually accurate and mentioned in the passage, but focuses on only one specific detail or aspect of the person's work, rather than the overall main idea. It may describe what the person did but misses the bigger picture of their accomplishments. It's true but too narrow.
   
   - Distractor 2 (True Background Information): A statement that is factually accurate and mentioned in the passage, but describes background information, context, or the situation that existed before or around the person's work, rather than the person's achievements themselves. It may describe the program they were part of, who appointed them, or the historical context, but not what they accomplished.
   
   - Distractor 3 (True Contextual Fact): A statement that is factually accurate and mentioned in the passage, but describes a general fact or context about the time period, program, or situation, rather than the person's specific accomplishments. It may be true but doesn't focus on the person's achievements.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the person and their role
     * List the multiple accomplishments from the passage that support this main idea
     * Explain how these accomplishments work together to create the central theme
     * Show how the correct answer choice accurately synthesizes all these accomplishments into a coherent main idea
     * Explain why this answer is more comprehensive than the distractors
     * Emphasize that this is about the PERSON'S achievements, not background info
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Acknowledge that the statement is factually true and mentioned in the passage
     * Identify that it is supporting detail, background information, or contextual fact, not the main idea
     * Quote or reference the passage to show what the text states
     * Explain why a student might be tempted by this choice (e.g., "This choice is tempting because the passage does state [fact], but this is supporting information/background context, not the text's main idea. The focus of the text is [person's] accomplishments...")
     * Show how it fails to synthesize the accomplishments

OUTPUT FORMAT:
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words)",
  "question": "Which choice best states the main idea of the text?",
  "options": {
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of all accomplishments from the passage",
    "A": "Rationale for option A",
    "B": "Rationale for option B explaining why it's wrong (true but supporting detail/background info, not main idea)",
    "C": "Rationale for option C explaining why it's wrong (true but supporting detail/background info, not main idea)",
    "D": "Rationale for option D explaining why it's wrong (true but supporting detail/background info, not main idea)"
  }
}

QUALITY CHECKLIST:
- Passage describes a PERSON'S role and multiple accomplishments/achievements
- Passage includes background context and supporting details
- Question asks for the main idea
- Correct answer synthesizes all accomplishments into a coherent main idea about the person's achievements
- All distractors are factually true but represent supporting details, background info, or contextual facts
- Rationales acknowledge that distractors are true but explain why they're not the main idea
- Topic is varied (different types of people, roles, and accomplishments)
- Language matches official SAT tone and style
- No grammatical errors or ambiguities`
  },
  
  // Medium Difficulty - Variant 1: Main Idea Synthesis (Concept/Design with Potential Benefits)
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'medium',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at a medium difficulty level. The question must test a student's ability to identify the main idea of an informational passage that describes a concept, design, approach, or method and its potential benefits or effects, where the main idea synthesizes both the unconventional/impractical nature AND the potential positive outcomes.

═══════════════════════════════════════════════════════════════
CRITICAL ANTI-REPETITION REQUIREMENT:
═══════════════════════════════════════════════════════════════
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about architecture/art, use a completely different topic like technology, medicine, business, social science, natural science, etc.)
- DO NOT use topics from the humanities/arts domain if the example question was about art/architecture (rotate to technology, medicine, business, social science, natural science, etc.)
- DO NOT use the same question stem format as other questions (vary between "Which choice best states the main idea...", "Which choice best expresses the main idea...", etc.)
- DO NOT use the same type of concept/design being described (vary between architectural designs, technological approaches, educational methods, medical treatments, business strategies, etc.)
- Vary topics across completely different domains: if one question is about art/architecture, make this about technology, medicine, business, social movements, natural science, etc.
- Ensure the passage topic is completely different (different subject, different context, different field of study)

═══════════════════════════════════════════════════════════════
TOPIC TRACKING (MANDATORY):
═══════════════════════════════════════════════════════════════
Before generating ANY question, you MUST:
- Maintain a mental list of ALL topics used in previous questions in this quiz session
- Check your selected topic against this list
- If your topic (or a very similar topic) appears on the list, you MUST select a different one
- Add your newly selected topic to the list after generation
- Topics are considered "similar" if they: (1) are from the same domain, (2) discuss the same subject matter, (3) use the same examples or contexts

═══════════════════════════════════════════════════════════════
TOPIC SELECTION (CRITICAL - Do this FIRST):
═══════════════════════════════════════════════════════════════
Before writing the passage, you MUST explicitly select a topic that is:
- From a completely different domain than the example question (the example was art/architecture/humanities, so you MUST choose from: technology, medicine, business, social science, natural science, economics, education, etc.)
- NOT art history, architecture, conceptual art, or any visual arts topics (unless explicitly rotating back after using other domains)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "impact of social media on news consumption" not just "social media")
- Appropriate for medium difficulty (some nuance required, accessible but not overly simple vocabulary)

Examples of GOOD topic choices (from different domains than art/architecture):
- Technology: social media's impact on communication, AI's effect on job markets, smartphone addiction and productivity, streaming services and traditional media, virtual reality applications
- Medicine: vaccine effectiveness debates, telemedicine adoption, alternative medicine popularity, medical technology innovations, personalized medicine approaches
- Business: e-commerce impact on retail, remote work trends, cryptocurrency adoption, sustainable business practices, gig economy effects
- Social Science: urban planning and community development, educational reform effectiveness, social media and mental health, migration patterns, community policing
- Natural Science: climate change attribution, renewable energy adoption, space exploration benefits, conservation efforts, genetic engineering applications
- Economics: minimum wage impact debates, automation and employment, trade policy effects, economic inequality trends, universal basic income
- Education: flipped classroom models, online learning effectiveness, project-based learning, standardized testing alternatives

Examples of TOPICS TO AVOID:
- Art history, architecture, conceptual art, visual arts (same domain as example - unless rotating back after using other domains)
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

═══════════════════════════════════════════════════════════════
DOMAIN ROTATION SYSTEM (MANDATORY):
═══════════════════════════════════════════════════════════════
You MUST rotate domains systematically. Use this order and skip the domain used in the example:
1. Technology (if not used in example)
2. Medicine/Health (if not used in example)
3. Business/Economics (if not used in example)
4. Social Science (if not used in example)
5. Natural Science (if not used in example)
6. Education (if not used in example)
7. Current Events/Contemporary Issues (if not used in example)

If the example was art/architecture (humanities), start with Technology and work through the list.
Track which domain you used last and rotate to the next one.

═══════════════════════════════════════════════════════════════
ASSESSMENT CRITERIA:
═══════════════════════════════════════════════════════════════
- The question must assess the student's ability to synthesize information to identify the main idea
- The passage must describe a concept, design, approach, or method that is unconventional, impractical, or unusual
- The passage must also present evidence or reports of potential benefits, positive effects, or positive outcomes
- The correct answer must synthesize BOTH aspects: the unconventional/impractical nature AND the potential benefits
- The main idea should acknowledge the tension or contrast between these two aspects
- Distractors must represent common errors: unsupported claims, exaggerations, or unsupported inferences

═══════════════════════════════════════════════════════════════
CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Passage structure MUST follow this pattern:
     * First 1-2 sentences: Introduce a concept, design, approach, or method that is unconventional, impractical, or unusual
     * Next 1-2 sentences: Describe specific features, characteristics, or aspects that make it unconventional/impractical
     * Final 1-2 sentences: Present evidence, reports, or observations suggesting potential benefits, positive effects, or positive outcomes
   - The passage should create a contrast between the unconventional nature and the potential benefits
   - Use clear, accessible vocabulary appropriate for medium difficulty
   - Include specific details (names, numbers, time periods, etc.) to make it concrete
   - Ensure both the unconventional aspect and the potential benefits are clearly stated

2. Question Generation:
   - Question stem must ask for the main idea
   - Use one of these stem formats (vary from the example):
     * "Which choice best states the main idea of the text?"
     * "Which choice best expresses the main idea of the text?"
     * "Which choice best summarizes the main idea of the text?"
   - The question tests the ability to synthesize both the unconventional aspect and the potential benefits

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize BOTH aspects of the passage:
     * Acknowledges the unconventional/impractical nature (uses words like "although," "despite," "while," etc.)
     * States the potential benefits or positive effects
     * Synthesizes these into a coherent main idea (e.g., "Although [unconventional], [concept/design] may [benefit/effect]")
   
   - Distractor 1 (Unsupported Claim): A statement that makes a claim not supported by the passage. For example, if the passage doesn't address sustainability or long-term effects, this distractor might claim something is "unsustainable" or "unsustainable long-term." It may introduce concepts not mentioned in the text.
   
   - Distractor 2 (Exaggeration/Unsupported Comparison): A statement that exaggerates what the passage states or makes an unsupported comparison. For example, if the passage mentions potential benefits but doesn't compare effectiveness, this distractor might claim something is "the most effective way" or "the best method." It goes beyond what the passage states.
   
   - Distractor 3 (Unsupported Inference): A statement that makes an inference not supported by the passage. For example, if the passage mentions one person's experience but doesn't indicate their broader support, this distractor might claim they "long supported" or "have advocated for" something. It may be plausible but lacks textual support.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the two key aspects: the unconventional/impractical nature and the potential benefits
     * Quote or paraphrase the specific sentence(s) that describe the unconventional features
     * Quote or paraphrase the specific sentence(s) that present evidence of potential benefits
     * Explain how the correct answer synthesizes both aspects into a coherent main idea
     * Show how the answer accurately captures the passage's central message
     * Explain why this synthesis is the main idea (not just one aspect)
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (unsupported claim, exaggeration/unsupported comparison, unsupported inference)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * For unsupported claim: Explicitly state that this concept/claim is not mentioned in the passage
     * For exaggeration: Explain that while the passage mentions related concepts, it doesn't make the comparison or claim stated
     * For unsupported inference: Explain that while this may seem logical, the passage never provides evidence for this conclusion
     * Explain why a student might be tempted by this choice (related vocabulary, logical soundness, etc.)

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT:
═══════════════════════════════════════════════════════════════
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words, following the structure: unconventional concept → specific features → potential benefits)",
  "question": "Which choice best states the main idea of the text?",
  "options": {
    "A": "Option A text (correct answer - synthesizes unconventional nature AND potential benefits)",
    "B": "Option B text (distractor - unsupported claim)",
    "C": "Option C text (distractor - exaggeration/unsupported comparison)",
    "D": "Option D text (distractor - unsupported inference)"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of both unconventional aspect and potential benefits",
    "A": "Rationale for option A (correct answer)",
    "B": "Rationale for option B explaining why it's wrong (unsupported claim - not mentioned in passage)",
    "C": "Rationale for option C explaining why it's wrong (exaggeration/unsupported comparison - passage doesn't make this claim)",
    "D": "Rationale for option D explaining why it's wrong (unsupported inference - no evidence in passage)"
  }
}

═══════════════════════════════════════════════════════════════
VARIETY VERIFICATION (MANDATORY - Before Output):
═══════════════════════════════════════════════════════════════
Before generating your final output, you MUST verify:
1. ✅ Topic Check: "Is my topic different from art/architecture/conceptual art?" (MUST be YES, unless rotating back after using other domains)
2. ✅ Domain Check: "Is my topic from a different domain than humanities/arts?" (MUST be YES if example was arts)
3. ✅ Similarity Check: "Is my topic similar to any previously used topics?" (MUST be NO)
4. ✅ Stem Check: "Is my question stem format appropriate?" (SHOULD vary from previous questions)
5. ✅ Structure Check: "Does my passage follow the required structure?" (MUST be YES)

If ANY check fails, you MUST revise before proceeding.

═══════════════════════════════════════════════════════════════
QUALITY CHECKLIST:
═══════════════════════════════════════════════════════════════
Before finalizing, verify:
- Passage presents an unconventional concept/design AND potential benefits
- Passage structure follows: unconventional concept → specific features → potential benefits
- Topic is completely different from art/architecture (use technology, medicine, business, social science, natural science, etc.)
- Question asks for the main idea
- Correct answer synthesizes BOTH the unconventional nature AND the potential benefits
- All distractors represent distinct error types (unsupported claim, exaggeration, unsupported inference)
- Rationales are comprehensive and reference specific passage text
- Language matches official SAT tone and style
- No grammatical errors or ambiguities
- Topic has not been used in previous questions
- Domain rotation has been followed`
  },
  
  // Medium Difficulty - Variant 2: Main Idea Synthesis (Concept/Design with Potential Benefits) - Alternative Version
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'medium',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at a medium difficulty level. The question must test a student's ability to identify the main idea of an informational passage that describes a concept, design, approach, or method and its potential benefits or effects, where the main idea synthesizes both the unconventional/impractical nature AND the potential positive outcomes.

═══════════════════════════════════════════════════════════════
CRITICAL ANTI-REPETITION REQUIREMENT:
═══════════════════════════════════════════════════════════════
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about architecture/art, use a completely different topic like technology, medicine, business, social science, natural science, etc.)
- DO NOT use topics from the humanities/arts domain if the example question was about art/architecture (rotate to technology, medicine, business, social science, natural science, etc.)
- DO NOT use the same question stem format as other questions (vary between "Which choice best states the main idea...", "Which choice best expresses the main idea...", etc.)
- DO NOT use the same type of concept/design being described (vary between architectural designs, technological approaches, educational methods, medical treatments, business strategies, etc.)
- Vary topics across completely different domains: if one question is about art/architecture, make this about technology, medicine, business, social movements, natural science, etc.
- Ensure the passage topic is completely different (different subject, different context, different field of study)

═══════════════════════════════════════════════════════════════
TOPIC TRACKING (MANDATORY):
═══════════════════════════════════════════════════════════════
Before generating ANY question, you MUST:
- Maintain a mental list of ALL topics used in previous questions in this quiz session
- Check your selected topic against this list
- If your topic (or a very similar topic) appears on the list, you MUST select a different one
- Add your newly selected topic to the list after generation
- Topics are considered "similar" if they: (1) are from the same domain, (2) discuss the same subject matter, (3) use the same examples or contexts

═══════════════════════════════════════════════════════════════
TOPIC SELECTION (CRITICAL - Do this FIRST):
═══════════════════════════════════════════════════════════════
Before writing the passage, you MUST explicitly select a topic that is:
- From a completely different domain than the example question (the example was art/architecture/humanities, so you MUST choose from: technology, medicine, business, social science, natural science, economics, education, etc.)
- NOT art history, architecture, conceptual art, or any visual arts topics (unless explicitly rotating back after using other domains)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "impact of social media on news consumption" not just "social media")
- Appropriate for medium difficulty (some nuance required, accessible but not overly simple vocabulary)

Examples of GOOD topic choices (from different domains than art/architecture):
- Technology: social media's impact on communication, AI's effect on job markets, smartphone addiction and productivity, streaming services and traditional media, virtual reality applications
- Medicine: vaccine effectiveness debates, telemedicine adoption, alternative medicine popularity, medical technology innovations, personalized medicine approaches
- Business: e-commerce impact on retail, remote work trends, cryptocurrency adoption, sustainable business practices, gig economy effects
- Social Science: urban planning and community development, educational reform effectiveness, social media and mental health, migration patterns, community policing
- Natural Science: climate change attribution, renewable energy adoption, space exploration benefits, conservation efforts, genetic engineering applications
- Economics: minimum wage impact debates, automation and employment, trade policy effects, economic inequality trends, universal basic income
- Education: flipped classroom models, online learning effectiveness, project-based learning, standardized testing alternatives

Examples of TOPICS TO AVOID:
- Art history, architecture, conceptual art, visual arts (same domain as example - unless rotating back after using other domains)
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

═══════════════════════════════════════════════════════════════
DOMAIN ROTATION SYSTEM (MANDATORY):
═══════════════════════════════════════════════════════════════
You MUST rotate domains systematically. Use this order and skip the domain used in the example:
1. Technology (if not used in example)
2. Medicine/Health (if not used in example)
3. Business/Economics (if not used in example)
4. Social Science (if not used in example)
5. Natural Science (if not used in example)
6. Education (if not used in example)
7. Current Events/Contemporary Issues (if not used in example)

If the example was art/architecture (humanities), start with Technology and work through the list.
Track which domain you used last and rotate to the next one.

═══════════════════════════════════════════════════════════════
ASSESSMENT CRITERIA:
═══════════════════════════════════════════════════════════════
- The question must assess the student's ability to synthesize information to identify the main idea
- The passage must describe a concept, design, approach, or method that is unconventional, impractical, or unusual
- The passage must also present evidence or reports of potential benefits, positive effects, or positive outcomes
- The correct answer must synthesize BOTH aspects: the unconventional/impractical nature AND the potential benefits
- The main idea should acknowledge the tension or contrast between these two aspects
- Distractors must represent common errors: unsupported claims, exaggerations, or unsupported inferences

═══════════════════════════════════════════════════════════════
CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Passage structure MUST follow this pattern:
     * First 1-2 sentences: Introduce a concept, design, approach, or method that is unconventional, impractical, or unusual
     * Next 1-2 sentences: Describe specific features, characteristics, or aspects that make it unconventional/impractical
     * Final 1-2 sentences: Present evidence, reports, or observations suggesting potential benefits, positive effects, or positive outcomes
   - The passage should create a contrast between the unconventional nature and the potential benefits
   - Use clear, accessible vocabulary appropriate for medium difficulty
   - Include specific details (names, numbers, time periods, etc.) to make it concrete
   - Ensure both the unconventional aspect and the potential benefits are clearly stated

2. Question Generation:
   - Question stem must ask for the main idea
   - Use one of these stem formats (vary from the example):
     * "Which choice best states the main idea of the text?"
     * "Which choice best expresses the main idea of the text?"
     * "Which choice best summarizes the main idea of the text?"
   - The question tests the ability to synthesize both the unconventional aspect and the potential benefits

3. Answer Choice Generation:
   - Correct Answer: Must accurately synthesize BOTH aspects of the passage:
     * Acknowledges the unconventional/impractical nature (uses words like "although," "despite," "while," etc.)
     * States the potential benefits or positive effects
     * Synthesizes these into a coherent main idea (e.g., "Although [unconventional], [concept/design] may [benefit/effect]")
   
   - Distractor 1 (Unsupported Claim): A statement that makes a claim not supported by the passage. For example, if the passage doesn't address sustainability or long-term effects, this distractor might claim something is "unsustainable" or "unsustainable long-term." It may introduce concepts not mentioned in the text.
   
   - Distractor 2 (Exaggeration/Unsupported Comparison): A statement that exaggerates what the passage states or makes an unsupported comparison. For example, if the passage mentions potential benefits but doesn't compare effectiveness, this distractor might claim something is "the most effective way" or "the best method." It goes beyond what the passage states.
   
   - Distractor 3 (Unsupported Inference): A statement that makes an inference not supported by the passage. For example, if the passage mentions one person's experience but doesn't indicate their broader support, this distractor might claim they "long supported" or "have advocated for" something. It may be plausible but lacks textual support.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the two key aspects: the unconventional/impractical nature and the potential benefits
     * Quote or paraphrase the specific sentence(s) that describe the unconventional features
     * Quote or paraphrase the specific sentence(s) that present evidence of potential benefits
     * Explain how the correct answer synthesizes both aspects into a coherent main idea
     * Show how the answer accurately captures the passage's central message
     * Explain why this synthesis is the main idea (not just one aspect)
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (unsupported claim, exaggeration/unsupported comparison, unsupported inference)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * For unsupported claim: Explicitly state that this concept/claim is not mentioned in the passage
     * For exaggeration: Explain that while the passage mentions related concepts, it doesn't make the comparison or claim stated
     * For unsupported inference: Explain that while this may seem logical, the passage never provides evidence for this conclusion
     * Explain why a student might be tempted by this choice (related vocabulary, logical soundness, etc.)

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT:
═══════════════════════════════════════════════════════════════
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words, following the structure: unconventional concept → specific features → potential benefits)",
  "question": "Which choice best states the main idea of the text?",
  "options": {
    "A": "Option A text (correct answer - synthesizes unconventional nature AND potential benefits)",
    "B": "Option B text (distractor - unsupported claim)",
    "C": "Option C text (distractor - exaggeration/unsupported comparison)",
    "D": "Option D text (distractor - unsupported inference)"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including synthesis of both unconventional aspect and potential benefits",
    "A": "Rationale for option A (correct answer)",
    "B": "Rationale for option B explaining why it's wrong (unsupported claim - not mentioned in passage)",
    "C": "Rationale for option C explaining why it's wrong (exaggeration/unsupported comparison - passage doesn't make this claim)",
    "D": "Rationale for option D explaining why it's wrong (unsupported inference - no evidence in passage)"
  }
}

═══════════════════════════════════════════════════════════════
VARIETY VERIFICATION (MANDATORY - Before Output):
═══════════════════════════════════════════════════════════════
Before generating your final output, you MUST verify:
1. ✅ Topic Check: "Is my topic different from art/architecture/conceptual art?" (MUST be YES, unless rotating back after using other domains)
2. ✅ Domain Check: "Is my topic from a different domain than humanities/arts?" (MUST be YES if example was arts)
3. ✅ Similarity Check: "Is my topic similar to any previously used topics?" (MUST be NO)
4. ✅ Stem Check: "Is my question stem format appropriate?" (SHOULD vary from previous questions)
5. ✅ Structure Check: "Does my passage follow the required structure?" (MUST be YES)

If ANY check fails, you MUST revise before proceeding.

═══════════════════════════════════════════════════════════════
QUALITY CHECKLIST:
═══════════════════════════════════════════════════════════════
Before finalizing, verify:
- Passage presents an unconventional concept/design AND potential benefits
- Passage structure follows: unconventional concept → specific features → potential benefits
- Topic is completely different from art/architecture (use technology, medicine, business, social science, natural science, etc.)
- Question asks for the main idea
- Correct answer synthesizes BOTH the unconventional nature AND the potential benefits
- All distractors represent distinct error types (unsupported claim, exaggeration, unsupported inference)
- Rationales are comprehensive and reference specific passage text
- Language matches official SAT tone and style
- No grammatical errors or ambiguities
- Topic has not been used in previous questions
- Domain rotation has been followed`
  },
  
  // Hard Difficulty - Variant 1: Inferring Implications/Consequences
  {
    skill: 'Central Ideas and Details',
    domain: 'Information and Ideas',
    difficulty: 'hard',
    version: '1.0',
    lastUpdated: '2025-01-12',
    prompt: `You are an expert SAT English question writer, trained to emulate the official SAT style, tone, and assessment logic used by College Board.

You are also an expert prompt engineer, building content for Get1600.co, an AI-powered SAT practice platform that generates dynamic, validated, and pedagogically sound SAT Reading and Writing questions.

Your task is to generate a new SAT-style Reading and Writing question that tests the "Central Ideas and Details" skill at a hard difficulty level. The question must test a student's ability to infer implications or consequences based on explicit textual details - specifically, what the text 'most strongly suggests' about how something is used, structured, or functions.

═══════════════════════════════════════════════════════════════
CRITICAL ANTI-REPETITION REQUIREMENT:
═══════════════════════════════════════════════════════════════
This question will be part of a quiz with multiple questions. You MUST ensure this question is DISTINCTLY DIFFERENT from other questions in the same quiz:
- DO NOT use the same topic, subject, or subject matter as other questions (e.g., if another question is about theater/arts, use a completely different topic like technology, science, business, medicine, etc.)
- DO NOT use topics from the arts/humanities domain if the example question was about theater (rotate to technology, medicine, business, natural science, social science, etc.)
- DO NOT use the same question stem format as other questions (vary between "What does the text most strongly suggest...", "The text implies that...", "Based on the passage, what would likely...", etc.)
- DO NOT use the same type of subject being analyzed (vary between artistic works, technological systems, scientific processes, business models, etc.)
- Vary topics across completely different domains: if one question is about theater/arts, make this about technology, science, business, medicine, etc.
- Ensure the passage topic is completely different (different subject, different context, different field of study)

═══════════════════════════════════════════════════════════════
TOPIC TRACKING (MANDATORY):
═══════════════════════════════════════════════════════════════
Before generating ANY question, you MUST:
- Maintain a mental list of ALL topics used in previous questions in this quiz session
- Check your selected topic against this list
- If your topic (or a very similar topic) appears on the list, you MUST select a different one
- Add your newly selected topic to the list after generation
- Topics are considered "similar" if they: (1) are from the same domain, (2) discuss the same subject matter, (3) use the same examples or contexts

═══════════════════════════════════════════════════════════════
TOPIC SELECTION (CRITICAL - Do this FIRST):
═══════════════════════════════════════════════════════════════
Before writing the passage, you MUST explicitly select a topic that is:
- From a completely different domain than the example question (the example was theater/arts/humanities, so you MUST choose from: technology, medicine, business, natural science, social science, economics, etc.)
- NOT theater, performing arts, immersive experiences, or arts/humanities topics (unless explicitly rotating back after using other domains)
- NOT a common educational example (avoid: Arctic fox, cheetah, bats, penguins, dolphins, whales, or any frequently used animal examples)
- Specific and interesting (e.g., "AI's role in medical diagnosis" not just "AI")
- Appropriate for hard difficulty (requires nuanced understanding, some complex vocabulary acceptable)

Examples of GOOD topic choices (from different domains than theater/arts):
- Technology: AI systems in specific applications, blockchain implementations, virtual reality platforms, machine learning algorithms, cloud computing architectures
- Medicine: specific medical procedures, diagnostic technologies, treatment protocols, medical device designs, healthcare delivery systems
- Business: specific business models, e-commerce platforms, supply chain systems, financial technologies, organizational structures
- Natural Science: specific research methodologies, experimental designs, data collection systems, scientific instruments, research protocols
- Social Science: specific social programs, policy implementations, research studies, data analysis methods, survey designs
- Economics: specific economic models, market structures, financial systems, trade mechanisms, economic policies

Examples of TOPICS TO AVOID:
- Theater, performing arts, immersive experiences, arts/humanities (same domain as example - unless rotating back after using other domains)
- Arctic fox, cheetah, bats, penguins, dolphins, whales, or any animal adaptations
- Generic nature topics unless they're about human impact or technology
- Overused historical figures (unless presenting a unique angle)
- Common textbook examples

After selecting your topic, proceed to passage generation.

═══════════════════════════════════════════════════════════════
DOMAIN ROTATION SYSTEM (MANDATORY):
═══════════════════════════════════════════════════════════════
You MUST rotate domains systematically. Use this order and skip the domain used in the example:
1. Technology (if not used in example)
2. Medicine/Health (if not used in example)
3. Business/Economics (if not used in example)
4. Natural Science (if not used in example)
5. Social Science (if not used in example)
6. Education (if not used in example)
7. Current Events/Contemporary Issues (if not used in example)

If the example was theater/arts (humanities), start with Technology and work through the list.
Track which domain you used last and rotate to the next one.

═══════════════════════════════════════════════════════════════
ASSESSMENT CRITERIA:
═══════════════════════════════════════════════════════════════
- The question must assess the student's ability to infer implications or consequences
- The passage must describe a specific work, system, approach, or structure with distinctive characteristics
- The passage must explicitly state details about how something is used, structured, or functions
- The correct answer must infer a logical consequence or implication that is strongly suggested but not explicitly stated
- The inference must be directly supported by the explicit details (not a leap beyond what's reasonable)
- Distractors must represent common errors: misinterpreting details, contradicting the text, or introducing unstated information

═══════════════════════════════════════════════════════════════
CONTENT GENERATION REQUIREMENTS:

1. Passage Generation:
   - Create a single-paragraph informational passage (80-100 words)
   - Use the topic you selected in the TOPIC SELECTION step above
   - Passage structure MUST follow this pattern:
     * First 1-2 sentences: Introduce a specific work, system, approach, or structure
     * Next 2-3 sentences: Describe distinctive characteristics, features, or how it is used/structured
     * Final 1-2 sentences: Explain the effect, result, or significance of these characteristics
   - The passage should provide enough detail to support an inference about implications/consequences
   - Use vocabulary appropriate for hard difficulty (some complex terms acceptable, but not overly technical)
   - Include specific details that create a logical basis for inference
   - Ensure the characteristics described are distinctive and create clear implications

2. Question Generation:
   - Question stem must ask what the text "most strongly suggests" about how something is used/structured
   - Use one of these stem formats (vary from the example):
     * "What does the text most strongly suggest about [subject]'s use of [something]?"
     * "The text most strongly suggests that [subject]'s [aspect] would likely..."
     * "Based on the passage, what would likely be true about [subject]'s [aspect]?"
     * "The passage implies that [subject]'s [aspect] would most likely..."
     * "What does the text most strongly imply about how [subject] [action]?"
     * "Based on the text, what can be inferred about [subject]'s [aspect]?"
   - The question must reference a specific aspect of how something is used, structured, or functions
   - The question tests the ability to infer consequences/implications
   - Vary the question phrasing

3. Answer Choice Generation:
   - Correct Answer: Must be an inference that identifies a logical consequence or implication. It should use language like "would likely," "would probably," "would make it difficult/easy," "would enable," etc. The inference must be directly supported by the explicit details in the passage (e.g., if passage says space is crucial to the effect, infer that it would be difficult to reproduce in a different space).
   
   - Distractor 1 (Misinterprets Detail): Takes a detail from the passage but misinterprets its significance or attributes importance to the wrong aspect. For example, if the passage focuses on space characteristics, this distractor might focus on location. It may use similar vocabulary but misunderstands what's important.
   
   - Distractor 2 (Contradicts Text): Presents an implication that contradicts what the text suggests. For example, if the text suggests something is intentional/important, this distractor might claim it's "disappointing" or "problematic." It may seem logical but goes against the passage's implications.
   
   - Distractor 3 (Unstated Detail): Introduces a detail, concept, or element that is not mentioned anywhere in the passage. For example, if the passage doesn't mention a specific method or approach, this distractor might claim one exists. It may be plausible but lacks textual support.

4. Rationale Generation (CRITICAL - Must be comprehensive):
   - For the Correct Answer:
     * Begin by identifying the explicit details about how something is used/structured
     * Quote or paraphrase the specific sentence(s) that describe these characteristics
     * Explain how these details logically lead to the inferred consequence/implication
     * Show how the correct answer represents a reasonable inference based on the explicit details
     * Explain why this is what the text "most strongly suggests" (strongest logical implication)
   
   - For Each Distractor:
     * Clearly state why the choice is incorrect
     * Identify the specific error type (misinterprets detail, contradicts text, unstated detail)
     * Quote or reference the passage to show what the text actually states (or doesn't state)
     * For misinterprets detail: Explain how this choice misunderstands what's important or attributes significance to the wrong aspect
     * For contradicts text: Show how this choice goes against what the passage suggests
     * For unstated detail: Explicitly state that this element is not mentioned in the passage
     * Explain why a student might be tempted by this choice (similar vocabulary, logical soundness, etc.)

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT:
═══════════════════════════════════════════════════════════════
Return your response as a single JSON object with this exact structure (no additional text):

{
  "passage": "Your generated passage here (80-100 words, following the structure: introduction → characteristics → effects)",
  "question": "What does the text most strongly suggest about [subject]'s use of [something]?",
  "options": {
    "A": "Option A text (correct answer - inference about implications/consequences)",
    "B": "Option B text (distractor - misinterprets detail)",
    "C": "Option C text (distractor - contradicts text)",
    "D": "Option D text (distractor - unstated detail)"
  },
  "correct_answer": "A",
  "rationales": {
    "correct": "Detailed rationale explaining why the correct answer is right, including how explicit details support the inference",
    "A": "Rationale for option A (correct answer)",
    "B": "Rationale for option B explaining why it's wrong (misinterprets detail - attributes importance to wrong aspect)",
    "C": "Rationale for option C explaining why it's wrong (contradicts text - goes against passage's implications)",
    "D": "Rationale for option D explaining why it's wrong (unstated detail - not mentioned in passage)"
  }
}

═══════════════════════════════════════════════════════════════
VARIETY VERIFICATION (MANDATORY - Before Output):
═══════════════════════════════════════════════════════════════
Before generating your final output, you MUST verify:
1. ✅ Topic Check: "Is my topic different from theater/arts/immersive experiences?" (MUST be YES, unless rotating back after using other domains)
2. ✅ Domain Check: "Is my topic from a different domain than arts/humanities?" (MUST be YES if example was arts)
3. ✅ Similarity Check: "Is my topic similar to any previously used topics?" (MUST be NO)
4. ✅ Stem Check: "Is my question stem format appropriate?" (SHOULD vary from previous questions)
5. ✅ Structure Check: "Does my passage follow the required structure?" (MUST be YES)
6. ✅ Inference Check: "Does my correct answer infer a consequence/implication rather than just restating facts?" (MUST be YES)

If ANY check fails, you MUST revise before proceeding.

═══════════════════════════════════════════════════════════════
QUALITY CHECKLIST:
═══════════════════════════════════════════════════════════════
Before finalizing, verify:
- Passage describes a specific work/system/approach with distinctive characteristics
- Passage structure follows: introduction → characteristics → effects
- Topic is completely different from theater/arts (use technology, medicine, business, natural science, social science, etc.)
- Question asks what the text "most strongly suggests" about implications/consequences
- Correct answer is an inference about consequences/implications (uses "would likely," etc.)
- All distractors represent distinct error types (misinterprets detail, contradicts text, unstated detail)
- Rationales are comprehensive and explain how explicit details support the inference
- Language matches official SAT tone and style
- No grammatical errors or ambiguities
- Topic has not been used in previous questions
- Domain rotation has been followed
- Inference is reasonable and directly supported by explicit details`
  },
  
  // TODO: Add more medium and hard difficulty prompts
];

