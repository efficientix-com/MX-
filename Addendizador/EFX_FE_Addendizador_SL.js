/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @Author        Marco Ramirez
 *@Created       10-07-2020
 *@ScriptName    EFX_FE_Addendizador
 *@Filename      EFX_FE_Addendizador_SL.js
 *@ScriptID      customscript_efx_fe_addendizador_sl
 * @DeployID    customdeploy_efx_fe_addendizador_sl
 *@Company      Efficientix
 *@modifications
 *  Date          Author            Version     Remarks
 *  0000-00-00    Author                        Edit
 *
 */
define(['N/config', 'N/format', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/xml','./lib/xml_getfields','./lib/addenda_selector'],
/**
 * @param{config} config
 * @param{format} format
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 * @param{serverWidget} serverWidget
 * @param{xml} xml
 */
function(config, format, record, runtime, search, serverWidget, xml,getfields,selector_add) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

        var tranid = context.request.parameters.custparam_tranid || '';
        var trantype = context.request.parameters.custparam_trantype || '';
        var xmladdenda = context.request.parameters.custparam_xmladdenda || '';
        var xmladdenda_name = context.request.parameters.custparam_xmladdenda_name || '';
        var searchTypeTran = '';

        if (trantype == 'invoice') {
            searchTypeTran = search.Type.INVOICE;
        }

        var transaccion = record.load({
            type: searchTypeTran,
            id: tranid
        });

        var entidad = transaccion.getValue({ fieldId: 'entity' }) || '';

        log.audit({ title: 'tranid', details: JSON.stringify(tranid) });
        log.audit({ title: 'trantype', details: JSON.stringify(trantype) });
        log.audit({ title: 'xmladdenda', details: JSON.stringify(xmladdenda) });
        log.audit({ title: 'xmladdenda_name', details: JSON.stringify(xmladdenda_name) });

        var addenda_result = selector_add.addenda_select(xmladdenda_name,tranid,trantype,xmladdenda);

        log.audit({ title: 'addenda_result', details: JSON.stringify(addenda_result.data) });

        var addenda_final = xml.escape({xmlText: addenda_result.data});
        log.audit({ title: 'addenda_final', details: JSON.stringify(addenda_final) });
        transaccion.setValue({
            fieldId: 'custbody_mx_cfdi_sat_addendum',
            value: (addenda_result.data).toString()
            //value: addenda_final
        });
        transaccion.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });

        // var campos_xml= getfields.getFields(xmladdenda,tranid,searchTypeTran);
        //
        // log.audit({ title: 'campos_xml', details: JSON.stringify(campos_xml) });

        // var objcampos = new Object();
        // var campos_transaccion = new Array();
        // var campos_entidad = new Array();
        // //objcampos[campos_xml[i]]="";
        //
        // for(var i=0;i<campos_xml.length;i++){
        //     try{
        //         var campo_join = campos_xml[i].split('.');
        //             if(campo_join.length>1){
        //                 if(campo_join[0]=='customer'){
        //                     campos_entidad.push(campo_join[1]);
        //                 }
        //             }else{
        //             campos_transaccion.push(campos_xml[i]);
        //         }
        //
        //     }catch(error_getfields){
        //         log.audit({ title: 'error_getfields', details: JSON.stringify(error_getfields) });
        //     }
        //
        // }

        // log.audit({ title: 'campos_transaccion', details: JSON.stringify(campos_transaccion) });
        // log.audit({ title: 'campos_entidad', details: JSON.stringify(campos_entidad) });

        // var tran_fields_result = search.lookupFields({
        //     type: searchTypeTran,
        //     id: tranid,
        //     columns: campos_transaccion
        // }) || '';
        // log.audit({ title: 'tran_fields_result', details: JSON.stringify(tran_fields_result) });
        //
        // if(campos_entidad.length>0){
        //     var entity_fields_result = search.lookupFields({
        //         type: record.Type.CUSTOMER,
        //         id: entidad,
        //         columns: campos_entidad
        //     }) || '';
        //     log.audit({ title: 'entity_fields_result', details: JSON.stringify(entity_fields_result) });
        // }



        //Creacion del form

        var form = serverWidget.createForm({
            title: "Addenda"
        });

        form.clientScriptModulePath = "./EFX_FE_Addendizador_CS.js";

        form.addButton({
            id: 'custpage_btn_cerrar',
            label: 'Cerrar',
            functionName: 'cerrar'
        });

        var htmlField = form.addField({
            id: "custpage_html_result",
            label: 'Resultado',
            type: serverWidget.FieldType.INLINEHTML
        });

        var ckRefresh = form.addField({
            id: "custpage_ck_refresh",
            label: 'Refrescar',
            type: serverWidget.FieldType.CHECKBOX
        });

        if(addenda_result.data){
            ckRefresh.defaultValue = 'T';
        }

        context.response.writePage(form);

    }

    return {
        onRequest: onRequest
    };
    
});
