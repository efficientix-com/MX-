/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/record', 'N/runtime', 'N/ui/message', 'N/url'],
/**
 * @param{https} https
 * @param{record} record
 * @param{redirect} redirect
 * @param{runtime} runtime
 * @param{message} message
 * @param{url} url
 */
function(https, record, runtime, mensajes, url) {
    
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

    function reprocess(objGlobal){

        var espejoUuid = '';
        var espejoCert = '';
        var espejoPdf = '';
        var espejoGen = '';

        if(objGlobal.espejo){
            var recEspejo = record.load({
                type:record.Type.INVOICE,
                id:objGlobal.espejo
            });
            espejoUuid = recEspejo.getValue({fieldId:'custbody_mx_cfdi_uuid'});
            espejoCert = recEspejo.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
            espejoPdf = recEspejo.getValue({fieldId:'custbody_edoc_generated_pdf'});
            espejoGen = recEspejo.getValue({fieldId:'custbody_psg_ei_content'});
        }
        console.log(JSON.stringify(objGlobal));

        var myMsg_create = mensajes.create({
            title: "Facturación Global",
            message: "Se está reprocesando su factura global...",
            type: mensajes.Type.INFORMATION
        });
        myMsg_create.show();

        if(espejoUuid && espejoCert){
            console.log(espejoUuid);
            console.log(espejoCert);
            console.log(objGlobal.idglobal);

            var rGlobal = record.load({
                type: 'customsale_efx_fe_factura_global',
                id: objGlobal.idglobal
            });
            try{

                var objLineas = {
                    tipo:'',
                    numeroLineas:'',
                    idglobal:'',
                    espejoUuid:'',
                    espejoCert:'',
                    espejoPdf:'',
                    espejoGen:'',
                }

                var line_c = rGlobal.getLineCount({sublistId:'item'});

                objLineas.tipo = 'existe';
                objLineas.numeroLineas = line_c;
                objLineas.idglobal = objGlobal.idglobal;
                objLineas.espejoUuid = espejoUuid;
                objLineas.espejoCert = espejoCert;
                objLineas.espejoPdf = espejoPdf;
                objLineas.espejoGen = espejoGen;

                var url_Script = url.resolveScript({
                    scriptId: 'customscript_efx_fe_actualiza_tran_sl',
                    deploymentId: 'customdeploy_efx_fe_actualiza_tran_sl'
                });

                var headers = {
                    "Content-Type": "application/json"
                };

                https.request.promise({
                    method: https.Method.POST,
                    url: url_Script,
                    headers: headers,
                    body: JSON.stringify(objLineas)
                }).then(function (response) {
                    log.debug({
                        title: 'Response',
                        details: response
                    });

                    if (response.code == 200) {

                        location.reload();

                    } else if (response.code == 500) {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Facturación Global",
                            message: "Ocurrio un error, verifique su conexión.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    } else {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Facturación Global",
                            message: "Ocurrio un error, verifique sus datos.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }


                }).catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                });



            }catch(error_actualiza){
                console.log('erroractualiza: ',error_actualiza);
            }


        }else {
            try {

                var objLineas = {
                    tipo:'',
                    numeroLineas:'',
                    idglobal:'',
                    espejoUuid:'',
                    espejoCert:'',
                    espejoPdf:'',
                    espejoGen:'',
                    espejo:'',
                    setup_metodo:'',
                    setup_plantilla:'',
                    setup_txcode:'',
                    setup_entity:'',
                    setup_item:'',
                }


                //objLineas.numeroLineas = line_c;
                objLineas.tipo = 'nuevo';
                objLineas.idglobal = objGlobal.idglobal;
                objLineas.espejoUuid = '';
                objLineas.espejoCert = '';
                objLineas.espejoPdf = '';
                objLineas.espejoGen = '';
                objLineas.espejo = objGlobal.espejo;
                objLineas.setup_metodo = objGlobal.setup_metodo;
                objLineas.setup_plantilla = objGlobal.setup_plantilla;
                objLineas.setup_txcode = objGlobal.setup_txcode;
                objLineas.setup_entity = objGlobal.setup_entity;
                objLineas.setup_item = objGlobal.setup_item;


                var url_Script = url.resolveScript({
                    scriptId: 'customscript_efx_fe_actualiza_tran_sl',
                    deploymentId: 'customdeploy_efx_fe_actualiza_tran_sl'
                });

                var headers = {
                    "Content-Type": "application/json"
                };

                https.request.promise({
                    method: https.Method.POST,
                    url: url_Script,
                    headers: headers,
                    body: JSON.stringify(objLineas)
                }).then(function (response) {
                    log.debug({
                        title: 'Response',
                        details: response
                    });

                    if (response.code == 200) {
                        location.reload();

                    } else if (response.code == 500) {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Facturación Global",
                            message: "Ocurrio un error, verifique su conexión.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    } else {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Facturación Global",
                            message: "Ocurrio un error, verifique sus datos.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }


                }).catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                });



            } catch (error_peticion) {
                log.error({
                    title: 'error_peticion ',
                    details: error_peticion
                });
            }
        }
    }

    function crearXML(tranid,trantype){
        try {
            console.log('tranid :', tranid);
            console.log('trantype :', trantype);
            // var scheme = 'https://';
            // var host = url.resolveDomain({
            //     hostType: url.HostType.APPLICATION
            // });


            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_xml_generator',
                deploymentId: 'customdeploy_efx_fe_xml_generator',
                returnExternalUrl: true,
                params: {
                    trantype: trantype,
                    tranid: tranid

                }
            });
            console.log('trantype :', 'test');
            console.log('SLURL :', SLURL);
            log.audit({title: 'SLURL', details: SLURL});


            var response = https.get({
                url: SLURL,
            });

            log.audit({title: 'response-code', details: response.code});
            log.audit({title: 'response-body', details: response.body});

            return response;
        }catch (errortimbre){
            console.log('errortimbre: ',errortimbre);
        }

    }


    return {
        pageInit: pageInit,
        reprocess: reprocess,

    };
    
});
