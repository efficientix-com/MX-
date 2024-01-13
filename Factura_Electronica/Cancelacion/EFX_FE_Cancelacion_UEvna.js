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
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(context) {
        var newRec = context.newRecord;
        var recType = newRec.type;
        if (context.type == context.UserEventType.VIEW) {
            var form = context.form;
            form.clientScriptModulePath = "./EFX_FE_Cancelacion_CSvna.js";
            var record_cancel = context.newRecord;

            var status = record_cancel.getValue({fieldId: 'approvalstatus'}) || '';
            var APPROVALSTATUS = (status == 2 || status == '');

            var uuid = record_cancel.getValue({fieldId: 'custbody_mx_cfdi_uuid'}) || '';
            log.audit({title: 'uuid', details: JSON.stringify(uuid)});

            var custbody_efx_fe_cancelled = record_cancel.getValue(
                {fieldId: 'custbody_efx_fe_cfdi_cancelled'}
            );

            if(recType == 'customrecord_efx_pagos_compensacion'){
                uuid = record_cancel.getValue({fieldId: 'custrecord_efx_compensacion_uuid'}) || '';
                custbody_efx_fe_cancelled = record_cancel.getValue(
                    {fieldId: 'custrecord_efx_compensacion_cancel'}
                );
            }


            if (recType == record.Type.INVOICE || recType == record.Type.CREDIT_MEMO || recType == record.Type.CUSTOMER_PAYMENT || recType == record.Type.CASH_SALE || recType == 'customsale_efx_fe_factura_global' || recType == 'customrecord_efx_pagos_compensacion') {

                if ((!custbody_efx_fe_cancelled && uuid)) {

                    var tranData = {
                        tranid: record_cancel.id,
                        trantype: record_cancel.type
                    };

                    log.audit({title: 'tranData', details: JSON.stringify(tranData)});
                    form.addButton({
                        id: "custpage_btn_cancel_cfdi",
                        label: "Cancelar CFDI",
                        functionName: "cancel_CFDI(" + JSON.stringify(tranData) + ")"
                    });

                    // if(recType != 'customsale_efx_fe_factura_global' && recType != 'customrecord_efx_pagos_compensacion') {
                    //     form.addButton({
                    //         id: "custpage_btn_cancel_cfdi",
                    //         label: "Cancelar/Sustituir CFDI",
                    //         functionName: "cancel_subs_CFDI(" + JSON.stringify(tranData) + ")"
                    //     });
                    // }

                }

            }


        }

    }



    return {
        beforeLoad: beforeLoad,

    };
    
});
