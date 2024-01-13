/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/runtime', 'N/search', 'N/file', './papaparse.min.js', 'N/error', 'N/email'],function(record, runtime, search, file, Papa, error, email) {
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData(){
        var userObj	  		= runtime.getCurrentUser();
        try{

            var vendor 	  		= userObj.id;
            var roleCenter 	  		= userObj.roleCenter;
//        	vendor 				= '941';
            var scriptObj 		= runtime.getCurrentScript();
            var fileId	  		= scriptObj.getParameter({name: 'custscript_efx_pp_ip_csv_mr_sl_para'});
            var defaultStatus	= scriptObj.getParameter({name: 'custscript_efx_pp_ip_default_status'});
            var fileObj,fileData;
            log.debug('fileId',fileId);
            log.debug('defaultStatus',defaultStatus);
            if(fileId)
            {
                fileObj = file.load({
                    id: fileId
                });

                fileData = fileObj.getContents();
                fileData = fileData.trim();
                fileData = Papa.parse(fileData, {
                    header: true
                });
                log.debug('fileData',fileData);
                fileData = fileData.data;


                var date = new Date();
                log.debug('date',date);


                log.debug('fileData.length',fileData.length);
                log.debug('fileData before',fileData);
                var ppID = {};
                var currency = {};
              	var erpload = false;
              
                if(fileData[0]['Vendor ID'] ){
                  erpload = true;
                }
              	var errorArr = getItems(fileData,userObj,vendor,erpload);
                for(var i=0 ; i<fileData.length ; i++)
                {
                    var vendorid = fileData[i]['Vendor ID'] || vendor;
                    
                    log.debug('errorArr.length',errorArr.length);
                    if(errorArr.length)
                    {
                        var errorMessage = '';
                        var html		 = 'Se han encontrado los siguientes errores:\n\n';
                        for(var i=0 ; i<errorArr.length ;  i++)
                        {
                            errorMessage = errorMessage + errorArr[i] + '\n';
                        }
                        html = html+errorMessage;
                        html = html + '\nSaludos,\nEmail aumtomático del sistema';
                        var custom_error = error.create({
                            name: fileId,
                            message: html
                        });
                        throw custom_error;
                    }
                    else
                    {
                        if(!ppID[vendorid]){
                            var fieldLookUp = search.lookupFields({
                                type: search.Type.VENDOR,
                                id: vendorid,
                                columns: ['currency']
                            });//	custscript_efx_pp_currency: fieldLookUp['currency'][0].value
                            var purchasePriceRec = record.create({
                                type: 'customrecord_efx_pp_purchase_prices'
                            });
                          	if(erpload){
                              purchasePriceRec.setValue({
                                  fieldId:'custrecord_efx_pp_status_request',
                                  value: 1
                              });
                            }

                            purchasePriceRec.setValue({
                                fieldId:'custrecord_efx_pp_vendor',
                                value: vendorid
                            });

                            purchasePriceRec.setValue({
                                fieldId:'custrecord_efx_pp_date_request',
                                value: date
                            });
                            
                            purchasePriceRec.setValue({
                                fieldId:'custrecord_efx_pp_status_request',
                                value: defaultStatus
                            });
                          	purchasePriceRec.setValue({
                                fieldId:'custrecord_efx_pp_main_currency',
                                value: fieldLookUp['currency'][0].value
                            });
                            ppID[vendorid] = purchasePriceRec.save();
                            currency[vendorid] = fieldLookUp['currency'][0].value;
                            log.debug('currency',currency);
                          log.debug('ppID',ppID);
                        }
                        fileData[i].ppID = ppID[vendorid];
                        fileData[i].currency = currency[vendorid];
                      	fileData[i].erpload = (erpload)?1:0;
                    }
                    log.debug('fileData after',fileData);

                }
                return fileData;
            }

        }
        catch(e)
        {
            log.error('Error in Get Input',e);
            throw e;
        }
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        try{

            log.debug({title: 'CONTEXT VALUE: ', details: context.value});
            var mapContextValue = JSON.parse(context.value);
            var item;
            log.debug({
                title: 'Map value',
                details: mapContextValue
            });
            log.debug({
                title: 'NEW PRICE: ',
                details: mapContextValue['Purchase Price']
            });
          	var erpload = false;
            //log.debug('New Price',mapContextValue['New Price']);
            var itemSearch = search.create({
                type: "item",
                filters:[["itemid","is",mapContextValue['SKU Vinoteca']]]
            });
            if(itemSearch)
                itemSearch.run().each(function (result){
                    item = result.id;
                });

            if(item)
            {
                log.debug({title: '+++++++++++ SE VA A GUARDAR ITEM', details: ''});
              	if( mapContextValue['erpload'] == 1 || mapContextValue['erpload'] == '1'){
                  erpload = true;
                }
                var piRec = record.create({
                    type: 'customrecord_efx_pp_purchase_items'
                });
                piRec.setValue({
                    fieldId:'custrecord_efx_pp_request',
                    value: mapContextValue['ppID']
                });
                
                piRec.setValue({
                    fieldId:'custrecord_efx_pp_item',
                    value: item
                });
                if(mapContextValue['Purchase Price'])
                {
                    piRec.setValue({
                        fieldId:'custrecord_efx_pp_price',
                        value: mapContextValue['Purchase Price']
                    });
                }
                if(mapContextValue['Purchase Currency'])
                {
                    piRec.setText({
                        fieldId:'custrecord_efx_pp_currency',
                        text: mapContextValue['Purchase Currency']
                    });
                }
                /*else{
                    var scriptObj 		= runtime.getCurrentScript();
                    var currencyid	  		= scriptObj.getParameter({name: 'custscript_efx_pp_currency'});

                    log.debug("currencyid",currencyid);

                    piRec.setValue({
                        fieldId:'custrecord_efx_pp_currency',
                        value: parseInt(currencyid)
                    });
                }*/
                piRec.setValue({
                      fieldId:'custrecord_efx_pp_currency',
                      value: mapContextValue['currency']
                  });
                if(mapContextValue['Note'])
                {
                    piRec.setValue({
                        fieldId:'custrecord_efx_pp_notes',
                        value: mapContextValue['Note']
                    });
                }
                if(mapContextValue['Vendor Code']){
                    piRec.setValue({
                        fieldId:'custrecord_pp_vendor_code',
                        value: mapContextValue['Vendor Code']
                    });
                }
                //Get vendor price from item record to fill previous price on record to be saved.

                var item_price = search.lookupFields({
                    type: search.Type.INVENTORY_ITEM,
                    id: item,
                    columns: ['vendorcost', 'vendorcost']
                });

                //log.debug({title: 'ITEM PRICE FOUND: ' + JSON.stringify(item_price), details: ''});
                //log.debug({title: 'TYPEOF' + typeof(item_price), details: ''});
                log.debug({title: 'Vendor cost del item' + item_price.vendorcost, details: ''});

                piRec.setValue({
                    fieldId:'custrecord_efx_pp_prev_price',
                    value: item_price.vendorcost
                });


                var id_rec_item = piRec.save();
                log.debug({title: 'ID DEL REC DEL ITEM GUARDADO ', details: id_rec_item});
              context.write({
                    key: mapContextValue['ppID']+((erpload)?"-T":"-F"),
                    value: mapContextValue
                });
              log.debug({title: 'Write', details: {
                    key: mapContextValue['ppID']+((erpload)?"-T":"-F"),
                    value: mapContextValue
                }});
            }
        }
        catch(e)
        {
            log.error('Error in MAP',e);
        }
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
		try{
          log.debug({title: 'REDUCE ', details: context});
          var data = context.key.split("-");
          var key = data[0];
          var erpload = data[1];
          log.debug({title: 'context.key', details: context.key});
          log.debug({title: 'key', details: key});
          log.debug({title: 'erpload', details: erpload});
          if(erpload == 'T'){
            var id = record.submitFields({
                type: 'customrecord_efx_pp_purchase_prices',
                id: key,
                values: {
                    custrecord_efx_pp_status_request: 2
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields : true
                }
            });
            log.debug({title: 'REDUCE ID', details: id});
          }
          
          
        }
      catch(e)
        {
            log.error('Error in REDUCE',e);
        }
    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
      var user 			= runtime.getCurrentUser();
        var mapSummary 		= summary.mapSummary;
        var scriptObj 		= runtime.getCurrentScript();
        var senderId	  	= scriptObj.getParameter({name: 'custscript_efx_pp_item_prices_csv_author'}) || user.id;
        
        var recipientId		= user.id;
        if (summary.inputSummary.error) {
            var errors = JSON.parse(summary.inputSummary.error);
            errors 	   = JSON.parse(errors.message);
            log.debug('errors',errors);
            var fileObj = file.load({
                id: errors.name
            });
            log.debug('fileObj',fileObj);
            email.send({
                author: senderId,
                recipients: recipientId,
                subject: 'CSV Processing Error.',
                body: errors.message,
                relatedRecords: {
                    entityId: recipientId
                },
                attachments: [fileObj],
            });
        }
//    	return;
    }

    function getItems(fileData,user,vendorid, erpload)
    {
      log.debug("getItems",vendorid);
        var item_sku,othervendor,itemUPCArr = [], error = [], itemvendor = {};
      	var filters = []
      	if(!erpload){
          filters = [["isinactive","is","F"],
                     "AND",
					 ["custitem_efx_cmp_tip_art","noneof","2"],
                "AND",
                     [
                       ["othervendor","anyof",vendorid],
                       "OR",
                       ["vendor","anyof",vendorid]
                     ]
            ];
        }
      else{
        filters = [["isinactive","is","F"],
                     "AND",
					 ["custitem_efx_cmp_tip_art","noneof","2"]
            ];
      }
        var itemSearch = search.create({
            type: "inventoryitem",
            filters:filters,
            columns:
                [
                  search.createColumn({name: "itemid", label: "SKU"}),
                  search.createColumn({name: "othervendor", label: "Other Vendor"}),
                ]
        });
        var searchResultCount = Number(itemSearch.runPaged().count);
        log.debug("itemSearchObj result count",searchResultCount);
        var pagedData = itemSearch.runPaged({
            pageSize: 1000
        });
        var pageCount = Math.ceil(searchResultCount / 1000);
        log.debug('pageCount',pageCount);
      	var erp
        for(var i=0 ; i<pageCount ; i++)
        {
            var searchPage = pagedData.fetch({
                index : i
            });
            searchPage.data.forEach(function (result) {
                item_sku = result.getValue('itemid')? result.getValue('itemid') : ' ';
              	othervendor = result.getValue('othervendor')? result.getValue('othervendor') : ' ';
                itemUPCArr.push(item_sku);
              	itemvendor[item_sku+"-"+othervendor] = othervendor;
            });
        }
        log.debug('Item UPC Array',itemUPCArr);
      	log.debug('Vendor-ITEM',itemvendor);

//		var data = JSON.parse(fileData);
        log.debug('data',fileData);
        log.debug('data.length',fileData.length);
        for(var i=0 ; i<fileData.length ; i++)
        {
            
            if(itemUPCArr.indexOf(fileData[i]['SKU Vinoteca']) < 0 && !erpload)
            {
                var errMessage = 'SKU '+fileData[i]['SKU Vinoteca']+ ' no está asociado al proveedor.';
                error.push(errMessage);
            }
            else if(!itemvendor[fileData[i]['SKU Vinoteca']+"-"+fileData[i]['Vendor ID']] && erpload){
                  var errMessage = 'SKU '+fileData[i]['SKU Vinoteca']+ ' no está asociado al proveedor: '+fileData[i]['Vendor Description'];
                  error.push(errMessage);
            }
        }
        log.debug("error",error);
        return error;
    }
    return {
        getInputData: getInputData,
        map: map,
       reduce: reduce,
        summarize: summarize
    };

});