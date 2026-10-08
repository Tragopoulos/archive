import { useContext } from "react"
import { Linking } from "react-native"
import { useRouter, usePathname } from "expo-router"
import LocaleContext from "../configs/locales"
import SomethingWentWrong from "./website_components/error"

const Page = () => {
  const { locale } = useContext(LocaleContext)
  const router = useRouter()
  const pathname = usePathname()

  return <SomethingWentWrong
    title={locale.page_not_found_title}
    subtitle={locale.page_not_found_subtitle}
    errorCode={locale.page_not_found_error_code}
    troubleshooting={false}
    buttons={[
      {
        variant: "default",
        label: locale.page_not_found_error_button_1,
        onPress: () => router.replace('/'),
      },
      {
        variant: "default",
        label: locale.page_not_found_error_button_2,
        onPress: () => Linking.openURL(`mailto:support@syncrosocial.com?subject=${locale.page_not_found_error_code} - Path: ${pathname} - ${new Date().toLocaleString()}`),
      },
    ]}
  />
}

export default Page
