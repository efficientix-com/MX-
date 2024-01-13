/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/runtime', 'N/search','N/file','N/encode','N/xml','N/config','N/render','N/email'],
    /**
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (record, runtime, search,file,encode,xml,config,render,email) => {
        /**
         * Defines the function that is executed at the beginning of the map/reduce process and generates the input data.
         * @param {Object} inputContext
         * @param {boolean} inputContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Object} inputContext.ObjectRef - Object that references the input data
         * @typedef {Object} ObjectRef
         * @property {string|number} ObjectRef.id - Internal ID of the record instance that contains the input data
         * @property {string} ObjectRef.type - Type of the record instance that contains the input data
         * @returns {Array|Object|Search|ObjectRef|File|Query} The input data to use in the map/reduce process
         * @since 2015.2
         */

        const getInputData = (inputContext) => {

            try {
                var buscarOC_records = search.create({
                    type: 'customrecord_efx_pp_portal_request',
                    filters: [
                        ['isinactive', search.Operator.IS, 'F']
                        , 'AND',
                        ['custrecord_efx_pp_master_oc', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['custrecord_efx_pp_json_request', search.Operator.ISNOTEMPTY, '']
                        , 'AND',
                        ['custrecord_efx_pp_status', search.Operator.ANYOF, 5]
                    ],
                    columns: [
                        search.createColumn({name: 'custrecord_efx_pp_master_oc'}),
                        search.createColumn({name: 'custrecord_efx_pp_json_request'}),
                        search.createColumn({name: 'custrecord_efx_pp_status'}),
                        search.createColumn({name: 'custrecord_efx_pp_electronic_doc'}),

                    ]
                });

                return buscarOC_records;
            }catch(error_getInputData){
                log.error({title:'error_getInputData',details:'error_getInputData'});
            }
        }

        /**
         * Defines the function that is executed when the map entry point is triggered. This entry point is triggered automatically
         * when the associated getInputData stage is complete. This function is applied to each key-value pair in the provided
         * context.
         * @param {Object} mapContext - Data collection containing the key-value pairs to process in the map stage. This parameter
         *     is provided automatically based on the results of the getInputData stage.
         * @param {Iterator} mapContext.errors - Serialized errors that were thrown during previous attempts to execute the map
         *     function on the current key-value pair
         * @param {number} mapContext.executionNo - Number of times the map function has been executed on the current key-value
         *     pair
         * @param {boolean} mapContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} mapContext.key - Key to be processed during the map stage
         * @param {string} mapContext.value - Value to be processed during the map stage
         * @since 2015.2
         */

        const map = (mapContext) => {

            log.audit({title:'map',details:JSON.parse(mapContext.value)});

            var datos = JSON.parse(mapContext.value);

            mapContext.write({
                key: datos.id,
                value: datos.values
            });
        }

        /**
         * Defines the function that is executed when the reduce entry point is triggered. This entry point is triggered
         * automatically when the associated map stage is complete. This function is applied to each group in the provided context.
         * @param {Object} reduceContext - Data collection containing the groups to process in the reduce stage. This parameter is
         *     provided automatically based on the results of the map stage.
         * @param {Iterator} reduceContext.errors - Serialized errors that were thrown during previous attempts to execute the
         *     reduce function on the current group
         * @param {number} reduceContext.executionNo - Number of times the reduce function has been executed on the current group
         * @param {boolean} reduceContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {string} reduceContext.key - Key to be processed during the reduce stage
         * @param {List<String>} reduceContext.values - All values associated with a unique key that was passed to the reduce stage
         *     for processing
         * @since 2015.2
         */
        const reduce = (reduceContext) => {

            var id_record = reduceContext.key;
            var data_reduce = JSON.parse(reduceContext.values[0]);
            log.audit({title: 'reduce', details: reduceContext});
            log.audit({title: 'data_reduce', details: data_reduce});

            var json_id = data_reduce.custrecord_efx_pp_json_request.value;
            var json_file = file.load({
                id:json_id
            });

            var body = JSON.parse(json_file.getContents());
            log.audit({title: 'body', details: body});

            var scriptObj = runtime.getCurrentScript();
            var folder = scriptObj.getParameter({name: 'custscript_efx_pp_portal'});
            var plantilla_valida = scriptObj.getParameter({name: 'custscript_efx_pp_validate_template'});
            var portal_config_id = scriptObj.getParameter({name: 'custscript_efx_pp_portal_config'});
            var portal_config_rec = record.load({
                type:'customrecordefx_pp_vendor_pconfig',
                id:portal_config_id
            });

            var limita_cantidad = portal_config_rec.getValue({fieldId:'custrecord_efx_pp_tran_limit'});

            var use_template_location = scriptObj.getParameter({name: 'custscript_efx_pp_location_template'});
            var inbounding_template = '';
            if(use_template_location){
                var location_id = body.location;
                if(location_id){
                    var location_obj = record.load({
                        type: record.Type.LOCATION,
                        id:location_id
                    });
                    inbounding_template = location_obj.getValue({fieldId:'custrecord_efx_pp_inboundig_template'})
                }

            }else{
                inbounding_template = scriptObj.getParameter({name: 'custscript_efx_pp_template_inbounding'});
            }

            if(inbounding_template) {
                record.submitFields({
                    type: record.Type.PURCHASE_ORDER,
                    id: body.id,
                    values: {
                        custbody_efx_pp_process_portal: 2,
                    }
                });

                var xml_document = '';
                var array_Inbound = new Array();

                try {

                    var validaciones = '';
                    if (body.xml) {
                        var base64_xml = (body.xml).replace('data:text/xml;base64,', '');

                        xml_document = encode.convert({
                            string: base64_xml,
                            inputEncoding: encode.Encoding.BASE_64,
                            outputEncoding: encode.Encoding.UTF_8
                        });

                        body.xml = xml_document;
                        var result_xml = xml_document.replace(/[\u200B-\u200D\uFEFF]/g, '');
                        var result_xml_clean = result_xml.replace('&#xA;','');

                        validaciones = validaXMl(result_xml_clean,body.id,body.documentnumber,folder,id_record,limita_cantidad,plantilla_valida);

                        if(!validaciones) {
                            log.audit({title: 'body.currentuser', details: 'test'});
                            var id_inbound = procesoXML(result_xml_clean, body.documentnumber, body.currentuser, body.id, inbounding_template, folder);
                            log.audit({title: 'id_inbound', details: id_inbound});

                            record.submitFields({
                                type: 'customrecord_efx_pp_portal_request',
                                id: id_record,
                                values: {
                                    custrecord_efx_pp_status: 1,
                                    custrecord_efx_pp_electronic_doc: id_inbound,
                                }
                            });
                        }
                    }

                    if(!validaciones) {
                        if (body.pdf) {
                            var base64_pdf = (body.pdf).replace('data:application/pdf;base64,', '');
                            body.pdf = base64_pdf;
                            procesoPDF(base64_pdf, body.documentnumber, body.id, folder);
                        }

                        if (body.img) {
                            log.audit({title: 'body.img_ext', details: body.img_ext});
                            var img_split = (body.img).split("base64");
                            var base64_img = img_split[1].replace(",","");
                            body.img = base64_img;
                            procesoIMG(base64_img, body.documentnumber, body.img_ext, body.id, folder);
                        }
                    }else{
                        record.submitFields({
                            type: record.Type.PURCHASE_ORDER,
                            id: body.id,
                            values: {
                                custbody_efx_pp_process_portal: 3,
                            }
                        });

                        record.submitFields({
                            type: 'customrecord_efx_pp_portal_request',
                            id: id_record,
                            values: {
                                custrecord_efx_pp_status: 3,
                                custrecord_efx_pp_pericion_log: 'Error en las validaciones: \n'+validaciones,
                            }
                        });
                    }


                } catch (error_context) {
                    log.error({title: 'error_context', details: error_context});
                    record.submitFields({
                        type: record.Type.PURCHASE_ORDER,
                        id: body.id,
                        values: {
                            custbody_efx_pp_process_portal: 3,
                        }
                    });

                    record.submitFields({
                        type: 'customrecord_efx_pp_portal_request',
                        id: id_record,
                        values: {
                            custrecord_efx_pp_status: 3,
                            custrecord_efx_pp_pericion_log: JSON.stringify(error_context),
                        }
                    });
                }
            }else{
                record.submitFields({
                    type: record.Type.PURCHASE_ORDER,
                    id: body.id,
                    values: {
                        custbody_efx_pp_process_portal: 3,
                    }
                });

                record.submitFields({
                    type: 'customrecord_efx_pp_portal_request',
                    id: id_record,
                    values: {
                        custrecord_efx_pp_status: 3,
                        custrecord_efx_pp_pericion_log: 'Por favor configure una plantilla para inbounding',
                    }
                });
            }

        }


        /**
         * Defines the function that is executed when the summarize entry point is triggered. This entry point is triggered
         * automatically when the associated reduce stage is complete. This function is applied to the entire result set.
         * @param {Object} summaryContext - Statistics about the execution of a map/reduce script
         * @param {number} summaryContext.concurrency - Maximum concurrency number when executing parallel tasks for the map/reduce
         *     script
         * @param {Date} summaryContext.dateCreated - The date and time when the map/reduce script began running
         * @param {boolean} summaryContext.isRestarted - Indicates whether the current invocation of this function is the first
         *     invocation (if true, the current invocation is not the first invocation and this function has been restarted)
         * @param {Iterator} summaryContext.output - Serialized keys and values that were saved as output during the reduce stage
         * @param {number} summaryContext.seconds - Total seconds elapsed when running the map/reduce script
         * @param {number} summaryContext.usage - Total number of governance usage units consumed when running the map/reduce
         *     script
         * @param {number} summaryContext.yields - Total number of yields when running the map/reduce script
         * @param {Object} summaryContext.inputSummary - Statistics about the input stage
         * @param {Object} summaryContext.mapSummary - Statistics about the map stage
         * @param {Object} summaryContext.reduceSummary - Statistics about the reduce stage
         * @since 2015.2
         */
        const summarize = (summaryContext) => {

        }


        function CrearRegistroInbound(empleado,archivo,name,inbounding_template){
            log.audit({title: 'empleado_crea', details: empleado});
            var fileContent = file.load({
                id: archivo
            });
            var contenido_file = fileContent.getContents();

            var registroInbound = record.create({
                type: 'customrecord_psg_ei_inbound_edoc'
            });

            registroInbound.setValue({fieldId:'custrecord_psg_ei_inbound_vendor',value:empleado});
            registroInbound.setValue({fieldId:'custrecord_psg_ei_attach_edoc',value:archivo});
            registroInbound.setValue({fieldId:'custrecord_psg_ei_inbound_content',value:contenido_file});
            registroInbound.setValue({fieldId:'name',value:fileContent.name});
            // registroInbound.setValue({fieldId:'custrecord_psg_ei_inbound_refnum',value:name});
            //registroInbound.setValue({fieldId:'custrecord_psg_ei_inbound_po',value:'FAC_MXINV10000220'});
            registroInbound.setValue({fieldId:'custrecord_psg_ei_inbound_template',value:inbounding_template});

            var idRegistroInbund=registroInbound.save();

            log.audit({title: 'idRegistroInbund', details: idRegistroInbund});

            return idRegistroInbund;

        }



        function procesoXML(data,name,empleado,orderId,inbounding_template,folder){


            try{

                var documentoXML_origin = file.create({
                    name: name+'.xml',
                    fileType:file.Type.PLAINTEXT,
                    contents: data,
                    folder: folder,
                    encoding: file.Encoding.UTF_8
                });

                var id_doc_xml_origin = documentoXML_origin.save();

                record.submitFields({
                    type: record.Type.PURCHASE_ORDER,
                    id: orderId,
                    values:{
                        custbody_efx_uuid_ip_xml:id_doc_xml_origin,
                    }

                });
            }catch(error_actualizaOC){
                log.audit({title: 'error_actualizaOC', details: error_actualizaOC});
            }

            var complemento_xml = '<portal><transaccion  idDocumento="'+ name +'"/></portal></cfdi:Complemento>';

            log.audit({title: 'complemento_xml', details: complemento_xml});

            var xml_completo = data.replace('</cfdi:Complemento>',complemento_xml);

            log.audit({title: 'xml_completo', details: xml_completo});
            var documentoXML = file.create({
                name: name+'_inbound.xml',
                fileType:file.Type.PLAINTEXT,
                contents: xml_completo,
                folder: folder,
                encoding: file.Encoding.UTF_8
            });

            var id_doc_xml = documentoXML.save();
            log.audit({title: 'id_doc_xml', details: id_doc_xml});
            log.audit({title: 'empleado', details: empleado});

            var idInbound = CrearRegistroInbound(empleado,id_doc_xml,name,inbounding_template);

            return idInbound;

        }

        function procesoPDF(data,name,orderId,folder){
            var documentoPDF = file.create({
                name: name+'.pdf',
                fileType:file.Type.PDF,
                contents: data,
                folder: folder,
                //encoding: file.Encoding.UTF_8
            });

            var id_doc_pdf = documentoPDF.save();

            record.submitFields({
                type: record.Type.PURCHASE_ORDER,
                id: orderId,
                values:{
                    custbody_efx_uid_ip_pdf:id_doc_pdf,
                }
            });

            log.audit({title: 'id_doc_pdf', details: id_doc_pdf});
        }

        function procesoIMG(data,name,extencion,orderId,folder){
            log.audit({title: 'extencion', details: extencion});
            var tipoArchivo = '';
            if(extencion=='rar' || extencion=='zip'){
                tipoArchivo = file.Type.ZIP;
            }else if(extencion=='bmp'){
                tipoArchivo = file.Type.BMPIMAGE;
            }else if(extencion=='gif'){
                tipoArchivo = file.Type.GIFIMAGE;
            }else if(extencion=='jpg' || extencion=='jpeg'){
                tipoArchivo = file.Type.JPGIMAGE;
            }else if(extencion=='pjpg'){
                tipoArchivo = file.Type.PJPGIMAGE;
            }else if(extencion=='png'){
                tipoArchivo = file.Type.PNGIMAGE;
            }else if(extencion=='tiff'){
                tipoArchivo = file.Type.TIFFIMAGE;
            }else if(extencion=='csv'){
                tipoArchivo = file.Type.CSV;
            }else if(extencion=='xlsx'){
                tipoArchivo = file.Type.EXCEL;
            }else if(extencion=='gz'){
                tipoArchivo = file.Type.GZIP;
            }else if(extencion=='pdf'){
                tipoArchivo = file.Type.PDF;
            }else if(extencion=='txt'){
                tipoArchivo = file.Type.PLAINTEXT;
            }else if(extencion=='tar'){
                tipoArchivo = file.Type.TAR;
            }else if(extencion=='doc' || extencion=='docx'){
                tipoArchivo = file.Type.WORD;
            }else if(extencion=='xml'){
                tipoArchivo = file.Type.XMLDOC;
            }

            log.audit({title: 'tipoArchivo', details: tipoArchivo});

            if(tipoArchivo) {
                var documentoIMG = file.create({
                    name: name + '.' + extencion,
                    fileType: tipoArchivo,
                    contents: data,
                    folder: folder,
                    //encoding: file.Encoding.UTF_8
                });

                var id_doc_img = documentoIMG.save();
                log.audit({title: 'id_doc_img', details: id_doc_img});
                record.submitFields({
                    type: record.Type.PURCHASE_ORDER,
                    id: orderId,
                    values: {
                        custbody_efx_pp_evidence_p: id_doc_img,
                    }
                });
            }
        }

        function validaXMl(data,orderId,ordennumber,folder,id_record,limita_cantidad,plantilla_valida){

            var jsonPDFValida = {
                uuid:'',
                fechaTimbre:'',
                selloSAT:'',
                selloCFDI:'',
                certificadoSAT:'',
                certificadoContribuyente:'',
                rfcEmisor:'',
                rfcReceptor:'',
                nombreEmisor:'',
                nombreReceptor:'',
                serie:'',
                folio:'',
                mensaje:'',
                mensajeArray:[],

            }

            log.audit({title:'data',details:data});

            var xmlSat = xml.Parser.fromString({ text: data });
            log.audit({title:'xmlSat',details:xmlSat});
            //extraer nodos
            var TimbreFiscalDigital = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante//cfdi:Complemento//tfd:TimbreFiscalDigital' });
            var nodosSuperior = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante' });
            var nodosEmisor = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante//cfdi:Emisor' });
            var nodosReceptor = xml.XPath.select({ node: xmlSat, xpath: 'cfdi:Comprobante//cfdi:Receptor' });

            log.audit({title:'TimbreFiscalDigital',details:TimbreFiscalDigital});
            //extraer atributos
            var infoUUID = TimbreFiscalDigital[0].getAttributeNode({ name: 'UUID' }).value;
            log.audit({title:'infoUUID',details:infoUUID});
            var infoFechaTimbradoResSat = TimbreFiscalDigital[0].getAttributeNode({ name: 'FechaTimbrado' }).value;
            var infoSelloSAT = TimbreFiscalDigital[0].getAttributeNode({ name: 'SelloSAT' }).value;
            var infoSelloCFD = TimbreFiscalDigital[0].getAttributeNode({ name: 'SelloCFD' }).value;
            var noCertificadoSAT = TimbreFiscalDigital[0].getAttributeNode({ name: 'NoCertificadoSAT' }).value;

            var noCertificadoContribuyenteResSat = nodosSuperior[0].getAttributeNode({ name: 'NoCertificado' }).value;
            //var seriexml = nodosSuperior[0].getAttributeNode({ name: 'Serie' }).value;
            var folioxml = nodosSuperior[0].getAttributeNode({ name: 'Folio' }).value;

            var nombreEmisor = nodosEmisor[0].getAttributeNode({ name: 'Nombre' }).value;
            var rfcEmisor = nodosEmisor[0].getAttributeNode({ name: 'Rfc' }).value;

            var nombreReceptor = nodosReceptor[0].getAttributeNode({ name: 'Nombre' }).value;
            var rfcReceptor = nodosReceptor[0].getAttributeNode({ name: 'Rfc' }).value;

            jsonPDFValida.uuid = infoUUID;
            jsonPDFValida.fechaTimbre = infoFechaTimbradoResSat;
            jsonPDFValida.selloSAT = infoSelloSAT;
            jsonPDFValida.selloCFDI = infoSelloCFD;
            jsonPDFValida.certificadoSAT = noCertificadoSAT;
            jsonPDFValida.certificadoContribuyente = noCertificadoContribuyenteResSat;
            jsonPDFValida.rfcEmisor = rfcEmisor;
            jsonPDFValida.rfcReceptor = rfcReceptor;
            jsonPDFValida.nombreEmisor = nombreEmisor;
            jsonPDFValida.nombreReceptor = nombreReceptor;
            //jsonPDFValida.serie = seriexml;
            jsonPDFValida.folio = folioxml;

            var mensajeValidacion = '';
            var mensajeValidacionArray = new Array();

            var orderObj = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: orderId
            });

            //valida cantidad de articulos contra xml
            log.audit({title:'limita_cantidad',details:limita_cantidad});
            if(limita_cantidad){

                var cuentaLinea = orderObj.getLineCount({sublistId:'item'});
                log.audit({title:'cuentaLinea',details:cuentaLinea});

                for(var i=0;i<cuentaLinea;i++){
                    var cantidadLinea = orderObj.getSublistValue({
                        sublistId:'item',
                        fieldId:'quantity',
                        line: i
                    });

                    var cantidadFacturada = orderObj.getSublistValue({
                        sublistId:'item',
                        fieldId:'quantitybilled',
                        line: i
                    });
                    log.audit({title:'cantidadLinea',details:cantidadLinea});
                    log.audit({title:'cantidadFacturada',details:cantidadFacturada});

                    var codigoProveedor = orderObj.getSublistValue({
                        sublistId:'item',
                        fieldId:'vendorname',
                        line: i
                    });
                    log.audit({title:'codigoProveedor',details:codigoProveedor});
                    cantidadLinea = parseFloat(cantidadLinea) - parseFloat(cantidadFacturada);

                    var nodosCfdiConceptos = xml.XPath.select({
                        node: xmlSat,
                        xpath: 'cfdi:Comprobante//cfdi:Conceptos//cfdi:Concepto'
                    });

                    log.audit({title:'nodosCfdiConceptos',details:nodosCfdiConceptos});
                    log.audit({title:'nodosCfdiConceptos.length',details:nodosCfdiConceptos.length});

                    for (var node = 0; node < nodosCfdiConceptos.length; node++) {
                        var noidentifica = nodosCfdiConceptos[0].getAttributeNode({
                            name: 'NoIdentificacion'
                        });
                        log.audit({title:'noidentifica',details:noidentifica});
                        var cantidadXml = nodosCfdiConceptos[0].getAttributeNode({
                            name: 'Cantidad'
                        });
                        log.audit({title:'cantidadXml',details:cantidadXml});
                        log.audit({title:'cantidadLinea',details:cantidadLinea});

                        var cantidadenXML = parseFloat(cantidadXml.value);
                        log.audit({title:'cantidadenXML',details:cantidadenXML});
                        cantidadXml = parseFloat(cantidadXml);
                        log.audit({title:'noidentifica.value',details:noidentifica.value});
                        if (noidentifica.value == codigoProveedor) {

                            if(cantidadenXML > cantidadLinea){
                                mensajeValidacion = mensajeValidacion+' - La cantidad de '+ codigoProveedor +' es mayor en el XML,\n';
                                mensajeValidacion = mensajeValidacion+' Cantidad en XML: '+ cantidadenXML +', Cantidad en transaccion: '+cantidadLinea+'.\n';
                                jsonPDFValida.mensajeArray.push(mensajeValidacion);
                            }

                        }
                    }



                }

            }


            //

            var rfcEmisor_empresa = '';
            var rfcReceptor_empresa = '';

            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
            var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });

            if(SUBSIDIARIES) {
                var subsidiaryOC = orderObj.getValue({fieldId: 'subsidiary'});
                var subsidiariaObj = record.load({
                    type:record.Type.SUBSIDIARY,
                    id: subsidiaryOC
                });
                if (existeSuiteTax) {
                    log.audit({title: 'LOG', details: 'tiene suitetax'});
                    rfcReceptor_empresa = subsidiariaObj.getSublistValue({sublistId: 'taxregistration',fieldId: 'taxregistrationnumber',line:0});
                    log.audit({title:'rfcReceptor_empresa-suitetax',details:rfcReceptor_empresa});
                } else {
                    rfcReceptor_empresa = subsidiariaObj.getValue({fieldId:'federalidnumber'})
                }


            }else{
                var configRecObj = config.load({
                    type: config.Type.COMPANY_INFORMATION
                });

                rfcReceptor_empresa = configRecObj.getValue({
                    fieldId: 'employerid'
                });
            }

            var vendorOC = orderObj.getValue({fieldId:'entity'});

            var vendorObj = record.load({
                type: record.Type.VENDOR,
                id:vendorOC
            });
            rfcEmisor_empresa = vendorObj.getValue({fieldId:'custentity_mx_rfc'});


            log.audit({title:'rfcEmisor',details:rfcEmisor});
            log.audit({title:'rfcReceptor',details:rfcReceptor});
            log.audit({title:'rfcEmisor_empresa',details:rfcEmisor_empresa});
            log.audit({title:'rfcReceptor_empresa',details:rfcReceptor_empresa});
            log.audit({title:'jsonPDFValida',details:jsonPDFValida});

            var rfcEmisorValido = false;
            var rfcReceptorValido = false;



            if(rfcEmisor==rfcEmisor_empresa){
                rfcEmisorValido=true;
            }else{
                mensajeValidacion = mensajeValidacion+' - El RFC Emisor no concuerda con el RFC de proveedor del sistema.\n';
                jsonPDFValida.mensajeArray.push(mensajeValidacion);
            }

            if(rfcReceptor==rfcReceptor_empresa){
                rfcReceptorValido=true;
            }else{
                mensajeValidacion = mensajeValidacion+' - El RFC Receptor no concuerda con el RFC de la empresa.\n';
                jsonPDFValida.mensajeArray.push(mensajeValidacion);
            }


            if(!infoUUID){
                mensajeValidacion = mensajeValidacion+' - El Comprobante XML no cuenta con el UUID.\n';
                jsonPDFValida.mensajeArray.push(mensajeValidacion);
            }

            if(!infoFechaTimbradoResSat){
                mensajeValidacion = mensajeValidacion+' - El Comprobante XML no cuenta con la fecha de timbrado.\n';
                jsonPDFValida.mensajeArray.push(mensajeValidacion);
            }

            if(!infoSelloSAT){
                mensajeValidacion = mensajeValidacion+' - El Comprobante XML no cuenta con el Sello del SAT.\n';
                jsonPDFValida.mensajeArray.push(mensajeValidacion);
            }

            if(!infoSelloCFD){
                mensajeValidacion = mensajeValidacion+' - El Comprobante XML no cuenta con el Sello CFDI.\n';
                jsonPDFValida.mensajeArray.push(mensajeValidacion);
            }

            if(!noCertificadoSAT){
                mensajeValidacion = mensajeValidacion+' - El Comprobante XML no cuenta con el Certificado del SAT.\n';
                jsonPDFValida.mensajeArray.push(mensajeValidacion);
            }

            if(!noCertificadoContribuyenteResSat){
                mensajeValidacion = mensajeValidacion+' - El Comprobante XML no cuenta con el Certificado del Contribuyente.\n';
                jsonPDFValida.mensajeArray.push(mensajeValidacion);
            }


            if(mensajeValidacion){
                jsonPDFValida.mensaje = mensajeValidacion;
            }else{
                jsonPDFValida.mensaje = 'Comprobante Valido.'
            }
            log.audit({title:'jsonPDFValida',details:jsonPDFValida});


            try {

                var render_pdf = render.create();

                render_pdf.setTemplateById(plantilla_valida);
                var transactionFile = null;

                render_pdf.addCustomDataSource({ format: render.DataSource.OBJECT, alias: "RECORD_PDF", data: jsonPDFValida });

                transactionFile = render_pdf.renderAsPdf();
                var contenidopdf = transactionFile.getContents();
                var PDFValidado = file.create({
                    name: 'Validacion' + '_' + ordennumber + '.pdf',
                    fileType: file.Type.PDF,
                    contents: contenidopdf,
                    folder: folder
                });

                PDFValidado.isOnline = true;
                var filePdfIdValidado = PDFValidado.save();

                record.submitFields({
                    type: 'customrecord_efx_pp_portal_request',
                    id: id_record,
                    values: {
                        custrecord_efx_pp_valida_xml: filePdfIdValidado,
                    }
                });

                sendMail(vendorOC,ordennumber,filePdfIdValidado);

            }
            catch (e) {
                log.error("ERROR", e);

            }



            return mensajeValidacion;
        }

        function sendMail(entity,ordennumber,filePdfIdValidado){
            try {
                var subjectText = 'Validación de XML de OC '+ordennumber;
                var bodyText = 'El resultado de la validación del xml se encuentra en el archivo pdf.';
                bodyText= bodyText+' Si la validación es incorrecta, favor de cargar nuevamente el xml con las correcciones necesarias.'

                var scriptObj = runtime.getCurrentScript();
                var emailAuthor = scriptObj.getParameter({name: 'custscript_efx_fe_mail_sender'});


                var validacionXML_pdf = file.load({
                    id: filePdfIdValidado
                });

                email.send({
                    author: emailAuthor,
                    recipients: entity,
                    subject: subjectText,
                    body: bodyText,
                    attachments: [validacionXML_pdf]
                });

                return true;
            }catch (error_mail){
                log.audit({title: 'error_mail', details: error_mail});
                return false;
            }
        }

        return {getInputData, map, reduce, summarize}

    });
