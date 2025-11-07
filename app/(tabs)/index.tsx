import Button from '@/components/Button'
import Typo from '@/components/Typo'
import { auth } from '@/config/firebase'
import { colors } from '@/constants/theme'
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const Home = () => {

  const router = useRouter()

  const handleLogout = async () => {
    try {
    await signOut(auth)
    // navigate to welcome/login after successful sign out
      router.replace('/(auth)/welcome')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <View>
      <Text>Home</Text>
      <Button onPress={handleLogout}>
        <Typo color={colors.black}>
          Logout
        </Typo>
      </Button>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({})