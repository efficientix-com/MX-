/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/ui/serverWidget'],
    /**
 * @param{record} record
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (record, search, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            if (scriptContext.request.parameters != null) {
                var camposAguardar = {
                    estado:'',
                    internalid:'',
                    custrecord_efx_fe_configura_folder:'',
                    custrecord_efx_fe_version:'',
                    custrecord_efx_fe_adjust_cert:'',
                    custrecord_efx_fe_regenerar_pdf:false,
                    custrecord_efx_fe_desglosaart:false,
                    custrecord_efx_fe_mail_subject:'',
                    custrecord_efx_fe_mail_body:'',
                    custrecord_efx_fe_mail_sender:'',
                    custrecord_efx_fe_autosendmail:false,
                    custrecord_efx_fe_date_payment:false,
                    custrecord_efx_fe_date_invoice:false,
                    custrecord_efx_fe_connect_pac_data:'',
                    custrecord_efx_fe_item_imp_loc:'',
                    custrecord_efx_fe_owner_certify:'',
                    custrecord_efx_pp_portal:'',
                    custrecord_efx_pp_location_template:false,
                    custrecord_efx_pp_template_inbounding:'',
                    custrecord_efx_pp_validate_template:'',
                    custrecord_efx_pp_portal_config:'',
                    custrecord_efx_fe_gbl_config:'',
                    custrecord_efx_fe_kiosko_config:'',
                    custrecord_efx_fe_nc_kiosko_item:'',
                    custrecord_efx_fe_id_carpeta_valida_xml:'',
                    custrecord_efx_fe_url_valida_xml:'',
                };
                var parametros = scriptContext.request.parameters;
                camposAguardar.internalid = parametros.custpage_efx_fe_internalid;
                camposAguardar.custrecord_efx_fe_configura_folder = parametros.custpage_efx_fe_folder_certify;
                camposAguardar.custrecord_efx_fe_version = parametros.custpage_efx_fe_version;
                camposAguardar.custrecord_efx_fe_adjust_cert = parametros.custpage_efx_fe_adjust_cert;
                camposAguardar.custrecord_efx_fe_regenerar_pdf = parametros.custpage_efx_fe_regenerar_pdf;
                camposAguardar.custrecord_efx_fe_desglosaart = parametros.custpage_efx_fe_desglosaart;
                camposAguardar.custrecord_efx_fe_mail_subject = parametros.custpage_efx_fe_mail_subject;
                camposAguardar.custrecord_efx_fe_mail_body = parametros.custpage_efx_fe_mail_body;
                camposAguardar.custrecord_efx_fe_mail_sender = parametros.custpage_efx_fe_mail_sender;
                camposAguardar.custrecord_efx_fe_autosendmail = parametros.custpage_efx_fe_autosendmail;
                camposAguardar.custrecord_efx_fe_date_payment = parametros.custpage_efx_fe_date_payment;
                camposAguardar.custrecord_efx_fe_date_invoice = parametros.custpage_efx_fe_date_invoice;
                camposAguardar.custrecord_efx_fe_connect_pac_data = parametros.custpage_efx_fe_connect_pac_data;
                camposAguardar.custrecord_efx_fe_item_imp_loc = parametros.custpage_efx_fe_item_imp_loc;
                camposAguardar.custrecord_efx_fe_owner_certify = parametros.custpage_efx_fe_owner_certify;
                camposAguardar.custrecord_efx_pp_portal = parametros.custpage_efx_pp_portal;
                camposAguardar.custrecord_efx_pp_location_template = parametros.custpage_efx_pp_location_template;
                camposAguardar.custrecord_efx_pp_template_inbounding = parametros.custpage_efx_pp_template_inbounding;
                camposAguardar.custrecord_efx_pp_validate_template = parametros.custpage_efx_pp_validate_template;
                camposAguardar.custrecord_efx_pp_portal_config = parametros.custpage_efx_pp_portal_config;
                camposAguardar.custrecord_efx_fe_gbl_config = parametros.custpage_efx_fe_gbl_config;
                camposAguardar.custrecord_efx_fe_kiosko_config = parametros.custpage_efx_fe_kiosko_config;
                camposAguardar.custrecord_efx_fe_nc_kiosko_item = parametros.custpage_efx_fe_nc_kiosko_item;
                camposAguardar.custrecord_efx_fe_id_carpeta_valida_xml = parametros.custpage_efx_fe_id_carpeta_valida_xml;

                log.audit({title: 'camposAguardar', details: camposAguardar});

                if(camposAguardar.internalid){
                    record.submitFields({
                        type: 'customrecord_efx_fe_configuracion',
                        id: camposAguardar.internalid,
                        values:{
                            custrecord_efx_fe_configura_folder:camposAguardar.custrecord_efx_fe_configura_folder,
                            custrecord_efx_fe_version:camposAguardar.custrecord_efx_fe_version,
                            custrecord_efx_fe_adjust_cert:camposAguardar.custrecord_efx_fe_adjust_cert,
                            custrecord_efx_fe_regenerar_pdf:camposAguardar.custrecord_efx_fe_regenerar_pdf,
                            custrecord_efx_fe_desglosaart:camposAguardar.custrecord_efx_fe_desglosaart,
                            custrecord_efx_fe_mail_subject:camposAguardar.custrecord_efx_fe_mail_subject,
                            custrecord_efx_fe_mail_body:camposAguardar.custrecord_efx_fe_mail_body,
                            custrecord_efx_fe_mail_sender:camposAguardar.custrecord_efx_fe_mail_sender,
                            custrecord_efx_fe_autosendmail:camposAguardar.custrecord_efx_fe_autosendmail,
                            custrecord_efx_fe_date_payment:camposAguardar.custrecord_efx_fe_date_payment,
                            custrecord_efx_fe_date_invoice:camposAguardar.custrecord_efx_fe_date_invoice,
                            custrecord_efx_fe_connect_pac_data:camposAguardar.custrecord_efx_fe_connect_pac_data,
                            custrecord_efx_fe_item_imp_loc:camposAguardar.custrecord_efx_fe_item_imp_loc,
                            custrecord_efx_fe_owner_certify:camposAguardar.custrecord_efx_fe_owner_certify,
                            custrecord_efx_pp_portal:camposAguardar.custrecord_efx_pp_portal,
                            custrecord_efx_pp_location_template:camposAguardar.custrecord_efx_pp_location_template,
                            custrecord_efx_pp_template_inbounding:camposAguardar.custrecord_efx_pp_template_inbounding,
                            custrecord_efx_pp_validate_template:camposAguardar.custrecord_efx_pp_validate_template,
                            custrecord_efx_pp_portal_config:camposAguardar.custrecord_efx_pp_portal_config,
                            custrecord_efx_fe_gbl_config:camposAguardar.custrecord_efx_fe_gbl_config,
                            custrecord_efx_fe_kiosko_config:camposAguardar.custrecord_efx_fe_kiosko_config,
                            custrecord_efx_fe_nc_kiosko_item:camposAguardar.custrecord_efx_fe_nc_kiosko_item,
                            custrecord_efx_fe_id_carpeta_valida_xml:camposAguardar.custrecord_efx_fe_id_carpeta_valida_xml,


                        }
                    });
                }
            }

            var buscaregistro = search.create({
                type: 'customrecord_efx_fe_configuracion',
                filters:[
                    ['isinactive',search.Operator.IS,'F']
                ],
                columns:[
                    search.createColumn({name:'internalid',sort:search.Sort.ASC}),
                    search.createColumn({name:'custrecord_efx_fe_configura_folder'}),
                    search.createColumn({name:'custrecord_efx_fe_version'}),
                    search.createColumn({name:'custrecord_efx_fe_adjust_cert'}),
                    search.createColumn({name:'custrecord_efx_fe_regenerar_pdf'}),
                    search.createColumn({name:'custrecord_efx_fe_desglosaart'}),
                    search.createColumn({name:'custrecord_efx_fe_mail_subject'}),
                    search.createColumn({name:'custrecord_efx_fe_mail_body'}),
                    search.createColumn({name:'custrecord_efx_fe_mail_sender'}),
                    search.createColumn({name:'custrecord_efx_fe_autosendmail'}),
                    search.createColumn({name:'custrecord_efx_fe_date_payment'}),
                    search.createColumn({name:'custrecord_efx_fe_date_invoice'}),
                    search.createColumn({name:'custrecord_efx_fe_connect_pac_data'}),
                    search.createColumn({name:'custrecord_efx_fe_item_imp_loc'}),
                    search.createColumn({name:'custrecord_efx_fe_owner_certify'}),
                    search.createColumn({name:'custrecord_efx_pp_portal'}),
                    search.createColumn({name:'custrecord_efx_pp_location_template'}),
                    search.createColumn({name:'custrecord_efx_pp_template_inbounding'}),
                    search.createColumn({name:'custrecord_efx_pp_validate_template'}),
                    search.createColumn({name:'custrecord_efx_pp_portal_config'}),
                    search.createColumn({name:'custrecord_efx_fe_gbl_config'}),
                    search.createColumn({name:'custrecord_efx_fe_kiosko_config'}),
                    search.createColumn({name:'custrecord_efx_fe_nc_kiosko_item'}),
                    search.createColumn({name:'custrecord_efx_fe_id_carpeta_valida_xml'}),
                    search.createColumn({name:'custrecord_efx_fe_url_valida_xml'}),
                ]
            });

            var numregistros = buscaregistro.runPaged().count;
            var objColumnas = {
                estado:'',
                internalid:'',
                custrecord_efx_fe_configura_folder:'',
                custrecord_efx_fe_version:'',
                custrecord_efx_fe_adjust_cert:'',
                custrecord_efx_fe_regenerar_pdf:false,
                custrecord_efx_fe_desglosaart:false,
                custrecord_efx_fe_mail_subject:'',
                custrecord_efx_fe_mail_body:'',
                custrecord_efx_fe_mail_sender:'',
                custrecord_efx_fe_autosendmail:false,
                custrecord_efx_fe_date_payment:false,
                custrecord_efx_fe_date_invoice:false,
                custrecord_efx_fe_connect_pac_data:'',
                custrecord_efx_fe_item_imp_loc:'',
                custrecord_efx_fe_owner_certify:'',
                custrecord_efx_pp_portal:'',
                custrecord_efx_pp_location_template:false,
                custrecord_efx_pp_template_inbounding:'',
                custrecord_efx_pp_validate_template:'',
                custrecord_efx_pp_portal_config:'',
                custrecord_efx_fe_gbl_config:'',
                custrecord_efx_fe_kiosko_config:'',
                custrecord_efx_fe_nc_kiosko_item:'',
                custrecord_efx_fe_id_carpeta_valida_xml:'',
                custrecord_efx_fe_url_valida_xml:'',
            };


            if(!numregistros){
                //registro nuevo de configuracion
                var registro_configura = record.create({
                   type:'customrecord_efx_fe_configuracion'
                });
                objColumnas.internalid = registro_configura.save({enableSourcing:true,ignoreMandatoryFields:true});
                objColumnas.estado = 'nuevo';
                
            }else if(numregistros>1){
                //mas de una configuracion
                var count = 0;
                buscaregistro.run().each(function (resultado){
                    var idRecordBorrar = resultado.getValue({name:'internalid'});
                    count++;
                    if(count<numregistros){
                        record.delete({
                            type:'customrecord_efx_fe_configuracion',
                            id:idRecordBorrar,
                        });
                    }else{
                        objColumnas.internalid = idRecordBorrar;
                        objColumnas.estado = 'existe';
                        objColumnas.custrecord_efx_fe_configura_folder = resultado.getValue({name:'custrecord_efx_fe_configura_folder'});
                        objColumnas.custrecord_efx_fe_version = resultado.getValue({name:'custrecord_efx_fe_version'});
                        objColumnas.custrecord_efx_fe_adjust_cert = resultado.getValue({name:'custrecord_efx_fe_adjust_cert'});
                        objColumnas.custrecord_efx_fe_regenerar_pdf = (resultado.getValue({name:'custrecord_efx_fe_regenerar_pdf'})) ? 'T' : 'F';
                        objColumnas.custrecord_efx_fe_desglosaart = (resultado.getValue({name:'custrecord_efx_fe_desglosaart'})) ? 'T' : 'F';
                        objColumnas.custrecord_efx_fe_mail_subject = resultado.getValue({name:'custrecord_efx_fe_mail_subject'});
                        objColumnas.custrecord_efx_fe_mail_body = resultado.getValue({name:'custrecord_efx_fe_mail_body'});
                        objColumnas.custrecord_efx_fe_mail_sender = resultado.getValue({name:'custrecord_efx_fe_mail_sender'});
                        objColumnas.custrecord_efx_fe_autosendmail = (resultado.getValue({name:'custrecord_efx_fe_autosendmail'})) ? 'T' : 'F';
                        objColumnas.custrecord_efx_fe_date_payment = (resultado.getValue({name:'custrecord_efx_fe_date_payment'})) ? 'T' : 'F';
                        objColumnas.custrecord_efx_fe_date_invoice = (resultado.getValue({name:'custrecord_efx_fe_date_invoice'})) ? 'T' : 'F';
                        objColumnas.custrecord_efx_fe_connect_pac_data = resultado.getValue({name:'custrecord_efx_fe_connect_pac_data'});
                        objColumnas.custrecord_efx_fe_item_imp_loc = resultado.getValue({name:'custrecord_efx_fe_item_imp_loc'});
                        objColumnas.custrecord_efx_fe_owner_certify = resultado.getValue({name:'custrecord_efx_fe_owner_certify'});
                        objColumnas.custrecord_efx_pp_portal = resultado.getValue({name:'custrecord_efx_pp_portal'});
                        objColumnas.custrecord_efx_pp_location_template = (resultado.getValue({name:'custrecord_efx_pp_location_template'})) ? 'T' : 'F';
                        objColumnas.custrecord_efx_pp_template_inbounding = resultado.getValue({name:'custrecord_efx_pp_template_inbounding'});
                        objColumnas.custrecord_efx_pp_validate_template = resultado.getValue({name:'custrecord_efx_pp_validate_template'});
                        objColumnas.custrecord_efx_pp_portal_config = resultado.getValue({name:'custrecord_efx_pp_portal_config'});
                        objColumnas.custrecord_efx_fe_gbl_config = resultado.getValue({name:'custrecord_efx_fe_gbl_config'});
                        objColumnas.custrecord_efx_fe_kiosko_config = resultado.getValue({name:'custrecord_efx_fe_kiosko_config'});
                        objColumnas.custrecord_efx_fe_nc_kiosko_item = resultado.getValue({name:'custrecord_efx_fe_nc_kiosko_item'});
                        objColumnas.custrecord_efx_fe_id_carpeta_valida_xml = resultado.getValue({name:'custrecord_efx_fe_id_carpeta_valida_xml'});
                        objColumnas.custrecord_efx_fe_url_valida_xml = resultado.getValue({name:'custrecord_efx_fe_url_valida_xml'});
                    }
                    return true;
                });

            }else if(numregistros==1){
                //configuracion ya creada
                buscaregistro.run().each(function (resultado){
                    objColumnas.internalid = resultado.getValue({name:'internalid'});
                    objColumnas.custrecord_efx_fe_configura_folder = resultado.getValue({name:'custrecord_efx_fe_configura_folder'});
                    objColumnas.custrecord_efx_fe_version = resultado.getValue({name:'custrecord_efx_fe_version'});
                    objColumnas.custrecord_efx_fe_adjust_cert = resultado.getValue({name:'custrecord_efx_fe_adjust_cert'});
                    objColumnas.custrecord_efx_fe_regenerar_pdf = (resultado.getValue({name:'custrecord_efx_fe_regenerar_pdf'})) ? 'T' : 'F';
                    objColumnas.custrecord_efx_fe_desglosaart = (resultado.getValue({name:'custrecord_efx_fe_desglosaart'})) ? 'T' : 'F';
                    objColumnas.custrecord_efx_fe_mail_subject = resultado.getValue({name:'custrecord_efx_fe_mail_subject'});
                    objColumnas.custrecord_efx_fe_mail_body = resultado.getValue({name:'custrecord_efx_fe_mail_body'});
                    objColumnas.custrecord_efx_fe_mail_sender = resultado.getValue({name:'custrecord_efx_fe_mail_sender'});
                    objColumnas.custrecord_efx_fe_autosendmail = (resultado.getValue({name:'custrecord_efx_fe_autosendmail'})) ? 'T' : 'F';
                    objColumnas.custrecord_efx_fe_date_payment = (resultado.getValue({name:'custrecord_efx_fe_date_payment'})) ? 'T' : 'F';
                    objColumnas.custrecord_efx_fe_date_invoice = (resultado.getValue({name:'custrecord_efx_fe_date_invoice'})) ? 'T' : 'F';
                    objColumnas.custrecord_efx_fe_connect_pac_data = resultado.getValue({name:'custrecord_efx_fe_connect_pac_data'});
                    objColumnas.custrecord_efx_fe_item_imp_loc = resultado.getValue({name:'custrecord_efx_fe_item_imp_loc'});
                    objColumnas.custrecord_efx_fe_owner_certify = resultado.getValue({name:'custrecord_efx_fe_owner_certify'});
                    objColumnas.custrecord_efx_pp_portal = resultado.getValue({name:'custrecord_efx_pp_portal'});
                    objColumnas.custrecord_efx_pp_location_template = (resultado.getValue({name:'custrecord_efx_pp_location_template'})) ? 'T' : 'F';
                    objColumnas.custrecord_efx_pp_template_inbounding = resultado.getValue({name:'custrecord_efx_pp_template_inbounding'});
                    objColumnas.custrecord_efx_pp_validate_template = resultado.getValue({name:'custrecord_efx_pp_validate_template'});
                    objColumnas.custrecord_efx_pp_portal_config = resultado.getValue({name:'custrecord_efx_pp_portal_config'});
                    objColumnas.custrecord_efx_fe_gbl_config = resultado.getValue({name:'custrecord_efx_fe_gbl_config'});
                    objColumnas.custrecord_efx_fe_kiosko_config = resultado.getValue({name:'custrecord_efx_fe_kiosko_config'});
                    objColumnas.custrecord_efx_fe_nc_kiosko_item = resultado.getValue({name:'custrecord_efx_fe_nc_kiosko_item'});
                    objColumnas.custrecord_efx_fe_id_carpeta_valida_xml = resultado.getValue({name:'custrecord_efx_fe_id_carpeta_valida_xml'});
                    objColumnas.custrecord_efx_fe_url_valida_xml = resultado.getValue({name:'custrecord_efx_fe_url_valida_xml'});
                    return true;
                });
                objColumnas.estado = 'existe';
            }


            var folders = buscaFolder();
            log.audit({title:'objColumnas',details:objColumnas});

            var form_facturacion = creaForm(objColumnas,folders);
            scriptContext.response.writePage(form_facturacion);

        }

        const creaForm = (objColumnas,folders) =>{
            var form_fe = serverWidget.createForm({
                title: 'Configuración Facturación Electrónica'
            });

            form_fe.addSubmitButton({
                label: 'Guardar',
            });

            var subtabfe = form_fe.addSubtab({
                id : 'subtabid_fe',
                label : 'Facturación Electrónica',
            });

            var subtabpp = form_fe.addSubtab({
                id : 'subtabid_pp',
                label : 'Portal de Proveedores'
            });

            var subtabfg = form_fe.addSubtab({
                id : 'subtabid_fg',
                label : 'Facturación Global'
            });

            var subtabfg = form_fe.addSubtab({
                id : 'subtabid_kiosko',
                label : 'Kiosko'
            });
            var subtabfg = form_fe.addSubtab({
                id : 'subtabid_validaxml',
                label : 'Validador XML'
            });



            var folderPproveedores = form_fe.addField({
                id:'custpage_efx_pp_portal',
                type: serverWidget.FieldType.SELECT,
                label: 'Folder Portal Proveedores',
                container:'subtabid_pp'
            });

            var configuracionKiosko = form_fe.addField({
                id:'custpage_efx_fe_kiosko_config',
                type: serverWidget.FieldType.SELECT,
                label: 'Configuración de Kiosko',
                source: 'customrecord_efx_kiosko_config',
                container:'subtabid_kiosko'
            });

            var itemNCKiosko = form_fe.addField({
                id:'custpage_efx_fe_nc_kiosko_item',
                type: serverWidget.FieldType.SELECT,
                label: 'Articulo NC Kiosko',
                source: 'item',
                container:'subtabid_kiosko'
            });

            var idregistro = form_fe.addField({
                id:'custpage_efx_fe_internalid',
                type: serverWidget.FieldType.TEXT,
                label: 'ID Interno',
                container:'subtabid_fe'
            });

            var folderTimbrado = form_fe.addField({
                id:'custpage_efx_fe_folder_certify',
                type: serverWidget.FieldType.SELECT,
                label: 'Folder de Timbrado',
                container:'subtabid_fe'
            });

            folderTimbrado.setHelpText({
                help : "Selecciona la carpeta donde se guardarán los archivos de timbrado (XML y PDF)."
            });

            var folderFvalidadas = form_fe.addField({
                id:'custpage_efx_fe_id_carpeta_valida_xml',
                type: serverWidget.FieldType.SELECT,
                label: 'Carpeta de Facturas Validadas',
                container:'subtabid_validaxml'
            });

            var validaXmlUrl = form_fe.addField({
                id:'custpage_efx_fe_url_valida_xml',
                type: serverWidget.FieldType.SELECT,
                label: 'URL VALIDAR XML',
                source: 'customrecord_efx_fe_mtd_envio',
                container:'subtabid_validaxml'
            });

            if(folders.length>0){
                folderTimbrado.addSelectOption({
                    value : '',
                    text : ''
                });
                folderPproveedores.addSelectOption({
                    value : '',
                    text : ''
                });
                folderFvalidadas.addSelectOption({
                    value : '',
                    text : ''
                });
                for(var i=0;i<folders.length;i++){
                    folderTimbrado.addSelectOption({
                        value : folders[i].value,
                        text : folders[i].text
                    });
                    folderPproveedores.addSelectOption({
                        value : folders[i].value,
                        text : folders[i].text
                    });
                    folderFvalidadas.addSelectOption({
                        value : folders[i].value,
                        text : folders[i].text
                    });
                }
            }else{
                folderTimbrado.addSelectOption({
                    value : '',
                    text : ''
                });

                folderPproveedores.addSelectOption({
                    value : '',
                    text : ''
                });
                folderFvalidadas.addSelectOption({
                    value : '',
                    text : ''
                });
            }

            var versionFE = form_fe.addField({
                id:'custpage_efx_fe_version',
                type: serverWidget.FieldType.SELECT,
                label: 'Versión de Facturación',
                source: 'customlist_efx_fe_version',
                container:'subtabid_fe'
            });

            versionFE.defaultValue = 1;

            versionFE.setHelpText({
                help : "Selecciona la versión de facturación para el timbrado."
            });

            var itemAjusteTimbrado = form_fe.addField({
                id:'custpage_efx_fe_adjust_cert',
                type: serverWidget.FieldType.SELECT,
                label: 'Articulo Ajuste Timbrado',
                source: 'item',
                container:'subtabid_fe'
            });

            itemAjusteTimbrado.setHelpText({
                help : "Selecciona la versión de facturación para el timbrado."
            });

            var regeneraPdf = form_fe.addField({
                id:'custpage_efx_fe_regenerar_pdf',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Regenerar PDF',
                container:'subtabid_fe'
                
            });
            regeneraPdf.setHelpText({
                help : "Esta casilla habilita el botón de regeneración de PDF de timbrado en las transacciones"
            });

            var desglosarGrupoArticulos = form_fe.addField({
                id:'custpage_efx_fe_desglosaart',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Desglosar Grupo de Artículos',
                container:'subtabid_fe'

            });
            desglosarGrupoArticulos.setHelpText({
                help : "Habilita que en el XML se desglosen los articulos pertenecientes al grupo como si fueran un concepto"
            });


            var asuntoCorreo = form_fe.addField({
                id:'custpage_efx_fe_mail_subject',
                type: serverWidget.FieldType.TEXT,
                label: 'Asunto de Correo',
                container:'subtabid_fe'
                
            });
            asuntoCorreo.setHelpText({
                help : "Ingresa el titulo del correo electrónico que se enviará con los archivos de timbrado. (Para indicar algun campo existente en el cuerpo de la transaccion este debe ir entre los simbolos <> ejemplo: <tranid>)"
            });

            var cuerpoCorreo = form_fe.addField({
                id:'custpage_efx_fe_mail_body',
                type: serverWidget.FieldType.RICHTEXT,
                label: 'Cuerpo de Correo',
                container:'subtabid_fe'
                
            });
            cuerpoCorreo.setHelpText({
                help : "(Para indicar algun campo existente en el cuerpo de la transaccion este debe ir entre los simbolos {} ejemplo: {tranid}"
            });


            var autorCorreo = form_fe.addField({
                id:'custpage_efx_fe_mail_sender',
                type: serverWidget.FieldType.SELECT,
                label: 'Autor de Correo',
                source: 'employee',
                container:'subtabid_fe'
            });

            autorCorreo.setHelpText({
                help : "Selecciona un empleado el cual servirá como emisor de correos automáticos en el sistema para la facturación (Debe ser un empleado activo)"
            });
            var envioAutoCorreo = form_fe.addField({
                id:'custpage_efx_fe_autosendmail',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Envio de Correo Automático',
                container:'subtabid_fe'
            });

            envioAutoCorreo.setHelpText({
                help : "Esta casilla habilita el envio de correos de forma automática para el timbrado, después de timbrar."
            });
            var fechaTimbradoPago = form_fe.addField({
                id:'custpage_efx_fe_date_payment',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Fecha Actual Timbrado Pagos',
                container:'subtabid_fe'
            });
            fechaTimbradoPago.setHelpText({
                help : "Si esta casilla está marcada, nos timbrará el xml de pagos con la fecha del día"
            });

            var fechaTimbradoIngreso = form_fe.addField({
                id:'custpage_efx_fe_date_invoice',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Fecha Actual Timbrado',
                container:'subtabid_fe'
            });
            fechaTimbradoIngreso.setHelpText({
                help : "Si esta casilla está marcada, nos timbrará el xml de ingresos, egresos y traslado con la fecha del día"
            });
            
            var conexionPac = form_fe.addField({
                id:'custpage_efx_fe_connect_pac_data',
                type: serverWidget.FieldType.SELECT,
                label: 'Datos de conexión PAC',
                source: 'customrecord_efx_fe_mtd_envio',
                container:'subtabid_fe'
            });
            conexionPac.setHelpText({
                help : "Este campo apunta al registro EFX FE - Método de Envío, en el cual se configura la conexión al PAC para la cancelación"
            });


            var itemImpuestoLocal = form_fe.addField({
                id:'custpage_efx_fe_item_imp_loc',
                type: serverWidget.FieldType.SELECT,
                label: 'Articulo Impuesto Local',
                source: 'item',
                container:'subtabid_fe'
            });

            itemImpuestoLocal.setHelpText({
                help : "Selecciona un artículo que para añadir en la sublista de articulos de la transacción para que sirva como articulo para monto de impuesto local"
            });

            var autoTimbradoOwner = form_fe.addField({
                id:'custpage_efx_fe_owner_certify',
                type: serverWidget.FieldType.SELECT,
                label: 'Propiertario Timbrado Automatico',
                source: 'employee',
                container:'subtabid_fe'
            });

            autoTimbradoOwner.setHelpText({
                help : "Selecciona un empleado el cual servirá como para la generación de registros en el sistema para la facturación (Debe ser un empleado activo)"
            });



            var usaPlantillaUbicacion = form_fe.addField({
                id:'custpage_efx_pp_location_template',
                type: serverWidget.FieldType.CHECKBOX,
                label: 'Utilizar Plantilla en Ubicacion',
                container:'subtabid_pp'
            });

            var plantillaInboundPortal = form_fe.addField({
                id:'custpage_efx_pp_template_inbounding',
                type: serverWidget.FieldType.SELECT,
                label: 'Plantilla Inbounding Portal',
                source: 'customrecord_psg_ei_template',
                container:'subtabid_pp'
            });

            var plantillaValidaPortal = form_fe.addField({
                id:'custpage_efx_pp_validate_template',
                type: serverWidget.FieldType.SELECT,
                label: 'Plantilla PDF Validaciones Portal',
                source: 'pdftemplates',
                container:'subtabid_pp'
            });

            var configPortalProveedores = form_fe.addField({
                id:'custpage_efx_pp_portal_config',
                type: serverWidget.FieldType.SELECT,
                label: 'Configuración Portal de Proveedores',
                source: 'customrecordefx_pp_vendor_pconfig',
                container:'subtabid_pp'
            });


            var configFacturaGlobal = form_fe.addField({
                id:'custpage_efx_fe_gbl_config',
                type: serverWidget.FieldType.SELECT,
                label: 'Configuración Factura Global',
                source: 'customrecord_efx_fe_facturaglobal_setup',
                container:'subtabid_fg'
            });

            if(objColumnas.estado=='existe'){
                idregistro.defaultValue = objColumnas.internalid;
                folderTimbrado.defaultValue = objColumnas.custrecord_efx_fe_configura_folder;
                versionFE.defaultValue = objColumnas.custrecord_efx_fe_version;
                itemAjusteTimbrado.defaultValue = objColumnas.custrecord_efx_fe_adjust_cert;
                regeneraPdf.defaultValue = objColumnas.custrecord_efx_fe_regenerar_pdf;
                desglosarGrupoArticulos.defaultValue = objColumnas.custrecord_efx_fe_desglosaart;
                asuntoCorreo.defaultValue = objColumnas.custrecord_efx_fe_mail_subject;
                cuerpoCorreo.defaultValue = objColumnas.custrecord_efx_fe_mail_body;
                autorCorreo.defaultValue = objColumnas.custrecord_efx_fe_mail_sender;
                envioAutoCorreo.defaultValue = objColumnas.custrecord_efx_fe_autosendmail;
                fechaTimbradoPago.defaultValue = objColumnas.custrecord_efx_fe_date_payment;
                fechaTimbradoIngreso.defaultValue = objColumnas.custrecord_efx_fe_date_invoice;
                conexionPac.defaultValue = objColumnas.custrecord_efx_fe_connect_pac_data;
                itemImpuestoLocal.defaultValue = objColumnas.custrecord_efx_fe_item_imp_loc;
                autoTimbradoOwner.defaultValue = objColumnas.custrecord_efx_fe_owner_certify;
                folderPproveedores.defaultValue = objColumnas.custrecord_efx_pp_portal;
                usaPlantillaUbicacion.defaultValue = objColumnas.custrecord_efx_pp_location_template;
                plantillaInboundPortal.defaultValue = objColumnas.custrecord_efx_pp_template_inbounding;
                plantillaValidaPortal.defaultValue = objColumnas.custrecord_efx_pp_validate_template;
                configPortalProveedores.defaultValue = objColumnas.custrecord_efx_pp_portal_config;
                configFacturaGlobal.defaultValue = objColumnas.custrecord_efx_fe_gbl_config;
                configuracionKiosko.defaultValue = objColumnas.custrecord_efx_fe_kiosko_config;
                itemNCKiosko.defaultValue = objColumnas.custrecord_efx_fe_nc_kiosko_item;
                folderFvalidadas.defaultValue = objColumnas.custrecord_efx_fe_id_carpeta_valida_xml;
                validaXmlUrl.defaultValue = objColumnas.custrecord_efx_fe_url_valida_xml;
            }

            return form_fe;

        }

        const buscaFolder = () =>{
            
            var arrayCarpetas = new Array();

            var buscaFolder = search.create({
                type:search.Type.FOLDER,
                filters:[['isinactive',search.Operator.IS,'F']],
                columns:[
                    search.createColumn({name:'internalid'}),
                    search.createColumn({name:'name'}),
                    search.createColumn({name:'parent'}),
                ]
            });

            buscaFolder.run().each(function (resultado){
                var carpetas = {
                    value:'',
                    text:''
                };
                carpetas.value = resultado.getValue({name:'internalid'});
                var parentFolder = '';
                if(resultado.getText({name:'parent'})){
                    parentFolder = resultado.getText({name:'parent'});
                }else{
                    parentFolder = 'Raiz';
                }

                carpetas.text = parentFolder + ': ' +resultado.getValue({name:'name'});

                arrayCarpetas.push(carpetas);
                return true;
            });

            log.audit({title:'arrayCarpetas',details:arrayCarpetas});
            return arrayCarpetas;

        }
        return {onRequest}

    });
