const toUpperCaseFirstLetter = require("../src/utils/toUpperCaseFirstLetter");

module.exports = {
    WELCOME: 'Welcome to OAS (Obyte Attestation Service)',
    ADDRESS_RECEIVED: 'Thank you! Your wallet address has been received.',
    HAVE_TO_VERIFY: 'You have to verify your wallet address.',
    INVALID_WALLET_ADDRESS: 'Invalid wallet address. Please enter a 32-character address containing uppercase letters and numbers.',
    ADDRESS_ALREADY_TAKEN: 'Your wallet address has already been verified for this service.',
    INVALID_DATA: 'Invalid data received. Please check our username and visibility settings.',
    REMOVE_ADDRESS_ALREADY_ATTESTED: 'You can\'t remove your wallet address because it has been attested.',
    REMOVE_ADDRESS_NOT_FOUND: 'You can\'t remove your wallet address because it has not been found.',
    CANNOT_FIND_ORDER: 'We cannot find your order. Check your wallet address in attestation provider and try again; Probably we removed your wallet address from attestation provider.',
    ALREADY_ATTESTED: (provider, username, id, address) => `${toUpperCaseFirstLetter(provider) ?? 'Unknown provider'} attestation already exists for ${username ?? 'unknown user'} (ID: ${id ?? 'N/A'}) with the address ${address ?? 'invalid address'}.\n\nIf you want to re-attest with another wallet address, please use /attest command again.`,
    UNKNOWN_COMMAND: 'Unknown command. Please try again.',
}
