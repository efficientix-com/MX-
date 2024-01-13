/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/search', 'N/https', 'N/url', 'N/record', 'N/runtime','N/http'],

    (serverWidget, search, https, url, record, runtime,http) => {
        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            try{
                var paramsSS = scriptContext.request.parameters;
                paramsSS.vendor_id = runtime.getCurrentUser().id
                log.debug('Context', paramsSS)
                const optionForm = 1;
                switch(optionForm){
                    case 1:
                        var form = loadOCForm(paramsSS)
                        break;
                }
                if(!form){
                    log.error('Error in create Form');
                    return false;
                }
                scriptContext.response.writePage(form);
            }
            catch (e) {
                log.error('Error', e)
            }
        }

        function loadOCForm(params){
            try{

               /* headersPos = {
                    'Content-Type': 'text/xml'
                };

                // var bodyTest = {
                //     "rfc" : "AAA091014835"
                // }

                var bodyTest = {
                    "rfcs" : []
                }

                bodyTest.rfcs = [
                    {"rfc" : "AAA091014835"},
                    {"rfc" : "AAA080808HL8"},
                    {"rfc" : "ACO131014DC4"}
                ];*/

                /*var consultaLN = https.post({
                    // url: 'https://listanegra-test.lagom.agency/api/search_rfc',
                    url: 'https://listanegra-test.lagom.agency/api/search_rfcs',
                    //headers: headersPos,
                    body: bodyTest
                });

                log.audit({ title: 'consultaLN ', details: consultaLN });
                var responseBody = consultaLN.body;

                log.audit({ title: 'responseBody', details: responseBody });*/

                /** Add Fields */
                    // log.debug('parametros', params)
                var form = serverWidget.createForm({
                        title: 'Carga de Facturas'
                    });
                form.clientScriptModulePath = './PP_OC_Interface_CS.js'
                var sublist = form.addSublist({
                    id: 'custpage_purchase_order',
                    type: serverWidget.SublistType.LIST,
                    label: 'Carga de Facturas'
                });
                var selectStatus = form.addField({
                    id: 'custpage_select_status',
                    label: 'Estatus',
                    type: serverWidget.FieldType.SELECT
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var selectPage = form.addField({
                    id: 'custpage_number_page',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Número de Página'
                });
                var numDoc = form.addField({
                    id: 'custpage_number_document',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Numero de Documento'
                });
                var dateStart = form.addField({
                    id: 'custpage_start_date',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha de Inicio'
                });
                var dateEnd = form.addField({
                    id: 'custpage_end_start',
                    type: serverWidget.FieldType.DATE,
                    label: 'Fecha de Termino'
                });
                form.addButton({
                    id: 'custpage_button_filter',
                    label: 'Filtrar',
                    functionName: 'applyFilters'
                });



                /** Configurar Sublista */
                var check_sublist = sublist.addField({
                    id: 'field_checkbox',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Seleccionar'
                });
                sublist.addField({
                    id: 'field_id',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Numero de Documento'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });

                sublist.addField({
                    id: 'field_internalid',
                    type: serverWidget.FieldType.TEXT,
                    label: 'ID Interno'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                sublist.addField({
                    id: 'field_status',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Estatus'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });
                if(SUBSIDIARIES) {
                    sublist.addField({
                        id: 'field_subsidiary',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Subsidiaria'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                }
                sublist.addField({
                    id: 'field_rfc',
                    type: serverWidget.FieldType.TEXT,
                    label: 'RFC'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                sublist.addField({
                    id: 'field_vendor_name',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Proveedor'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                sublist.addField({
                    id: 'field_approved_date',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Fecha de Aprobacion'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                sublist.addField({
                    id: 'field_amount_oc',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Monto'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                sublist.addField({
                    id: 'field_invoice_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Monto Facturado'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.DISABLED
                });
                sublist.addField({
                    id: 'field_paid_amount',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Monto Pagado'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });


                sublist.addField({
                    id: 'field_parcial',
                    type: serverWidget.FieldType.CHECKBOX,
                    label: 'Parcialidad'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                var scriptObj = runtime.getCurrentScript();
                var estado_filtro = scriptObj.getParameter({name: 'custscript_efx_pp_status_portal'});


                    var pdfFieldSublist = sublist.addField({
                        id: 'field_pdf',
                        type: serverWidget.FieldType.TEXT,
                        label: 'PDF'
                    });
                    var xmlFieldSublist = sublist.addField({
                        id: 'field_xml',
                        type: serverWidget.FieldType.TEXT,
                        label: 'XML'
                    });
                    var evFieldSublist = sublist.addField({
                        id: 'field_evidence',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Evidencia'
                    });

                    var locationFieldSublist = sublist.addField({
                        id: 'field_location',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Ubicacion'
                    }).updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                if(estado_filtro && estado_filtro!=3) {
                    var statusFieldSublist = sublist.addField({
                        id: 'field_status_proceso',
                        type: serverWidget.FieldType.TEXT,
                        label: 'Estado de Proceso'
                    });
                    pdfFieldSublist.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });

                    xmlFieldSublist.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });

                    evFieldSublist.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });

                    check_sublist.updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.HIDDEN
                    });
                }
                /** Customize Form */
                var configForm = searchConfig();
                // log.debug('configForm', configForm)
                if(!configForm){
                    log.debug('Error in Set Config');
                    return false;
                }
                pdfFieldSublist.isMandatory = configForm.mandatory_pdf;
                xmlFieldSublist.isMandatory = configForm.mandatory_xml;
                evFieldSublist.isMandatory = configForm.mandatory_ev;

                var extencionesArray = new Array();
                if(configForm.extension_ev){
                    extencionesArray = (configForm.extension_ev).split(',');
                }else{
                    evFieldSublist.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.HIDDEN
                        });
                }

                form.addButton({
                    id: 'custpage_send_button',
                    label: 'Enviar',
                    functionName: "sendFunction(" + JSON.stringify(configForm) + ")"
                });

                /** Agregar Opciones */
                var jsonFilter = {};

                if(!params.status)
                    jsonFilter.status = 0;
                else {
                    jsonFilter.status = params.status * 1;
                    selectStatus.defaultValue = jsonFilter.status;
                }
                if(!params.numPage)
                    jsonFilter.page = 0;
                else {
                    jsonFilter.page = params.numPage * 1;
                    selectPage.defaultValue = jsonFilter.page;
                }
                if(!params.docNum)
                    jsonFilter.doc_num = null;
                else {
                    jsonFilter.doc_num = params.docNum;
                    numDoc.defaultValue = jsonFilter.doc_num;
                }
                if(!params.startDate)
                    jsonFilter.start_date = null;
                else {
                    jsonFilter.start_date = params.startDate;
                    dateStart.defaultValue = jsonFilter.start_date;
                }
                if(!params.endDate)
                    jsonFilter.end_date = null;
                else {
                    jsonFilter.end_date = params.endDate;
                    dateEnd.defaultValue = jsonFilter.end_date;
                }
                jsonFilter.page_size = 30;
                jsonFilter.vendor_id = params.vendor_id;
                // log.debug('json',jsonFilter)

                /*var jsonFilter = {
                    status: 0,
                    page: 0,
                    doc_num: false,
                    start_date: false,
                    end_date: false,
                    page_size: 30,
                }*/

                var filterPage;
                var searchData;
                [filterPage, searchData] = searchPagePO(jsonFilter);

                if(jsonFilter == 0)
                    selectStatus.addSelectOption({
                        value: 0,
                        text: 'Pendientes de Facturar',
                        isSelected: true
                    });
                else
                    selectStatus.addSelectOption({
                        value: 0,
                        text: 'Pendientes de Facturar',
                    });
                if(jsonFilter == 1)
                    selectStatus.addSelectOption({
                        value: 1,
                        text: 'Facturas Pendientes de Pago',
                        isSelected: true
                    });
                else
                    selectStatus.addSelectOption({
                        value: 1,
                        text: 'Facturas Pendientes de Pago'
                    });
                if(jsonFilter == 2)
                    selectStatus.addSelectOption({
                        value: 2,
                        text: 'Ambas',
                        isSelected: true
                    });
                else
                    selectStatus.addSelectOption({
                        value: 2,
                        text: 'Ambas'
                    });

                if(!filterPage || !searchData)
                    return form;


                // log.debug('Numero de filtros', filter)
                // fillPages();

                for (var i = 0; i < filterPage.page_count * 1; i++) {
                    if (i == filterPage.page * 1) {
                        selectPage.addSelectOption({
                            value : i,
                            text : 'Resultado: ' + ((i * filterPage.page_size) + 1) + ' - ' + ((i + 1) * filterPage.page_size),
                            isSelected : true
                        });
                    } else {
                        selectPage.addSelectOption({
                            value : i,
                            text : 'Resultado: ' + ((i * filterPage.page_size) + 1) + ' - ' + ((i + 1) * filterPage.page_size)
                        });
                    }
                }

                // form.appendChild(paramValue);
                var scriptObj = runtime.getCurrentScript();
                var estado_filtro = scriptObj.getParameter({name: 'custscript_efx_pp_status_portal'});
                i=0;
                searchData.forEach(function(result){
                    if(!result.rfc) result.rfc = ' '
                    if(!result.approved_date) result.approved_date = ' '
                    sublist.setSublistValue({
                        id: 'field_id',
                        line: i,
                        value: result.tranid
                    });
                    sublist.setSublistValue({
                        id: 'field_internalid',
                        line: i,
                        value: result.internalid
                    });
                    sublist.setSublistValue({
                        id: 'field_status',
                        line: i,
                        value: result.status
                    });
                    if(SUBSIDIARIES) {
                        sublist.setSublistValue({
                            id: 'field_subsidiary',
                            line: i,
                            value: result.subsidiary
                        });
                    }
                    sublist.setSublistValue({
                        id: 'field_rfc',
                        line: i,
                        value: result.rfc
                    });
                    sublist.setSublistValue({
                        id: 'field_vendor_name',
                        line: i,
                        value: result.entity
                    });
                    sublist.setSublistValue({
                        id: 'field_approved_date',
                        line: i,
                        value: result.approved_date
                    });
                    sublist.setSublistValue({
                        id: 'field_amount_oc',
                        line: i,
                        value: result.total
                    });
                    sublist.setSublistValue({
                        id: 'field_invoice_amount',
                        line: i,
                        value: result.total_bill
                    });
                    sublist.setSublistValue({
                        id: 'field_paid_amount',
                        line: i,
                        value: result.total_payed
                    });

                    log.audit({title:'result.location',details:result.location});
                    if(result.location) {
                        sublist.setSublistValue({
                            id: 'field_location',
                            line: i,
                            value: result.location
                        });

                    }

                        sublist.setSublistValue({
                            id: 'field_pdf',
                            line: i,
                            value: '<input type="file" id="field_pdf_' + i + '" accept=".pdf" style="width:150px" class="fileinpt">'
                        });


                        sublist.setSublistValue({
                            id: 'field_xml',
                            line: i,
                            value: '<input type="file" id="field_xml_' + i + '" accept=".xml" style="width:150px" class="fileinpt">'
                        });


                        if(extencionesArray.length>0){
                            var extencionesCadena = '';
                            var conteosext=0;
                            for(var x=0;x<extencionesArray.length;x++){
                                conteosext++;
                                extencionesCadena = extencionesCadena+'.'+extencionesArray[x];
                                if(conteosext<extencionesArray.length){
                                    extencionesCadena = extencionesCadena+', '
                                }
                            }
                            log.audit({title:'extencionesCadena',details:extencionesCadena});
                            sublist.setSublistValue({
                                id: 'field_evidence',
                                line: i,
                                value: '<input type="file" id="field_evidence_' + i + '" accept="'+ extencionesCadena +'" style="width:150px" class="fileinpt">'
                            });
                        }



                    if(estado_filtro && estado_filtro!=3) {
                        sublist.setSublistValue({
                            id: 'field_status_proceso',
                            line: i,
                            value: result.estado_proceso
                        });
                    }


                    i++;
                });


                return form;
            }
            catch (e) {
                log.error('Error in Create Form', e)
            }
        }

        function searchPagePO(jsonFilter){
            try{
                const searchOC = searchPurchaseOrder(jsonFilter);
                // log.debug('searchOC', searchOC)
                jsonFilter.page_count = Math.ceil(searchOC.count / jsonFilter.page_size);
                if (!jsonFilter.page || jsonFilter.page == '' || jsonFilter.page < 0)
                    jsonFilter.page = 0;
                else if (jsonFilter.page >= jsonFilter.page_count)
                    jsonFilter.page = jsonFilter.page_count - 1;
                var POResult;
                var internalIDArray;
                [POResult, internalIDArray] = searchResultPO(searchOC, jsonFilter.page)
                if(!POResult || !internalIDArray)
                    return [false, false];

                if(internalIDArray.length>0) {
                    var busca_ocs = search.create({
                        type: search.Type.VENDOR_BILL,
                        filters: [
                            ['taxline', search.Operator.IS, 'F']
                            , 'AND',
                            ['mainline', search.Operator.IS, 'T']
                            , 'AND',
                            ['createdfrom', search.Operator.ANYOF, internalIDArray]
                        ],
                        columns: [
                            search.createColumn({name: 'tranid'}),
                            search.createColumn({name: 'total'}),
                            search.createColumn({name: 'createdfrom'}),
                            search.createColumn({name: 'payingamount'}),
                            search.createColumn({name: 'total', join: 'createdfrom'}),
                        ]
                    });

                    var ejecutar_busca_ocs = busca_ocs.run();
                    var resultado_busca_ocs = ejecutar_busca_ocs.getRange(0, 100);


                    for (var y = 0; y < internalIDArray.length; y++) {
                        var billAmount = 0;
                        var payAmount = 0;
                        for (var i = 0; i < resultado_busca_ocs.length; i++) {
                            var oc_billtranid_ = resultado_busca_ocs[i].getValue({name: 'tranid'}) || '';
                            var oc_total = resultado_busca_ocs[i].getValue({name: 'total'}) || 0;
                            var oc_createdfrom = resultado_busca_ocs[i].getValue({name: 'createdfrom'}) || '';
                            var oc_payingamount = resultado_busca_ocs[i].getValue({name: 'payingamount'}) || 0;
                            var oc_createdfrom_total = resultado_busca_ocs[i].getValue({
                                name: 'total',
                                join: 'createdfrom'
                            }) || '';

                            if (oc_createdfrom == internalIDArray[y]) {
                                billAmount = billAmount + parseFloat(oc_total);
                                payAmount = payAmount + parseFloat(oc_payingamount);
                            }
                        }
                        POResult[y].total_bill = billAmount;
                        POResult[y].total_payed = payAmount;
                    }
                }

                // for(var i = 0; i < internalIDArray.length; i++){
                //     var billAmount = 0;
                //     var payAmount = 0;
                //
                //     var purchaseOrder = record.load({
                //         type: record.Type.PURCHASE_ORDER,
                //         id: internalIDArray[i]
                //     });
                //     const numberLines = purchaseOrder.getLineCount({
                //         sublistId: 'links'
                //     });
                //     const purchaseTotal = purchaseOrder.getValue({
                //         fieldId: 'total'
                //     });
                //
                //     for(var j = 0; j< numberLines; j++){
                //         const typeLink = purchaseOrder.getSublistValue({
                //             sublistId: 'links',
                //             fieldId: 'type',
                //             line: j
                //         });
                //         if(typeLink == 'Bill')
                //         {
                //             const billID = purchaseOrder.getSublistValue({
                //                 sublistId: 'links',
                //                 fieldId: 'id',
                //                 line: j
                //             });
                //             const billTotal = purchaseOrder.getSublistValue({
                //                 sublistId: 'links',
                //                 fieldId: 'total',
                //                 line: j
                //             }) * 1;
                //             billAmount += billTotal
                //
                //             const vendorBill = record.load({
                //                 type: record.Type.VENDOR_BILL,
                //                 id: billID * 1
                //             });
                //             const amountVendorBill = vendorBill.getValue({
                //                 fieldId: 'total'
                //             });
                //             const linesVendorBill = vendorBill.getLineCount({
                //                 sublistId: 'links'
                //             });
                //
                //             var pay = 0;
                //             for(var k = 0; k < linesVendorBill; k++){
                //                 var typeLinkVB = vendorBill.getSublistValue({
                //                     sublistId: 'links',
                //                     fieldId: 'type',
                //                     line: k
                //                 });
                //                 if(typeLinkVB == 'Bill Payment') {
                //                     pay += vendorBill.getSublistValue({
                //                         sublistId: 'links',
                //                         fieldId: 'total',
                //                         line: k
                //                     }) * 1;
                //                 }
                //             }
                //             if(pay > amountVendorBill){
                //                 pay = amountVendorBill;
                //             }
                //             payAmount += pay;
                //             // log.debug('Bill ID', internalIDArray[i] + ': // ' + j + ': // ' + billID)
                //         }
                //
                //         // log.debug('Number Lines', internalIDArray[i] + ': // ' + j + ': // ' + typeLink);
                //
                //     }
                //     if( billAmount > purchaseTotal ){
                //         billAmount = purchaseTotal
                //     }
                //     if(payAmount > purchaseTotal){
                //         payAmount = purchaseTotal
                //     }
                //         POResult[i].total_bill = billAmount;
                //         POResult[i].total_payed = payAmount;
                //
                // }
                log.debug('POResult', POResult)
                return [jsonFilter, POResult];
            }
            catch (e) {
                log.error('Error in Search Page Purchase Order', e)
            }
        }

        function searchResultPO(searchPage, pageId){
            log.error('searchPage', searchPage);
            log.error('pageId', pageId);
            try {
                var searchPage = searchPage.fetch({
                    index: pageId,
                });

                var internalIDArray = new Array();
                var results = new Array();
                // var internalIDArray = new Array();
                var rfc_proveedor = '';
                searchPage.data.forEach(function (result) {

                    var iddeproveedor = result.getValue('entity');
                    if(!rfc_proveedor){
                        if(iddeproveedor) {
                            var recVendor = record.load({
                                type: record.Type.VENDOR,
                                id:iddeproveedor
                            });
                            rfc_proveedor = recVendor.getValue({fieldId:'custentity_mx_rfc'});
                        }
                    }
                    results.push({
                        'internalid': result.getValue('internalid'),
                        'tranid': result.getValue('tranid'),
                        'status': result.getText('status'),
                        'subsidiary': result.getText('subsidiary'),
                        'rfc': rfc_proveedor,
                        'entity': result.getText('entity'),
                        'approved_date': result.getValue('custbody_efx_fecha_aprobacion_oc'),
                        'estado_proceso': result.getText('custbody_efx_pp_process_portal'),
                        'total': result.getValue('total'),
                        'location': result.getValue('location') || '',

                    });


                    internalIDArray.push(result.getValue('internalid'))
                });
                // log.debug({title: 'internal', details: internalIDArray});

                return [results, internalIDArray];
            }
            catch (e) {
                log.error('Error in Obtain results Array', e)
                return [false, false];
            }
        }

        function searchPurchaseOrder(filter){
            try{
                var SUBSIDIARIES = runtime.isFeatureInEffect({ feature: "SUBSIDIARIES" });

                if(SUBSIDIARIES){
                    var searchPO = search.create({
                        type: search.Type.PURCHASE_ORDER,
                        columns: [
                            'internalid',
                            'tranid',
                            'status',
                            'subsidiary',
                            'custbody_mx_customer_rfc',
                            'entity',
                            'custbody_efx_fecha_aprobacion_oc',
                            'total',
                            'custbody_efx_pp_process_portal',
                            'location',
                        ],
                        filters: [
                        ]
                    });
                }else{
                    var searchPO = search.create({
                        type: search.Type.PURCHASE_ORDER,
                        columns: [
                            'internalid',
                            'tranid',
                            'status',
                            'custbody_mx_customer_rfc',
                            'entity',
                            'custbody_efx_fecha_aprobacion_oc',
                            'total',
                            'custbody_efx_pp_process_portal',
                            'location',
                        ],
                        filters: [
                        ]
                    });
                }

                var filters = new Array();
                var scriptObj = runtime.getCurrentScript();
                var estado_filtro = scriptObj.getParameter({name: 'custscript_efx_pp_status_portal'});
                log.audit({title:'estado_filtro',details:estado_filtro});
                log.audit({title:'filter',details:filter});
                log.audit({title:'filter.vendor_id',details:filter.vendor_id});
                log.audit({title:'filter.status',details:filter.status});
                log.audit({title:'filter.doc_num',details:filter.doc_num});
                if(!estado_filtro) {
                    filters = [
                        // {
                        //     name: 'type', operator: search.Operator.ANYOF, values: 'PurchOrd'
                        // },
                        {
                            name: 'mainline', operator: search.Operator.IS, values: 'T'
                        }, {
                            name: 'name', operator: search.Operator.ANYOF, values: filter.vendor_id
                        }, {
                            name: 'custbody_efx_pp_process_portal',
                            operator: search.Operator.ANYOF,
                            values: ['@NONE@', '3','6']
                        }
                    ]
                }else if(estado_filtro==5 || estado_filtro==2){
                    filters = [
                        // {
                        //     name: 'type', operator: search.Operator.ANYOF, values: 'PurchOrd'
                        // },
                        {
                            name: 'mainline', operator: search.Operator.IS, values: 'T'
                        }, {
                            name: 'name', operator: search.Operator.ANYOF, values: filter.vendor_id
                        }, {
                            name: 'custbody_efx_pp_process_portal',
                            operator: search.Operator.ANYOF,
                            values: ['2', '5']
                        }
                    ]
                }
                if(!filter.doc_num) {
                    log.audit({title:'filter.status',details:filter.status});
                    switch (filter.status) {
                        case 0:
                            filters.push({
                                name: 'status', operator: search.Operator.ANYOF, values: ['PurchOrd:B','PurchOrd:E','PurchOrd:F','PurchOrd:D']
                            })
                            break;
                        case 1:
                            filters.push({
                                name: 'status', operator: search.Operator.ANYOF, values: 'PurchOrd:G'
                            })
                            break;
                        case 2:
                            filters.push({
                                name: 'status', operator: search.Operator.ANYOF, values: ['PurchOrd:F', 'PurchOrd:G']
                            })
                            break;
                    }
                }
                if(filter.start_date && !filter.end_date)
                    filters.push({
                        name: 'trandate', operator: search.Operator.ONORAFTER, values: filter.start_date
                    });
                else if (!filter.start_date && filter.end_date)
                    filters.push({
                        name: 'trandate', operator: search.Operator.ONORBEFORE, values: filter.end_date
                    });
                else if (filter.start_date && filter.end_date)
                    filters.push({
                        name: 'trandate', operator: search.Operator.WITHIN, values: [filter.start_date, filter.end_date]
                    });
                
                // log.debug('filters', filters)
                // log.debug('filters search', searchPO.filters)
                filters.push({
                    name: 'memorized', operator: search.Operator.IS, values: "F"
                });
                searchPO.filters = filters;
                
                log.audit({title:'filters',details:filters});
                var testd = searchPO.runPaged({
                    pageSize: filter.page_size
                });
                log.audit({title:'testd',details:testd});

                return searchPO.runPaged({
                    pageSize: filter.page_size
                });

            }
            catch (e) {
                log.debug('Error in Search Purchase Order', e)
            }

        }

        function searchConfig(){
            try{
                var dataSearch = search.create({
                    type: 'customrecordefx_pp_vendor_pconfig',
                    columns: [
                        'custrecord_efx_pp_mandatory_pdf',
                        'custrecord_efx_pp_mandatory_xml',
                        'custrecord_efx_pp_mandatory_ev',
                        'custrecord_efx_pp_extencion_ev',
                        'custrecord_efx_pp_block_status',
                        'custrecord_efx_pp_warn_status',
                        'custrecord_efx_pp_warn_message'
                    ],
                    filters: [
                    ]
                }).run().getRange(0,100);
                var jsonReturn = {
                    mandatory_pdf: dataSearch[0].getValue('custrecord_efx_pp_mandatory_pdf'),
                    mandatory_xml: dataSearch[0].getValue('custrecord_efx_pp_mandatory_xml'),
                    mandatory_ev: dataSearch[0].getValue('custrecord_efx_pp_mandatory_ev'),
                    extension_ev: dataSearch[0].getValue('custrecord_efx_pp_extencion_ev'),
                    block_status: dataSearch[0].getValue('custrecord_efx_pp_block_status'),
                    warn_status: dataSearch[0].getValue('custrecord_efx_pp_warn_status'),
                    warn_message: dataSearch[0].getValue('custrecord_efx_pp_warn_message')
                }
                log.audit({title:'jsonReturn',details:jsonReturn});
                return jsonReturn
            }
            catch (e) {
                log.error('Error in search Config', e);
                return false;
            }
        }


        return {onRequest}

    });