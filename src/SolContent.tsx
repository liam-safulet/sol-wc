'use client'
import {useAppKitAccount, useAppKitProvider} from '@reown/appkit/react'
import {type Provider, useAppKitConnection} from '@reown/appkit-adapter-solana/react'
import {useState} from 'react'
import {PublicKey, Transaction, SystemProgram} from '@solana/web3.js'

export const SolContent = () => {
    const {walletProvider} = useAppKitProvider<Provider>('solana')
    const {address} = useAppKitAccount()
    const {connection} = useAppKitConnection()
    console.log('wallet:', walletProvider);

    // 状态管理
    const [targetAddress, setTargetAddress] = useState('')
    const [amount, setAmount] = useState('')
    const [txCount, setTxCount] = useState('1')

    // 签名并验证消息
    const handleSignMessage = async () => {
        try {
            const message = 'hello world'
            const signedMessage = await walletProvider.signMessage(new TextEncoder().encode(message))
            console.log('签名消息:', signedMessage)
            alert('消息签名成功！')
        } catch (error) {
            console.log(error);
        }
    }

    // 签名单个交易
    const handleSignTransaction = async () => {
        if(!connection || !address){
            alert('Please connect wallet first!')
            return
        }
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(address),
                    toPubkey: new PublicKey(targetAddress),
                    lamports: parseFloat(amount) * 1e9 // 转换为 lamports
                })
            )
            const {blockhash} = await connection.getLatestBlockhash()
            console.log('blockhash:', blockhash);
            transaction.recentBlockhash = blockhash

            // 设置付款人
            transaction.feePayer = new PublicKey(address)
            const signedTx = await walletProvider.signTransaction(transaction)
            const signature = await connection.sendRawTransaction(signedTx.serialize())
            await connection.confirmTransaction(signature)
            alert(`交易成功！交易签名: ${signature}`)
        } catch (error) {

        }
    }

    // 签名并直接发送交易
    const handleSignAndSendTransaction = async () => {
        if(!connection || !address){
            alert('Please connect wallet first!')
            return
        }
        try {
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(address),
                    toPubkey: new PublicKey(targetAddress),
                    lamports: parseFloat(amount) * 1e9
                })
            )
            const {blockhash} = await connection.getLatestBlockhash()
            console.log('blockhash:', blockhash);
            transaction.recentBlockhash = blockhash
            transaction.feePayer = new PublicKey(address)
            const buffer = Buffer.from(
                transaction.serialize({
                    requireAllSignatures: false,
                }),
            )
            const base64Encoded = buffer.toString('base64')
            console.log('base64Encoded:',base64Encoded);

            const signature = await walletProvider.signAndSendTransaction(transaction)
            await connection.confirmTransaction(signature)
            alert(`交易成功！交易签名: ${signature}`)
        } catch (error) {
            console.log(error);
        }
    }

    // 签名多个交易
    const handleSignAllTransactions = async () => {
        if(!connection || !address){
            alert('Please connect wallet first!')
            return
        }
        try {
            const count = parseInt(txCount)
            const transactions = await Promise.all(Array(count).fill(null).map(async () => {
                    const transaction = new Transaction().add(
                        SystemProgram.transfer({
                            fromPubkey: new PublicKey(address),
                            toPubkey: new PublicKey(targetAddress),
                            lamports: parseFloat(amount) * 1e9
                        })
                    )
                    const {blockhash} = await connection.getLatestBlockhash()
                    console.log('blockhash:', blockhash);
                    transaction.recentBlockhash = blockhash
                    transaction.feePayer = new PublicKey(address)
                    return transaction
                }
            ))

            const signedTxs = await walletProvider.signAllTransactions(transactions)
            console.log('signedTxs:',signedTxs);

            // 依次发送所有已签名的交易
            const signatures = await Promise.all(
                signedTxs.map(tx => connection.sendRawTransaction(tx.serialize()))
            )

            await Promise.all(
                signatures.map(signature => connection.confirmTransaction(signature))
            )

            alert(`所有交易发送成功！`)
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <div className="p-4">
             {/*@ts-expect-error expected*/}
            <appkit-button/>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="目标地址"
                    value={targetAddress}
                    onChange={(e) => setTargetAddress(e.target.value)}
                    className="border p-2 mr-2"
                />
                <input
                    type="number"
                    placeholder="转账金额 (SOL)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="border p-2 mr-2"
                />
                <input
                    type="number"
                    placeholder="交易数量"
                    value={txCount}
                    onChange={(e) => setTxCount(e.target.value)}
                    className="border p-2"
                />
            </div>

            <div className="space-x-2">
                <button onClick={handleSignMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
                    signMessage
                </button>
                <button onClick={handleSignTransaction} className="bg-blue-500 text-white px-4 py-2 rounded">
                    signTransaction
                </button>
                <button onClick={handleSignAndSendTransaction} className="bg-blue-500 text-white px-4 py-2 rounded">
                    signAndSendTransaction
                </button>
                <button onClick={handleSignAllTransactions} className="bg-blue-500 text-white px-4 py-2 rounded">
                    SignAllTransactions
                </button>
            </div>
        </div>
    )
}