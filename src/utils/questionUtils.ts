
export const getAnswerOptions = (question: any) => [
  { letter: 'A', text: question.option_a },
  { letter: 'B', text: question.option_b },
  { letter: 'C', text: question.option_c },
  { letter: 'D', text: question.option_d }
];

export const isAnswerCorrect = (selectedAnswer: string, correctAnswer: string): boolean => {
  return selectedAnswer === correctAnswer;
};
