const logger = require('./logger');
const validationFunc = require('./Validation');

module.exports = async (deviceAddress, dataString) => {
    const validation = require('ocore/validation.js');

    if (typeof dataString !== 'string') {
        throw new Error('Expected data to be a string');
    }
    
    console.error('dataString', dataString);

    const arrSignedMessageMatches = dataString.match(/\(signed-message:(.+?)\)/);

    if (!arrSignedMessageMatches || arrSignedMessageMatches.length < 2) throw new Error('Invalid format');

    const signedMessageBase64 = arrSignedMessageMatches[1];
    const signedMessageJson = Buffer.from(signedMessageBase64, 'base64').toString('utf8');
    let objSignedMessage;

    try {
        objSignedMessage = JSON.parse(signedMessageJson);
    } catch (err) {
        throw new Error('Failed to parse signed message JSON');
    }

    return new Promise((resolve, reject) => {

        validation.validateSignedMessage(objSignedMessage, async err => {
            if (err) return reject({ error: 'Signature validation failed' });

            if (!objSignedMessage.authors || objSignedMessage.authors.length === 0) {
                return reject({ error: 'Validation failed' });
            }

            const { signed_message, authors: [{ address: senderWalletAddress }] } = objSignedMessage;

            try {
                console.error('signed_message', signed_message.trim());

                const signedData = JSON.parse(signed_message.trim());
                const { message, data } = signedData;

                logger.error('signedData', signedData, data);
                let attestationWalletAddress = data?.address;

                if (message && message.includes('I own the address:')) {
                    attestationWalletAddress = message.replace('I own the address: ', '').trim();

                    if (!validationFunc.isWalletAddress(attestationWalletAddress)) {
                        return reject({ error: 'Invalid format' });
                    }
                }

                return resolve({ message, data, senderWalletAddress, attestationWalletAddress, deviceAddress });
            } catch (err) {
                logger.error('Error in signed message:', err);
                reject({ error: 'Unknown error! Please try again.' });
            }
        });
    });
}