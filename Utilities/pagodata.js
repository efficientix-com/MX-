/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/runtime'], function (search, runtime) {
	'use strict';

	function PagoDeCliente (recordObj, resultado,codigosSat) {
		this.recordObj = recordObj;
		this.resultado = resultado;
		this.codigosSat = codigosSat;
		this.monedas = {};
	}

	PagoDeCliente.prototype._getCurrencySymbol = function (id) {
		if (!id) {
			return;
		}
		var currencyId = id + '';
		var currency = this.monedas[currencyId];
		if (currency) {
			return currency.symbol;
		}
		currency = search.lookupFields({
			id: currencyId,
			type: 'currency',
			columns: ['symbol'],
		});
		this.monedas[currencyId] = currency;
		return currency.symbol;
	};

	PagoDeCliente.prototype._getTransactionOrder = function (appliedTxns,id_transaccion) {

		var idFacturas = new Array();

		var aux = ["appliedtotransaction","anyof"];
		for(var i=0;i<appliedTxns.length;i++){
			idFacturas.push(appliedTxns[i].internalid);
			aux.push(appliedTxns[i].internalid);
		}

		var customerpaymentSearchObj = search.create({
			type: "customerpayment",
			filters:
				[
					["type", "anyof", "CustPymt"],
					"AND",
					aux,
					"AND",
					["appliedtotransaction","noneof","@NONE@"]

				],
			columns:
				[
					search.createColumn({name: "ordertype", label: "Tipo de orden de compra"}),
					search.createColumn({name: "mainline", label: "*"}),
					search.createColumn({name: "trandate", label: "Fecha"}),
					search.createColumn({name: "asofdate", label: "Fecha inicial"}),
					search.createColumn({name: "postingperiod", label: "Período"}),
					search.createColumn({name: "taxperiod", label: "Período fiscal"}),
					search.createColumn({name: "type", label: "Tipo"}),
					search.createColumn({name: "appliedtotransaction", sort: search.Sort.ASC, label: "Aplicado a la transacción"}),
					search.createColumn({name: "trandate", sort: search.Sort.ASC, label: "Número de documento"}),
					search.createColumn({name: "internalid", label: "Número de documento"}),

					search.createColumn({name: "tranid", join: "appliedtotransaction", label: "Aplicado a la transacción"}),
					search.createColumn({name: "tranid", label: "Número de documento"}),
					search.createColumn({name: "amount", join: "appliedtotransaction", label: "Aplicado a la transacción"}),
					search.createColumn({name: "amount", label: "Importe"}),
					search.createColumn({name: "appliedtolinkamount", label: "Aplicado al importe de vínculo"}),

				]
		});

		var srchPaged = customerpaymentSearchObj.runPaged({pageSize: 1000});
		var jsontransactions = {};
		srchPaged.pageRanges.forEach(function(pageRange){
			var myPage = srchPaged.fetch({index: pageRange.index});
			myPage.data.forEach(function(result) {
				var invoiceid = result.getValue({name: "appliedtotransaction", sort: search.Sort.ASC, label: "Aplicado a la transacción"})*1;
				var paymenttranid = result.getValue({name: "tranid", label: "Número de documento"});
				var invoiceamount = result.getValue({name: "amount", join: "appliedtotransaction", label: "Aplicado a la transacción"});
				var amount = result.getValue({name: "appliedtolinkamount", label: "Aplicado al importe de vínculo"});
				var paymentid = result.id;
				var paymenttext = result.getText({name: "appliedtotransaction", sort: search.Sort.ASC, label: "Aplicado a la transacción"});

				if(!jsontransactions[invoiceid]){
					jsontransactions[invoiceid] = {"payments":{}};
					jsontransactions[invoiceid]["consecutive"] = 0;
					jsontransactions[invoiceid]["amount"] = invoiceamount;
					jsontransactions[invoiceid]["insoluteamount"] = invoiceamount;
					jsontransactions[invoiceid]["insoluteamount"] = invoiceamount;
				}
				jsontransactions[invoiceid]["consecutive"]++;
				jsontransactions[invoiceid]["id"] =invoiceid;


				if(!jsontransactions[invoiceid]["payments"][paymentid]){
					var insolute = Math.round(jsontransactions[invoiceid]["insoluteamount"]*100)/100;
					jsontransactions[invoiceid]["payments"][paymentid] = {"paymenttranid": paymenttranid, "paymentid": paymentid, "paymenttext": paymenttext, "consecutive": jsontransactions[invoiceid]["consecutive"], "amount": amount, "insoluteamount": insolute};
				}

				jsontransactions[invoiceid]["insoluteamount"] -= (amount*1 < 0)? amount *-1: amount*1;

				return true;
			});
			return true;
		});

		log.debug("reduce jsontransactions", jsontransactions);
		var paymentarray = [];
		var key = (id_transaccion+"");
		log.debug("reduce reduceContext.key", id_transaccion);

		for(var i in jsontransactions){
			//log.debug("reduce i", i);
			var invoicedata = jsontransactions[(i+"")];
			//log.debug("reduce invoicedata", invoicedata);


			var paymentdata = invoicedata.payments[key];
			//log.debug("reduce paymentdata", paymentdata);
			var paymentdatasplit = paymentdata.paymenttext.split("#");
			// log.debug("reduce paymentdatasplit", paymentdatasplit);
			var reference = paymentdatasplit[1];
			paymentarray.push({"facturaId": invoicedata.id,"facturaRef":reference,"parcialidad":paymentdata.consecutive*1,"imp":paymentdata.insoluteamount*1});
			for(var x=0;x<appliedTxns.length;x++){
				if(appliedTxns[x].internalid==invoicedata.id){
					appliedTxns[x].facturaId = invoicedata.id;
					appliedTxns[x].facturaRef = reference;
					appliedTxns[x].parcialidad = paymentdata.consecutive*1;
					appliedTxns[x].imp = paymentdata.insoluteamount*1;
				}
			}
		}
		return appliedTxns;

		// var customerpaymentSearchObj = search.create({
		// 	type: search.Type.CUSTOMER_PAYMENT,
		// 	filters: [
		// 		['type', 'anyof', 'CustPymt'],
		// 		'AND',
		// 		['appliedtotransaction.internalid', 'anyof', txnId],
		// 		'AND',
		// 		['custbody_mx_cfdi_uuid', 'isnotempty', ''],
		// 	],
		// });
		// var searchResultCount = customerpaymentSearchObj.runPaged().count;
		// var nextSequenceNumber = searchResultCount + 1;
		//return nextSequenceNumber;
	};

	function _getCurrencyEnvField (field) {
		if (
			runtime.isFeatureInEffect({
				feature: 'multicurrency',
			})
		) {
			return 'fx' + field;
		} else {
			return field;
		}
	}

	PagoDeCliente.prototype.obtenAplicado = function (sublistId,id_transaccion) {
		var appliedTxnsCount = this.recordObj.getLineCount({
			sublistId: sublistId,
		});

		log.debug('Applied transactions count ::' + sublistId, appliedTxnsCount);
		var appliedTxns = [];
		var columns;
		var txn;
		var paymentTerm;
		var isApplied;

		var amountremainingField = _getCurrencyEnvField('amountremaining');
		if (sublistId === 'apply') {
			columns = [
				'custbody_mx_cfdi_uuid',
				'custbody_mx_cfdi_serie',
				'custbody_mx_cfdi_folio',
				'internalid',
				'custbody_mx_txn_sat_payment_term',
				amountremainingField,
			];
		}

		var multicurrenci = false;
		if (this.resultado.multiCurrencyFeature) {
			columns.push('currency');
			multicurrenci=true;
		}
		var idfacturaslinea = new Array();
		var datafacturaslinea = new Array();
		for (var idx = 0; idx < appliedTxnsCount; idx++) {
			isApplied = this.recordObj.getSublistValue({
				fieldId: 'apply',
				sublistId: sublistId,
				line: idx,
			});

			if (!isApplied) {
				continue;
			}
			idfacturaslinea.push(this.recordObj.getSublistValue({
				fieldId: 'internalid',
				sublistId: sublistId,
				line: idx,
			}));
		}
		log.audit({title:'idfacturaslinea',details:idfacturaslinea});

		var buscalineasfacturas = search.create({
			type:search.Type.TRANSACTION,
			filters:[['internalid',search.Operator.ANYOF,idfacturaslinea],'AND',['mainline',search.Operator.IS,'T']],
			columns: columns,
		});

		buscalineasfacturas.run().each(function(result) {
			var objetolinea = {
				custbody_mx_cfdi_uuid:'',
				custbody_mx_cfdi_serie:'',
				custbody_mx_cfdi_folio:'',
				internalid:'',
				custbody_mx_txn_sat_payment_term:'',
				currency:'',
			}
			objetolinea.custbody_mx_cfdi_uuid = result.getValue({name: 'custbody_mx_cfdi_uuid'}) || '';
			objetolinea.custbody_mx_cfdi_serie = result.getValue({name: 'custbody_mx_cfdi_serie'}) || '';
			objetolinea.custbody_mx_cfdi_folio = result.getValue({name: 'custbody_mx_cfdi_folio'}) || '';
			objetolinea.internalid = result.getValue({name: 'internalid'}) || '';
			objetolinea.custbody_mx_txn_sat_payment_term = result.getValue({name: 'custbody_mx_txn_sat_payment_term'}) || '';
			if (multicurrenci) {
				objetolinea.currency = result.getValue({name: 'currency'}) || '';
			}
			objetolinea[amountremainingField] = result.getValue({name: amountremainingField}) || 0;
			if(objetolinea[amountremainingField]=='.00'){
				objetolinea[amountremainingField]=0;
			}
			datafacturaslinea.push(objetolinea);
			return true;
		});
		log.audit({title:'datafacturaslinea',details:datafacturaslinea});

		var txnLookupObj = {
			type: search.Type.TRANSACTION,
			columns: columns,
		};


		for (var idx = 0; idx < appliedTxnsCount; idx++) {
			isApplied = this.recordObj.getSublistValue({
				fieldId: 'apply',
				sublistId: sublistId,
				line: idx,
			});

			if (!isApplied) {
				continue;
			}
			var idfact = this.recordObj.getSublistValue({
				fieldId: 'internalid',
				sublistId: sublistId,
				line: idx,
			});

			// txnLookupObj.id = this.recordObj.getSublistValue({
			// 	fieldId: 'internalid',
			// 	sublistId: sublistId,
			// 	line: idx,
			// });
			// txn = search.lookupFields(txnLookupObj);
			for(var x=0;x<datafacturaslinea.length;x++){
				if(idfact==datafacturaslinea[x].internalid){
					txn = datafacturaslinea[x];

					// Since the FTL template renders the Serie and Folio fields in the Generated XML even though their value is ''(null), we need to delete the keys from the object as below.
					if (!txn['custbody_mx_cfdi_folio']) {
						delete txn['custbody_mx_cfdi_folio'];
					}
					if (!txn['custbody_mx_cfdi_serie']) {
						delete txn['custbody_mx_cfdi_serie'];
					}

					txn.id = txn.internalid;
					paymentTerm = txn['custbody_mx_txn_sat_payment_term'] ? txn['custbody_mx_txn_sat_payment_term'] : null;

					txn.paymentTerm = this.codigosSat.getPaymentTerm(
						paymentTerm,
						txn.internalid
					);
					if (txn.currency) {
						txn.currencysymbol = txn.currency ? this._getCurrencySymbol(txn.currency) : null;
					}
					txn.line = idx;
					txn.sublistId = sublistId;
					// txn.order = this._getTransactionOrder(txn.id);
					txn.order = '';
					txn.amountdue = txn[amountremainingField] ? parseFloat(txn[amountremainingField]) : 0.0;

					appliedTxns.push(txn);

				}
			}

		}

		appliedTxns = this._getTransactionOrder(appliedTxns,id_transaccion);

		return appliedTxns;
	};

	function obtenerDatos(recordObj, resultado,codigosSat) {
		return new PagoDeCliente(recordObj, resultado,codigosSat);
	};

	return {
		obtenerDatos: obtenerDatos,
	};
});