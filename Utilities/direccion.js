/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
 define(['N/record'],
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

         if (context.type == context.UserEventType.EDIT) {
             var record_noww = context.newRecord;
             var recType = record_noww.type;
             var record_now = record.load({
                 type: recType,
                 id: record_noww.id
             });
             try {
            
                 record_now.setValue({
                     fieldId: 'billaddresslist',
                     value: 16302,
                     
                 });

                 var dirid = record_now.getValue({
                    fieldId: 'billaddresslist',
                
                    
                });

                var diridval = record_now.getValue({
                    fieldId: 'billaddress',
                
                    
                });

                 log.audit({title: 'dirid', details: dirid});
                 log.audit({title: 'diridval', details: diridval});
 
                 var id = record_now.save({
                     enableSourcing: false,
                     ignoreMandatoryFields: true
                 });
                 log.audit({title: 'id', details: id});
             }catch(error_old){
                 log.audit({title: 'error_old', details: error_old});
             }
         }
 
     }
 
 
     return {
 
         afterSubmit: afterSubmit,
 
     };
     
 });
 