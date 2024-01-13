/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 *@NModuleScope Public
 * idscript: _efx_send_masive_status
 * iddeployment: _efx_send_masive_status
 */



define(['N/ui/serverWidget','N/task','N/url','N/record','N/file'],

    function runSuitelet(serverWidget,task,url,record,file) {
        function execute(context) {

            var list = serverWidget.createList({
                title : 'Process Status'
            });
            list.clientScriptModulePath = './EFX_FE_Global_Status_CS.js';

            list.addButton({
                id : 'refreshbutton',
                label : 'Refresh',
                functionName: 'actualizarstatus'
            });


            list.addColumn({
                id : 'processid',
                type : serverWidget.FieldType.TEXT,
                label : 'Transacciones',
                align : serverWidget.LayoutJustification.LEFT
            });

            list.addColumn({
                id : 'statusprocess',
                type : serverWidget.FieldType.TEXT,
                label : 'Estado',
                align : serverWidget.LayoutJustification.LEFT
            });
            list.addColumn({
                id : 'percentcomplete',
                type : serverWidget.FieldType.TEXT,
                label : 'Progreso',
                align : serverWidget.LayoutJustification.CENTER
            });

            list.addColumn({
                id : 'datecreated',
                type : serverWidget.FieldType.TEXT,
                label : 'Fecha de creacion',
                align : serverWidget.LayoutJustification.CENTER
            });
            list.addColumn({
                id : 'createdby',
                type : serverWidget.FieldType.TEXT,
                label : 'Creado por',
                align : serverWidget.LayoutJustification.LEFT
            });

            list.addColumn({
                id : 'processtype',
                type : serverWidget.FieldType.TEXT,
                label : 'Tipo de proceso',
                align : serverWidget.LayoutJustification.LEFT
            });

            list.addColumn({
                id : 'gblrecord',
                type : serverWidget.FieldType.RICHTEXT,
                //source:'customsale_efx_fe_factura_global',
                label : 'Factura Global',
                align : serverWidget.LayoutJustification.LEFT
            });

            list.addColumn({
                id : 'pdfrecord',
                type : serverWidget.FieldType.RICHTEXT,
                //source:'customsale_efx_fe_factura_global',
                label : 'PDF',
                align : serverWidget.LayoutJustification.LEFT
            });

            list.addColumn({
                id : 'xmlrecord',
                type : serverWidget.FieldType.RICHTEXT,
                //source:'customsale_efx_fe_factura_global',
                label : 'XML',
                align : serverWidget.LayoutJustification.LEFT
            });


            var scriptTaskId= context.request.parameters.id;
            var createdby= context.request.parameters.createdby;
            var idRecord= context.request.parameters.idrecord;


            var recodrel = record.load({
                type:'customrecord_efx_fe_gbl_records',
                id:idRecord
            });

            var idgbl = recodrel.getValue({fieldId:'custrecord_efx_fe_gbl_global'});
            var idgbl_text = recodrel.getText({fieldId:'custrecord_efx_fe_gbl_global'});

            log.audit({title:'idgbl',details:idgbl});

            var output = url.resolveRecord({
                recordType: 'customsale_efx_fe_factura_global',
                recordId: idgbl,
                isEditMode: false
            });

            var scheme = 'https://';
            var host = url.resolveDomain({
                hostType: url.HostType.APPLICATION
            });
            var pdfurl='';
            var xmlurl='';
            if(idgbl){
                var record_gbl = record.load({
                    type:'customsale_efx_fe_factura_global',
                    id:idgbl
                });
                var pdfid = record_gbl.getValue({fieldId:'custbody_edoc_generated_pdf'});
                var xmlid = record_gbl.getValue({fieldId:'custbody_psg_ei_certified_edoc'});

                var descargar = 'Abrir';
                if(pdfid){
                    var pdf_obj = file.load({id: pdfid});
                    var pdfurltext = scheme + host + pdf_obj.url;
                    pdfurl = '<a href="'+pdfurltext+'" target="_blank">'+descargar+'</a>';
                }
                if(xmlid){
                    var xml_obj = file.load({id: xmlid});
                    var xmlurltext = scheme + host + xml_obj.url;
                    xmlurl = '<a href="'+xmlurltext+'" target="_blank">'+descargar+'</a>';
                }


            }

            log.audit({title:'output',details:output});

            var creadopor='';
            try{
                var empleado_obj = record.load({
                    type:record.Type.EMPLOYEE,
                    id:createdby
                });
                creadopor = empleado_obj.getValue({fieldId:'entityid'});
            }catch(error_created){
                log.audit({title:'error_created',details:error_created});
                creadopor=createdby;
            }

            var registro= 'Factura Global';
            var taskStatus = task.checkStatus(scriptTaskId);
            var porcentaje = taskStatus.getPercentageCompleted();
            var porciento = '';
            var totalprogreso = taskStatus.getTotalReduceCount();
            var pendienteprogreso = taskStatus.getPendingReduceCount();
            var completados = totalprogreso-pendienteprogreso;
            //var completos = completados+'/'+taskStatus.getTotalReduceCount();
            var completos = 0;
            var tipo_proceso = '';

            if (taskStatus.stage === task.MapReduceStage.GET_INPUT){
                completos = 5;
                porciento = 'Agrupando Facturas';
                tipo_proceso = 'Ejecutando Busqueda Guardada';
            }
            if (taskStatus.stage === task.MapReduceStage.MAP){
//60
                var total_perc = taskStatus.getTotalMapCount();
                var restante_perc = taskStatus.getPendingMapCount();
                var calculo_perc = 0;
                log.audit({title:'total_perc',details:total_perc});
                log.audit({title:'restante_perc',details:restante_perc});
                calculo_perc = (parseFloat(restante_perc)*60)/parseFloat(total_perc);
                calculo_perc = 60 - calculo_perc;
                completos = 5+calculo_perc;
                porciento = 'Generando Global';
                tipo_proceso = 'Agregando Facturas a Global';
            }
            if (taskStatus.stage === task.MapReduceStage.REDUCE){
//15
                var total_perc = taskStatus.getPendingReduceCount();
                var restante_perc = taskStatus.getTotalReduceCount();
                var calculo_perc = 0;
                calculo_perc = (parseFloat(restante_perc)*15)/parseFloat(total_perc);
                completos = 65+calculo_perc;
                porciento = 'Timbrando';
                tipo_proceso = 'Registro Global Creado';
            }
            if (taskStatus.stage === task.MapReduceStage.SUMMARIZE){
//20
                completos = 80+calculo_perc;
                porciento = 'Actualizando Facturas Individuales';
                tipo_proceso = 'Actualizando datos';
            }



            var date = new Date();
            var hours = date.getHours();
            var ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            var fecha =  date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear()+' '+date.getHours()+':'+date.getMinutes()+' '+ampm;

            // if(porcentaje == '0'){
            //     porciento = 'Iniciando';
            // }
            // if(porcentaje != '0' || porcentaje != '100.0'){
            //     porciento = 'Procesando';
            // }
            if(porcentaje == '100.0'){

                if(pdfurl && xmlurl){
                    porciento = 'Completado';
                    completos = 100;
                    tipo_proceso = 'Finalizado';
                }else{
                    porciento = 'Iniciando';
                    completos = 0;
                    tipo_proceso = 'Inicio de Ejecución';
                }
            }



            var array_rows = new Array();


            //var objeto_row = new Object();

            var registros = registro;



            var urltext = scheme+host+output;
            var urlglobal = '<a href="'+urltext+'" target="_blank">'+idgbl_text+'</a>';

            log.audit({title:'urlglobal',details:urlglobal});

            list.addRow({
                row : { processid : registros,
                    processtype : tipo_proceso,
                    statusprocess : porciento,
                    percentcomplete : completos.toFixed(2)+'%',
                    datecreated : fecha,
                    createdby : creadopor,
                    gblrecord : urlglobal,
                    pdfrecord : pdfurl,
                    xmlrecord : xmlurl
                }
            });

            context.response.writePage(list);
        }

        return {
            onRequest: execute
        };
    });

