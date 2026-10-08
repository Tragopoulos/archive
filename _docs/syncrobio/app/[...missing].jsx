import { Text, View, Pressable } from "react-native"
import { useRouter, Stack } from "expo-router"

const Page = () => {
  const router = useRouter()

  return <View>
    {/* <Stack.Screen options={{ headerShown: false }} /> */}
    <Text>--Missing-Page--</Text>
    {/* <Pressable onPress={() => router.replace("/")}
      style={{ width: 150, height: 50, backgroundColor: "red" }}>
      <Text>Go to Website</Text>
    </Pressable> */}
  </View>
}

export default Page