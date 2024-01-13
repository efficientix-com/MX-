<?xml version="1.0" encoding="utf-8"?>

<#setting locale = "es_MX">
<#setting time_zone= "America/Mexico_City">

<#assign "summary" = custom.summary>
<#assign "satCodes" = custom.satcodes>
<#assign "companyTaxRegNumber" = custom.companyInfo.rfc>

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
<#assign "currencyCode" = transaction.currencycode>
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

<#-- The item fulfillment comes from a sales order -->
<#if customer??>
<#if customer.isperson == "T">
<#assign customerName = customer.firstname + ' ' + customer.lastname>
<#else>
<#assign "customerName" = customer.companyname>
</#if>
<#assign "receptorRfc" = customer.custentity_mx_rfc>
<#-- The item fulfillment comes from a transfer order or from an intercompany transfer order -->
<#else>
<#assign "customerName" = customCompanyInfo.legalname>
<#assign "receptorRfc" = companyTaxRegNumber>
</#if>

<#if currencyCode != "MXN">
<#assign exchangeRateVal = exchangeRate>
</#if>

<#assign "ComercioE" = transaction.custbody_efx_fe_comercio_exterior>
<cfdi:Comprobante
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:cce11="http://www.sat.gob.mx/ComercioExterior11"
        xmlns:cfdi="http://www.sat.gob.mx/cfd/3"

<#if ComercioE == true>

<#assign "CEreceptorNumR" = transaction.custbody_efx_fe_ce_recep_num_reg>
<#assign "CEreceptorResidF" = transaction.custbody_efx_fe_ce_rec_residenciaf>
xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd http://www.sat.gob.mx/ComercioExterior11 http://www.sat.gob.mx/sitio_internet/cfd/ComercioExterior11/ComercioExterior11.xsd"
<#else>
xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"
</#if>

<#if transaction.custbody_efx_fe_actual_date == true>
<#assign aDateTime = .now>
<#assign aDate = aDateTime?date>
Fecha="${aDate?string("yyyy-MM-dd")}T${aDate?string("HH:mm:ss")}"
<#else>
Fecha="${transaction.trandate?string.iso_nz}T${transaction.custbody_efx_fe_actual_hour}"
</#if>
${getAttrPair("Folio",transaction.tranid)}
${getAttrPair("Serie",transaction.custbody_mx_cfdi_serie)}
LugarExpedicion="${customCompanyInfo.zip}"
Moneda="${currencyCode}" ${getAttrPair("TipoCambio",exchangeRateVal)} SubTotal="0.00" TipoDeComprobante="${satCodes.proofType}" Total="0.00" Version="3.3">
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
Rfc="${receptorRfc}" UsoCFDI="${satCodes.cfdiUsage}" />
<cfdi:Conceptos>
    <#list custom.items as customItem>
    <#assign "item" = transaction.item[customItem.line?number]>
    <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
    <#if customItem.type == "Group" || customItem.type == "Kit">
    <#assign "itemSatUnitCode" = "H87">
    <#else>
    <#assign "itemSatUnitCode" = (customItem.satUnitCode)!"">
</#if>
<cfdi:Concepto
        Cantidad="${item.quantity?string["0.000000"]}"
<#if item.custcol_efx_fe_upc_code?has_content>
NoIdentificacion="${item.custcol_efx_fe_upc_code}"
</#if>
${getAttrPair("ClaveProdServ",(itemSatCodes.itemCode)!"")!""}
${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
Descripcion="${item.description}"
<#if ComercioE == true>
<#assign importeLinea = item.itemfxamount>
<#assign cantidadLinea = item.quantity>
<#assign VunitarioLinea = importeLinea?number/cantidadLinea?number>
Importe="${importeLinea?number?string["0.00"]}"
ValorUnitario="${VunitarioLinea?string["0.00"]}">
<#else>
Importe="${customItem.amount?number?string["0.00"]}"
ValorUnitario="0.00">
</#if>
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

<#if ComercioE == true>
<#assign "CertOrigen" = transaction.custbody_efx_fe_ce_certificado_origen>
<#assign "MotTraslado" = transaction.custbody_efx_fe_ce_motivo_traslado>
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

<cfdi:Complemento>
    <cce11:ComercioExterior Version="1.1"
                            MotivoTraslado="05"
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
    <cce11:Mercancia NoIdentificacion="${item.custcol_efx_fe_upc_code}" FraccionArancelaria="${item.custcol_efx_fe_ce_farancel_code}" CantidadAduana="${item.custcol_efx_fe_ce_cant_aduana?replace(',','')?number?string["0.000"]}" UnidadAduana="${item.custcol_efx_fe_unit_code_ce}" ValorUnitarioAduana="${item.custcol_efx_fe_ce_val_uni_aduana?replace(',','')?number?string["0.00"]}" ValorDolares="${item.custcol_efx_fe_ce_val_dolares?replace(',','')?number?string["0.00"]}">
    <#if item.custcol_efx_fe_ce_des_especificas?has_content>
    <cce11:DescripcionesEspecificas Marca="${item.custcol_efx_fe_ce_des_especificas}" NumeroSerie="${item.custcol_efx_fe_ce_des_numero_serie}" Modelo="${item.custcol_efx_fe_ce_des_modelo}"/>
</#if>
</cce11:Mercancia>

</#list>
</cce11:Mercancias>
</cce11:ComercioExterior>
</cfdi:Complemento>
</#if>
</cfdi:Comprobante>