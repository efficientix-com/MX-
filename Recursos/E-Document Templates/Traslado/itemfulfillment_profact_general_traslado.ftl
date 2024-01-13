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
<#assign "CPorte" = transaction.custbody_efx_fe_carta_porte>
<cfdi:Comprobante
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:cce11="http://www.sat.gob.mx/ComercioExterior11"
        xmlns:cartaporte="http://www.sat.gob.mx/CartaPorte"
        xmlns:cfdi="http://www.sat.gob.mx/cfd/3"

        <#assign xsischemalocation_CPorte = "">
        <#assign xsischemalocation_CE = "">

<#if CPorte == true>

    <#assign "json_direccion_field_CP" = transaction.custbody_ex_fe_cp_json_dir>
    <#if json_direccion_field_CP?has_content>
        <#assign "json_direccion_CP" = json_direccion_field_CP?eval>
    </#if>
<#assign xsischemalocation_CPorte = " http://www.sat.gob.mx/CartaPorte http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte/CartaPorte.xsd">

</#if>

<#if ComercioE == true>

<#assign "json_direccion_field" = transaction.custbody_efx_fe_dirjson_emisor>
<#if json_direccion_field?has_content>
<#assign "json_direccion" = json_direccion_field?eval>
</#if>

<#assign "CEreceptorNumR" = transaction.custbody_efx_fe_ce_recep_num_reg>
<#assign "CEreceptorResidF" = transaction.custbody_efx_fe_ce_rec_residenciaf>
<#assign xsischemalocation_CE = " http://www.sat.gob.mx/ComercioExterior11 http://www.sat.gob.mx/sitio_internet/cfd/ComercioExterior11/ComercioExterior11.xsd">
</#if>

<#assign schemaLocation = "http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"+xsischemalocation_CPorte+xsischemalocation_CE>

xsi:schemaLocation="${schemaLocation}"

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

<#if ComercioE == true>
Moneda="${transaction.custbody_efx_fe_ce_currency_descode}"
${getAttrPair("TipoCambio",transaction.custbody_efx_fe_ce_exchage)}
<#else>
Moneda="XXX"
${getAttrPair("TipoCambio",exchangeRateVal)}
</#if>

  SubTotal="0" TipoDeComprobante="${satCodes.proofType}" Total="0" Version="3.3">
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
<cfdi:Emisor
<#if ComercioE == true>
${getAttrPair("Nombre", json_direccion.emisor.Nombre)}
RegimenFiscal="${json_direccion.emisor.RegimenFiscal}"
Rfc="${json_direccion.emisor.Rfc}" />
<#elseif CPorte == true>
${getAttrPair("Nombre", json_direccion_CP.emisor.Nombre)}
RegimenFiscal="${json_direccion_CP.emisor.RegimenFiscal}"
Rfc="${companyTaxRegNumber}" />
<#else>
${getAttrPair("Nombre", transaction.location)}
RegimenFiscal="${satCodes.industryType}"
Rfc="${companyTaxRegNumber}" />
</#if>
<#if ComercioE == true>
<cfdi:Receptor Nombre="${json_direccion.receptor.Nombre}"
${getAttrPair("NumRegIdTrib", CEreceptorNumR)}
${getAttrPair("ResidenciaFiscal", CEreceptorResidF)}
<#elseif CPorte == true>
<cfdi:Receptor Nombre="${json_direccion_CP.receptor.Nombre}"
${getAttrPair("NumRegIdTrib", CEreceptorNumR)}
${getAttrPair("ResidenciaFiscal", CEreceptorResidF)}
<#else>
<cfdi:Receptor ${getAttrPair("Nombre", transaction.transferlocation)}
${getAttrPair("NumRegIdTrib", CEreceptorNumR)}
${getAttrPair("ResidenciaFiscal", CEreceptorResidF)}
</#if>
<#if ComercioE == true>
Rfc="${json_direccion.receptor.Rfc}" UsoCFDI="${satCodes.cfdiUsage}" />
<#elseif CPorte == true>
Rfc="${json_direccion_CP.receptor.Rfc}" UsoCFDI="${satCodes.cfdiUsage}" />
<#else>
Rfc="${receptorRfc}" UsoCFDI="${satCodes.cfdiUsage}" />
</#if>
<#assign cuentaLineas = 0>
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
<#assign VunitarioLinea = importeLinea?number/cantidadLinea>
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
<#assign cuentaLineas = cuentaLineas+1>
</#list>

</cfdi:Conceptos>

<#if ComercioE == true || CPorte == true>
<cfdi:Complemento>
</#if>
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
<#if json_direccion.destinatario.Colonia?has_content>
Colonia="${json_direccion.destinatario.Colonia}"
</#if>
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
</#if>

<#assign "ubicacionOrigenDetail" = transaction.custbodyefx_fe_cp_ubicaorigen>
<#assign "ubicacionDestinoDetail" = transaction.custbody_efx_fe_cp_ubicadestino>
<#if ubicacionOrigenDetail.custrecord_efx_cp_distanciarecorrida?has_content && ubicacionDestinoDetail.custrecord_efx_cp_distanciarecorrida?has_content>
<#if CPorte == true>
<#assign aDateTime = .now>
<#assign aDate = aDateTime?date>
<#assign "TranspInternac" = transaction.custbody_efx_fe_transpinternac>
<#assign "CveTransporte" = transaction.custbody_efx_fe_transporte?keep_before(" -")>
<#assign "EntradaSalidaMerc" = transaction.custbody_efx_fe_cp_entradasalidamerc>
<#assign "detalleCveTransporte" = transaction.custbody_efx_fe_cp_autotrandetail>
<#assign "ViaEntradaSalida" = transaction.custbody_efx_fe_cp_viaentradasalida>

<#if ubicacionOrigenDetail.custrecord_efx_cp_tipoestacion?has_content>
    <#assign "TipoEstacionOrigen" = ubicacionOrigenDetail.custrecord_efx_cp_tipoestacion?keep_before(" -")>
</#if>

<#if ubicacionDestinoDetail.custrecord_efx_cp_tipoestacion?has_content>
    <#assign "TipoEstacionDestino" = ubicacionDestinoDetail.custrecord_efx_cp_tipoestacion?keep_before(" -")>
</#if>
    <#assign "TotalDistRec" = ubicacionOrigenDetail.custrecord_efx_cp_distanciarecorrida?number + ubicacionDestinoDetail.custrecord_efx_cp_distanciarecorrida?number>
</#if>
<#assign "FechaHoraSalida" = transaction.custbody_efx_fe_cp_fechahorasalida?string.iso_nz + "T" + aDate?string("HH:mm:ss")>
<#assign "FechaHoraProgLlegada" = transaction.custbody_efx_fe_cp_fechahoraprogllegad?string.iso_nz + "T" + aDate?string("HH:mm:ss")>
<#assign ubicaciondestino = 1>
<cartaporte:CartaPorte Version="1.0" <#if TranspInternac=="Sí"><#if EntradaSalidaMerc?has_content>EntradaSalidaMerc="${EntradaSalidaMerc}" ViaEntradaSalida="${ViaEntradaSalida.custrecord_efx_fe_cp_sat_code}" TranspInternac="${TranspInternac}"</#if><#else> TranspInternac="${TranspInternac}"</#if> <#if TotalDistRec?has_content>TotalDistRec="${TotalDistRec}"</#if>>
    <cartaporte:Ubicaciones>
        <#if json_direccion_field_CP?has_content>
            <cartaporte:Ubicacion TipoEstacion="${TipoEstacionOrigen}" DistanciaRecorrida="${ubicacionOrigenDetail.custrecord_efx_cp_distanciarecorrida}">
                <cartaporte:Origen <#if ubicaciondestino gt 1>IDOrigen="${json_direccion_CP.IDOrigen}"</#if> <#if transaction.custbody_efx_fe_ce_propietario_numreg?has_content == false>${getAttrPair("RFCRemitente", json_direccion_CP.emisor.Rfc)}</#if> ${getAttrPair("NombreRemitente", json_direccion_CP.emisor.Nombre)} ${getAttrPair("NumRegIdTrib", transaction.custbody_efx_fe_ce_propietario_numreg)} ${getAttrPair("ResidenciaFiscal", transaction.custbody_efx_fe_ce_p_residenciafiscal)} FechaHoraSalida="${FechaHoraSalida}"/>
                <cartaporte:Domicilio Calle="${json_direccion_CP.emisor.Calle}" ${getAttrPair("NumeroExterior", json_direccion_CP.emisor.NumeroExterior)} ${getAttrPair("NumeroInterior", json_direccion_CP.emisor.NumeroInterior)} ${getAttrPair("Colonia", json_direccion_CP.emisor.Colonia)} ${getAttrPair("Localidad", json_direccion_CP.emisor.Localidad)} ${getAttrPair("Referencia", json_direccion_CP.emisor.Referencia)} ${getAttrPair("Municipio", json_direccion_CP.emisor.Municipio)} Estado="${json_direccion_CP.emisor.Estado}"
                           Pais="${json_direccion_CP.emisor.Pais}" CodigoPostal="${json_direccion_CP.emisor.CodigoPostal}"/>
            </cartaporte:Ubicacion>
            <cartaporte:Ubicacion <#if json_direccion_CP.receptor.Pais != "USA">TipoEstacion="${TipoEstacionDestino}"</#if> DistanciaRecorrida="${ubicacionDestinoDetail.custrecord_efx_cp_distanciarecorrida}">
                <cartaporte:Destino <#if ubicaciondestino gt 1>IDDestino="${json_direccion_CP.IDDestino}"</#if> <#if transaction.custbody_efx_fe_ce_recep_num_reg?has_content == false>${getAttrPair("RFCDestinatario", json_direccion_CP.receptor.Rfc)}</#if> ${getAttrPair("NombreDestinatario", json_direccion_CP.receptor.Nombre)} ${getAttrPair("NumRegIdTrib", transaction.custbody_efx_fe_ce_recep_num_reg)} ${getAttrPair("ResidenciaFiscal", transaction.custbody_efx_fe_ce_rec_residenciaf)} FechaHoraProgLlegada="${FechaHoraProgLlegada}"/>
                <cartaporte:Domicilio Calle="${json_direccion_CP.receptor.Calle}" ${getAttrPair("NumeroExterior", json_direccion_CP.receptor.NumeroExterior)} ${getAttrPair("NumeroInterior", json_direccion_CP.receptor.NumeroInterior)} ${getAttrPair("Colonia", json_direccion_CP.receptor.Colonia)} ${getAttrPair("Localidad", json_direccion_CP.receptor.Localidad)} ${getAttrPair("Referencia", json_direccion_CP.receptor.Referencia)} ${getAttrPair("Municipio", json_direccion_CP.receptor.Municipio)} Estado="${json_direccion_CP.receptor.Estado}"
                           Pais="${json_direccion_CP.receptor.Pais}" CodigoPostal="${json_direccion_CP.receptor.CodigoPostal}"/>
            </cartaporte:Ubicacion>
        </#if>
    </cartaporte:Ubicaciones>
    <#assign NumTotalMercancias = 0>

    <#list custom.items as customItem>
    <#assign "item" = transaction.item[customItem.line?number]>
    <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
    <#assign NumTotalMercancias = NumTotalMercancias + 1>
    </#list>
    <cartaporte:Mercancias NumTotalMercancias="${NumTotalMercancias}">
        <#list custom.items as customItem>
            <#assign "item" = transaction.item[customItem.line?number]>
            <cartaporte:Mercancia PesoEnKg="${item.custcol_efx_fe_cp_pesoenkg}" Descripcion="${item.description}" ${getAttrPair("BienesTransp",(itemSatCodes.itemCode)!"")!""} ${getAttrPair("FraccionArancelaria",(item.custcol_efx_fe_ce_farancel_code)!"")!""} ${getAttrPair("UUIDComercioExt",(item.custcol_efx_cp_uuidcomercioext)!"")!""}>
            <#if ubicaciondestino gt 1>
                <cartaporte:CantidadTransporta Cantidad="${item.quantity}" IDOrigen="${json_direccion_CP.IDOrigen}" IDDestino="${json_direccion_CP.IDDestino}" CvesTransporte="${ViaEntradaSalida.custrecord_efx_fe_cp_sat_code}"/>
                </#if>
                <#if ViaEntradaSalida.custrecord_efx_fe_cp_sat_code == "02">
                    <cartaporte:DetalleMercancia UnidadPeso="${item.custcol_efx_fe_cp_code_unidadpeso}" PesoBruto="${item.custcol_efx_fe_cp_pesobruto}" PesoNeto="${item.custcol_efx_fe_cp_pesoneto}" PesoTara="${item.custcol_efx_fe_cp_pesotara}"/>
                </#if>
            </cartaporte:Mercancia>
        </#list>
        <#if CveTransporte == "01">
        <cartaporte:AutotransporteFederal PermSCT="${detalleCveTransporte.custrecord_efx_cp_permsct}" NumPermisoSCT="${detalleCveTransporte.custrecord_efx_cp_numpermisosct}" NombreAseg="${detalleCveTransporte.custrecord_efx_cp_nombreaseg}" NumPolizaSeguro="${detalleCveTransporte.custrecord_efx_cp_numpolizaseguro}">
            <cartaporte:IdentificacionVehicular ConfigVehicular="${detalleCveTransporte.custrecord_efx_cp_configvehicular}" PlacaVM="${detalleCveTransporte.custrecord_efx_cp_placavm}" AnioModeloVM="${detalleCveTransporte.custrecord_efx_cp_aniomodelovm}"/>
        </cartaporte:AutotransporteFederal>
        </#if>
    </cartaporte:Mercancias>
    <cartaporte:FiguraTransporte CveTransporte="${CveTransporte}">
    <#if CveTransporte == "01">
            <cartaporte:Operadores>
                <cartaporte:Operador RFCOperador="${detalleCveTransporte.custrecord_efx_cp_rfcoperador}" NumLicencia="${detalleCveTransporte.custrecord_efx_cp_numlicencia}" NombreOperador="${detalleCveTransporte.custrecord_efx_cp_nombreoperador}" <#if detalleCveTransporte.custrecord_efx_cp_rfcoperador == "">NumRegIdTribOperador="${detalleCveTransporte.custrecord_efx_cp_numregidtriboperador}" ResidenciaFiscalOperador="${detalleCveTransporte.custrecord_efx_cp_residenciafiscalopera}"</#if>/>
            </cartaporte:Operadores>
            </#if>
        </cartaporte:FiguraTransporte>
</cartaporte:CartaPorte>
</#if>

<#if ComercioE == true || CPorte == true>
</cfdi:Complemento>
</#if>

</cfdi:Comprobante>