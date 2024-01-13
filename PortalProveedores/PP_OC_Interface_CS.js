/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/https', 'N/ui/message', 'N/runtime'],
    /**
     * @param{currentRecord} currentRecord
     * @param{url} url
     * @param{https} https
     * @param{message} message
     * @param{runtime} runtime
     * @returns {{applyFilters: applyFilters, sendFunction: sendFunction, fieldChanged: fieldChanged}}
     */


    function (currentRecord, url, https, message, runtime) {
        var filesObj = {};
        var area = null;
        function pageInit(scriptContext) {
            try {
                /*console.log({title: '786', details: 'lhkgv'});
                area =  document.createElement('textarea');
                area.setAttribute('id', 'fileContext')
                document.body.appendChild(area);*/

                var elements = document.getElementsByClassName("fileinpt");
                for (var i = 0; i < elements.length; i++) {
                    elements[i].addEventListener('change', getFile, false);
                }
            } catch (e) {
                console.error(e)
            }
        }


        function fieldChanged(scriptContext) {
            console.log("scriptContext", scriptContext);
        }

        function applyFilters() {
            try {
                var jsonReturn = {
                    status: currentRecord.get().getValue('custpage_select_status'),
                    numPage: currentRecord.get().getValue('custpage_number_page'),
                    docNum: currentRecord.get().getValue('custpage_number_document'),
                    startDate: currentRecord.get().getText('custpage_start_date'),
                    endDate: currentRecord.get().getText('custpage_end_start'),
                }
                // if(jsonReturn.startDate)
                //     jsonReturn.startDate = jsonReturn.startDate.getDate() + '/' + jsonReturn.startDate.getMonth() + '/' + jsonReturn.startDate.getFullYear();
                // if(jsonReturn.endDate)
                //     jsonReturn.endDate = jsonReturn.endDate.getDate() + '/' + jsonReturn.endDate.getMonth() + '/' + jsonReturn.endDate.getFullYear();
                // if(jsonReturn.startDate)
                //     jsonReturn.startDate = jsonReturn.startDate.toLocaleDateString();
                // if(jsonReturn.endDate)
                //     jsonReturn.endDate = jsonReturn.endDate.toLocaleDateString();
                // console.log('El One Piece Existe :v', jsonReturn)

                var urlOutput = url.resolveScript({
                    scriptId: 'customscript_efx_pp_ws_portal_sl',
                    deploymentId: 'customdeploy_efx_pp_ws_portal_sl',
                    params: jsonReturn
                });

                window.open(urlOutput, '_self')
            } catch (e) {
                console.error('Error in Apply Filters', e)
            }
        }

        var jsonArraySend = new Array();
        var finalJson = {};
        var countGlobal = 1;

        // function getBase64(file, docID, type, id) {
        //     console.log({file: file, docID: docID, type: type, id: id});
        //     const reader = new FileReader();
        //     reader.readAsDataURL(file);
        //     reader.onloadend = function () {
        //         var result = reader.result
        //         if (finalJson.hasOwnProperty(docID)) {
        //             switch (type) {
        //                 case 'pdf':
        //                     finalJson[docID].pdf = result;
        //                     break;
        //                 case 'xml':
        //                     finalJson[docID].xml = result;
        //                     break;
        //                 case 'img':
        //                     finalJson[docID].img = result;
        //                     var name_file = file.name;
        //                     var ext = name_file.split('.')
        //                     finalJson[docID].img_ext = ext[1];
        //                     break;
        //             }
        //         } else {
        //             finalJson[docID] = {documentnumber: docID, currentuser: runtime.getCurrentUser().id, id: id};
        //             switch (type) {
        //                 case 'pdf':
        //                     finalJson[docID].pdf = result;
        //                     break;
        //                 case 'xml':
        //                     finalJson[docID].xml = result;
        //                     break;
        //                 case 'img':
        //                     finalJson[docID].img = result;
        //                     var name_file = file.name;
        //                     var ext = name_file.split('.')
        //                     finalJson[docID].img_ext = ext[1];
        //                     break;
        //             }
        //         }
        //         jsonArraySend.push(JSON.stringify(finalJson[docID]));
        //         var a = document.getElementById('fileContext').innerHTML = JSON.stringify(jsonArraySend);
        //         console.log("onload", "base64");
        //         //    custpage_contentFiles
        //         //     var recordObj = currentRecord.get();
        //         //    recordObj.setValue({fieldId: 'custpage_contentFiles', value: JSON.stringify(jsonArraySend)});
        //     }
        // }
        //
        // function setFinalObj(objFinal) {
        //     var g = [];
        //     var localObj = objFinal;
        //     g.push(localObj);
        //     return g;
        // }

        function sendFunction(configJson) {
            try {
                console.log("configJson", configJson);
                var configPortal = configJson;
                var errorpdf='';
                var errorxml='';
                var errorev='';
                var lineaserror = '';
                console.log("filesObj", filesObj);

                var selectedLines = [];
                var selectedErrors = [];
                var recordObj = currentRecord.get();
                var numberLines = recordObj.getLineCount({sublistId: 'custpage_purchase_order'});
                var dataProc = {};
                for(var i in filesObj){
                    var checkLine = recordObj.getSublistValue({
                        sublistId: 'custpage_purchase_order',
                        fieldId: 'field_checkbox',
                        line: i
                    });
                    if (checkLine === true) {
                        console.log("filesObj[i].xml", filesObj[i].xml);
                        if (!filesObj[i].xml){

                            selectedErrors.push(i)
                            showMessage(message.Type.WARNING, 10000, 'Una linea seleccionada no cuenta con archivo XML');
                        }
                        else{
                            selectedLines.push(i);
                        }
                    }

                }
                console.log("selectedLines", selectedLines);
                console.log("selectedErrors", selectedErrors);
                if (selectedLines.length < 1) {
                    message.create({
                        type: message.Type.WARNING,
                        title: 'Advertencia',
                        message: 'Por favor selecciona una Orden de Compra para enviar'
                    }).show({duration: 5000});
                } else {

                    if (selectedErrors.length > 0) {
                        showMessage(message.Type.ERROR, null, 'Existen líneas con errores, revise los archivos cargados, el XML es obligatorio.');
                    } else {
                        for (var i = 0; i < selectedLines.length; i++) {
                            var position = selectedLines[i];
                            if(filesObj[position].pdf=='' && configPortal.mandatory_pdf){
                                errorpdf = '-El archivo PDF es requerido para poder continuar con el proceso.'

                            }
                            if(filesObj[position].img=='' && configPortal.mandatory_ev){
                                errorev = '-El archivo Evidencia es requerido para poder continuar con el proceso.'

                            }
                            if(filesObj[position].tamanio>2048){
                                errorev = '-El archivo Evidencia debe ser menor a 2MB.'

                            }
                            if(filesObj[position].xml=='' && configPortal.mandatory_xml){
                                errorxml = '-El archivo XML es requerido para poder continuar con el proceso.'

                            }
                            if(errorpdf || errorev || errorxml){
                                lineaserror = lineaserror+' '+(parseInt(position)+1);
                                continue;
                            }

                            dataProc[filesObj[position].documentnumber] = {
                                documentnumber: filesObj[position].documentnumber,
                                location: filesObj[position].location,
                                parcialidad: filesObj[position].parcialidad,
                                currentuser: filesObj[position].currentuser,
                                id: filesObj[position].id,
                                pdf: filesObj[position].pdf,
                                xml:filesObj[position].xml,
                                img:filesObj[position].img,
                                img_ext: filesObj[position].img_ext
                            };
                        }
                    }
                }
                console.log("dataProc", dataProc);
                if(!errorpdf && !errorev && !errorxml){
                    sendData(dataProc,configPortal);
                }else{
                    message.create({
                        type: message.Type.ERROR,
                        title: 'Archivos Obligatorios',
                        message: errorpdf+'. '+errorev+'. '+errorxml+'. En las lineas '+lineaserror
                    }).show({duration: 15000});
                }


            } catch (e) {
                console.error('Error in send', e)
            }
        }

        function getFile(filecontext){
            var recordObj = currentRecord.get();
            var file = filecontext.target.files[0];
            var position = filecontext.target.id.slice(-1);
            console.log("filecontext.target", position);

            if(file){
                console.log("file", file);
                var reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = function () {
                    var filebase64=reader.result;

                    var documentID = recordObj.getSublistValue({
                        sublistId: 'custpage_purchase_order',
                        fieldId: 'field_id',
                        line: position
                    });

                    var locationID = recordObj.getSublistValue({
                        sublistId: 'custpage_purchase_order',
                        fieldId: 'field_location',
                        line: position
                    });
                    var parcialidad = recordObj.getSublistValue({
                        sublistId: 'custpage_purchase_order',
                        fieldId: 'field_parcial',
                        line: position
                    });
                    var internalid = recordObj.getSublistValue({
                        sublistId: 'custpage_purchase_order',
                        fieldId: 'field_internalid',
                        line: position
                    })
                    if(!filesObj[position]){
                        filesObj[position] ={
                            documentnumber: documentID,
                            location: locationID,
                            parcialidad: parcialidad,
                            id: internalid,
                            currentuser: runtime.getCurrentUser().id,
                            xml: '',
                            xmlfile: '',
                            pdf: '',
                            pdffile: '',
                            img: '',
                            imgfile: '',
                            img_ext:''
                        };
                    }

                    console.log("ID", filecontext.target.id);
                    console.log("xml", filecontext.target.id.includes('xml'));

                    if(filecontext.target.id.includes('xml') == true){
                        //var filexml_content=reader.target.result;
                        filesObj[position].xml = filebase64;
                        filesObj[position].xmlfile = file;
                    }
                    console.log("pdf", filecontext.target.id.includes('pdf'));
                    if(filecontext.target.id.includes('pdf') == true){
                        filesObj[position].pdf = filebase64;
                        filesObj[position].pdffile = file;
                    }

                    console.log("evidence", filecontext.target.id.includes('evidence'));
                    if(filecontext.target.id.includes('evidence') == true){
                        var name_file = file.name;
                        console.log("file", "hola " + file);
                        console.log("file.name", "hola " + file.name);
                        console.log("file.size", "size " + Math.round(file.size/1024));
                        var tamanio = Math.round(file.size/1024);

                        var ext = name_file.split('.');
                        console.log("ext[1]", "hola " + ext[1]);
                        if(tamanio<=2048) {
                            filesObj[position].img = filebase64;
                            filesObj[position].imgfile = file;
                            filesObj[position].img_ext = ext[1];
                        }
                        filesObj[position].tamanio = tamanio;
                    }

                    console.log(file);
                };
                console.log("getFile", "hola " + position);
            }
            else{
                console.log("xml", filecontext.target.id.includes('xml'));
                if(filecontext.target.id.includes('xml') == true){
                    filesObj[position].xml = '';
                    filesObj[position].xmlfile = '';
                }
                console.log("pdf", filecontext.target.id.includes('pdf'));
                if(filecontext.target.id.includes('pdf') == true){
                    filesObj[position].pdf = '';
                    filesObj[position].pdffile = '';
                }

                console.log("evidence", filecontext.target.id.includes('evidence'));
                if(filecontext.target.id.includes('evidence') == true){
                    filesObj[position].img = '';
                    filesObj[position].imgfile = '';
                    filesObj[position].img_ext = '';

                }
            }

            console.log("filesObj", filesObj);

        }

        function showMessage(type, duration, details) {
            try {
                var messageAlert = null;
                switch (type) {
                    case (message.Type.ERROR):
                        messageAlert = message.create({
                            type: message.Type.ERROR,
                            title: 'Error',
                            message: details
                        })
                        break;
                    case (message.Type.WARNING):
                        messageAlert = message.create({
                            type: message.Type.WARNING,
                            title: 'Advertencia',
                            message: details
                        })
                        break;
                }
                if (messageAlert != null) {
                    if (duration) {
                        messageAlert.show({duration: duration});
                    } else {
                        messageAlert.show()
                    }
                }
            } catch (e) {
                console.error({title: 'Error on show message', details: e.message});
            }

        }

        function sendData(dat,configPortal) {
            var dat1 = JSON.parse(JSON.stringify(dat))
            console.log('json copy', dat1);
            var keyJSON = Object.keys(dat1);
            var data = [];
            for (var i in keyJSON) {
                console.log(dat1[keyJSON[i]]);
                data.push(dat1[keyJSON[i]]);
            }
            console.log(data);
            if (data.length > 0) {
                countGlobal--;
                var urlSend = url.resolveScript({
                    scriptId: 'customscript_efx_pp_create_master',
                    deploymentId: 'customdeploy_efx_pp_create_master',
                    returnExternalUrl: true,
                    params: {}
                });
                var headers = {
                    'Content-Type': 'application/json'
                };


                var myMsg_create = message.create({
                    title: "Portal de Proveedores",
                    message: "Sus archivos se estan procesando...",
                    type: message.Type.INFORMATION
                });
                myMsg_create.show();

                var body = JSON.stringify(data);
                console.log('body for send',body);
                var response = https.post.promise({
                    url: urlSend,
                    headers: headers,
                    body: JSON.stringify(data)
                }).then(function(response){
                    log.debug({
                        title: 'Response',
                        details: response
                    });

                    if(response.code==200){
                        myMsg_create.hide();
                        var myMsg = message.create({
                            title: "Portal de Proveedores",
                            message: "Sus archivos fueron procesados, se le informará por correo su estatus...",
                            type: message.Type.CONFIRMATION
                        });
                        myMsg.show({ duration : 5500 });

                        console.log('respuesta');

                        location.reload();
                    }else if(response.code==500){
                        myMsg_create.hide();
                        var myMsg = message.create({
                            title: "Portal de proveedores",
                            message: "Ocurrio un error: "+response.body,
                            type: message.Type.ERROR
                        });
                        myMsg.show();
                    }else {
                        myMsg_create.hide();
                        var myMsg = message.create({
                            title: "Portal de Proveedores",
                            message: "Ocurrio un error: "+response.body,
                            type: message.Type.ERROR
                        });
                        myMsg.show();
                    }

                }).catch(function onRejected(reason) {
                        log.debug({
                            title: 'Invalid Request: ',
                            details: reason
                        });
                    myMsg_create.hide();
                    var myMsg = message.create({
                        title: "Portal de Proveedores",
                        message: "Ocurrio un error: "+reason,
                        type: message.Type.ERROR
                    });
                    myMsg.show();
                    });


            } else {
                showMessage(message.Type.ERROR, 5000, 'No hay contenido de los archivos')
            }
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            applyFilters: applyFilters,
            sendFunction: sendFunction,
            getFile: getFile
        };

    }
);