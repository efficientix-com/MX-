/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
define(['N/record', 'N/render', 'N/search','N/runtime','N/file','N/xml','N/encode','N/https','N/http','N/email','./XmlToPdf','N/format'],
    /**
     * @param{https} https
     * @param{record} record
     * @param{search} search
     */
    function(record, render, search,runtime,file,xml,encode,https,http,email,XmlToPdf,format) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            var respuesta = {
                success: false,
                anticipoId:'',
                anticipoData:'',
            };
        

            try {
                var tipotran = context.request.parameters.trantype || '';
                var idtran = context.request.parameters.tranid || '';

                var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
                var anticipoObj = {
                    tranid: idtran,
                    subtotal: '',
                    impuestoid: '',
                    impuestoneto: '',
                    importe: ''
                };

                log.audit({title:'context.request.parameters',details:context.request.parameters});
                log.audit({title:'tipotran',details:tipotran});
                log.audit({title:'idtran',details:idtran});
        
                var recordObj = record.load({
                    type: tipotran,
                    id: idtran
                });


                var objXML = new Object();
                var xmlarchivo = recordObj.getValue({fieldId:'custbody_psg_ei_certified_edoc'});         
                
                if(xmlarchivo){
                    var fileObj = file.load({
                        id: xmlarchivo
                    });

                    var xmlTimbrado = fileObj.getContents();

                        var xmlObj = xml.Parser.fromString({
                            text: xmlTimbrado
                        });
                        var objXMLjson = XmlToPdf.createPDF(xmlObj.documentElement,true);                

                    try{
                        var objXMLtext = JSON.stringify(objXMLjson);
                        var objXMLfirst = objXMLtext.replace(/#text/gi,'texto');
                        objXML = JSON.parse(objXMLfirst.replace(/&/gi,'&amp;'));
                    }catch(errorObjxml){
                        log.audit({title:'errorObjxml',details:errorObxml})
                    }

                    
                    log.audit({title:'objXML',details:objXML});
                    var totalretenciones = 0;
                    var totaltraslados = 0;
                    if(objXML.hasOwnProperty("Impuestos")){
                        if(objXML.Impuestos.atributos.hasOwnProperty("TotalImpuestosRetenidos")){
                            totalretenciones = parseFloat(objXML.Impuestos.atributos.TotalImpuestosRetenidos);
                        }
                        if(objXML.Impuestos.atributos.hasOwnProperty("TotalImpuestosTrasladados")){
                            totaltraslados = parseFloat(objXML.Impuestos.atributos.TotalImpuestosTrasladados);
                        }
                        anticipoObj.impuestoneto = (totaltraslados-totalretenciones).toFixed(2);
                    }else{
                        anticipoObj.impuestoneto = "0.00";
                    }


                    var lineCountItem = recordObj.getLineCount({ sublistId: 'item' });

                    var taxcode = '';
                    for(var i=0;i<lineCountItem;i++){
                        taxcode = recordObj.getSublistValue({sublistId:'item',fieldId:'taxcode',line:i});
                    }
                    
                    anticipoObj.subtotal = objXML.atributos.SubTotal;
                    anticipoObj.impuestoid = taxcode                
                    anticipoObj.importe = objXML.atributos.Total;

                    var anticipoId = crearAnticipo(anticipoObj);

                    respuesta.success = true;
                    respuesta.anticipoId = anticipoId;
                    respuesta.anticipoData = anticipoObj;

                }
            }catch(errorInfoAnticipo){
                respuesta.success = false;
                log.error({title:'errorInfoAnticipo',details:errorInfoAnticipo});
            }

            context.response.setHeader({
                name: "Content-Type",
                value: "application/json"
            });

            context.response.write({
                output: JSON.stringify(respuesta)
            });

        }

        function crearAnticipo(anticipoObj) {        
                var apRec = record.create({
                    type: 'customrecord_efx_fe_anticipo_pago'
                });

                apRec.setValue({
                    fieldId: 'custrecord_efx_fe_ap_trans',
                    value: anticipoObj.tranid
                });

                apRec.setValue({
                    fieldId: 'custrecord_efx_fe_ap_subtotal',
                    value: anticipoObj.subtotal
                });

                apRec.setValue({
                    fieldId: 'custrecord_efx_fe_ap_imp_id',
                    value: anticipoObj.impuestoid
                });

                apRec.setValue({
                    fieldId: 'custrecord_efx_fe_ap_imp_neto',
                    value: anticipoObj.impuestoneto
                });

                apRec.setValue({
                    fieldId: 'custrecord_efx_fe_ap_importe',
                    value: anticipoObj.importe
                });

                var apRecId = apRec.save({
                    enableSourcing: true,
                    igonoreMandatoryFields: true
                });

                return apRecId;
           
        }

        return {
            onRequest: onRequest
        };

    });
