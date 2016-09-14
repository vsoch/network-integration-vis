import os
import pandas
import json
import hello
import simplejson

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

def df_to_json(df,nonzero=True):
    '''df_to_json will convert a pandas dataframe to a json object (list of dicts)
    for which each has an x and y coordinate, and a value (which can also be thought
    of as a z coordinate). The parameter "nonzero" will indicate to only include
    nonzero values
    :param df: the df to parse
    :param nonzero: only include nonzero values
    '''

    data = []
    for c in df.columns.tolist():
        for r in df.columns.tolist():
            value = df.loc[r,c]
            keepgoing = True
            if nonzero == True:
                if value == 0:
                    keepgoing = False

            if keepgoing == True:
                record = {"x":r,
                          "y":c,
                          "value":value}
                data.append(record)
    return data       

def make_network(df):
    '''make_network will return a json object with nodes and edges, each with a unique
    id obtained from column and row names
    :param df: the data frame to parse
    '''
    nodes = []
    links = []
    seen = []
    for id1 in df.index.tolist():
        if id1 not in nodes:
            nodes.append(id1)
        for id2 in df.index.tolist():
            if id2 not in nodes:
                nodes.append(id2)
            if df.loc[id1,id2] != 0:
                ids = [str(x) for x in [id1,id2]]
                ids.sort()
                link_uid = "-".join(ids)
                if link_uid not in seen:
                    seen.append(link_uid)
                    links.append({"source":id1,"target":id2})
    result = {"nodes":nodes,
              "links":links}
    return result

def make_network_with_coords(net):

    edges = []
    for edge in net["links"]:
        edges.append((edge["source"],edge["target"]))

    nodes = []
    for node in net['nodes']:
        nodes.append({"name":node,"group":1})

    labels=[]
    group=[]
    for node in nodes:
        labels.append(node['name'])
        group.append(node['group'])

    G = ig.Graph(edges, directed=False)
    layt = G.layout('kk', dim=3)
    N = len(nodes)

    # Get x,y,z coordinates
    Xn=[layt[k][0] for k in range(N)] # x-coordinates of nodes
    Yn=[layt[k][1] for k in range(N)] # y-coordinates
    Zn=[layt[k][2] for k in range(N)] # z-coordinates

    # Save coordinates!
    coords = []
    for nn in range(len(nodes)):
        node = nodes[nn]
        x = Xn[nn]
        y = Yn[nn]
        z = Zn[nn]
        coord = {"name":labels[nn],"x":x,"y":y,"z":z}
        coords.append(coord)

    result = {"nodes":coords,
              "edges":edges}
    return result
