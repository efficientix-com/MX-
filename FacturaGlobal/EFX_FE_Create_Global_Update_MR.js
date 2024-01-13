/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search','N/url','N/https','N/runtime','N/format'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search,url,https,runtime,format) => {
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
            var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
            try {
                //Obtener Info de parametros
                var scriptObj = runtime.getCurrentScript();

                var jsonGBL_param = scriptObj.getParameter({ name: 'custscript_efx_fe_createupdate_f' });
                var idglobal = scriptObj.getParameter({ name: 'custscript_efx_fe_createupdate_id' });

                var filtros_busqueda = '';
                if(jsonGBL_param){
                    filtros_busqueda = JSON.parse(jsonGBL_param);
                }


                log.audit({title:'filtros_busqueda',details:filtros_busqueda});

                if(filtros_busqueda.length>0){
                    log.audit({title:'entra',details:'entra'});
                    if(existeSuiteTax){
                        var busqueda_facturas_actualiza = search.create({
                            type: search.Type.TRANSACTION,
                            filters: filtros_busqueda,
                            columns: [
                                search.createColumn({name:'tranid'}),
                                search.createColumn({name:'total'}),
                                search.createColumn({name:'location'}),
                                search.createColumn({name:'custbody_efx_fe_tax_json'}),
                                search.createColumn({name:'type'}),
                                search.createColumn({name:'currency'}),
                                search.createColumn({name:'internalid'}),
                                search.createColumn({name: "formulanumeric", formula: "rownum",sort: search.Sort.ASC}),

                            ]
                        });
                    }else{

                        var busqueda_facturas_actualiza = search.create({
                            type: search.Type.TRANSACTION,
                            filters: filtros_busqueda,
                            columns: [
                                search.createColumn({name:'tranid'}),
                                search.createColumn({name:'netamountnotax'}),
                                search.createColumn({name:'taxtotal'}),
                                search.createColumn({name:'total'}),
                                search.createColumn({name:'location'}),
                                search.createColumn({name:'custbody_efx_fe_tax_json'}),
                                search.createColumn({name:'type'}),
                                search.createColumn({name:'currency'}),
                                search.createColumn({name:'internalid'}),
                                search.createColumn({name: "formulanumeric", formula: "rownum",sort: search.Sort.ASC}),

                            ]
                        });
                    }

                }else{

                    var busqueda_facturas_actualiza = search.load({ id: 'customsearch_efx_fe_global_search' });
                }


                log.audit({title: 'busqueda_facturas', details: busqueda_facturas_actualiza});

                return busqueda_facturas_actualiza;

            }catch(error_busqueda){
                log.audit({title: 'error_busqueda', details: error_busqueda});
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
            var scriptObj = runtime.getCurrentScript();
            var idglobal = scriptObj.getParameter({ name: 'custscript_efx_fe_createupdate_id' });
            try{
                log.audit({title:'map',details:JSON.parse(mapContext.value)});
                var datos = JSON.parse(mapContext.value);

                log.audit({title:'map - values',details:datos.values});


                    var idfact = datos.values.internalid.value;
                    var tipofact = datos.values.type.value;
                    log.audit({title:'idfact',details:idfact});
                    log.audit({title:'tipofact',details:tipofact});
                    if (tipofact == 'CustInvc') {
                        tipofact = record.Type.INVOICE;
                    }

                    if (tipofact == 'CashSale') {
                        tipofact = record.Type.CASH_SALE;
                    }
                    if(idfact && tipofact){
                        try {
                            record.submitFields({
                                type: tipofact,
                                id: idfact,
                                values: {
                                    custbody_efx_fe_gbl_related: idglobal,
                                }
                            });
                        }catch(error_actualizafacts){
                            log.audit({title: 'error_actualizafacts', details: error_actualizafacts});
                        }
                    }

            }catch(error){
                log.error({title:'map - error',details:error});
            }
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





        return {getInputData, map, reduce, summarize}

    });
