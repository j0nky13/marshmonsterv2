//fuck off with any judgement on me using emoji, I like the visual. 

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import inquirer from 'inquirer';
// Prompt for MongoDB URI
async function promptForMongoUri() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('🔗 Enter your MongoDB URI (or leave blank to skip): ', (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Update .env file with MongoDB URI
function updateEnvFile(uri) {
  const envPath = '.env';
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
    // Remove existing MONGO_URI line if present
    envContent = envContent.replace(/^MONGO_URI=.*$/m, '');
  }

  if (uri) {
    envContent += `\nMONGO_URI=${uri}`;
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('✅ .env file updated with MONGO_URI');
  } else {
    console.log('⚠️ Skipped Mongo URI update.');
  }

  // Patch .gitignore to include .env
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  let gitignoreContents = '';
  if (fs.existsSync(gitignorePath)) {
    gitignoreContents = fs.readFileSync(gitignorePath, 'utf8');
  }

  if (!gitignoreContents.includes('.env')) {
    fs.appendFileSync(gitignorePath, '\n.env\n');
    console.log('📄 Patched .gitignore to ignore .env');
  }
}

console.log("✅ Updating package.json...");

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

packageJson.scripts = packageJson.scripts || {};
packageJson.scripts.start = "node server.js";
packageJson.scripts.dev = "nodemon server.js";

packageJson.dependencies = packageJson.dependencies || {};
packageJson.dependencies.express = "^4.18.2";
packageJson.dependencies.mongoose = "^7.3.1";
packageJson.dependencies.cors = "^2.8.5";
packageJson.dependencies['dotenv'] = "^16.3.1";

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log("✅ package.json updated with scripts and dependencies.");

console.log("✅ Creating backend directories...");

const backendDirs = [
  'server/routes',
  'server/models',
  'server/controllers',
  'server/middleware',
  'server/utils',
  'server/config',
];

backendDirs.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`ℹ️ Directory already exists: ${dir}`);
  }
});

console.log("🧠 Creating backend template files...");

const templatesDir = path.join(process.cwd(), 'templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

// Create server.js
const serverJsContent = `import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import apiRoutes from './server/routes/api.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(\`🚀 Server running on port \${PORT}\`));
  })
  .catch((err) => console.error('MongoDB connection error:', err));
`;
const serverJsPath = path.join(templatesDir, 'server.js');
fs.writeFileSync(serverJsPath, serverJsContent);
console.log(`✅ Created templates/server.js`);

// Create routes/api.js
const routesDir = path.join(templatesDir, 'routes');
if (!fs.existsSync(routesDir)) {
  fs.mkdirSync(routesDir, { recursive: true });
}
const apiJsContent = `import express from 'express';
import { getUser, createUser } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/user/:id', auth, getUser);
router.post('/user', createUser);

export default router;
`;
const apiJsPath = path.join(routesDir, 'api.js');
fs.writeFileSync(apiJsPath, apiJsContent);
console.log(`✅ Created templates/routes/api.js`);

// Create controllers/userController.js
const controllersDir = path.join(templatesDir, 'controllers');
if (!fs.existsSync(controllersDir)) {
  fs.mkdirSync(controllersDir, { recursive: true });
}
const userControllerContent = `import User from '../models/User.js';

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'User not found' });
  }
};

export const createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: 'Error creating user' });
  }
};
`;
const userControllerPath = path.join(controllersDir, 'userController.js');
fs.writeFileSync(userControllerPath, userControllerContent);
console.log(`✅ Created templates/controllers/userController.js`);

// Create models/User.js
const modelsDir = path.join(templatesDir, 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}
const userModelContent = `import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['guest', 'customer', 'admin'], default: 'guest' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', UserSchema);
`;
const userModelPath = path.join(modelsDir, 'User.js');
fs.writeFileSync(userModelPath, userModelContent);
console.log(`✅ Created templates/models/User.js`);

// Create middleware/auth.js
const middlewareDir = path.join(templatesDir, 'middleware');
if (!fs.existsSync(middlewareDir)) {
  fs.mkdirSync(middlewareDir, { recursive: true });
}
const authContent = `export default function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ error: 'No token provided' });

  // Simulate token validation
  try {
    const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}
`;
const authPath = path.join(middlewareDir, 'auth.js');
fs.writeFileSync(authPath, authContent);
console.log(`✅ Created templates/middleware/auth.js`);

// Create config/db.js
const configDir = path.join(templatesDir, 'config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}
const dbContent = `import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ DB Connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
`;
const dbPath = path.join(configDir, 'db.js');
fs.writeFileSync(dbPath, dbContent);
console.log(`✅ Created templates/config/db.js`);

// Create utils/logger.js
const utilsDir = path.join(templatesDir, 'utils');
if (!fs.existsSync(utilsDir)) {
  fs.mkdirSync(utilsDir, { recursive: true });
}
const loggerContent = `export const log = (message) => {
  console.log(\`[LOG]: \${message}\`);
};
`;
const loggerPath = path.join(utilsDir, 'logger.js');
fs.writeFileSync(loggerPath, loggerContent);
console.log(`✅ Created templates/utils/logger.js`);

// Create .env.example
const envExampleContent = `MONGO_URI=mongodb://localhost:27017/marshmonster
PORT=5000
`;
const envExamplePath = path.join(templatesDir, '.env.example');
fs.writeFileSync(envExamplePath, envExampleContent);
console.log(`✅ Created templates/.env.example`);

console.log("✅ Copying backend template files...");

const backendTemplateFiles = [
  { src: 'server.js', dest: 'server.js' },
  { src: 'routes/api.js', dest: 'server/routes/api.js' },
  { src: 'models/User.js', dest: 'server/models/User.js' },
  { src: 'controllers/userController.js', dest: 'server/controllers/userController.js' },
  { src: 'middleware/auth.js', dest: 'server/middleware/auth.js' },
  { src: 'config/db.js', dest: 'server/config/db.js' },
  { src: 'utils/logger.js', dest: 'server/utils/logger.js' },
  { src: '.env.example', dest: '.env' },
];

backendTemplateFiles.forEach(({ src, dest }) => {
  const srcPath = path.join(templatesDir, src);
  const destPath = path.join(process.cwd(), dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Copied ${src} to ${dest}`);
  } else {
    console.warn(`⚠️ Template file missing: ${src}`);
  }
});

console.log("🧠 Writing styled Dashboard.jsx...");

const dashboardContent = `import { useState, useEffect, useMemo } from 'react';
const tabsContext = import.meta.glob('../components/tabs/*.tab.jsx', { eager: true });
const widgetsContext = import.meta.glob('../components/widgets/*.widget.jsx', { eager: true });

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'guest';

  const tabs = useMemo(() => {
    return Object.keys(tabsContext)
      .map((path) => {
        const name = path.split('/').pop().replace('.tab.jsx', '').toLowerCase();
        const TabComponent = tabsContext[path].default;
        const roles = tabsContext[path]?.roles || ['guest', 'customer', 'admin'];
        return {
          key: name,
          label: name.charAt(0).toUpperCase() + name.slice(1),
          Component: TabComponent,
          roles,
        };
      })
      .filter((tab) => tab.roles.includes(role))
      .sort((a, b) => {
        if (a.key === 'overview') return -1;
        if (b.key === 'overview') return 1;
        return a.label.localeCompare(b.label);
      });
  }, [role]);

  const widgets = useMemo(() => {
    return Object.keys(widgetsContext).reduce((acc, path) => {
      const name = path.split('/').pop().replace('.widget.jsx', '');
      acc[name] = widgetsContext[path].default;
      return acc;
    }, {});
  }, []);

  return (
    <div className="flex min-h-screen bg-[#121212] text-white relative">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div className={\`fixed top-0 left-0 h-screen w-64 z-30 transform-gpu transition-transform duration-700 ease-out md:static md:flex md:flex-col md:justify-between \${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}\`}>
        <aside className="h-full bg-[#1e1e1e] text-white shadow-lg flex flex-col p-6">
          <div className="mb-10 flex items-center justify-center">
            <h1 className="text-3xl font-extrabold tracking-wide text-lime-400 select-none">Marsh Monster</h1>
          </div>
          <nav className="flex flex-col space-y-3 flex-grow">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSidebarOpen(false);
                }}
                className={\`rounded-lg px-4 py-3 text-left font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-lime-400 \${activeTab === tab.key ? 'text-lime-400 bg-[#222] shadow-inner' : 'text-white hover:text-lime-400 hover:bg-[#222]'}\`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => {
              localStorage.removeItem('user');
              location.reload();
            }}
            className="mt-6 rounded-lg px-4 py-3 text-white hover:text-lime-400 hover:bg-[#222] transition-colors duration-200 font-semibold focus:outline-none focus:ring-2 focus:ring-lime-400"
          >
            Logout
          </button>
        </aside>
      </div>

      <button
        className={\`md:hidden fixed top-4 left-4 z-40 bg-gray-800 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400 transition-opacity \${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}\`}
        onClick={() => setSidebarOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <main className="flex-1 p-4 pt-20 md:p-6 md:pt-6 md:ml-64">
        {tabs.map(
          (tab) =>
            tab.key === activeTab && (
              <div key={tab.key} className="bg-[#1e1e1e] border border-gray-700 p-6 rounded-lg">
                <tab.Component widgets={widgets} user={user} />
              </div>
            )
        )}
      </main>
    </div>
  );
}
`;

const outputPath = path.join(process.cwd(), 'pages', 'Dashboard.jsx');
fs.writeFileSync(outputPath, dashboardContent);
console.log(`✅ Dashboard.jsx created at ${outputPath}`);

// === Ensure components/widgets/ directory and starter widgets ===
const widgetsDir = path.join(process.cwd(), 'components', 'widgets');
if (!fs.existsSync(widgetsDir)) {
  fs.mkdirSync(widgetsDir, { recursive: true });
  console.log(`✅ Created directory: components/widgets`);
}

// FinanceSummary.widget.jsx
const financeSummaryPath = path.join(widgetsDir, 'FinanceSummary.widget.jsx');
const financeSummaryContent = `import React, { useState } from 'react';

export default function FinanceSummary({ user }) {
  const [revenue, setRevenue] = useState(0);
  const [expenses, setExpenses] = useState(0);

  const profit = revenue - expenses;

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-2">Finance Summary</h2>
      <div className="space-y-2">
        <div>
          <label>Revenue: </label>
          <input
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(Number(e.target.value))}
            className="text-black p-1 rounded"
          />
        </div>
        <div>
          <label>Expenses: </label>
          <input
            type="number"
            value={expenses}
            onChange={(e) => setExpenses(Number(e.target.value))}
            className="text-black p-1 rounded"
          />
        </div>
        <div>
          <strong>Profit: $\{profit}</strong>
        </div>
      </div>
    </div>
  );
}
`;
if (!fs.existsSync(financeSummaryPath)) {
  fs.writeFileSync(financeSummaryPath, financeSummaryContent.trim() + '\n');
  console.log('✅ Created components/widgets/FinanceSummary.widget.jsx');
}

// SimpleUpload.widget.jsx
const simpleUploadPath = path.join(widgetsDir, 'SimpleUpload.widget.jsx');
const simpleUploadContent = `import React, { useState } from 'react';

export default function SimpleUpload({ user }) {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) return alert('No file selected');
    console.log('Uploading file:', file.name);
    // Add actual upload logic
  };

  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-2">Upload Document</h2>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="text-black p-1 rounded"
      />
      <button
        onClick={handleUpload}
        className="mt-2 bg-lime-500 px-4 py-2 rounded text-black"
      >
        Upload
      </button>
    </div>
  );
}
`;
if (!fs.existsSync(simpleUploadPath)) {
  fs.writeFileSync(simpleUploadPath, simpleUploadContent.trim() + '\n');
  console.log('✅ Created components/widgets/SimpleUpload.widget.jsx');
}

// Detect and scaffold new widgets
console.log("🧠 Scanning for new widgets to scaffold backend...");

const widgetDir = path.join(process.cwd(), 'components', 'widgets');
const widgetFiles = fs.existsSync(widgetDir)
  ? fs.readdirSync(widgetDir).filter(file => file.endsWith('.widget.jsx'))
  : [];

widgetFiles.forEach(file => {
  const baseName = file.replace('.widget.jsx', '').toLowerCase();
  const routePath = path.join(process.cwd(), 'server', 'routes', `${baseName}.js`);
  const controllerPath = path.join(process.cwd(), 'server', 'controllers', `${baseName}Controller.js`);
  const modelPath = path.join(process.cwd(), 'server', 'models', `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}.js`);
  const apiJsPath = path.join(process.cwd(), 'server', 'routes', 'api.js');
  const serverJsPath = path.join(process.cwd(), 'server.js');

  // ROUTE
  if (!fs.existsSync(routePath)) {
    const routeContent = `import express from 'express';
import { get${baseName}, create${baseName} } from '../controllers/${baseName}Controller.js';
const router = express.Router();

router.get('/', get${baseName});
router.post('/', create${baseName});

export default router;
`;
    fs.writeFileSync(routePath, routeContent);
    console.log(`✅ Created route: routes/${baseName}.js`);
  }

  // CONTROLLER
  if (!fs.existsSync(controllerPath)) {
    const controllerContent = `export const get${baseName} = async (req, res) => {
  res.json({ message: 'GET ${baseName}' });
};

export const create${baseName} = async (req, res) => {
  res.json({ message: 'POST ${baseName}' });
};
`;
    fs.writeFileSync(controllerPath, controllerContent);
    console.log(`✅ Created controller: controllers/${baseName}Controller.js`);
  }

  // MODEL
  if (!fs.existsSync(modelPath)) {
    const modelContent = `import mongoose from 'mongoose';

const ${baseName}Schema = new mongoose.Schema({
  name: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('${baseName.charAt(0).toUpperCase() + baseName.slice(1)}', ${baseName}Schema);
`;
    fs.writeFileSync(modelPath, modelContent);
    console.log(`✅ Created model: models/${baseName.charAt(0).toUpperCase() + baseName.slice(1)}.js`);
  }

  // --- AUTOMERGE LOGIC FOR server.js ---
  if (fs.existsSync(serverJsPath)) {
    let serverJsText = fs.readFileSync(serverJsPath, 'utf-8');
    // Find all app.use('/api/[widget]', ...) lines
    const widgetRouteLine = `app.use('/api/${baseName}', require('./server/routes/${baseName}.js'))`;
    // Accept both single/double quotes and with/without semicolon
    const routeRegex = new RegExp(`app\\.use\\(['"\`]/api/${baseName}['"\`],\\s*require\\(['"\`]./server/routes/${baseName}\\.js['"\`]\\)\\s*\\)?;?`);
    if (!routeRegex.test(serverJsText)) {
      // Find where to insert: after last app.use('/api', ...) or after last app.use(...)
      let lines = serverJsText.split('\n');
      let lastAppUseIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('app.use(')) lastAppUseIdx = i;
      }
      const insertLine = `app.use('/api/${baseName}', require('./server/routes/${baseName}.js'));`;
      if (lastAppUseIdx !== -1) {
        lines.splice(lastAppUseIdx + 1, 0, insertLine);
      } else {
        // fallback: insert before mongoose.connect or at end
        let connectIdx = lines.findIndex(l => l.includes('mongoose.connect'));
        if (connectIdx > 0) {
          lines.splice(connectIdx, 0, insertLine);
        } else {
          lines.push(insertLine);
        }
      }
      fs.writeFileSync(serverJsPath, lines.join('\n'));
      console.log(`✅ Registered /api/${baseName} route in server.js (automerge)`);
    } else {
      // Already present
      // console.log(`ℹ️ /api/${baseName} route already registered in server.js`);
    }
  }

  // --- AUTOMERGE LOGIC FOR routes/api.js ---
  if (fs.existsSync(apiJsPath)) {
    let apiJsText = fs.readFileSync(apiJsPath, 'utf-8');
    // 1. Add require line if missing
    const requireLine = `import ${baseName}Router from './${baseName}.js';`;
    const requireRegex = new RegExp(`import\\s+${baseName}Router\\s+from\\s+['"\`]./${baseName}\\.js['"\`];`);
    if (!requireRegex.test(apiJsText)) {
      // Insert after last import line
      let lines = apiJsText.split('\n');
      let lastImportIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) lastImportIdx = i;
      }
      lines.splice(lastImportIdx + 1, 0, requireLine);
      apiJsText = lines.join('\n');
      fs.writeFileSync(apiJsPath, apiJsText);
      console.log(`✅ Registered import for ${baseName}Router in routes/api.js (automerge)`);
    }
    // 2. Add router.use if missing
    let lines = fs.readFileSync(apiJsPath, 'utf-8').split('\n');
    const useLine = `router.use('/${baseName}', ${baseName}Router);`;
    const useRegex = new RegExp(`router\\.use\\(['"\`]/${baseName}['"\`],\\s*${baseName}Router\\s*\\);?`);
    let hasUse = lines.some(line => useRegex.test(line));
    if (!hasUse) {
      // Insert after last router.use or after router = express.Router()
      let lastRouterUseIdx = -1;
      let routerVarIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('router.use(')) lastRouterUseIdx = i;
        if (lines[i].includes('express.Router')) routerVarIdx = i;
      }
      if (lastRouterUseIdx !== -1) {
        lines.splice(lastRouterUseIdx + 1, 0, useLine);
      } else if (routerVarIdx !== -1) {
        lines.splice(routerVarIdx + 1, 0, useLine);
      } else {
        // fallback: before export
        let exportIdx = lines.findIndex(l => l.includes('export default'));
        if (exportIdx > 0) {
          lines.splice(exportIdx, 0, useLine);
        } else {
          lines.push(useLine);
        }
      }
      fs.writeFileSync(apiJsPath, lines.join('\n'));
      console.log(`✅ Registered router.use for /${baseName} in routes/api.js (automerge)`);
    }
  }
});


// Add to .gitignore if needed
const rootDir = process.cwd();
const gitignorePath = path.join(rootDir, '.gitignore');
const gitignoreEntries = [
  '.env',
  'node_modules/',
  'dist/',
  'firebase.js',
  '*.local',
  '*.log',
  '.DS_Store',
  'coverage/',
];

if (fs.existsSync(gitignorePath)) {
  const current = fs.readFileSync(gitignorePath, 'utf8');
  const missing = gitignoreEntries.filter(line => !current.includes(line));
  if (missing.length > 0) {
    fs.appendFileSync(gitignorePath, '\n' + missing.join('\n'));
    console.log('✅  Updated .gitignore with Firebase and build exclusions');
  }
} else {
  fs.writeFileSync(gitignorePath, gitignoreEntries.join('\n'));
  console.log('✅  Created .gitignore with standard entries');
}

// Add firebase.js starter if missing
const firebaseTarget = path.join(rootDir, 'firebase.js');
const firebaseTemplateContent = `
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

export default firebaseConfig;
`;

if (!fs.existsSync(firebaseTarget)) {
  fs.writeFileSync(firebaseTarget, firebaseTemplateContent.trim());
  console.log('✅ Firebase config starter created at firebase.js');
}

// Prompt for MongoDB URI and update .env
async function runMonsterEngine() {
  // (The main logic above would be here in a real refactor)
  const mongoUri = await promptForMongoUri();
  updateEnvFile(mongoUri);

  // === Helper Integration (inquirer prompt) ===
  const { helperChoice } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'helperChoice',
      message: 'Which helpers do you want to run?',
      choices: [
        '✅ Seed Default Roles',
        '✅ Generate Dashboard Page',
        '✅ Create New Widget (CLI)',
        '✅ Log Project Metadata',
        '✅ Add Widget Usage Tracker',
        '✅ Seed Sample Widget Data',
        '✅ Backup Current State',
        '✅ Create Route Tester Page',
      ],
    },
  ]);

  if (helperChoice.includes('✅ Seed Default Roles')) {
    // Placeholder: Add logic to insert default roles to Mongo
  }

  if (helperChoice.includes('✅ Generate Dashboard Page')) {
    // Placeholder: Create Dashboard.jsx with sidebar/tabs layout
  }

  if (helperChoice.includes('✅ Create New Widget (CLI)')) {
    // Placeholder: Prompt for widget type/name, generate boilerplate widget
  }

  if (helperChoice.includes('✅ Log Project Metadata')) {
    // Placeholder: Write timestamped JSON of config state
  }

  if (helperChoice.includes('✅ Add Widget Usage Tracker')) {
    // Placeholder: Append basic analytics tracking to widgets
  }

  if (helperChoice.includes('✅ Seed Sample Widget Data')) {
    // Placeholder: Inject mock MongoDB entries
  }

  if (helperChoice.includes('✅ Backup Current State')) {
    // Placeholder: Zip or copy server/components/Dashboard.jsx to backup dir
  }

  if (helperChoice.includes('✅ Create Route Tester Page')) {
    // Placeholder: Generate basic test.html to validate routes
  }

  // === Install frontend libraries after backend generation ===
  const { execSync } = require('child_process');
  const path = require('path');
  const frontendRoot = path.resolve(__dirname, '../../'); // adjust if needed

  console.log('📦 Installing frontend libraries...');
  try {
    execSync('npm install chart.js react-chartjs-2 react-tsparticles framer-motion lucide-react', {
      cwd: frontendRoot,
      stdio: 'inherit',
    });
    console.log('✅ Frontend libraries installed successfully.');
  } catch (error) {
    console.error('❌ Failed to install frontend libraries:', error.message);
  }
}

// Immediately invoke the main function if this script is run directly
if (require.main === module) {
  runMonsterEngine();
}