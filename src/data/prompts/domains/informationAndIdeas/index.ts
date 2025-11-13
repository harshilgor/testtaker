// Information and Ideas Domain - Aggregated Prompts
// This file aggregates all skill-specific prompts for the Information and Ideas domain

import { QuestionPrompt } from '../../index';
import { prompts as centralIdeasAndDetailsPrompts } from './centralIdeasAndDetails';

// Combine all skill-specific prompts
export const prompts: QuestionPrompt[] = [
  ...centralIdeasAndDetailsPrompts,
  // TODO: Add other skill prompts as they are created:
  // ...comprehensionPrompts,
  // ...commandOfEvidencePrompts,
  // ...inferencesPrompts,
  // ...dataInterpretationPrompts,
  // ...wordsInContextPrompts,
];


