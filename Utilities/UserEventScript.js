/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record','N/search'],
    /**
     * @param{record} record
     */
    function(record,search) {

            /**
             * Function definition to be triggered before record is loaded.
             *
             * @param {Object} scriptContext
             * @param {Record} scriptContext.newRecord - New record
             * @param {Record} scriptContext.oldRecord - Old record
             * @param {string} scriptContext.type - Trigger type
             * @Since 2015.2
             */
            function beforeSubmit(context) {
                    var obj_Json_Tax_totales = new Object();

                    //objeto de totales de impuestos(cabecera)
                    obj_Json_Tax_totales = {
                            ieps_total: 0,
                            iva_total: 0,
                            retencion_total: 0,
                            local_total: 0,
                            exento_total: 0,
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
                            descuentoConImpuesto:0,
                            descuentoSinImpuesto:0
                    }
                    var record_now = context.newRecord;
                    var recType = record_now.type;
                    var line_count_expense = record_now.getLineCount({sublistId: 'expense'});
                    try {

                            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                                    var obj_Json_Tax = new Object();

                                    //busqueda de configuración de impuestos
                                    var desglose_config = search.create({
                                            type: 'customrecord_efx_fe_desglose_tax',
                                            filters: ['isinactive',search.Operator.IS,'F'],
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

                                    log.audit({title:'config_ieps',details:config_ieps});
                                    log.audit({title:'config_retencion',details:config_retencion});
                                    log.audit({title:'config_local',details:config_local});
                                    log.audit({title:'config_iva',details:config_iva});

                                    var importe_retencion = 0;
                                    var importe_iva = 0;
                                    var importe_exento = 0;
                                    var importe_ieps = 0;
                                    var importe_ieps_nf = 0;
                                    var importe_local = 0;
                                    var line_count = record_now.getLineCount({sublistId: 'item'});
                                    //recorrido de linea de articulos
                                    for (var i = 0; i < line_count; i++) {
                                            log.audit({title:'inicio linea',details:i});
                                            //objeto de tipos de impuesto por linea
                                            obj_Json_Tax = {
                                                    ieps: {
                                                            name: "",
                                                            id: "",
                                                            factor:"003",
                                                            rate: 0,
                                                            base: 0,
                                                            base_importe: 0,
                                                            importe: '',
                                                            rate_div:0,
                                                            descuento:0
                                                    },
                                                    locales: {
                                                            name: "",
                                                            id: "",
                                                            factor:"002",
                                                            rate: 0,
                                                            base: 0,
                                                            base_importe: 0,
                                                            importe: '',
                                                            rate_div:0,
                                                            descuento:0
                                                    },
                                                    retenciones: {
                                                            name: "",
                                                            id: "",
                                                            factor:"002",
                                                            rate: 0,
                                                            base: 0,
                                                            base_importe: 0,
                                                            importe: '',
                                                            rate_div:0,
                                                            descuento:0
                                                    },
                                                    iva: {
                                                            name: "",
                                                            id: "",
                                                            factor:"002",
                                                            rate: 0,
                                                            base: 0,
                                                            base_importe: 0,
                                                            importe: '',
                                                            rate_div:0,
                                                            descuento:0
                                                    },
                                                    exento: {
                                                            name: "",
                                                            id: "",
                                                            factor:"002",
                                                            rate: 0,
                                                            base: 0,
                                                            base_importe: 0,
                                                            importe: '',
                                                            rate_div:0,
                                                            descuento:0
                                                    },
                                                    descuentoConImpuesto:0,
                                                    descuentoSinImpuesto:0
                                            }
                                            //validacion si existe alguna linea de descuento (la linea de descuento es la siguiente a la de
                                            // articulo)
                                            var descuento_linea = 0;
                                            var descuento_linea_sin = 0;
                                            var tipo_articulo = record_now.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i});
                                            log.audit({title:'tipo_articulo',details:tipo_articulo});
                                            if(tipo_articulo=='Discount'){
                                                    continue;
                                            }
                                            var descuento_notax =0;
                                            if(i<(line_count-1)){
                                                    var tipo_articulo = record_now.getSublistValue({sublistId: 'item', fieldId: 'itemtype', line: i+1});
                                                    if(tipo_articulo=='Discount') {
                                                            var linea_descuentos_monto = record_now.getSublistValue({
                                                                    sublistId: 'item',
                                                                    fieldId: 'grossamt',
                                                                    line: i + 1
                                                            });

                                                            descuento_notax = record_now.getSublistValue({
                                                                    sublistId: 'item',
                                                                    fieldId: 'amount',
                                                                    line: i + 1
                                                            });
                                                            descuento_linea = linea_descuentos_monto*(-1);
                                                            descuento_linea_sin = descuento_notax*(-1);
                                                            obj_Json_Tax_totales.descuentoConImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoConImpuesto)+descuento_linea).toFixed(2);
                                                            obj_Json_Tax_totales.descuentoSinImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto)+descuento_linea_sin).toFixed(2);
                                                            //almacena el impuesto con y sin impuesto en atributos del objeto de la linea de impuestos
                                                            obj_Json_Tax.descuentoConImpuesto = descuento_linea.toFixed(2);
                                                            obj_Json_Tax.descuentoSinImpuesto = descuento_linea_sin.toFixed(2);
                                                    }
                                                    //se obtiene el descuento en una variable para usarlo posteriormente
                                            }

                                            //obtiene información de campos de la linea
                                            var tax_code = record_now.getSublistValue({sublistId: 'item', fieldId: 'taxcode', line: i});
                                            var importe_base = record_now.getSublistValue({sublistId: 'item', fieldId: 'amount', line: i});
                                            //obtiene monto de impuesto en linea
                                            var total_linea = parseFloat(record_now.getSublistValue({sublistId: 'item', fieldId: 'tax1amt', line: i}));

                                            var suma_linea = 0;
                                            var suma_linea_tax = 0;

                                            var grupo_impuestos = true;
                                            //Diferencia si se utiliza codigo o grupo de impuestos
                                            try{
                                                    var info_tax_rec = record.load({
                                                            type: record.Type.TAX_GROUP,
                                                            id: tax_code,
                                                            isDynamic: true
                                                    });

                                                    var tax_lines_count = info_tax_rec.getLineCount({sublistId: 'taxitem'});
                                                    log.audit({title:'tax_lines_count',details:tax_lines_count});
                                                    grupo_impuestos=true;

                                            }catch(error_grup){
                                                    var info_tax_rec = record.load({
                                                            type: record.Type.SALES_TAX_ITEM,
                                                            id: tax_code,
                                                            isDynamic: true
                                                    });

                                                    var tax_lines_count = 1;
                                                    log.audit({title:'tax_lines_count',details:tax_lines_count});

                                                    grupo_impuestos=false;
                                            }

                                            var contadorLineas = 0;
                                            var tiene_ieps = 0;

                                            //recorrido de los diferentes impuestos que conforman la linea de articulos
                                            for (var x = 0; x < tax_lines_count; x++) {
                                                    //lee campos dependiendo si es grupo o codigo de impuestos
                                                    if(grupo_impuestos) {
                                                            var tax_name = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'taxname2',
                                                                    line: x
                                                            });
                                                            var tax_id = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'taxname',
                                                                    line: x
                                                            });
                                                            var tax_rate = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'rate',
                                                                    line: x
                                                            });
                                                            var tax_base = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'basis',
                                                                    line: x
                                                            });
                                                            var tax_tipo = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'taxtype',
                                                                    line: x
                                                            });
                                                    }else{
                                                            var tax_name = info_tax_rec.getValue({
                                                                    fieldId: 'itemid',
                                                            });
                                                            var tax_id = info_tax_rec.getValue({
                                                                    fieldId: 'id',
                                                            });
                                                            var tax_rate = info_tax_rec.getValue({
                                                                    fieldId: 'rate',
                                                            });
                                                            var tax_base = '100';

                                                            var tax_tipo = info_tax_rec.getText({
                                                                    fieldId: 'taxtype',
                                                            });
                                                    }

                                                    log.audit({title:'tax_rate',details:tax_rate});
                                                    //var rate_replace = tax_rate.replace("%", "");
                                                    var rate_number = parseFloat(tax_rate);

                                                    //En los siguientes for se almacenan dentro del objeto la informacion de impuestos dentro
                                                    // de cada atributo por tipo de impuesto

                                                    //definir retenciones
                                                    for(var ret =0; ret<config_retencion.length;ret++){
                                                            //se compara el codigo de impuesto de la linea con el de la configuración de retenciones
                                                            if(tax_id==config_retencion[ret]){
                                                                    //almacena la información del codigo de impuesto
                                                                    obj_Json_Tax.retenciones.rate = rate_number * (-1);
                                                                    obj_Json_Tax.retenciones.id = tax_id;
                                                                    obj_Json_Tax.retenciones.base = tax_base;
                                                                    obj_Json_Tax.retenciones.name = tax_name;
                                                                    //calcula el importe base con la base del impuesto y el importe de la linea
                                                                    // monto de la linea (amount) por la base de impuesto entre 100
                                                                    var base_imp = (parseFloat(importe_base)*parseFloat(tax_base))/100;
                                                                    obj_Json_Tax.retenciones.base_importe = base_imp.toFixed(2);
                                                                    //se multiplica el rate number por -1 porque el impuesto de retencion se configura
                                                                    //en negativo la base
                                                                    var rate_num = rate_number * (-1);
                                                                    //se obtiene la base en decimales
                                                                    var base_calc= parseFloat(tax_base)/100;
                                                                    //se obtiene el rate del impuesto en decimales
                                                                    var rate_div = rate_num / 100;
                                                                    obj_Json_Tax.retenciones.rate_div = rate_div;

                                                                    //el importe de impuesto se obtiene multiplicando el rate de impuesto en decimales
                                                                    //por el importe por la base
                                                                    var tax_importe = (rate_div * parseFloat(importe_base))*base_calc;

                                                                    //se pone a 2 decimales el importe de impuesto
                                                                    obj_Json_Tax.retenciones.importe = tax_importe.toFixed(2);
                                                                    tax_importe = parseFloat(tax_importe.toFixed(2));

                                                                    //sumatoria de las retenciones para obtener total de retenciones
                                                                    importe_retencion = parseFloat(importe_retencion) + parseFloat(tax_importe);
                                                                    //suma para comparar diferencia de centavos, se suman todos los impuestos de este tipo
                                                                    suma_linea = suma_linea-parseFloat(tax_importe);
                                                                    if(descuento_notax==0){
                                                                            suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                                                    }

                                                                    //se genera descripcion por tipo de impuesto y porcentaje
                                                                    var cadena = 'Retencion ';
                                                                    var cadena_rate = cadena+rate_num+'%';
                                                                    //se obtiene numero de atributos dentro del objeto de totales en retenciones
                                                                    var tam_rates_ret = Object.keys(obj_Json_Tax_totales.rates_retencion).length;

                                                                    //solo se ejecuta si ya existe un atributo
                                                                    if(tam_rates_ret>0){
                                                                            //recorrido de atributos de objeto de totales
                                                                            for(var t=0;t<tam_rates_ret;t++){
                                                                                    //compara el rate dentro del objeto con el de la linea
                                                                                    if(Object.keys(obj_Json_Tax_totales.rates_retencion)[t]==cadena_rate){
                                                                                            //obtiene los datos ya existentes en el atributo
                                                                                            var importe_obj = obj_Json_Tax_totales.rates_retencion[cadena_rate];
                                                                                            var base_ret_total = obj_Json_Tax_totales.bases_retencion[rate_num];
                                                                                            //hace sumatoria con los datos existentes en la linea y con los del atributo
                                                                                            var obj_ret_total_base = parseFloat(base_ret_total)+parseFloat(base_imp);
                                                                                            var obj_ret_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                                                            //reemplaza datos ya sumarizados
                                                                                            obj_Json_Tax_totales.rates_retencion[cadena_rate] = obj_ret_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.rates_retencion_data[rate_num] = obj_ret_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.bases_retencion[rate_num] = obj_ret_total_base.toFixed(2);
                                                                                    }else{
                                                                                            //si no existe el rate y pertenece a retención, se agrega un atributo nuevo
                                                                                            if(!obj_Json_Tax_totales.rates_retencion[cadena_rate]){
                                                                                                    //llena el importe y el importe base en los atributos del objeto de totales
                                                                                                    obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                                                                            }
                                                                                    }
                                                                            }
                                                                            //se ejecuta si no existe ningun atributo
                                                                    }else{
                                                                            //llena el importe y el importe base en los atributos del objeto de totales
                                                                            obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                                                    }
                                                            }
                                                    }

                                                    //definir locales

                                                    for(var loc =0; loc<config_local.length;loc++){
                                                            if(tax_id==config_local[loc]){
                                                                    obj_Json_Tax.locales.rate = rate_number;
                                                                    obj_Json_Tax.locales.id = tax_id;
                                                                    obj_Json_Tax.locales.base = tax_base;
                                                                    obj_Json_Tax.locales.name = tax_name;
                                                                    var base_imp = (parseFloat(importe_base)*parseFloat(tax_base))/100;
                                                                    obj_Json_Tax.locales.base_importe = base_imp.toFixed(2);
                                                                    var rate_num = rate_number * (-1);
                                                                    var base_calc= parseFloat(tax_base)/100;
                                                                    var rate_div = rate_number / 100;
                                                                    obj_Json_Tax.locales.rate_div = rate_div;
                                                                    var tax_importe = (rate_div * parseFloat(importe_base))*base_calc;
                                                                    obj_Json_Tax.locales.importe = tax_importe.toFixed(2);
                                                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                    importe_local = parseFloat(importe_local) + parseFloat(tax_importe);
                                                                    //suma para comparar diferencia de centavos

                                                                    suma_linea = suma_linea+parseFloat(tax_importe);
                                                                    if(descuento_notax==0){
                                                                            suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                                                    }
                                                                    //

                                                                    var cadena = 'Local ';
                                                                    var cadena_rate = cadena+rate_number+'%';
                                                                    var tam_rates_locales = Object.keys(obj_Json_Tax_totales.rates_local).length;

                                                                    if(tam_rates_locales>0){
                                                                            for(var t=0;t<tam_rates_locales;t++){
                                                                                    if(Object.keys(obj_Json_Tax_totales.rates_local)[t]==cadena_rate){
                                                                                            var importe_obj = obj_Json_Tax_totales.rates_local[cadena_rate];
                                                                                            var base_local_total = obj_Json_Tax_totales.bases_local[rate_number];
                                                                                            var obj_local_total_base = parseFloat(base_local_total)+parseFloat(base_imp);
                                                                                            var obj_loc_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                                                            obj_Json_Tax_totales.rates_local[cadena_rate] = obj_loc_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.rates_local_data[rate_number] = obj_loc_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.bases_local[rate_number] = obj_local_total_base.toFixed(2);
                                                                                    }else{
                                                                                            if(!obj_Json_Tax_totales.rates_local[cadena_rate]){
                                                                                                    obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_local_data[rate_number] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.bases_local[rate_number] = base_imp.toFixed(2);
                                                                                            }
                                                                                    }
                                                                            }
                                                                    }else{
                                                                            obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.rates_local_data[rate_number] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.bases_local[rate_number] = base_imp.toFixed(2);
                                                                    }
                                                            }
                                                    }

                                                    //definir ieps

                                                    for(var iep =0; iep<config_ieps.length;iep++){
                                                            if(tax_id==config_ieps[iep]){
                                                                    if(descuento_notax!=0){
                                                                            tiene_ieps++;
                                                                    }

                                                                    obj_Json_Tax.ieps.rate = rate_number;
                                                                    obj_Json_Tax.ieps.id = tax_id;
                                                                    obj_Json_Tax.ieps.base = tax_base;
                                                                    obj_Json_Tax.ieps.name = tax_name;
                                                                    obj_Json_Tax.ieps.descuento = (descuento_notax*(-1)).toFixed(2);

                                                                    var base_imp = ((parseFloat(importe_base)*parseFloat(tax_base))/100)+descuento_notax;
                                                                    log.audit({title:'base_imp_ieps',details:base_imp});
                                                                    obj_Json_Tax.ieps.base_importe = base_imp.toFixed(2);
                                                                    var base_calc= parseFloat(tax_base)/100;
                                                                    log.audit({title:'base_calc',details:base_calc});
                                                                    var rate_div = rate_number / 100;
                                                                    log.audit({title:'rate_div',details:rate_div});
                                                                    obj_Json_Tax.ieps.rate_div = rate_div;
                                                                    var tax_importe = (rate_div * parseFloat(importe_base+descuento_notax))*base_calc;
                                                                    log.audit({title:'tax_importe',details:tax_importe});
                                                                    obj_Json_Tax.ieps.importe = tax_importe.toFixed(2);
                                                                    // importe_ieps_nf = parseFloat(importe_ieps_nf) + parseFloat(tax_importe);
                                                                    // importe_ieps  = importe_ieps_nf;


                                                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                    importe_ieps = parseFloat(importe_ieps) + parseFloat(tax_importe);
                                                                    log.audit({title:'tax_importe',details:tax_importe});
                                                                    log.audit({title:'importe_ieps',details:importe_ieps});


                                                                    log.audit({title:'importe_ieps_suma',details:importe_ieps});
                                                                    //suma para comparar diferencia de centavos

                                                                    var tax_importe_sumas = (rate_div * parseFloat(importe_base))*base_calc;
                                                                    log.audit({title:'tax_importe_sumas',details:tax_importe_sumas});
                                                                    //tax_importe_sumas = tax_importe_sumas.toFixed(2)
                                                                    log.audit({title:'tax_importe_sumas',details:tax_importe_sumas});
                                                                    suma_linea = suma_linea+parseFloat(tax_importe_sumas);
                                                                    if(descuento_notax==0){
                                                                            suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                                                    }

                                                                    log.audit({title:'suma_linea_ieps',details:suma_linea});
                                                                    //

                                                                    var cadena = 'IEPS ';
                                                                    var cadena_rate = cadena+rate_number+'%';
                                                                    log.audit({title:'cadena_rate_ieps',details:cadena_rate});
                                                                    var tam_rates_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                                                                    if(tam_rates_ieps>0){
                                                                            for(var t=0;t<tam_rates_ieps;t++){
                                                                                    log.audit({title:'obj_Json_Tax_totales.rates_ieps)[t]',details:Object.keys(obj_Json_Tax_totales.rates_ieps)[t]});
                                                                                    log.audit({title:'cadena_rate',details:cadena_rate});
                                                                                    if(Object.keys(obj_Json_Tax_totales.rates_ieps)[t]==cadena_rate){
                                                                                            var importe_obj = obj_Json_Tax_totales.rates_ieps[cadena_rate];
                                                                                            log.audit({title:'importe_obj',details:importe_obj});
                                                                                            var base_ieps_total = obj_Json_Tax_totales.bases_ieps[rate_number];
                                                                                            var obj_ieps_total_base = parseFloat(base_ieps_total)+parseFloat(base_imp);
                                                                                            var obj_ieps_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                                                            obj_Json_Tax_totales.rates_ieps[cadena_rate] = obj_ieps_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.rates_ieps_data[rate_number] = obj_ieps_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.bases_ieps[rate_number] = obj_ieps_total_base.toFixed(2);
                                                                                    }else{
                                                                                            if(!obj_Json_Tax_totales.rates_ieps[cadena_rate]){
                                                                                                    obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp.toFixed(2);
                                                                                            }
                                                                                    }
                                                                            }
                                                                    }else{
                                                                            obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp.toFixed(2);
                                                                    }
                                                                    log.audit({title:'obj_Json_Tax_totales_ieps',details:obj_Json_Tax_totales});
                                                            }

                                                    }

                                                    //definir ivas

                                                    for(var iva=0; iva<config_iva.length;iva++){
                                                            if(tax_id==config_iva[iva]){
                                                                    obj_Json_Tax.iva.rate = rate_number;
                                                                    obj_Json_Tax.iva.id = tax_id;
                                                                    obj_Json_Tax.iva.base = tax_base;
                                                                    obj_Json_Tax.iva.name = tax_name;
                                                                    log.audit({title:'tiene_ieps',details:tiene_ieps});
                                                                    var importe_base_des = 0;
                                                                    if(tiene_ieps>0) {
                                                                            importe_base_des =importe_base;
                                                                            importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                                                            var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)
                                                                    }else{
                                                                            var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)+descuento_notax;
                                                                            obj_Json_Tax.iva.descuento = (descuento_notax*(-1)).toFixed(2);
                                                                    }
                                                                    obj_Json_Tax.iva.base_importe = base_imp.toFixed(2);
                                                                    var base_calc= parseFloat(tax_base)/100;
                                                                    var rate_div = rate_number / 100;
                                                                    obj_Json_Tax.iva.rate_div = rate_div;
                                                                    // var rate_div_f = rate_div.toFixed(2);
                                                                    // var importe_base_f = importe_base.toFixed(2);
                                                                    // var base_calc_f = base_calc.toFixed(2);
                                                                    if(tiene_ieps<=0) {
                                                                            var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base+descuento_notax))*parseFloat(base_calc);
                                                                    }else{
                                                                            log.audit({title:'rate_div',details:rate_div});
                                                                            log.audit({title:'base_imp',details:base_imp});
                                                                            log.audit({title:'base_calc',details:base_calc});
                                                                            var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                                                    }
                                                                    log.audit({title:'tax_importe_iva_nof',details:tax_importe});
                                                                    obj_Json_Tax.iva.importe = tax_importe.toFixed(2);
                                                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                    importe_iva = parseFloat(importe_iva) + parseFloat(tax_importe);
                                                                    //suma para comparar diferencia de centavos
                                                                    if(tiene_ieps<=0) {
                                                                            var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                                                            //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                    }else {
                                                                            var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base_des)) * parseFloat(base_calc);
                                                                            //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                    }
                                                                    suma_linea = suma_linea+parseFloat(tax_importe_sumas);
                                                                    if(descuento_notax==0){
                                                                            suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                                                    }
                                                                    log.audit({title:'suma_linea_iva',details:suma_linea});
                                                                    log.audit({title:'tax_importe_iva',details:tax_importe});
                                                                    //

                                                                    var cadena = 'IVA ';
                                                                    var cadena_rate = cadena+rate_number+'%';
                                                                    log.audit({title:'cadena_rate_iva',details:cadena_rate});
                                                                    var tam_rates_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;
                                                                    log.audit({title:'base_imp',details:base_imp});
                                                                    if(tam_rates_iva>0){
                                                                            for(var t=0;t<tam_rates_iva;t++){
                                                                                    if(Object.keys(obj_Json_Tax_totales.rates_iva)[t]==cadena_rate){

                                                                                            log.audit({title:'tax_importe_ivif',details:tax_importe});
                                                                                            var importe_obj = obj_Json_Tax_totales.rates_iva[cadena_rate];
                                                                                            var base_iva_total = obj_Json_Tax_totales.bases_iva[rate_number];
                                                                                            var obj_iva_total_base = parseFloat(base_iva_total)+parseFloat(base_imp);
                                                                                            var obj_iva_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                                                            obj_Json_Tax_totales.rates_iva[cadena_rate] = obj_iva_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.rates_iva_data[rate_number] = obj_iva_total.toFixed(2);
                                                                                            log.audit({title:'obj_iva_total_base',details:obj_iva_total_base});
                                                                                            obj_Json_Tax_totales.bases_iva[rate_number] = obj_iva_total_base.toFixed(2) || 0;
                                                                                            log.audit({title:'obj_Json_Tax_totales.bases_iva[rate_number]',details:obj_Json_Tax_totales.bases_iva[rate_number]});
                                                                                    }else{
                                                                                            if(!obj_Json_Tax_totales.rates_iva[cadena_rate]){
                                                                                                    log.audit({title:'tax_importe_iv0_else',details:tax_importe});
                                                                                                    obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                                                                                    log.audit({title:'base_imp_else',details:base_imp});
                                                                                                    obj_Json_Tax_totales.bases_iva[rate_number] = base_imp.toFixed(2) || '0.00';
                                                                                                    log.audit({title:'obj_Json_Tax_totales.bases_iva[rate_number]',details:obj_Json_Tax_totales.bases_iva[rate_number]});
                                                                                            }

                                                                                    }
                                                                            }
                                                                    }else{
                                                                            obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                                                            log.audit({title:'tax_importe_iv0',details:tax_importe});
                                                                            obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                                                            log.audit({title:'base_imp_else2',details:base_imp});
                                                                            obj_Json_Tax_totales.bases_iva[rate_number] = base_imp.toFixed(2) || '0.00';
                                                                            log.audit({title:'obj_Json_Tax_totales.bases_iva[rate_number]',details:obj_Json_Tax_totales.bases_iva[rate_number]});
                                                                    }
                                                                    log.audit({title:'obj_Json_Tax_totales_iva',details:obj_Json_Tax_totales});
                                                            }

                                                    }

                                                    //definir exentos

                                                    for(var ex=0; ex<config_exento.length;ex++){
                                                            if(tax_id==config_exento[ex]){
                                                                    obj_Json_Tax.exento.rate = rate_number;
                                                                    obj_Json_Tax.exento.id = tax_id;
                                                                    obj_Json_Tax.exento.base = tax_base;
                                                                    obj_Json_Tax.exento.name = tax_name;
                                                                    log.audit({title:'tiene_ieps',details:tiene_ieps});
                                                                    var importe_base_des = 0;
                                                                    if(tiene_ieps>0) {
                                                                            importe_base_des =importe_base;
                                                                            importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                                                            var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)
                                                                    }else{
                                                                            var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)+descuento_notax;
                                                                            obj_Json_Tax.exento.descuento = (descuento_notax*(-1)).toFixed(2);
                                                                    }
                                                                    obj_Json_Tax.exento.base_importe = base_imp.toFixed(2);
                                                                    var base_calc= parseFloat(tax_base)/100;
                                                                    var rate_div = rate_number / 100;
                                                                    obj_Json_Tax.exento.rate_div = rate_div;
                                                                    // var rate_div_f = rate_div.toFixed(2);
                                                                    // var importe_base_f = importe_base.toFixed(2);
                                                                    // var base_calc_f = base_calc.toFixed(2);
                                                                    if(tiene_ieps<=0) {
                                                                            var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base+descuento_notax))*parseFloat(base_calc);
                                                                    }else{
                                                                            log.audit({title:'rate_div',details:rate_div});
                                                                            log.audit({title:'base_imp',details:base_imp});
                                                                            log.audit({title:'base_calc',details:base_calc});
                                                                            var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                                                    }
                                                                    log.audit({title:'tax_importe_ex_nof',details:tax_importe});
                                                                    obj_Json_Tax.exento.importe = tax_importe.toFixed(2);
                                                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                    importe_exento = parseFloat(importe_exento) + parseFloat(tax_importe);
                                                                    //suma para comparar diferencia de centavos
                                                                    if(tiene_ieps<=0) {
                                                                            var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                                                            //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                    }else {
                                                                            var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base_des)) * parseFloat(base_calc);
                                                                            //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                    }
                                                                    suma_linea = suma_linea+parseFloat(tax_importe_sumas);
                                                                    if(descuento_notax==0){
                                                                            suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                                                    }
                                                                    log.audit({title:'suma_linea_ex',details:suma_linea});
                                                                    log.audit({title:'tax_importe_ex',details:tax_importe});
                                                                    //

                                                                    var cadena = 'EXENTO ';
                                                                    var cadena_rate = cadena+rate_number+'%';
                                                                    log.audit({title:'cadena_rate_ex',details:cadena_rate});
                                                                    var tam_rates_ex = Object.keys(obj_Json_Tax_totales.rates_exento).length;
                                                                    log.audit({title:'base_imp',details:base_imp});
                                                                    if(tam_rates_ex>0){
                                                                            for(var t=0;t<tam_rates_ex;t++){
                                                                                    if(Object.keys(obj_Json_Tax_totales.rates_exento)[t]==cadena_rate){

                                                                                            log.audit({title:'tax_importe_ivif',details:tax_importe});
                                                                                            var importe_obj = obj_Json_Tax_totales.rates_exento[cadena_rate];
                                                                                            var base_ex_total = obj_Json_Tax_totales.bases_exento[rate_number];
                                                                                            var obj_ex_total_base = parseFloat(base_ex_total)+parseFloat(base_imp);
                                                                                            var obj_ex_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                                                            obj_Json_Tax_totales.rates_exento[cadena_rate] = obj_ex_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.rates_exento_data[rate_number] = obj_ex_total.toFixed(2);
                                                                                            log.audit({title:'obj_ex_total_base',details:obj_ex_total_base});
                                                                                            obj_Json_Tax_totales.bases_exento[rate_number] = obj_ex_total_base.toFixed(2) || 0;
                                                                                            log.audit({title:'obj_Json_Tax_totales.bases_exento[rate_number]',details:obj_Json_Tax_totales.bases_exento[rate_number]});
                                                                                    }else{
                                                                                            if(!obj_Json_Tax_totales.rates_exento[cadena_rate]){
                                                                                                    log.audit({title:'tax_importe_iv0_else',details:tax_importe});
                                                                                                    obj_Json_Tax_totales.rates_exento[cadena_rate] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_exento_data[rate_number] = tax_importe.toFixed(2);
                                                                                                    log.audit({title:'base_imp_else',details:base_imp});
                                                                                                    obj_Json_Tax_totales.bases_exento[rate_number] = base_imp.toFixed(2) || '0.00';
                                                                                                    log.audit({title:'obj_Json_Tax_totales.bases_exento[rate_number]',details:obj_Json_Tax_totales.bases_exento[rate_number]});
                                                                                            }

                                                                                    }
                                                                            }
                                                                    }else{
                                                                            obj_Json_Tax_totales.rates_exento[cadena_rate] = tax_importe.toFixed(2);
                                                                            log.audit({title:'tax_importe_iv0',details:tax_importe});
                                                                            obj_Json_Tax_totales.rates_exento_data[rate_number] = tax_importe.toFixed(2);
                                                                            log.audit({title:'base_imp_else2',details:base_imp});
                                                                            obj_Json_Tax_totales.bases_exento[rate_number] = base_imp.toFixed(2) || '0.00';
                                                                            log.audit({title:'obj_Json_Tax_totales.bases_exento[rate_number]',details:obj_Json_Tax_totales.bases_exento[rate_number]});
                                                                    }
                                                                    log.audit({title:'obj_Json_Tax_totales_exento',details:obj_Json_Tax_totales});
                                                            }

                                                    }

                                                    contadorLineas++;
                                            }
                                            //termina el recorrido por codigo de impuesto

                                            log.audit({title:'total_linea',details:total_linea});
                                            log.audit({title:'suma_linea',details:suma_linea});
                                            log.audit({title:'suma_linea_tax',details:suma_linea_tax});
                                            suma_linea=suma_linea.toFixed(2);
                                            suma_linea_tax=suma_linea_tax.toFixed(2);
                                            log.audit({title:'suma_linea',details:suma_linea});
                                            log.audit({title:'suma_linea_tax',details:suma_linea_tax});

                                            //se calcula la diferencia de centavos, haciendo operacion de la sumatoria de los impuestos
                                            //calculados por linea contra el valor de impuestos de la linea en el sistema
                                            var diferencia_centavos = parseFloat(total_linea)-parseFloat(suma_linea);
                                            if(suma_linea_tax!=0) {
                                                    if (suma_linea != suma_linea_tax) {
                                                            var dif_sums = suma_linea - suma_linea_tax;
                                                            diferencia_centavos = diferencia_centavos + dif_sums;
                                                    }
                                            }
                                            diferencia_centavos= diferencia_centavos.toFixed(2);
                                            diferencia_centavos = parseFloat(diferencia_centavos);

                                            if(diferencia_centavos<0){
                                                    diferencia_centavos = diferencia_centavos*(1);
                                            }

                                            if(diferencia_centavos>0){
                                                    diferencia_centavos = diferencia_centavos*(1);
                                            }


                                            log.audit({title:'diferencia_centavos',details:diferencia_centavos});
                                            log.audit({title:'importe_retencion',details:importe_retencion});
                                            log.audit({title:'importe_iva',details:importe_iva});
                                            log.audit({title:'importe_local',details:importe_local});
                                            log.audit({title:'importe_ieps',details:importe_ieps});
                                            importe_ieps=importe_ieps.toFixed(2);
                                            importe_ieps = parseFloat(importe_ieps);
                                            log.audit({title:'importe_exento',details:importe_exento});

                                            //si existe diferencia de centavos realiza los siguientes calculos dependiendo si existe el tipo
                                            //de impuesto en la linea
                                            if(diferencia_centavos!=0){
                                                    //la diferencia de centavos se aplicará en la siguiente jerarquia
                                                    if(obj_Json_Tax.retenciones.importe){
                                                            //se obtiene el nuevo importe, quitando la diferencia de centavos
                                                            var nuevo_importe = parseFloat(obj_Json_Tax.retenciones.importe)+parseFloat(diferencia_centavos);
                                                            // se actualiza el atributo de importe nuevo
                                                            obj_Json_Tax.retenciones.importe = nuevo_importe.toFixed(2);
                                                            //se actualiza el total del importe con los centavos
                                                            importe_retencion = parseFloat(importe_retencion)+parseFloat(diferencia_centavos);
                                                            log.audit({title:'importe_retencion',details:importe_retencion});

                                                    }else if(obj_Json_Tax.iva.importe){

                                                            var nuevo_importe = parseFloat(obj_Json_Tax.iva.importe)+parseFloat(diferencia_centavos);
                                                            obj_Json_Tax.iva.importe = nuevo_importe.toFixed(2);
                                                            importe_iva = parseFloat(importe_iva)+parseFloat(diferencia_centavos);
                                                            log.audit({title:'importe_iva',details:importe_iva});
                                                            log.audit({title:'diferencia_centavos_iva',details:diferencia_centavos});

                                                    }else if(obj_Json_Tax.exento.importe){

                                                            var nuevo_importe = parseFloat(obj_Json_Tax.exento.importe)+parseFloat(diferencia_centavos);
                                                            obj_Json_Tax.exento.importe = nuevo_importe.toFixed(2);
                                                            importe_exento = parseFloat(importe_exento)+parseFloat(diferencia_centavos);
                                                            log.audit({title:'importe_exento',details:importe_exento});
                                                            log.audit({title:'diferencia_centavos_exento',details:diferencia_centavos});

                                                    }else if(obj_Json_Tax.locales.importe){

                                                            var nuevo_importe = parseFloat(obj_Json_Tax.locales.importe)+parseFloat(diferencia_centavos);
                                                            obj_Json_Tax.locales.importe = nuevo_importe.toFixed(2);
                                                            importe_local = parseFloat(importe_local)+parseFloat(diferencia_centavos);
                                                            log.audit({title:'importe_local',details:importe_local});

                                                    }else if(obj_Json_Tax.ieps.importe){

                                                            var nuevo_importe = parseFloat(obj_Json_Tax.ieps.importe)+parseFloat(diferencia_centavos);
                                                            obj_Json_Tax.ieps.importe = nuevo_importe.toFixed(2);
                                                            importe_ieps = parseFloat(importe_ieps)+parseFloat(diferencia_centavos);
                                                            log.audit({title:'importe_ieps_difcentavos',details:importe_ieps});

                                                    }
                                            }

                                            //se guarda el json en la linea de articulos
                                            record_now.setSublistValue({
                                                    sublistId: 'item',
                                                    fieldId: 'custcol_efx_fe_tax_json',
                                                    line: i,
                                                    value: JSON.stringify(obj_Json_Tax),
                                            });
                                            log.audit({title:'fin linea',details:i});
                                    }

                                    log.audit({title:'importe_retencion',details:importe_retencion});
                                    log.audit({title:'importe_iva',details:importe_iva.toFixed(2)});
                                    log.audit({title:'importe_exento',details:importe_exento.toFixed(2)});
                                    log.audit({title:'importe_ieps',details:importe_ieps});
                                    log.audit({title:'importe_local',details:importe_local});


                                    //se llena el objeto con los totales de impuestos por tipo
                                    obj_Json_Tax_totales.retencion_total = parseFloat(importe_retencion).toFixed(2) || '0.00';
                                    obj_Json_Tax_totales.iva_total = parseFloat(importe_iva).toFixed(2) || '0.00';
                                    obj_Json_Tax_totales.exento_total = parseFloat(importe_exento).toFixed(2) || '0.00';
                                    obj_Json_Tax_totales.ieps_total = parseFloat(importe_ieps).toFixed(2) || '0.00';
                                    obj_Json_Tax_totales.local_total = parseFloat(importe_local).toFixed(2) || '0.00';


                                    //validar que la suma de desglose coincida con el total
                                    log.audit({title:'objivas',details:Object.keys(obj_Json_Tax_totales.rates_iva)});
                                    log.audit({title:'objivas',details:Object.keys(obj_Json_Tax_totales.rates_iva_data)});
                                    //log.audit({title:'objivas',details:Object.values(obj_Json_Tax_totales.rates_iva)});
                                    var tam_obj_totales_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;
                                    var sumas_ivas = 0;
                                    if(tam_obj_totales_iva>0) {
                                            for (var iva = 0; iva < tam_obj_totales_iva; iva++) {

                                                    sumas_ivas = sumas_ivas + parseFloat(obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]);
                                            }
                                            for (var iva = 0; iva < tam_obj_totales_iva; iva++) {
                                                    if (parseFloat(obj_Json_Tax_totales.iva_total) != sumas_ivas) {

                                                            var diferencia_imp = parseFloat(obj_Json_Tax_totales.iva_total)-sumas_ivas;

                                                            diferencia_imp = diferencia_imp.toFixed(2);
                                                            diferencia_imp = parseFloat(diferencia_imp);


                                                            if(Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva] == 0) {
                                                                    obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]] = 0;
                                                                    obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]] = 0;

                                                            }else{
                                                                    var ttt = Object.keys(obj_Json_Tax_totales.rates_iva);
                                                                    obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]] = parseFloat(obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]) + diferencia_imp;
                                                                    log.audit({title:'diferencia_imp',details:obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]});
                                                                    obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]] = parseFloat(obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]]) + diferencia_imp;
                                                            }
                                                            obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iva]] = parseFloat(obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iva]]) + diferencia_imp || 0;
                                                            sumas_ivas = sumas_ivas+diferencia_imp;
                                                    }
                                            }


                                    }


                                    var tam_obj_totales_exento = Object.keys(obj_Json_Tax_totales.rates_exento).length;
                                    var sumas_ex = 0;
                                    if(tam_obj_totales_exento>0) {
                                            for (var ex = 0; ex < tam_obj_totales_exento; ex++) {

                                                    sumas_ex = sumas_ex + parseFloat(obj_Json_Tax_totales.rates_exento[Object.keys(obj_Json_Tax_totales.rates_exento)[ex]]);
                                            }
                                            for (var exe = 0; exe < tam_obj_totales_exento; exe++) {
                                                    if (parseFloat(obj_Json_Tax_totales.exento_total) != sumas_ex) {

                                                            var diferencia_imp = parseFloat(obj_Json_Tax_totales.exento_total)-sumas_ex;

                                                            diferencia_imp = diferencia_imp.toFixed(2);
                                                            diferencia_imp = parseFloat(diferencia_imp);


                                                            if(Object.keys(obj_Json_Tax_totales.rates_exento_data)[exe] == 0) {
                                                                    obj_Json_Tax_totales.rates_exento[Object.keys(obj_Json_Tax_totales.rates_exento)[exe]] = 0;
                                                                    obj_Json_Tax_totales.rates_exento_data[Object.keys(obj_Json_Tax_totales.rates_exento_data)[exe]] = 0;

                                                            }else{
                                                                    var ttt = Object.keys(obj_Json_Tax_totales.rates_exento);
                                                                    obj_Json_Tax_totales.rates_exento[Object.keys(obj_Json_Tax_totales.rates_exento)[exe]] = parseFloat(obj_Json_Tax_totales.rates_exento[Object.keys(obj_Json_Tax_totales.rates_exento)[exe]]) + diferencia_imp;
                                                                    log.audit({title:'diferencia_imp',details:obj_Json_Tax_totales.rates_exento[Object.keys(obj_Json_Tax_totales.rates_exento)[exe]]});
                                                                    obj_Json_Tax_totales.rates_exento_data[Object.keys(obj_Json_Tax_totales.rates_exento_data)[exe]] = parseFloat(obj_Json_Tax_totales.rates_exento_data[Object.keys(obj_Json_Tax_totales.rates_exento_data)[exe]]) + diferencia_imp;
                                                            }
                                                            obj_Json_Tax_totales.bases_exento[Object.keys(obj_Json_Tax_totales.bases_exento)[exe]] = parseFloat(obj_Json_Tax_totales.bases_exento[Object.keys(obj_Json_Tax_totales.bases_exento)[exe]]) + diferencia_imp || 0;
                                                            sumas_ex = sumas_ex+diferencia_imp;
                                                    }
                                            }


                                    }


                                    var tam_obj_totales_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                                    var sumas_ieps = 0;
                                    if(tam_obj_totales_ieps>0) {
                                            for (var ieps = 0; ieps < tam_obj_totales_ieps; ieps++) {
                                                    sumas_ieps = sumas_ieps + parseFloat(obj_Json_Tax_totales.rates_ieps[Object.keys(obj_Json_Tax_totales.rates_ieps)[ieps]]);

                                            }

                                            for (var ieps = 0; ieps < tam_obj_totales_ieps; ieps++) {
                                                    if (parseFloat(obj_Json_Tax_totales.ieps_total) != sumas_ieps) {

                                                            var diferencia_imp = parseFloat(obj_Json_Tax_totales.ieps_total) - sumas_ieps;
                                                            obj_Json_Tax_totales.rates_ieps[Object.keys(obj_Json_Tax_totales.rates_ieps)[ieps]] = (parseFloat(obj_Json_Tax_totales.rates_ieps[Object.keys(obj_Json_Tax_totales.rates_ieps)[ieps]]) + diferencia_imp).toFixed(2);
                                                            obj_Json_Tax_totales.rates_ieps_data[Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]] = (parseFloat(obj_Json_Tax_totales.rates_ieps_data[Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]]) + diferencia_imp).toFixed(2);
                                                            obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[ieps]] = (parseFloat(obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[ieps]]) + diferencia_imp).toFixed(2);
                                                            sumas_ieps = sumas_ieps+diferencia_imp;
                                                    }
                                            }
                                    }

                                    var tam_obj_totales_local = Object.keys(obj_Json_Tax_totales.rates_local).length;

                                    var sumas_locales = 0;
                                    if(tam_obj_totales_local>0) {
                                            for (var loc = 0; loc < tam_obj_totales_local; loc++) {
                                                    sumas_locales = sumas_locales + parseFloat(obj_Json_Tax_totales.rates_local[Object.keys(obj_Json_Tax_totales.rates_local)[loc]]);
                                            }
                                            for (var loc = 0; loc < tam_obj_totales_local; loc++) {
                                                    if (parseFloat(obj_Json_Tax_totales.local_total) != sumas_locales) {

                                                            var diferencia_imp = parseFloat(obj_Json_Tax_totales.local_total) - sumas_locales;
                                                            obj_Json_Tax_totales.rates_local[Object.keys(obj_Json_Tax_totales.rates_local)[loc]] = parseFloat(obj_Json_Tax_totales.rates_local[Object.keys(obj_Json_Tax_totales.rates_local)[loc]]) + diferencia_imp;
                                                            obj_Json_Tax_totales.rates_local_data[Object.keys(obj_Json_Tax_totales.rates_local_data)[loc]] = parseFloat(obj_Json_Tax_totales.rates_local_data[Object.keys(obj_Json_Tax_totales.rates_local_data)[loc]]) + diferencia_imp;
                                                            obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]] = parseFloat(obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]]) + diferencia_imp;
                                                            sumas_locales = sumas_locales+diferencia_imp;
                                                    }
                                            }
                                    }

                                    var tam_obj_totales_ret = Object.keys(obj_Json_Tax_totales.rates_retencion).length;
                                    log.audit({title:'tam_obj_totales_ret',details:tam_obj_totales_ret});
                                    var sumas_ret = 0;
                                    if(tam_obj_totales_ret>0) {
                                            for (var ret = 0; ret < tam_obj_totales_ret; ret++) {
                                                    sumas_ret = sumas_ret + parseFloat(obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]]);


                                                    log.audit({title: 'sumas_ret', details: sumas_ret});
                                                    log.audit({
                                                            title: 'obj_Json_Tax_totales.retencion_total',
                                                            details: obj_Json_Tax_totales.retencion_total
                                                    });
                                            }
                                            for (var ret = 0; ret < tam_obj_totales_ret; ret++) {
                                                    if (parseFloat(obj_Json_Tax_totales.retencion_total) != sumas_ret) {

                                                            var diferencia_imp = parseFloat(obj_Json_Tax_totales.retencion_total) - sumas_ret;


                                                            log.audit({title: 'diferencia_imp', details: diferencia_imp});
                                                            obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]] = parseFloat(obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]]) + diferencia_imp;
                                                            obj_Json_Tax_totales.rates_retencion_data[Object.keys(obj_Json_Tax_totales.rates_retencion_data)[ret]] = parseFloat(obj_Json_Tax_totales.rates_retencion_data[Object.keys(obj_Json_Tax_totales.rates_retencion_data)[ret]]) + diferencia_imp;
                                                            obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]] = parseFloat(obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]]) + diferencia_imp;
                                                            sumas_ret = sumas_ret+diferencia_imp;
                                                    }
                                            }
                                    }

                                    record_now.setValue({
                                            fieldId: 'custbody_efx_fe_tax_json',
                                            value: JSON.stringify(obj_Json_Tax_totales),
                                            ignoreFieldChange: true
                                    });

                            }
                    }catch (error) {
                            log.audit({title:'error',details:error});
                            record_now.setValue({
                                    fieldId: 'custbody_efx_fe_tax_json',
                                    value: JSON.stringify(obj_Json_Tax_totales),
                                    ignoreFieldChange: true
                            });
                    }
                    if(recType == record.Type.PURCHASE_ORDER && line_count_expense>0){
                            impuestosExpenses(context);
                    }
            }

            function impuestosExpenses(context){
                    var obj_Json_Tax_totales = new Object();

                    obj_Json_Tax_totales = {
                            ieps_total: 0,
                            iva_total: 0,
                            retencion_total: 0,
                            local_total: 0,
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
                            descuentoConImpuesto:0,
                            descuentoSinImpuesto:0
                    }
                    var record_now = context.newRecord;
                    var recType = record_now.type;
                    try {

                            if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
                                    var obj_Json_Tax = new Object();


                                    var desglose_config = search.create({
                                            type: 'customrecord_efx_fe_desglose_tax',
                                            filters: ['isinactive',search.Operator.IS,'F'],
                                            columns: [
                                                    search.createColumn({name: 'custrecord_efx_fe_desglose_ieps'}),
                                                    search.createColumn({name: 'custrecord_efx_fe_desglose_ret'}),
                                                    search.createColumn({name: 'custrecord_efx_fe_desglose_locales'}),
                                                    search.createColumn({name: 'custrecord_efx_fe_desglose_iva'}),
                                            ]
                                    });

                                    var ejecutar = desglose_config.run();
                                    var resultado = ejecutar.getRange(0, 100);

                                    var config_ieps = new Array();
                                    var config_retencion = new Array();
                                    var config_local = new Array();
                                    var config_iva = new Array();

                                    config_ieps = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_ieps'})).split(',');
                                    config_retencion = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_ret'})).split(',');
                                    config_local = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_locales'})).split(',');
                                    config_iva = (resultado[0].getValue({name: 'custrecord_efx_fe_desglose_iva'})).split(',');

                                    log.audit({title:'config_ieps',details:config_ieps});
                                    log.audit({title:'config_retencion',details:config_retencion});
                                    log.audit({title:'config_local',details:config_local});
                                    log.audit({title:'config_iva',details:config_iva});

                                    var importe_retencion = 0;
                                    var importe_iva = 0;
                                    var importe_ieps = 0;
                                    var importe_local = 0;
                                    var line_count = record_now.getLineCount({sublistId: 'expense'});
                                    for (var i = 0; i < line_count; i++) {
                                            log.audit({title:'linea',details:i});
                                            obj_Json_Tax = {
                                                    ieps: {
                                                            name: "",
                                                            id: "",
                                                            factor:"003",
                                                            rate: 0,
                                                            base: 0,
                                                            base_importe: 0,
                                                            importe: '',
                                                            rate_div:0,
                                                            descuento:0
                                                    },
                                                    locales: {
                                                            name: "",
                                                            id: "",
                                                            factor:"002",
                                                            rate: 0,
                                                            base: 0,
                                                            base_importe: 0,
                                                            importe: '',
                                                            rate_div:0,
                                                            descuento:0
                                                    },
                                                    retenciones: {
                                                            name: "",
                                                            id: "",
                                                            factor:"002",
                                                            rate: 0,
                                                            base: 0,
                                                            base_importe: 0,
                                                            importe: '',
                                                            rate_div:0,
                                                            descuento:0
                                                    },
                                                    iva: {
                                                            name: "",
                                                            id: "",
                                                            factor:"002",
                                                            rate: 0,
                                                            base: 0,
                                                            base_importe: 0,
                                                            importe: '',
                                                            rate_div:0,
                                                            descuento:0
                                                    },
                                                    descuentoConImpuesto:0,
                                                    descuentoSinImpuesto:0
                                            }
                                            var descuento_linea = 0;
                                            var descuento_linea_sin = 0;
                                            var tipo_articulo = record_now.getSublistValue({sublistId: 'expense', fieldId: 'itemtype', line: i});
                                            log.audit({title:'tipo_articulo',details:tipo_articulo});
                                            if(tipo_articulo=='Discount'){
                                                    continue;
                                            }
                                            var descuento_notax =0;
                                            if(i<(line_count-1)){
                                                    var tipo_articulo = record_now.getSublistValue({sublistId: 'expense', fieldId: 'itemtype', line: i+1});
                                                    if(tipo_articulo=='Discount') {
                                                            var linea_descuentos_monto = record_now.getSublistValue({
                                                                    sublistId: 'expense',
                                                                    fieldId: 'grossamt',
                                                                    line: i + 1
                                                            });

                                                            descuento_notax = record_now.getSublistValue({
                                                                    sublistId: 'expense',
                                                                    fieldId: 'amount',
                                                                    line: i + 1
                                                            });
                                                            descuento_linea = linea_descuentos_monto*(-1);
                                                            descuento_linea_sin = descuento_notax*(-1);
                                                            obj_Json_Tax_totales.descuentoConImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoConImpuesto)+descuento_linea).toFixed(2);
                                                            obj_Json_Tax_totales.descuentoSinImpuesto = (parseFloat(obj_Json_Tax_totales.descuentoSinImpuesto)+descuento_linea_sin).toFixed(2);
                                                            obj_Json_Tax.descuentoConImpuesto = descuento_linea.toFixed(2);
                                                            obj_Json_Tax.descuentoSinImpuesto = descuento_linea_sin.toFixed(2);
                                                    }
                                            }

                                            var tax_code = record_now.getSublistValue({sublistId: 'expense', fieldId: 'taxcode', line: i});
                                            var importe_base = record_now.getSublistValue({sublistId: 'expense', fieldId: 'amount', line: i});
                                            var total_linea = parseFloat(record_now.getSublistValue({sublistId: 'expense', fieldId: 'tax1amt', line: i}));

                                            var suma_linea = 0;
                                            var suma_linea_tax = 0;

                                            var grupo_impuestos = true;
                                            try{
                                                    var info_tax_rec = record.load({
                                                            type: record.Type.TAX_GROUP,
                                                            id: tax_code,
                                                            isDynamic: true
                                                    });

                                                    var tax_lines_count = info_tax_rec.getLineCount({sublistId: 'taxitem'});
                                                    log.audit({title:'tax_lines_count',details:tax_lines_count});
                                                    grupo_impuestos=true;

                                            }catch(error_grup){
                                                    var info_tax_rec = record.load({
                                                            type: record.Type.SALES_TAX_ITEM,
                                                            id: tax_code,
                                                            isDynamic: true
                                                    });

                                                    var tax_lines_count = 1;
                                                    log.audit({title:'tax_lines_count',details:tax_lines_count});

                                                    grupo_impuestos=false;
                                            }

                                            var contadorLineas = 0;
                                            var tiene_ieps = 0;
                                            for (var x = 0; x < tax_lines_count; x++) {
                                                    if(grupo_impuestos) {
                                                            var tax_name = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'taxname2',
                                                                    line: x
                                                            });
                                                            var tax_id = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'taxname',
                                                                    line: x
                                                            });
                                                            var tax_rate = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'rate',
                                                                    line: x
                                                            });
                                                            var tax_base = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'basis',
                                                                    line: x
                                                            });
                                                            var tax_tipo = info_tax_rec.getSublistValue({
                                                                    sublistId: 'taxitem',
                                                                    fieldId: 'taxtype',
                                                                    line: x
                                                            });
                                                    }else{
                                                            var tax_name = info_tax_rec.getValue({
                                                                    fieldId: 'itemid',
                                                            });
                                                            var tax_id = info_tax_rec.getValue({
                                                                    fieldId: 'id',
                                                            });
                                                            var tax_rate = info_tax_rec.getValue({
                                                                    fieldId: 'rate',
                                                            });
                                                            var tax_base = '100';

                                                            var tax_tipo = info_tax_rec.getText({
                                                                    fieldId: 'taxtype',
                                                            });
                                                    }



                                                    log.audit({title:'tax_rate',details:tax_rate});
                                                    //var rate_replace = tax_rate.replace("%", "");
                                                    var rate_number = parseFloat(tax_rate);

                                                    //definir retenciones
                                                    for(var ret =0; ret<config_retencion.length;ret++){
                                                            if(tax_id==config_retencion[ret]){
                                                                    obj_Json_Tax.retenciones.rate = rate_number * (-1);
                                                                    obj_Json_Tax.retenciones.id = tax_id;
                                                                    obj_Json_Tax.retenciones.base = tax_base;
                                                                    obj_Json_Tax.retenciones.name = tax_name;
                                                                    var base_imp = (parseFloat(importe_base)*parseFloat(tax_base))/100;
                                                                    obj_Json_Tax.retenciones.base_importe = base_imp.toFixed(2);
                                                                    var rate_num = rate_number * (-1);
                                                                    var base_calc= parseFloat(tax_base)/100;
                                                                    var rate_div = rate_num / 100;
                                                                    obj_Json_Tax.retenciones.rate_div = rate_div;

                                                                    var tax_importe = (rate_div * parseFloat(importe_base))*base_calc;

                                                                    obj_Json_Tax.retenciones.importe = tax_importe.toFixed(2);
                                                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                    importe_retencion = parseFloat(importe_retencion) + parseFloat(tax_importe);
                                                                    //suma para comparar diferencia de centavos
                                                                    suma_linea = suma_linea-parseFloat(tax_importe);
                                                                    suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                                                    //
                                                                    var cadena = 'Retencion ';
                                                                    var cadena_rate = cadena+rate_num+'%';
                                                                    var tam_rates_ret = Object.keys(obj_Json_Tax_totales.rates_retencion).length;
                                                                    if(tam_rates_ret>0){
                                                                            for(var t=0;t<tam_rates_ret;t++){
                                                                                    if(Object.keys(obj_Json_Tax_totales.rates_retencion)[t]==cadena_rate){
                                                                                            var importe_obj = obj_Json_Tax_totales.rates_retencion[cadena_rate];
                                                                                            var base_ret_total = obj_Json_Tax_totales.bases_retencion[rate_num];
                                                                                            var obj_ret_total_base = parseFloat(base_ret_total)+parseFloat(base_imp);
                                                                                            var obj_ret_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                                                            obj_Json_Tax_totales.rates_retencion[cadena_rate] = obj_ret_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.rates_retencion_data[rate_num] = obj_ret_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.bases_retencion[rate_num] = obj_ret_total_base.toFixed(2);
                                                                                    }else{
                                                                                            if(!obj_Json_Tax_totales.rates_retencion[cadena_rate]){
                                                                                                    obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                                                                            }
                                                                                    }
                                                                            }
                                                                    }else{
                                                                            obj_Json_Tax_totales.rates_retencion[cadena_rate] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.rates_retencion_data[rate_num] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.bases_retencion[rate_num] = base_imp.toFixed(2);
                                                                    }
                                                            }
                                                    }


                                                    //definir locales

                                                    for(var loc =0; loc<config_local.length;loc++){
                                                            if(tax_id==config_local[loc]){
                                                                    obj_Json_Tax.locales.rate = rate_number;
                                                                    obj_Json_Tax.locales.id = tax_id;
                                                                    obj_Json_Tax.locales.base = tax_base;
                                                                    obj_Json_Tax.locales.name = tax_name;
                                                                    var base_imp = (parseFloat(importe_base)*parseFloat(tax_base))/100;
                                                                    obj_Json_Tax.locales.base_importe = base_imp.toFixed(2);
                                                                    var rate_num = rate_number * (-1);
                                                                    var base_calc= parseFloat(tax_base)/100;
                                                                    var rate_div = rate_number / 100;
                                                                    obj_Json_Tax.locales.rate_div = rate_div;
                                                                    var tax_importe = (rate_div * parseFloat(importe_base))*base_calc;
                                                                    obj_Json_Tax.locales.importe = tax_importe.toFixed(2);
                                                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                    importe_local = parseFloat(importe_local) + parseFloat(tax_importe);
                                                                    //suma para comparar diferencia de centavos

                                                                    suma_linea = suma_linea+parseFloat(tax_importe);
                                                                    suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                                                    //

                                                                    var cadena = 'Local ';
                                                                    var cadena_rate = cadena+rate_number+'%';
                                                                    var tam_rates_locales = Object.keys(obj_Json_Tax_totales.rates_local).length;

                                                                    if(tam_rates_locales>0){
                                                                            for(var t=0;t<tam_rates_locales;t++){
                                                                                    if(Object.keys(obj_Json_Tax_totales.rates_local)[t]==cadena_rate){
                                                                                            var importe_obj = obj_Json_Tax_totales.rates_local[cadena_rate];
                                                                                            var base_local_total = obj_Json_Tax_totales.bases_local[rate_number];
                                                                                            var obj_local_total_base = parseFloat(base_local_total)+parseFloat(base_imp);
                                                                                            var obj_loc_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                                                            obj_Json_Tax_totales.rates_local[cadena_rate] = obj_loc_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.rates_local_data[rate_number] = obj_loc_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.bases_local[rate_number] = obj_local_total_base.toFixed(2);
                                                                                    }else{
                                                                                            if(!obj_Json_Tax_totales.rates_local[cadena_rate]){
                                                                                                    obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_local_data[rate_number] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.bases_local[rate_number] = base_imp.toFixed(2);
                                                                                            }
                                                                                    }
                                                                            }
                                                                    }else{
                                                                            obj_Json_Tax_totales.rates_local[cadena_rate] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.rates_local_data[rate_number] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.bases_local[rate_number] = base_imp.toFixed(2);
                                                                    }
                                                            }
                                                    }

                                                    //definir ieps

                                                    for(var iep =0; iep<config_ieps.length;iep++){
                                                            if(tax_id==config_ieps[iep]){
                                                                    if(descuento_notax!=0){
                                                                            tiene_ieps++;
                                                                    }

                                                                    obj_Json_Tax.ieps.rate = rate_number;
                                                                    obj_Json_Tax.ieps.id = tax_id;
                                                                    obj_Json_Tax.ieps.base = tax_base;
                                                                    obj_Json_Tax.ieps.name = tax_name;
                                                                    obj_Json_Tax.ieps.descuento = (descuento_notax*(-1)).toFixed(2);
                                                                    var base_imp = ((parseFloat(importe_base)*parseFloat(tax_base))/100)+descuento_notax;
                                                                    obj_Json_Tax.ieps.base_importe = base_imp.toFixed(2);
                                                                    var base_calc= parseFloat(tax_base)/100;
                                                                    var rate_div = rate_number / 100;
                                                                    obj_Json_Tax.ieps.rate_div = rate_div;
                                                                    var tax_importe = (rate_div * parseFloat(importe_base+descuento_notax))*base_calc;
                                                                    obj_Json_Tax.ieps.importe = tax_importe.toFixed(2);
                                                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                    log.audit({title:'importe_ieps',details:importe_ieps});
                                                                    log.audit({title:'tax_importe',details:tax_importe});
                                                                    importe_ieps = parseFloat(importe_ieps) + parseFloat(tax_importe);
                                                                    log.audit({title:'importe_ieps_suma',details:importe_ieps});
                                                                    //suma para comparar diferencia de centavos
                                                                    var tax_importe_sumas = (rate_div * parseFloat(importe_base))*base_calc;
                                                                    //tax_importe_sumas = tax_importe_sumas.toFixed(2)
                                                                    suma_linea = suma_linea+parseFloat(tax_importe_sumas);
                                                                    suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                                                    //

                                                                    var cadena = 'IEPS ';
                                                                    var cadena_rate = cadena+rate_number+'%';
                                                                    log.audit({title:'cadena_rate_ieps',details:cadena_rate});
                                                                    var tam_rates_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                                                                    if(tam_rates_ieps>0){
                                                                            for(var t=0;t<tam_rates_ieps;t++){
                                                                                    log.audit({title:'obj_Json_Tax_totales.rates_ieps)[t]',details:Object.keys(obj_Json_Tax_totales.rates_ieps)[t]});
                                                                                    log.audit({title:'cadena_rate',details:cadena_rate});
                                                                                    if(Object.keys(obj_Json_Tax_totales.rates_ieps)[t]==cadena_rate){
                                                                                            var importe_obj = obj_Json_Tax_totales.rates_ieps[cadena_rate];
                                                                                            log.audit({title:'importe_obj',details:importe_obj});
                                                                                            var base_ieps_total = obj_Json_Tax_totales.bases_ieps[rate_number];
                                                                                            var obj_ieps_total_base = parseFloat(base_ieps_total)+parseFloat(base_imp);
                                                                                            var obj_ieps_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                                                            obj_Json_Tax_totales.rates_ieps[cadena_rate] = obj_ieps_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.rates_ieps_data[rate_number] = obj_ieps_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.bases_ieps[rate_number] = obj_ieps_total_base.toFixed(2);
                                                                                    }else{
                                                                                            if(!obj_Json_Tax_totales.rates_ieps[cadena_rate]){
                                                                                                    obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp.toFixed(2);
                                                                                            }
                                                                                    }
                                                                            }
                                                                    }else{
                                                                            obj_Json_Tax_totales.rates_ieps[cadena_rate] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.rates_ieps_data[rate_number] = tax_importe.toFixed(2);
                                                                            obj_Json_Tax_totales.bases_ieps[rate_number] = base_imp.toFixed(2);
                                                                    }
                                                                    log.audit({title:'obj_Json_Tax_totales_ieps',details:obj_Json_Tax_totales});
                                                            }

                                                    }

                                                    //definir ivas

                                                    for(var iva=0; iva<config_iva.length;iva++){
                                                            if(tax_id==config_iva[iva]){
                                                                    obj_Json_Tax.iva.rate = rate_number;
                                                                    obj_Json_Tax.iva.id = tax_id;
                                                                    obj_Json_Tax.iva.base = tax_base;
                                                                    obj_Json_Tax.iva.name = tax_name;
                                                                    log.audit({title:'tiene_ieps',details:tiene_ieps});
                                                                    var importe_base_des = 0;
                                                                    if(tiene_ieps>0) {
                                                                            importe_base_des =importe_base;
                                                                            importe_base = parseFloat(obj_Json_Tax.ieps.base_importe);
                                                                            var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)
                                                                    }else{
                                                                            var base_imp = ((parseFloat(importe_base) * parseFloat(tax_base)) / 100)+descuento_notax;
                                                                            obj_Json_Tax.iva.descuento = (descuento_notax*(-1)).toFixed(2);
                                                                    }
                                                                    obj_Json_Tax.iva.base_importe = base_imp.toFixed(2);
                                                                    var base_calc= parseFloat(tax_base)/100;
                                                                    var rate_div = rate_number / 100;
                                                                    obj_Json_Tax.iva.rate_div = rate_div;
                                                                    // var rate_div_f = rate_div.toFixed(2);
                                                                    // var importe_base_f = importe_base.toFixed(2);
                                                                    // var base_calc_f = base_calc.toFixed(2);
                                                                    if(tiene_ieps<=0) {
                                                                            var tax_importe = (parseFloat(rate_div) * parseFloat(importe_base+descuento_notax))*parseFloat(base_calc);
                                                                    }else{
                                                                            log.audit({title:'rate_div',details:rate_div});
                                                                            log.audit({title:'base_imp',details:base_imp});
                                                                            log.audit({title:'base_calc',details:base_calc});
                                                                            var tax_importe = (parseFloat(rate_div) * parseFloat(base_imp));
                                                                    }
                                                                    log.audit({title:'tax_importe_iva_nof',details:tax_importe});
                                                                    obj_Json_Tax.iva.importe = tax_importe.toFixed(2);
                                                                    tax_importe = parseFloat(tax_importe.toFixed(2));
                                                                    importe_iva = parseFloat(importe_iva) + parseFloat(tax_importe);
                                                                    //suma para comparar diferencia de centavos
                                                                    if(tiene_ieps<=0) {
                                                                            var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base)) * parseFloat(base_calc);
                                                                            //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                    }else {
                                                                            var tax_importe_sumas = (parseFloat(rate_div) * parseFloat(importe_base_des)) * parseFloat(base_calc);
                                                                            //tax_importe_sumas=tax_importe_sumas.toFixed(2);
                                                                    }
                                                                    suma_linea = suma_linea+parseFloat(tax_importe_sumas);
                                                                    suma_linea_tax = suma_linea_tax+parseFloat(tax_importe);
                                                                    log.audit({title:'suma_linea_iva',details:suma_linea});
                                                                    log.audit({title:'tax_importe_iva',details:tax_importe});
                                                                    //

                                                                    var cadena = 'IVA ';
                                                                    var cadena_rate = cadena+rate_number+'%';
                                                                    log.audit({title:'cadena_rate_iva',details:cadena_rate});
                                                                    var tam_rates_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;
                                                                    log.audit({title:'base_imp',details:base_imp});
                                                                    if(tam_rates_iva>0){
                                                                            for(var t=0;t<tam_rates_iva;t++){
                                                                                    if(Object.keys(obj_Json_Tax_totales.rates_iva)[t]==cadena_rate){

                                                                                            log.audit({title:'tax_importe_ivif',details:tax_importe});
                                                                                            var importe_obj = obj_Json_Tax_totales.rates_iva[cadena_rate];
                                                                                            var base_iva_total = obj_Json_Tax_totales.bases_iva[rate_number];
                                                                                            var obj_iva_total_base = parseFloat(base_iva_total)+parseFloat(base_imp);
                                                                                            var obj_iva_total = parseFloat(importe_obj)+parseFloat(tax_importe);

                                                                                            obj_Json_Tax_totales.rates_iva[cadena_rate] = obj_iva_total.toFixed(2);
                                                                                            obj_Json_Tax_totales.rates_iva_data[rate_number] = obj_iva_total.toFixed(2);
                                                                                            log.audit({title:'obj_iva_total_base',details:obj_iva_total_base});
                                                                                            obj_Json_Tax_totales.bases_iva[rate_number] = obj_iva_total_base.toFixed(2) || 0;
                                                                                            log.audit({title:'obj_Json_Tax_totales.bases_iva[rate_number]',details:obj_Json_Tax_totales.bases_iva[rate_number]});
                                                                                    }else{
                                                                                            if(!obj_Json_Tax_totales.rates_iva[cadena_rate]){
                                                                                                    log.audit({title:'tax_importe_iv0_else',details:tax_importe});
                                                                                                    obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                                                                                    obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                                                                                    log.audit({title:'base_imp_else',details:base_imp});
                                                                                                    obj_Json_Tax_totales.bases_iva[rate_number] = base_imp.toFixed(2) || '0.00';
                                                                                                    log.audit({title:'obj_Json_Tax_totales.bases_iva[rate_number]',details:obj_Json_Tax_totales.bases_iva[rate_number]});
                                                                                            }

                                                                                    }
                                                                            }
                                                                    }else{
                                                                            obj_Json_Tax_totales.rates_iva[cadena_rate] = tax_importe.toFixed(2);
                                                                            log.audit({title:'tax_importe_iv0',details:tax_importe});
                                                                            obj_Json_Tax_totales.rates_iva_data[rate_number] = tax_importe.toFixed(2);
                                                                            log.audit({title:'base_imp_else2',details:base_imp});
                                                                            obj_Json_Tax_totales.bases_iva[rate_number] = base_imp.toFixed(2) || '0.00';
                                                                            log.audit({title:'obj_Json_Tax_totales.bases_iva[rate_number]',details:obj_Json_Tax_totales.bases_iva[rate_number]});
                                                                    }
                                                                    log.audit({title:'obj_Json_Tax_totales_iva',details:obj_Json_Tax_totales});
                                                            }

                                                    }


                                                    contadorLineas++;
                                            }


                                            log.audit({title:'total_linea',details:total_linea});
                                            log.audit({title:'suma_linea',details:suma_linea});
                                            suma_linea=suma_linea.toFixed(2);
                                            log.audit({title:'suma_linea',details:suma_linea});

                                            var diferencia_centavos = parseFloat(total_linea)-parseFloat(suma_linea);
                                            diferencia_centavos= diferencia_centavos.toFixed(2);
                                            diferencia_centavos = parseFloat(diferencia_centavos);

                                            if(diferencia_centavos<0){
                                                    diferencia_centavos = diferencia_centavos*(1);
                                            }

                                            if(diferencia_centavos>0){
                                                    diferencia_centavos = diferencia_centavos*(1);
                                            }



                                            log.audit({title:'diferencia_centavos',details:diferencia_centavos});
                                            log.audit({title:'importe_retencion',details:importe_retencion});
                                            log.audit({title:'importe_iva',details:importe_iva});
                                            log.audit({title:'importe_local',details:importe_local});
                                            log.audit({title:'importe_ieps',details:importe_ieps});

                                            if(diferencia_centavos!=0){

                                                    if(obj_Json_Tax.retenciones.importe){
                                                            var nuevo_importe = parseFloat(obj_Json_Tax.retenciones.importe)+parseFloat(diferencia_centavos);
                                                            obj_Json_Tax.retenciones.importe = nuevo_importe;
                                                            importe_retencion = parseFloat(importe_retencion)+parseFloat(diferencia_centavos);
                                                            log.audit({title:'importe_retencion',details:importe_retencion});

                                                    }else if(obj_Json_Tax.iva.importe){

                                                            var nuevo_importe = parseFloat(obj_Json_Tax.iva.importe)+parseFloat(diferencia_centavos);
                                                            obj_Json_Tax.iva.importe = nuevo_importe.toFixed(2);
                                                            importe_iva = parseFloat(importe_iva)+parseFloat(diferencia_centavos);
                                                            log.audit({title:'importe_iva',details:importe_iva});
                                                            log.audit({title:'diferencia_centavos_iva',details:diferencia_centavos});

                                                    }else if(obj_Json_Tax.locales.importe){

                                                            var nuevo_importe = parseFloat(obj_Json_Tax.locales.importe)+parseFloat(diferencia_centavos);
                                                            obj_Json_Tax.locales.importe = nuevo_importe;
                                                            importe_local = parseFloat(importe_local)+parseFloat(diferencia_centavos);
                                                            log.audit({title:'importe_local',details:importe_local});

                                                    }else if(obj_Json_Tax.ieps.importe){

                                                            var nuevo_importe = parseFloat(obj_Json_Tax.ieps.importe)+parseFloat(diferencia_centavos);
                                                            obj_Json_Tax.ieps.importe = nuevo_importe;
                                                            importe_ieps = parseFloat(importe_ieps)+parseFloat(diferencia_centavos);
                                                            log.audit({title:'importe_ieps_difcentavos',details:importe_ieps});

                                                    }
                                            }

                                            record_now.setSublistValue({
                                                    sublistId: 'expense',
                                                    fieldId: 'custcol_efx_fe_tax_json',
                                                    line: i,
                                                    value: JSON.stringify(obj_Json_Tax),
                                            });


                                    }

                                    log.audit({title:'importe_retencion',details:importe_retencion});
                                    log.audit({title:'importe_iva',details:importe_iva.toFixed(2)});
                                    log.audit({title:'importe_ieps',details:importe_ieps});
                                    log.audit({title:'importe_local',details:importe_local});

                                    obj_Json_Tax_totales.retencion_total = parseFloat(importe_retencion).toFixed(2) || '0.00';
                                    obj_Json_Tax_totales.iva_total = parseFloat(importe_iva).toFixed(2) || '0.00';
                                    obj_Json_Tax_totales.ieps_total = parseFloat(importe_ieps).toFixed(2) || '0.00';
                                    obj_Json_Tax_totales.local_total = parseFloat(importe_local).toFixed(2) || '0.00';


                                    //validar que la suma de desglose coincida con el total
                                    log.audit({title:'objivas',details:Object.keys(obj_Json_Tax_totales.rates_iva)});
                                    log.audit({title:'objivas',details:Object.keys(obj_Json_Tax_totales.rates_iva_data)});
                                    //log.audit({title:'objivas',details:Object.values(obj_Json_Tax_totales.rates_iva)});
                                    var tam_obj_totales_iva = Object.keys(obj_Json_Tax_totales.rates_iva).length;
                                    var sumas_ivas = 0;
                                    if(tam_obj_totales_iva>0) {
                                            for (var iva = 0; iva < tam_obj_totales_iva; iva++) {

                                                    sumas_ivas = sumas_ivas + parseFloat(obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]);
                                            }
                                            for (var iva = 0; iva < tam_obj_totales_iva; iva++) {
                                                    if (parseFloat(obj_Json_Tax_totales.iva_total) != sumas_ivas) {

                                                            var diferencia_imp = parseFloat(obj_Json_Tax_totales.iva_total)-sumas_ivas;

                                                            diferencia_imp = diferencia_imp.toFixed(2);
                                                            diferencia_imp = parseFloat(diferencia_imp);


                                                            if(Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva] == 0) {
                                                                    obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]] = 0;
                                                                    obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]] = 0;

                                                            }else{
                                                                    var ttt = Object.keys(obj_Json_Tax_totales.rates_iva);
                                                                    obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]] = parseFloat(obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]) + diferencia_imp;
                                                                    log.audit({title:'diferencia_imp',details:obj_Json_Tax_totales.rates_iva[Object.keys(obj_Json_Tax_totales.rates_iva)[iva]]});
                                                                    obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]] = parseFloat(obj_Json_Tax_totales.rates_iva_data[Object.keys(obj_Json_Tax_totales.rates_iva_data)[iva]]) + diferencia_imp;
                                                            }
                                                            obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iva]] = parseFloat(obj_Json_Tax_totales.bases_iva[Object.keys(obj_Json_Tax_totales.bases_iva)[iva]]) + diferencia_imp || 0;

                                                    }
                                            }


                                    }

                                    var tam_obj_totales_ieps = Object.keys(obj_Json_Tax_totales.rates_ieps).length;

                                    var sumas_ieps = 0;
                                    if(tam_obj_totales_ieps>0) {
                                            for (var ieps = 0; ieps < tam_obj_totales_ieps; ieps++) {
                                                    sumas_ieps = sumas_ieps + parseFloat(obj_Json_Tax_totales.rates_ieps[Object.keys(obj_Json_Tax_totales.rates_ieps)[ieps]]);

                                            }

                                            for (var ieps = 0; ieps < tam_obj_totales_ieps; ieps++) {
                                                    if (parseFloat(obj_Json_Tax_totales.ieps_total) != sumas_ieps) {

                                                            var diferencia_imp = parseFloat(obj_Json_Tax_totales.ieps_total) - sumas_ieps;
                                                            obj_Json_Tax_totales.rates_ieps[Object.keys(obj_Json_Tax_totales.rates_ieps)[ieps]] = (parseFloat(obj_Json_Tax_totales.rates_ieps[Object.keys(obj_Json_Tax_totales.rates_ieps)[ieps]]) + diferencia_imp).toFixed(2);
                                                            obj_Json_Tax_totales.rates_ieps_data[Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]] = (parseFloat(obj_Json_Tax_totales.rates_ieps_data[Object.keys(obj_Json_Tax_totales.rates_ieps_data)[ieps]]) + diferencia_imp).toFixed(2);
                                                            obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[ieps]] = (parseFloat(obj_Json_Tax_totales.bases_ieps[Object.keys(obj_Json_Tax_totales.bases_ieps)[ieps]]) + diferencia_imp).toFixed(2);

                                                    }
                                            }
                                    }

                                    var tam_obj_totales_local = Object.keys(obj_Json_Tax_totales.rates_local).length;

                                    var sumas_locales = 0;
                                    if(tam_obj_totales_local>0) {
                                            for (var loc = 0; loc < tam_obj_totales_local; loc++) {
                                                    sumas_locales = sumas_locales + parseFloat(obj_Json_Tax_totales.rates_local[Object.keys(obj_Json_Tax_totales.rates_local)[loc]]);
                                            }
                                            for (var loc = 0; loc < tam_obj_totales_local; loc++) {
                                                    if (parseFloat(obj_Json_Tax_totales.local_total) != sumas_locales) {

                                                            var diferencia_imp = parseFloat(obj_Json_Tax_totales.local_total) - sumas_locales;
                                                            obj_Json_Tax_totales.rates_local[Object.keys(obj_Json_Tax_totales.rates_local)[loc]] = parseFloat(obj_Json_Tax_totales.rates_local[Object.keys(obj_Json_Tax_totales.rates_local)[loc]]) + diferencia_imp;
                                                            obj_Json_Tax_totales.rates_local_data[Object.keys(obj_Json_Tax_totales.rates_local_data)[loc]] = parseFloat(obj_Json_Tax_totales.rates_local_data[Object.keys(obj_Json_Tax_totales.rates_local_data)[loc]]) + diferencia_imp;
                                                            obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]] = parseFloat(obj_Json_Tax_totales.bases_local[Object.keys(obj_Json_Tax_totales.bases_local)[loc]]) + diferencia_imp;

                                                    }
                                            }
                                    }

                                    var tam_obj_totales_ret = Object.keys(obj_Json_Tax_totales.rates_retencion).length;
                                    log.audit({title:'tam_obj_totales_ret',details:tam_obj_totales_ret});
                                    var sumas_ret = 0;
                                    if(tam_obj_totales_ret>0) {
                                            for (var ret = 0; ret < tam_obj_totales_ret; ret++) {
                                                    sumas_ret = sumas_ret + parseFloat(obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]]);


                                                    log.audit({title: 'sumas_ret', details: sumas_ret});
                                                    log.audit({
                                                            title: 'obj_Json_Tax_totales.retencion_total',
                                                            details: obj_Json_Tax_totales.retencion_total
                                                    });
                                            }
                                            for (var ret = 0; ret < tam_obj_totales_ret; ret++) {
                                                    if (parseFloat(obj_Json_Tax_totales.retencion_total) != sumas_ret) {

                                                            var diferencia_imp = parseFloat(obj_Json_Tax_totales.retencion_total) - sumas_ret;
                                                            log.audit({title: 'diferencia_imp', details: diferencia_imp});
                                                            obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]] = parseFloat(obj_Json_Tax_totales.rates_retencion[Object.keys(obj_Json_Tax_totales.rates_retencion)[ret]]) + diferencia_imp;
                                                            obj_Json_Tax_totales.rates_retencion_data[Object.keys(obj_Json_Tax_totales.rates_retencion_data)[ret]] = parseFloat(obj_Json_Tax_totales.rates_retencion_data[Object.keys(obj_Json_Tax_totales.rates_retencion_data)[ret]]) + diferencia_imp;
                                                            obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]] = parseFloat(obj_Json_Tax_totales.bases_retencion[Object.keys(obj_Json_Tax_totales.bases_retencion)[ret]]) + diferencia_imp;

                                                    }
                                            }
                                    }



                            }
                    }catch (error) {
                            log.audit({title:'error',details:error});

                    }
            }


            return {

                    beforeSubmit: beforeSubmit,

            };

    });