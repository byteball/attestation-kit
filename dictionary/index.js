/**
 * Dictionary module providing localized messages and prompts
 * @module dictionary
 * @property {Object} wallet - Wallet-related messages and prompts
 * @property {Object} common - Common messages shared across the application
 */
module.exports = {
    wallet: require('./wallet.local'),
    common: require('./common.local'),
}
