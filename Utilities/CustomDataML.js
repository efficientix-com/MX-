/**
* @NApiVersion 2.x
* @NScriptType plugintypeimpl
* @NModuleScope Public
*/
define(["N/render"], function(nsrender) {
    /**
     * inject - This function will provide the custom data source during the generation process
     * @param {Object} params
     * @param {String} params.transactionId
     * @param {Object} params.transactionRecord

     *
     * @returns {Object} result
     * @returns {render.DataSource} result.alias
     * @returns {string} result.format
     * @returns {Object | Document | string} result.data
     */

    function inject(params) {
        var txnRecord = params.transactionRecord;
        var txnId = params.transactionId;

        var customObj = {};
        log.debug("Custom Object", customObj);
        return {
            customDataSources: [
                {
                    format: nsrender.DataSource.OBJECT,
                    alias: "custom",
                    data: customObj
                }
            ],
        };
    }

    return {
        inject: inject
    };
});