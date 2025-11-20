
import { colors } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import { useRouter } from 'expo-router'
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Image, StyleSheet, View } from 'react-native'
import LottieView from 'lottie-react-native'




const index = () => {

const { initialized, user } = useAuth()
  const router = useRouter()
  const startRef = useRef<number>(Date.now())
  const [navigated, setNavigated] = useState(false)
  const [animationLoaded, setAnimationLoaded] = useState(false)
  const lottieRef = useRef<LottieView>(null)
  const MIN_SPLASH_MS = 1000

  useEffect(() => {
    // Start animation immediately when loaded
    if (animationLoaded && lottieRef.current) {
      lottieRef.current.play()
    }
  }, [animationLoaded])

  useEffect(() => {
    if (!initialized || navigated) return

    const elapsed = Date.now() - startRef.current
    const wait = Math.max(0, MIN_SPLASH_MS - elapsed)

    const t = setTimeout(() => {
      if (user) {
        router.replace('/(tabs)')
      } else {
        router.replace('/(auth)/welcome')
      }
      setNavigated(true)
    }, wait)

    return () => clearTimeout(t)
  }, [initialized, user, navigated, router])

  if (!initialized || !navigated) {
    return (
      <View style={styles.container}>
        <Image
          style={styles.logo}
          resizeMode='contain'
          source={require('../assets/images/splashnew.png')}
        />
        <LottieView
          ref={lottieRef}
          style={styles.lottie}      
          source={require("../assets/images/Runing.json")}
          autoPlay={true}    
          loop={true}
          onAnimationLoaded={() => setAnimationLoaded(true)}
        />
      </View>
    )
  }

  return null
}

export default index

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.green,
    },

    logo: {
        height: '50%',
        aspectRatio: 1,
    },

    lottie: {
        position: 'absolute',
        width: 950,
        height: 950,
        top: '50%',
        marginTop: -475, // Half of height to center
    },
})