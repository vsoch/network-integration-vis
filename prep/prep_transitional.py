# prep_transitional.py will read in Matlab exported integrated and segreated state data matrices and parse into JSON objects for visualizations

import igraph as ig
import os
import json
import pandas
import sys

from utils import pwd, write_json, df_to_json, make_network

pwd = pwd()

# Filter nonzero values?
nonzero = False
segregated_data = "%s/data/segregated_state.tsv" %(pwd)
integrated_data = "%s/data/integrated_state.tsv" %(pwd)

# Read in the raw data, no header
segregated = pandas.read_csv(segregated_data,sep='\t',header=None)
integrated = pandas.read_csv(integrated_data,sep="\t",header=None)

# Convert to json, removing zeros, and not
segregated_nonzero = df_to_json(segregated)
integrated_nonzero = df_to_json(integrated)
seg_output = os.path.abspath(os.path.join(pwd,"../data/segregated_state.json"))
write_json(segregated_nonzero,seg_output)
int_output = os.path.abspath(os.path.join(pwd,"../data/integrated_state.json"))
write_json(integrated_nonzero,int_output)

# For most visualizations we will need a traditional graph with a list of nodes
# and connections between them (links). We will use the row and column index as the ids for the nodes.
seg_network = make_network(segregated)
int_network = make_network(integrated)
seg_output = os.path.abspath(os.path.join(pwd,"../data/segregated_network.json"))
write_json(seg_network,seg_output)
int_output = os.path.abspath(os.path.join(pwd,"../data/integrated_network.json"))
write_json(int_network,int_output)

# We might also need the coordinates generated apriori
result = make_network_with_coords(int_network)
coords_output = os.path.abspath(os.path.join(pwd,"../data/int_coords.json"))
write_json(result,coords_output)

result = make_network_with_coords(seg_network)
coords_output = os.path.abspath(os.path.join(pwd,"../data/seg_coords.json"))
write_json(result,coords_output)
