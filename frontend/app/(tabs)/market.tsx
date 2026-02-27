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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCountry } from '../../context/CountryContext';
import CountryPicker from '../../components/CountryPicker';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  images: string[];
  seller_id: string;
  seller_name: string;
  contact_info?: string;
  location?: string;
  is_sold: boolean;
  created_at: string;
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'grid-outline' },
  { id: 'parts', label: 'Parts', icon: 'cog-outline' },
  { id: 'accessories', label: 'Accessories', icon: 'glasses-outline' },
  { id: 'gear', label: 'Gear', icon: 'shirt-outline' },
  { id: 'bikes', label: 'Bikes', icon: 'bicycle-outline' },
];

export default function MarketScreen() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();
  const { selectedCountry, setSelectedCountry } = useCountry();

  const fetchItems = async () => {
    try {
      let url = `${API_URL}/api/market`;
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        params.append('category', selectedCategory);
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
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching market items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchItems(selectedCategory);
  }, [selectedCategory]);

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new': return '#4CAF50';
      case 'like-new': return '#8BC34A';
      case 'good': return '#FFC107';
      case 'fair': return '#FF9800';
      default: return '#888';
    }
  };

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {CATEGORIES.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryButton,
            selectedCategory === cat.id && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory(cat.id)}
        >
          <Ionicons 
            name={cat.icon as any} 
            size={18} 
            color={selectedCategory === cat.id ? '#fff' : '#888'} 
          />
          <Text style={[
            styles.categoryText,
            selectedCategory === cat.id && styles.categoryTextActive,
          ]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderItem = ({ item }: { item: MarketItem }) => (
    <TouchableOpacity 
      style={styles.itemCard}
      onPress={() => router.push({ pathname: '/market-details', params: { id: item.id } })}
    >
      <View style={styles.itemImageContainer}>
        {item.images.length > 0 ? (
          <Image source={{ uri: item.images[0] }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={32} color="#444" />
          </View>
        )}
        <View style={[
          styles.conditionBadge,
          { backgroundColor: getConditionColor(item.condition) }
        ]}>
          <Text style={styles.conditionText}>{item.condition}</Text>
        </View>
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemPrice}>{formatPrice(item.price)}</Text>
        
        <View style={styles.itemMeta}>
          <View style={styles.sellerInfo}>
            <Ionicons name="person-outline" size={12} color="#888" />
            <Text style={styles.sellerName} numberOfLines={1}>{item.seller_name}</Text>
          </View>
          {item.location && (
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={12} color="#888" />
              <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={64} color="#444" />
      <Text style={styles.emptyTitle}>No items listed</Text>
      <Text style={styles.emptySubtitle}>Be the first to list something for sale!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/create-listing')}
        >
          <Ionicons name="add-circle" size={32} color="#FF6B35" />
        </TouchableOpacity>
      </View>

      {renderCategoryFilter()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
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
  addButton: {
    padding: 4,
  },
  categoryContainer: {
    maxHeight: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  categoryContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
  },
  categoryText: {
    color: '#888',
    fontSize: 13,
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  itemCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  itemImageContainer: {
    position: 'relative',
    height: 140,
  },
  itemImage: {
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
  conditionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  conditionText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    lineHeight: 18,
  },
  itemPrice: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  itemMeta: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    color: '#888',
    fontSize: 11,
    marginLeft: 4,
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#666',
    fontSize: 10,
    marginLeft: 4,
    flex: 1,
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
});
