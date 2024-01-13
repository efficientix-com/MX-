/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/search', 'N/ui/serverWidget', 'N/https', 'N/record', 'N/runtime', 'N/format', 'N/currentRecord','N/config','N/url'],
    /**
 * @param{currentRecord} currentRecord
 * @param{format} format
 * @param{https} https
 * @param{log} log
 * @param{record} record
 * @param{runtime} runtime
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
            try{
                
                var parameters = scriptContext.request.parameters;
                var fechaInicio =  parameters.fechaInicioFormat;
                var fechaFin = parameters.fechaFinFormat;
                
                var userVendor = runtime.getCurrentUser().id;
                log.debug({title:'userVendor: ',details: userVendor});
                var form = serverWidget.createForm({
                    title: 'Citas'
                });

                form.clientScriptModulePath = './tkio_pp_edit_citas_CS.js';

                form.addButton({
                    id: 'custpage_tkio_pp_actualizar',
                    label: 'Filtrar',
                    functionName: 'filtrar()'
                });

                var fldDateInit = form.addField({
                    id: 'custpage_tkio_pp_fecha_inicio',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha Inicio'
                }); 

                fldDateInit.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });

                var fldDateFinish = form.addField({
                    id: 'custpage_tkio_pp_fecha_final',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha Final'
                });
             
                var citas = getCitas(fechaInicio,fechaFin,userVendor);

                form.addButton({
                    id: 'custpage_tkio_pp_actualizar',
                    label: 'Guardar',
                    functionName: 'guardar("'+userVendor+'")'
                });

                var sublistdatos = form.addSublist({
                    id: 'custpage_tkio_pp_fechas',
                    label: 'Citas Agendadas',
                    type: serverWidget.SublistType.LIST
                });
                
                var date = sublistdatos.addField({
                    id: 'custpage_tkio_pp_fecha',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha'
                });
                date.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN

                });

                //Campo Date para poder mostrar la fecha
                var dateNormal = sublistdatos.addField({
                    id: 'custpage_tkio_pp_fecha_normal',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha'
                });

                dateNormal.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL

                });


                var id = sublistdatos.addField({
                    id: 'custpage_tkio_pp_internalid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Internal ID'
                });

                id.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var attendee = sublistdatos.addField({
                    id: 'custpage_tkio_pp_attendee',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Attendee'
                });

                attendee.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var organizer = sublistdatos.addField({
                    id: 'custpage_tkio_pp_organizer',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Organizer'
                });

                organizer.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var horaInicio = sublistdatos.addField({
                    id: 'custpage_tkio_pp_hr_inicio',
                    type: serverWidget.FieldType.TIMEOFDAY,
                    label: 'Hora Inicio'
                });

                horaInicio.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                });

                var horaFinal = sublistdatos.addField({
                    id: 'custpage_tkio_pp_hr_final',
                    type: serverWidget.FieldType.TIMEOFDAY,
                    label: 'Hora Fin'
                });

                horaFinal.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var horaFinalNormal = sublistdatos.addField({
                    id: 'custpage_tkio_pp_hr_final_normal',
                    type: serverWidget.FieldType.TIMEOFDAY,
                    label: 'Hora Fin'
                });

                horaFinalNormal.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.NORMAL
                });

                var notas = sublistdatos.addField({
                    id: 'custpage_tkio_pp_notas',
                    type: serverWidget.FieldType.TEXTAREA,
                    label: 'Nota'
                });

                notas.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                });

                sublistdatos.addField({
                    id: 'custpage_tkio_pp_status',
                    type: serverWidget.FieldType.TEXTAREA,
                    label: 'Status'
                });

                var cancelar = sublistdatos.addField({
                    id: 'custpage_tkio_pp_check_cancel',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Cancelar cita'
                });

                for (var i = 0; i < citas.length; i++) {

                    sublistdatos.setSublistValue({
                        id: 'custpage_tkio_pp_internalid',
                        line: i,
                        value: citas[i].id
                    });

                    sublistdatos.setSublistValue({
                        id: 'custpage_tkio_pp_attendee',
                        line: i,
                        value: citas[i].attendee
                    });

                    sublistdatos.setSublistValue({
                        id: 'custpage_tkio_pp_organizer',
                        line: i,
                        value: citas[i].organizer
                    });

                    sublistdatos.setSublistValue({
                        id: 'custpage_tkio_pp_fecha',
                        line: i,
                        value: citas[i].startdate
                    });

                    sublistdatos.setSublistValue({
                        id: 'custpage_tkio_pp_fecha_normal',
                        line: i,
                        value: citas[i].startdate
                    });

                    sublistdatos.setSublistValue({
                        id: 'custpage_tkio_pp_hr_inicio',
                        line: i,
                        value: citas[i].starttime
                    });
                    sublistdatos.setSublistValue({
                        id: 'custpage_tkio_pp_hr_final',
                        line: i,
                        value: citas[i].endtime
                    });

                    sublistdatos.setSublistValue({
                        id: 'custpage_tkio_pp_hr_final_normal',
                        line: i,
                        value: citas[i].endtime
                    });

                    log.debug({title: 'Notas: ',details: citas[i].notes});
                    if(citas[i].notes=='' ||citas[i].notes==null ){
                        sublistdatos.setSublistValue({
                            id: 'custpage_tkio_pp_notas',
                            line: i,
                            value: '--'
                        });
                        
                    }else{
                        sublistdatos.setSublistValue({
                            id: 'custpage_tkio_pp_notas',
                            line: i,
                            value: citas[i].notes
                        });
                        
                    }

                    var status = sublistdatos.setSublistValue({
                        id: 'custpage_tkio_pp_status',
                        line: i,
                        value: citas[i].status
                    });

                }

                if (parameters.fechaInicioFormat) {
                    fldDateInit.defaultValue = parameters.fechaInicioFormat;
                }
                if (parameters.fechaFinFormat) {
                    fldDateFinish.defaultValue = parameters.fechaFinFormat;
                }

                scriptContext.response.writePage({
                    pageObject: form
                });

            }catch (e) {
                log.error({ title: 'onRequest', details: e });
                var error = errform(e);
                scriptContext.response.writePage({
                    pageObject: error
                });
            }

        }

        /**
         * Función para obtener la agenda del proveedor
         * @param fechaInicio
         * @param fechaFin
         * @param userVendor
         * @return agendaProveedor
         */
        function getCitas(fechaInicio,fechaFin,userVendor){
            try{
                var calendareventSearchObj = search.create({
                    type: search.Type.CALENDAR_EVENT,
                    filters:
                    [
                    ["date",search.Operator.WITHIN,fechaInicio,fechaFin], 
                    "AND", 
                    ["attendee",search.Operator.ANYOF,userVendor]
                    ],
                    columns:
                    [
                    search.createColumn({name: "startdate", label: "Start Date"}),
                    search.createColumn({name: "starttime", label: "Start Time"}),
                    search.createColumn({name: "endtime", label: "End Time"}),
                    search.createColumn({name: "custevent_tkio_pp_notas", label: "Notas de proveedores"}),
                    search.createColumn({name: "status", label: "Status"}),
                    search.createColumn({name: "internalid", label: "Internal ID"}),
                    search.createColumn({name: "attendee", label: "Attendee"}),
                    search.createColumn({name: "organizer", label: "Organizer"})
                    ]
                });

                var agendaProveedor =  new Array();
                calendareventSearchObj.run().each(function(result){
                        
                    var agendaProv = {
                        startdate: '',
                        starttime: '',
                        endtime: '',
                        notes : '',
                        status : '',
                        id: '',
                        attendee: '',
                        organizer: ''
                    }
                    agendaProv.startdate = result.getValue({ name: 'startdate' });
                    agendaProv.starttime = result.getValue({ name: 'starttime' });
                    agendaProv.endtime = result.getValue({ name: 'endtime' });
                    agendaProv.notes = result.getValue({ name: 'custevent_tkio_pp_notas' });
                    agendaProv.status = result.getValue({ name: 'status' });
                    agendaProv.id = result.getValue({ name: 'internalid' });
                    agendaProv.attendee = result.getValue({ name: 'attendee' });
                    agendaProv.organizer = result.getValue({ name: 'organizer' });
                    agendaProveedor.push(agendaProv);
                    return true;
                });

                return agendaProveedor;
        }catch(e){
            log.error({title: "getCitas: ",details:e});
            return [];
        }

        }

        /**
         * Función errform que servirá para generar la página de error
         * en caso de haber uno
         * @param{details} -> Detalles del error
         * @return formError
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

        return {onRequest}

    });
