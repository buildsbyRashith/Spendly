import BackButton from '@/components/BackButton'
import Header from '@/components/Header'
import ModalWrapper from '@/components/ModalWrapper'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { scale, verticalScale } from '@/utils/styling'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Typo from '@/components/Typo'
import Input from '@/components/Input'
import { WalletType } from '@/types'
import Button from '@/components/Button'
import { useAuth } from '@/contexts/authContext'
import { useRouter } from 'expo-router'
import ImageUpload from '@/components/ImageUpload'
import { createOrUpdateWallet } from '@/services/walletService'


const WalletModal = () => {

const router = useRouter()

const { user } = useAuth()
const [wallet, setWallet] = useState<WalletType>({
  name: "",
  image: null,
})

const [loading, setLoading] = useState(false)

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
    // to do : include wallet id if updating

    setLoading(true)
    const res = await createOrUpdateWallet(data)
    setLoading(false)
  //  console.log('result: ', res )
    if(res.success){
      router.back()
    } else {
        Alert.alert("Wallet", res.msg)
    }
}

  return (
    <ModalWrapper>
      <View style={styles.container}>
          <Header 
            title='New Wallet' 
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
            <Typo color={colors.black} fontWeight={"700"} size={18}>{loading ? 'Hang on...' : 'Add Wallet'}</Typo>
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
})