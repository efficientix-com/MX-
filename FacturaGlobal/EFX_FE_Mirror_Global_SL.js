/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record','N/url','N/http','N/https','N/runtime','N/search'],
    /**
 * @param{record} record
 */
    (record,url,http,https,runtime,search) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var body = '';
            if(scriptContext.request.body){
                body = JSON.parse(scriptContext.request.body);
            }

            var objMirror = {
                tranid:'',
                trantype:'',

            }

            log.audit({title:'body',details:body});
            var factura_mirror = '';
            if(!body.espejo) {

                validaLineas(body.idglobal);

                var scriptObj = runtime.getCurrentScript();
                //configuración de factura global
                var GBL_Config = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_config' });

                var record_gbl = record.load({
                    type:'customsale_efx_fe_factura_global',
                    id:body.idglobal
                });
                var record_setup = record.load({
                    type:'customrecord_efx_fe_facturaglobal_setup',
                    id:GBL_Config
                });




                var formulario_gbl = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_form'});

                var record_mirror = record.transform({
                    fromType:'customsale_efx_fe_factura_global',
                    fromId:body.idglobal,
                    toType:record.Type.INVOICE,
                    isDynamic:false
                });

                if(formulario_gbl){
                    record_mirror.setValue({fieldId:'customform', value:formulario_gbl});
                }
                record_mirror.setValue({fieldId: 'entity', value: body.setup_entity});
                record_mirror.setValue({fieldId:'approvalstatus', value:1});
                record_mirror.setValue({fieldId:'custbody_efx_fe_gbl_folio', value:record_gbl.getValue({fieldId:'tranid'})});
                record_mirror.setValue({fieldId: 'custbody_psg_ei_sending_method', value: body.setup_metodo});
                record_mirror.setValue({fieldId: 'custbody_psg_ei_template', value: body.setup_plantilla});
                record_mirror.setValue({fieldId: 'custbody_psg_ei_status', value: 1});
                record_mirror.setValue({fieldId: 'custbody_efx_fe_gbl_ismirror', value: true});
                //record_mirror.setValue({fieldId:'custbody_edoc_gen_trans_pdf', value:false});

                factura_mirror = record_mirror.save();




            }else{
                factura_mirror = body.espejo;
            }

            log.audit({title:'mirror',details:factura_mirror});

            //
            var record_gbl = record.load({
                type:'customsale_efx_fe_factura_global',
                id:body.idglobal
            });



            //var conteoLineasGBL = record_gbl.getLineCount({sublistId:'item'});
            //
            // var idsFacturasArray = new Array();
            //
            // for (var i=0;i<conteoLineasGBL;i++){
            //     idsFacturasArray[i] = record_gbl.getSublistValue({
            //         sublistId:'item',
            //         fieldId:'custcol_efx_fe_gbl_related_tran',
            //         line:i
            //     });
            // }



            // record.submitFields({
            //     type: 'customsale_efx_fe_factura_global',
            //     id: body.idglobal,
            //     values:{
            //         custbody_efx_fe_gbl_mirror_tran:factura_mirror,
            //
            //     }
            // });


            objMirror.tranid = factura_mirror;
            // objMirror.trantype = record_mirror.type;
            objMirror.trantype = record.Type.INVOICE;

            var pdfGen = '';
            var xmlGen = '';
            var xmlCert = '';
            var uuidglobal = '';

            // try {
            //     crearXML(objMirror.tranid, objMirror.trantype);
            //     var timbradaObj = record.load({
            //         type: record.Type.INVOICE,
            //         id:objMirror.tranid
            //     });
            //
            //     pdfGen = timbradaObj.getValue({fieldId:'custbody_edoc_generated_pdf'});
            //     xmlGen = timbradaObj.getValue({fieldId:'custbody_psg_ei_content'});
            //     xmlCert = timbradaObj.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
            //     uuidglobal = timbradaObj.getValue({fieldId:'custbody_mx_cfdi_uuid'});
            // }catch (errorTimbra){
            //     log.audit({title:'errorTimbra',details:errorTimbra});
            //     var timbradaObj = record.load({
            //         type: record.Type.INVOICE,
            //         id:objMirror.tranid
            //     });
            //
            //     pdfGen = timbradaObj.getValue({fieldId:'custbody_edoc_generated_pdf'});
            //     xmlGen = timbradaObj.getValue({fieldId:'custbody_psg_ei_content'});
            //     xmlCert = timbradaObj.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
            //     uuidglobal = timbradaObj.getValue({fieldId:'custbody_mx_cfdi_uuid'});
            // }
            //
            //
            //
            //
            // // var record_gbl = record.load({
            // //     type:'customsale_efx_fe_factura_global',
            // //     id:body.idglobal
            // // });
            //
            // record_gbl.setValue({fieldId:'custbody_edoc_generated_pdf',value:pdfGen});
            // record_gbl.setValue({fieldId:'custbody_psg_ei_content',value:xmlGen});
            // record_gbl.setValue({fieldId:'custbody_psg_ei_certified_edoc',value:xmlCert});
            // record_gbl.setValue({fieldId:'custbody_mx_cfdi_uuid',value:uuidglobal});
            record_gbl.setValue({fieldId:'custbody_efx_fe_gbl_mirror_tran',value:factura_mirror});
            record_gbl.save();
            //
            // log.audit({title: 'id_global', details: body.idglobal});
            // log.audit({title: 'idsFacturasArray', details: idsFacturasArray});

            // if(xmlCert && uuidglobal) {
            //     for (var i = 0; i < idsFacturasArray.length; i++) {
            //         try{
            //             record.submitFields({
            //                 type: record.Type.CASH_SALE,
            //                 id: idsFacturasArray[i],
            //                 values: {
            //                     custbody_edoc_generated_pdf: pdfGen,
            //                     custbody_psg_ei_content: xmlGen,
            //                     custbody_psg_ei_certified_edoc: xmlCert,
            //                     custbody_mx_cfdi_uuid: uuidglobal,
            //                     custbody_psg_ei_status: 3,
            //                     custbody_efx_fe_gbl_related: body.idglobal
            //                 }
            //             });
            //         }catch(tipo_tran){
            //             record.submitFields({
            //                 type: record.Type.INVOICE,
            //                 id: idsFacturasArray[i],
            //                 values: {
            //                     custbody_edoc_generated_pdf: pdfGen,
            //                     custbody_psg_ei_content: xmlGen,
            //                     custbody_psg_ei_certified_edoc: xmlCert,
            //                     custbody_mx_cfdi_uuid: uuidglobal,
            //                     custbody_psg_ei_status: 3,
            //                     custbody_efx_fe_gbl_related: body.idglobal
            //                 }
            //             });
            //         }
            //     }
            //
            //     try {
            //         sendToMail(body.idglobal, 'customsale_efx_fe_factura_global');
            //     } catch (error_mail) {
            //         log.audit({title: 'error_mail', details: error_mail});
            //     }
            //     objMirror.success = true;
            // }





                log.audit({title:'objMirror',details:objMirror});
            log.audit({title: 'id_global', details: body.idglobal});

            scriptContext.response.write({
                output: JSON.stringify(objMirror)
            });

        }

        function crearXML(tranid,trantype){
            log.audit({title:'tranid',details:tranid});
            log.audit({title:'trantype',details:trantype});

            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });


            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_xml_generator',
                deploymentId: 'customdeploy_efx_fe_xml_generator',
                returnExternalUrl: true,
                params: {
                    trantype: trantype,
                    tranid: tranid

                }
            });

            log.audit({title:'SLURL',details:SLURL});


            var response = https.get({
                url: SLURL,
            });

            log.audit({title:'response-code',details:response.code});
            log.audit({title:'response-body',details:response.body});

            return response;


        }

        function sendToMail(tranid,trantype){
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });


            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_mail_sender_sl',
                deploymentId: 'customdeploy_efx_fe_mail_sender_sl',
                returnExternalUrl: true,
                params: {
                    trantype: trantype,
                    tranid: tranid
                }
            });

            log.audit({title:'SLURL',details:SLURL});

            var response = https.get({
                url: SLURL,
            });

            log.audit({title:'response-code_mail',details:response.code});
            log.audit({title:'response-body_mail',details:response.body});

            return response;

        }

        function validaLineas(idglb){

            try {
                var record_gbl = record.load({
                    type: 'customsale_efx_fe_factura_global',
                    id: idglb
                });

                var subtotal_cab = record_gbl.getValue({fieldId:'custbody_efx_fe_gbl_subtotal'});
                subtotal_cab = parseFloat(subtotal_cab);
                var cuentaLinea = record_gbl.getLineCount('item');

                var arrayFacturas = new Array();
                for (var i = 0; i < cuentaLinea; i++) {
                    var idFactura = record_gbl.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_gbl_related_tran',
                        line: i
                    });
                    arrayFacturas.push(idFactura);
                }

                log.audit({title: 'arrayFacturas', details: arrayFacturas});

                var searchFacturas = search.create({
                    type: search.Type.TRANSACTION,
                    filters: [
                        ["type", search.Operator.ANYOF, "CustInvc", "CashSale"]
                        , "AND",
                        ["mainline", search.Operator.IS, "T"]
                        , "AND",
                        ["internalid", search.Operator.ANYOF, arrayFacturas]
                        , "AND",
                        ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                        , "AND",
                        ['custbody_psg_ei_certified_edoc', search.Operator.NONEOF, '@NONE@']
                    ],
                    columns: [
                        search.createColumn({name: "internalid"}),
                        search.createColumn({name: "type"})
                    ]
                });

                var ejecutar = searchFacturas.run();
                var resultado = ejecutar.getRange(0, 100);
                log.audit({title: 'resultado', details: resultado});
                if (resultado.length > 0) {
                    for (var i = 0; i < resultado.length; i++) {
                        var idFactura = resultado[i].getValue({name: 'internalid'});
                        var tipo = resultado[i].getValue({name: 'type'});
                        if (idFactura) {
                            log.audit({title: 'idFactura', details: idFactura});
                            var conteLineas = record_gbl.getLineCount('item');
                            for (var x = 0; x < conteLineas; x++) {
                                var idFaclinea = record_gbl.getSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_efx_fe_gbl_related_tran',
                                    line: x
                                });
                                log.audit({title: 'idFaclinea', details: idFaclinea});
                                if (idFaclinea == idFactura) {

                                    var subtotalLinea = record_gbl.getSublistValue({
                                        sublistId:'item',
                                        fieldId:'custcol_efx_fe_subtotal_gbl',
                                        line:x
                                    });

                                    subtotal_cab=subtotal_cab-parseFloat(subtotalLinea);

                                    record_gbl.removeLine({
                                        sublistId: 'item',
                                        line: x,
                                        ignoreRecalc: true
                                    });

                                    if(tipo=='CustInvc'){
                                        tipo = record.Type.INVOICE;

                                    }

                                    if(tipo=='CashSale'){
                                        tipo = record.Type.CASH_SALE;

                                    }

                                    record.submitFields({
                                        type: tipo,
                                        id: idFactura,
                                        values: {
                                            custbody_efx_fe_gbl_related: ''
                                        }
                                    });
                                }

                            }
                        }
                    }
                }
                record_gbl.setValue({fieldId:'custbody_efx_fe_gbl_subtotal',value:subtotal_cab});
                record_gbl.save();
            }catch(error_validaLineas){
                log.audit({title: 'error_validaLineas', details: error_validaLineas});
            }
        }

        return {onRequest}

    });
