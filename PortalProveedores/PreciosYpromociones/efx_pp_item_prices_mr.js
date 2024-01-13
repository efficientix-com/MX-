/**
 * @NApiVersion 2.0
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/runtime', 'N/search', 'N/format'],function(record, runtime, search, format) {
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	try{
    		var userObj	  		= runtime.getCurrentUser();
        	var vendor 	  		= userObj.id;
        	var scriptObj 		= runtime.getCurrentScript();
        	var allData	  		= JSON.parse(scriptObj.getParameter({name: 'custscript_efx_pp_item_prices_mr_para'}));
        	var data 			= allData.hiddenData;
        	var startDate		= allData.startDate;
        	var endDate			= allData.endDate;
        	var defaultStatus	= scriptObj.getParameter({name: 'custscript_efx_pp_item_prices_sl_def_sta'});
        	log.debug('allData',allData);
        	log.debug('defaultStatus',defaultStatus);
        	if(data)
        	{
        		data = JSON.parse(data);
        	}
        	var date = new Date();
        	log.debug('date',date);
        	var purchasePriceRec = record.create({
        	    type: 'customrecord_efx_pp_purchase_prices'
        	});
        	purchasePriceRec.setValue({
        		fieldId:'custrecord_efx_pp_vendor',
        		value: vendor
        	});
        	
        	purchasePriceRec.setValue({
        		fieldId:'custrecord_efx_pp_date_request',
        		value: date
        	});
        	if(startDate)
        	{
            	purchasePriceRec.setValue({
            		fieldId:'custrecord_efx_pp_date_start',
            		value: format.parse({value: startDate, type: format.Type.DATE})
            	});
        	}
        	if(endDate)
        	{
        		purchasePriceRec.setValue({
            		fieldId:'custrecord_efx_pp_date_end',
            		value: format.parse({value: endDate, type: format.Type.DATE})
            	});
        	}
        	purchasePriceRec.setValue({
        		fieldId:'custrecord_efx_pp_status_request',
        		value: defaultStatus
        	});
        	
        	var ppID = purchasePriceRec.save();
        	log.debug('ppID',ppID);
        	
        	log.debug('data.length',data.length);
        	for(var i=0 ; i<data.length ; i++)
        	{
        		data[i].ppID = ppID
        	}
        	log.debug('data',data);
        	return data;
    	}
    	catch(e)
    	{
    		log.error('Error in Get Input',e);
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

        	var mapContextValue = JSON.parse(context.value);
        	var item;
    		log.debug({
    			title: 'Map value',
    			details: mapContextValue
    		});
        	/*var itemSearch = search.create({
        		type: "item",
        		filters:[["upccode","is",mapContextValue.item]]
        	});
        	itemSearch.run().each(function (result){
        		item = result.id;
        	});*/
        	var piRec = record.create({
        		type: 'customrecord_efx_pp_purchase_items'
        	});
        	piRec.setValue({
        		fieldId:'custrecord_efx_pp_request',
        		value: mapContextValue.ppID
        	});
        	piRec.setValue({
        		fieldId:'custrecord_efx_pp_item',
        		value: mapContextValue.item
        	});
        	if(mapContextValue.nPri)
        	{
        		piRec.setValue({
            		fieldId:'custrecord_efx_pp_price',
            		value: mapContextValue.nPri
            	});
        	}
        	if(mapContextValue.nCur)
        	{
        		piRec.setValue({
            		fieldId:'custrecord_efx_pp_currency',
            		value: mapContextValue.nCur
            	});
        	}
        	if(mapContextValue.nNot)
        	{
        		piRec.setValue({
            		fieldId:'custrecord_efx_pp_notes',
            		value: mapContextValue.nNot
            	});
        	}
        	//Get vendor price from item record to fill previous price on record to be saved.

			var item_price = search.lookupFields({
				type: search.Type.INVENTORY_ITEM,
				id: mapContextValue.item,
				columns: ['vendorcost', 'vendorcost']
			});

			//log.debug({title: 'ITEM PRICE FOUND: ' + JSON.stringify(item_price), details: ''});
			//log.debug({title: 'TYPEOF' + typeof(item_price), details: ''});
			log.debug({title: 'Vendor cost del item' + item_price.vendorcost, details: ''});

			piRec.setValue({
				fieldId:'custrecord_efx_pp_prev_price',
				value: item_price.vendorcost
			});

			piRec.save();
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

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    }

    return {
        getInputData: getInputData,
        map: map
//        reduce: reduce,
//        summarize: summarize
    };
    
});
