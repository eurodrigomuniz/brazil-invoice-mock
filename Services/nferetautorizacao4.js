const NFeDocument = require('../Models/NFeDocument.js');

module.exports = {
    NFeRetAutorizacao4: {
        NFeRetAutorizacao4Soap12: {
            nfeRetAutorizacaoLote: function (nfeDadosMsg) {
                //Invoice received
                console.log(`Received nfeRetAutorizacaoLote request for a invoice of receipt: ${nfeDadosMsg.consReciNFe.nRec}`)

                let nfeDocument = NFeDocument.nfeRetAutorizacao4(nfeDadosMsg);

                return {
                    $xml: nfeDocument.getStatusCheckReturnAttachment()
                }
            }
        }
    }
}