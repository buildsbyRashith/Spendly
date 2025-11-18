import { firestore } from "@/config/firebase";
import { ResponseType, TransactionType, WalletType } from "@/types";
import { collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export const createOrUpdateTransaction = async (
    transactionData: Partial<TransactionType>
): Promise<ResponseType> => {
    try {
        const {id, type, walletId, amount, image} = transactionData
        if (!amount || amount <=0 || !walletId || !type) {
            return { success: false, msg: "Invalid transaction data" }
        }

        if(id){
            // to do : update existing transaction
        } else {
            // update new transaction
            let res =  await updateWalletForNewTransaction(
                walletId!,
                Number(amount!),
                type
            )
            if(!res.success) return res
        }

        const transactionRef = id? doc(firestore, "transactions", id) 
            : doc(collection(firestore, "transactions"))

        await setDoc(transactionRef, transactionData, {merge: true })



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