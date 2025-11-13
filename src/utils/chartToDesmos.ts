/**
 * Utility to convert chart_data to Desmos-compatible LaTeX expressions
 */

export interface ChartData {
  x_labels: string[];
  y_data: number[];
  x_axis_title: string;
  y_axis_title: string;
}

/**
 * Convert chart_data to a Desmos LaTeX expression
 * For linear data, fits a line. For non-linear, creates a piecewise or point plot.
 */
export function chartDataToDesmosLatex(chartData: ChartData | any): string | null {
  if (!chartData || !chartData.x_labels || !chartData.y_data) {
    return null;
  }

  const xLabels = chartData.x_labels;
  const yData = chartData.y_data;

  if (xLabels.length !== yData.length || xLabels.length === 0) {
    return null;
  }

  // Convert string labels to numbers
  const xValues = xLabels.map((label: string) => {
    const num = parseFloat(label);
    return isNaN(num) ? 0 : num;
  });

  // Check if data is approximately linear
  const isLinear = checkIfLinear(xValues, yData);

  if (isLinear) {
    // Fit a line: y = mx + b
    const { slope, intercept } = fitLine(xValues, yData);
    return `y=${slope.toFixed(2)}x+${intercept.toFixed(2)}`;
  } else {
    // For non-linear data, create a table or piecewise function
    // Desmos can handle tables, but for simplicity, we'll create a piecewise linear function
    return createPiecewiseFunction(xValues, yData);
  }
}

/**
 * Check if data points are approximately linear
 */
function checkIfLinear(xValues: number[], yData: number[]): boolean {
  if (xValues.length < 2) return false;

  // Calculate R-squared to determine linearity
  const { slope, intercept } = fitLine(xValues, yData);
  let ssRes = 0; // Sum of squares of residuals
  let ssTot = 0; // Total sum of squares
  const yMean = yData.reduce((a, b) => a + b, 0) / yData.length;

  for (let i = 0; i < xValues.length; i++) {
    const predicted = slope * xValues[i] + intercept;
    const residual = yData[i] - predicted;
    ssRes += residual * residual;
    ssTot += (yData[i] - yMean) * (yData[i] - yMean);
  }

  const rSquared = 1 - (ssRes / ssTot);
  return rSquared > 0.95; // Consider linear if R² > 0.95
}

/**
 * Fit a line to data points using least squares
 */
function fitLine(xValues: number[], yData: number[]): { slope: number; intercept: number } {
  const n = xValues.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += xValues[i];
    sumY += yData[i];
    sumXY += xValues[i] * yData[i];
    sumXX += xValues[i] * xValues[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Create a piecewise linear function for non-linear data
 */
function createPiecewiseFunction(xValues: number[], yData: number[]): string {
  // For Desmos, we can create a table or use a piecewise function
  // Simplest: create a table expression
  // Format: table([x1, y1], [x2, y2], ...)
  const points = xValues.map((x, i) => `(${x},${yData[i]})`).join(',');
  
  // Create a piecewise linear interpolation
  // For Desmos, we'll use a simpler approach: plot points and connect them
  if (xValues.length <= 2) {
    // Just two points - use line
    const { slope, intercept } = fitLine(xValues, yData);
    return `y=${slope.toFixed(2)}x+${intercept.toFixed(2)}`;
  }

  // For multiple points, create a piecewise function
  // Format: {x1 <= x < x2: line1, x2 <= x < x3: line2, ...}
  let piecewise = '{';
  for (let i = 0; i < xValues.length - 1; i++) {
    const x1 = xValues[i];
    const x2 = xValues[i + 1];
    const y1 = yData[i];
    const y2 = yData[i + 1];
    
    const slope = (y2 - y1) / (x2 - x1);
    const intercept = y1 - slope * x1;
    
    if (i > 0) piecewise += ',';
    piecewise += `${x1}<=x<${x2}:${slope.toFixed(2)}x+${intercept.toFixed(2)}`;
  }
  piecewise += '}';
  
  return piecewise;
}

/**
 * Get graph bounds from chart_data
 */
export function getGraphBoundsFromChartData(chartData: ChartData | any): {
  left: number;
  right: number;
  bottom: number;
  top: number;
} | null {
  if (!chartData || !chartData.x_labels || !chartData.y_data) {
    return null;
  }

  const xValues = chartData.x_labels.map((label: string) => {
    const num = parseFloat(label);
    return isNaN(num) ? 0 : num;
  });

  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...chartData.y_data);
  const maxY = Math.max(...chartData.y_data);

  // Calculate padding based on range (more generous padding for better visibility)
  const xRange = maxX - minX;
  const yRange = maxY - minY;
  
  // Calculate padding - use percentage of range, with sensible minimums
  // For x-axis: 20% padding or minimum 5 units to ensure x-axis is visible
  const xPadding = xRange > 0 ? Math.max(xRange * 0.2, 5) : 10;
  // For y-axis: 20% padding or minimum 20 units
  const yPadding = yRange > 0 ? Math.max(yRange * 0.2, 20) : 50;

  // Calculate initial bounds with padding
  let left = minX - xPadding;
  let right = maxX + xPadding;
  let bottom = minY - yPadding;
  let top = maxY + yPadding;

  // Always ensure we show the x-axis (y=0) if data crosses it
  if (minY <= 0 && maxY >= 0) {
    // Data crosses x-axis, ensure it's visible with padding
    const yAbsMax = Math.max(Math.abs(minY), Math.abs(maxY));
    bottom = Math.min(bottom, -yAbsMax * 0.1);
    top = Math.max(top, yAbsMax * 0.1);
  } else if (minY > 0) {
    // All data is positive, show some space below
    bottom = Math.min(bottom, -Math.max(10, maxY * 0.1));
  } else {
    // All data is negative, show some space above
    top = Math.max(top, Math.abs(minY) * 0.1);
  }

  // Always ensure we show the y-axis (x=0) if data crosses it
  if (minX <= 0 && maxX >= 0) {
    // Data crosses y-axis, ensure it's visible with padding
    const xAbsMax = Math.max(Math.abs(minX), Math.abs(maxX));
    left = Math.min(left, -xAbsMax * 0.1);
    right = Math.max(right, xAbsMax * 0.1);
  } else if (minX > 0) {
    // All data is positive, show some space to the left
    left = Math.min(left, -Math.max(5, maxX * 0.1));
  } else {
    // All data is negative, show some space to the right
    right = Math.max(right, Math.abs(minX) * 0.1);
  }

  // Round to nice numbers for cleaner display
  // For x-axis: round to nearest integer
  left = Math.floor(left);
  right = Math.ceil(right);
  
  // For y-axis: round to nice intervals based on range
  let yInterval = 10;
  if (Math.abs(top - bottom) > 1000) {
    yInterval = 100;
  } else if (Math.abs(top - bottom) > 100) {
    yInterval = 50;
  } else if (Math.abs(top - bottom) > 50) {
    yInterval = 10;
  } else {
    yInterval = 5;
  }
  
  bottom = Math.floor(bottom / yInterval) * yInterval;
  top = Math.ceil(top / yInterval) * yInterval;
  
  // Ensure minimum reasonable bounds for visibility
  if (right - left < 20) {
    const center = (left + right) / 2;
    left = Math.floor(center - 10);
    right = Math.ceil(center + 10);
  }
  if (top - bottom < 100) {
    const center = (bottom + top) / 2;
    const range = top - bottom;
    bottom = Math.floor((center - range * 0.6) / yInterval) * yInterval;
    top = Math.ceil((center + range * 0.6) / yInterval) * yInterval;
  }

  return {
    left,
    right,
    bottom,
    top,
  };
}

