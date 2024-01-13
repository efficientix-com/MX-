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
            <ReferenceDate>${transaction.custbody_efx_fe_reference_date?string("dd/MM/yyyy")}</ReferenceDate>
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
                <gln>${shipaddress.custrecord_tkiio_numero_tienda}</gln>
            <nameAndAddress>
                <name>${shipaddress.addressee}</name>
                <streetAddressOne>${shipaddress.custrecord_streetname}</streetAddressOne>
                <city>${shipaddress.city}</city>
                <postalCode>${shipaddress.zip}</postalCode>
            </nameAndAddress>
        </shipTo>
        <InvoiceCreator>
            <#if shipaddress.custrecord_efx_fe_buyer_gln?has_content>
                <gln>${shipaddress.custrecord_efx_fe_buyer_gln}</gln>
            <#else>
                <gln>${customer.custentity_efx_fe_add_ched_exgln}</gln>
            </#if>
            <alternatePartyIdentification type="VA"><#if subsidiary.federalidnumber?has_content>${subsidiary.federalidnumber}<#else>${subsidiary.employerid}</#if>
            </alternatePartyIdentification>
            <nameAndAddress>
                <name>${billaddress.addressee}</name>
                <streetAddressOne>${billaddress.custrecord_streetname}</streetAddressOne>
                <city>${billaddress.city}</city>
                <postalCode>${billaddress.zip}</postalCode>
            </nameAndAddress>
        </InvoiceCreator>
        <currency currencyISOCode="${transaction.currencysymbol}">
            <currencyFunction>BILLING_CURRENCY</currencyFunction>
            <rateOfChange>${transaction.exchangerate?string["0.00"]}</rateOfChange>
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
        <#assign lineas = 0>
        <#list transaction.item as item>
            <#assign lineas = lineas+1>
            <lineItem type="SimpleInvoiceLineItemType" number="${lineas}">
                <tradeItemIdentification>
                    <gtin>${item.custcol_efx_fe_upc_code}</gtin>
                </tradeItemIdentification>
                <alternateTradeItemIdentification type="BUYER_ASSIGNED">${item.custcol_efx_fe_upc_code}
                </alternateTradeItemIdentification>
                <tradeItemDescriptionInformation language="ES">
                    <longText>${item.description}</longText>
                </tradeItemDescriptionInformation>
                <invoicedQuantity unitOfMeasure="CA">${item.quantity?string["0.00"]}
                </invoicedQuantity>
                <aditionalQuantity QuantityType="NUM_CONSUMER_UNITS">${item.quantity?string["0.00"]}
                </aditionalQuantity>
                <grossPrice>
                    <Amount>${item.rate?string["0.00"]}</Amount>
                </grossPrice>
                <netPrice>
                    <Amount>${item.amount?string["0.00"]}</Amount>
                </netPrice>
                <AdditionalInformation>
                    <referenceIdentification type="ON"></referenceIdentification>
                </AdditionalInformation>
                <tradeItemTaxInformation>
                    <taxTypeDescription>VAT</taxTypeDescription>
                    <#assign jsonLinea = item.custcol_efx_fe_tax_json>
                    <#assign taxAmount = 0>
                    <#if jsonLinea?has_content>
                        <#assign jsonLineaEval = jsonLinea?eval>
                        <#assign taxAmount = jsonLineaEval.iva.rate>
                    </#if>
                    <tradeItemTaxAmount>
                        <taxPercentage>${taxAmount}</taxPercentage>
                        <taxAmount>${item.tax1amt?string["0.00"]}</taxAmount>
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