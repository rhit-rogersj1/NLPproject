from flask import Flask, request, render_template
import os

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
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

if __name__ == '__main__':
    app.run(debug=True)
