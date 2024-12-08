import jsencrypt from 'jsencrypt'

export function RsaEncrypt(text: string, pubKey: string) {
  const encryptor = new jsencrypt({
    default_key_size: '512'
  })
  encryptor.setPublicKey(pubKey)
  return encryptor.encrypt(text)
}

