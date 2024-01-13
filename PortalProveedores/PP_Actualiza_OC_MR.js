    /**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search','N/email','N/runtime'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search,email,runtime) => {
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
            try {

                var buscarOC = search.create({
                    type: search.Type.PURCHASE_ORDER,
                    filters: [
                        ['mainline', search.Operator.IS, 'T']
                        , 'AND',
                        ['custbody_efx_pp_mail_sent',search.Operator.IS,'F']
                        ,'AND',
                        ['custbody_efx_pp_process_portal', search.Operator.ANYOF, 2,3,4]
                        ,'AND',
                        ['voided', search.Operator.IS, 'F']

                    ],
                    columns: [
                        search.createColumn({name: 'internalid'}),
                        search.createColumn({name: 'custbody_efx_pp_mail_sent'}),
                        search.createColumn({name: 'custbody_efx_pp_process_portal'}),
                        search.createColumn({name: 'entity'}),
                        search.createColumn({name: 'total'}),
                        search.createColumn({name: 'tranid'}),
                    ]
                });

                return buscarOC;
            }catch(error_getInputData){
                log.error({title:'error_getInputData',details:error_getInputData});
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
            var id_record = reduceContext.key;
            var data_reduce = JSON.parse(reduceContext.values[0]);

            var mail_sent = data_reduce.custbody_efx_pp_mail_sent;
            var entity = data_reduce.entity;
            var total_OC = parseFloat(data_reduce.total);
            var status_portal = data_reduce.custbody_efx_pp_process_portal;
            log.audit({title: 'reduce', details: reduceContext});
            log.audit({title: 'data_reduce', details: data_reduce});
            try {
                var record_master_search = search.create({
                    type: 'customrecord_efx_pp_portal_request',
                    filters: [
                        ['custrecord_efx_pp_master_oc', search.Operator.IS, id_record]
                        , 'AND',
                        ['custrecord_efx_pp_electronic_doc', search.Operator.ISNOTEMPTY, '']
                    ],
                    columns: [
                        search.createColumn({name: 'created', sort: search.Sort.DESC}),
                        search.createColumn({name: 'custrecord_efx_pp_electronic_doc'}),
                    ]
                });

                var ejecutar_record_master_search = record_master_search.run();
                var resultado_record_master_search = ejecutar_record_master_search.getRange(0, 100);

                var id_inbound = resultado_record_master_search[0].getValue({name: 'custrecord_efx_pp_electronic_doc'});

                var parcialidad = buscaFactura(id_record,total_OC);

                if(id_inbound){
                    var inbound_obj = record.load({
                        type:'customrecord_psg_ei_inbound_edoc',
                        id:id_inbound
                    });

                    var status_inbound = inbound_obj.getValue({fieldId:'custrecord_psg_ei_inbound_status'});
                    var oc_number = data_reduce.tranid;

                    // var recordOc = record.load({
                    //     type:record.Type.PURCHASE_ORDER,
                    //     id:id_record
                    // });

                    // var seEnvioMail = recordOc.getValue({fieldId:'custbody_efx_pp_mail_sent'});
                    var seEnvioMail = mail_sent;
                    log.audit({title:'seEnvioMail',details:seEnvioMail});
                    log.audit({title:'status_inbound',details:status_inbound});
                    log.audit({title:'oc_number',details:oc_number});
                    // var statusPortal = recordOc.getValue({fieldId:'custbody_efx_pp_process_portal'});

                    if(status_inbound==15){

                        var envio_mail = sendMail(entity,status_inbound,oc_number);

                        var estado_oc = 1;
                        var envia_correo = false;

                        if(parcialidad){
                            estado_oc = 6;
                        }

                        if(envio_mail){
                            envia_correo = true;
                        }

                        record.submitFields({
                            type: record.Type.PURCHASE_ORDER,
                            id: id_record,
                            values:{
                                custbody_efx_pp_process_portal:estado_oc,
                                custbody_efx_pp_mail_sent:envia_correo
                            }
                        });
                    }

                    log.audit({title:'seEnvioMail',details:seEnvioMail});
                    if(status_inbound==14) {

                        var envia_correo = false;
                        if (seEnvioMail=='F') {
                            var envio_mail = sendMail(entity, status_inbound, oc_number);
                            log.audit({title:'envio_mail',details:envio_mail});
                            if (envio_mail) {
                                envia_correo = true;
                            }
                        }else{
                            envia_correo = true;
                        }
                            var estado_oc = 3;
                            record.submitFields({
                                type: record.Type.PURCHASE_ORDER,
                                id: id_record,
                                values: {
                                    custbody_efx_pp_process_portal: estado_oc,
                                    custbody_efx_pp_mail_sent: envia_correo
                                }
                            });

                    }

                }

            }catch(error_actualiza){
                log.audit({title: 'error_actualiza', details: error_actualiza});
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

        const sendMail = (entity,status_inbound,oc_number) =>{
            try {
                var subjectText = '';
                var bodyText = '';

                var scriptObj = runtime.getCurrentScript();
                var emailAuthor = scriptObj.getParameter({name: 'custscript_efx_fe_mail_sender'});
                var portalConfig = scriptObj.getParameter({name: 'custscript_efx_pp_portal_config'});

                var configObj = record.load({
                    type: 'customrecordefx_pp_vendor_pconfig',
                    id: portalConfig
                });

                if (status_inbound == 15) {
                    subjectText = configObj.getValue({fieldId: 'custrecord_efx_pp_mail_subjec'});
                    bodyText = configObj.getValue({fieldId: 'custrecord_efx_pp_mail_body'});
                }

                if (status_inbound == 14) {
                    subjectText = configObj.getValue({fieldId: 'custrecord_efx_pp_mail_subject_error'});
                    bodyText = configObj.getValue({fieldId: 'custrecord_efx_pp_mail_body_error'});
                }

                bodyText = bodyText+' Orden de compra: '+oc_number;
                log.audit({title:'bodytext',details:bodyText});

                email.send({
                    author: emailAuthor,
                    recipients: entity.value,
                    subject: subjectText,
                    body: bodyText
                });

                return true;
            }catch (error_mail){
                log.audit({title: 'error_mail', details: error_mail});
                return false;
            }
        }

        const buscaFactura = (id_record,total_OC) =>{
            try {
                var busca_ocs = search.create({
                    type: search.Type.VENDOR_BILL,
                    filters: [
                        ['taxline', search.Operator.IS, 'F']
                        , 'AND',
                        ['mainline', search.Operator.IS, 'T']
                        , 'AND',
                        ['createdfrom', search.Operator.ANYOF, id_record]
                    ],
                    columns: [
                        search.createColumn({name: 'tranid'}),
                        search.createColumn({name: 'total'}),
                        search.createColumn({name: 'createdfrom'}),
                        search.createColumn({name: 'payingamount'}),
                        search.createColumn({name: 'total', join: 'createdfrom'}),
                    ]
                });

                var ejecutar_busca_ocs = busca_ocs.run();
                var resultado_busca_ocs = ejecutar_busca_ocs.getRange(0, 100);

                var total_facturas = 0;
                for (var i = 0; i < resultado_busca_ocs.length; i++) {
                    var total_fc = parseFloat(resultado_busca_ocs[i].getValue({name: 'total'})) || 0;
                    total_facturas = total_facturas + total_fc;
                }

                if (total_OC != total_facturas) {
                    return true;
                } else {
                    return false;
                }
            }catch (error_buscafactura){
                log.audit({title: 'error_buscafactura', details: error_buscafactura});
            }
        }

        return {getInputData, map, reduce, summarize}

    });
