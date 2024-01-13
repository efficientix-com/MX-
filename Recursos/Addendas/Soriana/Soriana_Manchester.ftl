<#setting locale = "es_MX">
<#assign aDateTime = .now>
<#assign aDate = aDateTime?date>
<cfdi:Addenda>
    <DSCargaRemisionProv>
        <#if transaction.custbody_efx_soriana_remision?has_content>
            <#assign idRemision = transaction.custbody_efx_soriana_remision>
        <#else>
            <#assign idRemision = transaction.tranid>
        </#if>
        <Remision Id="${idRemision}" RowOrder="0">
            <Proveedor>${customer.custentity_efx_soriana_idproveedor}</Proveedor>
            <Remision>${idRemision}</Remision>
            <Consecutivo>0</Consecutivo>
            <FechaRemision>${transaction.trandate?string.iso_nz}T${aDate?string("HH:mm:ss")}</FechaRemision>
            <#if shipaddress.custrecord_efx_soriana_determinante?has_content>
                <Tienda>${shipaddress.custrecord_efx_soriana_determinante}</Tienda>
            <#else>
                <Tienda>${billaddress.custrecord_efx_soriana_determinante}</Tienda>
            </#if>
            <TipoMoneda>1</TipoMoneda>
            <TipoBulto>1</TipoBulto>
            <#if shipaddress.custrecord_efx_soriana_entregamercancia?has_content>
                <EntregaMercancia>${shipaddress.custrecord_efx_soriana_entregamercancia}</EntregaMercancia>
            <#else>
                <EntregaMercancia>${billaddress.custrecord_efx_soriana_entregamercancia}</EntregaMercancia>
            </#if>
            <CumpleReqFiscales>true</CumpleReqFiscales>
            <CantidadBultos>${transaction.custbody_efx_soriana_numerocajas?number?string["0.0"]}</CantidadBultos>
            <Subtotal>${transaction.subtotal?string["0.00"]}</Subtotal>
            <Descuentos>${transaction.discounttotal?string["0.00"]}</Descuentos>
            <#assign taxjsoncab = transaction.custbody_efx_fe_tax_json>
            <#if taxjsoncab?has_content>
                <#assign jsonCab = taxjsoncab?eval>
                <#if jsonCab.rates_ieps_data?has_content>
                    <#list jsonCab.rates_ieps_data as rateIEPS, valueIEPS>
<#if valueIEPS?has_content>
                        <IEPS>${valueIEPS?number?string["0.00"]}</IEPS>
<#else>
                    <IEPS>0.00</IEPS>
</#if>
                    </#list>
                <#else>
                    <IEPS>0.00</IEPS>
                </#if>
                <#if jsonCab.rates_iva_data?has_content>
                    <#list jsonCab.rates_iva_data as rateIVA, valueIVA>
                        <IVA>${valueIVA?number?string["0.00"]}</IVA>
                    </#list>
                <#else>
                    <IVA>0.00</IVA>
                </#if>
            <#else>
                <ERROR> NO hay tax JSON en cabecera<ERROR>
            </#if>
            <OtrosImpuestos>0</OtrosImpuestos>
            <Total>${transaction.total?string["0.00"]}</Total>
            <CantidadPedidos>1</CantidadPedidos>
            <FechaEntregaMercancia>${transaction.custbody_efx_soriana_fechacita?string.iso_nz}T${aDate?string("HH:mm:ss")}</FechaEntregaMercancia>
            <#if transaction.custbody_efx_soriana_foliopedido?has_content>
                <FolioNotaEntrada>${transaction.custbody_efx_soriana_foliopedido}</FolioNotaEntrada>
            <#else>
                <Cita>${transaction.custbody_efx_soriana_numerocita}</Cita>
            </#if>
        </Remision>
        <Pedidos Id="${transaction.tranid}" RowOrder="1">
            <Proveedor>${customer.custentity_efx_soriana_idproveedor}</Proveedor>
            <Remision>${idRemision}</Remision>
            <FolioPedido>${transaction.otherrefnum}</FolioPedido>
            <#if shipaddress.custrecord_efx_soriana_determinante?has_content>
                <Tienda>${shipaddress.custrecord_efx_soriana_determinante}</Tienda>
            <#else>
                <Tienda>${billaddress.custrecord_efx_soriana_determinante}</Tienda>
            </#if>
            <#assign items = transaction.item?size>
            <CantidadArticulos>${items}</CantidadArticulos>
            <#if transaction.custbody_efx_soriana_foliopedido?has_content>
                <PedidoEmitidoProveedor>SI</PedidoEmitidoProveedor>
            </#if>
        </Pedidos>
        <#list transaction.item as item>
            <Articulos Id="${idRemision}" RowOrder="${item_index+1}">
                <Proveedor>${customer.custentity_efx_soriana_idproveedor}</Proveedor>
                <Remision>${idRemision}</Remision>
                <FolioPedido>${transaction.otherrefnum}</FolioPedido>
                <#if shipaddress.custrecord_efx_soriana_determinante?has_content>
                    <Tienda>${shipaddress.custrecord_efx_soriana_determinante}</Tienda>
                <#else>
                    <Tienda>${billaddress.custrecord_efx_soriana_determinante}</Tienda>
                </#if>
                <Codigo>${item.custcol_efx_fe_upc_code}</Codigo>
                <CantidadUnidadCompra>${item.quantity?number?string["0.00"]}</CantidadUnidadCompra>
                <CostoNetoUnidadCompra>${item.rate?string["0.00"]}</CostoNetoUnidadCompra>
                <#assign taxJSONline = item.custcol_efx_fe_tax_json>
                <#if taxJSONline?has_content>
                    <#assign lineJSON = taxJSONline?eval>
                    <#if lineJSON.ieps.name?has_content>
                        <#assign rateIEPS = lineJSON.ieps.rate>
                        <PorcentajeIEPS>${rateIEPS?string["0.0000"]}</PorcentajeIEPS>
                    <#else>
                        <PorcentajeIEPS>0.0000</PorcentajeIEPS>
                    </#if>
                    <#if lineJSON.iva.name?has_content>
                        <#assign rateIVA = lineJSON.iva.rate>
                        <PorcentajeIVA>${rateIVA?string["0.0000"]}</PorcentajeIVA>
                    <#else>
                        <PorcentajeIVA></PorcentajeIVA>
                    </#if>
                </#if>
            </Articulos>
        </#list>
    </DSCargaRemisionProv>
</cfdi:Addenda>