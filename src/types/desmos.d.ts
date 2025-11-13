// TypeScript declarations for Desmos API
declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        element: HTMLElement,
        options?: {
          expressions?: boolean;
          settingsMenu?: boolean;
          keypad?: boolean;
          border?: boolean;
          lockViewport?: boolean;
          zoomButtons?: boolean;
          zoomFit?: boolean;
        }
      ) => {
        setExpression: (expression: { id: string; latex: string }) => void;
        setExpressions: (expressions: Array<{ id: string; latex: string }>) => void;
        updateSettings: (settings: {
          showGrid?: boolean;
          showXAxis?: boolean;
          showYAxis?: boolean;
          xAxisLabel?: string;
          yAxisLabel?: string;
        }) => void;
        setMathBounds: (bounds: {
          left: number;
          right: number;
          bottom: number;
          top: number;
        }) => void;
        destroy: () => void;
      };
    };
  }
}

export {};

