const fs = require('fs');
const path = require('path');

/**
 * Loads a template file from disk
 * @param {string} templatePath - Absolute path to template file
 * @returns {string} Template content
 */
function loadTemplate(templatePath) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${templatePath}`);
  }
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Replaces variables in template with actual values
 * Supports:
 * - Simple variables: {{variable}}
 * - Nested access: {{object.property}}
 * - Array iteration: {{#array}}...{{/array}}
 * - Array item access: {{.}} inside loops
 *
 * @param {string} template - Template string with {{variables}}
 * @param {object} data - Data object with values
 * @returns {string} Processed template
 */
function replaceVariables(template, data) {
  let result = template;

  // Handle array iterations: {{#arrayName}}...{{/arrayName}}
  const arrayPattern = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
  result = result.replace(arrayPattern, (match, arrayName, innerTemplate) => {
    const array = getNestedValue(data, arrayName);

    if (!Array.isArray(array)) {
      return ''; // If not an array, remove the section
    }

    // Process each array item
    return array.map(item => {
      let itemResult = innerTemplate;

      // Replace {{.}} with the item itself (for primitive arrays)
      itemResult = itemResult.replace(/\{\{\.\}\}/g, item);

      // Replace {{propertyName}} with item properties (for object arrays)
      if (typeof item === 'object') {
        itemResult = replaceSimpleVariables(itemResult, item);
      }

      return itemResult;
    }).join('');
  });

  // Handle simple variables and nested access
  result = replaceSimpleVariables(result, data);

  return result;
}

/**
 * Replaces simple variables: {{var}} and {{object.property}}
 * @param {string} template - Template string
 * @param {object} data - Data object
 * @returns {string} Processed template
 */
function replaceSimpleVariables(template, data) {
  // Match {{variable}} or {{object.nested.property}}
  const simplePattern = /\{\{([\w.]+)\}\}/g;

  return template.replace(simplePattern, (match, path) => {
    const value = getNestedValue(data, path);
    return value !== undefined ? value : match; // Keep {{var}} if not found
  });
}

/**
 * Gets a nested value from an object using dot notation
 * Example: getNestedValue({user: {name: 'John'}}, 'user.name') => 'John'
 * @param {object} obj - Object to search
 * @param {string} path - Dot-separated path (e.g., 'user.name')
 * @returns {any} Value at path, or undefined
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Generates a single file from a template
 * @param {string} templatePath - Path to template file
 * @param {object} data - Data for variable replacement
 * @param {string} outputPath - Where to save the generated file
 */
function generateFile(templatePath, data, outputPath) {
  const template = loadTemplate(templatePath);
  const processed = replaceVariables(template, data);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, processed, 'utf8');
  console.log(`✓ Generated: ${outputPath}`);
}

/**
 * Generates all demo files from templates
 * @param {object} config - Complete configuration from AI generator
 * @param {string} outputDir - Directory where demo will be created
 */
function generateAllFiles(config, outputDir) {
  const templatesDir = path.join(__dirname, '..', 'templates', 'base');

  // Define template → output mappings
  const files = [
    { template: 'index.html.template', output: 'index.html' },
    { template: 'app.js.template', output: 'app.js' },
    { template: 'server.js.template', output: 'server.js' },
    { template: 'package.json.template', output: 'package.json' }
    // Note: RUN_DEMO.md.template deferred until later
  ];

  console.log(`\nGenerating demo files in: ${outputDir}\n`);

  // Generate each file
  files.forEach(({ template, output }) => {
    const templatePath = path.join(templatesDir, template);
    const outputPath = path.join(outputDir, output);
    generateFile(templatePath, config, outputPath);
  });

  console.log(`\n✓ All files generated successfully!`);
}

// Export functions
module.exports = {
  loadTemplate,
  replaceVariables,
  generateFile,
  generateAllFiles
};
