	/**
	 * @NApiVersion 2.x
	 * @NScriptType Suitelet
	 * @NModuleScope SameAccount
	 */
	define(['N/search', 'N/ui/serverWidget','N/runtime','N/redirect','N/task'],

		/**
		 * Definition of the Suitelet script trigger point.
		 *
		 * @param {Object} context
		 * @param {ServerRequest} context.request - Encapsulation of the incoming request
		 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
		 * @Since 2015.2
		 */

		/**
		 * @param {search} search
		 * @param {serverWidget} serverWidget
		 * @param {runtime} runtime
		 * @param {redirect} redirect
		 * @param {task} task
		 */
		function(search, serverWidget, runtime, redirect,task) {

			/**
			 * Definition of the Suitelet script trigger point.
			 *
			 * @param {Object} context
			 * @param {ServerRequest} context.request - Encapsulation of the incoming request
			 * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
			 * @Since 2015.2
			 */
			var PAGE_SIZE = 5;
			function onRequest(context) {
				try{
					var request = context.request;
					log.debug({title: 'REQUEST BODY', details:request.parameters});
					var response = context.response;
					var form = serverWidget.createForm({
						title : 'Pricing update interface'
					});
					form.clientScriptModulePath = './efx_pp_item_prices_cl.js';
					if (context.request.method === 'GET')
					{

						var userObj	 = runtime.getCurrentUser();
						var user 	 = userObj.id;
						var vendrSub = userObj.subsidiary;
						log.debug('user:: sub',user+'::'+vendrSub);
						var filters = [];
						var filter;
						var item_category_filter_post 	 = parseInt(request.parameters.category);
						var item_subcategory_filter_post = parseInt(request.parameters.subCategory);
						var item_pagination_filter_post  = parseInt(request.parameters.pageId);
						var hiddenValue 				 = request.parameters.hiddenValue;
						var hiddenSubChk 				 = request.parameters.hiddenSubChk;
						var item_filter_post 			 = request.parameters.item;
						var startDate					 = request.parameters.startDate;
						var endDate						 = request.parameters.endDate;
						if(item_filter_post)
							item_filter_post 			 = item_filter_post.split(/\u0005/);
						log.debug('hiddenValue',hiddenValue);
						filter = search.createFilter({
							name: 'othervendor',
							operator: search.Operator.ANYOF,
							values: user
						});
						filters.push(filter);

						filter = search.createFilter({
							name: 'isinactive',
							operator: search.Operator.IS,
							values: 'F'
						});
						filters.push(filter);
						if(vendrSub)
						{
							filter = search.createFilter({
								name: 'subsidiary',
								operator: search.Operator.ANYOF,
								values: vendrSub
							});
							filters.push(filter);
						}
						var filterGrp = form.addFieldGroup({
							id : 'custpage_filter_group',
							label : 'Filter Group'
						});
						var item_category_filter = form.addField({
							id : 'custpage_item_category_filter',
							type : serverWidget.FieldType.SELECT,
							label : 'Categoría (Category)',
							source : 'customrecord_cseg_efx_sgm_cate',
							container: 'custpage_filter_group'
						});
						if(item_category_filter_post)
						{
							item_category_filter.defaultValue = item_category_filter_post;
							filter = search.createFilter({
								name: 'cseg_efx_sgm_cate',
								operator: search.Operator.ANYOF,
								values: item_category_filter_post
							});
							filters.push(filter);
						}

						var item_subcategory_filter = form.addField({
							id : 'custpage_item_subcategory_filter',
							type : serverWidget.FieldType.SELECT,
							label : 'Subcategoría (Sub-Category)',
							source : 'customrecord_cseg_efx_sgm_subcat',
							container: 'custpage_filter_group'
						});
						if(item_subcategory_filter_post)
						{
							item_subcategory_filter.defaultValue = item_subcategory_filter_post;

							filter = search.createFilter({
								name: 'cseg_efx_sgm_subcat',
								operator: search.Operator.ANYOF,
								values: item_subcategory_filter_post
							});
							filters.push(filter);
						}

						var item_filter = form.addField({
							id : 'custpage_item_filter',
							type : serverWidget.FieldType.MULTISELECT,
							label : 'Artículos (Items)',
							source : 'item',
							container: 'custpage_filter_group'
						});
						log.debug('item_filter_post',item_filter_post);
						if(item_filter_post)
						{
							item_filter.defaultValue = item_filter_post;
							filter = search.createFilter({
								name: 'internalid',
								operator: search.Operator.ANYOF,
								values: item_filter_post
							});
							filters.push(filter);
						}

						var dateGrp = form.addFieldGroup({
							id : 'custpage_date_group',
							label : 'Field Set'
						});
						var stDate = form.addField({
							id: 'custpage_start_date',
							type: serverWidget.FieldType.DATE,
							label: 'Fecha de inicio (Start Date)',
							container: 'custpage_date_group'
						});
						if(startDate)
							stDate.defaultValue = startDate;

						var edDate = form.addField({
							id: 'custpage_end_date',
							type: serverWidget.FieldType.DATE,
							label: 'Fecha de fin (End Date)',
							container: 'custpage_date_group'
						});
						if(endDate)
							edDate.defaultValue = endDate;

						var item_tab = form.addTab({
							id : 'custpage_item_tab',
							label : 'Item Tab'
						});
						var pagination_filter = form.addField({
							id : 'custpage_pagination_filter',
							type : serverWidget.FieldType.SELECT,
							label : 'Paginación (Page ID)',
							container: 'custpage_filter_group'
						});
						pagination_filter.updateLayoutType({
							layoutType: serverWidget.FieldLayoutType.ENDROW
						});
						if(item_pagination_filter_post)
							pagination_filter.defaultValue = item_pagination_filter_post;

						/*
						pagination_filter.updateBreakType({
							breakType : serverWidget.FieldBreakType.STARTROW
						});	*/

						var hidden_search = form.addField({
							id: 'custpage_hidden_search_button',
							type: serverWidget.FieldType.INTEGER,
							label: 'Hidden Button Check'
						}).updateDisplayType({
							//displayType : serverWidget.FieldDisplayType.HIDDEN
							displayType : serverWidget.FieldDisplayType.NORMAL
						});
						hidden_search.defaultValue = 1;
						var hiddenData = form.addField({
							id: 'custpage_hidden_store_value',
							type: serverWidget.FieldType.LONGTEXT,
							label: 'Hidden Store Value'
						}).updateDisplayType({
							//displayType : serverWidget.FieldDisplayType.HIDDEN
							displayType : serverWidget.FieldDisplayType.NORMAL
						});
						if(hiddenValue)
							hiddenData.defaultValue = hiddenValue;
						var hiddenSubmit = form.addField({
							id: 'custpage_hidden_submit_check',
							type: serverWidget.FieldType.TEXT,
							label: 'Submit Button Check'
						}).updateDisplayType({
							//displayType : serverWidget.FieldDisplayType.HIDDEN
							displayType : serverWidget.FieldDisplayType.NORMAL
						});
						if(hiddenSubChk)
							hiddenSubmit.defaultValue = hiddenSubChk;
						var item_sublist = form.addSublist({
							id : 'item_sublist',
							type : serverWidget.SublistType.LIST,
							label : 'Items',
							container: 'custpage_item_tab'
						});
						var item_SKU = item_sublist.addField({
							id: 'custpage_item_sku',
							type: serverWidget.FieldType.TEXT,
							label: 'ID del artículo (SKU)'
						}).updateDisplayType({
							displayType : serverWidget.FieldDisplayType.DISABLED
						});
						var item_Name = item_sublist.addField({
							id: 'custpage_item_name',
							type: serverWidget.FieldType.SELECT,
							label: '(ITEM)',
							source: 'item'
						}).updateDisplayType({
							displayType : serverWidget.FieldDisplayType.HIDDEN
							//displayType : serverWidget.FieldDisplayType.NORMAL
						});
						// var vendor_Code = item_sublist.addField({
						// 	id: 'custpage_vendor_code',
						// 	type: serverWidget.FieldType.TEXT,
						// 	label: 'Código de proveedor (Vendor Code)'
						// }).updateDisplayType({
						// 	displayType : serverWidget.FieldDisplayType.DISABLED
						// });
						var descrip = item_sublist.addField({
							id: 'custpage_item_description',
							type: serverWidget.FieldType.TEXT,
							label: 'Descripción del artículo (Item Description)'
						}).updateDisplayType({
							displayType : serverWidget.FieldDisplayType.DISABLED
						});
						var item_Price = item_sublist.addField({
							id: 'custpage_current_price',
							type: serverWidget.FieldType.TEXT,
							label: 'Precio de compra actual (Current Item Price)'
						}).updateDisplayType({
							displayType : serverWidget.FieldDisplayType.DISABLED
						});
						item_sublist.addField({
							id: 'custpage_item_base_unit',
							type: serverWidget.FieldType.TEXT,
							label: 'Unidad de medida base (Item Base Unit)'
						}).updateDisplayType({
							displayType : serverWidget.FieldDisplayType.DISABLED
						});
						item_sublist.addField({
							id: 'custpage_price_currency',
							type: serverWidget.FieldType.TEXT,
							label: 'Moneda (Price Currency)'
						}).updateDisplayType({
							displayType : serverWidget.FieldDisplayType.DISABLED
						});
						item_sublist.addField({
							id: 'custpage_new_price',
							type: serverWidget.FieldType.CURRENCY,
							label: 'Nuevo precio (New Price)'
						}).updateDisplayType({
							displayType : serverWidget.FieldDisplayType.ENTRY
						});
						var newCurrencyColumn = item_sublist.addField({
							id: 'custpage_new_currency',
							type: serverWidget.FieldType.SELECT,
							label: 'Nueva moneda (New Currency)'
						}).updateDisplayType({
							displayType : serverWidget.FieldDisplayType.ENTRY
						});


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
						var currObj = currSearch();
						vendorCurrencySearchObj.run().each(function(result) {
							// .run().each has a limit of 4,000 results
							newCurrencyColumn.addSelectOption({text: result.getValue({name: 'currency', join: 'vendorcurrencybalance'}) , value: currObj[result.getValue({name: 'currency', join: 'vendorcurrencybalance'})]});
							return true;
						});

						item_sublist.addField({
							id: 'custpage_item_notes',
							type: serverWidget.FieldType.TEXT,
							label: 'Comentarios (Notes)'
						}).updateDisplayType({
							displayType : serverWidget.FieldDisplayType.ENTRY
						});
						form.addButton({
							id : 'search_button',
							label : 'Search',
							functionName:'searchbutton'
						});
						//Inyectar filtro ignorar obsoletos
						filter = search.createFilter({
							name: 'custitem_efx_cmp_tip_art',
							operator: search.Operator.NONEOF,
							values: 2
						});
						filters.push(filter);
						searchRecord(item_sublist,user,request,pagination_filter,filters,hiddenValue, currObj);
						var submitButton = form.addSubmitButton({
							label :'Ejecutar'
						});
						response.writePage(form);
					}
					else
					{
						var category 	 = request.parameters.custpage_item_category_filter;
						var subCategory  = request.parameters.custpage_item_subcategory_filter;
						var item 		 = request.parameters.custpage_item_filter;
						var pageId 		 = request.parameters.custpage_pagination_filter;
						var hiddenButton = request.parameters.custpage_hidden_search_button;
						var hiddenData   = request.parameters.custpage_hidden_store_value;
						var hiddenSubChk = request.parameters.custpage_hidden_submit_check;
						var startDate 	 = request.parameters.custpage_start_date;
						var endDate 	 = request.parameters.custpage_end_date;
						var objParams 	 = {};
						log.debug('category on POST',category);
						log.debug('subCategory on POST',subCategory);
						log.debug('item on POST',item);
						log.debug('item length on POST',item.length);
						log.debug('pageId on POST',pageId);
						log.debug('hiddenButton on POST',hiddenButton);
						log.debug('hiddenData on POST',hiddenData);
						log.debug('hiddenSubChk on POST',hiddenSubChk);
						if(Number(hiddenButton) == 1)
						{
							hiddenData = hiddenData ? JSON.parse(hiddenData) : '';
							hiddenData = removeByAttr(hiddenData, 'nPri', '0.00');

							log.debug('New Hidden Data',hiddenData);
							if(hiddenData.length > 0)
							{
								hiddenData = JSON.stringify(hiddenData);
								log.debug('New Hidden Data2',hiddenData);
								var mrTask = task.create({
									taskType: task.TaskType.MAP_REDUCE,
									scriptId: 'customscript_efx_pp_item_prices_mr',
									deploymentId: 'customdeploy_efx_pp_item_prices_mr',
									params: {
										custscript_efx_pp_item_prices_mr_para: {
											hiddenData: hiddenData,
											startDate: startDate,
											endDate: endDate
										}
									}
								});
								var mrTaskId = mrTask.submit();
								objParams.hiddenSubChk = hiddenSubChk;
							}
							redirect.toSuitelet({
								scriptId: 'customscript_efx_pp_item_prices_sl' ,
								deploymentId: 'customdeploy_efx_pp_item_prices_sl',
								parameters: objParams
							});
						}
						else if(Number(hiddenButton) == 2)//when page is changed
						{
							redirect.toSuitelet({
								scriptId: 'customscript_efx_pp_item_prices_sl' ,
								deploymentId: 'customdeploy_efx_pp_item_prices_sl',
								parameters: {'category':category,'subCategory':subCategory, 'item':item, 'pageId':pageId, 'hiddenValue':hiddenData, 'startDate':startDate, 'endDate':endDate}
							});
						}
						else//when search button is clicked
						{
							redirect.toSuitelet({
								scriptId: 'customscript_efx_pp_item_prices_sl' ,
								deploymentId: 'customdeploy_efx_pp_item_prices_sl',
								parameters: {'category':category,'subCategory':subCategory, 'item':item, 'startDate':startDate, 'endDate':endDate}
							});
						}
	//				response.writePage(form);
					}
				}
				catch(e)
				{
					log.error('Error:',e);
				}
			}

			function searchRecord(item_sublist,user,request,pagination_filter,filters,hiddenValue,currObj)
			{
				var item_ID,vend_Code,description='',purchase_price,bsUnit,currency,item_sku;
				var itemSearchObj = search.create({
					type: "item",
					filters:filters,
					columns:
						[
							search.createColumn({name: "upccode", label: "SKU"}),
							search.createColumn({name: "vendorcode", label: "Vendor Code"}),
							search.createColumn({name: "salesdescription", label: "Description"}),
							search.createColumn({name: "vendorcost", label: "Purchase Price (Foreign Currency)"}),
							search.createColumn({name: "vendorpricecurrency", label: "Vendor Price Currency"}),
							search.createColumn({name: "unitstype", label: "Primary Units Type"}),
							search.createColumn({name: "itemid",label: "Name"})
						]
				});
	//    	var filters = itemSearchObj.filters;
	//    	filters.push(filter);
				log.debug("itemSearchObj",itemSearchObj);

				var searchResultCount = itemSearchObj.runPaged().count;
				log.debug("itemSearchObj result count",searchResultCount);

				//PAGINATION FUNCTION TO DISPLAY THE PAGE INDEX IN SUITELET
				var pageId = parseInt(request.parameters.pageId);
				log.debug('*-/-*/-*/*-/*-/-*/-/pageId', pageId);
				log.debug({title: 'PAGE_SIZE: ' + PAGE_SIZE, details: ''});
				var pageCount = Math.ceil(searchResultCount / PAGE_SIZE);
				log.debug('pageCount',pageCount);

				if (!pageId || pageId == '' || pageId < 0)
					pageId = 0;

				else if (pageId >= pageCount)
					pageId = pageCount - 1;

				log.debug('pageId renewed', pageId);

				if(searchResultCount<=PAGE_SIZE){
					pagination_filter.updateDisplayType({
						//displayType : serverWidget.FieldDisplayType.HIDDEN
						displayType : serverWidget.FieldDisplayType.NORMAL
					});
				}
				for (var i = 0; i < pageCount; i++) {
					if (i == pageId) {
						pagination_filter.addSelectOption({
							value : i,
							text : ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE),
							isSelected : true
						});
					} else {
						pagination_filter.addSelectOption({
							value : i,
							text : ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE)
						});
					}
				}
				var pagedData = itemSearchObj.runPaged({
					pageSize: PAGE_SIZE
				});

				log.debug({title: 'pagedData', details: pagedData});

				var i=0;
				log.debug({title: 'SEARCH RESULT COUNT: ', details: searchResultCount});
				log.debug({title: 'PAGE DATA TO LOOK IN: ', details: pageId});
				if(searchResultCount > 0){
					var searchPage = pagedData.fetch({
						index : pageId
					});

					log.debug({title: 'Entire search page data: ', details: JSON.stringify(searchPage.data) });

					searchPage.data.forEach(function (result) {

						item_sku = result.getValue('upccode')? result.getValue('upccode') : ' ';
						vend_Code = result.getValue('vendorcode') ? result.getValue('vendorcode') : ' ';
						description = result.getValue('salesdescription') ? result.getValue('salesdescription') : ' ';
						purchase_price = Number(result.getValue('vendorcost')? result.getValue('vendorcost') : '0.0');
						bsUnit = result.getText('unitstype') ? result.getText('unitstype') : ' ';
						currency = result.getValue('vendorpricecurrency') ? result.getValue('vendorpricecurrency') : 'USD';
	//				item_ID = result.getValue('itemid') ? result.getValue('itemid') : ' ';
						item_ID = result.id;

	//				log.debug('bsUnit',bsUnit);
	//				log.debug('currency',currency);
						log.debug({title: 'Ahora a poner los valores+++++', details: ''});
						log.debug({title: 'SKU', details: item_sku});
						log.debug({title: 'custpage_item_name', details: item_ID});
						log.debug({title: 'custpage_vendor_code', details: vend_Code});
						log.debug({title: 'custpage_item_description', details: description});
						log.debug({title: 'custpage_current_price', details: purchase_price});
						log.debug({title: 'custpage_item_base_unit', details: bsUnit});
						log.debug({title: 'custpage_price_currency', details: currency});
						log.debug({title: 'custpage_new_price', details: purchase_price});
						log.debug({title: 'custpage_new_currency', details: currObj[currency]});
						item_sublist.setSublistValue({
							id : 'custpage_item_sku',
							line : i,
							value : item_sku
						});
						item_sublist.setSublistValue({
							id : 'custpage_item_name',
							line : i,
							value : item_ID
						});
						item_sublist.setSublistValue({
							id : 'custpage_vendor_code',
							line : i,
							value : vend_Code
						});
	//				log.debug('code set');
						item_sublist.setSublistValue({
							id : 'custpage_item_description',
							line : i,
							value : description
						});
						item_sublist.setSublistValue({
							id : 'custpage_current_price',
							line : i,
							value : purchase_price.toFixed(2)
						});
						item_sublist.setSublistValue({
							id : 'custpage_item_base_unit',
							line : i,
							value : bsUnit
						});
						item_sublist.setSublistValue({
							id : 'custpage_price_currency',
							line : i,
							value : currency
						});
						item_sublist.setSublistValue({
							id : 'custpage_new_price',
							line : i,
							value : purchase_price.toFixed(2)
						});
						item_sublist.setSublistValue({
							id : 'custpage_new_currency',
							line : i,
							value : currObj[currency]
						});

						log.debug({title: 'Terminando de  poner los valores+++++', details: ''});

						if(hiddenValue)
						{
							var hiddenData = JSON.parse(hiddenValue);
							for(var j=0 ; j<hiddenData.length ; j++)
							{
								if(Number(hiddenData[j].item) == Number(item_ID) && hiddenData[j].vCode == vend_Code)
								{
									var newPrice = hiddenData[j].nPri ? hiddenData[j].nPri : ' ';
									var newCurrency = hiddenData[j].nCur ? hiddenData[j].nCur : '0';
									var newNote = hiddenData[j].nNot ? hiddenData[j].nNot : ' ';
									log.debug('newPrice',newPrice+'::'+newCurrency+'::'+newNote);
									item_sublist.setSublistValue({
										id : 'custpage_new_price',
										line : i,
										value : Number(newPrice).toFixed(2)
									});
									item_sublist.setSublistValue({
										id : 'custpage_new_currency',
										line : i,
										value : newCurrency
									});
									item_sublist.setSublistValue({
										id : 'custpage_item_notes',
										line : i,
										value : newNote
									});
	//							log.debug('value set');
									break;
								}
							}
						}
						i++;
					});
				}
			}
			function removeByAttr(arr, attr, value) {
				var i = arr.length;
				while(i--){
					if( arr[i]
						&& arr[i].hasOwnProperty(attr)
						&& (arguments.length > 2 && arr[i][attr] === value ) ){
						arr.splice(i,1);
					}
				}
				return arr;
			}
			function currSearch()
			{
				var currencySearchObj = search.create({
					type: "currency",
					filters:
						[
							["isinactive","is","F"]
						],
					columns:
						[
							search.createColumn({
								name: "name",
								sort: search.Sort.ASC,
								label: "Name"
							}),
							search.createColumn({name: "internalid", label: "Internal ID"})
						]
				});
				var currObj = {};
				currencySearchObj.run().each(function(result){
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
