/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search'], function (nssearch) {
	'use strict';

	var PERCENT = 100.0;

	var self = {
		_getTaxDetailItemsWithRefAsKey: function (txnRecord) {
			var lineCount = txnRecord.getLineCount({
				sublistId: 'taxdetails',
			});
			var taxDetailItems = {};
			var taxItem;
			var taxCode, grossAmount, lineNumber, taxRate, taxAmount;
			var taxDetailsRef, taxBaseAmount;
			for (var idx = 0; idx < lineCount; idx++) {
				lineNumber = txnRecord.getSublistValue({
					sublistId: 'taxdetails',
					fieldId: 'linenumber',
					line: idx,
				});
				taxCode = txnRecord.getSublistValue({
					sublistId: 'taxdetails',
					fieldId: 'taxcode',
					line: idx,
				});
				grossAmount = txnRecord.getSublistValue({
					sublistId: 'taxdetails',
					fieldId: 'grossamount',
					line: idx,
				});
				taxRate = txnRecord.getSublistValue({
					sublistId: 'taxdetails',
					fieldId: 'taxrate',
					line: idx,
				});

				taxDetailsRef = txnRecord.getSublistValue({
					sublistId: 'taxdetails',
					fieldId: 'taxdetailsreference',
					line: idx,
				});

				taxAmount = txnRecord.getSublistValue({
					sublistId: 'taxdetails',
					fieldId: 'taxamount',
					line: idx,
				});
				taxBaseAmount = txnRecord.getSublistValue({
					sublistId: 'taxdetails',
					fieldId: 'taxbasis',
					line: idx,
				});

				taxItem = {
					taxAmount: taxAmount,
					taxCode: taxCode,
					grossAmount: grossAmount,
					taxRate: taxRate ? taxRate : 0,
					lineNumber: lineNumber,
					taxBaseAmount: taxBaseAmount,
				};
				if (!taxDetailItems[taxDetailsRef]) {
					taxDetailItems[taxDetailsRef] = [];
				}
				taxDetailItems[taxDetailsRef].push(taxItem);
			}
			return taxDetailItems;
		},
		_getSuiteTaxItem: function (taxDetail, customItem, suiteTaxWithholdingTaxTypes) {
			var customTaxes = customItem.taxes;
			var taxLineItem = {};

			var taxCodeRecord = nssearch.lookupFields({
				type: nssearch.Type.SALES_TAX_ITEM,
				id: taxDetail.taxCode,
				columns: ['taxtype'],
			});

			log.debug('Tax code record', taxCodeRecord);

			// Set Discount for SuiteTax By Finding Difference
			customItem.totalDiscount = Math.abs(
				taxDetail.taxBaseAmount - customItem.amount
			);
			log.debug('SuiteTax Discount Calculation', customItem.totalDiscount);
			taxLineItem.taxBaseAmount = taxDetail.taxBaseAmount;
			taxLineItem.taxRate = taxDetail.taxRate / PERCENT;
			log.debug('tax rate decimal', taxLineItem.taxRate);
			taxLineItem.taxAmount = taxDetail.taxAmount ? taxDetail.taxAmount : 0.0;
			taxLineItem.taxCode = taxDetail.taxCode;
			taxLineItem.satTaxCodeKey = 'k' + taxDetail.taxCode;
			// taxLineItem.satTaxCode = '002';
			taxLineItem.taxType = taxCodeRecord.taxtype
				? taxCodeRecord.taxtype[0].value
				: null;

			if (suiteTaxWithholdingTaxTypes.indexOf(taxLineItem.taxType) > -1) {
				customTaxes.taxName = 'WITHHOLDING';
				if (!customTaxes.whTaxItems) {
					customTaxes.whTaxItems = [];
				}
				customTaxes.whTaxItems.push(taxLineItem);
			} else {
				customTaxes.taxName = 'TRANSFERS';
				if (!customTaxes.taxItems) {
					customTaxes.taxItems = [];
				}
				customTaxes.taxItems.push(taxLineItem);
			}

			customTaxes.taxAmount = taxDetail.taxAmount ? taxDetail.taxAmount : 0.0;
			customItem.taxes = customTaxes;
		},
		addTaxes: function (customItem, txnRecord, line, suiteTaxWithholdingTaxTypes) {
			var taxDetails = self._getTaxDetailItemsWithRefAsKey(txnRecord);
			log.debug('Tax Details', taxDetails);

			var taxDetailsRef = txnRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'taxdetailsreference',
				line: line,
			});
			var lineCount = txnRecord.getLineCount({
				sublistId: 'taxdetails',
			});

			for (var idx=0; idx<lineCount; idx++) {
				if (taxDetails[taxDetailsRef][idx]) {
					self._getSuiteTaxItem(taxDetails[taxDetailsRef][idx], customItem, suiteTaxWithholdingTaxTypes);
				}
			}
		},
	};

	return {
		addTaxes: self.addTaxes,
		_test_module: self,
	};
});
