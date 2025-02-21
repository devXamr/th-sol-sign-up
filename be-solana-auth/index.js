import express from 'express'
import cors from 'cors'
import {PublicKey} from '@solana/web3.js'
import nacl from 'tweetnacl'




const app = express()

const port = 3000

const noncesToPublicKey = {}

app.use(cors())
app.use(express.json())

app.post('/sendNonce', (req, res) => {
    const {publicKey} = req.body

    console.log('Received sendNonce req', req.body)

    if(!publicKey){
        return res.status(404).json({msg: 'No public key provided!'})
    }

    const nonce = Math.random().toString(36).substring(2)
    noncesToPublicKey[publicKey] = nonce;

    res.json({nonce})
})



app.post('/verifyNonce', (req, res)=> {
    const {publicKey, signature, nonce} = req.body

    console.log('Received verifyNonce req', req.body)

    if(!publicKey || !signature || !nonce){
        return res.status(404).json({error: 'fields missing'})
    }

    if (!noncesToPublicKey[publicKey]){
        return res.status(404).json({error: 'This user does not exist'})
    }
 try {
     const message = new TextEncoder().encode(nonce)
     const pubKey = new PublicKey(publicKey)
     const sigUint8 = new Uint8Array(signature)

     const valid = nacl.sign.detached.verify(message, sigUint8, pubKey.toBuffer())

     if (valid) {
         delete noncesToPublicKey[publicKey]
         return res.json({success: true})
     } else {
         return res.status(404).json({error: 'invalid', success: false})
     }

 } catch(error){
        return res.status(500).json({error: error.message, success: false})
 }
})




app.listen(port, ()=> {
    console.log(`The server has been started on port ${port}`)
} )