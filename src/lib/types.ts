export type Role = "buyer" | "seller" | "admin" | "support";

export type Category = "Accounts" | "Currency" | "Boosting" | "Items" | "Top-up";

export type VerificationStatus = "Unverified" | "Pending" | "Verified" | "Rejected";
export type AccountStatus = "Active" | "Banned";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  roles: ("Buyer" | "Seller" | "Admin" | "Support")[];
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  rating?: number;
  reviewCount?: number;
  joinDate: string;
  country: string;
  bio?: string;
  responseTime?: string;
  online?: boolean;
  totalOrdersAsBuyer?: number;
  totalSalesAsSeller?: number;
  totalSpent?: number;
  totalEarned?: number;
}

export type ListingStatus =
  | "Draft"
  | "Pending review"
  | "Active"
  | "Paused"
  | "Rejected"
  | "Removed"
  | "Sold out";

export interface Listing {
  id: string;
  title: string;
  category: Category;
  game: string;
  description: string;
  price: number;
  deliveryMethod: "Instant" | "Manual 1hr" | "Manual 24hr";
  status: ListingStatus;
  views: number;
  wishlistedCount: number;
  sellerId: string;
  imageUrls: string[];
  createdAt: string;
  moderationReason?: string;
  specs: Record<string, string>;
  currencyAmountAvailable?: number;
}

export type OrderStatus = "Pending" | "Delivered" | "Completed" | "Disputed" | "Canceled";

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  commission: number;
  quantity?: number;
  status: OrderStatus;
  placedDate: string;
  cancelReason?: string;
  deliveryNotes?: string;
  escrowHolder: "Platform escrow" | "Buyer refunded" | "Seller paid";
}

export interface Review {
  id: string;
  orderId: string;
  authorId: string;
  subjectId: string;
  rating: number;
  comment: string;
  sellerReply?: string;
  date: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  attachment?: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  relatedOrderId?: string;
  relatedListingId?: string;
  lastMessageAt: string;
  supportThread?: boolean;
  claimedBy?: string;
  resolved?: boolean;
}

export type DisputeReason = "Not delivered" | "Not as described" | "Other";
export type DisputeStatus = "Open" | "Under review" | "Resolved";
export type DisputeResolution = "Refunded" | "Released";

export interface Dispute {
  id: string;
  orderId: string;
  reason: DisputeReason;
  buyerDetails: string;
  sellerResponse?: string;
  internalNotes: { text: string; date: string; author: string }[];
  status: DisputeStatus;
  resolution?: DisputeResolution;
  openedDate: string;
}

export type TransactionType = "Purchase" | "Refund" | "Top-up" | "Payout";
export type TransactionStatus = "Completed" | "Processing" | "Failed";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  commission?: number;
  status: TransactionStatus;
  date: string;
  method?: string;
  description?: string;
}

export type FlagType =
  | "Multiple failed logins"
  | "Rapid listing creation"
  | "Spam messages"
  | "Price anomaly";
export type FlagSeverity = "Low" | "Medium" | "High";
export type FlagStatus = "New" | "Reviewed" | "Dismissed";

export interface Flag {
  id: string;
  userId: string;
  type: FlagType;
  severity: FlagSeverity;
  status: FlagStatus;
  detectedDate: string;
  detail: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  parentId?: string;
  commissionRate: number;
  active: boolean;
  listingCount: number;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  label: string;
  masked: string;
  isDefault: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: "order" | "message" | "promo";
  text: string;
  timestamp: string;
  read: boolean;
  linkOrderId?: string;
  linkConversationId?: string;
  linkCategory?: Category;
}
