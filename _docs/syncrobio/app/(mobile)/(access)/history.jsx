/** Expo & React */
import { useEffect, useState, useContext } from "react"
/** Configs */
import ThemeContext from "../../../configs/themes"
import { ScrollView, StyleSheet, View, Text } from "react-native"
import mock from "../../../configs/mock.json"
import { formatDate } from "../../../configs/services"
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
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingBottom: 10,
    },
    approved: {
      color: theme.primaryBlue,
    },
    denied: {
      color: theme.primaryRed,
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

  return <ScrollView>
    {mock?.access.map(request => !request.pending ?
      <View key={request.uuid} style={styles.request}>
        {request.approved ?
          <View style={styles.badge}>
            <MaterialCommunityIcons name="shield-check-outline" size={22} style={styles.approved} />
            <Text style={styles.approved}>Approved</Text>
          </View>
          :
          <View style={styles.badge}>
            <MaterialCommunityIcons name="shield-lock-outline" size={22} style={styles.denied} />
            <Text style={styles.denied}>Denied</Text>
          </View>
        }
        <View style={styles.requestHeader}>
          <View>
            <Text style={styles.key}>Request Date: </Text>
            <Text style={styles.key} >Response Date: </Text>
            <Text style={styles.key}>Requester: </Text>
          </View>
          <View>
            <Text style={styles.value}>{formatDate(request.request_timestamp, "time") + ", " + formatDate(request.request_timestamp, "date")}</Text>
            <Text style={styles.value}>{formatDate(request.request_timestamp, "time") + ", " + formatDate(request.response_timestamp, "date")}</Text>
            <View>
              <Text style={styles.value}>{request.name}</Text>
              <Text style={styles.value}>{request.category}</Text>
              <Text style={styles.value}>{request.email}</Text>
              <Text style={styles.value}>{request.phone}</Text>
            </View>
          </View>
        </View>
      </View> : null
    )}
  </ScrollView>
}



export default Page