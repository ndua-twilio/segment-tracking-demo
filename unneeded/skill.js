/**
 * Segment Tracking Demo Generator - Main Skill
 *
 * This is a Claude Code skill that generates custom Segment tracking demos.
 * When invoked via /segment-tracking-demo, Claude will:
 * 1. Ask the user for inputs (company, industry, credentials, etc.)
 * 2. Generate industry-specific content (products, events, traits, messaging)
 * 3. Process templates with the generated content
 * 4. Create a complete demo web application
 * 5. Initialize npm and display next steps
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { validateCompanyName, validateWriteKey, validateApiToken, validateSpaceId, validateIndustry } = require('./lib/validators');
const { generateDemoConfig } = require('./lib/ai-generator');
const { generateAllFiles } = require('./lib/template-processor');
const { execSync } = require('child_process');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify question
function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

/**
 * Main workflow
 */
async function main() {
    console.log('\n=== Segment Tracking Demo Generator ===\n');
    console.log('This tool will create a custom web application with Segment tracking and personalization.\n');

    try {
        // Step 1: Gather user inputs
        console.log('Step 1: Basic Information\n');

        // Company name
        let companyName, companyNameSlug;
        while (true) {
            companyName = await question('Company name: ');
            const validation = validateCompanyName(companyName);
            if (validation.valid) {
                companyNameSlug = validation.sanitized;
                break;
            }
            console.log(`Error: ${validation.error}\n`);
        }

        // Industry
        let industry;
        while (true) {
            industry = await question('Industry (e.g., Travel, SaaS, E-Commerce): ');
            const validation = validateIndustry(industry);
            if (validation.valid) break;
            console.log(`Error: ${validation.error}\n`);
        }

        console.log('\nStep 2: Segment Credentials\n');

        // Segment Write Key
        let writeKey;
        while (true) {
            writeKey = await question('Segment Write Key: ');
            const validation = validateWriteKey(writeKey);
            if (validation.valid) break;
            console.log(`Error: ${validation.error}\n`);
        }

        // Profiles API Token
        let apiToken;
        while (true) {
            apiToken = await question('Profiles API Token: ');
            const validation = validateApiToken(apiToken);
            if (validation.valid) break;
            console.log(`Error: ${validation.error}\n`);
        }

        // Space ID
        let spaceId;
        while (true) {
            spaceId = await question('Space ID: ');
            const validation = validateSpaceId(spaceId);
            if (validation.valid) break;
            console.log(`Error: ${validation.error}\n`);
        }

        console.log('\nStep 3: Customization (Optional)\n');

        // AI Model choice
        const aiModel = await question('AI model (opus/sonnet) [sonnet]: ') || 'sonnet';

        // Output directory
        const outputDir = await question('Output directory (default: current directory): ') || '.';

        // Optional inputs
        const website = await question('Company website (optional): ');
        const notes = await question('Additional notes/context (optional): ');

        rl.close();

        // Step 2: Generate content
        console.log('\n=== Generating Demo Content ===\n');

        const inputs = {
            companyName,
            companyNameSlug,
            industry,
            writeKey,
            apiToken,
            spaceId,
            aiModel: aiModel.toLowerCase(),
            website,
            notes
        };

        // Call AI generator (Claude will read the guide and generate content)
        const config = await generateDemoConfig(inputs);

        // Step 3: Create output directory
        const demoPath = path.join(outputDir, `${companyNameSlug}-demo`);
        console.log(`\nCreating demo at: ${demoPath}\n`);

        if (fs.existsSync(demoPath)) {
            console.log(`Warning: Directory ${demoPath} already exists. Overwriting...\n`);
        } else {
            fs.mkdirSync(demoPath, { recursive: true });
        }

        // Step 4: Generate all files from templates
        generateAllFiles(config, demoPath);

        // Step 5: Install dependencies
        console.log('\nInstalling dependencies...\n');
        try {
            execSync('npm install', {
                cwd: demoPath,
                stdio: 'inherit'
            });
            console.log('\nDependencies installed successfully!\n');
        } catch (error) {
            console.error('Error installing dependencies:', error.message);
            console.log('You can manually run "npm install" later.\n');
        }

        // Step 6: Display success message
        console.log('\n=== Demo Generated Successfully! ===\n');
        console.log(`Demo created at: ${demoPath}\n`);
        console.log('Next steps:');
        console.log(`  1. cd ${demoPath}`);
        console.log('  2. npm start');
        console.log('  3. Open index.html in your browser\n');
        console.log('The demo includes:');
        console.log(`  - ${config.products.length} industry-specific products`);
        console.log('  - Segment Analytics.js tracking');
        console.log('  - Profiles API personalization');
        console.log('  - Toast notifications for events');
        console.log('  - Reset functions (softReset/hardReset)\n');

    } catch (error) {
        console.error('\nError:', error.message);
        process.exit(1);
    }
}

// Run the skill
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = { main };
