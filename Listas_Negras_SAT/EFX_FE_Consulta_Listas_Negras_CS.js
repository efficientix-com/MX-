/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/ui/message','N/url','N/https'],
    /**
     * @param{record} record
     * @param{message} message
     */
    function(currentRecord, mensajes,url,https) {

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

        function filtrado(){

            var campos= currentRecord.get();

            var filterDetailsObj = {
                idbusqueda:''
            }

            filterDetailsObj.idbusqueda = campos.getValue('custpage_efx_search');

            if(filterDetailsObj.idbusqueda) {
                var scriptURL = url.resolveScript({
                    scriptId: 'customscript_efx_fe_consulta_lns_sl',
                    deploymentId: 'customdeploy_efx_fe_consulta_lns_sl',
                    returnExternalURL: true,
                    params: {
                        value: JSON.stringify(filterDetailsObj),
                    }
                });
                window.open(scriptURL, '_self');
            }
        }

        function valida(){
            var campos= currentRecord.get();

            var filterDetailsObj = {
                idbusqueda:'',
                valida:true
            }

            filterDetailsObj.idbusqueda = campos.getValue('custpage_efx_search');
            filterDetailsObj.valida = true;

            if(filterDetailsObj.idbusqueda) {
                var scriptURL = url.resolveScript({
                    scriptId: 'customscript_efx_fe_consulta_lns_sl',
                    deploymentId: 'customdeploy_efx_fe_consulta_lns_sl',
                    returnExternalURL: true,
                    params: {
                        value: JSON.stringify(filterDetailsObj),
                    }
                });
                window.open(scriptURL, '_self');
            }
        }

        return {
            pageInit: pageInit,
            filtrado:filtrado,
            valida:valida


        };

    });
