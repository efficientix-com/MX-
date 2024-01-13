<#setting locale = "es_MX">
<#assign jsonTransaccion = transaction.custbody_efx_fe_tax_json>
<cfdi:Addenda>
    <requestForPayment xmlns="http://www.w3.org/2001/XMLSchema-instance" DeliveryDate="${transaction.custbody_bit_ad_fecha_entrega_mercanci?string('yyyy-MM-dd')}" contentVersion="1.0" documentStatus="ORIGINAL" documentStructureVersion="CPLM1.0" type="SimpleInvoiceType">
        <requestForPaymentIdentification xmlns="">
            <entityType>INVOICE</entityType>
            <uniqueCreatorIdentification>${transaction.tranid}</uniqueCreatorIdentification>
            </requestForPaymentIdentification>
            <orderIdentification xmlns="">
                <referenceIdentification type="ON">${transaction.otherrefnum}</referenceIdentification>
                <ReferenceDate>${transaction.custbody_bit_ad_fecha_entrega_mercanci?string("yyyy-MM-dd")}</ReferenceDate>
                <FechaPromesaEnt>${transaction.trandate?string("yyyy-MM-dd")}</FechaPromesaEnt>
            </orderIdentification>
            <seller xmlns="">
                <gln>0000000122359</gln>
                <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">74055</alternatePartyIdentification>
                <IndentificaTipoProv>1</IndentificaTipoProv>
            </seller>
            <shipTo xmlns="">
                <nameAndAddress>
                    <name>${transaction.shipattention}</name>
                    <streetAddressOne>${transaction.shipaddress?replace("<br />","")}</streetAddressOne>
                    <city>${transaction.shipcity}</city>
                    <postalCode>${transaction.shipzip}</postalCode>
                </nameAndAddress>
                <#if shipaddress.custrecord_bit_ad_warehouse?has_content>
                    <BodegaDestino>${shipaddress.custrecord_bit_ad_warehouse}</BodegaDestino>
                </#if>
                <#if shipaddress.custrecord_bit_ad_bodegareceptora?has_content>
                    <BodegaReceptora>${shipaddress.custrecord_bit_ad_bodegareceptora}</BodegaReceptora>
                </#if>
            </shipTo>
            <Customs xmlns="">
            <#assign esensamble = 0>
            <#list transaction.item as item>
                <#if item.custcol_efx_invdet_json?has_content>
                <#assign jsonMU = item.custcol_efx_invdet_json + item.custcol_efx_invdet_json2 + item.custcol_efx_invdet_json3 + item.custcol_efx_invdet_json4 + item.custcol_efx_invdet_json5>
                <#assign obj_auto = jsonMU?eval>
                    <#list obj_auto as auto_json>
                        <#if auto_json.inventorynumber?starts_with("3MU")>
                            <#assign esensamble = esensamble+1>
                        <#else>
                            <alternatePartyIdentification type="TN">${auto_json.num_pedimento}</alternatePartyIdentification>
                        </#if>
                    </#list>
                </#if>
            </#list>
            <#if esensamble gt 0>
                <alternatePartyIdentification type="TN">ENSAMBLE EN MEXICO</alternatePartyIdentification>
            </#if>
            </Customs>
            <currency xmlns="" currencyISOCode="${transaction.currencysymbol}">
                <currencyFunction>BILLING_CURRENCY</currencyFunction>
                <rateOfChange>${transaction.exchangerate?string["0"]}</rateOfChange>
            </currency>
            <FleteCaja xmlns="" type="BUYER_PROVIDED">CAMIONETA</FleteCaja>
            <allowanceCharge xmlns="" allowanceChargeType="ALLOWANCE_GLOBAL" settlementType="OFF_INVOICE">
            <specialServicesType>AJ</specialServicesType>
            <monetaryAmountOrPercentage>
            <rate base="INVOICE_VALUE">
                <percentage>0</percentage>
            </rate>
            </monetaryAmountOrPercentage>
            </allowanceCharge>
            <#assign lineas=0>
            <#list transaction.item as item>
                <#assign lineas=lineas+1>
                <lineItem xmlns="" number="${lineas}" type="SimpleInvoiceLineItemType">
                    <tradeItemIdentification>
                    <gtin/>
                    </tradeItemIdentification>
                    <alternateTradeItemIdentification type="BUYER_ASSIGNED">${item.custcol_bit_cce_noidentificacion}</alternateTradeItemIdentification>
                    <tradeItemDescriptionInformation language="ES">
                        <longText>${item.description}</longText>
                    </tradeItemDescriptionInformation>
                    <invoicedQuantity unitOfMeasure="PCE">${item.quantity}</invoicedQuantity>
                    <grossPrice>
                        <Amount>${item.rate?string["0.00"]}</Amount>
                    </grossPrice>
                    <netPrice>
                        <Amount>${item.rate?string["0.00"]}</Amount>
                    </netPrice>
                    <modeloInformation>
                        <longText>${item.custcol_bit_cce_noidentificacion}</longText>
                    </modeloInformation>
                    <allowanceCharge allowanceChargeType="ALLOWANCE_GLOBAL">
                        <specialServicesType>PAD</specialServicesType>
                        <monetaryAmountOrPercentage>
                            <percentagePerUnit>0</percentagePerUnit>
                            <ratePerUnit>
                                <amountPerUnit>0</amountPerUnit>
                            </ratePerUnit>
                        </monetaryAmountOrPercentage>
                    </allowanceCharge>
                    <totalLineAmount>
                        <grossAmount>
                            <Amount>${item.amount?string["0.00"]}</Amount>
                        </grossAmount>
                        <netAmount>
                            <Amount>${item.amount?string["0.00"]}</Amount>
                        </netAmount>
                        <#if item.custcol_efx_invdet_json?has_content>
                            <#assign jsonMU = item.custcol_efx_invdet_json + item.custcol_efx_invdet_json2 + item.custcol_efx_invdet_json3 + item.custcol_efx_invdet_json4 + item.custcol_efx_invdet_json5>
                            <#assign obj_auto = jsonMU?eval>
                            <#list obj_auto as auto_json>
                                <DetalleMoto>
                                    <Chasis>${auto_json.inventorynumber}</Chasis>
                                    <Motor>${auto_json.num_motor}</Motor>
                                    <Nci>${auto_json.repuve}</Nci>
                                    <#if auto_json.inventorynumber?starts_with("3MU")>
                                        <Pedimento>ENSAMBLE EN MEXICO</Pedimento>
                                    <#else>
                                        <Pedimento>${auto_json.num_pedimento}</Pedimento>
                                    </#if>
                                    <FechaEntrada>${auto_json.fecha_entrada_pedimento?date?string("yyyy-MM-dd")}</FechaEntrada>
                                    <#if detalleInventario?has_content>
                                        <#list detalleInventario.DetalleInv as listadetalle>
                                            <#if listadetalle.serial == auto_json.inventorynumber>
                                                <color>${listadetalle.color}</color>
                                                <Anio>${listadetalle.year}</Anio>
                                                <Marca>${listadetalle.mark}</Marca>
                                                <Cilindraje>${listadetalle.cc}</Cilindraje>
                                            </#if>
                                        </#list>
                                    </#if>
                                </DetalleMoto>
                            </#list>
                        </#if>
                    </totalLineAmount>
                </lineItem>
            </#list>
            <#if transaction.custbody_efx_fe_tax_json?has_content>
                <#assign jsonTransaccionEval=transaction.custbody_efx_fe_tax_json?eval>
            </#if>
            <totalAmount xmlns="">
                <Amount>${jsonTransaccionEval.subtotal}</Amount>
            </totalAmount>
            <TotalAllowanceCharge xmlns="" allowanceOrChargeType="ALLOWANCE">
                <specialServicesType>TD</specialServicesType>
                <Amount>0.00</Amount>
                </TotalAllowanceCharge>
                <baseAmount xmlns="">
                    <Amount>${jsonTransaccionEval.subtotal}</Amount>
                </baseAmount>
                <tax xmlns="" type="VAT">
                    <taxPercentage>16</taxPercentage>
                    <taxAmount>${jsonTransaccionEval.totalImpuestos}</taxAmount>
                    <taxCategory>TRANSFERIDO</taxCategory>
                </tax>
                <payableAmount xmlns="">
                    <Amount>${jsonTransaccionEval.total}</Amount>
                </payableAmount>
                <cadenaOriginal xmlns="">
                    <Cadena/>
                </cadenaOriginal>
    </requestForPayment>
</cfdi:Addenda>