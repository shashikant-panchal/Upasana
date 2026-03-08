import { Feather } from "@expo/vector-icons";
import moment from "moment";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import YoutubePlayer from "react-native-youtube-iframe";
import { useSelector } from "react-redux";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../context/ThemeContext";
import { getAllBhajans } from "../data/bhajansData";
import { getEkadashiStory } from "../data/ekadashiStories";
import { useEkadashiList } from "../hooks/useEkadashi";

const SCREEN_WIDTH = Dimensions.get("window").width;

const AppIcon = ({ name, style, size = 24, color }) => (
  <Feather name={name} size={size} color={color} style={style} />
);

const fastingTypes = [
  { name: "Jalahar", hindi: "जलाहर", description: "Only water", icon: "droplet", color: "blue" },
  { name: "Ksheerbhoji", hindi: "क्षीरभोजी", description: "Only milk & simple dairy", icon: "beaker", color: "orange" }, 
  { name: "Phalahari", hindi: "फलाहारी", description: "Only fruits (no leafy veggies)", icon: "sun", color: "green" }, 
  { name: "Naktabhoji", hindi: "नक्तभोजी", description: "One meal before sunset", icon: "moon", color: "purple" },
];

const allowedItems = [
  "Fruits (no leafy ones)",
  "Milk & basic dairy",
  "Potatoes, sweet potatoes, taro",
  "Sabudana, Singhada flour",
  "Almond milk (pure)",
  "Herbal/green tea",
];

const avoidItems = [
  "All grains & legumes",
  "Coffee, cocoa, chocolate",
  "Paneer & curdled milk",
  "Oat/soy milk",
  "Peas",
  "Processed syrups",
];

const faqCategories = [
  {
    title: "Drinks & Beverages",
    icon: "🥤",
    items: [
      { q: "Can I drink coffee?", a: "Avoid. Coffee comes from a bean-like seed and is addictive." },
      { q: "Can I drink cocoa or hot chocolate?", a: "Avoid. Cocoa is also bean-derived." },
      { q: "Are green tea, herbal tea allowed?", a: "Generally yes, since they come from leaves. Limit if caffeine causes issues." },
      { q: "Almond/oat/soy milk?", a: "Almond milk: Allowed if pure. Oat milk: Not allowed (grain). Soy milk: Not allowed (legume)." },
    ]
  },
  {
    title: "Dairy & Milk Products",
    icon: "🥛",
    items: [
      { q: "Is paneer or cream cheese allowed?", a: "Avoid. They are made by curdling milk, not suitable for Ekadashi." },
      { q: "Which dairy foods are allowed?", a: "Cow's milk, curd, buttermilk, ghee, butter, khoa/mawa." },
      { q: "Can I use buffalo or goat milk?", a: "Traditionally avoided. Stick to cow's milk if possible." },
    ]
  },
  {
    title: "Food Items & Ingredients",
    icon: "🍽️",
    items: [
      { q: "What vegetables can I eat?", a: "Allowed: Potatoes, sweet potatoes, arbi (taro root) - these are root vegetables." },
      { q: "Are peas allowed?", a: "No. Peas are legumes." },
      { q: "Are ready mixes okay?", a: "Avoid if they contain additives, grains, or dal extracts. Check labels." },
    ]
  },
  {
    title: "Snacks & Packaged Foods",
    icon: "🍫",
    items: [
      { q: "Are chocolates or energy bars allowed?", a: "No. They contain cocoa, nuts, emulsifiers, or grain ingredients." },
      { q: "Can I eat protein bars/shakes?", a: "Avoid — most contain pea protein, soy, or grain-based ingredients." },
      { q: "Are smoothies allowed?", a: "Yes, if made only with allowed fruits and milk. Avoid seeds, oats, nut butters." },
    ]
  },
  {
    title: "Medicines & Supplements",
    icon: "💊",
    items: [
      { q: "Can I take regular medicines?", a: "Yes, if prescribed. Check if tablets are vegetarian (gelatin capsules may not be)." },
      { q: "Vitamin tablets or Omega-3?", a: "Preferably avoid during the fast. Many contain prohibited seed or oil extracts." },
      { q: "Is Chyawanprash allowed?", a: "Better to avoid. It has many ingredients, some may not be permitted." },
    ]
  },
];

const recipesList = [
  {
    name: "Sabudana Khichdi",
    description: "Perfect non-sticky sabudana khichdi - the most popular Ekadashi fasting recipe",
    prepTime: "20 mins",
    youtubeId: "ibjmhV6q5QU",
    channel: "Rajshri Food"
  },
  {
    name: "Sabudana Kheer",
    description: "Creamy sago payasam dessert - perfect sweet dish for fasting days",
    prepTime: "25 mins",
    youtubeId: "0fXCG98I0d4",
    channel: "The Plate"
  },
  {
    name: "Kuttu Ki Puri",
    description: "Crispy buckwheat flour pooris - gluten-free and perfect for vrat",
    prepTime: "15 mins",
    youtubeId: "tOuY3WCfPbc",
    channel: "Get Curried"
  },
  {
    name: "Fresh Fruit Salad",
    description: "Refreshing and healthy fruit salad with honey-lime dressing",
    prepTime: "10 mins",
    youtubeId: "3UYyoPhbU2I",
    channel: "Downshiftology"
  }
];

const DetailCard = ({ iconName, title, children, colors }) => (
  <View style={[styles.cardContainer, { backgroundColor: colors.card }]}>
    <View style={styles.cardHeader}>
      <AppIcon name={iconName} style={styles.cardIcon} color={colors.primary} />
      <ThemedText
        type="heading"
        style={[styles.cardTitle, { color: colors.foreground }]}
      >
        {title}
      </ThemedText>
    </View>
    <View style={styles.cardContent}>{children}</View>
  </View>
);

const SignificanceSection = ({ onLearnMore, ekadashi, colors }) => (
  <DetailCard iconName="book-open" title="Significance" colors={colors}>
    <ThemedText style={[styles.bodyText, { color: colors.mutedForeground }]}>
      Ekadashi means the 11th day of each lunar cycle. Every Hindu month has two
      Ekadashis—one in the Shukla Paksha and one in the Krishna Paksha.
    </ThemedText>
    <TouchableOpacity
      style={[styles.readButton, { borderColor: colors.primary }]}
      onPress={onLearnMore}
    >
      <ThemedText
        type="defaultSemiBold"
        style={[styles.readButtonText, { color: colors.primary }]}
      >
        Learn More
      </ThemedText>
    </TouchableOpacity>
  </DetailCard>
);

const StorySection = ({ onReadStory, ekadashi, colors }) => {
  const description =
    ekadashi?.description ||
    ekadashi?.vrataKatha ||
    ekadashi?.significance ||
    "Observing Ekadashi with devotion helps overcome life's obstacles and brings inner peace. This sacred day is particularly beneficial for those seeking spiritual growth and material prosperity.";
  const benefit =
    "Observing Ekadashi with devotion helps overcome life's obstacles and brings inner peace. This sacred day is particularly beneficial for those seeking spiritual growth and material prosperity.";

  return (
    <DetailCard iconName="book-open" title="Story" colors={colors}>
      <ThemedText
        style={[
          styles.bodyText,
          { color: colors.mutedForeground },
        ]}
      >
        {benefit}
      </ThemedText>
      <TouchableOpacity
        style={[
          styles.readButton,
          { borderColor: colors.primary, marginTop: 15 },
        ]}
        onPress={onReadStory}
      >
        <ThemedText
          type="defaultSemiBold"
          style={[styles.readButtonText, { color: colors.primary }]}
        >
          Read Full Story
        </ThemedText>
      </TouchableOpacity>
    </DetailCard>
  );
};

const VrataRulesSection = ({ ekadashi, colors }) => {
  const defaultRules = [
    "Begin fasting from sunrise on Ekadashi day",
    "Avoid grains, beans, and certain vegetables",
    "Stay hydrated with water and fruit juices",
    "Spend time in prayer and meditation",
    "Read spiritual texts or chant mantras",
  ];
  const rules = ekadashi?.fastingRules || defaultRules;

  return (
    <DetailCard
      iconName="heart"
      title="Vrata Rules & Guidelines"
      colors={colors}
    >
      {rules.map((rule, index) => (
        <View key={index} style={styles.ruleItem}>
          <View
            style={[
              styles.ruleNumberCircle,
              { borderColor: colors.grey, backgroundColor: colors.card },
            ]}
          >
            <ThemedText
              type="small"
              style={[styles.ruleNumberText, { color: colors.foreground }]}
            >
              {index + 1}
            </ThemedText>
          </View>
          <ThemedText
            style={[styles.ruleText, { color: colors.mutedForeground }]}
          >
            {rule}
          </ThemedText>
        </View>
      ))}
    </DetailCard>
  );
};

const TimingsSection = ({ panchangData, ekadashiDate, ekadashi, colors }) => {
  
  const fastingBeginTime = ekadashi?.fastingStartTime || panchangData?.sunrise || "06:09 AM";
  const paranaWindowTime = ekadashi?.paranaWindow || "06:10 AM - 10:00 AM";

  const fastingDate = ekadashiDate ? ekadashiDate.format("D MMM YYYY") : "";
  const nextDay = ekadashiDate ? moment(ekadashiDate).add(1, 'days').format("D MMM YYYY") : "";

  return (
    <DetailCard iconName="clock" title="Important Timings" colors={colors}>
      <View style={styles.timingRow}>
        <View style={styles.timingItem}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.timingLabel, { color: colors.foreground }]}
          >
            Fasting Begins
          </ThemedText>
          <ThemedText style={[styles.timingValue, { color: colors.primary }]}>
            {fastingBeginTime}, <ThemedText style={{ fontSize: 12 }}>{fastingDate}</ThemedText>
          </ThemedText>
        </View>
        <View style={styles.timingItem}>
          <ThemedText
            type="defaultSemiBold"
            style={[styles.timingLabel, { color: colors.foreground }]}
          >
            Parana Window
          </ThemedText>
          <ThemedText type="tiny" style={{ color: colors.mutedForeground, marginTop: -2, marginBottom: 4 }}>
            (Fast breaking time)
          </ThemedText>
          <ThemedText style={[styles.timingValue, { color: colors.primary }]}>
            {paranaWindowTime}
          </ThemedText>
          <ThemedText style={{ fontSize: 12, color: colors.primary }}>
            {nextDay}
          </ThemedText>
        </View>
      </View>
    </DetailCard>
  );
};

const BhajansSection = ({ onBhajanPress, bhajans, colors }) => {
  const displayBhajans = bhajans || getAllBhajans().slice(0, 3);

  return (
    <DetailCard iconName="music" title="Bhajans & Mantras" colors={colors}>
      {displayBhajans.map((bhajan) => (
        <TouchableOpacity
          key={bhajan.id}
          style={[
            styles.bhajanButton,
            { borderColor: colors.border, backgroundColor: colors.muted },
          ]}
          onPress={() => onBhajanPress(bhajan)}
        >
          <AppIcon
            name="music"
            style={styles.bhajanIcon}
            color={colors.primary}
            size={18}
          />
          <View style={styles.bhajanTextContainer}>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.bhajanText, { color: colors.foreground }]}
            >
              {bhajan.name}
            </ThemedText>
            {bhajan.artist && (
              <ThemedText
                type="caption"
                style={[styles.bhajanArtist, { color: colors.mutedForeground }]}
              >
                {bhajan.artist}
              </ThemedText>
            )}
          </View>
        </TouchableOpacity>
      ))}
    </DetailCard>
  );
};

const RecipesSection = ({ onRecipePress, colors }) => {
  return (
    <DetailCard iconName="feather" title="Sattvic Recipes" colors={colors}>
      {recipesList.map((recipe, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.recipeItem,
            { borderColor: colors.border, backgroundColor: colors.muted },
          ]}
          onPress={() => onRecipePress(recipe)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.recipeName, { color: colors.foreground }]}
            >
              {recipe.name}
            </ThemedText>
            <View style={{ backgroundColor: colors.card, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}>
              <ThemedText type="tiny" style={{ fontSize: 10, color: colors.mutedForeground }}>
                {recipe.prepTime}
              </ThemedText>
            </View>
          </View>
          <ThemedText
            type="small"
            style={[styles.recipeDesc, { color: colors.mutedForeground }]}
          >
            {recipe.description}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </DetailCard>
  );
};

const FastingGuideSection = ({ colors, isDark }) => {
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  return (
    <DetailCard iconName="compass" title="Ekadashi Fasting Guide" colors={colors}>
      {}
      <ThemedText type="defaultSemiBold" style={{ marginBottom: 10, color: colors.foreground }}>
        Types of Fasts
      </ThemedText>
      <View style={{ marginBottom: 20 }}>
        {fastingTypes.map((type, index) => (
          <View
            key={index}
            style={[
              styles.fastingTypeCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                
              }
            ]}
          >
            <View style={[styles.fastingTypeIcon, { backgroundColor: colors.muted }]}>
              <AppIcon name={type.icon} size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 2 }}>
                <ThemedText type="defaultSemiBold" style={{ color: colors.foreground, marginRight: 8 }}>
                  {type.name}
                </ThemedText>
                <ThemedText type="small" style={{ color: colors.mutedForeground }}>
                  ({type.hindi})
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: colors.mutedForeground }}>
                {type.description}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {}
      <View style={[styles.noteBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 13, marginBottom: 4, color: colors.foreground }}>
          Naktabhoji Items:
        </ThemedText>
        <ThemedText type="small" style={{ color: colors.mutedForeground, lineHeight: 18 }}>
          Sabudana, sweet potatoes, potatoes, Singhada flour. Kuttu & Samak rice are debated — stricter observers avoid them.
        </ThemedText>
      </View>

      {}
      <View style={{ marginVertical: 20 }}>
        {}
        <View style={[styles.listCard, { backgroundColor: isDark ? '#062c22' : '#ecfdf5', borderColor: isDark ? '#064e3b' : '#a7f3d0' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ backgroundColor: '#10b981', borderRadius: 4, padding: 2, marginRight: 8 }}>
              <AppIcon name="check" size={12} color="white" />
            </View>
            <ThemedText type="defaultSemiBold" style={{ color: isDark ? '#6ee7b7' : '#047857' }}>Allowed</ThemedText>
          </View>
          <View style={styles.gridList}>
            {allowedItems.map((item, i) => (
              <View key={i} style={styles.gridItem}>
                <ThemedText style={{ color: '#10b981', marginRight: 5 }}>•</ThemedText>
                <ThemedText type="small" style={{ color: isDark ? '#d1fae5' : '#047857', flex: 1 }}>{item}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {}
        <View style={[styles.listCard, { marginTop: 15, backgroundColor: isDark ? '#450a0a' : '#fff1f2', borderColor: isDark ? '#7f1d1d' : '#fecdd3' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={{ backgroundColor: '#ef4444', borderRadius: 4, padding: 2, marginRight: 8 }}>
              <AppIcon name="x" size={12} color="white" />
            </View>
            <ThemedText type="defaultSemiBold" style={{ color: isDark ? '#fca5a5' : '#b91c1c' }}>Avoid</ThemedText>
          </View>
          <View style={styles.gridList}>
            {avoidItems.map((item, i) => (
              <View key={i} style={styles.gridItem}>
                <ThemedText style={{ color: '#ef4444', marginRight: 5 }}>•</ThemedText>
                <ThemedText type="small" style={{ color: isDark ? '#ffe4e6' : '#b91c1c', flex: 1 }}>{item}</ThemedText>
              </View>
            ))}
          </View>
        </View>

      </View>
      {}
      <View
        style={{
          marginVertical: 10,
          padding: 20,
          borderRadius: 16,
          backgroundColor: isDark ? '#451a03' : '#fffbeb', 
          borderWidth: 1,
          borderColor: isDark ? '#78350f' : '#fde68a', 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <View style={{ zIndex: 1, alignItems: 'center' }}>
          <ThemedText
            type="defaultSemiBold"
            style={{
              fontSize: 16,
              textAlign: 'center',
              color: isDark ? '#fef3c7' : '#78350f', 
              marginBottom: 8,
              lineHeight: 24
            }}
          >
            "Ekadashi is about restraint, not celebration."
          </ThemedText>
          <ThemedText
            type="small"
            style={{
              textAlign: 'center',
              color: isDark ? '#fcd34d' : '#b45309', 
            }}
          >
            Eat light, natural food. Adapt based on your health and devotion.
          </ThemedText>
        </View>
      </View>

      <View style={{ height: 10 }} />

      {}
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
          <AppIcon name="help-circle" size={18} color={colors.mutedForeground} style={{ marginRight: 8 }} />
          <ThemedText type="defaultSemiBold" style={{ color: colors.foreground }}>
            Frequently Asked Questions
          </ThemedText>
        </View>

        {faqCategories.map((category, idx) => {
          const isExpanded = expandedFaqIndex === idx;
          return (
            <View key={idx} style={[styles.faqContainer, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TouchableOpacity
                style={styles.faqHeader}
                onPress={() => toggleFaq(idx)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ThemedText style={{ marginRight: 8 }}>{category.icon}</ThemedText>
                  <ThemedText type="defaultSemiBold" style={{ fontSize: 14, color: colors.foreground }}>
                    {category.title}
                  </ThemedText>
                </View>
                <AppIcon name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={[styles.faqContent, { borderTopColor: colors.border }]}>
                  {category.items.map((item, i) => (
                    <View key={i} style={{ marginBottom: 12 }}>
                      <ThemedText type="defaultSemiBold" style={{ fontSize: 13, color: colors.foreground, marginBottom: 2 }}>
                        {item.q}
                      </ThemedText>
                      <ThemedText type="small" style={{ color: colors.mutedForeground, lineHeight: 18 }}>
                        {item.a}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </DetailCard>
  );
};

const RecipeModal = ({ isVisible, onClose, recipe, colors, isDark }) => {
  if (!recipe) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.6)" }]}>
        <View style={[styles.bhajanModalContainer, { backgroundColor: colors.card, height: 'auto', minHeight: 400 }]}>
          <View style={[styles.bhajanHandle, { backgroundColor: colors.border }]} />

          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <AppIcon name="youtube" size={20} color="#ff0000" style={{ marginRight: 8 }} />
            <ThemedText type="subtitle" style={[styles.modalTitle, { color: colors.foreground }]}>
              {recipe.name}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppIcon name="x" size={24} color={colors.grey} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {}
            <View style={{ height: 220, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <YoutubePlayer
                height={220}
                play={true}
                videoId={recipe.youtubeId}
              />
            </View>

            <View style={{ flexDirection: 'row', marginBottom: 16, gap: 10 }}>
              <View style={{
                flex: 1,
                backgroundColor: isDark ? colors.border : colors.primary + '15',
                padding: 12,
                borderRadius: 12,
                alignItems: 'center'
              }}>
                <ThemedText type="tiny" style={{ color: colors.mutedForeground, marginBottom: 4 }}>Prep Time</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: isDark ? colors.foreground : colors.primary }}>{recipe.prepTime}</ThemedText>
              </View>
              <View style={{
                flex: 1,
                backgroundColor: isDark ? '#3f1818' : '#fee2e2', 
                padding: 12,
                borderRadius: 12,
                alignItems: 'center'
              }}>
                <ThemedText type="tiny" style={{ color: isDark ? '#fda4af' : '#7f1d1d', marginBottom: 4 }}>Channel</ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: isDark ? '#fca5a5' : '#b91c1c' }}>{recipe.channel}</ThemedText>
              </View>
            </View>

            <ThemedText style={{ fontSize: 15, lineHeight: 24, color: colors.mutedForeground }}>
              {recipe.description}
            </ThemedText>

            <TouchableOpacity
              style={{
                marginTop: 20,
                backgroundColor: '#cc0000',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 12,
                borderRadius: 8
              }}
              onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${recipe.youtubeId}`)}
            >
              <AppIcon name="youtube" size={16} color="white" style={{ marginRight: 8 }} />
              <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Watch Full Recipe on YouTube</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const SignificanceModal = ({ isVisible, onClose, colors, isDark }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.modalOverlay,
          {
            backgroundColor: isDark
              ? "rgba(0,0,0,0.7)"
              : "rgba(0, 0, 0, 0.5)",
          },
        ]}
      >
        <View
          style={[styles.storyModalContainer, { backgroundColor: colors.card }]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            <AppIcon name="book-open" size={20} color={colors.primary} />
            <ThemedText
              type="subtitle"
              style={[styles.modalTitle, { color: colors.foreground }]}
            >
              What is Ekadashi?
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppIcon name="x" size={24} color={colors.grey} />
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.storyModalContent}
          >
            <ThemedText
              style={[
                styles.modalContentText,
                { color: colors.mutedForeground },
              ]}
            >
              Ekadashi means{" "}
              <ThemedText style={{ fontWeight: "bold" }}>
                the 11th day
              </ThemedText>{" "}
              of each lunar cycle. Every Hindu month has two Ekadashis—one in
              the Shukla Paksha and one in the Krishna Paksha.
            </ThemedText>
            <View
              style={[
                styles.infoBox,
                { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
            >
              <ThemedText
                style={[
                  styles.modalContentText,
                  { color: colors.mutedForeground },
                ]}
              >
                🗓 Ekadashi comes twice a month, on the 11th day after each New
                Moon and Full Moon.
              </ThemedText>
            </View>
            <ThemedText
              type="subtitle"
              style={[styles.modalContentHeading, { color: colors.foreground }]}
            >
              ✨ Significance of Ekadashi
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.modalSubHeading, { color: colors.foreground }]}
            >
              1. A Day of Cleansing — Body, Mind & Soul
            </ThemedText>
            <ThemedText
              style={[
                styles.modalContentText,
                { color: colors.mutedForeground },
              ]}
            >
              • Calms the mind{"\n"}• Reduces cravings{"\n"}• Improves digestion
              {"\n"}• Increases mental clarity
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.modalSubHeading, { color: colors.foreground }]}
            >
              2. Reducing Material Influence
            </ThemedText>
            <ThemedText
              style={[
                styles.modalContentText,
                { color: colors.mutedForeground },
              ]}
            >
              💭 Mind becomes more sattvic{"\n"}
              🧘 Senses become easier to control{"\n"}
              📿 Meditation becomes deeper
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.modalSubHeading, { color: colors.foreground }]}
            >
              3. Devotional Connection to Lord Vishnu / Krishna
            </ThemedText>
            <ThemedText
              style={[
                styles.modalContentText,
                { color: colors.mutedForeground },
              ]}
            >
              • Removes past karma{"\n"}• Builds devotion (bhakti){"\n"}•
              Attains peace{"\n"}• Reconnecting with the divine
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.modalSubHeading, { color: colors.foreground }]}
            >
              4. Conscious Eating
            </ThemedText>
            <ThemedText
              style={[
                styles.modalContentText,
                { color: colors.mutedForeground },
              ]}
            >
              Avoiding grains is meaningful—digestive fire is lower on Ekadashi.
              {"\n"}• Light food{"\n"}• Fruits{"\n"}• Water{"\n"}• Simplicity
              and rest for the body
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.modalSubHeading, { color: colors.foreground }]}
            >
              5. Discipline & Willpower
            </ThemedText>
            <ThemedText
              style={[
                styles.modalContentText,
                { color: colors.mutedForeground },
              ]}
            >
              • Breaking habits{"\n"}• Controlling desires{"\n"}• Living
              intentionally
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.modalContentHeading, { color: colors.foreground }]}
            >
              🕉 Meaning of Ekadashi (Spiritual)
            </ThemedText>
            <ThemedText
              style={[
                styles.modalContentText,
                { color: colors.mutedForeground },
              ]}
            >
              Scriptures describe Ekadashi as{" "}
              <ThemedText style={{ fontWeight: "bold" }}>
                "the doorway between the material and spiritual."
              </ThemedText>
              {"\n"}✨ Purifies consciousness{"\n"}✨ Strengthens devotion{"\n"}
              ✨ Brings mental clarity{"\n"}✨ Reduces negative tendencies
            </ThemedText>
            <ThemedText
              type="subtitle"
              style={[styles.modalContentHeading, { color: colors.foreground }]}
            >
              🌼 Why People Feel Ekadashi is Powerful
            </ThemedText>
            <ThemedText
              style={[
                styles.modalContentText,
                { color: colors.mutedForeground },
              ]}
            >
              • Mind settles faster during japa{"\n"}• Emotions feel lighter
              {"\n"}• Food cravings reduce{"\n"}• Thoughts become clearer{"\n"}•
              Devotion feels deeper{"\n"}• Energy feels purer
            </ThemedText>
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: colors.primary + "15",
                  borderColor: colors.primary + "30",
                },
              ]}
            >
              <ThemedText
                type="subtitle"
                style={[styles.modalSubHeading, { color: colors.foreground }]}
              >
                ❤️ Simple Summary
              </ThemedText>
              <ThemedText
                style={[
                  styles.modalContentText,
                  { color: colors.mutedForeground, fontWeight: "600" },
                ]}
              >
                Ekadashi = A spiritual reset day.
              </ThemedText>
              <ThemedText
                style={[
                  styles.modalContentText,
                  { color: colors.mutedForeground },
                ]}
              >
                • Rest the stomach{"\n"}• Cleanse the mind{"\n"}• Connect with
                Krishna{"\n"}• Reduce negative energy{"\n"}• Be peaceful &
                mindful
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const StoryModal = ({ isVisible, onClose, ekadashi, colors, isDark }) => {
  const ekadashiName = ekadashi?.name || ekadashi?.ekadashi_name || "Ekadashi";
  const story = getEkadashiStory(ekadashiName);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={[
          styles.modalOverlay,
          {
            backgroundColor: isDark
              ? "rgba(0,0,0,0.7)"
              : "rgba(0, 0, 0, 0.5)",
          },
        ]}
      >
        <View
          style={[styles.storyModalContainer, { backgroundColor: colors.card }]}
        >
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            <AppIcon name="book-open" size={20} color={colors.primary} />
            <ThemedText
              type="subtitle"
              style={[styles.modalTitle, { color: colors.foreground }]}
            >
              {ekadashiName} - Complete Story
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppIcon name="x" size={24} color={colors.grey} />
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.storyModalContent}
          >
            {story ? (
              <>
                <ThemedText
                  type="subtitle"
                  style={[styles.modalContentHeading, { color: colors.primary, marginTop: 0 }]}
                >
                  The Sacred Legend
                </ThemedText>
                {story.legend.split('\n\n').map((paragraph, index) => (
                  <ThemedText
                    key={index}
                    style={[
                      styles.modalContentText,
                      { color: colors.mutedForeground, marginTop: 5 },
                    ]}
                  >
                    {paragraph}
                  </ThemedText>
                ))}

                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginVertical: 15 }} />

                <ThemedText
                  type="subtitle"
                  style={[styles.modalContentHeading, { color: colors.primary, marginTop: 0 }]}
                >
                  Spiritual Significance
                </ThemedText>
                {story.significance.split('\n\n').map((paragraph, index) => (
                  <ThemedText
                    key={index}
                    style={[
                      styles.modalContentText,
                      { color: colors.mutedForeground, marginTop: 5 },
                    ]}
                  >
                    {paragraph}
                  </ThemedText>
                ))}

                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginVertical: 15 }} />

                <ThemedText
                  type="subtitle"
                  style={[styles.modalContentHeading, { color: colors.primary, marginTop: 0 }]}
                >
                  Blessings
                </ThemedText>
                <ThemedText
                  style={[
                    styles.modalContentText,
                    { color: colors.mutedForeground, marginTop: 5 },
                  ]}
                >
                  {story.blessings}
                </ThemedText>
              </>
            ) : (
              <ThemedText
                style={[
                  styles.modalContentText,
                  { color: colors.mutedForeground },
                ]}
              >
                {ekadashi?.description || ekadashi?.vrataKatha || "Story not available."}
              </ThemedText>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const BhajanModal = ({
  isVisible,
  onClose,
  selectedBhajan,
  onBhajanChange,
  colors,
  isDark,
}) => {
  const allBhajans = getAllBhajans();
  const currentBhajan =
    typeof selectedBhajan === "object"
      ? selectedBhajan
      : allBhajans.find((b) => b.name === selectedBhajan) || allBhajans[0];

  const soundCloudEmbedUrl = currentBhajan?.url
    ? `https://w.soundcloud.com/player/?url=${encodeURIComponent(
      currentBhajan.url
    )}&auto_play=true&visual=true&show_artwork=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
    : null;

  const handleBhajanSelect = (bhajan) => {
    if (onBhajanChange) {
      onBhajanChange(bhajan);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.modalOverlay,
          {
            backgroundColor: isDark
              ? "rgba(0,0,0,0.7)"
              : "rgba(0, 0, 0, 0.5)",
          },
        ]}
      >
        <View
          style={[
            styles.bhajanModalContainer,
            { backgroundColor: colors.card },
          ]}
        >
          <View
            style={[styles.bhajanHandle, { backgroundColor: colors.border }]}
          />

          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: colors.border,
                backgroundColor: colors.card,
              },
            ]}
          >
            <AppIcon
              name="music"
              size={24}
              color={colors.primary}
              style={{ marginRight: 8 }}
            />
            <ThemedText
              type="subtitle"
              style={[styles.modalTitle, { flex: 1, color: colors.foreground }]}
              numberOfLines={1}
            >
              {currentBhajan?.name || "Bhajan"}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <AppIcon name="x" size={24} color={colors.grey} />
            </TouchableOpacity>
          </View>

          <View style={styles.webviewContainer}>
            {soundCloudEmbedUrl ? (
              <WebView
                source={{ uri: soundCloudEmbedUrl }}
                style={styles.webview}
                scrollEnabled={false}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
              />
            ) : (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: colors.muted },
                ]}
              >
                <ThemedText style={[styles.errorText, { color: colors.grey }]}>
                  Audio not available
                </ThemedText>
              </View>
            )}
          </View>

          <ThemedText
            style={[styles.devotionalText, { color: colors.mutedForeground }]}
          >
            Playing devotional music for your spiritual journey
          </ThemedText>

          <View style={styles.bhajanListFooter}>
            {allBhajans.map((bhajan) => (
              <TouchableOpacity
                key={bhajan.id}
                style={[
                  styles.footerBhajanButton,
                  { borderColor: colors.grey },
                  currentBhajan?.id === bhajan.id && {
                    borderColor: colors.primary,
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => handleBhajanSelect(bhajan)}
              >
                <ThemedText
                  type="small"
                  style={[
                    styles.footerBhajanText,
                    { color: colors.foreground },
                    currentBhajan?.id === bhajan.id &&
                    styles.activeFooterBhajanText,
                  ]}
                  numberOfLines={1}
                >
                  {bhajan.name}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const CalendarDayDetails = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const [isSignificanceModalVisible, setSignificanceModalVisible] =
    useState(false);
  const [isStoryModalVisible, setStoryModalVisible] = useState(false);
  const [isBhajanModalVisible, setBhajanModalVisible] = useState(false);
  const [isRecipeModalVisible, setRecipeModalVisible] = useState(false);
  const [activeBhajan, setActiveBhajan] = useState(getAllBhajans()[0]);
  const [activeRecipe, setActiveRecipe] = useState(null);
  const [ekadashi, setEkadashi] = useState(null);
  const [panchangData, setPanchangData] = useState(null);

  const location = useSelector((state) => state.location);

  const ekadashiFromRoute = route?.params?.ekadashi;
  
  const ekadashiDateString = useMemo(
    () => route?.params?.date || moment().format("YYYY-MM-DD"),
    [route?.params?.date]
  );
  const ekadashiDate = useMemo(
    () => moment(ekadashiDateString),
    [ekadashiDateString]
  );
  const currentYear = moment().year();
  const { ekadashiList } = useEkadashiList(currentYear);

  const locationLat = useMemo(() => location?.latitude, [location?.latitude]);
  const locationLon = useMemo(() => location?.longitude, [location?.longitude]);

  const lastFetchedRef = useRef({ date: null, lat: null, lon: null });

  useEffect(() => {
    if (ekadashiFromRoute) {
      setEkadashi(ekadashiFromRoute);
    } else if (ekadashiList && ekadashiList.length > 0) {
      const foundEkadashi = ekadashiList.find((e) => {
        const eDate = moment(e.date || e.ekadashi_date);
        return eDate.isSame(ekadashiDate, "day");
      });
      if (foundEkadashi) {
        setEkadashi(foundEkadashi);
      }
    }
  }, [ekadashiFromRoute, ekadashiList, ekadashiDateString]);

  useEffect(() => {
    
    const shouldFetch =
      lastFetchedRef.current.date !== ekadashiDateString ||
      lastFetchedRef.current.lat !== locationLat ||
      lastFetchedRef.current.lon !== locationLon;

    if (!shouldFetch) {
      return;
    }

    const fetchPanchang = async () => {
      try {
        const { getPanchangData } = require("../services/api");
        
        const locationData =
          locationLat && locationLon
            ? { latitude: locationLat, longitude: locationLon }
            : null;
        const data = await getPanchangData(ekadashiDateString, locationData);

        lastFetchedRef.current = {
          date: ekadashiDateString,
          lat: locationLat,
          lon: locationLon,
        };

        setPanchangData(data);
      } catch (error) {
        console.error("Error fetching panchang:", error);
      }
    };
    fetchPanchang();
  }, [ekadashiDateString, locationLat, locationLon]);

  const handleBhajanPress = (bhajan) => {
    setActiveBhajan(bhajan);
    setBhajanModalVisible(true);
  };

  const handleBhajanChange = (bhajan) => {
    setActiveBhajan(bhajan);
  };

  const handleRecipePress = (recipe) => {
    setActiveRecipe(recipe);
    setRecipeModalVisible(true);
  };

  const formattedDate = ekadashiDate.format("dddd D MMMM");
  const ekadashiName = ekadashi?.name || ekadashi?.ekadashi_name || "Ekadashi";

  const Header = () => (
    <View
      style={[
        styles.header,
        { borderBottomColor: colors.border, backgroundColor: colors.card },
      ]}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation?.goBack()}
      >
        <AppIcon name="arrow-left" size={24} color={colors.foreground} />
      </TouchableOpacity>
      <View>
        <ThemedText
          type="subtitle"
          style={[styles.mainTitle, { color: colors.foreground }]}
        >
          {ekadashiName}
        </ThemedText>
        <ThemedText
          type="small"
          style={[styles.subtitle, { color: colors.mutedForeground }]}
        >
          {formattedDate}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <SignificanceSection
          onLearnMore={() => setSignificanceModalVisible(true)}
          ekadashi={ekadashi}
          colors={colors}
        />
        <StorySection
          onReadStory={() => setStoryModalVisible(true)}
          ekadashi={ekadashi}
          colors={colors}
        />
        <VrataRulesSection ekadashi={ekadashi} colors={colors} />
        <TimingsSection panchangData={panchangData} ekadashiDate={ekadashiDate} ekadashi={ekadashi} colors={colors} />
        <BhajansSection
          onBhajanPress={handleBhajanPress}
          bhajans={getAllBhajans().slice(0, 3)}
          colors={colors}
        />
        <RecipesSection onRecipePress={handleRecipePress} colors={colors} />
        <FastingGuideSection colors={colors} isDark={isDark} />
        <View style={{ height: 40 }} />
      </ScrollView>

      <SignificanceModal
        isVisible={isSignificanceModalVisible}
        onClose={() => setSignificanceModalVisible(false)}
        colors={colors}
        isDark={isDark}
      />
      <StoryModal
        isVisible={isStoryModalVisible}
        onClose={() => setStoryModalVisible(false)}
        ekadashi={ekadashi}
        colors={colors}
        isDark={isDark}
      />
      <BhajanModal
        isVisible={isBhajanModalVisible}
        onClose={() => setBhajanModalVisible(false)}
        selectedBhajan={activeBhajan}
        onBhajanChange={handleBhajanChange}
        colors={colors}
        isDark={isDark}
      />
      <RecipeModal
        isVisible={isRecipeModalVisible}
        onClose={() => setRecipeModalVisible(false)}
        recipe={activeRecipe}
        colors={colors}
        isDark={isDark}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    paddingRight: 15,
  },
  mainTitle: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 14,
  },
  cardContainer: {
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 20,
  },
  cardContent: {
    paddingTop: 5,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 15,
  },
  readButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  readButtonText: {
    fontSize: 14,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  ruleNumberCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginTop: 2,
  },
  ruleNumberText: {
    fontSize: 12,
  },
  ruleText: {
    flex: 1,
    fontSize: 15,
  },
  timingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  timingItem: {
    width: SCREEN_WIDTH / 2 - 32 - 8,
  },
  timingLabel: {
    fontSize: 15,
    marginBottom: 4,
  },
  timingValue: {
    fontSize: 16,
  },
  bhajanButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 6,
  },
  bhajanIcon: {
    marginRight: 10,
  },
  bhajanTextContainer: {
    flex: 1,
  },
  bhajanText: {
    fontSize: 15,
  },
  bhajanArtist: {
    fontSize: 12,
    marginTop: 2,
  },
  recipeItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 6,
  },
  recipeName: {
    fontSize: 16,
  },
  recipeDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  storyModalContainer: {
    flex: 1,
    borderRadius: 12,
    margin: 10,
    marginTop: Platform.OS === "ios" ? 50 : 20,
    overflow: "hidden",
  },
  storyModalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    marginLeft: 8,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  modalContentHeading: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 15,
  },
  modalSubHeading: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 12,
    fontWeight: "600",
  },
  infoBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 10,
  },
  modalContentText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  bhajanModalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
    maxHeight: Dimensions.get("window").height * 0.8,
  },
  bhajanHandle: {
    width: 40,
    height: 5,
    borderRadius: 5,
    alignSelf: "center",
    marginVertical: 8,
  },
  webviewContainer: {
    height: 200,
    backgroundColor: "#000",
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 15,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 14,
  },
  devotionalText: {
    fontSize: 14,
    textAlign: "center",
    marginVertical: 15,
  },
  bhajanListFooter: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  footerBhajanButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    margin: 5,
  },
  activeFooterBhajanButton: {},
  footerBhajanText: {
    fontSize: 14,
  },
  activeFooterBhajanText: {
    color: "white",
  },
  
  fastingTypeCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
  },
  fastingTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  listCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  gridList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  faqContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  faqContent: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'transparent', 
    paddingTop: 15,
  },
});

export default CalendarDayDetails;
