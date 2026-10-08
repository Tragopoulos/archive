/** Expo & React */
import { useEffect, useState, useContext } from "react"
import { View, FlatList } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"
import AccordionReports from "../mobile_components/accordion_reports"
import mock from "../../configs/mock.json"
import HeaderReports from "../mobile_components/header_reports"

const Page = () => {
  const { theme } = useContext(ThemeContext)

  return <View style={{ flex: 1, backgroundColor: theme.clear }}>
    <HeaderReports />
    <FlatList data={mock?.reports} keyExtractor={data => data.uuid} showsVerticalScrollIndicator={false}
      renderItem={data => <AccordionReports key={data?.uuid} data={data} />} />
  </View>
}

export default Page