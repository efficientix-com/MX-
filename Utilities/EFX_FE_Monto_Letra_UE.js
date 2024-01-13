/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', './EFX_FE_Importe_en_Letra_ST'],
/**
 * @param{record} record
 */
function(record,mod_monto_letra) {


    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(context) {

        if (context.type == context.UserEventType.CREATE) {
            try {
                var record_noww = context.newRecord;
                var recType = record_noww.type;
                var record_now = record.load({
                    type: recType,
                    id: record_noww.id
                });
                var tienecuenta = record_now.getValue({fieldId: 'account'});
                 var concuenta = false;
                 if(tienecuenta && recType == record.Type.CASH_SALE){
                    concuenta=true;
                 }
                 if(recType != record.Type.CASH_SALE){
                    concuenta=true;
                 }


                 if(concuenta){
                var currency = record_now.getValue({fieldId: 'currency'}) || '';
                var total = record_now.getValue({fieldId: 'total'}) || '';
                var diferenciaTimbrado = record_now.getValue({fieldId: 'custbody_efx_fe_diftimbrado'}) || '';

                if(recType=='customsale_efx_fe_factura_global'){
                    var subt=record_now.getValue({fieldId: 'custbody_efx_fe_gbl_subtotal'}) || '0';
                    var taxt=record_now.getValue({fieldId: 'custbody_efx_fe_gbl_totaltax'}) || '0';
                    total = parseFloat(subt)+parseFloat(taxt);
                    total = parseFloat(total.toFixed(2));
                }

                log.audit({title: 'currency', details: currency});
                log.audit({title: 'total', details: total});

                var moneda_record = record.load({
                    type: record.Type.CURRENCY,
                    id: currency,
                    isDynamic: true,
                });

                var moneda = moneda_record.getValue('symbol');

                if(diferenciaTimbrado && recType != record.Type.CREDIT_MEMO) {
                    montoLetraField = mod_monto_letra.importeLetra(parseFloat((total+diferenciaTimbrado).toFixed(2)), 'spanish', moneda);
                }else if(recType=='customsale_efx_fe_factura_global'){
                    montoLetraField = mod_monto_letra.importeLetra(total, 'spanish', moneda);
                }else{
                    montoLetraField = mod_monto_letra.importeLetra(total, 'spanish', moneda);
                }

                log.audit({title: 'montoLetraField', details: montoLetraField});

                record_now.setValue({
                    fieldId: 'custbody_efx_fe_total_text',
                    value: montoLetraField,
                    ignoreFieldChange: true
                });
                record_now.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
            }
            }catch(error_new){
                log.audit({title: 'error_new', details: error_new});
            }
        }
        if (context.type == context.UserEventType.EDIT) {
            var record_noww = context.newRecord;
            var recType = record_noww.type;
            var record_now = record.load({
                type: recType,
                id: record_noww.id
            });
            var tienecuenta = record_now.getValue({fieldId: 'account'});
                 var concuenta = false;
                 if(tienecuenta && recType == record.Type.CASH_SALE){
                    concuenta=true;
                 }
                 if(recType != record.Type.CASH_SALE){
                    concuenta=true;
                 }
                 if(concuenta){
            try {
                var currency = record_now.getValue({fieldId: 'currency'}) || '';
                var total = record_now.getValue({fieldId: 'total'}) || '';
                var diferenciaTimbrado = record_now.getValue({fieldId: 'custbody_efx_fe_diftimbrado'}) || '';

                if(recType=='customsale_efx_fe_factura_global'){
                    var subt=record_now.getValue({fieldId: 'custbody_efx_fe_gbl_subtotal'}) || '0';
                    var taxt=record_now.getValue({fieldId: 'custbody_efx_fe_gbl_totaltax'}) || '0';
                    total = parseFloat(subt)+parseFloat(taxt);
                    total = parseFloat(total.toFixed(2));
                }

                log.audit({title: 'currency_old', details: currency});
                log.audit({title: 'total_old', details: total});

                var moneda_record = record.load({
                    type: record.Type.CURRENCY,
                    id: currency,
                    isDynamic: true,
                });

                var moneda = moneda_record.getValue('symbol');

                if(diferenciaTimbrado && recType != record.Type.CREDIT_MEMO) {
                    montoLetraField = mod_monto_letra.importeLetra(parseFloat((total).toFixed(2)), 'spanish', moneda);
                }else if(recType=='customsale_efx_fe_factura_global'){
                    montoLetraField = mod_monto_letra.importeLetra(total, 'spanish', moneda);
                }else{
                    montoLetraField = mod_monto_letra.importeLetra(total, 'spanish', moneda);
                }
                log.audit({title: 'montoLetraField', details: montoLetraField});

                record_now.setValue({
                    fieldId: 'custbody_efx_fe_total_text',
                    value: montoLetraField,
                    ignoreFieldChange: true
                });

                record_now.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
            }catch(error_old){
                log.audit({title: 'error_old', details: error_old});
            }
        }
        }

    }


    return {

        afterSubmit: afterSubmit,

    };
    
});
