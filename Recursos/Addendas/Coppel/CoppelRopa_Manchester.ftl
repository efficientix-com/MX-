<#setting locale = "es_MX">
<#assign jsonTransaccion = transaction.custbody_efx_fe_tax_json>
<cfdi:Addenda>
    <requestForPayment DeliveryDate="${transaction.trandate?string("yyyy-MM-dd")}" documentStatus="ORIGINAL" documentStructureVersion="CPLR1.0" contentVersion="1.0" type="SimpleInvoiceType">
        <requestForPaymentIdentification>
            <entityType>INVOICE</entityType>
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
            <uniqueCreatorIdentification>${transaction.tranid}</uniqueCreatorIdentification>
        </requestForPaymentIdentification>
        <orderIdentification>
            <referenceIdentification type="ON">${transaction.otherrefnum}</referenceIdentification>
            <ReferenceDate>${transaction.custbody_efx_fe_aff_cop_ftrans?string("yyyy-MM-dd")}</ReferenceDate>
        </orderIdentification>
        <seller>
            </gln>
            <alternatePartyIdentification type="SELLER_ASSIGNED_IDENTIFIER_FOR_A_PARTY">${customer.custentity_efx_add_numprov_cop}</alternatePartyIdentification>
            <IndentificaTipoProv>2</IndentificaTipoProv>
        </seller>
        <shipTo>
            <#if shipaddress.custrecord_tkiio_numero_tienda?has_content>
                    <gln>${shipaddress.custrecord_tkiio_numero_tienda}</gln>
                <#else>
                    <gln>${shipaddress.custrecord_efx_fe_add_shipgln_cop}</gln>
            </#if>
            <nameAndAddress>
                <name>${shipaddress.addressee}</name>
                <streetAddressOne>${shipaddress.custrecord_streetname}</streetAddressOne>
                <city>${shipaddress.city}</city>
                <postalCode>${shipaddress.zip}</postalCode>
                <bodegaEnt>${shipaddress.custrecord_efx_fe_add_cop_bdestino}</bodegaEnt>
            </nameAndAddress>
        </shipTo>
        <currency currencyISOCode="${transaction.currencysymbol}">
            <currencyFunction>BILLING_CURRENCY</currencyFunction>
        </currency>
        <TotalLotes>
            <#assign totalquantity = 0>
            <#list transaction.item as item>
                <#assign totalquantity = totalquantity+item.custcol_efx_fe_add_cop_cant_cajas>
            </#list>
            <cantidad>${totalquantity}</cantidad>
        </TotalLotes>
        <#assign linea = 0>
        <#list transaction.item as item>
            <#assign linea = linea+1>
            <lineItem type="SimpleInvoiceLineItemType" number="${linea}">
                <tradeItemIdentification>
                    <gtin>0000000000000</gtin>
                </tradeItemIdentification>
                <alternateTradeItemIdentification type="BUYER_ASSIGNED"/>
                <codigoTallaInternoCop>
                    <codigo>${item.custcol_tkiio_articulo_coppel}</codigo>
                    <talla>${item.custcol_efx_fe_add_talla_coppel}</talla>
                </codigoTallaInternoCop>
                <tradeItemDescriptionInformation language="ES">
                    <longText>${item.description}</longText>
                </tradeItemDescriptionInformation>
                <invoicedQuantity unitOfMeasure="PZA">${item.quantity}</invoicedQuantity>
                <#assign precioRopa = item.amount/item.custcol_efx_fe_add_cantidadp_coppel?number>
                <grossPrice>
                    <Amount>${item.rate?string["0.00"]}</Amount>
                </grossPrice>
                <netPrice>
                    <Amount>${item.rate?string["0.00"]}</Amount>
                </netPrice>
                <palletInformation>
                    <description type="BOX"/>
                    <transport>
                        <methodOfPayment>PREPAID_BY_SELLER</methodOfPayment>
                        <prepactCant>40</prepactCant>
                    </transport>
                </palletInformation>
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
                        <Amount>${item.grossamt?string["0.00"]}</Amount>
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
            <specialServicesType>TD</specialServicesType>
            <Amount>0</Amount>
        </TotalAllowanceCharge>
        <baseAmount>
            <Amount>${jsonTransaccionEval.subtotal}</Amount>
        </baseAmount>
        <tax type="VAT">
            <#assign porcentajeimpuesto = (jsonTransaccionEval.totalImpuestos?number*100)/jsonTransaccionEval.subtotal?number>
            <taxPercentage>${porcentajeimpuesto}</taxPercentage>
            <taxAmount>${jsonTransaccionEval.totalImpuestos}</taxAmount>
        </tax>
        <payableAmount>
            <Amount>${transaction.total?string["0.00"]}</Amount>
        </payableAmount>
    </requestForPayment>
</cfdi:Addenda>