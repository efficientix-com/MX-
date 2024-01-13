/**
 * @NModuleScope TargetAccount
 */
define(["N/record","N/render","N/file"], function(record,render,file) {
    /**
     * getfields
     */
    function createAdd(xmladdenda,objetoAddenda) {
        try {
            var respuesta = {
                succes: false,
                data: '',
                xmlns: '',
            };
            log.audit({title: 'xmladdenda', details: xmladdenda});
            log.audit({title: 'objetoAddenda', details: objetoAddenda});
            log.audit({title: 'obj_transaccion', details: objetoAddenda.obj_transaccion});
            /* var fileresult_obj = file.create({
                 name: 'obj_transaccion.json',
                 fileType: file.Type.PLAINTEXT,
                 contents: JSON.stringify(objetoAddenda),
                 folder: 1188
             });
            
            
             fileresult_obj.save();*/

            var plantilla = render.create();


            plantilla.templateContent = xmladdenda;
            if(objetoAddenda.obj_transaccion){
                plantilla.addRecord('transaction', objetoAddenda.obj_transaccion);
            }if(objetoAddenda.obj_cliente){
                plantilla.addRecord('customer', objetoAddenda.obj_cliente);
            }if(objetoAddenda.obj_subsidiaria){
                plantilla.addRecord('subsidiary', objetoAddenda.obj_subsidiaria);
            }

            log.audit({title: 'objetoAddenda.obj_subsidiaria_dir', details: objetoAddenda.obj_subsidiaria_dir});
            var obj_subdirst = JSON.stringify(objetoAddenda.obj_subsidiaria_dir);
            var obj_subdir = JSON.parse(obj_subdirst);

            if(obj_subdir["fields"]){
                plantilla.addCustomDataSource({
                    alias: 'subsidiaryaddress',
                    format: render.DataSource.OBJECT,
                    data: obj_subdir["fields"]
                });
            }

            log.audit({title: 'objetoAddenda.obj_enviodir', details: objetoAddenda.obj_enviodir});
            var obj_direnvst = JSON.stringify(objetoAddenda.obj_enviodir);
            var obj_direnv = JSON.parse(obj_direnvst);

            if(obj_direnv["fields"]){
                plantilla.addCustomDataSource({
                                alias: 'shipaddress',
                                format: render.DataSource.OBJECT,
                                data: obj_direnv["fields"]
                            });
            }
            log.audit({title: 'objetoAddenda.obj_facturaciondir', details: objetoAddenda.obj_facturaciondir.fields});
            var obj_dirbillst = JSON.stringify(objetoAddenda.obj_facturaciondir);
            var obj_dirbill = JSON.parse(obj_dirbillst);
            if(obj_dirbill["fields"]){
                plantilla.addCustomDataSource({
                                alias: 'billaddress',
                                format: render.DataSource.OBJECT,
                                data: obj_dirbill["fields"]
                            });
            }
/*
            log.audit({title: 'objetoAddenda.obj_detalleinv', details: objetoAddenda.obj_detalleinv});            
            var obj_detinvst = JSON.stringify(objetoAddenda.obj_detalleinv);
            var obj_detinv = JSON.parse(obj_detinvst);            
            if(obj_detinv){
                plantilla.addCustomDataSource({
                                alias: 'detalleInventario',
                                format: render.DataSource.OBJECT,
                                data: objetoAddenda.obj_detalleinv
                            });
            }
*/
            var obj_termst = JSON.stringify(objetoAddenda.obj_terminos);
            var obj_term = JSON.parse(obj_termst);
            log.audit({title:'obj_term',details:obj_term});
            if(obj_term["fields"]){
                plantilla.addCustomDataSource({
                    alias: 'terms',
                    format: render.DataSource.OBJECT,
                    data: obj_term["fields"]
                });
            }







            var content = plantilla.renderAsString();


            respuesta.data = content;
            respuesta.succes = true;
        }catch(error_armaaddenda){
            log.error({title:'error_armaaddenda',details:error_armaaddenda});
            respuesta.succes = false;
        }


        return respuesta;
    }



    return {
        createAdd: createAdd,
    };

});