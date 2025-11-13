import { colors, radius } from '@/constants/theme'
import { BackButtonProps } from '@/types'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import { CaretLeftIcon } from 'phosphor-react-native'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const BackButton = ({ onPress, style, iconProps }: any) => {
  return (
    <TouchableOpacity onPress={onPress} style={style} accessibilityRole="button">
      <CaretLeftIcon 
        size={verticalScale(22)} 
        color={colors.text} 
        {...iconProps} 
      />
    </TouchableOpacity>
  )
}

export default BackButton

const styles = StyleSheet.create({
    button: {
        backgroundColor: colors.neutral600,
        alignSelf: 'flex-start',
        borderRadius: radius._12,
        borderCurve: 'continuous',
        padding: 5,
    },
})