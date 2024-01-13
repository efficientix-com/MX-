/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/runtime', 'N/search','N/url','N/https'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, runtime, search,url,https) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {
            var scriptObj = runtime.getCurrentScript();
            var jsonGBL_param = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_id_actualiza' });
            log.audit({title:'jsonGBL_param',details:JSON.stringify(jsonGBL_param)});
            var jsonGBL = '';
            if(jsonGBL_param){
                jsonGBL = JSON.parse(jsonGBL_param);
            }
            if(jsonGBL){
                if(jsonGBL.tipo=='existe') {
                    var buscaFacturas = search.create({
                        type: search.Type.TRANSACTION,
                        filters: [
                            ["type", search.Operator.ANYOF, "CustInvc", "CashSale"]
                            , 'AND',
                            ["mainline", search.Operator.IS, "T"]
                            , "AND",
                            ['custbody_mx_cfdi_uuid', search.Operator.ISEMPTY,'']
                            , "AND",
                            ['custbody_efx_fe_gbl_related', search.Operator.IS, jsonGBL.idglobal]
                        ],
                        columns: [
                            search.createColumn({name: 'internalid'}),
                            search.createColumn({name: 'type'}),
                        ]
                    });

                    return buscaFacturas;
                }else if(jsonGBL.tipo=='nuevo'){
                    var buscaFacturas = search.create({
                        type: 'customsale_efx_fe_factura_global',
                        filters: [
                            ["mainline", search.Operator.IS, "T"]
                            , "AND",
                            ['internalid', search.Operator.IS, jsonGBL.idglobal]
                        ],
                        columns: [
                            search.createColumn({name: 'internalid'}),
                            search.createColumn({name: 'type'}),
                        ]
                    });

                    return buscaFacturas;
                }
            }


        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {
            log.audit({title:'map',details:JSON.parse(mapContext.value)});

            var datos = JSON.parse(mapContext.value);

            mapContext.write({
                key: datos.id,
                value: datos.values
            });
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {

            var data_reduce = JSON.parse(reduceContext.values[0]);
            log.audit({title: 'data_reduce', details: data_reduce});

            var scriptObj = runtime.getCurrentScript();
            var jsonGBL_param = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_id_actualiza' });
            log.audit({title: 'jsonGBL_param', details: jsonGBL_param});
            var jsonGBL = '';
            if(jsonGBL_param){
                jsonGBL = JSON.parse(jsonGBL_param);
            }
            if(jsonGBL){


                var idGbl = jsonGBL.idglobal;
                var line_c = jsonGBL.numeroLineas;
                var espejoUuid = jsonGBL.espejoUuid;
                var espejoCert = jsonGBL.espejoCert;
                var espejoPdf = jsonGBL.espejoPdf;
                var espejoGen = jsonGBL.espejoGen;


                log.audit({title:'espejoUuid',details:espejoUuid});
                log.audit({title:'espejoCert',details:espejoCert});
                log.audit({title:'jsonGBL.tipo',details:jsonGBL.tipo});
                if(jsonGBL.tipo=='existe') {

                    if (espejoUuid && espejoCert) {

                        var idfactura = data_reduce.internalid.value;
                        var tipo = data_reduce.type.value;

                        if (tipo == 'CustInvc') {
                            tipo = record.Type.INVOICE;

                        }

                        if (tipo == 'CashSale') {
                            tipo = record.Type.CASH_SALE;

                        }

                        log.audit({title: 'idfactura', details: idfactura});

                        try {
                            record.submitFields({
                                type: tipo,
                                id: idfactura,
                                values: {
                                    custbody_edoc_generated_pdf: espejoPdf,
                                    custbody_psg_ei_content: espejoGen,
                                    custbody_psg_ei_certified_edoc: espejoCert,
                                    custbody_mx_cfdi_uuid: espejoUuid,
                                    custbody_psg_ei_status: 3,
                                    custbody_efx_fe_gbl_related: idGbl
                                }
                            });
                        } catch (tipo_tran) {
                            log.audit({title: 'tipo_tran', details: tipo_tran});
                        }
                    }
                }else if(jsonGBL.tipo=='nuevo'){

                    var body = '';
                    if(jsonGBL_param){
                        body = JSON.parse(jsonGBL_param);
                    }

                    log.audit({title:'body',details:body});
                    var factura_mirror = '';
                    try {
                        if (!body.espejo) {

                            validaLineas(body.idglobal);

                            var scriptObj = runtime.getCurrentScript();
                            //configuración de factura global
                            var GBL_Config = scriptObj.getParameter({name: 'custscript_efx_fe_gbl_config'});

                            var record_gbl = record.load({
                                type: 'customsale_efx_fe_factura_global',
                                id: body.idglobal
                            });
                            var record_setup = record.load({
                                type: 'customrecord_efx_fe_facturaglobal_setup',
                                id: GBL_Config
                            });

                            var formulario_gbl = record_setup.getValue({fieldId: 'custrecord_efx_fe_gbl_form'});


                            log.audit({title:'governance start',details:runtime.getCurrentScript().getRemainingUsage()});
                            var record_mirror = record.transform({
                                fromType: 'customsale_efx_fe_factura_global',
                                fromId: body.idglobal,
                                toType: record.Type.INVOICE,
                                isDynamic: false
                            });

                            if (formulario_gbl) {
                                record_mirror.setValue({fieldId: 'customform', value: formulario_gbl});
                            }
                            record_mirror.setValue({fieldId: 'entity', value: body.setup_entity});
                            record_mirror.setValue({fieldId: 'approvalstatus', value: 1});
                            record_mirror.setValue({
                                fieldId: 'custbody_efx_fe_gbl_folio',
                                value: record_gbl.getValue({fieldId: 'tranid'})
                            });
                            record_mirror.setValue({
                                fieldId: 'custbody_psg_ei_sending_method',
                                value: body.setup_metodo
                            });
                            record_mirror.setValue({fieldId: 'custbody_psg_ei_template', value: body.setup_plantilla});
                            record_mirror.setValue({fieldId: 'custbody_psg_ei_status', value: 1});
                            record_mirror.setValue({fieldId: 'custbody_efx_fe_gbl_ismirror', value: true});
                            //record_mirror.setValue({fieldId:'custbody_edoc_gen_trans_pdf', value:false});

                            log.audit({title:'governance start',details:runtime.getCurrentScript().getRemainingUsage()});
                            factura_mirror = record_mirror.save({
                                enableSourcing: true,
                                igonoreMandatoryFields: true
                            });


                        } else {
                            factura_mirror = body.espejo;
                        }
                    }catch(error_espejo){
                        log.audit({title:'error_espejo',details:error_espejo});
                    }
                    log.audit({title:'governance start',details:runtime.getCurrentScript().getRemainingUsage()});

                    log.audit({title:'mirror',details:factura_mirror});

                    //
                    var record_gbl = record.load({
                        type:'customsale_efx_fe_factura_global',
                        id:body.idglobal
                    });

                    record_gbl.setValue({fieldId:'custbody_efx_fe_gbl_mirror_tran',value:factura_mirror});
                    record_gbl.save();

                    try{
                        var resptimbrado = crearXML(factura_mirror,'invoice');
                        var timbradoRespJson = JSON.parse(resptimbrado.body);

                        if (timbradoRespJson.success) {

                            var pdfGen = timbradoRespJson.pdf_generated;
                            var xmlGen = timbradoRespJson.xml_generated;
                            var xmlCert = timbradoRespJson.xml_certified;
                            var uuidglobal = timbradoRespJson.uuid;

                            var loadGlobal = record.load({
                                type: 'customsale_efx_fe_factura_global',
                                id: body.idglobal
                            });

                            loadGlobal.setValue({
                                fieldId: 'custbody_efx_fe_gbl_mirror_tran',
                                value: factura_mirror
                            });

                            var cuentaLineas = loadGlobal.getLineCount({sublistId: 'item'});

                            if (xmlCert && uuidglobal) {
                                loadGlobal.setValue({fieldId: 'custbody_edoc_generated_pdf', value: pdfGen});
                                loadGlobal.setValue({fieldId: 'custbody_psg_ei_content', value: xmlGen});
                                loadGlobal.setValue({
                                    fieldId: 'custbody_psg_ei_certified_edoc',
                                    value: xmlCert
                                });
                                loadGlobal.setValue({fieldId: 'custbody_mx_cfdi_uuid', value: uuidglobal});
                                loadGlobal.setValue({fieldId: 'custbody_psg_ei_status', value: 3});

                                for (var i = 0; i < cuentaLineas; i++) {
                                    var idFactLinea = loadGlobal.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'custcol_efx_fe_gbl_related_tran',
                                        line: i
                                    });
                                    try {
                                        record.submitFields({
                                            type: record.Type.INVOICE,
                                            id: idFactLinea,
                                            values: {
                                                custbody_edoc_generated_pdf: pdfGen,
                                                custbody_psg_ei_content: xmlGen,
                                                custbody_psg_ei_certified_edoc: xmlCert,
                                                custbody_mx_cfdi_uuid: uuidglobal,
                                                custbody_psg_ei_status: 3,
                                                custbody_efx_fe_gbl_related: body.idglobal
                                            }
                                        });
                                    } catch (error_tipo) {

                                        record.submitFields({
                                            type: record.Type.CASH_SALE,
                                            id: idFactLinea,
                                            values: {
                                                custbody_edoc_generated_pdf: pdfGen,
                                                custbody_psg_ei_content: xmlGen,
                                                custbody_psg_ei_certified_edoc: xmlCert,
                                                custbody_mx_cfdi_uuid: uuidglobal,
                                                custbody_psg_ei_status: 3,
                                                custbody_efx_fe_gbl_related: body.idglobal
                                            }
                                        });
                                    }
                                }
                                loadGlobal.setValue({fieldId: 'custbody_efx_fe_gbl_reprocess', value: false});
                                loadGlobal.save();
                            }
                        }

                        sendToMail(factura_mirror,'invoice');
                    }catch(timbrado_xml){
                        log.audit({title:'timbrado_xml',details:timbrado_xml});
                    }


                }

            }
        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }

        function validaLineas(idglb){

            try {
                var record_gbl = record.load({
                    type: 'customsale_efx_fe_factura_global',
                    id: idglb
                });

                var subtotal_cab = record_gbl.getValue({fieldId:'custbody_efx_fe_gbl_subtotal'});
                subtotal_cab = parseFloat(subtotal_cab);
                var cuentaLinea = record_gbl.getLineCount('item');

                var arrayFacturas = new Array();
                for (var i = 0; i < cuentaLinea; i++) {
                    var idFactura = record_gbl.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_gbl_related_tran',
                        line: i
                    });
                    arrayFacturas.push(idFactura);
                }

                log.audit({title: 'arrayFacturas', details: arrayFacturas});

                var searchFacturas = search.create({
                    type: search.Type.TRANSACTION,
                    filters: [
                        ["type", search.Operator.ANYOF, "CustInvc", "CashSale"]
                        , "AND",
                        ["mainline", search.Operator.IS, "T"]
                        , "AND",
                        ["internalid", search.Operator.ANYOF, arrayFacturas]
                        , "AND",
                        ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                        , "AND",
                        ['custbody_psg_ei_certified_edoc', search.Operator.NONEOF, '@NONE@']
                    ],
                    columns: [
                        search.createColumn({name: "internalid"}),
                        search.createColumn({name: "type"})
                    ]
                });

                var ejecutar = searchFacturas.run();
                var resultado = ejecutar.getRange(0, 100);
                log.audit({title: 'resultado', details: resultado});
                if (resultado.length > 0) {
                    for (var i = 0; i < resultado.length; i++) {
                        var idFactura = resultado[i].getValue({name: 'internalid'});
                        var tipo = resultado[i].getValue({name: 'type'});
                        if (idFactura) {
                            log.audit({title: 'idFactura', details: idFactura});
                            var conteLineas = record_gbl.getLineCount('item');
                            for (var x = conteLineas-1; x >=0 ; x--) {
                                var idFaclinea = record_gbl.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_efx_fe_gbl_related_tran',
                                    line: x
                                });
                                log.audit({title: 'idFaclinea', details: idFaclinea});
                                if (idFaclinea == idFactura) {

                                    var subtotalLinea = record_gbl.getSublistValue({
                                        sublistId:'item',
                                        fieldId:'custcol_efx_fe_subtotal_gbl',
                                        line:x
                                    });

                                    subtotal_cab=subtotal_cab-parseFloat(subtotalLinea);

                                    record_gbl.removeLine({
                                        sublistId: 'item',
                                        line: x,
                                        ignoreRecalc: true
                                    });

                                    if(tipo=='CustInvc'){
                                        tipo = record.Type.INVOICE;

                                    }

                                    if(tipo=='CashSale'){
                                        tipo = record.Type.CASH_SALE;

                                    }

                                    record.submitFields({
                                        type: tipo,
                                        id: idFactura,
                                        values: {
                                            custbody_efx_fe_gbl_related: ''
                                        }
                                    });
                                }

                            }
                        }
                    }
                }
                record_gbl.setValue({fieldId:'custbody_efx_fe_gbl_subtotal',value:subtotal_cab});
                record_gbl.save();
            }catch(error_validaLineas){
                log.audit({title: 'error_validaLineas', details: error_validaLineas});
            }
        }

        function crearXML(tranid,trantype){
            log.audit({title:'tranid',details:tranid});
            log.audit({title:'trantype',details:trantype});

            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });


            var SLURL = url.resolveScript({
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


        }

        function sendToMail(tranid,trantype){
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });


            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_mail_sender_sl',
                deploymentId: 'customdeploy_efx_fe_mail_sender_sl',
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

            log.audit({title:'response-code_mail',details:response.code});
            log.audit({title:'response-body_mail',details:response.body});

            return response;

        }

        return {getInputData, map, reduce, summarize}

    });
