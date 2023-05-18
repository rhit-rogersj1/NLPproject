import firebase_admin
from firebase_admin import credentials, firestore

# Replace the path to the service account JSON file with your own path
cred = credentials.Certificate('sumdo-rogersj1-biswalt-firebase-adminsdk-6f2tb-caf32fa42f.json')
firebase_admin.initialize_app(cred)

from firebase_admin import storage

db = firestore.client()

bucket = storage.bucket('sumdo-rogersj1-biswalt.appspot.com')

all_files = bucket.list_blobs()

sorted_files = sorted(all_files, key=lambda x: x.time_created, reverse=False)

top_file = sorted_files[0]

blob = bucket.blob(top_file.name)
blob.download_to_filename('test.mp3')

import torch
import torchaudio
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

processor = Wav2Vec2Processor.from_pretrained("facebook/wav2vec2-base-960h")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")

from pydub import AudioSegment
AudioSegment.converter = "ffmpeg.exe"
# sound = AudioSegment.from_mp3(os.path.join(current_directory, "test.mp3"))
sound = AudioSegment.from_mp3("test.mp3")
sound.export("test.wav", format="wav")
# import speech_recognition as sr
# r = sr.Recognizer()
# with sr.WavFile("test.wav") as source:              # use "test.wav" as the audio source
#     audio = r.record(source)                        # extract audio data from the file

audio_file = 'test.wav'
waveform, sample_rate = torchaudio.load(audio_file)

# Remove extra dimension from waveform tensor if necessary
if len(waveform.shape) > 1 and waveform.shape[1] == 2:
    waveform = torch.mean(waveform, dim=1, keepdim=True)

waveform = waveform.squeeze(0)
resampler = torchaudio.transforms.Resample(sample_rate, 16000)
waveform = resampler(waveform)

input_values = processor(waveform, sampling_rate=16000, return_tensors="pt").input_values

input_values = input_values.view(1, -1)
with torch.no_grad():
    logits = model(input_values).logits

transcription = processor.decode(torch.argmax(logits, dim=-1)[0])
print(transcription)

with open('transcription.txt', 'w') as f:
    f.write(transcription)

# Import necessary libraries
import nltk
from nltk.tokenize import sent_tokenize
from transformers import pipeline, set_seed
import spacy

# Download required NLTK packages
nltk.download('punkt')

# Load a pre-trained English language model
nlp = spacy.load('en_core_web_sm')


# Preprocess the input text by removing stop words and normalizing the text
doc = nlp(transcription)
processed_text = ' '.join([token.text for token in doc if not token.is_stop])

from transformers import T5Tokenizer, T5ForConditionalGeneration

tokenizer = T5Tokenizer.from_pretrained("t5-base")
model = T5ForConditionalGeneration.from_pretrained("t5-base")

# Define the summarization model and generate a summary
summarization_model = pipeline("summarization", model=model, tokenizer=tokenizer, framework="tf")
summary = summarization_model(processed_text, max_length=100, min_length=30, do_sample=False)[0]['summary_text']

# Print the summary
print(summary)

with open('summary.txt', 'w') as f:
    f.write(summary)

name = top_file.name[:-4]

import datetime

current_time = datetime.datetime.now()

doc_ref = db.collection('uids').document(name)
doc_ref.set({
    'Transcription': transcription,
    'Summary': summary,
})

blob.delete()