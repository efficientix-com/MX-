function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try {

        var reclasificar = transactionRecord.getFieldValue('custbody_efx_rec_reclasificar');
        var reclasificar_fraction = transactionRecord.getFieldValue('custbody_efx_rec_1_3');
        var reclasificar_same_tran = transactionRecord.getFieldValue('custbody_efx_rec_reclasificar_same');
        var transaccion = transactionRecord.getFieldValue('transactionnumber');
        var array_creditMemos = new Object();

        nlapiLogExecution('AUDIT', 'reclasificar:', JSON.stringify(reclasificar));
        if (reclasificar == 'T') {
            //obtener datos del registro donde se ejecuta el pluggin
            var context = nlapiGetContext();
            var existeSuiteTax = context.getFeature('tax_overhauling');
            var makeClassesMandatory = context.getPreference('classmandatory');
            var allowPerLineClasses = context.getPreference('classesperline');
            var makeDepartmentsMandatory = context.getPreference('deptmandatory');
            var allowPerLineDepartments = context.getPreference('deptsperline');
            var makeLocationsMandatory = context.getPreference('locmandatory');
            var allowPerLineLocations = context.getPreference('locsperline');
            var currency = transactionRecord.getFieldValue('currency');
            var exchangerate = transactionRecord.getFieldValue('exchangerate');
            var fechadepago = transactionRecord.getFieldValue('trandate');
            var account_payment = transactionRecord.getFieldValue('account');
            var tipotran = transactionRecord.getRecordType() || '';
            nlapiLogExecution('AUDIT', 'tipotran:', JSON.stringify(tipotran));
            if (tipotran == 'vendorprepaymentapplication') {
                var numberOfApply = transactionRecord.getLineItemCount('bill');
            } else {
                var numberOfApply = transactionRecord.getLineItemCount('apply');
            }

            var factoraje = transactionRecord.getFieldValue('custbody_efx_fe_chbx_factorage');
            nlapiLogExecution('AUDIT', 'factoraje:', JSON.stringify(factoraje));
            var classId = '';
            var departmentId = '';
            var locationId = '';
            var suma_factor = 0;
            if (factoraje == 'T') {
                var comision_factor = transactionRecord.getFieldValue('custbody_efx_fe_comisiones_fact') || 0;
                suma_factor = parseFloat(comision_factor) * parseFloat(exchangerate);
            }
            nlapiLogExecution('AUDIT', 'reclasificar_same_tran:', reclasificar_same_tran);
            if (reclasificar_same_tran == 'T') {
                numberOfApply = -1;
            }

            nlapiLogExecution('AUDIT', 'numberOfApply: ', JSON.stringify(numberOfApply));
            if (numberOfApply > 0) {
                if (makeClassesMandatory || allowPerLineClasses) {
                    classId = transactionRecord.getFieldValue('class');
                    if (classId) {
                        classId = parseInt(classId);
                    }
                }
                if (makeDepartmentsMandatory || allowPerLineDepartments) {
                    departmentId = transactionRecord.getFieldValue('department');
                    if (departmentId) {
                        departmentId = parseInt(departmentId);
                    }
                }
                if (makeLocationsMandatory || allowPerLineLocations) {
                    locationId = transactionRecord.getFieldValue('location');
                    if (locationId) {
                        locationId = parseInt(locationId);
                    }
                }
            } else {
                if (makeClassesMandatory || allowPerLineClasses) {
                    //classId = getClassForItem();
                    classId = transactionRecord.getFieldValue('class');
                    if (classId) {
                        classId = parseInt(classId);
                    }
                }
                if (makeDepartmentsMandatory || allowPerLineDepartments) {
                    //departmentId = getClassForItem();
                    departmentId = transactionRecord.getFieldValue('department');
                    if (departmentId) {
                        departmentId = parseInt(departmentId);
                    }
                }
                if (makeLocationsMandatory || allowPerLineLocations) {
                    //locationId = getClassForItem();
                    locationId = transactionRecord.getFieldValue('location');
                    if (locationId) {
                        locationId = parseInt(locationId);
                    }
                }
            }
            var tax_code_expense = {};
            var apply = {};
            var typeapply = '';
            var idChildTransaction = [];
            for (var t = 1; t <= numberOfApply; t++) {
                if (tipotran == 'vendorprepaymentapplication') {
                    if (transactionRecord.getLineItemValue('bill', 'apply', t) == 'T' && transactionRecord.getLineItemValue('apply', 'trantype', t) != 'Journal') {
                        idChildTransaction.push(transactionRecord.getLineItemValue('bill', 'internalid', t) || '');
                    }
                } else {
                    nlapiLogExecution('AUDIT', 'typeTranLine: ', typeTranLine);
                    if (transactionRecord.getLineItemValue('apply', 'apply', t) == 'T' && (typeTranLine != 'CustRfnd') && (typeTranLine != 'Journal')) {
                        idChildTransaction.push(transactionRecord.getLineItemValue('apply', 'internalid', t) || '');
                    }
                }
            }
            if (numberOfApply > 0) {
                array_creditMemos = getCreditMemoId(idChildTransaction, array_creditMemos, fechadepago);
                nlapiLogExecution('AUDIT', 'array_creditMemos: ', JSON.stringify(array_creditMemos));
            }

            for (var x = 1; x <= numberOfApply; x++) {
                if (tipotran == 'vendorprepaymentapplication') {
                    if (transactionRecord.getLineItemValue('bill', 'apply', x) == 'T' && transactionRecord.getLineItemValue('apply', 'trantype', x) != 'Journal') {
                        //se obtienen datos de la linea de transaccion aplicada
                        apply[x] = {
                            internalid: transactionRecord.getLineItemValue('bill', 'internalid', x) || '',
                            amount: transactionRecord.getLineItemValue('bill', 'amount', x) || '',
                            disc: transactionRecord.getLineItemValue('bill', 'disc', x) || '',
                            total: transactionRecord.getLineItemValue('bill', 'total', x) || '',
                            trantype: transactionRecord.getLineItemValue('bill', 'trantype', x) || '',
                            tipo_cambio_pago: transactionRecord.getFieldValue('exchangerate') || '',
                            porcentaje: 0,
                            account_payment: account_payment
                        };
                        //se calcula el porcentaje de monto aplicado
                        if (factoraje == 'T') {
                            apply[x].amount = parseFloat(apply[x].amount) + parseFloat(apply[x].disc);

                            apply[x].porcentaje = apply[x].amount / apply[x].total;

                        } else {

                            apply[x].porcentaje = apply[x].amount / apply[x].total;

                        }
                        typeapply = apply[x].trantype;
                        //Se guardan los id de las transacciones aplicadas
                        //idChildTransaction.push(apply[x].internalid);
                    }
                } else {
                    var typeTranLine = transactionRecord.getLineItemValue('apply', 'trantype', x) || '';
                    if (transactionRecord.getLineItemValue('apply', 'apply', x) == 'T' && (typeTranLine != 'CustRfnd') && (typeTranLine != 'Journal')) {
                        //se obtienen datos de la linea de transaccion aplicada
                        apply[x] = {
                            internalid: transactionRecord.getLineItemValue('apply', 'internalid', x) || '',
                            amount: transactionRecord.getLineItemValue('apply', 'amount', x) || '',
                            disc: transactionRecord.getLineItemValue('apply', 'disc', x) || '',
                            total: transactionRecord.getLineItemValue('apply', 'total', x) || '',
                            trantype: transactionRecord.getLineItemValue('apply', 'trantype', x) || '',
                            tipo_cambio_pago: transactionRecord.getFieldValue('exchangerate') || '',
                            porcentaje: 0,
                            account_payment: account_payment
                        };
                        //se calcula el porcentaje de monto aplicado
                        if (factoraje == 'T') {
                            apply[x].amount = parseFloat(apply[x].amount) + parseFloat(apply[x].disc);
                            if (array_creditMemos) {
                                apply[x].porcentaje = (parseFloat(apply[x].amount) + array_creditMemos.totalCreditMemos) / apply[x].total;
                            } else {
                                apply[x].porcentaje = apply[x].amount / apply[x].total;
                            }
                        } else {
                            var llaves = Object.keys(array_creditMemos);
                            if (array_creditMemos && llaves.length > 0) {
                                nlapiLogExecution('AUDIT', 'apply[x].amount: ', apply[x].amount);
                                nlapiLogExecution('AUDIT', 'apply[x].total: ', apply[x].total);
                                var tam_array_creditMemos = Object.keys(array_creditMemos.applydata).length;
                                for (var j = 0; j < tam_array_creditMemos; j++) {
                                    if (array_creditMemos.applydata[Object.keys(array_creditMemos.applydata)[j]].factura == apply[x].internalid) {
                                        nlapiLogExecution('AUDIT', 'array_creditMemos.applydata[Object.keys(array_creditMemos.applydata)[j]].total: ', array_creditMemos.applydata[Object.keys(array_creditMemos.applydata)[j]].total);
                                        apply[x].porcentaje = (parseFloat(apply[x].amount) - parseFloat(array_creditMemos.applydata[Object.keys(array_creditMemos.applydata)[j]].total)) / apply[x].total;
                                    }
                                }
                                nlapiLogExecution('AUDIT', 'apply[x].porcentaje: ', apply[x].porcentaje);
                            } else {
                                apply[x].porcentaje = apply[x].amount / apply[x].total;
                            }
                        }
                        typeapply = apply[x].trantype;
                        //Se guardan los id de las transacciones aplicadas
                        //idChildTransaction.push(apply[x].internalid);
                    }
                }

            }

            if (numberOfApply < 0) {
                apply[1] = {
                    internalid: transactionRecord.getFieldValue('id') || '',
                    amount: transactionRecord.getFieldValue('total') || '',
                    total: transactionRecord.getFieldValue('total') || '',
                    trantype: transactionRecord.getRecordType() || '',
                    tipo_cambio_pago: transactionRecord.getFieldValue('exchangerate') || '',
                    porcentaje: 0,
                    account_payment: account_payment
                };
                apply[1].porcentaje = apply[1].amount / apply[1].total;
                typeapply = apply[1].trantype;
                //Se guardan los id de las transacciones aplicadas
                if (apply[1].trantype != 'check') {
                    idChildTransaction.push(apply[1].internalid);
                }
                //para cheques
                nlapiLogExecution('AUDIT', 'apply[1].trantype: ', JSON.stringify(apply[1].trantype));
                if (!apply[1].internalid && apply[1].trantype == 'check') {

                    var numberOfExpense = transactionRecord.getLineItemCount('expense');
                    var numberOfItem = transactionRecord.getLineItemCount('item');
                    nlapiLogExecution('AUDIT', 'numberOfExpense: ', JSON.stringify(numberOfExpense));

                    tax_code_expense = {
                    }
                    for (var e = 1; e <= numberOfExpense; e++) {
                        var impuesto = transactionRecord.getLineItemValue('expense', 'taxcode', e) || '';
                        nlapiLogExecution('AUDIT', 'impuesto: ', JSON.stringify(impuesto));
                        tax_code_expense[impuesto] = new Object();
                        tax_code_expense[impuesto].taxcode = transactionRecord.getLineItemValue('expense', 'taxcode', e) || '';
                        tax_code_expense[impuesto].taxcode_display = transactionRecord.getLineItemValue('expense', 'taxcode_display', e) || '';
                        tax_code_expense[impuesto].monto_tax = transactionRecord.getLineItemValue('expense', 'tax1amt', e) || '';
                        tax_code_expense[impuesto].tipo_cambio = apply[1].tipo_cambio_pago;
                    }
                }
            }

            // if(typeapply=='vendorprepaymentapplication'){
            //     typeapply='vprepapp';
            // }
            nlapiLogExecution('AUDIT', 'apply: ', JSON.stringify(apply));
            nlapiLogExecution('AUDIT', 'idChildTransaction: ', JSON.stringify(idChildTransaction));
            //var tipo_transaccion = transactionRecord.getFieldValue('type');

            //se obtiene informacion de los record de configuracion
            var config = getConfig(typeapply, account_payment);
            nlapiLogExecution('AUDIT', 'Config: ', JSON.stringify(config));

            var ismultibook = ismultiBook(typeapply);
            //libros

            if (ismultibook) {
                if (ismultibook.secundaryBooks == 'T') {
                    nlapiLogExecution('AUDIT', 'book', book);
                    var bookId = book.getId();

                    nlapiLogExecution('AUDIT', 'bookId', bookId);
                    var primarybook = book.isPrimary()

                    nlapiLogExecution('AUDIT', 'primarybook', primarybook);
                }

            }

            //
            var appliesDataNC = {};
            if (numberOfApply > 0) {
                //array_creditMemos = getCreditMemoId(idChildTransaction,array_creditMemos);
                nlapiLogExecution('AUDIT', 'array_creditMemos: ', JSON.stringify(array_creditMemos));
                if (array_creditMemos.applydata) {

                    var applyNC = array_creditMemos.applydata;

                    appliesDataNC = getAppliesData(config, applyNC, array_creditMemos.arrayNC, tax_code_expense, 'creditmemo', existeSuiteTax);
                    nlapiLogExecution('AUDIT', 'appliesDataNC: ', JSON.stringify(appliesDataNC));
                }

            }

            //Se obtiene informacion de las transacciones aplicadas
            var appliesData = getAppliesData(config, apply, idChildTransaction, tax_code_expense, typeapply, existeSuiteTax);
            nlapiLogExecution('AUDIT', 'appliesData: ', JSON.stringify(appliesData));
            if (appliesDataNC) {
                var tam_appliesDataNC = Object.keys(appliesDataNC).length;
                var tam_appliesData = Object.keys(appliesData).length;
                nlapiLogExecution('AUDIT', 'tam_appliesDataNC: ', JSON.stringify(tam_appliesDataNC));
                nlapiLogExecution('AUDIT', 'tam_appliesData: ', JSON.stringify(tam_appliesData));
                for (var i = 0; i < tam_appliesData; i++) {
                    for (var x = 0; x < tam_appliesDataNC; x++) {
                        nlapiLogExecution('AUDIT', 'appliesData[Object.keys(appliesData)[i]].id: ', JSON.stringify(appliesData[Object.keys(appliesData)[i]].id));
                        nlapiLogExecution('AUDIT', 'appliesDataNC[Object.keys(appliesDataNC)[x]].apply.factura: ', JSON.stringify(appliesDataNC[Object.keys(appliesDataNC)[x]].apply.factura));
                        if (appliesData[Object.keys(appliesData)[i]].id == appliesDataNC[Object.keys(appliesDataNC)[x]].apply.factura) {
                            var tam_appliesDataNC_taxcode = Object.keys(appliesDataNC[Object.keys(appliesDataNC)[x]].taxcode).length;
                            var tam_appliesData_taxcode = Object.keys(appliesData[Object.keys(appliesData)[i]].taxcode).length;
                            for (var ad = 0; ad < tam_appliesData_taxcode; ad++) {
                                nlapiLogExecution('AUDIT', 'tam_appliesData_taxcode: ', JSON.stringify(appliesData[Object.keys(appliesData)[i]].taxcode[Object.keys(appliesData[Object.keys(appliesData)[i]].taxcode)[ad]]));
                                var appliesData_taxcode = appliesData[Object.keys(appliesData)[i]].taxcode[Object.keys(appliesData[Object.keys(appliesData)[i]].taxcode)[ad]].taxcode;
                                for (var adnc = 0; adnc < tam_appliesDataNC_taxcode; adnc++) {
                                    nlapiLogExecution('AUDIT', 'tam_appliesDataNC_taxcode: ', JSON.stringify(appliesDataNC[Object.keys(appliesDataNC)[x]].taxcode[Object.keys(appliesDataNC[Object.keys(appliesDataNC)[x]].taxcode)[adnc]]));
                                    var appliesDataNC_taxcode = appliesDataNC[Object.keys(appliesDataNC)[x]].taxcode[Object.keys(appliesDataNC[Object.keys(appliesDataNC)[x]].taxcode)[adnc]].taxcode;
                                    if (appliesData_taxcode == appliesDataNC_taxcode) {
                                        var appliesData_monto_tax = parseFloat(appliesData[Object.keys(appliesData)[i]].taxcode[Object.keys(appliesData[Object.keys(appliesData)[i]].taxcode)[ad]].monto_tax);
                                        var appliesDataNC_monto_tax = parseFloat(appliesDataNC[Object.keys(appliesDataNC)[x]].taxcode[Object.keys(appliesDataNC[Object.keys(appliesDataNC)[x]].taxcode)[adnc]].monto_tax);
                                        var monto_tax_final = appliesData_monto_tax + appliesDataNC_monto_tax;
                                        monto_tax_final = monto_tax_final.toFixed(2);
                                        appliesData[Object.keys(appliesData)[i]].taxcode[Object.keys(appliesData[Object.keys(appliesData)[i]].taxcode)[ad]].monto_tax = monto_tax_final;
                                    }
                                }
                            }
                        }

                    }
                }
            }
            nlapiLogExecution('AUDIT', 'appliesData - post NC: ', JSON.stringify(appliesData));

            //se organiza la informacion de configuracion y datos para aplicar la reclasificacion
            var reclasificar = reclasificarData(config, appliesData);
            nlapiLogExecution('AUDIT', 'reclasificar: ', JSON.stringify(reclasificar));

            var segmentos = getSegments();
            nlapiLogExecution('AUDIT', 'segmentos: ', JSON.stringify(segmentos));

            //Se aplican los montos a cuentas para reclasificacion con el pluggin
            reclasificacionProcess(reclasificar, reclasificar_fraction, standardLines, customLines, book, suma_factor, makeClassesMandatory, allowPerLineClasses, classId, makeDepartmentsMandatory, allowPerLineDepartments, departmentId, makeLocationsMandatory, allowPerLineLocations, locationId, segmentos, ismultibook);

        } else {
            nlapiLogExecution('AUDIT', 'reclasificar: ', 'No se escogió reclasificar la transacción ' + transaccion + '.');
        }

    } catch (e) {
        nlapiLogExecution('ERROR', 'Error: ', JSON.stringify(e));
    }
}

//Funcion para obtener la informacion de configuracion de impuestos
function getConfig(tipo_transaccion, account_payment) {

    nlapiLogExecution('DEBUG', 'tipo_transaccion', JSON.stringify(tipo_transaccion));
    try {
        var settings = {
            object: {},
            array: []
        };

        //Se generan filtros para la busqueda de acuerdo al tipo de transaccion a reclasificar
        var filters = new Array();
        filters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');
        filters[1] = new nlobjSearchFilter("custrecord_efx_rec_codetype", "custrecord_efx_rec_line", "is", tipo_transaccion);

        //Se obtienen las columnas necesarias para la reclasificacion
        var columns = new Array();
        columns[0] = new nlobjSearchColumn('custrecord_efx_rec_taxcode');
        columns[1] = new nlobjSearchColumn('custrecord_efx_rec_ctaorigen');
        columns[2] = new nlobjSearchColumn('custrecord_efx_rec_ctadestino');
        columns[3] = new nlobjSearchColumn('custrecord_efx_rec_fraccion_cta');
        columns[4] = new nlobjSearchColumn('custrecord_efx_rec_fraccion');
        columns[5] = new nlobjSearchColumn('custrecord_efx_rec_tipo', 'custrecord_efx_rec_line');
        columns[6] = new nlobjSearchColumn('custrecord_efx_rec_codetype', 'custrecord_efx_rec_line');
        columns[7] = new nlobjSearchColumn('custrecord_efx_rec_location', 'custrecord_efx_rec_line');
        columns[8] = new nlobjSearchColumn('custrecord_efx_rec_department', 'custrecord_efx_rec_line');
        columns[9] = new nlobjSearchColumn('custrecord_efx_rec_class', 'custrecord_efx_rec_line');
        columns[10] = new nlobjSearchColumn('custrecord_efx_rec_secundarybooks', 'custrecord_efx_rec_line');
        columns[11] = new nlobjSearchColumn('custrecord_efx_rec_acreditable');
        columns[12] = new nlobjSearchColumn('custrecord_efx_rec_pgorigen');
        columns[13] = new nlobjSearchColumn('custrecord_efx_rec_perdida');
        columns[14] = new nlobjSearchColumn('custrecord_efx_rec_ganancia');

        //Se genera la busqueda del registro EFX REC-Reclasificacion Config Detail


        var search = nlapiSearchRecord('customrecord_efx_rec_config_detail', null, filters, columns);

        for (var x = 0; x < search.length; x++) {

            //Se guardan los datos de la busqueda en un JSON de configuracion
            settings.object[search[x].id] = {
                tipo: search[x].getText('custrecord_efx_rec_tipo', 'custrecord_efx_rec_line') || '',
                tipo_code: search[x].getValue('custrecord_efx_rec_codetype', 'custrecord_efx_rec_line') || '',
                location: search[x].getValue('custrecord_efx_rec_location', 'custrecord_efx_rec_line') || '',
                department: search[x].getValue('custrecord_efx_rec_department', 'custrecord_efx_rec_line') || '',
                clase: search[x].getValue('custrecord_efx_rec_class', 'custrecord_efx_rec_line') || '',
                secundaryBooks: search[x].getValue('custrecord_efx_rec_secundarybooks', 'custrecord_efx_rec_line') || '',
                tax_code: search[x].getValue('custrecord_efx_rec_taxcode') || '',
                tax_code_text: search[x].getText('custrecord_efx_rec_taxcode') || '',
                cta_origen: search[x].getValue('custrecord_efx_rec_ctaorigen') || '',
                cta_destino: search[x].getValue('custrecord_efx_rec_ctadestino') || '',
                cta_fraction: search[x].getValue('custrecord_efx_rec_fraccion_cta') || '',
                tax_fraction: search[x].getValue('custrecord_efx_rec_fraccion') || '',
                acreditable: search[x].getValue('custrecord_efx_rec_acreditable') || '',
                pgorigen_line: search[x].getValue('custrecord_efx_rec_pgorigen') || account_payment,
                perdida_line: search[x].getValue('custrecord_efx_rec_perdida') || '',
                ganancia_line: search[x].getValue('custrecord_efx_rec_ganancia') || '',
            };
            //Se genera un array de taxcode usados para un filtro de busqueda mas adelante
            settings.array.push(settings.object[search[x].id].tax_code);
        }
        nlapiLogExecution('DEBUG', 'settings', JSON.stringify(settings));

        return settings;
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error - getConfig: ', JSON.stringify(e));
    }
}

//Funsion para obtener los datos de las transacciones aplicadas
function getAppliesData(config, apply, idChildTransaction, tax_code_expense, typeapply, existeSuiteTax) {
    var respuesta = {};
    nlapiLogExecution('DEBUG', 'settings', idChildTransaction);
    nlapiLogExecution('DEBUG', 'existeSuiteTax', existeSuiteTax);
    if (idChildTransaction.length > 0) {
        try {


            //Se generan filtros para obtener informacion de las transacciones aplicadas
            var filters = new Array();
            filters.push(new nlobjSearchFilter('internalid', null, 'anyof', idChildTransaction));
            filters.push(new nlobjSearchFilter('taxline', null, 'is', 'T'));
            if (existeSuiteTax) {
                filters.push(new nlobjSearchFilter('item', null, 'anyof', config.array));
            } else {
                filters.push(new nlobjSearchFilter('taxitem', null, 'anyof', config.array));
            }

            //Se generan las columnas de datos a usar de las transacciones
            var columns = new Array();
            if (existeSuiteTax) {
                columns.push(new nlobjSearchColumn('transactionlinetype'));
                columns.push(new nlobjSearchColumn('taxline'));
                columns.push(new nlobjSearchColumn('item'));
                columns.push(new nlobjSearchColumn('fxamount'));
                columns.push(new nlobjSearchColumn('exchangerate'));
                columns.push(new nlobjSearchColumn('type'));
            } else {
                columns.push(new nlobjSearchColumn('transactionlinetype'));
                columns.push(new nlobjSearchColumn('taxline'));
                columns.push(new nlobjSearchColumn('taxcode'));
                columns.push(new nlobjSearchColumn('netamountnotax'));
                columns.push(new nlobjSearchColumn('fxamount'));
                columns.push(new nlobjSearchColumn('exchangerate'));
                columns.push(new nlobjSearchColumn('type'));
            }

            //Se genera una busqueda de las transacciones aplicadas
            nlapiLogExecution('AUDIT', 'filters - getAppliesData: ', filters);
            var search = nlapiSearchRecord('transaction', null, filters, columns);


            for (var x = 0; x < search.length; x++) {
                //Se guardan los datos de apply en el objeto respuesta de acuerdo al id de transaccion
                if (!respuesta[search[x].id]) {
                    for (var idApply in apply) {
                        if (apply[idApply].internalid == search[x].id) {
                            respuesta[search[x].id] = {
                                id: search[x].id || '',
                                tipo: search[x].getValue('type') || '',
                                apply: apply[idApply],
                                taxcode: {}
                            };
                        }
                    }
                }

                //llena el atributo taxcode inicializado en la condicion anterior
                if (existeSuiteTax) {
                    if (!respuesta[search[x].id].taxcode[search[x].getValue('item')]) {
                        respuesta[search[x].id].taxcode[search[x].getValue('item')] = {
                            taxcode: search[x].getValue('item') || '',
                            taxcode_display: search[x].getText('item') || '',
                            monto_tax: search[x].getValue('fxamount') || '',
                            tipo_cambio: search[x].getValue('exchangerate') || '',
                        }
                    }
                } else {
                    if (!respuesta[search[x].id].taxcode[search[x].getValue('taxcode')]) {
                        respuesta[search[x].id].taxcode[search[x].getValue('taxcode')] = {
                            taxcode: search[x].getValue('taxcode') || '',
                            taxcode_display: search[x].getText('taxcode') || '',
                            monto_tax: search[x].getValue('fxamount') || '',
                            tipo_cambio: search[x].getValue('exchangerate') || '',
                        }
                    }
                }
            }
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error - getAppliesData: ', JSON.stringify(e));
        } finally {
            nlapiLogExecution('AUDIT', 'Finally - getAppliesData: ', JSON.stringify(respuesta));
            return respuesta;
        }
    } else {
        nlapiLogExecution('AUDIT', 'apply.trantype: ', JSON.stringify(apply.trantype));
        nlapiLogExecution('AUDIT', 'apply: ', JSON.stringify(apply));
        nlapiLogExecution('AUDIT', 'tax_code_expense: ', JSON.stringify(tax_code_expense));
        if (typeapply == 'check') {
            var aplica = {}
            for (var idApply in apply) {
                aplica = apply[idApply];
            }

            respuesta = {
                undefined: {
                    id: 'undefined',
                    tipo: 'Check',
                    apply: aplica,
                    taxcode: tax_code_expense
                }
            }
            nlapiLogExecution('AUDIT', 'respuesta: ', JSON.stringify(respuesta));
            return respuesta;
        }
    }
}

//Funcion para ordenar y obtener los datos para la reclasificacion final
function reclasificarData(config, appliesData) {
    try {
        //Inicializa variables
        var tax_total = 0;
        var tax_total_pago = 0;
        var codigos_impuesto = [];
        var tipo_cambio_pago = 0;
        var impuestos_totales = 0;
        var taxcode_Tcambio = new Array();
        var taxcode_TcambioPago = new Array();
        var cont = 0;
        var percent = 0;

        //Calculo de montos de transacciones para diferencia cambiaria
        for (var appliesId in appliesData) {
            impuestos_totales = 0;
            var t_cambioPago = parseFloat(appliesData[appliesId].apply.tipo_cambio_pago);
            var percent = parseFloat(appliesData[appliesId].apply.porcentaje);

            //Ordena los montos por tipo de impuesto
            for (var impuesto in appliesData[appliesId].taxcode) {
                var t_cambio = parseFloat(appliesData[appliesId].taxcode[impuesto].tipo_cambio);
                impuestos_totales = impuestos_totales + parseFloat(appliesData[appliesId].taxcode[impuesto].monto_tax);
                codigos_impuesto.push(appliesData[appliesId].taxcode[impuesto].taxcode);
                tipo_cambio_pago = appliesData[appliesId].apply.tipo_cambio_pago;
            }

            taxcode_Tcambio[cont] = (impuestos_totales * t_cambio) * percent;
            taxcode_TcambioPago[cont] = (impuestos_totales * t_cambioPago) * percent;
            cont++;
        }

        var codigos = [];

        //Genera un array de codigos de impuesto sin repetir
        for (var x = 0; x < codigos_impuesto.length; x++) {
            if (codigos.indexOf(codigos_impuesto[x]) == -1) {
                codigos.push(codigos_impuesto[x]);
            }
        }

        var codigos_config = {};
        //Genera un objeto con informacion por codigo de impuesto
        for (var configuracion in config.object) {
            for (var x = 0; x < codigos.length; x++) {
                if (config.object[configuracion].tax_code == codigos[x]) {
                    codigos_config[config.object[configuracion].tax_code] = config.object[configuracion];
                }
            }
        }
        nlapiLogExecution('AUDIT', 'codigos_config - reclasificarData: ', JSON.stringify(codigos_config));

        var reclasificacion_resultado = {};

        //calcular diferencia cambiaria
        var dif_c_origen = 0;
        var dif_c_destino = 0;
        var diferencia_cambiaria = 0;

        //Se suman los montos de impuesto de transacciones aplicadas en una variable para diferencia cambiaria
        for (var i = 0; i < taxcode_Tcambio.length; i++) {
            dif_c_origen = parseFloat(dif_c_origen) + parseFloat(taxcode_Tcambio[i]);
        }

        //Se suman los montos de impuesto de transaccion original en una variable para diferencia cambiaria
        for (var x = 0; x < taxcode_TcambioPago.length; x++) {
            dif_c_destino = parseFloat(dif_c_destino) + parseFloat(taxcode_TcambioPago[x]);
        }

        //Calculo de diferencia cambiaria con transacciones aplicadas menos transaccion que aplica
        diferencia_cambiaria = dif_c_origen - dif_c_destino;

        var porcentaje = 0;
        var t_cambio_pagos = 0;
        var t_cambio_facturas = 0;

        //Genera un JSON con la informacion de configuracion, montos, tipo de cambio y diferencias cambiarias
        //por impuesto
        for (var tax_config in codigos_config) {
            var tax_totales = 0;
            var pre_tax_totales = 0;
            var dif_cambiaria_impuesto_factura = 0;
            var dif_cambiaria_impuesto_pago = 0;
            var dif_cambiaria_impuesto_calculo = 0;
            var dif_cambiaria_impuesto_total = 0;
            for (var applies_config in appliesData) {
                porcentaje = parseFloat(appliesData[applies_config].apply.porcentaje);
                t_cambio_pagos = parseFloat(appliesData[applies_config].apply.tipo_cambio_pago);
                nlapiLogExecution('AUDIT', 'porcentaje - reclasificarData: ', JSON.stringify(porcentaje));
                for (var tax_applies in appliesData[applies_config].taxcode) {
                    if (codigos_config[tax_config].tax_code == appliesData[applies_config].taxcode[tax_applies].taxcode) {

                        t_cambio_facturas = parseFloat(appliesData[applies_config].taxcode[tax_applies].tipo_cambio);

                        if (!reclasificacion_resultado[tax_config]) {
                            reclasificacion_resultado[tax_config] = {
                                configuracion: {},
                                tax_total: 0,
                                diferencia_cambiaria: 0,
                                tipo_cambio_pago: 0
                            }
                        }

                        reclasificacion_resultado[tax_config].configuracion = codigos_config[tax_config];
                        reclasificacion_resultado[tax_config].tipo_cambio_pago = tipo_cambio_pago;
                        //Sumariza los totales por impuesto

                        pre_tax_totales = parseFloat(appliesData[applies_config].taxcode[tax_applies].monto_tax) * parseFloat(porcentaje);
                        dif_cambiaria_impuesto_factura = pre_tax_totales * t_cambio_pagos;
                        dif_cambiaria_impuesto_pago = pre_tax_totales * t_cambio_facturas;
                        nlapiLogExecution('AUDIT', 'dif_cambiaria_impuesto_factura - reclasificarData: ', JSON.stringify(dif_cambiaria_impuesto_factura));
                        nlapiLogExecution('AUDIT', 'dif_cambiaria_impuesto_pago - reclasificarData: ', JSON.stringify(dif_cambiaria_impuesto_pago));
                        dif_cambiaria_impuesto_calculo = dif_cambiaria_impuesto_pago - dif_cambiaria_impuesto_factura;
                        dif_cambiaria_impuesto_total = parseFloat(dif_cambiaria_impuesto_total) + dif_cambiaria_impuesto_calculo;

                        tax_totales = parseFloat(tax_totales) + pre_tax_totales;
                        reclasificacion_resultado[tax_config].configuracion.diferencia_cambiaria = diferencia_cambiaria;
                    }
                }
            }
            nlapiLogExecution('AUDIT', 'tax_totales - reclasificarData: ', JSON.stringify(tax_totales));
            reclasificacion_resultado[tax_config].tax_total = tax_totales;
            reclasificacion_resultado[tax_config].diferencia_cambiaria = dif_cambiaria_impuesto_total;
        }
        nlapiLogExecution('AUDIT', 'codigos_config - reclasificarData: ', JSON.stringify(reclasificacion_resultado));

        return reclasificacion_resultado;

    } catch (e) {
        nlapiLogExecution('ERROR', 'Error - reclasificarData: ', JSON.stringify(e));
        return {};
    }
}

//Funcion donde se generan las lineas de impacto GL con la informacion generada anteriormente
function reclasificacionProcess(reclasificar, reclasificar_fraction, standardLines, customLines, book, suma_factor, makeClassesMandatory, allowPerLineClasses, classId, makeDepartmentsMandatory, allowPerLineDepartments, departmentId, makeLocationsMandatory, allowPerLineLocations, locationId, segmentos, ismultibook) {
    try {

        var monto = 0;
        var cta_origen = 0;
        var cta_destino = 0;
        var dif_cambiaria = 0;
        // var pgorigen = '';
        // var perdidaDestino = '';
        // var gananciaDestino = '';
        var fraction = 0;
        var cuenta_fraction = 0;
        var t_cambio_pago = 0;
        var imp_acreditable = '';
        var location_rec = '';
        var department_rec = '';
        var class_rec = '';
        nlapiLogExecution('AUDIT', 'reclasificar - reclasificacionProcess: ', JSON.stringify(reclasificar));
        nlapiLogExecution('AUDIT', 'classId', JSON.stringify(classId));
        nlapiLogExecution('AUDIT', 'departmentId', JSON.stringify(departmentId));
        nlapiLogExecution('AUDIT', 'locationId', JSON.stringify(locationId));
        //Generará lineas GL por impuesto
        for (var reclasificarId in reclasificar) {
            if (reclasificar[reclasificarId].tax_total != 0) {
                //Calcula el monto con el tipo de cambio
                t_cambio_pago = parseFloat(reclasificar[reclasificarId].tipo_cambio_pago);
                if (t_cambio_pago) {
                    monto = reclasificar[reclasificarId].tax_total * t_cambio_pago;
                } else {
                    monto = reclasificar[reclasificarId].tax_total;
                }

                dif_cambiaria = reclasificar[reclasificarId].diferencia_cambiaria;
                // pgorigen = parseInt(reclasificar[reclasificarId].configuracion.pg_origen);
                // perdidaDestino = parseInt(reclasificar[reclasificarId].configuracion.perdida_destino);
                // gananciaDestino = parseInt(reclasificar[reclasificarId].configuracion.ganancia_destino);
                cta_origen = parseInt(reclasificar[reclasificarId].configuracion.cta_origen);
                cta_destino = parseInt(reclasificar[reclasificarId].configuracion.cta_destino);
                fraction = parseFloat(reclasificar[reclasificarId].configuracion.tax_fraction);
                cuenta_fraction = parseInt(reclasificar[reclasificarId].configuracion.cta_fraction);
                imp_acreditable = reclasificar[reclasificarId].configuracion.acreditable;

                pgorigen_line = parseInt(reclasificar[reclasificarId].configuracion.pgorigen_line);
                perdida_line = parseInt(reclasificar[reclasificarId].configuracion.perdida_line);
                ganancia_line = parseInt(reclasificar[reclasificarId].configuracion.ganancia_line);
                location_rec = parseInt(reclasificar[reclasificarId].configuracion.location);
                department_rec = parseInt(reclasificar[reclasificarId].configuracion.department);
                class_rec = parseInt(reclasificar[reclasificarId].configuracion.clase);

                if (reclasificar_fraction == "T" && fraction && cuenta_fraction) {
                    monto = monto.toFixed(2);
                    monto = parseFloat(monto);
                    var diferencia_frac = monto * (1 / fraction);
                    var monto_fraction = monto - diferencia_frac;

                    nlapiLogExecution('AUDIT', 'diferencia_frac - reclasificacionProcess: ', JSON.stringify(diferencia_frac));
                    nlapiLogExecution('AUDIT', 'monto_fraction - reclasificacionProcess: ', JSON.stringify(monto_fraction));

                    if (reclasificar[reclasificarId].tax_total > 0) {

                        /*Creacion de Registro del Debit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cta_origen);
                        newLine.setDebitAmount(monto_fraction);
                        newLine.setMemo('Reclasifica - Debit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }

                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                if (department_rec) {
                                    newLine.setDepartmentId(department_rec);
                                }
                            }
                        }

                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }

                        /*Creacion de Registro del Debit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cuenta_fraction);
                        newLine.setDebitAmount(diferencia_frac);
                        newLine.setMemo('Reclasifica - 1/' + fraction + ' - Debit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }
                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                if (department_rec) {
                                    newLine.setDepartmentId(department_rec);
                                }
                            }
                        }
                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }

                        /*Creacion de Registro del Credit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cta_destino);
                        newLine.setCreditAmount(monto);
                        newLine.setMemo('Reclasifica - Credit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }
                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                if (department_rec) {
                                    newLine.setDepartmentId(department_rec);
                                }
                            }
                        }
                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }

                    } else {
                        monto = monto * -1;
                        var diferencia_frac = monto * (1 / fraction);
                        var monto_fraction = monto - diferencia_frac;
                        /*Creacion de Registro del Debit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cta_destino);
                        newLine.setDebitAmount(monto);
                        newLine.setMemo('Reclasifica - Debit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }
                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                if (department_rec) {
                                    newLine.setDepartmentId(department_rec);
                                }
                            }
                        }
                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }

                        /*Creacion de Registro del Credit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cta_origen);
                        newLine.setCreditAmount(monto_fraction);
                        newLine.setMemo('Reclasifica - Credit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }
                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                newLine.setDepartmentId(department_rec);
                            }
                        }
                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }

                        /*Creacion de Registro del Credit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cuenta_fraction);
                        newLine.setCreditAmount(diferencia_frac);
                        newLine.setMemo('Reclasifica - 1/' + fraction + ' - Credit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }
                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                newLine.setDepartmentId(department_rec);
                            }
                        }
                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }

                    }

                } else {


                    nlapiLogExecution('AUDIT', 'reclasificar - cta_origen ', JSON.stringify(reclasificar[reclasificarId].configuracion.cta_origen));
                    nlapiLogExecution('AUDIT', 'reclasificar - monto ', JSON.stringify(monto));
                    nlapiLogExecution('AUDIT', 'reclasificar - cta_destino ', JSON.stringify(reclasificar[reclasificarId].configuracion.cta_destino));
                    monto = monto.toFixed(2);

                    //Condiciones para reclasificar de acuerdo al monto positivo o negativo
                    if (monto > 0) {
                        // if(suma_factor>0){
                        //     monto=monto-suma_factor;
                        // }
                        /*Creacion de Registro del Debit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cta_origen);
                        newLine.setDebitAmount(monto);
                        newLine.setMemo('Reclasifica - Debit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);

                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }
                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                if (department_rec) {
                                    newLine.setDepartmentId(department_rec);
                                }
                            }
                        }
                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }

                        /*Creacion de Registro del Credit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cta_destino);
                        newLine.setCreditAmount(monto);
                        newLine.setMemo('Reclasifica - Credit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }
                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                if (department_rec) {
                                    newLine.setDepartmentId(department_rec);
                                }
                            }
                        }
                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }
                    }

                    if (monto < 0) {
                        monto = monto * -1;

                        // if(suma_factor>0){
                        //     monto=monto-suma_factor;
                        // }
                        /*Creacion de Registro del Debit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cta_destino);
                        newLine.setDebitAmount(monto);
                        newLine.setMemo('Reclasifica - Debit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }
                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                if (department_rec) {
                                    newLine.setDepartmentId(department_rec);
                                }
                            }
                        }
                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }

                        /*Creacion de Registro del Credit*/
                        var newLine = customLines.addNewLine();
                        newLine.setAccountId(cta_origen);
                        newLine.setCreditAmount(monto);
                        newLine.setMemo('Reclasifica - Credit: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                        if (makeClassesMandatory || allowPerLineClasses) {
                            if (classId) {
                                newLine.setClassId(classId);
                            } else {
                                if (class_rec) {
                                    newLine.setClassId(class_rec);
                                }
                            }
                        }
                        if (makeDepartmentsMandatory || allowPerLineDepartments) {
                            if (departmentId) {
                                newLine.setDepartmentId(departmentId);
                            } else {
                                if (department_rec) {
                                    newLine.setDepartmentId(department_rec);
                                }
                            }
                        }
                        if (makeLocationsMandatory || allowPerLineLocations) {
                            if (locationId) {
                                newLine.setLocationId(locationId);
                            } else {
                                if (location_rec) {
                                    newLine.setLocationId(location_rec);
                                }
                            }
                        }

                        for (var segmentoId in segmentos) {
                            if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                            }
                        }
                    }
                }

                //Diferencia cambiaria a 2 digitos
                dif_cambiaria = parseFloat(dif_cambiaria).toFixed(4);
                nlapiLogExecution('AUDIT', 'reclasificar.diferencia_cambiaria - reclasificarData: ', dif_cambiaria);

                //Condiciones para reclasificar diferencia cambiaria de acuerdo si es negativo o positivo



                if (reclasificar[reclasificarId].configuracion.tipo_code == 'custinvc') {

                    if (pgorigen_line && perdida_line && ganancia_line && imp_acreditable == 'F') {
                        if (dif_cambiaria > 0) {

                            /*Creacion de Registro del Debit*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(pgorigen_line);
                            newLine.setDebitAmount(dif_cambiaria);
                            newLine.setMemo('Perdida: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }

                            /*Creacion de Registro del Credito*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(perdida_line);
                            newLine.setCreditAmount(dif_cambiaria);
                            newLine.setMemo('Perdida: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }
                        }
                        if (dif_cambiaria < 0) {
                            dif_cambiaria = dif_cambiaria * -1;
                            /*Creacion de Registro del Debit*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(ganancia_line);
                            newLine.setDebitAmount(dif_cambiaria);
                            newLine.setMemo('Ganancia: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }

                            /*Creacion de Registro del Cr�dito*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(pgorigen_line);
                            newLine.setCreditAmount(dif_cambiaria);
                            newLine.setMemo('Ganancia: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }
                        }
                    }
                    if (pgorigen_line && perdida_line && ganancia_line && imp_acreditable == 'T') {
                        if (dif_cambiaria > 0) {
                            /*Creacion de Registro del Debit*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(perdida_line);
                            newLine.setDebitAmount(dif_cambiaria);
                            newLine.setMemo('Perdida: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }

                            /*Creacion de Registro del Cr�dito*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(pgorigen_line);
                            newLine.setCreditAmount(dif_cambiaria);
                            newLine.setMemo('Perdida: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }
                        }
                        if (dif_cambiaria < 0) {
                            dif_cambiaria = dif_cambiaria * -1;
                            /*Creacion de Registro del Debit*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(pgorigen_line);
                            newLine.setDebitAmount(dif_cambiaria);
                            newLine.setMemo('Ganancia: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }

                            /*Creacion de Registro del Credito*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(ganancia_line);
                            newLine.setCreditAmount(dif_cambiaria);
                            newLine.setMemo('Ganancia: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }
                        }
                    }
                }

                if (reclasificar[reclasificarId].configuracion.tipo_code == 'vendbill') {

                    if (pgorigen_line && perdida_line && ganancia_line && imp_acreditable == 'F') {
                        if (dif_cambiaria > 0) {

                            /*Creacion de Registro del Debit*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(ganancia_line);
                            newLine.setDebitAmount(dif_cambiaria);
                            newLine.setMemo('Ganancia: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }

                            /*Creacion de Registro del Credito*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(pgorigen_line);
                            newLine.setCreditAmount(dif_cambiaria);
                            newLine.setMemo('Ganancia: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }
                        }
                        if (dif_cambiaria < 0) {
                            dif_cambiaria = dif_cambiaria * -1;
                            /*Creacion de Registro del Debit*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(pgorigen_line);
                            newLine.setDebitAmount(dif_cambiaria);
                            newLine.setMemo('Perdida: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }

                            /*Creacion de Registro del Cr�dito*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(perdida_line);
                            newLine.setCreditAmount(dif_cambiaria);
                            newLine.setMemo('Perdida: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }
                        }
                    }
                    if (pgorigen_line && perdida_line && ganancia_line && imp_acreditable == 'T') {
                        if (dif_cambiaria > 0) {
                            /*Creacion de Registro del Debit*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(pgorigen_line);
                            newLine.setDebitAmount(dif_cambiaria);
                            newLine.setMemo('Ganancia: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }

                            /*Creacion de Registro del Cr�dito*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(ganancia_line);
                            newLine.setCreditAmount(dif_cambiaria);
                            newLine.setMemo('Ganancia: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }
                        }
                        if (dif_cambiaria < 0) {
                            dif_cambiaria = dif_cambiaria * -1;
                            /*Creacion de Registro del Debit*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(perdida_line);
                            newLine.setDebitAmount(dif_cambiaria);
                            newLine.setMemo('Perdida: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }

                            /*Creacion de Registro del Credito*/
                            var newLine = customLines.addNewLine();
                            newLine.setAccountId(pgorigen_line);
                            newLine.setCreditAmount(dif_cambiaria);
                            newLine.setMemo('Perdida: ' + reclasificar[reclasificarId].configuracion.tax_code_text);
                            if (makeClassesMandatory || allowPerLineClasses) {
                                if (classId) {
                                    newLine.setClassId(classId);
                                } else {
                                    if (class_rec) {
                                        newLine.setClassId(class_rec);
                                    }
                                }
                            }
                            if (makeDepartmentsMandatory || allowPerLineDepartments) {
                                if (departmentId) {
                                    newLine.setDepartmentId(departmentId);
                                } else {
                                    if (department_rec) {
                                        newLine.setDepartmentId(department_rec);
                                    }
                                }
                            }
                            if (makeLocationsMandatory || allowPerLineLocations) {
                                if (locationId) {
                                    newLine.setLocationId(locationId);
                                } else {
                                    if (location_rec) {
                                        newLine.setLocationId(location_rec);
                                    }
                                }
                            }

                            for (var segmentoId in segmentos) {
                                if (segmentos[segmentoId].segmentId && segmentos[segmentoId].segmentValue) {
                                    newLine.setSegmentValueId(segmentos[segmentoId].segmentId, parseInt(segmentos[segmentoId].segmentValue));
                                }
                            }
                        }
                    }
                }



            }
        }

        if (ismultibook) {
            if (ismultibook.secundaryBooks == 'T') {
                nlapiLogExecution('DEBUG', 'ismultibook', JSON.stringify(ismultibook));
                if (book.isPrimary()) {
                    for (var i = 0; i < customLines.getCount(); i++) {
                        if (customLines.getLine(i).isBookSpecific()) {
                            nlapiLogExecution('DEBUG', 'customLines.getLine(' + i + ')', JSON.stringify(customLines.getLine(i)));
                            var objLinea = customLines.getLine(i);
                            nlapiLogExecution('DEBUG', 'Perdida', ((objLinea.memo).indexOf('Perdida') !== -1));
                            nlapiLogExecution('DEBUG', 'Ganancia', ((objLinea.memo).indexOf('Ganancia') !== -1));
                            if (((objLinea.memo).indexOf('Perdida') !== -1) == false && ((objLinea.memo).indexOf('Ganancia') !== -1) == false) {
                                customLines.getLine(i).setBookSpecific(false);
                            }

                        }
                    }
                }
            }
        }


    } catch (e) {
        nlapiLogExecution('ERROR', 'Error - reclasificacionProcess: ', JSON.stringify(e));
    }

}
function getSegments() {

    var settings = {};
    //Se generan filtros para la busqueda de acuerdo al tipo de transaccion a reclasificar
    var filters = new Array();
    filters[0] = new nlobjSearchFilter('isinactive', null, 'is', 'F');

    //Se obtienen las columnas necesarias para la reclasificacion
    var columns = new Array();
    columns.push(new nlobjSearchColumn('custrecord_efx_rec_segmentid'));
    columns.push(new nlobjSearchColumn('custrecord_efx_rec_segmentvalue'));

    //Se genera la busqueda del registro EFX REC-Reclasificacion Config Detail

    var search = nlapiSearchRecord('customrecord_efx_rec_config_segment', null, filters, columns);

    if (search) {
        for (var x = 0; x < search.length; x++) {

            //Se guardan los datos de la busqueda en un JSON de configuracion
            settings[search[x].id] = {
                segmentId: search[x].getValue('custrecord_efx_rec_segmentid') || '',
                segmentValue: search[x].getValue('custrecord_efx_rec_segmentvalue') || '',
            };
        }
    }



    return settings;
}

function ismultiBook(tipo_transaccion) {
    nlapiLogExecution('DEBUG', 'tipo_transaccion_ismultiBook', JSON.stringify(tipo_transaccion));
    try {
        var multibookObj = {};

        //Se generan filtros para la busqueda de acuerdo al tipo de transaccion
        var filters = new Array();
        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
        filters.push(new nlobjSearchFilter("custrecord_efx_rec_codetype", null, "is", tipo_transaccion));

        //Se obtienen las columnas necesarias para identificar si se reclasificara multibook
        var columns = new Array();
        columns.push(new nlobjSearchColumn('custrecord_efx_rec_codetype'));
        columns.push(new nlobjSearchColumn('custrecord_efx_rec_secundarybooks'));


        //Se genera la busqueda del registro EFX REC-Reclasificacion Config

        var search = nlapiSearchRecord('customrecord_efx_rec_config_reclasif', null, filters, columns);

        for (var x = 0; x < search.length; x++) {

            //Se guardan los datos de la busqueda en un JSON de configuracion

            multibookObj.tipo_code = search[x].getValue('custrecord_efx_rec_codetype') || '';
            multibookObj.secundaryBooks = search[x].getValue('custrecord_efx_rec_secundarybooks') || '';

            //Se genera un array de taxcode usados para un filtro de busqueda mas adelante
        }
        nlapiLogExecution('DEBUG', 'multibookObj', JSON.stringify(multibookObj));

        return multibookObj;
    } catch (error_ismultiBook) {
        nlapiLogExecution('ERROR', 'Error - error_ismultiBook: ', JSON.stringify(error_ismultiBook));
    }

}

function getCreditMemoId(idChildTransaction, array_creditMemos, fechadepago) {
    nlapiLogExecution('DEBUG', 'getCreditMemoId', '');
    nlapiLogExecution('DEBUG', 'idChildTransaction', idChildTransaction);
    nlapiLogExecution('DEBUG', 'array_creditMemos', JSON.stringify(array_creditMemos));
    nlapiLogExecution('DEBUG', 'fechadepago', fechadepago);
    var arrayCreditMemos = new Array();
    var CreditMemosMontoTotal = 0;
    var objcreditmemos = {}
    if (idChildTransaction.length > 0) {
        try {
            //Se generan filtros para obtener informacion de las transacciones aplicadas
            /*  var filters = new Array();
            filters.push(new nlobjSearchFilter('type', null, 'anyof', 'CustCred'));
            filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
            filters.push(new nlobjSearchFilter('appliedtotransaction', null, 'anyof', idChildTransaction));
            filters.push(new nlobjSearchFilter('trandate', null, 'onorbefore', fechadepago));
            nlapiLogExecution('AUDIT', 'filters - getCreditMemoId: ', JSON.stringify(filters));
            //Se generan las columnas de datos a usar de las transacciones
            var columns = new Array();
            columns.push(new nlobjSearchColumn('internalid'));
            columns.push(new nlobjSearchColumn('tranid'));
            columns.push(new nlobjSearchColumn('appliedtotransaction'));
            columns.push(new nlobjSearchColumn('type'));
            columns.push(new nlobjSearchColumn('total'));
            columns.push(new nlobjSearchColumn('exchangerate'));
            nlapiLogExecution('AUDIT', 'columns - getCreditMemoId: ', JSON.stringify(columns)); */
            // Ejecuta la busqueda
            var search = nlapiSearchRecord('transaction', null,
                [
                    ['type', 'anyof', 'CustCred'],
                    "AND",
                    ['mainline', 'is', 'T'],
                    "AND",
                    ['appliedtotransaction', 'anyof', idChildTransaction],
                    "AND",
                    ['trandate', 'onorbefore', fechadepago]
                ],
                [
                    new nlobjSearchColumn('internalid'),
                    new nlobjSearchColumn('tranid'),
                    new nlobjSearchColumn('appliedtotransaction'),
                    new nlobjSearchColumn('type'),
                    new nlobjSearchColumn('total'),
                    new nlobjSearchColumn('exchangerate'),
                ]
            );
            nlapiLogExecution('AUDIT', 'resultados de la busqueda: ', JSON.stringify(search));
            if (search != null) {
                nlapiLogExecution('AUDIT', 'search.length: ', search.length);
                for (var x = 0; x < search.length; x++) {
                    //Se guardan los datos de apply en el objeto respuesta de acuerdo al id de transaccion
                    arrayCreditMemos.push(search[x].getValue('internalid'));
                    CreditMemosMontoTotal = CreditMemosMontoTotal + (parseFloat(search[x].getValue('total')) * -1);
                    array_creditMemos[x] = {
                        internalid: search[x].getValue('internalid'),
                        factura: search[x].getValue('appliedtotransaction'),
                        amount: search[x].getValue('total'),
                        total: search[x].getValue('total'),
                        trantype: search[x].getValue('type'),
                        tipo_cambio_pago: search[x].getValue('exchangerate'),
                        porcentaje: 0,
                    }
                }

                nlapiLogExecution('AUDIT', 'array_creditMemos - getCreditMemoId: ', array_creditMemos);
                objcreditmemos.applydata = array_creditMemos;
                objcreditmemos.arrayNC = arrayCreditMemos;
                objcreditmemos.totalCreditMemos = CreditMemosMontoTotal;
                nlapiLogExecution('AUDIT', 'objcreditmemos ', objcreditmemos);
            }
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error - getCreditMemoId: ', JSON.stringify(e));
        } finally {
            nlapiLogExecution('AUDIT', 'Finally - getCreditMemoId: ', JSON.stringify(objcreditmemos));
            return objcreditmemos;
        }
    }
}