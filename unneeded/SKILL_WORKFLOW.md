# Segment Tracking Demo - Claude Workflow

This document describes what Claude should do when a user invokes `/segment-tracking-demo`.

## Overview

This is a **conversational skill**. When invoked, Claude asks questions, generates content, processes templates, and creates a complete demo web application - all within the Claude Code conversation.

## Workflow

### Phase 1: Gather Inputs

Ask the user these questions in the conversation:

1. **Company name:** "What's the company/prospect name?"
   - Validate: Must not be empty
   - Sanitize for folder name:
     - Convert to lowercase
     - Replace spaces with hyphens
     - Remove unsafe filesystem characters: `< > : " / \ | ? *`
     - Example: "Acme Corp" → "acme-corp"

2. **Industry:** "What industry? (e.g., Travel, SaaS, E-Commerce, Healthcare)"
   - Validate: Must not be empty

3. **Segment Write Key:** "What's the Segment Write Key?"
   - Validate: Must be alphanumeric only (no special characters)
   - Should look like: `wdV3vHMn0pqv57pkP4rOItc2oB0j52Rx`

4. **Profiles API Token:** "What's the Profiles API Token?"
   - Validate: Must not be empty
   - Can contain any characters (long token string)

5. **Space ID:** "What's the Space ID?"
   - Validate: Must start with "spa_"
   - Example: `spa_qcqudEXq7zFc6ZtEr56HJT`

6. **Output Location:** "Where should I create the demo? (provide full path or just press enter for current directory)"
   - Default: current working directory
   - Sanitize: Remove any `..` path traversal attempts

7. **Website (optional):** "Company website URL? (optional - helps with context)"

8. **Notes (optional):** "Any notes or context about this prospect? (Gong transcript, use cases, etc.)"

9. **Auto-Instrumentation (optional):** "Do you want to enable Auto-Instrumentation? (yes/no)"
   - Default: no
   - If yes, add the Auto-Instrumentation Signals plugin to the generated demo
   - If no, only include standard Analytics.js

### Phase 2: Generate Content

**Templates Location:** All templates are in `/Users/ndua/Documents/Projects/segment-demo-generator/templates/base/` relative to the skill repository root.

Read `/Users/ndua/Documents/Projects/segment-demo-generator/lib/ai-generator.js` to see the generation guides.

Generate the following based on industry and context (Claude generates this directly, no API calls needed):

**1. Products (flexible count based on industry)**
Generate 3-12 items depending on what makes sense for the industry:
- E-commerce: 6-8 products
- SaaS: 3-4 pricing tiers
- Travel: 4-6 destinations
- Media/Publishing: 5-12 articles
- Other: Use judgment based on industry norms

For each product:
- name: string (2-5 words)
- price: string (flexible format: "From $X", "12 min read", "$X/month", etc.)
- description: string (2 sentences)
- heroTitle: string (engaging headline)
- heroSubtitle: string (1 sentence)
- ctaText: string (button text like "Get Started", "Read Article", etc.)
- badges: array (1-2 tags like ["Popular", "New"])
- colorGradient: string (CSS gradient)

**2. Events Schema**
CRITICAL: Must be INDUSTRY-SPECIFIC (not generic "Product Viewed")

Generate for (industry-specific):
- productViewed: { name: "Industry-specific name", properties: [...] }
- navigationClick: { name: "Navigation Click", properties: [...] }
- ctaClicked: { name: "Industry-specific CTA name", properties: [...] }
- locationVisit (optional): { name: "Industry-specific location", properties: [...] }

Standard events (fixed names):
- User Signed Up: { email, firstName, lastName, method: "email", source: "Website Modal" }
- User Signed In: { email, method: "email", source: "Website Modal" }
- Newsletter Subscribed: { email, source: "Website Newsletter Box" }
- Sign Up Modal Opened: { source: "Navigation" }
- Sign In Modal Opened: { source: "Navigation" }

**3. Traits Schema (snake_case)**
- lastProductViewed: "last_{product}_viewed"
- productsViewedList: "{products}_viewed_list"
- productViewCount: "{product}_view_count"
- lastLocationVisit: "last_{location}_visit" (optional)
- totalWebsiteVisits: "total_website_visits_90d"

**4. Navigation (4-5 items)**
- First: "Home"
- Last: "Contact"
- Middle: Industry-appropriate items

**5. Personalization Messaging**
- welcomeBack: "Welcome back to {Company}!"
- basedOnInterest: "Based on Your Interest"
- recommendedForYou: "Recommended For You"
- continueJourney: "Continue Where You Left Off"
- postPurchase: "Perfect Additions For You"

**6. Colors**
- primary: "#6B8CAE"
- accent: "#52BD95"
- dark: "#2d3748"

### Phase 3: Process Templates

For each template in `templates/base/`:

1. **Read the template file**
2. **Replace variables using these rules:**

**CRITICAL - Template Processing Rules:**
- **ONLY replace {{variables}} with actual values**
- **DO NOT add new functionality, endpoints, or features**
- **DO NOT modify the structure, logic, or output format**
- **DO NOT "improve" or "enhance" the template code**
- **DO NOT add extra console.log statements or elaborate startup messages**
- If the template has 2 endpoints, the output must have exactly 2 endpoints
- If the template has 3 lines of console output, the output must have exactly 3 lines
- Template processing = variable substitution ONLY, nothing more
- The generated file should be identical to the template except for replaced variables

**Simple variable replacement:**
- Pattern: `{{variableName}}`
- Replace with actual value
- Example: `{{companyName}}` → "Acme Travel"

**Nested object access:**
- Pattern: `{{object.property}}`
- Access nested values with dot notation
- Example: `{{colors.primary}}` → "#6B8CAE"
- Example: `{{events.productViewed.name}}` → "Hotel Viewed"

**Array iteration:**
- Pattern: `{{#arrayName}}...content...{{/arrayName}}`
- Loop through array and repeat content for each item
- Inside loop, use `{{.}}` for the item itself, or `{{propertyName}}` for object properties
- Example:
  ```
  {{#products}}
  <div>{{name}} - {{price}}</div>
  {{/products}}
  ```
  Becomes:
  ```
  <div>Beach Resort - From $299/night</div>
  <div>City Hotel - From $189/night</div>
  ```

**Handling missing variables:**
- If a variable doesn't exist, leave the `{{variable}}` as-is (or skip it)
- Don't crash, just continue processing

**IMPORTANT - Technical Implementation:**
- **Read template → Replace in memory → Write final file**
  - Use the Read tool to get template content as a string
  - Do all variable replacements in memory (don't use shell commands like sed/awk/cat)
  - Use the Write tool once with the final processed content
- **DO NOT use shell commands for template processing**
  - AVOID: `sed`, `awk`, `cat`, pipes, or shell redirects
  - USE: Read the template, replace variables as strings, Write the result
- **Write tool works directly for new files**
  - You can write new files directly without reading them first
  - No need to `touch` or create empty files first
- **Example workflow:**
  ```
  1. Read: templates/base/index.html.template
  2. In memory: Replace {{companyName}} with "Acme Corp"
  3. In memory: Replace {{writeKey}} with "abc123"
  4. Write: output-dir/index.html (with all replacements done)
  ```

**CRITICAL - Output Verbosity Rules:**
- **BE CONCISE AND EFFICIENT - Keep responses under 2000 tokens**
- **Show progress updates as you work so the user knows what's happening**
- **Progress format:** "Processing index.html.template..." then "✓ Generated index.html (12KB)"
- **DO NOT output full file contents in responses**
- **DO NOT show the replaced code unless there's an error**
- **DO NOT list all products, events, or traits in detail**
- **Summary format:** "✓ Generated 6 products (Bug Bite Relief, Mosquito Spray, etc.)"
- **Only show code snippets if debugging an error**
- **Update the user every 30-60 seconds with what you're currently working on**
- The goal is to complete file generation efficiently without hitting output limits while keeping the user informed

3. **Write the processed file** to output location

**Templates to process:**
- `index.html.template` → `index.html`
- `app.js.template` → `app.js`
- `server.js.template` → `server.js`
- `package.json.template` → `package.json`

**Auto-Instrumentation Setup (if user selected yes):**

If the user wants Auto-Instrumentation enabled, add these scripts to the generated HTML files:

1. **Add the Signals SDK script** after the Analytics.js snippet:
   ```html
   <!-- Auto-Instrumentation Signals Plugin -->
   <script src="https://cdn.jsdelivr.net/npm/@segment/analytics-signals@2.4.4/dist/umd/analytics-signals.umd.min.js"></script>
   ```

2. **Initialize the plugin** after Analytics.js loads:
   ```html
   <script>
       if (typeof analytics !== 'undefined' && analytics.ready) {
           analytics.ready(function() {
               // Initialize Auto-Instrumentation Signals Plugin
               if (typeof SignalsPlugin !== 'undefined') {
                   try {
                       var signalsPlugin = new SignalsPlugin();
                       analytics.register(signalsPlugin);

                       // Expose for debugging
                       window.signalsPlugin = signalsPlugin;

                       console.log('Auto-Instrumentation Signals enabled! Use ?segment_signals_debug=true to see signals in Event Builder.');
                   } catch (e) {
                       console.error('Auto-Instrumentation setup error:', e);
                   }
               } else {
                   console.warn('SignalsPlugin not found. Auto-Instrumentation may not be available.');
               }
           });
       }
   </script>
   ```

3. **CRITICAL NOTES:**
   - Use the exact CDN URL: `https://cdn.jsdelivr.net/npm/@segment/analytics-signals@2.4.4/dist/umd/analytics-signals.umd.min.js`
   - Must use `new SignalsPlugin()` (with `new` keyword - it's a class constructor)
   - Must call `analytics.register(signalsPlugin)` to register it
   - Expose `window.signalsPlugin` for console debugging
   - Add this to ALL HTML pages in the demo (index.html, creator pages, product pages, etc.)

### Phase 4: Create Demo Files

1. **Create output directory:**
   - Path: `{output-location}/{company-name-slug}-demo/`
   - If exists, ask user if they want to overwrite

2. **Write all generated files** using the Write tool

3. **Create README.md** with:
   - Quick start instructions (npm install, npm start)
   - **IMPORTANT: Note about testing multiple demos** - Must use incognito/private browsing window OR run resetDemo() when testing multiple demos on localhost (localStorage anonymousId persists across demos)
   - Overview of demo features
   - List of pages and tracking events
   - User journey explanation
   - Personalization features
   - Reset demo instructions
   - Configuration details
   - Auto-Instrumentation instructions (if enabled)
   - Testing flows

4. **Run npm install:**
   ```bash
   cd {output-path}/{company-name-slug}-demo
   npm install
   ```

### Phase 5: Show Results

Display a summary:

```
Demo Generated Successfully!

Location: {full-path}

What was created:
- 6 products for {industry} industry
- Industry-specific events (e.g., "Hotel Viewed")
- Sign Up/Sign In modals with authentication tracking
- Newsletter subscription box
- Segment tracking with write key
- Profiles API personalization
- Toast notifications
- Reset functions

Next steps:
1. cd {path}
2. npm start
3. Open index.html in your browser

Demo features:
- Click products to track events
- Sign up or sign in via navigation buttons
- Subscribe to newsletter (bottom-right box)
- Wait 60s and refresh to see personalization
- Use resetDemo() in console or ?reset=true URL parameter
```

## Key Principles

1. **No emojis in code** - Remove all emojis from generated files
2. **Industry-specific events** - Never use generic "Product Viewed", always industry-specific
3. **All GWM references removed** - No mention of GWM anywhere in generated demos
4. **Relative file paths** - All references in generated code are relative
5. **Validate inputs** - Use validators from `lib/validators.js`
6. **Show progress** - Keep user informed during generation
7. **Error handling** - If something fails, explain clearly

## Example Invocation

```
User: /segment-tracking-demo

Claude: I'll help you generate a custom Segment tracking demo!

What's the company/prospect name?

User: Acme Travel

Claude: Great! What industry?

User: Travel

Claude: Perfect! What's the Segment Write Key?

[... continue conversation ...]

Claude: Generating demo content for Acme Travel (Travel industry)...

[Generate products, events, traits, etc.]

Creating demo files...
✓ Generated index.html
✓ Generated app.js
✓ Generated server.js
✓ Generated package.json

Installing dependencies...

Demo Generated Successfully!

Location: /Users/ndua/Documents/Projects/acme-travel-demo

[... show summary ...]
```

## Helper Functions

Use these if needed:

**Validation:**
```javascript
const { validateCompanyName, validateWriteKey, validateApiToken, validateSpaceId } = require('./lib/validators');
```

**Template Processing (optional):**
```javascript
const { replaceVariables } = require('./lib/template-processor');
```

Or just do the variable replacement manually when writing files.

## Notes

- This is a conversational skill, not a script
- User interacts with Claude directly in Claude Code
- No readline or terminal prompts needed
- Claude generates content, processes templates, and creates files
- Everything happens in the Claude Code session
