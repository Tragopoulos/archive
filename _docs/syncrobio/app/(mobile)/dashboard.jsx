/** Expo & React */
import { useEffect, useState, useContext } from "react"
import { useRouter } from "expo-router"
import { ScrollView } from "react-native"
/** Configs */
import ThemeContext from "../../configs/themes"
import storage from "../../configs/storage"
import mock from "../../configs/mock.json"
import { request } from "../../configs/services"
/** Components */
import BannerVerification from "../mobile_components/banner_verification"
import Loading from "../mobile_components/loading"
import TextBox from "../mobile_components/text_box"
// import ChartTimeline from "../mobile_components/chart_timeline"
// import ChartReports from "../mobile_components/chart_reports"

const Page = () => {
  const { theme } = useContext(ThemeContext)
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)

  useEffect(() => {
    getState()
  }, [])

  const getState = async () => {
    setLoading(true)
    const stateLoading = await storage.get("loading")
    if (stateLoading == true) {
      setTimeout(getState, 1000)
    } else {

      const stateAccount = await storage.get("account")
      stateAccount && setAccount(stateAccount)
      setLoading(false)
    }
  }

  return loading ? <Loading /> :
    <ScrollView style={{ backgroundColor: theme.clear }}>
      {!account?.data.verified ? <BannerVerification setLoading={setLoading} setAccount={setAccount} /> : null}
      <TextBox data={mock?.dashboard.reports_overview} />
      {/* <ChartReports /> */}
      <TextBox data={mock?.dashboard.timeline_overview} />
      {/* <ChartTimeline /> */}
      <TextBox data={mock?.dashboard.health_overview} />
    </ScrollView>
}

export default Page