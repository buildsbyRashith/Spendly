import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import ModalWrapper from '@/components/ModalWrapper'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import { WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import ImageUpload from '@/components/ImageUpload'
import { createOrUpdateWallet } from '@/services/walletService'
import LottieView from 'lottie-react-native'


const WalletModal = () => {

const router = useRouter()

const { user } = useAuth()
const [wallet, setWallet] = useState<WalletType>({
  name: "",
  image: null,
})

const [loading, setLoading] = useState(false)
const [showSuccess, setShowSuccess] = useState(false)

const oldWallet: { name: string; image: string; id: string  } = 
  useLocalSearchParams()
  //console.log('old Wallet: ', oldWallet)

useEffect(() => {
  if(oldWallet?.id){
    setWallet({
      name: oldWallet?.name,
      image: oldWallet?.image,
    })
  }
}, [])

const onSubmit = async () => {
    let {name, image} = wallet
    if(!name.trim() || !image){
      Alert.alert("Wallet", "Please fill all the fields")
      return
    }

    const data: WalletType = {
      name,
      image,
      uid: user?.uid
    }
    //  wallet id if updating
    if(oldWallet?.id) data.id = oldWallet.id
    
    setLoading(true)
    const res = await createOrUpdateWallet(data)
    setLoading(false)
  //  console.log('result: ', res )
    if(res.success){
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      router.back()
      }, 2000) // Show GIF for 2 seconds
    } else {
        Alert.alert("Wallet", res.msg)
    }
}

  return (
    <ModalWrapper>
      <View style={styles.container}>
          <Header 
            title={oldWallet?.id ? 'Edit Wallet' : 'New Wallet'} 
            leftIcon={<BackButton onPress={() => router.back()} />}
            style={{ marginBottom: spacingY._10 }}
           />

          {/* form */}

        <ScrollView contentContainerStyle={styles.form}>
          <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Wallet Name</Typo>
              <Input 
                placeholder='Salary'
                value={wallet.name}
                onChangeText={(value) => setWallet({...wallet, name: value})}
              />
          </View>
          <View style={styles.inputContainer}>
              <Typo color={colors.neutral200}>Wallet Icon</Typo>
              <ImageUpload 
                file={wallet.image}
                onSelect={(emoji) => setWallet({...wallet, image: emoji})}
                placeholder="Choose wallet icon"
              />
          </View>
        </ScrollView>
      </View>
      <View style={styles.footer}>
          <Button onPress={onSubmit} style={{ flex: 1}}>
            <Typo color={colors.black} fontWeight={"700"} size={18}>
              {loading ? 'Hang on...' : oldWallet?.id ? 'Update Wallet' : 'Add Wallet'}</Typo>
          </Button>
      </View>
      
      {/* loading overlay */}
      {showSuccess && (
        <View style={styles.successOverlay} pointerEvents="none">
          <LottieView 
                style={{ width: 250, height: 250 }}      
                source={require("../../assets/images/Success.json")}
                autoPlay={true}
                loop={true}
                />
        </View>
      )}
    </ModalWrapper>
  )
}

export default WalletModal

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

  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  
  successGif: {
    width: scale(150),
    height: scale(150),
  },
})