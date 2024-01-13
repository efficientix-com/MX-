<?xml version="1.0" encoding="utf-8"?>
<#setting locale = "es_MX">
<#setting time_zone= "America/Mexico_City">
<#function getAttrPair attr value>
    <#if value?has_content>
        <#assign result="${attr}=\"${value}\"">
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
<#assign "companyTaxRegNumber" = custom.companyInfo.rfc>
<cfdi:Comprobante xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cfdi="http://www.sat.gob.mx/cfd/3" xsi:schemaLocation="http://www.sat.gob.mx/cfd/3 http://www.sat.gob.mx/sitio_internet/cfd/3/cfdv33.xsd http://www.sat.gob.mx/Pagos http://www.sat.gob.mx/sitio_internet/cfd/Pagos/Pagos10.xsd"
        <#if transaction.custbody_efx_fe_actual_date == true>
            <#assign aDateTime = .now>
            <#assign aDate = aDateTime?date>
            <#if transaction.custbody_efx_fe_fechadepago?has_content>
            <#assign aDatePago = transaction.custbody_efx_fe_fechadepago?string.iso_nz +"T"+transaction.custbody_efx_fe_actual_hour>
            <#else>
            <#assign aDatePago = transaction.trandate?string.iso_nz +"T"+transaction.custbody_efx_fe_actual_hour>
            </#if>
            Fecha="${aDate?string("yyyy-MM-dd")}T${aDate?string("HH:mm:ss")}"
        <#else>
            <#if transaction.custbody_efx_fe_fechadepago?has_content>
            <#assign aDatePago = transaction.custbody_efx_fe_fechadepago?string.iso_nz +"T"+ transaction.custbody_efx_fe_actual_hour>
            <#else>
            <#assign aDatePago = transaction.trandate?string.iso_nz +"T"+ transaction.custbody_efx_fe_actual_hour>
            </#if>
            Fecha="${transaction.trandate?string.iso_nz}T${transaction.custbody_efx_fe_actual_hour}"
        </#if>

        <#assign serie_parteuno = transaction.tranid?keep_before("-")>

        <#assign folio_transaction = transaction.tranid?keep_after("-")>
        <#assign jsonParcialidadField = transaction.custbody_efx_fe_parcialidad>
        <#assign jsonParcialidad = "">
        <#if jsonParcialidadField?has_content>
            <#assign jsonParcialidad = jsonParcialidadField?eval>
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
                  Moneda="XXX"
                  SubTotal="0"
                  TipoDeComprobante="P"
                  Total="0"
                  Version="3.3">
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

    <#if transaction.custbody_efx_fe_entity_timbra?has_content>
        <cfdi:Receptor Nombre="${transaction.custbody_efx_fe_factoraje_receptor}" Rfc="${transaction.custbody_efx_fe_factoraje_rfc}" UsoCFDI="P01" />
    <#else>
        <cfdi:Receptor Nombre="${customerName}" Rfc="${customer.custentity_mx_rfc}" UsoCFDI="P01" />
    </#if>

    <cfdi:Conceptos>
        <cfdi:Concepto Cantidad="1" ClaveProdServ="84111506" ClaveUnidad="ACT" Descripcion="Pago" Importe="0" ValorUnitario="0" />
    </cfdi:Conceptos>
    <#if currencyCode != "MXN">
        <#assign exchangeRateVal = exchangeRate>
    </#if>


    <#if transaction.custbody_efx_fe_moneda?has_content>
        <#if transaction.custbody_efx_fe_moneda != transaction.currency>
            <#assign currencyCode = transaction.custbody_efx_fe_moneda.symbol>
            <#assign exchangeRateVal = exchangeRate>
        </#if>
    </#if>

    <#assign montoPoliza = 0>
    <#list transaction.apply as txnitem>
        <#if txnitem.type == "Journal" && txnitem.apply == true>
            <#assign montoPoliza = montoPoliza+txnitem.amount>
        </#if>
    </#list>

    <cfdi:Complemento>
        <pago10:Pagos xmlns:pago10="http://www.sat.gob.mx/Pagos" Version="1.0">
            <pago10:Pago
                    FechaPago="${aDatePago}"
                    FormaDePagoP="${satCodes.paymentMethod}"
                    MonedaP="${currencyCode}"
                    <#if currencyCode != "MXN">
                        TipoCambioP="${exchangeRateVal}"
                    </#if>
                    <#if transaction.custbody_efx_fe_chbx_factorage == true>
                        <#if transaction.custbody_efx_fe_moneda?has_content &&  transaction.custbody_efx_fe_importe?has_content>
                            <#assign MontoFactor = transaction.custbody_efx_total_factoraje?number>
                            Monto="${(transaction.custbody_efx_fe_importe - MontoFactor - montoPoliza?number)?string["0.00"]}"
                        <#else>
                            <#assign MontoFactor = transaction.custbody_efx_total_factoraje>
                            Monto="${(transaction.payment - montoPoliza)?string["0.00"]}"
                        </#if>
                    <#else>
                        <#if transaction.custbody_efx_fe_moneda?has_content &&  transaction.custbody_efx_fe_importe?has_content>
                            Monto="${(transaction.custbody_efx_fe_importe?number - montoPoliza)?string["0.00"]}"
                        <#else>
                            Monto="${(transaction.payment-montoPoliza)?string["0.00"]}"
                        </#if>
                    </#if>

                    <#if transaction.custbody_mx_cfdi_payment_id?has_content>
                        NumOperacion="${transaction.custbody_mx_cfdi_payment_id}"
                    </#if>
                    <#if transaction.custbody_mx_cfdi_issuer_entity_rfc?has_content>
                        RfcEmisorCtaOrd="${transaction.custbody_mx_cfdi_issuer_entity_rfc}"
                    </#if>
                    <#if transaction.custbody_mx_cfdi_issue_bank_name?has_content>
                        NomBancoOrdExt="${transaction.custbody_mx_cfdi_issue_bank_name}"
                    </#if>
                    <#if transaction.custbody_mx_cfdi_payer_account?has_content>
                        CtaOrdenante="${transaction.custbody_mx_cfdi_payer_account}"
                    </#if>
                    <#if transaction.custbody_mx_cfdi_recipient_entity_rfc?has_content>
                        RfcEmisorCtaBen="${transaction.custbody_mx_cfdi_recipient_entity_rfc}"
                    </#if>
                    <#if transaction.custbody_mx_cfdi_recipient_account?has_content>
                        CtaBeneficiario="${transaction.custbody_mx_cfdi_recipient_account}"
                    </#if>
                    <#if transaction.custbody_mx_cfdi_payment_string_type?has_content>
                        TipoCadPago="${satCodes.paymentStringTypeCode}"
                    </#if>
                    <#if transaction.custbody_mx_cfdi_payment_certificate?has_content>
                        CertPago="${transaction.custbody_mx_cfdi_payment_certificate}"
                    </#if>
                    <#if transaction.custbody_mx_cfdi_payment_string?has_content>
                        CadPago="${transaction.custbody_mx_cfdi_payment_string}"
                    </#if>
                    <#if transaction.custbody_mx_cfdi_payment_signature?has_content>
                        SelloPago="${transaction.custbody_mx_cfdi_payment_signature}"
                    </#if>
            >

                <#if transaction.custbody_efx_fe_tipo_cambio_factura == true>
                    <#assign obj_line_tc = transaction.custbody_efx_fe_factoraje_json>
                    <#assign obj_line_tcambio = obj_line_tc?eval>
                    <#list obj_line_tcambio?keys as key>
                        <#list custom.appliedTxns as appliedTxn>
                            <#if key == appliedTxn.custbody_mx_cfdi_folio>
                                <#assign txnitem = transaction.apply[appliedTxn.line?number]>
                                <#if txnitem.type != "Journal" && txnitem.type != "Diario">
                                    <#assign invPaymentTerm = satCodes.paymentTermInvMap["d"+appliedTxn.id]>
                                    <#if custom.multiCurrencyFeature == "true">
                                        <#assign appliedTxnCurrency = appliedTxn.currencysymbol>
                                    <#else>
                                        <#assign appliedTxnCurrency = currencyCode>
                                    </#if>
                                    <#assign foliorelated = txnitem.refnum>
                                    <#assign foliorelated_serie = foliorelated?keep_before("-")>
                                    <#assign foliorelated_folio = foliorelated?keep_after("-")>
                                    <#assign ImpSaldoAnt = "">
                                    <#assign CalculoParcialidad = "">

                                    <#if appliedTxn.imp?has_content>
                                        <#if appliedTxn.imp?number gt 0>
                                            <#assign ImpSaldoAnt = appliedTxn.imp?number>
                                        <#else>
                                            <#assign jsonParcialidadField = transaction.custbody_efx_fe_parcialidad>
                                            <#if jsonParcialidadField?has_content>
                                                <#assign jsonParcialidad = jsonParcialidadField?eval>
                                                <#list jsonParcialidad as jsonParcialidad_line>

                                                    <#if foliorelated==jsonParcialidad_line.facturaRef>
                                                        <#assign ImpSaldoAnt = jsonParcialidad_line.imp>
                                                    </#if>
                                                </#list>

                                            </#if>
                                        </#if>
                                        <#assign CalculoParcialidad = appliedTxn.parcialidad>
                                    <#else>
                                        <#assign jsonParcialidadField = transaction.custbody_efx_fe_parcialidad>
                                        <#if jsonParcialidadField?has_content>
                                            <#assign jsonParcialidad = jsonParcialidadField?eval>
                                            <#list jsonParcialidad as jsonParcialidad_line>
                                                <#if foliorelated==jsonParcialidad_line.facturaRef>
                                                    <#assign ImpSaldoAnt = jsonParcialidad_line.imp>
                                                </#if>
                                                <#assign CalculoParcialidad = jsonParcialidad_line.parcialidad>
                                            </#list>

                                        </#if>

                                    </#if>


                                <#assign impinsoluto = ImpSaldoAnt - txnitem.amount>

                                <#if transaction.custbody_efx_fe_chbx_factorage == true>
                                <#if impinsoluto gt 0>
                                <#assign impinsoluto = impinsoluto>
                                <#else>
                                <#assign impinsoluto = txnitem.disc>
                                </#if>
                                    <pago10:DoctoRelacionado IdDocumento="${appliedTxn.custbody_mx_cfdi_uuid}" ${getAttrPair("Folio",foliorelated_folio)} ${getAttrPair("Serie",foliorelated_serie)} MonedaDR="${appliedTxnCurrency}" <#if transaction.custbody_efx_fe_moneda?has_content &&  transaction.custbody_efx_fe_importe?has_content>TipoCambioDR="${transaction.custbody_efx_fe_tipo_cambio?number?string["0.000000"]}"<#elseif transaction.custbody_efx_fe_tipo_cambio_factura == true>TipoCambioDR="${obj_line_tcambio[key].t_cambio}"</#if> MetodoDePagoDR="${invPaymentTerm}" NumParcialidad="${CalculoParcialidad}" ImpSaldoAnt="${(ImpSaldoAnt)?string["0.00"]}" ImpPagado="${txnitem.amount?string["0.00"]}" ImpSaldoInsoluto="${impinsoluto?string["0.00"]}" />
                                <#else>
                                    <pago10:DoctoRelacionado IdDocumento="${appliedTxn.custbody_mx_cfdi_uuid}" ${getAttrPair("Folio",foliorelated_folio)} ${getAttrPair("Serie",foliorelated_serie)} MonedaDR="${appliedTxnCurrency}" <#if transaction.custbody_efx_fe_moneda?has_content &&  transaction.custbody_efx_fe_importe?has_content>TipoCambioDR="${transaction.custbody_efx_fe_tipo_cambio?number?string["0.000000"]}"</#if> MetodoDePagoDR="${invPaymentTerm}" NumParcialidad="${CalculoParcialidad}" ImpSaldoAnt="${(ImpSaldoAnt)?string["0.00"]}" ImpPagado="${txnitem.amount?string["0.00"]}" ImpSaldoInsoluto="${impinsoluto?string["0.00"]}" />
                                </#if>
                                </#if>
                            </#if>

                        </#list>
                    </#list>

                <#else>

                    <#list custom.appliedTxns as appliedTxn>
                        <#assign "txnitem" = transaction.apply[appliedTxn.line?number]>
                        <#if txnitem.type != "Journal" && txnitem.type != "Diario">
                        <#assign "invPaymentTerm" = satCodes.paymentTermInvMap["d"+appliedTxn.id]>
                        <#if custom.multiCurrencyFeature == "true">
                            <#assign appliedTxnCurrency = appliedTxn.currencysymbol>
                        <#else>
                            <#assign appliedTxnCurrency = currencyCode>
                        </#if>

                        <#assign foliorelated = txnitem.refnum>
                        <#assign foliorelated_serie = foliorelated?keep_before("-")>
                        <#assign foliorelated_folio = foliorelated?keep_after("-")>
                        <#assign ImpSaldoAnt = "">
                        <#assign CalculoParcialidad = "">

                        <#if appliedTxn.imp?has_content>

                                <#if appliedTxn.imp?number gt 0>
                                    <#assign ImpSaldoAnt = appliedTxn.imp?number>
                                <#else>
                                    <#assign jsonParcialidadField = transaction.custbody_efx_fe_parcialidad>
                                    <#if jsonParcialidadField?has_content>
                                        <#assign jsonParcialidad = jsonParcialidadField?eval>
                                        <#list jsonParcialidad as jsonParcialidad_line>

                                            <#if foliorelated==jsonParcialidad_line.facturaRef>
                                                <#assign ImpSaldoAnt = jsonParcialidad_line.imp>
                                            </#if>
                                        </#list>

                                    </#if>
                                </#if>
                            <#assign CalculoParcialidad = appliedTxn.parcialidad>
                            <#else>
                                <#assign jsonParcialidadField = transaction.custbody_efx_fe_parcialidad>
                                <#if jsonParcialidadField?has_content>
                                    <#assign jsonParcialidad = jsonParcialidadField?eval>
                                    <#list jsonParcialidad as jsonParcialidad_line>
                                        <#if foliorelated==jsonParcialidad_line.facturaRef>
                                            <#assign ImpSaldoAnt = jsonParcialidad_line.imp>
                                        </#if>
                                        <#assign CalculoParcialidad = jsonParcialidad_line.parcialidad>
                                    </#list>

                                </#if>

                        </#if>

                        <#assign impinsoluto = ImpSaldoAnt - txnitem.amount>

                        <#if transaction.custbody_efx_fe_chbx_factorage == true>
                            <#if impinsoluto gt 0>
                                <#assign impinsoluto = impinsoluto>
                                <#else>
                                <#assign impinsoluto = txnitem.disc>
                            </#if>

                            <pago10:DoctoRelacionado IdDocumento="${appliedTxn.custbody_mx_cfdi_uuid}" ${getAttrPair("Folio",foliorelated_folio)} ${getAttrPair("Serie",foliorelated_serie)} MonedaDR="${appliedTxnCurrency}" <#if transaction.custbody_efx_fe_moneda?has_content &&  transaction.custbody_efx_fe_importe?has_content>TipoCambioDR="${transaction.custbody_efx_fe_tipo_cambio?number?string["0.000000"]}"</#if> MetodoDePagoDR="${invPaymentTerm}" NumParcialidad="${CalculoParcialidad}" ImpSaldoAnt="${(ImpSaldoAnt)?string["0.00"]}" ImpPagado="${txnitem.amount?string["0.00"]}" ImpSaldoInsoluto="${impinsoluto?string["0.00"]}" />
                        <#else>

                            <pago10:DoctoRelacionado IdDocumento="${appliedTxn.custbody_mx_cfdi_uuid}" ${getAttrPair("Folio",foliorelated_folio)} ${getAttrPair("Serie",foliorelated_serie)} MonedaDR="${appliedTxnCurrency}" <#if transaction.custbody_efx_fe_moneda?has_content &&  transaction.custbody_efx_fe_importe?has_content>TipoCambioDR="${transaction.custbody_efx_fe_tipo_cambio?number?string["0.000000"]}"</#if> MetodoDePagoDR="${invPaymentTerm}" NumParcialidad="${CalculoParcialidad}" ImpSaldoAnt="${(ImpSaldoAnt)?string["0.00"]}" ImpPagado="${txnitem.amount?string["0.00"]}" ImpSaldoInsoluto="${impinsoluto?string["0.00"]}" />

                        </#if>
                        </#if>
                    </#list>
                </#if>

            </pago10:Pago>


            <#if transaction.custbody_efx_fe_chbx_factorage == true>
                <pago10:Pago
                        FechaPago="${aDatePago}"
                        FormaDePagoP="17"
                        MonedaP="${currencyCode}"
                        ${getAttrPair("TipoCambioP",exchangeRateVal)}
                        Monto="${(MontoFactor?number-montoPoliza)?string["0.00"]}"
                        <#if transaction.custbody_mx_cfdi_payment_id?has_content>
                            NumOperacion="${transaction.custbody_mx_cfdi_payment_id}"
                        </#if>
                        <#if transaction.custbody_mx_cfdi_issuer_entity_rfc?has_content>
                            RfcEmisorCtaOrd="${transaction.custbody_mx_cfdi_issuer_entity_rfc}"
                        </#if>
                        <#if transaction.custbody_mx_cfdi_issue_bank_name?has_content>
                            NomBancoOrdExt="${transaction.custbody_mx_cfdi_issue_bank_name}"
                        </#if>
                        <#if transaction.custbody_mx_cfdi_payer_account?has_content>
                            CtaOrdenante="${transaction.custbody_mx_cfdi_payer_account}"
                        </#if>
                        <#if transaction.custbody_mx_cfdi_recipient_entity_rfc?has_content>
                            RfcEmisorCtaBen="${transaction.custbody_mx_cfdi_recipient_entity_rfc}"
                        </#if>
                        <#if transaction.custbody_mx_cfdi_recipient_account?has_content>
                            CtaBeneficiario="${transaction.custbody_mx_cfdi_recipient_account}"
                        </#if>
                        <#if transaction.custbody_mx_cfdi_payment_string_type?has_content>
                            TipoCadPago="${satCodes.paymentStringTypeCode}"
                        </#if>
                        <#if transaction.custbody_mx_cfdi_payment_certificate?has_content>
                            CertPago="${transaction.custbody_mx_cfdi_payment_certificate}"
                        </#if>
                        <#if transaction.custbody_mx_cfdi_payment_string?has_content>
                            CadPago="${transaction.custbody_mx_cfdi_payment_string}"
                        </#if>
                        <#if transaction.custbody_mx_cfdi_payment_signature?has_content>
                            SelloPago="${transaction.custbody_mx_cfdi_payment_signature}"
                        </#if>
                >
                    <#list custom.appliedTxns as appliedTxn>
                        <#assign "txnitem" = transaction.apply[appliedTxn.line?number]>
                        <#if txnitem.type != "Journal" && txnitem.type != "Diario">
                        <#assign "invPaymentTerm" = satCodes.paymentTermInvMap["d"+appliedTxn.id]>
                        <#if custom.multiCurrencyFeature == "true">
                            <#assign appliedTxnCurrency = appliedTxn.currencysymbol>
                        <#else>
                            <#assign appliedTxnCurrency = currencyCode>
                        </#if>


                        <#assign foliorelated = txnitem.refnum>
                        <#assign foliorelated_serie = foliorelated?keep_before("-")>
                        <#assign foliorelated_folio = foliorelated?keep_after("-")>
                        <#assign ImpSaldoAnt = "">

                        <#assign CalculoParcialidad = "">

                        <#if appliedTxn.imp?has_content>
                            <#if appliedTxn.imp?number gt 0>
                                <#assign ImpSaldoAnt = appliedTxn.imp?number>
                            <#else>
                                <#assign jsonParcialidadField = transaction.custbody_efx_fe_parcialidad>
                                <#if jsonParcialidadField?has_content>
                                    <#assign jsonParcialidad = jsonParcialidadField?eval>
                                    <#list jsonParcialidad as jsonParcialidad_line>

                                        <#if foliorelated==jsonParcialidad_line.facturaRef>
                                            <#assign ImpSaldoAnt = jsonParcialidad_line.imp>
                                        </#if>
                                    </#list>

                                </#if>
                            </#if>
                            <#assign CalculoParcialidad = appliedTxn.parcialidad>
                        <#else>
                            <#assign jsonParcialidadField = transaction.custbody_efx_fe_parcialidad>
                            <#if jsonParcialidadField?has_content>
                                <#assign jsonParcialidad = jsonParcialidadField?eval>
                                <#list jsonParcialidad as jsonParcialidad_line>
                                    <#if foliorelated==jsonParcialidad_line.facturaRef>
                                        <#assign ImpSaldoAnt = jsonParcialidad_line.imp>
                                    </#if>
                                    <#assign CalculoParcialidad = jsonParcialidad_line.parcialidad>
                                </#list>

                            </#if>

                        </#if>

                        <#assign ImpSaldoAnt = ImpSaldoAnt - txnitem.amount>

                        <#if ImpSaldoAnt gt 0>
                        <#assign ImpSaldoAnt = ImpSaldoAnt>
                        <#else>
                        <#assign ImpSaldoAnt = txnitem.disc>
                        </#if>


                        <#assign impinsoluto = ImpSaldoAnt - txnitem.disc>



                        <pago10:DoctoRelacionado IdDocumento="${appliedTxn.custbody_mx_cfdi_uuid}" ${getAttrPair("Folio",foliorelated_folio)} ${getAttrPair("Serie",foliorelated_serie)} MonedaDR="${appliedTxnCurrency}" <#if transaction.custbody_efx_fe_moneda?has_content &&  transaction.custbody_efx_fe_importe?has_content>TipoCambioDR="${transaction.custbody_efx_fe_tipo_cambio?number?string["0.000000"]}"</#if> MetodoDePagoDR="${invPaymentTerm}" NumParcialidad="${CalculoParcialidad?number + 1}" ImpSaldoAnt="${ImpSaldoAnt?string["0.00"]}" ImpPagado="${txnitem.disc?string["0.00"]}" ImpSaldoInsoluto="${impinsoluto?string["0.00"]}" />
                        </#if>
                    </#list>

                </pago10:Pago>
            </#if>


        </pago10:Pagos>
    </cfdi:Complemento>
</cfdi:Comprobante>