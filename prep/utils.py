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
