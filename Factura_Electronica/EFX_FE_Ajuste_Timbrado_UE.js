/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search','N/runtime'],
    /**
     * @param{record} record
     */
    function(record,search,runtime) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */


        function afterSubmit(context){
            var ejecuta = true;

            try {
                if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                    var record_noww = context.newRecord;
                    var recType = record_noww.type;
                    var record_now = record.load({
                        type: recType,
                        id: record_noww.id
                    });

                    if(recType  == record.Type.INVOICE){
                        var amoutdue = record_now.getValue({fieldId:'amountremainingtotalbox'});
                        var total = record_now.getValue({fieldId:'total'});

                        if(amoutdue!=total){
                            ejecuta=false;
                        }

                    }

                    if(ejecuta){
                        var scriptObj = runtime.getCurrentScript();
                        var articuloAjuste = scriptObj.getParameter({ name: 'custscript_efx_fe_adjust_cert' });
                        log.audit({title:'articuloAjuste',details:articuloAjuste});

                        if(articuloAjuste) {
                            var diferenciaTimbrado = record_now.getValue({fieldId: 'custbody_efx_fe_diftimbrado'});

                            if (diferenciaTimbrado != 0) {
                                var linecount = record_now.getLineCount({sublistId: 'item'});
                                var existe = 0;
                                for (var i = 0; i < linecount; i++) {
                                    var articulo = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        line: i
                                    });
                                    var articulo_monto = record_now.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'amount',
                                        line: i
                                    });
                                    if (articulo == articuloAjuste) {
                                        if (articulo_monto != diferenciaTimbrado) {
                                            record_now.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'price',
                                                line: i,
                                                value: -1
                                            });
                                            record_now.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'rate',
                                                line: i,
                                                value: diferenciaTimbrado
                                            });
                                            record_now.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'amount',
                                                line: i,
                                                value: diferenciaTimbrado
                                            });
                                            record_now.save({enableSourcing: true, ignoreMandatoryFields: true});
                                        }
                                        existe++;
                                    }
                                }

                                if (existe == 0) {

                                    record_now.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'item',
                                        line: linecount,
                                        value: articuloAjuste
                                    });
                                    record_now.setSublistValue({sublistId: 'item', fieldId: 'price', line: i, value: -1});
                                    record_now.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'rate',
                                        line: linecount,
                                        value: diferenciaTimbrado
                                    });
                                    record_now.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'amount',
                                        line: linecount,
                                        value: diferenciaTimbrado
                                    });
                                    record_now.setValue({fieldId: 'custbody_efx_fe_item_adjust', value: articuloAjuste});
                                    record_now.save({enableSourcing: true, ignoreMandatoryFields: true});
                                }

                            }
                        }
                    }
                }

                }catch (error) {

                }

        }


        return {

            //beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit

        };

    });
