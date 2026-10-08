import { useState } from "react"
import { StyleSheet, Dimensions, View, Pressable, Text } from "react-native"
import { formatDate } from "../../configs/services"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import Collapsible from "react-native-collapsible"
import { light } from "../../themes/colors"
import ButtonReports from "./button_reports"

const { width } = Dimensions.get("window")

const AccordionReports = ({ data }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [listView, setListView] = useState(true)

  const changeView = () => {
    setListView(!listView)
  }

  return <View style={styles.accordion}>
    <Pressable onPress={() => setIsOpen(!isOpen)} style={styles.header}>
      <Text style={styles.timestamp}>{formatDate(data.item.timestamp)}</Text>
      <Text numberOfLines={3} ellipsizeMode="tail" style={styles.report}>
        {data?.item.lab_reports.map((report, index) =>
          <Text key={report.uuid}>
            ({report.report_code}) {report.report_name}
            {(index < data?.item.lab_reports.length - 1 && data?.item.lab_reports.length > 1) && " - "}
          </Text>
        )}
      </Text>
    </Pressable>
    <Collapsible collapsed={!isOpen} duration={150} easing="easeOutCubic" align="top" style={styles.body}>
      <View style={styles.bodyHeader}>
        <ButtonReports icon={listView ? "bar-chart" : "list"} buttonAction={changeView} />
        <ButtonReports icon="send-sharp" buttonAction={() => console.log("Parent Component Action")} />
        <ButtonReports icon="cloud-download" buttonAction={() => console.log("Parent Component Action")} />
        <ButtonReports icon="cog" buttonAction={() => console.log("Parent Component Action")} />
        <ButtonReports icon="trash-bin" buttonAction={() => console.log("Parent Component Action")} />
      </View>
      {data?.item.lab_reports.map(report =>
        <View key={report.uuid}>
          <Text style={styles.reportName}>{report.report_name} ({report.report_code})</Text>
          {report.report_results.map(result =>
            <View key={result.uuid}>
              <Text style={styles.resultName}>{result.result_name} ({result.result_code})</Text>
              <View style={[styles.gradientUnitCurrent, { paddingLeft: "30%" }]}>
                <Ionicons name="caret-down-sharp" size={24} color={light.secondaryBlue} />
                <Text style={styles.resultCurrent}>{result.result_current}</Text>
              </View>
              <LinearGradient style={styles.resultGradient}
                colors={[light.ternaryRed, light.secondaryBlue, light.secondaryBlue, light.secondaryBlue, light.ternaryRed]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
              <View style={styles.gradientUnits}>
                <Text style={styles.gradientUnitValue}>{result.result_min}</Text>
                <Text style={styles.gradientUnitValue}>{result.result_unit}</Text>
                <Text style={styles.gradientUnitValue}>{result.result_max}</Text>
              </View>
            </View>
          )}
        </View >)
      }
    </Collapsible >
  </View >
}

const styles = StyleSheet.create({
  accordion: {
    borderTopColor: light.ternary,
    borderTopWidth: 2
  },
  header: {
    height: 100,
    padding: 15,
    backgroundColor: light.white,
  },
  timestamp: {
    fontWeight: "bold",
    color: light.primary,
  },
  report: {
    color: light.secondary,
    width: width - 20,
  },
  body: {
    alignItems: "center",
    width: "100%",
    backgroundColor: light.ternary
  },
  bodyHeader: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "flex-start",
    marginLeft: 20
  },
  reportName: {
    color: light.primary,
    fontWeight: "bold",
    paddingVertical: 20,
  },
  resultName: {
    color: light.secondary,
    fontWeight: "bold",
    marginVertical: 10,
  },
  resultGradient: {
    width: width - 80,
    height: 10,
    marginBottom: 10,
  },
  gradientUnits: {
    flexDirection: "row",
    justifyContent: "space-between",
    color: light.secondary,
  },
  gradientUnitValue: {
    color: light.secondary,
  },
  gradientUnitCurrent: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginBottom: -5,
  },
  resultCurrent: {
    color: light.primaryBlue,
    fontWeight: "bold",
  },
})

export default AccordionReports
