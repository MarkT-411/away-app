import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface DashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    admins: number;
    new_this_week: number;
  };
  content: {
    posts: number;
    events: number;
    trips: number;
    tracks: number;
    listings: number;
    new_posts_week: number;
  };
  membership: {
    active_members: number;
    paused_members: number;
  };
  sos: {
    total_alerts: number;
    active_alerts: number;
  };
}

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
  dashboardStats: DashboardStats | null;
  fetchDashboard: () => Promise<void>;
  fetchUsers: (search?: string) => Promise<any[]>;
  suspendUser: (userId: string) => Promise<boolean>;
  unsuspendUser: (userId: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  makeAdmin: (userId: string) => Promise<boolean>;
  removeAdmin: (userId: string) => Promise<boolean>;
  fetchPosts: () => Promise<any[]>;
  deletePost: (postId: string) => Promise<boolean>;
  fetchEvents: () => Promise<any[]>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  fetchListings: () => Promise<any[]>;
  deleteListing: (listingId: string) => Promise<boolean>;
  fetchMemberships: () => Promise<any[]>;
  grantMembership: (userId: string, plan: string) => Promise<boolean>;
  revokeMembership: (userId: string) => Promise<boolean>;
  fetchSOSAlerts: () => Promise<any[]>;
  resolveSOSAlert: (alertId: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (user) {
      // Check if user has admin flag
      setIsAdmin(user.is_admin === true);
    } else {
      setIsAdmin(false);
    }
    setIsLoading(false);
  }, [user]);

  const fetchDashboard = async () => {
    if (!user || !isAdmin) return;
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard?admin_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchUsers = async (search?: string) => {
    if (!user || !isAdmin) return [];
    try {
      const url = search 
        ? `${API_URL}/api/admin/users?admin_id=${user.id}&search=${encodeURIComponent(search)}`
        : `${API_URL}/api/admin/users?admin_id=${user.id}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    return [];
  };

  const suspendUser = async (userId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/suspend?admin_id=${user.id}`, {
        method: 'PUT',
      });
      return response.ok;
    } catch (error) {
      console.error('Error suspending user:', error);
      return false;
    }
  };

  const unsuspendUser = async (userId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/unsuspend?admin_id=${user.id}`, {
        method: 'PUT',
      });
      return response.ok;
    } catch (error) {
      console.error('Error unsuspending user:', error);
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}?admin_id=${user.id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  const makeAdmin = async (userId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/make-admin?admin_id=${user.id}`, {
        method: 'PUT',
      });
      return response.ok;
    } catch (error) {
      console.error('Error making admin:', error);
      return false;
    }
  };

  const removeAdmin = async (userId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/remove-admin?admin_id=${user.id}`, {
        method: 'PUT',
      });
      return response.ok;
    } catch (error) {
      console.error('Error removing admin:', error);
      return false;
    }
  };

  const fetchPosts = async () => {
    if (!user || !isAdmin) return [];
    try {
      const response = await fetch(`${API_URL}/api/admin/posts?admin_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        return data.posts || [];
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
    return [];
  };

  const deletePost = async (postId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/posts/${postId}?admin_id=${user.id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  };

  const fetchEvents = async () => {
    if (!user || !isAdmin) return [];
    try {
      const response = await fetch(`${API_URL}/api/admin/events?admin_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        return data.events || [];
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    return [];
  };

  const deleteEvent = async (eventId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/events/${eventId}?admin_id=${user.id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting event:', error);
      return false;
    }
  };

  const fetchListings = async () => {
    if (!user || !isAdmin) return [];
    try {
      const response = await fetch(`${API_URL}/api/admin/listings?admin_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        return data.listings || [];
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
    return [];
  };

  const deleteListing = async (listingId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/listings/${listingId}?admin_id=${user.id}`, {
        method: 'DELETE',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting listing:', error);
      return false;
    }
  };

  const fetchMemberships = async () => {
    if (!user || !isAdmin) return [];
    try {
      const response = await fetch(`${API_URL}/api/admin/memberships?admin_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        return data.memberships || [];
      }
    } catch (error) {
      console.error('Error fetching memberships:', error);
    }
    return [];
  };

  const grantMembership = async (userId: string, plan: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/memberships/${userId}/grant?admin_id=${user.id}&plan=${plan}`, {
        method: 'PUT',
      });
      return response.ok;
    } catch (error) {
      console.error('Error granting membership:', error);
      return false;
    }
  };

  const revokeMembership = async (userId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/memberships/${userId}/revoke?admin_id=${user.id}`, {
        method: 'PUT',
      });
      return response.ok;
    } catch (error) {
      console.error('Error revoking membership:', error);
      return false;
    }
  };

  const fetchSOSAlerts = async () => {
    if (!user || !isAdmin) return [];
    try {
      const response = await fetch(`${API_URL}/api/admin/sos-alerts?admin_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        return data.alerts || [];
      }
    } catch (error) {
      console.error('Error fetching SOS alerts:', error);
    }
    return [];
  };

  const resolveSOSAlert = async (alertId: string) => {
    if (!user || !isAdmin) return false;
    try {
      const response = await fetch(`${API_URL}/api/admin/sos-alerts/${alertId}/resolve?admin_id=${user.id}`, {
        method: 'PUT',
      });
      return response.ok;
    } catch (error) {
      console.error('Error resolving alert:', error);
      return false;
    }
  };

  return (
    <AdminContext.Provider
      value={{
        isAdmin,
        isLoading,
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
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
