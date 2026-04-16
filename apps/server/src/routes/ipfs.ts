import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { uploadJSON, uploadFile, gatewayUrl } from '../lib/ipfs';

export const ipfsRouter = Router();

// POST /api/ipfs/upload — upload arbitrary JSON metadata
ipfsRouter.post('/upload', requireAuth, async (req, res) => {
  const { data, name } = req.body as { data?: unknown; name?: string };
  if (!data) { res.status(400).json({ error: 'data required' }); return; }
  const cid = await uploadJSON(data, name ?? 'upload');
  res.json({ cid, url: gatewayUrl(cid) });
});

// POST /api/ipfs/upload-image — upload a product image (multipart/form-data, field: "file")
// Used by: apps/web/src/app/contract/new/page.tsx
ipfsRouter.post('/upload-image', requireAuth, async (req, res) => {
  // Express doesn't parse multipart by default — use the raw body bytes
  // The frontend sends FormData with a single "file" field.
  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer) => chunks.push(chunk));
  req.on('end', async () => {
    try {
      // Parse multipart manually for the simple single-file case
      const boundary = (req.headers['content-type'] ?? '').split('boundary=')[1];
      if (!boundary) { res.status(400).json({ error: 'No multipart boundary' }); return; }

      const raw      = Buffer.concat(chunks);
      const rawStr   = raw.toString('binary');
      const parts    = rawStr.split(`--${boundary}`);
      const filePart = parts.find(p => p.includes('filename='));

      if (!filePart) { res.status(400).json({ error: 'No file in request' }); return; }

      // Extract filename and mime type from headers
      const headerEnd  = filePart.indexOf('\r\n\r\n');
      const headerStr  = filePart.slice(0, headerEnd);
      const bodyRaw    = filePart.slice(headerEnd + 4, filePart.lastIndexOf('\r\n'));

      const nameMatch  = headerStr.match(/filename="([^"]+)"/);
      const typeMatch  = headerStr.match(/Content-Type:\s*([^\r\n]+)/);
      const filename   = nameMatch?.[1] ?? 'image.jpg';
      const mimeType   = typeMatch?.[1]?.trim() ?? 'image/jpeg';

      const fileBuffer = Buffer.from(bodyRaw, 'binary');
      const cid        = await uploadFile(fileBuffer, filename, mimeType);

      res.json({ cid, url: gatewayUrl(cid) });
    } catch (err) {
      console.error('[ipfs/upload-image]', err);
      res.status(500).json({ error: 'Image upload failed' });
    }
  });
});

// GET /api/ipfs/:cid — redirect to IPFS gateway
ipfsRouter.get('/:cid', (req, res) => {
  res.redirect(gatewayUrl(req.params['cid']!));
});
