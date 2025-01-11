const videoCallHandler = (io, socket, onlineStudents, onlineTutors) => {
  const findReceiverSocket = (receiverId) => {
    const receiver = onlineTutors[receiverId] || onlineStudents[receiverId];
    return receiver?.socketId;
  };

  socket.on("initiate-call", async (data) => {
    try {
      const {
        recieverId,
        signalData,
        from,
        callerName,
        callerAvatar,
        callerUserId,
      } = data;

      console.log(signalData);

      const receiverSocketId = findReceiverSocket(recieverId);

      if (!receiverSocketId) {
        socket.to(callerUserId).emit("call-failed", { reason: "User offline" });
        return;
      }

      // Emit with callback to get error information
      io.to(recieverId).emit(
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
        (err) => {
          if (err) {
            console.error("Failed to deliver call to receiver:", err);
            io.to(callerUserId).emit("call-failed", {
              reason: "Delivery failed",
            });
          }
        }
      );
    } catch (error) {
      console.error("Error in initiate-call:", error);
      socket.emit("call-failed", {
        reason: "Internal server error",
        error: error.message,
      });
    }
  });

  socket.on("answer-call", async (data) => {
    try {
      const { signalData, to } = data;

      console.log(to, "to in answer call");
      console.log(signalData);

      io.to(to).emit("call-accepted", { signalData }, (err) => {
        if (err) {
          console.error("Failed to deliver call answer:", err);
        }
      });
    } catch (error) {
      console.error("Error in answer-call:", error);
      socket.emit("call-failed", {
        reason: "Failed to answer call",
        error: error.message,
      });
    }
  });

  socket.on("call-rejected", (data) => {
    try {
      const { to } = data;
      const receiverSocketId = findReceiverSocket(to);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call-rejected", null, (err) => {
          if (err) {
            console.error("Failed to deliver call rejection:", err);
          }
        });
      }
    } catch (error) {
      console.error("Error in call-rejected:", error);
    }
  });

  socket.on("call-ended", (data) => {
    try {
      const { to } = data;
      const receiverSocketId = findReceiverSocket(to);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("call-ended", null, (err) => {
          if (err) {
            console.error("Failed to deliver call end signal:", err);
          }
        });
      }
    } catch (error) {
      console.error("Error in call-ended:", error);
    }
  });
};

module.exports = { videoCallHandler };
