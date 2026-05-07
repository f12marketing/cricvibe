import { create } from 'zustand';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';

const INITIAL_USERS = [
  { id: 'u1', name: 'Rahul D.', iq: 5420, accuracy: 84, trend: 'up' },
  { id: 'u2', name: 'Vikram S.', iq: 5210, accuracy: 81, trend: 'up' },
  { id: 'u3', name: 'Arjun K.', iq: 5100, accuracy: 79, trend: 'down' },
  { id: 'u4', name: 'Priya M.', iq: 4950, accuracy: 76, trend: 'up' },
  { id: 'u5', name: 'Neha R.', iq: 4800, accuracy: 75, trend: 'same' },
  { id: 'u6', name: 'Karthik V.', iq: 4600, accuracy: 72, trend: 'down' },
  { id: 'u7', name: 'Sanjay P.', iq: 4550, accuracy: 70, trend: 'up' },
  { id: 'u142', name: 'You', iq: 2450, accuracy: 78, trend: 'up', isUser: true },
];

export const useLeaderboardStore = create((set, get) => ({
  users: INITIAL_USERS,
  tab: 'GLOBAL',
  subscriptionRef: null,

  setTab: (tab) => set({ tab }),

  // Optimistic UI updates - Apply score changes instantly without waiting for network
  optimisticUpdateScore: (userId, points) => {
    set((state) => {
      const newUsers = state.users.map(u => 
        u.id === userId ? { ...u, iq: u.iq + points, trend: points > 0 ? 'up' : 'down' } : u
      );
      return { users: newUsers.sort((a, b) => b.iq - a.iq) };
    });
  },

  // Real-time Firestore Subscription (Optimized and Scalable)
  startLiveSubscription: () => {
    if (get().subscriptionRef) return; // Prevent duplicate listeners

    try {
      // Prevent expensive queries by strict limiting and using our new composite index
      const q = query(
        collection(db, 'users'),
        where('isGuest', '==', false), // Filter out anonymous users
        orderBy('totalIQ', 'desc'),
        orderBy('matchesPlayed', 'asc'), // Tie-breaker for efficiency
        limit(100) // Prevent fetching thousands of docs
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const liveUsers = snapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.username || 'Strategist',
            iq: data.totalIQ || 0,
            accuracy: data.matchesPlayed ? Math.min(100, Math.round(((data.totalIQ / data.matchesPlayed) / 150) * 100)) : 0,
            trend: index < 3 ? 'up' : 'same', // Simplistic trend for UI
            isUser: false // The component maps currentUser separately if needed
          };
        });

        set({ users: liveUsers });
      }, (error) => {
        console.error("Leaderboard Query Error:", error);
        // Fallback to mock if index is building or permissions fail
        get().startMockSubscription();
      });

      set({ subscriptionRef: unsubscribe });
    } catch (err) {
      console.warn("Firestore initialization failed, using local mock leaderboard.", err);
      get().startMockSubscription();
    }
  },

  // Fallback Mock Subscription
  startMockSubscription: () => {
    if (get().subscriptionRef) return;
    const interval = setInterval(() => {
      set((state) => {
        const newUsers = state.users.map(u => {
          if (u.isUser) return u;
          const change = Math.floor(Math.random() * 60) - 20;
          return { ...u, iq: Math.max(0, u.iq + change) };
        });
        return { users: newUsers.sort((a, b) => b.iq - a.iq) };
      });
    }, 4000);
    set({ subscriptionRef: interval });
  },

  stopSubscription: () => {
    const { subscriptionRef } = get();
    if (subscriptionRef) {
      if (typeof subscriptionRef === 'function') {
        subscriptionRef(); // Unsubscribe Firestore
      } else {
        clearInterval(subscriptionRef); // Clear mock interval
      }
    }
    set({ subscriptionRef: null });
  }
}));
