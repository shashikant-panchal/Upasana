import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { mantrasList } from "../data/bhajansData";
import { ThemedText } from "./ThemedText";

const MANTRA_STORAGE_KEY = "@custom_mantras";

const MantraSelectionModal = ({ visible, onClose, onSelect, currentMantra }) => {
    const { colors, isDark } = useTheme();
    const [customMantras, setCustomMantras] = useState([]);
    const [newMantra, setNewMantra] = useState("");
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);

    useEffect(() => {
        loadCustomMantras();
    }, []);

    const loadCustomMantras = async () => {
        try {
            const stored = await AsyncStorage.getItem(MANTRA_STORAGE_KEY);
            if (stored) {
                setCustomMantras(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Error loading mantras", error);
        }
    };

    const saveCustomMantra = async () => {
        if (!newMantra.trim()) return;

        const newMantraObj = {
            id: `custom_${Date.now()}`,
            name: newMantra,
            isCustom: true,
        };

        const updated = [...customMantras, newMantraObj];
        setCustomMantras(updated);
        setNewMantra("");
        setIsAddModalVisible(false);

        try {
            await AsyncStorage.setItem(MANTRA_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error("Error saving mantra", error);
        }
    };

    const deleteCustomMantra = async (id) => {
        const updated = customMantras.filter((m) => m.id !== id);
        setCustomMantras(updated);
        try {
            await AsyncStorage.setItem(MANTRA_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error("Error deleting mantra", error);
        }
    };

    const renderMantraItem = ({ item }) => {
        const isSelected = currentMantra?.name === item.name;

        return (
            <TouchableOpacity
                style={[
                    styles.mantraItem,
                    {
                        backgroundColor: isSelected ? colors.primary + "10" : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                    },
                ]}
                onPress={() => onSelect(item)}
            >
                <View style={styles.mantraContent}>
                    <ThemedText
                        type={isSelected ? "defaultSemiBold" : "default"}
                        style={[styles.mantraName, { color: colors.foreground }]}
                    >
                        {item.name}
                    </ThemedText>
                    {item.sanskrit && (
                        <ThemedText
                            type="devanagari"
                            style={[styles.mantraSanskrit, { color: colors.mutedForeground }]}
                        >
                            {item.sanskrit.split("\n")[0]}...
                        </ThemedText>
                    )}
                </View>
                <View style={styles.actionContainer}>
                    {isSelected && (
                        <Feather name="check" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                    )}
                    {item.isCustom && (
                        <TouchableOpacity onPress={() => deleteCustomMantra(item.id)}>
                            <Feather name="trash-2" size={20} color={colors.destructive} />
                        </TouchableOpacity>
                    )}

                </View>
            </TouchableOpacity>
        );
    };

    const styles = getStyles(colors, isDark);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ width: '100%', justifyContent: 'flex-end' }}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <ThemedText type="subtitle" style={{ color: colors.foreground }}>Choose Your Mantra</ThemedText>
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color={colors.mutedForeground} />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            showsVerticalScrollIndicator={false}
                            data={[...mantrasList, ...customMantras]}
                            renderItem={renderMantraItem}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={styles.listContainer}
                            ListHeaderComponent={
                                <ThemedText style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                                    TRADITIONAL MANTRAS
                                </ThemedText>
                            }
                        />

                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setIsAddModalVisible(true)}
                            >
                                <View style={styles.addIconBg}>
                                    <Feather name="plus" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.addTextContainer}>
                                    <ThemedText type="defaultSemiBold" style={{ color: colors.primary }}>Add Custom Mantra</ThemedText>
                                    <ThemedText type="small" style={{ color: colors.mutedForeground }}>Create your personal prayer</ThemedText>
                                </View>
                                <Feather name="chevron-right" size={20} color={colors.primary} style={{ opacity: 0.5 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>

            {}
            <Modal
                visible={isAddModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <View style={styles.addModalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ width: '100%', alignItems: 'center' }}
                    >
                        <View style={styles.addInputContainer}>
                            <View style={styles.addHeader}>
                                <ThemedText type="subtitle">New Custom Mantra</ThemedText>
                                <TouchableOpacity onPress={() => setIsAddModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={colors.mutedForeground} />
                                </TouchableOpacity>
                            </View>

                            <TextInput
                                style={[styles.input, { color: colors.foreground, borderColor: colors.primary }]}
                                placeholder="Type your mantra here..."
                                placeholderTextColor={colors.mutedForeground}
                                value={newMantra}
                                onChangeText={setNewMantra}
                                multiline
                                autoFocus
                            />

                            <View style={styles.addActions}>
                                <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.cancelBtn}>
                                    <ThemedText style={{ color: colors.mutedForeground }}>Cancel</ThemedText>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={saveCustomMantra}
                                    style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: newMantra.trim() ? 1 : 0.5 }]}
                                    disabled={!newMantra.trim()}
                                >
                                    <ThemedText style={{ color: colors.primaryForeground }}>Save Mantra</ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
        </Modal>
    );
};

const getStyles = (colors, isDark) =>
    StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "flex-end",
        },
        addModalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            padding: 20,
        },
        addInputContainer: {
            width: '100%',
            backgroundColor: colors.card,
            padding: 20,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
        },
        addHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        modalContent: {
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "85%",
            paddingTop: 20,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 20,
            marginBottom: 20,
        },
        listContainer: {
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        sectionTitle: {
            fontSize: 12,
            marginBottom: 10,
            marginTop: 10,
        },
        mantraItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            marginBottom: 10,
        },
        mantraContent: {
            flex: 1,
        },
        mantraName: {
            fontSize: 16,
            marginBottom: 4,
        },
        mantraSanskrit: {
            fontSize: 14,
        },
        actionContainer: {
            flexDirection: 'row',
            alignItems: 'center'
        },
        footer: {
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border + '40',
            paddingBottom: Platform.OS === 'ios' ? 40 : 30,
            backgroundColor: colors.background,
        },
        addButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 18,
            borderRadius: 20,
            backgroundColor: isDark ? colors.primary + '08' : '#eff6ff',
            borderWidth: 1,
            borderColor: isDark ? colors.primary + '15' : colors.primary + '20',
            
            shadowColor: isDark ? 'transparent' : colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0 : 0.05,
            shadowRadius: 10,
            elevation: isDark ? 0 : 2,
        },
        addIconBg: {
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 15,
            backgroundColor: isDark ? colors.primary + '20' : '#dbeafe',
        },
        addTextContainer: {
            flex: 1
        },
        inputContainer: {
            width: '100%',
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: colors.border,
        },
        input: {
            borderWidth: 1,
            borderRadius: 14,
            padding: 14,
            fontSize: 16,
            minHeight: 80,
            textAlignVertical: 'top',
            marginBottom: 20,
            backgroundColor: colors.background,
        },
        addActions: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
        },
        cancelBtn: {
            padding: 12,
            flex: 1,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
        },
        saveBtn: {
            padding: 12,
            flex: 1.5,
            alignItems: 'center',
            borderRadius: 12,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
        }
    });

export default MantraSelectionModal;
