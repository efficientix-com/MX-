<?xml version="1.0" encoding="utf-8"?>

<#setting locale = "es_MX">
<#setting time_zone= "America/Mexico_City">

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
<#assign "total_traslados_ivacero" = "0">
<#assign "satCodes" = custom.satcodes>
<#assign "totalAmount" = summary.subtotal - summary.totalDiscount>
<#assign "companyTaxRegNumber" = custom.companyInfo.rfc>
<#assign paymentMethod = satCodes.paymentMethod>
<#assign paymentTerm = satCodes.paymentTerm>
<#assign "tieneExento" = false>
<#assign "ComercioE" = transaction.custbody_efx_fe_comercio_exterior>

<cfdi:Comprobante
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:cce11="http://www.sat.gob.mx/ComercioExterior11"
        xmlns:cfdi="http://www.sat.gob.mx/cfd/4"

<#assign "Add_name" = customer.custentity_efx_fe_default_addenda>
<#if Add_name=="Liverpool" || Add_name=="HEB">
xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/detallista http://www.sat.gob.mx/sitio_internet/cfd/detallista/detallista.xsd"

<#elseif ComercioE == true>
<#assign "CEreceptorNumR" = transaction.custbody_efx_fe_ce_recep_num_reg>
<#assign "CEreceptorResidF" = transaction.custbody_efx_fe_ce_rec_residenciaf>
xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/ComercioExterior11 http://www.sat.gob.mx/sitio_internet/cfd/ComercioExterior11/ComercioExterior11.xsd"

<#elseif ComercioE == false>
xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd"
</#if>



<#if transaction.custbody_efx_fe_actual_date == true>
<#assign aDateTime = .now>
<#assign aDate = aDateTime?date>
Fecha="${aDate?string("yyyy-MM-dd")}T${aDate?string("HH:mm:ss")}"
<#else>
Fecha="${transaction.trandate?string.iso_nz}T${transaction.custbody_efx_fe_actual_hour}"
</#if>


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

<#if transaction.custbody_efx_fe_gbl_folio?has_content>
            ${getAttrPair("Folio",transaction.custbody_efx_fe_gbl_folio)}
        <#else>
            ${getAttrPair("Folio",folio_transaction)}
        </#if>

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
<#assign descuentoTotal = 0>
<#list custom.items as customItem>
    <#assign "item" = transaction.item[customItem.line?number]>
    <#assign desglose_json = item.custcol_efx_fe_gbl_json>
    <#assign desglose = desglose_json?eval>
    
    <#assign descuentoTotal = descuentoTotal+desglose.descuentoSinImpuesto?number>
    
</#list>
SubTotal="${(transaction.custbody_efx_fe_gbl_subtotal?number+descuentoTotal)?string["0.00"]}"
<#assign total_xml=(transaction.custbody_efx_fe_gbl_subtotal?number + transaction.custbody_efx_fe_gbl_totaltax?number)?string["0.00"]>
Total="${total_xml}"


TipoDeComprobante="${satCodes.proofType}"
<#assign exportacion = transaction.custbody_mx_cfdi_sat_export_type?keep_before(' -')>
Exportacion="${exportacion}"
Version="4.0"



Descuento="${descuentoTotal?string["0.00"]}">

    <#if transaction.recmachcustrecord_mx_rcs_orig_trans?has_content>

        <#list custom.relatedCfdis.types as cfdiRelType>
            <#if cfdiRelType != "">
                <cfdi:CfdiRelacionados TipoRelacion="${cfdiRelType}">
            </#if>
            <#assign "cfdisArray" = custom.relatedCfdis.cfdis["k"+cfdiRelType?index]>
            <#if cfdisArray?has_content>
                <#list cfdisArray as cfdiIdx>
                    <cfdi:CfdiRelacionado  UUID="${transaction.recmachcustrecord_mx_rcs_orig_trans[cfdiIdx.index?number].custrecord_mx_rcs_uuid}" />
                </#list>
            </#if>
            </cfdi:CfdiRelacionados>
        </#list>
    </#if>
<#if transaction.custbody_efx_fe_periodicidad?has_content && transaction.custbody_efx_fe_meses?has_content && transaction.custbody_efx_fe_anio?has_content>
    <cfdi:InformacionGlobal Periodicidad="${transaction.custbody_efx_fe_periodicidad?keep_before("-")}" Meses="${transaction.custbody_efx_fe_meses?keep_before("-")}" Año="${transaction.custbody_efx_fe_anio}"/>
</#if>
<cfdi:Emisor ${getAttrPair("Nombre", customCompanyInfo.custrecord_mx_sat_registered_name)} RegimenFiscal="${satCodes.industryType}" Rfc="${companyTaxRegNumber}" />
    <#assign regfiscalreceptor = customer.custentity_mx_sat_industry_type?keep_before(" -")>
    <#if customer.custentity_mx_rfc == "XAXX010101000" || customer.custentity_mx_rfc == "XEXX010101000" || customer.custentity_mx_rfc == "">
        <#if transaction.custbody_efx_fe_gbl_lexpedicion?has_content>
            <#assign DomicilioFiscalReceptor = transaction.custbody_efx_fe_gbl_lexpedicion>
        <#else>
            <#assign DomicilioFiscalReceptor = customCompanyInfo.zip>
        </#if>
    <#else>
        <#assign DomicilioFiscalReceptor = transaction.billzip>
    </#if>
<cfdi:Receptor Nombre="${customer.custentity_mx_sat_registered_name}"
Rfc="${customer.custentity_mx_rfc}"
        ${getAttrPair("DomicilioFiscalReceptor", DomicilioFiscalReceptor)}
        ${getAttrPair("RegimenFiscalReceptor", regfiscalreceptor)}
UsoCFDI="${satCodes.cfdiUsage}" />

<#assign "obj_totales_imp"= {}>
<#assign "obj_totales_imp_ret"= {}>
<#assign "obj_totales_imp_base"= {}>
<#assign "obj_totales_imp_ret_base"= {}>
<#assign "diferenciatimbrado"= 0>
<#assign tieneobjimp = 0>
<cfdi:Conceptos>
    <#list custom.items as customItem>
    <#assign "item" = transaction.item[customItem.line?number]>
    <#assign "taxes" = customItem.taxes>
    <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
    <#if customItem.type == "Group"  || customItem.type == "Kit">
    <#assign "itemSatUnitCode" = "H87">
    <#else>
    <#assign "itemSatUnitCode" = (customItem.satUnitCode)!"">
    </#if>
    <#assign desglose_json = item.custcol_efx_fe_gbl_json>
    <#if desglose_json?has_content>
        <#assign desglose = desglose_json?eval>
        <#if desglose.monto_ieps_gbl?has_content || desglose.monto_iva_gbl?has_content || desglose.bases_exento?has_content>
            <#assign objimp = "02">
            <#else>
            <#assign objimp = "01">
        </#if>
        <#if desglose.rates_exento_data?has_content>
                <#assign objimp = "01">
        </#if>
    </#if>
    <#assign objimp = item.custcol_mx_txn_line_sat_tax_object?keep_before(" -")>

<cfdi:Concepto
        Cantidad="${item.quantity?string["0.000000"]}"
ClaveProdServ="01010101"
${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
Descripcion="Venta"
<#if item.custcol_efx_fe_gbl_sendtype == true>
Importe="${item.amount?string["0.00"]}"
ValorUnitario="${item.rate?string["0.00"]}"
<#else>
Importe="${item.custcol_efx_fe_subtotal_gbl?number?string["0.00"]}"
ValorUnitario="${item.custcol_efx_fe_subtotal_gbl?number?string["0.00"]}"
</#if>
NoIdentificacion="${item.custcol_efx_fe_gbl_related_tran?keep_after('#')}"
<#if desglose_json?has_content>Descuento="${desglose.descuentoSinImpuesto?number?abs?string["0.00"]}"<#else>Descuento="0.00"</#if> ObjetoImp="${objimp}">
    <#if desglose_json?has_content>
        <#assign "diferenciatimbrado"= diferenciatimbrado+desglose.diferenciaTotales?number>    
    </#if>
    <#if objimp!="01">
    <#assign tieneobjimp = tieneobjimp+1>
    
<cfdi:Impuestos>
    <#if desglose.monto_ieps_gbl?has_content || desglose.monto_iva_gbl?has_content || desglose.bases_exento?has_content>
    <cfdi:Traslados>
    <#if item.custcol_efx_fe_gbl_sendtype == true>
        <#assign impuesto_envio_rate=item.custcol_efx_fe_gbl_taxrateen>
        <#assign tasa_envio=impuesto_envio_rate?number / 100>
    
        <#if obj_totales_imp?has_content>
            <#assign "conteos"=0>
            <#list obj_totales_imp?keys as key>
                <#if key?number==impuesto_envio_rate?number>
                    <#assign "conteos"=1>
                    <#assign "total_rate"=obj_totales_imp[key]?number + item.custcol_efx_fe_taxtotal_gbl?number>
                    <#assign "obj_totales_imp"=obj_totales_imp + {impuesto_envio_rate?number : total_rate?number}>

                    <#assign "total_rate_base" = obj_totales_imp_base[key]?number + item.amount>
                    <#assign "obj_totales_imp_base"= obj_totales_imp_base + {impuesto_envio_rate?number : total_rate_base?number}>
                </#if>
            </#list>
            <#if conteos==0>
                <#assign "obj_totales_imp"=obj_totales_imp + {impuesto_envio_rate?number : item.custcol_efx_fe_taxtotal_gbl?number}>
                <#assign "obj_totales_imp_base"= obj_totales_imp_base + {impuesto_envio_rate?number : item.amount}>
            </#if>
        <#else>
            <#assign "obj_totales_imp"=obj_totales_imp + {impuesto_envio_rate?number : item.custcol_efx_fe_taxtotal_gbl?number}>
            <#assign "obj_totales_imp_base"= obj_totales_imp_base + {impuesto_envio_rate?number : item.amount}>
        </#if>
        <cfdi:Traslado Base="${customItem.amount?number?string["0.00"]}" Importe="${item.custcol_efx_fe_taxtotal_gbl?number?string["0.00"]}" Impuesto="002" TasaOCuota="${tasa_envio?number?string["0.000000"]}" TipoFactor="Tasa" />
    <#else>
        <#if desglose.monto_iva_gbl?has_content>
            <#list desglose.monto_iva_gbl as iva_l_rate, iva_l_total>
                <#list desglose.bases_iva as iva_b_rate, iva_b_total>
                    <#if iva_l_rate == iva_b_rate>
                        <#assign  iva_l_total_s = iva_l_total?number?string["0.00"]>
                        <#assign  iva_b_total_base = iva_b_total?number?string["0.00"]>
                        <#if obj_totales_imp?has_content>
                            <#assign "conteos" = 0>
                            <#list obj_totales_imp?keys as key>

                                <#if key == iva_l_rate>
                                <#assign "conteos" = 1>

                                <#assign "total_rate" = obj_totales_imp[key]?number + iva_l_total_s?number>
                                <#assign "obj_totales_imp"= obj_totales_imp + {iva_l_rate : total_rate?number}>

                                <#assign "total_rate_base" = obj_totales_imp_base[key]?number + iva_b_total_base?number>
                                <#assign "obj_totales_imp_base"= obj_totales_imp_base + {iva_l_rate : total_rate_base?number}>

                                </#if>
                            </#list>
                            <#if conteos == 0>
                            <#assign "obj_totales_imp"= obj_totales_imp + {iva_l_rate : iva_l_total_s?number}>
                            <#assign "obj_totales_imp_base"= obj_totales_imp_base + {iva_l_rate : iva_b_total_base?number}>
                            </#if>
                        <#else>
                            <#assign "obj_totales_imp"= obj_totales_imp + {iva_l_rate : iva_l_total_s?number}>
                            <#assign "obj_totales_imp_base"= obj_totales_imp_base + {iva_l_rate : iva_b_total_base?number}>
                        </#if>

                        <#assign rate_b = iva_b_rate?number / 100>
                        <cfdi:Traslado Base="${iva_b_total?number?string["0.00"]}" Importe="${(iva_l_total?number)?string["0.00"]}" Impuesto="002" TasaOCuota="${rate_b?string["0.000000"]}" TipoFactor="Tasa" />
                    </#if>
                </#list>
            </#list>
        </#if>
    </#if>

        <#if desglose.bases_exento?has_content>
            <#list desglose.rates_exento_data as exento_l_rate, exento_l_total>
                <#list desglose.bases_exento as exento_b_rate, exento_b_total>
                    <#if exento_l_rate == exento_b_rate>
                        <#assign  exento_l_total_s = exento_l_total?number?string["0.00"]>
                        <#assign  exento_b_total_base = exento_b_total?number?string["0.00"]>
                        <#if obj_totales_imp?has_content>
                            <#assign "conteos" = 0>
                            <#list obj_totales_imp?keys as key>

                                <#if key == exento_l_rate>
                                <#assign "conteos" = 1>

                                <#assign "total_rate" = obj_totales_imp[key]?number + exento_l_total_s?number>
                                <#assign "obj_totales_imp"= obj_totales_imp + {exento_l_rate : total_rate?number}>

                                <#assign "total_rate_base" = obj_totales_imp_base[key]?number + exento_b_total_base?number>
                                <#assign "obj_totales_imp_base"= obj_totales_imp_base + {exento_l_rate : total_rate_base?number}>

                                </#if>
                            </#list>
                            <#if conteos == 0>
                            <#assign "obj_totales_imp"= obj_totales_imp + {exento_l_rate : exento_l_total_s?number}>
                            <#assign "obj_totales_imp_base"= obj_totales_imp_base + {exento_l_rate : exento_b_total_base?number}>
                            </#if>
                        <#else>
                            <#assign "obj_totales_imp"= obj_totales_imp + {exento_l_rate : exento_l_total_s?number}>
                            <#assign "obj_totales_imp_base"= obj_totales_imp_base + {exento_l_rate : exento_b_total_base?number}>
                        </#if>

                        
                        <cfdi:Traslado Base="${exento_b_total?number?string["0.00"]}" Impuesto="002" TipoFactor="Exento" />
                    </#if>
                </#list>
            </#list>
            <#assign "tieneExento" = true>
        </#if>

    <#if desglose.monto_ieps_gbl?has_content>
    <#list desglose.monto_ieps_gbl as ieps_l_rate, ieps_l_total>
        <#list desglose.bases_ieps as ieps_b_rate, ieps_b_total>
            <#if ieps_l_rate == ieps_b_rate>

            <#if obj_totales_imp?has_content>
            <#assign "conteos" = 0>
            <#list obj_totales_imp?keys as key>

                <#if key == ieps_l_rate>
                <#assign "conteos" = 1>

                <#assign "total_rate" = obj_totales_imp[key]?number + ieps_l_total?number>
                <#assign "obj_totales_imp"= obj_totales_imp + {ieps_l_rate : total_rate?number}>

                    <#assign "total_rate_base" = obj_totales_imp_base[key]?number + ieps_b_total?number>
                    <#assign "obj_totales_imp_base"= obj_totales_imp_base + {ieps_l_rate : total_rate_base?number}>

                </#if>
                <#assign "keyses"= obj_totales_imp[key]>
            </#list>
            <#if conteos == 0>
            <#assign "obj_totales_imp"= obj_totales_imp + {ieps_l_rate : ieps_l_total?number}>
            <#assign "obj_totales_imp_base"= obj_totales_imp_base + {ieps_l_rate : ieps_b_total?number}>
            </#if>
            <#else>
            <#assign "obj_totales_imp"= obj_totales_imp + {ieps_l_rate : ieps_l_total?number}>
            <#assign "obj_totales_imp_base"= obj_totales_imp_base + {ieps_l_rate : ieps_b_total?number}>
            <#list obj_totales_imp?keys as key>
            <#assign "keyses"= obj_totales_imp[key]>
            </#list>
            </#if>

            <#assign rate_b = ieps_b_rate?number / 100>
            <cfdi:Traslado Base="${ieps_b_total?number?string["0.00"]}" Importe="${ieps_l_total?number?string["0.00"]}" Impuesto="003" TasaOCuota="${rate_b?string["0.000000"]}" TipoFactor="Tasa" />
            </#if>
        </#list>
    </#list>
    </#if>

<#list taxes.taxItems as customTaxItem>
<#if customTaxItem.taxFactorType == "Exento">
<cfdi:Traslado Base="${customTaxItem.taxBaseAmount?number?string["0.00"]}" Impuesto="${customTaxItem.satTaxCode}" TipoFactor="${customTaxItem.taxFactorType}" />
</#if>
</#list>
</cfdi:Traslados>
</#if>


<#if desglose.rates_retencion_data?has_content>
<cfdi:Retenciones>
    <#if desglose.rates_retencion_data?has_content>
    <#list desglose.rates_retencion_data as ret_l_rate, ret_l_total>
    <#list desglose.bases_retencion as ret_b_rate, ret_b_total>
    <#if ret_l_rate == ret_b_rate>

    <#if obj_totales_imp_ret?has_content>
    <#assign "conteos" = 0>
    <#list obj_totales_imp_ret?keys as key>

    <#if key == ret_l_rate>
    <#assign "conteos" = 1>

    <#assign "total_rate" = obj_totales_imp_ret[key]?number + ret_l_total?number>
    <#assign "obj_totales_imp_ret"= obj_totales_imp_ret + {ret_l_rate : total_rate?number}>

        <#assign "total_rate_base" = obj_totales_imp_ret_base[key]?number + ret_b_total?number>
        <#assign "obj_totales_imp_ret_base"= obj_totales_imp_ret_base + {ret_l_rate : total_rate_base?number}>

</#if>
</#list>
<#if conteos == 0>
<#assign "obj_totales_imp_ret"= obj_totales_imp_ret + {ret_l_rate : ret_l_total?number}>
    <#assign "obj_totales_imp_ret_base"= obj_totales_imp_ret_base + {ret_l_rate : ret_b_total?number}>
</#if>
<#else>
<#assign "obj_totales_imp_ret"= obj_totales_imp_ret + {ret_l_rate : ret_l_total?number}>
    <#assign "obj_totales_imp_ret_base"= obj_totales_imp_ret_base + {ret_l_rate : ret_b_total?number}>
</#if>

<#assign rate_b = ret_b_rate?number / 100>
    <cfdi:Retencion Base="${ret_b_total?number?string["0.00"]}" Importe="${ret_l_total?number?string["0.00"]}" Impuesto="002" TasaOCuota="${rate_b?string["0.000000"]}" TipoFactor="Tasa" />
</#if>
</#list>
</#list>
</#if>

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
</#list>

</cfdi:Conceptos>

<#assign desglose_json_cabecera = transaction.custbody_efx_fe_tax_json>
<#assign desglose_cab = desglose_json_cabecera?eval>
<#assign total_tras = desglose_cab.ieps_total_gbl?number + desglose_cab.iva_total_gbl?number + desglose_cab.retencion_total_gbl?number>
<#assign total_trasladados_monto = desglose_cab.ieps_total_gbl?number + desglose_cab.iva_total_gbl?number>


<#assign "total_retenidos" = 0>
<#list obj_totales_imp_ret as rets_rate, rets_total>
<#assign "total_retenidos" = total_retenidos?number + rets_total?number>
</#list>

<#assign "total_traslados" = 0>
<#list obj_totales_imp as tras_rate, tras_total>
<#assign tras_total_fixed = tras_total?number?string["0.00"]>
<#assign "total_traslados" = total_traslados?number + tras_total?number>
</#list>
<#if tieneobjimp gt 0>

    <#if (obj_totales_imp?has_content || tieneExento == true) && obj_totales_imp_ret?has_content>
        <cfdi:Impuestos TotalImpuestosRetenidos="${total_retenidos?string["0.00"]}" TotalImpuestosTrasladados="${(total_traslados)?string["0.00"]}">
    <#elseif obj_totales_imp?has_content || tieneExento == true>
        <cfdi:Impuestos TotalImpuestosTrasladados="${(total_traslados)?string["0.00"]}">
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

        <#if obj_totales_imp?has_content || tieneExento == true>
            <cfdi:Traslados>

                <#assign json_ieps = desglose_cab.rates_ieps_data>
                <#assign json_ivas = desglose_cab.rates_iva_data>
                <#assign json_ivas_base = desglose_cab.bases_iva>

            <#list obj_totales_imp as Ieps_rate, Ieps_total>
                <#assign ieps_ratenum = Ieps_rate?number>
                <#assign ieps_tasaocuota = ieps_ratenum/100>
                <#if Ieps_rate != "16" && Ieps_rate != "0">
                    <cfdi:Traslado Base="${obj_totales_imp_base[Ieps_rate]?string["0.00"]}" Importe="${Ieps_total?number?string["0.00"]}" Impuesto="003" TasaOCuota="${ieps_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                </#if>
                
            </#list>


            <#list obj_totales_imp as Iva_rate, Iva_total>
                <#assign iva_ratenum = Iva_rate?number>
                <#assign iva_tasaocuota = iva_ratenum/100>
                <#if Iva_rate == "16">
                    <cfdi:Traslado Base="${obj_totales_imp_base[Iva_rate]?string["0.00"]}" Importe="${(Iva_total?number)?string["0.00"]}" Impuesto="002" TasaOCuota="${iva_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                <#elseif tieneExento == true && Iva_rate == "0">
                <cfdi:Traslado Base="${obj_totales_imp_base[Iva_rate]?string["0.00"]}" Impuesto="002" TipoFactor="Exento" />
                <#elseif Iva_rate == "0">
                    <cfdi:Traslado Base="${obj_totales_imp_base[Iva_rate]?string["0.00"]}" Importe="${(Iva_total?number)?string["0.00"]}" Impuesto="002" TasaOCuota="${iva_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                </#if>
            </#list>
            </cfdi:Traslados>
        </#if>

</cfdi:Impuestos>
</#if>
</cfdi:Comprobante>