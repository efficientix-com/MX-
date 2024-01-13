/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/search', 'N/ui/serverWidget', 'N/runtime', 'N/config', 'N/format', 'N/file', 'N/url', 'N/https', 'N/xml', 'N/encode', 'N/render', 'N/task', 'N/redirect'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{serverWidget} serverWidget
     */
    (record, search, serverWidget, runtime, config, format, file, url, https, xml, encode, render, task, redirect) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (context) => {

            log.audit({ title: 'context.body', details: context.request.body });
            log.audit({ title: 'context.parameters', details: context.request.parameters });
            var generaXML_id = context.request.body;
            try {
                var tipoobj = JSON.parse(generaXML_id);
            } catch (error_parse) {
                log.audit({ title: 'error_parse', details: error_parse });
                var tipoobj = generaXML_id;
            }

            log.audit({ title: 'typeof tipoobj', details: typeof tipoobj });

            //var generaXML_id = context.request.parameters.to_send;
            //var generaXML_id = '';
            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
            var LOCATIONS = runtime.isFeatureInEffect({ feature: "LOCATIONS" });
            var DEPARTMENTS = runtime.isFeatureInEffect({ feature: "DEPARTMENTS" });
            var CLASSES = runtime.isFeatureInEffect({ feature: "CLASSES" });
            //            log.audit({title:'generaXML_id',details:generaXML_id});
            if (typeof tipoobj != 'object') {

                var filtros = {
                    customer: '',
                    moneda: '',
                    subsidiary: '',
                    location: '',
                    class: '',
                    department: '',
                    startdate: '',
                    enddate: '',
                    index: '',
                    idtransacciones: '',
                    fpago: '',
                    forma_global: ''

                };

                var scriptObj = runtime.getCurrentScript();
                var GBL_Config = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_config' });
                var pageresults = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_pageresults' });
                if (pageresults) {
                    if (pageresults < 100) {
                        pageresults = 100;
                    }
                } else {
                    pageresults = 100;
                }
                var record_setup = record.load({
                    type: 'customrecord_efx_fe_facturaglobal_setup',
                    id: GBL_Config
                });
                var setup_entity = record_setup.getValue({ fieldId: 'custrecord_efx_fe_gbl_entity' });

                //valida si viene con parametros para filtros
                if (context.request.parameters != null) {
                    var parametros = context.request.parameters;
                    filtros.customer = parametros.custpage_efx_customer;
                    filtros.moneda = parametros.custpage_efx_currency;
                    filtros.subsidiary = parametros.custpage_efx_subsidiary;
                    filtros.location = parametros.custpage_efx_loc_field;
                    filtros.class = parametros.custpage_efx_class_field;
                    filtros.fpago = parametros.custpage_efx_forma_field;
                    filtros.department = parametros.custpage_efx_dep_field;
                    filtros.startdate = parametros.custpage_efx_start_date;
                    filtros.enddate = parametros.custpage_efx_end_date;
                    filtros.tipo_transaccion = parametros.custpage_efx_ttransact;
                    filtros.tipo_gbl = parametros.custpage_efx_tipogbl;
                    filtros.index = parametros.custpage_efx_page;
                    filtros.total_lineas = parametros.custpage_efx_totalsel;
                    filtros.forma_global = parametros.custpage_efx_tipogbl;
                    filtros.periodicidad = parametros.custpage_efx_periodi;
                    filtros.meses = parametros.custpage_efx_meses;
                    filtros.forma_pago = parametros.custpage_efx_fpago;
                    if (parametros.custpage_efx_idtransactions != "[]" && parametros.custpage_efx_idtransactions != 0) {
                        filtros.idtransacciones = parametros.custpage_efx_idtransactions;
                    }

                    log.audit({ title: 'filtros', details: filtros });
                }

                //si viene con cliente en parametros realiza la busqueda de transacciones, sino solo muestra interfaz
                if ((filtros.customer || setup_entity) && filtros.moneda) {
                    var filtros_busqueda = createFilters(filtros, SUBSIDIARIES, LOCATIONS, DEPARTMENTS, CLASSES);

                    log.audit({ title: 'filtros_busqueda', details: filtros_busqueda });

                    var search_invoices = search.create({
                        type: search.Type.TRANSACTION,
                        filters: filtros_busqueda,
                        columns: [
                            search.createColumn({ name: 'tranid', sort: search.Sort.ASC }),
                            search.createColumn({ name: 'trandate' }),
                            search.createColumn({ name: 'internalid' }),
                            search.createColumn({ name: 'total' }),
                            search.createColumn({ name: 'location' }),
                            search.createColumn({ name: 'taxtotal' }),
                            search.createColumn({ name: 'entity' }),
                            search.createColumn({ name: 'custbody_mx_txn_sat_payment_method' }),
                        ],
                        settings: [
                            search.createSetting({
                                name: 'consolidationtype',
                                value: 'NONE'
                            })]
                    });
                    var ejecutar_invoices = search_invoices.runPaged().count;
                    //var resultado_invoices = ejecutar_invoices.getRange(0, 1000);
                    var paginado_invoices = search_invoices.runPaged({
                        pageSize: pageresults
                    });

                }


                //se agrega estructura con campos
                var form = serverWidget.createForm({ title: 'Facturación Global' });

                form.clientScriptModulePath = './EFX_FE_Global_Interface_CS.js';

                form.addSubmitButton({
                    //id: 'buttonid_efx_filtrar',
                    label: 'Filtrar',
                    //functionName: 'filtrado'
                });


                form.addButton({
                    id: 'buttonid_efx_generar',
                    label: 'Generar',
                    functionName: 'generar'
                });

                var fieldgroup_principal = form.addFieldGroup({
                    id: 'fieldgroupid_principal',
                    label: 'Filtros'
                });

                var tipogbl_field = form.addField({
                    id: 'custpage_efx_tipogbl',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Tipo Factura Global',
                    container: 'fieldgroupid_principal'
                });

                tipogbl_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });
                tipogbl_field.isMandatory = true;

                var valorTgbl = new Array();
                var textoTgbl = new Array();
                valorTgbl.push('');
                textoTgbl.push('');
                valorTgbl.push(1);
                textoTgbl.push('Factura Consolidada');
                valorTgbl.push(2);
                textoTgbl.push('Factura Global');

                for (var t = 0; t < valorTgbl.length; t++) {
                    tipogbl_field.addSelectOption({
                        value: valorTgbl[t],
                        text: textoTgbl[t]
                    });
                }

                if ((filtros.customer || setup_entity) && filtros.moneda) {

                    if (filtros.tipo_gbl) {
                        tipogbl_field.defaultValue = filtros.tipo_gbl;
                    }
                }

                var customer_field = form.addField({
                    id: 'custpage_efx_customer',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Cliente',
                    source: 'customer',
                    container: 'fieldgroupid_principal'
                });

                var currency_field = form.addField({
                    id: 'custpage_efx_currency',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Moneda',
                    source: 'currency',
                    container: 'fieldgroupid_principal'
                });

                var ttransaction_field = form.addField({
                    id: 'custpage_efx_ttransact',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Tipo de Transaccion',
                    container: 'fieldgroupid_principal'
                });

                // customer_field.isMandatory = true;
                ttransaction_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });
                ttransaction_field.isMandatory = true;

                var valorTtran = new Array();
                var textoTtran = new Array();
                valorTtran.push('');
                textoTtran.push('');
                valorTtran.push(1);
                textoTtran.push('Facturas');
                valorTtran.push(2);
                textoTtran.push('Venta en Efectivo');
                valorTtran.push(3);
                textoTtran.push('Ambas');
                for (var t = 0; t < valorTtran.length; t++) {
                    ttransaction_field.addSelectOption({
                        value: valorTtran[t],
                        text: textoTtran[t]
                    });
                }

                if ((filtros.customer || setup_entity) && filtros.moneda) {

                    if (filtros.tipo_transaccion) {
                        ttransaction_field.defaultValue = filtros.tipo_transaccion;
                    }
                }

                customer_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });

                currency_field.isMandatory = true;
                currency_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });


                tipogbl_field.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });


                var start_date = form.addField({
                    id: 'custpage_efx_start_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha de Inicio',
                    container: 'fieldgroupid_principal'
                });

                //si la instancia cuenta con subsidiarias agrega el campo

                if (SUBSIDIARIES) {
                    var subsidiary_s_field = form.addField({
                        id: 'custpage_efx_subsidiary',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Subsidiaria',
                        source: 'subsidiary',
                        container: 'fieldgroupid_principal'
                    });

                    subsidiary_s_field.isMandatory = true;
                    subsidiary_s_field.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.NORMAL
                    });
                }
                if (CLASSES) {
                    var class_s_field = form.addField({
                        id: 'custpage_efx_class_field',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Clase',
                        source: 'class',
                        container: 'fieldgroupid_principal'
                    });


                    class_s_field.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.NORMAL
                    });

                }

                var forma_s_field = form.addField({
                    id: 'custpage_efx_forma_field',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Forma de Pago Filtro',
                    container: 'fieldgroupid_principal'
                });


                forma_s_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });

                var obj_formadepago = {
                    valor: [],
                    texto: []
                };
                obj_formadepago = getDataFormaPago(obj_formadepago);
                for (var x = 0; x < obj_formadepago.valor.length; x++) {
                    forma_s_field.addSelectOption({
                        value: obj_formadepago.valor[x],
                        text: obj_formadepago.texto[x]
                    });

                }

                start_date.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });

                var end_date = form.addField({
                    id: 'custpage_efx_end_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha Final',
                    container: 'fieldgroupid_principal'
                });

                if (LOCATIONS) {
                    var location_s_field = form.addField({
                        id: 'custpage_efx_loc_field',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Ubicacion',
                        source: 'location',
                        container: 'fieldgroupid_principal'
                    });


                    location_s_field.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.NORMAL
                    });
                }
                if (DEPARTMENTS) {
                    var department_s_field = form.addField({
                        id: 'custpage_efx_dep_field',
                        type: serverWidget.FieldType.SELECT,
                        label: 'Departamento',
                        source: 'department',
                        container: 'fieldgroupid_principal'
                    });


                    department_s_field.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.NORMAL
                    });
                }

                end_date.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });


                var idtransactionsf = form.addField({
                    id: 'custpage_efx_idtransactions',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'ID Transacciones',
                    container: 'fieldgroupid_principal'
                });

                idtransactionsf.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                if (filtros.idtransacciones && filtros.idtransacciones != "[]" && filtros.idtransacciones != 0) {
                    idtransactionsf.defaultValue = filtros.idtransacciones;
                } else {
                    idtransactionsf.defaultValue = "[]";
                }



                var fieldgroup_llenado = form.addFieldGroup({
                    id: 'fieldgroupid_llenado',
                    label: 'Datos Requeridos'
                });

                // var ubicacion_field = form.addField({
                //     id: 'custpage_efx_location',
                //     type: serverWidget.FieldType.SELECT,
                //     label: 'Ubicación',
                //     source: 'location',
                //     container: 'fieldgroupid_llenado'
                // });
                //
                // ubicacion_field.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.NORMAL
                // });
                var tipofac_field = form.addField({
                    id: 'custpage_efx_tipofac',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Tipo de Factura',
                    source: 'customlist_efx_fe_gbl_tipo',
                    container: 'fieldgroupid_llenado'
                });

                tipofac_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });


                var fieldgroup_periodicidad = form.addFieldGroup({
                    id: 'fieldgroupid_periodicidad',
                    label: 'Periodicidad'
                });

                var periodicidad_field = form.addField({
                    id: 'custpage_efx_periodi',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Periodicidad',
                    source: 'customlist_efx_fe_cat_periodicidad',
                    container: 'fieldgroupid_periodicidad'
                });
                periodicidad_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });
                var meses_field = form.addField({
                    id: 'custpage_efx_meses',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customlist_efx_fe_cat_meses',
                    label: 'Meses',
                    container: 'fieldgroupid_periodicidad'
                });
                meses_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });

                // var anio_field = form.addField({
                //     id: 'custpage_efx_anio',
                //     type: serverWidget.FieldType.TEXT,
                //     label: 'Año',
                //     container : 'fieldgroupid_periodicidad'
                // });
                // anio_field.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.DISABLED
                // });


                var fieldgroup_emisor = form.addFieldGroup({
                    id: 'fieldgroupid_emisor',
                    label: 'Emisor'
                });

                var emisorEmp = form.addField({
                    id: 'custpage_efx_emisor',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Emisor',
                    container: 'fieldgroupid_emisor'
                });

                emisorEmp.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var rfcEmisor = form.addField({
                    id: 'custpage_efx_rfcemisor',
                    type: serverWidget.FieldType.TEXT,
                    label: 'RFC Emisor',
                    container: 'fieldgroupid_emisor'
                });

                rfcEmisor.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var regimenfiscal = form.addField({
                    id: 'custpage_efx_regfiscal',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Regimen Fiscal',
                    container: 'fieldgroupid_emisor'
                });

                regimenfiscal.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var lugarExpedicion = form.addField({
                    id: 'custpage_efx_lexpedicion',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Lugar de Expedicion',
                    container: 'fieldgroupid_emisor'
                });

                lugarExpedicion.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });



                var dirEmisorObjeto = form.addField({
                    id: 'custpage_efx_diremisorobj',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'Dirección Emisor Objeto',
                    container: 'fieldgroupid_emisor'
                });

                dirEmisorObjeto.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });


                var fieldgroup_receptor = form.addFieldGroup({
                    id: 'fieldgroupid_receptor',
                    label: 'Receptor'
                });

                var receptorEmp_cli = form.addField({
                    id: 'custpage_efx_receptor_c',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Cliente',
                    source: 'customer',
                    container: 'fieldgroupid_receptor'
                });
                receptorEmp_cli.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var receptorEmp = form.addField({
                    id: 'custpage_efx_receptor',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Receptor',
                    container: 'fieldgroupid_receptor'
                });

                receptorEmp.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var receptorRfc = form.addField({
                    id: 'custpage_efx_receptor_rfc',
                    type: serverWidget.FieldType.TEXT,
                    label: 'RFC Receptor',
                    container: 'fieldgroupid_receptor'
                });

                receptorRfc.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var dirEmisor = form.addField({
                    id: 'custpage_efx_direceptor',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Dirección receptor',
                    container: 'fieldgroupid_receptor'
                });

                dirEmisor.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                //datos extra
                var fieldgroup_bank = form.addFieldGroup({
                    id: 'fieldgroupid_bank',
                    label: 'Datos Adicionales'
                });

                var mpagofield = form.addField({
                    id: 'custpage_efx_mpago',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customrecord_mx_sat_payment_term',
                    label: 'Método de Pago',
                    container: 'fieldgroupid_llenado'
                });

                mpagofield.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });

                var fpagofield = form.addField({
                    id: 'custpage_efx_fpago',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Forma de Pago',
                    //source:'customrecord_mx_mapper_values',
                    container: 'fieldgroupid_llenado'
                });

                fpagofield.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });

                var usocfdi_field = form.addField({
                    id: 'custpage_efx_usocfdi',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customrecord_mx_sat_cfdi_usage',
                    label: 'Uso del CFDI',
                    container: 'fieldgroupid_llenado'
                });

                usocfdi_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });


                var fechaFactura_field = form.addField({
                    id: 'custpage_efx_invdate',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha para la Factura',
                    container: 'fieldgroupid_llenado'
                });

                fechaFactura_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });
                fechaFactura_field.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });
                var description_field = form.addField({
                    id: 'custpage_efx_description',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'Descripción Concepto Global',
                    container: 'fieldgroupid_llenado'
                });

                description_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });

                var direccionselect_field = form.addField({
                    id: 'custpage_efx_seldir',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Cambia Dirección Receptor',
                    container: 'fieldgroupid_llenado'
                });

                description_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });



                var contactmail_field = form.addField({
                    id: 'custpage_efx_mailcont',
                    type: serverWidget.FieldType.MULTISELECT,
                    source: 'contact',
                    label: 'Contactos Mail',
                    container: 'fieldgroupid_llenado'
                });

                contactmail_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });
                contactmail_field.updateBreakType({ breakType: serverWidget.FieldBreakType.STARTCOL });



                // var direccionfield = form.addField({
                //     id: 'custpage_efx_rfcorden',
                //     type: serverWidget.FieldType.TEXT,
                //     label: 'Dirección',
                //     container : 'fieldgroupid_bank'
                // });
                //
                // direccionfield.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.NORMAL
                // });

                var memofield = form.addField({
                    id: 'custpage_efx_memofield',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: 'Memo',
                    container: 'fieldgroupid_llenado'
                });

                memofield.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });

                var donativofield = form.addField({
                    id: 'custpage_efx_donfield',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Donativo',
                    container: 'fieldgroupid_llenado'
                });

                donativofield.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });


                var page_field = form.addField({
                    id: 'custpage_efx_page',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Pagina',
                    //  container : 'fieldgroupid_principal'
                });
                var montototal_field = form.addField({
                    id: 'custpage_efx_totalsel',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Total de Facturas',
                    //  container : 'fieldgroupid_principal'
                });

                montototal_field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                if (filtros.total_lineas && filtros.total_lineas != "0.00" && filtros.total_lineas != 0) {
                    montototal_field.defaultValue = filtros.total_lineas;
                } else {
                    montototal_field.defaultValue = "0.00";
                }
                //se agregan campos de sublista


                var sublist_payments = form.addSublist({
                    id: 'custpage_efx_transactions',
                    label: 'Transacciones',
                    type: serverWidget.SublistType.LIST
                });

                //sublist_payments.addMarkAllButtons();


                var marcatodo = true;
                var desmarcatodo = false;
                sublist_payments.addButton({
                    id: 'buttonid_efx_markall',
                    label: 'Marcar Todo',
                    functionName: 'marcar(' + marcatodo + ')'
                }); sublist_payments.addButton({
                    id: 'buttonid_efx_unmarkall',
                    label: 'Desmarcar Todo',
                    functionName: 'marcar(' + desmarcatodo + ')'
                });

                sublist_payments.addField({
                    id: 'custpage_efx_select',
                    label: 'Select',
                    type: serverWidget.FieldType.CHECKBOX
                });


                var subfield_idInterno = sublist_payments.addField({
                    id: 'custpage_efx_internalid',
                    label: 'ID Interno',
                    type: serverWidget.FieldType.TEXT,
                });

                subfield_idInterno.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var subfield_nodumento = sublist_payments.addField({
                    id: 'custpage_efx_nodocumento',
                    label: 'No. de Documento',
                    type: serverWidget.FieldType.TEXT,
                });

                subfield_nodumento.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var subfield_amount = sublist_payments.addField({
                    id: 'custpage_efx_amount',
                    label: 'Monto Total',
                    type: serverWidget.FieldType.TEXT,
                });

                subfield_amount.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var subfield_taxamount = sublist_payments.addField({
                    id: 'custpage_efx_taxamount',
                    label: 'Monto Impuesto',
                    type: serverWidget.FieldType.TEXT,
                });

                subfield_taxamount.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                var subfield_cliente = sublist_payments.addField({
                    id: 'custpage_efx_cliente',
                    label: 'Cliente',
                    type: serverWidget.FieldType.TEXT,
                });

                subfield_cliente.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                var subfield_date = sublist_payments.addField({
                    id: 'custpage_efx_date',
                    label: 'Fecha',
                    type: serverWidget.FieldType.DATE,
                });

                subfield_date.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                //inicia llenado de datos
                var arrayIdDirecciones = new Array();
                if ((filtros.customer || setup_entity) && filtros.moneda) {

                    if (filtros.customer && filtros.tipo_gbl == '1') {
                        customer_field.defaultValue = filtros.customer;
                        receptorEmp_cli.defaultValue = filtros.customer;
                        var objCliente = record.load({
                            type: record.Type.CUSTOMER,
                            id: filtros.customer
                        });
                        var numLines = objCliente.getLineCount({
                            sublistId: 'addressbook'
                        });

                        arrayIdDirecciones.push({ idDireccion: '', textoDireccion: '', etiquetaDireccion: '', zipDireccion: '' });
                        for (var i = 0; i < numLines; i++) {
                            var objDirecciones = {
                                idDireccion: '',
                                textoDireccion: '',
                                etiquetaDireccion: '',
                                zipDireccion: ''
                            }

                            objDirecciones.idDireccion = objCliente.getSublistValue({
                                sublistId: 'addressbook',
                                fieldId: 'internalid',
                                line: i
                            });
                            objDirecciones.textoDireccion = objCliente.getSublistValue({
                                sublistId: 'addressbook',
                                fieldId: 'addressbookaddress_text',
                                line: i
                            });
                            objDirecciones.etiquetaDireccion = objCliente.getSublistValue({
                                sublistId: 'addressbook',
                                fieldId: 'label',
                                line: i
                            }) || 'Sin nombre';

                            objDirecciones.zipDireccion = objCliente.getSublistValue({
                                sublistId: 'addressbook',
                                fieldId: 'zip_initialvalue',
                                line: i
                            });
                            arrayIdDirecciones.push(objDirecciones);
                        }

                        // for (var ad = 0; ad < arrayIdDirecciones.length; ad++) {
                        //     direccionselect_field.addSelectOption({
                        //         value: arrayIdDirecciones[ad].idDireccion,
                        //         text: arrayIdDirecciones[ad].etiquetaDireccion
                        //     });
                        //
                        // }
                        //
                        // dirEmisorObjeto.defaultValue = JSON.stringify(arrayIdDirecciones);

                    } else {
                        if (filtros.customer && filtros.tipo_gbl == '1') {
                            receptorEmp_cli.defaultValue = filtros.customer;
                            customer_field.defaultValue = filtros.customer;

                            var objCliente = record.load({
                                type: record.Type.CUSTOMER,
                                id: filtros.customer
                            });
                            var numLines = objCliente.getLineCount({
                                sublistId: 'addressbook'
                            });

                            arrayIdDirecciones.push({ idDireccion: '', textoDireccion: '', etiquetaDireccion: '', zipDireccion: '' });
                            for (var i = 0; i < numLines; i++) {
                                var objDirecciones = {
                                    idDireccion: '',
                                    textoDireccion: '',
                                    etiquetaDireccion: '',
                                    zipDireccion: ''
                                }

                                objDirecciones.idDireccion = objCliente.getSublistValue({
                                    sublistId: 'addressbook',
                                    fieldId: 'internalid',
                                    line: i
                                });
                                objDirecciones.textoDireccion = objCliente.getSublistValue({
                                    sublistId: 'addressbook',
                                    fieldId: 'addressbookaddress_text',
                                    line: i
                                });
                                objDirecciones.etiquetaDireccion = objCliente.getSublistValue({
                                    sublistId: 'addressbook',
                                    fieldId: 'label',
                                    line: i
                                }) || 'Sin nombre';

                                objDirecciones.zipDireccion = objCliente.getSublistValue({
                                    sublistId: 'addressbook',
                                    fieldId: 'zip_initialvalue',
                                    line: i
                                });
                                arrayIdDirecciones.push(objDirecciones);
                            }
                        } else {
                            receptorEmp_cli.defaultValue = setup_entity;
                            if (filtros.customer) {
                                customer_field.defaultValue = filtros.customer;
                                var objCliente = record.load({
                                    type: record.Type.CUSTOMER,
                                    id: filtros.customer
                                });
                                var numLines = objCliente.getLineCount({
                                    sublistId: 'addressbook'
                                });

                                arrayIdDirecciones.push({ idDireccion: '', textoDireccion: '', etiquetaDireccion: '', zipDireccion: '' });
                                for (var i = 0; i < numLines; i++) {
                                    var objDirecciones = {
                                        idDireccion: '',
                                        textoDireccion: '',
                                        etiquetaDireccion: '',
                                        zipDireccion: ''
                                    }

                                    objDirecciones.idDireccion = objCliente.getSublistValue({
                                        sublistId: 'addressbook',
                                        fieldId: 'internalid',
                                        line: i
                                    });
                                    objDirecciones.textoDireccion = objCliente.getSublistValue({
                                        sublistId: 'addressbook',
                                        fieldId: 'addressbookaddress_text',
                                        line: i
                                    });
                                    objDirecciones.etiquetaDireccion = objCliente.getSublistValue({
                                        sublistId: 'addressbook',
                                        fieldId: 'label',
                                        line: i
                                    }) || 'Sin nombre';

                                    objDirecciones.zipDireccion = objCliente.getSublistValue({
                                        sublistId: 'addressbook',
                                        fieldId: 'zip_initialvalue',
                                        line: i
                                    });
                                    arrayIdDirecciones.push(objDirecciones);
                                }
                            }

                        }
                    }

                    forma_s_field.defaultValue = filtros.fpago;
                    currency_field.defaultValue = filtros.moneda;
                    if (SUBSIDIARIES) {
                        subsidiary_s_field.defaultValue = filtros.subsidiary;
                    } if (LOCATIONS) {
                        location_s_field.defaultValue = filtros.location;
                    } if (CLASSES) {
                        class_s_field.defaultValue = filtros.class;
                    } if (DEPARTMENTS) {
                        department_s_field.defaultValue = filtros.department;
                    }


                    var obj_formadepago = {
                        valor: [],
                        texto: []
                    };
                    obj_formadepago = getDataFormaPago(obj_formadepago);



                    // var search_list_error = search.create({
                    //     type: 'customrecord_mx_mapper_values',
                    //     filters: [['isinactive', search.Operator.IS, 'F']],
                    //     columns: [
                    //         search.createColumn({name: 'name'}),
                    //         search.createColumn({name: 'internalid'}),
                    //         search.createColumn({name: 'custrecord_mx_mapper_value_category'}),
                    //         search.createColumn({name: 'custrecord_mx_mapper_value_inreport'})
                    //     ]
                    // });
                    // //
                    // var ejecutar_list_error = search_list_error.run();
                    // var resultado_list_error = ejecutar_list_error.getRange(0, 100);



                    // valor.push('0');
                    // texto.push('');
                    // for (var x = 0; x < resultado_list_error.length; x++) { //Add list of page to field
                    //     var categoria = resultado_list_error[x].getValue({name: 'custrecord_mx_mapper_value_category'});
                    //
                    //     if (categoria == 6) {
                    //         valor.push(resultado_list_error[x].getValue({name: 'internalid'}));
                    //         texto.push(resultado_list_error[x].getValue({name: 'name'}));
                    //
                    //
                    //         log.audit({title: 'name', details: resultado_list_error[x].getValue({name: 'name'})});
                    //         log.audit({
                    //             title: 'custrecord_mx_mapper_value_category',
                    //             details: resultado_list_error[x].getValue({name: 'custrecord_mx_mapper_value_category'})
                    //         });
                    //         log.audit({
                    //             title: 'custrecord_mx_mapper_value_inreport',
                    //             details: resultado_list_error[x].getValue({name: 'custrecord_mx_mapper_value_inreport'})
                    //         });
                    //     }
                    // }
                    //
                    //agregar campos no encontrados





                    for (var x = 0; x < obj_formadepago.valor.length; x++) {
                        fpagofield.addSelectOption({
                            value: obj_formadepago.valor[x],
                            text: obj_formadepago.texto[x]
                        });

                    }


                    if (filtros.customer) {
                        var customer_info = record.load({
                            type: record.Type.CUSTOMER,
                            id: filtros.customer
                        });
                    } else {
                        var customer_info = record.load({
                            type: record.Type.CUSTOMER,
                            id: setup_entity
                        });
                    }


                    mpagofield.defaultValue = customer_info.getValue({ fieldId: 'custentity_efx_mx_payment_term' });
                    fpagofield.defaultValue = customer_info.getValue({ fieldId: 'custentity_efx_mx_payment_method' });
                    usocfdi_field.defaultValue = customer_info.getValue({ fieldId: 'custentity_efx_mx_cfdi_usage' });
                    contactmail_field.defaultValue = customer_info.getValue({ fieldId: 'custentity_efx_fe_kiosko_contact' });




                    try {
                        if (filtros.startdate != '') {
                            start_date.defaultValue = filtros.startdate;
                        }

                        if (filtros.enddate != '') {
                            end_date.defaultValue = filtros.enddate;
                        } if (filtros.index != '') {
                            page_field.defaultValue = filtros.index;
                        }
                        if (filtros.periodicidad != '') {
                            periodicidad_field.defaultValue = filtros.periodicidad;
                        }
                        if (filtros.meses != '') {
                            meses_field.defaultValue = filtros.meses;
                        }
                    } catch (error) {
                        log.error({ title: 'Error al poner filtros', details: error });
                    }


                    var configRecObj = config.load({
                        type: config.Type.COMPANY_INFORMATION
                    });

                    if (filtros.customer) {
                        var customerObj = record.load({
                            type: record.Type.CUSTOMER,
                            id: filtros.customer
                        });
                    } else {
                        var customerObj = record.load({
                            type: record.Type.CUSTOMER,
                            id: setup_entity
                        });
                    }


                    if (SUBSIDIARIES) {

                        // var subsidiaria = customerObj.getValue({fieldId:'subsidiary'});
                        var subsidiaria = filtros.subsidiary;

                        var subsidiary_info = record.load({
                            type: record.Type.SUBSIDIARY,
                            id: subsidiaria
                        });

                        var lugarexpLocation = '';

                        if (filtros.location) {
                            var location_info = record.load({
                                type: record.Type.LOCATION,
                                id: filtros.location
                            });
                            var mainaddressOBJLocation = location_info.getSubrecord({ fieldId: 'mainaddress' });
                            lugarexpLocation = mainaddressOBJLocation.getValue({ fieldId: 'zip' });
                        }

                        //log.audit({ title: 'subsidiary_info.custrecord_mx_sat_industry_type: ', details: subsidiary_info.custrecord_mx_sat_industry_type });
                        //var regObj = subsidiary_info.custrecord_mx_sat_industry_type[0].text;
                        var regObj = subsidiary_info.getText({ fieldId: 'custrecord_mx_sat_industry_type' });
                        var mainaddressOBJ = subsidiary_info.getSubrecord({ fieldId: 'mainaddress' });


                        var regimenarr = regObj.split('-');
                        var regimenFiscalData = regimenarr[0].trim();
                        regimenfiscal.defaultValue = regimenFiscalData;
                        if (lugarexpLocation) {
                            lugarExpedicion.defaultValue = lugarexpLocation;
                        } else {
                            lugarExpedicion.defaultValue = mainaddressOBJ.getValue({ fieldId: 'zip' });
                        }

                        var zip = mainaddressOBJ.getValue({ fieldId: 'zip' });
                        var calle = mainaddressOBJ.getValue({ fieldId: 'custrecord_streetname' });
                        var colonia = mainaddressOBJ.getValue({ fieldId: 'custrecord_colonia' });
                        var ciudad = mainaddressOBJ.getValue({ fieldId: 'city' });
                        var idDirsub = mainaddressOBJ.getValue({ fieldId: 'internalid' });

                        dirEmisor.defaultValue = calle + ', ' + colonia + ', ' + ciudad + ', ' + zip;
                        emisorEmp.defaultValue = subsidiary_info.getValue({ fieldId: 'legalname' });
                        rfcEmisor.defaultValue = subsidiary_info.getValue({ fieldId: 'federalidnumber' });
                        arrayIdDirecciones.push({ idDireccion: 'idsub', textoDireccion: (calle + ', ' + colonia + ', ' + ciudad + ', ' + zip), etiquetaDireccion: 'Subsidiaria', zipDireccion: zip });

                    } else {
                        var rfiscal = configRecObj.getText({
                            fieldId: 'custrecord_mx_sat_industry_type'
                        });

                        var lugarexpLocation = '';

                        if (filtros.location) {
                            var location_info = record.load({
                                type: record.Type.LOCATION,
                                id: filtros.location
                            });
                            var mainaddressOBJLocation = location_info.getSubrecord({ fieldId: 'mainaddress' });
                            lugarexpLocation = mainaddressOBJLocation.getValue({ fieldId: 'zip' });
                        }

                        var regimenarr = rfiscal.split('-');
                        var regimenFiscalData = regimenarr[0].trim();
                        regimenfiscal.defaultValue = regimenFiscalData;
                        var mainaddressOBJ = configRecObj.getSubrecord({ fieldId: 'mainaddress' });
                        if (lugarexpLocation) {
                            lugarExpedicion.defaultValue = lugarexpLocation;
                        } else {
                            lugarExpedicion.defaultValue = mainaddressOBJ.getValue({ fieldId: 'zip' });
                        }
                        var zip = mainaddressOBJ.getValue({ fieldId: 'zip' });
                        var calle = mainaddressOBJ.getValue({ fieldId: 'custrecord_streetname' });
                        var colonia = mainaddressOBJ.getValue({ fieldId: 'custrecord_colonia' });
                        var ciudad = mainaddressOBJ.getValue({ fieldId: 'city' });
                        var idDirsub = mainaddressOBJ.getValue({ fieldId: 'internalid' });
                        dirEmisor.defaultValue = calle + ', ' + colonia + ', ' + ciudad + ', ' + zip;
                        emisorEmp.defaultValue = configRecObj.getValue({ fieldId: 'legalname' });
                        rfcEmisor.defaultValue = configRecObj.getValue({ fieldId: 'employerid' });
                        arrayIdDirecciones.push({ idDireccion: idDirsub, textoDireccion: (calle + ', ' + colonia + ', ' + ciudad + ', ' + zip), etiquetaDireccion: 'Subsidiaria', zipDireccion: zip });



                    }

                    if (filtros.customer) {
                        for (var ad = 0; ad < arrayIdDirecciones.length; ad++) {
                            direccionselect_field.addSelectOption({
                                value: arrayIdDirecciones[ad].idDireccion,
                                text: arrayIdDirecciones[ad].etiquetaDireccion
                            });

                        }

                        dirEmisorObjeto.defaultValue = JSON.stringify(arrayIdDirecciones);
                    }



                    var razon_social_cliente = customerObj.getValue({ fieldId: 'custentity_efx_razonsocialcliente' });
                    if (razon_social_cliente) {
                        receptorEmp.defaultValue = customerObj.getValue({ fieldId: 'custentity_efx_razonsocialcliente' });
                    } else {
                        receptorEmp.defaultValue = customerObj.getValue({ fieldId: 'companyname' });
                    }

                    receptorRfc.defaultValue = customerObj.getValue({ fieldId: 'custentity_mx_rfc' });

                    log.audit({ title: 'ejecutar_invoices', details: ejecutar_invoices });
                    if (ejecutar_invoices > 0) {

                        var pageIndex = (context.request.parameters.custpage_efx_page) ? context.request.parameters.custpage_efx_page : 0;
                        if ((filtros.startdate != '' || filtros.enddate != '') && paginado_invoices.count <= 100) {
                            pageIndex = 0;
                        }
                        page_field.defaultValue = pageIndex;
                        var objectResult = [];
                        var pageData = paginado_invoices.fetch({ index: pageIndex });
                        paginado_invoices.pageRanges.forEach(function (pageRange) {
                            log.audit("pageRange", pageRange);
                            var cort = pageRange.compoundLabel;
                            var splitcort = cort.split('—');
                            log.audit("splitcort", splitcort);
                            objectResult.push({ index: pageRange.index, text: "Pagina " + (pageRange.index + 1) });
                        });


                        for (var i = 0; i < objectResult.length; i++) {
                            var page = objectResult[i];
                            page_field.addSelectOption({
                                value: page.index,
                                text: page.text
                            });
                        }



                        log.audit("pageData", pageData);
                        //var i = 0;
                        //var resultado_invoices = {};
                        //pageData.data.forEach(function (result) {
                        //resultado_invoices = result;

                        // for(var i=0;i<resultado_invoices.length;i++) {
                        var lineasi = 0;
                        pageData.data.forEach(function (result) {
                            log.audit({ title: 'Resultado', details: result });
                            var tranid = result.getValue({ name: 'tranid' }) || '';
                            var idInterno = result.getValue({ name: 'internalid' }) || '';
                            var cliente = result.getText({ name: 'entity' }) || '';

                            if (filtros.idtransacciones || filtros.idtransacciones == "[]") {
                                var idtransaccionesfor = JSON.parse(filtros.idtransacciones);
                                for (var i = 0; i < idtransaccionesfor.length; i++) {
                                    if (idInterno == idtransaccionesfor[i]) {
                                        sublist_payments.setSublistValue({
                                            id: 'custpage_efx_select',
                                            line: lineasi,
                                            value: 'T'
                                        });
                                    }
                                }
                            }

                            sublist_payments.setSublistValue({
                                id: 'custpage_efx_nodocumento',
                                line: lineasi,
                                value: tranid || "-"
                            });

                            sublist_payments.setSublistValue({
                                id: 'custpage_efx_internalid',
                                line: lineasi,
                                value: idInterno
                            });

                            sublist_payments.setSublistValue({
                                id: 'custpage_efx_cliente',
                                line: lineasi,
                                value: cliente
                            });

                            var amount_total = result.getValue({ name: 'total' }) || '';
                            var taxamount_total = result.getValue({ name: 'taxtotal' }) || '';

                            // if (taxamount_total == '.00') {
                            //     taxamount_total = '0.00';
                            // }

                            if (taxamount_total.charAt(0) == '.') {
                                taxamount_total = '0' + taxamount_total;
                            }

                            if (amount_total.charAt(0) == '.') {
                                amount_total = '0' + amount_total;
                            }



                            sublist_payments.setSublistValue({
                                id: 'custpage_efx_amount',
                                line: lineasi,
                                value: amount_total
                            });

                            sublist_payments.setSublistValue({
                                id: 'custpage_efx_taxamount',
                                line: lineasi,
                                value: taxamount_total
                            });

                            sublist_payments.setSublistValue({
                                id: 'custpage_efx_date',
                                line: lineasi,
                                value: result.getValue({ name: 'trandate' })
                            });

                            //i++;

                            //});
                            lineasi++;
                            return true;
                        });

                    }


                }

                context.response.writePage(form);
            } else {

                var objResponse = {
                    id: '',
                    createdby: '',
                    idrecord: ''
                }

                var objTransacciones = JSON.parse(generaXML_id);
                log.audit({ title: 'objTransacciones', details: objTransacciones });


                var relatedgbl = record.create({
                    type: 'customrecord_efx_fe_gbl_records'
                });

                //relatedgbl.setValue({fieldId:'custrecord_efx_fe_taskid',value:mrTaskId});
                var idrec_rel = relatedgbl.save();

                objTransacciones.idrecord = idrec_rel;


                for (var i = 1; i <= 10; i++) {
                    var scriptdeploy_id = 'customdeploy_efx_fe_create_global_mr' + i;
                    log.debug('scriptdeploy_id', scriptdeploy_id);

                    var mrTask = task.create({ taskType: task.TaskType.MAP_REDUCE });
                    mrTask.scriptId = 'customscript_efx_fe_create_global_mr';
                    mrTask.deploymentId = scriptdeploy_id;
                    mrTask.params = { custscript_efx_fe_gbl_idtrans: JSON.stringify(objTransacciones) };

                    try {
                        var mrTaskId = mrTask.submit();
                        log.debug("scriptTaskId tarea ejecutada", mrTaskId);
                        log.audit("Tarea ejecutada", mrTaskId);
                        break;
                    }
                    catch (e) {
                        log.debug({ title: "error", details: e });
                        log.error("summarize", "Aún esta corriendo el deployment: " + scriptdeploy_id);
                    }
                }


                record.submitFields({
                    type: 'customrecord_efx_fe_gbl_records',
                    id: idrec_rel,
                    values: {
                        custrecord_efx_fe_taskid: mrTaskId,

                    }
                });

                var usercreator = runtime.getCurrentUser();

                objResponse.id = mrTaskId;
                objResponse.createdby = usercreator.id;
                objResponse.idrecord = idrec_rel;

                context.response.write({
                    output: JSON.stringify(objResponse)
                });

            }

        }

        function createFilters(filtros, SUBSIDIARIES, LOCATIONS, DEPARTMENTS, CLASSES) {


            var array_filtros = new Array();
            var array_subs = new Array();


            array_filtros = [
                ['mainline', search.Operator.IS, 'T']
                , 'AND',
                ['custbody_efx_fe_gbl_ismirror', search.Operator.IS, 'F']
                , 'AND',
                ['custbody_efx_fe_invoice_related', search.Operator.ANYOF, '@NONE@']
                , 'AND',
                [
                    [
                        ['custbody_efx_fe_gbl_related', search.Operator.ANYOF, '@NONE@']
                        , 'AND',
                        ['custbody_mx_cfdi_uuid', search.Operator.ISEMPTY, '']
                        , 'AND',
                        ['custbody_psg_ei_certified_edoc', search.Operator.IS, '@NONE@']
                    ]
                    , "OR",
                    [
                        ["custbody_efx_fe_gbl_related.custbody_efx_fe_cfdi_cancelled", "is", "T"]
                        , "AND",
                        ["custbody_efx_fe_gbl_related.mainline", "is", "T"]
                    ]
                ]
                , 'AND',
                ['currency', search.Operator.ANYOF, filtros.moneda]
                , 'AND',
                ["amount", "greaterthan", 0]
            ];
            if (filtros.tipo_transaccion == 3 || !filtros.tipo_transaccion) {
                array_filtros.push('AND');
                array_filtros.push(['type', search.Operator.ANYOF, 'CustInvc', 'CashSale']);
            }
            if (filtros.tipo_transaccion == 2) {
                array_filtros.push('AND');
                array_filtros.push(['type', search.Operator.ANYOF, 'CashSale']);
            }
            if (filtros.tipo_transaccion == 1) {
                array_filtros.push('AND');
                array_filtros.push(['type', search.Operator.ANYOF, 'CustInvc']);
            }
            if (filtros.customer && filtros.tipo_gbl == 1) {
                array_filtros.push('AND');
                array_filtros.push(['entity', search.Operator.ANYOF, filtros.customer]);
            }
            if (SUBSIDIARIES) {
                array_filtros.push('AND');
                array_filtros.push(['subsidiary', search.Operator.ANYOF, filtros.subsidiary]);
            } if (LOCATIONS && filtros.location) {
                array_filtros.push('AND');
                array_filtros.push(['location', search.Operator.ANYOF, filtros.location]);
            } if (DEPARTMENTS && filtros.department) {
                array_filtros.push('AND');
                array_filtros.push(['department', search.Operator.ANYOF, filtros.department]);
            } if (CLASSES && filtros.class) {
                array_filtros.push('AND');
                array_filtros.push(['class', search.Operator.ANYOF, filtros.class]);
            }


            if (filtros.fpago) {
                array_filtros.push('AND');
                array_filtros.push(['custbody_mx_txn_sat_payment_method', search.Operator.ANYOF, filtros.fpago]);
            }
            if (filtros.startdate && filtros.enddate) {
                array_filtros.push('AND');
                array_filtros.push(['trandate', search.Operator.WITHIN, filtros.startdate, filtros.enddate]);
            }

            if (filtros.startdate && !filtros.enddate) {
                array_filtros.push('AND');
                array_filtros.push(['trandate', search.Operator.ONORAFTER, filtros.startdate]);
            }

            if (!filtros.startdate && filtros.enddate) {
                array_filtros.push('AND');
                array_filtros.push(['trandate', search.Operator.ONORBEFORE, filtros.enddate]);
            }


            return array_filtros;

        }

        function getDataFormaPago(obj_formadepago) {

            var valor = new Array();
            var texto = new Array();

            valor.push('');
            texto.push('');
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

            obj_formadepago.valor = valor;
            obj_formadepago.texto = texto;

            return obj_formadepago;

        }



        return { onRequest }

    });