/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */

define(['N/log', 'N/search', 'N/ui/serverWidget', 'N/https', 'N/url', 'N/record', 'N/runtime', 'N/http', 'N/format', 'N/config', 'N/encode', 'N/xml', 'N/render', 'N/file', 'N/email','N/ui/message'], function (log, search, ui, https, url, record, runtime, http, format, config, encode, xml, render, file, email,mensajes) {
    function cfdi(context) {
        var section = '';
        var scriptObj = runtime.getCurrentScript();
        var userObj = runtime.getCurrentUser();
        try {
            if (context.request.method === 'GET') {

                section = 'Get Parameters';
                {
                    var tranid = context.request.parameters.custparam_tranid || '';
                    var trantype = context.request.parameters.custparam_trantype || '';
                    var total = parseFloat(context.request.parameters.custparam_total) || 0;
                    var entity = context.request.parameters.custparam_entity || '';
                    var location = context.request.parameters.custparam_location || '';
                }

                section = 'Get EFX FE - Anticipo Pagos';
                {
                    var anticioPagoObj = {};

                    var filters = [
                        ['isinactive', search.Operator.IS, 'F'], 'and',
                        ['custrecord_efx_fe_ap_trans', search.Operator.NONEOF, '@NONE@'], 'and',
                        ['custrecord_efx_fe_ap_subtotal', search.Operator.ISNOTEMPTY, null], 'and',
                        ['custrecord_efx_fe_ap_imp_id', search.Operator.ISNOTEMPTY, null], 'and',
                        ['custrecord_efx_fe_ap_importe', search.Operator.ISNOTEMPTY, null], 'and',
                        ['custrecord_efx_fe_ap_completado', search.Operator.IS, 'F']
                    ];

                    if (entity) {
                        filters.push('and');
                        filters.push(['custrecord_efx_fe_ap_trans.entity', search.Operator.ANYOF, entity]);
                    }
					/*
					 
                    if (location) {
                        filters.push('and');
                        filters.push(['custrecord_efx_fe_ap_trans.location', search.Operator.ANYOF, location]);
                    }
					*/
                    var result = search.create({
                        type: 'customrecord_efx_fe_anticipo_pago',
                        filters: filters,
                        columns: [
                            { name: 'custrecord_efx_fe_ap_trans' },
                            { name: 'custrecord_efx_fe_ap_location' },
                            { name: 'custrecord_efx_fe_ap_subtotal' },
                            { name: 'custrecord_efx_fe_ap_imp_id' },
                            { name: 'custrecord_efx_fe_ap_imp_neto' },
                            { name: 'custrecord_efx_fe_ap_importe' },
                            { join: 'custrecord_efx_fe_ap_trans', name: 'custbody_mx_cfdi_uuid' },
                            { name: 'custrecord_efx_fe_ap_importe_consumido' }
                        ]
                    });

                    var resultData = result.run();
                    var start = 0;
                    do {

                        var resultSet = resultData.getRange(start, start + 1000);
                        if (resultSet && resultSet.length > 0) {
                            for (var i = 0; i < resultSet.length; i++) {

                                var id = resultSet[i].id;
                                var custrecord_efx_fe_ap_trans = resultSet[i].getValue({ name: 'custrecord_efx_fe_ap_trans' }) || '';
                                var custrecord_efx_fe_ap_trans_Name = resultSet[i].getText({ name: 'custrecord_efx_fe_ap_trans' }) || '';
                                var custrecord_efx_fe_ap_subtotal = resultSet[i].getValue({ name: 'custrecord_efx_fe_ap_subtotal' }) || '';
                                var custrecord_efx_fe_ap_imp_id = resultSet[i].getValue({ name: 'custrecord_efx_fe_ap_imp_id' });
                                var custrecord_efx_fe_ap_imp_neto = resultSet[i].getValue({ name: 'custrecord_efx_fe_ap_imp_neto' });
                                var custbody_mx_cfdi_uuid = resultSet[i].getValue({ join: 'custrecord_efx_fe_ap_trans', name: 'custbody_mx_cfdi_uuid' });
                                var custrecord_efx_fe_ap_importe = parseFloat(resultSet[i].getValue({ name: 'custrecord_efx_fe_ap_importe' })) || 0;
                                var custrecord_efx_fe_ap_importe_consumido = parseFloat(resultSet[i].getValue({ name: 'custrecord_efx_fe_ap_importe_consumido' })) || 0;
                                var importeDisponible = custrecord_efx_fe_ap_importe - custrecord_efx_fe_ap_importe_consumido;

                                if (!anticioPagoObj[custrecord_efx_fe_ap_trans]) {
                                    anticioPagoObj[custrecord_efx_fe_ap_trans] = {
                                        id: id,
                                        tranName: custrecord_efx_fe_ap_trans_Name,
                                        subTotal: custrecord_efx_fe_ap_subtotal,
                                        impId: custrecord_efx_fe_ap_imp_id,
                                        impNeto: custrecord_efx_fe_ap_imp_neto,
                                        importe: custrecord_efx_fe_ap_importe,
                                        importeConsumido: custrecord_efx_fe_ap_importe_consumido,
                                        importeDisponible: importeDisponible,
                                        uuid: custbody_mx_cfdi_uuid
                                    };
                                }
                            }
                        }
                        start += 1000;

                    } while (resultSet && resultSet.length == 1000);

                    log.audit({ title: 'anticioPagoObj', details: JSON.stringify(anticioPagoObj) });
                }

                section = 'Create Form';
                {
                    var form = ui.createForm({
                        title: 'Lista - Facturas de Anticipos',
                        hideNavBar: true
                    });

                    form.clientScriptModulePath = "./EFX_FE_AnticipoDePago_CS.js";

                    //Buttons
                    {
                        form.addButton({
                            id: 'custpage_btn_apply',
                            label: 'Aplicar y Certificar',
                            functionName: 'guardar'
                        });

                        form.addButton({
                            id: 'custpage_btn_cerrar_ap',
                            label: 'Cerrar',
                            functionName: 'Cerrar'
                        });
                    }

                    //Fields
                    var entityField = form.addField({
                        id: 'custpage_entity',
                        label: 'Cliente',
                        type: ui.FieldType.SELECT,
                        source: 'customer'
                    });

                    entityField.updateDisplayType({
                        displayType: ui.FieldDisplayType.INLINE
                    });

                    if (entity) {
                        entityField.defaultValue = entity;
                    }

                    var locationField = form.addField({
                        id: 'custpage_location',
                        label: 'Ubicación',
                        type: ui.FieldType.SELECT,
                        source: 'location'
                    });

                    locationField.updateDisplayType({
                        displayType: ui.FieldDisplayType.INLINE
                    });

                    if (location) {
                        locationField.defaultValue = location;
                    }

                    var totalField = form.addField({
                        id: 'custpage_total',
                        label: 'Total de la Factura',
                        type: ui.FieldType.CURRENCY
                    });

                    totalField.updateDisplayType({
                        displayType: ui.FieldDisplayType.INLINE
                    });

                    totalField.defaultValue = total;

                    var idFactura = form.addField({
                        id: 'custpage_tranid',
                        label: 'ID de Transaccion',
                        type: ui.FieldType.SELECT,
                        source: 'transaction'
                    });

                    idFactura.updateDisplayType({
                        displayType: ui.FieldDisplayType.INLINE
                    });

                    idFactura.defaultValue = tranid;

                    var tipoFactura = form.addField({
                        id: 'custpage_trantype',
                        label: 'Tipo de Transaccion',
                        type: ui.FieldType.TEXT
                    });

                    tipoFactura.updateDisplayType({
                        displayType: ui.FieldDisplayType.INLINE
                    });

                    tipoFactura.defaultValue = trantype;

                    var tipodeRelacion = form.addField({
                        id: 'custpage_fpagoanticipo',
                        label: 'Forma de Pago NC',
                        type: ui.FieldType.SELECT,
                        
                    });

                    tipodeRelacion.updateDisplayType({
                        displayType: ui.FieldDisplayType.NORMAL
                    });

                    formadepagoobj = obtenformadepago();

                    for (var x = 0; x < formadepagoobj.valor.length; x++) {
                        tipodeRelacion.addSelectOption({
                            value: formadepagoobj.valor[x],
                            text: formadepagoobj.texto[x]
                        });

                    }

                    tipodeRelacion.defaultValue = "25";


                    // var totalApField = form.addField({
                    //     id: 'custpage_total_aplicados',
                    //     label: 'Total Aplicados',
                    //     type: ui.FieldType.CURRENCY
                    // });

                    // totalApField.updateDisplayType({
                    //     displayType: ui.FieldDisplayType.INLINE
                    // });

                    //Sublist
                    {
                        var sublist = form.addSublist({
                            id: "custpage_sublist",
                            label: "Facturas de Anticipos",
                            type: ui.SublistType.INLINEEDITOR
                        });


                        var sublist_tranIdField = sublist.addField({
                            id: "custpage_sublist_tranid",
                            label: 'Line',
                            type: ui.FieldType.TEXT
                        });

                        sublist_tranIdField.updateDisplayType({
                            displayType: ui.FieldDisplayType.HIDDEN
                        });

                        var sublist_apField = sublist.addField({
                            id: "custpage_sublist_ap",
                            label: 'Anticipo Id',
                            type: ui.FieldType.TEXT
                        });

                        sublist_apField.updateDisplayType({
                            displayType: ui.FieldDisplayType.HIDDEN
                        });

                        var sublist_tranField = sublist.addField({
                            id: "custpage_sublist_tran",
                            label: 'Factura',
                            type: ui.FieldType.TEXT
                        });

                        sublist_tranField.updateDisplayType({
                            displayType: ui.FieldDisplayType.DISABLED
                        });
                        var sublist_tranUuid = sublist.addField({
                            id: "custpage_sublist_uuid",
                            label: 'UUID',
                            type: ui.FieldType.TEXT
                        });

                        sublist_tranUuid.updateDisplayType({
                            displayType: ui.FieldDisplayType.DISABLED
                        });

                        var sublist_subtotalField = sublist.addField({
                            id: "custpage_sublist_subtotal",
                            label: 'Subtotal',
                            type: ui.FieldType.CURRENCY
                        });

                        sublist_subtotalField.updateDisplayType({
                            displayType: ui.FieldDisplayType.DISABLED
                        });

                        var sublist_impIdField = sublist.addField({
                            id: "custpage_sublist_impid",
                            label: 'Impuesto Id',
                            type: ui.FieldType.TEXT
                        });

                        sublist_impIdField.updateDisplayType({
                            displayType: ui.FieldDisplayType.HIDDEN
                        });

                        var sublist_impNetoField = sublist.addField({
                            id: "custpage_sublist_impneto",
                            label: 'Impuesto Neto',
                            type: ui.FieldType.CURRENCY
                        });

                        sublist_impNetoField.updateDisplayType({
                            displayType: ui.FieldDisplayType.DISABLED
                        });

                        var sublist_importeField = sublist.addField({
                            id: "custpage_sublist_importe",
                            label: 'Importe',
                            type: ui.FieldType.CURRENCY
                        });

                        sublist_importeField.updateDisplayType({
                            displayType: ui.FieldDisplayType.DISABLED
                        });

                        var sublist_importeConsumidoField = sublist.addField({
                            id: "custpage_sublist_importe_consumido",
                            label: 'Importe Consumido',
                            type: ui.FieldType.CURRENCY
                        });

                        sublist_importeConsumidoField.updateDisplayType({
                            displayType: ui.FieldDisplayType.DISABLED
                        });

                        var sublist_importeConsumidoField = sublist.addField({
                            id: "custpage_sublist_importe_disponible",
                            label: 'Disponible',
                            type: ui.FieldType.CURRENCY
                        });

                        sublist_importeConsumidoField.updateDisplayType({
                            displayType: ui.FieldDisplayType.DISABLED
                        });

                        sublist.addField({
                            id: "custpage_sublist_importe_aplicar",
                            label: 'Aplicar Importe',
                            type: ui.FieldType.CURRENCY
                        });

                    }

                    //Lines
                    {
                        var line = 0;
                        for (var tranid in anticioPagoObj) {

                            sublist.setSublistValue({
                                id: "custpage_sublist_tranid",
                                line: line,
                                value: tranid
                            });

                            sublist.setSublistValue({
                                id: "custpage_sublist_ap",
                                line: line,
                                value: anticioPagoObj[tranid].id
                            });

                            sublist.setSublistValue({
                                id: "custpage_sublist_tran",
                                line: line,
                                value: anticioPagoObj[tranid].tranName
                            });

                            if(anticioPagoObj[tranid].uuid) {
                                sublist.setSublistValue({
                                    id: "custpage_sublist_uuid",
                                    line: line,
                                    value: anticioPagoObj[tranid].uuid
                                });
                            }
                            sublist.setSublistValue({
                                id: "custpage_sublist_subtotal",
                                line: line,
                                value: anticioPagoObj[tranid].subTotal
                            });

                            sublist.setSublistValue({
                                id: "custpage_sublist_impid",
                                line: line,
                                value: anticioPagoObj[tranid].impId
                            });

                            sublist.setSublistValue({
                                id: "custpage_sublist_impneto",
                                line: line,
                                value: anticioPagoObj[tranid].impNeto
                            });

                            sublist.setSublistValue({
                                id: "custpage_sublist_importe",
                                line: line,
                                value: anticioPagoObj[tranid].importe
                            });

                            sublist.setSublistValue({
                                id: "custpage_sublist_importe_disponible",
                                line: line,
                                value: anticioPagoObj[tranid].importeDisponible
                            });

                            sublist.setSublistValue({
                                id: "custpage_sublist_importe_consumido",
                                line: line,
                                value: anticioPagoObj[tranid].importeConsumido
                            });

                            line++;
                        }
                    }
                }

                section = 'Print Form';
                {
                    context.response.writePage(form);
                }

            }
            else if (context.request.method === 'POST') {
                
                    log.audit({title:'POST',details:'boton submit'});
                    log.audit({title:'context.request',details:context.request.parameters});
                    log.audit({title:'context.request',details:context.request.body});

                    
            
                    var body = JSON.parse(context.request.body);
                    var tranid = context.request.parameters.custparam_tranid;
                    var trantype = context.request.parameters.custparam_trantype;
                    var fpagoantText = context.request.parameters.custparam_fpagoantText;
                    var fpagoantvalue = context.request.parameters.custparam_fpagoantValue;
                    //context.response.write('<script>window.close();</script>');
                    

                    try {
                        var resultNC = {};         
                        var custscript_efx_fe_timbraauto_ap = scriptObj.getParameter({ name: 'custscript_efx_fe_timbraauto_ap' }) || '';               
                        var resultNC = createCreditMemo(body, scriptObj, fpagoantvalue, tranid);
                        log.audit({title:'resultNC',details:resultNC});
                        
                        crearDetalleAnticipo(resultNC, body,custscript_efx_fe_timbraauto_ap);


                        /*var form = ui.createForm({
                            title: "Anticipo Aplicado"
                        });                    

                        var htmlField = form.addField({
                            id: "custpage_html_result",
                            label: 'Resultado',
                            type: ui.FieldType.INLINEHTML
                        });


                        var html = '';
                        
                        var ncMessage = '';
                        if (Object.keys(resultNC).length > 0) {
                            ncMessage = '<br><br>Timbrar - Notas de Creditos:';
                            for (var nc in resultNC) {
                                ncMessage += '<br><a target="_blank" href="' + resultNC[nc].url + '">Id Interno: ' + nc + '</a>'
                            }
                        }
                        html = htmlMessage('<br>Timbrada Exitosamente!' + ncMessage, 'success', 'Actualizado');
                    
                    
                        htmlField.defaultValue = html;
            
                        
                        context.response.writePage(form);*/
                        context.response.write({
                            output: JSON.stringify(resultNC)
                        });

                    } catch (error) {
                        log.error({ title: 'error', details: JSON.stringify(error) });
                    }
                
            }
        }
        catch (err) {
            
        }
    }

    function createCreditMemo(objUuidRelacionado, scriptObj, fpagoant, idInvoice) {
        var arrayCreditMemoId = [];
        var creditMemoId = {};

        var field_cm_ucfd = scriptObj.getParameter({ name: 'custscript_efx_fe_cfdiusage_ap' }) || '';        
        
        var custscript_efx_fe_metpag_ap = scriptObj.getParameter({ name: 'custscript_efx_fe_metpag_ap' }) ||'';
        var custscript_efx_fe_item_ap = scriptObj.getParameter({ name: 'custscript_efx_fe_item_ap' }) || '';                
        var custscript_efx_fe_item_ap_ex = scriptObj.getParameter({ name: 'custscript_efx_fe_item_ap_ex' }) || '';   
        var facturaMercancia = search.lookupFields({
            type: record.Type.INVOICE,
            id:idInvoice,
            columns: ['custbody_mx_cfdi_uuid']
        });

        var uuid_facturaMercancia = facturaMercancia['custbody_mx_cfdi_uuid'];

        //Create Credit Memo
        var montoTotal = 0;
        var iddeanticipo = '';
        var anticipoExtrangero = false;
        var posicion=0;
        for (var transaction in objUuidRelacionado) {

            var arrayKeys = Object.keys(objUuidRelacionado);
            var grossamt = parseFloat(objUuidRelacionado[transaction].importeAplicar);
            iddeanticipo = arrayKeys[posicion];

            montoTotal = parseFloat(montoTotal) + grossamt;
            posicion++;
        }

        if(iddeanticipo){
            var recordAnticipo = record.load({
                type: record.Type.INVOICE,
                id:iddeanticipo
            });

            var lineCountItem = recordAnticipo.getLineCount({ sublistId: 'item' });
            for(var a=0;a<lineCountItem;a++){
                var articuloanticipoTipo = recordAnticipo.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: a
                });
                if(articuloanticipoTipo==custscript_efx_fe_item_ap_ex){
                    anticipoExtrangero=true;
                }
                
            }

        }
        

        var objRecord = record.transform({
            fromType: record.Type.INVOICE,
            fromId: idInvoice,
            toType: record.Type.CREDIT_MEMO,
            isDynamic: true
        });

        objRecord.setValue({
            fieldId: 'custbody_mx_txn_sat_payment_method',
            value: fpagoant
        });
        if (field_cm_ucfd) {
            objRecord.setValue({
                fieldId: 'custbody_mx_cfdi_usage',
                value: field_cm_ucfd
            });
        }
        objRecord.setValue({
            fieldId: 'custbody_mx_txn_sat_payment_term',
            value: custscript_efx_fe_metpag_ap
        });

        objRecord.setValue({
            fieldId: 'custbody_mx_cfdi_uuid',
            value: ''
        });
        objRecord.setValue({
            fieldId: 'custbody_mx_cfdi_certify_timestamp',
            value: ''
        });
        objRecord.setValue({
            fieldId: 'custbody_edoc_generated_pdf',
            value: ''
        });
        objRecord.setValue({
            fieldId: 'custbody_psg_ei_certified_edoc',
            value: ''
        });
        objRecord.setValue({
            fieldId: 'custbody_psg_ei_status',
            value: 1
        });

        // borar articulo(s)
        var numLines = objRecord.getLineCount({
            sublistId: 'item'
        });
        

        for (var b = numLines; b > 0; b--) {
            
            var lineR = b - 1;
            objRecord.removeLine({
                sublistId: 'item',
                line: lineR,
                //ignoreRecalc: true
            });
        }

        var lineNum = objRecord.selectNewLine({
            sublistId: 'item'
        });

        if(anticipoExtrangero){
            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: custscript_efx_fe_item_ap_ex,
            });
        }else{
            objRecord.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: custscript_efx_fe_item_ap,
            });
        }
        

        objRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: 1,
        });



        objRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'grossamt',
            value: montoTotal
        });

        var rate = objRecord.getCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'amount',
        });
        

        objRecord.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            value: rate
        });

        objRecord.commitLine({
            sublistId: 'item'
        });

        //Apply
        var numLines = objRecord.getLineCount({
            sublistId: 'apply'
        });

        for (var l = 0; l < numLines; l++) {
            var apply = objRecord.getSublistValue({
                sublistId: 'apply',
                fieldId: 'apply',
                line: l
            });

            if (apply) {
                // log.audit({ title: 'Apply encontrado: ' + l, details: apply + ' value: ' + montoTotal });

                var lineNumApply = objRecord.selectLine({
                    sublistId: 'apply',
                    line: l
                });

                objRecord.setCurrentSublistValue({
                    sublistId: 'apply',
                    fieldId: 'amount',
                    value: montoTotal
                });

                objRecord.commitLine({
                    sublistId: 'apply'
                });
            }
        }

        var recordId = objRecord.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });

        if (recordId > 0) {
            if (!creditMemoId[recordId]) {
                creditMemoId[recordId] = {
                    id: idInvoice,
                    importe: montoTotal,                    
                };
            }
        }

        for (var transaction in objUuidRelacionado) {
                        
            var uuidrelacionado = objUuidRelacionado[transaction].uuid;

            
                var related_cfdi = record.create({
                    type: 'customrecord_mx_related_cfdi_subl',
                    isDynamic: true
                });
    
                related_cfdi.setValue({
                    fieldId: 'custrecord_mx_rcs_rel_type',
                    value: 7
                });
    
                related_cfdi.setValue({
                    fieldId: 'custrecord_mx_rcs_orig_trans',
                    value: recordId
                });
    
    
                related_cfdi.setValue({
                    fieldId: 'custrecord_mx_rcs_rel_cfdi',
                    value: idInvoice
                });
    
                related_cfdi.setValue({
                    fieldId: 'custrecord_mx_rcs_uuid',
                    value: uuid_facturaMercancia
                });
                    
                var id_related = related_cfdi.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                    
            
        }

        // log.audit({ title: 'creditMemoId', details: JSON.stringify(creditMemoId) });

        
            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_xml_generator',
                deploymentId: 'customdeploy_efx_fe_xml_generator',
                returnExternalUrl: false,        
            });
    
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });
        
        

        //Get URL
            for (var idCm in creditMemoId) {

                var tranIdAut = idCm;

                var parametroSl = '';
                parametroSl += '&custparam_tranid=' + tranIdAut;
                parametroSl += '&custparam_trantype=' + 'creditmemo';           

                // log.audit({ title: 'PparametroSl ', details: parametroSl });

                var newURLNC = scheme + host + SLURL + parametroSl;
                // log.audit({ title: 'SLURL ', details: SLURL });

                creditMemoId[idCm].url = newURLNC;
            }
        

      
        return creditMemoId;
    }

    function crearDetalleAnticipo(creditMemoObj, anticipoDetalleObj,custscript_efx_fe_timbraauto_ap) {
        
            for (var cmId in creditMemoObj) {

                for (var idTranD in anticipoDetalleObj) {

                    var apRec = record.create({
                        type: 'customrecord_efx_fe_ap_detalle'
                    });

                    apRec.setValue({
                        fieldId: 'custrecord_efx_ap_d_ap',
                        value: anticipoDetalleObj[idTranD].id
                    });

                    apRec.setValue({
                        fieldId: 'custrecord_efx_fe_ap_d_tran',
                        value: cmId
                    });

                    apRec.setValue({
                        fieldId: 'custrecord_efx_fe_ap_d_importe',
                        value: anticipoDetalleObj[idTranD].importeAplicar
                    });

                    var apRecId = apRec.save({
                        enableSourcing: true,
                        igonoreMandatoryFields: true
                    });
                    if((custscript_efx_fe_timbraauto_ap && custscript_efx_fe_timbraauto_ap!='F') || custscript_efx_fe_timbraauto_ap==true || custscript_efx_fe_timbraauto_ap=='T'){
                        timbrarNC(cmId);
                    }

                }

            }
        
    }

    function obtenformadepago(){
        
        var valor = new Array();
        var texto = new Array();
        valor.push(1);
        texto.push('01 - Efectivo');
        valor.push(2);
        texto.push('02 - Cheque Nominativo');
        valor.push(3);
        texto.push('03 - Transferencia Electrónica de Fondos');
        valor.push(4);
        texto.push('04 - Tarjeta de Crédito');
        valor.push(5);
        texto.push('05 - Monedero Electrónico');
        valor.push(6);
        texto.push('06 - Dinero Electrónico');
        valor.push(7);
        texto.push('07 - Tarjetas Digitales');
        valor.push(8);
        texto.push('08 - Vales de Despensa');
        valor.push(9);
        texto.push('09 - Bienes');
        valor.push(10);
        texto.push('10 - Servicio');
        valor.push(11);
        texto.push('11 - Por cuenta de tercero');
        valor.push(12);
        texto.push('12 - Dación en Pago');
        valor.push(13);
        texto.push('13 - Pago por Subrogación');
        valor.push(14);
        texto.push('14 - Pago por Consignación');
        valor.push(15);
        texto.push('15 - Condonación');
        valor.push(16);
        texto.push('16 - Cancelación');
        valor.push(17);
        texto.push('17 - Compensación');
        valor.push(18);
        texto.push('23 - Novación');
        valor.push(19);
        texto.push('24 - Confusión');
        valor.push(20);
        texto.push('25 - Remisión de Deuda');
        valor.push(21);
        texto.push('26 - Prescripción o Caducidad');
        valor.push(22);
        texto.push('27 - A Satisfacción del Acreedor');
        valor.push(23);
        texto.push('28 - Tarjeta de Débito');
        valor.push(24);
        texto.push('29 - Tarjeta de Servicios');
        valor.push(25);
        texto.push('30 - Aplicación de Anticipos');
        valor.push(26);
        texto.push('31 - Intermediario Pagos');
        valor.push(27);
        texto.push('98 - N/A');
        valor.push(28);
        texto.push('99 - Por Definir');

        var objformadepagoarray = {
            valor:valor,
            texto:texto
        };

        return objformadepagoarray;
    }

    function timbrarNC(cmId){
        try{
            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_xml_generator',
                deploymentId: 'customdeploy_efx_fe_xml_generator',
                returnExternalUrl: true,
                params: {
                    trantype: 'creditmemo',
                    tranid: cmId

                }
            });

            log.audit({title:'SLURL',details:SLURL});

            var response = https.get({
                url: SLURL,
            });
            log.audit({title:'response-code',details:response.code});
            log.audit({title:'response-body',details:response.body});
        }catch(errorTimbraNC){
            log.error({title:'resultNC',deails:resultNC})
        }
    }

    return {
        onRequest: cfdi
    };
});