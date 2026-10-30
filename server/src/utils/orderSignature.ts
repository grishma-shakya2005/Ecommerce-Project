import {
  createHash,
  createSign,
  createVerify,
  generateKeyPairSync,
} from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface OrderSignatureData {
  orderNumber: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  customerEmail: string;
}

const keysDirectory = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '.keys');
const privateKeyPath = join(keysDirectory, 'order-signing-private.pem');
const publicKeyPath = join(keysDirectory, 'order-signing-public.pem');

const ensureKeyPair = () => {
  // Keep the private key on the server and only expose the public key for verification.
  if (!existsSync(privateKeyPath) || !existsSync(publicKeyPath)) {
    mkdirSync(keysDirectory, { recursive: true });
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      publicKeyEncoding: { type: 'spki', format: 'pem' },
    });

    writeFileSync(privateKeyPath, privateKey, { encoding: 'utf8', mode: 0o600 });
    writeFileSync(publicKeyPath, publicKey, { encoding: 'utf8', mode: 0o644 });
  }

  // Re-apply restrictive permissions when an existing key pair is reused.
  chmodSync(privateKeyPath, 0o600);
  return {
    privateKey: readFileSync(privateKeyPath, 'utf8'),
    publicKey: readFileSync(publicKeyPath, 'utf8'),
  };
};

const keys = ensureKeyPair();

const serializeOrderData = (data: OrderSignatureData) => JSON.stringify({
  orderNumber: data.orderNumber,
  items: data.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
  })),
  total: data.total,
  customerEmail: data.customerEmail,
});

export const hashOrderData = (data: OrderSignatureData) => {
  // SHA-256 creates a deterministic fingerprint of the critical transaction fields.
  return createHash('sha256').update(serializeOrderData(data), 'utf8').digest('hex');
};

export const signOrderHash = (hash: string) => {
  // RSA signs the hash with the private key so only this server can create signatures.
  const signer = createSign('RSA-SHA256');
  signer.update(hash, 'utf8');
  signer.end();
  return signer.sign(keys.privateKey, 'base64');
};

export const verifyOrderSignature = (data: OrderSignatureData, storedHash: string, signature: string) => {
  const computedHash = hashOrderData(data);
  const verifier = createVerify('RSA-SHA256');
  verifier.update(computedHash, 'utf8');
  verifier.end();

  // Verification uses the public key and also checks that the stored hash is unchanged.
  return computedHash === storedHash && verifier.verify(keys.publicKey, signature, 'base64');
};

export const getPublicSigningKey = () => keys.publicKey;
