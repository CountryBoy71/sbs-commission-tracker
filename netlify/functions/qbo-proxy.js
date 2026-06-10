// Netlify serverless function — QBO API proxy
// Forwards requests to QBO API server-side to avoid CORS restrictions

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  try {
    const { path, access_token } = JSON.parse(event.body || '{}');

    if (!path || !access_token) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing path or access_token' }) };
    }

    const REALM_ID = '9341456872578971';
    const QBO_BASE = `https://quickbooks.api.intuit.com/v3/company/${REALM_ID}`;
    const url      = QBO_BASE + path;

    const response = await fetch(url, {
      method:  'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept':        'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, headers, body: JSON.stringify(data) };
    }

    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch(e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message })
    };
  }
};
