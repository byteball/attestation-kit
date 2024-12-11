/**
 * Dictionary module providing localized messages and prompts
 * @module dictionary
 * @property {Object} wallet - Wallet-related messages and prompts
 * @property {Object} common - Common messages shared across the application
 * @function addLocale - Add a new locale to the dictionary
 * @example
 * const { wallet, common } = require('./dictionary');
 * console.log(wallet.SIGN_MESSAGE_PROMPT);
 * console.log(common.INVALID_ADDRESS);
 */

const locales = {
    wallet: require('./wallet.local'),
    common: require('./common.local'),
}

const setLocale = (provider, path) => {
    locales[provider] = require(path);
}

module.exports = {
    ...locales,
    setLocale
}