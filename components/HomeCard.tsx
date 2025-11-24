import React, { useEffect, useRef } from 'react'
import { Animated, ImageBackground, StyleSheet, Text, View } from 'react-native'
import Typo from './Typo'
import { scale, verticalScale } from '@/utils/styling'
import { colors, spacingX, spacingY } from '@/constants/theme'
import * as Icons from 'phosphor-react-native'
import { useAuth } from '@/contexts/authContext'
import useFetchData from '@/hooks/useFetchData'
import { WalletType } from '@/types'
import { orderBy, where } from 'firebase/firestore'
import LottieView from 'lottie-react-native'

const HomeCard = () => {

  const {user} = useAuth()
  const fadeAnim = useRef(new Animated.Value(1)).current

  const {data: wallets, error, loading: walletLoading,} = useFetchData<WalletType>("wallets", [
  where("uid" , "==", user?.uid ),
  orderBy("created", "desc"),
])

useEffect(() => {
  if (!walletLoading) {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start()
  }
}, [walletLoading])

const getTotals = () => {
 return wallets.reduce((totals: any, item: WalletType) => {
        totals.balance = totals.balance + Number(item.amount)
        // Only include totalIncome and totalExpenses (transfers are excluded)
        totals.income = totals.income + Number(item.totalIncome || 0)
        totals.expenses = totals.expenses + Number(item.totalExpenses || 0)
        return totals
  }, {balance: 0, income: 0, expenses: 0})
}


  return (
    <ImageBackground
      source={require('../assets/images/card.png')}
      resizeMode="stretch"
      style={styles.bgImage}
    >
      <View style={styles.container}>
        {walletLoading ? (
          <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
            <LottieView 
              style={{ width: 200, height: 200 }}      
              source={require("../assets/images/man.json")}
              autoPlay={true}    
              loop={true}
            />
          </Animated.View>
        ) : (
          <>
            <View>
              {/* Total Balance Row */}
              <View style={styles.totalBalanceRow}>
                <Typo color={colors.neutral800} size={18} fontWeight={"500"}>
                  Total Balance
                </Typo>
                <Icons.DotsThreeOutlineIcon
                  size={verticalScale(23)}
                  color={colors.black}
                  weight="fill" 
                />
              </View>
              <Typo size={30} fontWeight={"bold"} color={colors.black}>
                QAR {getTotals()?.balance?.toFixed(2)}
              </Typo>
            </View>

            {/* Total Expenses and Income section */}
            <View style={styles.stats}>
              {/* Income */}
              <View style={{ gap: verticalScale(5) }}>
                <View style={styles.incomeExpense}>
                  <View style={styles.statsIcon}>
                    <Icons.ArrowDownIcon 
                      size={verticalScale(15)}
                      color={colors.black}
                      weight="bold"
                    />
                  </View>
                  <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                    Income
                  </Typo>
                </View>
                <View style={{ alignSelf: "center" }}>
                  <Typo size={17} fontWeight={"600"} color={colors.green}>
                    QAR {getTotals()?.income?.toFixed(2)}
                  </Typo>
                </View>
              </View>
              {/* Expenses */}
              <View style={{ gap: verticalScale(5) }}>
                <View style={styles.incomeExpense}>
                  <View style={styles.statsIcon}>
                    <Icons.ArrowUpIcon 
                      size={verticalScale(15)}
                      color={colors.black}
                      weight="bold"
                    />
                  </View>
                  <Typo size={16} color={colors.neutral700} fontWeight={"500"}>
                    Expenses
                  </Typo>
                </View>
                <View style={{ alignSelf: "center" }}>
                  <Typo size={17} fontWeight={"600"} color={colors.rose}>
                    QAR {getTotals()?.expenses?.toFixed(2)}
                  </Typo>
                </View>
              </View>
            </View>
          </>
        )}
      </View>
    </ImageBackground>
  )
}

export default HomeCard

const styles = StyleSheet.create({
  bgImage: {
    height: verticalScale(210),
    width: '100%',
  },

  container: {
    padding: spacingX._20,
    paddingHorizontal: scale(23),
    height: "87%",
    width: "100%",
    justifyContent: "space-between",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  totalBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._5,
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statsIcon: {
    backgroundColor: colors.neutral350,
    padding: spacingY._5,
    borderRadius: 50,
  },

  incomeExpense: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacingY._7,
  },
})