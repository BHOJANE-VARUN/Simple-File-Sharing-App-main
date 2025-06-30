# File Sharing: Connection Establishment Flow

This document describes the step-by-step flow of how a connection is established and files are shared between a sender and receiver in the application.

---

## 1. Sender Creates a Room

- A random 9-digit number is generated as the `joinID`.
- The sender emits a `sender-join` message to the server with the generated `joinID`:

```js
socket.emit("sender-join", {
    uid: joinID
});
```

---

## 2. Server Handles Sender Join

- Upon receiving `sender-join`, the server:
  - Creates a room with `uid` (`joinID`)
  - The sender joins that room

```js
socket.on("sender-join", (data) => {
    socket.join(data.uid);
});
```

---

## 3. Receiver Enters the Room

- The receiver enters the 9-digit room number and emits `receiver-join`
- The message includes:
  - `sender_uid`: the 9-digit room number entered
  - `uid`: the receiver's own identifier

```js
socket.emit("receiver-join", {
    sender_uid: sender_uid,
    uid: joinID
});
```

---

## 4. Server Handles Receiver Join

- Server joins the receiver to a room with id === receiver's `uid`
- Both sender and receiver are now in their own rooms
- Server notifies the sender with an `init` message containing the receiver's `uid`

```js
socket.on("receiver-join", (data) => {
    socket.join(data.uid);
    console.log("Receiver joined:", data.uid, " -> sender:", data.sender_uid);
    socket.to(data.sender_uid).emit("init", data.uid);
});
```

---

## 5. Sender Stores Receiver's UID

- Sender receives the `init` event and stores the receiver's `uid` locally
- UI transitions from join screen to file sharing screen

```js
socket.on("init", function(uid) {
    receiverID = uid;
    document.querySelector(".join-screen").classList.remove("active");
    document.querySelector(".fs-screen").classList.add("active");
});
```

---

## 6. Sender Selects a File

- Sender selects a file for sharing
- The file is read as a buffer and the process begins

```js
document.querySelector("#file-input").addEventListener("change", function(e) {
    let file = e.target.files[0];
    if (!file) return;
    let reader = new FileReader();
    reader.onload = function(e) {
        let buffer = new Uint8Array(reader.result);

        let el = document.createElement("div");
        el.classList.add("item");
        el.innerHTML = `
            <div class="progress">0%</div>
            <div class="filename">${file.name}</div>
        `;
        document.querySelector(".files-list").appendChild(el);
        shareFile({
            filename: file.name,
            total_buffer_size: buffer.length,
            buffer_size: 1024,
        }, buffer, el.querySelector(".progress"));
    }
    reader.readAsArrayBuffer(file);
});
```

---

## 7. `shareFile` Function

- Emits the file metadata to the receiver
- Sets up the socket to handle file chunk transfers and UI updates

---

## 8. Server Relays File Metadata

- Upon receiving `file-meta`, server relays it to the receiver as `fs-meta`

```js
socket.on("file-meta", (data) => {
    socket.to(data.uid).emit("fs-meta", data.metadata);
});
```

---

## 9. Receiver Handles File Metadata

- Receiver initializes a file share object with the metadata
- Emits `fs-start` to signal readiness

```js
socket.on("fs-meta", function(metadata) {
    fileShare.metadata = metadata;
    fileShare.transmitted = 0;
    fileShare.buffer = [];

    // update DOM, show progress, etc.

    socket.emit("fs-start", {
        uid: sender_uid
    });
});
```

---

## 10. Server Relays `fs-start`

- Server receives `fs-start` and relays a `fs-share` message to the sender

```js
socket.on("fs-start", function(data) {
    socket.in(data.uid).emit("fs-share", {});
});
```

---

## 11. Sender Handles `fs-share`

- Upon receiving `fs-share`, sender:
  - Slices a chunk from the buffer
  - Updates progress
  - Emits `file-raw` with the data chunk and receiver's id
  - If buffer is empty, declares the file as sent

```js
socket.on("fs-share", function() {
    let chunk = buffer.slice(0, metadata.buffer_size);
    buffer = buffer.slice(metadata.buffer_size, buffer.length);
    progress_node.innerText = Math.trunc(((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size * 100));
    if (chunk.length != 0) {
        socket.emit("file-raw", {
            uid: receiverID,
            buffer: chunk
        });
    } else {
        console.log("Sent file successfully");
    }
});
```

---

## 12. Server Relays File Chunks

- On receiving `file-raw`, server emits `fs-share` to the receiver

```js
socket.on("file-raw", function(data) {
    socket.in(data.uid).emit("fs-share", data.buffer);
});
```

---

## 13. Receiver Handles File Chunks

- Receiver:
  - Pushes each received chunk into a buffer and updates received file size
  - If the received file size is less than the total, emits `fs-start` again
  - Else, concludes the file transfer

---

## Summary Flowchart

```
Sender                Server                  Receiver
  |   sender-join   ->|                        |
  |<-(room created)-- |                        |
  |                   |                        |
  |                   |<-- receiver-join ------|
  |                   |--- init -------------->|
  |<----- init -------|                        |
  |                   |                        |
  |--- file-meta ---->|                        |
  |                   |--- fs-meta ----------->|
  |                   |                        |
  |<------------------|--- fs-start -----------|
  |--- file-raw ----->|                        |
  |                   |--- fs-share ---------->|
  |                   |                        |
  |<------------------|--- fs-start (repeat) --|
```

---

This flow ensures that both sender and receiver are synchronized for efficient and reliable file transfer using socket.io rooms and events.







// receiver -> private key, public key, symmetic key 
// sender -> symmetry key,
// sender -> (public key + symmetry key) == new key
// recevier -> (private key - new key)