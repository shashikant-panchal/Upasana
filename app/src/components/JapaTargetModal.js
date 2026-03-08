import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

const TARGET_STORAGE_KEY = '@japa-target';

const SACRED_TARGETS = [
    { value: 108, label: '108', description: 'Full Mala' },
    { value: 54, label: '54', description: 'Half Mala' },
    { value: 27, label: '27', description: 'Quarter Mala' },
    { value: 21, label: '21', description: 'Triple 7' },
    { value: 18, label: '18', description: 'Gita chapters' },
    { value: 16, label: '16', description: 'Shodasha' },
    { value: 11, label: '11', description: 'Ekadashi' },
    { value: 9, label: '9', description: 'Navagraha' },
    { value: 7, label: '7', description: 'Sapta' },
    { value: 3, label: '3', description: 'Trimurti' },
    { value: 1, label: '1', description: 'Ekam' },
];

export const loadSavedTarget = async () => {
    try {
        const saved = await AsyncStorage.getItem(TARGET_STORAGE_KEY);
        if (saved) {
            const value = parseInt(saved, 10);
            return isNaN(value) ? null : value;
        }
        return null;
    } catch {
        return null;
    }
};

const JapaTargetModal = ({ visible, onClose, currentTarget, currentCount, onTargetChange }) => {
    const { colors, isDark } = useTheme();
    const [selectedValue, setSelectedValue] = useState(currentTarget);
    const [customInput, setCustomInput] = useState('');

    useEffect(() => {
        if (visible) {
            setSelectedValue(currentTarget);
            setCustomInput('');
        }
    }, [visible, currentTarget]);

    const handleSelect = async (value) => {
        await Haptics.selectionAsync();
        setSelectedValue(value);
        setCustomInput('');
    };

    const handleCustomChange = (text) => {
        setCustomInput(text);
        const num = parseInt(text, 10);
        if (!isNaN(num) && num > 0 && num <= 1000) {
            setSelectedValue(num);
        } else if (text === '') {
            setSelectedValue(null);
        }
    };

    const handleSave = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (selectedValue) {
            await AsyncStorage.setItem(TARGET_STORAGE_KEY, selectedValue.toString());
        } else {
            await AsyncStorage.removeItem(TARGET_STORAGE_KEY);
        }
        onTargetChange(selectedValue);
        onClose();
    };

    const handleClear = async () => {
        await Haptics.selectionAsync();
        await AsyncStorage.removeItem(TARGET_STORAGE_KEY);
        setSelectedValue(null);
        setCustomInput('');
        onTargetChange(null);
        onClose();
    };

    const styles = getStyles(colors, isDark);

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.overlay}
            >
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

                <View style={styles.sheetContainer}>
                    <View style={styles.sheet}>
                        {}
                        <View style={styles.handle} />

                        {}
                        <View style={styles.header}>
                            <MaterialCommunityIcons name="target" size={22} color={colors.secondary} />
                            <ThemedText type="subtitle" style={styles.headerTitle}>Set Japa Target</ThemedText>
                        </View>
                        <ThemedText style={styles.subtitle} type="small">
                            Choose a sacred number or enter your own count
                        </ThemedText>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            style={{ maxHeight: 400 }}
                            contentContainerStyle={{ paddingBottom: 20 }}
                            keyboardShouldPersistTaps="handled"
                        >
                            {}
                            <View style={styles.grid}>
                                {SACRED_TARGETS.map((item) => {
                                    const isSelected = selectedValue === item.value;
                                    return (
                                        <TouchableOpacity
                                            key={item.value}
                                            style={[styles.gridItem, isSelected && styles.gridItemSelected]}
                                            onPress={() => handleSelect(item.value)}
                                            activeOpacity={0.7}
                                        >
                                            {isSelected && (
                                                <Feather
                                                    name="check"
                                                    size={12}
                                                    color={colors.secondary}
                                                    style={styles.checkIcon}
                                                />
                                            )}
                                            <ThemedText
                                                style={[styles.gridNumber, isSelected && { color: colors.secondary }]}
                                            >
                                                {item.label}
                                            </ThemedText>
                                            <ThemedText type="small" style={styles.gridDesc}>{item.description}</ThemedText>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {}
                            <View style={styles.customSection}>
                                <ThemedText type="small" style={{ color: colors.mutedForeground, marginBottom: 8 }}>
                                    Or enter custom target (1–1000)
                                </ThemedText>
                                <TextInput
                                    style={[styles.customInput, { color: colors.foreground, borderColor: customInput ? colors.secondary : colors.border }]}
                                    placeholder="Enter your target..."
                                    placeholderTextColor={colors.mutedForeground}
                                    value={customInput}
                                    onChangeText={handleCustomChange}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    returnKeyType="done"
                                />
                            </View>

                            {}
                            {selectedValue ? (
                                <View style={styles.preview}>
                                    <ThemedText type="small" style={{ color: colors.mutedForeground }}>Your target</ThemedText>
                                    <ThemedText type="heading" style={[styles.previewNumber, { color: colors.secondary }]}>
                                        {selectedValue}
                                    </ThemedText>
                                    <ThemedText type="small" style={{ color: colors.mutedForeground }}>
                                        {SACRED_TARGETS.find((t) => t.value === selectedValue)?.description || 'Custom target'}
                                    </ThemedText>
                                </View>
                            ) : null}
                        </ScrollView>

                        {}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.btn, styles.clearBtn]} onPress={handleClear}>
                                <ThemedText style={{ color: colors.mutedForeground }}>Clear Target</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { padding: 0, overflow: 'hidden' }]} onPress={handleSave}>
                                <LinearGradient
                                    colors={[colors.secondary, '#d97706']}
                                    style={styles.saveBtnGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Set Target</ThemedText>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const getStyles = (colors, isDark) =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            justifyContent: 'flex-end',
        },
        backdrop: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        sheetContainer: {
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
        sheet: {
            paddingHorizontal: 20,
            paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        },
        handle: {
            alignSelf: 'center',
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            marginTop: 12,
            marginBottom: 16,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginBottom: 4,
        },
        headerTitle: {
            fontSize: 18,
        },
        subtitle: {
            color: colors.mutedForeground,
            marginBottom: 16,
        },
        grid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 16,
        },
        gridItem: {
            width: '30.5%',
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: isDark ? colors.card : '#f8f8f8',
            alignItems: 'center',
            position: 'relative',
        },
        gridItemSelected: {
            borderColor: colors.secondary,
            backgroundColor: isDark
                ? colors.secondary + '25'
                : colors.secondary + '15',
        },
        checkIcon: {
            position: 'absolute',
            top: 6,
            right: 6,
        },
        gridNumber: {
            fontSize: 22,
            fontWeight: '600',
            color: colors.foreground,
        },
        gridDesc: {
            fontSize: 9,
            color: colors.mutedForeground,
            textAlign: 'center',
            marginTop: 2,
        },
        customSection: {
            marginBottom: 12,
        },
        customInput: {
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            fontSize: 18,
            textAlign: 'center',
            backgroundColor: isDark ? colors.card : '#fafafa',
        },
        preview: {
            alignItems: 'center',
            backgroundColor: isDark ? colors.card : colors.secondary + '10',
            borderRadius: 16,
            paddingVertical: 16,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.secondary + '30',
        },
        previewNumber: {
            fontSize: 40,
            fontWeight: 'bold',
            marginVertical: 4,
        },
        buttonRow: {
            flexDirection: 'row',
            gap: 12,
            marginTop: 16,
        },
        btn: {
            flex: 1,
            borderRadius: 30,
        },
        clearBtn: {
            backgroundColor: isDark ? colors.card : '#f0f0f0',
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
        },
        saveBtnGradient: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 14,
            borderRadius: 30,
        },
    });

export default JapaTargetModal;
