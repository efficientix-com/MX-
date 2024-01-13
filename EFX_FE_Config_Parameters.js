/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search','N/runtime'], function (search,runtime) {

    function getParameters() {


        var buscaConfiguracion = search.create({
            type: 'customrecord_efx_fe_configuracion',
            filters: [['isinactive', search.Operator.IS, 'F']],
            columns: [
                search.createColumn({name: 'custrecord_efx_fe_configura_folder'}),
                search.createColumn({name: 'internalid'}),
            ]
        });
        var objetoCofiguracion = {
            internalid: '',
            custrecord_efx_fe_configura_folder: '',
        }
        buscaConfiguracion.run().each(function (result) {
            objetoCofiguracion.internalid = result.getValue({name: 'internalid'}) || '';
            objetoCofiguracion.custrecord_efx_fe_configura_folder = result.getValue({name: 'custrecord_efx_fe_configura_folder'}) || '';
            return true;
        });

        return objetoCofiguracion;

    }
    return {
        getParameters: getParameters,
    };
});