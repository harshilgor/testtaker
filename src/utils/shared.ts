// Shared utility functions for the application
// This file contains commonly used functions to reduce code duplication

import { DifficultyData, DomainData, SubdomainData, ViewMode } from '@/types';

// ============================================================================
// ACCURACY & COLOR UTILITIES
// ============================================================================

/**
 * Get color class based on accuracy percentage
 */
export const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 90) return 'bg-green-600';
  if (accuracy >= 80) return 'bg-green-500';
  if (accuracy >= 70) return 'bg-lime-500';
  if (accuracy >= 60) return 'bg-yellow-400';
  return 'bg-gray-400';
};

/**
 * Get text color class based on accuracy percentage
 */
export const getAccuracyTextColor = (accuracy: number): string => {
  if (accuracy >= 90) return 'text-green-600';
  if (accuracy >= 80) return 'text-green-500';
  if (accuracy >= 70) return 'text-lime-500';
  if (accuracy >= 60) return 'text-yellow-400';
  return 'text-gray-500';
};

/**
 * Get accuracy color for legend items
 */
export const getLegendColor = (range: string): string => {
  switch (range) {
    case '0%-59%': return 'bg-gray-400';
    case '60%-69%': return 'bg-yellow-400';
    case '70%-79%': return 'bg-lime-500';
    case '80%-89%': return 'bg-green-500';
    case '90%-100%': return 'bg-green-600';
    default: return 'bg-gray-400';
  }
};

// ============================================================================
// CHART & VISUALIZATION UTILITIES
// ============================================================================

/**
 * Calculate proportional bar height for charts
 */
export const calculateBarHeight = (
  value: number, 
  maxValue: number, 
  maxHeight: number = 120, 
  minHeight: number = 15
): number => {
  if (maxValue === 0) return minHeight;
  return Math.max((value / maxValue) * maxHeight, minHeight);
};

/**
 * Calculate proportional bar width for horizontal bars
 */
export const calculateBarWidth = (
  value: number, 
  maxValue: number, 
  minWidth: number = 0
): number => {
  if (maxValue === 0) return minWidth;
  return Math.max((value / maxValue) * 100, minWidth);
};

/**
 * Generate horizontal grid lines for charts
 */
export const generateGridLines = (count: number = 5, startOffset: number = 20) => {
  return [...Array(count)].map((_, i) => ({
    key: i,
    top: `${startOffset + i * 20}%`
  }));
};

// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================

/**
 * Calculate accuracy percentage
 */
export const calculateAccuracy = (correct: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
};

/**
 * Find maximum accuracy from data array
 */
export const findMaxAccuracy = <T extends { accuracy: number }>(data: T[]): number => {
  return Math.max(...data.map(item => item.accuracy), 0);
};

/**
 * Filter data by subject type
 */
export const filterBySubject = <T extends { test?: string; assessment?: string }>(
  data: T[], 
  subject: 'all' | 'math' | 'reading_and_writing'
): T[] => {
  if (subject === 'all') return data;
  
  return data.filter(item => {
    const testField = item.test || item.assessment || '';
    if (subject === 'math') {
      return testField.toLowerCase().includes('math');
    } else if (subject === 'reading_and_writing') {
      return testField.toLowerCase().includes('reading') || 
             testField.toLowerCase().includes('writing');
    }
    return true;
  });
};

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format time duration in a human-readable format
 */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

/**
 * Format percentage with proper rounding
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)}%`;
};

/**
 * Format large numbers with K/M suffixes
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Check if data array is valid and non-empty
 */
export const isValidData = <T>(data: T[] | null | undefined): data is T[] => {
  return Array.isArray(data) && data.length > 0;
};

/**
 * Safe array access with fallback
 */
export const safeArrayAccess = <T>(arr: T[], index: number, fallback: T): T => {
  return arr[index] ?? fallback;
};

// ============================================================================
// DEBOUNCE UTILITY
// ============================================================================

/**
 * Debounce function to limit function calls
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// ============================================================================
// LOCAL STORAGE UTILITIES
// ============================================================================

/**
 * Safe localStorage getter with fallback
 */
export const getFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Safe localStorage setter
 */
export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const ACCURACY_RANGES = [
  { range: '0%-59%', color: 'bg-gray-400' },
  { range: '60%-69%', color: 'bg-yellow-400' },
  { range: '70%-79%', color: 'bg-lime-500' },
  { range: '80%-89%', color: 'bg-green-500' },
  { range: '90%-100%', color: 'bg-green-600' }
] as const;

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;

export const SUBJECT_TYPES: SubjectType[] = ['all', 'math', 'reading_and_writing'];

export const VIEW_MODES: ViewMode[] = ['accuracy', 'count'];
