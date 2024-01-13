/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/file', 'N/https', 'N/log', 'N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/url'],
    /**
     * @param{file} file
     * @param{https} https
     * @param{log} log
     * @param{record} record
     * @param{runtime} runtime
     * @param{search} search
     * @param{serverWidget} serverWidget
     * @param{url} url
     */
    (file, https, log, record, runtime, search, serverWidget, url) => {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Encapsulation of the incoming request
         * @param {ServerResponse} scriptContext.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        const onRequest = (scriptContext) => {
            try {
                let request = scriptContext.request, response = scriptContext.response;
                let form = serverWidget.createForm({
                    title: 'Kiosko de Facturación',
                    hideNavBar: true
                });

                // consultTokenForKiosko();

                let html = form.addField({
                    id: 'custpage_html',
                    type: serverWidget.FieldType.INLINEHTML,
                    label: 'HTML Content'
                });
                let template_HTML = get_HTML();
                html.defaultValue = template_HTML;

                response.writePage(form);
            } catch (e) {
                log.error({ title: 'Error on onRequest', details: e });
            }
        }

        /**
         * It gets the HTML code of the page and returns it
         * @returns The HTML code of the page.
         */
        const get_HTML = () => {
            try {
                let html = '';
                let appCss = get_FileData({ name: 'app.47de9e35.css' });
               // let chuckCss = get_FileData({ name: 'chunk-vendors.2274f2ef.css' });
              let chuckCss = get_FileData({ name: 'chunk-vendors.c78fc00c.css' });
               // let chunkJS = get_FileData({ name: 'chunk-vendors.70e93831.js' });
              let chunkJS = get_FileData({ name: 'chunk-vendors.ee74cd93.js' });
                let appJS = get_FileData({ name: 'app.2d4d705c.js' });

                html += '<!DOCTYPE html>';
                html += '<html lang="en">';
                html += '<head>';
                html += '    <meta charset="utf-8">';
                html += '    <meta http-equiv="X-UA-Compatible" content="IE=edge">';
                html += '<meta name="viewport" content="width=device-width,initial-scale=1">';
                html += '<link rel="icon" href="/favicon.ico">';
                html += '<link rel="stylesheet" href="https://unicons.iconscout.com/release/v3.0.3/css/line.css">';
                html += '<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css">';
                html += '<link href="https://fonts.googleapis.com/css2?family=Karla&family=Rubik&display=swap" rel="stylesheet">';
                html += '<link rel="preconnect" href="https://fonts.gstatic.com">';
                html += '<link href="https://fonts.googleapis.com/css2?family=Abel&family=Roboto&display=swap" rel="stylesheet">';
                html += '<script src="https://kit.fontawesome.com/05c82b1ff9.js" crossorigin="anonymous"></script>';
                html += '<title>Kiosko de Facturación</title>';
                html += '<link href="' + appCss['url'] + '" rel="preload" as="style">';
                html += '<link href="' + chuckCss['url'] + '" rel="preload" as="style">';
                html += '<link href="' + appJS['url'] + '" rel="preload" as="script">';
                html += '<link href="' + chunkJS['url'] + '" rel="preload" as="script">';
                html += '<link href="' + chuckCss['url'] + '" rel="stylesheet">';
                html += '<link href="' + appCss['url'] + '" rel="stylesheet">';
                html += '</head>';
                html += '<body>';
                html += '<noscript><strong>We are sorrybutkioskov2020does not work properly without JavaScript enabled. Please enable it to continue.</strong></noscript>';
                html += '<div id="app"></div>';
                html += '<script src="' + appJS['url'] + '"></script>';
                html += '<script src="' + chunkJS['url'] + '"></script>';
                html += '</body>';
                html += '</html>';

                return html;
            } catch (e) {
                log.error({ title: 'Error on get_HTML', details: e });
            }
        }

        /**
         * It takes a file name as an argument and returns the file's URL.
         * @param options - {
         * @returns The fileData object is being returned.
         */
        const get_FileData = (options) => {
            let fileData = {
                url: ''
            };
            try {
                let fileName = options['name'];
                let files = [];
                let itemSearchObj = search.create({
                    type: 'file',
                    filters: [
                        ['name', search.Operator.IS, fileName]
                    ],
                    columns: [
                        { name: 'name' }
                    ]
                });

                let searchResultCount = itemSearchObj.runPaged().count;
                // log.debug("itemSearchObj result count", searchResultCount);

                itemSearchObj.run().each(function (result) {
                    let id = parseInt(result.id);
                    files.push({
                        id: id
                    });
                });

                let fileObj = file.load({ id: files[0].id });
                let fileURL = fileObj.url;
                fileData.url = fileURL
                // log.audit({ title: 'File ', details: JSON.stringify(fileData) });
            } catch (e) {
                log.error({
                    title: 'File Not Found',
                    details: e
                });
            } finally {
                return fileData;
            }
        }

        /* const consultTokenForKiosko = () => {
            try {
                let urlResolve = url.resolveScript({
                    scriptId: 'customscript_efx_kiosko_service_config',
                    deploymentId: 'customdeploy_efx_kiosko_service_config',
                    params: {'custparam_mode': 'getToken'},
                    returnExternalUrl: true
                });

                https.post.promise({
                    url: urlResolve,
                    headers: { 'Content-Type': 'application/json' },
                    body:{}
                }).then((response) => {
                    log.audit( { title: 'response', details: response.body } );
                }).catch((reason) => {
                    log.error( {title: 'Reason error', details: reason  } );
                })
            } catch (err) {
                log.error( {title: 'Error on consultTokenForKiosko', details: err } );
            }
        } */

        return { onRequest };

    });
