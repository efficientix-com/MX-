/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', './XmlToPdf','N/file','N/xml'],
/**
 * @param{record} record
 */
function(record,XmlToPdf,file,xml) {


    /**
     * Function definition to be triggered before record is loaded.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.newRecord - New record
     * @param {Record} scriptContext.oldRecord - Old record
     * @param {string} scriptContext.type - Trigger type
     * @Since 2015.2
     */
    function afterSubmit(context) {

        if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {
            try {
                var record_noww = context.newRecord;
                var recType = record_noww.type;
                var recordObj = record.load({
                    type: recType,
                    id: record_noww.id
                });


                var CREADO_DESDE = recordObj.getValue({fieldId:'createdfrom'});
                var UUID_NC = recordObj.getValue({fieldId:'custbody_mx_cfdi_uuid'});
                if(!UUID_NC){
                    try{

                        var RECORD_FACTURA = record.load({
                            type: record.Type.INVOICE,
                            id: CREADO_DESDE
                        });
    
                        var xmlarchivo = RECORD_FACTURA.getValue({fieldId:'custbody_psg_ei_certified_edoc'});
                        var UUID = RECORD_FACTURA.getValue({fieldId:'custbody_mx_cfdi_uuid'});
    
                        if(xmlarchivo && UUID){
                            var fileObj = file.load({
                                id: xmlarchivo
                            });
                            var xmlTimbrado = fileObj.getContents();
        
                            var xmlObj = xml.Parser.fromString({
                                text: xmlTimbrado
                            });
                            var objPDFjson = XmlToPdf.createPDF(xmlObj.documentElement,true);
        
                            try{
                                var objPDFtext = JSON.stringify(objPDFjson);
                                var objPDFfirst = objPDFtext.replace(/#text/gi,'texto');
                                var objPDF = JSON.parse(objPDFfirst.replace(/&/gi,'&amp;'));
                            }catch(errorObjpdf){
                                log.audit({title:'errorObjpdf',details:errorObjpdf})
                            }
    
                            /*var fileObj = file.create({
                                name: 'test.json',
                                fileType: file.Type.PLAINTEXT,
                                contents: JSON.stringify(objPDF),
                                folder: 8578,
                                isOnline: true
                            });
            
                            fileObj.save();*/
    
                            if(objPDF){
                                var RECEPTOR = objPDF.Receptor.atributos.Nombre;
                                var RFC = objPDF.Receptor.atributos.Rfc;
                                var DOMICILIOFISCALRECEPTOR = objPDF.Receptor.atributos.DomicilioFiscalReceptor;
                                var REGIMENFISCALRECEPTOR = objPDF.Receptor.atributos.RegimenFiscalReceptor;
                                recordObj.setValue({
                                    fieldId: 'custbody_efx_fe_rec_factura',
                                    value: JSON.stringify(objPDF.Receptor.atributos),
                                    ignoreFieldChange: true
                                });
                            }
                            
                            recordObj.save({
                                enableSourcing: false,
                                ignoreMandatoryFields: true
                            });
                        }
                        
    
                    }catch(errorFactura){
                        log.error({title: 'errorFactura', details: errorFactura});
                    }
                }
                

            }catch(error_new){
                log.audit({title: 'error_new', details: error_new});
            }
        }
    

    }


    return {

        afterSubmit: afterSubmit,

    };
    
});
