/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/ui/serverWidget', 'N/url'],
    /**
 * @param{file} file
 * @param{serverWidget} serverWidget
 * @param{url} url
 */
    (file, serverWidget, url) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {

            var form = serverWidget.createForm({title: 'Facturación Global'});
            // var fieldgroup_principal = form.addFieldGroup({
            //     id : 'fieldgroupid_principal',
            //     label : 'Plantillas XML'
            // });

            form.addSubtab({
                id : 'subtabid',
                label : 'Factura'
            });

            var factura_xml_field = form.addField({
                id: 'custpage_efx_invxml',
                type: serverWidget.FieldType.LONGTEXT,
                label: 'Plantilla Factura',

            });

            var xmlfactura = file.load({
                id: 16980
            });

            // factura_xml_field.updateDisplayType({
            //     displayType: serverWidget.FieldDisplayType.INLINE
            // });
            factura_xml_field.defaultValue = xmlfactura.getContents();
            factura_xml_field.updateDisplaySize({
                height : 50,
                width : 100
            });

            scriptContext.response.writePage(form);

        }

        return {onRequest}

    });
