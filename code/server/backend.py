import os
def getfiletype(file_path):
    file_extension = os.path.splitext(file_path)[1]
    if file_extension == '.pdf':
        return "PDF"
    elif file_extension == '.csv':
        return "CSV"
    else:
        return "Unknown file type"

from openai import OpenAI
from dotenv import load_dotenv
load_dotenv(".env")
def chatopenai(content):
    client = OpenAI(api_key=os.getenv('OPENAI_API'))
    completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", "content": "You are a tool to identify types of data in a dataset."},
        {
            "role": "user",
            "content": content
        }
    ]
    )
    print(completion.choices[0].message)
    return completion.choices[0].message


import requests
import json
def chatlocal(content):
    url = "http://127.0.0.1:1234/v1/chat/completions"
    headers = {
        "Content-Type": "application/json"
    }
    data = {
        "model": "llama-3.2-1b-instruct",
        "messages": [
            {"role": "system", "content": "You are a tool to identify types of data in a dataset."},
            {"role": "user", "content": content}
        ],
        "temperature": 0.7,
        "max_tokens": -1,
        "stream": False
    }

    # Sending the POST request to the API
    response = requests.post(url, headers=headers, data=json.dumps(data), stream=True)
    return response.json()["choices"][0]["message"]["content"]

#start by getting file type
#if csv read first 2 rows and predict type of columns
import csv
#openai.my_api_key = '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'
def predictdata(file_path):
  rows=""
  with open(file_path, mode='r') as file:
        reader = csv.reader(file)
        rows = [next(reader) for _ in range(2)]
  rows_str = '\n'.join([', '.join(row) for row in rows])
  datatypes=chatlocal("What are the types of data in this dataset? eg. email, phone number, name, address etc. Return only the headings and not the data itself"+rows_str)
  return datatypes



file_path="D:\\Pranav\\Repository\\DataMasking\\Server\\Ecommerce Customers.csv"
filetype=getfiletype(file_path)
print(filetype)
if filetype=="CSV":
    print(predictdata(file_path))
    