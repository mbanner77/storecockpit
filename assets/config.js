window.AppConfig = (function(){
  const loc = typeof location !== 'undefined' ? location : null;
  const host = loc ? loc.hostname : '';
  const fromEnv = typeof window !== 'undefined' ? window.__API_BASE_URL__ : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const isRender = host && host.endsWith('onrender.com');
  const defaultApi = isLocal ? 'http://localhost:4000/api' : (isRender ? 'https://storecockpit.onrender.com/api' : '/api');
  return {
    apiBaseUrl: String(fromEnv || defaultApi || '').replace(/\/$/, '')
  };
})();
