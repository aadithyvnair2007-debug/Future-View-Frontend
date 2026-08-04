const API_BASE_URL = import.meta.env.PROD 
  ? 'https://future-view.onrender.com' 
  : 'http://localhost:3010';

export default API_BASE_URL;