/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/log', 'N/url', 'N/record', 'N/currentRecord', 'N/format','N/ui/message','./moment'],
    /**
     * @param{https} https
     * @param{log} log
     * @param{url} url
     */
    function (https, log, url, record, currentRecord, format,message,moment) {
        var horarios = new Array();
        var fechaFormat = '';

        const fecha = new Date();
        fecha.setDate(fecha.getDate());

        var fechaFormatHoy = format.format({
            value:fecha,
            type: format.Type.DATE 
        });

        var mensajeFecha = message.create({
            type: message.Type.CONFIRMATION,
            title: "Fecha seleccionada correctamente",
            message: "Fecha seleccionada correctamente"
        });
        
        

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {
           
            var elements = document.getElementsByClassName("check line_1");
            // var horarios = new Array();

            function myFunction(){
                var idNotas = null;
                if(this.checked){
                    
                    var linea =this.getAttribute("linea");//Obtengo el valor de la línea

                    idNotas = document.getElementById("notas"+linea).value;
                    horario = this.getAttribute("horario");
                    horarioFin = this.getAttribute("horarioFin");

                    var obj = {
                        hora : horario,
                        horaFin: horarioFin,
                        id_notas : idNotas

                    }
                    horarios.push(obj);
                    
                }else{
                    var linea =this.getAttribute("linea");//Obtengo el valor de la línea
                    horario = this.getAttribute("horario");
                    horarios = horarios.filter(item => item.hora !== horario);
                }

                console.log(horarios);
            }

            for (var i = 0; i < elements.length; i++) {
                elements[i].addEventListener('click',myFunction, false);             
            }

        }


        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            try{        
                var currentForm = currentRecord.get();

                var fechaPantalla = currentForm.getValue({
                    fieldId: 'custpage_tkio_pp_fecha'
                });

                var locations = currentForm.getValue({
                    fieldId: 'custpage_tkio_pp_ubicaciones'
                });

                fechaFormat = format.format({
                    value:new Date(fechaPantalla),
                    type: format.Type.DATE 
                });

                if ((scriptContext.fieldId == 'custpage_tkio_pp_ubicaciones' && fecha!="") || (scriptContext.fieldId == 'custpage_tkio_pp_fecha'&& locations!="") ) {
                    mensajeFecha.hide();
                    var out = url.resolveScript({
                        scriptId: 'customscript_tkio_citas_prov_sl',
                        deploymentId: 'customdeploy_tkio_citas_prov_sl',
                        params: {locations:locations,fechaFormat:fechaFormat}
                    });


                    console.log('fechaPantalla: '+fechaFormat);
                    console.log('fechaHoy: '+fechaFormatHoy);

                    var fechaScreen = moment(fechaFormat,'D/M/YYYY');
                    var fechaHoyNew = moment(fechaFormatHoy,'D/M/YYYY');


                    if(fechaScreen>=fechaHoyNew){
                        mensajeFecha.show();
                        setTimeout(function() {
                            openWindow = window.open(out, '_self', null); 
                        }, 2000);
                    }else{
                        mensajeFecha = message.create({
                            type: message.Type.ERROR,
                            title: "Error en la selección fecha",
                            message: "No ha seleccionado una fecha correcta"
                        });
                        mensajeFecha.show();
                        setTimeout(location.reload(), 4000);
                    }
                    
                    

                }
            }catch(e){
                log.debug({title: 'Error: ',details:e});

            }


    }

        /**
         * Function to be executed when field is slaved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         *
         * @since 2015.2
         */
        function postSourcing(scriptContext) {

    }

        /**
         * Function to be executed after sublist is inserted, removed, or edited.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function sublistChanged(scriptContext) {

    }

        /**
         * Function to be executed after line is selected.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @since 2015.2
         */
        function lineInit(scriptContext) {

    }

        /**
         * Validation function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @returns {boolean} Return true if field is valid
         *
         * @since 2015.2
         */
        function validateField(scriptContext) {

    }

        /**
         * Validation function to be executed when sublist line is committed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateLine(scriptContext) {

    }

        /**
         * Validation function to be executed when sublist line is inserted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateInsert(scriptContext) {

    }

        /**
         * Validation function to be executed when record is deleted.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         *
         * @returns {boolean} Return true if sublist line is valid
         *
         * @since 2015.2
         */
        function validateDelete(scriptContext) {

    }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

    }

    function enviar(empleado,fecha,objVendor){

        try{
            var mensajeInfo = message.create({
                type: message.Type.INFORMATION,
                title: "Estado de la solicitud en proceso",
                message: "Se están agendando tus citas."
            });

            mensajeInfo.show({ duration : 1500 });

            if(horarios.length != 0){
                var objHorario = {
                    horaCita: horarios,
                    employee: empleado,
                    fecha: fecha,
                    objVendor: objVendor
                }
                
                console.log('datosSend: '+objHorario);
                    var out = url.resolveScript({
                        scriptId: 'customscript_tkio_citas_prov_back_sl',
                        deploymentId: 'customdeploy_tkio_citas_prov_back_sl',
                        returnExternalUrl: true
                    });

                    var response = https.post({
                        url:out,
                        body: JSON.stringify(objHorario)
                    });
                    
                    var respuesta = JSON.parse(response.body);
                    console.log(respuesta);

                    if(respuesta.success=='T'){
                        console.log("Se proceso exitosamente");
                        mensajeInfo.hide();
                        var msgbody = message.create({
                            type: message.Type.CONFIRMATION,
                            title: "CITA PROCESADA CORRECTAMENTE",
                            message: "CITA PROCESADA CORRECTAMENTE"
                        });
                        msgbody.show();
                        setTimeout(location.reload(),4000);
                    }
                    else if(respuesta.success=='F'){
                        mensajeInfo.hide();
                        var msgbody = message.create({
                            type: message.Type.ERROR,
                            title: "ERROR EN LA CREACIÓN DE LA CITA",
                            message: "No selecciono una fecha correcta."
                        });
                        setTimeout(function() {
                            msgbody.show({ duration : 7000 }); 
                        }, 2000);
                    }
                    else{
                        
                        var msgbody = message.create({
                            type: message.Type.ERROR,
                            title: "ERROR EN LA CREACIÓN DE LA CITA",
                            message: "ERROR AL MOMENTO DE CREAR CITA."
                        });
                        setTimeout(function() {
                            msgbody.show({ duration : 7000 }); 
                        }, 2000);
                    }
                }else{

                    var msgbody = message.create({
                        type: message.Type.ERROR,
                        title: "Sin selección de horarios",
                        message: "No ha seleccionado horario para agendar cita."
                    });
                    
                    setTimeout(function() {
                        msgbody.show({ duration : 7000 }); 
                    }, 2000);
                    

                }
            

        }catch(e){
        log.error({title: 'enviar: ', details: e});
        }

    }

        return {
    pageInit: pageInit,
    fieldChanged: fieldChanged,
    enviar:enviar
};

    });
