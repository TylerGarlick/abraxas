import { readFileSync, writeFileSync, promises as fs } from 'fs';
import { createHash, createSign } from 'crypto';
import { join, resolve, relative } from 'path';

/**
 * Sign data with a private key (PEM format).
 * Returns base64 signature string.
 */
export async function signData(data: string, privateKeyPem: string): Promise<string> {
  const signer = createSign('sha256');
  signer.update(data);
  signer.end();
  const signature = signer.sign(privateKeyPem, 'base64');
  return signature.toString();
}

/**
 * Compute a deterministic SHA256 hash of a file's contents.
 * Returns hex string.
 */
export async function hashFile(filePath: string): Promise<string> {
  const data = await fs.readFile(filePath);
  const hash = createHash('sha256');
  hash.update(data);
  return hash.digest('hex');
}

/**
 * Create a vault manifest for a PEF file.
 * The manifest contains the file name, hash, timestamp, and signature.
 */
export async function createVaultManifest(
  pefPath: string,
  privateKeyPem: string
): Promise<{ manifestPath: string; }>
{
  const pefName = resolve(pefPath);
  const fileHash = await hashFile(pefPath);
  const timestamp = new Date().toISOString();
  const manifest = {
    pef: pefName,
    hash: fileHash,
    exported_at: timestamp,
  };
  const jsonString = JSON.stringify(manifest);
  const signature = await signData(jsonString, privateKeyPem);
  const signedManifest = {
    ...manifest,
    signature,
  };
  const manifestPath = pefPath + '.vault.json';
  await fs.writeFile(manifestPath, JSON.stringify(signedManifest, null, 2));
  return { manifestPath };
}

/**
 * Export all PEF files in a directory to a vault directory.
 * For each PEF, create a signed manifest in the output directory.
 */
export async function exportToVault(
  pefDir: string,
  vaultDir: string,
  privateKeyPem: string
): Promise<string[]> {
  const files = await fs.readdir(pefDir);
  const pefFiles = files.filter((f) => f.endsWith('.pef'));
  const created: string[] = [];
  for (const f of pefFiles) {
    const pefPath = join(pefDir, f);
    const { manifestPath } = await createVaultManifest(pefPath, privateKeyPem);
    const dest = join(vaultDir, relative(pefPath, manifestPath));
    await fs.copyFile(pefPath, join(vaultDir, f));
    await fs.copyFile(manifestPath, dest);
    created.push(dest);
  }
  return created;
}

export default exportToVault;