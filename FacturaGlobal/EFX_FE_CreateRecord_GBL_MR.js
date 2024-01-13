/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/runtime', 'N/record','N/format'],
    
    (search, runtime, record,format) => {
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

         //var array_facturas = new Array();
         var array_ids = new Array();
         var objData = {
                //array_data:array_facturas,
                array_ids:array_ids,
                array_ids_subsidiary:{},
                array_ids_location:{},
        }
        const getInputData = (inputContext) => {
                try{
                        var scriptObj = runtime.getCurrentScript();
                        var searchGBL = scriptObj.getParameter({name: 'custscript_efx_gbl_auto_bg'});

                        var searchGlobal = search.load({
                                id: searchGBL
                        });
                        return searchGlobal;
                }
                catch (e) {
                        log.error(({title: '', details: e}));
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
                        log.debug({title:'map', details: mapContext});
                        var value = JSON.parse(mapContext.value);
                        var objreduce = {
                                idfactura:value.id,                                
                                fecha: value.values.trandate,                                
                            }
                        //array_facturas.push(objreduce);
                        array_ids.push(value.id);

                        /*var objData = {
                                array_data:array_facturas,
                                array_ids:array_ids,                                
                        }
                        log.debug({title:'objData.hasOwnProperty("array_ids_subsidiary")', details: objData.hasOwnProperty('array_ids_subsidiary')});
                        log.debug({title:'objData.hasOwnProperty("array_ids_location")', details: objData.hasOwnProperty('array_ids_location')});
                        if(!objData.hasOwnProperty('array_ids_subsidiary')){
                                objData.array_ids_subsidiary = {};
                        }
                        if(!objData.hasOwnProperty('array_ids_location')){
                                objData.array_ids_location = {};
                        }*/

                        if((value.values).hasOwnProperty('subsidiary')){
                                objData.subsidiaria = value.values.subsidiary.value;
                                log.debug({title:'objData1', details: objData});
                                if((objData.array_ids_subsidiary).hasOwnProperty(value.values.subsidiary.value)){
                                        objData.array_ids_subsidiary[value.values.subsidiary.value].push(value.id);
                                }else{
                                        objData.array_ids_subsidiary[value.values.subsidiary.value]=new Array();
                                        objData.array_ids_subsidiary[value.values.subsidiary.value].push(value.id);
                                }
                                log.debug({title:'objData2', details: objData});
                        }
                        if((value.values).hasOwnProperty('location')){
                                if(value.values.location){
                                        objData.location = value.values.location.value;
                                
                                        if((objData.array_ids_location).hasOwnProperty(value.values.location.value)){
                                                objData.array_ids_location[value.values.location.value].push(value.id);
                                        }else{
                                                objData.array_ids_location[value.values.location.value]=new Array();
                                                objData.array_ids_location[value.values.location.value].push(value.id);
                                        }
                                }
                                
                        }
                        
                            mapContext.write({
                                key: 'ObjetoGBL',
                                value: objData
                            });
                        
                }
                catch (e) {
                        log.error(({title: '', details: e}));
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


                var dataReduce = JSON.parse(reduceContext.values[0]);
                log.debug({title:'dataReduce', details: dataReduce});

                var scriptObj = runtime.getCurrentScript();
                        var gbltype = scriptObj.getParameter({name: 'custscript_efx_gbl_auto_typegbl'});
                        var agrupar = scriptObj.getParameter({name: 'custscript_efx_gbl_auto_group'});
                        
                        var filtroSegmentos = new Array();
                        var idSegmentos = new Array();
                        if(agrupar==1){
                                for(j in dataReduce.array_ids_location){
                                        idSegmentos.push(j)
                                }
                                log.debug({title:'idSegmentos', details: idSegmentos});
                                filtroSegmentos = ['custrecord_efx_fe_gbl_aut_location',search.Operator.ANYOF,idSegmentos];
                                log.debug({title:'filtroSegmentos', details: filtroSegmentos});
                        }else if(agrupar==2){
                                for(j in dataReduce.array_ids_subsidiary){
                                        idSegmentos.push(j)
                                }
                                log.debug({title:'idSegmentos', details: idSegmentos});
                                filtroSegmentos = ['custrecord_efx_fe_gbl_aut_subsidiary',search.Operator.ANYOF,idSegmentos];
                                log.debug({title:'filtroSegmentos', details: filtroSegmentos});
                        }else if(agrupar==3 || !agrupar){
                                filtroSegmentos.push(['custrecord_efx_fe_gbl_aut_subsidiary',search.Operator.ANYOF,dataReduce.subsidiaria]);
                                filtroSegmentos.push('AND');
                                filtroSegmentos.push(['custrecord_efx_fe_gbl_aut_location', search.Operator.ANYOF,dataReduce.location]);
                                log.debug({title:'filtroSegmentos', details: filtroSegmentos});
                        }
                        try{
                        var fechas = obtieneFechas(dataReduce,agrupar);
                        log.debug({title:'fechas', details: fechas});
                        
                        var filtrofechas = new Array();
                        for(var f=0;f<fechas.length;f++){
                                var filtrofechasArray = new Array();
                                if(filtrofechas.length==0){
                                        if(agrupar==1){
                                                filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_location',search.Operator.ANYOF,fechas[f].idLocation]);
                                                filtrofechasArray.push('AND');  
                                        }else if(agrupar==2){
                                                filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_subsidiary',search.Operator.ANYOF,fechas[f].idSubsidiary]);
                                                filtrofechasArray.push('AND');  
                                        }else if(agrupar==3 || !agrupar){
                                                filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_subsidiary',search.Operator.ANYOF,fechas[f].idSubsidiary]);
                                                filtrofechasArray.push('AND');
                                                filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_location',search.Operator.ANYOF,fechas[f].idLocation]);
                                                filtrofechasArray.push('AND');
                                        }                                                                        
                                        filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_startdate',search.Operator.ON,fechas[f].fechaInicioFormat]);
                                        filtrofechasArray.push('AND');
                                        filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_enddate',search.Operator.ON,fechas[f].fechaFinFormat]);                                        
                                        filtrofechas.push(filtrofechasArray);
                                }else{
                                        if(agrupar==1){
                                                filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_location',search.Operator.ANYOF,fechas[f].idLocation]);
                                                filtrofechasArray.push('AND');  
                                        }else if(agrupar==2){
                                                filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_subsidiary',search.Operator.ANYOF,fechas[f].idSubsidiary]);
                                                filtrofechasArray.push('AND');  
                                        }else if(agrupar==3 || !agrupar){
                                                filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_subsidiary',search.Operator.ANYOF,fechas[f].idSubsidiary]);
                                                filtrofechasArray.push('AND');
                                                filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_location',search.Operator.ANYOF,fechas[f].idLocation]);
                                                filtrofechasArray.push('AND');
                                        }  
                                        filtrofechas.push('OR');
                                        filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_startdate',search.Operator.ON,fechas[f].fechaInicioFormat]);
                                        filtrofechasArray.push('AND');
                                        filtrofechasArray.push(['custrecord_efx_fe_gbl_aut_enddate',search.Operator.ON,fechas[f].fechaFinFormat]);                                        
                                        filtrofechas.push(filtrofechasArray);
                                        
                                }
                                
                        }
                        log.debug({title:'filtrofechas', details: filtrofechas});
                        var buscaRecord = search.create({
                                type: 'customrecord_efx_fe_gbl_automatic',
                                filters:[
                                    ['isinactive',search.Operator.IS,'F']
                                    ,'AND',
                                    filtrofechas                      
                                ],
                                columns:[
                                    search.createColumn({name: "internalid"}),
                                    search.createColumn({name: "custrecord_efx_fe_gbl_aut_subsidiary"}),
                                    search.createColumn({name: "custrecord_efx_fe_gbl_aut_location"}),
                                    search.createColumn({name: "custrecord_efx_fe_gbl_aut_startdate"}),
                                    search.createColumn({name: "custrecord_efx_fe_gbl_aut_enddate"}),
                                    
                                ]
                        });
                        
                        var arrayCreacion = new Array();

                        if(agrupar==1){
                                buscaRecord.run().each(function (result) {                                          
                                        log.debug({title:'result', details: result});                                                               
                                        for(var j=0;j<fechas.length;j++){
                                                var idLocationData = result.getValue({name: 'custrecord_efx_fe_gbl_aut_location'}) || '';
                                                if(idLocationData==fechas[j].idLocation){
                                                        fechas.splice(j);
                                                        break;
                                                }
                                        }                                        
                                        return true;
                                });
                                log.debug({title:'fechas', details: fechas});
                                
                                createRecordGBL(gbltype,dataReduce,fechas,agrupar);
                                                                                        
                        }else if(agrupar==2){
                                buscaRecord.run().each(function (result) {                                          
                                        log.debug({title:'result', details: result});                                                               
                                        for(var j=0;j<fechas.length;j++){
                                                var idSubsidiaryData = result.getValue({name: 'custrecord_efx_fe_gbl_aut_subsidiary'}) || '';
                                                if(idSubsidiaryData==fechas[j].idSubsidiary){
                                                        fechas.splice(j);
                                                        break;
                                                }
                                        }                                        
                                        return true;
                                });
                                log.debug({title:'fechas', details: fechas});
                                
                                createRecordGBL(gbltype,dataReduce,fechas,agrupar);
                        }else if(agrupar==3 || !agrupar){
                                var resultadosbuscaRecord = buscaRecord.runPaged().count;
                                if(resultadosbuscaRecord <= 0){
                                        createRecordGBL(gbltype,dataReduce,fechas);
                                }else{
                                        log.debug({title: 'Created Record', details: 'Ya existe un registro con esos parametros'});
                                }
                        }
                }catch(error_buscarecord){
                        log.error({title:'error_buscarecord',details:error_buscarecord});
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

        function obtieneFechas(objDatos,agrupar){

                var filtrosIdFechas = new Array();
                var facturasIds = new Array();
                if(agrupar==1){
                        for(j in objDatos.array_ids_location){
                                for(var i=0;i<(objDatos.array_ids_location[j]).length;i++){
                                        facturasIds.push(objDatos.array_ids_location[j][i]);
                                }                                
                        }
                        log.audit({title:'facturasIds',details:facturasIds});
                        filtrosIdFechas.push(['internalid', search.Operator.ANYOF,facturasIds]);
                        var buscaFechas = search.create({
                                type: search.Type.TRANSACTION,
                                filters:[
                                    ['type',search.Operator.ANYOF,'CustInvc','CashSale']
                                    ,'AND',
                                    ['custbody_mx_cfdi_uuid',search.Operator.ISEMPTY,'']
                                    ,'AND',
                                    filtrosIdFechas                        
                                ],
                                columns:[
                                    search.createColumn({name: "location", summary: "GROUP", label: "Ubicaciones"}),
                                    search.createColumn({name: "trandate", summary: "MIN", label: "Inicio"}),
                                    search.createColumn({name: "trandate", summary: "MAX", label: "Fin"})
                                ]
                        });
                }else if(agrupar==2){
                        for(j in objDatos.array_ids_subsidiary){
                                for(var i=0;i<(objDatos.array_ids_subsidiary[j]).length;i++){
                                        facturasIds.push(objDatos.array_ids_subsidiary[j][i]);
                                }
                        }
                        log.audit({title:'facturasIds',details:facturasIds});
                        filtrosIdFechas.push(['internalid', search.Operator.ANYOF,facturasIds]);
                        var buscaFechas = search.create({
                                type: search.Type.TRANSACTION,
                                filters:[
                                    ['type',search.Operator.ANYOF,'CustInvc','CashSale']
                                    ,'AND',
                                    ['custbody_mx_cfdi_uuid',search.Operator.ISEMPTY,'']
                                    ,'AND',
                                    filtrosIdFechas                        
                                ],
                                columns:[
                                    search.createColumn({name: "subsidiary", summary: "GROUP", label: "Subsidiarias"}),
                                    search.createColumn({name: "trandate", summary: "MIN", label: "Inicio"}),
                                    search.createColumn({name: "trandate", summary: "MAX", label: "Fin"})
                                ]
                        });                          
                }else if(agrupar==3 || !agrupar){
                        filtrosIdFechas.push(['internalid', search.Operator.ANYOF,objDatos.array_ids]);
                        var buscaFechas = search.create({
                                type: search.Type.TRANSACTION,
                                filters:[
                                    ['type',search.Operator.ANYOF,'CustInvc','CashSale']
                                    ,'AND',
                                    ['custbody_mx_cfdi_uuid',search.Operator.ISEMPTY,'']
                                    ,'AND',
                                    filtrosIdFechas                        
                                ],
                                columns:[
                                    search.createColumn({name: "trandate", summary: "MIN", label: "Inicio"}),
                                    search.createColumn({name: "trandate", summary: "MAX", label: "Fin"})
                                ]
                        });
                        
                }                
                var ejecutar = buscaFechas.run();
                        var resultado = ejecutar.getRange(0, 100);
                        var objfechasArray = new Array();
                        var fechainicio = '';
                        var fechafin = '';
                        var fechaInicioFormat = '';
                        var fechaFinFormat = '';
                        for(var i=0;i<resultado.length;i++){
                                var objfechas = {
                                        idLocation:'',
                                        idSubsidiary:'',
                                        inicio:'',
                                        fin:'',
                                        fechaInicioFormat:'',
                                        fechaFinFormat:'',
                                };
                                fechainicio = resultado[i].getValue({name: "trandate", summary: "MIN", label: "Inicio"});
                                fechafin = resultado[i].getValue({name: "trandate", summary: "MAX", label: "Inicio"});
                                fechaInicioFormat = resultado[i].getValue({name: "trandate", summary: "MIN", label: "Inicio"});
                                fechaFinFormat = resultado[i].getValue({name: "trandate", summary: "MAX", label: "Inicio"});
                                if(agrupar==1){
                                        objfechas.idLocation = resultado[i].getValue({name: "location", summary: "GROUP", label: "Ubicaciones"});
                                        objfechas.idSubsidiary = objDatos.subsidiaria;
                                }else if(agrupar==2){
                                        objfechas.idSubsidiary = resultado[i].getValue({name: "subsidiary", summary: "GROUP", label: "Subsidiarias"});
                                }else if(agrupar==3 || !agrupar){
                                        objfechas.idLocation = objDatos.location;
                                        objfechas.idSubsidiary = objDatos.subsidiaria;
                                }
                                objfechas.inicio = format.parse({value:fechainicio, type: format.Type.DATE});
                                objfechas.fin = format.parse({value:fechafin, type: format.Type.DATE});
                                objfechas.fechaInicioFormat = fechaInicioFormat;
                                objfechas.fechaFinFormat = fechaFinFormat;
                                objfechasArray.push(objfechas)
                        }                                
                        

                return objfechasArray;

        }

        function createRecordGBL(gbltype,dataReduce,fechas,agrupar){
                for(var i=0;i<fechas.length;i++){
                        var customRecord = record.create({
                                type: 'customrecord_efx_fe_gbl_automatic',
                                isDynamic: true
                        });
                        customRecord.setValue({
                                fieldId: 'custrecord_efx_fe_gbl_aut_gbltype',
                                value:gbltype
                        });
                                            
                        customRecord.setValue({
                                fieldId: 'custrecord_efx_fe_gbl_aut_startdate',
                                value:fechas[i].inicio
                        });
                        customRecord.setValue({
                                fieldId: 'custrecord_efx_fe_gbl_aut_enddate',
                                value:fechas[i].fin
                        });
        
                        
                        customRecord.setValue({
                                fieldId: 'custrecord_efx_fe_gbl_aut_status',
                                value:1,
                                ignoreFieldChange: false
                        });
                        
                        if(agrupar==1){
                                if(fechas[i].idLocation){
                                        customRecord.setValue({
                                                fieldId: 'custrecord_efx_fe_gbl_aut_location',
                                                value:fechas[i].idLocation
                                                
                                        });
                                }
                                if(fechas[i].idSubsidiary){
                                        customRecord.setValue({
                                                fieldId: 'custrecord_efx_fe_gbl_aut_subsidiary',
                                                value:fechas[i].idSubsidiary
                                        });
                                }
                                customRecord.setValue({
                                        fieldId: 'custrecord_efx_fe_gbl_aut_tranid',
                                        value:dataReduce.array_ids_location[fechas[i].idLocation],
                                        ignoreFieldChange: false
                                });
                        }else if(agrupar==2){
                                if(fechas[i].idSubsidiary){
                                        customRecord.setValue({
                                                fieldId: 'custrecord_efx_fe_gbl_aut_subsidiary',
                                                value:fechas[i].idSubsidiary
                                        });
                                } 
                                customRecord.setValue({
                                        fieldId: 'custrecord_efx_fe_gbl_aut_tranid',
                                        value:dataReduce.array_ids_subsidiary[fechas[i].idSubsidiary],                                        
                                });
                        }else if(agrupar==3 || !agrupar){
                                if(fechas[i].idLocation){
                                        customRecord.setValue({
                                                fieldId: 'custrecord_efx_fe_gbl_aut_location',
                                                value:fechas[i].idLocation
                                                
                                        });
                                }
                                if(fechas[i].idSubsidiary){
                                        customRecord.setValue({
                                                fieldId: 'custrecord_efx_fe_gbl_aut_subsidiary',
                                                value:fechas[i].idSubsidiary
                                        });
                                } 
                                customRecord.setValue({
                                        fieldId: 'custrecord_efx_fe_gbl_aut_tranid',
                                        value:dataReduce.array_ids
                                });
                        }
        
                        
                        var recordId = customRecord.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                        });
                        log.debug({title: "Created Record", details: recordId});
                }                
        }

        return {getInputData, map,reduce, summarize}

    });
