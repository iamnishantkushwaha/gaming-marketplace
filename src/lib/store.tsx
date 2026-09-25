"use client";

import React, { createContext, useCallback, useContext, useMemo, useReducer } from "react";
import {
  users as seedUsers,
  listings as seedListings,
  orders as seedOrders,
  reviews as seedReviews,
  conversations as seedConversations,
  messages as seedMessages,
  disputes as seedDisputes,
  transactions as seedTransactions,
  flags as seedFlags,
  categories as seedCategories,
  paymentMethods as seedPaymentMethods,
  notifications as seedNotifications,
  CURRENT_IDS,
} from "./mock-data";
import {
  User,
  Listing,
  Order,
  Review,
  Conversation,
  Message,
  Dispute,
  Transaction,
  Flag,
  CategoryRecord,
  PaymentMethod,
  NotificationItem,
  Role,
  OrderStatus,
} from "./types";

interface Toast {
  id: string;
  message: string;
}

interface AppState {
  role: Role | null;
  currentUserId: string | null;
  users: User[];
  listings: Listing[];
  orders: Order[];
  reviews: Review[];
  conversations: Conversation[];
  messages: Message[];
  disputes: Dispute[];
  transactions: Transaction[];
  flags: Flag[];
  categories: CategoryRecord[];
  paymentMethods: PaymentMethod[];
  notifications: NotificationItem[];
  balances: Record<string, number>;
  toasts: Toast[];
  checkoutContext: { listingId: string; quantity?: number } | null;
  composerDrafts: Record<string, string>;
  wishlists: Record<string, string[]>;
}

const initialState: AppState = {
  role: null,
  currentUserId: null,
  users: seedUsers,
  listings: seedListings,
  orders: seedOrders,
  reviews: seedReviews,
  conversations: seedConversations,
  messages: seedMessages,
  disputes: seedDisputes,
  transactions: seedTransactions,
  flags: seedFlags,
  categories: seedCategories,
  paymentMethods: seedPaymentMethods,
  notifications: seedNotifications,
  balances: {
    "u-jordan": 64.2,
    "u-priya": 12.0,
    "u-mystic": 842.3,
    "u-nightowl": 3120.1,
    "u-quickflip": 96.0,
    "u-shadow": 0,
  },
  toasts: [],
  checkoutContext: null,
  composerDrafts: {},
  wishlists: {},
};

type Action =
  | { type: "SET_SESSION"; role: Role; userId: string }
  | { type: "LOG_OUT" }
  | { type: "ADD_TOAST"; message: string }
  | { type: "DISMISS_TOAST"; id: string }
  | { type: "SET_CHECKOUT_CONTEXT"; listingId: string; quantity?: number }
  | { type: "CLEAR_CHECKOUT_CONTEXT" }
  | { type: "PLACE_ORDER"; order: Order }
  | { type: "SET_ORDER_STATUS"; orderId: string; status: OrderStatus; extra?: Partial<Order> }
  | { type: "CONFIRM_DELIVERY"; orderId: string }
  | { type: "ADD_REVIEW"; review: Review }
  | { type: "ADD_SELLER_REPLY"; reviewId: string; reply: string }
  | { type: "ADD_LISTING"; listing: Listing }
  | { type: "UPDATE_LISTING"; listingId: string; patch: Partial<Listing> }
  | { type: "DELETE_LISTING"; listingId: string }
  | { type: "ADD_MESSAGE"; message: Message }
  | { type: "START_CONVERSATION"; conversation: Conversation }
  | { type: "CLAIM_CONVERSATION"; conversationId: string; agentId: string }
  | { type: "RESOLVE_CONVERSATION"; conversationId: string }
  | { type: "SET_COMPOSER_DRAFT"; conversationId: string; text: string }
  | { type: "OPEN_DISPUTE"; dispute: Dispute }
  | { type: "RESPOND_DISPUTE"; disputeId: string; response: string }
  | { type: "ADD_DISPUTE_NOTE"; disputeId: string; note: string; author: string }
  | { type: "RESOLVE_DISPUTE"; disputeId: string; resolution: "Refunded" | "Released" }
  | { type: "ESCALATE_DISPUTE"; disputeId: string }
  | { type: "SET_VERIFICATION"; userId: string; status: User["verificationStatus"] }
  | { type: "SET_ACCOUNT_STATUS"; userId: string; status: User["accountStatus"] }
  | { type: "UPDATE_USER"; userId: string; patch: Partial<User> }
  | { type: "ADJUST_BALANCE"; userId: string; delta: number }
  | { type: "ADD_TRANSACTION"; transaction: Transaction }
  | { type: "ADD_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "REMOVE_PAYMENT_METHOD"; methodId: string }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ"; userId: string }
  | { type: "TOGGLE_WISHLIST"; listingId: string; userId: string }
  | { type: "ADD_CATEGORY"; category: CategoryRecord }
  | { type: "UPDATE_CATEGORY"; categoryId: string; patch: Partial<CategoryRecord> }
  | { type: "DELETE_CATEGORY"; categoryId: string }
  | { type: "SET_FLAG_STATUS"; flagId: string; status: Flag["status"] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_SESSION":
      return { ...state, role: action.role, currentUserId: action.userId };
    case "LOG_OUT":
      return { ...state, role: null, currentUserId: null };
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, { id: `toast-${Date.now()}-${Math.random()}`, message: action.message }],
      };
    case "DISMISS_TOAST":
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case "SET_CHECKOUT_CONTEXT":
      return { ...state, checkoutContext: { listingId: action.listingId, quantity: action.quantity } };
    case "CLEAR_CHECKOUT_CONTEXT":
      return { ...state, checkoutContext: null };
    case "PLACE_ORDER":
      return { ...state, orders: [action.order, ...state.orders] };
    case "SET_ORDER_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: action.status, ...(action.extra ?? {}) } : o
        ),
      };
    case "CONFIRM_DELIVERY": {
      const order = state.orders.find((o) => o.id === action.orderId);
      if (!order) return state;
      const net = order.amount - order.commission;
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.orderId ? { ...o, status: "Completed", escrowHolder: "Seller paid" } : o
        ),
        balances: {
          ...state.balances,
          [order.sellerId]: (state.balances[order.sellerId] ?? 0) + net,
        },
      };
    }
    case "ADD_REVIEW":
      return { ...state, reviews: [action.review, ...state.reviews] };
    case "ADD_SELLER_REPLY":
      return {
        ...state,
        reviews: state.reviews.map((r) => (r.id === action.reviewId ? { ...r, sellerReply: action.reply } : r)),
      };
    case "ADD_LISTING":
      return { ...state, listings: [action.listing, ...state.listings] };
    case "UPDATE_LISTING":
      return {
        ...state,
        listings: state.listings.map((l) => (l.id === action.listingId ? { ...l, ...action.patch } : l)),
      };
    case "DELETE_LISTING":
      return { ...state, listings: state.listings.filter((l) => l.id !== action.listingId) };
    case "ADD_MESSAGE":
      return {
        ...state,
        messages: [...state.messages, action.message],
        conversations: state.conversations.map((c) =>
          c.id === action.message.conversationId ? { ...c, lastMessageAt: action.message.timestamp } : c
        ),
      };
    case "START_CONVERSATION":
      return { ...state, conversations: [action.conversation, ...state.conversations] };
    case "CLAIM_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, claimedBy: action.agentId } : c
        ),
      };
    case "RESOLVE_CONVERSATION":
      return {
        ...state,
        conversations: state.conversations.map((c) =>
          c.id === action.conversationId ? { ...c, resolved: true } : c
        ),
      };
    case "SET_COMPOSER_DRAFT":
      return { ...state, composerDrafts: { ...state.composerDrafts, [action.conversationId]: action.text } };
    case "OPEN_DISPUTE":
      return { ...state, disputes: [action.dispute, ...state.disputes] };
    case "RESPOND_DISPUTE":
      return {
        ...state,
        disputes: state.disputes.map((d) =>
          d.id === action.disputeId ? { ...d, sellerResponse: action.response } : d
        ),
      };
    case "ADD_DISPUTE_NOTE":
      return {
        ...state,
        disputes: state.disputes.map((d) =>
          d.id === action.disputeId
            ? {
                ...d,
                internalNotes: [
                  ...d.internalNotes,
                  { text: action.note, date: new Date().toISOString(), author: action.author },
                ],
              }
            : d
        ),
      };
    case "RESOLVE_DISPUTE": {
      const dispute = state.disputes.find((d) => d.id === action.disputeId);
      if (!dispute) return state;
      const order = state.orders.find((o) => o.id === dispute.orderId);
      return {
        ...state,
        disputes: state.disputes.map((d) =>
          d.id === action.disputeId ? { ...d, status: "Resolved", resolution: action.resolution } : d
        ),
        orders: state.orders.map((o) =>
          o.id === dispute.orderId
            ? {
                ...o,
                status: action.resolution === "Refunded" ? "Canceled" : "Completed",
                escrowHolder: action.resolution === "Refunded" ? "Buyer refunded" : "Seller paid",
              }
            : o
        ),
        balances:
          action.resolution === "Released" && order
            ? {
                ...state.balances,
                [order.sellerId]: (state.balances[order.sellerId] ?? 0) + (order.amount - order.commission),
              }
            : state.balances,
      };
    }
    case "ESCALATE_DISPUTE":
      return {
        ...state,
        disputes: state.disputes.map((d) => (d.id === action.disputeId ? { ...d, status: "Under review" } : d)),
      };
    case "SET_VERIFICATION":
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.userId ? { ...u, verificationStatus: action.status } : u)),
      };
    case "SET_ACCOUNT_STATUS":
      return {
        ...state,
        users: state.users.map((u) => (u.id === action.userId ? { ...u, accountStatus: action.status } : u)),
      };
    case "UPDATE_USER":
      return { ...state, users: state.users.map((u) => (u.id === action.userId ? { ...u, ...action.patch } : u)) };
    case "ADJUST_BALANCE":
      return { ...state, balances: { ...state.balances, [action.userId]: (state.balances[action.userId] ?? 0) + action.delta } };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [action.transaction, ...state.transactions] };
    case "ADD_PAYMENT_METHOD":
      return { ...state, paymentMethods: [...state.paymentMethods, action.method] };
    case "REMOVE_PAYMENT_METHOD":
      return { ...state, paymentMethods: state.paymentMethods.filter((m) => m.id !== action.methodId) };
    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.id ? { ...n, read: true } : n)),
      };
    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.userId === action.userId ? { ...n, read: true } : n)),
      };
    case "TOGGLE_WISHLIST": {
      const current = state.wishlists[action.userId] ?? [];
      const isWishlisted = current.includes(action.listingId);
      const nextList = isWishlisted ? current.filter((id) => id !== action.listingId) : [...current, action.listingId];
      const delta = isWishlisted ? -1 : 1;
      return {
        ...state,
        wishlists: { ...state.wishlists, [action.userId]: nextList },
        listings: state.listings.map((l) =>
          l.id === action.listingId ? { ...l, wishlistedCount: Math.max(0, l.wishlistedCount + delta) } : l
        ),
      };
    }
    case "ADD_CATEGORY":
      return { ...state, categories: [...state.categories, action.category] };
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.categoryId ? { ...c, ...action.patch } : c)),
      };
    case "DELETE_CATEGORY":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.categoryId) };
    case "SET_FLAG_STATUS":
      return { ...state, flags: state.flags.map((f) => (f.id === action.flagId ? { ...f, status: action.status } : f)) };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  toast: (message: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const toast = useCallback((message: string) => dispatch({ type: "ADD_TOAST", message }), []);
  const value = useMemo(() => ({ state, dispatch, toast }), [state, toast]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// ----- convenience selector hooks -----

export function useCurrentUser(): User | null {
  const { state } = useApp();
  return state.users.find((u) => u.id === state.currentUserId) ?? null;
}

export function useUserById(id: string | undefined | null): User | undefined {
  const { state } = useApp();
  return state.users.find((u) => u.id === id);
}

export function useListingById(id: string | undefined | null): Listing | undefined {
  const { state } = useApp();
  return state.listings.find((l) => l.id === id);
}

export function useOrderById(id: string | undefined | null): Order | undefined {
  const { state } = useApp();
  return state.orders.find((o) => o.id === id);
}

export function useDisputeByOrderId(orderId: string | undefined | null): Dispute | undefined {
  const { state } = useApp();
  return state.disputes.find((d) => d.orderId === orderId);
}

export function useUnreadNotificationCount(userId: string | undefined | null): number {
  const { state } = useApp();
  return state.notifications.filter((n) => n.userId === userId && !n.read).length;
}

export function useConversationMessages(conversationId: string | undefined | null): Message[] {
  const { state } = useApp();
  return state.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function useBalance(userId: string | undefined | null): number {
  const { state } = useApp();
  if (!userId) return 0;
  return state.balances[userId] ?? 0;
}

export function useIsWishlisted(userId: string | undefined | null, listingId: string): boolean {
  const { state } = useApp();
  if (!userId) return false;
  return (state.wishlists[userId] ?? []).includes(listingId);
}

export { CURRENT_IDS };
export type { Action as AppAction, AppState };
