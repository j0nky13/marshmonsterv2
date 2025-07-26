// client/src/components/tabs/TestTab.tab.jsx
import React from "react";
import { Ghost } from "lucide-react";

export default function TestTab({ widgets }) {
  const widgetsToRender = ["TestWidget", "TestWidget2"]; // Dynamically list widgets this tab uses

  const availableWidgets = widgetsToRender
    .map((name) => widgets[name])
    .filter(Boolean);

  return (
    <div className="p-6">
      {availableWidgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableWidgets.map((WidgetComponent, index) => (
            <div key={index}>
              <WidgetComponent />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 animate-pulse transition-all duration-500 ease-in-out">
          <Ghost className="w-12 h-12 mb-3 text-gray-400" />
          <div className="text-lg font-semibold">Nothing to see here... yet!</div>
          <p className="text-sm text-gray-400">Looks like this tab is waiting on content.</p>
        </div>
      )}
    </div>
  );
}