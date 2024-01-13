/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/search', 'N/config'],
    /**
     * @param{log} log
     * @param{record} record
     * @param{search} search
     * @param{redirect} redirect
     * @param{email} email
     * @param{runtime} runtime
     */
    function (log, search, config) {
        var contentFile = "";

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {

            try {
                var request = context.request;
                // log.debug({title: 'onRequest - request', details: request});
                var response = context.response;
                var parameters = request.parameters;
                log.debug({title: 'onRequest - parameters', details: parameters});
                var jsonReponse = {};
                var page = (parameters.page) ? parameters.page : 0;
                page = page * 1;
                var tranid = (parameters.tranid) ? parameters.tranid : '';
                var datestart = (parameters.datestart) ? parameters.datestart : '';
                var datefinish = (parameters.datefinish) ? parameters.datefinish : '';
                var location_filter = (parameters.location) ? parameters.location : '';
                var item_filter = (parameters.item) ? parameters.item : '';
              	var items_filter = (parameters.items) ? parameters.items : '';
              	var sub_filter = (parameters.subsidiaries) ? parameters.subsidiaries : '';
                var pageSize = 50;


                var configid = (parameters.configid) ? parameters.configid : '';

				log.debug({title: "configId(parameters.configid)", details: configid});
              
                var companyInfo = config.load({type: config.Type.COMPANY_PREFERENCES});
                var dateinformation = companyInfo.getValue({fieldId: 'DATEFORMAT'});

                log.debug({title: 'onRequest - parameters', details: parameters});
              log.debug({title: 'onRequest - companyInfo', details: companyInfo});
                log.debug({title: 'onRequest - dateinformation', details: dateinformation});
                // log.debug({title: 'onRequest - configid', details: configid});

                if (configid) {//if(parameters.idsavedsearch){
                    if (parameters.idvendor) {
                        var configuration = getConfiguration(configid);
                        var mySearch = search.load({
                            id: configuration.savedsearch
                        });

                        log.debug({title: 'onRequest - search', details: mySearch});
                        log.debug({title: 'onRequest - configuration.vendorfield', details: configuration.vendorfield});

                        var filtersVendor = search.createFilter({
                            name: configuration.vendorfieldname,
                            join: configuration.vendorfieldjoin,
                            operator: search.Operator.IS,
                            values: parameters.idvendor
                        });
                        mySearch.filters.push(filtersVendor);
                        if (configuration.istransaction === true || configuration.istransaction === "T") {

                            //TODO: Vamos a cambiar esto
                            if (datestart || datefinish) {
                                var filtersDate = search.createFilter({
                                    name: 'trandate',
                                    operator: search.Operator.WITHIN,
                                    values: [datestart, datefinish]
                                });
                                mySearch.filters.push(filtersDate);
                            }

                            //TODO:Vamos a cambiar esto
                            if (tranid) {
                                var filtersTranid = search.createFilter({
                                    name: 'tranid',
                                    operator: search.Operator.IS,
                                    values: tranid
                                });
                                mySearch.filters.push(filtersTranid);
                            }
                          	if (items_filter) {
                              var itemsarray = items_filter.split(',');
                                var filtersItem = search.createFilter({
                                    name: 'item',
                                    operator: search.Operator.ANYOF,
                                    values: itemsarray
                                });
                                mySearch.filters.push(filtersItem)
                            }
                          
                          
                            
                            if(sub_filter){
                              var subarray = sub_filter.split(',');
                              log.debug("subarray",subarray)
                                var filtersItem = search.createFilter({
                                    name: 'subsidiary',
                                    operator: search.Operator.ANYOF,
                                    values: subarray
                                });
                                mySearch.filters.push(filtersItem)
                            }
                        } else {
                            if (location_filter) {
                              var locationarray = location_filter.split(",");
                                var filtersLocation = search.createFilter({
                                    name: 'inventorylocation',
                                    operator: search.Operator.ANYOF,
                                    values: locationarray
                                });
                                mySearch.filters.push(filtersLocation);
                            }
                            if (items_filter) {
                              var itemsarray = items_filter.split(',');
                                var filtersItem = search.createFilter({
                                    name: 'internalid',
                                    operator: search.Operator.ANYOF,
                                    values: itemsarray
                                });
                                mySearch.filters.push(filtersItem)
                            }
                        }

                        log.debug({title: 'onRequest - mySearch.filters', details: mySearch.filters});

                        var mySearchPaged = mySearch.runPaged({pageSize: pageSize});
                        log.debug({title: 'onRequest - mySearchPaged', details: mySearchPaged});

                        jsonReponse.listPage = getListPage(mySearchPaged);
                      	
                      	log.debug({title: "DM_getListPage", details: jsonReponse.listPage});
                        page = (page > (jsonReponse.listPage.length - 1)) ? (jsonReponse.listPage.length - 1) : page;
                        page = (page < 0) ? 0 : page;
                      
                      	if(configuration.limitresults){
                          jsonReponse.listPage = [];
                          jsonReponse.listPage.push(jsonReponse.listPage[0]);
                          page = 0;
                        }
                        jsonReponse.data = getPageData(mySearchPaged, page, mySearch.columns, configuration.limitresults);
                        jsonReponse.columns = getColumns(mySearch);
                        jsonReponse.page = page;
                        jsonReponse.filtersui = configuration.filtersui;
                        jsonReponse.title = configuration.title;
                        jsonReponse.success = true;
                    } else {
                        jsonReponse.success = false;
                        jsonReponse.msg = "No se ha enviado el parametro requerido: idvendor";
                    }
                } else {
                    jsonReponse.success = false;
                    jsonReponse.msg = "No se ha enviado el parametro requerido: configid";
                }
            } catch (e) {
                log.error({title: 'onRequest', details: e});
                jsonReponse.success = false;
                jsonReponse.msg = "No ha sido posible obtener la información para mostrar.";
            }
            log.audit("jsonReponse", jsonReponse);
            response.writeLine({
                output: JSON.stringify(jsonReponse)
            });
        }

        function getColumns(savedSearch) {
            try {
                var columns = [];
                for (var i = 0; i < savedSearch.columns.length; i++) {
                    var columnlabel = savedSearch.columns[i].label;
                    var columntype = savedSearch.columns[i].type;
                    log.debug("columntype", savedSearch.columns[i]);
                    var columnname = savedSearch.columns[i].name;
                    if (savedSearch.columns[i].join) {
                        columnname += "." + savedSearch.columns[i].join;
                    }
                    columns.push(savedSearch.columns[i]);
                }
                log.debug({title: 'getColumns - return', details: columns});
                return columns;
            } catch (e) {
                log.error({title: 'getColumns', details: e});
            }
        }

        function getPageData(searchPaged, page, columns, limitresults) {
            try {
                log.audit({title: " Getting page Data", details: '...Start'});
                var pageData = searchPaged.fetch({index: page});
                log.audit({title: " getPageData pageData", details: pageData});
                log.audit({title: " getPageData columns", details: columns});
                log.audit({title: " getPageData limitresults", details: limitresults});

                //Get information of page
                var resultData = [];
                var resultObject = {};
                // log.audit("pageData.data", pageData.data);
                var countresults = 0;
              	limitresults = (limitresults)?limitresults*1:'';
                pageData
                    .data
                    .forEach(function (result) {
                        log.audit("getPageData limitresults", limitresults);
                  		log.audit("getPageData countresults", countresults);
                        if(limitresults){
                          if(limitresults - 1 <= countresults){
                            return false;
                          }
                        }
                  		log.audit("getPageData result", result);
                        for (var i in columns) {
                            resultObject['id'] = result.id;
                            var name = columns[i].name;
                            if (columns[i].join) {
                                name += "_" + columns[i].join;
                            }
                            name = name.toLowerCase();
                            var text = result.getText(columns[i]);
                            if (text) {
                                resultObject[name] = text || '-';
                                resultObject[name + "_id"] = result.getValue(columns[i]) || '-';
                            } else {
                                resultObject[name] = result.getValue(columns[i]) || '-';
                            }
                        }
                  		log.audit("getPageData resultData", resultData);
                        resultData.push(resultObject);
                  		countresults++;
                        resultObject = {};
                  		return true;
                    });

                log.audit({title: " getPageData RETURNING", details: resultData});
                return resultData;

            } catch (error) {
                log.error({title: 'getPageData error', details: error});
                return [];
            }
        }


        function getListPage(searchPaged) {
            try {
                var objectResult = [];

                log.audit({title: 'searchPaged', details: searchPaged});
                log.audit({title: 'Getting list page', details: '... Start'});
                searchPaged
                    .pageRanges
                    .forEach(function (pageRange) {
                        // log.audit("pageRange", pageRange);

                        objectResult.push({index: pageRange.index, text: "Página " + (pageRange.index + 1)});
                    });

                log.audit({title: 'Getting return', details: objectResult});

                return objectResult;
            } catch (error) {
                log.error({title: 'getListPage error', details: error});
                return [];
            }
        }

        /**
         * Datos de Filtros
         */
        function getFilters(configid) {
            try {
                var customrecord_efx_pp_reports_filtersSearchObj = search.create({
                    type: "customrecord_efx_pp_reports_filters",
                    filters:
                        [
                            ["custrecord_efx_pp_filter_report", "anyof", configid]
                        ],
                    columns:
                        [
                            search.createColumn({name: "scriptid", label: "ID de script"}),
                            search.createColumn({name: "custrecord_efx_pp_filter_field", label: "Campo"}),
                            search.createColumn({
                                name: "custrecord_efx_pp_filter_field_id",
                                label: "Identificador de campo"
                            }),
                            search.createColumn({name: "custrecord_efx_pp_filter_type", label: "Tipo de campo"}),
                            search.createColumn({name: "custrecord_efx_pp_record_type", label: "Tipo de registro"}),
                            search.createColumn({name: "custrecord_efx_pp_record_type_ns", label: "Registro"}),
                            search.createColumn({name: "custrecord_efx_pp_field_label", label: "Etiqueta"})
                        ]
                });
                var arrayData = [];
                customrecord_efx_pp_reports_filtersSearchObj.run().each(function (result) {
                    log.debug("results", result);
                    arrayData.push({
                        id: result.getValue({
                            name: "custrecord_efx_pp_filter_field_id",
                            label: "Identificador de campo"
                        }).toLowerCase(),
                        name: result.getValue({name: "custrecord_efx_pp_field_label", label: "Etiqueta"}),
                        type: result.getValue({name: "custrecord_efx_pp_filter_type", label: "Tipo de campo"}),
                        register: result.getValue({name: "custrecord_efx_pp_record_type_ns", label: "Registro"}),
                    })
                    return true;
                });
                return arrayData;
            } catch (error) {
                log.error({title: 'getFilters error', details: error});
                return [];
            }
        }

        /**
         * Datos de configuración
         */
        function getConfiguration(id) {
            try {
                var customrecord_efx_pp_reportsSearchObj = search.create({
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
                            search.createColumn({name: "custrecord_efx_pp_transaction", label: "Transaccion"}),
                          search.createColumn({name: "custrecord_efx_pp_count_results", label: "Transaccion"})
                        ]
                });
                var configResults = customrecord_efx_pp_reportsSearchObj.run().getRange(0, 10);
                if (configResults.length) {
                    var fieldstructure = configResults[0].getValue({
                        name: "custrecord_efx_pp_vendor_field",
                        label: "Campo de proveedor"
                    });
                    fieldstructure = fieldstructure.split(".");

                    var configData = {
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
                        "istransaction": configResults[0].getValue({name: "custrecord_efx_pp_transaction", label: "Transaccion"}),
                      	"limitresults": configResults[0].getValue({name: "custrecord_efx_pp_count_results", label: "Transaccion"}),
                    };

                    if (fieldstructure.length > 1) {
                        configData["vendorfieldname"] = fieldstructure[1];
                        configData["vendorfieldjoin"] = fieldstructure[0];
                    } else {
                        configData["vendorfieldname"] = fieldstructure[0];
                        configData["vendorfieldjoin"] = '';
                    }
                    configData["filtersui"] = getFilters(id);

                    return configData;
                } else {
                    return null;
                }

            } catch (error) {
                log.error({title: 'getConfiguration error', details: error});
                return null;
            }
        }

        return {
            onRequest: onRequest
        };

    });
