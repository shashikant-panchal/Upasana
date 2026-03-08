import { forwardRef } from "react";
import { Text } from "react-native";
import { useTheme } from "../context/ThemeContext";

export const ThemedText = forwardRef(({ style, type = "default", color, ignoreLargeText = false, ...rest }, ref) => {
  const { colors, typography, isLargeText } = useTheme();

  const getStyleParams = () => {
    switch (type) {
      case "title":
        return {
          fontFamily: typography.family.sansBold,
          fontSize: 28,
          lineHeight: 34,
        };
      case "subtitle":
        return {
          fontFamily: typography.family.sansBold,
          fontSize: 20,
          lineHeight: 28,
        };
      case "heading":
        return {
          fontFamily: typography.family.sansBold,
          fontSize: 18,
          lineHeight: 24,
        };
      case "defaultSemiBold":
        return {
          fontFamily: typography.family.sansSemiBold,
          fontSize: 14,
          lineHeight: 22,
        };
      case "small":
        return {
          fontFamily: typography.family.sansSemiBold,
          fontSize: 12,
          lineHeight: 18,
        };
      case "caption":
        return {
          fontFamily: typography.family.sansSemiBold,
          fontSize: 11,
          lineHeight: 16,
        };
      case "link":
        return {
          fontFamily: typography.family.sansSemiBold,
          fontSize: 14,
          lineHeight: 22,
          color: colors.primary,
        };
      case "devanagari":
        return {
          fontFamily: typography.family.devanagari,
          fontSize: 16,
          lineHeight: 26,
          marginTop: 2,
        };
      default:
        return {
          fontFamily: typography.family.sansSemiBold,
          fontSize: 14,
          lineHeight: 22,
        };
    }
  };

  const {
    fontFamily,
    fontSize,
    lineHeight,
    color: defaultColor,
  } = getStyleParams();

  const scale = (isLargeText && !ignoreLargeText) ? 1.25 : 1;

  const styleArray = Array.isArray(style) ? style : [style];
  const flattenedStyle = styleArray.reduce(
    (acc, s) => ({ ...acc, ...(s || {}) }),
    {}
  );
  const {
    fontSize: styleFontSize,
    lineHeight: styleLineHeight,
    ...restStyle
  } = flattenedStyle;

  return (
    <Text
      ref={ref}
      style={[
        {
          fontFamily,
          fontSize: (styleFontSize || fontSize) * scale,
          lineHeight: (styleLineHeight || lineHeight) * scale,
          color: color || defaultColor || colors.foreground,
        },
        restStyle,
      ]}
      allowFontScaling={false}
      {...rest}
    />
  );
})
