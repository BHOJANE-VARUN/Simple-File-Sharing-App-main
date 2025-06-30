import React, { useRef, useState, useEffect } from "react";
import { LuUsers } from "react-icons/lu";
import { toast } from "sonner";
import { socket } from "../util/socket";
import ReceiverFlow from "./ReceiverFlow";

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new Uint8Array(len);
  for (let i = 0; i < len; i++) buffer[i] = binary.charCodeAt(i);
  return buffer.buffer;
}

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
  setJwt(jwk);
  return keyPair;
}

function JoinRoom({ userDetails }) {
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const receiverIDRef = useRef(
    Math.floor(100000000 + Math.random() * 900000000).toString()
  );
  const [senderInfo, setSenderInfo] = useState(null);
  const [keys, setKeys] = useState(null);
  const [jwt, setJwt] = useState(null);
  const [symKey, setSymKey] = useState(null);
  const receiverID = receiverIDRef.current;

  const joinRoom = () => {
    if (joinCode.length !== 9 || !/\d{9}/.test(joinCode)) {
      toast.error("Please enter a valid 9-digit room code.");
      return;
    }
    toast.info("Trying to connect...");
    setLoading(true);
    socket.emit("verifyRoom", {
      sender_uid: joinCode,
      uid: receiverID,
      userDetails,
      publicKey: jwt,
    });
  };

  useEffect(() => {
    generateRSAKeyPair(setKeys, setJwt).then((keyPair) => {
      socket.on("Sender-Details", async (data) => {
        setSenderInfo(data.userDetails);
        const encryptedKeyBuffer = base64ToArrayBuffer(data.encryptedAesKey);

        const decryptedRawKey = await crypto.subtle.decrypt(
          { name: "RSA-OAEP", hash: "SHA-256" },
          keyPair.privateKey,
          encryptedKeyBuffer
        );

        const aesKey = await crypto.subtle.importKey(
          "raw",
          decryptedRawKey,
          { name: "AES-GCM", length: 256 },
          true,
          ["encrypt", "decrypt"]
        );

        setSymKey(aesKey);
        setLoading(false);
        toast.success("Joined room successfully!");
      });
    });

    socket.on("room-notexist", () => {
      toast.warning("Room code is not valid");
      setJoinCode("");
      setLoading(false);
    });

    return () => {
      socket.off("Sender-Details");
      socket.off("room-notexist");
    };
  }, []);

  if (loading) return <div>Loading...</div>;
  if (senderInfo) return <ReceiverFlow senderInfo={senderInfo} />;

  return (
    <div className="max-w-md mx-auto">
      <div className="shadow-2xl bg-white/90 p-8 rounded-2xl space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuUsers className="h-8 w-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-800">Join Room</div>
          <div>Enter the 9-digit room code to join a file sharing session</div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="roomCode" className="text-sm font-medium text-gray-700">
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              placeholder="Enter 9-digit code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 9))}
              className="border border-slate-300 w-full text-center text-xl font-mono tracking-wider h-14"
              maxLength={9}
            />
            <p className="text-xs text-gray-500 text-center">{joinCode.length}/9 digits</p>
          </div>
          <button
            onClick={joinRoom}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold disabled:bg-blue-300"
            disabled={joinCode.length !== 9}
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinRoom;
