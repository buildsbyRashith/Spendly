import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createOrUpdateWallet } from "./walletService";

export const createOrUpdateTransaction = async (
    transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
    try {
        const {id, type, walletId, amount} = transactionData
        if (!amount || amount <=0 || !walletId || !type) {
            return { success: false, msg: "Invalid transaction data" }
        }

        if(id){
            // update existing transaction
            const oldTransactionSnapshot = await getDoc(doc(firestore, "transactions", id))
            const oldTransaction = oldTransactionSnapshot.data() as TransactionType
            const shouldRevertOriginal = 
                    oldTransaction.type !== type || 
                    oldTransaction.amount !== amount ||
                    oldTransaction.walletId !== walletId
            if(shouldRevertOriginal){
                let res = await revertAndUpdateWallets(oldTransaction, Number(amount), type, walletId)
                if(!res.success) return res
            }
        } else {
            // create new transaction
            let res = await updateWalletForNewTransaction(
                walletId!,
                Number(amount!),
                type
            )
            if(!res.success) return res
        }

        const transactionRef = id? doc(firestore, "transactions", id) 
            : doc(collection(firestore, "transactions"))

        // Filter out undefined values
        const cleanedData = Object.entries(transactionData).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as any);

        await setDoc(transactionRef, cleanedData, {merge: true })

        return { success: true, data: { ...transactionData, id: transactionRef.id }}
    } catch (error: any) {
        return { success: false, msg: error.message }
    }
}


const updateWalletForNewTransaction = async (
    walletId: string,
    amount: number,
    type: string,
) => {
    try {
        const walletRef = doc(firestore, "wallets", walletId)
        const walletSnapshot = await getDoc(walletRef)
        if(!walletSnapshot.exists()){
            return { success: false, msg: "Wallet does not exist" }
        }

        const walletData = walletSnapshot.data() as WalletType

        if(type == "expense" && walletData.amount! - amount < 0) {
            return { success: false, msg: "Insufficient funds in wallet" }
        }

        const updatedType = type == "income" ? "totalIncome" : "totalExpenses"
        const updatedWalletAmount = type == "income" 
                    ? Number(walletData.amount) + amount
                    : Number(walletData.amount) - amount

        const updatedTotals = type == "income" 
                    ? Number(walletData.totalIncome) + amount
                    : Number(walletData.totalExpenses) + amount

        await updateDoc(walletRef, {
            amount: updatedWalletAmount,
            [updatedType]: updatedTotals
        })
        return { success: true }
    } catch (error: any) {
        return { success: false, msg: error.message }
    }
}


const revertAndUpdateWallets = async (
    oldTransaction: TransactionType,
    newTransactionAmount: number,
    newTransactionType: string,
    newWalletId: string,
) => {
    try {
        // Check if original wallet exists
        const originalWalletSnapshot = await getDoc(doc(firestore, "wallets", oldTransaction.walletId))
        if(!originalWalletSnapshot.exists()){
            return { success: false, msg: "Original wallet does not exist" }
        }
        const originalWallet = originalWalletSnapshot.data() as WalletType

        // Check if new wallet exists
        let newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId))
        if(!newWalletSnapshot.exists()){
            return { success: false, msg: "New wallet does not exist" }
        }
        let newWallet = newWalletSnapshot.data() as WalletType

        const revertType = oldTransaction.type == "income" ? "totalIncome" : "totalExpenses"

        const revertIncomeExpense: number = 
                oldTransaction.type == "income"
                ? -Number(oldTransaction.amount)
                : Number(oldTransaction.amount)
        
        const revertedWalletAmount = Number(originalWallet.amount) + revertIncomeExpense
        
        const revertedIncomeExpenseAmount = Number(originalWallet[revertType]) - Number(oldTransaction.amount)

        // Check funds for expense transactions
        if(newTransactionType == "expense"){
            if(oldTransaction.walletId == newWalletId){
                // Same wallet: check reverted amount
                if(revertedWalletAmount < newTransactionAmount){
                    return { success: false, msg: "Insufficient funds in wallet" }
                }
            } else {
                // Different wallet: check new wallet amount
                if(newWallet.amount! < newTransactionAmount) {
                    return { success: false, msg: "Insufficient funds in wallet" }
                }
            }
        }

        // Revert the original wallet
        await createOrUpdateWallet({
            id: oldTransaction.walletId,
            amount: revertedWalletAmount,
            [revertType]: revertedIncomeExpenseAmount,
        })

        // Update the new wallet
        if(oldTransaction.walletId !== newWalletId) {
            // Different wallet: refetch and update
            newWalletSnapshot = await getDoc(doc(firestore, "wallets", newWalletId))
            newWallet = newWalletSnapshot.data() as WalletType

            const updateType = newTransactionType == "income" ? "totalIncome" : "totalExpenses"

            const updatedTransactionAmount: number = newTransactionType == "income" 
                ? Number(newTransactionAmount) 
                : -Number(newTransactionAmount)

            const newWalletAmount = Number(newWallet.amount) + updatedTransactionAmount

            const newIncomeExpenseAmount = Number(newWallet[updateType]) + Number(newTransactionAmount)

            await createOrUpdateWallet({
                id: newWalletId,
                amount: newWalletAmount,
                [updateType]: newIncomeExpenseAmount,
            })
        } else {
            // Same wallet: just update the income/expense totals
            const updateType = newTransactionType == "income" ? "totalIncome" : "totalExpenses"
            
            // Calculate the new total based on the reverted amount
            const newIncomeExpenseAmount = revertedIncomeExpenseAmount + Number(newTransactionAmount)
            
            // Calculate the new wallet amount
            const updatedTransactionAmount: number = newTransactionType == "income" 
                ? Number(newTransactionAmount) 
                : -Number(newTransactionAmount)
            
            const newWalletAmount = revertedWalletAmount + updatedTransactionAmount

            await createOrUpdateWallet({
                id: newWalletId,
                amount: newWalletAmount,
                [updateType]: newIncomeExpenseAmount,
            })
        }

        return { success: true }
    } catch (error: any) {
        return { success: false, msg: error.message }
    }
}

// new: deleteTransaction
export const deleteTransaction = async (
    transactionId: string,
    walletId?: string
) => {
    try {
        const transactionRef = doc(firestore, "transactions", transactionId)
        const transactionSnapshot = await getDoc(transactionRef)
            
        if(!transactionSnapshot.exists()){
            return { success: false, msg: "Transaction does not exist" }
        }
        const transactionData = transactionSnapshot.data() as TransactionType

        const transactionType = transactionData?.type
        const transactionAmount = transactionData?.amount

        // fetch wallet to update amount, totalIncome/totalExpenses

        const walletSnapshot = await getDoc(doc(firestore, "wallets", walletId))
        const walletData = walletSnapshot.data() as WalletType

        // check fields to be updated based on transaction type

        const updatedType = transactionType == "income" ? "totalIncome" : "totalExpenses"

        const newWalletAmount = walletData?.amount! - (transactionType == "income" ? transactionAmount : -transactionAmount)

        const newIncomeExpenseAmount = walletData[updatedType]! - transactionAmount

        // if expense and the new amount is less than 0

        if(transactionType == "expense" && newWalletAmount < 0){
            return { success: false, msg: "Cannot delete transaction as it would result in negative wallet balance" }
        }

        await createOrUpdateWallet({
            id: walletId,
            amount: newWalletAmount,
            [updatedType]: newIncomeExpenseAmount,
        })

        await deleteDoc(transactionRef) 


        return { success: true}
    } catch (error: any) {
        return { success: false, msg: error.message }
    }
}