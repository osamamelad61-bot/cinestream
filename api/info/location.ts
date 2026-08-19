import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Access Vercel's geolocation headers
  const country = (req.headers['x-vercel-ip-country'] as string) || 'Egypt';
  const city = (req.headers['x-vercel-ip-city'] as string) || 'Cairo';
  const timezone = (req.headers['x-vercel-ip-timezone'] as string) || 'Africa/Cairo';
  const ip = (req.headers['x-real-ip'] as string) || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;

  res.status(200).json({
    timezone,
    country,
    city,
    ip,
    source: 'vercel-edge'
  });
}
