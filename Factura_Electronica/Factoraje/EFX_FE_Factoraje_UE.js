/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/runtime', 'N/ui/serverWidget', 'N/record', 'N/search','N/format','N/record','N/file','N/xml'],

function(log, runtime, ui, modRecord, search,format,record,file,xml) {
   
    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {string} scriptContext.type - Trigger type
     * @param {Form} scriptContext.form - Current form
     * @Since 2015.2
     */
    function beforeLoad(scriptContext) {

    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function beforeSubmit(context) {
        var record = context.newRecord;
        var recID = record.id;
        var recType = record.type;

        //Calculos de factoraje

        try{

            var chbx_factoraje = record.getValue({fieldId: 'custbody_efx_fe_chbx_factorage'});
            if (recType == 'customerpayment' && chbx_factoraje) {
                var total_factoraje = 0;
                var total_factoraje_origin = 0;

                var account_origin = record.getValue({fieldId: 'account'});
                if (account_origin) {
                    account_origin = parseInt(account_origin);
                }

                var tipo_cambio = record.getValue({fieldId: 'custbody_efx_fe_tipo_cambio'});
                var tipo_de_cambio = record.getValue({fieldId: 'exchangerate'});
                // var account_destinity = record.getValue({fieldId: 'custbody_efx_fe_account_factoraje'});
                //
                // if (account_destinity) {
                //     account_destinity = parseInt(account_destinity);
                // }
                log.audit({title: 'account_origin', details: account_origin});
                //log.audit({title: 'account_destinity', details: account_destinity});
                log.audit({title: 'tipo_cambio', details: tipo_cambio});

                var array_id_invoice = [];
                var numberOfApply = record.getLineCount({sublistId:'apply'}) || 0;
                log.audit({title: 'numberOfApply', details: numberOfApply});
                if (numberOfApply > 0) {
                    for (var i = 0; i < numberOfApply; i++) {
                        var applicada = record.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'apply',
                            line: i
                        });


                        if (applicada==true) {
                            var id_linea = record.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'internalid',
                                line: i
                            });
                            array_id_invoice.push(id_linea);
                        }
                    }

                }

                log.audit({title: 'array_id_invoice', details: array_id_invoice});

                if (array_id_invoice.length > 0) {
                    var t_cambio_fact = record.getValue({fieldId: 'custbody_efx_fe_tipo_cambio_factura'});

                    var getDataFactorage = calculateFactoraje(array_id_invoice,t_cambio_fact,tipo_cambio,tipo_de_cambio);

                    //llenar campo de receptor
                    var arrayFields = new Array();
                    var arrayValues = new Array();
                    log.audit({title: 'total_factoraje', details: total_factoraje});

                    log.audit({title: 't_cambio_fact', details: t_cambio_fact});

                    var entity_timbra = record.getValue({fieldId: 'custbody_efx_fe_entity_timbra'});

                    log.audit({title: 'entity_timbra', details: entity_timbra});

                    if (entity_timbra) {

                        //var fields = ['custentity_mx_rfc', 'address', 'altname']
                        var fields = ['custentity_mx_rfc', 'address', 'custentity_mx_sat_registered_name']
                        var columns = search.lookupFields({
                            type: search.Type.CUSTOMER,
                            id: entity_timbra,
                            columns: fields
                        });

                        log.audit({title: 'columns', details: JSON.stringify(columns)});

                        var vatregnumber = columns.custentity_mx_rfc || '';
                        log.audit({title: 'vatregnumber', details: vatregnumber});
                        if (vatregnumber) {
                            arrayFields.push('custbody_efx_fe_factoraje_rfc');
                            arrayValues.push(vatregnumber);
                        }

                        var address = columns.address || '';
                        log.audit({title: 'address', details: address});
                        if (address) {
                            arrayFields.push('custbody_efx_fe_factoraje_dir');
                            arrayValues.push(address);
                        }

                        var entityid = columns.custentity_mx_sat_registered_name || '';

                        log.audit({title: 'entityid', details: entityid});
                        if (entityid) {
                            arrayFields.push('custbody_efx_fe_factoraje_receptor');
                            arrayValues.push(entityid);
                        }

                    }

                    //

                    if (getDataFactorage.success) {
                        total_factoraje = getDataFactorage.data;
                        total_factoraje_origin = getDataFactorage.origin;
                        if (tipo_cambio) {
                            total_factoraje = (total_factoraje * 1) / (tipo_cambio * 1);
                            total_factoraje = total_factoraje.toFixed(2);
                        }
                        arrayFields.push('custbody_efx_total_factoraje');
                        if (t_cambio_fact==true){
                            arrayValues.push(total_factoraje);

                        }else{
                            arrayValues.push(total_factoraje_origin);
                        }



                        log.audit({title: 'arrayFields', details: arrayFields});
                        log.audit({title: 'arrayValues', details: arrayValues});


                        // var updateField = record.submitFields({
                        //     type: record.Type.CUSTOMER_PAYMENT,
                        //     id: recID,
                        //     values: campos,
                        //     options: {
                        //         enableSourcing: false,
                        //         ignoreMandatoryFields : true
                        //     }
                        // });
                        // log.audit({title: 'updateField', details: updateField});
                    }
                    var campos = new Object();
                    for(var i=0;i<arrayFields.length;i++){
                        campos[arrayFields[i]]=arrayValues[i];
                        record.setValue({fieldId: arrayFields[i], value: arrayValues[i]});
                    }
                    log.audit({title: 'campos', details: campos});
                }


            }
        }catch(error_calculofactoraje){
            log.audit({title: 'error_calculofactoraje', details: error_calculofactoraje});
        }

        //Aplicacion de comision de factoraje a campos de descuento

        if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
            var factoraje = record.getValue({fieldId: 'custbody_efx_fe_chbx_factorage'});
            log.audit({title: 'factoraje', details: factoraje});
            var accountid= runtime.accountId;
            log.audit({title: 'accountid', details: accountid});
            if(factoraje) {

                var numLines = record.getLineCount({
                    sublistId: 'apply'
                });
                log.audit({title: 'numLines', details: numLines});
                var id_facturas = new Array();
                

                    for (var i = 0; i < numLines; i++) {
                    var aplicada = record.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'apply',
                        line: i
                    });

                    if(aplicada == true){
                        id_facturas.push(record.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'internalid',
                            line: i
                        }));

                     

                        

                    }

                }
                log.audit({title: 'id_facturas', details: id_facturas});
                var datos_fact_array = new Array();
                var busqueda_inv = search.create({
                    type: search.Type.INVOICE,
                    filters: [['internalid', search.Operator.ANYOF, id_facturas]
                        , 'and',
                        ['mainline', search.Operator.IS, 'T']],
                    columns: [
                        search.createColumn({name: 'internalid'}),
                        search.createColumn({name: 'custbody_efx_fe_comision_factor'}),
                        search.createColumn({name: 'custbody_efx_fe_tipo_cambio'}),
                        search.createColumn({name: 'exchangerate'}),
                        search.createColumn({name: 'custbody_mx_cfdi_uuid'}),
                        search.createColumn({name: 'currency'}),
                        search.createColumn({name: 'tranid'}),
                        search.createColumn({name: 'custbody_mx_txn_sat_payment_term'}),
                        search.createColumn({name: 'custbody_efx_fe_comision_factor'}),

                    ]
                });
                var conteoBusqueda = busqueda_inv.runPaged().count;


                var suma_importe =0;
                if(conteoBusqueda>0){
                    busqueda_inv.run().each(function(result) {
                        var id_fac = result.getValue({name: 'internalid'}) || 0;
                        var importe = result.getValue({name: 'custbody_efx_fe_comision_factor'}) || 0;
                        suma_importe = suma_importe+parseFloat(importe);
                        var t_cambio_efx = result.getValue({name: 'custbody_efx_fe_tipo_cambio'}) || 0;
                        var t_cambio = result.getValue({name: 'exchangerate'}) || 0;
                        log.audit({title: 'id_fac', details: id_fac});
                        log.audit({title: 'importe', details: importe});

                        for (var x = 0; x < numLines; x++) {

                            var aplicada = record.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'apply',
                                line: x
                            });

                            if(aplicada == true){
                                var id_fact_linea = record.getSublistValue({
                                    sublistId: 'apply',
                                    fieldId: 'internalid',
                                    line: x
                                });
                                if (id_fac == id_fact_linea) {
                                    var descuento = record.getSublistValue(
                                        {sublistId: 'apply', fieldId: 'disc', line: x}
                                    );
                                    log.audit({title: 'descuento', details: descuento});
                                    if (!descuento) {
                                        log.audit({title: 'descuento', details: descuento});
                                        record.setSublistValue({
                                            sublistId: 'apply',
                                            fieldId: 'disc',
                                            value: importe,
                                            line: x});
                                    }
                                }
                            }
                        }

                       

                        return true;
                    });
                }




                log.audit({title: 'suma_importe', details: suma_importe});
                // record.setValue({fieldId: 'custbody_efx_fe_comisiones_fac', value: suma_importe});


                //Busqueda para factoraje

                // var hora_fecha = new Date();
                // var hora_pago = 'T'+hora_fecha.getHours()+':'+hora_fecha.getMinutes()+':'+hora_fecha.getSeconds();
                //
                // //var fecha_pago_ns = record.getValue({fieldId: 'trandate'});
                // var fecha_pago_ns = 'trandate';
                //
                // var columnDate = search.createColumn({
                //     name: 'formulatext',
                //     formula: "TO_CHAR({" + fecha_pago_ns + "},'YYYY-MM-DD')"
                // });
                // var columnForeignCurrency = search.createColumn({
                //     name: 'formulatextcurrency',
                //     formula: "TO_CHAR({fxamount})"
                // });
                //
                // var arrayColum = [
                //     columnDate,
                //     columnForeignCurrency,
                //     {name: 'currency'},
                //     {name: 'custbody_efx_fe_tipo_cambio_factura'},
                //     {name: 'custbody_efx_fe_tipo_cambio'},
                //     {name: 'exchangerate'},
                // ];
                //
                // var resultPayment = search.create({
                //     type: search.Type.CUSTOMER_PAYMENT,
                //     filters: [
                //         ['internalid', search.Operator.IS, recID], 'and',
                //         ['mainline', 'is', 'T']
                //     ],
                //     columns: arrayColum
                // });

                // var ejecutar_ref = resultPayment.run();
                // var resultado_ref = ejecutar_ref.getRange(0, 100);
                //
                // for (var r = 0; r < resultado_ref.length; r++) {
                //     var fecha_de_pago = resultado_ref[r].getValue({name: 'formulatext'}) || '';
                //     fecha_de_pago = fecha_de_pago +hora_pago;
                //     var moneda = resultado_ref[r].getText({name: 'currency'});
                //     var t_cambio_pago = resultado_ref[r].getValue({name: 'exchangerate'});
                //     var t_cambio_factura = resultado_ref[r].getValue({name: 'custbody_efx_fe_tipo_cambio_factura'});
                //     var t_cambio_py = resultado_ref[r].getValue({name: 'custbody_efx_fe_tipo_cambio'});
                //
                // }

                // var objPayment = {
                //     fecha_de_pago:fecha_de_pago,
                //     currency: record.getText({fieldId: 'currency'}),
                //     exchange:record.getText({fieldId: 'exchangerate'}),
                //     noOperaion:'',
                //     total_comision_factor: suma_importe,
                //     tipoCambiFactura:record.getText({fieldId: 'custbody_efx_fe_tipo_cambio_factura'}),
                //     tipoCambio:record.getText({fieldId: 'custbody_efx_fe_tipo_cambio'}),
                //     objUuid:datos_fact_array
                //
                // };
                // log.audit({title: 'fecha_pago_ns', details: fecha_pago_ns});
                // log.audit({title: 'datos_fact_array', details: datos_fact_array});
                //
                // log.audit({title: 'objPayment', details: objPayment});
                //
                // var xml_factoraje = generarXml(objPayment);
                //
                // log.audit({title: 'objPayment', details: xml_factoraje});
                record.setValue({fieldId: 'custbody_efx_fe_factoraje_json', value: JSON.stringify(getDataFactorage.t_cambios)});
                var factorajetotalLine = 0;
                for (var x = 0; x < numLines; x++) {
                    var aplicada = record.getSublistValue({
                        sublistId: 'apply',
                        fieldId: 'apply',
                        line: x
                    });
                    if(aplicada==true){
                        var montoDiscLinea = record.getSublistValue({
                            sublistId: 'apply',
                            fieldId: 'disc',
                            line: x
                        });

                        if(montoDiscLinea){
                            factorajetotalLine=factorajetotalLine+parseFloat(montoDiscLinea);
                        }
                    }
                
                }
                var totalFactorajeFinal = record.getValue({fieldId: 'custbody_efx_total_factoraje'});
                if(!totalFactorajeFinal && factorajetotalLine>0){
                    record.setValue({fieldId: 'custbody_efx_total_factoraje',value:factorajetotalLine.toFixed(2)});
                }

            }
        }
    }


    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */

    function generarXml(paymentDataObj) {
        var xmlStr = '';
        for (var uuidFactor in paymentDataObj.objUuid) {
            if (paymentDataObj.objUuid[uuidFactor].comision_factor > 0) {
                xmlStr += ' <pago10:DoctoRelacionado ';
                xmlStr += ' IdDocumento="' + paymentDataObj.objUuid[uuidFactor].uuid + '" ';
                xmlStr += ' Serie="' + paymentDataObj.objUuid[uuidFactor].serie + '" ';
                xmlStr += ' Folio="' + paymentDataObj.objUuid[uuidFactor].folio + '" ';
                xmlStr += ' MonedaDR="' + paymentDataObj.objUuid[uuidFactor].currency + '" ';

                //
                if (paymentDataObj.objUuid[uuidFactor].currency != paymentDataObj.currency) {
                    if (paymentDataObj.tipoCambiFactura && paymentDataObj.objUuid[uuidFactor].exchangerate_t) {
                        xmlStr += ' TipoCambioDR="' + paymentDataObj.objUuid[uuidFactor].exchangerate_t + '" ';
                    } else {
                        xmlStr += ' TipoCambioDR="' + paymentDataObj.tipoCambio + '" ';
                    }
                }
                //
                xmlStr += ' MetodoDePagoDR="' + paymentDataObj.objUuid[uuidFactor].metPagoText + '" ';
                if (paymentDataObj.objUuid[uuidFactor].metPagoText == 'PPD' && paymentDataObj.objUuid[uuidFactor].parcialidades > 0) {
                    xmlStr += ' NumParcialidad="' + (paymentDataObj.objUuid[uuidFactor].parcialidades * 1 + 1) + '" ';
                }
                xmlStr += ' ImpSaldoAnt="' + parseFloat(paymentDataObj.objUuid[uuidFactor].comision_factor) + '" ';
                xmlStr += ' ImpPagado="' + parseFloat(paymentDataObj.objUuid[uuidFactor].comision_factor) + '" ';
                xmlStr += ' ImpSaldoInsoluto="0" ';
                xmlStr += ' />';
            }
        }


        return xmlStr;

    }

    function calculateFactoraje(param_array_invoice,t_cambio_fact,tipo_cambio,tipo_de_cambio) {
        var respuesta = {
            success: false,
            data: 0,
            origin: 0,
            t_cambio_f: 0,
            t_cambios:{}
        };
        log.audit({title: 'param_array_invoice', details: param_array_invoice});
        try {

            var busqueda_inv = search.create({
                type: search.Type.INVOICE,
                filters: [['internalid', search.Operator.ANYOF, param_array_invoice]
                    , 'and',
                    ['mainline', search.Operator.IS, 'T']],
                columns: [
                    search.createColumn({name: 'custbody_efx_fe_comision_factor'}),
                    search.createColumn({name: 'custbody_efx_fe_tipo_cambio'}),
                    search.createColumn({name: 'exchangerate'}),
                    search.createColumn({name: 'tranid'}),
                ]
            });

            var t_cambioFac_json = {}
            log.audit({title: 't_cambio_fact', details: t_cambio_fact});
            var conteoBusqueda = busqueda_inv.runPaged().count;
            if(conteoBusqueda>0){
                busqueda_inv.run().each(function(result) {
                    var importe = result.getValue({name: 'custbody_efx_fe_comision_factor'}) || 0;
                    var t_cambio = result.getValue({name: 'exchangerate'}) || 0;
                    var t_cambio_f = result.getValue({name: 'custbody_efx_fe_tipo_cambio'}) || 0;
                    var id_de_factura = result.getValue({name: 'tranid'}) || 0;

                    if(t_cambio_fact==true){
                        t_cambioFac_json[id_de_factura] = {
                            t_cambio: t_cambio
                        };

                    }

                    if(tipo_cambio){
                        respuesta.data += parseFloat(importe);
                    }else{
                        if(t_cambio_fact==true && t_cambio_f){
                            t_cambio_f=tipo_de_cambio;

                            respuesta.data += (parseFloat(importe)*(parseFloat(t_cambio_f)));
                        }else{
                            if(t_cambio){
                                t_cambio = tipo_de_cambio;
                                respuesta.data += (parseFloat(importe)*(parseFloat(t_cambio)));
                            }
                        }
                    }

                    respuesta.origin += parseFloat(importe);
                    return true;
                });
            }


            // var resultData = busqueda_inv.run();
            // var resultSet = resultData.getRange(0, 100);


            respuesta.success = respuesta.data > 0;
        } catch (error) {
            log.audit({title: 'error calculateFactoraje', details: JSON.stringify(error)});
            respuesta.success = false;
        }

        if(t_cambio_fact==true) {
            respuesta.t_cambios = t_cambioFac_json;
        }
        log.audit({title: 'respuesta', details: respuesta});
        log.audit({title: 'respuesta calculateFactoraje', details: JSON.stringify(respuesta)});
        return respuesta;
    }

    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */

    // function afterSubmit(context){
    //     var record_now = context.newRecord;
    //     var recType = record_now.type;
    //     var record_id = record_now.id;
    //     if (recType == record.Type.CUSTOMER_PAYMENT) {
    //         var xml_data_payment = record_now.getValue({fieldId: 'custbody_efx_fe_xml_data_payment'});
    //         var xml_document = record_now.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});
    //         if(!xml_data_payment && xml_document) {
    //             try {
    //                 var obj_xml_payment = {
    //                     serie: '',
    //                     folio: '',
    //                     relacionado: [],
    //                 }
    //                 var archivo_xml = file.load({
    //                     id: xml_document
    //                 });
    //                 var contenido_xml = archivo_xml.getContents();
    //                 log.audit({title: 'contenido_xml', details: contenido_xml});
    //                 var xmlSat = xml.Parser.fromString({text: contenido_xml});
    //                 var nodosSuperior = xml.XPath.select({node: xmlSat, xpath: 'cfdi:Comprobante'});
    //                 obj_xml_payment.serie = nodosSuperior[0].getAttributeNode({name: 'Serie'}).value;
    //                 obj_xml_payment.folio = nodosSuperior[0].getAttributeNode({name: 'Folio'}).value;
    //                 var nodosCfdiRelacionado = xml.XPath.select({
    //                     node: xmlSat,
    //                     xpath: 'cfdi:Comprobante//cfdi:Complemento//pago10:Pagos//pago10:Pago//pago10:DoctoRelacionado'
    //                 });
    //
    //                 for (var node = 0; node < nodosCfdiRelacionado.length; node++) {
    //                     var obj_relacionado = {
    //                         IdDocumento: '',
    //                         Folio: '',
    //                         Serie: '',
    //                         MonedaDR: '',
    //                         MetodoDePagoDR: '',
    //                         NumParcialidad: '',
    //                         ImpSaldoAnt: '',
    //                         ImpPagado: '',
    //                         ImpSaldoInsoluto: ''
    //                     };
    //                     log.audit({title: 'node', details: node});
    //                     obj_relacionado.IdDocumento = nodosCfdiRelacionado[node].getAttributeNode({name: 'IdDocumento'}).value;
    //                     obj_relacionado.Folio = nodosCfdiRelacionado[node].getAttributeNode({name: 'Folio'}).value;
    //                     obj_relacionado.Serie = nodosCfdiRelacionado[node].getAttributeNode({name: 'Serie'}).value;
    //                     obj_relacionado.MonedaDR = nodosCfdiRelacionado[node].getAttributeNode({name: 'MonedaDR'}).value;
    //                     obj_relacionado.MetodoDePagoDR = nodosCfdiRelacionado[node].getAttributeNode({name: 'MetodoDePagoDR'}).value;
    //                     obj_relacionado.NumParcialidad = nodosCfdiRelacionado[node].getAttributeNode({name: 'NumParcialidad'}).value;
    //                     log.audit({title: 'parcialidad', details: nodosCfdiRelacionado[node].getAttributeNode({name: 'NumParcialidad'}).value});
    //                     obj_relacionado.ImpSaldoAnt = nodosCfdiRelacionado[node].getAttributeNode({name: 'ImpSaldoAnt'}).value;
    //                     obj_relacionado.ImpPagado = nodosCfdiRelacionado[node].getAttributeNode({name: 'ImpPagado'}).value;
    //                     obj_relacionado.ImpSaldoInsoluto = nodosCfdiRelacionado[node].getAttributeNode({name: 'ImpSaldoInsoluto'}).value;
    //                     obj_xml_payment.relacionado.push(obj_relacionado);
    //                 }
    //                 log.audit({title: 'obj_xml_payment', details: obj_xml_payment});
    //                 var record_obj = record.load({
    //                     type: recType,
    //                     id: record_id
    //                 });
    //                 record_obj.setValue({
    //                     fieldId: 'custbody_efx_fe_xml_data_payment',
    //                     value: JSON.stringify(obj_xml_payment)
    //                 });
    //                 record_obj.save();
    //             }catch (error_after){
    //                 log.audit({title: 'error_after', details: error_after});
    //             }
    //         }
    //     }
    // }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
        //afterSubmit:afterSubmit
    };
    
});
