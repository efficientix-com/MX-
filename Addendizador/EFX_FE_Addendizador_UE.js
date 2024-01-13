/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @Author        Marco Ramirez
 *@Created       10-07-2020
 *@ScriptName    EFX_FE_Addendizador_UE
 *@Filename      EFX_FE_Addendizador_UE.js
 *@ScriptID      customscript_efx_fe_addendizador_ue
 * @DeployID    customdeploy_efx_fe_addendizador_ue
 *@Company      Efficientix
 *@modifications
 *  Date          Author            Version     Remarks
 *  0000-00-00    Author                        Edit
 */
define(['N/record', 'N/search'],
    /**
     * @param{record} record
     * @param{search} search
     */
    function(record, search) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(context) {
            if (context.type == context.UserEventType.VIEW) {
                var record_context = context.newRecord || '';
                var idRecord = record_context.id || '';
                var typeRecord = record_context.type || '';
                log.audit({ title: 'idRecord', details: JSON.stringify(idRecord) });
                log.audit({ title: 'typeRecord', details: JSON.stringify(typeRecord) });

                var entity = record_context.getValue({ fieldId: 'entity' }) || '';
                var addenda = record_context.getValue({ fieldId: 'custbody_mx_cfdi_sat_addendum' }) || '';


                var xml_Addenda = '';
                var xml_Addenda_name = '';
                if (entity) {
                    var LookupField = search.lookupFields({
                        type: record.Type.CUSTOMER,
                        id: entity,
                        columns: ['custentity_efx_fe_default_addenda','custentity_efx_fe_default_addenda.custrecord_efx_fe_a_xml']
                    }) || '';
                    log.audit({ title: 'LookupField', details: JSON.stringify(LookupField) });
                    if (LookupField != '' && LookupField.custentity_efx_fe_default_addenda.length > 0) {
                        xml_Addenda = LookupField["custentity_efx_fe_default_addenda.custrecord_efx_fe_a_xml"];
                        xml_Addenda_name = LookupField["custentity_efx_fe_default_addenda"];
                    }
                }

                log.audit({ title: 'xml_Addenda', details: JSON.stringify(xml_Addenda) });
                log.audit({ title: 'xml_Addenda_name', details: JSON.stringify(xml_Addenda_name) });
                var form = context.form;
                form.clientScriptModulePath = "./EFX_FE_Addendizador_CS.js";
                if (xml_Addenda_name /*&& !addenda*/) {

                    var objParam = {
                        tranid: idRecord,
                        trantype: typeRecord,
                        addenda: xml_Addenda,
                        addenda_name: xml_Addenda_name[0].text
                    };
                    log.audit({ title: 'objParam', details: JSON.stringify(objParam) });
                    form.addButton({
                        id: "custpage_btn_create_addenda",
                        label: "Crear Addenda",
                        functionName: "create_addenda(" + JSON.stringify(objParam) + ")"
                    });

                }
            }
        }

        

        return {
            beforeLoad: beforeLoad,

        };

    });
