from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import send, SocketIO
from flask_cors import CORS

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})
app.config["SECRET_KEY"] = "hjhjsdahhds"

@app.route("/", methods=["POST", "GET"])
def home():
    session.clear()
    if request.method == "POST":
        name = request.form.get("name")
        code = request.form.get("code")
        join = request.form.get("join", False)
        create = request.form.get("create", False)

    return render_template("home.html")

@socketio.on("connect")
def connect(auth):
    print('connected!')
    name = session.get("name")
    send({"name": name, "message": "has entered the room"})
    print(f"{name} joined room")

@socketio.on("receive_message")
def receive_message(data):
    try:
        print('received!')
        message = data["message"]
        author = data["author"]
        time = data["time"]
        print('send_data',{"author": author, "message": message, "time": time})
        socketio.emit("receive_message", {"author": author, "message": message, "time": time})
    except Exception as e:
        print(f"Error sending message: {e}")

@socketio.on("disconnect")
def disconnect():
    name = session.get("name")
    send({"name": name, "message": "has left the room"})
    print(f"{name} has left the room")
    

if __name__ == "__main__":
    socketio.run(app, debug=True)