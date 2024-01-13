/*******************************************************************
 * @NApiVersion 2.1
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


define(['N/runtime', 'N/log', 'N/ui/serverWidget', 'N/search', 'N/record', 'N/format', 'N/file', 'N/render', 'N/email', 'N/http', 'N/xml', 'N/https','N/config'],
    function (runtime, log, ui, search, record, format, file, render, email, http, xml, https,config) {

        function main(context) {

            var messageResponse = [];
            var messageResponseText = '';
            // log.audit({ title: 'custparam_mode', details: JSON.stringify(custparam_mode) });

            var xmlSend = '';

            log.debug({ title: 'main parameters', details: context.request.parameters })

            //? PARAMETROS
            var uuid_comprobante = context.request.parameters.custparam_uuid || '';
            // log.audit({ title: 'custparam_uuid', details: JSON.stringify(uuid_comprobante) });
            var tranid = context.request.parameters.custparam_tranid || '';
            log.audit({ title: 'tranid', details: tranid });
            var trantype = context.request.parameters.custparam_trantype || '';
            log.audit({ title: 'trantype', details: trantype });
            var subsi = context.request.parameters.custparam_subsi || '';
            // log.audit({ title: 'subsi', details: JSON.stringify(subsi) });
            var rfc_receptor = context.request.parameters.custparam_rfc_receptor || '';
            // log.audit({ title: 'rfc_receptor', details: JSON.stringify(rfc_receptor) });
            var total_comprobante = context.request.parameters.custparam_total_comprobante || '';
            // log.audit({ title: 'rfc_receptor', details: JSON.stringify(rfc_receptor) });

            // ? CARACTERISTICAS
            var oneWorldFeature = runtime.isFeatureInEffect({ feature: 'subsidiaries' });
            log.audit({title: 'oneWorldFeature', details: oneWorldFeature});
            var suiteTaxFeature = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
            log.audit({title: 'suiteTaxFeature', details: suiteTaxFeature});

            try {
                if (suiteTaxFeature && oneWorldFeature) {
                    registroCompania = record.load({
                        type: record.Type.SUBSIDIARY,
                        id: subsi,
                    });
                    var lineCount = registroCompania.getLineCount({
                        sublistId: 'taxregistration',
                    });

                    var pais = '';
                    for (var i = 0; i < lineCount; i++) {
                        pais = registroCompania.getSublistValue({
                            sublistId: 'taxregistration',
                            fieldId: 'nexuscountry',
                            line: i,
                        });
                        if (pais === 'MX') {
                            var rfc_emisor = registroCompania.getSublistValue({
                                sublistId: 'taxregistration',
                                fieldId: 'taxregistrationnumber',
                                line: i,
                            });
                            // log.audit({title: 'rfc_emisor_suitax&ow', details: rfc_emisor});
                            break;
                        }
                    }
                } else if (oneWorldFeature) {
                    registroCompania = record.load({
                        type: record.Type.SUBSIDIARY,
                        id: subsi,
                    });
                    var rfc_emisor = registroCompania.getValue('federalidnumber');
                    log.audit({title: 'rfc_emisor_ow', details: rfc_emisor});
                } else {
                    registroCompania = config.load({
                        type: config.Type.COMPANY_INFORMATION,
                    });
                    var rfc_emisor = registroCompania.getValue('employerid');
                    log.audit({title: 'rfc_emisor_stx', details: rfc_emisor});
                }

                var dataConectionPac = getPacConection();
                log.audit({ title: 'dataConectionPac', details: dataConectionPac });
                if (dataConectionPac.pruebas) {
                    var url_service = dataConectionPac.url_status_sb
                } else {
                    var url_service = dataConectionPac.url_status_prod
                }

                var obj_data_xml = search.lookupFields({
                    type: trantype,
                    id: tranid,
                    columns: 'custbody_fb_tp_xml_data'
                }) || '';
                log.audit({ title: 'obj_data_xml', details: obj_data_xml});
                var datos_xml = obj_data_xml.custbody_fb_tp_xml_data;
                var obj_parsed = JSON.parse(datos_xml)
                log.audit({title: 'obj_parsed', details: obj_parsed});

                var sello_digital_emisor = obj_parsed.sello;
                log.audit({title: 'sello:', details: sello_digital_emisor});
                var total_comprobante = obj_parsed.total_xml;
                log.audit({title: 'total:', details: total_comprobante});


                log.audit({ title: 'datos:', details: { rfc_emisor: rfc_emisor, rfc_receptor: rfc_receptor, total_comprobante: total_comprobante, uuid_comprobante: uuid_comprobante, sello_digital_emisor: sello_digital_emisor } });

                xmlSend = xmlConsultaEstatusSat(rfc_emisor, rfc_receptor, total_comprobante, uuid_comprobante, sello_digital_emisor);

                if (xmlSend) {
                    var headers = {
                        'SOAPAction': 'http://tempuri.org/IConsultaCFDIService/Consulta',
                        'Content-Type': 'text/xml;charset=UTF-8',
                        'Accept': 'text/xml'
                    };
                    var url_service = 'https://consultaqr.facturaelectronica.sat.gob.mx/ConsultaCFDIService.svc'
                    log.audit({ title: 'datos de la peticion', details: { headers: headers, url: url_service, body: xmlSend } });
                    var response = https.post({
                        headers: {
                            'Content-Type': 'text/xml;charset=UTF-8',
                            'SOAPAction': 'http://tempuri.org/IConsultaCFDIService/Consulta',
                            'Accept': 'text/xml'
                        },
                        url: url_service,
                        body: xmlSend,
                    });
                    log.audit({ title: 'respuesta_sat', details: response });

                    var responseCode = response.code || 0;
                    var responseBody = response.body || '';

                    log.audit({ title: 'responseCode', details: responseCode });
                    // log.audit({ title: 'responseBody', details: responseBody });
                    if (responseCode == 200) {
                        //log.audit({ title: 'responseBody', details: responseBody });
                        var xmlDocument = xml.Parser.fromString({
                            text: responseBody
                        });

                        //  log.audit({ title: 'xmlDocument', details: xmlDocument });

                        var anyType = xml.XPath.select({
                            node: xmlDocument,
                            xpath: 's:Envelope//s:Body'
                        });
                        log.audit({ title: 'anyType[2].textContent', details: JSON.stringify(anyType) });

                        var xmldoc = anyType[0].textContent;
                        log.audit({ title: 'xmldoc', details: JSON.stringify(xmldoc) });
                        log.audit({ title: 'trantype', details: JSON.stringify(trantype) });
                        log.audit({ title: 'tranid', details: JSON.stringify(tranid) });
                        var id = record.submitFields({
                            type: trantype,
                            id: tranid,
                            values: {
                                custbody_efx_fe_cfdistatus: xmldoc,
                            },
                            options: {
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            }
                        });
                        log.debug("updated id", id)

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

                record.submitFields({
                    type: trantype,
                    id: tranid,
                    values: {
                        custbody_efx_fe_cfdistatus: messageResponseText,
                    },
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    }
                });

                return mensajeError;
            }
            log.audit({ title: 'messageResponse', details: JSON.stringify(messageResponse) });

        }


        function xmlConsultaEstatusSat(rfc_emisor, rfc_receptor, total_comprobante, uuid_comprobante, sello_digital_emisor) {
            var xmlReturn = '';
            /* xmlReturn += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">';
            xmlReturn += '    <soapenv:Header/>';
            xmlReturn += '    <soapenv:Body>';
            xmlReturn += '        <tem:ConsultaEstatusSat>';
            xmlReturn += '            <tem:usuarioIntegrador>' + usuarioIntegrador + '</tem:usuarioIntegrador>';
            xmlReturn += '            <tem:folioUUID>' + folioUUID + '</tem:folioUUID>';
            xmlReturn += '        </tem:ConsultaEstatusSat>';
            xmlReturn += '    </soapenv:Body>';
            xmlReturn += '</soapenv:Envelope>'; */

            xmlReturn += '<soapenv:Envelope';
            xmlReturn += ' xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"';
            xmlReturn += ' xmlns:tem="http://tempuri.org/">';
            xmlReturn += '<soapenv:Header/>';
            xmlReturn += '<soapenv:Body>';
            xmlReturn += ' <tem:Consulta>';
            xmlReturn += '<tem:expresionImpresa>';
            //xmlReturn += '               <![CDATA[?re=CAU180123GEA&rr=GACM650215GH9&tt=398.39&id=f5ee9a7f-a60d-483c-a2a0-9ffae1edb5ea&fe=uDu8/g==]]>';
            xmlReturn += '                <![CDATA[?' + 're=' + rfc_emisor + '&rr=' + rfc_receptor + '&tt=' + total_comprobante + '&id=' + uuid_comprobante + '&fe=' + sello_digital_emisor + ']]>';
            xmlReturn += '            </tem:expresionImpresa>';
            xmlReturn += '        </tem:Consulta>';
            xmlReturn += '    </soapenv:Body>';
            xmlReturn += '</soapenv:Envelope>';

            log.audit({ title: 'xmlReturn xmlConsultaEstatusSat', details: xmlReturn });
            return xmlReturn;
        }

        function getPacConection() {
            try{
                var objPacConection = {
                    url: '',
                    user: '',
                    mailuser: '',
                    https: '',
                    pruebas: '',
                    emisorPrueba: '',
                    urlPrueba: '',
                    userPrueba: '',
                    url_status_prod: '',
                    url_status_sb: '',
                }
                var idConection = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_connect_pac_data' });
                var conectionObj = record.load({
                    type: 'customrecord_efx_fe_mtd_envio',
                    id: idConection
                });
                objPacConection.url = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_url' });
                objPacConection.user = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_user' });
                objPacConection.mailuser = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_user_email' });
                objPacConection.https = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_https' });
                objPacConection.pruebas = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_test' });
                objPacConection.emisorPrueba = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_emisor_pb' });
                objPacConection.urlPrueba = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_urltest' });
                objPacConection.userPrueba = conectionObj.getValue({ fieldId: 'custrecord_efx_fe_mtd_env_usertest' });
                // objPacConection.url_status_prod = conectionObj.getValue({ fieldId: 'custrecord_fb_tp_status_prod' });
                // objPacConection.url_status_sb = conectionObj.getValue({ fieldId: 'custrecord_fb_tp_status_sb' });
    
                return objPacConection;
            }catch(err){
                log.error({title:'getPacConection',details:err});

            }
            
        }


        return {
            onRequest: main
        };
    });
