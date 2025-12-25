"use client";

import { ChartBarIcon, UserGroupIcon, DocumentTextIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

const stats = [
  {
    name: "Total Revenue",
    value: "$45,231.89",
    change: "+12.5%",
    changeType: "positive",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Active Customers",
    value: "1,234",
    change: "+8.2%",
    changeType: "positive",
    icon: UserGroupIcon,
  },
  {
    name: "Total Invoices",
    value: "567",
    change: "-2.1%",
    changeType: "negative",
    icon: DocumentTextIcon,
  },
  {
    name: "Conversion Rate",
    value: "24.57%",
    change: "+4.3%",
    changeType: "positive",
    icon: ChartBarIcon,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your business today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === "positive" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {[1, 2, 3, 4].map((item) => (
                <li key={item}>
                  <div className="relative pb-8">
                    <div className="relative flex items-start space-x-3">
                      <div className="relative">
                        <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center ring-8 ring-white shrink-0">
                          <DocumentTextIcon className="h-5 w-5 text-white" aria-hidden="true" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-gray-500">
                          <span className="font-medium text-gray-900">Invoice #{1000 + item}</span> created for Customer {item}
                        </div>
                        <div className="text-sm text-gray-500">
                          <span className="whitespace-nowrap">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
