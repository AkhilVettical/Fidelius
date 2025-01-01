import pandas as pd
from chat import chatlocal
import json

def func(json_data):
    print("Masking the data in the csv file")
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
                updated_df[column_name] = df[column_name].apply(lambda x: '#' * len(str(x)))
                print("Data masked")

            elif mode == "obfuscate":
                csvCol = df[column_name]
                data_string = ','.join(csvCol.astype(str))
                modified_data_string = chatlocal(data_string, instruction)
                modified_chunk = modified_data_string.split(',')

                for x in range(min(len(csvCol), len(modified_chunk))):
                    updated_df.loc[x, column_name] = modified_chunk[x]

    updated_df.to_csv(csv_output_file, index=False)
    print(f"Updated CSV file saved as: {csv_output_file}")
    return "Masked the data in the csv file"
                
json_data = {'fileName': 'Ecommerce Customers Short.csv', 'headers': [{'name': 'Email', 'mode': 'obfuscate', 'prompt': 'change the names of all email ids'}, {'name': 'Address', 'mode': 'obfuscate', 'prompt': 'change and replace street names without making changes in the zip-code'}, {'name': 'Avatar', 'mode': 'mask', 'prompt': 'replace each with another value'}]}
func(json_data)

def maskobfcsv(json_data):
    print("Masking the data in the csv file")
    filename = json_data['fileName']
    df = pd.read_csv("/project/data/Ecommerce-Customers.csv")
    # Create a copy of the original headers
    updated_headers = df.columns.tolist()

    headers_info = json_data['headers']
     # Loop over each header info from the JSON
    for header in headers_info:
        column_name = header['name']
        mode = header['mode']
        instruction = header['prompt']
        # Check if the column exists in the CSV
        if column_name in df.columns:
            # Perform actions based on the mode
            if mode == "obfuscate":
                modified_column_data = []
                
                # Process 200 rows at a time
                chunkSize = 200
                print("Printing column "+column_name)
                print(len(df))
                for i in range(0, len(df), chunkSize):
                    # Extract 200 rows of data from the column
                    chunk = df[column_name].iloc[i:i+chunkSize]
                    # print(chunk)
                    # Convert the chunk to a single string, separated by commas
                    data_string = ','.join(chunk.astype(str))
                    
                    # Pass the data string to chatlocal() to get modified data 
                    
                    modified_data_string = chatlocal(data_string,instruction)
                    
                    # Split the modified data string back into a list
                    modified_chunk = modified_data_string.split(',')
                    print("Modified")
                    print(modified_chunk)
                    # Add the modified chunk to the list
                    modified_column_data.extend(modified_chunk)
                
                # Ensure that the length of modified data matches the original
                modified_column_data = modified_column_data[:len(df)]
                df[column_name] = modified_column_data
            elif mode == "mask":
                df[column_name] = df[column_name].apply(lambda x: '#' * len(str(x)))
            else:
                pass
            
            # Update the column name in the updated_headers list
            updated_headers = [
                column_name if col == column_name else col for col in updated_headers
            ]
    print("Completed masking/obfuscation")
    # Assign the updated headers to a new DataFrame
    updated_df = df.copy()
    updated_df.columns = updated_headers
    
    # Save the new DataFrame with updated headers to a new CSV file
    updated_df.to_csv(csv_output_file, index=False)
    print(f"Updated CSV file saved as: {csv_output_file}")
    return "Masked the data in the csv file"