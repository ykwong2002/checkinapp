const config = {
  API_URL: process.env.NODE_ENV === 'production' 
    ? window.location.origin
    : 'http://localhost:5001',
  SOCKET_URL: process.env.NODE_ENV === 'production'
    ? window.location.origin
    : 'http://localhost:5001'
};

export default config; 