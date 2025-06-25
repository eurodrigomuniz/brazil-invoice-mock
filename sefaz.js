const express = require('express')
const https = require('node:https')
const soap = require('soap')
const fs = require('node:fs')

const nfeAutorizacao4 = require('./Services/nfeautorizacao4')
const nfeRetAutorizacao4 = require('./Services/nferetautorizacao4')

let app = express();

let server = https.createServer({
    key: fs.readFileSync('./Assets/Certificates/privateKey.key'),
    cert: fs.readFileSync('./Assets/Certificates/certificate.crt')
}, app).listen(443, function () {
    let nfeAutorizacao4Listener = soap.listen(app, '/NFeAutorizacao4.asmx', nfeAutorizacao4, fs.readFileSync('./Assets/WSDL/NFeAutorizacao4.wsdl', 'utf-8'))
    let nfeRetAutorizacao4Listener = soap.listen(app, '/NFeRetAutorizacao4.asmx', nfeRetAutorizacao4, fs.readFileSync('./Assets/WSDL/NFeRetAutorizacao4.wsdl', 'utf-8'))

    nfeAutorizacao4Listener.wsdl.options.forceSoap12Headers = true
    nfeRetAutorizacao4Listener.wsdl.options.forceSoap12Headers = true
    console.log(`SEFAZ service listening at https://${server.address().address}:${server.address().port}`)
})

