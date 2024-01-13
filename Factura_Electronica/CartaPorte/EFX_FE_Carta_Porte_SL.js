/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record','N/url','N/http','N/https','N/runtime','N/search'],
    /**
     * @param{record} record
     */
    (record,url,http,https,runtime,search) => {
            /**
             * Defines the Suitelet script trigger point.
             * @param {Object} scriptContext
             * @param {ServerRequest} scriptContext.request - Incoming request
             * @param {ServerResponse} scriptContext.response - Suitelet response
             * @since 2015.2
             */
            const onRequest = (scriptContext) => {

                    var body = '';
                    if(scriptContext.request.parameters){
                            body = scriptContext.request.parameters;
                    }

                    var objCP = {
                            recId:'',
                            success:false,
                    }

                    log.audit({title:'body',details:body});

                    if(body.tranid){
                            var buscatipos = search.create({
                                    type:'customrecord_efx_fe_cp_configcartap',
                                    filters:[
                                            ['isinactive',search.Operator.IS,'F']
                                            ,'AND',
                                            ['custrecord_efx_fe_cp_codetrans',search.Operator.IS,body.trantype]],
                                    columns:[
                                            search.createColumn({name:'internalid'}),
                                            search.createColumn({name:'custrecord_efx_fe_cp_metenvio'}),
                                            search.createColumn({name:'custrecord_efx_fe_cp_tempxml'}),
                                    ]
                            });

                            var metodoenv = '';
                            var plantillaxml = '';
                            buscatipos.run().each(function(result) {
                                    metodoenv = result.getValue({name: 'custrecord_efx_fe_cp_metenvio'}) || 0;
                                    plantillaxml = result.getValue({name: 'custrecord_efx_fe_cp_tempxml'}) || 0;
                                    log.audit({title:'body',details:metodoenv});
                                    log.audit({title:'body',details:plantillaxml});
                                    return true;
                            });
                            var idCporteRec = record.create({
                                    type:'customrecord_efx_fe_cp_carta_porte',
                            });
                            
                            idCporteRec.setValue({fieldId:'name',value:'Carta_Porte_'});
                            idCporteRec.setValue({fieldId:'custrecord_efx_fe_cp_ctransccion',value:body.tranid});
                            idCporteRec.setValue({fieldId:'custrecord_efx_fe_cp_ctempxml',value:plantillaxml});
                            idCporteRec.setValue({fieldId:'custrecord_efx_fe_cp_cmetpxml',value:metodoenv});
                            var id_recCp = idCporteRec.save();

                            if(id_recCp){
                                    objCP.recId = id_recCp;
                                    objCP.success = true;
                                    var tranobj = record.load({
                                            type:body.trantype,
                                            id:body.tranid
                                    });
                                    var array_cp = tranobj.getValue({fieldId:'custbody_efx_fe_cp_gencp'});
                                    log.audit({title:'array_cp',details:array_cp});
                                    array_cp.push(id_recCp);
                                    tranobj.setValue({fieldId:'custbody_efx_fe_cp_gencp',value:array_cp});
                                    tranobj.save({enableSourcing: true, ignoreMandatoryFields: true});
                                    
                                    var nombrerecord = "Carta_Porte_"+tranobj.getText({fieldId:'tranid'})+"_"+id_recCp;

                                    record.submitFields({
                                        type:'customrecord_efx_fe_cp_carta_porte',
                                        id:id_recCp,
                                        values: {
                                            name: nombrerecord,                                            
                                        },
                                        options: {
                                            enableSourcing: true,
                                            ignoreMandatoryFields: true
                                        }
                                    });

                            }
                    }


                    scriptContext.response.write({
                            output: JSON.stringify(objCP)
                    });

            }

            return {onRequest}

    });
