const fs = require('node:fs');
const moment = require('moment');

class NFeDocument {
    constructor(nfeDadosMsg) {
        this.chNFe = nfeDadosMsg.enviNFe.NFe.infNFe.attributes.Id.replace('NFe', ''); // Access key of the NFe
        this.cStat = '100'; // Default status code for successful authorization
        this.tpEmis = nfeDadosMsg.enviNFe.NFe.infNFe.ide.tpEmis
        this.cUF = nfeDadosMsg.enviNFe.NFe.infNFe.ide.cUF
        this.digestValue = nfeDadosMsg.enviNFe.NFe.Signature.SignedInfo.Reference.DigestValue;
        this.nRec = this.generateNewReceiptByUF();
        this.dhRecebto = moment().format(); // Date and time in SEFAZ format
        this.nProt = this.cStatStat == "100" ? this.generateNewProtocolByUF() : "";
        this.verAplic = JSON.parse(fs.readFileSync('./Assets/Responses/verAplic.json', 'utf8')) // Read the application version from a file
        this.xMotivo = JSON.parse(fs.readFileSync('./Assets/Responses/xMotivo.json', 'utf8')) // Read the reason for the status code from a file
    }

    getSendingReturnAttachment() {
        let retEnviNFe = fs.readFileSync('./Assets/Responses/retEnviNFe.xml', 'utf8'); // Read the response template from a file

        const receivalCStat = "103";

        retEnviNFe = retEnviNFe.replace("[verAplic]", this.verAplic[this.cUF])
        retEnviNFe = retEnviNFe.replace("[cStat]", receivalCStat)
        retEnviNFe = retEnviNFe.replace("[xMotivo]", this.xMotivo[receivalCStat])
        retEnviNFe = retEnviNFe.replace("[cUF]", this.cUF)
        retEnviNFe = retEnviNFe.replace("[dhRecbto]", this.dhRecebto)
        retEnviNFe = retEnviNFe.replace("[nRec]", this.nRec)

        return retEnviNFe;
    }

    /**
     * Generates a new receipt number based on the UF (Unidade Federativa).
     * The receipt number consists of:
     * - 2 digits for the UF
     * - 1 digit for the "Tipo Autorizador"
     * - 9 digits for the receipt number
     * 
     * @returns {string} The generated receipt number.
     */
    generateNewReceiptByUF() {
        return this.cUF +
            "1" +
            Math.floor(Math.random() * 900000000 + 100000000).toString();
    }

    /**
     * Generates a new protocol number after authorization based on the UF (Unidade Federativa).
     * The receipt number consists of:
     * - 1 digit for the "Tipo Autorizador"
     * - 2 digits for the UF
     * - 2 digits for the year (last two digits)
     * - 9 digits for the protocol number
     * 
     * @returns {string} The generated protocol number.
     */
    generateNewProtocolByUF() {
        return "1" +
            this.cUF +
            new Date().getFullYear().toString().slice(-2) +
            Math.floor(Math.random() * 900000000 + 100000000).toString();
    }
}

module.exports = NFeDocument;