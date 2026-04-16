'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  section?: string;
}

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, _info: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.section ?? 'unknown'}]`, error);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="glass p-6 rounded-xl text-center">
          <p className="text-2xl mb-2">⚠</p>
          <p className="text-sm text-slate-400">
            Something went wrong{this.props.section ? ` in ${this.props.section}` : ''}.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-ghost text-xs mt-3"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
