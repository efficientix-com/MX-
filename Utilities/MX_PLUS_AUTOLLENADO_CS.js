/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(["N/log", "N/record", "N/search", "N/currentRecord", 'N/ui/message'], /**
 * @param{log} log
 * @param{record} record
 * @param{search} search
 */ function (log, record, search, currentRecord, message) {
    /**
     * Function to be executed after page is initialized.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
     *
     * @since 2015.2
     */
    var msg_edoc, msg_cfdi, msg_pform, msg_pmethod;
    msg_edoc = message.create({
      title: "MX+ | Configuración de cliente incompleta (Documento Electrónico)",
      message: "Favor de configurar en cliente el método de envío de documento electrónico y la plantilla de documento electrónico. En caso contrario, no se llenará en automático dicha información para esta transacción y deberá ser manual.",
      type: message.Type.INFORMATION
    });
    msg_cfdi = message.create({
      title: "MX+ | Configuración de cliente incompleta (Uso de CFDI)",
      message: "Favor de configurar en cliente el Uso de CFDI. En caso contrario, no se llenará en automático dicha información para esta transacción y deberá ser manual.",
      type: message.Type.INFORMATION
    });
    msg_pform = message.create({
      title: "MX+ | Configuración de cliente incompleta (Forma de Pago)",
      message: "Favor de configurar en cliente la Forma de Pago. En caso contrario, no se llenará en automático dicha información para esta transacción y deberá ser manual.",
      type: message.Type.INFORMATION
    });
    msg_pmethod = message.create({
      title: "MX+ | Configuración de cliente incompleta (Método de Pago)",
      message: "Favor de configurar en cliente el Método de Pago. En caso contrario, no se llenará en automático dicha información para esta transacción y deberá ser manual.",
      type: message.Type.INFORMATION
    });


    function pageInit(scriptContext) {
      try {
        var curr_record = currentRecord.get();
        var is_uuid_empty = curr_record.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });

        console.log("pageInit triggered");
        if ((scriptContext.mode === "copy" || scriptContext.mode === "edit" || scriptContext.mode === "create") && is_uuid_empty === '') {
          var setters_result = {
            template_and_package: false,
            cfdi_usage: false,
            payment_method: false,
            payment_form: false,
          };
          var type_record = "";
          switch (curr_record.type) {
            case "invoice":
              type_record = "invoice";
              break;
            case "customerpayment":
              type_record = "payment";
              break;
            case "creditmemo":
              type_record = "credit";
              break;
          }
          log.audit({
            title: "curr_record.type -pageinit-",
            details: curr_record.type,
          });
          var clientId = '';
          if (type_record == "payment") {

            clientId = curr_record.getValue({
              fieldId: "customer",
            });
          } else {
            clientId = curr_record.getValue({
              fieldId: "entity",
            });

          }
          if (clientId) {
            var objRecord_client = record.load({
              type: record.Type.CUSTOMER,
              id: clientId,
            });
            // datos que obtiene del cliente
            var client_edoc_package = objRecord_client.getValue({
              fieldId: "custentity_psg_ei_entity_edoc_standard",
            });
            var client_edoc_package_text = objRecord_client.getText({
              fieldId: "custentity_psg_ei_entity_edoc_standard",
            });
            var client_cfdi_usage = objRecord_client.getValue({
              fieldId: "custentity_efx_mx_cfdi_usage",
            });
            var client_payment_method = objRecord_client.getValue({
              fieldId: "custentity_efx_mx_payment_method",
            });
            var client_payment_term = objRecord_client.getValue({
              fieldId: "custentity_efx_mx_payment_term",
            });
            console.log(client_edoc_package_text);
            console.log(client_edoc_package_text);
            console.log({ client_cfdi_usage });
            console.log({ client_payment_method });
            console.log({ client_payment_term });
            log.audit({
              title: "client_edoc_package_text",
              details: client_edoc_package_text,
            });
            // Inicia funciones que setean campos de Sat Payment Method, CFDI Usage, SAT Payment Form/Term y validaciones de que Cliente tenga esta informacion configurada
            setters_result.template_and_package = set_profactPackageAndTemplate(
              curr_record,
              client_edoc_package,
              type_record
            );
            setters_result.cfdi_usage = set_cfdiUsage(
              curr_record,
              client_cfdi_usage
            );
            setters_result.payment_form = set_paymentForm(curr_record, client_payment_term);
            setters_result.payment_method = set_paymentMethod(curr_record, client_payment_method);
            // Mensajes de advertencia de informacion que no se pudo setear
            if (!setters_result.template_and_package) {

              msg_edoc.show();
            }
            if (!setters_result.cfdi_usage) {

              msg_cfdi.show();
            }
            if (!setters_result.payment_form) {

              msg_pform.show();
            }
            if (!setters_result.payment_method) {

              msg_pmethod.show();
            }
          } else {
            console.error("No client ID detected")
          }

        }

        console.log(setters_result);
        console.log("ScriptContext.mode", scriptContext.mode);
      } catch (err) {
        log.error({ title: "Error occurred in pageInit", details: err });
        console.error("Error occurred in pageInit", err);
      }
    }
    function set_paymentMethod(curr_record, client_payment_method) {
      try {
        if (curr_record && client_payment_method) {
          if (curr_record.type === 'customerpayment') {
            // Set payment method to "Transferencias electronicas"
            // Hardcodeado porque es una lista bloqueada de Mexico localization
            curr_record.setValue({
              fieldId: 'custbody_mx_txn_sat_payment_method',
              value: 3
            });
            
          } else {
            curr_record.setValue({
              fieldId: 'custbody_mx_txn_sat_payment_method',
              value: client_payment_method
            });
          }
          return true
        } else {
          return false;
        }
      } catch (err) {
        console.error('Error occurred in set_paymentMethod', err);
        return false
      }
    }
    function set_paymentForm(curr_record, client_payment_term) {
      try {
        if (client_payment_term && curr_record) {
          if (curr_record.type === 'customerpayment') {
            // Si es pago entonces poner forma de pago a 3 (PUE) por ser lista bloqueada
            curr_record.setValue({
              fieldId: 'custbody_mx_txn_sat_payment_term',
              value: 3
            });

          } else {
            curr_record.setValue({
              fieldId: 'custbody_mx_txn_sat_payment_term',
              value: client_payment_term
            });
          }
          return true
        } else {
          return false
        }
      } catch (err) {
        console.error('Error occurred in set_paymentForm', err);
      }
    }
    function set_cfdiUsage(curr_record, client_cfdi_usage) {
      try {
        if (client_cfdi_usage && curr_record) {
          curr_record.setValue({
            fieldId: "custbody_mx_cfdi_usage",
            value: client_cfdi_usage,
          });

          return true;
        } else {
          return false;
        }
      } catch (err) {
        console.error("Error occurred in set_cfdiUsage", err);
        return false;
      }
    }

    /**
     * Function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @since 2015.2
     */
    function search_sendingMethod(client_edoc_package) {
      var data_to_return = {};
      try {
        const customrecordEiSendingMethodSearchFilters = [
          [
            "custrecord_psg_ei_edoc_standard",
            search.Operator.ANYOF,
            client_edoc_package,

          ],
          "AND",
          ['isinactive', search.Operator.IS, "F"],
          "AND",
          ['custrecord_ei_sending_method_for_certifi', search.Operator.IS, "T"]
        ];

        const customrecordEiSendingMethodSearchColName = search.createColumn({
          name: "name",
          sort: search.Sort.ASC,
        });
        const customrecordEiSendingMethodSearchColEDocumentPackage =
          search.createColumn({ name: "custrecord_psg_ei_edoc_standard" });
        const customrecordEiSendingMethodSearchColSubsidiary =
          search.createColumn({ name: "custrecord_psg_ei_sm_subsidiary" });
        const customrecordEiSendingMethodSearchColSendingMethodForCertification =
          search.createColumn({
            name: "custrecord_ei_sending_method_for_certifi",
          });
        const idSendingMethodForCertification =
          search.createColumn({
            name: "internalid",
          });

        const customrecordEiSendingMethodSearch = search.create({
          type: "customrecord_ei_sending_method",
          filters: customrecordEiSendingMethodSearchFilters,
          columns: [
            customrecordEiSendingMethodSearchColName,
            customrecordEiSendingMethodSearchColEDocumentPackage,
            customrecordEiSendingMethodSearchColSubsidiary,
            customrecordEiSendingMethodSearchColSendingMethodForCertification,
            idSendingMethodForCertification
          ],
        });

        const customrecordEiSendingMethodSearchPagedData =
          customrecordEiSendingMethodSearch.runPaged({ pageSize: 1000 });
        for (
          let i = 0;
          i < customrecordEiSendingMethodSearchPagedData.pageRanges.length;
          i++
        ) {
          const customrecordEiSendingMethodSearchPage =
            customrecordEiSendingMethodSearchPagedData.fetch({ index: i });
          customrecordEiSendingMethodSearchPage.data.forEach((result) => {
            const name = result.getValue(
              customrecordEiSendingMethodSearchColName
            );
            const eDocumentPackage = result.getValue(
              customrecordEiSendingMethodSearchColEDocumentPackage
            );
            const subsidiary = result.getValue(
              customrecordEiSendingMethodSearchColSubsidiary
            );
            const sendingMethodForCertification = result.getValue(
              customrecordEiSendingMethodSearchColSendingMethodForCertification
            );
            const idMethodForCertification = result.getValue(
              idSendingMethodForCertification
            );
            data_to_return = {
              name,
              eDocumentPackage,
              subsidiary,
              sendingMethodForCertification,
              idMethodForCertification
            };
          });
        }
        return data_to_return;
      } catch (err) {
        console.error("Error occurred in search_sendingMethod", err);
        return data_to_return;
      }
    }
    function set_profactPackageAndTemplate(
      curr_record,
      client_edoc_package,
      record_type
    ) {
      try {
        if (client_edoc_package !== '') {
          var srch_results = {};
          log.audit({ title: "curr_record", details: curr_record });
          log.audit({ title: "client_edoc_package", details: client_edoc_package });
          console.log({ client_edoc_package })
          var sending_method_client = search_sendingMethod(client_edoc_package);
          console.log({ sending_method_client });
          log.debug({
            title: "sending_method_client",
            details: sending_method_client,
          });
          if (sending_method_client) {
            const customrecordPsgEiTemplateSearchFilters = [
              ["name", "haskeywords", "4.0"],
              "AND",
              ["name", "haskeywords", record_type],
              "AND",
              [
                "custrecord_psg_ei_template_edoc_standard",
                search.Operator.ANYOF,
                sending_method_client.name,
              ],
            ];

            const customrecordPsgEiTemplateSearchColName = search.createColumn({
              name: "name",
              sort: search.Sort.ASC,
            });
            const customrecordPsgEiTemplateSearchColIdDeScript =
              search.createColumn({
                name: "scriptid",
              });
            const customrecordPsgEiTemplateSearchColPaqueteDeDocumentosElectrnicos =
              search.createColumn({
                name: "custrecord_psg_ei_template_edoc_standard",
              });
            const customrecordPsgEiTemplateSearchColTipoDeContenido =
              search.createColumn({ name: "custrecord_psg_file_content_type" });
            const customrecordPsgEiTemplateSearchColSubsidiaria =
              search.createColumn({
                name: "custrecord_psg_ei_template_subsidiary",
              });
            const customrecordPsgEiTemplateSearchColInternalId = search.createColumn({ name: 'internalid' });


            const customrecordPsgEiTemplateSearch = search.create({
              type: "customrecord_psg_ei_template",
              filters: customrecordPsgEiTemplateSearchFilters,
              columns: [
                customrecordPsgEiTemplateSearchColName,
                customrecordPsgEiTemplateSearchColIdDeScript,
                customrecordPsgEiTemplateSearchColPaqueteDeDocumentosElectrnicos,
                customrecordPsgEiTemplateSearchColTipoDeContenido,
                customrecordPsgEiTemplateSearchColSubsidiaria,
                customrecordPsgEiTemplateSearchColInternalId,

              ],
            });

            const customrecordPsgEiTemplateSearchPagedData =
              customrecordPsgEiTemplateSearch.runPaged({ pageSize: 1000 });
            for (
              var i = 0;
              i < customrecordPsgEiTemplateSearchPagedData.pageRanges.length;
              i++
            ) {
              const customrecordPsgEiTemplateSearchPage =
                customrecordPsgEiTemplateSearchPagedData.fetch({ index: i });
              customrecordPsgEiTemplateSearchPage.data.forEach((result) => {
                const name = result.getValue(
                  customrecordPsgEiTemplateSearchColName
                );
                const idDeScript = result.getValue(
                  customrecordPsgEiTemplateSearchColIdDeScript
                );
                const paqueteDeDocumentosElectrnicos = result.getValue(
                  customrecordPsgEiTemplateSearchColPaqueteDeDocumentosElectrnicos
                );
                const tipoDeContenido = result.getValue(
                  customrecordPsgEiTemplateSearchColTipoDeContenido
                );
                const subsidiaria = result.getValue(
                  customrecordPsgEiTemplateSearchColSubsidiaria
                );
                const internalId = result.getValue(customrecordPsgEiTemplateSearchColInternalId);

                srch_results = {
                  name,
                  paqueteDeDocumentosElectrnicos,
                  subsidiaria,
                  internalId
                };
              });
            }
            console.log({ srch_results });
            var actual_sendingmethod = curr_record.getValue({
              fieldId: "custbody_psg_ei_sending_method"
            });
            console.log({ actual_sendingmethod })

            try {
              curr_record.setValue({
                fieldId: "custbody_psg_ei_template",
                value: parseInt(srch_results.internalId),
              });
              curr_record.setValue({
                fieldId: "custbody_psg_ei_sending_method",
                value: parseInt(sending_method_client.idMethodForCertification),
                ignoreFieldChange: true,

              });
              var after_sendingmethod2 = curr_record.getValue({
                fieldId: "custbody_psg_ei_sending_method"
              });
              console.log({ after_sendingmethod2 })
              var after_template = curr_record.getValue({
                fieldId: "custbody_psg_ei_template"
              });
              console.log({ after_template })

            } catch (errstr) {
              console.warning("error in setting fields:", errstr)
            }

            log.audit({ title: "srch_results", details: srch_results });
          } else {
            console.error("No se encontró sending Method de cliente");
          }

          return true;
        } else {
          return false
        }

      } catch (error) {
        log.error({
          title: "error occurred in set_profactPackageAndTemplate",
          details: error,
        });
        return false;
      }
    }
    function fieldChanged(scriptContext) {
      //   alert("Inicia cambio de campo");
      var curr_record = currentRecord.get();
      var is_uuid_empty = curr_record.getValue({ fieldId: 'custbody_mx_cfdi_uuid' });
      if ((scriptContext.fieldId === "entity" || scriptContext.fieldId === "customer") && is_uuid_empty === '') {
        // var customer = curr_record.getValue({
        //   fieldId: "entity",
        // });
        // console.log('entity in fieldChanged:', customer);
        // console.log({ customer });


        var setters_result = {
          template_and_package: false,
          cfdi_usage: false,
          payment_method: false,
          payment_form: false
        };
        var type_record = "";
        switch (curr_record.type) {
          case "invoice":
            type_record = "invoice";
            break;
          case "customerpayment":
            type_record = "payment";
            break;
          case "creditmemo":
            type_record = "credit";
            break;
        }
        log.audit({ title: "curr_record.type", details: curr_record.type });
        var clientId = '';
        if (type_record == "payment") {

          clientId = curr_record.getValue({
            fieldId: "customer",
          });
        } else {
          // Este es el campo de cliente en factura de venta y nota de crédito
          clientId = curr_record.getValue({
            fieldId: "entity",
          });

        }
        var objRecord_client = record.load({
          type: record.Type.CUSTOMER,
          id: clientId,
        });
        // Datos que obtiene del cliente
        var client_cfdi_usage = objRecord_client.getValue({
          fieldId: "custentity_efx_mx_cfdi_usage",
        });
        var client_payment_method = objRecord_client.getValue({
          fieldId: "custentity_efx_mx_payment_method",
        });
        var client_payment_term = objRecord_client.getValue({
          fieldId: "custentity_efx_mx_payment_term",
        });
        var client_edoc_package = objRecord_client.getValue({
          fieldId: "custentity_psg_ei_entity_edoc_standard",
        });
        var client_edoc_package_text = objRecord_client.getText({
          fieldId: "custentity_psg_ei_entity_edoc_standard",
        });
        console.log(client_edoc_package_text);
        console.log({ client_cfdi_usage });
        console.log({ client_payment_method });
        console.log({ client_payment_term });
        log.audit({
          title: "client_edoc_package_text",
          details: client_edoc_package_text,
        });
        // Inicia funciones que setean campos de Sat Payment Method, CFDI Usage, SAT Payment Form/Term y validaciones de que Cliente tenga esta informacion configurada
        setters_result.template_and_package = set_profactPackageAndTemplate(
          curr_record,
          client_edoc_package,
          type_record
        );
        setters_result.cfdi_usage = set_cfdiUsage(
          curr_record,
          client_cfdi_usage
        );
        setters_result.payment_form = set_paymentForm(curr_record, client_payment_term);
        setters_result.payment_method = set_paymentMethod(curr_record, client_payment_method);
        // Mensajes de advertencia de informacion que no se pudo setear

        msg_edoc.hide();
        msg_cfdi.hide();
        msg_pform.hide();
        msg_pmethod.hide();
        if (setters_result.template_and_package == false) {

          msg_edoc.show();
        } else {
          msg_edoc.hide();
        }
        if (setters_result.cfdi_usage == false) {

          msg_cfdi.show();
        } else {
          msg_cfdi.hide();
        }
        if (setters_result.payment_form == false) {

          msg_pform.show();
        } else {
          msg_pform.hide();
        }
        if (setters_result.payment_method == false) {

          msg_pmethod.show();
        } else {
          msg_pmethod.hide();
        }
        console.log("setters_result -fieldchanged-", setters_result);

        return true;
      }
    }

    /**
     * Function to be executed when field is slaved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     *
     * @since 2015.2
     */
    function postSourcing(scriptContext) {


    }

    /**
     * Function to be executed after sublist is inserted, removed, or edited.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function sublistChanged(scriptContext) { }

    /**
     * Function to be executed after line is selected.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @since 2015.2
     */
    function lineInit(scriptContext) { }

    /**
     * Validation function to be executed when field is changed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     * @param {string} scriptContext.fieldId - Field name
     * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
     * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
     *
     * @returns {boolean} Return true if field is valid
     *
     * @since 2015.2
     */
    function validateField(scriptContext) { }

    /**
     * Validation function to be executed when sublist line is committed.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateLine(scriptContext) { }

    /**
     * Validation function to be executed when sublist line is inserted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateInsert(scriptContext) { }

    /**
     * Validation function to be executed when record is deleted.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @param {string} scriptContext.sublistId - Sublist name
     *
     * @returns {boolean} Return true if sublist line is valid
     *
     * @since 2015.2
     */
    function validateDelete(scriptContext) { }

    /**
     * Validation function to be executed when record is saved.
     *
     * @param {Object} scriptContext
     * @param {Record} scriptContext.currentRecord - Current form record
     * @returns {boolean} Return true if record is valid
     *
     * @since 2015.2
     */
    function saveRecord(scriptContext) { }

    return {
      pageInit: pageInit,
      fieldChanged: fieldChanged,
      // postSourcing: postSourcing,
      // sublistChanged: sublistChanged,
      // lineInit: lineInit,
      // validateField: validateField,
      // validateLine: validateLine,
      // validateInsert: validateInsert,
      // validateDelete: validateDelete,
      // saveRecord: saveRecord,
    };
  });
