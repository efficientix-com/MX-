/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @Author        Marco Ramirez
 *@Created       10-07-2020
 *@ScriptName    EFX_FE_Addendizador_CS
 *@Filename      create_addenda
 *@ScriptID
 * @DeployID
 * @DeployID
 *@Company      Efficientix
 *@modifications
 *  Date          Author            Version     Remarks
 *  0000-00-00    Author                        Edit
 */
define(['N/url','N/https','N/ui/message'],
/**
 * @param{url} url
 */
function(url,https,mensajes) {
    
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    function pageInit(context) {
        // debugger;
        // var currentRecord = context.currentRecord;
        // var ckRefresh = currentRecord.getValue({
        //     fieldId: 'custpage_ck_refresh'
        // });
        // console.log(ckRefresh);
        //
        // if (ckRefresh) {
        //     window.opener.location.reload();
        // }
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

    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {

    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) {

    }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) {

    }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) {

    }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) {

    }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) {

    }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) {

    }

    function cerrar() {
        window.close();
    }

    function create_addenda(tranData) {

        var tranid = tranData.tranid || '';
        var trantype = tranData.trantype || '';
        var xml_addenda = tranData.addenda || '';
        var xml_addenda_name = tranData.addenda_name || '';
        console.log(tranid)

        if (!tranid || !trantype) {
            alert('Error obteniendo el Id de la Transacción!');
        }
        else {
            var myMsg_create = mensajes.create({
                title: "Addendas",
                message: "Su addenda se está generando...",
                type: mensajes.Type.INFORMATION
            });

            myMsg_create.show();

            var url_Script = url.resolveScript({
                scriptId: 'customscript_efx_fe_addendizador_sl',
                deploymentId: 'customdeploy_efx_fe_addendizador_sl',
                returnExternalUrl: false,
            });

            var headers = {
                "Content-Type": "application/json"
            };

            https.request.promise({
                method: https.Method.POST,
                url: url_Script,
                body: {
                    custparam_tranid: tranid,
                    custparam_trantype: trantype,
                    custparam_xmladdenda: xml_addenda,
                    custparam_xmladdenda_name: xml_addenda_name,
                },
                headers: headers
            })
                .then(function(response){
                    log.debug({
                        title: 'Response',
                        details: response
                    });

                    if(response.code==200){
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Addendas",
                            message: "Su Addenda se generó correctamente. Por favor revísela en la subpestaña CFDI Information.",
                            type: mensajes.Type.CONFIRMATION
                        });
                        myMsg.show({ duration : 5500 });

                        console.log('respuesta');

                        location.reload();
                    }else if(responde.code==500){
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Addendas",
                            message: "Ocurrio un error, verifique su conexión.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }else {
                        myMsg_create.hide();
                        var myMsg = mensajes.create({
                            title: "Addendas",
                            message: "Ocurrio un error, los datos de su addenda.",
                            type: mensajes.Type.ERROR
                        });
                        myMsg.show();
                    }

                })
                .catch(function onRejected(reason) {
                    log.debug({
                        title: 'Invalid Request: ',
                        details: reason
                    });
                });


            //log.audit({ title: 'response', details: JSON.stringify(response) });
            //window.opener.location.reload();


            //window.open(url_Script, '_blank');
        }
    }

    return {
         pageInit: pageInit,
        // fieldChanged: fieldChanged,
        // postSourcing: postSourcing,
        // sublistChanged: sublistChanged,
        // lineInit: lineInit,
        // validateField: validateField,
        // validateLine: validateLine,
        // validateInsert: validateInsert,
        // validateDelete: validateDelete,
        // saveRecord: saveRecord
        cerrar: cerrar,
        create_addenda: create_addenda
    };
    
});
