/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
 define(['N/record', 'N/render', 'N/search','N/runtime','./libsatcodes','./libcustomitems','./summary','N/file','N/xml','N/encode','N/https','N/http','./pagodata','N/config','./XmlToPdf','N/format','./EFX_FE_Lib','N/url'/*,'../EFX_FE_Config_Parameters'*/],
 /**
  * @param{https} https
  * @param{record} record
  * @param{search} search
  */
 function(record, render, search,runtime,SATCodesDao,customItems,summaryCalc,file,xml,encode,https,http,pagodata,config,XmlToPdf,format,libCFDI,url/*,runtimeObj*/) {

     /**
      * Definition of the Suitelet script trigger point.
      *
      * @param {Object} context
      * @param {ServerRequest} context.request - Encapsulation of the incoming request
      * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
      * @Since 2015.2
      */
     function onRequest(context) {
         var scriptObj = runtime.getCurrentScript();
        // var ObjScript = runtimeObj.getParameters();
         var folderBase = scriptObj.getParameter({ name: 'custscript_efx_fe_folder_certify' });
         var folderBaseSubsidiaria = scriptObj.getParameter({ name: 'custscript_efx_fe_folder_subsidiary' });
         var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: 'subsidiaries' });
         //var folderBase = ObjScript['custrecord_efx_fe_configura_folder'];
         log.audit({title:'folderBase',details:folderBase});
         var idPropietario = scriptObj.getParameter({ name: 'custscript_efx_fe_owner_certify' });
         var cfdiversion = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_version' });
         //crear y devolver info
         log.audit({title:'context.request.parameters',details:context.request.parameters});
         var tipo_transaccion = context.request.parameters.trantype || '';
         var id_transaccion = context.request.parameters.tranid || '';
         var tipo_cp = context.request.parameters.tipo || '';
         var idtimbre = context.request.parameters.idtimbre || '';
         var pagoCompensacion = context.request.parameters.pagoCompensacion || '';
         var tipo_transaccion_gbl = '';
         var tipo_transaccion_cp = '';
         var accountid = '';

         var tranid_Array = new Array();
         if(pagoCompensacion=='T'){
             log.audit({title:'context.request',details:context.request});
             log.audit({title:'context.request.body',details:context.request.body});
         }
         
         log.audit({title:'tipo_transaccion',details:tipo_transaccion});
         log.audit({title:'id_transaccion',details:id_transaccion});
         log.audit({title:'tipo_cp',details:tipo_cp});
         log.audit({title:'idtimbre',details:idtimbre});

         var conpanyinformationObj = config.load({
             type: config.Type.COMPANY_INFORMATION
         });
         accountid = conpanyinformationObj.getValue('companyid');

         var enabled = false;
         enabled = validaAcceso(accountid);
         log.audit({title:'enabled',details:enabled});

         //crear
         log.audit({title:'idtimbre',details:idtimbre});
         log.audit({title:'tipo_transaccion',details:tipo_transaccion});
         if(tipo_transaccion=='customsale_efx_fe_factura_global'){
             tipo_transaccion_gbl=tipo_transaccion;
             tipo_transaccion='invoice';
         }else if(tipo_transaccion=='cashsale' && tipo_cp){
             tipo_transaccion_cp=tipo_transaccion;
             tipo_transaccion='itemfulfillment';
         }else if(tipo_transaccion=='salesorder' && tipo_cp){
             tipo_transaccion_cp=tipo_transaccion;
             tipo_transaccion='itemfulfillment';
         }else if(tipo_transaccion=='itemfulfillment' && tipo_cp){
             tipo_transaccion_cp=tipo_transaccion;
             tipo_transaccion='itemfulfillment';
         }else if(tipo_transaccion=='purchaseorder' || tipo_transaccion=='itemreceipt'){
             tipo_transaccion_cp=tipo_transaccion;
             tipo_transaccion='itemfulfillment';
         }

         log.audit({title:'tipo_transaccion',details:tipo_transaccion});
         log.audit({title:'tipo_transaccion_cp',details:tipo_transaccion_cp});
         log.audit({title:'idPropietario',details:idPropietario});
         log.audit({title:'id_transaccion',details:id_transaccion});
         log.audit({title:'tipo_cp',details:tipo_cp});
         var respuesta = {
             success: false,
             xml_generated:'',
             xml_certified:'',
             pdf_generated:'',
             uuid:'',
             tranid:'',
             trantype:'',
             error_details:'',
             error_texto:'',
             error_objeto:''
         }

         if(enabled == true){
         
             if(tipo_transaccion && id_transaccion) {

                 if(tipo_cp){
                     var recordCp = record.load({
                         type:'customrecord_efx_fe_cp_carta_porte',
                         id:idtimbre
                     });

                     var recordobj = record.load({
                         type: tipo_transaccion_cp,
                         id: id_transaccion
                     });
                     var id_template = recordCp.getValue({fieldId: 'custrecord_efx_fe_cp_ctempxml'});
                     var generar_pdf = recordobj.getValue({fieldId: 'custbody_edoc_gen_trans_pdf'});
                     var tran_sendingmethod = recordCp.getValue({fieldId: 'custrecord_efx_fe_cp_cmetpxml'});
                     var tran_tranid = recordobj.getValue({fieldId: 'tranid'});
                     var tran_uuid = recordCp.getValue({fieldId: 'custrecord_efx_fe_cp_cuuid'});
                     var tran_xml = recordCp.getValue({fieldId: 'custrecord_efx_fe_cp_cxml'});
                     var tran_pdf = recordCp.getValue({fieldId: 'custrecord_efx_fe_cp_cpdf'});
                 }else{
                     if(tipo_transaccion_gbl){
                         var recordobj = record.load({
                             type: tipo_transaccion_gbl,
                             id: id_transaccion
                         });
                         var id_template = recordobj.getValue({fieldId: 'custbody_efx_fe_gbl_plantilla'});
                         var generar_pdf = recordobj.getValue({fieldId: 'custbody_edoc_gen_trans_pdf'});
                         var tran_sendingmethod = recordobj.getValue({fieldId: 'custbody_efx_fe_gbl_envio'});
                         var tran_tranid = recordobj.getValue({fieldId: 'tranid'});
                         var tran_uuid = recordobj.getValue({fieldId: 'custbody_mx_cfdi_uuid'});
                         var tran_xml = recordobj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                         var tran_pdf = recordobj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});
                     }else if(tipo_transaccion_cp){
                         var recordobj = record.load({
                             type: tipo_transaccion_cp,
                             id: id_transaccion
                         });
                         var id_template = recordobj.getValue({fieldId: 'custbody_psg_ei_template'});
                         if(!id_template){
                            id_template = recordobj.getValue({fieldId: 'custbody_efx_fe_plantilla_docel'});
                         }
                         var generar_pdf = recordobj.getValue({fieldId: 'custbody_edoc_gen_trans_pdf'});
                         var tran_sendingmethod = recordobj.getValue({fieldId: 'custbody_psg_ei_sending_method'});
                         if(!tran_sendingmethod){
                            tran_sendingmethod = recordobj.getValue({fieldId: 'custbody_efx_fe_metodo_docel'});
                         }
                         var tran_tranid = recordobj.getValue({fieldId: 'tranid'});
                         var tran_uuid = recordobj.getValue({fieldId: 'custbody_mx_cfdi_uuid'});
                         var tran_xml = recordobj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                         var tran_pdf = recordobj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});
                     }else{
                         var recordobj = record.load({
                             type: tipo_transaccion,
                             id: id_transaccion
                         });
                         var id_template = recordobj.getValue({fieldId: 'custbody_psg_ei_template'});
                         if(!id_template){
                            id_template = recordobj.getValue({fieldId: 'custbody_efx_fe_plantilla_docel'});
                         }
                         var generar_pdf = recordobj.getValue({fieldId: 'custbody_edoc_gen_trans_pdf'});
                         var tran_sendingmethod = recordobj.getValue({fieldId: 'custbody_psg_ei_sending_method'});
                         if(!tran_sendingmethod){
                            tran_sendingmethod = recordobj.getValue({fieldId: 'custbody_efx_fe_metodo_docel'});
                         }
                         var tran_tranid = recordobj.getValue({fieldId: 'tranid'});
                         var tran_uuid = recordobj.getValue({fieldId: 'custbody_mx_cfdi_uuid'});
                         var tran_xml = recordobj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                         var tran_pdf = recordobj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});
                     }
                 }



                 var subsidiaria = '';
                 if(!tran_uuid) {
                     try {
                         if (folderBaseSubsidiaria || folderBaseSubsidiaria == true || folderBaseSubsidiaria == 'true' || folderBaseSubsidiaria == 'T') {
                         if(SUBSIDIARIES){

                             var subsidiaria_id = recordobj.getValue({fieldId: 'subsidiary'});
                             var subsidiary_info = search.lookupFields({
                                 type: search.Type.SUBSIDIARY,
                                 id: subsidiaria_id,
                                 columns: ['name']
                             });

                             log.audit({title: 'subsidiary_info.name: ', details: subsidiary_info.name});
                             
                             subsidiaria = subsidiary_info.name;
                         }
                     }

                         //busqueda de datos del pac

                         var send_method_obj = search.lookupFields({
                             type : 'customrecord_ei_sending_method',
                             columns : ['custrecord_psg_ei_edoc_standard'],
                             id : tran_sendingmethod,
                         });
                         log.audit({title:'send_method_obj',details:send_method_obj});

                         var send_method_e_package = send_method_obj['custrecord_psg_ei_edoc_standard'][0].value;


                         var e_package_obj = search.lookupFields({
                             type : 'customrecord_psg_ei_standards',
                             columns : ['name'],
                             id : send_method_e_package,
                         });


                         var e_package_name = e_package_obj['name'];

                         log.audit({title: 'e_package_name', details: e_package_name});
                         var filtros_Array_pac = new Array();
                         filtros_Array_pac.push(['custrecord_mx_edoc_package_name', search.Operator.IS, e_package_name]);
                         filtros_Array_pac.push('and');
                         filtros_Array_pac.push(['custrecord_mx_pacinfo_enable', search.Operator.IS, 'T']);
                         if(SUBSIDIARIES){

                             var subsidiaria_id = recordobj.getValue({fieldId: 'subsidiary'});
                             filtros_Array_pac.push('and');
                             filtros_Array_pac.push(['custrecord_mx_pacinfo_subsidiary', search.Operator.ANYOF, subsidiaria_id]);
                         }

                         var search_pacinfo = search.create({
                             type: 'customrecord_mx_pac_connect_info',
                             filters: filtros_Array_pac,
                             columns: [
                                 search.createColumn({name: 'custrecord_mx_pacinfo_username'}),
                                 search.createColumn({name: 'custrecord_mx_pacinfo_url'}),
                                 search.createColumn({name: 'custrecord_mx_pacinfo_taxid'}),
                                 search.createColumn({name: 'custrecord_mx_invoice_pdf_tmpl'}),
                                 search.createColumn({name: 'custrecord_mx_cash_sale_pdf_tmpl'}),
                                 search.createColumn({name: 'custrecord_mx_credit_memo_pdf_tmpl'}),
                                 search.createColumn({name: 'custrecord_mx_item_fulfillment_pdf_tmpl'}),
                                 search.createColumn({name: 'custrecord_mx_customer_payment_pdf_tmpl'}),
                             ]
                         });

                         var ejecutar = search_pacinfo.run();
                         var resultado = ejecutar.getRange(0, 100);
                         log.audit({title: 'resultado', details: resultado});
                         var tax_id_pac = resultado[0].getValue({name: 'custrecord_mx_pacinfo_taxid'});
                         log.audit({title: 'tax_id_pac', details: tax_id_pac});
                         var user_pac = resultado[0].getValue({name: 'custrecord_mx_pacinfo_username'});
                         log.audit({title: 'user_pac', details: user_pac});
                         var url_pac = resultado[0].getValue({name: 'custrecord_mx_pacinfo_url'});
                         log.audit({title: 'url_pac', details: url_pac});
                         var template_invoice_pac = '';




                         if (tipo_transaccion == 'invoice') {
                             log.audit({title: 'resultado', details: resultado});
                             template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_invoice_pdf_tmpl'});
                             log.audit({title: 'template_invoice_pac', details: template_invoice_pac});
                         }else if(tipo_transaccion == 'cashsale'){
                             template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_cash_sale_pdf_tmpl'});
                         }else if(tipo_transaccion == 'creditmemo'){
                             template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_credit_memo_pdf_tmpl'});
                         }else if(tipo_transaccion == 'customerpayment'){
                             template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_customer_payment_pdf_tmpl'});
                         }else if(tipo_transaccion == 'itemfulfillment'){
                             template_invoice_pac = resultado[0].getValue({name: 'custrecord_mx_item_fulfillment_pdf_tmpl'});
                         }


                         //fin busqueda datos del pac
                         log.audit({title: 'generar_pdf', details: generar_pdf});

                         var id_cliente_tran = '';

                         if(tipo_transaccion != 'itemfulfillment') {
                             if (tipo_transaccion == 'customerpayment') {
                                 id_cliente_tran = recordobj.getValue({fieldId: 'customer'});
                             } else {
                                 id_cliente_tran = recordobj.getValue({fieldId: 'entity'});
                             }

                             var entityObj = '';
                             if (tipo_transaccion == 'vendbill') {
                                 entityObj = record.load({
                                     type: 'vendor',
                                     id: id_cliente_tran
                                 });
                             } else {
                                 entityObj = record.load({
                                     type: 'customer',
                                     id: id_cliente_tran
                                 });
                             }
                             var cfdiversionCustomer = entityObj.getValue({fieldId:'custentity_efx_fe_version'});
                         }else{
                             var cfdiversionCustomer = 1;
                         }

                         

                         log.audit({title: 'recordobj', details: recordobj});

                         // var recordObjrecord = recordobj.getRecord();
                         var recordObjrecord = recordobj;
                         log.audit({title: 'recordObjrecord', details: recordObjrecord});

                         var templateobj = record.load({
                             type: 'customrecord_psg_ei_template',
                             id: id_template,
                         });

                         var template = templateobj.getValue({fieldId: 'custrecord_psg_ei_template_content'});
                     } catch (obtenrecord) {
                         log.audit({title: 'obtenrecord', details: obtenrecord});
                     }
                     try {


                         /*delete recordObjrecord["sublists"].recmachcustrecord_mx_rcs_orig_trans;
                         delete recordObjrecord["sublists"].recmachcustrecord_mcp_if_r_parent;
                         delete recordObjrecord["sublists"].paymentevent;
                         delete recordObjrecord["sublists"].recmachcustrecord_efx_fe_cp_autotransporte;
                         delete recordObjrecord["sublists"].recmachcustrecord_efx_fe_cp_ubicaciones;
                         delete recordObjrecord["sublists"].recmachcustrecord_efx_fe_cp_figuratransporter;
                         delete recordObjrecord["sublists"].recmachcustrecord_mcp_if_o_parent;
                         delete recordObjrecord["sublists"].recmachcustrecord_mcp_if_frt_parent;*/
                         
                         var result = obtenercustomobject(recordObjrecord, {}, tipo_transaccion,tipo_transaccion_gbl,tipo_cp,id_transaccion);
                         log.audit({title: 'result', details: result});


                          

                          

                         var customJson = {
                             customDataSources: [
                                 {
                                     format: render.DataSource.OBJECT,
                                     alias: 'custom',
                                     data: result,
                                 },
                             ],
                         };


                         

                     } catch (error_result) {
                         log.audit({title: 'error_result', details: error_result});
                     }

                     try {
                         var plantilla = render.create();

                         if (JSON.stringify(customJson) !== "{}") {
                             var alias = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].alias : "";
                             var format = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].format : "";
                             var data = customJson.customDataSources.length > 0 ? customJson.customDataSources[0].data : "";
                             log.audit({title: 'alias', details: JSON.stringify(alias)});
                             log.audit({title: 'format', details: JSON.stringify(format)});
                             log.audit({title: 'data', details: JSON.stringify(data)});

                             

                             plantilla.addCustomDataSource({
                                 alias: alias,
                                 format: format,
                                 data: data
                             });
                         }

                         var resultDirecciones;

                         if(tipo_transaccion!='customerpayment' && tipo_transaccion!='itemfulfillment' && tipo_transaccion!='vendbill'){
                             resultDirecciones = obtenerObjetoDirecciones(recordObjrecord,entityObj);
                             log.audit({title:'resultDirecciones',details:resultDirecciones});
                             var obj_direnvst = JSON.stringify(resultDirecciones.shipaddress);
                             var obj_direnv = JSON.parse(obj_direnvst);

                             if(obj_direnv["fields"]){
                                 plantilla.addCustomDataSource({
                                     alias: 'shipaddress',
                                     format: render.DataSource.OBJECT,
                                     data: obj_direnv["fields"]
                                 });
                             }
                             var obj_dirbillst = JSON.stringify(resultDirecciones.billaddress);
                             var obj_dirbill = JSON.parse(obj_dirbillst);
                             if(obj_dirbill["fields"]){
                                 plantilla.addCustomDataSource({
                                     alias: 'billaddress',
                                     format: render.DataSource.OBJECT,
                                     data: obj_dirbill["fields"]
                                 });
                             }
                         }

                         //var recordObjrecordtext = JSON.stringify(recordObjrecord);
                         //var recordObjrecordFinal = JSON.parse(recordObjrecordtext.replace(/"#"/gi,'"linenum"'));                        
                        
                          /*   var fileresult_obj = file.create({
                                 name: 'Recordobj.json',
                                 fileType: file.Type.PLAINTEXT,
                                 contents: JSON.stringify(data),
                                 folder: 405703
                             });
                            
                            
                             fileresult_obj.save();*/

                        

                             /*plantilla.addCustomDataSource({
                                 alias: "transactiondos",
                                 format: render.DataSource.OBJECT,
                                 data: recordObjrecordFinal
                             });*/
                         
                         plantilla.templateContent = template;
                         plantilla.addRecord({
                             templateName: 'transaction',
                             record: recordObjrecord,
                         });
                         //plantilla.addRecord('transaction', recordObjrecord);
                         if(tipo_transaccion != 'itemfulfillment') {
                             //plantilla.addRecord(entityObj.type, entityObj);
                             plantilla.addRecord({
                                 templateName: entityObj.type,
                                 record: entityObj,
                             });
                             log.audit({title: 'entityObj', details: JSON.stringify(entityObj)});
                         }
                         log.audit({title: 'recordObjrecord', details: JSON.stringify(recordObjrecord)});
                         

                         content = plantilla.renderAsString();

                         var validacion = validaXml(content, templateobj);

                         //var resultSctring = JSON.stringify(result).toString();
                         var foldersubsidiaria = '';
                         if (folderBaseSubsidiaria || folderBaseSubsidiaria == true || folderBaseSubsidiaria == 'true' || folderBaseSubsidiaria == 'T') {
                             if(subsidiaria){
                                 foldersubsidiaria = createFolderSubsidiaria(folderBase,subsidiaria);
                             }
                         }

                         log.audit({title: 'foldersubsidiaria', details: JSON.stringify(foldersubsidiaria)});
                         if(foldersubsidiaria){
                             
                             var idFolder = searchFolderByDay(foldersubsidiaria);
                         }else{
                             var idFolder = searchFolderByDay(folderBase);
                         }
                         
                         
                         

                         if(tipo_cp) {

                             var fileXML = file.create({
                                 name: 'Factura' + '-' + id_transaccion +'_'+idtimbre+ '.xml',
                                 fileType: file.Type.PLAINTEXT,
                                 contents: content,
                                 folder: idFolder
                             });
                         }else{
                             var fileXML = file.create({
                                 name: 'Factura' + '-' + id_transaccion + '.xml',
                                 fileType: file.Type.PLAINTEXT,
                                 contents: content,
                                 folder: idFolder
                             });
                         }


                         fileXML.isOnline = true;

                         var fileXmlId = fileXML.save();

                         log.audit({title: 'xml', details: content});
                         var errores_xml = '';
                         if (validacion.errores.length > 0) {
                             errores_xml = '\n Errores XML: ' + validacion.errores;
                         }

                         if (fileXmlId) {
                             var mensaje_generacion = 'XML generado con el id: ' + fileXmlId + errores_xml;
                             var log_record = record.create({
                                 type: 'customrecord_psg_ei_audit_trail',
                                 isDynamic: true
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_transaction',
                                 value: id_transaccion
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_entity',
                                 value: id_cliente_tran
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_event',
                                 value: 19
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_owner',
                                 value: idPropietario
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_details',
                                 value: mensaje_generacion
                             });

                             var log_id = log_record.save({
                                 enableSourcing: true,
                                 ignoreMandatoryFields: true
                             });
                             // recordobj.setValue({fieldId: 'custbody_psg_ei_generated_edoc',
                             //     value:'<a href="' + urlVal + '">preview ' + recordobj.type + '_' + fecha_documento + '.xml</a>&nbsp;&nbsp;<a href="' + downloadUrlVal + '">download</a>'});
                         }

                         if (content) {
                             //recordobj.setValue({fieldId: 'custbody_psg_ei_content', value: content});
                             try {
                                 if(tipo_transaccion_gbl){
                                     record.submitFields({
                                         type: tipo_transaccion_gbl,
                                         id: id_transaccion,
                                         values: {
                                             custbody_psg_ei_content: content
                                         },
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }else if(tipo_transaccion_cp){
                                     // record.submitFields({
                                     //     type: tipo_transaccion_cp,
                                     //     id: id_transaccion,
                                     //     values: {
                                     //         custbody_psg_ei_content: content
                                     //     },
                                     //     options: {
                                     //         enableSourcing: false,
                                     //         ignoreMandatoryFields: true
                                     //     }
                                     // });
                                 }else{
                                     record.submitFields({
                                         type: tipo_transaccion,
                                         id: id_transaccion,
                                         values: {
                                             custbody_psg_ei_content: content
                                         },
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }

                             }catch(errorsubmitcontent){
                                 log.audit({title: 'errorsubmitcontent', details: errorsubmitcontent});
                                 if(tipo_transaccion_gbl){
                                     record.submitFields({
                                         type: tipo_transaccion_gbl,
                                         id: id_transaccion,
                                         values: {
                                             custbody_psg_ei_content: content
                                         },
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }else if(tipo_transaccion_cp){
                                     record.submitFields({
                                         type: tipo_transaccion_cp,
                                         id: id_transaccion,
                                         values: {
                                             custbody_psg_ei_content: content
                                         },
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }else{
                                     record.submitFields({
                                         type: tipo_transaccion,
                                         id: id_transaccion,
                                         values: {
                                             custbody_psg_ei_content: content
                                         },
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }

                             }
                         }
                         if (validacion.validado) {
                             // recordobj.setValue({fieldId: 'custbody_psg_ei_status', value: 19});


                             var xmlDocument_receipt = timbraDocumento(content, id_transaccion, user_pac, url_pac);

                             log.audit({title: 'xmlDocument_receipt', details: xmlDocument_receipt});
                             //ruta de la información del cfdi timbrado dentro de la respuesta del pac
                             var xpath = 'soap:Envelope//soap:Body//nlapi:TimbraCFDIResponse//nlapi:TimbraCFDIResult//nlapi:anyType';
                             var anyType = xml.XPath.select({
                                 node: xmlDocument_receipt,
                                 xpath: xpath
                             }); //se obtiene un arreglo con la informacion devuelta del pac
                             log.audit({title: 'anyType', details: anyType});

                             if(tipo_transaccion_gbl){
                                 var objRespuesta = obtenCFDIDatos(anyType, id_transaccion,tipo_transaccion_gbl,cfdiversion,cfdiversionCustomer);
                             }else{
                                 var objRespuesta = obtenCFDIDatos(anyType, id_transaccion,tipo_transaccion,cfdiversion,cfdiversionCustomer);
                             }


                             var xmlTimbrado = '';
                             var fileXmlIdTimbrado = '';

                             log.audit({title: 'objRespuesta.certData.existError', details: objRespuesta.certData.existError});
                             if (!objRespuesta.certData.existError) {
                                 log.audit({title: 't1', details: 't1'});
                                 xmlTimbrado = anyType[3].textContent;

                                 var xmlObj = xml.Parser.fromString({
                                     text: xmlTimbrado
                                 });

                                 var objPDFjson = XmlToPdf.createPDF(xmlObj.documentElement,true);
                                 try{
                                     var objPDFtext = JSON.stringify(objPDFjson);
                                     var objPDF = JSON.parse(objPDFtext.replace(/#text/gi,'texto'));
                                 }catch(errorObjpdf){
                                     log.audit({title:'errorObjpdf',details:errorObjpdf})
                                 }
                                 objRespuesta.dataXML = objPDF;
                                 log.audit({title:'objPDF',details:objPDF});

                                 var nombreXml = '';
                                 if(tipo_cp) {
                                     var fileXMLTimbrado = file.create({
                                         name: 'Traslado_timbrada' + '_' + tran_tranid +'_'+idtimbre+ '.xml',
                                         fileType: file.Type.PLAINTEXT,
                                         contents: xmlTimbrado,
                                         folder: idFolder
                                     });
                                 }else{
                                     if(tipo_transaccion_cp){
                                         var fileXMLTimbrado = file.create({
                                             name: 'Traslado_timbrada' + '_' + tran_tranid + '.xml',
                                             fileType: file.Type.PLAINTEXT,
                                             contents: xmlTimbrado,
                                             folder: idFolder
                                         });
                                     }else{
                                         if (tipo_transaccion == 'invoice') {
                                             nombreXml = 'Factura' + '_' + tran_tranid + '.xml';
                                         }else if(tipo_transaccion == 'cashsale'){
                                             nombreXml = 'VentaEfectivo' + '_' + tran_tranid + '.xml';
                                         }else if(tipo_transaccion == 'creditmemo'){
                                             nombreXml = 'NotaCredito' + '_' + tran_tranid + '.xml';
                                         }else if(tipo_transaccion == 'customerpayment'){
                                             nombreXml = 'Pago' + '_' + tran_tranid + '.xml';
                                         }else if(tipo_transaccion == 'itemfulfillment'){
                                             nombreXml = 'EjecucionPedido' + '_' + tran_tranid + '.xml';
                                         }else if(tipo_transaccion == 'customsale_efx_fe_factura_global'){
                                             nombreXml = 'Global' + '_' + tran_tranid + '.xml';
                                         }
                                         var fileXMLTimbrado = file.create({
                                             name: nombreXml,
                                             fileType: file.Type.PLAINTEXT,
                                             contents: xmlTimbrado,
                                             folder: idFolder
                                         });
                                     }
                                 }



                                 fileXMLTimbrado.isOnline = true;
                                 fileXmlIdTimbrado = fileXMLTimbrado.save();
                             }
                             log.audit({title: 't2', details: 't2'});

                             // var fileJSON = file.create({
                             //     name: 'Factura' + '-' + id_transaccion + '.json',
                             //     fileType: file.Type.PLAINTEXT,
                             //     contents: JSON.stringify(anyType),
                             //     folder: idFolder
                             // });
                             //
                             // var file_json = fileJSON.save();
                             log.audit({title: 't3', details: 't3'});

                             log.audit({title: 'objRespuesta', details: objRespuesta});

                             var pdf_tran_id = '';
                             log.audit({title: 'error', details: 'test0'});
                             //var pdf_tran = generarPDF(parseInt(id_transaccion));
                             if (!objRespuesta.certData.existError) {
                                 try {
                                     log.audit({title: 'error', details: 'test1'});
                                     if(tipo_transaccion_gbl){
                                         pdf_tran_id = generarPDFTimbrado(recordObjrecord, entityObj, objRespuesta, template_invoice_pac, tax_id_pac, tran_tranid,tipo_transaccion_gbl,result,idFolder,'','',resultDirecciones);
                                     }else{
                                         pdf_tran_id = generarPDFTimbrado(recordObjrecord, entityObj, objRespuesta, template_invoice_pac, tax_id_pac, tran_tranid,tipo_transaccion,result,idFolder,tipo_cp,idtimbre,resultDirecciones);
                                     }

                                     log.audit({title: 'error', details: 'test2'});
                                 }catch(errorpdf){
                                     log.audit({title: 'errorpdf', details: errorpdf});
                                 }
                             }
                             log.audit({title: 'pdf_tran_id', details: pdf_tran_id});


                             log.audit({title: 'objRespuesta', details: objRespuesta.certData.existError});
                             if (!objRespuesta.certData.existError) {
                                 log.audit({title: 'fileXmlIdTimbrado', details: fileXmlIdTimbrado});
                                 if (fileXmlIdTimbrado) {

                                     log.audit({title: 'fileXmlIdTimbrado', details: fileXmlIdTimbrado});

                                     if(tipo_cp){
                                         try {
                                             log.audit({title: 'record', details: 'guarda con record'});
                                             recordCp.setValue({fieldId:'custrecord_efx_fe_cp_cxml',value:fileXmlIdTimbrado});
                                             recordCp.setValue({fieldId:'custrecord_efx_fe_cp_cuuid',value:objRespuesta.certData.custbody_mx_cfdi_uuid});
                                             recordCp.setValue({fieldId:'custrecord_efx_fe_cp_cqr',value:objRespuesta.certData.custbody_mx_cfdi_qr_code});
                                             recordCp.setValue({fieldId:'custrecord_efx_fe_cp_cpdf',value:pdf_tran_id});
                                             recordCp.save({enableSourcing: true, ignoreMandatoryFields: true});
                                             // record.submitFields({
                                             //     type:'customrecord_efx_fe_cp_carta_porte',
                                             //     id:idtimbre,
                                             //     values: {
                                             //         custrecord_efx_fe_cp_cxml: fileXmlIdTimbrado,
                                             //         custrecord_efx_fe_cp_cuuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                             //         custrecord_efx_fe_cp_cqr: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                             //         custbody_edoc_generated_pdf:pdf_tran_id
                                             //     },
                                             //     options: {
                                             //         enableSourcing: true,
                                             //         ignoreMandatoryFields: true
                                             //     }
                                             // });

                                         }catch (error_guardadoXML){
                                             log.audit({title: 'error_guardadoXML', details: error_guardadoXML});
                                             record.submitFields({
                                                 type:'customrecord_efx_fe_cp_carta_porte',
                                                 id:idtimbre,
                                                 values: {
                                                     custrecord_efx_fe_cp_cxml: fileXmlIdTimbrado,
                                                     custrecord_efx_fe_cp_cuuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                     custrecord_efx_fe_cp_cqr: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                     custrecord_efx_fe_cp_cpdf:pdf_tran_id
                                                 },
                                                 options: {
                                                     enableSourcing: true,
                                                     ignoreMandatoryFields: true
                                                 }
                                             });
                                         }
                                     }else{
                                         if(tipo_transaccion_gbl){
                                             try {
                                                 record.submitFields({
                                                     type: tipo_transaccion_gbl,
                                                     id: id_transaccion,
                                                     values: {
                                                         custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                         custbody_psg_ei_status: 3,
                                                         custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                         custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                         custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                         custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                         custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                         custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                         custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                         custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                         custbody_edoc_generated_pdf:pdf_tran_id
                                                     },
                                                     options: {
                                                         enableSourcing: false,
                                                         ignoreMandatoryFields: true
                                                     }
                                                 });

                                             }catch (error_guardadoXML){
                                                 log.audit({title: 'error_guardadoXML', details: error_guardadoXML});
                                                 record.submitFields({
                                                     type: tipo_transaccion_gbl,
                                                     id: id_transaccion,
                                                     values: {
                                                         custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                         custbody_psg_ei_status: 3,
                                                         custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                         custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                         custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                         custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                         custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                         custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                         custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                         custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                         custbody_edoc_generated_pdf:pdf_tran_id
                                                     },
                                                     options: {
                                                         enableSourcing: false,
                                                         ignoreMandatoryFields: true
                                                     }
                                                 });
                                             }
                                         }else if(tipo_transaccion_cp){
                                             try {
                                                 record.submitFields({
                                                     type: tipo_transaccion_cp,
                                                     id: id_transaccion,
                                                     values: {
                                                         custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                         custbody_psg_ei_status: 3,
                                                         custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                         custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                         custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                         custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                         custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                         custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                         custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                         custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                         custbody_edoc_generated_pdf:pdf_tran_id
                                                     },
                                                     options: {
                                                         enableSourcing: false,
                                                         ignoreMandatoryFields: true
                                                     }
                                                 });

                                             }catch (error_guardadoXML){
                                                 log.audit({title: 'error_guardadoXML', details: error_guardadoXML});
                                                 record.submitFields({
                                                     type: tipo_transaccion_cp,
                                                     id: id_transaccion,
                                                     values: {
                                                         custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                         custbody_psg_ei_status: 3,
                                                         custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                         custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                         custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                         custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                         custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                         custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                         custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                         custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                         custbody_edoc_generated_pdf:pdf_tran_id
                                                     },
                                                     options: {
                                                         enableSourcing: false,
                                                         ignoreMandatoryFields: true
                                                     }
                                                 });
                                             }
                                         }else{
                                             try {
                                                 record.submitFields({
                                                     type: tipo_transaccion,
                                                     id: id_transaccion,
                                                     values: {
                                                         custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                         custbody_psg_ei_status: 3,
                                                         custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                         custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                         custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                         custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                         custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                         custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                         custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                         custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                         custbody_edoc_generated_pdf:pdf_tran_id
                                                     },
                                                     options: {
                                                         enableSourcing: false,
                                                         ignoreMandatoryFields: true
                                                     }
                                                 });

                                             }catch (error_guardadoXML){
                                                 log.audit({title: 'error_guardadoXML', details: error_guardadoXML});
                                                 record.submitFields({
                                                     type: tipo_transaccion,
                                                     id: id_transaccion,
                                                     values: {
                                                         custbody_psg_ei_certified_edoc: fileXmlIdTimbrado,
                                                         custbody_psg_ei_status: 3,
                                                         custbody_mx_cfdi_uuid: objRespuesta.certData.custbody_mx_cfdi_uuid,
                                                         custbody_mx_cfdi_certify_timestamp: objRespuesta.certData.custbody_mx_cfdi_certify_timestamp,
                                                         custbody_mx_cfdi_signature: objRespuesta.certData.custbody_mx_cfdi_signature,
                                                         custbody_mx_cfdi_sat_signature: objRespuesta.certData.custbody_mx_cfdi_sat_signature,
                                                         custbody_mx_cfdi_sat_serial: objRespuesta.certData.custbody_mx_cfdi_sat_serial,
                                                         custbody_mx_cfdi_cadena_original: objRespuesta.certData.custbody_mx_cfdi_cadena_original,
                                                         custbody_mx_cfdi_issuer_serial: objRespuesta.certData.custbody_mx_cfdi_issuer_serial,
                                                         custbody_mx_cfdi_qr_code: objRespuesta.certData.custbody_mx_cfdi_qr_code,
                                                         custbody_edoc_generated_pdf:pdf_tran_id
                                                     },
                                                     options: {
                                                         enableSourcing: false,
                                                         ignoreMandatoryFields: true
                                                     }
                                                 });
                                             }
                                         }
                                     }


                                     log.audit({title: 'fileXmlIdTimbrado', details: objRespuesta.certData.custbody_mx_cfdi_uuid});

                                     var mensaje_generacion = 'XML Timbrado con el UUID: ' + objRespuesta.certData.custbody_mx_cfdi_uuid;
                                     var log_record = record.create({
                                         type: 'customrecord_psg_ei_audit_trail',
                                         isDynamic: true
                                     });

                                     log_record.setValue({
                                         fieldId: 'custrecord_psg_ei_audit_transaction',
                                         value: id_transaccion
                                     });

                                     log_record.setValue({
                                         fieldId: 'custrecord_psg_ei_audit_entity',
                                         value: id_cliente_tran
                                     });

                                     log_record.setValue({
                                         fieldId: 'custrecord_psg_ei_audit_event',
                                         value: 3
                                     });

                                     log_record.setValue({
                                         fieldId: 'custrecord_psg_ei_audit_owner',
                                         value: idPropietario
                                     });

                                     log_record.setValue({
                                         fieldId: 'custrecord_psg_ei_audit_details',
                                         value: mensaje_generacion
                                     });

                                     var log_id = log_record.save({
                                         enableSourcing: true,
                                         ignoreMandatoryFields: true
                                     });
                                 }
                             } else {
                                 var mensaje_generacion = objRespuesta.certData.errorTitle + ': ' + objRespuesta.certData.errorDetails;
                                 var log_record = record.create({
                                     type: 'customrecord_psg_ei_audit_trail',
                                     isDynamic: true
                                 });

                                 log_record.setValue({
                                     fieldId: 'custrecord_psg_ei_audit_transaction',
                                     value: id_transaccion
                                 });

                                 log_record.setValue({
                                     fieldId: 'custrecord_psg_ei_audit_entity',
                                     value: id_cliente_tran
                                 });

                                 log_record.setValue({
                                     fieldId: 'custrecord_psg_ei_audit_event',
                                     value: 22
                                 });

                                 log_record.setValue({
                                     fieldId: 'custrecord_psg_ei_audit_owner',
                                     value: idPropietario
                                 });

                                 log_record.setValue({
                                     fieldId: 'custrecord_psg_ei_audit_details',
                                     value: mensaje_generacion
                                 });

                                 var log_id = log_record.save({
                                     enableSourcing: true,
                                     ignoreMandatoryFields: true
                                 });
                             }

                             log.audit({title: 'validacion.validado', details: validacion.validado});
                         } else {
                             //recordobj.setValue({fieldId: 'custbody_psg_ei_status', value: 1});
                             if(tipo_transaccion_gbl){
                                 try {
                                     record.submitFields({
                                         type: tipo_transaccion_gbl,
                                         id: id_transaccion,
                                         values: {custbody_psg_ei_status: '1'},
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }catch(errorsubmituno){
                                     log.audit({title: 'errorsubmituno', details: errorsubmituno});
                                     record.submitFields({
                                         type: tipo_transaccion_gbl,
                                         id: id_transaccion,
                                         values: {custbody_psg_ei_status: '1'},
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }
                             }else if(tipo_transaccion_cp){
                                 try {
                                     record.submitFields({
                                         type: tipo_transaccion_cp,
                                         id: id_transaccion,
                                         values: {custbody_psg_ei_status: '1'},
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }catch(errorsubmituno){
                                     log.audit({title: 'errorsubmituno', details: errorsubmituno});
                                     record.submitFields({
                                         type: tipo_transaccion_cp,
                                         id: id_transaccion,
                                         values: {custbody_psg_ei_status: '1'},
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }
                             }else{
                                 try {
                                     record.submitFields({
                                         type: tipo_transaccion,
                                         id: id_transaccion,
                                         values: {custbody_psg_ei_status: '1'},
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }catch(errorsubmituno){
                                     log.audit({title: 'errorsubmituno', details: errorsubmituno});
                                     record.submitFields({
                                         type: tipo_transaccion,
                                         id: id_transaccion,
                                         values: {custbody_psg_ei_status: '1'},
                                         options: {
                                             enableSourcing: false,
                                             ignoreMandatoryFields: true
                                         }
                                     });
                                 }
                             }



                             var mensaje_generacion = 'Mensaje: ' + validacion.errores;
                             var log_record = record.create({
                                 type: 'customrecord_psg_ei_audit_trail',
                                 isDynamic: true
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_transaction',
                                 value: id_transaccion
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_entity',
                                 value: id_cliente_tran
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_event',
                                 value: 5
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_owner',
                                 value: idPropietario
                             });

                             log_record.setValue({
                                 fieldId: 'custrecord_psg_ei_audit_details',
                                 value: mensaje_generacion
                             });

                             var log_id = log_record.save({
                                 enableSourcing: true,
                                 ignoreMandatoryFields: true
                             });

                         }


                         // recordobj.save({
                         //     enableSourcing: true,
                         //     ignoreMandatoryFields: true
                         // });


                         // context.response.setHeader({
                         //     name: 'Content-Disposition',
                         //     value: 'attachment; filename="' + 'xml.xml' + '"'
                         // });
                         log.audit({title: 'validacion.validado', details: validacion.validado});
                         if (validacion.validado) {

                             if (!objRespuesta.certData.existError) {
                                 respuesta.success = true;
                                 respuesta.xml_generated = fileXmlId;
                                 respuesta.xml_certified = fileXmlIdTimbrado;
                                 respuesta.pdf_generated = pdf_tran_id;
                                 respuesta.uuid = objRespuesta.certData.custbody_mx_cfdi_uuid;
                                 respuesta.tranid = id_transaccion;
                                 respuesta.trantype = tipo_transaccion;
                                 respuesta.error_details = '';
                             } else {
                                 respuesta.success = false;
                                 respuesta.xml_generated = '';
                                 respuesta.xml_certified = '';
                                 respuesta.pdf_generated = '';
                                 respuesta.tranid = id_transaccion;
                                 respuesta.trantype = tipo_transaccion;
                                 respuesta.error_details = objRespuesta.certData.errorTitle + ': ' + objRespuesta.certData.errorDetails;
                                 respuesta.error_texto = objRespuesta.certData.errorTitle;
                                 respuesta.error_objeto = objRespuesta.certData.errorDetails;
                             }

                             log.audit({title: 'JSON.stringify(respuesta)', details: JSON.stringify(respuesta)});

                             context.response.setHeader({
                                 name: "Content-Type",
                                 value: "application/json"
                             });

                             context.response.write({
                                 output: JSON.stringify(respuesta)
                             });
                         } else {
                             context.response.setHeader({
                                 name: "Content-Type",
                                 value: "application/json"
                             });

                             context.response.write({
                                 output: JSON.stringify(validacion.errores)
                             });
                         }

                     } catch (error_servicio_automatico) {
                         log.audit({title: 'error_servicio_automatico', details: error_servicio_automatico});
                         var mensaje_generacion = 'Mensaje: ' + error_servicio_automatico;
                         var log_record = record.create({
                             type: 'customrecord_psg_ei_audit_trail',
                             isDynamic: true
                         });

                         log_record.setValue({
                             fieldId: 'custrecord_psg_ei_audit_transaction',
                             value: id_transaccion
                         });

                         log_record.setValue({
                             fieldId: 'custrecord_psg_ei_audit_entity',
                             value: id_cliente_tran
                         });

                         log_record.setValue({
                             fieldId: 'custrecord_psg_ei_audit_event',
                             value: 5
                         });

                         log_record.setValue({
                             fieldId: 'custrecord_psg_ei_audit_owner',
                             value: idPropietario
                         });

                         log_record.setValue({
                             fieldId: 'custrecord_psg_ei_audit_details',
                             value: mensaje_generacion
                         });

                         var log_id = log_record.save({
                             enableSourcing: true,
                             ignoreMandatoryFields: true
                         });

                         respuesta.success = false;
                         respuesta.xml_generated = '';
                         respuesta.xml_certified = '';
                         respuesta.pdf_generated = '';
                         respuesta.tranid = id_transaccion;
                         respuesta.trantype = tipo_transaccion;
                         respuesta.error_details = error_servicio_automatico;
                         respuesta.error_texto = '';
                         respuesta.error_objeto = '';

                         context.response.setHeader({
                             name: "Content-Type",
                             value: "application/json"
                         });

                         context.response.write({
                             output: JSON.stringify(respuesta)
                         });

                     }

                 }else{

                     respuesta.success = false;
                     respuesta.xml_generated = '';
                     respuesta.xml_certified = tran_xml;
                     respuesta.pdf_generated = tran_pdf;
                     respuesta.tranid = id_transaccion;
                     respuesta.trantype = tipo_transaccion;
                     respuesta.error_details = 'Esta transaccion ya se encuentra timbrada con el UUID: '+tran_uuid;
                     respuesta.error_texto = '';
                     respuesta.error_objeto = '';

                     context.response.write({
                         output: JSON.stringify(respuesta)
                     });
                 }

             }else{

                 respuesta.success = false;
                 respuesta.xml_generated = '';
                 respuesta.xml_certified = '';
                 respuesta.pdf_generated = '';
                 respuesta.tranid = id_transaccion;
                 respuesta.trantype = tipo_transaccion;

                 if(!tipo_transaccion && id_transaccion){
                     respuesta.error_details = 'Por favor ingrese el parametro trantype en su petición.';
                     respuesta.error_texto = '';
                     respuesta.error_objeto = '';
                     context.response.write({
                         output: JSON.stringify(respuesta)
                     });
                 }

                 if(!id_transaccion && tipo_transaccion){
                     respuesta.error_details = 'Por favor ingrese el parametro tranid en su petición.';
                     respuesta.error_texto = '';
                     respuesta.error_objeto = '';
                     context.response.write({
                         output: JSON.stringify(respuesta)
                     });
                 }

                 if(!id_transaccion && !tipo_transaccion){
                     respuesta.error_details = 'Por favor ingrese los parametros tranid y trantype en su petición.';
                     respuesta.error_texto = '';
                     respuesta.error_objeto = '';
                     context.response.write({
                         output: JSON.stringify(respuesta)
                     });
                 }
             }

         }else{
                 respuesta.success = false;
                 respuesta.xml_generated = '';
                 respuesta.xml_certified = '';
                 respuesta.pdf_generated = '';
                 respuesta.tranid = id_transaccion;
                 respuesta.trantype = tipo_transaccion;
                 respuesta.error_details = 'Su cuenta se encuentra sin acceso al producto de facturación, por favor contactar con el area comercial de Tekiio.';
                 respuesta.error_texto = '';
                 respuesta.error_objeto = '';
                 context.response.write({
                     output: JSON.stringify(respuesta)
                 });

                 var mensaje_generacion = 'Mensaje: ' + respuesta.error_details;
                 var log_record = record.create({
                     type: 'customrecord_psg_ei_audit_trail',
                     isDynamic: true
                 });

                 log_record.setValue({
                     fieldId: 'custrecord_psg_ei_audit_transaction',
                     value: id_transaccion
                 });

                 log_record.setValue({
                     fieldId: 'custrecord_psg_ei_audit_entity',
                     value: id_cliente_tran
                 });

                 log_record.setValue({
                     fieldId: 'custrecord_psg_ei_audit_event',
                     value: 6
                 });

                 log_record.setValue({
                     fieldId: 'custrecord_psg_ei_audit_owner',
                     value: idPropietario
                 });

                 log_record.setValue({
                     fieldId: 'custrecord_psg_ei_audit_details',
                     value: mensaje_generacion
                 });

                 var log_id = log_record.save({
                     enableSourcing: true,
                     ignoreMandatoryFields: true
                 });
             
         }
     }

     function obtenercustomobject(recordObjrecord,recordsLoaded,tipo_transaccion,tipo_transaccion_gbl,tipo_cp,id_transaccion){

         var obj_main = {
             suiteTaxFeature: false,
             suiteTaxWithholdingTaxTypes: [],
             multiCurrencyFeature: true,
             oneWorldFeature: true,
             items: [],
             cfdiRelations: {},
             companyInfo: {
                 rfc: ""
             },
             itemIdUnitTypeMap: {},
             firstRelatedCfdiTxn: {},
             relatedCfdis: {
                 types: [],
                 cfdis: {}
             },
             billaddr: {
                 countrycode: ""
             },
             loggedUserName: "",
             summary: {
                 totalWithHoldTaxAmt: 0,
                 totalNonWithHoldTaxAmt: 0,
                 totalTaxAmt: 0,
                 discountOnTotal: 0,
                 includeTransfers: false,
                 includeWithHolding: false,
                 bodyDiscount: 0,
                 subtotal: 0,
                 subtotalExcludeLineDiscount: 0,
                 transfersTaxExemptedAmount: 0,
                 totalAmount: 0,
                 totalDiscount: 0,
                 totalTaxSum: 0,
                 totalSum: 0,
                 whTaxes: [],
                 transferTaxes: []
             },
             satcodes: {
                 items: [],
                 paymentTermInvMap: {},
                 paymentMethodInvMap: {},
                 whTaxTypes: {},
                 taxTypes: {},
                 paymentTermSatCodes: {},
                 paymentMethodCodes: {},
                 industryType: "",
                 industryTypeName: "",
                 paymentTerm: "",
                 paymentTermName: "",
                 paymentMethod: "",
                 paymentMethodName: "",
                 cfdiUsage: "",
                 cfdiUsageName: "",
                 proofType: "",
                 taxFactorTypes: {},
                 unitCodes: {}
             }
         }

         var recordObj = recordObjrecord;

         var lineCount = recordObj.getLineCount({
             sublistId: 'item',
         });
         var importeotramoneda = recordObj.getValue({
             fieldId: 'custbody_efx_fe_importe',
         });

         obj_main.multiCurrencyFeature = runtime.isFeatureInEffect({ feature: 'multicurrency' });
         obj_main.oneWorldFeature = runtime.isFeatureInEffect({ feature: 'subsidiaries' });
         obj_main.suiteTaxFeature = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
         obj_main.loggedUserName = runtime.getCurrentUser().name;
         //pendiente, probar con suitetax
         if (obj_main.suiteTaxFeature) {
             obj_main.suiteTaxWithholdingTaxTypes = libCFDI.tiposImpuestosSuiteTax();
         }

         if(tipo_transaccion!='customerpayment' && tipo_transaccion!='itemfulfillment') {
             var subRecord_bill = recordObj.getSubrecord({
                 fieldId: 'billingaddress',
             });
             obj_main.billaddr.countrycode = subRecord_bill.getValue('country');
         }

         //company info
         var registroCompania;
         if (obj_main.suiteTaxFeature && obj_main.oneWorldFeature) {
             registroCompania = record.load({
                 type : record.Type.SUBSIDIARY,
                 id : recordObj.getValue('subsidiary'),
             });
             var lineCount = registroCompania.getLineCount({
                 sublistId : 'taxregistration',
             });

             var pais = '';
             for (var i=0; i<lineCount; i++) {
                 pais = registroCompania.getSublistValue({
                     sublistId: 'taxregistration',
                     fieldId : 'nexuscountry',
                     line : i,
                 });
                 if (pais === 'MX') {
                     obj_main.companyInfo.rfc = registroCompania.getSublistValue({
                         sublistId: 'taxregistration',
                         fieldId: 'taxregistrationnumber',
                         line : i,
                     });
                     break;
                 }
             }
         } else if (obj_main.suiteTaxFeature) {
             registroCompania = config.load({
                 type : config.Type.COMPANY_INFORMATION,
             });

             var lineCount = registroCompania.getLineCount({
                 sublistId : 'taxregistration',
             });
             var pais = '';
             for (var i=0; i<lineCount; i++) {
                 pais = registroCompania.getSublistValue({
                     sublistId: 'taxregistration',
                     fieldId : 'nexuscountry',
                     line : i,
                 });
                 if (pais === 'MX') {
                     obj_main.companyInfo.rfc = registroCompania.getSublistValue({
                         sublistId: 'taxregistration',
                         fieldId: 'taxregistrationnumber',
                         line : i,
                     });
                     break;
                 }
             }
         } else if (obj_main.oneWorldFeature) {
             registroCompania = record.load({
                 type : record.Type.SUBSIDIARY,
                 id : recordObj.getValue('subsidiary'),
             });
             obj_main.companyInfo.rfc = registroCompania.getValue('federalidnumber');
         } else {
             registroCompania = config.load({
                 type : config.Type.COMPANY_INFORMATION,
             });
             obj_main.companyInfo.rfc = registroCompania.getValue('employerid');
         }

         if (registroCompania) {
             var idIndustria = registroCompania.getValue('custrecord_mx_sat_industry_type');
             var campos = search.lookupFields({
                 id: idIndustria,
                 type: 'customrecord_mx_sat_industry_type',
                 columns: ['custrecord_mx_sat_it_code', 'name'],
             });

             var objIdT = {
                 code: campos['custrecord_mx_sat_it_code'],
                 name: campos.name,
             };
             obj_main.satcodes.industryType =  objIdT.code;
             obj_main.satcodes.industryTypeName = objIdT.name;
         }


         //inicia cfdirelationtypeinfo

         var lineCount = recordObj.getLineCount({
             sublistId:'recmachcustrecord_mx_rcs_orig_trans',
         });

         var relacionCFDI = {};
         var internalId = '';
         var tipoRelacion = '';
         var textoRelT = '';
         var primerRelacionadoCFDI = '';
         var arrayTiporelacionId = new Array();
         var arrayTiporelacionData = new Array();

         for (var p = 0; p < lineCount; p++) {

             var idOriginTran = recordObj.getSublistValue({
                 sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                 fieldId: 'custrecord_mx_rcs_rel_type',
                 line: p,
             });
             arrayTiporelacionId.push(idOriginTran);
         }

         log.audit({title:'arrayTiporelacionId',details:arrayTiporelacionId});

         if(arrayTiporelacionId.length > 0){
             var tipodeRelacionSearch = search.create({
                 type: 'customrecord_mx_sat_rel_type',
                 filters: [['internalid',search.Operator.ANYOF,arrayTiporelacionId]],
                 columns: [
                     search.createColumn({name:'internalid'}),
                     search.createColumn({name:'custrecord_mx_sat_rel_type_code'}),
                 ]
             });
             tipodeRelacionSearch.run().each(function (result){
                 var obj_trelacion = {
                     id:'',
                     tiporelacion:''
                 }
                 obj_trelacion.id = result.getValue({name: 'internalid'});
                 obj_trelacion.tiporelacion = result.getValue({name:'custrecord_mx_sat_rel_type_code'});
                 log.audit({title:'obj_trelacion',details:obj_trelacion});
                 arrayTiporelacionData.push(obj_trelacion);
                 return true;
             });

         }
         log.audit({title:'arrayTiporelacionData',details:arrayTiporelacionData});

         for (var p = 0; p < lineCount; p++) {
             internalId = recordObj.getSublistValue({
                 sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                 fieldId: 'custrecord_mx_rcs_rel_cfdi',
                 line: p,
             })+'';
             if (p==0) {
                 primerRelacionadoCFDI = internalId;
             }
             var idOriginTran = recordObj.getSublistValue({
                 sublistId: 'recmachcustrecord_mx_rcs_orig_trans',
                 fieldId: 'custrecord_mx_rcs_rel_type',
                 line: p,
             });

             if(idOriginTran){
                 for(var tr = 0;tr<arrayTiporelacionData.length;tr++){
                     if(arrayTiporelacionData[tr].id==idOriginTran){
                         tipoRelacion = arrayTiporelacionData[tr].tiporelacion;
                     }
                 }
             }

             textoRelT = relacionCFDI[tipoRelacion];
             if (!textoRelT) {
                 obj_main.relatedCfdis.types.push(tipoRelacion);
                 obj_main.relatedCfdis.cfdis['k'+(obj_main.relatedCfdis.types.length-1)] = [{index : p}];
                 relacionCFDI[tipoRelacion] = obj_main.relatedCfdis.types.length;
             } else {
                 obj_main.relatedCfdis.cfdis['k'+(textoRelT-1)].push({index: p});
             }
         }
         var esCreditMemo = recordObj.type;

         if (esCreditMemo=='creditmemo' && primerRelacionadoCFDI) {
             var primerCFDIRelacionado = search.lookupFields({
                 type : 'transaction',
                 columns : ['custbody_mx_txn_sat_payment_method'],
                 id : primerRelacionadoCFDI,
             });
             var paymentMethod = primerCFDIRelacionado['custbody_mx_txn_sat_payment_method'];
             if (paymentMethod && paymentMethod[0]) {
                 obj_main.firstRelatedCfdiTxn.paymentMethodId = paymentMethod[0].value;
             }
         }

         var descuentototal = recordObj.getValue('discounttotal');

         if(descuentototal){
             obj_main.summary.bodyDiscount = Math.abs(descuentototal);
         }else{
             obj_main.summary.bodyDiscount = 0.0;
         }

         log.audit({title:'objmain3',details:obj_main});

         var paymentTerm = recordObj.getValue('custbody_mx_txn_sat_payment_term');
         var paymentMethod = recordObj.getValue('custbody_mx_txn_sat_payment_method');

         var cfdiUsage = recordObj.getValue('custbody_mx_cfdi_usage');


         if (esCreditMemo=='creditmemo') {
             //var objPaymentMet = libCFDI.obtenMetodoPago(obj_main.firstRelatedCfdiTxn.paymentMethodId);
             var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod);
             if(objPaymentMet){
                 obj_main.satcodes.paymentMethod = objPaymentMet.code;
                 obj_main.satcodes.paymentMethodName = objPaymentMet.name;
             }
             obj_main.satcodes.paymentTerm = 'PUE';
             obj_main.satcodes.paymentTermName = 'PUE - Pago en una Sola Exhibición';
         } else {
             var objPaymentMet = libCFDI.obtenMetodoPago(paymentMethod);
             var objPaymentFor = libCFDI.obtenFormaPago(paymentTerm);
             if(objPaymentMet){
                 obj_main.satcodes.paymentMethod = objPaymentMet.code;
                 obj_main.satcodes.paymentMethodName = objPaymentMet.name;
             }
             if(objPaymentFor){
                 obj_main.satcodes.paymentTerm = objPaymentFor.code;
                 obj_main.satcodes.paymentTermName = objPaymentFor.name;
             }
         }

         var objUsoCfdi = libCFDI.obtenUsoCfdi(cfdiUsage);
         if(objUsoCfdi){
             obj_main.satcodes.cfdiUsage = objUsoCfdi.code;
             obj_main.satcodes.cfdiUsageName = objUsoCfdi.name;
         }
         obj_main.satcodes.proofType = libCFDI.tipoCFDI(recordObj.type);

         var lineCount = recordObj.getLineCount({
             sublistId: 'item',
         });

         obj_main = libCFDI.libreriaArticulos(obj_main,recordObj,lineCount,tipo_transaccion_gbl);
         var articulosId = [];
         obj_main.items.map(function (articuloMap) {
             articulosId.push(articuloMap.itemId);
             articuloMap.parts.map(function (partes) {
                 articulosId.push(partes.itemId);
             });
         });
         if(tipo_transaccion!='customerpayment') {
             var tipodeUnidad = search.create({
                 type: 'item',
                 filters: [['internalid', 'anyof', articulosId]],
                 columns: ['unitstype'],
             });

             tipodeUnidad.run().each(function (result) {
                 var unittypemap = result.getValue('unitstype');

                     obj_main.itemIdUnitTypeMap['k' + result.id] = result.getValue('unitstype');

                 return true;
             });
         }

         //attatchsatmapping

         // var satCodesDao = obj_main.satCodesDao;
         var clavesdeUnidad = {};

         function detallesDeImpuesto (articulo) {
             tieneItemParte(articulo);
             if(tipo_transaccion=='creditmemo' && articulo.custcol_efx_fe_gbl_originunits){
                 clavesdeUnidad[articulo.custcol_efx_fe_gbl_originunits] = true;
             }else{
                 clavesdeUnidad[articulo.units] = true;
             }
             // articulo.taxes.taxItems.map(function (taxLine) {
             //     satCodesDao.pushForLineSatTaxCode(taxLine.taxType);
             //     satCodesDao.pushForLineSatTaxFactorType(taxLine.taxCode);
             //
             // });
             // articulo.taxes.whTaxItems.map(function (taxLine) {
             //     satCodesDao.pushForLineSatTaxCode(taxLine.taxType,true);
             // });
         }

         function tieneItemParte (articulo) {
             if (articulo.parts) {
                 articulo.parts.map(function (parte) {
                     detallesDeImpuesto(parte);
                 });
             }
         }

         function codigosSatArticulos (items,codigosSat,idUnidades) {
             if (!items) {
                 return;
             }
             var objCodes;
             items.map(function (articulos) {
                 codigosSatArticulos(articulos.parts,codigosSat,idUnidades);
                 log.audit({title:'idUnidades',details:idUnidades});
                 log.audit({title:'articulos.itemId',details:articulos.itemId});
                 log.audit({title:'articulos.units',details:articulos.units});
                 if(tipo_transaccion=='creditmemo' && articulos.custcol_efx_fe_gbl_originunits){
                     objCodes = codigosSat.unitCodes['k'+idUnidades['k'+articulos.itemId]+'_'+articulos.custcol_efx_fe_gbl_originunits];
                 }else{
                     objCodes = codigosSat.unitCodes['k'+idUnidades['k'+articulos.itemId]+'_'+articulos.units];
                 }

                 articulos.satUnitCode = objCodes?objCodes.code:'';
                 articulos.taxes.taxItems.map(function (lineaImpuesto) {
                     if (obj_main.suiteTaxFeature) {
                         objCodes = codigosSat.taxFactorTypes[lineaImpuesto.satTaxCodeKey];
                         lineaImpuesto.taxFactorType = objCodes?objCodes.code:'';
                     } else {
                         lineaImpuesto.taxFactorType = lineaImpuesto.exempt? 'Exento' : 'Tasa';
                     }

                     objCodes = codigosSat.taxTypes['k'+lineaImpuesto.taxType];
                     lineaImpuesto.satTaxCode = objCodes?objCodes.code:'';
                 });
                 articulos.taxes.whTaxItems.map(function (lineaImpuesto) {
                     lineaImpuesto.taxFactorType = 'Tasa';
                     objCodes = codigosSat.whTaxTypes['k'+lineaImpuesto.taxType];
                     lineaImpuesto.satTaxCode = objCodes?objCodes.code:'';
                 });
             });
         }

         function obtieneUnidadesMedidaSAT(idUnidades){
             log.audit('idUnidades',idUnidades);
             var filtrosArray = new Array();
             var buscaUnidades = search.load({
                 id: 'customsearch_mx_mapping_search',
             });
             filtrosArray.push(['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[0]]);
             for (var i = 1; i < idUnidades.length; i++) {
                 filtrosArray.push('OR', ['custrecord_mx_mapper_keyvalue_subkey', 'is', idUnidades[i]]);
             }
             log.audit('filtrosArray',filtrosArray);
             if (filtrosArray.length === 0) {
                 return {};
             }

             buscaUnidades.filterExpression = [
                 [
                     'custrecord_mx_mapper_keyvalue_category.scriptid',
                     'is',
                     ['sat_unit_code'],
                 ],
                 'and',
                 ['custrecord_mx_mapper_keyvalue_rectype', 'is', ['unitstype']],
                 'and',
                 ['custrecord_mx_mapper_keyvalue_subrectype', 'is', ['uom']],
                 'and',
                 [filtrosArray],
             ];
             log.audit('buscaUnidades',buscaUnidades);
             var ejecuta = buscaUnidades.run()

             log.audit('ejecuta',ejecuta);

             var data = {};
             ejecuta.each(function (mapping) {
                 var detalle = {};
                 detalle.code = mapping.getValue({
                     name: 'custrecord_mx_mapper_value_inreport',
                     join: 'custrecord_mx_mapper_keyvalue_value',
                 });
                 detalle.name = mapping.getValue({
                     name: 'name',
                     join: 'custrecord_mx_mapper_keyvalue_value',
                 });
                 var key = mapping.getValue({
                     name: 'custrecord_mx_mapper_keyvalue_key',
                 });
                 var subkey = mapping.getValue({
                     name: 'custrecord_mx_mapper_keyvalue_subkey',
                 });
                 var claveid = 'k'+key;
                 if (subkey) {
                     claveid = claveid + '_' + subkey;
                 }
                 data[claveid] = detalle;
                 log.audit('data',data);
                 return true;
             });

             log.audit('data',data);
             return data;


         }

         log.debug('obj_main preitems :', obj_main);
         obj_main.items.map(function (articulo) {
             detallesDeImpuesto(articulo);
         });

         // satCodesDao.fetchSatTaxFactorTypeForAllPushed();
         // satCodesDao.fetchSatTaxCodesForAllPushed();
         //satCodesDao.fetchSatUnitCodesForAllPushed();
         if(tipo_transaccion!='customerpayment') {
             obj_main.satcodes.unitCodes = obtieneUnidadesMedidaSAT(Object.keys(clavesdeUnidad));

             log.debug('obj_main result :', obj_main);
             codigosSatArticulos(obj_main.items, obj_main.satcodes, obj_main.itemIdUnitTypeMap);

         }
         //fin attachmaping

         obj_main.summary = libCFDI.summaryData(obj_main);
         // this._attachSatMappingData(result);
         //new summaryCalc.TransactionSummary().summarize(obj_main);


         //result.satcodes = satCodesDao.getJson();
         //crear relacionado en el pago
         if(tipo_transaccion=='customerpayment') {
             // var payment = pagodata.obtenerDatos(recordObj, obj_main, obj_main.satCodesDao);
             // log.debug('payment: ',JSON.stringify(payment));
             obj_main.appliedTxns = libCFDI.pagoData(recordObj, obj_main,'apply',id_transaccion,importeotramoneda);
             log.debug('result.appliedTxns: ',JSON.stringify(obj_main.appliedTxns));
         }

         //
         obj_main.satCodesDao = null;
         log.debug('Custom Datasource result: ',JSON.stringify(obj_main));

         return obj_main;
     }

     function generarPDFTimbrado(recordObjrecord,entityObj,objRespuesta,template_invoice_pac,tax_id_pac,tran_tranid,tipo_transaccion,result,idFolder,tipo_cp,idtimbre,resultDirecciones){
         log.audit({title:'objRespuesta.dataXML',details:objRespuesta.dataXML});
         var scriptObj = runtime.getCurrentScript();


         var renderer = render.create();
         var txnRecord = recordObjrecord;
         var oldPdfFileId = txnRecord.getValue({fieldId: 'custbody_edoc_generated_pdf'});

         var pdfTemplateScriptId = template_invoice_pac;
         renderer.setTemplateById({
             id: pdfTemplateScriptId,
         });
         renderer.addRecord({
             templateName: 'record',
             record: txnRecord,
         });

         if (entityObj) {
             renderer.addRecord({
                 templateName: entityObj.type,
                 record: entityObj,
             });
         }



         var customData = objRespuesta;
         //buscar en el record de Mexico Pac el TAX ID
         customData.pacRfc = tax_id_pac;
         for (var property in result){
             customData[property] = result[property];
         }
         var datasource = {
             format: render.DataSource.OBJECT,
             alias: 'custom',
             data: customData,
         };


         /* var fileresult = file.create({
              name: 'Results.json',
              fileType: file.Type.PLAINTEXT,
              contents: JSON.stringify(datasource),
              folder: idFolder
          });
          fileresult.save();*/

         renderer.addCustomDataSource(datasource);

         if(tipo_transaccion!='customerpayment' && tipo_transaccion!='itemfulfillment' && tipo_transaccion!='vendbill'){
             var obj_direnvst = JSON.stringify(resultDirecciones.shipaddress);
             var obj_direnv = JSON.parse(obj_direnvst);

             if(obj_direnv["fields"]){
                 renderer.addCustomDataSource({
                     alias: 'shipaddress',
                     format: render.DataSource.OBJECT,
                     data: obj_direnv["fields"]
                 });
             }
             var obj_dirbillst = JSON.stringify(resultDirecciones.billaddress);
             var obj_dirbill = JSON.parse(obj_dirbillst);
             if(obj_dirbill["fields"]){
                 renderer.addCustomDataSource({
                     alias: 'billaddress',
                     format: render.DataSource.OBJECT,
                     data: obj_dirbill["fields"]
                 });
             }
         }

         var pdfFileOutput;
         var pdfFileId;

         pdfFileOutput = renderer.renderAsPdf();
         if(tipo_cp) {
             if (tipo_transaccion == 'invoice') {
                 pdfFileOutput.name = 'Factura_' + tran_tranid +'_'+idtimbre+ '.pdf';
             }else if(tipo_transaccion == 'cashsale'){
                 pdfFileOutput.name = 'VentaEfectivo_' + tran_tranid + '_'+idtimbre+ '.pdf';
             }else if(tipo_transaccion == 'creditmemo'){
                 pdfFileOutput.name = 'NotaCredito_' + tran_tranid + '_'+idtimbre+ '.pdf';
             }else if(tipo_transaccion == 'customerpayment'){
                 pdfFileOutput.name = 'Pago_' + tran_tranid + '_'+idtimbre+ '.pdf';
             }else if(tipo_transaccion == 'itemfulfillment'){
                 pdfFileOutput.name = 'EjecucionPedido_' + tran_tranid + '_'+idtimbre+ '.pdf';
             }else if(tipo_transaccion == 'customsale_efx_fe_factura_global'){
                 pdfFileOutput.name = 'Global_' + tran_tranid + '_'+idtimbre+ '.pdf';
             }
         }else{
             if (tipo_transaccion == 'invoice') {
                 pdfFileOutput.name = 'Factura_' + tran_tranid + '.pdf';
             }else if(tipo_transaccion == 'cashsale'){
                 pdfFileOutput.name = 'VentaEfectivo_' + tran_tranid + '.pdf';
             }else if(tipo_transaccion == 'creditmemo'){
                 pdfFileOutput.name = 'NotaCredito_' + tran_tranid + '.pdf';
             }else if(tipo_transaccion == 'customerpayment'){
                 pdfFileOutput.name = 'Pago_' + tran_tranid + '.pdf';
             }else if(tipo_transaccion == 'itemfulfillment'){
                 pdfFileOutput.name = 'EjecucionPedido_' + tran_tranid + '.pdf';
             }else if(tipo_transaccion == 'customsale_efx_fe_factura_global'){
                 pdfFileOutput.name = 'Global_' + tran_tranid + '.pdf';
             }
         }

         pdfFileOutput.folder = idFolder;
         pdfFileOutput.isOnline = true;
         var pdfFileId = pdfFileOutput.save();
         return pdfFileId;
     }

     function validaXml(content,templateobj){
         var validacionobj = {
             validado: true,
             errores:[],
         };
         var valido = true;

         try {
             log.audit({title:'templateobj',details:templateobj});
             var contentType = templateobj.getValue({fieldId: 'custrecord_psg_file_content_type'});
             log.audit({title:'contenttype',details:contentType});


             if (contentType == 1) {
                 var validatorcount = templateobj.getLineCount({sublistId:'recmachcustrecord_psg_ei_temp_validator_parent'})
                 log.audit({title:'validatorcount',details:validatorcount});

                 var xpath;
                 var regex;
                 var nodes;
                 var failures = [];
                 var validator;
                 log.audit({title:'content',details:content});
                 // var xmldocumento = xml.Parser.toString({
                 //     document : content
                 // });
                 // log.audit({title:'xmldocumento',details:xmldocumento});
                 var eInvoice = xml.Parser.fromString({
                     text : content
                 });

                 /*** XSD validation ***/
                 log.audit({title:'eInvoice',details:eInvoice});
                 var xsdFileId = templateobj.getValue({fieldId: 'custrecord_edoc_template_outbound_xsd'});
                 var xsdImportFolder = templateobj.getValue({fieldId: 'custrecord_edoc_template_xsd_folder'});

                 if (xsdFileId) {
                     try {
                         xml.validate({
                             xml: eInvoice,
                             xsdFilePathOrId: xsdFileId,
                             importFolderPathOrId: xsdImportFolder
                         });
                     } catch (e) {
                         log.error(e.name, e.message);
                         var errorMessage = e;
                     }
                 }

                 /*** Regex Validation ***/
                 log.audit({title:'validatorcount',details:validatorcount});
                 for (var i=0;i<validatorcount; i++) {
                     xpath = templateobj.getSublistValue({
                         sublistId:'recmachcustrecord_psg_ei_temp_validator_parent',
                         fieldId: 'custrecord_psg_ei_temp_validator_xpath',
                         line: i

                     });
                     regex = templateobj.getSublistValue({
                         sublistId:'recmachcustrecord_psg_ei_temp_validator_parent',
                         fieldId: 'custrecord_psg_ei_temp_validator_regex',
                         line: i

                     });
                     nodes = xml.XPath.select({
                         node: eInvoice,
                         xpath: xpath
                     });

                     log.audit({title:'nodes',details:nodes});


                     if (nodes.length === 0) {
                         failures.push([xpath, regex, "No existe el nodo"].join(" | "));
                     }

                     var node;
                     for (var j=0;j<nodes.length;j++) {
                         node = nodes[j];

                         var childNodes = xml.XPath.select({
                             node: node,
                             xpath: "node()"
                         });
                         log.audit({title:'childNodes',details:childNodes});

                         var childNode;
                         var value = "";
                         for ( var k = 0; k < childNodes.length; k++) {
                             childNode = childNodes[k];
                             if (childNode.nodeType === 'TEXT_NODE') {
                                 value = childNode.nodeValue || "";
                                 break;
                             }
                         }

                         var isMatched = isRegexMatched(value, regex);

                         if (!isMatched) {
                             failures.push([xpath, regex, value].join(" | "));
                         }
                     }
                 }
                 log.audit({title:'failures',details:failures});
                 if (failures.length > 0) {
                     var failureString = ["XPath | Regular Expression | Value\n", failures.join("\n")].join("");
                     var errorMessage = [failureString].join("");
                     valido = false;
                 }

             }
         } catch (e) {
             log.audit({title:'e',details:e});
         }

         log.audit({title:'valido',details:valido});
         validacionobj.validado = valido;
         validacionobj.errores = failures;
         return validacionobj;
     }

     function isRegexMatched(value, regex){
         log.audit({title:'value',details:value});
         var isMatched = true;
         var pattern;
         var modifier = regex.split("/")[regex.split("/").length -1];
         log.audit({title:'modifier',details:modifier});

         if(modifier){
             var lastIndex = regex.lastIndexOf("/");
             log.audit({title:'lastIndex',details:lastIndex});
             pattern = regex.substring(0, lastIndex+1); //retrieving something like "/[a-z]/"
             log.audit({title:'pattern1',details:pattern});
             pattern = formatRegexPattern(pattern);
             log.audit({title:'pattern',details:pattern});
         }else{
             pattern = formatRegexPattern(regex);
             log.audit({title:'pattern',details:pattern});
         }

         var matches = value.match(new RegExp(pattern, modifier)) || [];
         log.audit({title:'matches',details:matches});

         if(matches.length === 0){
             isMatched = false;
         }

         return isMatched;
     }

     function formatRegexPattern(pattern){
         var firstChar = pattern.charAt(0);
         var lastChar = pattern.charAt(pattern.length - 1);

         if(firstChar === "/" && lastChar === "/"){
             pattern = pattern.substring(1, pattern.length - 1);
         }

         return pattern;
     }

     function timbraDocumento(xmlDocument,id,user_pac,url_pac) {
         var xmlStrX64 = encode.convert({
             string: xmlDocument,
             inputEncoding: encode.Encoding.UTF_8,
             outputEncoding: encode.Encoding.BASE_64
         }); // se convierte el xml en base 64 para mandarlo al pac

         log.audit({title:'xmlStrX64',details:xmlStrX64});
         //Estructura xml soap para enviar la peticion de timbrado al pac
         var xmlSend = '';
         xmlSend += '<?xml version="1.0" encoding="utf-8"?>';
         xmlSend += '<soap:Envelope ';
         xmlSend += '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ';
         xmlSend += '    xmlns:xsd="http://www.w3.org/2001/XMLSchema" ';
         xmlSend += '    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">';
         xmlSend += '    <soap:Body>';
         xmlSend += '        <TimbraCFDI ';
         xmlSend += '            xmlns="http://tempuri.org/">';
         xmlSend += '            <usuarioIntegrador>' + user_pac + '</usuarioIntegrador>';
         xmlSend += '            <xmlComprobanteBase64>' + xmlStrX64 + '</xmlComprobanteBase64>';
         xmlSend += '            <idComprobante>' + 'Factura'+id + '</idComprobante>';
         xmlSend += '        </TimbraCFDI>';
         xmlSend += '    </soap:Body>';
         xmlSend += '</soap:Envelope>';

         log.audit({title:'xmlSend',details:xmlSend});

         //creacion de la peticion post para envio soap
         var headers = {
             'Content-Type': 'text/xml'
         };

         //url del web service del pack de facturacion
         var url_pruebas = url_pac;

         var fecha_envio = new Date();
         log.audit({title:'fecha_envio',details:fecha_envio});

         var response = https.post({
             url: url_pruebas,
             headers: headers,
             body: xmlSend
         });

         log.emergency({title: 'response', details: JSON.stringify(response)});
         var fecha_recibe = new Date();
         log.audit({title:'fecha_recibe',details:fecha_recibe});
         log.audit({title: 'response.body', details: JSON.stringify(response.body)});

         var responseBody = response.body;
         log.audit({ title: 'getBody', details: responseBody });

         //parseo de la respuesta del pac
         var xmlDocument_receipt = xml.Parser.fromString({
             text: response.body
         });

         return xmlDocument_receipt;
     }

     function obtenCFDIDatos(anyType,id_transaccion,tipo_transaccion,cfdiversion,cfdiversionCustomer){
         var uuid_ObtieneCFDI = '';
         var cfdi_relResSat = [];
         var errorTitle = '';
         var errorDetails = '';
         var cadenaOriginal = '';
         var xmlSatTEXT = '';
         var infoUUID = '';
         var infoSelloCFD = '';
         var infoSelloSAT = '';
         var noCertificadoSAT = '';
         var noCertificadoContribuyenteResSat = '';
         var FolioResSat = '';
         var LugarExpedicionResSat = '';
         var Serie = ''
         var infoFechaTimbradoResSat = '';
         var existError = false;
         var xml_ObtieneCFDI = '';

         //Se obtiene el status del contenido, si es 0 fue satisfactorio el timbrado, si es 25 el uuid ya existia
         if (parseInt(anyType[1].textContent, 10) == 0) {//0 Response Successfully
             if (anyType[3].textContent != '') {
                 cadenaOriginal = anyType[5].textContent;
                 //se obtiene el xml timbrado
                 xmlSatTEXT = anyType[3].textContent;
                 xmlSat = xml.Parser.fromString({ text: xmlSatTEXT });

                 //Se obtienen las turas de los atributos del xml timbrado
                 var TimbreFiscalDigital = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante//cfdi:Complemento//tfd:TimbreFiscalDigital' });

                 infoUUID = TimbreFiscalDigital[0].getAttributeNode({ name: 'UUID' });

                 infoSelloCFD = TimbreFiscalDigital[0].getAttributeNode({ name: 'SelloCFD' });

                 infoSelloSAT = TimbreFiscalDigital[0].getAttributeNode({ name: 'SelloSAT' });

                 infoFechaTimbradoResSat = TimbreFiscalDigital[0].getAttributeNode({ name: 'FechaTimbrado' });

                 noCertificadoSAT = TimbreFiscalDigital[0].getAttributeNode({ name: 'NoCertificadoSAT' });

                 var nodosSuperior = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante' });

                 noCertificadoContribuyenteResSat = nodosSuperior[0].getAttributeNode({ name: 'NoCertificado' });

                 LugarExpedicionResSat = nodosSuperior[0].getAttributeNode({ name: 'LugarExpedicion' });

                 Serie = nodosSuperior[0].getAttributeNode({ name: 'Serie' });

                 FolioResSat = nodosSuperior[0].getAttributeNode({ name: 'Folio' });

                 if (tipo_transaccion == 'customerpayment') {
                     if(cfdiversionCustomer==1){
                         var nodosCfdiRelacionado = xml.XPath.select({
                             node: xmlSat,
                             xpath: 'cfdi:Comprobante//cfdi:Complemento//pago10:Pagos//pago10:Pago//pago10:DoctoRelacionado'
                         });
                     }else if(cfdiversionCustomer==2){
                         var nodosCfdiRelacionado = xml.XPath.select({
                             node: xmlSat,
                             xpath: 'cfdi:Comprobante//cfdi:Complemento//pago20:Pagos//pago20:Pago//pago20:DoctoRelacionado'
                         });
                     }else{
                         if(cfdiversion==1){
                             var nodosCfdiRelacionado = xml.XPath.select({
                                 node: xmlSat,
                                 xpath: 'cfdi:Comprobante//cfdi:Complemento//pago10:Pagos//pago10:Pago//pago10:DoctoRelacionado'
                             });
                         }else if(cfdiversion==2 || cfdiversion==''){
                             var nodosCfdiRelacionado = xml.XPath.select({
                                 node: xmlSat,
                                 xpath: 'cfdi:Comprobante//cfdi:Complemento//pago20:Pagos//pago20:Pago//pago20:DoctoRelacionado'
                             });
                         }
                     }
                     
                 
                     for (var node = 0; node < nodosCfdiRelacionado.length; node++) {
                         var uuidEncontrado = nodosCfdiRelacionado[0].getAttributeNode({
                             name: 'IdDocumento'
                         });
                         if (uuidEncontrado.value) {
                             cfdi_relResSat.push(uuidEncontrado.value)
                         }
                     }
                 }else{
                     var nodosCfdiRelacionado = xml.XPath.select({
                         node: xmlSat,
                         xpath: 'cfdi:Comprobante//cfdi:CfdiRelacionados//cfdi:CfdiRelacionado'
                     });

                     for (var node = 0; node < nodosCfdiRelacionado.length; node++) {
                         var uuidEncontrado = nodosCfdiRelacionado[0].getAttributeNode({
                             name: 'UUID'
                         });
                         if (uuidEncontrado.value) {
                             cfdi_relResSat.push(uuidEncontrado.value)
                         }
                     }
                 }

             }
             else {
                 existError = true;
                 errorTitle = anyType[7].textContent;
                 errorDetails = anyType[2].textContent + ' /n ' + anyType[8].textContent;
             }

             // var ochoSat = '';
             //
             // ochoSat = infoSelloCFD.value.substring((infoSelloCFD.value.length - 8), infoSelloCFD.value.length);
         }else {
             existError = true;
             errorTitle = anyType[7].textContent;
             errorDetails = anyType[2].textContent + ' /n ' + anyType[8].textContent+ ' /n ' + anyType[3].textContent;
         }

         //esta condicion es en caso de que el comprobante ya se encuentre timbrado, busca la info del cfdi en el sat
         //se debe pasar como parametro el rfx emisor si se quiere usar

         // if (parseInt(anyType[1].textContent, 10) == 25) {
         //     uuid_ObtieneCFDI = anyType[7].textContent.substring(40);
         //
         //     var headers_ObtieneCFDI = {
         //         'SOAPAction': 'http://tempuri.org/ObtieneCFDI',
         //         'Content-Type': 'text/xml'
         //     };
         //
         //     xml_ObtieneCFDI += '<?xml version="1.0" encoding="utf-8"?>';
         //     xml_ObtieneCFDI += '<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">';
         //     xml_ObtieneCFDI += '<soap12:Body>';
         //     xml_ObtieneCFDI += '    <ObtieneCFDI xmlns="http://tempuri.org/">';
         //     xml_ObtieneCFDI += '    <usuarioIntegrador>' + 'mvpNUXmQfK8=' + '</usuarioIntegrador>';
         //     xml_ObtieneCFDI += '    <rfcEmisor>' + rfc_emisor + '</rfcEmisor>';
         //     xml_ObtieneCFDI += '    <folioUUID>' + uuid_ObtieneCFDI + '</folioUUID>';
         //     xml_ObtieneCFDI += '    </ObtieneCFDI>';
         //     xml_ObtieneCFDI += '</soap12:Body>';
         //     xml_ObtieneCFDI += '</soap12:Envelope>';
         //
         //     var url_pruebas = 'http://cfdi33-pruebas.buzoncfdi.mx/Timbrado.asmx';
         //
         //     var response = http.post({
         //         url: url_pruebas,
         //         headers: headers_ObtieneCFDI,
         //         body: xml_ObtieneCFDI
         //     });
         //     log.emergency({ title: 'response *** ', details: JSON.stringify(response.body) });
         //
         //     var responseBody = response.body;
         //     log.audit({ title: 'getBody', details: responseBody });
         //
         //     var xmlDocument = xml.Parser.fromString({
         //         text: responseBody
         //     });
         //
         //     var xpath = 'soap:Envelope//soap:Body//nlapi:ObtieneCFDIResponse//nlapi:ObtieneCFDIResult//nlapi:anyType';
         //
         //     var anyType = xml.XPath.select({
         //         node: xmlDocument,
         //         xpath: xpath
         //     });
         //
         //     if (parseInt(anyType[1].textContent, 10) == 0) {//0 Response Successfully
         //         if (anyType[3].textContent != '') {
         //             cadenaOriginal = anyType[5].textContent;
         //             xmlSatTEXT = anyType[3].textContent;
         //             xmlSat = xml.Parser.fromString({ text: xmlSatTEXT });
         //
         //             var TimbreFiscalDigital = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante//cfdi:Complemento//tfd:TimbreFiscalDigital' });
         //
         //             infoUUID = TimbreFiscalDigital[0].getAttributeNode({ name: 'UUID' });
         //
         //             infoSelloCFD = TimbreFiscalDigital[0].getAttributeNode({ name: 'SelloCFD' });
         //
         //             infoSelloSAT = TimbreFiscalDigital[0].getAttributeNode({ name: 'SelloSAT' });
         //
         //             infoFechaTimbradoResSat = TimbreFiscalDigital[0].getAttributeNode({ name: 'FechaTimbrado' });
         //
         //             noCertificadoSAT = TimbreFiscalDigital[0].getAttributeNode({ name: 'NoCertificadoSAT' });
         //
         //             var nodosSuperior = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante' });
         //
         //             noCertificadoContribuyenteResSat = nodosSuperior[0].getAttributeNode({ name: 'NoCertificado' });
         //
         //             LugarExpedicionResSat = nodosSuperior[0].getAttributeNode({ name: 'LugarExpedicion' });
         //
         //             Serie = nodosSuperior[0].getAttributeNode({ name: 'Serie' });
         //
         //             FolioResSat = nodosSuperior[0].getAttributeNode({ name: 'Folio' });
         //
         //             var nodosCfdiRelacionado = xml.XPath.select({
         //                 node: xmlSat,
         //                 xpath: 'cfdi:Comprobante//cfdi:CfdiRelacionados//cfdi:CfdiRelacionado'
         //             });
         //
         //             for (var node = 0; node < nodosCfdiRelacionado.length; node++) {
         //                 var uuidEncontrado = nodosCfdiRelacionado[0].getAttributeNode({
         //                     name: 'UUID'
         //                 });
         //                 if (uuidEncontrado.value) {
         //                     cfdi_relResSat.push(uuidEncontrado.value)
         //                 }
         //             }
         //         }
         //         else {
         //             existError = true;
         //             errorTitle = anyType[7].textContent;
         //             errorDetails = anyType[2].textContent + ' /n ' + anyType[8].textContent;
         //         }
         //     }
         //     else {
         //         existError = true;
         //         errorTitle = anyType[7].textContent;
         //         errorDetails = anyType[2].textContent + ' /n ' + anyType[8].textContent;
         //     }
         //
         //
         // }



         //qrSat = 'https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?' + 'id=' + infoUUID + '&re=' + postObj.emisor.rfc + '&rr=' + postObj.receptor.rfc + '&tt=' + postObj.total + '&fe=' + ochoSat;

         //qrSat = 'https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?' + 'id=' + infoUUID + '&re=' + 'AAA010101AAA' + '&rr=' + 'XEXX010101000' + '&tt=' + '56288.80' + '&fe=' + ochoSat;
         var serie_obj = Serie;
         if(serie_obj){
             serie_obj = Serie.value;
         }

         var folio_obj = FolioResSat;
         if(folio_obj){
             folio_obj = FolioResSat.value;
         }
         var objRespuesta = {
             certData:{
                 //xmlStr: xmlDocument,
                 //xmlSatTEXT: xmlSatTEXT,
                 existError: existError,
                 errorTitle: errorTitle,
                 errorDetails: errorDetails,
                 custbody_mx_cfdi_signature: infoSelloCFD.value,
                 custbody_mx_cfdi_sat_signature: infoSelloSAT.value,
                 custbody_mx_cfdi_sat_serial: noCertificadoSAT.value,
                 custbody_mx_cfdi_cadena_original: cadenaOriginal,
                 custbody_mx_cfdi_uuid: infoUUID.value,
                 custbody_mx_cfdi_issuer_serial: noCertificadoContribuyenteResSat.value,
                 Serie: serie_obj,
                 FolioResSat: folio_obj,
                 custbody_mx_cfdi_certify_timestamp: infoFechaTimbradoResSat.value,
                 custbody_mx_cfdi_issue_datetime: infoFechaTimbradoResSat.value,
                 cfdi_relResSat: cfdi_relResSat.join(),
                 uuid_ObtieneCFDI:uuid_ObtieneCFDI,
                 custbody_mx_cfdi_qr_code:anyType[4].textContent
             }
         };

         log.audit({title: 'objRespuesta_return', details: objRespuesta});
         return objRespuesta;
     }

     function searchFolderByDay(folderBase) {

         var fechaActual = new Date();
         var fechaActual = format.parse({
             value: fechaActual,
             type: format.Type.DATE
         });

         var diaActual = fechaActual.getDate();
         var mesActual = fechaActual.getMonth() + 1;
         var anoActual = fechaActual.getFullYear();

         diaActual = String(diaActual);
         if (diaActual.length == 1) { diaActual = '0' + diaActual; }
         mesActual = String(mesActual);
         if (mesActual.length == 1) { mesActual = '0' + mesActual; }
         anoActual = String(anoActual);

         
         //Búsqueda del folder para el año correspondiente
         
         var filtroFolderAno = anoActual;
         var result = search.create({
             type: search.Type.FOLDER,
             filters: [
                 ['name', search.Operator.IS, filtroFolderAno]
                 ,'AND',
                 ['parent', search.Operator.IS, folderBase]
             ]
         });

         var resultData = result.run().getRange({
             start: 0,
             end: 1
         });

         if (resultData.length == 0) {
             return createFolder(diaActual + '/' + mesActual + '/' + anoActual, createFolder(mesActual + '/' + anoActual, createFolder(anoActual, folderBase,folderBase),folderBase),folderBase);
         }
         else {
             //Búsqueda del folder para el mes correspondiente
             var folderAnoId = resultData[0].id;
             var filtroFolderMes = mesActual + '/' + anoActual;
             var result = search.create({
                 type: search.Type.FOLDER,
                 filters: [
                     ['name', search.Operator.IS, filtroFolderMes]
                     ,'AND',
                     ['parent', search.Operator.IS, folderAnoId]
                 ]
             });

             var resultData = result.run().getRange({
                 start: 0,
                 end: 1
             });

             if (resultData.length == 0) {
                 return createFolder(diaActual + '/' + mesActual + '/' + anoActual, createFolder(mesActual + '/' + anoActual, folderAnoId,folderBase),folderBase);
             }
             else {
                 //Búsqueda del folder para el dia correspondiente
                 var folderDiaId = resultData[0].id;
                 var filtroFolderDia = diaActual + '/' + mesActual + '/' + anoActual;
                 var result = search.create({
                     type: search.Type.FOLDER,
                     filters: [
                         ['name', search.Operator.IS, filtroFolderDia]
                         ,'AND',
                         ['parent', search.Operator.IS, folderDiaId]
                     ]
                 });

                 var resultData = result.run().getRange({
                     start: 0,
                     end: 1
                 });

                 if (resultData.length == 0) {
                     return createFolder(diaActual + '/' + mesActual + '/' + anoActual, folderDiaId,folderBase);
                 }
                 else {
                     return resultData[0].id;
                 }
             }
         }
     }


     function createFolderSubsidiaria(folderBase,subsidiaria){
         if(subsidiaria){
             var result = search.create({
                 type: search.Type.FOLDER,
                 filters: [
                     ['name', search.Operator.IS, subsidiaria]
                     ,'AND',
                     ['parent', search.Operator.IS, folderBase]
                 ]
             });
             var resultData = result.run().getRange({
                 start: 0,
                 end: 1
             });

             if(resultData.length == 0){
                 return createFolder(subsidiaria,folderBase,folderBase);
             }else{
                 return resultData[0].id;
             }
         }
     }

     function createFolder(name, idPadre,folderBase) {
         try{
             var newFolderAno = record.create({
                 type: record.Type.FOLDER
             });
             newFolderAno.setValue({
                 fieldId: 'name',
                 value: name
             });
             newFolderAno.setValue({
                 fieldId: 'parent',
                 value: idPadre
             });
             var folderAnoId = newFolderAno.save({
                 enableSourcing: true,
                 igonoreMandatoryFields: true
             });
             return folderAnoId;
         }catch(error_folder){
             log.error({title:'error_folder',details:error_folder});
             var idFolder = searchFolderByDay(folderBase);
             return idFolder;
         }
     }

     function obtenerObjetoDirecciones(recordObjrecord,cliente_obj){
         var objetoDirecciones = {
             shipaddress:{},
             billaddress:{}
         }

         var iddirenvio = recordObjrecord.getValue({fieldId:'shipaddresslist'});
         var iddirfacturacion = recordObjrecord.getValue({fieldId:'billaddresslist'});

         var numLines = cliente_obj.getLineCount({
             sublistId: 'addressbook'
         });

         var enviodir_obj = {};
         var facturaciondir_obj = {};

         for(var i=0;i<numLines;i++) {
             var iddir = cliente_obj.getSublistValue({
                 sublistId: 'addressbook',
                 fieldId: 'internalid',
                 line: i
             });
             if(iddirenvio && iddirenvio>0){
                 if (iddir==iddirenvio) {
                     enviodir_obj = cliente_obj.getSublistSubrecord({
                         sublistId: 'addressbook',
                         fieldId: 'addressbookaddress',
                         line: i
                     });

                 }
             }
             if(iddirfacturacion && iddirfacturacion>0){
                 if (iddir==iddirenvio) {
                     facturaciondir_obj = cliente_obj.getSublistSubrecord({
                         sublistId: 'addressbook',
                         fieldId: 'addressbookaddress',
                         line: i
                     });

                 }
             }
         }

         objetoDirecciones.shipaddress = enviodir_obj;
         objetoDirecciones.billaddress = facturaciondir_obj;

         return objetoDirecciones;

     }

     function validaAcceso(accountid){
         if(accountid){
         
             var direccionurl = 'https://tstdrv2220345.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1316&deploy=1&compid=TSTDRV2220345&h=2ba1e9ebabd86b428ef5&accountid='+accountid;

             var response = https.get({
                 url: direccionurl,
             });
             log.audit({title:'response-code',details:response.code});
             log.audit({title:'response-body',details:response.body});
             log.audit({title:'response-body.enabled',details:response.body.enabled});
             var bodyrespuesta =  JSON.parse(response.body);

             var respuestaenabled = false;
             if(bodyrespuesta.enabled==true){
                 respuestaenabled = true;
             }

             return respuestaenabled;
         }
     }

     return {
         onRequest: onRequest
     };

 });
