/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/ui/serverWidget', 'N/runtime', 'N/currentRecord', 'N/ui/message'],

    (record, log, serverWidget, runtime, currentRecord, message) => {
        var form = "";
        var formEdit = "";
        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        


        function beforeLoad(scriptContext) {
            try {
                log.debug({
                    title: "type of view",
                    details: scriptContext.type == scriptContext.UserEventType.EDIT
                })
                form = scriptContext.form;
                var field = form.addField({
                    id: 'custpageinjectcode',
                    type: 'INLINEHTML',
                    label: 'Inject Code'
                });
                // var btnCustom = form.addButton({
                //     id: "custpage_btn_dialog",
                //     label: "Probar Dialog",
                //     functionName: 'triggerDialog'
                // });
                if (scriptContext.type == scriptContext.UserEventType.VIEW || scriptContext.type == scriptContext.UserEventType.EDIT || scriptContext.type == scriptContext.UserEventType.CREATE) {

                    // Código de Observer
                    field.defaultValue = '<script>';
                    field.defaultValue += 'var mascara=document.getElementById("body");'

                    field.defaultValue += 'function defineTipoAlert(mutations){'
                    field.defaultValue += 'for(let mutation of mutations){'
                    field.defaultValue += 'if(mutation.type==="childList"){'
                    field.defaultValue += 'var addedNode= mutation.addedNodes;'
                    field.defaultValue += 'for(var i=0;i<addedNode.length;i++){'
                    field.defaultValue += 'var addedNodeClassName= addedNode[i].className;'
                    field.defaultValue += 'console.log("ClassName child nuevo:",addedNodeClassName);'
                    field.defaultValue += 'console.log("nuevo DE DIV__ALERT:",mutation.addedNodes);'
                    field.defaultValue += 'var prevClassName= mutation.previousSibling.className;'
                    field.defaultValue += 'var prevChild= mutation.previousSibling;'
                    field.defaultValue += 'console.log("ClassName child anterior:",prevClassName);'
                    field.defaultValue += 'if(addedNodeClassName.includes("error")){'
                    // Inicia ERROR
                    field.defaultValue += "var cDiv = addedNode[0].children;"
                    field.defaultValue += "for (var inf = 0; inf < cDiv.length; inf++) {"
                    field.defaultValue += "if (cDiv[inf].tagName == 'DIV') { "
                    field.defaultValue += "var cDivChildren=cDiv[inf].children;"
                    field.defaultValue += "for (var j = 0; j < cDivChildren.length; j++) {"
                    field.defaultValue += "if (cDivChildren[j].tagName == 'DIV') { "
                    field.defaultValue += "cDivChildren[j].style.color = '#ac003e';"

                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += " }"
                    field.defaultValue += "addedNode[0].style.background='white';"
                    field.defaultValue += "addedNode[0].style.borderTop='10px solid #ac003e';"
                    field.defaultValue += "addedNode[0].style.borderRadius='3px';"


                    field.defaultValue += '}'
                    // Inicia CONFIRMATION SUCCESS
                    field.defaultValue += 'if(addedNodeClassName.includes("confirmation")){'
                    field.defaultValue += "var cDiv = addedNode[0].children;"
                    field.defaultValue += "for (var inf = 0; inf < cDiv.length; inf++) {"
                    field.defaultValue += "if (cDiv[inf].tagName == 'DIV') { "
                    field.defaultValue += "var cDivChildren=cDiv[inf].children;"
                    field.defaultValue += "for (var j = 0; j < cDivChildren.length; j++) {"
                    field.defaultValue += "if (cDivChildren[j].tagName == 'DIV') { "
                    field.defaultValue += "cDivChildren[j].style.color = '#52bf90';"

                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += " }"
                    field.defaultValue += "addedNode[0].style.background='white';"
                    field.defaultValue += "addedNode[0].style.borderTop='10px solid #52bf90';"
                    field.defaultValue += "addedNode[0].style.borderRadius='3px';"

                    field.defaultValue += '}'
                    // IniciaINFOOO
                    field.defaultValue += 'if(addedNodeClassName.includes("info")){'
                    field.defaultValue += "var cDiv = addedNode[0].children;"
                    field.defaultValue += "for (var inf = 0; inf < cDiv.length; inf++) {"
                    field.defaultValue += "if (cDiv[inf].tagName == 'DIV') { "
                    field.defaultValue += "var cDivChildren=cDiv[inf].children;"
                    field.defaultValue += "for (var j = 0; j < cDivChildren.length; j++) {"
                    field.defaultValue += "if (cDivChildren[j].tagName == 'DIV') { "
                    field.defaultValue += "cDivChildren[j].style.color = '#0077be';"

                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += " }"
                    field.defaultValue += "addedNode[0].style.background='white';"
                    field.defaultValue += "addedNode[0].style.borderTop='10px solid #0077be';"
                    field.defaultValue += "addedNode[0].style.borderRadius='3px';"
                    field.defaultValue += '}'




                    field.defaultValue += '}'
                    field.defaultValue += '}'
                    field.defaultValue += '}'
                    field.defaultValue += '}'



                    field.defaultValue += 'function cargarFuncion(mutations){'
                    field.defaultValue += 'for(let mutation of mutations){'
                    field.defaultValue += 'if(mutation.type==="childList"){'
                    field.defaultValue += 'var addedNode= mutation.addedNodes;'
                    field.defaultValue += 'console.log("Detectado de cambios VIEW:",addedNode);'
                    field.defaultValue += 'for(var i=0;i<addedNode.length;i++){'

                    field.defaultValue += 'var addedNodeClassName= addedNode[i].id;'
                    field.defaultValue += 'console.log("ClassName",addedNodeClassName);'
                    field.defaultValue += 'if(addedNodeClassName=="div__alert"){'

                    field.defaultValue += 'console.log("Alert was triggered: ",addedNode);'
                    // field.defaultValue += 'var addedNodechild= addedNode[i].children;'
                    // field.defaultValue += 'console.log("Parent child",addedNodechild);';
                    field.defaultValue += 'var tipoAlert=document.getElementById("div__alert");'

                    field.defaultValue += 'var observadorTipo=new MutationObserver(defineTipoAlert);'

                    field.defaultValue += 'observadorTipo.observe(addedNode[i],{childList: true});'
                    // Renderización de Messages
                    field.defaultValue += "var hideElement=document.getElementById('div__alert');";
                    field.defaultValue += "if(hideElement){"
                    // Inicia caso de mensaje INFO
                    // field.defaultValue += `var infoMessage=document.querySelectorAll('#div__alert .uir-alert-box.info');`;
                    field.defaultValue += `var messageChild=addedNode[i].children;`;
                    // inicio for de messageChild
                    field.defaultValue += 'for ( mc in messageChild){'
                    field.defaultValue += `var messageChildClassName=messageChild[0].className;`;
                    field.defaultValue += 'console.log("child className: ",messageChildClassName);'

                    field.defaultValue += "if(messageChildClassName){"
                    field.defaultValue += "if(messageChildClassName.includes('info')){"

                    field.defaultValue += "var cDiv = messageChild[0].children;"
                    field.defaultValue += "for (var inf = 0; inf < cDiv.length; inf++) {"
                    field.defaultValue += "if (cDiv[inf].tagName == 'DIV') { "
                    field.defaultValue += "var cDivChildren=cDiv[inf].children;"
                    field.defaultValue += "for (var j = 0; j < cDivChildren.length; j++) {"
                    field.defaultValue += "if (cDivChildren[j].tagName == 'DIV') { "
                    field.defaultValue += "cDivChildren[j].style.color = '#0077be';"

                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += " }"
                    field.defaultValue += "messageChild[0].style.background='white';"
                    field.defaultValue += "messageChild[0].style.borderTop='10px solid #0077be';"
                    field.defaultValue += "messageChild[0].style.borderRadius='3px';"
                    field.defaultValue += "}"
                    // Termina if de si incluye info




                    // // // Inicia render de error
                    field.defaultValue += "if(messageChildClassName.includes('error')){"

                    field.defaultValue += "var cDiv = messageChild[0].children;"
                    field.defaultValue += "for (var inf = 0; inf < cDiv.length; inf++) {"
                    field.defaultValue += "if (cDiv[inf].tagName == 'DIV') { "
                    field.defaultValue += "var cDivChildren=cDiv[inf].children;"
                    field.defaultValue += "for (var j = 0; j < cDivChildren.length; j++) {"
                    field.defaultValue += "if (cDivChildren[j].tagName == 'DIV') { "
                    field.defaultValue += "cDivChildren[j].style.color = '#ac003e';"

                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += " }"
                    field.defaultValue += "messageChild[0].style.background='white';"
                    field.defaultValue += "messageChild[0].style.borderTop='10px solid #ac003e';"
                    field.defaultValue += "messageChild[0].style.borderRadius='3px';"
                    field.defaultValue += "}"
                    // // // Termina render de error
                    // // Inicia render de success
                    field.defaultValue += "if(messageChildClassName.includes('confirmation')){"

                    field.defaultValue += "var cDiv = messageChild[0].children;"
                    field.defaultValue += "for (var inf = 0; inf < cDiv.length; inf++) {"
                    field.defaultValue += "if (cDiv[inf].tagName == 'DIV') { "
                    field.defaultValue += "var cDivChildren=cDiv[inf].children;"
                    field.defaultValue += "for (var j = 0; j < cDivChildren.length; j++) {"
                    field.defaultValue += "if (cDivChildren[j].tagName == 'DIV') { "
                    field.defaultValue += "cDivChildren[j].style.color = '#52bf90';"

                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += "}"
                    field.defaultValue += " }"
                    field.defaultValue += "messageChild[0].style.background='white';"
                    field.defaultValue += "messageChild[0].style.borderTop='10px solid #52bf90';"
                    field.defaultValue += "messageChild[0].style.borderRadius='3px';"
                    field.defaultValue += "}"
                    // Termina render de success



                    field.defaultValue += "}"
                    // Fin de for de messageChild
                    field.defaultValue += "}"
                    // Termina caso de mensaje INFO




                    field.defaultValue += "hideElement.style.paddingTop='20px'"
                    field.defaultValue += "}"


                    field.defaultValue += '}'
                    field.defaultValue += '}'
                    field.defaultValue += '}'
                    field.defaultValue += '}'
                    field.defaultValue += '}'
                    field.defaultValue += 'var observador=new MutationObserver(cargarFuncion);'

                    field.defaultValue += 'observador.observe(mascara,{childList: true});'

                    field.defaultValue += '</script>';
                    // Finaliza Código de observer
                    log.debug({
                        title: "Form",
                        details: form
                    })
                }
                // Experimento de Observador
                field.defaultValue += '<script>';
                field.defaultValue += 'console.log("User event is being triggered");';
                field.defaultValue += `var listener4Events=document.querySelectorAll('.uir-header-buttons [id^="custpage"]');`;
                field.defaultValue += "for(var i=0;i<listener4Events.length;i++){"

                field.defaultValue += 'listener4Events[i].addEventListener("click", ()=>{';

                field.defaultValue += 'var mascaraDialog=document.getElementsByTagName("body")[0];'
                field.defaultValue += 'function cargarEstiloDialog(mutations){'
                field.defaultValue += 'for(let mutationD of mutations){'
                field.defaultValue += 'if(mutationD.type==="childList"){'
                field.defaultValue += 'var addedNodeD= mutationD.addedNodes;'
                field.defaultValue += 'console.log("Detectado de cambios",addedNodeD);'
                field.defaultValue += 'for(var i=0;i<addedNodeD.length;i++){'

                field.defaultValue += 'var addedNodeClassNameD= addedNodeD[i].className;'
                field.defaultValue += 'console.log("ClassName",addedNodeClassNameD);'
                field.defaultValue += 'if(addedNodeClassNameD=="x-window x-layer x-window-default x-border-box x-focus x-window-focus x-window-default-focus"){'

                field.defaultValue += 'console.log("Dialog was triggered");'

                // Código de renderización de dialog
                field.defaultValue += `var dialog=document.querySelector('[role="dialog"] .uir-message-header');`;
                field.defaultValue += "if(dialog){"
                field.defaultValue += `var dialogHeader=document.querySelector('[role="dialog"] .x-window-header-title-default');`;
                field.defaultValue += `var dialogAll=document.querySelector('[role="dialog"].x-window-default');`;
                field.defaultValue += `var dialogButton=document.querySelector('[role="dialog"] .uir-message-buttons button');`;
                field.defaultValue += 'dialog.classList.remove("x-window-header-default");';
                field.defaultValue += `dialog.style.backgroundColor='white';`;
                field.defaultValue += "dialog.style.borderTop='10px solid #0077be';"
                field.defaultValue += "dialog.style.borderRadius='3px';"

                field.defaultValue += `dialogHeader.style.color='#0077be';`;


                field.defaultValue += `dialogButton.style.backgroundColor='#0077be';`;
                field.defaultValue += `dialogButton.style.color='white';`;
                field.defaultValue += "dialogButton.style.border='2px solid #0077be';"

                field.defaultValue += "dialogAll.style.borderRadius='3px';"

                field.defaultValue += "}"
                // Fin de código de renderización de dialog

                field.defaultValue += '}'
                field.defaultValue += '}'
                field.defaultValue += '}'
                field.defaultValue += '}'
                field.defaultValue += '}'
                field.defaultValue += 'var observadorD=new MutationObserver(cargarEstiloDialog);'

                field.defaultValue += 'observadorD.observe(mascaraDialog,{childList: true});'
                field.defaultValue += '});';
                field.defaultValue += '}';

                field.defaultValue += '</script>';

            } catch (e) {
                log.error({
                    title: "beforeLoad ERROR",
                    details: e
                })
            }
        }
        function afterSubmit(scriptContext) {
            // log.debug({
            //     title: "type of view",
            //     details: scriptContext.type
            // })
            // log.debug({
            //     title: "form aftersubmit",
            //     details: scriptContext.form
            // });
            var messageText = 'Record has been successfully submitted.';
            var messageOptions = {
                title: 'Success!',
                message: messageText,
                type: message.Type.CONFIRMATION // Use CONFIRMATION type to overwrite default confirmation message
            };
            var messageD = message.create(messageOptions);
            messageD.show();
        }



        return { beforeLoad }

    });
