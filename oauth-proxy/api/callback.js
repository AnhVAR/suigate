/**
 * OAuth callback proxy for zkLogin
 * Receives Google OAuth callback and redirects to mobile app with custom scheme
 */

export default function handler(req, res) {
  const { id_token, error, error_description } = req.query;

  if (error) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head><title>OAuth Error</title></head>
      <body>
        <h1>OAuth Error</h1>
        <p>${error}: ${error_description || 'Unknown error'}</p>
      </body>
      </html>
    `);
  }

  // App redirect scheme (matches app.json scheme)
  const appScheme = 'suigate';
  const redirectPath = '/oauth';

  // Return HTML that extracts token from fragment and redirects
  res.setHeader('Content-Type', 'text/html');
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Redirecting to SuiGate...</title>
      <style>
        body { font-family: system-ui; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #1a1a2e; color: #fff; }
        .loader { text-align: center; }
        .spinner { width: 40px; height: 40px; border: 3px solid #333; border-top-color: #4f46e5; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
      <script>
        (function() {
          // Google OAuth returns token in URL fragment (#id_token=xxx)
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const idToken = params.get('id_token') || '${id_token || ''}';

          if (idToken) {
            // Redirect to app with token
            const appUrl = '${appScheme}:${redirectPath}#id_token=' + encodeURIComponent(idToken);
            window.location.href = appUrl;
          } else {
            document.body.innerHTML = '<div class="loader"><h2>Error</h2><p>No token received from Google</p></div>';
          }
        })();
      </script>
    </head>
    <body>
      <div class="loader">
        <div class="spinner"></div>
        <p>Redirecting to SuiGate...</p>
      </div>
    </body>
    </html>
  `);
}
