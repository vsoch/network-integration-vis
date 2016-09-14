# prep_transitional.py will read in Matlab exported integrated and segreated state data matrices and parse into JSON objects for visualizations

import os
import pandas
import simplejson
import sys

from utils import pwd, write_json, df_to_json

pwd = pwd()

# Filter nonzero values?
nonzero = False
segregated_data = "%s/data/segregated_state.tsv" %(pwd)
integrated_data = "%s/data/integrated_state.tsv" %(pwd)

# Read in the raw data, no header
segregated = pandas.read_csv(segregated_data,sep='\t',header=None)
integrated = pandas.read_csv(integrated_data,sep="\t",header=None)

data = []

# Convert to json, removing zeros, and not
segregated_nonzero = df_to_json(segregated)
integrated_nonzero = df_to_json(integrated)
seg_output = os.path.abspath(os.path.join(pwd,"../data/segregated_state.json"))
write_json(segregated_nonzero,seg_output)
int_output = os.path.abspath(os.path.join(pwd,"../data/integrated_state.json"))
write_json(integrated_nonzero,int_output)


# For most visualizations we will need a traditional graph with...
#...
