/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define([
    'N/search', './libsatcodes2',
], function (nssearch, SATMappingLookup) {
    'use strict';

    var proofTypeMap = {
        customsale_efx_fe_factura_global: 'I',
        invoice: 'I',
        cashsale: 'I',
        creditmemo: 'E',
        itemfulfillment: 'T',
    };

    function SATCodes (lineCount,tipo_transaccion_gbl) {
        log.audit({title:'lineCount',details:lineCount});
        log.audit({title:'tipo_transaccion_gbl',details:tipo_transaccion_gbl});
        var items = [];
        //if(!tipo_transaccion_gbl){
            for (var index = 0; index < lineCount; index++) {
                items[index] = { taxes: [] };
            }
        //}

        log.audit({title:'items',details:items});
        this.satcodes = {
            items: items,
            paymentTermInvMap: {},
            paymentMethodInvMap: {},
            whTaxTypes: {},
            taxTypes: {},
            paymentTermSatCodes: {},
            paymentMethodCodes: {},
        };
        this.satMappingLookup = SATMappingLookup.getInstance();
        this.satItemCodesCache = {};
        this.satCfdiRelTypeCache = {};
        this.satMappingValCache = {};
        this.satPaymentTermCache = {};
    }

    SATCodes.prototype.getSearchMapWithIdAsKey = function (searchType, columnsMap, ids) {
        var searchResult = {};
        var columns = Object.keys(columnsMap);
        var codeSearch = nssearch.create({
            type: searchType,
            columns: columns,
            filters: ['internalid', 'anyof', ids],
        });
        var details;
        codeSearch.run().each(function (result) {
            details = {};
            columns.map(function (colname) {
                details[columnsMap[colname]] = result.getValue(colname);
            });
            searchResult[result.id + ''] = details;
            return true;
        });

        return searchResult;
    };

    SATCodes.prototype.getMexicoSatItemCode = function (id) {
        var strId = id + '';
        var cached = this.satItemCodesCache[strId];
        if (cached) {
            return cached;
        }
        var fields = nssearch.lookupFields({
            id: id,
            type: 'customrecord_mx_sat_item_code_mirror',
            columns: ['custrecord_mx_ic_mr_code'],
        });

        var obj = {
            code: fields['custrecord_mx_ic_mr_code'],
        };
        this.satItemCodesCache[strId] = obj;
        log.debug('MX SAT Item Code :', obj);
        return obj;
    };

    SATCodes.prototype.getMexicoCfdiRelType = function (id) {
        var strId = id + '';
        var cached = this.satCfdiRelTypeCache[strId];
        if (cached) {
            return cached;
        }
        var fields = nssearch.lookupFields({
            id: id,
            type: 'customrecord_mx_sat_rel_type',
            columns: ['custrecord_mx_sat_rel_type_code'],
        });

        var obj = {
            code: fields['custrecord_mx_sat_rel_type_code'],
        };
        this.satCfdiRelTypeCache[strId] = obj;
        log.debug('MX SAT Related CFDI', obj);
        return obj;
    };

    SATCodes.prototype._getMexicoMappingValue = function (id) {
        var strId = '' + id;
        var cached = this.satMappingValCache[strId];
        if (cached) {
            return cached;
        }
        var fields = nssearch.lookupFields({
            id: id,
            type: 'customrecord_mx_mapper_values',
            columns: ['custrecord_mx_mapper_value_inreport', 'name'],
        });

        var obj = {
            code: fields['custrecord_mx_mapper_value_inreport'],
            name: fields.name,
        };
        this.satMappingValCache[strId] = obj;
        log.debug('MX SAT Mapping Value Cache', obj);
        return obj;
    };

    SATCodes.prototype.getMexicoSatPaymentTerm = function (id) {
        var strId = '' + id;
        var cached = this.satPaymentTermCache[strId];
        if (cached) {
            return cached;
        }
        var fields = nssearch.lookupFields({
            id: id,
            type: 'customrecord_mx_sat_payment_term',
            columns: ['custrecord_mx_sat_pt_code','name'],
        });

        var obj = {
            code: fields['custrecord_mx_sat_pt_code'],
            name : fields.name,
        };
        this.satPaymentTermCache[strId] = obj;
        log.debug('MX SAT Payment Term', obj);
        return obj;
    };

    SATCodes.prototype.getMexicoSatIndustryType = function (id) {
        var fields = nssearch.lookupFields({
            id: id,
            type: 'customrecord_mx_sat_industry_type',
            columns: ['custrecord_mx_sat_it_code', 'name'],
        });

        var obj = {
            code: fields['custrecord_mx_sat_it_code'],
            name: fields.name,
        };
        log.debug('MX SAT Industry Type', obj);
        return obj;
    };

    SATCodes.prototype.getMexicoSatCFDIUsage = function (id) {
        var fields = nssearch.lookupFields({
            id: id,
            type: 'customrecord_mx_sat_cfdi_usage',
            columns: ['custrecord_mx_sat_cfdi_code','name'],
        });

        var obj = {
            code: fields['custrecord_mx_sat_cfdi_code'],
            name : fields.name,
        };
        log.debug('MX SAT CFDI Usage', obj);
        return obj;
    };

    SATCodes.prototype.getPaymentTerm = function (id, invoiceId) {
        if (!id) {
            return;
        }
        var obj = this.getMexicoSatPaymentTerm(id);
        var code = obj.code;
        if (invoiceId) {
            this.satcodes.paymentTermInvMap['d' + invoiceId] = code;
            return code;
        }
        this.satcodes.paymentTerm = code;
        this.satcodes.paymentTermName = obj.name;
        return code;
    };

    SATCodes.prototype.getPaymentStringTypeCode = function (paymentStringTypeId) {
        if (!paymentStringTypeId) {
            return;
        }

        var fields = nssearch.lookupFields({
            id: paymentStringTypeId,
            type: 'customrecord_mx_sat_payment_string_type',
            columns: ['custrecord_mx_code', 'name'],
        });

        var obj = {
            code: fields['custrecord_mx_code'],
            name: fields.name,
        };

        this.satcodes.paymentStringTypeCode = obj.code;
        this.satcodes.paymentStringTypeName = obj.name;
        return obj.code;
    };

    SATCodes.prototype.getPaymentMethod = function (id, invoiceId) {
        if (!id) {
            return;
        }
        var obj = this._getMexicoMappingValue(id);

        if (invoiceId) {
            this.satcodes.paymentMethodInvMap['d' + invoiceId] = obj.code;
            return obj.code;
        }
        this.satcodes.paymentMethod = obj.code;
        this.satcodes.paymentMethodName = obj.name;
        return obj.code;
    };

    SATCodes.prototype.setPaymentTerm = function (satCode) {
        this.satcodes.paymentTerm = satCode;
    };

    SATCodes.prototype.getLineItemCode = function (lineNo, id) {
        if (!id) {
            return;
        }
        log.audit({title:'lineNo',details:lineNo});
        log.audit({title:'id',details:id});
        log.audit({title:'this.satcodes',details:this.satcodes});
        var lineSatCodes = this.satcodes.items[lineNo];
        log.audit({title:'lineSatCodes',details:lineSatCodes});
        lineSatCodes.itemCode = this.getMexicoSatItemCode(id).code;
        log.audit({title:'lineSatCodes',details:lineSatCodes});
    };

    SATCodes.prototype.getCfdiRelType = function (id) {
        if (!id) {
            return;
        }
        return this.getMexicoCfdiRelType(id).code;
    };

    SATCodes.prototype.getIndustryType = function (id) {
        if (!id) {
            return;
        }
        var obj = this.getMexicoSatIndustryType(id);
        this.satcodes.industryType = obj.code;
        this.satcodes.industryTypeName = obj.name;
    };

    SATCodes.prototype.getCfdiUsage = function (id) {
        if (!id) {
            return;
        }
        var obj = this.getMexicoSatCFDIUsage(id);
        this.satcodes.cfdiUsage = obj.code;
        this.satcodes.cfdiUsageName = obj.name;
    };

    SATCodes.prototype.getProofType = function (type) {
        this.satcodes.proofType = proofTypeMap[type];
    };

    SATCodes.prototype.pushForLineSatTaxCode = function (taxType, wh) {
        if (!taxType) {
            return;
        }
        this.satMappingLookup.needTaxCategory(taxType, wh);
    };

    SATCodes.prototype.pushForLineSatTaxFactorType = function (taxCode) {
        if (!taxCode) {
            return;
        }
        this.satMappingLookup.needTaxFactorType(taxCode);
    };

    SATCodes.prototype.fetchSatTaxCodesForAllPushed = function () {
        this.satcodes.whTaxTypes = this.satMappingLookup.getSatTaxCategories(true);
        this.satcodes.taxTypes = this.satMappingLookup.getSatTaxCategories(false);
    };

    SATCodes.prototype.fetchSatTaxFactorTypeForAllPushed = function () {
        this.satcodes.taxFactorTypes = this.satMappingLookup.getSatTaxFactorType();
    };

    SATCodes.prototype.fetchSatUnitCodesForAllPushed = function () {
        this.satcodes.unitCodes = this.satMappingLookup.getSatUnitCodes();
    };

    SATCodes.prototype.pushForLineSatUnitCode = function (unit) {
        if (!unit) {
            return;
        }
        this.satMappingLookup.needUnitCode(unit);
    };

    SATCodes.prototype.getJson = function () {
        return this.satcodes;
    };

    var getInstance = function (lineCount,tipo_transaccion_gbl) {
        return new SATCodes(lineCount,tipo_transaccion_gbl);
    };

    return {
        getInstance: getInstance,
    };
});