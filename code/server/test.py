from csvhandler import maskobfcsv
import json

json_data = {'fileName': 'Ecommerce Customers Short.csv', 'headers': [{'name': 'Email', 'mode': 'obfuscate', 'prompt': 'change the names of all email ids'}, {'name': 'Address', 'mode': 'obfuscate', 'prompt': 'change and replace street names without making changes in the zip-code'}, {'name': 'Avatar', 'mode': 'mask', 'prompt': 'replace each with another value'}]}

maskobfcsv(json_data)