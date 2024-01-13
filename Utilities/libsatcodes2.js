/**
 *    Copyright (c) 2019, Oracle and/or its affiliates. All rights reserved.
 */
/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/runtime'], function (nsSearch, nsruntime) {
    'use strict';

    var instance;

    function SATMappingLookup () {
        this.searchObj = nsSearch.load({
            id: 'customsearch_mx_mapping_search',
        });
        this.whTaxCodes = [];
        this.whTaxTypeCache = {};
        this.taxTypeCache = {};
        this.taxCodeCache = {};
        this.unitTypeCache = {};
        this.unitSubkeys = {};
    }

    function _getSatCodeMap (resultSet) {
        var details;
        var data = {};
        var key;
        var subkey;
        var id;
        resultSet.each(function (mapping) {
            details = {};
            details.code = mapping.getValue({
                name: 'custrecord_mx_mapper_value_inreport',
                join: 'custrecord_mx_mapper_keyvalue_value',
            });
            details.name = mapping.getValue({
                name: 'name',
                join: 'custrecord_mx_mapper_keyvalue_value',
            });
            key = mapping.getValue({
                name: 'custrecord_mx_mapper_keyvalue_key',
            });
            subkey = mapping.getValue({
                name: 'custrecord_mx_mapper_keyvalue_subkey',
            });
            id = 'k'+key;
            if (subkey) {
                id = id + '_' + subkey;
            }
            data[id] = details;
            return true;
        });
        log.debug('Sat code retrieved', details);

        return data;
    }

    function _createOrQuery (key, values) {
        var query = [];
        if (!values || values.length === 0) {
            return query;
        }
        log.debug('key', key);
        log.debug('values', values);
        query.push([key, 'is', values[0]]);
        for (var index = 1; index < values.length; index++) {
            query.push('OR', [key, 'is', values[index]]);
        }
        log.debug('query', query);
        return query;
    }

    SATMappingLookup.prototype.getSatTaxFactorType = function () {
        var allKeys = Object.keys(this.taxCodeCache);
        if (allKeys.length === 0) {
            return {};
        }
        var query = _createOrQuery('custrecord_mx_mapper_keyvalue_key', allKeys);
        log.debug('SAT Tax Factor Type', query);
        this.searchObj.filterExpression = [
            [
                'custrecord_mx_mapper_keyvalue_category.scriptid',
                'is',
                ['sat_tax_factor_type'],
            ],
            'and',
            [
                'custrecord_mx_mapper_keyvalue_rectype',
                'is',
                'salestaxitem',
            ],
            'and',
            [query],
        ];
        log.debug('Search object For Mapping Tool usage', this.searchObj);
        var details = _getSatCodeMap(this.searchObj.run());
        log.debug('SAT Tax Factor Type', details);
        return details;
    };

    SATMappingLookup.prototype.getSatTaxCategories = function (withholding) {
        var cacheStore = withholding ? this.whTaxTypeCache : this.taxTypeCache;
        var taxTypeRecord;
        if (withholding && !nsruntime.isFeatureInEffect({ feature: 'tax_overhauling' })) {
            taxTypeRecord = 'customrecord_4601_witaxtype';
        } else {
            taxTypeRecord = 'taxtype';
        }
        var allKeys = Object.keys(cacheStore);
        if (allKeys.length === 0) {
            return {};
        }
        var query = _createOrQuery('custrecord_mx_mapper_keyvalue_key', allKeys);
        this.searchObj.filterExpression = [
            [
                'custrecord_mx_mapper_keyvalue_category.scriptid',
                'is',
                ['sat_tax_category'],
            ],
            'and',
            [
                'custrecord_mx_mapper_keyvalue_rectype',
                'is',
                taxTypeRecord,
            ],
            'and',
            [query],
        ];
        log.debug('Search obj', this.searchObj);
        var details = _getSatCodeMap(this.searchObj.run());
        log.debug('SAT  Categories', details);
        return details;
    };

    SATMappingLookup.prototype.getSatUnitCodes = function () {
        log.debug('SAT UnitCode :: getSatUnitCodes',this.unitSubkeys);
        var query = _createOrQuery('custrecord_mx_mapper_keyvalue_subkey',Object.keys(this.unitSubkeys));
        log.debug('query',query);
        if (query.length === 0) {
            return {};
        }
        this.searchObj.filterExpression = [
            [
                'custrecord_mx_mapper_keyvalue_category.scriptid',
                'is',
                ['sat_unit_code'],
            ],
            'and',
            ['custrecord_mx_mapper_keyvalue_rectype', 'is', ['unitstype']],
            'and',
            ['custrecord_mx_mapper_keyvalue_subrectype', 'is', ['uom']],
            'and',
            [query],
        ];
        log.debug('SAT Mapping tool Search Object ', this.searchObj);
        var details = _getSatCodeMap(this.searchObj.run());
        log.debug('Item unit types', details);
        return details;
    };

    SATMappingLookup.prototype.needTaxCategory = function (taxType, withholding) {
        var cacheStore = withholding ? this.whTaxTypeCache : this.taxTypeCache;
        cacheStore[taxType] = true;
    };

    SATMappingLookup.prototype.needUnitCode = function (unit) {
        if (!unit) {return;}
        this.unitSubkeys[unit] = true;
    };

    SATMappingLookup.prototype.needTaxFactorType = function (taxCode) {
        if (!taxCode) {return;}
        this.taxCodeCache[taxCode] = true;
    };

    var getInstance = function () {
        return (instance = (instance || new SATMappingLookup()));
    };

    return {
        getInstance: getInstance,
    };
});