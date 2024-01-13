/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/render', 'N/search','N/runtime','./libsatcodes','./libcustomitems','./summary','N/file'],
/**
 * @param{record} record
 * @param{render} render
 * @param{search} search
 */
function(record, render, search,nsruntime,SATCodesDao,customItems,summaryCalc,file) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {

        var buscartransaccion = search.create({
            type: search.Type.INVOICE,
            filters:[['mainline',search.Operator.IS,'T']
                    ,'and',
                    ['internalid',search.Operator.IS,'8669']],
            columns:[search.createColumn({name: 'internalid'})]
        });
        return buscartransaccion;
    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
        try{
            log.audit({title:'map',details:JSON.parse(context.value)});
            var datos = JSON.parse(context.value);


            log.audit({title:'map - values',details:datos.values});
            var peticion = datos.id;
            context.write({
                key: peticion,
                value: datos.values
            });
        }catch(error){
            log.error({title:'map - error',details:error});
        }
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {
        try {
            var data_reduce = JSON.parse(context.values[0]);
            var id = JSON.parse(context.key);

            var templateobj = record.load({
                type: 'customrecord_psg_ei_template',
                id: 1,
            });

            var template = templateobj.getValue({fieldId: 'custrecord_psg_ei_template_content'});

            var recordobj = record.load({
                type: 'invoice',
                id: 8669
            });

            var entityObj = record.load({
                type: 'customer',
                id: 2067
            });

            // var recordobj = load({
            //     type: 'invoice',
            //     id: 8669
            // });

            log.audit({title: 'recordobj', details: recordobj});

            // var recordObjrecord = recordobj.getRecord();
            var recordObjrecord = recordobj;
            log.audit({title: 'recordObjrecord', details: recordObjrecord});
        }catch(obtenrecord){
            log.audit({title: 'obtenrecord', details: obtenrecord});
        }
        try {


            var result = obtenercustomresult(recordObjrecord, {});
            log.audit({title: 'result', details: result});
            var customJson = {
                customDataSources: [
                    {
                        format: render.DataSource.OBJECT,
                        alias: 'custom',
                        data: result,
                    },
                ],
            };
        }catch(error_result){
            log.audit({title: 'error_result', details: error_result});
        }

        try {
            var plantilla = render.create();

            if (JSON.stringify(customJson) !== "{}") {
                var alias = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].alias : "";
                var format = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].format : "";
                var data = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].data : "";
                plantilla.addCustomDataSource({
                    alias: alias,
                    format: format,
                    data: data
                });
            }

            plantilla.templateContent = template;
            plantilla.addRecord('transaction', recordObjrecord);
            plantilla.addRecord(entityObj.type, entityObj);

            content = plantilla.renderAsString();

            var resultSctring = JSON.stringify(result).toString();
            var fileXML = file.create({
                name: 'Factura'+'-'+id + '.json',
                fileType: file.Type.PLAINTEXT,
                contents: resultSctring,
                folder: 2174
            });

            fileXmlId= fileXML.save();

        }catch(error_xml){
            log.audit({title:'error_xml', details:error_xml});
        }

        log.audit({title:'xml', details:content});
    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {

    }

    function load(params) {
        var nsRecord = record.load(params);
        return new Record(nsRecord);
    }

    function Record(nsRecord) {

        this.id = nsRecord.id;
        this.type = nsRecord.type;

        /**
         * Returns the SS2.0 implementation of the Record object
         *
         * @return {Record}
         * */
        this.getRecord = function getRecord() {
            return nsRecord;
        };

        this.getValue = function getValue(field) {
            return nsRecord.getValue(field);
        };

        this.setValue = function setValue(field, value) {
            nsRecord.setValue(field, value);
            return value;
        };

        this.getText = function getValue(field) {
            return nsRecord.getText(field);
        };

        this.setText = function setValue(field, value) {
            nsRecord.setText(field, value);
            return value;
        };

        this.getLineCount = function getLineCount(options){
            return nsRecord.getLineCount(options);
        };

        this.getSublistValue = function getSublistValue(options){
            return nsRecord.getSublistValue(options);
        };

        this.setSublistValue = function setSublistValue (options){
            return nsRecord.setSublistValue(options);
        };

        this.commitLine = function commitLine(options){
            return nsRecord.commitLine(options);
        };

        this.insertLine = function insertLine(options){
            return nsRecord.insertLine(options);
        };

        this.selectNewLine = function selectNewLine(options){
            return nsRecord.selectNewLine(options);
        };

        this.setCurrentSublistValue = function setCurrentSublistValue(options){
            return nsRecord.setCurrentSublistValue(options);
        };



        /**
         * Submit the record's changes to the DB
         * @param {Object} options
         * @return {number} id
         * */
        this.save = function save(options) {
            return nsRecord.save(options);
        };
    }

    function obtenercustomresult(recordObjrecord,recordsLoaded){

        var txnRecord = recordObjrecord;

        var lineCount = txnRecord.getLineCount({
            sublistId: 'item',
        });
        var satCodesDao = SATCodesDao.getInstance(lineCount);
        var multiCurrencyFeature = nsruntime.isFeatureInEffect({ feature: 'multicurrency' });
        var oneWorldFeature = nsruntime.isFeatureInEffect({ feature: 'subsidiaries' });
        var suiteTaxFeature = nsruntime.isFeatureInEffect({ feature: 'tax_overhauling' });
        var suiteTaxWithholdingTaxTypes = [];

        if (suiteTaxFeature) {
            suiteTaxWithholdingTaxTypes = _getSuiteTaxWithholdingTaxTypes();
        }

        var result = {
            suiteTaxFeature: suiteTaxFeature,
            suiteTaxWithholdingTaxTypes: suiteTaxWithholdingTaxTypes,
            multiCurrencyFeature: multiCurrencyFeature,
            oneWorldFeature: oneWorldFeature,
            items: [],
            cfdiRelations : {},
            companyInfo: {},
            satCodesDao : satCodesDao,
            itemIdUnitTypeMap : {},
            firstRelatedCfdiTxn : {},
            relatedCfdis : {
                types : [],
                cfdis : {},
            },
            billaddr : {},
            loggedUserName : nsruntime.getCurrentUser().name,
        };

        var recordObj;
        // if (recordObjrecord.pdf) {
        //     recordObj = txnRecord;
        // } else {
            recordObj = txnRecord;
        //}

        log.debug('txnRecord',recordObj);

        var subRecord = recordObj.getSubrecord({
            fieldId : 'billingaddress',
        });
        log.debug('Using getSubrecord to get the COuntry',subRecord.getValue('country'));

        result.billaddr.countrycode = subRecord.getValue('country');

        //fin billaddress

        //company info
        var companyInfoRecord;
        var industryTypeId;
        if (result.suiteTaxFeature && result.oneWorldFeature) {
            companyInfoRecord = record.load({
                type : record.Type.SUBSIDIARY,
                id : txnRecord.getValue('subsidiary'),
            });

            var lineCount = companyInfoRecord.getLineCount({
                sublistId : 'taxregistration',
            });
            var country;
            for (var i=0; i<lineCount; i++) {
                country = companyInfoRecord.getSublistValue({
                    sublistId: 'taxregistration',
                    fieldId : 'nexuscountry',
                    line : i,
                });
                if (country === 'MX') {
                    result.companyInfo.rfc = companyInfoRecord.getSublistValue({
                        sublistId: 'taxregistration',
                        fieldId: 'taxregistrationnumber',
                        line : i,
                    });
                    break;
                }
            }
        } else if (result.suiteTaxFeature) {
            companyInfoRecord = config.load({
                type : config.Type.COMPANY_INFORMATION,
            });

            var lineCount = companyInfoRecord.getLineCount({
                sublistId : 'taxregistration',
            });
            var country;
            for (var i=0; i<lineCount; i++) {
                country = companyInfoRecord.getSublistValue({
                    sublistId: 'taxregistration',
                    fieldId : 'nexuscountry',
                    line : i,
                });
                if (country === 'MX') {
                    result.companyInfo.rfc = companyInfoRecord.getSublistValue({
                        sublistId: 'taxregistration',
                        fieldId: 'taxregistrationnumber',
                        line : i,
                    });
                    break;
                }
            }
        } else if (result.oneWorldFeature) {
            companyInfoRecord = record.load({
                type : record.Type.SUBSIDIARY,
                id : txnRecord.getValue('subsidiary'),
            });

            result.companyInfo.rfc = companyInfoRecord.getValue('federalidnumber');
        } else {
            companyInfoRecord = config.load({
                type : config.Type.COMPANY_INFORMATION,
            });
            result.companyInfo.rfc = companyInfoRecord.getValue('employerid');
        }
        if (companyInfoRecord) {
            industryTypeId = companyInfoRecord.getValue('custrecord_mx_sat_industry_type');
            result.satCodesDao.getIndustryType(industryTypeId);
        }

        recordsLoaded.companyInfoRecord = companyInfoRecord;

        //fin compani info

        //inicia cfdirelationtypeinfo
        var satCodesDao = result.satCodesDao;
        var lineCount = txnRecord.getLineCount({
            sublistId:'recmachcustrecord_mx_rcs_orig_trans',
        });

        var cfdiRelationsMap = {};
        var relatedTxnIds = {};
        var internalId;
        var cfdiRelType;
        var tmp;
        var firstRelatedCfdiId;
        for (var index = 0; index < lineCount; index++) {
            internalId = txnRecord.getSublistValue({
                sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                fieldId: 'custrecord_mx_rcs_rel_cfdi',
                line: index,
            })+'';
            if (index===0) {
                firstRelatedCfdiId = internalId;
            }
            relatedTxnIds[internalId] = index;
            cfdiRelType = satCodesDao.getCfdiRelType(txnRecord.getSublistValue({
                sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                fieldId: 'custrecord_mx_rcs_rel_type',
                line: index,
            }));
            tmp = cfdiRelationsMap[cfdiRelType];
            if (!tmp) {
                result.relatedCfdis.types.push(cfdiRelType);
                result.relatedCfdis.cfdis['k'+(result.relatedCfdis.types.length-1)] = [{index : index}];
                cfdiRelationsMap[cfdiRelType] = result.relatedCfdis.types.length;
            } else {
                result.relatedCfdis.cfdis['k'+(tmp-1)].push({index: index});
            }
        }
        var isReqFirstCfdiTxn = txnRecord.type === 'creditmemo';

        if (isReqFirstCfdiTxn && firstRelatedCfdiId) {
            var firstRelatedCfdiTxn = search.lookupFields({
                type : 'transaction',
                columns : ['custbody_mx_txn_sat_payment_method'],
                id : internalId,
            });
            var paymentMethod = firstRelatedCfdiTxn['custbody_mx_txn_sat_payment_method'];
            if (paymentMethod && paymentMethod[0]) {
                result.firstRelatedCfdiTxn.paymentMethodId = paymentMethod[0].value;
            }
        }

        var summary = {
            totalWithHoldTaxAmt: 0.0,
            totalNonWithHoldTaxAmt: 0.0,
            totalTaxAmt: 0.0,
            discountOnTotal: 0.0,
            includeTransfers : true,
            includeWithHolding : true,
        };
        var discounttotal = txnRecord.getValue('discounttotal');
        summary.bodyDiscount = discounttotal ? Math.abs(discounttotal) : 0.0;
        result.summary = summary;

        var satCodesDao = result.satCodesDao;
        var paymentTerm = txnRecord.getValue('custbody_mx_txn_sat_payment_term');
        var paymentMethod = txnRecord.getValue('custbody_mx_txn_sat_payment_method');
        var cfdiUsage = txnRecord.getValue('custbody_mx_cfdi_usage');

        if (isReqFirstCfdiTxn) {
            satCodesDao.getPaymentMethod(result.firstRelatedCfdiTxn.paymentMethodId);
            satCodesDao.setPaymentTerm('PUE');
        } else {
            satCodesDao.getPaymentTerm(paymentTerm);
            satCodesDao.getPaymentMethod(paymentMethod);
        }

        satCodesDao.getCfdiUsage(cfdiUsage);
        satCodesDao.getProofType(txnRecord.type);


        var lineCount = txnRecord.getLineCount({
            sublistId: 'item',
        });
        customItems.addCustomItems(result,txnRecord,lineCount);

        var itemIdMap = result.itemIdUnitTypeMap;
        var itemIds = [];
        result.items.map(function (item) {
            itemIds.push(item.itemId);
            item.parts.map(function (part) {
                itemIds.push(part.itemId);
            });
        });
        var unitTypeSearch = search.create({
            type: 'item',
            filters:[['internalid','anyof',itemIds]],
            columns : ['unitstype'],
        });

        unitTypeSearch.run().each(function (result) {
            itemIdMap['k'+result.id] = result.getValue('unitstype');
            return true;
        });

        //attatchsatmapping

        var satCodesDao = result.satCodesDao;
        var itemIdUnitTypeMap = result.itemIdUnitTypeMap;

        function _pushForSatTaxDetails (item) {
            _pushItemPartSatTaxDetails(item);
            satCodesDao.pushForLineSatUnitCode(item.units);

            item.taxes.taxItems.map(function (taxLine) {
                satCodesDao.pushForLineSatTaxCode(taxLine.taxType);
                satCodesDao.pushForLineSatTaxFactorType(taxLine.taxCode);

            });
            item.taxes.whTaxItems.map(function (taxLine) {
                satCodesDao.pushForLineSatTaxCode(taxLine.taxType,true);
            });
        }

        function _pushItemPartSatTaxDetails (item) {
            if (item.parts) {
                item.parts.map(function (part) {
                    _pushForSatTaxDetails(part);
                });
            }
        }

        function _setSatCodesForItems (items) {
            if (!items) {
                return;
            }
            var satCodes = satCodesDao.getJson();
            var mappingObj;
            items.map(function (item) {
                _setSatCodesForItems(item.parts);
                mappingObj = satCodes.unitCodes['k'+itemIdUnitTypeMap['k'+item.itemId]+'_'+item.units];
                item.satUnitCode = mappingObj?mappingObj.code:'';
                item.taxes.taxItems.map(function (taxLine) {
                    if (result.suiteTaxFeature) {
                        mappingObj = satCodes.taxFactorTypes[taxLine.satTaxCodeKey];
                        taxLine.taxFactorType = mappingObj?mappingObj.code:'';
                    } else {
                        taxLine.taxFactorType = taxLine.exempt? 'Exento' : 'Tasa';
                    }

                    mappingObj = satCodes.taxTypes['k'+taxLine.taxType];
                    taxLine.satTaxCode = mappingObj?mappingObj.code:'';
                });
                item.taxes.whTaxItems.map(function (taxLine) {
                    taxLine.taxFactorType = 'Tasa';
                    mappingObj = satCodes.whTaxTypes['k'+taxLine.taxType];
                    taxLine.satTaxCode = mappingObj?mappingObj.code:'';
                });
            });
        }

        result.items.map(function (item) {
            _pushForSatTaxDetails(item);
        });

        satCodesDao.fetchSatTaxFactorTypeForAllPushed();
        satCodesDao.fetchSatTaxCodesForAllPushed();
        satCodesDao.fetchSatUnitCodesForAllPushed();

        log.debug('Processed SAT Mapping result :', result);
        _setSatCodesForItems(result.items);

        //fin attachmaping


        // this._attachSatMappingData(result);
         new summaryCalc.TransactionSummary().summarize(result);

        result.satcodes = satCodesDao.getJson();
        result.satCodesDao = null;
        log.debug('Custom Datasource result: ',JSON.stringify(result));

        return result;



    }

    function _getSuiteTaxWithholdingTaxTypes() {
        var filters = [];
        var columns = [];

        filters.push({
            name: 'doesnotaddtototal',
            operator: search.Operator.IS,
            values: 'T',
        });

        filters.push({
            name: 'country',
            operator: search.Operator.IS,
            values: 'MX',
        });

        columns.push({ name: 'internalid' });

        var transactionSearch = search.create({
            type: 'taxtype',
            columns: columns,
            filters: filters,
        });

        var taxcodeIDs = [];
        try {
            transactionSearch.run().each(function (result) {
                taxcodeIDs.push(result.getValue({
                    name: 'internalid',
                }));
                return true;
            });
        } catch (e) {
            if (e.name === 'SSS_INVALID_SRCH_FILTER') {
                log.debug('getSuiteTaxWithholdingTaxTypes','Old SuiteTax version. Not support Withholding Taxes.');
            } else {
                throw e;
            }
        }

        return taxcodeIDs;
    };


    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
    
});
