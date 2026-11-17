'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PROZ MOVIE Client Exception caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 bg-[#080B12]">
          <div className="max-w-md w-full bg-[#111827]/90 backdrop-blur-xl border border-red-500/30 rounded-2xl p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#F8FAFC]">
                Temporary Display Issue
              </h2>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                A non-critical rendering issue occurred while displaying this section. Your streaming session and account are safe.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] text-white text-xs font-semibold hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>

              <Link
                href="/"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e293b]/70 border border-[#334155] text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-all"
              >
                <Home className="w-3.5 h-3.5" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
