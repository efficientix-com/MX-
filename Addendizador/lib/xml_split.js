/**
 * @NModuleScope TargetAccount
 */
define(["N/xml"], function(xml) {
    /**
     * split
     */
    function xmlsplit(xml_data) {

        var regex = /<efx:sublist id="item">(.*?)<\/efx:sublist>/g;
        var match ='';
        var resultado = [];
        var texto = xml_data;

        while ((match = regex.exec(texto)) !== null) {
            resultado.push(match[1]);
            //objcampos[match[1]]="";
            // String s = "000456";
            // s.replaceFirst("^0+(?!$)", "")
        }

        log.audit({title:'resultado-split',details:resultado});

        return '';
    }



    return {
        xmlsplit: xmlsplit,
    };

});