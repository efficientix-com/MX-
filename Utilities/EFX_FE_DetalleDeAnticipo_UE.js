/**
*@NApiVersion 2.x
*@NScriptType UserEventScript
*/

define(['N/log', 'N/record', 'N/search'], function (log, modRecord, search) {
    function afterSubmit(context) {

        var newRec = context.newRecord;
        var recId = newRec.id;
        var recType = newRec.type;

        var anticipo = newRec.getValue({
            fieldId: 'custrecord_efx_ap_d_ap'
        })

        var apImporte = 0;
        var apImporteConsumido = 0;
        var detalleImporte = 0;

        log.audit({ title: 'recId', details: recId });
        log.audit({ title: 'recType', details: recType });
        log.audit({ title: 'context.type', details: context.type });
        log.audit({ title: 'context.type', details: context.type });

        if (context.type == context.UserEventType.CREATE || context.type == context.UserEventType.EDIT) {

            if (anticipo) {

                section = 'Get EFX FE - Detalle Anticipo Pagos';
                {
                    var anticioDetallePagoObj = {};

                    var filters = [
                        ['isinactive', search.Operator.IS, 'F'], 'and',
                        ['custrecord_efx_ap_d_ap', search.Operator.ANYOF, anticipo], 'and',
                        ['custrecord_efx_fe_ap_d_importe', search.Operator.ISNOTEMPTY, null]
                    ];

                    var result = search.create({
                        type: 'customrecord_efx_fe_ap_detalle',
                        filters: filters,
                        columns: [
                            { name: 'custrecord_efx_fe_ap_d_tran' },
                            { name: 'custrecord_efx_fe_ap_d_importe' },
                            { join: 'custrecord_efx_ap_d_ap', name: 'custrecord_efx_fe_ap_importe' },
                            { join: 'custrecord_efx_ap_d_ap', name: 'custrecord_efx_fe_ap_importe_consumido' }
                        ]
                    });

                    var resultData = result.run();
                    var start = 0;
                    do {

                        var resultSet = resultData.getRange(start, start + 1000);
                        if (resultSet && resultSet.length > 0) {
                            for (var i = 0; i < resultSet.length; i++) {

                                var id = resultSet[i].id;
                                var custrecord_efx_fe_ap_d_tran = resultSet[i].getValue({ name: 'custrecord_efx_fe_ap_d_tran' }) || '';
                                var custrecord_efx_fe_ap_d_importe = parseFloat(resultSet[i].getValue({ name: 'custrecord_efx_fe_ap_d_importe' })) || 0;
                                detalleImporte += custrecord_efx_fe_ap_d_importe;

                                var custrecord_efx_fe_ap_importe = parseFloat(resultSet[i].getValue({ join: 'custrecord_efx_ap_d_ap', name: 'custrecord_efx_fe_ap_importe' })) || 0;
                                if (!apImporte) {
                                    apImporte = custrecord_efx_fe_ap_importe;
                                }
                                var custrecord_efx_fe_ap_importe_consumido = parseFloat(resultSet[i].getValue({ join: 'custrecord_efx_ap_d_ap', name: 'custrecord_efx_fe_ap_importe' })) || 0;
                                if (apImporteConsumido) {
                                    apImporteConsumido = custrecord_efx_fe_ap_importe_consumido;
                                }

                            }
                        }
                        start += 1000;

                    } while (resultSet && resultSet.length == 1000);
                }

                log.audit({ title: 'apImporte', details: JSON.stringify(apImporte) });
                log.audit({ title: 'apImporteConsumido', details: JSON.stringify(apImporteConsumido) });
                log.audit({ title: 'detalleImporte', details: JSON.stringify(detalleImporte) });

                var importe_new = apImporte - detalleImporte;
                log.audit({ title: 'importe_new', details: JSON.stringify(importe_new) });

                //Update Anticipo Pago
                var rec = modRecord.load({
                    id: anticipo,
                    type: 'customrecord_efx_fe_anticipo_pago'
                });

                rec.setValue({
                    fieldId: 'custrecord_efx_fe_ap_importe_consumido',
                    value: detalleImporte
                });

                if (importe_new == 0) {
                    rec.setValue({
                        fieldId: 'custrecord_efx_fe_ap_completado',
                        value: true
                    });
                }

                var apId = rec.save({
                    enableSourcing: true,
                    igonoreMandatoryFields: true
                });

            }
        }

    }

    return {
        afterSubmit: afterSubmit
    }

});