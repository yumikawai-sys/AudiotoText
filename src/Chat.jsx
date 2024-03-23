import { useEffect, useState, useRef } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import PropTypes from "prop-types";
import { saveAs } from 'file-saver';
import { createFFmpeg } from '@ffmpeg/ffmpeg';

function Chat({ socket, username }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [messageCount, setMessageCount] = useState(0); 
  
  const videoRef = useRef(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const ffmpeg = createFFmpeg({ log: true });

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


  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = handleDataAvailable;
      setMediaRecorder(recorder);
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
      setRecordedChunks((prev) => [...prev, event.data]);
    }
  };

  const startRecording = () => {
    recordedChunks.length = 0; // Clear previous recordings
    mediaRecorder.start();
  };

  const stopRecording = () => {
    mediaRecorder.stop();
  };

  const downloadVideo = async () => {
    // Configure ffmpeg
    await ffmpeg.load();

    // Write the recorded chunks to a file
    ffmpeg.FS('writeFile', 'recorded.webm', new Uint8Array(recordedChunks));

    // Convert the video to MP4
    await ffmpeg.run('-i', 'recorded.webm', 'output.mp4');

    // Read the MP4 file
    const data = ffmpeg.FS('readFile', 'output.mp4');

    // Save the MP4 file
    saveAs(new Blob([data.buffer], { type: 'video/mp4' }), 'recorded-video.mp4');
  };

  return (
    <div className="chatmain">
      
      <div className="cameraArea">
        <video ref={videoRef} autoPlay />
        <div className="cameraButtons">
          <button onClick={startCamera}>Start Camera</button>
          <button onClick={startRecording} disabled={!mediaRecorder}>Start Recording</button>
          <button onClick={stopRecording} disabled={!mediaRecorder}>Stop Recording</button>
          <button onClick={downloadVideo} disabled={recordedChunks.length === 0}>Save Video</button>
        </div>
      </div>
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
    </div>
  );
}

Chat.propTypes = {
    socket: PropTypes.any.isRequired,
    username: PropTypes.any.isRequired,
}

export default Chat;