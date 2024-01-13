/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
	'./taxutils',
], function (taxutils) {
	'use strict';

	var SAT_CURRENCY_PRECISION = 2;
	var SAT_TAXRATE_PRECISION = 6;

	var GROUPBYTAX_SUM_CFG = {
		base : true,
		taxAmount : true,
	};
	
	function TransactionSummary () {}

	function AbsSumOperation (initValue) {
		this.sum = initValue;
		this.add = function (value) {
			this.sum = Math.abs(value) + this.sum;
			return this;
		};

		this.reset = function (value) {
			this.sum = value;
		};
	}

	function SumOperation (initValue) {
		this.sum = initValue;
		this.add = function (value) {
			this.sum = value + this.sum;
			return this;
		};
	}

	function multiply (val1,val2) {
		return val1*val2;
	}

	function copyArrayItems (src,dst) {
		src.map(function (item) {
			dst.push(item);
		});
	}

	function toNonEmpty (val) {
		return val?val :0.0;
	}

	function _getItemTotalDiscountShare (summary,item) {
		return _currency(multiply(summary.bodyDiscount,item.amount - item.discount) / summary.subtotalExcludeLineDiscount);
	}
	
	function _getGroupDiscountShare (group,item) {
		return _currency(multiply(group.totalDiscount,item.amount)/group.amount);
	}

	function _mergeTaxes (result) {
		result.items.map(function (item) {
			item.taxes.taxItems = taxutils.groupTaxesBy(item.taxes.taxItems,GROUPBYTAX_SUM_CFG);
			item.taxes.whTaxItems = taxutils.groupTaxesBy(item.taxes.whTaxItems,GROUPBYTAX_SUM_CFG);
		});
	}

	function _currency (val) {
		return parseFloat(val.toFixed(SAT_CURRENCY_PRECISION));
	}

	function _setTaxRateString (taxLine) {
		taxLine.rateString = taxLine.taxRate.toFixed(SAT_TAXRATE_PRECISION);
	}

	TransactionSummary.prototype._calculatePartsSectionForItemGroup = function (result) {
		var partRateQuantityEmpty = false;
		result.items.map(function (item) {
			var groupDiscount = new AbsSumOperation(0.0); 
			var totalGroupRate = new SumOperation(0.0);
			if (item.type !== 'Group') {return;}
			var groupTaxLines = item.taxes.taxItems;
			var whGroupTaxLines = item.taxes.whTaxItems;
			item.parts.map(function (part) {
				copyArrayItems(part.taxes.taxItems,groupTaxLines);
				copyArrayItems(part.taxes.whTaxItems,whGroupTaxLines);
				groupDiscount.add(part.totalDiscount);
				if (!part.rate || !part.quantity) {
					partRateQuantityEmpty = true;
				}
				totalGroupRate.add(_currency(multiply(toNonEmpty(part.rate),toNonEmpty(part.quantity)))); 
            
			});
			item.totalDiscount = groupDiscount.sum;
			item.rate = partRateQuantityEmpty?null:totalGroupRate.sum;
		});
	};

	TransactionSummary.prototype._calculateSubTotal = function (result) {
		var summary = result.summary;
		var subtotal = new SumOperation(0.0);
		result.items.map(function (item) {
			subtotal.add(item.amount);
		});
		summary.subtotal = subtotal.sum;
	};

	TransactionSummary.prototype._calculateSubTotalExcludeLineDiscounts = function (result) {
		var summary = result.summary;
		var subtotal = new SumOperation(0.0);
		result.items.map(function (item) {
			subtotal.add(item.amount - item.discount);
		});
		summary.subtotalExcludeLineDiscount = subtotal.sum;
	};

	TransactionSummary.prototype.summarize = function (result) {
		var summary = result.summary;
		var totalDiscount = new AbsSumOperation(0.0);

		this._calculateSubTotal(result);
		this._calculateSubTotalExcludeLineDiscounts(result);

		var itemTotalDiscount = new AbsSumOperation(0.0);
		function _aggregateTotalDiscount (item,group) {
			itemTotalDiscount.add(item.discount);

			if (group) {
				itemTotalDiscount.add(_getGroupDiscountShare(group,item));
				log.debug('Group items line discount share',_getGroupDiscountShare(group,item));

			} else {
				log.debug('Item Line Discount - '+item.amount,item.discount);
				itemTotalDiscount.add(_getItemTotalDiscountShare(summary,item));
				log.debug('item line discount::',_getItemTotalDiscountShare(summary,item));
				log.debug('group item total discount',itemTotalDiscount.sum+','+item.discount);
			}

			item.totalDiscount = itemTotalDiscount.sum;
			itemTotalDiscount.reset(0.0);
		}
		var transfersTaxExemptedAmount = new SumOperation(0.0);
		var withHoldingTaxAmount = new SumOperation(0.0);
		var transfersTaxAmount = new SumOperation(0.0);
		var allExemptTaxes = true;

		function _taxCalculations (item) {
			item.taxes.taxItems.map(function (taxLine) {
				taxLine.taxType = 'k'+taxLine.taxType;
				_setTaxRateString(taxLine);
				if (result.suiteTaxFeature) {
					transfersTaxAmount.add(taxLine.taxAmount);
				} else {
					taxLine.taxBaseAmount = taxLine.taxBaseAmount - item.totalDiscount;
					taxLine.taxAmount = _currency(multiply(taxLine.taxBaseAmount,taxLine.taxRate));
					transfersTaxAmount.add(taxLine.taxAmount);
				}
				if (taxLine.taxFactorType === 'Exento') {
					transfersTaxExemptedAmount.add(taxLine.taxAmount);
				} else {
					allExemptTaxes = false;
				}
			});
			item.taxes.whTaxItems.map(function (taxLine) {
				taxLine.taxType = 'k'+taxLine.taxType;
				_setTaxRateString(taxLine);
				taxLine.taxAmount = _currency(multiply(taxLine.taxBaseAmount,taxLine.taxRate));
				withHoldingTaxAmount.add(taxLine.taxAmount);
			});
		}

		// Calculate Total Discount for Non Suitetax Accounts
        
		if (!result.suiteTaxFeature) {
			result.items.map(function (item) {
				_aggregateTotalDiscount(item);
				item.parts.map(function (part) {
					_aggregateTotalDiscount(part,item);
				});
			});
		}
		
		result.items.map(function (item) {
			if (item.parts.length === 0) {
				_taxCalculations(item);
			}
			item.parts.map(_taxCalculations);
		});

		this._calculatePartsSectionForItemGroup(result);
		_mergeTaxes(result);
		result.items.map(function (item) {
			totalDiscount.add(item.totalDiscount);
		});
		summary.totalWithHoldTaxAmt = withHoldingTaxAmount.sum;
		summary.totalNonWithHoldTaxAmt = transfersTaxAmount.sum - transfersTaxExemptedAmount.sum;
		summary.transfersTaxExemptedAmount = transfersTaxExemptedAmount.sum;
    
		summary.totalTaxAmt = summary.totalNonWithHoldTaxAmt - summary.totalWithHoldTaxAmt;
		summary.totalAmount = summary.totalTaxAmt + summary.subtotal - totalDiscount.sum;
		summary.totalDiscount = totalDiscount.sum;
		summary.totalTaxSum = summary.totalNonWithHoldTaxAmt + summary.totalWithHoldTaxAmt;
		summary.totalSum = summary.subtotal + summary.totalTaxSum - totalDiscount.sum;

		log.debug('Summary Object', JSON.stringify(summary));    
		summary.includeTransfers = !allExemptTaxes;        
        
		this._createTaxesSummary(result);
	};

	TransactionSummary.prototype._createTaxesSummary = function (result) {
		var summary = result.summary;
		var whTaxes = {};
		var transferTaxes = {};
    
		function addTaxAmount (taxesMap, taxLine,wh) {
			if (taxLine.taxFactorType === 'Exento') {
				return;
			}
			var groupBy;
			if (wh) {
				groupBy = taxLine.satTaxCode;
			} else {
				groupBy = taxLine.satTaxCode+'_'+ taxLine.rateString+'_'+taxLine.taxFactorType;
			}
			var line = taxesMap[groupBy];
			
			if (!line) {
				line = taxutils.newTaxLineCopy(taxLine);
				line.taxAmount = new SumOperation(taxLine.taxAmount);
				taxesMap[groupBy] = line;
				return;
			}
			line.taxAmount.add(taxLine.taxAmount);
		}
		result.items.map(function (item) {
			item.taxes.taxItems.map(function (taxLine) {
				addTaxAmount(transferTaxes, taxLine);
			});
          
			item.taxes.whTaxItems.map(function (taxLine) {
				addTaxAmount(whTaxes, taxLine,true);
			});
		});
    
		summary.whTaxes = Object.keys(whTaxes).map(function (val) {
			var taxTmp = whTaxes[val];
			taxTmp.taxAmount = taxTmp.taxAmount.sum;
			return taxTmp;
		});
		summary.transferTaxes = Object.keys(transferTaxes).map(function (val) {
			var taxTmp = transferTaxes[val];
			taxTmp.taxAmount = taxTmp.taxAmount.sum;
			return taxTmp;
		});
		summary.includeWithHolding = summary.whTaxes.length > 0;
	};
  
	return {
		TransactionSummary : TransactionSummary,
	};
});
