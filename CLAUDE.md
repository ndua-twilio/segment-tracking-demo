# Segment Tracking Demo Generator

This project generates custom Segment tracking demo websites for prospects.

## How to Use

When the user wants to create a demo, they might say:
- "Create a demo for [Company]"
- "New demo"
- "Generate a Segment demo"
- "Demo for [Company] in [Industry]"

When you see these triggers, start the workflow below.

## Workflow

### Phase 1: Gather Inputs

Ask these questions (one at a time or batched based on context):

| Input | Question | Validation |
|-------|----------|------------|
| Company name | "What's the company/prospect name?" | Required. Sanitize for folder: lowercase, hyphens, no special chars |
| Industry | "What industry? (e.g., Travel, SaaS, E-Commerce, Healthcare, Media)" | Required |
| Write Key | "What's the Segment Write Key?" | Required. Alphanumeric only |
| API Token | "What's the Profiles API Token?" | Required |
| Space ID | "What's the Space ID?" | Required. Must start with `spa_` |
| Website | "Company website URL? (optional)" | Optional. Helps with context |
| Notes | "Any notes or context? (Gong transcript, use cases, etc.)" | Optional |
| Auto-Instrumentation | "Enable Auto-Instrumentation? (yes/no)" | Optional. Default: no |

### Phase 2: Generate Content

Generate industry-specific content:

**Products (3-12 based on industry)**
```
{
  name: "Product Name",
  price: "From $X" or "X min read" etc.,
  description: "Two sentences about value.",
  heroTitle: "Engaging headline",
  heroSubtitle: "One sentence elaboration",
  ctaText: "Action button text",
  badges: ["Popular", "New"],
  colorGradient: "linear-gradient(135deg, #COLOR1 0%, #COLOR2 100%)"
}
```

**Events (MUST be industry-specific)**
- Bad: "Product Viewed" (generic)
- Good: "Hotel Viewed", "Article Read", "Plan Compared" (industry-specific)

Generate:
- productViewed: Industry-specific name + properties
- navigationClick: "Navigation Click"
- ctaClicked: Industry-specific CTA name
- Standard events: User Signed Up, User Signed In, Newsletter Subscribed

**Traits (snake_case)**
- `last_{product}_viewed`
- `{products}_viewed_list`
- `{product}_view_count`
- `total_website_visits_90d`

**Navigation:** 4-5 items. First: "Home", Last: "Contact", Middle: Industry-appropriate

**Colors:** Pick appropriate colors or use defaults (#6B8CAE, #52BD95, #2d3748)

### Phase 3: Process Templates

Templates are in `templates/base/`:
- `index.html.template` → `index.html`
- `app.js.template` → `app.js`
- `server.js.template` → `server.js`
- `package.json.template` → `package.json`

**Variable Replacement Rules:**

Simple: `{{variableName}}` → actual value

Nested: `{{object.property}}` → nested value (e.g., `{{colors.primary}}`)

Arrays:
```
{{#products}}
<div>{{name}} - {{price}}</div>
{{/products}}
```

**CRITICAL:**
- ONLY replace variables, don't add/modify functionality
- Read template → Replace in memory → Write file
- Don't use sed/awk/shell commands for replacement

### Phase 4: Create Demo Files

1. Create folder: `generated-demos/{company-slug}-demo/`
2. Write processed files (index.html, app.js, server.js, package.json)
3. Create README.md with:
   - Quick start (npm install, npm start)
   - Testing note: Use incognito or resetDemo() between tests
   - Events list
   - Testing flows
4. Run `npm install`

### Phase 5: Show Results

```
Demo Generated Successfully!

Location: generated-demos/{company}-demo/

Created:
- X products for {industry}
- Industry-specific events
- Sign Up/Sign In modals
- Newsletter subscription
- Profiles API personalization
- Reset functions

Next steps:
1. cd generated-demos/{company}-demo
2. npm start
3. Open index.html in browser
```

## Auto-Instrumentation (Optional)

If enabled, add after Analytics.js in HTML:

```html
<script src="https://cdn.jsdelivr.net/npm/@segment/analytics-signals@2.4.4/dist/umd/analytics-signals.umd.min.js"></script>
<script>
    analytics.ready(function() {
        if (typeof SignalsPlugin !== 'undefined') {
            var signalsPlugin = new SignalsPlugin();
            analytics.register(signalsPlugin);
            window.signalsPlugin = signalsPlugin;
        }
    });
</script>
```

## Template Variables Reference

| Variable | Example |
|----------|---------|
| `{{companyName}}` | "Acme Travel" |
| `{{companyNameSlug}}` | "acme-travel" |
| `{{industry}}` | "Travel" |
| `{{writeKey}}` | "abc123xyz" |
| `{{apiToken}}` | "BI3XBZ..." |
| `{{spaceId}}` | "spa_xxx" |
| `{{colors.primary}}` | "#6B8CAE" |
| `{{colors.accent}}` | "#52BD95" |
| `{{colors.dark}}` | "#2d3748" |
| `{{events.productViewed.name}}` | "Hotel Viewed" |
| `{{events.navigationClick.name}}` | "Navigation Click" |
| `{{events.ctaClicked.name}}` | "Booking CTA Clicked" |
| `{{traits.lastProductViewed}}` | "last_hotel_viewed" |
| `{{traits.productsViewedList}}` | "hotels_viewed_list" |
| `{{traits.productViewCount}}` | "hotel_view_count" |
| `{{traits.totalWebsiteVisits}}` | "total_website_visits_90d" |
| `{{messaging.welcomeBack}}` | "Welcome back to Acme!" |
| `{{messaging.continueJourney}}` | "Continue Where You Left Off" |
| `{{messaging.recommendedForYou}}` | "Recommended For You" |
| `{{messaging.basedOnInterest}}` | "Based on Your Interest" |
| `{{messaging.postPurchase}}` | "Perfect Additions For You" |
| `{{#products}}...{{/products}}` | Loop through products array |
| `{{#navigation}}...{{/navigation}}` | Loop through nav items |
| `{{#badges}}...{{/badges}}` | Loop through product badges |

## Key Rules

1. **Industry-specific events** - Never use generic "Product Viewed"
2. **snake_case traits** - Always use snake_case for trait names
3. **No emojis in code** - Keep generated code clean
4. **Be concise** - Show progress, don't dump full file contents
5. **Output to generated-demos/** - All demos go in this folder

## Example

```
User: Create a demo for Acme Travel

Claude: I'll create a Segment tracking demo for Acme Travel!

What industry? (e.g., Travel, SaaS, E-Commerce)

User: Travel

Claude: What's the Segment Write Key?

User: abc123xyz

[... gather remaining inputs ...]

Claude: Generating demo...

✓ Generated 5 products (Beach Resort, City Hotel, etc.)
✓ Processed index.html
✓ Processed app.js
✓ Processed server.js
✓ Processed package.json
✓ Created README.md
✓ Installed dependencies

Demo Generated Successfully!
Location: generated-demos/acme-travel-demo/
```
