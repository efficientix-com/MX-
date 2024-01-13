/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/redirect','N/https','N/runtime', 'N/search','N/url','N/file','N/render','N/xml','N/encode','N/http'],

    function(record, redirect,https,runtime, search,urlMod,file,render,xmls,encode,http) {

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
        function getInputData() {

            //agregar

            ///
            var scriptObj = runtime.getCurrentScript();
            var idbusqueda = scriptObj.getParameter({ name: 'custscript_efx_fe_search_regenpdf' });
            try {
                // if(runtime.envType != 'PRODUCTION') {
                //     log.debug({title:'Script detenido - Env: ' + runtime.envType});
                //     return null;
                // }

                log.audit({title: 'idbusqueda', details: idbusqueda});
                var busqueda_facturas = search.load({ id: idbusqueda });


                log.audit({title: 'busqueda_facturas', details: busqueda_facturas});
                return busqueda_facturas;

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

                var datosmap = datos.values;
                var idtransaccion = datosmap.internalid.value;

                var tipotransaccion = '';
                if(datosmap.type.value=='CustInvc'){
                    tipotransaccion='invoice';
                }
                if(datosmap.type.value=='CashSale'){
                    tipotransaccion='cashsale';
                }if(datosmap.type.value=='CustCred'){
                    tipotransaccion='creditmemo';
                }if(datosmap.type.value=='CustPymt'){
                    tipotransaccion='customerpayment';
                }if(datosmap.type.value=='VendBill'){
                    tipotransaccion='vendorbill';
                }if(datosmap.type.value=='PurchOrd'){
                    tipotransaccion='purchaseorder';
                }if(datosmap.type.value=='SalesOrd'){
                    tipotransaccion='salesorder';
                }

                regeneraPDF(idtransaccion,tipotransaccion);


                // var peticion = datos.id;
                // context.write({
                //     key: peticion,
                //     value: datos.values
                // });
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


        }
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {

        }


        function regeneraPDF(tranid,trantype){
            log.audit({title:'tranid',details:tranid});
            log.audit({title:'trantype',details:trantype});

            var scheme = 'https://';
            var host = urlMod.resolveDomain({
                hostType: urlMod.HostType.APPLICATION
            });


            var SLURL = urlMod.resolveScript({
                scriptId: 'customscript_efx_fe_cfdi_genera_pdf_sl',
                deploymentId: 'customdeploy_efx_fe_cfdi_genera_pdf_sl',
                returnExternalUrl: true,
                params: {
                    trantype: trantype,
                    tranid: tranid
                }
            });

            log.audit({title:'SLURL',details:SLURL});

            var response = https.get({
                url: SLURL,
            });
            log.audit({title:'response-code',details:response.code});
            log.audit({title:'response-body',details:response.body});

            return response.body;

        }



        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });
