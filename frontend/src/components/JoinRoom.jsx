import React, { useRef, useState } from "react";
import { LuUsers } from "react-icons/lu";
import { toast } from "sonner";
import { socket } from "../util/socket";
import { useEffect } from "react";
import ReceiverFlow from "./ReceiverFlow";
async function generateRSAKeyPair(setKeys, setjwt) {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true, // keys can be exported
    ["encrypt", "decrypt"]
  );
  setKeys(keyPair);
  const jwk = await window.crypto.subtle.exportKey("jwk", keyPair.publicKey);
  setjwt(jwk);
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
  const [jwt, setjwt] = useState(null);
  const [symKey, setSymKey] = useState(null);
  const receiverID = receiverIDRef.current;
  const joinRoom = () => {
    if (joinCode.length !== 9 || !/^\d+$/.test(joinCode)) {
      toast.error("Please enter a valid 9-digit room code.");
      return;
    }
    toast.info("trying to connect");
    // socket.emit("verifyRoom",{
    //   sender_uid: joinCode,
    //   uid: receiverID,
    //   userDetails: userDetails,
    // });
    setLoading(true);
    socket.emit("verifyRoom", {
      sender_uid: joinCode,
      uid: receiverID,
      userDetails: userDetails,
      publicKey: jwt,
    });
  };
  useEffect(() => {
    generateRSAKeyPair(setKeys, setjwt).then((keyPair) => {
      socket.on("Sender-Details", async (data) => {
        setSenderInfo(data.userDetails);

        const { encryptedAesKey } = data;

        // const encryptedKeyArray = new Uint8Array(data.encryptedAesKey); // <- this converts the array
        // const encryptedKeyBuffer = encryptedKeyArray.buffer;

        // console.log("privatek",keyPair.privateKey);

        const decryptedRawKey = await crypto.subtle
          .decrypt({ name: "RSA-OAEP",hash:"SHA-256" }, keyPair.privateKey, encryptedAesKey)
          .catch((e) => {
            console.log(e);
          });

        // const aesKey = await crypto.subtle.importKey(
        //   "raw",
        //   decryptedRawKey,
        //   { name: "AES-GCM",
        //     length:256,
        //    },
        //   true,
        //   ["encrypt", "decrypt"]
        // ).catch((e)=>{
        //   console.log(e)
        // })

        // setSymKey(aesKey);
        setLoading(false);
        toast.success("Joined room successfully!");
      });
    });
    // socket.on("room-exists", () => {
    //   // toast.info("exists");
    // });
    socket.on("room-notexist", () => {
      toast.warning("room code is not valid");
      setJoinCode("");
      setLoading(false);
    });
    return () => {
      socket.off("Sender-Details");
      socket.off("room-notexist");
      // socket.off("room-exists");
    };
  }, []);
  // generateRSAKeyPair().then((result)=>{
  //   console.log(result)
  // })
  if (loading) {
    <div>Loading...</div>;
  }
  if (senderInfo) {
    return <ReceiverFlow senderInfo={senderInfo} />;
  }
  return (
    <div className="max-w-md mx-auto">
      <div className="shadow-2xl border-0 bg-white/90 p-8 rounded-2xl space-y-6">
        <div className="text-center">
          <div className="w-16 h-16   bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <LuUsers className="h-8 w-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-800">Join Room</div>
          <div>Enter the 9-digit room code to join a file sharing session</div>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="roomCode"
              className="text-sm font-medium text-gray-700"
            >
              Room Code
            </label>
            <br></br>
            <input
              id="roomCode"
              type="text"
              placeholder="Enter 9-digit code"
              value={joinCode}
              onChange={(e) =>
                setJoinCode(e.target.value.replace(/\D/g, "").slice(0, 9))
              }
              className="border-[1px] border-slate-300 w-full text-center text-xl font-mono tracking-wider h-14"
              maxLength={9}
            />
            <p className="text-xs text-gray-500 text-center">
              {joinCode.length}/9 digits
            </p>
          </div>

          <button
            onClick={joinRoom}
            className="w-full disabled:bg-blue-300 disabled:hover:cursor-not-allowed hover:cursor-pointer bg-blue-600   hover:bg-blue-700 text-white p-3 rounded-lg font-semibold "
            size="lg"
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
