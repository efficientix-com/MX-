/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord','N/ui/message'],

function(currentRecord,message) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {
    	var suiteRecord = scriptContext.currentRecord;
    	var subChk = suiteRecord.getValue({
			fieldId : 'custpage_hidden_submit_check'
		});
    	if(subChk == 'T')
    	{
    		var myMsg = message.create({
                title: 'Confirmation',
                message: 'Changed lines are been processed.',
                type: message.Type.INFORMATION
            });

            myMsg.show();
            setTimeout(myMsg.hide, 10000); // will disappear after 10s
    	}
    }

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
    function fieldChanged(scriptContext) 
    {
    	try
    	{
    		var suiteRecord = scriptContext.currentRecord;
			if (scriptContext.fieldId == 'custpage_pagination_filter')
			{
				var pageId = suiteRecord.getValue({
					fieldId : 'custpage_pagination_filter'
				});
				suiteRecord.setValue({
		    		fieldId : 'custpage_hidden_search_button',
		    		value: 2
		    	});
				if(pageId){
					var button = document.forms['main_form'].elements['submitter'];
					if (button)
					{
						button.click();
					} 
					else 
					{
						document.forms[0].submit();
					}
				}
			}
			
			if (scriptContext.fieldId == 'custpage_new_price' || scriptContext.fieldId == 'custpage_new_currency' || scriptContext.fieldId == 'custpage_item_notes')
			{
				var hiddenJSON=[];
				var hiddenData = suiteRecord.getValue({
					fieldId : 'custpage_hidden_store_value'
				});
				var currIndex = suiteRecord.getCurrentSublistIndex({
				    sublistId: 'item_sublist'
				});
//				alert('hiddenData: '+hiddenData);
				if(!hiddenData)
				{
					var temp = {};
					
					temp.item = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_item_name',
					    line: currIndex
					});
					temp.vCode = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_vendor_code',
					    line: currIndex
					});
					temp.nPri = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_new_price',
					    line: currIndex
					});
					if(temp.nPri)
					{
						temp.nPri = String(Number(temp.nPri).toFixed(2));
					}
					else
					{
						temp.nPri = '0.00';
					}
					temp.nCur = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_new_currency',
					    line: currIndex
					});
					temp.nNot = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_item_notes',
					    line: currIndex
					});
					hiddenJSON.push(temp);
				}
				else
				{
					hiddenJSON = JSON.parse(hiddenData);
					
					var temp = {};
					var flag=0;
					temp.item = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_item_name',
					    line: currIndex
					});
					temp.vCode = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_vendor_code',
					    line: currIndex
					});
					temp.nPri = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_new_price',
					    line: currIndex
					});
					if(temp.nPri)
					{
						temp.nPri = String(Number(temp.nPri).toFixed(2));
					}
					else
					{
						temp.nPri = '0.00';
					}
					temp.nCur = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_new_currency',
					    line: currIndex
					});
					temp.nNot = suiteRecord.getSublistValue({
					    sublistId: 'item_sublist',
					    fieldId: 'custpage_item_notes',
					    line: currIndex
					});
//					alert('hiddenJSON.length: '+hiddenJSON.length);
//					alert('hiddenJSON1 '+JSON.stringify(hiddenJSON));
					for(var i=0 ; i<hiddenJSON.length ; i++)
					{
//						alert('i '+i);
//						alert('Number(hiddenJSON[i].item)'+Number(hiddenJSON[i].item));
//						alert('Number(temp.item)'+Number(temp.item));
						if(Number(hiddenJSON[i].item) == Number(temp.item) && hiddenJSON[i].vCode == temp.vCode)
						{
//							alert('inside if '+i);
							hiddenJSON[i] = temp;
							flag = 1;
							break;
						}
					}
					if(flag == 0)
					{
						hiddenJSON.push(temp);
					}
//					alert('hiddenJSON2 '+JSON.stringify(hiddenJSON));
				}
				suiteRecord.setValue({
		    		fieldId : 'custpage_hidden_store_value',
		    		value: JSON.stringify(hiddenJSON)
		    	});
			}
			if (scriptContext.fieldId == 'custpage_pagination_filter_vend_ap')
			{
				var pageId = suiteRecord.getValue({
					fieldId : 'custpage_pagination_filter_vend_ap'
				});
				if(pageId){
					var button = document.forms['main_form'].elements['submitter'];
					if (button)
					{
						button.click();
					} 
					else 
					{
						document.forms[0].submit();
					}
				}
			}
			
			if (scriptContext.fieldId == 'custpage_purchase_price_filter')
			{
				var pp_Id = suiteRecord.getValue({
					fieldId : 'custpage_purchase_price_filter'
				});
				if(pp_Id){
					var button = document.forms['main_form'].elements['submitter'];
					if (button)
					{
						button.click();
					} 
					else 
					{
						document.forms[0].submit();
					}
				}
			}
			
    	}
    	catch(e)
    	{
    		console.log(e);
    		alert(e);
    	}
    }

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
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

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
    function validateField(scriptContext) {

    }

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
    function validateLine(scriptContext) {

    }

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
    function validateInsert(scriptContext) {

    }

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
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {
    	var suiteRecord = scriptContext.currentRecord;
    	var subChk = suiteRecord.getValue({
    		fieldId: 'custpage_hidden_search_button'
    	});
    	var startDate = suiteRecord.getValue({
    		fieldId: 'custpage_start_date'
    	});
    	
    	var endDate = suiteRecord.getValue({
    		fieldId: 'custpage_end_date'
    	});
    	var currDate = new Date();
    	currDate = currDate.setDate(currDate.getDate() - 1);
    	if(Number(subChk) == 1)
    	{
    		suiteRecord.setValue({
        		fieldId: 'custpage_hidden_submit_check',
        		value: 'T'
        	});
    		if(startDate)
    		{
    			startDate = new Date(startDate);
//    			alert('Start Date: '+startDate);
//    			alert('Current Date: '+currDate);
    			if(startDate < currDate)
    			{
    				alert('Start Date cannot be prior to current date!');
    				return false;
    			}
    		}
    		if(endDate)
    		{
    			endDate = new Date(endDate);
    			startDate = new Date(startDate);
//    			alert('End Date: '+endDate);
//    			alert('Current Date: '+currDate);
    			if(startDate)
    			{
    				if(endDate < startDate)
    				{
        				alert('End Date cannot be prior to start date!');
        				return false;
    				}
    			}
    			if(endDate < currDate)
				{
    				alert('End Date cannot be prior to current date!');
    				return false;
				}
    		}
    	}
    	else
    	{
    		suiteRecord.setValue({
        		fieldId: 'custpage_hidden_submit_check',
        		value: 'F'
        	});
    	}
    	return true;
    }

    function searchbutton()
    {
    	var suiteRecord = currentRecord.get();;
    	suiteRecord.setValue({
    		fieldId : 'custpage_hidden_search_button',
    		value: 3
    	});
    	var button = document.forms['main_form'].elements['submitter'];
		if (button)
		{
			button.click();
		} 
		else 
		{
			document.forms[0].submit();
		}
    }
    
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
//        postSourcing: postSourcing,
//        sublistChanged: sublistChanged,
//        lineInit: lineInit,
//        validateField: validateField,
//        validateLine: validateLine,
//        validateInsert: validateInsert,
//        validateDelete: validateDelete,
        saveRecord: saveRecord,
        searchbutton: searchbutton
    };
    
});
