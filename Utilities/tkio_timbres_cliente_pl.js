/**
 * @NApiVersion 2.1
 * @NScriptType Portlet
 * @NModuleScope Public
 */
 define(['N/ui/serverWidget','N/url','N/https','N/log','N/runtime','N/record','N/xml','N/search'],function (serverWidget,url,https,log,runtime,record,xml,search) {
    /**
     * Defines the Portlet script trigger point.
     * @param {Object} params - The params parameter is a JavaScript object. It is automatically passed to the script entry
     *     point by NetSuite. The values for params are read-only.
     * @param {Portlet} params.portlet - The portlet object used for rendering
     * @param {string} params.column - Column index forthe portlet on the dashboard; left column (1), center column (2) or
     *     right column (3)
     * @param {string} params.entity - (For custom portlets only) references the customer ID for the selected customer
     * @since 2015.2
     */
    function savedSearchForSubsidiary(){
        const subsidiarySearchColInternalId = search.createColumn({ name: 'internalid', sort: search.Sort.ASC });
const subsidiarySearchColName = search.createColumn({ name: 'name' });
const subsidiarySearch = search.create({
  type: 'subsidiary',
  filters: [],
  columns: [
    subsidiarySearchColInternalId,
    subsidiarySearchColName,
  ],
});
// Note: Search.run() is limited to 4,000 results
// subsidiarySearch.run().each((result: search.Result): boolean => {
//   return true;
// });
const subsidiarySearchPagedData = subsidiarySearch.runPaged();
var searchRanges=subsidiarySearchPagedData.pageRanges;
var internalid=[];
var name_subsidiary=[];
var dataReturn={};
searchRanges.forEach(function (value){
    var myPage=subsidiarySearchPagedData.fetch({index: value.index});
    myPage.data.forEach(function (data){
        if(!dataReturn[data.id]){
            dataReturn[data.id]={
            };
        }
        dataReturn[data.id].internalid=data.getValue({name:'internalid'});
        dataReturn[data.id].name_subsidiary=data.getValue({name:'name'});
        // internalid.push(data.getValue({name:'internalid'}));
        // name_subsidiary.push(data.getValue({name:'name'}));
        // log.debug({
        //     title: "savedSearch Data",
        //     details: internalid + " subsidiary: "+name_subsidiary
        // });
        return true;
    });
    return true;
});
    return dataReturn;
    }
    function getEmisor(id){
        try{
            var existeSuiteTax = runtime.isFeatureInEffect({ feature: 'tax_overhauling' });
            var objRecord = record.load({
                type:'subsidiary',
                id:id
            });
            var emisor_return=0;
            log.debug({
                title: "existeSuiteTax",
                details: existeSuiteTax
            });
            if(existeSuiteTax){
                emisor_return = objRecord.getSublistValue({
                    sublistId: 'nexus',
                    fieldId:'taxregistration',
                    line:0
                 });
                
            }else{
               
                emisor_return = objRecord.getText({
                    fieldId: 'federalidnumber'
                });
                 
           }
           log.debug({
            title: "getEmisor",
            details: emisor_return
           });
        
           return emisor_return;
        
         
        }catch(e){
            log.error({
                title: "getEmisor",
                details: e
            })
        }
        
    }
    function function_prueba(){
        log.debug({
            title: "function_prueba",
            details: "Got triggered"
        })
    }
    const render = (params) => {
        try{
            var portletObj = params.portlet;
            portletObj.title = 'Timbres Cliente';

            log.debug({
                title: "params",
                details: params
            });
            //var respuesta = crearXML(43738,'invoice');
            var respuesta =getPacConection();
            var emisor="";
            var url_sat="";
            var usuario="";
            //portletObj.clientScriptModulePath='./tkio_timbres_cliente_cs.js';
            
            var savedSearch=savedSearchForSubsidiary();
            var ids_subsidiaries=[];
            var name_subsidiaries=[];
            var strOptions="";
            var i=0;
            for(var key in savedSearch){
                ids_subsidiaries[i]=savedSearch[key].internalid;
                name_subsidiaries[i]=savedSearch[key].name_subsidiary;
                strOptions+='<option value="' +ids_subsidiaries[i]+ '">' +name_subsidiaries[i]+ '</option>';
                i++; 
            }
            log.audit({
                title: "Saved Search Subsidiary ID",
                details: ids_subsidiaries
            });
            log.audit({
                title: "Saved Search Subsidiary Name",
                details: name_subsidiaries
            });
           
            // var subsidiariesField = portletObj.addField({
            //     id: 'subsidiaries_select',
            //     type: 'inlinehtml',
            //     label: 'Subsidiaria'
            // });
            // subsidiariesField.defaultValue='<div>'+
            // '<select onchange="trae()" id="subsidiarySelect">'+
            // strOptions+
            // '</select>'+
            // '</div><script>'+
            // 'function trae(){var a=document.getElementById("subsidiarySelect"); console.log(a.value);var b=document.getElementById("aux_output_val"); b.innerHTML=a.value; console.log("ah: "+b.value);'+function_prueba()+'}'
            // +'</script>';
            
            



            var totales=[];
            var disponibles=[];
            var consumidos=[];
            var subs = portletObj.addField({
                id: 'custpage_subsidiaries_select',
                type: 'inlinehtml',
                label: 'Subsidiaria'
            });
            subs.defaultValue="<style>"      
            +"tr:nth-child(even) {background-color: #99ccff;}"            
            +"th, td   {padding:10px;text-align:center;font-size:1.3vw;}"
            +"th    { background-color: #3366ff;color: white;font-weight:700;font-size:1.5vw;}"
            +"@media (max-width: 400px) {#rTotales,#rConsumidos,#Ttotales,#Tconsumidos {display: none;} th, td   {padding:10px;text-align:center;font-size:3.5vw;} th    { background-color: #3366ff;color: white;font-weight:700;font-size:3.3vw;}}"
            +"</style>"+"<div style='overflow-y:auto;overflow-x:auto;'><table style='width:100%'><thead><th>Subsidiaria</th><th id='Ttotales'>Timbres Totales</th><th>Timbres Disponibles</th><th id='Tconsumidos'>Timbres Consumidos</th></thead><tbody>";
            
            for(var i=0;i<ids_subsidiaries.length;i++){
                var select_subsidiary=ids_subsidiaries[i];
                log.debug({
                    title: "select_subsidiary",
                    details: ids_subsidiaries[i]
                })
                if(respuesta.pruebas){
                    emisor=respuesta.emisorPrueba;
                    url_sat=respuesta.urlPrueba;
                    usuario=respuesta.userPrueba;
                }else{
                    emisor=getEmisor(select_subsidiary);
                    log.debug({
                        title: "Not in pruebas",
                        details: "true"
                    })
                    url_sat=respuesta.url;
                    usuario=respuesta.user;
                }
                emisor=getEmisor(select_subsidiary);
                
                log.debug({
                    title: "Render",
                    details: emisor
                });
                var xmlSend=xmlConsultaEstatusSat(usuario,emisor);
                if(url_sat && xmlSend){
                    var response=https.post({
                        body: xmlSend,
                        url: url_sat,
                        
                    });
                    log.audit({ title: 'response ', details: response });
                    var responseCode = response.code || '';
                    var responseBody = response.body || '';
                    log.audit({ title: 'responseCode', details: responseCode });
                    log.audit({ title: 'responseBody', details: responseBody });
                    if(responseCode==200){
                        var xmlDocument = xml.Parser.fromString({
                            text: responseBody
                        });
    
                        var anyType = xml.XPath.select({
                            node: xmlDocument,
                            xpath: 'soap:Envelope//soap:Body//nlapi:ObtieneTimbresDisponiblesResponse//nlapi:ObtieneTimbresDisponiblesResult//nlapi:anyType'
                        });
                        //Posición 3 son totales, 5 es disponibles y 4 son consumidos
                        log.audit({ title: anyType[3].textContent, details: JSON.stringify(anyType) });
                        totales[i]=anyType[3].textContent;
                        disponibles[i]=anyType[5].textContent;
                        consumidos[i]=anyType[4].textContent;
                        log.debug({
                            title: "totales array",
                            details: totales[i]
                        });
                        log.debug({
                            title: "disponibles array",
                            details: disponibles[i]
                        });
                        log.debug({
                            title: "consumidos array",
                            details: consumidos[i]
                        });
                        setComponentsForRefresh(totales[i],disponibles[i],consumidos[i],i,name_subsidiaries[i],strOptions);
                        
                    }
                }
            }
            
            subs.defaultValue+="</tbody></table></div>";


            function setComponentsForRefresh(totales,disponibles,consumidos,i,nameSub,strOptions) {
                var objFields=[];
                log.debug({
                    title: "Array totales received function",
                    details: totales
                });
                
                
                //for(var i=0;i<3;i++){
                    /*objFields[i]= portletObj.addField({
                        id: 'custpage_name_subsidiary_'+i,
                        type: 'inlinehtml',
                        label: 'Subsidiaria'
                    });
                    objFields[i].defaultValue="<div><h2>"+nameSub+"</h2></div>";

                    objFields[i]= portletObj.addField({
                        id: 'custpage_totales_output_'+i,
                        type: 'inlinehtml',
                        label: 'Timbres Totales'
                    });
                    

                    objFields[i].defaultValue="<div style='text-align:center;background-color:#cccccc;border-radius:10px;width:100%;padding:7px;height:auto;margin-bottom:10px;margin-right:7px;margin-top:10px;'><h3 style='font-size:1.1rem;font-weight:400;color:#333333'><b style='color:black;font-size:1.2rem;'>Timbres Totales</b><br>"+totales+"</h3></div>";
                    objFields[i] = portletObj.addField({
                        id: 'custpage_disponibles_output_'+i,
                        type: 'inlinehtml',
                        label: 'Timbres Disponibles'
                    });
                    objFields[i].defaultValue = "<div style='text-align:center;background-color:#cccccc;border-radius:10px;width:100%;padding:7px;height:auto;margin-bottom:10px;'><h3 style='font-size:1.1rem;font-weight:400;color:#333333'><b style='color:black;font-size:1.2rem'>Timbres Disponibles</b><br>"+disponibles+"</h3></div></div>";
                    objFields[i].updateDisplaySize({
                        height : 60,
                        width : 35
                    });
                    objFields[i].updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });
                    objFields[i] = portletObj.addField({
                        id: 'custpage_consumidos_output_'+i,
                        type: 'inlinehtml',
                        label: 'Timbres Consumidos'
                    });
                    objFields[i].defaultValue =  "<div style='text-align:center;background-color:#cccccc;border-radius:10px;width:100%;padding:7px;height:auto;margin-left:7px;'><h3 style='font-size:1.1rem;font-weight:400;color:#333333'><b style='color:black;font-size:1.2rem'>Timbres Consumidos</b><br>"+consumidos+"</h3></div></div>";
                    objFields[i].updateDisplaySize({
                        height : 60,
                        width : 35
                    });
                    objFields[i].updateDisplayType({
                        displayType: serverWidget.FieldDisplayType.DISABLED
                    });*/
                    subs.defaultValue+='<tr><td>'+nameSub+'</td><td id="rTotales">'+totales+'</td><td>'+disponibles+'</td><td id="rConsumidos">'+consumidos+'</td></tr>';
                //}
                
                // var textField = portletObj.addField({
                //     id: 'custpage_totales_output',
                //     type: 'inlinehtml',
                //     label: 'Timbres Totales'
                // });
                // textField.defaultValue = "<div style='text-align:center;background-color:#cccccc;border-radius:10px;width:100%;padding:7px;height:auto;margin-bottom:10px;margin-right:7px;'><h3 style='font-size:1.1rem;font-weight:400;color:#333333'><b style='color:black;font-size:1.2rem;'>Timbres Totales</b><br>"+totales+"</h3></div>";
                

                // var textField_Disponibles = portletObj.addField({
                //     id: 'custpage_disponibles_output',
                //     type: 'inlinehtml',
                //     label: 'Timbres Disponibles'
                // });
                // textField_Disponibles.defaultValue = "<div style='text-align:center;background-color:#cccccc;border-radius:10px;width:100%;padding:7px;height:auto;margin-bottom:10px;'><h3 style='font-size:1.1rem;font-weight:400;color:#333333'><b style='color:black;font-size:1.2rem'>Timbres Disponibles</b><br>"+disponibles+"</h3></div></div>";
                // textField_Disponibles.updateDisplaySize({
                //     height : 60,
                //     width : 35
                // });
                // textField_Disponibles.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.DISABLED
                // });
                //Field de Consumidos
                // var textField_Consumidos = portletObj.addField({
                //     id: 'custpage_consumidos_output',
                //     type: 'inlinehtml',
                //     label: 'Timbres Consumidos'
                // });
                // textField_Consumidos.defaultValue =  "<div style='text-align:center;background-color:#cccccc;border-radius:10px;width:100%;padding:7px;height:auto;margin-left:7px;'><h3 style='font-size:1.1rem;font-weight:400;color:#333333'><b style='color:black;font-size:1.2rem'>Timbres Consumidos</b><br>"+consumidos+"</h3></div></div>";
                // textField_Consumidos.updateDisplaySize({
                //     height : 60,
                //     width : 35
                // });
                // textField_Consumidos.updateDisplayType({
                //     displayType: serverWidget.FieldDisplayType.DISABLED
                // });
                
            }

        }catch(e){
            log.error({
                title: "Error",
                details: e
            })
        }

    }
    function xmlConsultaEstatusSat(usuarioIntegrador, rfcEmisor) {
        var xmlReturn = '';
        xmlReturn += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">';
        xmlReturn += '    <soapenv:Header/>';
        xmlReturn += '    <soapenv:Body>';
        xmlReturn += '        <tem:ObtieneTimbresDisponibles>';
        xmlReturn += '            <tem:usuarioIntegrador>' + usuarioIntegrador + '</tem:usuarioIntegrador>';
        xmlReturn += '            <tem:rfcEmisor>' + rfcEmisor + '</tem:rfcEmisor>';
        xmlReturn += '        </tem:ObtieneTimbresDisponibles>';
        xmlReturn += '    </soapenv:Body>';
        xmlReturn += '</soapenv:Envelope>';
        log.audit({ title: 'xmlReturn xmlConsultaEstatusSat', details: xmlReturn });
        return xmlReturn;
    }
    function getPacConection(){
        var objPacConection = {
            url: '',
            user: '',
            mailuser:'',
            https:'',
            pruebas:'',
            emisorPrueba:'',
            urlPrueba:'',
            userPrueba:'',
            urlValidador:'',
            userValidador:''
        }
        var idConection = runtime.getCurrentScript().getParameter({name: 'custscript_efx_fe_connect_pac_data'});
        var conectionObj = record.load({
            type:'customrecord_efx_fe_mtd_envio',
            id:idConection
        });
        log.debug({
            title: "idConnection",
            details: idConection
        })
        objPacConection.url = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_url'});
        objPacConection.user = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_user'});
        objPacConection.mailuser = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_user_email'});
        objPacConection.https = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_https'});
        objPacConection.pruebas = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_test'});
        objPacConection.emisorPrueba = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_emisor_pb'});
        objPacConection.urlPrueba = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_urltest'});
        objPacConection.userPrueba = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_usertest'});
        objPacConection.urlValidador = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_urlvalid'});
        objPacConection.userValidador = conectionObj.getValue({fieldId:'custrecord_efx_fe_mtd_env_uservalid'});

        return objPacConection;
    }

    return {render}

});
