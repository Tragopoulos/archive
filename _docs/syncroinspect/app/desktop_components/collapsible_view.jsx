import { useEffect, useState, useContext } from "react"
import { FlatList, useWindowDimensions, View, Text, Pressable, Image, StyleSheet } from "react-native"
import { Zocial, FontAwesome5, Ionicons } from "@expo/vector-icons"
import Collapsible from "react-native-collapsible"
import ThemeContext from "../../configs/themes"
import { LinearGradient } from "expo-linear-gradient"
import logo from "../../assets/icons/app.png"

const CollapsibleView = ({ data }) => {
  const { theme } = useContext(ThemeContext)
  const [isOpen, setIsOpen] = useState(false)
  const [columns, setColumns] = useState(3)
  const [showCollapsibleHeaderRight, setShowCollapsibleHeaderRight] = useState(true)
  const windowDimensions = useWindowDimensions()

  useEffect(() => {
    const width = windowDimensions.width
    setShowCollapsibleHeaderRight(width < 900 ? false : true)
    setColumns(width > 1100 ? 3 : width < 700 ? 1 : 2)
  }, [windowDimensions.width])

  const formatDate = (timestamp, type) => {
    const date = new Date(timestamp)
    switch (type) {
      case "date":
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      case "time":
        return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
      default:
        return `${date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} - 
      ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
    }
  }

  const styles = StyleSheet.create({
    collapsible: {
      marginBottom: 10,
      borderRadius: 10,
      overflow: "hidden",
    },
    collapsibleHeader: {
      height: "auto",
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.clear,
    },
    collapsibleHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: 20,
    },
    collapsibleHeaderMiddle: {
      flexDirection: "column",
      marginLeft: 20,
    },
    collapsibleLabName: {
      color: theme.primary,
    },
    collapsibleLabAddress: {
      paddingVertical: 4,
      color: theme.secondary,
    },
    collapsibleLabContact: {
      color: theme.secondary,
    },
    collapsibleTimestamp: {
      color: theme.secondary,
      marginRight: 20,
    },
    containerReport: {
      alignItems: "center",
    },
    reportName: {
      color: theme.primary,
      marginTop: 20,
    },
    containerResult: {
      marginVertical: 10,
      alignItems: "center",
      padding: 10,
    },
    resultName: {
      color: theme.secondary,
      marginVertical: 10,
    },
    resultGradient: {
      width: "100%",
      height: 10,
      marginBottom: 10,
    },
    gradientUnits: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      color: theme.secondary,
    },
    gradientUnitValue: {
      color: theme.secondary,
    },
    gradientUnitCurrent: {
      color: theme.secondary,
      flexDirection: "row",
      alignSelf: "flex-start",
      marginBottom: -5
    },
    avatar: {
      width: 45,
      height: 45
    },
  })

  return <View style={styles.collapsible}>
    <Pressable onPress={() => setIsOpen(!isOpen)} style={styles.collapsibleHeader}>
      <View style={styles.collapsibleHeaderLeft}>
        <Image style={styles.avatar} source={logo} />
        <View style={styles.collapsibleHeaderMiddle}>
          <Text style={styles.collapsibleLabName}>{data.item.lab_name}</Text>
          {!showCollapsibleHeaderRight && <Text style={styles.collapsibleTimestamp}>{formatDate(data.item.timestamp)}</Text>}
          <Text style={styles.collapsibleLabAddress}>{data.item.lab_address}</Text>
          <Text style={styles.collapsibleLabContact}>
            <FontAwesome5 name="phone-square-alt" /> {data.item.lab_phone}  <Zocial name="email" /> {data.item.lab_email}
          </Text>
        </View>
      </View>
      {showCollapsibleHeaderRight && <Text style={styles.collapsibleTimestamp}>{formatDate(data.item.timestamp)}</Text>}
    </Pressable>
    <Collapsible collapsed={!isOpen} duration={150} easing="easeOutCubic" align="top">
      {data?.item.lab_reports.map(report =>
        <View key={`${report.report_name.replace(/\s/g, "")}${data.item.timestamp}`} style={styles.containerReport}>
          <Text style={styles.reportName}>{report.report_name}</Text>
          <FlatList key={columns} keyExtractor={item => item.result_name} data={report?.report_results} numColumns={columns}
            style={{ width: "100%", justifyContent: "left" }} renderItem={({ item }) => (
              <View style={[styles.containerResult, { width: columns === 3 ? "33%" : columns === 2 ? "50%" : "100%" }]}>
                <Text style={styles.resultName}>{item.result_name}</Text>
                <View style={[styles.gradientUnitCurrent, { paddingLeft: "30%" }]}>
                  <Ionicons name="caret-down-sharp" size={24} color="#4A90E2" style={{}} />
                  <Text >{item.result_current}</Text>
                </View>
                <LinearGradient style={styles.resultGradient}
                  colors={[theme.ternaryRed, theme.secondaryBlue, theme.secondaryBlue, theme.secondaryBlue, theme.ternaryRed]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
                <View style={styles.gradientUnits}>
                  <Text style={styles.gradientUnitValue}>{item.result_min}</Text>
                  <Text style={styles.gradientUnitValue}>{item.result_unit}</Text>
                  <Text style={styles.gradientUnitValue}>{item.result_max}</Text>
                </View>
              </View>)}
          />
        </View>)}
    </Collapsible>
  </View>
}

export default CollapsibleView

