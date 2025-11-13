// @ts-nocheck
import React, { useEffect, useRef } from 'react';

export interface GraphBounds {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

export interface DesmosGraphProps {
  latex: string | string[];
  width?: number;
  height?: number;
  graphBounds?: GraphBounds;
  interactive?: boolean; // If true, allows pan/zoom. Defaults to true for better UX
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  allowPan?: boolean; // Allow panning (dragging)
  allowZoom?: boolean; // Allow zooming (scroll wheel)
}

const DesmosGraph: React.FC<DesmosGraphProps> = ({
  latex,
  width = 450,
  height = 450,
  graphBounds,
  interactive = true, // Default to true for better user experience
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  allowPan = true,
  allowZoom = true,
}) => {
  const calculatorRef = useRef<HTMLDivElement | null>(null);
  const calculatorInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Wait for Desmos API to load
    if (typeof window === 'undefined' || !window.Desmos || !calculatorRef.current) {
      return;
    }

    // Destroy existing calculator if it exists
    if (calculatorInstanceRef.current) {
      calculatorInstanceRef.current.destroy();
    }

      // Create new calculator instance
      try {
        const calculator = window.Desmos!.GraphingCalculator(calculatorRef.current, {
          expressions: false,
          settingsMenu: false,
          keypad: false,
          border: false,
          lockViewport: !interactive, // When interactive=true, lockViewport=false allows pan/zoom
          zoomButtons: false, // Hide zoom buttons (users can use scroll)
          zoomFit: false, // Don't auto-fit
        });

      calculatorInstanceRef.current = calculator;

      // Set expressions (support both single string and array)
      const latexArray = Array.isArray(latex) ? latex : [latex];
      if (latexArray.length === 1) {
        calculator.setExpression({ id: 'graph', latex: latexArray[0] });
      } else {
        calculator.setExpressions(
          latexArray.map((expr, index) => ({
            id: `graph${index}`,
            latex: expr,
          }))
        );
      }

      // Update settings
      calculator.updateSettings({
        showGrid,
        showXAxis,
        showYAxis,
      });

      // Set math bounds (default or provided)
      // Use more generous default bounds if not provided
      const bounds = graphBounds || {
        left: -10,
        right: 20,
        bottom: -20,
        top: 200,
      };
      calculator.setMathBounds(bounds);
    } catch (error) {
      console.error('Error initializing Desmos calculator:', error);
      return;
    }

    // Cleanup function
    return () => {
      if (calculatorInstanceRef.current) {
        calculatorInstanceRef.current.destroy();
        calculatorInstanceRef.current = null;
      }
    };
  }, [latex, graphBounds, interactive, showGrid, showXAxis, showYAxis]);

  return (
    <div className="desmos-graph-wrapper" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <div
        ref={calculatorRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          maxWidth: '100%',
          aspectRatio: `${width} / ${height}`,
        }}
        className="desmos-graph-container"
      />
    </div>
  );
};

export default DesmosGraph;

