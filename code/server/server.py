from flask import Flask, request, jsonify
import requests
import os
from csvhandler import predictheaders, maskobfcsv
from pdfhandler import predictpdfheaders, maskobfpdf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes
filepath=""

@app.route("/getcsvheader", methods=['GET', 'POST'])
def getcsvheader():
    file_path = request.get_json()['filePath']
    
    # Construct the full path correctly
    full_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', file_path)
    print(full_path)

    try:
        headers = predictheaders(full_path)[0]
        return jsonify({"headers": headers})
    except FileNotFoundError:
        return jsonify({"error": "File not found"}), 404

@app.route("/maskobfcsv", methods=['GET', 'POST'])
def maskcsv():
    input= request.get_json()
    full_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'output.csv')
    output = maskobfcsv(input)
    return jsonify({"output": "csv"})

@app.route("/getpdfheader", methods=['GET', 'POST'])
def getpdfheader():
    pfile_path = request.get_json()['filePath']
    full_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', pfile_path)
    headers = predictpdfheaders(full_path)
    return jsonify({"headers": headers})

@app.route("/maskobfpdf", methods=['GET', 'POST'])
def maskpdf():
    input= request.get_json()
    print(input)
    maskobfpdf(input)
    return jsonify({"headers": "pdf"})

if __name__ == "__main__":
    app.run(debug=True)
