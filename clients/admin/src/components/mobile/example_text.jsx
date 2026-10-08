import { View, Text, Pressable } from "react-native"
import { useAuth } from "../../configs/auth"

const ExampleText = () => {
    const { signOut } = useAuth()

    return <View style={{ padding: 20, gap: 16 }}>
        <Text>Mobile</Text>
        <Pressable onPress={signOut} style={({ pressed }) => ({ alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderRadius: 6, opacity: pressed ? 0.6 : 1 })}>
            <Text>Logout</Text>
        </Pressable>
    </View>
}

export default ExampleText