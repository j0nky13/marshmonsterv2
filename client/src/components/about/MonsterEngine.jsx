import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Cpu, Server, Cloud, Lock } from 'lucide-react';

const engineParts = [
  {
    title: 'Frontend Unit',
    description: 'Built with React for interactivity, Vite for lightning-fast builds, and Tailwind CSS for rapid styling and responsiveness.',
    icon: <Sparkles size={32} />,
  },
  {
    title: 'Logic Core',
    description: 'Combines Firebase Functions for serverless scalability with Express.js for custom API logic and precise control.',
    icon: <Cpu size={32} />,
  },
  {
    title: 'Data Node',
    description: 'MongoDB Atlas provides flexible and scalable cloud-based document storage with fast real-time data handling.',
    icon: <Server size={32} />,
  },
  {
    title: 'Auth Gateway',
    description: 'Secure user authentication powered by Firebase Auth, using one-time passcodes for seamless and password-free access.',
    icon: <Lock size={32} />,
  },
  {
    title: 'Deployment Stack',
    description: 'CI/CD powered by GitHub and hosted on DigitalOcean for reliable deployments, with scalable containers and automatic updates.',
    icon: <Cloud size={32} />,
  },
];

const MonsterEngine = () => {
  return (
    <section className="bg-black text-white py-24 pb-28 relative overflow-hidden">
      {/* Circuit/tech-inspired background pattern */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none bg-black font-mono text-lg text-lime-300/10 leading-snug whitespace-pre-wrap grid grid-cols-3 gap-6 p-9 text-wrap break-words">
        {(() => {
          const codeSnippets = [
            [
              `const monsterEngine = () => {
  initFrontend();
  startAuthGateway();
  mountDataNode();
  deployToCloud();
  runLogicCore();
};`,
              `const monsterEngine = () => {
  initFrontend();
  startAuthGateway();
  mountDataNode();
  deployToCloud();
  runLogicCore();
};`,
              `function startAuthGateway() {
  return firebase.auth().onAuthStateChanged(...);
}`,
              `function runLogicCore() {
  processData(input);
  return generateOutput();
}`
              ,
              `function startAuthGateway() {
  return firebase.auth().onAuthStateChanged(...);
}`,
              `function runLogicCore() {
  processData(input);
  return generateOutput();
}`
 ],
            
   [
    `async function deployToCloud() {
  await pushToGitHub();
  triggerCICD();
}`,
   `function monitorUptime() {
  setInterval(checkHealth, 30000);
}`,
   `function optimizePerformance() {
  cacheResults();
  useLazyLoading();
}`,
`const monsterEngine = () => {
  initFrontend();
  startAuthGateway();
  mountDataNode();
  deployToCloud();
  runLogicCore();
};`,
            
 `const monsterEngine = () => {
  initFrontend();
  startAuthGateway();
  mountDataNode();
  deployToCloud();
  runLogicCore();
};`
            ],
            [
              `const secureUsers = () => {
  enable2FA();
  encryptPasswords();
}`,
              `function initFrontend() {
  hydrateDOM();
  attachEventListeners();
}`,
              `function enableRealtime() {
  subscribeToChanges();
  updateUIOnEvent();
}`,
              `const monsterEngine = () => {
  initFrontend();
  startAuthGateway();
  mountDataNode();
  deployToCloud();
  runLogicCore();
};`,
              `const monsterEngine = () => {
  initFrontend();
  startAuthGateway();
  mountDataNode();
  deployToCloud();
  runLogicCore();
};`,
              `const monsterEngine = () => {
  initFrontend();
  startAuthGateway();
  mountDataNode();
  deployToCloud();
  runLogicCore();
};`
            ]
            
          ];
          return codeSnippets.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-4">
              {column.map((snippet, i) => (
                <pre key={i} className="whitespace-pre-wrap">{snippet}</pre>
              ))}
            </div>
          ));
        })()}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
        <motion.h1
          className="text-[4.5rem] leading-[5rem] font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-green-400 to-purple-500 drop-shadow-[0_0_15px_#a3e635] drop-shadow-[0_0_30px_#9333ea]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          The Monster Engine
        </motion.h1>

        <motion.p
          className="text-sm md:text-base text-gray-400 mb-10 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          The Marsh Monster Engine powers everything we build. Here’s what drives your digital presence behind the scenes.
        </motion.p>

        <motion.p
          className="text-md md:text-lg text-lime-400 mb-20 max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Our proprietary stack, battle-tested and lightning-fast. No fluff, just fire.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          {/* Detailed descriptions on the left */}
          <div className="mt-24 text-left max-w-4xl mx-auto">
            {engineParts.map((part, index) => (
              <motion.div
                key={`desc-${index}`}
                className="flex items-start gap-4 mb-8"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="text-lime-400">{part.icon}</div>
                <div>
                  <h4 className="text-lime-400 text-lg font-semibold mb-1">{part.title}</h4>
                  <p className="text-gray-400 text-sm">{part.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fun circular animated layout on the right */}
          <div className="flex flex-col items-center gap-12 md:px-10">
            {/* Row 1: Frontend Unit */}
            <motion.div
              key={0}
              className="w-44 h-44 rounded-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#1f1f3a] to-[#18182a] border-2 border-lime-400/50 shadow-xl hover:shadow-purple-500/50 hover:scale-105 hover:animate-bounce transition-transform duration-300 relative cursor-pointer group"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false }}
              transition={{ duration: 0.4, delay: 0 }}
            >
              <div className="text-lime-400 group-hover:text-purple-300 transition-colors duration-300 mb-2">
                {engineParts[0].icon}
              </div>
              <h4 className="text-sm font-bold text-lime-400 px-2">{engineParts[0].title}</h4>
              <div className="absolute -inset-px rounded-full border-2 border-lime-300/30 animate-pulse blur-sm opacity-20 group-hover:opacity-60"></div>
            </motion.div>

            {/* Row 2: Two middle units */}
            <div className="flex gap-12 mt-6">
              {engineParts.slice(1, 3).map((part, index) => (
                <motion.div
                  key={index + 1}
                  className="w-44 h-44 rounded-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#1f1f3a] to-[#18182a] border-2 border-lime-400/50 shadow-xl hover:shadow-purple-500/50 hover:scale-105 hover:animate-bounce transition-transform duration-300 relative cursor-pointer group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.4, delay: (index + 1) * 0.1 }}
                >
                  <div className="text-lime-300 group-hover:text-purple-300 transition-colors duration-300 mb-2">
                    {part.icon}
                  </div>
                  <h4 className="text-sm font-bold text-lime-300 px-2">{part.title}</h4>
                  <div className="absolute -inset-px rounded-full border-2 border-lime-300/30 animate-pulse blur-sm opacity-20 group-hover:opacity-60"></div>
                </motion.div>
              ))}
            </div>

            {/* Row 3: Three base units */}
            <div className="flex gap-12 flex-wrap justify-center mt-6">
              {engineParts.slice(3).map((part, index) => (
                <motion.div
                  key={index + 3}
                  className="w-44 h-44 rounded-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#1f1f3a] to-[#18182a] border-2 border-lime-400/50 shadow-xl hover:shadow-purple-500/50 hover:scale-105 hover:animate-bounce transition-transform duration-300 relative cursor-pointer group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.4, delay: (index + 3) * 0.1 }}
                >
                  <div className="text-lime-300 group-hover:text-purple-300 transition-colors duration-300 mb-2">
                    {part.icon}
                  </div>
                  <h4 className="text-sm font-bold text-lime-300 px-2">{part.title}</h4>
                  <div className="absolute -inset-px rounded-full border-2 border-lime-300/30 animate-pulse blur-sm opacity-20 group-hover:opacity-60"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MonsterEngine;