const fs = require('node:fs');
const moment = require('moment');
const { throws } = require('node:assert');

class NFeDocument {
    constructor(options) {
        this.chNFe = options.chNFe
        this.cStat = options.cStat
        this.tpEmis = options.tpEmis
        this.cUF = options.cUF
        this.digestValue = options.digestValue
        this.nRec = options.nRec
        this.dhRecebto = options.dhRecebto
        this.nProt = options.nProt
        this.verAplic = JSON.parse(fs.readFileSync('./Assets/Responses/verAplic.json', 'utf8')) // Read the application version from a file
        this.xMotivo = JSON.parse(fs.readFileSync('./Assets/Responses/xMotivo.json', 'utf8')) // Read the reason for the status code from a file
    }

    static nfeAutorizacao4(nfeDadosMsg) {
        let cStat = this.getCStat(nfeDadosMsg)
        let cUF = nfeDadosMsg.enviNFe.NFe.infNFe.ide.cUF;
        return new NFeDocument({
            chNFe: nfeDadosMsg.enviNFe.NFe.infNFe.attributes.Id.replace('NFe', ''), // Access key of the NFe
            cStat: cStat, // Default status code for successful authorization
            tpEmis: nfeDadosMsg.enviNFe.NFe.infNFe.ide.tpEmis,
            cUF: cUF,
            digestValue: nfeDadosMsg.enviNFe.NFe.Signature.SignedInfo.Reference.DigestValue,
            nRec: this.generateNewReceiptByUF(cUF),
            dhRecebto: moment().format(), // Date and time in SEFAZ format
            nProt: cStat == "100" ? this.generateNewProtocolByUF(cUF) : ""
        })
    }

    static nfeRetAutorizacao4(nfeDadosMsg) {
        let documentInfo = this.getDocumentInfoByReceiptNumber(nfeDadosMsg.consReciNFe.nRec);
        console.log(documentInfo)

        return new NFeDocument({
            nRec: nfeDadosMsg.consReciNFe.nRec,
            cUF: nfeDadosMsg.consReciNFe.nRec.substring(0, 2),
            chNFe: documentInfo[1],
            dhRecebto: documentInfo[2],
            digestValue: documentInfo[3],
            cStat: documentInfo[4],
            tpEmis: documentInfo[5],
            nProt: documentInfo[6]
        })
    }

    /**
     * 
     * @returns {string} Returns the cStat sent in the commentary field of the NFe (//infAdic/obsCont[0]/xTexto), if not found return 100 as default.
     */
    static getCStat(nfeDadosMsg) {
        let xTexto = ""
        try {
            xTexto = nfeDadosMsg.enviNFe.NFe.infNFe.infAdic.obsCont[0].xTexto
        } catch (e){
            xTexto = nfeDadosMsg.enviNFe.NFe.infNFe.infAdic?.obsCont?.xTexto
        }
        if (xTexto) {
            console.log("Custom cStat in the xTexto field: " + xTexto)
        } else {
            console.log("xTexto field was not used, using 100 as default cStat.")
        }
        return xTexto ?? "100"
    }

    /**
     * 
     * @returns {string} XML string representing the response for sending an NFe (Nota Fiscal Eletrônica).
     */
    getSendingReturnAttachment() {
        this.saveDocument(); // Save the document information to a file

        // Read the response template from a file
        let retEnviNFe = fs.readFileSync('./Assets/Responses/retEnviNFe.xml', 'utf8') // Read the response template from a file

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
     * Generate the XML return of the Check Status
     * @returns {string} XML string representing the response for checkin the status of an NFe (Nota Fiscal Eletrônica).
     */
    getStatusCheckReturnAttachment() {
        let xmlToUse = this.cStat == "100" ? "retConsReciNFe.xml" : "retConsReciNFe_Rejection.xml"
        let retConsReciNFe = fs.readFileSync(`./Assets/Responses/${xmlToUse}`, 'utf-8')  // Read the contents of the file

        retConsReciNFe = retConsReciNFe.replaceAll("[verAplic]", this.verAplic[this.cUF])
        retConsReciNFe = retConsReciNFe.replace("[nRec]", this.nRec)
        retConsReciNFe = retConsReciNFe.replace("[cUF]", this.cUF)
        retConsReciNFe = retConsReciNFe.replace("[dhRecbto]", moment().format())
        retConsReciNFe = retConsReciNFe.replace("[chNFe]", this.chNFe)
        retConsReciNFe = retConsReciNFe.replace("[receivalDate]", this.dhRecebto)
        retConsReciNFe = retConsReciNFe.replace("[digVal]", this.digestValue)
        retConsReciNFe = retConsReciNFe.replace("[cStat]", this.cStat)
        retConsReciNFe = retConsReciNFe.replace("[nProt]", this.nProt)
        retConsReciNFe = retConsReciNFe.replace("[xMotivo]", this.getXMotivo())

        return retConsReciNFe
    }

    /**
     * 
     * @returns {string} Returns the reason for the status code (cStat) from the xMotivo.json file.
     */
    getXMotivo() {
        let xMotivo;
        try {
            xMotivo = this.xMotivo[this.cStat];
        }
        catch {
            xMotivo = this.xMotivo["000"];
            console.log("Mock code provided was not found in the xMotivo.json, so 100 was provided in order to authorize.");
        }
        return xMotivo;
    }

    /**
     * Generates a new receipt number based on the UF (Unidade Federativa).
     * The receipt number consists of:
     * - 2 digits for the UF
     * - 1 digit for the "Tipo Autorizador"
     * - 12 digits for the receipt number
     * 
     * @param {string} cUF - The UF (Unidade Federativa) code, which is a 2-digit string.
     * @returns {string} The generated receipt number.
     */
    static generateNewReceiptByUF(cUF) {
        return cUF +
            "1" +
            (Math.floor(Math.random() * 900000000 + 100000000).toString()).padStart(12, '0');;
    }

    /**
     * Generates a new protocol number after authorization based on the UF (Unidade Federativa).
     * The receipt number consists of:
     * - 1 digit for the "Tipo Autorizador"
     * - 2 digits for the UF
     * - 2 digits for the year (last two digits)
     * - 10 digits for the protocol number
     * 
     * @param {string} cUF - The UF (Unidade Federativa) code, which is a 2-digit string.
     * @returns {string} The generated protocol number.
     */
    static generateNewProtocolByUF(cUF) {
        return "1" +
            cUF +
            new Date().getFullYear().toString().slice(-2) +
            Math.floor(Math.random() * 900000000 + 100000000).toString().padStart(10, '0');;
    }

    /**
     * 
     * @returns {string[]} An array containing the document information retrieved by the receipt number.
     * The array contains the following elements:
     * - nRec: Receipt number
     * - chNFe: Access key of the NFe
     * - dhRecebto: Date and time of receipt
     * - digestValue: Digest value of the NFe
     * - cStat: Status code of the NFe
     * - tpEmis: Type of emission of the NFe
     * - nProt: Protocol number of the NFe
     */
    static getDocumentInfoByReceiptNumber(nRec) {
        const database = fs.readFileSync('./Assets/database.txt', 'utf8');

        const lines = database.split(/\r?\n/);

        // Optional: log all lines for debugging
        // console.log("All lines:", lines);

        const entry = lines.find(line => line.startsWith(nRec.trim()));

        if (!entry) {
            console.log("Receipt not found!");
            return new Array(6).fill('');
        }

        //console.log("Found entry:", entry);
        return entry.split('|');
    }


    /**
     * Saves the NFe document information to a file.
     * The information is saved in a specific format:
     * nRec|chNFe|dhRecebto|digestValue|cStat|tpEmis|nProt
     */
    saveDocument() {
        const line = [
            this.nRec,
            this.chNFe,
            this.dhRecebto,
            this.digestValue,
            this.cStat,
            this.tpEmis,
            this.nProt
        ].join('|') + '\n';

        fs.appendFileSync('./Assets/database.txt', line, 'utf8');
    }
}

module.exports = NFeDocument;