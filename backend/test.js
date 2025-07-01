const crypto = require("crypto");

async function generateRSAKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // keys can be exported
    ["encrypt", "decrypt"]
  );
  const jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  return { keyPair, jwk };
}
const symKeyGenerator = async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};
const getEncrpytedSymKey = async (jwk) => {
  const publicKey = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
  const Symkey = await symKeyGenerator();
  const rawAesKey = await crypto.subtle.exportKey("raw", Symkey);
  const encryptedSym = await crypto.subtle.encrypt(
    { name: "RSA-OAEP", hash: "SHA-256" },
    publicKey,
    rawAesKey
  );
  return encryptedSym;
};

const getSymKey = async (encrpytedSymKey, keyPair) => {
  const decryptedRawKey = await crypto.subtle
    .decrypt(
      { name: "RSA-OAEP", hash: "SHA-256" },
      keyPair.privateKey,
      encrpytedSymKey
    )
    .catch((e) => {
      console.log(e);
    });

  const DecryptedSymkey = await crypto.subtle
    .importKey("raw", decryptedRawKey, { name: "AES-GCM", length: 256 }, true, [
      "encrypt",
      "decrypt",
    ])
    .catch((e) => {
      console.log(e);
    });
  return DecryptedSymkey;
};

generateRSAKeyPair().then(({ keyPair, jwk }) => {
  getEncrpytedSymKey(jwk).then((encryptedSym) => {
    getSymKey(encryptedSym, keyPair).then((DecryptedSymkey) => {
      // console.log(DecryptedSymkey)
      crypto.subtle.exportKey("jwk", DecryptedSymkey).then((key) => {
        console.log(key);
        crypto.subtle
          .importKey(
            "jwk",
            key,
            {
              name: "AES-GCM",
              length: 256,
            },
            true,
            ["encrypt", "decrypt"]
          )
          .then(async (newKey) => {
            console.log(newKey)
            // const encoder = new TextEncoder();
            // const data = encoder.encode("hello world"); // the message to encrypt

            // const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV is recommended for AES-GCM

            // const encrypted = await crypto.subtle.encrypt(
            //   {
            //     name: "AES-GCM",
            //     iv: iv,
            //   },
            //   newKey, // the CryptoKey you have
            //   data
            // );

            // console.log("Encrypted:", new Uint8Array(encrypted)); // this is your ciphertext
            // const decrypted = await crypto.subtle.decrypt(
            //   {
            //     name: "AES-GCM",
            //     iv: iv, // use the exact same IV you used for encryption
            //   },
            //   newKey,
            //   encrypted
            // );

            // const decoder = new TextDecoder();
            // console.log("Decrypted:", decoder.decode(decrypted)); // "hello world"
          });
      });
    });
  });
});
