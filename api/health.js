import { setCorsHeaders } from './lib/helpers.js';

export default function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
