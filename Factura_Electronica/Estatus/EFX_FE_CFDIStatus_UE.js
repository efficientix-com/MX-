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
                form.clientScriptModulePath = "./EFX_FE_CFDIStatus_CS.js";
                var obj_record = context.newRecord;

                var uuid = obj_record.getValue({fieldId: 'custbody_mx_cfdi_uuid'}) || '';
                var subsi = obj_record.getValue({fieldId: 'subsidiary'}) || '';
                var rfc_receptor = obj_record.getValue({fieldId: 'custbody_mx_customer_rfc'}) || '';
                var obj_data = obj_record.getValue({fieldId: 'custbody_fb_tp_xml_data'}||'');
                log.audit({title: 'obj_data', details: obj_data});
                /* // var datos_xml = JSON.parse(obj_data);
                var total_comprobante = obj_data.total_xml;
                log.audit({title: 'total: ', details: total_comprobante});
                var sello_digital_emisor = obj_data.sello;
                log.audit({title: 'datos a mandar', details: {total: total_comprobante, sello: sello_digital_emisor}}); */
                log.audit({title: 'uuid', details: JSON.stringify(uuid)});


                if ((recType == record.Type.CASH_SALE || recType == record.Type.INVOICE || recType == record.Type.CUSTOMER_PAYMENT || recType == record.Type.CREDIT_MEMO || recType == 'customsale_efx_fe_factura_global') && uuid) {
                    var tranData = {
                        tranid: obj_record.id,
                        trantype: obj_record.type,
                        uuid: uuid,
                        subsi: subsi,
                        rfc_receptor: rfc_receptor,
                        /* total_comprobante: total_comprobante,
                        sello_digital_emisor:sello_digital_emisor */
                    };
                    form.addButton({
                        id: "custpage_btn_consulta_estatus_sat",
                        label: "Consulta Estatus SAT",
                        functionName: "ConsultaEstatusSat(" + JSON.stringify(tranData) + ")"
                    });
                }

            }

        }


        return {
            beforeLoad: beforeLoad,

        };

    });
