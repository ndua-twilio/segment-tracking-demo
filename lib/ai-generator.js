/**
 * AI Content Generation Guide
 *
 * This file defines the structure and requirements for AI-generated content.
 * When the skill runs, Claude will read these instructions and generate
 * appropriate content based on user inputs.
 *
 * No API calls needed - Claude executing the skill generates content directly.
 */

/**
 * Content generation instructions for Claude
 *
 * When skill.js calls generateDemoConfig(), Claude should:
 * 1. Read the user inputs (company, industry, notes, etc.)
 * 2. Generate products following the schema below
 * 3. Generate events (industry-specific, not generic)
 * 4. Generate traits (snake_case format)
 * 5. Generate navigation items
 * 6. Generate personalization messaging
 * 7. Return a complete config object
 */

/**
 * PRODUCTS GENERATION GUIDE
 *
 * Generate 5-6 realistic products/services for the company.
 *
 * Requirements:
 * - Specific to the industry and company
 * - Use any provided notes/website context
 * - Professional and realistic
 *
 * Schema for each product:
 * {
 *   name: string (2-5 words, concise)
 *   price: string (formatted as "From $X" or "Starting at $X/month")
 *   description: string (2 sentences, focus on value proposition)
 *   heroTitle: string (engaging headline, 5-8 words)
 *   heroSubtitle: string (1 sentence elaboration)
 *   ctaText: string (action-oriented, 2-4 words like "Get Started", "Learn More")
 *   badges: array (1-2 tags like ["Popular", "New", "Best Value"])
 *   colorGradient: string (CSS linear-gradient with professional colors)
 * }
 *
 * Example for Travel industry:
 * {
 *   name: "Luxury Beach Resort",
 *   price: "From $299/night",
 *   description: "Experience paradise with oceanfront suites and world-class amenities. Perfect for romantic getaways and family vacations.",
 *   heroTitle: "Luxury Beach Resort - Your Paradise Awaits",
 *   heroSubtitle: "Unwind in oceanfront luxury with pristine beaches and exceptional service.",
 *   ctaText: "Book Now",
 *   badges: ["Popular", "Beachfront"],
 *   colorGradient: "linear-gradient(135deg, #6B8CAE 0%, #8B9FB8 100%)"
 * }
 */

/**
 * EVENTS GENERATION GUIDE
 *
 * Generate industry-specific Segment event names and properties.
 *
 * CRITICAL: Events must be INDUSTRY-SPECIFIC, not generic!
 *
 * Bad (generic): "Product Viewed", "Item Added"
 * Good (Travel): "Hotel Viewed", "Flight Searched", "Booking Started"
 * Good (SaaS): "Feature Explored", "Plan Compared", "Trial Started"
 * Good (E-commerce): "Product Browsed", "Cart Updated", "Checkout Initiated"
 *
 * Generate events for:
 * 1. productViewed - When user views/interacts with a product
 * 2. navigationClick - When user navigates the site
 * 3. ctaClicked - When user clicks a CTA button
 * 4. leadSubmitted - When user submits contact/lead form
 * 5. locationVisit - (Optional) Industry-specific location visit if applicable
 *
 * Schema for each event:
 * {
 *   name: string (industry-specific event name)
 *   properties: array of strings (property names to track)
 * }
 *
 * Example for Travel industry:
 * {
 *   productViewed: {
 *     name: "Hotel Viewed",
 *     properties: ["hotel_name", "price_per_night", "location", "star_rating"]
 *   },
 *   navigationClick: {
 *     name: "Navigation Click",
 *     properties: ["section", "text"]
 *   },
 *   ctaClicked: {
 *     name: "Booking CTA Clicked",
 *     properties: ["button_text", "location"]
 *   },
 *   leadSubmitted: {
 *     name: "Travel Inquiry Submitted",
 *     properties: ["interested_in", "form_location", "lead_source"]
 *   },
 *   locationVisit: {
 *     name: "Property Visit Scheduled",
 *     properties: ["property_name", "visit_date", "source"]
 *   }
 * }
 */

/**
 * TRAITS GENERATION GUIDE
 *
 * Generate industry-specific Segment profile trait names.
 * Format: snake_case
 *
 * Generate traits for:
 * 1. lastProductViewed - Last product/service user viewed
 * 2. productsViewedList - Array of all products viewed
 * 3. productViewCount - Count of product views
 * 4. lastLocationVisit - Last location visit date (if applicable)
 * 5. totalWebsiteVisits - Total visits in last 90 days
 *
 * Examples:
 * - Travel: last_hotel_viewed, hotels_viewed_list, booking_count
 * - SaaS: last_feature_viewed, features_explored_list, trial_started_date
 * - E-commerce: last_product_browsed, products_viewed_list, cart_value
 *
 * Schema:
 * {
 *   lastProductViewed: string (snake_case trait name)
 *   productsViewedList: string (snake_case trait name)
 *   productViewCount: string (snake_case trait name)
 *   lastLocationVisit: string (snake_case trait name, optional)
 *   totalWebsiteVisits: string (snake_case trait name)
 * }
 */

/**
 * NAVIGATION GENERATION GUIDE
 *
 * Generate 4-5 navigation menu items for the website.
 *
 * Requirements:
 * - First item: Always "Home"
 * - Last item: Always "Contact"
 * - Middle items: Industry-appropriate (2-3 items)
 *
 * Examples:
 * - Travel: ["Home", "Hotels", "Flights", "Deals", "Contact"]
 * - SaaS: ["Home", "Features", "Pricing", "Resources", "Contact"]
 * - E-commerce: ["Home", "Shop", "Collections", "Sale", "Contact"]
 *
 * Schema: Array of strings
 */

/**
 * MESSAGING GENERATION GUIDE
 *
 * Generate personalization messages for different contexts.
 * Keep professional, friendly, and industry-appropriate.
 *
 * Messages needed:
 * 1. welcomeBack - Greeting for returning users
 * 2. basedOnInterest - Section title for anonymous visitors (related products)
 * 3. recommendedForYou - Section title for known high-intent visitors
 * 4. continueJourney - Section title for previously viewed products
 * 5. postPurchase - Section title for customers (upsell/cross-sell)
 *
 * Schema:
 * {
 *   welcomeBack: string (e.g., "Welcome back to [Company]!")
 *   basedOnInterest: string (e.g., "Based on Your Interest 🎯")
 *   recommendedForYou: string (e.g., "Recommended For You 🎯")
 *   continueJourney: string (e.g., "Continue Where You Left Off")
 *   postPurchase: string (e.g., "Perfect Additions For You")
 * }
 */

/**
 * Placeholder function - actual generation happens when Claude executes the skill
 *
 * When skill.js calls this function, Claude should:
 * 1. Read all the generation guides above
 * 2. Use the user inputs to generate appropriate content
 * 3. Return a complete config object with all generated content
 *
 * @param {object} inputs - User inputs
 * @returns {object} Complete configuration for demo generation
 */
function generateDemoConfig(inputs) {
  // This function serves as documentation for what Claude should generate
  // When the skill runs, Claude will see these requirements and generate
  // content directly based on the guides above

  return {
    companyName: inputs.companyName,
    industry: inputs.industry,
    writeKey: inputs.writeKey,
    apiToken: inputs.apiToken,
    spaceId: inputs.spaceId,
    // Claude will generate these following the guides above:
    products: [], // 5-6 products following PRODUCTS GENERATION GUIDE
    events: {}, // Event schema following EVENTS GENERATION GUIDE
    traits: {}, // Trait schema following TRAITS GENERATION GUIDE
    navigation: [], // Nav items following NAVIGATION GENERATION GUIDE
    messaging: {}, // Messages following MESSAGING GENERATION GUIDE
    colors: {
      primary: '#6B8CAE',
      accent: '#52BD95',
      dark: '#2d3748'
    }
  };
}

// Export the generation guide
module.exports = {
  generateDemoConfig
};
