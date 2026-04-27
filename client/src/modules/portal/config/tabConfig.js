import {
  LayoutDashboard,
  Users,
  Bot,
  BriefcaseBusiness,
  DollarSign,
  Settings,
  UserRound,
  ClipboardList,
  TrendingUp,
  CalendarCheck
} from "lucide-react";

import OverviewTab from "../tabs/OverviewTab";
import LeadsTab from "../tabs/LeadsTab";
import LeadBotTab from "../tabs/LeadBotTab";
import ProjectsTab from "../tabs/ProjectsTab";
import FinanceTab from "../tabs/FinanceTab";
import StaffTab from "../tabs/StaffTab";
import SettingsTab from "../tabs/SettingsTab";
import CommissionsTab from "../tabs/CommissionsTab";
import FollowUpsTab from "../tabs/FollowUpsTab";

export const tabConfig = {
  admin: [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      component: OverviewTab
    },
    {
      id: "leads",
      label: "Leads",
      icon: Users,
      component: LeadsTab
    },
    {
      id: "leadbot",
      label: "Lead Bot",
      icon: Bot,
      component: LeadBotTab
    },
    {
      id: "projects",
      label: "Projects",
      icon: BriefcaseBusiness,
      component: ProjectsTab
    },
    {
      id: "finance",
      label: "Finance",
      icon: DollarSign,
      component: FinanceTab
    },
    {
      id: "staff",
      label: "Staff",
      icon: UserRound,
      component: StaffTab
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      component: SettingsTab
    }
  ],

  staff: [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      component: OverviewTab
    },
    {
      id: "my-leads",
      label: "My Leads",
      icon: ClipboardList,
      component: LeadsTab
    },
    {
      id: "follow-ups",
      label: "Follow-Ups",
      icon: CalendarCheck,
      component: FollowUpsTab
    },
    {
      id: "leadbot",
      label: "Lead Bot",
      icon: Bot,
      component: LeadBotTab
    },
    {
      id: "commissions",
      label: "Commissions",
      icon: TrendingUp,
      component: CommissionsTab
    }
  ],

  customer: [
    {
      id: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      component: OverviewTab
    },
    {
      id: "projects",
      label: "Projects",
      icon: BriefcaseBusiness,
      component: ProjectsTab
    }
  ]
};