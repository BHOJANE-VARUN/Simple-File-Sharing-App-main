import React, { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { toast } from "sonner";
import { socket } from "../util/socket";
import FileTransfer from "./FileTransfer";
import Loading from "./Loading";

const symKeyGenerator = async () => {
  const key = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
  return key;
};

function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function CreateRoom({ userDetails }) {
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [symKey, setSymKey] = useState(null);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied to clipboard!");
  };

  const generateRoomCode = () => {
    const code = Math.floor(100000000 + Math.random() * 900000000).toString();
    socket.emit("switch-room", {
      newRoom: code,
      oldRoom: roomCode || null,
    });
    setRoomCode(code);
    toast.success("Room code generated successfully!");
  };

  useEffect(() => {
    symKeyGenerator().then((key) => {
      setSymKey(key);

      socket.on("init", async (data) => {
      
        setReceiverInfo(data);
      //   console.log(data);
        
        const publicKey = await crypto.subtle.importKey(
          "jwk",
          data.publicKey,
          { name: "RSA-OAEP", hash: "SHA-256" },
          true,
          ["encrypt"]
        );

        const rawAesKey = await crypto.subtle.exportKey("jwk", key);
       // console.log(rawAesKey)
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
        
      });
    });

    generateRoomCode();

    return () => {
      socket.off("init");
      socket.off("room-switched");
    };
  }, []);

  if (!symKey) return <Loading /> 
  if (receiverInfo)
    return (
      <FileTransfer
        socket={socket}
        receiverDetails={receiverInfo}
        symKey = {symKey}
      />
    );

  return (
    <div className="max-w-md mx-auto">
      <div className="shadow-2xl bg-white/90 p-10 rounded-2xl space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUpload className="h-8 w-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-800">Room Created!</div>
          <div>Share this code with others to let them join your room</div>
        </div>
        <div className="space-y-6">
          <div className="text-center">
            <label className="text-sm font-medium text-gray-700">
              Your Room Code
            </label>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-3xl font-mono font-bold text-indigo-600 tracking-wider">
                {roomCode}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={copyRoomCode}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-semibold"
            >
              Copy Room Code
            </button>
            <button
              onClick={generateRoomCode}
              className="w-full border p-3 rounded-lg border-green-500 text-green-600 hover:bg-green-50 font-semibold"
            >
              Generate New Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRoom;
