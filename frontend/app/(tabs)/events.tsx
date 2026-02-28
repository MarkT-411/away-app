import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCountry } from '../../context/CountryContext';
import { useMotoTypes, getMotoTypeIcon } from '../../context/MotoTypesContext';
import CountryPicker from '../../components/CountryPicker';
import MotoTypePicker from '../../components/MotoTypePicker';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  image?: string;
  moto_type?: string;
  organizer_id: string;
  organizer_name: string;
  attendees: string[];
  max_attendees?: number;
  created_at: string;
}

interface CalendarData {
  year: number;
  calendar: { [key: number]: Event[] };
}

const CURRENT_USER = {
  id: 'user-1',
  username: 'RiderJohn',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function EventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [filterLocation, setFilterLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const { selectedCountry, setSelectedCountry } = useCountry();

  const fetchEvents = async () => {
    try {
      let url = `${API_URL}/api/events`;
      const params = new URLSearchParams();
      
      if (selectedMonth) {
        params.append('month', selectedMonth.toString());
        params.append('year', selectedYear.toString());
      }
      if (filterLocation) {
        params.append('location', filterLocation);
      }
      if (selectedCountry && selectedCountry !== 'all') {
        params.append('country', selectedCountry);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCalendar = async () => {
    try {
      let url = `${API_URL}/api/events/calendar?year=${selectedYear}`;
      if (selectedCountry && selectedCountry !== 'all') {
        url += `&country=${selectedCountry}`;
      }
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
    }
  };

  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchCalendar();
    } else {
      fetchEvents();
    }
  }, [viewMode, selectedYear, selectedMonth, filterLocation, selectedCountry]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (viewMode === 'calendar') {
      fetchCalendar();
    } else {
      fetchEvents();
    }
    setRefreshing(false);
  }, [viewMode, selectedYear]);

  const handleJoin = async (eventId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/api/events/${eventId}/join?user_id=${CURRENT_USER.id}`,
        { method: 'POST' }
      );
      if (response.ok) {
        const result = await response.json();
        setEvents(events.map(event => 
          event.id === eventId ? { ...event, attendees: result.attendees } : event
        ));
        if (calendarData) {
          const newCalendar = { ...calendarData.calendar };
          for (const month in newCalendar) {
            newCalendar[parseInt(month)] = newCalendar[parseInt(month)].map(event =>
              event.id === eventId ? { ...event, attendees: result.attendees } : event
            );
          }
          setCalendarData({ ...calendarData, calendar: newCalendar });
        }
      }
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEventCountForMonth = (month: number) => {
    if (!calendarData) return 0;
    return calendarData.calendar[month]?.length || 0;
  };

  const renderEvent = ({ item }: { item: Event }) => {
    const isJoined = item.attendees.includes(CURRENT_USER.id);
    const isFull = item.max_attendees && item.attendees.length >= item.max_attendees;
    
    return (
      <TouchableOpacity 
        style={styles.eventCard}
        onPress={() => router.push({ pathname: '/event-details', params: { id: item.id } })}
      >
        <View style={styles.eventImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.eventImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="calendar" size={40} color="#444" />
            </View>
          )}
          <View style={styles.dateOverlay}>
            <Text style={styles.dateText}>{formatDate(item.date)}</Text>
          </View>
        </View>
        
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
          
          <View style={styles.eventMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#888" />
              <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color="#888" />
              <Text style={styles.metaText}>{item.time}</Text>
            </View>
          </View>
          
          <View style={styles.eventFooter}>
            <View style={styles.attendeeInfo}>
              <Ionicons name="people-outline" size={16} color="#FF6B35" />
              <Text style={styles.attendeeText}>
                {item.attendees.length}{item.max_attendees ? `/${item.max_attendees}` : ''} going
              </Text>
            </View>
            
            <TouchableOpacity
              style={[
                styles.joinButton,
                isJoined && styles.joinedButton,
                isFull && !isJoined && styles.fullButton,
              ]}
              onPress={(e) => {
                e.stopPropagation();
                if (!isFull || isJoined) handleJoin(item.id);
              }}
              disabled={isFull && !isJoined}
            >
              <Text style={[
                styles.joinButtonText,
                isJoined && styles.joinedButtonText,
                isFull && !isJoined && styles.fullButtonText,
              ]}>
                {isJoined ? 'Joined' : isFull ? 'Full' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCalendarView = () => (
    <ScrollView 
      style={styles.calendarContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />
      }
    >
      {/* Year Selector */}
      <View style={styles.yearSelector}>
        <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
          <Ionicons name="chevron-back" size={28} color="#FF6B35" />
        </TouchableOpacity>
        <Text style={styles.yearText}>{selectedYear}</Text>
        <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
          <Ionicons name="chevron-forward" size={28} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {/* Month Grid */}
      <View style={styles.monthGrid}>
        {MONTHS.map((month, index) => {
          const eventCount = getEventCountForMonth(index + 1);
          const isCurrentMonth = new Date().getMonth() === index && new Date().getFullYear() === selectedYear;
          const isSelected = selectedMonth === index + 1;
          
          return (
            <TouchableOpacity
              key={month}
              style={[
                styles.monthCard,
                isCurrentMonth && styles.currentMonthCard,
                isSelected && styles.selectedMonthCard,
              ]}
              onPress={() => {
                setSelectedMonth(isSelected ? null : index + 1);
                setViewMode('list');
              }}
            >
              <Text style={[
                styles.monthName,
                isCurrentMonth && styles.currentMonthName,
                isSelected && styles.selectedMonthName,
              ]}>
                {MONTH_ABBR[index]}
              </Text>
              {eventCount > 0 && (
                <View style={styles.eventBadge}>
                  <Text style={styles.eventBadgeText}>{eventCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Events for selected month or year overview */}
      <View style={styles.calendarEvents}>
        <Text style={styles.calendarEventsTitle}>
          {selectedMonth ? `Events in ${MONTHS[selectedMonth - 1]}` : `${selectedYear} Events`}
        </Text>
        
        {calendarData && Object.entries(calendarData.calendar).map(([month, monthEvents]) => {
          if (monthEvents.length === 0) return null;
          if (selectedMonth && parseInt(month) !== selectedMonth) return null;
          
          return (
            <View key={month}>
              {!selectedMonth && (
                <Text style={styles.monthHeader}>{MONTHS[parseInt(month) - 1]}</Text>
              )}
              {monthEvents.map((event: Event) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.calendarEventItem}
                  onPress={() => router.push({ pathname: '/event-details', params: { id: event.id } })}
                >
                  <View style={styles.eventDateBadge}>
                    <Text style={styles.eventDay}>
                      {new Date(event.date).getDate()}
                    </Text>
                  </View>
                  <View style={styles.calendarEventInfo}>
                    <Text style={styles.calendarEventTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.calendarEventMeta}>
                      {event.time} • {event.location}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#444" />
      <Text style={styles.emptyTitle}>No events found</Text>
      <Text style={styles.emptySubtitle}>
        {selectedMonth ? `No events in ${MONTHS[selectedMonth - 1]}` : 'Create an event for the community to join!'}
      </Text>
      {selectedMonth && (
        <TouchableOpacity 
          style={styles.clearFilterButton}
          onPress={() => setSelectedMonth(null)}
        >
          <Text style={styles.clearFilterText}>Clear Filter</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Events</Text>
        <View style={styles.headerActions}>
          <CountryPicker 
            selectedCountry={selectedCountry} 
            onSelect={setSelectedCountry}
            compact
          />
          <TouchableOpacity 
            style={styles.viewToggle}
            onPress={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          >
            <Ionicons 
              name={viewMode === 'list' ? 'calendar' : 'list'} 
              size={24} 
              color="#FF6B35" 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/create-event')}
          >
            <Ionicons name="add-circle" size={32} color="#FF6B35" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar for List View */}
      {viewMode === 'list' && (
        <View style={styles.filterBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.filterChip, !selectedMonth && styles.filterChipActive]}
              onPress={() => setSelectedMonth(null)}
            >
              <Text style={[styles.filterChipText, !selectedMonth && styles.filterChipTextActive]}>
                All
              </Text>
            </TouchableOpacity>
            {MONTH_ABBR.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[styles.filterChip, selectedMonth === index + 1 && styles.filterChipActive]}
                onPress={() => setSelectedMonth(selectedMonth === index + 1 ? null : index + 1)}
              >
                <Text style={[
                  styles.filterChipText, 
                  selectedMonth === index + 1 && styles.filterChipTextActive
                ]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : viewMode === 'calendar' ? (
        renderCalendarView()
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF6B35"
            />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewToggle: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 4,
  },
  filterBar: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    color: '#888',
    fontSize: 13,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  eventImageContainer: {
    position: 'relative',
    height: 140,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#252525',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dateText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  eventMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 6,
    flex: 1,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  attendeeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendeeText: {
    color: '#FF6B35',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  joinButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinedButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  fullButton: {
    backgroundColor: '#333',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  joinedButtonText: {
    color: '#FF6B35',
  },
  fullButtonText: {
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  clearFilterButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FF6B35',
    borderRadius: 20,
  },
  clearFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  // Calendar View Styles
  calendarContainer: {
    flex: 1,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  yearText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginHorizontal: 24,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  monthCard: {
    width: '30%',
    aspectRatio: 1.2,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  currentMonthCard: {
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  selectedMonthCard: {
    backgroundColor: '#FF6B35',
  },
  monthName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentMonthName: {
    color: '#FF6B35',
  },
  selectedMonthName: {
    color: '#fff',
  },
  eventBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  eventBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  calendarEvents: {
    padding: 16,
  },
  calendarEventsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  monthHeader: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  calendarEventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  eventDateBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDay: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  calendarEventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  calendarEventTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  calendarEventMeta: {
    color: '#888',
    fontSize: 12,
  },
});
