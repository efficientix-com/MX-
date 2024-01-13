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
<#assign "satCodes" = custom.satcodes>
<#assign "totalAmount" = summary.subtotal - summary.totalDiscount>
<#assign "companyTaxRegNumber" = custom.companyInfo.rfc>
<#assign paymentMethod = satCodes.paymentMethod>
<#assign paymentTerm = satCodes.paymentTerm>

<cfdi:Comprobante
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:cfdi="http://www.sat.gob.mx/cfd/3" xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"
<#if transaction.custbody_efx_fe_actual_date == true>
<#assign aDateTime = .now>
<#assign aDate = aDateTime?date>
Fecha="${aDate?string("yyyy-MM-dd")}T${aDate?string("HH:mm:ss")}"
<#else>
Fecha="${transaction.trandate?string.iso_nz}T${transaction.custbody_efx_fe_actual_hour}"
</#if>
        ${getAttrPair("Folio",transaction.tranid)}
${getAttrPair("Serie",transaction.custbody_mx_cfdi_serie)}
${getAttrPair("FormaPago",(paymentMethod)!"")!""}
LugarExpedicion="${customCompanyInfo.zip}"
${getAttrPair("MetodoPago",(paymentTerm)!"")!""}
TipoCambio="${exchangeRate}"
Moneda="${currencyCode}"
SubTotal="${summary.subtotal?number?string["0.00"]}"
TipoDeComprobante="${satCodes.proofType}"
Total="${summary.totalAmount?number?string["0.00"]}"
Version="3.3"
Descuento="${summary.totalDiscount?number?abs?string["0.00"]}">

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
<cfdi:Receptor Nombre="${customerName}" Rfc="${customer.custentity_mx_rfc}" UsoCFDI="${satCodes.cfdiUsage}" />
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
<cfdi:Concepto
        Cantidad="${item.quantity?string["0.000000"]}"
${getAttrPair("ClaveProdServ",(itemSatCodes.itemCode)!"")!""}
${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
Descripcion="${item.description}"
Importe="${customItem.amount?number?string["0.00"]}"
ValorUnitario="${customItem.rate?number?string["0.00"]}"
Descuento="${customItem.totalDiscount?number?abs?string["0.00"]}">
<cfdi:Impuestos>
    <#if taxes.taxItems?has_content>
    <cfdi:Traslados>
        <#list taxes.taxItems as customTaxItem>
        <#if customTaxItem.taxFactorType == "Exento">
        <cfdi:Traslado Base="${customTaxItem.taxBaseAmount?number?string["0.00"]}" Impuesto="${customTaxItem.satTaxCode}" TipoFactor="${customTaxItem.taxFactorType}" />
    </#if>
    <#if !customTaxItem.taxFactorType?has_content || customTaxItem.taxFactorType != "Exento">
    <cfdi:Traslado Base="${customTaxItem.taxBaseAmount?number?string["0.00"]}" Importe="${customTaxItem.taxAmount?number?string["0.00"]}" Impuesto="${customTaxItem.satTaxCode}" TasaOCuota="${customTaxItem.taxRate?number?string["0.000000"]}" TipoFactor="${customTaxItem.taxFactorType}" />
</#if>
</#list>
</cfdi:Traslados>
</#if>
<#if taxes.whTaxItems?has_content>
<cfdi:Retenciones>
    <#list taxes.whTaxItems as customTaxItem>
    <cfdi:Retencion Base="${customTaxItem.taxBaseAmount?number?string["0.00"]}" Importe="${customTaxItem.taxAmount?number?string["0.00"]}" Impuesto="${customTaxItem.satTaxCode}" TasaOCuota="${customTaxItem.taxRate?number?string["0.000000"]}" TipoFactor="${customTaxItem.taxFactorType}" />
</#list>
</cfdi:Retenciones>
</#if>
</cfdi:Impuestos>
${getNodePair("cfdi:InformacionAduanera", "NumeroPedimento" ,item.custcol_mx_txn_line_sat_cust_req_num)}
${getNodePair("cfdi:CuentaPredial", "Numero" ,item.custcol_mx_txn_line_sat_cadastre_id)}
<#if customItem.parts?has_content>
<#list customItem.parts as part>
<#assign "partItem" = transaction.item[part.line?number]>
<#assign "partSatCodes" = satCodes.items[part.line?number]>
<cfdi:Parte Cantidad="${partItem.quantity?string["0.0"]}" ClaveProdServ="${partSatCodes.itemCode}" Descripcion="${partItem.description}" Importe="${part.amount?number?string["0.00"]}" ValorUnitario="${part.rate?number?string["0.00"]}"/>
</#list>
</#if>
</cfdi:Concepto>
</#list>
</cfdi:Conceptos>
<#if summary.includeWithHolding == "true" || summary.includeTransfers == "true">
<#if summary.includeWithHolding == "true" && summary.includeTransfers == "true">
<cfdi:Impuestos TotalImpuestosRetenidos="${summary.totalWithHoldTaxAmt?number?string["0.00"]}" TotalImpuestosTrasladados="${summary.totalNonWithHoldTaxAmt?number?string["0.00"]}">
<#elseif summary.includeWithHolding == "true">
<cfdi:Impuestos TotalImpuestosRetenidos="${summary.totalWithHoldTaxAmt?number?string["0.00"]}">
<#elseif summary.includeTransfers == "true">
<cfdi:Impuestos TotalImpuestosTrasladados="${summary.totalNonWithHoldTaxAmt?number?string["0.00"]}">
</#if>
<#if summary.includeWithHolding == "true">
<cfdi:Retenciones>
    <#list summary.whTaxes as customTaxItem>
    <cfdi:Retencion Importe="${customTaxItem.taxAmount?number?string["0.00"]}" Impuesto="${customTaxItem.satTaxCode}" />
</#list>
</cfdi:Retenciones>
</#if>
<#if summary.includeTransfers == "true">
<cfdi:Traslados>
    <#list summary.transferTaxes as customTaxItem>
    <#if !customTaxItem.taxFactorType?has_content || customTaxItem.taxFactorType != "Exento">
    <cfdi:Traslado Importe="${customTaxItem.taxAmount?number?string["0.00"]}" Impuesto="${customTaxItem.satTaxCode}" TasaOCuota="${customTaxItem.taxRate?number?string["0.000000"]}" TipoFactor="${customTaxItem.taxFactorType}" />
</#if>
</#list>
</cfdi:Traslados>
</#if>
<#if summary.includeWithHolding == "true" || summary.includeTransfers == "true">
</cfdi:Impuestos>
</#if>
</#if>
</cfdi:Comprobante>