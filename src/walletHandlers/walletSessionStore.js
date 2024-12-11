const logger = require('../utils/logger');

class SessionStore {
    constructor() {
        this.sessions = new Map();

        // {
        //     "device_address": {
        //         "strategy": "0x1234",
        //         "ts": 123456,
        //     },
        // }
    }

    createSession(deviceAddress, provider) {
        const session = this.sessions.get(deviceAddress);
        
        if (this.sessions.has(deviceAddress)) {
            return session;
        } else {
            const value = new Map([
                ["provider", value],
                ["ts", new Date().getTime()],
            ]);
    

            return this.sessions.set(deviceAddress, value);
        }
    }

    getSession(deviceAddress) {

        if (this.sessions.has(deviceAddress)) {
            return this.sessions.get(deviceAddress);
        } else {
            return null;
        }
    }

    deleteSession(deviceAddress) {
        delete this.sessions[deviceAddress];
    }
}

module.exports = new SessionStore();