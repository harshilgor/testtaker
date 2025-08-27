
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatTimeRemaining = (seconds?: number): string => {
  if (!seconds) return '';
  return formatTime(seconds);
};
