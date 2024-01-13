/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/https', 'N/record', 'N/runtime', 'N/ui/serverWidget', 'N/url','N/task'],
    /**
 * @param{https} https
 * @param{record} record
 * @param{runtime} runtime
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (https, record, runtime, serverWidget, url,task) => {
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (context) => {
            if (context.type == context.UserEventType.VIEW) {
                var record_now = context.newRecord;
                var uuid = record_now.getValue({fieldId:'custbody_mx_cfdi_uuid'});
                var certificado = record_now.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
                var espejo = record_now.getValue({fieldId:'custbody_efx_fe_gbl_mirror_tran'});
                var reproceso = record_now.getValue({fieldId:'custbody_efx_fe_gbl_reprocess'});
                log.audit({title:'reproceso',details:reproceso});

                if(reproceso){
                    try{
                        var taskId = record_now.getValue({fieldId:'custbody_efx_fe_task_reprocess'});
                        var taskStatus = task.checkStatus({
                            taskId: taskId
                        });
                        var percent = 0;
                        log.debug("updatePercent Stage", taskStatus.stage);
                        switch(taskStatus.stage){
                            case task.MapReduceStage.GET_INPUT:
                                percent += 20;
                                break;
                            case task.MapReduceStage.MAP:
                                percent += 40;
                                break;
                            case task.MapReduceStage.SHUFFLE:
                                percent += 60;
                                break;
                            case task.MapReduceStage.REDUCE:
                                percent += 70;
                                break;
                            case task.MapReduceStage.SUMMARIZE:
                                percent += 80;
                                break;
                        }
                        var completion = taskStatus.getPercentageCompleted();
                        if( !taskStatus.stage){
                            percent = 100;
                        }
                        else{
                            percent += (completion * 20) / 100;
                        }

                        if(percent==100) {
                            // record.submitFields({
                            //     type: 'customsale_efx_fe_factura_global',
                            //     id: record_now.id,
                            //     values: {
                            //         'custbody_efx_fe_gbl_reprocess': false
                            //         //'custbody_efx_ie_advance_percent': percent+'%'
                            //     }
                            // });
                            var recordActual = record.load({
                                type:'customsale_efx_fe_factura_global',
                                id:record_now.id
                            });
                            recordActual.setValue({fieldId:'custbody_efx_fe_gbl_reprocess',value:false});
                            recordActual.save({ignoreMandatoryFields:true,enableSourcing:true});
                        }

                    }
                    catch(e){
                        log.error("updatePercent e", e);
                    }
                }

                if(!uuid && !certificado && !reproceso) {
                    var objGlobal = {
                        idglobal: '',
                        setup_metodo: '',
                        setup_plantilla: '',
                        setup_txcode: '',
                        setup_entity: '',
                        setup_item: '',
                        espejo: '',
                    }

                    var scriptObj = runtime.getCurrentScript();
                    var GBL_Config = scriptObj.getParameter({ name: 'custscript_efx_fe_gbl_config' });

                    var record_setup = record.load({
                        type:'customrecord_efx_fe_facturaglobal_setup',
                        id:GBL_Config
                    });

                    // var setup_metodo = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_envio'});
                    // var setup_plantilla = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_plantilla'});
                    // var setup_txcode = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_tax'});
                    // var setup_entity = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_entity'});
                    // var setup_item = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_item'});


                    var setup_metodo = record_now.getValue({fieldId:'custbody_efx_fe_gbl_envio'});
                    var setup_plantilla = record_now.getValue({fieldId:'custbody_efx_fe_gbl_plantilla'});
                    var setup_txcode = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_tax'});
                    var setup_entity = record_now.getValue({fieldId:'entity'});
                    var setup_item = record_setup.getValue({fieldId:'custrecord_efx_fe_gbl_item'});



                    objGlobal.idglobal = record_now.id;
                    objGlobal.setup_metodo = parseInt(setup_metodo);
                    objGlobal.setup_plantilla = parseInt(setup_plantilla);
                    objGlobal.setup_txcode = parseInt(setup_txcode);
                    objGlobal.setup_entity = parseInt(setup_entity);
                    objGlobal.setup_item = parseInt(setup_item);
                    objGlobal.espejo = parseInt(espejo);

                    log.audit({title:'objGlobal',details:JSON.stringify(objGlobal)});
                    var form = context.form;
                    form.clientScriptModulePath = "./EFX_FE_Global_CS.js";
                    // form.addButton({
                    //     id: "custpage_btn_reprocess",
                    //     label: "Reprocesar Global",
                    //     functionName: "reprocess(" + JSON.stringify(objGlobal) + ")"
                    // });
                }
            }
        }



        return {beforeLoad}

    });
