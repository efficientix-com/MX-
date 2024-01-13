<#ftl ns_prefixes={"cfdi":"http://www.sat.gob.mx/cfd/3" , "tfd":"http://www.sat.gob.mx/TimbreFiscalDigital"}>
{
<#assign currencyIsoNameMap = {
"USD":"US Dollar",
"MXN" : "Pesos",
"CAD" : "Canadian Dollars",
"EUR" : "Euros",
"GBP" : "British Pound"
}>
"tranid": "${XML["cfdi:Comprobante"]["cfdi:Emisor"].@Rfc}-${XML["cfdi:Comprobante"].@Folio}",
"currency": "${currencyIsoNameMap[XML["cfdi:Comprobante"].@Moneda]}",

<#assign existeTcambio = false>
<#list XML["cfdi:Comprobante"].@@ as attr>
<#if attr?node_name == "TipoCambio">
<#assign existeTcambio = true>
</#if>
</#list>

<#if existeTcambio == true>
"exchangerate": "${XML["cfdi:Comprobante"].@TipoCambio}",
<#else>
"exchangerate": "1",
</#if>
"custbody_mx_inbound_bill_uuid": "${XML["cfdi:Comprobante"]["cfdi:Complemento"]["tfd:TimbreFiscalDigital"].@UUID}",
"location": "Ubicacion Mexico",
"createdfrom": "${XML["cfdi:Comprobante"]["cfdi:Complemento"]["portal"]["transaccion"].@idDocumento}",
"item": [
<#list XML["cfdi:Comprobante"]["cfdi:Conceptos"]["cfdi:Concepto"] as item>
{
"vendorcode": "${item.@NoIdentificacion}",
"vendorname": "${item.@NoIdentificacion}",
"quantity": "${item.@Cantidad}",
"rate": "${item.@ValorUnitario}",
"amount": "${item.@Importe}",
"description": "${item.@Descripcion}",
"inventorydetailreq":false
}<#if item_has_next>,</#if>
</#list>
]
}