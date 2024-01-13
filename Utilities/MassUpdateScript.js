/**
 *@NApiVersion 2.0
 *@NScriptType MassUpdateScript
 */
define(['N/record','N/runtime'],
    function (record,runtime) {
        function each(params) {
            // Need to LOAD each record and SAVE it for changes to take effect
            // LOAD the PO
            var record_now = record.load({
                type: params.type,
                id: params.id,
                isDynamic:true
            });

            var scriptObj = runtime.getCurrentScript();
            var articuloAjuste = scriptObj.getParameter({ name: 'custscript_efx_fe_adjust_cert' });
            log.audit({title:'params.id',details:params.id});
            log.audit({title:'articuloAjuste',details:articuloAjuste});

            if(articuloAjuste){
                var linecount = record_now.getLineCount({sublistId: 'item'});
                            for (var i = 0; i < linecount; i++) {
                               /* var articulo = record_now.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'item',
                                    line: i
                                });*/
                               
                                /*if (articulo == articuloAjuste) {
                                    record_now.removeLine({
                                        sublistId: 'item',
                                        line: i,
                                        ignoreRecalc: false
                                    });
                                }*/
                                var lineNum = record_now.selectLine({
                                    sublistId: 'item',
                                    line:i
                                });
                                var monto = record_now.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                });
                                record_now.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    value:monto+0.01
                                });
                                record_now.commitLine({
                                    sublistId: 'item'
                                });
                            }

                            for (var i = 0; i < linecount; i++) {
                                var lineNum = record_now.selectLine({
                                    sublistId: 'item',
                                    line:i
                                });
                                var monto = record_now.getCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                });
                                record_now.setCurrentSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'amount',
                                    value:monto-0.01
                                });
                                record_now.commitLine({
                                    sublistId: 'item'
                                });
                            }
            
            // SAVE the PO
            var idsave = record_now.save({enableSourcing: true,
                ignoreMandatoryFields: true});
                log.audit({title:'idsave',details:idsave});

       
            }

            
        }
        return {
            each: each
        };
    });