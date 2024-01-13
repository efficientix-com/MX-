function getUUID(transactionType, internalId)
{
    try {
        var uuid = '';
        var filters = [new nlobjSearchFilter('type', null, 'is', transactionType),
            new nlobjSearchFilter('internalid', null, 'is', internalId)];

        var column = new nlobjSearchColumn('custbody_mx_cfdi_uuid');
        var sr = nlapiSearchRecord('transaction', null, filters, column);
        nlapiLogExecution('AUDIT', 'sr: ', JSON.stringify(sr));
        if (sr && sr.length > 0) {
            uuid = sr[0].getValue('custbody_mx_cfdi_uuid' || '');
            if(!uuid){
                uuid = ' ';
            }
        }
        return uuid;
    }catch(error_uuid){
        nlapiLogExecution('AUDIT', 'error_uuid: ', JSON.stringify(error_uuid));
    }
}
