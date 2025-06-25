# brazil-invoice-mock

This project aims to mock some of Brazil's invoice systems

# Governements Currently Covered
## Brazil

- SEFAZ (Authorization and Rejection)
    - NfeReception (Outbound Sending)
    - NfeReceptionStatus (Outbound Status Retrieval using Receipt)

# Invoice Authorization Behavior

By default all invoices sent will be authorized, if you intend to reject an invoice, use the following field to send the cStat desired and add the cStat code in the xMotivo.json fiel along with the Rejection description inside ./Assets/Response

- NF-e: `/NFe/infNFe/infAdic/obsCont/xTexto`

```json
{
    "123": "Description for 123 rejection"
}
```

# Pre-requirements
## Clone repository
Open command prompt in the folder desired to store the project and run the following command (make sure you have [Git](https://git-scm.com/) installed first):
```
git clone https://github.com/eurodrigomuniz/brazil-invoice-mock.git
```
---
## Install Node
Install lastest Node.js LTS version: https://nodejs.org/en/

---
## Install the following Node.js libraries
Go to the project's folder and install the following libraries
### Express.js
Express is used to enable Web app creation.

[Documentation](https://expressjs.com/pt-br/)

Installation
```
npm install express
```
#### soap
soap library is used to create a SOAP server in Node.js.

[Documentation](https://www.npmjs.com/package/soap)

Installation
```
npm install soap
```
#### Moment.js
Moment is used to deal with different DateTime notations in Node.js.

[Documentation](https://momentjs.com/docs/)

Installation
```
npm install moment
```