// Input validation and sanitization functions

/**
 * Validates company name
 * - Must not be empty
 * - Must be safe for folder names (no special chars that break file systems)
 * @param {string} companyName - The company name to validate
 * @returns {object} { valid: boolean, error: string|null, sanitized: string }
 */
function validateCompanyName(companyName) {
  if (!companyName || companyName.trim().length === 0) {
    return { valid: false, error: 'Company name cannot be empty', sanitized: null };
  }

  // Remove characters that are unsafe for folder names
  const sanitized = companyName
    .trim()
    .replace(/[<>:"/\\|?*]/g, '') // Remove filesystem-unsafe characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .toLowerCase();

  if (sanitized.length === 0) {
    return { valid: false, error: 'Company name contains only invalid characters', sanitized: null };
  }

  return { valid: true, error: null, sanitized };
}

/**
 * Validates Segment Write Key
 * - Must not be empty
 * - Should be alphanumeric (Segment format)
 * @param {string} writeKey - The Segment Write Key
 * @returns {object} { valid: boolean, error: string|null }
 */
function validateWriteKey(writeKey) {
  if (!writeKey || writeKey.trim().length === 0) {
    return { valid: false, error: 'Write Key cannot be empty' };
  }

  const trimmed = writeKey.trim();

  // Basic format check (Segment keys are alphanumeric)
  if (!/^[a-zA-Z0-9]+$/.test(trimmed)) {
    return { valid: false, error: 'Write Key should only contain letters and numbers' };
  }

  return { valid: true, error: null };
}

/**
 * Validates Segment Profiles API Token
 * - Must not be empty
 * @param {string} apiToken - The Profiles API Token
 * @returns {object} { valid: boolean, error: string|null }
 */
function validateApiToken(apiToken) {
  if (!apiToken || apiToken.trim().length === 0) {
    return { valid: false, error: 'Profiles API Token cannot be empty' };
  }

  return { valid: true, error: null };
}

/**
 * Validates Segment Space ID
 * - Must not be empty
 * - Should match Segment's space ID format (starts with "spa_")
 * @param {string} spaceId - The Segment Space ID
 * @returns {object} { valid: boolean, error: string|null }
 */
function validateSpaceId(spaceId) {
  if (!spaceId || spaceId.trim().length === 0) {
    return { valid: false, error: 'Space ID cannot be empty' };
  }

  const trimmed = spaceId.trim();

  // Segment Space IDs typically start with "spa_"
  if (!trimmed.startsWith('spa_')) {
    return { valid: false, error: 'Space ID should start with "spa_"' };
  }

  return { valid: true, error: null };
}

/**
 * Validates industry input
 * - Must not be empty
 * @param {string} industry - The industry name
 * @returns {object} { valid: boolean, error: string|null }
 */
function validateIndustry(industry) {
  if (!industry || industry.trim().length === 0) {
    return { valid: false, error: 'Industry cannot be empty' };
  }

  return { valid: true, error: null };
}

/**
 * Sanitizes a file path to ensure it's safe
 * - Removes .. and other path traversal attempts
 * - Normalizes slashes
 * @param {string} path - The path to sanitize
 * @returns {string} Sanitized path
 */
function sanitizePath(path) {
  if (!path) return '';

  return path
    .replace(/\.\./g, '') // Remove path traversal
    .replace(/\/+/g, '/') // Normalize multiple slashes
    .trim();
}

// Export all validation functions
module.exports = {
  validateCompanyName,
  validateWriteKey,
  validateApiToken,
  validateSpaceId,
  validateIndustry,
  sanitizePath
};
