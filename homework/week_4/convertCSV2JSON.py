#!/usr/bin/env python 3.6.3
# Name: Jurre Brandsen
# Student number: 11808918

import csv, json
'''
This part can be used for any csv file
'''
def main():
    input_file = 'data/child-mortality.csv'
    output_file = 'data/cooldata.json'
    read_csv(input_file, output_file)

# Read the CSV file
def read_csv(file, json_file):

    # Create a empty array
    csv_rows = []

    # Read CSV file using Python CSV DictReader
    with open(file) as csvfile:
        reader = csv.DictReader(csvfile)
        title = reader.fieldnames

        # Format the csv_rows as JSON
        for row in reader:
            csv_rows.extend([{title[i]:row[title[i]] for i in range(len(title))}])

        # Call the write_json function and Write the JSON to output file
        write_json(csv_rows, json_file)

# Convert CSV data into json and write it
def write_json(data, json_file):

    # Pretty write to the JSON file
    with open(json_file, "w") as f:
        f.write(json.dumps(data, sort_keys = False, indent = 2, separators = (',', ': ')))

# Initate main, ignoring the first word
if __name__ == "__main__":
   main()

'''
This script is based on the code of DSK. I have simplified the code for the needs of this assignment 
sources: - http://www.idiotinside.com/2015/09/18/csv-json-pretty-print-python/
         - https://docs.python.org/3.6/library/csv.html
         - https://docs.python.org/3.6/library/json.html

I have added extra comments to show I fully understand the code and the output.
'''