import Button from '@/components/Button'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { auth } from '@/config/firebase'
import { colors } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import React from 'react'
import { StyleSheet, Text } from 'react-native'

const Home = () => {

  const router = useRouter()

  const { user } = useAuth()

  console.log("user: ", user)

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
    <ScreenWrapper>
      <Typo>Home</Typo>
      {/* <Button onPress={handleLogout}>
        <Typo color={colors.black}>
          Logout
        </Typo>
      </Button> */}
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({})