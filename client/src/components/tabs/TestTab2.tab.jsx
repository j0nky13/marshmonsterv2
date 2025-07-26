// client/src/components/tabs/TestTab.tab.jsx
import React from "react";

export default function TestTab({ widgets }) {
  const TestWidget = widgets["TestWidget"];
  return (
    <div className="p-6">
      {TestWidget ? (
        <TestWidget />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 animate-pulse transition-all duration-500 ease-in-out">
          <div className="text-4xl mb-2">🤷‍♂️</div>
          <div className="text-lg font-semibold">Nothing to see here... yet!</div>
          <p className="text-sm text-gray-400">Looks like this tab is waiting on content.</p>
        </div>
      )}
    </div>
  );
}