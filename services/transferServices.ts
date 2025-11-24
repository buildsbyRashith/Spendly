import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createOrUpdateWallet } from "./walletService";








export const createTransfer = async (
    fromWalletId: string,
    toWalletId: string,
    amount: number,
    description?: string,
    date?: Date
): Promise<ResponseType> => {
    try {
        if (!amount || amount <= 0) {
            return { success: false, msg: "Invalid transfer amount" }
        }

        if (fromWalletId === toWalletId) {
            return { success: false, msg: "Cannot transfer to the same wallet" }
        }

        // Check source wallet has sufficient funds
        const fromWalletSnapshot = await getDoc(doc(firestore, "wallets", fromWalletId))
        if (!fromWalletSnapshot.exists()) {
            return { success: false, msg: "Source wallet does not exist" }
        }
        const fromWallet = fromWalletSnapshot.data() as WalletType

        if (fromWallet.amount! < amount) {
            return { success: false, msg: "Insufficient funds in source wallet" }
        }

        // Check destination wallet exists
        const toWalletSnapshot = await getDoc(doc(firestore, "wallets", toWalletId))
        if (!toWalletSnapshot.exists()) {
            return { success: false, msg: "Destination wallet does not exist" }
        }
        const toWallet = toWalletSnapshot.data() as WalletType

        // Update source wallet (deduct)
        await createOrUpdateWallet({
            id: fromWalletId,
            amount: Number(fromWallet.amount) - amount,
        })

        // Update destination wallet (add)
        await createOrUpdateWallet({
            id: toWalletId,
            amount: Number(toWallet.amount) + amount,
        })

        // Create transfer transaction record
        const transactionRef = doc(collection(firestore, "transactions"))
        const transactionData: TransactionType = {
            type: "transfer",
            amount,
            category: "transfer",
            date: date || new Date(),
            description: description || `Transfer from ${fromWallet.name} to ${toWallet.name}`,
            walletId: fromWalletId,
            toWalletId: toWalletId,
        }

        await setDoc(transactionRef, transactionData)

        return { success: true, data: { ...transactionData, id: transactionRef.id }}
    } catch (error: any) {
        return { success: false, msg: error.message }
    }
}