/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */

define(['N/log', 'N/record','N/search'],
    function (log, record,search) {


        function beforeLoad(context) {
            log.audit({title:'beforeLoad',details:''});
            var record_now = context.newRecord;
            var recType = record_now.type;
            log.audit({title:'recType',details:recType});
            //var recType = record_now.type;
            if (context.type == context.UserEventType.CREATE) {
                var createdfrom = record_now.getValue({ fieldId: 'createdfrom' });
                var memo = record_now.getValue({ fieldId: 'memo' });
                log.audit({title:'createdfrom',details:createdfrom});
                log.audit({title:'memo',details:memo});
                if(createdfrom){
                    var buscacreatedfrom = search.create({
                        type: search.Type.TRANSACTION,
                        filters: [["mainline",search.Operator.IS,"T"]
                        ,"AND",
                        ['internalid', search.Operator.ANYOF, createdfrom]],
                        // , 'and',
                       
                         columns: [
                            search.createColumn({name: 'custbody_mx_txn_sat_payment_method'}),
                            search.createColumn({name: 'custbody_mx_txn_sat_payment_term'}),
                            search.createColumn({name: 'custbody_mx_cfdi_usage'}),
                         ]
                    });
                    var ejecutar = buscacreatedfrom.run();
                    var resultado = ejecutar.getRange(0, 100);
                    var usodeCfdi = '';
                    var formadepago = '';
                    var metododepago = '';
                    if (resultado.length > 0) {
                        for (var i = 0; i < resultado.length; i++) {
                            var formadepago = resultado[i].getValue({name: 'custbody_mx_txn_sat_payment_method'}) || '';
                            var metododepago = resultado[i].getValue({name: 'custbody_mx_txn_sat_payment_term'}) || '';
                            var usodeCfdi = resultado[i].getValue({name: 'custbody_mx_cfdi_usage'}) || '';
                        }
                        log.audit({title:'usodeCfdi',details:usodeCfdi});
                        log.audit({title:'formadepago',details:formadepago});
                        log.audit({title:'metododepago',details:metododepago});
                        if(usodeCfdi){
                            record_now.setValue({fieldId:'custbody_mx_cfdi_usage',value:usodeCfdi});
                        }
                        if(metododepago){
                            record_now.setValue({fieldId:'custbody_mx_txn_sat_payment_term',value:metododepago});
                        }
                        if(formadepago){
                            record_now.setValue({fieldId:'custbody_mx_txn_sat_payment_method',value:formadepago});
                        }
                        
                    }
                }
            }
        }

        function beforeSubmit(scriptContext) {
            log.audit({title:'usoCFDI',details:''});
            if (scriptContext.type == scriptContext.UserEventType.CREATE || scriptContext.type == scriptContext.UserEventType.EDIT) {
                var record_noww = scriptContext.newRecord;
                var recType = record_noww.type;
                log.audit({title:'record_noww.id',details:record_noww.id});
                var clienteid = record_noww.getValue({fieldId:'entity'});
                log.audit({title:'clienteid',details:clienteid});
                if(clienteid){
                
                    log.audit({title:'record_noww.id',details:record_noww.id});
                    
                    try{
                        var clienteObj = record.load({
                            type:record.Type.CUSTOMER,
                            id:clienteid
                        });
                    }catch(errorentidad){
                        var clienteObj = record.load({
                            type:record.Type.VENDOR,
                            id:clienteid
                        });
                    }
                    

                    var usoCFDI = clienteObj.getValue({fieldId:'custentity_efx_mx_cfdi_usage'});
                    var metodoPago = clienteObj.getValue({fieldId:'custentity_efx_mx_payment_term'});
                    var formaPago = clienteObj.getValue({fieldId:'custentity_efx_mx_payment_method'});

                    log.audit({title:'usoCFDI',details:usoCFDI});
                    log.audit({title:'metodoPago',details:metodoPago});
                    log.audit({title:'formaPago',details:formaPago});

                    var usoCFDI_record = record_noww.getValue({fieldId:'custbody_mx_cfdi_usage'});
                    var formaPago_record = record_noww.getValue({fieldId:'custbody_mx_txn_sat_payment_method'});
                    var metodoPago_record = record_noww.getValue({fieldId:'custbody_mx_txn_sat_payment_term'});

                    if(!usoCFDI_record){
                        record_noww.setValue({fieldId:'custbody_mx_cfdi_usage',value:usoCFDI});
                    }
                    if(!metodoPago_record){
                        record_noww.setValue({fieldId:'custbody_mx_txn_sat_payment_term',value:metodoPago});
                    }
                    if(!formaPago_record){
                        record_noww.setValue({fieldId:'custbody_mx_txn_sat_payment_method',value:formaPago});
                    }


                }


            }
        }

        
        function afterSubmit(context) {        
            log.audit({title:'usoCFDI',details:''});
            var newRec = context.newRecord;
            var recType = newRec.type;
            var recID = newRec.id;

            log.audit({title:'usoCFDI',details:''});
            if(context.type != context.UserEventType.DELETE){
                var record_now = record.load({
                    type: recType,
                    id: recID,
                    isDynamic:false
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
                log.audit({title:'record_now.id',details:record_now.id});
                var clienteid = record_now.getValue({fieldId:'entity'});
                log.audit({title:'clienteid',details:clienteid});
                if(clienteid){
                    log.audit({title:'record_now.id',details:record_now.id});
                

                    try{
                        var clienteObj = record.load({
                            type:record.Type.CUSTOMER,
                            id:clienteid
                        });
                    }catch(errorentidad){
                        var clienteObj = record.load({
                            type:record.Type.VENDOR,
                            id:clienteid
                        });
                    }

                    var usoCFDI = clienteObj.getValue({fieldId:'custentity_efx_mx_cfdi_usage'});
                    var metodoPago = clienteObj.getValue({fieldId:'custentity_efx_mx_payment_term'});
                    var formaPago = clienteObj.getValue({fieldId:'custentity_efx_mx_payment_method'});

                    log.audit({title:'usoCFDI',details:usoCFDI});
                    log.audit({title:'metodoPago',details:metodoPago});
                    log.audit({title:'formaPago',details:formaPago});

                    var usoCFDI_record = record_now.getValue({fieldId:'custbody_mx_cfdi_usage'});
                    var formaPago_record = record_now.getValue({fieldId:'custbody_mx_txn_sat_payment_method'});
                    var metodoPago_record = record_now.getValue({fieldId:'custbody_mx_txn_sat_payment_term'});

                    if(!usoCFDI_record){
                        record_now.setValue({fieldId:'custbody_mx_cfdi_usage',value:usoCFDI});
                    }
                    if(!metodoPago_record){
                        record_now.setValue({fieldId:'custbody_mx_txn_sat_payment_term',value:metodoPago});
                    }
                    if(!formaPago_record){
                        record_now.setValue({fieldId:'custbody_mx_txn_sat_payment_method',value:formaPago});
                    }


                }
            }

            }
        }

        return {
            beforeLoad: beforeLoad,
            beforeSubmit:beforeSubmit,
            afterSubmit:afterSubmit
        }

    });
