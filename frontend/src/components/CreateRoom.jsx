import React, { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import { toast } from "sonner";

function CreateRoom({setActiveTab}) {
  const [roomCode, setRoomCode] = useState("");
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);

    toast.success('Room code copied to clipboard!');
  };
  const generateRoomCode = () => {
    const code = Math.floor(100000000 + Math.random() * 900000000).toString();
    setRoomCode(code);
    setActiveTab("create");
    toast.success('Room code generated successfully!');
  };
  useEffect(() => {
    generateRoomCode();
  }, []);
  return (
    <div className="max-w-md mx-auto ">
      <div className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm p-10 rounded-2xl space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiUpload className="h-8 w-8 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            Room Created!
          </div>
          <div>
            Share this code with others to let them join your room
          </div>
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer p-3 font-semi rounded-lg text-white"
              
            >
              Copy Room Code
            </button>

            <button
              onClick={generateRoomCode}
              variant="outline"
              className="w-full border-[1px] cursor-pointer p-3 font-semibold rounded-lg border-green-500 text-green-600 hover:bg-green-50"
              
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
