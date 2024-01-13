/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/search', 'N/ui/serverWidget', 'N/url', 'N/https', 'N/record', 'N/config', 'N/format', 'N/runtime', './moment', 'N/email'],
   /**
* @param{log} log
* @param{search} search
* @param{serverWidget} serverWidget
*/
   (log, search, serverWidget, url, https, record, config, format, runtime, moment, email) => {
      /**
       * Defines the Suitelet script trigger point.
       * @param {Object} scriptContext
       * @param {ServerRequest} scriptContext.request - Incoming request
       * @param {ServerResponse} scriptContext.response - Suitelet response
       * @since 2015.2
       */
      const fecha = new Date();
      fecha.setDate(fecha.getDate());

      
      const onRequest = (scriptContext) => {

         try {
            var fechaFormatHoy = format.format({
               value: fecha,
               type: format.Type.DATE
            });
            //Request de datos enviados desde tkio_citas_prov_CS
            var data = scriptContext.request.body;
            data = JSON.parse(data);
            log.debug({ title: 'body: ', details: data });

            // //Obtener el nombre de la compañía
            // vendorid = runtime.getCurrentUser();
            // log.debug({title: 'vendorid: ',details: vendorid.id});


            log.debug({ title: 'fecha ', details: data.fecha });
            var bandera = true;
            if (data.horaCita.length) {

               for (var i = 0; i < data.horaCita.length; i++) {

                  // log.debug({title: 'hora: ', details: data.horaCita[i].hora});

                  horaFormat = format.parse({
                     value: new Date(data.horaCita[i].hora),
                     type: format.Type.TIMEOFDAY
                  });

                  horaFormatFin = format.parse({
                     value: new Date(data.horaCita[i].horaFin),
                     type: format.Type.TIMEOFDAY
                  });

                  // log.debug({title:'fechaFormat: ',details: fechaFormat});

                  var eventRecord = record.create({
                     type: record.Type.CALENDAR_EVENT,
                  });

                  eventRecord.setValue({
                     fieldId: 'title',
                     value: 'Cita con proveedor: ' + data.objVendor
                  });

                  eventRecord.setValue({
                     fieldId: 'organizer',
                     value: data.employee
                  });

                  eventRecord.setValue({
                     fieldId: 'starttime',
                     value: horaFormat
                  });

                  eventRecord.setValue({
                     fieldId: 'endtime',
                     value: horaFormatFin
                  });

                  var fecha = data.fecha;
                  var date = moment(fecha, 'D/M/YYYY');

                  eventRecord.setValue({
                     fieldId: 'startdate',
                     value: new Date(date)
                  });

                  eventRecord.setSublistValue({
                     sublistId: 'attendee',
                     fieldId: 'attendeetype',
                     line: 0,
                     value: 'attendeetype'
                  });

                  eventRecord.setSublistValue({
                     sublistId: 'attendee',
                     fieldId: 'attendee',
                     line: 0,
                     value: data.objVendor
                  });

                  eventRecord.setValue({
                     fieldId: 'custevent_tkio_pp_notas',
                     value: data.horaCita[i].id_notas
                  });

                  // log.debug({title:'fecha: ',details:fecha});
                  // log.debug({title:'fechaFormatHoy: ',details:fechaFormatHoy});

                  var fechaNew = moment(fecha, 'D/M/YYYY');
                  var fechaHoyNew = moment(fechaFormatHoy, 'D/M/YYYY');
                  // if(date>=fechaFormatHoy){
                  if (fechaNew >= fechaHoyNew) {
                     var respuesta = eventRecord.save();
                     bandera = true;

                     //Se carga el record del EmailTemplates
                     var emailobj = record.load({
                        type: 'emailtemplate',
                        id: 429
                     });

                     // var empleado = getNameEmployee(data.employee);
                     var fieldLookUpEmpleado = search.lookupFields({
                        type: search.Type.EMPLOYEE,
                        id: data.employee,
                        columns: ['entityid']
                     });
                     var empleado = fieldLookUpEmpleado.entityid;
                     log.debug({ title: 'fieldLookUp: ', details: fieldLookUpEmpleado.entityid });

                     var fieldLookUpProveedor = search.lookupFields({
                        type: search.Type.VENDOR,
                        id: data.objVendor,
                        columns: ['entityid']
                     });
                     var proveedor = fieldLookUpProveedor.entityid;
                     log.debug({ title: 'fieldLookUp: ', details: fieldLookUpProveedor.entityid });
                     // var proveedor = getNameVendor(data.objVendor);
                     const senderId = data.employee;
                     const recipientEmail = data.objVendor;
                     var subject = emailobj.getValue({ fieldId: 'subject' });
                     var body = emailobj.getValue({ fieldId: 'content' });

                     var cuerpo = buildBody(body, empleado, proveedor, data.fecha, data.horaCita[i].hora, data.horaCita[i].horaFin);

                     sendEmail(senderId,recipientEmail,subject,cuerpo);
                  }
                  else {
                     bandera = false;
                     log.debug({ title: 'bandera: ', details: 'holi mundo' });
                  }
               }
            }
            else {
               bandera = false;
            }

            if (bandera) {
               log.debug({ title: 'respuesta: ', details: 'Procesado correctamente. ' })

               var response = scriptContext.response;
               response.write({
                  output: JSON.stringify({ success: 'T' })
               });

            } else {
               log.debug({ title: 'respuesta: ', details: 'No se procesado correctamente. ' })
               var response = scriptContext.response;
               response.write({
                  output: JSON.stringify({ success: 'F' })
               });
            }


         }
         catch (e) {
            log.error({ title: 'onRequest: ', details: e });
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
      function buildBody(body, empleado, proveedor, fecha, horaInicio, horaFinal) {
         try {
            var id_body_fields = new Array();

            for (var i = 0; i < body.length; i++) {
               var caracter = body[i];

               if (caracter == '{') {
                  inicio = i;
               }
               if (caracter == '}') {
                  fin = i + 1;
                  campo_id = body.slice(inicio, fin);
                  id_body_fields.push(campo_id);
               }

            }
            log.debug({ title: 'id_fields_body', details: id_body_fields });
            log.debug({ title: 'body: ', details: body });
            var newText = '';
            for (var x = 0; x < id_body_fields.length; x++) {

               log.debug({ title: 'id_body_fields: ', details: id_body_fields });
               if (id_body_fields[x] == '{proveedor}') {
                  newText = body.replace(id_body_fields[x], proveedor);
               }
               if (id_body_fields[x] == '{empleado}') {
                  newText = body.replace(id_body_fields[x], empleado);
               }
               if (id_body_fields[x] == '{fecha}') {
                  newText = body.replace(id_body_fields[x], fecha);
               }
               if (id_body_fields[x] == '{horaInicio}') {
                  newText = body.replace(id_body_fields[x], horaInicio);
               }
               if (id_body_fields[x] == '{horaFinal}') {
                  newText = body.replace(id_body_fields[x], horaFinal);
               }
               body = newText;
            }
            body = body.replace(/{/g, '');
            body = body.replace(/}/g, '');
            log.debug({ title: 'body2: ', details: body });
            return body;
         }
         catch (e) {
            log.error({ title: 'BuildBody: ', details: e });
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
      function sendEmail(senderId, recipientEmail, subject, body) {
         try {
            log.debug({ title: 'senderId: ', details: senderId });
            log.debug({ title: 'recipientEmail: ', details: recipientEmail });
            log.debug({ title: 'subject: ', details: subject });
            log.debug({ title: 'body: ', details: body });

            email.send({
               author: senderId,
               recipients: recipientEmail,
               subject: subject,
               body: body
            });

         } catch (e) {
            log.error({ title: 'Error en método send', details: e });
            return { success: false, details: 'No fue posible enviar el correo' }
         }
      }

      return { onRequest }

   });
