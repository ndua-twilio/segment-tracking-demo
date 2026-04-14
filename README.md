# Segment Tracking Demo Generator

Generate custom Segment tracking demo websites for prospects.

## Prerequisites

- Node.js 18+
- [Claude Code](https://claude.ai/code)
- Segment account (Write Key, API Token, Space ID)

## Usage

1. Open this project in Claude Code:
   ```bash
   cd segment-tracking-demo
   claude
   ```

2. Say: "Create a demo for [Company Name]"

3. Answer the prompts (company, industry, Segment credentials)

4. Run the generated demo:
   ```bash
   cd generated-demos/[company]-demo
   npm start
   ```

5. Open `index.html` in your browser

## Project Structure

```
├── CLAUDE.md           # Instructions for Claude
├── templates/          # Demo templates
│   └── base/
│       ├── index.html.template
│       ├── app.js.template
│       ├── server.js.template
│       └── package.json.template
└── generated-demos/    # Output folder (gitignored)
```

## Testing Tips

**Reset the demo (start as new anonymous user):**
- Run `resetDemo()` in browser console, or
- Add `?reset=true` to URL

**Testing multiple demos:**
- Use incognito/private window, or reset between demos (localStorage persists on localhost)

**See personalization:**
- Click a few products → refresh page

**View tracked events:**
- Open browser console (logs all events)
- Check Segment Debugger in your workspace

## Demo Features

- Segment Analytics.js tracking
- Industry-specific events
- Sign Up / Sign In flows
- Newsletter subscription
- Profiles API personalization
- Anonymous → Known user stitching

## License

MIT
