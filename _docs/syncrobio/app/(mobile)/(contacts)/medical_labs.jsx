/** Expo & React */
import { useEffect, useState, useContext } from "react"
/** Configs */
import ThemeContext from "../../../configs/themes"
import { ScrollView, StyleSheet, View, Text, Image } from "react-native"
import mock from "../../../configs/mock.json"
import ButtonAction from "../../mobile_components/button_action"
import { Fontisto, Feather } from "@expo/vector-icons"

const Page = () => {
  const { theme } = useContext(ThemeContext)

  const styles = StyleSheet.create({
    contacts: {
      paddingHorizontal: 10,
      paddingVertical: 10,
      backgroundColor: theme.white,
      borderBottomWidth: 5,
      borderColor: theme.ternary,
    },
    contactCard: {
      flexDirection: "row",
      alignItems: "center"
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      resizeMode: "contain",
      marginRight: 10,
    },
    key: {
      color: theme.secondary,
    },
    value: {
      color: theme.secondary
    },
    actionButtons: {
      paddingTop: 10,
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
    }
  })
  const handleCall = () => {
    console.log("Handle Call Pressed")
  }

  const handleEmail = () => {
    console.log("Handle Email Pressed")
  }

  return <ScrollView>
    {mock?.contacts.map(contact => contact.category === "lab" ?
      <View key={contact.uuid} style={styles.contacts}>
        <View style={styles.contactCard}>
          <Image style={styles.avatar} source={{ uri: contact.photo }} />
          <View>
            <Text style={styles.key}>Name: </Text>
            <Text style={styles.key}>Address: </Text>
            <Text style={styles.key} >Email: </Text>
            <Text style={styles.key}>Phone: </Text>
          </View>
          <View>
            <Text style={styles.value}>{contact.name}</Text>
            <Text style={styles.value}>{contact.address}</Text>
            <Text style={styles.value}>{contact.email}</Text>
            <Text style={styles.value}>{contact.phone}</Text>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <ButtonAction action={handleCall} text="Call" color={theme.secondaryBlue} stroke={theme.secondaryBlue} fill={theme.white}
            icon={<Feather name="phone-call" />} />
          <ButtonAction action={handleEmail} text="Email" color={theme.secondaryBlue} stroke={theme.secondaryBlue} fill={theme.white}
            icon={<Fontisto name="email" />} />
        </View>
      </View> : null
    )}
  </ScrollView>
}


export default Page