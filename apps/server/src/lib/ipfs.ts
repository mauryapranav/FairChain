/**
 * IPFS integration via Pinata.
 *
 * When PINATA_JWT is set, uploads are pinned to real IPFS via Pinata.
 * When PINATA_JWT is absent (local dev), a deterministic mock CID is returned
 * and a warning is logged so devs know they are in mock mode.
 */

const PINATA_JWT = process.env['PINATA_JWT'];
const PINATA_BASE = 'https://api.pinata.cloud';

const isMock = !PINATA_JWT;
if (isMock) {
  console.warn('[ipfs] PINATA_JWT not set — running in mock IPFS mode. Set PINATA_JWT for real uploads.');
}

/** Upload a JSON object to IPFS and return the CID. */
export async function uploadJSON(data: unknown, name: string): Promise<string> {
  if (isMock) {
    // Deterministic fake CID based on content (consistent across calls for the same data)
    const content = JSON.stringify(data);
    const hash = Buffer.from(content).toString('base64url').slice(0, 32);
    const cid = `bafybeimock${hash}`;
    console.info(`[ipfs:mock] uploadJSON → ${cid}`);
    return cid;
  }

  const body = {
    pinataContent: data,
    pinataMetadata: { name },
    pinataOptions: { cidVersion: 1 },
  };

  const res = await fetch(`${PINATA_BASE}/pinning/pinJSONToIPFS`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[ipfs] Pinata upload failed (${res.status}): ${text}`);
  }

  const json = await res.json() as { IpfsHash: string };
  console.info(`[ipfs] Pinned JSON to IPFS: ${json.IpfsHash}`);
  return json.IpfsHash;
}

/** Upload a raw file Buffer to IPFS and return the CID. */
export async function uploadFile(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  if (isMock) {
    const hash = Buffer.from(filename + buffer.length).toString('base64url').slice(0, 28);
    const cid = `bafybeifile${hash}`;
    console.info(`[ipfs:mock] uploadFile → ${cid}`);
    return cid;
  }

  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimeType }), filename);
  form.append('pinataMetadata', JSON.stringify({ name: filename }));
  form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const res = await fetch(`${PINATA_BASE}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[ipfs] Pinata file upload failed (${res.status}): ${text}`);
  }

  const json = await res.json() as { IpfsHash: string };
  console.info(`[ipfs] Pinned file to IPFS: ${json.IpfsHash}`);
  return json.IpfsHash;
}

/** Build a public gateway URL for a given CID. */
export function gatewayUrl(cid: string): string {
  const gateway = process.env['IPFS_GATEWAY'] ?? 'https://ipfs.io/ipfs';
  return `${gateway}/${cid}`;
}

/** Returns true if the given CID is a mock (dev-only) CID. */
export function isMockCid(cid: string): boolean {
  return cid.startsWith('bafybeimock') || cid.startsWith('bafybeifile');
}
