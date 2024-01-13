/**
 *@NApiVersion 2.x
 *@NModuleScope Public
 *@NScriptType ClientScript
 */
define(['N/ui/message', 'N/url', 'N/https', 'N/record', 'N/search', 'N/email','N/runtime', 'N/format'], function(message, url, https, record, search, email, runtime, format) {

    var dateNow;
    var contentFile;

    function pageInit(context){
        var myMsg = message.create({
            title: "Timbrando transacciones",
            message: "Espere un momento, no cierre la venta se están timbrando las transacciones generadas.",
            type: message.Type.INFORMATION
        });
        myMsg.show();
        setTimeout(function(){
            var currentForm = context.currentRecord;
            var authId = currentForm.getValue({ fieldId: 'custpage_auth'});
            var creditreceiptId = currentForm.getValue({ fieldId: 'custpage_credit_receipt'});
            var realatedId = currentForm.getValue({ fieldId: 'custpage_realted'});
            var transId = currentForm.getValue({ fieldId: 'custpage_invoice'});
            var transType = currentForm.getValue({ fieldId: 'custpage_type'});
            var certId = currentForm.getValue({ fieldId: 'custpage_cert'});
            var dateNow = "";
            var contentFile = currentForm.getValue({ fieldId: 'custpage_pasos'});;
            console.log("creditreceiptId", creditreceiptId);

            var configData = getConfigModule();
            try{

                if(creditreceiptId){
                    if(realatedId){
                        //GENERAR DOCUMENTO
                        var suiteletURL = url.resolveScript({
                            scriptId: "customscript_ei_generation_service_su",
                            deploymentId: "customdeploy_ei_generation_service_su",
                            params: {
                                transId: creditreceiptId*1,
                                transType: transType,
                                certSendingMethodId: certId*1
                            }
                        });
                        console.log(suiteletURL);

                        var responseDoc = https.get({
                            url: suiteletURL
                        })
                        console.log({title: 'responseDoc',details: responseDoc});

                        //TIMBRAR DOCUMENTO
                        var suiteletURL = url.resolveScript({
                            scriptId: "customscript_su_send_e_invoice",
                            deploymentId: "customdeploy_su_send_e_invoice",
                            params: {
                                transId: creditreceiptId*1,
                                transType: transType,
                                certSendingMethodId: certId*1
                            }
                        });
                        console.log(suiteletURL);


                        var responseCFDI = https.get({
                            url: suiteletURL
                        });
                        console.log({title: 'responseCFDI',details: responseCFDI});
                    }
                    var output = url.resolveRecord({
                        recordType: 'returnauthorization',
                        recordId: authId,
                        isEditMode: false
                    });
                    console.log("output", output);
                    window.open(output, '_self');
                }
                else{
                    console.log({
                        transId: transId*1,
                        transType: transType,
                        certSendingMethodId: certId*1
                    });


                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Inicio validar si tiene adenda: " +dateNow +"\n";
                    var transasction = search.lookupFields({
                        type: transType,
                        id: transId*1,
                        columns: ['entity']
                    });
                    console.log("transasction", transasction);
                    var customer = search.lookupFields({
                        type: search.Type.CUSTOMER,
                        id: transasction.entity[0].value,
                        columns: ['custentity_efx_fe_default_addenda']
                    });
                    console.log("transasction", customer);
                    var hasaddenda = customer['custentity_efx_fe_default_addenda'].length;
                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Fin validar si tiene adenda: " +dateNow +"\n";
                    if(hasaddenda){
                        throw "El cliente requiere de adenda.";
                    }

                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Inicio Generar XML: " +dateNow +"\n";
                    //GENERAR DOCUMENTO
                    var suiteletURL = url.resolveScript({
                        scriptId: "customscript_ei_generation_service_su",
                        deploymentId: "customdeploy_ei_generation_service_su",
                        params: {
                            transId: transId*1,
                            transType: transType,
                            certSendingMethodId: certId*1
                        }
                    });
                    console.log(suiteletURL);

                    var responseDoc = https.get({
                        url: suiteletURL
                    })
                    console.log({title: 'responseDoc',details: responseDoc});
                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Fin Generar XML: " +dateNow +"\n";
                    //TIMBRAR DOCUMENTO
                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Inicio Timbrar XML: " +dateNow +"\n";

                    var suiteletURL = url.resolveScript({
                        scriptId: "customscript_su_send_e_invoice",
                        deploymentId: "customdeploy_su_send_e_invoice",
                        params: {
                            transId: transId*1,
                            transType: transType,
                            certSendingMethodId: certId*1
                        }
                    });
                    console.log(suiteletURL);


                    var responseCFDI = https.get({
                        url: suiteletURL
                    });
                    console.log({title: 'responseCFDI',details: responseCFDI});
                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Fin Timbrar XML: " +dateNow +"\n";



                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Inicio Timbrar Notas de crédito " +dateNow +"\n";
                    var creditIDS = currentForm.getValue({ fieldId: 'custpage_credit'});
                    console.log("creditIDS",creditIDS);
                    creditIDS = JSON.parse(creditIDS);
                    console.log("creditIDSParser",creditIDS);
                    for(var i = 0; i < creditIDS.length; i++){
                        dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                        contentFile += "Inicio Generar XML Nota de crédito " +i +": "+dateNow +"\n";
                        console.log("creditIDS", creditIDS[i]);
                        var related = record.create({
                            type: 'customrecord_mx_related_cfdi_subl'
                        });
                        related.setValue({
                            fieldId: 'custrecord_mx_rcs_orig_trans',
                            value: creditIDS[i]*1,
                            ignoreFieldChange: false
                        });
                        related.setValue({
                            fieldId: 'custrecord_mx_rcs_rel_type',
                            value: 7,
                            ignoreFieldChange: false
                        });
                        related.setValue({
                            fieldId: 'custrecord_mx_rcs_rel_cfdi',
                            value: transId*1,
                            ignoreFieldChange: false
                        });
                        var relatedID = related.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        console.log("relatedID", relatedID);
                        //TIMBRAR DOCUMENTO
                        var suiteletURL = url.resolveScript({
                            scriptId: "customscript_ei_generation_service_su",
                            deploymentId: "customdeploy_ei_generation_service_su",
                            params: {
                                transId: creditIDS[i]*1,
                                transType: record.Type.CREDIT_MEMO,
                                certSendingMethodId: certId*1
                            }
                        });
                        console.log(suiteletURL);

                        var responseDoc = https.get({
                            url: suiteletURL
                        })
                        console.log({title: 'responseDoc',details: responseDoc});
                        dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                        contentFile += "Fin Generar XML Nota de crédito " +i +": "+dateNow +"\n";
                        dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                        contentFile += "Inicio Timbrar XML Nota de crédito " +i +": "+dateNow +"\n";

                        var suiteletURL = url.resolveScript({
                            scriptId: "customscript_su_send_e_invoice",
                            deploymentId: "customdeploy_su_send_e_invoice",
                            params: {
                                transId: creditIDS[i]*1,
                                transType: record.Type.CREDIT_MEMO,
                                certSendingMethodId: certId*1
                            }
                        });
                        console.log(suiteletURL);

                        var responseCFDI = https.get({
                            url: suiteletURL
                        });
                        console.log({title: 'responseCFDI',details: responseCFDI});
                        dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                        contentFile += "Fin Timbrar XML Nota de crédito " +i +": "+dateNow +"\n";
                    }

                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Fin Timbrar Notas de crédito " +dateNow +"\n";

                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Inicio Enviar por e-mail: " +dateNow +"\n";
                    //E-MAIL
                    var suiteletURL = url.resolveScript({
                        scriptId: "customscript_su_send_e_invoice",
                        deploymentId: "customdeploy_su_send_e_invoice",
                        params: {
                            transId: transId*1,
                            transType: transType
                        }
                    });
                    console.log(suiteletURL);

                    var responseCFDI = https.get({
                        url: suiteletURL
                    });
                    console.log({title: 'sentEMAIL',details: responseCFDI});

                    dateNow = format.parse({value: new Date().toLocaleString("es-MX", {timeZone: "America/Mexico_City"}),  type: format.Type.DATE, timezone: format.Timezone.AMERICA_MEXICO_CITY});
                    contentFile += "Fin Enviar por e-mail: " +dateNow +"\n";
                    var fulfill = (new URLSearchParams(window.location.search)).get("fulfill");
                    record.submitFields({
                        type: 'itemfulfillment',
                        id: fulfill,
                        values: {
                            custbody_efx_ma_error: ''
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields : true
                        }
                    });
                    var output = url.resolveRecord({
                        recordType: 'itemfulfillment',
                        recordId: fulfill,
                        isEditMode: false
                    });
                    console.log("output", output);
                    window.open(output, '_self');

                }
            }
            catch(e){
                console.log("error", e.name);
                var msg = "";

                if(e.name == "EI_NOT_READY_FOR_SENDING" ||e.name == 'EI_NOT_READY_FOR_SENDING'){
                    var jsonData = JSON.parse(e.message);
                    console.log("jsonData", jsonData);
                    msg = jsonData.message;
                }
                else {
                    msg = e.message;
                }

                if(authId){
                    var output = url.resolveRecord({
                        recordType: 'returnauthorization',
                        recordId: authId,
                        isEditMode: false
                    });
                    console.log("output", output);
                    window.open(output, '_self');
                }

                var fulfill = (new URLSearchParams(window.location.search)).get("fulfill");
                console.log("fulfill", fulfill);
                if(fulfill){
                    var id = record.submitFields({
                        type: 'itemfulfillment',
                        id: fulfill,
                        values: {
                            custbody_efx_ma_error: 'Ha ocurrido un error al intentar timbrar la factura' +((msg)?(', detalles: ' + msg) : '')
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields : true
                        }
                    });
                    var output = url.resolveRecord({
                        recordType: 'itemfulfillment',
                        recordId: fulfill,
                        isEditMode: false
                    });
                    console.log("output", output);
                    window.open(output, '_self');
                }


                sendEmail(configData, transId, msg);

            }


            /*var output = url.resolveRecord({
                recordType: record.Type.INVOICE,
                recordId: transId*1
            });
            window.open(output, "_self");*/


        }, 1500);

    }

    function getConfigModule() {
        try {
            var objSearch = search.lookupFields({
                type: 'customrecord_efx_ma_settings',
                id: 1,
                columns: ['custrecord_efx_ma_s_send_email', 'custrecord_efx_ma_s_email_emp']
            });
            if (objSearch) {
                return objSearch;
            } else {
                log.error({title:'Error on load config', details: 'Config not found'});
                return null;
            }
        } catch (e) {
            log.error({title:'Error on get config module ', details:e});
        }
    }

    function sendEmail(configModule, invoiceid, details) {
        try {
            var senderId = runtime.getCurrentUser().id;
            var recipientId = [];
            var subject = 'Error con timbrado de factura';
            for (var i = 0; i < configModule.custrecord_efx_ma_s_email_emp.length; i++) {
                recipientId.push(configModule.custrecord_efx_ma_s_email_emp[i].value);
            }
            if (recipientId.length) {


                var invoiceNum = '';
                if(invoiceid){
                    invoiceNum = search.lookupFields({
                        type: search.Type.INVOICE,
                        id: invoiceid,
                        columns: ['tranid']
                    });
                }


                var msg = "<b>Causa del error: </b> Error al intentar timbrar la transacción, revisar los registros de documento electrónico de la transacción." ;
                msg += (invoiceNum)? "<br><b>Número de factura: </b>" + invoiceNum.tranid: '';
                msg += (details)? "<br><b>Detalles de error: </b>" + details: '';
                log.audit({
                    title:'Email Data',
                    details:{
                        author: senderId,
                        recipients: recipientId,
                        subject: subject,
                        body: msg
                    }
                });
                email.send({
                    author: senderId,
                    recipients: recipientId,
                    subject: subject,
                    body: msg
                });
            }
        } catch (e) {
            console.error('Error on send email', e);

        }
    }

    function processInvoice(fromSO, fulfill, autoinvoice){
        try{
            console.log("fromSO",fromSO);
            console.log("fulfill",fulfill);
            console.log("autoinvoice",autoinvoice);
            var suiteletURL = url.resolveScript({
                scriptId: "customscript_efx_ma_inv_sl",
                deploymentId: "customdeploy_efx_ma_inv_sl",
                params: {
                    fromSO: fromSO,
                    fulfill: fulfill,
                    autoinvoice: autoinvoice
                }
            });
            console.log("suiteletURL", suiteletURL);
            window.open(suiteletURL, '_self');
        }
        catch(e){
            console.error("processInvoice", e);
        }
    }
    function sendEmailInvoice(configModule, invoiceid, details) {
        try {
            var senderId = runtime.getCurrentUser().id;
            var recipientId = [];
            var subject = 'Error con timbrado de factura';
            for (var i = 0; i < configModule.custrecord_efx_ma_s_email_emp.length; i++) {
                recipientId.push(configModule.custrecord_efx_ma_s_email_emp[i].value);
            }
            if (recipientId.length) {


                var fieldLookup = '';
                if(invoiceid){
                    fieldLookup = search.lookupFields({
                        type: search.Type.INVOICE,
                        id: invoiceid,
                        columns: ['tranid']
                    });
                }


                email.send({
                    author: senderId,
                    recipients: recipientId,
                    subject: 'Comprobante factura: ' + fieldLookup.tranid,
                    body: 'A continuación se adjuntan comprobante y archivo PDF de factura.',
                    attachments: [fileObj],
                });

            }
        } catch (e) {
            console.error('sendEmailInvoice', e);

        }
    }

    return {

        pageInit:pageInit,
        processInvoice: processInvoice


    }

});
