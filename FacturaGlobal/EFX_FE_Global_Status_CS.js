/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 */
define(['N/http', 'N/https', 'N/record','N/url','N/ui/message','N/currentRecord'],

    function(http, https, record,url,mensajes,currentRecord) {


        function fieldChanged(context) {

        }

        function enviar(){
            var campos= currentRecord.get();

            var send_obj = new Array();

            var numLines = campos.getLineCount({
                sublistId : 'custpage_efx_invoice'
            });
            for (var i = 0; i < numLines; i++) {

                var marcada = campos.getSublistValue({
                    sublistId: 'custpage_efx_invoice',
                    fieldId: 'custpage_efx_select',
                    line: i
                });
                if(marcada==true){
                    send_obj.push(campos.getSublistValue({
                        sublistId: 'custpage_efx_invoice',
                        fieldId: 'custpage_efx_nodocumento',
                        line: i
                    }));
                }

            }

            var scriptURL = url.resolveScript({
                scriptId: 'customscript_efx_cp_sent_masive_sl',
                deploymentId: 'customdeploy_efx_cp_sent_masive_sl',
                returnExternalURL: true,
                params:{
                    to_send: JSON.stringify(send_obj),
                }
            });

            window.open(scriptURL,'_self');

        }

        function actualizarstatus() {

            location.reload();
        }

        return {
            fieldChanged:fieldChanged,
            actualizarstatus:actualizarstatus

        };

    });
