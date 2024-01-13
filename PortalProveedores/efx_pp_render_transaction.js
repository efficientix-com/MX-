/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/log', 'N/record', 'N/redirect', 'N/render', 'N/search', 'N/ui/serverWidget', 'N/url'],
    /**
     * @param{file} file
     * @param{log} log
     * @param{record} record
     * @param{redirect} redirect
     * @param{render} render
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (file, log, record, redirect, render, search, serverWidget, url) => {
        let MSG_ERROR = "Ha ocurrido un error al tratar de renderizar la transacción, contacte al administrador de su instancia.";
        let MSG_ERROR_EXPORT = "Ha ocurrido un error al tratar de exportar la información, contacte al administrador de su instancia.";
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                let request = scriptContext.request, response = scriptContext.response, params = request.parameters;
                let recordID = params.tranid;
                let typeReg = params.typetran;
                let transactionFile = null;
                let exportCSV = params.csv;
                log.audit({title: 'Parameters', details: params});
                if (exportCSV && exportCSV === "T") {
                    if (params.config && params.vendor) {
                        let config = getConfig(params.config);
                        log.debug({title: 'config', details: config});
                        if (config != null) {
                            let parameters = {
                                tranid: params.tranid,
                                datestart: params.datestart,
                                datefinish: params.datefinish,
                                location: (params.location)?params.location.split(","):"",
                                item: params.item,
                              	items: (params.items)?params.items.split(","):"",
                              	subsidiaries: (params.subsidiaries)?params.subsidiaries.split(","):"",
                            }
                            let data = getDataForSearch(config, params.vendor, parameters);
                            if (data != null) {
                                log.audit({title: 'type of', details: typeof data});
                                // response.writeLine({output: data})
                                let fileID = generateCSV(data);
                                if (fileID) {
                                    var urlFile = getFileURL(fileID);
                                    log.debug({title: 'Url', details: urlFile});
                                    if (urlFile) {
                                        redirect.redirect({
                                            url: urlFile
                                        });
                                    }
                                }
                            } else {
                                let form = showError(MSG_ERROR_EXPORT);
                                response.writePage({pageObject: form});
                            }
                        } else {
                            let form = showError(MSG_ERROR_EXPORT);
                            response.writePage({pageObject: form});
                        }
                    } else {
                        let form = showError(MSG_ERROR_EXPORT);
                        response.writePage({pageObject: form});
                    }
                } 
              else if(params.file){
                var fileObj = file.load({
                    id: params.file
                });
                response.writeFile({
                        file: fileObj,
                        isInline: true
                    });
                      
                      }
              else {
                    if (recordID && typeReg) {
                        log.audit({title: 'params data', details: {recoidid: recordID, recordtype: typeReg}});
                        switch (typeReg) {
                            case "vendorbill":
                                let recordData = search.lookupFields({
                                    type: typeReg,
                                    id: recordID,
                                    columns: ['createdFrom.internalid', "createdFrom.type"]
                                });
                                log.audit({title: 'recordData', details: recordData});
                                /**/
                                log.audit({
                                    title: 'created from',
                                    details: (recordData['createdFrom.internalid'][0].value * 1)
                                });
                                let id = (recordData['createdFrom.internalid'][0].value * 1);
                                transactionFile = render.transaction({
                                    entityId: id,
                                    printMode: render.PrintMode.PDF,
                                    inCustLocale: true
                                });
                                break;
                            case "vendorcredit":
                                let renderer = render.create();
                                let searchLoad = search.load({id: 1992});
                                let filters = searchLoad.filters;
                                let customFltr = search.createFilter({
                                    name: 'internalid',
                                    operator: search.Operator.IS,
                                    values: recordID
                                });
                                filters.push(customFltr);
                                searchLoad.filters = filters;
                                log.audit({title: 'filters mod', details: searchLoad.filters});
                                let rs = searchLoad.run();
                                let results = rs.getRange(0, 1000);
                                renderer.addSearchResults({
                                    templateName: 'results',
                                    searchResult: results
                                });
                                renderer.setTemplateById(291);

                                transactionFile = renderer.renderAsPdf();
                                break;
                            case "invoice":
                                transactionFile = render.transaction({
                                    entityId: (recordID * 1),
                                    printMode: render.PrintMode.PDF,
                                    inCustLocale: true
                                });
                                break;
                            case "cashsale":
                                transactionFile = render.transaction({
                                    entityId: (recordID * 1),
                                    printMode: render.PrintMode.PDF,
                                    inCustLocale: true
                                });
                                break;
                        }
                        if (transactionFile != null) {
                            response.writeFile({file: transactionFile, isInline: true})
                        } else {
                            let form = showError(MSG_ERROR);
                            response.writePage({pageObject: form});
                        }
                    } else {
                        let form = showError(MSG_ERROR);
                        response.writePage({pageObject: form});
                    }
                }
            } catch (e) {
                log.error({title: 'Error on onRequest', details: e});
                let form = showError(MSG_ERROR);
                response.writePage({pageObject: form});
            }
        }

        /**
         * Crea interfaz de error
         * @param {string}msg
         */
        const showError = (msg) => {
            let form = serverWidget.createForm({
                title: ' ',
                hideNavBar: false
            });
            var htmlFld = form.addField({
                id: 'custpage_error_msg',
                type: serverWidget.FieldType.INLINEHTML,
                label: ' '
            });

            htmlFld.defaultValue = '<b style="font-size:14px">' + (msg) + '</b>'
            return form;
        }

        /**
         * Generar el archivo csv
         * @param {Object} data
         * @returns {string} file
         */
        const generateCSV = (data) => {
            try {
              log.debug("data", data);
              data = JSON.parse(data);
              let fileObj = {};
              if( data.response.length ){
                let json = data.response;
                let fields = Object.keys(json[0]);
                let cols = [];
              log.debug("cols", cols);
                for (let i in data.columns) {
                    cols.push(data.columns[i].label);
                }
                var replacer = function (key, value) {
                    return value === null ? '' : value
                }
                log.debug("csv", csv);
                var csv = json.map(function (row) {
                    return fields.map(function (fieldName) {
                        return JSON.stringify(row[fieldName], replacer)
                    }).join(',')
                })
                csv.unshift(cols.join(',')) // add header column
                csv = csv.join('\r\n');
              	log.debug("csv", csv);
              	if(csv){
                  fileObj = file.create({
                    name: 'pp_csv_import.csv',
                    fileType: file.Type.CSV,
                    encoding: file.Encoding.WINDOWS_1252,
                    contents: csv 
                });
                } 
              }
              else{
                log.debug("No data", "No data")
              fileObj = file.create({
                    name: 'pp_csv_import.csv',
                    fileType: file.Type.CSV,
                    encoding: file.Encoding.WINDOWS_1252,
                    contents: "No ha sido posible encontrar resultados" 
                });
              }
                
                fileObj.folder = -15;
                fileObj.isOnline = true;
                let fileId = fileObj.save();
                return fileId;
            } catch (e) {
                log.error({title: 'Error on generateCSV', details: e});
            }
        }

        /**
         * Obtener url del archivo
         * @param fileId
         * @returns {string|null}
         */
        const getFileURL = (fileId) => {
            try {
                let fileObj = file.load({
                    id: fileId
                });

                let fileURL = fileObj.url;
                let scheme = 'https://';
                let host = url.resolveDomain({
                    hostType: url.HostType.APPLICATION
                });

                let urlFinal = scheme + host + fileURL;
                return urlFinal;
            } catch (e) {
                log.error('Error on getFileURL', e);
                return null;
            }
        }

        /**
         * Funcion de obtención de registro de configuracion
         * @param id
         * @returns {null|{name: string, custrecord_efx_pp_inlude_transaction: string, custrecord_efx_pp_allow_csv: string, custrecord_efx_pp_saved_search: string, custrecord_efx_pp_vendor_field: string, custrecord_efx_pp_subsidiary_filter: string, custrecord_efx_pp_transaction: string, custrecord_efx_pp_title: string}}
         */
        const getConfig = (id) => {
            try {
                let customrecord_efx_pp_reportsSearchObj = search.create({
                    type: "customrecord_efx_pp_reports",
                    filters:
                        [
                            ["isinactive", "is", "F"],
                            "AND",
                            ["internalid", "anyof", id]
                        ],
                    columns:
                        [
                            search.createColumn({name: "name", label: "Nombre"}),
                            search.createColumn({
                                name: "custrecord_efx_pp_saved_search",
                                label: "Búsquedas guardadas "
                            }),
                            search.createColumn({name: "custrecord_efx_pp_vendor_field", label: "Campo de proveedor"}),
                            search.createColumn({name: "custrecord_efx_pp_title", label: "Titulo de formulario"}),
                            search.createColumn({name: "custrecord_efx_pp_transaction", label: "Transaccion"})
                        ]
                });
                let configResults = customrecord_efx_pp_reportsSearchObj.run().getRange(0, 10);
                if (configResults.length) {
                    let fieldstructure = configResults[0].getValue({
                        name: "custrecord_efx_pp_vendor_field",
                        label: "Campo de proveedor"
                    });
                    fieldstructure = fieldstructure.split(".");

                    let configData = {
                        "name": configResults[0].getValue({name: "name", label: "Nombre"}),
                        "title": configResults[0].getValue({
                            name: "custrecord_efx_pp_title",
                            label: "Titulo de formulario"
                        }),
                        "vendorfieldname": fieldstructure[0],
                        "vendorfieldjoin": (fieldstructure.length > 1) ? fieldstructure[1] : '',
                        "savedsearch": configResults[0].getValue({
                            name: "custrecord_efx_pp_saved_search",
                            label: "Búsquedas guardadas "
                        }),
                        "istransaction": configResults[0].getValue({
                            name: "custrecord_efx_pp_transaction",
                            label: "Transaccion"
                        })
                    };

                    if (fieldstructure.length > 1) {
                        configData["vendorfieldname"] = fieldstructure[1];
                        configData["vendorfieldjoin"] = fieldstructure[0];
                    } else {
                        configData["vendorfieldname"] = fieldstructure[0];
                        configData["vendorfieldjoin"] = '';
                    }

                    return configData;
                } else {
                    return null;
                }

            } catch (e) {
                log.error({title: 'Error on getConfigForm', details: e});
                return null;
            }
        }

        const getDataForSearch = (configuration, vendor, params) => {
            try {
              log.debug("getDataForSearch params", params);
                let mySearch = search.load({
                    id: configuration.savedsearch
                });

                let filtersVendor = search.createFilter({
                    name: configuration.vendorfieldname,
                    join: configuration.vendorfieldjoin,
                    operator: search.Operator.IS,
                    values: vendor
                });
                mySearch.filters.push(filtersVendor);
              
              	var itemFld = '';
                if (configuration.istransaction === true || configuration.istransaction === "T") {
                    if (params.datestart || params.datefinish) {
                        let filtersDate = search.createFilter({
                            name: 'trandate',
                            operator: search.Operator.WITHIN,
                            values: [params.datestart, params.datefinish]
                        });
                        mySearch.filters.push(filtersDate);
                    }
                   if (params.subsidiaries) {
                  let filtersSub = search.createFilter({
                    name: 'subsidiary',
                    operator: search.Operator.ANYOF,
                    values: params.subsidiaries
                  });
                  mySearch.filters.push(filtersSub)
                }
                  itemFld = 'item';
                } else {
                    if (params.location) {
                        let filtersLocation = search.createFilter({
                            name: 'inventorylocation',
                            operator: search.Operator.ANYOF,
                            values: params.location
                        });
                        mySearch.filters.push(filtersLocation);
                    }
                  itemFld = 'internalid';
                }
                if (params.items) {
                  let filtersItem = search.createFilter({
                    name: itemFld,
                    operator: search.Operator.ANYOF,
                    values: params.items
                  });
                  mySearch.filters.push(filtersItem)
                }
                let myPagedResults = mySearch.runPaged({
                    pageSize: 1000
                });
                let thePageRanges = myPagedResults.pageRanges;
                let columns = getColumns(mySearch);
                let data = {response: [], columns: columns};
                let resultObject = {};
                for (let i in thePageRanges) {
                    let thepageData = myPagedResults.fetch({
                        index: thePageRanges[i].index
                    });
                    thepageData.data.forEach(function (result) {
                        for (let j in columns) {
                            var name = columns[j].name;
                            if (name != "internalid" && name != "recordtype") {
                                if (columns[j].join) {
                                    name += "_" + columns[j].join;
                                }
                                name = name.toLowerCase();
                                var text = result.getText(columns[j]);
                                if (text) {
                                    resultObject[name] = text || '-';
                                } else {
                                    resultObject[name] = result.getValue(columns[j]) || '-';
                                }
                            }
                        }
                        data.response.push(resultObject);
                        resultObject = {};
                    });
                }
                return JSON.stringify(data)
            } catch (e) {
                log.error({title: 'Error on getDataForSearch', details: e});
                return null;
            }
        }
        /**
         *
         * @param savedSearch
         * @returns {[]}
         */
        const getColumns = (savedSearch) => {
            try {
                let columns = [];
                for (let i = 0; i < savedSearch.columns.length; i++) {
                    let columnlabel = savedSearch.columns[i].label;
                    let columntype = savedSearch.columns[i].type;
                    //log.debug("columntype", savedSearch.columns[i]);
                    let columnname = savedSearch.columns[i].name;
                    if (savedSearch.columns[i].join) {
                        columnname += "." + savedSearch.columns[i].join;
                    }
                    if (savedSearch.columns[i].name != "internalid" && savedSearch.columns[i].name != "recordtype") {
                        columns.push(savedSearch.columns[i]);
                    }
                }
                // log.debug({title: 'getColumns - return', details: columns});/
                return columns;
            } catch (e) {
                log.error({title: 'getColumns', details: e});
            }
        }

        return {onRequest}

    });
