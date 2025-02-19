module.exports = {
    ASK_VERIFY_FN: (address, data) => `Please sign this message to prove that you own the address: [${address}](sign-message-request: I own the address: ${address}` + (data ? `. And I want to attest the following data: ${Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ')})` : ')'),
    INVALID_FORMAT_SIGNED_MESSAGE: 'The signed message format is invalid. Please check and try again.',
    VALIDATION_FAILED: 'Validation failed. Please try again.',
    MISMATCH_DATA: 'The username in the signed message does not match the order. Please verify and try again.',
    MISMATCH_ADDRESS: 'The wallet address in the signed message does not match the provided address.',
    SIGNED_MSG_MISS_ADDRESS: 'Wallet address is missing in the signed message. Please check and try again.',
    ORDER_ALREADY_ATTESTED: 'Your order has already been attested.',
    ASK_ADDRESS: 'Please send me your address that you wish to attest (click ... and Insert my address)',
}
