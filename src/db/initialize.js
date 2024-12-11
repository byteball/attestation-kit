const fs = require('fs');
const db = require('ocore/db.js');
const path = require('path');
const logger = require('../utils/logger');

module.exports = async () => {
    try {

        const db_sql = await fs.promises.readFile(path.resolve(__dirname, 'db.sql'), 'utf8');

        const queries = db_sql.split('-- query separator')
            .map(sql => sql.trim())
            .filter(sql => sql);

        for (const sql of queries) {
            await db.query(sql);
        }

        logger.info('Database initialized');
    } catch (error) {
        logger.error('Database initialization failed:' , error);

        try {
            await db.close();
        } catch (closeError) {
            logger.error('Error closing database:' , closeError);
        }

        throw error; // Propagate the error to allow parent modules to handle it
    }
}
