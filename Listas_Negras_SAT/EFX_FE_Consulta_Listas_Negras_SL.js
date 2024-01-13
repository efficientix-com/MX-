/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/ui/serverWidget','N/runtime','N/config','N/format','N/file','N/url','N/https','N/xml','N/encode','N/render','N/task','N/redirect'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{serverWidget} serverWidget
     */
    (record, search, serverWidget,runtime,config,format,file,url,https,xml,encode,render,task,redirect) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (context) => {

            log.audit({title:'context.body',details:context.request.body});
            var idBusqueda = context.request.body;


            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
            log.audit({title:'idBusqueda',details:idBusqueda});

                var filtros = {
                    idbusqueda:''
                };

                if (context.request.parameters.value != null) {
                    filtros = JSON.parse(context.request.parameters.value);
                    log.audit({title: 'filtros', details: filtros});
                }

                var form = serverWidget.createForm({title: 'Valida RFCs'});

                form.clientScriptModulePath = './EFX_FE_Consulta_Listas_Negras_CS.js';

                form.addButton({
                    id: 'buttonid_efx_filtrar',
                    label: 'Filtrar',
                    functionName: 'filtrado'
                });

                form.addButton({
                    id: 'buttonid_efx_generar',
                    label: 'Validar',
                    functionName: 'valida'
                });

                var fieldgroup_principal = form.addFieldGroup({
                    id : 'fieldgroupid_principal',
                    label : 'Busqueda'
                });

                var busqueda_field = form.addField({
                    id: 'custpage_efx_search',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Busqueda',
                    source: '-119',
                    container : 'fieldgroupid_principal'
                });


                //se agregan campos de sublista


                var sublist_payments = form.addSublist({
                    id: 'custpage_efx_vendor',
                    label: 'Proveedores',
                    type: serverWidget.SublistType.LIST
                });
                //sublist_payments.addMarkAllButtons();


                // sublist_payments.addField({
                //     id: 'custpage_efx_select',
                //     label: 'Select',
                //     type: serverWidget.FieldType.CHECKBOX
                // });


                var subfield_idInterno = sublist_payments.addField({
                    id: 'custpage_efx_internalid',
                    label: 'ID Interno',
                    type: serverWidget.FieldType.TEXT,
                });

                subfield_idInterno.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var subfield_name = sublist_payments.addField({
                    id: 'custpage_efx_name',
                    label: 'Proveedor',
                    type: serverWidget.FieldType.TEXT,
                });

                subfield_name.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var subfield_rfc = sublist_payments.addField({
                    id: 'custpage_efx_rfc',
                    label: 'RFC',
                    type: serverWidget.FieldType.TEXT,
                });

                subfield_rfc.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var subfield_status = sublist_payments.addField({
                    id: 'custpage_efx_status',
                    label: 'Estado',
                    type: serverWidget.FieldType.SELECT,
                    source:'customrecord_efx_pp_sol_lco'
                });

                subfield_status.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var subfield_date = sublist_payments.addField({
                    id: 'custpage_efx_date',
                    label: 'Fecha de Consulta',
                    type: serverWidget.FieldType.DATE,
                });

                subfield_date.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

            var bodyRfcs = {
                rfc:'',
                rfcs : []
            }

                if(filtros.idbusqueda){
                    busqueda_field.defaultValue = filtros.idbusqueda;
                    var busqueda_vendors = search.load({ id: filtros.idbusqueda });

                    var ejecutar = busqueda_vendors.run();
                    var resultado = ejecutar.getRange(0, 100);
                    log.audit({title:'resultado',details:resultado});
                    var conteoResultado = resultado.length;
                    for(var i=0;i<resultado.length;i++){
                        sublist_payments.setSublistValue({
                            id: 'custpage_efx_internalid',
                            line: i,
                            value: resultado[i].getValue({name:'internalid'})
                        });

                        sublist_payments.setSublistValue({
                            id: 'custpage_efx_name',
                            line: i,
                            value: resultado[i].getValue({name:'entityid'})
                        });

                        sublist_payments.setSublistValue({
                            id: 'custpage_efx_rfc',
                            line: i,
                            value: resultado[i].getValue({name:'custentity_mx_rfc'})
                        });

                        sublist_payments.setSublistValue({
                            id: 'custpage_efx_date',
                            line: i,
                            value: resultado[i].getValue({name:'custentity_efx_fe_lns_valida_date'})
                        });

                        sublist_payments.setSublistValue({
                            id: 'custpage_efx_status',
                            line: i,
                            value: resultado[i].getValue({name:'custentity_efx_fe_lns_status'})
                        });

                        if(filtros.valida) {
                            var objrfc = {
                                rfc:''
                            }
                            objrfc.rfc = resultado[i].getValue({name: 'custentity_mx_rfc'});
                            if(conteoResultado>1){
                                (bodyRfcs.rfcs).push(objrfc);
                            }else{
                                bodyRfcs.rfcs = objrfc.rfc;
                            }
                        }

                    }

                    // var objrfc = {
                    //     rfc:''
                    // }
                    //     objrfc.rfc = 'AAA091014835';
                    //     (bodyRfcs.rfcs).push(objrfc);
                    // var objrfc = {
                    //     rfc:''
                    // }
                    //     objrfc.rfc = 'AAA080808HL8';
                    //     (bodyRfcs.rfcs).push(objrfc);


                }

            if(filtros.valida){
                var multiple = false;
                if(conteoResultado>1){
                    multiple=true;
                }
                log.audit({title:'bodyRfcs',details:bodyRfcs});

                var responseBodyResp = consultaListas(multiple,bodyRfcs);

                // headersPos = {
                //     'Content-Type': 'application/json'
                // };
                // var consultaLN = https.post({
                //     // url: 'https://listanegra-test.lagom.agency/api/search_rfc',
                //     url: 'https://listanegra-test.lagom.agency/api/search_rfcs',
                //     headers: headersPos,
                //     body: JSON.stringify(bodyRfcs)
                // });
                //
                // log.audit({ title: 'consultaLN ', details: consultaLN });
                // var responseBody_s = consultaLN.body;
                // var responseBody = JSON.parse(responseBody_s);


                log.audit({ title: 'responseBodyResp', details: responseBodyResp });
                if(responseBodyResp) {
                    var responseBody = JSON.parse(responseBodyResp);
                    log.audit({title: 'responseBody.success', details: responseBody.success});

                    if (responseBody.success) {
                        log.audit({title: 'responseBody.data.length', details: responseBody.data.length});
                        log.audit({title: 'resultado.length', details: resultado.length});
                        for (var x = 0; x < responseBody.data.length; x++) {
                            for (var i = 0; i < resultado.length; i++) {
                                //var rfcsearch = resultado[i].getValue({name: 'custentity_mx_rfc'});
                                var rfcsearch = bodyRfcs.rfcs[i].rfc;
                                log.audit({title: 'rfcsearch', details: rfcsearch});
                                log.audit({title: 'responseBody.data[x].rfc', details: responseBody.data[x].rfc});
                                if (rfcsearch == responseBody.data[x].rfc) {
                                    log.audit({
                                        title: 'responseBody.data[x].situacion_contribuyente',
                                        details: responseBody.data[x].listanegra.situacion_contribuyente
                                    });
                                    var estado_rfc = '';
                                    if (responseBody.data[x].listanegra.situacion_contribuyente == 'Definitivo') {
                                        estado_rfc = 1;
                                    } else if (responseBody.data[x].listanegra.situacion_contribuyente == 'Desvirtuado') {
                                        estado_rfc = 2;
                                    } else if (responseBody.data[x].listanegra.situacion_contribuyente == 'Presunto') {
                                        estado_rfc = 3;
                                    } else {
                                        estado_rfc = 4;
                                    }
                                    log.audit({title: 'estado_rfc', details: estado_rfc});
                                    sublist_payments.setSublistValue({
                                        id: 'custpage_efx_status',
                                        line: i,
                                        value: estado_rfc
                                    });
                                }
                            }
                        }

                        actualizaVendors(filtros.idbusqueda);


                    }
                }

            }

                context.response.writePage(form);
            }



        function consultaListas(multiple,bodyRfcs){
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });

            var objBody = {
                multiple:'',
                rfcs:''
            }
            objBody.multiple = multiple;
            objBody.rfcs = bodyRfcs;

            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_lnsat_ws_sl',
                deploymentId: 'customdeploy_efx_fe_lnsat_ws_sl',
                returnExternalUrl:true
            });


            var headersPos = {
                'Content-Type': 'application/json'
            };
            log.audit({title:'SLURL',details:SLURL});

            var response = https.post({
                url: SLURL,
                headers:headersPos,
                body: JSON.stringify(objBody)
            });

            log.audit({title:'response-code_mail',details:response.code});
            log.audit({title:'response-body_mail',details:response.body});

            if(response.code==200){
                return response.body;
            }else{
                return '';
            }


        }

        function actualizaVendors(idbusqueda){
            for(var i = 1; i <= 10; i++){
                var scriptdeploy_id = 'customdeploy_efx_fe_consulta_lns_mr' + i;
                log.debug('scriptdeploy_id',scriptdeploy_id);

                var mrTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                mrTask.scriptId = 'customscript_efx_fe_consulta_lns_mr';
                mrTask.deploymentId = scriptdeploy_id;
                mrTask.params = {custscript_efx_valida_search: idbusqueda};

                try{
                    var mrTaskId = mrTask.submit();
                    log.debug("scriptTaskId tarea ejecutada", mrTaskId);
                    log.audit("Tarea ejecutada", mrTaskId);
                    break;
                }
                catch(e){
                    log.debug({title: "error", details: e});
                    log.error("summarize", "Aún esta corriendo el deployment: "+ scriptdeploy_id);
                }
            }
        }


        return {onRequest}

    });
