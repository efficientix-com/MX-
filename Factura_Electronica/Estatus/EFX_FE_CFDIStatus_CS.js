/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
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

        function ConsultaEstatusSat(tranData) {
            var myMsg_create = mensajes.create({
                title: "Estatus",
                message: "Se está consultando el estatus su CFDI...",
                type: mensajes.Type.INFORMATION
            });
            myMsg_create.show();
            var tranid = tranData.tranid || '';
            var trantype = tranData.trantype || '';
            var uuid = tranData.uuid || '';
            var subsi = tranData.subsi || '';
            var rfc_receptor = tranData.rfc_receptor || '';
            // var total_comprobante = tranData.total_comprobante || '';
            var url_Script = url.resolveScript({
                scriptId: 'customscript_efx_fe_cfdistatus_sl',
                deploymentId: 'customdeploy_efx_fe_cfdistatus_sl'
            });

            url_Script += '&custparam_mode=' + 'estatus_sat';
            url_Script += '&custparam_uuid=' + uuid;
            url_Script += '&custparam_tranid=' + tranid;
            url_Script += '&custparam_trantype=' + trantype;
            url_Script += '&custparam_subsi=' + subsi;
            url_Script += '&custparam_rfc_receptor=' + rfc_receptor;
            /* url_Script += '&custparam_total_comprobante=' + total_comprobante;
            url_Script += '&custparam_sello_digital_emisor=' + sello_digital_emisor; */

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
                            title: "Estatus",
                            message: "El estatus se grabó en el campo CFDI STATUS",
                            type: mensajes.Type.CONFIRMATION
                        });
                        myMsg.show({ duration : 5500 });

                        console.log('respuesta');

                        location.reload();
                    }else if(response.code==500){
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Estatus",
                            message: "Ocurrio un error, verifique su conexión.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }else {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Estatus",
                            message: "Ocurrio un error, verifique si su CFDI existe.",
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

        return {
            pageInit: pageInit,
            ConsultaEstatusSat:ConsultaEstatusSat
        };

    });
