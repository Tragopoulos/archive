/** React & Expo */
import { useContext } from "react"
import { StyleSheet, ScrollView, View, Text, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
/** Configs */
import ThemeContext from "../configs/themes"
import LocaleContext from "../configs/locales"

const Page = () => {
    const { theme } = useContext(ThemeContext)
    const { locale } = useContext(LocaleContext)
    const router = useRouter()
    const insets = useSafeAreaInsets()

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.clear,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            padding: 20,
            backgroundColor: theme.clear,
        },
        backButton: {
            marginRight: 15,
        },
        title: {
            fontSize: 24,
            fontWeight: "bold",
            color: theme.invert,
        },
        scrollView: {
            flex: 1,
            padding: 20,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: theme.invert,
            marginBottom: 12,
        },
        paragraph: {
            fontSize: 14,
            lineHeight: 22,
            color: theme.invert,
            marginBottom: 12,
        },
        lastUpdated: {
            fontSize: 12,
            color: theme.secondary,
            marginBottom: 20,
            fontStyle: "italic",
        },
    })

    return <SafeAreaProvider style={{ flex: 1, paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: theme.clear }}>
        <View style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.invert} />
                </Pressable>
                <Text style={styles.title}>Terms of Service</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Last Updated: March 20, 2026</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
                    <Text style={styles.paragraph}>
                        By accessing and using SyncroSocial ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Description of Service</Text>
                    <Text style={styles.paragraph}>
                        SyncroSocial provides social media management tools including content scheduling, multi-platform posting, analytics, and account management services. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. User Accounts</Text>
                    <Text style={styles.paragraph}>
                        You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access to your account.
                    </Text>
                    <Text style={styles.paragraph}>
                        You must provide accurate, current, and complete information during registration and keep your account information updated.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Acceptable Use</Text>
                    <Text style={styles.paragraph}>
                        You agree not to use the Service to:
                    </Text>
                    <Text style={styles.paragraph}>
                        • Violate any applicable laws or regulations{"\n"}
                        • Infringe upon intellectual property rights{"\n"}
                        • Transmit malicious code or compromise system security{"\n"}
                        • Engage in fraudulent or deceptive practices{"\n"}
                        • Harass, abuse, or harm other users{"\n"}
                        • Attempt to gain unauthorized access to our systems
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Geographic Restrictions</Text>
                    <Text style={styles.paragraph}>
                        Due to legal and compliance requirements, our Service may be restricted in certain jurisdictions. We reserve the right to limit access based on geographic location to comply with international sanctions and regulations.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Intellectual Property</Text>
                    <Text style={styles.paragraph}>
                        The Service and its original content, features, and functionality are owned by SyncroSocial and are protected by international copyright, trademark, and other intellectual property laws.
                    </Text>
                    <Text style={styles.paragraph}>
                        You retain all rights to content you post through the Service. By posting content, you grant us a license to use, modify, and display that content as necessary to provide the Service.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Payment Terms</Text>
                    <Text style={styles.paragraph}>
                        Certain features of the Service may require payment. You agree to pay all applicable fees as described at the time of purchase. All fees are non-refundable unless otherwise stated or required by law.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. Termination</Text>
                    <Text style={styles.paragraph}>
                        We may terminate or suspend your account and access to the Service immediately, without prior notice, for any violation of these Terms or for any other reason at our sole discretion.
                    </Text>
                    <Text style={styles.paragraph}>
                        Upon termination, your right to use the Service will immediately cease. You may request deletion of your data as outlined in our Privacy Policy.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
                    <Text style={styles.paragraph}>
                        The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
                    <Text style={styles.paragraph}>
                        To the maximum extent permitted by law, SyncroSocial shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the Service.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>11. Changes to Terms</Text>
                    <Text style={styles.paragraph}>
                        We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last Updated" date.
                    </Text>
                    <Text style={styles.paragraph}>
                        Your continued use of the Service after changes constitutes acceptance of the modified Terms.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>12. Contact Information</Text>
                    <Text style={styles.paragraph}>
                        If you have any questions about these Terms, please contact us at:{"\n"}
                        support@syncrosocial.com
                    </Text>
                </View>
            </ScrollView>
        </View>
    </SafeAreaProvider>
}

export default Page
