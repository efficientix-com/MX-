/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/file','N/runtime','N/format'],

function(record,file,runtime,format) {


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
        log.audit({title:'bef',details:'bef'});
        var record_now = context.newRecord;
        var recType = record_now.type;
        if(recType == record.Type.INVOICE || recType == record.Type.ITEM_FULFILLMENT) {
            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                // var subsidiaria = record_now.getValue({fieldId: 'subsidiary'});
                var countItem = record_now.getLineCount({
                    sublistId: 'item'
                });
                var cartones_array = new Array();

                var conteo_cartones = 0;
                for(var i=0;i<countItem;i++){
                    // var invdetailID = record_now.getSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'inventorydetail',
                    //     line: i
                    // });
                    log.audit({title:'linea',details:i});
                    var subrec_detail = record_now.getSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail',
                        line: i
                    });

                    var subrec_count_line = subrec_detail.getLineCount({
                        sublistId: 'inventoryassignment'
                    });
                    for(var x=0;x<subrec_count_line;x++){
                        var cartones = subrec_detail.getSublistValue({
                            sublistId: 'inventoryassignment',
                            fieldId: 'custrecord_wmsse_packing_container',
                            line: x
                        });
                        if(cartones) {

                            if (cartones_array.length == 0) {
                                if (cartones) {
                                    cartones_array.push(cartones);
                                    conteo_cartones++;
                                }

                            } else {
                                var conteo_array = 0;
                                for (var y = 0; y < cartones_array.length; y++) {
                                    if (cartones == cartones_array[y]) {
                                        conteo_array++;
                                    }
                                }
                                if (conteo_array == 0) {
                                    if (cartones) {
                                        conteo_cartones++;
                                        cartones_array.push(cartones);
                                    }
                                }

                            }
                            log.audit({title: 'cartones', details: cartones});
                        }
                    }


                }
                log.audit({title:'conteo_cartones',details:conteo_cartones});
                conteo_cartones = conteo_cartones.toFixed(0);
                record_now.setValue({fieldId:'custbody_efx_fe_total_box',value:conteo_cartones});
            }
        }

    }



    return {
        beforeSubmit: beforeSubmit,

    };
    
});
