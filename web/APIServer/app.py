from flask import Flask, request, render_template
import os

def processHelper(uid):
    #will check if audio sample already transcribed/summarized
    #if one of the above is not done then it will do so and store in user's respective firebase storage with id
    #id linked to original audio sample maybe using date and time uploaded
    #returns null if no audio sample, or does processing
    #everytime user uploads clears old stuff
    return 'I was called'

app = Flask(__name__)

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # Check if the post request has the file part
        if 'file' not in request.files:
            return 'No file part'

        file = request.files['file']

        # Check if the file is an MP3 file
        if file and file.filename.endswith('.mp3'):
            # Save the file to a directory on the server
            file.save(os.path.join('uploads', file.filename))
            return 'File uploaded successfully!'
        else:
            return 'Invalid file format'
    return render_template('upload.html')

@app.route('/process', methods=['GET'])
def process():
    uid = request.args.get('uid')
    processHelper(uid)

if __name__ == '__main__':
    app.run(debug=True)

