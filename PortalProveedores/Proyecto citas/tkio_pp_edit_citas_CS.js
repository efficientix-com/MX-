/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/https', 'N/log', 'N/url', 'N/record', 'N/currentRecord', 'N/format', 'N/ui/message', './moment'],

    function (https, log, url, record, currentRecord, format, message, moment) {
        /**
         * Variables Globales:
         * out: Para la salida de parámetros
         * fechaInicioFormat: fecha formateada de inicio
         * fechaFinFormat: fecha formateada de Fin
         */
        var out;
        var fechaInicioFormat;
        var fechaFinFormat;
        /**
         * Banderas globales para control de cambios
         * flag: Bandera general para ver si hubo algún cambio en los campos.
         * flagInicio: Bandera que controla si hubo cambio en la hora de inicio de la cita.
         * flagNota: Bandera que controla si hubo cambios en las notas de la cita.
         * flagCheck: Bandera que controla si hubo cambio en el check de cancelar.
         */
        var flag = false;//Permitirá observar si algun campo fue modificado
        var flagInicio = false;
        var flagNota = false;
        var flagCheck = false;

        /**Variable global fecha que servirá para obtener la fecha de hoy */
        const fecha = new Date();
        fecha.setDate(fecha.getDate());
        var fechaFormatHoy = format.format({
            value: fecha,
            type: format.Type.DATE
        });

        /**Variable de tipo array para detectar múltiples cambios en diferentes citas */
        var agenda = new Array();

        /*Objeto que será llenado con información de los cambios */
        var objCita = {

        }

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

            var currentForm = currentRecord.get();

            if ((scriptContext.fieldId == 'custpage_tkio_pp_fecha_inicio' && fechaFin != "") || (scriptContext.fieldId == 'custpage_tkio_pp_fecha_final' && fechaInicio != "")) {
                
                var fechaInicio = currentForm.getValue({
                    fieldId: 'custpage_tkio_pp_fecha_inicio'
                });

                var fechaFin = currentForm.getValue({
                    fieldId: 'custpage_tkio_pp_fecha_final'
                });

                fechaInicioFormat = formatDates(fechaInicio);
                fechaFinFormat = formatDates(fechaFin);

                /*Mandar como parametros al suitelet las fechas inicio y fin para su futuro uso */
                out = url.resolveScript({
                    scriptId: 'customscript_tkio_pp_edit_sl',
                    deploymentId: 'customdeploy_tkio_pp_editar_sl',
                    params: { fechaInicioFormat: fechaInicioFormat, fechaFinFormat: fechaFinFormat }
                });

            }


            if (scriptContext.fieldId == 'custpage_tkio_pp_hr_inicio') {

                flag = true;
                var fecha = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_fecha'
                });

                var fechaFormat = formatDates(fecha);

                var horaInicio = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_hr_inicio'
                });

                var horaFin = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_hr_final'
                });

                var notas = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_notas'
                });

                var check = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_check_cancel'
                });

                var id = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_internalid'
                });

                var attendee = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_attendee'
                });

                var organizer = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_organizer'
                });

                horaInicioFormat = format.format({
                    value: horaInicio,
                    type: format.Type.TIMEOFDAY
                });

                horaFinFormat = format.format({
                    value: horaFin,
                    type: format.Type.TIMEOFDAY
                });

                flagInicio = true;

                if (!objCita.hasOwnProperty(scriptContext.line)) {
                    objCita[scriptContext.line] = {
                        fecha: fechaFormat,
                        horaInicio: horaInicioFormat,
                        horaFin: horaFinFormat,
                        nota: notas,
                        cancelar: check,
                        idInterno: id,
                        attendee: attendee,
                        organizer: organizer,
                        flagInicio: flagInicio,
                        flagNota: flagNota,
                        flagCheck: flagCheck
                    }
                }
                else {
                    objCita[scriptContext.line]['horaInicio'] = horaInicioFormat;
                }

            }
            else if (scriptContext.fieldId == 'custpage_tkio_pp_notas' || scriptContext.fieldId == 'custpage_tkio_pp_check_cancel') {
                flag = true;

                var fecha = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_fecha'
                });
                var fechaFormat = formatDates(fecha);

                var horaInicio = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_hr_inicio'
                });

                var horaFin = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_hr_final'
                });

                var notas = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_notas'
                });

                var check = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_check_cancel'
                });

                var id = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_internalid'
                });

                var attendee = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_attendee'
                });

                var organizer = currentForm.getCurrentSublistValue({
                    sublistId: 'custpage_tkio_pp_fechas',
                    fieldId: 'custpage_tkio_pp_organizer'
                });

                horaInicioFormat = format.format({
                    value: horaInicio,
                    type: format.Type.TIMEOFDAY
                });

                horaFinFormat = format.format({
                    value: horaFin,
                    type: format.Type.TIMEOFDAY
                });

                flagNota = true;

                /**Si el objeto no tiene propiedades, agregarlas al objeto */
                if (!objCita.hasOwnProperty(scriptContext.line)) {
                    objCita[scriptContext.line] = {
                        fecha: fechaFormat,
                        horaInicio: horaInicioFormat,
                        horaFin: horaFinFormat,
                        nota: notas,
                        cancelar: check,
                        idInterno: id,
                        attendee: attendee,
                        organizer: organizer,
                        flagInicio: flagInicio,
                        flagNota: flagNota,
                        flagCheck: flagCheck
                    }
                }
                else {
                    objCita[scriptContext.line]['nota'] = notas;
                    objCita[scriptContext.line]['cancelar'] = check;
                    objCita[scriptContext.line]['flagNota'] = flagNota;
                    objCita[scriptContext.line]['flagCheck'] = flagCheck;
                }



            }
            console.log(JSON.stringify(objCita));
        }

        /**
             * Función que permitirá formatear las fechas dadas.
             * @params date
             * @return fechaFormat
             */
        function formatDates(date) {
            fechaFormat = format.format({
                value: new Date(date),
                type: format.Type.DATE
            });
            return fechaFormat;
        }

        /**
         * Función que permitirá filtrar las citas agendadas por parte del proveedor y los administradores de almacén
         */
        function filtrar() {
            try {
                if (fechaInicioFormat != 'NaN/NaN/ NaN' && fechaFinFormat != 'NaN/NaN/ NaN') {
                    console.log('fechaInicio: ' + fechaFormatHoy);
                    console.log('fechaFin: ' + fechaInicioFormat);
                    var fechaNew = moment(fechaInicioFormat, 'D/M/YYYY');
                    var fechaHoyNew = moment(fechaFormatHoy, 'D/M/YYYY');
                    if (fechaNew >= fechaHoyNew) {
                        window.open(out, '_self', null, false);
                    } else {
                        var mensajeFecha = message.create({
                            type: message.Type.ERROR,
                            title: "Fecha de inicio incorrecta",
                            message: "Asegurese que la fecha de inicio no sea antes que la fecha actual."
                        });
                        mensajeFecha.show({ duration: 5000 });
                    }

                } else {
                    var mensajeFecha = message.create({
                        type: message.Type.ERROR,
                        title: "No se pudo hacer el filtrado de la fecha",
                        message: "Asegurese de ingresar fecha de inicio y fecha de fin."
                    });
                    mensajeFecha.show({ duration: 5000 });


                }
            } catch (e) {
                log.error({ title: 'filtrar: ', details: e });
            }
        }

        /**
         * Función que se ejecutará cuando se le de clic al botón de guardar y se encargará de realizar la cita
         */
        function guardar(userVendor) {
            try {
                Object.keys(objCita).forEach((line) => {
                    agenda.push(objCita[line]);
                })

                if (flag) {
                    var guardar = url.resolveScript({
                        scriptId: 'customscript_tkio_pp_editar_back_sl',
                        deploymentId: 'customdeploy_tkio_pp_editar_back_sl',
                        returnExternalUrl: true
                    });

                    var response = https.post({
                        url: guardar,
                        body: JSON.stringify(agenda,userVendor)
                    });

                    var respuesta = JSON.parse(response.body);
                    console.log(respuesta);

                    if (respuesta.success == 'EXITO') {
                        var mensajeFecha = message.create({
                            type: message.Type.CONFIRMATION,
                            title: "Cambios realizados correctamente",
                            message: "Cambios realizados correctamente."
                        });

                        mensajeFecha.show({ duration: 5000 });
                        setTimeout(location.reload(), 4000);
                    }
                    else if (respuesta.success == 'OCUPADO') {
                        var mensajeFecha = message.create({
                            type: message.Type.ERROR,
                            title: "AGENDA OCUPADA",
                            message: "No se pudo realizar el cambio ya que la agenda del empleado o del proveedor están ocupados"
                        });

                        mensajeFecha.show({ duration: 5000 });
                        setTimeout(location.reload(), 4000);

                    }
                    else if (respuesta.success == 'ERROR_SCRIPT') {
                        var mensajeFecha = message.create({
                            type: message.Type.ERROR,
                            title: "ERROR DE SCRIPT",
                            message: "No se pudo realizar el cambio ya que ocurrio un error con el script. Contacte al administrador."
                        });

                        mensajeFecha.show({ duration: 5000 });
                    }
                } else {
                    var mensajeFecha = message.create({
                        type: message.Type.ERROR,
                        title: "No realizó ningún cambio",
                        message: "Asegurese de realizar algún cambio en alguna cita."
                    });
                    mensajeFecha.show({ duration: 5000 });
                }

            } catch (e) {
                log.error({ title: 'guardar: ', details: e });
            }
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            filtrar: filtrar,
            guardar: guardar
        };

    });
