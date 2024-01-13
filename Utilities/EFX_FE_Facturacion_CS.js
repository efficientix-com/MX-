/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
 define(['N/currentRecord','N/http', 'N/https', 'N/record','N/url','N/ui/message','N/search','N/runtime','N/format','./moment.js'],
 /**
  * @param{serverWidget} serverWidget
  */
 function(currentRecord,http, https, record,url,mensajes,search,runtime,format,moment) {
     
     /**
      * Function to be executed after page is initialized.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
      *
      * @since 2015.2
      */
     var enEjecucion = false;
     function pageInit(scriptContext) {
         var recObj = currentRecord.get();
 
         if(recObj.type == 'customrecord_efx_fe_cp_ubicaciones'){
             var dircli = recObj.getValue({fieldId:'custrecord_efx_fe_cp_dirorigen'});
             var dirloc = recObj.getValue({fieldId:'custrecord_efx_fe_cp_locorigen'});
             if(dircli && !dirloc){
                 recObj.getField({
                     fieldId: 'custrecord_efx_fe_cp_locorigen'
                 }).isDisabled = true;
             }
 
             if(!dircli && dirloc){
                 recObj.getField({
                     fieldId: 'custrecord_efx_fe_cp_dirorigen'
                 }).isDisabled = true;
             }
 
 
         }else if(recObj.type == 'customrecord_efx_fe_cp_infovehiculo'){
             var tipoveh = recObj.getValue({fieldId:'custrecord_efx_fe_cp_tipveh'});
 
             if (tipoveh == 1) {
                 recObj.getField({
                     fieldId: 'custrecord_efx_fe_cp_subtiporem'
                 }).isDisplay = false;
             }
 
             if (tipoveh == 2) {
                 recObj.getField({
                     fieldId: 'custrecord_efx_fe_cp_permsct'
                 }).isDisplay = false;
                 recObj.getField({
                     fieldId: 'custrecord_efx_fe_cp_numpermisosct'
                 }).isDisplay = false;
                 recObj.getField({
                     fieldId: 'custrecord_efx_fe_cp_configvehicular'
                 }).isDisplay = false;
                 recObj.getField({
                     fieldId: 'custrecord_efx_fe_cp_aniomodelovm'
                 }).isDisplay = false;
             }
         }else {
             var transporteInternac = recObj.getValue({fieldId:'custbody_efx_fe_transpinternac'});
 
             if (transporteInternac == 2 || !transporteInternac) {
                 recObj.getField({
                     fieldId: 'custbody_efx_fe_cp_entradasalidamerc'
                 }).isDisplay = false;
 
                 recObj.getField({
                     fieldId: 'custbody_efx_fe_cp_viaentradasalida'
                 }).isDisplay = false;
             }
 
         }
     }
 
     /**
      * Function to be executed when field is changed.
      *
      * @param {Object} scriptContext
      * @param {Record} scriptContext.currentRecord - Current form record
      * @param {string} scriptContext.sublistId - Sublist name
      * @param {string} scriptContext.fieldId - Field name
      * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
      * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
      *
      * @since 2015.2
      */
     function fieldChanged(scriptContext) {
         var recObj = currentRecord.get();
 
         if(recObj.type == 'customrecord_efx_fe_cp_ubicaciones'){
 
             if (scriptContext.fieldId == 'custrecord_efx_fe_cp_dirorigen') {
                 var dircli = recObj.getValue({fieldId:'custrecord_efx_fe_cp_dirorigen'});
                 if(dircli){
                     recObj.getField({
                         fieldId: 'custrecord_efx_fe_cp_locorigen'
                     }).isDisabled = true;
                 }else{
                     recObj.getField({
                         fieldId: 'custrecord_efx_fe_cp_locorigen'
                     }).isDisabled = false;
                 }
             }
 
             if (scriptContext.fieldId == 'custrecord_efx_fe_cp_locorigen') {
                 var dirloc = recObj.getValue({fieldId:'custrecord_efx_fe_cp_locorigen'});
                 if(dirloc){
                     recObj.getField({
                         fieldId: 'custrecord_efx_fe_cp_dirorigen'
                     }).isDisabled = true;
                 }else{
                     recObj.getField({
                         fieldId: 'custrecord_efx_fe_cp_dirorigen'
                     }).isDisabled = false;
                 }
             }
 
 
 
         }else if(recObj.type == 'customrecord_efx_fe_cp_infovehiculo'){
 
             if (scriptContext.fieldId == 'custrecord_efx_fe_cp_tipveh') {
                 var tipoveh = recObj.getValue({fieldId:'custrecord_efx_fe_cp_tipveh'});
 
                 if(tipoveh){
                     if (tipoveh == 1) {
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_subtiporem'
                         }).isDisplay = false;
 
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_permsct'
                         }).isDisplay = true;
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_numpermisosct'
                         }).isDisplay = true;
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_configvehicular'
                         }).isDisplay = true;
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_aniomodelovm'
                         }).isDisplay = true;
                     }
 
                     if (tipoveh == 2) {
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_permsct'
                         }).isDisplay = false;
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_numpermisosct'
                         }).isDisplay = false;
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_configvehicular'
                         }).isDisplay = false;
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_subtiporem'
                         }).isDisplay = true;
                         recObj.getField({
                             fieldId: 'custrecord_efx_fe_cp_aniomodelovm'
                         }).isDisplay = false;
                     }
                 }else{
                     recObj.getField({
                         fieldId: 'custrecord_efx_fe_cp_subtiporem'
                     }).isDisplay = true;
                     recObj.getField({
                         fieldId: 'custrecord_efx_fe_cp_permsct'
                     }).isDisplay = true;
                     recObj.getField({
                         fieldId: 'custrecord_efx_fe_cp_numpermisosct'
                     }).isDisplay = true;
                     recObj.getField({
                         fieldId: 'custrecord_efx_fe_cp_configvehicular'
                     }).isDisplay = true;
                     recObj.getField({
                         fieldId: 'custrecord_efx_fe_cp_aniomodelovm'
                     }).isDisplay = true;
                 }
             }
 
         }else {
 
             if (scriptContext.fieldId == 'custbody_efx_fe_transpinternac') {
                 var transporteInternac = recObj.getValue({fieldId: 'custbody_efx_fe_transpinternac'});
                 console.log(transporteInternac);
                 if (transporteInternac == 2 || !transporteInternac) {
                     recObj.getField({
                         fieldId: 'custbody_efx_fe_cp_entradasalidamerc'
                     }).isDisplay = false;
 
                     recObj.getField({
                         fieldId: 'custbody_efx_fe_cp_viaentradasalida'
                     }).isDisplay = false;
 
                 } else if (transporteInternac == 1) {
                     recObj.getField({
                         fieldId: 'custbody_efx_fe_cp_entradasalidamerc'
                     }).isDisplay = true;
 
                     recObj.getField({
                         fieldId: 'custbody_efx_fe_cp_viaentradasalida'
                     }).isDisplay = true;
 
                 }
 
             }
             if (scriptContext.fieldId == 'custbody_efx_fe_transporte') {
                 var tipoTransporte = recObj.getValue({fieldId: 'custbody_efx_fe_transporte'});
                 if (!tipoTransporte || tipoTransporte != 1) {
                     recObj.getField({
                         fieldId: 'custbody_efx_fe_cp_autotrandetail'
                     }).isDisplay = false;
                 } else if (tipoTransporte == 1) {
                     recObj.getField({
                         fieldId: 'custbody_efx_fe_cp_autotrandetail'
                     }).isDisplay = true;
                 }
             }
 
 
 
             // if (scriptContext.fieldId == 'custrecord_efx_fe_cp_dirorigen') {
             //
             //     var dirloc = recObj.getCurrentSublistValue({
             //         sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
             //         fieldId: 'custrecord_efx_fe_cp_dirorigen'
             //     });
             //
             //     var dirlocline = recObj.getCurrentSublistIndex({
             //         sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones'
             //     });
             //     console.log('dirloc: ',dirloc);
             //     console.log('dirlocline: ',dirlocline);
             //
             //     if(dirloc){
             //
             //         recObj.getCurrentSublistField({
             //             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
             //             fieldId: 'custrecord_efx_fe_cp_locorigen',
             //
             //         }).isDisabled = true;
             //     }else{
             //
             //         recObj.getCurrentSublistField({
             //             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
             //             fieldId: 'custrecord_efx_fe_cp_locorigen',
             //
             //         }).isDisabled = false;
             //     }
             //
             //
             // }
             //
             // if (scriptContext.fieldId == 'custrecord_efx_fe_cp_locorigen') {
             //     var dirloc = recObj.getCurrentSublistValue({
             //         sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
             //         fieldId: 'custrecord_efx_fe_cp_locorigen'
             //     });
             //
             //     var dirlocline = recObj.getCurrentSublistIndex({
             //         sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones'
             //     });
             //     console.log('dirloc: ',dirloc);
             //     console.log('dirlocline: ',dirlocline);
             //
             //     if(dirloc){
             //
             //         recObj.getCurrentSublistField({
             //             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
             //             fieldId: 'custrecord_efx_fe_cp_dirorigen',
             //
             //         }).isDisabled = true;
             //     }else{
             //
             //         recObj.getCurrentSublistField({
             //             sublistId: 'recmachcustrecord_efx_fe_cp_ubicaciones',
             //             fieldId: 'custrecord_efx_fe_cp_dirorigen',
             //
             //         }).isDisabled = false;
             //     }
             // }
 
 
         }
     }
 
 
         function creaCP(tranData){
                 var myMsg_create = mensajes.create({
                     title: "Generación",
                     message: "Se está generando un registro de carta Porte...",
                     type: mensajes.Type.INFORMATION
                 });
                 myMsg_create.show();
 
                 console.log('trandata: ',tranData);
                 var tranid = tranData.tranid || '';
                 var trantype = tranData.trantype || '';
                 //GENERAR DOCUMENTO
 
                 var suiteletURL = url.resolveScript({
                     scriptId: "customscript_efx_fe_carta_porte_sl",
                     deploymentId: "customdeploy_efx_fe_carta_porte_sl",
                     params: {
                         tranid: tranid,
                         trantype: trantype,
                         //certSendingMethodId: certId*1
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
                                     message: "Se creó un registro de carta porte.",
                                     type: mensajes.Type.CONFIRMATION
                                 });
                                 myMsg.show({duration: 5500});
 
                                 console.log('respuesta');
                                 location.reload();
                             } catch (error) {
                                 console.log(error);
                             }
 
                         }
 
                     })
                     .catch(function onRejected(reason) {
                         log.debug({
                             title: 'Invalid Request: ',
                             details: reason
                         });
                         var myMsg = mensajes.create({
                             title: "Error",
                             message: reason,
                             type: mensajes.Type.ERROR
                         });
                         myMsg.show({duration: 5500});
                         location.reload();
                     });
 
 
 
         }
 
     function generaCertificaGBLCP(tranData){
         console.log('En ejecucion',enEjecucion);
         if(enEjecucion==false) {
             enEjecucion=true;
             console.log('En ejecucion',enEjecucion);
             var envia_correo_auto = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_autosendmail'});
             var myMsg_create = mensajes.create({
                 title: "Generación",
                 message: "Se está generando y certificando su CFDI...",
                 type: mensajes.Type.INFORMATION
             });
             myMsg_create.show();
 
             var tranid = tranData.tranid || '';
             var trantype = tranData.trantype || '';
             var tipocp = tranData.tipo || '';
             var idtimbre = tranData.idtimbre || '';
             //GENERAR DOCUMENTO
 
             var suiteletURL = url.resolveScript({
                 scriptId: "customscript_efx_fe_xml_generator",
                 deploymentId: "customdeploy_efx_fe_xml_generator",
                 params: {
                     tranid: tranid,
                     trantype: trantype,
                     tipo:tipocp,
                     idtimbre:idtimbre
                     //certSendingMethodId: certId*1
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
 
                             var uuid_record = body.uuid;
                             var xml_record = body.xml_certified;
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
 
 
                             } else {
                                 myMsg_cert.hide();
                                 var myMsg = mensajes.create({
                                     title: "Certificación",
                                     message: "Ocurrio un error durante su certificacion",
                                     type: mensajes.Type.ERROR
                                 });
                                 myMsg.show();
                             }
 
 
                             console.log('respuesta');
                             location.reload();
 
                         } else {
                             myMsg_cert.hide();
                             var myMsg = mensajes.create({
                                 title: "Certificación",
                                 message: "Ocurrio un error durante su certificacion",
                                 type: mensajes.Type.ERROR
                             });
                             myMsg.show();
                         }
                     } else {
                         myMsg_create.hide();
                         var myMsg = mensajes.create({
                             title: "Generación",
                             message: "Ocurrio un error durante su generación",
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
 
         }
 
     }
 
     function sendToMail(tranData) {
         var myMsg_create = mensajes.create({
             title: "Envio de Documentos Electrónicos",
             message: "Sus documentos se están enviando por correo...",
             type: mensajes.Type.INFORMATION
         });
         myMsg_create.show();
         var tranid = tranData.tranid || '';
         var trantype = tranData.trantype || '';
 
         var url_Script = url.resolveScript({
             scriptId: 'customscript_efx_fe_mail_sender_sl',
             deploymentId: 'customdeploy_efx_fe_mail_sender_sl',
             params: {
                 trantype: trantype,
                 tranid: tranid
             }
         });
 
         var headers = {
             "Content-Type": "application/json"
         };
 
         https.request.promise({
             method: https.Method.GET,
             url: url_Script,
             headers: headers
         })
             .then(function(response){
                 log.debug({
                     title: 'Response',
                     details: response
                 });
 
                 if(response.code==200){
                     myMsg_create.hide();
                     var myMsg = mensajes.create({
                         title: "Envio de Documentos Electrónicos",
                         message: "Sus documentos se han enviado por correo electrónico...",
                         type: mensajes.Type.CONFIRMATION
                     });
                     myMsg.show({ duration : 5500 });
 
                     console.log('respuesta');
 
                     location.reload();
                 }else if(response.code==500){
                     myMsg_create.hide();
                     var myMsg = mensajes.create({
                         title: "Envio de Documentos Electrónicos",
                         message: "Ocurrio un error, verifique su conexión.",
                         type: mensajes.Type.ERROR
                     });
                     myMsg.show();
                 }else {
                     myMsg_create.hide();
                     var myMsg = mensajes.create({
                         title: "Envio de Documentos Electrónicos",
                         message: "Ocurrio un error, verifique si sus datos de correo",
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
 
     }
 
     function regeneraPDF(tranData) {
         var myMsg_create = mensajes.create({
             title: "Regenerar PDF",
             message: "Se está generando el PDF desde su XML Certificado...",
             type: mensajes.Type.INFORMATION
         });
         myMsg_create.show();
         var tranid = tranData.tranid || '';
         var trantype = tranData.trantype || '';
 
         var url_Script = url.resolveScript({
             scriptId: 'customscript_efx_fe_cfdi_genera_pdf_sl',
             deploymentId: 'customdeploy_efx_fe_cfdi_genera_pdf_sl',
             params: {
                 trantype: trantype,
                 tranid: tranid
             }
         });
 
         var headers = {
             "Content-Type": "application/json"
         };
 
         https.request.promise({
             method: https.Method.GET,
             url: url_Script,
             headers: headers
         })
             .then(function(response){
                 log.debug({
                     title: 'Response',
                     details: response
                 });
 
                 if(response.code==200){
                     console.log('respuestabody: ',response.body);
                     var bodyrespuesta = JSON.parse(response.body);
                     if(bodyrespuesta){
                         console.log('idpdf: ',bodyrespuesta.idPdf);
                         if(bodyrespuesta.idPdf){
                             myMsg_create.hide();
                             var myMsg = mensajes.create({
                                 title: "Regenerar PDF",
                                 message: "Se ha generado su archivo pdf...",
                                 type: mensajes.Type.CONFIRMATION
                             });
                             myMsg.show({ duration : 5500 });
 
                             console.log('respuesta');
 
                             location.reload();
                         }else{
                             myMsg_create.hide();
                             var myMsg = mensajes.create({
                                 title: "Regenerar PDF",
                                 message: "No se pudo generar su pdf, valide la configuración...",
                                 type: mensajes.Type.ERROR
                             });
                             myMsg.show({ duration : 5500 });
 
                             console.log('respuesta');
 
                             location.reload();
                         }
                     }
 
                 }else if(response.code==500){
                     myMsg_create.hide();
                     var myMsg = mensajes.create({
                         title: "Regenerar PDF",
                         message: "Ocurrio un error, verifique su conexión.",
                         type: mensajes.Type.ERROR
                     });
                     myMsg.show();
                 }else {
                     myMsg_create.hide();
                     var myMsg = mensajes.create({
                         title: "Regenerar PDF",
                         message: "Ocurrio un error, verifique si el xml timbrado es correcto",
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
 
     }
 
     function generaCertifica(tranData){
         console.log('En ejecucion',enEjecucion);
         if(enEjecucion==false) {
             enEjecucion=true;
             console.log('En ejecucion',enEjecucion);
             var envia_correo_auto = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_autosendmail'});
             var myMsg_create = mensajes.create({
                 title: "Generación",
                 message: "Se está generando su CFDI...",
                 type: mensajes.Type.INFORMATION
             });
             myMsg_create.show();
 
             var tranid = tranData.tranid || '';
             var trantype = tranData.trantype || '';
             //GENERAR DOCUMENTO
             var suiteletURL = url.resolveScript({
                 scriptId: "customscript_ei_generation_service_su",
                 deploymentId: "customdeploy_ei_generation_service_su",
                 params: {
                     transId: tranid,
                     transType: trantype,
                     //certSendingMethodId: certId*1
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
 
                         //TIMBRAR DOCUMENTO
                         var suiteletURL = url.resolveScript({
                             scriptId: "customscript_su_send_e_invoice",
                             deploymentId: "customdeploy_su_send_e_invoice",
                             params: {
                                 transId: tranid,
                                 transType: trantype,
                                 //certSendingMethodId: certId*1
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
 
                                 var body = JSON.parse(response.body)
 
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
 
 
                                     } else {
                                         myMsg_cert.hide();
                                         var myMsg = mensajes.create({
                                             title: "Certificación",
                                             message: "Ocurrio un error durante su certificacion",
                                             type: mensajes.Type.ERROR
                                         });
                                         myMsg.show();
                                     }
 
 
                                     console.log('respuesta');
                                     location.reload();
 
                                 } else {
                                     myMsg_cert.hide();
                                     var myMsg = mensajes.create({
                                         title: "Certificación",
                                         message: "Ocurrio un error durante su certificacion",
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
 
 
                     } else {
                         myMsg_create.hide();
                         var myMsg = mensajes.create({
                             title: "Generación",
                             message: "Ocurrio un error durante su generación",
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
 
         }
 
     }
 
     function generaCertificaGBL(tranData){
         console.log('En ejecucion',enEjecucion);
         if(enEjecucion==false) {
             enEjecucion=true;
             console.log('En ejecucion',enEjecucion);
             var envia_correo_auto = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_autosendmail'});
             var myMsg_create = mensajes.create({
                 title: "Generación",
                 message: "Se está generando y certificando su CFDI...",
                 type: mensajes.Type.INFORMATION
             });
             myMsg_create.show();
 
             var tranid = tranData.tranid || '';
             var trantype = tranData.trantype || '';
             //GENERAR DOCUMENTO
 
             var suiteletURL = url.resolveScript({
                 scriptId: "customscript_efx_fe_xml_generator",
                 deploymentId: "customdeploy_efx_fe_xml_generator",
                 params: {
                     tranid: tranid,
                     trantype: trantype,
                     //certSendingMethodId: certId*1
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
 
 
                                     } else {
                                         myMsg_cert.hide();
                                         var myMsg = mensajes.create({
                                             title: "Certificación",
                                             message: "Ocurrio un error durante su certificacion",
                                             type: mensajes.Type.ERROR
                                         });
                                         myMsg.show();
                                     }
 
 
                                     console.log('respuesta');
                                     location.reload();
 
                                 } else {
                                     myMsg_cert.hide();
                                     var myMsg = mensajes.create({
                                         title: "Certificación",
                                         message: "Ocurrio un error durante su certificacion",
                                         type: mensajes.Type.ERROR
                                     });
                                     myMsg.show();
                                 }
                         } else {
                             myMsg_create.hide();
                             var myMsg = mensajes.create({
                                 title: "Generación",
                                 message: "Ocurrio un error durante su generación",
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
 
         }
 
     }

     function cerrar() {
        window.close();
    }

    function create_addenda(tranData) {

        var tranid = tranData.tranid || '';
        var trantype = tranData.trantype || '';
        var xml_addenda = tranData.addenda || '';
        var xml_addenda_name = tranData.addenda_name || '';
        console.log(tranid)

        if (!tranid || !trantype) {
            alert('Error obteniendo el Id de la Transacción!');
        }
        else {
            var myMsg_create = mensajes.create({
                title: "Addendas",
                message: "Su addenda se está generando...",
                type: mensajes.Type.INFORMATION
            });

            myMsg_create.show();

            var url_Script = url.resolveScript({
                scriptId: 'customscript_efx_fe_addendizador_sl',
                deploymentId: 'customdeploy_efx_fe_addendizador_sl',
                returnExternalUrl: false,
            });

            var headers = {
                "Content-Type": "application/json"
            };

            https.request.promise({
                method: https.Method.POST,
                url: url_Script,
                body: {
                    custparam_tranid: tranid,
                    custparam_trantype: trantype,
                    custparam_xmladdenda: xml_addenda,
                    custparam_xmladdenda_name: xml_addenda_name,
                },
                headers: headers
            })
                .then(function(response){
                    log.debug({
                        title: 'Response',
                        details: response
                    });

                    if(response.code==200){
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Addendas",
                            message: "Su Addenda se generó correctamente. Por favor revísela en la subpestaña CFDI Information.",
                            type: mensajes.Type.CONFIRMATION
                        });
                        myMsg.show({ duration : 5500 });

                        console.log('respuesta');

                        location.reload();
                    }else if(responde.code==500){
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Addendas",
                            message: "Ocurrio un error, verifique su conexión.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }else {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Addendas",
                            message: "Ocurrio un error, los datos de su addenda.",
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


            //log.audit({ title: 'response', details: JSON.stringify(response) });
            //window.opener.location.reload();


            //window.open(url_Script, '_blank');
        }
    }

    function ConsultaEstatusSat(tranData) {
        var myMsg_create = mensajes.create({
            title: "Estatus",
            message: "Se está consultando el estatus su CFDI...",
            type: mensajes.Type.INFORMATION
        });
        myMsg_create.show();
        var tranid = tranData.tranid || '';
        var trantype = tranData.trantype || '';
        var uuid = tranData.uuid || '';
        var url_Script = url.resolveScript({
            scriptId: 'customscript_efx_fe_cfdistatus_sl',
            deploymentId: 'customdeploy_efx_fe_cfdistatus_sl'
        });

        url_Script += '&custparam_mode=' + 'estatus_sat';
        url_Script += '&custparam_uuid=' + uuid;
        url_Script += '&custparam_tranid=' + tranid;
        url_Script += '&custparam_trantype=' + trantype;

        var headers = {
            "Content-Type": "application/json"
        };

        https.request.promise({
            method: https.Method.GET,
            url: url_Script,
            headers: headers
        })
            .then(function(response){
                log.debug({
                    title: 'Response',
                    details: response
                });

                if(response.code==200){
                    myMsg_create.hide();
                    var myMsg = mensajes.create({
                        title: "Estatus",
                        message: "El estatus se grabó en el campo CFDI STATUS",
                        type: mensajes.Type.CONFIRMATION
                    });
                    myMsg.show({ duration : 5500 });

                    console.log('respuesta');

                    location.reload();
                }else if(response.code==500){
                    myMsg_create.hide();
                    var myMsg = mensajes.create({
                        title: "Estatus",
                        message: "Ocurrio un error, verifique su conexión.",
                        type: mensajes.Type.ERROR
                    });
                    myMsg.show();
                }else {
                    myMsg_create.hide();
                    var myMsg = mensajes.create({
                        title: "Estatus",
                        message: "Ocurrio un error, verifique si su CFDI existe.",
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

    }

    function cancel_CFDI(tranData) {
        var motivoCancel = new Array();
        var buscaMotivo = search.create({
            type: 'customrecord_efx_fe_motivocancelacion',
            filters: [
                ['isinactive', search.Operator.IS, 'F']
            ],
            columns: [
                search.createColumn({ name: 'internalid' }),
                search.createColumn({ name: 'name' }),
            ]
        });
        buscaMotivo.run().each(function (result) {
            motivoCancel.push(result.getValue({ name: 'name' }) || 0);
            return true;
        });


        var data = document.createElement('cancel-screen');

        var message = '';
        message += '<select id="cancelar">';
        message += '    <option value="0" disabled selected hidden>Seleccione una opción.</option>';
        for (var i = 0; i < motivoCancel.length; i++) {
            message += '    <option value="' + (i + 1) + '">' + motivoCancel[i] + '</option>';
        }
        message += '</select>';


        // Inner HTML
        // Estilos del mensaje + divs del mensaje completo
        data.innerHTML =
            '<style media=all type=text/css>' +
            '#fondo {' +
            'background-color: rgba(230,230,230,0.4);' +
            'height: 100%;' +
            'width:  100%;' +
            'display: flex;' +
            'justify-content: center;' +
            'align-items: center;' +
            'position: fixed;' +
            'margin: auto;' +
            'z-index: 999;' +
            'top: 0;' +
            '} ' +
            '.mensajito {' +
            'z-index: 1000;' +
            'font-family: Myriad Pro,Helvetica,sans-serif;' +
            'background-color: white;' +
            'width: 30%;' +//alto
            'overflow: hidden;' +
            'filter: drop-shadow(0 0 0.1rem black);' +
            'height: 30%;' +//ancho
            'position: fixed;' +
            //'border-radius: 2px;' +
            'top: 40%;' +
            '} ' +
            '.cabecera {' +
            'font-family: Myriad Pro,Helvetica,sans-serif;' +
            'background-color: #607799;' +
            'color: white;' +
            'padding: 4px 6px;' +
            'font-weight: bold;' +
            'font-size: 15px;' +
            '} ' +
            '.contenido {' +
            'padding: 10px;' +
            '} ' +
            'p {' +
            'font-size: 14px;' +
            'color: #616161;' +
            '} ' +
            '.botones {' +
            'font-family: Myriad Pro,Helvetica,sans-serif;' +
            'display: flex;' +
            'justify-content: space-around;' +
            //'margin-top: 20%;'+
            '} ' +
            '.btn1 {' +
            'font-weight: bold;' +
            'background-color: #E9E9E9;' +
            'color: black;' +
            'min-height: 28px;' +
            'text-align: center;' +
            'padding: 0px 13px;' +
            'font-size: 14px;' +
            //'border: 2px solid #008CBA;'+
            'border-radius: 3px;' +
            'cursor: pointer;' +
            '} ' +
            '.btn1:hover {' +
            'background-color: #D8D8D8;' +
            '} ' +
            '.btn2 {' +
            'font-weight: bold;' +
            'background-color: #E9E9E9;' +
            'color: black;' +
            'min-height: 28px;' +
            'text-align: center;' +
            'padding: 0px 13px;' +
            'font-size: 14px;' +
            //'border: 2px solid #008CBA;'+
            'border-radius: 3px;' +
            'cursor: pointer;' +
            '} ' +
            '.btn2:hover {' +
            'background-color: #D8D8D8;' +
            '} ' +
            '</style>' +
            "<div id='fondo'>" + //fondo
            "<div class='mensajito'>" +
            "<div class='cabecera'>" +
            "Motivo de Cancelación" +
            "</div>" +
            "<div class='contenido'>" +
            "<p>Por favor selecciona un motivo de cancelación.</p>" +
            "<br>" +
            message +
            "<br>" +
            "</div>" +
            "<br>" +
            "<div id='option'>" +
            "" +
            "</div>" +
            "<br>" +
            "<div class='botones'>" +
            "<input id='enviar' type='button' class='btn1' value='Ok'></input>" +//mandar dato
            "<input id='cancel' type='button' class='btn2' value='Cancel'></input>" +
            "</div>" +
            "</div>" +
            "</div>";

        document.body.appendChild(data);
        document.getElementById('enviar').addEventListener('click', good, false);
        document.getElementById('cancel').addEventListener('click', fail, false);

        //intento de ver dato
        document.getElementById('cancelar').addEventListener('click', test, false);
        var flag = false;


        function good() {
            console.log('entra a función para cancelación');

            state = false; //bandera
            var canselReasonText = document.getElementById('cancelar');
            var uuidRelacionada = '';
            if (document.getElementById('cancelar').value == 1) {
                cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                uuidRelacionada = document.getElementById('listFact').value;
                console.log(cancelReason);
                console.log(uuidRelacionada);
                state = true;
            } else if (document.getElementById('cancelar').value == 2) {
                cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                console.log(cancelReason);
                state = true;
            } else if (document.getElementById('cancelar').value == 3) {
                cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                console.log(cancelReason);
                state = true;
            } else if (document.getElementById('cancelar').value == 4) {
                cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                console.log(cancelReason);
                state = true;
            } else {
                console.log('no trae valor shido')
                cancelReason = "";
                data.innerHTML = "";
                var mensaje = mensajes.create({
                    title: "Error",
                    message: "Debe seleccionar un motivo de cancelación, Intente de nuevo...",
                    type: mensajes.Type.ERROR
                });
                mensaje.show();
                location.reload();
            }

            if (state && cancelReason) {//document.getElementById('cancelar').value != 0
                data.innerHTML = "";
                var cR = currentRecord.get();

                var id = record.submitFields({
                    type: cR.type,//cambiarlo por cR.type
                    id: cR.id,
                    values: {
                        custbody_efx_fe_cancelreason: cancelReason
                    }
                });
                var myMsg_create = mensajes.create({
                    title: "Cancelacion",
                    message: "Se está cancelando su CFDI...",
                    type: mensajes.Type.INFORMATION
                });
                myMsg_create.show();
                var tranid = tranData.tranid;
                var trantype = tranData.trantype;
                var idGlb = false;
                try {

                    var rec = record.load({
                        type: trantype,
                        id: tranid
                    });

                    //idGlb = rec.getValue({ fieldId: 'custbody_efx_fe_factura_global' }) || '';
                } catch (error) {
                    log.error({ title: 'error', details: JSON.stringify(error) });
                }
                var respuesta = true;

                if (idGlb) {
                    respuesta = confirm("Desea cancelar una factura global?");
                }

                if (respuesta == true && state == true) {//aqui se puede detener la cancelacion

                    var codigoCancelacion = cancelReason.split('-');
                    var url_Script = url.resolveScript({
                        scriptId: 'customscript_efx_fe_cancelacion_sl',
                        deploymentId: 'customdeploy_efx_fe_cancelacion_sl'
                    });

                    url_Script += '&custparam_tranid=' + tranid;
                    url_Script += '&custparam_trantype=' + trantype;
                    url_Script += '&custparam_sutituye=' + 'F';
                    url_Script += '&custparam_motivocancelacion=' + codigoCancelacion; //custbody_efx_fe_cancelreason
                    url_Script += '&custparam_uuidrelacionado=' + uuidRelacionada; //custbody_efx_fe_cancelreason

                    var headers = {
                        "Content-Type": "application/json"
                    };

                    https.request.promise({
                        method: https.Method.GET,
                        url: url_Script,
                        headers: headers
                    })
                        .then(function (response) {
                            log.debug({
                                title: 'Response',
                                details: response
                            });

                            if (response.code == 200) {
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Cancelacion",
                                    message: "El proceso de cancelación concluyó, revise el acuse de cancelación en la subpestaña de CFDI Infomation",
                                    type: mensajes.Type.CONFIRMATION
                                });
                                myMsg.show({ duration: 5500 });

                                console.log('respuesta');

                                location.reload();
                            } else if (response.code == 500) {
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Cancelacion",
                                    message: "Ocurrio un error, verifique su conexión.",
                                    type: mensajes.Type.ERROR
                                });
                                myMsg.show();
                            } else {
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Cancelacion",
                                    message: "Ocurrio un error, verifique si su CFDI puede cancelarse.",
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

                }
            }
        }

        function test() {
            var dato = document.getElementById('cancelar').value;
            var div = document.getElementById('option');//se apunta al mensaje de arriba
            var update = document.createElement('div');//se crea lo que se necesita
            
            var rawDateString = (tranData.trandate).split('T');
            var fechafinText = rawDateString[0];            
            var responseDate = moment(fechafinText).format('DD/MM/YYYY');
            
        
            
            if (dato == 1 && !flag) {
                var facturasArray = new Array();
                var buscaFactura = search.create({
                    type: search.Type.TRANSACTION,
                    filters: [
                        ['mainline', search.Operator.IS, 'T']
                        , 'AND',
                        ['type', search.Operator.ANYOF, 'CustInvc', 'CashSale']
                        , 'AND',
                        ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['entity', search.Operator.ANYOF, tranData.entityid]
                        ,'AND',
                        ["trandate",search.Operator.ONORAFTER,responseDate]
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: 'tranid' }),
                        search.createColumn({ name: 'custbody_mx_cfdi_uuid' }),
                    ]
                });
                try{
                    buscaFactura.run().each(function (result) {
                        var objFacturas = {
                            id: "",
                            numero: ""
                        };
                        console.log('el dato es: ',objFacturas);
                        objFacturas.id = result.getValue({ name: 'custbody_mx_cfdi_uuid' }) || 0;
                        objFacturas.numero = result.getValue({ name: 'tranid' }) || 0;
                        console.log('el dato es: ');
                        console.log('el dato es: ',objFacturas);
                        facturasArray.push(objFacturas);
                        return true;
                    });
                }catch(error_busqueda){
                    console.log('error_busqueda: ',error_busqueda);
                }
                var facturasString = "";
                for (var x = 0; x < facturasArray.length; x++) {
                    facturasString += '<option value="' + facturasArray[x].id + '" >' + facturasArray[x].numero + '</option>'

                }
                flag = true;
                console.log('el dato es: ', dato);
                console.log('aqui debe de hacer que aparezca lo que se pide')
                update.innerHTML = //se agrega a la variable lo de abajo

                    "<style>" +
                    "#option{" +
                    'background-color: white;' +
                    'padding: 10px;' +
                    "}" +
                    "#title{" +
                    'font-family: Myriad Pro,Helvetica,sans-serif;' +
                    'font-size: 14px;' +
                    'color: #616161;' +
                    "}" +
                    ".mensajito{" +
                    'height: 40%;' +
                    "}" +
                    "</style>" +
                    "<p id='title'>Por favor selecciona la factura: </p>" +
                    "<select id='listFact'>" +
                    '<option value="0" disabled selected hidden>Seleccione una opción.</option>' +
                    facturasString +
                    "</select>";

                div.appendChild(update);//se agrega al mensaje
                //console.log(update);
            } else if (dato == 2) {
                flag = false;
                console.log('el dato es: ', dato);
                update.innerHTML =
                    "<style>" +
                    ".mensajito{" +
                    'height: 30%;' +
                    "}" +
                    "</style>";

                div.appendChild(update);
                document.getElementById('option').innerHTML = "";
            } else if (dato == 3) {
                flag = false;
                console.log('el dato es: ', dato);
                update.innerHTML =
                    "<style>" +
                    ".mensajito{" +
                    'height: 30%;' +
                    "}" +
                    "</style>";

                div.appendChild(update);
                document.getElementById('option').innerHTML = "";
            } else if (dato == 4) {
                flag = false;
                console.log('el dato es: ', dato);
                update.innerHTML =
                    "<style>" +
                    ".mensajito{" +
                    'height: 30%;' +
                    "}" +
                    "</style>";

                div.appendChild(update);
                document.getElementById('option').innerHTML = "";
            }

        }

        function fail() {
            console.log('se canceló la operación')
            data.innerHTML = "";
            var mensajeError = mensajes.create({
                title: "Atención.",
                message: "Se ha cancelado la operación...",
                type: mensajes.Type.INFORMATION
            });
            mensajeError.show();
            location.reload();
        }
    }

    function cancel_subs_CFDI(tranData) {
        var motivoCancel = new Array();
        var buscaMotivo = search.create({
            type: 'customrecord_efx_fe_motivocancelacion',
            filters: [
                ['isinactive', search.Operator.IS, 'F']
            ],
            columns: [
                search.createColumn({ name: 'internalid' }),
                search.createColumn({ name: 'name' }),
            ]
        });
        buscaMotivo.run().each(function (result) {
            motivoCancel.push(result.getValue({ name: 'name' }) || 0);
            return true;
        });
        var data = document.createElement('cancel-screen');

        var message = '';
        message += '<select id="cancelar">';
        message += '    <option value="0" disabled selected hidden>Seleccione una opción.</option>';
        for (var i = 0; i < motivoCancel.length; i++) {
            message += '    <option value="' + (i + 1) + '">' + motivoCancel[i] + '</option>';
        }
        message += '</select>';


        // Inner HTML
        // Estilos del mensaje + divs del mensaje completo
        data.innerHTML =
            '<style media=all type=text/css>' +
            '#fondo {' +
            'background-color: rgba(230,230,230,0.4);' +
            'height: 100%;' +
            'width:  100%;' +
            'display: flex;' +
            'justify-content: center;' +
            'align-items: center;' +
            'position: fixed;' +
            'margin: auto;' +
            'z-index: 999;' +
            'top: 0;' +
            '} ' +
            '.mensajito {' +
            'z-index: 1000;' +
            'font-family: Myriad Pro,Helvetica,sans-serif;' +
            'background-color: white;' +
            'width: 30%;' +//alto
            'overflow: hidden;' +
            'filter: drop-shadow(0 0 0.1rem black);' +
            'height: 30%;' +//ancho
            'position: fixed;' +
            //'border-radius: 2px;' +
            'top: 40%;' +
            '} ' +
            '.cabecera {' +
            'font-family: Myriad Pro,Helvetica,sans-serif;' +
            'background-color: #607799;' +
            'color: white;' +
            'padding: 4px 6px;' +
            'font-weight: bold;' +
            'font-size: 15px;' +
            '} ' +
            '.contenido {' +
            'padding: 10px;' +
            '} ' +
            'p {' +
            'font-size: 14px;' +
            'color: #616161;' +
            '} ' +
            '.botones {' +
            'font-family: Myriad Pro,Helvetica,sans-serif;' +
            'display: flex;' +
            'justify-content: space-around;' +
            //'margin-top: 20%;'+
            '} ' +
            '.btn1 {' +
            'font-weight: bold;' +
            'background-color: #E9E9E9;' +
            'color: black;' +
            'min-height: 28px;' +
            'text-align: center;' +
            'padding: 0px 13px;' +
            'font-size: 14px;' +
            //'border: 2px solid #008CBA;'+
            'border-radius: 3px;' +
            'cursor: pointer;' +
            '} ' +
            '.btn1:hover {' +
            'background-color: #D8D8D8;' +
            '} ' +
            '.btn2 {' +
            'font-weight: bold;' +
            'background-color: #E9E9E9;' +
            'color: black;' +
            'min-height: 28px;' +
            'text-align: center;' +
            'padding: 0px 13px;' +
            'font-size: 14px;' +
            //'border: 2px solid #008CBA;'+
            'border-radius: 3px;' +
            'cursor: pointer;' +
            '} ' +
            '.btn2:hover {' +
            'background-color: #D8D8D8;' +
            '} ' +
            '</style>' +
            "<div id='fondo'>" + //fondo
            "<div class='mensajito'>" +
            "<div class='cabecera'>" +
            "Motivo de Cancelación" +
            "</div>" +
            "<div class='contenido'>" +
            "<p>Por favor selecciona un motivo de cancelación.</p>" +
            "<br>" +
            message +
            "<br>" +
            "</div>" +
            "<br>" +
            "<div id='option'>" +
            "" +
            "</div>" +
            "<br>" +
            "<div class='botones'>" +
            "<input id='enviar' type='button' class='btn1' value='Ok'></input>" +//mandar dato
            "<input id='cancel' type='button' class='btn2' value='Cancel'></input>" +
            "</div>" +
            "</div>" +
            "</div>";

        document.body.appendChild(data);
        document.getElementById('enviar').addEventListener('click', goodSubs, false);//aqui está el dato de la lista
        document.getElementById('cancel').addEventListener('click', failSubs, false);

        document.getElementById('cancelar').addEventListener('click', test, false);
        var flag = false;

        function goodSubs() {
            console.log('entra a función para cancelación/sustitución');

            state = false; //bandera
            var canselReasonText = document.getElementById('cancelar');
            var uuidRelacionada = '';
            if (document.getElementById('cancelar').value == 1) {
                cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                uuidRelacionada = document.getElementById('listFact').value;
                console.log(cancelReason);
                console.log('entra al else if, opcion 1')
                console.log(uuidRelacionada);
            } else if (document.getElementById('cancelar').value == 2) {
                cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                console.log(cancelReason);
                console.log('entra al else if, opcion 2')
                state = true;
            } else if (document.getElementById('cancelar').value == 3) {
                cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                console.log(cancelReason);
                console.log('entra al else if, opcion 3')
                state = true;
            } else if (document.getElementById('cancelar').value == 4) {
                cancelReason = canselReasonText.options[canselReasonText.selectedIndex].text;
                console.log('entra al else if, opcion 4')
                console.log(cancelReason);
                state = true;
            } else {
                console.log('no trae valor shido')
                cancelReason = "null";
                // state = false; //bandera
                data.innerHTML = "";
                var mensaje = mensajes.create({
                    title: "Error",
                    message: "Debe seleccionar un motivo de cancelación, Intente de nuevo...",
                    type: mensajes.Type.ERROR
                });
                mensaje.show();
                location.reload();
            }
            if (state && cancelReason) {
                console.log('entra al if : "if (state && cancelReason)"')
                data.innerHTML = "";
                var cR = currentRecord.get();

                var id = record.submitFields({
                    type: cR.type,
                    id: cR.id,
                    values: {
                        custbody_efx_fe_cancelreason: cancelReason
                    }
                });
                //proceso para ver si es sutitución
                var solosustituye = tranData.solosustituye;
                console.log('var solosustituye: ', solosustituye)
                if (solosustituye == 'T') {
                    console.log('entra en el if de solosustituye')
                    var myMsg_create = mensajes.create({
                        title: "Sustitución",
                        message: "Se está sustituyendo su Transacción...",
                        type: mensajes.Type.INFORMATION
                    });
                } else {//no es sustitucion, hará cancelación
                    console.log('entra en el else de solosustituye')
                    var myMsg_create = mensajes.create({
                        title: "Cancelacion",
                        message: "Se está cancelando su CFDI...",
                        type: mensajes.Type.INFORMATION
                    });
                }
                myMsg_create.show();
                var tranid = tranData.tranid;
                var trantype = tranData.trantype;

                var idGlb = false;
                try {

                    var rec = record.load({
                        type: trantype,
                        id: tranid
                    });

                    //idGlb = rec.getValue({ fieldId: 'custbody_efx_fe_factura_global' }) || '';
                } catch (error) {
                    log.error({ title: 'error', details: JSON.stringify(error) });
                }
                var respuesta = true;

                if (idGlb) {
                    respuesta = confirm("Desea cancelar una factura global?");
                }

                if (respuesta == true && state == true) {

                    var codigoCancelacion = cancelReason.split('-')
                    var url_Script = url.resolveScript({
                        scriptId: 'customscript_efx_fe_cancelacion_sl',
                        deploymentId: 'customdeploy_efx_fe_cancelacion_sl'
                    });

                    url_Script += '&custparam_tranid=' + tranid;
                    url_Script += '&custparam_trantype=' + trantype;
                    url_Script += '&custparam_sutituye=' + 'T';
                    url_Script += '&custparam_motivocancelacion=' + codigoCancelacion; //custbody_efx_fe_cancelreason
                    url_Script += '&custparam_uuidrelacionado=' + uuidRelacionada;
                    if (solosustituye == 'T') {//si es sust, lo manda
                        url_Script += '&custparam_solosutituye=' + 'T';
                    }

                    var headers = {
                        "Content-Type": "application/json"
                    };

                    https.request.promise({
                        method: https.Method.GET,
                        url: url_Script,
                        headers: headers
                    })
                        .then(function (response) {
                            log.debug({
                                title: 'Response',
                                details: response
                            });

                            if (response.code == 200) {//si cargó bien, ya sustituyó
                                myMsg_create.hide();
                                if (solosustituye == 'T') {
                                    var myMsg = mensajes.create({
                                        title: "Sustitución",
                                        message: "Su transaccion se sustituyó correctamente",
                                        type: mensajes.Type.CONFIRMATION
                                    });
                                } else {
                                    var myMsg = mensajes.create({
                                        title: "Cancelacion",
                                        message: "El proceso de cancelación concluyó, revise el acuse de cancelación en la subpestaña de CFDI Infomation",
                                        type: mensajes.Type.CONFIRMATION
                                    });
                                }

                                myMsg.show({ duration: 5500 });

                                console.log(response);
                                if (response.body) {
                                    var body_data = JSON.parse(response.body);
                                    console.log(response.body);
                                    console.log(body_data.id_tran);

                                    var output = url.resolveRecord({
                                        recordType: 'invoice',
                                        recordId: body_data.id_tran,
                                        isEditMode: true
                                    });
                                    window.open(output, '_blank');
                                    console.log(output);
                                }
                                location.reload();

                                //location.reload();
                            } else if (response.code == 500) {
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Cancelacion",
                                    message: "Ocurrio un error, verifique su conexión.",
                                    type: mensajes.Type.ERROR
                                });
                                myMsg.show();
                            } else {
                                myMsg_create.hide();
                                var myMsg = mensajes.create({
                                    title: "Cancelacion",
                                    message: "Ocurrio un error, verifique si su CFDI puede cancelarse.",
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
                }
            }
        }

        function test() {
            var dato = document.getElementById('cancelar').value;
            var div = document.getElementById('option');//se apunta al mensaje de arriba
            var update = document.createElement('div');//se crea lo que se necesita
            var rawDateString = (tranData.trandate).split('T');
            var fechafinText = rawDateString[0];            
            var responseDate = moment(fechafinText).format('DD/MM/YYYY');
            if (dato == 1 && !flag) {
                var facturasArray = new Array();
                var buscaFactura = search.create({
                    type: search.Type.TRANSACTION,
                    filters: [
                        ['mainline', search.Operator.IS, 'T']
                        , 'AND',
                        ['type', search.Operator.ANYOF, 'CustInvc', 'CashSale']
                        , 'AND',
                        ['custbody_mx_cfdi_uuid', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['entity', search.Operator.ANYOF, tranData.entityid]
                        ,'AND',
                        ["trandate",search.Operator.ONORAFTER,responseDate]
                    ],
                    columns: [
                        search.createColumn({ name: 'internalid' }),
                        search.createColumn({ name: 'tranid' }),
                        search.createColumn({ name: 'custbody_mx_cfdi_uuid' }),
                    ]
                });
                buscaFactura.run().each(function (result) {
                    var objFacturas = {
                        id: "",
                        numero: ""
                    };
                    objFacturas.id = result.getValue({ name: 'custbody_mx_cfdi_uuid' }) || 0;
                    objFacturas.numero = result.getValue({ name: 'tranid' }) || 0;
                    facturasArray.push(objFacturas);
                    return true;
                });
                var facturasString = "";
                for (var x = 0; x < facturasArray.length; x++) {
                    facturasString += '<option value="' + facturasArray[x].id + '" >' + facturasArray[x].numero + '</option>'

                }
                flag = true;
                console.log('el dato es: ', dato);
                console.log('aqui debe de hacer que aparezca lo que se pide')
                update.innerHTML = //se agrega a la variable lo de abajo

                    "<style>" +
                    "#option{" +
                    'background-color: white;' +
                    'padding: 10px;' +
                    "}" +
                    "#title{" +
                    'font-family: Myriad Pro,Helvetica,sans-serif;' +
                    'font-size: 14px;' +
                    'color: #616161;' +
                    "}" +
                    ".mensajito{" +
                    'height: 40%;' +
                    "}" +
                    "</style>" +
                    "<p id='title'>Por favor selecciona la factura: </p>" +
                    "<select id='listFact'>" +
                    '<option value="0" disabled selected hidden>Seleccione una opción.</option>' +
                    facturasString +
                    "</select>";

                div.appendChild(update);//se agrega al mensaje
                //console.log(update);
            } else if (dato == 2) {
                flag = false;
                console.log('el dato es: ', dato);
                update.innerHTML =
                    "<style>" +
                    ".mensajito{" +
                    'height: 30%;' +
                    "}" +
                    "</style>";

                div.appendChild(update);
                document.getElementById('option').innerHTML = "";
            } else if (dato == 3) {
                flag = false;
                console.log('el dato es: ', dato);
                update.innerHTML =
                    "<style>" +
                    ".mensajito{" +
                    'height: 30%;' +
                    "}" +
                    "</style>";

                div.appendChild(update);
                document.getElementById('option').innerHTML = "";
            } else if (dato == 4) {
                flag = false;
                console.log('el dato es: ', dato);
                update.innerHTML =
                    "<style>" +
                    ".mensajito{" +
                    'height: 30%;' +
                    "}" +
                    "</style>";

                div.appendChild(update);
                document.getElementById('option').innerHTML = "";
            }

        }

        function failSubs() {
            console.log('se canceló la operación en sustitutción')
            data.innerHTML = "";
            var mensajeError = mensajes.create({
                title: "Atención.",
                message: "Se ha cancelado la operación...",
                type: mensajes.Type.INFORMATION
            });
            mensajeError.show();
            location.reload();
        }
    }
 
     return {
         pageInit: pageInit,
         fieldChanged: fieldChanged,
         creaCP:creaCP,
         generaCertificaGBLCP:generaCertificaGBLCP,
         sendToMail:sendToMail,
         generaCertifica:generaCertifica,
         generaCertificaGBL:generaCertificaGBL,
         regeneraPDF:regeneraPDF,
         cerrar: cerrar,
         create_addenda: create_addenda,
         ConsultaEstatusSat:ConsultaEstatusSat,
         cancel_CFDI: cancel_CFDI,
         cancel_subs_CFDI: cancel_subs_CFDI,
 
     };
     
 });
 