window.AppConfig = (function(){
  const isLocal = typeof location !== 'undefined' && location.hostname === 'localhost';
  return {
    apiBaseUrl: isLocal ? 'http://localhost:4000/api' : '/api',
  };
})();
