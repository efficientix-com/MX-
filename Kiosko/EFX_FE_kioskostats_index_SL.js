/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/search', 'N/ui/serverWidget', 'N/https', 'N/file'],

    (search, serverWidget, https, file) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                let request = scriptContext.request, response = scriptContext.response, params = request.parameters;
                let form = serverWidget.createForm({
                    title: "Kiosko Statistics",
                    hideNavBar: false
                });
                let html_fld = form.addField({
                    id: 'custpage_html_content',
                    label: 'HTML',
                    type: serverWidget.FieldType.INLINEHTML
                });
                let html_content = getHTMLTemplate();
                html_fld.defaultValue = html_content;
                response.writePage(form);

            } catch (e) {
                log.error({
                    title: "Error on onRequest function",
                    details: e
                });

            }
        }
        const getHTMLTemplate = () => {
            try {
                let content = '';
                let cssFile = getFileURL('app.d10fd014.css');
                let chunkCssFile = getFileURL('chunk-vendors.b7cdb67e.css');
                let appJSFile = getFileURL('app.02534a43.js');
                let chunkFile = getFileURL('chunk-vendors.fc0cae0f.js');
                content += '<!doctype html>'
                    + '<html lang="">'
                    + '<head>'
                    + '<meta charset="utf-8">'
                    + '<meta http-equiv="X-UA-Compatible" content="IE=edge">'
                    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
                    + '<link rel="icon" href="/favicon.ico">'
                    + '<title>mxplus_vue_ns</title>'
                    + '<script defer="defer" src="' + chunkFile + '"></script>'
                    + '<script defer="defer" src="' + appJSFile + '"></script>'
                    + '<link href="' + cssFile + '" rel="stylesheet">'
                    + '<link href="' + chunkCssFile + '" rel="stylesheet">'
                    + '</head>'
                    + '<body><noscript><strong>We are sorry but mxplus_vue_ns does not work properly without JavaScript enabled. Please enable it'
                    + 'to continue.</strong></noscript>'
                    + '<div id="app"></div>'
                    + '</body>'

                    + '</html>'
                return content;

            } catch (e) {
                log.error({
                    title: "Error on getHTMLTemplate",
                    details: e
                });
            }
        }

        const getFileURL = (name) => {
            try {
                let objSearch = search.create({
                    type: 'file',
                    filters: [
                        ['name', search.Operator.IS, name]
                    ],
                    columns: [
                        { name: 'internalid' },
                        { name: 'url' }
                    ]
                });
                let numResults = objSearch.runPaged().count;
                let url_file = '';
                if (numResults) {
                    objSearch.run().each((result) => {
                        url_file = result.getValue({ name: 'url' });
                        return true;
                    });
                }
                return url_file;
            } catch (e) {
                log.error({
                    title: "getFileURL",
                    details: e
                })
            }
        }

        return { onRequest }

    });
