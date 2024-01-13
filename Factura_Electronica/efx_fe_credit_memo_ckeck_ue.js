/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/record', 'N/search'],
    /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */
    (log, record, search) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            try {
                log.audit({title:'type context', details: scriptContext.type});
                if (scriptContext.type === scriptContext.UserEventType.CREATE /*|| scriptContext.type === scriptContext.UserEventType.EDIT*/) {
                    let objRecord = scriptContext.newRecord;
                    // log.audit({title:'Id Record', details: objRecord.id})
                    log.audit({title:'Creado desde: ', details: {creditmemo: objRecord.getValue({fieldId: 'createdfrom'})}})
                    let createdFrom = objRecord.getValue({fieldId: 'createdfrom'});
                    if (createdFrom) {
                        let from = search.lookupFields({type: search.Type.TRANSACTION, id: createdFrom, columns: ['type','internalid', 'createdfrom', 'custbody_efx_fe_desglosaieps', 'createdfrom.custbody_efx_fe_desglosaieps']});
                        log.audit({title:'from', details: from})
                        let saleObj = false;
                        if (from.type[0].value === 'RtnAuth') {
                            saleObj = from['createdfrom.custbody_efx_fe_desglosaieps'];
                        } else {
                            saleObj = from['custbody_efx_fe_desglosaieps'];
                        }
                        if (saleObj === true || saleObj === 'T') {
                            log.audit({title:'Update credit memo', details: true});
                            record.submitFields({type: record.Type.CREDIT_MEMO, id: objRecord.id, values: {'custbody_efx_fe_desglosaieps': true}, options: {ignoreMandatoryFields: true, enablesourcing:true}});
                        }
                    }
                }
            } catch (e) {
              log.error({title:'Error on afterSubmit', details: e})
            }
        }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
