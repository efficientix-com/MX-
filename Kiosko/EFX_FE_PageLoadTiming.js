/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/log', 'N/url', 'N/https', 'N/search', 'N/record','N/config'], (log, url, https, search, record,config) => {
    /**
     * Defines the Suitelet script trigger point.
     * @param {Object} scriptContext
     * @param {ServerRequest} scriptContext.request - Incoming request
     * @param {ServerResponse} scriptContext.response - Suitelet response
     * @since 2015.2
     */
    const onRequest = async (scriptContext) => {
        let response = scriptContext.response, request = scriptContext.request, params = request.parameters;
        let data = {};
        try {
            log.debug({
                title: "Params received",
                details: params
            });
            if (params.sendTime) {
                log.debug({
                    title: "Params Time received successfully",
                    details: JSON.parse(params.sendTime)
                });
                let response_newRecord = newRecord(JSON.parse(params.sendTime))
                response.write({
                    output: response_newRecord + ''
                });
            }
            if (params.getPageTimer) {
                var objData = searchPageTimer();
                const objResp = JSON.stringify(objData);
                log.debug({
                    title: "objResp",
                    details: objResp
                });
                response.write({
                    output: objResp
                });
            }
            if(params.getTimeZone){
                var timeZone=getTimeZone();
                log.debug({
                    title: "timeZone",
                    details: JSON.stringify(timeZone)
                });
                response.write({
                    output: JSON.stringify(timeZone)
                });

            }
        } catch (e) {
            log.error({
                title: "Error on onRequest",
                details: e
            })
        }
    }
    const newRecord = async (body) => {
        try {

            let objRecord = record.create({
                type: "customrecord_efx_fe_loadingpage_timer",
                isDynamic: true
            });
            for (let key in body) {
                if (body.hasOwnProperty(key)) {
                    objRecord.setValue({
                        fieldId: key,
                        value: body[key]
                    });
                }
            }
            objRecord.save();
            return "Registro creado con éxito";
        } catch (err) {
            log.error({
                title: "Error newRecord",
                details: err
            });
            return "Error: " + err
        }
    }
    const getTimeZone=()=>{
        let timeZone="";

        try{
            var configCompany = config.load({
                type: config.Type.COMPANY_INFORMATION
            });
            timeZone=configCompany.getValue({fieldId:'timezone' });
            log.debug({
                title: "timeZone",
                details: timeZone
            });

        }catch(err){
            log.error({
                title: "Error occurred in getTimeZone",
                details: err
            });
        }
        return timeZone;

    }
    const searchPageTimer = () => {
        let arrSearchResult=[];
        const customrecord_efx_fe_loadingpage_timerSearchColId = search.createColumn({ name: 'id', sort: search.Sort.ASC });
        const customrecord_efx_fe_loadingpage_timerSearchColDate = search.createColumn({ name: 'custrecord_loading_date' });
        const customrecord_efx_fe_loadingpage_timerSearchColStepslug = search.createColumn({ name: 'custrecord_loading_step' });
        const customrecord_efx_fe_loadingpage_timerSearchColTime = search.createColumn({ name: 'custrecord_loading_time' });
        const customrecord_efx_fe_loadingpage_timerSearchColUrl = search.createColumn({ name: 'custrecord_loading_url' });
        const customrecord_efx_fe_loadingpage_timerSearchColSuccessfulRequest = search.createColumn({ name: 'custrecord_loading_status' });
        const customrecord_efx_fe_loadingpage_timerSearchColMessage = search.createColumn({ name: 'custrecord_loading_message' });
        const customrecord_efx_fe_loadingpage_timerSearchColTicketId = search.createColumn({ name: 'custrecord_loading_ticket_id' });
        const customrecord_efx_fe_loadingpage_timerSearchColTicketDate = search.createColumn({ name: 'custrecord_loading_ticket_date' });
        const customrecord_efx_fe_loadingpage_timerSearchColTicketCantidad = search.createColumn({ name: 'custrecord_loading_ticket_cantidad' });
        const customrecord_efx_fe_loadingpage_timerSearchColTicketRfc = search.createColumn({ name: 'custrecord_loading_ticket_rfc' });
        const customrecord_efx_fe_loadingpage_timerSearch = search.create({
            type: 'customrecord_efx_fe_loadingpage_timer',
            filters: [
                ['custrecord_loading_step', 'isnotempty', ''],
            ],
            columns: [
                customrecord_efx_fe_loadingpage_timerSearchColId,
                customrecord_efx_fe_loadingpage_timerSearchColDate,
                customrecord_efx_fe_loadingpage_timerSearchColStepslug,
                customrecord_efx_fe_loadingpage_timerSearchColTime,
                customrecord_efx_fe_loadingpage_timerSearchColUrl,
                customrecord_efx_fe_loadingpage_timerSearchColSuccessfulRequest,
                customrecord_efx_fe_loadingpage_timerSearchColMessage,
                customrecord_efx_fe_loadingpage_timerSearchColTicketId,
                customrecord_efx_fe_loadingpage_timerSearchColTicketDate,
                customrecord_efx_fe_loadingpage_timerSearchColTicketCantidad,
                customrecord_efx_fe_loadingpage_timerSearchColTicketRfc
            ],
        });
        // Note: Search.run() is limited to 4,000 results
        // customrecord_efx_fe_loadingpage_timerSearch.run().each((result: search.Result): boolean => {
        //   return true;
        // });
        const customrecord_efx_fe_loadingpage_timerSearchPagedData = customrecord_efx_fe_loadingpage_timerSearch.runPaged({ pageSize: 1000 });
        for (let i = 0; i < customrecord_efx_fe_loadingpage_timerSearchPagedData.pageRanges.length; i++) {
            const customrecord_efx_fe_loadingpage_timerSearchPage = customrecord_efx_fe_loadingpage_timerSearchPagedData.fetch({ index: i });
            customrecord_efx_fe_loadingpage_timerSearchPage.data.forEach((result) => {
                const id = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColId);
                const date = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColDate);
                const stepslug = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColStepslug);
                const time = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColTime);
                const url = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColUrl);
                const successfulRequest = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColSuccessfulRequest);
                const message = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColMessage);
                const ticket_id = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColTicketId);
                const ticket_date = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColTicketDate);
                const ticket_cantidad = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColTicketCantidad);
                const ticket_rfc = result.getValue(customrecord_efx_fe_loadingpage_timerSearchColTicketRfc);
                arrSearchResult.push({
                    stepslug: stepslug,
                    date: date,
                    time: time,
                    successfulRequest: successfulRequest,
                    message:message,
                    ticket_id:ticket_id,
                    ticket_date:ticket_date,
                    ticket_cantidad:ticket_cantidad,
                    ticket_rfc:ticket_rfc
                });
            });
        }
        log.debug({
            title: "arrSearchResult",
            details: arrSearchResult
        });
        return arrSearchResult;
    }
    return { onRequest }
});
