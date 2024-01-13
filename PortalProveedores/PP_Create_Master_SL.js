/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record','N/runtime','N/file'],
    /**
 * @param{record} record
 */
    (record,runtime,file) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            try{
                var body='';

                if(scriptContext.request.body){
                    body = JSON.parse(scriptContext.request.body);
                }

                var scriptObj = runtime.getCurrentScript();
                folder = scriptObj.getParameter({name: 'custscript_efx_pp_portal'});

                for(var i=0;i<body.length;i++){
                    var archivoJson = file.create({
                        name: body[i].documentnumber+'.json',
                        fileType:file.Type.JSON,
                        contents: JSON.stringify(body[i]),
                        folder: folder,
                        //encoding: file.Encoding.UTF_8
                    });

                    var id_doc_json = archivoJson.save();

                    var record_master = record.create({
                        type:'customrecord_efx_pp_portal_request',
                    });

                    record_master.setValue({fieldId:'custrecord_efx_pp_master_oc',value:body[i].id});
                    record_master.setValue({fieldId:'custrecord_efx_pp_json_request',value:id_doc_json});
                    record_master.setValue({fieldId:'custrecord_efx_pp_status',value:5});

                    var master_id = record_master.save();

                    if(master_id){
                        // if(body[i].parcialidad=='T'){
                        //     record.submitFields({
                        //         type: record.Type.PURCHASE_ORDER,
                        //         id: body[i].id,
                        //         values:{
                        //             custbody_efx_pp_process_portal:6,
                        //         }
                        //     });
                        // }else{
                            record.submitFields({
                                type: record.Type.PURCHASE_ORDER,
                                id: body[i].id,
                                values:{
                                    custbody_efx_pp_process_portal:5,
                                    custbody_efx_pp_mail_sent:false
                                }
                            });
                       // }
                    }


                }

            }catch (error_context){
                log.audit({title:'error_context',details:error_context})
            }

        }

        return {onRequest}

    });
