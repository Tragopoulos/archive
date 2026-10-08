import { styles } from "../../themes/themes"
import { useEffect, useState } from "react"
import { FlatList, useWindowDimensions, View, Text, Pressable, Image } from "react-native"
import { formatDate } from "../../configs/services"
import logo from "../../assets/images/image_d.png"
import { Zocial, FontAwesome5, Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Collapsible from "react-native-collapsible"
import { colors } from "../../themes/colors"

const CollapsibleView = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [columns, setColumns] = useState(3)
  const [showCollapsibleHeaderRight, setShowCollapsibleHeaderRight] = useState(true)
  const windowDimensions = useWindowDimensions()

  useEffect(() => {
    const width = windowDimensions.width
    setShowCollapsibleHeaderRight(width < 900 ? false : true)
    setColumns(width > 1100 ? 3 : width < 700 ? 1 : 2)
  }, [windowDimensions.width])

  return (
    <View style={styles.collapsible}>
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
                    <Ionicons name="caret-down-sharp" size={24} color={colors.secondaryBlue} style={{}} />
                    <Text >{item.result_current}</Text>
                  </View>
                  <LinearGradient style={styles.resultGradient}
                    colors={[colors.ternaryRed, colors.secondaryBlue, colors.secondaryBlue, colors.secondaryBlue, colors.ternaryRed]}
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
  )
}

export default CollapsibleView

