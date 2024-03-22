import { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import PropTypes from "prop-types";

function Chat({ socket, username }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [messageCount, setMessageCount] = useState(0); 
  
  const sendMessage = async () => {

    if (currentMessage !== "") {
      const messageData = {
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      await socket.emit("receive_message", messageData);
      setMessageCount(count => count + 1);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
        console.log('receive_data', data);
        setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", handleReceiveMessage);

    return () => {
        socket.off("receive_message", handleReceiveMessage);
    };
  }, [socket, messageCount]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((messageContent, index) => {
            return (
              <div
                key={index}
                className="message"
                id={username === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

Chat.propTypes = {
    socket: PropTypes.any.isRequired,
    username: PropTypes.any.isRequired,
}

export default Chat;