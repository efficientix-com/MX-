/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currency', 'N/record', 'N/runtime','N/format','N/search'],
    function (currency, record, runtime,format,search) {
        function pageInit(context) {
            var currentRecord = context.currentRecord;
            try {
                if (context.mode == 'edit') {
                    var monedaTransaccion = context.currentRecord.getValue({ fieldId: 'currency' }) || '';
                    var monedaEfx = context.currentRecord.getValue({ fieldId: 'custbody_efx_fe_moneda' }) || '';
                    if (monedaTransaccion && monedaEfx && monedaTransaccion != monedaEfx) {
                        context.currentRecord.getField('custbody_efx_fe_tipo_cambio').isDisabled = false;
                        context.currentRecord.getField('custbody_efx_fe_importe').isDisabled = false;
                    }
                }

                // if (context.mode == 'create') {
                //     var fechaActualP = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_date_payment' });
                //     console.log(fechaActualP);
                //     if(fechaActualP){
                //         currentRecord.setValue({
                //             fieldId: 'custbody_efx_fe_actual_date',
                //             value: fechaActualP
                //         });
                //     }
                //
                //         var fechaActual = new Date();
                //         var hora = fechaActual.getHours();
                //         var minutos = fechaActual.getMinutes();
                //         var segundos = fechaActual.getSeconds();
                //         if(hora<10){
                //             hora='0'+hora;
                //         }
                //         if(minutos<10){
                //             minutos='0'+minutos;
                //         }
                //         if(segundos<10){
                //             segundos='0'+segundos;
                //         }
                //         var hora_actual = hora+':'+minutos+':'+segundos;
                //         currentRecord.setValue({
                //             fieldId: 'custbody_efx_fe_actual_hour',
                //             value: hora_actual
                //         });
                //
                // }

            } catch (errorPageInit) {
                console.log({ title: 'errorPageInit', details: JSON.stringify(errorPageInit) });
            }
        }

        function fieldChanged(context) {
            try {
                var fieldId = context.fieldId;

                var currentRecord = context.currentRecord;

                var idCampoFechaPago = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_date_payment' });
                // debugger;
                if (fieldId == 'custbody_efx_fe_moneda' || fieldId == 'exchangerate') {
                    console.log({title: 'LOG', details: 'Hola'});
                    var monedaEfx = currentRecord.getValue({
                        fieldId: 'custbody_efx_fe_moneda'
                    });

                    var monedaEfx_value = currentRecord.getValue({
                        fieldId: 'custbody_efx_fe_moneda'
                    });

                    var monedaEfx_textJson = '';
                    if(monedaEfx_value){
                        monedaEfx_textJson = search.lookupFields({
                            type: search.Type.CURRENCY,
                            id: monedaEfx_value,
                            columns: ['symbol']
                        });
                    }

                    if(monedaEfx_textJson){
                        var monedaEfx_text = monedaEfx_textJson.symbol;
                    }else{
                        var monedaEfx_text = '';
                    }


                    // var monedaEfx_text = currentRecord.getText({
                    //     fieldId: 'custbody_efx_fe_moneda'
                    // });

                    var monedaPago = currentRecord.getValue({
                        fieldId: 'currency'
                    });

                    var monedaPago_value = currentRecord.getValue({
                        fieldId: 'currency'
                    });

                    var monedaPago_textJson = '';

                    if(monedaPago_value){
                        monedaPago_textJson = search.lookupFields({
                            type: search.Type.CURRENCY,
                            id: monedaPago_value,
                            columns: ['symbol']
                        });
                    }



                    if(monedaPago_textJson){
                        var monedaPago_text = monedaPago_textJson.symbol;
                    }else{
                        var monedaPago_text = '';
                    }

                    // var monedaPago_text = currentRecord.getText({
                    //     fieldId: 'currency'
                    // });

                    var fecha = currentRecord.getValue({
                        fieldId: 'trandate'
                    });

                    var applied = currentRecord.getValue({
                        fieldId: 'applied'
                    });

                    if (fecha && monedaEfx && monedaPago && monedaEfx != monedaPago) {

                        var num_lines = currentRecord.getLineCount({
                            sublistId: 'apply'
                        });

                        var descuentos=0;
                        var disc_total = 0;

                        console.log(num_lines);

                        for(var t=0;t<num_lines;t++){
                            descuentos = currentRecord.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'disc',
                                line: t
                            });
                            disc_total = descuentos+disc_total;
                        }

                        console.log(disc_total);

                        var canadianAmount = 1;

                        if(idCampoFechaPago){
                            var fechaHoy = new Date();
                            var fechaExchange = format.parse({
                                value: fechaHoy,
                                type: format.Type.DATE
                            });
                        }else{
                            var fechaExchange = new Date(fecha);
                       }

                        console.log('monedaPago_text: ',monedaPago_text);
                        console.log('monedaEfx_text: ',monedaEfx_text);

                        if(monedaPago_text=='USD' && monedaEfx_text=='MXN'){
                            var tcambio = currentRecord.getValue({
                                fieldId: 'exchangerate'
                            });

                            console.log('tcambio: ',tcambio);
                            var rate = 1/parseFloat(tcambio);
                            console.log('rate: ',rate);

                        }else{
                            var rate = currency.exchangeRate({
                                source: monedaEfx,
                                target: monedaPago,
                                date: fechaExchange
                            });
                        }


                        console.log(monedaEfx);
                        console.log(monedaPago);
                        console.log(rate);
                        var exchangeAmount = canadianAmount * rate;
                        var exchangeAmountOrigin = exchangeAmount.toFixed(10);

                        exchangeAmount = exchangeAmount.toFixed(10);

                        var exchangeRate = currentRecord.setValue({
                            fieldId: 'custbody_efx_fe_tipo_cambio',
                            value: exchangeAmount,
                            ignoreFieldChange: true
                        });

                        if(disc_total>0){
                            var newTotal = ((parseFloat(applied)+parseFloat(disc_total)) / exchangeAmountOrigin);
                            console.log('newTotal1: '+newTotal );
                        }else{
                            var newTotal = (applied / exchangeAmountOrigin);
                            console.log('newTotal2: '+newTotal );
                        }

                        // newTotal = decimalMinMax(newTotal);
                        newTotal = newTotal.toFixed(2);
                        var exchangeApplied = currentRecord.setValue({
                            fieldId: 'custbody_efx_fe_importe',
                            value: newTotal,
                            ignoreFieldChange: true
                        });

                        currentRecord.getField('custbody_efx_fe_tipo_cambio').isDisabled = false;
                        currentRecord.getField('custbody_efx_fe_importe').isDisabled = false;
                    }

                    else {
                        var exchangeRate = currentRecord.setValue({
                            fieldId: 'custbody_efx_fe_tipo_cambio',
                            value: '',
                            ignoreFieldChange: true
                        });


                        var newTotal = (exchangeAmount * applied);
                        console.log('else-exr: '+newTotal );
                        var exchangeApplied = currentRecord.setValue({
                            fieldId: 'custbody_efx_fe_importe',
                            value: '',
                            ignoreFieldChange: true
                        });

                        currentRecord.getField('custbody_efx_fe_tipo_cambio').isDisabled = true;
                        currentRecord.getField('custbody_efx_fe_importe').isDisabled = true;
                    }

                }

                if (fieldId == 'trandate') {

                    var fechaActual = new Date();
                    var hora = fechaActual.getHours();
                    var minutos = fechaActual.getMinutes();
                    var segundos = fechaActual.getSeconds();
                    if(hora<10){
                        hora='0'+hora;
                    }
                    if(minutos<10){
                        minutos='0'+minutos;
                    }
                    if(segundos<10){
                        segundos='0'+segundos;
                    }
                    var hora_actual = hora+':'+minutos+':'+segundos;
                    currentRecord.setValue({
                        fieldId: 'custbody_efx_fe_actual_hour',
                        value: hora_actual
                    });


                }

                if(fieldId == 'custbody_efx_fe_banco_emisor'){
                    var bancodata = currentRecord.getValue({
                        fieldId: 'custbody_efx_fe_banco_emisor'
                    });

                    if(bancodata){
                        var bancodataobj = record.load({
                            type:'customrecord_efx_fe_cta_banc_cliente',
                            id:bancodata
                        });
                        var nodecuenta = bancodataobj.getValue({fieldId:'custrecord_efx_fe_num_cuenta'});
                        var rfcbanco = bancodataobj.getValue({fieldId:'custrecord_efx_banco_rfc'});
                        var nombrebanco = bancodataobj.getValue({fieldId:'name'});

                        if(rfcbanco){
                            currentRecord.setValue({
                                fieldId: 'custbody_mx_cfdi_issuer_entity_rfc',
                                value:rfcbanco
                            });
                        }
                        if(nodecuenta){
                            currentRecord.setValue({
                                fieldId: 'custbody_mx_cfdi_payer_account',
                                value:nodecuenta
                            });
                        }
                        if(nombrebanco){
                            currentRecord.setValue({
                                fieldId: 'custbody_mx_cfdi_issue_bank_name',
                                value:nombrebanco
                            });
                        }

                    }

                }
            } catch (error) {
                log.audit({ title: 'error', details: JSON.stringify(error) });
            }

        }
        function postSourcing(context) {
            try {
                console.log('postsourcing','Post');
                var fieldId = context.fieldId;

                var currentRecord = context.currentRecord;

                var idCampoFechaPago = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_date_payment' });
                // debugger;
                if (fieldId == 'trandate') {
                    console.log('postsourcing','Postfield');
                    var monedaEfx = currentRecord.getValue({
                        fieldId: 'custbody_efx_fe_moneda'
                    });

                    var monedaEfx_value = currentRecord.getValue({
                        fieldId: 'custbody_efx_fe_moneda'
                    });

                    var monedaEfx_textJson = '';
                    if(monedaEfx_value){
                        monedaEfx_textJson = search.lookupFields({
                            type: search.Type.CURRENCY,
                            id: monedaEfx_value,
                            columns: ['symbol']
                        });
                    }

                    if(monedaEfx_textJson){
                        var monedaEfx_text = monedaEfx_textJson.symbol;
                    }else{
                        var monedaEfx_text = '';
                    }


                    // var monedaEfx_text = currentRecord.getText({
                    //     fieldId: 'custbody_efx_fe_moneda'
                    // });

                    var monedaPago = currentRecord.getValue({
                        fieldId: 'currency'
                    });

                    var monedaPago_value = currentRecord.getValue({
                        fieldId: 'currency'
                    });

                    var monedaPago_textJson = '';

                    if(monedaPago_value){
                        monedaPago_textJson = search.lookupFields({
                            type: search.Type.CURRENCY,
                            id: monedaPago_value,
                            columns: ['symbol']
                        });
                    }



                    if(monedaPago_textJson){
                        var monedaPago_text = monedaPago_textJson.symbol;
                    }else{
                        var monedaPago_text = '';
                    }

                    // var monedaPago_text = currentRecord.getText({
                    //     fieldId: 'currency'
                    // });

                    var fecha = currentRecord.getValue({
                        fieldId: 'trandate'
                    });

                    var applied = currentRecord.getValue({
                        fieldId: 'applied'
                    });

                    if (fecha && monedaEfx && monedaPago && monedaEfx != monedaPago) {

                        var num_lines = currentRecord.getLineCount({
                            sublistId: 'apply'
                        });

                        var descuentos=0;
                        var disc_total = 0;

                        console.log(num_lines);

                        for(var t=0;t<num_lines;t++){
                            descuentos = currentRecord.getSublistValue({
                                sublistId: 'apply',
                                fieldId: 'disc',
                                line: t
                            });
                            disc_total = descuentos+disc_total;
                        }

                        console.log(disc_total);

                        var canadianAmount = 1;

                        if(idCampoFechaPago){
                            var fechaHoy = new Date();
                            var fechaExchange = format.parse({
                                value: fechaHoy,
                                type: format.Type.DATE
                            });
                        }else{
                            var fechaExchange = new Date(fecha);
                        }

                        console.log('monedaPago_text: ',monedaPago_text);
                        console.log('monedaEfx_text: ',monedaEfx_text);

                        if(monedaPago_text=='USD' && monedaEfx_text=='MXN'){
                            var tcambio = currentRecord.getValue({
                                fieldId: 'exchangerate'
                            });

                            console.log('tcambio: ',tcambio);
                            var rate = 1/parseFloat(tcambio);
                            console.log('rate: ',rate);

                        }else{
                            var rate = currency.exchangeRate({
                                source: monedaEfx,
                                target: monedaPago,
                                date: fechaExchange
                            });
                        }


                        console.log(monedaEfx);
                        console.log(monedaPago);
                        console.log(rate);
                        var exchangeAmount = canadianAmount * rate;

                        var exchangeAmountOrigin = exchangeAmount.toFixed(10);
                        exchangeAmount = exchangeAmount.toFixed(10);

                        var exchangeRate = currentRecord.setValue({
                            fieldId: 'custbody_efx_fe_tipo_cambio',
                            value: exchangeAmount,
                            ignoreFieldChange: true
                        });

                        if(disc_total>0){
                            var newTotal = ((parseFloat(applied)+parseFloat(disc_total)) / exchangeAmountOrigin);
                            console.log('newTotal1: '+newTotal );
                        }else{
                            var newTotal = (applied / exchangeAmountOrigin);
                            console.log('newTotal2: '+newTotal );
                        }

                        // newTotal = decimalMinMax(newTotal);
                        newTotal = newTotal.toFixed(2);
                        var exchangeApplied = currentRecord.setValue({
                            fieldId: 'custbody_efx_fe_importe',
                            value: newTotal,
                            ignoreFieldChange: true
                        });

                        currentRecord.getField('custbody_efx_fe_tipo_cambio').isDisabled = false;
                        currentRecord.getField('custbody_efx_fe_importe').isDisabled = false;
                    }

                    else {
                        var exchangeRate = currentRecord.setValue({
                            fieldId: 'custbody_efx_fe_tipo_cambio',
                            value: '',
                            ignoreFieldChange: true
                        });


                        var newTotal = (exchangeAmount * applied);
                        console.log('else-exr: '+newTotal );
                        var exchangeApplied = currentRecord.setValue({
                            fieldId: 'custbody_efx_fe_importe',
                            value: '',
                            ignoreFieldChange: true
                        });

                        currentRecord.getField('custbody_efx_fe_tipo_cambio').isDisabled = true;
                        currentRecord.getField('custbody_efx_fe_importe').isDisabled = true;
                    }

                }

                if (fieldId == 'trandate') {

                    var fechaActual = new Date();
                    var hora = fechaActual.getHours();
                    var minutos = fechaActual.getMinutes();
                    var segundos = fechaActual.getSeconds();
                    if(hora<10){
                        hora='0'+hora;
                    }
                    if(minutos<10){
                        minutos='0'+minutos;
                    }
                    if(segundos<10){
                        segundos='0'+segundos;
                    }
                    var hora_actual = hora+':'+minutos+':'+segundos;
                    currentRecord.setValue({
                        fieldId: 'custbody_efx_fe_actual_hour',
                        value: hora_actual
                    });


                }

                if(fieldId == 'custbody_efx_fe_banco_emisor'){
                    var bancodata = currentRecord.getValue({
                        fieldId: 'custbody_efx_fe_banco_emisor'
                    });

                    if(bancodata){
                        var bancodataobj = record.load({
                            type:'customrecord_efx_fe_cta_banc_cliente',
                            id:bancodata
                        });
                        var nodecuenta = bancodataobj.getValue({fieldId:'custrecord_efx_fe_num_cuenta'});
                        var rfcbanco = bancodataobj.getValue({fieldId:'custrecord_efx_banco_rfc'});
                        var nombrebanco = bancodataobj.getValue({fieldId:'name'});

                        if(rfcbanco){
                            currentRecord.setValue({
                                fieldId: 'custbody_mx_cfdi_issuer_entity_rfc',
                                value:rfcbanco
                            });
                        }
                        if(nodecuenta){
                            currentRecord.setValue({
                                fieldId: 'custbody_mx_cfdi_payer_account',
                                value:nodecuenta
                            });
                        }
                        if(nombrebanco){
                            currentRecord.setValue({
                                fieldId: 'custbody_mx_cfdi_issue_bank_name',
                                value:nombrebanco
                            });
                        }

                    }

                }
            } catch (error) {
                log.audit({ title: 'error', details: JSON.stringify(error) });
            }
        }

        return {
            fieldChanged: fieldChanged,
            pageInit: pageInit,
            postSourcing: postSourcing,
        };
    });