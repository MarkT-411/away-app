import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAdmin } from '../context/AdminContext';

type TabType = 'dashboard' | 'users' | 'content' | 'sos';

export default function AdminPanelScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { selectedLanguage } = useLanguage();
  const {
    isAdmin,
    dashboardStats,
    fetchDashboard,
    fetchUsers,
    suspendUser,
    unsuspendUser,
    deleteUser,
    makeAdmin,
    removeAdmin,
    fetchPosts,
    deletePost,
    fetchEvents,
    deleteEvent,
    fetchListings,
    deleteListing,
    fetchMemberships,
    grantMembership,
    revokeMembership,
    fetchSOSAlerts,
    resolveSOSAlert,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [sosAlerts, setSOSAlerts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userModalVisible, setUserModalVisible] = useState(false);

  const isItalian = selectedLanguage === 'it';

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert(
        isItalian ? 'Accesso Negato' : 'Access Denied',
        isItalian ? 'Non hai i permessi di amministratore' : 'You do not have admin privileges',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      return;
    }
    loadData();
  }, [isAdmin]);

  const loadData = async () => {
    setRefreshing(true);
    await fetchDashboard();
    if (activeTab === 'users') {
      const userData = await fetchUsers(searchQuery);
      setUsers(userData);
    } else if (activeTab === 'content') {
      const [postsData, eventsData, listingsData] = await Promise.all([
        fetchPosts(),
        fetchEvents(),
        fetchListings(),
      ]);
      setPosts(postsData);
      setEvents(eventsData);
      setListings(listingsData);
    } else if (activeTab === 'memberships') {
      const membershipData = await fetchMemberships();
      setMemberships(membershipData);
    } else if (activeTab === 'sos') {
      const alertsData = await fetchSOSAlerts();
      setSOSAlerts(alertsData);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleSearch = async () => {
    const userData = await fetchUsers(searchQuery);
    setUsers(userData);
  };

  const handleUserAction = async (action: string, userId: string) => {
    let success = false;
    switch (action) {
      case 'suspend':
        success = await suspendUser(userId);
        break;
      case 'unsuspend':
        success = await unsuspendUser(userId);
        break;
      case 'delete':
        Alert.alert(
          isItalian ? 'Conferma Eliminazione' : 'Confirm Delete',
          isItalian ? 'Vuoi davvero eliminare questo utente?' : 'Are you sure you want to delete this user?',
          [
            { text: isItalian ? 'Annulla' : 'Cancel', style: 'cancel' },
            {
              text: isItalian ? 'Elimina' : 'Delete',
              style: 'destructive',
              onPress: async () => {
                success = await deleteUser(userId);
                if (success) loadData();
              },
            },
          ]
        );
        return;
      case 'makeAdmin':
        success = await makeAdmin(userId);
        break;
      case 'removeAdmin':
        success = await removeAdmin(userId);
        break;
    }
    if (success) {
      loadData();
      setUserModalVisible(false);
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: isItalian ? 'Dashboard' : 'Dashboard', icon: 'stats-chart' },
    { id: 'users', label: isItalian ? 'Utenti' : 'Users', icon: 'people' },
    { id: 'content', label: isItalian ? 'Contenuti' : 'Content', icon: 'document-text' },
    { id: 'sos', label: 'SOS', icon: 'alert-circle' },
  ];

  const renderDashboard = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Users Stats */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {isItalian ? 'Utenti' : 'Users'}
      </Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="people" size={28} color={colors.accent} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.users.total || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isItalian ? 'Totali' : 'Total'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.users.active || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isItalian ? 'Attivi' : 'Active'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="ban" size={28} color="#FF5252" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.users.suspended || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isItalian ? 'Sospesi' : 'Suspended'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="trending-up" size={28} color="#2196F3" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.users.new_this_week || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isItalian ? 'Nuovi (7gg)' : 'New (7d)'}</Text>
        </View>
      </View>

      {/* Content Stats */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {isItalian ? 'Contenuti' : 'Content'}
      </Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="images" size={28} color="#9C27B0" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.content.posts || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Post</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="calendar" size={28} color="#FF9800" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.content.events || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isItalian ? 'Eventi' : 'Events'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="car" size={28} color="#00BCD4" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.content.trips || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isItalian ? 'Viaggi' : 'Trips'}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Ionicons name="cart" size={28} color="#8BC34A" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.content.listings || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isItalian ? 'Annunci' : 'Listings'}</Text>
        </View>
      </View>

      {/* Membership Stats */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {isItalian ? 'Abbonamenti' : 'Memberships'}
      </Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardWide, { backgroundColor: colors.accent }]}>
          <Ionicons name="star" size={28} color="#fff" />
          <Text style={[styles.statNumber, { color: '#fff' }]}>{dashboardStats?.membership.active_members || 0}</Text>
          <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.8)' }]}>{isItalian ? 'Membri Attivi' : 'Active Members'}</Text>
        </View>
        <View style={[styles.statCard, styles.statCardWide, { backgroundColor: colors.card }]}>
          <Ionicons name="pause-circle" size={28} color="#FFC107" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.membership.paused_members || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isItalian ? 'In Pausa' : 'Paused'}</Text>
        </View>
      </View>

      {/* SOS Stats */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        SOS Alerts
      </Text>
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.statCardWide, { backgroundColor: dashboardStats?.sos.active_alerts ? '#FF5252' : colors.card }]}>
          <Ionicons name="alert-circle" size={28} color={dashboardStats?.sos.active_alerts ? '#fff' : '#FF5252'} />
          <Text style={[styles.statNumber, { color: dashboardStats?.sos.active_alerts ? '#fff' : colors.text }]}>
            {dashboardStats?.sos.active_alerts || 0}
          </Text>
          <Text style={[styles.statLabel, { color: dashboardStats?.sos.active_alerts ? 'rgba(255,255,255,0.8)' : colors.textSecondary }]}>
            {isItalian ? 'Alert Attivi' : 'Active Alerts'}
          </Text>
        </View>
        <View style={[styles.statCard, styles.statCardWide, { backgroundColor: colors.card }]}>
          <Ionicons name="time" size={28} color={colors.textSecondary} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{dashboardStats?.sos.total_alerts || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{isItalian ? 'Totali' : 'Total'}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={isItalian ? 'Cerca utenti...' : 'Search users...'}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.userCard, { backgroundColor: colors.card }]}
            onPress={() => {
              setSelectedUser(item);
              setUserModalVisible(true);
            }}
          >
            <View style={styles.userInfo}>
              <View style={[styles.userAvatar, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.userAvatarText, { color: colors.accent }]}>
                  {item.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={[styles.userName, { color: colors.text }]}>{item.username}</Text>
                <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{item.email || 'No email'}</Text>
              </View>
            </View>
            <View style={styles.userBadges}>
              {item.is_admin && (
                <View style={[styles.badge, { backgroundColor: colors.accent }]}>
                  <Text style={styles.badgeText}>Admin</Text>
                </View>
              )}
              {item.is_suspended && (
                <View style={[styles.badge, { backgroundColor: '#FF5252' }]}>
                  <Text style={styles.badgeText}>{isItalian ? 'Sospeso' : 'Suspended'}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {isItalian ? 'Nessun utente trovato' : 'No users found'}
          </Text>
        }
      />
    </View>
  );

  const renderContent = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {/* Posts */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Post ({posts.length})
      </Text>
      {posts.slice(0, 5).map((post) => (
        <View key={post.id} style={[styles.contentCard, { backgroundColor: colors.card }]}>
          <View style={styles.contentInfo}>
            <Text style={[styles.contentTitle, { color: colors.text }]} numberOfLines={2}>
              {post.content}
            </Text>
            <Text style={[styles.contentMeta, { color: colors.textSecondary }]}>
              {isItalian ? 'di' : 'by'} {post.username}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: '#FFE5E5' }]}
            onPress={() => {
              Alert.alert(
                isItalian ? 'Elimina Post' : 'Delete Post',
                isItalian ? 'Vuoi eliminare questo post?' : 'Delete this post?',
                [
                  { text: isItalian ? 'Annulla' : 'Cancel', style: 'cancel' },
                  {
                    text: isItalian ? 'Elimina' : 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      if (await deletePost(post.id)) loadData();
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash" size={18} color="#FF5252" />
          </TouchableOpacity>
        </View>
      ))}

      {/* Events */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {isItalian ? 'Eventi' : 'Events'} ({events.length})
      </Text>
      {events.slice(0, 5).map((event) => (
        <View key={event.id} style={[styles.contentCard, { backgroundColor: colors.card }]}>
          <View style={styles.contentInfo}>
            <Text style={[styles.contentTitle, { color: colors.text }]}>{event.title}</Text>
            <Text style={[styles.contentMeta, { color: colors.textSecondary }]}>{event.location}</Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: '#FFE5E5' }]}
            onPress={() => {
              Alert.alert(
                isItalian ? 'Elimina Evento' : 'Delete Event',
                isItalian ? 'Vuoi eliminare questo evento?' : 'Delete this event?',
                [
                  { text: isItalian ? 'Annulla' : 'Cancel', style: 'cancel' },
                  {
                    text: isItalian ? 'Elimina' : 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      if (await deleteEvent(event.id)) loadData();
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash" size={18} color="#FF5252" />
          </TouchableOpacity>
        </View>
      ))}

      {/* Listings */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {isItalian ? 'Annunci' : 'Listings'} ({listings.length})
      </Text>
      {listings.slice(0, 5).map((listing) => (
        <View key={listing.id} style={[styles.contentCard, { backgroundColor: colors.card }]}>
          <View style={styles.contentInfo}>
            <Text style={[styles.contentTitle, { color: colors.text }]}>{listing.title}</Text>
            <Text style={[styles.contentMeta, { color: colors.textSecondary }]}>€{listing.price}</Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: '#FFE5E5' }]}
            onPress={() => {
              Alert.alert(
                isItalian ? 'Elimina Annuncio' : 'Delete Listing',
                isItalian ? 'Vuoi eliminare questo annuncio?' : 'Delete this listing?',
                [
                  { text: isItalian ? 'Annulla' : 'Cancel', style: 'cancel' },
                  {
                    text: isItalian ? 'Elimina' : 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                      if (await deleteListing(listing.id)) loadData();
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="trash" size={18} color="#FF5252" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderMemberships = () => (
    <FlatList
      style={styles.tabContent}
      data={memberships}
      keyExtractor={(item) => item.user_id}
      renderItem={({ item }) => (
        <View style={[styles.memberCard, { backgroundColor: colors.card }]}>
          <View style={styles.memberInfo}>
            <Text style={[styles.memberName, { color: colors.text }]}>{item.username || item.user_id}</Text>
            <Text style={[styles.memberEmail, { color: colors.textSecondary }]}>{item.email}</Text>
            <View style={styles.memberMeta}>
              <View style={[styles.badge, { backgroundColor: item.status === 'active' ? '#4CAF50' : '#FFC107' }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
              <Text style={[styles.memberPlan, { color: colors.textSecondary }]}>{item.plan}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.revokeButton, { backgroundColor: '#FFE5E5' }]}
            onPress={() => {
              Alert.alert(
                isItalian ? 'Revoca Membership' : 'Revoke Membership',
                isItalian ? 'Vuoi revocare l\'abbonamento?' : 'Revoke this membership?',
                [
                  { text: isItalian ? 'Annulla' : 'Cancel', style: 'cancel' },
                  {
                    text: isItalian ? 'Revoca' : 'Revoke',
                    style: 'destructive',
                    onPress: async () => {
                      if (await revokeMembership(item.user_id)) loadData();
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="close-circle" size={20} color="#FF5252" />
          </TouchableOpacity>
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {isItalian ? 'Nessun membro trovato' : 'No members found'}
        </Text>
      }
    />
  );

  const renderSOS = () => (
    <FlatList
      style={styles.tabContent}
      data={sosAlerts}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={[styles.sosCard, { backgroundColor: item.status === 'active' ? '#FFEBEE' : colors.card }]}>
          <View style={styles.sosInfo}>
            <View style={styles.sosHeader}>
              <Ionicons 
                name="alert-circle" 
                size={24} 
                color={item.status === 'active' ? '#FF5252' : colors.textSecondary} 
              />
              <Text style={[styles.sosUser, { color: colors.text }]}>{item.username || item.user_id}</Text>
            </View>
            <Text style={[styles.sosTime, { color: colors.textSecondary }]}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
            {item.location && (
              <Text style={[styles.sosLocation, { color: colors.textSecondary }]}>
                📍 {item.location.latitude?.toFixed(4)}, {item.location.longitude?.toFixed(4)}
              </Text>
            )}
          </View>
          {item.status === 'active' && (
            <TouchableOpacity
              style={[styles.resolveButton, { backgroundColor: '#4CAF50' }]}
              onPress={async () => {
                if (await resolveSOSAlert(item.id)) loadData();
              }}
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {isItalian ? 'Nessun alert SOS' : 'No SOS alerts'}
        </Text>
      }
    />
  );

  // User Action Modal
  const renderUserModal = () => (
    <Modal
      visible={userModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => setUserModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>
            {selectedUser?.username}
          </Text>
          <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
            {selectedUser?.email}
          </Text>

          <View style={styles.modalActions}>
            {!selectedUser?.is_suspended ? (
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FFF3E0' }]}
                onPress={() => handleUserAction('suspend', selectedUser?.id)}
              >
                <Ionicons name="ban" size={20} color="#FF9800" />
                <Text style={[styles.modalButtonText, { color: '#FF9800' }]}>
                  {isItalian ? 'Sospendi' : 'Suspend'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E8F5E9' }]}
                onPress={() => handleUserAction('unsuspend', selectedUser?.id)}
              >
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={[styles.modalButtonText, { color: '#4CAF50' }]}>
                  {isItalian ? 'Riattiva' : 'Unsuspend'}
                </Text>
              </TouchableOpacity>
            )}

            {!selectedUser?.is_admin ? (
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.accentLight }]}
                onPress={() => handleUserAction('makeAdmin', selectedUser?.id)}
              >
                <Ionicons name="shield" size={20} color={colors.accent} />
                <Text style={[styles.modalButtonText, { color: colors.accent }]}>
                  {isItalian ? 'Rendi Admin' : 'Make Admin'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FFF3E0' }]}
                onPress={() => handleUserAction('removeAdmin', selectedUser?.id)}
              >
                <Ionicons name="shield-outline" size={20} color="#FF9800" />
                <Text style={[styles.modalButtonText, { color: '#FF9800' }]}>
                  {isItalian ? 'Rimuovi Admin' : 'Remove Admin'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#E8F5E9' }]}
              onPress={async () => {
                if (await grantMembership(selectedUser?.id, 'annual')) {
                  Alert.alert(isItalian ? 'Successo' : 'Success', isItalian ? 'Membership assegnata' : 'Membership granted');
                  setUserModalVisible(false);
                }
              }}
            >
              <Ionicons name="star" size={20} color="#4CAF50" />
              <Text style={[styles.modalButtonText, { color: '#4CAF50' }]}>
                {isItalian ? 'Assegna Member' : 'Grant Member'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#FFEBEE' }]}
              onPress={() => handleUserAction('delete', selectedUser?.id)}
            >
              <Ionicons name="trash" size={20} color="#FF5252" />
              <Text style={[styles.modalButtonText, { color: '#FF5252' }]}>
                {isItalian ? 'Elimina Utente' : 'Delete User'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { borderColor: colors.border }]}
            onPress={() => setUserModalVisible(false)}
          >
            <Text style={[styles.closeButtonText, { color: colors.text }]}>
              {isItalian ? 'Chiudi' : 'Close'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isItalian ? 'Pannello Admin' : 'Admin Panel'}
        </Text>
        <View style={[styles.adminBadge, { backgroundColor: colors.accent }]}>
          <Ionicons name="shield-checkmark" size={16} color="#fff" />
        </View>
      </View>

      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={[styles.tabBar, { backgroundColor: colors.card }]}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && { backgroundColor: colors.accentLight },
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? colors.accent : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.id ? colors.accent : colors.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <View style={styles.content}>
        <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'sos' && renderSOS()}
      </View>

      {renderUserModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  adminBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
    gap: 6,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardWide: {
    width: '47%',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  contentMeta: {
    fontSize: 13,
    marginTop: 4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  memberMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  memberPlan: {
    fontSize: 12,
  },
  revokeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  sosInfo: {
    flex: 1,
  },
  sosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sosUser: {
    fontSize: 16,
    fontWeight: '600',
  },
  sosTime: {
    fontSize: 13,
    marginTop: 4,
  },
  sosLocation: {
    fontSize: 12,
    marginTop: 4,
  },
  resolveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  modalActions: {
    gap: 12,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
