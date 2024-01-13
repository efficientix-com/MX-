/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/log', 'N/ui/serverWidget'],
    /**
 * @param{file} file
 * @param{log} log
 * @param {serverWidget} serverWidget
 */
    (file, log, serverWidget) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            let response = scriptContext.response, request = scriptContext.request, params = request.parameters;
            try {
                let type = params.docType;
                let id = params.docID;
                if (type && id) {
                    let fileObj = file.load({ id: id });
                    let headerType = '';

                    switch (type) {
                        case 'pdf':
                            headerType = 'application/pdf';
                            break;
                        case 'xml':
                            headerType = 'text/plain';
                            break;
                        default:
                            headerType = 'text/plain';
                            break;
                    }
                    
                    response.setHeader({
                        name: 'Content-Type',
                        value: headerType
                    });
                    
                    response.addHeader({
                        name: "Content-Disposition",
                        value: 'attachment; filename='+fileObj.name
                    });
                    response.write({
                        output:  fileObj.getContents()
        
                     });
                } else {
                    log.audit({title:'Parámetro faltante', details: {type: type, id: id}});
                    response.writePage({ pageObject: createErrorUI() });
                }
            } catch (e) {
                log.error({ title: 'Error on onRequest', details: e });
                response.writePage({ pageObject: createErrorUI() });
            }

            
        }

        /**
         * It creates a form with a single field that displays a message to the user
         * @returns A form object
         */
        const createErrorUI = () => {
            try { 
                let form = serverWidget.createForm({
                    title: 'Archivos',
                    hideNavBar: false
                });
                let field = form.addField({
                    id: 'custpage_text',
                    type: serverWidget.FieldType.LONGTEXT,
                    label: ' '
                });
                field.updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });
                field.defaultValue = 'Ha ocurrido un error al procesar la información, favor de contactar a su <b>Administrador</b>.';
                return form
            } catch (err) {
                log.error({title:'Error on createErrorUI', details: err});
            }
        }

        return {onRequest}

    });
