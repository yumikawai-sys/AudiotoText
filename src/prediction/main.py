# Install Whisper package
import subprocess
subprocess.run(["pip", "install", "git+https://github.com/openai/whisper.git", "-q"])

import whisper
from IPython.display import Audio
import pytube
import urllib.request

# Download audio file
audio_url = "http://www.moviesoundclips.net/movies1/darkknightrises/darkness.mp3"
audio_file = "audio.mp3"

urllib.request.urlretrieve(audio_url, audio_file)

Audio("audio.mp3")

# """# Load the model"""
small_model = whisper.load_model("small")

# """# Or you can download from YouTube"""
url = "https://www.youtube.com/shorts/kmUiHuC63TE"
video = pytube.YouTube(url)
audio = video.streams.get_audio_only()
audio.download(filename='audio.mp3')
Audio("audio.mp3")

# """# Run the inference"""
result = small_model.transcribe('audio.mp3', fp16=False)
print(result["text"])