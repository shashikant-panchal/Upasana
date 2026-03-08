import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import {
    FlatList,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";

const getYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const recipes = [
    {
        id: "khichdi",
        name: "Khichdi",
        sanskrit: "खिचड़ी",
        description: "A healing one-pot meal of rice and lentils, perfect for fasting recovery",
        prepTime: "30 min",
        servings: "4",
        category: "Main Dish",
        image: "🍚",
        videoUrl: "https://www.youtube.com/watch?v=Oy9_qGZgZvU",
        videoThumbnail: "https://img.youtube.com/vi/Oy9_qGZgZvU/maxresdefault.jpg",
        ingredients: [
            "1 cup basmati rice",
            "½ cup moong dal (split yellow lentils)",
            "1 tsp ghee",
            "½ tsp turmeric powder",
            "1 tsp cumin seeds",
            "Salt to taste",
            "4 cups water",
            "Fresh coriander for garnish"
        ],
        instructions: [
            "Wash rice and dal together until water runs clear",
            "Heat ghee in a pressure cooker, add cumin seeds",
            "Add rice, dal, turmeric, salt, and water",
            "Pressure cook for 3 whistles",
            "Let it rest for 5 minutes, then open",
            "Garnish with fresh coriander and serve with ghee"
        ],
        benefits: ["Easy to digest", "Balances all three doshas", "Provides complete protein", "Ideal for breaking fast"]
    },
    {
        id: "sabudana-khichdi",
        name: "Sabudana Khichdi",
        sanskrit: "साबूदाना खिचड़ी",
        description: "Light sago preparation, traditionally eaten during Ekadashi",
        prepTime: "25 min",
        servings: "3",
        category: "Fasting Food",
        image: "🥔",
        videoUrl: "https://www.youtube.com/watch?v=2TPQXgJz8KA",
        videoThumbnail: "https://img.youtube.com/vi/2TPQXgJz8KA/maxresdefault.jpg",
        ingredients: [
            "1 cup sabudana (sago pearls)",
            "2 medium potatoes, cubed",
            "¼ cup roasted peanuts",
            "2 green chilies",
            "1 tsp cumin seeds",
            "2 tbsp ghee",
            "Fresh coriander",
            "Rock salt to taste"
        ],
        instructions: [
            "Soak sabudana for 4-5 hours, drain well",
            "Heat ghee, add cumin and green chilies",
            "Add potatoes, cook until golden",
            "Add soaked sabudana, mix gently",
            "Add crushed peanuts and rock salt",
            "Cook on low heat for 5-7 minutes",
            "Garnish with coriander and serve"
        ],
        benefits: ["Provides instant energy", "Light on stomach", "Traditional fasting food", "Easily digestible"]
    },
    {
        id: "fruit-bowl",
        name: "Sattvic Fruit Bowl",
        sanskrit: "फल सलाद",
        description: "Fresh seasonal fruits with honey and nuts",
        prepTime: "10 min",
        servings: "2",
        category: "Breakfast",
        image: "🍎",
        videoUrl: "https://www.youtube.com/watch?v=BHcCnXQj0Bc",
        videoThumbnail: "https://img.youtube.com/vi/BHcCnXQj0Bc/maxresdefault.jpg",
        ingredients: [
            "1 banana, sliced",
            "1 apple, cubed",
            "½ cup grapes",
            "1 pomegranate, seeds",
            "2 tbsp honey",
            "1 tbsp mixed nuts",
            "Fresh mint leaves"
        ],
        instructions: [
            "Wash and cut all fruits",
            "Arrange in a bowl",
            "Drizzle with honey",
            "Top with mixed nuts",
            "Garnish with mint leaves",
            "Serve immediately"
        ],
        benefits: ["Rich in antioxidants", "Natural energy source", "Increases sattva", "Light and refreshing"]
    },
    {
        id: "tulsi-tea",
        name: "Tulsi Ginger Tea",
        sanskrit: "तुलसी चाय",
        description: "Sacred basil tea for immunity and mental clarity",
        prepTime: "10 min",
        servings: "2",
        category: "Beverage",
        image: "🍵",
        videoUrl: "https://www.youtube.com/watch?v=ot8EqK-Oyww",
        videoThumbnail: "https://img.youtube.com/vi/ot8EqK-Oyww/maxresdefault.jpg",
        ingredients: [
            "10-12 fresh tulsi leaves",
            "1 inch ginger, grated",
            "2 cups water",
            "1 tsp honey (optional)",
            "Few drops of lemon"
        ],
        instructions: [
            "Boil water with tulsi leaves and ginger",
            "Simmer for 5 minutes",
            "Strain into cups",
            "Add honey when slightly cool",
            "Add lemon drops if desired",
            "Sip slowly and mindfully"
        ],
        benefits: ["Boosts immunity", "Calms the mind", "Aids digestion", "Spiritually purifying"]
    },
    {
        id: "makhana",
        name: "Roasted Makhana",
        sanskrit: "मखाना",
        description: "Fox nuts roasted in ghee, a perfect sattvic snack",
        prepTime: "15 min",
        servings: "2",
        category: "Snack",
        image: "🌰",
        videoUrl: "https://www.youtube.com/watch?v=xHnWO8F3Sv0",
        videoThumbnail: "https://img.youtube.com/vi/xHnWO8F3Sv0/maxresdefault.jpg",
        ingredients: [
            "2 cups makhana (fox nuts)",
            "1 tbsp ghee",
            "½ tsp rock salt",
            "¼ tsp black pepper",
            "Pinch of turmeric"
        ],
        instructions: [
            "Heat ghee in a pan on low flame",
            "Add makhana and roast slowly",
            "Stir continuously for 8-10 minutes",
            "Makhana should become crispy",
            "Add salt, pepper, and turmeric",
            "Cool and store in airtight container"
        ],
        benefits: ["Low calorie, high nutrition", "Good for fasting", "Improves kidney health", "Calms the nervous system"]
    },
    {
        id: "dal-rice",
        name: "Simple Dal Rice",
        sanskrit: "दाल चावल",
        description: "Comforting lentils with steamed rice",
        prepTime: "40 min",
        servings: "4",
        category: "Main Dish",
        image: "🍛",
        videoUrl: "https://www.youtube.com/watch?v=0Z8xPzxZWgY",
        videoThumbnail: "https://img.youtube.com/vi/0Z8xPzxZWgY/maxresdefault.jpg",
        ingredients: [
            "1 cup toor dal",
            "2 cups basmati rice",
            "1 tsp ghee",
            "1 tsp cumin seeds",
            "2 tomatoes, chopped",
            "½ tsp turmeric",
            "Fresh coriander",
            "Salt to taste"
        ],
        instructions: [
            "Cook rice and dal separately",
            "For tadka, heat ghee with cumin",
            "Add tomatoes and turmeric, cook well",
            "Add cooked dal, mix and simmer",
            "Adjust salt and consistency",
            "Serve dal over rice with ghee"
        ],
        benefits: ["Complete protein source", "Balances doshas", "Grounding and nourishing", "Easy to digest"]
    },
    {
        id: "lauki-sabzi",
        name: "Lauki Sabzi",
        sanskrit: "लौकी की सब्जी",
        description: "Mild bottle gourd curry, light and cooling for the body",
        prepTime: "25 min",
        servings: "4",
        category: "Main Dish",
        image: "🥒",
        videoUrl: "https://www.youtube.com/watch?v=TGj1yTH0P2k",
        videoThumbnail: "https://img.youtube.com/vi/TGj1yTH0P2k/maxresdefault.jpg",
        ingredients: [
            "1 medium bottle gourd, peeled and cubed",
            "1 tbsp ghee",
            "1 tsp cumin seeds",
            "1 green chili, slit",
            "½ tsp turmeric",
            "½ tsp coriander powder",
            "Salt to taste",
            "Fresh coriander for garnish"
        ],
        instructions: [
            "Peel and cube the bottle gourd",
            "Heat ghee, add cumin seeds and green chili",
            "Add lauki, turmeric, and coriander powder",
            "Add salt and cover, cook on low heat",
            "Stir occasionally until soft",
            "Garnish with fresh coriander"
        ],
        benefits: ["Cooling and hydrating", "Aids digestion", "Low in calories", "Good for pitta dosha"]
    },
    {
        id: "kadhi",
        name: "Punjabi Kadhi",
        sanskrit: "कढ़ी",
        description: "Yogurt-based curry with gram flour dumplings",
        prepTime: "45 min",
        servings: "4",
        category: "Main Dish",
        image: "🥣",
        videoUrl: "https://www.youtube.com/watch?v=MYnP-F-Q1H4",
        videoThumbnail: "https://img.youtube.com/vi/MYnP-F-Q1H4/maxresdefault.jpg",
        ingredients: [
            "1 cup yogurt",
            "4 tbsp gram flour (besan)",
            "1 tsp turmeric",
            "2 tbsp ghee",
            "1 tsp cumin seeds",
            "Dried red chilies",
            "Curry leaves",
            "Salt to taste"
        ],
        instructions: [
            "Whisk yogurt with gram flour and turmeric",
            "Add 4 cups water, mix well",
            "Boil while stirring continuously",
            "Simmer for 20 minutes",
            "Prepare tadka with ghee and spices",
            "Pour tadka over kadhi, serve with rice"
        ],
        benefits: ["Probiotic benefits", "Aids digestion", "Cooling for the body", "Rich in protein"]
    }
];

const SattvicFoodsScreen = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const openVideo = (url) => {
        Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
    };

    const renderRecipeItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.recipeCard, { backgroundColor: colors.card, borderColor: colors.border + "40" }]}
            onPress={() => {
                Haptics.selectionAsync();
                setSelectedRecipe(item);
            }}
        >
            <View style={[styles.imageContainer, { backgroundColor: colors.border + "20" }]}>
                <ThemedText style={{ fontSize: 36 }}>{item.image}</ThemedText>
            </View>
            <View style={styles.recipeInfo}>
                <View style={styles.recipeHeader}>
                    <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                    <View style={[styles.badge, { backgroundColor: colors.primary + "15" }]}>
                        <ThemedText style={[styles.badgeText, { color: colors.primary }]}>{item.category}</ThemedText>
                    </View>
                </View>
                <ThemedText type="small" style={{ color: colors.mutedForeground }} numberOfLines={1}>
                    {item.description}
                </ThemedText>
                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <Feather name="clock" size={12} color={colors.mutedForeground} />
                        <ThemedText type="small" style={[styles.statText, { color: colors.mutedForeground }]}>{item.prepTime}</ThemedText>
                    </View>
                    <View style={styles.stat}>
                        <Feather name="users" size={12} color={colors.mutedForeground} />
                        <ThemedText type="small" style={[styles.statText, { color: colors.mutedForeground }]}>{item.servings} servings</ThemedText>
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border + "40", backgroundColor: colors.background + 'CC' }]}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <ThemedText style={styles.headerTitle}>Sāttvic Foods</ThemedText>
                        <ThemedText style={styles.headerSubtitle}>सात्विक आहार · Pure Recipes</ThemedText>
                    </View>
                </View>
                <View style={[styles.headerIconBgSmall, { backgroundColor: '#22c55e20' }]}>
                    <MaterialCommunityIcons name="leaf" size={20} color="#22c55e" />
                </View>
            </View>

            <FlatList
                data={recipes}
                keyExtractor={(item) => item.id}
                renderItem={renderRecipeItem}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={() => (
                    <View style={[styles.introBox, { backgroundColor: "#22c55e15", borderColor: "#22c55e30" }]}>
                        <View style={styles.introHeader}>
                            <View style={[styles.leafIcon, { backgroundColor: "#22c55e20" }]}>
                                <MaterialCommunityIcons name="leaf" size={20} color="#22c55e" />
                            </View>
                            <ThemedText type="defaultSemiBold" style={{ color: colors.foreground }}>Sattvic Diet</ThemedText>
                        </View>
                        <ThemedText type="small" style={[styles.introDesc, { color: colors.mutedForeground }]}>
                            Foods that promote clarity, peace, and spiritual growth. Pure, fresh, and prepared with devotion.
                        </ThemedText>
                    </View>
                )}
            />

            <Modal
                visible={!!selectedRecipe}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedRecipe(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalTitleRow}>
                                <View style={[styles.largeIcon, { backgroundColor: colors.border + "20" }]}>
                                    <ThemedText style={{ fontSize: 40 }}>{selectedRecipe?.image}</ThemedText>
                                </View>
                                <View>
                                    <ThemedText type="subtitle">{selectedRecipe?.name}</ThemedText>
                                    <ThemedText type="small" style={{ color: colors.mutedForeground }}>{selectedRecipe?.sanskrit}</ThemedText>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => setSelectedRecipe(null)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={colors.foreground} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            {}
                            {selectedRecipe && selectedRecipe.videoUrl && (
                                <View style={styles.videoPlayerContainer}>
                                    <YoutubePlayer
                                        height={200}
                                        play={false}
                                        videoId={getYouTubeID(selectedRecipe.videoUrl)}
                                    />
                                </View>
                            )}

                            {}
                            {selectedRecipe && (
                                <TouchableOpacity
                                    style={styles.youtubeLinkButton}
                                    onPress={() => openVideo(selectedRecipe.videoUrl)}
                                >
                                    <Feather name="youtube" size={18} color="#FFF" />
                                    <ThemedText style={styles.youtubeLinkText}>Watch on YouTube App</ThemedText>
                                </TouchableOpacity>
                            )}

                            <View style={styles.recipeMeta}>
                                <View style={[styles.metaBadge, { borderColor: colors.border }]}>
                                    <Feather name="clock" size={14} color={colors.mutedForeground} />
                                    <ThemedText type="small" style={{ marginLeft: 6 }}>{selectedRecipe?.prepTime}</ThemedText>
                                </View>
                                <View style={[styles.metaBadge, { borderColor: colors.border }]}>
                                    <Feather name="users" size={14} color={colors.mutedForeground} />
                                    <ThemedText type="small" style={{ marginLeft: 6 }}>{selectedRecipe?.servings} servings</ThemedText>
                                </View>
                            </View>

                            <ThemedText style={[styles.recipeDesc, { color: colors.mutedForeground }]}>
                                {selectedRecipe?.description}
                            </ThemedText>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="list" size={18} color={colors.primary} />
                                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Ingredients</ThemedText>
                                </View>
                                {selectedRecipe?.ingredients.map((ing, i) => (
                                    <View key={i} style={styles.ingredientItem}>
                                        <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                                        <ThemedText style={styles.ingredientText}>{ing}</ThemedText>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Feather name="activity" size={18} color={colors.primary} />
                                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Instructions</ThemedText>
                                </View>
                                {selectedRecipe?.instructions.map((step, i) => (
                                    <View key={i} style={styles.instructionStep}>
                                        <View style={[styles.stepNumber, { backgroundColor: colors.primary + "15" }]}>
                                            <ThemedText style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>{i + 1}</ThemedText>
                                        </View>
                                        <ThemedText style={styles.instructionText}>{step}</ThemedText>
                                    </View>
                                ))}
                            </View>

                            <View style={[styles.section, { marginBottom: 40 }]}>
                                <View style={styles.sectionHeader}>
                                    <MaterialCommunityIcons name="leaf" size={18} color="#22c55e" />
                                    <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Benefits</ThemedText>
                                </View>
                                <View style={styles.benefitsRow}>
                                    {selectedRecipe?.benefits.map((benefit, i) => (
                                        <View key={i} style={[styles.benefitTag, { backgroundColor: "#22c55e15" }]}>
                                            <ThemedText style={{ color: "#166534", fontSize: 12 }}>{benefit}</ThemedText>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitleContainer: {
        alignItems: "flex-start",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "600",
    },
    headerSubtitle: {
        fontSize: 12,
        opacity: 0.6,
    },
    headerIconBgSmall: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    introBox: {
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 24,
        marginTop: 10,
    },
    introHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    leafIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    introDesc: {
        lineHeight: 18,
    },
    recipeCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    recipeInfo: {
        flex: 1,
    },
    recipeHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 2,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "600",
    },
    statsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 6,
    },
    stat: {
        flexDirection: "row",
        alignItems: "center",
    },
    statText: {
        marginLeft: 4,
        fontSize: 11,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        height: "90%",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 20,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 20,
    },
    modalTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    largeIcon: {
        width: 70,
        height: 70,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    closeBtn: {
        padding: 8,
    },
    modalScroll: {
        flex: 1,
    },
    videoPlayerContainer: {
        width: "100%",
        height: 200,
        borderRadius: 20,
        overflow: "hidden",
        marginBottom: 16,
        backgroundColor: "#000",
    },
    youtubeLinkButton: {
        width: "100%",
        padding: 12,
        backgroundColor: "#FF0000",
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 20,
    },
    youtubeLinkText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "600",
    },
    videoFooter: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 12,
        backgroundColor: "rgba(0,0,0,0.6)",
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    videoFooterText: {
        color: "#FFF",
        fontSize: 12,
        fontWeight: "500",
    },
    recipeMeta: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
    },
    metaBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
    },
    recipeDesc: {
        lineHeight: 22,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
    },
    ingredientItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
        paddingLeft: 4,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 12,
    },
    ingredientText: {
        fontSize: 15,
        opacity: 0.8,
    },
    instructionStep: {
        flexDirection: "row",
        marginBottom: 16,
    },
    stepNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        marginTop: 2,
    },
    instructionText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.8,
    },
    benefitsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    benefitTag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    }
});

export default SattvicFoodsScreen;
