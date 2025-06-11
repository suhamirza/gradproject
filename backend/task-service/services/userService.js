const axios = require('axios');

const USER_SERVICE_URL = 'http://user-service:8080/api';

const getUserProfileById = async (userId) => {
    try {
        const response = await axios.get(`${USER_SERVICE_URL}/users/${userId}/profile`);

        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            throw new Error(`User service error: ${error.response.data.message || error.response.statusText}`);
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('No response received from user service');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(`Error setting up request: ${error.message}`);
        }
    }
}

module.exports = { getUserProfileById };