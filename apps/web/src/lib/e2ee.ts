type EncryptionMetadata = {
  algorithm: 'AES-GCM'
  iv: string
  key: string
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return window.btoa(binary)
}

function base64ToUint8Array(base64: string) {
  const binary = window.atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function encryptFile(file: File) {
  const plainBuffer = await file.arrayBuffer()

  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  )

  const exportedKey = await window.crypto.subtle.exportKey('raw', key)
  const iv = window.crypto.getRandomValues(new Uint8Array(12))

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    plainBuffer
  )

  const metadata: EncryptionMetadata = {
    algorithm: 'AES-GCM',
    iv: arrayBufferToBase64(iv.buffer),
    key: arrayBufferToBase64(exportedKey),
  }

  return {
    encryptedBlob: new Blob([encryptedBuffer], {
      type: 'application/octet-stream',
    }),
    metadata,
  }
}

export async function decryptFile(
  encryptedBlob: Blob,
  encryptionMetadata: string
) {
  const metadata = JSON.parse(encryptionMetadata) as EncryptionMetadata

  const keyBytes = base64ToUint8Array(metadata.key)
  const iv = base64ToUint8Array(metadata.iv)

  const key = await window.crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  )

  const encryptedBuffer = await encryptedBlob.arrayBuffer()

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedBuffer
  )

  return new Blob([decryptedBuffer])
}