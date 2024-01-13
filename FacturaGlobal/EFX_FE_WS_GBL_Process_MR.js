/**
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
                    type: 'customrecord_efx_fe_gbl_log',
                    filters: [
                        ['custrecord_efx_fe_gbl_status_ws', search.Operator.ANYOF, 1, 2, 3, 5]
                        , 'AND',
                        ['isinactive', search.Operator.IS, 'F']
                        , 'AND',
                        ['custrecord_efx_fe_gbl_json', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['custrecord_efx_fe_gbl_yaax_location', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['custrecord_efx_fe_gbl_cashregister', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['custrecord_efx_fe_gbl_employee', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['custrecord_efx_fe_gbl_total', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['custrecord_efx_fe_gbl_location', search.Operator.NONEOF, '@NONE@']

                    ],
                    columns: [
                        search.createColumn({name: 'custrecord_efx_fe_gbl_json'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_yaax_location'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_cashregister'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_employee'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_total'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_total_netsuite'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_status_ws'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_st_date'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_en_date'}),
                        search.createColumn({name: 'custrecord_efx_fe_gbl_location'}),
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
            var statdoRec = data_reduce.custrecord_efx_fe_gbl_status_ws.value;
            log.audit({title:'id_record',details:id_record});
            log.audit({title:'data_reduce',details:data_reduce});
            log.audit({title:'data_reduce.custrecord_efx_fe_gbl_st_date',details:data_reduce.custrecord_efx_fe_gbl_st_date});
            log.audit({title:'data_reduce.custrecord_efx_fe_gbl_en_date',details:data_reduce.custrecord_efx_fe_gbl_en_date});
            log.audit({title:'data_reduce.custrecord_efx_fe_gbl_location',details:data_reduce.custrecord_efx_fe_gbl_location});
            var jsonPeticion = JSON.parse(data_reduce.custrecord_efx_fe_gbl_json);
            log.audit({title:'jsonPeticion.startdate',details:jsonPeticion.startdate});
            log.audit({title:'jsonPeticion.finishdate',details:jsonPeticion.finishdate});

            if(statdoRec=='1' || statdoRec=='3' || statdoRec=='5') {
                var buscaTicket = search.create({
                    type: search.Type.TRANSACTION,
                    filters: [
                        ['type', search.Operator.ANYOF, 'CustInvc', 'CashSale']
                        , 'AND',
                        ['mainline', search.Operator.IS, 'T']
                        , 'AND',
                        ['custbody_efx_iy_noticket', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['trandate', search.Operator.ONORAFTER, data_reduce.custrecord_efx_fe_gbl_st_date]
                        , 'AND',
                        ['trandate', search.Operator.ONORBEFORE, data_reduce.custrecord_efx_fe_gbl_en_date],
                        'AND',
                        ['location', search.Operator.IS, data_reduce.custrecord_efx_fe_gbl_location.value]
                        ,'AND',
                        // ['custbody_mx_cfdi_uuid', search.Operator.ISEMPTY, '']
                        // ,'AND',
                        ['custbody_efx_fe_gbl_related', search.Operator.ANYOF, '@NONE@']
                        ,'AND',
                        // ['custbody_efx_fe_invoice_related', search.Operator.ANYOF, '@NONE@']
                        // ,'AND',
                        ['custbody_efx_fe_gbl_ismirror',search.Operator.IS,'F']
                        ,'AND',
                        ["formulanumeric: (CASE WHEN SUBSTR({custbody_efx_iy_id_yaax},-8) = TO_CHAR({trandate},'DDMMYYYY') THEN 1 ELSE 0 END)",search.Operator.EQUALTO,"1"]
                    ]
                });

                var ejecutar = buscaTicket.run();
                var resultado = ejecutar.getRange(0, 100);
                var ejecutarNumeros = buscaTicket.runPaged();
                var numTickets = ejecutarNumeros.count;
                log.audit({title: 'numTickets', details: numTickets});
                log.audit({title: 'resultado', details: resultado});

                record.submitFields({
                    type: 'customrecord_efx_fe_gbl_log',
                    id: id_record,
                    values: {
                        'custrecord_efx_fe_gbl_total_netsuite': numTickets,
                    }
                });

                if(data_reduce.custrecord_efx_fe_gbl_total>0) {
                    if (numTickets == data_reduce.custrecord_efx_fe_gbl_total) {

                        creagbl(data_reduce.custrecord_efx_fe_gbl_st_date, data_reduce.custrecord_efx_fe_gbl_en_date, jsonPeticion, id_record);

                    } else {
                        record.submitFields({
                            type: 'customrecord_efx_fe_gbl_log',
                            id: id_record,
                            values: {
                                'custrecord_efx_fe_gbl_status_ws': 5,
                                'custrecord_efx_fe_gbl_log_ws': 'Faltan tickets de registrar en el sistema, se reprocesara cuando esten coincidan los ticket de caja con Netsuite.'
                            }
                        });
                    }
                }else{
                    record.submitFields({
                        type: 'customrecord_efx_fe_gbl_log',
                        id: id_record,
                        values: {
                            'custrecord_efx_fe_gbl_status_ws': 4,
                            'custrecord_efx_fe_gbl_log_ws': 'Se procesó el registro debido a que no se reportaron tickets en esta tienda.'
                        }
                    });
                }
            }else if(statdoRec=='2'){

                var buscaGlobal = search.create({
                    type: 'customsale_efx_fe_factura_global',
                    filters: [
                        ['mainline', search.Operator.IS, 'T']
                        , 'AND',
                        ['trandate', search.Operator.ONORAFTER, data_reduce.custrecord_efx_fe_gbl_st_date]
                        , 'AND',
                        ['trandate', search.Operator.ONORBEFORE, data_reduce.custrecord_efx_fe_gbl_en_date],
                        'AND',
                        ['location', search.Operator.IS, data_reduce.custrecord_efx_fe_gbl_location.value]
                    ],
                    columns:[
                        search.createColumn({name:'internalid'})
                    ]
                });

                var ejecutar = buscaGlobal.run();
                var resultado = ejecutar.getRange(0, 100);
                var ejecutarNumeros = buscaGlobal.runPaged();
                var numTickets = ejecutarNumeros.count;
                log.audit({title: 'numTickets', details: numTickets});
                log.audit({title: 'resultado', details: resultado});
                var idglobal = '';
                for(var i=0;i<resultado.length;i++){
                    idglobal = resultado[i].getValue({name:'internalid'});
                }
                if(idglobal){
                    record.submitFields({
                        type: 'customrecord_efx_fe_gbl_log',
                        id: id_record,
                        values: {
                            'custrecord_efx_fe_gbl_status_ws': 4,
                            'custrecord_efx_fe_gbl_tran_ws': idglobal,
                            'custrecord_efx_fe_gbl_log_ws': 'Se generó su factura global con el id: '+idglobal
                        }
                    });
                }else{
                    record.submitFields({
                        type: 'customrecord_efx_fe_gbl_log',
                        id: id_record,
                        values: {
                            'custrecord_efx_fe_gbl_status_ws': 3,
                            'custrecord_efx_fe_gbl_log_ws': 'No se ha generado su factura global'
                        }
                    });
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

        function creagbl(startdate,enddate,body,id_record){

            try {
                for (var i = 1; i <= 20; i++) {
                    var scriptdeploy_id = 'customdeploy_efx_fe_create_global_mr' + i;
                    log.debug('scriptdeploy_id', scriptdeploy_id);

                    var mrTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                    mrTask.scriptId = 'customscript_efx_fe_create_global_mr';
                    mrTask.deploymentId = scriptdeploy_id;
                    let dateStart = body.startdate.split('/');
                    let dateEnd = body.finishdate.split('/');
                    mrTask.params = {
                        // 'custscript_efx_fe_gbl_startdate': dateStart[1] + '/' + dateStart[0] + '/' + dateStart[2],
                        // 'custscript_efx_fe_gbl_enddate': dateEnd[1] + '/' + dateEnd[0] + '/' + dateEnd[2],
                        'custscript_efx_fe_gbl_startdate': startdate,
                        'custscript_efx_fe_gbl_enddate': enddate,
                        'custscript_efx_fe_gbl_location': body.location,
                        'custscript_efx_fe_gbl_obj_json': JSON.stringify(body),
                        'custscript_efx_fe_meses_gbl':dateStart[1]
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
                            type: 'customrecord_efx_fe_gbl_log',
                            id: id_record,
                            values: {
                                'custrecord_efx_fe_gbl_status_ws': 3,
                                'custrecord_efx_fe_gbl_log_ws': e
                            }
                        });
                    }
                }

                log.debug({title: 'task id', details: mrTaskId});
                if (mrTaskId != null && mrTaskId != "") {
                    record.submitFields({
                        type: 'customrecord_efx_fe_gbl_log',
                        id: id_record,
                        values: {
                            'custrecord_efx_fe_gbl_status_ws': 2,
                            'custrecord_efx_fe_gbl_log_ws': 'Se está generando el registro de factura global' + mrTaskId
                        }
                    });

                } else {
                    record.submitFields({
                        type: 'customrecord_efx_fe_gbl_log',
                        id: id_record,
                        values: {
                            'custrecord_efx_fe_gbl_status_ws': 5,
                            'custrecord_efx_fe_gbl_log_ws': 'No se generó el registro global'
                        }
                    });

                }
            }catch(error_gbl){
                record.submitFields({
                    type: 'customrecord_efx_fe_gbl_log',
                    id: id_record,
                    values: {
                        'custrecord_efx_fe_gbl_status_ws': 3,
                        'custrecord_efx_fe_gbl_log_ws': error_gbl
                    }
                });
            }
        }

        return {getInputData, map, reduce, summarize}

    });
