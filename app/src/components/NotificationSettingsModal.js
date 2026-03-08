import { Feather, Ionicons } from '@expo/vector-icons';

import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';
const { width, height } = Dimensions.get("window");
const dw = width / 100;
const dh = height / 100;

import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

import NotificationService from '../services/NotificationService';
import { ThemedText } from './ThemedText';

const DAYS = [
    { key: 'sun', label: 'S', fullLabel: 'Sunday' },
    { key: 'mon', label: 'M', fullLabel: 'Monday' },
    { key: 'tue', label: 'T', fullLabel: 'Tuesday' },
    { key: 'wed', label: 'W', fullLabel: 'Wednesday' },
    { key: 'thu', label: 'T', fullLabel: 'Thursday' },
    { key: 'fri', label: 'F', fullLabel: 'Friday' },
    { key: 'sat', label: 'S', fullLabel: 'Saturday' },
];

const NOTIFICATION_SOUNDS = [
    { id: 'default', name: 'Default', description: 'System default sound' },
    { id: 'temple_bell', name: 'Temple Bell', description: 'Traditional bell' },
    { id: 'om_chant', name: 'Om Chant', description: 'Sacred Om sound' },
    { id: 'conch_shell', name: 'Conch Shell', description: 'Shankha sound' },
    { id: 'silent', name: 'Silent', description: 'Vibration only' },
];

const REMINDER_TYPES = [
    {
        id: 'ekadashi',
        title: 'Ekadashi Reminder',
        description: 'Get notified before each Ekadashi',
        icon: '🌙',
        key: 'ekadashi_reminders'
    },
    {
        id: 'morning',
        title: 'Morning Sadhana',
        description: 'Daily morning spiritual practice reminder',
        icon: '🌅',
        key: 'morning_reminders'
    },
    {
        id: 'parana',
        title: 'Parana Time',
        description: 'Reminder to break your Ekadashi fast',
        icon: '🍽️',
        key: 'parana_reminders'
    },
    {
        id: 'japa',
        title: 'Japa Reminder',
        description: 'Daily japa meditation reminder',
        icon: '📿',
        key: 'japa_reminders'
    },
];

const NotificationSettingsModal = ({ visible, onClose, preferences, userId, onSave }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);
    const [localPrefs, setLocalPrefs] = useState(preferences);

    const [showTimePicker, setShowTimePicker] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setLocalPrefs(preferences);
    }, [preferences, visible]);

    const handleUpdatePref = (key, value) => {
        setLocalPrefs(prev => ({ ...prev, [key]: value }));
        setHasChanges(true);
    };

    const handleDayToggle = (day) => {
        const newDays = localPrefs.repeat_days.includes(day)
            ? localPrefs.repeat_days.filter(d => d !== day)
            : [...localPrefs.repeat_days, day];
        handleUpdatePref('repeat_days', newDays);
    };

    const handleSave = async () => {
        try {
            await NotificationService.updatePreferences(userId, localPrefs);
            onSave(localPrefs);
            onClose();
        } catch (error) {
            console.error('Error saving notification settings:', error);
        }
    };

    const formatTime = (time) => {
        return moment(time, 'HH:mm').format('hh:mm A');
    };

    return (
        <Modal
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
            presentationStyle="pageSheet"
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>

                    {}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                            <Ionicons name="close" size={24} color={colors.foreground} />
                        </TouchableOpacity>
                        <ThemedText type="defaultSemiBold" style={styles.headerTitle}>
                            Notification Settings
                        </ThemedText>
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={!hasChanges}
                            style={styles.headerBtn}
                        >
                            <ThemedText
                                style={{ color: hasChanges ? colors.primary : colors.mutedForeground }}
                            >
                                Save
                            </ThemedText>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        {}
                        {!localPrefs.push_enabled && (
                            <View style={[styles.banner, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
                                <View style={[styles.bannerIcon, { backgroundColor: colors.primary + '20' }]}>
                                    <Ionicons name="notifications" size={20} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <ThemedText style={styles.bannerTitle}>Enable Push Notifications</ThemedText>

                                    <ThemedText type="small" style={{ color: colors.mutedForeground }}>
                                        Get real-time reminders for Ekadashi, Parana times, and daily sadhana
                                    </ThemedText>
                                    <TouchableOpacity
                                        style={[styles.enableBtn, { backgroundColor: colors.primary }]}
                                        onPress={async () => {
                                            const granted = await NotificationService.requestPermission();
                                            if (granted) {
                                                await NotificationService.initialize(userId);
                                                handleUpdatePref('push_enabled', true);
                                            }
                                        }}
                                    >
                                        <ThemedText style={styles.enableBtnText}>Enable Notifications</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {}

                        <View style={styles.section}>
                            <ThemedText type="small" style={styles.sectionTitle}>REMINDER TYPES</ThemedText>
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {REMINDER_TYPES.map((reminder, index) => (
                                    <View
                                        key={reminder.id}
                                        style={[
                                            styles.row,
                                            index !== REMINDER_TYPES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                                        ]}
                                    >
                                        <View style={styles.rowLeft}>
                                            <ThemedText style={{ fontSize: 24, marginRight: 12 }}>{reminder.icon}</ThemedText>
                                            <View>
                                                <ThemedText style={styles.label}>{reminder.title}</ThemedText>
                                                <ThemedText style={styles.subLabel}>{reminder.description}</ThemedText>
                                            </View>

                                        </View>
                                        <Switch
                                            trackColor={{ false: colors.muted, true: colors.primary }}
                                            thumbColor="#fff"
                                            value={localPrefs[reminder.key]}
                                            onValueChange={(value) => handleUpdatePref(reminder.key, value)}
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>

                        {}
                        <View style={styles.section}>
                            <ThemedText type="small" style={styles.sectionTitle}>NOTIFICATION TIME</ThemedText>
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <TouchableOpacity
                                    style={styles.row}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <View>
                                        <ThemedText style={styles.label}>Alarm time</ThemedText>
                                        <ThemedText style={styles.subLabel}>Daily reminder time</ThemedText>
                                    </View>

                                    <View style={[styles.timeDisplay, { backgroundColor: colors.muted }]}>
                                        <ThemedText type="defaultSemiBold">{formatTime(localPrefs.notification_time)}</ThemedText>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {}
                        <View style={styles.section}>
                            <ThemedText type="small" style={styles.sectionTitle}>NOTIFICATION SOUND</ThemedText>
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {NOTIFICATION_SOUNDS.map((sound, index) => (
                                    <TouchableOpacity
                                        key={sound.id}
                                        style={[
                                            styles.row,
                                            index !== NOTIFICATION_SOUNDS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                                            localPrefs.notification_sound === sound.id && { backgroundColor: colors.primary + '10' }
                                        ]}
                                        onPress={() => handleUpdatePref('notification_sound', sound.id)}
                                    >
                                        <View style={styles.rowLeft}>
                                            <Feather name="volume-2" size={20} color={colors.mutedForeground} style={{ marginRight: 12 }} />

                                            <View>
                                                <ThemedText style={styles.label}>{sound.name}</ThemedText>
                                                <ThemedText style={styles.subLabel}>{sound.description}</ThemedText>
                                            </View>

                                        </View>
                                        {localPrefs.notification_sound === sound.id && (
                                            <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                                                <Ionicons name="checkmark" size={14} color="#fff" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {}
                        <View style={styles.section}>
                            <ThemedText type="small" style={styles.sectionTitle}>REPEAT SCHEDULE</ThemedText>
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 16 }]}>
                                <View style={[styles.row, { padding: 0, marginBottom: 16 }]}>
                                    <View>
                                        <ThemedText style={styles.label}>
                                            Repeat alarm {localPrefs.repeat_enabled ? 'ON' : 'OFF'}
                                        </ThemedText>
                                        <ThemedText style={styles.subLabel}>Enable recurring notifications</ThemedText>
                                    </View>

                                    <Switch
                                        trackColor={{ false: colors.muted, true: colors.primary }}
                                        thumbColor="#fff"
                                        value={localPrefs.repeat_enabled}
                                        onValueChange={(value) => handleUpdatePref('repeat_enabled', value)}
                                    />
                                </View>

                                {localPrefs.repeat_enabled && (
                                    <View style={[styles.dayContainer, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}>

                                        <View style={styles.daysGrid}>
                                            {DAYS.map((day) => (
                                                <TouchableOpacity
                                                    key={day.key}
                                                    style={[
                                                        styles.dayButton,
                                                        { backgroundColor: localPrefs.repeat_days.includes(day.key) ? colors.primary : colors.muted }
                                                    ]}
                                                    onPress={() => handleDayToggle(day.key)}
                                                >
                                                    <ThemedText
                                                        style={{
                                                            color: localPrefs.repeat_days.includes(day.key) ? '#fff' : colors.mutedForeground,
                                                            fontSize: 14,
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {day.label}
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        <ThemedText type="small" style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 12 }}>
                                            Deselect to OFF the alarm on a particular day
                                        </ThemedText>
                                    </View>
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, { backgroundColor: colors.primary }]}
                            onPress={handleSave}
                        >
                            <ThemedText style={styles.saveButtonText}>Save Settings</ThemedText>
                        </TouchableOpacity>
                    </ScrollView>

                    {showTimePicker && (
                        <DateTimePicker
                            value={moment(localPrefs.notification_time, 'HH:mm').toDate()}
                            mode="time"
                            is24Hour={false}
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={(event, selectedDate) => {
                                setShowTimePicker(Platform.OS === 'ios');
                                if (selectedDate) {
                                    handleUpdatePref('notification_time', moment(selectedDate).format('HH:mm'));
                                }
                            }}
                        />
                    )}
                </View>
            </SafeAreaView>
        </Modal>

    );
};

const getStyles = (colors) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    headerBtn: {
        padding: 4,
        minWidth: 44,
    },
    headerTitle: {
        fontSize: 18,
        flex: 1,
        textAlign: 'center',
    },
    scrollContent: {
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 4 * dw,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 1.5 * dw,
        color: colors.foreground,
    },

    card: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeDisplay: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    checkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dayContainer: {
        paddingTop: 16,
    },
    daysGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dayButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 32,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    banner: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    bannerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    bannerTitle: {
        fontSize: 4 * dw,
        fontWeight: '600',
        color: colors.foreground,
    },

    enableBtn: {
        marginTop: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    enableBtnText: {
        color: '#fff',
        fontSize: 3.5 * dw,
        fontWeight: '600',
    },
    label: {
        fontSize: 3.8 * dw,
        fontWeight: "500",
        color: colors.foreground,
    },
    subLabel: {
        fontSize: 3.3 * dw,
        color: colors.mutedForeground,
    },
});

export default NotificationSettingsModal;
