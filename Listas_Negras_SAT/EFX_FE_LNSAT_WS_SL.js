/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/http', 'N/https', 'N/record', 'N/runtime', 'N/search'],
    /**
 * @param{http} http
 * @param{https} https
 * @param{record} record
 * @param{runtime} runtime
 * @param{search} search
 */
    (http, https, record, runtime, search) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         * @param {boolean} context.request.body.multiple - Verdadero si son multiples RFC. Falso si solo es un RFC.
         * @param {object} context.request.body.rfcs - se envia un objeto con rfcs, la estructura varia.
         * Multiples RFC
         * {"rfc":"","rfcs":[{"rfc":"AAA010101AAA"},{"rfc":"AAA010101AAA"}]}
         * Un solo RFC
         * {"rfc" : "AAA010101AAA"}
         */
        const onRequest = (context) => {
            log.audit({title: 'Inicia ', details: ''});
            log.audit({title: 'context.request ', details: context.request});
            log.audit({title: 'context ', details: context});
            var body = context.request.body || '';

            if(body) {
                var bodyObj = JSON.parse(body);
                var multiple = bodyObj.multiple || '';
                var rfcs = bodyObj.rfcs || '';
                log.audit({title: 'multiple ', details: multiple});
                log.audit({title: 'rfcs ', details: rfcs});

                if (rfcs) {
                    headersPos = {
                        'Content-Type': 'application/json'
                    };

                    var url = ''
                    if (multiple) {
                        url = 'https://listanegra-test.lagom.agency/api/search_rfcs';
                    } else {
                        url = 'https://listanegra-test.lagom.agency/api/search_rfc'
                    }
                    var consultaLN = https.post({
                        url: url,
                        headers: headersPos,
                        body: JSON.stringify(rfcs)
                    });

                    log.audit({title: 'consultaLN ', details: consultaLN});
                    var responseBody_s = consultaLN.body;
                    if (responseBody_s && consultaLN.code == 200) {
                        var responseBody = JSON.parse(responseBody_s);
                        log.audit({title: 'responseBody', details: responseBody});
                        log.audit({title: 'responseBody.success', details: responseBody.success});

                        if (responseBody.success) {
                            log.audit({title: 'responseBody.data.length', details: responseBody.data.length});
                            context.response.write({
                                output: JSON.stringify(responseBody)
                            });
                        }
                    }


                }
            }





        }

        return {onRequest}

    });
