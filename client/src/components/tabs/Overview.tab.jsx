import React, { Suspense, lazy } from "react";
import { ErrorBoundary } from "../utils/ErrorBoundary";

export default function OverviewTab({ user }) {
  const name = user?.displayName || user?.email?.split('@')[0] || "there";

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Welcome back, <span className="text-lime-400">{name}</span>!</h1>
      <ErrorBoundary>
        <Suspense fallback={<div>Loading widget…</div>}>
          {/* Dynamically load actual overview widget here */}
          {(() => {
            const Widget = lazy(() => import("../widgets/Blank.widget.jsx")); // Replace path as needed
            return <Widget />; 
          })()}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}