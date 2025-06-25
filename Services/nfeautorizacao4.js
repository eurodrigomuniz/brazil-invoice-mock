const NFeDocument = require('../Models/NFeDocument.js');

module.exports = {
	NFeAutorizacao4: {
		NFeAutorizacao4Soap12: {
			nfeAutorizacaoLote: function (nfeDadosMsg) {
				console.log(`Received nfeAutorizacaoLote request for a invoice of number: ${nfeDadosMsg.enviNFe.NFe.infNFe.ide.nNF}`)

				let nfeDocument = NFeDocument.nfeAutorizacao4(nfeDadosMsg);

				return {
					$xml: nfeDocument.getSendingReturnAttachment()
				} 
			}
		}
	}
};