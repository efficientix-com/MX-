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
        xmlns:cartaporte20="http://www.sat.gob.mx/CartaPorte20"
        xmlns:cfdi="http://www.sat.gob.mx/cfd/3"

        <#assign xsischemalocation_CPorte = "">
        <#assign xsischemalocation_CE = "">

        <#if CPorte == true>

            <#assign "json_direccion_field_CP" = transaction.custbody_ex_fe_cp_json_dir>
            <#if json_direccion_field_CP?has_content>
                <#assign "json_direccion_CP" = json_direccion_field_CP?eval>
            </#if>
            <#assign xsischemalocation_CPorte = " http://www.sat.gob.mx/CartaPorte20 http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte/CartaPorte20.xsd">


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
        LugarExpedicion="${customCompanyInfo.zip}"

        <#if ComercioE == true>
            Moneda="${transaction.custbody_efx_fe_ce_currency_descode}"
            ${getAttrPair("TipoCambio",transaction.custbody_efx_fe_ce_exchage)}
        <#else>
            Moneda="XXX"

        </#if>

        SubTotal="0" TipoDeComprobante="T" Total="0" Version="3.3">
    <#if CPorte == true>
        <#list transaction.recmachcustrecord_efx_fe_cp_ctransccion as cfdiRelType>
        <#assign xmlCP = cfdiRelType.custrecord_efx_fe_cp_cxml>
        <#assign uuidCP = cfdiRelType.custrecord_efx_fe_cp_cuuid>
        <#if xmlCP?has_content==false && uuidCP?has_content==false>
            <#assign tipoRelacionCP = cfdiRelType.custrecord_efx_fe_relatedtipo?keep_before(" ")>
            <cfdi:CfdiRelacionados TipoRelacion="${tipoRelacionCP}">                            
                <cfdi:CfdiRelacionado  UUID="${cfdiRelType.custrecord_efx_fe_realteduuidcp}" />
            </cfdi:CfdiRelacionados>
        </#if>
        </#list>
    <#else>
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
    <cfdi:Receptor Nombre="${json_direccion_CP.emisor.Nombre}"
    ${getAttrPair("NumRegIdTrib", CEreceptorNumR)}
    ${getAttrPair("ResidenciaFiscal", CEreceptorResidF)}
<#else>
    <cfdi:Receptor ${getAttrPair("Nombre", transaction.transferlocation)}
            ${getAttrPair("NumRegIdTrib", CEreceptorNumR)}
            ${getAttrPair("ResidenciaFiscal", CEreceptorResidF)}
            </#if>
            <#if ComercioE == true>
            Rfc="${json_direccion.receptor.Rfc}" UsoCFDI="P01" />
<#elseif CPorte == true>
    Rfc="${companyTaxRegNumber}" UsoCFDI="P01" />
<#else>
    Rfc="${receptorRfc}" UsoCFDI="P01" />
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
                    Descripcion="${item.description?replace("<br />","")}"
                    <#if ComercioE == true>
                    <#assign importeLinea = item.itemfxamount>
                    <#assign cantidadLinea = item.quantity>
                    <#assign VunitarioLinea = importeLinea?number/cantidadLinea>
                    Importe="${importeLinea?number?string["0.00"]}"
                    ValorUnitario="${VunitarioLinea?string["0.00"]}">
                <#else>
                    Importe="0.00"
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
                        <#list json_direccion_CP.CPUbicaciones as listaubicaciones>
                            <#if listaubicaciones.IDUbicacion==IDUbicacion>
                                <#if TipoUbicacion=="Origen">
                                    <#assign RFCRemitenteDestinatario = listaubicaciones.RFC>
                                    <#assign NombreRemitenteDestinatario = listaubicaciones.Nombre>
                                    <#assign idorigenmerca = IDUbicacion>
                                <#else>
                                    <#assign NumRegIdTrib = transaction.custbody_efx_fe_ce_recep_num_reg>
                                    <#assign ResidenciaFiscal = transaction.custbody_efx_fe_ce_rec_residenciaf>
                                    <#assign iddestinomerca = IDUbicacion>
                                    <#if NumRegIdTrib?has_content>
                                        <#assign RFCRemitenteDestinatario = "">
                                    <#else>
                                        <#assign RFCRemitenteDestinatario = listaubicaciones.RFC>
                                    </#if>
                                    <#assign NombreRemitenteDestinatario = listaubicaciones.Nombre>

                                </#if>
                                <cartaporte20:Ubicacion TipoUbicacion="${TipoUbicacion}" IDUbicacion="${IDUbicacion}" ${getAttrPair("RFCRemitenteDestinatario", RFCRemitenteDestinatario)} NombreRemitenteDestinatario="${NombreRemitenteDestinatario}" ${getAttrPair("NumRegIdTrib", NumRegIdTrib)} ${getAttrPair("ResidenciaFiscal", ResidenciaFiscal)} FechaHoraSalidaLlegada="${FechaHoraSalidaLlegada}" ${getAttrPair("DistanciaRecorrida", DistanciaRecorrida)}>
                                    <#assign Domicilio = listaubicaciones>
                                        <#if Domicilio.TipoUbicacion=="Origen">
                                            <cartaporte20:Domicilio ${getAttrPair("Calle", Domicilio.Domicilio.Calle)} ${getAttrPair("NumeroExterior", Domicilio.Domicilio.NumeroExterior)} ${getAttrPair("NumeroInterior", Domicilio.Domicilio.NumeroInterior)} ${getAttrPair("Colonia", Domicilio.Domicilio.Colonia)} ${getAttrPair("Localidad", Domicilio.Domicilio.Localidad)} ${getAttrPair("Referencia", Domicilio.Domicilio.Referencia)} ${getAttrPair("Municipio", Domicilio.Domicilio.Municipio)} ${getAttrPair("Estado", Domicilio.Domicilio.Estado)}
                                                    ${getAttrPair("Pais", Domicilio.Domicilio.Pais)} ${getAttrPair("CodigoPostal", Domicilio.Domicilio.CodigoPostal)}/>
                                            </cartaporte20:Ubicacion>
                                            <#break>
                                        </#if>
                                        <#if Domicilio.Domicilio.id == NombreCliente || Domicilio.TipoUbicacion=="Destino">
                                            <cartaporte20:Domicilio ${getAttrPair("Calle", Domicilio.Domicilio.Calle)} ${getAttrPair("NumeroExterior", Domicilio.Domicilio.NumeroExterior)} ${getAttrPair("NumeroInterior", Domicilio.Domicilio.NumeroInterior)} ${getAttrPair("Colonia", Domicilio.Domicilio.Colonia)} ${getAttrPair("Localidad", Domicilio.Domicilio.Localidad)} ${getAttrPair("Referencia", Domicilio.Domicilio.Referencia)} ${getAttrPair("Municipio", Domicilio.Domicilio.Municipio)} ${getAttrPair("Estado", Domicilio.Domicilio.Estado)}
                                                    ${getAttrPair("Pais", Domicilio.Domicilio.Pais)} ${getAttrPair("CodigoPostal", Domicilio.Domicilio.CodigoPostal)}/>
                                            </cartaporte20:Ubicacion>
                                            <#break>
                                        </#if>

                                    <#assign conteoubicacion = conteoubicacion+1>

                            </#if>
                        </#list>


                    </#list>
                </cartaporte20:Ubicaciones>
                <#assign NumTotalMercancias = 0>
                <#assign PesoBrutoTotal = 0>
                <#assign EsMaterialPeligroso = "">

                <#list custom.items as customItem>
                    <#assign "item" = transaction.item[customItem.line?number]>
                    <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
                    <#assign conversionunidad = 1>
                    <#if item.unitconversion?has_content>
                        <#assign conversionunidad = item.unitconversion>
                    <#else>
                        <#assign conversionunidad = item.unitconversionrate>
                    </#if>
                    <#if conversionunidad?has_content == false>
                        <#assign conversionunidad = 1>
                    </#if>

                    <#assign NumTotalMercancias = NumTotalMercancias + 1>
                    
                    <#assign preciobrutolinea = item.custcol_efx_fe_cp_pesobruto?number * item.quantity * conversionunidad?number>
                    <#assign PesoBrutoTotal = PesoBrutoTotal + preciobrutolinea?number>
                </#list>
                <cartaporte20:Mercancias PesoBrutoTotal="${PesoBrutoTotal?string["0.000"]}" UnidadPeso="${transaction.custbody_efx_fe_cp_unidadpeso.custrecord_efx_fe_cp_cup_sat}" NumTotalMercancias="${NumTotalMercancias}">
                    <#list custom.items as customItem>
                        <#assign "item" = transaction.item[customItem.line?number]>
                        <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
                        <#if customItem.type == "Group" || customItem.type == "Kit">
                            <#assign "itemSatUnitCode" = "H87">
                        <#else>
                            <#assign "itemSatUnitCode" = (customItem.satUnitCode)!"">
                        </#if>
                        
                        <#assign conversionunidad = 1>
                        <#if item.unitconversion?has_content>
                            <#assign conversionunidad = item.unitconversion>
                        <#else>
                            <#assign conversionunidad = item.unitconversionrate>
                        </#if>
                        <#if conversionunidad?has_content == false>
                            <#assign conversionunidad = 1>
                        </#if>
                        
                        <cartaporte20:Mercancia ${getAttrPair("BienesTransp",(itemSatCodes.itemCode)!"")!""}
                                Descripcion="${item.description?replace("<br />","")}"
                                Cantidad="${item.quantity?string["0.000000"]}"
                                ${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
                            <#if item.custcol_efx_fe_cp_materialpeligroso=="Sí">
                                <#assign EsMaterialPeligroso = "Si">
                                MaterialPeligroso="Sí"
                                CveMaterialPeligroso="${item.custcol_efx_fe_cp_code_materialp}"
                                Embalaje="${item.custcol_efx_fe_cp_codigoembalaje}"
                            <#elseif item.custcol_efx_fe_cp_materialpeligroso=="No">
                                MaterialPeligroso="No"
                            </#if>
                                <#if TranspInternac=="Sí">
                                    ${getAttrPair("FraccionArancelaria",(item.custcol_efx_fe_ce_farancel_code)!"")!""}
                                </#if>
                                PesoEnKg="${item.custcol_efx_fe_cp_pesoenkg?number * item.quantity * conversionunidad?number}">


                        <#if item.custcol_mx_txn_line_sat_cust_req_num?has_content>
                            <cartaporte20:Pedimentos Pedimento="${item.custcol_mx_txn_line_sat_cust_req_num}"/>
                        </#if>

                        <cartaporte20:CantidadTransporta Cantidad="${item.quantity?string["0.000000"]}" IDOrigen="${idorigenmerca}" IDDestino="${iddestinomerca}"/>

                        <#if ViaEntradaSalida.custrecord_efx_fe_cp_sat_code == "02">
                            <cartaporte20:DetalleMercancia UnidadPeso="${item.custcol_efx_fe_cp_code_unidadpeso * item.quantity * conversionunidad?number}" PesoBruto="${item.custcol_efx_fe_cp_pesobruto?number * item.quantity * conversionunidad?number}" PesoNeto="${item.custcol_efx_fe_cp_pesoneto?number * item.quantity * conversionunidad?number}" PesoTara="${item.custcol_efx_fe_cp_pesotara?number * item.quantity * conversionunidad?number}"/>
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

                        <#if CPAutoTransporte.Remolqueuno.Remolqueuno?has_content || CPAutoTransporte.Remolquedos.Remolquedos?has_content>
                        <cartaporte20:Remolques>
                            <#if CPAutoTransporte.Remolqueuno.Remolqueuno?has_content>
                                <#assign SubTipoRem = CPAutoTransporte.Remolqueuno.SubTipoRem>
                                <#assign Placa = CPAutoTransporte.Remolqueuno.Placa>

                                <cartaporte20:Remolque SubTipoRem="${SubTipoRem}" Placa="${Placa}"/>
                            </#if>
                            <#if CPAutoTransporte.Remolquedos.Remolquedos?has_content>
                                <#assign SubTipoRem = CPAutoTransporte.Remolquedos.SubTipoRem>
                                <#assign Placa = CPAutoTransporte.Remolquedos.Placa>

                                <cartaporte20:Remolque SubTipoRem="${SubTipoRem}" Placa="${Placa}"/>
                            </#if>
                            </cartaporte20:Remolques>
                        </#if>
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


        <#if ComercioE == true || CPorte == true>
    </cfdi:Complemento>
    </#if>

</cfdi:Comprobante>