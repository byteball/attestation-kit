const storage = require('node-persist');
const { customAlphabet } = require('nanoid');

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SESSIONS_FOLDER_NAME = ".sessions";

class SessionStore {
    constructor() {
        storage.init({
            dir: './' + SESSIONS_FOLDER_NAME,
            stringify: JSON.stringify,
            parse: JSON.parse,
            encoding: 'utf8',
            logging: false,
            writeQueue: true,
            continuous: true,
            interval: false,
            ttl: false // lifetime
        });
    }

    async createSession(deviceAddress, replace = false) {
        const session = await storage.getItem(deviceAddress);

        if (session && !replace) {
            return session;
        } else {
            const id = customAlphabet(ALPHABET, 5)();
            const value = {
                id: id,
                ts: new Date().getTime(),
            };

            await storage.setItem(deviceAddress, value);
            return value;
        }
    }

    async setSessionWalletAddress(deviceAddress, walletAddress) {
        const session = await storage.getItem(deviceAddress);
        if (session) {
            session.wallet = walletAddress;
            await storage.setItem(deviceAddress, session);
        } else {
            console.error(`Session not found for device address: ${deviceAddress}`);
        }
    }

    async deleteSessionWalletAddress(deviceAddress) {
        const session = await storage.getItem(deviceAddress);
        if (session) {
            delete session.wallet;
            await storage.setItem(deviceAddress, session);
        } else {
            console.error(`Session not found for device address: ${deviceAddress}`);
        }
    }

    async getSessionWalletAddress(deviceAddress) {
        const session = await storage.getItem(deviceAddress);
        return session ? session.wallet : null;
    }

    async getSession(deviceAddress) {
        return await storage.getItem(deviceAddress);
    }

    async deleteSession(deviceAddress) {
        await storage.removeItem(deviceAddress);
    }
}

const sessionStore = new SessionStore();

module.exports = sessionStore;