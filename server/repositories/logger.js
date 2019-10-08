/**
 * Save error on errors hash
 *
 * @param client
 * @param error
 * @returns {Promise<void>}
 */
let saveError = async (client, error) => {
    await client.hmset('errors', new Date().getTime(), error.toString())
};

module.exports = { saveError };
