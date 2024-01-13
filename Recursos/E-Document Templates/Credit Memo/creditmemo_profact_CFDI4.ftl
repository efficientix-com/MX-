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
<#if custom.relatedCfdis.types[0] == "07">
    <#assign paymentMethod = "30">
    <#assign paymentTerm = "PUE">
</#if>
<#assign desglose_json_cabecera = transaction.custbody_efx_fe_tax_json>
<#assign desglose_cab = desglose_json_cabecera?eval>
<#assign "ComercioE" = transaction.custbody_efx_fe_comercio_exterior>
<#assign "esGlobal" = transaction.custbody_efx_fe_gbl_ismirror>
<#assign "CPorte" = transaction.custbody_efx_fe_carta_porte>
<#assign "LeyendaFiscal" = transaction.custbody_efx_fe_leyendafiscal>
<#assign "ImpLocal" = transaction.custbody_efx_fe_local_tax>
<#assign "ImpLocalobj" = transaction.custbody_efx_fe_detalle_imp_loc>
<#assign articulo_timbrado = transaction.custbody_efx_fe_item_adjust>
<#assign "impuestoLineashipp" = 0>
<#assign "tieneExento" = false>
<#assign paymentMethod = transaction.custbody_mx_txn_sat_payment_method?keep_before(" -")>

<cfdi:Comprobante
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        <#if ComercioE == true>
            xmlns:cce11="http://www.sat.gob.mx/ComercioExterior11"
        </#if>
        xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
        <#if ImpLocal == true || ImpLocalobj?has_content>
            xmlns:implocal="http://www.sat.gob.mx/implocal"
        </#if>
        <#if CPorte == true>
            xmlns:cartaporte20="http://www.sat.gob.mx/CartaPorte20"
        </#if>
        <#if LeyendaFiscal == true>
            xmlns:leyendasFisc="http://www.sat.gob.mx/leyendasFiscales"
        </#if>
        <#if transaction.custbody_efx_fe_complemento_educativo == true>
            xmlns:iedu="http://www.sat.gob.mx/iedu"
        </#if>
        <#if transaction.custbody_efx_fe_donativo == true>
            xmlns:donat="http://www.sat.gob.mx/donat"
        </#if>

        <#assign xsischemalocation_CPorte = "">
        <#assign xsischemalocation_CE = "">
        <#assign xsischemalocation_add = "">
        <#assign xsischemalocation_imploc = "">
        <#assign xsischemalocation_leyfisc = "">
        <#assign xsischemalocation_Ceducativo = "">

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
            <#assign xsischemalocation_add = " http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/detallista http://www.sat.gob.mx/sitio_internet/cfd/detallista/detallista.xsd">

        <#elseif ComercioE == true>

            <#assign "CEreceptorNumR" = transaction.custbody_efx_fe_ce_recep_num_reg>
            <#assign "CEreceptorResidF" = transaction.custbody_efx_fe_ce_rec_residenciaf>
            <#assign xsischemalocation_CE = " http://www.sat.gob.mx/ComercioExterior11 http://www.sat.gob.mx/sitio_internet/cfd/ComercioExterior11/ComercioExterior11.xsd">
        <#elseif ImpLocal == true || ImpLocalobj?has_content>
            <#assign xsischemalocation_imploc = " http://www.sat.gob.mx/implocal http://www.sat.gob.mx/sitio_internet/cfd/implocal/implocal.xsd">
        </#if>

        <#if transaction.custbody_efx_fe_complemento_educativo == true>
            <#assign xsischemalocation_Ceducativo = " http://www.sat.gob.mx/iedu http://www.sat.gob.mx/sitio_internet/cfd/iedu/iedu.xsd">
        </#if>

        <#if transaction.custbody_efx_fe_donativo == true>
            <#assign xsischemalocation_Ceducativo = " http://www.sat.gob.mx/donat http://www.sat.gob.mx/sitio_internet/cfd/donat/donat11.xsd">
        </#if>

        <#assign schemaLocation = "http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd"+xsischemalocation_CPorte+xsischemalocation_CE+xsischemalocation_add+xsischemalocation_imploc+xsischemalocation_leyfisc+xsischemalocation_Ceducativo>

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



        <#if transaction.custbody_efx_fe_gbl_folio?has_content>
            ${getAttrPair("Folio",transaction.custbody_efx_fe_gbl_folio)}
        <#else>
            ${getAttrPair("Folio",folio_transaction)}
        </#if>

        ${getAttrPair("Serie",serie_parteuno)}
        ${getAttrPair("FormaPago",(paymentMethod)!"")!""}
        <#if transaction.custbody_efx_fe_lugar_expedicion?has_content>
            LugarExpedicion="${transaction.custbody_efx_fe_lugar_expedicion}"
        <#else>
            LugarExpedicion="${customCompanyInfo.zip}"
        </#if>

        ${getAttrPair("MetodoPago",(paymentTerm)!"")!""}
        TipoCambio="${exchangeRate}"
        Moneda="${currencyCode}"



        <#assign total_ieps = desglose_cab.ieps_total?number>
        <#assign total_ivasubtotal = 0>
        <#assign total_desc_cabecera = 0>
        <#assign total_desc_conimp_cabecera = desglose_cab.descuentoConImpuesto?number>
        <#if transaction.custbody_efx_fe_kiosko_customer?has_content>
            <#assign desglosa_ieps = transaction.custbody_efx_fe_kiosko_customer.custentity_efx_cmp_registra_ieps>
        <#else>
            <#assign desglosa_ieps = customer.custentity_efx_cmp_registra_ieps>
        </#if>

        <#list custom.items as customItem>
            <#assign "item" = transaction.item[customItem.line?number]>
            <#if customItem.type != "Discount" && customItem.type != "Description">
                <#assign desglose_json = item.custcol_efx_fe_tax_json>
                <#assign desglose = desglose_json?eval>

                <#if desglose.iva.name?has_content>
                    <#assign total_ivasubtotal = total_ivasubtotal + desglose.iva.importe?number>
                </#if>
                <#if desglosa_ieps == false && desglose.iva.name?has_content && desglose.ieps.name?has_content && desglose.iva.rate_div?number==0>
                    <#assign total_desc_cabecera = total_desc_cabecera + desglose.descuentoConImpuesto?number>
                <#else>
                    <#assign total_desc_cabecera = total_desc_cabecera + desglose.descuentoSinImpuesto?number>
                </#if>
            </#if>
        </#list>


        <#if transaction.custbody_efx_fe_kiosko_customer?has_content>
            <#assign desglosa_ieps = transaction.custbody_efx_fe_kiosko_customer.custentity_efx_cmp_registra_ieps>
        <#else>
            <#assign desglosa_ieps = customer.custentity_efx_cmp_registra_ieps>
        </#if>

        <#assign totallocalesimp = 0>
        <#if transaction.custbody_efx_fe_total_impuesto_local?has_content>
            <#assign totallocalesimp = transaction.custbody_efx_fe_total_impuesto_local>
        </#if>
        <#assign envio_total = "0">

        <#if transaction.shippingcost?length gt 0>
            <#assign envio_total = transaction.shippingcost?string["0.00"]>
            <#assign impuesto_envio_rate = transaction.shippingtax1rate>
            <#if impuesto_envio_rate?has_content>
            <#assign impuesto_envio_total = (envio_total?number * impuesto_envio_rate?number)/100>
            <#else>
            <#assign impuesto_envio_total = 0>
            </#if>
            <#assign subtotal_envio = desglose_cab.subtotal?number + envio_total?number>
            <#assign total_envio = desglose_cab.total?number + envio_total?number + impuesto_envio_total>
            <#if desglosa_ieps == true>
                SubTotal="${subtotal_envio?string["0.00"]}"
            <#else>
                <#assign sub_conieps = subtotal_envio + total_ieps>
                SubTotal="${sub_conieps?string["0.00"]}"
            </#if>
            Total="${(total_envio-totallocalesimp)?string["0.00"]}"
        <#else>

            <#assign subtotal_xml = desglose_cab.subtotal?string["0.00"]>
            <#if desglosa_ieps == true>
                SubTotal="${desglose_cab.subtotal?number?string["0.00"]}"
                <#assign total_xml = (desglose_cab.total?number-totallocalesimp)?string["0.00"]>
            <#else>
                <#assign sub_conieps = desglose_cab.subtotal?number - desglose_cab.descuentoSinImpuesto?number + total_ieps>
                <#assign total_xml = desglose_cab.total?number>
                SubTotal="${((total_xml - total_ivasubtotal)+total_desc_cabecera)?string["0.00"]}"
            </#if>
            Total="${total_xml}"
        </#if>



        TipoDeComprobante="${satCodes.proofType}"
        <#assign exportacion = transaction.custbody_mx_cfdi_sat_export_type?keep_before(' -')>
        Exportacion="${exportacion}"
        Version="4.0"


        <#if total_desc_cabecera gt 0>
        Descuento="${total_desc_cabecera}">
    <#else>
        <#if transaction.discountitem?has_content>
            Descuento="${transaction.discounttotal}">
        <#else>
            Descuento="0.00">
        </#if>
    </#if>


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

    <cfdi:Emisor ${getAttrPair("Nombre", customCompanyInfo.custrecord_mx_sat_registered_name)} RegimenFiscal="${satCodes.industryType}" Rfc="${companyTaxRegNumber}" />

    <#assign regfiscalreceptor = customer.custentity_mx_sat_industry_type?keep_before(" -")>
    <#if customer.custentity_mx_rfc == "XAXX010101000" || customer.custentity_mx_rfc == "XEXX010101000" || customer.custentity_mx_rfc == "">
        <#if transaction.custbody_efx_fe_lugar_expedicion?has_content>
            <#assign DomicilioFiscalReceptor = transaction.custbody_efx_fe_lugar_expedicion>
        <#else>
            <#assign DomicilioFiscalReceptor = customCompanyInfo.zip>
        </#if>
        <#else>
            <#assign DomicilioFiscalReceptor = transaction.billzip>
    </#if>
    <#if transaction.custbody_efx_fe_kiosko_customer?has_content>
        <cfdi:Receptor Nombre="${transaction.custbody_efx_fe_kiosko_name}"
                <#if ComercioE == true>
                    NumRegIdTrib="${CEreceptorNumR}"
                    ResidenciaFiscal="${CEreceptorResidF}"
                </#if>
                       <#assign regfiscalreceptorKiosko = transaction.custbody_efx_fe_kiosko_regfiscal?keep_before(" -")>
                       Rfc="${transaction.custbody_efx_fe_kiosko_rfc}"
                       DomicilioFiscalReceptor="${transaction.custbody_efx_fe_kiosko_zip}"
                       RegimenFiscalReceptor="${regfiscalreceptorKiosko}"
                       UsoCFDI="${satCodes.cfdiUsage}" />

    <#elseif transaction.custbody_efx_fe_gbl_related?has_content>
    <cfdi:Receptor Nombre="PÚBLICO EN GENERAL"
                       Rfc="${transaction.custbody_efx_fe_gbl_related.custbody_mx_customer_rfc}"
                       DomicilioFiscalReceptor="${customCompanyInfo.zip}"
                       RegimenFiscalReceptor="616"
                       UsoCFDI="S01" />
    <#else>
    <#assign esampersand = false>
        <#assign escomillas = false>
        <#assign custnamelength = customer.custentity_mx_sat_registered_name?length>
        <#assign custname = customer.custentity_mx_sat_registered_name>
        <#list 0..custnamelength as x>
        <#if custname[x] == "&">
<#assign esampersand = true>
        </#if>
        </#list>

<#if esampersand==true>
<cfdi:Receptor Rfc=<#outputformat "plainText">"${customer.custentity_mx_rfc}"</#outputformat>
 Nombre=<#outputformat "plainText">"${customer.custentity_mx_sat_registered_name}"</#outputformat>
<#else>
<cfdi:Receptor Rfc=<#outputformat "plainText">"${customer.custentity_mx_rfc}"</#outputformat>
 Nombre=<#outputformat "XML">"${customer.custentity_mx_sat_registered_name}"</#outputformat>
</#if>                
                ${getAttrPair("DomicilioFiscalReceptor", DomicilioFiscalReceptor)}
<#if ComercioE == true>
                    ${getAttrPair("ResidenciaFiscal", CEreceptorResidF)}
                    ${getAttrPair("NumRegIdTrib", CEreceptorNumR)}
                </#if>
                ${getAttrPair("RegimenFiscalReceptor", regfiscalreceptor)}
                UsoCFDI="${satCodes.cfdiUsage}" />
    </#if>
    <#assign total_impuestos_t_ivas = 0>
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
            <#assign objimp = item.custcol_mx_txn_line_sat_tax_object?keep_before(" -")>
             <#if customItem.type != "Discount" && customItem.type != "Description">
                <#assign desglose_json = item.custcol_efx_fe_tax_json>
                <#assign desglose = desglose_json?eval>
            </#if>

            <#assign descripciongrupo = "">
            <#assign prodservgrupo = "">
            <#if item.itemtype == "Group">
                <#assign descripciongrupo = item.description>
                <#assign prodservgrupo = itemSatCodes.itemCode>
            </#if>

            <#if item.item != articulo_timbrado>
                <#if item.itemtype != "Group" && item.itemtype != "EndGroup" && item.itemtype != "Discount" && item.itemtype != "Description">
                    <cfdi:Concepto
                            Cantidad="${item.quantity?string["0.000000"]}"
                            <#if ComercioE == true>
                                <#if item.custcol_efx_fe_upc_code?has_content>
                                    NoIdentificacion="${item.custcol_efx_fe_upc_code}"
                                <#else>
                                    NoIdentificacion="${item.item}"
                                </#if>
                            </#if>
                            <#if item.custcol_efx_fe_upc_code?has_content>
                                <#if ComercioE == false>
                                    NoIdentificacion="${item.custcol_efx_fe_upc_code}"
                                </#if>
                            </#if>

                            ${getAttrPair("ClaveProdServ",(itemSatCodes.itemCode)!"")!""}
                            ${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
                            Descripcion=<#outputformat "XML">"${item.description?replace("<br />","")}"</#outputformat>
                            <#assign impdesglosaieps = 0>
                            <#if desglosa_ieps == true>
                                Importe="${customItem.amount?number?string["0.00"]}"
                                <#if customItem.rate != "">
                                    ValorUnitario="${customItem.rate?number?string["0.00"]}"
                                <#else>
                                    <#assign rate_faltante = customItem.amount?number / item.quantity?number>
                                    ValorUnitario="${rate_faltante?string["0.00"]}"
                                </#if>
                            <#else>
                                <#if desglose.ieps.name?has_content>
                                    <#assign imp_ieps_linea = desglose.ieps.importe?number>
                                    <#assign imp_linea_sindesglose =  customItem.amount?number + imp_ieps_linea>
                                    <#assign impdesglosaieps = imp_linea_sindesglose>
                                    <#assign valu_linea_sindesglose =  imp_linea_sindesglose/item.quantity>
                                    Importe="${imp_linea_sindesglose?string["0.00"]}"
                                    <#if valu_linea_sindesglose?has_content>
                                        ValorUnitario="${valu_linea_sindesglose?string["0.00"]}"
                                    <#else>
                                        <#assign rate_faltante = imp_linea_sindesglose / item.quantity>
                                        ValorUnitario="${rate_faltante?string["0.00"]}"
                                    </#if>
                                <#else>
                                    Importe="${customItem.amount?number?string["0.00"]}"
                                    <#if customItem.rate != "">
                                        ValorUnitario="${customItem.rate?number?string["0.00"]}"
                                    <#else>
                                        <#assign rate_faltante = customItem.amount?number / item.quantity?number>
                                        ValorUnitario="${rate_faltante?string["0.00"]}"
                                    </#if>
                                </#if>
                            </#if>
                            <#assign json_descuentos = desglose.descuentoSinImpuesto>
                            <#if json_descuentos?number gt 0>
                            <#if desglosa_ieps == false && desglose.iva.name?has_content && desglose.ieps.name?has_content && desglose.iva.rate_div?number==0>
                                Descuento="${desglose.descuentoConImpuesto?number?string["0.00"]}"
                            <#else>
                                Descuento="${desglose.descuentoSinImpuesto?number?string["0.00"]}"
                            </#if>

                            ObjetoImp="${objimp}">
                        <#else>

                            Descuento="0.00"
                            ObjetoImp="${objimp}">

                        </#if>

                        <#if objimp!="01">
                        <#assign tieneobjimp = tieneobjimp+1>
                            <#if customItem.amount?number != desglose.descuentoSinImpuesto?number>
                                <cfdi:Impuestos>
                                    <#if desglose.iva.name?has_content || desglose.ieps.name?has_content || desglose.exento.name?has_content>
                                        <cfdi:Traslados>

                                            <#if desglosa_ieps == true>
                                                <#if desglose.ieps.name?has_content>
                                                    <#assign tiene_impuesto = tiene_impuesto + 1>
                                                    <cfdi:Traslado Base="${desglose.ieps.base_importe?number?string["0.00"]}" Importe="${desglose.ieps.importe?number?string["0.00"]}" Impuesto="003" TasaOCuota="${desglose.ieps.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />
                                                </#if>
                                            </#if>

                                            <#if desglose.iva.name?has_content>

                                                <#assign iva_enfixed = desglose.iva.importe?number?string["0.00"]>
                                                <#assign total_impuestos_t_ivas = total_impuestos_t_ivas + iva_enfixed?number>
                                                <#assign tiene_impuesto = tiene_impuesto + 1>
                                                <cfdi:Traslado Base="${desglose.iva.base_importe?number?string["0.00"]}" Importe="${desglose.iva.importe?number?string["0.00"]}" Impuesto="002" TasaOCuota="${desglose.iva.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />
                                            </#if>


                                            <#if desglose.exento.name?has_content>
                                            <#assign tiene_impuesto = tiene_impuesto + 1>
                                                <cfdi:Traslado Base="${desglose.exento.base_importe?number?string["0.00"]}" Impuesto="002" TipoFactor="Exento" />
                                                <#assign "tieneExento" = true>
                                            </#if>

                                        </cfdi:Traslados>
                                    </#if>


                                    <#if desglose.retenciones.name?has_content>
                                        <cfdi:Retenciones>
                                            <#assign tiene_impuesto = tiene_impuesto + 1>
                                            <cfdi:Retencion Base="${desglose.retenciones.base_importe?number?string["0.00"]}" Importe="${(desglose.retenciones.importe?number)?string["0.00"]}" Impuesto="002" TasaOCuota="${desglose.retenciones.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />

                                        </cfdi:Retenciones>
                                    </#if>
                                </cfdi:Impuestos>
                            </#if>
                        </#if>

                        ${getNodePair("cfdi:InformacionAduanera", "NumeroPedimento" ,item.custcol_mx_txn_line_sat_cust_req_num)}
                        ${getNodePair("cfdi:CuentaPredial", "Numero" ,item.custcol_mx_txn_line_sat_cadastre_id)}
                        <#if customItem.parts?has_content>
                            <#list customItem.parts as part>
                                <#assign "partItem" = transaction.item[part.line?number]>
                                <#assign "partSatCodes" = satCodes.items[part.line?number]>
                                <cfdi:Parte Cantidad="${partItem.quantity?string["0.0"]}" ClaveProdServ="${partSatCodes.itemCode}" Descripcion=<#outputformat "XML">"${partItem.description}"</#outputformat> Importe="${part.amount?number?string["0.00"]}" ValorUnitario="${part.rate?number?string["0.00"]}"/>
                            </#list>
                        </#if>

                        <#if transaction.custbody_efx_fe_complemento_educativo == true>
                            <cfdi:ComplementoConcepto>
                                <iedu:instEducativas version="1.0" ${getAttrPair("nombreAlumno",(item.custcol_efx_fe_com_edu_nom_alumn)!"")!""} ${getAttrPair("CURP",(item.custcol_efx_fe_com_edu_curp)!"")!""} ${getAttrPair("nivelEducativo",(item.custcol_efx_fe_com_edu_nivel_edu)!"")!""} ${getAttrPair("autRVOE",(item.custcol_efx_fe_com_edu_clave_autrvoe)!"")!""}/>
                            </cfdi:ComplementoConcepto>
                        </#if>
                    </cfdi:Concepto>
                <#else>
                    <#if customItem.parts?has_content>
                        <#assign tasadesgloses = 0>
                        <#assign importedesgloses = 0>
                        <#assign cantidaddesgloses = 0>
                        <#assign descuentodesgloses = 0>
                        <#assign ivaImporte = 0>
                        <#assign ivaTasa = ''>
                        <#list customItem.parts as customItem>
                            <#assign "item" = transaction.item[customItem.line?number]>
                            <#assign "itemSatCodes" = satCodes.items[customItem.line?number]>
                            <#if customItem.type != "Discount" && customItem.type != "Description">
                                <#assign desglose_json = item.custcol_efx_fe_tax_json>
                                <#assign desglose = desglose_json?eval>
                            </#if>
                            <#if desglose.iva.name?has_content>
                                <#assign ivaImporte = ivaImporte + desglose.iva.importe?number>
                                <#assign ivaTasa = desglose.iva.rate_div?number?string["0.000000"]>
                            </#if>
                            <#assign tasadesgloses = tasadesgloses + customItem.rate?number>
                            <#assign importedesgloses = importedesgloses + customItem.amount?number>
                            <#assign cantidaddesgloses = cantidaddesgloses + item.quantity>
                            <#assign descuentodesgloses = descuentodesgloses + desglose.descuentoSinImpuesto?number>
                            <#assign objimp = item.custcol_mx_txn_line_sat_tax_object?keep_before(" -")>
                            <#if transaction.custbody_efx_fe_desglosa_ga == true>
                                <cfdi:Concepto
                                        Cantidad="${item.quantity?string["0.000000"]}"
                                        <#if ComercioE == true>
                                            <#if item.custcol_efx_fe_upc_code?has_content>
                                                NoIdentificacion="${item.custcol_efx_fe_upc_code}"
                                            <#else>
                                                NoIdentificacion="${item.item}"
                                            </#if>
                                        </#if>
                                        <#if item.custcol_efx_fe_upc_code?has_content>
                                            <#if ComercioE == false>
                                                NoIdentificacion="${item.custcol_efx_fe_upc_code}"
                                            </#if>
                                        </#if>

                                        ${getAttrPair("ClaveProdServ",(itemSatCodes.itemCode)!"")!""}
                                        ${getAttrPair("ClaveUnidad",itemSatUnitCode)!""}
                                        Descripcion=<#outputformat "XML">"${item.description?replace("<br />","")}"</#outputformat>
                                        <#assign impdesglosaieps = 0>
                                        <#if desglosa_ieps == true>
                                            Importe="${customItem.amount?number?string["0.00"]}"
                                            <#if customItem.rate != "">
                                                ValorUnitario="${customItem.rate?number?string["0.00"]}"
                                            <#else>
                                                <#assign rate_faltante = customItem.amount?number / item.quantity?number>
                                                ValorUnitario="${rate_faltante?string["0.00"]}"
                                            </#if>
                                        <#else>
                                            <#if desglose.ieps.name?has_content>
                                                <#assign imp_ieps_linea = desglose.ieps.importe?number>
                                                <#assign imp_linea_sindesglose =  customItem.amount?number + imp_ieps_linea>
                                                <#assign impdesglosaieps = imp_linea_sindesglose>
                                                <#assign valu_linea_sindesglose =  imp_linea_sindesglose/item.quantity>
                                                Importe="${imp_linea_sindesglose?string["0.00"]}"
                                                <#if valu_linea_sindesglose?has_content>
                                                    ValorUnitario="${valu_linea_sindesglose?string["0.00"]}"
                                                <#else>
                                                    <#assign rate_faltante = imp_linea_sindesglose / item.quantity>
                                                    ValorUnitario="${rate_faltante?string["0.00"]}"
                                                </#if>
                                            <#else>
                                                Importe="${customItem.amount?number?string["0.00"]}"
                                                <#if customItem.rate != "">
                                                    ValorUnitario="${customItem.rate?number?string["0.00"]}"
                                                <#else>
                                                    <#assign rate_faltante = customItem.amount?number / item.quantity?number>
                                                    ValorUnitario="${rate_faltante?string["0.00"]}"
                                                </#if>
                                            </#if>
                                        </#if>
                                        <#assign json_descuentos = desglose.descuentoSinImpuesto>
                                        <#if json_descuentos?number gt 0>
                                        Descuento="${desglose.descuentoSinImpuesto?number?string["0.00"]}"
                                        ObjetoImp="${objimp}">
                                    <#else>
                                        Descuento="0.00"
                                        ObjetoImp="${objimp}">

                                    </#if>
                                    <#if objimp!="01">
                                    <#assign tieneobjimp = tieneobjimp+1>
                                        <#if customItem.amount?number != desglose.descuentoSinImpuesto?number>
                                            <cfdi:Impuestos>
                                                <#if desglose.iva.name?has_content || desglose.ieps.name?has_content || desglose.exento.name?has_content>
                                                    <cfdi:Traslados>

                                                        <#if desglosa_ieps == true>
                                                            <#if desglose.ieps.name?has_content>
                                                                <#assign tiene_impuesto = tiene_impuesto + 1>
                                                                <cfdi:Traslado Base="${desglose.ieps.base_importe?number?string["0.00"]}" Importe="${desglose.ieps.importe?number?string["0.00"]}" Impuesto="003" TasaOCuota="${desglose.ieps.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />
                                                            </#if>
                                                        </#if>

                                                        <#if desglose.iva.name?has_content>

                                                            <#assign iva_enfixed = desglose.iva.importe?number?string["0.00"]>
                                                            <#assign total_impuestos_t_ivas = total_impuestos_t_ivas + iva_enfixed?number>
                                                            <#assign tiene_impuesto = tiene_impuesto + 1>
                                                            <cfdi:Traslado Base="${desglose.iva.base_importe?number?string["0.00"]}" Importe="${desglose.iva.importe?number?string["0.00"]}" Impuesto="002" TasaOCuota="${desglose.iva.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />
                                                        </#if>


                                                        <#if desglose.exento.name?has_content>
                                                        <#assign tiene_impuesto = tiene_impuesto + 1>
                                                            <cfdi:Traslado Base="${desglose.exento.base_importe?number?string["0.00"]}" Impuesto="002" TipoFactor="Exento" />
                                                            <#assign "tieneExento" = true>
                                                        </#if>

                                                    </cfdi:Traslados>
                                                </#if>


                                                <#if desglose.retenciones.name?has_content>
                                                    <cfdi:Retenciones>
                                                        <#assign tiene_impuesto = tiene_impuesto + 1>
                                                        <cfdi:Retencion Base="${desglose.retenciones.base_importe?number?string["0.00"]}" Importe="${(desglose.retenciones.importe?number)?string["0.00"]}" Impuesto="002" TasaOCuota="${desglose.retenciones.rate_div?number?string["0.000000"]}" TipoFactor="Tasa" />

                                                    </cfdi:Retenciones>
                                                </#if>
                                            </cfdi:Impuestos>
                                        </#if>
                                    </#if>

                                    ${getNodePair("cfdi:InformacionAduanera", "NumeroPedimento" ,item.custcol_mx_txn_line_sat_cust_req_num)}
                                    ${getNodePair("cfdi:CuentaPredial", "Numero" ,item.custcol_mx_txn_line_sat_cadastre_id)}
                                    <#if customItem.parts?has_content>
                                        <#list customItem.parts as part>
                                            <#assign "partItem" = transaction.item[part.line?number]>
                                            <#assign "partSatCodes" = satCodes.items[part.line?number]>
                                            <cfdi:Parte Cantidad="${partItem.quantity?string["0.0"]}" ClaveProdServ="${partSatCodes.itemCode}" Descripcion=<#outputformat "XML">"${partItem.description}"</#outputformat> Importe="${part.amount?number?string["0.00"]}" ValorUnitario="${part.rate?number?string["0.00"]}"/>
                                        </#list>
                                    </#if>

                                    <#if transaction.custbody_efx_fe_complemento_educativo == true>
                                        <cfdi:ComplementoConcepto>
                                            <iedu:instEducativas version="1.0" ${getAttrPair("nombreAlumno",(item.custcol_efx_fe_com_edu_nom_alumn)!"")!""} ${getAttrPair("CURP",(item.custcol_efx_fe_com_edu_curp)!"")!""} ${getAttrPair("nivelEducativo",(item.custcol_efx_fe_com_edu_nivel_edu)!"")!""} ${getAttrPair("autRVOE",(item.custcol_efx_fe_com_edu_clave_autrvoe)!"")!""}/>
                                        </cfdi:ComplementoConcepto>
                                    </#if>
                                </cfdi:Concepto>

                            </#if>
                        </#list>
                        <#if transaction.custbody_efx_fe_desglosa_ga == false>
                            <cfdi:Concepto
                                    Cantidad="1.000000"
                                    <#if ComercioE == true>
                                        <#if item.custcol_efx_fe_upc_code?has_content>
                                            NoIdentificacion="${item.custcol_efx_fe_upc_code}"
                                        <#else>
                                            NoIdentificacion="${item.item}"
                                        </#if>
                                    </#if>
                                    <#if item.custcol_efx_fe_upc_code?has_content>
                                        <#if ComercioE == false>
                                            NoIdentificacion="${item.custcol_efx_fe_upc_code}"
                                        </#if>
                                    </#if>

                                    <#assign unidadgroup = "E48">
                                    ${getAttrPair("ClaveProdServ",prodservgrupo)!""}
                                    ${getAttrPair("ClaveUnidad",unidadgroup)!""}
                                    Descripcion=<#outputformat "XML">"${descripciongrupo?replace("<br />","")}"</#outputformat>
                                    <#assign impdesglosaieps = 0>
                                    <#if desglosa_ieps == true>
                                        Importe="${importedesgloses?string["0.00"]}"
                                        <#if customItem.rate != "">
                                            ValorUnitario="${importedesgloses?string["0.00"]}"
                                        <#else>
                                            <#assign rate_faltante = customItem.amount?number / item.quantity?number>
                                            ValorUnitario="${importedesgloses?string["0.00"]}"
                                        </#if>
                                    <#else>
                                        Importe="${importedesgloses?string["0.00"]}"
                                        <#if customItem.rate != "">
                                            ValorUnitario="${importedesgloses?string["0.00"]}"
                                        <#else>
                                            <#assign rate_faltante = customItem.amount?number / item.quantity?number>
                                            ValorUnitario="${importedesgloses?string["0.00"]}"
                                        </#if>
                                    </#if>

                                    <#if descuentodesgloses gt 0>
                                    Descuento="${descuentodesgloses?string["0.00"]}"
                                    <#assign objimp = item.custcol_mx_txn_line_sat_tax_object?keep_before(" -")>
                                    ObjetoImp="${objimp}">
                                <#else>

                                    <#assign objimp = item.custcol_mx_txn_line_sat_tax_object?keep_before(" -")>
                                    Descuento="0.00"
                                    ObjetoImp="${objimp}">

                                </#if>

<#if objimp!="01">
<#assign tieneobjimp = tieneobjimp+1>
                                <cfdi:Impuestos>

                                    <cfdi:Traslados>

                                        <#assign tiene_impuesto = tiene_impuesto + 1>
                                        <cfdi:Traslado Base="${importedesgloses?string["0.00"]}" Importe="${ivaImporte?string["0.00"]}" Impuesto="002" TasaOCuota="${ivaTasa?number?string["0.000000"]}" TipoFactor="Tasa" />


                                    </cfdi:Traslados>

                                </cfdi:Impuestos>
                                </#if>


                                ${getNodePair("cfdi:InformacionAduanera", "NumeroPedimento" ,item.custcol_mx_txn_line_sat_cust_req_num)}
                                ${getNodePair("cfdi:CuentaPredial", "Numero" ,item.custcol_mx_txn_line_sat_cadastre_id)}



                            </cfdi:Concepto>
                        </#if>
                    </#if>
                </#if>
            </#if>
        </#list>

        <#if transaction.shippingcost?length gt 0>
            <#assign costo_envio_t = transaction.shippingcost?string["0.00"]>
            <#if costo_envio_t != "0.00">
                <cfdi:Concepto
                        Cantidad="1.000000"
                        ${getAttrPair("ClaveProdServ",(transaction.custbody_efx_fe_sat_cps_envio)!"")!""}
                        ClaveUnidad="E48"
                        Descripcion=<#outputformat "XML">"${transaction.shipmethod}"</#outputformat>
                        Importe="${transaction.shippingcost?string["0.00"]}"
                        ValorUnitario="${transaction.shippingcost?string["0.00"]}"
                        Descuento="0.00"

                    <#assign impuesto_envio_rate = transaction.shippingtax1rate>
                    <#assign tasa_envio = impuesto_envio_rate?number / 100>
                    <#assign envio_total = transaction.shippingcost?string["0.00"]>
                    <#assign impuesto_envio_total = (envio_total?number * impuesto_envio_rate?number)/100>
                    <#assign "impuestoLineashipp" = impuestoLineashipp+impuesto_envio_total>
                        <#if impuesto_envio_total gt 0>
                                ObjetoImp="02">
                            <#else>
                                ObjetoImp="01">
                        </#if>

                    <cfdi:Impuestos>
                        <cfdi:Traslados>
                        <#assign tiene_impuesto = tiene_impuesto + 1>
                            <cfdi:Traslado Base="${transaction.shippingcost?string["0.00"]}" Importe="${impuesto_envio_total?string["0.00"]}" Impuesto="002" TasaOCuota="${tasa_envio?number?string["0.000000"]}" TipoFactor="Tasa" />
                        </cfdi:Traslados>
                    </cfdi:Impuestos>
                </cfdi:Concepto>
            </#if>
        </#if>
    </cfdi:Conceptos>

    <#assign json_ivas = desglose_cab.rates_iva_data>

    <#list json_ivas as Iva_rate, Iva_total>
        <#assign total_traslados_ivacero = total_traslados_ivacero + 1>
    </#list>


    <#assign total_tras = desglose_cab.ieps_total?number + desglose_cab.iva_total?number + desglose_cab.retencion_total?number>
    <#assign total_trasladados_monto = desglose_cab.ieps_total?number + desglose_cab.iva_total?number>



    <#assign total_impuestos_t = 0>
    <#assign total_impuestos_t = total_impuestos_t+impuestoLineashipp?number>
    <#if desglose_cab.ieps_total != "0.00" && desglose_cab.iva_total != "0.00">
        <#assign total_impuestos_t = total_impuestos_t + desglose_cab.ieps_total?number + desglose_cab.iva_total?number>
    <#elseif desglose_cab.ieps_total != "0.00">
        <#assign total_impuestos_t = total_impuestos_t + desglose_cab.ieps_total?number>
    <#elseif desglose_cab.iva_total != "0.00">
        <#assign total_impuestos_t = total_impuestos_t + desglose_cab.iva_total?number>
    </#if>

    <#if exchangeRate?number gt 0>
        <#if currencyCode=="MXN">
            <#assign total_impuestos_t = total_impuestos_t / exchangeRate?number>
        <#else>
            <#assign total_impuestos_t = total_impuestos_t>
        </#if>
    </#if>

    <#assign exentoContador = 0>    
    <#if tieneobjimp gt 0>
    
        <#if desglosa_ieps == true>
        
            <#if (desglose_cab.ieps_total != "0.00" || desglose_cab.iva_total != "0.00" || tieneExento == true) && desglose_cab.retencion_total != "0.00">
                <#assign exentoContador = exentoContador+1>
            
                <cfdi:Impuestos TotalImpuestosRetenidos="${(desglose_cab.retencion_total?number)?string["0.00"]}" TotalImpuestosTrasladados="${total_impuestos_t?string["0.00"]}">
            <#elseif desglose_cab.retencion_total != "0.00">
                <#assign exentoContador = exentoContador+1>
                <cfdi:Impuestos TotalImpuestosRetenidos="${(desglose_cab.retencion_total?number)?string["0.00"]}">
            <#elseif desglose_cab.ieps_total != "0.00" || desglose_cab.iva_total != "0.00" || total_traslados_ivacero gt 0 || tieneExento == true>
                <#assign exentoContador = exentoContador+1>
                <cfdi:Impuestos TotalImpuestosTrasladados="${total_impuestos_t?string["0.00"]}">
                <#else>
                
            </#if>
        <#else>        
            <#assign total_impuestos_t = total_impuestos_t+impuestoLineashipp?number>
            <#if (desglose_cab.ieps_total != "0.00" || desglose_cab.iva_total != "0.00" || tieneExento == true) && desglose_cab.retencion_total != "0.00">
                <#assign exentoContador = exentoContador+1>
                <cfdi:Impuestos TotalImpuestosRetenidos="${(desglose_cab.retencion_total?number)?string["0.00"]}" TotalImpuestosTrasladados="${total_impuestos_t?string["0.00"]}">
            <#elseif desglose_cab.retencion_total != "0.00">
                <#assign exentoContador = exentoContador+1>
                <cfdi:Impuestos TotalImpuestosRetenidos="${(desglose_cab.retencion_total?number)?string["0.00"]}">
            <#elseif desglose_cab.ieps_total != "0.00" || desglose_cab.iva_total != "0.00" || total_traslados_ivacero gt 0 || tieneExento == true>
                <#assign exentoContador = exentoContador+1>
                <#if tiene_impuesto gt 0>
                    <cfdi:Impuestos TotalImpuestosTrasladados="${total_impuestos_t?string["0.00"]}">
                </#if>
            </#if>
        </#if>
    </#if>
        


        <#if desglose_cab.retencion_total != "0.00">
            <cfdi:Retenciones>
                <#assign json_ret = desglose_cab.rates_retencion_data>
                <#list json_ret as ret_rate, ret_total>
                    <#assign ret_ratenum = ret_rate?number>
                    <#assign ret_tasaocuota = ret_ratenum/100>
                    <cfdi:Retencion Importe="${(ret_total?number)?string["0.00"]}" Impuesto="002" />

                </#list>
            </cfdi:Retenciones>
        </#if>

        <#if desglose_cab.ieps_total != "0.00" || desglose_cab.iva_total != "0.00" || total_traslados_ivacero gt 0 || tieneExento == true>
            <#if tiene_impuesto gt 0 || tieneExento == true>
                <cfdi:Traslados>
                    <#assign json_ieps = desglose_cab.rates_ieps_data>
                    <#assign json_ivas = desglose_cab.rates_iva_data>
                    <#assign json_exento = desglose_cab.rates_exento_data>
                    <#assign json_ivas_base = desglose_cab.bases_iva>
                    <#assign json_ieps_base = desglose_cab.bases_ieps>
                    <#assign json_exento_base = desglose_cab.bases_exento>

                    <#list json_exento as exento_rate, exento_total>                                                                               
                        <#if desglosa_ieps == true>
                        <#assign tiene_impuesto = tiene_impuesto + 1>
                            <cfdi:Traslado Base="${json_exento_base[exento_rate]}" Impuesto="002" TipoFactor="Exento" />
                        </#if>
                    </#list>

                    <#list json_ieps as Ieps_rate, Ieps_total>
                        <#assign ieps_ratenum = Ieps_rate?number>
                        <#assign ieps_tasaocuota = ieps_ratenum/100>

                        <#if exchangeRate?number gt 0>
                            <#if currencyCode=="MXN">
                                <#assign Ieps_total = Ieps_total?number / exchangeRate?number>
                            <#else>
                                <#assign Ieps_total = Ieps_total?number>
                            </#if>
                        </#if>


                        <#if desglosa_ieps == true>
                        <#assign tiene_impuesto = tiene_impuesto + 1>
                            <cfdi:Traslado Base="${json_ieps_base[Ieps_rate]}" Importe="${Ieps_total?number?string["0.00"]}" Impuesto="003" TasaOCuota="${ieps_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                        </#if>
                    </#list>

                    <#assign numImpuestos = 0>
                    <#list json_ivas as Iva_rate, Iva_total>
                        <#assign numImpuestos = numImpuestos+1>
                    </#list>
                    <#list json_ivas as Iva_rate, Iva_total>
                        <#assign iva_ratenum = Iva_rate?number>
                        <#assign iva_tasaocuota = iva_ratenum/100>

                        <#if exchangeRate?number gt 0>
                            <#if currencyCode=="MXN">
                                <#if iva_tasaocuota!=0>
                                    <#assign Iva_total_ex = Iva_total?number / exchangeRate?number>
                                    <#assign Iva_total_ex = Iva_total?number+impuestoLineashipp?number>
                                <#else>
                                        <#assign Iva_total_ex = Iva_total?number>
                                </#if>
                            <#else>
                                <#assign Iva_total_ex = Iva_total?number+impuestoLineashipp?number>
                            </#if>
                            <#if iva_tasaocuota==0 && impuestoLineashipp?number gt 0 && numImpuestos==1>
                            <#assign tiene_impuesto = tiene_impuesto + 1>
                                <cfdi:Traslado Base="${(json_ivas_base[Iva_rate]?number+envio_total?number)?string["0.00"]}" Importe="${Iva_total_ex?number?string["0.00"]}" Impuesto="002" <#if impuesto_envio_rate?has_content>TasaOCuota="${(iva_tasaocuota+(impuesto_envio_rate?number/100))?string["0.000000"]}"<#else>TasaOCuota="${iva_tasaocuota?string["0.000000"]}"</#if> TipoFactor="Tasa" />
                                <cfdi:Traslado Base="${(json_ivas_base[Iva_rate]?number+envio_total?number)?string["0.00"]}" Importe="${Iva_total?number?string["0.00"]}" Impuesto="002" TasaOCuota="${iva_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                            <#else>
                            <#assign tiene_impuesto = tiene_impuesto + 1>
                                <cfdi:Traslado Base="${(json_ivas_base[Iva_rate]?number+envio_total?number)?string["0.00"]}" Importe="${Iva_total_ex?number?string["0.00"]}" Impuesto="002" TasaOCuota="${iva_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />
                            </#if>

                        <#else>
<#assign tiene_impuesto = tiene_impuesto + 1>
                            <cfdi:Traslado Base="${(json_ivas_base[Iva_rate]?number+envio_total?number)?string["0.00"]}" Importe="${(Iva_total?number+impuestoLineashipp?number)?string["0.00"]}" Impuesto="002" TasaOCuota="${iva_tasaocuota?string["0.000000"]}" TipoFactor="Tasa" />

                        </#if>
                    </#list>
                </cfdi:Traslados>
            </#if>
        </#if>

        <#if tiene_impuesto gt 0 || tieneExento == true>
            <#if exentoContador gt 0>
                </cfdi:Impuestos>
            </#if>
        </#if>

        <#if ImpLocal == true>
            <cfdi:Complemento>
                <#if desglose_cab.local_total?number gt 0>
                <implocal:ImpuestosLocales version="1.0" TotaldeRetenciones="0.00" TotaldeTraslados="${desglose_cab.local_total?number?string["0.00"]}">
                    <#else>
                    <implocal:ImpuestosLocales version="1.0" TotaldeRetenciones="${desglose_cab.local_total?number?abs?string["0.00"]}" TotaldeTraslados="0.00">
                        </#if>
                        <#assign json_local = desglose_cab.rates_local_data>

                        <#list json_local as local_rate, local_total>
                            <#assign local_ratenum = local_rate?number>
                            <#assign local_tasaocuota = local_ratenum/100>
                            <#if local_total.monto?number gt 0>
                                <implocal:TrasladosLocales ImpLocTrasladado="${local_total.nombre}" TasadeTraslado="${local_rate?number?string["0.00"]}" Importe="${local_total.monto?number?string["0.00"]}" />
                            <#else>
                                <implocal:RetencionesLocales ImpLocRetenido="${local_total.nombre}" TasadeRetencion="${local_rate?number?abs?string["0.00"]}" Importe="${local_total.monto?number?abs?string["0.00"]}" />
                            </#if>
                        </#list>
                    </implocal:ImpuestosLocales>
            </cfdi:Complemento>
        </#if>

        <#if ImpLocalobj?has_content>
            <cfdi:Complemento>
                <#if transaction.custbody_efx_fe_total_impuesto_local?has_content>
                    <implocal:ImpuestosLocales version="1.0" TotaldeRetenciones="${transaction.custbody_efx_fe_total_impuesto_local?string["0.00"]}" TotaldeTraslados="0.00">
                </#if>
                    <#assign json_local = ImpLocalobj?eval>

                    <#list json_local as impuestolocal>
                        <#assign local_tasaocuota = impuestolocal.tasadeRetencion?number * 100>
                        <#if impuestolocal.importe?number gt 0>
                            <implocal:RetencionesLocales ImpLocRetenido="${impuestolocal.impLocRetenido}" TasadeRetencion="${local_tasaocuota?abs?string["0.00"]}" Importe="${impuestolocal.importe?number?abs?string["0.00"]}" />
                        </#if>
                    </#list>
                </implocal:ImpuestosLocales>
            </cfdi:Complemento>
        </#if>
</cfdi:Comprobante>