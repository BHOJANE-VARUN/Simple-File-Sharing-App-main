import React, { useState } from "react";
import { LuUsers } from "react-icons/lu";
import { toast } from "sonner";

function JoinRoom() {
  const [joinCode, setJoinCode] = useState("");
  const joinRoom = () => {
    if (joinCode.length !== 9 || !/^\d+$/.test(joinCode)) {
      toast.error("Please enter a valid 9-digit room code.");
      return;
    }

    toast.warning("Joining room is not implemented yet.");
  };

  return(
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
  </div>)
}

export default JoinRoom;
