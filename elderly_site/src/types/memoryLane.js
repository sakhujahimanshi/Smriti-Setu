/**
 * Memory Lane Type Definitions & JSDoc Schemas
 * Authoritative schema decoupling game state identity from localized presentation.
 */

/**
 * @typedef {'en' | 'bn' | 'as' | 'ne'} SupportedLang
 */

/**
 * @typedef {'granddaughter' | 'niece' | 'daughter' | 'son' | 'grandson'} RelationKey
 */

/**
 * @typedef {Object} OptionItem
 * @property {string} id - Static neutral identity for scoring/matching (e.g., "maina")
 * @property {Record<SupportedLang, string>} personName - Localized names
 * @property {RelationKey} relationKey - Static key for relationship lookup
 */

/**
 * @typedef {Object} LocalizedContent
 * @property {string} question - Spoken/rendered question for this language
 * @property {string} clue - Gentle, dignified clue
 * @property {string} story - 2-sentence warm reminiscence story
 * @property {string} correctFeedback - Dignified affirmation
 * @property {string} incorrectFeedback - Gentle encouragement
 */

/**
 * @typedef {Object} MemoryItem
 * @property {string} id - Unique item identifier
 * @property {string} imageSrc - Photo URL
 * @property {string} targetId - Matches option.id for language-neutral validation
 * @property {OptionItem[]} options - List of choices
 * @property {Record<SupportedLang, LocalizedContent>} content - Localized text & TTS prompts
 */
