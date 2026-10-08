import { styles } from "../../themes/themes"
import { useEffect, useState } from "react"
import { View, Text } from "react-native"

const Contacts = () => {
  const [data, setData] = useState(null)

  /** Data */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://gist.githubusercontent.com/Tragopoulos/d06a8d64ec8cd613dbb348fca319ba9c/raw/26e65e4008f5b5cf1db6e7e3e8ed8366042edfd6/syncrobio.json")
        const data = await response.json()
        setData(data)
      } catch (error) {
        //TODO: Error Handling
        console.error(error.code, error.message)
      }
    }
    fetchData()
  }, [])

  return <View style={styles.containerContacts}>
  </View>
}

export default Contacts