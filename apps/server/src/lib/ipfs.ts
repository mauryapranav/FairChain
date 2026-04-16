/**
 * IPFS upload stub — replace with Pinata/NFT.Storage in production.
 */

export async function uploadJSON(
  data: unknown,
  _name: string,
): Promise<string> {
  // In dev, return a deterministic fake CID based on the serialised content
  const content = JSON.stringify(data);
  const hash = Buffer.from(content).toString('base64url').slice(0, 32);
  return `bafybeimock${hash}`;
}

export function gatewayUrl(cid: string): string {
  const gateway = process.env['IPFS_GATEWAY'] ?? 'https://ipfs.io/ipfs';
  return `${gateway}/${cid}`;
}
