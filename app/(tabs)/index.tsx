import ScreenWrapper from '@/components/ScreenWrapper'
import Typo from '@/components/Typo'
import { colors, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/authContext'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import React from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import * as Icons from 'phosphor-react-native'
import HomeCard from '@/components/HomeCard'
import TransactionList from '@/components/TransactionList'

const Home = () => {

  const router = useRouter()

  const { user } = useAuth()
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={{ gap: 4 }}>
            <Typo size={16} color={colors.neutral400}>
              Hello,
            </Typo>
            <Typo size={20} fontWeight={"500"}>
              {user?.name}
            </Typo>
          </View>
          <TouchableOpacity style={styles.searchIcon} >
            <Icons.MagnifyingGlassIcon 
              size={verticalScale(22)}
              color={colors.neutral200}
              weight='bold'
            />
          </TouchableOpacity>
        </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewStyle}
        showsVerticalScrollIndicator={false}
        >
          {/* Cards */}
          <View>
            <HomeCard />
          </View>

          <TransactionList 
              title='Recent Transactions' 
              data={[1,2,3,4,5,6]} 
              emptyListMessage="No recent transactions added yet" 
              loading={false} 
          />

      </ScrollView>

      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacingX._20,
    marginTop: verticalScale(8),
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacingY._10,
  },

  searchIcon: {
    backgroundColor: colors.neutral700,
    padding: spacingX._10,
    borderRadius: 50,
  },

  floatingButton: {
    height: verticalScale(50),
    width: verticalScale(50),
    borderRadius: 100,
    position: "absolute",
    bottom: verticalScale(30),
    right: verticalScale(30),
  },

  scrollViewStyle: {
    marginTop: spacingY._10,
    paddingBottom: verticalScale(100),
    gap: spacingY._25,
  },
})