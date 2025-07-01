import React, { useRef, useState } from "react";

function FileTransfer({ socket, receiverDetails, symKey }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [transferStatus, setTransferStatus] = useState(null);
  const [fileHistory, setFileHistory] = useState([]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      startTransfer(selectedFile);
    }
  };

  const startTransfer = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setTransferStatus(null);
      const buffer = new Uint8Array(reader.result);

      // send file metadata
      socket.emit("file-meta", {
        uid: receiverDetails.uid,
        metadata: {
          filename: file.name,
          total_buffer_size: buffer.length,
          buffer_size: 2048, 
        },
      });

      let currentBuffer = buffer;
      let bufferSize = 2048;

      socket.off("fs-share");
      socket.on("fs-share", () => {
        const chunk = currentBuffer.slice(0, bufferSize);
        currentBuffer = currentBuffer.slice(bufferSize);
        const iv = crypto.getRandomValues(new Uint8Array(12));
        crypto.subtle
          .encrypt({ name: "AES-GCM", iv }, symKey, chunk)
          .then((result) => {
            const progressPercent =
              100 - (currentBuffer.length / buffer.length) * 100;
            setProgress(Math.floor(progressPercent));
            console.log("Sending chunk of size:", chunk.length);
            console.log({
              buffer:result,
              iv,
            })
            if (chunk.length == bufferSize) {
              socket.emit("file-raw", {
                uid: receiverDetails.uid,
                buffer: result,
                iv,
              });
            } else if (chunk.length >= 0) {
              if (chunk.length > 0) {
                socket.emit("file-raw", {
                  uid: receiverDetails.uid,
                  buffer: result,
                  iv,
                });
              }
              console.log("done");
              const data = {
                filename: file.name,
                total_buffer_size: buffer.length,
              };
              console.log(data);
              setFileHistory((prev) => {
                return [data, ...prev];
              });
              setTransferStatus("success");
              setFile(null);
              setProgress(0);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
      <>
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          Connected to Receiver
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold uppercase">
            {receiverDetails.userDetails.name?.charAt(0) || "S"}
          </div>

          <div>
            <p className="text-sm text-gray-700 font-semibold">
              {receiverDetails.userDetails.name}
            </p>
            <p className="text-xs text-gray-500">
              {receiverDetails.userDetails.email || "Unknown device"}
            </p>
          </div>
        </div>
      </>
      {!file && (
        <label className="block w-full mb-4 cursor-pointer mt-2">
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-400 hover:border-indigo-600 rounded-lg ">
            <span className="text-sm text-indigo-400 hover:text-indigo-600 font-medium">
              Click to select a file
            </span>
          </div>
          <input type="file" onChange={handleFileChange} className="hidden" />
        </label>
      )}

      {file && (
        <div className="space-y-2">
          <p className="font-semibold">{file.name}</p>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-indigo-600 h-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{progress}% complete</p>
        </div>
      )}

      {transferStatus === "success" && (
        <p className="mt-4 text-green-600 font-bold">File sent successfully!</p>
      )}

      {fileHistory.length > 0 && (
        <div className="mt-6 ">
          <h3 className="text-md font-bold text-gray-700 mb-3">
            Transfer History
          </h3>
          <div
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            className="space-y-2 max-h-48 overflow-y-scroll"
          >
            {fileHistory.map((meta, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {meta.filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(meta.total_buffer_size / 1000).toFixed(2)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileTransfer;
