import { Feather, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { vishnuAvatars } from "../data/vishnuAvatars";
import { supabase } from "../utils/supabase";
import { ThemedText } from "./ThemedText";

const { width } = Dimensions.get("window");

const AvatarSelector = ({ visible, onClose, onSelect, currentAvatarUrl, userId }) => {
    const { colors, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('preset');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState(null);

    const handleFileUpload = async (type) => {
        try {
            let result;
            if (type === 'camera') {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                    alert('Camera permissions are required!');
                    return;
                }
                result = await ImagePicker.launchCameraAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                });
            } else {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Media library permissions are required!');
                    return;
                }
                result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
                });
            }

            if (!result.canceled && result.assets && result.assets.length > 0) {
                uploadAvatar(result.assets[0]);
            }
        } catch (error) {
            console.error("Error picking image:", error);
        }
    };

    const uploadAvatar = async (asset) => {
        if (!userId) return;
        setUploading(true);

        try {
            const fileExt = asset.uri.split('.').pop();
            const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;

            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri,
                name: fileName,
                type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
            });

            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();

            const { data, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, arrayBuffer, {
                    contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
                    upsert: true
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);

            const urlWithBuster = `${publicUrl}?t=${Date.now()}`;

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: urlWithBuster })
                .eq('user_id', userId);

            await supabase.auth.updateUser({
                data: { avatar_url: urlWithBuster }
            });

            onSelect(urlWithBuster);
            onClose();
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload avatar: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handlePresetSave = async () => {
        if (!selectedPreset || !userId) return;
        setSaving(true);
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: selectedPreset })
                .eq('user_id', userId);

            if (updateError) throw updateError;

            await supabase.auth.updateUser({
                data: { avatar_url: selectedPreset }
            });

            onSelect(selectedPreset);
            onClose();
        } catch (error) {
            console.error("Error saving preset:", error);
            alert("Failed to save avatar");
        } finally {
            setSaving(false);
        }
    };

    const renderPresetItem = ({ item }) => {
        const isSelected = selectedPreset === item.url;
        return (
            <TouchableOpacity
                style={[styles.presetCard, isSelected && { borderColor: colors.primary, borderWidth: 2 }]}
                onPress={() => setSelectedPreset(item.url)}
            >
                <Image source={{ uri: item.url }} style={styles.presetImage} />
                {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                )}
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
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <ThemedText type="subtitle">Choose Avatar</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.mutedForeground} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'preset' && styles.activeTab]}
                            onPress={() => setActiveTab('preset')}
                        >
                            <ThemedText style={[styles.tabText, activeTab === 'preset' && { color: colors.primary }]}>Presets</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
                            onPress={() => setActiveTab('upload')}
                        >
                            <ThemedText style={[styles.tabText, activeTab === 'upload' && { color: colors.primary }]}>Upload</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'preset' ? (
                        <View style={{ flex: 1 }}>
                            <FlatList
                                data={vishnuAvatars}
                                renderItem={renderPresetItem}
                                keyExtractor={item => item.id}
                                numColumns={3}
                                contentContainerStyle={styles.grid}
                                showsVerticalScrollIndicator={false}
                            />
                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[styles.applyBtn, { backgroundColor: colors.primary }, !selectedPreset && { opacity: 0.5 }]}
                                    onPress={handlePresetSave}
                                    disabled={!selectedPreset || saving}
                                >
                                    {saving ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.applyBtnText}>Apply Avatar</ThemedText>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.uploadContainer}>
                            <View style={styles.previewContainer}>
                                <Image
                                    source={{ uri: currentAvatarUrl || 'https://via.placeholder.com/150' }}
                                    style={styles.previewImage}
                                />
                                {uploading && (
                                    <View style={styles.uploadLoader}>
                                        <ActivityIndicator size="large" color={colors.primary} />
                                    </View>
                                )}
                            </View>

                            <TouchableOpacity
                                style={[styles.uploadOption, { backgroundColor: isDark ? colors.card : '#f8fafc' }]}
                                onPress={() => handleFileUpload('library')}
                            >
                                <View style={[styles.optionIcon, { backgroundColor: '#dbeafe' }]}>
                                    <Feather name="image" size={24} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="defaultSemiBold">Gallery</ThemedText>
                                    <ThemedText type="small" style={{ color: colors.mutedForeground }}>Choose from your photos</ThemedText>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.uploadOption, { backgroundColor: isDark ? colors.card : '#f8fafc' }]}
                                onPress={() => handleFileUpload('camera')}
                            >
                                <View style={[styles.optionIcon, { backgroundColor: '#fef3c7' }]}>
                                    <Feather name="camera" size={24} color="#d97706" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <ThemedText type="defaultSemiBold">Camera</ThemedText>
                                    <ThemedText type="small" style={{ color: colors.mutedForeground }}>Take a new photo</ThemedText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const getStyles = (colors, isDark) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end'
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '80%',
        paddingTop: 20
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: 20
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border + '40'
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent'
    },
    activeTab: {
        borderBottomColor: colors.primary
    },
    tabText: {
        fontWeight: '600',
        color: colors.mutedForeground
    },
    grid: {
        paddingHorizontal: 16,
        paddingBottom: 20
    },
    presetCard: {
        width: (width - 64) / 3,
        aspectRatio: 1,
        margin: 8,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent'
    },
    presetImage: {
        width: '100%',
        height: '100%'
    },
    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff'
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: colors.border + '40'
    },
    applyBtn: {
        height: 54,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },
    applyBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700'
    },
    uploadContainer: {
        padding: 24,
        alignItems: 'center'
    },
    previewContainer: {
        marginBottom: 32,
        position: 'relative'
    },
    previewImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: colors.primary + '20'
    },
    uploadLoader: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(255,255,255,0.7)',
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center'
    },
    uploadOption: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border + '40'
    },
    optionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16
    }
});

export default AvatarSelector;
