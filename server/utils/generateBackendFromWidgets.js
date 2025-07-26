

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to widgets
const widgetsDir = path.resolve(__dirname, '../../client/src/components/widgets');
const outputRoutesDir = path.resolve(__dirname, '../routes');
const outputControllersDir = path.resolve(__dirname, '../controllers');
const outputModelsDir = path.resolve(__dirname, '../models');

// Convert simple schema object to Mongoose schema
function schemaToMongoose(schemaObj) {
  return Object.entries(schemaObj)
    .map(([key, type]) => `  ${key}: { type: ${type}, required: true },`)
    .join('\n');
}

function generateFiles(config, widgetName) {
  const routeName = widgetName.toLowerCase();

  const model = `
import mongoose from 'mongoose';

const ${widgetName}Schema = new mongoose.Schema({
${schemaToMongoose(config.schema)}
}, { timestamps: true });

export default mongoose.model('${widgetName}', ${widgetName}Schema);
`;

  const controller = `
import ${widgetName} from '../models/${widgetName}.js';

export const getAll = async (req, res) => {
  const data = await ${widgetName}.find();
  res.json(data);
};

export const create = async (req, res) => {
  const created = await ${widgetName}.create(req.body);
  res.status(201).json(created);
};
`;

  const route = `
import express from 'express';
import { getAll, create } from '../controllers/${widgetName}.controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

${config.requiresAuth ? 'router.use(authMiddleware);' : ''}

router.get('/', getAll);
router.post('/', create);

export default router;
`;

  fs.writeFileSync(path.join(outputModelsDir, `${widgetName}.js`), prettier.format(model, { parser: 'babel' }));
  fs.writeFileSync(path.join(outputControllersDir, `${widgetName}.controller.js`), prettier.format(controller, { parser: 'babel' }));
  fs.writeFileSync(path.join(outputRoutesDir, `${widgetName}.routes.js`), prettier.format(route, { parser: 'babel' }));
}

function extractConfigFromWidget(widgetPath) {
  const content = fs.readFileSync(widgetPath, 'utf8');
  const match = content.match(/export const widgetConfig = ({[\s\S]*?})/);
  if (!match) return null;
  try {
    return eval(`(${match[1]})`);
  } catch (e) {
    console.error('Failed to parse widgetConfig in:', widgetPath);
    return null;
  }
}

function run() {
  const files = fs.readdirSync(widgetsDir).filter((file) => file.endsWith('.widget.jsx'));

  files.forEach((file) => {
    const fullPath = path.join(widgetsDir, file);
    const config = extractConfigFromWidget(fullPath);
    if (config) {
      const name = config.name || path.basename(file, '.widget.jsx');
      generateFiles(config, name);
      console.log(`✔ Generated backend files for widget: ${name}`);
    } else {
      console.warn(`⚠ Skipped ${file} — no valid widgetConfig found.`);
    }
  });
}

run();