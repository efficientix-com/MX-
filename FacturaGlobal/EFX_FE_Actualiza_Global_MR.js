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
            try {
                var scriptObj = runtime.getCurrentScript();
                var idgbltransaccion = scriptObj.getParameter({name: 'custscript_efx_fe_gbl_id_tran'});
                var tipoglobaltransaccion = 'CuTrSale' + idgbltransaccion;
                log.audit({title: 'tipoglobaltransaccion', details: tipoglobaltransaccion});
                var buscaGlobales = search.create({
                    type: search.Type.TRANSACTION,
                    filters: [
                        ["type", search.Operator.ANYOF, tipoglobaltransaccion]
                        , 'AND',
                        ["mainline", search.Operator.IS, "T"]
                        , "AND",
                        ["custbody_efx_fe_gbl_reprocess", search.Operator.IS, "F"]
                        , "AND",
                        ["custbody_efx_fe_gbl_fexec", search.Operator.IS, "T"]
                        , "AND",
                        ['custbody_mx_cfdi_uuid', search.Operator.ISEMPTY, ""]
                        , "AND",
                        ['custbody_efx_fe_gbl_mirror_tran', search.Operator.ANYOF, "@NONE@"]
                    ],
                    columns: [
                        search.createColumn({name: "tranid", summary: "GROUP", label: "Numero de documento"}),
                        search.createColumn({name: "internalid", summary: "GROUP", label: "Id Global"}),
                        search.createColumn({
                            name: "custbody_efx_fe_gbl_transactions",
                            summary: "GROUP",
                            label: "Transacciones GBL"
                        }),
                        search.createColumn({
                            name: "custbody_efx_fe_gbl_envio",
                            summary: "GROUP",
                            label: "Metodo Envio"
                        }),
                        search.createColumn({
                            name: "custbody_efx_fe_gbl_plantilla",
                            summary: "GROUP",
                            label: "Plantilla XML"
                        }),
                        search.createColumn({name: "entity", summary: "GROUP", label: "Cliente"}),
                    ]
                });

                return buscaGlobales;
            }catch(error_busqueda){
                log.error({title: 'error_busqueda', details: error_busqueda});
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
            var idGlobal = datos.values['GROUP(internalid)'].value;
            record.submitFields({
                type: 'customsale_efx_fe_factura_global',
                id: idGlobal,
                values: {
                    custbody_efx_fe_gbl_reprocess: true,
                }
            });

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
            try {
                var data_reduce = JSON.parse(reduceContext.values[0]);

                log.audit({title: 'data_reduce', details: data_reduce});

                var idGlobal = data_reduce['GROUP(internalid)'].value;
                var arrayfact = new Array()
                arrayfact = data_reduce['GROUP(custbody_efx_fe_gbl_transactions)'];
                var setup_metodo = data_reduce['GROUP(custbody_efx_fe_gbl_envio)'].value;
                var setup_plantilla = data_reduce['GROUP(custbody_efx_fe_gbl_plantilla)'].value;
                var setup_entity = data_reduce['GROUP(entity)'].value;

                var scriptObj = runtime.getCurrentScript();
                var GBL_Config = scriptObj.getParameter({name: 'custscript_efx_fe_gbl_config'});

                var record_setup = record.load({
                    type: 'customrecord_efx_fe_facturaglobal_setup',
                    id: GBL_Config
                });

                var setup_txcode = record_setup.getValue({fieldId: 'custrecord_efx_fe_gbl_tax'});
                var setup_item = record_setup.getValue({fieldId: 'custrecord_efx_fe_gbl_item'});

                log.audit({title: 'arrayfact', details: arrayfact.length});
                log.audit({title: 'arrayfact', details: arrayfact[0]});


                try {
                    var objLineas = {
                        tipo: '',
                        numeroLineas: '',
                        idglobal: '',
                        espejoUuid: '',
                        espejoCert: '',
                        espejoPdf: '',
                        espejoGen: '',
                    }

                    objLineas.tipo = 'nuevo';
                    objLineas.idglobal = idGlobal;
                    objLineas.espejoUuid = '';
                    objLineas.espejoCert = '';
                    objLineas.espejoPdf = '';
                    objLineas.espejoGen = '';
                    objLineas.espejo = '';
                    objLineas.setup_metodo = setup_metodo;
                    objLineas.setup_plantilla = setup_plantilla;
                    objLineas.setup_txcode = setup_txcode;
                    objLineas.setup_entity = setup_entity;
                    objLineas.setup_item = setup_item;


                    var SLURL = url.resolveScript({
                        scriptId: 'customscript_efx_fe_actualiza_tran_sl',
                        deploymentId: 'customdeploy_efx_fe_actualiza_tran_sl',
                        returnExternalUrl: true,
                        body: JSON.stringify(objLineas)
                    });

                    log.audit({title: 'SLURL', details: SLURL});


                    var headers = {
                        "Content-Type": "application/json"
                    };

                    var response = https.request({
                        method: https.Method.POST,
                        url: SLURL,
                        headers: headers,
                        body: JSON.stringify(objLineas)
                    })

                    log.audit({title: 'response-code', details: response.code});
                    log.audit({title: 'response-body', details: response.body});


                } catch (error_actualiza) {
                    log.error({title: 'error_actualiza', details: error_actualiza})
                }
            }catch(error_reduce){
                log.error({title: 'error_reduce', details: error_reduce})
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

        return {getInputData, map, reduce, summarize}

    });
