/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/ui/serverWidget', 'N/search', 'N/email'],
	/**
	 * @param {record} record
	 * @param {serverWidget} serverWidget
	 */
	function(record, serverWidget, search, email) {
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {string} scriptContext.type - Trigger type
		 * @param {Form} scriptContext.form - Current form
		 * @Since 2015.2
		 */
		function beforeLoad(scriptContext) {
			try {
				log.debug('run');
				var form = scriptContext.form;
				form.clientScriptModulePath = './efx_pp_purchase_price_approval_cs.js';
				var ppRecord = scriptContext.newRecord;
				var status = ppRecord.getValue({
					fieldId: 'custrecord_efx_pp_status_request'
				});
				if (status == '1' && scriptContext.type == 'view') {
					var Obj = {};
					Obj.maxAmt = ppRecord.getValue({
						fieldId: 'custrecord_efx_pp_max_amount'
					});
					Obj.rejReason = ppRecord.getValue({
						fieldId: 'custrecord_efx_pp_reject_reasons'
					});
					Obj.startDate = ppRecord.getValue({
						fieldId: 'custrecord_efx_pp_date_start'
					});
					Obj.endDate = ppRecord.getValue({
						fieldId: 'custrecord_efx_pp_date_end'
					});
					Obj.ppId = ppRecord.id;
					var appButton = form.addButton({
						id: 'custpage_button_approve_button',
						label: 'Aprobar (Approve)',
						functionName: 'approveFunction(' + JSON.stringify(Obj) + ')'
					});
					var rejButton = form.addButton({
						id: 'custpage_button_reject_button',
						label: 'Rechazar (Reject)',
						functionName: 'rejectFunction(' + JSON.stringify(Obj) + ')'
					});
				}
			} catch (e) {
				log.error('ERROR:', e);
			}
		}
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function beforeSubmit(scriptContext) {

		}
		/**
		 * Function definition to be triggered before record is loaded.
		 *
		 * @param {Object} scriptContext
		 * @param {Record} scriptContext.newRecord - New record
		 * @param {Record} scriptContext.oldRecord - Old record
		 * @param {string} scriptContext.type - Trigger type
		 * @Since 2015.2
		 */
		function afterSubmit(scriptContext) {
						var old_rec = scriptContext.oldRecord;
						var new_rec = scriptContext.newRecord;
						var new_rec_id = new_rec.id;

						//If record already existed. Helps avoiding issues when record is first created
						if(old_rec){
							//Get status of old record
							var oldStatus = old_rec.getValue('custrecord_efx_pp_status_request');
							log.debug({title: 'Previous status' + oldStatus, details: ''});
						}
						
						//Get status of new record
						var newStatus = new_rec.getValue('custrecord_efx_pp_status_request');
						log.debug({title: 'New  status' + newStatus, details: ''});

						//If record was in draft and changed to approved status then send email to vendor...
						if(oldStatus == 3 && newStatus == 1){
							var head_fields = build_email_head_content(new_rec_id);
							var items_table = build_email_table_content(new_rec_id);
							log.debug({title: 'ARRAY DE OBJETOS DEVUELTOS LINEA 97', details: items_table});
							//Get vendor email to use in the "Recipient" field
							var vendEmail = search.lookupFields({
								type: search.Type.VENDOR,
								id: head_fields.vendor,
								columns: ['email']
							});
							var vendorEmail = vendEmail.email;

							sendVendEmail(vendorEmail,head_fields,items_table);
						}


						// try {
						// 	var bodyContent = '<html> <head>' +
						// 		'<style>\n' +
						// 		'th {\n' +
						// 		'  font-weight: bold;\n' +
						// 		'background-color: #e0e0e0' +
						// 		'}\n' +
						// 		'\n' +
						// 		'th, td {\n' +
						// 		'  padding: 10px;\n' +
						// 		'}\n' +
						// 		'</style>' +
						//
						// 		'Vendor: Test Test' +
						// 		'<br>' +
						// 		'Request date: Test Test' +
						// 		'<br>' +
						// 		'Start date: Test Test' +
						// 		'<br>' +
						// 		'End date: Test Test' +
						// 		'<br>' +
						// 		'</head>' +
						// 		'<body>' +
						// 		'<br><br>' +
						// 		'<table>' +
						// 		'<tr>' +
						// 		'<th>Desciption</th>' +
						// 		'<th>Price</th>' +
						// 		'<th>Previous price</th>' +
						// 		'<th>Currency</th>' +
						// 		'<th>Notes</th>' +
						// 		'</tr>' +
						// 		'' +
						// 		'' +
						// 		'<tr>' +
						// 		'<td>Descripcion de prueba</td>' +
						// 		'<td>8981.00</td>' +
						// 		'<td>1000.00</td>' +
						// 		'<td>USD</td>' +
						// 		'<td>bla bla bla bla bla bla bla bla bla bla</td>' +
						// 		'</tr>' +
						// 		'' +
						// 		'' +
						// 		'</table>' +
						// 		'</body>' +
						// 		'' +
						// 		'' +
						// 		'' +
						// 		' </html>';
						//
						// 	email.send({
						// 		author: '72685',
						// 		recipients: 'nicolas.castillo@tekiio.mx',
						// 		subject: 'Your purchase price request has been submitted. ',
						// 		body: bodyContent
						// 	});
						// 	log.debug({title: 'EMAIL SENT...', details: ''});
						// }catch (e) {
						// 	log.debug({title: 'ERROR MAIL: ' + e, details: ''});
						// }




		}

		/**
		 * Function for retreiving the values for all fields to be sent via email to vendor..
		 * @param {integer} pp_id Contains id of newly created PP - Purchase prices record
		 * @returns {object} Object containing general fields for record.
		 */

		function build_email_head_content(pp_id){
			log.audit({title: 'BUILDING EMAIL HEAD CONTENT...', details: ''});
			var email_head_vals = {
				vendor : '',
				requestDate : '',
				startDate : '',
				endDate : ''
			}

			var pp_pp_vals = search.lookupFields({
				type: 'customrecord_efx_pp_purchase_prices',
				id: pp_id,
				columns: ['custrecord_efx_pp_date_request', 'custrecord_efx_pp_vendor','custrecord_efx_pp_date_start','custrecord_efx_pp_date_end']
			});

			email_head_vals.vendor = pp_pp_vals.custrecord_efx_pp_vendor[0].value;
			email_head_vals.requestDate = pp_pp_vals.custrecord_efx_pp_date_request;
			email_head_vals.startDate = pp_pp_vals.custrecord_efx_pp_date_start;
			email_head_vals.endDate = pp_pp_vals.custrecord_efx_pp_date_end;

			return email_head_vals;

		}

		/**
		 * Function for retreiving array of objects containing required values for every item related to this
		 * Purchase Price record.
		 * @param {integer} pp_id Contains id of newly created PP - Purchase prices record
		 * @returns {array} Array of objects with values for all items.
		 */

		function build_email_table_content(pp_id){
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
					notes : ''
				}


				// Add values to object and then add object to array...
				itemsObj.itemDescr = result.getValue('custrecord_efc_pp_it_desc');
				itemsObj.itemPrice = result.getValue('custrecord_efx_pp_price');
				itemsObj.prevPrice = result.getValue('custrecord_efx_pp_prev_price');
				itemsObj.currency = result.getText('custrecord_efx_pp_currency');
				itemsObj.notes = result.getValue('custrecord_efx_pp_notes');

				itemVals.push(itemsObj);

				return true;
			});

			return itemVals;

			log.debug({title: 'Array de objetos: ', details: itemVals});
		}

		/**
		 * Function for sending email to vendor when he's submitted a Purchase Price record for review
		 * @param {string} vendEmail - Email address for the vendor.
		 * @param {Object} headFields - General values for email body.
		 * @param {Array} itemsTable - Array of objects, one object for each item.
		 * @returns {Boolean} Email sent
		 */

		function sendVendEmail(vendEmail, headFields, itemsTable){
			log.audit({title: 'Sending email...', details: ''});

			//Hard coded values for testing purposes
			var vendEmail = 'nicolas.castillo@tekiio.mx';
			var author = '72685';
			var subject = 'Your purchase pricing request has been submitted.';

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
				bodyContent += 'Request date: ' + headFields.requestDate +
				'<br>' +
				'Start date: ' + headFields.startDate +
				'<br>' +
				'End date: ' + headFields.endDate +
				'<br>' +
				'</head>' +
				'<body>' +
				'<br><br>' +
				'<table>' +
				'<tr>' +
				'<th>Desciption</th>' +
				'<th>Price</th>' +
				'<th>Previous price</th>' +
				'<th>Currency</th>' +
				'<th>Notes</th>' +
				'</tr>';

			log.debug({title: 'ARREGLO DE OBJETOS A RECORRER: ', details: itemsTable});
			log.debug({title: 'Length : ', details: itemsTable.length});

			//Iterate through array of objects, printing a new row for each object

			for(i=0;i<itemsTable.length;i++){

				bodyContent += '<tr> ' +
					'<td>' + itemsTable[i].itemDescr + '</td>' +
					'<td>' + itemsTable[i].itemPrice + '</td>' +
					'<td>' + itemsTable[i].prevPrice + '</td>' +
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


		}

		return {
			beforeLoad: beforeLoad,
			//        beforeSubmit: beforeSubmit,
			afterSubmit: afterSubmit
		};
	});