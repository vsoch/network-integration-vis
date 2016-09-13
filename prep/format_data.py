# format_data.py will read in Matlab exported network-integration (tab separated)
# matrix and parse into a JavaScript (Json) Object. And remove those evil Windows 
# carriage returns :)

import os
import pandas
import simplejson
import sys

# SUPPORTING FUNCTIONS ######################################

def pwd():
    '''pwd returns the present working directory
    '''
    return os.path.abspath(os.path.dirname(hello.__file__))


def write_json(json_obj,filename,mode="w",print_pretty=True):
    '''write_json will (optionally,pretty print) a json object to file
    :param json_obj: the dict to print to json
    :param filename: the output file to write to
    :param pretty_print: if True, will use nicer formatting   
    '''
    filey = open(filename,mode)
    if print_pretty == True:
        filey.writelines(simplejson.dumps(json_obj, indent=4, separators=(',', ': ')))
    else:
        filey.writelines(simplejson.dumps(json_obj))
    filey.close()
    return filename


# MAIN SCRIPT ###############################################

pwd = pwd()

if len(sys.argv) > 2:
    input_data = "%s/data/network.tsv" %(pwd)
else:
    input_data = sys.argv[1]

# Read in the raw data, no header
raw = pandas.read_csv(input_data,sep='\t',header=None)

data = []
count = 0
# Convert the data into x and y coordinates, only saving the nonzero values
for c in raw.columns.tolist():
    for r in raw.columns.tolist():
        value = raw.loc[r,c]
        if value != 0:
            record = {"x":r,
                      "y":c,
                      "value":value}
            data.append(record)
            count +=1

print("Found %s total (nonzero) records!" %(count))

# Save to json file
output_file = os.path.abspath(os.path.join(pwd,"../data/network.json"))
write_json(data,output_file)

