/**
 *@NApiVersion 2.0
 *@NScriptType MassUpdateScript
 */
define(['N/record'],
    function (record) {
        function each(params) {
            // Need to LOAD each record and SAVE it for changes to take effect
            // LOAD the PO
            try {
                var relacionBorra = record.delete({
                    type: params.type,
                    id: params.id,
                });

                log.audit({title: 'relacionBorra', details: relacionBorra});
            } catch (borrarecordrelated) {
                log.audit({title: 'borrarecordrelated', details: borrarecordrelated});
            }
        }
        return {
            each: each
        };
    });