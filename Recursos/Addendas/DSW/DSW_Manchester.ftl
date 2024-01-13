<#setting locale = "es_MX">
<cfdi:Addenda>
    <requestForPayment type="SimpleInvoiceType" contentVersion="1.3.1" documentStructureVersion="AMC7.1" documentStatus="ORIGINAL" DeliveryDate="${transaction.trandate?string("yyyyMMdd")}">
        <requestForPaymentIdentification>
            <entityType>INVOICE</entityType>
            <uniqueCreatorIdentification>${transaction.tranid}</uniqueCreatorIdentification>
        </requestForPaymentIdentification>
        <specialInstruction code ="AAB">
            <text>${transaction.terms}</text>
        </specialInstruction>
        <specialInstruction code="ZZZ">
            <text>${transaction.custbody_efx_fe_total_text}</text>
        </specialInstruction>
        <orderIdentification>
            <referenceIdentification type="ON">${transaction.otherrefnum}</referenceIdentification>
            <ReferenceDate>${transaction.custbody_efx_fe_add_dsw_fecrec?string("yyyyMMdd")}</ReferenceDate>
        </orderIdentification>
        <AdditionalInformation>
            <referenceIdentification type="ATZ">${transaction.otherrefnum}</referenceIdentification>
            <referenceIdentification type="ON">${transaction.otherrefnum}</referenceIdentification>
        </AdditionalInformation>
        <DeliveryNote>
            <#assign tranidd = transaction.tranid?length>
            <#assign traniddpos = transaction.tranid>
            <#assign folio_transaction = "">
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
            <referenceIdentification>${folio_transaction}</referenceIdentification>
            <ReferenceDate>${transaction.trandate?string("yyyyMMdd")}</ReferenceDate>
        </DeliveryNote>
        <buyer>
            <gln>${customer.custentity_efx_fe_add_dsw_buygln}</gln>
            <contactInformation>
                <personOrDepartmentName>
                    <text>${customer.custentity_efx_fe_add_dsw_perdep}</text>
                </personOrDepartmentName>
            </contactInformation>
        </buyer>
        <seller>
            <gln>${customer.custentity_efx_fe_add_dsw_selgln}</gln>
            <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">${customer.custentity_efx_fe_add_dsw_numprov}</alternatePartyIdentification>
        </seller>
        <shipTo>
            <gln>${shipaddress.custrecord_efx_fe_add_dsw_shipgln}</gln>
            <nameAndAddress>
                <name>${shipaddress.custrecord_tkiio_numero_tienda}</name>
                <streetAddressOne>${shipaddress.custrecord_streetname}</streetAddressOne>
                <city>${shipaddress.city}, ${shipaddress.state}</city>
                <postalCode>${shipaddress.zip}</postalCode>
            </nameAndAddress>
        </shipTo>
        <currency currencyISOCode="${transaction.currencysymbol}">
            <currencyFunction>BILLING_CURRENCY</currencyFunction>
            <rateOfChange>${transaction.exchangerate?string["0"]}</rateOfChange>
        </currency>
        <paymentTerms />
        <shipmentDetail />
        <#assign jsonTransaccion = transaction.custbody_efx_fe_tax_json>
        <#if jsonTransaccion?has_content>
            <#assign jsonTransaccionEval = transaction.custbody_efx_fe_tax_json?eval>
            <#assign percdisc = (jsonTransaccionEval.descuentoSinImpuesto?number * 100)/jsonTransaccionEval.subtotal?number>
            <allowanceCharge settlementType="BILL_BACK" allowanceChargeType="ALLOWANCE_GLOBAL" sequeenceNumber="">
                <monetaryAmountOrPercentage>
                    <rate base="INVOICE_VALUE">
                        <percentage>${percdisc?string["0.00"]}</percentage>
                    </rate>
                </monetaryAmountOrPercentage>
            </allowanceCharge>
        </#if>
        <#assign lineas = 0>
        <#list transaction.item as item>
            <#assign lineas = lineas+1>
            <lineItem type="SimpleInvoiceLineItemType" number="${lineas}">
                <tradeItemIdentification>
                    <gtin>${item.custcol_efx_fe_upc_code}</gtin>
                </tradeItemIdentification>
                <alternateTradeItemIdentification type="BUYER_ASSIGNED" />
                <tradeItemDescriptionInformation language="ES">
                    <longText>${item.description} ${item.custcol_efx_fe_upc_code}</longText>
                </tradeItemDescriptionInformation>
                <invoicedQuantity unitOfMeasure="EA">${item.quantity}</invoicedQuantity>
                <aditionalQuantity QuantityType="NUM_CONSUMER_UNITS">1</aditionalQuantity>
                <grossPrice>
                    <Amount>${item.amount?string["0.00"]}</Amount>
                </grossPrice>
                <netPrice>
                    <Amount>${item.amount?string["0.00"]}</Amount>
                </netPrice>
                <AdditionalInformation>
                    <referenceIdentification  type="ON">${transaction.otherrefnum}</referenceIdentification>
                </AdditionalInformation>
                <allowanceCharge allowanceChargeType="ALLOWANCE_GLOBAL" settlementType="CHARGE_TO_BE_PAID_BY_VENDOR" sequenceNumber="${lineas}">
                    <specialServicesType>TD</specialServicesType>
                    <monetaryAmountOrPercentage>
                        <percentagePerUnit>0</percentagePerUnit>
                        <ratePerUnit>
                            <amountPerUnit>0.00</amountPerUnit>
                        </ratePerUnit>
                    </monetaryAmountOrPercentage>
                </allowanceCharge>
                <tradeItemTaxInformation>
                    <taxTypeDescription>VAT</taxTypeDescription>
                    <#assign jsonLinea = item.custcol_efx_fe_tax_json>
                    <#assign taxAmount = 0>
                    <#assign taxImporte = 0>
                    <#if jsonLinea?has_content>
                        <#assign jsonLineaEval = jsonLinea?eval>
                        <#assign taxAmount = jsonLineaEval.iva.rate>
                        <#assign taxImporte = jsonLineaEval.iva.importe>
                    </#if>
                    <tradeItemTaxAmount>
                        <taxPercentage>${taxAmount}</taxPercentage>
                        <taxAmount>${taxImporte}</taxAmount>
                    </tradeItemTaxAmount>
                    <taxCategory>TRANSFERIDO</taxCategory>
                </tradeItemTaxInformation>
                <totalLineAmount>
                    <grossAmount>
                        <Amount>${item.amount?string["0.00"]}</Amount>
                    </grossAmount>
                    <netAmount>
                        <Amount>${item.grossamt?string["0.00"]}</Amount>
                    </netAmount>
                </totalLineAmount>
            </lineItem>
        </#list>
        <#if jsonTransaccion?has_content>
            <#assign jsonTransaccionEval = transaction.custbody_efx_fe_tax_json?eval>
        </#if>
        <totalAmount>
            <Amount>${jsonTransaccionEval.subtotal}</Amount>
        </totalAmount>
        <TotalAllowanceCharge allowanceOrChargeType="ALLOWANCE">
            <Amount>0</Amount>
        </TotalAllowanceCharge>
        <baseAmount>
            <Amount>${jsonTransaccionEval.subtotal}</Amount>
        </baseAmount>
        <tax type="VAT">
            <#assign porcentajeimpuesto = (jsonTransaccionEval.totalImpuestos?number*100)/jsonTransaccionEval.subtotal?number>
            <taxPercentage>${porcentajeimpuesto}</taxPercentage>
            <taxAmount>${jsonTransaccionEval.totalImpuestos}</taxAmount>
            <taxCategory>TRANSFERIDO</taxCategory>
        </tax>
        <payableAmount>
            <Amount>${jsonTransaccionEval.total}</Amount>
        </payableAmount>
    </requestForPayment>
</cfdi:Addenda>