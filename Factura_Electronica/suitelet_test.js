/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record'],
/**
 * @param{record} record
 */
function(record) {


   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        var objRecord = record.create({
            type: 'customrecord_psg_ei_audit_trail',
        });

        objRecord.setValue({
            fieldId: 'custrecord_psg_ei_audit_transaction',
            value: 7805,
            ignoreFieldChange: true
        });

        objRecord.setValue({
            fieldId: 'custrecord_psg_ei_audit_entity',
            value: 1763,
            ignoreFieldChange: true
        });

        // objRecord.setValue({
        //     fieldId: 'custrecord_psg_ei_audit_owner',
        //     value: -4,
        //     ignoreFieldChange: true
        // });


        var recordId = objRecord.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });

        log.audit({title:'save',details:recordId});

    }

    return {

        onRequest: onRequest
    };
    
});
