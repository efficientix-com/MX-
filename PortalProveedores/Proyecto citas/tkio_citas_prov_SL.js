/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
/**
* @name tkio_citas_prov_SL
* @version 1.0
* @author Adrián Aguilar <adrian.aguilar@freebug.mx>
* @summary Suitelet que servirá para generar la pantalla principal de citas de proveedores
* @copyright Tekiio México 2022
* 
* Client              -> Freebug
* Last modification   -> 17/10/2022
* Modified by         -> Adrián Aguilar <adrian.aguilar@freebug.mx>
* Script in NS        -> Registro en Netsuite <ID del registro>
*/
define(['N/log', 'N/search', 'N/ui/serverWidget', 'N/https', 'N/record', 'N/runtime', 'N/format', 'N/currentRecord','N/config','N/url'],
    /**
 * @param{log} log
 * @param{search} search
 * @param{serverWidget} serverWidget
 */
    (log, search, serverWidget, https, record, runtime, format, currentRecord,config,url) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                var parameters = scriptContext.request.parameters;
                var userVendor = runtime.getCurrentUser().id;
                
                log.debug('Internal ID of current user: ' + userVendor);

                //Creacion del formulario de citas
                var form = serverWidget.createForm({
                    title: 'Formulario de citas'
                });

                form.clientScriptModulePath = './tkio_citas_prov_CS.js';

                //Se obtiene el id de ubicación seleccionado en la pantalla Agendar Citas
                var locationSelected = parameters.locations;


                //Se encargará de obtener el ID del empleado.
                var empleado;
                if (locationSelected != null) {
                    empleado = getEmployee(locationSelected);
                    // sendEmployee(empleado);
                }
                
                //Obtendrá la agenda del empleado obtenido anteriormente.
                if(empleado != null && parameters.fechaFormat!= null){
                    var agenda = getAgenda(empleado,parameters.fechaFormat);
                    
                }
                var buttonEmpleado = sendEmployee(empleado);
                form.addButton({
                    id: 'custpage_tkio_pp_agendar',
                    label: 'Agendar',
                    functionName: 'enviar("' + buttonEmpleado+ '","' +parameters.fechaFormat+ '","' +userVendor+ '")'
                });

                //Campo de fecha
                var fldDate = form.addField({
                    id: 'custpage_tkio_pp_fecha',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha'
                });

                //Permitirá que una vez que se recargue la página,me mantenga el valor de la fecha anteriormente escrito
                if (parameters.fechaFormat && parameters.fechaFormat!= 'NaN/NaN/ NaN') {
                    fldDate.defaultValue = parameters.fechaFormat;
                }

                //Campo para la tabla
                var fldtabla = form.addField({
                    id: 'custpage_tkio_pp_table',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'HORARIO'
                });

                //Campo de multiple selección que tendrá las ubicaciones
                var loc = form.addField({
                    id: 'custpage_tkio_pp_ubicaciones',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Ubicación',
                });


                loc.addSelectOption({
                    value: '',
                    text: ''
                });

                 //Llamada a función que me retorna las locaciones relacionadas.
                 var locations = getLocations();

                //Añadir el arreglo de locaciones en el campo multiselect de las locaciones
                for (var i = 0; i < locations.length; i++) {

                    loc.addSelectOption({
                        value: locations[i].id,
                        text: locations[i].name,
                        isSelected: false
                    });
                }

                //Al recargar la pagina, me deje los valores que había seteado con anterioridad
                if (parameters.locations) {
                    loc.defaultValue = parameters.locations;
                }

                /*Validar que existan localizaciones para verificar horarios.
                  Obtiene los horarios de la localización seleccionada.
                */
                var horarios = new Array();
                if(locationSelected!=''){
                    horarios = getHorario(locationSelected);
                    log.debug({ title: 'horariosgetHorarios: ', details: horarios });
                }

                
                //Construcción de la tabla horarios
                fldtabla.defaultValue =
                "<style>"
                    + "#cuerpo:nth-child(even) {background-color: #F2F2F2;}"
                    + "#encabezado{background-color: #e0e6ef; color: #576f90; padding:10px;text-align:center;font-size:1.3rem;}"
                    + "#cuerpo{ background-color: #F2F2F2;color: grey;font-weight:100%;font-size:1rem;text-align: center;padding:10px}"  
                +"</style>" 

                +"<div>"
                    +"<table style='width:160%; margin-top:50px; margin-bottom: 100px; margin-right: 20px'>"
                        +"<thead>"
                            +"<tr>"
                                +"<th id='encabezado' colspan='4'>Horarios Disponibles</th>"
                            +"<tr>"
                            +"<tr>"
                                + "<th id='encabezado' style='width:5%'></th>"
                                + "<th id='encabezado' style='width:20%'>Horarios</th>"
                                + "<th id='encabezado'style='width:40%'>Disponibilidad</th>"
                                + "<th id='encabezado'>Notas</th>"
                            +"<tr>"
                        +"</thead>"

                        +"<tbody>";

                            if(horarios!=null){
                                for(var i = 0; i<horarios.length-1;i++){
                                    
                                    fldtabla.defaultValue += 
                                    "<tr>"
                                    //Variables que ayudarán a llenar el contenido de Disponibilidad y para habilitar o deshabilitar el check.
                                    var status ="";
                                    var statusCheck = "";
                                        
                                        /*For que recorrerá el arreglo de agenda y si encuentra coincidencias entre el horario y la agenda del empleado
                                        llenará los valores de status y statusCheck respectivamente*/

                                        for(var j = 0; j<agenda.length; j++){
                                            if(horarios[i] == agenda[j].starttime && agenda[j].status=='CONFIRMED'){
                                                status= "Ocupado";
                                                statusCheck = "disabled"

                                            }
                                        }
                                        fldtabla.defaultValue +="<td id='cuerpo'>"
                                            +"<input type='checkbox' class='check line_1' linea= "+i+" horario='"+horarios[i]+"'"+"horarioFin= '"+horarios[i+1]+"'"+statusCheck+" ></input>"                                      
                                        
                                        +"</td>"
                                        
                                        + "<td id='cuerpo'>"+horarios[i]+ " - "+horarios[i+1]+ "</td>"             
                                        +"<td id='cuerpo'>"+status+"</td>" 
                                        +"<td id='cuerpo'>" 
                                        +"<textarea name='comentario' class='notas line_1' id = 'notas"+i+"'></textarea></td>" 
                            
                                        fldtabla.defaultValue+ "</tr>"
                                }
                            }
                        fldtabla.defaultValue += "</tbody>"
                    +"</table>"
                +"</div>"

                scriptContext.response.writePage({
                    pageObject: form
                });

            } catch (e) {
                log.error({ title: 'onRequest', details: e });
                var error = errform(e);
                scriptContext.response.writePage({
                    pageObject: error
                });
            }

        }

        function sendEmployee(empleado){
            log.debug({title: 'sendEmployee: ', details: empleado});
            var idEmpleado ='';
            if(empleado != null && empleado != '' ){
                idEmpleado = empleado[0].id;
            }
            log.debug({title: 'sendEmployee',details: idEmpleado});
            return idEmpleado;
            
        }
        
        /**
         * Función que permitirá obtener el calendario del encargado del almacén.
         * @return Agenda[]
         */

        function getAgenda(empleado,dia){
            try{
                var empleadoID;
                log.debug({title:'empleado: ', details: empleado});
                if(empleado != '' && empleado != null){
                    for(var i = 0; i<empleado.length;i++){
                        empleadoID = empleado[i].id;
                        
                    }
                }
                else{
                    empleadoID = 0;
                }
                
                empleadoID.toString();

                var calendareventSearchObj = search.create({

                    type: search.Type.CALENDAR_EVENT,
                    filters:
                    [
                        
                        [["attendee",search.Operator.ANYOF,empleadoID],
                        "OR",
                        ["organizer",search.Operator.ANYOF,empleadoID]]
                        ,          
                        "AND", 
                        ["date",search.Operator.ON,dia,dia]
                    ],
                    columns:
                    [
                        search.createColumn({name: "title",sort: search.Sort.ASC,label: "Event"}),
                        search.createColumn({name: "startdate", label: "Start Date"}),
                        search.createColumn({name: "starttime", label: "Start Time"}),
                        search.createColumn({name: "endtime", label: "End Time"}),
                        search.createColumn({name: "status", label: "status"})
                    ]
                });
       
                var agendaA = new Array();
                calendareventSearchObj.run().each(function(result){
                    
                    var agenda = {
                        evento: '',
                        startdate: '',
                        starttime: '',
                        endtime: '',
                        status: ''
                    }
                    agenda.evento = result.getValue({ name: 'title' });
                    agenda.startdate = result.getValue({ name: 'startdate' });
                    agenda.starttime = result.getValue({ name: 'starttime' });
                    agenda.endtime = result.getValue({ name: 'endtime' });
                    agenda.status = result.getValue({name: 'status'});

                    agendaA.push(agenda);
                    return true;
                });

                return agendaA;

            }catch(e){
                log.error({title: "getAgenda: ",details:e});
                return [];
            }

        }

        /**
         * Función que permitirá obtener el objeto hora por hora de apertura a cierre.
         * @return hrs[].
         */

         function getHours(horario){
            try{
                
                //Obtención y parseo de la hora de apertura
                var apertura = horario.apertura;
                var horaParseadaApertura = parseInt(apertura, 10);
            
                //Obtención y parseo de la hora de cierre
                var cierre = horario.cierre;
                var horaParseadaCierre = parseInt(cierre, 10);
    
                //Obtener el formato configurado de fecha en SET preferences
                var userObj = config.load({
                    type: config.Type.USER_PREFERENCES,
                    isDynamic:false
                });
                var userPref = userObj.getValue({
                    fieldId: 'TIMEFORMAT'
                });

                //Validar que tipo de formato de hora se está utilizando.
                if(userPref == 'h:mm a'){

                    /*Validación de si existe la palabra pm en la hr de cierre,
                     si existe, convertira la hora en formato 24 hrs para posteriormente poder
                     recorrer el for correctamente
                    */
                    if(cierre.includes("pm")){
                        var hrCierre = getHoraFormat(horaParseadaCierre);

                    }

                    if(apertura.includes("pm")){
                        horaParseadaApertura = getHoraFormat(horaParseadaApertura);

                    }

                    //Creación de variable Date y seteo de la hora en 00:00:00
                    const event = new Date();
                    event.setHours(horaParseadaApertura-1, 0, 0, 0);

                    var hrs = new Array()
                        for (var i=horaParseadaApertura;i<=hrCierre;i++){

                            event.setHours(event.getHours()+1);
                            var nyTime = format.format({
                                value:event,
                                type:format.Type.TIMEOFDAY,
                                timezone:format.Timezone.AMERICA_MEXICO_CITY
                            });
                            hrs.push(nyTime);
                        }

                }

                else if(userPref == 'H:mm'){

                    const event = new Date();
                    event.setHours(horaParseadaApertura-1, 0, 0, 0);

                    var hrs = new Array()
                        for (var i=horaParseadaApertura;i<=horaParseadaCierre;i++){

                            event.setHours(event.getHours()+1);
                            var nyTime = format.format({
                                value:event,
                                type:format.Type.TIMEOFDAY,
                                timezone:format.Timezone.AMERICA_MEXICO_CITY
                            });
                            hrs.push(nyTime);
                        }
                }
                return hrs;
            }catch(e){
                log.error({title: "getHours: ", details: e});
            }
        }


        /**
         * Función que devolverá la hora formateada a 24 hrs.
         * @return hrFormatInt
         */

        function getHoraFormat(hora){
            try{
            //Arreglo con hrs Equivalentes.
            var hrs = ["13","14","15","16","17","18","19","20","21","22","23","24"];

            var hrFormat = hrs[hora-1];
            var hrFormatInt = parseInt(hrFormat,10);
            return hrFormatInt;
            
            
            }catch(e){
                log.error({title: "getHoraFormat: ", details: e});
            }
        }

         /**
         * Función que devolverá el horario de cierre y apertura asociado a la ubicación.
         * @return horarios
         */
        function getHorario(idLocation) {

            try {

                log.debug({title: 'getHorario id Location: ', details: idLocation});
                if(idLocation == null){
                    idLocation = "0";
                }
                // log.debug({ title: 'idLocation getHorario: ', details: idLocation })
                var customrecord_tkio_horario_locSearchObj = search.create({
                    // search.Type.EMPLOYEE"customrecord_tkio_horario_loc"
                    // type: "customrecord_tkio_horario_loc",
                    type: "customrecord_tkio_horario_loc",
                    filters:
                        [
                            ["custrecord_tkio_pp_localizacion", search.Operator.ANYOF, idLocation]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "custrecord_tkio_hr_apertura", label: "Hora Apertura" }),
                            search.createColumn({ name: "custrecord_tkio_hr_cierre", label: "Hora Cierre" })
                        ]
                });

                var horarios = new Array();
                var rangoHoras;
                customrecord_tkio_horario_locSearchObj.run().each(function (result) {
                    var horario = {
                        apertura: '',
                        cierre: ''
                    }
                    horario.apertura = result.getValue({ name: 'custrecord_tkio_hr_apertura' });
                    horario.cierre = result.getValue({ name: 'custrecord_tkio_hr_cierre' });
                    //Verificará el formato del horario
                    rangoHoras = getHours(horario);
                    horarios.push(horario);
                    
                    return true;
                });

                return rangoHoras;

            } catch (e) {
                log.error({ title: 'getHorario: ', details: e });
            }
        }

        /**
         * Función que devolverá el empleado (Encargado de almacén) asociado a la ubicación.
         * @return empleado.
         */

        function getEmployee(idLocation) {
            try {
                // if(idLocation != null || idLocation != ''){
                //     idLocation= '0';
                // }
                var employeeSearchObj = search.create({
                    type: search.Type.EMPLOYEE,
                    filters:
                        [
                            ["custentity_tkio_pp_adm_almacen", search.Operator.IS, "T"],
                            "AND",
                            ["location.internalid", search.Operator.ANYOF, idLocation]
                        ],
                    columns:
                        [
                            search.createColumn({ name: "internalid" }),
                            search.createColumn({ name: "entityid",sort: search.Sort.ASC,label: "Name"})
                        ]
                });

                var empleado = new Array();
                employeeSearchObj.run().each(function (result) {
                    var idEmployee = {
                        id: '',
                        name: ''
                    }
                    idEmployee.id = result.getValue({ name: 'internalid' });
                    idEmployee.name = result.getValue({ name: 'entityid' });

                    empleado.push(idEmployee);
                    return true;
                });

                return empleado;
            } catch (e) {
                log.debug({ title: 'getEmployee: ', details: e });
            }

        }

        /**
         * Función que devolverá las ubicaciones disponibles para el proveedor.
         * @return arrayLocations[ubicaciones].
         */
        function getLocations() {
            try {
                vendorid = runtime.getCurrentUser().id;//Obtener el actual proveedor.

                var vendorSearchObj = search.create({
                    type: search.Type.VENDOR,
                    filters:
                        [
                            ["internalid", search.Operator.IS, vendorid]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "internalid",
                                join: "CUSTENTITY_TKIO_PP_UBICACIONES",
                                label: "Internal ID"
                            }),
                            search.createColumn({
                                name: "name",
                                join: "CUSTENTITY_TKIO_PP_UBICACIONES",
                                label: "Name"
                            })
                        ]
                });
                var arrayLocation = new Array();

                vendorSearchObj.run().each(function (result) {
                    var idLocation = {
                        id: '',
                        name: ''
                    }
                    idLocation.id = result.getValue({ name: 'internalid', join: 'CUSTENTITY_TKIO_PP_UBICACIONES' });
                    idLocation.name = result.getValue({ name: 'name', join: "CUSTENTITY_TKIO_PP_UBICACIONES" });
                    arrayLocation.push(idLocation);
                    return true;
                });

                return arrayLocation;
            } catch (e) {
                log.error({ title: 'getLocations: ', details: e });
                return [];
            }
        }

        /**
         * Función errform que servirá para generar la página de error
         * en caso de haber uno
         * @param{details} -> Detalles del error
         */
        function errform(details) {
            try {
                var form = serverWidget.createForm({
                    title: 'Formulario de citas'
                });
                var htmlfld = form.addField({
                    id: 'custpage_msg_error',
                    label: ' ',
                    type: serverWidget.FieldType.INLINEHTML
                });
                htmlfld.defaultValue = '<b> Ha ocurrido un error, contacte con su administrador</b>' +
                    '<br/> Detalles: ' + JSON.stringify(details);

                return form;

            }
            catch (e) {
                log.error({ title: 'errForm', details: e });
            }
        }

        return { onRequest }

    });
