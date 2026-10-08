// import { useRef } from "react"
// import { View, Text } from "react-native"
// import { BarChart } from "react-native-gifted-charts"

// const barData = [
//   {
//     value: 40,
//     label: "Jan",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 50,
//     label: "Feb",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 75,
//     label: "Mar",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 30,
//     label: "Apr",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 60,
//     label: "May",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 65,
//     label: "Jun",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 65,
//     label: "Jul",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 40,
//     label: "Aug",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 50,
//     label: "Sep",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 75,
//     label: "Oct",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 30,
//     label: "Nov",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
//   {
//     value: 60,
//     label: "Dec",
//     spacing: 20,
//     labelWidth: 10,
//     frontColor: "#177AD5",
//   },
// ]

// const ChartTimeline = () => {
//   const ref = useRef(null)

//   return <View style={{ marginHorizontal: 20, marginBottom: 10, padding: 16, borderRadius: 20, backgroundColor: "#232B5D" }}>
//     <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", paddingBottom: 20 }}>Timeline</Text>
//     <BarChart
//       scrollRef={ref}
//       data={barData}
//       barWidth={16}
//       spacing={34}
//       roundedTop
//       roundedBottom
//       hideRules
//       xAxisThickness={0}
//       yAxisThickness={0}
//       yAxisTextStyle={{ color: "white" }}
//       xAxisLabelTextStyle={{ color: "white", textAlign: "center" }}
//       noOfSections={4}
//       maxValue={100}
//       showLine
//       lineConfig={{
//         color: "#F29C6E",
//         thickness: 3,
//         curved: true,
//         hideDataPoints: true,
//         shiftY: 0,
//         initialSpacing: 20,
//       }}
//     />
//   </View>
// }

// export default ChartTimeline