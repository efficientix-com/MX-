/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
 define(['N/search', 'N/ui/serverWidget', 'N/runtime', 'N/redirect', 'N/task', 'N/record', 'N/format', 'N/ui/serverWidget'],
 /**
  * @param {search} search
  * @param {serverWidget} serverWidget
  * @param {runtime} runtime
  * @param {redirect} redirect
  * @param {task} task
  */
 function(search, serverWidget, runtime, redirect, task, record, format, serverWidget) {
     /**
      * Definition of the Suitelet script trigger point.
      *
      * @param {Object} context
      * @param {ServerRequest} context.request - Encapsulation of the incoming request
      * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
      * @Since 2015.2
      */
     // var PAGE_SIZE = 50; //Minimum value should be 5.
     var PAGE_SIZE = 50; //Minimum value should be 5.
     function onRequest(context) {
         try {
             var request = context.request;
             var response = context.response;
             var form = serverWidget.createForm({
                 title: 'Revisión de carga (Upload Review)'
             });
             form.clientScriptModulePath = './efx_pp_item_vendor_approval_cs_V1.js';
             if (context.request.method === 'GET') { // GET Request
                 var user = runtime.getCurrentUser().id;
                 // user = 941; // Test User
                 log.debug('user', user);
                 var filters = [];
                 var filter;
                 var custpage_purchase_price_filter = request.parameters.custpage_purchase_price_filter;
                 var custpage_pagination_filter_vend_ap = parseInt(request.parameters.custpage_pagination_filter_vend_ap);
                 var custpage_hidden_store_value = request.parameters.custpage_hidden_store_value;
                 var filterGrp = form.addFieldGroup({
                     id: 'custpage_filter_group',
                     label: 'Información de folios (Folios Information)'
                 });
                 var actionGrp = form.addFieldGroup({
                     id: 'custpage_action_group',
                     label: 'Datos generales (General Information)'
                 });
                 var pp_rec_filter = form.addField({
                     id: 'custpage_purchase_price_filter',
                     type: serverWidget.FieldType.SELECT,
                     label: 'Folio de carga (Purchase Prices Record)',
                     container: 'custpage_filter_group'
                 });
                 pp_rec_filter.addSelectOption({
                     value: '',
                     text: ''
                 })
                 var pp_search = search.create({
                     type: "customrecord_efx_pp_purchase_prices",
                     filters: [
                         ["custrecord_efx_pp_status_request", "anyof", "3"], "AND",
                         ["custrecord_efx_pp_vendor", "anyof", user], "AND",
                         ["isinactive", "is", "F"]
                     ],
                     columns: [search.createColumn({
                             name: "custrecord_efx_pp_date_start",
                             label: "Fecha de inicio  (Start Date)"
                         }),
                         search.createColumn({
                             name: "custrecord_efx_pp_date_end",
                             label: "Fecha de fin (End Date)"
                         }),
                         search.createColumn({
                             name: "custrecord_efx_pp_date_request",
                             label: "Fecha de creación"
                         })
                     ]
                 });
                 log.debug('pp_search.runPaged().count;', pp_search.runPaged().count);
                 var dateObj = {};
                 pp_search.run().each(function(result) {
                     log.debug('result.id', result.id);
                    var requestdate = result.getValue('custrecord_efx_pp_date_request');
                     pp_rec_filter.addSelectOption({
                         value: result.id,
                         text: result.id + " ("+ requestdate +")"
                     });
                     dateObj[result.id] = {
                         startdate: result.getValue('custrecord_efx_pp_date_start'),
                         enddate: result.getValue('custrecord_efx_pp_date_end')
                     };
                     return true;
                 });
                 log.debug('custpage_purchase_price_filter', custpage_purchase_price_filter);
                 if (custpage_purchase_price_filter) {
                     log.debug('Inside IF');
                     pp_rec_filter.defaultValue = custpage_purchase_price_filter;
                 }
                 var pp_status_set = form.addField({
                     id: 'custpage_purchase_price_status',
                     type: serverWidget.FieldType.SELECT,
                     label: 'Acción (Action)',
                     container: 'custpage_action_group'
                 });
                 var pp_startDate_set = form.addField({
                     id: 'custpage_purchase_price_start_date',
                     type: serverWidget.FieldType.DATE,
                     label: 'Fecha de inicio (Start Date)',
                     container: 'custpage_action_group'
                 });
                 log.debug('dateObj[custpage_purchase_price_filter]', dateObj[custpage_purchase_price_filter]);
                 if(request.parameters.custpage_purchase_price_start_date) {
                     pp_startDate_set.defaultValue = new Date(request.parameters.custpage_purchase_price_start_date);
                 }
                 else if (dateObj[custpage_purchase_price_filter]) {
                     pp_startDate_set.defaultValue = dateObj[custpage_purchase_price_filter].startdate;
                 }
                 var pp_endDate_set = form.addField({
                     id: 'custpage_purchase_price_end_date',
                     type: serverWidget.FieldType.DATE,
                     label: 'Fecha de fin (End Date)',
                     container: 'custpage_action_group'
                 });
                 if(request.parameters.custpage_purchase_price_end_date) {
                     pp_endDate_set.defaultValue = new Date(request.parameters.custpage_purchase_price_end_date);
                 }
                 else if (dateObj[custpage_purchase_price_filter]) {
                     pp_endDate_set.defaultValue = dateObj[custpage_purchase_price_filter].enddate;
                 }
               
               	var currencyfield = form.addField({
                     id: 'custpage_currency',
                     type: serverWidget.FieldType.SELECT,
                     label: 'Moneda (Currency)',
                  container: 'custpage_action_group'
                 });
               
                 currencyfield.updateDisplayType({
                      displayType : serverWidget.FieldDisplayType.DISABLED
                  });
                 
                 // pp_status_set.addSelectOption({
                     // value: '',
                     // text: ''
                 // });
                 pp_status_set.addSelectOption({
                     value: 1,
                     text: 'Borrador (Draft)',
                     isSelected: true
                 });
                 pp_status_set.addSelectOption({
                     value: 2,
                     text: 'Enviar a aprobación (Send for Approval)'
                 });
                 pp_status_set.addSelectOption({
                     value: 3,
                     text: 'Desactivar (Deactivate)'
                 });
                 pp_status_set.isMandatory = true;
                 var item_tab = form.addTab({
                     id: 'custpage_item_tab',
                     label: 'Item Tab'
                 });
                 var hiddenData = form.addField({
                     id: 'custpage_hidden_store_value',
                     type: serverWidget.FieldType.LONGTEXT,
                     label: 'Hidden Store Value'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.HIDDEN
                 });
                 if (custpage_hidden_store_value) {
                     hiddenData.defaultValue = custpage_hidden_store_value;
                 }
                 var pagination_filter = form.addField({
                     id: 'custpage_pagination_filter_vend_ap',
                     type: serverWidget.FieldType.SELECT,
                     label: 'Paginación (Page ID)',
                     container: 'custpage_filter_group'
                 });
                 pagination_filter.updateDisplaySize({
                     height: 60,
                     width: 130
                 });
                 /*
                 pagination_filter.updateLayoutType({
                     layoutType: serverWidget.FieldLayoutType.ENDROW
                 });
                 */
                 if (custpage_pagination_filter_vend_ap) pagination_filter.defaultValue = custpage_pagination_filter_vend_ap;
                 pagination_filter.updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.HIDDEN
                 });
                 /*
                 pagination_filter.updateBreakType({
                     breakType : serverWidget.FieldBreakType.STARTROW
                 });
                 */
                 var item_sublist = form.addSublist({
                     id: 'item_sublist',
                     type: serverWidget.SublistType.LIST,
                     label: 'Items',
                     container: 'custpage_item_tab'
                 });
                 var item_SKU = item_sublist.addField({
                     id: 'custpage_item_sku',
                     type: serverWidget.FieldType.TEXT,
                     label: 'ID del artículo (SKU)'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.DISABLED
                 });
                 var pp_item_ID = item_sublist.addField({
                     id: 'custpage_pp_item_id',
                     type: serverWidget.FieldType.SELECT,
                     label: 'PP Item Record',
                     source: 'customrecord_efx_pp_purchase_items'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.HIDDEN
                 });
                 var vendor_Code = item_sublist.addField({
                     id: 'custpage_vendor_code',
                     type: serverWidget.FieldType.TEXT,
                     label: 'Código de proveedor (Vendor Code)'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.DISABLED
                 });
                 var descrip = item_sublist.addField({
                     id: 'custpage_item_description',
                     type: serverWidget.FieldType.TEXT,
                     label: 'Descripción del artículo (Item Description)'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.DISABLED
                 });
                 var item_Price = item_sublist.addField({
                     id: 'custpage_current_price',
                     type: serverWidget.FieldType.CURRENCY,
                     label: 'Precio de compra actual (Current Item Price)'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.DISABLED
                 });
                 item_sublist.addField({
                     id: 'custpage_item_base_unit',
                     type: serverWidget.FieldType.TEXT,
                     label: 'Unidad de medida base (Item Base Unit)'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.DISABLED
                 });
                 /*item_sublist.addField({
                     id: 'custpage_price_currency',
                     type: serverWidget.FieldType.TEXT,
                     label: 'Moneda (Price Currency)'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.DISABLED
                 });*/
                 item_sublist.addField({
                     id: 'custpage_new_price',
                     type: serverWidget.FieldType.CURRENCY,
                     label: 'Nuevo precio (New Price)'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.ENTRY
                 });
                 var newCurrencyColumn = item_sublist.addField({
                     id: 'custpage_new_currency',
                     type: serverWidget.FieldType.SELECT,
                     label: 'Nueva moneda (New Currency)'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.HIDDEN
                 });
                 var vendorCurrencySearchObj = search.create({
                     type: "vendor",
                     filters: [
                         ["internalid", "anyof", user]
                     ],
                     columns: [
                         search.createColumn({
                             name: "entityid",
                             sort: search.Sort.ASC,
                             label: "ID"
                         }),
                         search.createColumn({
                             name: "currency",
                             join: "vendorcurrencybalance",
                             label: "Currency"
                         })
                     ]
                 });
                 var currObj = currSearch();
                 vendorCurrencySearchObj.run().each(function(result) {
                     // .run().each has a limit of 4,000 results
                     currencyfield.addSelectOption({
                         text: result.getValue({
                             name: 'currency',
                             join: 'vendorcurrencybalance'
                         }),
                         value: currObj[result.getValue({
                             name: 'currency',
                             join: 'vendorcurrencybalance'
                         })]
                     });
                     newCurrencyColumn.addSelectOption({
                         text: result.getValue({
                             name: 'currency',
                             join: 'vendorcurrencybalance'
                         }),
                         value: currObj[result.getValue({
                             name: 'currency',
                             join: 'vendorcurrencybalance'
                         })]
                     });
                     return true;
                 });
                 item_sublist.addField({
                     id: 'custpage_item_notes',
                     type: serverWidget.FieldType.TEXT,
                     label: 'Comentarios (Notes)'
                 }).updateDisplayType({
                     displayType: serverWidget.FieldDisplayType.ENTRY
                 });
                 if (custpage_purchase_price_filter) {
                     searchRecord(item_sublist, user, request, pagination_filter, custpage_purchase_price_filter, user);
                 }
                 var submitButton = form.addSubmitButton({
                     label: 'Ejecutar'
                 });
                 response.writePage(form);
             } else { // POST Request
               log.debug("parameters",request.parameters)
                 var pp_ID = request.parameters.custpage_purchase_price_filter;
                 var pageId = request.parameters.custpage_pagination_filter_vend_ap;
                 var action = request.parameters.custpage_purchase_price_status;
                 var custpage_hidden_store_value = request.parameters.custpage_hidden_store_value;
                 var startDate = request.parameters.custpage_purchase_price_start_date;
                 var endDate = request.parameters.custpage_purchase_price_end_date;
               	var currency = request.parameters.custpage_currency;
                 log.debug('custpage_hidden_store_value on POST', custpage_hidden_store_value);
               log.debug('currency on POST', currency);
                 if (action == 1) {
                     updatePPItems(custpage_hidden_store_value, currency);
                     if(startDate || endDate) {
                         var submitValuesObj = {};
                         if(startDate) {
                             submitValuesObj.custrecord_efx_pp_date_start = format.parse({
                                 value: startDate,
                                 type: format.Type.DATE
                             })
                         }
                         if(endDate) {
                             submitValuesObj.custrecord_efx_pp_date_end = format.parse({
                                 value: endDate,
                                 type: format.Type.DATE
                             })
                         }
                       		if(currency) {
                             submitValuesObj.custrecord_efx_pp_main_currency = currency;
                         }
                       log.debug("submitValuesObj",submitValuesObj);
                         var ppSubmitID = record.submitFields({
                             type: 'customrecord_efx_pp_purchase_prices',
                             id: pp_ID,
                             values: submitValuesObj,
                             options: {
                                 ignoreMandatoryFields: true
                             }
                         });
                     }
                     log.debug('Inside Draft');
                     redirect.toSuitelet({
                         scriptId: 'customscript_efx_pp_vendor_approval_sl',
                         deploymentId: 'customdeploy_efx_pp_vendor_approval_sl'
                     });
                     return;
                 } else if (action == 2) {
                     updatePPItems(custpage_hidden_store_value, currency);
                     var submitValuesObj = {custrecord_efx_pp_status_request: 1};
                     if(startDate) {
                         submitValuesObj.custrecord_efx_pp_date_start = format.parse({
                             value: startDate,
                             type: format.Type.DATE
                         })
                     }
                     if(endDate) {
                         submitValuesObj.custrecord_efx_pp_date_end = format.parse({
                             value: endDate,
                             type: format.Type.DATE
                         })
                     }
                     if(currency) {
                       submitValuesObj.custrecord_efx_pp_main_currency = currency;
                     }
                     var ppSubmitID = record.submitFields({
                         type: 'customrecord_efx_pp_purchase_prices',
                         id: pp_ID,
                         values: submitValuesObj,
                         options: {
                             ignoreMandatoryFields: true
                         }
                     });
                     log.debug('Record Changed');
                     redirect.toSuitelet({
                         scriptId: 'customscript_efx_pp_vendor_approval_sl',
                         deploymentId: 'customdeploy_efx_pp_vendor_approval_sl'
                     });
                     return;
                 } else if (action == 3) {
                     var ppSubmitID = record.submitFields({
                         type: 'customrecord_efx_pp_purchase_prices',
                         id: pp_ID,
                         values: {
                             isinactive: 'T'
                         },
                         options: {
                             ignoreMandatoryFields: true
                         }
                     });
                     log.debug('Record Inactive');
                     redirect.toSuitelet({
                         scriptId: 'customscript_efx_pp_vendor_approval_sl',
                         deploymentId: 'customdeploy_efx_pp_vendor_approval_sl'
                     });
                     return;
                 }
             }
         } catch (e) {
             log.error('Error:', e);
         }
     }

     function searchRecord(item_sublist, user, request, pagination_filter, custpage_purchase_price_filter, user) {
         var pp_item_ID, vend_Code, description = '',
             og_purchase_price, bsUnit, og_currency, item_sku, purchase_price, currency, notes;
         var pp_item_search = search.create({
             type: "customrecord_efx_pp_purchase_items",
             filters: [
                 ["custrecord_efx_pp_request", "anyof", custpage_purchase_price_filter], "AND",
                 ["custrecord_efx_pp_item.othervendor", "anyof", user]
             ],
             columns: [
                 search.createColumn({
                     name: "custrecord_efx_pp_request",
                     label: "Request"
                 }),
                 search.createColumn({
                     name: "custrecord_efx_pp_item",
                     label: "Item"
                 }),
                 search.createColumn({
                     name: "custrecord_efx_pp_price",
                     label: "Price"
                 }),
                 search.createColumn({
                     name: "custrecord_efx_pp_currency",
                     label: "Currency"
                 }),
                 search.createColumn({
                     name: "custrecord_efx_pp_notes",
                     label: "Notes"
                 }),
                 search.createColumn({
                     name: "upccode",
                     join: "CUSTRECORD_EFX_PP_ITEM",
                     label: "UPC Code"
                 }),
                 search.createColumn({
                   name: "itemid",
                   join: "CUSTRECORD_EFX_PP_ITEM",
                   label: "UPC Code"
                 }),
                 search.createColumn({
                     name: "vendorcode",
                     join: "CUSTRECORD_EFX_PP_ITEM",
                     label: "Vendor Code"
                 }),
                 search.createColumn({
                     name: "salesdescription",
                     join: "CUSTRECORD_EFX_PP_ITEM",
                     label: "Description"
                 }),
                 search.createColumn({
                     name: "unitstype",
                     join: "CUSTRECORD_EFX_PP_ITEM",
                     label: "Primary Units Type"
                 }),
                 search.createColumn({
                     name: "vendorcost",
                     join: "CUSTRECORD_EFX_PP_ITEM",
                     label: "Vendor Price"
                 }),
                 search.createColumn({
                     name: "vendorpricecurrency",
                     join: "CUSTRECORD_EFX_PP_ITEM",
                     label: "Vendor Price Currency"
                 })
             ]
         });
         log.debug("itemSearchObj", pp_item_search);
         var searchResultCount = pp_item_search.runPaged().count;
         log.debug("itemSearchObj result count", searchResultCount);
         //PAGINATION FUNCTION TO DISPLAY THE PAGE INDEX IN SUITELET 
         var pageId = parseInt(request.parameters.custpage_pagination_filter_vend_ap);
         log.debug('pageId', pageId);
         var pageCount = Math.ceil(searchResultCount / PAGE_SIZE);
         log.debug('pageCount', pageCount);
         if (!pageId || pageId == '' || pageId < 0) pageId = 0;
         else if (pageId >= pageCount) pageId = pageCount - 1;
         log.debug('pageId renewed', pageId);
         if (searchResultCount > PAGE_SIZE) {
             pagination_filter.updateDisplayType({
                 displayType: serverWidget.FieldDisplayType.NORMAL
             });
         }
         for (var i = 0; i < pageCount; i++) {
             if (i == pageId) {
                 pagination_filter.addSelectOption({
                     value: i,
                     text: ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE),
                     isSelected: true
                 });
             } else {
                 pagination_filter.addSelectOption({
                     value: i,
                     text: ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE)
                 });
             }
         }
         var pagedData = pp_item_search.runPaged({
             pageSize: PAGE_SIZE
         });
         var i = 0;
         if (searchResultCount > 0) {
             var searchPage = pagedData.fetch({
                 index: pageId
             });
             var hiddenFieldValue;
             if(request.parameters.custpage_hidden_store_value) {
                 hiddenFieldValue = JSON.parse(request.parameters.custpage_hidden_store_value);
             }
             log.debug('hiddenFieldValue hiddenFieldValue', hiddenFieldValue);
             searchPage.data.forEach(function(result) {
                 pp_item_ID = result.id;
                 item_sku = result.getValue({
                     name: 'itemid',
                     join: 'CUSTRECORD_EFX_PP_ITEM'
                 });
                 item_sku = item_sku ? item_sku : ' ';
                 vend_Code = result.getValue({
                     name: 'vendorcode',
                     join: 'CUSTRECORD_EFX_PP_ITEM'
                 });
                 vend_Code = vend_Code ? vend_Code : ' ';
                 description = result.getValue({
                     name: 'salesdescription',
                     join: 'CUSTRECORD_EFX_PP_ITEM'
                 });
                 description = description ? description : ' ';
                 if(hiddenFieldValue) {
                     var changedItemFound = searchInArr(String(pp_item_ID), 'item', hiddenFieldValue);
                     if(changedItemFound && changedItemFound['item'] == pp_item_ID) {
                         log.debug('changedItemFoundchangedItemFound', changedItemFound);
                         purchase_price = changedItemFound['nPri'] ? changedItemFound['nPri'] : '0.0';
                         currency = changedItemFound['nCur'] ? changedItemFound['nCur'] : '0';
                         notes = changedItemFound['nNot'] ? changedItemFound['nNot'] : ' ';
                     } else {
                         purchase_price = result.getValue('custrecord_efx_pp_price') ? result.getValue('custrecord_efx_pp_price') : '0.0';
                         currency = result.getValue('custrecord_efx_pp_currency') ? result.getValue('custrecord_efx_pp_currency') : '0';
                         notes = result.getValue('custrecord_efx_pp_notes') ? result.getValue('custrecord_efx_pp_notes') : ' ';
                     }
                 } else {
                     purchase_price = result.getValue('custrecord_efx_pp_price') ? result.getValue('custrecord_efx_pp_price') : '0.0';
                     currency = result.getValue('custrecord_efx_pp_currency') ? result.getValue('custrecord_efx_pp_currency') : '0';
                     notes = result.getValue('custrecord_efx_pp_notes') ? result.getValue('custrecord_efx_pp_notes') : ' ';
                 }
                 log.debug('purchase_price, currency, notes', purchase_price + '     ' + currency + '     ' + notes);
                 bsUnit = result.getText({
                     name: 'unitstype',
                     join: 'CUSTRECORD_EFX_PP_ITEM'
                 })
                 bsUnit = bsUnit ? bsUnit : ' ';
                 
                 og_purchase_price = result.getValue({
                     name: 'vendorcost',
                     join: 'CUSTRECORD_EFX_PP_ITEM'
                 });
                 og_purchase_price = og_purchase_price ? og_purchase_price : '0.0';
                 og_currency = result.getValue({
                     name: 'vendorpricecurrency',
                     join: 'CUSTRECORD_EFX_PP_ITEM'
                 });
                 og_currency = og_currency ? og_currency : ' ';
                 
                 // item_ID = result.getValue('itemid') ? result.getValue('itemid') : '0';
                 item_sublist.setSublistValue({
                     id: 'custpage_item_sku',
                     line: i,
                     value: item_sku
                 });
                 item_sublist.setSublistValue({
                     id: 'custpage_pp_item_id',
                     line: i,
                     value: pp_item_ID
                 });
                 item_sublist.setSublistValue({
                     id: 'custpage_vendor_code',
                     line: i,
                     value: vend_Code
                 });
                 item_sublist.setSublistValue({
                     id: 'custpage_item_description',
                     line: i,
                     value: description
                 });
                 item_sublist.setSublistValue({
                     id: 'custpage_current_price',
                     line: i,
                     value: Number(og_purchase_price).toFixed(2)
                 });
                 item_sublist.setSublistValue({
                     id: 'custpage_item_base_unit',
                     line: i,
                     value: bsUnit
                 });
                 /*item_sublist.setSublistValue({
                     id: 'custpage_price_currency',
                     line: i,
                     value: og_currency
                 });*/
                 item_sublist.setSublistValue({
                     id: 'custpage_new_price',
                     line: i,
                     value: purchase_price
                 });
                 item_sublist.setSublistValue({
                     id: 'custpage_new_currency',
                     line: i,
                     value: currency
                 });
                 item_sublist.setSublistValue({
                     id: 'custpage_item_notes',
                     line: i,
                     value: notes
                 });
                 i++;
             });
         }
     }

     function updatePPItems(custpage_hidden_store_value, currency) {
         if (custpage_hidden_store_value) {
             custpage_hidden_store_value = JSON.parse(custpage_hidden_store_value);
             for (var i = 0; i < custpage_hidden_store_value.length; i++) {
                 var ppItemSubmitID = record.submitFields({
                     type: 'customrecord_efx_pp_purchase_items',
                     id: custpage_hidden_store_value[i].item,
                     values: {
                         custrecord_efx_pp_price: custpage_hidden_store_value[i].nPri,
                         custrecord_efx_pp_currency: currency, //custpage_hidden_store_value[i].nCur,
                         custrecord_efx_pp_notes: custpage_hidden_store_value[i].nNot
                     }
                 });
                 log.debug('ppItemSubmitID', ppItemSubmitID);
             }
         }
     }
     
     function searchInArr(nameKey, prop, myArray){
         for (var i=0; i < myArray.length; i++) {
             if (myArray[i][prop]=== nameKey) {
                 return myArray[i];
             }
         }
     }

     function currSearch() {
         var currencySearchObj = search.create({
             type: "currency",
             filters: [
                 ["isinactive", "is", "F"]
             ],
             columns: [
                 search.createColumn({
                     name: "name",
                     sort: search.Sort.ASC,
                     label: "Name"
                 }),
                 search.createColumn({
                     name: "internalid",
                     label: "Internal ID"
                 })
             ]
         });
         var currObj = {};
         currencySearchObj.run().each(function(result) {
             // .run().each has a limit of 4,000 results
             currObj[result.getValue('name')] = result.getValue('internalid');
             return true;
         });
         return currObj;
     }
     return {
         onRequest: onRequest
     };
 });