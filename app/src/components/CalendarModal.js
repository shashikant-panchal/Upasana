import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import { useEffect, useState } from "react";
import {
    Modal,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import { dh, dw } from "../constants/Dimensions";
import { useTheme } from "../context/ThemeContext";
import { ThemedText } from "./ThemedText";

const CalendarModal = ({ visible, onClose, onDateSelect, selectedDate }) => {
    const { colors, isDark } = useTheme();
    const [currentMonth, setCurrentMonth] = useState(moment());
    const styles = getStyles(colors, isDark);

    useEffect(() => {
        if (visible && selectedDate) {
            setCurrentMonth(moment(selectedDate));
        } else {
            setCurrentMonth(moment());
        }
    }, [visible]);

    const generateDays = () => {
        const startOfMonth = currentMonth.clone().startOf("month");
        const endOfMonth = currentMonth.clone().endOf("month");
        const startDay = startOfMonth.day(); 
        const daysInMonth = currentMonth.daysInMonth();

        const days = [];

        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(currentMonth.clone().date(i));
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(currentMonth.clone().subtract(1, "months"));
    };

    const handleNextMonth = () => {
        setCurrentMonth(currentMonth.clone().add(1, "months"));
    };

    const handleSelectDate = (date) => {
        if (date) {
            onDateSelect(date.toDate());
            onClose();
        }
    };

    const isSameDay = (date1, date2) => {
        if (!date1 || !date2) return false;
        return date1.isSame(date2, 'day');
    }

    const days = generateDays();
    const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.modalContent}>
                            <View style={styles.handleBar} />

                            <ThemedText type="subtitle" style={styles.title}>
                                Select Date
                            </ThemedText>

                            <View style={styles.calendarContainer}>
                                {}
                                <View style={styles.header}>
                                    <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
                                        <Ionicons name="chevron-back" size={20} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                    <ThemedText type="defaultSemiBold" style={styles.monthText}>
                                        {currentMonth.format("MMMM YYYY")}
                                    </ThemedText>
                                    <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
                                        <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
                                    </TouchableOpacity>
                                </View>

                                {}
                                <View style={styles.weekDaysRow}>
                                    {weekDays.map((day, index) => (
                                        <ThemedText key={index} style={styles.weekDayText}>
                                            {day}
                                        </ThemedText>
                                    ))}
                                </View>

                                {}
                                <View style={styles.daysGrid}>
                                    {days.map((date, index) => {
                                        const isSelected = date && selectedDate && isSameDay(date, moment(selectedDate));
                                        const isToday = date && isSameDay(date, moment());

                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[
                                                    styles.dayCell,
                                                    isSelected && styles.selectedDayCell,
                                                ]}
                                                onPress={() => handleSelectDate(date)}
                                                disabled={!date}
                                            >
                                                {date && (
                                                    <ThemedText
                                                        style={[
                                                            styles.dayText,
                                                            isSelected && styles.selectedDayText,
                                                            !isSelected && isToday && styles.todayText
                                                        ]}
                                                    >
                                                        {date.date()}
                                                    </ThemedText>
                                                )}
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const getStyles = (colors, isDark) =>
    StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "flex-end",
        },
        modalContent: {
            backgroundColor: colors.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            paddingBottom: 40,
            minHeight: dh * 0.5,
            alignItems: 'center'
        },
        handleBar: {
            width: 40,
            height: 4,
            backgroundColor: colors.muted || '#E2E8F0',
            borderRadius: 2,
            marginBottom: 20,
        },
        title: {
            marginBottom: 20,
            color: colors.foreground
        },
        calendarContainer: {
            width: '100%',
            backgroundColor: isDark ? colors.card : '#fff',
            borderRadius: 16,
            padding: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            borderWidth: 1,
            borderColor: isDark ? colors.border : '#F1F5F9'
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
        },
        arrowButton: {
            padding: 8,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: isDark ? colors.border : '#E2E8F0',
            alignItems: 'center',
            justifyContent: 'center'
        },
        monthText: {
            fontSize: 16,
            color: colors.foreground
        },
        weekDaysRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        weekDayText: {
            width: (dw - 80) / 7,
            textAlign: 'center',
            color: colors.primary,  
            fontSize: 14,
            fontWeight: '500'
        },
        daysGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            
        },
        dayCell: {
            width: (dw - 80) / 7,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
            borderRadius: 10,
        },
        selectedDayCell: {
            backgroundColor: '#1E40AF', 
        },
        dayText: {
            fontSize: 16,
            color: colors.foreground
        },
        selectedDayText: {
            color: '#fff',
            fontWeight: 'bold'
        },
        todayText: {
            color: '#94A3B8', 
        }
    });

export default CalendarModal;
