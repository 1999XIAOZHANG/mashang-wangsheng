"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}
interface State {
  error: Error | null;
}

/** 全局运行时错误兜底：避免任何一个组件崩溃把整页变成 Next.js 错误屏 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // 开发期在控制台留痕，生产期静默
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error);
    }
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto mt-20 max-w-md rounded-lg border border-seal/50 bg-ink-900 p-6 text-center">
          <p className="font-kai text-lg text-seal">仪式中断，法事重开</p>
          <p className="mt-2 text-xs text-stele">{this.state.error.message}</p>
          <button
            onClick={this.reset}
            className="mt-5 rounded border border-candle-dim bg-ink-800 px-6 py-2 text-sm tracking-[0.3em] text-candle-bright hover:border-candle"
          >
            重新超度
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
