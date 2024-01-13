/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/record', 'N/search','N/url','N/file','N/format','N/runtime','N/config'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{search} search
     */
    function(https, record, search,urlMod,file,format,runtime,config) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        var contactos_envio = new Array();
        function onRequest(context) {

            var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });

            var requestParams = context.request.parameters;
            var parametros_array = getParameters(requestParams);
            log.audit({title:'parametros_array',details:parametros_array});
            var array_filtro = new Array();
            var scriptObj = runtime.getCurrentScript();
            var configKioskoId = context.request.parameters.custparam_config || '';
            var idKioskoConfig = record.load({
                type: 'customrecord_efx_kiosko_config',
                id: configKioskoId
            });
            var subsidiaria_config = idKioskoConfig.getValue({fieldId:'custrecord_efx_kiosko_company'}) || '';
            var conteo_operador = idKioskoConfig.getLineCount({sublistId:'recmachcustrecord_efx_fields_config'});
            var campos_refacturacion = idKioskoConfig.getValue({fieldId:'custrecord_efx_kiosko_copyfields'});
            var versioncfdi = idKioskoConfig.getValue({fieldId:'custrecord_efx_fe_kiosko_vf'});
            log.audit({title:'campos_refacturacion_read',details:campos_refacturacion});
            if(campos_refacturacion || campos_refacturacion=="[]"){
                campos_refacturacion = JSON.parse(campos_refacturacion);
            }else{
                campos_refacturacion=new Array();
            }
            log.audit({title:'campos_refacturacion_parsed',details:campos_refacturacion});
            var limite = 0;
            array_filtro.push(['mainline', search.Operator.IS, 'T']);
            array_filtro.push('AND');
            array_filtro.push(['type',search.Operator.ANYOF,"CustInvc","CashSale"]);
            array_filtro.push('AND');
            if(SUBSIDIARIES) {
                array_filtro.push(['subsidiary', search.Operator.ANYOF, subsidiaria_config]);
                array_filtro.push('AND');
            }
            for (var i = 0; i < (parametros_array.keys).length; i++) {
                limite++;
                for(var x=0;x<conteo_operador;x++){
                    var id_data = idKioskoConfig.getSublistValue({sublistId:'recmachcustrecord_efx_fields_config',fieldId:'custrecord_efx_fields_record_id',line:x});
                    if(id_data==parametros_array.keys[i]){
                        var operador = idKioskoConfig.getSublistValue({sublistId:'recmachcustrecord_efx_fields_config',fieldId:'custrecord_efx_kiosko_operator',line:x});
                        var tipo_dato = idKioskoConfig.getSublistValue({sublistId:'recmachcustrecord_efx_fields_config',fieldId:'custrecord_efx_fields_type',line:x});
                        if(tipo_dato==2){
                            var valor_numero = parseFloat(parametros_array.values[i]);
                            array_filtro.push([parametros_array.keys[i], operador, valor_numero.toFixed(2)]);
                        }else if(tipo_dato==3){
                            var fecha_ticket = parametros_array.values[i] || '';
                            var date_t = fecha_ticket.split('/');
                            var date_tt = new Date();
                            date_tt.setMonth(date_t[0]-1);
                            date_tt.setDate(date_t[1]);
                            date_tt.setFullYear(date_t[2]);
                            var parsedDate= format.format({
                                value: date_tt,
                                type: format.Type.DATE
                            });

                            log.audit({title:'parsedDate',details:parsedDate});
                            array_filtro.push([parametros_array.keys[i], operador, parsedDate]);

                        }else{
                            array_filtro.push([parametros_array.keys[i], operador, parametros_array.values[i]]);
                        }
                    }
                }

                if (limite < (parametros_array.keys).length) {
                    array_filtro.push('AND');
                }
            }
            log.audit({title:'array_filtro',details:array_filtro});


            //crear y devolver info

            var rfc_cliente = context.request.parameters.custparam_custentity_mx_rfc || '';

            // var rfc_cliente = context.request.parameters.custparam_rfc || '';
            //var tranid_ticket = context.request.parameters.custparam_numbertext || '';
            //var fecha_ticket = context.request.parameters.custparam_trandate || '';
            //var monto_ticket = parseFloat(context.request.parameters.custparam_amount) || '';
            //var accion_ticket = parseFloat(context.request.parameters.custparam_accion) || '';//valor 1 - facturar o 2 status

            /*if(monto_ticket){
                monto_ticket = monto_ticket.toFixed(2);
            }*/

            var getinfo_ticket = context.request.parameters.custparam_getinfo || '';
            var accion_ticket = context.request.parameters.custparam_accion || '';
            var create_ticket = context.request.parameters.custparam_genera || '';
            //certificar
            var cert_ticket = context.request.parameters.custparam_certifica || '';
            var ticket_transId = context.request.parameters.transId || '';
            var ticket_transType = context.request.parameters.transType || '';

            //crear

            if(context.request.body){
                log.audit({title:'body',details:context.request.body});
                log.audit({title:'headers',details:context.request.headers});
            }

            log.audit({title:'rfc_cliente',details:rfc_cliente});
            //log.audit({title:'tranid_ticket',details:tranid_ticket});
            log.audit({title:'get_info',details:getinfo_ticket});
            log.audit({title:'accion_ticket',details:accion_ticket});
            //log.audit({title:'monto_ticket',details:monto_ticket});
            log.audit({title:'create_ticket',details:create_ticket});
            //log.audit({title:'fecha_ticket',details:fecha_ticket});
            //certificar
            log.audit({title:'cert_ticket',details:cert_ticket});
            log.audit({title:'ticket_transId',details:ticket_transId});
            log.audit({title:'ticket_transType',details:ticket_transType});

            if(rfc_cliente!='XAXX010101000') {
                if (getinfo_ticket == 'T') {
                    if (accion_ticket == 'T') {
                        var info_cliente_obj = {
                            cliente: {
                                existe: false,
                                ieps: false,
                                rfc: rfc_cliente,
                                tipo: '',
                                nombre: '',
                                apellido: '',
                                subsidiaria: '',
                                uso_cfdi: {value: '', text: ''},
                                metodo_pago: {value: '', text: ''},
                                forma_pago: {value: '', text: ''},
                                regFiscal: {value: '', text: ''},
                                razonSocial: '',
                            },
                            direccion: {
                                calle: '',
                                n_exterior: '',
                                n_interior: '',
                                cp: '',
                                pais: '',
                                estado: '',
                                municipio: '',
                                colonia: ''
                            },
                            contactos: [],
                            transaccion: {
                                amount: '',
                                transId: '',
                                transName: '',
                                transType: '',
                                uuid: '',
                                consulta: false,
                                pdf: '',
                                xml: '',
                                pdf_name: '',
                                xml_name: '',
                                isClient: false
                            },
                            success: false,
                            code: 100,
                            msg: ''
                        }

                        log.audit({title: 'info_cliente_obj', details: info_cliente_obj});
                        //
                        // var dateparse = format.format({
                        //     value: fecha_ticket,
                        //     type: format.Type.DATE
                        // });
                        //
                        // log.audit({title:'dateparse',details:dateparse});

                        var columnas_busqueda = new Array();
                        columnas_busqueda.push();
                        columnas_busqueda.push(search.createColumn({name: 'internalid'}));
                        columnas_busqueda.push(search.createColumn({name: 'tranid'}));
                        columnas_busqueda.push(search.createColumn({name: 'amount'}));
                        columnas_busqueda.push(search.createColumn({name: 'type'}));
                        columnas_busqueda.push(search.createColumn({name: 'entity'}));
                        if(SUBSIDIARIES) {
                            columnas_busqueda.push(search.createColumn({name: 'subsidiary'}));
                        }
                        columnas_busqueda.push(search.createColumn({name: "custentity_mx_rfc", join: "customer"}));
                        columnas_busqueda.push(search.createColumn({name: "isperson", join: "customer"}));
                        columnas_busqueda.push(search.createColumn({name: "custentity_efx_cmp_registra_ieps", join: "customer"}));
                        columnas_busqueda.push(search.createColumn({name: "firstname", join: "customer"}));
                        columnas_busqueda.push(search.createColumn({name: "lastname", join: "customer"}));
                        columnas_busqueda.push(search.createColumn({name: "custentity_mx_sat_industry_type", join: "customer"}));
                        columnas_busqueda.push(search.createColumn({name: 'custbody_mx_cfdi_usage'}));
                        columnas_busqueda.push(search.createColumn({name: 'custbody_mx_txn_sat_payment_method'}));
                        columnas_busqueda.push(search.createColumn({name: 'custbody_mx_txn_sat_payment_term'}));
                        columnas_busqueda.push(search.createColumn({name: 'custbody_mx_cfdi_uuid'}));
                        columnas_busqueda.push(search.createColumn({name: 'custbody_efx_fe_invoice_related'}));
                        columnas_busqueda.push(search.createColumn({name: 'custbody_efx_fe_kiosko_customer'}));
                        columnas_busqueda.push(search.createColumn({name: 'custbody_edoc_generated_pdf'}));
                        columnas_busqueda.push(search.createColumn({name: 'custbody_psg_ei_certified_edoc'}));
                        columnas_busqueda.push(search.createColumn({name: 'custbody_efx_fe_gbl_related'}));


                        var search_ticket = search.create({
                            type: search.Type.TRANSACTION,
                            filters: array_filtro,
                            // [["mainline",search.Operator.IS,"T"],"AND",["amount",search.Operator.EQUALTO,monto_ticket],"AND",["trandate",search.Operator.ON,fecha_ticket],"AND",['numbertext', search.Operator.IS, tranid_ticket]]
                            /*['numbertext', search.Operator.IS, tranid_ticket]
                            , 'and',
                            ['amount', search.Operator.EQUALTO, monto_ticket]
                            , 'and',
                            ['trandate', search.Operator.ON, fecha_ticket]*/
                            // , 'and',
                            //['customermain.custentity_mx_rfc', search.Operator.IS, rfc_cliente]
                            columns:columnas_busqueda
                            // columns: [
                            //     search.createColumn({name: 'internalid'}),
                            //     search.createColumn({name: 'tranid'}),
                            //     search.createColumn({name: 'amount'}),
                            //     search.createColumn({name: 'type'}),
                            //     search.createColumn({name: 'entity'}),
                            //     search.createColumn({name: 'subsidiary'}),
                            //     //datos cliente
                            //     search.createColumn({name: "custentity_mx_rfc", join: "customer"}),
                            //     search.createColumn({name: "isperson", join: "customer"}),
                            //     search.createColumn({name: "custentity_efx_cmp_registra_ieps", join: "customer"}),
                            //     search.createColumn({name: "firstname", join: "customer"}),
                            //     search.createColumn({name: "lastname", join: "customer"}),
                            //     search.createColumn({name: 'custbody_mx_cfdi_usage'}),
                            //     search.createColumn({name: 'custbody_mx_txn_sat_payment_method'}),
                            //     search.createColumn({name: 'custbody_mx_txn_sat_payment_term'}),
                            //     search.createColumn({name: 'custbody_mx_cfdi_uuid'}),
                            //     search.createColumn({name: 'custbody_efx_fe_invoice_related'}),
                            //     search.createColumn({name: 'custbody_efx_fe_kiosko_customer'}),
                            //     search.createColumn({name: 'custbody_edoc_generated_pdf'}),
                            //     search.createColumn({name: 'custbody_psg_ei_certified_edoc'}),
                            //     search.createColumn({name: 'custbody_efx_fe_gbl_related'}),
                            // ]
                        });
                        log.audit({title: 'search_ticket', details: search_ticket.filterExpression});
                        var ejecutar = search_ticket.run();

                        var resultado = ejecutar.getRange(0, 100);
                        log.audit({title: 'resultado.length', details: resultado.length});
                        if (resultado.length > 0) {
                            for (var i = 0; i < resultado.length; i++) {
                                var id_related_fac = resultado[i].getValue({name: 'custbody_efx_fe_invoice_related'}) || '';
                                var cliente_kioskotimbra = resultado[i].getValue({name: 'custbody_efx_fe_kiosko_customer'}) || '';
                                var pdf_original = resultado[i].getValue({name: 'custbody_edoc_generated_pdf'}) || '';
                                var xml_original = resultado[i].getValue({name: 'custbody_psg_ei_certified_edoc'}) || '';
                                var timbrado_original = resultado[i].getValue({name: 'custbody_mx_cfdi_uuid'}) || '';
                                var type_transaction = resultado[i].getValue({name: 'type'}) || '';
                                var gblrelacionada = resultado[i].getValue({name: 'custbody_efx_fe_gbl_related'}) || '';
                            }

                            var timbrado = '';
                            var id_pdf = '';
                            var id_xml = '';
                            var cliente_related = '';
                            var rfc_related = '';

                            if (id_related_fac) {
                                var tipo_transaccion = '';
                                if (type_transaction == 'CustInvc') {
                                    tipo_transaccion = record.Type.INVOICE;
                                }

                                if (type_transaction == 'CashSale') {
                                    tipo_transaccion = record.Type.CASH_SALE;
                                }

                                try{
                                    var record_related = record.load({
                                        type: record.Type.INVOICE,
                                        id: id_related_fac
                                    });
                                }catch(error_tipo){
                                    var record_related = record.load({
                                        type: record.Type.CASH_SALE,
                                        id: id_related_fac
                                    });
                                }

                                timbrado = record_related.getValue({fieldId: 'custbody_mx_cfdi_uuid'});
                                id_pdf = record_related.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                                id_xml = record_related.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});
                                cliente_related = record_related.getValue({fieldId: 'entity'});
                                var cli_related = record.load({
                                    type: record.Type.CUSTOMER,
                                    id: cliente_related
                                });

                                rfc_related = cli_related.getValue({fieldId: 'custentity_mx_rfc'});
                            }else if(cliente_kioskotimbra && !gblrelacionada){
                                id_pdf = pdf_original;
                                id_xml = xml_original;
                                timbrado = timbrado_original;
                            }

                            if (!timbrado && !id_xml) {
                               /* if (rfc_related && rfc_cliente != 'XAXX010101000') {
                                    if (rfc_related != rfc_cliente) {
                                        cli_related.setValue({fieldId: 'custentity_mx_rfc', value: rfc_cliente});
                                        cli_related.save();
                                    }
                                }*/

                                if (resultado.length > 0 && rfc_cliente != 'XAXX010101000') {
                                    var infoCliente = buscarCliente(info_cliente_obj, rfc_cliente,'F',SUBSIDIARIES);
                                    log.audit({title: 'infoCliente', details: infoCliente});
                                    //si el cliente existe en el sistema
                                    log.audit({
                                        title: 'infoCliente.cliente.existe',
                                        details: infoCliente.cliente.existe
                                    });
                                    if (infoCliente.cliente.existe) {

                                        // info_cliente_obj = infoCliente;
                                        log.audit({title: 'info_cliente_obj', details: info_cliente_obj});

                                        for (var x = 0; x < resultado.length; x++) {
                                            var id_transaction = resultado[x].getValue({name: 'internalid'}) || '';
                                            var type_transaction = resultado[x].getValue({name: 'type'}) || '';
                                            var entity_transaction = resultado[x].getValue({name: 'entity'}) || '';
                                            var uuid_transaction = resultado[x].getValue({name: 'custbody_mx_cfdi_uuid'}) || '';
                                            info_cliente_obj.transaccion.transId = id_transaction;
                                            info_cliente_obj.transaccion.transName = resultado[x].getValue({name: 'tranid'}) || '';
                                            info_cliente_obj.transaccion.amount = resultado[x].getValue({name: 'amount'}) || 0;
                                            info_cliente_obj.transaccion.transType = type_transaction;
                                            info_cliente_obj.transaccion.uuid = resultado[x].getValue({name: 'custbody_mx_cfdi_uuid'});
                                            info_cliente_obj.cliente.uso_cfdi.value = resultado[x].getValue({name: 'custbody_mx_cfdi_usage'});
                                            info_cliente_obj.cliente.metodo_pago.value = resultado[x].getValue({name: 'custbody_mx_txn_sat_payment_term'});
                                            info_cliente_obj.cliente.forma_pago.value = resultado[x].getValue({name: 'custbody_mx_txn_sat_payment_method'});
                                            info_cliente_obj.cliente.uso_cfdi.text = resultado[x].getText({name: 'custbody_mx_cfdi_usage'});
                                            info_cliente_obj.cliente.metodo_pago.text = resultado[x].getText({name: 'custbody_mx_txn_sat_payment_term'});
                                            info_cliente_obj.cliente.forma_pago.text = resultado[x].getText({name: 'custbody_mx_txn_sat_payment_method'});

                                            var rfc_transaction = resultado[x].getValue({
                                                name: "custentity_mx_rfc",
                                                join: "customer"
                                            }) || '';



                                            //si ya existe el cliente dado de alta y la transaccion lo tiene registrado
                                            if (rfc_transaction == rfc_cliente) {
                                                info_cliente_obj.transaccion.isClient = true;
                                            }

                                            var direcciones = buscarDirecciones(info_cliente_obj, infoCliente.cliente.id);
                                            //info_cliente_obj = direcciones;

                                            var contactos = buscarContactos(info_cliente_obj, infoCliente.cliente.id);
                                            info_cliente_obj.success = true;
                                            //info_cliente_obj = contactos;

                                        }
                                        //por si no existe el cliente en el sistema
                                    } else {
                                        for (var x = 0; x < resultado.length; x++) {

                                            info_cliente_obj.transaccion.transId = resultado[x].getValue({name: 'internalid'}) || '';
                                            info_cliente_obj.transaccion.transName = resultado[x].getValue({name: 'tranid'}) || '';
                                            info_cliente_obj.transaccion.transType = resultado[x].getValue({name: 'type'}) || '';
                                            info_cliente_obj.transaccion.uuid = resultado[x].getValue({name: 'custbody_mx_cfdi_uuid'});
                                            info_cliente_obj.cliente.uso_cfdi.value = resultado[x].getValue({name: 'custbody_mx_cfdi_usage'});
                                            info_cliente_obj.cliente.metodo_pago.value = resultado[x].getValue({name: 'custbody_mx_txn_sat_payment_term'});
                                            info_cliente_obj.cliente.forma_pago.value = resultado[x].getValue({name: 'custbody_mx_txn_sat_payment_method'});
                                            info_cliente_obj.cliente.uso_cfdi.text = resultado[x].getText({name: 'custbody_mx_cfdi_usage'});
                                            info_cliente_obj.cliente.metodo_pago.text = resultado[x].getText({name: 'custbody_mx_txn_sat_payment_term'});
                                            info_cliente_obj.cliente.forma_pago.text = resultado[x].getText({name: 'custbody_mx_txn_sat_payment_method'});
                                            info_cliente_obj.cliente.subsidiaria = resultado[x].getValue({name: 'subsidiary'});
                                            info_cliente_obj.transaccion.amount = resultado[x].getValue({name: 'amount'});
                                            //info_cliente_obj.transaccion.amount = monto_ticket;
                                            info_cliente_obj.success = true;
                                        }

                                    }
                                    log.audit({title: 'info_cliente_obj', details: info_cliente_obj});
                                    context.response.write({
                                        output: JSON.stringify(info_cliente_obj)
                                    });
                                } else {
                                    //si no encuentra transaccion el transId viene vacio
                                    context.response.write({
                                        output: JSON.stringify(info_cliente_obj)
                                    });
                                }
                            } else {

                                var xml_obj = file.load({id: id_xml});
                                var pdf_obj = file.load({id: id_pdf});

                                log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                log.audit({title: 'pdf_obj.url', details: pdf_obj.url});

                                var host = urlMod.resolveDomain({
                                    hostType: urlMod.HostType.APPLICATION
                                });


                                info_cliente_obj.transaccion.consulta = true;
                                info_cliente_obj.transaccion.uuid = timbrado;
                                // info_cliente_obj.transaccion.pdf = 'https://' + host + pdf_obj.url;
                                // info_cliente_obj.transaccion.xml = 'https://' + host + xml_obj.url;
                                info_cliente_obj.transaccion.pdf = id_pdf;
                                info_cliente_obj.transaccion.xml = id_xml;
                                info_cliente_obj.transaccion.pdf_name = pdf_obj.name;

                                info_cliente_obj.transaccion.xml_name = xml_obj.name;
                                info_cliente_obj.success = true;
                                context.response.write({
                                    output: JSON.stringify(info_cliente_obj)
                                });
                            }
                        } else {
                            info_cliente_obj.success = false;
                            info_cliente_obj.msg = 'No se encontró su ticket, favor de revisar si sus datos son correctos!';
                            context.response.write({
                                output: JSON.stringify(info_cliente_obj)
                            });
                        }

                    } else if (accion_ticket == 'F') {

                        log.audit({title: 'consulta', details: 'consulta'});
                        var consulta_Obj = {
                            success: false,
                            code: 100,
                            msg: '',
                            transaccion: {
                                tranid: '',
                                pdf: '',
                                xml: '',
                                pdf_name: '',
                                xml_name: '',
                                consulta: false,
                                uuid: ''
                            }
                        }
                        try {

                            var search_ticket = search.create({
                                type: search.Type.TRANSACTION,
                                filters: array_filtro,//[

                                    /*['mainline', search.Operator.IS, 'T']
                                    , 'and',
                                    ['numbertext', search.Operator.IS, tranid_ticket]
                                    , 'and',
                                    ['amount', search.Operator.EQUALTO, monto_ticket]
                                    , 'and',
                                    ['trandate', search.Operator.ON, fecha_ticket]*/
                                    // , 'and',
                                    //['customermain.custentity_mx_rfc', search.Operator.IS, rfc_cliente]
                                //],
                                columns: [
                                    search.createColumn({name: 'internalid'}),
                                    search.createColumn({name: 'tranid'}),
                                    search.createColumn({name: 'custbody_mx_cfdi_uuid'}),
                                    search.createColumn({name: 'custbody_edoc_generated_pdf'}),
                                    search.createColumn({name: 'custbody_psg_ei_certified_edoc'}),
                                    search.createColumn({name: 'custbody_efx_fe_invoice_related'}),
                                    search.createColumn({name: 'custbody_efx_fe_kiosko_customer'}),
                                    search.createColumn({name: 'custbody_mx_customer_rfc'}),
                                    search.createColumn({name: 'type'}),
                                    search.createColumn({name: 'custbody_efx_fe_gbl_related'}),
                                ]
                            });
                            var ejecutar = search_ticket.run();
                            var resultado = ejecutar.getRange(0, 100);

                            log.audit({title: 'resultado.length', details: resultado.length});
                            for (var x = 0; x < resultado.length; x++) {
                                var relacionada = resultado[x].getValue({name: 'custbody_efx_fe_invoice_related'});
                                var cliente_kioskotimbra = resultado[x].getValue({name: 'custbody_efx_fe_kiosko_customer'});
                                var pdf_original = resultado[x].getValue({name: 'custbody_edoc_generated_pdf'});
                                var xml_original = resultado[x].getValue({name: 'custbody_psg_ei_certified_edoc'});
                                var timbrado_original = resultado[x].getValue({name: 'custbody_mx_cfdi_uuid'});
                                var type_transaction = resultado[x].getValue({name: 'type'}) || '';
                                var rfc_transaccion = resultado[x].getValue({name: 'custbody_mx_customer_rfc'}) || '';
                                var globalrelated = resultado[x].getValue({name: 'custbody_efx_fe_gbl_related'}) || '';
                            }

                            log.audit({title: 'relacionada', details: relacionada});
                            log.audit({title: 'cliente_kioskotimbra', details: cliente_kioskotimbra});
                            log.audit({title: 'pdf_original', details: pdf_original});
                            log.audit({title: 'xml_original', details: xml_original});
                            log.audit({title: 'timbrado_original', details: timbrado_original});
                            log.audit({title: 'globalrelated', details: globalrelated});

                            if((cliente_kioskotimbra || rfc_transaccion!='XAXX010101000') && !globalrelated){
                                if (pdf_original && xml_original && timbrado_original) {

                                    var xml_obj = file.load({id: xml_original});
                                    var pdf_obj = file.load({id: pdf_original});

                                    log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                    log.audit({title: 'pdf_obj.url', details: pdf_obj.url});

                                    var host = urlMod.resolveDomain({
                                        hostType: urlMod.HostType.APPLICATION
                                    });

                                    consulta_Obj.success = true;
                                    // consulta_Obj.transaccion.xml = 'https://' + host + xml_obj.url;
                                    // consulta_Obj.transaccion.pdf = 'https://' + host + pdf_obj.url;
                                    consulta_Obj.transaccion.xml = xml_original;
                                    consulta_Obj.transaccion.pdf = pdf_original;
                                    consulta_Obj.transaccion.pdf_name = pdf_obj.name;
                                    consulta_Obj.transaccion.xml_name = xml_obj.name;
                                    consulta_Obj.transaccion.consulta = true;
                                    consulta_Obj.transaccion.uuid = timbrado;

                                } else {
                                    consulta_Obj.transaccion.consulta = false;
                                    consulta_Obj.success = false;
                                    consulta_Obj.msg = 'No se encontró la información de ticket que intenta consultar!';
                                }
                            }else {
                                if (relacionada) {

                                    var tipo_transaccion = '';
                                    if (type_transaction == 'CustInvc') {
                                        tipo_transaccion = record.Type.INVOICE;
                                    }

                                    if (type_transaction == 'CashSale') {
                                        tipo_transaccion = record.Type.CASH_SALE;
                                    }

                                    try {
                                        var record_related = record.load({
                                            type: record.Type.INVOICE,
                                            id: relacionada
                                        });
                                    }catch(error_tiporelacionada){
                                        var record_related = record.load({
                                            type: record.Type.CASH_SALE,
                                            id: relacionada
                                        });
                                    }

                                    var timbrado = record_related.getValue({fieldId: 'custbody_mx_cfdi_uuid'});
                                    consulta_Obj.transaccion.tranid = record_related.getValue({fieldId: 'tranid'});
                                    var id_pdf = record_related.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                                    var id_xml = record_related.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});

                                    log.audit({title: 'timbrado', details: timbrado});
                                    log.audit({title: 'id_pdf', details: id_pdf});
                                    log.audit({title: 'id_xml', details: id_xml});
                                    if (timbrado && id_pdf && id_xml) {

                                        var xml_obj = file.load({id: id_xml});
                                        var pdf_obj = file.load({id: id_pdf});

                                        log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                        log.audit({title: 'pdf_obj.url', details: pdf_obj.url});

                                        var host = urlMod.resolveDomain({
                                            hostType: urlMod.HostType.APPLICATION
                                        });

                                        consulta_Obj.success = true;
                                        // consulta_Obj.transaccion.xml = 'https://' + host + xml_obj.url;
                                        // consulta_Obj.transaccion.pdf = 'https://' + host + pdf_obj.url;
                                        consulta_Obj.transaccion.xml = id_xml;
                                        consulta_Obj.transaccion.pdf = id_pdf;
                                        consulta_Obj.transaccion.pdf_name = pdf_obj.name;
                                        consulta_Obj.transaccion.xml_name = xml_obj.name;
                                        consulta_Obj.transaccion.consulta = true;
                                        consulta_Obj.transaccion.uuid = timbrado;

                                    } else {
                                        consulta_Obj.transaccion.consulta = false;
                                        consulta_Obj.success = false;
                                        consulta_Obj.msg = 'No se encontró la información de ticket que intenta consultar!';
                                    }

                                } else {
                                    consulta_Obj.transaccion.consulta = false;
                                    consulta_Obj.success = false;
                                    consulta_Obj.msg = 'El ticket que intenta consultar no se encuentra timbrado aún!';
                                }
                            }

                            context.response.write({
                                output: JSON.stringify(consulta_Obj)
                            });
                        } catch (error_consulta) {
                            log.audit({title: 'error_consulta', details: error_consulta});
                            context.response.write({
                                output: JSON.stringify(consulta_Obj)
                            });
                        }

                    }
                }
            }else{

                var info_cliente_obj = {
                    cliente: {
                        existe: false,
                        ieps: false,
                        rfc: rfc_cliente,
                        tipo: '',
                        nombre: '',
                        apellido: '',
                        subsidiaria: '',
                        uso_cfdi: {value: '', text: ''},
                        metodo_pago: {value: '', text: ''},
                        forma_pago: {value: '', text: ''},
                        regFiscal: {value: '', text: ''},
                        razonSocial: '',
                    },
                    direccion: {
                        calle: '',
                        n_exterior: '',
                        n_interior: '',
                        cp: '',
                        pais: '',
                        estado: '',
                        municipio: '',
                        colonia: ''
                    },
                    contactos: [],
                    transaccion: {
                        amount: '',
                        transId: '',
                        transName: '',
                        transType: '',
                        uuid: '',
                        consulta: false,
                        pdf: '',
                        xml: '',
                        pdf_name: '',
                        xml_name: '',
                        isClient: false
                    },
                    success: false,
                    code: 100,
                    msg: ''
                }

                info_cliente_obj.success = false;
                info_cliente_obj.msg = 'No se puede generar un CFDI para un RFC generico: XAXX010101000';
                context.response.write({
                    output: JSON.stringify(info_cliente_obj)
                });
            }

            if(create_ticket=='T') {

                if(context.request.body) {

                    var body = JSON.parse(context.request.body);

                    var scriptObj = runtime.getCurrentScript();
                    var configKioskoId = context.request.parameters.custparam_config || '';

                    log.audit({title:'configKioskoId',details:configKioskoId});

                    var idKioskoConfig = record.load({
                        type: 'customrecord_efx_kiosko_config',
                        id: configKioskoId
                    });

                    var document_pack = idKioskoConfig.getValue({fieldId:'custrecord_efx_kosko_documentpack'});
                    var plantilla_f = idKioskoConfig.getValue({fieldId:'custrecord_efx_fe_factura_template'});
                    var datos_clientes = idKioskoConfig.getValue({fieldId:'custrecord_efx_kiosko_aditional_info'});
                    if(datos_clientes){
                        datos_clientes = JSON.parse(datos_clientes);
                    }
                    // var body = {
                    //     "cliente": {
                    //         "existe": true,
                    //         "rfc": "RALM920512HG8",
                    //         "tipo": "T",
                    //         "nombre": "Empresa",
                    //         "apellido": "LM",
                    //         "subsidiaria": "5",
                    //         "uso_cfdi": {
                    //             "value": "3",
                    //             "text": "G03 - Expenses in General"
                    //         },
                    //         "metodo_pago": {
                    //             "value": "3",
                    //             "text": "03 - Electronic Funds Transfer"
                    //         },
                    //         "forma_pago": {
                    //             "value": "4",
                    //             "text": "PPD - Payment in Installments or Deferred"
                    //         }
                    //     },
                    //     "direccion": {
                    //         "calle": "",
                    //         "n_exterior": "",
                    //         "n_interior": "",
                    //         "cp": "",
                    //         "pais": "",
                    //         "estado": "",
                    //         "municipio": "",
                    //         "colonia": ""
                    //     },
                    //     "contactos": [],
                    //     "transaccion": {
                    //         "transId": "9824",
                    //         "transType": "CustInvc",
                    //         "uuid": "",
                    //         "isClient": false
                    //     },
                    //     "success": false
                    // }

                    var cliente_objeto = '';
                    if (!body.cliente.existe) {
                        //aqui va a ser en caso de que el cliente no exista dentro de Netsuite
                        cliente_objeto = crearCliente(body,document_pack,datos_clientes,versioncfdi);
                    }else{
                        ActualizarCliente(body,document_pack,datos_clientes,versioncfdi);
                        var contactos = buscarContactosNuevos(body, body.cliente.id);

                        log.audit({title:'contactos',details:contactos});

                        if(contactos.length>0){
                            crearContactosExiste(body.cliente.id,contactos,body);
                        }
                    }


                    var tipo_persona = '';
                    if(body.cliente.tipo){
                        tipo_persona = 'T';
                    }else{
                        tipo_persona = 'F';
                    }


                    var tipo_transaccion = '';
                    if (body.transaccion.transType == 'CustInvc') {
                        tipo_transaccion = record.Type.INVOICE;
                    }

                    if (body.transaccion.transType == 'CashSale') {
                        tipo_transaccion = record.Type.CASH_SALE;
                    }
                    var record_tipo = record.load({
                        type: tipo_transaccion,
                        id: body.transaccion.transId,
                        isDynamic: false,
                    });
                    var relacionada_fact = record_tipo.getValue({
                        fieldId: 'custbody_efx_fe_invoice_related',
                    });

                    var uuid_fact = record_tipo.getValue({
                        fieldId: 'custbody_mx_cfdi_uuid',
                    });

                    var certificado_fact = record_tipo.getValue({
                        fieldId: 'custbody_psg_ei_certified_edoc',
                    });

                    var global_fact = record_tipo.getValue({
                        fieldId: 'custbody_efx_fe_gbl_related',
                    });

                    var cliente_k_fact = record_tipo.getValue({
                        fieldId: 'custbody_efx_fe_kiosko_customer',
                    });

                    var clienteoriginal_fact = record_tipo.getValue({
                        fieldId: 'entity',
                    });

                    if(SUBSIDIARIES){
                        var subsidiaryresico = record_tipo.getValue({
                            fieldId: 'subsidiary',
                        });
                        if(subsidiaryresico){
                            var subsidiaria_obj = record.load({
                                type: record.Type.SUBSIDIARY,
                                id: subsidiaryresico
                            });
                        }
                    }else{
                        var subsidiaria_obj = config.load({
                            type: config.Type.COMPANY_INFORMATION
                        });
                    }

                    var idIndustria = subsidiaria_obj.getValue('custrecord_mx_sat_industry_type');
                    var regFiscalSubsidiaria = '';
                    if(idIndustria){
                        var campos = search.lookupFields({
                            id: idIndustria,
                            type: 'customrecord_mx_sat_industry_type',
                            columns: ['custrecord_mx_sat_it_code', 'name'],
                        });

                        regFiscalSubsidiaria = campos.name;
                    }

                    if (!body.transaccion.isClient || body.cliente.rfc == 'XAXX010101000' || (global_fact && body.cliente.rfc != 'XAXX010101000')) {
                        log.audit({title:'body.transaccion.isClient',details:body.transaccion.isClient});
                        log.audit({title: 'existePgeneral', details: ''});
                        //en esta condicion se genera la logica cuando las facturas tienen cliente publico en gral
                        //se va generar una nota de crédito para la factura actual y se va a timbrar
                        //además se generará una factura exactamente igual pero con el cliente nuevo

                        var generado_xml = '';
                        var generado_pdf = '';

                        var id_factura_nueva = '';
                        if ((!relacionada_fact && !cliente_k_fact) || (!relacionada_fact && cliente_k_fact && global_fact)) {
                            if((uuid_fact || certificado_fact) && (!cliente_k_fact || (!relacionada_fact && cliente_k_fact && global_fact))) {
                                log.audit({title: 'NoTieneRelacionada', details: ''});
                                id_factura_nueva = crearFactura(body.transaccion.transId, tipo_transaccion, cliente_objeto, body, plantilla_f,clienteoriginal_fact,SUBSIDIARIES,campos_refacturacion,regFiscalSubsidiaria);
                                if (id_factura_nueva) {
                                    record_tipo.setValue({
                                        fieldId: 'custbody_efx_fe_invoice_related',
                                        value: id_factura_nueva,
                                        ignoreFieldChange: true
                                    });


                                    record_tipo.save({
                                        enableSourcing: true,
                                        ignoreMandatoryFields: true
                                    });
                                }
                            }else{
                                var id_cliente = '';
                                if (!cliente_objeto) {
                                    id_cliente = buscarCliente(body, body.cliente.rfc, 'T',SUBSIDIARIES);
                                } else {
                                    id_cliente = cliente_objeto;
                                }
                                cliente_k_fact = id_cliente;

                                var cliente_obj = record.load({
                                    type: record.Type.CUSTOMER,
                                    id: id_cliente
                                });

                                var array_clientes = cliente_obj.getValue({fieldId: 'custentity_efx_fe_kiosko_contact'});

                                log.audit({title: 'id_cliente', details: id_cliente});
                                log.audit({title: 'array_clientes', details: array_clientes});
                                log.audit({title: 'record_tipo', details: record_tipo});
                                log.audit({title: 'tipo_transaccion', details: tipo_transaccion});
                                log.audit({title: 'body.transaccion.transId', details: body.transaccion.transId});

                                var uso_cfdi = body.cliente.uso_cfdi.value;
                                var pay_method = body.cliente.metodo_pago.value;
                                var pay_form = body.cliente.forma_pago.value;
                                log.audit({title: 'uso_cfdi', details: uso_cfdi});
                                log.audit({title: 'pay_method', details: pay_method});
                                log.audit({title: 'pay_form', details: pay_form});
                                record_tipo.setValue({
                                    fieldId: 'custbody_mx_cfdi_usage',
                                    value: uso_cfdi
                                });
                                record_tipo.setValue({
                                    fieldId: 'custbody_mx_txn_sat_payment_method',
                                    value: pay_form

                                });
                                record_tipo.setValue({
                                    fieldId: 'custbody_mx_txn_sat_payment_term',
                                    value: pay_method
                                });

                                record_tipo.setValue({
                                    fieldId: 'custbody_efx_fe_kiosko_customer',
                                    value: id_cliente,
                                    ignoreFieldChange: true
                                });

                                record_tipo.setValue({
                                    fieldId: 'custbody_efx_fe_mail_to',
                                    value: array_clientes,
                                    ignoreFieldChange: true
                                });

                                var numLines = record_tipo.getLineCount({
                                    sublistId: 'item'
                                });
                                var tax_sublist = new Array();
                                for (var i = 0; i < numLines; i++) {
                                    tax_sublist[i] = record_tipo.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'taxcode',
                                        line: i,
                                    });
                                }
                                regimenCliente = (regFiscalSubsidiaria).split(" - ");
                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2568 ~ ' + regimenCliente[0]});
                                    // regimenCliente = parseInt(regimenCliente);
                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2570 ~ ' + typeof regimenCliente[0]+' '+ regimenCliente[0]});
                                    if (regimenCliente[0] == "626" && tipo_persona=="F") {
                                        log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2550 ~ ' + tax_sublist});
                                        resicoTaxObj = buscaRESICO();
                                        // log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ resicoTaxObj', details: 'resicoTaxObj ~ 2575 ~ ' + JSON.stringify(resicoTaxObj)});
                                        for (var nstaxcode = 0; nstaxcode < tax_sublist.length; nstaxcode++) {
                                            for (var resico = 0; resico < resicoTaxObj.length; resico++) {
                                                if (tax_sublist[nstaxcode] == resicoTaxObj[resico].nstaxcode) {
                                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ IF', details: ' ~ 2592 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                                                    tax_sublist[nstaxcode] = resicoTaxObj[resico].resicotaxcode
                                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2593 ~ ' + tax_sublist[nstaxcode]});
                                                } else {
                                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ ELSE', details: ' ~ 2594 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                                                }
                                            }
                                        }
                                        for (var x = 0; x < numLines; x++) {
                                            record_tipo.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'taxcode',
                                                line: x,
                                                value: tax_sublist[x]
                                            });
                                        }
                                    }


                                record_tipo.save({
                                    enableSourcing: true,
                                    ignoreMandatoryFields: true
                                });
                            }
                        } else {
                            log.audit({title: 'TieneRelacionada', details: ''});

                            if(cliente_k_fact){
                                var id_cliente = '';
                                if (!cliente_objeto) {
                                    id_cliente = buscarCliente(body, body.cliente.rfc, 'T',SUBSIDIARIES);
                                } else {
                                    id_cliente = cliente_objeto;
                                }

                                generado_pdf = record_tipo.getValue({fieldId:'custbody_edoc_generated_pdf'});
                                generado_xml = record_tipo.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
                                var rfcclientekiosko = record_tipo.getValue({fieldId:'custbody_efx_fe_kiosko_rfc'});

                                var uso_cfdi = body.cliente.uso_cfdi.value;
                                var pay_method = body.cliente.metodo_pago.value;
                                var pay_form = body.cliente.forma_pago.value;
                                log.audit({title: 'uso_cfdi', details: uso_cfdi});
                                log.audit({title: 'pay_method', details: pay_method});
                                log.audit({title: 'pay_form', details: pay_form});
                                record_tipo.setValue({
                                    fieldId: 'custbody_mx_cfdi_usage',
                                    value: uso_cfdi
                                });
                                record_tipo.setValue({
                                    fieldId: 'custbody_mx_txn_sat_payment_method',
                                    value: pay_form

                                });
                                record_tipo.setValue({
                                    fieldId: 'custbody_mx_txn_sat_payment_term',
                                    value: pay_method
                                });
                                record_tipo.setValue({
                                    fieldId: 'custbody_efx_fe_kiosko_customer',
                                    value: id_cliente,
                                    ignoreFieldChange: true
                                });
                                if(rfcclientekiosko){
                                    if(body.cliente.rfc!=rfcclientekiosko){
                                        record_tipo.setValue({fieldId:'custbody_efx_fe_kiosko_rfc',value:body.cliente.rfc});
                                    }

                                }

                                if(id_cliente){
                                    var cliente_obj_k = record.load({
                                        type: record.Type.CUSTOMER,
                                        id: id_cliente
                                    });

                                    var array_clientes_k = cliente_obj_k.getValue({fieldId: 'custentity_efx_fe_kiosko_contact'});

                                    log.audit({title: 'array_clientes_k', details: array_clientes_k});

                                    record_tipo.setValue({
                                        fieldId: 'custbody_efx_fe_mail_to',
                                        value: array_clientes_k,
                                        ignoreFieldChange: true
                                    });


                                }

                                var numLines = record_tipo.getLineCount({
                                    sublistId: 'item'
                                });
                                var tax_sublist = new Array();
                                for (var i = 0; i < numLines; i++) {
                                    tax_sublist[i] = record_tipo.getSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'taxcode',
                                        line: i,
                                    });
                                }
                                regimenCliente = (regFiscalSubsidiaria).split(" - ");
                                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2568 ~ ' + regimenCliente[0]});
                                // regimenCliente = parseInt(regimenCliente);
                                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2570 ~ ' + typeof regimenCliente[0]+' '+ regimenCliente[0]});
                                if (regimenCliente[0] == "626" && tipo_persona=="F") {
                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2550 ~ ' + tax_sublist});
                                    resicoTaxObj = buscaRESICO();
                                    // log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ resicoTaxObj', details: 'resicoTaxObj ~ 2575 ~ ' + JSON.stringify(resicoTaxObj)});
                                    for (var nstaxcode = 0; nstaxcode < tax_sublist.length; nstaxcode++) {
                                        for (var resico = 0; resico < resicoTaxObj.length; resico++) {
                                            if (tax_sublist[nstaxcode] == resicoTaxObj[resico].nstaxcode) {
                                                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ IF', details: ' ~ 2592 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                                                tax_sublist[nstaxcode] = resicoTaxObj[resico].resicotaxcode
                                                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2593 ~ ' + tax_sublist[nstaxcode]});
                                            } else {
                                                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ ELSE', details: ' ~ 2594 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                                            }
                                        }
                                    }
                                    for (var x = 0; x < numLines; x++) {
                                        record_tipo.setSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxcode',
                                            line: x,
                                            value: tax_sublist[x]
                                        });
                                    }
                                }


                                var contactodekiosko = record_tipo.getValue({fieldId:'custbody_efx_fe_mail_to'});
                                log.audit({title: 'contactodekiosko', details: contactodekiosko});
                                record_tipo.save({
                                    enableSourcing: true,
                                    ignoreMandatoryFields: true
                                });

                            }else{
                                id_factura_nueva = relacionada_fact;

                                var nueva_tran_obj = record.load({
                                    type: record.Type.INVOICE,
                                    id: id_factura_nueva
                                });

                                generado_pdf = nueva_tran_obj.getValue({fieldId:'custbody_edoc_generated_pdf'});
                                generado_xml = nueva_tran_obj.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
                                var rfcclientekiosko = nueva_tran_obj.getValue({fieldId:'custbody_efx_fe_kiosko_rfc'});
                                if(rfcclientekiosko){
                                    if(body.cliente.rfc!=rfcclientekiosko){
                                        nueva_tran_obj.setValue({fieldId:'custbody_efx_fe_kiosko_rfc',value:body.cliente.rfc});
                                        nueva_tran_obj.setValue({fieldId:'custbody_mx_cfdi_usage',value:body.cliente.uso_cfdi.value});
                                        nueva_tran_obj.setValue({fieldId:'custbody_mx_txn_sat_payment_method',value:body.cliente.forma_pago.value});
                                        nueva_tran_obj.setValue({fieldId:'custbody_mx_txn_sat_payment_term',value:body.cliente.metodo_pago.value});
                                        var numLines = record_tipo.getLineCount({
                                            sublistId: 'item'
                                        });
                                        var tax_sublist = new Array();
                                    for (var i = 0; i < numLines; i++) {
                                        tax_sublist[i] = nueva_tran_obj.getSublistValue({
                                            sublistId: 'item',
                                            fieldId: 'taxcode',
                                            line: i,
                                        });
                                    }
                                regimenCliente = (regFiscalSubsidiaria).split(" - ");
                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2568 ~ ' + regimenCliente[0]});
                                    // regimenCliente = parseInt(regimenCliente);
                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2570 ~ ' + typeof regimenCliente[0]+' '+ regimenCliente[0]});
                                    if (regimenCliente[0] == "626" && tipo_persona=="F") {
                                        log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2550 ~ ' + tax_sublist});
                                        resicoTaxObj = buscaRESICO();
                                        // log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ resicoTaxObj', details: 'resicoTaxObj ~ 2575 ~ ' + JSON.stringify(resicoTaxObj)});
                                        for (var nstaxcode = 0; nstaxcode < tax_sublist.length; nstaxcode++) {
                                            for (var resico = 0; resico < resicoTaxObj.length; resico++) {
                                                if (tax_sublist[nstaxcode] == resicoTaxObj[resico].nstaxcode) {
                                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ IF', details: ' ~ 2592 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                                                    tax_sublist[nstaxcode] = resicoTaxObj[resico].resicotaxcode
                                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2593 ~ ' + tax_sublist[nstaxcode]});
                                                } else {
                                                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ ELSE', details: ' ~ 2594 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                                                }
                                            }
                                        }
                                        for (var x = 0; x < numLines; x++) {
                                            nueva_tran_obj.setSublistValue({
                                                sublistId: 'item',
                                                fieldId: 'taxcode',
                                                line: x,
                                                value: tax_sublist[x]
                                            });
                                        }
                                    }

                                        nueva_tran_obj.save({
                                            enableSourcing: true,
                                            ignoreMandatoryFields: true
                                        });
                                    }

                                }


                            }

                        }

                        //genera el xml de la nueva factura

                        var respuesta_crearxml = {
                            success: false,
                            xml: '',
                            pdf: '',
                            xml_name: '',
                            pdf_name: '',
                            respuestaPac:''
                        }
                        if(id_factura_nueva) {
                            try {
                                if (!generado_pdf && !generado_xml) {
                                    log.audit({title: 'No esta Timbrada', details: ''});
                                    var crearXml = crearXML(id_factura_nueva, record_tipo.type);
                                    log.audit({title: 'crearXml_de_nueva_factura', details: crearXml});


                                    // var record_tipo_new = record.load({
                                    //     type: tipo_transaccion,
                                    //     id: id_factura_nueva,
                                    //     isDynamic: true,
                                    // });
                                    //
                                    // var xml_ = record_tipo_new.getValue('custbody_psg_ei_content');


                                    if (crearXml.code == 200) {

                                        try {
                                            sendToMail(id_factura_nueva, record.Type.INVOICE)
                                        } catch (error_envioMail) {
                                            log.error({title: 'error_envioMail', details: error_envioMail});
                                        }

                                        var nueva_tran_obj = record.load({
                                            //type: record_tipo.type,
                                            type: record.Type.INVOICE,
                                            id: id_factura_nueva
                                        });
                                        var id_pdf = nueva_tran_obj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                                        var id_xml = nueva_tran_obj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});

                                        log.audit({title: 'id_pdf', details: id_pdf});
                                        log.audit({title: 'id_xml', details: id_xml});

                                        if (id_pdf && id_xml) {
                                            var xml_obj = file.load({id: id_xml});
                                            var pdf_obj = file.load({id: id_pdf});

                                            log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                            log.audit({title: 'pdf_obj.url', details: pdf_obj.url});

                                            var host = urlMod.resolveDomain({
                                                hostType: urlMod.HostType.APPLICATION
                                            });

                                            respuesta_crearxml.success = true;
                                            // respuesta_crearxml.xml = 'https://' + host + xml_obj.url;
                                            // respuesta_crearxml.pdf = 'https://' + host + pdf_obj.url;
                                            respuesta_crearxml.xml = id_xml;
                                            respuesta_crearxml.pdf = id_pdf;
                                            respuesta_crearxml.pdf_name = pdf_obj.name;
                                            respuesta_crearxml.xml_name = xml_obj.name;
                                        } else {
                                            respuesta_crearxml.success = false;
                                            var respuestadePac ='';
                                            if(crearXml.body){
                                                var parsebody = JSON.parse(crearXml.body);
                                                respuestadePac = parsebody.error_details;
                                                if(parsebody.error_details){
                                                    if(respuestadePac.indexOf('RFC') !== -1){
                                                        respuestadePac = 'Este RFC del receptor no existe en la lista de RFC inscritos no cancelados del SAT';
                                                    }else{
                                                        var error_obj = parsebody.error_objeto.split('[');
                                                        respuestadePac = error_obj[0];
                                                    }
                                                }else{
                                                    var error_obj = parsebody.error_objeto.split('[');
                                                    respuestadePac = error_obj[0];
                                                }
                                            }
                                            respuesta_crearxml.respuestaPac = respuestadePac;
                                            /*var borrafactura = record.delete({
                                                type: record.Type.INVOICE,
                                                id: id_factura_nueva,
                                            });
                                            log.audit({title: 'borrafactura', details: borrafactura});*/
                                        }
                                    }else{
                                        /*var borrafactura = record.delete({
                                            type: record.Type.INVOICE,
                                            id: id_factura_nueva,
                                        });
                                        log.audit({title: 'borrafactura', details: borrafactura});*/
                                    }
                                } else {

                                    log.audit({title: 'Está Timbrada', details: ''});
                                    var xml_obj = file.load({id: generado_xml});
                                    var pdf_obj = file.load({id: generado_pdf});

                                    log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                    log.audit({title: 'pdf_obj.url', details: pdf_obj.url});

                                    var host = urlMod.resolveDomain({
                                        hostType: urlMod.HostType.APPLICATION
                                    });

                                    respuesta_crearxml.success = true;
                                    // respuesta_crearxml.xml = 'https://' + host + xml_obj.url;
                                    // respuesta_crearxml.pdf = 'https://' + host + pdf_obj.url;
                                    respuesta_crearxml.xml = generado_xml;
                                    respuesta_crearxml.pdf = generado_pdf;
                                    respuesta_crearxml.pdf_name = pdf_obj.name;
                                    respuesta_crearxml.xml_name = xml_obj.name;
                                }

                                //actualizar factura antigua


                                log.audit({title: 'respuesta_crearxml_nueva_factura', details: respuesta_crearxml});

                                context.response.write({
                                    output: JSON.stringify(respuesta_crearxml)
                                });

                            } catch (error_xml) {
                                log.audit({title: 'error_xml', details: error_xml});
                                var nueva_tran_obj = record.load({
                                    //type: record_tipo.type,
                                    type: record.Type.INVOICE,
                                    id: id_factura_nueva
                                });
                                var id_pdf = nueva_tran_obj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                                var id_xml = nueva_tran_obj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});

                                log.audit({title: 'id_pdf', details: id_pdf});
                                log.audit({title: 'id_xml', details: id_xml});


                                var host = urlMod.resolveDomain({
                                    hostType: urlMod.HostType.APPLICATION
                                });

                                respuesta_crearxml.success = true;

                                if (id_xml) {
                                    var xml_obj = file.load({id: id_xml});
                                    log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                    // respuesta_crearxml.xml = 'https://' + host + xml_obj.url;
                                    respuesta_crearxml.xml = id_xml;
                                    respuesta_crearxml.xml_name = xml_obj.name;
                                }
                                if (id_pdf) {
                                    var pdf_obj = file.load({id: id_pdf});
                                    log.audit({title: 'pdf_obj.url', details: pdf_obj.url});
                                    // respuesta_crearxml.pdf = 'https://' + host + pdf_obj.url;
                                    respuesta_crearxml.pdf = id_pdf;
                                    respuesta_crearxml.pdf_name = pdf_obj.name;
                                }

                                context.response.write({
                                    output: JSON.stringify(respuesta_crearxml)
                                });
                            }
                        }else{
                            log.audit({title: 'cliente_k_fact', details: cliente_k_fact});
                            if(cliente_k_fact){
                                try {
                                    if (!generado_pdf && !generado_xml) {
                                        log.audit({title: 'No esta Timbrada', details: ''});
                                        var crearXml = crearXML(record_tipo.id, record_tipo.type,cliente_k_fact);
                                        log.audit({title: 'crearXml_de_factura_existente', details: crearXml});

                                        if (crearXml.code == 200) {

                                            try {
                                                sendToMail(record_tipo.id, record_tipo.type)
                                            } catch (error_envioMail) {
                                                log.error({title: 'error_envioMail', details: error_envioMail});
                                            }

                                            var nueva_tran_obj = record.load({
                                                //type: record_tipo.type,
                                                type: record_tipo.type,
                                                id: record_tipo.id
                                            });
                                            var id_pdf = nueva_tran_obj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                                            var id_xml = nueva_tran_obj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});

                                            log.audit({title: 'id_pdf', details: id_pdf});
                                            log.audit({title: 'id_xml', details: id_xml});

                                            if (id_pdf && id_xml) {
                                                var xml_obj = file.load({id: id_xml});
                                                var pdf_obj = file.load({id: id_pdf});

                                                log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                                log.audit({title: 'pdf_obj.url', details: pdf_obj.url});

                                                var host = urlMod.resolveDomain({
                                                    hostType: urlMod.HostType.APPLICATION
                                                });

                                                respuesta_crearxml.success = true;
                                                // respuesta_crearxml.xml = 'https://' + host + xml_obj.url;
                                                // respuesta_crearxml.pdf = 'https://' + host + pdf_obj.url;
                                                respuesta_crearxml.xml = id_xml;
                                                respuesta_crearxml.pdf = id_pdf;
                                                respuesta_crearxml.pdf_name = pdf_obj.name;
                                                respuesta_crearxml.xml_name = xml_obj.name;
                                            } else {
                                                respuesta_crearxml.success = false;
                                                var respuestadePac ='';
                                                if(crearXml.body){
                                                    var parsebody = JSON.parse(crearXml.body);
                                                    respuestadePac = parsebody.error_details;
                                                    if(parsebody.error_details){
                                                        if(respuestadePac.indexOf('RFC') !== -1){
                                                            respuestadePac = 'Este RFC del receptor no existe en la lista de RFC inscritos no cancelados del SAT';
                                                        }else{
                                                            var error_obj = parsebody.error_objeto.split('[');
                                                            respuestadePac = error_obj[0];
                                                        }
                                                    }else{
                                                        var error_obj = parsebody.error_objeto.split('[');
                                                        respuestadePac = error_obj[0];
                                                    }

                                                }
                                                respuesta_crearxml.respuestaPac = respuestadePac;
                                            }
                                        }
                                    } else {

                                        log.audit({title: 'Está Timbrada', details: ''});
                                        var xml_obj = file.load({id: generado_xml});
                                        var pdf_obj = file.load({id: generado_pdf});

                                        log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                        log.audit({title: 'pdf_obj.url', details: pdf_obj.url});

                                        var host = urlMod.resolveDomain({
                                            hostType: urlMod.HostType.APPLICATION
                                        });

                                        respuesta_crearxml.success = true;
                                        // respuesta_crearxml.xml = 'https://' + host + xml_obj.url;
                                        // respuesta_crearxml.pdf = 'https://' + host + pdf_obj.url;
                                        respuesta_crearxml.xml = generado_xml;
                                        respuesta_crearxml.pdf = generado_pdf;
                                        respuesta_crearxml.pdf_name = pdf_obj.name;
                                        respuesta_crearxml.xml_name = xml_obj.name;
                                    }

                                    //actualizar factura antigua


                                    log.audit({title: 'respuesta_crearxml_nueva_factura', details: respuesta_crearxml});

                                    context.response.write({
                                        output: JSON.stringify(respuesta_crearxml)
                                    });

                                } catch (error_timbra_misma) {
                                    log.audit({title: 'error_timbra_misma', details: error_timbra_misma});
                                    var nueva_tran_obj = record.load({
                                        //type: record_tipo.type,
                                        type: record_tipo.type,
                                        id: record_tipo.id
                                    });

                                    var id_pdf = nueva_tran_obj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                                    var id_xml = nueva_tran_obj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});

                                    log.audit({title: 'id_pdf', details: id_pdf});
                                    log.audit({title: 'id_xml', details: id_xml});


                                    var host = urlMod.resolveDomain({
                                        hostType: urlMod.HostType.APPLICATION
                                    });

                                    respuesta_crearxml.success = true;

                                    if (id_xml) {
                                        var xml_obj = file.load({id: id_xml});
                                        log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                        respuesta_crearxml.xml = id_xml;
                                        // respuesta_crearxml.xml = 'https://' + host + xml_obj.url;
                                        respuesta_crearxml.xml_name = xml_obj.name;
                                    }
                                    if (id_pdf) {
                                        var pdf_obj = file.load({id: id_pdf});
                                        log.audit({title: 'pdf_obj.url', details: pdf_obj.url});
                                        // respuesta_crearxml.pdf = 'https://' + host + pdf_obj.url;
                                        respuesta_crearxml.pdf = id_pdf;
                                        respuesta_crearxml.pdf_name = pdf_obj.name;
                                    }

                                    context.response.write({
                                        output: JSON.stringify(respuesta_crearxml)
                                    });
                                }
                            }
                        }
                    } else {

                        log.audit({title:'body.transaccion.isClient',details:body.transaccion.isClient});
                        var generado_pdf = record_tipo.getValue({fieldId:'custbody_edoc_generated_pdf'});
                        var generado_xml = record_tipo.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
                        var id_cliente= body.cliente.id;

                        var cliente_obj = record.load({
                            type: record.Type.CUSTOMER,
                            id: id_cliente
                        });

                        var array_clientes = cliente_obj.getValue({fieldId: 'custentity_efx_fe_kiosko_contact'});

                        record_tipo.setValue({
                            fieldId: 'custbody_efx_fe_kiosko_customer',
                            value: id_cliente,
                            ignoreFieldChange: true
                        });
                        var uso_cfdi = body.cliente.uso_cfdi.value;
                        var pay_method = body.cliente.metodo_pago.value;
                        var pay_form = body.cliente.forma_pago.value;
                        record_tipo.setValue({
                            fieldId: 'custbody_mx_cfdi_usage',
                            value: uso_cfdi
                        });
                        record_tipo.setValue({
                            fieldId: 'custbody_mx_txn_sat_payment_method',
                            value: pay_form

                        });
                        record_tipo.setValue({
                            fieldId: 'custbody_mx_txn_sat_payment_term',
                            value: pay_method
                        });

                        record_tipo.setValue({
                            fieldId: 'custbody_efx_fe_mail_to',
                            value: array_clientes,
                            ignoreFieldChange: true
                        });
                        var numLines = record_tipo.getLineCount({
                            sublistId: 'item'
                        });
                        var tax_sublist = new Array();
                        for (var i = 0; i < numLines; i++) {
                            tax_sublist[i] = record_tipo.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'taxcode',
                                line: i,
                            });
                        }
                        regimenCliente = (regFiscalSubsidiaria).split(" - ");
                            log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2568 ~ ' + regimenCliente[0]});
                            // regimenCliente = parseInt(regimenCliente);
                            log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2570 ~ ' + typeof regimenCliente[0]+' '+ regimenCliente[0]});
                            if (regimenCliente[0] == "626" && tipo_persona=="F") {
                                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2550 ~ ' + tax_sublist});
                                resicoTaxObj = buscaRESICO();
                                // log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ resicoTaxObj', details: 'resicoTaxObj ~ 2575 ~ ' + JSON.stringify(resicoTaxObj)});
                                for (var nstaxcode = 0; nstaxcode < tax_sublist.length; nstaxcode++) {
                                    for (var resico = 0; resico < resicoTaxObj.length; resico++) {
                                        if (tax_sublist[nstaxcode] == resicoTaxObj[resico].nstaxcode) {
                                            log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ IF', details: ' ~ 2592 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                                            tax_sublist[nstaxcode] = resicoTaxObj[resico].resicotaxcode
                                            log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2593 ~ ' + tax_sublist[nstaxcode]});
                                        } else {
                                            log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ ELSE', details: ' ~ 2594 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                                        }
                                    }
                                }
                                for (var x = 0; x < numLines; x++) {
                                    record_tipo.setSublistValue({
                                        sublistId: 'item',
                                        fieldId: 'taxcode',
                                        line: x,
                                        value: tax_sublist[x]
                                    });
                                }
                            }

                        record_tipo.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        var respuesta_crearxml = {
                            success: false,
                            xml: '',
                            pdf: '',
                            xml_name: '',
                            pdf_name: ''
                        }
                        log.audit({title:'generado_pdf',details:generado_pdf});
                        log.audit({title:'generado_xml',details:generado_xml});
                        try {
                            if(!generado_pdf || !generado_xml) {
                                var crearXml = crearXML(body.transaccion.transId, record_tipo.type,'T');
                                log.audit({title: 'crearXml', details: crearXml});

                                // var record_tipo = record.load({
                                //     type: tipo_transaccion,
                                //     id: body.transaccion.transId,
                                //     isDynamic: true,
                                // });
                                //
                                // var xml_ = record_tipo.getValue('custbody_psg_ei_content');


                                if (crearXml.code == 200) {

                                    try{
                                        sendToMail(body.transaccion.transId,record_tipo.type)
                                    }catch(error_envioMail){
                                        log.error({title: 'error_envioMail', details: error_envioMail});
                                    }

                                    var nueva_tran_obj = record.load({
                                        type: record_tipo.type,
                                        id: body.transaccion.transId
                                    });
                                    var id_pdf = nueva_tran_obj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                                    var id_xml = nueva_tran_obj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});

                                    log.audit({title: 'id_pdf', details: id_pdf});
                                    log.audit({title: 'id_xml', details: id_xml});

                                    var xml_obj = file.load({id: id_xml});
                                    var pdf_obj = file.load({id: id_pdf});

                                    log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                    log.audit({title: 'pdf_obj.url', details: pdf_obj.url});

                                    var host = urlMod.resolveDomain({
                                        hostType: urlMod.HostType.APPLICATION
                                    });

                                    respuesta_crearxml.success = true;
                                    // respuesta_crearxml.xml = 'https://' + host + xml_obj.url;
                                    // respuesta_crearxml.pdf = 'https://' + host + pdf_obj.url;
                                    respuesta_crearxml.xml = id_xml;
                                    respuesta_crearxml.pdf = id_pdf;
                                    respuesta_crearxml.pdf_name = pdf_obj.name;
                                    respuesta_crearxml.xml_name = xml_obj.name;

                                }else{
                                    var xml_obj = file.load({id: generado_xml});
                                    var pdf_obj = file.load({id: generado_pdf});

                                    log.audit({title: 'xml_obj.url', details: xml_obj.url});
                                    log.audit({title: 'pdf_obj.url', details: pdf_obj.url});

                                    var host = urlMod.resolveDomain({
                                        hostType: urlMod.HostType.APPLICATION
                                    });

                                    respuesta_crearxml.success = true;
                                    // respuesta_crearxml.xml = 'https://' + host + xml_obj.url;
                                    // respuesta_crearxml.pdf = 'https://' + host + pdf_obj.url;
                                    respuesta_crearxml.xml = generado_xml;
                                    respuesta_crearxml.pdf = generado_pdf;
                                    respuesta_crearxml.pdf_name = pdf_obj.name;
                                    respuesta_crearxml.xml_name = xml_obj.name;

                                }

                                log.audit({title: 'respuesta_crearxml', details: respuesta_crearxml});

                                context.response.write({
                                    output: JSON.stringify(respuesta_crearxml)
                                });
                            }
                        }catch(error_xml){
                            var nueva_tran_obj = record.load({
                                type: record_tipo.type,
                                id: body.transaccion.transId
                            });

                            var id_pdf = nueva_tran_obj.getValue({fieldId: 'custbody_edoc_generated_pdf'});
                            var id_xml = nueva_tran_obj.getValue({fieldId: 'custbody_psg_ei_certified_edoc'});

                            var xml_obj = file.load({id: id_xml});
                            var pdf_obj = file.load({id: id_pdf});

                            var host = urlMod.resolveDomain({
                                hostType: urlMod.HostType.APPLICATION
                            });

                            respuesta_crearxml.success = true;
                            // respuesta_crearxml.xml = 'https://' + host + xml_obj.url;
                            // respuesta_crearxml.pdf = 'https://' + host + pdf_obj.url;
                            respuesta_crearxml.xml = id_xml;
                            respuesta_crearxml.pdf = id_pdf;
                            respuesta_crearxml.pdf_name = pdf_obj.name;
                            respuesta_crearxml.xml_name = xml_obj.name;

                            context.response.write({
                                output: JSON.stringify(respuesta_crearxml)
                            });

                            log.audit({title: 'error_xml', details: error_xml});

                        }
                    }
                }
            }


            // if(cert_ticket=='T'){
            //     var certificarXml = certificarXML(ticket_transId,ticket_transType);
            //
            //     var respuesta_timbraxml = {
            //         success: false,
            //         pdf: '',
            //         xml: ''
            //     }
            //
            //     var transaction_type = '';
            //     if (ticket_transType == 'invoice') {
            //         transaction_type = record.Type.INVOICE;
            //     }
            //     var record_tipo = record.load({
            //         type: transaction_type,
            //         id: ticket_transId,
            //         isDynamic: true,
            //     });
            //
            //     var pdf_ = record_tipo.getValue('custbody_edoc_generated_pdf');
            //     var xml_ = record_tipo.getValue('custbody_psg_ei_certified_edoc');
            //
            //     if (certificarXml.code == 200 && xml_) {
            //         respuesta_timbraxml.success = true;
            //         respuesta_timbraxml.pdf = pdf_;
            //         respuesta_timbraxml.xml = xml_;
            //         log.audit({title: 'respuesta_timbraxml', details: respuesta_timbraxml});
            //     }
            //
            //     context.response.write({
            //         output: JSON.stringify(respuesta_timbraxml)
            //     });
            // }
        }


        function crearXML(tranid,trantype,cliente_k_fact){
            log.audit({title:'tranid',details:tranid});
            log.audit({title:'trantype',details:trantype});

            var scheme = 'https://';
            var host = urlMod.resolveDomain({
                hostType: urlMod.HostType.APPLICATION
            });

            var tipodeTran = '';
            if(cliente_k_fact){
                tipodeTran = trantype;
            }else{
                tipodeTran = 'invoice';
            }

            var SLURL = urlMod.resolveScript({
                scriptId: 'customscript_efx_fe_xml_generator',
                deploymentId: 'customdeploy_efx_fe_xml_generator',
                returnExternalUrl: true,
                params: {
                    //trantype: trantype,
                    trantype: tipodeTran,
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



            // https.get.promise({
            //     url: SLURL,
            //     headers: {}
            // }).then(function (response){
            //     return response;
            // }).then(function (data){
            //     log.audit({title:'data',details:data});
            // }).catch(function onRejected(reason){
            //     log.audit({title:'reason',details:reason});
            // })





            // var scheme = 'https://';
            // var host = urlMod.resolveDomain({
            //     hostType: urlMod.HostType.APPLICATION
            // });
            //
            //
            // var SLURL = scheme + host + urlMod.resolveScript({
            //     scriptId: 'customscript_ei_generation_service_su',
            //     deploymentId: 'customdeploy_ei_generation_service_su',
            //     returnExternalUrl: false,
            //     params: {
            //         transId: tranid,
            //         transType: trantype,
            //         certSendingMethodId: 5,
            //     }
            // });
            //
            // log.audit({title:'SLURL',details:SLURL});
            //
            // var headers = {
            //     'Authorization': 'NLAuth nlauth_account=TSTDRV2220309, nlauth_email=marco.ramirez@efficientix.com, nlauth_signature=Efxmr12345678., nlauth_role=3',
            //     "Content-Type": "application/json"
            // };
            // var response = https.post({
            //     url: SLURL,
            //     headers: headers
            // });

            //return response;
        }

        function certificarXML(tranid,trantype){

            log.audit({title:'tranid',details:tranid});
            log.audit({title:'trantype',details:trantype});


            var scheme = 'https://';
            var host = urlMod.resolveDomain({
                hostType: urlMod.HostType.APPLICATION
            });

            var SLURL = scheme + host + urlMod.resolveScript({
                scriptId: 'customscript_su_send_e_invoice',
                deploymentId: 'customdeploy_su_send_e_invoice',
                returnExternalUrl: false,
                params: {
                    transId: tranid,
                    transType: trantype,
                    certSendingMethodId: 5,
                }
            });


            log.audit({title:'SLURL',details:SLURL});

            var headers = {
                'Authorization': 'NLAuth nlauth_account=TSTDRV2220309, nlauth_email=marco.ramirez@efficientix.com, nlauth_signature=Efxmr12345678., nlauth_role=3',
                "Content-Type": "application/json"
            };
            var response = https.post({
                url: SLURL,
                headers: headers
            });

            return response;
        }

        //Funciones de busqueda

        function buscarCliente(obj_cliente,rfc,creaFactura,SUBSIDIARIES){




            var columnasbusca = new Array();
            columnasbusca.push(search.createColumn({name: 'internalid'}));
            columnasbusca.push(search.createColumn({name: "custentity_mx_rfc"}));
            columnasbusca.push(search.createColumn({name: "isperson"}));
            columnasbusca.push(search.createColumn({name: "firstname"}));
            columnasbusca.push(search.createColumn({name: "lastname"}));
        if(SUBSIDIARIES) {
            columnasbusca.push(search.createColumn({name: "subsidiary"}));
        }
            columnasbusca.push(search.createColumn({name: "companyname"}));
            columnasbusca.push(search.createColumn({name: "custentity_mx_sat_industry_type"}));
            columnasbusca.push(search.createColumn({name: "custentity_mx_sat_registered_name"}));
            columnasbusca.push(search.createColumn({name: "custentity_efx_cmp_registra_ieps"}));
            var search_ticket = search.create({
                type: search.Type.CUSTOMER,
                filters: [
                    ['isinactive', search.Operator.IS, 'F']
                    , 'and',
                    ['custentity_mx_rfc', search.Operator.IS, rfc]

                ],
                columns:columnasbusca
                // columns: [
                //     search.createColumn({name: 'internalid'}),
                //     search.createColumn({name: "custentity_mx_rfc"}),
                //     search.createColumn({name: "isperson"}),
                //     search.createColumn({name: "firstname"}),
                //     search.createColumn({name: "lastname"}),
                //     search.createColumn({name: "subsidiary"}),
                //     search.createColumn({name: "companyname"}),
                //     search.createColumn({name: "custentity_efx_cmp_registra_ieps"}),
                // ]
            });
            var ejecutar = search_ticket.run();
            var resultado = ejecutar.getRange(0, 100);
            log.audit({title: 'resultado.length', details: resultado.length});

            for (var x = 0; x < resultado.length; x++) {
                var id_interno_cliente = resultado[x].getValue({name: "internalid"}) || '';
                obj_cliente.cliente.rfc = resultado[x].getValue({name: "custentity_mx_rfc"}) || '';
                var tipo_cliente = resultado[x].getValue({name: "isperson"}) || '';
                if(tipo_cliente){
                    obj_cliente.cliente.tipo = true;
                }else{
                    obj_cliente.cliente.tipo = false;
                }

                var casillaieps = resultado[x].getValue({name: "custentity_efx_cmp_registra_ieps"}) || '';

                log.audit({title: 'casillaieps', details: casillaieps});
                if(casillaieps){
                    obj_cliente.cliente.ieps = casillaieps;
                }

                obj_cliente.cliente.id = resultado[x].getValue({name: "internalid"}) || '';
                obj_cliente.cliente.compania = resultado[x].getValue({name: "companyname"}) || '';
                obj_cliente.cliente.nombre = resultado[x].getValue({name: "firstname"}) || '';
                obj_cliente.cliente.apellido = resultado[x].getValue({name: "lastname"}) || '';
                obj_cliente.cliente.subsidiaria = resultado[x].getValue({name: "subsidiary"}) || '';
                obj_cliente.cliente.regFiscal.value = resultado[x].getValue({name: "custentity_mx_sat_industry_type"}) || '';
                obj_cliente.cliente.regFiscal.text = resultado[x].getText({name: "custentity_mx_sat_industry_type"}) || '';
                obj_cliente.cliente.razonSocial = resultado[x].getValue({name: "custentity_mx_sat_registered_name"}) || '';
                obj_cliente.cliente.existe = true;
            }
            if(creaFactura!='T') {
                return obj_cliente;
            }else{
                return id_interno_cliente;
            }
        }

        function buscarDirecciones(objcliente,entity_id){
            var rec_cliente = record.load({
                type: record.Type.CUSTOMER,
                id:entity_id
            });

            var numLines = rec_cliente.getLineCount({
                sublistId: 'addressbook'
            });

            for(var i=0;i<numLines;i++){
                var billing = rec_cliente.getSublistValue({
                    sublistId:'addressbook',
                    fieldId:'defaultbilling',
                    line: i
                });
                log.audit({title:'billing',details:billing});
                if(billing){
                    var rec_subrec = rec_cliente.getSublistSubrecord({
                        sublistId:'addressbook',
                        fieldId: 'addressbookaddress',
                        line: i
                    });
                    objcliente.direccion.calle = rec_subrec.getValue({fieldId:'custrecord_streetname'});
                    objcliente.direccion.n_exterior = rec_subrec.getValue({fieldId:'custrecord_streetnum'});
                    objcliente.direccion.n_interior = rec_subrec.getValue({fieldId:'custrecord_unit'});
                    objcliente.direccion.cp = rec_subrec.getValue({fieldId:'zip'});
                    objcliente.direccion.pais = rec_subrec.getValue({fieldId:'country'});
                    objcliente.direccion.estado = rec_subrec.getValue({fieldId:'state'});
                    objcliente.direccion.municipio = rec_subrec.getValue({fieldId:'city'});
                    objcliente.direccion.colonia = rec_subrec.getValue({fieldId:'custrecord_colonia'});

                }
            }
            return objcliente;
        }

        function buscarContactos(objcliente,entity_id){
            if(!objcliente.cliente.tipo) {
                var search_ticket = search.create({
                    type: search.Type.CONTACT,
                    filters: [
                        ['isinactive', search.Operator.IS, 'F']
                        , 'and',
                        ['company', search.Operator.IS, entity_id]

                    ],
                    columns: [
                        search.createColumn({name: 'internalid'}),
                        search.createColumn({name: "entityid"}),
                        search.createColumn({name: "email"}),

                    ]
                });
                var ejecutar = search_ticket.run();
                var resultado = ejecutar.getRange(0, 100);
                log.audit({title: 'resultado.length', details: resultado.length});

                for (var x = 0; x < resultado.length; x++) {
                    objcliente.contactos.push({
                        nombre: resultado[x].getValue({name: "entityid"}) || '',
                        correo: resultado[x].getValue({name: "email"}) || ''
                    });
                }
                return objcliente;
            }else{
                var record_cliente = record.load({
                    type: record.Type.CUSTOMER,
                    id: entity_id
                });
                var contactos_cliente = record_cliente.getValue({fieldId:'custentity_efx_fe_kiosko_contact'});

                log.audit({title:'contactos_cliente',details:contactos_cliente});
                if(contactos_cliente) {
                    for (var i = 0; i < contactos_cliente.length; i++) {
                        var LookupField = search.lookupFields({
                            type: search.Type.CONTACT,
                            id: contactos_cliente[i],
                            columns: ['entityid', 'email']
                        });

                        objcliente.contactos.push({
                            nombre: LookupField['entityid'],
                            correo: LookupField['email']
                        });
                    }
                }

                return objcliente;
            }
        }

        function buscarContactosNuevos(objcliente,entity_id){

            if(!objcliente.cliente.tipo) {
                var array_nombres = new Array();
                var array_filtros = new Array();
                log.audit({title: 'objcontactos', details: objcliente.contactos});
                var array_contactosObj = objcliente.contactos;

                var conteoEnviar = 0;
                for (var i = 0; i < objcliente.contactos.length; i++) {
                    if(objcliente.contactos[i].enviar) {
                        conteoEnviar++;
                    }
                }

                log.audit({title: 'conteoEnviar', details: conteoEnviar});
                var conteoEnviarMail = 0;
                for (var i = 0; i < objcliente.contactos.length; i++) {
                    if(objcliente.contactos[i].enviar) {
                        array_nombres.push(objcliente.contactos[i].nombre);
                        array_filtros.push(['entityid', search.Operator.IS, objcliente.contactos[i].nombre]);
                        conteoEnviarMail ++;
                        if (conteoEnviarMail < conteoEnviar) {
                            array_filtros.push('AND');
                        }
                    }
                }

                log.audit({title: 'array_filtros', details: array_filtros});

                var search_ticket = search.create({
                    type: search.Type.CONTACT,
                    filters: [
                        ['isinactive', search.Operator.IS, 'F']
                        , 'and',
                        ['company', search.Operator.ANYOF, entity_id]
                        , 'and',
                        array_filtros

                    ],
                    columns: [
                        search.createColumn({name: 'internalid'}),
                        search.createColumn({name: "entityid"}),
                        search.createColumn({name: "email"}),

                    ]
                });
                var ejecutar = search_ticket.run();
                var resultado = ejecutar.getRange(0, 100);
                log.audit({title: 'resultado.length', details: resultado.length});

                var array_elimina = new Array();
                var array_contactos = new Array();
                for (var x = 0; x < resultado.length; x++) {
                    var nombreid = resultado[x].getValue({name: 'entityid'});
                    var correoid = resultado[x].getValue({name: 'email'});
                    var idDeContacto = resultado[x].getValue({name: 'internalid'});
                    contactos_envio.push(idDeContacto);

                    array_contactos.push({
                        nombre: nombreid,
                        correo: correoid
                    })

                    for (var i = 0; i < array_nombres.length; i++) {
                        if (nombreid == array_nombres[i]) {
                            array_elimina.push(x);
                        }
                    }
                }
                for (var e = 0; e < array_elimina.length; e++) {
                    array_contactosObj.splice(array_elimina[e], 1);
                }

                return array_contactosObj;
            }else{
                var record_cliente = record.load({
                    type: record.Type.CUSTOMER,
                    id: entity_id
                });
                var contactos_cliente = record_cliente.getValue({fieldId:'custentity_efx_fe_kiosko_contact'});

                var elimina_array = new Array();
                if(contactos_cliente) {
                    for (var i = 0; i < contactos_cliente.length; i++) {
                        var LookupField = search.lookupFields({
                            type: search.Type.CONTACT,
                            id: contactos_cliente[i],
                            columns: ['entityid', 'email']
                        });

                        for (var x = 0; x < objcliente.contactos.length; x++) {
                            if (LookupField['email'] == objcliente.contactos[x].correo) {
                                elimina_array.push(x);
                                if (objcliente.contactos[x].enviar) {
                                    contactos_envio.push(contactos_cliente[i]);
                                }
                            }
                        }

                    }
                }

                var array_contacts = new Array();
                for(var i=0;i<objcliente.contactos.length;i++){
                    var n=0;
                    for(var x=0;x<elimina_array.length;x++){
                        if(elimina_array[x]==i){
                            n++;
                        }
                    }
                    if(n>0){
                        continue;
                    }else{
                        if(objcliente.contactos[i].enviar){
                            array_contacts.push(objcliente.contactos[i]);
                        }

                    }
                }

                //objcliente.contactos.splice(elimina_array,1);

                return array_contacts;
            }
        }

        function crearCliente(objcliente,document_pack,datos_clientes,versioncfdi){
            var record_client = record.create({
                type: record.Type.CUSTOMER,
            });

            var tipo_persona = '';
            var tieneieps = objcliente.cliente.ieps;
            if(objcliente.cliente.tipo){
                tipo_persona = 'T';
            }else{
                tipo_persona = 'F';
            }

            // if(objcliente.cliente.ieps){
            //     tieneieps = 'T';
            // }else{
            //     tieneieps = 'F';
            // }

            record_client.setValue({
                fieldId: 'isperson',
                value: tipo_persona
            });

            record_client.setValue({
                fieldId: 'custentity_efx_cmp_registra_ieps',
                value: tieneieps
            });

            record_client.setValue({
                fieldId: 'subsidiary',
                value: objcliente.cliente.subsidiaria
            });

            if(objcliente.cliente.tipo) {
                record_client.setValue({
                    fieldId: 'entityid',
                    value: objcliente.cliente.nombre + ' '+ objcliente.cliente.apellido+' '+objcliente.cliente.rfc
                });

                record_client.setValue({
                    fieldId: 'firstname',
                    value: objcliente.cliente.nombre
                });

                record_client.setValue({
                    fieldId: 'lastname',
                    value: objcliente.cliente.apellido
                });

                record_client.setValue({
                    fieldId: 'companyname',
                    value: objcliente.cliente.nombre + ' '+ objcliente.cliente.apellido
                });

                record_client.setValue({
                    fieldId: 'custentity_mx_sat_registered_name',
                    value: objcliente.cliente.nombre + ' '+ objcliente.cliente.apellido
                });
            }else{
                record_client.setValue({
                    fieldId: 'entityid',
                    value: objcliente.cliente.compania
                });

                record_client.setValue({
                    fieldId: 'companyname',
                    value: objcliente.cliente.compania
                });

                record_client.setValue({
                    fieldId: 'custentity_mx_sat_registered_name',
                    value: objcliente.cliente.compania
                });
            }

            record_client.setValue({
                fieldId: 'custentity_mx_rfc',
                value: objcliente.cliente.rfc
            });

            record_client.setValue({
                fieldId: 'custentity_mx_sat_industry_type',
                value: objcliente.cliente.regFiscal.value
            });


            record_client.setValue({
                fieldId: 'custentity_edoc_gen_trans_pdf',
                value: true
            });

            record_client.setValue({
                fieldId: 'custentity_psg_ei_auto_select_temp_sm',
                value: true
            });



            record_client.setValue({
                fieldId: 'custentity_efx_fe_send_cert_docs',
                value: true
            });

            record_client.setValue({
                fieldId: 'custentity_psg_ei_entity_edoc_standard',
                value: document_pack
            });

            record_client.setValue({
                fieldId: 'custentity_efx_fe_version',
                value: versioncfdi
            });
            try {
                if (datos_clientes) {
                    var json_keys = Object.keys(datos_clientes);
                    //var json_values = Object.values(datos_clientes);

                    for (var i = 0; i < json_keys.length; i++) {
                        record_client.setValue({
                            fieldId: json_keys[i],
                            value: datos_clientes[Object.keys(datos_clientes)[i]]
                        });
                    }
                }
            }catch(error_cliente_data){
                log.audit({title:'error_cliente_data',details:error_cliente_data});
            }


            var numLines = record_client.getLineCount({
                sublistId: 'addressbook'
            });

            //crear direccion
            try {
                record_client.setSublistValue({
                    sublistId: 'addressbook',
                    fieldId: 'label',
                    line: numLines,
                    value: objcliente.cliente.nombre
                });

                record_client.setSublistValue({
                    sublistId: 'addressbook',
                    fieldId: 'defaultbilling',
                    line: numLines,
                    value: true
                });

                var subrec = record_client.getSublistSubrecord({
                    sublistId: 'addressbook',
                    fieldId: 'addressbookaddress',
                    line: numLines
                });

                subrec.setValue({
                    fieldId: 'addr2',
                    value: objcliente.direccion.calle + objcliente.direccion.n_exterior
                });

                subrec.setValue({
                    fieldId: 'addr1',
                    value: objcliente.cliente.nombre
                });

                subrec.setValue({
                    fieldId: 'custrecord_streetname',
                    value: objcliente.direccion.calle
                });

                subrec.setValue({
                    fieldId: 'custrecord_streetnum',
                    value: objcliente.direccion.n_exterior
                });

                subrec.setValue({
                    fieldId: 'custrecord_colonia',
                    value: objcliente.direccion.colonia
                });


                subrec.setValue({
                    fieldId: 'country',
                    value: objcliente.direccion.pais
                });

                subrec.setValue({
                    fieldId: 'state',
                    value: objcliente.direccion.estado
                });

                subrec.setValue({
                    fieldId: 'city',
                    value: objcliente.direccion.municipio
                });

                subrec.setValue({
                    fieldId: 'zip',
                    value: objcliente.direccion.cp
                });
                // Save the sublist line.

            }catch(error_adress){
                log.audit({title: 'error_adress', details: error_adress});
            }

            var id_cliente = record_client.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            var contactos = crearContactos(id_cliente,objcliente);

            return id_cliente;
        }

        function ActualizarCliente(objcliente,document_pack,datos_clientes,versioncfdi){

            var tipo_persona = '';
            if(objcliente.cliente.tipo){
                tipo_persona = 'T';
            }else{
                tipo_persona = 'F';
            }

            var tieneieps = objcliente.cliente.ieps;



            if(objcliente.cliente.tipo) {

                var objValues = {
                    //isperson:tipo_persona,
                    custentity_efx_cmp_registra_ieps:tieneieps,
                    //entityid:objcliente.cliente.nombre+' '+objcliente.cliente.apellido+' '+objcliente.cliente.rfc,
                    //companyname:objcliente.cliente.nombre+' '+objcliente.cliente.apellido,
                    //firstname:objcliente.cliente.nombre,
                    //lastname:objcliente.cliente.apellido,
                    // custentity_mx_rfc:objcliente.cliente.rfc,
                    custentity_edoc_gen_trans_pdf:true,
                    custentity_psg_ei_auto_select_temp_sm:true,
                    custentity_efx_fe_send_cert_docs:true,
                    custentity_psg_ei_entity_edoc_standard:document_pack,
                    custentity_mx_sat_industry_type:objcliente.cliente.regFiscal.value,
                    //custentity_mx_sat_registered_name:objcliente.cliente.nombre+' '+objcliente.cliente.apellido,
                    custentity_efx_fe_version:versioncfdi,

                }

                var actualizaclientecfdi = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_actualiza_datos_cli' });

                if(objcliente.cliente.metodo_pago && (actualizaclientecfdi==true || (actualizaclientecfdi && actualizaclientecfdi=='T'))){
                    objValues.custentity_efx_mx_payment_term = objcliente.cliente.metodo_pago.value;
                }
                if(objcliente.cliente.forma_pago && (actualizaclientecfdi==true || (actualizaclientecfdi && actualizaclientecfdi=='T'))){
                    objValues.custentity_efx_mx_payment_method = objcliente.cliente.forma_pago.value;
                }
                if(objcliente.cliente.uso_cfdi && (actualizaclientecfdi==true || (actualizaclientecfdi && actualizaclientecfdi=='T'))){
                    objValues.custentity_efx_mx_cfdi_usage = objcliente.cliente.uso_cfdi.value;
                }
                if((actualizaclientecfdi==true || (actualizaclientecfdi && actualizaclientecfdi=='T'))){
                    objValues.isperson=tipo_persona;
                    objValues.companyname = objcliente.cliente.nombre+' '+objcliente.cliente.apellido;
                    objValues.firstname = objcliente.cliente.nombre;
                    objValues.lastname = objcliente.cliente.apellido;
                    objValues.custentity_mx_sat_registered_name = objcliente.cliente.nombre+' '+objcliente.cliente.apellido;
                }

                log.audit({title:'objValues',details:objValues});

                record.submitFields({
                    type: record.Type.CUSTOMER,
                    id: objcliente.cliente.id,
                    values:objValues,
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });
            }else{

                var objValues = {
                    //isperson:tipo_persona,
                    //companyname:objcliente.cliente.compania,
                    // custentity_mx_rfc:objcliente.cliente.rfc,
                    custentity_edoc_gen_trans_pdf:true,
                    custentity_psg_ei_auto_select_temp_sm:true,
                    custentity_efx_fe_send_cert_docs:true,
                    custentity_psg_ei_entity_edoc_standard:document_pack,
                    custentity_mx_sat_industry_type:objcliente.cliente.regFiscal.value,
                    //custentity_mx_sat_registered_name:objcliente.cliente.compania,
                    custentity_efx_fe_version:versioncfdi
                }

                var actualizaclientecfdi = runtime.getCurrentScript().getParameter({ name: 'custscript_efx_fe_actualiza_datos_cli' });

                if(objcliente.cliente.metodo_pago && (actualizaclientecfdi==true || (actualizaclientecfdi && actualizaclientecfdi=='T'))){
                    objValues.custentity_efx_mx_payment_term = objcliente.cliente.metodo_pago.value;
                }
                if(objcliente.cliente.forma_pago && (actualizaclientecfdi==true || (actualizaclientecfdi && actualizaclientecfdi=='T'))){
                    objValues.custentity_efx_mx_payment_method = objcliente.cliente.forma_pago.value;
                }
                if(objcliente.cliente.uso_cfdi && (actualizaclientecfdi==true || (actualizaclientecfdi && actualizaclientecfdi=='T'))){
                    objValues.custentity_efx_mx_cfdi_usage = objcliente.cliente.uso_cfdi.value;
                }

                if((actualizaclientecfdi==true || (actualizaclientecfdi && actualizaclientecfdi=='T'))){
                    objValues.isperson=tipo_persona;
                    objValues.companyname = objcliente.cliente.compania;
                    objValues.custentity_mx_sat_registered_name = objcliente.cliente.compania;
                }

                log.audit({title:'objValues',details:objValues});

                record.submitFields({
                    type: record.Type.CUSTOMER,
                    id: objcliente.cliente.id,
                    values:objValues,
                    options: {
                        enableSourcing: false,
                        ignoreMandatoryFields : true
                    }
                });
            }

            var record_client = record.load({
                type: record.Type.CUSTOMER,
                id:objcliente.cliente.id
            });

            var numLines = record_client.getLineCount({
                sublistId: 'addressbook'
            });


            //crear direccion
            try {



                for(var z=0;z<numLines;z++) {
                    var subrec = record_client.getSublistSubrecord({
                        sublistId: 'addressbook',
                        fieldId: 'addressbookaddress',
                        line: z
                    });

                    var billing = record_client.getSublistValue({
                        sublistId:'addressbook',
                        fieldId:'defaultbilling',
                        line: z
                    });

                    if(billing){
                        subrec.setValue({
                            fieldId: 'addr2',
                            value: objcliente.direccion.calle + objcliente.direccion.n_exterior
                        });

                        subrec.setValue({
                            fieldId: 'addr1',
                            value: objcliente.cliente.nombre
                        });

                        subrec.setValue({
                            fieldId: 'custrecord_streetname',
                            value: objcliente.direccion.calle
                        });

                        subrec.setValue({
                            fieldId: 'custrecord_streetnum',
                            value: objcliente.direccion.n_exterior
                        });

                        subrec.setValue({
                            fieldId: 'custrecord_colonia',
                            value: objcliente.direccion.colonia
                        });


                        subrec.setValue({
                            fieldId: 'country',
                            value: objcliente.direccion.pais
                        });

                        subrec.setValue({
                            fieldId: 'state',
                            value: objcliente.direccion.estado
                        });

                        subrec.setValue({
                            fieldId: 'city',
                            value: objcliente.direccion.municipio
                        });

                        subrec.setValue({
                            fieldId: 'zip',
                            value: objcliente.direccion.cp
                        });
                    }

                    // Save the sublist line.
                }
            }catch(error_adress){
                log.audit({title: 'error_adress', details: error_adress});
            }

            var id_cliente = record_client.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            return id_cliente;
        }

        function crearContactos(id_cliente,objcliente){
            try {
                var array_contactos = new Array();
                for(var i=0;i<objcliente.contactos.length;i++) {
                    var record_contact = record.create({
                        type: record.Type.CONTACT,
                    });

                    record_contact.setValue({
                        fieldId: 'entityid',
                        value: objcliente.contactos[i].nombre + ' '+ objcliente.cliente.rfc
                    });

                    record_contact.setValue({
                        fieldId: 'email',
                        value: objcliente.contactos[i].correo
                    });

                    record_contact.setValue({
                        fieldId: 'subsidiary',
                        value: objcliente.cliente.subsidiaria
                    });

                    record_contact.setValue({
                        fieldId: 'title',
                        value: 'Contacto Kiosko'
                    });

                    record_contact.setValue({
                        fieldId: 'phone',
                        value: '0000000000'
                    });

                    if(!objcliente.cliente.tipo){
                        record_contact.setValue({
                            fieldId: 'company',
                            value: id_cliente
                        });
                    }else{
                        record_contact.setValue({
                            fieldId: 'custentity_efx_fe_kiosko_contact_rel',
                            value: true
                        });
                    }

                    var id_contacto = record_contact.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                    log.audit({title:'id_contacto',details:id_contacto});

                    if(objcliente.cliente.tipo) {
                        array_contactos.push(id_contacto);
                    }
                }


                if(array_contactos.length>0){
                    var record_cliente = record.load({
                        type: record.Type.CUSTOMER,
                        id: id_cliente
                    });

                    record_cliente.setValue({fieldId:'custentity_efx_fe_kiosko_contact',value:array_contactos});
                    record_cliente.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                }


            }catch(error_contact){
                log.audit({title:'error_contact',details:error_contact});
            }

        }

        function crearContactosExiste(id_cliente,objcliente,body){
            try {
                var array_contactos = new Array();
                for(var i=0;i<objcliente.length;i++) {
                    try {
                        var record_contact = record.create({
                            type: record.Type.CONTACT,
                        });

                        record_contact.setValue({
                            fieldId: 'entityid',
                            value: objcliente[i].nombre + ' '+ body.cliente.rfc
                        });

                        record_contact.setValue({
                            fieldId: 'email',
                            value: objcliente[i].correo
                        });


                        record_contact.setValue({
                            fieldId: 'subsidiary',
                            value: body.cliente.subsidiaria
                        });

                        record_contact.setValue({
                            fieldId: 'title',
                            value: 'Contacto Kiosko'
                        });

                        record_contact.setValue({
                            fieldId: 'phone',
                            value: '0000000000'
                        });

                        if (!body.cliente.tipo) {
                            record_contact.setValue({
                                fieldId: 'company',
                                value: id_cliente
                            });
                        } else {
                            record_contact.setValue({
                                fieldId: 'custentity_efx_fe_kiosko_contact_rel',
                                value: true
                            });
                        }

                        var id_contacto = record_contact.save();
                        contactos_envio.push(id_contacto);
                        if(body.cliente.tipo) {
                            array_contactos.push(id_contacto);
                        }
                        log.audit({title:'id_contacto',details:id_contacto});
                    }catch(existe_error){
                        log.audit({title:'existe_error',details:existe_error});
                    }


                }
                if(array_contactos.length>0){
                    var record_cliente = record.load({
                        type: record.Type.CUSTOMER,
                        id: id_cliente
                    });

                    var contacto_cliente = record_cliente.getValue({fieldId:'custentity_efx_fe_kiosko_contact'});
                    log.audit({title:'contacto_cliente',details:contacto_cliente});
                    if(contacto_cliente) {
                        if (contacto_cliente.length > 0) {
                            for (var c = 0; c < contacto_cliente.length; c++) {
                                array_contactos.push(contacto_cliente[c]);
                            }
                        }

                        log.audit({title: 'array_contactos', details: array_contactos});
                        record_cliente.setValue({fieldId: 'custentity_efx_fe_kiosko_contact', value: array_contactos});
                    }
                    record_cliente.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });
                }

            }catch(error_contact){
                log.audit({title:'error_contact',details:error_contact});
            }

        }

        function buscaRESICO(){
            var resOBJ = []
            var taxcodeSearchObj = search.create({
                type: "customrecord_efx_fe_resico_taxcode",
                columns:
                [
                    search.createColumn({name: "custrecord_efx_fe_resico_tcnetsuite"}),
                    search.createColumn({name: "custrecord_efx_fe_resico_tcresico"})
                ]
            });
            var results = taxcodeSearchObj.runPaged().count;

            taxcodeSearchObj.run().each(function(taxcode){
                var objresult = {
                    nstaxcode:'',
                    resicotaxcode:''
                }

                objresult.nstaxcode = taxcode.getValue('custrecord_efx_fe_resico_tcnetsuite' || "");
                objresult.resicotaxcode = taxcode.getValue('custrecord_efx_fe_resico_tcresico' || "");

                resOBJ.push(objresult);
                return true;
            });

            log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ function buscaRESICO()', details: 'resOBJ ~ 2454 ~ ' + JSON.stringify(resOBJ)});
            return resOBJ
        }

        function crearFactura(transid,tipo,cliente_id,objeto,plantilla_f,clienteoriginal_fact,SUBSIDIARIES,campos_refacturacion,regFiscalSubsidiaria){

            try {
                var id_cliente = '';
                if (!cliente_id) {
                    id_cliente = buscarCliente(objeto, objeto.cliente.rfc, 'T',SUBSIDIARIES);
                } else {
                    id_cliente = cliente_id;
                }

                var cliente_obj = record.load({
                    type: record.Type.CUSTOMER,
                    id: id_cliente
                });

                var array_clientes = cliente_obj.getValue({fieldId: 'custentity_efx_fe_kiosko_contact'});

                //se carga la información de la transacción original para realizar una copia
                var record_trans = record.load({
                    type: tipo,
                    id: transid,
                    isDynamic: true,
                });

                //Obtener numero de lineas en sublista
                var numLines = record_trans.getLineCount({
                    sublistId: 'item'
                });
                //obtener datos de cabecera
                var entity = record_trans.getValue('entity');
                var tktyaax = record_trans.getValue('custbody_efx_iy_noticket');
                var location = record_trans.getValue('location');
                var edocument_template = record_trans.getValue('custbody_psg_ei_template');
                var edocument_sendmethod = record_trans.getValue('custbody_psg_ei_sending_method');

                var shipmethod = record_trans.getValue('shipmethod');
                var shippingtaxcode = record_trans.getValue('shippingtaxcode');
                var shippingtax1rate = record_trans.getValue('shippingtax1rate');
                var shippingcost = record_trans.getValue('shippingcost');
                log.audit({title: 'objeto', details: objeto});
                log.audit({title: 'objeto.uso_cfdi', details: objeto.cliente.uso_cfdi});
                log.audit({title: 'objeto.uso_cfdi.value', details: objeto.cliente.uso_cfdi.value});


                var uso_cfdi = '';
                if(objeto.cliente.uso_cfdi.value){
                    uso_cfdi = objeto.cliente.uso_cfdi.value;
                }else{
                    uso_cfdi = record_trans.getValue('custbody_mx_cfdi_usage');
                }
                var pay_method = '';
                if(objeto.cliente.metodo_pago.value){
                    pay_method = objeto.cliente.metodo_pago.value;
                }else{
                    pay_method = record_trans.getValue('custbody_mx_txn_sat_payment_method');
                }
                var pay_form = '';
                if(objeto.cliente.forma_pago.value){
                    pay_form = objeto.cliente.forma_pago.value;
                }else{
                    pay_form = record_trans.getValue('custbody_mx_txn_sat_payment_term');
                }

                var doc_number = record_trans.getValue('tranid');

                //Obtener datos de articulos
                var articulos_sublist = new Array();
                var cantidad_sublist = new Array();
                var rate_sublist = new Array();
                var amount_sublist = new Array();
                var tax_sublist = new Array();
                var location_sublist = new Array();
                var type_sublist = new Array();
                var resicoTaxObj = new Array();

                for (var i = 0; i < numLines; i++) {
                    articulos_sublist[i] = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i,
                    });
                    cantidad_sublist[i] = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: i,
                    });
                    rate_sublist[i] = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i,
                    });
                    amount_sublist[i] = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: i,
                    });


                    tax_sublist[i] = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'taxcode',
                        line: i,
                    });
                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: tax_sublist});

                    type_sublist[i] = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'itemtype',
                        line: i,
                    });

                    var locationsublistvalor = record_trans.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: i,
                    });
                    if(locationsublistvalor){
                        location_sublist[i] = locationsublistvalor;
                    }

                }
                var tipo_persona = '';
                if(objeto.cliente.tipo){
                    tipo_persona = 'T';
                }else{
                    tipo_persona = 'F';
                }
                regimenCliente = (regFiscalSubsidiaria).split(" - ");
                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2568 ~ ' + regimenCliente[0]});
                // regimenCliente = parseInt(regimenCliente);
                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ regimenCliente', details: 'regimenCliente ~ 2570 ~ ' + typeof regimenCliente[0]+' '+ regimenCliente[0]});
                if (regimenCliente[0] == "626" && tipo_persona=="F") {
                    log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2550 ~ ' + tax_sublist});
                    resicoTaxObj = buscaRESICO();
                    // log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ resicoTaxObj', details: 'resicoTaxObj ~ 2575 ~ ' + JSON.stringify(resicoTaxObj)});
                    for (var nstaxcode = 0; nstaxcode < tax_sublist.length; nstaxcode++) {
                        for (var resico = 0; resico < resicoTaxObj.length; resico++) {
                            if (tax_sublist[nstaxcode] == resicoTaxObj[resico].nstaxcode) {
                                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ IF', details: ' ~ 2592 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                                tax_sublist[nstaxcode] = resicoTaxObj[resico].resicotaxcode
                                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ tax_sublist', details: 'tax_sublist ~ 2593 ~ ' + tax_sublist[nstaxcode]});
                            } else {
                                log.audit({title: 'EFX_FE_Kiosko_Connection_SL ~ ELSE', details: ' ~ 2594 ~ ' + tax_sublist[nstaxcode] +' vs '+ resicoTaxObj[resico].nstaxcode});
                            }
                        }
                    }
                }else{log.audit({title: 'tistex2'});}
                //se crea la nueva factura con la informacion obtenida anteriormente

                var record_invoice = record.create({
                    //type: tipo,
                    type: record.Type.INVOICE,
                    isDynamic: false,
                });

                log.audit({title:'array_clientes',details:array_clientes});
                log.audit({title:'id_cliente',details:id_cliente});
                 // var record_invoice = record.copy({
                 //     type: tipo,
                 //     id: transid,
                 //     isDynamic: false,
                 //     defaultValues: {
                 //          entity: id_cliente,
                 //         // // location: location,
                 //         // // custbody_psg_ei_template: edocument_template,
                 //         // custbody_efx_fe_send_cert_docs: true,
                 //         // custbody_psg_ei_edoc_recipient: contactos_envio,
                 //        // memo: doc_number,
                 //         // // custbody_psg_ei_sending_method: edocument_sendmethod,
                 //         // custbody_mx_cfdi_usage: uso_cfdi,
                 //         // custbody_mx_txn_sat_payment_method: pay_method,
                 //         // custbody_mx_txn_sat_payment_term: pay_form,
                 //     }
                 // });

                //inserta datos de cabecera
                record_invoice.setValue({
                    fieldId: 'entity',
                    value: clienteoriginal_fact
                });
                record_invoice.setValue({
                    fieldId: 'location',
                    value: location
                });

                log.audit({title:'locationtest',details:location});
                record_invoice.setValue({
                    fieldId: 'custbody_efx_fe_send_cert_docs',
                    value: true
                });

                log.audit({title: 'contactos_envio', details: contactos_envio});
                record_invoice.setValue({
                    fieldId: 'custbody_efx_fe_mail_to',
                    //value: array_clientes
                    value: contactos_envio
                });

                record_invoice.setValue({
                    fieldId: 'custbody_efx_fe_kiosko_folio',
                    value: doc_number
                });

                // if(tktyaax){
                //     record_invoice.setValue({
                //         fieldId: 'custbody_efx_iy_noticket',
                //         value: tktyaax
                //     });
                // }


                record_invoice.setValue({
                    fieldId: 'custbody_efx_fe_kiosko_customer',
                    value: id_cliente
                });

                log.audit({title: 'edocument_sendmethod', details: edocument_sendmethod});
                log.audit({title: 'edocument_template', details: edocument_template});
                record_invoice.setValue({
                    fieldId: 'custbody_psg_ei_sending_method',
                    value: edocument_sendmethod
                });

                record_invoice.setValue({
                    fieldId: 'custbody_psg_ei_template',
                    value: plantilla_f
                });
                record_invoice.setValue({
                    fieldId: 'custbody_mx_cfdi_usage',
                    value: uso_cfdi
                });
                record_invoice.setValue({
                    fieldId: 'custbody_mx_txn_sat_payment_method',
                    value: pay_form

                });
                record_invoice.setValue({
                    fieldId: 'custbody_mx_txn_sat_payment_term',
                    value: pay_method
                });


                if(shipmethod){
                    record_invoice.setValue({
                        fieldId: 'shipmethod',
                        value: shipmethod
                    });
                }
                if(shippingtaxcode){
                    record_invoice.setValue({
                        fieldId: 'shippingtaxcode',
                        value: shippingtaxcode
                    });
                }
                if(shippingtax1rate){
                    record_invoice.setValue({
                        fieldId: 'shippingtax1rate',
                        value: shippingtax1rate
                    });
                }
                if(shippingcost){
                    record_invoice.setValue({
                        fieldId: 'shippingcost',
                        value: shippingcost
                    });
                }







                //var objRefacturacionCampos = {};
                log.audit({title:'9',details:campos_refacturacion.length});
                try{
                    for(var r=0;r<campos_refacturacion.length;r++){
                        log.audit({title:'campos_refacturacion[r]',details:campos_refacturacion[r]});
                        record_invoice.setValue({
                            fieldId: campos_refacturacion[r],
                            value: record_trans.getValue(campos_refacturacion[r])
                        });
                    }
                }catch (error_refacturacion_campos){
                    log.error({title:'error_refacturacion_campos',details:error_refacturacion_campos});
                }

                //log.audit({title: 'objRefacturacionCampos', details: objRefacturacionCampos});

                //inserta datos de articulo
                log.audit({title:'location_sublisttest',details:location_sublist});
                for (var x = 0; x < numLines; x++) {
                    record_invoice.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: x,
                        value: articulos_sublist[x]
                    });
                    record_invoice.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: x,
                        value: cantidad_sublist[x]
                    });

                    if(type_sublist[x]!='Discount'){
                        record_invoice.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: x,
                            value: rate_sublist[x]
                        });
                    }

                    record_invoice.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'amount',
                        line: x,
                        value: amount_sublist[x]
                    });
                    record_invoice.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'taxcode',
                        line: x,
                        value: tax_sublist[x]
                    });
                    /*record_invoice.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        line: x,
                        value: location
                    });*/
                    if(location_sublist[x] && location_sublist.length>0){
                        log.audit({title:'location_sublist[x]',details:location_sublist[x]});
                        record_invoice.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'location',
                            line: x,
                            value: location_sublist[x]
                        });

                    }
                }


                var id_registro_invoice = record_invoice.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                return id_registro_invoice;
            }catch(error_crea_factura){
                log.error({title:'error_crea_factura',details:error_crea_factura});
            }

        }

        function actualizaFactura(){

        }

        function sendToMail(tranid,trantype){
            var scheme = 'https://';
            var host = urlMod.resolveDomain({
                hostType: urlMod.HostType.APPLICATION
            });


            var SLURL = urlMod.resolveScript({
                scriptId: 'customscript_efx_fe_mail_sender_sl',
                deploymentId: 'customdeploy_efx_fe_mail_sender_sl',
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

            log.audit({title:'response-code_mail',details:response.code});
            log.audit({title:'response-body_mail',details:response.body});

            return response;

        }

        function getParameters(requestParams){
            var params_obj = {
                keys:[],
                values:[]
            }
            var array_params = new Array();
            var array_params_values = new Array();
            log.audit({title:'requestParams',details:requestParams});
            var tam_parameters = Object.keys(requestParams).length;
            for(var i=0;i<tam_parameters;i++) {
                var custparam = Object.keys(requestParams)[i];
                if (custparam != 'custparam_getinfo' && custparam != 'custparam_accion' && custparam != 'custparam_custentity_mx_rfc' && custparam != 'custparam_config') {
                    custparam = custparam.indexOf('custparam_') !== -1;
                    log.audit({title: 'custparam', details: custparam});
                    if (custparam) {
                        var parametro_string = Object.keys(requestParams)[i];
                        var parametro = parametro_string.replace('custparam_', '');
                        params_obj.keys.push(parametro);
                        params_obj.values.push(requestParams[Object.keys(requestParams)[i]]);
                    }
                }
            }
            return params_obj;
        }

        return {
            onRequest: onRequest
        };

    });
