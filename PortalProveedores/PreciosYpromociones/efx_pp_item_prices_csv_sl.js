/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/ui/serverWidget','N/runtime','./papaparse.min.js','N/task','N/redirect','N/error', 'N/search', 'N/url'],
/**
 * @param {file} file
 * @param {serverWidget} serverWidget
 */
function(file, serverWidget, runtime, Papa, task, redirect, error, search, url) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
	var userObj = runtime.getCurrentUser();
  var scriptContext = null
	
    function onRequest(context) {
    	/*try{}catch(e)
    	{
    		log.error('ERROR',e.name+'\t'+e.message);
    		throw e.name+ '\n' + e.message;
    	}*/
		var scriptContext = context;
		var user = userObj.id;
    	var folderId = runtime.getCurrentScript().getParameter('custscript_efx_pp_item_price_folder_id');
    	//var accountId = runtime.getCurrentScript().getParameter('custscript_efx_pp_item_price_account_id');
		var accountId = runtime.accountId;
    	var hiddenSubChk = context.request.parameters.hiddenSubChk;
		log.debug('folderId: ',folderId);
		var csvfileinfoobj = getItems();
		var gFileId = csvfileinfoobj.fileid;
		var gFilePath = csvfileinfoobj.filepath;
//		log.debug('gFileId',gFileId);
		var domian = url.resolveDomain({
		    hostType: url.HostType.APPLICATION,
		    accountId: accountId
		});
		log.debug({title: 'Domain var: ', details: domian});
		var fileUrl = 'https://'+domian+gFilePath;
		var html = '<html>\n<body>\n';
		html	 = html+'<p>Para descargar la lista de artículos del proveedor <a href="'+fileUrl+'">Clic aquí</a> <p>(To download item list for Vendor <a href="'+fileUrl+'">click here</a>).</p>';
		html	 = html+'\n</body>\n</html>'
		
		log.debug('html',html);
		if (context.request.method === 'GET') {
			var form = serverWidget.createForm({
				title: 'Cargar Precios de artículos (Upload Item Prices)'
			});
			form.clientScriptModulePath = './efx_pp_item_prices_csv_cl.js';
			var fileDLURL = form.addField({
				id: 'custpage_item_prices_csv_file_download_link',
				type: serverWidget.FieldType.INLINEHTML,
				label: 'File Link'
			});
			fileDLURL.defaultValue = html;
			var fieldCsvFileUpload = form.addField({
				id: 'custpage_item_prices_csv_file',
				type: serverWidget.FieldType.FILE,
				label: 'Archivo CSV de precios de artículos (Item Prices CSV File)'
			});
			fieldCsvFileUpload.updateLayoutType({
			    layoutType : serverWidget.FieldLayoutType.OUTSIDEBELOW
			});
			fieldCsvFileUpload.updateBreakType({
			    breakType : serverWidget.FieldBreakType.STARTROW
			});
			fieldCsvFileUpload.isMandatory = true;
			var submitCheck = form.addField({
				id: 'custpage_item_prices_csv_submit_check',
				type: serverWidget.FieldType.TEXT,
				label: 'Check'
			}).updateDisplayType({
                displayType : serverWidget.FieldDisplayType.HIDDEN
            });
			if(hiddenSubChk)
				submitCheck.defaultValue = hiddenSubChk;
			var buttonSubmit = form.addSubmitButton({
				label: 'Ejecutar (Submit)'
			});
			context.response.writePage(form);
		}
		else{
			var request = context.request;
			var response = context.response;
			var csvFile = request.files['custpage_item_prices_csv_file'];
			var csvFileContents = csvFile.getContents();
            log.debug('csvFileContents: ',csvFileContents);
			if(csvFileContents)
			{
    			csvFileContents = csvFileContents.trim();
    			log.debug('csvFileName: ' + csvFile.name, 'Contents: ' + csvFileContents);
    			var parsedCsv = Papa.parse(csvFileContents, {
    				header: true
    			});
    			log.debug('parsedCsv', parsedCsv);
    			if(parsedCsv.errors && parsedCsv.errors.length > 0) {
    				for(var i=0; i<parsedCsv.errors.length; i++) {
    					log.debug('Error while parsing row ' + parsedCsv.errors[i].row, JSON.stringify(parsedCsv.errors[i]));
    				}
    				var errorObj = error.create({
    					name: 'CSV_PARSER_ERROR',
    					message: 'Error in parsing the CSV: ' + JSON.stringify(parsedCsv.errors)
    				});
    				throw errorObj.message;
    			} else {
    				if(parsedCsv.data && parsedCsv.data.length > 0) {
    					var validationErrors = [];

    					var vendCurr = [];

    					var distinctSKUArr = parsedCsv.data.reduce(function (r, x) {
    						if(x['SKU'] == '') {
    							var errorObj = error.create({
    			    				name: 'CSV_VALIDATION_ERROR',
    			    				message: 'Error in validating the CSV: SKU Column Blank.'
    			    			});
    							throw errorObj.message;
    						}
    						if(x['New Currency'] == '')
    						{
    							var errorObj = error.create({
    			    				name: 'CSV_VALIDATION_ERROR',
    			    				message: 'Error in validating the CSV: New Currency Column Blank.'
    			    			});
    							throw errorObj.message;
    						}
    						return r;
    					}, []);
    					var vendorCurrencySearchObj = search.create({
    						type: "vendor",
    						filters:
    						[
    						  ["internalid","anyof",user]
    						],
    						columns:
    						[
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
    					vendorCurrencySearchObj.run().each(function(result) {
    						// .run().each has a limit of 4,000 results
    						var currCurrency = result.getValue({name: 'currency', join: 'vendorcurrencybalance'});
    				
    						vendCurr.push(currCurrency);
    						return true;
    					});
    					log.debug('vendCurr',vendCurr);
    					var distinctNewCurrencyArr = parsedCsv.data.reduce(function (r, x) {
    						if(x['New Currency'] && r.indexOf(x['New Currency'])<0) {
    	    					log.debug("x['New Currency']",x['New Currency']);
    							if(vendCurr.indexOf(x['New Currency']) == -1)
    							{
    								var errorObj = error.create({
    			    					name: 'CSV_VALIDATION_ERROR',
    			    					message: 'Error in validating the CSV: Currency ' + x['New Currency'] + ' is not associated with the logged in Vendor.'
    			    				});
    								throw errorObj.message;
    							}
    							r.push(x['New Currency']);
    						}
    						return r;
    					}, []);
    					
    					var csvFileId = saveCsvToCabinet(csvFile,folderId);
    					log.debug('csvFileId',csvFileId);
						if (csvFileId) {
							var userId = userObj.id;
                          
                          	var fieldLookUp = search.lookupFields({
                                type: search.Type.VENDOR,
                                id: userId,
                                columns: ['currency']
                              });
							var mrTask = task.create({
							    taskType: task.TaskType.MAP_REDUCE,
							    scriptId: 'customscript_efx_pp_item_prices_csv_mr',
							    deploymentId: 'customdeploy_efx_pp_item_prices_csv_mr',
							    params: {
							    	custscript_efx_pp_ip_csv_mr_sl_para: csvFileId,
                                  //	custscript_efx_pp_currency: fieldLookUp['currency'][0].value
							    }
							});
							var mrTaskId = mrTask.submit();
							if(mrTaskId)
							{
								var hiddenSubChk = 'T'
								redirect.toSuitelet({
    								scriptId: 'customscript_efx_pp_item_prices_csv_sl' ,
    								deploymentId: 'customdeploy_efx_pp_item_prices_csv_sl',
    								parameters: {'hiddenSubChk':hiddenSubChk}
    							});
							}
							else
							{
								var hiddenSubChk = 'F'
    								redirect.toSuitelet({
        								scriptId: 'customscript_efx_pp_item_prices_csv_sl' ,
        								deploymentId: 'customdeploy_efx_pp_item_prices_csv_sl',
        								parameters: {'hiddenSubChk':hiddenSubChk}
        							});
							}
						}
    				}
    			}
			}
			else
			{
				var errorObj = error.create({
					name: 'CSV_VALIDATION_ERROR',
					message: 'Error in validating the CSV: CSV is blank!'
				});
				throw errorObj.message;
			}
		}
    }

    function saveCsvToCabinet(csvFile,folderId) {
		log.debug('folderId-212: ',folderId);
		csvFile.folder = folderId;
		csvFile.name = csvFile.name.split('.')[0] + '_' + new Date().getTime() + '.csv';
		return csvFile.save();
	}
    function getItems()
    {
    	var itemObjArr = [], error = [];
        var filters = [["isinactive","is","F"], 
    		         "AND",
					 ["custitem_efx_cmp_tip_art","noneof","2"]];
        if(userObj.roleCenter == "VENDOR"){
          filters.push("AND");
          filters.push(["othervendor","anyof",userObj.id]);
          filters.push("AND");
          filters.push(["subsidiary","anyof",userObj.subsidiary]);
        }
        else{
          filters.push("AND");
          filters.push(["othervendor","noneof","@NONE@"]);
        
        }
      
    	var itemSearch = search.create({
    		type: "inventoryitem",
    		filters:filters,
    		columns:
    				 [
                      search.createColumn({name: "displayname", label: "UPC Code"}),
                      search.createColumn({name: "vendor", label: "UPC Code"}),
                       search.createColumn({name: "othervendor", label: "UPC Code"}),
                      search.createColumn({name: "vendorcode", label: "UPC Code"}),
                      search.createColumn({name: "upccode", label: "UPC Code"}),
    				  search.createColumn({name: "vendorcost", label: "Vendor Price"}),
    			      search.createColumn({name: "vendorpricecurrency", label: "Vendor Price Currency"}),
    			      search.createColumn({name: "itemid", label: "Name"})]
    	});
    	var searchResultCount = Number(itemSearch.runPaged().count);
//    	log.debug("itemSearchObj result count",searchResultCount);
    	var pagedData = itemSearch.runPaged({
			pageSize: 1000
		});
    	var pageCount = Math.ceil(searchResultCount / 1000);
//		log.debug('pageCount',pageCount);
		for(var i=0 ; i<pageCount ; i++)
		{
			var searchPage = pagedData.fetch({
				index : i
			});
			searchPage.data.forEach(function (result) {
				var temp = {};
              	temp.vendorcode = result.getValue('vendorcode')? result.getValue('vendorcode') : ' ';
              	temp.description = result.getValue('displayname')? result.getValue('displayname') : ' ';
				temp.item_sku = result.getValue('itemid')? result.getValue('itemid') : ' ';
				temp.ogPrice = result.getValue('vendorcost')? result.getValue('vendorcost') : ' ';
				temp.ogCurrency = result.getValue('vendorpricecurrency')? result.getValue('vendorpricecurrency') : ' ';
				temp.vendor = result.getValue('othervendor') || result.getValue('vendor');
              temp.vendordescription = result.getText('othervendor') || result.getText('vendor');
				itemObjArr.push(temp);
			});
		}
		log.debug('Item UPC Array',itemObjArr);
		var filedetails = generateCSV(itemObjArr);
		return filedetails;
    }
    function generateCSV(itemObjArr)
    {
    	//var content = 'SKU,Purchase Price,Purchase Currency,Item Name\n';
    	//var content = 'Vendor Code,Description,SKU Vinoteca,Purchase Price,Purchase Currency,Note\n';
    	 log.debug("generateCSV roleCenter", userObj.roleCenter)
    	var content = (userObj.roleCenter != "VENDOR")?'Vendor Code,Description,SKU Vinoteca,Purchase Price,Note,Vendor ID,Vendor Description\n':'Vendor Code,Description,SKU Vinoteca,Purchase Price,Note\n' ;
    	for(var i=0 ; i<itemObjArr.length ; i++)
    	{
    		//content = content
			// +itemObjArr[i]['item_sku'].toString()+','+itemObjArr[i]['ogPrice']+','+itemObjArr[i]['ogCurrency']+','+itemObjArr[i]['itemName']+'\n';
    		//content = content +itemObjArr[i]['vendorcode'].toString()+','+itemObjArr[i]['description'].toString()+','+itemObjArr[i]['item_sku'].toString()+','+itemObjArr[i]['ogPrice']+','+itemObjArr[i]['ogCurrency']+',\n';
    		if(userObj.roleCenter != "VENDOR"){
    		content = content +((!itemObjArr[i]['vendorcode']||itemObjArr[i]['vendorcode']==' ')?'-':itemObjArr[i]['vendorcode'])+','+itemObjArr[i]['description'].replace(/,/g,"")+','+itemObjArr[i]['item_sku'].toString()+','+itemObjArr[i]['ogPrice']+',-,'+itemObjArr[i]['vendor']+','+itemObjArr[i]['vendordescription'].replace(/,/g,"")+'\n';
            }
          else{
            content = content +itemObjArr[i]['vendorcode'].toString()+','+itemObjArr[i]['description'].replace(",","")+','+itemObjArr[i]['item_sku'].toString()+','+itemObjArr[i]['ogPrice']+',\n';
          }
			log.debug({title: 'VALOR DE CURRENCY EN CURSO: ', details: itemObjArr[i]['ogCurrency']});
    	}
//    	log.debug('content',content);

    	var fileObj = file.create({
    	    name: 'Vendor_Item_'+userObj.id+'.csv',
    	    fileType: file.Type.CSV,
    	    contents: content,
    	    description: 'This is a list of items associated with Vendor.',
    	    folder: -15
    	});
    	var fileId = fileObj.save();

		log.debug({title: 'File URL TEST: ', details: fileObj});

		var filerec = file.load({
			id: 'SuiteScripts/' + fileObj.name
		});
		//log.debug({title: 'FILE LOAD: ', details: filerec});

		log.debug({title: 'File URL: ', details: filerec.url});

		var filecabPath = filerec.url;

    	return {
    		fileid:   fileId,
			filepath: filecabPath
		}
    }
    return {
        onRequest: onRequest
    };
    
});
