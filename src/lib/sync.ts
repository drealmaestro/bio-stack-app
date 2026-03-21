import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useStore } from '../store/useStore';
import { onAuthStateChanged } from 'firebase/auth';

let unsubscribeSnapshot: (() => void) | null = null;
let isHydrating = false;

export function initSync() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      
      try {
        // 1. Check if Firestore has data. If not, migrate current local state.
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          const state = useStore.getState();
          // We don't sync `activeWorkout` as it's highly ephemeral
          const { user: profile, templates, logs, exercises, nutritionLogs, dailyInsights, seeded } = state;
          await setDoc(userDocRef, {
            user: profile || null,
            templates,
            logs,
            exercises,
            nutritionLogs,
            dailyInsights,
            seeded,
            updatedAt: Date.now()
          });
        }
      } catch (err) {
        console.error("Firebase migration error:", err);
      }

      // 2. Subscribe to remote changes
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeSnapshot = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          isHydrating = true;
          
          useStore.setState({
            user: data.user,
            templates: data.templates || [],
            logs: data.logs || [],
            exercises: data.exercises || [],
            nutritionLogs: data.nutritionLogs || [],
            dailyInsights: data.dailyInsights || [],
            seeded: data.seeded || false,
          });

          // Unblock local sync listening
          setTimeout(() => { isHydrating = false; }, 100);
        }
      }, (error) => {
        console.error("Firestore subscription error:", error);
      });
    } else {
       if (unsubscribeSnapshot) {
           unsubscribeSnapshot();
           unsubscribeSnapshot = null;
       }
    }
  });

  // 3. Listen to local Zustand changes
  let debounceTimer: ReturnType<typeof setTimeout>;
  useStore.subscribe((state, prevState) => {
    if (isHydrating) return; // Prevent infinite sync loops
    
    const user = auth.currentUser;
    if (!user) return;

    // Trigger sync ONLY if meaningful persisted data changed
    const hasDataChanged = 
        state.user !== prevState.user ||
        state.templates !== prevState.templates ||
        state.logs !== prevState.logs ||
        state.exercises !== prevState.exercises ||
        state.nutritionLogs !== prevState.nutritionLogs ||
        state.dailyInsights !== prevState.dailyInsights;

    if (hasDataChanged) {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const userDocRef = doc(db, 'users', user.uid);
        setDoc(userDocRef, {
          user: state.user || null,
          templates: state.templates,
          logs: state.logs,
          exercises: state.exercises,
          nutritionLogs: state.nutritionLogs,
          dailyInsights: state.dailyInsights,
          seeded: state.seeded,
          updatedAt: Date.now()
        }, { merge: true }).catch(err => {
            console.error("Sync write error:", err);
        });
      }, 1000); // Debounce to batch rapid local states (e.g., typing)
    }
  });
}
