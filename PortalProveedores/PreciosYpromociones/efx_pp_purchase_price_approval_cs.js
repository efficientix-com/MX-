/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
 define(['N/currentRecord', 'N/ui/message', 'N/record', 'N/url', 'N/search', 'N/log', 'N/email'],
 /**
  * @param {currentRecord} currentRecord
  */
 function(currentRecord, message, record, url, search,log,email) {
     /**
      * Function to be executed after page is initialized.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
      *
      * @since 2015.2
      */
     function pageInit(scriptContext) {}
     /**
      * Function to be executed when field is changed.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      * @param {string} scriptContext.fieldId - Field name
      * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
      * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
      *
      * @since 2015.2
      */
     function fieldChanged(scriptContext) {}
     /**
      * Function to be executed when field is slaved.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      * @param {string} scriptContext.fieldId - Field name
      *
      * @since 2015.2
      */
     function postSourcing(scriptContext) {}
     /**
      * Function to be executed after sublist is inserted, removed, or edited.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @since 2015.2
      */
     function sublistChanged(scriptContext) {}
     /**
      * Function to be executed after line is selected.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @since 2015.2
      */
     function lineInit(scriptContext) {}
     /**
      * Validation function to be executed when field is changed.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      * @param {string} scriptContext.fieldId - Field name
      * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
      * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
      *
      * @returns {boolean} Return true if field is valid
      *
      * @since 2015.2
      */
     function validateField(scriptContext) {}
     /**
      * Validation function to be executed when sublist line is committed.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @returns {boolean} Return true if sublist line is valid
      *
      * @since 2015.2
      */
     function validateLine(scriptContext) {}
     /**
      * Validation function to be executed when sublist line is inserted.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @returns {boolean} Return true if sublist line is valid
      *
      * @since 2015.2
      */
     function validateInsert(scriptContext) {}
     /**
      * Validation function to be executed when record is deleted.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      *
      * @returns {boolean} Return true if sublist line is valid
      *
      * @since 2015.2
      */
     function validateDelete(scriptContext) {}
     /**
      * Validation function to be executed when record is saved.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @returns {boolean} Return true if record is valid
      *
      * @since 2015.2
      */
     function saveRecord(scriptContext) {}

     function approveFunction(ppObject) {
         var flag = 1;
         var currDate = new Date();
         currDate.setHours(0,0,0,0);
         // currDate = currDate.setDate(currDate.getDate() - 1);
         try {
             if (!ppObject.maxAmt) {
                 flag = 0;
                 var myMsg = message.create({
                     title: 'ERROR',
                     message: 'Monto máximo esta vacio, por favor ingrese un valor e intente aprobar nuevamente.',
                     type: message.Type.ERROR
                 });
                 myMsg.show({
                     duration: 10000
                 });
             }
             if (!ppObject.startDate) {
                 flag = 0;
                 var myMsg = message.create({
                     title: 'ERROR',
                     message: 'Monto máximo esta vacio, por favor ingrese un valor e intente aprobar nuevamente.',
                     type: message.Type.ERROR
                 });
                 myMsg.show({
                     duration: 10000
                 });
             }
             if (ppObject.startDate && new Date(ppObject.startDate) < currDate) {
                 flag = 0;
                 var myMsg = message.create({
                     title: 'ERROR',
                     message: 'Fecha de inicio no puede ser una fecha pasada, actualice el valor e intente aprobar nuevamente',
                     type: message.Type.ERROR
                 });
                 myMsg.show({
                     duration: 10000
                 });
             }
             if (ppObject.endDate && new Date(ppObject.endDate) < currDate) {
                 flag = 0;
                 var myMsg = message.create({
                     title: 'ERROR',
                     message: 'Fecha fin no puede ser una fecha pasada, actualice el valor e intente aprobar nuevamente',
                     type: message.Type.ERROR
                 });
                 myMsg.show({
                     duration: 10000
                 });
             }
             if (ppObject.endDate && new Date(ppObject.endDate) < new Date(ppObject.startDate)) {
                 flag = 0;
                 var myMsg = message.create({
                     title: 'ERROR',
                     message: 'Fecha fin no puede ser menor a fecha inicio, por favor actualice e intente nuevamente',
                     type: message.Type.ERROR
                 });
                 myMsg.show({
                     duration: 10000
                 });
             }
             if (ppObject.maxAmt && ppObject.startDate && flag === 1) {
                 var date = new Date();
                 var otherId = record.submitFields({
                     type: 'customrecord_efx_pp_purchase_prices',
                     id: ppObject.ppId,
                     values: {
                         custrecord_efx_pp_status_request: '2',
                         custrecord_efx_pp_date_approved: date
                     }
                 });


                 //Send email to vendor

                 //Ya fue aprobado, ahora enviar correo al vendor con la razon

                 //Hard coded values for testing purposes
                 var vendEmail = 'andrea.tapia@tekiio.mx'; //'nicolas.castillo@tekiio.mx';
                 var author = '72685';
                 var subject = 'Tu petición de actualización de precios ha sido aprobada.';
                 //Forming body content
                 var bodyContent = '<html> <head>' +
                     '<style>\n' +
                     'th {\n' +
                     '  font-weight: bold;\n' +
                     'background-color: #e0e0e0' +
                     '}\n' +
                     '\n' +
                     'th, td {\n' +
                     '  padding: 10px;\n' +
                     '}\n' +
                     '</style>';


                 // 'Vendor: ' + headFields.vendor +
                 // '<br>' +
                 bodyContent +=
                     'Fecha de inicio de vigencia: ' + ppObject.startDate +
                     '<br>' +
                     'Fecha de fin de vigencia: ' + ppObject.endDate +
                     // '<br>' +
                     // 'Reason for rejection: ' + ppObject.rejReason +
                     '</head>' +
                     '<body>' +
                     '<br><br>' +
                     '<table>' +
                     '<tr>' +
                     '<th>Descripción</th>' +
                       '<th>Precio anterior</th>' +
                     '<th>Precio</th>' +
                       '<th>Unidad</th>'+
                     
                     '<th>Moneda</th>' +
                     '<th>Notas</th>' +
                     '</tr>';
                 var itemids = [];
                 //Retrieve all items for this purchase request
                 var itemsTable = build_email_table_content(ppObject.ppId, itemids);
                 var currentForm = currentRecord.get();
               		console.log(currentForm);
               var fieldLookUprequest = search.lookupFields({
                     type: 'customrecord_efx_pp_purchase_prices',
                     id: currentForm.id,
                     columns: ['custrecord_efx_pp_vendor']
                 });
               var fieldLookUp = search.lookupFields({
                     type: search.Type.VENDOR,
                     id: fieldLookUprequest['custrecord_efx_pp_vendor'][0].value,
                     columns: ['subsidiary']
                 });
               
                   //Get UOM by subsidiary
                   var uoms = getUOMBySubsidiary(itemids, fieldLookUp['subsidiary'][0].value);
                 //Iterate through array of objects, printing a new row for each object

                 for(i=0;i<itemsTable.length;i++){

                     bodyContent += '<tr> ' +
                         '<td>' + itemsTable[i].itemDescr + '</td>' +
                           '<td>' + itemsTable[i].prevPrice + '</td>' +
                         '<td>' + itemsTable[i].itemPrice + '</td>' +
                           '<td>' +  uoms[itemsTable[i].itemId] + '</td>' +
                         '<td>' + itemsTable[i].currency + '</td>' +
                         '<td>' + itemsTable[i].notes + '</td>' +
                         '</tr>'

                 }


                 bodyContent += '</table>' +
                     '</body>' +
                     '' +
                     '' +
                     '' +
                     ' </html>';

                 email.send({
                     author: author,
                     recipients: vendEmail,
                     subject: subject,
                     body: bodyContent
                 });


                 document.location = url.resolveRecord({
                     recordType: 'customrecord_efx_pp_purchase_prices',
                     recordId: ppObject.ppId
                 });
             }
         } catch (e) {
             log.error('ERROR', e);
         }
     }

     function rejectFunction(ppObject) {
         log.debug({title: 'RUNNING rejectFunction()', details: ''});
         try {
             if (ppObject.rejReason) {

                 //Set status to rejected
                 var otherId = record.submitFields({
                     type: 'customrecord_efx_pp_purchase_prices',
                     id: ppObject.ppId,
                     values: {
                         custrecord_efx_pp_status_request: '5'
                     }
                 });

                 //Send email to vendor

                 //Ya fue rechazado, ahora enviar correo al vendor con la razon

                 //Hard coded values for testing purposes
                 var vendEmail = 'andrea.tapia@tekiio.mx'; //'nicolas.castillo@tekiio.mx';
                 var author = '72685';
                 var subject = 'Tu petición de actualización de precios ha sido rechazada';
                 //Forming body content
                 var bodyContent = '<html> <head>' +
                     '<style>\n' +
                     'th {\n' +
                     '  font-weight: bold;\n' +
                     'background-color: #e0e0e0' +
                     '}\n' +
                     '\n' +
                     'th, td {\n' +
                     '  padding: 10px;\n' +
                     '}\n' +
                     '</style>';


                 // 'Vendor: ' + headFields.vendor +
                 // '<br>' +
                 bodyContent +=
                     'Start date: ' + ppObject.startDate +
                     '<br>' +
                     'End date: ' + ppObject.endDate +
                     '<br>' +
                     'Reason for rejection: ' + ppObject.rejReason +
                     '</head>' +
                     '<body>' +
                     '<br><br>' +
                     '<table>' +
                     '<tr>' +
                     '<th>Descripción</th>' +
                       '<th>Precio anterior</th>' +
                     '<th>Precio nuevo</th>' +
                       '<th>Unidad</th>'+
                     '<th>Moneda</th>' +
                     '<th>Notas</th>' +
                     '</tr>';

               
               
               var itemids = [];
                 //Retrieve all items for this purchase request
                 var itemsTable = build_email_table_content(ppObject.ppId, itemids);

               
               	
                  var currentForm = currentRecord.get();
               		console.log(currentForm);
               var fieldLookUprequest = search.lookupFields({
                     type: 'customrecord_efx_pp_purchase_prices',
                     id: currentForm.id,
                     columns: ['custrecord_efx_pp_vendor']
                 });
               var fieldLookUp = search.lookupFields({
                     type: search.Type.VENDOR,
                     id: fieldLookUprequest['custrecord_efx_pp_vendor'][0].value,
                     columns: ['subsidiary']
                 });
               
                   //Get UOM by subsidiary
                   var uoms = getUOMBySubsidiary(itemids, fieldLookUp['subsidiary'][0].value);
                 //Iterate through array of objects, printing a new row for each object

                 for(i=0;i<itemsTable.length;i++){

                     bodyContent += '<tr> ' +
                         '<td>' + itemsTable[i].itemDescr + '</td>' +
                           '<td>' + itemsTable[i].prevPrice + '</td>' +
                         '<td>' + itemsTable[i].itemPrice + '</td>' +
                         '<td>' +  uoms[itemsTable[i].itemId] + '</td>' +
                         '<td>' + itemsTable[i].currency + '</td>' +
                         '<td>' + itemsTable[i].notes + '</td>' +
                         '</tr>'

                 }


                 bodyContent += '</table>' +
                     '</body>' +
                     '' +
                     '' +
                     '' +
                     ' </html>';

                 email.send({
                     author: author,
                     recipients: vendEmail,
                     subject: subject,
                     body: bodyContent
                 });

                 //Reload page
                 document.location = url.resolveRecord({
                     recordType: 'customrecord_efx_pp_purchase_prices',
                     recordId: ppObject.ppId
                 });



             } else {
                 var myMsg = message.create({
                     title: 'ERROR',
                     message: 'Return Reason is empty. Please update Return Reason and try to Reject again.',
                     type: message.Type.ERROR
                 });
                 myMsg.show({
                     duration: 10000
                 });
             }
         } catch (e) {
             log.error('ERROR', e);
           console.log(e);
         }
     }

     /**
      * Function for retreiving array of objects containing required values for every item related to this
      * Purchase Price record.
      * @param {integer} pp_id Contains id of newly created PP - Purchase prices record
      * @returns {array} Array of objects with values for all items.
      */

     function build_email_table_content(pp_id, itemids){
         log.audit({title: 'Building email table content...', details: ''});
         //Object to be filled

         var itemVals = [];
         

         //Search for all items related to this pp_id
         var items_result_obj = search.create({
             type: "customrecord_efx_pp_purchase_items",
             filters:
                 [
                     ["custrecord_efx_pp_request","anyof",pp_id]
                 ],
             columns:
                 [
                       search.createColumn({name: "custrecord_efx_pp_item", label: "Artículo"}),
                     search.createColumn({name: "custrecord_efc_pp_it_desc", label: "Descripción del artículo"}),
                     search.createColumn({name: "custrecord_efx_pp_price", label: "Price"}),
                     search.createColumn({name: "custrecord_efx_pp_prev_price", label: "Previous price"}),
                     search.createColumn({name: "custrecord_efx_pp_currency", label: "Currency"}),
                     search.createColumn({name: "custrecord_efx_pp_notes", label: "Notes"})
                 ]
         });
         var searchResultCount = items_result_obj.runPaged().count;
         log.debug("items_result_obj result count",searchResultCount);
         items_result_obj.run().each(function(result){
             log.debug({title: 'RAN iteration', details: ''});
             // .run().each has a limit of 4,000 results

             var itemsObj = {
                 itemDescr : '',
                 itemPrice : '',
                 prevPrice : '',
                 currency : '',
                 notes : '',
                   itemId: ''
             }


             // Add values to object and then add object to array...
             itemsObj.itemDescr = result.getValue('custrecord_efc_pp_it_desc');
               itemsObj.itemId = result.getValue('custrecord_efx_pp_item');	
             itemsObj.itemPrice = result.getValue('custrecord_efx_pp_price');
             itemsObj.prevPrice = result.getValue('custrecord_efx_pp_prev_price');
             itemsObj.currency = result.getText('custrecord_efx_pp_currency');
             itemsObj.notes = result.getValue('custrecord_efx_pp_notes');

             itemVals.push(itemsObj);
             itemids.push(itemsObj.itemId);
             return true;
         });

         return itemVals;

         log.debug({title: 'Array de objetos: ', details: itemVals});
     }

       function getUOMBySubsidiary(items, subs){
       try{
         
         
         	var itemsarray = [];
         	for(var i in items){
              if(i > 0){
                itemsarray.push("OR");
              }
              itemsarray.push(["custrecord_efx_uom_sub_articulos","is",items[i]]);
            }
         	console.log("itemsarray",itemsarray);
             var customrecord_efx_uom_subsidiariaSearchObj = search.create({
             type: "customrecord_efx_uom_subsidiaria",
             filters:
                 [
                     itemsarray,
                     "AND",
                     ["custrecord_efx_uom_sub_subsidiaria","is",subs]
                 ],
             columns:
                 [
                    search.createColumn({name: "custrecord_efx_uom_sub_purchase_unit", label: "Unidad de compra"}),
                     search.createColumn({name: "custrecord_efx_uom_sub_articulos", label: "Unidad de compra"})
                 ]
         });
         log.debug({title: 'VALOR DE f antes de search: ' + f, details: ''});
         var searchResultCount = customrecord_efx_uom_subsidiariaSearchObj.runPaged().count;
         log.debug("customrecord_efx_uom_subsidiariaSearchObj result count",searchResultCount);
           var results = {};
         customrecord_efx_uom_subsidiariaSearchObj.run().each(function(result){
             // .run().each has a limit of 4,000 results
            var purUnit = result.getText('custrecord_efx_uom_sub_purchase_unit');
           var item = result.getValue('custrecord_efx_uom_sub_articulos');
           console.log(item, purUnit);
           results[item] = purUnit;
             return true;
         });
         
         console.log('results', results);
       
           log.debug("results",results);
           return results;
       }
       catch(e){
         console.error(e);
       }
     }
     return {
         pageInit: pageInit,
         // fieldChanged: fieldChanged,
         // postSourcing: postSourcing,
         // sublistChanged: sublistChanged,
         // lineInit: lineInit,
         // validateField: validateField,
         // validateLine: validateLine,
         // validateInsert: validateInsert,
         // validateDelete: validateDelete,
         // saveRecord: saveRecord,
         approveFunction: approveFunction,
         rejectFunction: rejectFunction
     };
 });