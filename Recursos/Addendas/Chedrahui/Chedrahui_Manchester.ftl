<#setting locale = "es_MX">
<#assign jsonTransaccion = transaction.custbody_efx_fe_tax_json>
<cfdi:Addenda>
    <requestForPayment
            type="SimpleInvoiceType"
            contentVersion="1.3.1"
            documentStructureVersion="AMC7.1"
            documentStatus="ORIGINAL"
            DeliveryDate="${transaction.trandate?string("yyyy-MM-dd")}">
        <requestForPaymentIdentification>
            <entityType>INVOICE</entityType>
            <uniqueCreatorIdentification>${transaction.tranid}</uniqueCreatorIdentification>
        </requestForPaymentIdentification>
        <specialInstruction code="ZZZ">
            <text>${transaction.custbody_efx_fe_total_text}</text>
        </specialInstruction>
        <orderIdentification>
            <referenceIdentification type="ON">${transaction.otherrefnum}</referenceIdentification>
            <ReferenceDate>${transaction.custbody_efx_fe_reference_date?string("dd/MM/yyyy")}</ReferenceDate>
        </orderIdentification>
        <AdditionalInformation>
            <referenceIdentification type="ATZ"/>
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
            <ReferenceDate>${transaction.trandate?string("dd/MM/yyyy")}</ReferenceDate>
        </DeliveryNote>
        <buyer>
            <gln>${customer.custentity_efx_fe_add_ched_entgln}</gln>
            <contactInformation>
                <personOrDepartmentName>
                    <text>${customer.custentity_efx_fe_add_ched_ndep}</text>
                </personOrDepartmentName>
            </contactInformation>
        </buyer>
        <seller>
                <gln>${customer.custentity_efx_fe_add_ched_exgln}</gln>
            <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">${customer.custentity_efx_fe_add_ched_nprov}
            </alternatePartyIdentification>
        </seller>
        <shipTo>
            <#assign shiptogln = shipaddress.custrecord_tkiio_numero_tienda>
            <#assign shiptoglnlength = 13 - shiptogln?length>
            <#if shiptogln?has_content>
                <#list 1..shiptoglnlength as x>
                    <#assign shiptogln = "0"+shiptogln>
                </#list>
            </#if>
                <gln>${shiptogln}</gln>
            <nameAndAddress>
                <name>${shipaddress.addressee}</name>
                <streetAddressOne>${shipaddress.custrecord_streetname}</streetAddressOne>
                <city>${shipaddress.city}</city>
                <postalCode>${shipaddress.zip}</postalCode>
            </nameAndAddress>
        </shipTo>
        <currency currencyISOCode="${transaction.currencysymbol}">
            <currencyFunction>BILLING_CURRENCY</currencyFunction>
            <rateOfChange>${transaction.exchangerate?string["0"]}</rateOfChange>
        </currency>
        <paymentTerms
                paymentTermsEvent="DATE_OF_INVOICE"
                PaymentTermsRelationTime="REFERENCE_AFTER">
            <netPayment netPaymentTermsType="BASIC_NET">
                <paymentTimePeriod>
                    <timePeriodDue timePeriod="DAYS">
                        <value>${transaction.terms}</value>
                    </timePeriodDue>
                </paymentTimePeriod>
            </netPayment>
        </paymentTerms>
        <shipmentDetail/>
        <AllowanceCharge settlementType="BILL_BACK" allowanceChargeType="ALOWANCE_GLOBAL" sequeenceNumber="">
            <specialServicesType>EAB</specialServicesType>
            <monetaryAmountOrPercentage>
                <rate base="INVOICE_VALUE">
                    <percentage>0.00</percentage>
                </rate>
                </monetaryAmountOrPercentage>
        </AllowanceCharge>
        <#assign lineas = 0>
        <#list transaction.item as item>
            <#assign lineas = lineas+1>
            <lineItem type="SimpleInvoiceLineItemType" number="${lineas}">
                <tradeItemIdentification>
                    <gtin>${item.custcol_efx_fe_upc_code}</gtin>
                </tradeItemIdentification>
                <alternateTradeItemIdentification type="BUYER_ASSIGNED">${item.custcol_tkiio_articulo_chedraui}
                </alternateTradeItemIdentification>
                <tradeItemDescriptionInformation>
                    <longText>${item.description} ${item.custcol_efx_fe_upc_code}</longText>
                </tradeItemDescriptionInformation>
                <invoicedQuantity unitOfMeasure="EA">${item.quantity}
                </invoicedQuantity>
                <aditionalQuantity QuantityType="NUM_CONSUMER_UNITS">1</aditionalQuantity>
                <grossPrice>
                    <Amount>${item.rate?string["0.00"]}</Amount>
                </grossPrice>
                <netPrice>
                    <Amount>${item.rate?string["0.00"]}</Amount>
                </netPrice>
                <AdditionalInformation>
                    <referenceIdentification type="ON">${transaction.otherrefnum}</referenceIdentification>
                </AdditionalInformation>
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
                </tradeItemTaxInformation>
                <tradeItemTaxInformation>
                    <taxTypeDescription>GST</taxTypeDescription>
                    <tradeItemTaxAmount>
                        <taxPercentage>0</taxPercentage>
                        <taxAmount>0</taxAmount>
                    </tradeItemTaxAmount>
                </tradeItemTaxInformation>
                <totalLineAmount>
                    <grossAmount>
                        <Amount>${item.amount?string["0.00"]}</Amount>
                    </grossAmount>
                    <netAmount>
                        <Amount>${item.amount?string["0.00"]}</Amount>
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
            <taxCategory>TRANSFERIDOS</taxCategory>
        </tax>
        <payableAmount>
            <Amount>${jsonTransaccionEval.total}</Amount>
        </payableAmount>
    </requestForPayment>
</cfdi:Addenda>