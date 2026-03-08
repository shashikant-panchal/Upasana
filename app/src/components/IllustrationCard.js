import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemedText } from './ThemedText';

const IllustrationCard = ({
    title,
    subTitle,
    image,
    onPress,
    style,
    itemWidth,
    type,
    subTitleNumberOfLines
}) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[
                styles.container,
                {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    width: itemWidth || 'auto'
                },
                style,
            ]}
            onPress={onPress}
        >
            <View style={styles.textContainer}>
                <ThemedText
                    type="defaultSemiBold"
                    style={[styles.title, { color: colors.foreground }]}
                >
                    {title}
                </ThemedText>
                {subTitle ? (
                    <ThemedText
                        type="small"
                        numberOfLines={subTitleNumberOfLines}
                        style={[styles.subtitle, { color: colors.mutedForeground }]}
                    >
                        {subTitle}
                    </ThemedText>
                ) : null}
            </View>
            {image && (
                <Image
                    source={image}
                    style={[
                        styles.illustration,
                        type === 'split1' && styles.splitIllustration,
                        type === 'split2' && styles.splitIllustration2,
                        type === 'full' && styles.fullIllustration
                    ]}
                    resizeMode="contain"
                />
            )}
        </TouchableOpacity>
    );
};

export default IllustrationCard;

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        padding: 15,
        borderWidth: 0.5,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 1,
        minHeight: 130,
        justifyContent: 'flex-start',
        overflow: 'hidden',
        position: 'relative',
    },
    textContainer: {
        zIndex: 1,
    },
    title: {
        fontSize: 17,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        opacity: 0.7,
    },
    illustration: {
        position: 'absolute',
        opacity: 0.9,
    },
    splitIllustration: {
        bottom: -12,
        right: 1,
        width: 100,
        height: 100,
    },
    splitIllustration2: {
        bottom: -8,
        right: -10,
        width: 100,
        height: 100,
    },
    fullIllustration: {
        bottom: 1,
        right: 1,
        width: 90,
        height: 90,
    },
});
