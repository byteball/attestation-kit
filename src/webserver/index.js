const conf = require('ocore/conf.js');
const fastify = require('fastify');
const CORS = require('@fastify/cors');
const fastifySensible = require('@fastify/sensible');

const logger = require('../utils/logger');

// Controllers
const notFoundController = require('./controllers/notFoundController');
// const verifyUrlController = require('./controllers/verifyUrlController');

// Create instance
const fastifyInstance = fastify({ logger: false });

// CORS
fastifyInstance.register(CORS);

// Register error generator
fastifyInstance.register(fastifySensible);

// Register routes
// fastifyInstance.get('/verify/:service_provider/:address/:user_id/:username', verifyUrlController);
fastifyInstance.setNotFoundHandler(notFoundController);

// Run the server
module.exports = async (port) => {
    try {
        return await fastifyInstance.listen({ port: port ?? conf.webserverPort, host: '0.0.0.0' });
    } catch (err) {
        logger.error(err);
        process.exit(1);
    }
}
