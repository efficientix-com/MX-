/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record','N/search','N/runtime'],
    /**
     * @param{record} record
     */
    (record,search,runtime) => {
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
                            //Obtener Info de parametros
                            var scriptObj = runtime.getCurrentScript();
                            //var id_registro = scriptObj.getParameter({ name: 'custscript_efx_cme_transactions' });
                            var id_registro = 19028;

                            log.audit({title:'id_registro',details:id_registro});
                            var filtros_busqueda = new Array();
                            if(id_registro){
                                    log.audit({title:'id_registro',details:id_registro});
                                    filtros_busqueda.push(["type",search.Operator.ANYOF,"CustInvc","CustCred","CashSale"]);
                                    filtros_busqueda.push('AND');
                                    filtros_busqueda.push(['mainline', search.Operator.IS, 'T']);
                                    filtros_busqueda.push('AND');
                                    filtros_busqueda.push(['internalid', search.Operator.ANYOF, id_registro]);

                            }else{
                                    filtros_busqueda.push(["type",search.Operator.ANYOF,"CustInvc","CustCred","CashSale"]);
                                    filtros_busqueda.push('AND');
                                    filtros_busqueda.push(['mainline', search.Operator.IS, 'T']);
                                    filtros_busqueda.push('AND');
                                    filtros_busqueda.push(['custbody_efx_fe_tax_json', search.Operator.ISEMPTY, '']);
                            }

                            var buscaregistros = search.create({
                                    type: search.Type.TRANSACTION,
                                    filters: filtros_busqueda,
                                    columns: [
                                            search.createColumn({name:'internalid'}),
                                            search.createColumn({name:'type'}),
                                    ]
                            });


                            log.audit({title:'buscaregistros',details:buscaregistros});


                            return buscaregistros;

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
                    var data_reduce = JSON.parse(reduceContext.values[0]);
                    log.audit({title: 'data_reduce', details: data_reduce});
                    var trantype=data_reduce.type.value;
                    var tranid=data_reduce.internalid.value;

                    if (trantype == 'CustInvc') {
                            trantype = record.Type.INVOICE;
                    }

                    if (trantype == 'CashSale') {
                            trantype = record.Type.CASH_SALE;
                    }
                    if (trantype == 'CustPymt') {
                            trantype = record.Type.CUSTOMER_PAYMENT;
                    }
                    if (trantype == 'CustCred') {
                            trantype = record.Type.CREDIT_MEMO;
                    }

                            var obj_Json_Tax_totales = new Object();

                            //objeto de totales de impuestos(cabecera)
                            obj_Json_Tax_totales = {
                                    ieps_total: 0,
                                    iva_total: 0,
                                    retencion_total: 0,
                                    local_total: 0,
                                    exento_total: 0,
                                    ieps_total_gbl: 0,
                                    iva_total_gbl: 0,
                                    retencion_total_gbl: 0,
                                    local_total_gbl: 0,
                                    exento_total_gbl: 0,
                                    rates_ieps:{},
                                    rates_ieps_data:{},
                                    bases_ieps:{},
                                    rates_iva:{},
                                    rates_iva_data:{},
                                    bases_iva:{},
                                    rates_retencion:{},
                                    rates_retencion_data:{},
                                    bases_retencion:{},
                                    rates_local:{},
                                    rates_local_data:{},
                                    bases_local:{},
                                    rates_exento:{},
                                    rates_exento_data:{},
                                    bases_exento:{},
                                    monto_ieps_gbl:{},
                                    monto_iva_gbl:{},
                                    monto_ret_gbl:{},
                                    monto_local_gbl:{},
                                    monto_exento_gbl:{},
                                    descuentoConImpuesto:0,
                                    descuentoSinImpuesto:0,
                                    totalImpuestos:0,
                                    subtotal:0,
                                    total:0,
                                    totalTraslados:0,
                                    totalRetenciones:0,
                                    diferenciaTotales:0,
                                    totalImpuestos_gbl:0,
                                    subtotal_gbl:0,
                                    total_gbl:0,
                                    totalTraslados_gbl:0,
                                    totalRetenciones_gbl:0,
                            }

                            var obj_diferencias = new Object();


                            try {


                                            var record_now = record.load({
                                                    type: trantype,
                                                    id: tranid
                                            });
                                            var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
                                            var factEspejo = record_now.getValue({fieldId: 'custbody_efx_fe_gbl_ismirror'});
                                            var tipogbl = record_now.getValue({fieldId: 'custbody_efx_fe_gbl_type'});
                                            var descuentoglobal = record_now.getValue({fieldId: 'discounttotal'});
                                            descuentoglobal = parseFloat(descuentoglobal)* -1;

                                    if (factEspejo != true || (factEspejo == true && tipogbl==2)) {
                                            var line_count_expense = record_now.getLineCount({sublistId: 'expense'});
                                            var subtotalTran = record_now.getValue({fieldId: 'subtotal'});
                                            var totalTran = record_now.getValue({fieldId: 'total'});
                                            var obj_Json_Tax = new Object();
                                            var rate_desccabecera = 0;

                                            if(descuentoglobal){
                                                    rate_desccabecera = ((descuentoglobal*100)/subtotalTran).toFixed(2);
                                                    rate_desccabecera = parseFloat(rate_desccabecera)/100;
                                            }

                                            //busqueda de configuración de impuestos
                                            var desglose_config = search.create({
                                                    type: 'customrecord_efx_fe_desglose_tax',
                                                    filters: ['isinactive', search.Operator.IS, 'F'],
                                                    columns: [
                                                            search.createColumn({name: 'custrecord_efx_fe_desglose_ieps'}),
                                                            search.createColumn({name: 'custrecord_efx_fe_desglose_ret'}),
                                                            search.createColumn({name: 'custrecord_efx_fe_desglose_locales'}),
                                                            search.createColumn({name: 'custrecord_efx_fe_desglose_iva'}),
                                                            search.createColumn({name: 'custrecord_efx_fe_desglose_exento'}),
                                                    ]
                                            });

                                            var ejecutar = desglose_config.run();
                                            var resultado = ejecutar.getRange(0, 100);

                                            var config_ieps = new Array();
                                            var config_retencion = new Array();
                                            var config_local = new Array();
                                            var config_iva = new Array();
                                            var config_exento = new Array();

                                            //se guarda la configuración de los tipos diferentes de impuesto en variables
                                            config_ieps = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_ieps'})).split(',');
                                            config_retencion = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_ret'})).split(',');
                                            config_local = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_locales'})).split(',');
                                            config_iva = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_iva'})).split(',');
                                            config_exento = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_exento'})).split(',');

                                            log.audit({title: 'config_ieps', details: config_ieps});
                                            log.audit({title: 'config_retencion', details: config_retencion});
                                            log.audit({title: 'config_local', details: config_local});
                                            log.audit({title: 'config_iva', details: config_iva});

                                            var importe_retencion = 0;
                                            var importe_iva = 0;
                                            var importe_exento = 0;
                                            var importe_ieps = 0;
                                            var importe_ieps_nf = 0;
                                            var importe_local = 0;
                                            var subtotalTransaccion = 0;
                                            var impuestosTransaccion = 0;
                                            var impuestosCalculados = 0;
                                            var totalTraslados = 0;
                                            var totalRetenciones = 0;
                                            var line_count = record_now.getLineCount({sublistId: 'item'});

                                            //recorrido de linea de articulos
                                            var ieps_baseveintiseis = 0;
                                            var ieps_basedieciseis = 0;

                                            var objImpuestos = obtenObjImpuesto();

                                            for (var i = 0; i < line_count; i++) {
                                                    log.audit({title: 'inicio linea', details: i});
                                                    //objeto de tipos de impuesto por linea
                                                    obj_Json_Tax = {
                                                            ieps: {
                                                                    name: "",
                                                                    id: "",
                                                                    factor: "003",
                                                                    rate: 0,
                                                                    base: 0,
                                                                    base_importe: 0,
                                                                    importe: '',
                                                                    rate_div: 0,
                                                                    descuento: 0
                                                            },
                                                            locales: {
                                                                    name: "",
                                                                    id: "",
                                                                    factor: "002",
                                                                    rate: 0,
                                                                    base: 0,
                                                                    base_importe: 0,
                                                                    importe: '',
                                                                    rate_div: 0,
                                                                    descuento: 0
                                                            },
                                                            retenciones: {
                                                                    name: "",
                                                                    id: "",
                                                                    factor: "002",
                                                                    rate: 0,
                                                                    base: 0,
                                                                    base_importe: 0,
                                                                    importe: '',
                                                                    rate_div: 0,
                                                                    descuento: 0
                                                            },
                                                            iva: {
                                                                    name: "",
                                                                    id: "",
                                                                    factor: "002",
                                                                    rate: 0,
                                                                    base: 0,
                                                                    base_importe: 0,
                                                                    importe: '',
                                                                    rate_div: 0,
                                                                    descuento: 0
                                                            },
                                                            exento: {
                                                                    name: "",
                                                                    id: "",
                                                                    factor: "002",
                                                                    rate: 0,
                                                                    base: 0,
                                                                    base_importe: 0,
                                                                    importe: '',
                                                                    rate_div: 0,
                                                                    descuento: 0
                                                            },
                                                            descuentoConImpuesto: 0,
                                                            descuentoSinImpuesto: 0,
                                                            montoLinea: 0,
                                                            impuestoLinea: 0,
                                                            impuestoLineaCalculados: 0
                                                    }
                                                    //validacion si existe alguna linea de descuento (la linea de descuento es la siguiente a la de
                                                    // articulo)
                                                    var descuento_linea = 0;
                                                    var descuento_linea_sin = 0;
                                                    var tipo_articulo = record_now.getSublistValue({
                                                            sublistId: 'item',
                                                            fieldId: 'itemtype',
                                                            line: i
                                                    });
                                                    log.audit({title: 'tipo_articulo', details: tipo_articulo});
                                                    if (tipo_articulo == 'Discount') {
                                                            continue;
                                                    }
                                                    var impuesto_descuento = 0;
                                                    var descuento_notax = 0;
                                                    if (i < (line_count - 1)) {
                                                            var tipo_articulo = record_now.getSublistValue({
                                                                    sublistId: 'item',
                                                                    fieldId: 'itemtype',
                                                                    line: i + 1
                                                            });
                                                            if (tipo_articulo == 'Discount') {
                                                                    var linea_descuentos_monto = record_now.getSublistValue({
                                                                            sublistId: 'item',
                                                                            fieldId: 'grossamt',
                                                                            line: i + 1
                                                                    });

                                                                    var a_rate = record_now.getSublistValue({
                                                                            sublistId: 'item',
                                                                            fieldId: 'rate',
                                                                            line: i + 1
                                                                    });
                                                                    log.audit({title: 'a_rate', details: a_rate});

                                                                    var a_amount = record_now.getSublistValue({
                                                                            sublistId: 'item',
                                                                            fieldId: 'amount',
                                                                            line: i + 1
                                                                    });
                                                                    log.audit({title: 'a_amount', details: a_amount});
                                                                    var a_quantity = record_now.getSublistValue({
                                                                            sublistId: 'item',
                                                                            fieldId: 'quantity',
                                                                            line: i + 1
                                                                    });
                                                                    log.audit({title: 'a_quantity', details: a_quantity});

                                                                    if(existeSuiteTax){
                                                                            impuesto_descuento = record_now.getSublistValue({
                                                                                    sublistId: 'item',
                                                                                    fieldId: 'taxamount',
                                                                                    line: i + 1
                                                                            });
                                                                    }else{
                                                                            impuesto_descuento = record_now.getSublistValue({
                                                                                    sublistId: 'item',
                                                                                    fieldId: 'tax1amt',
                                                                                    line: i + 1
                                                                            });
                                                                    }

                                                                    if (!a_quantity) {
                                                                            a_quantity = 1;
                                                                    }

                                                                    var a_rate_abs = a_rate * -1;
                                                                    var a_amount_abs = a_amount * -1;
                                                                    log.audit({title: 'a_rate_abs', details: a_rate_abs});
                                                                    log.audit({title: 'a_amount_abs', details: a_amount_abs});
                                                                    // if(a_rate_abs < a_amount_abs){
                                                                    //     var ratef = a_rate_abs.toFixed(3);
                                                                    //     var amountf = a_amount_abs.toFixed(3);
                                                                    //     if(parseFloat(ratef)>parseFloat(amountf)){
                                                                    //         descuento_notax = parseFloat(a_rate) * parseFloat(a_quantity);
                                                                    //         log.audit({title:'montos',details:'montos'});
                                                                    //     }else{
                                                                    //         descuento_notax = parseFloat(a_amount) * parseFloat(a_quantity);
                                                                    //         log.audit({title:'porcentaje',details:'porcentaje'});
                                                                    //     }
                                                                    //
                                                                    // }else{
                                                                    //     descuento_notax = parseFloat(a_rate) * parseFloat(a_quantity);
                                                                    //     log.audit({title:'montos',details:'montos'});
                                                                    // }


                                                                    descuento_notax = record_now.getSublistValue({
                                                                            sublistId: 'item',
                                                                            fieldId: 'amount',
                                                                            line: i + 1
                                                                    });
                                                                    descuento_linea = linea_descuentos_monto * (-1);
                                                                    descuento_linea_sin = descuento_notax * (-1);

                                                                    obj_Json_Tax_totales.descuentoConImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoConImpuesto) + descuento_linea).toFixed(2);
                                                                    obj_Json_Tax_totales.descuentoSinImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto) + descuento_linea_sin).toFixed(2);


                                                                    //almacena el impuesto con y sin impuesto en atributos del objeto de la linea de impuestos
                                                                    obj_Json_Tax.descuentoConImpuesto = descuento_linea.toFixed(2);
                                                                    obj_Json_Tax.descuentoSinImpuesto = descuento_linea_sin.toFixed(2);
                                                            }
                                                            //se obtiene el descuento en una variable para usarlo posteriormente
                                                    }

                                                    log.audit({title: 'descuento_notax linea: ' + i, details: descuento_notax});
                                                    //obtiene información de campos de la linea
                                                    var base_rate = record_now.getSublistValue({sublistId: 'item', fieldId: 'rate', line: i});
                                                    var base_quantity = record_now.getSublistValue({
                                                            sublistId: 'item',
                                                            fieldId: 'quantity',
                                                            line: i
                                                    });
                                                    if (!base_rate) {
                                                            var importe_amount = record_now.getSublistValue({
                                                                    sublistId: 'item',
                                                                    fieldId: 'amount',
                                                                    line: i
                                                            });
                                                            base_rate = importe_amount / base_quantity;
                                                    }
                                                    if(!existeSuiteTax){
                                                            var tax_code = record_now.getSublistValue({sublistId: 'item', fieldId: 'taxcode', line: i});
                                                    }
                                                    var importe_base = record_now.getSublistValue({
                                                            sublistId: 'item',
                                                            fieldId: 'amount',
                                                            line: i
                                                    });

                                                    if(descuentoglobal){
                                                            descuento_notax = (importe_base*rate_desccabecera)* -1;
                                                    }


                                                    //var importe_base = parseFloat(base_rate) * parseFloat(base_quantity);
                                                    subtotalTransaccion = subtotalTransaccion + parseFloat(importe_base.toFixed(2));
                                                    obj_Json_Tax.montoLinea = importe_base.toFixed(2);
                                                    if(descuentoglobal && rate_desccabecera){
                                                            obj_Json_Tax.descuentoConImpuesto = (importe_base*rate_desccabecera).toFixed(2);
                                                            obj_Json_Tax.descuentoSinImpuesto = (importe_base*rate_desccabecera).toFixed(2);
                                                    }

                                                    //obtiene monto de impuesto en linea
                                                    if(existeSuiteTax){
                                                            var total_linea = parseFloat(record_now.getSublistValue({
                                                                    sublistId: 'item',
                                                                    fieldId: 'taxamount',
                                                                    line: i
                                                            }));
                                                    }else{
                                                            var total_linea = parseFloat(record_now.getSublistValue({
                                                                    sublistId: 'item',
                                                                    fieldId: 'tax1amt',
                                                                    line: i
                                                            }));
                                                    }


                                                    obj_Json_Tax.impuestoLinea = total_linea.toFixed(2);
                                                    impuestosTransaccion = impuestosTransaccion + total_linea;

                                                    var suma_linea = 0;
                                                    var suma_linea_tax = 0;
                                                    var suma_linea_tax_desc = 0;


                                                    var grupo_impuestos = true;
                                                    //Diferencia si se utiliza codigo o grupo de impuestos
                                                    if(existeSuiteTax){
                                                            var taxref_linea = record_now.getSublistValue({
                                                                    sublistId: 'item',
                                                                    fieldId: 'taxdetailsreference',
                                                                    line: i
                                                            });
                                                            var quantity_st = record_now.getSublistValue({
                                                                    sublistId: 'item',
                                                                    fieldId: 'quantity',
                                                                    line: i
                                                            });
                                                            var objSuiteTax = obtieneSuiteTaxInfo(record_now,taxref_linea);
                                                            var tax_lines_count = objSuiteTax[taxref_linea].length;
                                                    }else{
                                                            if(objImpuestos.TaxGroup.hasOwnProperty(tax_code)){
                                                                    grupo_impuestos = true;
                                                                    var tax_lines_count = objImpuestos.TaxGroup[tax_code].length;
                                                            }else if(objImpuestos.TaxCodes.hasOwnProperty(tax_code)){
                                                                    grupo_impuestos = false;
                                                                    var tax_lines_count = 1;
                                                            }
                                                    }


                                                    var contadorLineas = 0;
                                                    var tiene_ieps = 0;

                                                    //recorrido de los diferentes impuestos que conforman la linea de articulos

                                                    for (var x = 0; x < tax_lines_count; x++) {
                                                            //lee campos dependiendo si es grupo o codigo de impuestos
                                                            if(existeSuiteTax){
                                                                    var tax_name = objSuiteTax[taxref_linea][x].nombre;

                                                                    var tax_id = objSuiteTax[taxref_linea][x].taxcode;

                                                                    var tax_rate = objSuiteTax[taxref_linea][x].rate;

                                                                    var tax_base = parseFloat(objSuiteTax[taxref_linea][x].base)/parseFloat(quantity_st);

                                                            }else{
                                                                    if (grupo_impuestos) {
                                                                            var tax_name = objImpuestos.TaxGroup[tax_code][x].taxname2;
                                                                            var tax_id = objImpuestos.TaxGroup[tax_code][x].taxname;
                                                                            var tax_rate = objImpuestos.TaxGroup[tax_code][x].rate;
                                                                            var tax_base = objImpuestos.TaxGroup[tax_code][x].basis;
                                                                            var tax_tipo = objImpuestos.TaxGroup[tax_code][x].taxtype;
                                                                    } else {
                                                                            var tax_name = objImpuestos.TaxCodes[tax_code][x].itemid;
                                                                            var tax_id = objImpuestos.TaxCodes[tax_code][x].id;
                                                                            var tax_rate = objImpuestos.TaxCodes[tax_code][x].rate;
                                                                            var tax_base = '100';
                                                                            var tax_tipo = objImpuestos.TaxCodes[tax_code][x].taxtype;
                                                                    }
                                                            }


                                                            log.audit({title: 'tax_rate', details: tax_rate});
                                                            //var rate_replace = tax_rate.replace("%", "");
                                                            var rate_number = parseFloat(tax_rate);

                                                            //En los siguientes for se almacenan dentro del objeto la informacion de impuestos dentro
                                                            // de cada atributo por tipo de impuesto

                                                            //definir retenciones
                                                            for (var ret = 0; ret < config_retencion.length; ret++) {
                                                                    //se compara el codigo de impuesto de la linea con el de la configuración de retenciones
                                                                    if (tax_id == config_retencion[ret]) {
                                                                            //almacena la información del codigo de impuesto
                                                                            if(existeSuiteTax){
                                                                                    obj_Json_Tax.retenciones.rate = rate_number;
                                                                            }else{
                                                                                    obj_Json_Tax.retenciones.rate = rate_number * (-1);
                                                                            }

                                                                            obj_Json_Tax.retenciones.id = tax_id;
                                                                            obj_Json_Tax.retenciones.base = tax_base;
                                                                            obj_Json_Tax.retenciones.name = tax_name;
                                                                            //calcula el importe base con la base del impuesto y el importe de la linea
                                                                            // monto de la linea (amount) por la base de impuesto entre 100
                                                                            var base_imp = (parseFloat(importe_base) * parseFloat(tax_base)) / 100;
                                                                            obj_Json_Tax.retenciones.base_importe = base_imp.toFixed(2);
                                                                            //se multiplica el rate number por -1 porque el impuesto de retencion se configura
                                                                            //en negativo la base
                                                                            if(existeSuiteTax){
                                                                                    var rate_num = rate_number;
                                                                            }else{
                                                                                    var rate_num = rate_number * (-1);
                                                                            }

                                                                            //se obtiene la base en decimales
                                                                            var base_calc = parseFloat(tax_base) / 100;
                                                                            //se obtiene el rate del impuesto en decimales
                                                                            var rate_div = rate_num / 100;
                                                                            obj_Json_Tax.retenciones.rate_div = rate_div;

                                                                            //el importe de impuesto se obtiene multiplicando el rate de impuesto en decimales
                                                                            //por el importe por la base
                                                                            var tax_importe = (rate_div * parseFloat(importe_base)) * base_calc;

                                                                            totalRetenciones = totalRetenciones + parseFloat(tax_importe.toFixed(2));

                                                                            //se pone a 2 decimales el importe de impuesto
                                                                            obj_Json_Tax.retenciones.importe = tax_importe.toFixed(2);
                                                                            //tax_importe = parseFloat(tax_importe.toFixed(2));

                                                                            //sumatoria de las retenciones para obtener total de retenciones
                                                                            importe_retencion = parseFloat(importe_retencion) + parseFloat(tax_importe.toFixed(2));
                                                                            //suma para comparar diferencia de centavos, se suman todos los impuestos de este tipo
                                                                            suma_linea = suma_linea - parseFloat(tax_importe);
                                                                            if (descuento_notax == 0) {
                                                                                    suma_linea_tax = suma_linea_tax - parseFloat(tax_importe.toFixed(2));
                                                                            }

                                                                            suma_linea_tax_desc = suma_linea_tax_desc - parseFloat(tax_importe.toFixed(2));

                                                                            //se genera descripcion por tipo de impuesto y porcentaje
                                                                            var cadena = 'Retencion ';
                                                                            var cadena_rate = cadena + rate_num + '%';
                                                                            //se obtiene numero de atributos dentro del objeto de totales en retenciones
                                                                            var tam_rates_ret = Object.keys(obj_Json_Tax_totales.rates_retencion).length;

                                                                            //solo se ejecuta si ya existe un atributo
                                                                            if (tam_rates_ret > 0) {
                                                                                    //recorrido de atributos de objeto de totales
                                                                                    for (var t = 0; t < tam_rates_ret; t++) {
                                                                                            //compara el rate dentro del objeto con el de la linea
                                                                                            if (Object.keys(obj_Json_Tax_totales.rates_retencion)[t] == cadena_rate) {
                                                                                                    //obtiene los datos ya existentes en el atributo
                                                                                                    var importe_obj = obj_Json_Tax_totales.rates_retencion[cadena_rate];
                                                                                                    var base_ret_total = obj_Json_Tax_totales.bases_retencion[rate_num];
                                                                                                    //hace sumatoria con los datos existentes en la linea y con los del atributo
                                                                                                    var obj_ret_total_base = parseFloat(base_ret_total) + parseFloat(base_imp);
                                                                                                    var obj_ret_total = parseFloat(importe_obj) + parseFloat(tax_importe);

                                                                                                    //reemplaza datos ya sumarizados
                                                                                                    obj_Json_Tax_totales.rates_retencion[cadena_rate] = obj_ret_total.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_retencion_data[rate_num] = obj_ret_total.toFixed(2);
                                                                                                    obj_Json_Tax_totales.bases_retencion[rate_num] = obj_ret_total_base;
                                                                                            } else {
                                                                                                    //si no existe el rate y pertenece a retención, se agrega un atributo nuevo
                                                                                                    if (!obj_Json_Tax_totales.rates_retencion[cadena_rate]) {
                                                                                                            //llena el importe y el importe base en los atributos del objeto de totales
                                                                                                            obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                                                                            obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                                                                            obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp;
                                                                                                    }
                                                                                            }
                                                                                    }
                                                                                    //se ejecuta si no existe ningun atributo
                                                                            } else {
                                                                                    //llena el importe y el importe base en los atributos del objeto de totales
                                                                                    obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                                                    obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                                                    obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                                                            }
                                                                    }
                                                            }

                                                            //definir locales

                                                            for (var loc = 0; loc < config_local.length; loc++) {
                                                                    if (tax_id == config_local[loc]) {
                                                                            obj_Json_Tax.locales.rate = rate_number;
                                                                            obj_Json_Tax.locales.id = tax_id;
                                                                            obj_Json_Tax.locales.base = tax_base;
                                                                            obj_Json_Tax.locales.name = tax_name;
                                                                            var base_imp = (parseFloat(importe_base) * parseFloat(tax_base)) / 100;
                                                                            obj_Json_Tax.locales.base_importe = base_imp.toFixed(2);
                                                                            var rate_num = rate_number * (-1);
                                                                            var base_calc = parseFloat(tax_base) / 100;
                                                                            var rate_div = rate_number / 100;
                                                                            obj_Json_Tax.locales.rate_div = rate_div;
                                                                            var tax_importe = (rate_div * parseFloat(importe_base)) * base_calc;
                                                                            totalTraslados = totalTraslados + parseFloat(tax_importe.toFixed(2));
                                                                            obj_Json_Tax.locales.importe = tax_importe.toFixed(2);
                                                                            //tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                            importe_local = parseFloat(importe_local) + parseFloat(tax_importe.toFixed(2));
                                                                            //suma para comparar diferencia de centavos

                                                                            suma_linea = suma_linea + parseFloat(tax_importe);
                                                                            if (descuento_notax == 0) {
                                                                                    suma_linea_tax = suma_linea_tax + parseFloat(tax_importe.toFixed(2));
                                                                            }
                                                                            suma_linea_tax_desc = suma_linea_tax_desc + parseFloat(tax_importe.toFixed(2));
                                                                            //

                                                                            var cadena = 'Local ';
                                                                            var cadena_rate = cadena + rate_number + '%';
                                                                            var tam_rates_locales = Object.keys(obj_Json_Tax_totales.rates_local).length;
                                                                            var objlocal_data = {
                                                                                    monto: '',
                                                                                    nombre: ''
                                                                            }
                                                                            if (tam_rates_locales > 0) {
                                                                                    for (var t = 0; t < tam_rates_locales; t++) {

                                                                                            objlocal_data.nombre = tax_name;
                                                                                            if (Object.keys(obj_Json_Tax_totales.rates_local)[t] == cadena_rate) {
                                                                                                    var importe_obj = obj_Json_Tax_totales.rates_local[cadena_rate];
                                                                                                    var base_local_total = obj_Json_Tax_totales.bases_local[rate_number];
                                                                                                    var obj_local_total_base = parseFloat(base_local_total) + parseFloat(base_imp);
                                                                                                    var obj_loc_total = parseFloat(importe_obj) + parseFloat(tax_importe);

                                                                                                    obj_Json_Tax_totales.rates_local[cadena_rate] = obj_loc_total.toFixed(2);
                                                                                                    objlocal_data.monto = obj_loc_total.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_local_data[rate_number] = objlocal_data;
                                                                                                    obj_Json_Tax_totales.bases_local[rate_number] = obj_local_total_base;
                                                                                            } else {
                                                                                                    if (!obj_Json_Tax_totales.rates_local[cadena_rate]) {
                                                                                                            obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                                                                            objlocal_data.monto = tax_importe.toFixed(2);
                                                                                                            obj_Json_Tax_totales.rates_local_data[rate_number] = objlocal_data;
                                                                                                            obj_Json_Tax_totales.bases_local[rate_number] = base_imp;
                                                                                                    }
                                                                                            }
                                                                                    }
                                                                            } else {
                                                                                    objlocal_data.nombre = tax_name;
                                                                                    obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                                                    objlocal_data.monto = tax_importe.toFixed(2);
                                                                                    obj_Json_Tax_totales.rates_local_data[rate_number] = objlocal_data;
                                                                                    obj_Json_Tax_totales.bases_local[rate_number] = base_imp;
                                                                            }
                                                                    }
                                                            }

                                                            //definir ieps


                                                            for (var iep = 0; iep < config_ieps.length; iep++) {
                                                                    if (tax_id == config_ieps[iep]) {
                                                                            log.audit({title: 'descuento_notaxieps linea: ' + i, details: descuento_notax});
                                                                            if (descuento_notax != 0) {
                                                                                    tiene_ieps++;
                                                                            }

                                                                            log.audit({title: 'tiene_iepscalculo', details: tiene_ieps});

                                                                            obj_Json_Tax.ieps.rate = rate_number;
                                                                            obj_Json_Tax.ieps.id = tax_id;
                                                                            obj_Json_Tax.ieps.base = tax_base;
                                                                            obj_Json_Tax.ieps.name = tax_name;
                                                                            obj_Json_Tax.ieps.descuento = (descuento_notax * (-1)).toFixed(2);

                                                                            var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100) + descuento_notax;
                                                                            log.audit({title: 'base_imp_ieps', details: base_imp});
                                                                            obj_Json_Tax.ieps.base_importe = base_imp.toFixed(2);
                                                                            var base_calc = parseFloat(tax_base) / 100;
                                                                            log.audit({title: 'base_calc', details: base_calc});
                                                                            var rate_div = rate_number / 100;
                                                                            log.audit({title: 'rate_div', details: rate_div});
                                                                            obj_Json_Tax.ieps.rate_div = rate_div;
                                                                            var tax_importe = (rate_div * parseFloat(importe_base + descuento_notax)) * base_calc;
                                                                            log.audit({title: 'tax_importe', details: tax_importe});
                                                                            obj_Json_Tax.ieps.importe = tax_importe.toFixed(2);
                                                                            // importe_ieps_nf = parseFloat(importe_ieps_nf) + parseFloat(tax_importe);
                                                                            // importe_ieps  = importe_ieps_nf;

                                                                            totalTraslados = totalTraslados + parseFloat(tax_importe.toFixed(2));

                                                                            //tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                            importe_ieps = parseFloat(importe_ieps) + parseFloat(tax_importe.toFixed(2));
                                                                            log.audit({title: 'tax_importe', details: tax_importe});
                                                                            log.audit({title: 'importe_ieps', details: importe_ieps});


                                                                            log.audit({title: 'importe_ieps_suma', details: importe_ieps});
                                                                            //suma para comparar diferencia de centavos

                                                                            var tax_importe_sumas = (rate_div * parseFloat(importe_base)) * base_calc;
                                                                            log.audit({title: 'tax_importe_sumas', details: tax_importe_sumas});
                                                                            //tax_importe_sumas = tax_importe_sumas.toFixed(2)
                                                                            log.audit({title: 'tax_importe_sumas', details: tax_importe_sumas});
                                                                            suma_linea = suma_linea + parseFloat(tax_importe_sumas);
                                                                            if (descuento_notax == 0) {
                                                                                    suma_linea_tax = suma_linea_tax + parseFloat(tax_importe.toFixed(2));
                                                                            }
                                                                            suma_linea_tax_desc = suma_linea_tax_desc + parseFloat(tax_importe.toFixed(2));

                                                                            log.audit({title: 'suma_linea_ieps', details: suma_linea});
                                                                            //

                                                                            var cadena = 'IEPS ';
                                                                            var cadena_rate = cadena + rate_number + '%';
                                                                            log.audit({title: 'cadena_rate_ieps', details: cadena_rate});
                                                                            var tam_rates_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                                                                            log.audit({title: 'rate_div-nueva', details: rate_div});
                                                                            if (tam_rates_ieps > 0) {
                                                                                    for (var t = 0; t < tam_rates_ieps; t++) {
                                                                                            log.audit({
                                                                                                    title: 'obj_Json_Tax_totales.rates_ieps)[t]',
                                                                                                    details: Object.keys(obj_Json_Tax_totales.rates_ieps)[t]
                                                                                            });
                                                                                            log.audit({title: 'cadena_rate', details: cadena_rate});
                                                                                            if (Object.keys(obj_Json_Tax_totales.rates_ieps)[t] == cadena_rate) {
                                                                                                    var importe_obj = obj_Json_Tax_totales.rates_ieps[cadena_rate];
                                                                                                    log.audit({title: 'importe_obj', details: importe_obj});
                                                                                                    var base_ieps_total = obj_Json_Tax_totales.bases_ieps[rate_number];
                                                                                                    var obj_ieps_total_base = parseFloat(base_ieps_total) + parseFloat(base_imp);
                                                                                                    var obj_ieps_total = parseFloat(importe_obj) + parseFloat(tax_importe.toFixed(2));

                                                                                                    obj_Json_Tax_totales.rates_ieps[cadena_rate] = obj_ieps_total.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_ieps_data[rate_number] = obj_ieps_total.toFixed(2);
                                                                                                    obj_Json_Tax_totales.bases_ieps[rate_number] = obj_ieps_total_base;
                                                                                                    if (rate_div == 0.265) {
                                                                                                            log.audit({title: 'rate_div-entra1', details: rate_div});
                                                                                                            ieps_baseveintiseis = obj_ieps_total_base;
                                                                                                    }

                                                                                            } else {
                                                                                                    if (!obj_Json_Tax_totales.rates_ieps[cadena_rate]) {
                                                                                                            obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                                                                            obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                                                                            obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp;
                                                                                                            if (rate_div == 0.265) {
                                                                                                                    log.audit({title: 'rate_div-entra2', details: rate_div});
                                                                                                                    ieps_baseveintiseis = base_imp;
                                                                                                            }

                                                                                                    }
                                                                                            }
                                                                                    }
                                                                            } else {
                                                                                    obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                                                    obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                                                    obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp;
                                                                                    if (rate_div == 0.265) {
                                                                                            log.audit({title: 'rate_div-entra3', details: rate_div});
                                                                                            ieps_baseveintiseis = base_imp;
                                                                                    }

                                                                            }
                                                                            log.audit({title: 'obj_Json_Tax_totales_ieps', details: obj_Json_Tax_totales});
                                                                    }

                                                            }
                                                            log.audit({title: 'ieps_baseveintiseis_b', details: ieps_baseveintiseis});
                                                            log.audit({title: 'ieps_basedieciseis_b', details: ieps_basedieciseis});

                                                            //definir ivas

                                                            for (var iva = 0; iva < config_iva.length; iva++) {
                                                                    if (tax_id == config_iva[iva]) {
                                                                            log.audit({title: 'descuento_notaxieps linea: ' + i, details: descuento_notax});
                                                                            obj_Json_Tax.iva.rate = rate_number;
                                                                            obj_Json_Tax.iva.id = tax_id;
                                                                            obj_Json_Tax.iva.base = tax_base;
                                                                            obj_Json_Tax.iva.name = tax_name;
                                                                            log.audit({title: 'tiene_ieps iva', details: tiene_ieps});
                                                                            var importe_base_des = 0;
                                                                            if (tiene_ieps > 0) {
                                                                                    importe_base_des = importe_base;
                                                                                    importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                                                                    var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)
                                                                            } else {
                                                                                    var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100) + descuento_notax;
                                                                                    obj_Json_Tax.iva.descuento = (descuento_notax * (-1)).toFixed(2);
                                                                            }
                                                                            obj_Json_Tax.iva.base_importe = base_imp.toFixed(2);
                                                                            var base_calc = parseFloat(tax_base) / 100;
                                                                            var rate_div = rate_number / 100;
                                                                            obj_Json_Tax.iva.rate_div = rate_div;
                                                                            // var rate_div_f = rate_div.toFixed(2);
                                                                            // var importe_base_f = importe_base.toFixed(2);
                                                                            // var base_calc_f = base_calc.toFixed(2);
                                                                            if (tiene_ieps <= 0) {
                                                                                    var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base + descuento_notax)) * parseFloat(base_calc);
                                                                            } else {
                                                                                    log.audit({title: 'rate_div', details: rate_div});
                                                                                    log.audit({title: 'base_imp', details: base_imp});
                                                                                    log.audit({title: 'base_calc', details: base_calc});
                                                                                    var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                                                            }
                                                                            totalTraslados = totalTraslados + parseFloat(tax_importe.toFixed(2));
                                                                            log.audit({title: 'tax_importe_iva_nof', details: tax_importe});
                                                                            obj_Json_Tax.iva.importe = tax_importe.toFixed(2);
                                                                            //tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                            importe_iva = parseFloat(importe_iva) + parseFloat(tax_importe.toFixed(2));
                                                                            //suma para comparar diferencia de centavos
                                                                            if (tiene_ieps <= 0) {
                                                                                    var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                                                                    //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                            } else {
                                                                                    var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base_des)) * parseFloat(base_calc);
                                                                                    //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                            }
                                                                            suma_linea = suma_linea + parseFloat(tax_importe_sumas);
                                                                            if (descuento_notax == 0) {
                                                                                    suma_linea_tax = suma_linea_tax + parseFloat(tax_importe.toFixed(2));
                                                                            }
                                                                            suma_linea_tax_desc = suma_linea_tax_desc + parseFloat(tax_importe.toFixed(2));
                                                                            log.audit({title: 'suma_linea_iva', details: suma_linea});
                                                                            log.audit({title: 'tax_importe_iva', details: tax_importe});
                                                                            //

                                                                            var cadena = 'IVA ';
                                                                            var cadena_rate = cadena + rate_number + '%';
                                                                            log.audit({title: 'cadena_rate_iva', details: cadena_rate});
                                                                            var tam_rates_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;
                                                                            log.audit({title: 'base_imp', details: base_imp});
                                                                            if (tam_rates_iva > 0) {
                                                                                    for (var t = 0; t < tam_rates_iva; t++) {
                                                                                            if (Object.keys(obj_Json_Tax_totales.rates_iva)[t] == cadena_rate) {

                                                                                                    log.audit({title: 'tax_importe_ivif', details: tax_importe});
                                                                                                    var importe_obj = obj_Json_Tax_totales.rates_iva[cadena_rate];
                                                                                                    var base_iva_total = obj_Json_Tax_totales.bases_iva[rate_number];
                                                                                                    var obj_iva_total_base = parseFloat(base_iva_total) + parseFloat(base_imp);
                                                                                                    var obj_iva_total = parseFloat(importe_obj) + parseFloat(tax_importe.toFixed(2));


                                                                                                    obj_Json_Tax_totales.rates_iva[cadena_rate] = obj_iva_total.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_iva_data[rate_number] = obj_iva_total.toFixed(2);
                                                                                                    log.audit({
                                                                                                            title: 'obj_iva_total_base',
                                                                                                            details: obj_iva_total_base
                                                                                                    });
                                                                                                    obj_Json_Tax_totales.bases_iva[rate_number] = obj_iva_total_base || 0;
                                                                                                    if (rate_div == 0.16) {
                                                                                                            log.audit({title: 'rate_div-entra1', details: rate_div});
                                                                                                            ieps_basedieciseis = obj_iva_total_base;
                                                                                                    }
                                                                                                    log.audit({
                                                                                                            title: 'obj_Json_Tax_totales.bases_iva[rate_number]',
                                                                                                            details: obj_Json_Tax_totales.bases_iva[rate_number]
                                                                                                    });
                                                                                            } else {
                                                                                                    if (!obj_Json_Tax_totales.rates_iva[cadena_rate]) {
                                                                                                            log.audit({
                                                                                                                    title: 'tax_importe_iv0_else',
                                                                                                                    details: tax_importe
                                                                                                            });
                                                                                                            obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                                                                                            obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                                                                                            log.audit({title: 'base_imp_else', details: base_imp});
                                                                                                            obj_Json_Tax_totales.bases_iva[rate_number] = base_imp || '0.00';
                                                                                                            if (rate_div == 0.16) {
                                                                                                                    log.audit({title: 'rate_div-entra2', details: rate_div});
                                                                                                                    ieps_basedieciseis = base_imp;
                                                                                                            }
                                                                                                            log.audit({
                                                                                                                    title: 'obj_Json_Tax_totales.bases_iva[rate_number]',
                                                                                                                    details: obj_Json_Tax_totales.bases_iva[rate_number]
                                                                                                            });
                                                                                                    }

                                                                                            }
                                                                                    }
                                                                            } else {
                                                                                    obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                                                                    log.audit({title: 'tax_importe_iv0', details: tax_importe});
                                                                                    obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                                                                    log.audit({title: 'base_imp_else2', details: base_imp});
                                                                                    obj_Json_Tax_totales.bases_iva[rate_number] = base_imp || '0.00';
                                                                                    if (rate_div == 0.16) {
                                                                                            log.audit({title: 'rate_div-entra3', details: rate_div});
                                                                                            ieps_basedieciseis = base_imp;
                                                                                    }
                                                                                    log.audit({
                                                                                            title: 'obj_Json_Tax_totales.bases_iva[rate_number]',
                                                                                            details: obj_Json_Tax_totales.bases_iva[rate_number]
                                                                                    });
                                                                            }
                                                                            log.audit({title: 'obj_Json_Tax_totales_iva', details: obj_Json_Tax_totales});
                                                                    }

                                                            }

                                                            //definir exentos

                                                            for (var ex = 0; ex < config_exento.length; ex++) {
                                                                    if (tax_id == config_exento[ex]) {
                                                                            obj_Json_Tax.exento.rate = rate_number;
                                                                            obj_Json_Tax.exento.id = tax_id;
                                                                            obj_Json_Tax.exento.base = tax_base;
                                                                            obj_Json_Tax.exento.name = tax_name;
                                                                            log.audit({title: 'tiene_ieps', details: tiene_ieps});
                                                                            var importe_base_des = 0;
                                                                            if (tiene_ieps > 0) {
                                                                                    importe_base_des = importe_base;
                                                                                    importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                                                                    var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)
                                                                            } else {
                                                                                    var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100) + descuento_notax;
                                                                                    obj_Json_Tax.exento.descuento = (descuento_notax * (-1)).toFixed(2);
                                                                            }
                                                                            obj_Json_Tax.exento.base_importe = base_imp.toFixed(2);
                                                                            var base_calc = parseFloat(tax_base) / 100;
                                                                            var rate_div = rate_number / 100;
                                                                            obj_Json_Tax.exento.rate_div = rate_div;
                                                                            // var rate_div_f = rate_div.toFixed(2);
                                                                            // var importe_base_f = importe_base.toFixed(2);
                                                                            // var base_calc_f = base_calc.toFixed(2);
                                                                            if (tiene_ieps <= 0) {
                                                                                    var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base + descuento_notax)) * parseFloat(base_calc);
                                                                            } else {
                                                                                    log.audit({title: 'rate_div', details: rate_div});
                                                                                    log.audit({title: 'base_imp', details: base_imp});
                                                                                    log.audit({title: 'base_calc', details: base_calc});
                                                                                    var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                                                            }
                                                                            log.audit({title: 'tax_importe_ex_nof', details: tax_importe});
                                                                            obj_Json_Tax.exento.importe = tax_importe.toFixed(2);
                                                                            //tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                            importe_exento = parseFloat(importe_exento) + parseFloat(tax_importe);
                                                                            //suma para comparar diferencia de centavos
                                                                            if (tiene_ieps <= 0) {
                                                                                    var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                                                                    //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                            } else {
                                                                                    var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base_des)) * parseFloat(base_calc);
                                                                                    //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                            }
                                                                            suma_linea = suma_linea + parseFloat(tax_importe_sumas);
                                                                            if (descuento_notax == 0) {
                                                                                    suma_linea_tax = suma_linea_tax + parseFloat(tax_importe.toFixed(2));
                                                                            }
                                                                            suma_linea_tax_desc = suma_linea_tax_desc + parseFloat(tax_importe.toFixed(2));
                                                                            log.audit({title: 'suma_linea_ex', details: suma_linea});
                                                                            log.audit({title: 'tax_importe_ex', details: tax_importe});
                                                                            //

                                                                            var cadena = 'EXENTO ';
                                                                            var cadena_rate = cadena + rate_number + '%';
                                                                            log.audit({title: 'cadena_rate_ex', details: cadena_rate});
                                                                            var tam_rates_ex = Object.keys(obj_Json_Tax_totales.rates_exento).length;
                                                                            log.audit({title: 'base_imp', details: base_imp});
                                                                            if (tam_rates_ex > 0) {
                                                                                    for (var t = 0; t < tam_rates_ex; t++) {
                                                                                            if (Object.keys(obj_Json_Tax_totales.rates_exento)[t] == cadena_rate) {

                                                                                                    log.audit({title: 'tax_importe_ivif', details: tax_importe});
                                                                                                    var importe_obj = obj_Json_Tax_totales.rates_exento[cadena_rate];
                                                                                                    var base_ex_total = obj_Json_Tax_totales.bases_exento[rate_number];
                                                                                                    var obj_ex_total_base = parseFloat(base_ex_total) + parseFloat(base_imp);
                                                                                                    var obj_ex_total = parseFloat(importe_obj) + parseFloat(tax_importe);

                                                                                                    obj_Json_Tax_totales.rates_exento[cadena_rate] = obj_ex_total.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_exento_data[rate_number] = obj_ex_total.toFixed(2);
                                                                                                    log.audit({title: 'obj_ex_total_base', details: obj_ex_total_base});
                                                                                                    obj_Json_Tax_totales.bases_exento[rate_number] = obj_ex_total_base.toFixed(2) || 0;
                                                                                                    log.audit({
                                                                                                            title: 'obj_Json_Tax_totales.bases_exento[rate_number]',
                                                                                                            details: obj_Json_Tax_totales.bases_exento[rate_number]
                                                                                                    });
                                                                                            } else {
                                                                                                    if (!obj_Json_Tax_totales.rates_exento[cadena_rate]) {
                                                                                                            log.audit({
                                                                                                                    title: 'tax_importe_iv0_else',
                                                                                                                    details: tax_importe
                                                                                                            });
                                                                                                            obj_Json_Tax_totales.rates_exento[cadena_rate] = tax_importe.toFixed(2);
                                                                                                            obj_Json_Tax_totales.rates_exento_data[rate_number] = tax_importe.toFixed(2);
                                                                                                            log.audit({title: 'base_imp_else', details: base_imp});
                                                                                                            obj_Json_Tax_totales.bases_exento[rate_number] = base_imp.toFixed(2) || '0.00';
                                                                                                            log.audit({
                                                                                                                    title: 'obj_Json_Tax_totales.bases_exento[rate_number]',
                                                                                                                    details: obj_Json_Tax_totales.bases_exento[rate_number]
                                                                                                            });
                                                                                                    }

                                                                                            }
                                                                                    }
                                                                            } else {
                                                                                    obj_Json_Tax_totales.rates_exento[cadena_rate] = tax_importe.toFixed(2);
                                                                                    log.audit({title: 'tax_importe_iv0', details: tax_importe});
                                                                                    obj_Json_Tax_totales.rates_exento_data[rate_number] = tax_importe.toFixed(2);
                                                                                    log.audit({title: 'base_imp_else2', details: base_imp});
                                                                                    obj_Json_Tax_totales.bases_exento[rate_number] = base_imp.toFixed(2) || '0.00';
                                                                                    log.audit({
                                                                                            title: 'obj_Json_Tax_totales.bases_exento[rate_number]',
                                                                                            details: obj_Json_Tax_totales.bases_exento[rate_number]
                                                                                    });
                                                                            }
                                                                            log.audit({
                                                                                    title: 'obj_Json_Tax_totales_exento',
                                                                                    details: obj_Json_Tax_totales
                                                                            });
                                                                    }

                                                            }

                                                            contadorLineas++;
                                                    }
                                                    impuestosCalculados = impuestosCalculados + parseFloat(suma_linea_tax);

                                                    if (descuento_notax == 0) {
                                                            obj_Json_Tax.impuestoLineaCalculados = suma_linea_tax.toFixed(2);
                                                    } else {
                                                            obj_Json_Tax.impuestoLineaCalculados = suma_linea_tax_desc.toFixed(2);
                                                    }
                                                    //termina el recorrido por codigo de impuesto

                                                    /*log.audit({title: 'total_linea', details: total_linea});
                                                    log.audit({title: 'suma_linea', details: suma_linea});
                                                    log.audit({title: 'suma_linea_tax', details: suma_linea_tax});
                                                    log.audit({title: 'suma_linea_tax_desc', details: suma_linea_tax_desc});
                                                    suma_linea = suma_linea.toFixed(2);
                                                    suma_linea_tax = suma_linea_tax.toFixed(2);
                                                    log.audit({title: 'suma_linea', details: suma_linea});
                                                    log.audit({title: 'suma_linea_tax', details: suma_linea_tax});

                                                    var descuentodif = 0;
                                                    log.audit({title: 'impuesto_descuento', details: impuesto_descuento});*/
                                                    /*if (impuesto_descuento) {

                                                        if (suma_linea_tax_desc != impuesto_descuento) {
                                                            impuesto_descuento = impuesto_descuento * (-1);
                                                            var sumal_impuestos = parseFloat(suma_linea) - parseFloat(impuesto_descuento);
                                                            descuentodif = sumal_impuestos - suma_linea_tax_desc;
                                                            log.audit({title: 'descuentodif', details: descuentodif});
                                                        }
                                                    }*/
                                                    //se calcula la diferencia de centavos, haciendo operacion de la sumatoria de los impuestos
                                                    //calculados por linea contra el valor de impuestos de la linea en el sistema
                                                    /*var diferencia_centavos = (parseFloat(total_linea) - parseFloat(suma_linea));
                                                    if (suma_linea_tax != 0) {
                                                        if (suma_linea != suma_linea_tax) {
                                                            var dif_sums = suma_linea - suma_linea_tax;
                                                            diferencia_centavos = diferencia_centavos + dif_sums;
                                                        }
                                                    }

                                                    if (descuentodif && diferencia_centavos == 0) {
                                                        diferencia_centavos = descuentodif;
                                                    }


                                                    diferencia_centavos = diferencia_centavos.toFixed(2);
                                                    diferencia_centavos = parseFloat(diferencia_centavos);

                                                    if (diferencia_centavos < 0) {
                                                        diferencia_centavos = diferencia_centavos * (1);
                                                    }

                                                    if (diferencia_centavos > 0) {
                                                        diferencia_centavos = diferencia_centavos * (1);
                                                    }


                                                    log.audit({title: 'diferencia_centavos', details: diferencia_centavos});
                                                    log.audit({title: 'importe_retencion', details: importe_retencion});
                                                    log.audit({title: 'importe_iva', details: importe_iva});
                                                    log.audit({title: 'importe_local', details: importe_local});
                                                    log.audit({title: 'importe_ieps', details: importe_ieps});
                                                    importe_ieps = importe_ieps.toFixed(2);
                                                    importe_ieps = parseFloat(importe_ieps);
                                                    log.audit({title: 'importe_exento', details: importe_exento});
                                                    var obj_centavos = {
                                                        diferencia:''
                                                    }

                                                    obj_centavos.diferencia = diferencia_centavos;
                                                    obj_diferencias[i] = obj_centavos;*/


                                                    //se guarda el json en la linea de articulos
                                                    record_now.setSublistValue({
                                                            sublistId: 'item',
                                                            fieldId: 'custcol_efx_fe_tax_json',
                                                            line: i,
                                                            value: JSON.stringify(obj_Json_Tax),
                                                    });
                                                    log.audit({title: 'fin linea', details: i});
                                            }

                                            obj_Json_Tax_totales.subtotal = subtotalTransaccion.toFixed(2);
                                            var desctraslados =0;
                                            var descret =0;
                                            var descivatot =0;
                                            var desciepstot =0;
                                            if(descuentoglobal){
                                                    // desctraslados = totalTraslados*rate_desccabecera;
                                                    // descret = totalRetenciones*rate_desccabecera;
                                                    // descivatot = importe_iva*rate_desccabecera;
                                                    // desciepstot = importe_ieps*rate_desccabecera;
                                                    obj_Json_Tax_totales.total = (subtotalTransaccion + parseFloat(totalTraslados - totalRetenciones)  - parseFloat(descuentoglobal) - parseFloat(desctraslados) - parseFloat(descret)).toFixed(2);
                                                    obj_Json_Tax_totales.descuentoConImpuesto = parseFloat(descuentoglobal).toFixed(2);
                                                    obj_Json_Tax_totales.descuentoSinImpuesto = parseFloat(descuentoglobal).toFixed(2);
                                            }else{
                                                    obj_Json_Tax_totales.total = (subtotalTransaccion + parseFloat(totalTraslados - totalRetenciones) - parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto)).toFixed(2);
                                            }



                                            obj_Json_Tax_totales.totalImpuestos = parseFloat(totalTraslados - totalRetenciones - desctraslados-descret).toFixed(2);
                                            obj_Json_Tax_totales.totalTraslados = (totalTraslados-desctraslados).toFixed(2);
                                            obj_Json_Tax_totales.totalRetenciones = (totalRetenciones-descret).toFixed(2);

                                            log.audit({title: 'obj_diferencias', details: obj_diferencias});
                                            log.audit({title: 'importe_retencion', details: importe_retencion});
                                            log.audit({title: 'importe_iva', details: importe_iva.toFixed(2)});
                                            log.audit({title: 'importe_exento', details: importe_exento.toFixed(2)});
                                            log.audit({title: 'importe_ieps', details: importe_ieps});
                                            log.audit({title: 'importe_local', details: importe_local});


                                            log.audit({title: 'record_now.id', details: record_now.id});
                                            log.audit({title: 'record_now.type', details: record_now.type});


                                            //se llena el objeto con los totales de impuestos por tipo
                                            obj_Json_Tax_totales.retencion_total = parseFloat(importe_retencion-descret).toFixed(2) || '0.00';
                                            obj_Json_Tax_totales.iva_total = parseFloat(importe_iva-descivatot).toFixed(2) || '0.00';
                                            obj_Json_Tax_totales.exento_total = parseFloat(importe_exento).toFixed(2) || '0.00';
                                            obj_Json_Tax_totales.ieps_total = parseFloat(importe_ieps-desciepstot).toFixed(2) || '0.00';
                                            obj_Json_Tax_totales.local_total = parseFloat(importe_local).toFixed(2) || '0.00';


                                            //validar que la suma de desglose coincida con el total
                                            log.audit({title: 'objivas', details: Object.keys(obj_Json_Tax_totales.rates_iva)});
                                            log.audit({title: 'objivas', details: Object.keys(obj_Json_Tax_totales.rates_iva_data)});

                                            log.audit({title: 'obj_Json_Tax_totales', details: obj_Json_Tax_totales});
                                            log.audit({title: 'obj_Json_Tax_totales.total', details: obj_Json_Tax_totales.total});
                                            log.audit({title: 'totalTran', details: totalTran});
                                            var diferenciaTotales = (parseFloat(obj_Json_Tax_totales.total) - totalTran).toFixed(2);
                                            log.audit({title: 'diferenciaTotales', details: diferenciaTotales});
                                            record_now.setValue({
                                                    fieldId: 'custbody_efx_fe_diftimbrado',
                                                    value: parseFloat(diferenciaTotales),
                                                    ignoreFieldChange: true
                                            });


                                            obj_Json_Tax_totales.diferenciaTotales = diferenciaTotales;



                                            var tam_obj_ieps = Object.keys(obj_Json_Tax_totales.bases_ieps).length;
                                            var tam_obj_iva = Object.keys(obj_Json_Tax_totales.bases_iva).length;
                                            var tam_obj_ret = Object.keys(obj_Json_Tax_totales.bases_retencion).length;
                                            var tam_obj_local = Object.keys(obj_Json_Tax_totales.bases_local).length;

                                            var totalTraslados_gbl = 0;
                                            var totalRetenciones_gbl = 0;
                                            var totalImpuestos_gbl = 0;
                                            var ieps_total_gbl = 0;
                                            var iva_total_gbl = 0;
                                            var retencion_total_gbl = 0;
                                            var local_total_gbl = 0;


                                            for (var iep = 0; iep < tam_obj_ieps; iep++) {
                                                    obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]] = parseFloat(obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]]).toFixed(2);

                                                    var rate_gbl = parseFloat(Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]);
                                                    var rate_gblB = rate_gbl / 100;
                                                    var monto_gbl = parseFloat(obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]]);
                                                    obj_Json_Tax_totales.monto_ieps_gbl[Object.keys(obj_Json_Tax_totales.bases_ieps)[iep]] = (monto_gbl * rate_gblB).toFixed(2);
                                                    var totImpu = parseFloat((monto_gbl * rate_gblB).toFixed(2));
                                                    totalImpuestos_gbl = totalImpuestos_gbl + totImpu;
                                                    totalTraslados_gbl = totalTraslados_gbl + totImpu;
                                                    ieps_total_gbl = ieps_total_gbl + totImpu;

                                            }
                                            for (var iv = 0; iv < tam_obj_iva; iv++) {
                                                    obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]] = parseFloat(obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]]).toFixed(2);

                                                    var rate_gbl = parseFloat(Object.keys(obj_Json_Tax_totales.bases_iva)[iv]);
                                                    var rate_gblB = rate_gbl / 100;
                                                    var monto_gbl = parseFloat(obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]]);
                                                    obj_Json_Tax_totales.monto_iva_gbl[Object.keys(obj_Json_Tax_totales.bases_iva)[iv]] = (monto_gbl * rate_gblB).toFixed(2);
                                                    var totImpu = parseFloat((monto_gbl * rate_gblB).toFixed(2));
                                                    totalImpuestos_gbl = totalImpuestos_gbl + totImpu;
                                                    totalTraslados_gbl = totalTraslados_gbl + totImpu;
                                                    iva_total_gbl = iva_total_gbl + totImpu;
                                            }
                                            for (var loc = 0; loc < tam_obj_local; loc++) {
                                                    obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]] = parseFloat(obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]]).toFixed(2);

                                                    var rate_gbl = parseFloat(Object.keys(obj_Json_Tax_totales.bases_local)[loc]);
                                                    var rate_gblB = rate_gbl / 100;
                                                    var monto_gbl = parseFloat(obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]]);
                                                    obj_Json_Tax_totales.monto_local_gbl[Object.keys(obj_Json_Tax_totales.bases_local)[loc]] = (monto_gbl * rate_gblB).toFixed(2);
                                                    var totImpu = parseFloat((monto_gbl * rate_gblB).toFixed(2));
                                                    totalImpuestos_gbl = totalImpuestos_gbl + totImpu;
                                                    totalTraslados_gbl = totalTraslados_gbl + totImpu;
                                                    local_total_gbl = local_total_gbl + totImpu;
                                            }
                                            for (var ret = 0; ret < tam_obj_ret; ret++) {
                                                    obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]] = parseFloat(obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]]).toFixed(2);

                                                    var rate_gbl = parseFloat(Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]);
                                                    var rate_gblB = rate_gbl / 100;
                                                    var monto_gbl = parseFloat(obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]]);
                                                    obj_Json_Tax_totales.monto_ret_gbl[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]] = (monto_gbl * rate_gblB).toFixed(2);
                                                    var totImpu = parseFloat((monto_gbl * rate_gblB).toFixed(2)) * (-1);
                                                    totalImpuestos_gbl = totalImpuestos_gbl + totImpu;
                                                    totalRetenciones_gbl = totalRetenciones_gbl + totImpu;
                                                    retencion_total_gbl = retencion_total_gbl + totImpu;
                                            }

                                            obj_Json_Tax_totales.totalImpuestos_gbl = totalImpuestos_gbl.toFixed(2);
                                            obj_Json_Tax_totales.subtotal_gbl = subtotalTransaccion.toFixed(2);
                                            obj_Json_Tax_totales.total_gbl = (subtotalTransaccion + totalImpuestos_gbl + parseFloat(obj_Json_Tax_totales.descuentoConImpuesto)).toFixed(2);
                                            obj_Json_Tax_totales.totalTraslados_gbl = totalTraslados_gbl.toFixed(2);
                                            obj_Json_Tax_totales.totalRetenciones_gbl = totalRetenciones_gbl.toFixed(2);
                                            obj_Json_Tax_totales.ieps_total_gbl = ieps_total_gbl.toFixed(2);
                                            obj_Json_Tax_totales.iva_total_gbl = iva_total_gbl.toFixed(2);
                                            obj_Json_Tax_totales.retencion_total_gbl = retencion_total_gbl.toFixed(2);
                                            obj_Json_Tax_totales.local_total_gbl = local_total_gbl.toFixed(2);


                                            record_now.setValue({
                                                    fieldId: 'custbody_efx_fe_tax_json',
                                                    value: JSON.stringify(obj_Json_Tax_totales),
                                                    ignoreFieldChange: true
                                            });


                                            record_now.save({enableSourcing: true, ignoreMandatoryFields: true});


                                    }

                            }catch (error) {
                                    log.audit({title:'error',details:error});
                                    var recordobj = record.load({
                                            type: trantype,
                                            id: tranid
                                    });
                                    recordobj.setValue({
                                            fieldId: 'custbody_efx_fe_tax_json',
                                            value: JSON.stringify(obj_Json_Tax_totales),
                                            ignoreFieldChange: true
                                    });
                                    recordobj.save({enableSourcing:true, ignoreMandatoryFields:true});
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

            function obtenObjImpuesto(){
                    var objcodigosMainFull = {};
                    var objcodigosMain = {};
                    var objcodigosMainCodes = {};
                    var arrayobjcodigos = new Array();

                    //busca grupos de impuestos
                    var taxgroupSearchObj = search.create({
                            type: search.Type.TAX_GROUP,
                            filters:
                                [["isinactive",search.Operator.IS,"F"]],
                            columns:
                                [
                                        search.createColumn({name: "itemid",}),
                                        search.createColumn({name: "rate", label: "Tasa"}),
                                        search.createColumn({name: "country", label: "País"}),
                                        search.createColumn({name: "internalid", label: "ID interno"})
                                ]
                    });
                    var ejecutar = taxgroupSearchObj.run();
                    var resultado = ejecutar.getRange(0, 900);

                    for(var i=0;i<resultado.length;i++){
                            var tax_code = resultado[i].getValue({name: "internalid"});

                            var info_tax_rec = record.load({
                                    type: record.Type.TAX_GROUP,
                                    id: tax_code,
                                    isDynamic: true
                            });
                            objcodigosMain[tax_code] = new Array();

                            var tax_lines_count = info_tax_rec.getLineCount({sublistId: 'taxitem'});
                                    for(var x=0;x<tax_lines_count;x++) {
                                            var objcodigos={
                                                    taxname2:'',
                                                    taxname:'',
                                                    rate:'',
                                                    basis:'',
                                                    taxtype:'',
                                            }
                                            objcodigos.taxname2 = info_tax_rec.getSublistValue({
                                                    sublistId: 'taxitem',
                                                    fieldId: 'taxname2',
                                                    line: x
                                            });
                                            objcodigos.taxname = info_tax_rec.getSublistValue({
                                                    sublistId: 'taxitem',
                                                    fieldId: 'taxname',
                                                    line: x
                                            });
                                            objcodigos.rate = info_tax_rec.getSublistValue({
                                                    sublistId: 'taxitem',
                                                    fieldId: 'rate',
                                                    line: x
                                            });
                                            objcodigos.basis = info_tax_rec.getSublistValue({
                                                    sublistId: 'taxitem',
                                                    fieldId: 'basis',
                                                    line: x
                                            });
                                            objcodigos.taxtype = info_tax_rec.getSublistValue({
                                                    sublistId: 'taxitem',
                                                    fieldId: 'taxtype',
                                                    line: x
                                            });
                                            objcodigosMain[tax_code].push(objcodigos);
                                    }
                    }


                    //busca codigos de impuestos

                    var salestaxitemSearchObj = search.create({
                            type: search.Type.SALES_TAX_ITEM,
                            filters: [["isinactive",search.Operator.IS,"F"]],
                            columns: [
                                        search.createColumn({name: "name",}),
                                        search.createColumn({name: "itemid", label: "ID de artículo"}),
                                        search.createColumn({name: "rate", label: "Tasa"}),
                                        search.createColumn({name: "country", label: "País"}),
                                        search.createColumn({name: "custrecord_4110_category", label: "Categoría"}),
                                        search.createColumn({name: "internalid", label: "ID interno"})
                                ]
                    });

                    var ejecutar = salestaxitemSearchObj.run();
                    var resultado = ejecutar.getRange(0, 900);


                    objcodigosMainCodes.codigos = new Array();
                    for(i=0;i<resultado.length;i++){

                            var tax_code = resultado[i].getValue({name: "internalid"});

                            var info_tax_rec = record.load({
                                    type: record.Type.SALES_TAX_ITEM,
                                    id: tax_code,
                                    isDynamic: true
                            });
                            objcodigosMainCodes[tax_code] = new Array();

                            var objcodigos={
                                    itemid:'',
                                    id:'',
                                    rate:'',
                                    basis:'100',
                                    taxtype:'',
                            }

                            objcodigos.itemid = info_tax_rec.getValue({
                                    fieldId: 'itemid',
                            });
                            objcodigos.id = info_tax_rec.getValue({
                                    fieldId: 'id',
                            });
                            objcodigos.rate = info_tax_rec.getValue({
                                    fieldId: 'rate',
                            });
                            objcodigos.basis = '100';

                            objcodigos.taxtype = info_tax_rec.getText({
                                    fieldId: 'taxtype',
                            });
                            objcodigosMainCodes[tax_code].push(objcodigos);

                    }

                    objcodigosMainFull.TaxGroup = objcodigosMain;
                    objcodigosMainFull.TaxCodes = objcodigosMainCodes;

                    log.audit({title:'objcodigosMainFull',details:objcodigosMainFull});

                    return objcodigosMainFull;

            }


            return {getInputData, map, reduce, summarize}

    });
