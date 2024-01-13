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
             id: params.id
         });

         var scriptObj = runtime.getCurrentScript();
         var articuloAjuste = scriptObj.getParameter({ name: 'custscript_efx_fe_adjust_cert' });
         log.audit({title:'params.id',details:params.id});
         log.audit({title:'articuloAjuste',details:articuloAjuste});

         if(articuloAjuste){
             var linecount = record_now.getLineCount({sublistId: 'item'});

             
                         for (var i = 0; i < linecount; i++) {
                             var articulo = record_now.getSublistValue({
                                 sublistId: 'item',
                                 fieldId: 'item',
                                 line: i
                             });
                            
                             if (articulo == articuloAjuste) {
                                 record_now.removeLine({
                                     sublistId: 'item',
                                     line: i,
                                     ignoreRecalc: false
                                 });
                                     
                                 
                                 
                                 
                             }
                         }

         
         // SAVE the PO
         record_now.save({enableSourcing: true,
             ignoreMandatoryFields: true});
         }
         
     }
     return {
         each: each
     };
 });