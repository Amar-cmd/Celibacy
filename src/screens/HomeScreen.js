import React, {useState, useCallback, useEffect, useRef} from 'react';
import {
  Text,
  View,
  StyleSheet,
    Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {CalendarList} from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowHeight = Dimensions.get('window').height;

const HomeScreen = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [greenCount, setGreenCount] = useState(0);
  const [totalDays, setTotalDays] = useState(30);
  const [streak, setStreak] = useState(0);
  const calendarRef = useRef(null);

  // Calculate minDate and maxDate
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const minDate = new Date(currentYear, currentMonth - 2, 1);
  const maxDate = new Date(currentYear, currentMonth + 2 + 1, 0);

  const saveMarkedDates = async dates => {
    try {
      const jsonValue = JSON.stringify(dates);
      await AsyncStorage.setItem('@marked_dates', jsonValue);
    } catch (e) {
      console.error('Error saving data', e);
    }
  };

  const onDayPress = useCallback(
    day => {
      const dayKey = day.dateString;
      const isDateMarked = markedDates[dayKey];
      const pressedMonth = new Date(day.dateString).getMonth() + 1;
      if (pressedMonth !== currentMonth) {
        // If so, navigate to that month
        calendarRef.current?.scrollToMonth(day.dateString);
      }
      const updatedMarkedDates = {
        ...markedDates,
        [dayKey]: {
          selected: true,
          selectedColor: isDateMarked
            ? isDateMarked.selectedColor === 'green'
              ? 'red'
              : 'green'
            : 'green',
        },
      };

      setMarkedDates(updatedMarkedDates);
      saveMarkedDates(updatedMarkedDates);
    },
    [markedDates, currentMonth],
  );

  const updateCounts = useCallback(
    visibleMonths => {
      const currentMonth = visibleMonths[0].month; // Assuming the first visible month is the current one
      const year = visibleMonths[0].year;
      const daysInMonth = new Date(year, currentMonth, 0).getDate();
      setTotalDays(daysInMonth);

      // Calculate green count for the current month
      let greenDaysCount = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const dayKey = `${year}-${String(currentMonth).padStart(
          2,
          '0',
        )}-${String(day).padStart(2, '0')}`;
        if (
          markedDates[dayKey] &&
          markedDates[dayKey].selectedColor === 'green'
        ) {
          greenDaysCount++;
        }
      }
      setGreenCount(greenDaysCount);
    },
    [markedDates],
  );

  useEffect(() => {
    const loadMarkedDates = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('@marked_dates');
        return jsonValue != null ? setMarkedDates(JSON.parse(jsonValue)) : null;
      } catch (e) {
        console.error('Error loading data', e);
      }
    };

    loadMarkedDates();
  }, []);

  useEffect(() => {
    setStreak(Math.floor(greenCount / 7)); // Update streak based on green count
  }, [greenCount]);

  const resetProgress = async () => {
    // Clear marked dates
    setMarkedDates({});
    setGreenCount(0);
    setStreak(0);

    // Clear AsyncStorage
    try {
      await AsyncStorage.removeItem('@marked_dates');
    } catch (e) {
      console.error('Error clearing data', e);
    }
    };
    
    const showResetConfirmation = () => {
      Alert.alert(
        'Reset Progress', // Alert Title
        'Are you sure you want to reset all progress?', // Alert Message
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: resetProgress,
          }, // Reset progress on "OK"
        ],
        {cancelable: false},
      );
    };


  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Celibacy Tracker</Text>
        <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>
          {greenCount}/{totalDays}
        </Text>
        <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 20}}>
          Streak: {streak}
        </Text>
      </View>
      <CalendarList
        style={styles.calendarStyle}
        horizontal={true}
        pagingEnabled={true}
        markedDates={markedDates}
        onDayPress={onDayPress}
        theme={styles.calendarTheme}
        onVisibleMonthsChange={updateCounts}
        minDate={minDate.toISOString().split('T')[0]}
        maxDate={maxDate.toISOString().split('T')[0]}
        showSixWeeks={true}
      />
      <View
        style={{
          width: '100%',
          flex: 1,
          borderColor: 'crimson',
          borderWidth: 1,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={showResetConfirmation}
          style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Reset Progress</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarStyle: {
    borderWidth: 1,
    borderColor: 'gray',
    height: windowHeight * 0.82, // Set the height to the window height
    color: 'white',
  },
  header: {
    height: windowHeight * 0.08,
    backgroundColor: 'darkgreen',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'row',
  },
  headerText: {
    color: '#fff',
    fontSize: 25,
  },
  calendarTheme: {
    backgroundColor: '#ffffff',
    calendarBackground: '#ffffff',
    textSectionTitleColor: '#b6c1cd',
    selectedDayBackgroundColor: '#00adf5',
    selectedDayTextColor: '#ffffff',
    todayTextColor: '#00adf5',
    dayTextColor: '#ffffff',
    textDisabledColor: '#d9e1e8',
    'stylesheet.calendar.main': {
      week: {
        marginTop: 0,
        marginBottom: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: windowHeight / 8, // Approximate height for each week
      },
    },
    'stylesheet.day.text': {
      base: {
        opacity: 1,
      },
    },
    'stylesheet.day.basic': {
      base: {
        alignItems: 'center',
        justifyContent: 'center',
        height: windowHeight / 20, // Slightly less to account for month headers
        width: windowHeight / 20, // Slightly less to account for month headers
        backgroundColor: 'red',
        opacity: 1,
      },
    },
  },
  resetButton: {
    backgroundColor: '#fff', // Button background color
    padding: 10,
  },
  resetButtonText: {
    color: 'crimson', // Button text color
    fontSize: 16,
  },
});

export default HomeScreen;
