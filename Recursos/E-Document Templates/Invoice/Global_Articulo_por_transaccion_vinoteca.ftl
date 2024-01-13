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
<#if custom.relatedCfdis.types[0] == "07">
    <#assign paymentMethod = "30">
    <#assign paymentTerm = "PUE">
</#if>
<#assign "ComercioE" = transaction.custbody_efx_fe_comercio_exterior>

<cfdi:Comprobante
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:cce11="http://www.sat.gob.mx/ComercioExterior11"
        xmlns:cfdi="http://www.sat.gob.mx/cfd/3"

        <#assign "Add_name" = customer.custentity_efx_fe_default_addenda>
        <#if Add_name=="Liverpool" || Add_name=="HEB">
            xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd http://www.sat.gob.mx/detallista http://www.sat.gob.mx/sitio_internet/cfd/detallista/detallista.xsd"

        <#elseif ComercioE == true>
            <#assign "CEreceptorNumR" = transaction.custbody_efx_fe_ce_recep_num_reg>
            <#assign "CEreceptorResidF" = transaction.custbody_efx_fe_ce_rec_residenciaf>
            xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd http://www.sat.gob.mx/ComercioExterior11 http://www.sat.gob.mx/sitio_internet/cfd/ComercioExterior11/ComercioExterior11.xsd"

        <#elseif ComercioE == false>
            xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd"
        </#if>


        <#if transaction.custbody_efx_fe_actual_date == true>
            <#assign aDateTime = .now>
            <#assign aDate = aDateTime?date>
            Fecha="${aDate?string("yyyy-MM-dd")}T${aDate?string("HH:mm:ss")}"
        <#else>
            Fecha="${transaction.trandate?string.iso_nz}T${transaction.custbody_efx_fe_actual_hour}"
        </#if>



        <#assign serie_tran = transaction.tranid?keep_before("-")>

        <#assign folio_tran = transaction.tranid?keep_after("-")>

        <#if folio_tran>
            ${getAttrPair("Folio",folio_tran)}
        <#else>
            ${getAttrPair("Folio",transaction.tranid)}
        </#if>

        ${getAttrPair("Serie",serie_tran)}
        ${getAttrPair("FormaPago",(paymentMethod)!"")!""}
        LugarExpedicion="${customCompanyInfo.zip}"
        ${getAttrPair("MetodoPago",(paymentTerm)!"")!""}
        TipoCambio="${exchangeRate}"
        Moneda="${currencyCode}"

        SubTotal="${transaction.custbody_efx_fe_gbl_subtotal?number?string["0.00"]}"
        <#if transaction.custbody_efx_fe_gbl_totaltax=="0.00">
            <#assign total_xml = transaction.total?string["0.00"]>
            <#else>
                <#assign total_xml = (transaction.custbody_efx_fe_gbl_subtotal?number + transaction.custbody_efx_fe_gbl_totaltax?number)?string["0.00"]>
        </#if>

        Total="${total_xml}"


        TipoDeComprobante="${satCodes.proofType}"
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

    <#assign "obj_totales_imp"= {}>
    <#assign "obj_totales_imp_ret"= {}>
    <cfdi:Conceptos>
        <#list custom.items as customItem>
            <#assign "item" = transaction.item[customItem.line?number]>
            <#assign "taxes" = customItem.taxes>
            <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
            <#if customItem.type == "Group"  || customItem.type == "Kit">
                <#assign "itemSatUnitCode" = "H87">
            <#else>
                <#assign "itemSatUnitCode" = (customItem.satUnitCode)!"">
                <#assign desglose_json = item.custcol_efx_fe_gbl_json>

                <#assign desglose = desglose_json?eval>

            </#if>
            <cfdi:Concepto
                    Cantidad="${item.quantity?string["0.000000"]}"
                    <#if ComercioE == true>
                        NoIdentificacion="${item.item}"
                    </#if>
                    ClaveProdServ="01010101"

                    ${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
                    Descripcion="Venta por monto total: ${item.amount}"
                    Importe="${item.custcol_efx_fe_subtotal_gbl?number?string["0.00"]}"
                    NoIdentificacion="Transaccion: ${item.custcol_efx_fe_gbl_related_tran}"
                    ValorUnitario="${item.custcol_efx_fe_subtotal_gbl?number?string["0.00"]}"
                    Descuento="${customItem.totalDiscount?number?abs?string["0.00"]}">
                <cfdi:Impuestos>
                    
                        <cfdi:Traslados>
                        <#if desglose.monto_ieps_gbl?has_content || desglose.monto_iva_gbl?has_content>
                            <#if desglose.monto_iva_gbl?has_content>
                                <#list desglose.monto_iva_gbl as iva_l_rate, iva_l_total>
                                    <#list desglose.bases_iva as iva_b_rate, iva_b_total>
                                        <#if iva_l_rate == iva_b_rate>

                                            <#if obj_totales_imp?has_content>
                                                <#assign "conteos" = 0>
                                                <#list obj_totales_imp?keys as key>

                                                    <#if key == iva_l_rate>
                                                        <#assign "conteos" = 1>

                                                        <#assign "total_rate" = obj_totales_imp[key]?number + iva_l_total?number>
                                                        <#assign "obj_totales_imp"= obj_totales_imp + {iva_l_rate : total_rate?number}>

                                                    </#if>
                                                </#list>
                                                <#if conteos == 0>
                                                    <#assign "obj_totales_imp"= obj_totales_imp + {iva_l_rate : iva_l_total?number}>
                                                </#if>
                                            <#else>
                                                <#assign "obj_totales_imp"= obj_totales_imp + {iva_l_rate : iva_l_total?number}>
                                            </#if>

                                            <#assign rate_b = iva_b_rate?number / 100>
                                            <#if iva_b_total?number gt 0>
                                                <cfdi:Traslado Base="${iva_b_total?number?string["0.00"]}" Importe="${iva_l_total?number?string["0.00"]}" Impuesto="002" TasaOCuota="${rate_b?string["0.000000"]}" TipoFactor="Tasa" />
                                            </#if>
                                        </#if>
                                    </#list>
                                </#list>
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
                                                        <#assign ieps_l_total_redondeo = ieps_l_total?number?string["0.00"]>
                                                        <#assign "total_rate" = obj_totales_imp[key]?number + ieps_l_total_redondeo?number>
                                                        <#assign "obj_totales_imp"= obj_totales_imp + {ieps_l_rate : total_rate?number}>

                                                    </#if>
                                                    <#assign "keyses"= obj_totales_imp[key]>
                                                </#list>
                                                <#if conteos == 0>
                                                    <#assign ieps_l_total_redondeo = ieps_l_total?number?string["0.00"]>
                                                    <#assign "obj_totales_imp"= obj_totales_imp + {ieps_l_rate : ieps_l_total_redondeo?number}>
                                                </#if>
                                            <#else>
                                                <#assign ieps_l_total_redondeo = ieps_l_total?number?string["0.00"]>
                                                <#assign "obj_totales_imp"= obj_totales_imp + {ieps_l_rate : ieps_l_total_redondeo?number}>
                                                <#list obj_totales_imp?keys as key>
                                                    <#assign "keyses"= obj_totales_imp[key]>
                                                </#list>
                                            </#if>

                                            <#assign rate_b = ieps_b_rate?number / 100>
                                            <#assign iepsbase= ieps_b_total?number >
                                            <#if iepsbase != 0>
                                                <cfdi:Traslado Base="${ieps_b_total?number?string["0.00"]}" Importe="${ieps_l_total?number?string["0.00"]}" Impuesto="003" TasaOCuota="${rate_b?string["0.000000"]}" TipoFactor="Tasa" />
                                            </#if>
                                        </#if>
                                    </#list>
                                </#list>
                            </#if>

                        </#if>

                            <#if desglose.rates_exento?has_content>
                                
                                <#if desglose.bases_exento?has_content>
                                    <#list desglose.bases_exento as ext_l_rate, ext_l_total>
                                        
                                            <cfdi:Traslado Base="${ext_l_total?number?string["0.00"]}" Impuesto="002" TipoFactor="Exento" />
                                    </#list>
                                </#if>
                                
                            </#if>

                        
                        </cfdi:Traslados>
                    


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

                                                    </#if>
                                                </#list>
                                                <#if conteos == 0>
                                                    <#assign "obj_totales_imp_ret"= obj_totales_imp_ret + {ret_l_rate : ret_l_total?number}>
                                                </#if>
                                            <#else>
                                                <#assign "obj_totales_imp_ret"= obj_totales_imp_ret + {ret_l_rate : ret_l_total?number}>
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

        <#if transaction.shippingcost?length gt 0>
            <#assign costo_envio_t = transaction.shippingcost?string["0.00"]>
            <#if costo_envio_t != "0.00">
                <cfdi:Concepto
                        Cantidad="1.000000"
                        ${getAttrPair("ClaveProdServ",(transaction.custbody_efx_fe_sat_cps_envio)!"")!""}
                        ClaveUnidad="E48"
                        Descripcion="${transaction.shipmethod}"
                        Importe="${transaction.shippingcost?string["0.00"]}"
                        ValorUnitario="${transaction.shippingcost?string["0.00"]}"
                        Descuento="0.00">
                    <#assign impuesto_envio_rate = transaction.shippingtax1rate>
                    <#assign tasa_envio = impuesto_envio_rate?number / 100>
                    <#assign envio_total = transaction.shippingcost?string["0.00"]>
                    <#assign impuesto_envio_total = (envio_total?number * impuesto_envio_rate?number)/100>
                    <cfdi:Impuestos>
                        <cfdi:Traslados>
                            <cfdi:Traslado Base="${transaction.shippingcost?string["0.00"]}" Importe="${impuesto_envio_total?string["0.00"]}" Impuesto="002" TasaOCuota="${tasa_envio?number?string["0.000000"]}" TipoFactor="Tasa" />
                        </cfdi:Traslados>
                    </cfdi:Impuestos>
                </cfdi:Concepto>
            </#if>
        </#if>
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
        <#assign "total_traslados" = total_traslados?number + tras_total_fixed?number>
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
                        <#if Ieps_rate != "16" && Ieps_rate != "0">
                            <cfdi:Traslado Importe="${Ieps_total?number?string["0.00"]}" Impuesto="003" TasaOCuota="${ieps_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                        </#if>
                    </#list>


                    <#list obj_totales_imp as Iva_rate, Iva_total>
                        <#assign iva_ratenum = Iva_rate?number>
                        <#assign iva_tasaocuota = iva_ratenum/100>
                        <#if Iva_rate == "16" || Iva_rate == "0">
                            <cfdi:Traslado Importe="${Iva_total?number?string["0.00"]}" Impuesto="002" TasaOCuota="${iva_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                        </#if>
                    </#list>
                </cfdi:Traslados>
            </#if>




        </cfdi:Impuestos>




        <#assign "Addenda" = transaction.custbody_mx_cfdi_sat_addendum>


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

            <cfdi:Complemento>
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
        <#if Addenda?has_content>
            ${Addenda?replace("&gt;", ">")?replace("&lt;", "<")?replace("<br />","")}
        </#if>
</cfdi:Comprobante>