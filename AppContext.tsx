import AsyncStorage from "@react-native-async-storage/async-storage";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

// ── Auth Types ──────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  color: string;
  createdAt: string;
}

interface StoredCredential {
  id: string;
  email: string;
  password: string;
  name: string;
  color: string;
  createdAt: string;
}

// ── Report Types ─────────────────────────────────────────────────────────────
export interface ReportLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Payment {
  amount: number;
  apology: string;
  createdAt: string;
  paidAt?: string;
  payerName: string;
  status?: "awaiting_confirmation" | "confirmed";
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  reporterColor: string;
  description: string;
  location: ReportLocation;
  mediaUris: string[];
  timestamp: string;
  status: "pending" | "guilty" | "dismissed";
  payment?: Payment;
}

// ── Community Types ───────────────────────────────────────────────────────────
export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  color: string;
  creatorId: string;
  memberIds: string[];
  postCount: number;
  createdAt: string;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  content: string;
  upvotes: number;
  upvotedBy: string[];
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  communityName: string;
  authorId: string;
  authorName: string;
  authorColor: string;
  title: string;
  content: string;
  upvotes: number;
  upvotedBy: string[];
  comments: PostComment[];
  createdAt: string;
}

// ── Seeds ─────────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  "#E63946","#1D8CF8","#2ECE7B","#F4A026","#9B59B6",
  "#E67E22","#16A085","#E91E63","#3498DB","#8BC34A",
];

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).substr(2, 9);

const SEED_REPORTS: Report[] = [
  {
    id: "seed1", reporterId: "other1", reporterName: "Rahul M.", reporterColor: "#1D8CF8",
    description: "Guy literally walked past 15 people waiting for 20 minutes at the ticket counter. Acted like he owned the place.",
    location: { latitude: 28.6139, longitude: 77.2090, address: "New Delhi Railway Station, Gate 3" },
    mediaUris: [], timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), status: "pending",
  },
  {
    id: "seed2", reporterId: "other2", reporterName: "Priya K.", reporterColor: "#2ECE7B",
    description: "Two people pushed to the front of the ATM queue, claiming they were in a hurry. Queue was 12 people long.",
    location: { latitude: 19.0760, longitude: 72.8777, address: "SBI ATM, Andheri West, Mumbai" },
    mediaUris: [], timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: "guilty",
    payment: { amount: 500, apology: "I'm sorry for my behaviour. I should have waited my turn like everyone else.", createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), paidAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), payerName: "Suresh G.", status: "confirmed" },
  },
  {
    id: "seed3", reporterId: "other3", reporterName: "Amit S.", reporterColor: "#F4A026",
    description: "Person cut in front of at least 8 people at the grocery store billing counter. Refused to go back when asked.",
    location: { latitude: 12.9716, longitude: 77.5946, address: "D-Mart, Koramangala, Bangalore" },
    mediaUris: [], timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), status: "pending",
  },
];

const SEED_COMMUNITIES: Community[] = [
  { id: "comm1", name: "Indian Railways Queue", description: "Report and discuss queue cutting at railway stations across India. Stand up for your right to wait in line.", category: "Transport", color: "#E63946", creatorId: "system", memberIds: [], postCount: 8, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "comm2", name: "Metro Watch India", description: "Keeping metro queues fair in Delhi, Mumbai, Bangalore, Hyderabad and beyond.", category: "Transport", color: "#1D8CF8", creatorId: "system", memberIds: [], postCount: 14, createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "comm3", name: "Hospital Queue Justice", description: "Healthcare queues matter most. Report unfair cutting at hospitals, clinics, and pharmacies.", category: "Healthcare", color: "#2ECE7B", creatorId: "system", memberIds: [], postCount: 5, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "comm4", name: "Bangalore IT Park Lines", description: "Queue justice for Bangalore's tech parks, cafeterias, and bus stops.", category: "Workplace", color: "#F4A026", creatorId: "system", memberIds: [], postCount: 7, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
];

const SEED_POSTS: CommunityPost[] = [
  {
    id: "post1", communityId: "comm1", communityName: "Indian Railways Queue",
    authorId: "other1", authorName: "Rahul M.", authorColor: "#1D8CF8",
    title: "IRCTC Tatkal window — complete chaos every morning",
    content: "Every single day at New Delhi station, the Tatkal counter becomes a free-for-all. 5 minutes before it opens, people just rush in. The RPF guys just watch. Have filed 3 reports this week already.",
    upvotes: 47, upvotedBy: [],
    comments: [
      { id: "c1", postId: "post1", authorId: "other2", authorName: "Priya K.", authorColor: "#2ECE7B", content: "Same at CST Mumbai. The system is completely broken. We need LineGuard awareness campaigns at stations.", upvotes: 12, upvotedBy: [], createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
      { id: "c2", postId: "post1", authorId: "other3", authorName: "Amit S.", authorColor: "#F4A026", content: "Filed a complaint with railway authorities last month. They sent a form letter back. LineGuard is doing what the railways should.", upvotes: 8, upvotedBy: [], createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post2", communityId: "comm1", communityName: "Indian Railways Queue",
    authorId: "other4", authorName: "Neha R.", authorColor: "#9B59B6",
    title: "Success story: My report led to a ₹1000 apology payment",
    content: "Someone cut in front of 20 people at Jaipur station platform. I reported on LineGuard with video evidence. Within 6 hours they paid ₹1000 and posted a public apology. This app WORKS.",
    upvotes: 134, upvotedBy: [],
    comments: [
      { id: "c3", postId: "post2", authorId: "other1", authorName: "Rahul M.", authorColor: "#1D8CF8", content: "This is amazing! Screenshots please 🙏", upvotes: 22, upvotedBy: [], createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post3", communityId: "comm2", communityName: "Metro Watch India",
    authorId: "other2", authorName: "Priya K.", authorColor: "#2ECE7B",
    title: "Yellow line Delhi Metro — peak hour madness",
    content: "The queue at Rajiv Chowk interchange every evening is like a battlefield. People physically push through. Has anyone successfully reported someone on metro premises?",
    upvotes: 29, upvotedBy: [],
    comments: [
      { id: "c4", postId: "post3", authorId: "other3", authorName: "Amit S.", authorColor: "#F4A026", content: "Yes! Reported twice at Rajiv Chowk. Got a response both times. Key is having video evidence.", upvotes: 15, upvotedBy: [], createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post4", communityId: "comm3", communityName: "Hospital Queue Justice",
    authorId: "other3", authorName: "Amit S.", authorColor: "#F4A026",
    title: "AIIMS OPD queue: patients with real emergencies get cut",
    content: "Saw someone in actual pain being made to wait while healthy people with \"connections\" jumped the queue. This is not just rude — it's a matter of life and health.",
    upvotes: 89, upvotedBy: [],
    comments: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ── Context Type ──────────────────────────────────────────────────────────────
interface AppContextType {
  // Auth
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  authLoaded: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;

  updateUser: (name: string) => void;

  // Reports
  reports: Report[];
  myReports: Report[];
  addReport: (report: Omit<Report, "id" | "reporterId" | "reporterName" | "reporterColor" | "timestamp" | "status">) => void;
  proposeDirectPayment: (reportId: string, amount: number, apology: string, payerName: string) => void;
  confirmDirectPayment: (reportId: string) => void;
  dismissReport: (reportId: string) => void;
  getReportById: (id: string) => Report | undefined;

  // Communities
  communities: Community[];
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  createCommunity: (name: string, description: string, category: string, color: string) => void;
  isMember: (communityId: string) => boolean;
  getCommunityById: (id: string) => Community | undefined;

  // Posts
  posts: CommunityPost[];
  getPostsByCommunity: (communityId: string) => CommunityPost[];
  getPostById: (id: string) => CommunityPost | undefined;
  createPost: (communityId: string, communityName: string, title: string, content: string) => void;
  upvotePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  upvoteComment: (postId: string, commentId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  // App state
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);
  const [communities, setCommunities] = useState<Community[]>(SEED_COMMUNITIES);
  const [posts, setPosts] = useState<CommunityPost[]>(SEED_POSTS);

  // Restore Firebase authentication and local non-auth app data.
  useEffect(() => {
    let authReady = false;
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const createdAt = firebaseUser.metadata.creationTime || new Date().toISOString();
        const name = firebaseUser.displayName || firebaseUser.phoneNumber || firebaseUser.email?.split("@")[0] || "LineGuard Member";
        const color = AVATAR_COLORS[(firebaseUser.uid.charCodeAt(0) || 0) % AVATAR_COLORS.length];
        setAuthUser({ id: firebaseUser.uid, name, email: firebaseUser.email || firebaseUser.phoneNumber || "", color, createdAt });
      } else {
        setAuthUser(null);
      }
      if (!authReady) {
        authReady = true;
        try {
          const [userReportsStr, userCommStr, userPostsStr] = await Promise.all([
            AsyncStorage.getItem("lineguard_reports"),
            AsyncStorage.getItem("lineguard_user_communities"),
            AsyncStorage.getItem("lineguard_user_posts"),
          ]);
          if (userReportsStr) {
            const parsed: Report[] = JSON.parse(userReportsStr);
            setReports([...SEED_REPORTS, ...parsed.filter(r => !SEED_REPORTS.find(seed => seed.id === r.id))]);
          }
          if (userCommStr) {
            const parsed: Community[] = JSON.parse(userCommStr);
            setCommunities([...SEED_COMMUNITIES, ...parsed.filter(c => !SEED_COMMUNITIES.find(seed => seed.id === c.id))]);
          }
          if (userPostsStr) {
            const parsed: CommunityPost[] = JSON.parse(userPostsStr);
            setPosts(prev => [...prev, ...parsed.filter(post => !prev.find(seed => seed.id === post.id))]);
          }
        } catch (error) {
          console.warn("Unable to restore local LineGuard data", error);
        }
        setAuthLoaded(true);
      }
    });
    return unsubscribe;
  }, []);

  // ── Firebase Authentication ───────────────────────────────────────────────
  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const credential = await auth().createUserWithEmailAndPassword(email.trim().toLowerCase(), password);
    await credential.user.updateProfile({ displayName: name.trim() });
    const user = credential.user;
    setAuthUser({ id: user.uid, name: name.trim(), email: user.email || email.trim().toLowerCase(), color: AVATAR_COLORS[(user.uid.charCodeAt(0) || 0) % AVATAR_COLORS.length], createdAt: user.metadata.creationTime || new Date().toISOString() });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await auth().signInWithEmailAndPassword(email.trim().toLowerCase(), password);
  }, []);

  const signOut = useCallback(async () => {
    await auth().signOut();
  }, []);

  const updateUser = useCallback(async (name: string) => {
    const current = auth().currentUser;
    if (!current) return;
    await current.updateProfile({ displayName: name.trim() });
    setAuthUser(prev => prev ? { ...prev, name: name.trim() } : prev);
  }, []);

  // ── Reports ───────────────────────────────────────────────────────────────
  const saveUserReports = useCallback(async (updated: Report[]) => {
    const userReports = updated.filter(r => !SEED_REPORTS.find(s => s.id === r.id));
    await AsyncStorage.setItem("lineguard_reports", JSON.stringify(userReports));
  }, []);

  const addReport = useCallback((report: Omit<Report, "id" | "reporterId" | "reporterName" | "reporterColor" | "timestamp" | "status">) => {
    if (!authUser) return;
    const newReport: Report = {
      ...report, id: generateId(),
      reporterId: authUser.id, reporterName: authUser.name, reporterColor: authUser.color,
      timestamp: new Date().toISOString(), status: "pending",
    };
    setReports(prev => {
      const updated = [newReport, ...prev];
      saveUserReports(updated);
      return updated;
    });
  }, [authUser, saveUserReports]);

  const proposeDirectPayment = useCallback((reportId: string, amount: number, apology: string, payerName: string) => {
    setReports(prev => {
      const updated = prev.map(r => r.id === reportId && r.status === "pending" && !r.payment
        ? { ...r, payment: { amount, apology, createdAt: new Date().toISOString(), payerName, status: "awaiting_confirmation" as const } }
        : r);
      saveUserReports(updated);
      return updated;
    });
  }, [saveUserReports]);

  const confirmDirectPayment = useCallback((reportId: string) => {
    if (!authUser) return;
    setReports(prev => {
      const updated = prev.map(r => r.id === reportId && r.reporterId === authUser.id && r.payment?.status === "awaiting_confirmation"
        ? { ...r, status: "guilty" as const, payment: { ...r.payment, status: "confirmed" as const, paidAt: new Date().toISOString() } }
        : r);
      saveUserReports(updated);
      return updated;
    });
  }, [authUser, saveUserReports]);

  const dismissReport = useCallback((reportId: string) => {
    setReports(prev => {
      const updated = prev.map(r => r.id === reportId ? { ...r, status: "dismissed" as const } : r);
      saveUserReports(updated);
      return updated;
    });
  }, [saveUserReports]);

  const getReportById = useCallback((id: string) => reports.find(r => r.id === id), [reports]);
  const myReports = reports.filter(r => r.reporterId === authUser?.id);

  // ── Communities ───────────────────────────────────────────────────────────
  const saveUserCommunities = useCallback(async (updated: Community[]) => {
    const userComms = updated.filter(c => !SEED_COMMUNITIES.find(s => s.id === c.id));
    await AsyncStorage.setItem("lineguard_user_communities", JSON.stringify(userComms));
  }, []);

  const joinCommunity = useCallback((communityId: string) => {
    if (!authUser) return;
    setCommunities(prev => {
      const updated = prev.map(c =>
        c.id === communityId && !c.memberIds.includes(authUser.id)
          ? { ...c, memberIds: [...c.memberIds, authUser.id] }
          : c
      );
      saveUserCommunities(updated);
      return updated;
    });
  }, [authUser, saveUserCommunities]);

  const leaveCommunity = useCallback((communityId: string) => {
    if (!authUser) return;
    setCommunities(prev => {
      const updated = prev.map(c =>
        c.id === communityId ? { ...c, memberIds: c.memberIds.filter(id => id !== authUser.id) } : c
      );
      saveUserCommunities(updated);
      return updated;
    });
  }, [authUser, saveUserCommunities]);

  const createCommunity = useCallback((name: string, description: string, category: string, color: string) => {
    if (!authUser) return;
    const newComm: Community = {
      id: generateId(), name, description, category, color,
      creatorId: authUser.id, memberIds: [authUser.id], postCount: 0,
      createdAt: new Date().toISOString(),
    };
    setCommunities(prev => {
      const updated = [newComm, ...prev];
      saveUserCommunities(updated);
      return updated;
    });
  }, [authUser, saveUserCommunities]);

  const isMember = useCallback((communityId: string) => {
    if (!authUser) return false;
    const comm = communities.find(c => c.id === communityId);
    return comm?.memberIds.includes(authUser.id) ?? false;
  }, [authUser, communities]);

  const getCommunityById = useCallback((id: string) => communities.find(c => c.id === id), [communities]);

  // ── Posts ─────────────────────────────────────────────────────────────────
  const saveUserPosts = useCallback(async (updated: CommunityPost[]) => {
    const userPosts = updated.filter(p => !SEED_POSTS.find(s => s.id === p.id));
    await AsyncStorage.setItem("lineguard_user_posts", JSON.stringify(userPosts));
  }, []);

  const getPostsByCommunity = useCallback((communityId: string) =>
    posts.filter(p => p.communityId === communityId).sort((a, b) => b.upvotes - a.upvotes), [posts]);

  const getPostById = useCallback((id: string) => posts.find(p => p.id === id), [posts]);

  const createPost = useCallback((communityId: string, communityName: string, title: string, content: string) => {
    if (!authUser) return;
    const newPost: CommunityPost = {
      id: generateId(), communityId, communityName,
      authorId: authUser.id, authorName: authUser.name, authorColor: authUser.color,
      title, content, upvotes: 0, upvotedBy: [], comments: [],
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => {
      const updated = [newPost, ...prev];
      saveUserPosts(updated);
      return updated;
    });
    setCommunities(prev => prev.map(c => c.id === communityId ? { ...c, postCount: c.postCount + 1 } : c));
  }, [authUser, saveUserPosts]);

  const upvotePost = useCallback((postId: string) => {
    if (!authUser) return;
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id !== postId) return p;
        const hasVoted = p.upvotedBy.includes(authUser.id);
        return {
          ...p,
          upvotes: hasVoted ? p.upvotes - 1 : p.upvotes + 1,
          upvotedBy: hasVoted ? p.upvotedBy.filter(id => id !== authUser.id) : [...p.upvotedBy, authUser.id],
        };
      });
      saveUserPosts(updated);
      return updated;
    });
  }, [authUser, saveUserPosts]);

  const addComment = useCallback((postId: string, content: string) => {
    if (!authUser) return;
    const newComment: PostComment = {
      id: generateId(), postId,
      authorId: authUser.id, authorName: authUser.name, authorColor: authUser.color,
      content, upvotes: 0, upvotedBy: [], createdAt: new Date().toISOString(),
    };
    setPosts(prev => {
      const updated = prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p);
      saveUserPosts(updated);
      return updated;
    });
  }, [authUser, saveUserPosts]);

  const upvoteComment = useCallback((postId: string, commentId: string) => {
    if (!authUser) return;
    setPosts(prev => {
      const updated = prev.map(p => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: p.comments.map(c => {
            if (c.id !== commentId) return c;
            const hasVoted = c.upvotedBy.includes(authUser.id);
            return { ...c, upvotes: hasVoted ? c.upvotes - 1 : c.upvotes + 1, upvotedBy: hasVoted ? c.upvotedBy.filter(id => id !== authUser.id) : [...c.upvotedBy, authUser.id] };
          }),
        };
      });
      saveUserPosts(updated);
      return updated;
    });
  }, [authUser, saveUserPosts]);

  return (
    <AppContext.Provider value={{
      authUser, isAuthenticated: !!authUser, authLoaded,
      signUp, signIn, signOut, updateUser,
      reports, myReports, addReport, proposeDirectPayment, confirmDirectPayment, dismissReport, getReportById,
      communities, joinCommunity, leaveCommunity, createCommunity, isMember, getCommunityById,
      posts, getPostsByCommunity, getPostById, createPost, upvotePost, addComment, upvoteComment,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
