# format_data.py will read in Matlab exported network-integration (tab separated)
# matrix and parse into a JavaScript (Json) Object. And remove those evil Windows 
# carriage returns :)

import os
import pandas
import simplejson
import sys

from utils import pwd, write_json


# LIKELIHOOD HEATMAP ########################################

pwd = pwd()

# Filter nonzero values?
nonzero = False

if len(sys.argv) > 2:
    input_data = "%s/data/network.tsv" %(pwd)
else:
    input_data = sys.argv[1]

# Read in the raw data, no header
raw = pandas.read_csv(input_data,sep='\t',header=None)

data = []
count = 0
minval = 999
maxval = 0
# Convert the data into x and y coordinates, only saving the nonzero values
for c in raw.columns.tolist():
    for r in raw.columns.tolist():
        value = raw.loc[r,c]
        keepgoing = True
        if nonzero == True:
            if value == 0:
                keepgoing = False

        if keepgoing == True:
            record = {"x":r,
                      "y":c,
                      "value":value}
            data.append(record)
            # Update min and max values
            if value < minval:
                minval = value
            if value > maxval:
                maxval = value
            count +=1

if nonzero == True:
    print("Found %s total (nonzero) records!" %(count))
else:
    print("Found %s total records!" %(count))

print("Min value is %s" %(minval))
print("Max value is %s" %(maxval))

# Min value is 0.000438161
# Max value is 1.106225285

# Save to json file
if nonzero == True:
    output_file = os.path.abspath(os.path.join(pwd,"../data/network_nonzero.json"))
else
    output_file = os.path.abspath(os.path.join(pwd,"../data/network.json"))

write_json(data,output_file)

# Let's make a normalized version so we can mess with scale (between -1 and 1)
lenx = raw.shape[0]
leny = raw.shape[1] 
norm = []
for record in data:
    x = (float(record['x'])-lenx)/lenx
    y = (float(record['y'])-leny)/leny # minval is 0 
    z = (record['value']-maxval)/(maxval-minval)
    normrecord = {"x":x,
              "y":y,
              "value":z}
    norm.append(normrecord)

if nonzero == True:
    output_file = os.path.abspath(os.path.join(pwd,"../data/network_norm_nonzero.json"))
else:
    output_file = os.path.abspath(os.path.join(pwd,"../data/network_norm.json"))
write_json(norm,output_file)
