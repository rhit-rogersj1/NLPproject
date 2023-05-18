# # Import necessary library

# # For managing audio file
# import librosa

# #Importing Pytorch
# import torch

# #Importing Wav2Vec
# from transformers import Wav2Vec2ForCTC, Wav2Vec2Tokenizer

# import os

# current_directory = os.getcwd()

# #importing pydub
# from pydub import AudioSegment
# AudioSegment.converter = "ffmpeg.exe"
# sound = AudioSegment.from_mp3(os.path.join(current_directory, "test.mp3"))
# sound.export(os.path.join(current_directory, "test.wav"), format="wav")

# audio, rate = librosa.load("test.wav", sr = 16000)

# # Importing Wav2Vec pretrained model

# tokenizer = Wav2Vec2Tokenizer.from_pretrained("facebook/wav2vec2-base-960h")
# model = Wav2Vec2ForCTC.from_pretrained("facebook/wav2vec2-base-960h")

# # Taking an input value

# input_values = tokenizer(audio, return_tensors = "pt").input_values

# # Storing logits (non-normalized prediction values)
# logits = model(input_values).logits

# # Storing predicted ids
# prediction = torch.argmax(logits, dim = -1)

# # Passing the prediction to the tokenzer decode to get the transcription
# transcription = tokenizer.batch_decode(prediction)[0]

# # Open the file in write mode.
# with open("transcription.txt", "w") as f:

#     # Write the string to the file.
#     f.write(transcription)

# print(transcription)

transcription = ''

with open("transcription.txt", "r") as f:

    # Write the string to the file.
    transcription = f.read()

import nltk
from nltk.tokenize import sent_tokenize

nltk.download("punkt")

from transformers import pipeline, set_seed

summaries = {}

# set_seed(42)
# pipe = pipeline("text-generation", model="gpt2-xl")
gpt2_query = transcription + "\nTL;DR:\n"
print(gpt2_query)
# pipe_out = pipe(gpt2_query, max_length=512, clean_up_tokenization_spaces=True)
# summaries["gpt2"] = "\n".join(
#     sent_tokenize(pipe_out[0]["generated_text"][len(gpt2_query) :]))

# with open("summarization.txt", "w") as f:
#     f.write(summaries["gpt2"])

# print(summaries["gpt2"])