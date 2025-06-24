const NFeDocument = require('../Models/NFeDocument.js');

module.exports = {
	NFeAutorizacao4: {
		NFeAutorizacao4Soap12: {
			nfeAutorizacaoLote: function (nfeDadosMsg) {
				console.log(`Received nfeAutorizacaoLote request for a invoice of number: ${nfeDadosMsg.enviNFe.NFe.infNFe.ide.nNF}`)

				return {
					$xml: new NFeDocument(nfeDadosMsg).getSendingReturnAttachment()
				} 
			}
		}
	}
};