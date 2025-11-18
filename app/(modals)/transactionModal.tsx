import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import ModalWrapper from '@/components/ModalWrapper'
import { colors, radius, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import { TransactionType, WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import ImageUpload from '@/components/ImageUpload'
import { createOrUpdateWallet } from '@/services/walletService'
import { Dropdown } from 'react-native-element-dropdown';
import { expenseCategories, transactionTypes } from '@/constants/data'
import useFetchData from '@/hooks/useFetchData'
import { orderBy, where } from 'firebase/firestore'
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createOrUpdateTransaction } from '@/services/transactionService'


const TransactionModal = () => {

const router = useRouter()

const { user } = useAuth()
const scrollViewRef = useRef<ScrollView>(null)
const amountInputRef = useRef<View>(null)
const descriptionInputRef = useRef<View>(null)


const [transaction, setTransaction] = useState<TransactionType>({
  type: 'expense',
  amount: 0,
  description: "",
  category: "",
  date: new Date(),
  walletId: "",
  image: null
})

const [loading, setLoading] = useState(false)
const [showDatePicker, setShowDatePicker] = useState(false)

const {data: wallets, error: walletError, loading: walletLoading} = useFetchData<WalletType>("wallets", [
  where("uid" , "==", user?.uid ),
  orderBy("created", "desc"),
])

const oldTransaction: { name: string; image: string; id: string  } = 
  useLocalSearchParams()
  //console.log('old Wallet: ', oldWallet)

  const onDateChange = (
    event: any, selectedDate: any) => {
        const currentDate =  selectedDate || transaction.date
        setTransaction({...transaction, date: currentDate})
       // setShowDatePicker(false)
  }

//    useEffect(() => {
//  if(oldTransaction?.id){
//    setTransaction({
//      name: oldTransaction?.name
//      image: oldTransaction?.image,
//    })
//  }
//}, [])

const onSubmit = async () => {
  const {type, amount, description, category, date, walletId, image} = transaction

  if(!walletId || !date || !amount || (type == 'expense' && !category)) {
    Alert.alert("Transaction" , "Please fill all required fields")
    return
  }

 // console.log("Good to go")
  let transactionData: TransactionType = {
    type,
    amount,
    description,
    category,
    date,
    walletId,
    image,
    uid: user?.uid,
  }

    console.log("Transaction Data: ", transactionData)

    // to do : include transaction id for updating
    setLoading(true)
    const res = await createOrUpdateTransaction(transactionData)

    setLoading(false)
    if(res.success){
      router.back()
    } else {
      Alert.alert("Transaction", res.msg )
    }
}

const scrollToInput = (inputRef: any) => {
  setTimeout(() => {
    inputRef.current?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      scrollViewRef.current?.scrollTo({ y: pageY - 100, animated: true })
    })
  }, 300)
}

  return (
    <ModalWrapper>
      <View style={styles.container}>
          <Header 
            title={oldTransaction?.id ? 'Edit Transaction' : 'New Transaction'} 
            leftIcon={<BackButton onPress={() => router.back()} />}
            style={{ marginBottom: spacingY._10 }}
           />

           <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}>

          {/* form */}

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.form} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          
          <View style={styles.inputContainer}>
              <Typo color={colors.neutral200} size={16}>Transaction Type</Typo>
             {/*  drop down list   */}
             <Dropdown
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
        //  placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelectedText}
          iconStyle={styles.dropdownIcon}
          data={transactionTypes}
          maxHeight={300}
          labelField="label"
          valueField="value"
          itemTextStyle={styles.dropdownItemText}
          itemContainerStyle={styles.dropdownItemContainer}
          containerStyle={styles.dropdownListContainer}
        //  placeholder={!isFocus ? 'Select item' : '...'}
          value={transaction.type}
          onChange={item => {
            setTransaction({ ...transaction, type: item.value })
          }}
        />
          </View>

          <View style={styles.inputContainer}>
              <Typo color={colors.neutral200} size={16}>Wallets</Typo>
             {/*  drop down list   */}
             <Dropdown
                style={styles.dropdownContainer}
                activeColor={colors.neutral700}
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelectedText}
          iconStyle={styles.dropdownIcon}
          data={wallets.map(wallet=> ({
            label: `${wallet?.name} (QAR ${wallet.amount})`,
            value: wallet?.id,
          }))}
          maxHeight={300}
          labelField="label"
          valueField="value"
          itemTextStyle={styles.dropdownItemText}
          itemContainerStyle={styles.dropdownItemContainer}
          containerStyle={styles.dropdownListContainer}
          placeholder={'Select Wallet'}
          value={transaction.walletId}
          onChange={item => {
            setTransaction({ ...transaction, walletId: item.value || "" })
          }}
        />
          </View>
        {/** Expense Categories */}

          {
            transaction.type == "expense" && (
                <View style={styles.inputContainer}>
                        <Typo color={colors.neutral200} size={16}>Expense Categories</Typo>
                        <Dropdown
                            style={styles.dropdownContainer}
                            activeColor={colors.neutral700}
                            placeholderStyle={styles.dropdownPlaceholder}
                            selectedTextStyle={styles.dropdownSelectedText}
                            iconStyle={styles.dropdownIcon}
                            data={Object.values(expenseCategories)}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            itemTextStyle={styles.dropdownItemText}
                            itemContainerStyle={styles.dropdownItemContainer}
                            containerStyle={styles.dropdownListContainer}
                            placeholder={'Select Category'}
                            value={transaction.category}
                            onChange={item => {
                            setTransaction({ ...transaction, category: item.value || "" })
                        }}
                        />
                </View>
            )
          }

          {/* Date & Time  */}

          <View style={styles.inputContainer}>
              <Typo color={colors.neutral200} size={16}>Date</Typo>
              {
                !showDatePicker && (
                    <Pressable 
                        style={styles.dateInput}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Typo size={14}>
                            {(transaction.date as Date).toLocaleDateString()}
                        </Typo>
                    </Pressable>
                )}

                {
                    showDatePicker && (
                        <View style={ Platform.OS == "ios" && styles.iosDatePicker}>
                            <DateTimePicker 
                                themeVariant="dark"
                                value={transaction.date as Date}
                                textColor={colors.white}
                                mode='date'
                                display="spinner"
                                onChange={onDateChange}
                            />

                            {
                                Platform.OS == "ios" && (
                                    <TouchableOpacity
                                        style={styles.datePickerButton}
                                        onPress={() => setShowDatePicker(false)}
                                    >
                                        <Typo size={15} fontWeight={"500"}>
                                            Ok
                                        </Typo>

                                    </TouchableOpacity>
                                )
                            }

                        </View>
                    )
                }  
          </View>

                  { /* amount */}

                <View style={styles.inputContainer} ref={amountInputRef}>
                  <Typo color={colors.neutral200} size={16}>Amount</Typo>
                  <Input 
                    // placeholder='Salary'
                    keyboardType="numeric"  
                    value={transaction.amount?.toString()}
                    onChangeText={(value) => setTransaction({...transaction, amount: Number(value.replace(/[^0-9]/g, ""))})}
                    onFocus={() => scrollToInput(amountInputRef)}
                  />
                </View>

                <View style={styles.inputContainer} ref={descriptionInputRef}>
                  <View style={styles.flexRow}>
                  <Typo color={colors.neutral200} size={16}>Description</Typo>
                  <Typo color={colors.neutral500} size={14}>(optional)</Typo>
                  </View>
                  <Input 
                    placeholder='ex: Wifi bill for August'
                    value={transaction.description}
                    multiline
                    containerStyle={{
                      flexDirection: 'row',
                      height: verticalScale(100),
                      alignItems: 'flex-start',
                      paddingVertical: 15,
                    }}
                    onChangeText={(value) => setTransaction({...transaction, description: value,})}
                    onFocus={() => scrollToInput(descriptionInputRef)}
                  />
                </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <View style={styles.footer}>
          <Button onPress={onSubmit} style={{ flex: 1}}>
            <Typo color={colors.black} fontWeight={"700"} size={18}>
              {loading ? 'Hang on...' : oldTransaction?.id ? 'Update Transaction' : 'Add Transaction'}</Typo>
          </Button>
      </View>
      
      {/* loading overlay */}
      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </ModalWrapper>
  )
}

export default TransactionModal

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: spacingY._20,
    paddingVertical: spacingY._50,
  },

  footer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: spacingX._20,
    gap: scale(12),
    paddingTop: spacingY._15,
    borderTopColor: colors.neutral700,
    marginBottom: spacingY._5,
    borderTopWidth: 1,
  },

  form: {
    gap: spacingY._30,
    marginTop: spacingY._15,
  },

  avatarContainer: {
    position: "relative",
    alignSelf: "center",
  },

  avatar: {
    alignSelf: "center",
    backgroundColor: colors.neutral300,
    height: verticalScale(135),
    width: verticalScale(135),
    borderRadius: 200,
    borderWidth: 1,
    borderColor: colors.neutral500,
    //overflow: "hidden",
    //position: "relative",
  },

  editIcon: {
    position: "absolute",
    bottom: spacingY._5,
    right: spacingY._7,
    borderRadius: 100,
    backgroundColor: colors.neutral100,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    padding: spacingY._7,
  },

  inputContainer: {
    gap: spacingY._10,
  },

  dropdownContainer: {
    height: verticalScale(54),
    borderWidth: 1,
    borderColor: colors.neutral300,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._15,
    borderCurve: 'continuous',
  },

  dropdownItemText: {
    color: colors.white,
  },

  dropdownSelectedText: {
    color: colors.white,
    fontSize: verticalScale(14),
  },

  dropdownListContainer : {
    backgroundColor: colors.neutral900,
    borderRadius: radius._15,
    borderCurve: 'continuous',
    paddingVertical: spacingY._7,
    top: 5,
    borderColor: colors.neutral500,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 5},
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 5,
  },

  datePickerButton: {
    backgroundColor: colors.neutral700,
    alignSelf: "flex-end",
    padding: spacingY._7,
    marginRight: spacingX._7,
    paddingHorizontal: spacingX._15,
    borderRadius: radius._10,
  },

  dropdownPlaceholder: {
    color: colors.white,
  },

  dropdownItemContainer: {
    borderRadius: radius._15,
    marginHorizontal: spacingX._7, 
  },

  dropdownIcon: {
    height: verticalScale(30),
    tintColor: colors.neutral300,
  },

  flexRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingX._5,
  },

  dateInput: {
    flexDirection: "row",
    height: verticalScale(54),
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.neutral300,
    borderRadius: radius._17,
    borderCurve: 'continuous',
    paddingHorizontal: spacingX._15,
  },

    iosDatePicker: {

    },

})