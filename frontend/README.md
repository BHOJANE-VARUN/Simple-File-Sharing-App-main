# Simple File Sharing App – Secure Key Exchange & File Transfer

## Getting Started: Install and Run the Frontend

1. **Install dependencies**
   ```sh
   cd frontend
   npm install
   ```

2. **Start the frontend development server**
   ```sh
   npm run dev
   ```
   By default, the app will be available at [http://localhost:5173](http://localhost:5173) (or as indicated in the terminal).

3. **(Optional) Change API/server URLs**
   - If you want to connect to a different backend, update API endpoints/socket URLs in `frontend/src/util/socket.js` as needed.

---

## Secure File Transfer Flow

This project implements secure file sharing using public-key and symmetric-key cryptography. The following describes the cryptographic flow and code references.

---

## 1. RSA Key Pair Generation (Receiver)

When a receiver joins a room:

- A fresh RSA key pair is generated using `crypto.subtle.generateKey`.
- The receiver's **public key** is exported in JWK format and sent to the sender via Socket.IO.

**Code Reference:**  
`frontend/src/components/JoinRoom.jsx`
```javascript
async function generateRSAKeyPair(setKeys, setJwt) {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
  setKeys(keyPair);
  const jwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  setJwt(jwk); // Send to sender
  return keyPair;
}
```

---

## 2. AES Key Generation & Encryption (Sender)

When the sender receives the receiver's public RSA key:

- The sender generates a random 256-bit AES-GCM symmetric key.
- This symmetric key is exported as raw data and **encrypted with the receiver's RSA public key**.
- The **encrypted symmetric key** is sent to the receiver via Socket.IO.

**Code Reference:**  
`frontend/src/components/CreateRoom.jsx`
```javascript
const publicKey = await crypto.subtle.importKey(
  "jwk",
  data.publicKey, // Received from receiver
  { name: "RSA-OAEP", hash: "SHA-256" },
  true,
  ["encrypt"]
);

const rawAesKey = await crypto.subtle.exportKey("jwk", key);
const kval = new TextEncoder().encode(rawAesKey.k);
const encrypted = await crypto.subtle.encrypt(
  { name: "RSA-OAEP", hash: "SHA-256" },
  publicKey,
  kval
);

socket.emit("Sender-Details", {
  data: {
    sender_uid: data.sender_uid,
    receiver_uid: data.uid,
    userDetails,
    encryptedAesKey: encrypted,
  },
});
```

---

## 3. AES Key Decryption (Receiver)

When the receiver gets the encrypted AES key:

- The receiver **decrypts the AES key** using their RSA private key.
- The decrypted AES key is **imported back as a CryptoKey object** for further use.

**Code Reference:**  
`frontend/src/components/JoinRoom.jsx`
```javascript
socket.on("Sender-Details", async (data) => {
  let decrypted;
  try {
    decrypted = await crypto.subtle.decrypt(
      { name: "RSA-OAEP", hash: "SHA-256" },
      keyPair.privateKey,
      data.encryptedAesKey
    );
  } catch (e) { console.log(e); }

  const decoded = new TextDecoder().decode(decrypted);
  const KeyObj = {
    key_ops: ["encrypt", "decrypt"],
    ext: true,
    kty: "oct",
    k: decoded,
    alg: "A256GCM",
  };

  crypto.subtle.importKey(
    "jwk",
    KeyObj,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
});
```

---

## 4. File Encryption & Transfer (Sender)

- Files are read in chunks (e.g., 1MB).
- Each chunk is **encrypted using the shared AES-GCM key and a new random IV** (Initialization Vector).
- Encrypted chunks are sent to the receiver over the socket connection.

**Code Reference:**  
`frontend/src/components/FileTransfer.jsx`
```javascript
socket.on("fs-share", () => {
  const chunk = currentBuffer.slice(0, bufferSize);
  currentBuffer = currentBuffer.slice(bufferSize);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  crypto.subtle
    .encrypt({ name: "AES-GCM", iv }, symKey, chunk)
    .then((result) => {
      socket.emit("file-raw", {
        uid: receiverDetails.uid,
        buffer: result,
        iv,
      });
    });
});
```

---

## 5. Decryption on Receiver Side

- The receiver **decrypts each chunk** using the AES key and the corresponding IV.
- The file is reconstructed from the decrypted chunks.

**Code Reference:**  
`frontend/src/components/ReceiverFlow.jsx`
```javascript
socket.on("fs-share", function (data) {
  crypto.subtle
    .decrypt(
      {
        name: "AES-GCM",
        iv: data.iv,
      },
      symKey,
      data.buffer
    )
    .then((decrypted) => {
      fileShare.current.buffer.push(decrypted);
      fileShare.current.transmitted += decrypted.byteLength;
      // ... once complete, reconstruct file
      if (
        fileShare.current.transmitted ===
        fileShare.current.metadata.total_buffer_size
      ) {
        const blob = new Blob(fileShare.current.buffer);
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileShare.current.metadata.filename;
        link.click();
      }
    });
});
```

---

## Flow Summary

1. **Receiver** generates RSA key pair and sends public key to sender.
2. **Sender** generates AES key, encrypts it with receiver's public key, and sends it to receiver.
3. **Receiver** decrypts AES key and imports it.
4. **Sender** encrypts file chunks with AES-GCM and random IV, sends to receiver.
5. **Receiver** decrypts chunks and reconstructs the file.

---

**See the referenced components for exact implementation details.**
