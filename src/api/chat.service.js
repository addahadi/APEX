import api from './api';

export const chatService = {
  /**
   * Fetch predefined questions for a specific display location
   * @param {string} displayLocation - The location context (e.g., DASHBOARD, ESTIMATION)
   */
  getQuestions: async (displayLocation) => {
    const response = await api.post('/ai/questions', { 
      display_location: displayLocation 
    });
    return response;
  },

  /**
   * Fetch a specific FAQ answer by question ID
   * @param {string} questionId - The ID of the question
   * @param {string} language - 'en' or 'ar'
   */
  getAnswer: async (questionId, language = 'en') => {
    const response = await api.post(`/ai/faq/${questionId}`, { 
      language 
    });
    return response;
  },

  /**
   * Ask a custom question to the AI expert
   * @param {string} user_message - The user's query
   */
  askExpert: async (user_message) => {
    const response = await api.post('/ai/expert', { 
      user_message 
    });
    return response;
  }
};
