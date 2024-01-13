7/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/runtime', 'N/search','N/task'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, runtime, search,task) => {
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
                var busquedaRecords = search.create({
                    type: 'customrecord_efx_fe_gbl_automatic',
                    filters: [
                        ['custrecord_efx_fe_gbl_aut_status', search.Operator.ANYOF, 1, 2, 3, 5]
                        , 'AND',
                        ['isinactive', search.Operator.IS, 'F']
                        , 'AND',
                        ['custrecord_efx_fe_gbl_aut_location', search.Operator.NONEOF, '@NONE@']
                        ,'AND',
                        ['custrecord_efx_fe_gbl_aut_subsidiary', search.Operator.NONEOF, '@NONE@']
                        ,'AND',
                        ['custrecord_efx_fe_gbl_aut_gbltype', search.Operator.ISNOTEMPTY, '']

                    ],
                    columns: [
                        search.createColumn({name: 'custrecord_efx_fe_gbl_aut_subsidiary'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_aut_location'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_aut_startdate'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_aut_enddate'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_aut_gbltype'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_aut_tranid'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_aut_status'}),
                    ]
                });

                log.audit({title:'busquedaRecords',details:busquedaRecords});

                return busquedaRecords;
            }catch(error_busquedaRecords){
                log.error({title:'error_busquedaRecords',details:error_busquedaRecords});
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
                var statdoRec = data_reduce.custrecord_efx_fe_gbl_aut_status.value;
                var tipogbl = data_reduce.custrecord_efx_fe_gbl_aut_gbltype.value;
                log.audit({title: 'id_record', details: id_record});
                log.audit({title: 'data_reduce', details: data_reduce});
                log.audit({
                    title: 'data_reduce.custrecord_efx_fe_gbl_aut_startdate',
                    details: data_reduce.custrecord_efx_fe_gbl_aut_startdate
                });
                log.audit({
                    title: 'data_reduce.custrecord_efx_fe_gbl_aut_enddate',
                    details: data_reduce.custrecord_efx_fe_gbl_aut_enddate
                });
                log.audit({
                    title: 'data_reduce.custrecord_efx_fe_gbl_aut_location',
                    details: data_reduce.custrecord_efx_fe_gbl_aut_location.value
                });
            try {
                if (statdoRec == '1' || statdoRec == '3' || statdoRec == '5') {
                    var buscaTicket = search.create({
                        type: search.Type.TRANSACTION,
                        filters: [
                            ['type', search.Operator.ANYOF, 'CustInvc', 'CashSale']
                            , 'AND',
                            ['mainline', search.Operator.IS, 'T']
                            , 'AND',
                            ['trandate', search.Operator.ONORAFTER, data_reduce.custrecord_efx_fe_gbl_aut_startdate]
                            , 'AND',
                            ['trandate', search.Operator.ONORBEFORE, data_reduce.custrecord_efx_fe_gbl_aut_enddate],
                            'AND',
                            ['location', search.Operator.IS, data_reduce.custrecord_efx_fe_gbl_aut_location.value]
                            , 'AND',
                            ['custbody_mx_cfdi_uuid', search.Operator.ISEMPTY, '']
                            , 'AND',
                            ['custbody_efx_fe_gbl_related', search.Operator.ANYOF, '@NONE@']
                            , 'AND',
                            ['custbody_efx_fe_invoice_related', search.Operator.ANYOF, '@NONE@']
                            , 'AND',
                            ['custbody_efx_fe_gbl_ismirror', search.Operator.IS, 'F']
                        ]
                    });

                    var ejecutar = buscaTicket.run();
                    var resultado = ejecutar.getRange(0, 100);
                    var ejecutarNumeros = buscaTicket.runPaged();
                    var numTickets = ejecutarNumeros.count;
                    log.audit({title: 'numTickets', details: numTickets});
                    log.audit({title: 'resultado', details: resultado});


                    if (resultado.length > 0) {

                        creagbl(data_reduce.custrecord_efx_fe_gbl_aut_startdate, data_reduce.custrecord_efx_fe_gbl_aut_enddate, id_record,data_reduce.custrecord_efx_fe_gbl_aut_location.value,tipogbl,data_reduce.custrecord_efx_fe_gbl_aut_subsidiary.value);

                    } else {
                        record.submitFields({
                            type: 'customrecord_efx_fe_gbl_automatic',
                            id: id_record,
                            values: {
                                'custrecord_efx_fe_gbl_aut_status': 5,
                                'custrecord_efx_fe_gbl_aut_log': 'No se encontraron facturas en el rango de fechas especificado.'
                            }
                        });
                    }
                } else if (statdoRec == '2') {

                    var buscaGlobal = search.create({
                        type: 'customsale_efx_fe_factura_global',
                        filters: [
                            ['mainline', search.Operator.IS, 'T']
                            , 'AND',
                            ['trandate', search.Operator.ONORAFTER, data_reduce.custrecord_efx_fe_gbl_aut_startdate]
                            , 'AND',
                            ['trandate', search.Operator.ONORBEFORE, data_reduce.custrecord_efx_fe_gbl_aut_enddate],
                            'AND',
                            ['location', search.Operator.IS, data_reduce.custrecord_efx_fe_gbl_aut_location.value]
                        ],
                        columns: [
                            search.createColumn({name: 'internalid'})
                        ]
                    });

                    var ejecutar = buscaGlobal.run();
                    var resultado = ejecutar.getRange(0, 100);

                    log.audit({title: 'resultado', details: resultado});
                    var idglobal = '';
                    for (var i = 0; i < resultado.length; i++) {
                        idglobal = resultado[i].getValue({name: 'internalid'});
                    }
                    if (idglobal) {
                        record.submitFields({
                            type: 'customrecord_efx_fe_gbl_automatic',
                            id: id_record,
                            values: {
                                'custrecord_efx_fe_gbl_aut_status': 4,
                                'custrecord_efx_fe_gbl_aut_gbl_tran': idglobal,
                                'custrecord_efx_fe_gbl_aut_log': 'Se generó su factura global con el id: ' + idglobal
                            }
                        });
                    } else {
                        record.submitFields({
                            type: 'customrecord_efx_fe_gbl_automatic',
                            id: id_record,
                            values: {
                                'custrecord_efx_fe_gbl_aut_status': 3,
                                'custrecord_efx_fe_gbl_aut_log': 'No se ha generado su factura global'
                            }
                        });
                    }
                }
            }catch(error_procesa){
                record.submitFields({
                    type: 'customrecord_efx_fe_gbl_automatic',
                    id: id_record,
                    values: {
                        'custrecord_efx_fe_gbl_aut_status': 5,
                        'custrecord_efx_fe_gbl_aut_log': JSON.stringify(error_procesa)
                    }
                });
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

        function creagbl(startdate,enddate,id_record,idlocation_mr,tipogbl,subsidiaria_aut){

            try {
                for (var i = 1; i <= 20; i++) {
                    var scriptdeploy_id = 'customdeploy_efx_fe_create_global_mr' + i;
                    log.debug('scriptdeploy_id', scriptdeploy_id);

                    var mrTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                    mrTask.scriptId = 'customscript_efx_fe_create_global_mr';
                    mrTask.deploymentId = scriptdeploy_id;

                    mrTask.params = {
                        'custscript_efx_fe_gbl_startdate': startdate,
                        'custscript_efx_fe_gbl_enddate': enddate,
                        'custscript_efx_fe_gbl_location': idlocation_mr,
                        'custscript_efx_fe_gbl_type': tipogbl,
                        'custscript_efx_fe_gbl_subsidiary': subsidiaria_aut,
                    }

                    try {
                        var mrTaskId = mrTask.submit();
                        log.debug("scriptTaskId tarea ejecutada", mrTaskId);
                        log.audit("Tarea ejecutada", mrTaskId);
                        break;
                    } catch (e) {
                        log.debug({title: "error", details: e});
                        log.error("summarize", "Aún esta corriendo el deployment: " + scriptdeploy_id);
                        record.submitFields({
                            type: 'customrecord_efx_fe_gbl_automatic',
                            id: id_record,
                            values: {
                                'custrecord_efx_fe_gbl_aut_status': 3,
                                'custrecord_efx_fe_gbl_aut_log': e
                            }
                        });
                    }
                }

                log.debug({title: 'task id', details: mrTaskId});
                if (mrTaskId != null && mrTaskId != "") {
                    record.submitFields({
                        type: 'customrecord_efx_fe_gbl_automatic',
                        id: id_record,
                        values: {
                            'custrecord_efx_fe_gbl_aut_status': 2,
                            'custrecord_efx_fe_gbl_aut_log': 'Se está generando el registro de factura global' + mrTaskId
                        }
                    });

                } else {
                    record.submitFields({
                        type: 'customrecord_efx_fe_gbl_automatic',
                        id: id_record,
                        values: {
                            'custrecord_efx_fe_gbl_aut_status': 5,
                            'custrecord_efx_fe_gbl_aut_log': 'No se generó el registro global'
                        }
                    });

                }
            }catch(error_gbl){
                record.submitFields({
                    type: 'customrecord_efx_fe_gbl_automatic',
                    id: id_record,
                    values: {
                        'custrecord_efx_fe_gbl_aut_status': 3,
                        'custrecord_efx_fe_gbl_aut_log': error_gbl
                    }
                });
            }
        }

        return {getInputData, map, reduce, summarize}

    });
