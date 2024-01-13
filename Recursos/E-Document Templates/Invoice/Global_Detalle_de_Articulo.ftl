<?xml version="1.0" encoding="utf-8"?>

<#setting locale = "es_MX">

<#if transaction.custbody_efx_fe_zona_horaria?has_content>
    <#setting time_zone= "${transaction.custbody_efx_fe_zona_horaria}">
<#else>
    <#setting time_zone= "America/Mexico_City">
</#if>



<#function getAttrPair attr value>
    <#if value?has_content>
        <#assign result="${attr}=\"${value}\"">
        <#return result>
    </#if>
</#function>

<#function getNodePair node attr value>
    <#if value?has_content>
        <#assign result="<${node} ${attr}=\"${value}\" />">
        <#return result>
    </#if>
</#function>


<#if custom.multiCurrencyFeature == "true">
    <#assign "currencyCode" = transaction.currencysymbol>
    <#if transaction.exchangerate == 1>
        <#assign exchangeRate = 1>
    <#else>
        <#assign exchangeRate = transaction.exchangerate?string["0.000000"]>
    </#if>
<#else>
    <#assign "currencyCode" = "MXN">
    <#assign exchangeRate = 1>
</#if>
<#if custom.oneWorldFeature == "true">
    <#assign customCompanyInfo = transaction.subsidiary>
<#else>
    <#assign "customCompanyInfo" = companyinformation>
</#if>
<#if customer.isperson == "T">
    <#assign customerName = customer.firstname + ' ' + customer.lastname>
<#else>
    <#assign "customerName" = customer.companyname>
</#if>
<#assign "summary" = custom.summary>
<#assign "total_traslados_ivacero" = 0>
<#assign "tiene_impuesto" = 0>
<#assign "satCodes" = custom.satcodes>
<#assign "totalAmount" = summary.subtotal - summary.totalDiscount>
<#assign "companyTaxRegNumber" = custom.companyInfo.rfc>
<#assign paymentMethod = satCodes.paymentMethod>
<#assign paymentTerm = satCodes.paymentTerm>

<#assign desglose_json_cabecera = transaction.custbody_efx_fe_tax_json>
<#assign desglose_cab = desglose_json_cabecera?eval>
<#assign "ComercioE" = transaction.custbody_efx_fe_comercio_exterior>
<#assign "esGlobal" = transaction.custbody_efx_fe_gbl_ismirror>
<#assign "CPorte" = transaction.custbody_efx_fe_carta_porte>
<#assign "LeyendaFiscal" = transaction.custbody_efx_fe_leyendafiscal>
<#assign "ImpLocal" = transaction.custbody_efx_fe_local_tax>
<#assign "impuestoLineashipp" = 0>

<cfdi:Comprobante
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        <#if ComercioE == true>
            xmlns:cce11="http://www.sat.gob.mx/ComercioExterior11"
        </#if>
        xmlns:cfdi="http://www.sat.gob.mx/cfd/3"
        <#if ImpLocal == true>
            xmlns:implocal="http://www.sat.gob.mx/implocal"
        </#if>
        <#if CPorte == true>
            xmlns:cartaporte20="http://www.sat.gob.mx/CartaPorte20"
        </#if>
        <#if LeyendaFiscal == true>
            xmlns:leyendasFisc="http://www.sat.gob.mx/leyendasFiscales"
        </#if>


        <#assign xsischemalocation_CPorte = "">
        <#assign xsischemalocation_CE = "">
        <#assign xsischemalocation_add = "">
        <#assign xsischemalocation_imploc = "">
        <#assign xsischemalocation_leyfisc = "">

        <#if LeyendaFiscal == true>
            <#assign xsischemalocation_leyfisc = " http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv32.xsd http://www.sat.gob.mx/leyendasFiscales http://www.sat.gob.mx/sitio_internet/cfd/leyendasFiscales/leyendasFisc.xsd">
        </#if>

        <#if CPorte == true>

            <#assign "json_direccion_field_CP" = transaction.custbody_ex_fe_cp_json_dir>
            <#if json_direccion_field_CP?has_content>
                <#assign "json_direccion_CP" = json_direccion_field_CP?eval>
            </#if>
            <#assign xsischemalocation_CPorte = " http://www.sat.gob.mx/CartaPorte20 http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte/CartaPorte20.xsd">

        </#if>


        <#assign "Add_name" = customer.custentity_efx_fe_default_addenda>
        <#if Add_name=="Liverpool" || Add_name=="HEB">
            <#assign xsischemalocation_add = " http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd http://www.sat.gob.mx/detallista http://www.sat.gob.mx/sitio_internet/cfd/detallista/detallista.xsd">

        <#elseif ComercioE == true>

            <#assign "CEreceptorNumR" = transaction.custbody_efx_fe_ce_recep_num_reg>
            <#assign "CEreceptorResidF" = transaction.custbody_efx_fe_ce_rec_residenciaf>
            <#assign xsischemalocation_CE = " http://www.sat.gob.mx/ComercioExterior11 http://www.sat.gob.mx/sitio_internet/cfd/ComercioExterior11/ComercioExterior11.xsd">
        <#elseif ImpLocal == true>
            <#assign xsischemalocation_imploc = " http://www.sat.gob.mx/implocal http://www.sat.gob.mx/sitio_internet/cfd/implocal/implocal.xsd">
        </#if>
        <#assign schemaLocation = "http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"+xsischemalocation_CPorte+xsischemalocation_CE+xsischemalocation_add+xsischemalocation_imploc+xsischemalocation_leyfisc>

        xsi:schemaLocation="${schemaLocation}"


        <#if transaction.custbody_efx_fe_actual_date == true>
            <#assign aDateTime = .now>
            <#assign aDate = aDateTime?date>
            Fecha="${aDate?string("yyyy-MM-dd")}T${aDate?string("HH:mm:ss")}"
        <#else>
            <#if transaction.custbody_efx_fe_actual_hour?has_content>
                Fecha="${transaction.trandate?string.iso_nz}T${transaction.custbody_efx_fe_actual_hour}"
            <#else>
                <#assign aDateTime = .now>
                <#assign aDate = aDateTime?date>
                Fecha="${transaction.trandate?string.iso_nz}T${aDate?string("HH:mm:ss")}"
            </#if>
        </#if>




        <#assign serie_parteuno = transaction.tranid?keep_before("-")>
        <#assign folio_transaction = transaction.tranid?keep_after("-")>

        <#assign serie_parteuno = "">
        <#assign folio_transaction = "">
        <#assign tranidd = transaction.tranid?length>
        <#assign traniddpos = transaction.tranid>


        <#list 0..tranidd as x>
            <#if traniddpos[x] != "-">
                <#assign esnum = traniddpos[x]?matches("\\d+")>
                <#if esnum>
                    <#assign folio_transaction = folio_transaction+traniddpos[x]>
                <#else>
                    <#assign serie_parteuno = serie_parteuno+traniddpos[x]>
                </#if>
            </#if>
        </#list>


        ${getAttrPair("Folio",folio_transaction)}
        ${getAttrPair("Serie",serie_parteuno)}
        ${getAttrPair("FormaPago",(paymentMethod)!"")!""}
        <#if transaction.custbody_efx_fe_gbl_lexpedicion?has_content>
            LugarExpedicion="${transaction.custbody_efx_fe_gbl_lexpedicion}"
        <#else>
            LugarExpedicion="${customCompanyInfo.zip}"
        </#if>
        ${getAttrPair("MetodoPago",(paymentTerm)!"")!""}
        TipoCambio="${exchangeRate}"
        Moneda="${currencyCode}"
        <#assign total_ieps = desglose_cab.ieps_total?number>
        <#assign total_ivasubtotal = 0>
        <#assign total_desc_cabecera = desglose_cab.descuentoSinImpuesto?number>

        <#list custom.items as customItem>
            <#assign "item" = transaction.item[customItem.line?number]>
            <#if customItem.type != "Discount">
                <#assign desglose_json = item.custcol_efx_fe_tax_json>
                <#assign desglose = desglose_json?eval>
            </#if>
            <#if desglose.iva.name?has_content>
                <#assign total_ivasubtotal = total_ivasubtotal + desglose.iva.importe?number>
            </#if>
        </#list>

        <#assign desglosa_ieps = customer.custentity_efx_cmp_registra_ieps>
        <#assign "descuentototal"= 0>
        <#list custom.items as customItem>
            <#assign "lineastotales"= lineastotales+1>
            <#assign "item" = transaction.item[customItem.line?number]>
            <#if customItem.type != "Discount">
                <#if item.custcol_efx_fe_gbl_sendtype == false>
                    <#assign desglose_json = item.custcol_efx_fe_tax_json>
                    <#assign desglose = desglose_json?eval>
                    <#assign "descuentototal"= descuentototal + desglose.descuentoSinImpuesto?number>
                </#if>

            </#if>
        </#list>
        SubTotal="${(transaction.custbody_efx_fe_gbl_subtotal?number + descuentototal)?string["0.00"]}"
        <#assign total_xml = (transaction.total + transaction.custbody_efx_fe_gbl_totaltax?number)?string["0.00"]>
        Total="${total_xml}"
        TipoDeComprobante="${satCodes.proofType}"
        Version="3.3"
        Descuento="${descuentototal?string["0.00"]}">
    <#if transaction.recmachcustrecord_mx_rcs_orig_trans?has_content>

        <#list custom.relatedCfdis.types as cfdiRelType>
            <cfdi:CfdiRelacionados TipoRelacion="${cfdiRelType}">
                <#assign "cfdisArray" = custom.relatedCfdis.cfdis["k"+cfdiRelType?index]>
                <#if cfdisArray?has_content>
                    <#list cfdisArray as cfdiIdx>
                        <cfdi:CfdiRelacionado  UUID="${transaction.recmachcustrecord_mx_rcs_orig_trans[cfdiIdx.index?number].custrecord_mx_rcs_uuid}" />
                    </#list>
                </#if>
            </cfdi:CfdiRelacionados>
        </#list>
    </#if>
    <cfdi:Emisor ${getAttrPair("Nombre", customCompanyInfo.legalname)} RegimenFiscal="${satCodes.industryType}" Rfc="${companyTaxRegNumber}" />
    <cfdi:Receptor ${getAttrPair("Nombre", customerName)}
            Rfc="${customer.custentity_mx_rfc}"
            UsoCFDI="${satCodes.cfdiUsage}" />
    <#assign total_impuestos_t_ivas = 0>
    <#assign "obj_totales_imp"= {}>
    <#assign "obj_totales_imp_ret"= {}>
    <#assign "lineastotales"= 0>
    <#assign "imp_traslados_envio"= 0>

    <cfdi:Conceptos>
        <#list custom.items as customItem>
            <#assign "item" = transaction.item[customItem.line?number]>
            <#assign "lineabajo" = customItem.line?number + 1>
            <#assign "taxes" = customItem.taxes>
            <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
            <#if customItem.type == "Group"  || customItem.type == "Kit">
                <#assign "itemSatUnitCode" = "H87">
            <#else>
                <#assign "itemSatUnitCode" = (customItem.satUnitCode)!"">

            </#if>
            <#if customItem.type != "Discount">
                <#if item.custcol_efx_fe_gbl_sendtype == false>
                <#assign desglose_json = item.custcol_efx_fe_tax_json>
                <#assign desglose = desglose_json?eval>


            <cfdi:Concepto
                    Cantidad="${item.quantity?string["0.000000"]}"
                    ${getAttrPair("ClaveProdServ",(itemSatCodes.itemCode)!"")!""}
                    ${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
                    Descripcion="${item.description?replace("<br />","")}"
                    Importe="${customItem.amount?number?string["0.00"]}"
                    NoIdentificacion="Transaccion: ${item.custcol_efx_fe_gbl_related_tran}"
                    ValorUnitario="${customItem.rate?number?string["0.00"]}"
                    Descuento="${desglose.descuentoSinImpuesto?number?string["0.00"]}">
                <#if customItem.amount?number != desglose.descuentoSinImpuesto?number>

                <cfdi:Impuestos>
                    <#if desglose.iva.name?has_content || desglose.ieps.name?has_content || desglose.exento.name?has_content>
                        <cfdi:Traslados>
                            <#if desglose.iva.name?has_content>
                                <#if obj_totales_imp?has_content>
                                    <#assign "conteos" = 0>
                                    <#list obj_totales_imp?keys as key>
                                        <#if key?number == desglose.iva.rate?number>
                                            <#assign "conteos" = 1>

                                            <#assign "total_rate" = obj_totales_imp[key]?number + desglose.iva.importe?number>
                                            <#assign "obj_totales_imp"= obj_totales_imp + {desglose.iva.rate : total_rate?number}>

                                        </#if>
                                    </#list>
                                    <#if conteos == 0>
                                        <#assign "obj_totales_imp"= obj_totales_imp + {desglose.iva.rate : desglose.iva.importe?number}>
                                    </#if>
                                <#else>
                                    <#assign "obj_totales_imp"= obj_totales_imp + {desglose.iva.rate : desglose.iva.importe?number}>
                                </#if>
                                <#assign rate_b = desglose.iva.rate?number / 100>
                                <cfdi:Traslado Base="${desglose.iva.base_importe?number?string["0.00"]}" Importe="${desglose.iva.importe?number?string["0.00"]}" Impuesto="002" TasaOCuota="${desglose.iva.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />
                            </#if>

                            <#if desglose.ieps.name?has_content>
                                <#if obj_totales_imp?has_content>
                                    <#assign "conteos" = 0>
                                    <#list obj_totales_imp?keys as key>

                                        <#if key == desglose.ieps.rate>
                                            <#assign "conteos" = 1>

                                            <#assign "total_rate" = obj_totales_imp[key]?number + desglose.ieps.importe?number>
                                            <#assign "obj_totales_imp"= obj_totales_imp + {desglose.ieps.rate : total_rate?number}>

                                        </#if>
                                        <#assign "keyses"= obj_totales_imp[key]>
                                    </#list>
                                    <#if conteos == 0>
                                        <#assign "obj_totales_imp"= obj_totales_imp + {desglose.ieps.rate : desglose.ieps.importe?number}>
                                    </#if>
                                <#else>
                                    <#assign "obj_totales_imp"= obj_totales_imp + {desglose.ieps.rate : desglose.ieps.importe?number}>
                                    <#list obj_totales_imp?keys as key>
                                        <#assign "keyses"= obj_totales_imp[key]>
                                    </#list>
                                </#if>
                                <cfdi:Traslado Base="${desglose.ieps.base_importe?number?string["0.00"]}" Importe="${desglose.ieps.importe?number?string["0.00"]}" Impuesto="002" TasaOCuota="${desglose.ieps.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />
                            </#if>

                            <#if desglose.exento.name?has_content>
                                <cfdi:Traslado Base="${desglose.exento.base_importe?number?string["0.00"]}" Impuesto="002" TipoFactor="Exento" />
                            </#if>

                        </cfdi:Traslados>
                    </#if>


                    <#if desglose.retenciones.name?has_content>
                        <cfdi:Retenciones>
                            <#if obj_totales_imp_ret?has_content>
                                <#assign "conteos" = 0>
                                <#list obj_totales_imp_ret?keys as key>

                                    <#if key == desglose.retenciones.rate>
                                        <#assign "conteos" = 1>

                                        <#assign "total_rate" = obj_totales_imp_ret[key]?number + desglose.retenciones.importe?number>
                                        <#assign "obj_totales_imp_ret"= obj_totales_imp_ret + {desglose.retenciones.rate : total_rate?number}>

                                    </#if>
                                </#list>
                                <#if conteos == 0>
                                    <#assign "obj_totales_imp_ret"= obj_totales_imp_ret + {desglose.retenciones.rate : desglose.retenciones.importe?number}>
                                </#if>
                            <#else>
                                <#assign "obj_totales_imp_ret"= obj_totales_imp_ret + {desglose.retenciones.rate : desglose.retenciones.importe?number}>
                            </#if>
                            <cfdi:Retencion Base="${desglose.retenciones.base_importe?number?string["0.00"]}" Importe="${(desglose.retenciones.importe?number)?string["0.00"]}" Impuesto="002" TasaOCuota="${desglose.retenciones.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />

                        </cfdi:Retenciones>
                    </#if>
                </cfdi:Impuestos>
                </#if>

                ${getNodePair("cfdi:InformacionAduanera", "NumeroPedimento" ,item.custcol_mx_txn_line_sat_cust_req_num)}
                ${getNodePair("cfdi:CuentaPredial", "Numero" ,item.custcol_mx_txn_line_sat_cadastre_id)}
                <#if customItem.parts?has_content>
                    <#list customItem.parts as part>
                        <#assign "partItem" = transaction.item[part.line?number]>
                        <#assign "partSatCodes" = satCodes.items[part.line?number]>
                        <cfdi:Parte Cantidad="${partItem.quantity?string["0.0"]}" ClaveProdServ="${partSatCodes.itemCode}" Descripcion="${partItem.description?replace("<br />","")}" Importe="${part.amount?number?string["0.00"]}" ValorUnitario="${part.rate?number?string["0.00"]}"/>
                    </#list>
                </#if>
            </cfdi:Concepto>
                <#else>
                <cfdi:Concepto
                        Cantidad="1.000000"
                        ${getAttrPair("ClaveProdServ",(itemSatCodes.itemCode)!"")!""}
                        ${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
                        Descripcion="${item.description?replace("<br />","")}"
                        Importe="${customItem.amount?number?string["0.00"]}"
                        NoIdentificacion="Transaccion: ${item.custcol_efx_fe_gbl_related_tran}"
                        ValorUnitario="${customItem.rate?number?string["0.00"]}"
                        Descuento="0.00">
                    <#assign impuesto_envio_rate = item.custcol_efx_fe_gbl_taxrateen>
                    <#assign tasa_envio = impuesto_envio_rate?number / 100>


                    <cfdi:Impuestos>
                        <cfdi:Traslados>
                            <#if obj_totales_imp?has_content>
                                <#assign "conteos" = 0>
                                <#list obj_totales_imp?keys as key>
                                    <#if key?number == impuesto_envio_rate?number>
                                        <#assign "conteos" = 1>

                                        <#assign "total_rate" = obj_totales_imp[key]?number + item.custcol_efx_fe_taxtotal_gbl?number>
                                        <#assign "obj_totales_imp"= obj_totales_imp + {impuesto_envio_rate : total_rate?number}>

                                    </#if>
                                </#list>
                                <#if conteos == 0>
                                    <#assign "obj_totales_imp"= obj_totales_imp + {impuesto_envio_rate : item.custcol_efx_fe_taxtotal_gbl?number}>
                                </#if>
                            <#else>
                                <#assign "obj_totales_imp"= obj_totales_imp + {impuesto_envio_rate : item.custcol_efx_fe_taxtotal_gbl?number}>
                            </#if>
                            <cfdi:Traslado Base="${customItem.amount?number?string["0.00"]}" Importe="${item.custcol_efx_fe_taxtotal_gbl?number?string["0.00"]}" Impuesto="002" TasaOCuota="${tasa_envio?number?string["0.000000"]}" TipoFactor="Tasa" />
                        </cfdi:Traslados>
                    </cfdi:Impuestos>
                </cfdi:Concepto>

                </#if>
            </#if>
        </#list>

    </cfdi:Conceptos>


    <#assign total_tras = desglose_cab.ieps_total_gbl?number + desglose_cab.iva_total_gbl?number + desglose_cab.retencion_total_gbl?number>
    <#assign total_trasladados_monto = desglose_cab.ieps_total_gbl?number + desglose_cab.iva_total_gbl?number>


    <#assign "total_retenidos" = 0>
    <#list obj_totales_imp_ret as rets_rate, rets_total>
        <#assign "total_retenidos" = total_retenidos?number + rets_total?number>
    </#list>

    <#assign "total_traslados" = 0>
    <#list obj_totales_imp as tras_rate, tras_total>
        <#assign "total_traslados" = total_traslados?number + tras_total?number>
    </#list>

    <#if obj_totales_imp?has_content && obj_totales_imp_ret?has_content>
    <cfdi:Impuestos TotalImpuestosRetenidos="${total_retenidos?string["0.00"]}" TotalImpuestosTrasladados="${total_traslados?string["0.00"]}">
        <#elseif obj_totales_imp?has_content>
        <cfdi:Impuestos TotalImpuestosTrasladados="${total_traslados?string["0.00"]}">
            </#if>

            <#if obj_totales_imp_ret?has_content>
                <cfdi:Retenciones>

                    <#list obj_totales_imp_ret as rete_rate, rete_total>
                        <#assign rete_ratenum = rete_rate?number>
                        <#assign rete_tasaocuota = rete_ratenum/100>
                        <cfdi:Retencion Importe="${rete_total?number?string["0.00"]}" Impuesto="002" />
                    </#list>
                </cfdi:Retenciones>
            </#if>

            <#if obj_totales_imp?has_content>
                <cfdi:Traslados>

                    <#list obj_totales_imp as Ieps_rate, Ieps_total>
                        <#assign ieps_ratenum = Ieps_rate?number>
                        <#assign ieps_tasaocuota = ieps_ratenum/100>
                        <#if Ieps_rate != "16" && Ieps_rate != "0" && Ieps_rate != "16.0">
                            <cfdi:Traslado Importe="${Ieps_total?number?string["0.00"]}" Impuesto="002" TasaOCuota="${ieps_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                        </#if>
                    </#list>


                    <#list obj_totales_imp as Iva_rate, Iva_total>
                        <#assign iva_ratenum = Iva_rate?number>
                        <#assign iva_tasaocuota = iva_ratenum/100>
                        <#if Iva_rate == "16" || Iva_rate == "0" || Iva_rate == "16.0">
                            <cfdi:Traslado Importe="${Iva_total?number?string["0.00"]}" Impuesto="002" TasaOCuota="${iva_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                        </#if>
                    </#list>
                </cfdi:Traslados>
            </#if>
            </cfdi:Impuestos>


                        <#assign "Addenda" = transaction.custbody_mx_cfdi_sat_addendum>

                        <#if ComercioE == true || CPorte == true || LeyendaFiscal == true>
                        <cfdi:Complemento>
                            </#if>
                            <#if ComercioE == true>
                            <#assign "CertOrigen" = transaction.custbody_efx_fe_ce_certificado_origen>
                            <#assign "CEIncoterm" = transaction.custbody_efx_fe_ce_incoterm.custrecord_efx_fe_ce_incot_sat>
                            <#assign "CESubdivision" = transaction.custbody_efx_fe_ce_subdivision>
                            <#assign "CETipoCUSD" = transaction.custbody_efx_fe_ce_exchage>
                            <#assign "CETotalUSD" = transaction.custbody_efx_fe_ce_totalusd>
                            <#assign "CENcertOrigen" = transaction.custbody_efx_fe_ce_ncertificado_origen>
                            <#assign "CEClavePedimento" = transaction.custbody_efx_fe_ce_clavepedimento>
                            <#assign "CENExpConfiable" = transaction.custbody_efx_fe_numexp_confiable>
                            <#assign "CEObservaciones" = transaction.custbody_efx_fe_ce_observaciones>
                            <#assign "CEPropNumreg" = transaction.custbody_efx_fe_ce_propietario_numreg>
                            <#assign "CEpropResidenciaF" = transaction.custbody_efx_fe_ce_p_residenciafiscal>

                            <#assign "CEdestinatario" = transaction.custbody_efx_fe_ce_destinatario_name>
                            <#assign "CEdestNumreg" = transaction.custbody_efx_fe_ce_destinatario_name.custrecord_efx_fe_cedd_numregidtrib>
                            <#assign "CEdestName" = transaction.custbody_efx_fe_ce_destinatario_name.name>


                            <#assign "json_direccion_field" = transaction.custbody_efx_fe_dirjson_emisor>
                            <#if json_direccion_field?has_content>
                                <#assign "json_direccion" = json_direccion_field?eval>
                            </#if>


                            <cce11:ComercioExterior Version="1.1"
                                                    TipoOperacion="2"
                                                    ClaveDePedimento="${CEClavePedimento}"
                                                    CertificadoOrigen="${CertOrigen}"
                                    <#if CertOrigen != "0">
                                        NumCertificadoOrigen="${CENcertOrigen}"
                                    </#if>
                                    <#if CENExpConfiable?has_content>
                                        NumeroExportadorConfiable="${CENExpConfiable}"
                                    </#if>
                                                    Incoterm="${CEIncoterm}"
                                                    Subdivision="${CESubdivision}"
                                    <#if CEObservaciones?has_content>
                                        Observaciones="${CEObservaciones}"
                                    </#if>
                                                    TipoCambioUSD="${CETipoCUSD?number?string["0.0000"]}"
                                                    TotalUSD="${CETotalUSD?replace(',','')?number?string["0.00"]}">
                                <#if json_direccion_field?has_content>
                                    <cce11:Emisor>
                                        <cce11:Domicilio Calle="${json_direccion.emisor.Calle}"
                                                <#if json_direccion.emisor.NumeroExterior?has_content>
                                                    NumeroExterior="${json_direccion.emisor.NumeroExterior}"
                                                </#if>
                                                <#if json_direccion.emisor.NumeroInterior?has_content>
                                                    NumeroInterior="${json_direccion.emisor.NumeroInterior}"
                                                </#if>
                                                         Colonia="${json_direccion.emisor.Colonia}"
                                                <#if json_direccion.emisor.Localidad?has_content>
                                                    Localidad="${json_direccion.emisor.Localidad}"
                                                </#if>
                                                <#if json_direccion.emisor.Referencia?has_content>
                                                    Referencia="${json_direccion.emisor.Referencia}"
                                                </#if>
                                                         Municipio="${json_direccion.emisor.Municipio}"
                                                         Estado="${json_direccion.emisor.Estado}"
                                                         Pais="${json_direccion.emisor.Pais}"
                                                         CodigoPostal="${json_direccion.emisor.CodigoPostal}"/>
                                    </cce11:Emisor>

                                    <#if CEPropNumreg?has_content && CEpropResidenciaF?has_content>
                                        <cce11:Propietario NumRegIdTrib="${CEPropNumreg}" ResidenciaFiscal="${CEpropResidenciaF}"/>
                                    </#if>
                                    <cce11:Receptor>
                                        <cce11:Domicilio Calle="${json_direccion.receptor.Calle}"
                                                <#if json_direccion.receptor.NumeroExterior?has_content>
                                                    NumeroExterior="${json_direccion.receptor.NumeroExterior}"
                                                </#if>
                                                <#if json_direccion.receptor.NumeroInterior?has_content>
                                                    NumeroInterior="${json_direccion.receptor.NumeroInterior}"
                                                </#if>
                                                <#if json_direccion.receptor.Colonia?has_content>
                                                    Colonia="${json_direccion.receptor.Colonia}"
                                                </#if>
                                                <#if json_direccion.receptor.Localidad?has_content>
                                                    Localidad="${json_direccion.receptor.Localidad}"
                                                </#if>
                                                <#if json_direccion.receptor.Referencia?has_content>
                                                    Referencia="${json_direccion.receptor.Referencia}"
                                                </#if>
                                                <#if json_direccion.receptor.Municipio?has_content>
                                                    Municipio="${json_direccion.receptor.Municipio}"
                                                </#if>
                                                         Estado="${json_direccion.receptor.Estado}"
                                                         Pais="${json_direccion.receptor.Pais}"
                                                         CodigoPostal="${json_direccion.receptor.CodigoPostal}"/>
                                    </cce11:Receptor>
                                    <#if CEdestinatario?has_content>
                                        <cce11:Destinatario NumRegIdTrib="${CEdestNumreg}" Nombre="${CEdestName}">
                                            <cce11:Domicilio Calle="${json_direccion.destinatario.Calle}"
                                                    <#if json_direccion.destinatario.NumeroExterior?has_content>
                                                        NumeroExterior="${json_direccion.destinatario.NumeroExterior}"
                                                    </#if>
                                                    <#if json_direccion.destinatario.NumeroInterior?has_content>
                                                        NumeroInterior="${json_direccion.destinatario.NumeroInterior}"
                                                    </#if>
                                                             Colonia="${json_direccion.destinatario.Colonia}"
                                                    <#if json_direccion.destinatario.Localidad?has_content>
                                                        Localidad="${json_direccion.destinatario.Localidad}"
                                                    </#if>
                                                             Municipio="${json_direccion.destinatario.Municipio}"
                                                             Estado="${json_direccion.destinatario.Estado}"
                                                             Pais="${json_direccion.destinatario.Pais}"
                                                             CodigoPostal="${json_direccion.destinatario.CodigoPostal}"/>
                                        </cce11:Destinatario>
                                    </#if>
                                </#if>
                                <cce11:Mercancias>
                                    <#list custom.items as customItem>
                                        <#assign "item" = transaction.item[customItem.line?number]>
                                        <cce11:Mercancia NoIdentificacion="${item.item}" FraccionArancelaria="${item.custcol_efx_fe_ce_farancel_code}" CantidadAduana="${item.custcol_efx_fe_ce_cant_aduana?replace(',','')?number?string["0.000"]}" UnidadAduana="${item.custcol_efx_fe_unit_code_ce}" ValorUnitarioAduana="${item.custcol_efx_fe_ce_val_uni_aduana?replace(',','')?number?string["0.00"]}" ValorDolares="${item.custcol_efx_fe_ce_val_dolares?replace(',','')?number?string["0.00"]}">
                                            <#if item.custcol_efx_fe_ce_des_especificas?has_content>
                                                <cce11:DescripcionesEspecificas Marca="${item.custcol_efx_fe_ce_des_especificas}" NumeroSerie="${item.custcol_efx_fe_ce_des_numero_serie}" Modelo="${item.custcol_efx_fe_ce_des_modelo}"/>
                                            </#if>
                                        </cce11:Mercancia>

                                    </#list>
                                </cce11:Mercancias>
                            </cce11:ComercioExterior>
                        </cfdi:Complemento>
                        </#if>

                        <#if CPorte == true>
                            <#assign aDateTime = .now>
                            <#assign aDate = aDateTime?date>
                            <#assign "TranspInternac" = transaction.custbody_efx_fe_transpinternac>
                            <#assign "EntradaSalidaMerc" = transaction.custbody_efx_fe_cp_entradasalidamerc>
                            <#assign "ViaEntradaSalida" = transaction.custbody_efx_fe_cp_viaentradasalida>

                            <#assign "TotalDistRec" = 0>
                            <#list transaction.recmachcustrecord_efx_fe_cp_ubicaciones as ubicaciones>
                                <#if ubicaciones.custrecord_efx_cp_tipoubicacion == "Destino">
                                    <#assign "TotalDistRec" = TotalDistRec + ubicaciones.custrecord_efx_cp_distanciarecorrida?number>
                                </#if>
                            </#list>

                            <cartaporte20:CartaPorte
                                    Version="2.0"
                                    <#if TranspInternac=="Sí">
                                        <#if EntradaSalidaMerc?has_content>
                                            TranspInternac="${TranspInternac}"
                                            EntradaSalidaMerc="${EntradaSalidaMerc}"
                                            PaisOrigenDestino="${transaction.custbody_efx_fe_cp_paisordes}"
                                            ViaEntradaSalida="${ViaEntradaSalida.custrecord_efx_fe_cp_sat_code}"
                                        </#if>
                                    <#else>
                                        TranspInternac="${TranspInternac}"
                                    </#if>
                                    <#if TotalDistRec gt 0>
                                TotalDistRec="${TotalDistRec}"
                                    </#if>>

                                <#assign idorigenmerca = "">
                                <#assign iddestinomerca = "">
                                <cartaporte20:Ubicaciones>
                                    <#assign conteoubicacion = 0>
                                    <#list transaction.recmachcustrecord_efx_fe_cp_ubicaciones as ubicaciones>
                                        <#assign TipoUbicacion = ubicaciones.custrecord_efx_cp_tipoubicacion>
                                        <#assign IDUbicacion = ubicaciones.custrecord_efx_fe_cp_idubicacion>
                                        <#assign FechaHoraSalidaLlegada = ubicaciones.custrecord_efx_fe_cp_fechahora>
                                        <#assign DistanciaRecorrida = ubicaciones.custrecord_efx_cp_distanciarecorrida>
                                        <#assign NombreCliente = ubicaciones.custrecord_efx_fe_cp_cli_dir>
                                        <#assign NumRegIdTrib = "">
                                        <#assign ResidenciaFiscal = "">
                                        <#if TipoUbicacion=="Origen">
                                            <#assign RFCRemitenteDestinatario = json_direccion_CP.emisor.Rfc>
                                            <#assign NombreRemitenteDestinatario = json_direccion_CP.emisor.Nombre>
                                            <#assign idorigenmerca = IDUbicacion>
                                        <#else>
                                            <#assign NumRegIdTrib = transaction.custbody_efx_fe_ce_recep_num_reg>
                                            <#assign ResidenciaFiscal = transaction.custbody_efx_fe_ce_rec_residenciaf>
                                            <#assign iddestinomerca = IDUbicacion>
                                            <#if NumRegIdTrib?has_content>
                                                <#assign RFCRemitenteDestinatario = "">
                                            <#else>
                                                <#assign RFCRemitenteDestinatario = json_direccion_CP.receptor.Rfc>
                                            </#if>
                                            <#assign NombreRemitenteDestinatario = json_direccion_CP.receptor.Nombre>

                                        </#if>

                                        <cartaporte20:Ubicacion TipoUbicacion="${TipoUbicacion}" IDUbicacion="${IDUbicacion}" ${getAttrPair("RFCRemitenteDestinatario", RFCRemitenteDestinatario)} NombreRemitenteDestinatario="${NombreRemitenteDestinatario}" ${getAttrPair("NumRegIdTrib", NumRegIdTrib)} ${getAttrPair("ResidenciaFiscal", ResidenciaFiscal)} FechaHoraSalidaLlegada="${FechaHoraSalidaLlegada}" ${getAttrPair("DistanciaRecorrida", DistanciaRecorrida)}>
                                            <#list json_direccion_CP.CPUbicaciones as Domicilio>
                                                <#if conteoubicacion==0 && Domicilio.Domicilio.id=="emisor">
                                                    <cartaporte20:Domicilio ${getAttrPair("Calle", Domicilio.Domicilio.Calle)} ${getAttrPair("NumeroExterior", Domicilio.Domicilio.NumeroExterior)} ${getAttrPair("NumeroInterior", Domicilio.Domicilio.NumeroInterior)} ${getAttrPair("Colonia", Domicilio.Domicilio.Colonia)} ${getAttrPair("Localidad", Domicilio.Domicilio.Localidad)} ${getAttrPair("Referencia", Domicilio.Domicilio.Referencia)} ${getAttrPair("Municipio", Domicilio.Domicilio.Municipio)} ${getAttrPair("Estado", Domicilio.Domicilio.Estado)}
                                                            ${getAttrPair("Pais", Domicilio.Domicilio.Pais)} ${getAttrPair("CodigoPostal", Domicilio.Domicilio.CodigoPostal)}/>
                                                    <#break>
                                                </#if>
                                                <#if Domicilio.Domicilio.id == NombreCliente>
                                                    <cartaporte20:Domicilio ${getAttrPair("Calle", Domicilio.Domicilio.Calle)} ${getAttrPair("NumeroExterior", Domicilio.Domicilio.NumeroExterior)} ${getAttrPair("NumeroInterior", Domicilio.Domicilio.NumeroInterior)} ${getAttrPair("Colonia", Domicilio.Domicilio.Colonia)} ${getAttrPair("Localidad", Domicilio.Domicilio.Localidad)} ${getAttrPair("Referencia", Domicilio.Domicilio.Referencia)} ${getAttrPair("Municipio", Domicilio.Domicilio.Municipio)} ${getAttrPair("Estado", Domicilio.Domicilio.Estado)}
                                                            ${getAttrPair("Pais", Domicilio.Domicilio.Pais)} ${getAttrPair("CodigoPostal", Domicilio.Domicilio.CodigoPostal)}/>
                                                    <#break>
                                                </#if>
                                            </#list>
                                            <#assign conteoubicacion = conteoubicacion+1>
                                        </cartaporte20:Ubicacion>
                                    </#list>
                                </cartaporte20:Ubicaciones>
                                <#assign NumTotalMercancias = 0>
                                <#assign PesoBrutoTotal = 0>
                                <#assign EsMaterialPeligroso = "">

                                <#list custom.items as customItem>
                                    <#assign "item" = transaction.item[customItem.line?number]>
                                    <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
                                    <#assign NumTotalMercancias = NumTotalMercancias + 1>
                                    <#assign preciobrutolinea = item.custcol_efx_fe_cp_pesobruto>
                                    <#assign PesoBrutoTotal = PesoBrutoTotal + preciobrutolinea?number>
                                </#list>
                                <cartaporte20:Mercancias PesoBrutoTotal="${PesoBrutoTotal?string["0.00"]}" UnidadPeso="${transaction.custbody_efx_fe_cp_unidadpeso.custrecord_efx_fe_cp_cup_sat}" NumTotalMercancias="${NumTotalMercancias}">
                                    <#list custom.items as customItem>
                                        <#assign "item" = transaction.item[customItem.line?number]>
                                        <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
                                        <#if customItem.type == "Group" || customItem.type == "Kit">
                                            <#assign "itemSatUnitCode" = "H87">
                                        <#else>
                                            <#assign "itemSatUnitCode" = (customItem.satUnitCode)!"">
                                        </#if>
                                        <cartaporte20:Mercancia ${getAttrPair("BienesTransp",(itemSatCodes.itemCode)!"")!""}
                                                Descripcion="${item.description?replace("<br />","")}"
                                                Cantidad="${item.quantity}"
                                                ${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
                                                <#if item.custcol_efx_fe_cp_materialpeligroso==true>
                                                    <#assign EsMaterialPeligroso = "Si">
                                                    MaterialPeligroso="Sí"
                                                    CveMaterialPeligroso="${item.custcol_efx_fe_cp_code_materialp}"
                                                    Embalaje="${item.custcol_efx_fe_cp_codigoembalaje}"
                                                </#if>
                                                PesoEnKg="${item.custcol_efx_fe_cp_pesoenkg}"

                                                ${getAttrPair("FraccionArancelaria",(item.custcol_efx_fe_ce_farancel_code)!"")!""}>
                                            <#if item.custcol_mx_txn_line_sat_cust_req_num?has_content>
                                                <cartaporte20:Pedimentos Pedimento="${item.custcol_mx_txn_line_sat_cust_req_num}"/>
                                            </#if>

                                            <cartaporte20:CantidadTransporta Cantidad="${item.quantity}" IDOrigen="${idorigenmerca}" IDDestino="${iddestinomerca}"/>

                                            <#if ViaEntradaSalida.custrecord_efx_fe_cp_sat_code == "02">
                                                <cartaporte20:DetalleMercancia UnidadPeso="${item.custcol_efx_fe_cp_code_unidadpeso}" PesoBruto="${item.custcol_efx_fe_cp_pesobruto}" PesoNeto="${item.custcol_efx_fe_cp_pesoneto}" PesoTara="${item.custcol_efx_fe_cp_pesotara}"/>
                                            </#if>
                                        </cartaporte20:Mercancia>
                                    </#list>

                                    <#assign CPAutoTransporte = json_direccion_CP.CPAutoTransporte>
                                    <#assign PermSCT = CPAutoTransporte.Vehiculo.PermSCT>
                                    <#assign NumPermisoSCT = CPAutoTransporte.Vehiculo.NumPermisoSCT>
                                    <#assign ConfigVehicular = CPAutoTransporte.Vehiculo.ConfigVehicular>
                                    <#assign PlacaVM = CPAutoTransporte.Vehiculo.PlacaVM>
                                    <#assign AnioModeloVM = CPAutoTransporte.Vehiculo.AnioModeloVM>
                                    <#assign seguros = transaction.custbody_efx_fe_cp_seguros>
                                    <#assign AseguraRespCivil = seguros.custrecord_efx_fe_cp_asegurarespcivil>
                                    <#assign PolizaRespCivil = seguros.custrecord_efx_fe_cp_polizarespcivil>
                                    <#assign AseguraMedAmbiente = seguros.custrecord_efx_fe_cp_aseguramedambiente>
                                    <#assign PolizaMedAmbiente = seguros.custrecord_efx_fe_cp_polizamedambiente>
                                    <#assign AseguraCarga = seguros.custrecord_efx_fe_cp_aseguracarga>
                                    <#assign PolizaCarga = seguros.custrecord_efx_fe_cp_polizacarga>
                                    <#assign PrimaSeguro = seguros.custrecord_efx_fe_cp_primaseguro>
                                    <cartaporte20:Autotransporte PermSCT="${PermSCT}" NumPermisoSCT="${NumPermisoSCT}">
                                        <cartaporte20:IdentificacionVehicular ConfigVehicular="${ConfigVehicular}" PlacaVM="${PlacaVM}" AnioModeloVM="${AnioModeloVM}"/>
                                        <cartaporte20:Seguros AseguraRespCivil="${AseguraRespCivil}" PolizaRespCivil="${PolizaRespCivil}"
                                                <#if EsMaterialPeligroso=="Si">
                                                    AseguraMedAmbiente="${AseguraMedAmbiente}"
                                                    PolizaMedAmbiente="${PolizaMedAmbiente}"
                                                </#if>
                                                <#if AseguraCarga?has_content && PolizaCarga?has_content>
                                                    AseguraCarga="${AseguraCarga}"
                                                    PolizaCarga="${PolizaCarga}"
                                                </#if>
                                                ${getAttrPair("PrimaSeguro",(PrimaSeguro)!"")!""}/>

                                        <cartaporte20:Remolques>
                                            <#if CPAutoTransporte.Remolqueuno.Remolqueuno?has_content>
                                                <#assign SubTipoRem = CPAutoTransporte.Remolqueuno.SubTipoRem>
                                                <#assign Placa = CPAutoTransporte.Remolqueuno.Placa>

                                                <cartaporte20:Remolque SubTipoRem="${SubTipoRem}" Placa="${Placa}"/>
                                            </#if>
                                            <#if CPAutoTransporte.Remolquedos.Remolquedos?has_content>
                                                <#assign SubTipoRem = CPAutoTransporte.Remolqueuno.SubTipoRem>
                                                <#assign Placa = CPAutoTransporte.Remolqueuno.Placa>

                                                <cartaporte20:Remolque SubTipoRem="${SubTipoRem}" Placa="${Placa}"/>
                                            </#if>
                                        </cartaporte20:Remolques>
                                    </cartaporte20:Autotransporte>
                                </cartaporte20:Mercancias>

                                <cartaporte20:FiguraTransporte>
                                    <#list transaction.recmachcustrecord_efx_fe_cp_figuratransporter as FiguraTransporte>
                                        <#assign TipoFigura = FiguraTransporte.custrecord_efx_fe_cp_tipofigura>
                                        <#assign RFCFigura = FiguraTransporte.custrecord_efx_fe_cp_rfcfigura>
                                        <#assign NumLicencia = FiguraTransporte.custrecord_efx_fe_cp_numlicencia>
                                        <#assign NombreFigura = FiguraTransporte.custrecord_efx_fe_cp_nombrefigura>
                                        <#assign NumRegIdTribFigura = FiguraTransporte.custrecord_efx_fe_cp_numregtribfig>
                                        <#assign ResidenciaFiscalFigura = FiguraTransporte.custrecord_efx_fe_cp_recfiscalfigura>
                                        <cartaporte20:TiposFigura TipoFigura="${TipoFigura?keep_before("-")}"
                                                                  RFCFigura="${RFCFigura}"
                                                                  NumLicencia="${NumLicencia}"
                                                                  NombreFigura="${NombreFigura}"
                                                <#if RFCFigura == "">
                                            NumRegIdTribFigura="${NumRegIdTribFigura}"
                                            ResidenciaFiscalFigura="${ResidenciaFiscalFigura}"
                                                </#if>>
                                        </cartaporte20:TiposFigura>
                                    </#list>
                                </cartaporte20:FiguraTransporte>
                            </cartaporte20:CartaPorte>
                        </#if>


                        <#if LeyendaFiscal == true>
                            <#assign "detalleLeyendaFiscal" = transaction.custbody_efx_fe_leyendafiscal_detail>
                            <#if detalleLeyendaFiscal?has_content>
                                <leyendasFisc:LeyendasFiscales version="1.0">
                                    <leyendasFisc:Leyenda ${getAttrPair("disposicionFiscal", detalleLeyendaFiscal.custrecord_efx_fe_leyf_disposicionfiscal)} ${getAttrPair("norma", detalleLeyendaFiscal.custrecord_efx_fe_leyf_norma)} textoLeyenda="${detalleLeyendaFiscal.custrecord_efx_fe_leyf_textoleyenda}"/>
                                </leyendasFisc:LeyendasFiscales>
                            </#if>
                        </#if>

                        <#if CPorte == true || LeyendaFiscal == true>
                            </cfdi:Complemento>
                        </#if>



                        <#if Addenda?has_content>
                            ${Addenda?replace("&gt;", ">")?replace("&lt;", "<")?replace("<br />","")}
                        </#if>


                        <#if transaction.custbody_efx_fe_walmart_note?has_content>
                            <cfdi:Addenda>
                                <Documento>${transaction.custbody_efx_fe_walmart_note}</Documento>
                            </cfdi:Addenda>
                        </#if>
</cfdi:Comprobante>