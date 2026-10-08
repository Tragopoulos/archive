import { ScrollView, StyleSheet, Animated, View, Text, Pressable } from "react-native"
/** Expo & React */
import { useEffect, useState, useContext, useRef } from "react"
/** Configs */
import ThemeContext from "../../../configs/themes"
import mock from "../../../configs/mock.json"
import { formatDate } from "../../../configs/services"
import ButtonAction from "../../mobile_components/button_action"
import { MaterialCommunityIcons } from "@expo/vector-icons"

const Page = () => {
  const { theme } = useContext(ThemeContext)

  const styles = StyleSheet.create({
    request: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: theme.white,
      borderBottomWidth: 5,
      borderColor: theme.ternary,
    },
    approvalButtons: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 30,
      paddingTop: 10,
    },
    requestHeader: {
      flexDirection: "row",
    },
    key: {
      color: theme.secondary,
    },
    value: {
      color: theme.secondary
    },
  })

  const handleApprove = () => {
    console.log("Handle Approve Pressed")
  }

  const handleDeny = () => {
    console.log("Handle Deny Pressed")
  }

  return <ScrollView>
    {mock?.access.map(request => request.pending ?
      <View key={request.uuid} style={styles.request}>
        <View style={styles.requestHeader}>
          <View>
            <Text style={styles.key}>Request Date: </Text>
            <Text style={styles.key}>Requester: </Text>
          </View>
          <View>
            <Text style={styles.value}>{formatDate(request.request_timestamp, "time") + ", " + formatDate(request.request_timestamp, "date")}</Text>
            <View>
              <Text style={styles.value}>{request.name}</Text>
              <Text style={styles.value}>{request.category}</Text>
              <Text style={styles.value}>{request.email}</Text>
              <Text style={styles.value}>{request.phone}</Text>
            </View>
          </View>
        </View>
        <View style={styles.approvalButtons}>
          <ButtonAction action={handleApprove} text="Approve" color={theme.white} stroke={theme.secondaryBlue} fill={theme.secondaryBlue}
            icon={<MaterialCommunityIcons name="shield-check-outline" />} />
          <ButtonAction action={handleDeny} text="Deny" color={theme.white} stroke={theme.secondaryRed} fill={theme.secondaryRed}
            icon={<MaterialCommunityIcons name="shield-lock-outline" />} />
        </View>
      </View> : null
    )}
  </ScrollView>
}



export default Page