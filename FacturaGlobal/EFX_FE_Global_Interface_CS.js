/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/message','N/url','N/https','N/runtime'],
    /**
     * @param{record} record
     * @param{message} message
     */
    function(currentRecord, mensajes,url,https,runtime) {

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

        function fieldChanged(scriptContext) {

            if( scriptContext.fieldId === 'custpage_efx_seldir'){
                var objRecord = scriptContext.currentRecord;
                var objDireccion = objRecord.getValue({
                    fieldId: 'custpage_efx_diremisorobj'
                });

                var objDireccionParsed = {};
                if(objDireccion){
                    objDireccionParsed = JSON.parse(objDireccion);
                    var direccioneSelected = objRecord.getValue({
                        fieldId: 'custpage_efx_seldir'
                    });
                    for(var d=0;d<objDireccionParsed.length;d++){
                        if(objDireccionParsed[d].idDireccion == direccioneSelected){
                            // objRecord.setValue({
                            //     fieldId: 'custpage_efx_lexpedicion',
                            //     value: objDireccionParsed[d].zipDireccion
                            // });
                            objRecord.setValue({
                                fieldId: 'custpage_efx_direceptor',
                                value: objDireccionParsed[d].textoDireccion
                            });
                        }
                    }
                }
            }

            if (scriptContext.fieldId === 'custpage_efx_select') {
                var objRecord = scriptContext.currentRecord;
                var selectedID = [];
                var totalcabecera = objRecord.getValue({
                    fieldId: 'custpage_efx_totalsel'
                }) || 0;
                var checks = objRecord.getValue({
                    fieldId: 'custpage_efx_idtransactions'
                });
                if (checks) {
                    selectedID = JSON.parse(checks);
                }
                var checkLine = objRecord.getCurrentSublistValue({
                    sublistId: 'custpage_efx_transactions',
                    fieldId: 'custpage_efx_select'
                });
                var checkID = objRecord.getSublistValue({
                    sublistId: 'custpage_efx_transactions',
                    fieldId: 'custpage_efx_internalid',
                    line: scriptContext.line
                });

                var totalLinea = objRecord.getSublistValue({
                    sublistId: 'custpage_efx_transactions',
                    fieldId: 'custpage_efx_amount',
                    line: scriptContext.line
                });
                console.log('totalcabecera: ',totalcabecera);
                console.log('totallinea: ',totalLinea);
                if (checkLine) {
                    var existe = false;
                    for(var x=0;x<selectedID.length;x++){
                        if(checkID==selectedID[x]){
                            existe=true;
                        }
                    }
                    if(!existe){
                        selectedID.push(checkID);
                        totalcabecera = parseFloat(totalcabecera)+parseFloat(totalLinea);
                        objRecord.setValue({
                            fieldId: 'custpage_efx_idtransactions',
                            value: JSON.stringify(selectedID)
                        })
                    }


                } else {
                    var existe = false;
                    for(var x=0;x<selectedID.length;x++){
                        if(checkID==selectedID[x]){
                            existe=true;
                        }
                    }

                    if(existe){
                        var positionId = selectedID.indexOf(checkID);
                        selectedID.splice(positionId, 1);
                        totalcabecera = parseFloat(totalcabecera)-parseFloat(totalLinea);
                    }

                    objRecord.setValue({
                        fieldId: 'custpage_efx_idtransactions',
                        value: JSON.stringify(selectedID)
                    })
                }
                if (totalcabecera<0) {
                    totalcabecera=0;
                }
                var esnan = isNaN(totalcabecera);
                if(esnan){
                    totalcabecera=0;
                }
                console.log('totalcabecera: ',totalcabecera);
                if(selectedID.length==0){
                    totalcabecera = 0;
                }
                totalcabecera=totalcabecera*1;
                objRecord.setValue({
                    fieldId: 'custpage_efx_totalsel',
                    value: totalcabecera.toFixed(2)
                })
                console.log('totalcabecera: ',totalcabecera);
            }


        }

        function filtros(){
            var campos= currentRecord.get();

            var filterDetailsObj = new Object();

            filterDetailsObj.customer = campos.getValue('custpage_efx_receptor_c');
            filterDetailsObj.moneda = campos.getValue('custpage_efx_currency');
            filterDetailsObj.subsidiary = campos.getValue('custpage_efx_subsidiary');
            filterDetailsObj.class = campos.getValue('custpage_efx_class_field');
            filterDetailsObj.fpago = campos.getValue('custpage_efx_forma_field');
            filterDetailsObj.location = campos.getValue('custpage_efx_loc_field');
            filterDetailsObj.department = campos.getValue('custpage_efx_dep_field');
            filterDetailsObj.startdate = campos.getText('custpage_efx_start_date');
            filterDetailsObj.enddate = campos.getText('custpage_efx_end_date');
            filterDetailsObj.index = campos.getValue('custpage_efx_paginacion');
            filterDetailsObj.tipo_factura = campos.getValue('customlist_efx_fe_gbl_tipo');
            filterDetailsObj.tipo_transaccion = campos.getValue('custpage_efx_ttransact') || '';
            filterDetailsObj.total_lineas = campos.getValue('custpage_efx_totalsel') || 0;

            return filterDetailsObj;
        }

        function filtrado(){

            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
            var campos= currentRecord.get();

            var filterDetailsObj = filtros();

            if(!filterDetailsObj.customer){
                var myMsg = mensajes.create({
                    title: "Facturación Global",
                    message: "Por Favor seleccionar un Cliente para continuar.",
                    type: mensajes.Type.ERROR
                });
                myMsg.show({duration: 5500});
            }

            if(SUBSIDIARIES) {
                if (!filterDetailsObj.subsidiary) {
                    var myMsg = mensajes.create({
                        title: "Facturación Global",
                        message: "Por Favor seleccionar una subsidiaria para continuar.",
                        type: mensajes.Type.ERROR
                    });
                    myMsg.show({duration: 5500});
                }
            }

            if(!filterDetailsObj.moneda){
                var myMsg = mensajes.create({
                    title: "Facturación Global",
                    message: "Por Favor seleccionar una moneda para continuar.",
                    type: mensajes.Type.ERROR
                });
                myMsg.show({duration: 5500});
            }




            if(SUBSIDIARIES) {
                if (filterDetailsObj.subsidiary && filterDetailsObj.customer && filterDetailsObj.moneda) {
                    var scriptURL = url.resolveScript({
                        scriptId: 'customscript_efx_fe_global_int_sl',
                        deploymentId: 'customdeploy_efx_fe_global_int_sl',
                        returnExternalURL: true,
                        params: {
                            value: JSON.stringify(filterDetailsObj),
                            index: filterDetailsObj.index
                        }
                    });

                    window.open(scriptURL, '_self');
                }
            }else{
                if (filterDetailsObj.customer && filterDetailsObj.moneda) {
                    var scriptURL = url.resolveScript({
                        scriptId: 'customscript_efx_fe_global_int_sl',
                        deploymentId: 'customdeploy_efx_fe_global_int_sl',
                        returnExternalURL: true,
                        params: {
                            value: JSON.stringify(filterDetailsObj),
                            index: filterDetailsObj.index
                        }
                    });

                    window.open(scriptURL, '_self');
                }
            }
        }

        function generar(){
            var campos= currentRecord.get();
            //
            // var objSend = {
            //     idcliente: '',
            //     regimenFiscal:'',
            //     emisor:'',
            //     rfcemisor:'',
            //     Lugarexpedicion:'',
            //     dirEmisor:'',
            //     receptor:'',
            //     rfcreceptor:'',
            //     arrayObj:[],
            //     totalPagos:0,
            //     numOperacion:'',
            //     bcoBeneficiario:'',
            //     rfcBeneficiario:'',
            //     ctaBeneficiario:'',
            //     bcoOrdenante:'',
            //     rfcOrdenante:'',
            //     ctaOrdenante:'',
            //     formaPago:'',
            //     tipoCambio:'',
            //     monedaPa:''
            // }
            
            var objIds = {
                ids:'',
                customer:'',
                customerSucursal:'',
                subsidiary:'',
                location:'',
                department:'',
                class:'',
                tipo_factura:'',
                f_pago:'',
                m_pago:'',
                usocfdi:'',
                descripcion:'',
                contactos:'',
                memo:'',
                fechaparafactura:'',
                periodicidad:'',
                meses:''
            }
            
            var arrayIds = new  Array();

            // var arrayObj = new Array();

            objIds.subsidiary = campos.getValue('custpage_efx_subsidiary');
            objIds.class = campos.getValue('custpage_efx_class_field');
            objIds.location = campos.getValue('custpage_efx_loc_field');
            objIds.department = campos.getValue('custpage_efx_dep_field');
            //objIds.location = campos.getValue('custpage_efx_location');
            objIds.tipo_factura = campos.getValue('custpage_efx_tipofac');
            objIds.forma_global = campos.getValue('custpage_efx_tipogbl');
            objIds.m_pago = campos.getValue('custpage_efx_mpago');
            objIds.f_pago = campos.getValue('custpage_efx_fpago');
            objIds.moneda = campos.getValue('custpage_efx_currency');
            objIds.usocfdi = campos.getValue('custpage_efx_usocfdi');
            objIds.descripcion = campos.getValue('custpage_efx_description');
            objIds.contactos = campos.getValue('custpage_efx_mailcont');
            objIds.memo = campos.getValue('custpage_efx_memofield');
            objIds.donativo = campos.getValue('custpage_efx_donfield');
            objIds.customer = campos.getValue('custpage_efx_receptor_c');
            objIds.customerSucursal = campos.getValue('custpage_efx_customer');
            objIds.tipo_transaccion = campos.getValue('custpage_efx_ttransact');
            objIds.total_lineas = campos.getValue('custpage_efx_totalsel') || 0;
            objIds.ids = JSON.parse(campos.getValue('custpage_efx_idtransactions'));
            objIds.fechaparafactura = campos.getValue('custpage_efx_invdate');
            objIds.periodicidad = campos.getValue('custpage_efx_periodi');
            objIds.meses = campos.getValue('custpage_efx_meses');
            objIds.direccionemisor = campos.getValue('custpage_efx_direceptor');
            objIds.lugarexpedicion = campos.getValue('custpage_efx_lexpedicion');

            // objSend.Lugarexpedicion = campos.getValue('custpage_efx_lexpedicion');
            // objSend.dirEmisor = campos.getValue('custpage_efx_diremisor');
            // objSend.emisor = campos.getValue('custpage_efx_emisor');
            // objSend.rfcemisor = campos.getValue('custpage_efx_rfcemisor');
            // objSend.receptor = campos.getValue('custpage_efx_receptor');
            // objSend.rfcreceptor = campos.getValue('custpage_efx_receptor_rfc');
            // objSend.numOperacion = campos.getValue('custpage_efx_numoperacion');
            // objSend.bcoBeneficiario = campos.getValue('custpage_efx_bancobenef');
            // objSend.rfcBeneficiario = campos.getValue('custpage_efx_rfcben');
            // objSend.ctaBeneficiario = campos.getValue('custpage_efx_ctabenef');
            // objSend.bcoOrdenante = campos.getValue('custpage_efx_bcoorden');
            // objSend.rfcOrdenante = campos.getValue('custpage_efx_rfcorden');
            // objSend.ctaOrdenante = campos.getValue('custpage_efx_ctaorden');
            // objSend.formaPago = campos.getText('custpage_efx_payform_cb');
            // objSend.tipoCambio = campos.getText('custpage_efx_tipocambio');
            // objSend.monedaPa = campos.getText('custpage_efx_monedapa');



           // var conteoLineas = campos.getLineCount({sublistId:'custpage_efx_transactions'});

            var linea_selected = objIds.ids.length;
            var sumaPagos=0;
            // for(var i=0;i<conteoLineas;i++){
            //     // var generaObj = {
            //     //     idPagos:'',
            //     //     forma_pago:''
            //     // };
            //
            //     var selected = campos.getSublistValue({
            //         sublistId:'custpage_efx_transactions',
            //         fieldId:'custpage_efx_select',
            //         line:i
            //     });
            //
            //     if(selected){
            //         linea_selected++;
            //         var idTransaction = campos.getSublistValue({
            //             sublistId:'custpage_efx_transactions',
            //             fieldId:'custpage_efx_internalid',
            //             line:i
            //         });
            //
            //         arrayIds.push(idTransaction);
            //
            //         // var forma_pago = campos.getSublistValue({
            //         //     sublistId:'custpage_efx_transactions',
            //         //     fieldId:'custpage_efx_payform',
            //         //     line:i
            //         // }) || '';
            //         //
            //         // if(forma_pago<10){
            //         //     forma_pago = '0'+forma_pago;
            //         // }
            //         //
            //         //
            //         // var total_pago = campos.getSublistValue({
            //         //     sublistId:'custpage_efx_transactions',
            //         //     fieldId:'custpage_efx_amount',
            //         //     line:i
            //         // }) || 0;
            //         //
            //         // sumaPagos = sumaPagos+parseFloat(total_pago);
            //         //
            //         //
            //         // generaObj.idPagos = idPagos;
            //         // generaObj.forma_pago = forma_pago;
            //         // objSend.arrayObj.push(generaObj);
            //     }
            //
            // }
            // console.log('arrayIds: ',arrayIds);
            // objIds.ids = arrayIds;

            //peticiones
            if(objIds.tipo_factura) {
                if (linea_selected > 0) {
                    var myMsg_create = mensajes.create({
                        title: "Facturación Global",
                        message: "Se está generando el registro de Factura Global...",
                        type: mensajes.Type.INFORMATION
                    });
                    myMsg_create.show();

                    try {
                        var url_Script = url.resolveScript({
                            scriptId: 'customscript_efx_fe_global_int_sl',
                            deploymentId: 'customdeploy_efx_fe_global_int_sl'
                        });

                        var headers = {
                            "Content-Type": "application/json"
                        };

                        console.log('url_Script: ', url_Script);
                        console.log('objIds: ', objIds);

                        https.request.promise({
                            method: https.Method.POST,
                            url: url_Script,
                            headers: headers,
                            body: JSON.stringify(objIds)
                        })
                            .then(function (response) {
                                log.debug({
                                    title: 'Response',
                                    details: response
                                });

                                if (response.code == 200) {
                                    myMsg_create.hide();
                                    var myMsg = mensajes.create({
                                        title: "Facturación Global",
                                        message: "Se generó correctamente su registro de Factura Global.",
                                        type: mensajes.Type.CONFIRMATION
                                    });
                                    myMsg.show({duration: 5500});
                                    if (response.body) {
                                        var idrecordJson = JSON.parse(response.body);

                                        console.log('respuesta: ', idrecordJson.id);
                                        console.log('respuesta: ', idrecordJson.createdby);
                                        console.log('respuesta: ', idrecordJson.idrecord);


                                        var scriptURL = url.resolveScript({
                                            scriptId: 'customscript_efx_fe_global_status_sl',
                                            deploymentId: 'customdeploy_efx_fe_global_status_sl',
                                            returnExternalURL: true,
                                            params: {
                                                id: idrecordJson.id,
                                                createdby: idrecordJson.createdby,
                                                idrecord: idrecordJson.idrecord
                                            }
                                        });

                                        window.open(scriptURL, '_self');

                                    }
                                    //location.reload();


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

                            })
                            .catch(function onRejected(reason) {
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
                } else {
                    var myMsg = mensajes.create({
                        title: "Facturación Global",
                        message: "Por Favor seleccione al menos 1 transacción...",
                        type: mensajes.Type.ERROR
                    });
                    myMsg.show({duration: 5500});
                }

            }else{
                    var myMsg = mensajes.create({
                        title: "Facturación Global",
                        message: "Por Favor seleccione el tipo de factura global a generar.",
                        type: mensajes.Type.ERROR
                    });
                    myMsg.show({duration: 5500});
            }


        }

        function marcar(marca){
            var objRecord = currentRecord.get();
            var selectedID = [];
            var checks = objRecord.getValue({
                fieldId: 'custpage_efx_idtransactions'
            });
            if (checks) {
                selectedID = JSON.parse(checks);
            }

            var totalcabecera  = objRecord.getValue({
                fieldId: 'custpage_efx_totalsel'
            }) || 0;

            console.log('totalcabeceramarcar: ',totalcabecera);

            var conteoLineas = objRecord.getLineCount({sublistId:'custpage_efx_transactions'});
            console.log('conteoLineas: ',conteoLineas);
            for(var i=0;i<conteoLineas;i++){
                objRecord.selectLine({
                    sublistId: 'custpage_efx_transactions',
                    line:i
                });
                // var totalLinea = objRecord.getCurrentSublistValue({
                //     sublistId: 'custpage_efx_transactions',
                //     fieldId: 'custpage_efx_amount',
                // });
                if(marca){
                    objRecord.setCurrentSublistValue({
                        sublistId: 'custpage_efx_transactions',
                        fieldId: 'custpage_efx_select',
                        value:true
                    });
                    // totalcabecera = totalcabecera+parseFloat(totalLinea);
                }else{
                    objRecord.setCurrentSublistValue({
                        sublistId: 'custpage_efx_transactions',
                        fieldId: 'custpage_efx_select',
                        value:false
                    });
                    // if(typeof totalcabecera != 'number' || totalcabecera == NaN){
                    //     totalcabecera=0;
                    // }
                    // totalcabecera = totalcabecera-parseFloat(totalLinea);
                }

            }
            for(var i=0;i<conteoLineas;i++){
                var existe = false;
                var totalLinea = objRecord.getSublistValue({
                    sublistId: 'custpage_efx_transactions',
                    fieldId: 'custpage_efx_amount',
                    line:i
                });
                var checkID = objRecord.getSublistValue({
                    sublistId: 'custpage_efx_transactions',
                    fieldId: 'custpage_efx_internalid',
                    line: i
                });
                console.log('checkID: ',checkID);
                var checkLine = objRecord.getSublistValue({
                    sublistId: 'custpage_efx_transactions',
                    fieldId: 'custpage_efx_select',
                    line: i
                });
                console.log('checkLine: ',checkLine);

                for(var x=0;x<selectedID.length;x++){
                    if(checkID==selectedID[x]){
                        existe=true;
                    }
                }
                if(existe){
                    if(!checkLine){
                        var positionId = selectedID.indexOf(checkID);
                        //totalcabecera = totalcabecera-parseFloat(totalLinea);
                        selectedID.splice(positionId, 1);
                    }
                    continue;
                }


                if (checkLine) {
                    if(typeof totalcabecera != 'number' || totalcabecera == NaN){
                        totalcabecera=0;
                    }
                    selectedID.push(checkID);
                    totalcabecera = totalcabecera+parseFloat(totalLinea);
                    objRecord.setValue({
                        fieldId: 'custpage_efx_idtransactions',
                        value: JSON.stringify(selectedID)
                    });
                    // objRecord.setValue({
                    //     fieldId: 'custpage_efx_totalsel',
                    //     value: totalcabecera.toFixed(2)
                    // });
                }

            }
            objRecord.setValue({
                fieldId: 'custpage_efx_idtransactions',
                value: JSON.stringify(selectedID)
            });

            console.log('finaltotalcabecera',totalcabecera);
            // var esnan = isNaN(totalcabecera);
            // if(esnan){
            //     totalcabecera=0;
            // }
            console.log('finaltotalcabecera',totalcabecera);
            // objRecord.setValue({
            //     fieldId: 'custpage_efx_totalsel',
            //     value: totalcabecera.toFixed(2)
            // });

        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            filtrado:filtrado,
            generar:generar,
            marcar:marcar

        };

    });
