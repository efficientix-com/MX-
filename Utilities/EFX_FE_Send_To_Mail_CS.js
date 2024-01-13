/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([
  "N/http",
  "N/https",
  "N/record",
  "N/url",
  "N/ui/message",
  "N/search",
  "N/runtime",
], /**
 * @param{http} http
 * @param{https} https
 * @param{record} record
 */
function (http, https, record, url, mensajes, search, runtime) {
  /**
   * Function to be executed after page is initialized.
   *
   * @param {Object} scriptContext
   * @param {Record} scriptContext.currentRecord - Current form record
   * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
   *
   * @since 2015.2
   */

  var enEjecucion = false;
  function pageInit(scriptContext) {}

  function sendToMail(tranData) {
    var myMsg_create = mensajes.create({
      title: "Envio de Documentos Electrónicos",
      message: "Sus documentos se están enviando por correo...",
      type: mensajes.Type.INFORMATION,
    });
    myMsg_create.show();
    var tranid = tranData.tranid || "";
    var trantype = tranData.trantype || "";

    var url_Script = url.resolveScript({
      scriptId: "customscript_efx_fe_mail_sender_sl",
      deploymentId: "customdeploy_efx_fe_mail_sender_sl",
      params: {
        trantype: trantype,
        tranid: tranid,
      },
    });

    var headers = {
      "Content-Type": "application/json",
    };

    https.request
      .promise({
        method: https.Method.GET,
        url: url_Script,
        headers: headers,
      })
      .then(function (response) {
        log.debug({
          title: "Response",
          details: response,
        });

        if (response.code == 200) {
          myMsg_create.hide();
          var myMsg = mensajes.create({
            title: "Envio de Documentos Electrónicos",
            message: "Sus documentos se han enviado por correo electrónico...",
            type: mensajes.Type.CONFIRMATION,
          });
          myMsg.show({ duration: 5500 });

          console.log("respuesta");

          location.reload();
        } else if (response.code == 500) {
          myMsg_create.hide();
          var myMsg = mensajes.create({
            title: "Envio de Documentos Electrónicos",
            message: "Ocurrio un error, verifique su conexión.",
            type: mensajes.Type.ERROR,
          });
          myMsg.show();
        } else {
          myMsg_create.hide();
          var myMsg = mensajes.create({
            title: "Envio de Documentos Electrónicos",
            message: "Ocurrio un error, verifique si sus datos de correo",
            type: mensajes.Type.ERROR,
          });
          myMsg.show();
        }
      })
      .catch(function onRejected(reason) {
        log.debug({
          title: "Invalid Request: ",
          details: reason,
        });
      });
  }

  function regeneraPDF(tranData) {
    var myMsg_create = mensajes.create({
      title: "Regenerar PDF",
      message: "Se está generando el PDF desde su XML Certificado...",
      type: mensajes.Type.INFORMATION,
    });
    myMsg_create.show();
    var tranid = tranData.tranid || "";
    var trantype = tranData.trantype || "";
    console.log("tranid en regeneraPDF",tranid)
    console.log("tranid en regeneraPDF",trantype)

    var url_Script = url.resolveScript({
      scriptId: "customscript_efx_fe_cfdi_genera_pdf_sl",
      deploymentId: "customdeploy_efx_fe_cfdi_genera_pdf_sl",
      params: {
        trantype: trantype,
        tranid: tranid,
      },
    });

    var headers = {
      "Content-Type": "application/json",
    };

    https.request
      .promise({
        method: https.Method.GET,
        url: url_Script,
        headers: headers,
      })
      .then(function (response) {
        log.debug({
          title: "Response",
          details: response,
        });

        if (response.code == 200) {
          console.log("respuestabody: ", response.body);
          var bodyrespuesta = JSON.parse(response.body);
          if (bodyrespuesta) {
            console.log("idpdf: ", bodyrespuesta.idPdf);
            if (bodyrespuesta.idPdf) {
              myMsg_create.hide();
              var myMsg = mensajes.create({
                title: "Regenerar PDF",
                message: "Se ha generado su archivo pdf...",
                type: mensajes.Type.CONFIRMATION,
              });
              myMsg.show({ duration: 5500 });

              console.log("respuesta");
                location.reload();
              
            } else {
              myMsg_create.hide();
              var myMsg = mensajes.create({
                title: "Regenerar PDF",
                message:
                  "No se pudo generar su pdf, valide la configuración...",
                type: mensajes.Type.ERROR,
              });
              myMsg.show({ duration: 5500 });

              console.log("respuesta");
              
                location.reload();
              
            }
          }
        } else if (response.code == 500) {
          myMsg_create.hide();
          var myMsg = mensajes.create({
            title: "Regenerar PDF",
            message: "Ocurrio un error, verifique su conexión.",
            type: mensajes.Type.ERROR,
          });
          myMsg.show();
        } else {
          myMsg_create.hide();
          var myMsg = mensajes.create({
            title: "Regenerar PDF",
            message:
              "Ocurrio un error, verifique si el xml timbrado es correcto",
            type: mensajes.Type.ERROR,
          });
          myMsg.show();
        }
      })
      .catch(function onRejected(reason) {
        log.debug({
          title: "Invalid Request: ",
          details: reason,
        });
      });
  }
  function generaPDF(tranData) {
    var myMsg_create = mensajes.create({
      title: "Generar PDF",
      message: "Se está generando el PDF desde su XML Certificado...",
      type: mensajes.Type.INFORMATION,
    });
    myMsg_create.show();
    var tranid = tranData.tranid || "";
    var trantype = tranData.trantype || "";
    console.log("tranid en generaPDF",tranid)
    console.log("tranid en generaPDF",trantype)

    var url_Script = url.resolveScript({
      scriptId: "customscript_efx_fe_cfdi_genera_pdf_sl",
      deploymentId: "customdeploy_efx_fe_cfdi_genera_pdf_sl",
      params: {
        trantype: trantype,
        tranid: tranid,
      },
    });

    var headers = {
      "Content-Type": "application/json",
    };

    https.request
      .promise({
        method: https.Method.GET,
        url: url_Script,
        headers: headers,
      })
      .then(function (response) {
        log.debug({
          title: "Response",
          details: response,
        });

        if (response.code == 200) {
          console.log("respuestabody: ", response.body);
          var bodyrespuesta = JSON.parse(response.body);
          if (bodyrespuesta) {
            console.log("idpdf: ", bodyrespuesta.idPdf);
            if (bodyrespuesta.idPdf) {
              myMsg_create.hide();
              var myMsg = mensajes.create({
                title: "Generar PDF",
                message: "Se ha generado su archivo pdf...",
                type: mensajes.Type.CONFIRMATION,
              });
              myMsg.show({ duration: 5500 });

              console.log("respuesta");
              location.reload();
            } else {
              myMsg_create.hide();
              var myMsg = mensajes.create({
                title: "Generar PDF",
                message:
                  "No se pudo generar su pdf, valide la configuración...",
                type: mensajes.Type.ERROR,
              });
              myMsg.show({ duration: 5500 });

              console.log("respuesta");
              
              
            }
          }
        } else if (response.code == 500) {
          myMsg_create.hide();
          var myMsg = mensajes.create({
            title: "Generar PDF",
            message: "Ocurrio un error, verifique su conexión.",
            type: mensajes.Type.ERROR,
          });
          myMsg.show();
        } else {
          myMsg_create.hide();
          var myMsg = mensajes.create({
            title: "Generar PDF",
            message:
              "Ocurrio un error, verifique si el xml timbrado es correcto",
            type: mensajes.Type.ERROR,
          });
          myMsg.show();
        }
      })
      .catch(function onRejected(reason) {
        log.debug({
          title: "Invalid Request: ",
          details: reason,
        });
      });
      return true
  }

  function generaCertifica(tranData) {
    console.log("En ejecucion", enEjecucion);
    if (enEjecucion == false) {
      enEjecucion = true;
      console.log("En ejecucion", enEjecucion);
      var envia_correo_auto = runtime
        .getCurrentScript()
        .getParameter({ name: "custscript_efx_fe_autosendmail" });
      var myMsg_create = mensajes.create({
        title: "Generación",
        message: "Se está generando su CFDI...",
        type: mensajes.Type.INFORMATION,
      });
      myMsg_create.show();

      var tranid = tranData.tranid || "";
      var trantype = tranData.trantype || "";

      //GENERAR DOCUMENTO
      var suiteletURL = url.resolveScript({
        scriptId: "customscript_ei_generation_service_su",
        deploymentId: "customdeploy_ei_generation_service_su",
        params: {
          transId: tranid,
          transType: trantype,
          //certSendingMethodId: certId*1
        },
      });
      console.log(suiteletURL);

      https.request
        .promise({
          method: https.Method.GET,
          url: suiteletURL,
        })
        .then(function (response) {
          console.log("holis");

          var body = JSON.parse(response.body);
          console.log(body);

          console.log("success ", body.success);

          if (body.success) {
            try {
              console.log("success entra ", body.success);
              myMsg_create.hide();
              var myMsg = mensajes.create({
                title: "Generación",
                message: "Se generó su documento electrónico.",
                type: mensajes.Type.CONFIRMATION,
              });
              myMsg.show({ duration: 5500 });

              console.log("respuesta");
              var myMsg_cert = mensajes.create({
                title: "Certificación",
                message: "Se está certificando su CFDI...",
                type: mensajes.Type.INFORMATION,
              });
              myMsg_cert.show();
              myMsg.hide();
            } catch (error) {
              console.log(error);
            }

            //TIMBRAR DOCUMENTO
            var suiteletURL = url.resolveScript({
              scriptId: "customscript_su_send_e_invoice",
              deploymentId: "customdeploy_su_send_e_invoice",
              params: {
                transId: tranid,
                transType: trantype,
                //certSendingMethodId: certId*1
              },
            });
            console.log(suiteletURL);

            https.request
              .promise({
                method: https.Method.GET,
                url: suiteletURL,
              })
              .then(function (response) {
                // console.log('respuesta: ', response);
                console.log("HOLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

                var body = JSON.parse(response.body);

                if (body.success) {
                  var fieldLookUp = search.lookupFields({
                    type: trantype,
                    id: tranid,
                    columns: [
                      "custbody_mx_cfdi_uuid",
                      "custbody_psg_ei_certified_edoc",
                    ],
                  });

                  var uuid_record = fieldLookUp["custbody_mx_cfdi_uuid"];
                  var xml_record =
                    fieldLookUp["custbody_psg_ei_certified_edoc"];
                  console.log("fieldLookUp: ", fieldLookUp);
                  console.log("uuid: ", uuid_record);
                  console.log("xml: ", xml_record);

                  if (uuid_record) {
                    myMsg_cert.hide();
                    var myMsg_certd = mensajes.create({
                      title: "Certificación",
                      message: "Se Certificó su documento electrónico.",
                      type: mensajes.Type.CONFIRMATION,
                    });
                    myMsg_certd.show({ duration: 5500 });
                    if (envia_correo_auto) {
                      try {
                        myMsg_certd.hide();

                        var myMsg_mail = mensajes.create({
                          title: "Envio de Correo",
                          message:
                            "Enviando documentos por correo electrónico...",
                          type: mensajes.Type.INFORMATION,
                        });
                        myMsg_mail.show();
                        myMsg_certd.hide();
                      } catch (error) {
                        console.log(error);
                      }

                      //Envio de correo
                      var suiteletURL = url.resolveScript({
                        scriptId: "customscript_efx_fe_mail_sender_sl",
                        deploymentId: "customdeploy_efx_fe_mail_sender_sl",
                        params: {
                          tranid: tranid,
                          trantype: trantype,
                        },
                      });
                      console.log(suiteletURL);

                      https.request
                        .promise({
                          method: https.Method.GET,
                          url: suiteletURL,
                        })
                        .then(function (response) {
                          log.debug({
                            title: "Response",
                            details: response,
                          });
                        })
                        .catch(function onRejected(reason) {
                          log.debug({
                            title: "Invalid Request Mail: ",
                            details: reason,
                          });
                        });
                    }
                  } else {
                    myMsg_cert.hide();
                    var myMsg = mensajes.create({
                      title: "Certificación",
                      message: "Ocurrio un error durante su certificacion",
                      type: mensajes.Type.ERROR,
                    });
                    myMsg.show();
                  }

                  console.log("respuesta");
                  location.reload();
                } else {
                  myMsg_cert.hide();
                  var myMsg = mensajes.create({
                    title: "Certificación",
                    message: "Ocurrio un error durante su certificacion",
                    type: mensajes.Type.ERROR,
                  });
                  myMsg.show();
                }
              })
              .catch(function onRejected(reason) {
                log.debug({
                  title: "Invalid Request: ",
                  details: reason,
                });
              });
          } else {
            myMsg_create.hide();
            var myMsg = mensajes.create({
              title: "Generación",
              message: "Ocurrio un error durante su generación",
              type: mensajes.Type.ERROR,
            });
            myMsg.show();
          }
        })
        .catch(function onRejected(reason) {
          log.debug({
            title: "Invalid Request: ",
            details: reason,
          });
        });
    }
  }

  async function generaCertificaGBL(tranData) {
    console.log("En ejecucion GBL", enEjecucion);
    if (enEjecucion == false) {
      enEjecucion = true;
      console.log("En ejecucion GBL", enEjecucion);
      console.log("tranData: ", tranData);
      var envia_correo_auto = runtime
        .getCurrentScript()
        .getParameter({ name: "custscript_efx_fe_autosendmail" });
      var anticipo = tranData.anticipo || false;

      if (anticipo) {
        var myMsg_create = mensajes.create({
          title: "Generación",
          message: "Se está generando y certificando su CFDI de anticipo...",
          type: mensajes.Type.INFORMATION,
        });
        myMsg_create.show();
      } else {
        var myMsg_create = mensajes.create({
          title: "Generación",
          message: "Se está generando y certificando su CFDI...",
          type: mensajes.Type.INFORMATION,
        });
        myMsg_create.show();
      }

      var tranid = tranData.tranid || "";
      var trantype = tranData.trantype || "";
      if (tranData.cliente) {
        // OBTENER DATOS NECESARIO PARA MENSAJES
        var datos_transaction = search.lookupFields({
          type: trantype,
          id: tranid,
          columns: [
            "custbody_mx_cfdi_usage",
            "custbody_mx_txn_sat_payment_method",
            "custbody_mx_txn_sat_payment_term",
            "custbody_mx_cfdi_sat_export_type",
            "custbody_psg_ei_template",
            "custbody_psg_ei_sending_method",
            "custbody_edoc_gen_trans_pdf",
          ],
        });
        /* console.log('datos_transaccion', datos_transaction);
                console.log('cliente', datos_transaction.entity[0].value); */

        var id_cliente = tranData.cliente;
        // datos en el cliente
        var datos_cliente = search.lookupFields({
          type: "customer",
          id: id_cliente,
          columns: [
            "custentity_mx_sat_registered_name",
            "custentity_mx_rfc",
            "custentity_mx_sat_industry_type",
          ],
        });
        console.log("datos_cliente", datos_cliente);

        var rfc = datos_cliente.custentity_mx_rfc;
        console.log("rfc", rfc);
        var razon_social = datos_cliente.custentity_mx_sat_registered_name;
        console.log("razon_social", razon_social);
      }

      //GENERAR DOCUMENTO

      var suiteletURL = url.resolveScript({
        scriptId: "customscript_efx_fe_xml_generator",
        deploymentId: "customdeploy_efx_fe_xml_generator",
        params: {
          tranid: tranid,
          trantype: trantype,
          //certSendingMethodId: certId*1
        },
      });
      console.log(suiteletURL);

      https.request
        .promise({
          method: https.Method.GET,
          url: suiteletURL,
        })
        .then(function (response) {
          var body = JSON.parse(response.body);
          console.log("Respuesta: ", body);
          // console.log('error_deatils', body.error_details);
          console.log("success ", body.success);
          // console.log('body.mensaje', body.mensaje);
          var mensaje_body_split = body.mensaje.split(" - ");
          console.log("mensaje_body_split", mensaje_body_split);
          var message = getMessage(mensaje_body_split[0]);
          console.log("message", message.data);
          var mensaje_a_mostrar = message.data;
          if(tranData.cliente){

              mensaje_a_mostrar = mensaje_a_mostrar.replace("${RFC}", rfc);
              mensaje_a_mostrar = mensaje_a_mostrar.replace(
                "${RAZON_SOCIAL}",
                razon_social
              );
          }
          /*mensaje_a_mostrar = mensaje_a_mostrar.replace('${LUGAR_EXPEDICION}', domi_fisc);
                        mensaje_a_mostrar = mensaje_a_mostrar.replace('${DOMICILIO_FISCAL}', domi_fisc);
                        mensaje_a_mostrar = mensaje_a_mostrar.replace('${REGIMEN_FISCAL}', reg_fisc);
                        mensaje_a_mostrar = mensaje_a_mostrar.replace('${USO_CFDI_CLIENTE}', uso_cfdi_cliente); */
          var mensaje =
            "Ocurrio un error durante su generación <br><br>" +
            mensaje_a_mostrar;
          console.log("mensaje a mostrar:", mensaje);

          if (body.success) {
            var myMsg_cert;
            try {
              console.log("success entra ", body.success);
              myMsg_create.hide();
              var myMsg = mensajes.create({
                title: "Generación",
                message: "Se generó su documento electrónico.",
                type: mensajes.Type.CONFIRMATION,
              });
              myMsg.show({ duration: 5500 });
              

              

              console.log("respuesta");
              myMsg_cert= mensajes.create({
                title: "Certificación",
                message: "Se está certificando su CFDI...",
                type: mensajes.Type.INFORMATION,
              });
              myMsg_cert.show();
              myMsg.hide();
            } catch (error) {
              console.log(error);
            }
            if (body.success) {
              var fieldLookUp = search.lookupFields({
                type: trantype,
                id: tranid,
                columns: [
                  "custbody_mx_cfdi_uuid",
                  "custbody_psg_ei_certified_edoc",
                ],
              });

              var uuid_record = fieldLookUp["custbody_mx_cfdi_uuid"];
              var xml_record = fieldLookUp["custbody_psg_ei_certified_edoc"];
              console.log("fieldLookUp: ", fieldLookUp);
              console.log("uuid: ", uuid_record);
              console.log("xml: ", xml_record);

              if (uuid_record) {
                myMsg_cert.hide();
                var myMsg_certd = mensajes.create({
                  title: "Certificación",
                  message: "Se Certificó su documento electrónico.",
                  type: mensajes.Type.CONFIRMATION,
                });
                myMsg_certd.show({ duration: 5500 });
                
                

                if (envia_correo_auto) {
                  try {
                    myMsg_certd.hide();

                    var myMsg_mail = mensajes.create({
                      title: "Envio de Correo",
                      message: "Enviando documentos por correo electrónico...",
                      type: mensajes.Type.INFORMATION,
                    });
                    myMsg_mail.show();
                    myMsg_certd.hide();
                  } catch (error) {
                    console.log(error);
                  }

                  //Envio de correo
                  var suiteletURL = url.resolveScript({
                    scriptId: "customscript_efx_fe_mail_sender_sl",
                    deploymentId: "customdeploy_efx_fe_mail_sender_sl",
                    params: {
                      tranid: tranid,
                      trantype: trantype,
                    },
                  });
                  console.log(suiteletURL);

                  https.request
                    .promise({
                      method: https.Method.GET,
                      url: suiteletURL,
                    })
                    .then(function (response) {
                      log.debug({
                        title: "Response",
                        details: response,
                      });
                    })
                    .catch(function onRejected(reason) {
                      log.debug({
                        title: "Invalid Request Mail: ",
                        details: reason,
                      });
                    });
                }

                //genera antició
                if (anticipo) {
                  myMsg_cert.hide();
                  var myMsg_anticipo = mensajes.create({
                    title: "Generación",
                    message: "Se está registrando el CFDI de anticipo...",
                    type: mensajes.Type.INFORMATION,
                  });
                  myMsg_anticipo.show({ duration: 2500 });

                  var suiteletURLAnticipo = url.resolveScript({
                    scriptId: "customscript_efx_fe_cfdi_anticipo_sl",
                    deploymentId: "customdeploy_efx_fe_cfdi_anticipo_sl",
                    params: {
                      tranid: tranid,
                      trantype: trantype,
                    },
                  });

                  console.log(suiteletURLAnticipo);

                  https.request
                    .promise({
                      method: https.Method.GET,
                      url: suiteletURLAnticipo,
                    })
                    .then(function (response) {
                      log.debug({
                        title: "Response",
                        details: response,
                      });
                    })
                    .catch(function onRejected(reason) {
                      log.debug({
                        title: "Invalid Request Mail: ",
                        details: reason,
                      });
                    });
                }
              } else {
                myMsg_cert.hide();
                var myMsg = mensajes.create({
                  title: "Certificación",
                  message: "Ocurrio un error durante su certificacion",
                  type: mensajes.Type.ERROR,
                });
                myMsg.show();
              }
              // genera PDF
              var finished_pdf_render= generaPDF(tranData);

              console.log("respuesta certificado");
              // location.reload();
            } else {
              myMsg_cert.hide();
              var myMsg = mensajes.create({
                title: "Certificación",
                message: "Ocurrio un error durante su certificacion",
                type: mensajes.Type.ERROR,
              });
              myMsg.show();
            }
          } else {
            myMsg_create.hide();
            var myMsg = mensajes.create({
              title: "Generación",
              message: mensaje,
              type: mensajes.Type.ERROR,
            });
            myMsg.show();
          }
        })
        .catch(function onRejected(reason) {
          log.debug({
            title: "Invalid Request: ",
            details: reason,
          });
        });
    }
  }

  function openSL_Anticipo(tranData) {
    var url_Script = url.resolveScript({
      scriptId: "customscript_efx_fe_antpag_sl",
      deploymentId: "customdeploy_efx_fe_antpag_sl",
    });

    url_Script += "&custparam_total=" + tranData.total;
    url_Script += "&custparam_entity=" + tranData.entity;
    url_Script += "&custparam_location=" + tranData.location;
    url_Script += "&custparam_tranid=" + tranData.tranid;
    url_Script += "&custparam_trantype=" + tranData.trantype;

    window.open(url_Script, "_blank");
  }

  function getMessage(codigo) {
    var response = {
      success: false,
      error: "",
      data: "",
    };
    try {
      var searchMessage = search.create({
        type: "customrecord_fb_tp_messages_list",
        filters: [["custrecord_fb_tp_code", search.Operator.IS, codigo]],
        columns: [
          search.createColumn({ name: "custrecord_fb_tp_code" }),
          search.createColumn({ name: "custrecord_fb_tp_message" }),
        ],
      });
      var searchResultCount = searchMessage.runPaged().count;
      if (searchResultCount > 0) {
        searchMessage.run().each(function (result) {
          response.data = result.getValue({ name: "custrecord_fb_tp_message" });
          return true;
        });
        response.success = true;
      } else {
        response.success = false;
        response.error = "No se encontraron datos";
      }
    } catch (error) {
      log.error({ title: "ERROR ongetMessage ", details: error });
      response.success = false;
      response.error = error;
    }
    return response;
  }

  return {
    pageInit: pageInit,
    sendToMail: sendToMail,
    generaCertifica: generaCertifica,
    generaCertificaGBL: generaCertificaGBL,
    regeneraPDF: regeneraPDF,
    openSL_Anticipo: openSL_Anticipo,
    getMessage: getMessage,
  };
});
