// Information and Ideas Domain - Aggregated Prompts
// This file aggregates all skill-specific prompts for the Information and Ideas domain

import { QuestionPrompt } from '../../index';
import { prompts as centralIdeasAndDetailsPrompts } from './centralIdeasAndDetails';
import { prompts as inferencesPrompts } from './inferences';
import { prompts as commandOfEvidencePrompts } from './commandOfEvidence';

// Combine all skill-specific prompts
export const prompts: QuestionPrompt[] = [
  ...centralIdeasAndDetailsPrompts,
  ...inferencesPrompts,
  ...commandOfEvidencePrompts,
  // TODO: Add other skill prompts as they are created:
  // ...comprehensionPrompts,
  // ...dataInterpretationPrompts,
  // ...wordsInContextPrompts,
];


