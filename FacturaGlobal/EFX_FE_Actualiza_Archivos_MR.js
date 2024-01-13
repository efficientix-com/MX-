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
            var idgbltransaccion = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_id_tran' });
            var tipoglobaltransaccion = 'CuTrSale'+idgbltransaccion;
                    var buscaGlobales = search.create({
                        type: search.Type.TRANSACTION,
                        filters: [
                            ["type", search.Operator.ANYOF, tipoglobaltransaccion]
                            , 'AND',
                            ["mainline", search.Operator.IS, "T"]
                            , "AND",
                            ['custbody_mx_cfdi_uuid', search.Operator.ISEMPTY, ""]
                            , "AND",
                            ['custbody_efx_fe_gbl_mirror_tran.custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, ""]
                        ],
                        columns: [
                            search.createColumn({name: "tranid", summary: "GROUP", label: "Numero de documento"}),
                            search.createColumn({name: "internalid", summary: "GROUP", label: "ID interno gbl"}),
                            search.createColumn({name: "custbody_mx_cfdi_uuid", join: "CUSTBODY_EFX_FE_GBL_MIRROR_TRAN", summary: "GROUP", label: "UUID"}),
                            search.createColumn({name: "custbody_efx_fe_gbl_transactions", summary: "GROUP", label: "Transacciones GBL"}),
                            search.createColumn({name: "internalid", join: "CUSTBODY_EFX_FE_GBL_MIRROR_TRAN", summary: "GROUP", label: "ID interno"}),
                        ]
                    });

                    return buscaGlobales;

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
            log.audit({title: 'foliogbl', details: data_reduce['GROUP(tranid)']});
            log.audit({title: 'uuid', details: data_reduce['GROUP(custbody_mx_cfdi_uuid.CUSTBODY_EFX_FE_GBL_MIRROR_TRAN)']});
            log.audit({title: 'transaccionesrel', details: data_reduce['GROUP(custbody_efx_fe_gbl_transactions)']});
            log.audit({title: 'internalid', details: data_reduce['GROUP(internalid.CUSTBODY_EFX_FE_GBL_MIRROR_TRAN)'].value});
            var arrayfact = new Array();
            arrayfact = data_reduce['GROUP(custbody_efx_fe_gbl_transactions)'];
            var idGlobal = data_reduce['GROUP(internalid)'].value;
            var uuid = data_reduce['GROUP(custbody_mx_cfdi_uuid.CUSTBODY_EFX_FE_GBL_MIRROR_TRAN)'];
            var idEspejo = data_reduce['GROUP(internalid.CUSTBODY_EFX_FE_GBL_MIRROR_TRAN)'].value;

            var recEspejo = record.load({
                type: record.Type.INVOICE,
                id:idEspejo
            });

            var xmlGenerado = recEspejo.getValue({fieldId:'custbody_psg_ei_content'});
            var xmlTimbrado = recEspejo.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
            var pdfGenerado = recEspejo.getValue({fieldId:'custbody_edoc_generated_pdf'});

            log.audit({title: 'arrayfact', details: arrayfact.length});
            log.audit({title: 'arrayfact', details: arrayfact[0]});


            if(uuid){
                try{
                    var objLineas = {
                        tipo:'',
                        numeroLineas:'',
                        idglobal:'',
                        espejoUuid:'',
                        espejoCert:'',
                        espejoPdf:'',
                        espejoGen:'',
                    }


                    objLineas.tipo = 'existe';
                    objLineas.numeroLineas = arrayfact.length;
                    objLineas.idglobal = idGlobal;
                    objLineas.espejoUuid = uuid;
                    objLineas.espejoCert = xmlTimbrado;
                    objLineas.espejoPdf = pdfGenerado;
                    objLineas.espejoGen = xmlGenerado;
                    log.audit({title:'objLineas',details:objLineas});

                    var scheme = 'https://';
                    var host = url.resolveDomain({
                        hostType: url.HostType.APPLICATION
                    });

                    var SLURL = url.resolveScript({
                        scriptId: 'customscript_efx_fe_actualiza_tran_sl',
                        deploymentId: 'customdeploy_efx_fe_actualiza_tran_sl',
                        returnExternalUrl: true,
                        body: JSON.stringify(objLineas)
                    });

                    log.audit({title:'SLURL',details:scheme+host+SLURL});

                    var headers = {
                        "Content-Type": "application/json"
                    };

                    var response = https.request({
                        method: https.Method.POST,
                        url: SLURL,
                        headers: headers,
                        body: JSON.stringify(objLineas)
                    })

                    // var response = https.get({
                    //     url: SLURL,
                    //
                    // });

                    log.audit({title:'response-code',details:response.code});
                    log.audit({title:'response-body',details:response.body});


                }catch(error_actualiza){
                    log.audit({title:'error_actualiza',details:error_actualiza})
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

        return {getInputData, map, reduce, summarize}

    });
