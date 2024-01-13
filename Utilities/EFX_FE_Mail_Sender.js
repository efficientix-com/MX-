/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/render', 'N/search','N/runtime','N/file','N/xml','N/encode','N/https','N/http','N/email'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{search} search
     */
    function(record, render, search,runtime,file,xml,encode,https,http,email) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            var respuesta = {
                success: false
            };
            try {
                var tipotran = context.request.parameters.trantype || '';
                var idtran = context.request.parameters.tranid || '';
                var transactionCreator = context.request.parameters.transactionCreator || '';

                log.audit({title:'context.request.parameters',details:context.request.parameters});
                log.audit({title:'tipotran',details:tipotran});
                log.audit({title:'idtran',details:idtran});
                log.audit({title:'transactionCreator',details:transactionCreator});

                // if(tipotran=='cashsale'){
                //     tipotran = record.Type.CASH_SALE;
                // }
                //
                // if(tipotran=='invoice'){
                //     tipotran = record.Type.INVOICE;
                // }
                //
                // if(tipotran=='custcred'){
                //     tipotran = record.Type.CREDIT_MEMO;
                // }


                var recordObj = record.load({
                    type: tipotran,
                    id: idtran
                });
                var send_mail= recordObj.getValue({fieldId: 'custbody_efx_fe_send_cert_docs'});
                var recipient_mail = recordObj.getValue({fieldId: 'custbody_efx_fe_mail_to'});

                log.audit({title: 'send_mail', details: send_mail});
                log.audit({title: 'recipient_mail', details: recipient_mail});

               if(send_mail) {
                    var scriptObj = runtime.getCurrentScript();
                    var cuerpo_mail = scriptObj.getParameter({name: 'custscript_efx_fe_mail_body'});
                    var asunto_mail = scriptObj.getParameter({name: 'custscript_efx_fe_mail_subject'});
                    var emailAuthor = scriptObj.getParameter({name: 'custscript_efx_fe_mail_sender'});
                    //crear y devolver info
                    if (!emailAuthor) {
                        emailAuthor = context.request.parameters.author || '';
                    }

                    var idToSend = context.request.parameters.tosend || '';
                    var xmlId = context.request.parameters.xmlid || '';
                    var pdfId = context.request.parameters.pdfid || '';

                    if(!idToSend){
                        if(tipotran=='customerpayment'){
                            idToSend = recordObj.getValue({fieldId: 'customer'});
                        }else{
                            idToSend = recordObj.getValue({fieldId: 'entity'});
                        }

                    }

                    if(!xmlId){
                        xmlId = recordObj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});
                    }

                    if(!pdfId){
                        pdfId = recordObj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                    }


                    var bodyText = cuerpo_mail || '';
                    var subjectText = asunto_mail || '';
                    log.audit({title:'idToSend',details:idToSend});

                    var entityObj = record.load({
                        type: record.Type.CUSTOMER,
                        id: idToSend
                    });

                    var emailToSend = '';
                    var xmlAttachment = '';
                    var pdfAttachment = '';

                    log.audit({title:'recipient_mail.length',details:recipient_mail.length});
                    if(recipient_mail.length <= 0){
                        
                        emailToSend = entityObj.getValue({fieldId: 'email'});
                        log.audit({title:'emailToSend',details:emailToSend});
                    }else{
                        if(transactionCreator && parseInt(transactionCreator)>0){
                            recipient_mail.push(transactionCreator);
                        }
                        emailToSend = recipient_mail;
                    }

                    if (xmlId) {
                        xmlAttachment = file.load({
                            id: xmlId
                        });
                    }

                    if (pdfId) {
                        pdfAttachment = file.load({
                            id: pdfId
                        });
                    }

                    log.audit({title: 'emailAuthor', details: emailAuthor});
                    log.audit({title: 'emailToSend', details: emailToSend});
                    log.audit({title: 'subjectText', details: subjectText});
                    log.audit({title: 'bodyText', details: bodyText});
                    log.audit({title: 'xmlAttachment', details: xmlAttachment});
                    log.audit({title: 'pdfAttachment', details: pdfAttachment});
                    var inicio = 0;
                    var fin = 0;
                    var id_fields = new Array();
                    var campo_id = '';
                    subjectText = subjectText.replace(/&lt;/g, '<');
                    subjectText = subjectText.replace(/&gt;/g, '>');
                    log.audit({title: 'subjectText', details: subjectText});
                    log.audit({title: 'subjectText.length', details: subjectText.length});

                    for (var i = 0; i < subjectText.length; i++) {
                        var caracter = subjectText[i];
                        if (caracter == '<') {
                            inicio = i + 1;

                        }
                        if (caracter == '>') {
                            fin = i;

                            campo_id = subjectText.slice(inicio, fin);

                            id_fields.push(campo_id);
                        }

                    }
                    log.audit({title: 'id_fields', details: id_fields});
                    var newsubjectText = '';


                    for (var x = 0; x < id_fields.length; x++) {

                        newsubjectText = subjectText.replace(id_fields[x], recordObj.getValue({fieldId: id_fields[x]}));
                        subjectText = newsubjectText;
                    }

                    subjectText = subjectText.replace(/</g, '');
                    subjectText = subjectText.replace(/>/g, '');


                    bodyText = '<div>' + clearHtmlText(bodyText) + '</div>';

                    var id_fields_body = new Array();

                    for (var i = 0; i < bodyText.length; i++) {
                        var caracter = bodyText[i];
                        if (caracter == '{') {
                            inicio = i + 1;

                        }
                        if (caracter == '}') {
                            fin = i;

                            campo_id = bodyText.slice(inicio, fin);

                            id_fields_body.push(campo_id);
                        }

                    }

                    log.audit({title: 'id_fields_body', details: id_fields_body});
                    log.audit({title: 'bodyText', details: bodyText});

                    for (var x = 0; x < id_fields_body.length; x++) {

                        newsubjectText = bodyText.replace(id_fields_body[x], recordObj.getValue({fieldId: id_fields_body[x]}));
                        bodyText = newsubjectText;
                    }

                    bodyText = bodyText.replace(/{/g, '');
                    bodyText = bodyText.replace(/}/g, '');

                    log.audit({title: 'bodyText', details: bodyText});
                    var array_archivos = new Array();

                    if(xmlAttachment){
                        array_archivos.push(xmlAttachment);
                    }
                    if(pdfAttachment){
                        array_archivos.push(pdfAttachment);
                    }

                    try {

                        email.send({
                            author: emailAuthor,
                            recipients: emailToSend,
                            subject: subjectText,
                            body: bodyText,
                            attachments: array_archivos
                        });

                        respuesta.success = true;

                    } catch (error_send) {
                        respuesta.success = false;
                        log.error({title: 'error_send', details: error_send});
                    }
                }else{
                   respuesta.success = false;
               }
            }catch(error_send_mail){
                respuesta.success = false;
                log.error({title:'error_send_mail',details:error_send_mail});
            }

            context.response.setHeader({
                name: "Content-Type",
                value: "application/json"
            });

            context.response.write({
                output: JSON.stringify(respuesta)
            });

        }

        function clearHtmlText(htmlText) {
            var ret = unescape(htmlText);
            ret = htmlText.replace(/&gt;/g, '>');
            ret = ret.replace(/&lt;/g, '<');
            ret = ret.replace(/&quot;/g, '"');
            ret = ret.replace(/&apos;/g, "'");
            ret = ret.replace(/&amp;/g, '&');
            return ret;
        }

        return {
            onRequest: onRequest
        };

    });
