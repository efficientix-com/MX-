function customizeGlImpact(transactionRecord, standardLines, customLines, book) {
    try{
        var reclasificar = transactionRecord.getFieldValue('custbody_efx_fe_kiosko_folio');
        var transaccion = transactionRecord.getFieldValue('transactionnumber');

        if(reclasificar) {
            //obtener datos del registro donde se ejecuta el pluggin
            var context = nlapiGetContext();
            var makeClassesMandatory = context.getPreference('classmandatory');
            var allowPerLineClasses = context.getPreference('classesperline');
            var makeDepartmentsMandatory = context.getPreference('deptmandatory');
            var allowPerLineDepartments = context.getPreference('deptsperline');
            var makeLocationsMandatory = context.getPreference('locmandatory');
            var allowPerLineLocations = context.getPreference('locsperline');
            var currency = transactionRecord.getFieldValue('currency');
            var exchangerate = transactionRecord.getFieldValue('exchangerate');
            var account_payment = transactionRecord.getFieldValue('account');
            var numberOfApply = transactionRecord.getLineItemCount('item');


            var classId = '';
            var departmentId = '';
            var locationId = '';
            var suma_factor = 0;

            nlapiLogExecution('AUDIT', 'numberOfApply: ', JSON.stringify(numberOfApply));
            if(numberOfApply>0){
                if(makeClassesMandatory || allowPerLineClasses){
                    classId = transactionRecord.getFieldValue('class');
                    if(classId){
                        classId = parseInt(classId);
                    }
                }
                if(makeDepartmentsMandatory || allowPerLineDepartments){
                    departmentId = transactionRecord.getFieldValue('department');
                    if(departmentId){
                        departmentId = parseInt(departmentId);
                    }
                }
                if(makeLocationsMandatory || allowPerLineLocations){
                    locationId = transactionRecord.getFieldValue('location');
                    if(locationId){
                        locationId = parseInt(locationId);
                    }
                }
            }


            var tax_code_expense = {};
            var apply = {};
            var typeapply = '';
            var idChildTransaction = [];
            var arrayItems = [];
            var arrayArticulo = [];

            for (var x = 1; x <= numberOfApply; x++) {
                    //se obtienen datos de la linea de transaccion aplicada
                var objItems = {
                    idItem:'',
                    monto:''
                }

                        var articulo = transactionRecord.getLineItemValue('item', 'item', x) || '';
                        var montoLinea = transactionRecord.getLineItemValue('item', 'amount', x) || '';
                nlapiLogExecution('AUDIT', 'articulo: ', articulo);
                arrayArticulo.push(articulo);
                objItems.idItem = articulo;
                objItems.monto = montoLinea;

                arrayItems.push(objItems);


            }

            nlapiLogExecution('AUDIT', 'arrayItems: ', JSON.stringify(arrayItems));
            nlapiLogExecution('AUDIT', 'arrayArticulo: ', JSON.stringify(arrayArticulo));
            //var tipo_transaccion = transactionRecord.getFieldValue('type');

            //se obtiene informacion de los record de configuracion
            var accountsArreglo = getAccounts(arrayItems,arrayArticulo);
            nlapiLogExecution('AUDIT', 'accountsArreglo: ', JSON.stringify(accountsArreglo));

            //Se aplican los montos a cuentas para reclasificacion con el pluggin
            reclasificacionProcess(arrayItems,accountsArreglo,classId,departmentId,locationId,makeClassesMandatory,allowPerLineClasses,makeDepartmentsMandatory,allowPerLineDepartments,makeLocationsMandatory,allowPerLineLocations,standardLines, customLines, book);

        }else{
            nlapiLogExecution('AUDIT', 'reclasificar: ', 'No se escogió reclasificar la transacción '+transaccion+'.');
        }

    }catch(e){
        nlapiLogExecution('ERROR', 'Error: ', JSON.stringify(e));
    }
}

//Funcion para obtener la informacion de configuracion de impuestos
function getAccounts(arrayItems,arrayArticulo){
    try{
        var cuentasArray = [];

        //Se generan filtros para la busqueda de acuerdo al tipo de transaccion a reclasificar
        var filters = new Array();
        filters.push(new nlobjSearchFilter('isinactive',null,'is','F'));
        filters.push(new nlobjSearchFilter('internalid', null, 'anyof', arrayArticulo));

        //Se obtienen las columnas necesarias para la reclasificacion
        var columns = new Array();
        columns.push(new nlobjSearchColumn('internalid'));
        columns.push(new nlobjSearchColumn('custitem_efx_fe_dev_nc_account'));
        columns.push(new nlobjSearchColumn('incomeaccount'));

        //Se genera la busqueda del registro EFX REC-Reclasificacion Config Detail

        var search = nlapiSearchRecord('item', null,filters,columns);
        nlapiLogExecution('DEBUG', 'search',  search);

        for(var i=0; i<arrayItems.length;i++){
        for(var x=0;x<search.length;x++){
            var cuentasObj = {
                cuentaCustom:'',
                cuentaIngresos:''
            }
            //Se guardan los datos de la busqueda en un JSON de configuracion
            var itemSearch = search[x].getValue('internalid') || '';

                if(arrayItems[i].idItem==itemSearch){
                    cuentasObj.cuentaCustom = search[x].getValue('custitem_efx_fe_dev_nc_account') || '';
                    cuentasObj.cuentaIngresos = search[x].getValue('incomeaccount') || '';
                    cuentasArray.push(cuentasObj);
                }
            }
            //Se genera un array de taxcode usados para un filtro de busqueda mas adelante
        }
        nlapiLogExecution('DEBUG', 'cuentasArray',  JSON.stringify(cuentasArray));

        return cuentasArray;
    }catch(e){
        nlapiLogExecution('ERROR', 'Error - getAcounts: ', JSON.stringify(e));
    }
}


//Funcion donde se generan las lineas de impacto GL con la informacion generada anteriormente
function reclasificacionProcess(arrayItems,accountsArreglo,classId,departmentId,locationId,makeClassesMandatory,allowPerLineClasses,makeDepartmentsMandatory,allowPerLineDepartments,makeLocationsMandatory,allowPerLineLocations,standardLines, customLines, book) {
    try{
        nlapiLogExecution('DEBUG', 'arrayItems.length',  arrayItems.length);
        for(var i=0;i<arrayItems.length;i++) {
            if(accountsArreglo[i].cuentaIngresos){
                /*Creacion de Registro del Debit*/
                var newLine = customLines.addNewLine();
                nlapiLogExecution('DEBUG', 'accountsArreglo[i].cuentaIngresos',  accountsArreglo[i].cuentaIngresos);
                newLine.setAccountId(parseInt(accountsArreglo[i].cuentaIngresos));
                nlapiLogExecution('DEBUG', 'arrayItems[i].monto',  arrayItems[i].monto);

                newLine.setCreditAmount(arrayItems[i].monto);
                newLine.setMemo('Reclasifica - Debit: Cuenta de Ingresos');
                if (makeClassesMandatory || allowPerLineClasses) {
                    if (classId) {
                        newLine.setClassId(classId);
                    }
                }

                if (makeDepartmentsMandatory || allowPerLineDepartments) {
                    if (departmentId) {
                        newLine.setDepartmentId(departmentId);
                    }
                }

                if (makeLocationsMandatory || allowPerLineLocations) {
                    if (locationId) {
                        newLine.setLocationId(locationId);
                    }
                }

            }

            if(accountsArreglo[i].cuentaCustom) {
                /*Creacion de Registro del Credit*/
                var newLine = customLines.addNewLine();
                newLine.setAccountId(parseInt(accountsArreglo[i].cuentaCustom));
                newLine.setDebitAmount(arrayItems[i].monto);
                newLine.setMemo('Reclasifica - Credit: Devoluciones');
                if (makeClassesMandatory || allowPerLineClasses) {
                    if (classId) {
                        newLine.setClassId(classId);
                    }
                }
                if (makeDepartmentsMandatory || allowPerLineDepartments) {
                    if (departmentId) {
                        newLine.setDepartmentId(departmentId);
                    }
                }
                if (makeLocationsMandatory || allowPerLineLocations) {
                    if (locationId) {
                        newLine.setLocationId(locationId);
                    }
                }
            }
        }
    }catch(e){
        nlapiLogExecution('ERROR', 'Error - reclasificacionProcess: ', JSON.stringify(e));
    }

}
