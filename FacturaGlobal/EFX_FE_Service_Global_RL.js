/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/format', 'N/log', 'N/record', 'N/search', 'N/task'],
    /**
     * @param{format} format
     * @param{log} log
     * @param{record} record
     * @param{search} search
     * @param{task} task
     */
    (format, log, record, search, task) => {

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {
            try {
                log.audit({title: 'Request body', details: requestBody});
                let result = {};
                if (requestBody.hasOwnProperty('register')) {
                    switch (requestBody.register) {
                        case 'globalInvoicing':
                            result = globalInvoicing(requestBody);
                            break;
                        default :
                            result = {
                                success: false,
                                code: 10,
                                msg: 'Cuerpo de la petición incorrecto: no se encuentra la función ' + requestBody.register
                            }
                            break;
                    }
                } else {
                    result = {
                        success: false,
                        code: 10,
                        msg: 'Cuerpo de la petición incorrecto'
                    }
                }
                return result
            } catch (e) {
                log.error({title: 'Error on post', details: e});
                return {
                    success: false,
                    code: 20,
                    msg: 'Ha ocurrido un error al intentar registrar la petición'
                }
            }

        }

        /**
         * Función de disparo de facturación global
         * @param {Object} body
         * @returns {{success: boolean}}
         */
        const globalInvoicing = (body) => {
            let response = {};
            try {
                let validateRequest = validateDataRequest(body);
                if (validateRequest.success === true) {
                    let recordLog = createLogGlobalInv(body);
                    if (recordLog != null && recordLog != "") {
                        body.recordLog = recordLog;


                        for(var i = 1; i <= 10; i++){
                            var scriptdeploy_id = 'customdeploy_efx_fe_create_global_mr' + i;
                            log.debug('scriptdeploy_id',scriptdeploy_id);

                            var mrTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                            mrTask.scriptId = 'customscript_efx_fe_create_global_mr';
                            mrTask.deploymentId = scriptdeploy_id;
                            let dateStart = body.startdate.split('/');
                            let dateEnd = body.finishdate.split('/');
                            mrTask.params = {
                                'custscript_efx_fe_gbl_startdate': dateStart[1] + '/' + dateStart[0] + '/' + dateStart[2],
                                'custscript_efx_fe_gbl_enddate': dateEnd[1] + '/' + dateEnd[0] + '/' + dateEnd[2],
                                'custscript_efx_fe_gbl_location': body.location,
                                'custscript_efx_fe_gbl_obj_json': JSON.stringify(body)
                            }

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
                        
                        
                        log.debug({title: 'task id', details: mrTaskId});
                        if (mrTaskId != null && mrTaskId != "") {
                            record.submitFields({
                                type: 'customrecord_efx_fe_gbl_log',
                                id: recordLog,
                                values: {
                                    'custrecord_efx_fe_gbl_task_id': mrTaskId
                                }
                            });
                            response = {success: true, trackinglog: recordLog}
                        } else {
                            response = {
                                success: false,
                                code: 20,
                                msg: 'Ha ocurrido un error al intentar registrar la petición'
                            }
                        }
                    } else {
                        response = {
                            success: false,
                            code: 20,
                            msg: 'Ha ocurrido un error al intentar registrar la petición'
                        }
                    }
                } else {
                    response = validateRequest;
                }
            } catch (e) {
                log.error({title: 'Error on function globalInvoicing', details: e});
                response = {
                    success: false,
                    code: 20,
                    msg: 'Ha ocurrido un error al intentar registrar la petición'
                }
            }
            return response;
        }

        /**
         * Función para validar el tipo de dato que esta recibiendo la petición
         * @param {Object} body
         * @returns {{msg: string, code: number, success: boolean}|{success: boolean}}
         */
        const validateDataRequest = (body) => {
            try {
                let keysData = Object.keys(body);
                let keysError = [];
                let msgError = "";
                let toType = function (obj) {
                    return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase()
                }
                for (let keysDataKey in keysData) {
                    var valueData = body[keysData[keysDataKey]];
                    var typeData = toType(valueData);
                    switch (keysData[keysDataKey]) {
                        case 'startdate':
                            if (typeData != 'string') {
                                keysError.push('Error en: ' + keysData[keysDataKey] + ', el tipo de valor no es date');
                            } else {
                                var dateStr = valueData.split('/');
                                var errorCount = 0;
                                if (dateStr[0].length != 2) {
                                    errorCount++;
                                }
                                if (dateStr[1].length != 2) {
                                    errorCount++;
                                }
                                if (dateStr[2].length != 4) {
                                    errorCount++;
                                }

                                if (errorCount > 0) {
                                    keysError.push('Error en: ' + keysData[keysDataKey] + ', el dato no cumple con el formato dd/mm/AAAA');
                                }
                            }
                            break;
                        case 'finishdate':
                            if (typeData != 'string') {
                                keysError.push('Error en: ' + keysData[keysDataKey] + ', el tipo de valor no es date');
                            } else {
                                var dateStr = valueData.split('/');
                                var errorCount = 0;
                                if (dateStr[0].length != 2) {
                                    errorCount++;
                                }
                                if (dateStr[1].length != 2) {
                                    errorCount++;
                                }
                                if (dateStr[2].length != 4) {
                                    errorCount++;
                                }

                                if (errorCount > 0) {
                                    keysError.push('Error en: ' + keysData[keysDataKey] + ', el dato no cumple con el formato dd/mm/AAAA');
                                }
                            }
                            break;
                        case 'locationexternal':
                            if (typeData != 'string') {
                                keysError.push('Error en: ' + kekeysData[keysDataKey] + ', el tipo de valor no es string');
                            }
                            break;
                        case 'location':
                            if (typeData != 'string') {
                                keysError.push('Error en: ' + keysData[keysDataKey] + ', el tipo de valor no es string');
                            }
                            break;
                        case 'cashregister':
                            if (typeData != 'string') {
                                keysError.push('Error en: ' + keysData[keysDataKey] + ', el tipo de valor no es string');
                            }
                            break;
                        case 'employeename':
                            if (typeData != 'string') {
                                keysError.push('Error en: ' + keysData[keysDataKey] + ', el tipo de valor no es string');
                            }
                            break;
                        case 'totaltickets':
                            if (typeData != 'number') {
                                keysError.push('Error en: ' + keysData[keysDataKey] + ', el tipo de valor no es integer');
                            }
                            break;
                    }
                }

                if (keysError.length > 0) {
                    var str = "";
                    for (var i in keysError) {
                        if (i < keysError.length - 1) {
                            str += keysError[i] + '; ';
                        } else {
                            str += keysError[i];
                        }
                    }
                    return {
                        success: false,
                        code: 20,
                        msg: 'Error al validar el tipo de los datos: ' + str,
                    }
                } else {
                    return {success: true};
                }
            } catch (e) {

            }
        }

        /**
         * Obtencion de ubicacion de NetSuite
         * @param {string} idyaax
         * @returns {{id: string}}
         */
        const getLocation = (idyaax) => {
            try {
                let resultData = {id: ''}
                let filters = [
                    ["custrecord_efx_iy_id_yaax", search.Operator.IS, idyaax],
                    "AND",
                    ["isinactive", search.Operator.IS, "F"]
                ];

                let searchObj = search.load({
                    id: 'customsearch_efx_iy_location'
                });

                searchObj.filterExpression = filters;
                log.audit({
                    title: 'Filters expression in location',
                    details: {filters: searchObj.filters, expression: searchObj.filterExpression}
                });

                let searchResultCount = searchObj.runPaged().count;
                log.audit({title: 'results in locations', details: searchResultCount});
                if (searchResultCount >= 1) {
                    let result = searchObj.run().getRange({start: 0, end: 1});
                    let id = result[0].getValue({name: 'internalid'});
                    let name = result[0].getValue({name: 'name'});
                    resultData = {id: id, name: name};
                }
                return resultData;
            } catch (e) {
                log.error({title: 'Error on getLocation', details: e});
            }
        }

        /**
         * Creación del log de control para las peticiones de facturación global
         * @param {Object} body
         * @returns {*|number|null}
         */
        const createLogGlobalInv = (body) => {
            try {
                if (body.locationexternal != null && body.locationexternal != "") {
                    let locationAlt = getLocation(body.locationexternal);
                    log.audit({title: 'Location result match', details: locationAlt});
                    body.location = (locationAlt.id) ? locationAlt.id : "";
                }
                let objRecord = record.create({
                    type: 'customrecord_efx_fe_gbl_log',
                    isDynamic: true
                });

                objRecord.setValue({
                    fieldId: 'custrecord_efx_fe_gbl_json',
                    value: JSON.stringify(body)
                });
                objRecord.setValue({
                    fieldId: 'custrecord_efx_fe_gbl_st_date',
                    value: format.parse({
                        value: body.startdate,
                        type: format.Type.DATE
                    })
                });
                objRecord.setValue({
                    fieldId: 'custrecord_efx_fe_gbl_en_date',
                    value: format.parse({
                        value: body.finishdate,
                        type: format.Type.DATE
                    })
                });
                objRecord.setValue({
                    fieldId: 'custrecord_efx_fe_gbl_yaax_location',
                    value: body.locationexternal
                });
                objRecord.setValue({
                    fieldId: 'custrecord_efx_fe_gbl_location',
                    value: body.location
                });
                objRecord.setValue({
                    fieldId: 'custrecord_efx_fe_gbl_cashregister',
                    value: body.cashregister
                });
                objRecord.setValue({
                    fieldId: 'custrecord_efx_fe_gbl_employee',
                    value: body.employeename
                });
                objRecord.setValue({
                    fieldId: 'custrecord_efx_fe_gbl_total',
                    value: body.totaltickets
                });
                let recordID = objRecord.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                return recordID;
            } catch (e) {
                log.error({title: 'Error on createLogGlobalInv', details: e});
                return null;
            }
        }

        return {post}

    });
