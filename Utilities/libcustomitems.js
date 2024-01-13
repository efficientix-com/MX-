/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    './withholdingTax',
    './suiteTax',
    './legacyTax',

], function (withholdingTax, suiteTax, legacyTax) {
    'use strict';

    var self = {
        _isItemfulfillment: function (txnRecord) {
            return txnRecord.type === 'itemfulfillment';
        },

        _getAmount: function (txnRecord, line) {
            if (self._isItemfulfillment(txnRecord)) {
                return 0.0;
            }
            return txnRecord.getSublistValue({
                fieldId: 'amount',
                sublistId: 'item',
                line: line,
            });
        },

        _getUnit: function (txnRecord, line) {
            return txnRecord.getSublistValue({
                fieldId: 'units',
                sublistId: 'item',
                line: line,
            });
        },

        _getUnitText: function (txnRecord, line) {
            return txnRecord.getSublistValue({
                fieldId: 'unitsdisplay',
                sublistId: 'item',
                line: line,
            });
        },

        _getQuantity: function (txnRecord, line) {
            if (self._isItemfulfillment(txnRecord)) {
                return 0.0;
            }
            return txnRecord.getSublistValue({
                fieldId: 'quantity',
                sublistId: 'item',
                line: line,
            });
        },

        _getUnitPrice: function (txnRecord, line) {
            if (self._isItemfulfillment(txnRecord)) {
                return 0.0;
            }
            return txnRecord.getSublistValue({
                fieldId: 'rate',
                sublistId: 'item',
                line: line,
            });
        },

        _getItemId: function (txnRecord, line) {
            return (
                txnRecord.getSublistValue({
                    fieldId: 'item',
                    sublistId: 'item',
                    line: line,
                }) + ''
            );
        },

        _addTaxes: function (customItem, result, txnRecord, line,tipo_transaccion_gbl) {
            if (self._isItemfulfillment(txnRecord)) {
                return;
            }
            if (result.suiteTaxFeature) {
                suiteTax.addTaxes(customItem, txnRecord, line, result.suiteTaxWithholdingTaxTypes);
            } else if (customItem.isWhtaxApplied) {
                withholdingTax.addTaxes(customItem, txnRecord, line);
                legacyTax.addTaxes(customItem, txnRecord, line);
            } else {
                legacyTax.addTaxes(customItem, txnRecord, line,tipo_transaccion_gbl);
            }
        },

        _applyLineDiscount: function (result, customItem, txnRecord, line,
            lineCount
        ) {
            var discountsApplied = 0;
            if (txnRecord.type === 'itemfulfillment') {
                return { discountsApplied: discountsApplied };
            }
            var lineItemType;
            var whDiscountBaseAmount, discountAmount, taxDiscountAmount;
            for (var index = line + 1; index < lineCount; index++) {
                lineItemType = txnRecord.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'itemtype',
                    line: index,
                });
                if (lineItemType !== 'Discount') {
                    return { discountsApplied: discountsApplied };
                }

                if (customItem.isWhtaxApplied) {
                    whDiscountBaseAmount = txnRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_4601_witaxbaseamount',
                        line: index,
                    });
                    whDiscountBaseAmount = whDiscountBaseAmount
                        ? whDiscountBaseAmount
                        : 0.0;
                    discountAmount = txnRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: index,
                    });

                    customItem.whDiscountBaseAmount
                        = customItem.whDiscountBaseAmount + Math.abs(whDiscountBaseAmount);
                    customItem.discount = customItem.discount + Math.abs(discountAmount);
                    customItem.taxDiscount = 0;
                } else if (!result.suiteTaxFeature) {
                    discountAmount = txnRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: index,
                    });
                    taxDiscountAmount = txnRecord.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'tax1amt',
                        line: index,
                    });
                    customItem.discount = customItem.discount + Math.abs(discountAmount);
                    customItem.taxDiscount
                        = customItem.taxDiscount + Math.abs(taxDiscountAmount);
                }
                discountsApplied++;
            }
            return { discountsApplied: discountsApplied };
        },

        _createCustomItem: function (txnRecord, itemType, idx) {
            var customItem = {
                line: idx,
                discount: 0.0,
                taxDiscount: 0.0,
                whDiscountBaseAmount: 0.0,
                whDiscountTaxAmount: 0.0,
                taxes: {
                    taxItems: [],
                    whTaxItems: [],
                },
                parts: [],
                totalDiscount: 0.0,
                amtExcludeLineDiscount: 0.0,
            };
            customItem.type = itemType;
            customItem.isWhtaxApplied = txnRecord.getSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_4601_witaxapplies',
                line: idx,
            });
            customItem.amount = self._getAmount(txnRecord, idx);
            customItem.rate = self._getUnitPrice(txnRecord, idx);
            customItem.quantity = self._getQuantity(txnRecord, idx);
            customItem.itemId = self._getItemId(txnRecord, idx);
            var units = self._getUnit(txnRecord, idx);
            customItem.units = units ? units + '' : null;
            if (self._isItemfulfillment(txnRecord)) {
                customItem.unitsText = self._getUnitText(txnRecord, idx);
            }
            return customItem;
        },

        _getRelatedSatCodesForItem: function (satCodesDao, idx, txnRecord) {
            satCodesDao.getLineItemCode(
                idx,
                txnRecord.getSublistValue({
                    fieldId: 'custcol_mx_txn_line_sat_item_code',
                    sublistId: 'item',
                    line: idx,
                })
            );
        },

        addCustomItems: function (result, txnRecord, lineCount,tipo_transaccion_gbl) {
            var satCodesDao = result.satCodesDao;

            var lineDiscountApplied;
            var currentGroupItem;
            var customItem;
            var itemType;
            var thereIsAtLeastOneWithholdingTaxApplied = false;
            var itemBelongsToAGroup = false;

            for (var idx = 0; idx < lineCount; idx++) {
                itemType = txnRecord.getSublistValue({
                    fieldId: 'itemtype',
                    sublistId: 'item',
                    line: idx,
                });
                customItem = self._createCustomItem(txnRecord, itemType, idx);
                if (customItem.isWhtaxApplied) {
                    thereIsAtLeastOneWithholdingTaxApplied = true;
                }
                if (itemType === 'Subtotal') {
                    continue;
                }
                if (itemType === 'EndGroup') {
                    // lineDiscountApplied = self._applyLineDiscount(
                    //     result,
                    //     currentGroupItem,
                    //     txnRecord,
                    //     idx,
                    //     lineCount
                    // );
                    currentGroupItem.amount = self._getAmount(txnRecord, idx);
                    // idx = idx + lineDiscountApplied.discountsApplied;
                    result.items.push(currentGroupItem);
                    currentGroupItem = null;
                    continue;
                }

              if (customItem.type === 'Group') {
                    currentGroupItem = customItem;
                    // lineDiscountApplied = self._applyLineDiscount(
                    //     result,
                    //     currentGroupItem,
                    //     txnRecord,
                    //     idx,
                    //     lineCount
                    // );
                    self._getRelatedSatCodesForItem(satCodesDao, idx, txnRecord);
                    // idx = idx + lineDiscountApplied.discountsApplied;
                    continue;
                }
                //
                if (itemType === 'Discount') {
                    continue;
                }
                lineDiscountApplied = self._applyLineDiscount(
                    result,
                    customItem,
                    txnRecord,
                    idx,
                    lineCount
                );
                self._addTaxes(customItem, result, txnRecord, idx,tipo_transaccion_gbl);
                if (currentGroupItem) {
                    currentGroupItem.parts.push(customItem);
                } else {
                    result.items.push(customItem);
                    log.debug('Discounts Applied', lineDiscountApplied.discountsApplied);
                }
                self._getRelatedSatCodesForItem(satCodesDao, idx, txnRecord, customItem);
                idx = idx + lineDiscountApplied.discountsApplied;
            }
        },
    };

    return {
        addCustomItems: self.addCustomItems,
        _test_module : self,
    };
});