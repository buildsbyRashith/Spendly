import React from 'react'
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Typo from './Typo'
import { WalletType } from '@/types'
import { Router } from 'expo-router'
import { verticalScale } from '@/utils/styling'
import { colors, spacingX } from '@/constants/theme'
import * as Icons from 'phosphor-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { RectButton, Swipeable } from 'react-native-gesture-handler'
import { deleteWallet } from '@/services/walletService'


const WalletListItem = ({
    item,
    index,
    router,
    onDelete
}: {
    item: WalletType,
    index: number,
    router: Router,
    onDelete: (id: string) => void
}) => {

  const handleDeleteWallet = (id: string) => {
    Alert.alert(
      'Delete wallet',
      `Are you sure you want to delete "${item.name} wallet"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await deleteWallet(id)
            if (res.success) {
              if (onDelete) {
                onDelete(id) 
              } else {
               // console.warn('WalletListItem: onDelete not provided, wallet removed from backend but UI not updated', id)
              }
            } else {
              Alert.alert('Delete failed', res.msg || 'Unknown error')
            }
          }
        }
      ]
    )
  }

    const openWallet = () => {
      router.push({
        pathname: "/(modals)/walletModal",
        params: {
          id: item?.id,
          name: item?.name,
          image: item?.image
        }
      })
    }

    const renderLeftActions = () => {
    return (
      <RectButton style={styles.leftAction} onPress={() => handleDeleteWallet(item.id)}>
        <Icons.TrashSimpleIcon size={verticalScale(20)} color={colors.white} weight="bold" />
        <Text style={styles.leftActionText}>Delete</Text>
      </RectButton>
    )
  }
    
  return (
    <Animated.View entering={FadeInDown.delay(index*250)}>
      <Swipeable renderLeftActions={renderLeftActions} overshootLeft={false}>
        <TouchableOpacity style={styles.container} onPress={openWallet}>
          <View style={styles.imageContainer}>
            <Typo style={styles.emoji}>{item.image}</Typo>
        </View>
        <View style={styles.nameContainer}>
            <Typo size={16}>{item.name}</Typo>
            <Typo size={16} color={colors.neutral400}>QAR {item.amount}</Typo>
        </View>
        <Icons.CaretRightIcon 
            size={verticalScale(20)}
            weight="bold"
            color={colors.white}
        />
      </TouchableOpacity>
      </Swipeable>
    </Animated.View>
  )
}

export default WalletListItem

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: verticalScale(17),
        padding: spacingX._15,
        backgroundColor: colors.neutral800,  // Entire container background
        borderRadius: 25,  // Rounded corners
    },

    imageContainer: {
        height: verticalScale(45),
        width: verticalScale(45),
        overflow: "hidden",
    },

    nameContainer: {
        flex: 1,
        gap: 2,
        marginLeft: spacingX._10,
    },

    emoji: {
        fontSize: 45,  // Adjust size as needed
    },

    leftAction: {
      backgroundColor: '#df2b21f8',
      justifyContent: 'center',
      alignItems: 'center',
      width: verticalScale(90),
      borderRadius: 12,
      marginBottom: verticalScale(17),
      marginRight: spacingX._10,
      flexDirection: 'row',
      gap: 8,
    },

    leftActionText: {
      color: colors.white,
      fontWeight: '600',
    }
})