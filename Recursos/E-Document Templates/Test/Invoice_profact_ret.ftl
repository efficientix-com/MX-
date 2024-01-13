<?xml version="1.0" encoding="utf-8"?>

<#setting locale = "en_US">

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
<#if custom.relatedCfdis.types[0] == "07">

<#assign "ComercioE" = transaction.custbody_efx_fe_comercio_exterior>

<cfdi:Comprobante
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:cce11="http://www.sat.gob.mx/ComercioExterior11"
        xmlns:cfdi="http://www.sat.gob.mx/cfd/3"
<#if ComercioE == true>
<#assign "CEreceptorNumR" = transaction.custbody_efx_fe_ce_recep_num_reg>
<#assign "CEreceptorResidF" = transaction.custbody_efx_fe_ce_rec_residenciaf>
xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd http://www.sat.gob.mx/ComercioExterior11 http://www.sat.gob.mx/sitio_internet/cfd/ComercioExterior11/ComercioExterior11.xsd"
</#if>
<#assign "Add_name" = customer.custentity_efx_fe_default_addenda>
<#if Add_name=="Liverpool" || Add_name=="HEB">
xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd http://www.sat.gob.mx/detallista http://www.sat.gob.mx/sitio_internet/cfd/detallista/detallista.xsd"
</#if>

<#if ComercioE == false>
xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"
</#if>

Fecha="${transaction.trandate?string.iso_nz}T01:03:22"
${getAttrPair("Folio",transaction.custbody_mx_cfdi_folio)}
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
<cfdi:Receptor Nombre="${customerName}"
                <#if ComercioE == true>
               NumRegIdTrib="${CEreceptorNumR}"
               ResidenciaFiscal="${CEreceptorResidF}"
                </#if>
               Rfc="${customer.custentity_mx_rfc}"
               UsoCFDI="${satCodes.cfdiUsage}" />
<cfdi:Conceptos>
    <#list custom.items as customItem>
    <#assign "item" = transaction.item[customItem.line?number]>
    <#assign "taxes" = customItem.taxes>
    <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
    <#if customItem.type == "Group"  || customItem.type == "Kit">
    <#assign "itemSatUnitCode" = "H87">
    <#else>
    <#assign "itemSatUnitCode" = (customItem.satUnitCode)!"">
    <#assign desglose_json = item.custcol_efx_fe_tax_json>

    <#assign desglose = desglose_json?eval>

</#if>
<cfdi:Concepto
        Cantidad="${item.quantity?string["0.000000"]}"
        <#if ComercioE == true>
        NoIdentificacion="${item.item}"
        </#if>
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
    <#if customTaxItem.taxAmount?number gte 0>

    <cfdi:Traslado Base="${customTaxItem.taxBaseAmount?number?string["0.00"]}" Importe="${customTaxItem.taxAmount?number?string["0.00"]}" Impuesto="${customTaxItem.satTaxCode}" TasaOCuota="${customTaxItem.taxRate?number?string["0.000000"]}" TipoFactor="${customTaxItem.taxFactorType}" />
</#if>
</#if>
</#list>
</cfdi:Traslados>
</#if>

<#if desglose.retenciones.name?has_content>
<cfdi:Retenciones>

    <cfdi:Retencion Base="${desglose.retenciones.base_importe?number?string["0.00"]}" Importe="${desglose.retenciones.importe?number?string["0.00"]}" Impuesto="002" TasaOCuota="${desglose.retenciones.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />

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

<#assign desglose_json_cabecera = transaction.custbody_efx_fe_tax_json>
<#assign desglose_cab = desglose_json_cabecera?eval>
<#assign total_tras = summary.totalNonWithHoldTaxAmt?number + desglose_cab.retencion_total?number>
<#assign total_traslados_cero = summary.totalNonWithHoldTaxAmt?number + desglose_cab.retencion_total?number>


<#if desglose_cab.retencion_total != "0.00" || summary.includeTransfers == "true">
<#if desglose_cab.retencion_total != "0.00" && summary.includeTransfers == "true">
<cfdi:Impuestos TotalImpuestosRetenidos="${desglose_cab.retencion_total?number?string["0.00"]}" TotalImpuestosTrasladados="${total_tras?number?string["0.00"]}">
<#elseif desglose_cab.retencion_total != "0.00">
<cfdi:Impuestos TotalImpuestosRetenidos="${desglose_cab.retencion_total?number?string["0.00"]}">
<#elseif summary.includeTransfers == "true">
<cfdi:Impuestos TotalImpuestosTrasladados="${summary.totalNonWithHoldTaxAmt?number?string["0.00"]}">
</#if>
<#if desglose_cab.retencion_total != "0.00">
<cfdi:Retenciones>
    <#list custom.items as customItem>
    <#assign "item" = transaction.item[customItem.line?number]>
    <#assign desglose_json = item.custcol_efx_fe_tax_json>
    <#assign desglose = desglose_json?eval>
    <#if desglose.retenciones.name?has_content>
    <cfdi:Retencion Importe="${desglose.retenciones.importe?number?string["0.00"]}" Impuesto="002" />
</#if>
</#list>
</cfdi:Retenciones>
</#if>
<#if summary.includeTransfers == "true">
<cfdi:Traslados>
    <#list summary.transferTaxes as customTaxItem>
    <#if !customTaxItem.taxFactorType?has_content || customTaxItem.taxFactorType != "Exento">
    <#if customTaxItem.taxAmount?number gte 0>
    <cfdi:Traslado Importe="${customTaxItem.taxAmount?number?string["0.00"]}" Impuesto="${customTaxItem.satTaxCode}" TasaOCuota="${customTaxItem.taxRate?number?string["0.000000"]}" TipoFactor="${customTaxItem.taxFactorType}" />
</#if>
</#if>
</#list>
</cfdi:Traslados>
</#if>
<#if summary.includeWithHolding == "true" || summary.includeTransfers == "true">
</cfdi:Impuestos>
</#if>
</#if>
<#assign "Addenda" = transaction.custbody_mx_cfdi_sat_addendum>


<#if ComercioE == true>
<#assign "CertOrigen" = transaction.custbody_efx_fe_ce_certificado_origen>
<#assign "CEIncoterm" = transaction.custbody_efx_fe_ce_incoterm.custrecord_efx_fe_ce_incot_sat>
<#assign "CESubdivision" = transaction.custbody_efx_fe_ce_subdivision>
<#assign "CETipoCUSD" = transaction.custbody_efx_fe_ce_exchage>
<#assign "CETotalUSD" = transaction.custbody_efx_fe_ce_totalusd>
<#assign "CENcertOrigen" = transaction.custbody_efx_fe_ce_ncertificado_origen>
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

<cfdi:Complemento>
    <cce11:ComercioExterior Version="1.1"
                            TipoOperacion="2"
                            ClaveDePedimento="A1"
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
<#if Addenda?has_content>
${Addenda?replace("&gt;", ">")?replace("&lt;", "<")?replace("<br />","")}
</#if>
</cfdi:Comprobante>