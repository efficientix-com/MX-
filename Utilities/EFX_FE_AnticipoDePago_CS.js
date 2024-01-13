
/**
*@NApiVersion 2.x
*@NModuleScope Public
@NScriptType ClientScript
*/

define(['N/url', 'N/record','N/runtime','N/ui/message','N/https','N/search','N/currentRecord'], function (url, record,runtime,mensajes,https,search,currentRecord) {

    function pageInit(context) {
        var currentRecord = context.currentRecord;
        var ckRefresh = currentRecord.getValue({
            fieldId: 'custpage_ck_refresh'
        });

        if (ckRefresh) {
            window.opener.location.reload();
        }
    }

    function fieldChanged(context) {

        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        var line = context.line;
        
        if (sublistName === 'custpage_sublist' && sublistFieldName === 'custpage_sublist_importe_aplicar') {

            var disponible = parseFloat(currentRecord.getCurrentSublistValue({ fieldId: 'custpage_sublist_importe_disponible', sublistId: 'custpage_sublist' })) || 0;
            var aplicar = parseFloat(currentRecord.getCurrentSublistValue({ fieldId: 'custpage_sublist_importe_aplicar', sublistId: 'custpage_sublist' })) || 0;

            if (aplicar > disponible) {
                alert('El importe a aplicar es mayor al de la factura.');
            }
        }
    }

    

    function Cerrar() {
        window.close();
    }

    function guardar(){

        var resultObj = {};
        var existLineToApply = false;
        var error = false;
        var errorMessage = '';
        var totalAplicados = 0;

        var record = currentRecord.get();
        var lines = record.getLineCount({ sublistId: 'custpage_sublist' });
        var objAnticipoAplicar = {};
        var arrayUuid = [];
        var tranid = record.getValue({ fieldId: 'custpage_tranid' }) || '';

        borrarelacioncfdi(tranid);

        for (var l = 0; l < lines; l++) {

            var ap = record.getSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_sublist_ap', line: l });
            var factura = record.getSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_sublist_tranid', line: l });
            var uuid = record.getSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_sublist_uuid', line: l });
            var importeAplicar = record.getSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_sublist_importe_aplicar', line: l });

            if (importeAplicar && !existLineToApply) {
                existLineToApply = true;
            }

            if (!objAnticipoAplicar[factura] && parseFloat(importeAplicar) > 0 && uuid) {
                objAnticipoAplicar[factura] = {
                    id: ap,
                    uuid: uuid,
                    importeAplicar: importeAplicar
                };

                arrayUuid.push(uuid);

                generarelacioncfdi(tranid,factura,uuid,7);
            }

            var importeDisponible = parseFloat(record.getSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_sublist_importe_disponible', line: l })) || 0;
            importeAplicar = parseFloat(importeAplicar) || 0;

            totalAplicados += importeAplicar;

            if (importeAplicar > importeDisponible) {
                var cL = l + 1;
                error = true;
                if (errorMessage) errorMessage += '\n'
                errorMessage += 'El importe a aplicar es mayor al de la factura. Linea: ' + cL;
            }
        }

        if (!existLineToApply) {
            alert('Para aplicar, al menos debe ingresar un monto.');
            return false;
        }

        
        var total = parseFloat(record.getValue({ fieldId: 'custpage_total' })) || 0;
        if (totalAplicados > total) {
            alert('El total de importes aplicados "' + totalAplicados + '", es mayor al total de la Factura "' + total + '."');
            return false;
        }

        if (error) {
            alert(errorMessage);
            return false;
        }


        var envia_correo_auto = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_autosendmail'});
        var myMsg_create = mensajes.create({
            title: "Generación",
            message: "Se está generando y certificando su CFDI...",
            type: mensajes.Type.INFORMATION
        });
        myMsg_create.show();

        
        
                
                var trantype = record.getValue({ fieldId: 'custpage_trantype' }) || '';
                var total = record.getValue({ fieldId: 'custpage_total' }) || '';
                var entity = record.getValue({ fieldId: 'custpage_entity' }) || '';
                var location = record.getValue({ fieldId: 'custpage_location' }) || '';
                var fpagoantText = record.getText({ fieldId: 'custpage_fpagoanticipo' }) || '';
                var fpagoantValue = record.getValue({ fieldId: 'custpage_fpagoanticipo' }) || '';
                //GENERAR DOCUMENTO

                var suiteletURL = url.resolveScript({
                    scriptId: "customscript_efx_fe_xml_generator",
                    deploymentId: "customdeploy_efx_fe_xml_generator",
                    params: {
                        tranid: tranid,
                        trantype: trantype,
                        
                    }
                });
                console.log(suiteletURL);


                https.request.promise({
                    method: https.Method.GET,
                    url: suiteletURL
                })
                    .then(function (response) {

                        var body = JSON.parse(response.body)
                        console.log(body);

                        console.log('success ', body.success);

                        if (body.success) {
                            try {
                                console.log('success entra ', body.success);
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Generación",
                                    message: "Se generó su documento electrónico.",
                                    type: mensajes.Type.CONFIRMATION
                                });
                                myMsg.show({duration: 5500});

                                console.log('respuesta');
                                var myMsg_cert = mensajes.create({
                                    title: "Certificación",
                                    message: "Se está certificando su CFDI...",
                                    type: mensajes.Type.INFORMATION
                                });
                                myMsg_cert.show();
                                myMsg.hide();
                            } catch (error) {
                                console.log(error);
                            }
                                    if (body.success) {

                                        var fieldLookUp = search.lookupFields({
                                            type: trantype,
                                            id: tranid,
                                            columns: ['custbody_mx_cfdi_uuid', 'custbody_psg_ei_certified_edoc']
                                        });

                                        var uuid_record = fieldLookUp['custbody_mx_cfdi_uuid'];
                                        var xml_record = fieldLookUp['custbody_psg_ei_certified_edoc'];
                                        console.log('fieldLookUp: ', fieldLookUp);
                                        console.log('uuid: ', uuid_record);
                                        console.log('xml: ', xml_record);

                                        if (uuid_record) {
                                            myMsg_cert.hide();
                                            var myMsg_certd = mensajes.create({
                                                title: "Certificación",
                                                message: "Se Certificó su documento electrónico.",
                                                type: mensajes.Type.CONFIRMATION
                                            });
                                            myMsg_certd.show({duration: 5500});
                                            if(envia_correo_auto){
                                                try {
                                                    myMsg_certd.hide();

                                                    var myMsg_mail = mensajes.create({
                                                        title: "Envio de Correo",
                                                        message: "Enviando documentos por correo electrónico...",
                                                        type: mensajes.Type.INFORMATION
                                                    });
                                                    myMsg_mail.show();
                                                    myMsg_certd.hide();
                                                } catch (error) {
                                                    console.log(error);
                                                }

                                                //Envio de correo
                                                var suiteletURL = url.resolveScript({
                                                    scriptId: "customscript_efx_fe_mail_sender_sl",
                                                    deploymentId: "customdeploy_efx_fe_mail_sender_sl",
                                                    params: {
                                                        tranid: tranid,
                                                        trantype: trantype,
                                                    }
                                                });
                                                console.log(suiteletURL);


                                                https.request.promise({
                                                    method: https.Method.GET,
                                                    url: suiteletURL
                                                })
                                                    .then(function (response) {
                                                        log.debug({
                                                            title: 'Response',
                                                            details: response
                                                        });

                                                    }).catch(function onRejected(reason) {
                                                    log.debug({
                                                        title: 'Invalid Request Mail: ',
                                                        details: reason
                                                    });
                                                });
                                            }

                                            //consume anticipo

                                            try {
                                                myMsg_certd.hide();

                                                var myMsg_anticipo = mensajes.create({
                                                    title: "Anticipo",
                                                    message: "Actualizando información de anticipo...",
                                                    type: mensajes.Type.INFORMATION
                                                });
                                                myMsg_anticipo.show();
                                                myMsg_certd.hide();
                                            } catch (error) {
                                                console.log(error);
                                            }

                                            //consume anticip0
                                            var url_Script = url.resolveScript({
                                                scriptId: 'customscript_efx_fe_antpag_sl',
                                                deploymentId: 'customdeploy_efx_fe_antpag_sl'
                                            });

                                            url_Script += '&custparam_total=' + total;
                                            url_Script += '&custparam_entity=' + entity;
                                            url_Script += '&custparam_location=' + location;
                                            url_Script += '&custparam_tranid=' + tranid;
                                            url_Script += '&custparam_trantype=' + trantype;
                                            url_Script += '&custparam_fpagoantText=' + fpagoantText;
                                            url_Script += '&custparam_fpagoantValue=' + fpagoantValue;
                                            console.log(url_Script);


                                            https.request.promise({
                                                method: https.Method.POST,
                                                url: url_Script,
                                                body: JSON.stringify(objAnticipoAplicar)
                                            })
                                                .then(function (response) {
                                                    log.debug({
                                                        title: 'Response',
                                                        details: response
                                                    });
                                                    console.log('Response anticipo',response);

                                                }).catch(function onRejected(reason) {
                                                log.debug({
                                                    title: 'Error: ',
                                                    details: reason
                                                });
                                            });
                                            

                                        } else {
                                            myMsg_cert.hide();
                                            var myMsg = mensajes.create({
                                                title: "Certificación",
                                                message: "Ocurrio un error durante su certificacion",
                                                type: mensajes.Type.ERROR
                                            });
                                            myMsg.show();
                                            alert('Ocurrio un error durante su certificacion, validar en la pestaña de documento electrónico de la transacción para más detalles, la ventana se cerrará');
                                        }


                                        console.log('respuesta');
                                        //location.reload();
                                        //alert('exito');
                                        window.opener.location.reload(false);
                                        window.close();

                                    } else {
                                        myMsg_cert.hide();
                                        var myMsg = mensajes.create({
                                            title: "Certificación",
                                            message: "Ocurrio un error durante su certificacion",
                                            type: mensajes.Type.ERROR
                                        });
                                        myMsg.show();
                                        alert('Ocurrio un error durante su certificacion, validar en la pestaña de documento electrónico de la transacción para más detalles, la ventana se cerrará');
                                    }
                            } else {
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Generación",
                                    message: "Ocurrio un error durante su generación",
                                    type: mensajes.Type.ERROR
                                });
                                myMsg.show();
                                alert('Ocurrio un error durante su certificacion, validar en la pestaña de documento electrónico de la transacción para más detalles, la ventana se cerrará');
                            }

                    })
                    .catch(function onRejected(reason) {
                        log.debug({
                            title: 'Invalid Request: ',
                            details: reason
                        });
                    });


                    
        /*var current = window.opener.require('N/currentRecord');
        var currentRec = current.get();
        currentRec.setValue({ fieldId: 'custpage_invrelation_sat', value: '07' });
        currentRec.setValue({ fieldId: 'custpage_uuidrel_sat', value: arrayUuid.join(',') });
        currentRec.setValue({ fieldId: 'custpage_result_anticipo', value: JSON.stringify(objAnticipoAplicar) });*/            

        

        }
        function borrarelacioncfdi(tranid){
            var buscarelaciones = search.create({
                type: 'customrecord_mx_related_cfdi_subl',
                filters: [
                    ['isinactive', search.Operator.IS, 'F']
                    , 'AND',
                    ['custrecord_mx_rcs_orig_trans', search.Operator.ANYOF, tranid]
                ],
                columns: [
                    search.createColumn({name: 'custrecord_mx_rcs_orig_trans'}),
                    search.createColumn({name: 'internalid'}),
                ]
            });

            var ejecutar_rl = buscarelaciones.run();
            var numRelaciones = buscarelaciones.runPaged().count;
            var resultado_rl = ejecutar_rl.getRange(0, 100);

            if (numRelaciones > 0) {
                for (var i = 0; i < resultado_rl.length; i++) {
                    var id_relateds = resultado_rl[i].getValue({name: 'internalid'});
                    log.audit({title: 'id_relateds', details: id_relateds});
                    try {
                        var relacionBorra = record.delete({
                            type: 'customrecord_mx_related_cfdi_subl',
                            id: id_relateds,
                        });

                        log.audit({title: 'relacionBorra', details: relacionBorra});
                    } catch (borrarecordrelated) {
                        log.audit({title: 'borrarecordrelated', details: borrarecordrelated});
                    }

                }
            }
        }

        function generarelacioncfdi(tranid,factura,uuid,tiporelated){
            var related_cfdi = record.create({
                type: 'customrecord_mx_related_cfdi_subl',
                isDynamic: true
            });

            related_cfdi.setValue({
                fieldId: 'custrecord_mx_rcs_rel_type',
                value: tiporelated
            });

            related_cfdi.setValue({
                fieldId: 'custrecord_mx_rcs_orig_trans',
                value: tranid
            });


            related_cfdi.setValue({
                fieldId: 'custrecord_mx_rcs_rel_cfdi',
                value: factura
            });

            related_cfdi.setValue({
                fieldId: 'custrecord_mx_rcs_uuid',
                value: uuid
            });
                
            var id_related = related_cfdi.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
        }

    return {
        Cerrar: Cerrar,
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        guardar:guardar
    };
})