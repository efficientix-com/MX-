/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/search'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{search} search
     */
    function(search) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            var objresponse = {
                accountid:'',
                enabled:false
            }
            try {
                var accountid = context.request.parameters.accountid || '';
                //var enabled = context.request.parameters.enabled || '';

                log.audit({title:'context.request.parameters',details:context.request.parameters});
                log.audit({title:'accountid',details:accountid});
                //log.audit({title:'enabled',details:enabled});

                if(accountid){
                    var buscaRecord = search.create({
                        type: 'customrecord_efx_fe_access',
                        filters: [
                            ['isinactive',search.Operator.IS,'F']
                            ,'AND',
                            ['custrecord_efx_fe_access_id',search.Operator.IS,accountid]
                        ],
                        columns:[
                            search.createColumn({name:'name'}),
                            search.createColumn({name:'custrecord_efx_fe_access_id'}),
                            search.createColumn({name:'custrecord_efx_fe_access_enabled'}),
                            search.createColumn({name:'custrecord_efx_fe_validate_message'}),
                            search.createColumn({name:'custrecord_efx_fe_message'}),
                            search.createColumn({name:'custrecord_efx_fe_bloqued'})
                        ]
                    });


                    buscaRecord.run().each(function (result){
                        objresponse.accountid = result.getValue({name:'custrecord_efx_fe_access_id'});
                        objresponse.enabled = result.getValue({name:'custrecord_efx_fe_access_enabled'});
                        objresponse.showMessage = result.getValue({name: 'custrecord_efx_fe_validate_message'}||'');
                        objresponse.messageDetail = result.getValue({name: 'custrecord_efx_fe_message'}||'');
                        objresponse.isBloqued = result.getValue({name: 'custrecord_efx_fe_bloqued'}||'');
                    });


                }


            }catch(error_access){
                log.error({title:'error_access',details:error_access});
            }

            context.response.setHeader({
                name: "Content-Type",
                value: "application/json"
            });

            context.response.write({
                output: JSON.stringify(objresponse)
            });

        }

        return {
            onRequest: onRequest
        };

    });
