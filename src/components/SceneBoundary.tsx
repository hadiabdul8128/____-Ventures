import { Component, type ReactNode } from "react";
import { GoldSculpture } from "./GoldSculpture";

/** Keep the page usable if WebGL or an optional scene module is unavailable. */
export class SceneBoundary extends Component<
  { children: ReactNode },
  { unavailable: boolean }
> {
  state = { unavailable: false };
  static getDerivedStateFromError() {
    return { unavailable: true };
  }
  render() {
    return this.state.unavailable ? (
      <div
        className="static-network"
        role="img"
        aria-label="A gold sculpture representing the venture network"
      >
        <GoldSculpture small />
      </div>
    ) : (
      this.props.children
    );
  }
}
