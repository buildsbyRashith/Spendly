import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { ImageUploadProps } from '@/types'
import * as Icons from 'phosphor-react-native'
import { colors, spacingY } from '@/constants/theme'
import EmojiPicker, { type EmojiType } from 'rn-emoji-keyboard'
import Typo from './Typo'

const ImageUpload = ({
    file = null,
    onSelect,
    containerStyle,
    imageStyle,
    placeholder = "Select Emoji"
}: ImageUploadProps) => {

const [isOpen, setIsOpen] = useState(false)

  const handlePick = (emoji: EmojiType) => {
    onSelect?.(emoji.emoji)
    setIsOpen(false)
  }

  return (
    <View>
      <TouchableOpacity 
        style={[styles.container, containerStyle]}
        onPress={() => setIsOpen(true)}
      >
        {file ? (
          <Text style={styles.emoji}>{file}</Text>
        ) : (
          <View style={styles.placeholder}>
            <Icons.SmileyIcon size={32} color={colors.neutral300} />
            <Typo size={12} style={styles.placeholderText}>{placeholder}</Typo>
          </View>
        )}
      </TouchableOpacity>

      <EmojiPicker
        onEmojiSelected={handlePick}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        enableSearchBar
        enableRecentlyUsed
        theme={{
          backdrop: colors.black,
          knob: colors.neutral500,
          container: colors.neutral800,
          header: colors.neutral100,
          skinTonesContainer: colors.neutral700,
          category: {
            icon: colors.neutral300,
            iconActive: colors.primary,
            container: colors.neutral800,
            containerActive: colors.neutral700,
          },
        }}
      />
    </View>
  )
}

export default ImageUpload

const styles = StyleSheet.create({
    container: {
    borderWidth: 1,
    borderColor: colors.neutral500,
    borderRadius: 12,
    padding: spacingY._20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    backgroundColor: colors.neutral800,
  },
  emoji: {
    fontSize: 48,
  },
  placeholder: {
    alignItems: 'center',
    gap: 8,
  },
  placeholderText: {
    color: colors.neutral300,
  },
})