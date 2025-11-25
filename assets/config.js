window.AppConfig = (function(){
  const loc = typeof location !== 'undefined' ? location : null;
  const host = loc ? loc.hostname : '';
  const fromEnv = typeof window !== 'undefined' ? window.__API_BASE_URL__ : '';
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const origin = loc && loc.origin ? loc.origin.replace(/\/$/, '') : '';
  const defaultApi = isLocal ? 'http://localhost:4000/api' : (origin ? origin + '/api' : '/api');
  return {
    apiBaseUrl: String(fromEnv || defaultApi || '').replace(/\/$/, '')
  };
})();
