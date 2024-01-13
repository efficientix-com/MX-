/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/format'], function (nssearch, nsformat) {
	var WITHHOLDING = {
		TAX_CODE_FIELDS: {
			RATE: 'custrecord_4601_wtc_rate',
			NAME: 'custrecord_4601_wtc_name',
			TYPE: 'custrecord_4601_wtc_witaxtype',
		},
		TAX_GROUP_FIELDS: {
			GROUP_TAX_CODE: 'custrecord_4601_gwtc_group',
			ITEM_TAX_CODE: 'custrecord_4601_gwtc_code',
		},
		RECORD: {
			TAX_CODE: 'customrecord_4601_witaxcode',
			TAX_GROUP: 'customrecord_4601_groupedwitaxcode',
		},
	};

	var self = {
		_getWithHoldingChildTaxItemsIfGroup : function (taxCode) {
			var taxItems = [];
			log.debug('WH tax code', taxCode);
			var withHoldGroupSearch = nssearch.create({
				type: WITHHOLDING.RECORD.TAX_GROUP,
				filters: [
					{
						name: WITHHOLDING.TAX_GROUP_FIELDS.GROUP_TAX_CODE,
						operator: 'anyof',
						values: [taxCode],
					},
				],
				columns: [
					{
						name: WITHHOLDING.TAX_GROUP_FIELDS.ITEM_TAX_CODE,
					},
					{
						name: WITHHOLDING.TAX_CODE_FIELDS.NAME,
						join: WITHHOLDING.TAX_GROUP_FIELDS.ITEM_TAX_CODE,
					},
					{
						name: WITHHOLDING.TAX_CODE_FIELDS.RATE,
						join: WITHHOLDING.TAX_GROUP_FIELDS.ITEM_TAX_CODE,
					},
					{
						name: WITHHOLDING.TAX_CODE_FIELDS.TYPE,
						join: WITHHOLDING.TAX_GROUP_FIELDS.ITEM_TAX_CODE,
					},
					{
						name: 'internalid',
						join: WITHHOLDING.TAX_GROUP_FIELDS.ITEM_TAX_CODE,
					},
				],
			});
			var taxItem;
			withHoldGroupSearch.run().each(function (row) {
				taxItem = {
					rate: row.getValue({
						name: WITHHOLDING.TAX_CODE_FIELDS.RATE,
						join: WITHHOLDING.TAX_GROUP_FIELDS.ITEM_TAX_CODE,
					}),
					taxtype: row.getValue({
						name: WITHHOLDING.TAX_CODE_FIELDS.TYPE,
						join: WITHHOLDING.TAX_GROUP_FIELDS.ITEM_TAX_CODE,
					}),
					itemid: row.getValue({
						name: WITHHOLDING.TAX_CODE_FIELDS.NAME,
						join: WITHHOLDING.TAX_GROUP_FIELDS.ITEM_TAX_CODE,
					}),
					id: row.getValue({
						name: 'internalid',
						join: WITHHOLDING.TAX_GROUP_FIELDS.ITEM_TAX_CODE,
					}),
				};
				taxItems.push(taxItem);
				return true;
			});
	
			log.debug('WH tax group items', taxItems);
	
			if (taxItems.length > 0) {
				return taxItems;
			}
	
			var whTaxCodeRecord = nssearch.lookupFields({
				type: WITHHOLDING.RECORD.TAX_CODE,
				id: taxCode,
				columns: [
					WITHHOLDING.TAX_CODE_FIELDS.NAME,
					WITHHOLDING.TAX_CODE_FIELDS.TYPE,
					WITHHOLDING.TAX_CODE_FIELDS.RATE,
				],
			});
			var taxType = whTaxCodeRecord[WITHHOLDING.TAX_CODE_FIELDS.TYPE];
			return [
				{
					rate: whTaxCodeRecord[WITHHOLDING.TAX_CODE_FIELDS.RATE],
					taxtype: taxType?taxType[0].value:null,
					itemid: whTaxCodeRecord[WITHHOLDING.TAX_CODE_FIELDS.NAME],
					id: taxCode,
				},
			];
		},
		addTaxes : function (customItem, txnRecord, line) {
			var customTaxes = customItem.taxes;
			var taxCode = txnRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_4601_witaxcode',
				line: line,
			});
			var taxItems = self._getWithHoldingChildTaxItemsIfGroup(taxCode);
			var taxLineItem = {};
			var taxLineItems = customTaxes.whTaxItems;
			var grossAmount = txnRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_4601_witaxbaseamount',
				line: line,
			});
			var taxAmount = txnRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_4601_witaxamount',
				line: line,
			});
			var taxBaseAmount = Math.abs(grossAmount) - customItem.whDiscountBaseAmount;
			taxItems.map(function (val) {
				taxLineItem = {};
			
				var taxRatePercent = nsformat.parse({
					type: nsformat.Type.PERCENT,
					value: val.rate ? val.rate : 0.0,
				});
				// eslint-disable-next-line no-magic-numbers
				taxLineItem.taxRate = taxRatePercent / 100;
				taxLineItem.taxBaseAmount = taxBaseAmount;
				taxLineItem.taxCode = val.itemid;

				taxLineItem.taxType = val.taxtype;
				taxLineItem.id = val.id;
				taxLineItems.push(taxLineItem);
			});

			customTaxes.taxName = 'WITHHOLDING';
			customTaxes.taxAmount = taxAmount ? Math.abs(taxAmount) : 0.0;
			customTaxes.whTaxItems = taxLineItems;
			log.debug('WH Taxes', customTaxes);
		},
	};

	

	

	return {
		addTaxes: self.addTaxes,
		_test_module : self,
	};
});
