# File_Sharing

## How connection is established 

1. When a user choice to create a room 
    i. A random 9 digit number is generated
    ii. "sender-join" message is emitted to server with uid:joinID 
    There joinID is room 9-digit identifier
--- 
socket.emit("sender-join", {
			uid:joinID
});

---
2. When server receives a "sender-join" request
    i. creates a room with uid(joinID)
    ii. Joins the sender into that room 
---
socket.on("sender-join", (data) => {
    socket.join(data.uid);
  });

---

3. Now receiver has to enter the 9-digit number
    i. "receiver-join" message is emitted with sender_id(9-digit number entered manually) and uid(it's own identifier)

---

socket.emit("receiver-join", {
		sender_uid:sender_uid,
		uid:joinID
	});
        
---

4. Now server will join receiver in room id=== uid of receiver
    i. sender and receiver both are in separate rooms
    ii. after that server sends "init" message to sender with receiver's uid.

---

socket.on("receiver-join", (data) => {
    socket.join(data.uid);
    console.log("Receiver joined:", data.uid, " -> sender:", data.sender_uid);
    socket.to(data.sender_uid).emit("init", data.uid);
  });

---

5. Sender stores receiver's uid locally

---

socket.on("init",function(uid){
		receiverID = uid;
		document.querySelector(".join-screen").classList.remove("active");
		document.querySelector(".fs-screen").classList.add("active");
	});

---

6. Now sender has to select a file that has to be sended 
    i. selects file
    ii. Reads it as buffer 
    iii. calls functions for further process with metadata, buffer with file

---

document.querySelector("#file-input").addEventListener("change",function(e){
		let file = e.target.files[0];
		if(!file){
			return;		
		}
		let reader = new FileReader();
		reader.onload = function(e){
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
				total_buffer_size:buffer.length,
				buffer_size:1024,
			}, buffer, el.querySelector(".progress"));
		}
		reader.readAsArrayBuffer(file);
	});

---

7. shareFile function
    i. it first emits the file meta to receiver
    ii. then it attaches a "fs-share" command on socket that transfers file in chunks and updates html elements

---

	document.querySelector("#file-input").addEventListener("change",function(e){
		let file = e.target.files[0];
		if(!file){
			return;		
		}
		let reader = new FileReader();
		reader.onload = function(e){
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
				total_buffer_size:buffer.length,
				buffer_size:1024,
			}, buffer, el.querySelector(".progress"));
		}
		reader.readAsArrayBuffer(file);
	});

---

8. When server receives "file-meta" message it simply transfer it to receiver

---

  socket.on("file-meta", (data) => {
    socket.to(data.uid).emit("fs-meta", data.metadata);
  });

---

9. When receives "file-meta" 
    i. it initized fileshare object with metadata
    ii. emits "fs-start" message

---

	socket.on("fs-meta",function(metadata){
		fileShare.metadata = metadata;
		fileShare.transmitted = 0;
		fileShare.buffer = [];

        // update dom

		socket.emit("fs-start",{
			uid:sender_uid
		});
	});

---

10. On server simply converts that "fs-start" to "fs-share" message to sender

---

socket.on("fs-start",function(data){
		socket.in(data.uid).emit("fs-share", {});
	});

---

11. When sender receives a "fs-share" message
    i. it slices a chunk from buffer and update the buffer
    ii. if chunk is not empty then emits a "file-raw" message with data and receiver id
    iii. else declares that file has been send

---

socket.on("fs-share",function(){
			let chunk = buffer.slice(0,metadata.buffer_size);
			buffer = buffer.slice(metadata.buffer_size,buffer.length);
			progress_node.innerText = Math.trunc(((metadata.total_buffer_size - buffer.length) / metadata.total_buffer_size * 100));
			if(chunk.length != 0){
				socket.emit("file-raw", {
					uid:receiverID,
					buffer:chunk
				});
			} else {
				console.log("Sent file successfully");
			}
		});

---

12. server converts that "file-raw" message to "file-share" and sends to receiver

---

	socket.on("file-raw",function(data){
		socket.in(data.uid).emit("fs-share", data.buffer);
	})

---

13. When receiver gets "fs-share" message then
    i. it pushes chunk into buffer and update the received file size
    ii. if received file != total size then emits "fs-start"
    iii. eles stops 
