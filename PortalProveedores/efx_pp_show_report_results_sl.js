/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/url', 'N/ui/serverWidget', 'N/runtime', 'N/https', 'N/search'],
    /**
     * @param{log} log
     * @param{record} record
     * @param{url} url
     * @param{serverWidget} servcustrecord_efx_pp_subsidiary_filtererWidget
     * @param{runtime} runtime
     * @param{https} httpsnnameame
     * @param{search} search
     */
    function (log, url, serverWidget, runtime, https, search) {
        var SCRIPT_WS = "customscript_efx_pp_get_saved_search_sl";
        var DEPLOY_WS = "customdeploy_efx_pp_get_saved_search_sl";
        var FRM_NAME = "Nombre del reporte";
        var MSG_ERROR = "Ha ocurrido un error al tratar de mostrar el formulario, contacte al administrador de su instancia.";
        var MSG_MISSING_SS = "No se ha configurado la fuente de información, contacte al administrador de su instancia.";
        var parameters = null;
        var page = 0;
        var datefinish = '';
        var datestart = '';
        var tranid = '';
        var filterMode = '';
        var locationOption = '';
        var itemOption = '';
  		var itemsOption = '';
  		var subsidiariesOption = '';

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
                var response = context.response;
                parameters = request.parameters;

                page = (parameters.page) ? parameters.page * 1 : 0;
                datefinish = (parameters.datefinish) ? parameters.datefinish : '';
                datestart = (parameters.datestart) ? parameters.datestart : '';
                tranid = (parameters.tranid) ? parameters.tranid : '';
                filterMode = (parameters.filter) ? parameters.filter : '';
                locationOption = (parameters.location) ? parameters.location : '';
                itemOption = (parameters.item) ? parameters.item : '';
              	itemsOption = (parameters.items) ? parameters.items : '';
              	subsidiariesOption = (parameters.subsidiaries) ? parameters.subsidiaries : '';
              log.debug({title: 'onRequest - parameters', details: parameters});


                //var idsavedsearch = runtime.getCurrentScript().getParameter({name: 'custscript_efx_pp_saved_search_report'});
                var configid = runtime.getCurrentScript().getParameter({name: 'custscript_efx_pp_config'});
                var form = null;
                var idvendor = runtime.getCurrentUser().id;
                if (!configid) {
                    form = errorForm(MSG_MISSING_SS)
                } else {
                    var objConfig = getConfigForm(configid);
                    log.debug({title: 'object config', details: objConfig});
                    if (objConfig != null) {
                        form = createReport(objConfig);
						log.debug({title: 'form', details: form});
                        var dataResponse = getSavedSearchInformation(configid, idvendor, page, objConfig.custrecord_efx_pp_saved_search);
                        if (!dataResponse) {
                            form = errorForm();
                        } else {
                            assingData(form, dataResponse, objConfig)
                        }
                    } else {
                        form = errorForm(MSG_MISSING_SS)
                    }
                    /*var dataResponse = getSavedSearchInformation(configid, idvendor, page, idsavedsearch);
                    form = createReport(dataResponse);
                    log.debug({title: 'onRequest - dataResponse', details: dataResponse});
                    if (!dataResponse) {
                        form = errorForm();
                    } else {
                        assingData(form, dataResponse)
                    }*/

                }

                /*FRM_NAME = runtime.getCurrentScript().getParameter({name: 'custscript_efx_pp_title'});
                var idvendor = runtime.getCurrentUser().id;

                log.debug({title: 'onRequest - parameters', details: parameters});
                log.debug({title: 'onRequest - Búsqueda guardada', details: idsavedsearch});
                log.debug({title: 'onRequest - Configuración', details: configid});
                log.debug({title: 'onRequest - Proveedor', details: idvendor});*/

            } catch (e) {
                log.error({title: 'onRequest', details: e});
                form = errorForm();
            }
            if (form) {
                response.writePage({
                    pageObject: form
                });
            } else {
                response.write({
                    pageObject: MSG_ERROR
                });
            }

        }

        function getSavedSearchInformation(configid, idvendor, page, idsavedsearch) {
            try {
                var urlservice = url.resolveScript({
                    scriptId: SCRIPT_WS,
                    deploymentId: DEPLOY_WS,
                    returnExternalUrl: true,
                    params: {
                        idsavedsearch: idsavedsearch,
                        idvendor: idvendor,
                        page: page,
                        datestart: datestart,
                        datefinish: datefinish,
                        tranid: tranid,
                        configid: configid,
                        location: locationOption,
                        item: itemOption,
                      	items: itemsOption,
                      	subsidiaries: subsidiariesOption
                    }
                });

                log.debug({title: 'onRequest - URL WS', details: urlservice});
                var response = https.get({
                    url: urlservice,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                log.debug({title: 'getSavedSearchInformation - Respuesta del servicio', details: response});
                log.debug({title: 'getSavedSearchInformation - Type of body', details: typeof response.body});
                log.debug({title: 'getSavedSearchInformation - Body', details: response.body});
                var body = {};
                if (typeof response.body == 'string') { //ELIMINAR CARACTERES NO DESEADOS EN PETICIÓN
                    var indexstart = response.body.indexOf("<!--") * 1;
                    log.debug({title: 'getSavedSearchInformation - index start', details: indexstart});

                    var indexfinish = response.body.lastIndexOf("-->") * 1;
                    log.debug({title: 'getSavedSearchInformation - index finish', details: indexfinish});
                    indexfinish += 3;
                    log.debug({title: 'getSavedSearchInformation - index finish', details: indexfinish});

                    var totalchars = indexfinish - indexstart;
                    log.debug({title: 'getSavedSearchInformation - totalchars', details: totalchars});

                    var characters = response.body.slice(indexstart, indexfinish);
                    log.debug({title: 'getSavedSearchInformation - characters', details: characters});

                    body = response.body.replace(characters, '');
                } else {
                    body = response.body;
                }

                return (typeof body == 'string') ? JSON.parse(body) : body;
            } catch (e) {
                log.error({title: 'getSavedSearchInformation', details: e});
                return {succes: false, msg: "No ha sido posible obtener la información del "}
            }
        }

        /**
         * Formulario que se muestra cuando ha ocurrido un error.
         */
        function errorForm(errorMsg) {
            try {
                log.debug({title: 'erroForm', details: 'Creando el formulario de error'});
                var form = serverWidget.createForm({
                    title: FRM_NAME
                });
                var htmlFld = form.addField({
                    id: 'custpage_error_msg',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: ' '
                });

                htmlFld.defaultValue = '<b style="font-size:14px">' + (errorMsg || MSG_ERROR) + '</b>'
                log.debug({title: 'erroForm', details: 'Formulario de error creado.'});
                return form;
            } catch (e) {
                log.error({title: 'errorForm', details: e});
                return null;
            }
        }


        /**
         * Función que crea el formulario a partir de la búsqueda guardada configurada
         */
        function createReport(data) {
            try {
                log.debug({title: 'createReport', details: 'Creando el formulario'});
                var form = serverWidget.createForm({
                    title: data.custrecord_efx_pp_title
                });

                form.clientScriptModulePath = './efx_pp_show_report_results_cs.js';

                form.addButton({
                    id: 'custpage_filter',
                    label: 'Filtrar',
                    functionName: 'filter'
                });
                var config_fld = form.addField({
                    id: 'custpage_config_data',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'config site'
                });
                config_fld.defaultValue = JSON.stringify(data);
                config_fld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                var deploymentFld = form.addField({
                    id: 'custpage_deploymentid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'DEPLOYMENTID'
                });

                deploymentFld.defaultValue = runtime.getCurrentScript().deploymentId;
                deploymentFld.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                getFiltersField(form, data);
                return form;
            } catch (e) {
                log.error({title: 'onRequest', details: e});
                return null;
            }
        }

        function assingData(form, data, config) {
            try {
                addSublist(form, data.columns, data.data, config);
                if (filterMode && filterMode === "T") {
                    getPaginationField(form, data.listPage);
                }
            } catch (e) {
                log.error({title: 'Error on assingData', details: e});
            }
        }

        function addSublist(form, columns, data, config) {
            try {
                if ((config.custrecord_efx_pp_allow_csv === true || config.custrecord_efx_pp_allow_csv === "T") && (filterMode && filterMode === "T")) {
                    form.addButton({
                        id: "custpage_download_csv",
                        label: "CSV",
                        functionName: 'exportData'
                    });
                }
                var sublist = form.addSublist({
                    id: 'custpage_results',
                    type: serverWidget.SublistType.LIST,
                    label: ' '
                });
                if (config.custrecord_efx_pp_inlude_transaction === true || config.custrecord_efx_pp_inlude_transaction === "T") {
                    var fieldDocumentSublist = sublist.addField({
                        id: "custpage_doc_url",
                        type: serverWidget.FieldType.TEXT,
                        label: "PDF"
                    })
                }
                for (var i = 0; i < columns.length; i++) {
                    var type = '';
                    if (
                        columns[i].type == serverWidget.FieldType.CURRENCY ||
                      columns[i].type == "float" ||
                      columns[i].type == "currency" ||
                      columns[i].type == "integer" ||
                        columns[i].type == serverWidget.FieldType.FLOAT ||
                        columns[i].type == serverWidget.FieldType.INTEGER
                    ) {
                        type = serverWidget.FieldType.CURRENCY;
                    } else {
                        type = serverWidget.FieldType.TEXT;
                    }
                  if(columns[i].name == 'custbody_efx_uid_ip_pdf'){
                    continue;
                  }
					log.debug("columns[i]", columns[i]);
                  log.debug("columns[i].type", columns[i].type);
                  log.debug("type", type);
                  

                    var idfield = (columns[i].join) ? columns[i].name + "_" + columns[i].join : columns[i].name;
                    log.debug("idfield", idfield.toLowerCase());
                    if (idfield != "internalid" && idfield != "recordtype") {
                        var fieldSublist = sublist.addField({
                            id: "custpage_" + (idfield.toLowerCase()),
                            type: type,
                            label: (columns[i].label == 'Quantity')?"Cantidad": columns[i].label
                        });
                    }
                }
                if (filterMode && filterMode === "T") {
                    addData(sublist, data, config);
                }

                return true;
            } catch (e) {
                log.error({title: 'onRequest', details: e});
                return false;
            }
        }

        function addData(sublist, data, config) {
            try {

                for (var i = 0; i < data.length; i++) {
                    for (var key in data[i]) {
                        //log.debug("result", key + " - "+data[i][key]);
                        if (key.indexOf("_id") != -1 || key == 'custbody_efx_uid_ip_pdf') {
                            continue;
                        }
                        if (config.custrecord_efx_pp_inlude_transaction === true || config.custrecord_efx_pp_inlude_transaction === "T") {
                            var resolvePDF = null;
                            var link = "";
                            if (data[i]['tranid_createdfrom'] != "-" && data[i]['recordtype'] != "vendorcredit" && data[i]['recordtype'] != "vendorbill") {
                                resolvePDF = getResolvePDF(data[i]['internalid'], data[i]['recordtype'])
                            }
                          else if((data[i]['recordtype'] == "vendorcredit" || data[i]['recordtype'] == "vendorbill") && data[i]['custbody_efx_uid_ip_pdf_id']){
                            resolvePDF = getResolvePDF(null, null, (data[i]['custbody_efx_uid_ip_pdf_id']));
                          }
                          	
                            link = (resolvePDF != null) ? "<a href='" + resolvePDF + "' target='_blank'>PDF</a>" : "-";
                            sublist.setSublistValue({
                                id: "custpage_doc_url",
                                line: i,
                                value: link
                            });
                        }
                        if (key != "internalid" && key != "recordtype") {
                            sublist.setSublistValue({
                                id: "custpage_" + key,
                                line: i,
                                value: data[i][key]
                            });
                        }
                    }

                }
                return true;
            } catch (e) {
                log.error({title: 'addData', details: e});
                return false;
            }
        }

        function getPaginationField(form, list) {
            try {

                var selectField = form.addField({
                    id: 'custpage_pagination',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Paginación'
                });

                for (var i in list) {
                    selectField.addSelectOption({
                        value: list[i].index,
                        text: list[i].text
                    });
                }
                selectField.defaultValue = parameters.page;
                return true;
            } catch (e) {
                log.error({title: 'getPaginationField', details: e});
                return false;
            }
        }

        function getFiltersField(form, config) {
            try {
            
                if (config.custrecord_efx_pp_transaction === true || config.custrecord_efx_pp_transaction === "T") {
                    /*var tranid_fld = form.addField({
                        id: 'custpage_tranid',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Número de transacción'
                    });

                    tranid_fld.defaultValue = tranid;*/

                    var startdate = form.addField({
                        id: 'custpage_date_start',
                        type: serverWidget.FieldType.DATE,
                        label: 'Fecha de incio'
                    });

                    startdate.defaultValue = datestart;

                    var finishdate = form.addField({
                        id: 'custpage_date_finish',
                        type: serverWidget.FieldType.DATE,
                        label: 'Fecha de fin'
                    });

                    finishdate.defaultValue = datefinish;
                  
                  
                
                } else {
                    //Filtro para no transacción
                    var location_fld = null;
                    var item_fld = null;
                    if (config.custrecord_efx_pp_subsidiary_filter === true || config.custrecord_efx_pp_subsidiary_filter === "T") {
                        var subsidiary_vendor = runtime.getCurrentUser().subsidiary;
                        var filters = getFiltersBySubsidiary(subsidiary_vendor);
                        location_fld = form.addField({
                            id: 'custpage_location_filter',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Ubicación'
                        });
                        item_fld = form.addField({
                            id: 'custpage_item_filter',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Artículo'
                        });
                        if (filters != null) {
                            if (filters.locations.length) {
                                location_fld.addSelectOption({
                                    value: '',
                                    text: ''
                                });
                                for (var i = 0; i < filters.locations.length; i++) {
                                    location_fld.addSelectOption({
                                        value: filters.locations[i].value,
                                        text: filters.locations[i].text
                                    });
                                }
                            }
                            if (filters.items.length) {
                                item_fld.addSelectOption({
                                    value: '',
                                    text: ''
                                });
                                for (var i = 0; i < filters.items.length; i++) {
                                    item_fld.addSelectOption({
                                        value: filters.items[i].value,
                                        text: filters.items[i].text
                                    });
                                }
                            }
                        }
                    } else {
                        location_fld = form.addField({
                            id: 'custpage_location_filter',
                            type: serverWidget.FieldType.MULTISELECT,
                            label: 'Ubicación',
                            source: 'location'
                        });
                        /*item_fld = form.addField({
                            id: 'custpage_item_filter',
                            type: serverWidget.FieldType.SELECT,
                            label: 'Artículo',
                            source: 'item'
                        });/¿*/
                    }
                    if (location_fld != null && locationOption != '') {
                        location_fld.defaultValue = locationOption.split(",");
                    }
                    /*if (item_fld != null && itemOption != '') {
                        item_fld.defaultValue = itemOption;
                    }*/
                }
              
                if (config.custrecord_efx_pp_subsidiary_filter === true || config.custrecord_efx_pp_subsidiary_filter === "T") {
                var subsidiary = form.addField({
                        id: 'custpage_subsidiary',
                        type: serverWidget.FieldType.MULTISELECT,
                        label: 'Subsidiaria',
                    	//source: 'subsidiary'
                    });
                  var resultsSubsidiary = getVendorSubsidiary(runtime.getCurrentUser().id);
                  
                  subsidiary.addSelectOption({
                          value : '-1',
                          text : "Todas las subsidiarias"
                        });
                                    
                  for(var i in resultsSubsidiary){
                    subsidiary.addSelectOption({
                          value : resultsSubsidiary[i].value,
                          text : resultsSubsidiary[i].text
                        });
                  }
                  if(subsidiariesOption){
                  	subsidiary.defaultValue = subsidiariesOption.split(',');  
                  }
                  else{
                    subsidiary.defaultValue = "-1";
                  }
              }
              if (config.custrecord_efx_pp_item_filter === true || config.custrecord_efx_pp_item_filter === "T") {
                
                  var itemfld = form.addField({
                        id: 'custpage_item',
                        type: serverWidget.FieldType.MULTISELECT,
                        label: 'Artículo',
                    //	source: 'item'
                    });
                  
                  var resultsitem = getItemData(runtime.getCurrentUser().id);
                itemfld.addSelectOption({
                          value : -1,
                          text : 'Todos los artículos'
                        });
                  for(var i in resultsitem){
                    itemfld.addSelectOption({
                          value : resultsitem[i].value,
                          text : resultsitem[i].text
                        });
                  }
                if(itemsOption){
                	itemfld.defaultValue = itemsOption.split(',');  
                }
                else{
                  itemfld.defaultValue = "-1";
                }
                
              }


                return true;
            } catch (e) {
                log.error({title: 'getFiltersField', details: e});
                return false;
            }
        }

        /**
         * Funcion de obtención de registro de configuracion
         * @param id
         * @returns {null|{name: string, custrecord_efx_pp_inlude_transaction: string, custrecord_efx_pp_allow_csv: string, custrecord_efx_pp_saved_search: string, custrecord_efx_pp_vendor_field: string, custrecord_efx_pp_subsidiary_filter: string, custrecord_efx_pp_transaction: string, custrecord_efx_pp_title: string}}
         */
        function getConfigForm(id) {
            try {
                var objSearch = search.create({
                    type: "customrecord_efx_pp_reports",
                    filters: [
                        ["isinactive", search.Operator.IS, "F"],
                        "AND",
                        ["internalid", search.Operator.ANYOF, id]
                    ],
                    columns: [
                        {name: "name"},
                        {name: "internalid"},
                        {name: "custrecord_efx_pp_title"},
                        {name: "custrecord_efx_pp_saved_search"},
                        {name: "custrecord_efx_pp_vendor_field"},
                        {name: "custrecord_efx_pp_transaction"},
                        {name: "custrecord_efx_pp_inlude_transaction"},
                        {name: "custrecord_efx_pp_allow_csv"},
                        {name: "custrecord_efx_pp_subsidiary_filter"},
                      {name: "custrecord_efx_pp_item_filter"}
                    ]
                });
                if (objSearch.runPaged().count > 0) {
                    var result = objSearch.run().getRange({start: 0, end: 10});
                    return {
                        name: result[0].getValue({name: "name"}),
                        id: result[0].getValue({name: "internalid"}),
                        custrecord_efx_pp_title: result[0].getValue({name: "custrecord_efx_pp_title"}),
                        custrecord_efx_pp_saved_search: result[0].getValue({name: "custrecord_efx_pp_saved_search"}),
                        custrecord_efx_pp_vendor_field: result[0].getValue({name: "custrecord_efx_pp_vendor_field"}),
                        custrecord_efx_pp_transaction: result[0].getValue({name: "custrecord_efx_pp_transaction"}),
                        custrecord_efx_pp_inlude_transaction: result[0].getValue({name: "custrecord_efx_pp_inlude_transaction"}),
                        custrecord_efx_pp_allow_csv: result[0].getValue({name: "custrecord_efx_pp_allow_csv"}),
                        custrecord_efx_pp_subsidiary_filter: result[0].getValue({name: "custrecord_efx_pp_subsidiary_filter"}),
                      custrecord_efx_pp_item_filter: result[0].getValue({name: "custrecord_efx_pp_item_filter"})
                    }
                } else {
                    return null;
                }

            } catch (e) {
                log.error({title: 'Error on getConfigForm', details: e});
                return null;
            }
        }
  
  
  
  
  /**
         * Función para obtener artículos de proveedor
         * @param id
         * @returns {null|[{value:'', text:''}]
         */
        function getItemData(id) {
            try {
                var itemSearchObj = search.create({
                    type: search.Type.ITEM,
                    filters: [
                        ["isinactive", search.Operator.IS, "F"],
                        "AND",
                        ["vendor", search.Operator.IS, id]
                    ],
                    columns: [
                        {name: "vendorcode"},
                        {name: "internalid"},
                        {name: "itemid"},
                        {name: "displayname"}
                    ]
                });
              var results = [];
              var items = [];
              itemSearchObj.run().each(function(result){
                 var vendorcode = result.getValue({name: "vendorcode"});
                 var internalid = result.getValue({name: "internalid"});
                 var itemid = result.getValue({name: "itemid"});
                 var displayname = result.getValue({name: "displayname"});
                 var text = '';
                 if(items.indexOf(internalid) == -1){
                   text += (vendorcode)?vendorcode + " - ": "";
                   text += displayname;
                   results.push({value: internalid, text: text});
                   items.push(internalid);
                 }
                 
                 return true;
              });
              
              log.error({title: 'getItemData results', details: results});
			  return results;
            } catch (e) {
                log.error({title: 'Error on getConfigForm', details: e});
                return null;
            }
        }
  
  
   		/**
         * Funcion para obtener las subsidiarias del proveedor
         * @param id
         * @returns {[]|[{value:'', text''}]
         */
        function getVendorSubsidiary(id) {
            try {
                var itemSearchObj = search.create({
                    type: search.Type.SUBSIDIARY,
                    filters: [
                        ["isinactive", search.Operator.IS, "F"]
                    ],
                    columns: [
                        {name: "name"},
                      {name: "internalid"}
                    ]
                });
              var results = [];
              itemSearchObj.run().each(function(result){
                 var name = result.getValue({name: "name"});
                 var internalid = result.getValue({name: "internalid"});
                results.push({value: internalid, text: name});
                 return true;
              });
              
              log.error({title: 'getItemData results', details: results});
			  return results;
                /*var fieldLookUp = search.lookupFields({
                    type: search.Type.VENDOR,
                    id: id,
                    columns: ['subsidiary']
                });
               log.debug({title: 'getVendorSubsidiary', details: fieldLookUp});
              if(fieldLookUp['subsidiary'].length){
                return fieldLookUp['subsidiary'];
              }
              else{
                return [];
              }*/
                

            } catch (e) {
                log.error({title: 'Error on getConfigForm', details: e});
                return null;
            }
        }

        /**
         * Generacion de url para pdf
         * @param id
         * @param type
         * @returns {String|null}
         */
        function getResolvePDF(id, type,file) {
            try {
                var resolveUrl = url.resolveScript({
                    scriptId: 'customscript_efx_pp_render_transaction',
                    deploymentId: 'customdeploy_efx_pp_render_transaction',
                    params: {
                        tranid: id,
                        typetran: type,
                        file: file
                    },
                    returnExternalUrl: true
                });
                return resolveUrl;
            } catch (e) {
                log.error({title: 'Error on resolvePDF', details: e});
                return null
            }
        }

        function getFiltersBySubsidiary(subsidiary) {
            try {
                var data = {}
                var searchLocations = search.create({
                    type: search.Type.LOCATION,
                    filters: [['isinactive', search.Operator.IS, 'F'], 'AND', ['subsidiary', search.Operator.IS, subsidiary]],
                    columns: [
                        {name: 'internalid'},
                        {name: 'name'}
                    ]
                });
                var locations = [];
                searchLocations.run().each(function (result) {
                    locations.push({
                        value: result.getValue({name: 'internalid'}),
                        text: result.getValue({name: 'name'})
                    });
                });
                var searchItems = search.create({
                    type: search.Type.ITEM,
                    filters: [['isinactive', search.Operator.IS, 'F'], 'AND', ['subsidiary', search.Operator.IS, subsidiary]],
                    columns: [
                        {name: 'internalid'},
                        {name: 'itemid'},
                        {name: 'displayname'}
                    ]
                });
                var items = [];
                searchItems.run().each(function (result) {
                    items.push({
                        value: result.getValue({name: 'internalid'}),
                        text: result.getValue({name: 'itemid'}) + ' ' + result.getValue({name: 'displayname'})
                    })
                });
                data['locations'] = locations;
                data['items'] = items;
                return data;
            } catch (e) {
                log.error({title: 'Error on getFiltersBySubsidiary', details: e});
                return null;
            }
        }

        return {
            onRequest: onRequest
        }
    }
);