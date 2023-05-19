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
import librosa
from transformers import Wav2Vec2ForCTC, Wav2Vec2Tokenizer

from pydub import AudioSegment
AudioSegment.converter = "ffmpeg.exe"
sound = AudioSegment.from_mp3("test.mp3")
sound.export("test.wav", format="wav")

audio, rate = librosa.load("test.wav", sr = 16000)

# Importing Wav2Vec pretrained model

tokenizer = Wav2Vec2Tokenizer.from_pretrained("facebook/wav2vec2-base-960h")
model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")

# Taking an input value

input_values = tokenizer(audio, return_tensors = "pt").input_values

# Storing logits (non-normalized prediction values)
logits = model(input_values).logits

# Storing predicted ids
prediction = torch.argmax(logits, dim = -1)

# Passing the prediction to the tokenzer decode to get the transcription
transcription = tokenizer.batch_decode(prediction)[0]

# Open the file in write mode.
with open("transcription.txt", "w") as f:

    # Write the string to the file.
    f.write(transcription)

print(transcription)

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