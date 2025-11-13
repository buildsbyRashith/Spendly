import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Typo from './Typo'
import { WalletType } from '@/types'
import { Router } from 'expo-router'
import { verticalScale } from '@/utils/styling'
import { colors, spacingX } from '@/constants/theme'
import * as Icons from 'phosphor-react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'


const WalletListItem = ({
    item,
    index,
    router
}: {
    item: WalletType,
    index: number,
    router: Router
}) => {
    
  return (
    <Animated.View entering={FadeInDown.delay(index*250)}>
      <TouchableOpacity style={styles.container}>
        <View style={styles.imageContainer}>
            <Typo style={styles.emoji}>{item.image}</Typo>
        </View>
        <View style={styles.nameContainer}>
            <Typo size={16}>{item.name}</Typo>
            <Typo size={16} color={colors.neutral400}>${item.amount}</Typo>
        </View>
        <Icons.CaretRightIcon 
            size={verticalScale(20)}
            weight="bold"
            color={colors.white}
        />
      </TouchableOpacity>
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
        backgroundColor: colors.container,  // Entire container background
        borderRadius: 12,  // Rounded corners
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
        fontSize: 34,  // Adjust size as needed
    },
})