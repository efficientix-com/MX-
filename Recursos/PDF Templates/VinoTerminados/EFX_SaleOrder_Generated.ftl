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
        <!--#setting locale=custom.locale-->
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
            <#assign "customCompanyInfo" = companyinformation>
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
    </#if>
    <head>
        <#assign "shipmentcost" = 0>
        <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" src-bold="${nsfont.NotoSans_Bold}" src-italic="${nsfont.NotoSans_Italic}" src-bolditalic="${nsfont.NotoSans_BoldItalic}" bytes="2" />
        <#if .locale == "zh_CN">
            <link name="NotoSansCJKsc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKsc_Regular}" src-bold="${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
        <#elseif .locale == "zh_TW">
            <link name="NotoSansCJKtc" type="font" subtype="opentype" src="${nsfont.NotoSansCJKtc_Regular}" src-bold="${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
        <#elseif .locale == "ja_JP">
            <link name="NotoSansCJKjp" type="font" subtype="opentype" src="${nsfont.NotoSansCJKjp_Regular}" src-bold="${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
        <#elseif .locale == "ko_KR">
            <link name="NotoSansCJKkr" type="font" subtype="opentype" src="${nsfont.NotoSansCJKkr_Regular}" src-bold="${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
        <#elseif .locale == "th_TH">
            <link name="NotoSansThai" type="font" subtype="opentype" src="${nsfont.NotoSansThai_Regular}" src-bold="${nsfont.NotoSansThai_Bold}" bytes="2" />
        </#if>

        <#assign addressCancelado=''>
        <#if record.custbody_efx_fe_cfdi_cancelled== true >
            <#assign addressCancelado= 'FACTURA CANCELADA'>
        </#if>
        <macrolist>
            <macro id="watermark">
                <p
                        id="watermarkbody"
                        rotate="-30"
                        valign="middle"
                        align="center"
                        class="cancelada">
                    ${addressCancelado}
                </p>
            </macro>
            <macro id="nlheader">
                <table class="header" style="width: 100%; margin: 0x; padding: 0px">
                    <tr>
                        <td  rowspan="3"  style="width: 30%;">
                            <#if certData?has_content>
                                <#if record.custbody_efx_fe_logosub?has_content>
                                    <img height="35%" src="${record.custbody_efx_fe_logosub}" style="float: left; margin: 2px" width="2in" />
                                </#if>
                            <#else>
                                <#if record.custbody_efx_fe_logosub?has_content>
                                    <#if subsidiary.logo@url?length != 0>
                                        <img height="35%" src="${subsidiary.logo@url}" style="float: left; margin: 2px" width="2in" />
                                    <#elseif companyInformation.logoUrl?length != 0>
                                        <img height="35%" src="${companyInformation.logoUrl}" style="float: left; margin: 2px" width="2in" />
                                    </#if>
                                </#if>
                            </#if>

                        </td>
                        <td rowspan="3" width="40%" align="center" style="font-size: 9px;">
                            ${record.custbody_efx_fe_dirsubs?upper_case}<br/>www.vinoteca.com
                        </td>
                        <td colspan="4" style="font-size: 10px;" align="right">

                            <#if dataXML?has_content>
                                <#assign folio_tran = dataXML.atributos.Serie +""+ dataXML.atributos.Folio>
                                <#if record.custbody_efx_fe_kiosko_customer?has_content>
                                    <p style="font-size: 12px; margin:0px"><strong>VENTA EN EFECTIVO</strong></p>
                                <#elseif record.custbody_efx_fe_gbl_related?has_content>
                                    <p style="font-size: 12px; margin:0px"><strong>FACTURA GLOBAL</strong></p>
                                <#else>
                                    <p style="font-size: 12px; margin:0px"><strong>VENTA EN EFECTIVO</strong></p>
                                </#if>
                                <p class="number" style="font-size: 18px; margin:0px">${folio_tran}</p>
                            <#else>
                                <p style="font-size: 12px; margin:0px"><strong>VENTA EN EFECTIVO</strong></p>
                                <p class="number" style="font-size: 18px; margin:0px">${record.tranid}</p>
                            </#if>


                            <p style="padding: 0px; margin:0px; height: 10px;">&nbsp;</p>
                            <p class="number" style="font-size: 8px; margin:0px"><b>CANAL DE VENTA: ${record.cseg_efx_cstsg_cana}</b></p>
                            <p style="font-size: 8px; margin:0px">Fecha y hora de emisi&oacute;n</p>
                            <p style="font-size: 8px; margin:0px">${record.createddate?date} ${record.createddate?time}</p>
                        </td>
                    </tr>
                </table>
            </macro>


            <macro id="nlfooter">
                <table class="footer" style="width: 100%;"><tr>
                        <#if record.custbody_efx_fe_gbl_folio?has_content>
                            <td><barcode codetype="code128" showtext="true" value="${record.custbody_efx_fe_gbl_folio}" style="height: 30px"/></td>
                        <#else>
                            <td><barcode codetype="code128" showtext="true" value="${record.tranid}" style="height: 30px"/></td>
                        </#if>

                        <td align="right"><pagenumber/> de <totalpages/></td>
                    </tr></table>
            </macro>
        </macrolist>
        <style type="text/css">* {
            <#if .locale == "zh_CN">
                font-family: NotoSans, NotoSansCJKsc, sans-serif;
            <#elseif .locale == "zh_TW">
                font-family: NotoSans, NotoSansCJKtc, sans-serif;
            <#elseif .locale == "ja_JP">
                font-family: NotoSans, NotoSansCJKjp, sans-serif;
            <#elseif .locale == "ko_KR">
                font-family: NotoSans, NotoSansCJKkr, sans-serif;
            <#elseif .locale == "th_TH">
                font-family: NotoSans, NotoSansThai, sans-serif;
            <#else>
                font-family: NotoSans, sans-serif;
            </#if>
            }
            table {
                font-size: 9pt;
                table-layout: fixed;
                border-color: #e3e3e3;
            }
            th {
                font-weight: bold;
                font-size: 8pt;
                vertical-align: middle;
                padding: 5px 6px 3px;
                background-color: #e3e3e3;
                color: #333333;
            }
            td {
                padding: 3px 2px;
            }
            td p { align:left }
            b {
                font-weight: bold;
                color: #000000;
            }
            table.header td {
                padding: 0;
                font-size: 10pt;
            }
            table.footer td {
                padding: 0;
                font-size: 8pt;
            }
            table.itemtable th {
                padding-bottom: 10px;
                padding-top: 10px;
            }
            table.body td {
                padding-top: 1px;
            }
            table.total {
                page-break-inside: avoid;
            }
            tr.totalrow {
                background-color: #e3e3e3;
                line-height: 200%;
            }
            td.totalboxtop {
                font-size: 10pt;
                background-color: #e3e3e3;
            }
            td.addressheader {
                font-size: 10pt;
                padding-top: 6px;
                padding-bottom: 2px;
            }
            td.address {
                padding-top: 0;
            }
            td.totalboxmid {
                font-size: 28pt;
                padding-top: 20px;
                background-color: #e3e3e3;
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
                color: #333333;
                background-color: #e3e3e3;
                height: 1px;
            }
            <!-- Estilos para Vinoteca -->
            td.cabecera, th.cabecera{
                color: #000000;
                font-size: 8pt;
                background-color: #e3e3e3;
                padding: 2px;
            }

            td.cabecerapequenia, th.cabecerapequenia{
                color: #000000;
                font-size: 8pt;
                background-color: #e3e3e3;
                padding: 4px;
            }

            td.cuerposinfogeneral{
                border: 1px;
                border-color: #e3e3e3;
                padding:2px;
                font-size: 8pt;
            }

            td.cuerposnoarticulos{
                padding:2px;
                font-size: 7pt;
            }

            td.cuerposarticulos{
                border-right: 1px;
                border-color: #e3e3e3;
                font-size: 8px
            }
            td.cuerposarticulos:last-child{
                border-right: 0px;
            }
            table.tablascompletas{
                width: 100%;
                margin-top: 10px;
                border: 1px;
                border-color: #e3e3e3
            }
            td.cuerpotablaetiqueta{
                font-size: 8pt;
                padding:1px 3px 0px 1px;
            }
            td.cuerpotablainfo{
                font-size: 8pt;
                padding:1px 1px 0px 1px;
            }
        </style>
    </head>
    <body header="nlheader" header-height="8%" footer="nlfooter" footer-height="20pt" padding="0.2in 0.5in 0.2in 0.5in" size="Letter">
    <#assign "desglosa_cliente" = record.entity.custentity_efx_cmp_registra_ieps>
    <#assign "tipoGBL" = record.custbody_efx_fe_gbl_type>
    <#assign "desglose_json_body" = record.custbody_efx_fe_tax_json>

    <#if desglose_json_body?has_content>
        <#assign "desglose_json_body" = record.custbody_efx_fe_tax_json>
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

    <#if record.custbody_efx_fe_kiosko_customer?has_content>
        <table style="width: 100%; margin-top: 0px;"><tr>
                <td class="cabecera" colspan="14"><b>Cliente</b></td>
                <td></td>
                <td class="cabecera" colspan="14"><b>Lugar de Entrega</b></td>
            </tr>
            <tr>
                <td class="cuerposinfogeneral" colspan="14" rowspan="2">
                    <table>
                        <tr>
                            <td class="cuerpotablaetiqueta">No. de cliente:</td>
                            <td class="cuerpotablainfo">${record.custbody_efx_fe_kiosko_customer.entityid?upper_case}</td>
                        </tr>
                        <tr>
                            <td class="cuerpotablaetiqueta">Nombre:</td>
                            <td class="cuerpotablainfo">${record.custbody_efx_fe_kiosko_name?upper_case}</td>
                        </tr>
                        <tr>
                            <td class="cuerpotablaetiqueta">RFC:</td>
                            <td class="cuerpotablainfo">${record.custbody_efx_fe_kiosko_rfc}</td>
                        </tr>
                        <tr>
                            <td class="cuerpotablaetiqueta">Dirección:</td>
                            <td class="cuerpotablainfo">${record.custbody_efx_fe_kiosko_address?upper_case}</td>
                        </tr>
                    </table></td>
                <td></td>
                <#if record.shipaddress?has_content>
                    <td align="left" colspan="14" class="cuerposinfogeneral">${record.shipaddress?upper_case} </td>
                <#else>
                    <td align="left" colspan="14" class="cuerposinfogeneral">${record.custbody_efx_cmp_direccion_entrega?upper_case} </td>
                </#if>
            </tr>
        </table>
    <#else>
        <table style="width: 100%; margin-top: 0px;"><tr>
                <td class="cabecera" colspan="14"><b>Cliente</b></td>
                <td></td>
                <td class="cabecera" colspan="14"><b>Lugar de Entrega</b></td>
            </tr>
            <tr>
                <td class="cuerposinfogeneral" colspan="14" rowspan="2">
                    <table>
                        <tr>
                            <td class="cuerpotablaetiqueta">No. de cliente:</td>
                            <td class="cuerpotablainfo">${record.entity.entityid?upper_case}</td>
                        </tr>
                        <tr>
                            <td class="cuerpotablaetiqueta">Nombre:</td>
                            <td class="cuerpotablainfo">${record.entity.companyname?upper_case}</td>
                        </tr>
                        <#if dataXML?has_content>
                            <tr>
                                <td class="cuerpotablaetiqueta">RFC:</td>
                                <td class="cuerpotablainfo">${dataXML.Receptor.atributos.Rfc}</td>
                            </tr>
                        <#else>
                            <tr>
                                <td class="cuerpotablaetiqueta">RFC:</td>
                                <td class="cuerpotablainfo">${record.custbody_mx_customer_rfc}</td>
                            </tr>
                        </#if>
                        <tr>
                            <td class="cuerpotablaetiqueta">Dirección:</td>
                            <td class="cuerpotablainfo">${record.billaddress?upper_case}</td>
                        </tr>
                    </table></td>
                <td></td>
                <#if record.shipaddress?has_content>
                    <td align="left" colspan="14" class="cuerposinfogeneral">${record.shipaddress?upper_case} </td>
                <#else>
                    <td align="left" colspan="14" class="cuerposinfogeneral">${record.custbody_efx_cmp_direccion_entrega?upper_case} </td>
                </#if>
            </tr>
        </table>
    </#if>



    <table class="tablascompletas" style="margin-top:5px;"><tr>

            <td colspan="3" class="cabecera"><b>Fecha de inicio</b></td>
            <td colspan="3" class="cabecera"><b>Fecha de finalizacíon</b></td>
            <td colspan="3" class="cabecera"><b>Nº de cita</b></td>
        </tr>
        <tr>
            <#assign datearray = record.custbody_mx_cfdi_certify_timestamp?split("T")>
            <td colspan="3" class="cuerposnoarticulos">${record.custbody_mx_cfdi_uuid}</td>
            <td colspan="3" class="cuerposnoarticulos">${record.custbody_mx_cfdi_sat_serial}</td>
            <td colspan="3" class="cuerposnoarticulos">

                <#if datearray?size == 2 >
                    <#assign dayarray = datearray[0]?split("-")>
                    ${dayarray[2]}/${dayarray[1]}/${dayarray[0]} ${datearray[1]}
                <#else>
                    ${record.custbody_mx_cfdi_certify_timestamp}
                </#if>
            </td>
        </tr>
    </table>

    <table class="tablascompletas" style="margin-top:5px;"><tr>
            <td colspan="3" class="cabecera"><b>Términos de crédito</b></td>
            <td colspan="3" class="cabecera"><b>Referencia cliente</b></td>
            <td colspan="3" class="cabecera"><b>Orden de venta</b></td>
            <td colspan="3" class="cabecera"><b>Cotizaci&oacute;n</b></td>
            <td colspan="3" class="cabecera"><b>OC de cliente</b></td>
            <td colspan="3" class="cabecera"><b>No. cita</b></td>
        </tr>
        <tr>
            <td colspan="3" class="cuerposnoarticulos">${record.entity.terms}</td>
            <td colspan="3" class="cuerposnoarticulos"><p>
                    ${record.entity.custentity_efx_cmp_cta_vino}<br></br>${record.entity.custentity_efx_cta_clabe_vino}
                </p></td>
            <td colspan="3" class="cuerposnoarticulos">${record.createdfrom?keep_after("#")}</td>
            <td colspan="3" class="cuerposnoarticulos">${record.createdfrom.createdfrom?keep_after("#")}</td>
            <td colspan="3" class="cuerposnoarticulos">${record.otherrefnum}</td>
            <td colspan="3" class="cuerposnoarticulos">${record.custbody_efx_cmp_no_cita}</td>
        </tr>
    </table>

    <#if record.item?has_content><#assign "total_cajas" = 0><#assign "total_piezas" = 0>

        <#assign "subtotalwithieps" = 0>
        <#assign "linecount" = 0>

        <#if dataXML?has_content>
            <table class="itemtable" style="width: 100%; margin-top: 5px; border: 1px; border-color: #e3e3e3;">
                <#if dataXML.Conceptos.Concepto?is_sequence>

                    <thead>
                    <tr>
                        <th align="center" colspan="2" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Linea</th>
                        <th align="center" colspan="4" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">SKU <br></br>Clave SAT</th>

                        <th align="center" colspan="18" style="color: #000000; font-size: 6pt; padding-top: 1px;  padding-bottom: 1px;">
                            <table class="desglose_table" style="width: 100%;">
                                <tr>
                                    <th colspan="20" align="center" style="font-size: 6pt;  padding: 1px 0px 1px 0px">Descripción</th>
                                </tr>
                                <tr >
                                    <td colspan="5" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Base</td>
                                    <td colspan="4" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Impuesto</td>
                                    <td colspan="3" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Factor</td>
                                    <td colspan="3" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Tasa</td>
                                    <td colspan="5" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Importe</td>
                                </tr>
                            </table></th>

                        <th align="center" colspan="3" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Unidad<br></br>SAT<br></br>Unidad</th>

                        <th align="center" colspan="5" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">UPC</th>
                        <th align="center" colspan="3" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Cant.</th>
                        <th align="center" colspan="4" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px"><center>Precio sin<br/>impuesto</center></th>
                        <th align="center" colspan="4" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Impuesto</th>
                        <th align="center" colspan="5" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Descuento</th>
                        <th align="center" colspan="5" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Subtotal</th>
                    </tr>
                    </thead>
                    <#assign lineanum = 0>
                    <#list dataXML.Conceptos.Concepto as Conceptos>
                        <#assign lineanum = lineanum+1>
                        <tr>
                            <td align="center" colspan="2" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:1px">${(lineanum)?string['0']}</td>
                            <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:1px; padding-right:0px; padding-left:0px">${Conceptos.atributos.Descripcion}<br></br>${Conceptos.atributos.ClaveProdServ}</td>
                            <td colspan="18" style="border-left: 1px; border-color: #e3e3e3; padding-top:1px;padding-top:1px;padding-right:0px; padding-left:0px" align="center">
                                <table class="desglose_table"  style="width: 100%">
                                    <tr style="padding:0px 0px 0px 0px;">
                                        <td colspan="20" style="font-size: 6pt; padding:0px 0px;">${Conceptos.atributos.NoIdentificacion}</td>

                                    </tr>
                                    <#assign impuesto_dataxml = 0>

                                    <#if Conceptos.Impuestos.Traslados.Traslado?has_content>
                                        <#if Conceptos.Impuestos.Traslados.Traslado?is_sequence>
                                            <#list Conceptos.Impuestos.Traslados.Traslado as traslado_imp>
                                                <#assign impuesto_dataxml = impuesto_dataxml + traslado_imp.atributos.Importe?number>
                                                <#assign tasa_line = traslado_imp.atributos.TasaOCuota?number * 100>
                                                <tr style="padding:0px 0px;">
                                                    <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${traslado_imp.atributos.Base}</td>
                                                    <#if traslado_imp.atributos.Impuesto == "002">
                                                        <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IVA ${tasa_line}%</td>
                                                    <#else>
                                                        <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IEPS ${tasa_line}%</td>
                                                    </#if>
                                                    <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">${traslado_imp.atributos.Impuesto}</td>
                                                    <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${tasa_line?string[",##0.00"]}%</td>
                                                    <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${traslado_imp.atributos.Importe}</td>

                                                </tr>
                                            </#list>
                                        <#else>
                                            <#assign impuesto_dataxml = impuesto_dataxml + Conceptos.Impuestos.Traslados.Traslado.atributos.Importe?number>
                                            <#assign tasa_line = Conceptos.Impuestos.Traslados.Traslado.atributos.TasaOCuota?number * 100>
                                            <tr style="padding:0px 0px;">
                                                <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${Conceptos.Impuestos.Traslados.Traslado.atributos.Base}</td>
                                                <#if Conceptos.Impuestos.Traslados.Traslado.atributos.Impuesto == "002">
                                                    <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IVA ${tasa_line}%</td>
                                                <#else>
                                                    <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IEPS ${tasa_line}%</td>
                                                </#if>
                                                <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">${Conceptos.Impuestos.Traslados.Traslado.atributos.Impuesto}</td>
                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${tasa_line?string[",##0.00"]}%</td>
                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${Conceptos.Impuestos.Traslados.Traslado.atributos.Importe}</td>

                                            </tr>
                                        </#if>
                                    </#if>

                                    <#if Conceptos.Impuestos.Retenciones.Retencion?has_content>
                                        <#if Conceptos.Impuestos.Retenciones.Retencion?is_sequence>
                                            <#list Conceptos.Impuestos.Retenciones.Retencion as ret_imp>
                                                <#assign impuesto_dataxml = impuesto_dataxml - ret_imp.atributos.Importe?number>
                                                <#assign tasa_line = ret_imp.atributos.TasaOCuota?number * 100>
                                                <tr style="padding:0px 0px;">
                                                    <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${ret_imp.atributos.Base}</td>
                                                    <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">Retencion ${tasa_line}%</td>
                                                    <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">${ret_imp.atributos.Impuesto}</td>
                                                    <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${tasa_line?string[",##0.00"]}%</td>
                                                    <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${ret_imp.atributos.Importe}</td>

                                                </tr>
                                            </#list>
                                        <#else>
                                            <#assign impuesto_dataxml = impuesto_dataxml - Conceptos.Impuestos.Retenciones.Retencion.atributos.Importe?number>
                                            <#assign tasa_line = Conceptos.Impuestos.Retenciones.Retencion.atributos.TasaOCuota?number * 100>
                                            <tr style="padding:0px 0px;">
                                                <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${Conceptos.Impuestos.Retenciones.Retencion.atributos.Base}</td>
                                                <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">Retencion ${tasa_line}%</td>
                                                <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">${Conceptos.Impuestos.Retenciones.Retencion.atributos.Impuesto}</td>
                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${tasa_line?string[",##0.00"]}%</td>
                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${Conceptos.Impuestos.Retenciones.Retencion.atributos.Importe}</td>
                                            </tr>
                                        </#if>
                                    </#if>

                                </table>
                            </td>

                            <#assign "units_sat" = Conceptos.atributos.ClaveUnidad>
                            <#assign "unidades_text" = Conceptos.atributos.ClaveUnidad>
                            <#assign total_piezas += Conceptos.atributos.Cantidad>
                            <#assign "piezas_caja" = Conceptos.atributos.Cantidad>
                            <#assign total_cajas += Conceptos.atributos.Cantidad>
                            <#assign "cantidad" = Conceptos.atributos.Cantidad>


                            <td colspan="3" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${units_sat} <br></br> ${Conceptos.atributos.ClaveUnidad}</td>

                            <td colspan="5" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${Conceptos.atributos.NoIdentificacion}</td>
                            <td align="center" colspan="3" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px">${Conceptos.atributos.Cantidad}</td>
                            <#assign rate=Conceptos.atributos.ValorUnitario>
                            <#assign subtotallinea_dataxml = Conceptos.atributos.Importe?number+impuesto_dataxml>

                            <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3; font-size:6pt; padding-top:2px;padding-right:0px; padding-left:0px">${Conceptos.atributos.Importe}</td>
                            <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt;padding-top:2px;padding-right:0px; padding-left:0px">${impuesto_dataxml?string[",##0.00"]}</td>
                            <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${Conceptos.atributos.Descuento}</td>
                            <td align="right" colspan="6" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${subtotallinea_dataxml?string[",##0.00"]}</td>
                        </tr>

                    </#list>
                <#else>

                    <thead>
                    <tr>
                        <th align="center" colspan="2" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Linea</th>
                        <th align="center" colspan="4" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">SKU <br></br>Clave SAT</th>

                        <th align="center" colspan="18" style="color: #000000; font-size: 6pt; padding-top: 1px;  padding-bottom: 1px;">
                            <table class="desglose_table" style="width: 100%;">
                                <tr>
                                    <th colspan="20" align="center" style="font-size: 6pt;  padding: 1px 0px 1px 0px">Descripción</th>
                                </tr>
                                <tr >
                                    <td colspan="5" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Base</td>
                                    <td colspan="4" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Impuesto</td>
                                    <td colspan="3" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Factor</td>
                                    <td colspan="3" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Tasa</td>
                                    <td colspan="5" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Importe</td>
                                </tr>
                            </table></th>

                        <th align="center" colspan="3" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Unidad<br></br>SAT<br></br>Unidad</th>

                        <th align="center" colspan="5" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">UPC</th>
                        <th align="center" colspan="3" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Cant.</th>
                        <th align="center" colspan="4" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px"><center>Precio sin<br/>impuesto</center></th>
                        <th align="center" colspan="4" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Impuesto</th>
                        <th align="center" colspan="5" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Descuento</th>
                        <th align="center" colspan="5" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Subtotal</th>
                    </tr>
                    </thead>
                    <tr>
                        <td align="center" colspan="2" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:1px">1</td>
                        <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:1px; padding-right:0px; padding-left:0px">${dataXML.Conceptos.Concepto.atributos.Descripcion}<br></br>${dataXML.Conceptos.Concepto.atributos.ClaveProdServ}</td>
                        <td colspan="18" style="border-left: 1px; border-color: #e3e3e3; padding-top:1px;padding-top:1px;padding-right:0px; padding-left:0px" align="center">
                            <table class="desglose_table"  style="width: 100%">
                                <tr style="padding:0px 0px 0px 0px;">
                                    <td colspan="20" style="font-size: 6pt; padding:0px 0px;">${dataXML.Conceptos.Concepto.atributos.NoIdentificacion}</td>

                                </tr>

                                <#assign impuesto_dataxml = 0>
                                <#if dataXML.Conceptos.Impuestos.Traslados.Traslado?has_content>
                                    <#if dataXML.Conceptos.Impuestos.Traslados.Traslado?is_sequence>
                                        <#list dataXML.Conceptos.Impuestos.Traslados.Traslado as traslado_imp>
                                            <#assign impuesto_dataxml = impuesto_dataxml + traslado_imp.atributos.Importe?number>
                                            <#assign tasa_line = traslado_imp.atributos.TasaOCuota?number * 100>
                                            <tr style="padding:0px 0px;">
                                                <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${traslado_imp.atributos.Base}</td>
                                                <#if traslado_imp.atributos.Impuesto == "002">
                                                    <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IVA ${tasa_line}%</td>
                                                <#else>
                                                    <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IEPS ${tasa_line}%</td>
                                                </#if>
                                                <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">${traslado_imp.atributos.Impuesto}</td>
                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${tasa_line?string[",##0.00"]}%</td>
                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${traslado_imp.atributos.Importe}</td>

                                            </tr>
                                        </#list>
                                    <#else>
                                        <#assign impuesto_dataxml = impuesto_dataxml + dataXML.Conceptos.Impuestos.Traslados.Traslado.atributos.Importe?number>
                                        <#assign tasa_line = dataXML.Conceptos.Impuestos.Traslados.Traslado.atributos.TasaOCuota?number * 100>
                                        <tr style="padding:0px 0px;">
                                            <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${dataXML.Conceptos.Impuestos.Traslados.Traslado.atributos.Base}</td>
                                            <#if dataXML.Conceptos.Impuestos.Traslados.Traslado.atributos.Impuesto == "002">
                                                <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IVA ${tasa_line}%</td>
                                            <#else>
                                                <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IEPS ${tasa_line}%</td>
                                            </#if>
                                            <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">${dataXML.Conceptos.Impuestos.Traslados.Traslado.atributos.Impuesto}</td>
                                            <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${tasa_line?string[",##0.00"]}%</td>
                                            <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${dataXML.Conceptos.Impuestos.Traslados.Traslado.atributos.Importe}</td>

                                        </tr>
                                    </#if>
                                </#if>

                                <#if dataXML.Conceptos.Impuestos.Retenciones.Retencion?has_content>
                                    <#if dataXML.Conceptos.Impuestos.Retenciones.Retencion?is_sequence>
                                        <#list dataXML.Conceptos.Impuestos.Retenciones.Retencion as ret_imp>
                                            <#assign impuesto_dataxml = impuesto_dataxml - ret_imp.atributos.Importe?number>
                                            <#assign tasa_line = ret_imp.atributos.TasaOCuota?number * 100>
                                            <tr style="padding:0px 0px;">
                                                <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${ret_imp.atributos.Base}</td>
                                                <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">Retencion ${tasa_line}%</td>
                                                <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">${ret_imp.atributos.Impuesto}</td>
                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${tasa_line?string[",##0.00"]}%</td>
                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${ret_imp.atributos.Importe}</td>

                                            </tr>
                                        </#list>
                                    <#else>
                                        <#assign impuesto_dataxml = impuesto_dataxml - dataXML.Conceptos.Impuestos.Retenciones.Retencion.atributos.Importe?number>
                                        <#assign tasa_line = dataXML.Conceptos.Impuestos.Retenciones.Retencion.atributos.TasaOCuota?number * 100>
                                        <tr style="padding:0px 0px;">
                                            <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${dataXML.Conceptos.Impuestos.Retenciones.Retencion.atributos.Base}</td>
                                            <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">Retencion ${tasa_line}%</td>
                                            <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">${dataXML.Conceptos.Impuestos.Retenciones.Retencion.atributos.Impuesto}</td>
                                            <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${tasa_line?string[",##0.00"]}%</td>
                                            <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${dataXML.Conceptos.Impuestos.Retenciones.Retencion.atributos.Importe}</td>
                                        </tr>
                                    </#if>
                                </#if>

                            </table>
                        </td>

                        <#assign "units_sat" = dataXML.Conceptos.Concepto.atributos.ClaveUnidad>
                        <#assign "unidades_text" = dataXML.Conceptos.Concepto.atributos.ClaveUnidad>
                        <#assign total_piezas += dataXML.Conceptos.Concepto.atributos.Cantidad>
                        <#assign "piezas_caja" = dataXML.Conceptos.Concepto.atributos.Cantidad>
                        <#assign total_cajas += dataXML.Conceptos.Concepto.atributos.Cantidad>
                        <#assign "cantidad" = dataXML.Conceptos.Concepto.atributos.Cantidad>


                        <td colspan="3" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${units_sat} <br></br> ${dataXML.Conceptos.Concepto.atributos.ClaveUnidad}</td>

                        <td colspan="5" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${dataXML.Conceptos.Concepto.atributos.NoIdentificacion}</td>
                        <td align="center" colspan="3" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px">${dataXML.Conceptos.Concepto.atributos.Cantidad}</td>
                        <#assign rate=dataXML.Conceptos.Concepto.atributos.ValorUnitario>
                        <#assign subtotallinea_dataxml = dataXML.Conceptos.Concepto.atributos.Importe?number+impuesto_dataxml>
                        <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3; font-size:6pt; padding-top:2px;padding-right:0px; padding-left:0px">${dataXML.Conceptos.Concepto.atributos.Importe}</td>
                        <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt;padding-top:2px;padding-right:0px; padding-left:0px">${impuesto_dataxml?string[",##0.00"]}</td>
                        <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${dataXML.Conceptos.Concepto.atributos.Descuento}</td>
                        <td align="right" colspan="6" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${subtotallinea_dataxml?string[",##0.00"]}</td>
                    </tr>

                </#if>
            </table>
        <#else>
            <table class="itemtable" style="width: 100%; margin-top: 5px; border: 1px; border-color: #e3e3e3;">
                <#list record.item as item>
                    <#if item_index==0>
                        <thead>
                        <tr>
                            <th align="center" colspan="2" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Linea</th>
                            <th align="center" colspan="4" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">SKU <br></br>Clave SAT</th>

                            <th align="center" colspan="18" style="color: #000000; font-size: 6pt; padding-top: 1px;  padding-bottom: 1px;">
                                <table class="desglose_table" style="width: 100%;">
                                    <tr>
                                        <th colspan="20" align="center" style="font-size: 6pt;  padding: 1px 0px 1px 0px">Descripción</th>
                                    </tr>
                                    <tr >
                                        <td colspan="5" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Base</td>
                                        <td colspan="4" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Impuesto</td>
                                        <td colspan="3" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Factor</td>
                                        <td colspan="3" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Tasa</td>
                                        <td colspan="5" style="color: #000000; font-size: 5pt;  padding-top: 1px;  padding-bottom: 1px;">Importe</td>
                                    </tr>
                                </table></th>

                            <th align="center" colspan="3" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Unidad<br></br>SAT<br></br>Unidad</th>

                            <th align="center" colspan="5" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">UPC</th>
                            <th align="center" colspan="3" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Cant.</th>
                            <th align="center" colspan="4" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px"><center>Precio sin<br/>impuesto</center></th>
                            <th align="center" colspan="4" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Impuesto</th>
                            <th align="center" colspan="5" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Descuento</th>
                            <th align="center" colspan="5" style="color: #000000; font-size: 6pt; padding: 1px 0px 1px 0px">Subtotal</th>
                        </tr>
                        </thead>
                    </#if>

                    <#if item.custcol_efx_esartenvio_linea == true && item.itemtype == 'Service'>
                        <#assign "shipmentcost" += item.rate>
                    </#if>

                    <#if (item.rate gt 0) && item.itemtype != 'Discount'>
                        <#assign "linecount" += 1/>


                        <#assign "ratewithdiscount" = item.rate/>
                        <#assign "discountamount" = 0/>
                        <#if ((item_index + 1) lt record.item?size) >
                            <#if (record.item[item_index + 1].rate lt 0) >
                                <#assign "ratewithdiscount" = (item.rate * (1 + record.item[item_index + 1].rate))/>
                                <#assign "discountamount" = record.item[item_index + 1].amount/>
                                <#assign totaldiscount += discountamount/>
                            </#if>
                        </#if>

                        <tr>
                            <#assign "desglose_json" = item.custcol_efx_fe_tax_json>
                            <#assign "desglose" = desglose_json?eval>

                            <td align="center" colspan="2" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:1px">${(linecount)?string['0']}</td>
                            <td align="center" colspan="4" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:1px; padding-right:0px; padding-left:0px">${item.item?keep_before(" ")}<br></br><#if record.custbody_efx_fe_gbl_ismirror== true >01010101<#else>${item.custcol_mx_txn_line_sat_item_code?keep_before(" ")}</#if></td>


                            <#if record.custbody_efx_fe_gbl_ismirror== true >
                                <#assign "desglose_json_gbl" = item.custcol_efx_fe_gbl_json>
                                <#assign "desglose_gbl" = desglose_json_gbl?eval>
                                <td colspan="18" style="border-left: 1px; border-color: #e3e3e3; padding-top:1px;padding-top:1px;padding-right:0px; padding-left:0px" align="center">
                                    <table class="desglose_table"  style="width: 100%">
                                        <tr style="padding:0px 0px 0px 0px;">
                                            <td colspan="20" style="font-size: 6pt; padding:0px 0px;">${item.custcol_efx_fe_gbl_related_tran}</td>

                                        </tr>
                                        <#if desglosa_cliente==true>
                                            <#if desglose_gbl.rates_ieps_data?has_content>
                                                <#list desglose_gbl.rates_ieps_data as ieps_l_rate, ieps_l_total>
                                                    <#list desglose_gbl.bases_ieps as ieps_b_rate, ieps_b_total>
                                                        <#if ieps_l_rate == ieps_b_rate>

                                                            <tr style="padding:0px 0px;">
                                                                <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${ieps_b_total?number?string[",##0.00"]}</td>

                                                                <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IEPS ${ieps_l_rate}%</td>
                                                                <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">003</td>
                                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${ieps_b_rate?number?string[",##0.00"]}%</td>
                                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${ieps_l_total?number?string[",##0.00"]}</td>

                                                            </tr>




                                                            <#if obj_totales_imp?has_content>
                                                                <#assign "conteos" = 0>
                                                                <#list obj_totales_imp?keys as key>

                                                                    <#if key == ieps_l_rate>
                                                                        <#assign "conteos" = 1>

                                                                        <#assign "total_rate" = obj_totales_imp[key] + ieps_l_total?number>
                                                                        <#assign "obj_totales_imp"= obj_totales_imp + {ieps_l_rate : total_rate}>

                                                                    </#if>
                                                                </#list>
                                                                <#if conteos == 0>
                                                                    <#assign "obj_totales_imp"= obj_totales_imp + {ieps_l_rate : ieps_l_total?number}>
                                                                </#if>
                                                            <#else>
                                                                <#assign "obj_totales_imp"= obj_totales_imp + {ieps_l_rate : ieps_l_total?number}>
                                                            </#if>




                                                            <#assign totaliepsGBL = totaliepsGBL + ieps_l_total?number>
                                                        </#if>
                                                    </#list>
                                                </#list>
                                            </#if>
                                        </#if>

                                        <#if desglose_gbl.rates_iva_data?has_content>
                                            <#list desglose_gbl.rates_iva_data as iva_l_rate, iva_l_total>
                                                <#list desglose_gbl.bases_iva as iva_b_rate, iva_b_total>
                                                    <#if iva_l_rate == iva_b_rate>
                                                        <tr style="padding:0px 0px;">
                                                            <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${iva_b_total?number?string[",##0.00"]}</td>

                                                            <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">IVA ${iva_l_rate}%</td>
                                                            <td colspan="2" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">002</td>
                                                            <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${iva_b_rate?number?string[",##0.00"]}%</td>
                                                            <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${iva_l_total?number?string[",##0.00"]}</td>

                                                        </tr>



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


                                                        <#assign totalivaGBL = totalivaGBL + iva_l_total?number>
                                                    </#if>
                                                </#list>
                                            </#list>
                                        </#if>

                                        <#if desglosa_cliente==true>
                                            <#if desglose_gbl.rates_local_data?has_content>
                                                <#list desglose_gbl.rates_local_data as local_l_rate, local_l_total>
                                                    <#list desglose_gbl.bases_local as local_b_rate, local_b_total>
                                                        <#if local_l_rate == local_b_rate>
                                                            <tr style="padding:0px 0px;">
                                                                <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${local_b_total?number?string[",##0.00"]}</td>
                                                                <td colspan="6" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;padding-right:0px; padding-left:0px">LOCAL ${local_l_rate}%</td>
                                                                <td colspan="3" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">003</td>
                                                                <td align="right" colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${local_b_rate?number?string[",##0.00"]}%</td>
                                                                <td align="right" colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${local_l_total?number?string[",##0.00"]}</td>
                                                            </tr>
                                                        </#if>
                                                    </#list>
                                                </#list>
                                            </#if>

                                        </#if>

                                        <#if item.custcol_mx_txn_line_sat_cust_req_num?has_content>
                                            <tr style="padding:0px 0px;">
                                                <td colspan="6" style="font-size: 3pt; padding-top: 1px;  padding-bottom: 1px;"><b>Pedimento:</b> </td>
                                                <td colspan="7" style="font-size: 3pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_mx_txn_line_sat_cust_req_num}</td>
                                                <td colspan="7" style="font-size: 3pt; padding-top: 1px;  padding-bottom: 1px;"><b>Fecha Pedimento:</b> </td>
                                                <td colspan="6" style="font-size: 3pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_efx_int_g1_date}</td>
                                            </tr>
                                        </#if>
                                    </table>
                                </td>

                            <#else>

                                <td colspan="18" style="border-left: 1px; border-color: #e3e3e3;font-size: 4pt padding-top:1px;" align="center">
                                    <table class="desglose_table"  style="width: 100%;padding:0px;margin-top:-2px">
                                        <tr style="padding:0px 0px 0px 0px;">
                                            <td colspan="20" style="font-size: 6pt; padding:0px 0px;">${item.description}</td>

                                        </tr>
                                        <tr> <td colspan="20" style="font-size: 5pt; padding:0px 0px;">${item.custcol_efx_nota_linea}</td>   </tr>
                                        <#if desglosa_cliente==true>
                                            <#assign key = desglose.ieps.name/>
                                            <#if desglose.ieps.name?has_content>

                                                <tr style="padding:0px 0px;">
                                                    <td colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;" >${desglose.ieps.base_importe?number?string[",##0.00"]}</td>
                                                    <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;" >${desglose.ieps.name}%</td>
                                                    <td colspan="3" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.ieps.factor}</td>
                                                    <td align="right" colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.ieps.rate?string[",##0.00"]}%</td>
                                                    <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.ieps.importe?number?string[",##0.00"]}</td>
                                                </tr>
                                            </#if>
                                        </#if>
                                        <#if desglose.iva.name?has_content>

                                            <tr style="padding:0px 0px;">
                                                <!--<td colspan="5" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.iva.base_importe?number?string[",##0.00"]}</td>-->
                                                <td colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.iva.base_importe?number?string[",##0.00"]}</td>
                                                <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.iva.name}%</td>
                                                <td colspan="3" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.iva.factor}</td>
                                                <td  align="right" colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.iva.rate?string[",##0.00"]}%</td>
                                                <!--<td align="right" colspan="5" style="font-size: 4pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.iva.importe?number?string[",##0.00"]}</td>-->
                                                <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.iva.importe?number?string[",##0.00"]}</td>
                                            </tr>
                                        </#if>
                                        <#if desglosa_cliente==true>
                                            <#if desglose.locales.name?has_content>

                                                <tr style="padding:0px 0px;">
                                                    <td colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.locales.base_importe?number?string[",##0.00"]}</td>
                                                    <td colspan="4" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.locales.name?replace(' CDMX| QRO', '', 'r')?upper_case}%</td>
                                                    <td colspan="3" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.locales.factor}</td>
                                                    <td  align="right" colspan="3" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.locales.rate?string[",##0.00"]}%</td>
                                                    <td align="right" colspan="5" style="font-size: 5pt; padding-top: 1px;  padding-bottom: 1px;">${desglose.locales.importe?number?string[",##0.00"]}</td>
                                                </tr>
                                            </#if>
                                        </#if>

                                        <#if item.custcol_mx_txn_line_sat_cust_req_num?has_content>
                                            <tr style="padding:0px 0px;">
                                                <td colspan="6" style="font-size: 3pt; padding-top: 1px;  padding-bottom: 1px;"><b>Pedimento:</b> </td>
                                                <td colspan="7" style="font-size: 3pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_mx_txn_line_sat_cust_req_num}</td>
                                                <td colspan="7" style="font-size: 3pt; padding-top: 1px;  padding-bottom: 1px;"><b>Fecha Pedimento:</b> </td>
                                                <td colspan="6" style="font-size: 3pt; padding-top: 1px;  padding-bottom: 1px;">${item.custcol_efx_int_g1_date}</td>
                                            </tr>
                                        </#if>

                                    </table>

                                </td>
                            </#if>

                            <#if item.units?has_content>
                                <#assign "unidades_text" = item.units>
                                <#assign "cantidad" = item.quantity>
                                <#assign "cantidad_cajas" = 0>
                                <#assign "caracter_units" = unidades_text?substring(0, 1)>

                                <#if item.itemtype == 'InvtPart'>

                                    <#if caracter_units=="C">
                                        <#assign "cantidad_cajas_text" = unidades_text?replace("C", "")>
                                        <#assign "cantidad_cajas" = cantidad_cajas_text?number>
                                        <#assign total_cajas += item.quantity>
                                        <#assign "piezas_caja" = cantidad_cajas * cantidad>
                                        <#assign total_piezas += piezas_caja>
                                    <#else>
                                        <#assign total_piezas += item.quantity>
                                    </#if>
                                </#if>
                            </#if>

                            <#if item.units == "">
                                <#assign "units_sat" = "">

                            <#else>

                                <#if caracter_units=="C">
                                    <#assign "units_sat" = "XBX">
                                <#else>
                                    <#if item.units == "ANT">
                                        <#assign "units_sat" = "ACT">
                                    </#if>
                                    <#if item.units == "ACT">
                                        <#assign "units_sat" = "ACT">
                                    </#if>
                                    <#if item.units == "SERV">
                                        <#assign "units_sat" = "ACT">
                                    </#if>
                                    <#if item.units == "GR">
                                        <#assign "units_sat" = "GRM">
                                    </#if>
                                    <#if item.units == "KG">
                                        <#assign "units_sat" = "KGM">
                                    </#if>
                                    <#if item.units == "ML">
                                        <#assign "units_sat" = "MLT">
                                    </#if>
                                    <#if item.units == "L">
                                        <#assign "units_sat" = "LTR">
                                    </#if>
                                    <#if item.units == "PZA">
                                        <#assign "units_sat" = "H87">
                                    </#if>
                                </#if>
                            </#if>


                            <td colspan="3" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${units_sat} <br></br> ${item.units}</td>

                            <td colspan="5" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${item.custcol_efx_fe_upc_code}</td>
                            <td align="center" colspan="3" line-height="150%" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;">${item.quantity?string['0']}</td>
                            <#if record.custbody_efx_fe_gbl_ismirror== true >
                                <#assign rate=item.rate>
                                <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3; font-size:6pt; padding-top:2px;padding-right:0px; padding-left:0px">${item.custcol_efx_fe_subtotal_gbl?number?string[",##0.00"]}</td>
                                <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt;padding-top:2px;padding-right:0px; padding-left:0px">${item.custcol_efx_fe_taxtotal_gbl?number?string[",##0.00"]}</td>
                                <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${discountamount?abs?string[',##0.00']}</td>
                                <td align="right" colspan="6" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:2px;padding-right:0px; padding-left:0px">${item.amount?string[",##0.00"]}</td>
                            <#else>



                                <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3; font-size:4pt; padding-top:1px;">
                                    <#assign "totalimp" =  0>
                                    <#assign "discountamount" = 0/>
                                    <#assign "discountrate" = 0/>
                                    <#assign "discounttax" = 0/>
                                    <#if desglose.ieps.importe?has_content> <#assign "iepstax" = desglose.ieps.importe?number/><#else><#assign "iepstax" = 0/></#if>
                                    <#if ((item_index + 1) lt record.item?size) >
                                        <#if (record.item[item_index + 1].rate lt 0) >
                                            <#assign "discountamount" = record.item[item_index + 1].amount/>
                                            <#assign "discountrate" = discountamount/item.quantity/>
                                            <#assign "discounttax" += record.item[item_index + 1].tax1amt/>
                                        </#if>
                                    </#if>
                                    <#if desglose.ieps.name?has_content && desglosa_cliente!=true>
                                        <#assign "ratevalue" = desglose.iva.base_importe>
                                        <#assign "rateieps" = ((item.rate + discountrate) * (1 + (desglose.ieps.rate /100)))/>
                                    <#else>
                                        <#assign "ratevalue" = (item.amount + discountamount)>
                                        <#if record.custbody_efx_promo_desglosa_promo == true>
                                            <#assign "rateieps" = item.rate/>
                                        <#else>
                                            <#assign "rateieps" = item.rate  + discountamount/>
                                        </#if>

                                    </#if>


                                    <#if desglosa_cliente==true>
                                        <#assign "subtotalwithieps" += item.rate * item.quantity>
                                        <#assign "totalimp" +=  desglose.impuestoLineaCalculados?number>
                                    <#else>
                                        <#assign "totalimp" +=  desglose.impuestoLineaCalculados?number  - iepstax>
                                        <#assign "subtotalwithieps" += rateieps * item.quantity>
                                    </#if>

                                    <#assign rate=item.rate>
                                    <#if record.custbody_efx_promo_desglosa_promo == true>
                                        <#assign rate = item.rate + discountamount>
                                    </#if>


                                    <!--<#if desglosa_cliente==true>${rate?string[',##0.00']}<#else>${rateieps?string[',##0.00']}</#if></td>-->
                                    <#if desglosa_cliente==true>${rate?string[',##0.00']}<#else>${rateieps?string[',##0.00']}</#if></td>

                                <!--<td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 4pt;padding-top:2px;">
    ${totalimp?string[',##0.00']}  </td>-->
                                <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt;padding-top:1px;padding-right:0px; padding-left:0px">
                                    ${totalimp?string[',##0.00']}  </td>

                                <td align="right" colspan="4" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:1px;padding-right:0px; padding-left:0px">
                                    <!--<#if record.custbody_efx_promo_desglosa_promo == true>0.00<#else>${discountamount?abs?string[',##0.00']}</#if></td>-->
                                    <#if record.custbody_efx_promo_desglosa_promo == true>0.00<#else>${discountamount?abs?string[',##0.00']}</#if></td>
                                <!--<td align="right" colspan="6" style="border-left: 1px; border-color: #e3e3e3;font-size: 4pt; padding-top:2px;"><#if desglosa_cliente==true>${(rate * item.quantity)?string[',##0.00']}<#else>${(rateieps * item.quantity)?string[',##0.00']}</#if></td>-->
                                <td align="right" colspan="6" style="border-left: 1px; border-color: #e3e3e3;font-size: 6pt; padding-top:1px;"><#if desglosa_cliente==true>${(rate * item.quantity)?string[',##0.00']}<#else>${(rateieps * item.quantity)?string[',##0.00']}</#if></td>
                            </#if>
                        </tr>
                    </#if>
                </#list>
            </table>

        </#if>



        <table style="width: 100%; margin-top: 5px; padding: 0; border: 1px; border-color: #e3e3e3;">
            <tr>
                <td colspan="6" style="margin: 0px; padding: 0;">
                    <table style="width: 100%; margin: 0px; padding: 0; border: 0px; border-color: #e3e3e3;">
                        <tr>
                            <td colspan="6" class="cabecera"><b>Detalles del comprobante</b></td>
                        </tr>
                        <tr>
                            <td colspan="1" style="font-size: 7pt; padding: 2px;"><b>Tipo de comprobante:</b></td>
                            <td colspan="2" style="font-size: 7pt; padding: 2px;">INGRESO</td>
                            <#assign forma_pago = record.custbody_mx_txn_sat_payment_method?keep_before(" ")>
                            <td colspan="1" style="font-size: 7pt; padding: 2px;"><b>Forma de pago:</b></td>
                            <#if forma_pago == "01">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">01 - EFECTIVO</td>
                            <#elseif forma_pago == "02">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">02 - CHEQUE NOMINATIVO</td>
                            <#elseif forma_pago == "03">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">03 - TRANSFERENCIA ELECTRÓNICA DE FONDOS</td>
                            <#elseif forma_pago == "04">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">04 - TARJETA DE CRÉDITO</td>
                            <#elseif forma_pago == "05">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">05 - MONEDERO ELECTRÓNICO</td>
                            <#elseif forma_pago == "06">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">06 - DINERO ELECTRÓNICO</td>
                            <#elseif forma_pago == "07">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">07 - TARJETAS DIGITALES</td>
                            <#elseif forma_pago == "08">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">08 - VALES DE DESPENSA</td>
                            <#elseif forma_pago == "09">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">09 - BIENES</td>
                            <#elseif forma_pago == "10">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">10 - SERVICIO</td>
                            <#elseif forma_pago == "11">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">11 - POR CUENTA DE TERCERO</td>
                            <#elseif forma_pago == "12">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">12 - DACIÓN EN PAGO</td>
                            <#elseif forma_pago == "13">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">13 - PAGO POR SUBROGACIÓN</td>
                            <#elseif forma_pago == "14">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">14 - PAGO POR CONSIGNACIÓN</td>
                            <#elseif forma_pago == "15">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">15 - CONDONACIÓN</td>
                            <#elseif forma_pago == "16">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">16 - CANCELACIÓN</td>
                            <#elseif forma_pago == "17">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">17 - COMPENSACIÓN</td>
                            <#elseif forma_pago == "23">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">23 - NOVACIÓN</td>
                            <#elseif forma_pago == "24">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">24 - CONFUSIÓN</td>
                            <#elseif forma_pago == "25">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">25 - REMISIÓN DE DEUDA</td>
                            <#elseif forma_pago == "26">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">26 - PRESCRIPCIÓN O CADUCIDAD</td>
                            <#elseif forma_pago == "27">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">27 - A SATISFACCIÓN DEL ACREEDOR</td>
                            <#elseif forma_pago == "28">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">28 - TARJETA DE DÉBITO</td>
                            <#elseif forma_pago == "29">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">29 - TARJETA DE SERVICIOS</td>
                            <#elseif forma_pago == "30">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">30 - APLICACIÓN DE ANTICIPOS</td>
                            <#elseif forma_pago == "31">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">31 - INTERMEDIARIO PAGOS</td>
                            <#elseif forma_pago == "98">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">98 - N/A</td>
                            <#elseif forma_pago == "99">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">99 - POR DEFINIR</td>
                            <#else>
                                <td colspan="2" style="font-size: 7pt; padding: 2px;"></td>
                            </#if>

                        </tr>
                        <tr>
                            <td colspan="1" style="font-size: 7pt; padding: 2px;"><b>Moneda:</b></td>
                            <td colspan="2" style="font-size: 7pt; padding: 2px;">${record.currency?upper_case}</td>
                            <td colspan="1" style="font-size: 7pt; padding: 2px;"><b>Método de pago:</b></td>
                            <#assign metodo_pago = record.custbody_mx_txn_sat_payment_term?keep_before(" ")>
                            <#if metodo_pago == "PUE">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">PUE - PAGO EN UNA SOLA EXHIBICION</td>
                            <#elseif metodo_pago == "PPD">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">PPD - PAGO EN PARCIALIDADES O DIFERIDO</td>
                            <#else>
                                <td colspan="2" style="font-size: 7pt; padding: 2px;"></td>
                            </#if>
                        </tr>
                        <tr>
                            <#assign uso_cfdi = record.custbody_mx_cfdi_usage?keep_before(" ")>
                            <td colspan="1" style="font-size: 7pt; padding: 2px;"><b>Uso del CFDI:</b></td>
                            <#if uso_cfdi == "D01">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D01 - HONORARIOS MÉDICOS, DENTALES Y GASTOS HOSPITALARIOS</td>
                            <#elseif uso_cfdi == "D02">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D02 - GASTOS MÉDICOS POR INCAPACIDAD O DISCAPACIDAD</td>
                            <#elseif uso_cfdi == "D03">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D03 - GASTOS FUNERALES</td>
                            <#elseif uso_cfdi == "D04">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D04 - DONATIVOS</td>
                            <#elseif uso_cfdi == "D05">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D05 - INTERESES REALES EFECTIVAMENTE PAGADOS POR CRÉDITOS HIPOTECARIOS (CASA HABITACIÓN)</td>
                            <#elseif uso_cfdi == "D06">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D06 - APORTACIONES VOLUNTARIAS AL SAR</td>
                            <#elseif uso_cfdi == "D07">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D07 - PRIMAS POR SEGUROS DE GASTOS MÉDICOS</td>
                            <#elseif uso_cfdi == "D08">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D08 - GASTOS DE TRANSPORTACIÓN ESCOLAR OBLIGATORIA</td>
                            <#elseif uso_cfdi == "D09">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D09 - DEPÓSITOS EN CUENTAS PARA EL AHORRO, PRIMAS QUE TENGAN COMO BASE PLANES DE PENSIONES</td>
                            <#elseif uso_cfdi == "D10">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">D10 - PAGOS POR SERVICIOS EDUCATIVOS (COLEGIATURAS)</td>
                            <#elseif uso_cfdi == "G01">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">G01 - ADQUISICIÓN DE MERCANCÍAS</td>
                            <#elseif uso_cfdi == "G02">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">G02 - DEVOLUCIONES, DESCUENTOS O BONIFICACIONES</td>
                            <#elseif uso_cfdi == "G03">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">G03 - GASTOS EN GENERAL</td>
                            <#elseif uso_cfdi == "I01">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">I01 - CONSTRUCCIONES</td>
                            <#elseif uso_cfdi == "I02">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">I02 - MOBILIARIO Y EQUIPO DE OFICINA POR INVERSIONES</td>
                            <#elseif uso_cfdi == "I03">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">I03 - EQUIPO DE TRANSPORTE</td>
                            <#elseif uso_cfdi == "I04">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">I04 - EQUIPO DE CÓMPUTO Y ACCESORIOS</td>
                            <#elseif uso_cfdi == "I05">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">I05 - DADOS, TROQUELES, MOLDES, MATRICES Y HERRAMENTAL</td>
                            <#elseif uso_cfdi == "I06">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">I06 - COMUNICACIONES TELEFÓNICAS</td>
                            <#elseif uso_cfdi == "I07">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">I07 - COMUNICACIONES SATELITALES</td>
                            <#elseif uso_cfdi == "I08">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">I08 - OTRA MAQUINARIA Y EQUIPO</td>
                            <#elseif uso_cfdi == "P01">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">P01 - POR DEFINIR</td>
                            <#else>
                                <td colspan="2" style="font-size: 7pt; padding: 2px;"></td>
                            </#if>
                            <td colspan="1" style="font-size: 7pt; padding: 2px; padding: 2px;"><b>Lugar de expedici&oacute;n:</b></td>
                            <td colspan="2" style="font-size: 7pt; padding: 2px;">${record.location.custrecord_efx_lugar_expedicion?upper_case}</td>
                        </tr>
                        <tr>
                            <td colspan="1" style="font-size: 7pt; padding: 2px;"><b>Régimen fiscal:</b></td>
                            <#assign regfiscal = record.subsidiary.custrecord_mx_sat_industry_type?keep_before(" ")>
                            <#if regfiscal == "601">
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">601 - GENERAL DE LEY PERSONAS MORALES</td>
                            <#else>
                                <td colspan="2" style="font-size: 7pt; padding: 2px;">${record.subsidiary.custrecord_mx_sat_industry_type?upper_case}</td>
                            </#if>
                        </tr>

                    </table>
                </td>

                <td colspan="2" style="margin: 0px; padding: 0; border-left: 1px; border-color: #e3e3e3;">
                    <table style="width: 100%; height: 100%; margin-top: 0px; margin-left: 0px; border: 0px; border-color: #e3e3e3;">
                        <tr>
                            <td colspan="2" class="cabecera"><b>Resumen</b></td>
                        </tr>
                        <#if dataXML?has_content>
                            <tr>
                                <td colspan="1" style="font-size: 7pt; padding:2px"><b>Subtotal</b></td>
                                <td align="right" colspan="1" style="font-size: 7pt; padding:2px">${dataXML.atributos.SubTotal}</td>
                            </tr>
                        <#else>
                            <tr>
                                <td colspan="1" style="font-size: 7pt; padding:2px"><b>Subtotal</b></td>
                                <td align="right" colspan="1" style="font-size: 7pt; padding:2px">${subtotalwithieps?string[",##0.00"]}</td>
                            </tr>
                        </#if>

                        <tr>
                            <td colspan="1" style="font-size: 7pt; padding:2px"><b>Descuento</b></td>
                            <#if dataXML?has_content>
                                <td align="right" colspan="1" style="font-size: 7pt; padding:2px">${dataXML.atributos.Descuento}</td>
                            <#else>
                                <td align="right" colspan="1" style="font-size: 7pt; padding:2px"><#if record.custbody_efx_promo_desglosa_promo == true>0.00<#else>${desglose_total_discount?number?string[",##0.00"]}</#if></td>
                            </#if>
                        </tr>

                        <#if desglosa_cliente==true>
                            <#if dataXML?has_content>

                                <tr>
                                    <td colspan="1" style="font-size: 7pt;padding:2px"> <b>Traslados</b></td>
                                    <td align="right" colspan="1" style="font-size: 7pt; padding:2px">${dataXML.Impuestos.atributos.TotalImpuestosTrasladados}</td>
                                </tr>
                            <#else>
                                <tr>
                                    <td colspan="1" style="font-size: 7pt;padding:2px"> <b>IEPS</b></td>
                                    <td align="right" colspan="1" style="font-size: 7pt; padding:2px">${ieps_total?number?string[",##0.00"]}</td>
                                </tr>
                            </#if>
                        </#if>

                        <#if desglosa_cliente==true>

                            <#if dataXML?has_content>
                                <#if dataXML.Impuestos.Traslados.Traslado?is_sequence>
                                    <#list dataXML.Impuestos.Traslados.Traslado as traslados_lista>
                                        <#assign iva_ratenum = traslados_lista.atributos.TasaOCuota?number * 100>
                                        <tr>
                                            <#if traslados_lista.atributos.Impuesto=="002">
                                                <td colspan="2" style="font-size: 5pt;">
                                                    IVA ${iva_ratenum}%: ${traslados_lista.atributos.Importe}<br/>
                                                </td>
                                            <#else>
                                                <td colspan="2" style="font-size: 5pt;">
                                                    IEPS ${iva_ratenum}%: ${traslados_lista.atributos.Importe}<br/>
                                                </td>
                                            </#if>

                                        </tr>
                                    </#list>
                                <#else>
                                    <#assign iva_ratenum = dataXML.Impuestos.Traslados.Traslado.atributos.TasaOCuota?number * 100>
                                    <tr>
                                        <#if dataXML.Impuestos.Traslados.Traslado.atributos.Impuesto=="002">
                                            <td colspan="2" style="font-size: 5pt;">
                                                IVA ${iva_ratenum}%: ${dataXML.Impuestos.Traslados.Traslado.atributos.Importe}<br/>
                                            </td>
                                        <#else>
                                            <td colspan="2" style="font-size: 5pt;">
                                                IEPS ${iva_ratenum}%: ${dataXML.Impuestos.Traslados.Traslado.atributos.Importe}<br/>
                                            </td>
                                        </#if>

                                    </tr>
                                </#if>

                            <#else>
                                <tr>
                                    <td colspan="2" style="font-size: 5pt;">
                                        <#list desglose_ieps as name_ieps, price_ieps>
                                            ${name_ieps}: ${price_ieps?number?string[",##0.00"]}<br/>
                                        </#list>
                                    </td>
                                </tr>
                            </#if>
                        </#if>

                        <#if dataXML?has_content==false>
                            <#if record.custbody_efx_fe_gbl_ismirror== true >
                                <tr>
                                    <td colspan="1" style="font-size: 7pt; padding:2px "><b>IVA</b></td>
                                    <td align="right" colspan="1" style="font-size: 7pt;padding:2px;">${totalivaGBL?string[",##0.00"]}</td>
                                </tr>

                            <#else>
                                <tr>
                                    <td colspan="1" style="font-size: 7pt; padding:2px "><b>IVA</b></td>
                                    <td align="right" colspan="1" style="font-size: 7pt;padding:2px;">${iva_total?number?string[",##0.00"]}</td>
                                </tr>
                            </#if>

                            <#if record.custbody_efx_fe_gbl_ismirror== true >


                                <#list obj_totales_imp as Iva_rate, Iva_total>
                                    <#assign iva_ratenum = Iva_rate?number>
                                    <#assign iva_tasaocuota = iva_ratenum/100>
                                    <#if Iva_rate == "16" || Iva_rate == "0">
                                        <tr>
                                            <td colspan="2" style="font-size: 5pt;">
                                                IVA ${Iva_rate}%: ${Iva_total?string["0.00"]}<br/>
                                            </td>
                                        </tr>
                                    </#if>
                                </#list>

                            <#else>
                                <tr>
                                    <td colspan="2" style="font-size: 5pt; ">
                                        <#list desglose_iva as name_iva, price_iva>
                                            <#if price_iva?is_string>
                                                ${name_iva}: ${price_iva?number?string[",##0.00"]}<br/>
                                            <#else>
                                                ${name_iva}: ${price_iva?string[",##0.00"]}<br/>
                                            </#if>
                                        </#list>
                                    </td>
                                </tr>
                            </#if>

                            <#if local_total?has_content>
                                <tr>
                                    <td colspan="1" style="font-size: 7pt; padding:2px "><b>Otros impuestos</b></td>
                                    <!--<td align="right" colspan="1" style="font-size: 7pt; padding:2px">${local_total?number?string[",##0.00"]}</td>-->
                                    <td align="right" colspan="1" style="font-size: 7pt; padding:2px">${local_total?number?string[",##0.00"]}</td>
                                </tr>
                            </#if>
                        </#if>

                        <tr>
                            <td colspan="1" style="font-size: 7pt; padding:2px"><b>Total</b></td>
                            <#if dataXML?has_content>
                                <td align="right" colspan="1" style="font-size: 7pt; padding:2px">${dataXML.atributos.Total}</td>
                            <#else>
                                <td align="right" colspan="1" style="font-size: 7pt; padding:2px">${cabecera_total?number?string[",##0.00"]}</td>
                            </#if>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <table class="total" style="width: 100%; margin-top: 0px; border: 1px; border-color: #e3e3e3;">

            <tr>
                <td align="left" colspan="3" style="border-bottom: 1px; border-color: #e3e3e3; font-size: 7pt; padding: 2px;"><strong>Cantidad con letra:</strong> ${record.custbody_efx_fe_total_text}</td>
            </tr>
            <tr>
                <td align="left" style="border-right: 1px;  border-color: #e3e3e3; font-size: 7pt; padding: 2px;"><strong>Elaboró: </strong>${record.custbody_efx_cmp_elaboro.firstname?upper_case} ${record.custbody_efx_cmp_elaboro.lastname?upper_case}</td>
                <td align="left" style="border-right: 1px;  border-color: #e3e3e3; font-size: 7pt; padding: 2px;"><strong>Total de piezas: </strong>${total_piezas?string['0']}</td>
                <#if record.custbody_efx_fe_total_box?has_content>
                    <td align="left" style= "font-size: 7pt; padding: 2px;"><strong>Total de cartones: </strong>${record.custbody_efx_fe_total_box}</td>
                <#else>
                    <td align="left" style= "font-size: 7pt; padding: 2px;"></td>
                </#if>
            </tr>
        </table>

        <!--CODIGO RAUL FIN-->
    </#if>

    <table style=" margin-top: 5px; border: 1px; border-color: #e3e3e3;">
        <tr>
            <td colspan="1" class="cabecera"><b>Politicas de Devoluci&oacute;n</b></td>
        </tr>
        <tr>
            <td colspan="1" style="font-size: 7pt; border-color: #e3e3e3;  padding: 2px;">
                - Solo se podrán realizar 30 días naturales posteriores a la fecha de emisión de la factura y para clientes Vinoclub a partir de la fecha de recepción. <br/>
                - No se aceptan devoluciones sobre producto dañado, refrigerado, destruido y/o caduco.<br/>
                - En facturas de eventos Wine Planner no se aceptan devoluciones.<br/>
                - No se aceptan devoluciones en promociones que incluyan dos a más productos bajo un mismo precio de venta.<br/>
                - En caso de recibir nuestro producto por medio de paquetería la solicitud de devolución deberá realizarse dentro de las primeras 48 horas siguientes a la recepción, especificando la razón de esta, motivo y su evidencia fotográfica.
            </td>
        </tr>
    </table>

    <table style=" margin-top: 5px; border: 1px; border-color: #e3e3e3;" width="100%" height="100%">
        <tr>
            <td colspan="1" class="cabecera"><b>Nota de entrega</b></td>
        </tr>
        <tr>
            <td colspan="1" style="font-size: 7pt; border-color: #e3e3e3;  padding: 2px;">
                ${record.custbody_tkio_nota_entrega}
                <br/>
            </td>
        </tr>
    </table>

    <#if record.recmachcustrecord_mx_rcs_orig_trans?has_content>
        <table style="width:100%; margin-top:5px; border: 1px;border-color:#e3e3e3;">
            <tr>
                <td align="left" colspan="2" class="cabecera"><b>Factura Relacionada</b></td>
                <td align="left" colspan="2" class="cabecera"><b>UUID</b></td>
                <td align="left" colspan="2" class="cabecera"><b>Tipo de relación</b></td>
            </tr>
            <#list record.recmachcustrecord_mx_rcs_orig_trans as cfdiRel>
                <tr>
                    <td align="left" colspan="2" style="padding:2px">${cfdiRel.custrecord_mx_rcs_rel_cfdi?keep_after("#")}</td>
                    <td align="left" colspan="2" style="padding:2px">${cfdiRel.custrecord_mx_rcs_uuid}</td>

                    <#assign cfdireltype = cfdiRel.custrecord_mx_rcs_rel_type?keep_before(" ")>
                    <#if cfdireltype == "01">
                        <td align="left" colspan="2" style="padding:2px" class="cuerposnoarticulos">01 - NOTA DE CRÉDITO DE LOS DOCUMENTOS RELACIONADOS</td>
                    <#elseif cfdireltype == "02">
                        <td align="left" colspan="2" style="padding:2px" class="cuerposnoarticulos">02 - NOTA DE DÉBITO DE LOS DOCUMENTOS RELACIONADOS</td>
                    <#elseif cfdireltype == "03">
                        <td align="left" colspan="2" style="padding:2px" class="cuerposnoarticulos">03 - DEVOLUCIÓN DE MERCANCÍA SOBRE FACTURAS O TRASLADOS PREVIOS</td>
                    <#elseif cfdireltype == "04">
                        <td align="left" colspan="2" style="padding:2px" class="cuerposnoarticulos">04 - SUSTITUCIÓN DE LOS CFDI PREVIOS</td>
                    <#elseif cfdireltype == "05">
                        <td align="left" colspan="2" style="padding:2px" class="cuerposnoarticulos">05 - TRASLADOS DE MERCANCÍAS FACTURADOS PREVIAMENTE</td>
                    <#elseif cfdireltype == "06">
                        <td align="left" colspan="2" style="padding:2px" class="cuerposnoarticulos">06 - FACTURA GENERADA POR LOS TRASLADOS PREVIOS</td>
                    <#elseif cfdireltype == "07">
                        <td align="left" colspan="2" style="padding:2px" class="cuerposnoarticulos">07 - CFDI POR APLICACIÓN DE ANTICIPO</td>
                    <#elseif cfdireltype == "08">
                        <td align="left" colspan="2" style="padding:2px" class="cuerposnoarticulos">08 - FACTURA GENERADA POR PAGOS EN PARCIALIDADES</td>
                    <#elseif cfdireltype == "09">
                        <td align="left" colspan="2" style="padding:2px" class="cuerposnoarticulos">09 - FACTURA GENERADA POR PAGOS DIFERIDOS</td>
                    <#else>
                        <td align="left" colspan="2" style="padding:2px"></td>
                    </#if>


                </tr>

            </#list>

        </table>
    </#if>

    <#if certData?has_content>
        <table class="tablascompletas" style="margin-top:5px;"><tr>
                <td colspan="3" class="cabecera"><b>Folio Fiscal</b></td>
                <td colspan="3" class="cabecera"><b>Certificado Digital SAT</b></td>
                <td colspan="3" class="cabecera"><b>Fecha de certificación</b></td>
            </tr>
            <tr>
                <#assign datearray = certData.custbody_mx_cfdi_certify_timestamp?split("T")>
                <td colspan="3" class="cuerposnoarticulos">${certData.custbody_mx_cfdi_uuid}</td>
                <td colspan="3" class="cuerposnoarticulos">${certData.custbody_mx_cfdi_sat_serial}</td>
                <td colspan="3" class="cuerposnoarticulos">

                    <#if datearray?size == 2 >
                        <#assign dayarray = datearray[0]?split("-")>
                        ${dayarray[2]}/${dayarray[1]}/${dayarray[0]} ${datearray[1]}
                    <#else>
                        ${certData.custbody_mx_cfdi_certify_timestamp}
                    </#if>
                </td>
            </tr>
        </table>
        <#assign qrcodeImage = "data:image/png;base64, " + certData.custbody_mx_cfdi_qr_code >
        <table class="total" style="width: 100%; margin-top: 10px; border: 1px; border-color: #e3e3e3;">
            <tr>
                <td class="cabecera" colspan="8"><b>Información CFDI</b></td>
            </tr>
            <tr>
                <td style="font-size:7px;" rowspan="3" width=" 72px" colspan="1">
                    <img style="width: 70px;height:70px" src="${qrcodeImage}" />
                </td>
            </tr>
            <tr>
                <td style="font-size:5px;" rowspan="3" width=" 72px" colspan="7">
                    <p style="font-size:5px;" ><b>UUID: </b>${certData.custbody_mx_cfdi_uuid}</p>
                    <p style="font-size:5px;" ><b>Cadena original</b><br/>${certData.custbody_mx_cfdi_cadena_original}</p>
                    <p style="font-size:5px;"  ><b>Firma del CFDI</b><br/>${certData.custbody_mx_cfdi_signature}</p>
                    <p style="font-size:5px;" rowspan="1" ><b>Firma del SAT</b><br/>${certData.custbody_mx_cfdi_sat_signature}</p>
                </td>
            </tr>
        </table>
    </#if>



    </body>
</pdf>