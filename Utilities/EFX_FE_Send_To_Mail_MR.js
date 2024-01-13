/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/redirect','N/https','N/runtime', 'N/search','N/url'],
    /**
 * @param{N} N
 */
    (record, redirect,https,runtime, search,urlMod) => {
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
            var idbusqueda = scriptObj.getParameter({ name: 'custscript_efx_sent_mail_search' });
            try {
                var busqueda_facturas = search.load({ id: idbusqueda });


                log.audit({title: 'busqueda_facturas', details: busqueda_facturas});
                return busqueda_facturas;

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

        const map = (context) => {
            try{
                log.audit({title:'map',details:JSON.parse(context.value)});
                var datos = JSON.parse(context.value);


                log.audit({title:'map - values',details:datos.values});
                var peticion = datos.id;
                context.write({
                    key: peticion,
                    value: datos.values
                });
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
        const reduce = (context) => {
            log.audit({title:'reduce-context',details:context});
            var data_reduce = JSON.parse(context.values[0]);
            var id = JSON.parse(context.key);

            log.audit({title:'data_reduce',details:data_reduce});
            log.audit({title:'id',details:id});
            log.audit({title:'data_reduce.type',details:data_reduce.type});

            var tipo_transaccion = '';
            var entidad = '';
            if(data_reduce.type.value=='CustInvc'){
                tipo_transaccion = record.Type.INVOICE;

            }
            if(data_reduce.type.value=='CustPymt'){
                tipo_transaccion = record.Type.CUSTOMER_PAYMENT;

            }

            if(data_reduce.type.value=='CashSale'){
                tipo_transaccion = record.Type.CASH_SALE;

            }

            if(data_reduce.type.value=='CreditMemo'){
                tipo_transaccion = record.Type.CREDIT_MEMO;

            }

            var record_tipo = record.load({
                type: tipo_transaccion,
                id: id,
                isDynamic: true,
            });

            enviarCorreos(id,record_tipo.type);

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

        function enviarCorreos(tranid,trantype){
            log.audit({title:'tranid',details:tranid});
            log.audit({title:'trantype',details:trantype});

            var scheme = 'https://';
            var host = urlMod.resolveDomain({
                hostType: urlMod.HostType.APPLICATION
            });


            var SLURL = urlMod.resolveScript({
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
            log.audit({title:'response-code',details:response.code});
            log.audit({title:'response-body',details:response.body});

            return response.body;

        }

        return {getInputData, map, reduce, summarize}

    });
