import {
    Feather,
    MaterialCommunityIcons
} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    ScrollView,
    Share,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import * as RoomService from '../services/japaRooms';
import { ThemedText } from './ThemedText';

const getInitial = (name) => (name || '?').charAt(0).toUpperCase();

const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatDuration = (startIso, endIso) => {
    if (!startIso || !endIso) return '';
    const mins = Math.round((new Date(endIso) - new Date(startIso)) / 60000);
    if (mins < 60) return `${mins} min`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

const rankEmoji = (i) => ['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`;

function RoomListView({ userId, onSelectRoom }) {
    const { colors, isDark } = useTheme();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [roomName, setRoomName] = useState('');
    const [roomDesc, setRoomDesc] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        const data = await RoomService.fetchUserRooms(userId);
        setRooms(data);
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        load();
    }, [load]);

    const handleCreate = async () => {
        if (!roomName.trim()) return;
        setSubmitting(true);
        const result = await RoomService.createRoom(userId, roomName.trim(), roomDesc.trim());
        setSubmitting(false);
        if (result.success) {
            setRoomName('');
            setRoomDesc('');
            setShowCreate(false);
            await load();
            onSelectRoom(result.room);
        } else {
            Alert.alert('Error', result.error || 'Failed to create room');
        }
    };

    const handleJoin = async () => {
        if (!inviteCode.trim()) return;
        setSubmitting(true);
        const result = await RoomService.joinRoom(userId, inviteCode.trim());
        setSubmitting(false);
        if (result.success) {
            setInviteCode('');
            setShowJoin(false);
            await load();
            onSelectRoom(result.room);
        } else {
            Alert.alert('Error', result.error || 'Invalid invite code');
        }
    };

    const s = getStyles(colors, isDark);

    return (
        <ScrollView contentContainerStyle={s.roomListContent} showsVerticalScrollIndicator={false}>
            {}
            <View style={s.roomActions}>
                <TouchableOpacity
                    style={s.roomActionBtnWrapper}
                    activeOpacity={0.8}
                    onPress={() => { setShowCreate(true); setShowJoin(false); }}
                >
                    <LinearGradient
                        colors={['#FF9800', '#FF8A00', '#F57C00']} 
                        style={[s.roomActionBtn, s.createBtn]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Feather name="plus" size={16} color="#fff" />
                        <ThemedText style={s.createBtnText}>Create Room</ThemedText>
                    </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[s.roomActionBtnWrapper, s.joinBtnWrapper, { borderColor: colors.primary }]}
                    activeOpacity={0.8}
                    onPress={() => { setShowJoin(true); setShowCreate(false); }}
                >
                    <View style={[s.roomActionBtn, s.joinBtn]}>
                        <Feather name="user-plus" size={16} color={colors.secondary} style={{ marginRight: 4 }} />
                        <ThemedText style={[s.joinBtnText, { color: colors.secondary }]}>Join Room</ThemedText>
                    </View>
                </TouchableOpacity>
            </View>

            {}
            {showCreate && (
                <View style={[s.formBox, { borderColor: colors.border }]}>
                    <TextInput
                        style={[s.formInput, { color: colors.foreground, borderColor: colors.border }]}
                        placeholder="Room name"
                        placeholderTextColor={colors.mutedForeground}
                        value={roomName}
                        onChangeText={setRoomName}
                        maxLength={40}
                    />
                    <TextInput
                        style={[s.formInput, { color: colors.foreground, borderColor: colors.border }]}
                        placeholder="Description (optional)"
                        placeholderTextColor={colors.mutedForeground}
                        value={roomDesc}
                        onChangeText={setRoomDesc}
                        maxLength={100}
                    />
                    <View style={s.formButtons}>
                        <TouchableOpacity
                            style={[s.formBtn, { backgroundColor: colors.secondary }]}
                            onPress={handleCreate}
                            disabled={!roomName.trim() || submitting}
                        >
                            <ThemedText style={{ color: '#fff' }}>{submitting ? 'Creating...' : 'Create'}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.formBtn, { backgroundColor: colors.card }]} onPress={() => setShowCreate(false)}>
                            <ThemedText style={{ color: colors.mutedForeground }}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {}
            {showJoin && (
                <View style={[s.formBox, { borderColor: colors.border }]}>
                    <TextInput
                        style={[s.formInput, { color: colors.foreground, borderColor: colors.border, letterSpacing: 4, textAlign: 'center', fontSize: 18 }]}
                        placeholder="Enter invite code"
                        placeholderTextColor={colors.mutedForeground}
                        value={inviteCode}
                        onChangeText={setInviteCode}
                        maxLength={10}
                        autoCapitalize="none"
                    />
                    <View style={s.formButtons}>
                        <TouchableOpacity
                            style={[s.formBtn, { backgroundColor: colors.secondary }]}
                            onPress={handleJoin}
                            disabled={!inviteCode.trim() || submitting}
                        >
                            <ThemedText style={{ color: '#fff' }}>{submitting ? 'Joining...' : 'Join'}</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.formBtn, { backgroundColor: colors.card }]} onPress={() => setShowJoin(false)}>
                            <ThemedText style={{ color: colors.mutedForeground }}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {}
            {loading ? (
                <ActivityIndicator size="small" color={colors.secondary} style={{ marginTop: 32 }} />
            ) : rooms.length === 0 ? (
                <View style={s.emptyState}>
                    <View style={[s.emptyIcon, { backgroundColor: colors.secondary + '15' }]}>
                        <Feather name="users" size={32} color={colors.secondary + '80'} />
                    </View>
                    <ThemedText style={{ color: colors.mutedForeground, marginTop: 8 }}>No rooms yet</ThemedText>
                    <ThemedText type="small" style={{ color: colors.mutedForeground, marginTop: 4, textAlign: 'center' }}>
                        Create a room or join one with an invite code
                    </ThemedText>
                </View>
            ) : (
                <>
                    <ThemedText type="small" style={[s.sectionLabel, { color: colors.mutedForeground }]}>YOUR ROOMS</ThemedText>
                    {rooms.map((room) => (
                        <TouchableOpacity
                            key={room.id}
                            style={[s.roomCard, { backgroundColor: isDark ? colors.card : '#fafafa', borderColor: colors.border + '50' }]}
                            onPress={() => onSelectRoom(room)}
                        >
                            <View style={[s.roomAvatar, { backgroundColor: colors.secondary }]}>
                                <ThemedText style={s.roomAvatarText}>{getInitial(room.name)}</ThemedText>
                            </View>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="defaultSemiBold">{room.name}</ThemedText>
                                {room.description ? (
                                    <ThemedText type="small" style={{ color: colors.mutedForeground }} numberOfLines={1}>
                                        {room.description}
                                    </ThemedText>
                                ) : null}
                            </View>
                            <Feather name="chevron-right" size={18} color={colors.mutedForeground + '60'} />
                        </TouchableOpacity>
                    ))}
                </>
            )}
        </ScrollView>
    );
}

import { LinearGradient } from 'expo-linear-gradient';

function RoomSessionView({ room, userId, onBack }) {
    const { colors, isDark } = useTheme();
    const [members, setMembers] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    const [counts, setCounts] = useState([]);
    const [pastSessions, setPastSessions] = useState([]);
    const [activeTab, setActiveTab] = useState('counter');
    const [showRipple, setShowRipple] = useState(false);
    const [loading, setLoading] = useState(true);

    const rippleAnim = useRef(new Animated.Value(0)).current;
    const rippleOpacity = useRef(new Animated.Value(0)).current;
    const countAnim = useRef(new Animated.Value(1)).current;
    const countsChannelRef = useRef(null);
    const sessionsChannelRef = useRef(null);

    const myCount = counts.find((c) => c.user_id === userId)?.rounds || 0;
    const totalCount = counts.reduce((sum, c) => sum + c.rounds, 0);
    const isOwner = room.created_by === userId;

    const getGradientColors = () => {
        return isDark
            ? ['rgba(120, 53, 15, 0.05)', 'rgba(124, 45, 18, 0.1)'] 
            : ['rgba(245, 158, 11, 0.03)', 'rgba(245, 158, 11, 0.06)']; 
    };

    const load = useCallback(async () => {
        setLoading(true);
        const [memberData, sessionData, pastData] = await Promise.all([
            RoomService.fetchRoomMembers(room.id),
            RoomService.fetchActiveRoomSession(room.id),
            RoomService.fetchPastRoomSessions(room.id),
        ]);
        setMembers(memberData);
        setActiveSession(sessionData);
        setPastSessions(pastData);
        if (sessionData) {
            const countData = await RoomService.fetchSessionCounts(sessionData.id);
            setCounts(countData);
        }
        setLoading(false);
    }, [room.id]);

    useEffect(() => {
        load();

        countsChannelRef.current = RoomService.subscribeToRoomCounts(room.id, (payload) => {
            if (payload.eventType === 'INSERT') {
                setCounts((prev) => {
                    if (prev.find((c) => c.id === payload.new.id)) return prev;
                    return [...prev, payload.new];
                });
            } else if (payload.eventType === 'UPDATE') {
                setCounts((prev) => prev.map((c) => (c.id === payload.new.id ? payload.new : c)));
            }
        });

        sessionsChannelRef.current = RoomService.subscribeToRoomSessions(room.id, () => {
            load();
        });

        return () => {
            RoomService.unsubscribeChannel(countsChannelRef.current);
            RoomService.unsubscribeChannel(sessionsChannelRef.current);
        };
    }, [room.id, load]);

    const triggerRipple = () => {
        rippleAnim.setValue(0);
        rippleOpacity.setValue(0.5);
        countAnim.setValue(1);
        Animated.parallel([
            Animated.sequence([
                Animated.timing(countAnim, { toValue: 1.15, duration: 100, useNativeDriver: true }),
                Animated.spring(countAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
            ]),
            Animated.timing(rippleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(rippleOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start();
    };

    const handleTap = async () => {
        if (!activeSession) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        triggerRipple();
        const result = await RoomService.incrementRoomCount(userId, activeSession.id, room.id, counts);
        if (result.success) {
            if (result.isNew) {
                setCounts((prev) => [...prev, result.count]);
            } else {
                setCounts((prev) => prev.map((c) => (c.id === result.count.id ? result.count : c)));
            }
        }
    };

    const handleUndo = async () => {
        if (myCount <= 0) return;
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const result = await RoomService.undoRoomCount(userId, activeSession.id, counts);
        if (result.success) {
            setCounts((prev) => prev.map((c) => (c.id === result.count.id ? result.count : c)));
        }
    };

    const handleStartSession = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const result = await RoomService.startRoomSession(userId, room.id);
        if (result.success) {
            setActiveSession(result.session);
            setCounts([]);
        }
    };

    const handleEndSession = async () => {
        Alert.alert('End Session', 'End the session for all members?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'End Session', style: 'destructive', onPress: async () => {
                    await RoomService.endRoomSession(activeSession.id);
                    setActiveSession(null);
                    const pastData = await RoomService.fetchPastRoomSessions(room.id);
                    setPastSessions(pastData);
                },
            },
        ]);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `🙏 Join my Japa room "${room.name}" on Ekadashi Din!\n\nInvite code: ${room.invite_code}\n\nLet's chant together! 📿`,
            });
        } catch (e) {
            console.error(e);
        }
    };

    const leaderboard = [...members]
        .map((m) => ({ ...m, rounds: counts.find((c) => c.user_id === m.user_id)?.rounds || 0 }))
        .sort((a, b) => b.rounds - a.rounds);

    const s = getStyles(colors, isDark);

    return (
        <View style={{ flex: 1 }}>
            {}
            <View style={s.roomSessionHeader}>
                <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
                    <Feather name="chevron-left" size={28} color={colors.primary} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginHorizontal: 8 }}>
                    <ThemedText style={{ fontSize: 20, fontWeight: '600', color: colors.primary }}>
                        {room.name}
                    </ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <ThemedText type="small" style={{ color: colors.accent, fontWeight: '500' }}>
                            {members.length} {members.length === 1 ? 'member' : 'members'}
                        </ThemedText>
                        <ThemedText type="small" style={{ color: colors.accent, fontWeight: '500' }}>·</ThemedText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Feather name="copy" size={12} color={colors.secondary} />
                            <ThemedText type="small" style={{ color: colors.secondary, fontWeight: '500' }}>
                                {room.invite_code}
                            </ThemedText>
                        </View>
                    </View>
                </View>
                <TouchableOpacity onPress={handleShare} style={{ padding: 4 }}>
                    <Feather name="share-2" size={24} color={colors.secondary} />
                </TouchableOpacity>
            </View>

            {}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.membersStrip} contentContainerStyle={s.membersContent}>
                {members.map((m) => {
                    const mCount = counts.find((c) => c.user_id === m.user_id)?.rounds || 0;
                    const isMe = m.user_id === userId;
                    
                    const avatarBg = isMe ? '#FCD34D' : '#FDE68A';
                    return (
                        <View key={m.id} style={s.memberBubble}>
                            <View style={s.memberAvatarWrap}>
                                <View style={[s.memberAvatar, { backgroundColor: avatarBg }]}>
                                    <ThemedText style={s.memberInitial}>{getInitial(m.display_name)}</ThemedText>
                                </View>
                                {m.role === 'owner' && (
                                    <View style={[s.crownBadge, { backgroundColor: colors.background }]}>
                                        <MaterialCommunityIcons name="crown" size={10} color="#F59E0B" />
                                    </View>
                                )}
                                {activeSession && (
                                    <View style={s.countBadge}>
                                        <ThemedText style={s.countBadgeText}>{mCount}</ThemedText>
                                    </View>
                                )}
                            </View>
                            <ThemedText style={[s.memberName, { color: isMe ? colors.accent : colors.primary }]} numberOfLines={1}>
                                {isMe ? 'You' : (m.display_name || 'Anonymous').split(' ')[0]}
                            </ThemedText>
                        </View>
                    );
                })}
            </ScrollView>

            {}
            <View style={s.tabBar}>
                {[
                    { key: 'counter', icon: 'account-group-outline', label: 'Counter' },
                    { key: 'leaderboard', icon: 'trophy-outline', label: 'Leaders' },
                    { key: 'history', icon: 'history', label: 'History' },
                ].map((tab) => {
                    const isActive = activeTab === tab.key;
                    const activeColor = isDark ? '#fff' : colors.primary;
                    const inactiveColor = colors.accent;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[s.tabItem, isActive && s.tabItemActive]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <MaterialCommunityIcons
                                name={tab.icon}
                                size={18}
                                color={isActive ? activeColor : inactiveColor}
                            />
                            <ThemedText
                                style={{
                                    color: isActive ? activeColor : inactiveColor,
                                    fontWeight: isActive ? '600' : '500',
                                    fontSize: 13,
                                }}
                            >
                                {tab.label}
                            </ThemedText>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {}
            {activeTab === 'counter' && (
                <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
                    {activeSession && (
                        <View style={[s.statsBar]}>
                            <View style={s.statItem}>
                                <ThemedText type="defaultSemiBold" style={[s.statNumber, { color: colors.foreground }]}>{myCount}</ThemedText>
                                <ThemedText type="small" style={s.statLabel}>YOUR ROUNDS</ThemedText>
                            </View>
                            <View style={s.statDivider} />
                            <View style={s.statItem}>
                                <ThemedText type="defaultSemiBold" style={[s.statNumber, { color: isDark ? '#FBBF24' : '#D97706' }]}>{totalCount}</ThemedText>
                                <ThemedText type="small" style={s.statLabel}>ROOM TOTAL</ThemedText>
                            </View>
                            <View style={s.statDivider} />
                            <View style={s.statItem}>
                                <ThemedText type="defaultSemiBold" style={[s.statNumber, { color: colors.foreground }]}>{members.length}</ThemedText>
                                <ThemedText type="small" style={s.statLabel}>MEMBERS</ThemedText>
                            </View>
                        </View>
                    )}

                    {activeSession ? (
                        <TouchableOpacity
                            style={s.tapAreaContainer}
                            onPress={handleTap}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={getGradientColors()}
                                style={[s.tapAreaInner, { borderColor: 'rgba(217, 119, 6, 0.2)' }]}
                            >
                                <Animated.View
                                    style={[s.ripple, {
                                        transform: [{ scale: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 2.5] }) }],
                                        opacity: rippleOpacity,
                                        backgroundColor: colors.secondary,
                                    }]}
                                />
                                <Animated.Text style={[s.bigCount, { transform: [{ scale: countAnim }], color: colors.foreground }]}>
                                    {myCount}
                                </Animated.Text>
                                <ThemedText style={{ color: colors.secondary + '80', fontSize: 16 }}>your rounds</ThemedText>
                                <View style={[s.totalPill, { backgroundColor: colors.secondary + '15' }]}>
                                    <Feather name="users" size={12} color={colors.secondary} />
                                    <ThemedText type="small" style={{ color: colors.secondary, marginLeft: 4 }}>{totalCount} total</ThemedText>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    ) : (
                        <View style={s.noSession}>
                            <View style={[s.noSessionIcon, { backgroundColor: colors.secondary + '15' }]}>
                                <Feather name="play" size={36} color={colors.secondary} />
                            </View>
                            <ThemedText style={{ color: colors.mutedForeground, marginTop: 12 }}>No active session</ThemedText>
                            <ThemedText type="small" style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: 4, marginBottom: 20 }}>
                                Start a session to count japa with your room
                            </ThemedText>
                            <TouchableOpacity style={[s.startSessionBtn, { backgroundColor: colors.secondary }]} onPress={handleStartSession}>
                                <Feather name="play" size={16} color="#fff" />
                                <ThemedText style={{ color: '#fff', marginLeft: 8, fontWeight: '600' }}>Start Session</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {activeSession && (
                        <View style={{ alignItems: 'center', paddingVertical: 12, gap: 8 }}>
                            {isOwner && (
                                <TouchableOpacity style={[s.endSessionBtn, { borderColor: '#ef4444' + '50' }]} onPress={handleEndSession}>
                                    <MaterialCommunityIcons name="stop" size={14} color="#ef4444" />
                                    <ThemedText style={{ color: '#ef4444', marginLeft: 6, fontSize: 13 }}>End Session</ThemedText>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={s.undoBtn}
                                onPress={handleUndo}
                                disabled={myCount === 0}
                            >
                                <MaterialCommunityIcons name="undo-variant" size={16} color={colors.mutedForeground} />
                                <ThemedText style={{ color: colors.mutedForeground, marginLeft: 6, fontSize: 13 }}>Undo</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            )}

            {}
            {activeTab === 'leaderboard' && (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                    <ThemedText type="small" style={[s.sectionLabel, { color: colors.mutedForeground }]}>CURRENT SESSION RANKINGS</ThemedText>
                    {leaderboard.length === 0 ? (
                        <ThemedText style={{ color: colors.mutedForeground, textAlign: 'center', paddingTop: 40 }}>No data yet</ThemedText>
                    ) : (
                        leaderboard.map((m, i) => (
                            <View
                                key={m.id}
                                style={[
                                    s.leaderRow,
                                    {
                                        backgroundColor: isDark ? colors.card : '#FFF',
                                        borderColor: '#E2E8F0',
                                    },
                                ]}
                            >
                                <ThemedText style={{ fontSize: 24, width: 36, textAlign: 'center' }}>{rankEmoji(i)}</ThemedText>
                                <View style={[s.memberAvatar, { backgroundColor: m.user_id === userId ? '#FCD34D' : '#FDE68A', marginRight: 12 }]}>
                                    <ThemedText style={s.memberInitial}>{getInitial(m.display_name)}</ThemedText>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <ThemedText style={{ fontSize: 16, fontWeight: '600', color: m.user_id === userId ? colors.accent : colors.foreground }}>
                                        {m.user_id === userId ? 'You' : m.display_name || 'Anonymous'}
                                    </ThemedText>
                                    {m.role === 'owner' && <ThemedText type="small" style={{ color: '#F59E0B', fontWeight: '500' }}>Owner</ThemedText>}
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <ThemedText style={{ fontSize: 24, fontWeight: '700', color: colors.foreground }}>{m.rounds}</ThemedText>
                                    <ThemedText style={{ fontSize: 12, color: colors.mutedForeground, marginTop: -2 }}>rounds</ThemedText>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}

            {}
            {activeTab === 'history' && (
                <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                    <ThemedText type="small" style={[s.sectionLabel, { color: colors.mutedForeground }]}>PAST SESSIONS</ThemedText>
                    {pastSessions.length === 0 ? (
                        <ThemedText style={{ color: colors.mutedForeground, textAlign: 'center', paddingTop: 40 }}>No past sessions yet</ThemedText>
                    ) : (
                        pastSessions.map((s) => (
                            <View key={s.id} style={[{ backgroundColor: isDark ? colors.card : '#FFF', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <ThemedText style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>{formatDate(s.started_at)}</ThemedText>
                                    <ThemedText style={{ fontSize: 16, color: colors.secondary, fontWeight: '600' }}>{s.total_rounds} rounds</ThemedText>
                                </View>
                                {s.ended_at && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 4 }}>
                                        <Feather name="clock" size={12} color={colors.mutedForeground} />
                                        <ThemedText style={{ fontSize: 13, color: colors.mutedForeground }}>
                                            Duration: {formatDuration(s.started_at, s.ended_at)}
                                        </ThemedText>
                                    </View>
                                )}
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}

export default function JapaRoomScreen({ userId }) {
    const [selectedRoom, setSelectedRoom] = useState(null);

    if (selectedRoom) {
        return (
            <RoomSessionView
                room={selectedRoom}
                userId={userId}
                onBack={() => setSelectedRoom(null)}
            />
        );
    }

    return <RoomListView userId={userId} onSelectRoom={setSelectedRoom} />;
}

const getStyles = (colors, isDark) =>
    StyleSheet.create({
        
        roomListContent: { paddingHorizontal: 16, paddingBottom: 32 },
        roomActions: { flexDirection: 'row', gap: 10, marginVertical: '2%' },
        roomActionBtnWrapper: { flex: 1, borderRadius: 12 },
        joinBtnWrapper: { borderWidth: 0.5, borderRadius: 12, },
        roomActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6 },
        createBtn: { borderRadius: 12 },
        createBtnText: { color: '#fff', fontWeight: '500', fontSize: 14 },
        joinBtn: { backgroundColor: 'transparent' },
        joinBtnText: { fontWeight: '500', fontSize: 14, color: colors.foreground },
        formBox: {
            borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16, borderColor: 'rgba(206, 217, 227, 0.5)',
            backgroundColor: isDark ? colors.card : '#fafafa', gap: 12
        },
        formInput: {
            borderWidth: 1, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, borderColor: colors.border,
            fontSize: 16, backgroundColor: colors.background, color: colors.foreground,
        },
        formButtons: { flexDirection: 'row', gap: 10, marginTop: 4 },
        formBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
        emptyState: { alignItems: 'center', paddingTop: 48 },
        emptyIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
        sectionLabel: { fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 4, fontWeight: '500' },
        roomCard: {
            flexDirection: 'row', alignItems: 'center', gap: 12,
            padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 10, borderColor: 'rgba(206, 217, 227, 0.5)'
        },
        roomAvatar: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
        roomAvatarText: { color: '#fff', fontWeight: '600', fontSize: 16 },

        roomSessionHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
        
        membersStrip: { flexGrow: 0, paddingVertical: 12 },
        membersContent: { paddingHorizontal: 16, gap: 8 },
        memberBubble: { alignItems: 'center', minWidth: 48, marginRight: 8 },
        memberAvatarWrap: { position: 'relative' },
        memberAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
        memberInitial: { fontWeight: '600', fontSize: 14, color: '#78350f' }, 
        crownBadge: { position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F59E0B' },
        countBadge: {
            position: 'absolute', bottom: -4, right: -4,
            minWidth: 18, height: 18, borderRadius: 9,
            backgroundColor: colors.foreground,
            justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4
        },
        countBadgeText: { fontSize: 10, fontWeight: '700', color: colors.background },
        memberName: { fontSize: 10, marginTop: 4, maxWidth: 52, color: colors.mutedForeground },

        tabBar: {
            flexDirection: 'row',
            backgroundColor: isDark ? '#1a2d52' : 'rgba(226, 234, 244, 0.4)', 
            marginHorizontal: 16,
            padding: 4,
            borderRadius: 12,
            marginBottom: 12,
        },
        tabItem: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 8,
            gap: 6,
            borderRadius: 8,
        },
        tabItemActive: {
            backgroundColor: colors.background,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 1,
            elevation: 1,
        },

        statsBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderRadius: 16,
            marginHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 12,
            backgroundColor: isDark ? colors.card : 'rgba(226, 234, 244, 0.3)', 
            borderWidth: 1, borderColor: 'rgba(206, 217, 227, 0.3)'
        },
        statItem: { alignItems: 'center' },
        statNumber: { fontSize: 24, fontWeight: '600', color: colors.foreground },
        statLabel: { fontSize: 10, color: colors.mutedForeground, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
        statDivider: { width: 1, height: 32, backgroundColor: 'rgba(206, 217, 227, 0.5)' },

        tapAreaContainer: {
            minHeight: 280, marginHorizontal: 16, borderRadius: 24,
            overflow: 'hidden', position: 'relative', marginBottom: 8,
        },
        tapAreaInner: {
            flex: 1,
            width: '100%',
            height: '100%',
            borderWidth: 2, borderStyle: 'dashed',
            borderRadius: 24,
            alignItems: 'center', justifyContent: 'center',
        },
        ripple: { position: 'absolute', width: 120, height: 120, borderRadius: 60 },
        bigCount: { fontSize: 100, fontWeight: '300', zIndex: 1, fontVariant: ['tabular-nums'], color: colors.foreground },
        totalPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 10 },

        noSession: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
        noSessionIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? colors.card : 'rgba(226, 234, 244, 0.5)' },
        startSessionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 30 },

        endSessionBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 30, paddingHorizontal: 18, paddingVertical: 8, borderColor: 'rgba(245, 158, 11, 0.5)' },
        undoBtn: { flexDirection: 'row', alignItems: 'center', padding: 8 },

        leaderRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8 },
    });
