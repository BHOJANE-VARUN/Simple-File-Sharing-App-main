import React, { useEffect, useRef, useState } from "react";
import { socket } from "../util/socket";

function ReceiverFlow({ senderInfo }) {
  const [fileMeta, setFileMeta] = useState();
  const [progress, setProgress] = useState(0);
  const [transferStatus, setTransferStatus] = useState(null);
  const [fileHistory, setFileHistory] = useState([]);
  const fileShare = useRef({
    metadata: null,
    transmitted: 0,
    buffer: [],
  });

  useEffect(() => {
    socket.on("fs-meta", function (metadata) {
      setProgress(0);
      setTransferStatus(null);
      console.log("File metadata received:", metadata);
      fileShare.current.metadata = metadata;
      fileShare.current.transmitted = 0;
      fileShare.current.buffer = [];

      setFileMeta(metadata);
      socket.off("fs-share");
      socket.on("fs-share", function (buffer) {
        fileShare.current.buffer.push(buffer);
        fileShare.current.transmitted += buffer.byteLength;
        console.log(fileShare.current.transmitted);

        const percent = Math.trunc(
          (fileShare.current.transmitted /
            fileShare.current.metadata.total_buffer_size) *
            100
        );
        setProgress(percent);

        if (
          fileShare.current.transmitted ===
          fileShare.current.metadata.total_buffer_size
        ) {
          setTransferStatus("success");
          const data = fileShare.current.metadata;
          setFileHistory((prev) => {
            return [data, ...prev];
          });
          setFileMeta(null);
          const blob = new Blob(fileShare.current.buffer);
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = fileShare.current.metadata.filename;
          link.click();

          fileShare.current = { metadata: null, transmitted: 0, buffer: [] };
        } else {
          socket.emit("fs-start", {
            uid: senderInfo.sender_uid,
          });
        }
      });
      console.log(senderInfo);
      socket.emit("fs-start", {
        uid: senderInfo.sender_uid,
      });
    });

    return () => {
      socket.off("fs-meta");
      socket.off("fs-share");
    };
  }, [senderInfo]);
  //console.log(fileHistory)
  return (
    <div className="mt-10 max-w-md mx-auto">
      <div className="p-6 rounded-xl shadow bg-white border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-2">
          Connected to Sender
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xl font-bold uppercase">
            {senderInfo.name?.charAt(0) || "S"}
          </div>
          <div>
            <p className="text-sm text-gray-700 font-semibold">
              {senderInfo.name}
            </p>
            <p className="text-xs text-gray-500">
              {senderInfo.email || "Unknown email"}
            </p>
          </div>
        </div>
        {fileMeta && (
          <div className="space-y-2">
            <p className="font-semibold">{fileMeta.filename}</p>
            <div>{(fileMeta.total_buffer_size / 1000).toFixed(2)} kb</div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-indigo-600 h-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">{progress}% complete</p>

            {transferStatus === "success" && (
              <p className="mt-4 text-green-600 font-bold">
                File received successfully!
              </p>
            )}
          </div>
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
    </div>
  );
}

export default ReceiverFlow;
