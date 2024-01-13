/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
	'N/search',
	'N/format',
	'N/record',
], function (
	nssearch,
	nsformat,
	nsrecord
) {
	'use strict';
  
	
	
	var self = { 
		addTaxes : function (customItem, txnRecord, line,tipo_transaccion_gbl) {
			var customTaxes = customItem.taxes;
			log.debug('tipo_transaccion_gbl_tax',tipo_transaccion_gbl);
			if(tipo_transaccion_gbl){
				var taxCode = txnRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'custcol_efx_fe_gbl_taxcode',
					line: line,
				});
			}else{
				var taxCode = txnRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'taxcode',
					line: line,
				});
			}

			if(!tipo_transaccion_gbl) {
				var taxItems = self._getLegacyChildTaxItemsIfGroup(taxCode, tipo_transaccion_gbl);
				log.debug('Taxitems', taxItems);
				var taxAmount = txnRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'tax1amt',
					line: line,
				});

				var taxLineItems = customTaxes.taxItems;
				var taxLineItem;
				taxItems.map(function (val) {
					taxLineItem = {};


					var taxRatePercent = nsformat.parse({
						type: nsformat.Type.PERCENT,
						value: val.rate ? val.rate : 0.0,
					});

					taxLineItem.taxType = val.taxtype ? val.taxtype[0].value : null;
					// eslint-disable-next-line no-magic-numbers
					taxLineItem.taxRate = taxRatePercent / 100.0;
					taxLineItem.taxBaseAmount = customItem.amount;
					log.debug('Setting tax base amount', val.itemid + '_' + line + '_' + taxLineItem.taxBaseAmount);
					taxLineItem.taxCode = val.itemid;
					taxLineItem.satTaxCodeKey = 'k' + val.itemid;
					taxLineItem.exempt = val.exempt;


					taxLineItems.push(taxLineItem);
				});
				customTaxes.taxName = 'TRANSFERS';
				customTaxes.taxAmount = taxAmount;
				customItem.taxes = customTaxes;
			}
		}
		,
		_getLegacyChildTaxItemsIfGroup : function (taxCode,tipo_transaccion_gbl) {
			var taxGroup;
			var taxCodeRecord = nssearch.lookupFields({
				type: nssearch.Type.SALES_TAX_ITEM,
				id: taxCode,
				columns: ['exempt', 'rate', 'itemid','taxtype', 'internalid'],
			});
			log.debug('Tax Code record', taxCodeRecord);
			if (taxCodeRecord && taxCodeRecord['itemid']) {
				return [taxCodeRecord];
			}
		
			taxGroup = nsrecord.load({
				type: 'taxgroup',
				id: taxCode,
			});
		
			var taxItems = [];
			var lineCount = taxGroup.getLineCount({
				sublistId: 'taxitem',
			});
			var taxItemKey;
			for (var idx = 0; idx < lineCount; idx++) {
				taxItemKey = taxGroup.getSublistValue({
					sublistId: 'taxitem',
					fieldId: 'taxitemnkey',
					line: idx,
				});
				
				log.debug('Tax item key', taxItemKey);		
				taxItems.push(nssearch.lookupFields({
					type: nssearch.Type.SALES_TAX_ITEM,
					id: taxItemKey,
					columns: ['exempt', 'rate', 'itemid', 'taxtype', 'internalid'],
				}));
			}
		
			return taxItems;
		},
	};
  
	return {
		addTaxes: self.addTaxes,
		_test_module : self,
	};
});
  