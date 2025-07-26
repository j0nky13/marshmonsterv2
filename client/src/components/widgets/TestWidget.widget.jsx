import React from "react";

const widgetData = [
  { id: 1, title: "Widget One", description: "This is the first widget." },
  { id: 2, title: "Widget Two", description: "This is the second widget." },
  { id: 3, title: "Widget Three", description: "This is the third widget." },
];

export default function TestWidget() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 animate-fade-in">
      {widgetData.map((widget) => (
        <div key={widget.id} className="bg-white rounded shadow p-4 text-center hover:scale-105 transition-transform">
          <h2 className="text-xl font-bold mb-2 text-gray-800">{widget.title}</h2>
          <p className="text-gray-500 text-lg italic">{widget.description}</p>
        </div>
      ))}
    </div>
  );
}

export const widgetConfig = {
  name: "TestWidget",
  endpoint: "/api/testwidget",
  methods: ["GET", "POST"],
  schema: {
    title: "String",
    description: "String",
  },
  requiresAuth: true,
  allowedRoles: ["admin", "customer"],
};


//JUST TO SHOW WHAT THAT SNIPPIT ABOVE DOES
// export const widgetConfig = {
//   name: "TestWidget", // ✅ Matches component
//   endpoint: "/api/testwidget", // ✅ Clean, lowercase, and unique
//   methods: ["GET", "POST"], // ✅ Declares intended API usage
//   schema: {
//     title: "String",
//     description: "String",
//   }, // ✅ Describes Mongo schema clearly
//   requiresAuth: true, // ✅ Enables Firebase auth check
//   allowedRoles: ["admin", "customer"], // ✅ Supports role-based access control