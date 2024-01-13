<?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
    <#setting locale = "es_MX">
    <#setting time_zone= "America/Mexico_City">
    <#setting number_format=",##0.00">

    <#assign "dataXML" = "">
    <#if custom?has_content>
        <#if custom.dataXML?has_content>
            <#assign "dataXML" = custom.dataXML>

        </#if>
        <#setting locale=custom.locale>
        <#assign labels = custom.labels>
        <#if custom.certData?has_content>
            <#assign "certData" = custom.certData>
        <#else>
            <#assign "certData" = record>
        </#if>
        <#assign "satCodes" = custom.satcodes>

        <#if custom.multiCurrencyFeature == "true">
            <#assign "currencyCode" = record.currencysymbol>
            <#assign exchangeRate = record.exchangerate?string.number>
        <#else>
            <#assign "currencyCode" = "MXN">
            <#assign exchangeRate = 1>
        </#if>
        <#if custom.oneWorldFeature == "true">
            <#assign customCompanyInfo = record.subsidiary>
        <#else>
            <#assign "customCompanyInfo" = companyInformation>
        </#if>
        <#if customer.isperson == "T">
            <#assign customerName = customer.firstname + ' ' + customer.lastname>
        <#else>
            <#assign "customerName" = customer.companyname>
        </#if>
        <#assign "summary" = custom.summary>
        <#assign "totalAmount" = summary.subtotal - summary.totalDiscount>
        <#assign "companyTaxRegNumber" = custom.companyInfo.rfc>
        <#assign currencySymbolMap = {"USD":"$","CAD":"$","EUR":"€","AED":"د.إ.‏","AFN":"؋","ALL":"Lek","AMD":"դր.","ARS":"$","AUD":"$","AZN":"ман.","BAM":"KM","BDT":"৳","BGN":"лв.","BHD":"د.ب.‏","BIF":"FBu","BND":"$","BOB":"Bs","BRL":"R$","BWP":"P","BYR":"BYR","BZD":"$","CDF":"FrCD","CHF":"CHF","CLP":"$","CNY":"CN¥","COP":"$","CRC":"₡","CVE":"CV$","CZK":"Kč","DJF":"Fdj","DKK":"kr","DOP":"RD$","DZD":"د.ج.‏","EEK":"kr","EGP":"ج.م.‏","ERN":"Nfk","ETB":"Br","GBP":"£","GEL":"GEL","GHS":"GH₵","GNF":"FG","GTQ":"Q","HKD":"$","HNL":"L","HRK":"kn","HUF":"Ft","IDR":"Rp","ILS":"₪","INR":"টকা","IQD":"د.ع.‏","IRR":"﷼","ISK":"kr","JMD":"$","JOD":"د.أ.‏","JPY":"￥","KES":"Ksh","KHR":"៛","KMF":"FC","KRW":"₩","KWD":"د.ك.‏","KZT":"тңг.","LBP":"ل.ل.‏","LKR":"SL Re","LTL":"Lt","LVL":"Ls","LYD":"د.ل.‏","MAD":"د.م.‏","MDL":"MDL","MGA":"MGA","MKD":"MKD","MMK":"K","MOP":"MOP$","MUR":"MURs","MXN":"$","MYR":"RM","MZN":"MTn","NAD":"N$","NGN":"₦","NIO":"C$","NOK":"kr","NPR":"नेरू","NZD":"$","OMR":"ر.ع.‏","PAB":"B/.","PEN":"S/.","PHP":"₱","PKR":"₨","PLN":"zł","PYG":"₲","QAR":"ر.ق.‏","RON":"RON","RSD":"дин.","RUB":"руб.","RWF":"FR","SAR":"ر.س.‏","SDG":"SDG","SEK":"kr","SGD":"$","SOS":"Ssh","SYP":"ل.س.‏","THB":"฿","TND":"د.ت.‏","TOP":"T$","TRY":"TL","TTD":"$","TWD":"NT$","TZS":"TSh","UAH":"₴","UGX":"USh","UYU":"$","UZS":"UZS","VEF":"Bs.F.","VND":"₫","XAF":"FCFA","XOF":"CFA","YER":"ر.ي.‏","ZAR":"R","ZMK":"ZK"}>
        <#function fmtc value>
            <#assign dst =  currencySymbolMap[currencyCode] + value?number?string[",##0.00"]>
            <#return dst>
        </#function>
    <#else>
        <#assign "certData" = record>
    </#if>

    <#assign infoEmpresa = record.subsidiary>

    <head>
        <#assign "shipmentcost" = 0>
        <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}"
              src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}"
              src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2"/>
        <#if .locale == "zh_CN">
            <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}"
                  src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2"/>
        <#elseif .locale == "zh_TW">
            <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}"
                  src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2"/>
        <#elseif .locale == "ja_JP">
            <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}"
                  src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2"/>
        <#elseif .locale == "ko_KR">
            <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}"
                  src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2"/>
        <#elseif .locale == "th_TH">
            <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}"
                  src-bold="${nsfont.NotoSansThai_Bold}" bytes="2"/>
        </#if>
        <macrolist>
            <macro id="nlheader">
                <table class="header" height="90px" style="width: 100%;">
                    <tr height="90px">
                        <td colspan="6" height="90px">
                            <#if certData?has_content>
                                <#if record.custbody_efx_fe_info_location_pdf == true>
                                    <#if record.custbody_efx_fe_logoloc?has_content>
                                        <#assign "dominio" = "https://system.netsuite.com">
                                        <#assign "urldir" = "https://system.netsuite.com"+record.custbody_efx_fe_logoloc>
                                        <img height="80px" src="${urldir}"/>
                                    </#if>
                                <#else>
                                    <#if record.custbody_efx_fe_logosub?has_content>
                                        <#assign "dominio" = "https://system.netsuite.com">
                                        <#assign "urldir" = "https://system.netsuite.com"+record.custbody_efx_fe_logosub>
                                        <img height="80px" src="${urldir}"/>
                                    </#if>
                                </#if>

                            <#else>
                                <#if record.custbody_efx_fe_info_location_pdf == true>
                                    <#if record.custbody_efx_fe_logoloc?has_content>
                                        <#assign "dominio" = "https://system.netsuite.com">
                                        <#assign "urldir" = "https://system.netsuite.com"+record.custbody_efx_fe_logoloc>
                                        <img height="80px" src="${urldir}"/>
                                    </#if>
                                <#else>
                                    <#if record.custbody_efx_fe_logosub?has_content>
                                        <#assign "dominio" = "https://system.netsuite.com">
                                        <#assign "urldir" = "https://system.netsuite.com"+record.custbody_efx_fe_logosub>
                                        <img height="80px" src="${urldir}"/>
                                    <#else>
                                        <#if infoEmpresa.logo@url?length != 0>
                                            <span><img height="80px" src="${infoEmpresa.logo@url}"/></span>
                                        <#elseif companyInformation.logoUrl?length != 0>
                                            <img height="80px" src="${companyInformation.logoUrl}"/>
                                        </#if>
                                    </#if>
                                </#if>
                            </#if>

                        </td>
                        <td colspan="6" align="left" style="font-size: 12px; margin-bottom:100px">
                            <strong>${record.subsidiary}</strong>
                            <br/>
                            <#if record.custbody_efx_fe_info_location_pdf == true>
                                ${record.custbody_efx_fe_dirloc}
                            <#else>
                                ${record.custbody_efx_fe_dirsubs}
                            </#if>


                        </td>
                        <td colspan="1">&nbsp;</td>
                        <td colspan="4" style="font-size: 10px;" align="right"><span style="font-size: 20px;"><strong>Nota de Crédito</strong></span><br/><br/><br/>
                            <#if dataXML?has_content>
                                <#assign folio_tran = dataXML.atributos.Serie +""+ dataXML.atributos.Folio>
                                <span class="number" style="font-size: 18px; color:  #FF0000">#${folio_tran}</span>
                                <br/> <br/>${dataXML.atributos.Fecha}<br/>
                            <#else>
                                <span class="number" style="font-size: 18px; color:  #FF0000">#${record.tranid}</span>
                                <br/> <br/>${record.createdDate}<br/>
                            </#if>


                        </td>
                        <td align="right">
                            <span class="number"></span>
                        </td>
                    </tr>
                </table>
            </macro>
            <macro id="nlfooter">
                <table class="footer" style="width: 100%;">
                    <tr>
                        <td style="font-size: 6pt; text-align:left;">
                                    ESTE DOCUMENTO ES UNA REPRESENTACIÓN IMPRESA DE UN CFDI.
                        </td>
                        <td align="right">
                            <pagenumber/>
                            de
                            <totalpages/>
                        </td>
                    </tr>
                </table>
            </macro>
        </macrolist>
        <style type="text/css">* {
            <#if .locale == "zh_CN"> font-family: NotoSans, NotoSansCJKsc, sans-serif;
            <#elseif .locale == "zh_TW"> font-family: NotoSans, NotoSansCJKtc, sans-serif;
            <#elseif .locale == "ja_JP"> font-family: NotoSans, NotoSansCJKjp, sans-serif;
            <#elseif .locale == "ko_KR"> font-family: NotoSans, NotoSansCJKkr, sans-serif;
            <#elseif .locale == "th_TH"> font-family: NotoSans, NotoSansThai, sans-serif;
            <#else> font-family: NotoSans, sans-serif;
            </#if>
            }

            table {
                font-size: 9pt;
                table-layout: fixed;
            }

            th {
                font-weight: bold;
                font-size: 8pt;
                vertical-align: middle;
                padding: 5px 6px 3px;
                background-color: #e3e3e3;
                color: #161616;
            }

            table.tablascompletas {
                width: 100%;
                margin-top: 10px;
                border: 1px;
                border-color: #e3e3e3
            }

            td.cuerposnoarticulos {
                padding: 2px;
                font-size: 7pt;
            }

            td.cabecera, th.cabecera {
                color: #000000;
                font-size: 8pt;
                background-color: #e3e3e3;
                padding: 2px;
            }

            td {
                padding: 4px 6px;
            }

            td p {
                align: left
            }

            b {
                font-weight: bold;
                color: #000000;
            }

            table.header td {
                padding: 0px;
                font-size: 10pt;
            }

            table.footer td {
                padding: 0px;
                font-size: 8pt;
            }

            table.itemtable th {
                padding-bottom: 10px;
                padding-top: 10px;
            }

            table.desglose td {
                font-size: 4pt;
                padding-top: 0px;
                padding-bottom: 0px;
            }

            table.body td {
                padding-top: 2px;
            }

            table.total {
                page-break-inside: avoid;
            }

            tr.totalrow {
                background-color: #e3e3e3;
                line-height: 200%;
            }

            td.totalboxtop {
                font-size: 12pt;
                background-color: #e3e3e3;
            }

            td.addressheader {
                font-size: 8pt;
                padding-top: 6px;
                padding-bottom: 2px;
            }

            td.subtotal {
                text-align: right;
            }

            td.address {
                padding-top: 0px;
            }

            td.totalboxmid {
                font-size: 28pt;
                padding-top: 20px;
                background-color: #e3e3e3;
            }

            td.totalboxbot {
                background-color: #e3e3e3;
                font-weight: bold;
            }

            span.title {
                font-size: 28pt;
            }

            span.number {
                font-size: 16pt;
            }

            span.itemname {
                font-weight: bold;
                line-height: 150%;
            }

            hr {
                width: 100%;
                color: #ffffff;
                background-color: #e3e3e3;
                height: 1px;
            }
        </style>
    </head>
    <body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">

    <#assign "desglosa_cliente" = record.entity.custentity_efx_cmp_registra_ieps>
    <#assign "tipoGBL" = record.custbody_efx_fe_gbl_type>

    <#assign "desglose_json_body" = record.custbody_efx_fe_tax_json>
    <#if desglose_json_body?has_content>
        <#assign "desglose_body" = desglose_json_body?eval>
        <#assign "desglose_ieps" = desglose_body.rates_ieps>
        <#assign "desglose_iva" = desglose_body.rates_iva>
        <#assign "ieps_total" = desglose_body.ieps_total>
        <#assign "iva_total" = desglose_body.iva_total>
        <#assign "local_total" = desglose_body.local_total>
        <#assign "desglose_ret" = desglose_body.rates_retencion>
        <#assign "desglose_loc" = desglose_body.rates_local>
        <#assign "desglose_total_discount" = desglose_body.descuentoSinImpuesto>
        <#assign "cabecera_total" = desglose_body.total>
        <#assign "cabecera_subtotal" = desglose_body.subtotal>
        <#else>
            <#assign "desglose_body" = {}>
            <#assign "desglose_ieps" = 0>
            <#assign "desglose_iva" = 0>
            <#assign "ieps_total" = 0>
            <#assign "iva_total" = 0>
            <#assign "local_total" = 0>
            <#assign "desglose_ret" = 0>
            <#assign "desglose_loc" = 0>
            <#assign "desglose_total_discount" = 0>
            <#assign "cabecera_total" = 0>
            <#assign "cabecera_subtotal" = 0>
    </#if>


    <#assign "obj_totales_imp"= {}>
    <#assign totaliepsGBL = 0/>
    <#assign totalivaGBL = 0/>
    <#assign totalretGBL = 0/>
    <#assign totallocGBL = 0/>
    <#assign totalivaimp = 0/>
    <#assign totaldiscount = 0/>
    <#assign totaliepsimp = 0/>
    <table style="width: 100%; margin-top: 10px;">
        <tr style="margin-top: 35px;">
            <td
                colspan="4"
                style="font-size: 10pt; padding: 6px 0px 2px; font-weight: bold; color: rgb(51, 51, 51); width: 25%;">Receptor:</td>
            <td
                colspan="4"
                style="font-size: 10pt; padding: 6px 0px 2px; font-weight: bold; color: rgb(51, 51, 51); width: 25%;">Domicilio Fiscal:</td>
            <td
                colspan="5"
                style="font-size: 12pt; background-color: #e3e3e3; font-weight: bold;">${record.total@label?upper_case}</td>
        </tr>
        <tr>
            <td colspan="4" style="padding: 0px; width: 25%; font-size: 8pt">${record.entity.addressee}<br/>
                <span style="font-size:10px;"><strong>RFC:</strong>${record.entity.companyInfo.custentity_mx_rfc}</span>
                <#if record.entity.custentity_mx_sat_industry_type?has_content>
                    <br /><b>Regimen Fiscal:</b> ${record.entity.custentity_mx_sat_industry_type?upper_case}
                </#if>
            </td>
            <td colspan="4" style="padding: 0px; width: 25%; font-size: 8pt">${record.entity.address}</td>
            <td
                align="right"
                colspan="5"
                style="font-size: 22pt; padding-top: 20px; background-color: #e3e3e3;">${record.total}
            </td>
        </tr>
    </table>

    <table style="width: 100%; margin-top: 10px;">
        <tr>
            <th>Lugar de Expedici&oacute;n:</th>
            <th>Forma de Pago:</th>
            <th>Serie/Folio:</th>
            <#if record.custbody_mx_cfdi_sat_export_type?has_content>
                <th>Tipo Exportación:</th>
            </#if>
        </tr>
        <tr>
            <#--  <td style="padding-top: 2px; font-size: 8pt">${record.custbody_efx_fe_lugar_expedicion}</td>  -->
            <#if dataXML?has_content>
                <td style="padding-top: 2px; font-size: 8pt">${dataXML.atributos.LugarExpedicion}</td>
            <#else>
                <td style="padding-top: 2px; font-size: 8pt">${record.subsidiary.address.zip}</td>
            </#if>
            <#--  <td style="padding-top: 2px; font-size: 8pt">${record.custbody_efx_fe_formapago.custrecord_efx_fe_fompago_codsat} - ${record.custbody_efx_fe_formapago}</td>  -->
            <#assign forma_pago = record.custbody_mx_txn_sat_payment_method?keep_before(" ")>
                <#if forma_pago == "01">
                    <td style="padding-top: 2px; font-size: 8pt">01 - EFECTIVO</td>
                    <#elseif forma_pago == "02">
                        <td style="padding-top: 2px; font-size: 8pt">02 - CHEQUE NOMINATIVO</td>
                    <#elseif forma_pago == "03">
                        <td style="padding-top: 2px; font-size: 8pt">03 - TRANSFERENCIA ELECTRÓNICA DE FONDOS</td>
                    <#elseif forma_pago == "04">
                    <td style="padding-top: 2px; font-size: 8pt">04 - TARJETA DE CRÉDITO</td>
                    <#elseif forma_pago == "05">
                        <td style="padding-top: 2px; font-size: 8pt">05 - MONEDERO ELECTRÓNICO</td>
                    <#elseif forma_pago == "06">
                        <td style="padding-top: 2px; font-size: 8pt">06 - DINERO ELECTRÓNICO</td>
                    <#elseif forma_pago == "07">
                        <td style="padding-top: 2px; font-size: 8pt">07 - TARJETAS DIGITALES</td>
                    <#elseif forma_pago == "08">
                        <td style="padding-top: 2px; font-size: 8pt">08 - VALES DE DESPENSA</td>
                    <#elseif forma_pago == "09">
                        <td style="padding-top: 2px; font-size: 8pt">09 - BIENES</td>
                    <#elseif forma_pago == "10">
                        <td style="padding-top: 2px; font-size: 8pt">10 - SERVICIO</td>
                    <#elseif forma_pago == "11">
                        <td style="padding-top: 2px; font-size: 8pt">11 - POR CUENTA DE TERCERO</td>
                    <#elseif forma_pago == "12">
                        <td style="padding-top: 2px; font-size: 8pt">12 - DACIÓN EN PAGO</td>
                    <#elseif forma_pago == "13">
                        <td style="padding-top: 2px; font-size: 8pt">13 - PAGO POR SUBROGACIÓN</td>
                    <#elseif forma_pago == "14">
                        <td style="padding-top: 2px; font-size: 8pt">14 - PAGO POR CONSIGNACIÓN</td>
                    <#elseif forma_pago == "15">
                        <td style="padding-top: 2px; font-size: 8pt">15 - CONDONACIÓN</td>
                    <#elseif forma_pago == "16">
                        <td style="padding-top: 2px; font-size: 8pt">16 - CANCELACIÓN</td>
                    <#elseif forma_pago == "17">
                        <td style="padding-top: 2px; font-size: 8pt">17 - COMPENSACIÓN</td>
                    <#elseif forma_pago == "23">
                        <td style="padding-top: 2px; font-size: 8pt">23 - NOVACIÓN</td>
                    <#elseif forma_pago == "24">
                        <td style="padding-top: 2px; font-size: 8pt">24 - CONFUSIÓN</td>
                    <#elseif forma_pago == "25">
                        <td style="padding-top: 2px; font-size: 8pt">25 - REMISIÓN DE DEUDA</td>
                    <#elseif forma_pago == "26">
                        <td style="padding-top: 2px; font-size: 8pt">26 - PRESCRIPCIÓN O CADUCIDAD</td>
                    <#elseif forma_pago == "27">
                        <td style="padding-top: 2px; font-size: 8pt">27 - A SATISFACCIÓN DEL ACREEDOR</td>
                    <#elseif forma_pago == "28">
                        <td style="padding-top: 2px; font-size: 8pt">28 - TARJETA DE DÉBITO</td>
                    <#elseif forma_pago == "29">
                        <td style="padding-top: 2px; font-size: 8pt">29 - TARJETA DE SERVICIOS</td>
                    <#elseif forma_pago == "30">
                        <td style="padding-top: 2px; font-size: 8pt">30 - APLICACIÓN DE ANTICIPOS</td>
                    <#elseif forma_pago == "31">
                        <td style="padding-top: 2px; font-size: 8pt">31 - INTERMEDIARIO PAGOS</td>
                    <#elseif forma_pago == "98">
                        <td style="padding-top: 2px; font-size: 8pt">98 - N/A</td>
                    <#elseif forma_pago == "99">
                        <td style="padding-top: 2px; font-size: 8pt">99 - POR DEFINIR</td>
                    <#else>
                        <td style="padding-top: 2px; font-size: 8pt"></td>
                </#if>
            <#--  <td style="padding-top: 2px; font-size: 8pt">${record.custbody_efx_fe_serie}</td>  -->
            <#if dataXML?has_content>
                <td style="padding-top: 2px; font-size: 8pt">${dataXML.atributos.Folio}</td>
            <#else>
                <td style="padding-top: 2px; font-size: 8pt">${record.tranid}</td>
            </#if>
            <#if record.custbody_mx_cfdi_sat_export_type?has_content>
                <td style="padding-top: 2px; font-size: 8pt">${record.custbody_mx_cfdi_sat_export_type}</td>
            </#if>
        </tr>
    </table>

    <table style="width: 100%; margin-top: 10px;">
        <tr>
            <th>Uso CFDI:</th>
            <th>M&eacute;todo de Pago:</th>
            <th>Folio Fiscal:</th>
        </tr>
        <tr>
            <td style="padding-top: 2px; font-size: 8pt; text-align:left;">${record.custbody_mx_cfdi_usage}</td>
            <#--  <td style="padding-top: 2px; font-size: 8pt">${record.custbody_efx_fe_metodopago.custrecord_efx_fe_mtdpago_codsat} - ${record.custbody_efx_fe_metodopago}</td>  -->
            <#assign metodo_pago = record.custbody_mx_txn_sat_payment_term>
            <#if metodo_pago == "PUE">
                <td style="padding-top: 2px; font-size: 8pt">PUE - PAGO EN UNA SOLA EXHIBICION</td>
            <#elseif metodo_pago == "PPD">
                <td style="padding-top: 2px; font-size: 8pt">PPD - PAGO EN PARCIALIDADES O DIFERIDO</td>
            <#else>
                <td style="padding-top: 2px; font-size: 8pt">${record.custbody_mx_txn_sat_payment_term}</td>
            </#if>
            <#if dataXML?has_content>
                <td style="padding-top: 2px; font-size: 8pt">${record.custbody_mx_cfdi_uuid}</td>
            <#else>
                <td style="padding-top: 2px; font-size: 8pt"></td>
            </#if>

        </tr>
    </table>

    <table style="width: 100%; margin-top: 10px;">
        <tr>
            <th>Tipo de Comprobante:</th>
            <th>Condiciones de Pago:</th>
            <th>Fecha y Hora de Certificaci&oacute;n:</th>
        </tr>
        <tr>
            <td style="padding-top: 2px; font-size: 8pt">
                <span style="background-color: rgb(255, 255, 255);">
                    <#assign recType=record.type>
                        <#if recType == "custinvc">
                            <#assign recType="I - INGRESO">
                            <#elseif recType == "custcred">
                                <#assign recType="E - EGRESO"></#if>
                                ${recType}
                </span>
            </td>
            <td style="padding-top: 2px; font-size: 8pt">${record.terms}</td>
            <td style="padding-top: 2px; font-size: 8pt">${record.custbody_mx_cfdi_certify_timestamp}</td>
        </tr>
    </table>

    <#assign "line_discount"= 0>
    <#assign "importe_discount" = []>
    <#list record.item as item>
        <#assign "tipo_articulo" = item.item?keep_before(" ")>
        <#if tipo_articulo == "Descuento">
            <#assign "importe_discount" = importe_discount+ [item.grossamt]>
        <#else>
            <#assign "importe_discount" = importe_discount + [0]>
        </#if>
    </#list>
    <#assign "importe_discount" = importe_discount+ [0]>
    <#assign "descuento_total" = 0>

    <#--=========Detalles de Artículos===============-->
    <#if dataXML?has_content>
        <table class="itemtable" style="width: 100%; margin-top: 3px; border: 1px; border-color: #e3e3e3;">
            <#if dataXML.Conceptos.Concepto?is_sequence>
                <thead>
                    <tr>
                        <th align="center" colspan="2" style="background-color: #999999; color: #fff;">Cant.</th>
                        <th align="center" colspan="8" style="background-color: #999999; color: #fff;">Artículo</th>
                        <th align="center" colspan="4" style="background-color: #999999; color: #fff;">Clave</th>
                        <th align="center" colspan="3" style="background-color: #999999; color: #fff;">Unidad</th>
                        <th align="center" colspan="3" style="background-color: #999999; color: #fff;">Valor Unitario</th>
                        <th align="center" colspan="3" style="background-color: #999999; color: #fff;">Importe</th>
                    </tr>
                </thead>
                <#list dataXML.Conceptos.Concepto as Conceptos>
                    <#list record.item as item>
                        <tr style="font-size:8pt;">
                            <#assign cantidad = Conceptos.atributos.Cantidad>
                            <td align="center" colspan="2" line-height="150%">${cantidad}</td>
                            <td colspan="8">
                                <span class="itemname">${item.item}</span>
                                <br/>
                                    ${Conceptos.atributos.Descripcion}
                            </td>
                            <td colspan="4">${Conceptos.atributos.ClaveProdServ}</td>
                            <td align="center" colspan="3">${Conceptos.atributos.ClaveUnidad}</td>
                            <!-- <#setting number_format='$###,###,##0.##'> -->
                            <td align="right" colspan="3">$${Conceptos.atributos.ValorUnitario}</td>
                            <td align="right" colspan="3">$${Conceptos.atributos.Importe}</td>
                        </tr>
                        <#if record.entity.custentity_mx_sat_industry_type?has_content && Conceptos.atributos.ObjetoImp?has_content>
                            <tr style="padding:0px 0px;" align="center">
                                <td colspan="6"
                                    style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px; border-left: 1px; border-color: #e3e3e3;"><b>Objeto de impuesto:</b>
                                </td>
                                <#--  <td colspan="13" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${custcol_mx_txn_line_sat_tax_object}</td>  -->
                                <#if Conceptos.atributos.ObjetoImp?number == 1>
                                    <#assign objImpDesc = "NO OBJETO DE IMPUESTO.">
                                <#elseif Conceptos.atributos.ObjetoImp?number == 2>
                                    <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO.">
                                <#elseif Conceptos.atributos.ObjetoImp?number == 3>
                                    <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO Y NO OBLIGATORIO AL DESGLOSE.">
                                </#if>
                                <td colspan="13" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${Conceptos.atributos.ObjetoImp} - ${objImpDesc}</td>
                            </tr>
                        </#if>
                    </#list>
                </#list>
            <#else>
                <#list record.item as item>
                    <tr style="font-size:8pt;">
                        <#assign cantidad = dataXML.Conceptos.Concepto.atributos.Cantidad>
                        <td align="center" colspan="2" line-height="150%">${cantidad}</td>
                        <td colspan="8">
                            <span class="itemname">${item.item}</span>
                            <br/>
                                ${dataXML.Conceptos.Concepto.atributos.Descripcion}
                        </td>
                        <td colspan="4">${dataXML.Conceptos.Concepto.atributos.ClaveProdServ}</td>
                        <td align="center" colspan="3">${dataXML.Conceptos.atributos.ClaveUnidad}</td>
                        <!-- <#setting number_format='$###,###,##0.##'> -->
                        <td align="right" colspan="3">$${dataXML.Conceptos.Concepto.atributos.ValorUnitario}</td>
                        <td align="right" colspan="3">$${dataXML.Conceptos.Concepto.atributos.Importe}</td>
                    </tr>
                    <#if record.entity.custentity_mx_sat_industry_type?has_content && dataXML.Conceptos.Concepto.atributos.ObjetoImp?has_content>
                        <tr style="padding:0px 0px;" align="center">
                            <td colspan="6"
                                style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px; border-left: 1px; border-color: #e3e3e3;"><b>Objeto de impuesto:</b>
                            </td>
                            <#--  <td colspan="13" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${custcol_mx_txn_line_sat_tax_object}</td>  -->
                            <#if dataXML.Conceptos.Concepto.atributos.ObjetoImp?number == 1>
                                <#assign objImpDesc = "NO OBJETO DE IMPUESTO.">
                            <#elseif dataXML.Conceptos.Concepto.atributos.ObjetoImp?number == 2>
                                <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO.">
                            <#elseif dataXML.Conceptos.Concepto.atributos.ObjetoImp?number == 3>
                                <#assign objImpDesc = "SÍ OBJETO DE IMPUESTO Y NO OBLIGATORIO AL DESGLOSE.">
                            </#if>
                            <td colspan="13" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${dataXML.Conceptos.Concepto.atributos.ObjetoImp} - ${objImpDesc}</td>
                        </tr>
                    </#if>
                </#list>
            </#if>
        </table>

    <#else>
        <#if record.item?has_content>
            <table class="itemtable" style="width: 100%; margin-top: 10px;">
                <!-- start items -->
                <#list record.item as item>
                    <#if item_index==0>
                        <thead>
                            <tr>
                                <th align="center" colspan="2" style="background-color: #999999; color: #fff;">Cant.</th>
                                <th align="center" colspan="8" style="background-color: #999999; color: #fff;">Artículo</th>
                                <th align="center" colspan="4" style="background-color: #999999; color: #fff;">Clave</th>
                                <th align="center" colspan="3" style="background-color: #999999; color: #fff;">Unidad</th>
                                <th align="center" colspan="3" style="background-color: #999999; color: #fff;">Valor Unitario</th>
                                <th align="center" colspan="3" style="background-color: #999999; color: #fff;">Importe</th>
                                <#--  <th align="center" colspan="3" style="background-color: #999999; color: #fff;">${item.amount@label}</th>  -->  -->
                            </tr>
                        </thead>
                    </#if>
                    <tr style="font-size:8pt;">
                        <td align="center" colspan="2" line-height="150%">${item.quantity}</td>
                        <td colspan="8">
                            <span class="itemname">${item.item}</span>
                            <br/>
                            <#if item.description?has_content>
                                ${item.description}
                            <br/>
                            </#if>
                        </td>
                        <td colspan="4">${item.custcol_efx_fe_clave_producto_sat}</td>
                        <td align="center" colspan="3">${item.units}</td>
                        <!-- <#setting number_format='$###,###,##0.##'> -->
                        <td align="right" colspan="3">${item.rate}</td>
                        <td align="right" colspan="3">${item.amount}</td>
                    </tr>
                    <#if record.entity.custentity_mx_sat_industry_type?has_content && item.custcol_mx_txn_line_sat_tax_object?has_content>
                        <tr style="padding:0px 0px;">
                            <td colspan="2" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">&nbsp;</td>
                            <td colspan="3" style="font-size: 7pt; padding-top: 1px;  padding-bottom: 1px;"><b>Objeto de impuesto:</b></td>
                            <td colspan="26" style="font-size: 7pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_mx_txn_line_sat_tax_object}</td>
                        </tr>
                    </#if>
                </#list>
            </table>
        </#if>
    </#if>

    <#assign "desglose_json_body" = record.custbody_efx_fe_tax_json>
    <#if desglose_json_body?has_content>
        <#assign "desglose_body" = desglose_json_body?eval>
        <#assign "desglose_ieps" = desglose_body.rates_ieps>
        <#assign "desglose_iva" = desglose_body.rates_iva>
        <#assign "desglose_ret" = desglose_body.rates_retencion>
        <#assign "retencion_total" = desglose_body.retencion_total?number?string[",##0.00"]>
        <#assign "desglose_loc" = retencion_total>
    <#else>
        <#assign "desglose_ieps" = 0>
        <#assign "desglose_iva" = 0>
        <#assign "desglose_ret" = 0>
        <#assign "desglose_loc" = 0>
        <#assign "retencion_total" = 0>
    </#if>


    <#--  <table style="width: 100%; margin-top: 5px; padding: 0px; border: 1px; border-color: #e3e3e3;">
        <tr>
            <td colspan="6" style="margin: 0px; padding: 0px;">
                <table class="total" style="width: 100%; margin-top: 0px; border: 0px; border-color: #e3e3e3;">
                    <tr>
                        <td align="left" colspan="2"
                            style="border-top: 0px; border-bottom: 1px; border-color: #e3e3e3; font-size: 7pt;border-right: 0px;">
                            <strong>Cantidad con letra:</strong> ${record.custbody_efx_fe_total_text}</td>
                    </tr>

                    <tr>
                        <td align="left"
                            style="border-right: 1px; border-bottom: 1px; border-color: #e3e3e3; font-size: 7pt;">
                            <strong>Ubicacion:</strong> ${record.location}</td>
                        <td align="left"
                            style="font-size: 7pt; border-bottom: 1px; border-color: #e3e3e3; padding-left: 0px;border-right: 0px;">
                            <table style="margin-left: 0px; padding-left: 0px;margin-top: 0px; padding-top: 0px;">
                                <tr>
                                    <td align="left"
                                        style="font-size: 7pt; padding-left: 0px;margin-top: 0px; padding-top: 0px;">
                                        <strong> </strong></td>
                                    <td style="font-size: 7pt;margin-top: 0px; padding-top: 0px;">
                                        <table style="margin-top: 0px; padding-top: 0px;">
                                            <tr>
                                                <td align="left"
                                                    style="font-size: 7pt;margin-top: 0px; padding-top: 0px;border-right: 0px;"
                                                    colspan="2"><strong></strong></td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="font-size: 7pt;border-color: #e3e3e3; border-right: 0px;">
                            <b>Comentarios: </b> ${record.memo?upper_case}</td>
                    </tr>
                </table>
            </td>
            <td colspan="2" style="margin: 0px; padding: 0;">
                <table style="width: 100%; margin-top: 0px; margin-left: 0px; border: 0px; border-color: #e3e3e3;">
                    <tr>
                        <td colspan="1" style="font-size: 7pt; border-color: #e3e3e3;border-left: 1px;"><b>Subtotal</b>
                        </td>
                        <#if dataXML?has_content>
                            <td align="right" colspan="1" style="font-size: 7pt;">${dataXML.atributos.SubTotal?number?string[",##0.00"]}</td>
                        <#else>
                            <#if record.custbody_efx_fe_gbl_subtotal?has_content>
                                <td align="right" colspan="1"
                                    style="font-size: 7pt;">${record.custbody_efx_fe_gbl_subtotal?number?string[",##0.00"]}</td>
                            <#else>
                                <td align="right" colspan="1"
                                    style="font-size: 7pt;">${record.subtotal?string[",##0.00"]}</td>
                            </#if>
                        </#if>

                    </tr>
                    <tr>
                        <td colspan="1" style="font-size: 7pt;  border-color: #e3e3e3;border-left: 1px;">
                            <b>Descuento</b></td>
                        <#if dataXML?has_content>
                            <td align="right" colspan="1" style="font-size: 7pt;">${dataXML.atributos.Descuento?number?string[",##0.00"]}</td>
                        <#else>
                            <#if descuento_total != 0>
                                <td align="right" colspan="1"
                                    style="font-size: 7pt;"><#if desglose_total_discount?has_content>${desglose_total_discount?number?string[",##0.00"]}</#if></td>
                            <#else>
                                <#if record.discounttotal != 0>
                                    <td align="right" colspan="1" style="font-size: 7pt;">${record.discounttotal}</td>
                                <#else>
                                    <td align="right" colspan="1" style="font-size: 7pt;">0.00</td>
                                </#if>
                            </#if>
                        </#if>

                    </tr>
                    <tr>
                        <td colspan="1" style="font-size: 7pt;  border-color: #e3e3e3;border-left: 1px;"><b>Traslados</b></td>
                        <#if dataXML?has_content>
                            <td align="right" colspan="1"
                                style="font-size: 7pt;">${dataXML.Impuestos.atributos.TotalImpuestosTrasladados?number?string[",##0.00"]}</td>
                        <#else>
                        <#if desglose_json_body?has_content>
                            <#assign "desglose_body" = desglose_json_body?eval>
                            <#assign "iva_total" = desglose_body.iva_total>
                            <#assign totalivaGBL = iva_total/>
                        </#if>
                            <td align="right" colspan="1" style="font-size: 7pt;">${totalivaGBL?number?string[",##0.00"]}</td>
                        </#if>
                    </tr>
                    <#if dataXML?has_content>
                        <#if dataXML.Impuestos.Traslados.Traslado?is_sequence>
                            <#list dataXML.Impuestos.Traslados.Traslado as traslados_lista>
                                <#assign iva_ratenum = traslados_lista.atributos.TasaOCuota?number * 100>
                                    <tr>
                                        <td colspan="2" style="font-size: 5pt; border-color: #e3e3e3;border-left: 1px;">
                                            ${iva_ratenum}%: ${traslados_lista.atributos.Importe?number?string[",##0.00"]}<br/>
                                        </td>
                                    </tr>
                            </#list>
                            <#else>
                                <#assign iva_ratenum = dataXML.Impuestos.Traslados.Traslado.atributos.TasaOCuota?number * 100>
                                <tr>
                                    <td colspan="2" style="font-size: 5pt; border-color: #e3e3e3;border-left: 1px;">
                                        ${iva_ratenum}%: ${dataXML.Impuestos.Traslados.Traslado.atributos.Importe?number?string[",##0.00"]}<br/>
                                    </td>
                                </tr>
                        </#if>

                        <#else>
                            <#if desglose_json_body?has_content>
                                <#assign "desglose_body" = desglose_json_body?eval>
                                <#assign "iva_total_desgloses" = desglose_body.rates_iva_data>
                                <#assign obj_totales_imp = iva_total_desgloses/>
                            </#if>
                            <#list obj_totales_imp as Iva_rate, Iva_total>
                                <#assign iva_ratenum = Iva_rate?number>
                                <#assign iva_tasaocuota = iva_ratenum/100>
                                <#if Iva_rate == "16" || Iva_rate == "0">
                                    <tr>
                                        <td colspan="2" style="font-size: 5pt; border-color: #e3e3e3;border-left: 1px;">
                                            ${Iva_rate}%: ${Iva_total?number?string["0.00"]}<br/>
                                        </td>
                                    </tr>
                                </#if>
                            </#list>
                    </#if>




                    <tr>
                        <td colspan="1" style="font-size: 7pt;  border-color: #e3e3e3;border-left: 1px;"><b>Retenciones</b></td>
                        <#if dataXML?has_content>
                            <td align="right" colspan="1"
                                style="font-size: 7pt;">${dataXML.Impuestos.atributos.TotalImpuestosRetenidos?number?string[",##0.00"]}</td>
                        <#else>
                            <td align="right" colspan="1"
                                style="font-size: 7pt;">${retencion_total}</td>
                        </#if>
                    </tr>

                    <tr>
                        <td colspan="1" style="font-size: 7pt;  border-color: #e3e3e3;border-left: 1px;"><b>Total</b>
                        </td>
                        <#if dataXML?has_content>
                            <td align="right" colspan="1" style="font-size: 7pt;">${dataXML.atributos.Total?number?string[",##0.00"]}</td>
                        <#else>
                            <td align="right" colspan="1"
                                style="font-size: 7pt;"><#if cabecera_total?has_content>${cabecera_total?number?string[",##0.00"]}</#if></td>
                        </#if>

                    </tr>
                </table>
            </td>


        </tr>
    </table>  -->

    <#--  =================Detalles de los totales=================  -->
    <table class="total" style="width: 100%; margin-top: 1px;">
        <tr>
            <td colspan="4">&nbsp;</td>
            <td align="right">
                <b>Subtotal</b>
            </td>
            <td align="right">${record.subtotal}</td>
        </tr>
        <tr>
            <td colspan="4">&nbsp;</td>
            <td align="right">
                <b>Impuesto (%)</b>
            </td>
            <td align="right">${record.taxtotal}</td>
        </tr>
        <tr >
            <td background-color="#ffffff" colspan="4">&nbsp;</td>
            <td align="right" style="background-color: #999999; color: #fff;">
                <strong>${record.total@label}</strong>
            </td>
            <td align="right" style="background-color: #999999; color: #fff;">${record.total}</td>
        </tr>
    </table>

    <#--  ==========Monto en letra===========  -->
    <table style="width: 100%;">
        <tr>
            <td width="100%"></td>
        </tr>
        <tr>
            <th width="100%">Monto</th>
        </tr>
        <tr>
            <td >${record.custbody_efx_fe_total_text}</td>
        </tr>
    </table>

    <table style="width: 100%;">
        <tr>
            <td width="100%"></td>
        </tr>
        <tr>
            <th width="100%">Moneda</th>
        </tr>
        <tr>
            <td >${record.currency.symbol} - ${record.currency.name}</td>
        </tr>
    </table>

    <#if certData?has_content>
        <table style="width: 100%; margin-top: 20px;">
            <#assign qrcodeImage = "data:image/png;base64, " + certData.custbody_mx_cfdi_qr_code >
            <tr style="margin-top: 20px;">
                <td valign="top" align="left" width="25%"  style="margin-top: 20px;">
                            <img style="width: 100px;height:100px" src="${qrcodeImage}"/>
                </td>
                <td>
                    <table style="width: 100%; margin-top: 10px;">
                        <tr>
                            <th >Cadena original del complemento de certificación digital del SAT</th>
                        </tr>
                        <tr>
                            <td style="align: left;">${record.custbody_mx_cfdi_cadena_original}</td>
                        </tr>
                        <tr>
                            <th>Sello digital del CFDI</th>
                        </tr>
                        <tr>
                            <#if certData?has_content>
                                <td style="align: left;">${certData.custbody_mx_cfdi_signature}</td>
                            <#else>
                                <td style="align: left;"></td>
                            </#if>
                        </tr>
                        <tr>
                            <th>Sello digital del SAT</th>
                        </tr>
                        <tr>
                            <#if certData?has_content>
                                <td style="align: left;">${certData.custbody_mx_cfdi_sat_signature}</td>
                            <#else>
                                <td style="align: left;"></td>
                            </#if>
                        </tr>

                        <#if record.custbody_efx_fe_cfdi_rel != ''>
                            <tr>
                                <th>CFDI's Relacionados</th>
                            </tr>
                            <tr>
                                <td style="align: left;">${record.custbody_efx_fe_cfdi_rel}</td>
                            </tr>
                        </#if>
                    </table>
                </td>
            </tr>
        </table>
    </#if>

    </body>
</pdf>