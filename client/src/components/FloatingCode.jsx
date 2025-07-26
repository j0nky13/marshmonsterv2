export default function FloatingCode() {
  const codeBlock1 = `// Marsh Monster Web Engine v1
const features = ["custom-crafted", "blazing-fast", "SEO-primed"];

function deploy(site) {
  if (!site.builder) {
    site.performance = "elite";
  }
  return site;
}

const user = { name: "Client A", need: "fast" };
console.log("Deploying:", deploy(user));
`;

  const codeBlock2 = `// Marsh Monster Web Engine v2
const goals = ["no-builder", "hand-coded", "accessible"];

function optimize(site) {
  if (site.includes("cheap")) {
    return "rejected";
  } else if (site.includes("premium")) {
    return "accepted";
  }
  return "review";
}

const pitch = "premium custom site";
console.log("Status:", optimize(pitch));
`;

  const codeBlock3 = `// Marsh Monster Web Engine v3
const queue = ["landing-page", "dashboard", "storefront"];

function launch(queue) {
  for (let i = 0; i < queue.length; i++) {
    console.log("Launching:", queue[i]);
  }
}

launch(queue);
`;

  const codeBlocks = [codeBlock1, codeBlock2, codeBlock3];

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20 flex items-start">
      <div className="w-full h-full flex gap-4 px-4 py-10">
        {codeBlocks.map((code, idx) => (
          <div
            key={idx}
            className="flex-1 text-xs md:text-sm text-lime-400 leading-snug tracking-tight whitespace-pre font-mono animate-floatCode"
            style={{ height: "300%" }}
          >
            {[...Array(10)].map((_, i) => (
              <div key={i}>{code}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}