/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/http', 'N/https', 'N/record','N/url','N/ui/message'],
/**
 * @param{http} http
 * @param{https} https
 * @param{record} record
 */
function(http, https, record,url,mensajes) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(scriptContext) {

    }

    function cancel_CFDI(tranData) {
        var myMsg_create = mensajes.create({
            title: "Cancelacion",
            message: "Se está cancelando su CFDI...",
            type: mensajes.Type.INFORMATION
        });
        myMsg_create.show();
        var tranid = tranData.tranid;
        var trantype = tranData.trantype;
        var idGlb = false;
        try {

            var rec = record.load({
                type: trantype,
                id: tranid
            });

            //idGlb = rec.getValue({ fieldId: 'custbody_efx_fe_factura_global' }) || '';
        } catch (error) {
            log.error({ title: 'error', details: JSON.stringify(error) });
        }
        var respuesta = true;

        if (idGlb) {
            respuesta = confirm("Desea cancelar una factura global?");
        }

        if (respuesta == true) {
            var url_Script = url.resolveScript({
                scriptId: 'customscript_efx_fe_cancelvna',
                deploymentId: 'customdeploy_efx_fe_cancel_vna'
            });

            url_Script += '&custparam_tranid=' + tranid;
            url_Script += '&custparam_trantype=' + trantype;
            url_Script += '&custparam_sutituye=' + 'F';

            var headers = {
                "Content-Type": "application/json"
            };

            https.request.promise({
                method: https.Method.GET,
                url: url_Script,
                headers: headers
            })
                .then(function(response){
                    log.debug({
                        title: 'Response',
                        details: response
                    });

                    if(response.code==200){
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Cancelacion",
                            message: "Su CFDI se Canceló correctamente, revise el acuse en la subpestaña de CFDI Infomation",
                            type: mensajes.Type.CONFIRMATION
                        });
                        myMsg.show({ duration : 5500 });

                        console.log('respuesta');

                        location.reload();
                    }else if(response.code==500){
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Cancelacion",
                            message: "Ocurrio un error, verifique su conexión.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }else {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Cancelacion",
                            message: "Ocurrio un error, verifique si su CFDI puede cancelarse.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }

                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                });

        }
    }

    function cancel_subs_CFDI(tranData) {
        var myMsg_create = mensajes.create({
            title: "Cancelacion",
            message: "Se está cancelando su CFDI...",
            type: mensajes.Type.INFORMATION
        });
        myMsg_create.show();
        var tranid = tranData.tranid;
        var trantype = tranData.trantype;
        var idGlb = false;
        try {

            var rec = record.load({
                type: trantype,
                id: tranid
            });

            //idGlb = rec.getValue({ fieldId: 'custbody_efx_fe_factura_global' }) || '';
        } catch (error) {
            log.error({ title: 'error', details: JSON.stringify(error) });
        }
        var respuesta = true;

        if (idGlb) {
            respuesta = confirm("Desea cancelar una factura global?");
        }

        if (respuesta == true) {

            var url_Script = url.resolveScript({
                scriptId: 'customscript_efx_fe_cancelacion_sl',
                deploymentId: 'customdeploy_efx_fe_cancelacion_sl'
            });

            url_Script += '&custparam_tranid=' + tranid;
            url_Script += '&custparam_trantype=' + trantype;
            url_Script += '&custparam_sutituye=' + 'T';

            var headers = {
                "Content-Type": "application/json"
            };

            https.request.promise({
                method: https.Method.GET,
                url: url_Script,
                headers: headers
            })
                .then(function(response){
                    log.debug({
                        title: 'Response',
                        details: response
                    });

                    if(response.code==200){
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Cancelacion",
                            message: "Su CFDI se Canceló correctamente, revise el acuse en la subpestaña de CFDI Infomation",
                            type: mensajes.Type.CONFIRMATION
                        });
                        myMsg.show({ duration : 5500 });

                        console.log(response);
                        if(response.body) {
                            var body_data = JSON.parse(response.body);
                            console.log(response.body);
                            console.log(body_data.id_tran);

                            var output = url.resolveRecord({
                                recordType: 'invoice',
                                recordId: body_data.id_tran,
                                isEditMode: true
                            });
                            window.open(output, '_blank');
                            console.log(output);
                        }
                        location.reload();

                        //location.reload();
                    }else if(response.code==500){
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Cancelacion",
                            message: "Ocurrio un error, verifique su conexión.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }else {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Cancelacion",
                            message: "Ocurrio un error, verifique si su CFDI puede cancelarse.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }

                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                });

        }
    }

    return {
        pageInit: pageInit,
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        // saveRecord: saveRecord,
        cancel_CFDI:cancel_CFDI,
        cancel_subs_CFDI:cancel_subs_CFDI,
    };
    
});
