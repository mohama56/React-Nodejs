import axios from 'axios';

// Get API URL from environment or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class MeetingService {
    /**
     * Get all meetings with optional filters
     * @param {Object} filters - Query parameters for filtering meetings
     * @returns {Promise<Array>} - Array of meeting objects
     */
    async getAllMeetings(filters = {}) {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            // Add filters to query params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    queryParams.append(key, value);
                }
            });

            const response = await axios.get(
                `${API_URL}/meeting/?${queryParams.toString()}`,
                { headers: { 'Authorization': token } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching meetings:', error);
            throw error;
        }
    }

    /**
     * Get a single meeting by ID
     * @param {string} id - Meeting ID
     * @returns {Promise<Object>} - Meeting object
     */
    async getMeetingById(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${API_URL}/meeting/view/${id}`,
                { headers: { 'Authorization': token } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching meeting details:', error);
            throw error;
        }
    }

    /**
     * Create a new meeting
     * @param {Object} meetingData - Meeting data to create
     * @returns {Promise<Object>} - Created meeting object
     */
    async createMeeting(meetingData) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/meeting/add`,
                meetingData,
                { headers: { 'Authorization': token } }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating meeting:', error);
            throw error;
        }
    }

    /**
     * Update an existing meeting
     * @param {string} id - Meeting ID to update
     * @param {Object} meetingData - Updated meeting data
     * @returns {Promise<Object>} - Updated meeting object
     */
    async updateMeeting(id, meetingData) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${API_URL}/meeting/edit/${id}`,
                meetingData,
                { headers: { 'Authorization': token } }
            );
            return response.data;
        } catch (error) {
            console.error('Error updating meeting:', error);
            throw error;
        }
    }

    /**
     * Delete a meeting by ID
     * @param {string} id - Meeting ID to delete
     * @returns {Promise<Object>} - Response data
     */
    async deleteMeeting(id) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(
                `${API_URL}/meeting/delete/${id}`,
                { headers: { 'Authorization': token } }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting meeting:', error);
            throw error;
        }
    }

    /**
     * Delete multiple meetings
     * @param {Array<string>} ids - Array of meeting IDs to delete
     * @returns {Promise<Object>} - Response data
     */
    async deleteMultipleMeetings(ids) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/meeting/deleteMany`,
                ids,
                { headers: { 'Authorization': token } }
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting meetings:', error);
            throw error;
        }
    }

    /**
     * Add multiple meetings
     * @param {Array<Object>} meetingsData - Array of meeting data objects
     * @returns {Promise<Array>} - Array of created meetings
     */
    async addMultipleMeetings(meetingsData) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${API_URL}/meeting/addMany`,
                meetingsData,
                { headers: { 'Authorization': token } }
            );
            return response.data;
        } catch (error) {
            console.error('Error creating multiple meetings:', error);
            throw error;
        }
    }
}

export default new MeetingService();