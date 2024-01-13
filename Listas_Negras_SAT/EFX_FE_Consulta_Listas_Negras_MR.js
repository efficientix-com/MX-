/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect','N/https','N/runtime', 'N/search','N/url','N/file','N/render','N/xml','N/encode','N/http'],

    function(record, redirect,https,runtime, search,url,file,render,xmls,encode,http) {

        /**
         * Marks the beginning of the Map/Reduce process and generates input data.
         *
         * @typedef {Object} ObjectRef
         * @property {number} id - Internal ID of the record instance
         * @property {string} type - Record type id
         *
         * @return {Array|Object|Search|RecordRef} inputSummary
         * @since 2015.1
         */
        var array_maps = new Array();
        function getInputData() {
            var scriptObj = runtime.getCurrentScript();
            var idbusqueda = scriptObj.getParameter({ name: 'custscript_efx_valida_search' });

            log.audit({title: 'idbusqueda', details: idbusqueda});
            try {

                var busqueda_vendor = search.load({ id: idbusqueda });

                log.audit({title: 'busqueda_vendor', details: busqueda_vendor});
                return busqueda_vendor;

            }catch(error_busqueda){
                log.audit({title: 'error_busqueda', details: error_busqueda});
            }

        }

        /**
         * Executes when the map entry point is triggered and applies to each key/value pair.
         *
         * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
         * @since 2015.1
         */
        function map(context) {
            try{
                log.audit({title:'map',details:JSON.parse(context.value)});
                var datos = JSON.parse(context.value);

                log.audit({title:'map - values',details:datos.values});
                array_maps.push(datos.values);

                context.write({
                    key: 'principal',
                    value: array_maps
                });
            }catch(error){
                log.error({title:'map - error',details:error});
            }
        }

        /**
         * Executes when the reduce entry point is triggered and applies to each group.
         *
         * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
         * @since 2015.1
         */
        function reduce(context) {
            try{
            log.audit({title:'reduce-context',details:context});
            var fechaactual = new Date();

            var data_reduce = JSON.parse(context.values[0]);
            log.audit({title:'data_reduce',details:data_reduce});
            var id = context.key;

            log.audit({title:'id',details:id});

                var bodyRfcs = {
                    rfc:'',
                    rfcs : []
                }
                log.audit({title:'data_reduce.length',details:data_reduce.length});
            for(var i=0;i<data_reduce.length;i++) {

                log.audit({title:'data_reduce[i].custentity_mx_rfc',details:data_reduce[i].custentity_mx_rfc});

                    var objrfc = {
                        rfc: ''
                    }
                    objrfc.rfc = data_reduce[i].custentity_mx_rfc;
                    (bodyRfcs.rfcs).push(objrfc);

            }
                log.audit({title:'bodyRfcs.rfcs',details:bodyRfcs.rfcs});
            if(bodyRfcs.rfcs.length>0){
                var responseBodyResp = consultaListas(true,bodyRfcs);
                log.audit({ title: 'responseBodyResp', details: responseBodyResp });
            }


                if(responseBodyResp) {
                    var responseBody = JSON.parse(responseBodyResp);
                    log.audit({title: 'responseBody.success', details: responseBody.success});

                    if (responseBody.success) {
                        log.audit({title: 'responseBody.data.length', details: responseBody.data.length});
                        log.audit({title: 'resultado.length', details: data_reduce.length});
                        for (var x = 0; x < responseBody.data.length; x++) {
                            for (var i = 0; i < data_reduce.length; i++) {
                                //var rfcsearch = resultado[i].getValue({name: 'custentity_mx_rfc'});
                                var rfcsearch = bodyRfcs.rfcs[i].rfc;
                                log.audit({title: 'rfcsearch', details: rfcsearch});
                                log.audit({title: 'responseBody.data[x].rfc', details: responseBody.data[x].rfc});
                                if (rfcsearch == responseBody.data[x].rfc) {
                                    log.audit({
                                        title: 'responseBody.data[x].situacion_contribuyente',
                                        details: responseBody.data[x].listanegra.situacion_contribuyente
                                    });
                                    var estado_rfc = '';
                                    if (responseBody.data[x].listanegra.situacion_contribuyente == 'Definitivo') {
                                        estado_rfc = 1;
                                    } else if (responseBody.data[x].listanegra.situacion_contribuyente == 'Desvirtuado') {
                                        estado_rfc = 2;
                                    } else if (responseBody.data[x].listanegra.situacion_contribuyente == 'Presunto') {
                                        estado_rfc = 3;
                                    } else {
                                        estado_rfc = 4;
                                    }
                                    log.audit({title: 'estado_rfc', details: estado_rfc});
                                    record.submitFields({
                                        type: record.Type.VENDOR,
                                        id: data_reduce[i].internalid.value,
                                        values: {
                                            custentity_efx_fe_lns_status: estado_rfc,
                                            custentity_efx_fe_lns_valida_date: fechaactual,

                                        }
                                    });
                                }
                            }
                        }

                    }
                }




           }catch(error_actualiza){
               log.audit({title:'error_actualiza',details:error_actualiza});
           }



        }


        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {

        }

        function consultaListas(multiple,bodyRfcs){
            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });

            var objBody = {
                multiple:'',
                rfcs:''
            }
            objBody.multiple = multiple;
            objBody.rfcs = bodyRfcs;

            var SLURL = url.resolveScript({
                scriptId: 'customscript_efx_fe_lnsat_ws_sl',
                deploymentId: 'customdeploy_efx_fe_lnsat_ws_sl',
                returnExternalUrl:true
            });


            var headersPos = {
                'Content-Type': 'application/json'
            };
            log.audit({title:'SLURL',details:SLURL});

            var response = https.post({
                url: SLURL,
                headers:headersPos,
                body: JSON.stringify(objBody)
            });

            log.audit({title:'response-code_mail',details:response.code});
            log.audit({title:'response-body_mail',details:response.body});

            if(response.code==200){
                return response.body;
            }else{
                return '';
            }


        }


        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });
