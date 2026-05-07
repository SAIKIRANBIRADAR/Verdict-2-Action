// ─── Types ────────────────────────────────────────────

export interface CaseItem {
  id: string;
  caseNumber: string;
  caseTitle: string;
  court: string;
  department: string;
  priority: "High" | "Medium" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  date: string;
  actionNeeded: "Immediate" | "Required" | "None";
  parties: string;
  directives: string[];
  appealRisk: "High" | "Medium" | "Low";
  appealRiskReason: string;
  timeline: TimelineStep[];
  actionPlan: ActionPlan;
  similarCases: SimilarCase[];
  highlightedText: HighlightedSegment[];
}

export interface TimelineStep {
  step: string;
  status: "completed" | "current" | "pending";
  date: string;
}

export interface ActionPlan {
  type: "Compliance" | "Appeal";
  department: string;
  deadline: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
}

export interface SimilarCase {
  caseNumber: string;
  description: string;
}

export interface HighlightedSegment {
  text: string;
  severity: "critical" | "important" | "informational" | "none";
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "urgent" | "important" | "info";
  time: string;
}

export interface AnalyticsStat {
  label: string;
  value: string;
  icon: string;
  change: string;
}

export interface ChartDataPoint {
  name: string;
  cases: number;
}

// ─── Mock Cases ───────────────────────────────────────

export const mockCases: CaseItem[] = [
  {
    id: "1",
    caseNumber: "WP(C) 2024/1087",
    caseTitle: "State of Karnataka vs. Central Pollution Control Board",
    court: "Supreme Court of India",
    department: "Environment & Forests",
    priority: "High",
    status: "In Progress",
    date: "2024-11-15",
    actionNeeded: "Immediate",
    parties: "State of Karnataka (Petitioner) vs. CPCB (Respondent)",
    directives: [
      "Respondent must submit compliance report within 30 days",
      "Suspend all industrial activity in Zone-4 until clearance",
      "Form a 5-member monitoring committee within 14 days",
      "Submit environmental impact assessment by December 2024",
    ],
    appealRisk: "High",
    appealRiskReason:
      "Adverse ruling against the department with strict compliance timelines and potential contempt proceedings if deadlines are missed.",
    timeline: [
      { step: "Judgment Received", status: "completed", date: "Nov 15, 2024" },
      { step: "Under Review", status: "completed", date: "Nov 18, 2024" },
      { step: "Action Approved", status: "current", date: "Nov 22, 2024" },
      { step: "In Execution", status: "pending", date: "—" },
      { step: "Completed", status: "pending", date: "—" },
    ],
    actionPlan: {
      type: "Compliance",
      department: "Environment & Forests",
      deadline: "December 15, 2024",
      priority: "High",
      reason:
        "Court directive requires compliance report within 30 days. Non-compliance may result in contempt proceedings.",
    },
    similarCases: [
      { caseNumber: "WP(C) 2022/4521", description: "Industrial pollution compliance in Gujarat" },
      { caseNumber: "SLP(C) 2023/891", description: "CPCB enforcement action in Tamil Nadu" },
    ],
    highlightedText: [
      { text: "The respondent department is hereby directed to submit a comprehensive compliance report within 30 days of this order.", severity: "critical" },
      { text: "All industrial activity in the designated Zone-4 area shall stand suspended until proper environmental clearance is obtained.", severity: "critical" },
      { text: "A monitoring committee comprising 5 members shall be constituted within 14 days to oversee implementation.", severity: "important" },
      { text: "The petitioner has demonstrated sufficient grounds for the court's intervention in this matter.", severity: "informational" },
      { text: "Costs of Rs. 50,000 to be borne by the respondent.", severity: "important" },
    ],
  },
  {
    id: "2",
    caseNumber: "CA 2024/3456",
    caseTitle: "Municipal Corporation vs. Residents' Welfare Association",
    court: "High Court of Delhi",
    department: "Urban Development",
    priority: "Medium",
    status: "Pending",
    date: "2024-11-10",
    actionNeeded: "Required",
    parties: "Municipal Corp. Delhi (Appellant) vs. RWA Green Park (Respondent)",
    directives: [
      "Complete road repair work in the affected area within 60 days",
      "Allocate budget for drainage system upgrade",
      "Submit progress report every 15 days",
    ],
    appealRisk: "Medium",
    appealRiskReason: "Moderate financial implications. Appeal may delay implementation but has reasonable grounds.",
    timeline: [
      { step: "Judgment Received", status: "completed", date: "Nov 10, 2024" },
      { step: "Under Review", status: "current", date: "Nov 14, 2024" },
      { step: "Action Approved", status: "pending", date: "—" },
      { step: "In Execution", status: "pending", date: "—" },
      { step: "Completed", status: "pending", date: "—" },
    ],
    actionPlan: {
      type: "Compliance",
      department: "Urban Development",
      deadline: "January 10, 2025",
      priority: "Medium",
      reason: "Road infrastructure repair ordered with 60-day deadline.",
    },
    similarCases: [
      { caseNumber: "WP(C) 2023/7812", description: "Municipal road repair order in Mumbai" },
    ],
    highlightedText: [
      { text: "Road repair work must be completed within 60 days.", severity: "important" },
      { text: "Budget allocation for drainage is mandatory.", severity: "important" },
      { text: "Progress reports to be submitted fortnightly.", severity: "informational" },
    ],
  },
  {
    id: "3",
    caseNumber: "SLP(C) 2024/7821",
    caseTitle: "Department of Education vs. Teachers' Union",
    court: "Supreme Court of India",
    department: "Education",
    priority: "High",
    status: "Completed",
    date: "2024-10-28",
    actionNeeded: "None",
    parties: "Dept. of Education (Petitioner) vs. All India Teachers' Federation (Respondent)",
    directives: [
      "Reinstate terminated teachers within 15 days",
      "Pay salary arrears for suspended period",
      "Constitute grievance redressal committee",
    ],
    appealRisk: "Low",
    appealRiskReason: "Favorable ruling with clear compliance path. Low risk of escalation.",
    timeline: [
      { step: "Judgment Received", status: "completed", date: "Oct 28, 2024" },
      { step: "Under Review", status: "completed", date: "Oct 30, 2024" },
      { step: "Action Approved", status: "completed", date: "Nov 2, 2024" },
      { step: "In Execution", status: "completed", date: "Nov 8, 2024" },
      { step: "Completed", status: "completed", date: "Nov 12, 2024" },
    ],
    actionPlan: {
      type: "Compliance",
      department: "Education",
      deadline: "November 12, 2024",
      priority: "High",
      reason: "Court ordered reinstatement with salary arrears. Completed successfully.",
    },
    similarCases: [
      { caseNumber: "WP(C) 2021/3344", description: "Teacher reinstatement in Rajasthan" },
      { caseNumber: "CA 2022/1190", description: "Education department compliance in Kerala" },
    ],
    highlightedText: [
      { text: "All terminated teachers shall be reinstated within 15 days.", severity: "critical" },
      { text: "Salary arrears must be paid in full.", severity: "important" },
    ],
  },
  {
    id: "4",
    caseNumber: "WP(C) 2024/5543",
    caseTitle: "NGO for Public Health vs. State Health Department",
    court: "High Court of Karnataka",
    department: "Health & Family Welfare",
    priority: "High",
    status: "In Progress",
    date: "2024-11-05",
    actionNeeded: "Immediate",
    parties: "Public Health Foundation (Petitioner) vs. State Health Dept. (Respondent)",
    directives: [
      "Upgrade primary health centers in rural areas within 90 days",
      "Recruit 200 additional healthcare workers",
      "Submit quarterly compliance reports",
    ],
    appealRisk: "Medium",
    appealRiskReason: "Significant budget requirement. Department may seek extension of timelines.",
    timeline: [
      { step: "Judgment Received", status: "completed", date: "Nov 5, 2024" },
      { step: "Under Review", status: "completed", date: "Nov 8, 2024" },
      { step: "Action Approved", status: "current", date: "Nov 15, 2024" },
      { step: "In Execution", status: "pending", date: "—" },
      { step: "Completed", status: "pending", date: "—" },
    ],
    actionPlan: {
      type: "Compliance",
      department: "Health & Family Welfare",
      deadline: "February 3, 2025",
      priority: "High",
      reason: "Healthcare infrastructure upgrade with 90-day compliance window.",
    },
    similarCases: [
      { caseNumber: "PIL 2023/567", description: "Rural healthcare access in Madhya Pradesh" },
    ],
    highlightedText: [
      { text: "Primary health centers must be upgraded within 90 days.", severity: "critical" },
      { text: "200 healthcare workers to be recruited.", severity: "important" },
    ],
  },
  {
    id: "5",
    caseNumber: "CA 2024/2210",
    caseTitle: "Transport Workers' Union vs. State Transport Authority",
    court: "High Court of Maharashtra",
    department: "Transport",
    priority: "Low",
    status: "Pending",
    date: "2024-11-01",
    actionNeeded: "Required",
    parties: "Transport Workers' Union (Appellant) vs. State Transport Authority (Respondent)",
    directives: [
      "Review and revise safety protocols for public buses",
      "Install GPS tracking in all state transport vehicles within 6 months",
    ],
    appealRisk: "Low",
    appealRiskReason: "Low financial impact. Compliance is straightforward.",
    timeline: [
      { step: "Judgment Received", status: "completed", date: "Nov 1, 2024" },
      { step: "Under Review", status: "current", date: "Nov 5, 2024" },
      { step: "Action Approved", status: "pending", date: "—" },
      { step: "In Execution", status: "pending", date: "—" },
      { step: "Completed", status: "pending", date: "—" },
    ],
    actionPlan: {
      type: "Compliance",
      department: "Transport",
      deadline: "May 1, 2025",
      priority: "Low",
      reason: "Safety protocol review and GPS installation with 6-month timeline.",
    },
    similarCases: [
      { caseNumber: "WP 2022/8890", description: "Bus safety compliance in Uttar Pradesh" },
    ],
    highlightedText: [
      { text: "Safety protocols must be revised.", severity: "important" },
      { text: "GPS tracking mandatory in all vehicles.", severity: "informational" },
    ],
  },
  {
    id: "6",
    caseNumber: "WP(C) 2024/6678",
    caseTitle: "Revenue Department vs. Land Acquisition Tribunal",
    court: "Supreme Court of India",
    department: "Revenue & Land",
    priority: "Medium",
    status: "In Progress",
    date: "2024-10-20",
    actionNeeded: "Required",
    parties: "Revenue Dept. (Petitioner) vs. Land Acquisition Tribunal (Respondent)",
    directives: [
      "Disburse compensation to affected landowners within 45 days",
      "Halt further acquisition until environmental clearance",
      "Submit revised land survey report",
    ],
    appealRisk: "High",
    appealRiskReason: "Large compensation amounts involved. Multiple stakeholders affected.",
    timeline: [
      { step: "Judgment Received", status: "completed", date: "Oct 20, 2024" },
      { step: "Under Review", status: "completed", date: "Oct 25, 2024" },
      { step: "Action Approved", status: "completed", date: "Nov 1, 2024" },
      { step: "In Execution", status: "current", date: "Nov 10, 2024" },
      { step: "Completed", status: "pending", date: "—" },
    ],
    actionPlan: {
      type: "Appeal",
      department: "Revenue & Land",
      deadline: "December 4, 2024",
      priority: "Medium",
      reason: "Department considering appeal due to high compensation quantum.",
    },
    similarCases: [
      { caseNumber: "CA 2021/4456", description: "Land compensation dispute in Andhra Pradesh" },
      { caseNumber: "SLP 2023/2234", description: "Acquisition dispute in Telangana" },
    ],
    highlightedText: [
      { text: "Compensation must be disbursed within 45 days.", severity: "critical" },
      { text: "Further acquisition is stayed.", severity: "important" },
    ],
  },
  {
    id: "7",
    caseNumber: "PIL 2024/0098",
    caseTitle: "Citizens Forum vs. Water Resources Department",
    court: "High Court of Tamil Nadu",
    department: "Water Resources",
    priority: "High",
    status: "Pending",
    date: "2024-11-18",
    actionNeeded: "Immediate",
    parties: "Citizens Forum for Clean Water (Petitioner) vs. Water Resources Dept. (Respondent)",
    directives: [
      "Stop untreated sewage discharge into River Adyar immediately",
      "Set up water treatment plants within 120 days",
      "Monthly water quality reports to be filed",
    ],
    appealRisk: "Low",
    appealRiskReason: "Public interest litigation with strong public support. Appeal would be unfavorable.",
    timeline: [
      { step: "Judgment Received", status: "completed", date: "Nov 18, 2024" },
      { step: "Under Review", status: "current", date: "Nov 20, 2024" },
      { step: "Action Approved", status: "pending", date: "—" },
      { step: "In Execution", status: "pending", date: "—" },
      { step: "Completed", status: "pending", date: "—" },
    ],
    actionPlan: {
      type: "Compliance",
      department: "Water Resources",
      deadline: "March 18, 2025",
      priority: "High",
      reason: "Immediate cessation of sewage discharge ordered with infrastructure timeline.",
    },
    similarCases: [
      { caseNumber: "PIL 2020/1234", description: "Yamuna river pollution case in Delhi" },
    ],
    highlightedText: [
      { text: "Untreated sewage discharge must stop immediately.", severity: "critical" },
      { text: "Treatment plants to be operational within 120 days.", severity: "important" },
    ],
  },
];

// ─── Mock Notifications ──────────────────────────────

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    title: "Compliance Deadline in 3 Days",
    description: "WP(C) 2024/1087 — Submit compliance report to Supreme Court",
    type: "urgent",
    time: "2 hours ago",
  },
  {
    id: "n2",
    title: "Appeal Recommended",
    description: "WP(C) 2024/6678 — Legal team suggests filing appeal for land acquisition case",
    type: "important",
    time: "5 hours ago",
  },
  {
    id: "n3",
    title: "Action Pending — Health Dept.",
    description: "Healthcare worker recruitment process needs approval",
    type: "important",
    time: "1 day ago",
  },
  {
    id: "n4",
    title: "Case Completed Successfully",
    description: "SLP(C) 2024/7821 — Teacher reinstatement order fully executed",
    type: "info",
    time: "2 days ago",
  },
  {
    id: "n5",
    title: "New Judgment Received",
    description: "PIL 2024/0098 — Water resources case requires immediate attention",
    type: "urgent",
    time: "3 days ago",
  },
];

// ─── Analytics Data ──────────────────────────────────

export const analyticsStats: AnalyticsStat[] = [
  { label: "Total Cases", value: "128", icon: "FileText", change: "+12 this month" },
  { label: "Urgent Cases", value: "23", icon: "AlertTriangle", change: "5 new this week" },
  { label: "Compliance Rate", value: "87%", icon: "CheckCircle", change: "+3% from last month" },
  { label: "Avg Response Time", value: "2.4 days", icon: "Clock", change: "-0.8 days improved" },
];

export const chartData: ChartDataPoint[] = [
  { name: "Mon", cases: 12 },
  { name: "Tue", cases: 18 },
  { name: "Wed", cases: 15 },
  { name: "Thu", cases: 22 },
  { name: "Fri", cases: 19 },
  { name: "Sat", cases: 8 },
  { name: "Sun", cases: 5 },
];
