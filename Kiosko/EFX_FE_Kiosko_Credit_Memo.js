/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search','N/record','N/https','N/url','N/file','N/runtime'],

function(search,record,https,urlMod,file,runtime) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
        try{
            var busqueda_invoice = search.create({
                type: search.Type.TRANSACTION,
                filters:[['mainline',search.Operator.IS,'T']
                    ,'and',
                    ['type',search.Operator.ANYOF,"CustInvc","CashSale"]
                    ,'and',
                    ['custbody_efx_fe_invoice_related',search.Operator.NONEOF,'@NONE@']
                    ,'and',
                    ['custbody_efx_fe_cmemo_related',search.Operator.IS,'@NONE@']
                    ,'and',
                    ['custbody_efx_fe_kiosko_folio',search.Operator.ISEMPTY,'']
                    ,'and',
                    ['custbody_efx_fe_gbl_ismirror',search.Operator.IS,'F']
                    ],
                columns:[
                    search.createColumn({name: 'internalid'}),
                    search.createColumn({name: 'tranid'}),
                    search.createColumn({name: 'entity'}),
                    search.createColumn({name: 'amount'}),
                    search.createColumn({name: 'custbody_mx_cfdi_uuid'}),
                    search.createColumn({name: 'custbody_efx_fe_invoice_related'}),
                    search.createColumn({name: 'custbody_efx_fe_gbl_related'}),
                    search.createColumn({name: 'custbody_mx_txn_sat_payment_method'}),
                    search.createColumn({name: 'type'}),
                ]
            });
            log.debug({title:'busqueda_invoice',details:busqueda_invoice});
            return busqueda_invoice;
        }catch(error){
            log.error({title:'getInputData - error',details:error});
        }
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {

        log.audit({title:'map',details:JSON.parse(context.value)});

        var datos = JSON.parse(context.value);

        context.write({
            key: datos.id,
            value: datos.values
        });
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
        var data_reduce = JSON.parse(context.values[0]);
        log.audit({title: 'data_reduce', details: data_reduce});

        try{
            var busqueda_cmemo = search.create({
                type: search.Type.CREDIT_MEMO,
                filters:[['mainline',search.Operator.IS,'T']
                    ,'and',
                    ['appliedtotransaction',search.Operator.IS,data_reduce.custbody_efx_fe_invoice_related.value]

                ],
                columns:[
                    search.createColumn({name: 'internalid'}),

                ]
            });

            var ejecutar = busqueda_cmemo.run();
            var resultado = ejecutar.getRange(0, 100);

        }catch(error){
            log.error({title:'getInputData - error',details:error});
        }

        log.audit({title:'resultado.length',details:resultado.length});

        if(resultado.length<=0){

            log.audit({title:'entra',details:'entra'});
            var scriptObj = runtime.getCurrentScript();
            var configKioskoId = scriptObj.getParameter({name: 'custscript_efx_fe_kiosko_config'});
            var articuloNC = scriptObj.getParameter({name: 'custscript_efx_fe_nc_kiosko_item'});
            log.audit({title:'configKioskoId',details:configKioskoId});
            var idKioskoConfig = record.load({
                type: 'customrecord_efx_kiosko_config',
                id: configKioskoId
            });
            log.audit({title:'idKioskoConfig',details:idKioskoConfig});

            var nc_template = idKioskoConfig.getValue({fieldId:'custrecord_efx_fe_nc_template'});
            log.audit({title:'nc_template',details:nc_template});
            var nc_sendM = idKioskoConfig.getValue({fieldId:'custrecord_efx_fe_nc_sendingm'});
            log.audit({title:'nc_sendM',details:nc_sendM});
            log.audit({title:'data_reduce.custbody_efx_fe_invoice_related.value',details:data_reduce.custbody_efx_fe_invoice_related.value});

            try {
                var record_fact_kiosko = record.load({
                    type: record.Type.INVOICE,
                    id: data_reduce.custbody_efx_fe_invoice_related.value
                });
                var metodoEnvio = record_fact_kiosko.getValue({fieldId: 'custbody_psg_ei_sending_method'});
                var uuid_f_kiosko = record_fact_kiosko.getValue({fieldId: 'custbody_mx_cfdi_uuid'});
                var entity_f_kiosko = record_fact_kiosko.getValue({fieldId: 'entity'});
                log.audit({title: 'metodoEnvio', details: metodoEnvio});
                log.audit({title: 'uuid_f_kiosko', details: uuid_f_kiosko});
                record_fact_kiosko.setValue({fieldId: 'approvalstatus', value: 2});
                record_fact_kiosko.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

            }catch(error_c_cm){
                log.audit({title: 'error_c_cm', details: error_c_cm});
            }
            var record_type = '';
            if(data_reduce.type.value == 'CustInvc'){
                record_type = record.Type.INVOICE;
                // var invObj = record.load({
                //     type: record.Type.INVOICE,
                //     id:data_reduce.internalid.value
                // });
                // var metodoEnvio = invObj.getValue({fieldId:'custbody_psg_ei_sending_method'});
            }

            if(data_reduce.type.value == 'CashSale'){
                record_type = record.Type.CASH_SALE;
                // var invObj = record.load({
                //     type: record.Type.CASH_SALE,
                //     id:data_reduce.internalid.value
                // });
                // var metodoEnvio = invObj.getValue({fieldId:'custbody_psg_ei_sending_method'});
            }

            //crea la credit memo
            try {
                var registro_cmemo = record.transform({
                    fromType: record.Type.INVOICE,
                    fromId: data_reduce.custbody_efx_fe_invoice_related.value,
                    toType: record.Type.CREDIT_MEMO
                });

                if(nc_sendM){
                    registro_cmemo.setValue({
                        fieldId: "custbody_psg_ei_sending_method",
                        value: nc_sendM,
                        ignoreFieldChange: true
                    });
                }else{
                    registro_cmemo.setValue({
                        fieldId: "custbody_psg_ei_sending_method",
                        value: metodoEnvio,
                        ignoreFieldChange: true
                    });
                }

                if(nc_template){
                    registro_cmemo.setValue({
                        fieldId: "custbody_psg_ei_template",
                        value: nc_template,
                        ignoreFieldChange: true
                    });
                }


                registro_cmemo.setValue({
                    fieldId: "custbody_psg_ei_status",
                    value: 1,
                    ignoreFieldChange: true
                });

                registro_cmemo.setValue({
                    fieldId: "custbody_efx_fe_kiosko_customer",
                    value: '',
                    ignoreFieldChange: true
                });

                try {
                    registro_cmemo.setValue({
                        fieldId: "custbody_efx_fe_forma_pago",
                        value: data_reduce.custbody_mx_txn_sat_payment_method.value,
                        ignoreFieldChange: true
                    });
                }catch(error_fpago){
                    log.audit({title: 'error_fpago', details: error_fpago});
                }
                registro_cmemo.setValue({
                    fieldId: "custbody_edoc_generated_pdf",
                    value: '',
                    ignoreFieldChange: true
                });

                registro_cmemo.setValue({
                    fieldId: "custbody_psg_ei_generated_edoc",
                    value: '',
                    ignoreFieldChange: true
                });

                registro_cmemo.setValue({
                    fieldId: "custbody_psg_ei_certified_edoc",
                    value: '',
                    ignoreFieldChange: true
                });

                registro_cmemo.setValue({
                    fieldId: "custbody_psg_ei_content",
                    value: '',
                    ignoreFieldChange: true
                });
                registro_cmemo.setValue({
                    fieldId: "custbody_mx_cfdi_certify_timestamp",
                    value: '',
                    ignoreFieldChange: true
                });
                registro_cmemo.setValue({
                    fieldId: "custbody_efx_fe_cfdi_cancelled",
                    value: false,
                    ignoreFieldChange: true
                });
                registro_cmemo.setValue({
                    fieldId: "custbody_mx_cfdi_uuid",
                    value: '',
                    ignoreFieldChange: true
                });
                registro_cmemo.setValue({
                    fieldId: "custbody_efx_fe_send_cert_docs",
                    value: false,
                    ignoreFieldChange: true
                });

                //se inserta articulo diferente al de la factura si se configuró articulo nc en preferencias grals
                if(articuloNC){
                    var linearticulos = registro_cmemo.getLineCount({
                        sublistId: 'item',
                    });

                    for(var x=0;x<linearticulos;x++){
                        var articulooriginal = registro_cmemo.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line:x,
                        });


                        var nc_quantity = registro_cmemo.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line:x,
                        });
                        var nc_units = registro_cmemo.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'units',
                            line:x,
                        });
                        var nc_description = registro_cmemo.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'description',
                            line:x,
                        });
                        var nc_rate = registro_cmemo.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line:x,
                        });
                        var nc_amount = registro_cmemo.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line:x,
                        });
                        var nc_taxcode = registro_cmemo.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'taxcode',
                            line:x,
                        });
                        var nc_custcol_mx_txn_line_sat_item_code = registro_cmemo.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_mx_txn_line_sat_item_code',
                            line:x,
                        });

                        //seteo y cambio de articulos original vs articulo nc
                        registro_cmemo.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_gbl_originitem',
                            line:x,
                            value:articulooriginal

                        });

                        registro_cmemo.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line:x,
                            value:articuloNC

                        });


                        registro_cmemo.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line:x,
                            value:nc_quantity

                        });
                        registro_cmemo.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_gbl_originunits',
                            line:x,
                            value:nc_units

                        });
                        registro_cmemo.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'description',
                            line:x,
                            value:nc_description

                        });
                        registro_cmemo.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line:x,
                            value:nc_rate

                        });
                        registro_cmemo.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line:x,
                            value:nc_amount

                        });
                        registro_cmemo.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'taxcode',
                            line:x,
                            value:nc_taxcode

                        });
                        registro_cmemo.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_mx_txn_line_sat_item_code',
                            line:x,
                            value:nc_custcol_mx_txn_line_sat_item_code

                        });




                    }
                }


                var id_registro_cmemo = registro_cmemo.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                log.audit({title:'id_registro_cmemo',details:id_registro_cmemo});
            }catch(error_crear_memo){
                log.error({title:'error_crear_memo',details:error_crear_memo});
            }

            //Actualiza el campo de la factura con la cmemo
            if(id_registro_cmemo){
                log.audit({title:'data_reduce.type.value',details:data_reduce.type.value});
                log.audit({title:'data_reduce.internalid.value',details:data_reduce.internalid.value});

                record.submitFields({
                    type: record_type,
                    id: data_reduce.internalid.value,
                    values:{
                        custbody_efx_fe_cmemo_related:id_registro_cmemo
                    }
                });

                record.submitFields({
                    type: record.Type.INVOICE,
                    id: data_reduce.custbody_efx_fe_invoice_related.value,
                    values:{
                        custbody_efx_fe_cmemo_related:id_registro_cmemo
                    }
                });

                // var record_tran = record.load({
                //     type: record_type,
                //     id: data_reduce.internalid.value,
                //     isDynamic: true,
                // });
                //
                // record_tran.setValue({
                //     fieldId: 'custbody_efx_fe_cmemo_related',
                //     value:id_registro_cmemo,
                //     ignoreFieldChange: true
                // });
                // record_tran.save({
                //     enableSourcing: true,
                //     ignoreMandatoryFields: true
                // });
                if(data_reduce.custbody_efx_fe_gbl_related.value){
                    var record_gbl = record.load({
                        type:'customsale_efx_fe_factura_global',
                        id:data_reduce.custbody_efx_fe_gbl_related.value
                    });

                    var countalinea = record_gbl.getLineCount({sublistId:'item'});

                    for(var i=0;i<countalinea;i++){
                        var relacionLinea = record_gbl.getSublistValue({sublistId:'item',fieldId:'custcol_efx_fe_gbl_related_tran',line:i});
                        log.audit({title:'relacionLinea',details:relacionLinea});
                        log.audit({title:'data_reduce.internalid.value',details:data_reduce.internalid.value});
                        if(relacionLinea==data_reduce.internalid.value){
                            record_gbl.setSublistValue({sublistId:'item',fieldId:'custcol_efx_fe_gbl_ncrelated',line:i,value:id_registro_cmemo});
                            record_gbl.save();
                        }
                    }

                }


            }

            //timbrado de nota de crédito
            if(id_registro_cmemo && data_reduce.custbody_mx_cfdi_uuid!=''){
                var related_cfdi = record.create({
                    type: 'customrecord_mx_related_cfdi_subl',
                    isDynamic: true
                });

                related_cfdi.setValue({
                    fieldId: 'custrecord_mx_rcs_orig_trans',
                    value: id_registro_cmemo
                });

                related_cfdi.setValue({
                    fieldId: 'custrecord_mx_rcs_rel_type',
                    value: 1
                });

                related_cfdi.setValue({
                    fieldId: 'custrecord_mx_rcs_rel_cfdi',
                    value: data_reduce.internalid.value
                });

                related_cfdi.setValue({
                    fieldId: 'custrecord_mx_rcs_uuid',
                    value: data_reduce.custbody_mx_cfdi_uuid
                });


                var id_related = related_cfdi.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                log.audit({title:'id_related',details:id_related});
                if(id_related){

                    var record_tipo = record.load({
                        type: record.Type.CREDIT_MEMO,
                        id: id_registro_cmemo,
                        isDynamic: true,
                    });

                    crearXML(id_registro_cmemo, record_tipo.type);
                    //log.audit({title:'crearXml_',details:crearXml_});

                    // var record_tipo_new = record.load({
                    //     type: record.Type.CREDIT_MEMO,
                    //     id: id_registro_cmemo,
                    //     isDynamic: true,
                    // });
                    //
                    // var xml_ = record_tipo_new.getValue('custbody_psg_ei_content');
                    //
                    // if (crearXml_.code == 200 || xml_) {
                    //     var certificarXml = certificarXML(id_registro_cmemo,record_tipo.type);
                    //
                    //     log.audit({title:'certificarXml',details:certificarXml});
                    // }
                }

            }

        }


    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    }

    function crearXML(tranid,trantype){
        log.audit({title:'tranid',details:tranid});
        log.audit({title:'trantype',details:trantype});

        var scheme = 'https://';
        var host = urlMod.resolveDomain({
            hostType: urlMod.HostType.APPLICATION
        });


        var SLURL = urlMod.resolveScript({
            scriptId: 'customscript_efx_fe_xml_generator',
            deploymentId: 'customdeploy_efx_fe_xml_generator',
            returnExternalUrl: true,
            params: {
                trantype: trantype,
                tranid: tranid

            }
        });

        log.audit({title:'SLURL',details:SLURL});


        var response = https.get({
            url: SLURL,
        });

        log.audit({title:'response-code',details:response.code});
        log.audit({title:'response-body',details:response.body});

        return response;



        // https.get.promise({
        //     url: SLURL,
        //     headers: {}
        // }).then(function (response){
        //     return response;
        // }).then(function (data){
        //     log.audit({title:'data',details:data});
        // }).catch(function onRejected(reason){
        //     log.audit({title:'reason',details:reason});
        // })





        // var scheme = 'https://';
        // var host = urlMod.resolveDomain({
        //     hostType: urlMod.HostType.APPLICATION
        // });
        //
        //
        // var SLURL = scheme + host + urlMod.resolveScript({
        //     scriptId: 'customscript_ei_generation_service_su',
        //     deploymentId: 'customdeploy_ei_generation_service_su',
        //     returnExternalUrl: false,
        //     params: {
        //         transId: tranid,
        //         transType: trantype,
        //         certSendingMethodId: 5,
        //     }
        // });
        //
        // log.audit({title:'SLURL',details:SLURL});
        //
        // var headers = {
        //     'Authorization': 'NLAuth nlauth_account=TSTDRV2220309, nlauth_email=marco.ramirez@efficientix.com, nlauth_signature=Efxmr12345678., nlauth_role=3',
        //     "Content-Type": "application/json"
        // };
        // var response = https.post({
        //     url: SLURL,
        //     headers: headers
        // });

        //return response;
    }

    // function certificarXML(tranid,trantype){
    //
    //     log.audit({title:'tranid',details:tranid});
    //     log.audit({title:'trantype',details:trantype});
    //
    //
    //     var scheme = 'https://';
    //     var host = urlMod.resolveDomain({
    //         hostType: urlMod.HostType.APPLICATION
    //     });
    //
    //     var SLURL = scheme + host + urlMod.resolveScript({
    //         scriptId: 'customscript_su_send_e_invoice',
    //         deploymentId: 'customdeploy_su_send_e_invoice',
    //         returnExternalUrl: false,
    //         params: {
    //             transId: tranid,
    //             transType: trantype,
    //             certSendingMethodId: 5,
    //         }
    //     });
    //
    //
    //     log.audit({title:'SLURL',details:SLURL});
    //
    //     var headers = {
    //         'Authorization': 'NLAuth nlauth_account=TSTDRV2220309, nlauth_email=marco.ramirez@efficientix.com, nlauth_signature=Efxmr12345678., nlauth_role=3',
    //         "Content-Type": "application/json"
    //     };
    //     try {
    //         var response = https.post({
    //             url: SLURL,
    //             headers: headers
    //         });
    //     }catch(error_cert){
    //         log.audit({title:'error_cert',details:error_cert});
    //     }
    //
    //     return response;
    // }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
