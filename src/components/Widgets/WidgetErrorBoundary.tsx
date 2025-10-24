import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Widget Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="w-full h-full bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="text-sm lg:text-base font-semibold text-gray-900">Widget Error</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 h-full flex flex-col px-3 pb-3">
            <div className="text-center py-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
              </div>
              <div className="text-sm text-gray-600">
                Widget temporarily unavailable
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
