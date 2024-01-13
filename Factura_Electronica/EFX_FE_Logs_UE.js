/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param{record} record
 */
function(record) {

    function beforeLoad(context) {
        log.audit({title: 'beL', details: 'beL'});
        try {
            var record_now = context.newRecord;

            var field = record_now.getField("custrecord_psg_ei_audit_owner");

            field.isReadOnly = true;
            log.audit({title: 'beL', details: 'beL -try'});
        }catch(error_bl){
            log.audit({title: 'error_bl', details: error_bl});
        }

        log.audit({title: 'beL', details: 'beL -fin'});

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */

    function beforeSubmit(context) {
        log.audit({title: 'bef', details: 'bef'});
        try {

            var record_now = context.newRecord;
            //if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT || context.type == context.UserEventType.XEDIT || context.type == context.UserEventType.TRANSFORM) {


            record_now.setValue({
                fieldId: 'custrecord_psg_ei_audit_owner',
                value: -5,

            });
        }catch(errorBs){
        log.audit({title: 'errorBs', details: errorBs});
    }

        //}
    }



    return {

        beforeLoad:beforeLoad,
        beforeSubmit: beforeSubmit,


    };
    
});
