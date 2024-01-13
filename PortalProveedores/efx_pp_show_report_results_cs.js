/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/https', 'N/ui/message', 'N/runtime', 'N/format'],
    /**
     * @param{currentRecord} currentRecord
     * @param{url} url
     * @param{https} https
     * @param{message} message
     * @param{runtime} runtime
     * @returns {{applyFilters: applyFilters, sendFunction: sendFunction, fieldChanged: fieldChanged}}
     */


    function (currentRecord, url, https, message, runtime, format) {
        var SCRIPT_REPORT = 'customscript_efx_pp_show_report_res_sl';
        var DEPLOY_REPORT = 'customdeploy_efx_pp_show_rr_example_sl';

        function pageInit(scriptContext) {

        }

        function filter() {
            try {
                var currentForm = currentRecord.get();
                var custpage_pagination = currentForm.getValue({
                    fieldId: 'custpage_pagination'
                });
                var custpage_deploymentid = currentForm.getValue({
                    fieldId: 'custpage_deploymentid'
                });
                var custpage_config_data = currentForm.getValue({
                    fieldId: 'custpage_config_data'
                });
                console.log({custpage_deploymentid: custpage_deploymentid, custpage_config_data: custpage_config_data});
                var params = {};
                if (custpage_config_data != "" && custpage_config_data != null) {
                    custpage_config_data = JSON.parse(custpage_config_data);
                    if (custpage_config_data.custrecord_efx_pp_transaction === true || custpage_config_data.custrecord_efx_pp_transaction === "T") {
                        var custpage_date_start = currentForm.getText({
                            fieldId: 'custpage_date_start'
                        });
                        if (custpage_date_start) {
                            custpage_date_start = format.format({value: custpage_date_start, type: format.Type.TEXT});
                            console.log(custpage_date_start);
                        }
                        var custpage_date_finish = currentForm.getText({
                            fieldId: 'custpage_date_finish'
                        });
                        if (custpage_date_finish) {
                            custpage_date_finish = format.format({value: custpage_date_finish, type: format.Type.TEXT});
                            console.log(custpage_date_finish);
                        }
                        var custpage_tranid = currentForm.getText({
                            fieldId: 'custpage_tranid'
                        });
                      	var item = '';
                      	if (custpage_config_data.custrecord_efx_pp_item_filter === true || custpage_config_data.custrecord_efx_pp_item_filter === "T") {
                          var custpage_item = currentForm.getValue({
                              fieldId: 'custpage_item'
                          });
                          for(var i in custpage_item){
                            if(custpage_item[i] == -1 || custpage_item[i] == "-1"){
                              item = '';
                              break;
                            }
                            item += custpage_item[i];
                            item += ((custpage_item.length -1) != i)?',':'';
                          }
                        }
                      	var subsidiaries = '';
                        if (custpage_config_data.custrecord_efx_pp_subsidiary_filter === true || custpage_config_data.custrecord_efx_pp_subsidiary_filter === "T") {
							var custpage_subsidiary = currentForm.getValue({
                                fieldId: 'custpage_subsidiary'
                            });
                          	for(var i in custpage_subsidiary){
                                  if(custpage_subsidiary[i] == -1 || custpage_subsidiary[i] == "-1"){
                                  subsidiaries = '';
                                  break;
                                }
                              subsidiaries += custpage_subsidiary[i];
                              subsidiaries += ((custpage_subsidiary.length -1) != i)?',':'';
                            }
                        }
                        if (custpage_date_start != '' || custpage_date_finish != '') {
                            params = {
                                filter: "T",
                                datestart: custpage_date_start,
                                datefinish: custpage_date_finish,
                                page: custpage_pagination,
                                tranid: custpage_tranid,
                              	
                            }
                          	if(item){
                              params['items'] = item;
                            }
                          if(subsidiaries){
                              params['subsidiaries'] = subsidiaries;
                            }
                        } else {
                            params = null
                        }
                    } else {
                        var custpage_location_filter = currentForm.getValue({
                            fieldId: 'custpage_location_filter'
                        });
                      var location = '';
                      for(var i in custpage_location_filter){
                            location += custpage_location_filter[i];
                            location += ((custpage_location_filter.length -1) != i)?',':'';
                          }
                        var custpage_item_filter = currentForm.getValue({
                            fieldId: 'custpage_item_filter'
                        });
                        var item = '';
                      	if (custpage_config_data.custrecord_efx_pp_item_filter === true || custpage_config_data.custrecord_efx_pp_item_filter === "T") {
                          var custpage_item = currentForm.getValue({
                              fieldId: 'custpage_item'
                          });
                          for(var i in custpage_item){
                              if(custpage_item[i] == -1 || custpage_item[i] == "-1"){
                              item = '';
                              break;
                            }
                            item += custpage_item[i];
                            item += ((custpage_item.length -1) != i)?',':'';
                          }
                        }
                      	var subsidiaries = '';
                        if (custpage_config_data.custrecord_efx_pp_subsidiary_filter === true || custpage_config_data.custrecord_efx_pp_subsidiary_filter === "T") {
							var custpage_subsidiary = currentForm.getValue({
                                fieldId: 'custpage_subsidiary'
                            });
                          	for(var i in custpage_subsidiary){
                              if(custpage_subsidiary[i] == -1 || custpage_subsidiary[i] == "-1"){
                                  subsidiaries = '';
                                  break;
                                }
                              subsidiaries += custpage_subsidiary[i];
                              subsidiaries += ((custpage_subsidiary.length -1) != i)?',':'';
                            }
                        }
                        if (location != '' || custpage_item_filter != '') {
                            params = {
                                filter: "T",
                                page: custpage_pagination,
                                location: location,
                                item: custpage_item_filter
                            }
                          if(item){
                              params['items'] = item;
                            }
                          if(subsidiaries){
                              params['subsidiaries'] = subsidiaries;
                            }
                        } else {
                            params = null;
                        }
                    }
                }
                if (params != null) {
                    var urlservice = url.resolveScript({
                        scriptId: SCRIPT_REPORT,
                        deploymentId: custpage_deploymentid,
                        params: params
                    });
                    window.open(urlservice, '_self');
                } else {
                    message.create({
                        type: message.Type.WARNING,
                        title: 'Advertencia',
                        message: 'Para poder filtrar la información debe seleccionar al menos un filtro'
                    }).show();
                }
            } catch (e) {
                console.error(e);
            }
        }

        function exportData() {
            try {
                var currentForm = currentRecord.get();
                var vendor = runtime.getCurrentUser().id;
                var custpage_pagination = currentForm.getValue({
                    fieldId: 'custpage_pagination'
                });
                var custpage_deploymentid = currentForm.getValue({
                    fieldId: 'custpage_deploymentid'
                });
                var custpage_config_data = currentForm.getValue({
                    fieldId: 'custpage_config_data'
                });
                console.log({custpage_config_data: custpage_config_data});
                var params = {};
                message.create({
                    type: message.Type.INFORMATION,
                    title: 'Procesando',
                    message: 'Se esta generando su documento',
                    duration: 5000
                }).show();
                if (custpage_config_data != "" && custpage_config_data != null) {
                    custpage_config_data = JSON.parse(custpage_config_data);
                    if (custpage_config_data.custrecord_efx_pp_transaction === true || custpage_config_data.custrecord_efx_pp_transaction === "T") {
                        var custpage_date_start = currentForm.getText({
                            fieldId: 'custpage_date_start'
                        });
                        if (custpage_date_start) {
                            custpage_date_start = format.format({value: custpage_date_start, type: format.Type.TEXT});
                            console.log(custpage_date_start);
                        }
                        var custpage_date_finish = currentForm.getText({
                            fieldId: 'custpage_date_finish'
                        });
                        if (custpage_date_finish) {
                            custpage_date_finish = format.format({value: custpage_date_finish, type: format.Type.TEXT});
                            console.log(custpage_date_finish);
                        }
                      var item = '';
                        if (custpage_config_data.custrecord_efx_pp_item_filter === true || custpage_config_data.custrecord_efx_pp_item_filter === "T") {
                          var custpage_item = currentForm.getValue({
                              fieldId: 'custpage_item'
                          });
                          for(var i in custpage_item){
                              if(custpage_item[i] == -1 || custpage_item[i] == "-1"){
                              item = '';
                              break;
                            }
                            item += custpage_item[i];
                            item += ((custpage_item.length -1) != i)?',':'';
                          }
                        }
                      
                      var subsidiaries = '';
                      if (custpage_config_data.custrecord_efx_pp_subsidiary_filter === true || custpage_config_data.custrecord_efx_pp_subsidiary_filter === "T") {
							var custpage_subsidiary = currentForm.getValue({
                                fieldId: 'custpage_subsidiary'
                            });
                          	for(var i in custpage_subsidiary){
                                  if(custpage_subsidiary[i] == -1 || custpage_subsidiary[i] == "-1"){
                                  subsidiaries = '';
                                  break;
                                }
                              subsidiaries += custpage_subsidiary[i];
                              subsidiaries += ((custpage_subsidiary.length -1) != i)?',':'';
                            }
                        }
                       
                        var custpage_tranid = currentForm.getText({
                            fieldId: 'custpage_tranid'
                        });
                        if (custpage_date_start != '' || custpage_date_finish != '' ) {
                            params = {
                                csv: "T",
                                datestart: custpage_date_start,
                                datefinish: custpage_date_finish,
                                page: custpage_pagination,
                                tranid: custpage_tranid,
                                config: custpage_config_data.id,
                                vendor: vendor,
                              	items: item,
                              	subsidiaries: subsidiaries
                            }
                        } else {
                            params = null
                        }
                    } else {
                        var custpage_location_filter = currentForm.getValue({
                            fieldId: 'custpage_location_filter'
                        });
                      	var location = '';
                       	for(var i in custpage_location_filter){
                            location += custpage_location_filter[i];
                            location += ((custpage_location_filter.length -1) != i)?',':'';
                          }
                        var custpage_item_filter = currentForm.getValue({
                            fieldId: 'custpage_item_filter'
                        });
                      	var item = '';
                        if (custpage_config_data.custrecord_efx_pp_item_filter === true || custpage_config_data.custrecord_efx_pp_item_filter === "T") {
                          var custpage_item = currentForm.getValue({
                              fieldId: 'custpage_item'
                          });
                          for(var i in custpage_item){
                              if(custpage_item[i] == -1 || custpage_item[i] == "-1"){
                              item = '';
                              break;
                            }
                            item += custpage_item[i];
                            item += ((custpage_item.length -1) != i)?',':'';
                          }
                        }
                      	
                      	var subsidiaries = '';
                      if (custpage_config_data.custrecord_efx_pp_subsidiary_filter === true || custpage_config_data.custrecord_efx_pp_subsidiary_filter === "T") {
							var custpage_subsidiary = currentForm.getValue({
                                fieldId: 'custpage_subsidiary'
                            });
                          	for(var i in custpage_subsidiary){
                                  if(custpage_subsidiary[i] == -1 || custpage_subsidiary[i] == "-1"){
                                  subsidiaries = '';
                                  break;
                                }
                              subsidiaries += custpage_subsidiary[i];
                              subsidiaries += ((custpage_subsidiary.length -1) != i)?',':'';
                            }
                        }
                        if (custpage_location_filter != '' || custpage_item_filter != '') {
                            params = {
                                csv: "T",
                                page: custpage_pagination,
                                location: location,
                                item: custpage_item_filter,
                                config: custpage_config_data.id,
                                vendor: vendor,
                              	items: item,
                              	subsidiaries: subsidiaries
                            }
                        } else {
                            params = null;
                        }
                    }
                }
              	console.log("params",params);
                if (params != null) {
                    var resolveUrl = url.resolveScript({
                        scriptId: 'customscript_efx_pp_render_transaction',
                        deploymentId: 'customdeploy_efx_pp_render_transaction',
                        params: params,
                        returnExternalUrl: true
                    });
                    window.open(resolveUrl, '_blank')
                } else {
                    message.create({
                        type: message.Type.ERROR,
                        title: 'Error',
                        message: 'Ha ocurrido un error al intentar procesar la información, intente nuevamente.',
                    }).show();
                }
            } catch (e) {
                console.error(e)
            }
        }
        return {
            pageInit: pageInit,
            filter: filter,
            exportData: exportData
        };

    }
);
