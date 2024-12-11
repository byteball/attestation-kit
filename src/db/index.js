/**
* Database initialization module
* @module db
*/

/**
 * Initializes the database schema and required tables
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If database initialization fails
 */

module.exports = {
    initialize: require('./initialize'),
}
