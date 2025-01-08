const Message = require("../model/messageModel");
const Chat = require("../model/chatModel");

const videoCallHandler = (io, socket, onlineStudents, onlineTutors) => {
  const findReceiverSocket = (receiverId) => {
    const receiver = onlineTutors[receiverId] || onlineStudents[receiverId];
    return receiver?.socketId;
  };

  socket.on("initiate-call", async (data, callback) => {
    try {
      const {
        recieverId,
        signalData,
        from,
        callerName,
        callerAvatar,
        callerUserId,
      } = data;

      const receiverSocketId = findReceiverSocket(recieverId);

      if (!receiverSocketId) {
        // Emit back to caller if receiver not found
        socket.emit("call-failed", { reason: "User offline" });
        return;
      }

      io.to(receiverSocketId)
        .timeout(5000)
        .emit(
          "incoming-call",
          {
            from,
            callerData: {
              name: callerName,
              avatar: callerAvatar,
              userId: callerUserId,
            },
            signalData,
          },
          (error) => {
            if (error) {
              console.error("Failed to deliver call to receiver:", error);
              io.to(from).emit("call-failed", { reason: "Delivery failed" });
            }
          }
        );
    } catch (error) {
      console.error("Error in initiate-call:", error);

      socket.emit("call-failed", { reason: error.message });
    }
  });

  socket.on("answer-call", async ({ signalData, to }) => {
    try {
      socket.to(to).timeout(1000).emit("call-accepted", { signalData });
    } catch (error) {
      console.error("Error in answer-call:", error);
    }
  });

  socket.on("call-rejected", ({ to }) => {
    console.log("call rejected event trigerred", to);
    const receiverSocketId = findReceiverSocket(to);

    io.to(receiverSocketId).timeout(1000).emit("call-rejected");
  });

  socket.on("call-ended", ({ to }) => {
    console.log("call ended event trigerred");

    const receiverSocketId = findReceiverSocket(to);

    io.to(receiverSocketId).timeout(1000).emit("call-ended");
  });
};
module.exports = { videoCallHandler };
