/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search','N/url','N/https','N/runtime','N/format','N/task'],
    /**
 * @param{record} record
 * @param{search} search
 */
    (record, search,url,https,runtime,format,task) => {
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
        var array_maps = new Array();
        var conteoBusqueda = 0;
        const getInputData = (inputContext) => {
            var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
            try {
                //Obtener Info de parametros
                var scriptObj = runtime.getCurrentScript();
                var GBL_Config = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_config' });
                var jsonGBL_param = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_obj_json' });
                var transacciones_obj = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_idtrans' });
                var fechainicio = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_startdate' });
                var fechafin = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_enddate' });
                var periodicidadgbl = scriptObj.getParameter({ name: 'custscript_efx_fe_periodicidad_gbl' });
                var mesesgbl = scriptObj.getParameter({ name: 'custscript_efx_fe_meses_gbl' });
                // var fechaParaFactura = scriptObj.getParameter({ name: 'custscript_efx_fe_trandate' });
                var ubicacion = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_location' });
                var record_setup = record.load({
                    type:'customrecord_efx_fe_facturaglobal_setup',
                    id:GBL_Config
                });
                var jsonGBL = '';
                if(jsonGBL_param){
                    jsonGBL = JSON.parse(jsonGBL_param);
                }

                var filtros_ad = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_filters'});
                log.audit({title:'filtros_ad',details:filtros_ad});
                if(filtros_ad){
                    var filtros_adicionales = JSON.parse(filtros_ad);
                    log.audit({title:'filtros_adicionales',details:filtros_adicionales});
                }


                var filtros_busqueda = new Array();

                if(transacciones_obj) {
                    var transacciones_parsed = JSON.parse(transacciones_obj);
                    var transacciones = transacciones_parsed.ids;
                }
                //var idrecordGBL = transacciones_parsed.idrecord;

                if(transacciones){
                    filtros_busqueda.push(['type', search.Operator.ANYOF, 'CustInvc','CashSale']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['mainline', search.Operator.IS,'T']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_efx_fe_gbl_ismirror', search.Operator.IS,'F']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_efx_fe_gbl_related', search.Operator.ANYOF,'@NONE@']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_efx_fe_invoice_related', search.Operator.ANYOF,'@NONE@']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_mx_cfdi_uuid', search.Operator.ISEMPTY,'']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_psg_ei_certified_edoc', search.Operator.IS,'@NONE@']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['internalid', search.Operator.ANYOF, transacciones]);
                }

                if(fechainicio && fechafin && ubicacion){
                    filtros_busqueda.push(['type', search.Operator.ANYOF, 'CustInvc','CashSale']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['mainline', search.Operator.IS,'T']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_efx_fe_gbl_ismirror', search.Operator.IS,'F']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_efx_fe_gbl_related', search.Operator.ANYOF,'@NONE@']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_efx_fe_invoice_related', search.Operator.ANYOF,'@NONE@']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_mx_cfdi_uuid', search.Operator.ISEMPTY,'']);
                    filtros_busqueda.push('AND');
                    filtros_busqueda.push(['custbody_psg_ei_certified_edoc', search.Operator.IS,'@NONE@']);
                    filtros_busqueda.push('AND');
                    // filtros_busqueda.push(['trandate', search.Operator.WITHIN, fechainicio,fechafin]);
                    // filtros_busqueda.push('AND');
                    if(jsonGBL){
                        log.audit({title:'jsonGBL',details:jsonGBL});
                        filtros_busqueda.push(['trandate', search.Operator.ONORAFTER, jsonGBL.startdate]);
                        filtros_busqueda.push('AND');
                        filtros_busqueda.push(['trandate', search.Operator.ONORBEFORE, jsonGBL.finishdate]);
                        filtros_busqueda.push('AND');
                    }else {
                        filtros_busqueda.push(['trandate', search.Operator.ONORAFTER, fechainicio]);
                        filtros_busqueda.push('AND');
                        filtros_busqueda.push(['trandate', search.Operator.ONORBEFORE, fechafin]);
                        filtros_busqueda.push('AND');
                    }
                    filtros_busqueda.push(['location', search.Operator.ANYOF,ubicacion]);

                    /*filtros_busqueda.push('AND');
                    filtros_busqueda.push(['trandate', search.Operator.ONORBEFORE, '03/02/2021']);*/
                }

                if(filtros_ad){
                    for(var x=0;x<(filtros_adicionales.filtro).length;x++){
                        filtros_busqueda.push(filtros_adicionales.filtro[x]);
                    }
                }

                log.audit({title:'filtros_busqueda',details:filtros_busqueda});

                if(filtros_busqueda.length>0){
                    log.audit({title:'entra',details:'entra'});
                    if(existeSuiteTax){
                        var busqueda_facturas = search.create({
                            type: search.Type.TRANSACTION,
                            filters: filtros_busqueda,
                            columns: [
                                search.createColumn({name:'tranid'}),
                                search.createColumn({name:'total'}),
                                search.createColumn({name:'location'}),
                                search.createColumn({name:'custbody_efx_fe_tax_json'}),
                                search.createColumn({name:'type'}),
                                search.createColumn({name:'currency'}),
                                search.createColumn({name:'internalid'}),
                                search.createColumn({name: "formulanumeric", formula: "rownum",sort: search.Sort.ASC}),

                            ],
                            settings: [
                                search.createSetting({
                                    name: 'consolidationtype',
                                    value: 'NONE'
                                })]
                        });
                    }else{

                        var busqueda_facturas = search.create({
                            type: search.Type.TRANSACTION,
                            filters: filtros_busqueda,
                            columns: [
                                search.createColumn({name:'tranid'}),
                                search.createColumn({name:'netamountnotax'}),
                                search.createColumn({name:'taxtotal'}),
                                search.createColumn({name:'total'}),
                                search.createColumn({name:'location'}),
                                search.createColumn({name:'custbody_efx_fe_tax_json'}),
                                search.createColumn({name:'type'}),
                                search.createColumn({name:'currency'}),
                                search.createColumn({name:'internalid'}),
                                search.createColumn({name: "formulanumeric", formula: "rownum",sort: search.Sort.ASC}),

                            ],
                            settings: [
                                search.createSetting({
                                    name: 'consolidationtype',
                                    value: 'NONE'
                                })]
                        });
                    }

                }else{

                    var busqueda_facturas = search.load({ id: 'customsearch_efx_fe_global_search' });
                }

                // log.audit({title: 'busqueda_facturas', details: busqueda_facturas});
                // conteoBusqueda = busqueda_facturas.runPaged().count;
                //
                //
                // log.audit({title: 'conteoBusqueda', details: conteoBusqueda});


                //crear GBL

                var scriptObj = runtime.getCurrentScript();
                var numfacts = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_numfact' });
                log.audit({title:'numfacts',details:numfacts});
                var fechainicio = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_startdate' });
                //configuración de factura global
                var GBL_Config = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_config' });
                var transacciones_obj = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_idtrans' });
                var record_setup = record.load({
                    type:'customrecord_efx_fe_facturaglobal_setup',
                    id:GBL_Config
                });
                var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });

                var setup_metodo = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_envio'});
                var articulo_envio = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_senditem'});


                log.audit({title:'record_setup',details:record_setup});
                log.audit({title:'setup_metodo',details:setup_metodo});
                log.audit({title:'articulo_envio',details:articulo_envio});
                var formulario_gbl = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_form'});

                var setup_metodo_origen = '';
                var setup_forma_origen = '';
                var setup_usocfdi_origen = '';
                if(!transacciones_obj) {
                    setup_metodo_origen = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_methodorigin'});
                    setup_forma_origen = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_payorigin'});
                    setup_usocfdi_origen = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_cfdiorigin'});
                }

                //si viene de web service se usa este parametro
                var ubicacion = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_location' });
                var subsidiaria = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_subsidiary' });
                var tipofact_record = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_type' });
                //este parametro solo llega de interfaz

                var idrecordGBL = '';
                var subsidiaria_gbl = '';
                var ubicacion_gbl = '';
                var department_gbl = '';
                var class_gbl = '';
                var tipo_factura_gbl = '';
                var contactos_mail = '';
                var descripcion_gbl = '';
                var satPaymentTerm = '';
                var fechaParaFactura = '';
                var periodicidad = '';
                var meses = '';
                var cfdiUsage = '';
                var satPaymentMethod = '';
                var memoGlobal = '';
                var setup_entity = '';
                var setup_entity_sucursal = '';
                var forma_global = '';
                var moneda = '';
                var direccionemisor = '';
                var lugarexpedicion = '';
                var donativo = '';

                log.audit({title:'transacciones_obj',details:transacciones_obj});
                if(transacciones_obj) {
                    var transacciones_parsed = JSON.parse(transacciones_obj);
                    idrecordGBL = transacciones_parsed.idrecord;
                    subsidiaria_gbl = transacciones_parsed.subsidiary;
                    ubicacion_gbl = transacciones_parsed.location;
                    department_gbl = transacciones_parsed.department;
                    class_gbl = transacciones_parsed.class;
                    tipo_factura_gbl = transacciones_parsed.tipo_factura;
                    contactos_mail = transacciones_parsed.contactos;
                    descripcion_gbl = transacciones_parsed.descripcion;
                    satPaymentTerm = transacciones_parsed.m_pago;
                    cfdiUsage = transacciones_parsed.usocfdi;
                    satPaymentMethod = transacciones_parsed.f_pago;
                    memoGlobal = transacciones_parsed.memo;
                    donativo = transacciones_parsed.donativo;
                    setup_entity = transacciones_parsed.customer;
                    setup_entity_sucursal = transacciones_parsed.customerSucursal;
                    forma_global = transacciones_parsed.forma_global;
                    moneda = transacciones_parsed.moneda;
                    fechaParaFactura = transacciones_parsed.fechaparafactura;
                    periodicidad = transacciones_parsed.periodicidad;
                    meses = transacciones_parsed.meses;
                    direccionemisor = transacciones_parsed.direccionemisor;
                    lugarexpedicion = transacciones_parsed.lugarexpedicion;
                }
                log.audit({title:'contactos_mail',details:contactos_mail.length});

                if(contactos_mail.length > 0){
                    for(var y=0;y<contactos_mail.length;y++){
                        if(contactos_mail[y]==''){
                            log.audit({title:'elimina',details:contactos_mail[y]});
                            contactos_mail.splice(y, 1);
                        }
                    }
                }
                log.audit({title:'contactos_mail',details:contactos_mail});

                var objGlobal = {
                    idglobal:'',
                    foliogbl:'',
                    setup_metodo:'',
                    setup_plantilla:'',
                    setup_txcode:'',
                    setup_entity:'',
                    setup_entity_sucursal: '',
                    setup_item:''
                }

                //si no viene de interfaz toma el del registro de configuracion
                if(!tipo_factura_gbl) {
                    if(tipofact_record){
                        tipo_factura_gbl = tipofact_record;
                    }else{
                        tipo_factura_gbl = record_setup.getValue({fieldId: 'custrecord_efx_fe_transactiontype'});
                    }
                }else{
                    tipofact_record = tipo_factura_gbl;
                }
                var setup_plantilla = '';

                if(tipo_factura_gbl==1){
                    setup_plantilla = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_temp_at'});
                }
                if(tipo_factura_gbl==2){
                    setup_plantilla = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_temp_da'});
                }
                if(tipo_factura_gbl==4){
                    setup_plantilla = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_temp_ag'});
                }

                var setup_txcode = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_tax'});
                var clientesucursal = setup_entity_sucursal;

                if(!setup_entity) {
                    setup_entity = record_setup.getValue({fieldId: 'custrecord_efx_fe_gbl_entity'});
                }
                var setup_item = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_item'});
                log.audit({title:'setup_item',details:setup_item});
                log.audit({title:'setup_metodo',details:setup_metodo});
                log.audit({title:'setup_plantilla',details:setup_plantilla});
                log.audit({title:'setup_txcode',details:setup_txcode});
                log.audit({title:'setup_entity',details:setup_entity});

                var record_cliente = search.lookupFields({
                    type: record.Type.CUSTOMER,
                    id:setup_entity,
                    columns: ['custentity_efx_fe_send_cert_docs', 'custentity_efx_fe_kiosko_contact','custentity_edoc_gen_trans_pdf','custentity_efx_mx_payment_term','custentity_efx_mx_cfdi_usage','custentity_efx_mx_payment_method']
                });

                log.audit({title:'record_cliente',details:record_cliente});

                var arrayLineasnuevas = new Array();
                var envia_mail = record_cliente['custentity_efx_fe_send_cert_docs'];
                if(contactos_mail.length<0) {
                    log.audit({title:'contactos_mail_ent',details:contactos_mail});
                    contactos_mail = record_cliente['custentity_efx_fe_kiosko_contact'][0].value;
                }
                if(contactos_mail.length>0){
                    envia_mail = true;
                }
                var generaPDF = record_cliente['custentity_edoc_gen_trans_pdf'];

                var tax_total=0;

                var record_global = record.create({
                    type: 'customsale_efx_fe_factura_global',
                    isDynamic: false
                });


                record_global.setValue({
                    fieldId: 'entity',
                    value: setup_entity
                });

                if(clientesucursal){
                    record_global.setValue({
                        fieldId: 'custbody_efx_fe_gbl_clientesucursal',
                        value: clientesucursal
                    });
                }
                
                if(donativo){
                    record_global.setValue({
                        fieldId: 'custbody_efx_fe_donativo',
                        value: true
                    });
                }
                /*record_global.setValue({
                    fieldId: 'custbody_efx_fe_info_location_pdf',
                    value: true
                });*/
                var anios = '';
                if(fechaParaFactura){
                    log.audit({title:'fechaParaFactura',details:fechaParaFactura.toString()});
                    var soloFecha = fechaParaFactura.split("T");
                    var fechaSeparada = soloFecha[0].split('-');
                    log.audit({title:'fechaSeparada',details:fechaSeparada});
                    anios = fechaSeparada[0];
                    var fechaform = new Date(fechaSeparada[0],(parseInt(fechaSeparada[1])-1),parseInt(fechaSeparada[2]));
                    log.audit({title:'fechaform',details:fechaform});
                    var formateada = format.parse({value:fechaform,type:format.Type.DATE});
                    log.audit({title:'formateada',details:formateada});
                    record_global.setValue({
                        fieldId: 'trandate',
                        value: formateada
                    });
                }else if(fechainicio){
                    log.audit({title:'fechainicio',details:fechainicio.toString()});
                    var formateada = format.parse({value:fechainicio,type:format.Type.DATE});
                    log.audit({title:'formateada',details:formateada});
                    record_global.setValue({
                        fieldId: 'trandate',
                        value: formateada
                    });
                }

                if(fechaParaFactura) {

                    record_global.setValue({
                        fieldId: 'custbody_efx_fe_actual_date',
                        value: false
                    });
                }else{
                    record_global.setValue({
                        fieldId: 'custbody_efx_fe_actual_date',
                        value: true
                    });
                }


                //solo por interfaz
                if(subsidiaria_gbl) {
                    record_global.setValue({
                        fieldId: 'subsidiary',
                        value: subsidiaria_gbl
                    });
                }
                if(subsidiaria) {
                    record_global.setValue({
                        fieldId: 'subsidiary',
                        value: subsidiaria
                    });
                }

                if(ubicacion_gbl){
                    record_global.setValue({
                        fieldId: 'location',
                        value: ubicacion_gbl
                    });
                }if(department_gbl){
                    record_global.setValue({
                        fieldId: 'department',
                        value: department_gbl
                    });
                }if(class_gbl){
                    record_global.setValue({
                        fieldId: 'class',
                        value: class_gbl
                    });
                }

                if(ubicacion){
                    record_global.setValue({
                        fieldId: 'location',
                        value: ubicacion
                    });
                }

                record_global.setValue({
                    fieldId: 'custbody_efx_fe_send_cert_docs',
                    value: envia_mail
                });

                if(forma_global!=1){
                    if(periodicidad){
                        record_global.setValue({
                        fieldId: 'custbody_efx_fe_periodicidad',
                        value: periodicidad
                    });
                    }else if(periodicidadgbl){
                        record_global.setValue({
                            fieldId: 'custbody_efx_fe_periodicidad',
                            value: periodicidadgbl
                        });
                    }

                    var fechaHoyMes = new Date();
                        var meshoy = fechaHoyMes.getMonth();
                        log.audit({title:'meshoy',details:meshoy});
                        

                        if(meshoy){
                            record_global.setValue({
                                fieldId: 'custbody_efx_fe_meses',
                                value: parseInt(meshoy)+1
                            });
                        }else{
                            if(meses){
                                record_global.setValue({
                                fieldId: 'custbody_efx_fe_meses',
                                value: meses
                            });
                            }else if(mesesgbl){
                                record_global.setValue({
                                    fieldId: 'custbody_efx_fe_meses',
                                    value: parseInt(mesesgbl)
                                });
                            }
                        }
                    

                    if(anios){
                        record_global.setValue({
                            fieldId: 'custbody_efx_fe_anio',
                            value: anios
                        });
                    }else{
                        var fechaHoy = new Date();
                        var aniohoy = fechaHoy.getFullYear();
                        log.audit({title:'aniohoy',details:aniohoy});
                        record_global.setValue({
                            fieldId: 'custbody_efx_fe_anio',
                            value: aniohoy
                        });

                    }
                }


                record_global.setValue({
                    fieldId: 'custbody_efx_fe_gbl_diremisor',
                    value: direccionemisor
                });
                record_global.setValue({
                    fieldId: 'custbody_efx_fe_gbl_lexpedicion',
                    value: lugarexpedicion
                });

                log.audit({title:'contactos_mail',details:contactos_mail});
                if(contactos_mail.length>0){
                    log.audit({title:'contactos_mail_ent',details:contactos_mail});
                    record_global.setValue({
                        fieldId: 'custbody_efx_fe_mail_to',
                        value: contactos_mail
                    });
                }


                record_global.setValue({
                    fieldId: 'custbody_edoc_gen_trans_pdf',
                    value: generaPDF
                    //value: false
                });

                record_global.setValue({
                    fieldId: 'custbody_efx_fe_gbl_envio',
                    value: setup_metodo
                });

                record_global.setValue({
                    fieldId: 'custbody_efx_fe_gbl_plantilla',
                    value: setup_plantilla
                });

                record_global.setValue({
                    fieldId: 'custbody_psg_ei_status',
                    value: 1
                });

                record_global.setValue({
                    fieldId: 'custbody_mx_txn_sat_payment_method',
                    value: satPaymentMethod
                });

                record_global.setValue({
                    fieldId: 'custbody_mx_cfdi_usage',
                    value: cfdiUsage
                });

                log.audit({title:'termino pago',details:satPaymentMethod});
                record_global.setValue({
                    fieldId: 'custbody_mx_txn_sat_payment_term',
                    value: satPaymentTerm
                });

                record_global.setValue({
                    fieldId: 'memo',
                    value: memoGlobal
                });


                record_global.setValue({
                    fieldId: 'custbody_efx_fe_gbl_type',
                    value: tipofact_record
                });

                record_global.setValue({
                    fieldId: 'currency',
                    value: moneda
                });
                if(existeSuiteTax){
                    record_global.setValue({
                        fieldId: 'taxpointdateoverride',
                        value: true
                    });
                }

//sublista
                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: 0,
                        value: setup_item
                    });

                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: 0,
                        value: 1
                    });
                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: 0,
                        value: 1
                    });
                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: 0,
                        value: 1
                    });


                try{
                    var id_global = record_global.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                }catch(guardagbl){
                    log.audit({title:'guardagbl',details:guardagbl});
                }

                log.audit({title:'id_global',details:id_global});
                if(id_global){

                    busqueda_facturas.columns.push(search.createColumn({name: "formulatext", formula: id_global}));
                    log.audit({title:'idrecordGBL',details:idrecordGBL});
                    if(idrecordGBL) {
                        record.submitFields({
                            type: 'customrecord_efx_fe_gbl_records',
                            id: idrecordGBL,
                            values: {
                                custrecord_efx_fe_gbl_global: id_global,

                            }
                        });
                    }


                    for(var i = 1; i <= 20; i++){
                        var scriptdeploy_id = 'customdeploy_efx_fe_createupdate_gbl' + i;
                        log.debug('scriptdeploy_id',scriptdeploy_id);

                        var mrTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                        mrTask.scriptId = 'customscript_efx_fe_createupdate_gbl';
                        mrTask.deploymentId = scriptdeploy_id;
                        mrTask.params = {custscript_efx_fe_createupdate_f: JSON.stringify(filtros_busqueda),custscript_efx_fe_createupdate_id:id_global};

                        try{
                            var mrTaskId = mrTask.submit();
                            log.debug("scriptTaskId tarea ejecutada", mrTaskId);
                            log.audit("Tarea ejecutada", mrTaskId);
                            break;
                        }
                        catch(e){
                            log.debug({title: "error", details: e});
                            log.error("summarize", "Aún esta corriendo el deployment: "+ scriptdeploy_id);
                        }
                    }

                    // busqueda_facturas.run().each(function(result){
                    //
                    //     var idfact = result.getValue({name:'internalid'});
                    //     var tipofact = result.getValue({name:'type'});
                    //     log.audit({title:'idfact',details:idfact});
                    //     log.audit({title:'tipofact',details:tipofact});
                    //     if (tipofact == 'CustInvc') {
                    //         tipofact = record.Type.INVOICE;
                    //     }
                    //
                    //     if (tipofact == 'CashSale') {
                    //         tipofact = record.Type.CASH_SALE;
                    //     }
                    //     if(idfact && tipofact){
                    //         try {
                    //             record.submitFields({
                    //                 type: tipofact,
                    //                 id: idfact,
                    //                 values: {
                    //                     custbody_efx_fe_gbl_related: id_global,
                    //                 }
                    //             });
                    //         }catch(error_actualizafacts){
                    //             log.audit({title: 'error_actualizafacts', details: error_actualizafacts});
                    //         }
                    //     }
                    //     return true;
                    // });
                }

                log.audit({title: 'busqueda_facturas', details: busqueda_facturas});

                return busqueda_facturas;

            }catch(error_busqueda){
                log.audit({title: 'error_busqueda', details: error_busqueda});
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
            try{

                log.audit({title:'map',details:JSON.parse(mapContext.value)});
                var datos = JSON.parse(mapContext.value);

                log.audit({title:'map - values',details:datos.values});


                //reduce

                var scriptObj = runtime.getCurrentScript();
                var numfacts = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_numfact' });
                log.audit({title:'numfacts',details:numfacts});
                var fechainicio = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_startdate' });
                //configuración de factura global
                var GBL_Config = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_config' });
                var transacciones_obj = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_idtrans' });
                var record_setup = record.load({
                    type:'customrecord_efx_fe_facturaglobal_setup',
                    id:GBL_Config
                });
                var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });

                var setup_metodo = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_envio'});
                var articulo_envio = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_senditem'});


                log.audit({title:'record_setup',details:record_setup});
                log.audit({title:'setup_metodo',details:setup_metodo});
                log.audit({title:'articulo_envio',details:articulo_envio});
                var formulario_gbl = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_form'});

                var setup_metodo_origen = '';
                var setup_forma_origen = '';
                var setup_usocfdi_origen = '';
                if(!transacciones_obj) {
                    setup_metodo_origen = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_methodorigin'});
                    setup_forma_origen = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_payorigin'});
                    setup_usocfdi_origen = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_cfdiorigin'});
                }

                //si viene de web service se usa este parametro
                var ubicacion = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_location' });
                var subsidiaria = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_subsidiary' });
                var tipofact_record = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_type' });
                //este parametro solo llega de interfaz

                var idrecordGBL = '';
                var subsidiaria_gbl = '';
                var ubicacion_gbl = '';
                var department_gbl = '';
                var class_gbl = '';
                var tipo_factura_gbl = '';
                var contactos_mail = '';
                var descripcion_gbl = '';
                var satPaymentTerm = '';
                var cfdiUsage = '';
                var satPaymentMethod = '';
                var memoGlobal = '';
                var setup_entity = '';
                var moneda = '';
                var fechaParaFactura = '';
                var donativo = '';

                log.audit({title:'transacciones_obj',details:transacciones_obj});
                if(transacciones_obj) {
                    var transacciones_parsed = JSON.parse(transacciones_obj);
                    idrecordGBL = transacciones_parsed.idrecord;
                    subsidiaria_gbl = transacciones_parsed.subsidiary;
                    ubicacion_gbl = transacciones_parsed.location;
                    department_gbl = transacciones_parsed.department;
                    class_gbl = transacciones_parsed.class;
                    tipo_factura_gbl = transacciones_parsed.tipo_factura;
                    contactos_mail = transacciones_parsed.contactos;
                    descripcion_gbl = transacciones_parsed.descripcion;
                    satPaymentTerm = transacciones_parsed.m_pago;
                    cfdiUsage = transacciones_parsed.usocfdi;
                    satPaymentMethod = transacciones_parsed.f_pago;
                    memoGlobal = transacciones_parsed.memo;
                    donativo = transacciones_parsed.donativo;
                    setup_entity = transacciones_parsed.customer;
                    moneda = transacciones_parsed.moneda;
                    fechaParaFactura = transacciones_parsed.fechaparafactura;
                }
                log.audit({title:'contactos_mail',details:contactos_mail.length});

                if(contactos_mail.length > 0){
                    for(var y=0;y<contactos_mail.length;y++){
                        if(contactos_mail[y]==''){
                            log.audit({title:'elimina',details:contactos_mail[y]});
                            contactos_mail.splice(y, 1);
                        }
                    }
                }
                log.audit({title:'contactos_mail',details:contactos_mail});

                var data_reduce = datos.values;
                log.audit({title:'data_reduce',details:data_reduce});

                var record_global = record.load({
                    type: 'customsale_efx_fe_factura_global',
                    id: data_reduce.formulatext
                });

                var objGlobal = {
                    idglobal:'',
                    foliogbl:'',
                    setup_metodo:'',
                    setup_plantilla:'',
                    setup_txcode:'',
                    setup_entity:'',
                    setup_item:''
                }


                //si no viene de interfaz toma el del registro de configuracion
                if(!tipo_factura_gbl) {
                    if(tipofact_record){
                        tipo_factura_gbl = tipofact_record;
                    }else{
                        tipo_factura_gbl = record_setup.getValue({fieldId: 'custrecord_efx_fe_transactiontype'});
                    }
                }else{
                    tipofact_record = tipo_factura_gbl;
                }

                var setup_txcode = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_tax'});

                var setup_item = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_item'});

                var arrayLineasnuevas = new Array();

                var tax_total=0;

                var tax_total = record_global.getValue({fieldId:'custbody_efx_fe_gbl_totaltax'});
                if(tax_total){
                    tax_total = parseFloat(tax_total);
                }else{
                    tax_total = 0;
                }

                if(!ubicacion && !ubicacion_gbl){
                    record_global.setValue({
                        fieldId: 'location',
                        value: data_reduce.location.value
                    });
                }

                var sub_total = record_global.getValue({fieldId:'custbody_efx_fe_gbl_subtotal'});
                if(sub_total){
                    sub_total = parseFloat(sub_total);
                }else{
                    sub_total = 0;
                }

                var objGBLglobal='';
                if(tipo_factura_gbl==4){
                    objGBLglobal = record_global.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_gbl_json',
                        line: 0,
                    });

                }


                if(objGBLglobal){

                    var objArticuloGBL=JSON.parse(objGBLglobal);
                }else{
                    var objArticuloGBL = {
                        ieps_total: 0,
                        iva_total: 0,
                        retencion_total: 0,
                        local_total: 0,
                        exento_total: 0,
                        monto_ieps_gbl:{},
                        monto_iva_gbl:{},
                        monto_ret_gbl:{},
                        monto_local_gbl:{},
                        monto_exento_gbl:{},
                        bases_ieps_gbl:{},
                        bases_iva_gbl:{},
                        bases_ret_gbl:{},
                        bases_local_gbl:{},
                        bases_exento_gbl:{},
                        monto_ieps:{},
                        monto_iva:{},
                        monto_ret:{},
                        monto_local:{},
                        monto_exento:{},
                        bases_ieps:{},
                        bases_iva:{},
                        bases_ret:{},
                        bases_local:{},
                        bases_exento:{},
                        descuentoConImpuesto:0,
                        descuentoSinImpuesto:0,
                        totalImpuestos:0,
                        subtotal:0,
                        total:0,
                        totalTraslados:0,
                        totalRetenciones:0,
                        diferenciaTotales:0,
                    }
                }

                var idsFacturasArray = new Array();
                var idsFacturasArray_rel = new Array();
                if(tipo_factura_gbl==4){
                    if(data_reduce.formulanumeric=="1"){
                        var total_artgbl = 0;
                        var netamountnotax_artgbl = 0;
                        var taxtotal_artgbl = 0;
                    }else{
                        var total_artgbl = parseFloat(record_global.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: 0,
                        }));
                        var netamountnotax_artgbl = parseFloat(record_global.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_subtotal_gbl',
                            line: 0,
                        }));
                        var taxtotal_artgbl = parseFloat(record_global.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_taxtotal_gbl',
                            line: 0,
                        }));
                    }
                }else{
                    var total_artgbl = 0;
                    var netamountnotax_artgbl = 0;
                    var taxtotal_artgbl = 0;
                }





//inserccion de datareduce por map
                    var objGlobalArray = {
                        id:'',
                        type:''
                    }

                    var idinterno = data_reduce.internalid;
                    var custbody_efx_fe_tax_json = data_reduce.custbody_efx_fe_tax_json;

                    if(custbody_efx_fe_tax_json) {

                        if(tipo_factura_gbl==4 || tipo_factura_gbl==1) {
                            var jsonParseado = JSON.parse(custbody_efx_fe_tax_json);
                            var total = parseFloat(jsonParseado.total_gbl);
                            var netamountnotax = parseFloat(jsonParseado.subtotal_gbl);
                            var descuentoconimp = parseFloat(jsonParseado.descuentoConImpuesto);
                            var descuentosinimp = parseFloat(jsonParseado.descuentoSinImpuesto);
                            var taxtotal = parseFloat(jsonParseado.totalImpuestos_gbl);

                            log.audit({title:'total',details:total});
                            log.audit({title:'total_artgbl',details:total_artgbl});
                            total_artgbl = total_artgbl+total;
                            netamountnotax_artgbl = netamountnotax_artgbl+netamountnotax;
                            taxtotal_artgbl = taxtotal_artgbl+taxtotal;

                        }else{
                            var jsonParseado = JSON.parse(custbody_efx_fe_tax_json);
                            var total = parseFloat(jsonParseado.total_gbl).toFixed(2);
                            var netamountnotax = parseFloat(jsonParseado.subtotal_gbl).toFixed(2);
                            var descuentoconimp = parseFloat(jsonParseado.descuentoConImpuesto);
                            var descuentosinimp = parseFloat(jsonParseado.descuentoSinImpuesto);
                            var taxtotal = parseFloat(jsonParseado.totalImpuestos_gbl).toFixed(2);

                            log.audit({title:'total',details:total});
                            log.audit({title:'total_artgbl',details:total_artgbl});
                            total_artgbl = parseFloat(total_artgbl)+parseFloat(total);
                            netamountnotax_artgbl = parseFloat(netamountnotax_artgbl)+parseFloat(netamountnotax);
                            taxtotal_artgbl = parseFloat(taxtotal_artgbl)+parseFloat(taxtotal);
                        }




                    }

                    var tipo_transaccion = '';
                    if (data_reduce.type.value == 'CustInvc') {
                        tipo_transaccion = record.Type.INVOICE;
                    }

                    if (data_reduce.type.value == 'CashSale') {
                        tipo_transaccion = record.Type.CASH_SALE;
                    }

                var linea_gbl = parseInt(data_reduce.formulanumeric) - 1;
                    var lineas_insertadas = record_global.getLineCount({sublistId: 'item'});
                    if(linea_gbl==0){
                        lineas_insertadas = 0;
                    }

                    if(tipo_factura_gbl==1) {


                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: lineas_insertadas,
                            value: setup_item
                        });

                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_gbl_related_tran',
                            line: lineas_insertadas,
                            value: idinterno.value
                        });

                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: lineas_insertadas,
                            value: 1
                        });
                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: lineas_insertadas,
                            value: total
                        });
                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: lineas_insertadas,
                            value: total
                        });

                        if(descripcion_gbl){
                            record_global.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'description',
                                line: lineas_insertadas,
                                value: descripcion_gbl
                            });
                        }

                        if(donativo){
                            record_global.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_mx_txn_line_sat_tax_object',
                                line: lineas_insertadas,
                                value: 1
                            });
                        }

                        if(!existeSuiteTax){
                            record_global.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                line: lineas_insertadas,
                                value: setup_txcode
                            });
                        }

                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_gbl_taxcode',
                            line: lineas_insertadas,
                            value: setup_txcode
                        });

                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_gbl_json',
                            line: lineas_insertadas,
                            value: custbody_efx_fe_tax_json
                        });
                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_subtotal_gbl',
                            line: lineas_insertadas,
                            value: netamountnotax
                        });
                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_efx_fe_taxtotal_gbl',
                            line: lineas_insertadas,
                            value: taxtotal
                        });


                        //Se agrega linea de costo de envio
                        if(articulo_envio){
                            lineas_insertadas=parseInt(lineas_insertadas)+1;
                            var objTran = record.load({
                                type:tipo_transaccion,
                                id:idinterno.value
                            });

                            var costo_envio = objTran.getValue({fieldId:'shippingcost'});

                            var line_countShipp = objTran.getLineCount({sublistId:'shipgroup'});

                            log.audit({title:'costo_envio',details:costo_envio});
                            log.audit({title:'articulo_envio',details:articulo_envio});

                            var arrayLineas = new Array();
                            if(costo_envio && costo_envio!=0){
                                var objLinea = {
                                    item:'',
                                    quantity:'',
                                    description:'',
                                    rate:'',
                                    amount:'',
                                    custcol_efx_fe_gbl_taxcode:'',
                                    custcol_mx_txn_line_sat_item_code:'',
                                    custcol_efx_fe_upc_code:'',
                                    custcol_efx_fe_tax_json:'',
                                    custcol_efx_fe_gbl_related_tran:'',
                                    custcol_efx_fe_taxtotal_gbl:'',
                                    custcol_efx_fe_gbl_sendtype:true,
                                    custcol_efx_fe_gbl_taxrateen:'',
                                };
                                if(line_countShipp>0){
                                    for(var arL=0;arL<line_countShipp;arL++){
                                        objLinea.item = articulo_envio;
                                        objLinea.quantity = 1;
                                        objLinea.description = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingmethod',line:0});
                                        objLinea.rate = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingrate',line:0});;
                                        objLinea.amount = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingrate',line:0});;
                                        objLinea.custcol_efx_fe_gbl_taxcode = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxcode',line:0});;
                                        objLinea.custcol_efx_fe_taxtotal_gbl = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxamt',line:0});;
                                        objLinea.custcol_efx_fe_gbl_taxrateen = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxrate',line:0});;
                                        objLinea.custcol_efx_fe_gbl_related_tran = idinterno.value;
                                        objLinea.custcol_efx_fe_gbl_sendtype = true;
                                        log.audit({title:'objLineaeenvio',details:objLinea});
                                        arrayLineas.push(objLinea);
                                    }
                                }else{
                                    objLinea.item = articulo_envio;
                                    objLinea.quantity = 1;
                                    objLinea.description = objTran.getText({fieldId:'shipmethod'});
                                    objLinea.rate = costo_envio;
                                    objLinea.amount = costo_envio;
                                    objLinea.custcol_efx_fe_gbl_taxcode = objTran.getValue({fieldId:'shippingtaxcode'});
                                    objLinea.custcol_efx_fe_taxtotal_gbl = objTran.getValue({fieldId:'shippingtax1amt'});
                                    objLinea.custcol_efx_fe_gbl_taxrateen = objTran.getValue({fieldId:'shippingtax1rate'});
                                    objLinea.custcol_efx_fe_gbl_related_tran = idinterno.value;
                                    objLinea.custcol_efx_fe_gbl_sendtype = true;
                                    log.audit({title:'objLineaeenvio',details:objLinea});
                                    arrayLineas.push(objLinea);
                                }
                                for(var a=0;a<arrayLineas.length;a++) {
                                    arrayLineasnuevas.push(arrayLineas[a]);
                                    if(arrayLineas[a].custcol_efx_fe_taxtotal_gbl){
                                        taxtotal = parseFloat(taxtotal)+parseFloat(arrayLineas[a].custcol_efx_fe_taxtotal_gbl);
                                    }
                                }

                                log.audit({title:'arrayLineasnuevas',details:arrayLineasnuevas});
                                for(var a=0;a<arrayLineasnuevas.length;a++) {
                                    var tam_keylines = Object.keys(arrayLineasnuevas[a]).length;
                                    log.audit({title:'tam_keylines',details:tam_keylines});
                                    for (var t = 0; t < tam_keylines; t++) {
                                            if (arrayLineasnuevas[a][Object.keys(arrayLineasnuevas[a])[t]]) {
                                            if(Object.keys(arrayLineasnuevas[a])[t]=="custcol_efx_fe_taxtotal_gbl"){
                                                tax_total = tax_total + parseFloat(arrayLineasnuevas[a][Object.keys(arrayLineasnuevas[a])[t]]);
                                                log.audit({title:'tax_total',details:tax_total});
                                            }
                                            if(Object.keys(arrayLineasnuevas[a])[t]=="amount"){
                                                if(arrayLineasnuevas[a].custcol_efx_fe_gbl_sendtype){
                                                    sub_total = sub_total + parseFloat(arrayLineasnuevas[a][Object.keys(arrayLineasnuevas[a])[t]]);
                                                    log.audit({title:'sub_total',details:sub_total});
                                                }
                                            }
                                            record_global.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: Object.keys(arrayLineasnuevas[a])[t],
                                                line: a+lineas_insertadas,
                                                value: arrayLineasnuevas[a][Object.keys(arrayLineasnuevas[a])[t]]
                                            });
                                        }
                                    }
                                }

                            }
                        }


                    }

                    if(tipo_factura_gbl==2) {
                        var objLineaGbl = obtenLineasGBL(idinterno.value,tipo_transaccion,existeSuiteTax,articulo_envio,setup_item,record_setup,donativo);
                        for(var a=0;a<objLineaGbl.length;a++) {
                            arrayLineasnuevas.push(objLineaGbl[a]);
                            if(objLineaGbl[a].custcol_efx_fe_taxtotal_gbl){
                                taxtotal = parseFloat(taxtotal)+parseFloat(objLineaGbl[a].custcol_efx_fe_taxtotal_gbl);
                            }
                        }
                    }

                    if(tipo_factura_gbl==4) {

                        objArticuloGBL = creaObjGlobal(objArticuloGBL,JSON.parse(custbody_efx_fe_tax_json),articulo_envio,idinterno.value,tipo_transaccion,donativo);

                    }

                    if(tipo_factura_gbl==1){
                        sub_total = sub_total + parseFloat(netamountnotax-descuentosinimp);
                    }else{
                        sub_total = sub_total + parseFloat(netamountnotax-descuentosinimp);
                    }

                    

                    objGlobalArray.id = idinterno;
                    objGlobalArray.type = tipo_transaccion;

                    idsFacturasArray_rel.push(objGlobalArray.id.value);

                // var facturas_rel_cab = record_global.getValue({
                //     fieldId: 'custbody_efx_fe_gbl_transactions'
                // });
                // log.audit({title:'facturas_rel_cab',details:facturas_rel_cab});
                // if(facturas_rel_cab.length > 0){
                //     for(var y=0;y<facturas_rel_cab.length;y++){
                //         if(facturas_rel_cab[y]==''){
                //             facturas_rel_cab.splice(y, 1);
                //         }
                //     }
                // }else{
                //     facturas_rel_cab.push(objGlobalArray.id.value);
                // }

                    idsFacturasArray.push(objGlobalArray);

//inserccion de datareduce por map
                var taxenvio = 0;

                if(tipo_factura_gbl==4) {
                    log.audit({title:'objArticuloGBL',details:objArticuloGBL});
                    log.audit({title:'setup_item',details:setup_item});
                    log.audit({title:'descripcion_gbl',details:descripcion_gbl});
                    log.audit({title:'total_artgbl',details:total_artgbl});
                    log.audit({title:'total_artgbl',details:total_artgbl});
                    log.audit({title:'setup_txcode',details:setup_txcode});
                    log.audit({title:'netamountnotax_artgbl',details:netamountnotax_artgbl});
                    log.audit({title:'taxtotal_artgbl',details:taxtotal_artgbl});

                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: 0,
                        value: setup_item
                    });

                    if(descripcion_gbl){
                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'description',
                            line: 0,
                            value: descripcion_gbl
                        });
                    }


                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: 0,
                        value: 1
                    });
                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: 0,
                        value: total_artgbl
                    });
                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: 0,
                        value: total_artgbl
                    });

                    if(!existeSuiteTax){
                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'taxcode',
                            line: 0,
                            value: setup_txcode
                        });
                    }

                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_gbl_taxcode',
                        line: 0,
                        value: setup_txcode
                    });

                    if(objArticuloGBL.envio_subtotal){
                        netamountnotax_artgbl = parseFloat(netamountnotax_artgbl)+parseFloat(objArticuloGBL.envio_subtotal);
                    }

                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_subtotal_gbl',
                        line: 0,
                        value: netamountnotax_artgbl
                    });

                    if(objArticuloGBL.envio_Montoimpuesto){
                        taxtotal_artgbl = parseFloat(taxtotal_artgbl)+parseFloat(objArticuloGBL.envio_Montoimpuesto);
                    }

                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_taxtotal_gbl',
                        line: 0,
                        value: taxtotal_artgbl
                    });

                    if(donativo){
                        record_global.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_mx_txn_line_sat_tax_object',
                            line: 0,
                            value: 1
                        });
                    }

                    record_global.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol_efx_fe_gbl_json',
                        line: 0,
                        value: JSON.stringify(objArticuloGBL)
                    });
                }

                if(tipo_factura_gbl==2) {
                    log.audit({title: 'arrayLineasnuevas', details: arrayLineasnuevas});

                    for(var a=0;a<arrayLineasnuevas.length;a++) {
                        var tam_keylines = Object.keys(arrayLineasnuevas[a]).length;
                        for (var t = 0; t < tam_keylines; t++) {
                            if (arrayLineasnuevas[a][Object.keys(arrayLineasnuevas[a])[t]]) {
                                if(Object.keys(arrayLineasnuevas[a])[t]=="custcol_efx_fe_taxtotal_gbl"){
                                    tax_total = tax_total + parseFloat(arrayLineasnuevas[a][Object.keys(arrayLineasnuevas[a])[t]]);
                                }
                                if(Object.keys(arrayLineasnuevas[a])[t]=="amount"){
                                    if(arrayLineasnuevas[a].custcol_efx_fe_gbl_sendtype){
                                        sub_total = sub_total + parseFloat(arrayLineasnuevas[a][Object.keys(arrayLineasnuevas[a])[t]]);
                                    }
                                }
                                record_global.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: Object.keys(arrayLineasnuevas[a])[t],
                                    line: a+lineas_insertadas,
                                    value: arrayLineasnuevas[a][Object.keys(arrayLineasnuevas[a])[t]]
                                });
                            }
                        }
                    }
                }

                var taxttoalcabecera = record_global.getValue({
                    fieldId: 'custbody_efx_fe_gbl_totaltax',
                });

                if(taxttoalcabecera==""){
                    taxttoalcabecera=0;
                }

                log.audit({title:'taxttoalcabecera',details:taxttoalcabecera});
                if(tipo_factura_gbl==4){
                    if(objArticuloGBL.envio_Montoimpuesto){
                        taxtotal = parseFloat(taxtotal)+parseFloat(taxttoalcabecera)+parseFloat(objArticuloGBL.envio_Montoimpuesto);
                    }else{
                        taxtotal = parseFloat(taxtotal)+parseFloat(taxttoalcabecera);
                    }
                }
                if(tipo_factura_gbl==1){
                    taxtotal = parseFloat(taxtotal)+parseFloat(taxttoalcabecera);
                }

                if(tipo_factura_gbl==2) {
                    taxtotal = tax_total;
                }

                log.audit({title:'taxtotal',details:taxtotal});

                record_global.setValue({
                    fieldId: 'custbody_efx_fe_gbl_totaltax',
                    value: taxtotal.toFixed(2)
                });

                record_global.setValue({
                    fieldId: 'custbody_efx_fe_gbl_type',
                    value: tipo_factura_gbl
                });

                if(tipo_factura_gbl==4){
                    if(objArticuloGBL.envio_subtotal){
                        sub_total = parseFloat(sub_total)+parseFloat(objArticuloGBL.envio_subtotal);
                    }
                }

                record_global.setValue({
                    fieldId: 'custbody_efx_fe_gbl_subtotal',
                    value: sub_total.toFixed(2)
                });

                

                log.audit({title:'sub_total',details:sub_total});

                var totalizaGBL = sub_total+taxtotal;

                record_global.setValue({
                    fieldId: 'custbody_efx_fe_gbl_total',
                    value: totalizaGBL.toFixed(2)
                });

                try{
                    var id_global = record_global.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                }catch(guardagbl){
                    log.audit({title:'guardagbl',details:guardagbl});
                }

                // array_maps.push(datos.values.internalid.value);
                array_maps.push(idsFacturasArray);
                var peticion = datos.id;
                var datos_r = datos.values;

                var objreduce = {
                    facturas:array_maps,
                    idGlobal:datos.values.formulatext,
                    transacciones_obj: transacciones_obj
                }

                mapContext.write({
                    key: 'ObjetoGBL',
                    value: objreduce
                });
            }catch(error){
                log.error({title:'map - error',details:error});
            }
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

            // log.audit({title:'idsFacturasArray_rel',details:idsFacturasArray_rel});

          log.audit({title:'reduceContext',details:reduceContext});
          log.audit({title:'reduceContext',details:JSON.parse(reduceContext.values[0])});

          try {
              var dataReduce = JSON.parse(reduceContext.values[0]);
              var id_global = dataReduce.idGlobal;
              var idsFacturasArray = new Array();
              var transacciones_obj = dataReduce.transacciones_obj;

              for (var i = 0; i < dataReduce.facturas.length; i++) {
                  idsFacturasArray.push(dataReduce.facturas[i][0].id.value)
              }
              log.audit({title: 'idsFacturasArray', details: idsFacturasArray});


              var idrecordGBL = '';
              var subsidiaria_gbl = '';
              var ubicacion_gbl = '';
              var tipo_factura_gbl = '';
              var contactos_mail = '';
              var descripcion_gbl = '';
              var satPaymentTerm = '';
              var cfdiUsage = '';
              var satPaymentMethod = '';
              var memoGlobal = '';
              var setup_entity = '';
              var moneda = '';
              var fechaParaFactura = '';

              var scriptObj = runtime.getCurrentScript();
              var GBL_Config = scriptObj.getParameter({name: 'custscript_efx_fe_gbl_config'});
              var record_setup = record.load({
                  type: 'customrecord_efx_fe_facturaglobal_setup',
                  id: GBL_Config
              });

              log.audit({title: 'transacciones_obj', details: transacciones_obj});
              if (transacciones_obj) {
                  var transacciones_parsed = JSON.parse(transacciones_obj);
                  idrecordGBL = transacciones_parsed.idrecord;
                  subsidiaria_gbl = transacciones_parsed.subsidiary;
                  ubicacion_gbl = transacciones_parsed.location;
                  tipo_factura_gbl = transacciones_parsed.tipo_factura;
                  contactos_mail = transacciones_parsed.contactos;
                  descripcion_gbl = transacciones_parsed.descripcion;
                  satPaymentTerm = transacciones_parsed.m_pago;
                  cfdiUsage = transacciones_parsed.usocfdi;
                  satPaymentMethod = transacciones_parsed.f_pago;
                  memoGlobal = transacciones_parsed.memo;
                  setup_entity = transacciones_parsed.customer;
                  moneda = transacciones_parsed.moneda;
                  fechaParaFactura = transacciones_parsed.fechaparafactura;
              }

              if (!setup_entity) {
                  setup_entity = record_setup.getValue({fieldId: 'custrecord_efx_fe_gbl_entity'});
              }

              var record_cliente = search.lookupFields({
                  type: record.Type.CUSTOMER,
                  id: setup_entity,
                  columns: ['custentity_efx_fe_send_cert_docs', 'custentity_efx_fe_kiosko_contact', 'custentity_edoc_gen_trans_pdf', 'custentity_efx_mx_payment_term', 'custentity_efx_mx_cfdi_usage', 'custentity_efx_mx_payment_method']
              });


              //funciona solo por interfaz

              var setup_metodo_origen = '';
              var setup_forma_origen = '';
              var setup_usocfdi_origen = '';

              if (!transacciones_obj) {
                  setup_metodo_origen = record_setup.getValue({fieldId: 'custrecord_efx_fe_gbl_methodorigin'});
                  setup_forma_origen = record_setup.getValue({fieldId: 'custrecord_efx_fe_gbl_payorigin'});
                  setup_usocfdi_origen = record_setup.getValue({fieldId: 'custrecord_efx_fe_gbl_cfdiorigin'});
              }


              var objInfoCFDI = {
                  custbody_mx_cfdi_usage: '',
                  custbody_mx_txn_sat_payment_method: '',
                  custbody_mx_txn_sat_payment_term: ''
              };

              var record_global = record.load({
                  type: 'customsale_efx_fe_factura_global',
                  id:id_global
              });


              if (setup_metodo_origen == 2 || setup_forma_origen == 2 || setup_usocfdi_origen == 2) {
                  objInfoCFDI = '';
                  objInfoCFDI = buscaInfocfdi(idsFacturasArray);
              }
              log.audit({title: 'setup_metodo_origen', details: setup_metodo_origen});
              log.audit({title: 'setup_forma_origen', details: setup_forma_origen});
              log.audit({title: 'setup_usocfdi_origen', details: setup_usocfdi_origen});

              log.audit({title: 'objInfoCFDI', details: objInfoCFDI});
              if (!satPaymentTerm) {
                  if (setup_metodo_origen == 2 && objInfoCFDI.custbody_mx_txn_sat_payment_term) {
                      satPaymentTerm = objInfoCFDI.custbody_mx_txn_sat_payment_term;
                  } else {
                      satPaymentTerm = record_cliente['custentity_efx_mx_payment_term'][0].value;
                  }
                  record_global.setValue({
                      fieldId: 'custbody_mx_txn_sat_payment_term',
                      value: satPaymentTerm
                  });
              }

              log.audit({title:'cfdiUsage',details:cfdiUsage});
              if(!cfdiUsage) {
                  if(setup_usocfdi_origen==2 && objInfoCFDI.custbody_mx_cfdi_usage){
                      cfdiUsage = objInfoCFDI.custbody_mx_cfdi_usage;
                  }else {
                      cfdiUsage = record_cliente['custentity_efx_mx_cfdi_usage'][0].value;
                      log.audit({title: 'cfdiUsage', details: cfdiUsage});
                  }
                  record_global.setValue({
                      fieldId: 'custbody_mx_cfdi_usage',
                      value: cfdiUsage
                  });
              }
              if(!satPaymentMethod) {
                  if(setup_forma_origen==2 && objInfoCFDI.custbody_mx_txn_sat_payment_method){
                      satPaymentMethod = objInfoCFDI.custbody_mx_txn_sat_payment_method;
                  }else {
                      satPaymentMethod = record_cliente['custentity_efx_mx_payment_method'][0].value;
                  }
                  record_global.setValue({
                      fieldId: 'custbody_mx_txn_sat_payment_method',
                      value: satPaymentMethod
                  });
              }



              record_global.setValue({
                  fieldId: 'custbody_efx_fe_gbl_transactions',
                  value: idsFacturasArray
              });


              record_global.save({
                  enableSourcing: true,
                  ignoreMandatoryFields: true
              });


              //timbrado

              log.audit({title: 'id_global', details: id_global});
              log.audit({title: 'idsFacturasArray', details: idsFacturasArray});

              log.audit({title: 'id_global', details: id_global});
              var pdfGen = '';
              var xmlGen = '';
              var xmlCert = '';
              var uuidglobal = '';
              try {
                  crearXML(id_global, 'customsale_efx_fe_factura_global');
              } catch (errorTimbra) {
                  log.audit({title: 'errorTimbra', details: errorTimbra});
                  var timbradaObj = record.load({
                      type: 'customsale_efx_fe_factura_global',
                      id: id_global
                  });

                  pdfGen = timbradaObj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                  xmlGen = timbradaObj.getValue({fieldId: 'custbody_psg_ei_content'});
                  xmlCert = timbradaObj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});
                  uuidglobal = timbradaObj.getValue({fieldId: 'custbody_mx_cfdi_uuid'});
              }

              var timbradaObj = record.load({
                  type: 'customsale_efx_fe_factura_global',
                  id: id_global
              });

              pdfGen = timbradaObj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
              xmlGen = timbradaObj.getValue({fieldId: 'custbody_psg_ei_content'});
              xmlCert = timbradaObj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});
              uuidglobal = timbradaObj.getValue({fieldId: 'custbody_mx_cfdi_uuid'});

              log.audit({title: 'pdfGen', details: pdfGen});
              log.audit({title: 'xmlCert', details: xmlCert});
              log.audit({title: 'uuidglobal', details: uuidglobal});


          }catch(error_reduce){
              log.error({title:'error_reduce',details:error_reduce})
          }
            reduceContext.write({
                key: 'DatosGBL' ,
                value: dataReduce
            });


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
            log.audit({title:'summaryContext',details:summaryContext});
            var objGbl = '';
            summaryContext.output.iterator().each(function (key, value)
            {
                objGbl =  value;
                return true;
            });

            log.audit({title:'objGbl',details:objGbl});
            if(objGbl){
                var objGBLdata = JSON.parse(objGbl);
                log.audit({title:'objGBLdata.facturas',details:objGBLdata.facturas});
                log.audit({title:'objGBLdata.idGlobal',details:objGBLdata.idGlobal});

                if(objGBLdata.idGlobal){
                    var timbradaObj = record.load({
                        type: 'customsale_efx_fe_factura_global',
                        id:objGBLdata.idGlobal
                    });

                    var pdfGen = timbradaObj.getValue({fieldId:'custbody_edoc_generated_pdf'});
                    var xmlGen = timbradaObj.getValue({fieldId:'custbody_psg_ei_content'});
                    var xmlCert = timbradaObj.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
                    var uuidglobal = timbradaObj.getValue({fieldId:'custbody_mx_cfdi_uuid'});
                    var usocfdiglobal = timbradaObj.getValue({fieldId:'custbody_mx_cfdi_usage'});
                    var formapagoglobal = timbradaObj.getValue({fieldId:'custbody_mx_txn_sat_payment_method'});
                    var metodopagoglobal = timbradaObj.getValue({fieldId:'custbody_mx_txn_sat_payment_term'});

                    if(xmlCert && uuidglobal) {
                        for (var i = 0; i < objGBLdata.facturas.length; i++) {
                            record.submitFields({
                                type: objGBLdata.facturas[i][0].type,
                                id: objGBLdata.facturas[i][0].id.value,
                                values: {
                                    custbody_edoc_generated_pdf: pdfGen,
                                    custbody_psg_ei_content: xmlGen,
                                    custbody_psg_ei_certified_edoc: xmlCert,
                                    custbody_mx_cfdi_uuid: uuidglobal,
                                    custbody_psg_ei_status: 3,
                                    custbody_mx_txn_sat_payment_term:metodopagoglobal,
                                    custbody_mx_txn_sat_payment_method:formapagoglobal,
                                    custbody_mx_cfdi_usage:usocfdiglobal

                                }
                            });
                        }

                        try {
                            sendToMail(objGBLdata.idGlobal, 'customsale_efx_fe_factura_global');
                        }catch(error_mail){
                            log.audit({title: 'error_mail', details: error_mail});
                        }

                    }
                }
            }


        }



        function crearXML(tranid,trantype){
            log.audit({title:'tranid',details:tranid});
            log.audit({title:'trantype',details:trantype});

            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });


            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_xml_generator',
                deploymentId: 'customdeploy_efx_fe_xml_generator',
                returnExternalUrl: true,
                params: {
                    trantype: trantype,
                    tranid: tranid

                }
            });

            log.audit({title:'SLURL',details:SLURL});


            var response = https.get({
                url: SLURL,
            });

            log.audit({title:'response-code',details:response.code});
            log.audit({title:'response-body',details:response.body});

            return response;


        }

        function obtenLineasGBL(idfactura,tipo_transaccion,existeSuiteTax,articulo_envio,setup_item,record_setup,donativo){

            var arrayextra = new Array();
            var arrayextrarecord = record_setup.getValue({fieldId: 'custrecord_efx_fe_gbl_sublistfields'});
            if(arrayextrarecord){
                arrayextra = JSON.parse(arrayextrarecord);
            }
            var arrayLineas = new Array();

            var objTran = record.load({
                type:tipo_transaccion,
                id:idfactura
            });

            var costo_envio = objTran.getValue({fieldId:'shippingcost'});

            var line_conut = objTran.getLineCount({sublistId:'item'});
            var line_countShipp = objTran.getLineCount({sublistId:'shipgroup'});

            for(var i=0;i<line_conut;i++) {
                var objLinea = {
                    item:'',
                    custcol_efx_fe_gbl_originitem:'',
                    custcol_efx_fe_gbl_originunitm:'',
                    quantity:'',
                    description:'',
                    rate:'',
                    price:'',
                    amount:'',
                    // class:'',
                    // department:'',
                    // taxcode:'',
                    custcol_efx_fe_gbl_taxcode:'',
                    custcol_mx_txn_line_sat_item_code:'',
                    custcol_efx_fe_upc_code:'',
                    custcol_efx_fe_tax_json:'',
                    custcol_efx_fe_gbl_related_tran:'',
                    custcol_efx_fe_taxtotal_gbl:'',
                    custcol_efx_fe_gbl_sendtype:false,
                    custcol_mx_txn_line_sat_tax_object:2
                };
                for(var e=0;e<arrayextra.length;e++){
                    objLinea[arrayextra[e]] = objTran.getSublistValue({sublistId: 'item', fieldId: arrayextra[e], line: i});
                }
                var amountLine = objTran.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i}) || 0;
                var taxamountLine = objTran.getSublistValue({sublistId: 'item', fieldId: 'tax1amt', line: i}) || 0;
                var tipoitem = objTran.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i}) || 0;

                //var montoTotal = parseFloat(amountLine)+parseFloat(taxamountLine);custcol_efx_fe_gbl_originunitm
                var montoTotal = parseFloat(amountLine);
                objLinea.item = setup_item;
                objLinea.custcol_efx_fe_gbl_originitem = objTran.getSublistValue({sublistId: 'item', fieldId: 'item', line: i});
                objLinea.custcol_efx_fe_gbl_originunitm = objTran.getSublistValue({sublistId: 'item', fieldId: 'units', line: i});
                objLinea.quantity = objTran.getSublistValue({sublistId: 'item', fieldId: 'quantity', line: i});
                objLinea.description = objTran.getSublistValue({sublistId: 'item', fieldId: 'description', line: i});

                if(tipoitem=='Discount'){
                    objLinea.price = -1;
                    objLinea.rate = montoTotal;
                    objLinea.amount = montoTotal;
                }else{
                    // objLinea.price = objTran.getSublistValue({sublistId: 'item', fieldId: 'price', line: i});
                    objLinea.price = -1;
                    objLinea.rate = objTran.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
                    objLinea.amount = montoTotal;
                }
                // objLinea.class = objTran.getSublistValue({sublistId: 'item', fieldId: 'class', line: i});
                // objLinea.department = objTran.getSublistValue({sublistId: 'item', fieldId: 'department', line: i});
                // objLinea.taxcode = objTran.getSublistValue({sublistId: 'item', fieldId: 'taxcode', line: i});
                if(!existeSuiteTax){
                    objLinea.custcol_efx_fe_gbl_taxcode = objTran.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'taxcode',
                        line: i
                    });
                }

                objLinea.custcol_mx_txn_line_sat_item_code = objTran.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_mx_txn_line_sat_item_code',
                    line: i
                });
                objLinea.custcol_efx_fe_upc_code = objTran.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_efx_fe_upc_code',
                    line: i
                });
                objLinea.custcol_efx_fe_tax_json = objTran.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_efx_fe_tax_json',
                    line: i
                });
                if(donativo){
                    objLinea.custcol_mx_txn_line_sat_tax_object = 1;
                }
                if(objLinea.custcol_efx_fe_tax_json){
                    var jsonparsedlinea = JSON.parse(objLinea.custcol_efx_fe_tax_json);
                    // objLinea.custcol_efx_fe_taxtotal_gbl = taxamountLine;
                    objLinea.custcol_efx_fe_taxtotal_gbl = parseFloat(jsonparsedlinea.impuestoLineaCalculados);
                }
                
                objLinea.custcol_efx_fe_gbl_related_tran = idfactura;
                arrayLineas.push(objLinea);
            }

            log.audit({title:'costo_envio',details:costo_envio});
            log.audit({title:'articulo_envio',details:articulo_envio});
            if(articulo_envio){
                if(costo_envio && costo_envio!=0){
                    var objLinea = {
                        item:'',
                        quantity:'',
                        description:'',
                        rate:'',
                        amount:'',
                        custcol_efx_fe_gbl_taxcode:'',
                        custcol_mx_txn_line_sat_item_code:'',
                        custcol_efx_fe_upc_code:'',
                        custcol_efx_fe_tax_json:'',
                        custcol_efx_fe_gbl_related_tran:'',
                        custcol_efx_fe_taxtotal_gbl:'',
                        custcol_efx_fe_gbl_sendtype:true,
                        custcol_efx_fe_gbl_taxrateen:'',
                    };
                    if(line_countShipp>0){
                        for(var arL=0;arL<line_countShipp;arL++){
                            objLinea.item = articulo_envio;
                            objLinea.quantity = 1;
                            objLinea.description = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingmethod',line:0});
                            objLinea.rate = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingrate',line:0});;
                            objLinea.amount = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingrate',line:0});;
                            objLinea.custcol_efx_fe_gbl_taxcode = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxcode',line:0});;
                            objLinea.custcol_efx_fe_taxtotal_gbl = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxamt',line:0});;
                            objLinea.custcol_efx_fe_gbl_taxrateen = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxrate',line:0});;
                            objLinea.custcol_efx_fe_gbl_related_tran = idfactura;
                            objLinea.custcol_efx_fe_gbl_sendtype = true;
                            log.audit({title:'objLineaeenvio',details:objLinea});
                            arrayLineas.push(objLinea);
                        }
                    }else{
                        objLinea.item = articulo_envio;
                        objLinea.quantity = 1;
                        objLinea.description = objTran.getText({fieldId:'shipmethod'});
                        objLinea.rate = costo_envio;
                        objLinea.amount = costo_envio;
                        objLinea.custcol_efx_fe_gbl_taxcode = objTran.getValue({fieldId:'shippingtaxcode'});
                        objLinea.custcol_efx_fe_taxtotal_gbl = objTran.getValue({fieldId:'shippingtax1amt'});
                        objLinea.custcol_efx_fe_gbl_taxrateen = objTran.getValue({fieldId:'shippingtax1rate'});
                        objLinea.custcol_efx_fe_gbl_related_tran = idfactura;
                        objLinea.custcol_efx_fe_gbl_sendtype = true;
                        log.audit({title:'objLineaeenvio',details:objLinea});
                        arrayLineas.push(objLinea);
                    }

                }
            }


            log.audit({title:'arrayLineas',details:arrayLineas});
            return arrayLineas;



        }

        function sendToMail(tranid,trantype){
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });

            var userObj = runtime.getCurrentUser();
            

            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_mail_sender_sl',
                deploymentId: 'customdeploy_efx_fe_mail_sender_sl',
                returnExternalUrl: true,
                params: {
                    trantype: trantype,
                    tranid: tranid,
                    transactionCreator:userObj.id
                }
            });

            log.audit({title:'SLURL',details:SLURL});

            var response = https.get({
                url: SLURL,
            });

            log.audit({title:'response-code_mail',details:response.code});
            log.audit({title:'response-body_mail',details:response.body});

            return response;

        }


        function creaObjGlobal(objArticuloGBL,custbody_efx_fe_tax_json,articulo_envio,idfactura,tipo_transaccion,donativo){

            //Se agrega linea de costo de envio
            if(articulo_envio){

                var objTran = record.load({
                    type:tipo_transaccion,
                    id:idfactura
                });

                var costo_envio = objTran.getValue({fieldId:'shippingcost'});

                var line_countShipp = objTran.getLineCount({sublistId:'shipgroup'});
                var shiptotal=0;
                var shipsubtotal=0;
                var shipMontoImpuesto=0;
                var shipTasaImpuesto=0;

                log.audit({title:'costo_envio',details:costo_envio});
                log.audit({title:'articulo_envio',details:articulo_envio});

                var arrayLineas = new Array();
                if(costo_envio && costo_envio!=0){
                    var objLinea = {
                        item:'',
                        quantity:'',
                        description:'',
                        rate:'',
                        amount:'',
                        custcol_efx_fe_gbl_taxcode:'',
                        custcol_mx_txn_line_sat_item_code:'',
                        custcol_efx_fe_upc_code:'',
                        custcol_efx_fe_tax_json:'',
                        custcol_efx_fe_gbl_related_tran:'',
                        custcol_efx_fe_taxtotal_gbl:'',
                        custcol_efx_fe_gbl_sendtype:true,
                        custcol_efx_fe_gbl_taxrateen:'',
                        custcol_mx_txn_line_sat_tax_object:2
                    };
                    if(line_countShipp>0){
                        for(var arL=0;arL<line_countShipp;arL++){
                            // objLinea.item = articulo_envio;
                            // objLinea.quantity = 1;
                            // objLinea.description = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingmethod',line:arL});
                            // objLinea.rate = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingrate',line:arL});
                            // objLinea.amount = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingrate',line:arL});
                            // objLinea.custcol_efx_fe_gbl_taxcode = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxcode',line:arL});
                            // objLinea.custcol_efx_fe_taxtotal_gbl = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxamt',line:arL});
                            // objLinea.custcol_efx_fe_gbl_taxrateen = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxrate',line:arL});
                            // objLinea.custcol_efx_fe_gbl_related_tran = idfactura;
                            // objLinea.custcol_efx_fe_gbl_sendtype = true;
                            // log.audit({title:'objLineaeenvio',details:objLinea});
                            shipsubtotal = shipsubtotal + parseFloat(objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingrate',line:arL}));
                            shipMontoImpuesto = shipMontoImpuesto + parseFloat(objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxamt',line:arL}));
                            shipTasaImpuesto = objTran.getSublistValue({sublistId:'shipgroup',fieldId:'shippingtaxrate',line:arL});
                            shiptotal = shiptotal+shipsubtotal+shipMontoImpuesto;
                            //arrayLineas.push(objLinea);
                        }
                    }else{
                        // objLinea.item = articulo_envio;
                        // objLinea.quantity = 1;
                        // objLinea.description = objTran.getText({fieldId:'shipmethod'});
                        // objLinea.rate = costo_envio;
                        // objLinea.amount = costo_envio;
                        // objLinea.custcol_efx_fe_gbl_taxcode = objTran.getValue({fieldId:'shippingtaxcode'});
                        // objLinea.custcol_efx_fe_taxtotal_gbl = objTran.getValue({fieldId:'shippingtax1amt'});
                        // objLinea.custcol_efx_fe_gbl_taxrateen = objTran.getValue({fieldId:'shippingtax1rate'});
                        // objLinea.custcol_efx_fe_gbl_related_tran = idfactura;
                        // objLinea.custcol_efx_fe_gbl_sendtype = true;
                        // log.audit({title:'objLineaeenvio',details:objLinea});
                        // arrayLineas.push(objLinea);
                        shipsubtotal = shipsubtotal + parseFloat(costo_envio);
                        shipMontoImpuesto = shipMontoImpuesto + parseFloat(objTran.getValue({fieldId:'shippingtax1amt'}));
                        shipTasaImpuesto = objTran.getValue({fieldId:'shippingtax1rate'});
                        shiptotal = shiptotal+shipsubtotal+shipMontoImpuesto;
                    }
                }
            }
            log.audit({title:'shipsubtotal',details:shipsubtotal});
            log.audit({title:'shipMontoImpuesto',details:shipMontoImpuesto});
            log.audit({title:'shipTasaImpuesto',details:shipTasaImpuesto});
            log.audit({title:'shiptotal',details:shiptotal});

            objArticuloGBL.envio_total=shiptotal;
            objArticuloGBL.envio_Montoimpuesto=shipMontoImpuesto;
            objArticuloGBL.envio_Tasaimpuesto=shipTasaImpuesto;
            objArticuloGBL.envio_subtotal=shipsubtotal;
            objArticuloGBL.ieps_total = (parseFloat(objArticuloGBL.ieps_total)+parseFloat(custbody_efx_fe_tax_json.ieps_total_gbl));
            objArticuloGBL.iva_total = (parseFloat(objArticuloGBL.iva_total)+parseFloat(custbody_efx_fe_tax_json.iva_total_gbl)+parseFloat(shipMontoImpuesto));
            objArticuloGBL.retencion_total = (parseFloat(objArticuloGBL.retencion_total)+parseFloat(custbody_efx_fe_tax_json.retencion_total_gbl));
            objArticuloGBL.local_total = (parseFloat(objArticuloGBL.local_total)+parseFloat(custbody_efx_fe_tax_json.local_total_gbl));
            objArticuloGBL.descuentoConImpuesto = (parseFloat(objArticuloGBL.descuentoConImpuesto)+parseFloat(custbody_efx_fe_tax_json.descuentoConImpuesto)).toFixed(2);
            objArticuloGBL.descuentoSinImpuesto = (parseFloat(objArticuloGBL.descuentoSinImpuesto)+parseFloat(custbody_efx_fe_tax_json.descuentoSinImpuesto)).toFixed(2);
            objArticuloGBL.totalImpuestos = (parseFloat(objArticuloGBL.totalImpuestos)+parseFloat(custbody_efx_fe_tax_json.totalImpuestos_gbl)+parseFloat(shipMontoImpuesto));
            objArticuloGBL.subtotal = (parseFloat(objArticuloGBL.subtotal)+parseFloat(custbody_efx_fe_tax_json.subtotal_gbl)+parseFloat(shipsubtotal));
            objArticuloGBL.total = (parseFloat(objArticuloGBL.total)+parseFloat(custbody_efx_fe_tax_json.total_gbl)+parseFloat(shiptotal));
            objArticuloGBL.totalTraslados = (parseFloat(objArticuloGBL.totalTraslados)+parseFloat(custbody_efx_fe_tax_json.totalTraslados_gbl)+parseFloat(shipMontoImpuesto));
            objArticuloGBL.totalRetenciones = (parseFloat(objArticuloGBL.totalRetenciones)+parseFloat(custbody_efx_fe_tax_json.totalRetenciones_gbl));
            objArticuloGBL.diferenciaTotales = (parseFloat(objArticuloGBL.diferenciaTotales)+parseFloat(custbody_efx_fe_tax_json.diferenciaTotales));

            if(shipTasaImpuesto && shipTasaImpuesto!=0){
                if((objArticuloGBL.monto_iva_gbl).hasOwnProperty(parseFloat(shipTasaImpuesto))){
                    objArticuloGBL.monto_iva_gbl[parseFloat(shipTasaImpuesto)] = parseFloat(objArticuloGBL.monto_iva_gbl[parseFloat(shipTasaImpuesto)])+parseFloat(shipMontoImpuesto);
                }else{
                    objArticuloGBL.monto_iva_gbl[parseFloat(shipTasaImpuesto)]=parseFloat(shipMontoImpuesto);
                }


                if((objArticuloGBL.bases_iva_gbl).hasOwnProperty(parseFloat(shipTasaImpuesto))){
                    if (Object.keys(custbody_efx_fe_tax_json.bases_iva)[iva] == Object.keys(objArticuloGBL.bases_iva_gbl)[i]) {
                        objArticuloGBL.bases_iva_gbl[parseFloat(shipTasaImpuesto)] = parseFloat(objArticuloGBL.bases_iva_gbl[parseFloat(shipTasaImpuesto)])+parseFloat(shipsubtotal);
                    }
                }else{
                    objArticuloGBL.bases_iva_gbl[parseFloat(shipTasaImpuesto)]=parseFloat(shipsubtotal);
                }
            }


            log.audit({title:'objArticuloGBL',details:objArticuloGBL});


            //calculo de ieps
            var tam_ieps_data = Object.keys(custbody_efx_fe_tax_json.monto_ieps_gbl).length;
            var tam_ieps_data_obj = Object.keys(objArticuloGBL.monto_ieps_gbl).length;
            if(tam_ieps_data_obj>0){
                for(var ieps=0;ieps<tam_ieps_data;ieps++){
                    for(var i=0;i<tam_ieps_data_obj;i++){
                        if((objArticuloGBL.monto_ieps_gbl).hasOwnProperty(Object.keys(custbody_efx_fe_tax_json.monto_ieps_gbl)[ieps])){
                            if (Object.keys(custbody_efx_fe_tax_json.monto_ieps_gbl)[ieps] == Object.keys(objArticuloGBL.monto_ieps_gbl)[i]) {
                                objArticuloGBL.monto_ieps_gbl[Object.keys(objArticuloGBL.monto_ieps_gbl)[i]] = parseFloat(objArticuloGBL.monto_ieps_gbl[Object.keys(objArticuloGBL.monto_ieps_gbl)[i]]) + parseFloat(custbody_efx_fe_tax_json.monto_ieps_gbl[Object.keys(custbody_efx_fe_tax_json.monto_ieps_gbl)[ieps]]);
                            }
                        }else{
                            objArticuloGBL.monto_ieps_gbl[Object.keys(custbody_efx_fe_tax_json.monto_ieps_gbl)[ieps]] = (parseFloat(custbody_efx_fe_tax_json.monto_ieps_gbl[Object.keys(custbody_efx_fe_tax_json.monto_ieps_gbl)[ieps]]));
                        }
                    }
                }
            }else{
                objArticuloGBL.monto_ieps_gbl = custbody_efx_fe_tax_json.monto_ieps_gbl;
            }

            var tam_ieps_base = Object.keys(custbody_efx_fe_tax_json.bases_ieps).length;
            var tam_ieps_base_obj = Object.keys(objArticuloGBL.bases_ieps_gbl).length;
            if(tam_ieps_base_obj>0){
                for(var ieps=0;ieps<tam_ieps_base;ieps++){
                    for(var i=0;i<tam_ieps_base_obj;i++){
                        if((objArticuloGBL.bases_ieps_gbl).hasOwnProperty(Object.keys(custbody_efx_fe_tax_json.bases_ieps)[ieps])){
                            if (Object.keys(custbody_efx_fe_tax_json.bases_ieps)[ieps] == Object.keys(objArticuloGBL.bases_ieps_gbl)[i]) {
                                objArticuloGBL.bases_ieps_gbl[Object.keys(objArticuloGBL.bases_ieps_gbl)[i]] = parseFloat(objArticuloGBL.bases_ieps_gbl[Object.keys(objArticuloGBL.bases_ieps_gbl)[i]]) + parseFloat(custbody_efx_fe_tax_json.bases_ieps[Object.keys(custbody_efx_fe_tax_json.bases_ieps)[ieps]]);
                            }
                        }else{
                            objArticuloGBL.bases_ieps_gbl[Object.keys(custbody_efx_fe_tax_json.bases_ieps)[ieps]] = (parseFloat(custbody_efx_fe_tax_json.bases_ieps[Object.keys(custbody_efx_fe_tax_json.bases_ieps)[ieps]]));
                        }
                    }
                }
            }else{
                objArticuloGBL.bases_ieps_gbl = custbody_efx_fe_tax_json.bases_ieps;
            }


            //calculo de iva
            var tam_iva_data = Object.keys(custbody_efx_fe_tax_json.monto_iva_gbl).length;
            var tam_iva_data_obj = Object.keys(objArticuloGBL.monto_iva_gbl).length;
            if(tam_iva_data_obj>0){
                for(var iva=0;iva<tam_iva_data;iva++){
                    for(var i=0;i<tam_iva_data_obj;i++){
                        if((objArticuloGBL.monto_iva_gbl).hasOwnProperty(Object.keys(custbody_efx_fe_tax_json.monto_iva_gbl)[iva])){
                            if (Object.keys(custbody_efx_fe_tax_json.monto_iva_gbl)[iva] == Object.keys(objArticuloGBL.monto_iva_gbl)[i]) {
                                objArticuloGBL.monto_iva_gbl[Object.keys(objArticuloGBL.monto_iva_gbl)[i]] = (parseFloat(objArticuloGBL.monto_iva_gbl[Object.keys(objArticuloGBL.monto_iva_gbl)[i]]) + parseFloat(custbody_efx_fe_tax_json.monto_iva_gbl[Object.keys(custbody_efx_fe_tax_json.monto_iva_gbl)[iva]]));
                            }
                        }else{
                            objArticuloGBL.monto_iva_gbl[Object.keys(custbody_efx_fe_tax_json.monto_iva_gbl)[iva]] = (parseFloat(custbody_efx_fe_tax_json.monto_iva_gbl[Object.keys(custbody_efx_fe_tax_json.monto_iva_gbl)[iva]]));
                        }
                    }
                }
            }else{
                objArticuloGBL.monto_iva_gbl = custbody_efx_fe_tax_json.monto_iva_gbl;
            }

            var tam_iva_base = Object.keys(custbody_efx_fe_tax_json.bases_iva).length;
            var tam_iva_base_obj = Object.keys(objArticuloGBL.bases_iva_gbl).length;
            if(tam_iva_base_obj>0){
                for(var iva=0;iva<tam_iva_base;iva++){
                    for(var i=0;i<tam_iva_base_obj;i++){
                        if((objArticuloGBL.bases_iva_gbl).hasOwnProperty(Object.keys(custbody_efx_fe_tax_json.bases_iva)[iva])){
                            if (Object.keys(custbody_efx_fe_tax_json.bases_iva)[iva] == Object.keys(objArticuloGBL.bases_iva_gbl)[i]) {
                                objArticuloGBL.bases_iva_gbl[Object.keys(objArticuloGBL.bases_iva_gbl)[i]] = (parseFloat(objArticuloGBL.bases_iva_gbl[Object.keys(objArticuloGBL.bases_iva_gbl)[i]]) + parseFloat(custbody_efx_fe_tax_json.bases_iva[Object.keys(custbody_efx_fe_tax_json.bases_iva)[iva]]));
                            }
                        }else{

                            objArticuloGBL.bases_iva_gbl[Object.keys(custbody_efx_fe_tax_json.bases_iva)[iva]] = (parseFloat(custbody_efx_fe_tax_json.bases_iva[Object.keys(custbody_efx_fe_tax_json.bases_iva)[iva]]));
                        }
                    }
                }
            }else{
                objArticuloGBL.bases_iva_gbl = custbody_efx_fe_tax_json.bases_iva;
            }

            //calculo de retencion
            var tam_ret_data = Object.keys(custbody_efx_fe_tax_json.monto_ret_gbl).length;
            var tam_ret_data_obj = Object.keys(objArticuloGBL.monto_ret_gbl).length;
            if(tam_ret_data_obj>0){
                for(var ret=0;ret<tam_ret_data;ret++){
                    for(var i=0;i<tam_ret_data_obj;i++){
                        if((objArticuloGBL.monto_ret_gbl).hasOwnProperty(Object.keys(custbody_efx_fe_tax_json.monto_ret_gbl)[ret])){
                            if (Object.keys(custbody_efx_fe_tax_json.monto_ret_gbl)[ret] == Object.keys(objArticuloGBL.monto_ret_gbl)[i]) {
                                objArticuloGBL.monto_ret_gbl[Object.keys(objArticuloGBL.monto_ret_gbl)[i]] = (parseFloat(objArticuloGBL.monto_ret_gbl[Object.keys(objArticuloGBL.monto_ret_gbl)[i]]) + parseFloat(custbody_efx_fe_tax_json.monto_ret_gbl[Object.keys(custbody_efx_fe_tax_json.monto_ret_gbl)[ret]]));
                            }
                        }else{
                            objArticuloGBL.monto_ret_gbl[Object.keys(custbody_efx_fe_tax_json.monto_ret_gbl)[ret]] = (parseFloat(custbody_efx_fe_tax_json.monto_ret_gbl[Object.keys(custbody_efx_fe_tax_json.monto_ret_gbl)[ret]]));
                        }
                    }
                }
            }else{
                objArticuloGBL.monto_ret_gbl = custbody_efx_fe_tax_json.monto_ret_gbl;
            }

            var tam_ret_base = Object.keys(custbody_efx_fe_tax_json.bases_retencion).length;
            var tam_ret_base_obj = Object.keys(objArticuloGBL.bases_ret_gbl).length;
            if(tam_ret_base_obj>0){
                for(var ret=0;ret<tam_ret_base;ret++){
                    for(var i=0;i<tam_ret_base_obj;i++){
                        if((objArticuloGBL.bases_ret_gbl).hasOwnProperty(Object.keys(custbody_efx_fe_tax_json.bases_retencion)[ret])){
                            if (Object.keys(custbody_efx_fe_tax_json.bases_retencion)[ret] == Object.keys(objArticuloGBL.bases_ret_gbl)[i]) {
                                objArticuloGBL.bases_ret_gbl[Object.keys(objArticuloGBL.bases_ret_gbl)[i]] = (parseFloat(objArticuloGBL.bases_ret_gbl[Object.keys(objArticuloGBL.bases_ret_gbl)[i]]) + parseFloat(custbody_efx_fe_tax_json.bases_retencion[Object.keys(custbody_efx_fe_tax_json.bases_retencion)[ret]]));
                            }
                        }else{

                            objArticuloGBL.bases_ret_gbl[Object.keys(custbody_efx_fe_tax_json.bases_retencion)[ret]] = (parseFloat(custbody_efx_fe_tax_json.bases_retencion[Object.keys(custbody_efx_fe_tax_json.bases_retencion)[ret]]));
                        }
                    }
                }
            }else{
                objArticuloGBL.bases_ret_gbl = custbody_efx_fe_tax_json.bases_retencion;
            }


            //calculo de local
            var tam_loc_data = Object.keys(custbody_efx_fe_tax_json.monto_local_gbl).length;
            var tam_loc_data_obj = Object.keys(objArticuloGBL.monto_local_gbl).length;
            if(tam_loc_data_obj>0){
                for(var loc=0;loc<tam_loc_data;loc++){
                    for(var i=0;i<tam_loc_data_obj;i++){
                        if((objArticuloGBL.monto_local_gbl).hasOwnProperty(Object.keys(custbody_efx_fe_tax_json.monto_local_gbl)[loc])){
                            if (Object.keys(custbody_efx_fe_tax_json.monto_local_gbl)[loc] == Object.keys(objArticuloGBL.monto_local_gbl)[i]) {
                                objArticuloGBL.monto_local_gbl[Object.keys(objArticuloGBL.monto_local_gbl)[i]] = (parseFloat(objArticuloGBL.monto_local_gbl[Object.keys(objArticuloGBL.monto_local_gbl)[i]]) + parseFloat(custbody_efx_fe_tax_json.monto_local_gbl[Object.keys(custbody_efx_fe_tax_json.monto_local_gbl)[loc]]));
                            }
                        }else{
                            objArticuloGBL.monto_local_gbl[Object.keys(custbody_efx_fe_tax_json.monto_local_gbl)[loc]] = (parseFloat(custbody_efx_fe_tax_json.monto_local_gbl[Object.keys(custbody_efx_fe_tax_json.monto_local_gbl)[loc]]));
                        }
                    }
                }
            }else{
                objArticuloGBL.monto_local_gbl = custbody_efx_fe_tax_json.monto_local_gbl;
            }

            var tam_ret_base = Object.keys(custbody_efx_fe_tax_json.bases_local).length;
            var tam_ret_base_obj = Object.keys(objArticuloGBL.bases_local_gbl).length;
            if(tam_ret_base_obj>0){
                for(var loc=0;loc<tam_ret_base;loc++){
                    for(var i=0;i<tam_ret_base_obj;i++){
                        if((objArticuloGBL.bases_local_gbl).hasOwnProperty(Object.keys(custbody_efx_fe_tax_json.bases_local)[loc])){
                            if (Object.keys(custbody_efx_fe_tax_json.bases_local)[loc] == Object.keys(objArticuloGBL.bases_local_gbl)[i]) {
                                objArticuloGBL.bases_local_gbl[Object.keys(objArticuloGBL.bases_local_gbl)[i]] = (parseFloat(objArticuloGBL.bases_local_gbl[Object.keys(objArticuloGBL.bases_local_gbl)[i]]) + parseFloat(custbody_efx_fe_tax_json.bases_local[Object.keys(custbody_efx_fe_tax_json.bases_local)[loc]]));
                            }
                        }else{
                            objArticuloGBL.bases_local_gbl[Object.keys(custbody_efx_fe_tax_json.bases_local)[loc]] = (parseFloat(custbody_efx_fe_tax_json.bases_local[Object.keys(custbody_efx_fe_tax_json.bases_local)[loc]]));
                        }
                    }
                }
            }else{
                objArticuloGBL.bases_local_gbl = custbody_efx_fe_tax_json.bases_local;
            }

            if(donativo){
                objArticuloGBL.donativo = 1;
            }

            return objArticuloGBL;

        }

        function buscaInfocfdi(idsFacturasArray){
            var objInfoCFDI = {
                custbody_mx_cfdi_usage:'',
                custbody_mx_txn_sat_payment_method:'',
                custbody_mx_txn_sat_payment_term:''
            };

            var buscaInfocfdi = search.create({
                type: search.Type.TRANSACTION,
                filters:[
                    ["type",search.Operator.ANYOF,"CustInvc","CashSale"],
                    "AND",
                    ["mainline",search.Operator.IS,"T"],
                    "AND",
                    ["internalid",search.Operator.ANYOF,idsFacturasArray]
                ],
                columns:[
                    search.createColumn({name: "tranid", label: "Número de documento"}),
                    search.createColumn({name: "amount", sort: search.Sort.DESC, label: "Importe"}),
                    search.createColumn({name: "custbody_mx_cfdi_usage", label: "Uso de CFDI"}),
                    search.createColumn({name: "custbody_mx_txn_sat_payment_method", label: "SAT Forma de Pago"}),
                    search.createColumn({name: "custbody_mx_txn_sat_payment_term", label: "SAT Método de Pago"})
                ],
                settings: [
                    search.createSetting({
                        name: 'consolidationtype',
                        value: 'NONE'
                    })]
            });

            var ejecutar_buscacfdi= buscaInfocfdi.run();
            var resultado_buscacfdi = ejecutar_buscacfdi.getRange(0, 100);

            objInfoCFDI.custbody_mx_cfdi_usage = resultado_buscacfdi[0].getValue({name:'custbody_mx_cfdi_usage'}) || '';
            objInfoCFDI.custbody_mx_txn_sat_payment_method = resultado_buscacfdi[0].getValue({name:'custbody_mx_txn_sat_payment_method'}) || '';
            objInfoCFDI.custbody_mx_txn_sat_payment_term = resultado_buscacfdi[0].getValue({name:'custbody_mx_txn_sat_payment_term'}) || '';

            log.audit({title:'objInfoCFDI',details:objInfoCFDI});
            return objInfoCFDI;

        }

        return {getInputData, map, reduce, summarize}

    });
