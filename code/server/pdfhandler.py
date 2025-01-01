from chat import chatlocal
import csv
import pandas as pd
import os
import PyPDF2
data_dict = {}
def predictpdfheaders(filepath):    
    # Dictionary to hold PII data for each type (dynamically discovered)
    pii_items = []
    # Open the PDF file
    with open(filepath, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        num_pages = len(reader.pages)

        # Process each page
        for page_num in range(num_pages):
            page = reader.pages[page_num]
            text = page.extract_text()
            print(text)     
            systemprompt="You are a tool to identify types of PII data in a pdf text document. Return only a list of all the types of PII present. example Name: Mustafa Abdul \n Address: 2201 C Street NW \n Phone No.: 202-555-0129"
            # Send text to chatlocal() to identify PII data
            detected_pii = chatlocal(systemprompt,text + "from this text identify all the types of PII data present eg. email, phone number, name, address etc. Do not return any other text or values.")
            print(detected_pii)
            lines = detected_pii.strip().split('\n')
            # Split the returned PII string by common delimiters (spaces, newlines, commas)
            for line in lines:
                # Split each line by the colon and strip whitespace
                key, value = line.split(':', 1)
                
                key = key.strip()
                value = value.strip()

                # Split multiple values by commas and strip whitespace from each value
                values = [v.strip() for v in value.split(',')]

                # Check if the key already exists in the dictionary
                if key in data_dict:
                    data_dict[key].extend(values)  # Append new values to the existing list
                else:
                    data_dict[key] = values  # Create a new list for the key

            # Extracting only the text before the colon (key names) for display
            pii_items = [line.split(':')[0].strip() for line in lines]
    print(data_dict)
    return [' ']+pii_items

from PyPDF2 import PdfReader, PdfWriter
def maskobfpdf(json_data):
    filepath=os.path.dirname(os.path.abspath(__file__))+"\\"+json_data['fileName']
    modified_dict = {}
    reader = PdfReader(filepath)
    writer = PdfWriter()
    # Loop through each header in the input
    for field in json_data['headers']:
        name = field['name']
        mode = field['mode']
        prompt = field.get('prompt', "")
        
        # Get the original value from the provided data dictionary
        original_value = data_dict.get(name, "")
        
        # Pass the value through the chatlocal() function to modify it
        if mode=='male':
            systemprompt="You are a tool that can modify the following data. Return the modified comma seperated values only and no other texts or information."
            modified_value = chatlocal(systemprompt,original_value+prompt)
            print(modified_value)
        elif mode=='female':
            modified_value = "#" * len(original_value)

        # Store the modified value in a new dictionary
        modified_dict[name] = modified_value

    #Replace the original values in PDF with modified values
    # Process each page of the PDF
    for page_num in range(len(reader.pages)):
        page = reader.pages[page_num]
        text = page.extract_text()
        
        # Replace original values with modified ones in the text
        for name, modified_value in modified_dict.items():
            text = text.replace(data_dict.get(name, ""), modified_value)
            print(text)
        # Add modified text back to the page (currently PyPDF2 doesn’t support text re-insertion)
        # You would need a more advanced library like `pdfplumber` for this or use annotations
        
        # For now, just add the original page to the writer
        writer.add_page(page)

    # Save the modified PDF to a new file
    modified_pdf_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "modified_" + os.path.basename(filepath))
    with open(modified_pdf_path, "wb") as output_pdf:
        writer.write(output_pdf)

    return modified_pdf_path
