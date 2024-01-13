/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record','N/url','N/http','N/https','N/runtime','N/search','N/task'],
    /**
 * @param{record} record
 */
    (record,url,http,https,runtime,search,task) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            var body = '';
            if(scriptContext.request.body){
                body = JSON.parse(scriptContext.request.body);
            }
            var objMirror = {
                tranid:'',
                trantype:'',

            }
            log.audit({title:'body',details:body});
            log.audit({title:'scriptContext.request',details:scriptContext.request});

            if(body) {
                var idGbl = body.idglobal;
                var line_c = body.numeroLineas;
                var espejoUuid = body.espejoUuid;
                var espejoCert = body.espejoCert;
                var espejoPdf = body.espejoPdf;
                var espejoGen = body.espejoGen;
                var tipoProceso = body.tipo;

                var rGlobal = record.load({
                    type: 'customsale_efx_fe_factura_global',
                    id: idGbl
                });
                log.audit({title: 'espejoUuid', details: espejoUuid});
                log.audit({title: 'espejoCert', details: espejoCert});

                for (var i = 1; i <= 10; i++) {
                    var scriptdeploy_id = 'customdeploy_efx_fe_actualiza_tran_mr' + i;
                    log.debug('scriptdeploy_id', scriptdeploy_id);

                    var mrTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                    mrTask.scriptId = 'customscript_efx_fe_actualiza_tran_mr';
                    mrTask.deploymentId = scriptdeploy_id;
                    mrTask.params = {custscript_efx_fe_gbl_id_actualiza: JSON.stringify(body)};

                    try {
                        var mrTaskId = mrTask.submit();
                        log.debug("scriptTaskId tarea ejecutada", mrTaskId);
                        log.audit("Tarea ejecutada", mrTaskId);

                        rGlobal.setValue({fieldId: 'custbody_efx_fe_task_reprocess', value: mrTaskId});
                        rGlobal.setValue({fieldId: 'custbody_efx_fe_gbl_reprocess', value: true});
                        if(tipoProceso=='existe') {
                            rGlobal.setValue({fieldId: 'custbody_psg_ei_status', value: 3});
                            rGlobal.setValue({fieldId: 'custbody_mx_cfdi_uuid', value: espejoUuid});
                            rGlobal.setValue({fieldId: 'custbody_psg_ei_certified_edoc', value: espejoCert});
                            rGlobal.setValue({fieldId: 'custbody_edoc_generated_pdf', value: espejoPdf});
                        }
                        rGlobal.save();
                        break;
                    } catch (e) {
                        log.debug({title: "error", details: e});
                        log.error("summarize", "Aún esta corriendo el deployment: " + scriptdeploy_id);
                    }
                }
            }

        }

        return {onRequest}

    });
