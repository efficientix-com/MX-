/*******************************************************************
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 *
 * Name: EFX_FE_CFDI_TOOL_SL.js
 * Script Type: Suitelet
 *
 * Author: Efficientix Dev Team
 * Purpose: Suitelet to complement FE 3.3
 * Script: customscript_efx_fe_cfdi_tool_sl
 * Deploy: customdeploy_efx_fe_cfdi_tool_sl
 * ******************************************************************* */


define(['N/runtime', 'N/log', 'N/ui/serverWidget', 'N/search', 'N/record', 'N/format', 'N/file', 'N/render', 'N/email', 'N/http', 'N/xml','N/https'],
    function (runtime, log, ui, search, record, format, file, render, email, http, xml,https) {

        function main(context) {
            var self = runtime.getCurrentScript();
            var userObj = runtime.getCurrentUser();
            //Get Parameters
            var custparam_mode = context.request.parameters.custparam_mode || '';

            var messageResponse = [];
            var messageResponseText = '';
            log.audit({ title: 'custparam_mode', details: JSON.stringify(custparam_mode) });

            //End Get Parameters
            switch (custparam_mode) {
                case 'estatus_sat':
                    var xmlSend = '';

                    var custparam_uuid = context.request.parameters.custparam_uuid || '';
                    var tranid = context.request.parameters.custparam_tranid || '';
                    var trantype = context.request.parameters.custparam_trantype || '';
                    log.audit({ title: 'custparam_uuid', details: JSON.stringify(custparam_uuid) });
                    try {

                        var dataConectionPac = getPacConection();
                        log.audit({ title: 'dataConectionPac', details: dataConectionPac });

                        var url_pac = '';
                        var usuario_integrador = '';
                        if(dataConectionPac.pruebas){
                            usuario_integrador = dataConectionPac.userPrueba;
                            url_pac = dataConectionPac.urlPrueba;
                        }else{
                            usuario_integrador = dataConectionPac.user;
                            url_pac = dataConectionPac.url;
                        }


                        //var url = 'http://cfdi33-pruebas.buzoncfdi.mx/Timbrado.asmx';
                        //var rfcEmisor = 'AAA010101AAA';
                        //var usuarioIntegrador = 'mvpNUXmQfK8=';

                        log.audit({ title: 'url_pac', details: url_pac });
                        log.audit({ title: 'usuario_integrador', details: usuario_integrador });
                        //log.audit({ title: 'rfcEmisor', details: rfcEmisor });

                        xmlSend = xmlConsultaEstatusSat(usuario_integrador, custparam_uuid);
                        if (url_pac && xmlSend) {
                            var response = https.post({
                                url: url_pac,
                                body: xmlSend
                            });

                            log.audit({ title: 'response ', details: response });

                            var responseCode = response.code || '';
                            var responseBody = response.body || '';

                            log.audit({ title: 'responseCode', details: responseCode });
                            log.audit({ title: 'responseBody', details: responseBody });
                            if (responseCode == 200) {
                                var xmlDocument = xml.Parser.fromString({
                                    text: responseBody
                                });

                                var anyType = xml.XPath.select({
                                    node: xmlDocument,
                                    xpath: 'soap:Envelope//soap:Body//nlapi:ConsultaEstatusSatResponse//nlapi:ConsultaEstatusSatResult//nlapi:anyType'
                                });
                                log.audit({ title: 'anyType[2].textContent', details: JSON.stringify(anyType) });

                                var xmldoc = anyType[3].textContent;
                                log.audit({ title: 'xmldoc', details: JSON.stringify(xmldoc) });
                                if (parseInt(anyType[1].textContent, 10) == 0) {
                                    var xmlresultado = xml.Parser.fromString({
                                        text: xmldoc
                                    });
                                    var RespuestaSatUUID = xml.XPath.select({
                                        node: xmlresultado,
                                        xpath: 'nlapi:ResultadoServicioConsultaEstatusSat//nlapi:UUID'
                                    });
                                    log.audit({ title: 'RespuestaSatUUID', details: JSON.stringify(RespuestaSatUUID) });

                                    if (RespuestaSatUUID[0].textContent) {
                                        messageResponse.push({
                                            type: 'success',
                                            title: 'Información ',
                                            message: 'UUID: ' + RespuestaSatUUID[0].textContent
                                        });
                                        messageResponseText=messageResponseText+'UUID: ' + RespuestaSatUUID[0].textContent+'\n';
                                    }

                                    var RespuestaSatCodigoEstatusSat = xml.XPath.select({
                                        node: xmlresultado,
                                        xpath: 'nlapi:ResultadoServicioConsultaEstatusSat//nlapi:RespuestaSat//nlapi:CodigoEstatusSat'
                                    });
                                    log.audit({ title: 'RespuestaSat', details: JSON.stringify(RespuestaSatCodigoEstatusSat) });

                                    if (RespuestaSatCodigoEstatusSat[0].textContent) {
                                        messageResponse.push({
                                            type: 'success',
                                            title: 'Información ',
                                            message: 'Codigo de Estatus de Sat: ' + RespuestaSatCodigoEstatusSat[0].textContent
                                        });
                                        messageResponseText=messageResponseText+'Codigo de Estatus de Sat: ' + RespuestaSatCodigoEstatusSat[0].textContent+'\n';
                                    }

                                    var RespuestaSatEsCancelable = xml.XPath.select({
                                        node: xmlresultado,
                                        xpath: 'nlapi:ResultadoServicioConsultaEstatusSat//nlapi:RespuestaSat//nlapi:EsCancelable'
                                    });
                                    log.audit({ title: 'RespuestaSat', details: JSON.stringify(RespuestaSatEsCancelable) });

                                    if (RespuestaSatEsCancelable[0].textContent) {
                                        messageResponse.push({
                                            type: 'success',
                                            title: 'Información ',
                                            message: 'Es Cancelable: ' + RespuestaSatEsCancelable[0].textContent
                                        });
                                        messageResponseText=messageResponseText+'Es Cancelable: ' + RespuestaSatEsCancelable[0].textContent+'\n';
                                    }

                                    var RespuestaSatEstadoCancelacion = xml.XPath.select({
                                        node: xmlresultado,
                                        xpath: 'nlapi:ResultadoServicioConsultaEstatusSat//nlapi:RespuestaSat//nlapi:EstadoCancelacion'
                                    });
                                    log.audit({ title: 'RespuestaSatEstadoCancelacion', details: JSON.stringify(RespuestaSatEstadoCancelacion) });

                                    if (RespuestaSatEstadoCancelacion[0].textContent) {
                                        messageResponse.push({
                                            type: 'success',
                                            title: 'Información ',
                                            message: 'Estado de Cancelacion: ' + RespuestaSatEstadoCancelacion[0].textContent
                                        });
                                        messageResponseText=messageResponseText+'Estado de Cancelacion: ' + RespuestaSatEstadoCancelacion[0].textContent+'\n';
                                    }

                                    var RespuestaSatEstadoComprobante = xml.XPath.select({
                                        node: xmlresultado,
                                        xpath: 'nlapi:ResultadoServicioConsultaEstatusSat//nlapi:RespuestaSat//nlapi:EstadoComprobante'
                                    });
                                    log.audit({ title: 'RespuestaSatEstadoComprobante', details: JSON.stringify(RespuestaSatEstadoComprobante) });

                                    if (RespuestaSatEstadoComprobante[0].textContent) {
                                        var estadoRespuestaSatEstadoComprobante = 'success'
                                        if (RespuestaSatEstadoComprobante[0].textContent != 'Vigente') {
                                            estadoRespuestaSatEstadoComprobante = 'error'

                                        }
                                        messageResponse.push({
                                            type: estadoRespuestaSatEstadoComprobante,
                                            title: 'Información ',
                                            message: 'Estado de Comprobante: ' + RespuestaSatEstadoComprobante[0].textContent
                                        });
                                        messageResponseText=messageResponseText+'Estado de Comprobante: ' + RespuestaSatEstadoComprobante[0].textContent+'\n';
                                    }

                                    var RespuestaSatEstadoSat = xml.XPath.select({
                                        node: xmlresultado,
                                        xpath: 'nlapi:ResultadoServicioConsultaEstatusSat//nlapi:RespuestaSat//nlapi:EstadoSat'
                                    });
                                    log.audit({ title: 'RespuestaSatEstadoSat', details: JSON.stringify(RespuestaSatEstadoSat) });

                                    if (RespuestaSatEstadoSat[0].textContent) {
                                        var estadoRespuestaSatEstadoSat = 'success'
                                        if (RespuestaSatEstadoSat[0].textContent != 'Vigente') {
                                            estadoRespuestaSatEstadoSat = 'error'

                                        }
                                        messageResponse.push({
                                            type: estadoRespuestaSatEstadoSat,
                                            title: 'Información ',
                                            message: 'Estado Sat: ' + RespuestaSatEstadoSat[0].textContent
                                        });
                                        messageResponseText=messageResponseText+'Estado Sat: ' + RespuestaSatEstadoSat[0].textContent+'\n';
                                    }

                                    var RespuestaSatTipoCancelacion = xml.XPath.select({
                                        node: xmlresultado,
                                        xpath: 'nlapi:ResultadoServicioConsultaEstatusSat//nlapi:RespuestaSat//nlapi:TipoCancelacion'
                                    });
                                    log.audit({ title: 'RespuestaSatTipoCancelacion', details: JSON.stringify(RespuestaSatTipoCancelacion) });

                                    if (RespuestaSatTipoCancelacion[0].textContent) {
                                        messageResponse.push({
                                            type: 'success',
                                            title: 'Información ',
                                            message: 'Tipo de Cancelacion: ' + RespuestaSatTipoCancelacion[0].textContent
                                        });
                                        messageResponseText=messageResponseText+'Tipo de Cancelacion: ' + RespuestaSatTipoCancelacion[0].textContent+'\n';
                                    }

                                } else {
                                    messageResponse.push({
                                        type: 'error',
                                        title: 'Error ' + anyType[2].textContent,
                                        message: JSON.stringify(anyType[8].textContent)
                                    });
                                    messageResponseText='Error: ' + JSON.stringify(anyType[8].textContent);
                                }

                            }
                        }

                        log.audit({ title: 'xmlSend', details: JSON.stringify(xmlSend) });


                    } catch (estatusSatError) {
                        log.audit({ title: 'estatusSatError', details: JSON.stringify(estatusSatError) });
                        var mensajeErrorText = JSON.stringify(estatusSatError);
                        var mensajeError = [{
                            type: 'error',
                            title: 'Error ' + estatusSatError.message,
                            message: JSON.stringify(estatusSatError)
                        }];
                        // var rec = record.load({
                        //     id: tranid,
                        //     type: trantype
                        // });
                        //
                        // rec.setValue({
                        //     fieldId: 'custbody_efx_fe_cfdistatus',
                        //     value: mensajeErrorText,
                        //     ignoreFieldChange: true
                        // });
                        // rec.save({
                        //     // enableSourcing: true,
                        //     enableSourcing: false,
                        //     ignoreMandatoryFields: true
                        // });

                        record.submitFields({
                            type: trantype,
                            id: tranid,
                            values: {
                                custbody_efx_fe_cfdistatus: messageResponseText,
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        });

                        return mensajeError;
                    }
                    log.audit({ title: 'messageResponse', details: JSON.stringify(messageResponse) });

                    try{
                        // var rec = record.load({
                        //     id: tranid,
                        //     type: trantype
                        // });
                        //
                        // rec.setValue({
                        //     fieldId: 'custbody_efx_fe_cfdistatus',
                        //     value: messageResponseText,
                        //     ignoreFieldChange: true
                        // });
                        // rec.save({
                        //     // enableSourcing: true,
                        //     enableSourcing: false,
                        //     ignoreMandatoryFields: true
                        // });

                        record.submitFields({
                            type: trantype,
                            id: tranid,
                            values: {
                                custbody_efx_fe_cfdistatus: messageResponseText,
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields : true
                            }
                        });


                    }catch(error_status_fields){
                        log.audit({ title: 'error_status_fields', details: JSON.stringify(error_status_fields) });
                    }


                    return messageResponse;

                    break;

            }

        }


        function xmlConsultaEstatusSat(usuarioIntegrador, folioUUID) {
            var xmlReturn = '';
            xmlReturn += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">';
            xmlReturn += '    <soapenv:Header/>';
            xmlReturn += '    <soapenv:Body>';
            xmlReturn += '        <tem:ConsultaEstatusSat>';
            xmlReturn += '            <tem:usuarioIntegrador>' + usuarioIntegrador + '</tem:usuarioIntegrador>';
            xmlReturn += '            <tem:folioUUID>' + folioUUID + '</tem:folioUUID>';
            xmlReturn += '        </tem:ConsultaEstatusSat>';
            xmlReturn += '    </soapenv:Body>';
            xmlReturn += '</soapenv:Envelope>';
            log.audit({ title: 'xmlReturn xmlConsultaEstatusSat', details: xmlReturn });
            return xmlReturn;
        }

        function getPacConection(){
            var objPacConection = {
                url: '',
                user: '',
                mailuser:'',
                https:'',
                pruebas:'',
                emisorPrueba:'',
                urlPrueba:'',
                userPrueba:'',
                urlValidador:'',
                userValidador:''
            }
            var idConection = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_connect_pac_data'});
            var conectionObj = record.load({
                type:'customrecord_efx_fe_mtd_envio',
                id:idConection
            });
            objPacConection.url = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_url'});
            objPacConection.user = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_user'});
            objPacConection.mailuser = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_user_email'});
            objPacConection.https = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_https'});
            objPacConection.pruebas = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_test'});
            objPacConection.emisorPrueba = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_emisor_pb'});
            objPacConection.urlPrueba = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_urltest'});
            objPacConection.userPrueba = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_usertest'});
            objPacConection.urlValidador = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_urlvalid'});
            objPacConection.userValidador = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_uservalid'});

            return objPacConection;
        }


        return {
            onRequest: main
        };
    });
