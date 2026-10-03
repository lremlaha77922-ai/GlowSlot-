import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.fallback) {
        return this.fallback;
      }
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-bold text-text mb-1">Something went wrong</h2>
          <p className="text-xs text-muted max-w-xs mb-6">
            We encountered an unexpected error. Please try reloading the view.
          </p>
          <Button
            variant="secondary"
            size="md"
            onClick={() => this.setState({ hasError: false })}
          >
            <RefreshCw size={14} className="mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }

  private get fallback() {
    return this.props.fallback;
  }
}
