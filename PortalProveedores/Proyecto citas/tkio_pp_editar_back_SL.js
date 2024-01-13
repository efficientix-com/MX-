/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/search', 'N/ui/serverWidget', 'N/url','N/https','N/record','N/config','N/format','N/runtime','./moment','N/email'],
    /**
 * @param{currentRecord} currentRecord
 * @param{format} format
 * @param{http} http
 * @param{https} https
 * @param{log} log
 * @param{record} record
 */
    (log, search, serverWidget, url,https,record,config,format,runtime,moment,email) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        var estado='EXITO';
        var flagRecord=false;

        const onRequest = (scriptContext) => {
            try{
                var parameters = scriptContext.request.parameters;
                var data = scriptContext.request.body;
                /*Variable que permitirá controlar la agenda disponible */
                var flagAgenda = true;

                data = JSON.parse(data);
                log.debug({title: 'body: ', details: data});
                /*For que recorrera el objeto mandado desde el client script*/
                for(var i = 0; i<data.length;i++){

                    var horaInicio = getHoraFormat(data[i].horaInicio);
                    var horaFinal = getHoraFormat(data[i].horaFin);

                    dInicio = new Date();
                    dateInicio = horaInicio.split(':');
                    dInicio.setHours(+dateInicio[0]);
                    dInicio.setMinutes(+dateInicio[1]);

                    dFin = new Date();
                    dateFin = horaFinal.split(':');
                    dFin.setHours(+dateInicio[0]+1);
                    dFin.setMinutes(+dateInicio[1]);

                    var agenda = agendaProv(data[i].attendee,data[i].organizer,data[i].fecha);

                    /**Si se modifico el campo de fecha entra en el for */
                    if(data[i].flagInicio==true){

                        /**Recorrerá la agenda del empleado y proveedor */
                        for(var j = 0; j<agenda.length;j++){

                            var horaAgenda = getHoraFormat(agenda[j].starttime);
                            log.debug({title:'starttime: ',details:horaAgenda});
                            log.debug({title:'horaInicio: ',details:horaInicio});
                            /**Si la hora seteada es igual a alguna que ya existe marcar la bandera como false */
                            if(horaInicio == horaAgenda){
                                flagAgenda = false;
                            }
                        }
                    }

                    /**Si la bandera de agenda es verdadera, setear dato,sino, marcar como ocupado */
                    if(flagAgenda){
                        var objRecord = record.load({
                            type: record.Type.CALENDAR_EVENT,
                            id: data[i].idInterno,
                            isDynamic: true,
                        });

                        var date = moment(data[i].fecha,'D/M/YYYY');
    
                        objRecord.setValue({
                            fieldId: 'startdate',
                            value: new Date (date)        
                        });
    
                        objRecord.setValue({
                            fieldId: 'starttime',
                            value: dInicio
                        });

                        objRecord.setValue({
                            fieldId: 'endtime',
                            value: dFin
                        });
    
                        objRecord.setValue({
                            fieldId: 'custevent_tkio_pp_notas',
                            value: data[i].nota
                        });

                        if(data[i].cancelar==false){
                            objRecord.setValue({
                                fieldId: 'status',
                                value: 'CONFIRMED'
                            });

                        }else{
                            objRecord.setValue({
                                fieldId: 'status',
                                value: 'CANCELLED'
                            });
                            flagCheck = false;
                        }

                        

                        flagRecord = true;
                    }

                    else{
                        estado = 'OCUPADO';
                        flagRecord = false;
                    }

                    if(flagRecord){
                        var emailobj = record.load({
                            type:'emailtemplate',
                            id:428
                        });
                        objRecord.save();
                        estado = 'EXITO';

                        var empleado =getNameEmployee(data[i].organizer);
                        var proveedor = getNameVendor(data[i].attendee);

                        const senderId = data[i].organizer;
                        const recipientEmail = data[i].attendee;
                        const fecha =data[i].fecha; 
                        const horaInicio = data[i].horaInicio;

                        
                        var subject= emailobj.getValue({fieldId:'subject'});
                        var body =emailobj.getValue({fieldId:'content'});
                        
                        var cuerpo = buildBody(body,empleado,proveedor,fecha,horaInicio);

                        sendEmail(senderId,recipientEmail,subject,cuerpo);
                    }
                    
                    
                }
                var response = scriptContext.response;
                    response.write({
                       output: JSON.stringify({success:estado})
                    });
   
            }catch(e){
                log.error({title: 'onRequest:', details:e});
                estado='ERROR_SCRIPT';
                var response = scriptContext.response;
                    response.write({
                       output: JSON.stringify({success:estado})
                    });
            }

        }

        /**
         * Función que servirá para obtener el nombre del proveedor
         * @param {*} vendorId 
         * @returns 
         */
        function getNameVendor(vendorId){
            try{
                var vendor = vendorId.toString();
                log.debug({title:'vendor: ',details:vendor});
                var vendorSearchObj = search.create({
                    type: search.Type.VENDOR,
                    filters:
                    [
                       ["internalid",search.Operator.ANYOF,vendor]
                    ],
                    columns:
                    [
                       search.createColumn({
                          name: "entityid",
                          sort: search.Sort.ASC,
                          label: "Name"
                       })
                    ]
                 });
                 
                 var resultVendor;
                 vendorSearchObj.run().each(function(result){
                    var vendor = {
                        name: '',
                    }
                    vendor.name = result.getValue({ name: 'entityid' });
                    resultVendor = vendor.name;
                    return true;
                 });
                 log.debug({title:'resultVendor: ',details:resultVendor});
                 return resultVendor;

            }catch(e){
                log.error({title:'getNameVendor: ',details:e});
            }
        }

        /**
         * Función que servirá para obtener el nombre del empleado.
         * @param {*} empleado 
         * @returns Nombreempleado
         */
        function getNameEmployee(empleado){
            try{
                idEmployee = empleado.toString();
                log.debug({title:'empleado: ',details:empleado});
                var employeeSearchObj = search.create({
                    type: search.Type.EMPLOYEE,
                    filters:
                    [
                       ["internalid",search.Operator.ANYOF,idEmployee]
                    ],
                    columns:
                    [
                       search.createColumn({
                          name: "entityid",
                          sort: search.Sort.ASC,
                          label: "Name"
                       })
                    ]
                 });
                 
                 var resultEmployee;
                 employeeSearchObj.run().each(function(result){
                    var employee = {
                        name: '',
                    }
                    employee.name = result.getValue({ name: 'entityid' });
                    resultEmployee = employee.name;
                    return true;
                 });
                 log.debug({title:'employee',details: resultEmployee});
                 return resultEmployee;
            }catch(e){
                log.error({title:'getNameEmployee: ',e});
            }
        }


        /**
         * Función que servirá para construir un nuevo cuerpo de correo electrónico con los datos
         * requeridos.
         * @param {*} body 
         * @param {*} empleado 
         * @param {*} proveedor 
         * @param {*} fecha 
         * @param {*} horaInicio 
         * @returns cuerpo 
         */
        function buildBody(body,empleado,proveedor,fecha,horaInicio){
            try{
                var id_body_fields = new Array();

                for(var i=0; i<body.length;i++){
                    var caracter = body[i];

                    if(caracter == '{'){
                        inicio = i;
                    }
                    if(caracter == '}'){
                        fin =i+1;
                        campo_id = body.slice(inicio,fin);
                        id_body_fields.push(campo_id);
                    }

                }
                log.debug({title: 'id_fields_body',details: id_body_fields});
                log.debug({title: 'body: ',details:body});
                var newText = '';
                for (var x = 0; x < id_body_fields.length; x++) {
                    log.debug({title: 'id_body_fields: ',details:id_body_fields});
                    if(id_body_fields[x]=='{proveedor}'){
                        newText = body.replace(id_body_fields[x], proveedor);
                    }
                    if(id_body_fields[x]=='{empleado}'){
                        newText = body.replace(id_body_fields[x], empleado);
                    }
                    if(id_body_fields[x]=='{fecha}'){
                        newText = body.replace(id_body_fields[x], fecha);
                    }
                    if(id_body_fields[x]=='{horaInicio}'){
                        newText = body.replace(id_body_fields[x], horaInicio);
                    }
                    body = newText;
                }
                body = body.replace(/{/g, '');
                body = body.replace(/}/g, '');
                log.debug({title: 'body2: ',details:body});
                return body;
            }
            catch(e){
                log.error({title:'BuildBody: ',details: e});
            }
        }
        
        /**
         * Función que servirá para mandar email de que la cita se modificó correctamente.
         * @param {} senderId 
         * @param {} recipientEmail 
         * @param {} subject 
         * @param {} body 
         * @returns 
         */
        function sendEmail(senderId,recipientEmail,subject,body){
            try{
                log.debug({title: 'senderId: ',details: senderId});
                log.debug({title: 'recipientEmail: ',details: recipientEmail});
                log.debug({title: 'subject: ',details: subject});
                log.debug({title: 'body: ',details: body});

                email.send({
                    author: senderId,
                    recipients: recipientEmail,
                    subject: subject,
                    body: body
                });

            }catch(e){
                log.error({title: 'Error en método send', details: e});
                return {success: false, details: 'No fue posible enviar el correo'}
            }
        }
        /**
         * Función que devolverá la agenda del empleado y el proveedor
         * @param attende
         * @param organizer
         * @param fecha
         * @return agenda[]
         */

        function agendaProv(attende,organizer,fecha){
            try{
                var calendareventSearchObj = search.create({
                    type: search.Type.CALENDAR_EVENT,
                    filters:
                    [
                    ["attendee",search.Operator.ANYOF,attende], 
                    "AND", 
                    ["organizer",search.Operator.ANYOF,organizer], 
                    "AND", 
                    ["date",search.Operator.WITHIN,fecha,fecha]
                    ],
                    columns:
                    [
                    search.createColumn({
                        name: "title",
                        sort: search.Sort.ASC,
                        label: "Event"
                    }),
                    search.createColumn({name: "startdate", label: "Start Date"}),
                    search.createColumn({name: "starttime", label: "Start Time"}),
                    search.createColumn({name: "endtime", label: "End Time"})
                    ]
                });

                var agenda = new Array();
                calendareventSearchObj.run().each(function(result){
                    var agendaProv = {
                        startdate: '',
                        starttime: '',
                        endtime: '',
                    }
                    agendaProv.startdate = result.getValue({name: 'startdate'});
                    agendaProv.starttime = result.getValue({ name: 'starttime' });
                    agendaProv.endtime = result.getValue({ name: 'endtime' });
                    agenda.push(agendaProv);
                    return true;
             });

             return agenda;
            }catch(e){
                log.error({title:'agendaProv: ',details:e});
                return [];
            }


        }

        /**
         * Función que devolverá la hora formateada a 24 hrs.
         * @param hora
         * @return hrFormatInt
         */

         function getHoraFormat(hora){
            try{
            
            if(hora.includes("am")){
                var horaI = hora.split(' ')
                var horaIFormat = horaI[0];
                return horaIFormat;
            }else if(hora.includes("pm")){
                if(hora=='12:00 pm'){
                    hora = "12:00";
                    return hora;
                }else{

                    var horaParseada = parseInt(hora, 10);
                    var hrs = ["13","14","15","16","17","18","19","20","21","22","23","24"];

                    var hrFormat = hrs[horaParseada-1];
                   return hrFormat.toString()+":00";
                }
                
            }else{
                return hora;
            }

            }catch(e){
                log.error({title: "getHoraFormat: ", details: e});
            }
    }

        return {onRequest}

    });
