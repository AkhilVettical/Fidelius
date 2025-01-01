from chat import chatlocal
import csv
import pandas as pd
import json
import os

csv_output_file = '/project/data/output.csv'

def predictheaders(file_path):
  rows=""
  with open(file_path, mode='r') as file:
        reader = csv.reader(file)
        rows = [next(reader) for _ in range(2)]
  return rows

def maskobfcsv(json_data):
    filename = json_data['fileName']
    df = pd.read_csv("/project/data/Ecommerce-Customers.csv")
    csv_output_file = '/project/data/output.csv'

    updated_df = df.copy()

    # Create a copy of the original headers
    og_headers = set(df.columns.tolist())
    column_info = json_data['headers']

    # Loop over each header info from the JSON
    for col in column_info:
        column_name = col['name']
        mode = col['mode']
        instruction = col['prompt']

        if column_name in og_headers:
            if mode == "mask":
                print("Masking the data in the csv file")
                updated_df[column_name] = df[column_name].apply(lambda x: '#' * len(str(x)))
                print("Data masked")
            

            elif mode == "obfuscate":
                print("Obfuscating the data in the csv file")
                csvCol = df[column_name]
                data_string = ','.join(csvCol.astype(str))
                modified_data_string = chatlocal(data_string, instruction)
                modified_chunk = modified_data_string.split(',')

                for x in range(min(len(csvCol), len(modified_chunk))):
                    updated_df.loc[x, column_name] = modified_chunk[x]

    newPath = os.path.join(os.path.dirname(__file__), '..', 'client', 'public', 'output.csv')
    updated_df.to_csv(newPath, index=False)
    updated_df.to_csv(csv_output_file, index=False)
    return csv_output_file