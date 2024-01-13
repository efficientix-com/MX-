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
                var buscaSinUuid = search.create({
                    type: search.Type.TRANSACTION,
                    filters: [
                        ["type", search.Operator.ANYOF, tipoglobaltransaccion]
                        , 'AND',
                        ["mainline", search.Operator.IS, "F"]
                        , "AND",
                        [["custcol_efx_fe_gbl_related_tran.custbody_mx_cfdi_uuid", search.Operator.ISEMPTY, ""]
                        ,"OR",
                        ["custcol_efx_fe_gbl_related_tran.custbody_efx_fe_gbl_related",search.Operator.ANYOF,"@NONE@"]]
                        , "AND",
                        ["custbody_mx_cfdi_uuid", search.Operator.ISNOTEMPTY, ""]
                        , "AND",
                        ["custcol_efx_fe_gbl_related_tran.mainline", search.Operator.IS, "T"]
                    ],
                    columns: [
                        search.createColumn({name: "internalid"}),
                        search.createColumn({name: "custcol_efx_fe_gbl_related_tran"}),
                        search.createColumn({name: "internalid",join:"CUSTCOL_EFX_FE_GBL_RELATED_TRAN"}),
                        search.createColumn({name: "type",join:"CUSTCOL_EFX_FE_GBL_RELATED_TRAN"}),
                        search.createColumn({name: "custbody_psg_ei_certified_edoc"}),
                        search.createColumn({name: "custbody_edoc_generated_pdf"}),
                        search.createColumn({name: "custbody_mx_cfdi_uuid"}),
                        search.createColumn({name: "custbody_mx_txn_sat_payment_term"}),
                        search.createColumn({name: "custbody_mx_txn_sat_payment_method"}),
                        search.createColumn({name: "custbody_mx_cfdi_usage"}),
                        


                        
                    ]
                });

                return buscaSinUuid;
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
            log.audit({title:'datos',details:datos.values});

            try{
                var objactualiza = {
                    custbody_mx_cfdi_uuid:datos.values.custbody_mx_cfdi_uuid,
                    custbody_efx_fe_gbl_related:datos.values['internalid'].value
                }

                if(datos.values['custbody_psg_ei_certified_edoc']){
                    objactualiza.custbody_psg_ei_certified_edoc = (datos.values['custbody_psg_ei_certified_edoc'].length) ? datos.values['custbody_psg_ei_certified_edoc'][0].value : datos.values['custbody_psg_ei_certified_edoc'].value;
                
                }

                if(datos.values['custbody_edoc_generated_pdf']){
                    objactualiza.custbody_edoc_generated_pdf = (datos.values['custbody_edoc_generated_pdf'].length) ? datos.values['custbody_edoc_generated_pdf'][0].value : datos.values['custbody_edoc_generated_pdf'].value;
                }

                if(datos.values['custbody_mx_txn_sat_payment_term']){
                    objactualiza.custbody_mx_txn_sat_payment_term = (datos.values['custbody_mx_txn_sat_payment_term'].length) ? datos.values['custbody_mx_txn_sat_payment_term'][0].value : datos.values['custbody_mx_txn_sat_payment_term'].value;
                }
                if(datos.values['custbody_mx_txn_sat_payment_method']){
                    objactualiza.custbody_mx_txn_sat_payment_method = (datos.values['custbody_mx_txn_sat_payment_method'].length) ? datos.values['custbody_mx_txn_sat_payment_method'][0].value : datos.values['custbody_mx_txn_sat_payment_method'].value;
                }
                if(datos.values['custbody_mx_cfdi_usage']){
                    objactualiza.custbody_mx_cfdi_usage = (datos.values['custbody_mx_cfdi_usage'].length) ? datos.values['custbody_mx_cfdi_usage'][0].value : datos.values['custbody_mx_cfdi_usage'].value;
                }

                var tipoTransaccion = '';
                if(datos.values['type.CUSTCOL_EFX_FE_GBL_RELATED_TRAN'].value=='CustInvc'){
                    tipoTransaccion = record.Type.INVOICE;
                }else if(datos.values['type.CUSTCOL_EFX_FE_GBL_RELATED_TRAN'].value=='CashSale'){
                    tipoTransaccion = record.Type.CASH_SALE;
                }

                log.audit({title:'objactualiza',details:objactualiza});
                if(tipoTransaccion){
                    record.submitFields({
                        type: tipoTransaccion,
                        id: datos.values['internalid.CUSTCOL_EFX_FE_GBL_RELATED_TRAN'].value,
                        values: objactualiza
                    });
                }
                
            }catch(error_submit){
                log.error({title:'error_submit',details:error_submit});
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
