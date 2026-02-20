const Anthropic = require('@anthropic-ai/sdk');

// Initialize Anthropic client
// API key will be read from ANTHROPIC_API_KEY environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Generates complete demo configuration using AI
 * @param {object} inputs - User inputs
 * @param {string} inputs.companyName - Company name
 * @param {string} inputs.industry - Industry type
 * @param {string} inputs.writeKey - Segment Write Key
 * @param {string} inputs.apiToken - Profiles API Token
 * @param {string} inputs.spaceId - Segment Space ID
 * @param {string} inputs.aiModel - AI model to use ('opus' or 'sonnet')
 * @param {string} inputs.notes - Optional notes/context
 * @param {string} inputs.website - Optional website URL
 * @returns {Promise<object>} Complete configuration object
 */
async function generateDemoConfig(inputs) {
  console.log(`\n🤖 Generating demo content with Claude ${inputs.aiModel}...\n`);

  // Generate products
  const products = await generateProducts(inputs);

  // Generate events schema (based on industry and products)
  const events = await generateEvents(inputs.industry, products, inputs.aiModel);

  // Generate traits schema
  const traits = await generateTraits(inputs.industry, products, inputs.aiModel);

  // Generate navigation
  const navigation = await generateNavigation(inputs.industry, inputs.aiModel);

  // Generate personalization messaging
  const messaging = await generateMessaging(inputs.companyName, inputs.industry, inputs.aiModel);

  // Return complete configuration
  return {
    companyName: inputs.companyName,
    industry: inputs.industry,
    writeKey: inputs.writeKey,
    apiToken: inputs.apiToken,
    spaceId: inputs.spaceId,
    products,
    events,
    traits,
    navigation,
    messaging,
    colors: {
      primary: '#6B8CAE',
      accent: '#52BD95',
      dark: '#2d3748'
    }
  };
}

/**
 * Generates 5-6 products/services for the demo
 * @param {object} inputs - User inputs with company, industry, notes, website
 * @returns {Promise<Array>} Array of product objects
 */
async function generateProducts(inputs) {
  const prompt = `You are helping create a Segment tracking demo for ${inputs.companyName} in the ${inputs.industry} industry.

Generate 5-6 realistic products or services for this company. Make them specific and relevant to their industry.

${inputs.notes ? `Additional context: ${inputs.notes}` : ''}
${inputs.website ? `Company website: ${inputs.website}` : ''}

For each product, provide:
- name: Concise name (2-5 words)
- price: Realistic price formatted as "From $X" or "Starting at $X/month"
- description: 2 sentences focusing on value proposition
- heroTitle: Engaging headline for hero section (5-8 words)
- heroSubtitle: 1 sentence elaboration of the headline
- ctaText: Action-oriented button text (2-4 words)
- badges: 1-2 relevant tags (e.g., "Popular", "New", "Best Value")
- colorGradient: CSS linear-gradient with professional colors that fit the product

Return ONLY a JSON array of products, no other text. Format:
[
  {
    "name": "Product Name",
    "price": "From $99",
    "description": "Brief description here.",
    "heroTitle": "Headline Here",
    "heroSubtitle": "Subtitle here.",
    "ctaText": "Get Started",
    "badges": ["Popular"],
    "colorGradient": "linear-gradient(135deg, #6B8CAE 0%, #8B9FB8 100%)"
  }
]`;

  const response = await callClaude(prompt, inputs.aiModel);
  const products = JSON.parse(response);

  console.log(`✓ Generated ${products.length} products`);
  return products;
}

/**
 * Generates industry-specific event schema
 * @param {string} industry - Industry type
 * @param {Array} products - Generated products
 * @param {string} model - AI model to use
 * @returns {Promise<object>} Events configuration
 */
async function generateEvents(industry, products, model) {
  const prompt = `For a ${industry} company with products like "${products[0].name}", generate Segment event names and properties.

IMPORTANT: Events must be INDUSTRY-SPECIFIC, not generic.

Bad (generic): "Product Viewed", "Item Added"
Good (industry-specific for Travel): "Hotel Viewed", "Flight Searched", "Booking Started"
Good (industry-specific for SaaS): "Feature Explored", "Plan Compared", "Trial Started"
Good (industry-specific for E-commerce): "Product Browsed", "Cart Updated", "Checkout Initiated"

Generate events for these actions:
1. When user views/interacts with a product
2. When user navigates the site
3. When user clicks a CTA button
4. When user submits the contact/lead form
5. (Optional) Industry-specific location visit event if applicable

For each event, specify:
- name: Industry-specific event name
- properties: Array of property names to track (e.g., ["product_name", "price", "category"])

Return ONLY valid JSON, no other text. Format:
{
  "productViewed": {
    "name": "Hotel Viewed",
    "properties": ["hotel_name", "price", "location", "category"]
  },
  "navigationClick": {
    "name": "Navigation Click",
    "properties": ["section", "text"]
  },
  ...
}`;

  const response = await callClaude(prompt, model);
  const events = JSON.parse(response);

  console.log(`✓ Generated event schema with ${Object.keys(events).length} events`);
  return events;
}

/**
 * Generates industry-specific trait names
 * @param {string} industry - Industry type
 * @param {Array} products - Generated products
 * @param {string} model - AI model to use
 * @returns {Promise<object>} Traits configuration
 */
async function generateTraits(industry, products, model) {
  const prompt = `For a ${industry} company, generate Segment profile trait names (snake_case format).

These traits will be set when users interact with the demo and used for personalization.

Generate trait names for:
1. Last product/service viewed
2. List of all products viewed (array)
3. Count of product views
4. Last location visit date (if applicable to industry)
5. Total website visits in last 90 days

Examples for Travel: last_hotel_viewed, hotels_viewed_list, booking_count
Examples for SaaS: last_feature_viewed, features_explored_list, trial_started_date

Return ONLY valid JSON, no other text. Format:
{
  "lastProductViewed": "last_hotel_viewed",
  "productsViewedList": "hotels_viewed_list",
  "productViewCount": "hotel_view_count",
  "lastLocationVisit": "last_booking_date",
  "totalWebsiteVisits": "total_website_visits_90d"
}`;

  const response = await callClaude(prompt, model);
  const traits = JSON.parse(response);

  console.log(`✓ Generated trait schema with ${Object.keys(traits).length} traits`);
  return traits;
}

/**
 * Generates navigation menu items
 * @param {string} industry - Industry type
 * @param {string} model - AI model to use
 * @returns {Promise<Array>} Array of navigation items
 */
async function generateNavigation(industry, model) {
  const prompt = `For a ${industry} company website, generate 4-5 navigation menu items.

First item should always be "Home". Last should always be "Contact".
Middle items should be industry-appropriate (e.g., Travel: "Hotels", "Flights", "Deals")

Return ONLY a JSON array of strings, no other text.
Example: ["Home", "Products", "Solutions", "Pricing", "Contact"]`;

  const response = await callClaude(prompt, model);
  const navigation = JSON.parse(response);

  console.log(`✓ Generated navigation with ${navigation.length} items`);
  return navigation;
}

/**
 * Generates personalization messages
 * @param {string} companyName - Company name
 * @param {string} industry - Industry type
 * @param {string} model - AI model to use
 * @returns {Promise<object>} Messaging configuration
 */
async function generateMessaging(companyName, industry, model) {
  const prompt = `For ${companyName} in the ${industry} industry, generate personalization messages.

These messages appear in different contexts:
1. welcomeBack: Greeting for returning users
2. basedOnInterest: Section title for anonymous visitors showing related products
3. recommendedForYou: Section title for known high-intent visitors
4. continueJourney: Section title for previously viewed products
5. postPurchase: Section title for customers (upsell/cross-sell)

Keep messages professional, friendly, and industry-appropriate. Use "Your" to make it personal.

Return ONLY valid JSON, no other text. Format:
{
  "welcomeBack": "Welcome back to ${companyName}!",
  "basedOnInterest": "Based on Your Interest 🎯",
  "recommendedForYou": "Recommended For You 🎯",
  "continueJourney": "Continue Where You Left Off",
  "postPurchase": "Perfect Additions For You"
}`;

  const response = await callClaude(prompt, model);
  const messaging = JSON.parse(response);

  console.log(`✓ Generated personalization messaging`);
  return messaging;
}

/**
 * Calls Claude API with a prompt
 * @param {string} prompt - The prompt to send
 * @param {string} modelChoice - 'opus' or 'sonnet'
 * @returns {Promise<string>} Claude's response
 */
async function callClaude(prompt, modelChoice) {
  // Map user choice to actual model IDs
  const modelMap = {
    'opus': 'claude-opus-4-20250514',
    'sonnet': 'claude-sonnet-4-20250514'
  };

  const modelId = modelMap[modelChoice] || modelMap['sonnet'];

  const message = await anthropic.messages.create({
    model: modelId,
    max_tokens: 4096,
    messages: [{
      role: 'user',
      content: prompt
    }]
  });

  return message.content[0].text;
}

// Export main function
module.exports = {
  generateDemoConfig
};
