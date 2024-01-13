/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/log', 'N/ui/serverWidget', 'N/record', 'N/runtime', 'N/http','N/https', 'N/config', 'N/search', 'N/xml', 'N/file', 'N/render','N/format','N/url','N/redirect','N/transaction'],
    function (log, ui, record, runtime, http,https,  config, search, xml, file, render, format,urlmod,redirect,transaction) {
        function cancel_cfdi(context) {
            var section = '';
            var scriptObj = runtime.getCurrentScript();
            try {
                if (context.request.method === 'GET') {
                    section = 'Get Parameters';
                    {
                        var tranid = context.request.parameters.custparam_tranid || '';

                        var trantype = context.request.parameters.custparam_trantype || '';
                        var sustituir = context.request.parameters.custparam_sutituye || '';
                        var cancelacionAutomatica = context.request.parameters.custparam_pa == 'T';
                        log.audit({ title: 'Get', details: 'tranid: ' + tranid + 'trantype: ' + trantype });

                        var searchTypeTran = '';
                        if (trantype == 'invoice') {
                            searchTypeTran = search.Type.INVOICE;
                        }
                        else if (trantype == 'cashsale') {
                            searchTypeTran = search.Type.CASH_SALE;
                        }
                        else if (trantype == 'creditmemo') {
                            searchTypeTran = search.Type.CREDIT_MEMO;
                        }
                        else if (trantype == 'customerpayment') {
                            searchTypeTran = search.Type.CUSTOMER_PAYMENT;
                        }else if (trantype == 'customsale_efx_fe_factura_global') {
                            searchTypeTran = 'customsale_efx_fe_factura_global';
                        }else if (trantype == 'customrecord_efx_pagos_compensacion') {
                            searchTypeTran = 'customrecord_efx_pagos_compensacion';
                        }


                    }

                        getNetSuite(context, scriptObj, tranid, trantype, searchTypeTran, cancelacionAutomatica,sustituir);

                }
            }
            catch (err) {
                logError(section, err);
                throw err;
            }
        }
        function getNetSuite(context, scriptObj, tranid, trantype, searchTypeTran, cancelacionAutomatica,sustituir) {
            var errorConfig = [];
            var errorConfig_2 = [];
            var errorConfig_3 = [];
            var existError = false;
            var errorTitle = '';
            var errorDetails = '';
            var rfcEmisor = '';
            var uuid = '';
            var url = '';
            var usuarioIntegrador = '';
            section = 'Get Feature';
            {
                var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
                log.audit({ title: 'SUBSIDIARIES', details: JSON.stringify(SUBSIDIARIES) });

            }

            section = 'uuid, rfc factura global'
            {
                var idGlb = '';

                if(searchTypeTran == 'customrecord_efx_pagos_compensacion'){
                    var columns = [
                        { name: 'custrecord_efx_compensacion_uuid' },
                        { name: 'custrecord_efx_compensacion_rfc' }
                    ];
                }else{
                    var columns = [
                        { name: 'custbody_mx_cfdi_uuid' }
                    ];
                    if (SUBSIDIARIES) {
                        columns.push({ name: 'subsidiary' });
                    }
                }

                if(searchTypeTran == 'customrecord_efx_pagos_compensacion'){
                    var result = search.create({
                        type: searchTypeTran,
                        filters:
                            [
                                ['internalid', search.Operator.ANYOF, tranid],
                            ],
                        columns: columns
                    });
                }else{
                    var result = search.create({
                        type: searchTypeTran,
                        filters:
                            [
                                ['mainline', 'is', 'T'], 'and',
                                ['taxline', 'is', 'F'], 'and',
                                ['internalid', search.Operator.ANYOF, tranid],
                            ],
                        columns: columns
                    });
                }

                var subsidiary = '';
                var resultData = result.run();
                var start = 0;
                do {
                    var resultSet = resultData.getRange(start, start + 1000);
                    if (resultSet && resultSet.length > 0) {
                        for (var i = 0; i < resultSet.length; i++) {

                            if(searchTypeTran == 'customrecord_efx_pagos_compensacion'){
                                uuid = resultSet[i].getValue({ name: 'custrecord_efx_compensacion_uuid' }) || '';
                                rfcEmisor = resultSet[i].getValue({ name: 'custrecord_efx_compensacion_rfc' }) || '';
                            }else{
                                uuid = resultSet[i].getValue({ name: 'custbody_mx_cfdi_uuid' }) || '';

                                if (SUBSIDIARIES) {
                                    subsidiary = resultSet[i].getValue({ name: 'subsidiary' }) || '';
                                }
                            }
                        }
                    }
                    start += 1000;
                } while (resultSet && resultSet.length == 1000);

                if(searchTypeTran != 'customrecord_efx_pagos_compensacion') {
                    if (!SUBSIDIARIES) {
                        var configRecObj = config.load({
                            type: config.Type.COMPANY_INFORMATION
                        });
                        rfcEmisor = configRecObj.getValue({fieldId: 'employerid'});
                    } else if (SUBSIDIARIES && subsidiary) {
                        var resultSub = record.load({
                            type: search.Type.SUBSIDIARY,
                            id: subsidiary,
                        });
                        rfcEmisor = resultSub.getValue({fieldId: "federalidnumber"});
                    }
                }
            }

            var dataConectionPac = getPacConection();
            log.audit({ title: 'dataConectionPac', details: dataConectionPac });

            var headersPos = {};
            var xmlSatSend = '';
            var xpathBode = '';
                headersPos = {
                    'SOAPAction': 'http://tempuri.org/CancelaCFDI',
                    'Content-Type': 'text/xml'
                };
            var url_pac = '';
            var usuario_integrador = '';

                    usuario_integrador = dataConectionPac.user;
                    url_pac = dataConectionPac.url;



                xmlSatSend = xmlCancelSendSat(usuario_integrador, rfcEmisor, uuid);
                xpathBode = 'soap:Envelope//soap:Body//nlapi:CancelaCFDIResponse//nlapi:CancelaCFDIResult//nlapi:anyType';

            log.audit({ title: 'headersPos', details: headersPos });
            log.audit({ title: 'xmlSatSend', details: xmlSatSend });


            var response = https.post({
                url: url_pac,
                headers: headersPos,
                body: xmlSatSend
            });

            log.audit({ title: 'response ', details: response });
            var responseBody = response.body;

            log.audit({ title: 'responseBody', details: responseBody });

            var xmlDocument = xml.Parser.fromString({
                text: responseBody
            });

            log.audit({ title: 'xmlDocument', details: xmlDocument });

            var anyType = xml.XPath.select({
                node: xmlDocument,
                xpath: xpathBode
            });

            log.audit({ title: 'anyType xml.XPath.select', details: JSON.stringify(anyType) });

            var statusCode = anyType[6].textContent;
            var mesageResponse = anyType[7].textContent;
            var acuseCancelacion = '';


            if(parseInt(statusCode) != 330278 && parseInt(statusCode) != 330242) {
                if (parseInt(statusCode) == 0 || parseInt(statusCode) == 330280) {
                    log.audit({
                        title: "factura cancelada",
                        details: 'statusCode: ' + statusCode + 'mesageResponse: ' + mesageResponse
                    });

                    acuseCancelacion = xml.escape({
                        xmlText: anyType[2].textContent + '. '+anyType[8].textContent
                    });
                    log.audit({title: "acuseCancelacion", details: acuseCancelacion});
                    log.audit({title: "factura global", details: idGlb});
                    log.audit({title: 'tranid', details: tranid});
                    try {
                        var rec = record.load({
                            id: tranid,
                            type: trantype
                        });
                        if(searchTypeTran != 'customrecord_efx_pagos_compensacion') {
                            var customer = rec.getValue({
                                fieldId: 'entity'
                            }) || '';

                            var sustituido = rec.getValue({
                                fieldId: 'custbody_efx_fe_sustitucion'
                            }) || '';
                        }


                        if (sustituir == 'T') {
                            var sustituto_rec_ = record.copy({
                                type: trantype,
                                id: tranid,
                                isDynamic: true,
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_mx_cfdi_sat_addendum',
                                value: '',
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_mx_cfdi_usage',
                                value: 2,
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_efx_fe_acuse_cancel',
                                value: '',
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_efx_fe_cfdistatus',
                                value: '',
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_efx_fe_cfdi_cancelled',
                                value: false,
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_mx_cfdi_uuid',
                                value: '',
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_mx_cfdi_certify_timestamp',
                                value: '',
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_edoc_generated_pdf',
                                value: '',
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_psg_ei_generated_edoc',
                                value: '',
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_psg_ei_certified_edoc',
                                value: '',
                                ignoreFieldChange: true
                            });

                            sustituto_rec_.setValue({
                                fieldId: 'custbody_psg_ei_content',
                                value: '',
                                ignoreFieldChange: true
                            });
                            sustituto_rec_.setValue({
                                fieldId: 'custbody_psg_ei_status',
                                value: 1,
                                ignoreFieldChange: true
                            });

                            var sustituto_rec = sustituto_rec_.save({
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            });

                            log.audit({title: 'sustituto_rec', details: sustituto_rec});

                            rec.setValue({
                                fieldId: 'custbody_efx_fe_sustitucion',
                                value: sustituto_rec,
                                ignoreFieldChange: true
                            });
                        }

                        if(searchTypeTran == 'customrecord_efx_pagos_compensacion') {
                            rec.setValue({
                                fieldId: 'custrecord_efx_compensacion_cancel',
                                value: true,
                                ignoreFieldChange: true
                            });
                        }else{
                            rec.setValue({
                                fieldId: 'custbody_efx_fe_cfdi_cancelled',
                                value: true,
                                ignoreFieldChange: true
                            });
                        }




                        if (acuseCancelacion != '') {
                            if(searchTypeTran == 'customrecord_efx_pagos_compensacion') {
                                rec.setValue({
                                    fieldId: 'custrecord_efx_compensacion_acuse',
                                    value: acuseCancelacion,
                                    ignoreFieldChange: true
                                });
                            }else{
                                rec.setValue({
                                    fieldId: 'custbody_efx_fe_acuse_cancel',
                                    value: acuseCancelacion,
                                    ignoreFieldChange: true
                                });
                            }

                        }

                        var estado_fact = rec.getValue({fieldId:'statusRef'});
                        log.audit({title:'estado_fact',details:estado_fact});
                        rec.save({
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        });
                        if (sustituir == 'T') {
                            var related_cfdi = record.create({
                                type: 'customrecord_mx_related_cfdi_subl',
                                isDynamic: true
                            });

                            related_cfdi.setValue({
                                fieldId: 'custrecord_mx_rcs_orig_trans',
                                value: sustituto_rec
                            });

                            related_cfdi.setValue({
                                fieldId: 'custrecord_mx_rcs_rel_type',
                                value: 4
                            });

                            related_cfdi.setValue({
                                fieldId: 'custrecord_mx_rcs_rel_cfdi',
                                value: tranid
                            });

                            related_cfdi.setValue({
                                fieldId: 'custrecord_mx_rcs_uuid',
                                value: uuid
                            });


                            var id_related = related_cfdi.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });

                            var id_obj = {
                                id_tran: sustituto_rec
                            };


                            if(estado_fact!='paidInFull'){
                                log.audit({title:'tranid',details:tranid});
                                log.audit({title:'estado_fact',details:estado_fact});
                                try{
                                    transaction.void({
                                        type: transaction.Type.INVOICE,
                                        id: tranid
                                    });
                                }catch(error_void){
                                    log.audit({title:'error_void',details:error_void});
                                    transaction.void({
                                        type: record.Type.INVOICE,
                                        id: tranid
                                    });
                                }

                            }

                            context.response.write(JSON.stringify(id_obj));
                        }


                    } catch (error) {
                        log.audit({title: 'error', details: JSON.stringify(error)});
                    }


                } else {
                    existError = true;
                    errorTitle = anyType[7].textContent;
                    errorDetails = anyType[8].textContent;
                    var rec = record.load({
                        id: tranid,
                        type: trantype
                    });

                    if (sustituir == 'T') {
                        var sustituto_rec_ = record.copy({
                            type: trantype,
                            id: tranid,
                            isDynamic: true,
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_mx_cfdi_sat_addendum',
                            value: '',
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_mx_cfdi_usage',
                            value: 2,
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_efx_fe_acuse_cancel',
                            value: '',
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_efx_fe_cfdistatus',
                            value: '',
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_efx_fe_cfdi_cancelled',
                            value: false,
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_mx_cfdi_uuid',
                            value: '',
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_mx_cfdi_certify_timestamp',
                            value: '',
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_edoc_generated_pdf',
                            value: '',
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_psg_ei_generated_edoc',
                            value: '',
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_psg_ei_certified_edoc',
                            value: '',
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_psg_ei_content',
                            value: '',
                            ignoreFieldChange: true
                        });

                        sustituto_rec_.setValue({
                            fieldId: 'custbody_psg_ei_status',
                            value: 1,
                            ignoreFieldChange: true
                        });

                        var sustituto_rec = sustituto_rec_.save({
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        });

                        log.audit({title: 'sustituto_rec', details: sustituto_rec});

                        rec.setValue({
                            fieldId: 'custbody_efx_fe_sustitucion',
                            value: sustituto_rec,
                            ignoreFieldChange: true
                        });
                    }

                    if(searchTypeTran == 'customrecord_efx_pagos_compensacion') {
                        rec.setValue({
                            fieldId: 'custrecord_efx_compensacion_cancel',
                            value: false,
                            ignoreFieldChange: true
                        });
                    }else{
                        rec.setValue({
                            fieldId: 'custbody_efx_fe_cfdi_cancelled',
                            value: false,
                            ignoreFieldChange: true
                        });
                    }



                    if (errorTitle != '') {
                        if(searchTypeTran == 'customrecord_efx_pagos_compensacion') {
                            rec.setValue({
                                fieldId: 'custrecord_efx_compensacion_acuse',
                                value: errorTitle,
                                ignoreFieldChange: true
                            });
                        }else {
                            rec.setValue({
                                fieldId: 'custbody_efx_fe_acuse_cancel',
                                value: errorTitle,
                                ignoreFieldChange: true
                            });
                        }
                    }

                    var estado_fact = rec.getValue({fieldId:'statusRef'});
                    rec.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });

                    if (sustituir == 'T') {
                        var related_cfdi = record.create({
                            type: 'customrecord_mx_related_cfdi_subl',
                            isDynamic: true
                        });

                        related_cfdi.setValue({
                            fieldId: 'custrecord_mx_rcs_orig_trans',
                            value: sustituto_rec
                        });

                        related_cfdi.setValue({
                            fieldId: 'custrecord_mx_rcs_rel_type',
                            value: 4
                        });

                        related_cfdi.setValue({
                            fieldId: 'custrecord_mx_rcs_rel_cfdi',
                            value: tranid
                        });

                        related_cfdi.setValue({
                            fieldId: 'custrecord_mx_rcs_uuid',
                            value: uuid
                        });


                        var id_related = related_cfdi.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });


                        var id_obj = {
                            id_tran: sustituto_rec
                        };



                        if(estado_fact!='paidInFull'){
                            transaction.void({
                                type: record.Type.INVOICE,
                                id: tranid
                            });
                        }
                        context.response.write(JSON.stringify(id_obj));
                    }

                }

            }else{

                    var rec = record.load({
                        id: tranid,
                        type: trantype
                    });

                if(searchTypeTran == 'customrecord_efx_pagos_compensacion') {
                    rec.setValue({
                        fieldId: 'custrecord_efx_compensacion_cancel',
                        value: false,
                        ignoreFieldChange: true
                    });
                    rec.setValue({
                        fieldId: 'custrecord_efx_compensacion_acuse',
                        value: mesageResponse,
                        ignoreFieldChange: true
                    });
                }else {
                    rec.setValue({
                        fieldId: 'custbody_efx_fe_cfdi_cancelled',
                        value: false,
                        ignoreFieldChange: true
                    });
                    rec.setValue({
                        fieldId: 'custbody_efx_fe_acuse_cancel',
                        value: mesageResponse,
                        ignoreFieldChange: true
                    });
                }
                    rec.save({
                        enableSourcing: false,
                        ignoreMandatoryFields: true
                    });


            }
        }

        function xmlCancelSendSat(usuarioIntegrador, rfcEmisor, uuid) {
            log.audit({ title: 'parametro xmlCancelSendSat', details: 'usuarioIntegrador: ' + usuarioIntegrador + ' rfcEmisor: ' + rfcEmisor + ' uuid: ' + uuid });
            var xmlCancel = '';
            xmlCancel += '<?xml version="1.0" encoding="utf-8"?>';
            xmlCancel += '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">';
            xmlCancel += '<soap12:Body>';
            xmlCancel += '    <CancelaCFDI xmlns="http://tempuri.org/">';
            xmlCancel += '    <usuarioIntegrador>' + usuarioIntegrador + '</usuarioIntegrador>';
            xmlCancel += '    <rfcEmisor>' + rfcEmisor + '</rfcEmisor>';
            xmlCancel += '    <folioUUID>' + uuid + '</folioUUID>';
            xmlCancel += '    </CancelaCFDI>';
            xmlCancel += '</soap12:Body>';
            xmlCancel += '</soap12:Envelope>';
            return xmlCancel;
        }

        function logError(section, err) {
            var err_Details = "";

            if (err instanceof nlobjError) {
                err_Details = err.getDetails();
            }
            else {
                err_Details = err.message;
            }

            log.error({ title: 'Error Notification on ' + section, details: err_Details });
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

            var uuser = runtime.getCurrentScript().getParameter({name: 'custscript_efx_cancel_user'});
            var puser = runtime.getCurrentScript().getParameter({name: 'custscript_efx_cancel_url'});
            // var conectionObj = record.load({
            //     type:'customrecord_efx_fe_mtd_envio',
            //     id:idConection
            // });
            objPacConection.url = puser;
            objPacConection.user = uuser;
            // objPacConection.mailuser = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_user_email'});
            // objPacConection.https = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_https'});
            // objPacConection.pruebas = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_test'});
            // objPacConection.emisorPrueba = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_emisor_pb'});
            // objPacConection.urlPrueba = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_urltest'});
            // objPacConection.userPrueba = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_usertest'});
            // objPacConection.urlValidador = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_urlvalid'});
            // objPacConection.userValidador = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_uservalid'});

            return objPacConection;
        }


        return {
            onRequest: cancel_cfdi
        };
    });