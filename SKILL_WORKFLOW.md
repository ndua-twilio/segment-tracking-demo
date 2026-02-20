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

### Phase 2: Generate Content

**Templates Location:** All templates are in `/Users/ndua/Documents/Projects/segment-demo-generator/templates/base/` relative to the skill repository root.

Read `/Users/ndua/Documents/Projects/segment-demo-generator/lib/ai-generator.js` to see the generation guides.

Generate the following based on industry and context (Claude generates this directly, no API calls needed):

**1. Products (5-6 items)**
For each product:
- name: string (2-5 words)
- price: string (formatted as "From $X")
- description: string (2 sentences)
- heroTitle: string (engaging headline)
- heroSubtitle: string (1 sentence)
- ctaText: string (button text like "Get Started")
- badges: array (1-2 tags like ["Popular", "New"])
- colorGradient: string (CSS gradient)

**2. Events Schema**
CRITICAL: Must be INDUSTRY-SPECIFIC (not generic "Product Viewed")

Generate for:
- productViewed: { name: "Industry-specific name", properties: [...] }
- navigationClick: { name: "Navigation Click", properties: [...] }
- ctaClicked: { name: "Industry-specific CTA name", properties: [...] }
- leadSubmitted: { name: "Industry-specific lead name", properties: [...] }
- locationVisit (optional): { name: "Industry-specific location", properties: [...] }

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

3. **Write the processed file** to output location

**Templates to process:**
- `index.html.template` → `index.html`
- `app.js.template` → `app.js`
- `server.js.template` → `server.js`
- `package.json.template` → `package.json`

### Phase 4: Create Demo Files

1. **Create output directory:**
   - Path: `{output-location}/{company-name-slug}-demo/`
   - If exists, ask user if they want to overwrite

2. **Write all generated files** using the Write tool

3. **Run npm install:**
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
- Wait 60s and refresh to see personalization
- Use softReset() or hardReset() in console
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
