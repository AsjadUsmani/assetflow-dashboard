import React from "react";

// User and Role Types - Cinema/Enterprise specific
export type UserRole =
  | "super_admin" // System-wide access
  | "ho_admin" // Head Office Admin - final approval authority
  | "regional_admin" // Regional Team - intermediate approvals
  | "location_hod" // Location HOD / Admin Head
  | "reporting_person" // Cinema/Location Manager - can initiate requests
  | "cinema_user"; // View-only access

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  locationId?: string;
  departmentId?: string;
  regionId?: string;
  avatar?: string;
  // Reporting hierarchy - critical for approval routing
  reportsToId?: string;
  approverIds?: string[]; // Chain of approvers
  // Approval permissions
  canApproveTransfers?: boolean;
  canApproveDisposals?: boolean;
  canApproveBuybacks?: boolean;
  approvalLimit?: number; // Value threshold for auto-routing
}

// Region for multi-location organizations
export interface Region {
  id: string;
  organizationId: string;
  name: string;
  approverId: string; // Regional approver
  locationIds: string[];
  createdAt: Date;
}

// Organization Hierarchy Types
export interface Organization {
  id: string;
  name: string;
  logo?: string;
  createdAt: Date;
}

export interface Location {
  id: string;
  organizationId: string;
  name: string;
  address: string;
  createdAt: Date;
}

export interface Department {
  id: string;
  locationId: string;
  name: string;
  reportingPersonId: string;
  hodId: string;
  createdAt: Date;
}

// Asset Types and Properties
export type PropertyType =
  | "text"
  | "number"
  | "date"
  | "dropdown"
  | "boolean"
  | "file";

export interface PropertyDefinition {
  id: string;
  name: string;
  type: PropertyType;
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: string[]; // For dropdown
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface AssetType {
  id: string;
  name: string;
  description: string;
  hasExpiry: boolean;
  isRechargeable: boolean;
  isOneTimeUse: boolean;
  isMovable: boolean;
  requiresAssignment: boolean;
  properties: PropertyDefinition[];
  createdAt: Date;
}

// Asset Categories per cinema/enterprise spec
export type AssetCategory =
  | "it" // IT Assets (Laptop, Desktop, Mac, POS)
  | "projection" // Cinema Projection (Screens, Projectors)
  | "consumables" // Mouse, Keyboard, Headphones, Hard Disk
  | "spares"; // Spares / Parts / Devices

// Legacy category mapping for backward compatibility
export type LegacyAssetCategory =
  | "physical"
  | "digital"
  | "consumable"
  | "rechargeable";

export type AssetStatus =
  | "available"
  | "assigned"
  | "in_maintenance"
  | "retired"
  | "lost";

export interface Asset {
  id: string;
  assetTypeId: string;
  assetType: AssetType;
  name: string;
  serialNumber?: string;
  category: AssetCategory;
  status: AssetStatus;
  organizationId: string;
  locationId: string;
  departmentId: string;
  assignedToId?: string;
  purchaseDate?: Date;
  expiryDate?: Date;
  warrantyEndDate?: Date;
  properties: Record<string, string | number | boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// Asset Movement
export interface AssetMovement {
  id: string;
  assetId: string;
  fromLocationId?: string;
  toLocationId?: string;
  fromDepartmentId?: string;
  toDepartmentId?: string;
  fromUserId?: string;
  toUserId?: string;
  reason: string;
  approvedById?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  completedAt?: Date;
}

// Request Types - All asset actions go through requests
export type AssetRequestType =
  | "create" // Create new asset
  | "assign" // Assign to user
  | "transfer" // Transfer between locations/departments
  | "dispose" // Dispose asset
  | "buyback" // Employee buyback
  | "maintenance" // Send for maintenance
  | "return"; // Return from assignment

export type RequestStatus =
  | "draft"
  | "pending"
  | "in_review"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

export type ApprovalLevel = "location" | "regional" | "ho";

// Asset Request - Core entity for request-based workflow
export interface AssetRequest {
  id: string;
  requestNumber: string; // e.g., REQ-2024-001
  type: AssetRequestType;
  status: RequestStatus;
  priority: "low" | "medium" | "high" | "urgent";

  // Asset details
  assetId?: string; // For existing assets
  assetDetails?: {
    name: string;
    category: AssetCategory;
    assetTypeId: string;
    serialNumber?: string;
    properties?: Record<string, unknown>;
  };

  // Transfer/Assignment details
  fromLocationId?: string;
  toLocationId?: string;
  fromDepartmentId?: string;
  toDepartmentId?: string;
  fromUserId?: string;
  toUserId?: string;

  // Request metadata
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  justification?: string;
  documents?: string[];

  // Approval tracking
  currentApprovalLevel: ApprovalLevel;
  approvalChain: ApprovalChainStep[];
  finalApprovedBy?: string;
  finalApprovedAt?: Date;

  // Completion
  completedAt?: Date;
  completedBy?: string;
  completionNotes?: string;

  // Acknowledgement (for transfers/assignments)
  requiresAcknowledgement: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

// Approval Chain Step
export interface ApprovalChainStep {
  level: ApprovalLevel;
  approverId: string;
  approverName: string;
  approverRole: UserRole;
  status: "pending" | "approved" | "rejected" | "skipped";
  actionAt?: Date;
  comments?: string;
  delegatedTo?: string;
}

// Approval Routing Rule - Configurable per organization
export interface ApprovalRoutingRule {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  isActive: boolean;

  // Conditions
  conditions: {
    requestTypes: AssetRequestType[];
    assetCategories?: AssetCategory[];
    assetTypes?: string[];
    minValue?: number;
    maxValue?: number;
    locations?: string[];
  };

  // Approval chain configuration
  approvalLevels: {
    level: ApprovalLevel;
    required: boolean;
    approverType: "role" | "user" | "hierarchy";
    approverRoles?: UserRole[];
    approverUserIds?: string[];
    autoApproveThreshold?: number;
  }[];

  // Settings
  allowParallelApproval: boolean;
  requireAllApprovers: boolean;
  escalationDays?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy workflow types for backward compatibility
export type WorkflowRequestType = "transfer" | "disposal" | "buyback";
export type WorkflowStage =
  | "cinema"
  | "regional"
  | "ho"
  | "completed"
  | "rejected";
export type WorkflowDecision = "transfer" | "dispose" | "buyback" | "reject";

export interface WorkflowRequest {
  id: string;
  assetId: string;
  requestType: WorkflowRequestType;
  currentStage: WorkflowStage;
  requestedBy: string;
  requestedAt: Date;
  reason: string;
  documents?: string[];
  serialNumbers?: string[];
  approvalHistory: ApprovalStep[];
  finalDecision?: WorkflowDecision;
  completedAt?: Date;
}

export interface ApprovalStep {
  stage: WorkflowStage;
  approvedBy?: string;
  approvedAt?: Date;
  status: "pending" | "approved" | "rejected";
  comments?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: "transfer" | "disposal" | "ownership_change" | "approval_required" | "acknowledgement";
  title: string;
  message: string;
  relatedAssetId?: string;
  relatedWorkflowId?: string;
  read: boolean;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  createdAt: Date;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  entityType: "asset" | "transfer" | "disposal" | "user" | "approval";
  entityId: string;
  action: string;
  performedBy: string;
  details: Record<string, unknown>;
  timestamp: Date;
  immutable: true;
}

// Dashboard Stats
export interface DashboardStats {
  totalAssets: number;
  assetsByCategory: {
    physical: number;
    digital: number;
    consumable: number;
    rechargeable: number;
  };
  assetsByStatus: Record<AssetStatus, number>;
  expiringAssets: number;
  recentMovements: AssetMovement[];
  assetsWithGaps: number;
}

// Navigation
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  roles?: UserRole[];
  children?: NavItem[];
}
