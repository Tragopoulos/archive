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
                <Text style={styles.title}>Privacy Policy</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.lastUpdated}>Last Updated: March 20, 2026</Text>

                <View style={styles.section}>
                    <Text style={styles.paragraph}>
                        This Privacy Policy describes how SyncroSocial ("we", "us", or "our") collects, uses, and protects your personal information when you use our Service.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Information We Collect</Text>

                    <Text style={styles.sectionTitle}>1.1 Account Information</Text>
                    <Text style={styles.paragraph}>
                        When you create an account, we collect:{"\n"}
                        • Email address{"\n"}
                        • Name (if provided){"\n"}
                        • Password (encrypted){"\n"}
                        • Profile information you choose to provide
                    </Text>

                    <Text style={styles.sectionTitle}>1.2 Device Information</Text>
                    <Text style={styles.paragraph}>
                        We collect device information including:{"\n"}
                        • Device type and operating system{"\n"}
                        • Browser type and version{"\n"}
                        • Screen resolution{"\n"}
                        • Timezone{"\n"}
                        • Language preferences{"\n"}
                        • Device identifiers (device signature)
                    </Text>

                    <Text style={styles.sectionTitle}>1.3 Location Information</Text>
                    <Text style={styles.paragraph}>
                        We collect IP-based location information to:{"\n"}
                        • Comply with international sanctions and legal requirements{"\n"}
                        • Prevent fraud and unauthorized access{"\n"}
                        • Restrict service availability in certain jurisdictions
                    </Text>

                    <Text style={styles.sectionTitle}>1.4 Usage Data</Text>
                    <Text style={styles.paragraph}>
                        We may collect information about how you use the Service, including:{"\n"}
                        • Pages visited{"\n"}
                        • Features used{"\n"}
                        • Time spent on the platform{"\n"}
                        • Interaction patterns
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        We use the collected information for:
                    </Text>

                    <Text style={styles.sectionTitle}>2.1 Service Delivery</Text>
                    <Text style={styles.paragraph}>
                        • To provide and maintain our Service{"\n"}
                        • To authenticate your identity{"\n"}
                        • To process your requests and transactions{"\n"}
                        • To communicate with you about the Service
                    </Text>

                    <Text style={styles.sectionTitle}>2.2 Security and Fraud Prevention</Text>
                    <Text style={styles.paragraph}>
                        • To detect and prevent fraud, abuse, and security incidents{"\n"}
                        • To protect against malicious, deceptive, or illegal activity{"\n"}
                        • To verify user identity and prevent unauthorized access{"\n"}
                        • To comply with international sanctions and legal obligations
                    </Text>

                    <Text style={styles.sectionTitle}>2.3 Service Improvement</Text>
                    <Text style={styles.paragraph}>
                        • To analyze usage patterns and improve our Service{"\n"}
                        • To develop new features and functionality{"\n"}
                        • To personalize your experience
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. Legal Basis for Processing</Text>
                    <Text style={styles.paragraph}>
                        We process your personal data based on:
                    </Text>
                    <Text style={styles.paragraph}>
                        • Contractual Necessity: To provide the Service you've requested{"\n"}
                        • Legitimate Interest: For fraud detection, security, and service improvement{"\n"}
                        • Legal Obligation: To comply with applicable laws and regulations{"\n"}
                        • Consent: Where explicitly provided for specific purposes
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. Cookies and Similar Technologies</Text>

                    <Text style={styles.sectionTitle}>4.1 Essential Cookies</Text>
                    <Text style={styles.paragraph}>
                        We use essential cookies that are necessary for the Service to function. These include:
                    </Text>
                    <Text style={styles.paragraph}>
                        • Authentication cookies (Firebase Authentication){"\n"}
                        • Security cookies (Cloudflare){"\n"}
                        • Session management cookies
                    </Text>
                    <Text style={styles.paragraph}>
                        These cookies are required for the Service to operate and cannot be disabled.
                    </Text>

                    <Text style={styles.sectionTitle}>4.2 Third-Party Service Providers</Text>
                    <Text style={styles.paragraph}>
                        We use the following third-party services that may set cookies:
                    </Text>
                    <Text style={styles.paragraph}>
                        • Firebase (Google): Authentication and backend services{"\n"}
                        • Cloudflare: Security, CDN, and DDoS protection{"\n"}
                        • Google Cloud Platform: Hosting and infrastructure{"\n"}
                        • Microsoft Azure: Supporting services
                    </Text>
                    <Text style={styles.paragraph}>
                        These services have their own privacy policies governing their use of cookies and data collection.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. Information Sharing</Text>
                    <Text style={styles.paragraph}>
                        We do not sell your personal information. We may share information with:
                    </Text>
                    <Text style={styles.paragraph}>
                        • Service Providers: Third parties that help us operate the Service (Firebase, Cloudflare, etc.){"\n"}
                        • Legal Requirements: When required by law, court order, or government regulation{"\n"}
                        • Business Transfers: In connection with a merger, acquisition, or sale of assets{"\n"}
                        • With Your Consent: When you explicitly authorize us to share information
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. Data Retention</Text>
                    <Text style={styles.paragraph}>
                        We retain your information for as long as necessary to:
                    </Text>
                    <Text style={styles.paragraph}>
                        • Provide the Service to you{"\n"}
                        • Comply with legal obligations{"\n"}
                        • Resolve disputes and enforce agreements{"\n"}
                        • Prevent fraud and abuse
                    </Text>
                    <Text style={styles.paragraph}>
                        Device signatures and security logs are typically retained for 90 days. Account information is retained until you request deletion.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. Your Rights</Text>
                    <Text style={styles.paragraph}>
                        Depending on your location, you may have the following rights:
                    </Text>
                    <Text style={styles.paragraph}>
                        • Access: Request a copy of your personal data{"\n"}
                        • Rectification: Correct inaccurate or incomplete data{"\n"}
                        • Erasure: Request deletion of your data{"\n"}
                        • Restriction: Limit how we use your data{"\n"}
                        • Portability: Receive your data in a portable format{"\n"}
                        • Object: Object to processing based on legitimate interest{"\n"}
                        • Withdraw Consent: Where processing is based on consent
                    </Text>
                    <Text style={styles.paragraph}>
                        To exercise these rights, contact us at privacy@syncrosocial.com
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. Data Security</Text>
                    <Text style={styles.paragraph}>
                        We implement appropriate technical and organizational measures to protect your personal information, including:
                    </Text>
                    <Text style={styles.paragraph}>
                        • Encryption in transit and at rest{"\n"}
                        • Secure authentication mechanisms{"\n"}
                        • Regular security assessments{"\n"}
                        • Access controls and monitoring{"\n"}
                        • DDoS protection and firewall systems
                    </Text>
                    <Text style={styles.paragraph}>
                        However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. International Data Transfers</Text>
                    <Text style={styles.paragraph}>
                        Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable laws.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>10. Children's Privacy</Text>
                    <Text style={styles.paragraph}>
                        Our Service is not intended for individuals under 16 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>11. Changes to This Privacy Policy</Text>
                    <Text style={styles.paragraph}>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                    </Text>
                    <Text style={styles.paragraph}>
                        Your continued use of the Service after changes constitutes acceptance of the updated policy.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>12. Contact Us</Text>
                    <Text style={styles.paragraph}>
                        If you have questions about this Privacy Policy or our data practices, contact us at:
                    </Text>
                    <Text style={styles.paragraph}>
                        Email: privacy@syncrosocial.com{"\n"}
                        Support: support@syncrosocial.com
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>13. Third-Party Privacy Policies</Text>
                    <Text style={styles.paragraph}>
                        For more information about how our service providers handle your data:
                    </Text>
                    <Text style={styles.paragraph}>
                        • Google/Firebase Privacy Policy: https://policies.google.com/privacy{"\n"}
                        • Cloudflare Privacy Policy: https://www.cloudflare.com/privacypolicy/{"\n"}
                        • Microsoft Privacy Statement: https://privacy.microsoft.com/
                    </Text>
                </View>
            </ScrollView>
        </View>
    </SafeAreaProvider>
}

export default Page
