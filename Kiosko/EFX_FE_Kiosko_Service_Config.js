/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/config', 'N/file', 'N/https', 'N/log', 'N/runtime', 'N/search', 'N/url'],
    /**
     * @param{config} config
     * @param{file} file
     * @param{https} https
     * @param{log} log
     * @param{runtime} runtime
     * @param{search} search
     * @param{url} url
     */
    (config, file, https, log, runtime, search, url) => {
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
                log.audit({
                    title: "PARAMS",
                    details: params
                });
                if (request.method === 'GET') {
                    log.debug({
                        title: "GET",
                        details: params
                    });
                }
                if(params.custparam_mode=="configurationData"){
                    data = await getConfigs();
                    log.audit({
                        title: "DATA TO SEND",
                        details: data
                    });
                    response.write({ output: JSON.stringify(data) })
                }
                if(params.custparam_mode=="getCountries"){
                    data = getCountries();
                    response.write({ output: JSON.stringify(data) })
                    
                }
                if(params.custparam_mode=="getBillingData"){
                    data = getBillingInformation();
                    response.write({ output: JSON.stringify(data) })
                }
                if(params.custparam_mode!=='getCountries'||params.custparam_mode!== "getBillingData" || params.custparam_mode!=="configurationData")
                // if (params.custparam_mode) {
                //     log.debug("📍 ~ onRequest ~ params.custparam_mode", params.custparam_mode);
                //     switch (params.custparam_mode) {
                //         /* case 'getToken':
                //             data = getToken();
                //             break; */
                //         case 'configurationData':
                //             data = await getConfigs();
                //             response.write({ output: JSON.stringify(data) })
                //             break;
                //         case 'getCountries':
                //             data = getCountries();
                //             break;
                //         case 'getBillingData':
                //             data = getBillingInformation();
                //             break;
                //         default:
                //             data.success = false;
                //             data.details = "No se encontró la función para " + params.custparam_mode;
                //     }
                // } else {
                //     data.success = false;
                //     data.details = "Se require hacer uso de una función";
                // }
                
                log.debug("📍 ~ onRequest ~ data", data);
            } catch (e) {
                log.error({ title: 'Error on onRequest', details: e });
                data.success = false;
                data.details = e.message;
                response.writeLine({ output: JSON.stringify(data) })
            }
        }

        /* const getToken = () => {
            let data = { success: false, details: '' };
            try {
                let account = runtime.accountId;
                let companyInfo = config.load({
                    type: config.Type.COMPANY_PREFERENCES
                });
                var token = companyInfo.getValue({
                    fieldId: 'custscript_efx_kiosko_token_con'
                });

                //data['info'] = {account: account, token: token}

                if (!token) {
                    data.success = false;
                    data.details = 'No cuenta con un token de conexión'
                } else {
                    // let validatedToken = validateToken(account, token);
                    let validatedToken = null;
                    https.post.promise({
                        url: 'https://tstdrv2220309.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1657&deploy=1&compid=TSTDRV2220309&h=96b73a483ff15d322414',
                        body: { accountId: account, tok: token },
                        headers: {
                            name: 'Content-Type',
                            value: 'application/json'
                        }
                    }).then((response) => {
                        validatedToken = response.body;
                        log.audit({ title: 'validate token', details: validatedToken });
                        if (validatedToken.result.success === true) {
                            data.success = true;
                            data.details = validatedToken.result.result
                        } else {
                            data.success = false;
                            data.details = validatedToken.result.details
                        }
                        return data
                    }).catch((err) => {
                        data.details = err;
                    });
                    //let validatedToken = response.body;
                }
            } catch (err) {
                log.error({ title: 'Error on getToken', details: err });
            }
            return data;
        }

        const validateToken = (account, token) => {
            let data = { result: null, details: null }
            try {
                let response = https.post({
                    url: 'https://tstdrv2220309.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1657&deploy=1&compid=TSTDRV2220309&h=96b73a483ff15d322414',
                    body: { accountId: account, tok: token },
                    headers: {
                        name: 'Content-Type',
                        value: 'application/json'
                    }
                });
                data['code'] = response.code;
                data.result = response.body;
            } catch (err) {
                log.error({ title: 'Error on validateToken', details: err });
            }
            return data;
        } */

        /**
         * Retorna las configuraciones listadas en Netsuite para kiosko
         * @returns {{}}
         */
        const getConfigs = async () => {
            let data = {};
            try {
                let filterConfig = search.createFilter({
                    name: 'isinactive',
                    operator: search.Operator.IS,
                    values: 'F'
                });
                let searchObj = search.load({ id: 'customsearch_efx_kiosko_config' });
                searchObj.filters = filterConfig;
                let searchCount = searchObj.runPaged().count;
                if (searchCount > 0) {
                    data.success = true;
                    data.result = [];
                    searchObj.run().each((result) => {
                        let id = result.getValue({ name: "internalid" });
                        let company = result.getText({ name: "custrecord_efx_kiosko_company" });
                        let company_id = result.getValue({ name: "custrecord_efx_kiosko_company" });
                        let legal_name = result.getValue({ name: "legalname", join: "custrecord_efx_kiosko_company" });
                        let logo = getLogoURL(result.getValue({ name: "custrecord_efx_kiosko_logo" }));
                        let msgError = result.getValue({ name: "custrecord_efx_kiosko_msg_error" });
                        let msgWarning = result.getValue({ name: "custrecord_efx_kiosko_msg_warning" });
                        let msgCustom = result.getValue({ name: "custrecord_efx_kiosko_msg_custom" });
                        let msgSuccessStamp = result.getValue({ name: "custrecord_efx_kiosko_msg_timbre" });
                        let msgErrorStamp = result.getValue({ name: "custrecord_efx_kiosko_msg_error_timb" });
                        let showMsgDetail = result.getValue({ name: "custrecord_efx_kiosko_msg_show_detail" })
                        let cssFile = getCSSURL(result.getValue({ name: 'custrecord_efx_kiosko_css' }));
                        let documentpack = result.getValue({ name: 'custrecord_efx_kosko_documentpack' });
                        let aditionalInfo = result.getValue({ name: 'custrecord_efx_kiosko_aditional_info' });
                        let img_example = getLogoURL(result.getValue({ name: 'custrecord_efx_kiosko_example_img' }));
                        let select_ieps = result.getValue({ name: 'custrecord_efx_kiosko_select_ieps' });
                        let noteDisplayCustom = result.getValue({ name: 'custrecord_efx_kiosko_display_ctmr_msg' });
                        let noteDefault = result.getValue({ name: 'custrecord_efx_kiosko_custom_notes' });
                        let noteCustomNote = result.getValue({ name: 'custrecord_efx_kiosko_ctmr_msg' });

                        let configs = {
							id: id,
							subsidiary: company,
							subsidiary_id: company_id,
							company: legal_name,
							logo: logo,
							css: cssFile,
							img_example: img_example,
							documentpack: documentpack,
							aditionalInfo: aditionalInfo,
							showMsgDetail: showMsgDetail,
							ieps: select_ieps,
							messages: {
								error: msgError,
								warning: msgWarning,
								custom: msgCustom,
								successStamp: msgSuccessStamp,
								errorStamp: msgErrorStamp,
							},
							altMsg: {
								displayCustom: noteDisplayCustom,
								nDef: noteDefault,
								customNote: noteCustomNote,
							},
							fields: [],
							politics: [],
							customerForm: [],
						};
                        data.result.push(configs)
                        return true;
                    });
                    if (data.result.length > 0) {
                        var configs = [];
                        for (let i = 0; i < data.result.length; i++) {
                            configs.push(data.result[i].id);
                        }
                        let fieldsResults = getConfigFields(configs);
                        let politicsResults = getConfigPolitics(configs);
                        let fieldsCustomerResults = getConfigCustomerForms(configs);
                        if (fieldsResults.success === true) {
                            let keyFields = Object.keys(fieldsResults.data);
                            for (let conf = 0; conf < configs.length; conf++) {
                                for (let key in keyFields) {
                                    if (configs[conf] === keyFields[key]) {
                                        data.result[conf].fields = fieldsResults.data[keyFields[key]];
                                    }
                                }
                            }
                            if (politicsResults.success === true) {
                                let keyPolitics = Object.keys(politicsResults.data);
                                for (let conf = 0; conf < configs.length; conf++) {
                                    for (let key in keyPolitics) {
                                        if (configs[conf] === keyPolitics[key]) {
                                            data.result[conf].politics = politicsResults.data[keyPolitics[key]];
                                        }
                                    }
                                }
                            }
                            if (fieldsCustomerResults.success === true) {
                                let keyCFFields = Object.keys(fieldsCustomerResults.data);
                                for (let conf = 0; conf < configs.length; conf++) {
                                    for (let key in keyCFFields) {
                                        if (configs[conf] === keyCFFields[key]) {
                                            data.result[conf].customerForm = fieldsCustomerResults.data[keyCFFields[key]];
                                        }
                                    }
                                }
                            }
                        } else {
                            data.success = false;
                            data.details = fieldsResults.details;
                        }
                    }
                } else {
                    data.success = false;
                    data.details = 'No se ha encontrado la configuración de kiosko'
                }
                return data
            } catch (e) {
                log.error({ title: 'Error on getConfigs', details: e });
                data.success = false;
                data.details = "Ha ocurrido un error al buscar la configuración";
                return data;
            }
        }

        /**
         * Obtención de los campos relacionados con la configuración
         * @param configID
         * @returns {{}}
         */
        const getConfigFields = (configID) => {
            let fields = {};
            try {
                let filterID = [
                    ['custrecord_efx_fields_config', search.Operator.ANYOF, configID],
                    "AND",
                    ['isinactive', search.Operator.IS, 'F']
                ];
                let searchObj = search.load({ id: 'customsearch_efx_efx_kiosko_fields' });
                searchObj.filterExpression = filterID;
                let searchCount = searchObj.runPaged().count;
                if (searchCount > 0) {
                    let dataResult = {};
                    searchObj.run().each((result) => {
                        let name = result.getValue({ name: "name" });
                        let fieldID = result.getValue({ name: "custrecord_efx_fields_record_id" });
                        let type = result.getText({ name: "custrecord_efx_fields_type" });
                        let rule = result.getValue({ name: "custrecord_efx_fields_rules" });
                        let icon_pack = result.getValue({ name: "custrecord_efx_fields_icon_pack" });
                        let icon = result.getValue({ name: "custrecord_efx_fields_icon" });
                        let config_related = result.getValue({ name: 'custrecord_efx_fields_config' });
                        if (!dataResult.hasOwnProperty(config_related)) {
                            dataResult[config_related] = [];
                            dataResult[config_related].push({
                                name: name,
                                fieldID: fieldID,
                                type: type,
                                rule: rule,
                                icon_pack: icon_pack,
                                icon: icon
                            })
                        } else {
                            dataResult[config_related].push({
                                name: name,
                                fieldID: fieldID,
                                type: type,
                                rule: rule,
                                icon_pack: icon_pack,
                                icon: icon
                            })
                        }
                        return true
                    });
                    fields.success = true;
                    fields.data = dataResult;
                } else {
                    fields.success = false;
                    fields.details = 'No se han encontrado campos relacionados con esta configuración';
                }
                return fields;
            } catch (e) {
                log.error({ title: 'Error on getConfigFields', details: e });
                fields.success = false;
                fields.details = 'Ha ocurrido un error al consultar los campos';
                return fields
            }
        }

        /**
         * Obtención de políticas en configuración
         * @param configID
         * @returns {{data: {}, success: boolean, details: string}}
         */
        const getConfigPolitics = (configID) => {
            let data = {
                success: false,
                data: {},
                details: ''
            }
            try {
                let filterIDs = [
                    ['custrecord_efx_kiosko_related', search.Operator.ANYOF, configID],
                    "AND",
                    ['isinactive', search.Operator.IS, 'F']
                ];
                let searchObj = search.load({ id: 'customsearch_efx_kiosko_politics' });
                searchObj.filterExpression = filterIDs;
                let resultsCount = searchObj.runPaged().count;
                if (resultsCount != 0) {
                    let dataResult = {};
                    searchObj.run().each((result) => {
                        let type = result.getValue({ name: 'custrecord_efx_kiosko_rule_type' });
                        let value = result.getValue({ name: 'custrecordcustrecord_efx_kiosko_rule_val' });
                        let label = result.getValue({ name: 'custrecord_efx_kiosko_politic_label' });
                        let config_related = result.getValue({ name: 'custrecord_efx_kiosko_related' })
                        if (!dataResult.hasOwnProperty(config_related)) {
                            dataResult[config_related] = [];
                            dataResult[config_related].push({
                                type: type,
                                value: value,
                                label: label
                            });
                        } else {
                            dataResult[config_related].push({
                                type: type,
                                value: value,
                                label: label
                            });
                        }
                        return true;
                    });
                    data.success = true;
                    data.data = dataResult;
                } else {
                    data.success = false;
                    data.details = 'No se encontraron políticas relacionadas'
                }
                return data;
            } catch (e) {
                log.error({ title: 'Error on getConfigPolitics', details: e });
                data.success = false;
                data.details = 'Ha ocurrido un error al consultar las políticas';
                return data;
            }
        }

        /**
         * It takes a configID as a parameter, and returns an object with a success property, a data
         * property, and a details property
         * @param configID - The ID of the configuration record that you want to retrieve.
         */
        const getConfigCustomerForms = (configID) => {
            let res = { success: false, data: {}, details: '' };
            try {
                let filters = [
                    ['custrecord_efx_kiosko_fc_config', search.Operator.ANYOF, configID],
                    'AND',
                    ['isinactive', search.Operator.IS, 'F']
                ];
                let objSearch = search.load({ id: 'customsearch_efx_kiosko_customer_fields' });
                objSearch.filterExpression = filters;
                let resultsCount = objSearch.runPaged().count;
                if (resultsCount != 0) {
                    objSearch.run().each((result) => {
                        let config = result.getValue({ name: 'custrecord_efx_kiosko_fc_config' });
                        let id = result.getValue({ name: 'custrecord_efx_kiosko_fc_id_field', join: 'custrecord_efx_kiosko_fc_field' });
                        let label = result.getText({ name: 'custrecord_efx_kiosko_fc_field' });
                        let is_disabled = result.getValue({ name: 'custrecord_efx_kiosko_fc_is_disabled' });
                        let is_required = result.getValue({ name: 'custrecord_efx_kiosko_fc_is_req' });
                        let default_value = result.getValue({ name: 'custrecord_efx_kiosko_fc_default_val' })

                        if (!res.data.hasOwnProperty(config)) {
                            res.data[config] = {};
                            if (!res.data[config].hasOwnProperty(id)) {
                                res.data[config][id] = {};
                                res.data[config][id] = {
                                    label: label,
                                    id: id,
                                    disabled: is_disabled,
                                    required: is_required,
                                    default: default_value
                                };
                            } else {
                                res.data[config][id] = {
                                    label: label,
                                    id: id,
                                    disabled: is_disabled,
                                    required: is_required,
                                    default: default_value
                                };
                            }
                        } else {
                            if (!res.data[config].hasOwnProperty(id)) {
                                res.data[config][id] = {};
                                res.data[config][id] = {
                                    label: label,
                                    id: id,
                                    disabled: is_disabled,
                                    required: is_required,
                                    default: default_value
                                };
                            } else {
                                res.data[config][id] = {
                                    label: label,
                                    id: id,
                                    disabled: is_disabled,
                                    required: is_required,
                                    default: default_value
                                };
                            }
                        }
                        return true;
                    });
                    res.success = true;
                } else {
                    res.success = false;
                    res.details = 'No se encontraron configuraciones para el formulario de cliente'
                }
            } catch (err) {
                res.success = false;
                res.details = 'Ocurrió un error al consultar la información del formulario'
            }
            return res
        }

        /**
         * Obtención de la URL completa del logo
         * @param fileID
         * @returns {string}
         */
        const getLogoURL = (fileID) => {
            try {
                let fileObj = file.load({ id: fileID });
                let logoURL = fileObj.url
                let scheme = 'https://';
                let host = url.resolveDomain({
                    hostType: url.HostType.APPLICATION
                });

                return scheme + host + logoURL
            } catch (e) {
                log.error({ title: 'Error on getLogoURL', details: e });
            }
        }

        /**
         * Toma una ID de archivo y devuelve la URL del archivo
         * @param fil - El ID interno del archivo del que desea obtener la URL.
         * @returns La URL del archivo CSS.
         */
        const getCSSURL = (fil) => {
            try {
                if (!fil) {
                    return "";
                } else {
                    let fileObj = file.load({ id: fil });
                    let cssURL = fileObj.url
                    let scheme = 'https://';
                    let host = url.resolveDomain({
                        hostType: url.HostType.APPLICATION
                    });
                    return scheme + host + cssURL
                }
            } catch (e) {
                log.error({ title: 'Error on getCssUrl', details: e });
            }
        }

        /**
         * Obtención de país y estados para dirección
         * @returns {{}}
         */
        const getCountries = () => {
            try {
                let data = {};
                let stateSearchObj = search.create({
                    type: "state",
                    filters: [],
                    columns: [
                        search.createColumn({
                            name: "id"
                        }),
                        search.createColumn({ name: "fullname" }),
                        search.createColumn({ name: "shortname" }),
                        search.createColumn({ name: "country", sort: search.Sort.ASC }),
                        search.createColumn({ name: "inactive" }),
                    ]
                });
                let searchResultCount = stateSearchObj.runPaged().count;
                if (searchResultCount > 0) {
                    data.success = true;
                    data.results = {}
                    stateSearchObj.run().each(function (result) {
                        let id = result.getValue({ name: 'id' });
                        let name = result.getValue({ name: 'fullname' });
                        let value = result.getValue({ name: 'shortname' });
                        let country = result.getText({ name: "country", sort: search.Sort.ASC });
                        let country_val = result.getValue({ name: "country", sort: search.Sort.ASC });
                        let inactive = result.getValue({ name: 'inactive' });
                        if (data.results.hasOwnProperty(country_val)) {
                            data.results[country_val].states.push({
                                id: id,
                                name: name,
                                value: value
                            });
                        } else {
                            data.results[country_val] = {
                                name: country,
                                value: country_val,
                                states: []
                            };
                            data.results[country_val].states.push({
                                id: id,
                                name: name,
                                value: value
                            })
                        }
                        return true;
                    });
                }
                return data;
            } catch (reason) {
                log.error({ title: 'Error on getCountries', details: reason });
                data.success = false;
                data.details = reason.message;
                return
            }
        }

        /**
         * Obtiene la información de facturación de la base de datos y la devuelve como un objeto JSON
         * @returns Un objeto con las siguientes propiedades:
         * - éxito: booleano
         * - resultados: objeto
         * - detalles: cadena
         */
        const getBillingInformation = () => {
            let data = {
                success: false
            };
            try {
                let cfdiUsage = get_CFDI_Usage();
                let paymtTerm = get_Paymt_Term();
                let paymtMethod = get_Paymt_Method();
                let industry_type = get_sat_industry_type();
                if (cfdiUsage.length && paymtTerm.length && paymtMethod.length && industry_type.length) {
                    data.success = true;
                    data['results'] = {};
                    data['results'].uso_cfdi = cfdiUsage;
                    data['results'].paymt_term = paymtTerm;
                    data['results'].paymt_method = paymtMethod;
                    data['results'].industry_type = industry_type;
                } else {
                    data.success = false;
                    data.details = 'Ha ocurrido un error al consultar la información'
                }
                return data
            } catch (e) {
                data.success = false;
                data.details = e.message;
                return data;
            }
        }

        /**
         * Devuelve una matriz de objetos con la identificación interna y el nombre del registro
         * personalizado
         * @returns Una matriz de objetos.
         */
        const get_CFDI_Usage = () => {
            let data = []
            try {
                let cfdi_usage = search.create({
                    type: 'customrecord_efx_kiosko_cfdi_usage',
                    columns: [
                        { name: 'internalid', sort: search.Sort.ASC },
                        { name: 'name' },
                        { name: 'custrecord_efx_kiosko_cfdi_usage_id' }
                    ],
                    filters: [
                        ['isinactive', search.Operator.IS, 'F']
                    ]
                });
                let countCFDI = cfdi_usage.runPaged().count;
                if (countCFDI > 0) {
                    cfdi_usage.run().each((result) => {
                        data.push({ id: result.getValue({ name: 'custrecord_efx_kiosko_cfdi_usage_id' }), value: result.getValue({ name: 'name' }) });
                        return true;
                    });
                }
                return data;
            } catch (e) {
                log.error({ title: 'Error on get cfdi usage', details: e });
            }
        }

        /**
         * Devuelve una matriz de objetos que contienen la identificación interna y el nombre de todos
         * los términos de pago activos
         * @returns Una matriz de objetos.
         */
        const get_Paymt_Term = () => {
            let data = [];
            try {
                let paymt_term = search.create({
                    type: 'customrecord_efx_kiosko_paymt_term',
                    columns: [
                        { name: 'internalid', sort: search.Sort.ASC },
                        { name: 'name' },
                        { name: 'custrecord_efx_kiosko_paymt_term_id' }
                    ],
                    filters: [['isinactive', search.Operator.IS, 'F']]
                });
                let count_paymt_term = paymt_term.runPaged().count;
                if (count_paymt_term > 0) {
                    paymt_term.run().each((result) => {
                        data.push({ id: result.getValue({ name: 'custrecord_efx_kiosko_paymt_term_id' }), value: result.getValue({ name: 'name' }) });
                        return true;
                    });
                }
                return data;
            } catch (e) {
                log.error({ title: 'Error on get payment term', details: e.message });
            }
        }

        /**
         * Crea una búsqueda del registro personalizado, luego ejecuta la búsqueda y envía los
         * resultados a una matriz
         * @returns Una matriz de objetos.
         */
        const get_Paymt_Method = () => {
            let data = [];
            try {
                let paymt_meth = search.create({
                    type: 'customrecord_efx_kiosko_paymt_meth',
                    columns: [
                        { name: 'internalid', sort: search.Sort.ASC },
                        { name: 'name' },
                        { name: 'custrecord_efx_kiosko_paymt_meth_id' }
                    ],
                    filters: [['isinactive', search.Operator.IS, 'F']]
                });
                let count_paymt_meth = paymt_meth.runPaged().count;
                if (count_paymt_meth > 0) {
                    paymt_meth.run().each((result) => {
                        data.push({ id: result.getValue({ name: 'custrecord_efx_kiosko_paymt_meth_id' }), value: result.getValue({ name: 'name' }) });
                        return true;
                    });
                }
                return data;
            } catch (e) {
                log.error({ title: 'Error on get payment method', details: e.message });
            }
        }

        /**
         * Devuelve una matriz de objetos con el internalid y el nombre de todos los registros en el
         * registro personalizado "MX SAT Industry Type" que no están inactivos
         * @returns Una matriz de objetos con el internalid y el nombre del registro personalizado.
         */
        const get_sat_industry_type = () => {
            let data = [];
            try {
                let objSearch = search.create({
                    type: "customrecord_mx_sat_industry_type",
                    filters: [
                        ['isinactive', search.Operator.IS, 'F'],
                        "AND",
						["language",search.Operator.ANYOF,"es_ES"]
                    ],
                    columns: [
                        { name: 'internalid' },
                        { name: 'displaynametranslated' }
                    ]
                });
                let countResults = objSearch.runPaged().count;
                if (countResults > 0) {
                    objSearch.run().each(result => {
                        data.push({ id: result.getValue({ name: 'internalid' }), value: result.getValue({ name: 'displaynametranslated' }) });
                        return true
                    })
                }
                return data;
            } catch (err) {
                log.error({title: 'Error on get sat industry type', details: err });
            }
        }
        
        return { onRequest }

    });
