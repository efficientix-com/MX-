function getUUID(transactionType, internalId)
{
    try {
        var uuid = '';
        var filters = [new nlobjSearchFilter('custrecord_uuid_txn_type', null, 'is', transactionType),
            new nlobjSearchFilter('custrecord_uuid_txn_id', null, 'is', internalId)];

        var column = new nlobjSearchColumn('custrecord_uuid_id');
        var sr = nlapiSearchRecord('customrecord_uuid_container', null, filters, column);
        nlapiLogExecution('AUDIT', 'sr: ', JSON.stringify(sr));
        if (sr && sr.length > 0) {
            uuid = sr[0].getValue('custrecord_uuid_id');
        }
        return uuid;
    }catch(error_uuid){
        nlapiLogExecution('AUDIT', 'error_uuid: ', JSON.stringify(error_uuid));
    }
}
